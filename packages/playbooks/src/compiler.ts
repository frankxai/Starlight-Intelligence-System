import { PLAYBOOK_SCHEMA, PLAN_SCHEMA, PlaybookError, assert, boundedArray, digest, freeze, identifier, integer, object, parseJson, sha256 } from './manifest.js';
import type { Bindings, CallLimits, CompiledPlan, Flow, Guard, PlanLimits, PlanNode, Playbook, ResourceKind, ResourcePin } from './manifest.js';

const compiledPlans = new WeakSet<object>();
/** Internal identity check: restored plans must be recompiled from the manifest. */
export function isCompiledPlan(value: unknown): value is CompiledPlan {
  return value !== null && typeof value === 'object' && compiledPlans.has(value);
}

function exactVersion(value: unknown): asserts value is string {
  assert(typeof value === 'string' && /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[a-z0-9][a-z0-9.-]*)?$/.test(value) && value.length <= 64, 'unpinned_version', 'Resource and playbook versions must be exact semantic versions.');
}
function callLimits(value: unknown): CallLimits {
  const item = object(value, ['modelCalls', 'toolCalls']);
  integer(item.modelCalls, 0, 64); integer(item.toolCalls, 0, 256);
  return { modelCalls: item.modelCalls, toolCalls: item.toolCalls };
}

export function parsePlaybook(source: string): Playbook {
  const root = object(parseJson(source, 131072), ['schema', 'id', 'version', 'title', 'resources', 'limits', 'flow']);
  assert(root.schema === PLAYBOOK_SCHEMA, 'invalid_schema', 'Unsupported playbook schema.');
  identifier(root.id); exactVersion(root.version);
  assert(typeof root.title === 'string' && root.title.trim().length > 0 && root.title.length <= 200, 'invalid_title', 'A bounded title is required.');
  boundedArray(root.resources, 128, 1);
  const resources = new Map<string, ResourcePin>();
  for (const raw of root.resources) {
    const pin = object(raw, ['id', 'kind', 'version', 'sha256', 'uri']);
    identifier(pin.id); exactVersion(pin.version); digest(pin.sha256);
    assert(typeof pin.kind === 'string' && ['skill', 'tool', 'model', 'memory', 'schema'].includes(pin.kind), 'invalid_resource', 'Unsupported resource kind.');
    assert(typeof pin.uri === 'string' && pin.uri.length <= 512 && /^(?:https:\/\/[^\s?#]+|registry:[a-z0-9][a-z0-9/._-]*)$/.test(pin.uri), 'invalid_resource', 'Resource URI must be HTTPS or a registry reference.');
    if (pin.uri.startsWith('https:')) {
      let url: URL;
      try { url = new URL(pin.uri); } catch { throw new PlaybookError('invalid_resource', 'Invalid resource URL.'); }
      assert(!url.username && !url.password && Boolean(url.hostname), 'invalid_resource', 'Resource references must not embed credentials.');
    }
    assert(!resources.has(pin.id), 'duplicate_id', 'Resource identifiers must be unique.');
    resources.set(pin.id, pin as unknown as ResourcePin);
  }
  const limits = object(root.limits, ['maxNodes', 'maxParallel', 'modelCalls', 'toolCalls']);
  integer(limits.maxNodes, 1, 128); integer(limits.maxParallel, 1, 8);
  integer(limits.modelCalls, 0, 256); integer(limits.toolCalls, 0, 1024);
  const ids = new Set<string>();
  let flows = 0;
  function binding(value: unknown): Bindings {
    const bound = object(value, ['skill', 'outputSchema', 'model', 'tools', 'memory'], ['skill', 'outputSchema', 'tools', 'memory']);
    const ref = (id: unknown, kind: ResourceKind) => {
      identifier(id); assert(resources.get(id)?.kind === kind, 'missing_resource', 'A capability reference is missing or has the wrong kind.');
    };
    ref(bound.skill, 'skill'); ref(bound.outputSchema, 'schema');
    if (bound.model !== undefined) ref(bound.model, 'model');
    boundedArray(bound.tools, 16); bound.tools.forEach((id) => ref(id, 'tool'));
    assert(new Set(bound.tools).size === bound.tools.length, 'duplicate_ref', 'Tool references must be unique.');
    boundedArray(bound.memory, 16); const memoryIds = new Set<string>();
    for (const raw of bound.memory) {
      const memory = object(raw, ['resource', 'purpose']); ref(memory.resource, 'memory'); identifier(memory.purpose);
      assert(!memoryIds.has(String(memory.resource)), 'duplicate_ref', 'Memory references must be unique.'); memoryIds.add(String(memory.resource));
    }
    return bound as unknown as Bindings;
  }
  function flow(value: unknown, depth: number): Flow {
    assert(depth <= 16 && ++flows <= 128, 'graph_too_large', 'Playbook nesting or flow count exceeds the bound.');
    const head = value as Record<string, unknown>;
    assert(head !== null && typeof head === 'object' && !Array.isArray(head), 'invalid_shape', 'Flow must be an object.');
    const kind = head.kind;
    const fields = kind === 'sequence' ? ['kind', 'id', 'steps'] : kind === 'parallel' ? ['kind', 'id', 'branches'] : kind === 'approval' ? ['kind', 'id', 'subject'] : kind === 'router' ? ['kind', 'id', 'bindings', 'limits', 'cases'] : kind === 'evaluator' ? ['kind', 'id', 'bindings', 'limits', 'subject'] : ['kind', 'id', 'bindings', 'limits'];
    const node = object(value, fields);
    assert(typeof kind === 'string' && ['sequence', 'parallel', 'approval', 'router', 'evaluator', 'task'].includes(kind), 'invalid_pattern', 'Unsupported orchestration pattern.');
    identifier(node.id); assert(!ids.has(node.id), 'duplicate_id', 'Every flow identifier must be unique.'); ids.add(node.id);
    if (kind === 'sequence' || kind === 'parallel') {
      const children = kind === 'sequence' ? node.steps : node.branches;
      boundedArray(children, 32, 1); children.forEach((child) => flow(child, depth + 1));
    } else if (kind === 'approval') identifier(node.subject);
    else {
      const bindings = binding(node.bindings); const calls = callLimits(node.limits);
      assert(Boolean(bindings.model) === (calls.modelCalls > 0), 'invalid_limit', 'Model binding and positive call bound must agree.');
      assert((bindings.tools.length > 0) === (calls.toolCalls > 0), 'invalid_limit', 'Tool bindings and positive call bound must agree.');
      if (kind === 'evaluator') identifier(node.subject);
      if (kind === 'router') {
        boundedArray(node.cases, 16, 2); const routes = new Set<string>();
        for (const branch of node.cases) {
          const item = object(branch, ['value', 'flow']); identifier(item.value);
          assert(!routes.has(item.value), 'duplicate_route', 'Router values must be unique.'); routes.add(item.value);
          flow(item.flow, depth + 1);
        }
      }
    }
    return node as unknown as Flow;
  }
  flow(root.flow, 0);
  return freeze(root as unknown as Playbook);
}

/** No effects. The returned digest commits to every node, bound and resource pin. */
export async function compilePlaybook(source: string): Promise<CompiledPlan> {
  const manifest = parsePlaybook(source);
  const nodes: PlanNode[] = [];
  const index = new Map<string, PlanNode>();
  function add(node: PlanNode): string[] {
    assert(nodes.length < manifest.limits.maxNodes, 'graph_too_large', 'Compiled graph exceeds maxNodes.');
    assert(node.dependsOn.every((id) => index.has(id)), 'invalid_dependency', 'Dependencies must be earlier nodes.');
    nodes.push(node); index.set(node.id, node); return [node.id];
  }
  function isAncestor(subject: string, dependencies: string[]): boolean {
    const seen = new Set<string>(); const pending = [...dependencies];
    while (pending.length) {
      const id = pending.pop()!; if (id === subject) return true;
      if (!seen.has(id)) { seen.add(id); pending.push(...(index.get(id)?.dependsOn ?? [])); }
    }
    return false;
  }
  function visit(flow: Flow, dependencies: string[], guards: Guard[]): string[] {
    if (flow.kind === 'sequence') return flow.steps.reduce((deps, child) => visit(child, deps, guards), dependencies);
    if (flow.kind === 'parallel') {
      const ends = flow.branches.flatMap((child) => visit(child, dependencies, guards));
      return add({ id: `join.${flow.id}`, kind: 'join', dependsOn: ends, guards });
    }
    const node: PlanNode = { id: flow.id, kind: flow.kind, dependsOn: dependencies, guards };
    if (flow.kind !== 'approval') { node.bindings = flow.bindings; node.limits = flow.limits; }
    if (flow.kind === 'approval' || flow.kind === 'evaluator') {
      const subject = index.get(flow.subject);
      assert(subject && ['task', 'router', 'evaluator'].includes(subject.kind) && isAncestor(flow.subject, dependencies), 'invalid_subject', 'Review subject must be an earlier output dependency.');
      assert(subject.guards.every((guard) => guards.some((own) => own.routerId === guard.routerId && own.value === guard.value)), 'conditional_subject', 'A review cannot depend on a potentially skipped subject.');
      node.subject = flow.subject;
    }
    if (flow.kind === 'router') node.routes = flow.cases.map((branch) => branch.value);
    const end = add(node);
    if (flow.kind !== 'router') return end;
    const ends = flow.cases.flatMap((branch) => visit(branch.flow, end, [...guards, { routerId: flow.id, value: branch.value }]));
    return add({ id: `join.${flow.id}`, kind: 'join', dependsOn: ends, guards });
  }
  visit(manifest.flow, [], []);
  const worstCaseCalls = nodes.reduce((sum, node) => ({ modelCalls: sum.modelCalls + (node.limits?.modelCalls ?? 0), toolCalls: sum.toolCalls + (node.limits?.toolCalls ?? 0) }), { modelCalls: 0, toolCalls: 0 });
  assert(worstCaseCalls.modelCalls <= manifest.limits.modelCalls && worstCaseCalls.toolCalls <= manifest.limits.toolCalls, 'budget_exceeded', 'Worst-case declared calls exceed playbook bounds.');
  const body = freeze({ schema: PLAN_SCHEMA, playbookId: manifest.id, playbookVersion: manifest.version, title: manifest.title, resources: [...manifest.resources].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0), limits: manifest.limits as PlanLimits, worstCaseCalls, nodes });
  const plan = freeze({ ...body, digest: await sha256(body) });
  compiledPlans.add(plan);
  return plan;
}
