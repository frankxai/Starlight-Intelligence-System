import { compileLoopGraph, type LoopGraph } from "./loop-graph.js";
import type { WorkGraphSourceSystem } from "./work-graph.js";

export interface LoopEngineConfig {
  graph: LoopGraph;
  workId: string;
  correlationId: string;
  projectId: string;
  executorActorId: string;
  verifierActorId: string;
  sourceSystem?: WorkGraphSourceSystem;
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
  haltReason?: "max-turns" | "max-cost" | "empty-rounds" | "silence" | "writeback" | "no-plan" | "verification-failed";
  completed: boolean;
}

export interface LoopStepInput {
  node: string;
  actor: string;
  writeback?: string;
  facts?: Record<string, unknown>;
  proposedAction?: string;
  /** Explicit checker decision. Receipt references are supplied, not authenticated here. */
  verdict?: "pass" | "fail";
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
    source: { system: cfg.sourceSystem ?? "other", sourceId: "loop-engine" },
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
    source: { system: cfg.sourceSystem ?? "other", sourceId: "loop-engine" },
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
    source: { system: cfg.sourceSystem ?? "other", sourceId: "loop-engine" },
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
  const issues = [...compileLoopGraph(config.graph).issues];
  for (const field of ["workId", "correlationId", "projectId", "executorActorId", "verifierActorId"] as const) {
    if (!config[field].trim()) issues.push(`${field} must not be empty`);
  }
  if (config.executorActorId === config.verifierActorId) {
    issues.push("verifier must differ from executor; same-actor loop is rejected");
  }
  return { ok: issues.length === 0, issues, config };
}

function nodeById(graph: LoopGraph): Map<string, LoopGraph["nodes"][number]> {
  return new Map(graph.nodes.map((n) => [n.id, n]));
}

function incoming(graph: LoopGraph, id: string): LoopGraph["edges"] {
  return graph.edges.filter((edge) => edge.to === id);
}

function planNext(graph: LoopGraph, state: LoopEngineState, active: Set<string>): string[] {
  const done = new Set(state.executed);
  return graph.nodes
    .filter((node) => active.has(node.id) && !done.has(node.id))
    .filter((node) => {
      const allInbound = incoming(graph, node.id);
      if (allInbound.length === 0) return true;
      const activeInbound = allInbound.filter((edge) => active.has(edge.from));
      if (activeInbound.length === 0) return false;
      return activeInbound.every((edge) => done.has(edge.from));
    })
    .map((node) => node.id);
}

export function runLoopEngine(engine: BuiltLoopEngine, inputs: LoopStepInput[]): string[] {
  // Revalidate at consumption: callers may have mutated a graph since compilation.
  engine = buildLoopEngine(engine.config);
  const { config } = engine;
  const out: string[] = [];
  const nodes = nodeById(config.graph);
  let active = new Set(config.graph.nodes.map((node) => node.id));
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

  const admittedAt = config.now();
  if (!Number.isFinite(Date.parse(admittedAt))) {
    return [JSON.stringify({ ...state, halted: true, haltReason: "no-plan" })];
  }
  out.push(admitEvent(config, admittedAt));
  state.pending = planNext(config.graph, state, active);

  // Events must carry strictly increasing instants so the projector orders them
  // by occurrence, never by eventId. Initialize one tick after the admit stamp.
  let tickMs = Date.parse(admittedAt) + 1;
  const tick = (): string => {
    const stamp = new Date(tickMs).toISOString();
    tickMs += 1;
    return stamp;
  };

  for (const input of inputs) {
    const node = nodes.get(input.node);
    if (!node) {
      state.halted = true;
      state.haltReason = "no-plan";
      out.push(JSON.stringify(state));
      return out;
    }
    if (!state.pending.includes(input.node)) {
      state.halted = true;
      state.haltReason = "no-plan";
      out.push(JSON.stringify(state));
      return out;
    }

    if (input.proposedAction && config.graph.brakes.silenceTriggers.includes(input.proposedAction)) {
      state.halted = true;
      state.haltReason = "silence";
      out.push(JSON.stringify(state));
      return out;
    }
    const isVerifier = node.role === "checker";
    if (isVerifier && (input.actor !== config.verifierActorId || input.actor === config.executorActorId)) {
      state.halted = true;
      state.haltReason = "no-plan";
      out.push(JSON.stringify(state));
      return out;
    }
    if (!input.actor.trim() || (!isVerifier && input.actor === config.verifierActorId) ||
      (node.role === "maker" && input.actor !== config.executorActorId)) {
      state.halted = true;
      state.haltReason = "no-plan";
      out.push(JSON.stringify(state));
      return out;
    }
    // Every emitted event needs evidence, even when the graph's preflight is permissive.
    // A reference is not proof of bytes or identity: the host must resolve/authenticate it.
    if (!input.writeback?.trim()) {
      state.halted = true;
      state.haltReason = "writeback";
      out.push(JSON.stringify(state));
      return out;
    }
    if (state.turn + 1 > config.graph.brakes.maxTurns) {
      state.halted = true;
      state.haltReason = "max-turns";
      out.push(JSON.stringify(state));
      return out;
    }
    if (state.costUsed + node.costUnits > config.graph.brakes.maxCostUnits) {
      state.halted = true;
      state.haltReason = "max-cost";
      out.push(JSON.stringify(state));
      return out;
    }
    state.turn += 1;
    state.costUsed += node.costUnits;

    if (input.writeback) state.writebacks.push(input.node);
    state.executed.push(input.node);
    if (input.facts) state.facts = { ...state.facts, ...input.facts };

    // Choose once at the router root. Later facts cannot activate a second branch.
    if (config.graph.shape === "router" && incoming(config.graph, input.node).length === 0) {
      const outgoing = config.graph.edges.filter((edge) => edge.from === input.node);
      const matches = outgoing.filter((edge) => edge.when &&
        state.facts[edge.when.field] === edge.when.equals);
      const selected = matches.length === 1 ? matches[0] :
        matches.length === 0 ? outgoing.find((edge) => !edge.when) : undefined;
      if (!selected) {
        out.push(JSON.stringify({ ...state, halted: true, haltReason: "no-plan" }));
        return out;
      }
      active = new Set([input.node]);
      const queue = [selected.to];
      while (queue.length) {
        const id = queue.shift()!;
        if (active.has(id)) continue;
        active.add(id);
        queue.push(...config.graph.edges.filter((edge) => edge.from === id).map((edge) => edge.to));
      }
    }

    if (isVerifier) {
      if (input.verdict !== "pass") {
        out.push(nodeEvent("work.blocked", config, input.node, input.actor, input.writeback, tick()));
        out.push(JSON.stringify({ ...state, halted: true, haltReason: "verification-failed" }));
        return out;
      }
      out.push(nodeEvent("verification.passed", config, input.node, input.actor, input.writeback, tick()));
    } else {
      out.push(nodeEvent("artifact.produced", config, input.node, input.actor, input.writeback, tick()));
    }

    const next = planNext(config.graph, state, active);
    state.pending = next;

    if (state.pending.length === 0 && isVerifier) {
      state.completed = true;
      out.push(completeEvent(config, tick(), isVerifier ? input.actor : config.verifierActorId));
      out.push(JSON.stringify(state));
      return out;
    }
    if (state.pending.length === 0) {
      state.halted = true;
      state.haltReason = "no-plan";
      out.push(JSON.stringify(state));
      return out;
    }
    state.step += 1;
    out.push(JSON.stringify(state));
  }

  out.push(JSON.stringify(state));
  return out;
}
