import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  signBridgePayload,
  verifyBridgePayload,
  compressContextForPromptCache,
  ingestCloudReceipts,
  collectUnifiedEcosystemTelemetry
} from '../scripts/cloud-bridge-sync.mjs';

test('signBridgePayload and verifyBridgePayload validate HMAC-SHA256 and reject tampered or expired payloads', () => {
  const secret = 'test-bridge-secret-key';
  const ts = new Date().toISOString();
  const body = JSON.stringify({ receiptId: 'rcpt_1', plane: 'n8n', status: 'ok' });

  const sig = signBridgePayload(secret, ts, body);
  const okRes = verifyBridgePayload(secret, ts, body, sig);
  assert.equal(okRes.valid, true);

  const badBodyRes = verifyBridgePayload(secret, ts, '{"tampered":true}', sig);
  assert.equal(badBodyRes.valid, false);

  const staleTs = new Date(Date.now() - 600 * 1000).toISOString();
  const staleSig = signBridgePayload(secret, staleTs, body);
  const staleRes = verifyBridgePayload(secret, staleTs, body, staleSig, 300);
  assert.equal(staleRes.valid, false);
});

test('compressContextForPromptCache pins ephemeral cache_control blocks and compresses repetitive logs', () => {
  const noisyLogs = Array.from({ length: 120 }, (_, i) =>
    i === 60
      ? '2026-10-17T19:00:00Z ERROR: critical failure in commit a1b2c3d4'
      : '2026-10-17T19:00:00Z INFO: polling status tick normal'
  ).join('\n');

  const res = compressContextForPromptCache({
    bandAContract: 'BAND-A',
    vaultContext: 'VAULTS',
    dynamicToolLogs: noisyLogs,
    maxLogLines: 20
  });

  assert.equal(res.schema, 'starlight.prompt_cache_envelope.v1');
  assert.equal(res.systemBlocks.length, 2);
  assert.deepEqual(res.systemBlocks[0].cache_control, { type: 'ephemeral' });
  assert.ok(res.dynamicContext.includes('ERROR: critical failure in commit a1b2c3d4'));
  assert.ok(res.metrics.reductionPercent > 50);
});

test('ingestCloudReceipts writes SIP-attested heartbeat JSON files', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'starlight-hb-'));
  try {
    const written = ingestCloudReceipts(
      [{ plane: 'n8n', status: 'ok', detail: 'test receipt' }],
      { heartbeatsDir: tmpDir }
    );
    assert.equal(written.length, 1);
    const content = JSON.parse(fs.readFileSync(written[0], 'utf8'));
    assert.equal(content.status, 'ok');
    assert.equal(content.attestation, 'Built on SIP');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('collectUnifiedEcosystemTelemetry produces valid starlight.ecosystem_telemetry.v1 snapshot', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'starlight-rep-'));
  try {
    const summary = collectUnifiedEcosystemTelemetry({ reportsDir: tmpDir });
    assert.equal(summary.schema, 'starlight.ecosystem_telemetry.v1');
    assert.equal(summary.attestation, 'Built on SIP');
    assert.ok(typeof summary.costAndQuota.openrouter.remainingUsd === 'number');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
