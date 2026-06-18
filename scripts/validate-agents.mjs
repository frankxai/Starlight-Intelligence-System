#!/usr/bin/env node
/**
 * scripts/validate-agents.mjs
 *
 * Conformance and quality auditor for Starlight agent profiles under agents/
 *
 * Checks:
 *   1. FRONTMATTER — every agent profile must have YAML frontmatter (--- delimiters)
 *   2. REQUIRED FIELDS — frontmatter must define name, tier, domain, and voice
 *   3. ATTESTATION — must contain the attestation block ("Built on SIP" or "Starlight Intelligence Protocol")
 *   4. HEADERS — should contain key sections: Identity/Mission, Capabilities, Vault Access
 *   5. PLACEHOLDERS — should not contain raw unreplaced templating placeholders (e.g. {Name}, {domain})
 *
 * Exit code: 0 = all checks pass
 *            1 = one or more violations found
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const AGENTS_DIR = join(REPO_ROOT, "agents");

// Non-agent files under agents/
const META_FILES = new Set(["AGENT_REGISTRY.md", "CODING_AGENTS_REGISTRY.md"]);

const REQUIRED_FM_FIELDS = ["name", "tier", "domain", "voice"];
const REQUIRED_SECTIONS = ["## Capabilities", "## Vault Access"];

function listAgentFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      // Walk subdirectories (e.g. agents/council/)
      for (const subEntry of readdirSync(full)) {
        if (subEntry.endsWith(".md")) {
          results.push(`${entry}/${subEntry}`);
        }
      }
    } else if (entry.endsWith(".md") && !META_FILES.has(entry)) {
      results.push(entry);
    }
  }
  return results.sort();
}

function parseFrontmatter(content) {
  const trimmed = content.replace(/^﻿/, ""); // Strip BOM
  if (!trimmed.startsWith("---")) return { found: false };
  const end = trimmed.indexOf("\n---", 3);
  if (end === -1) return { found: false };
  const raw = trimmed.slice(3, end);
  const body = trimmed.slice(end + 4);
  return { found: true, raw, body };
}

function extractField(raw, key) {
  const m = raw.match(new RegExp(`^${key}\\s*:\\s*(.*)`, "m"));
  return m ? m[1].trim() : null;
}

function validate() {
  const files = listAgentFiles(AGENTS_DIR);
  const violations = [];
  const warnings = [];

  for (const rel of files) {
    const absPath = join(AGENTS_DIR, rel);
    const content = readFileSync(absPath, "utf8");
    const { found, raw, body } = parseFrontmatter(content);

    // 1. Frontmatter presence
    if (!found) {
      violations.push({
        file: `agents/${rel}`,
        rule: "MISSING_FRONTMATTER",
        detail: "No YAML frontmatter block (--- delimiters) found",
      });
      continue;
    }

    // 2. Required fields
    for (const field of REQUIRED_FM_FIELDS) {
      const val = extractField(raw, field);
      if (!val) {
        violations.push({
          file: `agents/${rel}`,
          rule: `MISSING_${field.toUpperCase()}`,
          detail: `Frontmatter is missing the "${field}:" key`,
        });
      }
    }

    // 3. Attestation block
    if (!content.includes("Built on SIP") && !content.includes("Starlight Intelligence Protocol")) {
      violations.push({
        file: `agents/${rel}`,
        rule: "MISSING_ATTESTATION",
        detail: 'Missing cryptographic attestation block ("Built on SIP" or "Starlight Intelligence Protocol")',
      });
    }

    // 4. Required sections
    for (const section of REQUIRED_SECTIONS) {
      if (!body.includes(section)) {
        warnings.push({
          file: `agents/${rel}`,
          rule: "MISSING_SECTION",
          detail: `Suggested section "${section}" is missing in the body`,
        });
      }
    }

    // 5. Placeholders check
    const placeholderMatch = body.match(/\{[A-Z][a-zA-Z0-9_-]*\}/);
    if (placeholderMatch) {
      violations.push({
        file: `agents/${rel}`,
        rule: "RAW_PLACEHOLDER",
        detail: `Found unresolved template placeholder: "${placeholderMatch[0]}"`,
      });
    }
  }

  // Report warnings
  if (warnings.length > 0) {
    console.log(`\n⚠  AGENT WARNINGS (${warnings.length}):`);
    for (const w of warnings) {
      console.log(`  [${w.rule}] ${w.file}`);
      console.log(`    → ${w.detail}`);
    }
  }

  // Report violations
  if (violations.length > 0) {
    console.log(`\n✗  AGENT VIOLATIONS (${violations.length}):`);
    for (const v of violations) {
      console.log(`  [${v.rule}] ${v.file}`);
      console.log(`    → ${v.detail}`);
    }
    console.log(`\nFailed: ${violations.length} violation(s) in ${files.length} agent profiles.\n`);
    return 1;
  }

  console.log(`\n✓  All ${files.length} agent profiles pass quality and frontmatter conformance checks.\n`);
  return 0;
}

process.exit(validate());
