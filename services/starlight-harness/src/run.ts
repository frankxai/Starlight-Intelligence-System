// One claimed task, start to finish, as durable steps. Written against a two-method step
// interface so the Workflow runs it in production and node --test runs it with a fake.

import { AGENT_BRANCH, buildPrompt, newBranchName, type ClaimedTask, type Harness, type Plan } from './policy.ts';

export interface Step {
  do<T>(name: string, fn: () => Promise<T>): Promise<T>;
  sleep(name: string, duration: string): Promise<void>;
}

export type SandboxState =
  | { state: 'none' | 'running' | 'lost' }
  | { state: 'succeeded'; result: string }
  | { state: 'failed'; error: string };

export interface SandboxApi {
  clone(owner: string, repo: string, ref: string, newBranch: string | null): Promise<void>;
  startTask(harness: Harness, prompt: string): Promise<'started' | 'busy'>;
  readTask(harness: Harness): Promise<SandboxState>;
  // Commits anything left uncommitted, pushes HEAD to the branch, returns the pushed SHA or null
  // when the agent changed nothing.
  commitAndPush(branch: string, message: string, deadline: number): Promise<string | null>;
  destroy(): Promise<void>;
}

export interface GithubCalls {
  prState(owner: string, repo: string, number: number, codexBot: string): Promise<{ branch: string; headSha: string; open: boolean }>;
  defaultBranch(owner: string, repo: string): Promise<string>;
  findPullRequest(owner: string, repo: string, head: string): Promise<string | null>;
  openDraftPullRequest(owner: string, repo: string, head: string, base: string, title: string, body: string): Promise<string>;
  comment(owner: string, repo: string, number: number, body: string): Promise<string | void>;
  hasComment(owner: string, repo: string, number: number, marker: string, sinceIso: string): Promise<boolean>;
  // Fetching or refreshing the installation token costs two requests; doing it inside the timed
  // lookup leaves the write itself as one request within its 20-second timeout.
  installationToken(owner: string, repo: string): Promise<string>;
}

export interface QueueCalls {
  heartbeat(id: string, fence: string): Promise<{ expiresAt: number }>;
  complete(id: string, fence: string, resultRef: string): Promise<unknown>;
  release(id: string, fence: string, reason: string, terminal?: boolean): Promise<unknown>;
}

export interface RunParams {
  task: ClaimedTask;
  fence: string;
  harness: Harness;
  plan: Plan;
  codexBot: string;
}

export const CHECK_EVERY = '60 seconds';
const MAX_COMMENT = 60_000;
// Minutes of the time box kept back for push, PR and completion, so the lease is still alive
// when the results go out.
export const FINALIZE_MINUTES = 5;
// A GitHub call aborts after 20 seconds, so one may start only while that much lease is left.
const GITHUB_CALL_MS = 20_000;

// Throws, so the step retries and renews the lease, when the next call could finish past it.
export function before(deadline: number): void {
  if (Date.now() + GITHUB_CALL_MS > deadline) throw new Error('the lease would expire during the next GitHub call');
}

// The marker search may page; it must not eat the time the write itself needs.
export async function within<T>(deadline: number, work: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const stop = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('the lease would expire before the check finished')), Math.max(0, deadline - GITHUB_CALL_MS - Date.now()));
  });
  try {
    return await Promise.race([work, stop]);
  } finally {
    clearTimeout(timer);
  }
}
const LEASE_MARGIN_MS = 30_000;
const MIN_WRITE_MS = 60_000;
// The prompt asks for the verdict as the last line, so a quoted "VERDICT: PASS" earlier in the text
// does not count.
export function finalVerdict(text: string): 'PASS' | 'FAIL' | null {
  const last = text.trim().split('\n').pop()?.trim() ?? '';
  const m = /^\**VERDICT:\s*(PASS|FAIL)\**$/.exec(last);
  return m ? (m[1] as 'PASS' | 'FAIL') : null;
}

export type RunResult = { done: string } | { released: string };

export async function runTask(p: RunParams, step: Step, sandbox: SandboxApi, gh: GithubCalls, queue: QueueCalls): Promise<RunResult> {
  const { task, fence, harness, plan } = p;
  const release = async (reason: string, terminal = false): Promise<RunResult> => {
    await step.do('release', async () => {
      await sandbox.destroy().catch(() => undefined);
      // A lost lease means someone else owns the task now; there is nothing left to release.
      await queue.release(task.id, fence, reason, terminal).catch(() => undefined);
    });
    return { released: reason };
  };

  const stopLost = async (): Promise<RunResult> => {
    await step.do('stop after lost lease', () => sandbox.destroy());
    return { released: 'lease lost' };
  };

  const setup = await step.do('prepare sandbox', async () => {
    if (plan.prNumber !== null) {
      const pr = await gh.prState(plan.owner, plan.repo, plan.prNumber, p.codexBot);
      if (!pr.open) return { skip: `PR #${plan.prNumber} is closed` };
      // The gateway lets a sandbox push only agent branches, so a fix on a human's branch (or main)
      // would fail at push time and retry until the lease ran out. Refuse it here, once, before
      // any agent work, and terminally: no retry can change the branch name. A review pushes nothing
      // and may run on any branch.
      if (plan.mode !== 'review' && !AGENT_BRANCH.test(`refs/heads/${pr.branch}`)) {
        return { skip: `PR #${plan.prNumber} is on ${pr.branch}, not an agent branch; the Cloudflare harness pushes only agent branches, so it will not take this fix`, terminal: true };
      }
      await sandbox.clone(plan.owner, plan.repo, pr.branch, null);
      return { branch: pr.branch, base: null as string | null, headSha: pr.headSha };
    }
    const base = await gh.defaultBranch(plan.owner, plan.repo);
    const branch = newBranchName(harness, task.id);
    await sandbox.clone(plan.owner, plan.repo, base, branch);
    return { branch, base, headSha: null as string | null };
  });
  if ('skip' in setup) return release(setup.skip as string, 'terminal' in setup && setup.terminal === true);

  // The sandbox belongs to this task alone, so "busy" can only mean a retried start already began.
  await step.do('start agent', () => sandbox.startTask(harness, buildPrompt(task, plan, setup.branch)));

  // One check a minute until the agent stops or the task time box runs out. Each check renews the
  // lease, so a run that stops checking frees the task for another worker within 15 minutes.
  let last: SandboxState = { state: 'running' };
  const checks = Math.max(1, task.maxMinutes - FINALIZE_MINUTES);
  for (let i = 0; i < checks; i++) {
    await step.sleep(`wait ${i}`, CHECK_EVERY);
    const check = await step.do(`check ${i}`, async () => {
      const state = await sandbox.readTask(harness);
      try {
        await queue.heartbeat(task.id, fence);
      } catch {
        return { state: 'lease-lost' as const };
      }
      return state;
    });
    if (check.state === 'lease-lost') return stopLost();
    last = check as SandboxState;
    if (last.state !== 'running') break;
  }

  if (last.state === 'running') return release(`no result within ${checks} minutes`);
  if (last.state !== 'succeeded') return release(last.state === 'failed' ? `agent failed: ${last.error}` : `agent ${last.state}`);
  const summary = last.result;
  if (plan.mode === 'review' && !finalVerdict(summary)) return release('the review did not end with a VERDICT line');

  // Every step that changes GitHub renews the lease inside the same step, so a retried attempt
  // renews again before it writes. If another worker owns the task now, the step writes nothing.
  // The write gets a deadline well inside the renewed lease and must finish by it: the push is killed
  // at the deadline and GitHub API calls time out after 20 seconds, so no write outlives the lease.
  const LOST = { lost: true } as const;
  const leased = async <T>(write: (deadline: number) => Promise<T>): Promise<T | typeof LOST> => {
    let expiresAt: number;
    try {
      expiresAt = (await queue.heartbeat(task.id, fence)).expiresAt;
    } catch {
      return LOST;
    }
    const deadline = expiresAt - LEASE_MARGIN_MS;
    if (deadline - Date.now() < MIN_WRITE_MS) return LOST;
    return write(deadline);
  };
  const isLost = (r: unknown): r is typeof LOST => typeof r === 'object' && r !== null && (r as { lost?: unknown }).lost === true;

  let resultRef: string;
  if (plan.mode === 'review') {
    const posted = await step.do('post review', () => leased(async (deadline) => {
      // GitHub has no idempotency key for comments; the marker lets a retried step find the one it posted.
      const marker = `<!-- starlight-harness:${task.id}:${task.attempt} -->`;
      const since = new Date(Date.now() - 6 * 3600_000).toISOString();
      const prUrl = `https://github.com/${plan.owner}/${plan.repo}/pull/${plan.prNumber}`;
      if (await within(deadline, gh.hasComment(plan.owner, plan.repo, plan.prNumber!, marker, since))) return prUrl;
      await within(deadline, gh.installationToken(plan.owner, plan.repo));
      before(deadline);
      const header = `Review by the Starlight ${harness} harness (Cloudflare sandbox) at ${setup.headSha}, for queue task \`${task.id}\`.\n\n`;
      const url = await gh.comment(plan.owner, plan.repo, plan.prNumber!, `${header}${summary.slice(0, MAX_COMMENT)}\n\n${marker}`);
      if (!url) throw new Error('GitHub accepted the review comment but returned no URL');
      return url;
    }));
    if (isLost(posted)) return stopLost();
    resultRef = posted;
  } else {
    const sha = await step.do('push', () => leased((deadline) => sandbox.commitAndPush(setup.branch, `${task.title}\n\nQueue task ${task.id}, ${harness} in a Cloudflare sandbox.`, deadline)));
    if (isLost(sha)) return stopLost();
    if (!sha) return release('the agent changed nothing');
    if (plan.mode === 'new-branch') {
      const pr = await step.do('open draft PR', () => leased(async (deadline) => {
        // A retry after GitHub created the PR but before the step was recorded finds that PR.
        const existing = await within(deadline, gh.findPullRequest(plan.owner, plan.repo, setup.branch));
        if (existing) return existing;
        await within(deadline, gh.installationToken(plan.owner, plan.repo));
        before(deadline);
        return gh.openDraftPullRequest(plan.owner, plan.repo, setup.branch, setup.base!, task.title,
          `Done when: ${task.doneCondition}\n\nQueue task \`${task.id}\`, made by ${harness} in a Cloudflare sandbox.\n\n${summary.slice(0, MAX_COMMENT)}`);
      }));
      if (isLost(pr)) return stopLost();
      resultRef = pr;
    } else {
      resultRef = `https://github.com/${plan.owner}/${plan.repo}/commit/${sha}`;
    }
  }

  await step.do('complete', async () => {
    await queue.complete(task.id, fence, resultRef);
    await sandbox.destroy().catch(() => undefined);
  });
  return { done: resultRef };
}
