/**
 * v7.7 Conformance Harness — skill-rules.json registry symmetry
 *
 * Companion to test/v76.test.ts (which guards agent registry symmetry).
 * Guards the symmetry between skills/skill-rules.json and skills/**\/*.md:
 *   - Every rule's `skill` field points at a real file (no orphans)
 *   - Every skill file is either registered in skill-rules.json
 *     OR in the EXEMPT_PHANTOMS allow-list (with reason)
 *
 * EXEMPT_PHANTOMS is a deliberate technical-debt ledger. Adding a skill file
 * to disk without a rule means: register it, OR justify its exemption here.
 * Empty exempt list is the goal state.
 *
 * Background: 2026-05-04 audit found 25 skill files unregistered in
 * skill-rules.json — substantive sub-stack skills (Music IS, Sound IS,
 * Energy IS, Memory orchestrator, Vision) were never wired. This test
 * catches recurrence and lets registration proceed in batches.
 *
 * SECURITY NOTE: per /openclaw-audit CRITICAL 2, NO assertion interpolates
 * raw fixture content into error messages. Trusted inputs only.
 *
 * ---
 * Built on SIP — Starlight Intelligence Protocol
 * - Substrate: starlightintelligence.org/protocol v1.1.0
 * - Layers used: [skill-activation, file-contract, attestation]
 * - Generated: 2026-05-05
 * ---
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");
const SKILLS_DIR = join(REPO_ROOT, "skills");
const RULES_PATH = join(SKILLS_DIR, "skill-rules.json");

// ---------- exempt phantoms (technical-debt ledger) ----------
//
// Each entry: skill path WITHOUT extension or trailing /SKILL.md, with reason.
// Goal: empty list. Removing an entry requires registering the skill in
// skill-rules.json with valid triggers.

const EXEMPT_PHANTOMS = new Set<string>([
  // Music IS sub-stack — skills authored 2026-04-27 onwards, registration deferred.
  // Each has activation triggers in its file body — registration is mechanical.
  "music-is/amplification-mesh",
  "music-is/asset-render",
  "music-is/catalog-systems",
  "music-is/distribution-flow",
  "music-is/naming-intelligence",
  "music-is/persona-canon",
  "music-is/release-gate",
  "music-is/royalty-graph",
  "music-is/song-intake",
  "music-is/suno-prompt",

  // Sound IS sub-stack — same pattern as Music IS.
  "sound-intelligence/audience-architecture",
  "sound-intelligence/catalog-systems",
  "sound-intelligence/composition-architecture",
  "sound-intelligence/performance-design",
  "sound-intelligence/production-systems",
  "sound-intelligence/sync-licensing",

  // Memory orchestrator — v0.1-scoped, full activation pending substrate maturity.
  "memory/sis-memory-orchestrator",

  // Vision sub-skill — frontmatter-style activation (auto_activate field), not
  // skill-rules.json-driven. May need to either migrate to skill-rules.json or
  // explicitly note the alternate activation path. Keep exempt until decision.
  "vision/voice-anti-slop",
]);

// ---------- helpers ----------

interface Rule {
  id: string;
  skill: string;
  triggers?: { keywords?: string[]; agents?: string[]; intents?: string[] };
  priority?: string;
  load_level?: string;
}

function loadRules(): Rule[] {
  const raw = readFileSync(RULES_PATH, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed.rules)) {
    throw new Error("skill-rules.json missing 'rules' array");
  }
  return parsed.rules;
}

function listSkillFiles(): string[] {
  // Walk skills/ recursively, return relative paths to .md files.
  const results: string[] = [];
  function walk(dir: string, prefix: string) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const rel = prefix ? `${prefix}/${entry}` : entry;
      const stat = statSync(full);
      if (stat.isDirectory()) {
        walk(full, rel);
      } else if (entry.endsWith(".md")) {
        results.push(rel);
      }
    }
  }
  walk(SKILLS_DIR, "");
  return results.sort();
}

/**
 * Map a skill file's relative path to its candidate skill-key (the form
 * referenced in skill-rules.json). Convention:
 *   skills/foo/bar.md       -> foo/bar
 *   skills/foo/bar/SKILL.md -> foo/bar
 * Excluded: top-level architecture docs, README.md, references/ subdirs.
 */
function fileToSkillKey(rel: string): string | null {
  if (rel === "SKILL_ARCHITECTURE.md") return null;
  if (rel.endsWith("/README.md")) return null;
  if (rel.includes("/references/")) return null;
  if (rel.endsWith("/SKILL.md")) return rel.slice(0, -"/SKILL.md".length);
  if (rel.endsWith(".md")) return rel.slice(0, -".md".length);
  return null;
}

// ---------- tests ----------

describe("v7.7 skill-rules.json — orphan check", () => {
  it("every rule's `skill` field points at a real file", () => {
    const rules = loadRules();
    const orphans: string[] = [];
    for (const r of rules) {
      const fileForm = join(SKILLS_DIR, `${r.skill}.md`);
      const skillMdForm = join(SKILLS_DIR, r.skill, "SKILL.md");
      if (!existsSync(fileForm) && !existsSync(skillMdForm)) {
        orphans.push(r.skill);
      }
    }
    assert.deepEqual(orphans, [], `rules pointing at missing files: ${orphans.join(", ")}`);
  });

  it("every rule has at least one trigger", () => {
    const rules = loadRules();
    const triggerless: string[] = [];
    for (const r of rules) {
      const t = r.triggers ?? {};
      const hasAny =
        (t.keywords && t.keywords.length > 0) ||
        (t.agents && t.agents.length > 0) ||
        (t.intents && t.intents.length > 0);
      if (!hasAny) triggerless.push(r.id);
    }
    assert.deepEqual(triggerless, [], `rules with no triggers: ${triggerless.join(", ")}`);
  });

  it("every rule has a unique id", () => {
    const rules = loadRules();
    const ids = rules.map((r) => r.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.deepEqual(dupes, [], `duplicate rule ids: ${[...new Set(dupes)].join(", ")}`);
  });
});

describe("v7.7 skill-rules.json — phantom check", () => {
  it("every skill file is either registered OR in EXEMPT_PHANTOMS allow-list", () => {
    const rules = loadRules();
    const registered = new Set(rules.map((r) => r.skill));

    const files = listSkillFiles();
    const candidates = files.map(fileToSkillKey).filter((k): k is string => k !== null);

    const phantoms: string[] = [];
    for (const c of candidates) {
      if (registered.has(c)) continue;
      if (EXEMPT_PHANTOMS.has(c)) continue;
      phantoms.push(c);
    }
    assert.deepEqual(
      phantoms,
      [],
      `skill files not registered in skill-rules.json AND not in EXEMPT_PHANTOMS: ${phantoms.join(", ")}`,
    );
  });

  it("EXEMPT_PHANTOMS only references files that actually exist", () => {
    const ghosts: string[] = [];
    for (const exempt of EXEMPT_PHANTOMS) {
      const fileForm = join(SKILLS_DIR, `${exempt}.md`);
      const skillMdForm = join(SKILLS_DIR, exempt, "SKILL.md");
      if (!existsSync(fileForm) && !existsSync(skillMdForm)) {
        ghosts.push(exempt);
      }
    }
    assert.deepEqual(ghosts, [], `EXEMPT_PHANTOMS entries with no file: ${ghosts.join(", ")}`);
  });
});

describe("v7.7 skill-rules.json — Energy IS coverage (post-stub)", () => {
  it("Energy IS skill stubs are registered in skill-rules.json (no exemption)", () => {
    const rules = loadRules();
    const registered = new Set(rules.map((r) => r.skill));
    const energySkills = [
      "energy-intelligence/sizing-architecture",
      "energy-intelligence/cost-modeling",
      "energy-intelligence/installer-workflow",
      "energy-intelligence/operations-monitoring",
      "energy-intelligence/buyer-journey",
      "energy-intelligence/grid-integration",
      "energy-intelligence/recovery-protocol",
    ];
    const missing = energySkills.filter((s) => !registered.has(s));
    assert.deepEqual(
      missing,
      [],
      `Energy IS skills must be registered in skill-rules.json (NOT exempted): ${missing.join(", ")}`,
    );
  });
});
