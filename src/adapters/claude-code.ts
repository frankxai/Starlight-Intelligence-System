/**
 * Starlight Intelligence System — Claude Code Adapter
 *
 * Formats vault context as CLAUDE.md markdown sections.
 */

import type {
  PlatformAdapter, VaultEntry, ContextInjection, VaultType,
} from './types.js';
import { filterAndSort, estimateTokens, truncateToFit } from './utils.js';

export class ClaudeCodeAdapter implements PlatformAdapter {
  readonly platform = 'claude-code';
  readonly maxContextTokens = 200_000;

  formatContext(entries: VaultEntry[], options?: {
    maxTokens?: number;
    vaults?: VaultType[];
    includeMetadata?: boolean;
  }): ContextInjection {
    const maxTokens = options?.maxTokens ?? this.maxContextTokens;
    const filtered = filterAndSort(entries, options?.vaults);
    const grouped = groupByVault(filtered);

    const sections: string[] = ['# Starlight Intelligence Context\n'];
    for (const [vault, items] of grouped) {
      sections.push(`## ${vaultLabel(vault)}\n`);
      for (const entry of items) {
        const meta = options?.includeMetadata
          ? ` *(${entry.confidence ?? '—'}, ${entry.createdAt})*`
          : '';
        sections.push(`- ${entry.content}${meta}`);
      }
      sections.push('');
    }

    const content = truncateToFit(sections.join('\n'), maxTokens);
    return { format: 'markdown', content, tokenEstimate: estimateTokens(content) };
  }

  getMcpConfig(serverCommand: string): Record<string, unknown> {
    return {
      mcpServers: {
        'starlight-sis': {
          command: 'node',
          args: [serverCommand],
        },
      },
    };
  }

  generateMemoryFile(entries: VaultEntry[]): { filename: string; content: string } {
    const { content } = this.formatContext(entries, { includeMetadata: true });
    return { filename: 'CLAUDE.md', content };
  }
}

function groupByVault(entries: VaultEntry[]): Map<VaultType, VaultEntry[]> {
  const map = new Map<VaultType, VaultEntry[]>();
  for (const e of entries) {
    const list = map.get(e.vault) ?? [];
    list.push(e);
    map.set(e.vault, list);
  }
  return map;
}

function vaultLabel(v: VaultType): string {
  const labels: Record<VaultType, string> = {
    strategic: 'Strategic', technical: 'Technical', creative: 'Creative',
    operational: 'Operational', wisdom: 'Wisdom', horizon: 'Horizon',
  };
  return labels[v] ?? v;
}
