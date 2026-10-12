#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { createStarlightMcpServer } from './index.js';
import { createGatewayReader } from './gateway.js';

try {
  const { values } = parseArgs({ options: {
    help: { type: 'boolean' }, gateway: { type: 'string' }, tenant: { type: 'string' },
    workspace: { type: 'string' }, 'allow-shareable': { type: 'boolean', default: false },
  } });
  if (values.help) {
    process.stdout.write('Usage: starlight-memory-mcp --gateway <origin> --tenant <id> [--workspace <id>] [--allow-shareable]\n'
      + 'Requires STARLIGHT_GATEWAY_TOKEN. Serves read-only MCP over stdio. The gateway must be dedicated to this tenant.\n'
      + 'Workspace mode is rejected: this gateway does not enforce workspace isolation. Use the factory with an authorized scoped provider.\n');
  } else {
    const options = { url: values.gateway ?? '', tenantId: values.tenant ?? '', workspaceId: values.workspace,
      token: process.env.STARLIGHT_GATEWAY_TOKEN ?? '' };
    const memory = createGatewayReader(options);
    await serveStdio(() => createStarlightMcpServer({ ...options, memory, allowShareable: values['allow-shareable'] }));
  }
} catch {
  process.stderr.write('Starlight MCP could not start; check gateway, tenant and credential configuration.\n');
  process.exitCode = 1;
}
