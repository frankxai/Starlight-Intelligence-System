/**
 * Starlight Intelligence System — Gemini CLI Adapter
 *
 * Formats vault context as GEMINI.md with full vault dumps.
 * Gemini's 1M token context allows comprehensive inclusion.
 */
import type { PlatformAdapter, VaultEntry, ContextInjection, VaultType } from './types.js';
export declare class GeminiCliAdapter implements PlatformAdapter {
    readonly platform = "gemini-cli";
    readonly maxContextTokens = 1000000;
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
//# sourceMappingURL=gemini-cli.d.ts.map