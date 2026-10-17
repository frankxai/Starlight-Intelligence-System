import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { armAction, isBounded, takeReady } from '../work-board.mjs';

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

test('issue 163 is queued unsent on VERTICALS.md only', () => {
  const action = board.actions.find((item) => item.id === 'sis-verticals-163');
  assert.equal(action.runner, 'jules');
  assert.deepEqual(action.where, ['VERTICALS.md']);
  assert.equal(action.ready, false);
  assert.equal(action.repo, 'frankxai/Starlight-Intelligence-System');
  assert.match(action.prompt, /frankxai\/gencreator\.ai/);
  assert.match(action.prompt, /gencreator\.ai/);
  assert.match(action.how, /Do not arm/);
  assert.equal(isBounded({ description: action.prompt, scopeFiles: action.where, repo: action.repo }), true);
  const backlog = JSON.parse(readFileSync(join(root, 'state', 'backlog.json'), 'utf8'));
  const queued = (backlog.queue || []).find((item) => item.id === 'sis-verticals-163');
  assert.equal(queued, undefined);
});

test('every Jules action still on the board is bounded', () => {
  const jules = board.actions.filter((item) => item.runner === 'jules');
  assert.deepEqual(jules.map((item) => item.id), ['sis-verticals-163']);
  assert.equal(jules.some((item) => item.id === 'arcanea-homepage-landmarks'), false);
  assert.equal(jules.some((item) => item.id === 'arcanea-guardian-reports'), false);
  for (const action of jules) {
    assert.equal(isBounded({ description: action.prompt, scopeFiles: action.where, repo: action.repo }), true);
    assert.notEqual(action.ready, true);
  }
});
