#!/usr/bin/env node
/**
 * Starlight CEO PR Review & Autonomous Merge Engine
 * 
 * Provides end-to-end autonomous Pull Request governance with the FrankX CEO Mindset:
 * 1. Multi-Repo Autonomous PR Sweep (SIS, frankx.ai-vercel-website, arcanea, etc.)
 * 2. Maker/Checker Verification (@humanizer, @impeccable, modern Next.js 16/React 19)
 * 3. Fatal CEO Guardrails (Frozen lockfile breaks, contract coupling without tags)
 * 4. Automatic Exact-Head Review Attestation (STARLIGHT-INDEPENDENT-REVIEW-V1)
 * 5. Report only. This file does not edit, undraft, or merge a pull request.
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
    '--json', 'number,title,body,headRefName,headRefOid,isDraft,mergeable,state,files,statusCheckRollup,autoMergeRequest'
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

  if (pr.autoMergeRequest) {
    console.log(`[*] PR #${prNumber} still has GitHub auto-merge armed. This report does not change it.`);
  }
  if (pr.isDraft) {
    console.log(`[-] PR #${prNumber} is a draft. Leaving it as a draft.`);
  }
  console.log('[*] Report only. No title edit, undraft, branch update, or merge.');
  return { ok: true, approved: check.approved, score: check.score, isDraft: Boolean(pr.isDraft) };
}

export function sweepPullRequests() {
  const config = loadConfig();
  const repoProfiles = config.repoProfiles || {};
  const repos = Object.keys(repoProfiles).filter(r => r !== 'default');

  console.log(`\n===============================================================`);
  console.log(`   STARLIGHT PR REPORT (no merge)`);
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

if (cmd === 'report' || cmd === 'sweep') {
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
  report                 Read open pull requests and print a score. Does not merge.
  review <pr> [repo]     Read one pull request and print a score. Does not merge.
`);
}
