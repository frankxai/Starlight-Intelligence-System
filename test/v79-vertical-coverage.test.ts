/**
 * v7.9 Conformance Harness — vertical coverage symmetry
 *
 * Companion to:
 *   - test/v76.test.ts (agent registry symmetry, frontmatter completeness)
 *   - test/v77-skill-rules.test.ts (skill-rules.json ↔ skills/**\/*.md symmetry)
 *   - test/v78-skill-registry.test.ts (SKILL_REGISTRY.md ↔ skill-rules.json symmetry)
 *
 * Guards the symmetry between STACK.md's declared 10 universal Intelligence
 * Systems + Domain Sub-Stack Tier and disk reality at `verticals/<slug>/`.
 *
 * Every declared-live vertical must carry the 7-file contract:
 *   README.md, SKILL.md, AGENTS.md, MEMORY.md, STACK.md, CANON.md, SOUL.md
 *
 * EXEMPT_VERTICALS is a debt-ledger for verticals declared "live" in STACK.md
 * but not yet authored. Each exempt entry has:
 *   - reason (Path A authorless / pending authoring / cross-cutting)
 *   - missing files
 *   - un-park trigger (when this exemption should resolve)
 *
 * Goal state: empty EXEMPT_VERTICALS. Adding to the list is technical debt
 * acknowledged with a documented un-park trigger. Removing a vertical from
 * the list requires authoring the 7-file contract.
 *
 * Ship-then-constrain pattern: this test fires on day-1 to expose the
 * substrate-honesty gap (9 of 13 verticals declared live but incomplete).
 * Per `feedback_audit_metrics_vs_cause` — the test is the structural
 * exposure, not the framing of "Tier 2b/c/d author 3 verticals" which
 * undercounts the actual debt by 3x.
 *
 * SECURITY NOTE: per /openclaw-audit CRITICAL 2, NO assertion interpolates
 * raw fixture content into error messages. Trusted inputs only.
 *
 * ---
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 * - Substrate: starlightintelligence.org/protocol
 * - Layers used: [file-contract, attestation]
 * - Generated: 2026-05-06
 * ---
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { repoRootFromTestFile } from "./_lib/repo.js";

const REPO_ROOT = repoRootFromTestFile(import.meta.url);
const VERTICALS_DIR = join(REPO_ROOT, "verticals");

// ---------- canonical 7-file vertical contract ----------

const REQUIRED_FILES = [
  "README.md",
  "SKILL.md",
  "AGENTS.md",
  "MEMORY.md",
  "STACK.md",
  "CANON.md",
  "SOUL.md",
] as const;

// ---------- declared-live verticals (per STACK.md + Domain Sub-Stack Tier) ----------

/**
 * 9 universal Intelligence Systems that map to a `verticals/<slug>/` path.
 * (10th IS is Starlight Orchestrator at `core/orchestrator/` — not a vertical.)
 *
 * Source: STACK.md table "The 10 Intelligence Systems" + § Domain sub-stacks.
 */
const UNIVERSAL_IS_VERTICALS: readonly string[] = [
  "self",
  "wealth",
  "family",
  "business",
  "creator",
  "secondbrain",
  "code",
  "voice-video",
  "brand",
];

/**
 * Domain Sub-Stack Tier verticals — concrete instantiations of the
 * /spawn-domain-stack pattern.
 */
const DOMAIN_SUB_STACKS: readonly string[] = [
  "people-intelligence",
  "sound-intelligence",
  "music-is",
  "energy-intelligence",
];

const DECLARED_LIVE_VERTICALS: readonly string[] = [
  ...UNIVERSAL_IS_VERTICALS,
  ...DOMAIN_SUB_STACKS,
];

// ---------- exempt verticals (debt-ledger) ----------

interface ExemptEntry {
  reason: string;
  missing: readonly string[];
  unpark: string;
}

/**
 * Each entry: a vertical slug → why it's exempt + missing files + un-park trigger.
 *
 * Goal: empty Map. Removing an entry requires authoring the missing 7-file
 * contract files for that vertical (W19 Tier 2b/c/d for the substrate-lie
 * cluster).
 *
 * Discovered 2026-05-06: 9 of 13 declared-live verticals are substrate-lies
 * (only README + sometimes MEMORY on disk). The W19 sprint Tier 2b/c/d named
 * 3 of them (code, voice-video, family); this test exposes the other 6
 * (self, wealth, business, creator, secondbrain, brand).
 */
const EXEMPT_VERTICALS: ReadonlyMap<string, ExemptEntry> = new Map([
  // Substrate-lie cluster: declared live in 10-IS but only stub on disk.
  // W19 Tier 2b/c/d names a subset; the rest are post-W19 authoring debt.
  [
    "self",
    {
      reason:
        "declared live in 10-IS but only README + MEMORY on disk; full 7-file contract pending authoring",
      missing: ["SKILL.md", "AGENTS.md", "STACK.md", "CANON.md", "SOUL.md"],
      unpark: "when Self IS vertical authoring ships (post-W19)",
    },
  ],
  [
    "wealth",
    {
      reason:
        "declared live in 10-IS but only README + MEMORY on disk; full 7-file contract pending authoring",
      missing: ["SKILL.md", "AGENTS.md", "STACK.md", "CANON.md", "SOUL.md"],
      unpark: "when Wealth IS vertical authoring ships (post-W19)",
    },
  ],
  [
    "family",
    {
      reason:
        "declared live in 10-IS but only README on disk; W19 Tier 2d authoring queued",
      missing: ["SKILL.md", "AGENTS.md", "MEMORY.md", "STACK.md", "CANON.md", "SOUL.md"],
      unpark: "W19 Tier 2d ship — Family vertical authoring",
    },
  ],
  [
    "business",
    {
      reason:
        "declared live in 10-IS but only README + MEMORY on disk; full 7-file contract pending authoring",
      missing: ["SKILL.md", "AGENTS.md", "STACK.md", "CANON.md", "SOUL.md"],
      unpark: "when Business IS vertical authoring ships (post-W19)",
    },
  ],
  [
    "creator",
    {
      reason:
        "declared live in 10-IS but only README + MEMORY on disk; full 7-file contract pending authoring",
      missing: ["SKILL.md", "AGENTS.md", "STACK.md", "CANON.md", "SOUL.md"],
      unpark: "when Creator IS vertical authoring ships (post-W19)",
    },
  ],
  [
    "secondbrain",
    {
      reason:
        "declared live in 10-IS but only README + MEMORY on disk; full 7-file contract pending authoring",
      missing: ["SKILL.md", "AGENTS.md", "STACK.md", "CANON.md", "SOUL.md"],
      unpark: "when Second Brain IS vertical authoring ships (post-W19)",
    },
  ],
  [
    "code",
    {
      reason: "declared live in 10-IS but only README on disk; W19 Tier 2b authoring queued",
      missing: ["SKILL.md", "AGENTS.md", "MEMORY.md", "STACK.md", "CANON.md", "SOUL.md"],
      unpark: "W19 Tier 2b ship — Code IS vertical authoring",
    },
  ],
  [
    "voice-video",
    {
      reason: "declared live in 10-IS but only README on disk; W19 Tier 2c authoring queued",
      missing: ["SKILL.md", "AGENTS.md", "MEMORY.md", "STACK.md", "CANON.md", "SOUL.md"],
      unpark: "W19 Tier 2c ship — Voice & Video IS vertical authoring",
    },
  ],
  [
    "brand",
    {
      reason:
        "declared live in 10-IS but only README + MEMORY on disk; full 7-file contract pending authoring",
      missing: ["SKILL.md", "AGENTS.md", "STACK.md", "CANON.md", "SOUL.md"],
      unpark: "when Brand IS vertical authoring ships (post-W19)",
    },
  ],
  // Second-tier substrate-lies: substantively-built but skipped SKILL.md.
  // Frank decides at debt-resolution: author SKILL.md OR relax contract for
  // domain sub-stacks (where skill lives per-sub-system instead of per-vertical).
  [
    "music-is",
    {
      reason:
        "Domain Sub-Stack with 11 files + AGENTS + CANON + SOUL + STACK on disk but no top-level SKILL.md (per-sub-system skills exist under skills/music-is/)",
      missing: ["SKILL.md"],
      unpark:
        "either author SKILL.md as composition-of-sub-system-skills, OR amend contract to make SKILL.md optional for sub-stacks (decision deferred)",
    },
  ],
  [
    "energy-intelligence",
    {
      reason:
        "Domain Sub-Stack with 9 files + AGENTS + CANON + SOUL + STACK on disk but no top-level SKILL.md (per-sub-system skills exist under skills/energy-intelligence/)",
      missing: ["SKILL.md"],
      unpark: "same decision as music-is — author SKILL.md OR relax contract for sub-stacks",
    },
  ],
]);

// ---------- helpers ----------

function missingFilesFor(slug: string): string[] {
  const dir = join(VERTICALS_DIR, slug);
  if (!existsSync(dir)) {
    return Array.from(REQUIRED_FILES);
  }
  return REQUIRED_FILES.filter((f) => !existsSync(join(dir, f)));
}

// ---------- tests ----------

describe("v7.9 vertical coverage — declared-live ↔ disk symmetry", () => {
  it("every declared-live vertical exists as a directory under verticals/", () => {
    const missing: string[] = [];
    for (const slug of DECLARED_LIVE_VERTICALS) {
      if (!existsSync(join(VERTICALS_DIR, slug))) {
        missing.push(slug);
      }
    }
    assert.deepEqual(
      missing,
      [],
      `verticals declared in STACK.md but missing from disk: ${missing.join(", ")}`,
    );
  });

  it("every well-formed vertical (not in EXEMPT_VERTICALS) carries the 7-file contract", () => {
    const violations: string[] = [];
    for (const slug of DECLARED_LIVE_VERTICALS) {
      if (EXEMPT_VERTICALS.has(slug)) continue;
      const missing = missingFilesFor(slug);
      if (missing.length > 0) {
        violations.push(`${slug}(missing: ${missing.join(",")})`);
      }
    }
    assert.deepEqual(
      violations,
      [],
      `non-exempt verticals failing 7-file contract: ${violations.join("; ")}`,
    );
  });

  it("every EXEMPT_VERTICALS entry actually exists on disk (no ghost exemptions)", () => {
    const ghosts: string[] = [];
    for (const slug of EXEMPT_VERTICALS.keys()) {
      if (!existsSync(join(VERTICALS_DIR, slug))) {
        ghosts.push(slug);
      }
    }
    assert.deepEqual(
      ghosts,
      [],
      `EXEMPT_VERTICALS entries with no directory: ${ghosts.join(", ")}`,
    );
  });

  it("every EXEMPT_VERTICALS entry's `missing` field accurately reflects current disk state", () => {
    // If a vertical's missing list says SKILL.md is absent but it's actually on
    // disk, the exemption is stale and must be updated (or the vertical promoted
    // out of the exempt list).
    const stale: string[] = [];
    for (const [slug, entry] of EXEMPT_VERTICALS) {
      const actualMissing = new Set(missingFilesFor(slug));
      const declaredMissing = new Set(entry.missing);
      // Stale if declared missing files are actually present
      const present = entry.missing.filter((f) => !actualMissing.has(f));
      if (present.length > 0) {
        stale.push(`${slug}(declared missing but present: ${present.join(",")})`);
      }
    }
    assert.deepEqual(
      stale,
      [],
      `EXEMPT_VERTICALS entries with stale 'missing' fields: ${stale.join("; ")}`,
    );
  });
});

describe("v7.9 vertical coverage — debt-ledger guardrails", () => {
  it("EXEMPT_VERTICALS size <= 11 (substrate-lie ceiling — discovered 2026-05-06)", () => {
    // Hard ceiling: 11 exemptions at v79 ship time = 9 stub verticals (only
    // README ± MEMORY) + 2 substantively-built but missing top-level SKILL.md
    // (music-is, energy-intelligence). If this grows, someone added a
    // vertical-as-stub instead of authoring it. If this shrinks, an exemption
    // was retired (good — celebrate). Either direction is intentional.
    assert.ok(
      EXEMPT_VERTICALS.size <= 11,
      `EXEMPT_VERTICALS grew past 11 entries (size: ${EXEMPT_VERTICALS.size}) — author or exempt-with-trigger, but no silent additions`,
    );
  });

  it("every EXEMPT_VERTICALS entry has non-empty reason + unpark trigger", () => {
    const malformed: string[] = [];
    for (const [slug, entry] of EXEMPT_VERTICALS) {
      if (!entry.reason || !entry.unpark) {
        malformed.push(slug);
      }
    }
    assert.deepEqual(
      malformed,
      [],
      `EXEMPT_VERTICALS entries with missing reason or unpark trigger: ${malformed.join(", ")}`,
    );
  });
});
