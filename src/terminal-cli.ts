import { closeSync, fsyncSync, openSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join } from "node:path";
import { createHttpWorkerRuntime, createOpenCodeRuntime, createProcessWorkerRuntime, type WorkerRuntime } from "./runtime-bridge/index.js";
import { parseOpenCodeUsage } from "./runtime-bridge/opencode.js";
import { CreatorWorkspace, createCreatorPacket } from "./creator-workspace.js";
import { parseTerminalPacket, TERMINAL_DOMAINS, TerminalRunJournal, terminalDigest,
  type TerminalAdmission } from "./terminal-runtime.js";

const USAGE = `Terminal operations:
  starlight domain list
  starlight harness doctor
  starlight run start --file <absolute-packet> --host <absolute-host-binding> --authorize
  starlight run inspect <run-id>
  starlight run usage <run-id>  (local OpenCode final-message observation)
  starlight run handoff <run-id>
  starlight run resume <run-id>  (exports state; destination admission is required)
  starlight run import --file <absolute-handoff>
  starlight creator packet --file <absolute-brief> --work-ref <issue-or-task-ref>
  starlight creator capture <run-id> --file <absolute-brief> --workspace <absolute-directory>
  starlight creator edit <run-id> --file <absolute-draft> --expected <revision-sha256> --workspace <absolute-directory>
  starlight creator inspect <run-id> --workspace <absolute-directory>
  starlight creator export <run-id> --workspace <absolute-directory>
  --journal <absolute-directory> defaults to ~/.starlight/runs/terminal

Host bindings are private operator inputs, not portable work packets.
No daemon, provider, native harness, or recurring workflow starts on discovery.`;

function load(path: string | undefined): unknown {
  if (!path || !isAbsolute(path)) throw new Error("Input files require an absolute path");
  const bytes = readFileSync(path);
  if (bytes.length > 262_144) throw new Error("Input exceeds 256 KiB");
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}

function object(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected object");
  return value as Record<string, unknown>;
}

/** Kept separate so importing the SDK never starts a CLI or connects a host. */
export async function runTerminalCli(argv: string[]): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  try {
    const args: string[] = [];
    const flags: Record<string, string | boolean> = {};
    for (let i = 0; i < argv.length; i++) {
      const arg = argv[i];
      if (arg === "--authorize") {
        if (flags.authorize) throw new Error("Duplicate authorization flag");
        flags.authorize = true;
      } else if (["--file", "--host", "--journal", "--workspace", "--expected", "--work-ref"].includes(arg)) {
        if (flags[arg.slice(2)] !== undefined || !argv[i + 1] || argv[i + 1].startsWith("--")) {
          throw new Error("Missing or duplicate option: " + arg);
        }
        flags[arg.slice(2)] = argv[++i];
      } else if (arg.startsWith("--")) throw new Error("Unsupported option: " + arg);
      else args.push(arg);
    }
    const [command, action, id] = args;
    if (command === "creator") {
      if (action === "packet" && args.length === 2 && typeof flags["work-ref"] === "string") {
        return { exitCode: 0, stdout: JSON.stringify(createCreatorPacket(load(flags.file as string | undefined), flags["work-ref"]), null, 2), stderr: "" };
      }
      if (args.length !== 3 || !["capture", "edit", "inspect", "export"].includes(action)
        || typeof flags.workspace !== "string") throw new Error("Creator operation requires a run ID and absolute workspace");
      const workspace = new CreatorWorkspace(flags.workspace);
      let result: unknown;
      if (action === "capture") {
        const input = load(flags.file as string | undefined);
        if (object(input).id !== id) throw new Error("Creator brief identity mismatch");
        result = workspace.capture(input, new TerminalRunJournal(typeof flags.journal === "string" ? flags.journal : join(homedir(), ".starlight", "runs", "terminal")));
      } else if (action === "edit") {
        if (typeof flags.expected !== "string") throw new Error("Creator edits require the expected revision SHA256");
        result = workspace.edit(id, load(flags.file as string | undefined), flags.expected);
      } else if (action === "export") result = workspace.export(id);
      else { result = workspace.inspect(id); if (!result) throw new Error("Creator artifact not found"); }
      return { exitCode: 0, stdout: JSON.stringify(result, null, 2), stderr: "" };
    }
    if (command === "domain" && action === "list" && args.length === 2) {
      return { exitCode: 0, stdout: JSON.stringify(TERMINAL_DOMAINS, null, 2), stderr: "" };
    }
    if (command === "harness" && action === "doctor" && args.length === 2) {
      return { exitCode: 0, stdout: JSON.stringify({
        execution: "requires-explicit-host-binding",
        transports: ["process-json", "https-worker", "host-connected-mcp", "opencode-server-1.18.35"],
        nativeHarnesses: ["codex", "claude-code", "opencode", "goose", "hermes"].map(name => ({
          name, status: "not-probed", nativeSessionMigration: "unsupported",
        })),
        context: "explicit-allowlist", fleetAdmission: "host-owned", usage: "unknown",
      }, null, 2), stderr: "" };
    }
    if (command !== "run" || !["start", "inspect", "usage", "handoff", "resume", "import"].includes(action)) {
      return { exitCode: 2, stdout: "", stderr: USAGE };
    }
    const expected = ["inspect", "usage", "handoff", "resume"].includes(action) ? 3 : 2;
    if (args.length !== expected) throw new Error("Unexpected or missing command arguments");
    const journalPath = typeof flags.journal === "string" ? flags.journal : join(homedir(), ".starlight", "runs", "terminal");
    if (action === "start") {
      if (flags.authorize !== true) throw new Error("Local execution requires --authorize and an exact host binding");
      const packet = parseTerminalPacket(load(flags.file as string | undefined));
      const host = object(load(flags.host as string | undefined));
      if (host.version !== "starlight.terminal-host.v1" || host.packetSha256 !== terminalDigest(packet)) {
        throw new Error("Host binding does not authorize this exact packet");
      }
      if (!Number.isSafeInteger(host.timeoutMs) || (host.timeoutMs as number) < 1 || (host.timeoutMs as number) > 300_000) {
        throw new Error("Host requires a bounded timeout");
      }
      if (host.contextKeys !== undefined && (!Array.isArray(host.contextKeys) || !host.contextKeys.every(k => typeof k === "string"))) {
        throw new Error("Host context keys must be a string array");
      }
      const binding = object(host.runtime);
      let runtime: WorkerRuntime;
      if (binding.kind === "process") {
        if (typeof binding.id !== "string" || typeof binding.executable !== "string"
          || typeof binding.executableSha256 !== "string" || typeof binding.cwd !== "string"
          || !Array.isArray(binding.args) || !binding.args.every(arg => typeof arg === "string")) {
          throw new Error("Invalid host process binding");
        }
        runtime = createProcessWorkerRuntime({ id: binding.id, executable: binding.executable,
          executableSha256: binding.executableSha256, args: binding.args, cwd: binding.cwd });
      } else if (binding.kind === "http") {
        if (typeof binding.id !== "string" || typeof binding.endpoint !== "string"
          || (binding.allowLoopbackHttp !== undefined && typeof binding.allowLoopbackHttp !== "boolean")) {
          throw new Error("Invalid host HTTP binding");
        }
        const headers: Record<string, string> = {};
        if (binding.tokenEnv !== undefined) {
          if (typeof binding.tokenEnv !== "string" || !/^[A-Z][A-Z0-9_]{0,127}$/.test(binding.tokenEnv)
            || !process.env[binding.tokenEnv]) throw new Error("Host credential environment is unavailable");
          headers.authorization = "Bearer " + process.env[binding.tokenEnv];
        }
        runtime = createHttpWorkerRuntime({ id: binding.id, endpoint: binding.endpoint, headers,
          allowLoopbackHttp: binding.allowLoopbackHttp === true });
      } else if (binding.kind === "opencode") {
        if (typeof binding.id !== "string" || typeof binding.endpoint !== "string" || binding.expectedVersion !== "1.18.35"
          || typeof binding.providerID !== "string" || typeof binding.modelID !== "string"
          || (binding.allowLoopbackHttp !== undefined && typeof binding.allowLoopbackHttp !== "boolean")) throw new Error("Invalid OpenCode binding");
        const headers: Record<string,string> = {};
        if (binding.passwordEnv !== undefined) {
          if (typeof binding.passwordEnv !== "string" || !/^[A-Z][A-Z0-9_]{0,127}$/.test(binding.passwordEnv)
            || !process.env[binding.passwordEnv]) throw new Error("OpenCode server credential environment is unavailable");
          headers.authorization = "Basic " + Buffer.from("opencode:" + process.env[binding.passwordEnv]).toString("base64");
        }
        runtime = createOpenCodeRuntime({ id: binding.id, endpoint: binding.endpoint, expectedVersion: "1.18.35",
          providerID: binding.providerID, modelID: binding.modelID, headers, allowLoopbackHttp: binding.allowLoopbackHttp === true,
          onSession: async session => {
            const fd = openSync(join(journalPath,packet.runId + ".opencode-session.json"), "wx", 0o600);
            try { writeFileSync(fd,JSON.stringify({version:"starlight.opencode-session.v1",...session})); fsyncSync(fd); }
            finally { closeSync(fd); }
          }, onUsage: async observation => {
            const fd = openSync(join(journalPath,packet.runId + ".opencode-usage.json"), "wx", 0o600);
            try { writeFileSync(fd,JSON.stringify({packetSha256:terminalDigest(packet),observation,sha256:terminalDigest(observation)})); fsyncSync(fd); }
            finally { closeSync(fd); }
          } });
      } else throw new Error("Unsupported host transport");
      const admission = host.admission as TerminalAdmission;
      const journal = new TerminalRunJournal(journalPath);
      const record = await journal.execute(packet, { runtime, timeoutMs: host.timeoutMs as number,
        contextKeys: host.contextKeys as string[] | undefined,
        // Explicit local operator authorization only. Remote/API callers must
        // supply their established authenticated admission callback via the SDK.
        admit: async () => admission });
      return { exitCode: record.state === "produced" ? 0 : 1, stdout: JSON.stringify(record, null, 2), stderr: "" };
    }
    const journal = new TerminalRunJournal(journalPath);
    if (action === "import") {
      const handoff = load(flags.file as string | undefined);
      const record = journal.importHandoff(JSON.stringify(handoff));
      return { exitCode: 0, stdout: JSON.stringify(record, null, 2), stderr: "" };
    }
    if (action === "handoff" || action === "resume") {
      return { exitCode: 0, stdout: journal.handoff(id), stderr: "" };
    }
    const record = journal.inspect(id);
    if (!record) throw new Error("Run not found");
    if (action === "usage") {
      if (record.state !== "produced") throw new Error("Usage requires a produced local run; reconcile unknown outcomes with the host");
      const evidence = object(load(join(journalPath,id + ".opencode-usage.json")));
      const observation = parseOpenCodeUsage(evidence.observation);
      const session = object(load(join(journalPath,id + ".opencode-session.json")));
      if (Object.keys(evidence).length !== 3 || evidence.packetSha256 !== record.fingerprint
        || evidence.sha256 !== terminalDigest(observation) || observation.taskId !== id
        || observation.runtimeId !== record.runtimeId || observation.outputSha256 !== record.outputSha256
        || session.version !== "starlight.opencode-session.v1" || session.taskId !== id
        || session.runtimeId !== record.runtimeId || session.sessionId !== observation.sessionId) {
        throw new Error("OpenCode usage evidence does not match this local run");
      }
      return { exitCode: 0, stdout: JSON.stringify(evidence,null,2), stderr: "" };
    }
    return { exitCode: 0, stdout: JSON.stringify(record, null, 2), stderr: "" };
  } catch (error) {
    return { exitCode: 1, stdout: "", stderr: error instanceof Error ? error.message : "Terminal operation failed" };
  }
}
