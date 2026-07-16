/**
 * src/gateway/lock.ts — mkdir-based advisory lock for JSONL append operations.
 *
 * Uses a directory as an atomic lock primitive (mkdir is atomic on POSIX and
 * Windows). Handles stale locks via a configurable takeover timeout.
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
  /** Stale lock takeover threshold in milliseconds. Default: 10000. */
  staleAfterMs?: number;
}

interface LockMeta {
  pid: number;
  ts: number;
  owner: string;
}

/**
 * Acquire a directory-based advisory lock on `lockPath`.
 * Returns a release function. Throws if the lock cannot be acquired
 * within `timeoutMs`.
 *
 * Stale-lock takeover: if the lock directory exists and its metadata
 * shows it was last touched more than `staleAfterMs` ago, we remove
 * it and try again (the previous holder crashed or was killed).
 */
export async function acquireLock(
  lockPath: string,
  opts: LockOptions = {},
): Promise<() => void> {
  const timeoutMs = opts.timeoutMs ?? 5000;
  const retryMs = opts.retryMs ?? 50;
  const staleAfterMs = opts.staleAfterMs ?? 10_000;
  const metaFile = join(lockPath, 'meta.json');
  const owner = randomUUID();

  const deadline = Date.now() + timeoutMs;

  /** Atomically remove the lock directory (recursive to handle meta.json). */
  const releaseLock = () => {
    try {
      const meta = JSON.parse(readFileSync(metaFile, 'utf-8')) as LockMeta;
      if (meta.owner === owner) rmSync(lockPath, { recursive: true, force: true });
    } catch { /* already released or replaced */ }
  };

  const tryAcquire = (): boolean => {
    // Check for stale lock before attempting mkdir
    if (existsSync(lockPath)) {
      const now = Date.now();
      let mtime = now;
      try {
        const meta = JSON.parse(readFileSync(metaFile, 'utf-8')) as Partial<LockMeta>;
        mtime = meta.ts ?? statSync(lockPath).mtimeMs;
      } catch {
        try { mtime = statSync(lockPath).mtimeMs; } catch { /* raced with release */ }
      }
      if (now - mtime > staleAfterMs) {
        // Stale lock — force remove and retry
        try { rmSync(lockPath, { recursive: true, force: true }); } catch { /* another contender won */ }
      }
    }

    try {
      mkdirSync(lockPath, { recursive: false });
      // Write PID + timestamp for staleness detection
      try {
        const meta: LockMeta = { pid: process.pid, ts: Date.now(), owner };
        writeFileSync(metaFile, JSON.stringify(meta), 'utf-8');
      } catch {
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
