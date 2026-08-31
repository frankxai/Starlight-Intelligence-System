/**
 * v9.2 — advisory locks must survive a crashed holder and must not rob a live one.
 *
 * Both defects were reproduced by execution on 2026-08-30 before these fixes:
 *
 *  - `src/jsonl-lock.ts` had no stale recovery at all. A SIGKILLed writer left the
 *    lock directory behind permanently, and every later `MemoryManager.add()`
 *    blocked the full 5s and threw. Forever, until a human deleted the directory.
 *  - `src/gateway/lock.ts` decided staleness from the lock DIRECTORY's mtime, which
 *    stops advancing once `meta.json` is written — so a healthy holder running
 *    longer than the threshold had its lock taken, and its unconditional release
 *    then deleted the new holder's lock.
 *
 * Each behaviour is tested in both directions. A recovery test with no live-holder
 * control passes just as happily against a lock that always yields, which would be
 * strictly worse than the bug it replaced.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync, spawn } from "node:child_process";

import { withJsonlLock } from "../src/jsonl-lock.ts";
import { acquireLock } from "../src/gateway/lock.ts";

function tempRoot(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "sis-lock-"));
}

/**
 * A pid that is genuinely dead: spawn a process, wait for it to exit, reuse its
 * pid. Inventing a large number would be a guess — pid reuse is rare enough over
 * a single test run that the observed exit is the honest signal.
 */
function deadPid(): number {
  const child = spawnSync(process.execPath, ["-e", "0"]);
  assert.equal(child.status, 0, "helper process did not exit cleanly");
  return child.pid as number;
}

/** Plant a lock directory as if `holderPid` were holding it. */
function plantLock(lockDir: string, holderPid: number): void {
  fs.mkdirSync(lockDir, { recursive: true });
  fs.writeFileSync(
    path.join(lockDir, "meta.json"),
    JSON.stringify({ pid: holderPid, ts: Date.now(), owner: "planted-holder" }),
    "utf-8",
  );
}

test("jsonl lock reclaims a crashed holder instead of wedging forever", () => {
  const root = tempRoot();
  try {
    const target = path.join(root, "memory.jsonl");
    plantLock(`${target}.lock`, deadPid());

    const started = Date.now();
    const TIMEOUT_MS = 10_000;
    const result = withJsonlLock(target, () => "appended", { timeoutMs: TIMEOUT_MS });
    const elapsed = Date.now() - started;

    assert.equal(result, "appended");
    // Half the timeout is generous headroom on a busy machine while still proving the
    // lock was reclaimed rather than waited out.
    assert.ok(elapsed < TIMEOUT_MS / 2, `reclaim took ${elapsed}ms of a ${TIMEOUT_MS}ms timeout — it waited instead`);
    assert.equal(fs.existsSync(`${target}.lock`), false, "lock was not released");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("jsonl lock does NOT rob a live holder", () => {
  const root = tempRoot();
  try {
    const target = path.join(root, "memory.jsonl");
    // This process is trivially alive, so it stands in for a slow healthy writer.
    plantLock(`${target}.lock`, process.pid);

    assert.throws(
      () => withJsonlLock(target, () => "should not run", { timeoutMs: 300, retryMs: 10 }),
      /Timed out acquiring JSONL lock/,
      "a live holder's lock was stolen",
    );
    assert.equal(fs.existsSync(`${target}.lock`), true, "live holder's lock was deleted");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("jsonl lock release does not delete a lock it no longer owns", () => {
  const root = tempRoot();
  try {
    const target = path.join(root, "memory.jsonl");
    const lockDir = `${target}.lock`;

    withJsonlLock(target, () => {
      // Simulate having been superseded: someone else now owns this lock.
      fs.writeFileSync(
        path.join(lockDir, "meta.json"),
        JSON.stringify({ pid: process.pid, ts: Date.now(), owner: "someone-else" }),
        "utf-8",
      );
    });

    assert.equal(fs.existsSync(lockDir), true, "released a lock owned by another holder");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("gateway lock reclaims a crashed holder", async () => {
  const root = tempRoot();
  try {
    const lockDir = path.join(root, "session.lock");
    plantLock(lockDir, deadPid());

    const started = Date.now();
    const TIMEOUT_MS = 10_000;
    const release = await acquireLock(lockDir, { timeoutMs: TIMEOUT_MS });
    const elapsed = Date.now() - started;
    release();

    assert.ok(elapsed < TIMEOUT_MS / 2, `reclaim took ${elapsed}ms of a ${TIMEOUT_MS}ms timeout — it waited instead`);
    assert.equal(fs.existsSync(lockDir), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("gateway lock does NOT steal from a holder that is merely slow", async () => {
  const root = tempRoot();
  try {
    const lockDir = path.join(root, "session.lock");
    plantLock(lockDir, process.pid);

    // staleAfterMs is deliberately tiny: under the old mtime rule this lock would
    // read as stale immediately. Liveness must override elapsed time.
    await assert.rejects(
      acquireLock(lockDir, { timeoutMs: 300, retryMs: 10, staleAfterMs: 1 }),
      /Could not acquire lock/,
      "a live holder's lock was stolen",
    );
    assert.equal(fs.existsSync(lockDir), true);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("gateway lock still excludes two contenders in the same process", async () => {
  const root = tempRoot();
  try {
    const lockDir = path.join(root, "session.lock");
    const release = await acquireLock(lockDir, { timeoutMs: 1_000 });

    await assert.rejects(
      acquireLock(lockDir, { timeoutMs: 200, retryMs: 10, staleAfterMs: 1 }),
      /Could not acquire lock/,
      "mutual exclusion broken — both contenders acquired",
    );

    release();
    const second = await acquireLock(lockDir, { timeoutMs: 1_000 });
    second();
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("a killed writer's lock is reclaimed by the next writer", async () => {
  const root = tempRoot();
  try {
    const target = path.join(root, "memory.jsonl");
    const lockDir = `${target}.lock`;

    // A real child takes the lock and is then killed mid-hold — the exact scenario
    // that used to wedge the file permanently.
    const holder = spawn(process.execPath, [
      "-e",
      `const fs=require('fs'),p=require('path');` +
        `fs.mkdirSync(${JSON.stringify(lockDir)},{recursive:true});` +
        `fs.writeFileSync(p.join(${JSON.stringify(lockDir)},'meta.json'),JSON.stringify({pid:process.pid,ts:Date.now(),owner:'child'}));` +
        `console.log('held');setInterval(()=>{},1000);`,
    ]);

    await new Promise<void>((resolve, reject) => {
      holder.stdout.on("data", (d) => String(d).includes("held") && resolve());
      holder.on("error", reject);
      setTimeout(() => reject(new Error("holder never signalled")), 10_000);
    });

    holder.kill("SIGKILL");
    await new Promise<void>((resolve) => holder.on("exit", () => resolve()));

    assert.equal(fs.existsSync(lockDir), true, "precondition: killed holder left its lock behind");
    const result = withJsonlLock(target, () => "recovered", { timeoutMs: 5_000 });
    assert.equal(result, "recovered");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
