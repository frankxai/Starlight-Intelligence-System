/**
 * Track D v0.1 — eval 6: graph-edge provenance
 *
 * THE substrate invariant for the knowledge graph: every edge cites its
 * evidence. If an edge has empty evidenceRef, the graph is folklore.
 *
 * Asserts:
 *   • every GraphEdge in graph-edges.jsonl has non-empty evidenceRef
 *   • confidence ∈ [0, 1]
 *   • edgeType / source / target / createdBy / createdAt all present
 *   • sis.graph.neighbors REFUSES to return when any matched row is malformed
 *
 * Built on SIP — operational tier, Track D
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync, rmSync, existsSync, readFileSync, appendFileSync, mkdirSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { appendGraphEdge, buildGraphEdge } from '../../src/ledgers.js';
import { isOk, isErr, errOf, withServer } from './_helpers.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const EDGES_PATH = join(REPO_ROOT, 'memory', '_audit', 'graph-edges.jsonl');

const REQUIRED = ['id', 'edgeType', 'source', 'target', 'evidenceRef', 'confidence', 'createdBy', 'createdAt'] as const;

type Row = Record<string, unknown>;

function readEdges(path: string): Row[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf-8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
}

function validateEdge(e: Row, idx: number): string[] {
  const errs: string[] = [];
  for (const f of REQUIRED) if (e[f] == null) errs.push(`#${idx}: missing ${f}`);
  if (typeof e.evidenceRef !== 'string' || !(e.evidenceRef as string).trim()) {
    errs.push(`#${idx}: evidenceRef must be non-empty string`);
  }
  const c = e.confidence;
  if (typeof c !== 'number' || c < 0 || c > 1) {
    errs.push(`#${idx}: confidence must be in [0,1] (got ${String(c)})`);
  }
  return errs;
}

function withTempRoot<T>(fn: (root: string) => T): T {
  const root = mkdtempSync(join(tmpdir(), 'v01-edge-'));
  try { return fn(root); } finally { rmSync(root, { recursive: true, force: true }); }
}

function writeEdgeRow(root: string, edge: Row): void {
  const path = join(root, 'memory', '_audit', 'graph-edges.jsonl');
  mkdirSync(dirname(path), { recursive: true });
  appendFileSync(path, JSON.stringify(edge) + '\n', 'utf-8');
}

const NOW = () => new Date().toISOString();
const VALID_EDGE = (over: Partial<Row> = {}): Row => ({
  id: 'ge_x', edgeType: 'knows', source: 'frank', target: 'starlight',
  evidenceRef: 'evt_real', confidence: 0.9, createdBy: 'test', createdAt: NOW(),
  ...over,
});

describe('Track D / eval 6 — graph-edge provenance', () => {
  it('every row in memory/_audit/graph-edges.jsonl has non-empty evidenceRef + valid fields', () => {
    if (!existsSync(EDGES_PATH)) return;  // STUB: not yet populated
    const edges = readEdges(EDGES_PATH);
    const errs: string[] = [];
    for (let i = 0; i < edges.length; i++) errs.push(...validateEdge(edges[i], i));
    assert.equal(errs.length, 0, `${errs.length} malformed of ${edges.length}:\n  ${errs.slice(0, 10).join('\n  ')}`);
  });

  it('appendGraphEdge writer REFUSES empty evidenceRef (substrate invariant)', () => {
    withTempRoot((root) => {
      const result = appendGraphEdge(root, {
        id: 'bad_1', edgeType: 'knows', source: 'a', target: 'b',
        evidenceRef: '', confidence: 0.8, createdBy: 'test', createdAt: NOW(),
      });
      assert.equal(result.ok, false);
      assert.match(result.error ?? '', /evidenceRef/);
      assert.equal(existsSync(join(root, 'memory', '_audit', 'graph-edges.jsonl')), false);
    });
  });

  it('appendGraphEdge writer REFUSES whitespace-only evidenceRef', () => {
    withTempRoot((root) => {
      const result = appendGraphEdge(root, {
        id: 'bad_2', edgeType: 'knows', source: 'a', target: 'b',
        evidenceRef: '   ', confidence: 0.8, createdBy: 'test', createdAt: NOW(),
      });
      assert.equal(result.ok, false);
    });
  });

  it('appendGraphEdge writer ACCEPTS a valid edge with concrete evidenceRef', () => {
    withTempRoot((root) => {
      const edge = buildGraphEdge({
        edgeType: 'produced', source: 'wp_1', target: 'art_1',
        evidenceRef: 'evt_42', confidence: 0.95, createdBy: 'test',
      });
      assert.equal(appendGraphEdge(root, edge).ok, true);
      const stored = readEdges(join(root, 'memory', '_audit', 'graph-edges.jsonl'));
      assert.equal(stored.length, 1);
      assert.equal(stored[0].evidenceRef, 'evt_42');
    });
  });

  it('sis.graph.neighbors REFUSES to return when ledger contains ANY malformed row', () => {
    withServer((server, root) => {
      // Bypass the writer (which would reject) to plant a malformed row.
      writeEdgeRow(root, VALID_EDGE({ id: 'ge_good' }));
      writeEdgeRow(root, VALID_EDGE({ id: 'ge_bad', target: 'shadow', evidenceRef: '' }));
      const result = server.callTool('sis.graph.neighbors', { entity_id: 'frank' });
      assert.ok(isErr(result), `graph.neighbors must refuse: ${JSON.stringify(result)}`);
      assert.match(errOf(result), /malformed|evidenceRef/i);
    });
  });

  it('sis.graph.neighbors RETURNS results when all rows are well-formed', () => {
    withServer((server, root) => {
      writeEdgeRow(root, VALID_EDGE());
      const result = server.callTool('sis.graph.neighbors', { entity_id: 'frank' });
      assert.ok(isOk(result), errOf(result));
      const edges = (result as { edges: unknown[] }).edges;
      assert.equal(edges.length, 1);
    });
  });
});
