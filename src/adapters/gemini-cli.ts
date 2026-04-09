/**
 * Starlight Intelligence System — Gemini CLI Adapter
 *
 * Formats vault context as GEMINI.md with full vault dumps.
 * Gemini's 1M token context allows comprehensive inclusion.
 */

import type {
  PlatformAdapter, VaultEntry, ContextInjection, VaultType,
} from './types.js';
import { filterAndSort, estimateTokens, truncateToFit } from './utils.js';

export class GeminiCliAdapter implements PlatformAdapter {
  readonly platform = 'gemini-cli';
  readonly maxContextTokens = 1_000_000;

  formatContext(entries: VaultEntry[], options?: {
    maxTokens?: number;
    vaults?: VaultType[];
    includeMetadata?: boolean;
  }): ContextInjection {
    const maxTokens = options?.maxTokens ?? this.maxContextTokens;
    const filtered = filterAndSort(entries, options?.vaults);

    const lines: string[] = [
      '# Starlight Intelligence — Full Vault Context',
      '',
      `> ${filtered.length} entries across ${new Set(filtered.map(e => e.vault)).size} vaults`,
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

    const content = truncateToFit(lines.join('\n'), maxTokens);
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
    return { filename: 'GEMINI.md', content };
  }
}
