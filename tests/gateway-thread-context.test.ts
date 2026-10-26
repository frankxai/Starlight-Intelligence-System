/**
 * tests/gateway-thread-context.test.ts — Unit tests for the SIS Memory Gateway
 * 9-Section ThreadContext Schema, Trajectory Distillation -> Vault Promotion Queue,
 * and Cross-Harness Memory Importer.
 *
 * SECURITY NOTE: per /openclaw-audit CRITICAL 2, no assertion interpolates
 * raw fixture content into error messages.
 *
 * ---
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 * - Substrate: starlightintelligence.org/protocol
 * - Layers used: [file-contract, sovereignty]
 * - Generated: 2026-10-26
 * ---
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  THREAD_CONTEXT_SECTIONS,
  createThreadContext,
  upsertThreadContextSection,
  serializeThreadContextMarkdown,
  parseThreadContextMarkdown,
  extractTrajectoryLearnings,
  buildVaultPromotionRecord,
  importHarnessMemoryPacket,
  type ThreadContextSection,
} from '../src/gateway/protocol.js';

describe('Gateway ThreadContext — 9-section creation, upsert, and Markdown round-trip', () => {
  it('defines all 9 canonical THREAD_CONTEXT_SECTIONS in deterministic order', () => {
    const expected: ThreadContextSection[] = [
      'numbers_and_values',
      'corrections',
      'constraints',
      'key_entities',
      'decisions',
      'notes',
      'plan_overview',
      'plan_tasks',
      'plan_context',
    ];
    assert.deepEqual([...THREAD_CONTEXT_SECTIONS], expected);
  });

  it('creates an empty 9-section document and upserts items with deduplication', () => {
    const doc = createThreadContext('sess-wave2-001', 'antigravity');
    assert.equal(doc.sessionId, 'sess-wave2-001');
    assert.equal(doc.harness, 'antigravity');

    for (const sec of THREAD_CONTEXT_SECTIONS) {
      assert.deepEqual(doc.sections[sec], []);
    }

    upsertThreadContextSection(doc, 'numbers_and_values', [
      'gateway_port: 7749',
      'half_life_days: 90',
      'gateway_port: 7749', // duplicate should be collapsed
    ]);
    assert.equal(doc.sections.numbers_and_values.length, 2);

    upsertThreadContextSection(doc, 'corrections', [
      'Run npx tsc --noEmit before committing gateway changes',
    ]);
    upsertThreadContextSection(doc, 'constraints', [
      'Fail closed on money operations; agents stage and humans execute',
    ]);
    upsertThreadContextSection(doc, 'key_entities', [
      'SisGatewayCore',
      'SessionStore',
    ]);
    upsertThreadContextSection(doc, 'decisions', [
      'Keep thread-context zero-dependency in operational gateway layer',
    ]);
    upsertThreadContextSection(doc, 'notes', [
      'Hyperagent 9-section working note pattern adapted for SIS Gateway',
    ]);
    upsertThreadContextSection(doc, 'plan_overview', [
      'Equip SIS Memory Gateway with ThreadContext working notes and trajectory distillation',
    ]);
    upsertThreadContextSection(doc, 'plan_tasks', [
      'Implement src/gateway/thread-context.ts',
      'Verify round-trip serialization',
    ]);
    upsertThreadContextSection(doc, 'plan_context', [
      'Worktree isolated on branch agent/antigravity/gateway-thread-context-20261026',
    ]);

    const markdown = serializeThreadContextMarkdown(doc);
    assert.ok(markdown.startsWith('# Thread Context\n'));

    const roundTrip = parseThreadContextMarkdown(markdown);
    assert.equal(roundTrip.sessionId, 'sess-wave2-001');
    assert.equal(roundTrip.harness, 'antigravity');

    for (const sec of THREAD_CONTEXT_SECTIONS) {
      assert.deepEqual(
        roundTrip.sections[sec],
        doc.sections[sec],
        `section ${sec} must survive Markdown round-trip`,
      );
    }
  });

  it('supports replace mode in upsertThreadContextSection', () => {
    const doc = createThreadContext('sess-replace', 'codex');
    upsertThreadContextSection(doc, 'notes', ['first note', 'second note']);
    assert.equal(doc.sections.notes.length, 2);

    upsertThreadContextSection(doc, 'notes', ['replaced note'], 'replace');
    assert.deepEqual(doc.sections.notes, ['replaced note']);
  });
});

describe('Gateway Trajectory Distillation — classification and [private] scrubbing', () => {
  it('classifies actionable rules across semantic vaults and scrubs [private] before promotion', () => {
    const doc = createThreadContext('sess-distill-01', 'claude-code');

    upsertThreadContextSection(doc, 'corrections', [
      'Always run CI lint and tsc typecheck gates before pushing',
      'Keep public labels in sentence case and follow brand editorial voice',
      '[private] Never expose local operator vault path in public logs',
    ]);

    upsertThreadContextSection(doc, 'constraints', [
      'Fail closed on money: no autonomous spend, pricing changes, or refunds',
      'Maintain strict worktree and branch lane hygiene across parallel harnesses',
      '[private-shareable] First-principles philosophy compounds universal wisdom across sessions',
      '[privacy:second-brain] Personal reflection note stays local only',
    ]);

    const learnings = extractTrajectoryLearnings(doc);
    assert.equal(learnings.length, 7);

    // Check vault classification for each domain
    const ciLearning = learnings.find((l) => l.rule.includes('tsc typecheck'));
    assert.ok(ciLearning);
    assert.equal(ciLearning.vault, 'technical');
    assert.equal(ciLearning.isPrivate, false);

    const voiceLearning = learnings.find((l) => l.rule.includes('sentence case'));
    assert.ok(voiceLearning);
    assert.equal(voiceLearning.vault, 'creative');

    const moneyLearning = learnings.find((l) => l.rule.includes('Fail closed on money'));
    assert.ok(moneyLearning);
    assert.equal(moneyLearning.vault, 'strategic');

    const laneLearning = learnings.find((l) => l.rule.includes('lane hygiene'));
    assert.ok(laneLearning);
    assert.equal(laneLearning.vault, 'operational');

    const wisdomLearning = learnings.find((l) => l.rule.includes('First-principles philosophy'));
    assert.ok(wisdomLearning);
    assert.equal(wisdomLearning.vault, 'wisdom');
    assert.equal(wisdomLearning.isPrivate, false);
    assert.ok(wisdomLearning.tags.includes('private-shareable'));

    // Verify [private] and [privacy:second-brain] items are flagged and scrubbed of raw brackets
    const privateLearning = learnings.find((l) => l.rule.includes('local operator vault path'));
    assert.ok(privateLearning);
    assert.equal(privateLearning.isPrivate, true);
    assert.ok(!privateLearning.rule.includes('[private]'));

    const secondBrainLearning = learnings.find((l) => l.rule.includes('Personal reflection'));
    assert.ok(secondBrainLearning);
    assert.equal(secondBrainLearning.isPrivate, true);

    // Build promotion records: [private] and [privacy:second-brain] MUST return null
    const promoted = learnings
      .map((l) => buildVaultPromotionRecord(l, 'sentinel-reviewer'))
      .filter((r) => r !== null);

    assert.equal(promoted.length, 5, 'exactly 2 private learnings must be dropped');

    for (const rec of promoted) {
      assert.equal(rec.op, 'vault.promote');
      assert.equal(rec.queue, 'PROMOTION_QUEUE');
      assert.equal(rec.reviewerId, 'sentinel-reviewer');
      assert.ok(!rec.tags.includes('private'));
      assert.ok(!rec.content.toLowerCase().includes('[private]'));

      const parsedJsonl = JSON.parse(rec.jsonl) as { id: string; op: string; queue: string };
      assert.equal(parsedJsonl.id, rec.id);
      assert.equal(parsedJsonl.op, 'vault.promote');
      assert.equal(parsedJsonl.queue, 'PROMOTION_QUEUE');
    }

    const shareablePromo = promoted.find((p) => p.vault === 'wisdom');
    assert.ok(shareablePromo);
    assert.equal(shareablePromo.privacy, 'private-shareable');
  });
});

describe('Gateway Cross-Harness Memory Importer — OpenClaw, Claude Code, Hyperagent, Cursor', () => {
  it('imports OpenClaw SOUL.md into ThreadContextDocument and filters private promotions', () => {
    const openClawSoul = `
# SOUL.md — Sovereign OpenClaw Agent

## Identity & Voice
- Direct, technical, warm, and builder-focused
- Voice rule: reject generated prestige language and keep public labels in sentence case

## Boundaries & Guardrails
- Fail closed on money: never execute spend, wallet actions, or pricing changes autonomously
- Always run tsc --noEmit and test suites before committing to an agent branch
- [private] Operator local token path is restricted to internal daemon only

## Heartbeat
- [ ] Verify gateway health endpoint
- [x] Sync operational vault checkpoints
`;

    const result = importHarnessMemoryPacket({
      harness: 'openclaw',
      markdown: openClawSoul,
      sourceFile: 'SOUL.md',
      sessionId: 'openclaw-sess-1',
      reviewerId: 'openclaw-auditor',
    });

    assert.equal(result.harness, 'openclaw');
    assert.equal(result.sourceFileKind, 'SOUL.md');
    assert.equal(result.document.sessionId, 'openclaw-sess-1');
    assert.ok(result.document.sections.constraints.length >= 2);
    assert.equal(result.document.sections.plan_tasks.length, 2);
    assert.equal(result.droppedPrivateCount, 1);
    assert.ok(result.promotionCandidates.length >= 2);
  });

  it('imports Claude Code CLAUDE.md into ThreadContextDocument and extracts vault learnings', () => {
    const claudeMd = `
# CLAUDE.md

## The Five Guardrails
- Never push directly to main; work on agent/<harness>/<scope> and open a draft PR
- Run the repo's own CI gates and tsc build checks before pushing

## Corrections
- Fix: avoid recursive search from root directories to prevent Phone Link traversal

## Decisions
- Decision: use SQLite FTS5 hybrid index with RRF merge for semantic vaults

## Estate Map
- Starlight-Intelligence-System
- starlight-agent-config
`;

    const result = importHarnessMemoryPacket('claude-code', claudeMd, {
      sessionId: 'claude-sess-2',
      reviewerId: 'prime-verifier',
    });

    assert.equal(result.harness, 'claude-code');
    assert.equal(result.sourceFileKind, 'CLAUDE.md');
    assert.equal(result.document.sections.constraints.length, 2);
    assert.equal(result.document.sections.corrections.length, 1);
    assert.equal(result.document.sections.decisions.length, 1);
    assert.equal(result.document.sections.key_entities.length, 2);
    assert.equal(result.droppedPrivateCount, 0);
    assert.equal(result.promotionCandidates.length, 3);
  });

  it('imports Hyperagent Thread Context and Cursor .cursorrules packets cleanly', () => {
    const hyperagentDoc = createThreadContext('hyper-sess-9', 'hyperagent');
    upsertThreadContextSection(hyperagentDoc, 'numbers_and_values', ['max_iterations: 5']);
    upsertThreadContextSection(hyperagentDoc, 'constraints', [
      'Always verify schema conformance with tsc before promotion',
    ]);
    upsertThreadContextSection(hyperagentDoc, 'plan_overview', [
      'Ship cross-harness memory bridge',
    ]);

    const hyperMarkdown = serializeThreadContextMarkdown(hyperagentDoc);
    const hyperResult = importHarnessMemoryPacket('hyperagent', hyperMarkdown, {
      sessionId: 'hyper-sess-9',
    });

    assert.equal(hyperResult.harness, 'hyperagent');
    assert.equal(hyperResult.sourceFileKind, 'Thread Context');
    assert.deepEqual(
      hyperResult.document.sections.numbers_and_values,
      ['max_iterations: 5'],
    );
    assert.equal(hyperResult.promotionCandidates.length, 1);
    assert.equal(hyperResult.promotionCandidates[0]?.vault, 'technical');

    const cursorRules = `
Always use strict TypeScript types and run tsc --noEmit before finishing.
Never commit .env or secret credentials to git.
`;
    const cursorResult = importHarnessMemoryPacket('cursor', cursorRules, {
      sourceFile: '.cursorrules',
      sessionId: 'cursor-sess-1',
    });
    assert.equal(cursorResult.harness, 'cursor');
    assert.equal(cursorResult.sourceFileKind, '.cursorrules');
    assert.equal(cursorResult.promotionCandidates.length, 2);
  });
});
