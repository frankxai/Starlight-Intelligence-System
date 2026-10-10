import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';
import { readTar } from '../scripts/verify-npm-ecosystem.mjs';
import { inspectArtifact, registryUrl, checkIntegrity, auditArtifacts } from '../scripts/audit-npm-artifacts.mjs';

function archive(manifest, extra = []) {
  const members = new Map([['package/package.json', Buffer.from(JSON.stringify(manifest))], ['package/dist/index.js', Buffer.from('export const fixture = 1;')], ...extra]);
  const blocks = [];
  for (const [name, bytes] of members) {
    const header = Buffer.alloc(512);
    header.write(name, 0, 100); header.write('0000644\0', 100);
    header.write(bytes.length.toString(8).padStart(11, '0') + '\0', 124);
    header.fill(32, 148, 156); header.write('0', 156); header.write('ustar\0', 257);
    header.write(header.reduce((sum, byte) => sum + byte, 0).toString(8).padStart(6, '0') + '\0 ', 148);
    blocks.push(header, bytes, Buffer.alloc((512 - bytes.length % 512) % 512));
  }
  return gzipSync(Buffer.concat([...blocks, Buffer.alloc(1024)]));
}

const manifest = { name: '@starlight-intelligence/fixture', version: '1.0.0', main: 'dist/index.js' };
const identity = bytes => ({ name: manifest.name, version: manifest.version,
  integrity: 'sha512-' + createHash('sha512').update(bytes).digest('base64') });

test('release parser refuses missing terminators, incomplete padding and concealed trailing members', () => {
  const raw = gunzipSync(archive(manifest));
  assert.throws(() => readTar(gzipSync(raw.subarray(0, -1024))), /tar/);
  assert.throws(() => readTar(gzipSync(raw.subarray(0, -512))), /tar/);
  assert.throws(() => readTar(gzipSync(raw.subarray(0, -1025))), /tar/);
  assert.throws(() => readTar(gzipSync(Buffer.concat([raw, raw]))), /tar/);
  const padding = Buffer.from(raw);
  padding[512 + Buffer.byteLength(JSON.stringify(manifest))] = 1;
  assert.throws(() => readTar(gzipSync(padding)), /tar/);
});

test('release parser denies ambiguous paths and numeric fields without rejecting ordinary dotted names', () => {
  for (const path of ['package/./index.js', 'package//index.js', 'package/x:y', 'package/x\u0001y', 'package/x\u007fy']) {
    assert.throws(() => readTar(archive(manifest, [[path, Buffer.from('fixture')]])), /tar/);
  }
  assert.ok(readTar(archive(manifest, [['package/v1..v2.js', Buffer.from('fixture')]])).has('package/v1..v2.js'));
  const raw = gunzipSync(archive(manifest));
  raw.write('0000000001x\0', 124);
  raw.fill(32, 148, 156);
  raw.write(raw.subarray(0, 512).reduce((n, byte) => n + byte, 0).toString(8).padStart(6, '0') + '\0 ', 148);
  assert.throws(() => readTar(gzipSync(raw)), /tar/);
});

test('artifact identity and digest are verified before scanning untrusted contents', () => {
  const bytes = archive(manifest);
  let scans = 0;
  const result = inspectArtifact(bytes, identity(bytes), () => { scans++; return 'clear'; });
  assert.equal(result.status, 'inspected'); assert.deepEqual(result.findings, []); assert.equal(scans, 1);
  assert.throws(() => inspectArtifact(bytes, { ...identity(bytes), version: '2.0.0' }, () => { scans++; }), /identity-mismatch/);
  assert.throws(() => inspectArtifact(bytes, { ...identity(bytes), integrity: 'sha512-' + 'A'.repeat(88) }, () => { scans++; }), /integrity-mismatch/);
  assert.equal(scans, 1);
  assert.throws(() => checkIntegrity(bytes, 'sha1-unsupported'), /integrity-unsupported/);
});

test('static flags identify broken exports, unpublished dependencies and state paths without leaking content', () => {
  const bytes = archive({ ...manifest, exports: { '.': './missing.js', './dist/*': './dist/*' },
    dependencies: { example: 'workspace:*' } }, [['package/.env', Buffer.from('synthetic test data')]]);
  const result = inspectArtifact(bytes, identity(bytes), () => 'findings');
  assert.deepEqual(result.findings, ['advertised-entry-missing', 'published-local-dependency', 'state-path-needs-review', 'secret-scan-findings']);
  assert.equal(result.missingEntries.length, 1);
  assert.ok(!JSON.stringify(result).includes('synthetic test data'));
  assert.throws(() => inspectArtifact(bytes, identity(bytes), () => 'unavailable'), /secret-scan-unavailable/);
});

test('registry requests deny external hosts, credentials, redirects and partial inventory assumptions', async () => {
  for (const url of ['https://example.com/a', 'http://registry.npmjs.org/a', 'https://user:opaque@registry.npmjs.org/a', 'https://registry.npmjs.org/a?query=1']) {
    assert.throws(() => registryUrl(url));
  }
  await assert.rejects(auditArtifacts({ complete: false, packages: [] }), /inventory-incomplete/);
  await assert.rejects(auditArtifacts({ complete: true, packages: [{ name: '../invalid', version: '1.0.0' }] }), /inventory-identity-invalid/);
  const bytes = archive(manifest); const row = identity(bytes);
  const calls = [];
  const result = await auditArtifacts({ complete: true, packages: [row] }, async (url, options) => {
    calls.push({ url, redirect: options.redirect });
    return calls.length === 1
      ? new Response(JSON.stringify({ ...manifest, dist: { integrity: row.integrity, tarball: 'https://registry.npmjs.org/fixture/-/fixture-1.0.0.tgz' } }))
      : new Response(bytes);
  }, () => 'clear');
  assert.equal(result.packages[0].status, 'inspected');
  assert.equal(calls.length, 2); assert.ok(calls.every(call => call.redirect === 'error'));
});

test('install hooks require explicit follow-up without executing or exposing their contents', () => {
  for (const name of ['preinstall', 'install', 'postinstall']) {
    const bytes = archive({ ...manifest, scripts: { [name]: 'synthetic private hook text' } });
    const result = inspectArtifact(bytes, identity(bytes), () => 'clear');
    assert.deepEqual(result.installLifecycleScripts, [name]);
    assert.deepEqual(result.findings, ['install-lifecycle-needs-review']);
    assert.ok(!JSON.stringify(result).includes('synthetic private hook text'));
  }
});

test('changed registry evidence cannot silently substitute an artifact; malformed bodies stay isolated', async () => {
  const row = identity(archive(manifest));
  let calls = 0;
  const result = await auditArtifacts({ complete: true, packages: [row] }, async () => {
    calls++; return new Response(JSON.stringify({ ...manifest, dist: { integrity: 'different' } }));
  });
  assert.equal(calls, 1); assert.equal(result.packages[0].reason, 'registry-identity-or-integrity-changed');
  const oversized = await auditArtifacts({ complete: true, packages: [row] }, async () => new Response(Buffer.alloc(2_000_001)));
  assert.equal(oversized.packages[0].reason, 'archive-budget-exceeded');
});

test('aggregate response budget includes metadata and failed requests and stops later fetches', async () => {
  const bytes = archive(manifest);
  const row = identity(bytes);
  const inventory = { complete: true, packages: [row, { ...row, version: '2.0.0' }] };
  let calls = 0;
  const result = await auditArtifacts(inventory, async () => {
    calls++;
    return new Response(new ReadableStream({ start(controller) {
      controller.enqueue(Buffer.alloc(50));
      controller.enqueue(Buffer.alloc(50));
      controller.close();
    } }));
  }, () => 'clear', 100);
  assert.equal(calls, 1);
  assert.equal(result.transferredBytes, 100);
  assert.equal(result.packages[0].reason, 'archive-or-metadata-needs-review');
  assert.equal(result.packages[1].reason, 'estate-transfer-budget-exceeded');
  await assert.rejects(auditArtifacts(inventory, undefined, undefined, 64_000_001), /transfer-budget-invalid/);
});
