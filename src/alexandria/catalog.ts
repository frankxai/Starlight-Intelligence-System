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
import type { Capability, CapabilityOption, Catalog, FindHit, Provider, ProviderKind } from './types.js';

type Loose<T> = { [K in keyof T]?: unknown };

const HERE = dirname(fileURLToPath(import.meta.url));
/** Works from both `src/alexandria/` (tsx) and `dist/alexandria/` (built). */
export const REPO_ROOT = join(HERE, '..', '..');
export const DEFAULT_CATALOG_PATH = join(REPO_ROOT, 'verticals', 'alexandria', 'catalog', 'providers.json');

const PROVIDER_KINDS: readonly ProviderKind[] = ['firecrawl-alexandria', 'native', 'connector'];
const OPTION_TYPES: readonly CapabilityOption['type'][] = ['string', 'number', 'boolean', 'string[]', 'object'];
const ID_RE = /^[a-z0-9][a-z0-9-]*$/;
const CAP_RE = /^[a-z0-9][a-z0-9_-]*(\/[a-z0-9][a-z0-9_-]*)*$/;
const OPTION_NAME_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

function isPrimitive(v: unknown): boolean {
  return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';
}

/** The nested option contract: what `validateOptions` relies on at call time, checked once at load. */
function validateOptionContract(cap: Loose<Capability>, cb: string, problems: CatalogProblem[]): void {
  const declared = new Map<string, CapabilityOption['type']>();
  if (cap.options !== undefined) {
    if (!Array.isArray(cap.options)) problems.push({ path: `${cb}.options`, message: 'options must be an array' });
    else (cap.options as Loose<CapabilityOption>[]).forEach((opt, k) => {
      const ob = `${cb}.options[${k}]`;
      if (!opt || typeof opt !== 'object' || Array.isArray(opt)) { problems.push({ path: ob, message: 'option must be an object' }); return; }
      if (typeof opt.name !== 'string' || !OPTION_NAME_RE.test(opt.name)) problems.push({ path: `${ob}.name`, message: 'name must be an identifier' });
      else if (declared.has(opt.name)) problems.push({ path: `${ob}.name`, message: `duplicate option ${opt.name}` });
      if (!OPTION_TYPES.includes(opt.type as CapabilityOption['type'])) problems.push({ path: `${ob}.type`, message: `type must be one of ${OPTION_TYPES.join('|')}` });
      else if (typeof opt.name === 'string') declared.set(opt.name, opt.type as CapabilityOption['type']);
      if (opt.about !== undefined && typeof opt.about !== 'string') problems.push({ path: `${ob}.about`, message: 'about must be a string' });
      if (opt.default !== undefined && !isPrimitive(opt.default)) problems.push({ path: `${ob}.default`, message: 'default must be a string, number or boolean' });
      if (opt.oneOf !== undefined && (!Array.isArray(opt.oneOf) || opt.oneOf.length === 0 || (opt.oneOf as unknown[]).some((v) => typeof v !== 'string'))) problems.push({ path: `${ob}.oneOf`, message: 'oneOf must be a non-empty array of strings' });
      for (const bound of ['min', 'max'] as const) {
        if (opt[bound] !== undefined && (typeof opt[bound] !== 'number' || !Number.isFinite(opt[bound]))) problems.push({ path: `${ob}.${bound}`, message: `${bound} must be a finite number` });
      }
      if (typeof opt.min === 'number' && typeof opt.max === 'number' && opt.min > opt.max) problems.push({ path: `${ob}.min`, message: 'min must not exceed max' });
    });
  }
  if (cap.requiresOneOf !== undefined) {
    if (!Array.isArray(cap.requiresOneOf)) problems.push({ path: `${cb}.requiresOneOf`, message: 'requiresOneOf must be an array of option-name groups' });
    else (cap.requiresOneOf as unknown[]).forEach((group, g) => {
      if (!Array.isArray(group) || group.length === 0 || group.some((n) => typeof n !== 'string' || !OPTION_NAME_RE.test(n))) problems.push({ path: `${cb}.requiresOneOf[${g}]`, message: 'each group must be a non-empty array of option names' });
    });
  }
  if (cap.recordLimitOption !== undefined) {
    if (typeof cap.recordLimitOption !== 'string' || declared.get(cap.recordLimitOption) !== 'number') problems.push({ path: `${cb}.recordLimitOption`, message: 'recordLimitOption must name a declared number option' });
  } else if (cap.perRecord === true) {
    problems.push({ path: `${cb}.recordLimitOption`, message: 'per-record capabilities must declare the option that bounds the record count' });
  }
}

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
    if (p.redistribution !== undefined) {
      const r = p.redistribution as Loose<NonNullable<Provider['redistribution']>>;
      if (!r || typeof r !== 'object' || (r.policy !== 'not-cleared' && r.policy !== 'cleared')) problems.push({ path: `${base}.redistribution`, message: 'redistribution.policy must be not-cleared or cleared' });
      else if (r.policy === 'cleared' && (typeof r.termsVersion !== 'string' || !r.termsVersion)) problems.push({ path: `${base}.redistribution.termsVersion`, message: 'a cleared provider must name the terms version that clears it' });
    }
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
      if (cap.status !== undefined && cap.status !== 'live' && cap.status !== 'unreconciled') problems.push({ path: `${cb}.status`, message: 'status must be live or unreconciled' });
      validateOptionContract(cap, cb, problems);
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
  // Tags are normalised exactly like the need, so `smart-money` meets "smart money".
  const tagSet = new Set(cap.tags.flatMap((tag) => tokenize(tag)).map(singular));
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

function isPresent(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
}

function matchesType(value: unknown, type: CapabilityOption['type']): boolean {
  switch (type) {
    case 'string': return typeof value === 'string';
    case 'number': return typeof value === 'number' && Number.isFinite(value);
    case 'boolean': return typeof value === 'boolean';
    case 'string[]': return Array.isArray(value) && value.every((v) => typeof v === 'string');
    case 'object': return typeof value === 'object' && value !== null && !Array.isArray(value);
    default: return true;
  }
}

export interface FindOptions {
  kinds?: readonly ProviderKind[];
  limit?: number;
  /** Exclude capabilities whose per-call cost exceeds this. */
  maxCredits?: number;
  /** Also list capabilities marked `unreconciled`. They are never executable; this is for catalogue maintenance. */
  includeUnreconciled?: boolean;
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

  /** Deterministic ranking. Ties break on lower cost, then on id. Unreconciled capabilities are left out. */
  find(need: string, opts: FindOptions = {}): FindHit[] {
    const kinds = opts.kinds ?? ['firecrawl-alexandria', 'native'];
    const hits: FindHit[] = [];
    for (const hit of this.byCapability.values()) {
      if (!kinds.includes(hit.provider.kind)) continue;
      if (hit.capability.status === 'unreconciled' && !opts.includeUnreconciled) continue;
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

  /** Checks `requiresOneOf` groups. `null`, `undefined` and `''` count as missing. Returns the first unmet group, or null. */
  unmetRequirement(capabilityId: string, options: Record<string, unknown>): readonly string[] | null {
    const hit = this.byCapability.get(capabilityId);
    if (!hit) throw new Error(`Unknown capability: ${capabilityId}`);
    for (const group of hit.capability.requiresOneOf ?? []) {
      if (!group.some((name) => isPresent(options[name]))) return group;
    }
    return null;
  }

  /**
   * Validates supplied options against the capability contract before anything is charged:
   * required groups, declared types and `oneOf` values. Options the contract does not declare
   * pass through, because the catalogue lists a provider's options selectively.
   */
  validateOptions(capabilityId: string, options: Record<string, unknown>): string[] {
    const hit = this.byCapability.get(capabilityId);
    if (!hit) throw new Error(`Unknown capability: ${capabilityId}`);
    const problems: string[] = [];
    const unmet = this.unmetRequirement(capabilityId, options);
    if (unmet) problems.push(`needs one of: ${unmet.join(', ')}`);
    for (const opt of hit.capability.options ?? []) {
      const value = options[opt.name];
      if (!isPresent(value)) continue;
      if (!matchesType(value, opt.type)) problems.push(`${opt.name} must be ${opt.type}`);
      else if (opt.oneOf && !opt.oneOf.includes(String(value))) problems.push(`${opt.name} must be one of ${opt.oneOf.join('|')}`);
      else if (opt.type === 'number' && ((opt.min !== undefined && (value as number) < opt.min) || (opt.max !== undefined && (value as number) > opt.max))) problems.push(`${opt.name} must be between ${opt.min ?? '-inf'} and ${opt.max ?? 'inf'}`);
    }
    return problems;
  }
}
