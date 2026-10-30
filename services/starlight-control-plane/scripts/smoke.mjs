#!/usr/bin/env node
// Post-deploy check: is the Worker up, does it refuse strangers, does a real token get in over
// REST and MCP with the tools its job needs. Read-only; it never enqueues or claims.
//
//   CONTROL_PLANE_URL=https://... CONTROL_PLANE_TOKEN=... node scripts/smoke.mjs [--expect claim_task,verify_task]
// --expect names tools this token must be offered; without it, the token must be offered at least
// one tool that acts on the queue. Prints one line per check; exit 0 when all pass, 1 when any
// fails, 2 on usage errors.

const BASE_OK = /^(https:\/\/|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$)/;
const READ_ONLY = new Set(['queue_status', 'get_task']);
const STRANGER = `cp_smoke-not-a-real-token-${'0'.repeat(20)}`;

export async function smoke(env = process.env, fetchImpl = fetch, argv = []) {
  const base = env.CONTROL_PLANE_URL;
  const token = env.CONTROL_PLANE_TOKEN;
  if (!base || !token) return { code: 2, lines: ['set CONTROL_PLANE_URL and CONTROL_PLANE_TOKEN'] };
  if (!BASE_OK.test(base)) return { code: 2, lines: ['CONTROL_PLANE_URL must be https (or http://localhost)'] };
  const i = argv.indexOf('--expect');
  const expect = i >= 0 ? (argv[i + 1] ?? '').split(',').filter(Boolean) : [];

  const call = (path, { bearer = token, method = 'GET', body, headers = {} } = {}) => fetchImpl(new URL(path, base), {
    method,
    headers: { ...(bearer ? { authorization: `Bearer ${bearer}` } : {}), 'content-type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const rpc = (method, params) => call('/mcp', {
    method: 'POST', body: { jsonrpc: '2.0', id: 1, method, params }, headers: { accept: 'application/json, text/event-stream' },
  });
  let tools = [];

  const checks = [
    ['health answers without a token', async () => (await call('/health', { bearer: null })).status === 200],
    ['status refuses a missing token', async () => (await call('/v1/status', { bearer: null })).status === 401],
    ['status refuses an unknown token', async () => (await call('/v1/status', { bearer: STRANGER })).status === 401],
    ['status accepts this token', async () => (await call('/v1/status')).status === 200],
    ['MCP initialize succeeds', async () => {
      const res = await rpc('initialize', { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'smoke', version: '1' } });
      return res.status === 200 && Boolean((await res.json()).result?.protocolVersion);
    }],
    [expect.length ? `MCP offers ${expect.join(', ')}` : 'MCP offers this token a tool that acts on the queue', async () => {
      const res = await rpc('tools/list', {});
      if (res.status !== 200) return false;
      tools = ((await res.json()).result?.tools ?? []).map((t) => t.name);
      return expect.length ? expect.every((t) => tools.includes(t)) : tools.some((t) => !READ_ONLY.has(t));
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
  lines.push(`tools offered: ${tools.join(', ') || 'none'}`);
  return { code: failed ? 1 : 0, lines };
}

if (process.argv[1]?.endsWith('smoke.mjs')) {
  const { code, lines } = await smoke(process.env, fetch, process.argv.slice(2));
  process.stdout.write(`${lines.join('\n')}\n`);
  process.exit(code);
}
