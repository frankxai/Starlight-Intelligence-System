/**
 * Starlight Intelligence System — Cursor Adapter
 *
 * Formats vault context as .cursorrules-style concise rules.
 */
import { filterAndSort, estimateTokens, truncateToFit } from './utils.js';
const PRIORITY_VAULTS = ['technical', 'operational', 'strategic'];
export class CursorAdapter {
    platform = 'cursor';
    maxContextTokens = 128_000;
    formatContext(entries, options) {
        const maxTokens = options?.maxTokens ?? this.maxContextTokens;
        const vaults = options?.vaults ?? PRIORITY_VAULTS;
        const filtered = filterAndSort(entries, vaults);
        const lines = [
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
    getMcpConfig(serverCommand) {
        return {
            mcpServers: {
                'starlight-sis': {
                    command: 'node',
                    args: [serverCommand],
                },
            },
        };
    }
    generateMemoryFile(entries) {
        const { content } = this.formatContext(entries, {
            vaults: PRIORITY_VAULTS,
            includeMetadata: true,
        });
        return { filename: '.cursorrules', content };
    }
}
//# sourceMappingURL=cursor.js.map