/**
 * Starlight Intelligence System — Claude Code Adapter
 *
 * Formats vault context as CLAUDE.md markdown sections.
 */
import { filterAndSort, estimateTokens, truncateToFit } from './utils.js';
export class ClaudeCodeAdapter {
    platform = 'claude-code';
    maxContextTokens = 200_000;
    formatContext(entries, options) {
        const maxTokens = options?.maxTokens ?? this.maxContextTokens;
        const filtered = filterAndSort(entries, options?.vaults);
        const grouped = groupByVault(filtered);
        const sections = ['# Starlight Intelligence Context\n'];
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
        const { content } = this.formatContext(entries, { includeMetadata: true });
        return { filename: 'CLAUDE.md', content };
    }
}
function groupByVault(entries) {
    const map = new Map();
    for (const e of entries) {
        const list = map.get(e.vault) ?? [];
        list.push(e);
        map.set(e.vault, list);
    }
    return map;
}
function vaultLabel(v) {
    const labels = {
        strategic: 'Strategic', technical: 'Technical', creative: 'Creative',
        operational: 'Operational', wisdom: 'Wisdom', horizon: 'Horizon',
    };
    return labels[v] ?? v;
}
//# sourceMappingURL=claude-code.js.map