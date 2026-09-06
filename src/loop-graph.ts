export type LoopShape = "chain" | "diamond" | "router" | "converge";
export type LoopNodeKind = "agent" | "code";
export type LoopRole = "maker" | "checker" | "system" | "orchestrator";

export interface LoopBrakes {
  maxTurns: number;
  maxCostUnits: number;
  emptyRoundsToStop: number;
  allowedActions: string[];
  requireWriteback: boolean;
}

export interface LoopNode {
  id: string;
  role: LoopRole;
  kind: LoopNodeKind;
  costUnits: number;
  outputContract: string;
}

export interface LoopEdgeWhen {
  field: string;
  equals: string;
}

export interface LoopEdge {
  from: string;
  to: string;
  contract: string;
  when?: LoopEdgeWhen;
}

export interface LoopGraph {
  schema: "starlight.loop-graph.v1";
  id: string;
  shape: LoopShape;
  executorRole: LoopRole;
  supervisorRole: "checker";
  brakes: LoopBrakes;
  nodes: LoopNode[];
  edges: LoopEdge[];
}

export interface CompiledLoopGraph {
  ok: boolean;
  issues: string[];
  fanOut: string[];
  reduce?: string;
  nodes: LoopNode[];
  edges: LoopEdge[];
}

export interface LoopEvaluationInput {
  facts: Record<string, unknown>;
  actorId: string;
  verifierActorId?: string;
  turnsUsed: number;
  costUsed: number;
  executed?: string[];
  proposedAction?: string;
}

export interface LoopEvaluation {
  ok: boolean;
  halted: boolean;
  haltReason?: "max-turns" | "max-cost" | "empty-rounds" | "silence";
  route: string[];
  costUnits: number;
  issues: string[];
}

export interface HarnessFeature {
  id: string;
  title: string;
  required: boolean;
  status: "failing" | "passing";
  evidence?: string;
}

export interface HarnessState {
  features: HarnessFeature[];
  readyToComplete: boolean;
}

function nodeById(graph: LoopGraph): Map<string, LoopNode> {
  return new Map(graph.nodes.map((node) => [node.id, node]));
}

function incoming(graph: LoopGraph, id: string): LoopEdge[] {
  return graph.edges.filter((edge) => edge.to === id);
}

function outgoing(graph: LoopGraph, id: string): LoopEdge[] {
  return graph.edges.filter((edge) => edge.from === id);
}

export function compileLoopGraph(graph: LoopGraph): CompiledLoopGraph {
  const issues: string[] = [];
  if (graph.schema !== "starlight.loop-graph.v1") issues.push("schema must be starlight.loop-graph.v1");
  if (graph.executorRole === graph.supervisorRole) issues.push("executor and supervisor roles must differ");
  if (graph.supervisorRole !== "checker") issues.push("supervisorRole must be checker");
  if (!(graph.brakes.maxTurns > 0)) issues.push("maxTurns must be > 0");
  if (!(graph.brakes.maxCostUnits > 0)) issues.push("maxCostUnits must be > 0");

  const ids = new Set<string>();
  for (const node of graph.nodes) {
    if (ids.has(node.id)) issues.push(`duplicate node ${node.id}`);
    ids.add(node.id);
  }
  for (const edge of graph.edges) {
    if (!ids.has(edge.from) || !ids.has(edge.to)) {
      issues.push(`edge ${edge.from}->${edge.to} references a missing node`);
    }
  }

  const fanOut: string[] = [];
  let reduce: string | undefined;
  const nodes = nodeById(graph);

  if (graph.shape === "diamond") {
    for (const node of graph.nodes) {
      if (incoming(graph, node.id).length === 0 && outgoing(graph, node.id).length > 0) {
        fanOut.push(node.id);
      }
      if (incoming(graph, node.id).length >= 2) reduce = node.id;
    }
    if (fanOut.length < 2) issues.push("diamond requires at least two fan-out nodes");
    if (!reduce) issues.push("diamond requires a reduce node with two or more inbound edges");
    else if (nodes.get(reduce)?.kind !== "code") {
      issues.push("diamond reduce node must be kind=code so merge is not an agent");
    }
  }

  if (graph.shape === "router") {
    const branches = graph.edges.filter((edge) => edge.when);
    if (branches.length < 2) issues.push("router requires at least two conditioned edges");
  }

  return {
    ok: issues.length === 0,
    issues,
    fanOut,
    reduce,
    nodes: graph.nodes,
    edges: graph.edges,
  };
}

function brakeHalt(graph: LoopGraph, input: LoopEvaluationInput): LoopEvaluation["haltReason"] | undefined {
  if (!Array.isArray(graph.brakes.allowedActions)
    || (input.proposedAction && !graph.brakes.allowedActions.includes(input.proposedAction))) {
    return "silence";
  }
  if (input.turnsUsed >= graph.brakes.maxTurns) return "max-turns";
  if (input.costUsed >= graph.brakes.maxCostUnits) return "max-cost";
  const emptyRounds = Number(input.facts.emptyRounds ?? 0);
  if (graph.shape === "converge" && emptyRounds >= graph.brakes.emptyRoundsToStop) {
    return "empty-rounds";
  }
  return undefined;
}

function routeGraph(graph: LoopGraph, facts: Record<string, unknown>): string[] {
  if (graph.shape === "router") {
    const start = graph.nodes.find((node) => incoming(graph, node.id).length === 0);
    if (!start) return [];
    const match = outgoing(graph, start.id).find((edge) => {
      if (!edge.when) return false;
      return String(facts[edge.when.field] ?? "") === edge.when.equals;
    });
    return match ? [start.id, match.to] : [start.id];
  }

  if (graph.shape === "diamond") {
    const compiled = compileLoopGraph(graph);
    const tail: string[] = [];
    if (compiled.reduce) {
      let cursor = compiled.reduce;
      const seen = new Set<string>();
      while (cursor && !seen.has(cursor)) {
        tail.push(cursor);
        seen.add(cursor);
        const next = outgoing(graph, cursor)[0]?.to;
        cursor = next ?? "";
      }
    }
    return [...compiled.fanOut, ...tail];
  }

  const start = graph.nodes.find((node) => incoming(graph, node.id).length === 0);
  if (!start) return graph.nodes.map((node) => node.id);
  const route = [start.id];
  const seen = new Set([start.id]);
  let cursor = start.id;
  while (true) {
    const next = outgoing(graph, cursor)[0]?.to;
    if (!next || seen.has(next)) break;
    route.push(next);
    seen.add(next);
    cursor = next;
  }
  return route;
}

export function evaluateLoopGraph(graph: LoopGraph, input: LoopEvaluationInput): LoopEvaluation {
  const compiled = compileLoopGraph(graph);
  const issues = [...compiled.issues];
  const haltReason = brakeHalt(graph, input);
  const route = haltReason ? [] : routeGraph(graph, input.facts);
  const costUnits = route.reduce((sum, id) => sum + (nodeById(graph).get(id)?.costUnits ?? 0), 0);

  if (input.verifierActorId && input.verifierActorId === input.actorId) {
    issues.push("supervisor must differ from executor; same-actor verification is rejected");
  }

  if (graph.brakes.requireWriteback && !haltReason) {
    const executed = input.executed ?? route;
    const writebacks = new Set(
      Array.isArray(input.facts.writebacks) ? input.facts.writebacks.map(String) : [],
    );
    const missing = executed.filter((id) => !writebacks.has(id));
    if (missing.length > 0) {
      issues.push(`write-back required for executed nodes: ${missing.join(", ")}`);
    }
  }

  return {
    ok: issues.length === 0 && !haltReason,
    halted: Boolean(haltReason),
    haltReason,
    route,
    costUnits,
    issues,
  };
}

export function initHarness(features: Array<Omit<HarnessFeature, "status" | "evidence">>): HarnessState {
  const next: HarnessState = {
    features: features.map((feature) => ({ ...feature, status: "failing" })),
    readyToComplete: false,
  };
  return { ...next, readyToComplete: harnessReady(next.features) };
}

export function recordFeatureEvidence(state: HarnessState, id: string, evidence: string): HarnessState {
  const features = state.features.map((feature) =>
    feature.id === id && evidence.trim().length > 0
      ? { ...feature, status: "passing" as const, evidence }
      : feature,
  );
  return { features, readyToComplete: harnessReady(features) };
}

function harnessReady(features: HarnessFeature[]): boolean {
  return features.every((feature) => !feature.required || feature.status === "passing");
}
