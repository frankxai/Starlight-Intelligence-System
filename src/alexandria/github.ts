/** Governed GitHub acquisition for Starlight Federation. External references are not members.
 * Reuses Alexandria admission, ReceiptLedger and FirecrawlTransport; contains no canonical store.
 * Contract evidence: docs/network/federation/evidence/discovery-contracts.json in the web slice.
 */
import { createHash } from 'node:crypto';
import { Alexandria } from './router.js';
import { FirecrawlTransport } from './transport.js';
import { canonicalJson, hashRecords } from './receipts.js';
import type { AlexandriaCall, CallResult, CapabilityOption, Catalog, Provider, Receipt, Transport } from './types.js';

export const GITHUB_SEARCH = 'github-com/repositories/search_repos';
export const GITHUB_PIN = Object.freeze({
  catalogueVersion: 'sha256:5eccb58964cf5f0abe2de2f75a58a8b6de624057b0a17ea89518b22c94fa2f3e',
  version: '1.3.0',
  digest: 'sha256:310d4c0f33d3a817c5267fe57e226b6e20974eb60a744871b7bbdd44fba80e32',
  contractSha256: '3fc6003aa29dc25f410c561e0e2f278ec76eefef06a12fb6aaaea906b70337fb',
  inspectedAt: '2026-11-13', creditsPerRequest: 5,
});
export class GitHubFederationError extends Error {
  constructor(readonly code: 'contract_drift' | 'invalid_query' | 'invalid_page' | 'checkpoint_mismatch' | 'artifact_mismatch' | 'provider_failure', message: string) { super(message); this.name = 'GitHubFederationError'; }
}
type ObjectRecord = Record<string, unknown>;
function object(value: unknown): value is ObjectRecord { return !!value && typeof value === 'object' && !Array.isArray(value); }
function fail(code: ConstructorParameters<typeof GitHubFederationError>[0], message: string): never { throw new GitHubFederationError(code, message); }
function sha(value: unknown): string { return createHash('sha256').update(canonicalJson(value)).digest('hex'); }
function integer(value: unknown, min: number, max = Number.MAX_SAFE_INTEGER): value is number { return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max; }
function string(value: unknown, max: number): value is string { return typeof value === 'string' && value.length > 0 && value.length <= max; }

/** Discovery is free and supplied by the caller. Unknown contracts never become executable. */
export function inspectGitHubDiscovery(input: unknown): Provider {
  if (!object(input) || !object(input.data) || !Array.isArray(input.data.alexandria)) fail('contract_drift', 'Expected an Alexandria discovery response.');
  const discovery = input.data.alexandria.find((v: unknown) => object(v) && v.provider === 'firecrawl' && v.capability === 'find-tools');
  if (!object(discovery) || !object(discovery.data) || discovery.data.catalogueVersion !== GITHUB_PIN.catalogueVersion || !Array.isArray(discovery.data.items)) fail('contract_drift', 'Catalogue pin differs; inspect and review the new contract before acquisition.');
  const cap = discovery.data.items.find((v: unknown) => object(v) && v.id === GITHUB_SEARCH);
  if (!object(cap) || cap.provider !== 'github-com' || cap.capability !== 'repositories/search_repos' || cap.creditsCost !== 5 || cap.perRecord !== false || !Array.isArray(cap.options) || !object(cap.response) || cap.response.key !== 'repositories' || cap.response.paginated !== true) fail('contract_drift', 'GitHub search capability, price or response contract differs.');
  const executionContract = Object.fromEntries(['id','provider','capability','creditsCost','perRecord','options','response','execute'].map(key => [key, cap[key]]));
  if (sha(executionContract) !== GITHUB_PIN.contractSha256) fail('contract_drift', 'Published execution contract digest differs from the inspected pin.');
  const expected: (CapabilityOption & { required?: boolean })[] = [
    { name: 'order', type: 'string', default: 'desc', oneOf: ['asc', 'desc'] },
    { name: 'page', type: 'number', default: 1, min: 1, max: 100 },
    { name: 'per_page', type: 'number', default: 10, min: 1, max: 100 },
    { name: 'query', type: 'string', required: true },
    { name: 'sort', type: 'string', default: 'best_match', oneOf: ['best_match', 'stars', 'forks', 'help_wanted_issues', 'updated'] },
  ];
  const actualOptions = cap.options;
  if (actualOptions.length !== expected.length || expected.some(e => !actualOptions.some((v: unknown) => object(v) && Object.entries(e).every(([k, value]) => canonicalJson(v[k] ?? null) === canonicalJson(value))))) fail('contract_drift', 'GitHub input contract differs from the inspected pin.');
  return {
    id: 'github-com', kind: 'firecrawl-alexandria', name: 'GitHub public repository metadata',
    description: 'Reviewed targeted acquisition; prefer the official API for bulk enumeration.',
    source: 'https://github.com', categories: ['developer'], attribution: 'Source: GitHub; acquired through Firecrawl Alexandria.',
    redistribution: { policy: 'not-cleared', termsUrl: 'https://docs.github.com/en/site-policy/github-terms/github-terms-of-service' },
    capabilities: [{ id: GITHUB_SEARCH, capability: 'repositories/search_repos', name: 'Search public repositories',
      description: 'One bounded public repository search page; no ownership or execution claims.', creditsCost: 5, perRecord: false,
      requiresOneOf: [['query']], tags: ['github', 'repository', 'developer', 'agent'],
      options: expected.map(({ required: _required, ...opt }) => opt) }],
  };
}
/** Additive fragment: the sovereign catalog remains canonical; unrelated providers stay untouched. */
export function withGitHubCatalog(catalog: Catalog, discovery: unknown): Catalog {
  const provider = inspectGitHubDiscovery(discovery);
  if (catalog.providers.some(p => p.id === provider.id)) fail('contract_drift', 'GitHub provider already exists; reconcile its owner rather than shadowing it.');
  return { ...catalog, providers: [...catalog.providers, provider] };
}
export interface GitHubSearchQuery { query: string; perPage: number; sort: 'best_match' | 'stars' | 'forks' | 'help_wanted_issues' | 'updated'; order: 'asc' | 'desc' }
function validateQuery(q: GitHubSearchQuery): void {
  if (!object(q) || Object.keys(q).some(k => !['query','perPage','sort','order'].includes(k)) || !string(q.query, 500) || !q.query.trim() || !integer(q.perPage, 1, 100) || !['best_match','stars','forks','help_wanted_issues','updated'].includes(q.sort) || !['asc','desc'].includes(q.order)) fail('invalid_query', 'Use a bounded explicit GitHub query, sort, order and page size.');
}
export function estimateGitHubAcquisition(q: GitHubSearchQuery, pages: number) {
  validateQuery(q);
  if (!integer(pages, 1, Math.min(100, Math.floor(1000 / q.perPage)))) fail('invalid_query', 'A search window can reach at most 1,000 results.');
  return { provider: 'github-com', requests: pages, maximumRecords: pages * q.perPage, credits: pages * 5,
    currencyCost: null, directOfficialApiPreferred: true, reason: 'GitHub REST supplies the same public metadata without Firecrawl acquisition credits; partition queries for larger corpora.' };
}
export interface GitHubReference {
  id: string; kind: 'project'; membership: 'external-reference'; ownership: 'unclaimed';
  name: string; description: string; repository: string; githubRepositoryId: number;
  ownerReference: { id: string; login: string; type: 'User' | 'Organization' | 'Bot'; membership: 'external-reference' };
  source: { canonicalUrl: string; observedAt: string; retrievedAt: string; sha256: string; provider: 'github-com'; capability: 'repositories/search_repos'; contractVersion: string; contractDigest: string; requestId: string };
  rights: { capture: 'public-metadata'; repositorySpdx: string | null; redistribution: 'not-cleared'; contentCaptured: false };
  capabilities: never[];
}
export interface GitHubCheckpoint {
  schemaVersion: 'starlight.github.checkpoint.v1'; queryFingerprint: string; nextPage: number | null;
  status: 'more' | 'complete' | 'incomplete' | 'search-window-exhausted'; lastReceiptId: string | null;
}
export function startGitHubCheckpoint(q: GitHubSearchQuery): GitHubCheckpoint {
  validateQuery(q); return { schemaVersion: 'starlight.github.checkpoint.v1', queryFingerprint: sha({ q, pin: GITHUB_PIN }), nextPage: 1, status: 'more', lastReceiptId: null };
}
export interface GitHubAcquiredPage { requestId: string; fingerprint: string; page: unknown; receipt: Receipt; sha256: string; retrievedAt: string }
/** Bind to the existing authorized Alexandria artifact store, not a new canonical database. */
export interface GitHubPageArtifacts { get(requestId: string): Promise<GitHubAcquiredPage | undefined>; put(page: GitHubAcquiredPage): Promise<void> }
export function normalizeGitHubPage(page: unknown, q: GitHubSearchQuery, pageNumber: number, receipt: Receipt, retrievedAt: string) {
  validateQuery(q);
  if (!integer(pageNumber, 1, Math.min(100, Math.floor(1000 / q.perPage)))) fail('invalid_page', 'Page lies outside the admitted 1,000-result search window.');
  if (!object(page) || page.query !== q.query || page.per_page !== q.perPage || page.page !== pageNumber || page.sort !== q.sort || page.order !== q.order || !integer(page.total_count, 0) || !integer(page.observed_at_ms, 0, 8640000000000000) || typeof page.has_next !== 'boolean' || typeof page.incomplete_results !== 'boolean' || !Array.isArray(page.repositories) || page.repositories.length > q.perPage || page.count !== page.repositories.length || !Number.isFinite(Date.parse(retrievedAt))) fail('invalid_page', 'GitHub page does not match its admitted query or contract.');
  if (receipt.provider !== 'github-com' || receipt.capability !== 'repositories/search_repos' || !receipt.requestId || receipt.error || receipt.pending || receipt.contentHash !== hashRecords([page])) fail('invalid_page', 'Page is not bound to a successful SIS receipt.');
  const observedAt = new Date(page.observed_at_ms).toISOString();
  const seen = new Set<number>();
  const references: GitHubReference[] = page.repositories.map((raw: unknown) => {
    if (!object(raw) || !integer(raw.id, 1) || !string(raw.full_name, 140) || !/^[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9._-]{1,100}$/.test(raw.full_name) || raw.visibility !== 'public' || raw.source_url !== `https://github.com/${raw.full_name}` || !object(raw.owner) || !integer(raw.owner.id, 1) || !string(raw.owner.login, 39) || !['User','Organization','Bot'].includes(String(raw.owner.type)) || raw.full_name.split('/')[0] !== raw.owner.login || seen.has(raw.id) || (raw.description !== null && raw.description !== undefined && (typeof raw.description !== 'string' || raw.description.length > 2000))) fail('invalid_page', 'A repository has conflicting identity, attribution, visibility or shape.');
    seen.add(raw.id);
    const spdx = object(raw.license) && typeof raw.license.spdx_id === 'string' && /^[A-Za-z0-9.+-]{1,100}$/.test(raw.license.spdx_id) ? raw.license.spdx_id : null;
    return { id: `github:repository:${raw.id}`, kind: 'project', membership: 'external-reference', ownership: 'unclaimed',
      name: raw.full_name, description: typeof raw.description === 'string' ? raw.description : '', repository: raw.full_name, githubRepositoryId: raw.id,
      ownerReference: { id: `github:account:${raw.owner.id}`, login: raw.owner.login, type: raw.owner.type as 'User' | 'Organization' | 'Bot', membership: 'external-reference' },
      source: { canonicalUrl: raw.source_url, observedAt, retrievedAt, sha256: sha(raw), provider: 'github-com', capability: 'repositories/search_repos', contractVersion: GITHUB_PIN.version, contractDigest: GITHUB_PIN.digest, requestId: receipt.requestId! },
      rights: { capture: 'public-metadata', repositorySpdx: spdx, redistribution: 'not-cleared', contentCaptured: false }, capabilities: [] };
  });
  if (page.has_next && (!integer(page.next_page, pageNumber + 1, pageNumber + 1))) fail('invalid_page', 'Pagination must advance exactly one page.');
  if (!page.has_next && page.next_page !== null) fail('invalid_page', 'A terminal page must not carry another cursor.');
  const exhausted = (pageNumber + 1) * q.perPage > 1000;
  const status: GitHubCheckpoint['status'] = page.incomplete_results ? 'incomplete' : page.has_next ? exhausted ? 'search-window-exhausted' : 'more' : 'complete';
  return { references, checkpoint: { schemaVersion: 'starlight.github.checkpoint.v1' as const, queryFingerprint: startGitHubCheckpoint(q).queryFingerprint,
    nextPage: status === 'more' ? pageNumber + 1 : null, status, lastReceiptId: receipt.id }, totalMatches: page.total_count };
}

type FetchLike = NonNullable<ConstructorParameters<typeof FirecrawlTransport>[0]>['fetchImpl'];
/** Only this reviewed workflow is executable. Retries preserve the router-issued id and payload.
 * Aggregate-only cost is deliberately NOT assigned to an entry: shared transport retains its
 * chargeUnknown reservation. Multi-capability allocation must remain an explicit future contract.
 */
export class PinnedGitHubTransport implements Transport {
  readonly kind = 'firecrawl-alexandria' as const;
  private readonly transport: FirecrawlTransport;
  private turn: Promise<unknown> = Promise.resolve();
  private lastStarted = 0;
  constructor(options: { discovery: unknown; apiKey?: string; fetchImpl?: FetchLike; maxAttempts?: number; retryDelayMs?: number; minIntervalMs?: number; sleep?: (ms: number) => Promise<void> }) {
    inspectGitHubDiscovery(options.discovery);
    const attempts = options.maxAttempts ?? 2, delay = options.retryDelayMs ?? 1000;
    const interval = options.minIntervalMs ?? 6000;
    if (!integer(attempts, 1, 3) || !integer(delay, 0, 5000) || !integer(interval, 0, 60_000)) fail('invalid_query', 'Retries must have bounded attempts and delay.');
    const network = options.fetchImpl ?? ((url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(15_000), redirect: 'error' }));
    this.transport = new FirecrawlTransport({ apiKey: options.apiKey, fetchImpl: async (url, init) => {
      let response: Awaited<ReturnType<NonNullable<FetchLike>>> | undefined;
      for (let i = 0; i < attempts; i++) {
        const sleep = options.sleep ?? (ms => new Promise<void>(resolve => setTimeout(resolve, ms)));
        const wait = Math.max(0, interval - (Date.now() - this.lastStarted));
        if (wait) await sleep(wait);
        this.lastStarted = Date.now();
        response = await network(url, init);
        if (![429,502,503,504].includes(response.status) || i + 1 === attempts) break;
        await sleep(delay);
      }
      const result = response!;
      return { ok: result.ok, status: result.status, json: async () => {
        const payload: unknown = await result.json();
        if (result.ok) {
          if (!object(payload) || !object(payload.data) || !Array.isArray(payload.data.alexandria) || payload.data.alexandria.length !== 1) fail('contract_drift', 'Expected exactly one result for the pinned workflow.');
          const entry = payload.data.alexandria[0];
          if (!object(entry) || entry.provider !== 'github-com' || entry.capability !== 'repositories/search_repos') fail('contract_drift', 'Provider result identity differs.');
          if (!entry.error && (!object(entry.workflow) || entry.workflow.version !== GITHUB_PIN.version || entry.workflow.digest !== GITHUB_PIN.digest)) fail('contract_drift', 'Workflow version or digest changed; acquisition quarantined.');
        }
        return payload;
      } };
    } });
  }
  execute(calls: readonly AlexandriaCall[]): Promise<CallResult[]> {
    if (calls.length !== 1 || calls[0].provider !== 'github-com' || calls[0].capability !== 'repositories/search_repos' || (calls[0].version && calls[0].version !== GITHUB_PIN.version)) fail('contract_drift', 'This isolated transport accepts only one pinned GitHub search call.');
    const turn = this.turn.then(() => this.transport.execute(calls.map(c => ({ ...c, version: GITHUB_PIN.version }))));
    this.turn = turn.catch(() => undefined);
    return turn;
  }
}

/** Result-artifact persistence and canonical ingestion are caller-owned existing integrations.
 * Checkpoint advances only after idempotent consumer completion. A settled call with a missing
 * artifact fails as replay_completed; it is never silently paid for again under a fresh id.
 */
export async function acquireGitHubPage(options: { alexandria: Alexandria; artifacts: GitHubPageArtifacts; query: GitHubSearchQuery; checkpoint: GitHubCheckpoint; runId: string; retrievedAt: string; ingest: (reference: GitHubReference, idempotencyKey: string) => Promise<void> }) {
  const { query, checkpoint } = options;
  validateQuery(query);
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(options.runId) || checkpoint.schemaVersion !== 'starlight.github.checkpoint.v1' || checkpoint.queryFingerprint !== startGitHubCheckpoint(query).queryFingerprint || checkpoint.status !== 'more' || !integer(checkpoint.nextPage, 1, Math.floor(1000 / query.perPage))) fail('checkpoint_mismatch', 'Checkpoint is terminal or belongs to another admitted query, pin or run.');
  const pageNumber = checkpoint.nextPage;
  const requestId = `github-${sha([options.runId, checkpoint.queryFingerprint, pageNumber]).slice(0,48)}`;
  const callOptions = { query: query.query, page: pageNumber, per_page: query.perPage, sort: query.sort, order: query.order };
  const fingerprint = sha({ capability: GITHUB_SEARCH, options: callOptions, pin: GITHUB_PIN });
  let artifact = await options.artifacts.get(requestId);
  if (artifact && (artifact.requestId !== requestId || artifact.receipt.requestId !== requestId || artifact.fingerprint !== fingerprint || artifact.sha256 !== sha(artifact.page))) fail('artifact_mismatch', 'Persisted page conflicts with its request or content hash.');
  if (!artifact) {
    const result = await options.alexandria.execute({ capabilityId: GITHUB_SEARCH, options: callOptions, requestId });
    if (result.result.error) fail('provider_failure', `GitHub acquisition refused: ${result.result.error.code}`);
    const page = result.result.records[0];
    artifact = { requestId, fingerprint, page, receipt: result.receipt, sha256: sha(page ?? null), retrievedAt: options.retrievedAt };
    // Validate before source capture; malformed/private payloads never enter the library.
    normalizeGitHubPage(page, query, pageNumber, result.receipt, options.retrievedAt);
    await options.artifacts.put(artifact);
  }
  const normalized = normalizeGitHubPage(artifact.page, query, pageNumber, artifact.receipt, artifact.retrievedAt);
  for (const reference of normalized.references) await options.ingest(reference, `github:${reference.githubRepositoryId}:${reference.source.sha256}`);
  return { ...normalized, receipt: artifact.receipt, usage: { reservedCredits: artifact.receipt.reserved, accountingCredits: artifact.receipt.creditsCost,
    reportedProviderCredits: artifact.receipt.chargeUnknown ? null : artifact.receipt.creditsCost,
    chargeUnknown: artifact.receipt.chargeUnknown === true, entityCount: normalized.references.length,
    creditsPerEntity: !artifact.receipt.chargeUnknown && normalized.references.length ? artifact.receipt.creditsCost / normalized.references.length : null,
    reservedCreditsPerEntity: normalized.references.length ? artifact.receipt.reserved / normalized.references.length : null } };
}

