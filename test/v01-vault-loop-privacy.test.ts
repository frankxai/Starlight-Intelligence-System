/**
 * Track A v0.1 — VaultLoop privacy contract test
 *
 * Per Proposal C (board verdict docs/boards/2026-05-11-v01-sis-shipping-bundle.md,
 * REVISE-C.2), entries with privacy: 'private' MUST NOT appear in any export
 * function, search result, attestation output, or knowledge-graph row.
 *
 * This is the substrate trust contract. If this test fails, privacy leakage
 * has been introduced — every VaultLoopEntry surface MUST route through the
 * canonical filters in src/vault-loop.ts.
 *
 * Structural test pattern:
 *   1. Build a fixture set covering all 3 privacy levels × all 9 stages
 *   2. Push through every canonical filter
 *   3. Assert 'private' entries are NEVER present in the output
 *   4. Assert 'private-shareable' entries are present ONLY on scoped-share
 *   5. Assert 'public' entries are present on every pathway
 *
 * The test also asserts the privacy contract function (privacyAllowsPathway)
 * matches the documented matrix, so a future regression in the rule table
 * fails before reaching downstream filters.
 *
 * SECURITY NOTE: per /openclaw-audit CRITICAL 2, no assertion interpolates
 * raw fixture content into error messages. Identifiers and counts only.
 *
 * ---
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 * - Substrate: starlightintelligence.org/protocol v1.1.1
 * - Layers used: [file-contract, sovereignty]
 * - Generated: 2026-05-11
 * ---
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { VaultLoopEntry, VaultLoopPrivacy, VaultLoopStage, VaultType } from "../src/types.js";
import {
  filterForExport,
  filterForSearch,
  filterForAttestation,
  filterForKnowledgeGraph,
  filterForScopedShare,
  privacyAllowsPathway,
  assessLoopStaleness,
} from "../src/vault-loop.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");

// ── Fixture set ────────────────────────────────────────────────────────────

const VAULTS: VaultType[] = ["strategic", "technical", "creative", "operational", "wisdom", "horizon"];
const STAGES: VaultLoopStage[] = [
  "desire",
  "gratitude",
  "visualization",
  "surrender",
  "intuition",
  "aligned_action",
  "evidence",
  "outcome",
  "proof",
];
const PRIVACY_LEVELS: VaultLoopPrivacy[] = ["private", "private-shareable", "public"];

const NOW = "2026-05-11T12:00:00.000Z";
const STALE_AT = "2026-06-10T12:00:00.000Z";

function mkEntry(
  id: string,
  privacy: VaultLoopPrivacy,
  stage: VaultLoopStage,
  vault: VaultType = "operational",
  parent: string | null = null,
  createdAt: string = NOW,
): VaultLoopEntry {
  return {
    id,
    vault,
    stage,
    privacy,
    parent_entry_id: parent,
    payload: "fixture payload (not load-bearing)",
    created_at: createdAt,
    created_by: "test-fixture",
    stale_at: STALE_AT,
  };
}

/** Build a comprehensive fixture: 3 privacy × 9 stages × 1 representative vault = 27 entries. */
function buildFixtureSet(): VaultLoopEntry[] {
  const out: VaultLoopEntry[] = [];
  let i = 0;
  for (const privacy of PRIVACY_LEVELS) {
    for (const stage of STAGES) {
      out.push(mkEntry(`entry_${++i}_${privacy}_${stage}`, privacy, stage));
    }
  }
  return out;
}

function privateIds(entries: readonly VaultLoopEntry[]): string[] {
  return entries.filter((e) => e.privacy === "private").map((e) => e.id);
}

function leaked(filtered: readonly VaultLoopEntry[]): string[] {
  return filtered.filter((e) => e.privacy === "private").map((e) => e.id);
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("v0.1 VaultLoop privacy — pathway permission matrix", () => {
  it("'private' is blocked on every public pathway and on scoped-share", () => {
    const pathways = ["export", "search", "attestation", "knowledge-graph", "scoped-share"] as const;
    for (const p of pathways) {
      assert.equal(
        privacyAllowsPathway("private", p),
        false,
        `privacy=private must NOT be allowed on pathway=${p}`,
      );
    }
  });

  it("'private-shareable' is blocked on default-public pathways, allowed only on scoped-share", () => {
    assert.equal(privacyAllowsPathway("private-shareable", "export"), false);
    assert.equal(privacyAllowsPathway("private-shareable", "search"), false);
    assert.equal(privacyAllowsPathway("private-shareable", "attestation"), false);
    assert.equal(privacyAllowsPathway("private-shareable", "knowledge-graph"), false);
    assert.equal(privacyAllowsPathway("private-shareable", "scoped-share"), true);
  });

  it("'public' is permitted on every pathway", () => {
    const pathways = ["export", "search", "attestation", "knowledge-graph", "scoped-share"] as const;
    for (const p of pathways) {
      assert.equal(
        privacyAllowsPathway("public", p),
        true,
        `privacy=public must be allowed on pathway=${p}`,
      );
    }
  });
});

describe("v0.1 VaultLoop privacy — canonical filters never leak 'private'", () => {
  const fixtures = buildFixtureSet();
  const totalPrivate = privateIds(fixtures).length;

  it(`fixture set contains exactly ${PRIVACY_LEVELS.length * STAGES.length} entries with ${STAGES.length} private`, () => {
    assert.equal(fixtures.length, PRIVACY_LEVELS.length * STAGES.length);
    assert.equal(totalPrivate, STAGES.length, "fixture set must include private entries to test the contract");
  });

  it("filterForExport produces ZERO private entries (substrate trust contract)", () => {
    const out = filterForExport(fixtures);
    const leakedIds = leaked(out);
    assert.deepEqual(
      leakedIds,
      [],
      `filterForExport leaked ${leakedIds.length} private entries — substrate trust contract violated`,
    );
  });

  it("filterForSearch produces ZERO private entries (substrate trust contract)", () => {
    const out = filterForSearch(fixtures);
    const leakedIds = leaked(out);
    assert.deepEqual(
      leakedIds,
      [],
      `filterForSearch leaked ${leakedIds.length} private entries — substrate trust contract violated`,
    );
  });

  it("filterForAttestation produces ZERO private entries (substrate trust contract)", () => {
    const out = filterForAttestation(fixtures);
    const leakedIds = leaked(out);
    assert.deepEqual(
      leakedIds,
      [],
      `filterForAttestation leaked ${leakedIds.length} private entries — substrate trust contract violated`,
    );
  });

  it("filterForKnowledgeGraph produces ZERO private entries (substrate trust contract)", () => {
    const out = filterForKnowledgeGraph(fixtures);
    const leakedIds = leaked(out);
    assert.deepEqual(
      leakedIds,
      [],
      `filterForKnowledgeGraph leaked ${leakedIds.length} private entries — substrate trust contract violated`,
    );
  });

  it("filterForScopedShare with named recipients produces ZERO private entries", () => {
    const out = filterForScopedShare(fixtures, ["alice@example.org", "bob@example.org"]);
    const leakedIds = leaked(out);
    assert.deepEqual(
      leakedIds,
      [],
      `filterForScopedShare leaked ${leakedIds.length} private entries — even scoped share blocks 'private'`,
    );
  });

  it("filterForScopedShare with empty recipient list returns empty (no consent → nothing shared)", () => {
    const out = filterForScopedShare(fixtures, []);
    assert.equal(out.length, 0, "scoped share with no recipients must return empty");
  });
});

describe("v0.1 VaultLoop privacy — pathway-specific privacy-shareable visibility", () => {
  const fixtures = buildFixtureSet();

  it("filterForExport excludes 'private-shareable' (it's not public)", () => {
    const out = filterForExport(fixtures);
    const shareablePresent = out.some((e) => e.privacy === "private-shareable");
    assert.equal(shareablePresent, false, "private-shareable must not appear in default export");
  });

  it("filterForSearch excludes 'private-shareable' (it's not public)", () => {
    const out = filterForSearch(fixtures);
    const shareablePresent = out.some((e) => e.privacy === "private-shareable");
    assert.equal(shareablePresent, false, "private-shareable must not appear in default search");
  });

  it("filterForAttestation excludes 'private-shareable' (attestation is public-facing)", () => {
    const out = filterForAttestation(fixtures);
    const shareablePresent = out.some((e) => e.privacy === "private-shareable");
    assert.equal(shareablePresent, false, "private-shareable must not appear in attestation output");
  });

  it("filterForKnowledgeGraph excludes 'private-shareable' (KG rows are queryable surface)", () => {
    const out = filterForKnowledgeGraph(fixtures);
    const shareablePresent = out.some((e) => e.privacy === "private-shareable");
    assert.equal(shareablePresent, false, "private-shareable must not appear in KG output");
  });

  it("filterForScopedShare INCLUDES 'private-shareable' (the only pathway that admits it)", () => {
    const out = filterForScopedShare(fixtures, ["alice@example.org"]);
    const shareablePresent = out.some((e) => e.privacy === "private-shareable");
    assert.equal(shareablePresent, true, "private-shareable MUST appear in scoped share output");
  });
});

describe("v0.1 VaultLoop privacy — public entries always pass", () => {
  const fixtures = buildFixtureSet();
  const expectedPublic = fixtures.filter((e) => e.privacy === "public").length;

  it("filterForExport includes all public entries", () => {
    const out = filterForExport(fixtures);
    const publicOut = out.filter((e) => e.privacy === "public").length;
    assert.equal(publicOut, expectedPublic);
  });

  it("filterForAttestation includes all public entries", () => {
    const out = filterForAttestation(fixtures);
    const publicOut = out.filter((e) => e.privacy === "public").length;
    assert.equal(publicOut, expectedPublic);
  });

  it("filterForKnowledgeGraph includes all public entries", () => {
    const out = filterForKnowledgeGraph(fixtures);
    const publicOut = out.filter((e) => e.privacy === "public").length;
    assert.equal(publicOut, expectedPublic);
  });
});

describe("v0.1 VaultLoop staleness — soft nudge for loops > 30 days without progression", () => {
  it("a loop whose latest stage is 'outcome' is NEVER stale (closed)", () => {
    const ancient = "2026-01-01T00:00:00.000Z";
    const ancientPlus1 = "2026-01-02T00:00:00.000Z";
    const entries: VaultLoopEntry[] = [
      mkEntry("root", "private", "desire", "operational", null, ancient),
      mkEntry("e2", "private", "outcome", "operational", "root", ancientPlus1),
    ];
    const out = assessLoopStaleness(entries, new Date("2026-05-11T00:00:00.000Z"));
    assert.equal(out.length, 1);
    assert.equal(out[0]?.isStale, false, "outcome-stage loop must not be stale (closed)");
  });

  it("a loop whose latest stage is 'proof' is NEVER stale (closed)", () => {
    const ancient = "2026-01-01T00:00:00.000Z";
    const ancientPlus1 = "2026-01-02T00:00:00.000Z";
    const entries: VaultLoopEntry[] = [
      mkEntry("root", "public", "desire", "horizon", null, ancient),
      mkEntry("e2", "public", "proof", "horizon", "root", ancientPlus1),
    ];
    const out = assessLoopStaleness(entries, new Date("2026-05-11T00:00:00.000Z"));
    assert.equal(out[0]?.isStale, false, "proof-stage loop must not be stale (closed)");
  });

  it("a loop whose latest stage is 'desire' and > 30 days old IS stale", () => {
    const ancient = "2026-01-01T00:00:00.000Z";
    const entries: VaultLoopEntry[] = [
      mkEntry("root", "private", "desire", "operational", null, ancient),
    ];
    const out = assessLoopStaleness(entries, new Date("2026-05-11T00:00:00.000Z"));
    assert.equal(out[0]?.isStale, true, "desire-only loop > 30d must be stale");
    assert.ok((out[0]?.daysSinceLatest ?? 0) > 30, "days since latest must exceed 30");
  });

  it("a loop with progression within 30 days is NOT stale", () => {
    const recent = "2026-05-01T00:00:00.000Z";
    const entries: VaultLoopEntry[] = [
      mkEntry("root", "private", "desire", "operational", null, "2026-01-01T00:00:00.000Z"),
      mkEntry("e2", "private", "gratitude", "operational", "root", recent),
    ];
    const out = assessLoopStaleness(entries, new Date("2026-05-11T00:00:00.000Z"));
    assert.equal(out[0]?.isStale, false, "loop with recent progression must not be stale");
  });

  it("stale-loop detection assesses by ROOT, not individual entries", () => {
    // Two distinct loops, one stale, one closed
    const ancient = "2026-01-01T00:00:00.000Z";
    const ancientPlus1 = "2026-01-02T00:00:00.000Z";
    const entries: VaultLoopEntry[] = [
      mkEntry("loop_a_root", "private", "desire", "operational", null, ancient),
      mkEntry("loop_b_root", "public", "desire", "horizon", null, ancient),
      mkEntry("loop_b_proof", "public", "proof", "horizon", "loop_b_root", ancientPlus1),
    ];
    const out = assessLoopStaleness(entries, new Date("2026-05-11T00:00:00.000Z"));
    assert.equal(out.length, 2, "must group by loop root, not flat entry count");
    const staleRoots = out.filter((s) => s.isStale).map((s) => s.loopRootId);
    assert.deepEqual(staleRoots, ["loop_a_root"], "only loop_a (no progression) must be flagged stale");
  });
});

describe("v0.1 VaultLoop schema — JSON Schema file integrity", () => {
  const SCHEMAS_DIR = join(REPO_ROOT, "packages", "core", "schemas");

  it("vault-loop-entry.schema.json exists and is valid JSON", () => {
    const text = readFileSync(join(SCHEMAS_DIR, "vault-loop-entry.schema.json"), "utf-8");
    const schema = JSON.parse(text);
    assert.equal(schema.title, "VaultLoopEntry");
    assert.equal(schema.type, "object");
    assert.equal(schema.additionalProperties, false);
  });

  it("schema declares all 9 required fields", () => {
    const text = readFileSync(join(SCHEMAS_DIR, "vault-loop-entry.schema.json"), "utf-8");
    const schema = JSON.parse(text);
    const required = (schema.required ?? []) as string[];
    for (const field of [
      "id",
      "vault",
      "stage",
      "privacy",
      "parent_entry_id",
      "payload",
      "created_at",
      "created_by",
      "stale_at",
    ]) {
      assert.ok(required.includes(field), `schema.required missing: ${field}`);
    }
  });

  it("schema enumerates exactly the 6 existing vaults (NOT a 7th vault)", () => {
    const text = readFileSync(join(SCHEMAS_DIR, "vault-loop-entry.schema.json"), "utf-8");
    const schema = JSON.parse(text);
    const vaultEnum = (schema.properties?.vault?.enum ?? []) as string[];
    assert.deepEqual(
      [...vaultEnum].sort(),
      ["creative", "horizon", "operational", "strategic", "technical", "wisdom"],
      "vault enum must be the 6 existing vaults — VaultLoopEntry is a record TYPE across vaults, not a 7th vault",
    );
  });

  it("schema enumerates all 9 stages in the loop sequence", () => {
    const text = readFileSync(join(SCHEMAS_DIR, "vault-loop-entry.schema.json"), "utf-8");
    const schema = JSON.parse(text);
    const stageEnum = (schema.properties?.stage?.enum ?? []) as string[];
    assert.deepEqual(
      stageEnum,
      [
        "desire",
        "gratitude",
        "visualization",
        "surrender",
        "intuition",
        "aligned_action",
        "evidence",
        "outcome",
        "proof",
      ],
      "stage enum must match the 9-stage Vault Loop sequence",
    );
  });

  it("schema enumerates exactly 3 privacy classifications", () => {
    const text = readFileSync(join(SCHEMAS_DIR, "vault-loop-entry.schema.json"), "utf-8");
    const schema = JSON.parse(text);
    const privacyEnum = (schema.properties?.privacy?.enum ?? []) as string[];
    assert.deepEqual(
      [...privacyEnum].sort(),
      ["private", "private-shareable", "public"],
      "privacy enum must match VaultLoopPrivacy union",
    );
  });
});
