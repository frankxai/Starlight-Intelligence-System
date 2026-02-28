/**
 * Multi-Project Sync — Federated Intelligence Across Repos
 *
 * Extends the base sync to handle multiple project sources.
 * Each project (FrankX, ACOS, Arcanea) pushes trajectories to SIS,
 * and SIS generates per-project guidance from cross-project intelligence.
 *
 * Project registry lives in .starlight/projects.json
 */
import { MemoryManager } from "./memory.js";
import { type SyncResult } from "./sync.js";
export interface ProjectRegistration {
    name: string;
    acosPath: string;
    lastSyncAt?: string;
    trajectoriesTotal?: number;
    patternCount?: number;
}
export interface ProjectRegistry {
    projects: ProjectRegistration[];
    lastUpdated: string;
}
export interface MultiSyncResult {
    projectResults: Array<{
        project: string;
        result: SyncResult;
    }>;
    totalSynced: number;
}
export declare function loadRegistry(): ProjectRegistry;
export declare function saveRegistry(registry: ProjectRegistry): void;
export declare function registerProject(name: string, acosPath: string): ProjectRegistration;
export declare function listProjects(): ProjectRegistration[];
/**
 * Sync trajectories from all registered projects into SIS memory.
 * Each entry gets tagged with its source project.
 */
export declare function syncAllProjects(memory: MemoryManager, options?: {
    dryRun?: boolean;
    minScore?: number;
}): MultiSyncResult;
/**
 * Sync a single named project.
 */
export declare function syncProject(memory: MemoryManager, projectName: string, options?: {
    dryRun?: boolean;
    minScore?: number;
    acosPath?: string;
}): SyncResult | null;
//# sourceMappingURL=multi-sync.d.ts.map