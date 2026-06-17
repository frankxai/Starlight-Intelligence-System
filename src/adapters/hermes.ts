/**
 * Starlight Intelligence System — Hermes Agent Adapter
 *
 * Formats vault context for Nous Research Hermes Agent profiles running via
 * OpenRouter (nousresearch/hermes-3-llama-3.1-405b / 70b).
 *
 * Hermes Agent (Feb 2026) — open-source autonomous agent with persistent memory,
 * auto-generated reusable skills (SKILL.md format), and a self-improving learning
 * loop. Runs on localhost behind the hermes-cockpit control plane.
 *
 * Adapter responsibilities:
 *   1. Format vault context into Hermes-native system prompt structure
 *   2. Generate per-IS swarm profile configs for the cockpit registry
 *   3. Emit MCP tool definitions Hermes can call back into SIS vaults
 *   4. Support the swarm topology (Conductor → IS Specialist → Executor → Vault Writer)
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 */

import type {
  PlatformAdapter, VaultEntry, ContextInjection, VaultType,
} from './types.js';
import { filterAndSort, estimateTokens, truncateToFit } from './utils.js';

// ── IS taxonomy (locked — matches STACK.md 10-IS table) ──────────────────────

export const IS_DOMAINS = [
  'self', 'wealth', 'family', 'business', 'creator',
  'secondbrain', 'code', 'voice-video', 'brand', 'orchestrator',
] as const;

export type ISDomain = typeof IS_DOMAINS[number];

// ── Hermes swarm profile shape ────────────────────────────────────────────────

export interface HermesAgentProfile {
  id: string;
  name: string;
  profile: string;
  type: 'local' | 'railway' | 'modal';
  status: 'online' | 'offline' | 'starting';
  port: number | null;
  endpoint: string;
  llmProvider: 'OpenRouter' | 'Anthropic' | 'Nous Portal' | 'vLLM';
  model: string;
  purpose: string;
  mcpEnabled: boolean;
  swarmRole: 'specialist' | 'executor' | 'conductor' | 'infrastructure';
  isMapping: ISDomain | 'infra';
  skills: string[];
  vaultAccess: VaultType[];
  sovereignPrivacy?: boolean;
  noExternalCalls?: boolean;
}

export interface HermesSwarmConfig {
  cockpitVersion: string;
  lastUpdated: string;
  agents: HermesAgentProfile[];
}

// ── Model constants ───────────────────────────────────────────────────────────

const HERMES_405B = 'nousresearch/hermes-3-llama-3.1-405b';
const HERMES_70B  = 'nousresearch/hermes-3-llama-3.1-70b';

// ── Adapter ───────────────────────────────────────────────────────────────────

export class HermesAdapter implements PlatformAdapter {
  readonly platform = 'hermes';
  readonly maxContextTokens = 128_000;

  formatContext(entries: VaultEntry[], options?: {
    maxTokens?: number;
    vaults?: VaultType[];
    includeMetadata?: boolean;
    isScope?: ISDomain;
  }): ContextInjection {
    const maxTokens = options?.maxTokens ?? this.maxContextTokens;
    const filtered = filterAndSort(entries, options?.vaults);

    const lines: string[] = [
      '# Starlight Intelligence System — Hermes Agent Context',
      '',
      '> You are a Starlight Hermes agent. Retrieve, reason, synthesize.',
      '> Write results through Memory Claw — never directly to vaults.',
      '',
    ];

    if (options?.isScope) {
      lines.push(`## IS Scope: ${options.isScope.toUpperCase()} Intelligence System`, '');
    }

    lines.push(
      `Loaded ${filtered.length} vault entries across ${new Set(filtered.map(e => e.vault)).size} vaults.`,
      '',
      '---',
      '',
    );

    let currentVault: VaultType | null = null;
    for (const entry of filtered) {
      if (entry.vault !== currentVault) {
        currentVault = entry.vault;
        lines.push(`## ${currentVault.charAt(0).toUpperCase() + currentVault.slice(1)} Vault`, '');
      }
      if (options?.includeMetadata) {
        const meta = [
          entry.confidence ? `confidence: ${entry.confidence}` : null,
          `created: ${entry.createdAt}`,
          entry.tags?.length ? `tags: ${entry.tags.join(', ')}` : null,
        ].filter(Boolean).join(' | ');
        lines.push(`### [${entry.id}] ${meta}`, '');
      }
      lines.push(entry.content, '');
    }

    lines.push('---', '*Built on SIP — Starlight Intelligence Protocol v1.1.1*');

    const content = truncateToFit(lines.join('\n'), maxTokens);
    return { format: 'markdown', content, tokenEstimate: estimateTokens(content) };
  }

  getMcpConfig(serverCommand: string): Record<string, unknown> {
    return {
      hermes_sis: {
        command: serverCommand,
        args: ['--vault-dir', '~/.starlight/vaults'],
        description: 'SIS vault access for Hermes agent profiles',
        tools: ['vault_search', 'vault_write', 'vault_read', 'is_route', 'swarm_dispatch'],
      },
    };
  }

  generateMemoryFile(entries: VaultEntry[]): { filename: string; content: string } {
    const lines = ['# Hermes Agent Memory — Starlight Vaults', `# Generated: ${new Date().toISOString()}`, ''];
    for (const vault of ['strategic', 'technical', 'wisdom', 'operational'] as VaultType[]) {
      const ve = entries.filter(e => e.vault === vault).slice(0, 20);
      if (!ve.length) continue;
      lines.push(`## ${vault.toUpperCase()} VAULT`, '');
      for (const e of ve) lines.push(`- [${e.id}] ${e.content.slice(0, 200).replace(/\n/g, ' ')}`);
      lines.push('');
    }
    return { filename: '.hermes/sis-memory.md', content: lines.join('\n') };
  }

  generateAllAdapterFiles(
    entries: VaultEntry[],
    serverCommand = 'node dist/mcp-server.js',
  ): Array<{ filename: string; content: string; description?: string }> {
    return [
      { ...this.generateMemoryFile(entries), description: 'SIS vault summary for Hermes persistent memory' },
      {
        filename: '.hermes/sis-mcp-config.json',
        content: JSON.stringify(this.getMcpConfig(serverCommand), null, 2),
        description: 'MCP config for Hermes → SIS vault integration',
      },
    ];
  }

  // ── Swarm profile generators ─────────────────────────────────────────────

  generateIsProfiles(domain: ISDomain): HermesAgentProfile[] {
    const portMap: Record<ISDomain, [number, number]> = {
      self:         [8083, 8093],
      wealth:       [8084, 8094],
      family:       [8085, 8095],
      business:     [8086, 8096],
      creator:      [8087, 8097],
      secondbrain:  [8088, 8098],
      code:         [8089, 8099],
      'voice-video':[8100, 8101],
      brand:        [8102, 8103],
      orchestrator: [8104, 8105],
    };

    const purposes: Record<ISDomain, [string, string]> = {
      self:         ['Founder performance intelligence — energy patterns, genius excavation, KEEP/DELEGATE/AUTOMATE/KILL', 'Fast self-IS task decomposition and parallel execution'],
      wealth:       ['Capital & deal intelligence — DPI ledger ops, deal thesis analysis, gate ladder tracking', 'Fast wealth-IS task decomposition'],
      family:       ['Family office intelligence — sovereign privacy mode, no external calls', 'Fast family-IS decomposition (offline, no external network)'],
      business:     ['Executive operating intelligence — company brain sprints, revenue modeling, entity architecture', 'Fast business-IS decomposition'],
      creator:      ['Media & influence intelligence — content pipeline, ACOS integration, distribution orchestration', 'Fast creator-IS decomposition'],
      secondbrain:  ['Private knowledge intelligence — vault search, note synthesis, cross-vault recall', 'Fast second-brain-IS decomposition'],
      code:         ['Product & automation intelligence — repo context, agent harness, implementation packets', 'Fast code-IS decomposition'],
      'voice-video':['Narrative media intelligence — video scripting, podcast ops, content repurposing', 'Fast voice-video-IS decomposition'],
      brand:        ['Reputation & positioning intelligence — brand architecture, public surface monitoring', 'Fast brand-IS decomposition'],
      orchestrator: ['Master IS router — decomposes cross-IS tasks, dispatches all specialists, synthesizes results', 'Fast orchestrator-IS routing'],
    };

    const [specPort, execPort] = portMap[domain];
    const [specPurpose, execPurpose] = purposes[domain];
    const isPrivate = domain === 'family';
    const allVaults: VaultType[] = ['strategic', 'technical', 'creative', 'operational', 'wisdom', 'horizon'];

    const specialist: HermesAgentProfile = {
      id: `hermes-${domain}-specialist`,
      name: `Hermes ${domain.charAt(0).toUpperCase() + domain.slice(1)} Specialist`,
      profile: domain,
      type: 'local',
      status: 'offline',
      port: specPort,
      endpoint: `http://localhost:${specPort}`,
      llmProvider: 'OpenRouter',
      model: HERMES_405B,
      purpose: specPurpose,
      mcpEnabled: true,
      swarmRole: 'specialist',
      isMapping: domain,
      skills: ['intelligence/hermes-search', 'orchestration/workflow-design', 'memory/vault-management'],
      vaultAccess: allVaults,
      ...(isPrivate ? { sovereignPrivacy: true, noExternalCalls: true } : {}),
    };

    const executor: HermesAgentProfile = {
      id: `hermes-${domain}-executor`,
      name: `Hermes ${domain.charAt(0).toUpperCase() + domain.slice(1)} Executor`,
      profile: `${domain}-executor`,
      type: 'local',
      status: 'offline',
      port: execPort,
      endpoint: `http://localhost:${execPort}`,
      llmProvider: 'OpenRouter',
      model: HERMES_70B,
      purpose: execPurpose,
      mcpEnabled: true,
      swarmRole: 'executor',
      isMapping: domain,
      skills: ['orchestration/parallel-execution'],
      vaultAccess: ['operational'],
      ...(isPrivate ? { sovereignPrivacy: true, noExternalCalls: true } : {}),
    };

    return [specialist, executor];
  }

  generateFullSwarmRegistry(existingAgents: HermesAgentProfile[]): HermesSwarmConfig {
    const existingIds = new Set(existingAgents.map(a => a.id));
    const newProfiles: HermesAgentProfile[] = [];

    for (const domain of IS_DOMAINS) {
      for (const profile of this.generateIsProfiles(domain)) {
        if (!existingIds.has(profile.id)) newProfiles.push(profile);
      }
    }

    const allVaults: VaultType[] = ['strategic', 'technical', 'creative', 'operational', 'wisdom', 'horizon'];

    const rawInfra: HermesAgentProfile[] = [
      {
        id: 'hermes-swarm-conductor',
        name: 'Hermes Swarm Conductor',
        profile: 'conductor',
        type: 'local',
        status: 'offline',
        port: 8112,
        endpoint: 'http://localhost:8112',
        llmProvider: 'OpenRouter',
        model: HERMES_405B,
        purpose: 'Top-level swarm conductor — receives task from Starlight Orchestrator, routes to IS specialists, aggregates',
        mcpEnabled: true,
        swarmRole: 'conductor',
        isMapping: 'infra',
        skills: ['orchestration/multi-agent-coordination', 'orchestration/hermes-swarm', 'intelligence/hermes-search'],
        vaultAccess: ['strategic', 'technical', 'operational'],
      },
      {
        id: 'hermes-vault-writer',
        name: 'Hermes Vault Writer',
        profile: 'vault-writer',
        type: 'local',
        status: 'offline',
        port: 8110,
        endpoint: 'http://localhost:8110',
        llmProvider: 'OpenRouter',
        model: HERMES_70B,
        purpose: 'Sole write agent in the swarm — writes synthesis results to SIS vaults via sis-memory-mcp',
        mcpEnabled: true,
        swarmRole: 'infrastructure',
        isMapping: 'infra',
        skills: ['memory/vault-management', 'memory/knowledge-synthesis'],
        vaultAccess: allVaults,
      },
      {
        id: 'hermes-sentinel-monitor',
        name: 'Hermes Sentinel Monitor',
        profile: 'sentinel',
        type: 'local',
        status: 'offline',
        port: 8111,
        endpoint: 'http://localhost:8111',
        llmProvider: 'OpenRouter',
        model: HERMES_70B,
        purpose: 'Monitors swarm for permission violations, secret leakage, and quality gates. Veto-binding.',
        mcpEnabled: true,
        swarmRole: 'infrastructure',
        isMapping: 'infra',
        skills: ['safety/permission-gate', 'safety/secret-detector', 'safety/mutation-approval'],
        vaultAccess: ['operational'],
      },
    ];

    const infra = rawInfra.filter(a => !existingIds.has(a.id));

    return {
      cockpitVersion: '2.0.0',
      lastUpdated: new Date().toISOString(),
      agents: [...existingAgents, ...newProfiles, ...infra],
    };
  }
}
