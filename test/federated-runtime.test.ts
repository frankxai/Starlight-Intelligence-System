import { test } from "node:test";
import assert from "node:assert/strict";
import { FederatedRuntime, createFederationTool, type FederationWorker } from "../src/federation.js";

const task = (id: string) => ({ id, capability: "analyze", prompt: "Analyze this" });
const worker = (runner: FederationWorker["runner"], id = "local"): FederationWorker =>
  ({ id, transport: "custom", capabilities: ["analyze"], runner });

test("preferred runtime composes routing, deduplication and prompt-free observation", async () => {
  const received: unknown[] = [];
  const runtime = new FederatedRuntime([worker(async input => {
    received.push(input); return { output: "private artifact", exitCode: 0 };
  })], { maxRuns: 2 });
  const original = task("one");
  const running = runtime.run([original]);
  original.prompt = "mutated";
  const first = await running;
  const repeated = await runtime.run([task("one")]);
  assert.equal(first.succeeded, 1);
  assert.equal("output" in repeated.results[0] && repeated.results[0].output, "private artifact");
  assert.deepEqual(received, [{ id: "one", prompt: "Analyze this" }]);
  assert.equal(runtime.snapshot().submitted, 1);
  assert.doesNotMatch(JSON.stringify(runtime.snapshot()), /Analyze this|private artifact|mutated/);
  const changed = await runtime.run([{ ...task("one"), prompt: "different" }]);
  assert.equal(changed.rejected, 1);
  assert.equal(received.length, 1);
});

test("two batches share one admission cap and report rejected work explicitly", async () => {
  let finish!: () => void;
  let calls = 0;
  const runtime = new FederatedRuntime([worker(async () => {
    calls++; await new Promise<void>(resolve => { finish = resolve; });
    return { output: "done", exitCode: 0 };
  })], { concurrency: 1, maxRuns: 3 });
  const first = runtime.run([task("one")]);
  await new Promise(resolve => setImmediate(resolve));
  const second = await runtime.run([task("two")]);
  assert.equal(second.rejected, 1);
  assert.equal(second.results[0].status, "rejected");
  assert.equal(calls, 1);
  finish();
  assert.equal((await first).succeeded, 1);
});

test("unknown outcomes block capacity and make the MCP facade return an error", async () => {
  const runtime = new FederatedRuntime([worker(async () => new Promise(() => {}))], { concurrency: 1, timeoutMs: 10 });
  const tool = createFederationTool(runtime);
  const response = await tool.handle({ operation: "run", tasks: [task("one")] });
  const result = JSON.parse(response.content[0].text);
  assert.equal(response.isError, true);
  assert.equal(result.unknown, 1);
  assert.equal(result.results[0].errorCode, "timeout");
  assert.equal(runtime.snapshot().reservedCalls, 1);
  assert.equal((await runtime.run([task("two")])).rejected, 1);
});

test("every task is validated against the outbound contract before the first effect", async () => {
  let calls = 0;
  const runtime = new FederatedRuntime([worker(async () => { calls++; return { output: "ok", exitCode: 0 }; })]);
  await assert.rejects(runtime.run([task("one"), { ...task("two"), prompt: "x".repeat(65_500) }]), /payload|bytes/);
  await assert.rejects(runtime.run([{ ...task("one"), endpoint: "https://untrusted.example" } as any]), /fields/);
  assert.equal(calls, 0);
  assert.equal(runtime.snapshot().submitted, 0);
  assert.deepEqual((await runtime.run([])).results, []);
});

test("capability changes cannot reuse a task ID on the same worker", async () => {
  const registration = worker(async () => ({ output: "ok", exitCode: 0 }));
  registration.capabilities = ["analyze", "review"];
  const runtime = new FederatedRuntime([registration]);
  await runtime.run([task("one")]);
  const result = await runtime.run([{ ...task("one"), capability: "review" }]);
  assert.equal(result.rejected, 1);
});

test("executor ignores ambient context and plan calls have no side effects", async () => {
  let received: unknown;
  const runtime = new FederatedRuntime([worker(async input => { received = input; return { output: "done", exitCode: 0 }; })]);
  assert.equal((await createFederationTool(runtime).handle({ operation: "plan", tasks: [task("one")] })).isError, false);
  assert.equal(received, undefined);
  const executor = runtime.asExecutor({ reviewer: { capability: "analyze" } });
  assert.equal(await executor("reviewer", "Explicit input", { recalledMemories: ["secret"] }), "done");
  assert.deepEqual(Object.keys(received as unknown as object), ["id", "prompt"]);
  assert.doesNotMatch(JSON.stringify(received), /secret/);
});

test("known failures, invalid replies and admission refusals remain distinct", async () => {
  const runtime = new FederatedRuntime([
    worker(async () => ({ output: "no", exitCode: 1 }), "fails"),
    worker(async () => ({ output: "ok", exitCode: null }), "invalid"),
  ], { maxRuns: 2 });
  const results = await runtime.run([
    { ...task("one"), workerId: "fails" }, { ...task("two"), workerId: "invalid" },
    { ...task("three"), workerId: "fails" },
  ]);
  assert.equal(results.failed, 1);
  assert.equal(results.unknown, 1);
  assert.equal(results.rejected, 1);
  assert.deepEqual(results.results.map(r => r.id), ["one", "two", "three"]);
});

test("host-owned admission wraps the transport and a denied task causes no effect", async () => {
  let allowed = false;
  let admissions = 0;
  let effects = 0;
  const runtime = new FederatedRuntime([worker(async () => {
    // Fixture for the existing host's admission seam; not a fleet policy implementation.
    admissions++;
    if (!allowed) return { output: "Host denied this task", exitCode: 1 };
    effects++;
    return { output: "admitted artifact", exitCode: 0 };
  })]);
  assert.equal((await runtime.run([task("denied")])).failed, 1);
  assert.equal(effects, 0);
  allowed = true;
  assert.equal((await runtime.run([task("denied")])).failed, 1, "replay cannot resubmit a previously denied task");
  assert.equal((await runtime.run([task("admitted")])).succeeded, 1);
  assert.equal(admissions, 2);
  assert.equal(effects, 1);
});
