// The Starlight harness: Claude Code and Codex running in Cloudflare sandboxes as 24/7 workers on
// the control-plane queue. Every minute the cron claims work up to a per-harness limit and starts
// one durable Workflow per task. Nothing here runs on a laptop.

import { outboundContext, type OutboundEnv } from './outbound.ts';
import { harnessConfig, instanceId, type HarnessConfig } from './config.ts';
import { planFor, type Harness } from './policy.ts';
import { queueFor, type WorkflowEnv } from './workflow.ts';
import type { RunParams } from './run.ts';

export { HarnessSandbox } from './sandbox.ts';
export { Outbound } from './outbound.ts';
export { TaskRun } from './workflow.ts';

interface Env extends WorkflowEnv, OutboundEnv {
  TASK_RUN: Workflow<RunParams>;
  // JSON {"claude": {"agentId": "cf-claude", "max": 2, "kinds": ["review","fix","build"]}, ...}
  HARNESSES: string;
  CODEX_BOT: string;
}

async function fill(env: Env, harness: Harness, cfg: HarnessConfig): Promise<string[]> {
  const queue = queueFor(env, harness);
  const started: string[] = [];
  let held = await queue.leasesHeldBy(cfg.agentId);
  const repos = outboundContext(env).repos;
  while (held < cfg.max) {
    const claim = await queue.claim(cfg.kinds);
    if (!claim) break;
    held++;
    const plan = planFor(claim.task, repos);
    if (!plan) {
      await queue.release(claim.task.id, claim.fence, 'repository not opted in for the Cloudflare harness, or review task without a PR');
      continue;
    }
    try {
      await env.TASK_RUN.create({
        id: instanceId(claim.task.id, claim.task.attempt),
        params: { task: claim.task, fence: claim.fence, harness, plan, codexBot: env.CODEX_BOT },
      });
      started.push(claim.task.id);
    } catch (err) {
      await queue.release(claim.task.id, claim.fence, `workflow did not start: ${(err as Error).message}`);
    }
  }
  return started;
}

export default {
  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/health') return Response.json({ ok: true, service: 'starlight-harness' });
    return new Response('not found', { status: 404 });
  },
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    const harnesses = harnessConfig(env.HARNESSES);
    ctx.waitUntil(Promise.allSettled(
      (Object.entries(harnesses) as [Harness, HarnessConfig][]).map(([h, cfg]) => fill(env, h, cfg).catch((err) => {
        console.warn('harness fill failed', { harness: h, error: String((err as Error)?.message ?? err) });
        return [];
      })),
    ));
  },
} satisfies ExportedHandler<Env>;
