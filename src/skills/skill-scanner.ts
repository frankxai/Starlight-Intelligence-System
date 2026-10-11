/**
 * Starlight Intelligence System — Skill Discovery Scanner
 *
 * Scans codebases, prompt directories, and dotfiles to discover
 * emergent skills, custom workflows, and skin adaptations.
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, basename } from "node:path";
import type {
  ScannedSkill,
  WorkspaceScanResult,
  SkillMaturityStage,
} from "./types.js";
import { estimateTokenCount } from "./skill-matrix.js";

export interface ScanOptions {
  maxDepth?: number;
  ignoreDirs?: string[];
}

const DEFAULT_IGNORE = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  ".worktrees",
  ".system_generated",
  "tmp",
  "coverage",
];

const STAGE_LABELS: Record<SkillMaturityStage, string> = {
  0: "Stage 0: Scratchpad / Raw Prompt",
  1: "Stage 1: Local Validated Skill",
  2: "Stage 2: Team Swarm Asset",
  3: "Stage 3: Verified Free Community Pack",
  4: "Stage 4: Premium Sovereign Pack",
};

/** Parses basic YAML frontmatter from markdown without external dependencies. */
export function parseFrontmatter(content: string): {
  frontmatter: Record<string, string>;
  body: string;
} {
  const stripped = content.replace(/^\uFEFF/, "");
  if (!stripped.startsWith("---\n") && !stripped.startsWith("---\r\n")) {
    return { frontmatter: {}, body: stripped };
  }
  const match = stripped.match(/^---\r?\n([\s\S]*?)\r?\n---([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: stripped };
  }
  const rawFm = match[1];
  const body = match[2].trim();
  const frontmatter: Record<string, string> = {};

  for (const line of rawFm.split(/\r?\n/)) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0 && !line.startsWith(" ") && !line.startsWith("\t")) {
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, "");
      frontmatter[key] = val;
    }
  }

  return { frontmatter, body };
}

/**
 * Scans a directory for skill files, custom commands, and prompt assets.
 */
export function scanWorkspaceSkills(
  rootDir: string,
  options: ScanOptions = {}
): WorkspaceScanResult {
  const maxDepth = options.maxDepth ?? 5;
  const ignoreDirs = new Set(options.ignoreDirs ?? DEFAULT_IGNORE);
  const skillsFound: ScannedSkill[] = [];
  let filesScanned = 0;

  function walk(currentDir: string, currentDepth: number): void {
    if (currentDepth > maxDepth || !existsSync(currentDir)) return;

    let entries: string[] = [];
    try {
      entries = readdirSync(currentDir);
    } catch {
      return;
    }

    for (const entry of entries) {
      if (ignoreDirs.has(entry)) continue;
      const fullPath = join(currentDir, entry);
      let stat;
      try {
        stat = statSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        walk(fullPath, currentDepth + 1);
      } else if (stat.isFile()) {
        filesScanned++;
        // Check if candidate skill file
        const lowerName = entry.toLowerCase();
        const isCandidate =
          lowerName === "skill.md" ||
          lowerName.endsWith(".skill.md") ||
          lowerName.endsWith(".skill") ||
          currentDir.includes(".claude/commands") ||
          currentDir.includes(".claude\\commands") ||
          currentDir.includes("skills") ||
          lowerName.endsWith(".mdc") ||
          lowerName === ".cursorrules";

        if (isCandidate && (lowerName.endsWith(".md") || lowerName.endsWith(".mdc") || lowerName === ".cursorrules")) {
          let content = "";
          try {
            content = readFileSync(fullPath, "utf8");
          } catch {
            continue;
          }

          const { frontmatter, body } = parseFrontmatter(content);
          const hasFm = Object.keys(frontmatter).length > 0;
          const name =
            frontmatter.name ??
            basename(entry, entry.includes(".") ? entry.slice(entry.lastIndexOf(".")) : "");
          const domain = frontmatter.domain ?? "general";
          const tokens = estimateTokenCount(content);

          // Check for nearby scripts, references, evals
          const parentDir = statSync(fullPath).isDirectory() ? fullPath : join(fullPath, "..");
          const hasScripts = existsSync(join(parentDir, "scripts"));
          const hasReferences = existsSync(join(parentDir, "references"));
          const hasEvals = existsSync(join(parentDir, "evals")) || content.includes("## Test") || content.includes("## Evals");

          // Determine maturity stage
          let stage: SkillMaturityStage = 0;
          if (hasFm && frontmatter.description) {
            stage = 1;
            if (hasScripts || content.includes("triggers:") || content.includes("permissions:")) {
              stage = 2;
              if (frontmatter.license && frontmatter.author) {
                stage = 3;
                if (hasEvals && (hasScripts || hasReferences)) {
                  stage = 4;
                }
              }
            }
          }

          // Commercial readiness score (0-100)
          let readiness = 10;
          if (hasFm) readiness += 25;
          if (hasScripts) readiness += 20;
          if (hasReferences) readiness += 15;
          if (hasEvals) readiness += 20;
          if (stage >= 3) readiness += 10;

          // Estimated suggested MSRP
          let suggestedMSRP: number | undefined;
          if (stage === 4) suggestedMSRP = 89;
          else if (stage === 3) suggestedMSRP = 29;
          else if (stage === 2) suggestedMSRP = 19;

          const triggers: string[] = [];
          if (frontmatter.triggers) triggers.push(frontmatter.triggers);
          if (content.includes("triggers:")) triggers.push("declared-in-body");

          const warnings: string[] = [];
          if (tokens > 3000) {
            warnings.push(`Heavy context footprint (${tokens} tokens). Recommend progressive disclosure.`);
          }
          if (!hasFm) {
            warnings.push("Missing YAML frontmatter (name and description required for auto-activation).");
          }

          const relPath = relative(rootDir, fullPath).replace(/\\/g, "/");

          skillsFound.push({
            relativePath: relPath,
            name,
            domain,
            stage,
            stageLabel: STAGE_LABELS[stage],
            hasFrontmatter: hasFm,
            hasScripts,
            hasReferences,
            hasEvals,
            estimatedTokens: tokens,
            triggersDetected: triggers,
            suggestedMSRPUSD: suggestedMSRP,
            commercialReadinessScore: readiness,
            warnings,
          });
        }
      }
    }
  }

  walk(rootDir, 0);

  const stageSummary = {
    stage0_scratchpad: skillsFound.filter((s) => s.stage === 0).length,
    stage1_workspace_skill: skillsFound.filter((s) => s.stage === 1).length,
    stage2_team_swarm: skillsFound.filter((s) => s.stage === 2).length,
    stage3_community_pack: skillsFound.filter((s) => s.stage === 3).length,
    stage4_sovereign_premium: skillsFound.filter((s) => s.stage === 4).length,
  };

  const recommendations: string[] = [];
  if (stageSummary.stage0_scratchpad > 0) {
    recommendations.push(
      `Found ${stageSummary.stage0_scratchpad} Stage 0 prompt(s). Run 'starlight skills audit' to add YAML frontmatter and triggers.`
    );
  }
  if (stageSummary.stage3_community_pack + stageSummary.stage4_sovereign_premium > 0) {
    recommendations.push(
      `${stageSummary.stage3_community_pack + stageSummary.stage4_sovereign_premium} skill(s) ready for marketplace packaging and monetization.`
    );
  }

  return {
    rootPath: rootDir,
    timestamp: new Date().toISOString(),
    filesScanned,
    skillsFound,
    stageSummary,
    recommendations,
  };
}
