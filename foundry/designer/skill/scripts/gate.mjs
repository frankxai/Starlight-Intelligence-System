// In-process reference only. Trusted host owns contracts, registry and request IDs.
// Production needs authenticated policy, persistent atomic budgets and adapters.
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { assertReferenceContract } from './contract.mjs';

function frozenJson(value) {
  const seen = new Set();
  function check(v) {
    if (v === null || typeof v === 'string' || typeof v === 'boolean') return;
    if (typeof v === 'number' && Number.isFinite(v)) return;
    if (typeof v !== 'object' || seen.has(v)) throw new Error('Input must be finite acyclic JSON data.');
    if (!Array.isArray(v) && Object.getPrototypeOf(v) !== Object.prototype) throw new Error('Input must contain plain JSON objects.');
    seen.add(v);
    Object.values(v).forEach(check);
    seen.delete(v);
  }
  check(value);
  const copy = JSON.parse(JSON.stringify(value));
  function freeze(v) {
    if (v && typeof v === 'object') { Object.values(v).forEach(freeze); Object.freeze(v); }
    return v;
  }
  return freeze(copy);
}

const INTERNAL = Symbol('trusted delegate constructor');

export class ReferenceGate {
  #contract; #registry; #root; #scope;

  constructor(contract, registry, internal) {
    this.#contract = frozenJson(contract);
    assertReferenceContract(this.#contract);
    if (internal?.token === INTERNAL) {
      this.#registry = internal.registry;
      this.#root = internal.root;
      this.#scope = internal.scope;
      return;
    }
    this.#registry = new Map();
    for (const tool of this.#contract.tools) {
      const descriptor = registry[tool.name];
      if (!descriptor || descriptor.effect !== tool.effect || !Number.isSafeInteger(descriptor.maxCostMicros) || descriptor.maxCostMicros < 0 || typeof descriptor.validate !== 'function' || typeof descriptor.execute !== 'function') throw new Error(`Untrusted or incomplete tool descriptor: ${tool.name}`);
      this.#registry.set(tool.name, Object.freeze({ effect: descriptor.effect, maxCostMicros: descriptor.maxCostMicros, validate: descriptor.validate, execute: descriptor.execute }));
    }
    this.#root = { started: performance.now(), calls: 0, costMicros: 0, delegates: 0, ids: new Set(), receipts: [], abort: new AbortController(), contractSha256: createHash('sha256').update(JSON.stringify(this.#contract)).digest('hex') };
    this.#scope = new Map(this.#contract.tools.map(t => [t.name, new Set(t.resources)]));
  }

  revoke() { this.#root.abort.abort('mandate revoked'); }

  #active() {
    if (this.#root.abort.signal.aborted) throw new Error('Mandate revoked.');
    if (performance.now() - this.#root.started >= this.#contract.budget.maxElapsedMs) { this.revoke(); throw new Error('Root deadline exceeded.'); }
  }

  delegate(scope) {
    this.#active();
    const copy = frozenJson(scope);
    if (!copy || Array.isArray(copy) || typeof copy !== 'object' || !Object.keys(copy).length) throw new Error('Delegate requires a nonempty exact scope.');
    const narrowed = new Map();
    for (const [name, resources] of Object.entries(copy)) {
      if (!this.#scope.has(name) || !Array.isArray(resources) || !resources.length || resources.some(r => !this.#scope.get(name).has(r))) throw new Error('Delegation cannot expand tool/resource scope.');
      narrowed.set(name, new Set(resources));
    }
    if (this.#root.delegates >= this.#contract.budget.maxDelegates) throw new Error('Root delegate budget exhausted.');
    this.#root.delegates++;
    return new ReferenceGate(this.#contract, null, { token: INTERNAL, root: this.#root, registry: this.#registry, scope: narrowed });
  }

  snapshot() {
    return frozenJson({ calls: this.#root.calls, costMicros: this.#root.costMicros, delegates: this.#root.delegates, revoked: this.#root.abort.signal.aborted, receipts: this.#root.receipts });
  }

  async execute(request) {
    this.#active();
    const action = frozenJson(request);
    if (!action || Array.isArray(action) || typeof action !== 'object' || Object.keys(action).sort().join(',') !== 'id,input,resource,tool' || typeof action.id !== 'string' || !action.id.trim() || typeof action.resource !== 'string' || typeof action.tool !== 'string') throw new Error('Malformed action request.');
    const descriptor = this.#registry.get(action.tool);
    if (!descriptor || !this.#scope.get(action.tool)?.has(action.resource)) throw new Error('Tool/resource outside mandate.');
    if (descriptor.validate(action.input, action.resource) !== true) throw new Error('Tool input rejected.');
    this.#active();
    if (this.#root.ids.has(action.id)) throw new Error('Duplicate request blocked; reconcile its existing receipt.');
    if (this.#root.calls >= this.#contract.budget.maxCalls || this.#root.costMicros + descriptor.maxCostMicros > this.#contract.budget.maxCostMicros) throw new Error('Shared root budget exhausted.');
    // Synchronous reservation precedes every effect, including retries/delegates.
    this.#root.ids.add(action.id);
    this.#root.calls++;
    this.#root.costMicros += descriptor.maxCostMicros;
    const receipt = { id: action.id, contractId: this.#contract.id, contractSha256: this.#root.contractSha256, tool: action.tool, resource: action.resource, inputSha256: createHash('sha256').update(JSON.stringify(action.input)).digest('hex'), reservedCostMicros: descriptor.maxCostMicros, status: 'pending' };
    this.#root.receipts.push(receipt);
    const remaining = this.#contract.budget.maxElapsedMs - (performance.now() - this.#root.started);
    const timer = setTimeout(() => this.revoke(), Math.max(1, remaining));
    try {
      const result = await descriptor.execute(action.input, { resource: action.resource, signal: this.#root.abort.signal });
      this.#active();
      const copy = frozenJson(result);
      receipt.status = 'completed';
      return copy;
    } catch (error) {
      receipt.status = this.#root.abort.signal.aborted ? 'aborted' : 'failed';
      throw error;
    } finally { clearTimeout(timer); }
  }
}
