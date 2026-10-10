import test from 'node:test';
import assert from 'node:assert/strict';
import { generateText, streamText } from 'ai';
import { MockLanguageModelV4 } from 'ai/test';
import { withStarlightMemory } from '../dist/index.js';

const usage = { inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 }, outputTokens: { total: 1, text: 1, reasoning: 0 } };
const finishReason = { unified: 'stop', raw: 'stop' };
const record = { memory_id: 'fact', tenant_id: 'a', privacy_class: 'public', normalized_fact: 'Deploy the inspected tarball.', raw_content: 'never inject raw data' };

test('generateText receives sanitized memory, preserves original prompt, and keeps tenants isolated', async () => {
  const seen = [];
  const queries = [];
  const model = new MockLanguageModelV4({ doGenerate: async params => {
    seen.push(params); return { content: [{ type: 'text', text: 'accepted' }], usage, finishReason, warnings: [] };
  } });
  const wrapped = withStarlightMemory(model, { tenantId: 'a', memory: { recall: async request => {
    queries.push(request); return [{ record, score: 1 }, { record: { ...record, memory_id: 'denied', tenant_id: 'b', normalized_fact: 'other-tenant' }, score: 1 }];
  } } });
  assert.equal((await generateText({ model: wrapped, prompt: 'How should we deploy?', maxRetries: 0 })).text, 'accepted');
  assert.equal(queries[0].tenant_id, 'a');
  assert.equal(queries[0].query, 'How should we deploy?');
  const prompt = JSON.stringify(seen[0].prompt);
  assert.ok(prompt.includes('How should we deploy?'));
  assert.ok(prompt.includes('Deploy the inspected tarball.'));
  assert.ok(!prompt.includes('other-tenant'));
  assert.ok(!prompt.includes('never inject raw data'));
});

test('streamText uses the same memory transform without changing the generated stream', async () => {
  let seen;
  const model = new MockLanguageModelV4({ doStream: async params => {
    seen = params;
    return { stream: new ReadableStream({ start(controller) {
      for (const part of [{ type: 'stream-start', warnings: [] }, { type: 'text-start', id: '1' },
        { type: 'text-delta', id: '1', delta: 'streamed' }, { type: 'text-end', id: '1' }, { type: 'finish', usage, finishReason }]) controller.enqueue(part);
      controller.close();
    } }) };
  } });
  const wrapped = withStarlightMemory(model, { tenantId: 'a', memory: { recall: async () => [{ record, score: 1 }] } });
  assert.equal(await streamText({ model: wrapped, prompt: 'Deploy?', maxRetries: 0 }).text, 'streamed');
  assert.ok(JSON.stringify(seen.prompt).includes('inspected tarball'));
});

test('denied or unavailable recall prevents model execution; errors do not disclose provider details', async () => {
  let calls = 0;
  const model = new MockLanguageModelV4({ doGenerate: async () => { calls++; throw new Error('unexpected model call'); } });
  const wrapped = withStarlightMemory(model, { tenantId: 'a', memory: { recall: async () => { throw new Error('private-provider-detail'); } } });
  await assert.rejects(generateText({ model: wrapped, prompt: 'Deploy?', maxRetries: 0 }), error => !error.message.includes('private-provider-detail'));
  assert.equal(calls, 0);
});

test('empty recall leaves the original request usable', async () => {
  let seen;
  const model = new MockLanguageModelV4({ doGenerate: async params => { seen = params; return { content: [{ type: 'text', text: 'ok' }], usage, finishReason, warnings: [] }; } });
  const wrapped = withStarlightMemory(model, { tenantId: 'a', memory: { recall: async () => [] } });
  await generateText({ model: wrapped, prompt: 'Empty?', maxRetries: 0 });
  assert.ok(!seen.prompt.some(message => message.role === 'system' && message.content.includes('Retrieved memory')));
});
