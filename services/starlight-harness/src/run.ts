// One claimed task, start to finish, as durable steps. Written against a two-method step
// interface so the Workflow runs it in production and node --test runs it with a fake.

import { buildPrompt, newBranchName, type ClaimedTask, type Harness, type Plan } from './policy.ts';

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
  commitAndPush(branch: string, message: string): Promise<string | null>;
  destroy(): Promise<void>;
}

export interface GithubCalls {
  prState(owner: string, repo: string, number: number, codexBot: string): Promise<{ branch: string; headSha: string; open: boolean }>;
  defaultBranch(owner: string, repo: string): Promise<string>;
  findPullRequest(owner: string, repo: string, head: string): Promise<string | null>;
  openDraftPullRequest(owner: string, repo: string, head: string, base: string, title: string, body: string): Promise<string>;
  comment(owner: string, repo: string, number: number, body: string): Promise<string | void>;
  hasComment(owner: string, repo: string, number: number, marker: string, sinceIso: string): Promise<boolean>;
}

export interface QueueCalls {
  heartbeat(id: string, fence: string): Promise<unknown>;
  complete(id: string, fence: string, resultRef: string): Promise<unknown>;
  release(id: string, fence: string, reason: string): Promise<unknown>;
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
const VERDICT = /VERDICT:\s*(PASS|FAIL)\b/;

export type RunResult = { done: string } | { released: string };

export async function runTask(p: RunParams, step: Step, sandbox: SandboxApi, gh: GithubCalls, queue: QueueCalls): Promise<RunResult> {
  const { task, fence, harness, plan } = p;
  const release = async (reason: string): Promise<RunResult> => {
    await step.do('release', async () => {
      await sandbox.destroy().catch(() => undefined);
      // A lost lease means someone else owns the task now; there is nothing left to release.
      await queue.release(task.id, fence, reason).catch(() => undefined);
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
      await sandbox.clone(plan.owner, plan.repo, pr.branch, null);
      return { branch: pr.branch, base: null as string | null, headSha: pr.headSha };
    }
    const base = await gh.defaultBranch(plan.owner, plan.repo);
    const branch = newBranchName(harness, task.id);
    await sandbox.clone(plan.owner, plan.repo, base, branch);
    return { branch, base, headSha: null as string | null };
  });
  if ('skip' in setup) return release(setup.skip as string);

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
  if (plan.mode === 'review' && !VERDICT.test(summary)) return release('the review ended without a VERDICT line');

  // Each step that changes GitHub renews the lease first. If another worker owns the task now,
  // this run stops instead of writing over its work.
  const renewed = async (name: string) => step.do(`renew before ${name}`, async () => {
    try {
      await queue.heartbeat(task.id, fence);
      return true;
    } catch {
      return false;
    }
  });

  let resultRef: string;
  if (plan.mode === 'review') {
    if (!(await renewed('review'))) return stopLost();
    resultRef = await step.do('post review', async () => {
      // GitHub has no idempotency key for comments; the marker lets a retried step find the one it posted.
      const marker = `<!-- starlight-harness:${task.id}:${task.attempt} -->`;
      const since = new Date(Date.now() - 6 * 3600_000).toISOString();
      const prUrl = `https://github.com/${plan.owner}/${plan.repo}/pull/${plan.prNumber}`;
      if (await gh.hasComment(plan.owner, plan.repo, plan.prNumber!, marker, since)) return prUrl;
      const header = `Review by the Starlight ${harness} harness (Cloudflare sandbox) at ${setup.headSha}, for queue task \`${task.id}\`.\n\n`;
      const url = await gh.comment(plan.owner, plan.repo, plan.prNumber!, `${header}${summary.slice(0, MAX_COMMENT)}\n\n${marker}`);
      if (!url) throw new Error('GitHub accepted the review comment but returned no URL');
      return url;
    });
  } else {
    if (!(await renewed('push'))) return stopLost();
    const sha = await step.do('push', () => sandbox.commitAndPush(setup.branch, `${task.title}\n\nQueue task ${task.id}, ${harness} in a Cloudflare sandbox.`));
    if (!sha) return release('the agent changed nothing');
    if (plan.mode === 'new-branch') {
      if (!(await renewed('PR'))) return stopLost();
      resultRef = await step.do('open draft PR', async () =>
        // A retry after GitHub created the PR but before the step was recorded finds that PR.
        (await gh.findPullRequest(plan.owner, plan.repo, setup.branch)) ?? gh.openDraftPullRequest(plan.owner, plan.repo, setup.branch, setup.base!, task.title,
          `Done when: ${task.doneCondition}\n\nQueue task \`${task.id}\`, made by ${harness} in a Cloudflare sandbox.\n\n${summary.slice(0, MAX_COMMENT)}`));
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
