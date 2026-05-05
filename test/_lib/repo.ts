/**
 * test/_lib/repo.ts — shared test helpers for substrate symmetry tests.
 *
 * Catches the v76+v77 (and future v78+) duplicate-fn pattern: every test file
 * had its own __filename/__dirname/REPO_ROOT triplet plus a hand-rolled skill
 * tree walker. Extracted here as the single source of truth.
 *
 * Adopt incrementally: v77 uses these helpers as of 2026-05-05 (commit
 * applying this change). v76 + v73-v75 + substrate.test.ts continue to
 * use their inline copies until next natural edit — no big-bang refactor.
 *
 * Built on SIP — operational tier (test infrastructure)
 */

import { readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Resolve REPO_ROOT from a test file's import.meta.url. */
export function repoRootFromTestFile(metaUrl: string): string {
  const __filename = fileURLToPath(metaUrl);
  const __dirname = dirname(__filename);
  return resolve(__dirname, "..");
}

export interface WalkSkillsOptions {
  /** Exclude files under any `references/` subdirectory. v76 + v77 both want this. */
  excludeReferences?: boolean;
}

/**
 * Walk skills/ recursively, return relative paths to .md files.
 * Sorted ascending. Path separators normalized to forward-slash.
 */
export function walkSkills(skillsDir: string, opts: WalkSkillsOptions = {}): string[] {
  const { excludeReferences = true } = opts;
  const results: string[] = [];

  function walk(dir: string, prefix: string): void {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const rel = prefix ? `${prefix}/${entry}` : entry;
      const stat = statSync(full);
      if (stat.isDirectory()) {
        if (excludeReferences && entry === "references") continue;
        walk(full, rel);
      } else if (entry.endsWith(".md")) {
        results.push(rel);
      }
    }
  }

  walk(skillsDir, "");
  return results.sort();
}

/**
 * Map a skill file's relative path to its canonical skill-key.
 *   skills/foo/bar.md       -> foo/bar
 *   skills/foo/bar/SKILL.md -> foo/bar
 * Returns null for files that don't represent a skill (README, architecture docs).
 */
export function fileToSkillKey(rel: string): string | null {
  if (rel === "SKILL_ARCHITECTURE.md") return null;
  if (rel.endsWith("/README.md")) return null;
  if (rel.includes("/references/")) return null;
  if (rel.endsWith("/SKILL.md")) return rel.slice(0, -"/SKILL.md".length);
  if (rel.endsWith(".md")) return rel.slice(0, -".md".length);
  return null;
}

/**
 * List all agent files under agents/ (excluding AGENT_REGISTRY.md).
 * Sorted ascending.
 */
export function listAgentFiles(agentsDir: string): string[] {
  return readdirSync(agentsDir)
    .filter((f) => f.endsWith(".md") && f !== "AGENT_REGISTRY.md")
    .sort();
}
