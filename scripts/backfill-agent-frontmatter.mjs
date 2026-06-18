#!/usr/bin/env node
/**
 * scripts/backfill-agent-frontmatter.mjs
 *
 * Backfills YAML frontmatter for all agent markdown files under agents/
 * based on the master agent matrix in docs/AGENT_BLUEPRINT.md.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const AGENTS_DIR = join(REPO_ROOT, "agents");
const BLUEPRINT_PATH = join(REPO_ROOT, "docs", "AGENT_BLUEPRINT.md");

function clean(str) {
  return str.replace(/[\*\*`]/g, "").trim();
}

function deriveTier(sectionHeader) {
  const header = sectionHeader.toLowerCase();
  if (header.includes("core & platform")) return "core";
  if (header.includes("universal intelligence")) return "universal";
  if (header.includes("people intelligence")) return "people";
  if (header.includes("sound & music")) return "sound";
  if (header.includes("energy")) return "energy";
  if (header.includes("crypto")) return "crypto";
  if (header.includes("legal & compliance")) return "legal";
  if (header.includes("space & cosmos")) return "space";
  if (header.includes("marine & oceanographic")) return "marine";
  if (header.includes("longevity & health")) return "longevity";
  if (header.includes("infrastructure & ops")) return "ops";
  if (header.includes("partner & adapter")) return "partner";
  if (header.includes("research & publications")) return "research";
  if (header.includes("asset & production")) return "asset";
  if (header.includes("content & distribution")) return "dist";
  if (header.includes("community & alliance")) return "comm";
  if (header.includes("hardware & device")) return "dev";
  if (header.includes("elder & council")) return "council";
  return "specialist";
}

function main() {
  if (!existsSync(BLUEPRINT_PATH)) {
    console.error(`Blueprint missing at ${BLUEPRINT_PATH}`);
    process.exit(1);
  }

  const blueprintContent = readFileSync(BLUEPRINT_PATH, "utf8");
  const lines = blueprintContent.split(/\r?\n/);

  let currentTier = "specialist";
  const agentMap = new Map();

  // Parse Docs Agent Matrix
  for (const line of lines) {
    if (line.startsWith("### ")) {
      currentTier = deriveTier(line);
      continue;
    }

    // Match table row format: | # | Name | File | Domain | Role |
    // Example: | 1 | **Concierge** | `starlight-concierge.md` | Intake | Handles ... |
    const rowMatch = line.match(/^\|\s*(\d+)\s*\|\s*\*\*([^*]+)\*\*\s*\|\s*`?([^`\s|]+)`?\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/);
    if (rowMatch) {
      const file = rowMatch[3].trim();
      const filename = file.includes("/") ? file.slice(file.lastIndexOf("/") + 1) : file;
      
      agentMap.set(filename, {
        name: clean(rowMatch[2]),
        tier: currentTier,
        domain: clean(rowMatch[4]).toLowerCase().replace(/\s+/g, "-"),
        voice: clean(rowMatch[5]),
      });
    }
  }

  console.log(`Parsed ${agentMap.size} agent specs from blueprint.`);

  let updatedCount = 0;

  // Walk agents on disk and apply frontmatter if missing
  for (const [filename, spec] of agentMap.entries()) {
    // Handle sub-tier nesting if exists (e.g. agents/council/)
    let relPath = filename;
    let absPath = join(AGENTS_DIR, relPath);

    if (!existsSync(absPath)) {
      // Try subfolder check (e.g. agents/council/filename)
      const councilPath = join(AGENTS_DIR, "council", filename);
      if (existsSync(councilPath)) {
        absPath = councilPath;
        relPath = `council/${filename}`;
      } else {
        continue; // File doesn't exist on disk yet
      }
    }

    const fileContent = readFileSync(absPath, "utf8");
    if (fileContent.startsWith("---")) {
      // Frontmatter already present, skip
      continue;
    }

    // Build frontmatter block
    const fmBlock = `---
name: starlight-${spec.name.toLowerCase().replace(/\s+/g, "-")}
tier: ${spec.tier}
domain: ${spec.domain}
voice: ${spec.voice}
---
`;

    const newContent = fmBlock + fileContent;
    writeFileSync(absPath, newContent, "utf8");
    console.log(`Backfilled frontmatter: agents/${relPath}`);
    updatedCount++;
  }

  console.log(`\nSuccessfully backfilled frontmatter for ${updatedCount} agents.`);
}

main();
