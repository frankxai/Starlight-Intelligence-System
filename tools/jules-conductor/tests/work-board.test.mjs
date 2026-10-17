import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { armAction, acceptedHunkOpen, classifyObservation, isBounded, mentionPaths, takeReady } from '../work-board.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const board = JSON.parse(readFileSync(join(root, 'next-actions.json'), 'utf8'));

const harvested = {
  id: 'task-roadmap',
  repo: 'frankxai/gencreator.ai',
  description: 'Issue #119 roadmap '.repeat(20),
  ready: true,
};

test('a harvested roadmap is not ready to send', () => {
  assert.equal(isBounded(harvested), false);
  assert.equal(takeReady([harvested, { id: 'x', ready: false }]).task, null);
});

test('arming a bounded Jules action queues one task and clears other ready flags', () => {
  const action = {
    id: 'bounded-fixture',
    runner: 'jules',
    repo: 'frankxai/arcanea-ai-app',
    title: 'fixture',
    prompt: 'Touch only the named file. Open one draft pull request. Do not merge.',
    where: ['apps/web/app/page.tsx'],
    lane: 'quality',
    land: 'clerk',
  };
  const result = armAction([{ ...harvested, ready: true }, { id: 'keep', ready: true, repo: 'a/b', description: 'x', scopeFiles: ['a'] }], action);
  assert.equal(result.armed.id, 'bounded-fixture');
  assert.equal(result.queue[0].ready, true);
  assert.equal(result.queue.filter((item) => item.ready).length, 1);
  assert.equal(takeReady(result.queue).task.repo, 'frankxai/arcanea-ai-app');
});

test('a finished heal is not armed for Jules', () => {
  const heal = board.actions.find((item) => item.id === 'arcanea-three-heals');
  assert.equal(heal.runner, 'you');
  assert.equal(armAction([], heal).armed, null);
});

test('a you-action is not armed for Jules', () => {
  const yours = board.actions.find((item) => item.id === 'free-ram-then-one-task');
  const result = armAction([], yours);
  assert.equal(result.armed, null);
});

test('a merged landmark and a rejected guardian are not armed', () => {
  for (const id of ['arcanea-homepage-landmarks', 'arcanea-guardian-reports']) {
    const action = board.actions.find((item) => item.id === id);
    assert.equal(action.runner, 'you');
    assert.match(action.how, /Do not arm/);
    assert.equal(armAction([], action).armed, null);
  }
});

test('the old GenCreator lines are not open without a pull request', () => {
  const stale = 'Primary repo: `frankxai/gencreator` *(to be created)*. Public surface: `gencreator.community` *(to be registered)*.';
  assert.equal(acceptedHunkOpen(stale, null), false);
  assert.equal(acceptedHunkOpen(stale, ''), false);
  assert.equal(acceptedHunkOpen(stale, 'https://github.com/frankxai/Starlight-Intelligence-System/pull/1'), true);
  assert.equal(acceptedHunkOpen('Primary repo: `frankxai/gencreator.ai`. Public surface: `gencreator.ai`.', null), true);
  assert.equal(classifyObservation({ verdict: 'accept', prUrl: null, merged: false }), 'accepted-unlanded');
  assert.equal(classifyObservation({ verdict: 'reject', prUrl: null, merged: false }), 'rejected');
  assert.equal(classifyObservation({ verdict: 'accept', prUrl: 'https://github.com/frankxai/Starlight-Intelligence-System/pull/1', merged: true }), 'landed');
});

test('mentionPaths keeps a root name and a slash path', () => {
  assert.deepEqual(
    mentionPaths('Update VERTICALS.md and metrics/current.json. Skip ../secret.md.'),
    ['VERTICALS.md', 'metrics/current.json'],
  );
});

test('an accepted verticals hunk is open only when the file or a pull request has it', () => {
  const action = board.actions.find((item) => item.id === 'sis-verticals-163');
  const fileText = readFileSync(join(root, '..', '..', 'VERTICALS.md'), 'utf8');
  assert.equal(action.runner, 'you');
  assert.equal(action.outcome, 'accepted-unlanded');
  assert.deepEqual(action.where, ['VERTICALS.md']);
  assert.equal(armAction([], action).armed, null);
  assert.equal(classifyObservation({ verdict: 'accept', prUrl: action.pr || null, merged: false }), 'accepted-unlanded');
  assert.equal(acceptedHunkOpen(fileText, action.pr || null), true);
});

test('every Jules action still on the board is bounded', () => {
  const jules = board.actions.filter((item) => item.runner === 'jules');
  assert.deepEqual(jules.map((item) => item.id), []);
  assert.equal(jules.some((item) => item.id === 'arcanea-homepage-landmarks'), false);
  assert.equal(jules.some((item) => item.id === 'arcanea-guardian-reports'), false);
  for (const action of jules) {
    assert.equal(isBounded({ description: action.prompt, scopeFiles: action.where, repo: action.repo }), true);
    assert.notEqual(action.ready, true);
  }
});
