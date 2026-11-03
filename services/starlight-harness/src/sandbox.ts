// One Linux sandbox per task, as a Durable Object that owns a container. Adapted from Cloudflare's
// "Build a coding agent runner" (Sandbox SDK 1.0, 2026-10-22): the agent runs detached in its own
// process group, writes its pid and exit code to files, and the object reads those to report.

import { Files, SandboxFileError } from '@cloudflare/sandbox';
import { DurableObject } from 'cloudflare:workers';
import { agentCommand, agentEnv, EVENTS_PATH, LAST_MESSAGE_PATH, outcome, STDERR_PATH, TASK_DIR, type GatewayVars } from './agents.ts';
import type { Harness, SandboxScope } from './policy.ts';
import type { SandboxState } from './run.ts';

const REPO_DIR = '/workspace/repo';
const EXIT_PATH = `${TASK_DIR}/exit-code`;
const PID_PATH = `${TASK_DIR}/pid`;
const INACTIVITY_MS = 30 * 60 * 1000;
const TASK_KEY = 'task';
const BASE_KEY = 'base';
const REPO_KEY = 'repo';
const PUSHED_KEY = 'pushed';
const BUNDLE_PATH = `${TASK_DIR}/out.bundle`;
const MAX_BUNDLE_BYTES = 50 * 1024 * 1024;

const CA = '/etc/cloudflare/certs/cloudflare-containers-ca.crt';
// Outbound intercepts every HTTPS request, so its CA replaces the system trust store.
const TRUST = { NODE_EXTRA_CA_CERTS: CA, GIT_SSL_CAINFO: CA, CURL_CA_BUNDLE: CA, SSL_CERT_FILE: CA };

const TASK_SCRIPT = `dir=$1; shift
setsid sh -c 'echo "$$ $(cat /proc/sys/kernel/random/boot_id)" >"$0/pid"; exec "$@"' \\
	"$dir" "$@" >"$dir/stdout.log" 2>"$dir/stderr.log"
echo "$?" >"$dir/exit-code.tmp" && mv "$dir/exit-code.tmp" "$dir/exit-code"`;

const RUNNING_SCRIPT = `read -r pid boot <"$1" &&
	[ "$boot" = "$(cat /proc/sys/kernel/random/boot_id)" ] &&
	kill -0 "$pid"`;

export interface SandboxEnv {
  AI_GATEWAY_ACCOUNT_ID: string;
  AI_GATEWAY_ID: string;
  CLAUDE_MODEL: string;
  CODEX_MODEL: string;
}

export class HarnessSandbox extends DurableObject<SandboxEnv> {
  private container: Container;
  private files: Files;
  private setup: Promise<void> | undefined;
  private harness: Harness | undefined;

  constructor(ctx: DurableObjectState, env: SandboxEnv) {
    super(ctx, env);
    if (!ctx.container) throw new Error('No container is configured');
    this.container = ctx.container;
    this.files = new Files(this.container);
    if (this.container.running) void ctx.blockConcurrencyWhile(() => this.container.setInactivityTimeout(INACTIVITY_MS));
  }

  private vars(harness: Harness): GatewayVars {
    return {
      account: this.env.AI_GATEWAY_ACCOUNT_ID,
      gateway: this.env.AI_GATEWAY_ID,
      model: harness === 'claude' ? this.env.CLAUDE_MODEL : this.env.CODEX_MODEL,
    };
  }

  async clone(owner: string, repo: string, ref: string, newBranch: string | null, harness: Harness): Promise<void> {
    // The repository is fixed before the container starts, so the gateway is scoped from the first request.
    this.ctx.storage.kv.put(REPO_KEY, `${owner}/${repo}`);
    await this.start(harness);
    // A retried step finds the clone already there.
    if (this.ctx.storage.kv.get(BASE_KEY) !== undefined) return;
    // A clone or checkout that failed half way leaves a directory the next attempt cannot clone into.
    await this.mustRun(['rm', '-rf', REPO_DIR], '/workspace');
    await this.mustRun(['git', 'clone', '--depth', '50', '--branch', ref, '--', `https://github.com/${owner}/${repo}.git`, REPO_DIR], '/workspace');
    if (newBranch) await this.mustRun(['git', 'checkout', '-b', newBranch], REPO_DIR);
    // The commit the agent starts from; anything after it is the agent's work.
    this.ctx.storage.kv.put(BASE_KEY, (await this.mustRun(['git', 'rev-parse', 'HEAD'], REPO_DIR)).trim());
  }

  startTask(harness: Harness, prompt: string): Promise<'started' | 'busy'> {
    return this.ctx.blockConcurrencyWhile(async () => {
      await this.start(harness);
      // This sandbox runs one task once. A retried start, even after the agent already finished,
      // must not wipe its output and run it again.
      if (this.ctx.storage.kv.get(TASK_KEY) !== undefined) return 'busy';
      await this.files.remove(TASK_DIR, { recursive: true, force: true });
      await this.files.mkdir(TASK_DIR);
      await this.container.exec(['/bin/sh', '-c', TASK_SCRIPT, 'agent', TASK_DIR, ...agentCommand(harness, this.vars(harness), prompt)], {
        cwd: REPO_DIR, env: { ...TRUST, ...agentEnv(harness, this.vars(harness)) }, stdout: 'ignore', stderr: 'ignore',
      });
      this.ctx.storage.kv.put(TASK_KEY, harness);
      return 'started';
    });
  }

  async readTask(harness: Harness): Promise<SandboxState> {
    if (!this.container.running) return { state: this.ctx.storage.kv.get(TASK_KEY) === undefined ? 'none' : 'lost' };
    return this.status(harness);
  }

  // The agent's container never gets push rights: a process it left behind could use them. The
  // runner bundles the new commits, throws that container away, and pushes from a fresh container
  // where only the runner's own commands have ever run.
  async commitAndPush(branch: string, message: string): Promise<string | null> {
    const pushed = this.ctx.storage.kv.get(PUSHED_KEY) as string | undefined;
    if (pushed) return pushed;
    const base = this.ctx.storage.kv.get(BASE_KEY) as string | undefined;
    if (!base || !this.container.running) throw new Error('the agent sandbox is gone; its work cannot be recovered');
    const repo = this.repo();
    const harness = this.harness ?? 'claude';

    await this.mustRun(['git', 'add', '-A'], REPO_DIR);
    if ((await this.run(['git', 'diff', '--cached', '--quiet'], REPO_DIR)).exitCode !== 0) {
      await this.mustRun(['git', 'commit', '-m', message], REPO_DIR, { ...TRUST, ...agentEnv('codex', this.vars('codex')) });
    }
    if ((await this.mustRun(['git', 'rev-list', '--count', `${base}..HEAD`], REPO_DIR)).trim() === '0') return null;
    const sha = (await this.mustRun(['git', 'rev-parse', 'HEAD'], REPO_DIR)).trim();
    await this.mustRun(['git', 'bundle', 'create', BUNDLE_PATH, `${base}..HEAD`], REPO_DIR);
    const bundle = new Uint8Array(await (await this.files.readFile(BUNDLE_PATH)).arrayBuffer());
    if (bundle.byteLength > MAX_BUNDLE_BYTES) throw new Error(`the agent's commits are ${bundle.byteLength} bytes; the limit is ${MAX_BUNDLE_BYTES}`);

    await this.container.destroy();
    this.setup = undefined;
    this.ctx.storage.kv.put(REPO_KEY, repo);
    await this.start(harness);
    try {
      const work = '/workspace/push';
      await this.mustRun(['rm', '-rf', work], '/workspace');
      await this.mustRun(['git', 'init', '--quiet', work], '/workspace');
      await this.mustRun(['git', 'remote', 'add', 'origin', `https://github.com/${repo}.git`], work);
      // The bundle needs its base commit present; GitHub serves a reachable commit by SHA.
      await this.mustRun(['git', 'fetch', '--quiet', '--depth', '1', 'origin', base], work);
      await this.files.writeFile(`${work}/out.bundle`, bundle);
      await this.mustRun(['git', 'bundle', 'verify', 'out.bundle'], work);
      await this.mustRun(['git', 'fetch', '--quiet', 'out.bundle', 'HEAD'], work);
      const fetched = (await this.mustRun(['git', 'rev-parse', 'FETCH_HEAD'], work)).trim();
      if (fetched !== sha) throw new Error(`bundle head ${fetched} is not the agent's commit ${sha}`);
      // Only now, in a container that never ran agent code, may the gateway accept a push, and
      // only to this branch. No --force: GitHub refuses anything that is not a fast-forward.
      await this.scope({ repo, pushBranch: branch });
      await this.mustRun(['git', 'push', 'origin', `${sha}:refs/heads/${branch}`], work);
      this.ctx.storage.kv.put(PUSHED_KEY, sha);
      return sha;
    } finally {
      // Nothing more runs in this sandbox; destroying it is the surest way to close the push scope.
      await this.container.destroy().catch(() => undefined);
      this.setup = undefined;
    }
  }

  async destroy(): Promise<void> {
    this.ctx.storage.kv.delete(TASK_KEY);
    this.ctx.storage.kv.delete(BASE_KEY);
    this.ctx.storage.kv.delete(REPO_KEY);
    this.ctx.storage.kv.delete(PUSHED_KEY);
    if (this.container.running) await this.container.destroy();
  }

  private async start(harness: Harness): Promise<void> {
    if (this.setup === undefined || !this.container.running || this.harness !== harness) {
      this.harness = harness;
      this.setup = this.setUp(harness).catch((err) => {
        this.setup = undefined;
        throw err;
      });
    }
    await this.setup;
  }

  private async setUp(harness: Harness): Promise<void> {
    if (!this.container.running) {
      // A new container has no clone and no running agent.
      this.ctx.storage.kv.delete(TASK_KEY);
      this.ctx.storage.kv.delete(BASE_KEY);
      this.container.start({ image: this.container.images[harness], instance: 'standard-1', enableInternet: false });
    }
    try {
      await this.scope({ repo: this.repo(), pushBranch: null });
      await this.container.setInactivityTimeout(INACTIVITY_MS);
    } catch (err) {
      // No command may run before interception is in place; the next request starts afresh.
      await this.container.destroy();
      throw err;
    }
  }

  private repo(): string {
    const repo = this.ctx.storage.kv.get(REPO_KEY) as string | undefined;
    if (!repo) throw new Error('no repository recorded for this sandbox');
    return repo;
  }

  // Registering again replaces the earlier handler, and open connections pick it up at once.
  private async scope(props: SandboxScope): Promise<void> {
    const outbound = this.ctx.exports.Outbound({ props });
    await this.container.interceptAllOutboundHttp(outbound);
    await this.container.interceptOutboundHttps('*', outbound);
  }

  private async status(harness: Harness): Promise<SandboxState> {
    const exit = await this.optional(EXIT_PATH);
    if (exit !== undefined) return this.finish(harness, Number.parseInt(exit, 10));
    if ((await this.optional(PID_PATH)) === undefined) {
      return { state: this.ctx.storage.kv.get(TASK_KEY) === undefined ? 'none' : 'running' };
    }
    if ((await this.run(['/bin/sh', '-c', RUNNING_SCRIPT, 'probe', PID_PATH], '/')).exitCode === 0) return { state: 'running' };
    // The agent can finish between the two reads.
    const late = await this.optional(EXIT_PATH);
    return late !== undefined ? this.finish(harness, Number.parseInt(late, 10)) : { state: 'lost' };
  }

  private async finish(harness: Harness, exitCode: number): Promise<SandboxState> {
    return outcome(harness, exitCode, (await this.optional(EVENTS_PATH)) ?? '', (await this.optional(STDERR_PATH)) ?? '', await this.optional(LAST_MESSAGE_PATH));
  }

  private async optional(path: string): Promise<string | undefined> {
    try {
      return await (await this.files.readFile(path)).text();
    } catch (err) {
      if (SandboxFileError.is(err) && err.code === 'ENOENT') return undefined;
      throw err;
    }
  }

  private async run(command: string[], cwd: string, env: Record<string, string> = {}) {
    const proc = await this.container.exec(command, { cwd, env });
    const out = await proc.output();
    const dec = new TextDecoder();
    return { exitCode: out.exitCode, stdout: dec.decode(out.stdout), stderr: dec.decode(out.stderr) };
  }

  private async mustRun(command: string[], cwd: string, env: Record<string, string> = TRUST): Promise<string> {
    const r = await this.run(command, cwd, env);
    if (r.exitCode !== 0) throw new Error(`${command.slice(0, 2).join(' ')} failed (${r.exitCode}): ${r.stderr.slice(-500)}`);
    return r.stdout;
  }
}
