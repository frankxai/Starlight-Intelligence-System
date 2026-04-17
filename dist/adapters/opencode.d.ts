/**
 * Starlight Intelligence System — OpenCode Adapter
 *
 * Formats vault context as compact AGENTS.md, prioritized by confidence.
 */
import type { PlatformAdapter, VaultEntry, ContextInjection, VaultType } from './types.js';
export declare class OpenCodeAdapter implements PlatformAdapter {
    readonly platform = "opencode";
    readonly maxContextTokens = 128000;
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
//# sourceMappingURL=opencode.d.ts.map