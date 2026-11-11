import assert from 'node:assert/strict';
import test from 'node:test';
import { GithubApp, verifySignature } from '../src/github.ts';
import { handleGithubEvent } from '../src/handler.ts';
import { ingest } from '../src/outbox.ts';
import { memorySql } from './helpers.mjs';

const SECRET = 'webhook-secret-fixture-0123456789abcdef';
const enc = new TextEncoder();
// PEM armour is assembled at runtime so the repo's secret scanners never see a key-shaped literal.
const DASHES = '-'.repeat(5);
const armour = (kind, side) => `${DASHES}${side} ${kind}${DASHES}`;

async function sign(body, secret = SECRET) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(body)));
  return `sha256=${[...mac].map((b) => b.toString(16).padStart(2, '0')).join('')}`;
}

test('verifySignature accepts the real signature and nothing else', async () => {
  const body = '{"a":1}';
  assert.equal(await verifySignature(enc.encode(body), await sign(body), SECRET), true);
  assert.equal(await verifySignature(enc.encode(body), await sign(body, `${SECRET}x`), SECRET), false);
  assert.equal(await verifySignature(enc.encode(body), await sign(body), 'short'), false);
  assert.equal(await verifySignature(enc.encode(body), null, SECRET), false);
});

const ROUTING = JSON.stringify({ repos: ['frankxai/kernel'], codexBot: 'codex[bot]', selfLogins: ['me[bot]'] });
const PAYLOAD = JSON.stringify({
  action: 'opened', repository: { full_name: 'frankxai/kernel' }, sender: { login: 'frankxai' },
  pull_request: { number: 9, html_url: 'https://github.com/frankxai/kernel/pull/9', state: 'open', draft: false, updated_at: new Date().toISOString(), head: { sha: 'a'.repeat(40), ref: 'agent/claude/z' } },
});

function harness() {
  const sql = memorySql();
  let n = 0;
  const stub = { run: async () => ({ status: 500, body: {} }), ingest: async (d, a) => ingest(sql, d, a, 1_800_000_000_000, () => `t${++n}`) };
  const post = async (body, headers = {}) => handleGithubEvent(new Request('https://cp.example.invalid/events/github', {
    method: 'POST', body, headers: { 'x-github-event': 'pull_request', 'x-github-delivery': '11111111-2222-3333-4444-555555555555', ...headers },
  }), { GITHUB_WEBHOOK_SECRET: SECRET, ROUTING }, stub);
  return { sql, post };
}

test('the webhook route acts once per delivery and refuses forged bodies', async () => {
  const { post } = harness();
  assert.equal((await post(PAYLOAD, { 'x-hub-signature-256': await sign(PAYLOAD) })).status, 202);
  assert.equal((await post(PAYLOAD, { 'x-hub-signature-256': await sign(PAYLOAD) })).status, 200);
  assert.equal((await post(PAYLOAD, { 'x-hub-signature-256': await sign('{}') })).status, 401);
  assert.equal((await post(PAYLOAD, { 'x-hub-signature-256': await sign(PAYLOAD), 'x-github-delivery': 'nope' })).status, 400);
});

test('a correctly signed but stale event is refused, closing the replay window', async () => {
  const { post } = harness();
  const old = PAYLOAD.replace(/"updated_at":"[^"]+"/, '"updated_at":"2026-01-01T00:00:00Z"');
  const res = await post(old, { 'x-hub-signature-256': await sign(old) });
  assert.equal((await res.json()).stale, true);
});

test('the webhook route is closed until routing and the secret are set', async () => {
  const res = await handleGithubEvent(new Request('https://x.invalid/events/github', { method: 'POST', body: '{}' }), { ROUTING }, {});
  assert.equal(res.status, 503);
});

test('GithubApp signs an RS256 App JWT, reuses the installation token and comments', async () => {
  const pair = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
  const der = new Uint8Array(await crypto.subtle.exportKey('pkcs8', pair.privateKey));
  const pem = `${armour('PRIVATE KEY', 'BEGIN')}\n${btoa(String.fromCharCode(...der))}\n${armour('PRIVATE KEY', 'END')}`;
  const seen = [];
  const fetcher = async (url, init) => {
    seen.push([init.method ?? 'GET', new URL(url).pathname, init.headers.authorization]);
    if (url.endsWith('/installation')) {
      const [h, p, s] = init.headers.authorization.slice(7).split('.');
      const sig = Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
      assert.equal(await crypto.subtle.verify('RSASSA-PKCS1-v1_5', pair.publicKey, sig, enc.encode(`${h}.${p}`)), true);
      assert.equal(JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/'))).iss, '12345');
      return Response.json({ id: 77 });
    }
    if (url.endsWith('/access_tokens')) return Response.json({ token: 'fixture-installation-token', expires_at: new Date(Date.now() + 3600_000).toISOString() });
    return new Response(null, { status: 201 });
  };
  const app = new GithubApp('12345', pem, fetcher);
  await app.comment('frankxai', 'kernel', 9, '@codex review');
  await app.addLabels('frankxai', 'kernel', 9, ['jules']);
  assert.deepEqual(seen.map((s) => s[1]), [
    '/repos/frankxai/kernel/installation', '/app/installations/77/access_tokens',
    '/repos/frankxai/kernel/issues/9/comments', '/repos/frankxai/kernel/issues/9/labels',
  ]);
  assert.equal(seen[2][2], 'token fixture-installation-token');
});

test('GithubApp refuses a PKCS#1 key with the conversion hint', async () => {
  const app = new GithubApp('1', `${armour('RSA PRIVATE KEY', 'BEGIN')}\nAAAA\n${armour('RSA PRIVATE KEY', 'END')}`, async () => Response.json({}));
  await assert.rejects(app.comment('o', 'r', 1, 'x'), /PKCS#8/);
});
