import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  classifyEffort,
  compileLoopGraph,
  evaluateLoopGraph,
  initHarness,
  maxFanOutForEffort,
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
        { id: "docs", role: "checker", kind: "agent", costUnits: 1, outputContract: "doc-verdict" },
        { id: "code", role: "checker", kind: "agent", costUnits: 3, outputContract: "code-verdict" },
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
        { id: "verify", role: "checker", kind: "agent", costUnits: 1, outputContract: "verdict" },
      ],
      edges: [
        { from: "sweep", to: "dedupe", contract: "hits" },
        { from: "dedupe", to: "verify", contract: "new-hits" },
      ],
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

  it("fails closed on unreachable nodes, contract drift, and unverified terminal nodes", () => {
    const broken: LoopGraph = {
      ...diamond,
      id: "invalid-contract",
      nodes: [
        ...diamond.nodes,
        { id: "orphan", role: "maker", kind: "agent", costUnits: 1, outputContract: "orphan-output" },
      ],
      edges: diamond.edges.map((edge, index) =>
        index === 0 ? { ...edge, contract: "wrong-contract" } : edge,
      ),
    };
    const compiled = compileLoopGraph(broken);
    assert.equal(compiled.ok, false);
    assert.match(compiled.issues.join(" "), /contract.*does not match/);
    assert.match(compiled.issues.join(" "), /terminal node orphan must be role=checker/);
  });

  it("rejects cycles because convergence repeats are controlled by the driver brakes", () => {
    const cyclic: LoopGraph = {
      ...diamond,
      id: "cyclic-diamond",
      edges: [
        ...diamond.edges,
        { from: "synthesize", to: "scan-a", contract: "report" },
      ],
    };
    const compiled = compileLoopGraph(cyclic);
    assert.equal(compiled.ok, false);
    assert.match(compiled.issues.join(" "), /cycle detected/);
  });
});

describe("loop-graph brakes, write-back, verifier", () => {
  it("refuses a listed silence-break action until explicitly authorized", () => {
    const result = evaluateLoopGraph(diamond, {
      facts: {},
      actorId: "agent:hermes",
      turnsUsed: 0,
      costUsed: 0,
      proposedAction: "external-send",
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

describe("effort-scale, capacity, shared gist", () => {
  it("maps Anthropic effort classes to fan-out caps", () => {
    assert.equal(classifyEffort({ effortClass: "simple" }), "simple");
    assert.equal(maxFanOutForEffort("simple"), 1);
    assert.equal(maxFanOutForEffort("comparison"), 4);
    assert.equal(maxFanOutForEffort("complex"), 8);
  });

  it("refuses a diamond when effortClass is simple", () => {
    const result = evaluateLoopGraph(diamond, {
      facts: { effortClass: "simple", writebacks: ["scan-a", "scan-b", "reduce", "synthesize", "verify"] },
      actorId: "agent:hermes",
      verifierActorId: "agent:checker",
      turnsUsed: 1,
      costUsed: 4,
    });
    assert.equal(result.ok, false);
    assert.match(result.issues.join(" "), /effort-scale/);
  });

  it("refuses multi-agent fan-out when RAM is below 10 GiB", () => {
    const result = evaluateLoopGraph(diamond, {
      facts: { ramAvailGb: 7.39, writebacks: ["scan-a", "scan-b", "reduce", "synthesize", "verify"] },
      actorId: "agent:hermes",
      verifierActorId: "agent:checker",
      turnsUsed: 1,
      costUsed: 4,
    });
    assert.equal(result.ok, false);
    assert.match(result.issues.join(" "), /RAM below 10 GiB/);
  });

  it("requires a shared gist for every executed node when the substrate is present", () => {
    const result = evaluateLoopGraph(diamond, {
      facts: {
        writebacks: ["scan-a", "scan-b"],
        gists: { "scan-a": "lane A findings" },
      },
      actorId: "agent:hermes",
      verifierActorId: "agent:checker",
      turnsUsed: 1,
      costUsed: 4,
      executed: ["scan-a", "scan-b"],
    });
    assert.equal(result.ok, false);
    assert.match(result.issues.join(" "), /shared-gist missing for executed node scan-b/);
  });
});
