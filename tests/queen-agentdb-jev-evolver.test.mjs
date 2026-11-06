import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HARNESS_FLEET_PROFILES,
  CEO_GROWTH_CHALLENGES,
  inspectAgentDbVaults,
  computeOvernightAllocation,
  buildQueenCeoSynthesis,
} from '../scripts/queen-agentdb-jev-evolver.mjs';

test('HARNESS_FLEET_PROFILES covers all 5 core harnesses with JEV scores and RAM metrics', () => {
  assert.equal(HARNESS_FLEET_PROFILES.length, 5);
  const ids = HARNESS_FLEET_PROFILES.map((h) => h.id);
  assert.deepEqual(ids, [
    'google-jules',
    'codex-cloud',
    'grok-cli',
    'claude-code',
    'antigravity-god-mode',
  ]);
  for (const h of HARNESS_FLEET_PROFILES) {
    assert.ok(h.jevScore >= 90);
  }
});

test('computeOvernightAllocation enforces 1024 MB (1 GB) floor and scales local workers while keeping 4 Jules + 4 Codex Cloud VMs active', () => {
  const highRam = computeOvernightAllocation({
    freeRamMB: 3200,
    totalRamMB: 32768,
    targetFloorMB: 1024,
  });
  assert.equal(highRam.allocatableLocalMB, 2176);
  assert.equal(highRam.needsRamReclaim, false);
  assert.equal(highRam.recommendedConcurrency.julesCloudVMs, 4);
  assert.equal(highRam.recommendedConcurrency.codexCloudSandboxes, 4);
  assert.ok(highRam.recommendedConcurrency.localGrokFastCheckers >= 2);
  assert.ok(highRam.recommendedConcurrency.localClaudeOrCodexMakers >= 2);

  const tightRam = computeOvernightAllocation({
    freeRamMB: 1100,
    totalRamMB: 32768,
    targetFloorMB: 1024,
  });
  assert.equal(tightRam.allocatableLocalMB, 76);
  assert.equal(tightRam.needsRamReclaim, true);
  assert.equal(tightRam.recommendedConcurrency.julesCloudVMs, 4);
  assert.equal(tightRam.recommendedConcurrency.codexCloudSandboxes, 4);
  assert.equal(tightRam.action, 'RECLAIM_IDLE_TABS_AND_PROCESSES_THEN_BURST_CLOUD');
});

test('buildQueenCeoSynthesis returns SIP-attested synthesis with 6 AgentDB vaults and 4 brand challenges', () => {
  const report = buildQueenCeoSynthesis({ freeRamMB: 2800 });
  assert.equal(report.schema, 'starlight.queen-ceo-jev.v1');
  assert.equal(report.attestation, 'Built on SIP');
  assert.equal(report.memory.totalVaults, 6);
  assert.equal(report.challenges.length, 4);
  assert.equal(CEO_GROWTH_CHALLENGES.length, 4);
});
