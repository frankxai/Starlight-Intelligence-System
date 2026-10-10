/**
 * Starlight Managed Cloud & Service Mesh — End-to-End Test Suite
 * Validates Cloudflare Worker edge router, Edge Veil, Hybrid RRF, vMCP,
 * Swarm Leases, and Zero-Knowledge E2EE sync.
 * 
 * Built on SIP v1.1.1
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { StarlightCloudWorker } from '../services/starlight-cloud-worker/src/index.js';
import { StarlightCloudConnector } from '../src/gateway/cloud-connector.js';

describe('Starlight Managed Cloud & Service Mesh E2E', () => {
  const TEST_API_KEY = 'sk_live_starlight_master_test_key_0123456789';
  const BASE_URL = 'https://api.starlightintelligence.ai';

  it('1. GET /v1/health returns 200 with SIP attestation and edge telemetry', async () => {
    const req = new Request(`${BASE_URL}/v1/health`, { method: 'GET' });
    const res = await StarlightCloudWorker.handleRequest(req);

    assert.equal(res.status, 200);
    const body = await res.json() as any;
    assert.equal(body.status, 'healthy');
    assert.equal(body.service, 'starlight-cloud-worker');
    assert.equal(body.version, '0.3.0-edge');
    assert.equal(body.attestation, 'Built on SIP v1.1.1');
    assert.ok(body.timestamp);
  });

  it('2. Rejects unauthorized requests without valid Bearer token', async () => {
    const unauthReq = new Request(`${BASE_URL}/v1/memory/query`, {
      method: 'POST',
      body: JSON.stringify({ query: 'architecture' }),
    });
    const resUnauth = await StarlightCloudWorker.handleRequest(unauthReq);
    assert.equal(resUnauth.status, 401);

    const badReq = new Request(`${BASE_URL}/v1/memory/query`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer bad' },
      body: JSON.stringify({ query: 'architecture' }),
    });
    const resBad = await StarlightCloudWorker.handleRequest(badReq);
    assert.equal(resBad.status, 403);
  });

  it('3. Ingests memory atom with Edge Veil PII & secret scrubbing', async () => {
    const dummyStripe = ['sk', 'live', 'abcdef1234567890abcdef1234567890'].join('_');
    const dummyAnthropic = ['sk', 'ant', 'api03', 'abcdef1234567890abcdef1234567890'].join('-');
    const secretContent = `Deploying database schema with secret token ${dummyAnthropic} and stripe key ${dummyStripe}`;
    const req = new Request(`${BASE_URL}/v1/memory/append`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_API_KEY}`,
      },
      body: JSON.stringify({
        namespace: 'tech/database',
        content: secretContent,
      }),
    });

    const res = await StarlightCloudWorker.handleRequest(req);
    assert.equal(res.status, 201);
    const body = await res.json() as any;
    assert.equal(body.success, true);
    assert.equal(body.tier, 'technical');
    assert.equal(body.piiScrubbed, true);
    assert.ok(body.id.startsWith('urn:starlight:'));
  });

  it('4. Queries memory using Hybrid RRF and temporal decay scoring', async () => {
    const appendReq = new Request(`${BASE_URL}/v1/memory/append`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_API_KEY}`,
      },
      body: JSON.stringify({
        tier: 'strategic',
        namespace: 'strategy/alliances',
        content: 'Formed alliance with sovereign nodes under Starlight Intelligence Protocol v1.1',
      }),
    });
    await StarlightCloudWorker.handleRequest(appendReq);

    const queryReq = new Request(`${BASE_URL}/v1/memory/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_API_KEY}`,
      },
      body: JSON.stringify({
        query: 'sovereign alliance Starlight',
        tier: 'strategic',
      }),
    });

    const queryRes = await StarlightCloudWorker.handleRequest(queryReq);
    assert.equal(queryRes.status, 200);
    const body = await queryRes.json() as any;
    assert.ok(body.count >= 1);
    const top = body.results[0];
    assert.ok(top.combinedScore > 0);
    assert.ok(top.decayWeight > 0.9);
    assert.ok(top.provenance.includes('strategy/alliances'));
  });

  it('5. Virtual MCP (vMCP) slashes context tokens via JIT scope synthesis', async () => {
    const vmcpReq = new Request(`${BASE_URL}/v1/vmcp/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_API_KEY}`,
      },
      body: JSON.stringify({
        agentId: 'claude-code',
        activeIntent: 'Refactor TypeScript AST parser and check memory vault',
        activeFilePath: 'src/gateway/daemon.ts',
      }),
    });

    const res = await StarlightCloudWorker.handleRequest(vmcpReq);
    assert.equal(res.status, 200);
    const body = await res.json() as any;
    assert.ok(body.metrics.tokenSavingsPercent >= 40);
    const toolNames = body.activeTools.map((t: any) => t.name);
    assert.ok(toolNames.includes('ts_ast_check'));
    assert.ok(toolNames.includes('vault_query'));
  });

  it('6. Distributed Swarm Lease prevents concurrent worktree collisions', async () => {
    const leaseReq1 = new Request(`${BASE_URL}/v1/swarm/lease/acquire`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_API_KEY}`,
      },
      body: JSON.stringify({
        agentId: 'hermes-swarm-01',
        worktree: '/repos/.worktrees/audio',
        paths: ['src/dsp/filter.ts'],
        ttlSeconds: 60,
      }),
    });
    const res1 = await StarlightCloudWorker.handleRequest(leaseReq1);
    assert.equal(res1.status, 200);
    const lease1 = await res1.json() as any;
    assert.equal(lease1.status, 'acquired');

    // Agent 2 attempts to lock the same file
    const leaseReq2 = new Request(`${BASE_URL}/v1/swarm/lease/acquire`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_API_KEY}`,
      },
      body: JSON.stringify({
        agentId: 'codex-agent-02',
        worktree: '/repos/.worktrees/audio-feature',
        paths: ['src/dsp/filter.ts'],
        ttlSeconds: 60,
      }),
    });
    const res2 = await StarlightCloudWorker.handleRequest(leaseReq2);
    assert.equal(res2.status, 409);
    const lease2 = await res2.json() as any;
    assert.equal(lease2.status, 'conflict');
    assert.equal(lease2.conflictWith, 'hermes-swarm-01');

    // Release lease
    const releaseReq = new Request(`${BASE_URL}/v1/swarm/lease/release`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_API_KEY}`,
      },
      body: JSON.stringify({ leaseId: lease1.leaseId }),
    });
    const releaseRes = await StarlightCloudWorker.handleRequest(releaseReq);
    assert.equal(releaseRes.status, 200);
  });

  it('7. Sovereign Cloud Connector handles client-side Zero-Knowledge E2EE', () => {
    const connector = new StarlightCloudConnector({
      apiKey: TEST_API_KEY,
      encryptionPassphrase: 'frank-sovereign-master-passphrase-2026',
    });

    const secretIntel = 'Confidential Sovereign Valuation: $15M enterprise licensing run-rate target';
    const encrypted = connector.encrypt(secretIntel);
    assert.notEqual(encrypted.ciphertext, secretIntel);
    assert.ok(encrypted.iv);
    assert.ok(encrypted.tag);

    const decrypted = connector.decrypt(encrypted.ciphertext, encrypted.iv, encrypted.tag);
    assert.equal(decrypted, secretIntel);
  });

  it('8. Serves MCP SSE protocol handshake for Claude Code and Cursor integration', async () => {
    const sseReq = new Request(`${BASE_URL}/v1/mcp/sse`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${TEST_API_KEY}` },
    });
    const res = await StarlightCloudWorker.handleRequest(sseReq);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('Content-Type'), 'text/event-stream');
    const text = await res.text();
    assert.ok(text.includes('/v1/mcp/messages?sessionId='));
  });

  it('9. Serves the 3D Visual Memory Palace HTML surface', async () => {
    const palaceReq = new Request(`${BASE_URL}/palace`, { method: 'GET' });
    const res = await StarlightCloudWorker.handleRequest(palaceReq);
    assert.equal(res.status, 200);
    assert.ok(res.headers.get('Content-Type')?.includes('text/html'));
    const html = await res.text();
    assert.ok(html.includes('STARLIGHT HYPER-VAULT PALACE'));
    assert.ok(html.includes('canvas-container'));
  });
});
