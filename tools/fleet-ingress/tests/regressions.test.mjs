import assert from 'node:assert/strict';
import test from 'node:test';
import { handleRequest, shouldDispatchRunner } from '../src/index.ts';
import { environment, payload, signed, mockProvider } from './fixtures.mjs';

test('unapproved signed repository cannot dispatch', async t => {
  const { env } = environment();
  const body = payload(); body.repository = { id: 999, full_name: 'fixture/unapproved' };
  const provider = mockProvider(t);
  const response = await handleRequest(signed(body), env);
  assert.equal(response.status, 403);
  assert.equal(provider.mock.callCount(), 0);
});
test('queued job without dedicated runner labels cannot dispatch', () => {
  assert.equal(shouldDispatchRunner({ event: 'workflow_job', action: 'queued', repo: 'fixture/example', sender: 'fixture' }), false);
});
test('concurrent replay dispatches exactly once in the storage contract fixture', async t => {
  const { env } = environment();
  const provider = mockProvider(t);
  const responses = await Promise.all(Array.from({ length: 20 }, () => handleRequest(signed(), env)));
  assert.equal(provider.mock.callCount(), 1);
  assert.equal(responses.filter(r => r.status === 202).length, 1);
  assert.ok(responses.every(r => [200, 202, 409].includes(r.status)));
});
test('empty provider response is not a verified dispatch receipt', async t => {
  const { env } = environment();
  mockProvider(t, async () => new Response('{}', { status: 200 }));
  const response = await handleRequest(signed(), env);
  assert.equal(response.status, 502);
  assert.equal((await response.json()).reconciliation_required, true);
});
