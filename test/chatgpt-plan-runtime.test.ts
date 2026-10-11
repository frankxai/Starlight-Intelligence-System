import { test } from "node:test";
import assert from "node:assert/strict";
import { createChatGptPlanRuntime } from "../src/runtime-bridge/chatgpt-plan.js";
import { RuntimeBridge } from "../src/runtime-bridge/bridge.js";
import { WORKER_PROTOCOL } from "../src/runtime-bridge/contracts.js";

const connection = () => ({ accountId: "account-a", accessToken: "test-private-token", expiresAt: Date.now() + 60_000,
  scopes: ["resource.invoke", "chatgpt.tokens.use.direct"] });
const request = (taskId = "task-a") => ({ protocol: WORKER_PROTOCOL, taskId, agent: "writer", input: "Write a useful draft.", context: {} });
const catalog = () => new Response(JSON.stringify({ models: [
  { slug: "model-a", display_name: "Current account model", visibility: "list" },
  { slug: "hidden-model", display_name: "Hidden", visibility: "hidden" },
] }), { headers: { "content-type": "application/json" } });
const event = (value: unknown) => `data: ${JSON.stringify(value)}\r\n\r\n`;
const terminal = (text = "A useful draft.") => ({ type: "response.completed", response: {
  id: "response-a", status: "completed", model: "model-a", output: [{ type: "message", content: [{ type: "output_text", text }] }],
  usage: { input_tokens: 10, output_tokens: 4, total_tokens: 14 },
} });
function stream(events: unknown[], split = false) {
  const bytes = new TextEncoder().encode(events.map(event).join(""));
  return new Response(new ReadableStream({ start(controller) {
    if (split) for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
    else controller.enqueue(bytes);
    controller.close();
  } }), { headers: { "content-type": "text/event-stream" } });
}
function setup(options: Record<string, unknown> = {}, events: unknown[] = [terminal()]) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const transport = async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    return String(url).endsWith("/models") ? catalog() : stream(events);
  };
  const runtime = createChatGptPlanRuntime({ id: "plan-worker", accountId: "account-a", model: "model-a",
    resolveConnection: async () => connection(), transport: transport as typeof fetch, ...options });
  return { runtime, calls };
}

test("uses account models and exact public streaming request; emits token usage without credentials", async () => {
  const usage: unknown[] = [];
  const { runtime, calls } = setup({ instructions: "Draft for the operator.", onUsage: (value: unknown) => usage.push(value) });
  const models = await runtime.listModels(new AbortController().signal);
  assert.deepEqual(models, [{ slug: "model-a", displayName: "Current account model" }]);
  const result = await runtime.invoke(request(), new AbortController().signal);
  assert.deepEqual(result, { protocol: WORKER_PROTOCOL, taskId: "task-a", status: "completed", output: "A useful draft." });
  const post = calls.at(-1)!;
  assert.equal(post.url, "https://api.openai.com/v1/responses");
  assert.deepEqual(JSON.parse(post.init!.body as string), { model: "model-a", input: [{ role: "user", content: request().input }],
    instructions: "Draft for the operator.", store: false, stream: true });
  assert.equal(post.init!.redirect, "error");
  assert.equal(new Headers(post.init!.headers).get("authorization"), "Bearer test-private-token");
  assert.equal(JSON.stringify(usage).includes("test-private-token"), false);
  assert.deepEqual(usage, [{ taskId: "task-a", runtimeId: "plan-worker", responseId: "response-a", model: "model-a",
    inputTokens: 10, outputTokens: 4, totalTokens: 14, evidence: "provider-reported", cost: null }]);
});

test("consent, expiry, wrong account and malformed credentials prevent any network request", async () => {
  for (const patch of [ { scopes: ["openid"] }, { expiresAt: Date.now() - 1 }, { accountId: "account-b" },
    { accessToken: "token\r\nInjected: secret" }, { scopes: "chatgpt.tokens.use.direct" }, { expiresAt: Infinity } ]) {
    const { runtime, calls } = setup({ resolveConnection: async () => ({ ...connection(), ...patch }) });
    const result = await runtime.invoke(request(), new AbortController().signal);
    assert.equal(result.status, "failed");
    assert.equal(calls.length, 0);
  }
});

test("pre-abort and invalid request never reach credential broker", async () => {
  let reads = 0;
  const { runtime } = setup({ resolveConnection: async () => { reads++; return connection(); } });
  await assert.rejects(runtime.invoke(request(), AbortSignal.abort()));
  await assert.rejects(runtime.invoke({ ...request(), input: "" }, new AbortController().signal));
  assert.equal(reads, 0);
});

test("catalog choices are refreshed each call; unavailable model never falls back", async () => {
  let count = 0;
  const { runtime } = setup({ transport: async (url: string) => {
    count++;
    return url.endsWith("/models") ? new Response('{"models":[]}', { headers: { "content-type": "application/json" } }) : stream([terminal()]);
  } });
  assert.equal((await runtime.invoke(request(), new AbortController().signal)).status, "failed");
  assert.equal((await runtime.invoke(request("task-b"), new AbortController().signal)).status, "failed");
  assert.equal(count, 2);
});

test("profile or token replacement during catalog discovery prevents dispatch", async () => {
  for (const change of [{ accountId: "account-b" }, { accessToken: "replacement-token" }]) {
    let reads = 0;
    const { runtime, calls } = setup({ resolveConnection: async () => ({ ...connection(), ...(reads++ ? change : {}) }) });
    const result = await runtime.invoke(request(), new AbortController().signal);
    assert.equal(result.status, "failed");
    assert.equal(calls.length, 1);
  }
});

test("fragmented UTF-8 and CRLF events produce verified terminal text", async () => {
  const text = "A draft with café and 🌟.";
  const events = [{ type: "response.output_text.delta", output_index: 0, content_index: 0, delta: text }, terminal(text)];
  const { runtime } = setup({ transport: async (url: string) => url.endsWith("/models") ? catalog() : stream(events, true) });
  const result = await runtime.invoke(request(), new AbortController().signal);
  assert.ok(result.status === "completed");
  assert.equal(result.output, text);
});

test("usage-limit failure after partial text is failed and carries no partial output or provider secret", async () => {
  for (const code of ["subscription_sharing_usage_limit_exceeded", "subscription_sharing_usage_unavailable"]) {
    const { runtime } = setup({}, [{ type: "response.output_text.delta", output_index: 0, content_index: 0, delta: "Partial" },
      { type: "response.failed", response: { status: "failed", error: { code, message: "test-private-token" } } }]);
    const result = await runtime.invoke(request(), new AbortController().signal);
    assert.equal(result.status, "failed");
    assert.equal("output" in result, false);
    assert.match(result.error, /usage/);
    assert.equal(JSON.stringify(result).includes("test-private-token"), false);
  }
});

test("incomplete terminal event is an explicit failure", async () => {
  const { runtime } = setup({}, [{ type: "response.incomplete", response: { status: "incomplete" } }]);
  assert.equal((await runtime.invoke(request(), new AbortController().signal)).status, "failed");
});

test("missing terminal, malformed event, mismatched text and tool output remain unknown in RuntimeBridge", async () => {
  for (const events of [[], [{ type: "response.output_text.delta", output_index: 0, content_index: 0, delta: "Partial" }],
    [{ type: "response.output_text.delta", output_index: 0, content_index: 0, delta: "Wrong" }, terminal()],
    [{ ...terminal(), response: { ...terminal().response, output: [{ type: "function_call" }] } }],
    [{ type: "response.completed", response: { status: "completed" } }]]) {
    const { runtime } = setup({}, events);
    const bridge = new RuntimeBridge({ runtimes: [runtime], routes: { writer: runtime.id }, maxConcurrency: 1, maxRuns: 2, timeoutMs: 1000 });
    assert.equal((await bridge.run(request())).status, "unknown");
    assert.equal(bridge.snapshot().remainingCapacity, 0);
    await assert.rejects(bridge.run(request("task-b")), /paused|capacity/);
  }
});

test("untrusted context cannot select a model, add tools, or upload private context", async () => {
  const { runtime, calls } = setup();
  await runtime.invoke({ ...request(), context: { model: "expensive-model", tools: ["shell"], memory: "private memory" } }, new AbortController().signal);
  const body = JSON.parse(calls.at(-1)!.init!.body as string);
  assert.equal(body.model, "model-a");
  assert.equal("tools" in body, false);
  assert.equal(JSON.stringify(body).includes("private memory"), false);
});

test("HTTP auth and usage errors are safe failures; transport errors remain unknown without retry", async () => {
  for (const status of [401, 403, 429]) {
    const { runtime } = setup({ transport: async () => new Response('{"error":{"message":"test-private-token"}}', { status }) });
    const result = await runtime.invoke(request(), new AbortController().signal);
    assert.equal(result.status, "failed");
    assert.equal(JSON.stringify(result).includes("test-private-token"), false);
  }
  let calls = 0;
  const { runtime } = setup({ transport: async (url: string) => {
    calls++; if (url.endsWith("/models")) return catalog();
    throw new Error("test-private-token");
  } });
  await assert.rejects(runtime.invoke(request(), new AbortController().signal), error => !String(error).includes("test-private-token"));
  assert.equal(calls, 2);
});

test("local output limit aborts reading and rejects as unresolved; never claims a token spending cap", async () => {
  const { runtime } = setup({ maxOutputBytes: 8 }, [{ type: "response.output_text.delta", output_index: 0, content_index: 0, delta: "Output beyond limit" }]);
  await assert.rejects(runtime.invoke(request(), new AbortController().signal), /output_limit/);
});

test("duplicate catalog and malformed token usage fail closed", async () => {
  const { runtime } = setup({ transport: async () => new Response(JSON.stringify({ models: [
    { slug: "model-a", display_name: "A", visibility: "list" }, { slug: "model-a", display_name: "A", visibility: "list" },
  ] }), { headers: { "content-type": "application/json" } }) });
  assert.equal((await runtime.invoke(request(), new AbortController().signal)).status, "failed");
  const other = setup({}, [{ ...terminal(), response: { ...terminal().response, usage: { input_tokens: -1, output_tokens: 4, total_tokens: 3 } } }]);
  await assert.rejects(other.runtime.invoke(request(), new AbortController().signal), /invalid_usage/);
});

test("missing usage stays unknown; failed host usage recording retains execution capacity", async () => {
  const usage: unknown[] = [];
  const { usage: _counts, ...withoutUsage } = terminal().response;
  const { runtime } = setup({ onUsage: (value: unknown) => usage.push(value) },
    [{ type: "response.completed", response: withoutUsage }]);
  assert.equal((await runtime.invoke(request(), new AbortController().signal)).status, "completed");
  assert.deepEqual(usage, [{ taskId: "task-a", runtimeId: "plan-worker", responseId: "response-a", model: "model-a",
    inputTokens: null, outputTokens: null, totalTokens: null, evidence: "provider-usage-missing", cost: null }]);

  const other = setup({ onUsage: () => { throw new Error("private audit service error"); } });
  const bridge = new RuntimeBridge({ runtimes: [other.runtime], routes: { writer: other.runtime.id },
    maxConcurrency: 1, maxRuns: 2, timeoutMs: 1000 });
  const result = await bridge.run(request());
  assert.equal(result.status, "unknown");
  assert.equal(bridge.snapshot().remainingCapacity, 0);
  assert.equal(JSON.stringify(result).includes("private audit service error"), false);
});

test("invalid JSON, invalid UTF-8 and conflicting terminal events are unresolved", async () => {
  for (const payload of [new TextEncoder().encode("data: {invalid-json}\n\n"), new Uint8Array([0xff]),
    new TextEncoder().encode(event(terminal()) + event(terminal()))]) {
    const { runtime } = setup({ transport: async (url: string) => url.endsWith("/models") ? catalog()
      : new Response(payload, { headers: { "content-type": "text/event-stream" } }) });
    await assert.rejects(runtime.invoke(request(), new AbortController().signal), /chatgpt_plan:/);
  }
});
