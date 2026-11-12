import test from 'node:test';
import assert from 'node:assert/strict';
import { MockLanguageModelV4 } from 'ai/test';
import { tool } from 'ai';
import { z } from 'zod';
import { createAgentRuntime } from '../dist/index.js';

const scope = {
  brand_id: 'brand_starlight_intelligence',
  product_id: 'product_gencreator',
  agent_id: 'agent_studio',
  workflow_id: 'workflow_plan_week',
};

/**
 * A model that answers with text and reports the given token counts.
 *
 * The usage shape is the provider-level V4 shape: nested totals, not flat counts. A flat
 * `{ inputTokens: 11 }` is silently ignored by the SDK, which would make every token assertion
 * below pass against zero.
 */
function mockModel(text, usage) {
  return new MockLanguageModelV4({
    doGenerate: async () => ({
      content: [{ type: 'text', text }],
      finishReason: { unified: 'stop', raw: 'stop' },
      usage: usage ?? { inputTokens: { total: 1 }, outputTokens: { total: 1 } },
      warnings: [],
    }),
  });
}

/** A model that always fails. */
function failingModel(message = 'provider exploded') {
  return new MockLanguageModelV4({
    doGenerate: async () => {
      throw new Error(message);
    },
  });
}

const route = { kind: 'frontier', tier: 'balanced' };

test('a runtime that has not run has no attribution to report', async () => {
  const runtime = await createAgentRuntime({
    route,
    scope,
    model: mockModel('unused'),
  });
  await assert.rejects(() => runtime.attribution(), /No completed run to attribute/);
});

test('a completed run produces all eleven required dimensions', async () => {
  const runtime = await createAgentRuntime({
    route,
    scope,
    model: mockModel('done', { inputTokens: { total: 11 }, outputTokens: { total: 7 } }),
  });
  const result = await runtime.agent.generate({ prompt: 'hello' });
  assert.equal(result.text, 'done');

  const record = await runtime.attribution();
  for (const key of [
    'brand_id',
    'product_id',
    'agent_id',
    'workflow_id',
    'provider',
    'model',
    'input_tokens',
    'output_tokens',
    'estimated_cost',
    'latency_ms',
    'outcome_status',
  ]) {
    assert.ok(key in record, `missing required dimension: ${key}`);
  }
  assert.equal(record.input_tokens, 11);
  assert.equal(record.output_tokens, 7);
  assert.equal(record.outcome_status, 'completed');
});

test('a second run does not inherit the first run tokens', async () => {
  // The runtime is reusable. The second run's record must describe the SECOND run, not the sum
  // of both. A runtime that accumulated across runs would report 10 input tokens here.
  const runtime = await createAgentRuntime({
    route,
    scope,
    model: mockModel('done', { inputTokens: { total: 5 }, outputTokens: { total: 3 } }),
  });

  await runtime.agent.generate({ prompt: 'first' });
  const first = await runtime.attribution();
  assert.equal(first.input_tokens, 5);

  await runtime.agent.generate({ prompt: 'second' });
  const second = await runtime.attribution();
  assert.equal(second.input_tokens, 5, 'the second run must not add the first run tokens');
  assert.equal(second.output_tokens, 3);
});

test('a failed run is not reported as completed', async () => {
  const runtime = await createAgentRuntime({
    route,
    scope,
    model: failingModel(),
  });
  await assert.rejects(() => runtime.agent.generate({ prompt: 'boom' }));
  const record = await runtime.attribution();
  assert.equal(record.outcome_status, 'failed');
});

test('a run that fails before its first model call still produces a record', async () => {
  // The contract asks for every production run. A provider that never answered still ran, and
  // it gets a failed record rather than no record at all.
  const runtime = await createAgentRuntime({
    route,
    scope,
    model: failingModel(),
  });
  await assert.rejects(() => runtime.agent.generate({ prompt: 'boom' }));
  const record = await runtime.attribution();
  assert.equal(record.outcome_status, 'failed');
  assert.equal(record.cost_known, false);
});

test('a successful run after a failed one is not reported as failed', async () => {
  // The failure state must not survive into the next run. A runtime that kept the previous
  // run's outcome would report 'failed' here.
  let attempt = 0;
  const flaky = new MockLanguageModelV4({
    doGenerate: async () => {
      attempt += 1;
      if (attempt === 1) throw new Error('provider exploded');
      return {
        content: [{ type: 'text', text: 'recovered' }],
        finishReason: { unified: 'stop', raw: 'stop' },
        usage: { inputTokens: { total: 4 }, outputTokens: { total: 2 } },
        warnings: [],
      };
    },
  });

  const runtime = await createAgentRuntime({ route, scope, model: flaky });
  await assert.rejects(() => runtime.agent.generate({ prompt: 'boom' }));
  assert.equal((await runtime.attribution()).outcome_status, 'failed');

  await runtime.agent.generate({ prompt: 'again' });
  const second = await runtime.attribution();
  assert.equal(second.outcome_status, 'completed');
  assert.equal(second.input_tokens, 4);
});

test('a multi-step run accumulates every step and reports one outcome', async () => {
  // Two model calls in one run. The record must cover both steps, not just the last one.
  let turn = 0;
  const toolCalling = new MockLanguageModelV4({
    doGenerate: async () => {
      turn += 1;
      if (turn === 1) {
        return {
          content: [
            { type: 'tool-call', toolCallId: 'c1', toolName: 'lookup', input: { q: 'x' } },
          ],
          finishReason: { unified: 'tool-calls', raw: 'tool_calls' },
          usage: { inputTokens: { total: 10 }, outputTokens: { total: 2 } },
          warnings: [],
        };
      }
      return {
        content: [{ type: 'text', text: 'done' }],
        finishReason: { unified: 'stop', raw: 'stop' },
        usage: { inputTokens: { total: 20 }, outputTokens: { total: 5 } },
        warnings: [],
      };
    },
  });

  const runtime = await createAgentRuntime({
    route,
    scope,
    model: toolCalling,
    tools: {
      lookup: tool({
        description: 'look something up',
        inputSchema: z.object({ q: z.string() }),
        execute: async () => 'ok',
      }),
    },
  });

  await runtime.agent.generate({ prompt: 'hi' });
  const record = await runtime.attribution();
  assert.equal(record.input_tokens, 30, 'both steps token counts are summed');
  assert.equal(record.output_tokens, 7);
  assert.equal(record.outcome_status, 'completed');
});

test('attribution cannot be read while a run is still in flight', async () => {
  // Reading mid-run would report a partial record as if it were the run's result.
  //
  // The model signals when it is reached, which proves the run has actually STARTED (onStart
  // has fired) without depending on how many microtask ticks the SDK happens to take.
  let inModel;
  const modelCalled = new Promise(resolve => {
    inModel = resolve;
  });
  const model = new MockLanguageModelV4({
    doGenerate: async () => {
      inModel();
      await modelCalled;
      return {
        content: [{ type: 'text', text: 'done' }],
        finishReason: { unified: 'stop', raw: 'stop' },
        usage: { inputTokens: { total: 1 }, outputTokens: { total: 1 } },
        warnings: [],
      };
    },
  });

  const runtime = await createAgentRuntime({ route, scope, model });
  const pending = runtime.agent.generate({ prompt: 'hi' });
  await modelCalled;

  await assert.rejects(() => runtime.attribution(), /still in flight/);
  await pending;
  await runtime.attribution();
});
