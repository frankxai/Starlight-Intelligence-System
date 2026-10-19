import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseWorkGraphJsonl, projectWorkGraph } from '../../src/work-graph.ts';
import { nextAction } from './agent-next-action.mjs';

const projection = (overrides = {}) => ({ issues: [], workItems: [{ workId: 'work_example', admitted: true, blocked: false, completed: false, readyToComplete: false, missingProofs: ['artifact', 'change', 'checks', 'deployment', 'verification'], ...overrides }] });
test('uses existing admission and blocker controls', () => {
  assert.equal(nextAction(projection({ admitted: false }), 'work_example').action, 'await-admission');
  assert.equal(nextAction(projection({ blocked: true }), 'work_example').action, 'resolve-blocker');
  assert.equal(nextAction({ issues: [], workItems: [] }, 'missing').action, 'locate-work');
});
test('review saturation directs attention to the downstream queue', () => {
  assert.equal(nextAction(projection(), 'work_example', { reviewWaiting: 2, reviewCapacity: 1 }).action, 'clear-review-queue');
  assert.equal(nextAction(projection(), 'work_example').action, 'produce-artifact');
});
test('maps each missing proof to one concrete role and action', () => {
  const expected = ['produce-artifact', 'open-change', 'verify-change', 'verify-production-exposure', 'verify-user-outcome'];
  for (let i = 0; i < expected.length; i++) {
    const p = projection();
    p.workItems[0].missingProofs = p.workItems[0].missingProofs.slice(i);
    const r = nextAction(p, 'work_example');
    assert.equal(r.action, expected[i]);
    assert.equal(r.advisoryOnly, true);
  }
});
test('remaining release proof is not satisfied by a build', () => {
  const r = nextAction(projection({ missingProofs: ['deployment'] }), 'work_example');
  assert.equal(r.role, 'release-owner');
  assert.match(r.evidence, /READY build alone is insufficient/);
});
test('completion advice and outcome observation are distinct', () => {
  const p = projection({ missingProofs: [], readyToComplete: true });
  assert.equal(nextAction(p, 'work_example').action, 'record-completion');
  p.workItems[0].completed = true;
  assert.equal(nextAction(p, 'work_example').action, 'observe-outcome');
});
test('projection conflicts prevent delivery advice; malformed states fail', () => {
  const p = projection();
  p.issues.push({ code: 'event-id-conflict' });
  assert.equal(nextAction(p, 'work_example').action, 'repair-evidence');
  assert.throws(() => nextAction(projection({ missingProofs: ['unknown'] }), 'work_example'), /Invalid missing/);
  assert.throws(() => nextAction(projection({ completed: true }), 'work_example'), /Inconsistent completion/);
  assert.throws(() => nextAction(projection(), 'work_example', { reviewCapacity: 0 }), /capacity/);
});
test('does not mutate the supplied work state', () => {
  const p = projection();
  const before = JSON.stringify(p);
  nextAction(p, 'work_example');
  assert.equal(JSON.stringify(p), before);
});
test('accepts a real existing work-graph projection end to end', () => {
  const parsed = parseWorkGraphJsonl(readFileSync(new URL('../../examples/work-graph/product-delivery.jsonl', import.meta.url), 'utf8'));
  assert.equal(parsed.issues.length, 0);
  assert.equal(nextAction(projectWorkGraph(parsed.events), 'work_example').action, 'observe-outcome');
});
