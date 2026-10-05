#!/usr/bin/env node
// Smoke test for server.js: boot over stdio, list tools, call the read-only ones.
// Uses a throwaway COCKPIT_HOME so it never reads or writes ~/.starlight/cockpit.

import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const EXPECTED_TOOLS = [
  'cockpit_status',
  'cockpit_query_sessions',
  'cockpit_snapshot',
  'cockpit_rehydrate',
  'cockpit_save_workspace',
  'cockpit_load_workspace',
  'cockpit_list_workspaces',
  'cockpit_recent_events',
];
const READ_ONLY_CALLS = ['cockpit_status', 'cockpit_list_workspaces', 'cockpit_recent_events'];

const home = await mkdtemp(path.join(os.tmpdir(), 'cockpit-mcp-test-'));
const client = new Client({ name: 'cockpit-mcp-test', version: '0.0.0' });

try {
  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: [path.join(path.dirname(fileURLToPath(import.meta.url)), 'server.js')],
      env: { ...process.env, COCKPIT_HOME: home },
    })
  );

  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((t) => t.name).sort(), [...EXPECTED_TOOLS].sort());
  for (const tool of tools) {
    assert.ok(tool.description, `${tool.name} has a description`);
    assert.equal(tool.inputSchema.type, 'object', `${tool.name} inputSchema is an object schema`);
  }

  for (const name of READ_ONLY_CALLS) {
    const result = await client.callTool({ name, arguments: {} });
    assert.notEqual(result.isError, true, `${name} returned an error: ${result.content?.[0]?.text}`);
  }

  console.log(`cockpit-continuity MCP smoke test passed (${tools.length} tools)`);
} finally {
  await client.close();
  await rm(home, { recursive: true, force: true });
}
