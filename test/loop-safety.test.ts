import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLoopEngine, runLoopEngine, type LoopStepInput } from '../src/loop-engine.js';
import { compileLoopGraph, evaluateLoopGraph, initHarness, type LoopGraph } from '../src/loop-graph.js';

const graph: LoopGraph = {
  schema: 'starlight.loop-graph.v1', id: 'reference', shape: 'router', executorRole: 'maker', supervisorRole: 'checker',
  brakes: { maxTurns: 4, maxCostUnits: 5, emptyRoundsToStop: 1, silenceTriggers: ['publish'], requireWriteback: true },
  nodes: [
    { id: 'inspect', role: 'system', kind: 'code', costUnits: 0, outputContract: 'class' },
    { id: 'docs', role: 'maker', kind: 'agent', costUnits: 1, outputContract: 'artifact' },
    { id: 'code', role: 'maker', kind: 'agent', costUnits: 1, outputContract: 'artifact' },
    { id: 'verify', role: 'checker', kind: 'agent', costUnits: 1, outputContract: 'verdict' },
  ],
  edges: [
    { from: 'inspect', to: 'docs', contract: 'class', when: { field: 'class', equals: 'docs' } },
    { from: 'inspect', to: 'code', contract: 'class', when: { field: 'class', equals: 'code' } },
    { from: 'docs', to: 'verify', contract: 'artifact' },
    { from: 'code', to: 'verify', contract: 'artifact' },
  ],
};
const config = (g = graph) => ({ graph: g, workId: 'fixture', correlationId: 'fixture', projectId: 'example/repo', executorActorId: 'maker', verifierActorId: 'checker', now: () => '2026-09-05T10:00:00.000Z' });
const inputs: LoopStepInput[] = [
  { node: 'inspect', actor: 'system', facts: { class: 'docs' }, writeback: 'fixture:class' },
  { node: 'docs', actor: 'maker', writeback: 'fixture:artifact' },
  { node: 'verify', actor: 'checker', writeback: 'fixture:verdict', verdict: 'pass' },
];
const run = (steps = inputs, g = graph) => runLoopEngine(buildLoopEngine(config(g)), steps).map((line) => JSON.parse(line));

test('checker needs a receipt and explicit passing verdict', () => {
  for (const check of [{ writeback: undefined }, { writeback: '  ' }, { verdict: undefined }, { verdict: 'fail' as const }]) {
    const trace = run([...inputs.slice(0, 2), { ...inputs[2], ...check }]);
    assert.equal(trace.at(-1).halted, true);
    assert.equal(trace.some((e) => e.kind === 'work.completed'), false);
  }
  assert.equal(run().at(-1).completed, true);
  assert.equal(run()[0].source.system, 'other');
});

test('router freezes its decision, includes tail, and fails ambiguity or missing match', () => {
  assert.equal(run([inputs[0], { ...inputs[1], facts: { class: 'code' } }, inputs[2]]).at(-1).completed, true);
  assert.equal(run([{ ...inputs[0], facts: {} }]).at(-1).haltReason, 'no-plan');
  const ambiguous = structuredClone(graph);
  ambiguous.edges[1].when = { field: 'class', equals: 'docs' };
  assert.equal(run([inputs[0]], ambiguous).at(-1).haltReason, 'no-plan');
  const fallback = structuredClone(graph);
  fallback.edges.push({ from: 'inspect', to: 'docs', contract: 'class' });
  assert.equal(run([{ ...inputs[0], facts: { class: 'unknown' } }, ...inputs.slice(1)], fallback).at(-1).completed, true);
  const evaluation = evaluateLoopGraph(graph, { facts: { class: 'docs' }, actorId: 'maker', turnsUsed: 0, costUsed: 0, executed: [] });
  assert.deepEqual(evaluation.route, ['inspect', 'docs', 'verify']);
});

test('invalid graphs do not produce an executable route; finite integer brakes', () => {
  const malformed = { ...graph, brakes: { ...graph.brakes, maxCostUnits: Infinity, maxTurns: 1.5 } };
  assert.equal(compileLoopGraph(malformed).ok, false);
  assert.deepEqual(evaluateLoopGraph(malformed, { facts: { class: 'docs' }, actorId: 'maker', turnsUsed: 0, costUsed: 0 }).route, []);
  assert.equal(initHarness([]).readyToComplete, false);
});

test('a checker cannot contribute as a system node and then self-verify', () => {
  assert.equal(run([{ ...inputs[0], actor: 'checker' }]).at(-1).halted, true);
  assert.equal(buildLoopEngine({ ...config(), executorActorId: ' ' }).ok, false);
});

test('a stale compiled handle cannot bypass changed graph validation', () => {
  const mutable = structuredClone(graph);
  const engine = buildLoopEngine(config(mutable));
  mutable.brakes.maxCostUnits = Infinity;
  assert.equal(JSON.parse(runLoopEngine(engine, inputs).at(-1)!).halted, true);
});
