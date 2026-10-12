/**
 * src/telemetry/experiments.ts — Starlight Experiment & Evaluation Runner for Langfuse Cloud EU
 *
 * Automates tracking and scoring of:
 * 1. Track D v0.1 — 7 risk-dimension evals (agent-event, council, provenance, pack, permissions, privacy, workpacket)
 * 2. Retrieval benchmarks (FTS5 + bm25 vs semantic hybrid Recall@k, MRR, latency)
 * 3. Model Arena runs (head-to-head model performance, coding asserts, constraint stacks, judge scores)
 *
 * Synchronizes results, datasets, traces, and metrics directly to Langfuse Cloud (EU Frankfurt).
 *
 * Built on SIP — sovereign experiment tier.
 */

import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { RetrievalIndex } from '../retrieval.js';
import { telemetry, type EvalSummaryReceipt, type ArenaRunReceipt } from './langfuse.js';

export interface RetrievalBenchmarkResult {
  queriesCount: number;
  recallAt1: number;
  recallAt3: number;
  recallAt5: number;
  mrr: number;
  durationMs: number;
  results: Array<{
    query: string;
    expectedId: string;
    rank: number;
    foundAt1: boolean;
    foundAt3: boolean;
    foundAt5: boolean;
  }>;
}

export interface ExperimentRunReport {
  timestamp: string;
  region: string;
  evalSummary?: EvalSummaryReceipt;
  retrievalBenchmark?: RetrievalBenchmarkResult;
  arenaRunsSynced: number;
  langfuseActive: boolean;
}

const LABELED_RETRIEVAL_QUERIES: Array<{ query: string; expectedId: string }> = [
  { query: 'Cinzel font Inter Space Grotesk', expectedId: 'creative_20260402_001' },
  { query: 'R2 free egress Supabase media', expectedId: 'tech_20260402_002' },
  { query: 'FTS5 bm25 scoring hybrid lexical', expectedId: 'tech_20260410_002' },
  { query: 'JSONL source of truth SQLite rebuildable index', expectedId: 'tech_20260410_001' },
  { query: 'BYOK first managed support burden', expectedId: 'strat_20260402_001' },
  { query: 'gap memory landscape local-first structured vaults', expectedId: 'strat_20260410_005' },
  { query: 'MCP distribution not plumbing protocol', expectedId: 'strat_20260410_004' },
  { query: 'word trigram Jaccard contradiction detection', expectedId: 'tech_20260410_004' },
  { query: 'Server Components Next.js client components', expectedId: 'tech_20260410_005' },
  { query: 'LemonSqueezy Stripe payments Supabase', expectedId: 'strat_20260402_002' },
];

export class StarlightExperimentRunner {
  private repoRoot: string;

  constructor(repoRoot?: string) {
    this.repoRoot = repoRoot || process.cwd();
  }

  /**
   * Run the 7 Track D risk-dimension evals and record the receipt to Langfuse Cloud EU.
   */
  public async runRiskDimensionEvals(): Promise<EvalSummaryReceipt> {
    const evalsDir = resolve(this.repoRoot, 'test', 'v01-evals');
    if (!existsSync(evalsDir)) {
      throw new Error(`Evals directory not found at: ${evalsDir}`);
    }

    const files = readdirSync(evalsDir)
      .filter((f) => f.endsWith('.test.ts'))
      .sort();

    const startTime = Date.now();
    const details: EvalSummaryReceipt['details'] = [];
    let totalPass = 0;
    let totalFail = 0;
    let totalTodo = 0;

    for (const file of files) {
      const fullPath = join(evalsDir, file);
      const testStart = Date.now();
      const r = spawnSync(
        process.execPath,
        ['--import', 'tsx', '--test', '--test-reporter=tap', fullPath],
        { encoding: 'utf-8' },
      );
      const elapsed = ((Date.now() - testStart) / 1000).toFixed(2);
      const out = (r.stdout || '') + (r.stderr || '');

      const pass = parseInt((out.match(/^# pass (\d+)/m) ?? [])[1] ?? '0', 10);
      const fail = parseInt((out.match(/^# fail (\d+)/m) ?? [])[1] ?? '0', 10);
      const todo = parseInt((out.match(/^# todo (\d+)/m) ?? [])[1] ?? '0', 10);
      const status = r.status === 0 ? 'PASS' : 'FAIL';

      totalPass += pass;
      totalFail += fail;
      totalTodo += todo;

      details.push({
        file,
        status,
        pass,
        fail,
        todo,
        elapsed,
      });
    }

    const durationSeconds = Number(((Date.now() - startTime) / 1000).toFixed(2));
    const summary: EvalSummaryReceipt = {
      suiteName: 'Track D v0.1 — 7 risk-dimension evals',
      totalPass,
      totalFail,
      totalTodo,
      durationSeconds,
      details,
    };

    if (telemetry.active) {
      await telemetry.recordEvalSummary(summary);
    }

    return summary;
  }

  /**
   * Run retrieval benchmark against public-vault corpus and stream metrics to Langfuse EU.
   */
  public async runRetrievalBenchmark(): Promise<RetrievalBenchmarkResult> {
    const corpusDir = resolve(this.repoRoot, 'public-vault');
    const start = Date.now();

    // In-memory or temporary SQLite database
    const index = new RetrievalIndex(':memory:');
    index.rebuildFromVaults(corpusDir);

    let hitsAt1 = 0;
    let hitsAt3 = 0;
    let hitsAt5 = 0;
    let reciprocalRankSum = 0;

    const results: RetrievalBenchmarkResult['results'] = [];

    const trace = telemetry.traceAgent({
      name: 'experiment:retrieval-benchmark',
      tags: ['experiment', 'retrieval', 'benchmark', 'bm25-hybrid'],
      metadata: {
        corpus: 'public-vault',
        queriesCount: LABELED_RETRIEVAL_QUERIES.length,
      },
    });

    for (const item of LABELED_RETRIEVAL_QUERIES) {
      const qStart = Date.now();
      const hits = index.search(item.query, { limit: 10 });
      const qDuration = Date.now() - qStart;

      const idx = hits.findIndex((h) => h.entry.id === item.expectedId);
      const rank = idx < 0 ? Infinity : idx + 1;

      const foundAt1 = rank === 1;
      const foundAt3 = rank <= 3;
      const foundAt5 = rank <= 5;

      if (foundAt1) hitsAt1++;
      if (foundAt3) hitsAt3++;
      if (foundAt5) hitsAt5++;
      if (rank !== Infinity) reciprocalRankSum += 1.0 / rank;

      results.push({
        query: item.query,
        expectedId: item.expectedId,
        rank,
        foundAt1,
        foundAt3,
        foundAt5,
      });

      if (trace) {
        trace.span({
          name: `retrieval-query:${item.expectedId}`,
          input: { query: item.query, expectedId: item.expectedId },
          output: { rank, foundAt1, foundAt3, foundAt5 },
          metadata: { latencyMs: qDuration },
        });
      }
    }

    const n = LABELED_RETRIEVAL_QUERIES.length;
    const recallAt1 = hitsAt1 / n;
    const recallAt3 = hitsAt3 / n;
    const recallAt5 = hitsAt5 / n;
    const mrr = reciprocalRankSum / n;
    const durationMs = Date.now() - start;

    if (trace) {
      trace.score({ name: 'retrieval_recall_1', value: recallAt1, comment: `Recall@1: ${(recallAt1 * 100).toFixed(1)}%` });
      trace.score({ name: 'retrieval_recall_3', value: recallAt3, comment: `Recall@3: ${(recallAt3 * 100).toFixed(1)}%` });
      trace.score({ name: 'retrieval_recall_5', value: recallAt5, comment: `Recall@5: ${(recallAt5 * 100).toFixed(1)}%` });
      trace.score({ name: 'retrieval_mrr', value: mrr, comment: `MRR: ${mrr.toFixed(3)}` });
      await telemetry.flush();
    }

    index.close();

    return {
      queriesCount: n,
      recallAt1,
      recallAt3,
      recallAt5,
      mrr,
      durationMs,
      results,
    };
  }

  /**
   * Sync all Model Arena JSON receipts into Langfuse Cloud EU.
   */
  public async syncArenaReceipts(): Promise<number> {
    const arenaRunsDir = resolve(this.repoRoot, 'tools', 'arena', 'runs');
    if (!existsSync(arenaRunsDir)) return 0;

    const files = readdirSync(arenaRunsDir).filter((f) => f.endsWith('.json'));
    let synced = 0;

    for (const file of files) {
      try {
        const content = readFileSync(join(arenaRunsDir, file), 'utf-8');
        const receipt = JSON.parse(content) as ArenaRunReceipt;
        if (receipt.runId && Array.isArray(receipt.tasks)) {
          await telemetry.recordArenaRun(receipt);
          synced++;
        }
      } catch (err) {
        console.warn(`[StarlightExperimentRunner] Failed to sync arena receipt ${file}:`, err);
      }
    }

    return synced;
  }

  /**
   * Run full experiment & evaluation suite.
   */
  public async runAll(): Promise<ExperimentRunReport> {
    const evalSummary = await this.runRiskDimensionEvals();
    const retrievalBenchmark = await this.runRetrievalBenchmark();
    const arenaRunsSynced = await this.syncArenaReceipts();

    return {
      timestamp: new Date().toISOString(),
      region: telemetry.getDiagnostic().region,
      evalSummary,
      retrievalBenchmark,
      arenaRunsSynced,
      langfuseActive: telemetry.active,
    };
  }
}

/**
 * Convenience entrypoint for CLI scripts.
 */
export async function runExperiments(target: string = 'all'): Promise<ExperimentRunReport | EvalSummaryReceipt | RetrievalBenchmarkResult | number> {
  const runner = new StarlightExperimentRunner();

  switch (target) {
    case 'risk-evals':
    case 'evals':
      return await runner.runRiskDimensionEvals();
    case 'retrieval':
      return await runner.runRetrievalBenchmark();
    case 'arena':
      return await runner.syncArenaReceipts();
    case 'all':
    default:
      return await runner.runAll();
  }
}
