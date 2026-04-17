/**
 * Starlight Intelligence System — Claude Code Adapter
 *
 * Formats vault context as CLAUDE.md markdown sections.
 */
import type { PlatformAdapter, VaultEntry, ContextInjection, VaultType } from './types.js';
export declare class ClaudeCodeAdapter implements PlatformAdapter {
    readonly platform = "claude-code";
    readonly maxContextTokens = 200000;
    formatContext(entries: VaultEntry[], options?: {
        maxTokens?: number;
        vaults?: VaultType[];
        includeMetadata?: boolean;
    }): ContextInjection;
    getMcpConfig(serverCommand: string): Record<string, unknown>;
    generateMemoryFile(entries: VaultEntry[]): {
        filename: string;
        content: string;
    };
}
//# sourceMappingURL=claude-code.d.ts.map