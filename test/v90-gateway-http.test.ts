/**
 * v9.0 Gateway HTTP — real daemon on ephemeral port.
 *
 * Covers:
 *   - token required (401 without)
 *   - round-trip with token (health check)
 *   - double-spawn guard (second start throws or the daemon already running)
 *   - clean shutdown (daemon stops, server closes)
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
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { request as httpRequest } from 'node:http';
import { SisGatewayDaemon } from '../src/gateway/daemon.js';
import { HttpTransport, SisMemoryClient } from '../src/gateway/client.js';

// ── HTTP helpers ────────────────────────────────────────────────────────────

function httpGet(
  host: string,
  port: number,
  path: string,
  token?: string,
): Promise<{ status: number; body: unknown }> {
  return new Promise((resolve, reject) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const req = httpRequest({ hostname: host, port, path, method: 'GET', headers }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', c => chunks.push(c as Buffer));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf-8');
        let body: unknown;
        try { body = JSON.parse(raw); } catch { body = raw; }
        resolve({ status: res.statusCode ?? 0, body });
      });
      res.on('error', reject);
    });
    req.on('error', reject);
    req.end();
  });
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('v9.0 Gateway HTTP — token enforcement', () => {
  let root: string;
  let port: number;
  let daemon: SisGatewayDaemon;

  before(async () => {
    root = mkdtempSync(join(tmpdir(), 'sis-http-'));
    daemon = new SisGatewayDaemon({ storageRoot: root });
    port = await daemon.start({ port: 0 });
  });

  after(async () => {
    await daemon.stop();
    try { rmSync(root, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  it('request without Authorization returns 401', async () => {
    const { status } = await httpGet('127.0.0.1', port, '/v1/memory/health');
    assert.equal(status, 401, 'missing token must return 401');
  });

  it('request with wrong token returns 401', async () => {
    const { status } = await httpGet('127.0.0.1', port, '/v1/memory/health', 'wrong-token-xyz');
    assert.equal(status, 401, 'wrong token must return 401');
  });

  it('request with correct token returns 200', async () => {
    const token = readFileSync(join(root, 'gateway.token'), 'utf-8').trim();
    const { status, body } = await httpGet('127.0.0.1', port, '/v1/memory/health', token);
    assert.equal(status, 200, `expected 200, got ${status}`);
    assert.equal((body as { status?: string }).status, 'ok', 'health body must report ok');
  });

  it('gateway.json exists with port and pid after start', () => {
    const jsonPath = join(root, 'gateway.json');
    assert.ok(existsSync(jsonPath), 'gateway.json must exist');
    const info = JSON.parse(readFileSync(jsonPath, 'utf-8')) as { port: number; pid: number };
    assert.equal(info.port, port, 'gateway.json port must match bound port');
    assert.equal(typeof info.pid, 'number', 'gateway.json pid must be a number');
  });
});

describe('v9.0 Gateway HTTP — double-spawn guard', () => {
  let root: string;
  let daemon1: SisGatewayDaemon;

  before(async () => {
    root = mkdtempSync(join(tmpdir(), 'sis-http-spawn-'));
    daemon1 = new SisGatewayDaemon({ storageRoot: root });
    await daemon1.start({ port: 0 });
  });

  after(async () => {
    await daemon1.stop();
    try { rmSync(root, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  it('second daemon.start() on same storageRoot throws spawn-guard error', async () => {
    const daemon2 = new SisGatewayDaemon({ storageRoot: root });
    await assert.rejects(
      () => daemon2.start({ port: 0 }),
      /already running|spawn guard/i,
      'second start must fail with spawn guard error',
    );
  });
});

describe('v9.0 Gateway HTTP — harness isolation and input bounds', () => {
  let root: string;
  let daemon: SisGatewayDaemon;

  before(async () => {
    root = mkdtempSync(join(tmpdir(), 'sis-http-isolation-'));
    daemon = new SisGatewayDaemon({ storageRoot: root });
    await daemon.start({ port: 0 });
  });

  after(async () => {
    await daemon.stop();
    try { rmSync(root, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  it('keeps identical session ids isolated by HTTP harness', async () => {
    const alpha = new SisMemoryClient(new HttpTransport({ storageRoot: root, harness: 'alpha' }));
    const beta = new SisMemoryClient(new HttpTransport({ storageRoot: root, harness: 'beta' }));

    await alpha.addSessionItems('shared-id', [{ content: 'alpha-only' }]);
    await beta.addSessionItems('shared-id', [{ content: 'beta-only' }]);

    assert.deepEqual((await alpha.getSessionItems('shared-id')).map(item => item.content), ['alpha-only']);
    assert.deepEqual((await beta.getSessionItems('shared-id')).map(item => item.content), ['beta-only']);
  });

  it('rejects malformed harness identifiers at the daemon boundary', async () => {
    const transport = new HttpTransport({ storageRoot: root, harness: '../escape' });
    const response = await transport.request({ method: 'GET', path: '/v1/memory/health' });
    assert.equal(response.ok, false);
    assert.equal((response as { status: number }).status, 400);
  });

  it('rejects request bodies larger than one MiB', async () => {
    const transport = new HttpTransport({ storageRoot: root, harness: 'bounded' });
    const response = await transport.request({
      method: 'POST',
      path: '/v1/memory/add',
      body: { content: 'x'.repeat(1_048_577) },
    });
    assert.equal(response.ok, false);
    assert.equal((response as { status: number }).status, 413);
  });
});
