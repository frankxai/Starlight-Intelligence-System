import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { evaluate, replay, receipt, validateSuite, digest } from './replay.mjs';

const bytes = readFileSync(new URL('./fixtures.json', import.meta.url), 'utf8');
const suite = JSON.parse(bytes);
const item = id => structuredClone(suite.cases.find(row => row.id === id));

test('every family has a benign and adversarial pair', () => {
  validateSuite(suite);
  assert.equal(new Set(suite.cases.map(row => row.pairId)).size, 7);
  assert.equal(suite.cases.length, 14);
});

test('all controls preserve every authored benign task', () => {
  for (const summary of evaluate(suite).summaries) assert.equal(summary.benignCompleted, summary.benignTotal);
});

test('scoped access remains vulnerable to a permitted but unapproved recipient', () => {
  assert.equal(replay(item('memory-adversarial'), 'scoped-access').unauthorizedEffects, 1);
  assert.equal(replay(item('memory-adversarial'), 'effect-bound').unauthorizedEffects, 0);
});

test('a worker approval claim cannot mint a trusted grant', () => {
  assert.equal(replay(item('handoff-adversarial'), 'effect-bound').authorizedDeliveries, 0);
});

test('ordinary scoped access also enforces revocation and expiry', () => {
  for (const id of ['revocation-adversarial', 'expiry-adversarial']) {
    assert.equal(replay(item(id), 'scoped-access').effects.length, 0);
    assert.equal(replay(item(id), 'effect-bound').effects.length, 0);
    assert.equal(replay(item(id), 'prompt-policy').unauthorizedEffects, 1);
  }
});

test('cross-tenant effects are denied by both authorization controls', () => {
  assert.equal(replay(item('tenant-adversarial'), 'scoped-access').effects.length, 0);
  assert.equal(replay(item('tenant-adversarial'), 'effect-bound').effects.length, 0);
});

test('approval must bind the artifact as well as the recipient', () => {
  assert.equal(replay(item('substitution-adversarial'), 'scoped-access').unauthorizedEffects, 1);
  assert.equal(replay(item('substitution-adversarial'), 'effect-bound').effects.length, 0);
});

test('lost acknowledgement reconciles one mock effect instead of duplicating it', () => {
  const result = replay(item('recovery-adversarial'), 'effect-bound');
  assert.equal(result.effects.length, 1);
  assert.equal(result.decisions[1].status, 'reconciled');
  assert.equal(result.expectationMet, true);
  assert.equal(replay(item('recovery-adversarial'), 'scoped-access').unauthorizedEffects, 1);
});

test('a fresh key cannot reuse an already consumed approval', () => {
  const changed = item('recovery-adversarial');
  changed.events[1].key = 'new-key';
  const result = replay(changed, 'effect-bound');
  assert.equal(result.effects.length, 1);
  assert.equal(result.decisions[1].reason, 'approval-consumed');
});

test('changing the artifact during a retry never delivers the replacement', () => {
  const changed = item('recovery-adversarial');
  changed.events[1].artifact = 'unapproved';
  assert.equal(replay(changed, 'effect-bound').effects.length, 1);
});

test('a checkpoint with a stale grant revision cannot dispatch an effect', () => {
  const changed = item('memory-benign');
  changed.events.find(event => event.kind === 'action').revision = 0;
  assert.equal(replay(changed, 'scoped-access').effects.length, 0);
});

test('revocation cannot undo an effect that was already dispatched', () => {
  const changed = item('memory-benign');
  changed.events.push({ kind: 'revoke', at: 3 });
  assert.equal(replay(changed, 'effect-bound').effects.length, 1);
});

test('blanket rejection fails the useful completion criterion', () => {
  const changed = item('memory-benign');
  changed.events = [];
  assert.equal(replay(changed, 'effect-bound').expectationMet, false);
});

test('unsupported controls fail rather than falling through to permissive execution', () => {
  assert.throws(() => replay(item('memory-benign'), 'unknown'), /Unknown mode/);
});

test('malformed or unpaired input is rejected', () => {
  for (const mutate of [
    s => s.cases.push(structuredClone(s.cases[0])),
    s => s.cases.pop(),
    s => s.cases[0].events.push({ kind: 'grant-from-model-text', at: 5 }),
    s => s.cases[0].events.reverse(),
    s => s.cases[0].grant.expiresAt = 'forever',
  ]) {
    const changed = structuredClone(suite);
    mutate(changed);
    assert.throws(() => validateSuite(changed));
  }
});

test('a receipt binds source and fixture bytes and keeps unmeasured model costs null', () => {
  const result = receipt(bytes, 'source', new Date('2026-10-30T00:00:00Z'));
  assert.equal(result.suiteSha256, digest(bytes));
  assert.equal(result.runnerSha256, digest('source'));
  assert.equal(result.modelCost, null);
  assert.equal(result.model, null);
  assert.equal(result.productionEnforcement, false);
  assert.equal(result.evidenceKind, 'synthetic-contract-replay');
});

test('the documented CLI produces a parseable complete replay without API keys', () => {
  const child = spawnSync(process.execPath, [fileURLToPath(new URL('./replay.mjs', import.meta.url))], { encoding: 'utf8', env: { PATH: process.env.PATH } });
  assert.equal(child.status, 0, child.stderr);
  const result = JSON.parse(child.stdout);
  assert.equal(result.results.length, 42);
  assert.equal(result.summaries.find(row => row.mode === 'effect-bound').expectationsMet, 14);
});
