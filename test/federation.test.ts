import { test } from "node:test";
import assert from "node:assert/strict";
import { AgentFederation, createFederationTool, type FederationWorker } from "../src/federation.js";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const task = (id: string) => ({ id, capability: "analyze", prompt: `Analyze ${id}` });
const worker = (overrides: Partial<FederationWorker> = {}): FederationWorker => ({
  id: "local", transport: "custom", capabilities: ["analyze"],
  runner: async input => ({ output: input.prompt, exitCode: 0 }), ...overrides,
});

test("plans the complete batch without invoking workers and rejects ambiguous routes", async () => {
  let calls = 0;
  const federation = new AgentFederation([worker({ runner: async () => { calls++; return { output: "ok", exitCode: 0 }; } })]);
  assert.deepEqual(federation.plan([task("one")]), [{ taskId: "one", workerId: "local", capability: "analyze", transport: "custom" }]);
  await assert.rejects(federation.run([task("one"), { ...task("two"), capability: "unknown" }]), /exactly one/);
  assert.equal(calls, 0);
  const ambiguous = new AgentFederation([worker(), worker({ id: "second" })]);
  assert.throws(() => ambiguous.plan([task("one")]), /found 2/);
  assert.equal(ambiguous.plan([{ ...task("one"), workerId: "second" }])[0].workerId, "second");
  assert.throws(() => ambiguous.plan([{ ...task("one"), workerId: "missing" }]), /found 0/);
});

test("bounds concurrency, isolates failures, and preserves input order", async () => {
  let active = 0;
  let peak = 0;
  const federation = new AgentFederation([worker({ runner: async input => {
    active++; peak = Math.max(peak, active);
    try {
      await delay(input.id === "one" ? 20 : 2);
      if (input.id === "two") throw new Error("fixture failure");
      return { output: input.id, exitCode: 0 };
    } finally { active--; }
  } })], { concurrency: 2 });
  const result = await federation.run([task("one"), task("two"), task("three")]);
  assert.equal(peak, 2);
  assert.equal(result.succeeded, 2);
  assert.equal(result.failed, 1);
  assert.deepEqual(result.results.map(item => item.id), ["one", "two", "three"]);
  assert.equal(result.results[1].error, "fixture failure");
  assert.equal(result.results[2].route.workerId, "local");
  assert.match(result.runId, /^[\da-f-]{36}$/);
});

test("deadlines return even when a provider ignores cancellation", { timeout: 1500 }, async () => {
  let aborted = false;
  const federation = new AgentFederation([worker({ runner: async (_, signal) => {
    signal.addEventListener("abort", () => { aborted = true; });
    return new Promise(() => undefined);
  } })], { timeoutMs: 25 });
  const result = await federation.run([task("one")]);
  assert.equal(aborted, true);
  assert.equal(result.failed, 1);
  assert.match(result.results[0].error!, /timed out/);
});

test("external cancellation prevents queued dispatch", async () => {
  let calls = 0;
  const controller = new AbortController();
  const federation = new AgentFederation([worker({ runner: async () => {
    calls++;
    controller.abort();
    return new Promise(() => undefined);
  } })], { concurrency: 1 });
  const result = await federation.run([task("one"), task("two")], { signal: controller.signal });
  assert.equal(calls, 1);
  assert.equal(result.failed, 2);
  assert.match(result.results[1].error!, /cancelled/);
});

test("validates limits, identifiers, prompts and duplicate work before execution", async () => {
  for (const concurrency of [NaN, Infinity, 0, 1.5, 33]) {
    assert.throws(() => new AgentFederation([worker()], { concurrency }), /integer/);
  }
  assert.throws(() => new AgentFederation([worker(), worker()]), /duplicate worker/);
  const federation = new AgentFederation([worker()], { maxTasks: 1, maxPromptBytes: 4 });
  assert.throws(() => federation.plan([task("one"), task("two")]), /Task limit/);
  assert.throws(() => federation.plan([{ ...task("one"), prompt: "ééé" }]), /bytes/);
  assert.throws(() => federation.plan([{ ...task("one"), prompt: " " }]), /empty/);
  assert.throws(() => new AgentFederation([worker()]).plan([task("one"), task("one")]), /duplicate task/);
  assert.throws(() => new AgentFederation([worker()]).plan([{ ...task("one"), id: "not an id" }]), /Invalid/);
  assert.deepEqual((await federation.run([])).results, []);
});

test("output and exit-code contracts cannot masquerade as success", async () => {
  for (const value of [{ output: "12345", exitCode: 0 }, { output: "ok", exitCode: NaN }]) {
    const federation = new AgentFederation([worker({ runner: async () => value })], { maxOutputBytes: 4 });
    assert.equal((await federation.run([task("one")])).failed, 1);
  }
});

test("snapshots registration and forwards only explicit task input", async () => {
  const registration = worker();
  let received: unknown;
  registration.runner = async input => { received = input; return { output: "ok", exitCode: 0 }; };
  const federation = new AgentFederation([registration]);
  registration.capabilities = ["changed"];
  registration.runner = async () => { throw new Error("mutation reached runtime"); };
  const input = { ...task("one"), privateVault: "must not cross boundary" };
  const run = federation.run([input]);
  input.prompt = "changed";
  assert.equal((await run).succeeded, 1);
  assert.deepEqual(received, { id: "one", prompt: "Analyze one" });
});

test("orchestration executor uses bindings and does not forward recalled memory", async () => {
  let received: unknown;
  const federation = new AgentFederation([worker({ runner: async input => {
    received = input;
    return { output: "reviewed", exitCode: 0 };
  } })]);
  const executor = federation.asExecutor({ sentinel: { capability: "analyze" } });
  assert.equal(await executor("sentinel", "Review this", { recalledMemories: ["private"] }), "reviewed");
  assert.equal(Object.keys(received as object).length, 2);
  assert.equal((received as { prompt: string }).prompt, "Review this");
  await assert.rejects(executor("unknown", "input", {}), /No federation binding/);
});

test("MCP facade plans without effects and only runs with an explicit operation", async () => {
  let calls = 0;
  const tool = createFederationTool(new AgentFederation([worker({ runner: async () => {
    calls++; return { output: "done", exitCode: 0 };
  } })]));
  assert.equal(tool.definition.name, "sis_federate");
  assert.equal((await tool.handle({ operation: "plan", tasks: [task("one")] })).isError, false);
  assert.equal(calls, 0);
  assert.equal((await tool.handle({ tasks: [task("one")] })).isError, true);
  assert.equal((await tool.handle({ operation: "run" })).isError, true);
  const response = await tool.handle({ operation: "run", tasks: [task("one")] });
  assert.equal(JSON.parse(response.content[0].text).succeeded, 1);
  assert.equal(calls, 1);
});

test("MCP facade signals a failed batch as a tool error while preserving the results", async () => {
  const tool = createFederationTool(new AgentFederation([worker({ runner: async () => ({ output: "failure", exitCode: 1 }) })]));
  const response = await tool.handle({ operation: "run", tasks: [task("one")] });
  assert.equal(response.isError, true);
  assert.equal(JSON.parse(response.content[0].text).failed, 1);
});
