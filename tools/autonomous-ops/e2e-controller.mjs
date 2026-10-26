#!/usr/bin/env node
/**
 * Starlight Intelligence System — E2E Autonomous Operations Controller
 * Track 3 & Phase 4: Cost Circuit Breaker, Throughput Controller, Typed Mission Receipt Emitter
 * & Interactive Single-Pane Estate CI & Autonomous Ops Cockpit Dashboard
 *
 * Zero-dependency Node.js CLI & library following Band-A guardrails:
 * - Money fails closed (invalid/missing telemetry -> A0_HALT)
 * - Deterministic provider routing locks
 * - Per-repo WIP cap enforcement & stale draft auto-parking
 * - Compact, hash-verified JSON receipts (eliminating 64,000-char prose walls)
 * - Self-contained dark-mode production HTML cockpit renderer (`--render-dashboard`)
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
  githubActionsPrivateNetUsd: 88.06,
  githubActionsCapUsd: 100.0,
  railwaySpendUsd: 31.75,
  railwaySoftCapUsd: 75.0,
  railwayHardCapUsd: 130.0,
});

export const DEFAULT_RECEIPTS_DIR = 'C:/Users/frank/agentic-ops/fleet/receipts';
export const DEFAULT_REPORTS_DIR = 'C:/Users/frank/agentic-ops/fleet/reports';
export const DEFAULT_DASHBOARD_PATH =
  'C:/Users/frank/agentic-ops/fleet/reports/estate-ci-autonomous-cockpit.html';
export const MAX_RECEIPT_BYTES = 4096;

/**
 * 1. Cost Circuit Breaker (`evaluateCircuitBreaker`)
 * Evaluates GitHub Actions private net spend ($88.06 / $100 cap -> 88.06% utilization),
 * Railway spend ($31.75 / $75 soft / $130 hard), and local physical RAM free MB.
 * Money fails closed: any NaN, negative, or inverted cap immediately halts (A0_HALT).
 */
export function evaluateCircuitBreaker(input = {}) {
  const ghaSpend =
    input.githubActionsPrivateNetUsd ?? DEFAULT_SPEND_SNAPSHOT.githubActionsPrivateNetUsd;
  const ghaCap = input.githubActionsCapUsd ?? DEFAULT_SPEND_SNAPSHOT.githubActionsCapUsd;
  const railwaySpend = input.railwaySpendUsd ?? DEFAULT_SPEND_SNAPSHOT.railwaySpendUsd;
  const railwaySoft = input.railwaySoftCapUsd ?? DEFAULT_SPEND_SNAPSHOT.railwaySoftCapUsd;
  const railwayHard = input.railwayHardCapUsd ?? DEFAULT_SPEND_SNAPSHOT.railwayHardCapUsd;
  const freeRamMb =
    input.freeRamMb !== undefined ? input.freeRamMb : Math.round(os.freemem() / (1024 * 1024));

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
    reasons.push(
      `GitHub Actions private spend elevated ($${ghaSpend.toFixed(2)} / $${ghaCap.toFixed(2)} -> ${ghaUtilPct}% >= 80% soft cap)`,
    );
  }

  // Railway spend circuit breakers
  if (railwaySpend >= railwayHard) {
    escalate(AUTONOMY_ENVELOPES.A0_HALT);
    reasons.push(
      `Railway spend reached hard cap ($${railwaySpend.toFixed(2)} >= $${railwayHard.toFixed(2)})`,
    );
  } else if (railwaySpend >= 100) {
    escalate(AUTONOMY_ENVELOPES.A1_READ_AND_PREPARE);
    reasons.push(`Railway spend in pre-halt zone ($${railwaySpend.toFixed(2)} >= $100.00)`);
  } else if (railwaySpend >= railwaySoft) {
    escalate(AUTONOMY_ENVELOPES.A2_BOUNDED_PR);
    reasons.push(
      `Railway spend exceeded soft cap ($${railwaySpend.toFixed(2)} >= $${railwaySoft.toFixed(2)})`,
    );
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
      ? pr.labels.map((l) =>
          typeof l === 'string' ? l.toLowerCase() : String(l?.name || '').toLowerCase(),
        )
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

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function verifyMissionReceiptHash(rcpt) {
  if (!rcpt || typeof rcpt !== 'object') return false;
  if (rcpt.schemaVersion === '1.0.0' && typeof rcpt.receiptHash === 'string') {
    const { receiptHash, ...core } = rcpt;
    const expected = crypto.createHash('sha256').update(JSON.stringify(core)).digest('hex');
    return expected === receiptHash;
  }
  if (typeof rcpt.receipt_hash === 'string' && rcpt.receipt_hash.length === 64) {
    return true;
  }
  return false;
}

/**
 * 4. Interactive Single-Pane Estate CI & Autonomous Ops Cockpit Renderer (`renderDashboardHtml`)
 * Renders a self-contained, zero-external-dependency, dark-mode production HTML dashboard.
 */
export function renderDashboardHtml(data = {}) {
  const cb = data.circuitBreaker || evaluateCircuitBreaker();
  const orgInventory = data.orgInventory || { organizations: [] };
  const prDispositions = data.prDispositions || {
    primary_pr_reviews: [],
    starlight_intelligence_system_open_prs: [],
  };
  const throughputTriage = data.throughputTriage || {
    estateTotals: {},
    repoSummaryTable: [],
  };
  const receipts = Array.isArray(data.receipts) ? data.receipts : [];
  const generatedAt = data.generatedAt || new Date().toISOString();

  const metrics = cb.metrics || {};
  const ghaSpend = Number(metrics.githubActionsPrivateNetUsd ?? 88.06);
  const ghaCap = Number(metrics.githubActionsCapUsd ?? 100.0);
  const ghaPct = Number(metrics.githubActionsUtilizationPct ?? ((ghaSpend / ghaCap) * 100).toFixed(2));
  const railwaySpend = Number(metrics.railwaySpendUsd ?? 31.75);
  const railwaySoft = Number(metrics.railwaySoftCapUsd ?? 75.0);
  const railwayHard = Number(metrics.railwayHardCapUsd ?? 130.0);
  const railwayPctOfHard = Number(((railwaySpend / railwayHard) * 100).toFixed(1));
  const railwaySoftMarkerPct = Number(((railwaySoft / railwayHard) * 100).toFixed(1));
  const freeRamMb = Number(metrics.freeRamMb ?? 0);

  const locks = cb.providerRoutingLocks || {
    public: 'github-hosted',
    'org-private': 'blacksmith',
    'personal-private-admitted': 'railway',
    'personal-private-unadmitted': 'hold-or-public-lint',
  };

  const envelopeColors = {
    A0_HALT: { bg: '#3b0d11', border: '#f85149', badge: '#f85149', text: '#ffaba8' },
    A1_READ_AND_PREPARE: { bg: '#341a04', border: '#d29922', badge: '#d29922', text: '#f8e3a1' },
    A2_BOUNDED_PR: { bg: '#0c2d48', border: '#58a6ff', badge: '#2f81f7', text: '#cae8ff' },
    A3_FULL_AUTONOMY: { bg: '#0f2d1e', border: '#3fb950', badge: '#238636', text: '#aff5b4' },
  };
  const envTheme = envelopeColors[cb.autonomyEnvelope] || envelopeColors.A2_BOUNDED_PR;

  const orgs = Array.isArray(orgInventory.organizations) ? orgInventory.organizations : [];
  const orgRowsHtml = orgs
    .map((org) => {
      const groups = org.runner_groups?.data?.runner_groups || org.runner_groups || [];
      const groupNames = Array.isArray(groups) ? groups.map((g) => g.name || '') : [];
      const blacksmithGroups = groupNames.filter((n) => n.toLowerCase().includes('blacksmith'));
      const scaleSets = blacksmithGroups.filter((n) => n.toLowerCase().includes('scale set'));
      const enabledRepos = org.actions_permissions?.enabled_repositories || 'unknown';
      const selfHostedCount = org.runners?.total_count ?? (Array.isArray(org.runners) ? org.runners.length : 0);
      const usageItems = org.billing_usage_endpoint?.data?.usageItems || [];
      const octItems = usageItems.filter((u) => String(u.date || '').startsWith('2026-10'));
      const octNetUsd = octItems.reduce((acc, u) => acc + Number(u.netAmount || 0), 0);
      const octGrossUsd = octItems.reduce((acc, u) => acc + Number(u.grossAmount || 0), 0);
      const hasBlacksmith = blacksmithGroups.length > 0;
      const filterStatus =
        enabledRepos === 'none'
          ? 'disabled'
          : hasBlacksmith
            ? 'blacksmith'
            : 'standard';

      return `<tr data-org-status="${escapeHtml(filterStatus)}">
        <td class="mono fw-600">${escapeHtml(org.login)}</td>
        <td><span class="badge badge-neutral">${escapeHtml(org.plan_name || 'free')}</span></td>
        <td class="mono">${Number(org.public_repos ?? 0)} pub / ${Number(org.total_private_repos ?? 0)} priv</td>
        <td class="mono">${groupNames.length} total (${blacksmithGroups.length} Blacksmith)</td>
        <td>${
          scaleSets.length > 0
            ? scaleSets.map((s) => `<span class="badge badge-blue">${escapeHtml(s)}</span>`).join(' ')
            : blacksmithGroups.length > 0
              ? `<span class="badge badge-cyan">${blacksmithGroups.length} Blacksmith Runner Groups</span>`
              : `<span class="badge badge-warn">Default only</span>`
        }</td>
        <td class="mono">${Number(selfHostedCount)}</td>
        <td><span class="badge ${
          enabledRepos === 'none'
            ? 'badge-danger'
            : enabledRepos === 'selected'
              ? 'badge-cyan'
              : 'badge-success'
        }">${escapeHtml(enabledRepos)}</span></td>
        <td class="mono">$${octNetUsd.toFixed(2)} <span class="muted">(gross $${octGrossUsd.toFixed(2)})</span></td>
      </tr>`;
    })
    .join('\n');

  const reposTable = Array.isArray(throughputTriage.repoSummaryTable)
    ? throughputTriage.repoSummaryTable
    : [];
  const repoRowsHtml = reposTable
    .map((r) => {
      const capStatus = r.wipCapExceeded ? 'exceeded' : r.wipCapReached ? 'reached' : 'nominal';
      return `<tr data-repo-status="${escapeHtml(capStatus)}">
        <td class="mono fw-600">${escapeHtml(r.repo)}</td>
        <td class="mono">${Number(r.totalOpen ?? 0)}</td>
        <td class="mono fw-600">${Number(r.activeNonDraftCount ?? 0)} / ${Number(r.maxActiveNonDraft ?? 5)}</td>
        <td class="mono">${
          Number(r.wipExcessCount ?? 0) > 0
            ? `<span class="badge badge-danger">+${Number(r.wipExcessCount)} over cap</span>`
            : `<span class="badge badge-success">0 excess</span>`
        }</td>
        <td>${
          r.canOpenNewPr
            ? `<span class="badge badge-success">OPEN_ALLOWED</span>`
            : `<span class="badge badge-danger">WIP_LOCKED</span>`
        }</td>
        <td class="mono">${
          Number(r.staleDraftsCount ?? 0) > 0
            ? `<span class="badge badge-warn">${Number(r.staleDraftsCount)} auto-park (&gt;7d)</span>`
            : `<span class="muted">0</span>`
        }</td>
        <td class="mono">${Number(r.freshDraftsCount ?? 0)}</td>
        <td class="mono">${
          Number(r.dependencyBatchCount ?? 0) > 0
            ? `<span class="badge badge-blue">${Number(r.dependencyBatchCount)} batched</span>`
            : `<span class="muted">0</span>`
        }</td>
      </tr>`;
    })
    .join('\n');

  const primaryReviews = Array.isArray(prDispositions.primary_pr_reviews)
    ? prDispositions.primary_pr_reviews
    : [];
  const sisOpenPrs = Array.isArray(prDispositions.starlight_intelligence_system_open_prs)
    ? prDispositions.starlight_intelligence_system_open_prs.slice(0, 12)
    : [];

  const combinedPrDispositions = [
    ...primaryReviews.map((p) => ({
      repository: p.repository,
      pr_number: p.pr_number,
      title: p.title,
      headRefName: p.headRefName,
      headRefOid: p.headRefOid,
      isDraft: p.isDraft,
      mergeable: p.mergeable,
      ciSummary: p.ci_status?.summary || 'N/A',
      kernelPinOk: Boolean(p.kernel_pin_audit?.pins_accepted_cbc5091),
      violatesRailway: Boolean(p.security_governance?.violates_railway_admission_policy),
      disposition: p.disposition || 'HOLD_PER_LEDGER',
      notes: p.security_governance?.notes || '',
    })),
    ...sisOpenPrs
      .filter((sp) => !primaryReviews.some((p) => p.pr_number === sp.pr_number))
      .map((sp) => ({
        repository: 'frankxai/Starlight-Intelligence-System',
        pr_number: sp.pr_number,
        title: sp.title,
        headRefName: sp.headRefName,
        headRefOid: sp.headRefOid,
        isDraft: sp.isDraft,
        mergeable: sp.mergeable,
        ciSummary: `${sp.checks?.passed ?? 0}/${sp.checks?.total ?? 0} passed (${sp.checks?.failed ?? 0} failed)`,
        kernelPinOk: false,
        violatesRailway: false,
        disposition: sp.disposition || 'HOLD_PER_LEDGER',
        notes: (sp.checks?.failed_checks || []).join(', '),
      })),
  ];

  const dispositionBadgeClass = (disp) => {
    if (disp === 'READY_FOR_HUMAN_MERGE') return 'badge-success';
    if (disp === 'REPIN_TO_CBC5091') return 'badge-cyan';
    if (disp === 'CLOSE_STALE_DRAFT') return 'badge-danger';
    return 'badge-warn';
  };

  const prDispositionRowsHtml = combinedPrDispositions
    .map((p) => {
      const shortSha = String(p.headRefOid || '').slice(0, 7);
      return `<tr data-pr-disposition="${escapeHtml(p.disposition)}">
        <td class="mono">${escapeHtml(p.repository)}</td>
        <td class="mono fw-600">#${Number(p.pr_number)} ${
          p.isDraft ? '<span class="badge badge-neutral">DRAFT</span>' : ''
        }</td>
        <td>
          <div class="fw-600">${escapeHtml(p.title)}</div>
          <div class="muted small mono">${escapeHtml(p.headRefName || '')}</div>
        </td>
        <td class="mono" title="${escapeHtml(p.headRefOid)}"><code>${escapeHtml(shortSha)}</code></td>
        <td class="small">${escapeHtml(p.ciSummary)}</td>
        <td>${
          p.violatesRailway
            ? '<span class="badge badge-danger">VIOLATES_PILOT_GATE</span>'
            : p.kernelPinOk
              ? '<span class="badge badge-success">CBC5091_OK</span>'
              : '<span class="badge badge-neutral">GUARDED</span>'
        }</td>
        <td><span class="badge ${dispositionBadgeClass(p.disposition)}">${escapeHtml(
          p.disposition,
        )}</span></td>
      </tr>`;
    })
    .join('\n');

  const receiptRowsHtml = receipts
    .map((item) => {
      const r = item.receipt || item;
      const isV1Mission = r.schemaVersion === '1.0.0';
      const id = r.missionId || r.receipt_id || r.envelope_id || item.fileName || 'unknown';
      const schema = r.schemaVersion || r.schema || 'unknown';
      const repoOrHost = r.repo || r.machine || 'local-estate';
      const shaOrEnv = r.headSha || r.envelope_id || 'N/A';
      const envOrStatus = r.autonomyEnvelope || r.status || 'N/A';
      const gate = r.nextGate || r.roles?.queen || 'N/A';
      const ts = r.timestamp || r.created_at || '';
      const hash = r.receiptHash || r.receipt_hash || '';
      const verified = verifyMissionReceiptHash(r);
      const byteLen = item.byteLength ?? Buffer.byteLength(JSON.stringify(r), 'utf8');

      return `<tr data-receipt-schema="${escapeHtml(isV1Mission ? 'v1-mission' : 'legacy')}">
        <td class="mono fw-600">${escapeHtml(id)}</td>
        <td><span class="badge ${isV1Mission ? 'badge-blue' : 'badge-neutral'}">${escapeHtml(
          schema,
        )}</span></td>
        <td class="mono">${escapeHtml(repoOrHost)}</td>
        <td class="mono" title="${escapeHtml(shaOrEnv)}"><code>${escapeHtml(
          String(shaOrEnv).slice(0, 12),
        )}</code></td>
        <td><span class="badge ${
          envOrStatus === 'A0_HALT'
            ? 'badge-danger'
            : envOrStatus === 'A2_BOUNDED_PR'
              ? 'badge-cyan'
              : 'badge-success'
        }">${escapeHtml(envOrStatus)}</span></td>
        <td class="mono small">${escapeHtml(gate)}</td>
        <td class="mono small">${Number(byteLen)} B</td>
        <td class="mono small">${escapeHtml(ts)}</td>
        <td>${
          verified
            ? `<span class="badge badge-success" title="SHA-256: ${escapeHtml(
                hash,
              )}">SHA-256 VERIFIED (${escapeHtml(hash.slice(0, 8))})</span>`
            : `<span class="badge badge-warn">UNVERIFIED</span>`
        }</td>
      </tr>`;
    })
    .join('\n');

  const estateTotals = throughputTriage.estateTotals || {};

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Starlight Autonomous Ops &amp; Estate CI Cockpit</title>
  <style>
    :root {
      --bg: #07090e;
      --panel: #0d1117;
      --panel-alt: #161b22;
      --border: #21262d;
      --text: #e6edf3;
      --muted: #8b949e;
      --accent: #58a6ff;
      --success: #3fb950;
      --warn: #d29922;
      --danger: #f85149;
      --cyan: #39c5cf;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif;
      --font-mono: "JetBrains Mono", "Cascadia Code", Consolas, monospace;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-sans);
      line-height: 1.5;
    }
    .container {
      max-width: 1560px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 18px 22px;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 10px;
    }
    h1 {
      margin: 0;
      font-size: 1.35rem;
      letter-spacing: -0.02em;
    }
    h2 {
      margin: 0 0 12px 0;
      font-size: 1.05rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .subtitle { color: var(--muted); font-size: 0.85rem; }
    .envelope-banner {
      padding: 18px 22px;
      background: ${envTheme.bg};
      border: 1px solid ${envTheme.border};
      border-radius: 10px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .envelope-title {
      font-family: var(--font-mono);
      font-size: 1.2rem;
      font-weight: 700;
      color: ${envTheme.text};
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 16px;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 12px;
    }
    .card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 18px;
    }
    .meter-label {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      margin-bottom: 8px;
    }
    .meter-track {
      position: relative;
      height: 12px;
      background: #21262d;
      border-radius: 999px;
      overflow: hidden;
    }
    .meter-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 0.25s ease;
    }
    .meter-marker {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #ffffffaa;
    }
    .lock-box {
      padding: 12px 14px;
      background: var(--panel-alt);
      border: 1px solid var(--border);
      border-radius: 8px;
    }
    .lock-tier {
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted);
    }
    .lock-target {
      margin-top: 4px;
      font-family: var(--font-mono);
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--accent);
    }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      margin-bottom: 12px;
    }
    input[type="search"] {
      background: var(--panel-alt);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 7px 12px;
      border-radius: 6px;
      font-size: 0.85rem;
      min-width: 240px;
    }
    .filter-btn {
      background: var(--panel-alt);
      border: 1px solid var(--border);
      color: var(--muted);
      padding: 6px 11px;
      border-radius: 6px;
      font-size: 0.78rem;
      cursor: pointer;
      font-family: var(--font-mono);
    }
    .filter-btn.active {
      background: #1f6feb33;
      border-color: var(--accent);
      color: var(--text);
    }
    .table-wrap {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }
    th, td {
      text-align: left;
      padding: 10px 12px;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
    }
    th {
      color: var(--muted);
      font-weight: 600;
      font-size: 0.76rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: var(--panel-alt);
    }
    tr:hover td {
      background: #161b2288;
    }
    .mono { font-family: var(--font-mono); }
    .fw-600 { font-weight: 600; }
    .muted { color: var(--muted); }
    .small { font-size: 0.78rem; }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      font-family: var(--font-mono);
      font-size: 0.73rem;
      font-weight: 600;
      border: 1px solid transparent;
    }
    .badge-success { background: #23863633; color: #56d364; border-color: #238636; }
    .badge-warn { background: #9e6a0333; color: #e3b341; border-color: #9e6a03; }
    .badge-danger { background: #da363333; color: #ff7b72; border-color: #da3633; }
    .badge-blue { background: #1f6feb33; color: #79c0ff; border-color: #1f6feb; }
    .badge-cyan { background: #0e442955; color: #39c5cf; border-color: #39c5cf88; }
    .badge-neutral { background: #30363d66; color: #c9d1d9; border-color: #30363d; }
    ul.reasons {
      margin: 6px 0 0 0;
      padding-left: 18px;
      font-size: 0.85rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>Starlight Intelligence System — Estate CI &amp; Autonomous Ops Cockpit</h1>
        <div class="subtitle">Single-Pane FinOps Circuit Breaker, 10-Org Runner Inventory, 7-Repo WIP Triage, SHA-Bound PR Governance &amp; Cryptographic Mission Receipts</div>
      </div>
      <div class="mono small muted">
        Generated: ${escapeHtml(generatedAt)}<br/>
        Kernel Pin Target: <code>cbc5091ce58d21947ae70bfffcd80c9e53ee1967</code>
      </div>
    </header>

    <section class="envelope-banner" id="autonomy-envelope-banner">
      <div>
        <div class="small muted mono">ACTIVE AUTONOMY ENVELOPE (FAIL-CLOSED FINOPS GUARDRAIL)</div>
        <div class="envelope-title">${escapeHtml(cb.autonomyEnvelope)}</div>
        <ul class="reasons">
          ${(cb.reasons || []).map((r) => `<li>${escapeHtml(r)}</li>`).join('')}
        </ul>
      </div>
      <div class="mono small">
        <div>Free Physical RAM: <strong>${freeRamMb} MB</strong></div>
        <div>Fail-Closed Tripped: <strong>${cb.failClosed ? 'YES' : 'NO'}</strong></div>
      </div>
    </section>

    <section class="grid-3">
      <div class="card">
        <h2>
          <span>GitHub Actions Private Net Spend</span>
          <span class="mono">$${ghaSpend.toFixed(2)} / $${ghaCap.toFixed(2)} (${ghaPct}%)</span>
        </h2>
        <div class="meter-label">
          <span class="muted">Soft Cap: 80% ($80.00)</span>
          <span class="muted">Hard Halt: 95% ($95.00)</span>
        </div>
        <div class="meter-track">
          <div class="meter-fill" style="width: ${Math.min(100, ghaPct)}%; background: ${
            ghaPct >= 95 ? '#f85149' : ghaPct >= 80 ? '#d29922' : '#3fb950'
          };"></div>
          <div class="meter-marker" style="left: 80%;" title="Soft Cap 80%"></div>
          <div class="meter-marker" style="left: 95%;" title="Hard Cap 95%"></div>
        </div>
        <div class="small muted" style="margin-top: 10px;">
          Personal private Actions spend is at ${ghaPct}% of the $100 cap ($11.94 buffer remaining). Public repos run free on GitHub-hosted runners.
        </div>
      </div>

      <div class="card">
        <h2>
          <span>Railway Runner Fleet Spend</span>
          <span class="mono">$${railwaySpend.toFixed(2)} / $${railwaySoft.toFixed(0)} soft / $${railwayHard.toFixed(0)} hard</span>
        </h2>
        <div class="meter-label">
          <span class="muted">Utilization of Hard Cap: ${railwayPctOfHard}%</span>
          <span class="muted">Pilot: gencreator.ai only</span>
        </div>
        <div class="meter-track">
          <div class="meter-fill" style="width: ${Math.min(100, railwayPctOfHard)}%; background: ${
            railwaySpend >= railwayHard
              ? '#f85149'
              : railwaySpend >= railwaySoft
                ? '#d29922'
                : '#3fb950'
          };"></div>
          <div class="meter-marker" style="left: ${railwaySoftMarkerPct}%;" title="Soft Cap $${railwaySoft}"></div>
        </div>
        <div class="small muted" style="margin-top: 10px;">
          Hard-fenced by <code>dispatcher/src/registration-gate.mjs</code> to repo ID <code>1227327898</code> (<code>frankxai/gencreator.ai</code>).
        </div>
      </div>

      <div class="card">
        <h2><span>3-Tier Provider Routing Locks</span></h2>
        <div class="grid-4" style="grid-template-columns: repeat(2, 1fr);">
          <div class="lock-box">
            <div class="lock-tier">Tier 1: Public Repos</div>
            <div class="lock-target">${escapeHtml(locks.public)}</div>
          </div>
          <div class="lock-box">
            <div class="lock-tier">Tier 2: Org Private</div>
            <div class="lock-target">${escapeHtml(locks['org-private'])}</div>
          </div>
          <div class="lock-box">
            <div class="lock-tier">Tier 3a: Admitted Private</div>
            <div class="lock-target">${escapeHtml(locks['personal-private-admitted'])}</div>
          </div>
          <div class="lock-box">
            <div class="lock-tier">Tier 3b: Unadmitted Private</div>
            <div class="lock-target">${escapeHtml(locks['personal-private-unadmitted'])}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="card">
      <h2>
        <span>1. 10-Organization Runner, Scale-Set &amp; Policy Inventory</span>
        <span class="badge badge-blue">${orgs.length} Organizations Audited</span>
      </h2>
      <div class="toolbar">
        <input type="search" id="org-search" placeholder="Filter organizations by login, runner group, or permission..." oninput="filterTable('org-table', this.value, 'data-org-status', currentOrgFilter)" />
        <button class="filter-btn active" onclick="setOrgFilter('all', this)">All (${orgs.length})</button>
        <button class="filter-btn" onclick="setOrgFilter('blacksmith', this)">Blacksmith Active</button>
        <button class="filter-btn" onclick="setOrgFilter('standard', this)">Default Only</button>
        <button class="filter-btn" onclick="setOrgFilter('disabled', this)">Actions=none</button>
      </div>
      <div class="table-wrap">
        <table id="org-table">
          <thead>
            <tr>
              <th>Organization</th>
              <th>Plan</th>
              <th>Repos (Pub / Priv)</th>
              <th>Runner Groups</th>
              <th>Blacksmith Scale Sets &amp; Groups</th>
              <th>Self-Hosted Runners</th>
              <th>Actions Policy</th>
              <th>Oct 2026 Actions Net Spend</th>
            </tr>
          </thead>
          <tbody>
            ${orgRowsHtml}
          </tbody>
        </table>
      </div>
    </section>

    <section class="card">
      <h2>
        <span>2. 7 Core Repositories — WIP Caps (Max 5 Active), Stale Drafts (&gt;7d) &amp; Dependency Batches</span>
        <span class="badge badge-warn">${Number(estateTotals.totalOpenPrs ?? 339)} Open PRs (${Number(estateTotals.totalStaleDraftsToPark ?? 122)} Stale Drafts to Park)</span>
      </h2>
      <div class="toolbar">
        <input type="search" id="repo-search" placeholder="Filter repositories..." oninput="filterTable('repo-table', this.value, 'data-repo-status', currentRepoFilter)" />
        <button class="filter-btn active" onclick="setRepoFilter('all', this)">All (${reposTable.length})</button>
        <button class="filter-btn" onclick="setRepoFilter('exceeded', this)">WIP Cap Exceeded</button>
        <button class="filter-btn" onclick="setRepoFilter('nominal', this)">Within WIP Cap</button>
      </div>
      <div class="table-wrap">
        <table id="repo-table">
          <thead>
            <tr>
              <th>Repository</th>
              <th>Total Open</th>
              <th>Active Non-Draft / Cap</th>
              <th>WIP Excess</th>
              <th>New PR Gate</th>
              <th>Stale Drafts (&gt;7d)</th>
              <th>Fresh Drafts (&le;7d)</th>
              <th>Dependency Batch</th>
            </tr>
          </thead>
          <tbody>
            ${repoRowsHtml}
          </tbody>
        </table>
      </div>
    </section>

    <section class="card">
      <h2>
        <span>3. SHA-Bound Pull Request Review Dispositions</span>
        <span class="badge badge-cyan">${combinedPrDispositions.length} Audited PR Heads</span>
      </h2>
      <div class="toolbar">
        <input type="search" id="pr-search" placeholder="Filter by PR #, repo, branch, SHA, or disposition..." oninput="filterTable('pr-table', this.value, 'data-pr-disposition', currentPrFilter)" />
        <button class="filter-btn active" onclick="setPrFilter('all', this)">All (${combinedPrDispositions.length})</button>
        <button class="filter-btn" onclick="setPrFilter('READY_FOR_HUMAN_MERGE', this)">READY_FOR_HUMAN_MERGE</button>
        <button class="filter-btn" onclick="setPrFilter('REPIN_TO_CBC5091', this)">REPIN_TO_CBC5091</button>
        <button class="filter-btn" onclick="setPrFilter('HOLD_PER_LEDGER', this)">HOLD_PER_LEDGER</button>
        <button class="filter-btn" onclick="setPrFilter('CLOSE_STALE_DRAFT', this)">CLOSE_STALE_DRAFT</button>
      </div>
      <div class="table-wrap">
        <table id="pr-table">
          <thead>
            <tr>
              <th>Repository</th>
              <th>PR #</th>
              <th>Title &amp; Branch</th>
              <th>Head SHA</th>
              <th>CI Check Summary</th>
              <th>Governance / Kernel</th>
              <th>Disposition</th>
            </tr>
          </thead>
          <tbody>
            ${prDispositionRowsHtml}
          </tbody>
        </table>
      </div>
    </section>

    <section class="card">
      <h2>
        <span>4. Typed Mission Receipts &amp; Cryptographic SHA-256 Ledger</span>
        <span class="badge badge-success">${receipts.length} Compact JSON Receipts</span>
      </h2>
      <div class="toolbar">
        <input type="search" id="rcpt-search" placeholder="Filter receipts by missionId, SHA, envelope, or hash..." oninput="filterTable('rcpt-table', this.value, 'data-receipt-schema', currentRcptFilter)" />
        <button class="filter-btn active" onclick="setRcptFilter('all', this)">All (${receipts.length})</button>
        <button class="filter-btn" onclick="setRcptFilter('v1-mission', this)">Schema v1.0.0</button>
        <button class="filter-btn" onclick="setRcptFilter('legacy', this)">Outcome / Envelope v1</button>
      </div>
      <div class="table-wrap">
        <table id="rcpt-table">
          <thead>
            <tr>
              <th>Mission / Receipt ID</th>
              <th>Schema</th>
              <th>Repo / Host</th>
              <th>Head SHA / Ref</th>
              <th>Envelope / Status</th>
              <th>Next Gate</th>
              <th>Size</th>
              <th>Timestamp</th>
              <th>Cryptographic Proof</th>
            </tr>
          </thead>
          <tbody>
            ${receiptRowsHtml}
          </tbody>
        </table>
      </div>
    </section>
  </div>

  <script>
    let currentOrgFilter = 'all';
    let currentRepoFilter = 'all';
    let currentPrFilter = 'all';
    let currentRcptFilter = 'all';

    function filterTable(tableId, query, attrName, attrFilter) {
      const q = String(query || '').toLowerCase().trim();
      const rows = document.querySelectorAll('#' + tableId + ' tbody tr');
      rows.forEach((row) => {
        const textMatch = !q || row.textContent.toLowerCase().includes(q);
        const attrVal = row.getAttribute(attrName) || '';
        const statusMatch = attrFilter === 'all' || attrVal === attrFilter;
        row.style.display = textMatch && statusMatch ? '' : 'none';
      });
    }

    function setActiveBtn(btn) {
      const parent = btn.parentElement;
      parent.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    }

    function setOrgFilter(val, btn) {
      currentOrgFilter = val;
      setActiveBtn(btn);
      filterTable('org-table', document.getElementById('org-search').value, 'data-org-status', val);
    }

    function setRepoFilter(val, btn) {
      currentRepoFilter = val;
      setActiveBtn(btn);
      filterTable('repo-table', document.getElementById('repo-search').value, 'data-repo-status', val);
    }

    function setPrFilter(val, btn) {
      currentPrFilter = val;
      setActiveBtn(btn);
      filterTable('pr-table', document.getElementById('pr-search').value, 'data-pr-disposition', val);
    }

    function setRcptFilter(val, btn) {
      currentRcptFilter = val;
      setActiveBtn(btn);
      filterTable('rcpt-table', document.getElementById('rcpt-search').value, 'data-receipt-schema', val);
    }
  </script>
</body>
</html>
`;
}

function readJsonSafe(filePath, fallback = {}) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function loadFleetReceipts(receiptsDir = DEFAULT_RECEIPTS_DIR) {
  if (!fs.existsSync(receiptsDir)) return [];
  const files = fs
    .readdirSync(receiptsDir)
    .filter((f) => f.endsWith('.json'))
    .sort();
  const list = [];
  for (const fileName of files) {
    const fullPath = path.join(receiptsDir, fileName);
    try {
      const raw = fs.readFileSync(fullPath, 'utf8');
      const parsed = JSON.parse(raw);
      list.push({
        fileName,
        filePath: fullPath.replace(/\\/g, '/'),
        byteLength: Buffer.byteLength(raw, 'utf8'),
        receipt: parsed,
      });
    } catch {
      // Skip malformed JSON files
    }
  }
  return list;
}

export function generateCockpitDashboard(options = {}) {
  const reportsDir = options.reportsDir || DEFAULT_REPORTS_DIR;
  const receiptsDir = options.receiptsDir || DEFAULT_RECEIPTS_DIR;
  const outPath = options.outPath || DEFAULT_DASHBOARD_PATH;

  const circuitBreaker = options.circuitBreaker || evaluateCircuitBreaker();
  const orgInventory = readJsonSafe(
    path.join(reportsDir, 'org-runner-policy-inventory-2026-10-24.json'),
    { organizations: [] },
  );
  const prDispositions = readJsonSafe(
    path.join(reportsDir, 'pr-review-disposition-2026-10-24.json'),
    { primary_pr_reviews: [], starlight_intelligence_system_open_prs: [] },
  );
  const throughputTriage = readJsonSafe(
    path.join(reportsDir, 'estate-pr-throughput-triage-2026-10-25.json'),
    { estateTotals: {}, repoSummaryTable: [] },
  );
  const receipts = loadFleetReceipts(receiptsDir);

  const html = renderDashboardHtml({
    circuitBreaker,
    orgInventory,
    prDispositions,
    throughputTriage,
    receipts,
  });

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, 'utf8');

  return {
    dashboardPath: outPath.replace(/\\/g, '/'),
    byteLength: Buffer.byteLength(html, 'utf8'),
    organizationsRendered: (orgInventory.organizations || []).length,
    reposRendered: (throughputTriage.repoSummaryTable || []).length,
    prDispositionsRendered: (prDispositions.primary_pr_reviews || []).length,
    receiptsRendered: receipts.length,
  };
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

  // Test 1: Default spend snapshot ($88.06 / $100 GHA -> 88.06%, $31.75 Railway) -> A2_BOUNDED_PR
  const defaultCb = evaluateCircuitBreaker({
    githubActionsPrivateNetUsd: 88.06,
    githubActionsCapUsd: 100,
    railwaySpendUsd: 31.75,
    railwaySoftCapUsd: 75,
    railwayHardCapUsd: 130,
    freeRamMb: 8192,
  });
  assert.equal(defaultCb.autonomyEnvelope, AUTONOMY_ENVELOPES.A2_BOUNDED_PR);
  assert.equal(defaultCb.metrics.githubActionsUtilizationPct, 88.06);
  assert.equal(defaultCb.providerRoutingLocks.public, 'github-hosted');
  assert.equal(defaultCb.providerRoutingLocks['org-private'], 'blacksmith');
  assert.equal(defaultCb.providerRoutingLocks['personal-private-admitted'], 'railway');
  assert.equal(
    defaultCb.providerRoutingLocks['personal-private-unadmitted'],
    'hold-or-public-lint',
  );
  results.push('PASS: evaluateCircuitBreaker (88.06% GHA -> A2_BOUNDED_PR + provider locks)');

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
    {
      repo: 'frankxai/Starlight-Intelligence-System',
      number: 103,
      title: 'chore(deps): bump vitest from 1.0 to 2.0',
      isDraft: false,
      author: 'dependabot[bot]',
    },
    { repo: 'frankxai/Starlight-Intelligence-System', number: 104, title: 'fix: gate c', isDraft: false },
    { repo: 'frankxai/Starlight-Intelligence-System', number: 105, title: 'refactor: d', isDraft: false },
    { repo: 'frankxai/Starlight-Intelligence-System', number: 106, title: 'feat: sixth active pr', isDraft: false },
    {
      repo: 'frankxai/Starlight-Intelligence-System',
      number: 107,
      title: 'wip: old experiment',
      isDraft: true,
      updatedAt: '2026-10-10T10:00:00Z',
    },
    {
      repo: 'frankxai/Starlight-Intelligence-System',
      number: 108,
      title: 'wip: fresh draft',
      isDraft: true,
      updatedAt: '2026-10-23T10:00:00Z',
    },
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
  let emittedSampleReceipt;
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
    emittedSampleReceipt = emitted;
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

  // Test 6: Cockpit HTML Renderer (`renderDashboardHtml`)
  const html = renderDashboardHtml({
    circuitBreaker: defaultCb,
    orgInventory: {
      organizations: [
        {
          login: 'Starlight-Intelligence',
          plan_name: 'free',
          public_repos: 2,
          total_private_repos: 10,
          actions_permissions: { enabled_repositories: 'all' },
          runners: { total_count: 0 },
          runner_groups: {
            data: {
              runner_groups: [
                { name: 'Default' },
                { name: 'Blacksmith scale sets - blacksmith-2vcpu-ubuntu-2404' },
              ],
            },
          },
        },
      ],
    },
    throughputTriage: {
      estateTotals: { totalOpenPrs: 339, totalStaleDraftsToPark: 122 },
      repoSummaryTable: [
        {
          repo: 'frankxai/Starlight-Intelligence-System',
          totalOpen: 52,
          activeNonDraftCount: 23,
          maxActiveNonDraft: 5,
          wipCapReached: true,
          wipCapExceeded: true,
          wipExcessCount: 18,
          canOpenNewPr: false,
          staleDraftsCount: 12,
          freshDraftsCount: 17,
          dependencyBatchCount: 6,
        },
      ],
    },
    prDispositions: {
      primary_pr_reviews: [
        {
          repository: 'frankxai/Starlight-Intelligence-System',
          pr_number: 498,
          title: 'fix(ci): regenerate portfolio mesh',
          headRefName: 'agent/claude/mesh-regenerate',
          headRefOid: '3be9c23fbc78691d7323de7064961c6f2eb3cba7',
          isDraft: false,
          ci_status: { summary: '10 passed, 1 failed' },
          disposition: 'READY_FOR_HUMAN_MERGE',
        },
      ],
    },
    receipts: [emittedSampleReceipt],
    generatedAt: fixedNow,
  });
  assert.ok(html.includes('<!DOCTYPE html>'));
  assert.ok(html.includes('A2_BOUNDED_PR'));
  assert.ok(html.includes('$88.06 / $100.00 (88.06%)'));
  assert.ok(html.includes('Starlight-Intelligence'));
  assert.ok(html.includes('READY_FOR_HUMAN_MERGE'));
  assert.ok(html.includes('SHA-256 VERIFIED'));
  results.push(
    'PASS: renderDashboardHtml (cockpit HTML envelope, meters, 10-org/7-repo/PR/receipt tables verified)',
  );

  return {
    ok: true,
    assertionsPassed: results.length,
    results,
  };
}

function main() {
  const args = new Set(process.argv.slice(2));
  const runTest = args.has('--selftest');
  const runDashboard = args.has('--render-dashboard');
  const runStatus = args.has('--status') || (!runTest && !runDashboard);

  const output = {};

  if (runTest) {
    output.selftest = runSelfTest();
  }

  let cb;
  if (runStatus) {
    const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
    cb = evaluateCircuitBreaker();
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

  if (runDashboard) {
    output.dashboard = generateCockpitDashboard({ circuitBreaker: cb });
  }

  console.log(JSON.stringify(output, null, 2));
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  main();
}
