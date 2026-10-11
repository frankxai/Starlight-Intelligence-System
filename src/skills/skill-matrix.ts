/**
 * Starlight Intelligence System — Skill Matrix Resolver
 *
 * Implements context headroom optimization, role-skill necessity gating,
 * and multi-agent token budgeting.
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 */

import type {
  SkillDefinition,
  SkillMatrix,
  AgentSkillBinding,
} from "./types.js";

export interface SkillMatrixOptions {
  defaultTokenBudget?: number;
  warnThresholdRatio?: number;
  agentRoleMappings?: Record<string, string[]>;
}

const DEFAULT_BUDGET_TOKENS = 4000;
const WARN_THRESHOLD_RATIO = 0.75;

/** Approximate token count from characters/words. */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  // Conservative estimate: 1 token ~ 3.8 chars or ~0.75 words
  const words = text.trim().split(/\s+/).length;
  const chars = text.length;
  return Math.max(Math.ceil(chars / 4), Math.ceil(words * 1.3));
}

/**
 * Resolves a balanced Agent-Skill Matrix across a fleet of agents,
 * guaranteeing context window headroom and catching prompt bloat.
 */
export function resolveSkillMatrix(
  agents: string[],
  availableSkills: SkillDefinition[],
  options: SkillMatrixOptions = {}
): SkillMatrix {
  const budgetLimit = options.defaultTokenBudget ?? DEFAULT_BUDGET_TOKENS;
  const warnThreshold = options.warnThresholdRatio ?? WARN_THRESHOLD_RATIO;
  const roleMappings = options.agentRoleMappings ?? {};

  const bindings: Record<string, AgentSkillBinding> = {};
  const globalWarnings: string[] = [];

  for (const agent of agents) {
    const assignedSkillNames: string[] = [];
    let totalStaticTokens = 0;
    const warnings: string[] = [];

    // Find skills assigned by explicit mapping, agent trigger, or domain relevance
    for (const skill of availableSkills) {
      let shouldAssign = false;

      // 1. Explicit role mapping
      if (roleMappings[agent]?.includes(skill.name)) {
        shouldAssign = true;
      }

      // 2. Skill frontmatter declared agents
      if (skill.triggers?.agents?.includes(agent)) {
        shouldAssign = true;
      }

      // 3. Fallback domain heuristic if no explicit triggers specified
      if (
        !skill.triggers?.agents &&
        !roleMappings[agent] &&
        skill.domain &&
        agent.toLowerCase().includes(skill.domain.toLowerCase().split("-")[0])
      ) {
        shouldAssign = true;
      }

      if (shouldAssign && !assignedSkillNames.includes(skill.name)) {
        assignedSkillNames.push(skill.name);
        const skillTokens =
          skill.contextBudgetTokens ??
          estimateTokenCount(skill.content ?? skill.description);
        totalStaticTokens += skillTokens;
      }
    }

    const headroom = Math.max(
      0,
      Math.round(((budgetLimit - totalStaticTokens) / budgetLimit) * 100)
    );

    if (totalStaticTokens > budgetLimit) {
      warnings.push(
        `Agent "${agent}" exceeds token budget limit (${totalStaticTokens} > ${budgetLimit} tokens). Risk of context degradation.`
      );
    } else if (totalStaticTokens > budgetLimit * warnThreshold) {
      warnings.push(
        `Agent "${agent}" approaching token ceiling (${totalStaticTokens}/${budgetLimit} tokens, ${headroom}% headroom remaining).`
      );
    }

    bindings[agent] = {
      agentId: agent,
      assignedSkills: assignedSkillNames,
      totalStaticTokens,
      tokenBudgetLimit: budgetLimit,
      contextHeadroomPercent: headroom,
      warnings,
    };
  }

  // Assess overall token health
  const totalAgents = agents.length;
  let exhaustedCount = 0;
  let congestedCount = 0;

  for (const b of Object.values(bindings)) {
    if (b.contextHeadroomPercent === 0) exhaustedCount++;
    else if (b.contextHeadroomPercent < 25) congestedCount++;
    if (b.warnings.length > 0) {
      globalWarnings.push(...b.warnings);
    }
  }

  let overallTokenHealth: "healthy" | "congested" | "exhausted" = "healthy";
  if (exhaustedCount > 0) {
    overallTokenHealth = "exhausted";
  } else if (congestedCount > totalAgents * 0.3) {
    overallTokenHealth = "congested";
  }

  return {
    timestamp: new Date().toISOString(),
    bindings,
    overallTokenHealth,
    totalRegisteredSkills: availableSkills.length,
    warnings: globalWarnings,
  };
}
