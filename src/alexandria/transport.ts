/**
 * Starlight Alexandria — transports.
 *
 * A transport executes catalogued calls for one provider kind. The router
 * never talks to a network itself; it hands a list of calls to the transport
 * registered for the provider's kind and gets typed results back.
 *
 *   FirecrawlTransport — POSTs an `alexandria` body to Firecrawl's scrape
 *                        endpoint. Needs FIRECRAWL_API_KEY. Billed per call.
 *   NativeTransport    — reads Starlight's own corpus from disk. Free.
 *   MemoryTransport    — scripted results for tests and dry runs.
 *
 * Built on SIP — operational tier (Domain Sub-Stack: Alexandria).
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tokenize } from './catalog.js';
import type { AlexandriaCall, CallResult, Transport } from './types.js';

export const FIRECRAWL_SCRAPE_URL = 'https://api.firecrawl.dev/v2/scrape';

type FetchLike = (input: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

interface FirecrawlAlexandriaEntry {
  provider: string;
  capability: string;
  creditsCost?: number;
  data?: unknown;
  records?: unknown[];
  error?: { code?: string; message?: string };
}

export class FirecrawlTransport implements Transport {
  readonly kind = 'firecrawl-alexandria' as const;
  private readonly apiKey: string;
  private readonly fetchImpl: FetchLike;
  private readonly url: string;

  constructor(opts: { apiKey?: string; fetchImpl?: FetchLike; url?: string } = {}) {
    const key = opts.apiKey ?? process.env.FIRECRAWL_API_KEY;
    if (!key) throw new Error('FirecrawlTransport needs FIRECRAWL_API_KEY (or opts.apiKey)');
    this.apiKey = key;
    this.fetchImpl = opts.fetchImpl ?? ((input, init) => fetch(input, init));
    this.url = opts.url ?? FIRECRAWL_SCRAPE_URL;
  }

  async execute(calls: readonly AlexandriaCall[]): Promise<CallResult[]> {
    if (calls.length === 0) return [];
    if (calls.length > 10) throw new Error('Firecrawl accepts at most 10 Alexandria capabilities per request');
    const observedAt = new Date().toISOString();
    const body = JSON.stringify({ alexandria: calls.map((c) => ({ provider: c.provider, capability: c.capability, options: c.options ?? {}, ...(c.version ? { version: c.version } : {}) })) });
    const res = await this.fetchImpl(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
      body,
    });
    if (!res.ok) {
      return calls.map((c) => ({ provider: c.provider, capability: c.capability, records: [], creditsCost: 0, observedAt, error: { code: `http_${res.status}`, message: `Firecrawl returned HTTP ${res.status}` } }));
    }
    const payload = (await res.json()) as { data?: { alexandria?: FirecrawlAlexandriaEntry[] } };
    const entries = payload.data?.alexandria ?? [];
    return calls.map((c, i) => {
      const entry = entries[i] ?? entries.find((e) => e.provider === c.provider && e.capability === c.capability);
      if (!entry) return { provider: c.provider, capability: c.capability, records: [], creditsCost: 0, observedAt, error: { code: 'missing_result', message: 'Firecrawl returned no entry for this capability' } };
      if (entry.error) return { provider: c.provider, capability: c.capability, records: [], creditsCost: 0, observedAt, error: { code: entry.error.code ?? 'provider_error', message: entry.error.message ?? 'provider error' } };
      const records = Array.isArray(entry.records) ? entry.records : Array.isArray(entry.data) ? entry.data : entry.data === undefined ? [] : [entry.data];
      return { provider: c.provider, capability: c.capability, records, creditsCost: entry.creditsCost ?? 0, observedAt };
    });
  }
}

/** Reads the estate's own corpus. Capabilities are the `sis-*` providers in the catalogue. */
export class NativeTransport implements Transport {
  readonly kind = 'native' as const;
  constructor(readonly repoRoot: string) {}

  async execute(calls: readonly AlexandriaCall[]): Promise<CallResult[]> {
    const observedAt = new Date().toISOString();
    return calls.map((c) => {
      try {
        return { provider: c.provider, capability: c.capability, records: this.run(c), creditsCost: 0, observedAt };
      } catch (err) {
        return { provider: c.provider, capability: c.capability, records: [], creditsCost: 0, observedAt, error: { code: 'native_error', message: err instanceof Error ? err.message : String(err) } };
      }
    });
  }

  private run(call: AlexandriaCall): unknown[] {
    const key = `${call.provider}/${call.capability}`;
    const opts = call.options ?? {};
    switch (key) {
      case 'sis-vaults/search': return this.vaultSearch(String(opts.query ?? ''), Number(opts.limit ?? 10));
      case 'sis-metrics/current': return this.metrics(opts.key ? String(opts.key) : undefined);
      case 'sis-research/list': return this.research(String(opts.query ?? ''));
      case 'sis-registry/verticals': return this.verticals();
      default: throw new Error(`NativeTransport has no runner for ${key}`);
    }
  }

  private vaultSearch(query: string, limit: number): unknown[] {
    const dir = join(this.repoRoot, 'memory', 'vaults');
    if (!existsSync(dir)) return [];
    const terms = tokenize(query);
    const hits: { vault: string; line: number; text: string; score: number }[] = [];
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      const lines = readFileSync(join(dir, file), 'utf8').split('\n');
      lines.forEach((text, i) => {
        const lower = text.toLowerCase();
        const score = terms.filter((t) => lower.includes(t)).length;
        if (score > 0 && text.trim().length > 0) hits.push({ vault: file.replace(/\.md$/, ''), line: i + 1, text: text.trim().slice(0, 240), score });
      });
    }
    hits.sort((a, b) => b.score - a.score || a.vault.localeCompare(b.vault) || a.line - b.line);
    return hits.slice(0, Math.max(1, limit));
  }

  private metrics(key?: string): unknown[] {
    const path = join(this.repoRoot, 'metrics', 'current.json');
    if (!existsSync(path)) return [];
    const ledger = JSON.parse(readFileSync(path, 'utf8')) as { metrics?: Record<string, unknown> };
    const metrics = ledger.metrics ?? {};
    return Object.entries(metrics)
      .filter(([k]) => !key || k === key)
      .map(([k, v]) => ({ key: k, ...(v as Record<string, unknown>) }));
  }

  private research(query: string): unknown[] {
    const dir = join(this.repoRoot, 'docs', 'research');
    if (!existsSync(dir)) return [];
    const terms = tokenize(query);
    return readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => ({ path: `docs/research/${f}`, slug: f.replace(/\.md$/, '') }))
      .filter((r) => terms.length === 0 || terms.some((t) => r.slug.includes(t)));
  }

  private verticals(): unknown[] {
    const dir = join(this.repoRoot, 'verticals');
    if (!existsSync(dir)) return [];
    return readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
      .map((d) => ({ slug: d.name, hasContract: ['README.md', 'SKILL.md', 'AGENTS.md', 'MEMORY.md', 'STACK.md', 'CANON.md', 'SOUL.md'].every((f) => existsSync(join(dir, d.name, f))) }));
  }
}

/** Scripted transport for tests and dry runs. Results are keyed by `<provider>/<capability>`. */
export class MemoryTransport implements Transport {
  readonly calls: AlexandriaCall[] = [];
  constructor(readonly kind: Transport['kind'], private readonly scripted: Record<string, { records: unknown[]; creditsCost?: number; error?: CallResult['error'] }>) {}

  async execute(calls: readonly AlexandriaCall[]): Promise<CallResult[]> {
    const observedAt = new Date().toISOString();
    return calls.map((c) => {
      this.calls.push(c);
      const s = this.scripted[`${c.provider}/${c.capability}`];
      if (!s) return { provider: c.provider, capability: c.capability, records: [], creditsCost: 0, observedAt, error: { code: 'unscripted', message: 'no scripted result' } };
      const result: CallResult = { provider: c.provider, capability: c.capability, records: s.records, creditsCost: s.creditsCost ?? 0, observedAt };
      if (s.error) result.error = s.error;
      return result;
    });
  }
}
