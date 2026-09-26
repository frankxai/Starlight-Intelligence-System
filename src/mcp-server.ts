#!/usr/bin/env node
/**
 * Starlight Intelligence System — MCP Server (v6.0)
 *
 * Exposes vault operations as MCP tools over stdio transport.
 * Uses raw JSON-RPC 2.0 over stdin/stdout — zero external dependencies.
 *
 * Usage: node dist/mcp-server.js [--vault-dir ~/.starlight/vaults]
 */
import { createInterface } from 'node:readline';
import { readFileSync, writeFileSync, appendFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { homedir } from 'node:os';
import { randomUUID } from 'node:crypto';
import type { TemporalMeta, ContradictionRecord } from './types.js';
import { getPackageVersion } from './version.js';
import { seedVaults, vaultsAreEmpty } from './seed.js';
import { GoalOrchestrator } from './goal.js';

// ── Interfaces ────────────────────────────────────────────────
export interface McpToolAnnotations {
  readOnlyHint: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint: boolean;
}
export interface McpTool {
  name: string;
  title: string;
  description: string;
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
  annotations: McpToolAnnotations;
}
export interface JsonSchema {
  type?: string;
  description?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean;
  items?: JsonSchema;
  enum?: readonly string[];
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  maxItems?: number;
  default?: unknown;
}
interface JsonRpcRequest {
  jsonrpc?: string;
  method: string;
  params?: unknown;
  id?: number | string | null;
}
interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}
interface RawEntry {
  id: string;
  content?: string;
  insight?: string;
  wish?: string;
  vault?: string;
  tags?: string[];
  confidence?: string | number;
  category?: string;
  createdAt: string;
  temporal?: TemporalMeta;
  [key: string]: unknown;
}

/** A failure the agent can act on: returned as isError with a hint, not as a JSON-RPC error. */
export class ToolError extends Error {
  constructor(message: string, readonly hint: string) {
    super(message);
  }
}

// ── Helpers ───────────────────────────────────────────────────
const MS_PER_DAY = 86_400_000;
const VAULT_TYPES = ['strategic', 'technical', 'creative', 'operational', 'wisdom', 'horizon'] as const;
const CONTRADICTIONS = 'contradictions';
/** Newest first; the client's version when we speak it. */
const PROTOCOL_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];

function textOf(e: RawEntry): string { return e.content ?? e.insight ?? e.wish ?? ''; }

function ensureDir(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function readVaultFiles(vaultDir: string): Array<{ file: string; entries: RawEntry[] }> {
  if (!existsSync(vaultDir)) return [];
  return readdirSync(vaultDir)
    .filter(f => f.endsWith('.jsonl') && f !== `${CONTRADICTIONS}.jsonl`)
    .map(file => {
      const entries: RawEntry[] = [];
      for (const line of readFileSync(join(vaultDir, file), 'utf-8').split('\n')) {
        if (!line.trim()) continue;
        try { entries.push(JSON.parse(line)); } catch { /* skip */ }
      }
      return { file, entries };
    });
}

function allEntries(vaultDir: string): Array<RawEntry & { _vault: string }> {
  const out: Array<RawEntry & { _vault: string }> = [];
  for (const { file, entries } of readVaultFiles(vaultDir)) {
    const v = basename(file, '.jsonl');
    for (const e of entries) out.push({ ...e, _vault: e.vault ?? v });
  }
  return out;
}

function wordScore(query: string, text: string): number {
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
  if (!words.length) return 0;
  const lower = text.toLowerCase();
  return words.filter(w => lower.includes(w)).length / words.length;
}

function rewriteVault(vaultDir: string, name: string, entries: RawEntry[]): void {
  writeFileSync(join(vaultDir, `${name}.jsonl`), entries.map(e => JSON.stringify(e)).join('\n') + '\n', 'utf-8');
}

function findEntry(vaultDir: string, id: string) {
  for (const { file, entries } of readVaultFiles(vaultDir)) {
    const entry = entries.find(e => e.id === id);
    if (entry) return { entry, vaultName: basename(file, '.jsonl'), all: entries };
  }
  return null;
}

function requireEntry(vaultDir: string, id: string) {
  const found = findEntry(vaultDir, id);
  if (!found) throw new ToolError(`Entry not found: ${id}`, 'Find the id with sis_search or sis_recent_entries.');
  return found;
}

function isExpired(e: RawEntry): boolean {
  return e.temporal?.validUntil ? new Date(e.temporal.validUntil).getTime() < Date.now() : false;
}

function isStale(e: RawEntry, days: number): boolean {
  const d = e.temporal?.lastConfirmed ?? e.createdAt;
  return d ? (Date.now() - new Date(d).getTime()) / MS_PER_DAY > days : false;
}

function defaultTemporal(e: RawEntry): TemporalMeta {
  return e.temporal ?? { validFrom: e.createdAt, validUntil: null, lastConfirmed: e.createdAt, confidenceDecay: 0.5 };
}

function activeGoal(orchestrator: GoalOrchestrator) {
  const state = orchestrator.loadState();
  if (!state) throw new ToolError('No active SAGE goal found.', 'Start a goal with the starlight CLI before updating or logging to it.');
  return state;
}

// ── Schemas ───────────────────────────────────────────────────
// Vault names become file names: the pattern is what keeps "../" out of the vault directory.
const vaultName = (description: string): JsonSchema => ({ type: 'string', pattern: '^[a-z][a-z0-9_-]{0,39}$', description });
const entryId = (description: string): JsonSchema => ({ type: 'string', minLength: 1, maxLength: 200, description });
const limit = (fallback: number, max: number): JsonSchema => ({
  type: 'integer', minimum: 1, maximum: max, default: fallback, description: `Maximum results (1-${max}, default ${fallback}).`,
});
const input = (properties: Record<string, JsonSchema>, required: string[] = []): JsonSchema => ({
  type: 'object', properties, required, additionalProperties: false,
});
const output = (properties: Record<string, JsonSchema>): JsonSchema => ({
  type: 'object', properties, required: Object.keys(properties),
});
const entryList: JsonSchema = { type: 'array', items: { type: 'object', description: 'A vault entry plus its vault name.' } };
const READ: McpToolAnnotations = { readOnlyHint: true, openWorldHint: false };
const APPEND: McpToolAnnotations = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false };

/** Enforces the subset of JSON Schema the tools declare, so the advertised bounds are real. */
export function validateArgs(schema: JsonSchema, args: Record<string, unknown>): string | null {
  for (const key of schema.required ?? []) {
    if (args[key] === undefined) return `Missing required argument "${key}".`;
  }
  for (const [key, value] of Object.entries(args)) {
    const prop = schema.properties?.[key];
    if (!prop) {
      if (schema.additionalProperties === false) return `Unknown argument "${key}". Allowed: ${Object.keys(schema.properties ?? {}).join(', ') || 'none'}.`;
      continue;
    }
    const problem = checkValue(prop, value);
    if (problem) return `Argument "${key}" ${problem}`;
  }
  return null;
}

function checkValue(schema: JsonSchema, value: unknown): string | null {
  switch (schema.type) {
    case 'string':
      if (typeof value !== 'string') return 'must be a string.';
      if (schema.minLength !== undefined && value.length < schema.minLength) return `must be at least ${schema.minLength} characters.`;
      if (schema.maxLength !== undefined && value.length > schema.maxLength) return `must be at most ${schema.maxLength} characters.`;
      if (schema.enum && !schema.enum.includes(value)) return `must be one of: ${schema.enum.join(', ')}.`;
      if (schema.pattern && !new RegExp(schema.pattern).test(value)) return `must match ${schema.pattern}.`;
      return null;
    case 'integer':
    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value)) return 'must be a number.';
      if (schema.type === 'integer' && !Number.isInteger(value)) return 'must be an integer.';
      if (schema.minimum !== undefined && value < schema.minimum) return `must be at least ${schema.minimum}.`;
      if (schema.maximum !== undefined && value > schema.maximum) return `must be at most ${schema.maximum}.`;
      return null;
    case 'boolean':
      return typeof value === 'boolean' ? null : 'must be true or false.';
    case 'array': {
      if (!Array.isArray(value)) return 'must be an array.';
      if (schema.maxItems !== undefined && value.length > schema.maxItems) return `must have at most ${schema.maxItems} items.`;
      for (const item of value) {
        const problem = schema.items ? checkValue(schema.items, item) : null;
        if (problem) return `items: ${problem}`;
      }
      return null;
    }
    default:
      return null;
  }
}

// ── Server ────────────────────────────────────────────────────
export class StarlightMcpServer {
  private tools = new Map<string, { definition: McpTool; handler: (p: Record<string, unknown>) => Record<string, unknown> }>();
  private vaultDir: string;

  constructor(vaultDir: string) {
    this.vaultDir = vaultDir;
    ensureDir(this.vaultDir);
    this.registerTools();
  }

  private reg(def: McpTool, handler: (p: Record<string, unknown>) => Record<string, unknown>): void {
    this.tools.set(def.name, { definition: def, handler });
  }

  private registerTools(): void {
    this.reg({
      name: 'sis_vault_search',
      title: 'Search vaults (simple)',
      description: 'Plain word-overlap search across the vaults; returns up to `limit` entries ranked by the share of query words they contain. Prefer sis_search, which also boosts tags and demotes stale or expired entries.',
      inputSchema: input({
        query: { type: 'string', minLength: 1, maxLength: 500, description: 'Words to look for.' },
        vault: vaultName('Only search this vault, e.g. technical.'),
        limit: limit(10, 100),
      }, ['query']),
      outputSchema: output({ results: entryList }),
      annotations: READ,
    }, (p) => {
      const q = String(p.query), v = p.vault ? String(p.vault) : null, lim = Number(p.limit ?? 10);
      let entries = allEntries(this.vaultDir);
      if (v) entries = entries.filter(e => e._vault === v);
      const results = entries.map(e => ({ ...e, _s: wordScore(q, textOf(e)) }))
        .filter(e => e._s > 0).sort((a, b) => b._s - a._s).slice(0, lim)
        .map(({ _s, _vault, ...r }) => ({ ...r, vault: _vault, score: _s }));
      return { results };
    });

    this.reg({
      name: 'sis_recent_entries',
      title: 'Recent entries',
      description: 'The newest vault entries by creation time, optionally from one vault. Use to see what was just remembered or to orient at the start of a session; returns up to `limit` entries.',
      inputSchema: input({ vault: vaultName('Only this vault, e.g. strategic.'), limit: limit(10, 100) }),
      outputSchema: output({ entries: entryList }),
      annotations: READ,
    }, (p) => {
      const v = p.vault ? String(p.vault) : null, lim = Number(p.limit ?? 10);
      let entries = allEntries(this.vaultDir);
      if (v) entries = entries.filter(e => e._vault === v);
      return {
        entries: entries.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
          .slice(0, lim).map(({ _vault, ...r }) => ({ ...r, vault: _vault })),
      };
    });

    this.reg({
      name: 'sis_stats',
      title: 'Vault statistics',
      description: 'Entry counts per vault and in total. Cheap and takes no input; call it first to see whether the vaults hold anything before searching them.',
      inputSchema: input({}),
      outputSchema: output({ total: { type: 'integer' }, vaults: { type: 'object', description: 'Vault name to entry count.' } }),
      annotations: READ,
    }, () => {
      const counts: Record<string, number> = {}; let total = 0;
      for (const { file, entries } of readVaultFiles(this.vaultDir)) {
        counts[basename(file, '.jsonl')] = entries.length; total += entries.length;
      }
      return { total, vaults: counts };
    });

    this.reg({
      name: 'sis_append_entry',
      title: 'Remember an entry',
      description: 'Append a new memory to a vault on local disk and return its id. Adds a new entry on every call (no deduplication), so check sis_search first when the fact may already be stored.',
      inputSchema: input({
        vault: vaultName(`Target vault; the standard six are ${VAULT_TYPES.join(', ')}.`),
        content: { type: 'string', minLength: 1, maxLength: 20000, description: 'The memory itself, in plain language.' },
        tags: { type: 'array', maxItems: 20, items: { type: 'string', maxLength: 64 }, description: 'Keywords that boost this entry in sis_search.' },
        confidence: { type: 'string', enum: ['low', 'medium', 'high'], description: 'How sure the source is (default medium); sets how fast confidence decays.' },
        category: { type: 'string', pattern: '^[a-z][a-z0-9_-]{0,31}$', description: 'Kind of entry (default insight); standard: pattern, decision, insight, error, preference.' },
      }, ['vault', 'content']),
      outputSchema: output({ success: { type: 'boolean' }, id: { type: 'string' }, vault: { type: 'string' } }),
      annotations: APPEND,
    }, (p) => {
      const vault = String(p.vault), now = new Date().toISOString();
      if (vault === CONTRADICTIONS) throw new ToolError('"contradictions" is reserved.', 'Flag conflicts with sis_contradict instead.');
      const conf = p.confidence === 'high' ? 0.9 : p.confidence === 'low' ? 0.3 : 0.6;
      const entry: RawEntry = {
        id: `sis_${Date.now()}_${randomUUID().slice(0, 8)}`,
        content: String(p.content), vault,
        tags: Array.isArray(p.tags) ? p.tags.map(String) : [],
        confidence: p.confidence ? String(p.confidence) : 'medium',
        category: p.category ? String(p.category) : 'insight',
        createdAt: now,
        temporal: { validFrom: now, validUntil: null, lastConfirmed: now, confidenceDecay: conf },
      };
      appendFileSync(join(this.vaultDir, `${vault}.jsonl`), JSON.stringify(entry) + '\n', 'utf-8');
      return { success: true, id: entry.id, vault };
    });

    this.reg({
      name: 'sis_entry_types',
      title: 'Vault types and categories',
      description: 'The standard vault names, entry categories and confidence levels that sis_append_entry accepts. Static and takes no input; call it before writing if unsure where an entry belongs.',
      inputSchema: input({}),
      outputSchema: output({
        vaultTypes: { type: 'array', items: { type: 'string' } },
        categories: { type: 'array', items: { type: 'string' } },
        confidenceLevels: { type: 'array', items: { type: 'string' } },
      }),
      annotations: READ,
    }, () => ({
      vaultTypes: [...VAULT_TYPES],
      categories: ['pattern', 'decision', 'insight', 'error', 'preference'],
      confidenceLevels: ['low', 'medium', 'high'],
    }));

    this.reg({
      name: 'sis_search',
      title: 'Search vaults',
      description: 'Ranked keyword search: word overlap plus a tag boost, minus a penalty for entries unconfirmed for 30 days; expired entries are excluded unless includeExpired. No embeddings. Returns up to `limit` results with the terms each matched.',
      inputSchema: input({
        query: { type: 'string', minLength: 1, maxLength: 500, description: 'Words to look for.' },
        vaults: { type: 'array', maxItems: 20, items: vaultName('Vault name.'), description: 'Only search these vaults.' },
        limit: limit(10, 100),
        includeExpired: { type: 'boolean', description: 'Include entries past their validUntil (default false).' },
      }, ['query']),
      outputSchema: output({ results: entryList }),
      annotations: READ,
    }, (p) => {
      const q = String(p.query), lim = Number(p.limit ?? 10);
      const vf = Array.isArray(p.vaults) ? new Set(p.vaults.map(String)) : null;
      let entries = allEntries(this.vaultDir);
      if (vf) entries = entries.filter(e => vf.has(e._vault));
      if (!p.includeExpired) entries = entries.filter(e => !isExpired(e));
      const terms = q.toLowerCase().split(/\s+/).filter(w => w.length > 1);
      const results = entries.map(e => {
        const base = wordScore(q, textOf(e));
        const tagBoost = (e.tags ?? []).some(t => terms.includes(t.toLowerCase())) ? 0.15 : 0;
        const penalty = isStale(e, 30) ? 0.1 : 0;
        return { e, score: Math.min(1, Math.max(0, base + tagBoost - penalty)) };
      }).filter(r => r.score > 0).sort((a, b) => b.score - a.score).slice(0, lim)
        .map(({ e: { _vault, ...r }, score }) => ({
          ...r, vault: _vault, score: Math.round(score * 1000) / 1000,
          matchedTerms: terms.filter(w => textOf(r as RawEntry).toLowerCase().includes(w)),
        }));
      return { results };
    });

    this.reg({
      name: 'sis_confirm',
      title: 'Confirm an entry is still true',
      description: 'Set an entry\'s lastConfirmed to now so it stops counting as stale in sis_search and sis_stale. Use after checking a remembered fact still holds. Rewrites that vault file on disk.',
      inputSchema: input({ entryId: entryId('Id from sis_search or sis_recent_entries.') }, ['entryId']),
      outputSchema: output({ success: { type: 'boolean' }, entryId: { type: 'string' }, lastConfirmed: { type: 'string' } }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    }, (p) => {
      const id = String(p.entryId), found = requireEntry(this.vaultDir, id);
      const now = new Date().toISOString();
      rewriteVault(this.vaultDir, found.vaultName, found.all.map(e =>
        e.id !== id ? e : { ...e, temporal: { ...defaultTemporal(e), lastConfirmed: now } }
      ));
      return { success: true, entryId: id, lastConfirmed: now };
    });

    this.reg({
      name: 'sis_invalidate',
      title: 'Expire an entry',
      description: 'Mark an entry as no longer true by setting validUntil to now; sis_search then hides it by default. The entry stays on disk, but no tool un-expires it, so use only when the fact is known to be wrong or outdated.',
      inputSchema: input({
        entryId: entryId('Id of the entry to expire.'),
        reason: { type: 'string', maxLength: 1000, description: 'Why it is no longer true; stored on the entry.' },
      }, ['entryId']),
      outputSchema: output({ success: { type: 'boolean' }, entryId: { type: 'string' }, validUntil: { type: 'string' } }),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
    }, (p) => {
      const id = String(p.entryId), reason = p.reason ? String(p.reason) : undefined;
      const found = requireEntry(this.vaultDir, id);
      const now = new Date().toISOString();
      rewriteVault(this.vaultDir, found.vaultName, found.all.map(e => {
        if (e.id !== id) return e;
        const out: RawEntry = { ...e, temporal: { ...defaultTemporal(e), validUntil: now } };
        if (reason) out._invalidationReason = reason;
        return out;
      }));
      return { success: true, entryId: id, validUntil: now, ...(reason ? { reason } : {}) };
    });

    this.reg({
      name: 'sis_contradict',
      title: 'Flag a contradiction',
      description: 'Record that two existing entries disagree, for a human or agent to resolve later. Both ids must exist. Appends a new record on every call; neither entry is changed.',
      inputSchema: input({
        entryIdA: entryId('First entry id.'),
        entryIdB: entryId('Second entry id.'),
        reason: { type: 'string', maxLength: 1000, description: 'What the disagreement is.' },
      }, ['entryIdA', 'entryIdB']),
      outputSchema: output({ success: { type: 'boolean' }, id: { type: 'string' } }),
      annotations: APPEND,
    }, (p) => {
      const a = String(p.entryIdA), b = String(p.entryIdB);
      if (a === b) throw new ToolError('An entry cannot contradict itself.', 'Pass two different entry ids.');
      requireEntry(this.vaultDir, a);
      requireEntry(this.vaultDir, b);
      const record: ContradictionRecord = {
        id: `contra_${Date.now()}_${randomUUID().slice(0, 8)}`,
        entryIdA: a, entryIdB: b,
        reason: p.reason ? String(p.reason) : 'Flagged as contradictory',
        detectedAt: new Date().toISOString(), resolvedAt: null,
      };
      appendFileSync(join(this.vaultDir, `${CONTRADICTIONS}.jsonl`), JSON.stringify(record) + '\n', 'utf-8');
      return { success: true, id: record.id };
    });

    this.reg({
      name: 'sis_stale',
      title: 'Stale entries',
      description: 'Entries not confirmed within `thresholdDays` (default 30), oldest first, with days since confirmation. Use to pick facts to re-check with sis_confirm or retire with sis_invalidate. `count` is the full total; `entries` stops at `limit`.',
      inputSchema: input({
        thresholdDays: { type: 'integer', minimum: 1, maximum: 3650, description: 'Days without confirmation that count as stale (default 30).' },
        limit: limit(50, 500),
      }),
      outputSchema: output({ threshold: { type: 'integer' }, count: { type: 'integer' }, entries: entryList }),
      annotations: READ,
    }, (p) => {
      const th = Number(p.thresholdDays ?? 30), lim = Number(p.limit ?? 50);
      const stale = allEntries(this.vaultDir).filter(e => isStale(e, th))
        .sort((a, b) => (a.temporal?.lastConfirmed ?? a.createdAt ?? '')
          .localeCompare(b.temporal?.lastConfirmed ?? b.createdAt ?? ''));
      const entries = stale.slice(0, lim).map(({ _vault, ...r }) => {
        const c = r.temporal?.lastConfirmed ?? r.createdAt ?? '';
        return { ...r, vault: _vault, daysSinceConfirmed: c ? Math.round((Date.now() - new Date(c).getTime()) / MS_PER_DAY) : -1, isExpired: isExpired(r as RawEntry) };
      });
      return { threshold: th, count: stale.length, entries };
    });

    this.reg({
      name: 'sis_goal_status',
      title: 'SAGE goal status',
      description: 'The active SAGE goal: its checklist, task statuses and log. Returns active=false when no goal is running. Read-only; call before sis_goal_update to get valid task ids.',
      inputSchema: input({}),
      outputSchema: { type: 'object', properties: { active: { type: 'boolean' }, state: { type: 'object' }, message: { type: 'string' } }, required: ['active'] },
      annotations: READ,
    }, () => {
      const state = new GoalOrchestrator().loadState();
      return state ? { active: true, state } : { active: false, message: 'No active SAGE goal found.' };
    });

    this.reg({
      name: 'sis_goal_update',
      title: 'Update a SAGE goal task',
      description: 'Set one checklist task of the active SAGE goal to pending, in-progress or completed, and log the change. Fails with a hint when no goal is active or the task id is unknown; get ids from sis_goal_status.',
      inputSchema: input({
        taskId: { type: 'string', minLength: 1, maxLength: 200, description: 'Task id from sis_goal_status.' },
        status: { type: 'string', enum: ['pending', 'in-progress', 'completed'], description: 'New status.' },
      }, ['taskId', 'status']),
      outputSchema: output({ success: { type: 'boolean' }, taskId: { type: 'string' }, status: { type: 'string' } }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    }, (p) => {
      const orchestrator = new GoalOrchestrator();
      const state = activeGoal(orchestrator);
      const taskId = String(p.taskId);
      const status = p.status as 'pending' | 'in-progress' | 'completed';
      if (!state.checklist.some(t => t.id === taskId)) {
        throw new ToolError(`Unknown task: ${taskId}`, `Valid ids: ${state.checklist.map(t => t.id).join(', ') || 'none'}.`);
      }
      orchestrator.updateTaskStatus(taskId, status);
      return { success: true, taskId, status };
    });

    this.reg({
      name: 'sis_goal_log',
      title: 'Log to the SAGE goal',
      description: 'Append a message to the active SAGE goal\'s log, e.g. progress, a blocker or a decision. Adds a new line on every call. Fails with a hint when no goal is active.',
      inputSchema: input({
        message: { type: 'string', minLength: 1, maxLength: 2000, description: 'What to record.' },
        type: { type: 'string', pattern: '^[a-z][a-z0-9_-]{0,31}$', description: 'Log type, e.g. info, warning, error, decision (default info).' },
      }, ['message']),
      outputSchema: output({ success: { type: 'boolean' }, message: { type: 'string' }, type: { type: 'string' } }),
      annotations: APPEND,
    }, (p) => {
      const orchestrator = new GoalOrchestrator();
      activeGoal(orchestrator);
      const message = String(p.message);
      const type = p.type ? String(p.type) : 'info';
      orchestrator.addLog(type, message);
      return { success: true, message, type };
    });
  }

  // ── JSON-RPC Dispatch ───────────────────────────────────────
  handleRequest(request: JsonRpcRequest): JsonRpcResponse | null {
    const { method, params, id } = request;
    if (method?.startsWith('notifications/')) return null;
    const rpcId = id ?? null;

    if (method === 'initialize') {
      const requested = (params as { protocolVersion?: string } | undefined)?.protocolVersion;
      return { jsonrpc: '2.0', id: rpcId, result: {
        protocolVersion: requested && PROTOCOL_VERSIONS.includes(requested) ? requested : PROTOCOL_VERSIONS[0],
        capabilities: { tools: {} },
        serverInfo: { name: 'starlight-sis', title: 'Starlight Intelligence System', version: getPackageVersion() },
        instructions: 'Local memory vaults. Start with sis_stats or sis_search; write with sis_append_entry; keep facts fresh with sis_confirm and sis_invalidate.',
      }};
    }
    if (method === 'ping') return { jsonrpc: '2.0', id: rpcId, result: {} };
    if (method === 'tools/list') {
      return { jsonrpc: '2.0', id: rpcId, result: {
        tools: Array.from(this.tools.values()).map(t => t.definition),
      }};
    }
    if (method === 'tools/call') {
      const p = (params ?? {}) as Record<string, unknown>;
      const name = String(p.name ?? ''), args = (p.arguments ?? {}) as Record<string, unknown>;
      const tool = this.tools.get(name);
      if (!tool) return { jsonrpc: '2.0', id: rpcId, error: { code: -32602, message: `Unknown tool: ${name}` } };
      const invalid = validateArgs(tool.definition.inputSchema, args);
      if (invalid) return { jsonrpc: '2.0', id: rpcId, result: toolError(invalid, 'Fix the argument and call again; nothing was changed.') };
      try {
        const result = tool.handler(args);
        return { jsonrpc: '2.0', id: rpcId, result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }], structuredContent: result } };
      } catch (err) {
        const hint = err instanceof ToolError ? err.hint : 'Unexpected failure; the vault may be unreadable. Check the server log.';
        return { jsonrpc: '2.0', id: rpcId, result: toolError(err instanceof Error ? err.message : String(err), hint) };
      }
    }
    return { jsonrpc: '2.0', id: rpcId, error: { code: -32601, message: `Method not found: ${method}` } };
  }

  // ── Start ───────────────────────────────────────────────────
  start(): void {
    const rl = createInterface({ input: process.stdin, terminal: false });
    rl.on('line', (line) => {
      if (!line.trim()) return;
      let request: JsonRpcRequest;
      try { request = JSON.parse(line); } catch {
        process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }) + '\n');
        return;
      }
      const response = this.handleRequest(request);
      if (response) process.stdout.write(JSON.stringify(response) + '\n');
    });
    process.stderr.write(`[starlight-sis] MCP server started, vault: ${this.vaultDir}\n`);
  }
}

function toolError(error: string, hint: string) {
  return { content: [{ type: 'text', text: JSON.stringify({ error, hint }) }], isError: true };
}

// ── CLI Entry Point ───────────────────────────────────────────
function main(): void {
  const args = process.argv.slice(2);
  let vaultDir = join(homedir(), '.starlight', 'vaults');
  let noSeed = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--vault-dir' && args[i + 1]) { vaultDir = args[++i]; }
    else if (args[i] === '--no-seed') { noSeed = true; }
  }
  // First-run experience: a fresh install has no vault directory, so the very
  // first sis_vault_search would return nothing and look broken. Seed the six
  // canonical vaults (welcome entry + bundled public examples) when empty, so
  // the empty state is self-explaining. Never touches non-empty vaults.
  if (!noSeed && vaultsAreEmpty(vaultDir)) {
    const seeded = seedVaults(vaultDir);
    process.stderr.write(
      `[starlight-sis] seeded ${seeded.created.length} vaults in ${vaultDir}` +
      `${seeded.usedExamples ? ' (with public examples)' : ''}\n`,
    );
  }
  const server = new StarlightMcpServer(vaultDir);
  server.start();
}

main();
