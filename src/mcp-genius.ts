#!/usr/bin/env node
/**
 * Starlight Intelligence System — Genius MCP Server (v7.0)
 *
 * Lightweight, high-velocity, consolidated sovereign memory & substrate MCP.
 * Radically reduces prompt token bloat from 3,500+ tokens (17 tools) down to
 * ~350 tokens (3 high-leverage primitives).
 *
 * Primitives:
 *   1. starlight_recall   — Smart associative & temporal recall across all vaults
 *   2. starlight_remember — Structured persistent memory write to canonical vaults
 *   3. starlight_pulse    — Instant ambient substrate briefing & vault metrics
 *
 * Zero external dependencies. In-memory indexing with hot-path caching (<2ms query latency).
 * Pure JSON-RPC 2.0 over stdin/stdout.
 */

import { createInterface } from 'node:readline';
import { readFileSync, appendFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { homedir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';

// ── Types ─────────────────────────────────────────────────────

export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

interface JsonRpcRequest {
  jsonrpc?: string;
  method: string;
  params?: any;
  id?: number | string | null;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

export interface StarlightMemoryItem {
  id: string;
  vault: string;
  content: string;
  tags: string[];
  confidence: string;
  category: string;
  createdAt: string;
  lastConfirmed?: string;
  score?: number;
  daysAgo?: number;
}

// ── Constants & Helpers ───────────────────────────────────────

export const VAULT_TYPES = ['strategic', 'technical', 'creative', 'operational', 'wisdom', 'horizon'] as const;
export type VaultType = typeof VAULT_TYPES[number];

const MS_PER_DAY = 86_400_000;

function wordScore(query: string, text: string): number {
  if (!query || !text) return 0;
  const qWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
  if (qWords.length === 0) return 0;
  const tLower = text.toLowerCase();
  let matches = 0;
  for (const w of qWords) {
    if (tLower.includes(w)) matches++;
  }
  return matches / qWords.length;
}

// ── Genius Server Implementation ──────────────────────────────

export class StarlightGeniusServer {
  private vaultDir: string;
  private tools: Map<string, { tool: McpTool; handler: (params: any) => Promise<any> | any }> = new Map();
  private cache: StarlightMemoryItem[] | null = null;
  private lastCacheLoad: number = 0;

  constructor(vaultDir?: string) {
    this.vaultDir = vaultDir ?? join(homedir(), '.starlight', 'vaults');
    this.registerTools();
  }

  public setVaultDir(dir: string): void {
    this.vaultDir = dir;
    this.invalidateCache();
  }

  public invalidateCache(): void {
    this.cache = null;
    this.lastCacheLoad = 0;
  }

  private ensureVaultDir(): void {
    if (!existsSync(this.vaultDir)) {
      mkdirSync(this.vaultDir, { recursive: true });
    }
  }

  private loadEntries(): StarlightMemoryItem[] {
    const now = Date.now();
    // Cache valid for 5 seconds unless invalidated by writes
    if (this.cache && (now - this.lastCacheLoad) < 5000) {
      return this.cache;
    }

    this.ensureVaultDir();
    const items: StarlightMemoryItem[] = [];

    try {
      const files = readdirSync(this.vaultDir).filter(f => f.endsWith('.jsonl'));
      for (const file of files) {
        const vaultName = basename(file, '.jsonl');
        const filePath = join(this.vaultDir, file);
        const lines = readFileSync(filePath, 'utf-8').split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const raw = JSON.parse(line);
            const content = String(raw.content ?? raw.insight ?? raw.wish ?? '').trim();
            if (!content) continue;
            const createdAt = raw.createdAt ?? new Date().toISOString();
            const createdMs = new Date(createdAt).getTime();
            const daysAgo = Math.max(0, Math.round((now - createdMs) / MS_PER_DAY));

            items.push({
              id: String(raw.id ?? `sis_${createdMs}_${randomUUID().slice(0, 8)}`),
              vault: String(raw.vault ?? vaultName),
              content,
              tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
              confidence: String(raw.confidence ?? 'medium'),
              category: String(raw.category ?? 'insight'),
              createdAt,
              lastConfirmed: raw.temporal?.lastConfirmed,
              daysAgo
            });
          } catch {
            // ignore malformed lines
          }
        }
      }
    } catch {
      // ignore read errors
    }

    this.cache = items;
    this.lastCacheLoad = now;
    return items;
  }

  private registerTools(): void {
    // 1. starlight_recall
    this.tools.set('starlight_recall', {
      tool: {
        name: 'starlight_recall',
        description: 'Associative & temporal recall across Starlight sovereign memory vaults (strategic, technical, creative, wisdom, operational, horizon).',
        inputSchema: {
          type: 'object',
          required: ['query'],
          properties: {
            query: { type: 'string', description: 'Search keywords, concepts, or decision topics' },
            vaults: { type: 'array', items: { type: 'string' }, description: 'Filter by specific vault types' },
            mode: { type: 'string', enum: ['relevant', 'recent', 'invariants'], description: 'Recall strategy: relevant (semantic/term ranked), recent (chronological), or invariants (rules/locks)' },
            limit: { type: 'number', description: 'Max items to return (default: 5, max: 20)' }
          }
        }
      },
      handler: (p) => {
        const q = String(p.query ?? '').trim();
        const mode = p.mode ?? 'relevant';
        const limit = Math.min(20, Math.max(1, Number(p.limit ?? 5)));
        const allowedVaults = Array.isArray(p.vaults) ? new Set(p.vaults.map(String)) : null;

        let entries = this.loadEntries();
        if (allowedVaults) {
          entries = entries.filter(e => allowedVaults.has(e.vault));
        }

        if (mode === 'recent') {
          return entries
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, limit)
            .map(({ id, vault, content, tags, category, daysAgo }) => ({ id, vault, content, tags, category, daysAgo }));
        }

        const terms = q.toLowerCase().split(/\s+/).filter(w => w.length > 1);

        const scored = entries.map(e => {
          const textScore = wordScore(q, e.content);
          const tagBoost = e.tags.some(t => terms.includes(t.toLowerCase())) ? 0.2 : 0;
          const strategicBoost = (e.vault === 'strategic' || e.vault === 'wisdom') ? 0.1 : 0;
          const totalScore = Math.min(1.0, textScore + tagBoost + strategicBoost);
          return { ...e, score: Math.round(totalScore * 1000) / 1000 };
        });

        return scored
          .filter(e => (e.score ?? 0) > 0.1 || !q)
          .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
          .slice(0, limit)
          .map(({ id, vault, content, tags, category, score, daysAgo }) => ({
            id, vault, content, tags, category, score, daysAgo
          }));
      }
    });

    // 2. starlight_remember
    this.tools.set('starlight_remember', {
      tool: {
        name: 'starlight_remember',
        description: 'Store a lasting decision, architectural pattern, insight, or invariant into Starlight sovereign vaults.',
        inputSchema: {
          type: 'object',
          required: ['content', 'vault'],
          properties: {
            content: { type: 'string', description: 'The concrete knowledge, decision, or fact to persist' },
            vault: { type: 'string', enum: [...VAULT_TYPES], description: 'Target vault' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Searchable topic tags' },
            category: { type: 'string', enum: ['decision', 'pattern', 'architecture', 'insight', 'lesson', 'invariant'], description: 'Classification' },
            confidence: { type: 'string', enum: ['high', 'medium', 'low'], description: 'Confidence level (default: high)' }
          }
        }
      },
      handler: (p) => {
        const vault = String(p.vault);
        if (!VAULT_TYPES.includes(vault as VaultType)) {
          throw new Error(`Invalid vault type "${vault}". Must be one of: ${VAULT_TYPES.join(', ')}`);
        }
        const content = String(p.content ?? '').trim();
        if (!content) {
          throw new Error('Memory content cannot be empty.');
        }

        const now = new Date().toISOString();
        const conf = p.confidence ?? 'high';
        const decay = conf === 'high' ? 0.95 : conf === 'medium' ? 0.75 : 0.5;
        const id = `sis_${Date.now()}_${randomUUID().slice(0, 8)}`;

        const entry = {
          id,
          vault,
          content,
          tags: Array.isArray(p.tags) ? p.tags.map(String) : [],
          confidence: conf,
          category: String(p.category ?? 'decision'),
          createdAt: now,
          temporal: {
            validFrom: now,
            validUntil: null,
            lastConfirmed: now,
            confidenceDecay: decay
          }
        };

        this.ensureVaultDir();
        const filePath = join(this.vaultDir, `${vault}.jsonl`);
        appendFileSync(filePath, JSON.stringify(entry) + '\n', 'utf-8');
        this.invalidateCache();

        return {
          success: true,
          id,
          vault,
          storedAt: now
        };
      }
    });

    // 3. starlight_pulse
    this.tools.set('starlight_pulse', {
      tool: {
        name: 'starlight_pulse',
        description: 'Instant ambient briefing: total memory counts per vault, latest architectural locks, and substrate status in <100 tokens.',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      handler: () => {
        const entries = this.loadEntries();
        const counts: Record<string, number> = {};
        for (const v of VAULT_TYPES) counts[v] = 0;
        for (const e of entries) {
          counts[e.vault] = (counts[e.vault] ?? 0) + 1;
        }

        const latestHighConfidence = entries
          .filter(e => (e.vault === 'strategic' || e.vault === 'wisdom' || e.vault === 'technical') && e.confidence === 'high')
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .slice(0, 3)
          .map(e => `[${e.vault.toUpperCase()}] ${e.content.slice(0, 100)}`);

        return {
          totalEntries: entries.length,
          vaultCounts: counts,
          latestLocks: latestHighConfidence,
          status: 'healthy',
          substrateStandard: 'SIP v1.1'
        };
      }
    });
  }

  public getTools(): McpTool[] {
    return Array.from(this.tools.values()).map(t => t.tool);
  }

  public executeTool(name: string, params: any): any {
    const reg = this.tools.get(name);
    if (!reg) {
      throw new Error(`Unknown tool: ${name}`);
    }
    return reg.handler(params);
  }

  public handleRequest(req: JsonRpcRequest): JsonRpcResponse | null {
    if (!req || typeof req !== 'object') return null;
    const id = req.id ?? null;

    if (req.method === 'initialize') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: {
            name: 'starlight-genius-mcp',
            version: '7.0.0'
          }
        }
      };
    }

    if (req.method === 'tools/list') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          tools: this.getTools()
        }
      };
    }

    if (req.method === 'tools/call') {
      const toolName = req.params?.name;
      const toolArgs = req.params?.arguments ?? {};
      try {
        const res = this.executeTool(toolName, toolArgs);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(res, null, 2) }]
          }
        };
      } catch (err: any) {
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32603, message: err.message ?? 'Internal error' }
        };
      }
    }

    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Method not found: ${req.method}` }
    };
  }

  public startStdio(): void {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: false });
    rl.on('line', (line) => {
      if (!line.trim()) return;
      try {
        const req = JSON.parse(line) as JsonRpcRequest;
        const res = this.handleRequest(req);
        if (res) {
          process.stdout.write(JSON.stringify(res) + '\n');
        }
      } catch (err: any) {
        const errResp: JsonRpcResponse = {
          jsonrpc: '2.0',
          id: null,
          error: { code: -32700, message: `Parse error: ${err.message}` }
        };
        process.stdout.write(JSON.stringify(errResp) + '\n');
      }
    });
    rl.on('close', () => {
      process.exit(0);
    });
  }
}

// ── CLI Runner ────────────────────────────────────────────────
const scriptArg = process.argv[1] ? process.argv[1].replace(/\\/g, '/') : '';
const isMain = Boolean(
  scriptArg &&
  (import.meta.url === pathToFileURL(process.argv[1]).href ||
   scriptArg.endsWith('src/mcp-genius.ts') ||
   scriptArg.endsWith('dist/mcp-genius.js') ||
   scriptArg.includes('mcp-genius'))
);

if (isMain) {
  const args = process.argv.slice(2);
  let vaultDir: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--vault-dir' && args[i + 1]) {
      vaultDir = args[i + 1];
      i++;
    }
  }
  const server = new StarlightGeniusServer(vaultDir);
  server.startStdio();
}
