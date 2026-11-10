/**
 * Starlight Skills Dispatcher & Context Engine
 *
 * Implements context-aware auto-activation of skill doctrines:
 *   - Loads and validates skills/skill-rules.json (90 active rules)
 *   - Evaluates text keywords, regexes, and agent permissions
 *   - Ranks matching skills by priority and match score
 *   - Safely resolves skill doctrines across flat and directory structures
 *   - Builds bounded, token-efficient injection prompts for frontier model context
 *
 * Attestation: Built on SIP § 3 — Skills Auto-Activation Substrate
 */

import { existsSync, readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export type SkillPriority = "critical" | "high" | "medium" | "low";

export interface SkillRuleTrigger {
  keywords?: string[];
  agents?: string[];
  intents?: string[];
  regex?: string[];
  regexes?: string[];
  patterns?: string[];
  files?: string[];
}

export interface SkillRule {
  id: string;
  skill: string;
  triggers: SkillRuleTrigger;
  priority: SkillPriority;
  load_level?: string;
  [key: string]: unknown;
}

export interface SkillRulesFile {
  version: string;
  description: string;
  rules: SkillRule[];
}

export interface SkillMatchResult {
  rule: SkillRule;
  skill: string;
  score: number;
  confidence: number; // 0.0 to 1.0
  matchedKeywords: string[];
  matchedIntents: string[];
  matchedPatterns: string[];
  agentPermitted: boolean;
  priorityWeight: number;
}

const PRIORITY_WEIGHTS: Record<SkillPriority, number> = {
  critical: 1.35,
  high: 1.2,
  medium: 1.0,
  low: 0.85,
};

const UNIVERSAL_AGENTS = new Set([
  "starlight-orchestrator",
  "orchestrator",
  "starlight-prime",
  "prime",
  "starlight-queen",
  "queen",
  "starlight-sage",
  "sage",
  "starlight-sentinel",
  "sentinel",
]);

function normalizeAgentId(id: string): string {
  return id.toLowerCase().trim().replace(/_/g, "-");
}

function agentMatches(agentA: string, agentB: string): boolean {
  const a = normalizeAgentId(agentA);
  const b = normalizeAgentId(agentB);
  if (a === b) return true;
  const aClean = a.replace(/^starlight-/, "");
  const bClean = b.replace(/^starlight-/, "");
  return aClean === bClean;
}

function findRepoRoot(startDir: string = process.cwd()): string {
  let curr = resolve(startDir);
  for (let i = 0; i < 6; i++) {
    if (existsSync(join(curr, "skills", "skill-rules.json"))) {
      return curr;
    }
    const parent = dirname(curr);
    if (parent === curr) break;
    curr = parent;
  }

  // Fallback to module directory resolution if running from compiled dist/
  try {
    const moduleDir = dirname(fileURLToPath(import.meta.url));
    let modCurr = moduleDir;
    for (let i = 0; i < 6; i++) {
      if (existsSync(join(modCurr, "skills", "skill-rules.json"))) {
        return modCurr;
      }
      const parent = dirname(modCurr);
      if (parent === modCurr) break;
      modCurr = parent;
    }
  } catch {
    // ignore
  }

  return process.cwd();
}

export class SkillsDispatcher {
  private repoRoot: string;
  private skillsDir: string;
  private rulesPath: string;
  private rules: SkillRule[] = [];

  constructor(repoRoot?: string) {
    this.repoRoot = repoRoot ? resolve(repoRoot) : findRepoRoot();
    this.skillsDir = join(this.repoRoot, "skills");
    this.rulesPath = join(this.skillsDir, "skill-rules.json");
    this.loadRules();
  }

  /**
   * Loads or reloads skill rules from skill-rules.json
   */
  public loadRules(customPath?: string): void {
    const targetPath = customPath ? resolve(customPath) : this.rulesPath;
    if (!existsSync(targetPath)) {
      this.rules = [];
      return;
    }

    try {
      const raw = readFileSync(targetPath, "utf8");
      const parsed = JSON.parse(raw) as SkillRulesFile;
      if (parsed && Array.isArray(parsed.rules)) {
        this.rules = parsed.rules;
      }
    } catch {
      this.rules = [];
    }
  }

  /**
   * Returns all loaded skill rules
   */
  public getRules(): SkillRule[] {
    return [...this.rules];
  }

  /**
   * Evaluates task description against keyword triggers, regexes, and agent permissions
   * Returns matching rules ranked by match score and priority
   */
  public matchSkills(taskDescription: string, agentId?: string): SkillMatchResult[] {
    if (!taskDescription || typeof taskDescription !== "string") {
      return [];
    }

    const taskLower = taskDescription.toLowerCase();
    const taskWords = new Set(
      taskLower
        .split(/[^a-z0-9_\-\/]+/)
        .map((w) => w.trim())
        .filter(Boolean)
    );

    const results: SkillMatchResult[] = [];
    const normalizedAgent = agentId ? normalizeAgentId(agentId) : undefined;
    const isUniversalAgent = normalizedAgent ? UNIVERSAL_AGENTS.has(normalizedAgent) : false;

    for (const rule of this.rules) {
      // 1. Agent permission evaluation
      let agentPermitted = true;
      let agentExactMatch = false;

      const ruleAgents = rule.triggers?.agents;
      if (normalizedAgent) {
        if (ruleAgents && Array.isArray(ruleAgents) && ruleAgents.length > 0) {
          const matched = ruleAgents.some((ra) => agentMatches(ra, normalizedAgent));
          if (matched) {
            agentPermitted = true;
            agentExactMatch = true;
          } else if (isUniversalAgent) {
            // Universal leaders have permission across all skills
            agentPermitted = true;
            agentExactMatch = false;
          } else {
            // Agent does not have permission for this skill
            agentPermitted = false;
          }
        } else {
          // No agent restriction on rule
          agentPermitted = true;
        }
      }

      if (!agentPermitted) {
        continue;
      }

      // 2. Keyword matching
      const matchedKeywords: string[] = [];
      const keywords = rule.triggers?.keywords || [];

      for (const kw of keywords) {
        const kwTrimmed = kw.trim();
        if (!kwTrimmed) continue;

        // Check if keyword is a regex pattern like "/^foo/i"
        if (kwTrimmed.startsWith("/") && kwTrimmed.lastIndexOf("/") > 0) {
          try {
            const lastSlash = kwTrimmed.lastIndexOf("/");
            const pattern = kwTrimmed.slice(1, lastSlash);
            const flags = kwTrimmed.slice(lastSlash + 1);
            const re = new RegExp(pattern, flags.includes("i") ? flags : flags + "i");
            if (re.test(taskDescription)) {
              matchedKeywords.push(kwTrimmed);
              continue;
            }
          } catch {
            // fall back to literal match
          }
        }

        const kwLower = kwTrimmed.toLowerCase();
        if (kwLower.includes(" ") || kwLower.includes("-") || kwLower.includes("/")) {
          if (taskLower.includes(kwLower)) {
            matchedKeywords.push(kwTrimmed);
          }
        } else {
          if (taskWords.has(kwLower)) {
            matchedKeywords.push(kwTrimmed);
          }
        }
      }

      // 3. Regex and pattern triggers
      const matchedPatterns: string[] = [];
      const patterns = [
        ...(rule.triggers?.regex || []),
        ...(rule.triggers?.regexes || []),
        ...(rule.triggers?.patterns || []),
      ];

      for (const pattern of patterns) {
        try {
          const re = new RegExp(pattern, "i");
          if (re.test(taskDescription)) {
            matchedPatterns.push(pattern);
          }
        } catch {
          // ignore invalid regex
        }
      }

      // 4. Intent triggers
      const matchedIntents: string[] = [];
      const intents = rule.triggers?.intents || [];

      for (const intent of intents) {
        const intentLower = intent.toLowerCase().trim();
        if (taskLower.includes(intentLower) || taskWords.has(intentLower)) {
          matchedIntents.push(intent);
        }
      }

      // If nothing matched, skip
      if (
        matchedKeywords.length === 0 &&
        matchedPatterns.length === 0 &&
        matchedIntents.length === 0
      ) {
        continue;
      }

      // 5. Score calculation
      let rawScore = 0;

      // Keywords contribute highest precision
      if (matchedKeywords.length > 0) {
        rawScore += 0.35;
        for (let i = 1; i < matchedKeywords.length; i++) {
          rawScore += 0.15;
        }
        // Multi-word phrase matches get extra confidence
        const phraseMatches = matchedKeywords.filter((k) => k.includes(" ") || k.includes("-")).length;
        if (phraseMatches > 0) {
          rawScore += Math.min(0.25, phraseMatches * 0.1);
        }
      }

      // Regex patterns
      if (matchedPatterns.length > 0) {
        rawScore += 0.35 + (matchedPatterns.length - 1) * 0.15;
      }

      // Intents contribute secondary context
      if (matchedIntents.length > 0) {
        rawScore += 0.2 + (matchedIntents.length - 1) * 0.1;
      }

      // Agent exact match alignment boost
      if (agentExactMatch) {
        rawScore += 0.2;
      }

      // Apply priority weighting
      const priority = rule.priority || "medium";
      const priorityWeight = PRIORITY_WEIGHTS[priority] ?? 1.0;
      const weightedScore = rawScore * priorityWeight;

      // Confidence bounded between 0.05 and 1.0
      const confidence = Math.min(1.0, Math.max(0.05, Math.round(weightedScore * 100) / 100));

      results.push({
        rule,
        skill: rule.skill,
        score: Math.round(weightedScore * 100) / 100,
        confidence,
        matchedKeywords,
        matchedIntents,
        matchedPatterns,
        agentPermitted,
        priorityWeight,
      });
    }

    // Sort descending by confidence, then priority weight, then matched keywords count
    results.sort((a, b) => {
      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence;
      }
      if (b.priorityWeight !== a.priorityWeight) {
        return b.priorityWeight - a.priorityWeight;
      }
      return b.matchedKeywords.length - a.matchedKeywords.length;
    });

    return results;
  }

  /**
   * Safely reads skill doctrine file checking:
   *   1. skills/<skillPath>.md (flat file)
   *   2. skills/<skillPath>/SKILL.md (directory package)
   *   3. Direct resolution if path already contains extension
   */
  public loadSkillDoctrine(skillPath: string): string | null {
    if (!skillPath || typeof skillPath !== "string") {
      return null;
    }

    // Clean up skill path
    let clean = skillPath.trim().replace(/^skills[\/\\]/, "");

    const candidates = [
      join(this.skillsDir, `${clean}.md`),
      join(this.skillsDir, clean, "SKILL.md"),
      join(this.skillsDir, clean),
      resolve(this.repoRoot, skillPath),
    ];

    for (const cand of candidates) {
      if (existsSync(cand)) {
        try {
          return readFileSync(cand, "utf8");
        } catch {
          // ignore read error
        }
      }
    }

    return null;
  }

  /**
   * Returns formatted markdown containing the most relevant skill doctrines
   * (up to top 3 skills, keeping token footprint bounded).
   */
  public buildInjectedSkillPrompt(
    taskDescription: string,
    agentId?: string,
    maxSkills: number = 3,
    maxCharsPerSkill: number = 2000
  ): string {
    const matches = this.matchSkills(taskDescription, agentId);
    if (matches.length === 0) {
      return "";
    }

    const top = matches.slice(0, maxSkills);
    const sections: string[] = [];

    for (const match of top) {
      const rawDoctrine = this.loadSkillDoctrine(match.skill);
      if (!rawDoctrine) continue;

      let doctrineBody = rawDoctrine.trim();

      // Bounded token footprint: truncate long doctrines gracefully
      if (doctrineBody.length > maxCharsPerSkill) {
        const truncated = doctrineBody.slice(0, maxCharsPerSkill);
        const lastHeadingOrPara = Math.max(
          truncated.lastIndexOf("\n\n## "),
          truncated.lastIndexOf("\n\n### "),
          truncated.lastIndexOf("\n\n")
        );
        const cutPoint = lastHeadingOrPara > 500 ? lastHeadingOrPara : maxCharsPerSkill;
        doctrineBody = `${truncated.slice(0, cutPoint).trim()}\n\n> *[...Skill doctrine bounded to prevent context overflow. Full doctrine: \`skills/${match.skill}\`]*`;
      }

      const triggerTokens = [
        ...match.matchedKeywords.map((k) => `\`${k}\``),
        ...match.matchedIntents.map((i) => `intent:\`${i}\``),
      ];

      sections.push(
        `<!-- STARLIGHT:AUTO-SKILL:START id="${match.rule.id}" skill="${match.skill}" priority="${match.rule.priority}" confidence="${Math.round(match.confidence * 100)}%" -->\n` +
          `### Skill Doctrine: ${match.skill} (Priority: ${match.rule.priority.toUpperCase()} | Confidence: ${Math.round(match.confidence * 100)}%)\n` +
          `*Matched triggers:* ${triggerTokens.join(", ")}\n\n` +
          `${doctrineBody}\n` +
          `<!-- STARLIGHT:AUTO-SKILL:END -->`
      );
    }

    if (sections.length === 0) {
      return "";
    }

    return (
      `<!-- STARLIGHT:AUTO-ACTIVATED-SKILLS:BEGIN -->\n` +
      `# Auto-Activated Skill Doctrines\n\n` +
      `The Starlight Skills Dispatcher auto-activated ${sections.length} specialized skill doctrine${sections.length > 1 ? "s" : ""} based on task context and agent permissions:\n\n` +
      `${sections.join("\n\n---\n\n")}\n` +
      `<!-- STARLIGHT:AUTO-ACTIVATED-SKILLS:END -->`
    );
  }
}

export const skillsDispatcher = new SkillsDispatcher();
