/**
 * src/gateway/lock.ts — mkdir-based advisory lock for JSONL append operations.
 *
 * Uses a directory as an atomic lock primitive (mkdir is atomic on POSIX and
 * Windows). Handles stale locks by checking whether the holder is still alive.
 *
 * Two defects fixed 2026-08-30, both reproduced by execution:
 *
 *  1. Staleness was decided by the lock DIRECTORY's mtime, which stops advancing
 *     the moment `meta.json` is created — so any holder running longer than
 *     `staleAfterMs` (10s) was declared dead and its lock taken while it was
 *     still working. `LockMeta {pid, ts}` was written and then read nowhere.
 *  2. `releaseLock` was an unconditional `rmSync`. Combined with (1): B steals
 *     A's lock, A finishes and deletes what is now B's lock, and a third writer
 *     walks in. Mutual exclusion failed silently.
 *
 * Liveness, not elapsed time, decides. A slow-but-healthy writer keeps its lock;
 * a crashed one is reclaimed immediately rather than after an arbitrary wait.
 *
 * Note for anyone diffing against a published build: `dist/gateway/lock.js` has
 * carried an owner-UUID variant of this that exists in no source file and no git
 * history. That fix is folded in here, plus the liveness check it still lacked.
 *
 * Built on SIP — operational tier (memory gateway v0.1)
 */

import { mkdirSync, rmSync, existsSync, statSync, writeFileSync, readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';

export interface LockOptions {
  /** How long to retry before giving up, in milliseconds. Default: 5000. */
  timeoutMs?: number;
  /** Retry interval in milliseconds. Default: 50. */
  retryMs?: number;
  /**
   * Reclaim threshold for a lock carrying no readable metadata — a holder that
   * died between `mkdir` and writing `meta.json`. When metadata is present,
   * process liveness decides and this is ignored. Default: 30000.
   */
  staleAfterMs?: number;
}

interface LockMeta {
  pid: number;
  ts: number;
  owner: string;
}

/**
 * Signal 0 runs the existence and permission checks without delivering a signal.
 * EPERM means the process exists under another user — alive.
 */
function isProcessAlive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return (err as NodeJS.ErrnoException).code === 'EPERM';
  }
}

function readMeta(metaFile: string): LockMeta | null {
  try {
    const parsed = JSON.parse(readFileSync(metaFile, 'utf-8')) as Partial<LockMeta>;
    if (typeof parsed.pid !== 'number' || typeof parsed.owner !== 'string') return null;
    return parsed as LockMeta;
  } catch {
    return null;
  }
}

/**
 * Acquire a directory-based advisory lock on `lockPath`.
 * Returns a release function. Throws if the lock cannot be acquired
 * within `timeoutMs`.
 */
export async function acquireLock(
  lockPath: string,
  opts: LockOptions = {},
): Promise<() => void> {
  const timeoutMs = opts.timeoutMs ?? 5000;
  const retryMs = opts.retryMs ?? 50;
  const staleAfterMs = opts.staleAfterMs ?? 30_000;
  const metaFile = join(lockPath, 'meta.json');
  const owner = randomUUID();

  const deadline = Date.now() + timeoutMs;

  /** Remove the lock only while we still hold it. */
  const releaseLock = () => {
    const current = readMeta(metaFile);
    if (current && current.owner !== owner) return; // superseded — not ours to delete
    try { rmSync(lockPath, { recursive: true, force: true }); } catch { /* already gone */ }
  };

  const isAbandoned = (): boolean => {
    const meta = readMeta(metaFile);
    if (meta) return !isProcessAlive(meta.pid);
    try {
      return Date.now() - statSync(lockPath).mtimeMs > staleAfterMs;
    } catch {
      return false;
    }
  };

  const tryAcquire = (): boolean => {
    if (existsSync(lockPath) && isAbandoned()) {
      // Holder is gone. Clear it and let mkdir below arbitrate between any
      // contenders that reached this conclusion at the same moment.
      try { rmSync(lockPath, { recursive: true, force: true }); } catch { /* lost the race */ }
    }

    try {
      mkdirSync(lockPath, { recursive: false });
      try {
        const meta: LockMeta = { pid: process.pid, ts: Date.now(), owner };
        writeFileSync(metaFile, JSON.stringify(meta), 'utf-8');
      } catch {
        // Could not stamp ownership, so release could not prove the lock is
        // ours. Give it back rather than hold an unattributable lock.
        try { rmSync(lockPath, { recursive: true, force: true }); } catch { /* best effort */ }
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  return new Promise<() => void>((resolve, reject) => {
    const attempt = () => {
      if (tryAcquire()) {
        resolve(releaseLock);
        return;
      }
      if (Date.now() >= deadline) {
        reject(new Error(`Could not acquire lock at ${lockPath} within ${timeoutMs}ms`));
        return;
      }
      setTimeout(attempt, retryMs);
    };
    attempt();
  });
}

/**
 * Convenience wrapper: run `fn` under a lock on `lockDir/<name>.lock`,
 * then release. The lock is always released even if fn throws.
 */
export async function withLock<T>(
  lockPath: string,
  fn: () => Promise<T> | T,
  opts?: LockOptions,
): Promise<T> {
  const release = await acquireLock(lockPath, opts);
  try {
    return await fn();
  } finally {
    release();
  }
}
