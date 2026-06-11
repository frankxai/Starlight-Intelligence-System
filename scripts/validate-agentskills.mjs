#!/usr/bin/env node
/**
 * scripts/validate-agentskills.mjs
 *
 * Standalone validator for agentskills.io conformance across skills/**\/SKILL.md
 * and skills/**\/*.md (flat-layout skills).
 *
 * Checks (per the agentskills.io open standard, Dec 2025):
 *   1. FRONTMATTER — every skill file must have YAML frontmatter (--- delimiters)
 *   2. NAME FIELD — `name:` must be present
 *   3. NAME FORMAT — must match [a-z0-9/-]+ (lowercase letters, numbers, hyphens;
 *      slashes are accepted as domain-namespace separators used by SIS convention)
 *   4. NAME LENGTH — max 64 chars
 *   5. DESCRIPTION FIELD — `description:` must be present
 *   6. DESCRIPTION LENGTH — max 1024 chars
 *   7. BODY LINE COUNT — should be ≤500 lines (warning, not error)
 *
 * Directory-shape note: the standard expects each skill as a directory containing
 * SKILL.md. SIS uses a mixed layout — some skills are flat .md files, others are
 * subdirectory/SKILL.md. The flat-file shape is an architectural deviation from
 * the standard's directory model. This validator checks frontmatter conformance
 * regardless of layout shape; the directory-shape gap is documented in the output
 * but does NOT raise an exit-code violation (it is structural-not-fixable in this
 * pass because SIS loaders depend on the flat-file paths registered in
 * skill-rules.json).
 *
 * Exit code: 0 = all checks pass (warnings printed but do not fail)
 *            1 = one or more violations found
 *
 * Usage:
 *   node scripts/validate-agentskills.mjs
 *   node scripts/validate-agentskills.mjs --warn-only   # exit 0 even on violations
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const SKILLS_DIR = join(REPO_ROOT, "skills");

const WARN_ONLY = process.argv.includes("--warn-only");

// Meta-files at the root of skills/ that are not skill definitions.
const META_FILES = new Set(["SKILL_ARCHITECTURE.md", "SKILL_REGISTRY.md"]);

// Directories whose .md children are reference documents, not skill definitions.
const REFERENCE_DIRS = new Set(["references", "assets"]);

/**
 * Walk skills/ recursively, collecting .md file paths relative to SKILLS_DIR.
 * Excludes `references/` and `assets/` subtrees (non-skill content).
 */
function walkSkills(dir, prefix = "") {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = prefix ? `${prefix}/${entry}` : entry;
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (REFERENCE_DIRS.has(entry)) continue;
      results.push(...walkSkills(full, rel));
    } else if (entry.endsWith(".md")) {
      results.push(rel);
    }
  }
  return results;
}

/**
 * Parse YAML frontmatter from a markdown file.
 * Returns { found: false } if no frontmatter block, or { found: true, raw } with
 * the raw frontmatter string (between the --- delimiters, not including them).
 */
function parseFrontmatter(content) {
  if (!content.startsWith("---")) return { found: false };
  const end = content.indexOf("\n---", 3);
  if (end === -1) return { found: false };
  const raw = content.slice(3, end);
  return { found: true, raw };
}

/**
 * Extract a scalar value for a given key from raw YAML frontmatter.
 * Handles single-line values and simple multi-line folded/literal blocks
 * (reads until the next top-level key or end of string).
 * Returns null if the key is not present.
 */
function extractField(raw, key) {
  const pattern = new RegExp(`^${key}\\s*:\\s*(.*)`, "m");
  const m = raw.match(pattern);
  if (!m) return null;
  let value = m[1].trim();
  if (!value) {
    // Multi-line value — collect continuation lines (indented)
    const lines = raw.split("\n");
    const keyLineIdx = lines.findIndex((l) => new RegExp(`^${key}\\s*:`).test(l));
    const continuation = [];
    for (let i = keyLineIdx + 1; i < lines.length; i++) {
      if (/^\s+/.test(lines[i])) {
        continuation.push(lines[i].trim());
      } else {
        break;
      }
    }
    value = continuation.join(" ").trim();
  }
  return value || null;
}

// ---------- validation ----------

const NAME_PATTERN = /^[a-z0-9/-]+$/;
const NAME_MAX = 64;
const DESC_MAX = 1024;
const BODY_LINE_WARN = 500;

/**
 * @typedef {{ file: string, rule: string, detail: string }} Violation
 */

function validate() {
  const allFiles = walkSkills(SKILLS_DIR);
  // Filter meta-files that live at the root of skills/
  const skillFiles = allFiles.filter((rel) => !META_FILES.has(rel));

  const violations = [];
  const warnings = [];
  let flatCount = 0;
  let dirCount = 0;

  for (const rel of skillFiles.sort()) {
    const absPath = join(SKILLS_DIR, rel);
    const content = readFileSync(absPath, "utf8");
    const lines = content.split("\n");

    // Directory-shape accounting
    if (rel.endsWith("/SKILL.md") || rel.endsWith("\\SKILL.md")) {
      dirCount++;
    } else {
      flatCount++;
    }

    // Rule 1: Frontmatter present
    const { found, raw } = parseFrontmatter(content);
    if (!found) {
      violations.push({
        file: `skills/${rel}`,
        rule: "MISSING_FRONTMATTER",
        detail: "no YAML frontmatter block (--- delimiters) found",
      });
      continue; // can't check downstream fields without frontmatter
    }

    // Rule 2: name field present
    const name = extractField(raw, "name");
    if (!name) {
      violations.push({
        file: `skills/${rel}`,
        rule: "MISSING_NAME",
        detail: 'frontmatter has no "name:" field',
      });
    } else {
      // Rule 3: name format
      if (!NAME_PATTERN.test(name)) {
        violations.push({
          file: `skills/${rel}`,
          rule: "NAME_FORMAT",
          detail: `name "${name}" contains characters outside [a-z0-9/-]`,
        });
      }
      // Rule 4: name length
      if (name.length > NAME_MAX) {
        violations.push({
          file: `skills/${rel}`,
          rule: "NAME_TOO_LONG",
          detail: `name is ${name.length} chars (max ${NAME_MAX}): "${name}"`,
        });
      }
    }

    // Rule 5: description field present
    const desc = extractField(raw, "description");
    if (!desc) {
      violations.push({
        file: `skills/${rel}`,
        rule: "MISSING_DESCRIPTION",
        detail: 'frontmatter has no "description:" field',
      });
    } else {
      // Rule 6: description length
      if (desc.length > DESC_MAX) {
        violations.push({
          file: `skills/${rel}`,
          rule: "DESCRIPTION_TOO_LONG",
          detail: `description is ${desc.length} chars (max ${DESC_MAX})`,
        });
      }
    }

    // Rule 7: body line count (warning, not error)
    if (lines.length > BODY_LINE_WARN) {
      warnings.push({
        file: `skills/${rel}`,
        rule: "BODY_TOO_LONG",
        detail: `${lines.length} lines (recommended ≤${BODY_LINE_WARN})`,
      });
    }
  }

  // ---------- report ----------

  if (warnings.length > 0) {
    console.log(`\n⚠  WARNINGS (${warnings.length}):`);
    for (const w of warnings) {
      console.log(`  [${w.rule}] ${w.file}`);
      console.log(`    → ${w.detail}`);
    }
  }

  if (violations.length > 0) {
    console.log(`\n✗  VIOLATIONS (${violations.length}):`);
    for (const v of violations) {
      console.log(`  [${v.rule}] ${v.file}`);
      console.log(`    → ${v.detail}`);
    }
  }

  // Directory-shape gap report (informational, not a violation)
  const totalSkills = skillFiles.length;
  console.log(`\n── Directory-shape assessment ──────────────────────────────`);
  console.log(`  Total skill files scanned : ${totalSkills}`);
  console.log(`  Standard shape (dir/SKILL.md): ${dirCount}`);
  console.log(`  SIS flat-file shape (*.md)   : ${flatCount}`);
  if (flatCount > 0) {
    console.log(`  Gap: ${flatCount} flat-file skills deviate from the agentskills.io`);
    console.log(`       directory-model (each skill = a directory containing SKILL.md).`);
    console.log(`       This is structural — flat paths are registered in skill-rules.json`);
    console.log(`       and cannot be restructured in a conformance-only pass.`);
    console.log(`       Unpark trigger: refactor skill-rules.json loader to resolve`);
    console.log(`       directory-layout skills; migrate flat files then.`);
  } else {
    console.log(`  All skills use the standard directory layout. ✓`);
  }
  console.log(`────────────────────────────────────────────────────────────`);

  if (violations.length === 0) {
    console.log(`\n✓  All ${totalSkills} skills pass agentskills.io conformance checks.\n`);
    return 0;
  }

  console.log(
    `\nFailed: ${violations.length} violation(s) in ${totalSkills} skills.\n`,
  );
  return WARN_ONLY ? 0 : 1;
}

process.exit(validate());
