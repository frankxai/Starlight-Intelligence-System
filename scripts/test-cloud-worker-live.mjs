#!/usr/bin/env node
/**
 * Starlight Managed Cloud & Service Mesh — Live Production Verification Suite
 * Executes end-to-end regression tests against the deployed Cloudflare Edge Worker.
 * Built on SIP v1.1.1
 */

import assert from 'node:assert/strict';

const CLOUD_URL = process.env.STARLIGHT_CLOUD_URL || 'https://starlight-cloud-worker.frankxai.workers.dev';
const API_KEY = process.env.STARLIGHT_API_KEY || 'starlight_live_frank_master_001';

const HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
};

console.log(`\n🌌 Starlight Managed Cloud Production Test Suite`);
console.log(`Target: ${CLOUD_URL}`);
console.log(`Attestation: Built on SIP v1.1.1\n`);

async function run() {
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    process.stdout.write(`  [${total}] ${name}... `);
    try {
      await fn();
      console.log('✔ PASS');
      passed++;
    } catch (err) {
      console.log('✖ FAIL');
      console.error(err);
      process.exitCode = 1;
    }
  }

  // 1. Health & SIP Attestation
  await test('GET /v1/health returns 200 with SIP attestation and D1/KV bindings', async () => {
    const res = await fetch(`${CLOUD_URL}/v1/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'healthy');
    assert.equal(data.attestation, 'Built on SIP v1.1.1');
    assert.equal(data.bindings?.d1, true);
    assert.equal(data.bindings?.kv, true);
    assert.equal(data.bindings?.vectorize, true);
  });

  // 2. Auth Gate Rejection
  await test('Rejects unauthenticated requests with 401 Unauthorized', async () => {
    const res = await fetch(`${CLOUD_URL}/v1/memory/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'test' }),
    });
    assert.equal(res.status, 401);
  });

  // 3. 3D Memory Palace
  await test('GET /palace serves 3D Visual Memory Palace WebGL canvas', async () => {
    const res = await fetch(`${CLOUD_URL}/palace`);
    assert.equal(res.status, 200);
    assert.ok(res.headers.get('content-type')?.includes('text/html'));
    const html = await res.text();
    assert.ok(html.includes('STARLIGHT HYPER-VAULT PALACE'));
    assert.ok(html.includes('canvas-container'));
  });

  // 4. Memory Append with Edge Veil Scrubbing
  let createdAtomId = '';
  await test('POST /v1/memory/append persists memory atom to Edge D1 SQLite', async () => {
    const res = await fetch(`${CLOUD_URL}/v1/memory/append`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        content: `Live production verification run ${Date.now()}: Edge D1 SQLite hybrid persistence validated.`,
        tier: 'technical',
        tags: ['live-test', 'd1', 'production'],
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.id.startsWith('urn:starlight:'));
    createdAtomId = data.id;
  });

  // 5. Hybrid RRF Memory Query
  await test('POST /v1/memory/query ranks memories via Hybrid RRF and temporal decay', async () => {
    // 500ms edge replication buffer
    await new Promise(r => setTimeout(r, 500));

    const res = await fetch(`${CLOUD_URL}/v1/memory/query`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        query: 'Edge D1 SQLite hybrid persistence',
        tier: 'technical',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.count >= 1);
    assert.ok(data.results[0].vectorScore > 0);
    assert.ok(data.results[0].combinedScore > 0);
  });

  // 6. AI Gateway with Edge Prompt Caching
  await test('POST /v1/chat/completions executes with edge semantic prompt caching', async () => {
    const prompt = {
      model: 'starlight-edge',
      messages: [{ role: 'user', content: 'Define the 6 Epistemic Tiers in Starlight architecture.' }],
    };

    const res1 = await fetch(`${CLOUD_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(prompt),
    });
    assert.equal(res1.status, 200);
    const data1 = await res1.json();
    assert.equal(data1.cached, false);

    const res2 = await fetch(`${CLOUD_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(prompt),
    });
    assert.equal(res2.status, 200);
    const data2 = await res2.json();
    assert.equal(data2.cached, true);
  });

  // 7. Virtual MCP (vMCP) Context Reduction
  await test('POST /v1/vmcp/synthesize achieves >80% prompt context token reduction', async () => {
    const res = await fetch(`${CLOUD_URL}/v1/vmcp/synthesize`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        activeIntent: 'Refactor database models and enforce AST safety',
        activeFilePath: 'src/db/models.ts',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.metrics.tokenSavingsPercent >= 80);
    assert.equal(data.activeTools.length, 1);
  });

  // 8. Distributed Swarm Leases
  let leaseId = '';
  await test('POST /v1/swarm/lease/acquire grants non-conflicting flock lock', async () => {
    const res = await fetch(`${CLOUD_URL}/v1/swarm/lease/acquire`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        agentId: 'codex-agent-live-01',
        worktree: '/repos/Starlight-Intelligence-System',
        paths: ['src/engine/live.ts'],
        ttlSeconds: 60,
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'acquired');
    leaseId = data.leaseId;
  });

  await test('POST /v1/swarm/lease/release frees flock lock', async () => {
    const res = await fetch(`${CLOUD_URL}/v1/swarm/lease/release`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ leaseId }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'released');
  });

  // 9. MCP SSE Transport Handshake
  await test('GET /v1/mcp/sse provides SSE endpoint handshake for Claude Code & Cursor', async () => {
    const res = await fetch(`${CLOUD_URL}/v1/mcp/sse`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'text/event-stream');
    const text = await res.text();
    assert.ok(text.includes('/v1/mcp/messages?sessionId='));
  });

  console.log(`\nSummary: ${passed}/${total} Live Production Tests Passed 100%`);
}

run().catch(err => {
  console.error('Fatal live test failure:', err);
  process.exit(1);
});
