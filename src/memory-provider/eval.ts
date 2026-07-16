import { performance } from 'node:perf_hooks';
import type {
  FlushableMemoryProvider,
  MemoryProvider,
  RecallRequest,
  SISMemoryRecord,
} from './types.js';

export interface ProviderEvalQuery {
  id: string;
  scenario: string;
  request: RecallRequest;
  expected_any: string[];
  forbidden: string[];
}

export interface ProviderEvalForgetCase {
  memory_id: string;
  tenant_id: string;
  workspace_id?: string;
  verification_query: RecallRequest;
  deletion_required: boolean;
}

export interface ProviderEvalFixture {
  schema: 'sis.memory.provider_eval.v1';
  quality_eligible: boolean;
  purpose: string;
  records: SISMemoryRecord[];
  queries: ProviderEvalQuery[];
  forget_cases: ProviderEvalForgetCase[];
}

export interface ProviderEvalOptions {
  candidate: string;
  execution_mode: 'local_engine' | 'adapter_contract' | 'live_provider';
  fixture_path?: string;
}

export interface ProviderEvalResult {
  schema: 'sis.memory.provider_eval_result.v1';
  candidate: string;
  provider: string;
  execution_mode: ProviderEvalOptions['execution_mode'];
  quality_eligible: boolean;
  fixture_path?: string;
  evaluated_at: string;
  ingest: { attempted: number; written: number; failed: number };
  retrieval: {
    queries: number;
    hit_at_1: number;
    hit_at_3: number;
    mrr: number;
    forbidden_leaks: number;
    latency_ms_p50: number;
    latency_ms_p95: number;
  };
  lifecycle: {
    forget_cases: number;
    forget_passed: number;
  };
  scenarios: Array<{
    id: string;
    scenario: string;
    returned_ids: string[];
    first_relevant_rank: number | null;
    forbidden_ids: string[];
    latency_ms: number;
  }>;
  verdict: 'pass' | 'fail';
  limitations: string[];
}

/**
 * Deterministic provider contract eval. Synthetic adapter runs are explicitly
 * not quality-eligible; only a live-provider run against a published fixture
 * may be used to compare native retrieval quality.
 */
export async function runMemoryProviderEval(
  provider: MemoryProvider,
  fixture: ProviderEvalFixture,
  options: ProviderEvalOptions,
): Promise<ProviderEvalResult> {
  validateFixture(fixture);

  let ingestFailed = 0;
  for (const record of fixture.records) {
    try {
      const saved = await provider.remember(structuredClone(record));
      const ref = saved.provider_shadow_refs[provider.name];
      if (ref?.sync_state === 'failed') ingestFailed++;
    } catch {
      ingestFailed++;
    }
  }

  let ingest = {
    attempted: fixture.records.length,
    written: fixture.records.length - ingestFailed,
    failed: ingestFailed,
  };
  if (isFlushable(provider)) {
    const flushed = await provider.flush();
    ingest = {
      attempted: flushed.attempted + ingestFailed,
      written: flushed.written,
      failed: flushed.failed + ingestFailed,
    };
  }

  const scenarios: ProviderEvalResult['scenarios'] = [];
  for (const query of fixture.queries) {
    const started = performance.now();
    let results;
    try {
      results = await provider.recall(query.request);
    } catch {
      results = [];
    }
    const latencyMs = performance.now() - started;
    const returnedIds = results.map(result => result.record.memory_id);
    const firstRelevantIndex = returnedIds.findIndex(id => query.expected_any.includes(id));
    scenarios.push({
      id: query.id,
      scenario: query.scenario,
      returned_ids: returnedIds,
      first_relevant_rank: firstRelevantIndex >= 0 ? firstRelevantIndex + 1 : null,
      forbidden_ids: returnedIds.filter(id => query.forbidden.includes(id)),
      latency_ms: round(latencyMs),
    });
  }

  let forgetPassed = 0;
  for (const forgetCase of fixture.forget_cases) {
    let deleted = false;
    try {
      deleted = await provider.forget({
        tenant_id: forgetCase.tenant_id,
        workspace_id: forgetCase.workspace_id,
        memory_id: forgetCase.memory_id,
      });
    } catch {
      deleted = false;
    }
    const after = await provider.recall(forgetCase.verification_query).catch(() => []);
    const absent = !after.some(result => result.record.memory_id === forgetCase.memory_id);
    if (absent && (deleted || !forgetCase.deletion_required)) forgetPassed++;
  }

  const ranks = scenarios.map(row => row.first_relevant_rank);
  const latencies = scenarios.map(row => row.latency_ms).sort((a, b) => a - b);
  const queryCount = scenarios.length;
  const forbiddenLeaks = scenarios.reduce((sum, row) => sum + row.forbidden_ids.length, 0);
  const retrieval = {
    queries: queryCount,
    hit_at_1: ratio(ranks.filter(rank => rank === 1).length, queryCount),
    hit_at_3: ratio(ranks.filter(rank => rank != null && rank <= 3).length, queryCount),
    mrr: round(queryCount === 0 ? 0 : ranks.reduce<number>((sum, rank) => sum + (rank ? 1 / rank : 0), 0) / queryCount),
    forbidden_leaks: forbiddenLeaks,
    latency_ms_p50: percentile(latencies, 0.5),
    latency_ms_p95: percentile(latencies, 0.95),
  };

  const lifecycle = { forget_cases: fixture.forget_cases.length, forget_passed: forgetPassed };
  const pass = ingest.failed === 0
    && retrieval.hit_at_3 === 1
    && forbiddenLeaks === 0
    && forgetPassed === fixture.forget_cases.length;

  return {
    schema: 'sis.memory.provider_eval_result.v1',
    candidate: options.candidate,
    provider: provider.name,
    execution_mode: options.execution_mode,
    quality_eligible: fixture.quality_eligible && options.execution_mode === 'live_provider',
    fixture_path: options.fixture_path,
    evaluated_at: new Date().toISOString(),
    ingest,
    retrieval,
    lifecycle,
    scenarios,
    verdict: pass ? 'pass' : 'fail',
    limitations: options.execution_mode === 'adapter_contract'
      ? ['Adapter-contract simulation only; it does not measure the vendor retrieval engine, model, latency, or service reliability.']
      : fixture.quality_eligible
        ? []
        : ['Synthetic fixture; results are regression evidence, not a public benchmark or vendor-quality comparison.'],
  };
}

function isFlushable(provider: MemoryProvider): provider is FlushableMemoryProvider {
  const candidate = provider as Partial<FlushableMemoryProvider>;
  return typeof candidate.flush === 'function' && typeof candidate.pendingCount === 'function';
}

function validateFixture(fixture: ProviderEvalFixture): void {
  if (fixture.schema !== 'sis.memory.provider_eval.v1') throw new Error(`Unsupported fixture schema: ${fixture.schema}`);
  const recordIds = new Set(fixture.records.map(record => record.memory_id));
  if (recordIds.size !== fixture.records.length) throw new Error('Fixture memory_id values must be unique');
  for (const query of fixture.queries) {
    if (query.expected_any.length === 0) throw new Error(`Query ${query.id} has no expected ids`);
    for (const id of query.expected_any) {
      if (!recordIds.has(id)) throw new Error(`Query ${query.id} references unknown expected id ${id}`);
    }
  }
}

function percentile(sorted: number[], fraction: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1);
  return round(sorted[index] ?? 0);
}

function ratio(numerator: number, denominator: number): number {
  return round(denominator === 0 ? 0 : numerator / denominator);
}

function round(value: number): number {
  return Number(value.toFixed(3));
}
