/**
 * Track B v0.1 — sis.receipt.* MCP tools
 *
 *   • issue without a key → status 'draft', ledger line written
 *   • issue with signing_key_pem → status 'signed', verify → verified true
 *   • verify with a different key → verified false, reasons non-empty
 *   • issue with an incomplete receipt → ok:false, no ledger line
 *   • list returns newest first with the documented fields
 *   • subject {name, content} computes the sha256
 *
 * Built on SIP — operational tier
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { generateKeyPairSync } from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { SisMcpServerV01 } from '../src/mcp-server-v01.js';
import { sha256Hex } from '../src/run-receipt.js';

function withServer<T>(fn: (server: SisMcpServerV01, root: string) => T): T {
  const dir = mkdtempSync(join(tmpdir(), 'sis-mcp-receipts-'));
  const server = new SisMcpServerV01({ repoRoot: dir });
  try {
    return fn(server, dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

interface OkEnvelope {
  ok?: boolean;
  error?: string;
  [key: string]: unknown;
}

function countLines(path: string): number {
  if (!existsSync(path)) return 0;
  return readFileSync(path, 'utf-8').split('\n').filter((l) => l.trim()).length;
}

function keyPair(): { privatePem: string; publicPem: string } {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  return {
    privatePem: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
    publicPem: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
  };
}

function issueParams(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    run: { id: 'run_1', kind: 'desk.brief', host: 'claude-code', startedAt: '2026-09-21T09:58:00.000Z', endedAt: '2026-09-21T09:59:00.000Z' },
    subject: { name: 'brief.md', digest: { sha256: sha256Hex('brief') } },
    stages: [
      { name: 'retrieve', status: 'ok', costEur: 0.001, latencyMs: 100, inputTokens: 10, outputTokens: 5 },
      { name: 'synthesize', status: 'ok', costEur: 0.02, latencyMs: 800, inputTokens: 300, outputTokens: 120 },
    ],
    ...overrides,
  };
}

describe('Track B v0.1 — sis.receipt.* tools', () => {
  it('registers the three receipt tools', () => {
    withServer((srv) => {
      const names = srv.listTools().map((t) => t.name);
      for (const n of ['sis.receipt.issue', 'sis.receipt.verify', 'sis.receipt.list']) assert.ok(names.includes(n), n);
    });
  });

  it('issue without a key records an unsigned draft and writes a ledger line', () => {
    withServer((srv, root) => {
      const prevPath = process.env.SIS_SIGNING_KEY_PATH;
      const prevPem = process.env.SIS_SIGNING_KEY;
      delete process.env.SIS_SIGNING_KEY_PATH;
      delete process.env.SIS_SIGNING_KEY;
      try {
        const r = srv.call('sis.receipt.issue', issueParams()) as OkEnvelope;
        assert.equal(r.ok, true, r.error);
        assert.equal(r.status, 'draft');
        assert.ok(String(r.receiptId).startsWith('rcpt_'));
        assert.ok(String(r.note).includes('unsigned draft'));
        const receipt = r.receipt as { verdict: string; totals: { costEur: number }; issuer: { name: string } };
        assert.equal(receipt.verdict, 'PASS');
        assert.equal(receipt.totals.costEur, 0.021);
        assert.equal(receipt.issuer.name, 'starlight-intelligence-system');
        const path = join(root, 'memory', '_audit', 'receipts.jsonl');
        assert.equal(countLines(path), 1);
        const line = JSON.parse(readFileSync(path, 'utf-8').trim()) as { kind: string; receiptId: string };
        assert.equal(line.kind, 'draft');
        assert.equal(line.receiptId, r.receiptId);
      } finally {
        if (prevPath !== undefined) process.env.SIS_SIGNING_KEY_PATH = prevPath;
        if (prevPem !== undefined) process.env.SIS_SIGNING_KEY = prevPem;
      }
    });
  });

  it('issue with signing_key_pem signs, and verify with the public key passes', () => {
    withServer((srv, root) => {
      const k = keyPair();
      const r = srv.call('sis.receipt.issue', issueParams({ signing_key_pem: k.privatePem })) as OkEnvelope;
      assert.equal(r.ok, true, r.error);
      assert.equal(r.status, 'signed');
      assert.match(String(r.keyid), /^[0-9a-f]{64}$/);
      assert.ok(r.envelope);
      const receipt = r.receipt as { issuer: { keyid?: string } };
      assert.equal(receipt.issuer.keyid, r.keyid);
      const line = JSON.parse(readFileSync(join(root, 'memory', '_audit', 'receipts.jsonl'), 'utf-8').trim()) as { kind: string; keyid: string };
      assert.equal(line.kind, 'signed');
      assert.equal(line.keyid, r.keyid);

      const v = srv.call('sis.receipt.verify', { envelope: r.envelope, public_key_pem: k.publicPem }) as OkEnvelope;
      assert.equal(v.ok, true, v.error);
      assert.equal(v.verified, true, (v.reasons as string[]).join('; '));
      assert.equal(v.keyid, r.keyid);
      assert.equal((v.receipt as { receiptId: string }).receiptId, r.receiptId);
    });
  });

  it('verify with a different key returns verified=false with reasons', () => {
    withServer((srv) => {
      const signer = keyPair();
      const other = keyPair();
      const r = srv.call('sis.receipt.issue', issueParams({ signing_key_pem: signer.privatePem })) as OkEnvelope;
      assert.equal(r.status, 'signed');
      const v = srv.call('sis.receipt.verify', { envelope: r.envelope, public_key_pem: other.publicPem }) as OkEnvelope;
      assert.equal(v.ok, true);
      assert.equal(v.verified, false);
      assert.ok((v.reasons as string[]).length > 0);
      assert.equal(v.receipt, null);
    });
  });

  it('verify without any key is an error', () => {
    withServer((srv) => {
      const prev = process.env.SIS_TRUSTED_KEYS_DIR;
      delete process.env.SIS_TRUSTED_KEYS_DIR;
      try {
        const v = srv.call('sis.receipt.verify', { envelope: { payloadType: 'x', payload: '', signatures: [] } }) as OkEnvelope;
        assert.equal(v.ok, false);
        assert.equal(v.error, 'no trusted public key supplied');
      } finally {
        if (prev !== undefined) process.env.SIS_TRUSTED_KEYS_DIR = prev;
      }
    });
  });

  it('issue with an incomplete receipt (stages: []) is refused and persists nothing', () => {
    withServer((srv, root) => {
      const r = srv.call('sis.receipt.issue', issueParams({ stages: [] })) as OkEnvelope;
      assert.equal(r.ok, false);
      assert.ok(String(r.error).includes('no stages'), r.error);
      assert.equal(countLines(join(root, 'memory', '_audit', 'receipts.jsonl')), 0);
    });
  });

  it('list returns newest first with the documented fields', () => {
    withServer((srv) => {
      const k = keyPair();
      const first = srv.call('sis.receipt.issue', issueParams({ signing_key_pem: k.privatePem })) as OkEnvelope;
      const second = srv.call('sis.receipt.issue', issueParams({
        run: { id: 'run_2', kind: 'publish', host: 'codex', startedAt: '2026-09-21T10:00:00.000Z', endedAt: '2026-09-21T10:01:00.000Z' },
        subject: { name: 'post.md', digest: { sha256: sha256Hex('post') } },
        signing_key_pem: k.privatePem,
      })) as OkEnvelope;
      const l = srv.call('sis.receipt.list', { limit: 10 }) as OkEnvelope;
      assert.equal(l.ok, true);
      const receipts = l.receipts as Array<Record<string, unknown>>;
      assert.equal(receipts.length, 2);
      assert.equal(receipts[0].receiptId, second.receiptId);
      assert.equal(receipts[1].receiptId, first.receiptId);
      assert.deepEqual(receipts[0], {
        receiptId: second.receiptId,
        kind: 'signed',
        keyid: second.keyid,
        verdict: 'PASS',
        runKind: 'publish',
        issuedAt: (second.receipt as { issuedAt: string }).issuedAt,
        costEur: 0.021,
        subjectName: 'post.md',
      });
    });
  });

  it('subject given as {name, content} computes the sha256', () => {
    withServer((srv) => {
      const r = srv.call('sis.receipt.issue', issueParams({ subject: { name: 'brief.md', content: 'the brief body' } })) as OkEnvelope;
      assert.equal(r.ok, true, r.error);
      const receipt = r.receipt as { subject: { name: string; digest: { sha256: string } } };
      assert.equal(receipt.subject.digest.sha256, sha256Hex('the brief body'));
      assert.equal(receipt.subject.name, 'brief.md');
    });
  });
});
