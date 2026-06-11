/**
 * Swarm Executor — real OS-level parallel agent fan-out
 *
 * The orchestrator's "Parallel" pattern is in-process and framework-only: it
 * invokes an AgentExecutor callback. This module is the concrete counterpart —
 * it spawns N independent headless agent processes (default: `claude -p`),
 * bounded by a concurrency cap, isolates failures, enforces a per-task timeout,
 * and returns results in input order.
 *
 * This replaces the prior `/swarm` path in cli.ts, which only launched the
 * Antigravity binary interactively and fanned out nothing (the "96-mind swarm"
 * was narration). The runner is injected, so the engine is testable without
 * spawning any real agent; the default runner wires the real `claude -p` CLI.
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

export interface SwarmTask {
  id: string;
  prompt: string;
}

export interface SwarmResult {
  id: string;
  ok: boolean;
  output: string;
  exitCode: number | null;
  durationMs: number;
  /** Present only when the runner threw or the task timed out. */
  error?: string;
}

/**
 * Runs a single task to completion. Resolves with the agent's stdout and exit
 * code; rejects (or honors `signal` abort) on spawn failure or timeout. Inject
 * a fake in tests; the default spawns `claude -p`.
 */
export type AgentRunner = (
  task: SwarmTask,
  signal: AbortSignal,
) => Promise<{ output: string; exitCode: number | null }>;

export interface SwarmOptions {
  /** Max tasks in flight at once. Default 4. */
  concurrency?: number;
  /** Per-task wall-clock budget in ms before the task is aborted. Default 300_000. */
  timeoutMs?: number;
  /** Process runner. Default: headless `claude -p`. */
  runner?: AgentRunner;
  /** Fired as each task settles (in completion order, not input order). */
  onResult?: (result: SwarmResult) => void;
}

export interface SwarmSummary {
  total: number;
  succeeded: number;
  failed: number;
  results: SwarmResult[];
}

const DEFAULT_CONCURRENCY = 4;
const DEFAULT_TIMEOUT_MS = 300_000;

function resolveClaudeBin(): string {
  if (process.env.STARLIGHT_CLAUDE_BIN) return process.env.STARLIGHT_CLAUDE_BIN;
  const known = "C:\\Users\\frank\\.local\\bin\\claude.exe";
  return existsSync(known) ? known : "claude";
}

/**
 * Default runner — headless `claude -p <prompt>`. stderr is folded into output
 * only when stdout is empty so a failing agent still surfaces a diagnostic.
 * shell:false so prompts with spaces/quotes pass as a single literal argv.
 */
export const defaultClaudeRunner: AgentRunner = (task, signal) =>
  new Promise((resolve, reject) => {
    const child = spawn(resolveClaudeBin(), ["-p", task.prompt], {
      shell: false,
      signal,
    });

    let out = "";
    let err = "";
    child.stdout?.on("data", (chunk) => {
      out += chunk;
    });
    child.stderr?.on("data", (chunk) => {
      err += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      resolve({ output: out.trim() || err.trim(), exitCode: code });
    });
  });

/**
 * Fan tasks out across a bounded worker pool. Never rejects: a runner that
 * throws or a task that times out becomes an `ok: false` result, so one bad
 * task cannot sink the batch. Results are returned in input order regardless
 * of completion order.
 */
export async function runSwarm(
  tasks: SwarmTask[],
  options: SwarmOptions = {},
): Promise<SwarmSummary> {
  const concurrency = Math.max(1, options.concurrency ?? DEFAULT_CONCURRENCY);
  const timeoutMs = Math.max(1, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const runner = options.runner ?? defaultClaudeRunner;

  const results = new Array<SwarmResult>(tasks.length);
  let cursor = 0;

  async function worker(): Promise<void> {
    while (true) {
      const index = cursor++;
      if (index >= tasks.length) return;
      const task = tasks[index];

      const start = Date.now();
      const controller = new AbortController();
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeoutMs);

      let result: SwarmResult;
      try {
        const { output, exitCode } = await runner(task, controller.signal);
        result = {
          id: task.id,
          ok: exitCode === 0,
          output,
          exitCode,
          durationMs: Date.now() - start,
        };
      } catch (err) {
        result = {
          id: task.id,
          ok: false,
          output: "",
          exitCode: null,
          durationMs: Date.now() - start,
          error: timedOut
            ? `timed out after ${timeoutMs}ms`
            : err instanceof Error
              ? err.message
              : String(err),
        };
      } finally {
        clearTimeout(timer);
      }

      results[index] = result;
      options.onResult?.(result);
    }
  }

  const poolSize = Math.min(concurrency, tasks.length);
  await Promise.all(Array.from({ length: poolSize }, () => worker()));

  const succeeded = results.filter((r) => r.ok).length;
  return {
    total: results.length,
    succeeded,
    failed: results.length - succeeded,
    results,
  };
}
