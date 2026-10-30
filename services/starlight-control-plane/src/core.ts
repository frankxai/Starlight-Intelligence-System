// Pure queue rules over a minimal SQL interface. The Durable Object adapts ctx.storage.sql;
// tests adapt node:sqlite. No Cloudflare runtime imports, so node --test exercises the real SQL.

export interface Sql {
  exec(query: string, ...binds: unknown[]): Record<string, unknown>[];
  transaction<T>(fn: () => T): T;
}

export type Role = 'producer' | 'worker' | 'verifier' | 'human';

export interface Identity {
  agentId: string;
  harness: string;
  // Model provider family (anthropic, openai, xai, google...). Maker != checker compares this.
  provider: string;
  roles: Role[];
}

export type TaskState = 'held' | 'ready' | 'leased' | 'awaiting_verify' | 'done' | 'dead';

// AGENTS.md Doctrine 0: agents stage, humans execute. A task carrying any of these waits for a
// human approval before a worker can lease it.
export const HUMAN_GATES = [
  'money', 'publish', 'external-send', 'dns', 'secrets', 'credentials', 'destructive', 'legal',
] as const;
export const KNOWN_GATES = new Set<string>([...HUMAN_GATES, 'none']);

// Maker != checker compares these, so free-form spellings ("OpenAI" vs "openai") are refused at
// authentication instead of being trusted as different providers.
export const PROVIDERS = new Set([
  'anthropic', 'openai', 'google', 'xai', 'deepseek', 'mistral', 'meta', 'alibaba', 'moonshot', 'human',
]);

export const LEASE_MS = 15 * 60 * 1000;
export const TASK_ID = /^[\w.:-]{1,100}$/;
const MAX_PATHS = 50;

export class QueueError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface EnqueueInput {
  id?: string;
  title: string;
  doneCondition: string;
  priority: number;
  repo: string;
  paths: string[];
  gates: string[];
  maxMinutes?: number;
  maxAttempts?: number;
}

export function migrate(sql: Sql): void {
  sql.exec(`CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    done_condition TEXT NOT NULL,
    priority INTEGER NOT NULL,
    repo TEXT NOT NULL,
    paths TEXT NOT NULL,
    gates TEXT NOT NULL,
    state TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL,
    max_minutes INTEGER NOT NULL,
    created_by TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    approved_by TEXT,
    maker_agent TEXT,
    maker_provider TEXT,
    result_ref TEXT,
    verifier_agent TEXT,
    fingerprint TEXT NOT NULL
  )`);
  sql.exec(`CREATE INDEX IF NOT EXISTS tasks_ready ON tasks (state, priority, created_at)`);
  sql.exec(`CREATE TABLE IF NOT EXISTS leases (
    task_id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    harness TEXT NOT NULL,
    provider TEXT NOT NULL,
    repo TEXT NOT NULL,
    paths TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    fence TEXT NOT NULL
  )`);
  sql.exec(`CREATE TABLE IF NOT EXISTS events (
    seq INTEGER PRIMARY KEY AUTOINCREMENT,
    ts INTEGER NOT NULL,
    task_id TEXT NOT NULL,
    actor TEXT NOT NULL,
    kind TEXT NOT NULL,
    detail TEXT NOT NULL
  )`);
}

function requireRole(who: Identity, role: Role): void {
  if (!who.roles.includes(role)) throw new QueueError(403, `role ${role} required`);
}

function str(v: unknown, name: string, max: number): string {
  if (typeof v !== 'string' || !v.trim()) throw new QueueError(400, `${name} is required`);
  if (v.length > max) throw new QueueError(400, `${name} is longer than ${max}`);
  return v.trim();
}

function int(v: unknown, name: string, min: number, max: number, fallback?: number): number {
  if (v === undefined && fallback !== undefined) return fallback;
  // A word priority killed the queen dispatcher on 2026-07-09; integers only, never coerced.
  if (typeof v !== 'number' || !Number.isInteger(v) || v < min || v > max) {
    throw new QueueError(400, `${name} must be an integer ${min}-${max}`);
  }
  return v;
}

// One checkout on Windows answers to `Repo`, `repo` and `repo.`; all must share one collision check.
export function normalizeRepo(name: string): string {
  return name.trim().replace(/[. ]+$/, '').toLowerCase();
}

// Reduces a write glob to the directory it can touch. Anything after the first wildcard is
// dropped, so `src/*.ts` locks all of `src`: over-locking costs a wait, under-locking a clobber.
// Spellings of one path must compare equal: `src/./a`, `src//a` and, on the Windows file systems
// these worktrees live on, `SRC/a` and `src/a.` (trailing dots and spaces are dropped) all name `src/a`.
export function normalizePath(p: string): string {
  let n = p.replace(/\\/g, '/');
  const wild = n.search(/[*?[\]{}!]/);
  if (wild >= 0) n = n.slice(0, Math.max(0, n.lastIndexOf('/', wild)));
  return n.split('/').map((s) => s.replace(/[. ]+$/, '')).filter((s) => s !== '').join('/').toLowerCase();
}

// Same semantics as tools/lane.mjs: a path owns itself and everything under it; '' owns the repo.
export function pathsOverlap(a: string[], b: string[]): boolean {
  for (const x of a.map(normalizePath)) {
    for (const y of b.map(normalizePath)) {
      if (x === '' || y === '' || x === y || x.startsWith(`${y}/`) || y.startsWith(`${x}/`)) return true;
    }
  }
  return false;
}

function validPaths(v: unknown): string[] {
  if (!Array.isArray(v) || v.length === 0 || v.length > MAX_PATHS) {
    throw new QueueError(400, `paths must list 1-${MAX_PATHS} write globs`);
  }
  return v.map((p) => {
    const s = str(p, 'path', 300);
    // Rooted on any platform (`/x`, `\x`, `C:x`, `\\host\x`) or carrying a `:` (Windows alternate
    // data streams alias a file as `a.ts:stream`) would escape the repo-relative lease space.
    if (s.split(/[\\/]/).includes('..') || /^[\\/]/.test(s) || s.includes(':')) {
      throw new QueueError(400, `path ${s} must be repo-relative`);
    }
    const literal = s.replace(/\\/g, '/');
    const wild = literal.search(/[*?[\]{}!]/);
    const parts = (wild >= 0 ? literal.slice(0, Math.max(0, literal.lastIndexOf('/', wild))) : literal).split('/');
    for (const part of parts) {
      if (part !== '' && !safeName(part)) {
        throw new QueueError(400, `path segment "${part}" must be plain ASCII letters, digits, ".", "_", "-", "@" or "+", and not a Windows device name`);
      }
    }
    return s;
  });
}

// The lock compares names as strings, so only names with one spelling per file are admitted.
// ASCII-only shuts out Unicode case and normalization aliases; no spaces or "~" shuts out leading
// space trimming and 8.3 short names (PROGRA~1); device names (CON, NUL.txt) are not files at all.
const SAFE_NAME = /^[A-Za-z0-9._@+-]+$/;
const DEVICE_NAME = /^(con|prn|aux|nul|com[0-9¹²³]|lpt[0-9¹²³])(\.|$)/i;
export function safeName(part: string): boolean {
  return SAFE_NAME.test(part) && !DEVICE_NAME.test(part);
}

// Gates are mandatory so that "ungated" is a statement a producer makes, never a default.
function validGates(v: unknown): string[] {
  if (!Array.isArray(v) || v.length === 0) {
    throw new QueueError(400, `gates is required: list the gates that apply, or ["none"]`);
  }
  const gates = v.map((g) => {
    if (typeof g !== 'string' || !KNOWN_GATES.has(g)) throw new QueueError(400, `unknown gate ${String(g)}`);
    return g;
  });
  if (gates.includes('none') && gates.length > 1) throw new QueueError(400, '"none" cannot be combined with other gates');
  return [...new Set(gates)].sort();
}

// A producer can mislabel a task, so obvious money, publishing, send and secret work is held for
// a human even when it is declared ungated. This catches carelessness; credentials scoped away
// from workers are what stop a determined bypass.
const TRIPWIRE_TEXT: [string, RegExp][] = [
  ['money', /\b(price|pricing|checkout|billing|invoice|refund|payout|payment|stripe|polar|wallet|subscription)\b/i],
  ['publish', /\b(npm publish|publish|release|deploy to prod|production deploy|--prod|go live|make public)\b/i],
  ['external-send', /\b(send (an? |the |our |this )?(emails?|newsletters?|dms?|messages?|campaign)|newsletter|post to|tweet|linkedin|webhook)\b/i],
  ['dns', /\b(dns|nameserver|cname|a record)\b/i],
  ['secrets', /\b(secret|api key|token rotation|credential|password)\b/i],
];
const TRIPWIRE_PATHS: [string, RegExp][] = [
  ['secrets', /(^|\/)\.env|(^|\/)secrets?(\/|$)|\.pem$|\.key$/i],
  ['money', /(^|\/)(billing|checkout|payments?|pricing)(\/|$)/i],
  ['publish', /(^|\/)\.github\/workflows(\/|$)|(^|\/)wrangler\.(toml|jsonc?)$|(^|\/)vercel\.json$/i],
];

export function tripwire(title: string, doneCondition: string, paths: string[]): string[] {
  const hits = new Set<string>();
  const text = `${title}\n${doneCondition}`;
  for (const [gate, re] of TRIPWIRE_TEXT) if (re.test(text)) hits.add(gate);
  for (const p of paths) for (const [gate, re] of TRIPWIRE_PATHS) if (re.test(p.replace(/\\/g, '/'))) hits.add(gate);
  return [...hits].sort();
}

// Something a verifier can open: an https URL, a commit SHA, or a repo-relative file path.
export function isEvidence(ref: string): boolean {
  if (/^https:\/\/[^\s/]+\.[^\s/]+\/\S+$/.test(ref)) return true;
  if (/^[0-9a-f]{7,40}$/i.test(ref)) return true;
  return /^(?![a-zA-Z]:|\/)(?!.*\.\.)[\w.-]+(\/[\w.-]+)*\.[\w]{1,8}(#L?\d+)?$/.test(ref);
}

function event(sql: Sql, now: number, taskId: string, actor: string, kind: string, detail: object = {}): void {
  sql.exec(
    'INSERT INTO events (ts, task_id, actor, kind, detail) VALUES (?, ?, ?, ?, ?)',
    now, taskId, actor, kind, JSON.stringify(detail),
  );
}

function row(sql: Sql, id: string): Record<string, unknown> {
  const r = sql.exec('SELECT * FROM tasks WHERE id = ?', id)[0];
  if (!r) throw new QueueError(404, `no task ${id}`);
  return r;
}

// The fence is minted per lease. A worker that stalls, loses its lease and wakes up again holds an
// old fence, so it cannot heartbeat, complete or release the next attempt, even as the same agent.
function holderOf(sql: Sql, id: string, who: Identity, now: number, fence: unknown): Record<string, unknown> {
  const lease = sql.exec('SELECT * FROM leases WHERE task_id = ?', id)[0];
  const same = lease && lease.agent_id === who.agentId && lease.harness === who.harness && lease.provider === who.provider;
  if (!lease || !same || lease.fence !== fence || (lease.expires_at as number) <= now) {
    throw new QueueError(409, `${who.agentId} does not hold a live lease on ${id}`);
  }
  return lease;
}

export function enqueue(sql: Sql, who: Identity, input: EnqueueInput, now: number, newId: () => string) {
  requireRole(who, 'producer');
  const title = str(input.title, 'title', 200);
  const doneCondition = str(input.doneCondition, 'doneCondition', 2000);
  const priority = int(input.priority, 'priority', 1, 9);
  const repo = normalizeRepo(str(input.repo, 'repo', 100));
  if (!/^[\w.-]+$/.test(repo) || !safeName(repo)) throw new QueueError(400, 'repo must be a bare repository name');
  const paths = validPaths(input.paths);
  const gates = validGates(input.gates);
  const maxMinutes = int(input.maxMinutes, 'maxMinutes', 1, 480, 60);
  const maxAttempts = int(input.maxAttempts, 'maxAttempts', 1, 10, 3);
  const id = input.id === undefined ? newId() : str(input.id, 'id', 100);
  // Same character set the REST task routes accept, so every task stays reachable by id.
  if (!TASK_ID.test(id) || /^\.+$/.test(id)) throw new QueueError(400, 'id may use letters, digits, ".", ":", "_" and "-"');
  const fingerprint = JSON.stringify([who.agentId, title, doneCondition, priority, repo, paths, gates, maxMinutes, maxAttempts]);

  return sql.transaction(() => {
    // Producers retry on network errors; a supplied id makes enqueue idempotent, but only for the
    // same task. A different task under a reused id must not be reported as accepted.
    const existing = sql.exec('SELECT state, fingerprint FROM tasks WHERE id = ?', id)[0];
    if (existing) {
      if (existing.fingerprint !== fingerprint) throw new QueueError(409, `id ${id} already names a different task`);
      return { id, state: existing.state as TaskState, duplicate: true };
    }
    const tripped = tripwire(title, doneCondition, paths);
    const declared = gates.some((g) => (HUMAN_GATES as readonly string[]).includes(g));
    const state: TaskState = declared || tripped.length > 0 ? 'held' : 'ready';
    sql.exec(
      `INSERT INTO tasks (id, title, done_condition, priority, repo, paths, gates, state, max_attempts,
        max_minutes, created_by, created_at, updated_at, fingerprint) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id, title, doneCondition, priority, repo, JSON.stringify(paths), JSON.stringify(gates), state,
      maxAttempts, maxMinutes, who.agentId, now, now, fingerprint,
    );
    event(sql, now, id, who.agentId, 'enqueued', { state, gates, tripwire: tripped });
    return { id, state, duplicate: false, tripwire: tripped };
  });
}

export function approve(sql: Sql, who: Identity, id: string, now: number) {
  requireRole(who, 'human');
  return sql.transaction(() => {
    const t = row(sql, id);
    if (t.state !== 'held') throw new QueueError(409, `task ${id} is ${t.state}, not held`);
    sql.exec(`UPDATE tasks SET state = 'ready', approved_by = ?, updated_at = ? WHERE id = ?`, who.agentId, now, id);
    event(sql, now, id, who.agentId, 'approved');
    return { id, state: 'ready' as TaskState };
  });
}

export function claim(
  sql: Sql, who: Identity, opts: { repo?: string }, now: number, newFence: () => string = () => crypto.randomUUID(),
) {
  requireRole(who, 'worker');
  return sql.transaction(() => {
    sweepLocked(sql, now);
    const live = sql.exec('SELECT repo, paths FROM leases WHERE expires_at > ?', now)
      .map((l) => ({ repo: l.repo as string, paths: JSON.parse(l.paths as string) as string[] }));
    const candidates = opts.repo
      ? sql.exec(`SELECT * FROM tasks WHERE state = 'ready' AND repo = ? ORDER BY priority, created_at`, normalizeRepo(opts.repo))
      : sql.exec(`SELECT * FROM tasks WHERE state = 'ready' ORDER BY priority, created_at`);
    for (const t of candidates) {
      const paths = JSON.parse(t.paths as string) as string[];
      if (live.some((l) => l.repo === t.repo && pathsOverlap(l.paths, paths))) continue;
      const leaseMs = Math.min(LEASE_MS, (t.max_minutes as number) * 60_000);
      const expiresAt = now + leaseMs;
      const fence = newFence();
      sql.exec(
        `INSERT INTO leases (task_id, agent_id, harness, provider, repo, paths, expires_at, fence) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        t.id, who.agentId, who.harness, who.provider, t.repo, t.paths, expiresAt, fence,
      );
      sql.exec(`UPDATE tasks SET state = 'leased', updated_at = ? WHERE id = ?`, now, t.id);
      event(sql, now, t.id as string, who.agentId, 'leased', { expiresAt });
      return {
        task: {
          id: t.id as string, title: t.title as string, doneCondition: t.done_condition as string,
          priority: t.priority as number, repo: t.repo as string, paths, gates: JSON.parse(t.gates as string),
          attempt: (t.attempts as number) + 1, maxMinutes: t.max_minutes as number,
        },
        expiresAt,
        fence,
      };
    }
    return { task: null, expiresAt: null, fence: null };
  });
}

export function heartbeat(sql: Sql, who: Identity, id: string, now: number, fence: unknown) {
  return sql.transaction(() => {
    const t = row(sql, id);
    holderOf(sql, id, who, now, fence);
    // A lease may be renewed only until the task's own time box runs out.
    const leasedAt = sql.exec(
      `SELECT ts FROM events WHERE task_id = ? AND kind = 'leased' ORDER BY seq DESC LIMIT 1`, id,
    )[0]?.ts as number;
    const deadline = leasedAt + (t.max_minutes as number) * 60_000;
    const expiresAt = Math.min(now + LEASE_MS, deadline);
    if (expiresAt <= now) throw new QueueError(409, `task ${id} exceeded maxMinutes`);
    sql.exec('UPDATE leases SET expires_at = ? WHERE task_id = ?', expiresAt, id);
    return { id, expiresAt };
  });
}

export function complete(sql: Sql, who: Identity, id: string, resultRef: unknown, now: number, fence: unknown) {
  return sql.transaction(() => {
    row(sql, id);
    holderOf(sql, id, who, now, fence);
    // No evidence, no completion (AGENTS.md §3).
    const ref = str(resultRef, 'resultRef', 500);
    if (!isEvidence(ref)) throw new QueueError(400, 'resultRef must be an https URL, a commit SHA, or a repo-relative file path');
    sql.exec('DELETE FROM leases WHERE task_id = ?', id);
    sql.exec(
      `UPDATE tasks SET state = 'awaiting_verify', maker_agent = ?, maker_provider = ?, result_ref = ?,
        updated_at = ? WHERE id = ?`,
      who.agentId, who.provider, ref, now, id,
    );
    event(sql, now, id, who.agentId, 'completed', { resultRef: ref });
    return { id, state: 'awaiting_verify' as TaskState };
  });
}

function retryOrDie(sql: Sql, t: Record<string, unknown>, now: number, actor: string, kind: string, detail: object) {
  const attempts = (t.attempts as number) + 1;
  const state: TaskState = attempts >= (t.max_attempts as number) ? 'dead' : 'ready';
  sql.exec('DELETE FROM leases WHERE task_id = ?', t.id);
  sql.exec('UPDATE tasks SET state = ?, attempts = ?, updated_at = ? WHERE id = ?', state, attempts, now, t.id);
  event(sql, now, t.id as string, actor, kind, { ...detail, attempts, state });
  return state;
}

export function release(sql: Sql, who: Identity, id: string, reason: unknown, now: number, fence: unknown) {
  return sql.transaction(() => {
    const t = row(sql, id);
    holderOf(sql, id, who, now, fence);
    const state = retryOrDie(sql, t, now, who.agentId, 'released', { reason: typeof reason === 'string' ? reason.slice(0, 500) : '' });
    return { id, state };
  });
}

export function verify(sql: Sql, who: Identity, id: string, verdict: unknown, note: unknown, now: number) {
  requireRole(who, 'verifier');
  if (verdict !== 'pass' && verdict !== 'fail') throw new QueueError(400, 'verdict must be pass or fail');
  return sql.transaction(() => {
    const t = row(sql, id);
    if (t.state !== 'awaiting_verify') throw new QueueError(409, `task ${id} is ${t.state}, not awaiting_verify`);
    // Maker != checker across providers (AGENTS.md §5, CROSS-MODEL-GATE.md).
    if (who.agentId === t.maker_agent || who.provider === t.maker_provider) {
      throw new QueueError(403, `verifier must be a different provider than the maker (${t.maker_provider})`);
    }
    const detail = { verdict, note: typeof note === 'string' ? note.slice(0, 2000) : '' };
    if (verdict === 'pass') {
      sql.exec(`UPDATE tasks SET state = 'done', verifier_agent = ?, updated_at = ? WHERE id = ?`, who.agentId, now, id);
      event(sql, now, id, who.agentId, 'verified', detail);
      return { id, state: 'done' as TaskState };
    }
    sql.exec('UPDATE tasks SET verifier_agent = ? WHERE id = ?', who.agentId, id);
    return { id, state: retryOrDie(sql, t, now, who.agentId, 'rejected', detail) };
  });
}

function sweepLocked(sql: Sql, now: number): number {
  const expired = sql.exec(
    `SELECT t.* FROM leases l JOIN tasks t ON t.id = l.task_id WHERE l.expires_at <= ?`, now,
  );
  for (const t of expired) retryOrDie(sql, t, now, 'control-plane', 'lease-expired', {});
  return expired.length;
}

// Returns the next lease expiry so the Durable Object can arm exactly one alarm, or null.
export function sweep(sql: Sql, now: number): { expired: number; nextExpiry: number | null } {
  return sql.transaction(() => {
    const expired = sweepLocked(sql, now);
    const next = sql.exec('SELECT MIN(expires_at) AS next FROM leases')[0]?.next;
    return { expired, nextExpiry: typeof next === 'number' ? next : null };
  });
}

export function getTask(sql: Sql, id: string) {
  const t = row(sql, id);
  const events = sql.exec('SELECT ts, actor, kind, detail FROM events WHERE task_id = ? ORDER BY seq', id)
    .map((e) => ({ ...e, detail: JSON.parse(e.detail as string) }));
  const lease = sql.exec('SELECT agent_id, harness, provider, expires_at FROM leases WHERE task_id = ?', id)[0] ?? null;
  return { ...t, paths: JSON.parse(t.paths as string), gates: JSON.parse(t.gates as string), lease, events };
}

export function status(sql: Sql) {
  const counts: Record<string, number> = {};
  for (const r of sql.exec('SELECT state, COUNT(*) AS n FROM tasks GROUP BY state')) counts[r.state as string] = r.n as number;
  const leases = sql.exec('SELECT task_id, agent_id, harness, provider, expires_at FROM leases ORDER BY expires_at');
  return { counts, leases };
}
