/**
 * Swarm Executor — test suite
 *
 * Verifies the four guarantees the engine actually makes: the concurrency cap
 * is never exceeded, results are returned in input order regardless of
 * completion order, a failing task does not sink the batch, and a hung task is
 * aborted by the per-task timeout. The real `claude -p` runner is never invoked
 * — every test injects a fake runner.
 *
 * Node.js built-in test runner (node:test + node:assert).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { runSwarm, type AgentRunner, type SwarmTask } from "./swarm.js";

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const tasksOf = (...ids: string[]): SwarmTask[] =>
  ids.map((id) => ({ id, prompt: `prompt-${id}` }));

describe("runSwarm", () => {
  it("never exceeds the concurrency cap", async () => {
    let active = 0;
    let peak = 0;
    const runner: AgentRunner = async () => {
      active++;
      peak = Math.max(peak, active);
      await delay(25);
      active--;
      return { output: "ok", exitCode: 0 };
    };

    const summary = await runSwarm(tasksOf("a", "b", "c", "d", "e", "f"), {
      concurrency: 2,
      runner,
    });

    assert.equal(summary.total, 6);
    assert.equal(summary.succeeded, 6);
    assert.ok(peak <= 2, `peak concurrency ${peak} exceeded cap of 2`);
  });

  it("returns results in input order despite out-of-order completion", async () => {
    // Earlier tasks finish later: completion order is the reverse of input.
    const runner: AgentRunner = async (task) => {
      const n = Number(task.id);
      await delay((5 - n) * 10);
      return { output: `out-${task.id}`, exitCode: 0 };
    };

    const summary = await runSwarm(tasksOf("0", "1", "2", "3", "4"), {
      concurrency: 5,
      runner,
    });

    assert.deepEqual(
      summary.results.map((r) => r.id),
      ["0", "1", "2", "3", "4"],
    );
    assert.deepEqual(
      summary.results.map((r) => r.output),
      ["out-0", "out-1", "out-2", "out-3", "out-4"],
    );
  });

  it("isolates failures — one bad task does not sink the rest", async () => {
    const runner: AgentRunner = async (task) => {
      if (task.id === "boom") throw new Error("kaboom");
      if (task.id === "nonzero") return { output: "warn", exitCode: 1 };
      return { output: "ok", exitCode: 0 };
    };

    const summary = await runSwarm(tasksOf("ok1", "boom", "nonzero", "ok2"), {
      concurrency: 4,
      runner,
    });

    assert.equal(summary.total, 4);
    assert.equal(summary.succeeded, 2);
    assert.equal(summary.failed, 2);

    const byId = Object.fromEntries(summary.results.map((r) => [r.id, r]));
    assert.equal(byId.ok1.ok, true);
    assert.equal(byId.boom.ok, false);
    assert.equal(byId.boom.error, "kaboom");
    assert.equal(byId.boom.exitCode, null);
    assert.equal(byId.nonzero.ok, false); // exit code 1 is a failure
    assert.equal(byId.nonzero.exitCode, 1);
    assert.equal(byId.ok2.ok, true);
  });

  it("aborts a hung task via the per-task timeout", async () => {
    // Runner never settles on its own; only the abort signal frees it.
    const hangingRunner: AgentRunner = (_task, signal) =>
      new Promise((_resolve, reject) => {
        if (signal.aborted) return reject(new Error("aborted"));
        signal.addEventListener("abort", () => reject(new Error("aborted")));
      });

    const start = Date.now();
    const summary = await runSwarm(tasksOf("hang"), {
      concurrency: 1,
      timeoutMs: 30,
      runner: hangingRunner,
    });
    const elapsed = Date.now() - start;

    assert.equal(summary.failed, 1);
    assert.equal(summary.results[0].ok, false);
    assert.match(summary.results[0].error ?? "", /timed out after 30ms/);
    assert.ok(elapsed < 5000, `timeout did not fire promptly (${elapsed}ms)`);
  });

  it("fires onResult once per task", async () => {
    const seen: string[] = [];
    const runner: AgentRunner = async (task) => ({
      output: task.id,
      exitCode: 0,
    });

    await runSwarm(tasksOf("x", "y", "z"), {
      concurrency: 2,
      runner,
      onResult: (r) => seen.push(r.id),
    });

    assert.equal(seen.length, 3);
    assert.deepEqual([...seen].sort(), ["x", "y", "z"]);
  });

  it("handles an empty task list without spawning workers", async () => {
    let called = false;
    const runner: AgentRunner = async () => {
      called = true;
      return { output: "", exitCode: 0 };
    };

    const summary = await runSwarm([], { runner });
    assert.equal(summary.total, 0);
    assert.equal(summary.succeeded, 0);
    assert.equal(called, false);
  });
});
