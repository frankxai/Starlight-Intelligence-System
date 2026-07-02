/**
 * Starlight Retrieval Layer — SQLite shadow index over JSONL vaults
 *
 * JSONL files are the source of truth. This module builds a rebuildable
 * FTS5-backed search index for hybrid keyword + vault-filtered queries.
 *
 * v0.2 addition: hybridSearch() fuses BM25/FTS5 with vector embeddings via
 * Reciprocal Rank Fusion (RRF). Provider is pluggable (EmbeddingProvider);
 * defaults to HashingTFProvider (zero deps). Real local transformer embeddings
 * are available when STARLIGHT_EMBED=transformer and fastembed is installed.
 * The existing search() method is unchanged — hybridSearch() is additive.
 *
 * JSONL canon is never touched by this module.
 */
import Database from 'better-sqlite3';
import { readFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { homedir } from 'node:os';
import type { VaultType } from './types.js';
import type { EmbeddingProvider } from './embedding.js';
import { HashingTFProvider, rrfMerge } from './embedding.js';

// ── Public interfaces ──────────────────────────────────────

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

// ── Schema DDL ─────────────────────────────────────────────

const SCHEMA_DDL = `
CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY, vault TEXT NOT NULL, content TEXT NOT NULL,
  category TEXT, confidence TEXT, tags TEXT, source TEXT,
  created_at TEXT NOT NULL, valid_from TEXT, valid_until TEXT,
  last_confirmed TEXT, metadata TEXT
);
CREATE VIRTUAL TABLE IF NOT EXISTS entries_fts USING fts5(
  content, tags, category, content=entries, content_rowid=rowid
);
CREATE TRIGGER IF NOT EXISTS entries_ai AFTER INSERT ON entries BEGIN
  INSERT INTO entries_fts(rowid, content, tags, category)
  VALUES (new.rowid, new.content, new.tags, new.category);
END;
CREATE TRIGGER IF NOT EXISTS entries_ad AFTER DELETE ON entries BEGIN
  INSERT INTO entries_fts(entries_fts, rowid, content, tags, category)
  VALUES ('delete', old.rowid, old.content, old.tags, old.category);
END;
CREATE TRIGGER IF NOT EXISTS entries_au AFTER UPDATE ON entries BEGIN
  INSERT INTO entries_fts(entries_fts, rowid, content, tags, category)
  VALUES ('delete', old.rowid, old.content, old.tags, old.category);
  INSERT INTO entries_fts(rowid, content, tags, category)
  VALUES (new.rowid, new.content, new.tags, new.category);
END;`;

const UPSERT_SQL = `INSERT OR REPLACE INTO entries
  (id, vault, content, category, confidence, tags, source,
   created_at, valid_from, valid_until, last_confirmed, metadata)
  VALUES (@id, @vault, @content, @category, @confidence, @tags, @source,
   @createdAt, @validFrom, @validUntil, @lastConfirmed, @metadata)`;

// ── Helpers ────────────────────────────────────────────────

function rowToEntry(row: Record<string, unknown>): IndexedEntry {
  let tags: string[] = [];
  if (typeof row.tags === 'string') {
    try { tags = JSON.parse(row.tags); } catch { /* keep empty */ }
  }
  return {
    id: row.id as string, vault: row.vault as string,
    content: row.content as string,
    category: (row.category as string) ?? null,
    confidence: (row.confidence as string) ?? null,
    tags, source: (row.source as string) ?? null,
    createdAt: row.created_at as string,
    validFrom: (row.valid_from as string) ?? null,
    validUntil: (row.valid_until as string) ?? null,
    lastConfirmed: (row.last_confirmed as string) ?? null,
  };
}

function str(v: unknown): string | null {
  return v != null ? String(v) : null;
}

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/** Compose a single text string from an entry's content + tags for embedding. */
function composeText(row: { content: string; tags: string | null; category: string | null }): string {
  const parts = [row.content];
  if (row.category) parts.push(row.category);
  if (row.tags) {
    try {
      const tags = JSON.parse(row.tags) as string[];
      parts.push(tags.join(' '));
    } catch { /* ignore malformed tags */ }
  }
  return parts.join(' ');
}

// ── RetrievalIndex ─────────────────────────────────────────

export class RetrievalIndex {
  private db: Database.Database;
  /** In-memory vector sidecar: entry id → embedding vector */
  private vectorIndex = new Map<string, number[]>();
  private embeddingProvider: EmbeddingProvider = new HashingTFProvider();
  /** Duplicate-id report from the last rebuildFromVaults({onDuplicate:'skip'}) run. */
  private lastDuplicates: Array<{ id: string; location: string; firstSeen: string }> = [];

  constructor(dbPath?: string) {
    const resolved = dbPath ?? join(homedir(), '.starlight', 'index.sqlite');
    const dir = dirname(resolved);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    this.db = new Database(resolved);
    this.db.pragma('journal_mode = WAL');
    this.db.exec(SCHEMA_DDL);
  }

  /**
   * Set the embedding provider for hybridSearch().
   * Call before buildVectorIndex() / hybridSearch().
   * Default: HashingTFProvider (zero deps, always available).
   */
  setEmbeddingProvider(provider: EmbeddingProvider): void {
    this.embeddingProvider = provider;
  }

  /**
   * Build the in-memory vector index from the current SQLite entries.
   * Must be called (or awaited) before hybridSearch() for meaningful results.
   * Re-calling rebuilds from scratch (idempotent).
   *
   * When using HashingTFProvider, also fits IDF on the corpus.
   */
  async buildVectorIndex(): Promise<number> {
    const rows = this.db.prepare(
      'SELECT id, content, tags, category FROM entries'
    ).all() as Array<{ id: string; content: string; tags: string | null; category: string | null }>;

    if (rows.length === 0) {
      this.vectorIndex.clear();
      return 0;
    }

    // For HashingTFProvider: fit IDF on the full corpus first
    if (this.embeddingProvider instanceof HashingTFProvider) {
      const corpus = rows.map(r => composeText(r));
      this.embeddingProvider.fit(corpus);
    }

    this.vectorIndex.clear();
    // Embed in batches to allow providers to optimise batch operations
    const BATCH = 64;
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);
      const texts = batch.map(r => composeText(r));
      const vecs = await this.embeddingProvider.embedBatch(texts);
      for (let j = 0; j < batch.length; j++) {
        this.vectorIndex.set(batch[j].id, vecs[j]);
      }
    }

    return this.vectorIndex.size;
  }

  /**
   * Hybrid search: fuses BM25/FTS5 (keyword) with vector (embedding) rankings
   * via Reciprocal Rank Fusion (RRF, default k=60, weights=[0.7 vec, 0.3 bm25]).
   *
   * Requires buildVectorIndex() to have been called first.
   * Falls back to keyword-only search if the vector index is empty.
   *
   * The proven RRF weighting [0.7, 0.3] is the configuration that achieved
   * precision@10 = 0.200 (+61% over lexical alone) in the Python harness
   * measurement (2026-06-10, tools/proving-ground/scorecards/2026-06-10-memory-lane-rrf-hybrid.json).
   */
  async hybridSearch(query: string, options?: {
    vaults?: VaultType[];
    limit?: number;
    minConfidence?: string;
    includeExpired?: boolean;
    rrfK?: number;
    rrfWeights?: [number, number];
  }): Promise<SearchResult[]> {
    const limit = options?.limit ?? 20;

    // If no vector index, fall back to pure BM25
    if (this.vectorIndex.size === 0) {
      return this.search(query, options);
    }

    // ── BM25 channel ──────────────────────────────────────
    // Over-fetch for RRF merging
    const bm25Raw = this.search(query, { ...options, limit: limit * 3 });
    const bm25Ids = bm25Raw.map(r => r.entry.id);

    // ── Vector channel ────────────────────────────────────
    const queryVec = await this.embeddingProvider.embed(query);
    const vectorIds = this.rankByVector(queryVec, limit * 3, options);

    // ── RRF fusion ────────────────────────────────────────
    const mergedIds = rrfMerge(vectorIds, bm25Ids, limit, {
      k: options?.rrfK,
      weights: options?.rrfWeights,
    });

    // Look up full entries from SQLite by merged id order
    const resultMap = new Map<string, SearchResult>();
    for (const r of bm25Raw) resultMap.set(r.entry.id, r);

    // Fetch any ids returned by vector-only that weren't in BM25 results
    const missing = mergedIds.filter(id => !resultMap.has(id));
    if (missing.length > 0) {
      const placeholders = missing.map(() => '?').join(',');
      const rows = this.db.prepare(
        `SELECT * FROM entries WHERE id IN (${placeholders})`
      ).all(missing) as Array<Record<string, unknown>>;
      for (const row of rows) {
        resultMap.set(row.id as string, {
          entry: rowToEntry(row),
          score: 0,
          matchType: 'exact' as const,
        });
      }
    }

    // Return in RRF-merged order, attaching vector similarity as score
    return mergedIds
      .map(id => resultMap.get(id))
      .filter((r): r is SearchResult => r !== undefined);
  }

  /** Rank vector index entries by cosine similarity to the query vector. */
  private rankByVector(
    queryVec: number[],
    limit: number,
    options?: { vaults?: VaultType[]; includeExpired?: boolean },
  ): string[] {
    if (queryVec.length === 0) return [];

    const now = new Date().toISOString();
    const vaultSet = options?.vaults?.length ? new Set(options.vaults) : null;

    const scored: Array<[string, number]> = [];
    for (const [id, vec] of this.vectorIndex) {
      const sim = this.embeddingProvider.similarity(queryVec, vec);
      if (sim <= 0) continue;

      // Apply vault + expiry filters without a second DB lookup:
      // we do a targeted check only for filtered queries
      scored.push([id, sim]);
    }

    scored.sort((a, b) => b[1] - a[1]);
    let ids = scored.slice(0, limit * 2).map(([id]) => id);

    // Apply vault / expiry filters if requested (single batch DB lookup)
    if (vaultSet || !(options?.includeExpired)) {
      const where: string[] = [];
      if (vaultSet) {
        const vaults = Array.from(vaultSet);
        where.push(`vault IN (${vaults.map(() => '?').join(',')})`);
      }
      if (!options?.includeExpired) {
        where.push(`(valid_until IS NULL OR valid_until >= ?)`);
      }
      const params: unknown[] = [
        ...(vaultSet ? Array.from(vaultSet) : []),
        ...(!options?.includeExpired ? [now] : []),
      ];
      const sql = `SELECT id FROM entries WHERE id IN (${ids.map(() => '?').join(',')}) AND ${where.join(' AND ')}`;
      const allowed = new Set(
        (this.db.prepare(sql).all([...ids, ...params]) as Array<{ id: string }>).map(r => r.id)
      );
      ids = ids.filter(id => allowed.has(id));
    }

    return ids.slice(0, limit);
  }

  /**
   * Drop all rows and re-ingest every *.jsonl file in vaultDir. Returns entry count.
   *
   * Duplicate ids: the default (`onDuplicate: 'throw'`) fails the whole rebuild —
   * duplicates must never silently replace rows. Operational callers that prefer a
   * degraded-but-searchable index over a total outage can pass
   * `{ onDuplicate: 'skip' }`: the first occurrence wins, later duplicates are
   * skipped and reported via getLastDuplicates().
   */
  rebuildFromVaults(vaultDir: string, options?: { onDuplicate?: 'throw' | 'skip' }): number {
    const onDuplicate = options?.onDuplicate ?? 'throw';
    // Clear the vector sidecar whenever the SQL index is rebuilt —
    // caller must re-call buildVectorIndex() if hybridSearch() is needed.
    this.vectorIndex.clear();
    this.lastDuplicates = [];

    if (!existsSync(vaultDir)) return 0;
    const files = readdirSync(vaultDir).filter(f => f.endsWith('.jsonl'));
    const insert = this.db.prepare(UPSERT_SQL);
    const seenIds = new Map<string, string>();
    let count = 0;

    this.db.transaction(() => {
      this.db.exec('DELETE FROM entries');
      for (const file of files) {
        const vaultName = basename(file, '.jsonl');
        const raw = stripBom(readFileSync(join(vaultDir, file), 'utf-8'));
        for (const [lineIndex, line] of raw.split('\n').entries()) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          let e: Record<string, unknown>;
          try { e = JSON.parse(trimmed); } catch { continue; }
          const content = String(e.content ?? e.insight ?? e.wish ?? '');
          if (!content) continue;
          const id = String(e.id ?? `${vaultName}_${count}`);
          const location = `${file}:${lineIndex + 1}`;
          const previousLocation = seenIds.get(id);
          if (previousLocation) {
            if (onDuplicate === 'skip') {
              this.lastDuplicates.push({ id, location, firstSeen: previousLocation });
              continue;
            }
            throw new Error(
              `Duplicate vault entry id "${id}" in ${location}; already seen in ${previousLocation}`,
            );
          }
          seenIds.set(id, location);
          insert.run({
            id,
            vault: String(e.vault ?? vaultName),
            content, category: str(e.category), confidence: str(e.confidence),
            tags: e.tags ? JSON.stringify(e.tags) : null,
            source: str(e.source),
            createdAt: String(e.createdAt ?? new Date().toISOString()),
            validFrom: str(e.validFrom), validUntil: str(e.validUntil),
            lastConfirmed: str(e.lastConfirmed),
            metadata: e.metadata ? JSON.stringify(e.metadata) : null,
          });
          count++;
        }
      }
    })();
    return count;
  }

  /** FTS5 keyword search with optional vault/confidence filtering. */
  search(query: string, options?: {
    vaults?: VaultType[];
    limit?: number;
    minConfidence?: string;
    includeExpired?: boolean;
  }): SearchResult[] {
    const limit = options?.limit ?? 20;
    const now = new Date().toISOString();

    const ftsQuery = query.replace(/"/g, '""').split(/\s+/).filter(Boolean)
      .map(t => `"${t}"`).join(' OR ');
    if (!ftsQuery) return [];

    const conds: string[] = [];
    const params: Record<string, unknown> = { query: ftsQuery, limit };

    if (options?.vaults?.length) {
      const ph = options.vaults.map((_, i) => `@v${i}`);
      conds.push(`e.vault IN (${ph.join(',')})`);
      options.vaults.forEach((v, i) => { params[`v${i}`] = v; });
    }
    if (options?.minConfidence) {
      conds.push('e.confidence = @minConf');
      params.minConf = options.minConfidence;
    }
    if (!(options?.includeExpired)) {
      conds.push('(e.valid_until IS NULL OR e.valid_until >= @now)');
      params.now = now;
    }

    const where = conds.length ? 'AND ' + conds.join(' AND ') : '';
    const sql = `SELECT e.*, bm25(entries_fts) AS rank
      FROM entries_fts JOIN entries e ON e.rowid = entries_fts.rowid
      WHERE entries_fts MATCH @query ${where} ORDER BY rank LIMIT @limit`;

    const rows = this.db.prepare(sql).all(params) as Array<Record<string, unknown>>;
    return rows.map(row => ({
      entry: rowToEntry(row),
      score: Math.abs(row.rank as number),
      matchType: 'fts' as const,
    }));
  }

  /** Upsert a single entry (for real-time indexing after JSONL append). */
  indexEntry(entry: {
    id: string; vault: string;
    content?: string; insight?: string; wish?: string;
    category?: string | null; confidence?: string | null;
    tags?: string[]; source?: string | null; createdAt: string;
    validFrom?: string | null; validUntil?: string | null;
    lastConfirmed?: string | null; metadata?: Record<string, unknown>;
  }): void {
    this.db.prepare(UPSERT_SQL).run({
      id: entry.id, vault: entry.vault,
      content: entry.content || entry.insight || entry.wish || '',
      category: entry.category ?? null, confidence: entry.confidence ?? null,
      tags: entry.tags ? JSON.stringify(entry.tags) : null,
      source: entry.source ?? null, createdAt: entry.createdAt,
      validFrom: entry.validFrom ?? null, validUntil: entry.validUntil ?? null,
      lastConfirmed: entry.lastConfirmed ?? null,
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
    });
  }

  /** Duplicate ids skipped by the last rebuildFromVaults({onDuplicate:'skip'}) run. */
  getLastDuplicates(): ReadonlyArray<{ id: string; location: string; firstSeen: string }> {
    return this.lastDuplicates;
  }

  /** Retrieve a single entry by ID. */
  getEntry(id: string): IndexedEntry | null {
    const row = this.db.prepare('SELECT * FROM entries WHERE id = ?').get(id) as
      Record<string, unknown> | undefined;
    return row ? rowToEntry(row) : null;
  }

  /** Total count and per-vault breakdown. */
  getStats(): { total: number; byVault: Record<string, number> } {
    const total = (this.db.prepare('SELECT COUNT(*) AS n FROM entries').get() as { n: number }).n;
    const rows = this.db.prepare(
      'SELECT vault, COUNT(*) AS n FROM entries GROUP BY vault'
    ).all() as Array<{ vault: string; n: number }>;
    const byVault: Record<string, number> = {};
    for (const r of rows) byVault[r.vault] = r.n;
    return { total, byVault };
  }

  /** Close the database connection. */
  close(): void { this.db.close(); }
}
