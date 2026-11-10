#!/usr/bin/env node
// Shell client for the control plane, for harnesses that cannot speak MCP (Hermes, Windows
// tasks, plain scripts). Prints JSON; exit 0 on success, 1 on a refused call, 2 on usage errors.
//
//   CONTROL_PLANE_URL=https://... CONTROL_PLANE_TOKEN=... node scripts/cp.mjs claim [--repo r]
//   node scripts/cp.mjs status | get <id> | heartbeat <id> <fence> | complete <id> <fence> <resultRef>
//   node scripts/cp.mjs release <id> <fence> [reason] | verify <id> pass|fail [note] | approve <id>
//   node scripts/cp.mjs enqueue <task.json>
// <fence> is the value claim printed. A refused heartbeat means the lease is gone: stop writing.

import { readFileSync } from 'node:fs';

const USAGE = 'usage: cp.mjs status | get <id> | claim [--repo r] | heartbeat <id> <fence> | complete <id> <fence> <resultRef> | '
  + 'release <id> <fence> [reason] | verify <id> pass|fail [note] | approve <id> | enqueue <task.json>';

export function buildRequest(argv) {
  const [cmd, ...rest] = argv;
  const id = rest[0];
  const need = (n) => {
    if (rest.length < n) throw new Error(USAGE);
  };
  const task = (action, body = {}) => {
    need(1);
    return { method: 'POST', path: `/v1/tasks/${encodeURIComponent(id)}/${action}`, body };
  };
  switch (cmd) {
    case 'status': return { method: 'GET', path: '/v1/status' };
    case 'get': need(1); return { method: 'GET', path: `/v1/tasks/${encodeURIComponent(id)}` };
    case 'claim': {
      const i = rest.indexOf('--repo');
      return { method: 'POST', path: '/v1/tasks/claim', body: i >= 0 && rest[i + 1] ? { repo: rest[i + 1] } : {} };
    }
    case 'heartbeat': need(2); return task('heartbeat', { fence: rest[1] });
    case 'complete': need(3); return task('complete', { fence: rest[1], resultRef: rest[2] });
    case 'release': need(2); return task('release', { fence: rest[1], ...(rest[2] ? { reason: rest.slice(2).join(' ') } : {}) });
    case 'verify': need(2); return task('verify', { verdict: rest[1], note: rest.slice(2).join(' ') });
    case 'approve': return task('approve');
    case 'enqueue': need(1); return { method: 'POST', path: '/v1/tasks', body: JSON.parse(readFileSync(rest[0], 'utf8')) };
    default: throw new Error(USAGE);
  }
}

export async function run(argv, env = process.env, fetchImpl = fetch) {
  const base = env.CONTROL_PLANE_URL;
  const token = env.CONTROL_PLANE_TOKEN;
  if (!base || !token) return { code: 2, out: { error: 'set CONTROL_PLANE_URL and CONTROL_PLANE_TOKEN' } };
  if (!/^https:\/\//.test(base) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(base.replace(/\/$/, ''))) {
    // The token is a bearer credential; never send it over plain HTTP to a remote host.
    return { code: 2, out: { error: 'CONTROL_PLANE_URL must be https (or http://localhost)' } };
  }
  let req;
  try {
    req = buildRequest(argv);
  } catch (err) {
    return { code: 2, out: { error: err.message } };
  }
  const res = await fetchImpl(new URL(req.path, base), {
    method: req.method,
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: req.body === undefined ? undefined : JSON.stringify(req.body),
  });
  const text = await res.text();
  let out;
  try {
    out = JSON.parse(text);
  } catch {
    out = { error: `non-JSON response (${res.status})`, body: text.slice(0, 500) };
  }
  return { code: res.ok ? 0 : 1, out };
}

if (process.argv[1]?.endsWith('cp.mjs')) {
  const { code, out } = await run(process.argv.slice(2));
  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  process.exit(code);
}
