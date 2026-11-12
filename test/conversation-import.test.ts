import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importChatGptExport } from '../src/conversation-import.js';

function fixture() {
  return [{ id: 'synthetic-conversation', title: 'Synthetic owner@example.test', create_time: 100, current_node: 'reply-b', mapping: {
    root: { parent: null, message: null },
    ask: { parent: 'root', message: { author: { role: 'user' }, create_time: 101, content: { parts: ['Please build the synthetic page for owner@example.test'] }, metadata: { attachments: [{ name: 'owner@example.test.png', mime_type: 'image/png', url: 'https://example.test/private?token=secret' }] } } },
    'reply-a': { parent: 'ask', message: { author: { role: 'assistant' }, content: { parts: ['First response'] } } },
    'reply-b': { parent: 'ask', message: { author: { role: 'assistant' }, content: { parts: ['Alternate response', { asset_pointer: 'file-service://synthetic-image' }] } } },
  } }];
}

test('reconstructs both branches and selected path; returns review-only provenance', () => {
  const result = importChatGptExport(fixture());
  const c = result.conversations[0];
  assert.equal(c.nodes.length, 4);
  assert.equal(c.messages.length, 3);
  const ask = c.messages.find(m => m.role === 'user')!;
  const alternate = c.messages.find(m => m.content === 'Alternate response')!;
  assert.equal(alternate.parentId, ask.id);
  assert.deepEqual(c.currentPath, [c.nodes.find(n => n.parentId === null)!.id, ask.id, alternate.id]);
  assert.equal(c.createdAt, 100);
  assert.equal(ask.createdAt, 101);
  assert.equal(c.candidates.length, 1);
  assert.equal(c.candidates[0].status, 'unreviewed');
  assert.equal(result.executionStarted, false);
  assert.equal(result.memoryPromoted, false);
  assert.equal(ask.attachments[0].available, 'unknown');
  assert.equal(alternate.attachments.length, 1);
  assert.ok(!JSON.stringify(result).includes('owner@example.test'));
  assert.ok(!JSON.stringify(result).includes('file-service://'));
  assert.ok(!JSON.stringify(result).includes('token=secret'));
});

test('stable IDs and hashes survive mapping key reordering and repeat imports', () => {
  const input = fixture();
  const reordered = structuredClone(input);
  reordered[0].mapping = Object.fromEntries(Object.entries(reordered[0].mapping).reverse()) as typeof reordered[0]['mapping'];
  assert.deepEqual(importChatGptExport(input), importChatGptExport(reordered));
  assert.equal(importChatGptExport([...input, ...reordered]).duplicates, 1);
});

test('rejects conflicting duplicate identities even when redacted text matches', () => {
  const a = fixture();
  const b = fixture();
  b[0].title = 'Synthetic other@example.test';
  assert.throws(() => importChatGptExport([...a, ...b]), /Conflicting duplicate/);
});

test('rejects missing parents, cycles and unknown current nodes', () => {
  const missing = fixture(); missing[0].mapping.ask.parent = 'missing';
  assert.throws(() => importChatGptExport(missing), /missing parent/);
  const cycle = fixture(); cycle[0].mapping.ask.parent = 'reply-a';
  assert.throws(() => importChatGptExport(cycle), /cycle/);
  const current = fixture(); current[0].current_node = 'missing';
  assert.throws(() => importChatGptExport(current), /current node/);
});

test('unknown attachment paths and URLs are not surfaced as metadata', () => {
  const input = fixture();
  input[0].mapping.ask.message.metadata.attachments[0].name = '../private/secret.png';
  input[0].mapping.ask.message.metadata.attachments[0].mime_type = 'https://example.test/secret';
  const attachment = importChatGptExport(input).conversations[0].messages.find(m => m.role === 'user')!.attachments[0];
  assert.equal(attachment.name, null);
  assert.equal(attachment.mimeType, null);
});
