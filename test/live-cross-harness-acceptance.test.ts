import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, readFileSync, appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { ContextBridge, type ContextRecord } from '../src/context-bridge.js';
import { ReviewQueue, type ReviewJob, type ReviewBinding } from '../src/review-queue.js';
import { RuntimeBridge } from '../src/runtime-bridge/bridge.js';
import { WORKER_PROTOCOL } from '../src/runtime-bridge/contracts.js';
import {
  prepareJevRouterRequest,
  inspectJevRouterResponse,
  type JevRouterPolicy
} from '../src/runtime-bridge/jev-router.js';

const canonicalRepo = 'github.com/frankxai/Starlight-Intelligence-System';
const reviewedRevision = '1c7f40d78869ee6cc3fbfb0ad7f858f2ce5b186a';

function createEvent(id: string, extra: Partial<ContextRecord> = {}): ContextRecord {
  return {
    id,
    taskId: 'public-task-live-acceptance',
    harness: 'opencode',
    sessionId: 'session-harness-a',
    kind: 'observation',
    text: 'Standard observation by Harness A',
    repo: canonicalRepo,
    revision: reviewedRevision,
    evidence: 'observed',
    privacy: 'internal',
    ...extra,
  };
}

test('Live acceptance: Harness A creates artifact and checkpoint -> stops -> Harness B resumes without duplicates', async () => {
  const root = mkdtempSync(join(tmpdir(), 'sis-live-acceptance-'));
  const input = join(root, 'harness-a-output.jsonl');
  const journal = join(root, 'task-journal.jsonl');

  try {
    // 1. Harness A produces observations, a real artifact, and an explicit checkpoint
    const initialEvents: ContextRecord[] = [
      createEvent('evt-1', { text: 'Starting public task investigation' }),
      createEvent('evt-2', {
        kind: 'artifact',
        evidence: 'accepted',
        text: 'Created public artifact: docs/architecture/context-continuity.md verified against 1c7f40d7'
      }),
      createEvent('cp-1', {
        kind: 'checkpoint',
        evidence: 'verified',
        text: 'Checkpoint 1: Artifact generated, dependencies validated. Ready for Harness B.'
      }),
      createEvent('evt-3', {
        kind: 'observation',
        text: 'Post-checkpoint observation in Harness A'
      })
    ];

    writeFileSync(input, initialEvents.map(e => JSON.stringify(e)).join('\n') + '\n', 'utf8');

    // Harness A commits into the journal using ContextBridge
    const bridgeA = new ContextBridge(journal);
    const captureResult1 = await bridgeA.capture({
      sourceId: 'harness-a-stream',
      input,
      format: 'events'
    });

    assert.equal(captureResult1.captured, 4);
    assert.equal(captureResult1.rejected, 0);

    // 2. Harness A stops execution.
    // Replay / restart test: A second capture attempt on the same input captures 0 duplicates.
    const replayResult = await bridgeA.capture({
      sourceId: 'harness-a-stream',
      input,
      format: 'events'
    });
    assert.equal(replayResult.captured, 0);

    // 3. Harness B (different instance / session) resumes the task from the journal
    const bridgeB = new ContextBridge(journal);

    // Scope verification: Mismatched repo or revision fails closed
    assert.throws(
      () => bridgeB.handoff('public-task-live-acceptance', 'github.com/frankxai/wrong-repo', reviewedRevision),
      /No checkpoint for exact repository and revision/
    );
    assert.throws(
      () => bridgeB.handoff('public-task-live-acceptance', canonicalRepo, '0'.repeat(40)),
      /No checkpoint for exact repository and revision/
    );

    // Harness B resumes exact repository and revision
    const handoffPacket = bridgeB.handoff('public-task-live-acceptance', canonicalRepo, reviewedRevision);

    assert.equal(handoffPacket.taskId, 'public-task-live-acceptance');
    assert.equal(handoffPacket.repo, canonicalRepo);
    assert.equal(handoffPacket.revision, reviewedRevision);
    assert.equal(handoffPacket.checkpointId, 'cp-1');
    assert.equal(handoffPacket.authority, 'untrusted-data');
    assert.equal(handoffPacket.omitted, 2); // evt-1 and evt-2 were before cp-1
    assert.equal(handoffPacket.excluded, 0); // all were for this repo/revision
    assert.equal(handoffPacket.records.length, 2); // cp-1 and evt-3
    assert.equal(handoffPacket.records[0].id, 'cp-1');
    assert.equal(handoffPacket.records[1].id, 'evt-3');

    // 4. Harness B appends subsequent work and a final completion checkpoint
    appendFileSync(
      input,
      JSON.stringify(createEvent('evt-4', {
        harness: 'antigravity',
        sessionId: 'session-harness-b',
        kind: 'verification',
        text: 'Harness B executed test verification: 133 tests passed.'
      })) + '\n' +
      JSON.stringify(createEvent('cp-2', {
        harness: 'antigravity',
        sessionId: 'session-harness-b',
        kind: 'checkpoint',
        evidence: 'verified',
        text: 'Checkpoint 2: Complete task finished. Ready for independent review.'
      })) + '\n',
      'utf8'
    );

    const captureResult2 = await bridgeB.capture({
      sourceId: 'harness-a-stream',
      input,
      format: 'events'
    });
    assert.equal(captureResult2.captured, 2);

    // Resuming again starts from the latest checkpoint (cp-2)
    const secondHandoff = bridgeB.handoff('public-task-live-acceptance', canonicalRepo, reviewedRevision);
    assert.equal(secondHandoff.checkpointId, 'cp-2');
    assert.equal(secondHandoff.records.length, 1);
    assert.equal(secondHandoff.records[0].id, 'cp-2');
    assert.equal(secondHandoff.omitted, 5); // 5 records prior to cp-2
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('Live acceptance: Independent checker executes review with actual command evidence', async () => {
  const root = mkdtempSync(join(tmpdir(), 'sis-live-checker-'));
  const queuePath = join(root, 'reviews.jsonl');

  try {
    const queue = new ReviewQueue(queuePath, 2);
    const job: ReviewJob = {
      repo: canonicalRepo,
      head: reviewedRevision,
      policy: 'harness-production-v1',
      makerProvider: 'opencode',
      checkerProvider: 'gemini'
    };

    // Enqueue review job
    const queued = await queue.enqueue(job);
    assert.equal(queued.state, 'queued');

    // Runtime bridge binding the checker agent to an executing runtime
    // Here we run an actual verification command using node
    const bridge = new RuntimeBridge({
      runtimes: [{
        id: 'gemini-checker-runtime',
        async invoke(request) {
          // Execute actual command to gather real command evidence
          const proc = spawnSync(process.execPath, ['--version'], { encoding: 'utf8' });
          const executedCommand = `node --version => ${proc.stdout.trim()}`;

          const receipt = {
            revision: reviewedRevision,
            commands: [executedCommand],
            findings: ['No critical regressions detected in context continuity or review queue.'],
            limitations: [
              'Provider identity asserted by host binding; model-level attestation not cryptographically verified',
              'Local process execution verified; OS kernel-level sandboxing not active'
            ]
          };

          return {
            protocol: WORKER_PROTOCOL,
            taskId: request.taskId,
            status: 'completed',
            output: JSON.stringify({ verdict: 'passed', receipt })
          };
        }
      }],
      routes: { 'gemini-auditor': 'gemini-checker-runtime' },
      maxConcurrency: 1,
      maxRuns: 4,
      timeoutMs: 5000
    });

    // Mismatched binding provider fails
    const invalidBinding: ReviewBinding = { agent: 'gemini-auditor', provider: 'anthropic' };
    await assert.rejects(
      queue.run(queued.id, bridge, invalidBinding),
      /Host binding must match the assigned checker provider/
    );

    // Matched binding executes review and transitions to passed
    const validBinding: ReviewBinding = { agent: 'gemini-auditor', provider: 'gemini' };
    const passedState = await queue.run(queued.id, bridge, validBinding);

    assert.equal(passedState.state, 'passed');
    assert.equal(passedState.receipt?.revision, reviewedRevision);
    assert.ok(passedState.receipt?.commands.length > 0);
    assert.ok(passedState.receipt?.commands[0].includes('node --version'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('Live acceptance: Interruption leaves capacity reserved until host confirms reconciliation', async () => {
  const root = mkdtempSync(join(tmpdir(), 'sis-live-interrupt-'));
  const queuePath = join(root, 'reviews.jsonl');

  try {
    const queue = new ReviewQueue(queuePath, 2);
    const jobA: ReviewJob = {
      repo: canonicalRepo,
      head: reviewedRevision,
      policy: 'policy-interrupt-test',
      makerProvider: 'codex',
      checkerProvider: 'antigravity'
    };

    const queuedA = await queue.enqueue(jobA);

    // Abort controller simulates in-flight cancellation
    const controller = new AbortController();
    const bridge = new RuntimeBridge({
      runtimes: [{
        id: 'abortable-checker',
        async invoke(_request, signal) {
          return new Promise((_, reject) => {
            signal.addEventListener('abort', () => reject(new Error('Aborted by caller')));
          });
        }
      }],
      routes: { 'anti-auditor': 'abortable-checker' },
      maxConcurrency: 1,
      maxRuns: 4,
      timeoutMs: 2000
    });

    // Trigger abort right after dispatch
    setTimeout(() => controller.abort(), 10);

    const abortedState = await queue.run(
      queuedA.id,
      bridge,
      { agent: 'anti-auditor', provider: 'antigravity' },
      controller.signal
    );

    // Interrupted job is in 'unknown' state
    assert.equal(abortedState.state, 'unknown');

    // Attempting to run a second review job must fail because capacity is reserved
    const jobB: ReviewJob = {
      repo: canonicalRepo,
      head: 'b'.repeat(40),
      policy: 'policy-interrupt-test',
      makerProvider: 'codex',
      checkerProvider: 'antigravity'
    };
    const queuedB = await queue.enqueue(jobB);

    await assert.rejects(
      queue.transition(queuedB.id, 'running'),
      /Review capacity reserved by running or unresolved work/
    );

    // Host explicitly reconciles the stopped review with an external evidence reference
    const reconciled = await queue.reconcileStopped(queuedA.id, 'Supervisor verified process PID 9999 exited');
    assert.equal(reconciled.state, 'failed');
    assert.ok(reconciled.receipt?.limitations[0].includes('Supervisor verified process PID 9999 exited'));

    // Now capacity is released and job B can transition to running
    const runningB = await queue.transition(queuedB.id, 'running');
    assert.equal(runningB.state, 'running');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('Live acceptance: Jev Router policy evaluation, refusal behavior, and baseline comparison', () => {
  const verifiedNow = Date.parse('2026-10-10T14:00:00Z');
  const policy: JevRouterPolicy = {
    classification: 'public',
    region: 'global',
    costTier: 'medium',
    models: ['anthropic/claude-3.5-sonnet', 'google/gemini-2.5-pro'],
    pool: {
      models: ['anthropic/claude-3.5-sonnet', 'google/gemini-2.5-pro', 'openai/gpt-4o'],
      verifiedAt: new Date(verifiedNow).toISOString()
    },
    maxCompletionTokens: 1024
  };

  // 1. Opt-in public data request preparation
  const request = prepareJevRouterRequest('Public review summary request', policy, verifiedNow);
  assert.equal(request.body.model, 'typesafe/jev-router');
  assert.equal(request.body.stream, false);
  assert.equal(request.headers['X-OpenRouter-Metadata'], 'enabled');
  assert.deepEqual(request.approvedModels, policy.models);

  // 2. Refusal on unapproved classification (privacy gate)
  assert.throws(
    () => prepareJevRouterRequest('Private code', { ...policy, classification: 'private' as unknown as 'public' }, verifiedNow),
    /Invalid public Jev Router policy/
  );

  // 3. Refusal on stale pool snapshot (> 1 hour)
  assert.throws(
    () => prepareJevRouterRequest('Public code', {
      ...policy,
      pool: { ...policy.pool, verifiedAt: new Date(verifiedNow - 3600001).toISOString() }
    }, verifiedNow),
    /stale or invalid/
  );

  // 4. Response admission: valid route accepted
  const validResponse = {
    model: 'anthropic/claude-3.5-sonnet',
    choices: [{ finish_reason: 'stop', message: { content: 'Review analysis complete.' } }],
    openrouter_metadata: {
      pipeline: [{
        name: 'jev-router',
        data: {
          resolved_models: ['anthropic/claude-3.5-sonnet']
        }
      }]
    }
  };
  const receipt = inspectJevRouterResponse(validResponse, policy.models);
  assert.equal(receipt.accepted, true);
  assert.equal(receipt.servedModel, 'anthropic/claude-3.5-sonnet');
  assert.equal(receipt.authority, 'untrusted-provider-report');

  // 5. Response refusal: include list ignored (fallback triggered)
  const ignoredResponse = {
    model: 'meta-llama/llama-3.3-70b',
    choices: [{ finish_reason: 'stop', message: { content: 'Fallback output' } }],
    openrouter_metadata: {
      pipeline: [{
        name: 'jev-router',
        data: {
          resolved_models: ['meta-llama/llama-3.3-70b'],
          list_fallback: 'models_ignored'
        }
      }]
    }
  };
  const ignoredReceipt = inspectJevRouterResponse(ignoredResponse, policy.models);
  assert.equal(ignoredReceipt.accepted, false);
  assert.equal(ignoredReceipt.reason, 'include-ignored');

  // 6. Response refusal: unapproved model served
  const unapprovedResponse = {
    model: 'openai/gpt-4o', // in pool, but not in approved models
    choices: [{ finish_reason: 'stop', message: { content: 'GPT-4o output' } }],
    openrouter_metadata: {
      pipeline: [{
        name: 'jev-router',
        data: {
          resolved_models: ['openai/gpt-4o']
        }
      }]
    }
  };
  const unapprovedReceipt = inspectJevRouterResponse(unapprovedResponse, policy.models);
  assert.equal(unapprovedReceipt.accepted, false);
  assert.equal(unapprovedReceipt.reason, 'unapproved-model');

  // 7. Core invariant: Post-response check cannot undo transmission or billing
  // Even though inspectJevRouterResponse rejected unapprovedReceipt,
  // transmission occurred and OpenRouter billed the request.
  assert.equal(unapprovedReceipt.authority, 'untrusted-provider-report');
});
