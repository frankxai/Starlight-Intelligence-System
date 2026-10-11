/**
 * src/gateway/lock.ts — mkdir-based advisory lock for JSONL append operations.
 *
 * Uses a directory as an atomic lock primitive (mkdir is atomic on POSIX and
 * Windows). Existing locks are preserved regardless of age.
 *
 * Built on SIP — operational tier (memory gateway v0.1)
 */

import { mkdirSync, rmdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync, lstatSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { hostname } from 'node:os';
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
  host?: string;
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
        const meta: LockMeta = { pid: process.pid, ts: Date.now(), token, host: hostname() };
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

export interface LockInspection {
  locked: boolean;
  lockPath: string;
  meta?: LockMeta;
  corrupted?: boolean;
}

function readLockMeta(metaFile: string): LockMeta {
  const stat = lstatSync(metaFile);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 4096) throw new Error('Invalid lock metadata');
  const meta = JSON.parse(readFileSync(metaFile,'utf8')) as LockMeta;
  if (!meta || Array.isArray(meta) || !Number.isSafeInteger(meta.pid) || meta.pid < 1
    || !Number.isFinite(meta.ts) || meta.ts < 0 || typeof meta.token !== 'string'
    || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(meta.token)
    || (meta.host !== undefined && (typeof meta.host !== 'string' || !meta.host || meta.host.length > 255))) {
    throw new Error('Invalid lock metadata');
  }
  return meta;
}

/**
 * Inspect the state of an existing directory lock.
 * Read-only; never mutates or releases lock state.
 */
export function inspectLock(lockPath: string): LockInspection {
  lockPath = resolve(lockPath);
  const metaFile = join(lockPath, 'meta.json');
  let directoryExists = false;
  try {
    const stat = lstatSync(lockPath);
    directoryExists = true;
    if (!stat.isDirectory() || stat.isSymbolicLink()) return { locked:true,lockPath,corrupted:true };
    const contents = readdirSync(lockPath);
    if (contents.length !== 1 || contents[0] !== 'meta.json') {
      return { locked: true, lockPath, corrupted: true };
    }
    const meta = readLockMeta(metaFile);
    return { locked: true, lockPath, meta };
  } catch (error) {
    if (!directoryExists && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { locked: false, lockPath };
    }
    return { locked: true, lockPath, corrupted: true };
  }
}

/**
 * Explicit recovery of an inspected local lock. Age never authorizes takeover.
 * Unknown hosts, live owners and uncertain liveness preserve the evidence.
 */
export function breakStaleLock(lockPath: string, expectedToken: string): boolean {
  if (typeof expectedToken !== 'string' || !expectedToken) throw new Error('Inspected lock token required');
  lockPath = resolve(lockPath);
  const guardPath = `${lockPath}.recovery`;
  const guardMeta = join(guardPath, 'meta.json');
  const guardToken = randomUUID();
  try { mkdirSync(guardPath); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') throw new Error('Lock recovery is active or unverified; preserved lock');
    throw error;
  }
  let initialized = false;
  try {
    writeFileSync(guardMeta, JSON.stringify({ pid:process.pid,ts:Date.now(),token:guardToken,host:hostname() }), { encoding:'utf8',flag:'wx' });
    initialized = true;
    const metaFile = join(lockPath, 'meta.json');
    const inspection = inspectLock(lockPath);
    if (!inspection.locked) return false;
    if (inspection.corrupted || !inspection.meta) throw new Error('Lock recovery evidence is incomplete or corrupted');
    const meta = inspection.meta;
    if (meta.token !== expectedToken) throw new Error('Lock token does not match expected token');
    if (meta.host !== hostname()) throw new Error('Lock owner host is unknown or remote; preserved lock');
    let dead = false;
    try { process.kill(meta.pid,0); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ESRCH') throw new Error('Lock owner liveness is uncertain; preserved lock');
      dead = true;
    }
    if (!dead) throw new Error('Lock owner is still alive; preserved lock');
    const current = inspectLock(lockPath);
    if (current.corrupted || !current.meta || current.meta.token !== meta.token
      || current.meta.pid !== meta.pid || current.meta.ts !== meta.ts || current.meta.host !== meta.host) {
      throw new Error('Lock recovery evidence changed; preserved lock');
    }
    unlinkSync(metaFile);
    rmdirSync(lockPath);
    return true;
  } finally {
    if (initialized) {
      if (readLockMeta(guardMeta).token !== guardToken) throw new Error('Recovery guard ownership changed; preserved evidence');
      const contents = readdirSync(guardPath);
      if (contents.length !== 1 || contents[0] !== 'meta.json') throw new Error('Unexpected recovery guard contents; preserved evidence');
      unlinkSync(guardMeta);
    }
    // An interrupted recoverer leaves this guard intact. Never remove it by age.
    rmdirSync(guardPath);
  }
}
