/** Deterministic synthetic normalization benchmark. Zero network and zero provider requests.
 * This measures the adapter, not a live database, full graph search or Cloudflare infrastructure.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { normalizeGitHubPage } from '../src/alexandria/github.js';
import type { GitHubReference, GitHubSearchQuery } from '../src/alexandria/github.js';
import { canonicalJson, hashRecords } from '../src/alexandria/receipts.js';
import type { Receipt } from '../src/alexandria/types.js';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/github-search-live.json', import.meta.url), 'utf8'));
const basePage = fixture.data.alexandria[0].data;
const fixedTime = '2026-11-13T21:50:00.000Z';
function run(size: number) {
  const started = performance.now(), index = new Map<string, GitHubReference>(), hash = createHash('sha256');
  let pages = 0;
  for (let offset = 0; offset < size; offset += 100) {
    const query: GitHubSearchQuery = { query: `synthetic-fixture-partition:${offset / 100}`, perPage: 100, sort: 'updated', order: 'desc' };
    const page = { ...structuredClone(basePage), query: query.query, per_page: 100, count: Math.min(100, size - offset), total_count: Math.min(100, size - offset), repositories: [] as unknown[] };
    for (let j = offset; j < Math.min(size, offset + 100); j++) {
      const row = structuredClone(basePage.repositories[0]);
      row.id = 10_000_000 + j; row.full_name = `fixture-owner/agent-${j}`; row.name = `agent-${j}`; row.source_url = `https://github.com/${row.full_name}`;
      row.owner.id = 999999; row.owner.login = 'fixture-owner';
      page.repositories.push(row);
    }
    const receipt: Receipt = { id: `synthetic-receipt-${pages}`, issuedAt: fixedTime, sessionId: 'synthetic-benchmark', requestId: `synthetic-request-${pages}`,
      callFingerprint: 'synthetic-not-a-provider-call', observedAt: fixedTime, provider: 'github-com', capability: 'repositories/search_repos', options: {},
      recordCount: 1, contentHash: hashRecords([page]), reserved: 0, maxCredits: 0, creditsCost: 0, source: 'https://github.com', redistribution: 'not-cleared', sipLayers: [] };
    const normalized = normalizeGitHubPage(page, query, 1, receipt, fixedTime);
    for (const reference of normalized.references) { assert.equal(index.has(reference.id), false); index.set(reference.id, reference); hash.update(canonicalJson(reference)); }
    pages++;
  }
  const firstPassHash = hash.digest('hex');
  const replayStart = performance.now();
  for (const [id, reference] of index) index.set(id, structuredClone(reference));
  assert.equal(index.size, size);
  return { label: 'synthetic-adapter-normalization', entities: size, pages, providerRequests: 0, providerCreditsSpent: 0,
    indexCardinalityAfterReplay: index.size, deterministicSha256: firstPassHash, elapsedMs: +(performance.now() - started).toFixed(2),
    replayMs: +(performance.now() - replayStart).toFixed(2), peakProcessRssBytes: process.resourceUsage().maxRSS * 1024,
    infrastructureCost: null, measuredAt: new Date().toISOString(), node: process.version };
}
const tenK = run(10_000);
console.log(JSON.stringify(tenK));
const hundredK = run(100_000);
console.log(JSON.stringify(hundredK));
