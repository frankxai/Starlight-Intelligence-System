/**
 * Substrate Test Harness — SIP Conformance
 *
 * Validates that:
 *   - The substrate (this repo) satisfies SIP § Layer 1 file contract.
 *   - The /vertical-spawn and /alliance-forge command specs produce
 *     SIP-conformant scaffolds (validated against real fixtures).
 *   - Attestation blocks emitted from the substrate match SIP § Layer 2.
 *
 * This catches drift between command specs and the spec they enforce.
 * Uses Node's built-in test runner (node:test + node:assert), no deps.
 *
 * SECURITY NOTE (per /openclaw-audit CRITICAL 2):
 * This harness reads files under private/staging/ and private/examples/ as
 * fixtures. By contract, NO assertion in this file ever interpolates raw
 * fixture file content into error messages — only file paths, missing-field
 * names, and structural metadata. If you add an assertion below, audit it
 * against this rule before merge. Failure messages are visible in CI logs
 * and must never leak private fixture bodies.
 *
 * Recommended pattern: assert on `Object.keys(parsed)` or `missing.join(', ')`,
 * never on the raw file content. To assert that a specific string appears in
 * a fixture, use `content.includes(needle)` so the failure message names the
 * needle (which you already trust), not the haystack.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// NOTE: We intentionally do NOT `import { parseAttestation } from "../src/starlight-mcp.js"`.
// That module's bottom-of-file `main()` opens a stdin readline interface and starts
// the MCP server, which keeps the event loop alive and hangs the test process.
// Instead we inline a faithful copy of the parser logic from src/starlight-mcp.ts
// (lines 242-331). If you change the parser there, mirror the change here.

interface AttestationParsed {
  substrate_version: string | null;
  layers: string[];
  verticals: string[];
  canon: string[];
  nodes: string[];
  generated: string | null;
}

function clean(s: string): string {
  return s.replace(/^[-*]\s+/, "").replace(/^['"]|['"]$/g, "").trim();
}

function parseAttestation(content: string): { found: boolean; parsed: AttestationParsed; issues: string[] } {
  const issues: string[] = [];
  const parsed: AttestationParsed = { substrate_version: null, layers: [], verticals: [], canon: [], nodes: [], generated: null };

  const blocks: string[] = [];
  const fenceRe = /```[\s\S]*?```/g;
  let m: RegExpExecArray | null;
  while ((m = fenceRe.exec(content)) !== null) {
    if (/Built on SIP/i.test(m[0])) blocks.push(m[0].replace(/^```\w*\n?|\n?```$/g, ""));
  }
  const dashRe = /(^|\n)---\s*\n([\s\S]*?)\n---(\s|$)/g;
  while ((m = dashRe.exec(content)) !== null) {
    if (/Built on SIP/i.test(m[2])) blocks.push(m[2]);
  }
  if (!blocks.length && /Built on SIP/i.test(content)) blocks.push(content);
  if (!blocks.length) return { found: false, parsed, issues: ["No 'Built on SIP' attestation block detected"] };

  const block = blocks[0];
  let mode: "verticals" | "canon" | "nodes" | null = null;
  for (const raw of block.split("\n")) {
    const line = raw.trim();
    if (!line) { mode = null; continue; }
    const sub = line.match(/Substrate\s*:\s*(\S+)\s+v?([\d.]+\S*)/i);
    if (sub) { parsed.substrate_version = sub[2]; mode = null; continue; }
    const layers = line.match(/Layers(?:\s+used)?\s*:\s*\[?(.*?)\]?\s*$/i);
    if (layers && /^Layers/i.test(line)) {
      parsed.layers = layers[1].split(",").map(s => clean(s)).filter(Boolean);
      mode = null; continue;
    }
    if (/^[-*]?\s*Verticals\s*:/i.test(line)) {
      const inline = line.match(/Verticals\s*:\s*\[(.*?)\]/i);
      if (inline) parsed.verticals = inline[1].split(",").map(s => clean(s)).filter(Boolean);
      else mode = "verticals";
      continue;
    }
    if (/^[-*]?\s*Canon\s*:/i.test(line)) {
      const inline = line.match(/Canon\s*:\s*\[(.*?)\]/i);
      if (inline) {
        const v = clean(inline[1]);
        parsed.canon = v.toLowerCase() === "none" ? [] : v.split(",").map(s => clean(s)).filter(Boolean);
      } else mode = "canon";
      continue;
    }
    if (/^[-*]?\s*Nodes(?:\s*\(.*\))?\s*:/i.test(line)) {
      const inline = line.match(/Nodes(?:\s*\(.*\))?\s*:\s*\[(.*?)\]/i);
      if (inline) parsed.nodes = inline[1].split(",").map(s => clean(s)).filter(Boolean);
      else mode = "nodes";
      continue;
    }
    const gen = line.match(/Generated\s*:\s*(.+)$/i);
    if (gen) { parsed.generated = clean(gen[1]); mode = null; continue; }
    if (mode && /^[-*]\s+/.test(line)) {
      const value = clean(line);
      if (mode === "verticals") parsed.verticals.push(value);
      else if (mode === "canon") parsed.canon.push(value);
      else if (mode === "nodes") parsed.nodes.push(value);
    }
  }

  if (!parsed.substrate_version) issues.push("Missing or unparseable Substrate version");
  if (!parsed.verticals.length) issues.push("Missing Verticals list");
  if (!parsed.generated) issues.push("Missing Generated timestamp");
  return { found: true, parsed, issues };
}

// ── Paths ───────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");
const COMMANDS_DIR = join(REPO_ROOT, ".claude", "commands");
const VERTICAL_FIXTURE = join(REPO_ROOT, "private", "staging", "vibe-os");
const ALLIANCE_FIXTURE = join(REPO_ROOT, "private", "examples", "trinity-alliance");
const ATTESTATIONS_FILE = join(REPO_ROOT, "ATTESTATIONS.md");

// ── Helpers ─────────────────────────────────────────────────

function isFile(p: string): boolean {
  return existsSync(p) && statSync(p).isFile();
}

function isDir(p: string): boolean {
  return existsSync(p) && statSync(p).isDirectory();
}

function hasYamlFrontmatter(content: string, requiredKeys: string[]): { ok: boolean; missing: string[] } {
  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!fmMatch) return { ok: false, missing: requiredKeys };
  const fm = fmMatch[1];
  const missing = requiredKeys.filter(k => !new RegExp(`^${k}\\s*:`, "m").test(fm));
  return { ok: missing.length === 0, missing };
}

// Canonical voice slots per /alliance-forge step 5
const CANONICAL_VOICES = ["architect", "sovereign-creator", "protocol-defender", "implementer", "overseer"];

// Required commands per /vertical-spawn + /alliance-forge + SIP § Layer 4 reference
const REQUIRED_COMMANDS = [
  "sip-attest",
  "alliance-forge",
  "alliance-reflect",
  "alliance-decide",
  "vertical-spawn",
  "luminor-board",
  "sovereign-signal",
  "openclaw-audit",
  "wealth-dpi",
];

// ── Tests ───────────────────────────────────────────────────

describe("substrate file contract conformance (SIP § Layer 1)", () => {
  const REQUIRED = ["SKILL.md", "AGENTS.md", "MEMORY.md", "STACK.md"];
  const RECOMMENDED = ["CANON.md", "SOUL.md", "VOICES.md"];

  for (const file of REQUIRED) {
    it(`required: ${file} present at substrate root`, () => {
      const path = join(REPO_ROOT, file);
      assert.ok(isFile(path), `File contract gap: ${file} missing — add per SIP § Layer 1 (required).`);
    });
  }

  for (const file of RECOMMENDED) {
    it(`recommended: ${file} present at substrate root`, () => {
      const path = join(REPO_ROOT, file);
      assert.ok(isFile(path), `File contract gap: ${file} missing — add per SIP § Layer 1 (optional but recommended).`);
    });
  }
});

describe("substrate has .claude/commands directory with required commands", () => {
  it("commands directory exists at .claude/commands/ root", () => {
    assert.ok(isDir(COMMANDS_DIR), `Commands directory missing at ${COMMANDS_DIR} — required by SIP § Layer 4 convention.`);
  });

  it("contains at least 9 commands", () => {
    const files = readdirSync(COMMANDS_DIR).filter(f => f.endsWith(".md"));
    assert.ok(files.length >= 9, `Expected ≥9 commands at .claude/commands/, got ${files.length}.`);
  });

  for (const cmd of REQUIRED_COMMANDS) {
    it(`includes /${cmd} command`, () => {
      const path = join(COMMANDS_DIR, `${cmd}.md`);
      assert.ok(isFile(path), `Missing required command: .claude/commands/${cmd}.md — declared in SIP reference suite.`);
    });
  }
});

describe("vertical scaffold conformance — Vibe OS (per /vertical-spawn step 3)", () => {
  if (!isDir(VERTICAL_FIXTURE)) {
    it("skipped — private/staging/vibe-os/ not present (fresh clone)", () => {
      assert.ok(true);
    });
    return;
  }

  const HARD_REQUIRED = ["SIS-instance.md", "SKILL.md", "AGENTS.md", "MEMORY.md", "README.md"];
  for (const file of HARD_REQUIRED) {
    it(`hard requirement: ${file} present`, () => {
      const path = join(VERTICAL_FIXTURE, file);
      assert.ok(isFile(path), `Vertical scaffold gap: ${file} missing in vibe-os — /vertical-spawn step 3 mandates this file.`);
    });
  }

  it(".claude/commands/ has at least one vertical-scoped command (per SIP § Layer 4)", () => {
    const cmdDir = join(VERTICAL_FIXTURE, ".claude", "commands");
    assert.ok(isDir(cmdDir), `Vertical scaffold gap: .claude/commands/ missing in vibe-os — /vertical-spawn step 8 mandates ≥1 vertical-scoped command.`);
    const cmds = readdirSync(cmdDir).filter(f => f.endsWith(".md"));
    assert.ok(cmds.length >= 1, `Vertical scaffold gap: no commands in .claude/commands/ — /vertical-spawn step 8 mandates ≥1.`);
  });

  it("SKILL.md has YAML frontmatter with name + description", () => {
    const content = readFileSync(join(VERTICAL_FIXTURE, "SKILL.md"), "utf-8");
    const { ok, missing } = hasYamlFrontmatter(content, ["name", "description"]);
    assert.ok(ok, `Vibe OS SKILL.md frontmatter incomplete — missing: ${missing.join(", ")}.`);
  });

  it("CANON.md present (optional per SIP, but Vibe OS imports Hz canon)", () => {
    assert.ok(isFile(join(VERTICAL_FIXTURE, "CANON.md")), "CANON.md missing in vibe-os — declared canon dependency in SKILL.md.");
  });

  it("STACK.md present (optional per SIP, but Vibe OS overrides parent stack)", () => {
    assert.ok(isFile(join(VERTICAL_FIXTURE, "STACK.md")), "STACK.md missing in vibe-os.");
  });
});

describe("alliance scaffold conformance — Trinity (per /alliance-forge step 3)", () => {
  if (!isDir(ALLIANCE_FIXTURE)) {
    it("skipped — private/examples/trinity-alliance/ not present (fresh clone)", () => {
      assert.ok(true);
    });
    return;
  }

  const HARD_REQUIRED = ["README.md", "SKILL.md", "AGENTS.md", "MEMORY.md"];
  for (const file of HARD_REQUIRED) {
    it(`hard requirement: ${file} present`, () => {
      const path = join(ALLIANCE_FIXTURE, file);
      assert.ok(isFile(path), `Alliance scaffold gap: ${file} missing in trinity-alliance — /alliance-forge step 3 mandates this file.`);
    });
  }

  it("SKILL.md has YAML frontmatter with name + description", () => {
    const content = readFileSync(join(ALLIANCE_FIXTURE, "SKILL.md"), "utf-8");
    const { ok, missing } = hasYamlFrontmatter(content, ["name", "description"]);
    assert.ok(ok, `Trinity SKILL.md frontmatter incomplete — missing: ${missing.join(", ")}.`);
  });

  it("AGENTS.md declares all 5 canonical voice slots (or marks unfilled per /alliance-forge step 5)", () => {
    const content = readFileSync(join(ALLIANCE_FIXTURE, "AGENTS.md"), "utf-8").toLowerCase();
    const missing = CANONICAL_VOICES.filter(v => !content.includes(v));
    assert.equal(missing.length, 0, `Trinity AGENTS.md missing canonical voice declarations: ${missing.join(", ")} — /alliance-forge step 5 requires all 5 voice slots (filled or explicitly marked unfilled).`);
  });
});

// ── Declared-load extraction (per SKILL.md invariant 6) ────────

interface DeclaredLoad {
  path: string;        // the path as written
  line: number;        // 1-based line number in the source file
  conditional: boolean; // soft load (if present / if exists / if available)
}

/**
 * Extract declared file loads from a command body.
 *
 * The canonical declaration shape (per SKILL.md invariant 6):
 *   Load `X`, `Y`, `Z`, and if present `W` ...
 *
 * Recognized declaration verbs (line must start with one of these):
 *   Load / Loads / Reads / Composes / Imports
 *
 * Each backtick-wrapped path on the matched declaration line(s) is
 * collected. Conditionality is detected per-path by scanning the ~80
 * characters preceding the path on the same line for hedging clauses:
 *   "if present" / "if it exists" / "if available" / "if they exist" /
 *   "if the file is not yet present" / "if it is" / "if exists" /
 *   "if any" / "(if "
 * If the surrounding clause hedges, the path is marked conditional
 * and exempted from the disk-existence assertion.
 *
 * Backtick spans that are not file-like (no `/`, no `.md`/`.json`/`.ts`
 * extension, and contain no characters that look like paths) are dropped
 * — these are typically command names like `arcanea-mcp` or section
 * references like `Layer 5 sovereignty clause`.
 */
function extractDeclaredLoads(body: string): DeclaredLoad[] {
  const declarationVerb = /^\s*(Load|Loads|Reads|Composes|Imports)\b/i;
  // Conditional hedges that exempt a load from disk-existence assertion.
  // Includes "if X" forms, "any prior", "any X if any", "(if " parentheticals,
  // and "exists at" / "exists in" lookahead phrasing.
  const conditionalHedge = /\b(if\s+present|if\s+it\s+exists?|if\s+exists?|if\s+available|if\s+they\s+exist|if\s+the\s+file\s+is\s+not\s+yet\s+present|if\s+it\s+is|if\s+any|if\s+a\s+\w+|exists?\s+at|exists?\s+in|exists?\s+for|any\s+prior|and\s+prior|and\s+any|prior\s+\w+|\(if\s+)/i;
  const out: DeclaredLoad[] = [];
  const lines = body.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!declarationVerb.test(line)) continue;
    // Walk every backtick-wrapped span on the line.
    const tickRe = /`([^`\n]+)`/g;
    let m: RegExpExecArray | null;
    while ((m = tickRe.exec(line)) !== null) {
      const span = m[1];
      // File-like heuristic: must contain a `/` or `\` OR end with a known extension.
      const fileLike = /[\/\\]/.test(span) || /\.(md|json|ts|js|yml|yaml|txt|html|csv|toml)$/i.test(span);
      if (!fileLike) continue;
      // Detect conditionality: scan preceding 120 chars on this line for a hedge clause.
      // 120 (not 80) catches hedges further upstream in the same compound sentence.
      const before = line.slice(Math.max(0, m.index - 120), m.index);
      const conditional = conditionalHedge.test(before);
      out.push({ path: span, line: i + 1, conditional });
    }
  }
  return out;
}

/**
 * Decide whether a declared path should be asserted to exist on disk.
 * Returns null if the path is exempted (placeholder, external, conditional, glob);
 * otherwise returns { resolved, isDir } — the resolved absolute path and whether
 * the assertion should be a directory existence check rather than a file check.
 */
function resolveAssertablePath(load: DeclaredLoad): { resolved: string; isDir: boolean } | null {
  if (load.conditional) return null; // soft load — by-design optional
  const p = load.path;
  // Placeholder substitution (template paths) — literal angle brackets in path.
  if (/<[^>]+>/.test(p)) return null;
  // Glob patterns — wildcards mark scan targets, not loads.
  if (/[*?]/.test(p)) return null;
  // External absolute paths (other sovereign repos).
  if (/^[A-Za-z]:[\\/]/.test(p)) return null; // Windows drive
  if (p.startsWith("/") && !p.startsWith("/c/") && !p.includes(".md")) {
    // bare unix-style absolute paths that aren't repo-relative — skip
    return null;
  }
  // Trailing slash → directory assertion. Otherwise file.
  const isDirPath = p.endsWith("/") || p.endsWith("\\");
  const cleaned = p.replace(/\\/g, "/").replace(/\/$/, "");
  return { resolved: join(REPO_ROOT, cleaned), isDir: isDirPath };
}

describe("Substrate rule — declared file loads exist on disk (SKILL.md invariant 6)", () => {
  // The canonical command surface lives at .claude/commands/. This rule
  // also walks the universal vertical template's .claude/commands/, since
  // the v7.5 Luminor Board flagged that directory as the third repeat of
  // the "declared-load file missing" pattern.
  const COMMAND_DIRS = [
    COMMANDS_DIR,
    join(REPO_ROOT, "verticals", "_template", ".claude", "commands"),
  ];

  // Per-command coverage counters reported in test output for traceability.
  const coverage: Array<{ cmd: string; declared: number; asserted: number; conditional: number; placeholder: number }> = [];
  let totalAssertions = 0;
  const failures: Array<{ cmd: string; path: string; line: number }> = [];

  for (const dir of COMMAND_DIRS) {
    if (!isDir(dir)) continue;
    const files = readdirSync(dir).filter(f => f.endsWith(".md"));
    for (const file of files) {
      const cmdPath = join(dir, file);
      const cmdRel = cmdPath.slice(REPO_ROOT.length + 1).replace(/\\/g, "/");
      const body = readFileSync(cmdPath, "utf-8");
      const loads = extractDeclaredLoads(body);
      let asserted = 0;
      let conditional = 0;
      let placeholder = 0;
      for (const load of loads) {
        if (load.conditional) { conditional++; continue; }
        const resolution = resolveAssertablePath(load);
        if (!resolution) { placeholder++; continue; }
        asserted++;
        totalAssertions++;
        // The assertion: per-path exists-on-disk check, surfaced as its own `it` test
        // so failures report which command + which path + which line. NEVER interpolate
        // body content; only the declared path string (which the command author wrote).
        it(`${cmdRel} → declared load \`${load.path}\` exists on disk`, () => {
          const { resolved, isDir: expectDir } = resolution;
          const ok = expectDir ? isDir(resolved) : isFile(resolved);
          if (!ok) {
            failures.push({ cmd: cmdRel, path: load.path, line: load.line });
            const kind = expectDir ? "directory" : "file";
            assert.fail(`Declared ${kind} load missing: ${cmdRel}:${load.line} declares \`${load.path}\` but the ${kind} does not exist at the resolved path. Either create the ${kind}, mark the load conditional ("if present"), or mark the path as a placeholder with angle brackets.`);
          }
        });
      }
      coverage.push({ cmd: cmdRel, declared: loads.length, asserted, conditional, placeholder });
    }
  }

  it(`coverage report — ${coverage.length} commands scanned, ${totalAssertions} disk-existence assertions emitted`, () => {
    // This is a no-op assertion — its purpose is to surface the coverage tally
    // in the test output, so a reader sees the rule landed and how many paths it covers.
    assert.ok(coverage.length > 0, "No commands scanned — .claude/commands/ should not be empty.");
    // Soft sanity: at least one assertion should have been emitted across the surface.
    assert.ok(totalAssertions > 0, "No declared loads found — extractor regex may have drifted from command body shapes.");
  });
});

describe("attestation block format validation (SIP § Layer 2)", () => {
  it("ATTESTATIONS.md exists and contains a parseable Built on SIP block", () => {
    assert.ok(isFile(ATTESTATIONS_FILE), "ATTESTATIONS.md missing at substrate root — substrate must self-attest per SIP § Layer 2.");
    const content = readFileSync(ATTESTATIONS_FILE, "utf-8");
    const { found, parsed, issues } = parseAttestation(content);
    assert.ok(found, `No 'Built on SIP' block found in ATTESTATIONS.md: ${issues.join("; ")}`);
    assert.ok(parsed.substrate_version, `Attestation invalid: substrate version not pinned — ${issues.join("; ")}`);
    assert.ok(parsed.verticals.length > 0, `Attestation invalid: layers/verticals list missing — ${issues.join("; ")}`);
    assert.ok(parsed.generated, `Attestation invalid: generated date missing — ${issues.join("; ")}`);
  });

  it("attestation block lists at least one layer used (per /sip-attest output format)", () => {
    const content = readFileSync(ATTESTATIONS_FILE, "utf-8");
    const { parsed } = parseAttestation(content);
    assert.ok(parsed.layers.length > 0, "Attestation block must enumerate substrate layers used per /sip-attest output format (line 46 of sip-attest.md).");
  });
});
