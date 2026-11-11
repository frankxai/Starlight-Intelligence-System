import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, realpathSync, truncateSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, basename, resolve } from 'node:path';
import { syncDriveFolder } from '../tools/ingestion/drive-sync.js';
import { convertGDocFile, readDocumentSnapshot, MAX_DOCUMENT_BYTES } from '../tools/ingestion/gdoc-converter.js';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const roots: string[] = [];
function fixture() {
  const root = mkdtempSync(join(realpathSync(tmpdir()), 'sis-ingest-'));
  roots.push(root);
  const source = join(root, 'source'); const target = join(root, 'intake');
  mkdirSync(source);
  return { root, source, target };
}
after(() => {
  const allowedParent = realpathSync(tmpdir());
  for (const root of roots) {
    assert.equal(dirname(resolve(root)), allowedParent);
    assert.ok(basename(root).startsWith('sis-ingest-'));
    rmSync(root, { recursive: true, force: true });
  }
});
test('dry-run plans work without claiming writes or creating folders', () => {
  const f = fixture(); writeFileSync(join(f.source, 'notes.html'), '<h1>Notes</h1>');
  const report = syncDriveFolder({ sourceDir: f.source, targetDir: f.target, dryRun: true });
  assert.equal(report.transferred, 0); assert.equal(report.converted, 0);
  assert.equal(report.files[0].status, 'planned'); assert.equal(existsSync(f.target), false);
});
test('retains an existing edited conversion and reports a collision', () => {
  const f = fixture(); writeFileSync(join(f.source, 'notes.html'), '<h1>New notes</h1>'); mkdirSync(f.target);
  writeFileSync(join(f.target, 'notes.md'), 'My reviewed edit');
  const report = syncDriveFolder({ sourceDir: f.source, targetDir: f.target });
  assert.equal(readFileSync(join(f.target, 'notes.md'), 'utf8'), 'My reviewed edit');
  assert.equal(report.files[0].status, 'failed'); assert.equal(report.converted, 0); assert.equal(report.transferred, 0);
});
test('stages a local export, then retries without overwriting it', () => {
  const f = fixture(); writeFileSync(join(f.source, 'notes.html'), '<h1>Source notes</h1><p>Useful material.</p>');
  const first = syncDriveFolder({ sourceDir: f.source, targetDir: f.target });
  assert.equal(first.converted, 1); assert.equal(first.transferred, 1);
  const initial = readFileSync(join(f.target, 'notes.md'), 'utf8');
  const next = syncDriveFolder({ sourceDir: f.source, targetDir: f.target });
  assert.equal(next.converted, 0); assert.equal(next.transferred, 0); assert.equal(next.files[0].status, 'skipped');
  assert.equal(readFileSync(join(f.target, 'notes.md'), 'utf8'), initial);
});
test('different source extensions cannot overwrite the same output name', () => {
  const f = fixture(); writeFileSync(join(f.source, 'notes.html'), '<h1>HTML source</h1>'); writeFileSync(join(f.source, 'notes.txt'), 'Different source');
  const report = syncDriveFolder({ sourceDir: f.source, targetDir: f.target });
  assert.equal(report.converted, 1); assert.equal(report.files.filter(x => x.status === 'failed').length, 1);
  assert.equal(report.transferred, 1);
});
test('no-copy no-convert mode does not claim a successful transfer', () => {
  const f = fixture(); writeFileSync(join(f.source, 'notes.txt'), 'Notes');
  const report = syncDriveFolder({ sourceDir: f.source, targetDir: f.target, preserveRaw: false, autoConvert: false });
  assert.equal(report.transferred, 0); assert.equal(report.converted, 0); assert.equal(report.files[0].status, 'skipped');
  assert.equal(existsSync(f.target), false);
});
test('rejects shortcut and binary files as direct text conversions', () => {
  const f = fixture(); const shortcut = join(f.source, 'notes.gdoc'); const pdf = join(f.source, 'notes.pdf');
  writeFileSync(shortcut, '{"url":"https://docs.google.com/document/d/example/edit"}'); writeFileSync(pdf, '%PDF-1.7');
  assert.throws(() => convertGDocFile(shortcut), /export|shortcut/i);
  assert.throws(() => convertGDocFile(pdf), /unsupported/i);
});
test('rejects a destination inside the source folder', () => {
  const f = fixture();
  assert.throws(() => syncDriveFolder({ sourceDir: f.source, targetDir: join(f.source, 'intake') }), /overlap/i);
});
test('pins source bytes and omits invented authorship and attestation', () => {
  const f = fixture(); const input = join(f.source, 'notes.html'); const bytes = Buffer.from('<p>Source evidence.</p>'); writeFileSync(input, bytes);
  const result = convertGDocFile(input);
  assert.equal(result.metadata.sourceSha256, createHash('sha256').update(bytes).digest('hex'));
  assert.ok(!result.frontmatter.includes('author:')); assert.ok(!result.frontmatter.includes('attestation:'));
  assert.match(result.frontmatter, /source_role: "untrusted-input"/);
});
test('rejects invalid UTF-8 and invalid forced vault names', () => {
  const f = fixture(); const input = join(f.source, 'notes.txt'); writeFileSync(input, Buffer.from([0xff, 0xfe]));
  assert.throws(() => convertGDocFile(input), /encoded data|UTF-8/i);
  writeFileSync(input, 'Plain notes');
  assert.throws(() => convertGDocFile(input, { targetVault: 'invented' as never }), /Unsupported vault/);
});
test('converter CLI creates a Markdown file and refuses to overwrite it', () => {
  const f = fixture(); const input = join(f.source, 'notes.html'); const output = join(f.root, 'result.md');
  writeFileSync(input, '<h1>CLI source</h1><pre>&lt;Component&gt;</pre>');
  const loaderIndex = process.execArgv.indexOf('--import');
  const loaderArgs = loaderIndex >= 0 ? ['--import', process.execArgv[loaderIndex + 1]] : [];
  const script = fileURLToPath(new URL('../tools/ingestion/gdoc-converter.ts', import.meta.url));
  const first = spawnSync(process.execPath, [...loaderArgs, script, input, '--out', output], { encoding: 'utf8', timeout: 10_000 });
  assert.equal(first.status, 0, first.stderr);
  const saved = readFileSync(output, 'utf8'); assert.match(saved, /# CLI source/); assert.ok(saved.includes('<Component>'));
  const second = spawnSync(process.execPath, [...loaderArgs, script, input, '--out', output], { encoding: 'utf8', timeout: 10_000 });
  assert.equal(second.status, 1); assert.equal(readFileSync(output, 'utf8'), saved);
  assert.equal(readFileSync(input, 'utf8'), '<h1>CLI source</h1><pre>&lt;Component&gt;</pre>');
});
test('rejects oversized inputs before reading their contents', () => {
  const f = fixture(); const input = join(f.source, 'large.txt'); writeFileSync(input, ''); truncateSync(input, MAX_DOCUMENT_BYTES + 1);
  assert.throws(() => readDocumentSnapshot(input), /16 MiB/);
});
test('rejects a raw staging junction without writing through it', () => {
  const f = fixture(); const outside = join(f.root, 'outside'); mkdirSync(outside); mkdirSync(f.target);
  symlinkSync(outside, join(f.target, 'raw'), process.platform === 'win32' ? 'junction' : 'dir');
  writeFileSync(join(f.source, 'notes.txt'), 'Keep this local');
  assert.throws(() => syncDriveFolder({ sourceDir: f.source, targetDir: f.target }), /Unsafe destination/);
  assert.equal(existsSync(join(outside, 'notes.txt')), false);
});
