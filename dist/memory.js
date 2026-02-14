/**
 * Memory Manager — Persistent cross-session knowledge
 *
 * Stores patterns, decisions, insights, and preferences.
 * Uses file-based storage for portability (no database required).
 * Integrates with the Context Engine for memory-informed prompts.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
// ── Word Index ──────────────────────────────────────────────
class WordIndex {
    index = new Map();
    add(entryId, content) {
        const words = this.tokenize(content);
        for (const word of words) {
            if (!this.index.has(word)) {
                this.index.set(word, new Set());
            }
            this.index.get(word).add(entryId);
        }
    }
    remove(entryId) {
        for (const [, ids] of this.index) {
            ids.delete(entryId);
        }
    }
    search(query) {
        const queryWords = this.tokenize(query);
        const scores = new Map();
        for (const word of queryWords) {
            const matches = this.index.get(word);
            if (matches) {
                for (const id of matches) {
                    scores.set(id, (scores.get(id) ?? 0) + 1);
                }
            }
        }
        return scores;
    }
    tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, " ")
            .split(/\s+/)
            .filter((w) => w.length > 2);
    }
}
// ── Memory Manager ──────────────────────────────────────────
export class MemoryManager {
    entries = new Map();
    index = new WordIndex();
    storagePath;
    dirty = false;
    constructor(storagePath) {
        this.storagePath = storagePath ?? join(process.cwd(), ".starlight", "memory.json");
    }
    /**
     * Initialize: load existing memories from disk.
     */
    load() {
        if (!existsSync(this.storagePath))
            return;
        try {
            const raw = readFileSync(this.storagePath, "utf-8");
            const data = JSON.parse(raw);
            for (const entry of data) {
                this.entries.set(entry.id, entry);
                this.index.add(entry.id, `${entry.content} ${entry.tags.join(" ")}`);
            }
        }
        catch {
            // Corrupted file — start fresh
            this.entries.clear();
        }
    }
    /**
     * Persist memories to disk.
     */
    save() {
        if (!this.dirty)
            return;
        const dir = this.storagePath.replace(/\/[^/]+$/, "");
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
        const data = Array.from(this.entries.values());
        writeFileSync(this.storagePath, JSON.stringify(data, null, 2), "utf-8");
        this.dirty = false;
    }
    /**
     * Add a memory entry.
     */
    add(entry) {
        const id = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const full = {
            ...entry,
            id,
            createdAt: new Date().toISOString(),
        };
        this.entries.set(id, full);
        this.index.add(id, `${full.content} ${full.tags.join(" ")}`);
        this.dirty = true;
        return full;
    }
    /**
     * Search memories by query string and optional filters.
     */
    search(options) {
        const { query, category, limit = 10, minConfidence = 0, } = options;
        const scores = this.index.search(query);
        let results = Array.from(scores.entries())
            .map(([id, score]) => ({
            entry: this.entries.get(id),
            score,
        }))
            .filter((r) => r.entry != null);
        // Apply filters
        if (category) {
            results = results.filter((r) => r.entry.category === category);
        }
        if (minConfidence > 0) {
            results = results.filter((r) => r.entry.confidence >= minConfidence);
        }
        // Sort by score descending, then by recency
        results.sort((a, b) => {
            if (b.score !== a.score)
                return b.score - a.score;
            return b.entry.createdAt.localeCompare(a.entry.createdAt);
        });
        return results.slice(0, limit).map((r) => r.entry);
    }
    /**
     * Get recent memories.
     */
    getRecent(limit = 20) {
        return Array.from(this.entries.values())
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, limit);
    }
    /**
     * Remove a memory by ID.
     */
    remove(id) {
        if (!this.entries.has(id))
            return false;
        this.entries.delete(id);
        this.index.remove(id);
        this.dirty = true;
        return true;
    }
    /**
     * Get statistics about stored memories.
     */
    getStats() {
        const entries = Array.from(this.entries.values());
        const byCategory = {};
        for (const entry of entries) {
            byCategory[entry.category] = (byCategory[entry.category] ?? 0) + 1;
        }
        const sorted = entries.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        return {
            totalEntries: entries.length,
            byCategory,
            oldestEntry: sorted[0]?.createdAt,
            newestEntry: sorted[sorted.length - 1]?.createdAt,
        };
    }
    /**
     * Get all memories (for context injection).
     */
    getAll() {
        return Array.from(this.entries.values());
    }
    /**
     * Get the count of stored memories.
     */
    get size() {
        return this.entries.size;
    }
    /**
     * Get the storage file path.
     */
    get path() {
        return this.storagePath;
    }
}
//# sourceMappingURL=memory.js.map