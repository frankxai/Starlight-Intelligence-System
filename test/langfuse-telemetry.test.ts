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
