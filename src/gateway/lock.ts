/**
 * src/gateway/lock.ts — mkdir-based advisory lock for JSONL append operations.
 *
 * Uses a directory as an atomic lock primitive (mkdir is atomic on POSIX and
 * Windows). Existing locks are preserved regardless of age.
 *
 * Built on SIP — operational tier (memory gateway v0.1)
 */

import { mkdirSync, rmdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { join, resolve } from 'node:path';

export interface LockOptions {
  /** How long to retry before giving up, in milliseconds. Default: 5000. */
  timeoutMs?: number;
  /** Retry interval in milliseconds. Default: 50. */
  retryMs?: number;
  /** Deprecated compatibility field; age-based takeover is disabled. */
  staleAfterMs?: number;
}

interface LockMeta {
  pid: number;
  ts: number;
  token: string;
}

/**
 * Acquire a directory-based advisory lock on `lockPath`.
 * Returns a release function. Throws if the lock cannot be acquired
 * within `timeoutMs`.
 *
 * A timeout never authorizes deleting another writer's lock.
 */
export async function acquireLock(
  lockPath: string,
  opts: LockOptions = {},
): Promise<() => void> {
  lockPath = resolve(lockPath);
  const timeoutMs = opts.timeoutMs ?? 5000;
  const retryMs = opts.retryMs ?? 50;
  const metaFile = join(lockPath, 'meta.json');
  const token = randomUUID();
  let released = false;
  if (!Number.isFinite(timeoutMs) || timeoutMs < 0 || !Number.isFinite(retryMs) || retryMs < 1) throw new Error('Invalid lock timing');

  const deadline = Date.now() + timeoutMs;

  /** Remove only our metadata and an otherwise empty directory. */
  const releaseLock = () => {
    if (released) return;
    const meta = JSON.parse(readFileSync(metaFile, 'utf8')) as LockMeta;
    if (meta.token !== token) throw new Error('Lock ownership changed; preserved lock');
    const contents = readdirSync(lockPath);
    if (contents.length !== 1 || contents[0] !== 'meta.json') throw new Error('Unexpected lock contents; preserved ownership evidence');
    unlinkSync(metaFile);
    rmdirSync(lockPath);
    released = true;
  };

  const tryAcquire = (): boolean => {
    try {
      mkdirSync(lockPath, { recursive: false });
      // Keep owner metadata for explicit recovery; age never authorizes takeover.
      try {
        const meta: LockMeta = { pid: process.pid, ts: Date.now(), token };
        writeFileSync(metaFile, JSON.stringify(meta), { encoding:'utf-8',flag:'wx' });
      } catch (error) { try { rmdirSync(lockPath); } catch { /* Preserve unexpected content. */ } throw error; }
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      return false;
    }
  };

  return new Promise<() => void>((resolve, reject) => {
    const attempt = () => {
      try {
        if (tryAcquire()) { resolve(releaseLock); return; }
        if (Date.now() >= deadline) { reject(new Error(`Could not acquire lock within ${timeoutMs}ms; existing owner preserved`)); return; }
        setTimeout(attempt, retryMs);
      } catch (error) { reject(error); }
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
