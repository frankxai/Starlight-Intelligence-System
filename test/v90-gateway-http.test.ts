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
import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { hostname, tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { request as httpRequest } from 'node:http';
import { SisGatewayDaemon } from '../src/gateway/daemon.js';

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

describe('v9.0 Gateway HTTP — double-spawn guard and dead-PID recovery', () => {
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

  it('second daemon.start() on same storageRoot throws spawn-guard error while owner is alive', async () => {
    const daemon2 = new SisGatewayDaemon({ storageRoot: root });
    await assert.rejects(
      () => daemon2.start({ port: 0 }),
      /already running|spawn guard/i,
      'second start must fail with spawn guard error',
    );
  });

  it('recovers stale lock left by a dead local PID in meta.json', async () => {
    const staleRoot = mkdtempSync(join(tmpdir(), 'sis-http-stale-meta-'));
    try {
      const lockDir = join(staleRoot, 'gateway-spawn.lock');
      mkdirSync(lockDir);
      writeFileSync(
        join(lockDir, 'meta.json'),
        JSON.stringify({ pid: 999999, ts: Date.now() - 60000, token: randomUUID(), host: hostname() }),
        'utf-8',
      );
      const d = new SisGatewayDaemon({ storageRoot: staleRoot });
      const p = await d.start({ port: 0 });
      assert.ok(p > 0, 'daemon must bind ephemeral port after breaking dead-PID lock');
      await d.stop();
    } finally {
      try { rmSync(staleRoot, { recursive: true, force: true }); } catch { /* ignore */ }
    }
  });

  it('recovers legacy empty gateway-spawn.lock when gateway.json PID is dead', async () => {
    const legacyRoot = mkdtempSync(join(tmpdir(), 'sis-http-stale-legacy-'));
    try {
      mkdirSync(join(legacyRoot, 'gateway-spawn.lock'));
      writeFileSync(
        join(legacyRoot, 'gateway.json'),
        JSON.stringify({ port: 5200, pid: 999999, host: '127.0.0.1', startedAt: '2026-10-01T00:00:00.000Z' }),
        'utf-8',
      );
      const d = new SisGatewayDaemon({ storageRoot: legacyRoot });
      const p = await d.start({ port: 0 });
      assert.ok(p > 0, 'daemon must recover legacy empty lock when gateway.json pid is dead');
      await d.stop();
    } finally {
      try { rmSync(legacyRoot, { recursive: true, force: true }); } catch { /* ignore */ }
    }
  });
});
