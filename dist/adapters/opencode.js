/**
 * Starlight Intelligence System — OpenCode Adapter
 *
 * Formats vault context as compact AGENTS.md, prioritized by confidence.
 */
import { filterAndSort, estimateTokens, truncateToFit } from './utils.js';
export class OpenCodeAdapter {
    platform = 'opencode';
    maxContextTokens = 128_000;
    formatContext(entries, options) {
        const maxTokens = options?.maxTokens ?? this.maxContextTokens;
        const filtered = filterAndSort(entries, options?.vaults);
        const lines = [
            '# Starlight Intelligence — Agent Memory',
            '',
        ];
        let currentVault = null;
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
    getMcpConfig(serverCommand) {
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
    generateMemoryFile(entries) {
        const { content } = this.formatContext(entries, { includeMetadata: false });
        return { filename: 'AGENTS.md', content };
    }
}
//# sourceMappingURL=opencode.js.map