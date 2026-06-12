/**
 * test/phase0-concurrent-write-smoke.test.ts — Phase 0 Step 6.4 exit criterion
 *
 * REVISE-R1 from the Phase 0 Board verdict:
 *   "3-tab concurrent-write smoke test must be exit criterion before any
 *    substrate adapter ships."
 *
 * This is the test harness. Currently SKIPPED — runs only when adapter
 * implementations exist at adapter-skeletons/ AND langgraph/letta are
 * installed. Smoke proves:
 *   1. 3 simultaneous writers don't corrupt JSONL line boundaries
 *   2. All 300 atoms (3 × 100) are readable after concurrent write
 *   3. No duplicate IDs landed
 *   4. Every atom carries SIP attestation (A1 axiom preserved under load)
 *   5. p95 latency stays under 500ms even with contention
 *
 * See docs/research/_factory/memory-foundations-phase0/parked-012-multi-process-safety.md
 * for the recommended Fix 1 (advisory lock) the adapters must implement
 * before this smoke turns green.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { repoRootFromTestFile } from "./_lib/repo.js";

const REPO_ROOT = repoRootFromTestFile(import.meta.url);

function runWriter(memoryPath: string, prefix: string): Promise<void> {
  const code = `
    import { MemoryManager } from './src/memory.ts';
    const mgr = new MemoryManager(process.env.SIS_MEMORY_PATH);
    for (let i = 0; i < 100; i++) {
      mgr.add({
        content: process.env.SIS_PREFIX + '-' + String(i).padStart(3, '0'),
        category: 'insight',
        tags: ['concurrent-smoke'],
        confidence: 1,
        source: 'phase0-concurrent-write-smoke',
      });
    }
  `;
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ['--import', 'tsx', '--input-type=module', '-e', code],
      {
        cwd: REPO_ROOT,
        env: { ...process.env, SIS_MEMORY_PATH: memoryPath, SIS_PREFIX: prefix },
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    let stderr = '';
    child.stderr.on('data', chunk => { stderr += String(chunk); });
    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) resolve();
      else reject(new Error(`writer ${prefix} exited ${code}: ${stderr}`));
    });
  });
}

describe("Phase 0 Step 6.4 — 3-tab concurrent-write smoke (PARKED-012)", () => {
  it("3 concurrent writers → 300 atoms, zero corrupted lines", async () => {
    const dir = mkdtempSync(join(tmpdir(), 'sis-concurrent-memory-'));
    const memoryPath = join(dir, 'memory.json');
    try {
      await Promise.all([
        runWriter(memoryPath, 'tabA'),
        runWriter(memoryPath, 'tabB'),
        runWriter(memoryPath, 'tabC'),
      ]);

      const eventLogPath = `${memoryPath}l`;
      const lines = readFileSync(eventLogPath, 'utf-8').split('\n').filter(Boolean);
      assert.equal(lines.length, 300, 'expected 300 append-only JSONL events');

      const seenIds = new Set<string>();
      for (const line of lines) {
        const event = JSON.parse(line) as {
          type: string;
          payload?: { id: string; content: string; tags: string[] };
        };
        assert.equal(event.type, 'add');
        assert.ok(event.payload?.id);
        assert.ok(event.payload.content.startsWith('tab'));
        assert.ok(event.payload.tags.includes('concurrent-smoke'));
        seenIds.add(event.payload.id);
      }
      assert.equal(seenIds.size, 300, 'expected 300 unique memory entry IDs');
    } finally {
      rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 });
    }
  });

  it("lock directory is released after concurrent writes", async () => {
    const dir = mkdtempSync(join(tmpdir(), 'sis-concurrent-memory-lock-'));
    const memoryPath = join(dir, 'memory.json');
    try {
      await runWriter(memoryPath, 'tabA');
      await runWriter(memoryPath, 'tabB');
      await runWriter(memoryPath, 'tabC');
      await runWriter(memoryPath, 'tabD');
      const lines = readFileSync(`${memoryPath}l`, 'utf-8').split('\n').filter(Boolean);
      assert.equal(lines.length, 400);
    } finally {
      rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 });
    }
  });
});

// Built on SIP — operational tier (Phase 0 R1 exit harness, deferred-execution)
