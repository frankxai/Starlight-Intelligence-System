import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  compileLoopGraph,
  evaluateLoopGraph,
  initHarness,
  recordFeatureEvidence,
  type LoopGraph,
} from "../src/loop-graph.js";

const diamond: LoopGraph = {
  schema: "starlight.loop-graph.v1",
  id: "diamond-review",
  shape: "diamond",
  executorRole: "maker",
  supervisorRole: "checker",
  brakes: {
    maxTurns: 8,
    maxCostUnits: 20,
    emptyRoundsToStop: 2,
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

describe("loop-graph topologies", () => {
  it("compiles a diamond so independent scans fan out and reduce in code", () => {
    const compiled = compileLoopGraph(diamond);
    assert.equal(compiled.ok, true);
    assert.deepEqual(compiled.fanOut, ["scan-a", "scan-b"]);
    assert.equal(compiled.reduce, "reduce");
    assert.equal(compiled.nodes.find((node) => node.id === "reduce")?.kind, "code");
  });

  it("refuses a diamond whose merge node is an agent", () => {
    const broken = {
      ...diamond,
      id: "bad-diamond",
      nodes: diamond.nodes.map((node) =>
        node.id === "reduce" ? { ...node, kind: "agent" as const } : node,
      ),
    };
    const compiled = compileLoopGraph(broken);
    assert.equal(compiled.ok, false);
    assert.match(compiled.issues.join(" "), /reduce.*code/);
  });

  it("routes from facts instead of a linear default", () => {
    const router: LoopGraph = {
      schema: "starlight.loop-graph.v1",
      id: "docs-or-code",
      shape: "router",
      executorRole: "maker",
      supervisorRole: "checker",
      brakes: { maxTurns: 3, maxCostUnits: 10, emptyRoundsToStop: 1, silenceTriggers: [], requireWriteback: false },
      nodes: [
        { id: "inspect", role: "system", kind: "code", costUnits: 0, outputContract: "class" },
        { id: "docs", role: "maker", kind: "agent", costUnits: 1, outputContract: "doc-diff" },
        { id: "code", role: "maker", kind: "agent", costUnits: 3, outputContract: "code-diff" },
      ],
      edges: [
        { from: "inspect", to: "docs", contract: "class", when: { field: "class", equals: "docs" } },
        { from: "inspect", to: "code", contract: "class", when: { field: "class", equals: "code" } },
      ],
    };
    const docs = evaluateLoopGraph(router, { facts: { class: "docs" }, actorId: "agent:hermes", turnsUsed: 0, costUsed: 0 });
    assert.deepEqual(docs.route, ["inspect", "docs"]);
    const code = evaluateLoopGraph(router, { facts: { class: "code" }, actorId: "agent:hermes", turnsUsed: 0, costUsed: 0 });
    assert.deepEqual(code.route, ["inspect", "code"]);
  });

  it("stops a converge loop after K empty rounds or when the brake fires", () => {
    const converge: LoopGraph = {
      schema: "starlight.loop-graph.v1",
      id: "until-dry",
      shape: "converge",
      executorRole: "maker",
      supervisorRole: "checker",
      brakes: { maxTurns: 4, maxCostUnits: 100, emptyRoundsToStop: 2, silenceTriggers: [], requireWriteback: false },
      nodes: [
        { id: "sweep", role: "maker", kind: "agent", costUnits: 1, outputContract: "hits" },
        { id: "dedupe", role: "system", kind: "code", costUnits: 0, outputContract: "new-hits" },
      ],
      edges: [{ from: "sweep", to: "dedupe", contract: "hits" }],
    };
    const dry = evaluateLoopGraph(converge, {
      facts: { emptyRounds: 2 },
      actorId: "agent:hermes",
      turnsUsed: 1,
      costUsed: 1,
    });
    assert.equal(dry.halted, true);
    assert.equal(dry.haltReason, "empty-rounds");

    const budget = evaluateLoopGraph(converge, {
      facts: { emptyRounds: 0 },
      actorId: "agent:hermes",
      turnsUsed: 4,
      costUsed: 4,
    });
    assert.equal(budget.halted, true);
    assert.equal(budget.haltReason, "max-turns");
  });
});

describe("loop-graph brakes, write-back, verifier", () => {
  it("refuses an action that is not on the silence-break list", () => {
    const result = evaluateLoopGraph(diamond, {
      facts: {},
      actorId: "agent:hermes",
      turnsUsed: 0,
      costUsed: 0,
      proposedAction: "tweet",
    });
    assert.equal(result.halted, true);
    assert.equal(result.haltReason, "silence");
  });

  it("rejects a verifier that is the same actor as the executor", () => {
    const result = evaluateLoopGraph(diamond, {
      facts: { writebacks: ["scan-a", "scan-b", "reduce", "synthesize", "verify"] },
      actorId: "agent:hermes",
      verifierActorId: "agent:hermes",
      turnsUsed: 1,
      costUsed: 4,
    });
    assert.equal(result.ok, false);
    assert.match(result.issues.join(" "), /supervisor/);
  });

  it("requires a write-back artifact from every executed node", () => {
    const result = evaluateLoopGraph(diamond, {
      facts: { writebacks: ["scan-a"] },
      actorId: "agent:hermes",
      verifierActorId: "agent:checker",
      turnsUsed: 1,
      costUsed: 4,
      executed: ["scan-a", "scan-b"],
    });
    assert.equal(result.ok, false);
    assert.match(result.issues.join(" "), /write-back/);
  });
});

describe("initializer harness", () => {
  it("starts every required feature failing and refuses completion until evidence exists", () => {
    const harness = initHarness([
      { id: "topology", title: "Executable topologies", required: true },
      { id: "brakes", title: "Autonomy brakes", required: true },
    ]);
    assert.equal(harness.features.every((feature) => feature.status === "failing"), true);
    assert.equal(harness.readyToComplete, false);

    const next = recordFeatureEvidence(harness, "topology", "test://loop-graph");
    assert.equal(next.features.find((feature) => feature.id === "topology")?.status, "passing");
    assert.equal(next.readyToComplete, false);

    const done = recordFeatureEvidence(next, "brakes", "test://brakes");
    assert.equal(done.readyToComplete, true);
  });
});
