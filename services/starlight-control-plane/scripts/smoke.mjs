#!/usr/bin/env node
// Post-deploy check: is the Worker up, does it refuse strangers, does a real token get in over
// REST and MCP. Read-only; it never enqueues or claims.
//
//   CONTROL_PLANE_URL=https://... CONTROL_PLANE_TOKEN=... node scripts/smoke.mjs
// Prints one line per check; exit 0 when all pass, 1 when any fails, 2 on usage errors.

const BASE_OK = /^(https:\/\/|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$)/;

export async function smoke(env = process.env, fetchImpl = fetch) {
  const base = env.CONTROL_PLANE_URL;
  const token = env.CONTROL_PLANE_TOKEN;
  if (!base || !token) return { code: 2, lines: ['set CONTROL_PLANE_URL and CONTROL_PLANE_TOKEN'] };
  if (!BASE_OK.test(base)) return { code: 2, lines: ['CONTROL_PLANE_URL must be https (or http://localhost)'] };

  const call = (path, { auth = true, method = 'GET', body, headers = {} } = {}) => fetchImpl(new URL(path, base), {
    method,
    headers: { ...(auth ? { authorization: `Bearer ${token}` } : {}), 'content-type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const rpc = (method, params) => call('/mcp', {
    method: 'POST', body: { jsonrpc: '2.0', id: 1, method, params }, headers: { accept: 'application/json, text/event-stream' },
  });

  const checks = [
    ['health answers without a token', async () => (await call('/health', { auth: false })).status === 200],
    ['status refuses a missing token', async () => (await call('/v1/status', { auth: false })).status === 401],
    ['status accepts this token', async () => (await call('/v1/status')).status === 200],
    ['MCP initialize succeeds', async () => {
      const res = await rpc('initialize', { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'smoke', version: '1' } });
      return res.status === 200 && Boolean((await res.json()).result?.protocolVersion);
    }],
    ['MCP lists tools for this token', async () => {
      const res = await rpc('tools/list', {});
      return res.status === 200 && ((await res.json()).result?.tools?.length ?? 0) > 0;
    }],
  ];

  const lines = [];
  let failed = 0;
  for (const [name, check] of checks) {
    let ok = false;
    let note = '';
    try {
      ok = await check();
    } catch (err) {
      note = ` (${err.message})`;
    }
    if (!ok) failed += 1;
    lines.push(`${ok ? 'PASS' : 'FAIL'} ${name}${note}`);
  }
  return { code: failed ? 1 : 0, lines };
}

if (process.argv[1]?.endsWith('smoke.mjs')) {
  const { code, lines } = await smoke();
  process.stdout.write(`${lines.join('\n')}\n`);
  process.exit(code);
}
