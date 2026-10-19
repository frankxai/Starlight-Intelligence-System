/**
 * test/langfuse-telemetry.test.ts — Unit tests for Starlight Langfuse Cloud (EU) telemetry & experiments
 *
 * Verifies:
 * - EU Cloud endpoint normalization (cloud.langfuse.com & eu.cloud.langfuse.com)
 * - Safe offline / mock operation when API keys are omitted
 * - Tracing primitives (Agent, Harness, MCP, Memory, Orchestration, Swarm)
 * - Eval summary recording
 * - Model Arena receipt ingestion
 * - Experiment runner execution
 *
 * Built on SIP — operational test tier.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  StarlightTelemetry,
  telemetry,
  StarlightExperimentRunner,
  discoverLangfuseCredentials,
  type ArenaRunReceipt,
  type EvalSummaryReceipt,
} from '../src/index.js';

describe('Starlight Langfuse Cloud (EU) Telemetry', () => {
  it('defaults to Langfuse Cloud EU (Frankfurt) endpoint', () => {
    const t = new StarlightTelemetry({ enabled: false });
    const diag = t.getDiagnostic();
    assert.equal(diag.baseUrl, 'https://cloud.langfuse.com');
    assert.equal(diag.region, 'EU (Frankfurt)');
    assert.equal(diag.active, false);
  });

  it('normalizes "eu" shorthand to cloud.langfuse.com', () => {
    const t = new StarlightTelemetry({ baseUrl: 'eu', enabled: false });
    assert.equal(t.getDiagnostic().baseUrl, 'https://cloud.langfuse.com');
    assert.equal(t.getDiagnostic().region, 'EU (Frankfurt)');
  });

  it('normalizes custom EU endpoint e.g. eu.cloud.langfuse.com', () => {
    const t = new StarlightTelemetry({ baseUrl: 'https://eu.cloud.langfuse.com', enabled: false });
    assert.equal(t.getDiagnostic().baseUrl, 'https://eu.cloud.langfuse.com');
  });

  it('operates in safe mock mode when unconfigured without throwing', () => {
    const t = new StarlightTelemetry({ enabled: false });
    assert.equal(t.active, false);

    // traceAgent
    const trace = t.traceAgent({
      name: 'test-agent',
      sessionId: 'sess-123',
      tags: ['unit-test'],
    });
    assert.ok(trace);
    assert.ok(typeof trace.id === 'string');

    // span & score
    const span = trace.span({ name: 'test-span', input: { a: 1 }, output: { b: 2 } });
    assert.ok(span);
    span.end();

    trace.score({ name: 'accuracy', value: 0.95 });

    // traceHarnessSession
    const harnessTrace = t.traceHarnessSession({
      harness: 'antigravity',
      sessionId: 'sess-agy-1',
      cwd: 'C:/Users/frank/workspace',
    });
    assert.ok(harnessTrace);

    // traceMcpToolCall
    assert.doesNotThrow(() => {
      t.traceMcpToolCall({
        toolName: 'sis_vault_search',
        args: { query: 'test' },
        result: { count: 3 },
        durationMs: 12,
        success: true,
      });
    });

    // traceMemoryQuery
    assert.doesNotThrow(() => {
      t.traceMemoryQuery({
        query: 'sqlite fts5',
        vault: 'technical',
        resultsCount: 5,
        latencyMs: 8,
      });
    });

    // traceOrchestration
    const orchTrace = t.traceOrchestration({
      intent: 'refactor database layer',
      pattern: 'sequential',
      complexity: 'high',
      executionsCount: 3,
      confidence: 0.88,
      durationMs: 1400,
    });
    assert.ok(orchTrace);

    // traceSwarmTask
    assert.doesNotThrow(() => {
      t.traceSwarmTask({
        taskId: 'task-1',
        prompt: 'audit security rules',
        ok: true,
        durationMs: 340,
        exitCode: 0,
      });
    });

    // traceCouncilDispatch
    assert.doesNotThrow(() => {
      t.traceCouncilDispatch({
        topic: 'token budget allocation',
        agents: ['prime', 'architect', 'sentinel'],
        consensus: 'approved',
        durationMs: 500,
      });
    });
  });

  it('recordEvalSummary handles summary object gracefully in offline mode', async () => {
    const t = new StarlightTelemetry({ enabled: false });
    const summary: EvalSummaryReceipt = {
      suiteName: 'Track D v0.1 — 7 risk-dimension evals',
      totalPass: 25,
      totalFail: 0,
      totalTodo: 0,
      durationSeconds: 1.45,
      details: [
        { file: 'agent-event-completeness.test.ts', status: 'PASS', pass: 3, fail: 0, elapsed: '0.12' },
      ],
    };

    const res = await t.recordEvalSummary(summary);
    assert.equal(res, null); // offline mode returns null without throwing
  });

  it('recordArenaRun handles model arena receipt gracefully in offline mode', async () => {
    const t = new StarlightTelemetry({ enabled: false });
    const receipt: ArenaRunReceipt = {
      runId: 'arena-test-run',
      date: '2026-10-10',
      harness: 'claude-code-agent-tool',
      contestants: { modelA: 'claude-3-7-sonnet', modelB: 'gpt-4o' },
      tasks: [
        {
          id: 'test-task',
          category: 'reasoning',
          verification: 'asserts',
          results: {
            modelA: { status: 'PASS', durationMs: 1200 },
            modelB: { status: 'PASS', durationMs: 1500 },
          },
          winner: 'modelA',
        },
      ],
    };

    const res = await t.recordArenaRun(receipt);
    assert.equal(res, null);
  });

  it('recordArenaRun supports FrankX round_id receipt schema with string[] contestants and visual_evidence', async () => {
    const t = new StarlightTelemetry({ enabled: false });
    const scored: Array<{ name: string; value: number; comment?: string }> = [];
    const spans: Array<{ name: string }> = [];
    let recordedTraceName = '';

    // Inject mock client to verify score normalization (pass=1, partial=0.5, fail=0)
    (t as unknown as { client: unknown }).client = {
      trace: (opts: { name: string }) => {
        recordedTraceName = opts.name;
        return {
          id: 'trace-r6-argon',
          span: (sOpts: { name: string }) => {
            spans.push(sOpts);
            return { end: () => {} };
          },
          score: (scOpts: { name: string; value: number; comment?: string }) => {
            scored.push(scOpts);
          },
        };
      },
      flushAsync: async () => {},
    };

    const frankxReceipt: ArenaRunReceipt = {
      round_id: 'r6-argon-proving-ground-2026-10-14',
      date: '2026-10-14',
      title: 'Round 6 — Gemini 4 Argon Proving Ground',
      methodology: 'Mechanical verification + CDP Browser Hub (:9223) visual inspection',
      contestants: ['Gemini 4 Argon', 'Claude Fable 5.1', 'Claude Opus 5'],
      visual_evidence: {
        screenshots: ['/images/arena/r6-argon-model-arena.png'],
        cdp_endpoint: 'http://localhost:9223/wsEndpoint',
      },
      tasks: [
        {
          id: 't1-nextjs16-rsc-arena-card',
          category: 'coding',
          prompt: 'Build strict model-intelligence row joiner',
          results: {
            'gemini-4-argon': { status: 'pass', latency_ms: 1840, cost_usd: 0.0082, notes: '5/5 asserts passed' },
            'claude-fable-5-1': { status: 'partial', latency_ms: 2410, cost_usd: 0.031 },
            'claude-opus-5': { status: 'fail', latency_ms: 3100, cost_usd: 0.042 },
          },
        },
      ],
    };

    const res = await t.recordArenaRun(frankxReceipt);
    assert.deepEqual(res, { traceId: 'trace-r6-argon' });
    assert.equal(recordedTraceName, 'arena:r6-argon-proving-ground-2026-10-14');
    assert.equal(spans.length, 1);
    assert.equal(scored.length, 3);
    assert.equal(scored[0]?.value, 1.0);
    assert.equal(scored[1]?.value, 0.5);
    assert.equal(scored[2]?.value, 0.0);
  });
});

describe('Starlight Experiment Runner', () => {
  it('syncArenaReceipts reads arena runs directory and counts valid receipts', async () => {
    const runner = new StarlightExperimentRunner();
    const count = await runner.syncArenaReceipts();
    assert.ok(count > 0, `found and verified ${count} arena run receipts`);
  });

  it('runRetrievalBenchmark executes against public-vault and computes metrics', async () => {
    const runner = new StarlightExperimentRunner();
    const bench = await runner.runRetrievalBenchmark();
    assert.equal(bench.queriesCount, 10);
    assert.ok(bench.recallAt1 >= 0 && bench.recallAt1 <= 1);
    assert.ok(bench.recallAt5 >= 0 && bench.recallAt5 <= 1);
    assert.ok(bench.mrr >= 0 && bench.mrr <= 1);
    assert.equal(bench.results.length, 10);
  });
});

describe('Langfuse Multi-Tier Credential Discovery', () => {
  it('identifies explicit configuration', () => {
    const creds = discoverLangfuseCredentials({
      publicKey: 'pk-lf-explicit',
      secretKey: 'sk-lf-explicit',
      baseUrl: 'https://cloud.langfuse.com',
    });
    assert.equal(creds.source, 'config');
    assert.equal(creds.publicKey, 'pk-lf-explicit');
    assert.equal(creds.secretKey, 'sk-lf-explicit');
    assert.equal(creds.baseUrl, 'https://cloud.langfuse.com');
  });

  it('identifies environment variables', () => {
    const origPub = process.env.LANGFUSE_PUBLIC_KEY;
    const origSec = process.env.LANGFUSE_SECRET_KEY;
    try {
      process.env.LANGFUSE_PUBLIC_KEY = 'pk-lf-env-test';
      process.env.LANGFUSE_SECRET_KEY = 'sk-lf-env-test';

      const creds = discoverLangfuseCredentials();
      assert.equal(creds.source, 'process.env');
      assert.equal(creds.publicKey, 'pk-lf-env-test');
      assert.equal(creds.secretKey, 'sk-lf-env-test');
    } finally {
      if (origPub) process.env.LANGFUSE_PUBLIC_KEY = origPub;
      else delete process.env.LANGFUSE_PUBLIC_KEY;

      if (origSec) process.env.LANGFUSE_SECRET_KEY = origSec;
      else delete process.env.LANGFUSE_SECRET_KEY;
    }
  });

  it('reports source in TelemetryDiagnostic', () => {
    const t = new StarlightTelemetry({ enabled: false });
    const diag = t.getDiagnostic();
    assert.ok(typeof diag.credentialSource === 'string');
  });
});

