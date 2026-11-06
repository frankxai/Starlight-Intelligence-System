import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SHIFT_CARDS,
  JULES_MAX_IN_FLIGHT,
  evaluateShiftCard,
  buildShiftPlan,
} from '../scripts/queen-jules-shift-dispatcher.mjs';

test('SHIFT_CARDS contains 20 evidence-gated cards across 4 waves and 5 pillars', () => {
  assert.equal(SHIFT_CARDS.length, 20);
  const waves = new Set(SHIFT_CARDS.map((c) => c.wave));
  assert.deepEqual([...waves].sort(), [1, 2, 3, 4]);

  const pillars = new Set(SHIFT_CARDS.map((c) => c.pillar));
  assert.deepEqual(
    [...pillars].sort(),
    ['FOUNDATIONS', 'PIPELINES', 'PRODUCTS', 'STORY', 'TECH']
  );

  for (const card of SHIFT_CARDS) {
    assert.ok(card.id);
    assert.ok(card.doneCondition);
    assert.ok(card.command);
    assert.notEqual(
      card.worker,
      card.checker,
      `Maker!=Checker invariant violated on ${card.id}`
    );
  }
});

test('evaluateShiftCard admits Google Jules and Codex Cloud even when freeRamMB < 4096 (RAM bypass)', () => {
  const julesCard = SHIFT_CARDS.find((c) => c.worker === 'jules');
  const codexCard = SHIFT_CARDS.find((c) => c.worker === 'codex-cloud');

  const julesEval = evaluateShiftCard(julesCard, { freeRamMB: 1911, julesInFlight: 1 });
  assert.equal(julesEval.admitted, true);
  assert.equal(julesEval.effectiveWorker, 'jules');
  assert.equal(julesEval.routingMode, 'cloud-ram-bypass');

  const codexEval = evaluateShiftCard(codexCard, { freeRamMB: 1911, julesInFlight: 1 });
  assert.equal(codexEval.admitted, true);
  assert.equal(codexEval.effectiveWorker, 'codex-cloud');
  assert.equal(codexEval.routingMode, 'cloud-ram-bypass');
});

test('evaluateShiftCard enforces JULES_MAX_IN_FLIGHT concurrency cap', () => {
  const julesCard = SHIFT_CARDS.find((c) => c.worker === 'jules');
  const capped = evaluateShiftCard(julesCard, {
    freeRamMB: 8192,
    julesInFlight: JULES_MAX_IN_FLIGHT,
  });
  assert.equal(capped.admitted, false);
  assert.equal(capped.routingMode, 'jules-concurrency-cap');
});

test('evaluateShiftCard blocks forbiddenFreeData (money/secret/vault/private-canon) from routing to jules', () => {
  const unsafeCard = {
    id: 'TEST-SECRET',
    wave: 1,
    pillar: 'PRODUCTS',
    title: 'Stripe Live Secret Rotation',
    worker: 'jules',
    checker: 'codex-review',
    dataClass: 'money',
    ramRequiredMB: 0,
    doneCondition: 'never on jules',
    command: 'none',
  };
  const res = evaluateShiftCard(unsafeCard, { freeRamMB: 1911, julesInFlight: 0 });
  assert.equal(res.admitted, false);
  assert.equal(res.effectiveWorker, 'claude-code-lead');
  assert.equal(res.routingMode, 'refused-free-lane-data-guard');
});

test('buildShiftPlan admits all 20 cards under low local RAM (1911 MB) via hybrid Cloud/Jules bypass', () => {
  const plan = buildShiftPlan({ freeRamMB: 1911 });
  assert.equal(plan.summary.totalShiftCards, 20);
  assert.equal(plan.summary.admittedCards, 20);
  assert.ok(plan.summary.byWorker.jules >= 6);
  assert.ok(plan.summary.byWorker['codex-cloud'] >= 4);
  assert.ok(plan.summary.cloudRamBypassCards >= 10);
});
