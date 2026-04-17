/**
 * Starlight Intelligence System — Codex Adapter
 *
 * Formats vault context as AGENTS.md structured markdown, code-focused.
 */
import type { PlatformAdapter, VaultEntry, ContextInjection, VaultType } from './types.js';
export declare class CodexAdapter implements PlatformAdapter {
    readonly platform = "codex";
    readonly maxContextTokens = 192000;
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
//# sourceMappingURL=codex.d.ts.map