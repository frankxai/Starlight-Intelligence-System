// What a sandbox may reach and what a task asks of it. Pure, so node --test covers every rule.
// The sandbox holds no credential: the Outbound entrypoint adds them to the requests allowed here.

export type Harness = 'claude' | 'codex';

export interface ClaimedTask {
  id: string;
  title: string;
  doneCondition: string;
  repo: string;
  paths: string[];
  kind: string;
  attempt: number;
  maxMinutes: number;
}

export interface Plan {
  owner: string;
  repo: string;
  mode: 'review' | 'pr-branch' | 'new-branch';
  prNumber: number | null;
}

// Branch names agents may push to. The default branch, release branches and anything a human
// works on are refused at the network edge, whatever the agent inside the sandbox tries.
export const AGENT_BRANCH = /^refs\/heads\/(agent\/|codex\/|claude\/|jules-|sentinel-)[\w./-]+$/;

const PR_URL = /https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/pull\/(\d+)/;

// GitHub names are case-insensitive, so both the queue's repo and REPOS are compared lowercased.
export function planFor(task: ClaimedTask, repos: string[]): Plan | null {
  const want = String(task.repo ?? '').trim().toLowerCase();
  const configured = repos.find((r) => r.split('/')[1]?.toLowerCase() === want);
  if (!want || !configured) return null;
  const [owner, repo] = configured.split('/');
  const pr = PR_URL.exec(task.doneCondition);
  const prNumber = pr && pr[1].toLowerCase() === owner.toLowerCase() && pr[2].toLowerCase() === repo.toLowerCase() ? Number(pr[3]) : null;
  if (task.kind === 'review') return prNumber ? { owner, repo, mode: 'review', prNumber } : null;
  return { owner, repo, mode: prNumber ? 'pr-branch' : 'new-branch', prNumber };
}

export function newBranchName(harness: Harness, taskId: string): string {
  return `agent/cf-${harness}/${taskId.replace(/[^\w.-]+/g, '-').replace(/^[.-]+/, '').slice(0, 60)}`;
}

export function buildPrompt(task: ClaimedTask, plan: Plan, branch: string): string {
  const where = `${plan.owner}/${plan.repo}`;
  const rules = [
    'Read AGENTS.md and CLAUDE.md in the repository root first, if they exist, and follow them.',
    'Change only what the task needs. Do not edit CI workflows, deploy configuration, secrets or lockfiles unless the task names them.',
    'Run the repository\'s own tests, lint or type-check for what you changed when the tools are already installed. You have no internet access beyond GitHub and the package registries.',
    'Do not push and do not open pull requests; the runner does that after you finish.',
    'Finish with a short summary: what you changed, what you ran and its result, and what you could not verify.',
  ];
  if (plan.mode === 'review') {
    return [
      `Review pull request #${plan.prNumber} in ${where}; the checkout is its head.`,
      `Task: ${task.title}`,
      `Done when: ${task.doneCondition}`,
      'Do not change any file. Compare the branch with its merge base and report every finding at once, each with file:line and a P0-P3 severity, then the line "VERDICT: PASS" or "VERDICT: FAIL". If you find nothing blocking, say "no blocking findings".',
      rules[0],
    ].join('\n\n');
  }
  return [
    `You are working in ${where} on branch ${branch}.`,
    `Task: ${task.title}`,
    `Done when: ${task.doneCondition}`,
    ...rules,
  ].join('\n\n');
}

export interface PushCommand {
  old: string;
  new: string;
  ref: string;
}

export const ZERO_SHA = '0'.repeat(40);

// git-receive-pack bodies start with pkt-lines "<old> <new> <ref>" (the first also carries
// capabilities after a NUL) and end the command list with a flush packet "0000".
export function pushedRefs(body: Uint8Array): { refs: string[]; deletes: boolean; commands: PushCommand[] } | null {
  const text = new TextDecoder('latin1');
  const refs: string[] = [];
  const commands: PushCommand[] = [];
  let deletes = false;
  let at = 0;
  while (at + 4 <= body.length) {
    const len = parseInt(text.decode(body.subarray(at, at + 4)), 16);
    if (Number.isNaN(len)) return null;
    if (len === 0) return { refs, deletes, commands };
    if (len < 4 || at + len > body.length) return null;
    const line = text.decode(body.subarray(at + 4, at + len)).split('\0')[0].replace(/\n$/, '');
    const m = /^([0-9a-f]{40}) ([0-9a-f]{40}) (\S+)$/.exec(line);
    if (!m) return null;
    if (m[2] === ZERO_SHA) deletes = true;
    refs.push(m[3]);
    commands.push({ old: m[1], new: m[2], ref: m[3] });
    at += len;
  }
  return null;
}

export type Decision =
  | { allow: false; reason: string }
  | { allow: true; add: 'ai-gateway' | 'github' | 'none' };

export interface OutboundContext {
  gatewayAccount: string;
  gatewayId: string;
  repos: string[];
  allowRegistries: boolean;
}

// What one sandbox may touch, fixed by its Durable Object when it registers the gateway
// (ctx.exports.Outbound({ props })). The agent inside cannot change it.
export interface SandboxScope {
  repo: string;
  pushBranch: string | null;
}

const REGISTRIES = new Set(['registry.npmjs.org', 'pypi.org', 'files.pythonhosted.org']);

export function decide(method: string, rawUrl: string, ctx: OutboundContext, scope: SandboxScope | null, pushBody?: Uint8Array): Decision {
  const url = new URL(rawUrl);
  // The Worker fetches with the scheme the container used; a credential on plain HTTP would cross
  // the Internet unencrypted.
  if (url.protocol !== 'https:') return { allow: false, reason: `${url.hostname} is reachable only over HTTPS` };

  if (url.hostname === 'gateway.ai.cloudflare.com') {
    const prefix = `/v1/${ctx.gatewayAccount}/${ctx.gatewayId}/`;
    return url.pathname.startsWith(prefix) ? { allow: true, add: 'ai-gateway' } : { allow: false, reason: 'not this account\'s gateway' };
  }

  if (url.hostname === 'github.com') {
    const m = /^\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/(info\/refs|git-upload-pack|git-receive-pack)$/.exec(url.pathname);
    if (!m) return { allow: false, reason: 'only git smart-HTTP to github.com' };
    const full = `${m[1]}/${m[2]}`.toLowerCase();
    if (!ctx.repos.some((r) => r.toLowerCase() === full)) return { allow: false, reason: `${full} is not an opted-in repository` };
    if (!scope || scope.repo.toLowerCase() !== full) return { allow: false, reason: `this sandbox works on ${scope?.repo ?? 'no repository'}, not ${full}` };
    const service = url.searchParams.get('service');
    if (m[3] === 'info/refs' && method === 'GET' && (service === 'git-upload-pack' || service === 'git-receive-pack')) {
      return { allow: true, add: 'github' };
    }
    if (m[3] === 'git-upload-pack' && method === 'POST') return { allow: true, add: 'github' };
    if (m[3] === 'git-receive-pack' && method === 'POST') {
      const pushed = pushBody ? pushedRefs(pushBody) : null;
      if (!pushed || pushed.refs.length === 0) return { allow: false, reason: 'unreadable push' };
      if (pushed.deletes) return { allow: false, reason: 'branch deletion refused' };
      const bad = pushed.refs.find((r) => !AGENT_BRANCH.test(r));
      if (bad) return { allow: false, reason: `push to ${bad} refused: agents push only agent branches` };
      // One task, one branch: a sandbox cannot write to another agent's work in the same repo.
      const other = pushed.refs.find((r) => r !== `refs/heads/${scope.pushBranch}`);
      if (!scope.pushBranch || other) return { allow: false, reason: `push to ${other ?? 'any branch'} refused: this sandbox may push only ${scope.pushBranch ?? 'nothing'}` };
      return { allow: true, add: 'github' };
    }
    return { allow: false, reason: 'git operation refused' };
  }

  // Package downloads only: no uploads, no other hosts. Each opening is also a way out, so this
  // can be switched off per deployment.
  if (ctx.allowRegistries && REGISTRIES.has(url.hostname) && (method === 'GET' || method === 'HEAD')) {
    return { allow: true, add: 'none' };
  }
  return { allow: false, reason: `${url.hostname} is not reachable from this sandbox` };
}
