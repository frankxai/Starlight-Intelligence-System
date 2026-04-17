/**
 * Starlight Intelligence System — Codex Adapter
 *
 * Formats vault context as AGENTS.md structured markdown, code-focused.
 */
import { filterAndSort, estimateTokens, truncateToFit } from './utils.js';
export class CodexAdapter {
    platform = 'codex';
    maxContextTokens = 192_000;
    formatContext(entries, options) {
        const maxTokens = options?.maxTokens ?? this.maxContextTokens;
        const filtered = filterAndSort(entries, options?.vaults);
        const lines = [
            '# Starlight Intelligence — Agent Memory',
            '',
            '> Auto-generated context for Codex agents.',
            '',
        ];
        let currentVault = null;
        for (const entry of filtered) {
            if (entry.vault !== currentVault) {
                currentVault = entry.vault;
                lines.push(`## ${entry.vault.charAt(0).toUpperCase() + entry.vault.slice(1)} Vault\n`);
            }
            const tags = entry.tags?.length ? ` \`${entry.tags.join('` `')}\`` : '';
            lines.push(`- ${entry.content}${tags}`);
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
        const { content } = this.formatContext(entries, { includeMetadata: true });
        return { filename: 'AGENTS.md', content };
    }
}
//# sourceMappingURL=codex.js.map