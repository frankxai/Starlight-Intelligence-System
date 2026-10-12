#!/usr/bin/env node
/**
 * Starlight CEO PR Review & Autonomous Merge Engine
 * 
 * Provides end-to-end autonomous Pull Request governance with the FrankX CEO Mindset:
 * 1. Multi-Repo Autonomous PR Sweep (SIS, frankx.ai-vercel-website, arcanea, etc.)
 * 2. Maker/Checker Verification (@humanizer, @impeccable, modern Next.js 16/React 19)
 * 3. Fatal CEO Guardrails (Frozen lockfile breaks, contract coupling without tags)
 * 4. Automatic Exact-Head Review Attestation (STARLIGHT-INDEPENDENT-REVIEW-V1)
 * 5. Branch Freshness Sync & Squash Auto-Merge
 * 
 * Built on SIP — Starlight Intelligence Protocol v1.1.1.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { performMakerCheckerReview } from './maker-checker.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const CONFIG_PATH = join(__dirname, 'config.json');

function runCmd(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, {
    encoding: 'utf8',
    windowsHide: true,
    timeout: opts.timeout || 60000,
    ...opts,
  });
  return {
    code: res.status ?? 1,
    stdout: (res.stdout || '').trim(),
    stderr: (res.stderr || '').trim(),
  };
}

function loadConfig() {
  try {
    return existsSync(CONFIG_PATH) ? JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) : {};
  } catch {
    return {};
  }
}

export function evaluatePullRequest(repo, prNumber) {
  console.log(`\n===============================================================`);
  console.log(`[*] Evaluating PR #${prNumber} on ${repo}`);
  console.log(`===============================================================`);

  // Fetch PR metadata
  const viewRes = runCmd('gh', [
    'pr', 'view', String(prNumber),
    '--repo', repo,
    '--json', 'number,title,body,headRefName,headRefOid,isDraft,mergeable,mergeStateStatus,state,files,statusCheckRollup,autoMergeRequest,reviews'
  ]);

  if (viewRes.code !== 0) {
    console.error(`[-] Failed to view PR #${prNumber}: ${viewRes.stderr}`);
    return { ok: false, error: viewRes.stderr };
  }

  const pr = JSON.parse(viewRes.stdout);
  if (pr.state !== 'OPEN') {
    console.log(`[-] PR #${prNumber} is already ${pr.state}. Nothing to do.`);
    return { ok: true, state: pr.state };
  }

  // Fetch diff
  const diffRes = runCmd('gh', ['pr', 'diff', String(prNumber), '--repo', repo]);
  const diffText = diffRes.stdout || '';

  // Determine frontend repo profile
  const isFrontend = repo.includes('website') || repo.includes('app') || repo.includes('studio');

  // Run Maker / Checker Audit
  const check = performMakerCheckerReview(diffText, {
    isFrontend,
    repo,
    files: pr.files || [],
    prTitle: pr.title,
  });

  console.log(`[*] Maker / Checker Quality Score: ${check.score}/100 [Approved: ${check.approved}]`);
  if (check.feedback.length > 0) {
    console.log(`    Findings:`);
    for (const fb of check.feedback) {
      console.log(`    - ${fb}`);
    }
  }

  // 1. Handle Fatal Lockfile Breaks
  if (check.ceoGuardrails.fatal.length > 0) {
    console.warn(`[!] FATAL CEO GUARDRAIL VIOLATION on PR #${prNumber}:`);
    for (const f of check.ceoGuardrails.fatal) {
      console.warn(`    ! ${f}`);
    }
    console.warn(`    PR cannot auto-merge until lockfile is committed.`);
    return { ok: false, fatal: check.ceoGuardrails.fatal };
  }

  // Post official GitHub Review if not already reviewed for this headRefOid
  const alreadyReviewed = (pr.reviews || []).some(r => r.commit?.oid === pr.headRefOid);
  if (!alreadyReviewed && pr.headRefOid) {
    const verdict = check.score >= 85 && check.approved ? 'APPROVE' : 'COMMENT';
    const scorecard = [
      `### Starlight Maker/Checker Quality Audit`,
      `- **Score**: ${check.score}/100`,
      `- **Status**: ${check.approved ? '✅ Approved' : '⚠️ Action Required'}`,
      `- **Humanizer Editorial**: ${check.humanizer.passed ? '✅ Pass' : '❌ ' + check.humanizer.issues.join('; ')}`,
      `- **Impeccable Design**: ${check.impeccable.passed ? '✅ Pass' : '❌ ' + check.impeccable.issues.join('; ')}`,
      `- **Frontier Architecture**: ${check.architecture.passed ? '✅ Pass' : '❌ ' + check.architecture.issues.join('; ')}`,
      `- **Lockfile Integrity**: ${check.ceoGuardrails.fatal.length === 0 ? '✅ Pass' : '❌ ' + check.ceoGuardrails.fatal.join('; ')}`,
      ``,
      `*Attestation: Built on SIP — Starlight Intelligence Protocol v1.1.1.*`
    ].join('\n');

    console.log(`[*] Posting official Starlight PR review (${verdict}) on PR #${prNumber}...`);
    if (verdict === 'APPROVE') {
      runCmd('gh', ['pr', 'review', String(prNumber), '--repo', repo, '--approve', '-b', scorecard]);
    } else {
      runCmd('gh', ['pr', 'review', String(prNumber), '--repo', repo, '--comment', '-b', scorecard]);
    }
  }

  // 2. Handle Contract Guard Couplings
  if (check.ceoGuardrails.issues.some(i => i.includes('Contract Guard Notice'))) {
    if (!pr.title.includes('[contract-change]')) {
      const newTitle = `[contract-change] ${pr.title}`;
      console.log(`[*] Auto-updating PR title to include [contract-change] tag...`);
      runCmd('gh', ['pr', 'edit', String(prNumber), '--repo', repo, '--title', newTitle]);
    }
  }

  // 3. Check Branch Freshness with base
  const checks = pr.statusCheckRollup || [];
  const hasFailures = checks.some(c => (c.conclusion || c.state || '').toUpperCase() === 'FAILURE');
  const behindError = pr.mergeable === 'CONFLICTING' || checks.some(c => (c.conclusion || c.state) === 'FAILURE' && (c.name || '').includes('branch'));
  const isBehind = pr.mergeStateStatus === 'BEHIND' || behindError;

  if (isBehind) {
    console.log(`[*] PR #${prNumber} branch is behind base (${pr.mergeStateStatus || 'BEHIND'}). Updating branch...`);
    const updateRes = runCmd('gh', ['pr', 'update-branch', String(prNumber), '--repo', repo]);
    if (updateRes.code === 0) {
      console.log(`[+] Branch updated successfully with base.`);
    } else {
      console.log(`[!] update-branch notice: ${updateRes.stderr || updateRes.stdout}`);
    }
  }

  // 4. Handle Starlight Estate Independent Review Policy (if applicable)
  const needsReviewReceipt = checks.some(c => c.name === 'independent-review-policy');
  if (needsReviewReceipt && check.approved) {
    const reviewStatus = checks.find(c => c.name === 'independent-review-policy');
    if (reviewStatus?.conclusion !== 'SUCCESS') {
      console.log(`[*] PR #${prNumber} requires exact-head independent review receipt. Attesting...`);
      const attestScript = join(ROOT, 'tools', 'merge-review', 'attest_review.py');
      if (existsSync(attestScript)) {
        const attestRes = runCmd('python', [attestScript, String(prNumber), '--repo', repo]);
        console.log(attestRes.stdout || attestRes.stderr);
      }
    }
  }

  // 5. Handle Draft Conversion (when approved by Maker/Checker and no failing checks)
  if (pr.isDraft) {
    if (check.approved && !hasFailures && check.ceoGuardrails.fatal.length === 0) {
      console.log(`[*] PR #${prNumber} is an approved draft with zero failures. Marking ready for review...`);
      const readyRes = runCmd('gh', ['pr', 'ready', String(prNumber), '--repo', repo]);
      if (readyRes.code === 0) {
        console.log(`[+] PR #${prNumber} marked ready for review!`);
        pr.isDraft = false;
      }
    } else {
      console.log(`[-] PR #${prNumber} remains a draft (approved: ${check.approved}, hasFailures: ${hasFailures}).`);
      return { ok: true, approved: check.approved, isDraft: true };
    }
  }

  // 6. Ensure Squash Auto-Merge
  if (!pr.autoMergeRequest && !pr.isDraft) {
    console.log(`[*] Enabling squash auto-merge for PR #${prNumber}...`);
    const mergeAutoRes = runCmd('gh', ['pr', 'merge', String(prNumber), '--repo', repo, '--squash', '--auto']);
    if (mergeAutoRes.code === 0) {
      console.log(`[+] Auto-merge successfully enabled!`);
    } else {
      if (mergeAutoRes.stderr.includes('head branch is not up to date')) {
        console.log(`[*] Branch is behind base. Updating branch...`);
        runCmd('gh', ['pr', 'update-branch', String(prNumber), '--repo', repo]);
        runCmd('gh', ['pr', 'merge', String(prNumber), '--repo', repo, '--squash', '--auto']);
      } else {
        console.log(`[!] Auto-merge status: ${mergeAutoRes.stderr || mergeAutoRes.stdout}`);
      }
    }
  } else if (pr.autoMergeRequest) {
    console.log(`[+] Squash auto-merge already active.`);
  }

  // 7. If all checks passing right now, merge immediately
  const allCompleted = checks.length > 0 && checks.every(c => {
    const conc = (c.conclusion || c.state || '').toUpperCase();
    return conc === 'SUCCESS' || conc === 'NEUTRAL' || conc === 'SKIPPED';
  });

  if (allCompleted && pr.mergeable === 'MERGEABLE' && !pr.isDraft) {
    console.log(`[*] All checks are green! Executing immediate squash merge for PR #${prNumber}...`);
    const mergeNow = runCmd('gh', ['pr', 'merge', String(prNumber), '--repo', repo, '--squash']);
    if (mergeNow.code === 0) {
      console.log(`[★ MERGED] PR #${prNumber} successfully merged into ${repo}!`);
      return { ok: true, merged: true };
    } else if (mergeNow.stderr.includes('already merged')) {
      console.log(`[★ MERGED] PR #${prNumber} was already merged.`);
      return { ok: true, merged: true };
    } else {
      console.log(`[!] Immediate merge response: ${mergeNow.stderr || mergeNow.stdout}`);
    }
  }

  return { ok: true, approved: check.approved, score: check.score };
}

export function sweepPullRequests() {
  const config = loadConfig();
  const repoProfiles = config.repoProfiles || {};
  const repos = Object.keys(repoProfiles).filter(r => r !== 'default');

  console.log(`\n===============================================================`);
  console.log(`   STARLIGHT CEO AUTONOMOUS PR SWEEP & REVIEW ENGINE`);
  console.log(`   Active Repos: ${repos.length}`);
  console.log(`===============================================================\n`);

  for (const repo of repos) {
    console.log(`\n[SWEEP] Scanning open pull requests on ${repo}...`);
    const listRes = runCmd('gh', [
      'pr', 'list',
      '--repo', repo,
      '--state', 'open',
      '--json', 'number,title,headRefName,headRefOid,isDraft,mergeable,author'
    ]);

    if (listRes.code !== 0) {
      console.error(`[-] Could not list PRs for ${repo}: ${listRes.stderr}`);
      continue;
    }

    try {
      const prs = JSON.parse(listRes.stdout || '[]');
      if (prs.length === 0) {
        console.log(`    Zero open pull requests on ${repo}.`);
        continue;
      }

      console.log(`    Found ${prs.length} open PR(s) on ${repo}:`);
      for (const pr of prs) {
        console.log(`    - #${pr.number}: ${pr.title.slice(0, 60)} [Branch: ${pr.headRefName}]`);
      }

      for (const pr of prs) {
        evaluatePullRequest(repo, pr.number);
      }
    } catch (err) {
      console.error(`[-] Error parsing PRs for ${repo}: ${err.message}`);
    }
  }

  console.log(`\n===============================================================`);
  console.log(`[SWEEP COMPLETE] All open pull requests evaluated with CEO Mindset.`);
  console.log(`===============================================================\n`);
}

// ── CLI Router ──────────────────────────────────────────────────
const [,, cmd, arg1, arg2] = process.argv;

if (cmd === 'sweep' || !cmd) {
  sweepPullRequests();
} else if (cmd === 'review') {
  if (!arg1) {
    console.log('Usage: node ceo-pr-review.mjs review <pr-number> [repo]');
    process.exit(1);
  }
  const repo = arg2 || 'frankxai/Starlight-Intelligence-System';
  evaluatePullRequest(repo, parseInt(arg1, 10));
} else {
  console.log(`Commands:
  sweep                  Sweep and evaluate all open PRs across configured repos
  review <pr> [repo]     Deep evaluate, verify, attest, and auto-merge a single PR
`);
}
