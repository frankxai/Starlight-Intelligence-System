import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const conductor = readFileSync(join(root, 'conductor.mjs'), 'utf8');
const review = readFileSync(join(root, 'ceo-pr-review.mjs'), 'utf8');
const config = JSON.parse(readFileSync(join(root, 'config.json'), 'utf8'));

test('the conductor does not sweep or undraft', () => {
  assert.equal(conductor.includes('sweepPullRequests'), false);
  assert.equal(conductor.includes("pr', 'ready'"), false);
  assert.equal(conductor.includes('slice(0, 20)'), false);
  assert.equal(conductor.includes('adoptRemoteSessions === true'), true);
  assert.equal(conductor.includes('autoDispatch === true'), true);
  assert.equal(conductor.includes('takeReady('), true);
});

test('the pull-request report cannot merge, undraft, retitle, or update a branch', () => {
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
