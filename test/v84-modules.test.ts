/**
 * v8.4 — Module Registry substrate symmetry
 *
 * Companion to test/v76+v77+v78+v79+v80+v81+v82+v83 (the substrate symmetry
 * cascade). Guards the symmetry between src/modules.ts and:
 *   - STACK.md (the locked 10-IS taxonomy — universal-is modules must map back)
 *   - verticals/ directory (domain-stack modules must have a real on-disk vertical)
 *
 * EXEMPT_MODULES is a deliberate technical-debt ledger. Adding a module to
 * modules.ts without a corresponding STACK.md row or verticals/ directory
 * means: ship the upstream, OR justify the exemption here with reason +
 * un-park trigger.
 *
 * Background: Track A v0.1 (2026-05-12) introduced src/modules.ts as the
 * runtime control plane for the 10 Intelligence Systems + 3 domain sub-stacks
 * + 2 private modules + 1 future module. This test catches drift between
 * the runtime registry and the substrate taxonomy. Goal state: empty
 * EXEMPT_MODULES.
 *
 * SECURITY NOTE: error messages interpolate only the module IDs (which are
 * trusted code-canonical strings from src/modules.ts), never raw filesystem
 * paths or user-supplied content.
 *
 * Built on SIP — operational tier (test infrastructure)
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { repoRootFromTestFile } from "./_lib/repo.js";
import { listModules } from "../src/modules.js";

const REPO_ROOT = repoRootFromTestFile(import.meta.url);
const STACK_MD = join(REPO_ROOT, "STACK.md");
const VERTICALS_DIR = join(REPO_ROOT, "verticals");

// ---------- exempt modules (technical-debt ledger) ----------
//
// Each entry: { id, reason, unparkTrigger }. Goal state: empty.

interface ExemptEntry {
  id: string;
  reason: string;
  unparkTrigger: string;
}

const EXEMPT_MODULES: readonly ExemptEntry[] = [
  // Goal state: empty. Add entries here ONLY with reason + un-park trigger.
];

// ---------- valid module kinds (must match src/modules.ts IntelligenceModuleDefinition.kind) ----------

const VALID_KINDS = new Set<string>([
  "core",
  "universal-is",
  "domain-stack",
  "private-module",
  "future-module",
]);

// ---------- helpers ----------

function loadStackText(): string {
  return readFileSync(STACK_MD, "utf8");
}

/**
 * Universal-IS modules must map to a row in STACK.md's 10-IS table.
 * The mapping is by SUBSTRATE-NAME (e.g., "Code IS" / "Second Brain IS"),
 * not by module id — module ids are kebab-case implementation labels.
 */
const UNIVERSAL_IS_TO_STACK_NAME: Record<string, string> = {
  "code-is": "Code IS",
  "second-brain-is": "Second Brain IS",
  "business-is": "Business IS",
  "wealth-is": "Wealth IS",
  "voice-video-is": "Voice & Video IS",
};

/**
 * Domain-stack modules must have a corresponding directory under verticals/.
 * The directory name is the canonical vertical slug.
 */
const DOMAIN_STACK_TO_VERTICAL: Record<string, string> = {
  "people-is": "people-intelligence",
  "music-is": "music-is",
  "sound-is": "sound-intelligence",
};

// ---------- tests ----------

describe("v8.4 — modules.ts kind enum (substrate invariant)", () => {
  it("every module.kind is in VALID_KINDS", () => {
    const modules = listModules(REPO_ROOT);
    const invalid = modules
      .filter((m) => !VALID_KINDS.has(m.kind))
      .map((m) => `${m.id} (kind=${m.kind})`);
    assert.deepEqual(
      invalid,
      [],
      `modules with invalid kind: ${invalid.join(", ")}`,
    );
  });

  it("module ids are unique", () => {
    const modules = listModules(REPO_ROOT);
    const ids = modules.map((m) => m.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.deepEqual(
      dupes,
      [],
      `duplicate module ids: ${[...new Set(dupes)].join(", ")}`,
    );
  });
});

describe("v8.4 — modules.ts ↔ STACK.md (universal-is symmetry)", () => {
  it("every universal-is module maps to a name present in STACK.md (or is exempted)", () => {
    const modules = listModules(REPO_ROOT);
    const universalIs = modules.filter((m) => m.kind === "universal-is");
    const exemptIds = new Set(EXEMPT_MODULES.map((e) => e.id));
    const stackText = loadStackText();

    const drifts: string[] = [];
    for (const m of universalIs) {
      if (exemptIds.has(m.id)) continue;
      const expectedStackName = UNIVERSAL_IS_TO_STACK_NAME[m.id];
      if (!expectedStackName) {
        drifts.push(`${m.id} (no STACK.md mapping declared — add to UNIVERSAL_IS_TO_STACK_NAME or EXEMPT_MODULES)`);
        continue;
      }
      if (!stackText.includes(expectedStackName)) {
        drifts.push(`${m.id} → expected "${expectedStackName}" not found in STACK.md`);
      }
    }
    assert.deepEqual(
      drifts,
      [],
      `universal-is modules drifting from STACK.md: ${drifts.join("; ")}`,
    );
  });
});

describe("v8.4 — modules.ts ↔ verticals/ (domain-stack symmetry)", () => {
  it("every domain-stack module has a corresponding verticals/<slug>/ directory (or is exempted)", () => {
    const modules = listModules(REPO_ROOT);
    const domainStacks = modules.filter((m) => m.kind === "domain-stack");
    const exemptIds = new Set(EXEMPT_MODULES.map((e) => e.id));

    const drifts: string[] = [];
    for (const m of domainStacks) {
      if (exemptIds.has(m.id)) continue;
      const expectedSlug = DOMAIN_STACK_TO_VERTICAL[m.id];
      if (!expectedSlug) {
        drifts.push(`${m.id} (no verticals/ mapping declared — add to DOMAIN_STACK_TO_VERTICAL or EXEMPT_MODULES)`);
        continue;
      }
      const verticalPath = join(VERTICALS_DIR, expectedSlug);
      if (!existsSync(verticalPath)) {
        drifts.push(`${m.id} → expected verticals/${expectedSlug}/ not found on disk`);
      }
    }
    assert.deepEqual(
      drifts,
      [],
      `domain-stack modules drifting from verticals/: ${drifts.join("; ")}`,
    );
  });
});

describe("v8.4 — modules.ts default-enabled invariants", () => {
  it("private-module entries are default-disabled (privacy substrate invariant)", () => {
    const modules = listModules(REPO_ROOT);
    const privateModules = modules.filter((m) => m.kind === "private-module");
    const leaks = privateModules
      .filter((m) => m.defaultEnabled === true)
      .map((m) => m.id);
    assert.deepEqual(
      leaks,
      [],
      `private-module entries must default to disabled (privacy substrate): ${leaks.join(", ")}`,
    );
  });

  it("future-module entries are default-disabled (explicit-activation substrate invariant)", () => {
    const modules = listModules(REPO_ROOT);
    const futureModules = modules.filter((m) => m.kind === "future-module");
    const leaks = futureModules
      .filter((m) => m.defaultEnabled === true)
      .map((m) => m.id);
    assert.deepEqual(
      leaks,
      [],
      `future-module entries must default to disabled (explicit-activation only): ${leaks.join(", ")}`,
    );
  });
});

describe("v8.4 — debt-ledger guardrails", () => {
  it("EXEMPT_MODULES size <= 3 (substrate-lie ceiling)", () => {
    assert.ok(
      EXEMPT_MODULES.length <= 3,
      `EXEMPT_MODULES ceiling exceeded (size: ${EXEMPT_MODULES.length}) — backfill instead of exempting`,
    );
  });

  it("every EXEMPT_MODULES entry has non-empty reason + unparkTrigger", () => {
    const malformed = EXEMPT_MODULES.filter(
      (e) => !e.reason || !e.unparkTrigger,
    ).map((e) => e.id);
    assert.deepEqual(
      malformed,
      [],
      `EXEMPT_MODULES entries missing reason/unparkTrigger: ${malformed.join(", ")}`,
    );
  });

  it("every EXEMPT_MODULES entry references a real module id", () => {
    const modules = listModules(REPO_ROOT);
    const moduleIds = new Set(modules.map((m) => m.id));
    const ghosts = EXEMPT_MODULES.filter((e) => !moduleIds.has(e.id)).map(
      (e) => e.id,
    );
    assert.deepEqual(
      ghosts,
      [],
      `EXEMPT_MODULES entries with no matching module id: ${ghosts.join(", ")}`,
    );
  });
});
