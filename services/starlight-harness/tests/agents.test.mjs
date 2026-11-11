import assert from 'node:assert/strict';
import test from 'node:test';
import { agentCommand, agentEnv, outcome } from '../src/agents.ts';

const V = { account: 'acct', gateway: 'default', model: 'm' };

test('both agents reach their model only through the gateway', () => {
  assert.equal(agentEnv('claude', V).ANTHROPIC_BASE_URL, 'https://gateway.ai.cloudflare.com/v1/acct/default/anthropic');
  assert.equal(agentEnv('claude', V).ANTHROPIC_API_KEY, 'provided-by-worker');
  assert.ok(agentCommand('codex', V, 'p').some((a) => a.includes('https://gateway.ai.cloudflare.com/v1/acct/default/openai')));
  assert.equal(agentCommand('claude', V, 'do it').at(-1), 'do it');
});

test('Claude Code success comes from the result event, not the exit code', () => {
  const ok = '{"type":"system"}\n{"type":"result","subtype":"success","is_error":false,"result":"Done."}\n';
  assert.deepEqual(outcome('claude', 0, ok, '', undefined), { state: 'succeeded', result: 'Done.' });
  const bad = '{"type":"result","subtype":"error_during_execution","is_error":true,"result":"gateway 401"}';
  assert.deepEqual(outcome('claude', 0, bad, '', undefined), { state: 'failed', error: 'gateway 401' });
  assert.equal(outcome('claude', 1, 'not json', 'boom', undefined).state, 'failed');
});

test('Codex success reads the last message; failure reads its events', () => {
  assert.deepEqual(outcome('codex', 0, '', '', 'Changed two files.'), { state: 'succeeded', result: 'Changed two files.' });
  assert.deepEqual(outcome('codex', 1, '{"type":"turn.failed","error":{"message":"rate limited"}}', '', undefined), { state: 'failed', error: 'rate limited' });
  assert.match(outcome('codex', 2, '', 'stderr tail', undefined).error, /codex exited with 2: stderr tail/);
});
