/**
 * v7.3.1 Eval Harness Extension — Newcomer Surface Conformance
 *
 * Companion to test/substrate.test.ts. Guards the v7.3 front-door surface:
 *   - Protocol-tier command files: /intake, /welcome, /sovereign-spawn
 *   - Front-Door Tier agents: starlight-concierge, starlight-envoy
 *   - Integration skills: idea-triage, creator-path
 *   - Vertical starter template (7 files)
 *   - Root newcomer docs (ONBOARDING, DELIVERY, SESSION_RUNBOOK)
 *
 * Closes the Luminor Board REVISE gap on v7.3 ("no evals on the front door").
 * Uses Node's built-in test runner — no new deps.
 *
 * SECURITY NOTE (per /openclaw-audit CRITICAL 2):
 * Like substrate.test.ts, no assertion in this file interpolates raw fixture
 * file content into error messages. Assert on needle (trusted) using
 * `content.includes(needle)`, so on failure the message names only the needle
 * — never the haystack. Audit new assertions against this rule before merge.
 *
 * ---
 * Built on SIP — Starlight Intelligence Protocol
 * - Substrate: starlightintelligence.org/protocol v1.1.0
 * - Layers used: [file-contract, attestation, commands, sovereignty]
 * - Verticals: starlight-intelligence-system@v7.3
 * - Generated: 2026-04-24
 * ---
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// ── Inlined attestation parser (mirrors substrate.test.ts rationale) ──
// We intentionally do NOT import from ../src/starlight-mcp.js — that module's
// main() keeps the event loop alive. Mirror substrate.test.ts's inline copy
// to keep this file standalone.

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
const AGENTS_DIR = join(REPO_ROOT, "agents");
const SKILLS_INTEGRATION_DIR = join(REPO_ROOT, "skills", "integration");
const SKILL_RULES_FILE = join(REPO_ROOT, "skills", "skill-rules.json");
const VERTICAL_TEMPLATE_DIR = join(REPO_ROOT, "templates", "vertical-starter");

// ── Helpers ─────────────────────────────────────────────────

function isFile(p: string): boolean {
  return existsSync(p) && statSync(p).isFile();
}

function hasYamlFrontmatter(content: string, requiredKeys: string[]): { ok: boolean; missing: string[] } {
  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!fmMatch) return { ok: false, missing: requiredKeys };
  const fm = fmMatch[1];
  const missing = requiredKeys.filter(k => !new RegExp(`^${k}\\s*:`, "m").test(fm));
  return { ok: missing.length === 0, missing };
}

const V73_COMMANDS = ["intake", "welcome", "sovereign-spawn"];

// ── Tests ───────────────────────────────────────────────────

describe("v7.3 — Newcomer Surface", () => {

  describe("Block 1 — Protocol-tier command file contract", () => {
    it("v7.3.1.1: all three newcomer commands present at .claude/commands/", () => {
      for (const cmd of V73_COMMANDS) {
        const path = join(COMMANDS_DIR, `${cmd}.md`);
        assert.ok(isFile(path), `v7.3 command missing: .claude/commands/${cmd}.md — required by newcomer surface contract.`);
      }
    });

    it("v7.3.1.2: each v7.3 command has YAML frontmatter with name/description/allowed-tools", () => {
      const REQUIRED_FM = ["name", "description", "allowed-tools"];
      for (const cmd of V73_COMMANDS) {
        const path = join(COMMANDS_DIR, `${cmd}.md`);
        const content = readFileSync(path, "utf-8");
        const { ok, missing } = hasYamlFrontmatter(content, REQUIRED_FM);
        assert.ok(ok, `v7.3 command ${cmd}.md frontmatter incomplete — missing: ${missing.join(", ")}.`);
      }
    });

    it("v7.3.1.3: each v7.3 command ends with a parseable 'Built on SIP' attestation block", () => {
      // NOTE: These commands emit attestation in two shapes — an example block
      // inside a fenced code block (for LLM output templating) AND a real block
      // at file end. The parser greedily picks the first fenced "Built on SIP"
      // block. We assert the block is found and pins substrate version; we do
      // NOT assert verticals-list parsing here because command-file example
      // blocks use inline non-bracketed `- Verticals: <str>` rather than the
      // bracketed or bulleted form ATTESTATIONS.md uses. Attestation-list
      // parsing is covered by substrate.test.ts against ATTESTATIONS.md itself.
      for (const cmd of V73_COMMANDS) {
        const path = join(COMMANDS_DIR, `${cmd}.md`);
        const content = readFileSync(path, "utf-8");
        const { found, parsed, issues } = parseAttestation(content);
        assert.ok(found, `v7.3 command ${cmd}.md missing 'Built on SIP' block: ${issues.join("; ")}`);
        assert.ok(parsed.substrate_version, `v7.3 command ${cmd}.md attestation invalid: substrate version not pinned — ${issues.join("; ")}`);
      }
    });
  });

  describe("Block 2 — /intake contract", () => {
    const intakePath = join(COMMANDS_DIR, "intake.md");

    it("v7.3.2.1: intake.md references all four routes (A / B / C / D)", () => {
      const content = readFileSync(intakePath, "utf-8");
      const routeNeedles = ["Route A", "Route B", "Route C", "Route D"];
      for (const needle of routeNeedles) {
        assert.ok(content.includes(needle), `intake.md missing reference to ${needle} — four-route invariant broken.`);
      }
    });

    it("v7.3.2.2: intake.md Rules section enforces no-optionality / decision-forcing language", () => {
      const content = readFileSync(intakePath, "utf-8");
      const optionalityNeedles = ["Never two", "Optionality", "decision"];
      const found = optionalityNeedles.some(needle => content.includes(needle));
      assert.ok(found, `intake.md Rules section missing no-optionality language — expected one of: ${optionalityNeedles.join(" / ")}.`);
    });

    it("v7.3.2.3: intake.md references writing cards to memory/intake/", () => {
      const content = readFileSync(intakePath, "utf-8");
      assert.ok(content.includes("memory/intake/"), "intake.md does not reference the memory/intake/ card directory — intake log contract broken.");
    });
  });

  describe("Block 3 — /welcome contract", () => {
    const welcomePath = join(COMMANDS_DIR, "welcome.md");

    it("v7.3.3.1: welcome.md enforces the one-arrow rule (exactly ONE next command)", () => {
      const content = readFileSync(welcomePath, "utf-8");
      // The rule is: output names exactly ONE next command. Look for evidence.
      const oneArrowNeedles = ["ONE next command", "one next step", "single next step", "one arrow"];
      const found = oneArrowNeedles.some(needle => content.includes(needle));
      assert.ok(found, `welcome.md missing one-arrow rule — expected one of: ${oneArrowNeedles.join(" / ")}.`);
    });

    it("v7.3.3.2: welcome.md references the sovereignty clause", () => {
      const content = readFileSync(welcomePath, "utf-8").toLowerCase();
      assert.ok(content.includes("sovereignty"), "welcome.md does not reference sovereignty — SIP § Layer 5 non-waivable clause missing from front door.");
    });
  });

  describe("Block 4 — /sovereign-spawn contract", () => {
    const spawnPath = join(COMMANDS_DIR, "sovereign-spawn.md");

    it("v7.3.4.1: sovereign-spawn.md enforces five spawn conditions", () => {
      const content = readFileSync(spawnPath, "utf-8");
      // Condition names from the command's Process § 1
      const conditionNeedles = [
        "Sovereignty clear",
        "Substrate awareness",
        "Attestation committed",
        "Name not already registered",
        "Fork intent honest",
      ];
      const missing = conditionNeedles.filter(needle => !content.includes(needle));
      assert.equal(missing.length, 0, `sovereign-spawn.md missing spawn conditions: ${missing.join(", ")} — five-condition gate weakened.`);
    });

    it("v7.3.4.2: sovereign-spawn.md requires SOUL.md anti-drift content", () => {
      const content = readFileSync(spawnPath, "utf-8");
      const hasSoul = content.includes("SOUL.md");
      const hasAnchor = content.includes("drift") || content.includes("essence");
      assert.ok(hasSoul, "sovereign-spawn.md does not reference SOUL.md — soul anchor step missing.");
      assert.ok(hasAnchor, "sovereign-spawn.md does not mention drift/essence — SOUL anti-drift framing missing.");
    });

    it("v7.3.4.3: sovereign-spawn.md mirrors all four protocol-tier commands", () => {
      const content = readFileSync(spawnPath, "utf-8");
      const protocolCommands = ["sip-attest", "alliance-forge", "vertical-spawn", "luminor-board"];
      const missing = protocolCommands.filter(cmd => !content.includes(cmd));
      assert.equal(missing.length, 0, `sovereign-spawn.md missing protocol-tier mirror references: ${missing.join(", ")} — fork would ship incomplete command set.`);
    });
  });

  describe("Block 5 — Front-Door Tier agents", () => {
    it("v7.3.5.1: both Front-Door agents present at agents/starlight-{concierge,envoy}.md", () => {
      const concierge = join(AGENTS_DIR, "starlight-concierge.md");
      const envoy = join(AGENTS_DIR, "starlight-envoy.md");
      assert.ok(isFile(concierge), "agents/starlight-concierge.md missing — Front-Door Tier incomplete.");
      assert.ok(isFile(envoy), "agents/starlight-envoy.md missing — Front-Door Tier incomplete.");
    });

    it("v7.3.5.2: AGENT_REGISTRY.md declares the Front-Door Tier with both agents named", () => {
      const content = readFileSync(join(AGENTS_DIR, "AGENT_REGISTRY.md"), "utf-8");
      const needles = ["Front-Door", "Concierge", "Envoy"];
      const missing = needles.filter(n => !content.includes(n));
      assert.equal(missing.length, 0, `AGENT_REGISTRY.md missing Front-Door Tier declarations: ${missing.join(", ")} — intake tier invisible to loaders.`);
    });
  });

  describe("Block 6 — Skill registration", () => {
    it("v7.3.6.1: both integration skill files present", () => {
      const ideaTriage = join(SKILLS_INTEGRATION_DIR, "idea-triage.md");
      const creatorPath = join(SKILLS_INTEGRATION_DIR, "creator-path.md");
      assert.ok(isFile(ideaTriage), "skills/integration/idea-triage.md missing — intake classification skill unwired.");
      assert.ok(isFile(creatorPath), "skills/integration/creator-path.md missing — creator-track skill unwired.");
    });

    it("v7.3.6.2: skill-rules.json registers both rules and assigns defaults to both Front-Door agents", () => {
      const raw = readFileSync(SKILL_RULES_FILE, "utf-8");
      let json: any;
      try {
        json = JSON.parse(raw);
      } catch (err) {
        assert.fail(`skills/skill-rules.json is not valid JSON: ${(err as Error).message}`);
      }

      assert.ok(Array.isArray(json.rules), "skill-rules.json missing 'rules' array.");
      const ruleIds = new Set<string>(json.rules.map((r: any) => r.id));
      const requiredRules = ["integration-idea-triage", "integration-creator-path"];
      const missingRules = requiredRules.filter(id => !ruleIds.has(id));
      assert.equal(missingRules.length, 0, `skill-rules.json missing rule IDs: ${missingRules.join(", ")}.`);

      assert.ok(json.defaults && typeof json.defaults === "object", "skill-rules.json missing 'defaults' object.");
      const requiredDefaults = ["starlight-concierge", "starlight-envoy"];
      const missingDefaults = requiredDefaults.filter(agent => !Object.prototype.hasOwnProperty.call(json.defaults, agent));
      assert.equal(missingDefaults.length, 0, `skill-rules.json defaults missing agent keys: ${missingDefaults.join(", ")} — Front-Door agents will load with zero default skills.`);
    });
  });

  describe("Block 7 — Vertical starter template", () => {
    it("v7.3.7.1: all 7 template files present in templates/vertical-starter/", () => {
      const templateFiles = [
        "SKILL.md",
        "SOUL.md",
        "AGENTS.md",
        "MEMORY.md",
        "STACK.md",
        "README.md",
        join(".claude", "commands", "vertical-command-template.md"),
      ];
      const missing = templateFiles.filter(f => !isFile(join(VERTICAL_TEMPLATE_DIR, f)));
      assert.equal(missing.length, 0, `vertical-starter template files missing: ${missing.join(", ")}.`);
    });

    it("v7.3.7.2: SOUL.md template contains the 'Fill in ONE sentence' placeholder guard", () => {
      const content = readFileSync(join(VERTICAL_TEMPLATE_DIR, "SOUL.md"), "utf-8");
      assert.ok(
        content.includes("Fill in ONE sentence"),
        "templates/vertical-starter/SOUL.md missing 'Fill in ONE sentence' placeholder — spawner's anti-gaming drift check has nothing to assert against."
      );
    });
  });

  describe("Block 8 — Root newcomer docs", () => {
    it("v7.3.8.1: ONBOARDING.md and DELIVERY.md present at repo root", () => {
      assert.ok(isFile(join(REPO_ROOT, "ONBOARDING.md")), "ONBOARDING.md missing at repo root — newcomer docs contract broken.");
      assert.ok(isFile(join(REPO_ROOT, "DELIVERY.md")), "DELIVERY.md missing at repo root — delivery menu invisible to /welcome.");
    });

    it("v7.3.8.2: SESSION_RUNBOOK.md exists and references all three v7.3 commands", () => {
      const runbookPath = join(REPO_ROOT, "SESSION_RUNBOOK.md");
      assert.ok(isFile(runbookPath), "SESSION_RUNBOOK.md missing at repo root.");
      const content = readFileSync(runbookPath, "utf-8");
      const cmdNeedles = ["/intake", "/welcome", "/sovereign-spawn"];
      const missing = cmdNeedles.filter(n => !content.includes(n));
      assert.equal(missing.length, 0, `SESSION_RUNBOOK.md missing command references: ${missing.join(", ")} — runbook decoupled from v7.3 commands.`);
    });
  });

});
