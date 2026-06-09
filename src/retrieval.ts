/**
 * Starlight Retrieval Layer — SQLite shadow index over JSONL vaults
 *
 * JSONL files are the source of truth. This module builds a rebuildable
 * FTS5-backed search index for hybrid keyword + vault-filtered queries.
 */
import Database from 'better-sqlite3';
import { readFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { homedir } from 'node:os';
import type { VaultType } from './types.js';

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

// ── RetrievalIndex ─────────────────────────────────────────

export class RetrievalIndex {
  private db: Database.Database;

  constructor(dbPath?: string) {
    const resolved = dbPath ?? join(homedir(), '.starlight', 'index.sqlite');
    const dir = dirname(resolved);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    this.db = new Database(resolved);
    this.db.pragma('journal_mode = WAL');
    this.db.exec(SCHEMA_DDL);
  }

  /** Drop all rows and re-ingest every *.jsonl file in vaultDir. Returns entry count. */
  rebuildFromVaults(vaultDir: string): number {
    if (!existsSync(vaultDir)) return 0;
    const files = readdirSync(vaultDir).filter(f => f.endsWith('.jsonl'));
    const insert = this.db.prepare(UPSERT_SQL);
    let count = 0;

    this.db.transaction(() => {
      this.db.exec('DELETE FROM entries');
      for (const file of files) {
        const vaultName = basename(file, '.jsonl');
        const raw = readFileSync(join(vaultDir, file), 'utf-8');
        for (const line of raw.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          let e: Record<string, unknown>;
          try { e = JSON.parse(trimmed); } catch { continue; }
          const content = String(e.content ?? e.insight ?? e.wish ?? '');
          if (!content) continue;
          insert.run({
            id: String(e.id ?? `${vaultName}_${count}`),
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
