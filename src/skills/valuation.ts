/**
 * Starlight Skill Valuation & Pricing Engine
 *
 * Implements deterministic fair-market valuation, quality scoring,
 * and monetization tier assignment for sovereign skills and packs.
 *
 * Built on SIP — operational tier.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { SkillDefinition, SkillValuationReport } from './types.js';
import type { PricingTier } from '../marketplace/types.js';

/**
 * Parses a SKILL.md file or raw markdown string into a structured SkillDefinition.
 */
export function parseSkillMarkdown(content: string, defaultId = 'custom-skill'): SkillDefinition {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const metadata: Record<string, unknown> = {};

  if (frontmatterMatch) {
    const rawYaml = frontmatterMatch[1];
    for (const line of rawYaml.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx > 0) {
        const key = trimmed.slice(0, colonIdx).trim();
        let val = trimmed.slice(colonIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        metadata[key] = val;
      }
    }
  }

  const id = String(metadata.name || metadata.id || defaultId);
  const title = String(metadata.title || id);
  const description = String(metadata.description || 'Custom sovereign skill');
  const version = String(metadata.version || '0.1.0');
  const author = String(metadata.author || 'Community Contributor');
  const license = String(metadata.license || 'MIT');
  const pricingTier = (metadata.pricingTier as PricingTier) || 'free';
  const pricingMonthlyUsd = metadata.pricingMonthlyUsd ? Number(metadata.pricingMonthlyUsd) : 0;

  // Extract sections
  const missionMatch = content.match(/##\s+(?:Mission|Purpose|Overview)\r?\n([\s\S]*?)(?=\r?\n##|$)/i);
  const instructionsMatch = content.match(/##\s+(?:Instructions|System Instructions|Behavioral Rules)\r?\n([\s\S]*?)(?=\r?\n##|$)/i);
  const workflowsMatch = content.match(/##\s+(?:Workflows|Protocol|Execution Workflows)\r?\n([\s\S]*?)(?=\r?\n##|$)/i);
  const rubricMatch = content.match(/##\s+(?:Verification|Rubric|Self-Correction Rubric)\r?\n([\s\S]*?)(?=\r?\n##|$)/i);

  // Extract tools & permissions heuristics
  const tools: string[] = [];
  const permissions: string[] = [];
  const toolMatches = content.matchAll(/`(fs|network|db|shell|mcp|gpu):[a-z0-9_:-]+`/gi);
  for (const m of toolMatches) {
    if (!permissions.includes(m[1])) {
      permissions.push(m[0].replace(/`/g, ''));
    }
  }

  return {
    id,
    name: id,
    version,
    title,
    description,
    author,
    license,
    pricingTier,
    pricingMonthlyUsd,
    tags: [id, 'starlight-skill'],
    permissions,
    tools,
    harnessTargets: ['claude-code', 'cursor', 'codex', 'antigravity', 'opencode'],
    mission: missionMatch ? missionMatch[1].trim() : undefined,
    instructions: instructionsMatch ? instructionsMatch[1].trim() : undefined,
    workflows: workflowsMatch ? workflowsMatch[1].trim().split(/\r?\n/).filter(Boolean) : undefined,
    verificationRubric: rubricMatch ? rubricMatch[1].trim().split(/\r?\n/).filter(Boolean) : undefined,
    rawMarkdown: content,
  };
}

/**
 * Loads and parses a SKILL.md file from disk.
 */
export function loadSkillFromFile(filePath: string): SkillDefinition {
  const absPath = resolve(filePath);
  if (!existsSync(absPath)) {
    throw new Error(`Skill file not found at path: ${absPath}`);
  }
  const content = readFileSync(absPath, 'utf-8');
  const defaultId = absPath.split(/[/\\]/).filter(Boolean).slice(-2, -1)[0] || 'skill';
  return parseSkillMarkdown(content, defaultId);
}

/**
 * Evaluates a SkillDefinition against the Starlight Valuation Algorithm.
 *
 * Formula:
 *   Score = (Quality * 0.35) + (Complexity * 0.25) + (Uniqueness * 0.20) + (TokenROI * 0.20)
 */
export function evaluateSkill(skill: SkillDefinition): SkillValuationReport {
  const rationale: string[] = [];
  const improvementGaps: string[] = [];

  // 1. Quality Scoring (0 - 100)
  let qualityScore = 0;
  if (skill.name && skill.name.length > 2) qualityScore += 15;
  if (skill.description && skill.description.length >= 20) {
    qualityScore += 20;
    rationale.push('Clear, actionable summary provided in frontmatter');
  } else {
    improvementGaps.push('Description is too brief (recommend at least 20 characters describing specific outcome)');
  }

  if (skill.mission && skill.mission.length > 30) {
    qualityScore += 20;
    rationale.push('Explicit mission/scope statement defined');
  } else {
    improvementGaps.push('Add an explicit ## Mission or ## Purpose section');
  }

  if (skill.instructions && skill.instructions.length > 50) {
    qualityScore += 25;
    rationale.push('Substantive system instructions and behavioral constraints present');
  } else {
    improvementGaps.push('Deepen the ## System Instructions with explicit agent behavioral guardrails');
  }

  if (skill.workflows && skill.workflows.length >= 2) {
    qualityScore += 10;
    rationale.push('Step-by-step execution workflow codified');
  } else {
    improvementGaps.push('Include a numbered ## Workflows section showing how the agent executes the task');
  }

  if (skill.verificationRubric && skill.verificationRubric.length > 0) {
    qualityScore += 10;
    rationale.push('Self-correction/verification rubric attached (Anti-Slop)');
  } else {
    improvementGaps.push('Add a ## Verification Rubric so agents self-test outputs before completion');
  }

  // 2. Complexity Scoring (0 - 100)
  let complexityScore = 20; // baseline prompt complexity
  const rawLower = (skill.rawMarkdown || '').toLowerCase();

  if (rawLower.includes('api') || rawLower.includes('http') || rawLower.includes('fetch')) {
    complexityScore += 20;
    rationale.push('Integrates external network endpoints/APIs');
  }
  if (rawLower.includes('database') || rawLower.includes('sqlite') || rawLower.includes('pgvector')) {
    complexityScore += 20;
    rationale.push('Interacts with persistent relational or vector storage');
  }
  if (rawLower.includes('gpu') || rawLower.includes('image') || rawLower.includes('video') || rawLower.includes('audio')) {
    complexityScore += 20;
    rationale.push('Orchestrates multi-modal media or generative inference pipelines');
  }
  if (skill.permissions && skill.permissions.length > 0) {
    complexityScore += 15;
    rationale.push(`Enforces ${skill.permissions.length} granular permission boundaries`);
  }
  if (rawLower.includes('ast') || rawLower.includes('compiler') || rawLower.includes('grammar') || rawLower.includes('crypto')) {
    complexityScore += 15;
  }
  complexityScore = Math.min(100, complexityScore);

  // 3. Uniqueness Scoring (0 - 100)
  let uniquenessScore = 50; // default baseline
  if (rawLower.includes('starlight') || rawLower.includes('arcanea') || rawLower.includes('ten gates')) {
    uniquenessScore += 25;
    rationale.push('Encodes proprietary Starlight/Arcanea institutional knowledge and lore');
  }
  if (rawLower.includes('santa') || rawLower.includes('adversarial') || rawLower.includes('convergence')) {
    uniquenessScore += 15;
    rationale.push('Implements dual-agent adversarial consensus mechanics');
  }
  if (skill.rawMarkdown && skill.rawMarkdown.length > 1500) {
    uniquenessScore += 10;
  }
  uniquenessScore = Math.min(100, uniquenessScore);

  // 4. Token & Labor ROI (0 - 100)
  let roiScore = 40;
  if (complexityScore > 50) roiScore += 25;
  if (qualityScore > 70) roiScore += 20;
  if (skill.workflows && skill.workflows.length >= 3) roiScore += 15;
  roiScore = Math.min(100, roiScore);

  // Calculate Weighted Overall Score
  const overallScore = Math.round(
    qualityScore * 0.35 +
    complexityScore * 0.25 +
    uniquenessScore * 0.20 +
    roiScore * 0.20
  );

  // Determine Recommended Tier & Pricing
  let recommendedTier: PricingTier = 'free';
  let suggestedMonthlyUsd = 0;
  let suggestedOneOffUsd = 0;

  if (overallScore >= 85) {
    recommendedTier = 'enterprise';
    suggestedMonthlyUsd = 199;
    suggestedOneOffUsd = 499;
  } else if (overallScore >= 70) {
    recommendedTier = 'pro';
    suggestedMonthlyUsd = 49;
    suggestedOneOffUsd = 129;
  } else if (overallScore >= 50) {
    recommendedTier = 'freemium';
    suggestedMonthlyUsd = 19;
    suggestedOneOffUsd = 49;
  } else {
    recommendedTier = 'free';
    suggestedMonthlyUsd = 0;
    suggestedOneOffUsd = 0;
  }

  return {
    skillId: skill.id,
    qualityScore,
    complexityScore,
    uniquenessScore,
    roiScore,
    overallScore,
    recommendedTier,
    suggestedMonthlyUsd,
    suggestedOneOffUsd,
    rationale,
    improvementGaps,
    evaluatedAt: new Date().toISOString(),
  };
}
