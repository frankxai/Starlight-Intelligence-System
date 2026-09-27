// node --import ./scripts/test/register.mjs --test src/lib/desk/provider.test.mjs
import assert from "node:assert/strict";
import test from "node:test";

import { chat } from "./provider.ts";

const REQUEST = { model: "test/model", messages: [{ role: "user", content: "hello" }] };

function completion() {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      choices: [{ message: { content: "world" } }],
      usage: { prompt_tokens: 10, completion_tokens: 2 },
    }),
  };
}

test("one successful provider attempt has complete billable usage", async () => {
  const result = await chat(REQUEST, { apiKey: "test", fetchImpl: async () => completion() });
  assert.equal(result.attempts, 1);
  assert.equal(result.usageComplete, true);
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
