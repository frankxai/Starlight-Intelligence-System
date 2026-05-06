/**
 * v7.8 Conformance Harness — SKILL_REGISTRY.md ↔ skill-rules.json symmetry
 *
 * Companion to:
 *   - test/v76.test.ts (agent registry symmetry, frontmatter completeness)
 *   - test/v77-skill-rules.test.ts (skill-rules.json ↔ skills/**\/*.md symmetry)
 *
 * Guards the symmetry between skills/SKILL_REGISTRY.md (operational-tier
 * registry shipped 2026-05-06 per Tier 3a board verdict) and
 * skills/skill-rules.json (canonical-source for activation triggers):
 *   - Every rule in skill-rules.json appears in SKILL_REGISTRY.md
 *   - Every SKILL_REGISTRY.md row points at a registered rule
 *   - Every SKILL_REGISTRY.md row has well-formed schema (version + status non-empty)
 *
 * Ship-then-constrain pattern: SKILL_REGISTRY.md shipped commit dd041a9
 * (2026-05-06); this test follows in a separate commit so day-one drift
 * surfaces as a fixable test failure rather than as a blocker on the
 * substrate ship. Per board 2026-05-06 Verifier vector.
 *
 * SECURITY NOTE: per /openclaw-audit CRITICAL 2, NO assertion interpolates
 * raw fixture content into error messages. Trusted inputs only.
 *
 * ---
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 * - Substrate: starlightintelligence.org/protocol
 * - Layers used: [skill-activation, file-contract, attestation]
 * - Generated: 2026-05-06
 * ---
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { repoRootFromTestFile } from "./_lib/repo.js";

const REPO_ROOT = repoRootFromTestFile(import.meta.url);
const SKILLS_DIR = join(REPO_ROOT, "skills");
const RULES_PATH = join(SKILLS_DIR, "skill-rules.json");
const REGISTRY_PATH = join(SKILLS_DIR, "SKILL_REGISTRY.md");

// ---------- helpers ----------

interface Rule {
  id: string;
  skill: string;
}

function loadRules(): Rule[] {
  const raw = readFileSync(RULES_PATH, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed.rules)) {
    throw new Error("skill-rules.json missing 'rules' array");
  }
  return parsed.rules;
}

interface RegistryRow {
  skill: string;
  ruleId: string;
  ownerRepo: string;
  version: string;
  status: string;
}

/**
 * Parse SKILL_REGISTRY.md table rows.
 *
 * Expected row shape (5 columns inside per-domain ### sections):
 *   | <skill-key> | <rule-id> | <owner-repo> | <version> | <status> |
 *
 * Skips:
 *   - Schema/header tables outside ### domain sections
 *   - Lifecycle/governance tables (status lifecycle table) — distinguishable
 *     by header text
 *   - Empty rows + separator rows (---)
 */
function parseRegistry(): RegistryRow[] {
  if (!existsSync(REGISTRY_PATH)) {
    throw new Error(`SKILL_REGISTRY.md not found at ${REGISTRY_PATH}`);
  }
  const content = readFileSync(REGISTRY_PATH, "utf8");
  const lines = content.split(/\r?\n/);

  const rows: RegistryRow[] = [];
  let inDomainSection = false;
  let inTable = false;
  let headerSeen = false;

  for (const line of lines) {
    // Domain headers: "### <domain> (<count>)"
    if (/^###\s/.test(line)) {
      // Skip the "Status lifecycle" table and "Multi-owner branch points (reserved)"
      // by requiring domain-section style: "### domain-name (N)" with paren count
      const domainMatch = line.match(/^###\s+\S+\s*\(\d+\)\s*$/);
      inDomainSection = !!domainMatch;
      inTable = false;
      headerSeen = false;
      continue;
    }

    // Other section markers — exit domain section
    if (/^##\s/.test(line)) {
      inDomainSection = false;
      inTable = false;
      headerSeen = false;
      continue;
    }

    if (!inDomainSection) continue;

    // Table boundaries
    const trimmed = line.trim();
    if (trimmed.startsWith("|")) {
      if (!headerSeen) {
        // First | line is the header row
        headerSeen = true;
        continue;
      }
      // Second | line is the separator |---|---|...|
      if (!inTable) {
        // Confirm this looks like a separator
        if (/^\|[\s|:-]+\|$/.test(trimmed)) {
          inTable = true;
          continue;
        }
      }
      // Subsequent | lines are data rows
      if (inTable) {
        // Split on | and trim; skip leading/trailing empty cells from leading/trailing |
        const cells = trimmed.split("|").map((c) => c.trim());
        // cells[0] is empty (before leading |), cells[last] is empty (after trailing |)
        const data = cells.slice(1, -1);
        if (data.length === 5) {
          rows.push({
            skill: data[0],
            ruleId: data[1],
            ownerRepo: data[2],
            version: data[3],
            status: data[4],
          });
        }
      }
    } else if (trimmed === "") {
      // Blank line ends the table
      inTable = false;
      headerSeen = false;
    }
  }
  return rows;
}

// ---------- tests ----------

describe("v7.8 SKILL_REGISTRY.md — schema integrity", () => {
  it("parses at least one row (registry is not empty or unparseable)", () => {
    const rows = parseRegistry();
    assert.ok(rows.length > 0, "SKILL_REGISTRY.md parsed 0 rows — schema mismatch or registry empty");
  });

  it("every row has non-empty version + status fields", () => {
    const rows = parseRegistry();
    const malformed: string[] = [];
    for (const r of rows) {
      if (!r.version || !r.status) {
        malformed.push(r.skill);
      }
    }
    assert.deepEqual(malformed, [], `registry rows missing version or status: ${malformed.join(", ")}`);
  });

  it("every row has a recognized status (stable | experimental | deprecated)", () => {
    const rows = parseRegistry();
    const validStatuses = new Set(["stable", "experimental", "deprecated"]);
    const invalid: string[] = [];
    for (const r of rows) {
      if (!validStatuses.has(r.status)) {
        invalid.push(`${r.skill}=${r.status}`);
      }
    }
    assert.deepEqual(invalid, [], `registry rows with invalid status: ${invalid.join(", ")}`);
  });
});

describe("v7.8 SKILL_REGISTRY.md ↔ skill-rules.json symmetry", () => {
  it("every skill-rules.json rule appears in SKILL_REGISTRY.md", () => {
    const rules = loadRules();
    const rows = parseRegistry();
    const registrySkills = new Set(rows.map((r) => r.skill));

    const orphans: string[] = [];
    for (const rule of rules) {
      if (!registrySkills.has(rule.skill)) {
        orphans.push(rule.skill);
      }
    }
    assert.deepEqual(
      orphans,
      [],
      `rules in skill-rules.json with no SKILL_REGISTRY.md row: ${orphans.join(", ")}`,
    );
  });

  it("every SKILL_REGISTRY.md row points at a registered rule", () => {
    const rules = loadRules();
    const rows = parseRegistry();
    const ruleSkills = new Set(rules.map((r) => r.skill));

    const phantoms: string[] = [];
    for (const r of rows) {
      if (!ruleSkills.has(r.skill)) {
        phantoms.push(r.skill);
      }
    }
    assert.deepEqual(
      phantoms,
      [],
      `SKILL_REGISTRY.md rows with no skill-rules.json rule: ${phantoms.join(", ")}`,
    );
  });

  it("every SKILL_REGISTRY.md row's activation_rule_id matches the actual rule id", () => {
    const rules = loadRules();
    const rows = parseRegistry();
    const rulesBySkill = new Map(rules.map((r) => [r.skill, r.id]));

    const mismatches: string[] = [];
    for (const r of rows) {
      const expectedRuleId = rulesBySkill.get(r.skill);
      if (expectedRuleId && expectedRuleId !== r.ruleId) {
        mismatches.push(r.skill);
      }
    }
    assert.deepEqual(
      mismatches,
      [],
      `registry rows with rule_id mismatching skill-rules.json: ${mismatches.join(", ")}`,
    );
  });

  it("rule count in skill-rules.json matches row count in SKILL_REGISTRY.md", () => {
    const rules = loadRules();
    const rows = parseRegistry();
    assert.equal(
      rows.length,
      rules.length,
      `count mismatch: skill-rules.json has ${rules.length} rules, SKILL_REGISTRY.md has ${rows.length} rows`,
    );
  });
});
