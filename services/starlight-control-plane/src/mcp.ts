// MCP over Streamable HTTP, JSON responses only, no sessions. Speaks both eras: the stateless
// 2026-07-28 revision (server/discover, per-request _meta) and the initialize handshake that
// most clients still send. Every tool is the same queue operation the REST routes call.

import type { Identity, Role } from './core.ts';
import type { Op, QueueStub } from './handler.ts';

export const MODERN_VERSION = '2026-07-28';
export const LEGACY_VERSIONS = ['2025-11-25', '2025-06-18'];
export const SUPPORTED_VERSIONS = [MODERN_VERSION, ...LEGACY_VERSIONS];
const SERVER_INFO = { name: 'starlight-control-plane', version: '0.1.0' };
const UNSUPPORTED_VERSION = -32022;
const HEADER_MISMATCH = -32020;

// 2026-07-28 requests repeat their version, method and tool name in headers so gateways can route
// without parsing the body. If the two disagree, a gateway and this server could decide different
// things about the same request, so any gap is a 400.
function modernHeaderProblem(
  request: Request, method: string, params: Record<string, unknown>, header: string | null, metaVersion: unknown,
): string | null {
  if (header !== MODERN_VERSION || metaVersion !== MODERN_VERSION) {
    return 'MCP-Protocol-Version header and _meta protocolVersion must both be present and equal';
  }
  if (request.headers.get('mcp-method') !== method) return 'Mcp-Method header must match the request method';
  if (method === 'tools/call' && request.headers.get('mcp-name') !== params.name) {
    return 'Mcp-Name header must match the tool name';
  }
  return null;
}

const INSTRUCTIONS = 'The Starlight estate task queue. Workers claim_task, do the work, heartbeat_task while it '
  + 'runs, then complete_task with an evidence path (a PR, a receipt file). Verification must come from a '
  + 'different model provider than the maker. Tasks gated for money, publishing, sends, DNS, secrets, '
  + 'credentials, destructive or legal actions wait for a human approval.';

interface ToolDef {
  op: Op;
  role: Role | null;
  description: string;
  properties: Record<string, unknown>;
  required: string[];
}

const ID = { type: 'string', description: 'Task id' };
const TOOLS: Record<string, ToolDef> = {
  queue_status: { op: 'status', role: null, description: 'Counts by state and the live leases.', properties: {}, required: [] },
  get_task: { op: 'get', role: null, description: 'One task with its lease and full event log.', properties: { id: ID }, required: ['id'] },
  enqueue_task: {
    op: 'enqueue', role: 'producer', description: 'Add a task. A supplied id makes the call idempotent.',
    properties: {
      id: { type: 'string' },
      title: { type: 'string', maxLength: 200 },
      doneCondition: { type: 'string', description: 'How anyone can check the task is finished' },
      priority: { type: 'integer', minimum: 1, maximum: 9, description: '1 is most urgent' },
      repo: { type: 'string', description: 'Bare repository name' },
      paths: { type: 'array', items: { type: 'string' }, description: 'Repo-relative paths the task will write' },
      gates: { type: 'array', items: { type: 'string' }, minItems: 1, description: 'Every gate that applies: money, publish, external-send, dns, secrets, credentials, destructive, legal. Use ["none"] only when none apply.' },
      maxMinutes: { type: 'integer', minimum: 1, maximum: 480 },
      maxAttempts: { type: 'integer', minimum: 1, maximum: 10 },
    },
    required: ['title', 'doneCondition', 'priority', 'repo', 'paths', 'gates'],
  },
  claim_task: {
    op: 'claim', role: 'worker', description: 'Lease the most urgent ready task whose paths no live lease holds. Returns task: null when nothing fits.',
    properties: { repo: { type: 'string', description: 'Only claim from this repository' } }, required: [],
  },
  heartbeat_task: { op: 'heartbeat', role: 'worker', description: 'Extend your lease, up to the task time box.', properties: { id: ID }, required: ['id'] },
  complete_task: {
    op: 'complete', role: 'worker', description: 'Hand finished work to verification. Needs an evidence path.',
    properties: { id: ID, resultRef: { type: 'string', description: 'PR URL, commit, or receipt path' } }, required: ['id', 'resultRef'],
  },
  release_task: {
    op: 'release', role: 'worker', description: 'Give a task back. Counts as an attempt.',
    properties: { id: ID, reason: { type: 'string' } }, required: ['id'],
  },
  verify_task: {
    op: 'verify', role: 'verifier', description: 'Pass or fail completed work. You must be a different provider than the maker.',
    properties: { id: ID, verdict: { type: 'string', enum: ['pass', 'fail'] }, note: { type: 'string' } }, required: ['id', 'verdict'],
  },
  approve_task: { op: 'approve', role: 'human', description: 'Release a gated task so agents may stage it.', properties: { id: ID }, required: ['id'] },
};

function allowed(who: Identity, tool: ToolDef): boolean {
  return tool.role === null || who.roles.includes(tool.role);
}

type JsonRpcId = string | number;

function rpc(id: JsonRpcId | null, payload: { result: unknown } | { error: unknown }, status = 200): Response {
  return new Response(JSON.stringify({ jsonrpc: '2.0', id, ...payload }), {
    status, headers: { 'content-type': 'application/json' },
  });
}

function complete(result: Record<string, unknown>) {
  return { result: { ...result, resultType: 'complete', _meta: { 'io.modelcontextprotocol/serverInfo': SERVER_INFO } } };
}

function errorResult(id: JsonRpcId | null, code: number, message: string, data?: unknown, status = 200): Response {
  return rpc(id, { error: data === undefined ? { code, message } : { code, message, data } }, status);
}

export async function handleMcp(request: Request, who: Identity, stub: QueueStub, body: unknown): Promise<Response> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return errorResult(null, -32600, 'body must be one JSON-RPC request or notification', undefined, 400);
  }
  const msg = body as Record<string, unknown>;
  if (msg.jsonrpc !== '2.0' || typeof msg.method !== 'string') {
    return errorResult(null, -32600, 'not a JSON-RPC 2.0 message', undefined, 400);
  }
  if (msg.id === undefined) return new Response(null, { status: 202 });
  if (typeof msg.id !== 'string' && typeof msg.id !== 'number') {
    return errorResult(null, -32600, 'id must be a string or number', undefined, 400);
  }
  const id = msg.id;
  const params = (msg.params && typeof msg.params === 'object' ? msg.params : {}) as Record<string, unknown>;

  const header = request.headers.get('mcp-protocol-version');
  if (header !== null && !SUPPORTED_VERSIONS.includes(header)) {
    return errorResult(id, UNSUPPORTED_VERSION, 'Unsupported protocol version', { supported: SUPPORTED_VERSIONS, requested: header }, 400);
  }
  const metaVersion = (params._meta as Record<string, unknown> | undefined)?.['io.modelcontextprotocol/protocolVersion'];
  if (header === MODERN_VERSION || metaVersion !== undefined) {
    const problem = modernHeaderProblem(request, msg.method, params, header, metaVersion);
    if (problem) return errorResult(id, HEADER_MISMATCH, problem, undefined, 400);
  }

  switch (msg.method) {
    case 'initialize': {
      const asked = params.protocolVersion;
      const version = typeof asked === 'string' && LEGACY_VERSIONS.includes(asked) ? asked : LEGACY_VERSIONS[0];
      return rpc(id, complete({ protocolVersion: version, capabilities: { tools: {} }, serverInfo: SERVER_INFO, instructions: INSTRUCTIONS }));
    }
    case 'server/discover':
      return rpc(id, complete({ supportedVersions: SUPPORTED_VERSIONS, capabilities: { tools: {} }, instructions: INSTRUCTIONS }));
    case 'ping':
      return rpc(id, complete({}));
    case 'tools/list': {
      const tools = Object.entries(TOOLS).filter(([, t]) => allowed(who, t)).map(([name, t]) => ({
        name,
        description: t.description,
        inputSchema: { type: 'object', properties: t.properties, required: t.required, additionalProperties: false },
      }));
      return rpc(id, complete({ tools }));
    }
    case 'tools/call': {
      const name = params.name;
      const tool = typeof name === 'string' && Object.hasOwn(TOOLS, name) ? TOOLS[name] : undefined;
      if (!tool) return errorResult(id, -32602, `unknown tool ${String(name)}`);
      const args = params.arguments && typeof params.arguments === 'object' && !Array.isArray(params.arguments)
        ? params.arguments as Record<string, unknown> : {};
      if (!allowed(who, tool)) {
        return rpc(id, complete({ content: [{ type: 'text', text: `role ${tool.role} required` }], isError: true }));
      }
      const out = await stub.run(tool.op, who, args);
      const failed = out.status >= 400;
      return rpc(id, complete({
        content: [{ type: 'text', text: JSON.stringify(out.body) }],
        ...(failed ? { isError: true } : { structuredContent: out.body }),
      }));
    }
    default:
      return errorResult(id, -32601, `method ${msg.method} not found`);
  }
}
