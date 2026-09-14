export type LoopShape = "chain" | "diamond" | "router" | "converge";
export type LoopNodeKind = "agent" | "code";
export type LoopRole = "maker" | "checker" | "system" | "orchestrator";

export interface LoopBrakes {
  maxTurns: number;
  maxCostUnits: number;
  emptyRoundsToStop: number;
  /** v1 allowlist: an unlisted proposed action always halts. */
  allowedActions: string[];
  /** Optional additional denylist; never grants authority. */
  silenceTriggers?: string[];
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
  roots: string[];
  terminals: string[];
  nodes: LoopNode[];
  edges: LoopEdge[];
}

export type EffortClass = "simple" | "comparison" | "complex";

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
  const invalid = (message: string): CompiledLoopGraph => ({
    ok: false, issues: [message], fanOut: [], roots: [], terminals: [], nodes: [], edges: [],
  });
  if (!graph || typeof graph !== "object" || !graph.brakes ||
    !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) return invalid("invalid graph structure");
  if (typeof graph.id !== "string" || !graph.id.trim()) return invalid("graph id must not be empty");
  if (!Array.isArray(graph.brakes.allowedActions) || graph.brakes.allowedActions.some((v) => typeof v !== "string" || !v.trim())) {
    return invalid("allowedActions must be a string array (v1 allowlist)");
  }
  if (graph.brakes.silenceTriggers !== undefined && (!Array.isArray(graph.brakes.silenceTriggers) ||
    graph.brakes.silenceTriggers.some((v) => typeof v !== "string" || !v.trim()))) return invalid("invalid silenceTriggers");
  if (typeof graph.brakes.requireWriteback !== "boolean") return invalid("requireWriteback must be boolean");
  if (graph.nodes.some((n) => !n || typeof n.id !== "string" || typeof n.outputContract !== "string" ||
    !["maker", "checker", "system", "orchestrator"].includes(n.role) || !["code", "agent"].includes(n.kind))) return invalid("invalid node");
  if (graph.edges.some((e) => !e || typeof e.from !== "string" || typeof e.to !== "string" ||
    typeof e.contract !== "string" || (e.when !== undefined && (!e.when || typeof e.when.field !== "string" ||
      typeof e.when.equals !== "string")))) return invalid("invalid edge");
  if (graph.schema !== "starlight.loop-graph.v1") issues.push("schema must be starlight.loop-graph.v1");
  if (graph.executorRole === graph.supervisorRole) issues.push("executor and supervisor roles must differ");
  if (graph.supervisorRole !== "checker") issues.push("supervisorRole must be checker");
  if (!Number.isSafeInteger(graph.brakes.maxTurns) || graph.brakes.maxTurns <= 0) issues.push("maxTurns must be a positive integer");
  if (!Number.isFinite(graph.brakes.maxCostUnits) || graph.brakes.maxCostUnits <= 0) issues.push("maxCostUnits must be finite and > 0");
  if (!Number.isSafeInteger(graph.brakes.emptyRoundsToStop) || graph.brakes.emptyRoundsToStop <= 0) issues.push("emptyRoundsToStop must be a positive integer");
  if (!["chain", "diamond", "router", "converge"].includes(graph.shape)) issues.push("unknown graph shape");
  if (graph.nodes.length === 0) issues.push("graph requires at least one node");

  const inbound = new Map<string, LoopEdge[]>();
  const outbound = new Map<string, LoopEdge[]>();
  const indexedNodes = nodeById(graph);
  for (const edge of graph.edges) {
    if (!inbound.has(edge.to)) inbound.set(edge.to, []);
    if (!outbound.has(edge.from)) outbound.set(edge.from, []);
    inbound.get(edge.to)!.push(edge);
    outbound.get(edge.from)!.push(edge);
  }
  const inEdges = (id: string): LoopEdge[] => inbound.get(id) ?? [];
  const outEdges = (id: string): LoopEdge[] => outbound.get(id) ?? [];
  const ids = new Set<string>();
  for (const node of graph.nodes) {
    if (ids.has(node.id)) issues.push(`duplicate node ${node.id}`);
    ids.add(node.id);
    if (!node.id.trim()) issues.push("node id must not be empty");
    if (!node.outputContract.trim()) issues.push(`node ${node.id} requires an output contract`);
    if (!Number.isFinite(node.costUnits) || node.costUnits < 0) {
      issues.push(`node ${node.id} costUnits must be a finite non-negative number`);
    }
  }
  const edgeKeys = new Set<string>();
  for (const edge of graph.edges) {
    if (!ids.has(edge.from) || !ids.has(edge.to)) {
      issues.push(`edge ${edge.from}->${edge.to} references a missing node`);
    }
    const key = JSON.stringify([edge.from, edge.to, edge.when?.field, edge.when?.equals]);
    if (edgeKeys.has(key)) issues.push(`duplicate edge ${edge.from}->${edge.to}`);
    edgeKeys.add(key);
    if (edge.from === edge.to) issues.push(`self edge ${edge.from}->${edge.to} is not allowed`);
    const source = indexedNodes.get(edge.from);
    if (source && edge.contract !== source.outputContract) {
      issues.push(
        `edge ${edge.from}->${edge.to} contract ${edge.contract} does not match source output ${source.outputContract}`,
      );
    }
  }

  const fanOut: string[] = [];
  let reduce: string | undefined;
  const nodes = nodeById(graph);
  const roots = graph.nodes.filter((node) => inEdges(node.id).length === 0).map((node) => node.id);
  const terminals = graph.nodes.filter((node) => outEdges(node.id).length === 0).map((node) => node.id);
  if (roots.length === 0) issues.push("graph requires at least one root node");
  if (terminals.length === 0) issues.push("graph requires at least one terminal node");
  for (const id of terminals) {
    if (nodes.get(id)?.role !== "checker") issues.push(`terminal node ${id} must be role=checker`);
  }

  const reachable = new Set<string>();
  const queue = [...roots];
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const id = queue[cursor];
    if (reachable.has(id)) continue;
    reachable.add(id);
    for (const edge of outEdges(id)) queue.push(edge.to);
  }
  for (const node of graph.nodes) {
    if (!reachable.has(node.id)) issues.push(`node ${node.id} is unreachable from a root`);
  }

  // Kahn traversal avoids recursion limits on large valid graphs.
  const degrees = new Map(graph.nodes.map((node) => [node.id, inEdges(node.id).length]));
  const ready = [...roots];
  let visitedCount = 0;
  for (let cursor = 0; cursor < ready.length; cursor++) {
    const id = ready[cursor];
    visitedCount++;
    for (const edge of outEdges(id)) {
      const remaining = (degrees.get(edge.to) ?? 0) - 1;
      degrees.set(edge.to, remaining);
      if (remaining === 0) ready.push(edge.to);
    }
  }
  if (visitedCount !== graph.nodes.length) issues.push("cycle detected; convergence repeats must be driver-controlled");

  for (const edge of graph.edges) {
    if (edge.when && (graph.shape !== "router" || edge.from !== roots[0])) {
      issues.push("conditions are supported only at a router root");
    }
    if (edge.when && (!edge.when.field.trim() || typeof edge.when.equals !== "string")) {
      issues.push("router predicates require a field and string equals value");
    }
  }
  if (graph.shape === "chain" || graph.shape === "converge") {
    if (roots.length !== 1 || graph.nodes.some((node) => inEdges(node.id).length > 1 || outEdges(node.id).length > 1)) {
      issues.push("chain and converge require a single unbranched path");
    }
  }

  if (graph.shape === "diamond") {
    for (const node of graph.nodes) {
      if (inEdges(node.id).length === 0 && outEdges(node.id).length > 0) {
        fanOut.push(node.id);
      }
      if (inEdges(node.id).length >= 2) {
        reduce ??= node.id;
        if (node.kind !== "code") issues.push(`diamond reduce node ${node.id} must be kind=code`);
      }
    }
    if (fanOut.length < 2) issues.push("diamond requires at least two fan-out nodes");
    if (!reduce) issues.push("diamond requires a reduce node with two or more inbound edges");
    else if (nodes.get(reduce)?.kind !== "code") {
      issues.push("diamond reduce node must be kind=code so merge is not an agent");
    }
  }

  if (graph.shape === "router") {
    const branches = graph.edges.filter((edge) => edge.when && edge.from === roots[0]);
    if (branches.length < 2) issues.push("router requires at least two conditioned edges");
    if (roots.length !== 1) issues.push("router requires exactly one root node");
    const defaultEdges = graph.edges.filter((edge) => edge.from === roots[0] && !edge.when);
    if (defaultEdges.length > 1) issues.push("router allows at most one default edge from its root");
  }

  return {
    ok: issues.length === 0,
    issues,
    fanOut,
    reduce,
    roots,
    terminals,
    nodes: graph.nodes,
    edges: graph.edges,
  };
}

const EFFORT_FANOUT_CAP: Record<EffortClass, number> = {
  simple: 1,
  comparison: 4,
  complex: 8,
};

export function classifyEffort(facts: Record<string, unknown>): EffortClass | undefined {
  const explicit = String(facts.effortClass ?? "").trim();
  if (explicit === "simple" || explicit === "comparison" || explicit === "complex") {
    return explicit;
  }
  return undefined;
}

export function maxFanOutForEffort(effort: EffortClass): number {
  return EFFORT_FANOUT_CAP[effort];
}

function capacityIssues(compiled: CompiledLoopGraph, facts: Record<string, unknown>): string[] {
  const issues: string[] = [];
  const fanOut = compiled.fanOut.length > 0
    ? compiled.fanOut.length
    : 1; // Serial agents are not concurrent fan-out.
  const ram = facts.ramAvailGb;
  if (typeof ram === "number" && Number.isFinite(ram) && ram < 10 && fanOut > 1) {
    issues.push("capacity: RAM below 10 GiB refuses multi-agent fan-out");
  }
  const mode = String(facts.storageMode ?? "");
  if ((mode === "TIGHT" || mode === "CRITICAL") && fanOut > 1) {
    issues.push(`capacity: storage mode ${mode} refuses multi-agent fan-out`);
  }
  const effort = classifyEffort(facts);
  if (effort && compiled.fanOut.length > maxFanOutForEffort(effort)) {
    issues.push(
      `effort-scale: fan-out ${compiled.fanOut.length} exceeds max ${maxFanOutForEffort(effort)} for class ${effort}`,
    );
  }
  return issues;
}

function gistIssues(input: LoopEvaluationInput, executed: string[]): string[] {
  if (!Object.prototype.hasOwnProperty.call(input.facts, "gists")) return [];
  const gists = input.facts.gists;
  if (!gists || typeof gists !== "object" || Array.isArray(gists)) {
    return ["shared-gist substrate must be an object of nodeId -> gist"];
  }
  const record = gists as Record<string, unknown>;
  return executed.filter((id) => !String(record[id] ?? "").trim()).map(
    (id) => `shared-gist missing for executed node ${id}`,
  );
}

function brakeHalt(graph: LoopGraph, input: LoopEvaluationInput): LoopEvaluation["haltReason"] | undefined {
  if (!Array.isArray(graph.brakes.allowedActions) || (input.proposedAction &&
    (!graph.brakes.allowedActions.includes(input.proposedAction) || graph.brakes.silenceTriggers?.includes(input.proposedAction)))) {
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
  let edges = graph.edges;
  if (graph.shape === "router") {
    const start = graph.nodes.find((node) => incoming(graph, node.id).length === 0);
    if (!start) return [];
    const branches = outgoing(graph, start.id);
    const matches = branches.filter((edge) => edge.when && facts[edge.when.field] === edge.when.equals);
    const chosen = matches.length === 1 ? matches[0] :
      matches.length === 0 ? branches.find((edge) => !edge.when) : undefined;
    if (!chosen) return [];
    edges = graph.edges.filter((edge) => edge.from !== start.id || edge === chosen);
  }
  const allIncoming = new Set(graph.edges.map((edge) => edge.to));
  const outgoingEdges = new Map<string, LoopEdge[]>();
  for (const edge of edges) {
    if (!outgoingEdges.has(edge.from)) outgoingEdges.set(edge.from, []);
    outgoingEdges.get(edge.from)!.push(edge);
  }
  const active = new Set<string>();
  const queue = graph.nodes.filter((node) => !allIncoming.has(node.id)).map((node) => node.id);
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const id = queue[cursor];
    if (active.has(id)) continue;
    active.add(id);
    for (const edge of outgoingEdges.get(id) ?? []) queue.push(edge.to);
  }
  const degrees = new Map([...active].map((id) => [id, 0]));
  for (const edge of edges) {
    if (active.has(edge.from) && active.has(edge.to)) degrees.set(edge.to, degrees.get(edge.to)! + 1);
  }
  const route = graph.nodes.filter((node) => degrees.get(node.id) === 0).map((node) => node.id);
  for (let cursor = 0; cursor < route.length; cursor++) {
    for (const edge of outgoingEdges.get(route[cursor]) ?? []) {
      if (!active.has(edge.to)) continue;
      const remaining = degrees.get(edge.to)! - 1;
      degrees.set(edge.to, remaining);
      if (remaining === 0) route.push(edge.to);
    }
  }
  if (route.length !== active.size) return [];

  return route;
}

export function evaluateLoopGraph(graph: LoopGraph, input: LoopEvaluationInput): LoopEvaluation {
  // Conservative admission assessment, not an incremental recorder dry-run.
  // Exhausted budgets halt even if a subsequent recorder step would cost zero.
  const compiled = compileLoopGraph(graph);
  if (!compiled.ok) return { ok: false, halted: false, route: [], costUnits: 0, issues: compiled.issues };
  if (!input || !input.facts || typeof input.facts !== "object" ||
    Array.isArray(input.facts) || (input.executed !== undefined && (!Array.isArray(input.executed) ||
      input.executed.some((id) => typeof id !== "string"))) ||
    (input.facts.emptyRounds !== undefined && (!Number.isSafeInteger(input.facts.emptyRounds) || Number(input.facts.emptyRounds) < 0)) ||
    !Number.isSafeInteger(input.turnsUsed) || input.turnsUsed < 0 ||
    !Number.isFinite(input.costUsed) || input.costUsed < 0) {
    return { ok: false, halted: false, route: [], costUnits: 0, issues: ["invalid evaluation input"] };
  }
  const issues = [...compiled.issues];
  const haltReason = compiled.ok ? brakeHalt(graph, input) : undefined;
  const route = haltReason || !compiled.ok ? [] : routeGraph(graph, input.facts);
  if (compiled.ok && !haltReason && route.length === 0) issues.push("route has no unique matching branch or default");
  const indexedNodes = nodeById(graph);
  const costUnits = route.reduce((sum, id) => sum + (indexedNodes.get(id)?.costUnits ?? 0), 0);

  if (input.verifierActorId && input.verifierActorId === input.actorId) {
    issues.push("supervisor must differ from executor; same-actor verification is rejected");
  }

  issues.push(...capacityIssues(compiled, input.facts));

  if (graph.brakes.requireWriteback && !haltReason) {
    const executed = input.executed ?? route;
    const writebacks = new Set(
      Array.isArray(input.facts.writebacks) ? input.facts.writebacks.map(String) : [],
    );
    const missing = executed.filter((id) => !writebacks.has(id));
    if (missing.length > 0) {
      issues.push(`write-back required for executed nodes: ${missing.join(", ")}`);
    }
    issues.push(...gistIssues(input, executed));
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
  return features.some((feature) => feature.required) && features.every((feature) => !feature.required || feature.status === "passing");
}
