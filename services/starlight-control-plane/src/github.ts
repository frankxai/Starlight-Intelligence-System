// GitHub over HTTPS as a GitHub App: webhook signatures in, installation-token calls out.
// WebCrypto only, so the same code runs in workerd and in node --test.

const API = 'https://api.github.com';
const enc = new TextEncoder();

export async function verifySignature(raw: Uint8Array, header: string | null, secret: string | undefined): Promise<boolean> {
  if (!secret || secret.length < 32 || !/^sha256=[0-9a-f]{64}$/.test(header ?? '')) return false;
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  const sig = Uint8Array.from(header!.slice(7).match(/../g)!, (h) => parseInt(h, 16));
  return crypto.subtle.verify('HMAC', key, sig, raw);
}

export interface PrState {
  headSha: string;
  draft: boolean;
  open: boolean;
  branch: string;
  checksPassed: boolean;
  codexPassedHead: boolean;
}

export interface GithubApi {
  comment(owner: string, repo: string, number: number, body: string): Promise<string | void>;
  // True when a comment created since `sinceIso` already contains `marker`: the outbox's way to
  // know a comment it may have posted before a crash really went out.
  hasComment(owner: string, repo: string, number: number, marker: string, sinceIso: string): Promise<boolean>;
  addLabels(owner: string, repo: string, number: number, labels: string[]): Promise<void>;
  // complete is false when GitHub would not list every file, so the caller must lock more widely.
  prFiles(owner: string, repo: string, number: number): Promise<{ files: string[]; complete: boolean }>;
  prState(owner: string, repo: string, number: number, codexBot: string): Promise<PrState>;
  issue(owner: string, repo: string, number: number): Promise<{ title: string; body: string; open: boolean }>;
  permission(owner: string, repo: string, login: string): Promise<string>;
}

const MAX_PAGES = 30;

const b64url = (bytes: Uint8Array | string) => {
  const s = typeof bytes === 'string' ? btoa(bytes) : btoa(String.fromCharCode(...bytes));
  return s.replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
};

// GitHub hands out PKCS#1 keys ("BEGIN RSA PRIVATE KEY"); WebCrypto reads only PKCS#8. Convert
// once with `openssl pkcs8 -topk8 -nocrypt -in app.pem -out app.pk8.pem` before storing the secret.
async function appJwt(appId: string, pkcs8Pem: string, nowSec: number): Promise<string> {
  if (!/BEGIN PRIVATE KEY/.test(pkcs8Pem)) throw new Error('GITHUB_APP_PRIVATE_KEY must be PKCS#8 (BEGIN PRIVATE KEY)');
  const der = Uint8Array.from(atob(pkcs8Pem.replace(/-----[^-]+-----|\s+/g, '')), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  // iat is backdated a minute for clock drift; GitHub refuses an exp more than ten minutes out.
  const body = `${b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${b64url(JSON.stringify({ iat: nowSec - 60, exp: nowSec + 540, iss: appId }))}`;
  const sig = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, enc.encode(body)));
  return `${body}.${b64url(sig)}`;
}

export class GithubApp implements GithubApi {
  private tokens = new Map<string, { token: string; expiresAt: number }>();
  private appId: string;
  private privateKey: string;
  private fetcher: typeof fetch;
  private clock: () => number;

  constructor(appId: string, privateKey: string, fetcher: typeof fetch = fetch, clock: () => number = Date.now) {
    this.appId = appId;
    this.privateKey = privateKey;
    this.fetcher = fetcher;
    this.clock = clock;
  }

  private async call(path: string, init: RequestInit & { auth: string }): Promise<Response> {
    const res = await this.fetcher(`${API}${path}`, {
      ...init,
      redirect: 'manual',
      // Callers run inside leases and Workflow steps; a hung call must not outlive them.
      signal: AbortSignal.timeout(20_000),
      headers: {
        accept: 'application/vnd.github+json',
        authorization: init.auth,
        'user-agent': 'starlight-control-plane',
        'x-github-api-version': '2022-11-28',
        ...(init.body ? { 'content-type': 'application/json' } : {}),
      },
    });
    if (!res.ok) throw new Error(`GitHub ${init.method ?? 'GET'} ${path.split('?')[0]} answered ${res.status}`);
    return res;
  }

  // One installation per owner; its token lasts an hour and is reused until five minutes before.
  // Public so a sandbox's outbound gateway can add it to git requests the sandbox itself never sees.
  async installationToken(owner: string, repo: string): Promise<string> {
    return this.token(owner, repo);
  }

  private async token(owner: string, repo: string): Promise<string> {
    const cached = this.tokens.get(owner);
    if (cached && cached.expiresAt - 300_000 > this.clock()) return cached.token;
    const jwt = `Bearer ${await appJwt(this.appId, this.privateKey, Math.floor(this.clock() / 1000))}`;
    const inst = await (await this.call(`/repos/${owner}/${repo}/installation`, { auth: jwt })).json() as { id: number };
    const tok = await (await this.call(`/app/installations/${inst.id}/access_tokens`, { method: 'POST', auth: jwt })).json() as { token: string; expires_at: string };
    this.tokens.set(owner, { token: tok.token, expiresAt: Date.parse(tok.expires_at) });
    return tok.token;
  }

  private async get<T>(owner: string, repo: string, path: string): Promise<T> {
    return (await this.call(path, { auth: `token ${await this.token(owner, repo)}` })).json() as Promise<T>;
  }

  async comment(owner: string, repo: string, number: number, body: string): Promise<string> {
    const res = await this.call(`/repos/${owner}/${repo}/issues/${number}/comments`, {
      method: 'POST', auth: `token ${await this.token(owner, repo)}`, body: JSON.stringify({ body }),
    });
    return ((await res.json().catch(() => ({}))) as { html_url?: string }).html_url ?? '';
  }

  async hasComment(owner: string, repo: string, number: number, marker: string, sinceIso: string): Promise<boolean> {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const batch = await this.get<{ body?: string }[]>(owner, repo,
        `/repos/${owner}/${repo}/issues/${number}/comments?per_page=100&page=${page}&since=${encodeURIComponent(sinceIso)}`);
      if (batch.some((c) => (c.body ?? '').includes(marker))) return true;
      if (batch.length < 100) return false;
    }
    // Could not see every comment. Neither answer is safe, so the outbox retries and, after its last
    // attempt, lists the action as failed for a human instead of guessing.
    throw new Error(`more than ${MAX_PAGES * 100} comments since ${sinceIso} on #${number}; cannot check for the marker`);
  }

  async issue(owner: string, repo: string, number: number) {
    const i = await this.get<{ title: string; body: string | null; state: string }>(owner, repo, `/repos/${owner}/${repo}/issues/${number}`);
    return { title: i.title, body: i.body ?? '', open: i.state === 'open' };
  }

  async permission(owner: string, repo: string, login: string): Promise<string> {
    const p = await this.get<{ permission: string }>(owner, repo, `/repos/${owner}/${repo}/collaborators/${encodeURIComponent(login)}/permission`);
    return p.permission;
  }

  async defaultBranch(owner: string, repo: string): Promise<string> {
    return (await this.get<{ default_branch: string }>(owner, repo, `/repos/${owner}/${repo}`)).default_branch;
  }

  // The open PR whose head is this branch, so a retried "open PR" step finds the one it made.
  async findPullRequest(owner: string, repo: string, head: string): Promise<string | null> {
    const prs = await this.get<{ html_url: string }[]>(owner, repo,
      `/repos/${owner}/${repo}/pulls?state=open&head=${encodeURIComponent(`${owner}:${head}`)}&per_page=1`);
    return prs[0]?.html_url ?? null;
  }

  async openDraftPullRequest(owner: string, repo: string, head: string, base: string, title: string, body: string): Promise<string> {
    const res = await this.call(`/repos/${owner}/${repo}/pulls`, {
      method: 'POST', auth: `token ${await this.token(owner, repo)}`,
      body: JSON.stringify({ head, base, title, body, draft: true }),
    });
    return ((await res.json()) as { html_url: string }).html_url;
  }

  async addLabels(owner: string, repo: string, number: number, labels: string[]) {
    await this.call(`/repos/${owner}/${repo}/issues/${number}/labels`, {
      method: 'POST', auth: `token ${await this.token(owner, repo)}`, body: JSON.stringify({ labels }),
    });
  }

  async prFiles(owner: string, repo: string, number: number) {
    const files: string[] = [];
    // GitHub lists at most 3,000 files per pull request: 30 pages of 100.
    for (let page = 1; page <= MAX_PAGES; page++) {
      const batch = await this.get<{ filename: string }[]>(owner, repo, `/repos/${owner}/${repo}/pulls/${number}/files?per_page=100&page=${page}`);
      files.push(...batch.map((f) => f.filename));
      if (batch.length < 100) return { files, complete: true };
    }
    return { files, complete: false };
  }

  // cf-review: the PR facts it checks before and after a review run.
  async reviewPull(owner: string, repo: string, number: number) {
    const pr = await this.get<any>(owner, repo, `/repos/${owner}/${repo}/pulls/${number}`);
    return {
      state: String(pr.state), draft: !!pr.draft, headSha: String(pr.head?.sha ?? ''),
      headRepo: (pr.head?.repo?.full_name as string | undefined) ?? null, changedFiles: Number(pr.changed_files ?? -1),
    };
  }

  // Changed files with their patches. complete is false past GitHub's 3,000-file listing limit.
  async prPatches(owner: string, repo: string, number: number) {
    const files: { filename: string; previous_filename?: string; status: string; patch?: string; changes: number }[] = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      const batch = await this.get<any[]>(owner, repo, `/repos/${owner}/${repo}/pulls/${number}/files?per_page=100&page=${page}`);
      files.push(...batch.map((f) => ({ filename: f.filename, previous_filename: f.previous_filename, status: f.status, patch: f.patch, changes: Number(f.changes ?? 0) })));
      if (batch.length < 100) return { files, complete: true };
    }
    return { files, complete: false };
  }

  private async allReviews(owner: string, repo: string, number: number): Promise<any[] | null> {
    const out: any[] = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      const batch = await this.get<any[]>(owner, repo, `/repos/${owner}/${repo}/pulls/${number}/reviews?per_page=100&page=${page}`);
      out.push(...batch);
      if (batch.length < 100) return out;
    }
    return null;
  }

  async prState(owner: string, repo: string, number: number, codexBot: string): Promise<PrState> {
    const pr = await this.get<any>(owner, repo, `/repos/${owner}/${repo}/pulls/${number}`);
    const sha: string = pr.head.sha;
    const [runs, status, reviews] = await Promise.all([
      this.get<any>(owner, repo, `/repos/${owner}/${repo}/commits/${sha}/check-runs?per_page=100`),
      this.get<any>(owner, repo, `/repos/${owner}/${repo}/commits/${sha}/status`),
      this.allReviews(owner, repo, number),
    ]);
    const okRun = (r: any) => r.status === 'completed' && ['success', 'neutral', 'skipped'].includes(r.conclusion);
    // No check runs at all is not green: a repo whose CI never ran has proven nothing. Green runs
    // are not enough either: mergeable_state "clean" is GitHub's own word that every required
    // check and review on the base branch is satisfied and there is no conflict.
    const checksPassed = runs.total_count > 0 && runs.total_count <= 100 && runs.check_runs.every(okRun)
      && (status.total_count === 0 || status.state === 'success') && pr.mergeable_state === 'clean';
    if (!reviews) return { headSha: sha, draft: !!pr.draft, open: pr.state === 'open', branch: pr.head.ref, checksPassed, codexPassedHead: false };
    const atHead = reviews.filter((r) => r.user?.login === codexBot && r.commit_id === sha);
    const passed = atHead.some((r) => r.state === 'APPROVED' || /didn['’]?t find any major issues|no major issues|no issues found/i.test(r.body ?? ''));
    const blocked = atHead.some((r) => r.state === 'CHANGES_REQUESTED' || /\bP[0-2]\b/.test(r.body ?? ''));
    return { headSha: sha, draft: !!pr.draft, open: pr.state === 'open', branch: pr.head.ref, checksPassed, codexPassedHead: passed && !blocked };
  }
}
