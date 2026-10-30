// HTTP surface. Authenticates the caller, then forwards one operation to the single queue
// Durable Object. Kept free of Cloudflare imports so node --test can drive it with a fake stub.

import { PROVIDERS, type Identity, type Role } from './core.ts';
import { handleMcp } from './mcp.ts';

export type Op =
  | 'enqueue' | 'approve' | 'claim' | 'heartbeat' | 'complete' | 'release' | 'verify' | 'get' | 'status';

export interface QueueStub {
  run(op: Op, who: Identity, args: Record<string, unknown>): Promise<{ status: number; body: unknown }>;
}

export interface HandlerEnv {
  // JSON object: sha256(token) hex -> Identity. Set with `wrangler secret put AGENT_TOKENS`.
  AGENT_TOKENS?: string;
}

const ROLES = new Set<Role>(['producer', 'worker', 'verifier', 'human']);
const MAX_BODY_BYTES = 16 * 1024;

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

function isIdentity(v: unknown): v is Identity {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return ['agentId', 'harness', 'provider'].every((k) => typeof o[k] === 'string' && (o[k] as string).length > 0)
    && PROVIDERS.has(o.provider as string)
    && Array.isArray(o.roles) && o.roles.length > 0 && o.roles.every((r) => ROLES.has(r as Role));
}

export async function authenticate(request: Request, env: HandlerEnv): Promise<Identity | null> {
  const header = request.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(\S{16,})$/.exec(header);
  if (!match || !env.AGENT_TOKENS) return null;
  let table: Record<string, unknown>;
  try {
    table = JSON.parse(env.AGENT_TOKENS);
  } catch {
    // A malformed token table must lock everyone out, never fall open.
    return null;
  }
  // Leases are held by agentId; two credentials sharing one would act on each other's work.
  const ids = Object.values(table).map((v) => (v as Record<string, unknown>)?.agentId);
  if (new Set(ids).size !== ids.length) return null;
  const who = table[await sha256Hex(match[1])];
  return isIdentity(who) ? who : null;
}

async function readBody(request: Request): Promise<Record<string, unknown> | Response> {
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return json(413, { error: 'body too large' });
  if (!text) return {};
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : json(400, { error: 'body must be a JSON object' });
  } catch {
    return json(400, { error: 'body is not JSON' });
  }
}

const TASK_ACTIONS: Record<string, Op> = {
  approve: 'approve', heartbeat: 'heartbeat', complete: 'complete', release: 'release', verify: 'verify',
};

export async function handleRequest(request: Request, env: HandlerEnv, stub: QueueStub): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method.toUpperCase();
  if (url.pathname === '/health' && method === 'GET') return json(200, { ok: true });

  const who = await authenticate(request, env);
  if (!who) return json(401, { error: 'unauthorized' });

  if (url.pathname === '/mcp') {
    // No server-initiated stream is offered, so GET is refused as the transport allows.
    if (method !== 'POST') return new Response(null, { status: 405, headers: { allow: 'POST' } });
    const body = await readBody(request);
    if (body instanceof Response) return body;
    return handleMcp(request, who, stub, body);
  }

  let op: Op | null = null;
  let args: Record<string, unknown> = {};
  const taskPath = /^\/v1\/tasks\/([\w.:-]{1,100})(?:\/(\w+))?$/.exec(url.pathname);

  if (url.pathname === '/v1/status' && method === 'GET') op = 'status';
  else if (url.pathname === '/v1/tasks' && method === 'POST') op = 'enqueue';
  else if (url.pathname === '/v1/tasks/claim' && method === 'POST') op = 'claim';
  else if (taskPath && !taskPath[2] && method === 'GET') {
    op = 'get';
    args = { id: taskPath[1] };
  } else if (taskPath && taskPath[2] && method === 'POST' && TASK_ACTIONS[taskPath[2]]) {
    op = TASK_ACTIONS[taskPath[2]];
    args = { id: taskPath[1] };
  }
  if (!op) return json(404, { error: 'not found' });

  if (method === 'POST') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    args = { ...body, ...args };
  }
  const result = await stub.run(op, who, args);
  return json(result.status, result.body);
}
