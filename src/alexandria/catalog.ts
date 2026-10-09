/**
 * Starlight Alexandria — the Library.
 *
 * Loads the provider catalogue, validates its shape, and answers "which
 * capability serves this need?" with a deterministic lexical score. No model
 * call: routing has to be reproducible so a receipt can say *why* a provider
 * was chosen. Semantic routing (Firecrawl's own reranker) is a transport
 * concern layered on top, never a replacement for this.
 *
 * Built on SIP — operational tier (Domain Sub-Stack: Alexandria).
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Capability, Catalog, FindHit, Provider, ProviderKind } from './types.js';

type Loose<T> = { [K in keyof T]?: unknown };

const HERE = dirname(fileURLToPath(import.meta.url));
/** Works from both `src/alexandria/` (tsx) and `dist/alexandria/` (built). */
export const REPO_ROOT = join(HERE, '..', '..');
export const DEFAULT_CATALOG_PATH = join(REPO_ROOT, 'verticals', 'alexandria', 'catalog', 'providers.json');

const PROVIDER_KINDS: readonly ProviderKind[] = ['firecrawl-alexandria', 'native', 'connector'];
const ID_RE = /^[a-z0-9][a-z0-9-]*$/;
const CAP_RE = /^[a-z0-9][a-z0-9_-]*(\/[a-z0-9][a-z0-9_-]*)*$/;

export interface CatalogProblem { path: string; message: string }

/** Structural validation. Returns problems instead of throwing so CI can list them all. */
export function validateCatalog(raw: unknown): CatalogProblem[] {
  const problems: CatalogProblem[] = [];
  const c = raw as Partial<Catalog> | null;
  if (!c || typeof c !== 'object') return [{ path: '$', message: 'catalog must be an object' }];
  if (typeof c.version !== 'string') problems.push({ path: '$.version', message: 'version must be a string' });
  if (typeof c.reconciledAt !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(c.reconciledAt)) {
    problems.push({ path: '$.reconciledAt', message: 'reconciledAt must be an ISO date (YYYY-MM-DD)' });
  }
  if (!Array.isArray(c.providers)) return [...problems, { path: '$.providers', message: 'providers must be an array' }];
  const seenProviders = new Set<string>();
  const seenCaps = new Set<string>();
  (c.providers as Loose<Provider>[]).forEach((p: Loose<Provider>, i: number) => {
    const base = `$.providers[${i}]`;
    if (!p || typeof p !== 'object') { problems.push({ path: base, message: 'provider must be an object' }); return; }
    const pid = typeof p.id === 'string' ? p.id : '';
    if (!ID_RE.test(pid)) problems.push({ path: `${base}.id`, message: 'id must be lower-case kebab' });
    else if (seenProviders.has(pid)) problems.push({ path: `${base}.id`, message: `duplicate provider id ${pid}` });
    else seenProviders.add(pid);
    if (!PROVIDER_KINDS.includes(p.kind as ProviderKind)) problems.push({ path: `${base}.kind`, message: `kind must be one of ${PROVIDER_KINDS.join('|')}` });
    for (const key of ['name', 'description', 'source'] as const) {
      if (typeof p[key] !== 'string' || !p[key]) problems.push({ path: `${base}.${key}`, message: `${key} must be a non-empty string` });
    }
    if (!Array.isArray(p.categories) || (p.categories as unknown[]).length === 0) problems.push({ path: `${base}.categories`, message: 'categories must be a non-empty array' });
    if (!Array.isArray(p.capabilities)) { problems.push({ path: `${base}.capabilities`, message: 'capabilities must be an array' }); return; }
    if (p.kind !== 'connector' && (p.capabilities as unknown[]).length === 0) problems.push({ path: `${base}.capabilities`, message: 'data providers need at least one capability' });
    (p.capabilities as Loose<Capability>[]).forEach((cap: Loose<Capability>, j: number) => {
      const cb = `${base}.capabilities[${j}]`;
      if (!cap || typeof cap !== 'object') { problems.push({ path: cb, message: 'capability must be an object' }); return; }
      if (typeof cap.capability !== 'string' || !CAP_RE.test(cap.capability)) problems.push({ path: `${cb}.capability`, message: 'capability path must be lower-case with / separators' });
      const expectedId = `${pid}/${String(cap.capability)}`;
      if (cap.id !== expectedId) problems.push({ path: `${cb}.id`, message: `id must equal ${expectedId}` });
      else if (seenCaps.has(expectedId)) problems.push({ path: `${cb}.id`, message: `duplicate capability id ${expectedId}` });
      else seenCaps.add(expectedId);
      if (typeof cap.creditsCost !== 'number' || cap.creditsCost < 0) problems.push({ path: `${cb}.creditsCost`, message: 'creditsCost must be a non-negative number' });
      if (p.kind === 'native' && cap.creditsCost !== 0) problems.push({ path: `${cb}.creditsCost`, message: 'native capabilities are free' });
      if (typeof cap.perRecord !== 'boolean') problems.push({ path: `${cb}.perRecord`, message: 'perRecord must be boolean' });
      if (!Array.isArray(cap.tags) || (cap.tags as unknown[]).length === 0) problems.push({ path: `${cb}.tags`, message: 'tags must be a non-empty array' });
      else if ((cap.tags as unknown[]).some((t: unknown) => typeof t !== 'string' || t !== t.toLowerCase())) problems.push({ path: `${cb}.tags`, message: 'tags must be lower-case strings' });
      for (const key of ['name', 'description'] as const) {
        if (typeof cap[key] !== 'string' || !cap[key]) problems.push({ path: `${cb}.${key}`, message: `${key} must be a non-empty string` });
      }
    });
  });
  return problems;
}

export function loadCatalog(path: string = DEFAULT_CATALOG_PATH): Catalog {
  const raw: unknown = JSON.parse(readFileSync(path, 'utf8'));
  const problems = validateCatalog(raw);
  if (problems.length > 0) {
    throw new Error(`Invalid Alexandria catalog at ${path}: ${problems.map((p) => `${p.path}: ${p.message}`).join('; ')}`);
  }
  return raw as Catalog;
}

const STOP = new Set(['the', 'a', 'an', 'of', 'for', 'to', 'in', 'on', 'and', 'or', 'with', 'by', 'is', 'what', 'who', 'how', 'me', 'my', 'this', 'that']);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s/_-]/g, ' ')
    .split(/[\s/_-]+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

function singular(t: string): string {
  return t.endsWith('s') && t.length > 3 ? t.slice(0, -1) : t;
}

/** Lexical relevance of one capability to a need. Tags weigh most, then name, then description. */
export function scoreCapability(need: string, cap: Capability, provider: Provider): number {
  const terms = new Set(tokenize(need).map(singular));
  if (terms.size === 0) return 0;
  const tagSet = new Set(cap.tags.map(singular));
  const nameSet = new Set(tokenize(cap.name).map(singular));
  const descSet = new Set(tokenize(`${cap.description} ${provider.description} ${provider.categories.join(' ')}`).map(singular));
  let score = 0;
  for (const t of terms) {
    if (tagSet.has(t)) score += 3;
    else if (nameSet.has(t)) score += 2;
    else if (descSet.has(t)) score += 1;
  }
  return score / terms.size;
}

export interface FindOptions {
  kinds?: readonly ProviderKind[];
  limit?: number;
  /** Exclude capabilities whose per-call cost exceeds this. */
  maxCredits?: number;
}

export class Library {
  readonly catalog: Catalog;
  private readonly byCapability = new Map<string, FindHit>();

  constructor(catalog: Catalog) {
    this.catalog = catalog;
    for (const provider of catalog.providers) {
      for (const capability of provider.capabilities) {
        this.byCapability.set(capability.id, { capability, provider, score: 0 });
      }
    }
  }

  static fromFile(path?: string): Library {
    return new Library(loadCatalog(path));
  }

  providers(kind?: ProviderKind): Provider[] {
    return this.catalog.providers.filter((p) => !kind || p.kind === kind);
  }

  get(capabilityId: string): FindHit | undefined {
    const hit = this.byCapability.get(capabilityId);
    return hit ? { ...hit } : undefined;
  }

  /** Deterministic ranking. Ties break on lower cost, then on id. */
  find(need: string, opts: FindOptions = {}): FindHit[] {
    const kinds = opts.kinds ?? ['firecrawl-alexandria', 'native'];
    const hits: FindHit[] = [];
    for (const hit of this.byCapability.values()) {
      if (!kinds.includes(hit.provider.kind)) continue;
      if (opts.maxCredits !== undefined && hit.capability.creditsCost > opts.maxCredits) continue;
      const score = scoreCapability(need, hit.capability, hit.provider);
      if (score > 0) hits.push({ ...hit, score });
    }
    hits.sort((a, b) =>
      b.score - a.score
      || a.capability.creditsCost - b.capability.creditsCost
      || a.capability.id.localeCompare(b.capability.id));
    return hits.slice(0, opts.limit ?? 10);
  }

  /** Cost of one call before it is made. `records` matters only for per-record pricing. */
  estimate(capabilityId: string, records = 1): number {
    const hit = this.byCapability.get(capabilityId);
    if (!hit) throw new Error(`Unknown capability: ${capabilityId}`);
    return hit.capability.perRecord ? hit.capability.creditsCost * Math.max(1, records) : hit.capability.creditsCost;
  }

  /** Checks `requiresOneOf` groups. Returns the first unmet group, or null. */
  unmetRequirement(capabilityId: string, options: Record<string, unknown>): readonly string[] | null {
    const hit = this.byCapability.get(capabilityId);
    if (!hit) throw new Error(`Unknown capability: ${capabilityId}`);
    for (const group of hit.capability.requiresOneOf ?? []) {
      if (!group.some((name) => options[name] !== undefined && options[name] !== '')) return group;
    }
    return null;
  }
}
