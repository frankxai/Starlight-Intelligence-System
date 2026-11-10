import assert from 'node:assert/strict';
import test from 'node:test';
import { GithubApp } from '../src/github.ts';

const SHA = 'a'.repeat(40);
const BOT = 'chatgpt-codex-connector[bot]';

// A GithubApp whose installation token is pre-seeded, so only the data calls reach the fake.
function app(routes) {
  const fetcher = async (url) => {
    const { pathname, searchParams } = new URL(url);
    const page = Number(searchParams.get('page') ?? 1);
    const body = routes(pathname, page);
    return body === undefined ? new Response('not found', { status: 404 }) : Response.json(body);
  };
  const a = new GithubApp('1', 'unused', fetcher);
  a.tokens = new Map([['o', { token: 't', expiresAt: Date.now() + 3600_000 }]]);
  return a;
}

const base = (over = {}) => (path, page) => {
  if (path === '/repos/o/r/pulls/5') return { head: { sha: SHA, ref: 'agent/claude/x' }, state: 'open', draft: false, mergeable_state: 'clean', ...over.pr };
  if (path.endsWith('/check-runs')) return { total_count: 1, check_runs: [{ status: 'completed', conclusion: 'success' }] };
  if (path.endsWith('/status')) return { total_count: 0, state: 'pending' };
  if (path.endsWith('/reviews')) return over.reviews ? over.reviews(page) : [{ user: { login: BOT }, commit_id: SHA, state: 'COMMENTED', body: "Didn't find any major issues." }];
  return undefined;
};

test('green runs and a Codex pass at the head make a land candidate', async () => {
  const st = await app(base()).prState('o', 'r', 5, BOT);
  assert.equal(st.checksPassed, true);
  assert.equal(st.codexPassedHead, true);
});

test('a missing required check (mergeable_state blocked) is not green', async () => {
  const st = await app(base({ pr: { mergeable_state: 'blocked' } })).prState('o', 'r', 5, BOT);
  assert.equal(st.checksPassed, false);
});

test('a blocking Codex review on a later page is found', async () => {
  const reviews = (page) => page === 1
    ? Array.from({ length: 100 }, () => ({ user: { login: BOT }, commit_id: SHA, state: 'COMMENTED', body: "Didn't find any major issues." }))
    : [{ user: { login: BOT }, commit_id: SHA, state: 'CHANGES_REQUESTED', body: '**P1** the lease leaks' }];
  const st = await app(base({ reviews })).prState('o', 'r', 5, BOT);
  assert.equal(st.codexPassedHead, false);
});

test('prFiles follows every page and says when GitHub stopped listing', async () => {
  const many = app((path, page) => path.endsWith('/files') ? Array.from({ length: 100 }, (_, i) => ({ filename: `p${page}/f${i}` })) : undefined);
  const r = await many.prFiles('o', 'r', 5);
  assert.equal(r.complete, false);
  assert.equal(r.files.length, 3000);
  const few = app((path, page) => path.endsWith('/files') ? (page === 1 ? Array.from({ length: 100 }, (_, i) => ({ filename: `a/${i}` })) : [{ filename: 'b/last' }]) : undefined);
  const f = await few.prFiles('o', 'r', 5);
  assert.deepEqual([f.complete, f.files.length, f.files.at(-1)], [true, 101, 'b/last']);
});

test('a comment list too long to read is an error, never a silent "already posted"', async () => {
  const flood = app((path) => path.endsWith('/comments') ? Array.from({ length: 100 }, () => ({ body: 'noise' })) : undefined);
  await assert.rejects(flood.hasComment('o', 'r', 5, '<!-- m -->', '2026-11-03T00:00:00Z'), /cannot check for the marker/);
});
