import { evaluateLoopGraph, type LoopGraph } from "./loop-graph.js";

export interface LoopEngineConfig {
  graph: LoopGraph;
  workId: string;
  correlationId: string;
  projectId: string;
  executorActorId: string;
  verifierActorId: string;
  now: () => string;
}

export interface LoopEngineState {
  __state: true;
  step: number;
  turn: number;
  costUsed: number;
  emptyRounds: number;
  pending: string[];
  executed: string[];
  writebacks: string[];
  facts: Record<string, unknown>;
  halted: boolean;
  haltReason?: "max-turns" | "max-cost" | "empty-rounds" | "silence" | "writeback" | "no-plan";
  completed: boolean;
}

export interface LoopStepInput {
  node: string;
  actor: string;
  writeback?: string;
  facts?: Record<string, unknown>;
  proposedAction?: string;
}

export interface BuiltLoopEngine {
  ok: boolean;
  issues: string[];
  config: LoopEngineConfig;
}

function admitEvent(cfg: LoopEngineConfig, now: string): string {
  return JSON.stringify({
    schemaVersion: "1.0",
    eventId: `evt_${cfg.workId}_admit`,
    workId: cfg.workId,
    correlationId: cfg.correlationId,
    projectId: cfg.projectId,
    kind: "work.admitted",
    source: { system: "hermes", sourceId: "loop-engine" },
    actorId: cfg.executorActorId,
    occurredAt: now,
    observedAt: now,
    evidenceRefs: [`loop://${cfg.graph.id}`],
    visibility: "internal",
    retention: "audit",
    summary: `Loop ${cfg.graph.id} (${cfg.graph.shape}) admitted`,
    data: { requirements: { artifact: true, change: false, checks: false, deployment: false, verification: true } },
  });
}

function nodeEvent(kind: string, cfg: LoopEngineConfig, nodeId: string, actorId: string, evidence: string, now: string): string {
  return JSON.stringify({
    schemaVersion: "1.0",
    eventId: `evt_${cfg.workId}_${nodeId}`,
    workId: cfg.workId,
    correlationId: cfg.correlationId,
    projectId: cfg.projectId,
    kind,
    source: { system: "hermes", sourceId: "loop-engine" },
    actorId,
    occurredAt: now,
    observedAt: now,
    evidenceRefs: [evidence],
    visibility: "internal",
    retention: "audit",
    summary: `Loop node ${nodeId} produced`,
    data: { nodeId, nodeKind: kind.replace(/\..*$/, "") },
  });
}

function completeEvent(cfg: LoopEngineConfig, now: string, actorId: string): string {
  return JSON.stringify({
    schemaVersion: "1.0",
    eventId: `evt_${cfg.workId}_complete`,
    workId: cfg.workId,
    correlationId: cfg.correlationId,
    projectId: cfg.projectId,
    kind: "work.completed",
    source: { system: "hermes", sourceId: "loop-engine" },
    actorId,
    occurredAt: now,
    observedAt: now,
    evidenceRefs: [`loop://${cfg.graph.id}`],
    visibility: "internal",
    retention: "audit",
    summary: `Loop ${cfg.graph.id} completed with verified receipts`,
  });
}

export function buildLoopEngine(config: LoopEngineConfig): BuiltLoopEngine {
  const issues: string[] = [];
  if (config.executorActorId === config.verifierActorId) {
    issues.push("verifier must differ from executor; same-actor loop is rejected");
  }
  return { ok: issues.length === 0, issues, config };
}

function nodeById(graph: LoopGraph): Map<string, LoopGraph["nodes"][number]> {
  return new Map(graph.nodes.map((n) => [n.id, n]));
}

function inboundCount(graph: LoopGraph, id: string): number {
  return graph.edges.filter((e) => e.to === id).length;
}

function planNext(graph: LoopGraph, state: LoopEngineState): string[] {
  const done = new Set(state.executed);
  const ready: string[] = [];
  if (state.step === 0) {
    return graph.nodes.filter((n) => inboundCount(graph, n.id) === 0).map((n) => n.id);
  }
  for (const edge of graph.edges) {
    if (done.has(edge.from) && !done.has(edge.to)) {
      const when = edge.when;
      if (when && String(state.facts[when.field] ?? "") !== when.equals) continue;
      if (!ready.includes(edge.to)) ready.push(edge.to);
    }
  }
  return ready;
}

export function runLoopEngine(engine: BuiltLoopEngine, inputs: LoopStepInput[]): string[] {
  const { config } = engine;
  const out: string[] = [];
  const nodes = nodeById(config.graph);
  let state: LoopEngineState = {
    __state: true,
    step: 0,
    turn: 0,
    costUsed: 0,
    emptyRounds: 0,
    pending: [],
    executed: [],
    writebacks: [],
    facts: {},
    halted: false,
    completed: false,
  };

  if (!engine.ok) {
    state.halted = true;
    state.haltReason = "no-plan";
    out.push(JSON.stringify(state));
    return out;
  }

  out.push(admitEvent(config, config.now()));

  for (const input of inputs) {
    const node = nodes.get(input.node);
    if (!node) {
      state.halted = true;
      state.haltReason = "no-plan";
      out.push(JSON.stringify(state));
      return out;
    }
    state.turn += 1;
    state.costUsed += node.costUnits;

    if (input.proposedAction && !config.graph.brakes.silenceTriggers.includes(input.proposedAction)) {
      state.halted = true;
      state.haltReason = "silence";
      out.push(JSON.stringify(state));
      return out;
    }
    const isVerifier = node.role === "checker";
    if (config.graph.brakes.requireWriteback && !isVerifier && !input.writeback) {
      state.halted = true;
      state.haltReason = "writeback";
      out.push(JSON.stringify(state));
      return out;
    }
    if (state.turn >= config.graph.brakes.maxTurns) {
      state.halted = true;
      state.haltReason = "max-turns";
      out.push(JSON.stringify(state));
      return out;
    }
    if (state.costUsed >= config.graph.brakes.maxCostUnits) {
      state.halted = true;
      state.haltReason = "max-cost";
      out.push(JSON.stringify(state));
      return out;
    }

    if (input.writeback) state.writebacks.push(input.node);
    state.executed.push(input.node);
    if (input.facts) state.facts = { ...state.facts, ...input.facts };

    if (isVerifier) {
      out.push(nodeEvent("verification.passed", config, input.node, input.actor, input.writeback ?? "test://missing", config.now()));
    } else {
      out.push(nodeEvent("artifact.produced", config, input.node, input.actor, input.writeback ?? "test://missing", config.now()));
    }

    const next = planNext(config.graph, state);
    state.pending = next;

    if (state.pending.length === 0) {
      state.completed = true;
      out.push(completeEvent(config, config.now(), isVerifier ? input.actor : config.verifierActorId));
      out.push(JSON.stringify(state));
      return out;
    }
    state.step += 1;
    out.push(JSON.stringify(state));
  }

  out.push(JSON.stringify(state));
  return out;
}
