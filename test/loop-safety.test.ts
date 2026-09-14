import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLoopEngine, runLoopEngine, type LoopStepInput } from '../src/loop-engine.js';
import { compileLoopGraph, evaluateLoopGraph, initHarness, type LoopGraph } from '../src/loop-graph.js';
import { parseWorkGraphJsonl, projectWorkGraph } from '../src/work-graph.js';

const graph: LoopGraph = {
  schema: 'starlight.loop-graph.v1', id: 'reference', shape: 'router', executorRole: 'maker', supervisorRole: 'checker',
  brakes: { maxTurns: 4, maxCostUnits: 5, emptyRoundsToStop: 1, allowedActions: ['publish'], requireWriteback: true },
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

test('v1 allowlists reject unlisted actions and malformed brakes fail closed', () => {
  assert.equal(run([{ ...inputs[0], proposedAction: 'tweet' }]).at(-1).haltReason, 'silence');
  const missing = structuredClone(graph);
  delete (missing.brakes as Partial<typeof missing.brakes>).allowedActions;
  assert.equal(compileLoopGraph(missing).ok, false);
  const denied = structuredClone(graph);
  denied.brakes.silenceTriggers = ['publish'];
  assert.equal(run([{ ...inputs[0], proposedAction: 'publish' }], denied).at(-1).haltReason, 'silence');
});

test('halt receipts project to blocked work and completion keeps checker evidence', () => {
  for (const steps of [[{ ...inputs[0], proposedAction: 'tweet' }], [{ ...inputs[0], writeback: '' }],
    [{ ...inputs[0], node: 'missing' }], [...inputs.slice(0, 2), { ...inputs[2], verdict: 'fail' as const }]]) {
    const trace = run(steps);
    const events = trace.filter((e) => !e.__state);
    const parsed = parseWorkGraphJsonl(events.map((e) => JSON.stringify(e)).join('\n'));
    assert.equal(parsed.issues.length, 0);
    assert.equal(projectWorkGraph(parsed.events).workItems[0].blocked, true);
  }
  assert.deepEqual(run().find((e) => e.kind === 'work.completed').evidenceRefs, ['fixture:verdict']);
});

test('reserved node names do not collide with admission and completion event identities', () => {
  const renamed = structuredClone(graph);
  for (const node of renamed.nodes) if (node.id === 'docs') node.id = 'admit';
  for (const edge of renamed.edges) {
    if (edge.to === 'docs') edge.to = 'admit';
    if (edge.from === 'docs') edge.from = 'admit';
  }
  const trace = run(inputs.map((step) => step.node === 'docs' ? { ...step, node: 'admit' } : step), renamed);
  const events = trace.filter((e) => !e.__state);
  assert.equal(new Set(events.map((e) => e.eventId)).size, events.length);
  assert.equal(trace.at(-1).completed, true);
});

test('malformed public ingress halts without exceptions', () => {
  assert.equal(compileLoopGraph(null as unknown as LoopGraph).ok, false);
  assert.equal(buildLoopEngine({ ...config(), workId: null as unknown as string }).ok, false);
  for (const step of [null, { ...inputs[0], actor: 1 }, { ...inputs[0], writeback: 42 }]) {
    assert.equal(run([step as unknown as LoopStepInput]).at(-1).halted, true);
  }
});

test('large chains compile without recursive stack overflow', () => {
  const size = 12000;
  const large: LoopGraph = {
    ...graph, shape: 'chain',
    nodes: Array.from({ length: size }, (_, i) => ({ id: `n${i}`, role: i === size - 1 ? 'checker' : 'maker',
      kind: 'code', costUnits: 0, outputContract: 'next' })),
    edges: Array.from({ length: size - 1 }, (_, i) => ({ from: `n${i}`, to: `n${i + 1}`, contract: 'next' })),
  };
  assert.equal(compileLoopGraph(large).ok, true);
});
