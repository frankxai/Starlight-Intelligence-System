/**
 * src/graph/bitemporal-kg.ts — Bitemporal SQLite Knowledge Graph (Phase 2).
 *
 * Backed by Node built-in `node:sqlite` (`DatabaseSync`) in WAL mode at
 * `<storageRoot>/.starlight/bitemporal-kg.sqlite`.
 *
 * Capabilities:
 * - Node storage (`kg_nodes`) synchronized via SQLite triggers with an FTS5
 *   BM25 virtual index (`kg_nodes_fts`).
 * - Bitemporal directed edges (`kg_edges`) with both valid-time `[valid_from, valid_until)`
 *   and transaction-time `[tx_from, tx_until)` intervals; superseding an active
 *   edge stamps `valid_until` and `tx_until` on prior active rows rather than
 *   deleting history.
 * - Multi-hop point-in-time subgraph retrieval via parameterized `WITH RECURSIVE`
 *   CTEs with cycle prevention, optional relation filters, and defense-in-depth
 *   privacy-tag stripping (`private` / `privacy:*`).
 *
 * Built on SIP — operational tier (graph substrate)
 */

import { DatabaseSync, type SQLInputValue, type SQLOutputValue } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

// ── Public Types ────────────────────────────────────────────

export interface KgNode {
  id: string;
  kind: string;
  label: string;
  repo: string | null;
  tags: string[];
  props: Record<string, unknown>;
  updatedAt: string;
}

export interface KgNodeSearchResult extends KgNode {
  score: number;
}

export interface UpsertNodeInput {
  id: string;
  kind: string;
  label: string;
  repo?: string | null;
  tags?: string[];
  props?: Record<string, unknown>;
  updatedAt?: string;
}

export interface KgEdge {
  edgeId: string;
  src: string;
  rel: string;
  dst: string;
  weight: number;
  confidence: number;
  evidenceUri: string | null;
  commitSha: string | null;
  validFrom: string;
  validUntil: string | null;
  txFrom: string;
  txUntil: string | null;
  tags: string[];
}

export interface AssertEdgeInput {
  edgeId?: string;
  edge_id?: string;
  src: string;
  rel: string;
  dst: string;
  weight?: number;
  confidence?: number;
  evidenceUri?: string | null;
  evidence_uri?: string | null;
  commitSha?: string | null;
  commit_sha?: string | null;
  validFrom?: string;
  valid_from?: string;
  validUntil?: string | null;
  valid_until?: string | null;
  txFrom?: string;
  tx_from?: string;
  txUntil?: string | null;
  tx_until?: string | null;
  tags?: string[];
  /**
   * When true, marks any prior active `(src, rel)` edge's `valid_until` and
   * `tx_until` (functional-single-target relation supersession) instead of
   * deleting history. When false/omitted, only marks prior active edges with
   * the identical `(src, rel, dst)` triple.
   */
  supersedeExisting?: boolean;
}

export interface AssertEdgeResult {
  edge: KgEdge;
  supersededCount: number;
}

export interface QuerySubgraphOptions {
  seedId: string;
  maxDepth?: number;
  asOfValidTime?: string;
  asOfTxTime?: string;
  relFilter?: string | string[];
  direction?: 'outbound' | 'inbound' | 'both';
}

export interface SubgraphResult {
  seedId: string;
  asOfValidTime: string;
  asOfTxTime: string;
  nodes: KgNode[];
  edges: KgEdge[];
}

export interface BitemporalKgOptions {
  /** Storage root; defaults DB path to `<storageRoot>/.starlight/bitemporal-kg.sqlite`. */
  storageRoot?: string;
  /** Explicit SQLite file path or `':memory:'` (overrides `storageRoot`). */
  dbPath?: string;
  /**
   * When true, write operations (`upsertNode`, `assertEdge`) reject any record
   * carrying `private` or `privacy:*` tags at ingress.
   */
  gatewayBoundary?: boolean;
}

export class PrivacyTagError extends Error {
  constructor(message = 'private and privacy:* tags are rejected at the gateway boundary') {
    super(message);
    this.name = 'PrivacyTagError';
  }
}

// ── Schema DDL ──────────────────────────────────────────────

const SCHEMA_DDL = `
CREATE TABLE IF NOT EXISTS kg_nodes (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  label TEXT NOT NULL,
  repo TEXT,
  tags_json TEXT NOT NULL DEFAULT '[]',
  props_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL
);

CREATE VIRTUAL TABLE IF NOT EXISTS kg_nodes_fts USING fts5(
  id UNINDEXED,
  label,
  kind,
  repo
);

CREATE TRIGGER IF NOT EXISTS kg_nodes_ai AFTER INSERT ON kg_nodes BEGIN
  INSERT INTO kg_nodes_fts(rowid, id, label, kind, repo)
  VALUES (new.rowid, new.id, new.label, new.kind, COALESCE(new.repo, ''));
END;

CREATE TRIGGER IF NOT EXISTS kg_nodes_ad AFTER DELETE ON kg_nodes BEGIN
  DELETE FROM kg_nodes_fts WHERE rowid = old.rowid;
END;

CREATE TRIGGER IF NOT EXISTS kg_nodes_au AFTER UPDATE ON kg_nodes BEGIN
  DELETE FROM kg_nodes_fts WHERE rowid = old.rowid;
  INSERT INTO kg_nodes_fts(rowid, id, label, kind, repo)
  VALUES (new.rowid, new.id, new.label, new.kind, COALESCE(new.repo, ''));
END;

CREATE TABLE IF NOT EXISTS kg_edges (
  edge_id TEXT PRIMARY KEY,
  src TEXT NOT NULL,
  rel TEXT NOT NULL,
  dst TEXT NOT NULL,
  weight REAL NOT NULL DEFAULT 1.0,
  confidence REAL NOT NULL DEFAULT 1.0,
  evidence_uri TEXT,
  commit_sha TEXT,
  valid_from TEXT NOT NULL,
  valid_until TEXT,
  tx_from TEXT NOT NULL,
  tx_until TEXT,
  tags_json TEXT NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_kg_edges_src_rel_temporal
  ON kg_edges(src, rel, valid_until, tx_until);

CREATE INDEX IF NOT EXISTS idx_kg_edges_dst_rel_temporal
  ON kg_edges(dst, rel, valid_until, tx_until);
`;

// ── Privacy Helpers ─────────────────────────────────────────

export function isPrivateTag(tag: string): boolean {
  const normalized = tag.trim().toLowerCase();
  return normalized === 'private' || normalized.startsWith('privacy:');
}

export function hasPrivateTags(tags: readonly string[]): boolean {
  return tags.some(isPrivateTag);
}

/**
 * Pure-SQLite predicate checking that a JSON tag array column contains no
 * `'private'` or `'privacy:*'` entry (case-insensitive).
 */
function sqlNotPrivateJson(tagsExpr: string): string {
  return `NOT EXISTS (
    SELECT 1 FROM json_each(${tagsExpr}) jt
    WHERE lower(CAST(jt.value AS TEXT)) = 'private'
       OR lower(CAST(jt.value AS TEXT)) LIKE 'privacy:%'
  )`;
}

/**
 * Bitemporal active-interval predicate on edge alias `e`.
 *
 * Bind order (6 parameters):
 *   1. asOfTx     (`e.tx_from <= ?`)
 *   2. asOfTx     (`e.tx_until <= ?` — supersession already recorded by `asOfTx`)
 *   3. asOfValid  (`e.valid_from <= ?`)
 *   4. asOfValid  (`e.valid_until > ?`)
 *   5. asOfTx     (`e.tx_until > ?` — supersession had NOT occurred yet at `asOfTx`)
 *   6. asOfValid  (`e.valid_from <= ?`)
 *
 * Semantics:
 * - Active un-superseded edges (`tx_until IS NULL`): checks
 *   `(valid_from <= asOfValid AND (valid_until IS NULL OR valid_until > asOfValid))`
 *   and `(tx_from <= asOfTx AND tx_until IS NULL)`.
 * - Edges superseded at `(valid_until = v2, tx_until = tx2)`:
 *   - For `asOfTx < tx2` (transaction time prior to supersession): the edge was
 *     still open-ended (`tx_from <= asOfTx AND tx_until > asOfTx AND valid_from <= asOfValid`).
 *   - For `asOfTx >= tx2` (current or post-supersession transaction state): the
 *     historical valid slice `[valid_from, valid_until)` remains queryable via
 *     `asOfValidTime` (`valid_from <= asOfValid AND valid_until > asOfValid`),
 *     while same-timestamp corrections (`valid_until <= valid_from`) and pure
 *     transaction retractions (`valid_until IS NULL AND tx_until <= asOfTx`)
 *     evaluate false.
 */
const EDGE_BITEMPORAL_SQL = `(
  e.tx_from <= ?
  AND (
    (
      (e.tx_until IS NULL OR (e.tx_until <= ? AND e.valid_until IS NOT NULL))
      AND e.valid_from <= ?
      AND (e.valid_until IS NULL OR e.valid_until > ?)
    )
    OR (
      e.tx_until IS NOT NULL
      AND e.tx_until > ?
      AND e.valid_from <= ?
    )
  )
)`;

function bitemporalParams(asOfValid: string, asOfTx: string): SQLInputValue[] {
  return [asOfTx, asOfTx, asOfValid, asOfValid, asOfTx, asOfValid];
}

// ── BitemporalKnowledgeGraph ────────────────────────────────

export class BitemporalKnowledgeGraph {
  private readonly db: DatabaseSync;
  private readonly gatewayBoundary: boolean;
  private closed = false;

  constructor(options: BitemporalKgOptions = {}) {
    const dbPath =
      options.dbPath ??
      join(options.storageRoot ?? process.cwd(), '.starlight', 'bitemporal-kg.sqlite');

    if (dbPath !== ':memory:') {
      mkdirSync(dirname(dbPath), { recursive: true });
    }

    this.gatewayBoundary = options.gatewayBoundary ?? false;
    this.db = new DatabaseSync(dbPath);
    this.db.exec('PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL; PRAGMA busy_timeout = 5000;');
    this.db.exec(SCHEMA_DDL);
  }

  /**
   * Upsert a node into `kg_nodes` and synchronize `kg_nodes_fts`.
   * Rejects `private` / `privacy:*` tags when `gatewayBoundary` (or `opts.rejectPrivateTags`) is active.
   */
  upsertNode(
    input: UpsertNodeInput,
    opts?: { rejectPrivateTags?: boolean; stripPrivateTags?: boolean },
  ): KgNode {
    if (!input || typeof input.id !== 'string' || !input.id.trim()) {
      throw new Error('node.id is required and must be a non-empty string');
    }
    if (typeof input.kind !== 'string' || !input.kind.trim()) {
      throw new Error('node.kind is required and must be a non-empty string');
    }
    if (typeof input.label !== 'string' || !input.label.trim()) {
      throw new Error('node.label is required and must be a non-empty string');
    }

    const rawTags = Array.isArray(input.tags) ? input.tags.map(String) : [];
    const rejectPrivate = opts?.rejectPrivateTags ?? this.gatewayBoundary;
    if (rejectPrivate && hasPrivateTags(rawTags)) {
      throw new PrivacyTagError();
    }
    const tags = opts?.stripPrivateTags ? rawTags.filter((t) => !isPrivateTag(t)) : rawTags;

    const id = input.id.trim();
    const kind = input.kind.trim();
    const label = input.label.trim();
    const repo = input.repo != null && String(input.repo).trim() !== '' ? String(input.repo).trim() : null;
    const props =
      input.props && typeof input.props === 'object' && !Array.isArray(input.props)
        ? input.props
        : {};
    const updatedAt =
      typeof input.updatedAt === 'string' && input.updatedAt.trim()
        ? input.updatedAt.trim()
        : new Date().toISOString();

    const tagsJson = JSON.stringify(tags);
    const propsJson = JSON.stringify(props);

    this.db
      .prepare(
        `INSERT INTO kg_nodes (id, kind, label, repo, tags_json, props_json, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           kind = excluded.kind,
           label = excluded.label,
           repo = excluded.repo,
           tags_json = excluded.tags_json,
           props_json = excluded.props_json,
           updated_at = excluded.updated_at`,
      )
      .run(id, kind, label, repo, tagsJson, propsJson, updatedAt);

    return {
      id,
      kind,
      label,
      repo,
      tags,
      props,
      updatedAt,
    };
  }

  /**
   * Retrieve a single non-private node by ID, or `null` if missing or privacy-tagged.
   */
  getNode(id: string): KgNode | null {
    const row = this.db
      .prepare(
        `SELECT id, kind, label, repo, tags_json, props_json, updated_at
         FROM kg_nodes
         WHERE id = ? AND ${sqlNotPrivateJson('kg_nodes.tags_json')}`,
      )
      .get(id);
    if (!row) return null;
    const node = rowToNode(row);
    return hasPrivateTags(node.tags) ? null : node;
  }

  /**
   * Assert a bitemporal directed edge in `kg_edges`.
   *
   * - If `supersedeExisting` is true, marks any prior active `(src, rel)` edge's
   *   `valid_until` and `tx_until` with the new assertion's `(validFrom, txFrom)`.
   * - Otherwise, if an active edge with the identical `(src, rel, dst)` triple
   *   exists, marks that prior edge's `valid_until` and `tx_until`.
   * - History rows are never deleted.
   */
  assertEdge(
    input: AssertEdgeInput,
    opts?: { rejectPrivateTags?: boolean; stripPrivateTags?: boolean },
  ): AssertEdgeResult {
    if (!input || typeof input.src !== 'string' || !input.src.trim()) {
      throw new Error('edge.src is required and must be a non-empty string');
    }
    if (typeof input.rel !== 'string' || !input.rel.trim()) {
      throw new Error('edge.rel is required and must be a non-empty string');
    }
    if (typeof input.dst !== 'string' || !input.dst.trim()) {
      throw new Error('edge.dst is required and must be a non-empty string');
    }

    const rawTags = Array.isArray(input.tags) ? input.tags.map(String) : [];
    const rejectPrivate = opts?.rejectPrivateTags ?? this.gatewayBoundary;
    if (rejectPrivate && hasPrivateTags(rawTags)) {
      throw new PrivacyTagError();
    }
    const tags = opts?.stripPrivateTags ? rawTags.filter((t) => !isPrivateTag(t)) : rawTags;

    const nowIso = new Date().toISOString();
    const edgeIdRaw = input.edgeId ?? input.edge_id;
    const edgeId =
      typeof edgeIdRaw === 'string' && edgeIdRaw.trim()
        ? edgeIdRaw.trim()
        : `edge_${randomUUID()}`;
    const src = input.src.trim();
    const rel = input.rel.trim();
    const dst = input.dst.trim();
    const weight = typeof input.weight === 'number' && Number.isFinite(input.weight) ? input.weight : 1.0;
    const confidence =
      typeof input.confidence === 'number' && Number.isFinite(input.confidence)
        ? input.confidence
        : 1.0;
    const evidenceRaw = input.evidenceUri !== undefined ? input.evidenceUri : input.evidence_uri;
    const evidenceUri = evidenceRaw != null && String(evidenceRaw).trim() !== '' ? String(evidenceRaw) : null;
    const commitRaw = input.commitSha !== undefined ? input.commitSha : input.commit_sha;
    const commitSha = commitRaw != null && String(commitRaw).trim() !== '' ? String(commitRaw) : null;

    const validFromRaw = input.validFrom ?? input.valid_from;
    const validFrom =
      typeof validFromRaw === 'string' && validFromRaw.trim() ? validFromRaw.trim() : nowIso;
    const validUntilRaw = input.validUntil !== undefined ? input.validUntil : input.valid_until;
    const validUntil =
      validUntilRaw != null && String(validUntilRaw).trim() !== '' ? String(validUntilRaw).trim() : null;

    const txFromRaw = input.txFrom ?? input.tx_from;
    const txFrom =
      typeof txFromRaw === 'string' && txFromRaw.trim() ? txFromRaw.trim() : nowIso;
    const txUntilRaw = input.txUntil !== undefined ? input.txUntil : input.tx_until;
    const txUntil =
      txUntilRaw != null && String(txUntilRaw).trim() !== '' ? String(txUntilRaw).trim() : null;

    const tagsJson = JSON.stringify(tags);
    const supersedeExisting = Boolean(input.supersedeExisting);

    let supersededCount = 0;
    this.db.exec('BEGIN IMMEDIATE');
    try {
      if (supersedeExisting) {
        const res = this.db
          .prepare(
            `UPDATE kg_edges
             SET valid_until = ?, tx_until = ?
             WHERE src = ? AND rel = ? AND valid_until IS NULL AND tx_until IS NULL AND edge_id != ?`,
          )
          .run(validFrom, txFrom, src, rel, edgeId);
        supersededCount = Number(res.changes);
      } else {
        const res = this.db
          .prepare(
            `UPDATE kg_edges
             SET valid_until = ?, tx_until = ?
             WHERE src = ? AND rel = ? AND dst = ? AND valid_until IS NULL AND tx_until IS NULL AND edge_id != ?`,
          )
          .run(validFrom, txFrom, src, rel, dst, edgeId);
        supersededCount = Number(res.changes);
      }

      this.db
        .prepare(
          `INSERT INTO kg_edges (
            edge_id, src, rel, dst, weight, confidence, evidence_uri, commit_sha,
            valid_from, valid_until, tx_from, tx_until, tags_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(edge_id) DO UPDATE SET
            src = excluded.src,
            rel = excluded.rel,
            dst = excluded.dst,
            weight = excluded.weight,
            confidence = excluded.confidence,
            evidence_uri = excluded.evidence_uri,
            commit_sha = excluded.commit_sha,
            valid_from = excluded.valid_from,
            valid_until = excluded.valid_until,
            tx_from = excluded.tx_from,
            tx_until = excluded.tx_until,
            tags_json = excluded.tags_json`,
        )
        .run(
          edgeId,
          src,
          rel,
          dst,
          weight,
          confidence,
          evidenceUri,
          commitSha,
          validFrom,
          validUntil,
          txFrom,
          txUntil,
          tagsJson,
        );

      this.db.exec('COMMIT');
    } catch (e) {
      try {
        this.db.exec('ROLLBACK');
      } catch {
        /* ignore rollback failure */
      }
      throw e;
    }

    return {
      edge: {
        edgeId,
        src,
        rel,
        dst,
        weight,
        confidence,
        evidenceUri,
        commitSha,
        validFrom,
        validUntil,
        txFrom,
        txUntil,
        tags,
      },
      supersededCount,
    };
  }

  /**
   * Inspect all stored edge versions for `(src, rel)` (including superseded history),
   * stripping any privacy-tagged edges. Useful for auditing bitemporal lineage.
   */
  getEdgeHistory(src: string, rel?: string): KgEdge[] {
    const sql = rel
      ? `SELECT * FROM kg_edges
         WHERE src = ? AND rel = ? AND ${sqlNotPrivateJson('kg_edges.tags_json')}
         ORDER BY tx_from ASC, valid_from ASC, edge_id ASC`
      : `SELECT * FROM kg_edges
         WHERE src = ? AND ${sqlNotPrivateJson('kg_edges.tags_json')}
         ORDER BY tx_from ASC, valid_from ASC, edge_id ASC`;
    const rows = rel
      ? this.db.prepare(sql).all(src, rel)
      : this.db.prepare(sql).all(src);
    return rows.map(rowToEdge).filter((e) => !hasPrivateTags(e.tags));
  }

  /**
   * Multi-hop point-in-time subgraph query using a parameterized `WITH RECURSIVE` CTE.
   *
   * Returns deduplicated nodes and temporally active edges within `maxDepth` hops
   * of `seedId`, stripping all privacy-tagged nodes and edges.
   */
  querySubgraph(options: QuerySubgraphOptions): SubgraphResult {
    if (!options || typeof options.seedId !== 'string' || !options.seedId.trim()) {
      throw new Error('seedId is required and must be a non-empty string');
    }

    const seedId = options.seedId.trim();
    const rawDepth = options.maxDepth ?? 2;
    const maxDepth = Math.max(0, Math.min(16, Math.trunc(rawDepth)));
    const nowIso = new Date().toISOString();
    const asOfValid =
      typeof options.asOfValidTime === 'string' && options.asOfValidTime.trim()
        ? options.asOfValidTime.trim()
        : nowIso;
    const asOfTx =
      typeof options.asOfTxTime === 'string' && options.asOfTxTime.trim()
        ? options.asOfTxTime.trim()
        : nowIso;

    const relList = normalizeRelFilter(options.relFilter);
    const direction = options.direction ?? 'outbound';

    if (maxDepth === 0) {
      const seedNode = this.getNode(seedId);
      return {
        seedId,
        asOfValidTime: asOfValid,
        asOfTxTime: asOfTx,
        nodes: seedNode ? [seedNode] : [],
        edges: [],
      };
    }

    const relSql =
      relList.length > 0 ? `AND e.rel IN (${relList.map(() => '?').join(', ')})` : '';

    // Join condition & next-node expression based on traversal direction
    let joinCondSql: string;
    let nextNodeExpr: string;
    let outerEdgeJoinSql: string;
    if (direction === 'inbound') {
      joinCondSql = 'e.dst = w.node_id';
      nextNodeExpr = 'e.src';
      outerEdgeJoinSql =
        'JOIN reached rd ON rd.node_id = e.dst AND rd.min_depth < ? JOIN reached rs ON rs.node_id = e.src';
    } else if (direction === 'both') {
      joinCondSql = '(e.src = w.node_id OR e.dst = w.node_id)';
      nextNodeExpr = '(CASE WHEN e.src = w.node_id THEN e.dst ELSE e.src END)';
      outerEdgeJoinSql =
        'JOIN reached rs ON rs.node_id = e.src JOIN reached rd ON rd.node_id = e.dst AND (rs.min_depth < ? OR rd.min_depth < ?)';
    } else {
      joinCondSql = 'e.src = w.node_id';
      nextNodeExpr = 'e.dst';
      outerEdgeJoinSql =
        'JOIN reached rs ON rs.node_id = e.src AND rs.min_depth < ? JOIN reached rd ON rd.node_id = e.dst';
    }

    const cteSql = `
      WITH RECURSIVE walk(node_id, depth, visited) AS (
        SELECT ?, 0, ',' || ? || ','
        WHERE NOT EXISTS (
          SELECT 1
          FROM kg_nodes sn, json_each(sn.tags_json) jt
          WHERE sn.id = ?
            AND (lower(CAST(jt.value AS TEXT)) = 'private' OR lower(CAST(jt.value AS TEXT)) LIKE 'privacy:%')
        )
        UNION ALL
        SELECT
          ${nextNodeExpr} AS node_id,
          w.depth + 1 AS depth,
          w.visited || ${nextNodeExpr} || ',' AS visited
        FROM walk w
        JOIN kg_edges e ON ${joinCondSql}
        WHERE w.depth < ?
          AND instr(w.visited, ',' || ${nextNodeExpr} || ',') = 0
          AND ${EDGE_BITEMPORAL_SQL}
          ${relSql}
          AND ${sqlNotPrivateJson('e.tags_json')}
          AND NOT EXISTS (
            SELECT 1
            FROM kg_nodes nn, json_each(nn.tags_json) jt
            WHERE nn.id = ${nextNodeExpr}
              AND (lower(CAST(jt.value AS TEXT)) = 'private' OR lower(CAST(jt.value AS TEXT)) LIKE 'privacy:%')
          )
      ),
      reached AS (
        SELECT node_id, MIN(depth) AS min_depth
        FROM walk
        GROUP BY node_id
      )`;

    const cteParams: SQLInputValue[] = [
      seedId,
      seedId,
      seedId,
      maxDepth,
      ...bitemporalParams(asOfValid, asOfTx),
      ...relList,
    ];

    const nodesSql = `
      ${cteSql}
      SELECT n.id, n.kind, n.label, n.repo, n.tags_json, n.props_json, n.updated_at
      FROM kg_nodes n
      JOIN reached r ON r.node_id = n.id
      WHERE ${sqlNotPrivateJson('n.tags_json')}
      ORDER BY r.min_depth ASC, n.id ASC
    `;

    const edgeDepthParams: SQLInputValue[] =
      direction === 'both' ? [maxDepth, maxDepth] : [maxDepth];

    const edgesSql = `
      ${cteSql}
      SELECT DISTINCT
        e.edge_id, e.src, e.rel, e.dst, e.weight, e.confidence,
        e.evidence_uri, e.commit_sha, e.valid_from, e.valid_until,
        e.tx_from, e.tx_until, e.tags_json
      FROM kg_edges e
      ${outerEdgeJoinSql}
      WHERE ${EDGE_BITEMPORAL_SQL}
        ${relSql}
        AND ${sqlNotPrivateJson('e.tags_json')}
      ORDER BY e.src ASC, e.rel ASC, e.dst ASC, e.edge_id ASC
    `;

    const edgesParams: SQLInputValue[] = [
      ...cteParams,
      ...edgeDepthParams,
      ...bitemporalParams(asOfValid, asOfTx),
      ...relList,
    ];

    const rawNodes = this.db.prepare(nodesSql).all(...cteParams);
    const rawEdges = this.db.prepare(edgesSql).all(...edgesParams);

    // Defense-in-depth TypeScript privacy gate
    const nodes = rawNodes.map(rowToNode).filter((n) => !hasPrivateTags(n.tags));
    const privateNodeIds = new Set<string>();
    for (const r of rawNodes) {
      const parsed = parseStringArray(r.tags_json);
      if (hasPrivateTags(parsed)) {
        privateNodeIds.add(String(r.id));
      }
    }

    const edges = rawEdges
      .map(rowToEdge)
      .filter(
        (e) =>
          !hasPrivateTags(e.tags) &&
          !privateNodeIds.has(e.src) &&
          !privateNodeIds.has(e.dst),
      );

    return {
      seedId,
      asOfValidTime: asOfValid,
      asOfTxTime: asOfTx,
      nodes,
      edges,
    };
  }

  /**
   * Full-text BM25 search across `kg_nodes_fts` (`label`, `kind`, `repo`),
   * stripping any privacy-tagged nodes.
   */
  searchNodes(query: string, limit = 20): KgNodeSearchResult[] {
    if (typeof query !== 'string' || !query.trim()) {
      return [];
    }

    const ftsQuery = buildFtsQuery(query);
    if (!ftsQuery) {
      return [];
    }

    const safeLimit = Math.max(1, Math.min(200, Math.trunc(limit)));

    const rows = this.db
      .prepare(
        `SELECT
           n.id, n.kind, n.label, n.repo, n.tags_json, n.props_json, n.updated_at,
           bm25(kg_nodes_fts) AS rank
         FROM kg_nodes_fts
         JOIN kg_nodes n ON n.rowid = kg_nodes_fts.rowid
         WHERE kg_nodes_fts MATCH ?
           AND ${sqlNotPrivateJson('n.tags_json')}
         ORDER BY rank ASC, n.id ASC
         LIMIT ?`,
      )
      .all(ftsQuery, safeLimit);

    return rows
      .map((row) => {
        const node = rowToNode(row);
        const rankNum = typeof row.rank === 'number' ? row.rank : Number(row.rank ?? 0);
        return {
          ...node,
          score: Math.abs(rankNum),
        };
      })
      .filter((n) => !hasPrivateTags(n.tags));
  }

  /**
   * Close the underlying SQLite connection. Idempotent.
   */
  close(): void {
    if (!this.closed && this.db.isOpen) {
      this.db.close();
      this.closed = true;
    }
  }
}

// ── Internal Parsing Helpers ────────────────────────────────

function normalizeRelFilter(relFilter?: string | string[]): string[] {
  if (!relFilter) return [];
  if (typeof relFilter === 'string') {
    const trimmed = relFilter.trim();
    return trimmed ? [trimmed] : [];
  }
  if (Array.isArray(relFilter)) {
    return relFilter.map((r) => String(r).trim()).filter(Boolean);
  }
  return [];
}

function buildFtsQuery(raw: string): string {
  const tokens = raw
    .replace(/"/g, '""')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
  if (tokens.length === 0) return '';
  return tokens.map((t) => `"${t}"`).join(' OR ');
}

function parseStringArray(raw: SQLOutputValue | undefined): string[] {
  if (typeof raw !== 'string') return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function parseObject(raw: SQLOutputValue | undefined): Record<string, unknown> {
  if (typeof raw !== 'string') return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function rowToNode(row: Record<string, SQLOutputValue>): KgNode {
  return {
    id: String(row.id ?? ''),
    kind: String(row.kind ?? ''),
    label: String(row.label ?? ''),
    repo: row.repo != null ? String(row.repo) : null,
    tags: parseStringArray(row.tags_json),
    props: parseObject(row.props_json),
    updatedAt: String(row.updated_at ?? ''),
  };
}

function rowToEdge(row: Record<string, SQLOutputValue>): KgEdge {
  return {
    edgeId: String(row.edge_id ?? ''),
    src: String(row.src ?? ''),
    rel: String(row.rel ?? ''),
    dst: String(row.dst ?? ''),
    weight: typeof row.weight === 'number' ? row.weight : Number(row.weight ?? 1.0),
    confidence: typeof row.confidence === 'number' ? row.confidence : Number(row.confidence ?? 1.0),
    evidenceUri: row.evidence_uri != null ? String(row.evidence_uri) : null,
    commitSha: row.commit_sha != null ? String(row.commit_sha) : null,
    validFrom: String(row.valid_from ?? ''),
    validUntil: row.valid_until != null ? String(row.valid_until) : null,
    txFrom: String(row.tx_from ?? ''),
    txUntil: row.tx_until != null ? String(row.tx_until) : null,
    tags: parseStringArray(row.tags_json),
  };
}
