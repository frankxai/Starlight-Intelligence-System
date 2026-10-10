import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEntries, readTar, digest, targets, pnpmInvocation } from '../scripts/verify-npm-ecosystem.mjs';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateReceipt, publishEcosystem } from '../scripts/publish-npm-ecosystem.mjs';
import { auditEstate, summarizePackage } from '../scripts/audit-npm-estate.mjs';

test('packing supports pnpm JavaScript and native launchers without accepting arbitrary shells', () => {
  const native = join(process.cwd(), 'pnpm');
  assert.deepEqual(pnpmInvocation(native), { command: native, prefix: [] });
  const js = join(process.cwd(), 'pnpm.mjs');
  assert.deepEqual(pnpmInvocation(js), { command: process.execPath, prefix: [js] });
  const exe = join(process.cwd(), 'pnpm.exe');
  assert.deepEqual(pnpmInvocation(exe), { command: exe, prefix: [] });
  for (const value of [undefined, 'pnpm', join(process.cwd(), 'npm-cli.js'), join(process.cwd(), 'pnpm.ps1')]) {
    assert.throws(() => pnpmInvocation(value));
  }
});

test('estate inventory refuses incomplete indexes and mismatched package identities', async () => {
  const json = value => new Response(JSON.stringify(value), { headers: { 'content-type': 'application/json' } });
  await assert.rejects(auditEstate(async () => json({ total: 2, objects: [{ package: { name: 'example' } }] })), /Incomplete/);
  await assert.rejects(auditEstate(async url => json(url.includes('/-/v1/search')
    ? { total: 1, objects: [{ package: { name: 'example' } }] }
    : { name: 'different', version: '1.0.0' })), /identity differs/);
  await assert.rejects(auditEstate(async () => json({ total: 2, objects: [{ package: { name: 'example' } }, { package: { name: 'example' } }] })), /Invalid maintainer/);
  assert.throws(() => summarizePackage({ name: '../private', version: '1.0.0' }), /Invalid registry/);
  const summary = summarizePackage({ name: 'example', version: '1.0.0', repository: { url: 'git+https://github.com/frankxai/example.git' } });
  assert.equal(summary.repository, 'https://github.com/frankxai/example');
  assert.equal(summary.provenanceAdvertised, false);
  assert.ok(summary.findings.includes('provenance-unadvertised'));
});

function fixture() {
  const pkg = { name: '@starlight-intelligence/core', version: '0.1.0', exports: { '.': './dist/index.js' }, types: './dist/index.d.ts' };
  return new Map([['package/package.json', Buffer.from(JSON.stringify(pkg))], ['package/dist/index.js', Buffer.from('export const version = 1;')],
    ['package/dist/index.d.ts', Buffer.from('export declare const version: number;')], ['package/README.md', Buffer.from('Usage')], ['package/LICENSE', Buffer.from('MIT')],
    ['package/schemas/agent-event.schema.json', Buffer.from('{}')]]);
}

test('package audit fails on private files, missing exports, nonportable imports and unresolved dependencies', () => {
  assert.equal(validateEntries(fixture(), '@starlight-intelligence/core').version, '0.1.0');
  const privateFile = fixture(); privateFile.set('package/memory/private.json', Buffer.from('{}'));
  assert.throws(() => validateEntries(privateFile, '@starlight-intelligence/core'));
  const missing = fixture(); missing.delete('package/dist/index.d.ts');
  assert.throws(() => validateEntries(missing, '@starlight-intelligence/core'));
  const nodeImport = fixture(); nodeImport.set('package/dist/index.js', Buffer.from('import fs from "node:fs";'));
  assert.throws(() => validateEntries(nodeImport, '@starlight-intelligence/core'));
  nodeImport.set('package/dist/index.js', Buffer.from('import "node:fs";'));
  assert.throws(() => validateEntries(nodeImport, '@starlight-intelligence/core'));
  nodeImport.set('package/dist/index.js', Buffer.alloc(20_000, 32));
  assert.throws(() => validateEntries(nodeImport, '@starlight-intelligence/core'), /runtime budget/);
  const local = fixture(); const pkg = JSON.parse(local.get('package/package.json')); pkg.dependencies = { another: 'workspace:*' };
  local.set('package/package.json', Buffer.from(JSON.stringify(pkg)));
  assert.throws(() => validateEntries(local, '@starlight-intelligence/core'));
});

function tar(entries, type = '0') {
  const blocks = [];
  for (const [name, bytes] of entries) {
    const header = Buffer.alloc(512);
    header.write(name, 0, 100); header.write('0000644\0', 100); header.write(bytes.length.toString(8).padStart(11, '0') + '\0', 124);
    header.fill(32, 148, 156); header.write(type, 156); header.write('ustar\0', 257);
    header.write(header.reduce((sum, byte) => sum + byte, 0).toString(8).padStart(6, '0') + '\0 ', 148);
    blocks.push(header, bytes, Buffer.alloc((512 - bytes.length % 512) % 512));
  }
  return gzipSync(Buffer.concat([...blocks, Buffer.alloc(1024)]));
}

test('tar parser rejects traversal, links and malformed archives', () => {
  assert.equal(readTar(tar(fixture())).size, fixture().size);
  assert.throws(() => readTar(tar(new Map([['package/../private', Buffer.from('private')]]))));
  assert.throws(() => readTar(tar(fixture(), '2')));
  assert.throws(() => readTar(Buffer.from('invalid gzip')));
});

test('publication validates real artifact bytes and rejects forged registry integrity', () => {
  const directory = join(process.cwd(), 'artifacts', 'release-unit-tests');
  mkdirSync(directory, { recursive: true });
  const run = mkdtempSync(join(directory, 'run-'));
  const packages = targets.map(([, name]) => {
    const entries = fixture(); const pkg = JSON.parse(entries.get('package/package.json')); pkg.name = name;
    entries.set('package/package.json', Buffer.from(JSON.stringify(pkg)));
    const bytes = tar(entries);
    const file = name.replace('@', '').replace('/', '-') + '-0.1.0.tgz';
    writeFileSync(join(run, file), bytes);
    return { name, version: '0.1.0', file, sha256: digest(bytes), integrity: 'sha512-' + createHash('sha512').update(bytes).digest('base64') };
  });
  const receipt = { schemaVersion: 1, sourceSha: 'a'.repeat(40), dirty: false, packages };
  assert.equal(validateReceipt(receipt, receipt.sourceSha, run).length, 3);
  receipt.packages[0].integrity = 'sha512-forged';
  assert.throws(() => validateReceipt(receipt, receipt.sourceSha, run), /integrity mismatch/);
});

test('dirty, mismatched or incomplete receipts and local publication cannot pass', () => {
  assert.throws(() => validateReceipt({ schemaVersion: 1, dirty: true, packages: [] }, 'a'.repeat(40), '.'));
  assert.throws(() => validateReceipt({ schemaVersion: 1, dirty: false, packages: [] }, 'a'.repeat(40), '.'));
  assert.throws(() => publishEcosystem(), /approved main-branch OIDC/);
});
