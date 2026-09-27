// node --import ./scripts/test/register.mjs --test src/lib/desk/provider.test.mjs
import assert from "node:assert/strict";
import test from "node:test";

import { chat } from "./provider.ts";

const REQUEST = { model: "test/model", messages: [{ role: "user", content: "hello" }] };

function completion(usage = { prompt_tokens: 10, completion_tokens: 2 }) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      choices: [{ message: { content: "world" } }],
      usage,
    }),
  };
}

test("one successful provider attempt has complete billable usage", async () => {
  const result = await chat(REQUEST, { apiKey: "test", fetchImpl: async () => completion() });
  assert.equal(result.attempts, 1);
  assert.equal(result.usageComplete, true);
});

test("usage is incomplete when prompt_tokens is missing", async () => {
  const result = await chat(REQUEST, {
    apiKey: "test",
    fetchImpl: async () => completion({ completion_tokens: 2 }),
  });

  assert.equal(result.inputTokens, 0);
  assert.equal(result.outputTokens, 2);
  assert.equal(result.usageComplete, false);
});

test("usage is incomplete when completion_tokens is missing", async () => {
  const result = await chat(REQUEST, {
    apiKey: "test",
    fetchImpl: async () => completion({ prompt_tokens: 10 }),
  });

  assert.equal(result.inputTokens, 10);
  assert.equal(result.outputTokens, 0);
  assert.equal(result.usageComplete, false);
});

test("explicit zero counts are complete when both fields are reported", async () => {
  const result = await chat(REQUEST, {
    apiKey: "test",
    fetchImpl: async () => completion({ prompt_tokens: 0, completion_tokens: 0 }),
  });

  assert.equal(result.inputTokens, 0);
  assert.equal(result.outputTokens, 0);
  assert.equal(result.usageComplete, true);
});

test("non-negative safe integer counts are complete when both fields are reported", async () => {
  const result = await chat(REQUEST, {
    apiKey: "test",
    fetchImpl: async () => completion({ prompt_tokens: 17, completion_tokens: 3 }),
  });

  assert.equal(result.inputTokens, 17);
  assert.equal(result.outputTokens, 3);
  assert.equal(result.usageComplete, true);
});

test("invalid token counts make usage incomplete", async (t) => {
  const cases = [
    ["malformed input", { prompt_tokens: "10", completion_tokens: 2 }],
    ["negative input", { prompt_tokens: -1, completion_tokens: 2 }],
    ["tiny fractional input", { prompt_tokens: 0.01, completion_tokens: 2 }],
    ["fractional output", { prompt_tokens: 10, completion_tokens: 1.5 }],
    ["unsafe integer input", { prompt_tokens: Number.MAX_SAFE_INTEGER + 1, completion_tokens: 2 }],
    ["malformed output", { prompt_tokens: 10, completion_tokens: Number.NaN }],
    ["negative output", { prompt_tokens: 10, completion_tokens: -1 }],
  ];

  for (const [name, usage] of cases) {
    await t.test(name, async () => {
      const result = await chat(REQUEST, {
        apiKey: "test",
        fetchImpl: async () => completion(usage),
      });
      assert.equal(result.usageComplete, false);
      assert.equal(result.inputTokens, Number.isSafeInteger(usage.prompt_tokens) && usage.prompt_tokens >= 0 ? usage.prompt_tokens : 0);
      assert.equal(result.outputTokens, Number.isSafeInteger(usage.completion_tokens) && usage.completion_tokens >= 0 ? usage.completion_tokens : 0);
    });
  }
});

test("a successful retry retains an incomplete billable-usage signal", async () => {
  const responses = [
    { ok: false, status: 429, text: async () => "slow down" },
    completion(),
  ];
  const result = await chat(REQUEST, {
    apiKey: "test",
    fetchImpl: async () => responses.shift(),
  });

  assert.equal(result.attempts, 2);
  assert.equal(result.usageComplete, false, "the first attempt may have consumed unreported billable work");
  assert.equal(result.inputTokens + result.outputTokens, 12, "reported usage still describes only the successful attempt");
});

test("a retried call's latency covers both attempts, not only the retry", async () => {
  // chat start, attempt 1 start, attempt 1 answered (503), retry decision,
  // attempt 2 start, attempt 2 answered.
  const ticks = [1_000, 1_000, 1_300, 1_350, 1_350, 1_550];
  const responses = [{ ok: false, status: 503, text: async () => "busy" }, completion()];
  const result = await chat(REQUEST, {
    apiKey: "test",
    now: () => ticks.shift(),
    fetchImpl: async () => responses.shift(),
  });

  assert.equal(result.attempts, 2);
  assert.equal(result.latencyMs, 550, "350 ms spent on the failed attempt plus 200 ms on the retry");
});

test("a single attempt's latency is that attempt's own", async () => {
  const ticks = [0, 10, 70];
  const result = await chat(REQUEST, { apiKey: "test", now: () => ticks.shift(), fetchImpl: async () => completion() });
  assert.equal(result.latencyMs, 60);
});
