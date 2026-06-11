/**
 * v8.8 agentskills.io Conformance Harness
 *
 * Enforces the agentskills.io open standard (Anthropic, Dec 2025) across every
 * skill file in skills/**. The standard is supported by 32 tools (Claude Code
 * .claude/skills/, Codex .agents/skills/, OpenClaw ~/.openclaw/skills/, Hermes
 * ~/.hermes/) and governs portability across harnesses.
 *
 * Checks enforced:
 *   1. FRONTMATTER — every skill file must have YAML frontmatter (--- delimiters)
 *   2. NAME_PRESENT — `name:` field must be present in frontmatter
 *   3. NAME_FORMAT — must match [a-z0-9/-]+ (see note on slash convention below)
 *   4. NAME_LENGTH — max 64 chars
 *   5. DESC_PRESENT — `description:` field must be present in frontmatter
 *   6. DESC_LENGTH — max 1024 chars
 *
 * Body line count (≤500 recommended) is checked but does not produce test
 * failures — it's logged via the standalone validator script only.
 *
 * EXEMPT_AGENTSKILLS ledger (goal-state: empty):
 *   Each entry is a skill key → { rule, reason, unpark } triple. Add an entry
 *   ONLY when a genuine structural constraint prevents conformance, NOT to
 *   silence a test failure. The unpark trigger must be a falsifiable condition.
 *   Current entries: none. All previously-failing skills have been fixed.
 *
 * Directory-shape gap (documented, not tested here):
 *   The agentskills.io standard expects each skill as a directory containing
 *   SKILL.md. SIS uses a mixed layout — 28 directory-shape skills and 48 flat
 *   .md files. The flat-file shape is structural: flat paths are registered in
 *   skill-rules.json and cannot be changed in a conformance-only pass.
 *   Unpark trigger: refactor skill-rules.json loader to resolve directory-layout
 *   skills, migrate flat files to directories, then remove this note.
 *
 * Slash convention in `name:` field:
 *   The agentskills.io standard specifies names as "lowercase letters/numbers/
 *   hyphens only" (strict `[a-z0-9-]+`). SIS uses slash-namespaced names like
 *   `intelligence/strategic-reasoning` to carry the domain prefix as a routing
 *   signal registered in skill-rules.json. This is a recognized SIS convention
 *   deviation. This test accepts slashes as namespace separators (`[a-z0-9/-]+`)
 *   because changing all 63 slash-namespaced names would break the runtime
 *   routing and is out of scope for a conformance-only pass. The NAME_FORMAT
 *   check still rejects uppercase letters, spaces, underscores, and other
 *   non-standard characters.
 *   Unpark trigger: agentskills.io adopts a namespace separator standard OR
 *   SIS migrates name fields to flat form and updates skill-rules.json accordingly.
 *
 * SECURITY NOTE: per /openclaw-audit CRITICAL 2, NO assertion interpolates
 * raw skill file content into error messages. File paths and field names only.
 *
 * ---
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 * - Substrate: starlightintelligence.org/protocol
 * - Layers used: [file-contract, attestation, skill-registry]
 * - Generated: 2026-06-11
 * ---
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { repoRootFromTestFile, walkSkills } from "./_lib/repo.js";

const REPO_ROOT = repoRootFromTestFile(import.meta.url);
const SKILLS_DIR = join(REPO_ROOT, "skills");

// ---------- EXEMPT_AGENTSKILLS ledger ----------
// Goal-state: empty. Each entry must have a justification + unpark trigger.

interface ExemptEntry {
  rule: string;
  reason: string;
  unpark: string;
}

const EXEMPT_AGENTSKILLS = new Map<string, ExemptEntry>(
  [
    // No entries. All skills have been brought into conformance.
    // Template for future entries:
    // ["domain/skill-name", {
    //   rule: "RULE_ID",
    //   reason: "why it cannot conform yet",
    //   unpark: "falsifiable condition that removes the exception",
    // }],
  ],
);

// ---------- constants ----------

const NAME_PATTERN = /^[a-z0-9/-]+$/;
const NAME_MAX = 64;
const DESC_MAX = 1024;

// Top-level meta-files in skills/ that are not skill definitions.
const META_FILES = new Set(["SKILL_ARCHITECTURE.md", "SKILL_REGISTRY.md"]);

// ---------- helpers ----------

/** Relative path to canonical skill key (mirrors fileToSkillKey in _lib/repo.ts). */
function relToSkillKey(rel: string): string | null {
  if (META_FILES.has(rel)) return null;
  if (rel.endsWith("/README.md")) return null;
  if (rel.includes("/references/")) return null;
  if (rel.endsWith("/SKILL.md")) return rel.slice(0, -"/SKILL.md".length);
  if (rel.endsWith(".md")) return rel.slice(0, -".md".length);
  return null;
}

/**
 * Parse YAML frontmatter.
 * Returns { found: false } when no --- block is present.
 * Returns { found: true, raw } with the raw frontmatter string otherwise.
 */
function parseFrontmatter(content: string): { found: false } | { found: true; raw: string } {
  if (!content.startsWith("---")) return { found: false };
  const end = content.indexOf("\n---", 3);
  if (end === -1) return { found: false };
  return { found: true, raw: content.slice(3, end) };
}

/**
 * Extract a scalar field value from raw YAML frontmatter.
 * Returns null when the key is absent.
 */
function extractField(raw: string, key: string): string | null {
  const m = raw.match(new RegExp(`^${key}\\s*:\\s*(.*)`, "m"));
  if (!m) return null;
  let value = m[1].trim();
  if (!value) {
    // Multi-line: collect indented continuation lines
    const lines = raw.split("\n");
    const keyIdx = lines.findIndex((l) => new RegExp(`^${key}\\s*:`).test(l));
    const parts: string[] = [];
    for (let i = keyIdx + 1; i < lines.length; i++) {
      if (/^\s+/.test(lines[i])) {
        parts.push(lines[i].trim());
      } else {
        break;
      }
    }
    value = parts.join(" ").trim();
  }
  return value || null;
}

// ---------- build skill map ----------

// walkSkills already excludes `references/` and `assets/` subtrees.
const allRelPaths = walkSkills(SKILLS_DIR);
const skillEntries: Array<{ key: string; rel: string; content: string }> = [];

for (const rel of allRelPaths) {
  const key = relToSkillKey(rel);
  if (!key) continue; // meta file
  const content = readFileSync(join(SKILLS_DIR, rel), "utf8");
  skillEntries.push({ key, rel, content });
}

const N = skillEntries.length;

// ---------- tests ----------

describe("v8.8 agentskills.io conformance — scope sanity", () => {
  it("discovers a non-zero number of skill files", () => {
    assert.ok(N > 0, `expected skills under skills/ but found ${N}`);
  });

  it("EXEMPT_AGENTSKILLS entries all reference real skill keys (no stale exemptions)", () => {
    const knownKeys = new Set(skillEntries.map((e) => e.key));
    const stale: string[] = [];
    for (const key of EXEMPT_AGENTSKILLS.keys()) {
      if (!knownKeys.has(key)) stale.push(key);
    }
    assert.deepEqual(
      stale,
      [],
      `Stale EXEMPT_AGENTSKILLS entries (skill no longer exists on disk): ${stale.join(", ")}`,
    );
  });
});

describe("v8.8 agentskills.io conformance — frontmatter presence", () => {
  it("every skill file has YAML frontmatter", () => {
    const missing: string[] = [];
    for (const { key, content } of skillEntries) {
      if (EXEMPT_AGENTSKILLS.get(key)?.rule === "MISSING_FRONTMATTER") continue;
      const fm = parseFrontmatter(content);
      if (!fm.found) missing.push(key);
    }
    assert.deepEqual(
      missing,
      [],
      `Skills missing YAML frontmatter (add --- delimiters with name: and description:): ${missing.join(", ")}`,
    );
  });
});

describe("v8.8 agentskills.io conformance — name field", () => {
  it("every skill frontmatter declares a name: field", () => {
    const missing: string[] = [];
    for (const { key, content } of skillEntries) {
      if (EXEMPT_AGENTSKILLS.get(key)?.rule === "MISSING_NAME") continue;
      const fm = parseFrontmatter(content);
      if (!fm.found) continue; // caught by frontmatter test
      const name = extractField(fm.raw, "name");
      if (!name) missing.push(key);
    }
    assert.deepEqual(
      missing,
      [],
      `Skills with missing name: field: ${missing.join(", ")}`,
    );
  });

  it("every name: value matches [a-z0-9/-]+ (lowercase, numbers, hyphens, slash namespace separator)", () => {
    const invalid: string[] = [];
    for (const { key, content } of skillEntries) {
      if (EXEMPT_AGENTSKILLS.get(key)?.rule === "NAME_FORMAT") continue;
      const fm = parseFrontmatter(content);
      if (!fm.found) continue;
      const name = extractField(fm.raw, "name");
      if (!name) continue; // caught by name-present test
      if (!NAME_PATTERN.test(name)) invalid.push(key);
    }
    assert.deepEqual(
      invalid,
      [],
      `Skills with invalid name format (must match [a-z0-9/-]+): ${invalid.join(", ")}`,
    );
  });

  it(`every name: value is ≤${NAME_MAX} chars`, () => {
    const tooLong: string[] = [];
    for (const { key, content } of skillEntries) {
      if (EXEMPT_AGENTSKILLS.get(key)?.rule === "NAME_TOO_LONG") continue;
      const fm = parseFrontmatter(content);
      if (!fm.found) continue;
      const name = extractField(fm.raw, "name");
      if (!name) continue;
      if (name.length > NAME_MAX) tooLong.push(key);
    }
    assert.deepEqual(
      tooLong,
      [],
      `Skills with name: exceeding ${NAME_MAX} chars: ${tooLong.join(", ")}`,
    );
  });
});

describe("v8.8 agentskills.io conformance — description field", () => {
  it("every skill frontmatter declares a description: field", () => {
    const missing: string[] = [];
    for (const { key, content } of skillEntries) {
      if (EXEMPT_AGENTSKILLS.get(key)?.rule === "MISSING_DESCRIPTION") continue;
      const fm = parseFrontmatter(content);
      if (!fm.found) continue; // caught by frontmatter test
      const desc = extractField(fm.raw, "description");
      if (!desc) missing.push(key);
    }
    assert.deepEqual(
      missing,
      [],
      `Skills with missing description: field: ${missing.join(", ")}`,
    );
  });

  it(`every description: value is ≤${DESC_MAX} chars`, () => {
    const tooLong: string[] = [];
    for (const { key, content } of skillEntries) {
      if (EXEMPT_AGENTSKILLS.get(key)?.rule === "DESCRIPTION_TOO_LONG") continue;
      const fm = parseFrontmatter(content);
      if (!fm.found) continue;
      const desc = extractField(fm.raw, "description");
      if (!desc) continue;
      if (desc.length > DESC_MAX) tooLong.push(key);
    }
    assert.deepEqual(
      tooLong,
      [],
      `Skills with description: exceeding ${DESC_MAX} chars: ${tooLong.join(", ")}`,
    );
  });
});

describe("v8.8 agentskills.io conformance — EXEMPT ledger health", () => {
  it("EXEMPT_AGENTSKILLS is empty (goal-state: all skills conformant)", () => {
    assert.equal(
      EXEMPT_AGENTSKILLS.size,
      0,
      `EXEMPT_AGENTSKILLS has ${EXEMPT_AGENTSKILLS.size} entr${EXEMPT_AGENTSKILLS.size === 1 ? "y" : "ies"} — goal is 0. Each entry requires justification + unpark trigger; clear entries only when their condition is met on disk.`,
    );
  });
});
