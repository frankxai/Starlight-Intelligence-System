/**
 * Portable advisory lock for append-only JSONL files.
 *
 * Node does not expose a cross-platform flock primitive. A lock directory is
 * atomic on Windows/macOS/Linux and is enough for SIS's single-machine,
 * multi-agent append discipline.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';

export interface JsonlLockOptions {
  timeoutMs?: number;
  retryMs?: number;
  staleAfterMs?: number;
}

const RETRYABLE_LOCK_CODES = new Set(['EEXIST', 'EPERM', 'EACCES']);

function sleep(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

export function withJsonlLock<T>(
  targetPath: string,
  fn: () => T,
  options: JsonlLockOptions = {},
): T {
  const timeoutMs = options.timeoutMs ?? 5_000;
  const retryMs = options.retryMs ?? 10;
  const staleAfterMs = options.staleAfterMs ?? 300_000;
  const lockDir = `${targetPath}.lock`;
  const ownerFile = join(lockDir, 'owner.json');
  const owner = randomUUID();
  const started = Date.now();
  let acquired = false;

  while (!acquired) {
    if (existsSync(lockDir)) {
      let lockTimestamp = 0;
      try {
        const parsed = JSON.parse(readFileSync(ownerFile, 'utf-8')) as { createdAt?: number };
        lockTimestamp = parsed.createdAt ?? 0;
      } catch {
        try { lockTimestamp = statSync(lockDir).mtimeMs; } catch { /* raced with release */ }
      }
      if (lockTimestamp > 0 && Date.now() - lockTimestamp > staleAfterMs) {
        try { rmSync(lockDir, { recursive: true, force: true }); } catch { /* another contender won */ }
      }
    }

    try {
      mkdirSync(lockDir);
      try {
        writeFileSync(ownerFile, JSON.stringify({ owner, pid: process.pid, createdAt: Date.now() }), 'utf-8');
      } catch (error) {
        try { rmSync(lockDir, { recursive: true, force: true }); } catch { /* best effort */ }
        throw error;
      }
      acquired = true;
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (!code || !RETRYABLE_LOCK_CODES.has(code)) throw err;
      if (Date.now() - started > timeoutMs) {
        throw new Error(`Timed out acquiring JSONL lock: ${lockDir}`);
      }
      sleep(retryMs);
    }
  }

  try {
    return fn();
  } finally {
    // A stale-lock takeover can replace this directory while the original
    // holder is still unwinding. Only the current owner may remove it.
    try {
      const parsed = JSON.parse(readFileSync(ownerFile, 'utf-8')) as { owner?: string };
      if (parsed.owner === owner) rmSync(lockDir, { recursive: true, force: true });
    } catch { /* already released or replaced */ }
  }
}
