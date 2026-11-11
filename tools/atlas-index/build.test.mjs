import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseFrontmatter, extractLinks, firstParagraph, isBlocked, build } from './build.mjs';

function fixtureVault() {
  const v = mkdtempSync(join(tmpdir(), 'atlas-'));
  for (const d of ['patterns', 'people', 'private', 'oracle-work', 'A Home']) mkdirSync(join(v, d));
  writeFileSync(join(v, 'patterns', 'Alpha.md'), '---\ntype: pattern\ntags: [a, b]\nupdated: 2026-10-26\n---\n# Alpha\n\nAlpha links to [[Beta]] and [[Missing|alias]].\n');
  writeFileSync(join(v, 'patterns', 'Beta.md'), '---\ntype: pattern\n---\nBeta O\'Neil body.\n');
  writeFileSync(join(v, 'patterns', 'Lonely.md'), 'No links here.\n');
  writeFileSync(join(v, 'people', 'Secret.md'), '---\nprivacy_class: secret\n---\nhidden\n');
  writeFileSync(join(v, 'private', 'Raw.md'), 'raw capture\n');
  writeFileSync(join(v, 'oracle-work', 'Client.md'), 'confidential\n');
  writeFileSync(join(v, 'A Home', 'Dash.md'), 'dashboard\n');
  return v;
}

test('frontmatter parses scalars and inline lists, skips nested blocks', () => {
  const { meta, body } = parseFrontmatter('---\nstatus: growing\ntags: [x, y]\nsip_attestation:\n  verified_by: z\n---\nhi');
  assert.equal(meta.status, 'growing');
  assert.deepEqual(meta.tags, ['x', 'y']);
  assert.equal(meta.verified_by, undefined);
  assert.equal(body, 'hi');
});

test('wikilinks drop alias and anchor, dedupe', () => {
  assert.deepEqual(extractLinks('[[A|x]] [[A#h]] [[B]]'), ['A', 'B']);
});

test('l0 skips headings and is capped', () => {
  assert.equal(firstParagraph('# T\n\nFirst   line\nwraps.\n\nSecond'), 'First line wraps.');
  assert.equal(firstParagraph('x'.repeat(500)).length, 240);
});

test('secret and private privacy classes are blocked', () => {
  assert.equal(isBlocked({ privacy_class: 'Secret' }), true);
  assert.equal(isBlocked({ privacy_class: 'local_core' }), false);
});

test('build is default-deny, resolves links, counts orphans, escapes SQL', () => {
  const v = fixtureVault();
  const out = join(v, '..', 'out-' + Date.now());
  const r = build(v, out);
  assert.deepEqual(r, { notes: 3, blocked: 1, edges: 1, unresolved: 1, orphans: 1 });
  const json = JSON.parse(readFileSync(join(out, 'atlas.json'), 'utf8'));
  const paths = json.notes.map((n) => n.path).sort();
  assert.deepEqual(paths, ['patterns/Alpha.md', 'patterns/Beta.md', 'patterns/Lonely.md']);
  assert.deepEqual(json.orphans, ['patterns/Lonely.md']);
  const sql = readFileSync(join(out, 'atlas.sql'), 'utf8');
  assert.match(sql, /O''Neil/);
  assert.match(sql, /CREATE VIRTUAL TABLE notes_fts USING fts5/);
  assert.doesNotMatch(sql, /confidential|raw capture|dashboard|hidden/);
});
