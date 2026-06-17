/**
 * Portable advisory lock for append-only JSONL files.
 *
 * Node does not expose a cross-platform flock primitive. A lock directory is
 * atomic on Windows/macOS/Linux and is enough for SIS's single-machine,
 * multi-agent append discipline.
 */
import { mkdirSync, rmdirSync } from 'node:fs';

export interface JsonlLockOptions {
  timeoutMs?: number;
  retryMs?: number;
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
  const lockDir = `${targetPath}.lock`;
  const started = Date.now();
  let acquired = false;

  while (!acquired) {
    try {
      mkdirSync(lockDir);
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
    rmdirSync(lockDir);
  }
}
