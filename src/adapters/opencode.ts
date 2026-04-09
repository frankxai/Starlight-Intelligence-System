/**
 * Starlight Intelligence System — OpenCode Adapter
 *
 * Formats vault context as compact AGENTS.md, prioritized by confidence.
 */

import type {
  PlatformAdapter, VaultEntry, ContextInjection, VaultType,
} from './types.js';
import { filterAndSort, estimateTokens, truncateToFit } from './utils.js';

export class OpenCodeAdapter implements PlatformAdapter {
  readonly platform = 'opencode';
  readonly maxContextTokens = 128_000;

  formatContext(entries: VaultEntry[], options?: {
    maxTokens?: number;
    vaults?: VaultType[];
    includeMetadata?: boolean;
  }): ContextInjection {
    const maxTokens = options?.maxTokens ?? this.maxContextTokens;
    const filtered = filterAndSort(entries, options?.vaults);

    const lines: string[] = [
      '# Starlight Intelligence — Agent Memory',
      '',
    ];

    let currentVault: VaultType | null = null;
    for (const entry of filtered) {
      if (entry.vault !== currentVault) {
        currentVault = entry.vault;
        lines.push(`## ${entry.vault.charAt(0).toUpperCase() + entry.vault.slice(1)}\n`);
      }
      lines.push(`- ${entry.content}`);
    }

    const content = truncateToFit(lines.join('\n'), maxTokens);
    return { format: 'markdown', content, tokenEstimate: estimateTokens(content) };
  }

  getMcpConfig(serverCommand: string): Record<string, unknown> {
    return {
      mcpServers: {
        'starlight-sis': {
          command: 'node',
          args: [serverCommand],
          type: 'stdio',
        },
      },
    };
  }

  generateMemoryFile(entries: VaultEntry[]): { filename: string; content: string } {
    const { content } = this.formatContext(entries, { includeMetadata: false });
    return { filename: 'AGENTS.md', content };
  }
}
