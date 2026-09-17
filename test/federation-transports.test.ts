import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { fileURLToPath } from "node:url";
import { once, getEventListeners } from "node:events";
import { FederatedRuntime, createA2ARunner, createMcpToolRunner, createProcessRunner } from "../src/federation.js";
import { RuntimeBridge, WORKER_PROTOCOL } from "../src/runtime-bridge/index.js";
import { withAbort } from "../src/federation/boundary.js";
import type { AgentRunner } from "../src/swarm.js";

const task = { id: "test", prompt: "Review this plan" };
const signal = () => AbortSignal.timeout(2_000);
const message = (text: string) => ({ kind: "message", role: "agent", messageId: "reply", parts: [{ kind: "text", text }] });
const remoteTask = (state: string) => ({ kind: "task", id: "remote-1", contextId: "context-1", status: { state } });

if (process.env.STARLIGHT_REQUIRE_PYTHON === "1" && !process.env.STARLIGHT_TEST_PYTHON) {
  throw new Error("The declared Python integration is required but STARLIGHT_TEST_PYTHON is missing");
}

async function server(handler: (request: any) => unknown): Promise<{ endpoint: string; close: () => Promise<void>; requests: any[] }> {
  const requests: any[] = [];
  const http: Server = createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    const request = JSON.parse(Buffer.concat(chunks).toString());
    requests.push(request);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ jsonrpc: "2.0", id: request.id, result: handler(request) }));
  });
  http.listen(0, "127.0.0.1");
  await once(http, "listening");
  const address = http.address() as { port: number };
  return { endpoint: `http://127.0.0.1:${address.port}/a2a`, requests, close: () => new Promise((resolve, reject) => {
    http.close(error => error ? reject(error) : resolve());
    http.closeAllConnections();
  }) };
}

test("A2A sends the 0.3 envelope and polls the same task through HTTP", async () => {
  const remote = await server(request => request.method === "message/send" ? remoteTask("working") : {
    ...remoteTask("completed"), artifacts: [{ artifactId: "answer", parts: [{ kind: "text", text: "Verified response" }] }],
  });
  const references: unknown[] = [];
  try {
    const runner = createA2ARunner({ endpoint: remote.endpoint, allowLoopbackHttp: true, pollIntervalMs: 1, onTask: ref => { references.push(ref); } });
    assert.deepEqual(await runner(task, signal()), { output: "Verified response", exitCode: 0 });
    assert.deepEqual(remote.requests.map(item => item.method), ["message/send", "tasks/get"]);
    assert.equal(remote.requests[0].params.message.role, "user");
    assert.equal(remote.requests[0].params.message.parts[0].text, task.prompt);
    assert.equal(remote.requests[0].params.configuration.blocking, false);
    assert.deepEqual(remote.requests[1].params, { id: "remote-1", historyLength: 0 });
    assert.deepEqual(references, [{ localTaskId: "test", remoteTaskId: "remote-1", contextId: "context-1" }]);
  } finally { await remote.close(); }
});

test("A2A accepts immediate agent messages", async () => {
  const remote = await server(() => message("Direct answer"));
  try {
    const runner = createA2ARunner({ endpoint: remote.endpoint, allowLoopbackHttp: true });
    assert.equal((await runner(task, signal())).output, "Direct answer");
    assert.equal(remote.requests.length, 1);
  } finally { await remote.close(); }
});

test("A2A does not treat pending human input or missing artifacts as success", async () => {
  for (const state of ["input-required", "auth-required", "unknown", "bad-state", "completed"]) {
    const remote = await server(() => remoteTask(state));
    try {
      const runner = createA2ARunner({ endpoint: remote.endpoint, allowLoopbackHttp: true });
      await assert.rejects(runner(task, signal()), /stopped|without text/);
      assert.equal(remote.requests.length, 1);
    } finally { await remote.close(); }
  }
});

for (const state of ["failed", "canceled", "rejected"]) {
  test(`A2A terminal ${state} releases capacity so the next admitted task can run`, async () => {
    let submissions = 0;
    const remote = await server(() => ++submissions === 1
      ? { ...remoteTask(state), status: { state, message: message("private provider failure details") } }
      : message("next task completed"));
    try {
      const runtime = new FederatedRuntime([{ id: "remote", transport: "a2a-0.3", capabilities: ["review"],
        runner: createA2ARunner({ endpoint: remote.endpoint, allowLoopbackHttp: true }),
      }], { concurrency: 1, maxRuns: 2, timeoutMs: 1000 });
      const failed = await runtime.run([{ id: "first", capability: "review", prompt: "Review first" }]);
      assert.equal(failed.failed, 1);
      assert.equal(failed.unknown, 0);
      assert.equal(runtime.snapshot().remainingCapacity, 1);
      assert.deepEqual(runtime.snapshot().pausedRuntimes, []);
      assert.doesNotMatch(JSON.stringify(failed), /private provider failure details/);
      const next = await runtime.run([{ id: "next", capability: "review", prompt: "Review next" }]);
      assert.equal(next.succeeded, 1);
      assert.equal(submissions, 2);
    } finally { await remote.close(); }
  });
}

test("A2A bounds polling and never resubmits a task", async () => {
  const remote = await server(() => remoteTask("working"));
  try {
    await assert.rejects(createA2ARunner({ endpoint: remote.endpoint, allowLoopbackHttp: true, pollIntervalMs: 1, maxPolls: 2 })(task, signal()), /polling limit/);
    assert.equal(remote.requests.filter(item => item.method === "message/send").length, 1);
    assert.equal(remote.requests.length, 3);
  } finally { await remote.close(); }
});

test("A2A rejects identity drift and unsupported media", async () => {
  for (const response of [
    { ...remoteTask("completed"), id: "different" },
    { ...remoteTask("completed"), artifacts: [{ parts: [{ kind: "file", file: { uri: "https://untrusted.invalid/file" } }] }] },
  ]) {
    const remote = await server(request => request.method === "message/send" ? remoteTask("working") : response);
    try {
      await assert.rejects(createA2ARunner({ endpoint: remote.endpoint, allowLoopbackHttp: true, pollIntervalMs: 1 })(task, signal()), /identity changed|Unsupported/);
    } finally { await remote.close(); }
  }
});

test("A2A endpoint and envelope boundaries reject redirects, credentials, and mismatched replies", async () => {
  for (const endpoint of ["http://example.com", "http://127.0.0.1", "https://user:secret@example.com", "https://example.com?token=secret", "file:///tmp/agent"]) {
    assert.throws(() => createA2ARunner({ endpoint }), /endpoint/);
  }
  let requestOptions: RequestInit | undefined;
  const wrongIdFetch: typeof fetch = async (_, options) => {
    requestOptions = options;
    return Response.json({ jsonrpc: "2.0", id: "wrong", result: message("wrong") });
  };
  await assert.rejects(createA2ARunner({ endpoint: "https://agent.example", fetch: wrongIdFetch })(task, signal()), /envelope/);
  assert.equal(requestOptions?.redirect, "error");
  const secretFailure: typeof fetch = async () => { throw new Error("secret-token-from-provider"); };
  await assert.rejects(createA2ARunner({ endpoint: "https://agent.example", fetch: secretFailure })(task, signal()), error => {
    assert.doesNotMatch(String(error), /secret-token/); return true;
  });
});

test("A2A streaming body byte limit bounds the actual response", async () => {
  const remote = await server(() => message("x".repeat(1000)));
  try {
    await assert.rejects(createA2ARunner({ endpoint: remote.endpoint, allowLoopbackHttp: true, maxResponseBytes: 200 })(task, signal()), /byte limit/);
  } finally { await remote.close(); }
});

test("A2A malformed JSON cannot leak provider response text through an exception", async () => {
  const malformed: typeof fetch = async () => new Response("provider-secret: invalid json");
  await assert.rejects(createA2ARunner({ endpoint: "https://agent.example", fetch: malformed })(task, signal()), error => {
    assert.match(String(error), /Invalid A2A JSON/);
    assert.doesNotMatch(String(error), /provider-secret/);
    return true;
  });
});

test("MCP uses the registered tool and actual argument mapping", async () => {
  let received: unknown;
  const runner = createMcpToolRunner({ toolName: "search", argumentsForTask: input => ({ query: input.prompt, limit: 3 }), callTool: async request => {
    received = request;
    return { content: [{ type: "text", text: "found" }] };
  } });
  assert.deepEqual(await runner(task, signal()), { output: "found", exitCode: 0 });
  assert.deepEqual(received, { name: "search", arguments: { query: task.prompt, limit: 3 } });
  assert.equal((await createMcpToolRunner({ toolName: "stats", callTool: async () => ({ structuredContent: { count: 2 } }) })(task, signal())).output, '{"count":2}');
});

test("MCP distinguishes known failure from invalid or asynchronous results", async () => {
  assert.equal((await createMcpToolRunner({ toolName: "tool", callTool: async () => ({ isError: true }) })(task, signal())).exitCode, 1);
  for (const response of [{ content: [] }, { content: [{ type: "image", data: "blob" }] }, { structuredContent: { large: "x".repeat(100) } },
    { task: { taskId: "pending" }, content: [{ type: "text", text: "queued" }] },
    { isError: "false", content: [{ type: "text", text: "invalid" }] }]) {
    await assert.rejects(createMcpToolRunner({ toolName: "tool", maxOutputBytes: 20, callTool: async () => response as any })(task, signal()));
  }
  await assert.rejects(createMcpToolRunner({ toolName: "tool", callTool: async () => { throw new Error("provider-secret"); } })(task, signal()), error => {
    assert.doesNotMatch(String(error), /provider-secret/); return true;
  });
});

test("A2A waits for durable-reference callback before polling and redacts callback errors", async () => {
  let persist!: () => void;
  let running!: ReturnType<AgentRunner>;
  const remote = await server(request => request.method === "message/send" ? remoteTask("working") : {
    ...remoteTask("completed"), artifacts: [{ artifactId: "answer", parts: [{ kind: "text", text: "ok" }] }],
  });
  try {
    const started = new Promise<void>(resolve => {
      const runner = createA2ARunner({ endpoint: remote.endpoint, allowLoopbackHttp: true, pollIntervalMs: 1,
        onTask: () => new Promise<void>(done => { persist = done; resolve(); }) });
      running = runner(task, signal());
    });
    await started;
    await new Promise(resolve => setTimeout(resolve, 15));
    assert.equal(remote.requests.length, 1, "polling must wait for reference persistence");
    persist();
    assert.equal((await running).output, "ok");
    await assert.rejects(createA2ARunner({ endpoint: remote.endpoint, allowLoopbackHttp: true,
      onTask: () => { throw new Error("credential-in-store-error"); } })(task, signal()), error => {
      assert.doesNotMatch(String(error), /credential-in-store-error/);
      return true;
    });
  } finally { await remote.close(); }
});

test("aborted uncooperative work releases its cancellation listener", async () => {
  const controller = new AbortController();
  const pending = withAbort(() => new Promise<never>(() => {}), controller.signal);
  await Promise.resolve();
  assert.equal(getEventListeners(controller.signal, "abort").length, 1);
  controller.abort();
  await assert.rejects(pending, /cancelled/);
  assert.equal(getEventListeners(controller.signal, "abort").length, 0);
});

test("process rejects malformed UTF-8 instead of accepting replacement characters", async () => {
  const code = readRequest + "process.stdout.write(Buffer.concat([Buffer.from('{\"version\":\"1.0\",\"id\":\"'+r.id+'\",\"output\":\"'),Buffer.from([255]),Buffer.from('\",\"exitCode\":0}\\n')]));});";
  await assert.rejects(nodeWorker(code)(task, signal()), /Invalid worker response/);
});

function nodeWorker(code: string, maxOutputBytes?: number): AgentRunner {
  return createProcessRunner({ command: process.execPath, args: ["-e", code], cwd: process.cwd(), maxOutputBytes });
}

const readRequest = "let input='';process.stdin.on('data',c=>input+=c);process.stdin.on('end',()=>{const r=JSON.parse(input);";

test("process worker receives literal prompt over stdin and no inherited credentials", async () => {
  process.env.STARLIGHT_FEDERATION_TEST_SENTINEL = "not-a-real-secret";
  try {
    const runner = nodeWorker(readRequest + "console.log(JSON.stringify({version:'1.0',id:r.id,output:JSON.stringify({prompt:r.prompt,inherited:process.env.STARLIGHT_FEDERATION_TEST_SENTINEL??null}),exitCode:0}));});");
    const prompt = 'quotes " and $(never-execute) ; `literal` ü';
    const result = await runner({ ...task, prompt }, signal());
    assert.deepEqual(JSON.parse(result.output), { prompt, inherited: null });
  } finally { delete process.env.STARLIGHT_FEDERATION_TEST_SENTINEL; }
});

test("process rejects wrong task identity, logs on stdout, oversized output, and process failure", async () => {
  const codes = [
    "console.log(JSON.stringify({version:'1.0',id:'wrong',output:'ok',exitCode:0}))",
    "console.log('log line'); console.log('{}')",
    "console.log('x'.repeat(500))",
    "process.exit(7)",
  ];
  for (const code of codes) await assert.rejects(nodeWorker(code, 200)(task, signal()));
  assert.throws(() => createProcessRunner({ command: "python", cwd: process.cwd() }), /absolute/);
});

test("process timeout terminates the owned direct child", { timeout: 3000 }, async () => {
  const runner = nodeWorker("setInterval(()=>{},1000)");
  await assert.rejects(runner(task, AbortSignal.timeout(100)), /cancelled/);
});

test("mixed-language batch invokes a real Python worker and an MCP tool adapter", { skip: !process.env.STARLIGHT_TEST_PYTHON }, async () => {
  const federation = new FederatedRuntime([
    { id: "python", transport: "process", capabilities: ["analyze"], runner: createProcessRunner({
      command: process.env.STARLIGHT_TEST_PYTHON!, args: ["-I", fileURLToPath(new URL("../examples/federation/python_worker.py", import.meta.url))], cwd: process.cwd(),
    }) },
    { id: "mcp", transport: "mcp", capabilities: ["summarize"], runner: createMcpToolRunner({ toolName: "summarize", callTool: async () => ({ content: [{ type: "text", text: "done" }] }) }) },
  ], { concurrency: 1, timeoutMs: 5000 });
  const result = await federation.run([
    { id: "one", prompt: "One two three", capability: "analyze" },
    { id: "two", prompt: "Summarize", capability: "summarize" },
  ]);
  assert.equal(result.succeeded, 2, JSON.stringify(result.results));
  assert.equal(result.results[0].status, "completed");
  assert.equal("output" in result.results[0] && JSON.parse(result.results[0].output!).wordCount, 3);
  assert.deepEqual(result.results.map(item => item.route.transport), ["process", "mcp"]);
});

test("A2A runner composes with the integrated RuntimeBridge lifecycle", async () => {
  const remote = await server(() => message("composed"));
  try {
    const runner = createA2ARunner({ endpoint: remote.endpoint, allowLoopbackHttp: true });
    const bridge = new RuntimeBridge({
      runtimes: [{ id: "remote", invoke: async (request: { taskId: string; input: string }, abort: AbortSignal) => {
        const result = await runner({ id: request.taskId, prompt: request.input }, abort);
        return { protocol: WORKER_PROTOCOL, taskId: request.taskId, status: "completed", output: result.output };
      } }],
      routes: { reviewer: "remote" }, maxConcurrency: 1, maxRuns: 2, timeoutMs: 1_000,
    });
    const input = { protocol: WORKER_PROTOCOL, taskId: "composed-task", agent: "reviewer", input: "Review", context: {} };
    assert.equal((await bridge.run(input)).output, "composed");
    assert.equal((await bridge.run(input)).output, "composed");
    assert.equal(remote.requests.length, 1, "RuntimeBridge deduplicates repeated task submission before A2A transport");
    assert.equal(bridge.snapshot().submitted, 1);
  } finally { await remote.close(); }
});
