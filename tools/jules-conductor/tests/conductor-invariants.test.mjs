import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const conductor = readFileSync(join(root, 'conductor.mjs'), 'utf8');
const reviewPath = join(root, 'ceo-pr-review.mjs');
const review = existsSync(reviewPath) ? readFileSync(reviewPath, 'utf8') : null;
const config = JSON.parse(readFileSync(join(root, 'config.json'), 'utf8'));

test('the conductor does not sweep or undraft', () => {
  assert.equal(conductor.includes('sweepPullRequests'), false);
  // The conductor never undrafts. The only allowed `pr ready` call is the redraft (`--undo`), and
  // every one is checked on its own: one redraft must not cover an undraft elsewhere in the file.
  const readyCalls = [...conductor.matchAll(/\[\s*['"`]pr['"`]\s*,\s*['"`]ready['"`][^\]]*\]/g)].map((m) => m[0]);
  assert.ok(readyCalls.length > 0, 'the redraft call is still present');
  for (const call of readyCalls) assert.ok(/['"`]--undo['"`]/.test(call), `undraft call without --undo: ${call}`);
  // Any other spelling of an undraft (a 'ready' literal outside those calls, or a shell `pr ready`) fails.
  const readyLiterals = conductor.match(/['"`]ready['"`]/g) ?? [];
  assert.equal(readyLiterals.length, readyCalls.length, "a 'ready' literal outside a checked pr-ready call");
  assert.equal(/pr\s+ready(?!\s+[^\n]*--undo)/.test(conductor), false, 'shell-form pr ready without --undo');
  assert.equal(/['"`]merge['"`]/.test(conductor) || /pr\s+merge/.test(conductor), false, 'the conductor never merges');
  assert.equal(conductor.includes('slice(0, 20)'), false);
  assert.equal(conductor.includes('adoptRemoteSessions === true'), true);
  assert.equal(conductor.includes('autoDispatch === true'), true);
  assert.equal(conductor.includes('takeReady('), true);
});

test('the pull-request report cannot merge, undraft, retitle, or update a branch', () => {
  if (!review) {
    assert.equal(existsSync(reviewPath), false, 'ceo-pr-review.mjs removed in favour of separate-reviewer gate');
    return;
  }
  assert.equal(review.includes("pr', 'merge'"), false);
  assert.equal(review.includes("pr', 'ready'"), false);
  assert.equal(review.includes("pr', 'edit'"), false);
  assert.equal(review.includes('update-branch'), false);
  assert.equal(review.includes("cmd === 'sweep' || !cmd"), false);
});

test('config fails closed', () => {
  assert.equal(config.automation.autoMerge, false);
  assert.equal(config.automation.autoDispatch, false);
  assert.equal(config.automation.estateSweep, false);
  assert.equal(config.automation.deleteBranchAfterMerge, false);
  assert.equal(config.runtime.adoptRemoteSessions, false);
  assert.ok(config.automation.protectedRepos.includes('frankxai/frankx.ai-vercel-website'));
});
