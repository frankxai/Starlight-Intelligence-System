/**
 * src/gateway/crdt.ts — Conflict-free Replicated Data Type (CRDT) logic
 * using Yjs for the SIS Memory Gateway.
 * 
 * Enables multiple agents to sync memory state (e.g., strategic vault entries)
 * without race conditions.
 */

import * as Y from 'yjs';

// Re-using VaultType if available, or just a string fallback.
export type VaultType = 'strategic' | 'technical' | 'creative' | 'operational' | 'wisdom' | 'horizon' | string;

export interface MemoryEntry {
  id: string;
  content: string;
  vault: VaultType;
  tags?: string[];
  confidence?: number;
  source?: string;
  timestamp: number;
}

/**
 * Wrapper around Y.Doc for agent memory sync.
 */
export class CRDTMemorySync {
  private doc: Y.Doc;
  // We use a Y.Map to store memory entries keyed by their unique ID
  // to allow convergent updates and avoid duplication.
  private entriesMap: Y.Map<MemoryEntry>;

  constructor() {
    this.doc = new Y.Doc();
    this.entriesMap = this.doc.getMap<MemoryEntry>('memory_entries');
  }

  /**
   * Add or update an entry in the CRDT vault.
   */
  public addEntry(entry: MemoryEntry): void {
    this.doc.transact(() => {
      this.entriesMap.set(entry.id, entry);
    });
  }

  /**
   * Retrieve all entries currently in the synced state.
   */
  public getEntries(): MemoryEntry[] {
    const entries: MemoryEntry[] = [];
    this.entriesMap.forEach((entry) => {
      entries.push(entry);
    });
    // Sort by timestamp ascending
    return entries.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Retrieve entries for a specific vault.
   */
  public getEntriesByVault(vault: VaultType): MemoryEntry[] {
    return this.getEntries().filter(e => e.vault === vault);
  }

  /**
   * Encode the current CRDT state to sync to another agent.
   */
  public encodeState(): Uint8Array {
    return Y.encodeStateAsUpdate(this.doc);
  }

  /**
   * Encode the state vector to sync.
   */
  public encodeStateVector(): Uint8Array {
    return Y.encodeStateVector(this.doc);
  }

  /**
   * Encode a differential update based on another agent's state vector.
   */
  public encodeUpdateFromVector(stateVector: Uint8Array): Uint8Array {
    return Y.encodeStateAsUpdate(this.doc, stateVector);
  }

  /**
   * Apply an update from another agent.
   */
  public applyUpdate(update: Uint8Array): void {
    Y.applyUpdate(this.doc, update);
  }

  /**
   * Listen to state changes.
   */
  public onChange(callback: (update: Uint8Array, origin: any, doc: Y.Doc) => void): void {
    this.doc.on('update', callback);
  }

  /**
   * Get the underlying Y.Doc if needed for advanced Yjs operations.
   */
  public getDoc(): Y.Doc {
    return this.doc;
  }
}
