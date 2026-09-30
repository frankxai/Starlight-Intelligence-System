import assert from 'node:assert/strict';
import test from 'node:test';
import type { McpServer } from '@modelcontextprotocol/server';
import type { ZodType } from 'zod';
import { registerReviewTools } from './review-tools.js';

type Tool = { name: string; config: { inputSchema: ZodType; annotations: { readOnlyHint: boolean; destructiveHint: boolean } }; handler: (input: never) => Promise<Record<string, unknown>> };
function tools(): Tool[] {
  const registered: Tool[] = [];
  registerReviewTools({ registerTool(name: string, config: Tool['config'], handler: Tool['handler']) {
    registered.push({ name, config, handler });
  } } as unknown as McpServer);
  return registered;
}
const input = { repository: 'company/example', pull_request: 42, base_sha: 'a'.repeat(40),
  head_sha: 'b'.repeat(40), reviewer: 'claude-local', max_minutes: 15, focus: ['Boundaries'] };

test('MCP exposes only read-only reference and preparation tools', async () => {
  const registered = tools();
  assert.deepEqual(registered.map(item => item.name), ['get_agent_interfaces', 'prepare_review_handoff']);
  for (const item of registered) {
    assert.equal(item.config.annotations.readOnlyHint, true);
    assert.equal(item.config.annotations.destructiveHint, false);
  }
  assert.equal(registered[0].config.inputSchema.safeParse({ token: 'secret' }).success, false);
  const response = await registered[0].handler({} as never);
  const catalog = (response.structuredContent as { catalog: { dispatch: boolean } }).catalog;
  assert.equal(catalog.dispatch, false);
});
test('MCP rejects permission fields and preserves the helper preparation boundary', async () => {
  const tool = tools()[1];
  assert.equal(tool.config.inputSchema.safeParse({ ...input, approved: true }).success, false);
  const parsed = tool.config.inputSchema.parse(input);
  const response = await tool.handler(parsed as never);
  const preparation = (response.structuredContent as { preparation: { dispatch: boolean; authority: string } }).preparation;
  assert.equal(preparation.dispatch, false);
  assert.equal(preparation.authority, 'not_evaluated');
});
test('invalid helper data returns a bounded error without source values', async () => {
  const response = await tools()[1].handler({ ...input, repository: 'https://user:private-token@example.com' } as never);
  assert.equal(response.isError, true);
  assert.ok(!JSON.stringify(response).includes('private-token'));
});
