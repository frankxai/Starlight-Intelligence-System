import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildLoopEngine,
  runLoopEngine,
  type LoopEngineConfig,
  type LoopEngineState,
} from "../src/loop-engine.js";
import type { LoopGraph } from "../src/loop-graph.js";
import { parseWorkGraphJsonl, projectWorkGraph } from "../src/work-graph.js";

const diamond: LoopGraph = {
  schema: "starlight.loop-graph.v1",
  id: "diamond-review",
  shape: "diamond",
  executorRole: "maker",
  supervisorRole: "checker",
  brakes: {
    maxTurns: 12,
    maxCostUnits: 50,
    emptyRoundsToStop: 3,
    silenceTriggers: ["external-send", "spend", "destroy"],
    requireWriteback: true,
  },
  nodes: [
    { id: "scan-a", role: "maker", kind: "agent", costUnits: 2, outputContract: "findings-a" },
    { id: "scan-b", role: "maker", kind: "agent", costUnits: 2, outputContract: "findings-b" },
    { id: "reduce", role: "system", kind: "code", costUnits: 0, outputContract: "merged-findings" },
    { id: "synthesize", role: "maker", kind: "agent", costUnits: 4, outputContract: "report" },
    { id: "verify", role: "checker", kind: "agent", costUnits: 3, outputContract: "verdict" },
  ],
  edges: [
    { from: "scan-a", to: "reduce", contract: "findings-a" },
    { from: "scan-b", to: "reduce", contract: "findings-b" },
    { from: "reduce", to: "synthesize", contract: "merged-findings" },
    { from: "synthesize", to: "verify", contract: "report" },
  ],
};

function config(): LoopEngineConfig {
  return {
    graph: diamond,
    workId: "work_diamond",
    correlationId: "corr_diamond",
    projectId: "frankxai/Starlight-Intelligence-System",
    executorActorId: "agent:hermes",
    verifierActorId: "agent:checker",
    now: () => "2026-08-24T12:00:00.000Z",
  };
}

describe("LoopEngine", () => {
  it("runs a diamond to completion and ends with a verified work.completed receipt", () => {
    const engine = buildLoopEngine(config());
    const trace = runLoopEngine(engine, [
      { node: "scan-a", writeback: "test://scan-a", actor: "agent:hermes" },
      { node: "scan-b", writeback: "test://scan-b", actor: "agent:hermes" },
      { node: "reduce", writeback: "test://reduce", actor: "system:code" },
      { node: "synthesize", writeback: "test://report", actor: "agent:hermes" },
      { node: "verify", writeback: "test://verdict", actor: "agent:checker", verdict: "pass" },
    ]);

    const events = parseWorkGraphJsonl(trace.join("\n")).events;
    const { workItems } = projectWorkGraph(events);
    const item = workItems.find((w) => w.workId === "work_diamond");
    assert.equal(item?.completed, true, "loop should complete");
    assert.equal(trace.some((line) => line.includes("work.completed")), true);
  });

  it("refuses to run when executor and verifier are the same actor", () => {
    const bad = buildLoopEngine({ ...config(), verifierActorId: "agent:hermes" });
    assert.equal(bad.ok, false);
    assert.match(bad.issues.join(" "), /verifier|supervisor/);
  });

  it("halts when an executed node lacks a write-back", () => {
    const engine = buildLoopEngine(config());
    const trace = runLoopEngine(engine, [
      { node: "scan-a", writeback: "test://scan-a", actor: "agent:hermes" },
      { node: "scan-b", actor: "agent:hermes" },
    ]);
    const state = lastState(trace);
    assert.equal(state.halted, true);
    assert.equal(state.haltReason, "writeback");
  });

  it("halts if a proposed action is not on the silence-break list", () => {
    const engine = buildLoopEngine(config());
    const trace = runLoopEngine(engine, [
      { node: "scan-a", writeback: "test://scan-a", actor: "agent:hermes" },
      { proposedAction: "external-send", node: "scan-b", writeback: "test://scan-b", actor: "agent:hermes" },
    ]);
    const state = lastState(trace);
    assert.equal(state.halted, true);
    assert.equal(state.haltReason, "silence");
  });

  it("halts at the turn brake", () => {
    const engine = buildLoopEngine({ ...config(), graph: { ...diamond, brakes: { ...diamond.brakes, maxTurns: 1 } } });
    const trace = runLoopEngine(engine, [
      { node: "scan-a", writeback: "test://scan-a", actor: "agent:hermes" },
      { node: "scan-b", writeback: "test://scan-b", actor: "agent:hermes" },
    ]);
    const state = lastState(trace);
    assert.equal(state.halted, true);
    assert.equal(state.haltReason, "max-turns");
  });

  it("does not release the diamond reducer until every fan-out lane has written back", () => {
    const engine = buildLoopEngine(config());
    const trace = runLoopEngine(engine, [
      { node: "scan-a", writeback: "test://scan-a", actor: "agent:hermes" },
      { node: "reduce", writeback: "test://reduce", actor: "system:code" },
    ]);
    const state = lastState(trace);
    assert.equal(state.halted, true);
    assert.equal(state.haltReason, "no-plan");
    assert.deepEqual(state.pending, ["scan-b"]);
  });

  it("rejects an unplanned node and a verifier impersonating the independent checker", () => {
    const engine = buildLoopEngine(config());
    const outOfOrder = runLoopEngine(engine, [
      { node: "verify", writeback: "test://fake", actor: "agent:checker" },
    ]);
    assert.equal(lastState(outOfOrder).haltReason, "no-plan");

    const impersonated = runLoopEngine(engine, [
      { node: "scan-a", writeback: "test://scan-a", actor: "agent:hermes" },
      { node: "scan-b", writeback: "test://scan-b", actor: "agent:hermes" },
      { node: "reduce", writeback: "test://reduce", actor: "system:code" },
      { node: "synthesize", writeback: "test://report", actor: "agent:hermes" },
      { node: "verify", writeback: "test://fake", actor: "agent:hermes" },
    ]);
    assert.equal(lastState(impersonated).haltReason, "no-plan");
    assert.equal(impersonated.some((line) => line.includes("work.completed")), false);
  });

  it("allows a node to consume the final available turn and cost unit", () => {
    const chain: LoopGraph = {
      schema: "starlight.loop-graph.v1",
      id: "exact-budget",
      shape: "chain",
      executorRole: "maker",
      supervisorRole: "checker",
      brakes: { maxTurns: 2, maxCostUnits: 3, emptyRoundsToStop: 1, silenceTriggers: [], requireWriteback: true },
      nodes: [
        { id: "make", role: "maker", kind: "agent", costUnits: 1, outputContract: "artifact" },
        { id: "verify", role: "checker", kind: "agent", costUnits: 2, outputContract: "verdict" },
      ],
      edges: [{ from: "make", to: "verify", contract: "artifact" }],
    };
    const trace = runLoopEngine(buildLoopEngine({ ...config(), graph: chain }), [
      { node: "make", writeback: "test://artifact", actor: "agent:hermes" },
      { node: "verify", writeback: "test://verdict", actor: "agent:checker", verdict: "pass" },
    ]);
    const state = lastState(trace);
    assert.equal(state.completed, true);
    assert.equal(state.turn, 2);
    assert.equal(state.costUsed, 3);
  });

  it("advances through a router branch selected by facts", () => {
    const router: LoopGraph = {
      schema: "starlight.loop-graph.v1",
      id: "doc-or-code",
      shape: "router",
      executorRole: "maker",
      supervisorRole: "checker",
      brakes: { maxTurns: 4, maxCostUnits: 20, emptyRoundsToStop: 1, silenceTriggers: [], requireWriteback: true },
      nodes: [
        { id: "inspect", role: "system", kind: "code", costUnits: 0, outputContract: "class" },
        { id: "docs", role: "maker", kind: "agent", costUnits: 1, outputContract: "doc-diff" },
        { id: "code", role: "maker", kind: "agent", costUnits: 3, outputContract: "code-diff" },
        { id: "verify", role: "checker", kind: "agent", costUnits: 2, outputContract: "verdict" },
      ],
      edges: [
        { from: "inspect", to: "docs", contract: "class", when: { field: "class", equals: "docs" } },
        { from: "inspect", to: "code", contract: "class", when: { field: "class", equals: "code" } },
        { from: "docs", to: "verify", contract: "doc-diff" },
        { from: "code", to: "verify", contract: "code-diff" },
      ],
    };
    const engine = buildLoopEngine({
      ...config(),
      graph: router,
      workId: "work_router",
      correlationId: "corr_router",
    });
    const trace = runLoopEngine(engine, [
      { node: "inspect", facts: { class: "code" }, writeback: "test://class", actor: "system:code" },
      { node: "code", writeback: "test://code", actor: "agent:hermes" },
      { node: "verify", writeback: "test://verdict", actor: "agent:checker", verdict: "pass" },
    ]);
    const events = parseWorkGraphJsonl(trace.join("\n")).events;
    const { workItems } = projectWorkGraph(events);
    const item = workItems.find((w) => w.workId === "work_router");
    assert.equal(item?.completed, true, "router branch should complete");
    assert.equal(trace.some((line) => line.includes("docs")), false, "docs branch must not run");
  });
});

function lastState(trace: string[]): LoopEngineState {
  const jsonLines = trace.filter((line) => line.trim().startsWith("{")).map((line) => JSON.parse(line));
  const states = jsonLines.filter((e) => e.__state === true);
  return states[states.length - 1] as LoopEngineState;
}
