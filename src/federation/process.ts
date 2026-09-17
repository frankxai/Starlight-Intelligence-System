import { spawn } from "node:child_process";
import { isAbsolute } from "node:path";
import type { AgentRunner } from "../swarm.js";
import { boundedText, positiveInteger } from "./boundary.js";

export interface ProcessRunnerOptions {
  /** Trusted absolute executable path; .cmd, .bat and .ps1 launch scripts are not accepted. */
  command: string;
  args?: readonly string[];
  cwd: string;
  /** Complete child environment. Parent credentials are not inherited. */
  env?: Readonly<Record<string, string>>;
  maxOutputBytes?: number;
}

/** One request on stdin, one result on stdout, then exit. This is not an MCP/ACP transport. */
export function createProcessRunner(options: ProcessRunnerOptions): AgentRunner {
  if (!isAbsolute(options.command) || !isAbsolute(options.cwd) || /\.(cmd|bat|ps1)$/i.test(options.command)) {
    throw new Error("Worker requires absolute executable/cwd paths; launch scripts are unsupported");
  }
  const command = options.command;
  const args = [...(options.args ?? [])];
  const cwd = options.cwd;
  const env: NodeJS.ProcessEnv = { ...options.env };
  // Windows process startup may need SystemRoot. Never inherit PATH or provider credentials.
  if (process.platform === "win32" && !env.SystemRoot && process.env.SystemRoot) env.SystemRoot = process.env.SystemRoot;
  const maxBytes = positiveInteger(options.maxOutputBytes ?? 262_144, "maxOutputBytes", 4_194_304);
  return (task, signal) => new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new Error("Execution cancelled")); return; }
    const prompt = boundedText(task.prompt, "prompt", 1_048_576);
    const child = spawn(command, args, { cwd, env, shell: false, windowsHide: true, stdio: "pipe" });
    const chunks: Buffer[] = [];
    let size = 0;
    let failure: string | undefined;
    const fail = (reason: string) => {
      failure ??= reason;
      child.kill("SIGKILL");
    };
    const abort = () => fail("Execution cancelled");
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
    child.stdout.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > maxBytes) fail("Worker output exceeds byte limit");
      else chunks.push(chunk);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > maxBytes) fail("Worker output exceeds byte limit");
      // Drain diagnostics, but never return environment or credential-bearing stderr.
    });
    child.stdin.on("error", () => fail("Worker input failed"));
    child.on("error", () => { failure ??= "Worker process could not start"; });
    child.on("close", code => {
      signal.removeEventListener("abort", abort);
      if (failure) { reject(new Error(failure)); return; }
      if (code !== 0) { reject(new Error(`Worker process exited with ${code}`)); return; }
      try {
        const lines = new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)).trim().split(/\r?\n/);
        if (lines.length !== 1) throw new Error("Worker must emit exactly one JSON line");
        const result = JSON.parse(lines[0]);
        if (result?.version !== "1.0" || result.id !== task.id || !Number.isSafeInteger(result.exitCode)) {
          throw new Error("Invalid worker response envelope");
        }
        resolve({ output: boundedText(result.output, "worker output", maxBytes), exitCode: result.exitCode });
      } catch {
        reject(new Error("Invalid worker response; expected one versioned JSON result matching the task id"));
      }
    });
    child.stdin.end(JSON.stringify({ version: "1.0", id: task.id, prompt }) + "\n");
  });
}
