/**
 * Starlight Multi-Agent Skill Allocation Engine
 *
 * Evaluates agent roles, enforces the Skill Necessity Gate to prevent
 * context window obesity, and generates harness configurations tailored
 * to Claude Code, Cursor, Codex, Grok, Hermes, and Antigravity.
 *
 * Built on SIP — operational tier.
 */

import type {
  SkillAllocationOptions,
  SkillAllocationResult,
  SupportedHarness,
} from './types.js';

interface KnownAgentProfile {
  id: string;
  name: string;
  tier: 'front-door' | 'leadership' | 'specialist' | 'foundation' | 'reviewer';
  mission: string;
  preferredSkills: string[];
}

const AGENT_PROFILES: Record<string, KnownAgentProfile> = {
  orchestrator: {
    id: 'orchestrator',
    name: 'Starlight Orchestrator',
    tier: 'leadership',
    mission: 'Multi-step workflow routing, sub-swarm synthesis, parallel execution control.',
    preferredSkills: [
      'orchestration/multi-agent-coordination',
      'orchestration/workflow-design',
      'intelligence/strategic-reasoning',
      'memory/vault-management',
    ],
  },
  architect: {
    id: 'architect',
    name: 'Starlight Architect',
    tier: 'leadership',
    mission: 'System design, infrastructure topology, API contracts, planet-scale durability.',
    preferredSkills: [
      'intelligence/systems-thinking',
      'integration/domain-stack-architecture',
      'business/entity-architecture',
      'memory/vault-management',
    ],
  },
  sentinel: {
    id: 'sentinel',
    name: 'Starlight Sentinel',
    tier: 'reviewer',
    mission: 'Security audits, fail-closed permission gating, zero-trust vulnerability assessment.',
    preferredSkills: [
      'safety-and-governance-sentinel',
      'security-auditor',
      'canon-check',
      'gate-eval',
    ],
  },
  foundry: {
    id: 'foundry',
    name: 'Starlight Foundry Master',
    tier: 'specialist',
    mission: 'Compiles task envelopes, validates necessity gates, packages skills and agents.',
    preferredSkills: [
      'foundry/task-envelope-compilation',
      'orchestration/cli-tool-router',
      'memory/insight-distillation',
    ],
  },
  concierge: {
    id: 'concierge',
    name: 'Starlight Concierge',
    tier: 'front-door',
    mission: 'Newcomer intake, conversational triage, zero-terminal creator onboarding.',
    preferredSkills: [
      'integration/idea-triage',
      'intelligence/genius-excavation',
    ],
  },
  weaver: {
    id: 'weaver',
    name: 'Starlight Weaver',
    tier: 'specialist',
    mission: 'Creative narrative synthesis, brand aesthetic alignment, cross-media consistency.',
    preferredSkills: [
      'vis/vis-audit',
      'anime-storyboarder',
      'vision-impeccable-design-kernel',
      'voice-anti-slop',
    ],
  },
};

/**
 * Computes optimal skill allocation for an agent.
 */
export function allocateSkillsForAgent(
  agentIdentifier: string,
  options: SkillAllocationOptions = {}
): SkillAllocationResult {
  const normId = agentIdentifier.toLowerCase().replace(/^starlight-/, '');
  const profile = AGENT_PROFILES[normId] || {
    id: normId,
    name: agentIdentifier,
    tier: 'specialist',
    mission: `Autonomous operations for ${agentIdentifier}`,
    preferredSkills: ['orchestration/multi-agent-coordination', 'memory/vault-management'],
  };

  const maxSkills = options.maxSkills ?? (profile.tier === 'front-door' ? 2 : profile.tier === 'leadership' ? 4 : 3);
  const targetHarness: SupportedHarness = options.targetHarness || 'claude-code';

  const allocated: SkillAllocationResult['allocatedSkills'] = [];
  const excluded: SkillAllocationResult['excludedSkills'] = [];

  let currentTokens = 0;
  const tokenBudget = options.maxTokenBudget || 4000;

  for (let i = 0; i < profile.preferredSkills.length; i++) {
    const skillKey = profile.preferredSkills[i];
    const estimatedTokens = 450; // average prompt token overhead per skill definition

    if (allocated.length >= maxSkills) {
      excluded.push({
        id: skillKey,
        reason: `Exceeded max skill capacity (${maxSkills}) for tier '${profile.tier}' to avoid context bloat`,
      });
      continue;
    }

    if (currentTokens + estimatedTokens > tokenBudget) {
      excluded.push({
        id: skillKey,
        reason: `Exceeded token budget (${tokenBudget} tokens)`,
      });
      continue;
    }

    allocated.push({
      id: skillKey,
      title: skillKey.split('/').pop()?.replace(/-/g, ' ').toUpperCase() || skillKey,
      reason: `Primary capability for ${profile.tier} mission: ${profile.mission}`,
      estimatedTokens,
      requiredPermissions: ['fs:read:repo', 'mcp:invoke'],
    });

    currentTokens += estimatedTokens;
  }

  const harnessConfigSnippet = formatHarnessSnippet(profile.name, targetHarness, allocated);

  return {
    agentId: profile.id,
    agentRole: profile.name,
    tier: profile.tier,
    allocatedSkills: allocated,
    excludedSkills: excluded,
    totalEstimatedTokens: currentTokens,
    harnessConfigSnippet,
  };
}

/**
 * Formats skill bindings into target harness configuration files.
 */
function formatHarnessSnippet(
  agentName: string,
  harness: SupportedHarness,
  skills: SkillAllocationResult['allocatedSkills']
): string {
  const skillKeys = skills.map((s) => s.id);

  switch (harness) {
    case 'claude-code':
      return [
        `// .claude/config.json active skills for ${agentName}`,
        JSON.stringify(
          {
            activeAgent: agentName,
            activeSkills: skillKeys,
            skillNecessityLock: true,
          },
          null,
          2
        ),
      ].join('\n');

    case 'cursor':
      return [
        `# .cursorrules configuration for ${agentName}`,
        `You are ${agentName}.`,
        `Active skills enabled:`,
        ...skillKeys.map((s) => `- ${s}`),
        `Enforce strict fail-closed security and verify outputs before completing tasks.`,
      ].join('\n');

    case 'codex':
    case 'opencode':
      return [
        `<!-- AGENTS.md / CODEX.md section for ${agentName} -->`,
        `### Agent: ${agentName}`,
        `Active Skills:`,
        ...skillKeys.map((s) => `* \`${s}\``),
      ].join('\n');

    default:
      return `# Configuration for ${harness}\nActive skills:\n${skillKeys.join('\n')}`;
  }
}
