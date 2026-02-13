/**
 * Memory Manager — Persistent cross-session knowledge
 *
 * Stores patterns, decisions, insights, and preferences.
 * Uses file-based storage for portability (no database required).
 * Integrates with the Context Engine for memory-informed prompts.
 */
import type { MemoryEntry, MemorySearchOptions, MemoryStats } from "./types.js";
export declare class MemoryManager {
    private entries;
    private index;
    private storagePath;
    private dirty;
    constructor(storagePath?: string);
    /**
     * Initialize: load existing memories from disk.
     */
    load(): void;
    /**
     * Persist memories to disk.
     */
    save(): void;
    /**
     * Add a memory entry.
     */
    add(entry: Omit<MemoryEntry, "id" | "createdAt">): MemoryEntry;
    /**
     * Search memories by query string and optional filters.
     */
    search(options: MemorySearchOptions): MemoryEntry[];
    /**
     * Get recent memories.
     */
    getRecent(limit?: number): MemoryEntry[];
    /**
     * Remove a memory by ID.
     */
    remove(id: string): boolean;
    /**
     * Get statistics about stored memories.
     */
    getStats(): MemoryStats;
    /**
     * Get all memories (for context injection).
     */
    getAll(): MemoryEntry[];
    /**
     * Get the count of stored memories.
     */
    get size(): number;
}
//# sourceMappingURL=memory.d.ts.map