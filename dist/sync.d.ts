/**
 * Sync Bridge — ACOS Trajectory → SIS Memory
 *
 * Reads ACOS trajectory files and tool-sequence patterns,
 * classifies them into SIS memory categories, and stores them
 * in the MemoryManager. Tracks synced IDs to avoid duplicates.
 *
 * Classification logic:
 *   - High-success trajectories (≥0.85) → "pattern"
 *   - Architectural/config changes      → "decision"
 *   - Novel tool combinations           → "insight"
 *   - Low-success trajectories (≤0.50)  → "error"
 *   - Recurring preferences             → "preference"
 */
import { MemoryManager } from "./memory.js";
export interface ACOSTrajectory {
    id: string;
    sessionId: string;
    source: string;
    startedAt: string;
    promptCount: number;
    toolCount: number;
    filesModified: string[];
    type: string;
    task: string | null;
    completedAt: string;
    duration: number;
    operationCount: number;
    successScore: number;
    toolBreakdown: Record<string, number>;
    critique: string;
}
export interface ACOSPattern {
    sequence: string;
    type: string;
    count: number;
    avgSuccess: number;
    isNgram: boolean;
    ngramSize: number;
    discoveredAt: string;
    lastSeen: string;
}
export interface SyncState {
    lastSyncAt: string;
    syncedTrajectoryIds: string[];
    syncedPatternKeys: string[];
    totalSynced: number;
}
export interface SyncOptions {
    /** Path to ACOS trajectories directory */
    acosPath: string;
    /** Minimum success score to sync (skip noisy low-value entries) */
    minScore?: number;
    /** Maximum entries to sync per run */
    maxEntries?: number;
    /** Dry run — classify but don't write */
    dryRun?: boolean;
}
export interface SyncResult {
    trajectoriesSynced: number;
    patternsSynced: number;
    skippedDuplicate: number;
    skippedLowValue: number;
    byCategory: Record<string, number>;
    dryRun: boolean;
}
/**
 * Sync ACOS trajectories and patterns into SIS memory.
 */
export declare function syncACOSToSIS(memory: MemoryManager, options: SyncOptions): SyncResult;
//# sourceMappingURL=sync.d.ts.map