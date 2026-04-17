/**
 * Starlight Intelligence System — Cursor Adapter
 *
 * Formats vault context as .cursorrules-style concise rules.
 */
import type { PlatformAdapter, VaultEntry, ContextInjection, VaultType } from './types.js';
export declare class CursorAdapter implements PlatformAdapter {
    readonly platform = "cursor";
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
//# sourceMappingURL=cursor.d.ts.map