#!/usr/bin/env node
// lane.mjs — the cross-harness lane ledger. One contract every harness can honour, in any language,
// with no dependencies: claim the paths you are about to write, and refuse to write where someone
// else already is.
//
// Why this exists: queen/COORDINATION.md is prose only Claude writes, and the global session log
// recorded 1,609 Claude sessions and one "unknown" — so the only cross-harness signal that ever
// worked was the branch prefix. Twenty-three PRs rewrote the FrankX homepage in three months,
// mostly undoing each other, because nothing mechanical said "someone else owns this file".
//
// Usage (identical from Claude, Codex, Grok, Hermes, Antigravity, a hook, or a shell script):
//   node tools/lane.mjs claim   --harness codex --scope "nav rebuild" --repo frankx.ai-vercel-website \
//                               --paths "app/**,components/nav/**" --ttl 4h
//   node tools/lane.mjs check   --repo frankx.ai-vercel-website --paths "app/page.tsx"
//   node tools/lane.mjs touch   <laneId>
//   node tools/lane.mjs release <laneId> [--status done|handoff] [--note "..."]
//   node tools/lane.mjs list    [--json] [--all]
//   node tools/lane.mjs prune
//   node tools/lane.mjs derive  [--days 3]      # harnesses that never claimed, seen via git
//
// Exit codes: 0 ok · 2 usage error · 3 CONFLICT (another live lane owns a path you asked for).
// Exit 3 is the one that matters — wire it into a pre-write hook and collisions stop being possible.
//
// State is an append-only event log; live lanes are DERIVED by replaying it with TTL applied.
// Nothing writes a "status" field that could go stale while the world moved on.

import { appendFileSync, readFileSync, writeFileSync, existsSync, mkdirSync, openSync, closeSync, readSync, unlinkSync, statSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hostname } from 'node:os';
import { randomBytes } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// Overridable so the test suite can exercise conflict, TTL and locking against a scratch ledger
// instead of the live one. Nothing else sets it.
const LANE_DIR = process.env.STARLIGHT_LANE_DIR || join(ROOT, 'ops', 'lanes');
const EVENTS = join(LANE_DIR, 'events.jsonl');
const LOCK = join(LANE_DIR, '.lock');
const HEARTBEAT = join(ROOT, 'logs', 'heartbeats', 'heartbeat-lanes.json');

const DEFAULT_TTL_MIN = 240;   // 4h — long enough for real work, short enough that a dead session clears
const MAX_TTL_MIN = 1440;      // 24h ceiling: a lane older than a day is a fossil, not a claim
const LOCK_STALE_MS = 30_000;

// ---------- args ----------
const argv = process.argv.slice(2);
const cmd = argv[0];
const flag = (name, fallback = null) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 || i === argv.length - 1 ? fallback : argv[i + 1];
};
const has = (name) => argv.includes(`--${name}`);
const positional = argv.slice(1).filter((a, i, arr) => !a.startsWith('--') && !(i > 0 && arr[i - 1].startsWith('--') && !['json', 'all', 'force', 'quiet'].includes(arr[i - 1].slice(2))));

function die(msg, code = 2) { console.error(msg); process.exit(code); }

function parseTtl(s) {
  if (!s) return DEFAULT_TTL_MIN;
  const m = /^(\d+)\s*(m|min|h|hr|hours?)?$/i.exec(String(s).trim());
  if (!m) die(`--ttl must look like 90m or 4h, got "${s}"`);
  const n = Number(m[1]);
  const min = /^h/i.test(m[2] ?? 'h') ? n * 60 : n;
  if (min <= 0) die('--ttl must be positive');
  return Math.min(min, MAX_TTL_MIN);
}

// A harness that does not name itself is the problem this tool exists to solve, so guess only from
// its own runtime env — never from a flag default that would let every lane claim to be "claude".
function detectHarness() {
  const e = process.env;
  if (e.CLAUDECODE || e.CLAUDE_SESSION_ID || e.CLAUDE_PROJECT_DIR) return 'claude';
  if (e.CODEX_SESSION || e.CODEX_PROJECT_DIR || e.CODEX_HOME) return 'codex';
  if (e.GROK_SESSION || e.GROK_CLI) return 'grok';
  if (e.AGY_SESSION || e.ANTIGRAVITY_SESSION) return 'antigravity';
  if (e.GEMINI_CLI) return 'gemini';
  if (e.HERMES_SESSION || e.HERMES_AGENT) return 'hermes';
  if (e.OPENCODE || e.OPENCODE_PID) return 'opencode';
  if (e.KILO_SESSION || e.KILO_CLI || e.KILO) return 'kilo';
  return null;
}
function detectSession(harness) {
  const e = process.env;
  return e.CLAUDE_SESSION_ID || e.CODEX_SESSION || e.GROK_SESSION || e.AGY_SESSION ||
    e.ANTIGRAVITY_SESSION || e.HERMES_SESSION || e.OPENCODE_PID || e.KILO_SESSION ||
    `${harness}-${randomBytes(3).toString('hex')}`;
}

// ---------- storage ----------
mkdirSync(LANE_DIR, { recursive: true });

function withLock(fn) {
  const deadline = Date.now() + 10_000;
  for (;;) {
    try {
      const fd = openSync(LOCK, 'wx');
      try { return fn(); } finally { closeSync(fd); try { unlinkSync(LOCK); } catch {} }
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      // A crashed writer must not wedge every other harness out of the ledger forever.
      try {
        if (Date.now() - statSync(LOCK).mtimeMs > LOCK_STALE_MS) { unlinkSync(LOCK); continue; }
      } catch { /* lock vanished under us — retry */ }
      if (Date.now() > deadline) die('lane ledger is locked by another writer and did not clear in 10s', 2);
      execFileSync(process.execPath, ['-e', 'setTimeout(()=>{},60)'], { stdio: 'ignore' }); // ~60ms backoff, no deps
    }
  }
}

function appendEvent(ev) {
  withLock(() => {
    // A writer killed mid-line leaves the file without a trailing newline. Appending straight onto
    // that fuses the torn fragment to this event and loses BOTH — one crash would otherwise cost
    // every subsequent claim silently. Start a fresh line whenever the file does not end on one.
    let needsNewline = false;
    try {
      const size = statSync(EVENTS).size;
      if (size > 0) {
        const fd = openSync(EVENTS, 'r');
        try {
          const buf = Buffer.alloc(1);
          readSync(fd, buf, 0, 1, size - 1);
          needsNewline = buf[0] !== 0x0a;
        } finally { closeSync(fd); }
      }
    } catch { /* no file yet */ }
    appendFileSync(EVENTS, (needsNewline ? '\n' : '') + JSON.stringify({ ts: new Date().toISOString(), ...ev }) + '\n');
  });
}

function readEvents() {
  if (!existsSync(EVENTS)) return [];
  const out = [];
  for (const line of readFileSync(EVENTS, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t) continue;
    // A torn final line from a killed writer must not blind the whole ledger.
    try { out.push(JSON.parse(t)); } catch { /* skip */ }
  }
  return out;
}

// Live state is replayed, never stored: claim opens a lane, touch extends it, release closes it,
// and TTL closes whatever the harness forgot.
function liveLanes(at = Date.now()) {
  const lanes = new Map();
  for (const ev of readEvents()) {
    if (ev.event === 'claim') {
      lanes.set(ev.id, { ...ev, expiresAt: new Date(ev.ts).getTime() + ev.ttlMin * 60000, released: null });
    } else if (lanes.has(ev.id)) {
      const l = lanes.get(ev.id);
      if (ev.event === 'touch') l.expiresAt = new Date(ev.ts).getTime() + (ev.ttlMin ?? l.ttlMin) * 60000;
      if (ev.event === 'release') l.released = { ts: ev.ts, status: ev.status ?? 'done', note: ev.note ?? null };
    }
  }
  const live = [], gone = [];
  for (const l of lanes.values()) {
    if (l.released) gone.push({ ...l, why: `released ${l.released.status}` });
    else if (l.expiresAt <= at) gone.push({ ...l, why: 'ttl expired' });
    else live.push(l);
  }
  live.sort((a, b) => a.ts.localeCompare(b.ts));
  return { live, gone };
}

// ---------- path conflict ----------
// Exact glob intersection is undecidable in the general case, so this is deliberately conservative:
// it over-reports rather than letting two harnesses into the same tree. A false conflict costs one
// --force; a missed one costs a rewritten homepage.
function normalize(p) { return String(p).replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '').trim(); }
function literalPrefix(pattern) {
  const p = normalize(pattern);
  const i = p.search(/[*?[]/);
  const head = i === -1 ? p : p.slice(0, i);
  return head.slice(0, head.lastIndexOf('/') + 1 || head.length);
}
function patternsOverlap(a, b) {
  const A = normalize(a), B = normalize(b);
  if (A === B) return true;
  if (A === '**' || B === '**' || A === '.' || B === '.') return true;
  const pa = literalPrefix(A), pb = literalPrefix(B);
  // Either prefix containing the other means the two claims can reach the same file.
  return pa.startsWith(pb) || pb.startsWith(pa);
}
function conflictsFor(repo, paths, owner) {
  const { live } = liveLanes();
  const hits = [];
  for (const lane of live) {
    if (lane.repo !== repo) continue;
    if (lane.owner === owner) continue; // your own lane is not a conflict
    for (const mine of paths) {
      for (const theirs of lane.paths) {
        if (patternsOverlap(mine, theirs)) { hits.push({ lane, mine, theirs }); break; }
      }
    }
  }
  return hits;
}

function writeHeartbeat() {
  const { live } = liveLanes();
  mkdirSync(dirname(HEARTBEAT), { recursive: true });
  writeFileSync(HEARTBEAT, JSON.stringify({
    ts: new Date().toISOString(), source: 'lanes', status: 'ok',
    detail: `${live.length} live lane(s): ${[...new Set(live.map((l) => l.harness))].join(', ') || 'none'}`,
    liveLanes: live.length, staleAfterMs: 26 * 3600 * 1000,
  }, null, 2));
}

const fmtAge = (ms) => ms < 3600000 ? `${Math.round(ms / 60000)}m` : `${(ms / 3600000).toFixed(1)}h`;

// ---------- commands ----------
if (cmd === 'claim') {
  const harness = flag('harness') || detectHarness();
  if (!harness) die('--harness is required (this runtime does not identify itself: claude|codex|grok|hermes|antigravity|gemini|...)');
  const scope = flag('scope');
  const repo = flag('repo');
  const pathsRaw = flag('paths');
  if (!scope) die('--scope is required — one short phrase saying what this lane is doing');
  if (!repo) die('--repo is required (repo directory name, or "estate" for the root)');
  if (!pathsRaw) die('--paths is required — comma-separated globs you intend to WRITE');
  const paths = pathsRaw.split(',').map(normalize).filter(Boolean);
  if (!paths.length) die('--paths parsed to nothing');
  const session = flag('session') || detectSession(harness);
  const owner = `${harness}:${session}`;
  const ttlMin = parseTtl(flag('ttl'));

  const hits = conflictsFor(repo, paths, owner);
  if (hits.length && !has('force')) {
    console.error(`CONFLICT — ${hits.length} live lane(s) already own paths you asked for in ${repo}:`);
    for (const h of hits) {
      const age = fmtAge(Date.now() - new Date(h.lane.ts).getTime());
      console.error(`  ${h.lane.harness} "${h.lane.scope}" (${h.lane.id}, ${age} old, expires in ${fmtAge(h.lane.expiresAt - Date.now())})`);
      console.error(`    yours "${h.mine}" overlaps theirs "${h.theirs}"`);
    }
    console.error('\nTake a different slice, wait for their TTL, or --force if you know they are dead.');
    process.exit(3);
  }

  const id = `${harness}-${randomBytes(4).toString('hex')}`;
  appendEvent({ event: 'claim', id, owner, harness, session, repo, scope, paths, ttlMin, host: hostname(), pid: process.pid, forced: hits.length > 0 || undefined });
  writeHeartbeat();
  if (hits.length) console.error(`(forced past ${hits.length} conflicting lane(s))`);
  console.log(id);
  process.exit(0);
}

if (cmd === 'touch' || cmd === 'release') {
  const id = positional[0] || flag('id');
  if (!id) die(`usage: lane.mjs ${cmd} <laneId>`);
  const { live } = liveLanes();
  if (!live.find((l) => l.id === id)) die(`no live lane "${id}" — it may have expired or already been released`, 2);
  if (cmd === 'touch') appendEvent({ event: 'touch', id, ttlMin: parseTtl(flag('ttl')) });
  else appendEvent({ event: 'release', id, status: flag('status', 'done'), note: flag('note') });
  writeHeartbeat();
  console.log(`${cmd === 'touch' ? 'touched' : 'released'} ${id}`);
  process.exit(0);
}

if (cmd === 'check') {
  const repo = flag('repo');
  const pathsRaw = flag('paths');
  if (!repo || !pathsRaw) die('usage: lane.mjs check --repo <repo> --paths "a/**,b.ts" [--session S] [--harness H]');
  const harness = flag('harness') || detectHarness() || 'unknown';
  const owner = `${harness}:${flag('session') || detectSession(harness)}`;
  const hits = conflictsFor(repo, pathsRaw.split(',').map(normalize).filter(Boolean), owner);
  if (!hits.length) { if (!has('quiet')) console.log('clear'); process.exit(0); }
  for (const h of hits) console.error(`CONFLICT ${h.lane.harness} "${h.lane.scope}" (${h.lane.id}) owns "${h.theirs}" vs your "${h.mine}"`);
  process.exit(3);
}

if (cmd === 'list' || cmd === undefined) {
  const { live, gone } = liveLanes();
  if (has('json')) { console.log(JSON.stringify({ live, gone: has('all') ? gone : undefined }, null, 2)); process.exit(0); }
  if (!live.length) console.log('no live lanes');
  for (const l of live) {
    console.log(`${l.id}  ${l.harness.padEnd(12)} ${l.repo}`);
    console.log(`  ${l.scope}`);
    console.log(`  paths: ${l.paths.join(', ')}`);
    console.log(`  age ${fmtAge(Date.now() - new Date(l.ts).getTime())} · expires in ${fmtAge(l.expiresAt - Date.now())}`);
  }
  if (has('all')) {
    console.log(`\nclosed (${gone.length}):`);
    for (const l of gone.slice(-25)) console.log(`  ${l.id} ${l.harness} — ${l.scope} [${l.why}]`);
  }
  writeHeartbeat();
  process.exit(0);
}

if (cmd === 'prune') {
  // TTL already expires lanes on read; this only records the expiry so the log tells the story.
  const { gone } = liveLanes();
  const seen = new Set(readEvents().filter((e) => e.event === 'expire').map((e) => e.id));
  let n = 0;
  for (const l of gone) {
    if (l.released || seen.has(l.id)) continue;
    appendEvent({ event: 'expire', id: l.id, harness: l.harness, scope: l.scope });
    n++;
  }
  writeHeartbeat();
  console.log(`recorded ${n} expiry event(s)`);
  process.exit(0);
}

if (cmd === 'derive') {
  // A harness that never calls claim still leaves branches. This reconstructs who has been working
  // where, so the ledger's blind spots are visible instead of being read as an empty estate.
  const days = Number(flag('days', '3'));
  const since = Date.now() - days * 86400000;
  const reposDir = join(ROOT, 'repos');
  const rows = [];
  for (const entry of existsSync(reposDir) ? readdirSync(reposDir, { withFileTypes: true }) : []) {
    if (!entry.isDirectory()) continue;
    const dir = join(reposDir, entry.name);
    if (!existsSync(join(dir, '.git'))) continue;
    let out = '';
    try {
      out = execFileSync('git', ['-C', dir, 'for-each-ref', '--format=%(refname:short)|%(committerdate:iso8601)', 'refs/heads'],
        { stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 8 * 1024 * 1024 }).toString();
    } catch { continue; }
    for (const line of out.split('\n')) {
      const [branch, date] = line.split('|');
      if (!branch || !date) continue;
      if (new Date(date).getTime() < since) continue;
      // A moving default branch is a merge landing, not a lane — counting it as unlabeled harness
      // activity would put every repo in the estate on the blind list every day.
      if (/^(main|master|develop)$/i.test(branch)) continue;
      const m = /^(?:agent\/)?(claude|codex|grok|hermes|antigravity|agy|gemini|cursor|copilot|devin|opencode|kilo)\b/i.exec(branch);
      rows.push({ repo: entry.name, branch, date: date.slice(0, 10), harness: m ? m[1].toLowerCase() : 'unlabeled' });
    }
  }
  const { live } = liveLanes();
  const claimed = new Set(live.map((l) => `${l.harness}|${l.repo}`));
  if (has('json')) { console.log(JSON.stringify(rows, null, 2)); process.exit(0); }
  const byHarness = {};
  for (const r of rows) (byHarness[r.harness] ??= []).push(r);
  console.log(`git-derived activity, last ${days}d — ${rows.length} branch(es) across ${new Set(rows.map((r) => r.repo)).size} repo(s)\n`);
  for (const [h, list] of Object.entries(byHarness).sort((a, b) => b[1].length - a[1].length)) {
    const repos = [...new Set(list.map((r) => r.repo))];
    const unclaimed = repos.filter((r) => !claimed.has(`${h}|${r}`));
    console.log(`${h.padEnd(12)} ${String(list.length).padStart(3)} branches · ${repos.length} repos · ${unclaimed.length} with NO lane claimed`);
    for (const r of list.slice(0, 4)) console.log(`   ${r.date} ${r.repo}: ${r.branch}`);
    if (list.length > 4) console.log(`   … ${list.length - 4} more`);
  }
  console.log('\nRepos listed with NO lane claimed are working blind — that harness is writing where nothing reserved it.');
  process.exit(0);
}

die(`usage: lane.mjs <claim|check|touch|release|list|prune|derive> [flags]  (see header of ${import.meta.url.replace('file:///', '')})`);
