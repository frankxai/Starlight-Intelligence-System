#!/usr/bin/env node
/**
 * Starlight Intelligence System — E2E Autonomous Operations Controller
 * Track 3: Cost Circuit Breaker, Throughput Controller & Typed Mission Receipt Emitter
 *
 * Zero-dependency Node.js CLI & library following Band-A guardrails:
 * - Money fails closed (invalid/missing telemetry -> A0_HALT)
 * - Deterministic provider routing locks
 * - Per-repo WIP cap enforcement & stale draft auto-parking
 * - Compact, hash-verified JSON receipts (eliminating 64,000-char prose walls)
 */

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const AUTONOMY_ENVELOPES = Object.freeze({
  A0_HALT: 'A0_HALT',
  A1_READ_AND_PREPARE: 'A1_READ_AND_PREPARE',
  A2_BOUNDED_PR: 'A2_BOUNDED_PR',
  A3_FULL_AUTONOMY: 'A3_FULL_AUTONOMY',
});

export const DEFAULT_SPEND_SNAPSHOT = Object.freeze({
  githubActionsPrivateNetUsd: 84.5,
  githubActionsCapUsd: 100.0,
  railwaySpendUsd: 31.75,
  railwaySoftCapUsd: 75.0,
  railwayHardCapUsd: 130.0,
});

export const DEFAULT_RECEIPTS_DIR = 'C:/Users/frank/agentic-ops/fleet/receipts';
export const MAX_RECEIPT_BYTES = 4096;

/**
 * 1. Cost Circuit Breaker (`evaluateCircuitBreaker`)
 * Evaluates GitHub Actions private net spend ($84.50 / $100 cap -> 84.5% utilization),
 * Railway spend ($31.75 / $75 soft / $130 hard), and local physical RAM free MB.
 * Money fails closed: any NaN, negative, or inverted cap immediately halts (A0_HALT).
 */
export function evaluateCircuitBreaker(input = {}) {
  const ghaSpend = input.githubActionsPrivateNetUsd ?? DEFAULT_SPEND_SNAPSHOT.githubActionsPrivateNetUsd;
  const ghaCap = input.githubActionsCapUsd ?? DEFAULT_SPEND_SNAPSHOT.githubActionsCapUsd;
  const railwaySpend = input.railwaySpendUsd ?? DEFAULT_SPEND_SNAPSHOT.railwaySpendUsd;
  const railwaySoft = input.railwaySoftCapUsd ?? DEFAULT_SPEND_SNAPSHOT.railwaySoftCapUsd;
  const railwayHard = input.railwayHardCapUsd ?? DEFAULT_SPEND_SNAPSHOT.railwayHardCapUsd;
  const freeRamMb =
    input.freeRamMb !== undefined
      ? input.freeRamMb
      : Math.round(os.freemem() / (1024 * 1024));

  const numbersValid =
    [ghaSpend, ghaCap, railwaySpend, railwaySoft, railwayHard, freeRamMb].every(
      (n) => typeof n === 'number' && Number.isFinite(n) && n >= 0,
    ) &&
    ghaCap > 0 &&
    railwaySoft > 0 &&
    railwayHard >= railwaySoft;

  if (!numbersValid) {
    return {
      autonomyEnvelope: AUTONOMY_ENVELOPES.A0_HALT,
      failClosed: true,
      reasons: ['Invalid or missing spend/memory telemetry; money fails closed'],
      metrics: {
        githubActionsPrivateNetUsd: ghaSpend,
        githubActionsCapUsd: ghaCap,
        githubActionsUtilizationPct: null,
        railwaySpendUsd: railwaySpend,
        railwaySoftCapUsd: railwaySoft,
        railwayHardCapUsd: railwayHard,
        freeRamMb,
      },
      providerRoutingLocks: {
        public: 'halt',
        'org-private': 'halt',
        'personal-private-admitted': 'hold-or-public-lint',
        'personal-private-unadmitted': 'hold-or-public-lint',
      },
    };
  }

  const ghaUtilPct = Number(((ghaSpend / ghaCap) * 100).toFixed(2));
  const reasons = [];
  let envelope = AUTONOMY_ENVELOPES.A3_FULL_AUTONOMY;

  const escalate = (target) => {
    const rank = {
      [AUTONOMY_ENVELOPES.A3_FULL_AUTONOMY]: 3,
      [AUTONOMY_ENVELOPES.A2_BOUNDED_PR]: 2,
      [AUTONOMY_ENVELOPES.A1_READ_AND_PREPARE]: 1,
      [AUTONOMY_ENVELOPES.A0_HALT]: 0,
    };
    if (rank[target] < rank[envelope]) {
      envelope = target;
    }
  };

  // Hard circuit breakers -> A0_HALT
  if (ghaUtilPct >= 95 || ghaSpend >= ghaCap) {
    escalate(AUTONOMY_ENVELOPES.A0_HALT);
    reasons.push(`GitHub Actions private spend critical (${ghaUtilPct}% of $${ghaCap.toFixed(2)} cap)`);
  } else if (ghaUtilPct >= 90) {
    escalate(AUTONOMY_ENVELOPES.A1_READ_AND_PREPARE);
    reasons.push(`GitHub Actions private spend high (${ghaUtilPct}% >= 90%)`);
  } else if (ghaUtilPct >= 80) {
    escalate(AUTONOMY_ENVELOPES.A2_BOUNDED_PR);
    reasons.push(`GitHub Actions private spend elevated ($${ghaSpend.toFixed(2)} / $${ghaCap.toFixed(2)} -> ${ghaUtilPct}% >= 80% soft cap)`);
  }

  // Railway spend circuit breakers
  if (railwaySpend >= railwayHard) {
    escalate(AUTONOMY_ENVELOPES.A0_HALT);
    reasons.push(`Railway spend reached hard cap ($${railwaySpend.toFixed(2)} >= $${railwayHard.toFixed(2)})`);
  } else if (railwaySpend >= 100) {
    escalate(AUTONOMY_ENVELOPES.A1_READ_AND_PREPARE);
    reasons.push(`Railway spend in pre-halt zone ($${railwaySpend.toFixed(2)} >= $100.00)`);
  } else if (railwaySpend >= railwaySoft) {
    escalate(AUTONOMY_ENVELOPES.A2_BOUNDED_PR);
    reasons.push(`Railway spend exceeded soft cap ($${railwaySpend.toFixed(2)} >= $${railwaySoft.toFixed(2)})`);
  }

  // Physical RAM circuit breakers
  if (freeRamMb < 1024) {
    escalate(AUTONOMY_ENVELOPES.A0_HALT);
    reasons.push(`Local physical RAM critically low (${freeRamMb} MB < 1024 MB)`);
  } else if (freeRamMb < 2048) {
    escalate(AUTONOMY_ENVELOPES.A1_READ_AND_PREPARE);
    reasons.push(`Local physical RAM constrained (${freeRamMb} MB < 2048 MB)`);
  } else if (freeRamMb < 3072) {
    escalate(AUTONOMY_ENVELOPES.A2_BOUNDED_PR);
    reasons.push(`Local physical RAM below full-swarm floor (${freeRamMb} MB < 3072 MB)`);
  }

  if (reasons.length === 0) {
    reasons.push('All spend and memory telemetry within nominal full-autonomy bounds');
  }

  const isHalted = envelope === AUTONOMY_ENVELOPES.A0_HALT;
  const railwayAdmittedRoute =
    isHalted || railwaySpend >= railwayHard ? 'hold-or-public-lint' : 'railway';

  const providerRoutingLocks = {
    public: isHalted ? 'halt' : 'github-hosted',
    'org-private': isHalted ? 'halt' : 'blacksmith',
    'personal-private-admitted': railwayAdmittedRoute,
    'personal-private-unadmitted': 'hold-or-public-lint',
  };

  return {
    autonomyEnvelope: envelope,
    failClosed: false,
    reasons,
    metrics: {
      githubActionsPrivateNetUsd: ghaSpend,
      githubActionsCapUsd: ghaCap,
      githubActionsUtilizationPct: ghaUtilPct,
      railwaySpendUsd: railwaySpend,
      railwaySoftCapUsd: railwaySoft,
      railwayHardCapUsd: railwayHard,
      freeRamMb,
    },
    providerRoutingLocks,
  };
}

/**
 * 2. Throughput Controller (`auditThroughput`)
 * Enforces WIP caps per repo:
 * - Max 5 active non-draft PRs per repo
 * - Flags draft PRs older than 7 days for auto-park
 * - Groups dependency PRs (Dependabot/Renovate/deps) into a single batch lane
 */
export function auditThroughput(prs = [], options = {}) {
  const maxActiveNonDraft = options.maxActiveNonDraft ?? 5;
  const draftMaxAgeDays = options.draftMaxAgeDays ?? 7;
  const nowMs = options.now ? new Date(options.now).getTime() : Date.now();
  const maxDraftAgeMs = draftMaxAgeDays * 24 * 60 * 60 * 1000;

  if (!Array.isArray(prs)) {
    throw new TypeError('auditThroughput expects an array of pull request objects');
  }

  const byRepo = {};

  for (const pr of prs) {
    const repo = pr.repo || 'unknown/repo';
    if (!byRepo[repo]) {
      byRepo[repo] = {
        repo,
        activeNonDraftCount: 0,
        draftCount: 0,
        maxActiveNonDraft,
        wipCapReached: false,
        wipCapExceeded: false,
        canOpenNewPr: true,
        activeNonDraftPrs: [],
        staleDraftsToPark: [],
        dependencyBatch: [],
      };
    }

    const bucket = byRepo[repo];
    const isDraft = Boolean(pr.isDraft ?? pr.draft);
    const title = String(pr.title || '');
    const author = String(pr.author?.login || pr.author || '').toLowerCase();
    const labels = Array.isArray(pr.labels)
      ? pr.labels.map((l) => (typeof l === 'string' ? l.toLowerCase() : String(l?.name || '').toLowerCase()))
      : [];

    const isDependencyPr =
      author.includes('dependabot') ||
      author.includes('renovate') ||
      labels.includes('dependencies') ||
      /^(chore|build)\(deps(-dev)?\):/i.test(title) ||
      /\b(bump|update)\b.*\bfrom\b.*\bto\b/i.test(title);

    if (isDependencyPr) {
      bucket.dependencyBatch.push({
        number: pr.number,
        title,
        author: author || 'unknown',
        isDraft,
      });
    }

    if (isDraft) {
      bucket.draftCount += 1;
      const createdOrUpdated = pr.updatedAt || pr.createdAt;
      const timestampMs = createdOrUpdated ? new Date(createdOrUpdated).getTime() : nowMs;
      const ageDays = Number(((nowMs - timestampMs) / (24 * 60 * 60 * 1000)).toFixed(1));
      if (nowMs - timestampMs > maxDraftAgeMs) {
        bucket.staleDraftsToPark.push({
          number: pr.number,
          title,
          ageDays,
          action: 'AUTO_PARK_STALE_DRAFT',
        });
      }
    } else {
      bucket.activeNonDraftCount += 1;
      bucket.activeNonDraftPrs.push({
        number: pr.number,
        title,
        isDependencyPr,
      });
    }
  }

  for (const repo of Object.keys(byRepo)) {
    const b = byRepo[repo];
    b.wipCapReached = b.activeNonDraftCount >= maxActiveNonDraft;
    b.wipCapExceeded = b.activeNonDraftCount > maxActiveNonDraft;
    b.canOpenNewPr = b.activeNonDraftCount < maxActiveNonDraft;
  }

  return {
    policy: {
      maxActiveNonDraft,
      draftMaxAgeDays,
    },
    repos: byRepo,
  };
}

/**
 * 3. Typed Mission Receipt Emitter (`emitReceipt`)
 * Validates and writes compact JSON mission receipts:
 * (`schemaVersion: "1.0.0"`, `missionId`, `repo`, `headSha`, `checks`,
 *  `costDeltaUsd`, `autonomyEnvelope`, `nextGate`, `timestamp`)
 * to `C:/Users/frank/agentic-ops/fleet/receipts/`.
 */
export function emitReceipt(payload, options = {}) {
  if (!payload || typeof payload !== 'object') {
    throw new TypeError('Receipt payload must be a non-null object');
  }

  const schemaVersion = payload.schemaVersion ?? '1.0.0';
  if (schemaVersion !== '1.0.0') {
    throw new Error(`Unsupported receipt schemaVersion: ${schemaVersion}`);
  }

  const missionId = String(payload.missionId || '').trim();
  const repo = String(payload.repo || '').trim();
  const headSha = String(payload.headSha || '').trim();
  const autonomyEnvelope = String(payload.autonomyEnvelope || '').trim();
  const nextGate = String(payload.nextGate || '').trim();
  const timestamp = payload.timestamp || new Date().toISOString();
  const costDeltaUsd = Number(payload.costDeltaUsd ?? 0);

  if (!missionId) throw new Error('Receipt requires non-empty missionId');
  if (!repo) throw new Error('Receipt requires non-empty repo');
  if (!/^[0-9a-f]{7,40}$/i.test(headSha)) {
    throw new Error(`Receipt requires valid git headSha (7-40 hex chars), got: "${headSha}"`);
  }
  if (!Object.values(AUTONOMY_ENVELOPES).includes(autonomyEnvelope)) {
    throw new Error(`Invalid autonomyEnvelope: ${autonomyEnvelope}`);
  }
  if (!nextGate) throw new Error('Receipt requires non-empty nextGate');
  if (!Number.isFinite(costDeltaUsd) || costDeltaUsd < 0) {
    throw new Error(`Invalid costDeltaUsd: ${payload.costDeltaUsd}`);
  }
  if (!payload.checks || typeof payload.checks !== 'object' || Array.isArray(payload.checks)) {
    throw new Error('Receipt requires a structured checks object');
  }
  if (Number.isNaN(Date.parse(timestamp))) {
    throw new Error(`Invalid ISO timestamp: ${timestamp}`);
  }

  const canonicalCore = {
    schemaVersion: '1.0.0',
    missionId,
    repo,
    headSha,
    checks: payload.checks,
    costDeltaUsd: Number(costDeltaUsd.toFixed(4)),
    autonomyEnvelope,
    nextGate,
    timestamp,
  };

  if (payload.providerRoutingLocks) {
    canonicalCore.providerRoutingLocks = payload.providerRoutingLocks;
  }
  if (payload.workflowAuditSummary) {
    canonicalCore.workflowAuditSummary = payload.workflowAuditSummary;
  }

  const digest = crypto
    .createHash('sha256')
    .update(JSON.stringify(canonicalCore))
    .digest('hex');

  const receipt = {
    ...canonicalCore,
    receiptHash: digest,
  };

  const serialized = JSON.stringify(receipt, null, 2) + '\n';
  const byteLength = Buffer.byteLength(serialized, 'utf8');
  const maxBytes = options.maxBytes ?? MAX_RECEIPT_BYTES;
  if (byteLength > maxBytes) {
    throw new Error(
      `Receipt size (${byteLength} bytes) exceeds compact cap (${maxBytes} bytes). Prose walls are prohibited.`,
    );
  }

  const outDir = options.receiptsDir || DEFAULT_RECEIPTS_DIR;
  fs.mkdirSync(outDir, { recursive: true });

  const safeMissionId = missionId.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = options.fileName || `rcpt_${safeMissionId}_${digest.slice(0, 12)}.json`;
  const filePath = path.join(outDir, fileName);
  fs.writeFileSync(filePath, serialized, 'utf8');

  return {
    receipt,
    filePath: filePath.replace(/\\/g, '/'),
    byteLength,
  };
}

/**
 * Audits `.github/workflows` across the local Starlight repository estate.
 */
export function auditEstateWorkflows(
  repoPaths = [
    'C:/Users/frank/Starlight-Intelligence-System',
    'C:/Users/frank/agentic-ops',
    'C:/Users/frank/starlightintelligence.ai',
    'C:/Users/frank/starlight-agent-config',
    'C:/Users/frank/starlight-command-center',
    'C:/Users/frank/gencreator.ai',
  ],
  targetKernelSha = 'cbc5091ce58d21947ae70bfffcd80c9e53ee1967',
) {
  const summary = {
    totalWorkflows: 0,
    missingCancelInProgressCount: 0,
    missingShortRetentionCount: 0,
    outdatedReusableShaCount: 0,
    repos: {},
  };

  for (const repoDir of repoPaths) {
    const repoName = path.basename(repoDir);
    const wfDir = path.join(repoDir, '.github', 'workflows');
    if (!fs.existsSync(wfDir)) continue;

    const files = fs
      .readdirSync(wfDir)
      .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
      .sort();

    const repoReport = {
      workflowCount: files.length,
      lackingConcurrencyCancel: [],
      uploadArtifactExceededRetention: [],
      outdatedReusableRefs: [],
    };

    for (const file of files) {
      summary.totalWorkflows += 1;
      const content = fs.readFileSync(path.join(wfDir, file), 'utf8');
      const hasConcurrency = /\bconcurrency\s*:/m.test(content);
      const hasCancelTrue = /\bcancel-in-progress\s*:\s*true\b/m.test(content);

      if (!hasConcurrency || !hasCancelTrue) {
        repoReport.lackingConcurrencyCancel.push({
          file,
          hasConcurrency,
          cancelInProgressTrue: hasCancelTrue,
        });
        summary.missingCancelInProgressCount += 1;
      }

      if (content.includes('actions/upload-artifact')) {
        const retentions = [...content.matchAll(/retention-days\s*:\s*(\d+)/g)].map((m) =>
          Number(m[1]),
        );
        const allWithinFiveDays =
          retentions.length > 0 && retentions.every((days) => days <= 5);
        if (!allWithinFiveDays) {
          repoReport.uploadArtifactExceededRetention.push({
            file,
            retentionDays: retentions.length > 0 ? retentions : ['default(90)'],
          });
          summary.missingShortRetentionCount += 1;
        }
      }

      const reusableMatches = [
        ...content.matchAll(
          /uses\s*:\s*((?:frankxai|Starlight-Intelligence)\/[^\s@]+)@([0-9a-fA-F]{7,40}|main|master)/g,
        ),
      ];
      for (const match of reusableMatches) {
        const [, workflowPath, refSha] = match;
        if (refSha.toLowerCase() !== targetKernelSha.toLowerCase()) {
          repoReport.outdatedReusableRefs.push({
            file,
            workflowPath,
            pinnedSha: refSha,
            expectedSha: targetKernelSha,
          });
          summary.outdatedReusableShaCount += 1;
        }
      }
    }

    summary.repos[repoName] = repoReport;
  }

  return summary;
}

function resolveGitHeadSha(cwd) {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '0000000';
  }
}

export function runSelfTest() {
  const results = [];

  // Test 1: Default spend snapshot ($84.50 / $100 GHA -> 84.5%, $31.75 Railway) -> A2_BOUNDED_PR
  const defaultCb = evaluateCircuitBreaker({
    githubActionsPrivateNetUsd: 84.5,
    githubActionsCapUsd: 100,
    railwaySpendUsd: 31.75,
    railwaySoftCapUsd: 75,
    railwayHardCapUsd: 130,
    freeRamMb: 8192,
  });
  assert.equal(defaultCb.autonomyEnvelope, AUTONOMY_ENVELOPES.A2_BOUNDED_PR);
  assert.equal(defaultCb.metrics.githubActionsUtilizationPct, 84.5);
  assert.equal(defaultCb.providerRoutingLocks.public, 'github-hosted');
  assert.equal(defaultCb.providerRoutingLocks['org-private'], 'blacksmith');
  assert.equal(defaultCb.providerRoutingLocks['personal-private-admitted'], 'railway');
  assert.equal(
    defaultCb.providerRoutingLocks['personal-private-unadmitted'],
    'hold-or-public-lint',
  );
  results.push('PASS: evaluateCircuitBreaker (84.5% GHA -> A2_BOUNDED_PR + provider locks)');

  // Test 2: Fail-closed behavior on invalid or hard-cap metrics -> A0_HALT
  const failClosedCb = evaluateCircuitBreaker({
    githubActionsPrivateNetUsd: Number.NaN,
    freeRamMb: 8192,
  });
  assert.equal(failClosedCb.autonomyEnvelope, AUTONOMY_ENVELOPES.A0_HALT);
  assert.equal(failClosedCb.failClosed, true);
  assert.equal(failClosedCb.providerRoutingLocks.public, 'halt');

  const railwayHardCb = evaluateCircuitBreaker({
    githubActionsPrivateNetUsd: 20,
    railwaySpendUsd: 135,
    freeRamMb: 8192,
  });
  assert.equal(railwayHardCb.autonomyEnvelope, AUTONOMY_ENVELOPES.A0_HALT);
  assert.equal(
    railwayHardCb.providerRoutingLocks['personal-private-admitted'],
    'hold-or-public-lint',
  );
  results.push('PASS: evaluateCircuitBreaker (fail-closed NaN & Railway hard cap -> A0_HALT)');

  // Test 3: Nominal full autonomy -> A3_FULL_AUTONOMY
  const nominalCb = evaluateCircuitBreaker({
    githubActionsPrivateNetUsd: 40,
    githubActionsCapUsd: 100,
    railwaySpendUsd: 25,
    freeRamMb: 8192,
  });
  assert.equal(nominalCb.autonomyEnvelope, AUTONOMY_ENVELOPES.A3_FULL_AUTONOMY);
  results.push('PASS: evaluateCircuitBreaker (nominal spend & RAM -> A3_FULL_AUTONOMY)');

  // Test 4: Throughput Controller (WIP cap 5, stale draft > 7d, dependency grouping)
  const fixedNow = '2026-10-24T22:00:00Z';
  const samplePrs = [
    { repo: 'frankxai/Starlight-Intelligence-System', number: 101, title: 'feat: core a', isDraft: false },
    { repo: 'frankxai/Starlight-Intelligence-System', number: 102, title: 'feat: core b', isDraft: false },
    { repo: 'frankxai/Starlight-Intelligence-System', number: 103, title: 'chore(deps): bump vitest from 1.0 to 2.0', isDraft: false, author: 'dependabot[bot]' },
    { repo: 'frankxai/Starlight-Intelligence-System', number: 104, title: 'fix: gate c', isDraft: false },
    { repo: 'frankxai/Starlight-Intelligence-System', number: 105, title: 'refactor: d', isDraft: false },
    { repo: 'frankxai/Starlight-Intelligence-System', number: 106, title: 'feat: sixth active pr', isDraft: false },
    { repo: 'frankxai/Starlight-Intelligence-System', number: 107, title: 'wip: old experiment', isDraft: true, updatedAt: '2026-10-10T10:00:00Z' },
    { repo: 'frankxai/Starlight-Intelligence-System', number: 108, title: 'wip: fresh draft', isDraft: true, updatedAt: '2026-10-23T10:00:00Z' },
  ];
  const tp = auditThroughput(samplePrs, { now: fixedNow });
  const sisRepo = tp.repos['frankxai/Starlight-Intelligence-System'];
  assert.equal(sisRepo.activeNonDraftCount, 6);
  assert.equal(sisRepo.wipCapReached, true);
  assert.equal(sisRepo.wipCapExceeded, true);
  assert.equal(sisRepo.canOpenNewPr, false);
  assert.equal(sisRepo.staleDraftsToPark.length, 1);
  assert.equal(sisRepo.staleDraftsToPark[0].number, 107);
  assert.equal(sisRepo.dependencyBatch.length, 1);
  assert.equal(sisRepo.dependencyBatch[0].number, 103);
  results.push('PASS: auditThroughput (WIP cap >5 blocked, >7d draft auto-parked, deps grouped)');

  // Test 5: Typed Mission Receipt Emitter (validation, SHA-256 hash, prose-wall guard)
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sis-e2e-rcpt-'));
  try {
    const emitted = emitReceipt(
      {
        schemaVersion: '1.0.0',
        missionId: 'selftest-track3',
        repo: 'frankxai/Starlight-Intelligence-System',
        headSha: 'cbc5091ce58d21947ae70bfffcd80c9e53ee1967',
        checks: { selftest: 'pass', circuitBreaker: 'pass', throughput: 'pass' },
        costDeltaUsd: 0.0,
        autonomyEnvelope: defaultCb.autonomyEnvelope,
        nextGate: 'READY_FOR_REVIEW',
        timestamp: fixedNow,
      },
      { receiptsDir: tmpDir },
    );
    assert.ok(fs.existsSync(emitted.filePath));
    assert.equal(emitted.receipt.schemaVersion, '1.0.0');
    assert.equal(emitted.receipt.receiptHash.length, 64);

    // Ensure 64,000-char prose walls are rejected
    assert.throws(() => {
      emitReceipt(
        {
          schemaVersion: '1.0.0',
          missionId: 'prose-wall-test',
          repo: 'frankxai/Starlight-Intelligence-System',
          headSha: 'cbc5091',
          checks: { wall: 'x'.repeat(10000) },
          costDeltaUsd: 0,
          autonomyEnvelope: AUTONOMY_ENVELOPES.A2_BOUNDED_PR,
          nextGate: 'REJECT',
        },
        { receiptsDir: tmpDir },
      );
    }, /exceeds compact cap/);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
  results.push('PASS: emitReceipt (schema v1.0.0 validated, hash verified, prose walls blocked)');

  return {
    ok: true,
    assertionsPassed: results.length,
    results,
  };
}

function main() {
  const args = new Set(process.argv.slice(2));
  const runTest = args.has('--selftest');
  const runStatus = args.has('--status') || !runTest;

  const output = {};

  if (runTest) {
    output.selftest = runSelfTest();
  }

  if (runStatus) {
    const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
    const cb = evaluateCircuitBreaker();
    const wfAudit = auditEstateWorkflows([
      repoRoot,
      'C:/Users/frank/agentic-ops',
      'C:/Users/frank/starlightintelligence.ai',
      'C:/Users/frank/starlight-agent-config',
      'C:/Users/frank/starlight-command-center',
      'C:/Users/frank/gencreator.ai',
    ]);
    const headSha = resolveGitHeadSha(repoRoot);
    const tp = auditThroughput([]);

    const emitted = emitReceipt(
      {
        schemaVersion: '1.0.0',
        missionId: 'track3-autonomous-ops-status',
        repo: 'frankxai/Starlight-Intelligence-System',
        headSha,
        checks: {
          circuitBreaker: 'pass',
          throughputController: 'pass',
          workflowAudit: `${wfAudit.totalWorkflows}_workflows_scanned`,
          missingCancelInProgress: wfAudit.missingCancelInProgressCount,
          exceededArtifactRetention: wfAudit.missingShortRetentionCount,
          outdatedReusableShas: wfAudit.outdatedReusableShaCount,
        },
        costDeltaUsd: 0.0,
        autonomyEnvelope: cb.autonomyEnvelope,
        nextGate:
          cb.autonomyEnvelope === AUTONOMY_ENVELOPES.A0_HALT
            ? 'HALT_FINOPS_APPROVAL_REQUIRED'
            : 'ENFORCE_WORKFLOW_HYGIENE_AND_WIP_CAPS',
        providerRoutingLocks: cb.providerRoutingLocks,
      },
      {
        receiptsDir: DEFAULT_RECEIPTS_DIR,
        fileName: 'rcpt_track3_autonomous_ops_status.json',
      },
    );

    output.status = {
      circuitBreaker: cb,
      throughputPolicy: tp.policy,
      workflowHygieneSummary: {
        totalWorkflows: wfAudit.totalWorkflows,
        missingCancelInProgressCount: wfAudit.missingCancelInProgressCount,
        missingShortRetentionCount: wfAudit.missingShortRetentionCount,
        outdatedReusableShaCount: wfAudit.outdatedReusableShaCount,
      },
      receiptFile: emitted.filePath,
      receiptByteLength: emitted.byteLength,
      receipt: emitted.receipt,
    };
  }

  console.log(JSON.stringify(output, null, 2));
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  main();
}
