/**
 * Starlight Intelligence System — Antigravity Adapter
 *
 * Formats vault context for Google Antigravity (agent-first IDE with native agent swarm support).
 * Leverages Gemini's high context window + Antigravity primitives (define_subagent, invoke_subagent,
 * Agent Manager, browser control, async progress artifacts).
 *
 * Part of the multi-platform adapter set (Claude Code, Cursor, Cline, Codex, Gemini CLI, OpenCode, Antigravity).
 * See .antigravity/instructions.md (full), swarm-protocol.md, mcp-config.json, allowlisted-tools.md.
 * When used as Starlight Orchestrator harness: core/orchestrator/harnesses/antigravity/ (README + system-prompt).
 *
 * Excellence standard: Excellence. Every output carries ambient SIP attestation. Load definitions before use.
 */

import type {
  PlatformAdapter, VaultEntry, ContextInjection, VaultType,
} from './types.js';
import { filterAndSort, estimateTokens, truncateToFit } from './utils.js';

export class AntigravityAdapter implements PlatformAdapter {
  readonly platform = 'antigravity';
  readonly maxContextTokens = 1_000_000;

  formatContext(entries: VaultEntry[], options?: {
    maxTokens?: number;
    vaults?: VaultType[];
    includeMetadata?: boolean;
  }): ContextInjection {
    const maxTokens = options?.maxTokens ?? this.maxContextTokens;
    const filtered = filterAndSort(entries, options?.vaults);

    const lines: string[] = [
      '# Starlight Intelligence System — Antigravity Context',
      '',
      '> Persistent context for Google Antigravity native agentic runtime.',
      '> the agent registry + skills dynamically discovered from agents/, verticals/, skills/.',
      `> Loaded ${filtered.length} entries across ${new Set(filtered.map(e => e.vault)).size} vaults.`,
      '',
      'Reference: .antigravity/instructions.md (full sovereign mandate + registry),',
      '.antigravity/swarm-protocol.md (executable multi-agent orchestration),',
      '.antigravity/mcp-config.json and allowlisted-tools.md (MCP + permissions).',
      'When acting as orchestrator swarm harness: core/orchestrator/harnesses/antigravity/.',
      '',
      '*Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)*',
      '',
    ];

    let currentVault: VaultType | null = null;
    for (const entry of filtered) {
      if (entry.vault !== currentVault) {
        currentVault = entry.vault;
        lines.push(`## ${entry.vault.charAt(0).toUpperCase() + entry.vault.slice(1)} Vault\n`);
      }
      const meta = [
        entry.confidence ? `confidence: ${entry.confidence}` : null,
        `created: ${entry.createdAt}`,
        entry.tags?.length ? `tags: ${entry.tags.join(', ')}` : null,
      ].filter(Boolean).join(' | ');
      lines.push(`### ${entry.id}\n`);
      lines.push(entry.content);
      lines.push(`\n*${meta}*\n`);
    }

    // Excellence footer (ambient attestation)
    lines.push('');
    lines.push('---');
    lines.push('*Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)*');
    lines.push('Layers: file-contract, attestation, sovereignty, agent-swarm-registry, swarm-protocol');
    lines.push('Verticals: .antigravity (platform adapter + core/orchestrator swarm harness)');

    const content = truncateToFit(lines.join('\n'), maxTokens);
    return { format: 'markdown', content, tokenEstimate: estimateTokens(content) };
  }

  getMcpConfig(serverCommand: string): Record<string, unknown> {
    // Rich Antigravity-aware MCP config. Matches .antigravity/mcp-config.json shape.
    // Swarm children default read-only + progress; conductor under scope for writes.
    return {
      mcpServers: {
        'starlight-substrate': {
          _role: 'canonical — always loaded for agent swarms',
          _purpose: 'vaults, agent registry, skills, attestation, memory graph, IS namespaces',
          command: 'node',
          args: [serverCommand],
          env: {
            STARLIGHT_MCP_MODE: 'swarm-aware',
            STARLIGHT_MCP_BREADTH: 'full',
            STARLIGHT_MCP_SWARM: 'true',
          },
        },
      },
      _antigravity_swarm: {
        define_subagent_support: true,
        invoke_subagent_support: true,
        agent_manager_hooks: ['on_subagent_start', 'on_progress', 'on_complete', 'on_error'],
        progress_artifacts: ['todo', 'report', 'trace', 'browser-capture'],
        read_heavy_for_children: true,
      },
    };
  }

  generateMemoryFile(entries: VaultEntry[]): { filename: string; content: string } {
    // Primary instructions surface (enhanced with swarm protocol references + excellence).
    const { content } = this.formatContext(entries, { includeMetadata: true });
    return { filename: '.antigravity/instructions.md', content };
  }

  // --- Antigravity-specific generators (non-breaking additions) ---

  /** Generate the full swarm protocol file content (for scaffolding / sync). */
  generateSwarmProtocolFile(): { filename: string; content: string } {
    // In production this would synthesize from canonical sources; here we return a marker
    // that the hand-maintained .antigravity/swarm-protocol.md is authoritative.
    const content = [
      '# Starlight Intelligence System — Antigravity Agent Swarm Protocol',
      '',
      '> Authoritative copy lives at `.antigravity/swarm-protocol.md`.',
      '> This is the executable manual for define_subagent / invoke_subagent of the agent swarm.',
      '',
      'See `.antigravity/instructions.md` for identity + registry.',
      'See `core/orchestrator/harnesses/antigravity/system-prompt.md` for orchestrator framing.',
      '',
      '*Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)*',
    ].join('\n');
    return { filename: '.antigravity/swarm-protocol.md', content };
  }

  /** Generate Antigravity MCP config file (matches the checked-in .antigravity/mcp-config.json). */
  generateMcpConfigFile(serverCommand: string): { filename: string; content: string } {
    const config = this.getMcpConfig(serverCommand);
    const content = JSON.stringify(config, null, 2) + '\n';
    return { filename: '.antigravity/mcp-config.json', content };
  }

  /** Generate allowlisted-tools.md reference for the Antigravity swarm role. */
  generateAllowlistedToolsFile(): { filename: string; content: string } {
    const content = [
      '# Antigravity Swarm — allowlisted tools (Starlight Intelligence System)',
      '',
      '> See `.antigravity/allowlisted-tools.md` (authoritative, hand-curated for excellence-grade fidelity).',
      '> Contains native primitives (define_subagent, invoke_subagent, Agent Manager, browser_control)',
      '> plus substrate tools, MCP verbs, per-child vs conductor scoping, escalation, and SIP rules.',
      '',
      'When Antigravity runs as orchestrator harness, also consult',
      '`core/orchestrator/harnesses/antigravity/allowlisted-tools.md` (overlay if present).',
      '',
      '*Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)*',
    ].join('\n');
    return { filename: '.antigravity/allowlisted-tools.md', content };
  }

  /**
   * Convenience: return all Antigravity adapter files for a given vault context.
   * Useful for full platform sync / scaffold commands.
   */
  generateAllAdapterFiles(
    entries: VaultEntry[],
    serverCommand = '',
  ): Array<{ filename: string; content: string; description?: string }> {
    const ctx = this.formatContext(entries, { includeMetadata: true });
    return [
      { ...this.generateMemoryFile(entries), description: 'Antigravity memory / instructions surface' },
      { ...this.generateSwarmProtocolFile(), description: 'agent swarm protocol' },
      { ...this.generateMcpConfigFile(serverCommand), description: 'Swarm-aware MCP scope' },
      { ...this.generateAllowlistedToolsFile(), description: 'Allowlisted tools + escalation' },
      { filename: '.antigravity/context-injection.md', content: ctx.content, description: 'Vault context injection' },
    ];
  }
}
