/**
 * Phase 2 — Bitemporal SQLite Knowledge Graph & OTel `gen_ai.*` Span Store Tests.
 *
 * Covers:
 *   1. SQLite WAL persistence + FTS5 BM25 node upsert/update/search sync
 *   2. Bitemporal edge supersession (`valid_until` / `tx_until` preserved, never deleted)
 *   3. Point-in-time subgraph queries (`asOfValidTime` before & after supersession, `asOfTxTime` rollback)
 *   4. Parameterized `WITH RECURSIVE` multi-hop traversal, diamond deduplication, cycle safety, `relFilter`
 *   5. Privacy-tag rejection at gateway boundary + defense-in-depth stripping across hops
 *   6. OTel `gen_ai.*` span recording & aggregation (`provider`, `brand_id`, `workflow_id`, `agent_id`, `sinceIso`)
 *   7. Full `SisGatewayCore` + `SisGatewayDaemon` HTTP v1 route verification
 *
 * SECURITY NOTE: identifier and numeric assertions only — never interpolates
 * raw fixture payloads into error messages.
 *
 * Built on SIP — Starlight Intelligence Protocol
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { request as httpRequest } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import {
  BitemporalKnowledgeGraph,
  PrivacyTagError,
} from '../src/graph/bitemporal-kg.js';
import { OtelGenAiStore } from '../src/telemetry/otel-sqlite.js';
import { SisGatewayCore } from '../src/gateway/server.js';
import { InProcessTransport, SisMemoryClient } from '../src/gateway/client.js';
import { SisGatewayDaemon } from '../src/gateway/daemon.js';

// ── HTTP helper for live daemon verification ─────────────────

function sendDaemonHttp(
  port: number,
  method: 'GET' | 'POST',
  path: string,
  token: string,
  body?: unknown,
): Promise<{ status: number; body: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    const payload = body !== undefined ? JSON.stringify(body) : '';
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    if (payload) {
      headers['Content-Length'] = String(Buffer.byteLength(payload));
    }

    const req = httpRequest(
      { hostname: '127.0.0.1', port, path, method, headers },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c as Buffer));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf-8');
          const parsed = JSON.parse(raw) as Record<string, unknown>;
          resolve({ status: res.statusCode ?? 0, body: parsed });
        });
        res.on('error', reject);
      },
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ── 1. Bitemporal KG: SQLite WAL, Upsert & FTS5 BM25 ─────────

describe('BitemporalKnowledgeGraph — WAL persistence & FTS5 BM25 sync', () => {
  let root: string;

  before(() => {
    root = mkdtempSync(join(tmpdir(), 'sis-bkg-fts-'));
  });

  after(() => {
    try {
      rmSync(root, { recursive: true, force: true });
    } catch {
      /* ignore Windows cleanup race */
    }
  });

  it('creates .starlight/bitemporal-kg.sqlite in WAL mode and keeps FTS5 in sync across upserts', () => {
    const kg = new BitemporalKnowledgeGraph({ storageRoot: root });
    try {
      const sqlitePath = join(root, '.starlight', 'bitemporal-kg.sqlite');
      assert.ok(existsSync(sqlitePath), 'bitemporal-kg.sqlite file must exist');

      kg.upsertNode({
        id: 'svc:gateway',
        kind: 'service',
        label: 'Starlight Sovereign Memory Gateway',
        repo: 'frankxai/Starlight-Intelligence-System',
        tags: ['substrate', 'gateway'],
        props: { port: 'ephemeral' },
      });

      kg.upsertNode({
        id: 'svc:conductor',
        kind: 'orchestrator',
        label: 'Jules Fleet Conductor',
        repo: 'frankxai/Starlight-Intelligence-System',
        tags: ['orchestration'],
      });

      const initialHits = kg.searchNodes('Sovereign Gateway', 10);
      assert.equal(initialHits.length, 1);
      assert.equal(initialHits[0]?.id, 'svc:gateway');
      assert.ok((initialHits[0]?.score ?? 0) >= 0);

      // Update label in place — old unique token must disappear from FTS5
      kg.upsertNode({
        id: 'svc:gateway',
        kind: 'service',
        label: 'Hyperbolic Temporal Mesh Router',
        repo: 'frankxai/Starlight-Intelligence-System',
        tags: ['substrate', 'router'],
      });

      const staleHits = kg.searchNodes('Sovereign', 10);
      assert.equal(staleHits.length, 0, 'updated node must drop stale FTS5 tokens');

      const freshHits = kg.searchNodes('Hyperbolic Temporal', 10);
      assert.equal(freshHits.length, 1);
      assert.equal(freshHits[0]?.id, 'svc:gateway');
    } finally {
      kg.close();
    }

    // Verify WAL mode and durable persistence on reopen
    const inspectDb = new DatabaseSync(join(root, '.starlight', 'bitemporal-kg.sqlite'));
    try {
      const modeRow = inspectDb.prepare('PRAGMA journal_mode').get() as { journal_mode?: string };
      assert.equal(String(modeRow.journal_mode).toLowerCase(), 'wal');
    } finally {
      inspectDb.close();
    }
  });
});

// ── 2. Bitemporal Point-in-Time Supersession ──────────────────

describe('BitemporalKnowledgeGraph — point-in-time valid & transaction queries', () => {
  let root: string;
  let kg: BitemporalKnowledgeGraph;

  const T_JAN = '2026-01-01T00:00:00.000Z';
  const T_MAR = '2026-03-15T00:00:00.000Z';
  const T_JUN = '2026-06-01T00:00:00.000Z';
  const T_SEP = '2026-09-15T00:00:00.000Z';
  const T_PRE = '2025-12-01T00:00:00.000Z';

  before(() => {
    root = mkdtempSync(join(tmpdir(), 'sis-bkg-temporal-'));
    kg = new BitemporalKnowledgeGraph({ storageRoot: root });

    kg.upsertNode({ id: 'agent:architect', kind: 'agent', label: 'Starlight Architect' });
    kg.upsertNode({ id: 'model:v1', kind: 'model', label: 'Frontier Model V1' });
    kg.upsertNode({ id: 'model:v2', kind: 'model', label: 'Frontier Model V2' });
    kg.upsertNode({ id: 'skill:graph', kind: 'skill', label: 'Graph Skill' });

    // Initial edge valid from Jan 1
    const first = kg.assertEdge({
      edgeId: 'edge-model-v1',
      src: 'agent:architect',
      rel: 'routed_to',
      dst: 'model:v1',
      validFrom: T_JAN,
      txFrom: T_JAN,
      commitSha: '1111111',
    });
    assert.equal(first.supersededCount, 0);

    // Parallel non-functional relation that stays active across the whole year
    kg.assertEdge({
      edgeId: 'edge-skill-graph',
      src: 'agent:architect',
      rel: 'loads_skill',
      dst: 'skill:graph',
      validFrom: T_JAN,
      txFrom: T_JAN,
    });

    // Supersede `routed_to` on Jun 1 with model:v2
    const second = kg.assertEdge({
      edgeId: 'edge-model-v2',
      src: 'agent:architect',
      rel: 'routed_to',
      dst: 'model:v2',
      validFrom: T_JUN,
      txFrom: T_JUN,
      commitSha: '2222222',
      supersedeExisting: true,
    });
    assert.equal(second.supersededCount, 1);
  });

  after(() => {
    kg.close();
    try {
      rmSync(root, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  });

  it('preserves full edge lineage without deleting superseded rows', () => {
    const history = kg.getEdgeHistory('agent:architect', 'routed_to');
    assert.equal(history.length, 2, 'both historical and active edges must remain stored');

    const v1Edge = history.find((e) => e.edgeId === 'edge-model-v1');
    const v2Edge = history.find((e) => e.edgeId === 'edge-model-v2');
    assert.ok(v1Edge);
    assert.ok(v2Edge);
    assert.equal(v1Edge.validFrom, T_JAN);
    assert.equal(v1Edge.validUntil, T_JUN);
    assert.equal(v1Edge.txUntil, T_JUN);
    assert.equal(v2Edge.validFrom, T_JUN);
    assert.equal(v2Edge.validUntil, null);
    assert.equal(v2Edge.txUntil, null);
  });

  it('returns pre-supersession target when asOfValidTime is before supersession', () => {
    const sub = kg.querySubgraph({
      seedId: 'agent:architect',
      maxDepth: 1,
      asOfValidTime: T_MAR,
      relFilter: 'routed_to',
    });

    const nodeIds = sub.nodes.map((n) => n.id).sort();
    assert.deepEqual(nodeIds, ['agent:architect', 'model:v1']);
    assert.equal(sub.edges.length, 1);
    assert.equal(sub.edges[0]?.dst, 'model:v1');
  });

  it('returns post-supersession target when asOfValidTime is after supersession', () => {
    const sub = kg.querySubgraph({
      seedId: 'agent:architect',
      maxDepth: 1,
      asOfValidTime: T_SEP,
      relFilter: 'routed_to',
    });

    const nodeIds = sub.nodes.map((n) => n.id).sort();
    assert.deepEqual(nodeIds, ['agent:architect', 'model:v2']);
    assert.equal(sub.edges.length, 1);
    assert.equal(sub.edges[0]?.dst, 'model:v2');
  });

  it('returns zero edges when asOfValidTime predates all assertions', () => {
    const sub = kg.querySubgraph({
      seedId: 'agent:architect',
      maxDepth: 2,
      asOfValidTime: T_PRE,
    });

    assert.deepEqual(sub.nodes.map((n) => n.id), ['agent:architect']);
    assert.equal(sub.edges.length, 0);
  });

  it('supports transaction-time rollback (asOfTxTime) across retroactive corrections', () => {
    kg.upsertNode({ id: 'cfg:endpoint', kind: 'config', label: 'Endpoint Config' });
    kg.upsertNode({ id: 'region:us', kind: 'region', label: 'US Region' });
    kg.upsertNode({ id: 'region:eu', kind: 'region', label: 'EU Region' });

    // Recorded on Jan 1: erroneously believed region was US since Jan 1
    kg.assertEdge({
      src: 'cfg:endpoint',
      rel: 'pinned_region',
      dst: 'region:us',
      validFrom: T_JAN,
      txFrom: T_JAN,
    });

    // Corrected on Jun 1: region was actually EU since Jan 1
    kg.assertEdge({
      src: 'cfg:endpoint',
      rel: 'pinned_region',
      dst: 'region:eu',
      validFrom: T_JAN,
      txFrom: T_JUN,
      supersedeExisting: true,
    });

    // At tx = Mar 15 (before Jun 1 correction), DB believed US
    const beliefInMarch = kg.querySubgraph({
      seedId: 'cfg:endpoint',
      maxDepth: 1,
      asOfValidTime: T_MAR,
      asOfTxTime: T_MAR,
    });
    assert.equal(beliefInMarch.edges.length, 1);
    assert.equal(beliefInMarch.edges[0]?.dst, 'region:us');

    // At tx = Sep 15 (after Jun 1 correction), DB knows EU for the exact same valid time
    const beliefInSept = kg.querySubgraph({
      seedId: 'cfg:endpoint',
      maxDepth: 1,
      asOfValidTime: T_MAR,
      asOfTxTime: T_SEP,
    });
    assert.equal(beliefInSept.edges.length, 1);
    assert.equal(beliefInSept.edges[0]?.dst, 'region:eu');
  });
});

// ── 3. Multi-hop Recursive Traversal, Cycles & Privacy ────────

describe('BitemporalKnowledgeGraph — multi-hop CTE, cycles & privacy-tag stripping', () => {
  let root: string;
  let kg: BitemporalKnowledgeGraph;

  before(() => {
    root = mkdtempSync(join(tmpdir(), 'sis-bkg-hops-'));
    kg = new BitemporalKnowledgeGraph({ storageRoot: root });

    // Public diamond + 4-hop chain + cycle:
    // n0 -> n1a -> n2 -> n3 -> n4
    // n0 -> n1b -> n2
    // n2 -> n0 (cycle)
    for (const id of ['n0', 'n1a', 'n1b', 'n2', 'n3', 'n4', 'pub-leaf-behind-priv']) {
      kg.upsertNode({ id, kind: 'module', label: `Module ${id}`, tags: ['public'] });
    }

    // Internal private node + edge written directly to SQLite substrate
    kg.upsertNode({
      id: 'priv-mid',
      kind: 'secret-module',
      label: 'Classified Bridge',
      tags: ['privacy:second-brain'],
    });
    kg.upsertNode({
      id: 'priv-direct',
      kind: 'secret-doc',
      label: 'Private Note',
      tags: ['PRIVATE'],
    });

    const t0 = '2026-02-01T00:00:00.000Z';
    kg.assertEdge({ src: 'n0', rel: 'depends_on', dst: 'n1a', validFrom: t0, txFrom: t0 });
    kg.assertEdge({ src: 'n0', rel: 'depends_on', dst: 'n1b', validFrom: t0, txFrom: t0 });
    kg.assertEdge({ src: 'n1a', rel: 'depends_on', dst: 'n2', validFrom: t0, txFrom: t0 });
    kg.assertEdge({ src: 'n1b', rel: 'depends_on', dst: 'n2', validFrom: t0, txFrom: t0 });
    kg.assertEdge({ src: 'n2', rel: 'depends_on', dst: 'n3', validFrom: t0, txFrom: t0 });
    kg.assertEdge({ src: 'n3', rel: 'depends_on', dst: 'n4', validFrom: t0, txFrom: t0 });
    kg.assertEdge({ src: 'n2', rel: 'depends_on', dst: 'n0', validFrom: t0, txFrom: t0 });

    // Private paths that must NEVER be traversed or returned
    kg.assertEdge({ src: 'n0', rel: 'depends_on', dst: 'priv-mid', validFrom: t0, txFrom: t0 });
    kg.assertEdge({
      src: 'priv-mid',
      rel: 'depends_on',
      dst: 'pub-leaf-behind-priv',
      validFrom: t0,
      txFrom: t0,
    });
    kg.assertEdge({ src: 'n0', rel: 'depends_on', dst: 'priv-direct', validFrom: t0, txFrom: t0 });
    kg.assertEdge({
      src: 'n0',
      rel: 'depends_on',
      dst: 'n4',
      validFrom: t0,
      txFrom: t0,
      tags: ['private'],
    });
  });

  after(() => {
    kg.close();
    try {
      rmSync(root, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  });

  it('deduplicates diamond paths, terminates cycles, and enforces maxDepth', () => {
    const hop1 = kg.querySubgraph({ seedId: 'n0', maxDepth: 1 });
    assert.deepEqual(
      hop1.nodes.map((n) => n.id).sort(),
      ['n0', 'n1a', 'n1b'],
    );
    assert.equal(hop1.edges.length, 2);

    const hop2 = kg.querySubgraph({ seedId: 'n0', maxDepth: 2 });
    assert.deepEqual(
      hop2.nodes.map((n) => n.id).sort(),
      ['n0', 'n1a', 'n1b', 'n2'],
    );
    // Outbound edges whose src is at depth < 2 (n0->n1a, n0->n1b, n1a->n2, n1b->n2)
    assert.equal(hop2.edges.length, 4);

    const hop3 = kg.querySubgraph({ seedId: 'n0', maxDepth: 3 });
    assert.deepEqual(
      hop3.nodes.map((n) => n.id).sort(),
      ['n0', 'n1a', 'n1b', 'n2', 'n3'],
    );
    assert.ok(!hop3.nodes.some((n) => n.id === 'n4'), '4th hop n4 must not appear at maxDepth=3');
  });

  it('strips privacy-tagged nodes, edges, and transitive paths through private nodes', () => {
    const sub = kg.querySubgraph({ seedId: 'n0', maxDepth: 4 });
    const nodeIds = new Set(sub.nodes.map((n) => n.id));

    assert.ok(!nodeIds.has('priv-mid'), 'privacy:* node must be stripped');
    assert.ok(!nodeIds.has('priv-direct'), 'PRIVATE node must be stripped');
    assert.ok(
      !nodeIds.has('pub-leaf-behind-priv'),
      'traversal must not hop through a privacy-tagged intermediate node',
    );
    assert.ok(
      !sub.edges.some((e) => e.src === 'n0' && e.dst === 'n4'),
      'private-tagged shortcut edge n0->n4 must be stripped',
    );

    // Querying a private seed directly returns empty subgraph
    const privSeed = kg.querySubgraph({ seedId: 'priv-mid', maxDepth: 2 });
    assert.deepEqual(privSeed.nodes, []);
    assert.deepEqual(privSeed.edges, []);

    // FTS5 search also strips private nodes
    const ftsPriv = kg.searchNodes('Classified Private Module', 20);
    assert.ok(!ftsPriv.some((n) => n.id === 'priv-mid' || n.id === 'priv-direct'));
  });

  it('rejects private tags on write when gatewayBoundary is enabled', () => {
    const gwKg = new BitemporalKnowledgeGraph({ dbPath: ':memory:', gatewayBoundary: true });
    try {
      assert.throws(
        () =>
          gwKg.upsertNode({
            id: 'bad-node',
            kind: 'note',
            label: 'Forbidden',
            tags: ['privacy:vault'],
          }),
        PrivacyTagError,
      );
      assert.throws(
        () =>
          gwKg.assertEdge({
            src: 'a',
            rel: 'r',
            dst: 'b',
            tags: ['private'],
          }),
        PrivacyTagError,
      );
    } finally {
      gwKg.close();
    }
  });
});

// ── 4. OTel gen_ai.* Span Store & Attribution Summary ─────────

describe('OtelGenAiStore — span persistence & multi-dimensional aggregation', () => {
  let root: string;
  let store: OtelGenAiStore;

  before(() => {
    root = mkdtempSync(join(tmpdir(), 'sis-otel-'));
    store = new OtelGenAiStore({ storageRoot: root });

    store.recordSpan({
      span_id: 'sp-1',
      trace_id: 'tr-1',
      ts: '2026-11-01T10:00:00.000Z',
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
      gen_ai_operation_name: 'chat',
      inputTokens: 1200,
      outputTokens: 400,
      brand_id: 'sis',
      product_id: 'sis-gateway',
      agent_id: 'starlight-architect',
      workflow_id: 'wf-kg-index',
      estimated_cost: 0.012,
      latency_ms: 850,
      outcome_status: 'ok',
      attributes: { 'gen_ai.temperature': 0.2 },
    });

    store.recordSpan({
      span_id: 'sp-2',
      trace_id: 'tr-1',
      ts: '2026-11-02T12:00:00.000Z',
      attributes: {
        'gen_ai.system': 'openai',
        'gen_ai.request.model': 'gpt-5',
        'gen_ai.operation.name': 'embeddings',
        'gen_ai.usage.input_tokens': 2000,
        'gen_ai.usage.output_tokens': 0,
      },
      brand_id: 'frankx',
      product_id: 'frankx-web',
      agent_id: 'starlight-hermes',
      workflow_id: 'wf-embed',
      estimated_cost: 0.004,
      latency_ms: 210,
      outcome_status: 'ok',
    });

    store.recordSpan({
      span_id: 'sp-3',
      trace_id: 'tr-2',
      ts: '2026-11-03T08:00:00.000Z',
      gen_ai_system: 'anthropic',
      gen_ai_request_model: 'claude-opus-4-7',
      gen_ai_usage_input_tokens: 3000,
      gen_ai_usage_output_tokens: 1000,
      brand_id: 'sis',
      product_id: 'sis-queen',
      agent_id: 'starlight-architect',
      workflow_id: 'wf-kg-index',
      estimated_cost: 0.075,
      latency_ms: 1940,
      outcome_status: 'error',
    });
  });

  after(() => {
    store.close();
    try {
      rmSync(root, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  });

  it('aggregates totals and groups by provider, brand_id, workflow_id, and agent_id', () => {
    assert.ok(existsSync(join(root, '.starlight', 'otel-genai.sqlite')));

    const byProvider = store.summarize({ groupBy: 'provider' });
    assert.equal(byProvider.totals.spanCount, 3);
    assert.equal(byProvider.totals.inputTokens, 6200);
    assert.equal(byProvider.totals.outputTokens, 1400);
    assert.equal(byProvider.totals.totalTokens, 7600);
    assert.equal(byProvider.totals.totalCost, 0.091);
    assert.equal(byProvider.totals.errorCount, 1);
    assert.equal(byProvider.groups.length, 2);
    assert.equal(byProvider.groups[0]?.key, 'anthropic');
    assert.equal(byProvider.groups[0]?.spanCount, 2);
    assert.equal(byProvider.groups[0]?.totalCost, 0.087);
    assert.equal(byProvider.groups[1]?.key, 'openai');
    assert.equal(byProvider.groups[1]?.spanCount, 1);

    const byBrand = store.summarize({ groupBy: 'brand_id' });
    assert.equal(byBrand.groups[0]?.key, 'sis');
    assert.equal(byBrand.groups[0]?.spanCount, 2);
    assert.equal(byBrand.groups[1]?.key, 'frankx');

    const byWorkflowSinceNov2 = store.summarize({
      sinceIso: '2026-11-02T00:00:00.000Z',
      groupBy: 'workflow_id',
    });
    assert.equal(byWorkflowSinceNov2.totals.spanCount, 2);
    assert.equal(byWorkflowSinceNov2.totals.totalTokens, 6000);
    assert.equal(byWorkflowSinceNov2.groups.length, 2);

    const byAgentLimited = store.summarize({ groupBy: 'agent_id', limit: 1 });
    assert.equal(byAgentLimited.groups.length, 1);
    assert.equal(byAgentLimited.groups[0]?.key, 'starlight-architect');
  });
});

// ── 5. Gateway Core + HTTP Daemon End-to-End Integration ──────

describe('SisGatewayCore & SisGatewayDaemon — /v1/graph/* and /v1/otel/* routes', () => {
  let root: string;
  let daemon: SisGatewayDaemon;
  let port: number;
  let token: string;

  before(async () => {
    root = mkdtempSync(join(tmpdir(), 'sis-gw-phase2-'));
    daemon = new SisGatewayDaemon({ storageRoot: root });
    port = await daemon.start({ port: 0 });
    token = readFileSync(join(root, 'gateway.token'), 'utf-8').trim();
  });

  after(async () => {
    await daemon.stop();
    try {
      rmSync(root, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  });

  it('serves graph & otel endpoints over HTTP and enforces validation/privacy gates', async () => {
    // 1. Upsert nodes
    const n1 = await sendDaemonHttp(port, 'POST', '/v1/graph/nodes', token, {
      id: 'repo:sis',
      kind: 'repository',
      label: 'Starlight Intelligence System',
      repo: 'frankxai/Starlight-Intelligence-System',
      tags: ['spine'],
    });
    assert.equal(n1.status, 200);
    assert.equal(n1.body.ok, true);

    const n2 = await sendDaemonHttp(port, 'POST', '/v1/graph/nodes', token, {
      id: 'pkg:gateway',
      kind: 'module',
      label: 'SIS Gateway Core',
    });
    assert.equal(n2.status, 200);

    // Reject private tag on POST /v1/graph/nodes
    const privReject = await sendDaemonHttp(port, 'POST', '/v1/graph/nodes', token, {
      id: 'priv:leak',
      kind: 'note',
      label: 'Blocked',
      tags: ['privacy:personal'],
    });
    assert.equal(privReject.status, 400);
    assert.equal(privReject.body.ok, false);

    // 2. Assert edge
    const edgeRes = await sendDaemonHttp(port, 'POST', '/v1/graph/edges', token, {
      src: 'repo:sis',
      rel: 'exposes',
      dst: 'pkg:gateway',
      validFrom: '2026-10-01T00:00:00.000Z',
      txFrom: '2026-10-01T00:00:00.000Z',
    });
    assert.equal(edgeRes.status, 200);
    assert.equal(edgeRes.body.ok, true);

    // 3. Query subgraph
    const subRes = await sendDaemonHttp(port, 'POST', '/v1/graph/subgraph', token, {
      seedId: 'repo:sis',
      maxDepth: 2,
    });
    assert.equal(subRes.status, 200);
    assert.equal(subRes.body.ok, true);
    assert.equal((subRes.body.nodes as unknown[]).length, 2);
    assert.equal((subRes.body.edges as unknown[]).length, 1);

    // 4. Record OTel span + fetch summary
    const spanRes = await sendDaemonHttp(port, 'POST', '/v1/otel/spans', token, {
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
      inputTokens: 500,
      outputTokens: 250,
      brand_id: 'sis',
      workflow_id: 'gateway-e2e',
      agent_id: 'antigravity',
      estimated_cost: 0.005,
      latency_ms: 420,
    });
    assert.equal(spanRes.status, 200);
    assert.equal(spanRes.body.ok, true);

    const summaryRes = await sendDaemonHttp(
      port,
      'GET',
      '/v1/otel/summary?groupBy=brand_id&limit=5',
      token,
    );
    assert.equal(summaryRes.status, 200);
    assert.equal(summaryRes.body.ok, true);
    const totals = summaryRes.body.totals as { spanCount: number; totalTokens: number };
    assert.equal(totals.spanCount, 1);
    assert.equal(totals.totalTokens, 750);

    // Invalid groupBy returns 400
    const badGroupRes = await sendDaemonHttp(
      port,
      'GET',
      '/v1/otel/summary?groupBy=drop_table',
      token,
    );
    assert.equal(badGroupRes.status, 400);
    assert.equal(badGroupRes.body.ok, false);
  });

  it('works seamlessly via InProcessTransport + SisMemoryClient convenience methods', async () => {
    const localRoot = mkdtempSync(join(tmpdir(), 'sis-gw-client-'));
    const core = new SisGatewayCore({ storageRoot: localRoot });
    const client = new SisMemoryClient(new InProcessTransport(core), 'antigravity-test');
    try {
      await client.upsertGraphNode({ id: 'a', kind: 'node', label: 'Alpha' });
      await client.upsertGraphNode({ id: 'b', kind: 'node', label: 'Beta' });
      const asserted = await client.assertGraphEdge({ src: 'a', rel: 'links', dst: 'b' });
      assert.equal(asserted.edge.dst, 'b');

      const subgraph = await client.querySubgraph({ seedId: 'a', maxDepth: 1 });
      assert.equal(subgraph.nodes.length, 2);
      assert.equal(subgraph.edges.length, 1);

      await client.recordOtelSpan({
        provider: 'google',
        model: 'gemini-2.5-pro',
        inputTokens: 300,
        outputTokens: 100,
        agent_id: 'starlight-sage',
        estimated_cost: 0.002,
      });

      const summary = await client.getOtelSummary({ groupBy: 'agent_id' });
      assert.equal(summary.totals.spanCount, 1);
      assert.equal(summary.groups[0]?.key, 'starlight-sage');
    } finally {
      core.close();
      try {
        rmSync(localRoot, { recursive: true, force: true });
      } catch {
        /* ignore */
      }
    }
  });
});
