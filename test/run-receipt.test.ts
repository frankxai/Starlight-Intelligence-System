/**
 * Run receipt v1 — pure module tests (src/run-receipt.ts)
 *
 *   • sign → verify roundtrip
 *   • tampered payload fails
 *   • wrong key fails with a reason naming the keyid
 *   • receiptProblems catches structural defects
 *   • FAIL verdict is signable
 *   • issuer.keyid mismatch fails verification
 *   • peekRunReceipt returns the receipt without a key
 *
 * Built on SIP — operational tier
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createPrivateKey, generateKeyPairSync, sign } from 'node:crypto';
import {
  PAYLOAD_TYPE,
  RUN_RECEIPT_SCHEMA,
  keyIdOf,
  pae,
  peekRunReceipt,
  receiptProblems,
  sha256Hex,
  signRunReceipt,
  totalsFromStages,
  verdictFromStages,
  verifyRunReceipt,
  type RunReceipt,
  type RunReceiptStage,
  MAX_SIGNATURES,
  receiptStatement,
} from '../src/run-receipt.js';

function keyPair(): { privatePem: string; publicPem: string; keyid: string } {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  return {
    privatePem: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
    publicPem: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
    keyid: keyIdOf(publicKey),
  };
}

const STAGES: RunReceiptStage[] = [
  { name: 'retrieve', status: 'ok', model: 'local', provider: 'local', inputTokens: 100, outputTokens: 20, costEur: 0.001, latencyMs: 120 },
  { name: 'synthesize', status: 'ok', model: 'test-model', provider: 'test', inputTokens: 400, outputTokens: 200, costEur: 0.01, latencyMs: 900 },
];

function receipt(overrides: Partial<RunReceipt> = {}): RunReceipt {
  return {
    schema: RUN_RECEIPT_SCHEMA,
    receiptId: 'rcpt_test_1',
    issuedAt: '2026-09-21T10:00:00.000Z',
    issuer: { name: 'test-issuer' },
    run: { id: 'run_1', kind: 'desk.brief', host: 'claude-code', startedAt: '2026-09-21T09:58:00.000Z', endedAt: '2026-09-21T09:59:00.000Z' },
    subject: { name: 'brief.md', digest: { sha256: sha256Hex('hello') } },
    stages: STAGES,
    totals: totalsFromStages(STAGES),
    decisions: [{ gate: 'publish', decidedBy: 'human', actorId: 'frank', outcome: 'approved', at: '2026-09-21T09:59:30.000Z' }],
    evidence: [{ kind: 'ledger', ref: 'memory/_audit/agent-events/2026-09-21.jsonl' }],
    verdict: verdictFromStages(STAGES),
    ...overrides,
  };
}

describe('run receipt — sign and verify', () => {
  it('sign → verify roundtrip succeeds and reports the keyid', () => {
    const k = keyPair();
    const envelope = signRunReceipt(receipt(), k.privatePem);
    const result = verifyRunReceipt(envelope, [k.publicPem]);
    assert.equal(result.ok, true, result.reasons.join('; '));
    assert.equal(result.keyid, k.keyid);
    assert.equal(result.receipt?.receiptId, 'rcpt_test_1');
    assert.equal(result.receipt?.issuer.keyid, k.keyid);
  });

  it('tampered payload fails verification', () => {
    const k = keyPair();
    const envelope = signRunReceipt(receipt(), k.privatePem);
    const statement = JSON.parse(Buffer.from(envelope.payload, 'base64').toString('utf8'));
    statement.predicate.totals.costEur = 999;
    const tampered = { ...envelope, payload: Buffer.from(JSON.stringify(statement), 'utf8').toString('base64') };
    const result = verifyRunReceipt(tampered, [k.publicPem]);
    assert.equal(result.ok, false);
    assert.ok(result.reasons.some((r) => r.includes('does not verify')), result.reasons.join('; '));
  });

  it('wrong key fails with a reason naming the signing keyid', () => {
    const signer = keyPair();
    const other = keyPair();
    const envelope = signRunReceipt(receipt(), signer.privatePem);
    const result = verifyRunReceipt(envelope, [other.publicPem]);
    assert.equal(result.ok, false);
    assert.ok(result.reasons.some((r) => r.includes(signer.keyid.slice(0, 16))), result.reasons.join('; '));
  });

  it('FAIL verdict is signable', () => {
    const k = keyPair();
    const failed: RunReceiptStage[] = [{ name: 'retrieve', status: 'failed', latencyMs: 10 }];
    const r = receipt({ stages: failed, totals: totalsFromStages(failed), verdict: verdictFromStages(failed) });
    assert.equal(r.verdict, 'FAIL');
    const envelope = signRunReceipt(r, k.privatePem);
    const result = verifyRunReceipt(envelope, [k.publicPem]);
    assert.equal(result.ok, true, result.reasons.join('; '));
    assert.equal(result.receipt?.verdict, 'FAIL');
  });

  it('issuer.keyid mismatch fails verification', () => {
    const k = keyPair();
    const envelope = signRunReceipt(receipt(), k.privatePem);
    // Re-sign a statement that names a different issuer keyid, with the real key.
    const statement = JSON.parse(Buffer.from(envelope.payload, 'base64').toString('utf8'));
    statement.predicate.issuer.keyid = 'a'.repeat(64);
    const payload = Buffer.from(JSON.stringify(statement), 'utf8');
    const sig = sign(null, pae(PAYLOAD_TYPE, payload), createPrivateKey(k.privatePem));
    const forged = { payloadType: PAYLOAD_TYPE, payload: payload.toString('base64'), signatures: [{ keyid: k.keyid, sig: sig.toString('base64') }] };
    const result = verifyRunReceipt(forged, [k.publicPem]);
    assert.equal(result.ok, false);
    assert.ok(result.reasons.some((r) => r.includes('names issuer keyid')), result.reasons.join('; '));
  });

  it('peekRunReceipt returns the receipt without a key', () => {
    const k = keyPair();
    const envelope = signRunReceipt(receipt(), k.privatePem);
    const peeked = peekRunReceipt(envelope);
    assert.ok(peeked);
    assert.equal(peeked.receiptId, 'rcpt_test_1');
    assert.equal(peeked.subject.digest.sha256, sha256Hex('hello'));
    assert.equal(peekRunReceipt({ payload: 42 }), null);
  });
});

describe('run receipt — receiptProblems', () => {
  it('a complete receipt has no problems', () => {
    assert.deepEqual(receiptProblems(receipt()), []);
  });

  it('catches missing stages', () => {
    const problems = receiptProblems(receipt({ stages: [] }));
    assert.ok(problems.some((p) => p.includes('no stages')), problems.join('; '));
  });

  it('catches totals below the stage sums', () => {
    const problems = receiptProblems(receipt({ totals: { costEur: 0, latencyMs: 0, tokens: { input: 0, output: 0 } } }));
    assert.ok(problems.some((p) => p.includes('totals.costEur') && p.includes('below the stage sum')), problems.join('; '));
    assert.ok(problems.some((p) => p.includes('totals.latencyMs') && p.includes('below the stage sum')));
    assert.ok(problems.some((p) => p.includes('totals.tokens.input') && p.includes('below the stage sum')));
  });

  it('catches a bad verdict', () => {
    const problems = receiptProblems(receipt({ verdict: 'MAYBE' as RunReceipt['verdict'] }));
    assert.ok(problems.some((p) => p.startsWith('verdict is')), problems.join('; '));
  });

  it('catches endedAt before startedAt', () => {
    const r = receipt();
    const problems = receiptProblems({ ...r, run: { ...r.run, startedAt: '2026-09-21T10:00:00.000Z', endedAt: '2026-09-21T09:00:00.000Z' } });
    assert.ok(problems.some((p) => p.includes('endedAt is before')), problems.join('; '));
  });

  it('catches a bad subject sha256', () => {
    const problems = receiptProblems(receipt({ subject: { name: 'x', digest: { sha256: 'nope' } } }));
    assert.ok(problems.some((p) => p.includes('subject.digest.sha256')), problems.join('; '));
  });

  it('signRunReceipt refuses an incomplete receipt', () => {
    const k = keyPair();
    assert.throws(() => signRunReceipt(receipt({ stages: [] }), k.privatePem), /refusing to sign/);
  });
});

// Hardening after the 2026-09-21 code review: cost caps and strictness that the
// schema states and the verifier must enforce identically on both sides.
describe('run receipt hardening', () => {
  function keys() {
    const { privateKey, publicKey } = generateKeyPairSync('ed25519');
    return {
      priv: privateKey.export({ type: 'pkcs8', format: 'pem' }) as string,
      pub: publicKey.export({ type: 'spki', format: 'pem' }) as string,
    };
  }
  function baseReceipt(): RunReceipt {
    const stages: RunReceiptStage[] = [{ name: 'synthesize', status: 'ok', costEur: 0.002, latencyMs: 900, inputTokens: 100, outputTokens: 20 }];
    return {
      schema: RUN_RECEIPT_SCHEMA,
      receiptId: 'rcpt_hardening',
      issuedAt: '2026-09-21T22:00:00Z',
      issuer: { name: 'test' },
      run: { id: 'run_h', kind: 'desk.brief', host: 'claude-code', startedAt: '2026-09-21T21:59:00Z', endedAt: '2026-09-21T21:59:30Z' },
      subject: { name: 'brief.md', digest: { sha256: sha256Hex('brief') } },
      stages,
      totals: totalsFromStages(stages),
      decisions: [],
      evidence: [],
      verdict: 'PASS',
    };
  }

  it('rejects an envelope with more than MAX_SIGNATURES signatures before any crypto work', () => {
    const k = keys();
    const env = signRunReceipt(baseReceipt(), k.priv);
    const flooded = { ...env, signatures: Array.from({ length: MAX_SIGNATURES + 1 }, () => ({ sig: 'AA==' })) };
    const res = verifyRunReceipt(flooded, [k.pub]);
    assert.equal(res.ok, false);
    assert.match(res.reasons.join(' '), /signatures; at most/);
  });

  it('rejects a statement whose subject name differs from the receipt subject', () => {
    const k = keys();
    const receipt = baseReceipt();
    const statement = receiptStatement(receipt);
    statement.subject[0].name = 'other.md';
    const payload = Buffer.from(JSON.stringify(statement), 'utf8');
    const sig = sign(null, pae(PAYLOAD_TYPE, payload), createPrivateKey(k.priv));
    const env = { payloadType: PAYLOAD_TYPE, payload: payload.toString('base64'), signatures: [{ keyid: keyIdOf(k.pub), sig: sig.toString('base64') }] };
    const res = verifyRunReceipt(env, [k.pub]);
    assert.equal(res.ok, false);
    assert.match(res.reasons.join(' '), /subject name does not match/);
  });

  it('rejects a statement with two subjects', () => {
    const k = keys();
    const receipt = baseReceipt();
    const statement = receiptStatement(receipt) as { subject: unknown[] };
    statement.subject.push({ name: 'x', digest: { sha256: sha256Hex('x') } });
    const payload = Buffer.from(JSON.stringify(statement), 'utf8');
    const sig = sign(null, pae(PAYLOAD_TYPE, payload), createPrivateKey(k.priv));
    const env = { payloadType: PAYLOAD_TYPE, payload: payload.toString('base64'), signatures: [{ keyid: keyIdOf(k.pub), sig: sig.toString('base64') }] };
    assert.match(verifyRunReceipt(env, [k.pub]).reasons.join(' '), /exactly one subject/);
  });

  it('rejects unknown properties, loose dates and a malformed keyid, matching the schema', () => {
    const withExtra = { ...baseReceipt(), extra: 1 } as unknown as RunReceipt;
    assert.match(receiptProblems(withExtra).join(' '), /unknown property extra/);
    const stageExtra = baseReceipt();
    (stageExtra.stages[0] as unknown as Record<string, unknown>).tool = 'x';
    assert.match(receiptProblems(stageExtra).join(' '), /unknown property stages\[0\]\.tool/);
    const looseDate = { ...baseReceipt(), issuedAt: '2026' };
    assert.match(receiptProblems(looseDate).join(' '), /issuedAt is not a date-time/);
    const badKey = { ...baseReceipt(), issuer: { name: 't', keyid: 'abc' } };
    assert.match(receiptProblems(badKey).join(' '), /issuer.keyid is not a sha256 keyid/);
    assert.deepEqual(receiptProblems(baseReceipt()), []);
  });
});
