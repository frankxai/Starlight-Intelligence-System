import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import test from 'node:test';
import { FALLBACK_MODEL, REMOVED_MODEL_NAMES, REVIEWER_MODEL, SECOND_FAMILY_MODEL } from '../src/models.ts';

const ROOT = new URL('..', import.meta.url).pathname;
// Scan only hand-written source: these directories plus wrangler.jsonc. Walking the whole service
// would read generated output, lockfiles and .git objects, where a removed id can appear without
// meaning anyone still uses it.
const SCAN_DIRS = ['src', 'tests', 'app', 'scripts'];
const SCAN_FILES = ['wrangler.jsonc'];
const SKIP_DIRS = new Set(['node_modules', 'dist', '.wrangler', '.git']);
const SKIP_FILES = /(^|\/)(package-lock\.json|npm-shrinkwrap\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb?)$/;
// The definition file must name the ids it removes, and this test names them to plant one.
const SELF = new Set(['src/models.ts']);

function* files(dir) {
  let names;
  try { names = readdirSync(dir); } catch { return; }
  for (const name of names) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* files(p);
    else yield p;
  }
}

function* sourceFiles(root) {
  for (const d of SCAN_DIRS) yield* files(join(root, d));
  for (const f of SCAN_FILES) yield join(root, f);
}

function scan(root) {
  const hits = [];
  for (const f of sourceFiles(root)) {
    const rel = relative(root, f);
    if (SELF.has(rel) || SKIP_FILES.test(rel)) continue;
    let text;
    try { text = readFileSync(f, 'utf8').toLowerCase(); } catch { continue; }
    for (const id of REMOVED_MODEL_NAMES) if (text.includes(id)) hits.push(`${rel}: ${id}`);
  }
  return hits;
}

test('no Workers AI model removed on 2026-11-20 is named in this service source', () => {
  assert.deepEqual(scan(ROOT), []);
});

test('the scan still fails on a planted removed id, and ignores skipped paths', () => {
  const dir = mkdtempSync(join(tmpdir(), 'models-scan-'));
  try {
    const id = REMOVED_MODEL_NAMES[0];
    mkdirSync(join(dir, 'src'));
    mkdirSync(join(dir, '.git'));
    writeFileSync(join(dir, '.git', 'x'), id);
    writeFileSync(join(dir, 'package-lock.json'), id);
    assert.deepEqual(scan(dir), [], 'skipped paths must not hit');
    writeFileSync(join(dir, 'src', 'planted.ts'), `const m = '@cf/vendor/${id}';`);
    assert.deepEqual(scan(dir), [`${join('src', 'planted.ts')}: ${id}`]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the centralized ids are current, distinct and not on the removed list', () => {
  const ids = [REVIEWER_MODEL, FALLBACK_MODEL, SECOND_FAMILY_MODEL];
  assert.equal(new Set(ids).size, 3);
  for (const id of ids) assert.ok(!REMOVED_MODEL_NAMES.some((n) => id.endsWith(`/${n}`)), id);
});
