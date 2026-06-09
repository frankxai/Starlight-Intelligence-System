/**
 * Memory Manager — Persistent cross-session knowledge
 *
 * Stores patterns, decisions, insights, and preferences.
 * Uses an Event-Sourced append-only JSONL format for conflict-free 
 * multi-device synchronization.
 * Integrates with the Context Engine for memory-informed prompts.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import type {
  MemoryEntry,
  MemorySearchOptions,
  MemoryStats,
} from "./types.js";

// Event Types for Event Sourcing
export type MemoryEvent =
  | { type: "add"; payload: MemoryEntry; timestamp: number }
  | { type: "remove"; id: string; timestamp: number };

// ── Word Index ──────────────────────────────────────────────

class WordIndex {
  private index = new Map<string, Set<string>>();

  add(entryId: string, content: string): void {
    const words = this.tokenize(content);
    for (const word of words) {
      if (!this.index.has(word)) {
        this.index.set(word, new Set());
      }
      this.index.get(word)!.add(entryId);
    }
  }

  remove(entryId: string): void {
    for (const [, ids] of this.index) {
      ids.delete(entryId);
    }
  }

  search(query: string): Map<string, number> {
    const queryWords = this.tokenize(query);
    const scores = new Map<string, number>();

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

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2);
  }
}

// ── Memory Manager ──────────────────────────────────────────

export class MemoryManager {
  private entries = new Map<string, MemoryEntry>();
  private index = new WordIndex();
  private storagePath: string;
  private eventLogPath: string;

  constructor(storagePath?: string) {
    const basePath = storagePath ?? join(process.cwd(), ".starlight", "memory.json");
    this.storagePath = basePath; // Kept for legacy compatibility
    
    // Derive the JSONL event log path
    if (basePath.endsWith('.json')) {
      this.eventLogPath = basePath + 'l';
    } else {
      this.eventLogPath = basePath + '.jsonl';
    }
  }

  /**
   * Initialize: load existing memories from the event log,
   * migrating from the legacy JSON file if necessary.
   */
  load(): void {
    if (this.storageTargetIsDirectory(this.eventLogPath)) return;

    let needsMigration = false;

    // 1. If JSONL exists, read events
    if (existsSync(this.eventLogPath)) {
      try {
        const raw = readFileSync(this.eventLogPath, "utf-8");
        const lines = raw.split("\n").filter(l => l.trim().length > 0);
        
        for (const line of lines) {
          const event = JSON.parse(line) as MemoryEvent;
          this.applyEvent(event);
        }
      } catch (err) {
        console.error("[MemoryManager] Failed to load event log:", err);
      }
    } else {
      needsMigration = true;
    }

    // 2. If legacy JSON exists, read it (migration or initial sync)
    if (existsSync(this.storagePath) && !this.storageTargetIsDirectory(this.storagePath)) {
      try {
        const raw = readFileSync(this.storagePath, "utf-8");
        const data = JSON.parse(raw) as MemoryEntry[];

        // Only migrate entries we don't already have from the JSONL
        let migratedCount = 0;
        for (const entry of data) {
          if (!this.entries.has(entry.id)) {
            this.applyEvent({ type: "add", payload: entry, timestamp: Date.now() });
            this.appendEvent({ type: "add", payload: entry, timestamp: Date.now() });
            migratedCount++;
          }
        }
        
        if (migratedCount > 0 && needsMigration) {
          // Compacted save already happened via appendEvent
        }
      } catch (err) {
        console.error("[MemoryManager] Failed to load legacy JSON:", err);
      }
    }
  }

  /**
   * Apply an event to in-memory state
   */
  private applyEvent(event: MemoryEvent): void {
    if (event.type === "add") {
      const entry = event.payload;
      this.entries.set(entry.id, entry);
      this.index.add(entry.id, `${entry.content} ${entry.tags.join(" ")}`);
    } else if (event.type === "remove") {
      this.entries.delete(event.id);
      this.index.remove(event.id);
    }
  }

  /**
   * Append an event to the JSONL log
   */
  private appendEvent(event: MemoryEvent): void {
    const dir = dirname(this.eventLogPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    appendFileSync(this.eventLogPath, JSON.stringify(event) + "\n", "utf-8");
  }

  /**
   * Save is now a no-op for typical flows since we append on add/remove.
   * However, consumers might call it expecting legacy behavior.
   * We can use it to compact the event log if it gets too large.
   */
  save(): void {
    const dir = dirname(this.eventLogPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    // Compact the log
    const compactedEvents: MemoryEvent[] = Array.from(this.entries.values()).map(entry => ({
      type: "add",
      payload: entry,
      timestamp: Date.now()
    }));
    
    const lines = compactedEvents.map(e => JSON.stringify(e)).join("\n") + "\n";
    writeFileSync(this.eventLogPath, lines, "utf-8");
    
    // Legacy support: update the old JSON file so other tools don't break
    writeFileSync(this.storagePath, JSON.stringify(Array.from(this.entries.values()), null, 2), "utf-8");
  }

  private storageTargetIsDirectory(targetPath: string): boolean {
    try {
      return statSync(targetPath).isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Add a memory entry.
   */
  add(entry: Omit<MemoryEntry, "id" | "createdAt">): MemoryEntry {
    const id = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const full: MemoryEntry = {
      ...entry,
      id,
      createdAt: new Date().toISOString(),
    };

    const event: MemoryEvent = { type: "add", payload: full, timestamp: Date.now() };
    this.applyEvent(event);
    this.appendEvent(event);

    return full;
  }

  /**
   * Search memories by query string and optional filters.
   */
  search(options: MemorySearchOptions): MemoryEntry[] {
    const {
      query,
      category,
      limit = 10,
      minConfidence = 0,
    } = options;

    const scores = this.index.search(query);

    let results = Array.from(scores.entries())
      .map(([id, score]) => ({
        entry: this.entries.get(id)!,
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
      if (b.score !== a.score) return b.score - a.score;
      return b.entry.createdAt.localeCompare(a.entry.createdAt);
    });

    return results.slice(0, limit).map((r) => r.entry);
  }

  /**
   * Get recent memories.
   */
  getRecent(limit = 20): MemoryEntry[] {
    return Array.from(this.entries.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  /**
   * Remove a memory by ID.
   */
  remove(id: string): boolean {
    if (!this.entries.has(id)) return false;
    
    const event: MemoryEvent = { type: "remove", id, timestamp: Date.now() };
    this.applyEvent(event);
    this.appendEvent(event);
    
    return true;
  }

  /**
   * Get statistics about stored memories.
   */
  getStats(): MemoryStats {
    const entries = Array.from(this.entries.values());
    const byCategory: Record<string, number> = {};

    for (const entry of entries) {
      byCategory[entry.category] = (byCategory[entry.category] ?? 0) + 1;
    }

    const sorted = entries.sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt)
    );

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
  getAll(): MemoryEntry[] {
    return Array.from(this.entries.values());
  }

  /**
   * Get the count of stored memories.
   */
  get size(): number {
    return this.entries.size;
  }

  /**
   * Get the storage file path.
   */
  get path(): string {
    return this.eventLogPath;
  }
}
