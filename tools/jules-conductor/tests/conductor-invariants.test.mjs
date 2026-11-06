import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const conductor = readFileSync(join(root, 'conductor.mjs'), 'utf8');
const reviewPath = join(root, 'ceo-pr-review.mjs');
const review = existsSync(reviewPath) ? readFileSync(reviewPath, 'utf8') : null;
// Executable code only: block comments, line comments (not URLs) and import lines are removed.
const code = conductor
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|[^:'"`])\/\/.*$/gm, '$1')
  .replace(/^\s*import\b.*$/gm, '');
const config = JSON.parse(readFileSync(join(root, 'config.json'), 'utf8'));

test('the conductor does not sweep or undraft', () => {
  assert.equal(conductor.includes('sweepPullRequests'), false);
  // The conductor never undrafts. The only allowed `pr ready` call is the redraft (`--undo`), and
  // every one is checked on its own: one redraft must not cover an undraft elsewhere in the file.
  // Comments are stripped first, so a commented-out call neither counts as present nor hides one.
  // Only arrays passed straight to runGh count, so an unused args array cannot stand in for the call.
  const readyCalls = [...code.matchAll(/\brunGh\(\s*\[\s*['"`]pr['"`]\s*,\s*['"`]ready['"`][^\]]*\]/g)].map((m) => m[0]);
  assert.ok(readyCalls.length > 0, 'the executable redraft call is still present');
  for (const call of readyCalls) assert.ok(/['"`]--undo['"`]/.test(call), `undraft call without --undo: ${call}`);
  // Any other spelling of an undraft fails: a 'ready' literal outside those calls, a shell
  // `pr ready` command without its own --undo, or the GraphQL ready-for-review mutation.
  const readyLiterals = code.match(/['"`]ready['"`]/g) ?? [];
  assert.equal(readyLiterals.length, readyCalls.length, "a 'ready' literal outside a checked pr-ready call");
  for (const command of code.split(/[;&|\n]/)) {
    if (/\bpr\s+ready\b/.test(command)) assert.ok(/--undo\b/.test(command), `shell-form pr ready without --undo: ${command.trim()}`);
  }
  assert.equal(/markPullRequestReadyForReview/i.test(code), false, 'GraphQL undraft');
  // The conductor never merges, by any route: the gh subcommand, the REST merge endpoint, the
  // GraphQL merge or auto-merge mutations, or gh's --auto flag.
  assert.equal(/['"`]merge['"`]/.test(code), false, "a 'merge' argument");
  assert.equal(/\bpr\s+merge\b/.test(code), false, 'shell-form pr merge');
  assert.equal(/pulls\/[^'"`\s]*\/merge\b/i.test(code), false, 'REST merge endpoint');
  // A merge endpoint assembled at runtime still needs a '/merge' piece and a PUT.
  assert.equal(/['"`][^'"`\n]*\/merge\b/i.test(code), false, "a '/merge' path piece");
  assert.equal(/['"`]PUT['"`]/i.test(code), false, 'a PUT request (the REST merge method)');
  assert.equal(/(mergePullRequest|enablePullRequestAutoMerge|mergeBranch)/i.test(code), false, 'GraphQL merge');
  assert.equal(/['"`]--auto['"`]/.test(code), false, 'auto-merge flag');
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
