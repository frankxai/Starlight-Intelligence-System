/**
 * Starlight Intelligence System — Cursor Adapter
 *
 * Formats vault context as .cursorrules-style concise rules.
 */

import type {
  PlatformAdapter, VaultEntry, ContextInjection, VaultType,
} from './types.js';
import { filterAndSort, estimateTokens, truncateToFit } from './utils.js';

const PRIORITY_VAULTS: VaultType[] = ['technical', 'operational', 'strategic'];

export class CursorAdapter implements PlatformAdapter {
  readonly platform = 'cursor';
  readonly maxContextTokens = 128_000;

  formatContext(entries: VaultEntry[], options?: {
    maxTokens?: number;
    vaults?: VaultType[];
    includeMetadata?: boolean;
  }): ContextInjection {
    const maxTokens = options?.maxTokens ?? this.maxContextTokens;
    const vaults = options?.vaults ?? PRIORITY_VAULTS;
    const filtered = filterAndSort(entries, vaults);

    const lines: string[] = [
      '# Starlight Intelligence Rules',
      '',
      '## Context',
      '',
    ];
    for (const entry of filtered) {
      const prefix = options?.includeMetadata
        ? `[${entry.vault}/${entry.confidence ?? '—'}] `
        : '';
      lines.push(`- ${prefix}${entry.content}`);
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
    const { content } = this.formatContext(entries, {
      vaults: PRIORITY_VAULTS,
      includeMetadata: true,
    });
    return { filename: '.cursorrules', content };
  }
}
