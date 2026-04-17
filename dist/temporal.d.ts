/** Temporal Reasoning — Staleness, Decay & Validity for Vault Entries */
export interface TemporalConfig {
    staleThresholdDays: number;
    decayHalfLifeDays: number;
    defaultValidityDays: number | null;
}
export interface TemporalMeta {
    validFrom: string;
    validUntil: string | null;
    lastConfirmed: string;
    confidenceDecay: number;
}
export interface StalenessReport {
    entryId: string;
    vault: string;
    content: string;
    daysSinceConfirmed: number;
    isStale: boolean;
    isExpired: boolean;
    currentConfidence: number;
    originalConfidence: number;
}
export declare class TemporalEngine {
    private config;
    constructor(config?: Partial<TemporalConfig>);
    /** Create temporal metadata for a new entry. */
    createMeta(confidence?: number): TemporalMeta;
    /** Calculate decayed confidence: original * 0.5^(daysSinceCreated / halfLife). */
    decayedConfidence(meta: TemporalMeta): number;
    /** True if the entry has not been confirmed within the staleness threshold. */
    isStale(meta: TemporalMeta): boolean;
    /** True if the entry is past its validUntil date. */
    isExpired(meta: TemporalMeta): boolean;
    /** Touch lastConfirmed to now, returning updated metadata. */
    confirm(meta: TemporalMeta): TemporalMeta;
    /** Set validUntil to now, effectively expiring the entry. */
    invalidate(meta: TemporalMeta): TemporalMeta;
    /** Scan all *.jsonl files in a vault directory and produce staleness reports. */
    scanVaults(vaultDir: string): StalenessReport[];
    /** Get summary statistics from a set of staleness reports. */
    getStalenessStats(reports: StalenessReport[]): {
        total: number;
        stale: number;
        expired: number;
        healthy: number;
        avgConfidence: number;
        stalestEntry: StalenessReport | null;
    };
    /** Extract TemporalMeta from a raw JSONL entry, filling defaults for legacy data. */
    private extractMeta;
}
//# sourceMappingURL=temporal.d.ts.map