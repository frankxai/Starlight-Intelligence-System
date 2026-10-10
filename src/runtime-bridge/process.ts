import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute } from "node:path";
import { boundedJson, identifier, MAX_PAYLOAD_BYTES, type WorkerRuntime } from "./contracts.js";

/** JSON-line worker transport. This does not install or grant authority to a
 * native harness. The host pins a real executable and fixed argv; requests go
 * through stdin, never a shell. Workers must implement starlight.worker.v1. */
export function createProcessWorkerRuntime(options: {
  id: string;
  executable: string;
  executableSha256: string;
  args: string[];
  cwd: string;
  env?: Record<string, string>;
}): WorkerRuntime {
  if (!identifier(options.id) || !isAbsolute(options.executable) || !isAbsolute(options.cwd)
    || !/^[a-f0-9]{64}$/.test(options.executableSha256)
    || !Array.isArray(options.args) || options.args.some(a => typeof a !== "string" || a.includes("\0"))
    || options.args.length > 64 || options.args.join("").length > 16_384) {
    throw new Error("Invalid process worker binding");
  }
  const executable = realpathSync(options.executable);
  const cwd = realpathSync(options.cwd);
  if (!lstatSync(executable).isFile() || !lstatSync(cwd).isDirectory()
    || /\.(cmd|bat|ps1)$/i.test(executable)) throw new Error("Worker requires a native executable and directory");
  const digest = options.executableSha256;
  const id = options.id;
  const args = [...options.args];
  // No ambient provider secrets or host MCP configuration are inherited.
  const env = { ...options.env };
  return {
    id,
    invoke(request, signal) {
      if (signal.aborted) return Promise.reject(new Error("Worker aborted before launch"));
      if (createHash("sha256").update(readFileSync(executable)).digest("hex") !== digest) {
        return Promise.reject(new Error("Worker executable differs from host pin"));
      }
      const input = boundedJson(request);
      return new Promise((resolve, reject) => {
        const child = spawn(executable, args, { cwd, env, shell: false, windowsHide: true,
          signal, stdio: ["pipe", "pipe", "pipe"] });
        const chunks: Buffer[] = [];
        let bytes = 0;
        let overflow = false;
        child.stdout.on("data", (chunk: Buffer) => {
          bytes += chunk.length;
          if (bytes > MAX_PAYLOAD_BYTES) {
            overflow = true;
            child.kill();
          } else chunks.push(chunk);
        });
        // Drain diagnostics without storing potentially sensitive stderr.
        child.stderr.on("data", () => {});
        child.stdin.on("error", () => {});
        child.on("error", reject);
        child.on("close", code => {
          if (overflow || code !== 0 || signal.aborted) {
            reject(new Error("Worker did not produce a confirmed bounded response"));
            return;
          }
          try {
            const text = new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks));
            resolve(JSON.parse(text));
          } catch { reject(new Error("Invalid worker JSON response")); }
        });
        child.stdin.end(input + "\n");
      });
    },
  };
}
