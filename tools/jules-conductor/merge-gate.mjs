/**
 * Pure land decisions for the Jules conductor.
 * A pull request merges only when every gate below passes.
 * Drafts stay drafts. Sessions this conductor did not start stay untouched.
 */

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

  if (options.autoMerge !== true) return { decision: 'skip', reason: 'auto-merge off' };
  if (options.owned !== true) return { decision: 'skip', reason: 'session not owned' };
  if (options.accepted !== true) return { decision: 'skip', reason: `${sha}:awaiting review` };
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
