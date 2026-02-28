/**
 * Vault-Aware Memory Manager — Extends Starlight Memory with Semantic Vaults
 *
 * Adds the six Starlight Vaults on top of the existing MemoryManager:
 * Strategic, Technical, Creative, Operational, Wisdom, Horizon
 *
 * Works entirely through the public API of MemoryManager so that private
 * internals remain encapsulated.
 */
import { MemoryManager } from './memory.js';
import type { VaultType, VaultEntry, VaultSearchOptions, VaultSearchResult, VaultStats, HorizonEntry, VaultMemoryConfig } from './types.js';
export declare class VaultMemory extends MemoryManager {
    private vaultIndex;
    private horizonPath;
    private vaultConfig;
    constructor(config?: VaultMemoryConfig);
    /**
     * Classify content into the most appropriate vault based on keyword analysis.
     * Returns the vault with the highest keyword match count, falling back to the
     * configured default vault when no keywords match.
     */
    classifyVault(content: string): VaultType;
    /**
     * Store a memory entry with vault classification.
     * If no vault is provided the content is auto-classified.
     */
    rememberInVault(content: string, vault?: VaultType, tags?: string[], confidence?: number, source?: string): VaultEntry;
    /**
     * Search memories with optional vault-type filtering and custom sort.
     */
    searchVaults(options: VaultSearchOptions): VaultSearchResult[];
    /**
     * Append a benevolent wish to the Horizon Vault (append-only ledger).
     */
    appendHorizon(wish: string, context: string, author?: string, coAuthored?: boolean): HorizonEntry;
    /**
     * Read all Horizon entries from the append-only ledger.
     */
    getHorizonEntries(): HorizonEntry[];
    /**
     * Compute per-vault statistics across all stored memories.
     */
    getVaultStats(): VaultStats[];
}
//# sourceMappingURL=vault-memory.d.ts.map