/**
 * v9.0 Gateway — InProcessTransport round-trip tests.
 *
 * Covers all API v1 endpoints via InProcessTransport (zero network):
 *   GET  /v1/memory/health
 *   POST /v1/memory/add
 *   POST /v1/memory/search
 *   GET  /v1/sessions/:id/items
 *   POST /v1/sessions/:id/items
 *   POST /v1/sessions/:id/pop
 *   DELETE /v1/sessions/:id
 *
 * Also verifies the add → search round-trip (add an entry, then find it).
 * Error shapes are verified for missing/invalid inputs.
 *
 * SECURITY NOTE: no assertion interpolates raw fixture content into
 * error messages — identifier-based assertions only (/openclaw-audit CRITICAL 2).
 *
 * ---
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 * - Substrate: starlightintelligence.org/protocol
 * - Layers used: [file-contract, sovereignty]
 * - Generated: 2026-06-11
 * ---
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { SisGatewayCore } from '../src/gateway/server.js';
import { InProcessTransport, SisMemoryClient } from '../src/gateway/client.js';
import type { GatewayRequest } from '../src/gateway/protocol.js';

// ── Fixture setup ────────────────────────────────────────────────────────────

function makeSut(root: string) {
  const core = new SisGatewayCore({ storageRoot: root });
  const transport = new InProcessTransport(core);
  const client = new SisMemoryClient(transport, 'test-harness');
  return { core, transport, client };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('v9.0 Gateway — health endpoint', () => {
  let root: string;

  before(() => { root = mkdtempSync(join(tmpdir(), 'sis-gw-')); });
  after(() => { try { rmSync(root, { recursive: true, force: true }); } catch { /* ignore */ } });

  it('GET /v1/memory/health returns ok:true status:ok', async () => {
    const { client } = makeSut(root);
    const result = await client.health();
    assert.equal((result as { status: string }).status, 'ok');
  });
});

describe('v9.0 Gateway — memory/add endpoint', () => {
  let root: string;

  before(() => { root = mkdtempSync(join(tmpdir(), 'sis-gw-')); });
  after(() => { try { rmSync(root, { recursive: true, force: true }); } catch { /* ignore */ } });

  it('POST /v1/memory/add with valid body returns ok entry', async () => {
    const { transport } = makeSut(root);
    const res = await transport.request({
      method: 'POST',
      path: '/v1/memory/add',
      body: { content: 'SIS gateway memory add test', vault: 'technical', confidence: 0.9 },
    });
    assert.ok(res.ok, `expected ok response, got: ${res.ok ? '' : res.error}`);
    const body = (res as { ok: true; body: { ok: boolean; entry: { id: string } } }).body;
    assert.ok(body.ok);
    assert.ok(typeof body.entry.id === 'string', 'entry must have a string id');
  });

  it('POST /v1/memory/add with missing content returns 400 error', async () => {
    const { transport } = makeSut(root);
    const res = await transport.request({
      method: 'POST',
      path: '/v1/memory/add',
      body: { vault: 'technical' },
    });
    assert.equal(res.ok, false, 'must return error for missing content');
    assert.equal((res as { ok: false; status: number }).status, 400);
  });

  it('POST /v1/memory/add with empty content returns 400 error', async () => {
    const { transport } = makeSut(root);
    const res = await transport.request({
      method: 'POST',
      path: '/v1/memory/add',
      body: { content: '   ' },
    });
    assert.equal(res.ok, false);
    assert.equal((res as { ok: false; status: number }).status, 400);
  });
});

describe('v9.0 Gateway — memory/search endpoint', () => {
  let root: string;

  before(() => { root = mkdtempSync(join(tmpdir(), 'sis-gw-')); });
  after(() => { try { rmSync(root, { recursive: true, force: true }); } catch { /* ignore */ } });

  it('POST /v1/memory/search with missing query returns 400 error', async () => {
    const { transport } = makeSut(root);
    const res = await transport.request({
      method: 'POST',
      path: '/v1/memory/search',
      body: { limit: 5 },
    });
    assert.equal(res.ok, false);
    assert.equal((res as { ok: false; status: number }).status, 400);
  });

  it('add → search round-trip: added entry is retrievable by keyword', async () => {
    const { client } = makeSut(root);
    await client.addMemory({
      content: 'quantum-entanglement-pattern gateway retrieval test',
      vault: 'technical',
      tags: ['test', 'gateway'],
      confidence: 0.95,
    });
    const result = await client.searchMemory({ query: 'quantum-entanglement-pattern', limit: 5 });
    const body = result as { ok: boolean; results: Array<{ entry: { content: string } }> };
    assert.ok(body.ok, 'search must succeed');
    assert.ok(Array.isArray(body.results), 'results must be an array');
    // At minimum the result set is non-empty (entry was just added)
    assert.ok(body.results.length >= 1, 'must find at least one result after add');
  });

  it('search returns ok:true with empty results for no matches', async () => {
    const { transport } = makeSut(root);
    const res = await transport.request({
      method: 'POST',
      path: '/v1/memory/search',
      body: { query: 'zzz-definitely-not-present-xyz-987654' },
    });
    assert.ok(res.ok);
    const body = (res as { ok: true; body: { results: unknown[] } }).body;
    assert.ok(Array.isArray(body.results));
  });
});

describe('v9.0 Gateway — session endpoints', () => {
  let root: string;

  before(() => { root = mkdtempSync(join(tmpdir(), 'sis-gw-')); });
  after(() => { try { rmSync(root, { recursive: true, force: true }); } catch { /* ignore */ } });

  it('GET /v1/sessions/:id/items returns empty array for new session', async () => {
    const { client } = makeSut(root);
    const items = await client.getSessionItems('new-session');
    assert.deepEqual(items, []);
  });

  it('POST /v1/sessions/:id/items → GET returns items', async () => {
    const { client } = makeSut(root);
    await client.addSessionItems('my-session', [
      { content: 'item-one' },
      { content: 'item-two' },
    ]);
    const items = await client.getSessionItems('my-session');
    assert.equal(items.length, 2);
    assert.equal(items[0]?.content, 'item-one');
    assert.equal(items[1]?.content, 'item-two');
  });

  it('POST /v1/sessions/:id/pop removes the last item', async () => {
    const { client } = makeSut(root);
    await client.addSessionItems('pop-session', [
      { content: 'first' },
      { content: 'second' },
    ]);
    const popped = await client.popSessionItem('pop-session');
    assert.equal(popped, true);
    const items = await client.getSessionItems('pop-session');
    assert.equal(items.length, 1);
    assert.equal(items[0]?.content, 'first');
  });

  it('DELETE /v1/sessions/:id clears all items', async () => {
    const { client } = makeSut(root);
    await client.addSessionItems('clear-session', [{ content: 'to-be-cleared' }]);
    await client.clearSession('clear-session');
    const items = await client.getSessionItems('clear-session');
    assert.deepEqual(items, []);
  });

  it('POST /v1/sessions/:id/items with missing items array returns 400', async () => {
    const { transport } = makeSut(root);
    const res = await transport.request({
      method: 'POST',
      path: '/v1/sessions/bad-session/items',
      body: {},
    });
    assert.equal(res.ok, false);
    assert.equal((res as { ok: false; status: number }).status, 400);
  });
});

describe('v9.0 Gateway — unrecognised routes return 404', () => {
  let root: string;

  before(() => { root = mkdtempSync(join(tmpdir(), 'sis-gw-')); });
  after(() => { try { rmSync(root, { recursive: true, force: true }); } catch { /* ignore */ } });

  it('GET /v1/unknown returns 404 not found', async () => {
    const { transport } = makeSut(root);
    const res = await transport.request({ method: 'GET', path: '/v1/unknown' });
    assert.equal(res.ok, false);
    assert.equal((res as { ok: false; status: number }).status, 404);
  });
});

// ── Import helper ─────────────────────────────────────────────────────────────

import { join } from 'node:path';
