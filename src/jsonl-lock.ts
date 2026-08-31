/**
 * Portable advisory lock for append-only JSONL files.
 *
 * Node does not expose a cross-platform flock primitive. A lock directory is
 * atomic on Windows/macOS/Linux and is enough for SIS's single-machine,
 * multi-agent append discipline.
 *
 * Crash recovery (added 2026-08-30). The original had none: `mkdirSync` with the
 * only removal in a `finally`. A writer that was SIGKILLed, lost power, or hit an
 * EPERM on cleanup (routine on Windows when Defender or the indexer holds a
 * handle) left the lock directory behind forever, and since nothing in the
 * codebase ever removed a stale one, EVERY subsequent `MemoryManager.add()`
 * blocked for the full timeout and then threw — permanently, until a human
 * deleted the directory by hand. Reproduced: 5,004 ms then throw.
 *
 * Staleness is decided by whether the holding process is still alive, not by
 * elapsed time. A time-only rule is wrong in both directions: it steals the lock
 * from a slow-but-healthy writer, and it waits pointlessly on a dead one.
 *
 * This function is deliberately synchronous — `MemoryManager.add()` is sync and
 * callers depend on the append having happened when it returns. That means the
 * retry sleep blocks this thread; keep the critical section to a single append.
 * The async gateway path uses `src/gateway/lock.ts` instead.
 */
import { mkdirSync, rmSync, rmdirSync, unlinkSync, writeFileSync, readFileSync, statSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';

export interface JsonlLockOptions {
  timeoutMs?: number;
  retryMs?: number;
  /**
   * Only used when the lock directory carries no readable metadata — i.e. a
   * holder died between `mkdir` and writing `meta.json`. With metadata present,
   * liveness decides and this is ignored.
   */
  staleAfterMs?: number;
}

interface JsonlLockMeta {
  pid: number;
  ts: number;
  owner: string;
}

const RETRYABLE_LOCK_CODES = new Set(['EEXIST', 'EPERM', 'EACCES']);

/** How long to contend normally before considering that the holder may be dead. */
const STALE_PROBE_AFTER_MS = 250;
/** How often to re-probe once we have started. */
const STALE_PROBE_EVERY_MS = 100;

function sleep(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/**
 * Signal 0 performs the permission and existence checks without delivering a
 * signal. EPERM means the process exists but belongs to another user — alive.
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

function readMeta(metaFile: string): JsonlLockMeta | null {
  try {
    const parsed = JSON.parse(readFileSync(metaFile, 'utf-8')) as Partial<JsonlLockMeta>;
    if (typeof parsed.pid !== 'number' || typeof parsed.owner !== 'string') return null;
    return parsed as JsonlLockMeta;
  } catch {
    return null;
  }
}

function isAbandoned(lockDir: string, metaFile: string, staleAfterMs: number): boolean {
  const meta = readMeta(metaFile);
  if (meta) return !isProcessAlive(meta.pid);
  // No readable metadata: either a holder died mid-acquire, or one is writing it
  // right now. Only reclaim once the directory is old enough that the second
  // explanation is implausible.
  try {
    return Date.now() - statSync(lockDir).mtimeMs > staleAfterMs;
  } catch {
    return false;
  }
}

export function withJsonlLock<T>(
  targetPath: string,
  fn: () => T,
  options: JsonlLockOptions = {},
): T {
  const timeoutMs = options.timeoutMs ?? 5_000;
  const retryMs = options.retryMs ?? 10;
  const staleAfterMs = options.staleAfterMs ?? 30_000;
  const lockDir = `${targetPath}.lock`;
  const metaFile = join(lockDir, 'meta.json');
  const owner = randomUUID();
  const started = Date.now();
  let acquired = false;
  let lastProbeAt = 0;

  while (!acquired) {
    try {
      mkdirSync(lockDir);
      // Best-effort: a lock without metadata still excludes, it just falls back
      // to the time-based reclaim path above.
      try {
        const meta: JsonlLockMeta = { pid: process.pid, ts: Date.now(), owner };
        writeFileSync(metaFile, JSON.stringify(meta), 'utf-8');
      } catch { /* non-fatal */ }
      acquired = true;
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (!code || !RETRYABLE_LOCK_CODES.has(code)) throw err;

      // Probing for abandonment costs a readFileSync plus a statSync, and doing it on
      // every retry made the contended path far more expensive than the mkdir it guards:
      // three concurrent writers doing 100 appends each timed out at 5s where the old
      // (unrecoverable) lock finished comfortably. A lock taken milliseconds ago is not
      // abandoned, so only start probing once we have actually been waiting, and then
      // only occasionally. Crash recovery is unaffected — a dead holder is still dead a
      // quarter-second later.
      const waited = Date.now() - started;
      if (waited > STALE_PROBE_AFTER_MS && Date.now() - lastProbeAt > STALE_PROBE_EVERY_MS) {
        lastProbeAt = Date.now();
        if (isAbandoned(lockDir, metaFile, staleAfterMs)) {
          // The holder is gone. Reclaim and let the next mkdir decide the winner —
          // mkdir is atomic, so a racing contender simply loses and retries.
          try { rmSync(lockDir, { recursive: true, force: true }); } catch { /* lost the race */ }
          continue;
        }
      }

      if (Date.now() - started > timeoutMs) {
        throw new Error(`Timed out acquiring JSONL lock: ${lockDir}`);
      }
      sleep(retryMs);
    }
  }

  try {
    return fn();
  } finally {
    // Only remove a lock we still own. Without this check, a holder that was
    // declared abandoned and superseded would delete the new holder's lock on
    // its way out, leaving two writers appending to the same file.
    const current = readMeta(metaFile);
    if (!current || current.owner === owner) {
      // unlink + rmdir rather than a recursive rmSync: this runs on every append, and
      // rmSync has to readdir the directory first. The lock only ever holds meta.json.
      try { unlinkSync(metaFile); } catch { /* never written, or already gone */ }
      try { rmdirSync(lockDir); } catch {
        try { rmSync(lockDir, { recursive: true, force: true }); } catch { /* already gone */ }
      }
    }
  }
}
