import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { RuntimeBridge, WORKER_PROTOCOL, createHttpWorkerRuntime, createMcpWorkerRuntime,
  parseWorkerRequest, parseWorkerResponse, type WorkerRequest, type WorkerRuntime } from "../src/runtime-bridge/index.js";

function request(taskId = "task-1", agent = "builder"): WorkerRequest {
  return { protocol: WORKER_PROTOCOL, taskId, agent, input: "Build a portable team", context: {} };
}
function completed(taskId: string, output = "done") {
  return { protocol: WORKER_PROTOCOL, taskId, status: "completed", output };
}
function setup(runtime: WorkerRuntime = { id: "local", invoke: async r => completed(r.taskId) }, overrides = {}) {
  return new RuntimeBridge({ runtimes: [runtime], routes: { builder: runtime.id },
    maxConcurrency: 2, maxRuns: 10, timeoutMs: 1000, ...overrides });
}

test("routes heterogeneous workers and integrates with AgentExecutor", async () => {
  const bridge = new RuntimeBridge({
    runtimes: [ { id: "sdk", invoke: async r => completed(r.taskId, "sdk result") },
      createMcpWorkerRuntime({ id: "mcp", tool: "review", resultMode: "text", callTool: async () => ({ content: [{ type: "text", text: "mcp result" }] }) }) ],
    routes: { builder: "sdk", reviewer: "mcp" }, maxConcurrency: 2, maxRuns: 2, timeoutMs: 1000,
  });
  assert.deepEqual(await Promise.all([bridge.asExecutor()("builder", "Build", {}),
    bridge.asExecutor()("reviewer", "Review", {})]), ["sdk result", "mcp result"]);
  assert.equal(bridge.snapshot().remainingSubmissions, 0);
});

test("unknown agent, malformed request, and pre-abort never dispatch", async () => {
  let calls = 0;
  const bridge = setup({ id: "worker", invoke: async r => { calls++; return completed(r.taskId); } });
  await assert.rejects(bridge.run(request("one", "unknown")), /route/);
  await assert.rejects(bridge.run({ ...request(), protocol: "a2a" }), /Invalid/);
  await assert.rejects(bridge.run(request(), AbortSignal.abort()), /aborted/);
  assert.equal(calls, 0);
  assert.equal(bridge.snapshot().submitted, 0);
});

test("filters context and copies bootstrap bindings", async () => {
  const routes = { builder: "worker" };
  const runtime: WorkerRuntime = { id: "worker", invoke: async r => completed(r.taskId, JSON.stringify(r.context)) };
  const bridge = setup(runtime, { routes, contextKeys: ["project"] });
  routes.builder = "hijack";
  runtime.invoke = async () => { throw new Error("hijacked"); };
  const result = await bridge.run({ ...request(), context: { project: "demo", recalledMemories: ["private"] } });
  assert.equal(result.output, '{"project":"demo"}');
  assert.ok(!JSON.stringify(bridge.snapshot()).includes("demo"));
  assert.ok(!JSON.stringify(bridge.snapshot()).includes("private"));
});

test("same task deduplicates concurrent calls and protects stored receipt", async () => {
  let calls = 0;
  const bridge = setup({ id: "worker", invoke: async r => { calls++; return completed(r.taskId); } });
  const [a, b] = await Promise.all([bridge.run(request()), bridge.run(request())]);
  a.output = "tampered";
  assert.equal(b.output, "done");
  assert.equal((await bridge.run(request())).output, "done");
  assert.equal(calls, 1);
  await assert.rejects(bridge.run({ ...request(), input: "Different" }), /another payload/);
});

test("enforces both concurrent and lifetime submission ceilings", async () => {
  let finish!: (value: unknown) => void;
  const bridge = setup({ id: "worker", invoke: () => new Promise(resolve => { finish = resolve; }) },
    { maxConcurrency: 1, maxRuns: 1 });
  const first = bridge.run(request());
  await assert.rejects(bridge.run(request("second")), /ceiling/);
  await new Promise(resolve => setImmediate(resolve));
  finish(completed("task-1"));
  await first;
  await assert.rejects(bridge.run(request("third")), /ceiling/);
  const concurrent = setup({ id: "worker", invoke: () => new Promise(resolve => { finish = resolve; }) }, { maxConcurrency: 1 });
  const active = concurrent.run(request());
  await assert.rejects(concurrent.run(request("second")), /capacity/);
  finish(completed("task-1"));
  await active;
});

test("timeout pauses runtime and never retries even when transport ignores abort", async () => {
  let calls = 0;
  const bridge = setup({ id: "worker", invoke: async () => { calls++; return new Promise(() => {}); } }, { timeoutMs: 15 });
  const result = await bridge.run(request());
  assert.equal(result.status, "unknown");
  assert.equal(result.errorCode, "timeout");
  assert.deepEqual(bridge.snapshot().pausedRuntimes, ["worker"]);
  await assert.rejects(bridge.run(request("next")), /paused/);
  assert.equal((await bridge.run(request())).status, "unknown");
  assert.equal(calls, 1);
});

test("unknown remote work retains global capacity even on another route", async () => {
  let calls = 0;
  const bridge = new RuntimeBridge({ runtimes: [
    { id: "lost", invoke: async () => new Promise(() => {}) },
    { id: "other", invoke: async r => { calls++; return completed(r.taskId); } },
  ], routes: { builder: "lost", reviewer: "other" }, maxConcurrency: 1, maxRuns: 3, timeoutMs: 10 });
  assert.equal((await bridge.run(request())).status, "unknown");
  await assert.rejects(bridge.run(request("second", "reviewer")), /capacity/);
  assert.equal(calls, 0);
  assert.equal(bridge.snapshot().activeCalls, 0);
  assert.equal(bridge.snapshot().reservedCalls, 1);
});

test("JSON object key order does not change the identity of a duplicate task", async () => {
  let calls = 0;
  const bridge = setup({ id: "worker", invoke: async r => { calls++; return completed(r.taskId); } });
  const first = { ...request(), context: { a: 1, nested: { x: true, y: false } } };
  const second = { context: { nested: { y: false, x: true }, a: 1 }, input: first.input,
    agent: first.agent, taskId: first.taskId, protocol: first.protocol };
  assert.equal((await bridge.run(first)).status, "completed");
  assert.equal((await bridge.run(second)).status, "completed");
  assert.equal(calls, 1);
});

test("caller cancellation reaches runtime without claiming remote cancellation", async () => {
  let received: AbortSignal | undefined;
  const bridge = setup({ id: "worker", invoke: async (_r, signal) => { received = signal; return new Promise(() => {}); } });
  const controller = new AbortController();
  const running = bridge.run(request(), controller.signal);
  await new Promise(resolve => setImmediate(resolve));
  controller.abort();
  const result = await running;
  assert.equal(result.status, "unknown");
  assert.equal(result.errorCode, "aborted");
  assert.equal(received?.aborted, true);
});

test("transport errors are redacted and isolated to one runtime", async () => {
  const bridge = new RuntimeBridge({ runtimes: [
    { id: "bad", invoke: async () => { throw new Error("Bearer secret-value"); } },
    { id: "good", invoke: async r => completed(r.taskId) },
  ], routes: { builder: "bad", reviewer: "good" }, maxConcurrency: 2, maxRuns: 4, timeoutMs: 1000 });
  const result = await bridge.run(request());
  assert.equal(result.errorCode, "transport-error");
  assert.ok(!JSON.stringify(result).includes("secret-value"));
  assert.equal((await bridge.run(request("two", "reviewer"))).status, "completed");
});

for (const [name, response] of [
  ["wrong identity", completed("other")],
  ["unknown status", { ...completed("task-1"), status: "working" }],
  ["extra fields", { ...completed("task-1"), approved: true }],
  ["missing output", { protocol: WORKER_PROTOCOL, taskId: "task-1", status: "completed" }],
  ["oversized output", completed("task-1", "x".repeat(65_536))],
] as const) {
  test(`rejects ${name} and pauses the route`, async () => {
    const bridge = setup({ id: "worker", invoke: async () => response });
    assert.equal((await bridge.run(request())).errorCode, "invalid-response");
    assert.deepEqual(bridge.snapshot().pausedRuntimes, ["worker"]);
  });
}

test("explicit worker failure remains a failure and never leaks provider error text", async () => {
  const bridge = setup({ id: "worker", invoke: async r => ({ protocol: WORKER_PROTOCOL,
    taskId: r.taskId, status: "failed", error: "provider secret" }) });
  assert.equal((await bridge.run(request())).status, "failed");
  assert.deepEqual(bridge.snapshot().pausedRuntimes, []);
  await assert.rejects(bridge.asExecutor()("builder", "Do work", {}), /worker-failed/);
  assert.ok(!JSON.stringify(bridge.snapshot()).includes("provider secret"));
});

test("rejects non-JSON, cyclic, extra, deep, and oversized request data", () => {
  const cycle: Record<string, unknown> = {}; cycle.self = cycle;
  for (const context of [cycle, { number: NaN }, { date: new Date() }, { fn: () => {} }, { text: "x".repeat(65_536) }]) {
    assert.throws(() => parseWorkerRequest({ ...request(), context }));
  }
  assert.throws(() => parseWorkerRequest({ ...request(), approved: true }));
  assert.throws(() => parseWorkerResponse({ ...completed("task-1"), output: 123 }, "task-1"));
});

for (const value of [0, -1, 1.1, NaN, Infinity, 100_000_000]) {
  test(`rejects invalid limits: ${value}`, () => {
    for (const key of ["maxRuns", "maxConcurrency", "timeoutMs"]) assert.throws(() => setup(undefined, { [key]: value }));
  });
}

test("MCP binds tool name, checks errors, and accepts structured identity-bound results", async () => {
  let called = "";
  const runtime = createMcpWorkerRuntime({ id: "mcp", tool: "fixed_tool", callTool: async params => {
    called = params.name;
    return { structuredContent: completed(params.arguments.taskId as string, "structured") };
  } });
  assert.equal((await setup(runtime).run(request())).output, "structured");
  assert.equal(called, "fixed_tool");
  const bad = createMcpWorkerRuntime({ id: "mcp", tool: "fixed_tool", callTool: async () => ({ isError: true, content: [] }) });
  assert.equal((await setup(bad).run(request())).status, "failed");
  const malformed = createMcpWorkerRuntime({ id: "mcp", tool: "fixed_tool", callTool: async () => ({ content: [{ type: "image", data: "x" }] }) });
  assert.equal((await setup(malformed).run(request())).status, "unknown");
  const queued = createMcpWorkerRuntime({ id: "mcp", tool: "fixed_tool", resultMode: "text",
    callTool: async () => ({ task: { taskId: "remote", status: "working" }, content: [{ type: "text", text: "queued" }] }) });
  assert.equal((await setup(queued).run(request())).status, "unknown");
  const plain = createMcpWorkerRuntime({ id: "mcp", tool: "fixed_tool",
    callTool: async () => ({ content: [{ type: "text", text: "queued" }] }) });
  assert.equal((await setup(plain).run(request())).status, "unknown");
});

test("MCP passes a validated snapshot and denies malformed arguments before the host call", async () => {
  const original = { source: { value: "owned" } };
  const worker = createMcpWorkerRuntime({ id: "mcp", tool: "fixed_tool", mapArguments: () => original,
    callTool: async params => {
      assert.notEqual(params.arguments, original);
      assert.notEqual(params.arguments.source, original.source);
      original.source.value = "changed";
      assert.equal((params.arguments.source as { value: string }).value, "owned");
      return { structuredContent: completed("task-1", "artifact") };
    } });
  assert.equal((await setup(worker).run(request())).status, "completed");
  const cyclic: Record<string, unknown> = {}; cyclic.self = cyclic;
  for (const args of [{ n: NaN }, cyclic, { text: "x".repeat(65536) }]) {
    let called = false;
    const bad = createMcpWorkerRuntime({ id: "mcp", tool: "fixed_tool", mapArguments: () => args,
      callTool: async () => { called = true; return {}; } });
    assert.equal((await setup(bad).run(request())).status, "unknown");
    assert.equal(called, false);
  }
});

test("HTTP rejects unsafe endpoint configuration", () => {
  for (const endpoint of ["http://example.com/run", "file:///tmp/worker", "https://user:pass@example.com", "https://example.com/run?token=x", "https://example.com/#x"]) {
    assert.throws(() => createHttpWorkerRuntime({ id: "http", endpoint }));
  }
  assert.throws(() => createHttpWorkerRuntime({ id: "http", endpoint: "http://127.0.0.1/run" }));
});

test("real HTTP transport round trip, body cap, content type, and redirect refusal", async () => {
  let hits = 0;
  const server = createServer(async (req, res) => {
    hits++;
    if (req.url === "/redirect") { res.writeHead(307, { location: "/invoke" }); res.end(); return; }
    if (req.url === "/html") { res.setHeader("content-type", "text/html"); res.end("no"); return; }
    res.setHeader("content-type", "application/json");
    if (req.url === "/huge") { res.end('"' + "x".repeat(70_000) + '"'); return; }
    let data = ""; for await (const chunk of req) data += chunk;
    const body = JSON.parse(data);
    res.end(JSON.stringify(completed(body.taskId, body.input)));
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const address = server.address(); assert.ok(address && typeof address === "object");
    const runtime = (path: string) => createHttpWorkerRuntime({ id: "http", endpoint: `http://127.0.0.1:${address.port}/${path}`, allowLoopbackHttp: true });
    assert.equal((await setup(runtime("invoke")).run(request())).output, request().input);
    for (const path of ["redirect", "html", "huge"]) assert.equal((await setup(runtime(path)).run(request())).status, "unknown");
    assert.equal(hits, 4); // A redirect must not cause a fifth request.
  } finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});
