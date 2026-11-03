// GitHub events in, queue work and agent triggers out. Pure: no network, no Cloudflare imports,
// so every rule is tested with node --test. The Durable Object stores the actions this returns in
// an outbox and performs the remote ones (comments, labels, lookups) with retries.

import type { EnqueueInput } from './core.ts';

export interface Routing {
  // owner/name pairs the router acts on. Anything else is ignored, so a new repo is opt-in.
  repos: string[];
  // The Codex GitHub connector's login. Its reviews are the independent check on non-OpenAI work.
  codexBot: string;
  // Logins whose events are ignored: this App's own bot, so a label it adds cannot trigger it again.
  selfLogins: string[];
  // Repos where Codex already reviews every push by itself; the router does not ask again there.
  codexAutoReview?: string[];
  recurring?: RecurringTask[];
}

export interface RecurringTask {
  name: string;
  repo: string;
  title: string;
  doneCondition: string;
  paths: string[];
  priority: number;
  excludeProvider?: string;
  kind?: string;
}

export interface Maker {
  harness: string;
  provider: string | null;
}

export interface Signal {
  kind: 'pr_ready' | 'review' | 'checks' | 'issue_labeled';
  owner: string;
  repo: string;
  number: number;
  url: string;
  sender: string;
  sha?: string;
  branch?: string;
  maker?: Maker | null;
  reviewState?: string;
  reviewBody?: string;
  reviewCommit?: string;
  conclusion?: string;
  label?: string;
  // When the thing the event describes last changed, in ms. A signed body replayed days later
  // still verifies, so the handler refuses events older than its freshness window.
  at: number;
}

export type Action =
  | { type: 'enqueue'; task: EnqueueInput }
  // Same task, but its write paths are the PR's changed files, looked up when the action runs.
  | { type: 'enqueue_pr'; owner: string; repo: string; number: number; task: Omit<EnqueueInput, 'paths'> }
  | { type: 'comment'; owner: string; repo: string; number: number; body: string }
  | { type: 'label'; owner: string; repo: string; number: number; labels: string[] }
  // Decided when it runs, against live GitHub: who added the label, and what the issue says.
  | { type: 'dispatch_issue'; owner: string; repo: string; number: number; label: string; sender: string }
  // Checks green and Codex passed this head: decided against live GitHub state, not the event.
  | { type: 'evaluate_land'; owner: string; repo: string; number: number };

// Branch prefixes are how the estate tells harnesses apart (pr-gate reads them the same way),
// because every harness pushes as the same GitHub account.
const HARNESS_PROVIDER: Record<string, string | null> = {
  claude: 'anthropic', codex: 'openai', chatgpt: 'openai', jules: 'google', gemini: 'google',
  antigravity: 'google', grok: 'xai', hermes: null, opencode: null, kilo: null,
};

export function makerFromBranch(branch: string | undefined): Maker | null {
  if (!branch) return null;
  const agent = /^agent\/([a-z0-9-]+)\//.exec(branch);
  const harness = agent ? agent[1]
    : /^codex\//.test(branch) ? 'codex'
    : /^claude\//.test(branch) ? 'claude'
    : /^(jules-|sentinel-)|^fix-.*-\d{6,}$/.test(branch) ? 'jules'
    : null;
  if (!harness) return null;
  return { harness, provider: harness in HARNESS_PROVIDER ? HARNESS_PROVIDER[harness] : null };
}

const READY_ACTIONS = new Set(['opened', 'reopened', 'ready_for_review', 'synchronize']);
const NO_FINDINGS = /didn['’]?t find any major issues|no major issues|no issues found/i;
const FINDINGS = /\bP[0-2]\b|changes requested/i;

export function normalize(name: string, payload: Record<string, any>): Signal | null {
  const repoFull: string | undefined = payload?.repository?.full_name;
  if (typeof repoFull !== 'string' || !repoFull.includes('/')) return null;
  const [owner, repo] = repoFull.split('/');
  const sender: string = payload.sender?.login ?? '';

  if (name === 'pull_request' && READY_ACTIONS.has(payload.action)) {
    const pr = payload.pull_request;
    if (!pr || pr.draft || pr.state !== 'open') return null;
    return {
      kind: 'pr_ready', owner, repo, number: pr.number, url: pr.html_url, sender,
      sha: pr.head?.sha, branch: pr.head?.ref, maker: makerFromBranch(pr.head?.ref), at: Date.parse(pr.updated_at),
    };
  }
  if (name === 'pull_request_review' && payload.action === 'submitted') {
    const pr = payload.pull_request;
    const review = payload.review;
    if (!pr || !review || pr.state !== 'open') return null;
    return {
      kind: 'review', owner, repo, number: pr.number, url: pr.html_url, sender,
      sha: pr.head?.sha, branch: pr.head?.ref, maker: makerFromBranch(pr.head?.ref),
      reviewState: String(review.state ?? '').toLowerCase(), reviewBody: String(review.body ?? ''),
      reviewCommit: review.commit_id, at: Date.parse(review.submitted_at),
    };
  }
  if (name === 'check_suite' && payload.action === 'completed') {
    const suite = payload.check_suite;
    const pr = suite?.pull_requests?.[0];
    // Suites on forks carry no pull_requests; the router only acts on this owner's own branches.
    if (!pr) return null;
    return {
      kind: 'checks', owner, repo, number: pr.number, url: `https://github.com/${repoFull}/pull/${pr.number}`,
      sender, sha: suite.head_sha, branch: suite.head_branch, maker: makerFromBranch(suite.head_branch),
      conclusion: suite.conclusion, at: Date.parse(suite.updated_at),
    };
  }
  if (name === 'issues' && payload.action === 'labeled') {
    const issue = payload.issue;
    if (!issue || issue.state !== 'open' || issue.pull_request) return null;
    return {
      kind: 'issue_labeled', owner, repo, number: issue.number, url: issue.html_url, sender,
      label: payload.label?.name, at: Date.parse(issue.updated_at),
    };
  }
  return null;
}

const short = (sha?: string) => (sha ?? 'nosha').slice(0, 12);
const taskId = (s: Signal, what: string) => `gh:${s.owner}.${s.repo}.${s.number}.${short(s.sha)}.${what}`.slice(0, 100);
// Review tasks write nothing, but the queue requires a path; this one is unique and locks no file.
const reviewPath = (n: number) => `.starlight/reviews/pr-${n}`;

export function plan(signal: Signal, routing: Routing): Action[] {
  const full = `${signal.owner}/${signal.repo}`;
  if (!routing.repos.includes(full)) return [];
  if (routing.selfLogins.includes(signal.sender)) return [];
  const where = { owner: signal.owner, repo: signal.repo, number: signal.number };

  switch (signal.kind) {
    case 'pr_ready': {
      const maker = signal.maker;
      if (!maker || maker.harness === 'dependabot') return [];
      // Codex checks everyone else's work; OpenAI-made work goes to a worker from another family.
      if (maker.provider !== 'openai') {
        if (routing.codexAutoReview?.includes(full)) return [];
        return [{ type: 'comment', ...where, body: '@codex review' }];
      }
      return [{
        type: 'enqueue',
        task: {
          id: taskId(signal, 'review'),
          title: `Review ${full}#${signal.number} (made by ${maker.harness})`,
          doneCondition: `A review is posted on ${signal.url} for head ${signal.sha}: each finding with file:line and P0-P3 severity, or the words "no blocking findings". Nothing is pushed to the branch.`,
          priority: 3, repo: signal.repo, paths: [reviewPath(signal.number)], gates: ['none'],
          maxMinutes: 30, excludeProvider: 'openai', kind: 'review',
        },
      }];
    }
    case 'review': {
      if (signal.sender !== routing.codexBot || !signal.maker) return [];
      // A review of an older head says nothing about the current one.
      if (signal.reviewCommit && signal.sha && signal.reviewCommit !== signal.sha) return [];
      const body = signal.reviewBody ?? '';
      if (signal.reviewState === 'approved' || NO_FINDINGS.test(body)) return [{ type: 'evaluate_land', ...where }];
      if (signal.reviewState !== 'changes_requested' && !FINDINGS.test(body)) return [];
      return [{
        type: 'enqueue_pr', ...where,
        task: {
          id: taskId(signal, 'fix-review'),
          title: `Answer Codex findings on ${full}#${signal.number}`,
          doneCondition: `Every unresolved Codex thread on ${signal.url} has a fix commit or a reasoned reply, the branch is pushed, and "@codex review" is requested again on the new head.`,
          priority: 2, repo: signal.repo, gates: ['none'], maxMinutes: 90, kind: 'fix',
        },
      }];
    }
    case 'checks': {
      if (!signal.maker || signal.maker.harness === 'dependabot') return [];
      if (signal.conclusion === 'success') return [{ type: 'evaluate_land', ...where }];
      if (signal.conclusion !== 'failure' && signal.conclusion !== 'timed_out') return [];
      return [{
        type: 'enqueue_pr', ...where,
        task: {
          id: taskId(signal, 'fix-ci'),
          title: `Make CI green on ${full}#${signal.number}`,
          doneCondition: `Every required check on ${signal.url} passes at a new pushed head, with the cause named in a PR comment. Tests are fixed, never deleted or skipped.`,
          priority: 2, repo: signal.repo, gates: ['none'], maxMinutes: 60, kind: 'fix',
        },
      }];
    }
    case 'issue_labeled': {
      const label = signal.label ?? '';
      if (!AGENT_LABELS.has(label)) return [];
      return [{ type: 'dispatch_issue', ...where, label, sender: signal.sender }];
    }
  }
}

export const AGENT_LABELS = new Set(['agent:codex', 'agent:jules', 'agent:claude', 'agent:any']);
export const FRESH_MS = 3 * 24 * 3600_000;

// Recurring work gets one task per day; the date in the id makes a repeated cron run harmless.
export function recurringTasks(routing: Routing, now: number): EnqueueInput[] {
  const day = new Date(now).toISOString().slice(0, 10);
  return (routing.recurring ?? []).map((r) => ({
    id: `cron:${r.name}:${day}`.slice(0, 100), title: r.title, doneCondition: r.doneCondition,
    priority: r.priority, repo: r.repo, paths: r.paths, gates: ['none'], maxMinutes: 120, kind: r.kind ?? 'research',
    ...(r.excludeProvider ? { excludeProvider: r.excludeProvider } : {}),
  }));
}

export function parseRouting(raw: string | undefined): Routing | null {
  if (!raw) return null;
  try {
    const r = JSON.parse(raw);
    const strings = (v: unknown) => Array.isArray(v) && v.every((x) => typeof x === 'string');
    if (!strings(r.repos) || !r.repos.every((x: string) => /^[\w.-]+\/[\w.-]+$/.test(x))) return null;
    if (typeof r.codexBot !== 'string' || !r.codexBot || !strings(r.selfLogins) || r.selfLogins.length === 0) return null;
    if (r.codexAutoReview !== undefined && !strings(r.codexAutoReview)) return null;
    if (r.recurring !== undefined && !Array.isArray(r.recurring)) return null;
    return r as Routing;
  } catch {
    return null;
  }
}
