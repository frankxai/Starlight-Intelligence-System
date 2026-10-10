import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { project, ownedSpan, ROOT, SOURCE, readmeBody, soulBody } from '../scripts/agents-md-project.mjs';

const body = readFileSync(join(ROOT, SOURCE), 'utf8');
const ref = 'a'.repeat(40);
test('generated source and local Band B/C survive an update exactly', () => {
  const local = '\uFEFF# Local\r\n\r\n<!-- STARLIGHT:BAND-B:BEGIN -->\r\nowner: local\r\n<!-- STARLIGHT:BAND-B:END -->\r\n  trailing spaces  \r\n\r\n';
  const first = project(local, body).next;
  assert.equal(first.slice(0, 1), '\uFEFF');
  assert.ok(first.endsWith(local.slice(1)));
  const span = ownedSpan(first, 'BAND-A');
  const updated = project(first, body + '\nNew rule.').next;
  const updatedSpan = ownedSpan(updated, 'BAND-A');
  assert.equal(first.slice(0, span.start), updated.slice(0, updatedSpan.start));
  assert.equal(first.slice(span.end), updated.slice(updatedSpan.end));
  assert.equal(project(updated, body + '\nNew rule.').changed, false);
});
test('duplicate, reversed and malformed fences fail before mutation', () => {
  const valid = project('# local\n', body).next;
  for (const text of [valid + valid, '<!-- STARLIGHT:BAND-A:END -->', '<!-- STARLIGHT:BAND-A:BEGIN v2 sha=invalid -->', '<!-- STARLIGHT:BAND-A:END -->\n<!-- STARLIGHT:BAND-A:BEGIN v2 sha=12345678 -->']) {
    assert.throws(() => project(text, body), /duplicate, malformed or unbalanced/);
    const file = join(mkdtempSync(join(tmpdir(), 'starlight-fence-')), 'AGENTS.md');
    writeFileSync(file, text);
    const run = spawnSync(process.execPath, [join(ROOT, 'scripts/agents-md-project.mjs'), '--file', file, '--write']);
    assert.equal(run.status, 2);
    assert.equal(readFileSync(file, 'utf8'), text);
  }
});
test('check mode never writes and reports stale, missing and matching projections', () => {
  const file = join(mkdtempSync(join(tmpdir(), 'starlight-check-')), 'AGENTS.md');
  const cli = (...extra) => spawnSync(process.execPath, [join(ROOT, 'scripts/agents-md-project.mjs'), '--file', file, ...extra], { encoding: 'utf8' });
  writeFileSync(file, '# Local\r\n');
  assert.equal(cli().status, 1);
  assert.equal(readFileSync(file, 'utf8'), '# Local\r\n');
  assert.equal(cli('--write').status, 0);
  assert.equal(cli().status, 0);
  const current = readFileSync(file, 'utf8');
  writeFileSync(file, current.replace('### The five guardrails', '### Hand-edited guardrails'));
  assert.equal(cli().status, 1);
  assert.equal(readFileSync(file, 'utf8'), current.replace('### The five guardrails', '### Hand-edited guardrails'));
});
test('README and SOUL guidance pin real-shaped revisions and preserve identity', () => {
  for (const make of [readmeBody, soulBody]) {
    assert.throws(() => make('main'));
    const old = '# Existing identity\n\nlocal invariant\n';
    const projected = project(old, make(ref), { name: 'OPERATING', sourceRef: ref, prepend: false });
    assert.ok(projected.next.startsWith(old));
    assert.equal(project(projected.next, make(ref), { name: 'OPERATING', sourceRef: ref, prepend: false }).changed, false);
  }
});
test('empty and nested sources are rejected; arbitrary host labels cannot enter markers', () => {
  assert.throws(() => project('', ''));
  assert.throws(() => project('', '<!-- STARLIGHT:BAND-A:BEGIN -->'));
  assert.throws(() => project('', '<!-- STARLIGHT : BAND-B:BEGIN -->'));
  assert.throws(() => project('', body, { sourceRef: 'system' }));
  assert.throws(() => ownedSpan('', '../escape'));
});
test('malformed attributes, nested foreign bands and ambiguous prefixes fail closed', () => {
  const end = '<!-- STARLIGHT:BAND-A:END -->';
  for (const start of [
    '<!-- STARLIGHT:BAND-A:BEGIN v2 sha=123456789abcgarbage -->',
    '<!-- STARLIGHT:BAND-A:BEGIN v2 sha=' + 'a'.repeat(65) + ' -->',
    '<!-- STARLIGHT:BAND-A:BEGIN v2 sha=123456789abc\n<!-- other -->',
    '<!-- STARLIGHT : BAND-A:BEGIN v2 sha=123456789abc -->',
  ]) assert.throws(() => project(start + '\nLOCAL\n' + end, body));
  const nested = '<!-- STARLIGHT:BAND-A:BEGIN v2 sha=123456789abc -->\n<!-- STARLIGHT:BAND-B:BEGIN -->\nLOCAL\n<!-- STARLIGHT:BAND-B:END -->\n' + end;
  assert.throws(() => project(nested, body), /nested managed/);
});
