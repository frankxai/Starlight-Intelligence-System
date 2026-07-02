/**
 * v9.2 Agent Quality — the distinctiveness ratchet.
 *
 * The 2026-07-02 audit found 81/144 agents were identical auto-scaffolded
 * boilerplate (the generic "Domain Assessment / Context Compilation /
 * Execution Routing / Validation Check" capability quadruple) and ~96 carried
 * filename≠frontmatter-name or voice-as-description defects. Count guards
 * (v87) can't see this — an agent can be registered, counted, and empty.
 *
 * This suite is a RATCHET, not a purge (pattern: v77 EXEMPT_PHANTOMS):
 *   - test/_fixtures/v92-agent-quality-ledger.json lists today's offenders.
 *   - `thin` entries must still be thin (rewrite one → remove its entry).
 *   - `legacyNaming` entries are grandfathered on name/voice conformance.
 *   - Any agent OUTSIDE the ledgers must fully conform to
 *     agents/AGENT_TEMPLATE.md rules: no scaffold fingerprint, name ==
 *     filename stem, voice ∈ the five VOICES.md archetypes.
 *   - The ledgers can only shrink: adding a new thin agent fails here.
 *
 * Built on SIP — operational tier (quality ratchet).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const AGENTS_DIR = path.join(ROOT, "agents");
const LEDGER_PATH = path.join(ROOT, "test", "_fixtures", "v92-agent-quality-ledger.json");

const SCAFFOLD_FINGERPRINT = [
  "**Domain Assessment**",
  "**Context Compilation**",
  "**Execution Routing**",
  "**Validation Check**",
];
const VOICE_ARCHETYPES = new Set([
  "architect",
  "sovereign-creator",
  "protocol-defender",
  "implementer",
  "overseer",
]);
const NON_AGENT_FILES = new Set([
  "AGENT_REGISTRY.md",
  "CODING_AGENTS_REGISTRY.md",
  "AGENT_TEMPLATE.md",
]);

interface Ledger {
  thin: string[];
  legacyNaming: string[];
}

function listAgentFiles(): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(AGENTS_DIR, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".md") && !NON_AGENT_FILES.has(entry.name)) {
      files.push(entry.name);
    } else if (entry.isDirectory()) {
      for (const sub of readdirSync(path.join(AGENTS_DIR, entry.name))) {
        if (sub.endsWith(".md")) files.push(`${entry.name}/${sub}`);
      }
    }
  }
  return files.sort();
}

function isThin(text: string): boolean {
  return SCAFFOLD_FINGERPRINT.every((marker) => text.includes(marker));
}

function frontmatterField(text: string, key: string): string | undefined {
  const match = text.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return match?.[1]?.trim();
}

const ledger = JSON.parse(readFileSync(LEDGER_PATH, "utf8")) as Ledger;
const thinSet = new Set(ledger.thin);
const legacySet = new Set(ledger.legacyNaming);
const agentFiles = listAgentFiles();

describe("v9.2 agent quality — ledger integrity", () => {
  it("every ledger entry points at a real agent file", () => {
    const missing = [...ledger.thin, ...ledger.legacyNaming].filter(
      (f) => !existsSync(path.join(AGENTS_DIR, f)),
    );
    assert.deepEqual(missing, [], `ledger entries without files: ${missing.join(", ")}`);
  });

  it("no agent appears in both ledgers with contradictory expectations", () => {
    // (thin agents are allowed to also be legacy-named — but the fixture keeps
    // them in `thin` only; a rewrite must clear BOTH defect classes at once)
    const overlap = ledger.thin.filter((f) => legacySet.has(f));
    assert.deepEqual(overlap, [], "keep each agent in exactly one ledger");
  });

  it("thin ledger stays honest: every entry is still thin (rewrote one? remove it)", () => {
    const cured = ledger.thin.filter(
      (f) => !isThin(readFileSync(path.join(AGENTS_DIR, f), "utf8")),
    );
    assert.deepEqual(
      cured,
      [],
      `no longer thin — remove from the ledger to lock the win: ${cured.join(", ")}`,
    );
  });
});

describe("v9.2 agent quality — the ratchet", () => {
  it("no NEW thin agents outside the ledger (the scaffold quadruple is banned)", () => {
    const offenders = agentFiles.filter((f) => {
      if (thinSet.has(f)) return false;
      return isThin(readFileSync(path.join(AGENTS_DIR, f), "utf8"));
    });
    assert.deepEqual(
      offenders,
      [],
      `thin agents outside the ledger (write a real playbook per agents/AGENT_TEMPLATE.md): ${offenders.join(", ")}`,
    );
  });

  it("every agent outside the ledgers conforms to the template contract", () => {
    const violations: string[] = [];
    for (const file of agentFiles) {
      if (thinSet.has(file) || legacySet.has(file)) continue;
      const text = readFileSync(path.join(AGENTS_DIR, file), "utf8");
      const stem = path.basename(file, ".md");
      const name = frontmatterField(text, "name");
      const voice = frontmatterField(text, "voice");
      if (name !== stem) violations.push(`${file}: name "${name}" != filename stem "${stem}"`);
      if (!voice || !VOICE_ARCHETYPES.has(voice)) {
        violations.push(`${file}: voice "${voice}" is not a VOICES.md archetype (use role: for the description)`);
      }
    }
    assert.deepEqual(violations, [], violations.join("\n"));
  });
});
