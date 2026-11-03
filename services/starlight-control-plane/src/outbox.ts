// Webhook deliveries become queue tasks and outbox rows in one transaction; the outbox is then
// drained against GitHub with backoff. GitHub never redelivers a failed webhook by itself, so a
// remote call that fails here is retried here, and a redelivered webhook is recognised and dropped.

import * as core from './core.ts';
import type { Sql } from './core.ts';
import { makerFromBranch, type Action, type Routing } from './events.ts';
import type { GithubApi } from './github.ts';

const KEEP_MS = 7 * 24 * 3600_000;
const MAX_ATTEMPTS = 8;
const MAX_LOCK_PATHS = 50;

export function migrateOutbox(sql: Sql): void {
  sql.exec(`CREATE TABLE IF NOT EXISTS deliveries (id TEXT PRIMARY KEY, ts INTEGER NOT NULL)`);
  sql.exec(`CREATE TABLE IF NOT EXISTS outbox (
    seq INTEGER PRIMARY KEY AUTOINCREMENT,
    delivery TEXT NOT NULL,
    action TEXT NOT NULL,
    state TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    next_at INTEGER NOT NULL,
    last_error TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`);
  sql.exec(`CREATE INDEX IF NOT EXISTS outbox_due ON outbox (state, next_at)`);
}

function enqueueSafely(sql: Sql, task: core.EnqueueInput, now: number, newId: () => string) {
  try {
    return core.enqueue(sql, core.SYSTEM_PRODUCER, task, now, newId);
  } catch (err) {
    // A rule produced a task the queue refuses: record it and move on rather than retry forever.
    if (err instanceof core.QueueError) return { id: task.id ?? null, refused: err.message };
    throw err;
  }
}

// Every action, local or remote, is written to the outbox in the same transaction that records the
// delivery, so a crash between "seen" and "done" leaves work pending rather than lost.
export function ingest(sql: Sql, delivery: string, actions: Action[], now: number, newId: () => string) {
  const fresh = sql.transaction(() => {
    if (sql.exec('SELECT 1 FROM deliveries WHERE id = ?', delivery).length) return false;
    sql.exec('INSERT INTO deliveries (id, ts) VALUES (?, ?)', delivery, now);
    sql.exec('DELETE FROM deliveries WHERE ts < ?', now - KEEP_MS);
    sql.exec(`DELETE FROM outbox WHERE state IN ('done', 'failed') AND updated_at < ?`, now - KEEP_MS);
    for (const action of actions) {
      sql.exec(
        `INSERT INTO outbox (delivery, action, state, next_at, created_at, updated_at) VALUES (?, ?, 'pending', ?, ?, ?)`,
        delivery, JSON.stringify(action), now, now, now,
      );
    }
    return true;
  });
  if (!fresh) return { duplicate: true, results: [] };
  return { duplicate: false, results: drainLocal(sql, now, newId) };
}

const LOCAL = `json_extract(action, '$.type') = 'enqueue'`;

// Enqueues need no network, so they run at once and also without GitHub App credentials.
export function drainLocal(sql: Sql, now: number, newId: () => string): unknown[] {
  const rows = sql.exec(`SELECT seq, action FROM outbox WHERE state = 'pending' AND ${LOCAL} ORDER BY seq`);
  return rows.map((row) => {
    const result = enqueueSafely(sql, (JSON.parse(row.action as string) as { task: core.EnqueueInput }).task, now, newId);
    sql.exec(`UPDATE outbox SET state = 'done', updated_at = ? WHERE seq = ?`, now, row.seq);
    return result;
  });
}

// The queue locks directories by name, and only names with one spelling are admitted. A changed
// file with an unusual name locks its nearest admissible parent; too many files lock top-level
// directories; past that the whole repository. Over-locking costs a wait, under-locking a clobber.
export function lockPaths(files: string[]): string[] {
  const admissible = (f: string) => {
    const kept: string[] = [];
    for (const part of f.split('/')) {
      if (!core.safeName(part) || part === '..') break;
      kept.push(part);
    }
    return kept;
  };
  const chains = files.map(admissible);
  if (chains.some((c) => c.length === 0)) return ['.'];
  const exact = [...new Set(chains.map((c) => c.join('/')))];
  if (exact.length <= MAX_LOCK_PATHS) return exact;
  const top = [...new Set(chains.map((c) => c[0]))];
  return top.length <= MAX_LOCK_PATHS ? top : ['.'];
}

async function perform(sql: Sql, action: Action, api: GithubApi, routing: Routing, now: number, newId: () => string) {
  switch (action.type) {
    case 'enqueue':
      return enqueueSafely(sql, action.task, now, newId);
    case 'comment':
      await api.comment(action.owner, action.repo, action.number, action.body);
      return { commented: true };
    case 'label':
      await api.addLabels(action.owner, action.repo, action.number, action.labels);
      return { labelled: action.labels };
    case 'enqueue_pr': {
      const files = await api.prFiles(action.owner, action.repo, action.number);
      return enqueueSafely(sql, { ...action.task, paths: lockPaths(files) }, now, newId);
    }
    case 'evaluate_land': {
      const st = await api.prState(action.owner, action.repo, action.number, routing.codexBot);
      // Not ready is an answer, not a failure: the next push, check or review evaluates again.
      if (!st.open || st.draft || !st.checksPassed || !st.codexPassedHead) return { land: false, ...st };
      const full = `${action.owner}/${action.repo}`;
      const maker = makerFromBranch(st.branch);
      return enqueueSafely(sql, {
        id: `gh:${action.owner}.${action.repo}.${action.number}.${st.headSha.slice(0, 12)}.land`.slice(0, 100),
        title: `Land ${full}#${action.number} through pr-gate`,
        doneCondition: `\`node tools/pr-gate.mjs verify --repo ${full} --pr ${action.number}\` exits 0 and the PR merges through \`pr-gate merge\` at head ${st.headSha}, recorded in the agentic-ops-hub ledger; or a PR comment names the gate that blocked it.`,
        priority: 2, repo: action.repo, paths: [`.starlight/land/pr-${action.number}`], gates: ['none'],
        maxMinutes: 30, ...(maker?.provider ? { excludeProvider: maker.provider } : {}),
      }, now, newId);
    }
  }
}

export async function drain(
  sql: Sql, api: GithubApi, routing: Routing, now: number, newId: () => string, limit = 10,
): Promise<{ done: number; retried: number; failed: number }> {
  const tally = { done: drainLocal(sql, now, newId).length, retried: 0, failed: 0 };
  const due = sql.exec(`SELECT * FROM outbox WHERE state = 'pending' AND NOT ${LOCAL} AND next_at <= ? ORDER BY seq LIMIT ?`, now, limit);
  for (const row of due) {
    try {
      await perform(sql, JSON.parse(row.action as string), api, routing, now, newId);
      sql.exec(`UPDATE outbox SET state = 'done', updated_at = ? WHERE seq = ?`, now, row.seq);
      tally.done++;
    } catch (err) {
      const attempts = (row.attempts as number) + 1;
      const giveUp = attempts >= MAX_ATTEMPTS;
      sql.exec(
        `UPDATE outbox SET state = ?, attempts = ?, next_at = ?, last_error = ?, updated_at = ? WHERE seq = ?`,
        giveUp ? 'failed' : 'pending', attempts, now + Math.min(3600_000, 30_000 * 2 ** attempts),
        String((err as Error)?.message ?? err).slice(0, 300), now, row.seq,
      );
      if (giveUp) tally.failed++;
      else tally.retried++;
    }
  }
  return tally;
}

// Remote rows are only due when there are credentials to send them; otherwise an alarm armed for
// them would fire, find nothing it may do, and fire again at once.
export function nextDue(sql: Sql, remote = true): number | null {
  const next = sql.exec(`SELECT MIN(next_at) AS next FROM outbox WHERE state = 'pending'${remote ? '' : ` AND ${LOCAL}`}`)[0]?.next;
  return typeof next === 'number' ? next : null;
}

export function outboxStatus(sql: Sql) {
  const counts: Record<string, number> = {};
  for (const r of sql.exec('SELECT state, COUNT(*) AS n FROM outbox GROUP BY state')) counts[r.state as string] = r.n as number;
  const failed = sql.exec(`SELECT seq, action, last_error, attempts FROM outbox WHERE state = 'failed' ORDER BY seq DESC LIMIT 20`)
    .map((r) => ({ seq: r.seq, type: JSON.parse(r.action as string).type, error: r.last_error, attempts: r.attempts }));
  return { counts, failed };
}
