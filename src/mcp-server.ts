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

// ── Interfaces ────────────────────────────────────────────────
export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
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

// ── Helpers ───────────────────────────────────────────────────
const MS_PER_DAY = 86_400_000;
const VAULT_TYPES = ['strategic', 'technical', 'creative', 'operational', 'wisdom', 'horizon'] as const;

function textOf(e: RawEntry): string { return e.content ?? e.insight ?? e.wish ?? ''; }

function ensureDir(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function readVaultFiles(vaultDir: string): Array<{ file: string; entries: RawEntry[] }> {
  if (!existsSync(vaultDir)) return [];
  return readdirSync(vaultDir).filter(f => f.endsWith('.jsonl')).map(file => {
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

// ── Server ────────────────────────────────────────────────────
export class StarlightMcpServer {
  private tools = new Map<string, { definition: McpTool; handler: (p: Record<string, unknown>) => unknown }>();
  private vaultDir: string;

  constructor(vaultDir: string) {
    this.vaultDir = vaultDir;
    ensureDir(this.vaultDir);
    this.registerTools();
  }

  private reg(def: McpTool, handler: (p: Record<string, unknown>) => unknown): void {
    this.tools.set(def.name, { definition: def, handler });
  }

  private registerTools(): void {
    // 1. sis_vault_search
    this.reg({
      name: 'sis_vault_search', description: 'Free-text search across vaults',
      inputSchema: { type: 'object', required: ['query'], properties: {
        query: { type: 'string' }, vault: { type: 'string' }, limit: { type: 'number' },
      }},
    }, (p) => {
      const q = String(p.query ?? ''), v = p.vault ? String(p.vault) : null, lim = Number(p.limit ?? 10);
      let entries = allEntries(this.vaultDir);
      if (v) entries = entries.filter(e => e._vault === v);
      return entries.map(e => ({ ...e, _s: wordScore(q, textOf(e)) }))
        .filter(e => e._s > 0).sort((a, b) => b._s - a._s).slice(0, lim)
        .map(({ _s, _vault, ...r }) => ({ ...r, vault: _vault, score: _s }));
    });

    // 2. sis_recent_entries
    this.reg({
      name: 'sis_recent_entries', description: 'Get latest entries from vaults',
      inputSchema: { type: 'object', properties: { vault: { type: 'string' }, limit: { type: 'number' } }},
    }, (p) => {
      const v = p.vault ? String(p.vault) : null, lim = Number(p.limit ?? 10);
      let entries = allEntries(this.vaultDir);
      if (v) entries = entries.filter(e => e._vault === v);
      return entries.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
        .slice(0, lim).map(({ _vault, ...r }) => ({ ...r, vault: _vault }));
    });

    // 3. sis_stats
    this.reg({
      name: 'sis_stats', description: 'Total entry counts per vault',
      inputSchema: { type: 'object', properties: {} },
    }, () => {
      const counts: Record<string, number> = {}; let total = 0;
      for (const { file, entries } of readVaultFiles(this.vaultDir)) {
        counts[basename(file, '.jsonl')] = entries.length; total += entries.length;
      }
      return { total, vaults: counts };
    });

    // 4. sis_append_entry
    this.reg({
      name: 'sis_append_entry', description: 'Write a new entry to a vault',
      inputSchema: { type: 'object', required: ['vault', 'content'], properties: {
        vault: { type: 'string' }, content: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        confidence: { type: 'string' }, category: { type: 'string' },
      }},
    }, (p) => {
      const vault = String(p.vault), now = new Date().toISOString();
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

    // 5. sis_entry_types
    this.reg({
      name: 'sis_entry_types', description: 'List supported vault types and entry categories',
      inputSchema: { type: 'object', properties: {} },
    }, () => ({
      vaultTypes: [...VAULT_TYPES],
      categories: ['pattern', 'decision', 'insight', 'error', 'preference'],
      confidenceLevels: ['low', 'medium', 'high'],
    }));

    // 6. sis_search — hybrid ranked search with temporal awareness
    this.reg({
      name: 'sis_search', description: 'Hybrid semantic + keyword search with scoring and temporal filtering',
      inputSchema: { type: 'object', required: ['query'], properties: {
        query: { type: 'string' }, vaults: { type: 'array', items: { type: 'string' } },
        limit: { type: 'number' }, includeExpired: { type: 'boolean' },
      }},
    }, (p) => {
      const q = String(p.query ?? ''), lim = Number(p.limit ?? 10);
      const vf = Array.isArray(p.vaults) ? new Set(p.vaults.map(String)) : null;
      let entries = allEntries(this.vaultDir);
      if (vf) entries = entries.filter(e => vf.has(e._vault));
      if (!p.includeExpired) entries = entries.filter(e => !isExpired(e));
      const terms = q.toLowerCase().split(/\s+/).filter(w => w.length > 1);
      return entries.map(e => {
        const base = wordScore(q, textOf(e));
        const tagBoost = (e.tags ?? []).some(t => terms.includes(t.toLowerCase())) ? 0.15 : 0;
        const penalty = isStale(e, 30) ? 0.1 : 0;
        return { e, score: Math.min(1, Math.max(0, base + tagBoost - penalty)) };
      }).filter(r => r.score > 0).sort((a, b) => b.score - a.score).slice(0, lim)
        .map(({ e: { _vault, ...r }, score }) => ({
          ...r, vault: _vault, score: Math.round(score * 1000) / 1000,
          matchedTerms: terms.filter(w => textOf(r as RawEntry).toLowerCase().includes(w)),
        }));
    });

    // 7. sis_confirm — touch lastConfirmed
    this.reg({
      name: 'sis_confirm', description: 'Touch lastConfirmed on an entry to keep it fresh',
      inputSchema: { type: 'object', required: ['entryId'], properties: { entryId: { type: 'string' } }},
    }, (p) => {
      const id = String(p.entryId), found = findEntry(this.vaultDir, id);
      if (!found) return { success: false, error: `Entry not found: ${id}` };
      const now = new Date().toISOString();
      rewriteVault(this.vaultDir, found.vaultName, found.all.map(e =>
        e.id !== id ? e : { ...e, temporal: { ...defaultTemporal(e), lastConfirmed: now } }
      ));
      return { success: true, entryId: id, lastConfirmed: now };
    });

    // 8. sis_invalidate — expire an entry
    this.reg({
      name: 'sis_invalidate', description: 'Mark an entry as expired by setting validUntil to now',
      inputSchema: { type: 'object', required: ['entryId'], properties: {
        entryId: { type: 'string' }, reason: { type: 'string' },
      }},
    }, (p) => {
      const id = String(p.entryId), reason = p.reason ? String(p.reason) : undefined;
      const found = findEntry(this.vaultDir, id);
      if (!found) return { success: false, error: `Entry not found: ${id}` };
      const now = new Date().toISOString();
      rewriteVault(this.vaultDir, found.vaultName, found.all.map(e => {
        if (e.id !== id) return e;
        const out: RawEntry = { ...e, temporal: { ...defaultTemporal(e), validUntil: now } };
        if (reason) out._invalidationReason = reason;
        return out;
      }));
      return { success: true, entryId: id, validUntil: now, reason };
    });

    // 9. sis_contradict — flag contradiction between two entries
    this.reg({
      name: 'sis_contradict', description: 'Flag two entries as potentially contradictory',
      inputSchema: { type: 'object', required: ['entryIdA', 'entryIdB'], properties: {
        entryIdA: { type: 'string' }, entryIdB: { type: 'string' }, reason: { type: 'string' },
      }},
    }, (p) => {
      const record: ContradictionRecord = {
        id: `contra_${Date.now()}_${randomUUID().slice(0, 8)}`,
        entryIdA: String(p.entryIdA), entryIdB: String(p.entryIdB),
        reason: p.reason ? String(p.reason) : 'Flagged as contradictory',
        detectedAt: new Date().toISOString(), resolvedAt: null,
      };
      appendFileSync(join(this.vaultDir, 'contradictions.jsonl'), JSON.stringify(record) + '\n', 'utf-8');
      return { success: true, id: record.id };
    });

    // 10. sis_stale — list stale entries
    this.reg({
      name: 'sis_stale', description: 'Get entries not confirmed within the threshold period',
      inputSchema: { type: 'object', properties: { thresholdDays: { type: 'number' } }},
    }, (p) => {
      const th = Number(p.thresholdDays ?? 30);
      const stale = allEntries(this.vaultDir).filter(e => isStale(e, th))
        .sort((a, b) => (a.temporal?.lastConfirmed ?? a.createdAt ?? '')
          .localeCompare(b.temporal?.lastConfirmed ?? b.createdAt ?? ''))
        .map(({ _vault, ...r }) => {
          const c = r.temporal?.lastConfirmed ?? r.createdAt ?? '';
          return { ...r, vault: _vault, daysSinceConfirmed: c ? Math.round((Date.now() - new Date(c).getTime()) / MS_PER_DAY) : -1, isExpired: isExpired(r as RawEntry) };
        });
      return { threshold: th, count: stale.length, entries: stale };
    });
  }

  // ── JSON-RPC Dispatch ───────────────────────────────────────
  handleRequest(request: JsonRpcRequest): JsonRpcResponse | null {
    const { method, params, id } = request;
    if (method === 'notifications/initialized') return null;
    const rpcId = id ?? null;

    if (method === 'initialize') {
      return { jsonrpc: '2.0', id: rpcId, result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'starlight-sis', version: getPackageVersion() },
      }};
    }
    if (method === 'tools/list') {
      return { jsonrpc: '2.0', id: rpcId, result: {
        tools: Array.from(this.tools.values()).map(t => t.definition),
      }};
    }
    if (method === 'tools/call') {
      const p = (params ?? {}) as Record<string, unknown>;
      const name = String(p.name ?? ''), args = (p.arguments ?? {}) as Record<string, unknown>;
      const tool = this.tools.get(name);
      if (!tool) return { jsonrpc: '2.0', id: rpcId, error: { code: -32601, message: `Unknown tool: ${name}` } };
      try {
        const result = tool.handler(args);
        return { jsonrpc: '2.0', id: rpcId, result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] } };
      } catch (err) {
        return { jsonrpc: '2.0', id: rpcId, result: {
          content: [{ type: 'text', text: JSON.stringify({ error: err instanceof Error ? err.message : String(err) }) }],
          isError: true,
        }};
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

// ── CLI Entry Point ───────────────────────────────────────────
function main(): void {
  const args = process.argv.slice(2);
  let vaultDir = join(homedir(), '.starlight', 'vaults');
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--vault-dir' && args[i + 1]) { vaultDir = args[++i]; }
  }
  const server = new StarlightMcpServer(vaultDir);
  server.start();
}

main();
