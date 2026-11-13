import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Alexandria, AlexandriaError } from '../src/alexandria/router.js';
import { Library, loadCatalog, validateCatalog } from '../src/alexandria/catalog.js';
import { ReceiptLedger, hashRecords } from '../src/alexandria/receipts.js';
import { GITHUB_PIN, GITHUB_SEARCH, PinnedGitHubTransport, acquireGitHubPage, estimateGitHubAcquisition, inspectGitHubDiscovery, normalizeGitHubPage, startGitHubCheckpoint, withGitHubCatalog } from '../src/alexandria/github.js';
import type { GitHubAcquiredPage, GitHubReference, GitHubSearchQuery } from '../src/alexandria/github.js';
import type { Receipt } from '../src/alexandria/types.js';

const fixtureRoot = fileURLToPath(new URL('./fixtures/', import.meta.url));
const discovery = JSON.parse(readFileSync(join(fixtureRoot, 'github-discovery.json'), 'utf8'));
const live = JSON.parse(readFileSync(join(fixtureRoot, 'github-search-live.json'), 'utf8'));
const query: GitHubSearchQuery = { query: 'repo:CopilotKit/CopilotKit', perPage: 3, sort: 'updated', order: 'desc' };
const retrievedAt = '2026-11-13T21:50:00.000Z';
const clone = <T>(value: T): T => structuredClone(value);
function setup(payload = clone(live), responses: number[] = [200]) {
  const dir = mkdtempSync(join(tmpdir(), 'github-federation-'));
  const ledger = new ReceiptLedger(join(dir, 'receipts.jsonl'));
  const requests: { id: string; body: Record<string, unknown> }[] = [];
  const sleeps: number[] = [];
  const transport = new PinnedGitHubTransport({ discovery, apiKey: 'fixture-key-not-a-secret', minIntervalMs: 0, maxAttempts: 3,
    sleep: async ms => { sleeps.push(ms); }, fetchImpl: async (_url, init) => {
      requests.push({ id: init.headers['x-request-id'], body: JSON.parse(init.body) });
      const status = responses.shift() ?? 200;
      return { ok: status === 200, status, json: async () => clone(payload) };
    } });
  const library = new Library(withGitHubCatalog(loadCatalog(), discovery));
  const alexandria = new Alexandria({ library, transports: [transport], ledger, sessionId: 'github-test', maxCredits: 10 });
  const acquired = new Map<string, GitHubAcquiredPage>();
  const ingested = new Map<string, GitHubReference>();
  const artifacts = { get: async (id: string) => clone(acquired.get(id)), put: async (artifact: GitHubAcquiredPage) => { acquired.set(artifact.requestId, clone(artifact)); } };
  const ingest = async (reference: GitHubReference, key: string) => { ingested.set(key, reference); };
  return { dir, ledger, requests, sleeps, payload, alexandria, transport, acquired, artifacts, ingested, ingest,
    run: (options: Partial<Parameters<typeof acquireGitHubPage>[0]> = {}) => acquireGitHubPage({ alexandria, artifacts, query, checkpoint: startGitHubCheckpoint(query), runId: 'fixture-run', retrievedAt, ingest, ...options }),
    close: () => { alexandria.close(); rmSync(dir, { recursive: true, force: true }); } };
}
function receiptFor(page: unknown): Receipt {
  return { id: 'receipt-fixture', issuedAt: retrievedAt, sessionId: 'fixture', requestId: 'fixture-request', callFingerprint: 'fixture', observedAt: retrievedAt,
    provider: 'github-com', capability: 'repositories/search_repos', options: {}, recordCount: 1, contentHash: hashRecords([page]), reserved: 5, maxCredits: 10,
    creditsCost: 5, source: 'https://github.com', redistribution: 'not-cleared', sipLayers: [] };
}
describe('governed GitHub federation contract', () => {
  it('inspects the real discovery fixture, remains additive, and rejects changed price or schema', () => {
    const base = loadCatalog(), before = JSON.stringify(base);
    const catalog = withGitHubCatalog(base, discovery);
    assert.equal(validateCatalog(catalog).length, 0);
    assert.equal(catalog.providers.length, base.providers.length + 1);
    assert.equal(JSON.stringify(base), before);
    assert.throws(() => withGitHubCatalog(catalog, discovery), /already exists/);
    for (const mutation of [(cap: any) => { cap.creditsCost = 6; }, (cap: any) => { cap.options.find((o: any) => o.name === 'per_page').max = 1000; }, (cap: any) => { cap.response.key = 'people'; }, (cap: any) => { cap.response.fields.find((f: any) => f.name === 'id').type = 'string'; }]) {
      const bad = clone(discovery), cap = bad.data.alexandria[0].data.items.find((x: any) => x.id === GITHUB_SEARCH);
      mutation(cap); assert.throws(() => inspectGitHubDiscovery(bad), /differs/);
    }
  });
  it('estimates requests and ceilings without treating unmeasured currency cost as zero', () => {
    assert.deepEqual(estimateGitHubAcquisition(query, 2), { provider: 'github-com', requests: 2, maximumRecords: 6, credits: 10, currencyCost: null,
      directOfficialApiPreferred: true, reason: 'GitHub REST supplies the same public metadata without Firecrawl acquisition credits; partition queries for larger corpora.' });
    assert.throws(() => estimateGitHubAcquisition({ ...query, perPage: 100 }, 11), /1,000/);
    for (const perPage of [0,101,NaN,1.5]) assert.throws(() => estimateGitHubAcquisition({ ...query, perPage }, 1));
  });
  it('runs the observed numeric-record/page-object response through the existing money path conservatively', async () => {
    const s = setup(); try {
      const result = await s.run();
      assert.equal(result.references.length, 1);
      const reference = result.references[0];
      assert.equal(reference.id, 'github:repository:655515393');
      assert.equal(reference.membership, 'external-reference');
      assert.equal(reference.ownership, 'unclaimed');
      assert.equal(reference.rights.repositorySpdx, 'MIT');
      assert.equal(reference.rights.redistribution, 'not-cleared');
      assert.deepEqual(reference.capabilities, []);
      assert.equal(s.requests[0].body.alexandria instanceof Array, true);
      assert.equal((s.requests[0].body.alexandria as any[])[0].version, GITHUB_PIN.version);
      assert.equal(result.usage.chargeUnknown, true);
      assert.equal(result.usage.reportedProviderCredits, null);
      assert.equal(result.usage.creditsPerEntity, null);
      assert.equal(result.usage.reservedCreditsPerEntity, 5);
      assert.equal(s.ledger.spent('github-test'), 5);
      assert.equal(result.checkpoint.status, 'complete');
    } finally { s.close(); }
  });
  it('replays the acquired artifact after consumer failure without provider calls or double accounting', async () => {
    const s = setup(); try {
      await assert.rejects(s.run({ ingest: async () => { throw Error('projection temporarily unavailable'); } }), /temporarily/);
      assert.equal(s.acquired.size, 1); assert.equal(s.requests.length, 1);
      const result = await s.run({ retrievedAt: '2026-11-14T00:00:00.000Z' });
      await s.run();
      assert.equal(s.requests.length, 1); assert.equal(s.ledger.spent('github-test'), 5);
      assert.equal(s.ingested.size, 1); assert.equal(result.references[0].source.retrievedAt, retrievedAt);
      const tampered = [...s.acquired.values()][0]; (tampered.page as any).query = 'different';
      s.acquired.set(tampered.requestId, tampered);
      await assert.rejects(s.run(), /conflicts/); assert.equal(s.requests.length, 1);
    } finally { s.close(); }
  });
  it('fails a settled request with missing capture rather than charging a fresh request', async () => {
    const s = setup(); try {
      await s.run(); s.acquired.clear();
      await assert.rejects(s.run(), (e: unknown) => e instanceof AlexandriaError && e.code === 'replay_completed');
      assert.equal(s.requests.length, 1); assert.equal(s.ledger.spent('github-test'), 5);
    } finally { s.close(); }
  });
  it('pins workflow bytes, retains the uncertain hold and retries with the original request identity', async () => {
    const payload = clone(live); payload.data.alexandria[0].workflow.digest = 'sha256:drift';
    const s = setup(payload); try {
      await assert.rejects(s.run());
      assert.equal(s.acquired.size, 0); assert.equal(s.ingested.size, 0);
      assert.equal(s.ledger.spent('github-test'), 5);
      payload.data.alexandria[0].workflow.digest = GITHUB_PIN.digest;
      await s.run();
      assert.equal(s.requests.length, 2); assert.equal(s.requests[0].id, s.requests[1].id);
      assert.equal(s.ledger.spent('github-test'), 5);
    } finally { s.close(); }
  });
  it('bounds 429/503 retries and preserves byte-identical request and idempotency keys', async () => {
    const s = setup(clone(live), [429,503,200]); try {
      await s.run(); assert.equal(s.requests.length, 3);
      assert.deepEqual(s.requests[0], s.requests[1]); assert.deepEqual(s.requests[1], s.requests[2]);
      assert.equal(s.sleeps.length, 2); assert.equal(s.ledger.spent('github-test'), 5);
    } finally { s.close(); }
  });
  it('refuses exhausted local budgets before another provider dispatch', async () => {
    const s = setup(); try {
      await s.run(); await s.run({ runId: 'second-run' });
      await assert.rejects(s.run({ runId: 'third-run' }), (e: unknown) => e instanceof AlexandriaError && e.code === 'over_budget');
      assert.equal(s.requests.length, 2); assert.equal(s.ledger.spent('github-test'), 10);
    } finally { s.close(); }
  });
  it('quarantines private, duplicate, mismatched owner and attribution fixtures before capture', async () => {
    for (const mutate of [(p: any) => { p.repositories[0].visibility = 'private'; }, (p: any) => { p.repositories[0].source_url = 'https://evil.example'; },
      (p: any) => { p.repositories[0].owner.login = 'someone-else'; }, (p: any) => { p.repositories.push(clone(p.repositories[0])); p.count = 2; }]) {
      const payload = clone(live); mutate(payload.data.alexandria[0].data);
      const s = setup(payload); try { await assert.rejects(s.run()); assert.equal(s.acquired.size, 0); assert.equal(s.ingested.size, 0); } finally { s.close(); }
    }
  });
  it('rejects query/pagination mismatch and stops incomplete or 1000-result windows explicitly', () => {
    const page = clone(live.data.alexandria[0].data), q = { ...query, perPage: 100 };
    page.per_page = 100; page.page = 10; page.has_next = true; page.next_page = 11;
    let normalized = normalizeGitHubPage(page, q, 10, receiptFor(page), retrievedAt);
    assert.equal(normalized.checkpoint.status, 'search-window-exhausted'); assert.equal(normalized.checkpoint.nextPage, null);
    page.page = 1; page.next_page = 2; page.incomplete_results = true;
    normalized = normalizeGitHubPage(page, q, 1, receiptFor(page), retrievedAt);
    assert.equal(normalized.checkpoint.status, 'incomplete'); assert.equal(normalized.checkpoint.nextPage, null);
    page.incomplete_results = false;
    normalized = normalizeGitHubPage(page, q, 1, receiptFor(page), retrievedAt);
    assert.equal(normalized.checkpoint.nextPage, 2);
    page.query = 'attacker'; assert.throws(() => normalizeGitHubPage(page, q, 1, receiptFor(page), retrievedAt), /admitted/);
  });
  it('keeps equal-looking names with different stable upstream IDs separate without merging people', () => {
    const page = clone(live.data.alexandria[0].data);
    const other = clone(page.repositories[0]); other.id += 1; other.owner.id += 1;
    page.repositories.push(other); page.count = 2; page.total_count = 2;
    const result = normalizeGitHubPage(page, query, 1, receiptFor(page), retrievedAt);
    assert.equal(result.references.length, 2);
    assert.notEqual(result.references[0].id, result.references[1].id);
    assert.notEqual(result.references[0].ownerReference.id, result.references[1].ownerReference.id);
    assert.ok(result.references.every(r => r.membership === 'external-reference' && r.ownership === 'unclaimed'));
  });
});
