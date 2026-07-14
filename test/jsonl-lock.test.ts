import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtempSync } from 'node:fs';
import { withJsonlLock } from '../src/jsonl-lock.js';

describe('withJsonlLock', () => {
  it('recovers a stale lock left by a crashed writer', () => {
    const root = mkdtempSync(join(tmpdir(), 'sis-jsonl-lock-'));
    const target = join(root, 'events.jsonl');
    const lockDir = `${target}.lock`;
    try {
      mkdirSync(lockDir);
      writeFileSync(
        join(lockDir, 'owner.json'),
        JSON.stringify({ owner: 'crashed', pid: 0, createdAt: Date.now() - 60_000 }),
        'utf-8',
      );

      const result = withJsonlLock(target, () => 'recovered', { staleAfterMs: 100, timeoutMs: 500 });
      assert.equal(result, 'recovered');
      assert.equal(existsSync(lockDir), false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('does not remove a lock whose owner token changed during unwind', () => {
    const root = mkdtempSync(join(tmpdir(), 'sis-jsonl-owner-'));
    const target = join(root, 'events.jsonl');
    const lockDir = `${target}.lock`;
    try {
      withJsonlLock(target, () => {
        writeFileSync(
          join(lockDir, 'owner.json'),
          JSON.stringify({ owner: 'successor', pid: 999, createdAt: Date.now() }),
          'utf-8',
        );
      });
      assert.equal(existsSync(lockDir), true, 'original owner removed a successor lock');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
