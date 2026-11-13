import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import test from 'node:test';
import { FALLBACK_MODEL, REMOVED_MODEL_NAMES, REVIEWER_MODEL, SECOND_FAMILY_MODEL } from '../src/models.ts';

const ROOT = new URL('..', import.meta.url).pathname;
const SKIP_DIRS = new Set(['node_modules', '.wrangler', 'dist']);
const SELF = new Set(['src/models.ts', 'tests/models.test.mjs']);

function* files(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* files(p);
    else yield p;
  }
}

test('no Workers AI model removed on 2026-11-20 is named anywhere in this service', () => {
  const hits = [];
  for (const f of files(ROOT)) {
    const rel = relative(ROOT, f);
    if (SELF.has(rel) || /\.(png|jpe?g|ico|woff2?|sqlite)$/.test(rel)) continue;
    const text = readFileSync(f, 'utf8').toLowerCase();
    for (const id of REMOVED_MODEL_NAMES) if (text.includes(id)) hits.push(`${rel}: ${id}`);
  }
  assert.deepEqual(hits, []);
});

test('the centralized ids are current, distinct and not on the removed list', () => {
  const ids = [REVIEWER_MODEL, FALLBACK_MODEL, SECOND_FAMILY_MODEL];
  assert.equal(new Set(ids).size, 3);
  for (const id of ids) assert.ok(!REMOVED_MODEL_NAMES.some((n) => id.endsWith(`/${n}`)), id);
});
