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
  comment(owner: string, repo: string, number: number, body: string): Promise<void>;
  addLabels(owner: string, repo: string, number: number, labels: string[]): Promise<void>;
  prFiles(owner: string, repo: string, number: number): Promise<string[]>;
  prState(owner: string, repo: string, number: number, codexBot: string): Promise<PrState>;
}

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

  async comment(owner: string, repo: string, number: number, body: string) {
    await this.call(`/repos/${owner}/${repo}/issues/${number}/comments`, {
      method: 'POST', auth: `token ${await this.token(owner, repo)}`, body: JSON.stringify({ body }),
    });
  }

  async addLabels(owner: string, repo: string, number: number, labels: string[]) {
    await this.call(`/repos/${owner}/${repo}/issues/${number}/labels`, {
      method: 'POST', auth: `token ${await this.token(owner, repo)}`, body: JSON.stringify({ labels }),
    });
  }

  async prFiles(owner: string, repo: string, number: number): Promise<string[]> {
    const files = await this.get<{ filename: string }[]>(owner, repo, `/repos/${owner}/${repo}/pulls/${number}/files?per_page=100`);
    return files.map((f) => f.filename);
  }

  async prState(owner: string, repo: string, number: number, codexBot: string): Promise<PrState> {
    const pr = await this.get<any>(owner, repo, `/repos/${owner}/${repo}/pulls/${number}`);
    const sha: string = pr.head.sha;
    const [runs, status, reviews] = await Promise.all([
      this.get<any>(owner, repo, `/repos/${owner}/${repo}/commits/${sha}/check-runs?per_page=100`),
      this.get<any>(owner, repo, `/repos/${owner}/${repo}/commits/${sha}/status`),
      this.get<any[]>(owner, repo, `/repos/${owner}/${repo}/pulls/${number}/reviews?per_page=100`),
    ]);
    const okRun = (r: any) => r.status === 'completed' && ['success', 'neutral', 'skipped'].includes(r.conclusion);
    // No check runs at all is not green: a repo whose CI never ran has proven nothing.
    const checksPassed = runs.total_count > 0 && runs.total_count <= 100 && runs.check_runs.every(okRun)
      && (status.total_count === 0 || status.state === 'success');
    const atHead = reviews.filter((r) => r.user?.login === codexBot && r.commit_id === sha);
    const passed = atHead.some((r) => r.state === 'APPROVED' || /didn['’]?t find any major issues|no major issues|no issues found/i.test(r.body ?? ''));
    const blocked = atHead.some((r) => r.state === 'CHANGES_REQUESTED' || /\bP[0-2]\b/.test(r.body ?? ''));
    return { headSha: sha, draft: !!pr.draft, open: pr.state === 'open', branch: pr.head.ref, checksPassed, codexPassedHead: passed && !blocked };
  }
}
