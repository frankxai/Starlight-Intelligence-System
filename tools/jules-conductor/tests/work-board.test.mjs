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

test('arming a board action queues one bounded task and clears other ready flags', () => {
  const action = board.actions.find((item) => item.id === 'arcanea-homepage-landmarks');
  const result = armAction([{ ...harvested, ready: true }, { id: 'keep', ready: true, repo: 'a/b', description: 'x', scopeFiles: ['a'] }], action);
  assert.equal(result.armed.id, 'arcanea-homepage-landmarks');
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

test('both Jules actions on the board are bounded', () => {
  for (const action of board.actions.filter((item) => item.runner === 'jules')) {
    assert.equal(isBounded({ description: action.prompt, scopeFiles: action.where, repo: action.repo }), true);
  }
});
