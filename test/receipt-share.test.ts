/**
 * Compact receipt links (src/receipt-share.ts)
 *
 *   • z: form round-trips a signed envelope byte for byte and still verifies
 *   • z: form fits a QR where the plain form does not
 *   • the site parses the same vector (pinned here and in
 *     starlight-intelligence-web/scripts/tests/receipt-share.test.mjs)
 *   • malformed values return an error, never throw
 *
 * Built on SIP — operational tier
 */
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { test } from 'node:test';

import { deflateRawSync } from 'node:zlib';
import { compactShareParam, parseShareParam, QR_MAX_CHARS, receiptShareUrl, shareParam } from '../src/receipt-share.js';
import { signRunReceipt, verifyRunReceipt, type RunReceipt } from '../src/run-receipt.js';

const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
const publicPem = publicKey.export({ type: 'spki', format: 'pem' }) as string;

function receipt(): RunReceipt {
  const stage = (name: string, model: string, costEur: number, latencyMs: number) => ({
    name, status: 'ok' as const, model, provider: 'nebius', inputTokens: 5000, outputTokens: 700, costEur, latencyMs,
  });
  const stages = [
    stage('retrieve', 'tavily', 0.0004, 900),
    stage('extract', 'nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B', 0.0006, 2100),
    stage('synthesize', 'deepseek-ai/DeepSeek-V4-Flash-0731', 0.0018, 4200),
    stage('judge', 'openai/gpt-oss-120b', 0.0005, 1200),
  ];
  return {
    schema: 'starlight.run-receipt.v1',
    receiptId: 'rr_test_0001',
    issuedAt: '2026-09-22T00:00:00Z',
    issuer: { name: 'Test issuer' },
    run: { id: 'run_1', kind: 'desk.brief', host: 'claude-code', startedAt: '2026-09-22T00:00:00Z', endedAt: '2026-09-22T00:00:09Z' },
    subject: { name: 'brief.md', digest: { sha256: 'a'.repeat(64) } },
    stages,
    totals: { costEur: 0.0033, latencyMs: 8400, tokens: { input: 20000, output: 2800 } },
    decisions: [{ gate: 'publish', decidedBy: 'human', actorId: 'frank', outcome: 'approved', at: '2026-09-22T00:00:09Z' }],
    evidence: [{ kind: 'source', ref: 'https://example.org/a' }],
    verdict: 'PASS',
  };
}

test('z: round-trips the envelope exactly and the signature still verifies', () => {
  const envelope = signRunReceipt(receipt(), privatePem);
  const z = compactShareParam(envelope);
  assert.ok(z && z.startsWith('z:'));
  const parsed = parseShareParam(z);
  assert.equal(parsed.error, undefined);
  assert.deepEqual(parsed.envelope, envelope);
  assert.equal(verifyRunReceipt(parsed.envelope, [publicPem]).ok, true);
});

test('z: fits a QR where b64u: does not', () => {
  const envelope = signRunReceipt(receipt(), privatePem);
  const url = receiptShareUrl(envelope);
  assert.ok(url.startsWith('https://starlightintelligence.ai/verify?r=z:'));
  assert.ok(url.length < QR_MAX_CHARS, `${url.length} chars`);
  assert.ok(`https://starlightintelligence.ai/verify?r=${shareParam(envelope)}`.length > QR_MAX_CHARS, 'the plain form is the long one');
  assert.deepEqual(parseShareParam(shareParam(envelope)).envelope, envelope, 'the plain form still parses');
});

test('the pinned vector parses to the pinned envelope (shared with the site test)', () => {
  const envelope = { payloadType: 'application/vnd.in-toto+json', payload: Buffer.from('{"_type":"x","subject":[]}', 'utf8').toString('base64'), signatures: [{ keyid: 'k', sig: 'c2ln' }] };
  const vector = 'z:' + deflateRawSync(JSON.stringify({ t: envelope.payloadType, p: '{"_type":"x","subject":[]}', s: envelope.signatures }), { level: 9 }).toString('base64url');
  assert.equal(compactShareParam(envelope), vector);
  assert.deepEqual(parseShareParam(vector).envelope, envelope);
});

test('malformed values return an error and never throw', () => {
  assert.ok(parseShareParam('z:').error);
  assert.ok(parseShareParam('z:%%%').error);
  assert.ok(parseShareParam('z:AAAA').error, 'not a deflate stream');
  assert.ok(parseShareParam('z:' + deflateRawSync('[1]').toString('base64url')).error, 'JSON but not an object');
  assert.ok(parseShareParam('z:' + deflateRawSync('{"t":1}').toString('base64url')).error, 'wrong shape');
  const bomb = 'z:' + deflateRawSync(Buffer.alloc(200_000, 0x20), { level: 9 }).toString('base64url');
  assert.ok(parseShareParam(bomb).error, 'inflation is capped');
  assert.ok(parseShareParam('not a link').error);
  assert.equal(compactShareParam({ nope: true }), null);
});
