// A Cloudflare Workflow per claimed task. Each step is retried and checkpointed by the platform,
// so a deploy or an eviction resumes the run where it stopped instead of starting the agent again.

import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from 'cloudflare:workers';
import { GithubApp } from '../../starlight-control-plane/src/github.ts';
import { ControlPlane } from './controlplane.ts';
import type { Harness } from './policy.ts';
import { runTask, type RunParams, type SandboxApi, type Step } from './run.ts';
import type { HarnessSandbox } from './sandbox.ts';

export interface WorkflowEnv {
  SANDBOX: DurableObjectNamespace<HarnessSandbox>;
  CONTROL_PLANE: Fetcher;
  CP_TOKEN_CLAUDE: string;
  CP_TOKEN_CODEX: string;
  GITHUB_APP_ID: string;
  GITHUB_APP_PRIVATE_KEY: string;
}

const STEP_RETRIES = { retries: { limit: 3, delay: '10 seconds', backoff: 'exponential' as const }, timeout: '10 minutes' };

export function queueFor(env: WorkflowEnv, harness: Harness): ControlPlane {
  return new ControlPlane(env.CONTROL_PLANE, harness === 'claude' ? env.CP_TOKEN_CLAUDE : env.CP_TOKEN_CODEX);
}

export class TaskRun extends WorkflowEntrypoint<WorkflowEnv, RunParams> {
  async run(event: WorkflowEvent<RunParams>, step: WorkflowStep) {
    const p = event.payload;
    const sandbox = this.env.SANDBOX.getByName(`task:${p.task.id}:${p.task.attempt}`);
    const api: SandboxApi = {
      clone: (owner, repo, ref, newBranch) => sandbox.clone(owner, repo, ref, newBranch, p.harness),
      startTask: (harness, prompt) => sandbox.startTask(harness, prompt),
      readTask: (harness) => sandbox.readTask(harness),
      commitAndPush: (branch, message, deadline) => sandbox.commitAndPush(branch, message, deadline),
      destroy: () => sandbox.destroy(),
    };
    const durable: Step = {
      do: (name, fn) => step.do(name, STEP_RETRIES, fn as () => Promise<any>),
      sleep: (name, duration) => step.sleep(name, duration as `${number} seconds`),
    };
    return runTask(p, durable, api, new GithubApp(this.env.GITHUB_APP_ID, this.env.GITHUB_APP_PRIVATE_KEY), queueFor(this.env, p.harness));
  }
}
