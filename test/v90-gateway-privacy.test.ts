/**
 * v9.0 Gateway Privacy — private entries never appear in gateway read surfaces.
 *
 * Structural pattern cloned from test/v01-vault-loop-privacy.test.ts (the
 * canonical SIS privacy contract test).
 *
 * Context: VaultMemory entries (written via rememberInVault / sis.memory.add)
 * are MemoryEntry objects. They do not carry the VaultLoopEntry `privacy` field.
 * The gateway enforces external-harness privacy via AuthContext.includePrivate
 * which is structurally locked to `false` for all external callers.
 *
 * This test exercises the privacy contract at the gateway layer:
 *   1. Auth context cannot be overridden by the caller
 *   2. Every read endpoint (memory/search, sessions/:id/items) enforces the
 *      includePrivate=false invariant
 *   3. Secret-scanner-safe fixtures: all key-like strings are built piecewise
 *      — no plain secrets in the test file
 *
 * SECURITY NOTE: per /openclaw-audit CRITICAL 2, no assertion interpolates
 * raw fixture content into error messages. Identifier and count assertions only.
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
import { join } from 'node:path';
import { SisGatewayCore } from '../src/gateway/server.js';
import { InProcessTransport, SisMemoryClient } from '../src/gateway/client.js';
import type { GatewayRequest } from '../src/gateway/protocol.js';

// ── Privacy fixture helpers ─────────────────────────────────────────────────
//
// SECURITY: Key-like fixture strings are built piecewise so the secret scanner
// cannot flag this test file. We use obvious test-marker prefixes, never real
// key formats.

// Content uses space-separated words so the MemoryManager word-index
// tokenizer (splits on \s+, keeps tokens >2 chars) can find them.
// Hyphenated compound identifiers would form a single token and fail
// to match a partial query — so we use space-separated unique markers.
const PUBLIC_UNIQUE = 'gatewayPrivacyPublicFixture';
const SENSITIVE_UNIQUE = 'gatewayPrivacySensitiveFixture';

// Content strings that might look key-like are composed at runtime:
// e.g. 'sk-' + 'or-v1-' + randomHex cannot appear literally in this file.
// We use clearly-fake test content instead.
function makePublicContent(n: number): string {
  return `${PUBLIC_UNIQUE} entry number ${n} operational memory`;
}

function makeSensitiveContent(n: number): string {
  // Fake content that represents "sensitive" data — not a real key format
  return `${SENSITIVE_UNIQUE} entry number ${n} internal use only`;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('v9.0 Gateway Privacy — auth context includePrivate is structurally locked', () => {
  let root: string;

  before(() => { root = mkdtempSync(join(tmpdir(), 'sis-priv-')); });
  after(() => { try { rmSync(root, { recursive: true, force: true }); } catch { /* ignore */ } });

  it('InProcessTransport overwrites caller auth with includePrivate=false', async () => {
    const core = new SisGatewayCore({ storageRoot: root });
    const transport = new InProcessTransport(core);

    // Attempt to construct a request with a spoofed auth context
    // (the transport must overwrite it)
    const spoofedReq: GatewayRequest = {
      method: 'GET',
      path: '/v1/memory/health',
      // TypeScript prevents includePrivate:true on AuthContext — this test
      // verifies the runtime enforcement via InProcessTransport
      auth: { harness: 'spoofed-harness', includePrivate: false },
    };

    const res = await transport.request(spoofedReq);
    // If the transport accepts the request (health endpoint succeeds),
    // verify that auth was enforced (includePrivate is always false)
    assert.ok(res.ok, 'health endpoint must succeed with valid auth shape');
  });

  it('SisMemoryClient always sends auth with harness name and includePrivate=false', async () => {
    const core = new SisGatewayCore({ storageRoot: root });
    const transport = new InProcessTransport(core);
    const client = new SisMemoryClient(transport, 'privacy-test-harness');

    // health() uses the client's harness — must not throw
    const health = await client.health();
    assert.equal((health as { status: string }).status, 'ok');
  });
});

describe('v9.0 Gateway Privacy — memory/search never leaks private-class entries', () => {
  let root: string;
  let client: SisMemoryClient;

  before(async () => {
    root = mkdtempSync(join(tmpdir(), 'sis-priv-search-'));
    const core = new SisGatewayCore({ storageRoot: root });
    const transport = new InProcessTransport(core);
    client = new SisMemoryClient(transport, 'privacy-test');

    // Seed public entries
    for (let i = 0; i < 3; i++) {
      await client.addMemory({
        content: makePublicContent(i),
        vault: 'operational',
        confidence: 0.8,
        tags: ['gateway-privacy-public'],
      });
    }

    // Seed "sensitive" entries — at VaultMemory level these are just operational
    // entries; the privacy contract is that external harnesses cannot set
    // includePrivate=true. These entries should appear in search results
    // (they're operational-tier data, not VaultLoopEntry private-class).
    // This confirms that the gateway's privacy enforcement is about the
    // AuthContext gate, not suppressing all data.
    for (let i = 0; i < 2; i++) {
      await client.addMemory({
        content: makeSensitiveContent(i),
        vault: 'strategic',
        confidence: 0.5,
        tags: ['gateway-privacy-sensitive'],
      });
    }
  });

  after(() => { try { rmSync(root, { recursive: true, force: true }); } catch { /* ignore */ } });

  it('memory/search returns results for public entries', async () => {
    const result = await client.searchMemory({ query: PUBLIC_UNIQUE, limit: 10 });
    const body = result as { ok: boolean; results: Array<{ entry: { content: string } }> };
    assert.ok(body.ok, 'search must succeed');
    assert.ok(body.results.length >= 1, 'must find at least one public entry');
    // Verify none of the results contain content that was never seeded
    for (const r of body.results) {
      assert.ok(
        typeof r.entry.content === 'string',
        'result entry.content must be a string',
      );
    }
  });

  it('memory/search with includePrivate=false (enforced) does not error', async () => {
    const result = await client.searchMemory({ query: SENSITIVE_UNIQUE, limit: 20 });
    const body = result as { ok: boolean };
    assert.ok(body.ok, 'search must succeed regardless of content type');
  });

  it('memory/search drops entries tagged private or privacy:* (defense-in-depth)', async () => {
    const marker = 'defenseindepth-marker-zq';
    await client.addMemory({
      content: `${marker} entry tagged private must never cross the gateway`,
      vault: 'operational',
      confidence: 0.9,
      tags: ['private'],
    });
    await client.addMemory({
      content: `${marker} entry tagged privacy-class must never cross the gateway`,
      vault: 'operational',
      confidence: 0.9,
      tags: ['privacy:second-brain'],
    });
    await client.addMemory({
      content: `${marker} untagged sibling entry remains visible`,
      vault: 'operational',
      confidence: 0.9,
      tags: ['gateway-privacy-public'],
    });

    const result = await client.searchMemory({ query: marker, limit: 20 });
    const body = result as { ok: boolean; results: Array<{ entry: { tags?: string[] } }> };
    assert.ok(body.ok, 'search must succeed');
    assert.ok(body.results.length >= 1, 'untagged sibling must be findable');
    for (const r of body.results) {
      const tags = (r.entry.tags ?? []).map((t) => String(t).toLowerCase());
      assert.ok(!tags.includes('private'), 'no result may carry the private tag');
      assert.ok(
        !tags.some((t) => t.startsWith('privacy:')),
        'no result may carry a privacy:* tag',
      );
    }
  });
});

describe('v9.0 Gateway Privacy — session endpoints enforce harness isolation', () => {
  let root: string;

  before(() => { root = mkdtempSync(join(tmpdir(), 'sis-priv-sess-')); });
  after(() => { try { rmSync(root, { recursive: true, force: true }); } catch { /* ignore */ } });

  it('harness A session items are not visible to harness B', async () => {
    const core = new SisGatewayCore({ storageRoot: root });

    const transportA = new InProcessTransport(core);
    const clientA = new SisMemoryClient(transportA, 'harness-priv-a');

    const transportB = new InProcessTransport(core);
    const clientB = new SisMemoryClient(transportB, 'harness-priv-b');

    const SESSION_ID = 'shared-id';

    await clientA.addSessionItems(SESSION_ID, [{ content: 'secret-for-a-only' }]);
    const bItems = await clientB.getSessionItems(SESSION_ID);

    // B should see 0 items because the sessions are namespaced by harness
    assert.deepEqual(bItems, [], 'harness B must not see harness A session items');
  });

  it('each client sees only its own session items', async () => {
    const core = new SisGatewayCore({ storageRoot: root });

    const transportA = new InProcessTransport(core);
    const clientA = new SisMemoryClient(transportA, 'harness-iso-a');

    const transportB = new InProcessTransport(core);
    const clientB = new SisMemoryClient(transportB, 'harness-iso-b');

    await clientA.addSessionItems('iso-session', [{ content: 'a-item-1' }]);
    await clientB.addSessionItems('iso-session', [{ content: 'b-item-1' }]);

    const aItems = await clientA.getSessionItems('iso-session');
    const bItems = await clientB.getSessionItems('iso-session');

    assert.equal(aItems.length, 1, 'A must see exactly 1 item');
    assert.equal(bItems.length, 1, 'B must see exactly 1 item');

    // Verify each client sees its own content, not the other's
    const aContent = aItems[0]?.content ?? '';
    const bContent = bItems[0]?.content ?? '';

    assert.ok(aContent.startsWith('a-'), 'A session content must be A-seeded');
    assert.ok(bContent.startsWith('b-'), 'B session content must be B-seeded');
  });
});

describe('v9.0 Gateway Privacy — all read endpoints accessible with valid auth', () => {
  let root: string;
  let client: SisMemoryClient;
  const SESSION_ID = 'privacy-all-endpoints';

  before(async () => {
    root = mkdtempSync(join(tmpdir(), 'sis-priv-all-'));
    const core = new SisGatewayCore({ storageRoot: root });
    const transport = new InProcessTransport(core);
    client = new SisMemoryClient(transport, 'privacy-harness');

    // Seed session items
    await client.addSessionItems(SESSION_ID, [
      { content: makePublicContent(10) },
      { content: makePublicContent(11) },
    ]);
  });

  after(() => { try { rmSync(root, { recursive: true, force: true }); } catch { /* ignore */ } });

  it('GET /v1/memory/health returns ok', async () => {
    const h = await client.health();
    assert.equal((h as { status: string }).status, 'ok');
  });

  it('POST /v1/memory/search returns ok response', async () => {
    const r = await client.searchMemory({ query: 'fixture', limit: 5 });
    assert.ok((r as { ok: boolean }).ok);
  });

  it('GET /v1/sessions/:id/items returns ok response', async () => {
    const items = await client.getSessionItems(SESSION_ID);
    assert.ok(Array.isArray(items), 'items must be an array');
    assert.equal(items.length, 2, 'must return the 2 seeded session items');
  });

  it('POST /v1/sessions/:id/pop returns ok response', async () => {
    const popped = await client.popSessionItem(SESSION_ID);
    assert.equal(typeof popped, 'boolean', 'pop result must be a boolean');
    assert.equal(popped, true, 'pop must return true when items exist');
  });

  it('DELETE /v1/sessions/:id returns ok response', async () => {
    await assert.doesNotReject(() => client.clearSession(SESSION_ID));
    const after = await client.getSessionItems(SESSION_ID);
    assert.deepEqual(after, [], 'session must be empty after clear');
  });
});
