/**
 * Pure land decisions for the estate merge policy.
 * A pull request merges only when every gate below passes:
 *   1. A PASS from a different seat or model than the author, stamped with the
 *      reviewer and the exact head SHA. A self-review never counts.
 *   2. Auto-merge only for low-risk changes (docs, copy, patch-level dependency
 *      bumps) after that PASS and green checks. Money, publish, secrets, auth,
 *      licensing and the gate or policy files never auto-merge and need CTO.
 *   3. Jules opens drafts only and never merges.
 * Drafts stay drafts. Sessions this conductor did not start stay untouched.
 */

export const VALID_REVIEWERS = ['codex', 'claude-code', 'antigravity', 'cto'];

const HIGH_RISK = [
  /(^|\/)\.github\//, /(^|\/)tools\/merge-review\//, /(^|\/)tools\/jules-conductor\//,
  /(^|\/)docs\/merge-review\.md$/, /(^|\/)(codeowners|license|licence|notice)(\.[a-z]+)?$/,
  /licens/, /(pay|billing|stripe|checkout|price|pricing|invoice|money|wallet|marketplace)/,
  /(publish|release|deploy|npm-|vercel)/, /(secret|credential|token|\.env|\.pem$|\.key$)/,
  /(auth|login|session|oauth|permission|rbac|security)/,
];
const DOC_OR_COPY = /^(docs\/.*\.(md|mdx|txt)|content\/.*\.(md|mdx|txt)|[^/]+\.md)$/;
const DEP_MANIFEST = /(^|\/)(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$/;
const INSTRUCTION = /(^|\/)(agents|agents\.override|skill|skills|soul|rules|claude|gemini|grok)\.md$/;

export function normalizeSeat(value) {
  return String(value || '').trim().toLowerCase().replace(/[\s_]+/g, '-');
}

/** 'low' only for docs/copy, or manifests in a patch-level dependency bump. Else 'high'. */
export function classifyRisk(files, { depBump = '' } = {}) {
  const paths = (files || []).map((f) => String(typeof f === 'string' ? f : f?.path || f?.filename || ''));
  if (paths.length === 0 || paths.some((p) => !p)) return 'high';
  for (const raw of paths) {
    const p = raw.toLowerCase();
    if (p.includes('..') || p.includes('\\')) return 'high';
    if (DEP_MANIFEST.test(p)) {
      if (depBump !== 'patch') return 'high';
      continue;
    }
    if (HIGH_RISK.some((rx) => rx.test(p)) || INSTRUCTION.test(p)) return 'high';
    if (!DOC_OR_COPY.test(p)) return 'high';
  }
  return 'low';
}

/** A PASS counts only from a different, valid seat at the exact head SHA. */
export function reviewCounts(review, author, headSha) {
  if (!review || String(review.verdict || '').toUpperCase() !== 'PASS') return { ok: false, reason: 'no PASS' };
  const reviewer = normalizeSeat(review.reviewer);
  if (!VALID_REVIEWERS.includes(reviewer)) return { ok: false, reason: `reviewer ${reviewer || 'missing'} not valid` };
  if (!author || reviewer === normalizeSeat(author)) return { ok: false, reason: 'self-review never counts' };
  if (!headSha || String(review.headSha || '') !== String(headSha)) return { ok: false, reason: 'PASS not at exact head' };
  return { ok: true, reason: `PASS by ${reviewer} at ${headSha}` };
}

export function classifyChecks(rollup) {
  if (!Array.isArray(rollup) || rollup.length === 0) return 'none';
  let sawLive = false;
  for (const check of rollup) {
    const status = String(check?.status || '').toUpperCase();
    const conclusion = String(check?.conclusion || '').toUpperCase();
    const state = String(check?.state || '').toUpperCase();
    if (conclusion === 'CANCELLED' || status === 'CANCELLED' || conclusion === 'SKIPPED' || conclusion === 'NEUTRAL') {
      continue;
    }
    sawLive = true;
    if (['IN_PROGRESS', 'QUEUED', 'PENDING', 'WAITING', 'REQUESTED'].includes(status)) return 'pending';
    if (['PENDING', 'EXPECTED'].includes(state)) return 'pending';
    if (['FAILURE', 'TIMED_OUT', 'ACTION_REQUIRED', 'STALE', 'STARTUP_FAILURE'].includes(conclusion)) return 'failed';
    if (['FAILURE', 'ERROR'].includes(state)) return 'failed';
    if (conclusion !== 'SUCCESS' && state !== 'SUCCESS') return 'pending';
  }
  return sawLive ? 'green' : 'none';
}

export function matchPullRequest(prs, sessionId, trackToken = '') {
  const id = String(sessionId || '');
  const token = String(trackToken || '');
  const idOk = /^\d{10,}$/.test(id);
  if (!idOk && !token) return null;
  for (const pr of prs || []) {
    const hay = [pr?.title, pr?.headRefName, pr?.body, pr?.url].map((value) => String(value || '')).join('\n');
    if ((idOk && hay.includes(id)) || (token && hay.includes(token))) return pr;
  }
  return null;
}

export function isHold(holds, repo, number) {
  return (holds || []).some((hold) =>
    String(hold?.repo || '').toLowerCase() === String(repo || '').toLowerCase()
    && Number(hold?.number) === Number(number));
}

export function capacityAllowsDispatch(diskGiB, ramGiB, limits = {}) {
  const minDisk = limits.minDiskGiB ?? 50;
  const minRam = limits.minRamGiB ?? 4;
  const disk = Number(diskGiB);
  const ram = Number(ramGiB);
  if (!Number.isFinite(disk) || !Number.isFinite(ram)) {
    return { ok: false, reason: 'capacity unreadable' };
  }
  if (disk < minDisk || ram < minRam) {
    return { ok: false, reason: `disk ${disk.toFixed(1)} GiB, ram ${ram.toFixed(1)} GiB` };
  }
  return { ok: true, reason: `disk ${disk.toFixed(1)} GiB, ram ${ram.toFixed(1)} GiB` };
}

export function claimDaemonLock({ existingPid = null, existingAlive = false } = {}) {
  if (existingPid && existingAlive) {
    return { take: false, reason: `pid ${existingPid} is alive` };
  }
  if (existingPid) return { take: true, reason: 'stale pid replaced' };
  return { take: true, reason: 'no lock' };
}

export function decideLand(pr, options = {}) {
  const repo = String(pr?.repo || options.repo || '');
  const number = Number(pr?.number || 0);
  const sha = String(pr?.headRefOid || '');
  const protectedRepos = options.protectedRepos || [];

  const author = normalizeSeat(pr?.authorSeat || options.author);

  if (author === 'jules') return { decision: 'skip', reason: `${sha}:jules opens drafts only` };
  if (options.autoMerge !== true) return { decision: 'skip', reason: 'auto-merge off' };
  if (options.owned !== true) return { decision: 'skip', reason: 'session not owned' };
  const review = reviewCounts(options.review, author, sha);
  if (!review.ok) return { decision: 'skip', reason: `${sha}:awaiting review (${review.reason})` };
  if (classifyRisk(pr?.files, { depBump: options.depBump }) !== 'low') {
    return { decision: 'skip', reason: `${sha}:high risk, never auto-merges, needs CTO PASS and a human land` };
  }
  if (protectedRepos.some((name) => String(name).toLowerCase() === repo.toLowerCase())) {
    return { decision: 'skip', reason: `${sha}:protected repo` };
  }
  if (isHold(options.holds || [], repo, number)) return { decision: 'skip', reason: `${sha}:hold` };

  const state = String(pr?.state || '').toUpperCase();
  if (state === 'MERGED') return { decision: 'merged', reason: sha };
  if (state !== 'OPEN') return { decision: 'skip', reason: `${sha}:not open` };
  if (pr?.isDraft) return { decision: 'skip', reason: `${sha}:draft` };

  const defaultBranch = options.defaultBranch || 'main';
  if (String(pr?.baseRefName || '') !== defaultBranch) return { decision: 'skip', reason: `${sha}:stacked` };

  const checks = classifyChecks(pr?.statusCheckRollup);
  if (checks === 'none') return { decision: 'wait', reason: `${sha}:no live checks` };
  if (checks === 'pending') return { decision: 'wait', reason: `${sha}:checks pending` };
  if (checks === 'failed') return { decision: 'skip', reason: `${sha}:checks failed` };

  const mergeState = String(pr?.mergeStateStatus || '').toUpperCase();
  if (['UNKNOWN', 'BEHIND', 'BLOCKED', 'DIRTY'].includes(mergeState)) {
    return { decision: 'wait', reason: `${sha}:waiting ${mergeState}` };
  }
  if (mergeState !== 'CLEAN') return { decision: 'skip', reason: `${sha}:not clean (${mergeState})` };

  const mergeable = String(pr?.mergeable || '').toUpperCase();
  if (mergeable && mergeable !== 'MERGEABLE' && mergeable !== 'UNKNOWN') {
    return { decision: 'skip', reason: `${sha}:not mergeable` };
  }
  if (!sha) return { decision: 'skip', reason: 'missing head' };
  return { decision: 'merge', reason: sha };
}
