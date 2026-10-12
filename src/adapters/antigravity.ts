/**
 * Starlight Intelligence System — Antigravity Adapter
 *
 * Formats vault context for Antigravity. Generated files are configuration
 * proposals; they do not establish native CLI/IDE capabilities or permissions.
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
      '> Formatted vault context for an Antigravity host.',
      '> This adapter does not discover or activate native tools, agents or skills.',
      `> Loaded ${filtered.length} entries across ${new Set(filtered.map(e => e.vault)).size} vaults.`,
      '',
      'Reference: .antigravity/instructions.md (full sovereign mandate + registry),',
      '.antigravity/swarm-protocol.md (coordination reference),',
      '.antigravity/mcp-config.json and allowlisted-tools.md (configuration proposals).',
      'The host must verify references, native capabilities and permissions before execution.',
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
    // Empty scaffolding must not start an ambient Node process. The host selects
    // an entry point explicitly and configures permissions in its own harness.
    if (typeof serverCommand !== 'string' || serverCommand.includes('\0')) {
      throw new Error('Invalid Antigravity MCP entry point');
    }
    if (!serverCommand.trim()) return { mcpServers: {} };
    return {
      mcpServers: {
        'starlight-substrate': {
          command: 'node',
          args: [serverCommand],
        },
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
      '> Coordination reference only; this file does not start agents.',
      '> Verify the receiving host\'s supported tools and admission before delegation.',
      '',
      'See `.antigravity/instructions.md` for identity + registry.',
      'See `core/orchestrator/harnesses/antigravity/system-prompt.md` for orchestrator framing.',
      '',
      '*Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)*',
    ].join('\n');
    return { filename: '.antigravity/swarm-protocol.md', content };
  }

  /** Generate an opt-in Antigravity MCP configuration proposal. */
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
      '> Tool-scope reference only; this file does not grant permissions.',
      '> Discover native tools in the installed host and configure its permission engine.',
      '> Verify each agent\'s scope and recovery behavior before execution.',
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
      { ...this.generateMcpConfigFile(serverCommand), description: 'Opt-in MCP configuration proposal' },
      { ...this.generateAllowlistedToolsFile(), description: 'Allowlisted tools + escalation' },
      { filename: '.antigravity/context-injection.md', content: ctx.content, description: 'Vault context injection' },
    ];
  }
}
