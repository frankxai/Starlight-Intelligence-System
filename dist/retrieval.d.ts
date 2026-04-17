import type { VaultType } from './types.js';
export interface IndexedEntry {
    id: string;
    vault: string;
    content: string;
    category: string | null;
    confidence: string | null;
    tags: string[];
    source: string | null;
    createdAt: string;
    validFrom: string | null;
    validUntil: string | null;
    lastConfirmed: string | null;
}
export interface SearchResult {
    entry: IndexedEntry;
    score: number;
    matchType: 'fts' | 'exact';
}
export declare class RetrievalIndex {
    private db;
    constructor(dbPath?: string);
    /** Drop all rows and re-ingest every *.jsonl file in vaultDir. Returns entry count. */
    rebuildFromVaults(vaultDir: string): number;
    /** FTS5 keyword search with optional vault/confidence filtering. */
    search(query: string, options?: {
        vaults?: VaultType[];
        limit?: number;
        minConfidence?: string;
        includeExpired?: boolean;
    }): SearchResult[];
    /** Upsert a single entry (for real-time indexing after JSONL append). */
    indexEntry(entry: {
        id: string;
        vault: string;
        content?: string;
        insight?: string;
        wish?: string;
        category?: string | null;
        confidence?: string | null;
        tags?: string[];
        source?: string | null;
        createdAt: string;
        validFrom?: string | null;
        validUntil?: string | null;
        lastConfirmed?: string | null;
        metadata?: Record<string, unknown>;
    }): void;
    /** Retrieve a single entry by ID. */
    getEntry(id: string): IndexedEntry | null;
    /** Total count and per-vault breakdown. */
    getStats(): {
        total: number;
        byVault: Record<string, number>;
    };
    /** Close the database connection. */
    close(): void;
}
//# sourceMappingURL=retrieval.d.ts.map