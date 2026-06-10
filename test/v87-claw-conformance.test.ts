/**
 * v8.7 Claw Conformance Harness
 *
 * Enforces the OpenClaw Security Model's headline invariant:
 * every operational Claw must declare `mutation_default: false`
 * in its CLAW.md contract file.
 *
 * The `mutation_default: false` constraint is the primary safety gate that
 * prevents Claws from silently mutating user files. This test converts that
 * prose invariant (CLAWS.md § OpenClaw Security Model) into an executable
 * check so CI catches violations before they reach the registry.
 *
 * Documented exceptions (explicit, bounded):
 *   - claws/bootstrap/   — mutation_default: true is intentional; Bootstrap
 *                          is the one Claw whose job is to write the initial
 *                          SIS workspace (files must be created on first run).
 *   - claws/openclaw-registry/ — contains REGISTRY.md only (a curated index,
 *                          not an operational Claw); no CLAW.md is expected.
 *
 * SECURITY NOTE: per /openclaw-audit CRITICAL 2, no assertion interpolates
 * raw CLAW.md content into error messages. Only file paths and field names.
 *
 * ---
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 * - Substrate: starlightintelligence.org/protocol v1.1.1
 * - Layers used: [file-contract, attestation]
 * - Generated: 2026-06-10
 * ---
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dirname, "..");
const CLAWS_DIR = join(REPO_ROOT, "claws");

/**
 * Directories that intentionally have no CLAW.md — they are not operational
 * Claws. Update this list only with an explicit justification comment.
 */
const NON_CLAW_DIRS = new Set([
  "openclaw-registry", // curated skill index (REGISTRY.md), not an operational Claw
]);

/**
 * Claws that intentionally set mutation_default: true. Each entry must have
 * a justification. Goal: keep this list at exactly 1 (bootstrap only).
 */
const MUTATION_TRUE_ALLOWLIST = new Map<string, string>([
  ["bootstrap", "Bootstrap writes the initial SIS workspace — creating files is its documented purpose"],
]);

/** List all subdirectory names under claws/. */
function listClawDirs(): string[] {
  if (!existsSync(CLAWS_DIR)) return [];
  return readdirSync(CLAWS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

test("v87: every operational Claw directory has a CLAW.md", () => {
  const dirs = listClawDirs();
  assert.ok(dirs.length > 0, "claws/ directory is empty or missing");

  const missingClawMd: string[] = [];
  for (const dir of dirs) {
    if (NON_CLAW_DIRS.has(dir)) continue; // documented non-Claw dirs
    const clawMdPath = join(CLAWS_DIR, dir, "CLAW.md");
    if (!existsSync(clawMdPath)) {
      missingClawMd.push(dir);
    }
  }
  assert.deepEqual(
    missingClawMd,
    [],
    `Claw directories missing CLAW.md: ${missingClawMd.join(", ")}`,
  );
});

test("v87: every operational Claw CLAW.md contains mutation_default field", () => {
  const dirs = listClawDirs();
  const missingField: string[] = [];

  for (const dir of dirs) {
    if (NON_CLAW_DIRS.has(dir)) continue;
    const clawMdPath = join(CLAWS_DIR, dir, "CLAW.md");
    if (!existsSync(clawMdPath)) continue; // caught by previous test
    const content = readFileSync(clawMdPath, "utf8");
    if (!/mutation_default\s*:/.test(content)) {
      missingField.push(dir);
    }
  }
  assert.deepEqual(
    missingField,
    [],
    `Claw CLAW.md files missing mutation_default field: ${missingField.join(", ")}`,
  );
});

test("v87: all operational Claws except bootstrap have mutation_default: false", () => {
  const dirs = listClawDirs();
  const violations: string[] = [];

  for (const dir of dirs) {
    if (NON_CLAW_DIRS.has(dir)) continue;
    if (MUTATION_TRUE_ALLOWLIST.has(dir)) continue; // documented exception
    const clawMdPath = join(CLAWS_DIR, dir, "CLAW.md");
    if (!existsSync(clawMdPath)) continue; // caught by earlier test
    const content = readFileSync(clawMdPath, "utf8");
    // Match "mutation_default: false" (with optional whitespace)
    if (!/mutation_default\s*:\s*false/.test(content)) {
      violations.push(dir);
    }
  }
  assert.deepEqual(
    violations,
    [],
    `Claws with mutation_default !== false (must add to MUTATION_TRUE_ALLOWLIST with justification): ${violations.join(", ")}`,
  );
});

test("v87: bootstrap CLAW.md has mutation_default: true (documented exception)", () => {
  // This test pins the bootstrap exception explicitly — if bootstrap ever
  // changes to false, this test reminds us to clean up the allowlist.
  const bootstrapPath = join(CLAWS_DIR, "bootstrap", "CLAW.md");
  assert.ok(existsSync(bootstrapPath), "claws/bootstrap/CLAW.md not found");
  const content = readFileSync(bootstrapPath, "utf8");
  assert.ok(
    /mutation_default\s*:\s*true/.test(content),
    "claws/bootstrap/CLAW.md should have mutation_default: true (documented exception — if changed, update MUTATION_TRUE_ALLOWLIST)",
  );
});

test("v87: MUTATION_TRUE_ALLOWLIST is bounded (ceiling: 1)", () => {
  // Hard ceiling: only bootstrap should be in the allowlist.
  // If someone adds a second entry to silence a test failure, this fires.
  assert.ok(
    MUTATION_TRUE_ALLOWLIST.size <= 1,
    `MUTATION_TRUE_ALLOWLIST grew to ${MUTATION_TRUE_ALLOWLIST.size} entries; ceiling is 1. Refactor the Claw instead of adding to this list.`,
  );
});

test("v87: NON_CLAW_DIRS entries actually exist on disk (no stale exemptions)", () => {
  const stale: string[] = [];
  for (const dir of NON_CLAW_DIRS) {
    if (!existsSync(join(CLAWS_DIR, dir))) stale.push(dir);
  }
  assert.deepEqual(stale, [], `Stale NON_CLAW_DIRS entries (directory not found): ${stale.join(", ")}`);
});
