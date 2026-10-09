#!/usr/bin/env node
/**
 * Starlight Alexandria — MCP server (JSON-RPC 2.0 over stdio).
 *
 * Five tools, one door. Any MCP client (Claude Code, Codex, Gemini CLI, a
 * managed agent) gets the same catalogue, the same budget gate, and the same
 * receipts the swarm uses internally.
 *
 *   alexandria_find        — rank capabilities for a need (free)
 *   alexandria_plan        — candidates + recommended + price before calling (free)
 *   alexandria_execute     — run one capability under the session budget
 *   alexandria_receipts    — read the receipt ledger
 *   alexandria_experiments — list the Forge registry, overdue first
 *
 * Env: FIRECRAWL_API_KEY (optional; without it only native providers run),
 *      ALEXANDRIA_MAX_CREDITS (default 200), ALEXANDRIA_LEDGER (default
 *      ~/.starlight/alexandria/receipts.jsonl).
 *
 * Built on SIP — operational tier (Domain Sub-Stack: Alexandria).
 */

import { createInterface } from 'node:readline';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Library, REPO_ROOT } from './catalog.js';
import { loadExperiments, overdue } from './experiments.js';
import { ReceiptLedger } from './receipts.js';
import { Alexandria, AlexandriaError } from './router.js';
import { FirecrawlTransport, NativeTransport } from './transport.js';
import type { Transport } from './types.js';

const PROTOCOL_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];
const PACKAGE_VERSION = '0.1.0';

interface JsonRpcRequest { jsonrpc?: string; id?: string | number | null; method: string; params?: unknown }
interface JsonRpcResponse { jsonrpc: '2.0'; id: string | number | null; result?: unknown; error?: { code: number; message: string } }

interface ToolDef {
  name: string;
  title: string;
  description: string;
  inputSchema: { type: 'object'; properties: Record<string, unknown>; required?: string[]; additionalProperties: false };
  annotations: { readOnlyHint: boolean; destructiveHint: boolean; idempotentHint: boolean; openWorldHint: boolean };
}

function toolError(message: string, hint: string) {
  return { isError: true, content: [{ type: 'text', text: `${message}\n\nHint: ${hint}` }] };
}

function validateArgs(schema: ToolDef['inputSchema'], raw: unknown): string | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return 'arguments must be an object';
  const args = raw as Record<string, unknown>;
  for (const key of Object.keys(args)) if (!(key in schema.properties)) return `unknown argument: ${key}`;
  for (const key of schema.required ?? []) if (args[key] === undefined) return `missing argument: ${key}`;
  for (const [key, def] of Object.entries(schema.properties)) {
    const v = args[key];
    if (v === undefined) continue;
    const type = (def as { type: string }).type;
    if (type === 'string' && typeof v !== 'string') return `${key} must be a string`;
    if (type === 'number' && typeof v !== 'number') return `${key} must be a number`;
    if (type === 'object' && (!v || typeof v !== 'object' || Array.isArray(v))) return `${key} must be an object`;
    if (type === 'array' && !Array.isArray(v)) return `${key} must be an array`;
  }
  return null;
}

export class AlexandriaMcpServer {
  readonly tools: ToolDef[];
  private readonly alexandria: Alexandria;
  private readonly ledger: ReceiptLedger;
  private readonly experimentsPath?: string;

  constructor(opts: { alexandria: Alexandria; ledger: ReceiptLedger; experimentsPath?: string }) {
    this.alexandria = opts.alexandria;
    this.ledger = opts.ledger;
    this.experimentsPath = opts.experimentsPath;
    const ro = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
    this.tools = [
      { name: 'alexandria_find', title: 'Find capabilities', description: 'Rank catalogued capabilities for a plain-language need. Free; no provider is called.', inputSchema: { type: 'object', properties: { need: { type: 'string', description: 'What you need, e.g. "wallet profile on solana" or "funding rounds for a company".' }, limit: { type: 'number', description: 'Max hits (default 10).' }, maxCredits: { type: 'number', description: 'Exclude capabilities costing more per call.' } }, required: ['need'], additionalProperties: false }, annotations: ro },
      { name: 'alexandria_plan', title: 'Plan a call', description: 'Candidates with price, required options and the recommended capability. Free.', inputSchema: { type: 'object', properties: { need: { type: 'string', description: 'The need to plan for.' } }, required: ['need'], additionalProperties: false }, annotations: ro },
      { name: 'alexandria_execute', title: 'Execute a capability', description: 'Run one catalogued capability under the session credit budget. Over-budget calls are refused before any charge. Returns records and a receipt.', inputSchema: { type: 'object', properties: { capabilityId: { type: 'string', description: '<provider>/<capability>, from alexandria_plan.' }, need: { type: 'string', description: 'Alternative to capabilityId: resolve the need first.' }, options: { type: 'object', description: 'Provider options per the contract.' }, expectedRecords: { type: 'number', description: 'For per-record pricing: how many records you expect.' }, sipLayers: { type: 'array', description: 'SIP layers this record composes; emits the attestation block only when non-empty.' } }, additionalProperties: false }, annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true } },
      { name: 'alexandria_receipts', title: 'Read receipts', description: 'Receipts from the session ledger, newest first, with total credits spent.', inputSchema: { type: 'object', properties: { limit: { type: 'number', description: 'Max receipts (default 20).' } }, additionalProperties: false }, annotations: ro },
      { name: 'alexandria_experiments', title: 'List experiments', description: 'The Forge registry: open experiments with metric, falsifier, budget and close date. Overdue first.', inputSchema: { type: 'object', properties: { status: { type: 'string', description: 'Filter by status.' } }, additionalProperties: false }, annotations: ro },
    ];
  }

  async call(name: string, args: Record<string, unknown>): Promise<unknown> {
    switch (name) {
      case 'alexandria_find': {
        const opts: { limit?: number; maxCredits?: number } = {};
        if (typeof args.limit === 'number') opts.limit = args.limit;
        if (typeof args.maxCredits === 'number') opts.maxCredits = args.maxCredits;
        return { hits: this.alexandria.library.find(String(args.need), opts).map((h) => ({ capabilityId: h.capability.id, name: h.capability.name, provider: h.provider.id, kind: h.provider.kind, score: h.score, creditsCost: h.capability.creditsCost, perRecord: h.capability.perRecord, description: h.capability.description })) };
      }
      case 'alexandria_plan': return this.alexandria.plan(String(args.need));
      case 'alexandria_execute': {
        const req: Parameters<Alexandria['execute']>[0] = {};
        if (typeof args.capabilityId === 'string') req.capabilityId = args.capabilityId;
        if (typeof args.need === 'string') req.need = args.need;
        if (args.options && typeof args.options === 'object') req.options = args.options as Record<string, unknown>;
        if (typeof args.expectedRecords === 'number') req.expectedRecords = args.expectedRecords;
        if (Array.isArray(args.sipLayers)) req.sipLayers = args.sipLayers.map(String);
        const res = await this.alexandria.execute(req);
        return { capabilityId: res.hit.capability.id, records: res.result.records, receipt: res.receipt, budget: res.budget };
      }
      case 'alexandria_receipts': {
        const all = this.ledger.read().reverse();
        const limit = typeof args.limit === 'number' ? args.limit : 20;
        return { spent: this.ledger.spent(), receipts: all.slice(0, Math.max(1, limit)) };
      }
      case 'alexandria_experiments': {
        const list = loadExperiments(this.experimentsPath);
        const today = new Date().toISOString().slice(0, 10);
        const late = overdue(list, today);
        const lateIds = new Set(late.map((e) => e.id));
        const rest = list.filter((e) => !lateIds.has(e.id));
        const ordered = [...late, ...rest].filter((e) => !args.status || e.status === args.status);
        return { overdue: late.length, experiments: ordered };
      }
      default: throw new Error(`Unknown tool: ${name}`);
    }
  }

  async handleRequest(request: JsonRpcRequest): Promise<JsonRpcResponse | null> {
    const { method, params, id } = request;
    if (method.startsWith('notifications/')) return null;
    const rpcId = id ?? null;
    if (method === 'initialize') {
      const requested = (params as { protocolVersion?: string } | undefined)?.protocolVersion;
      return { jsonrpc: '2.0', id: rpcId, result: { protocolVersion: requested && PROTOCOL_VERSIONS.includes(requested) ? requested : PROTOCOL_VERSIONS[0], capabilities: { tools: {} }, serverInfo: { name: 'starlight-alexandria', title: 'Starlight Alexandria', version: PACKAGE_VERSION }, instructions: 'Catalogued intelligence with receipts. Start with alexandria_plan; execute only what the plan prices inside budget.' } };
    }
    if (method === 'ping') return { jsonrpc: '2.0', id: rpcId, result: {} };
    if (method === 'tools/list') return { jsonrpc: '2.0', id: rpcId, result: { tools: this.tools } };
    if (method === 'tools/call') {
      const p = (params ?? {}) as Record<string, unknown>;
      const name = String(p.name ?? '');
      const tool = this.tools.find((t) => t.name === name);
      if (!tool) return { jsonrpc: '2.0', id: rpcId, error: { code: -32602, message: `Unknown tool: ${name}` } };
      const invalid = validateArgs(tool.inputSchema, p.arguments ?? {});
      if (invalid) return { jsonrpc: '2.0', id: rpcId, result: toolError(invalid, 'Fix the argument and call again; nothing was charged.') };
      try {
        const result = await this.call(name, p.arguments as Record<string, unknown>);
        return { jsonrpc: '2.0', id: rpcId, result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }], structuredContent: result } };
      } catch (err) {
        const hint = err instanceof AlexandriaError ? err.hint : 'Unexpected failure; check the server log.';
        return { jsonrpc: '2.0', id: rpcId, result: toolError(err instanceof Error ? err.message : String(err), hint) };
      }
    }
    return { jsonrpc: '2.0', id: rpcId, error: { code: -32601, message: `Method not found: ${method}` } };
  }

  start(): void {
    const rl = createInterface({ input: process.stdin, terminal: false });
    rl.on('line', (line) => {
      if (!line.trim()) return;
      let request: unknown;
      try { request = JSON.parse(line); } catch {
        process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }) + '\n');
        return;
      }
      if (typeof request !== 'object' || request === null || Array.isArray(request) || typeof (request as { method?: unknown }).method !== 'string') {
        process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32600, message: 'Invalid Request: expected a JSON-RPC object with a string method' } }) + '\n');
        return;
      }
      void this.handleRequest(request as JsonRpcRequest)
        .catch((err: unknown): JsonRpcResponse => ({ jsonrpc: '2.0', id: (request as JsonRpcRequest).id ?? null, error: { code: -32603, message: err instanceof Error ? err.message : String(err) } }))
        .then((response) => { if (response) process.stdout.write(JSON.stringify(response) + '\n'); });
    });
    process.stderr.write(`[starlight-alexandria] MCP server started, budget ${this.alexandria.budget.maxCredits} credits, ledger ${this.ledger.path}\n`);
  }
}

export function createDefaultServer(): AlexandriaMcpServer {
  const ledger = new ReceiptLedger(process.env.ALEXANDRIA_LEDGER ?? join(homedir(), '.starlight', 'alexandria', 'receipts.jsonl'));
  const transports: Transport[] = [new NativeTransport(REPO_ROOT)];
  if (process.env.FIRECRAWL_API_KEY) transports.push(new FirecrawlTransport());
  else process.stderr.write('[starlight-alexandria] FIRECRAWL_API_KEY not set: only native providers will execute\n');
  const alexandria = new Alexandria({ library: Library.fromFile(), transports, maxCredits: Number(process.env.ALEXANDRIA_MAX_CREDITS ?? 200), ledger });
  return new AlexandriaMcpServer({ alexandria, ledger });
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) createDefaultServer().start();
