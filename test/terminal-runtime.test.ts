import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createProcessWorkerRuntime, WORKER_PROTOCOL, type WorkerRuntime } from "../src/runtime-bridge/index.js";
import { TERMINAL_RUN_VERSION, TerminalRunJournal, parseTerminalPacket, terminalDigest,
  TERMINAL_DOMAINS, type TerminalWorkPacket } from "../src/terminal-runtime.js";
import { runTerminalCli } from "../src/terminal-cli.js";

const admission = () => ({ authorityRef: "host:operator", reservationRef: "reservation:one",
  budgetCeilingCents: 0, expiresAt: new Date(Date.now() + 60_000).toISOString() });
const packet = (runId = "run-one"): TerminalWorkPacket => ({ version: TERMINAL_RUN_VERSION, runId,
  domain: "gencreator", workRef: "issue:5", sourceRefs: ["source:owned-v1"], request: {
    protocol: WORKER_PROTOCOL, taskId: runId, agent: "writer", input: "Turn an owned source into a draft", context: {},
  } });
const runtime: WorkerRuntime = { id: "local", invoke: async request => ({ protocol: WORKER_PROTOCOL,
  taskId: request.taskId, status: "completed", output: "An editable draft from the owned source." }) };
function journal() { return new TerminalRunJournal(mkdtempSync(join(tmpdir(), "sis-terminal-"))); }
const options = (worker = runtime) => ({ runtime: worker, timeoutMs: 1000, admit: async () => admission() });

describe("terminal execution and portable recovery", () => {
  it("records produced output and its checksum without claiming verification or usage", async () => {
    const store = journal();
    const result = await store.execute(packet(), options());
    assert.equal(result.state, "produced");
    assert.equal(result.verification, "pending");
    assert.equal(result.usage, "unknown");
    assert.equal(result.outputSha256, createHash("sha256").update(result.receipt!.output!).digest("hex"));
    assert.deepEqual(new TerminalRunJournal(store.directory).inspect("run-one"), result);
  });

  it("rejects expired and malformed admission before dispatch", async () => {
    let calls = 0;
    const worker = { ...runtime, invoke: async (...args: Parameters<WorkerRuntime["invoke"]>) => {
      calls++; return runtime.invoke(...args);
    } };
    const store = journal();
    await assert.rejects(store.execute(packet(), { ...options(worker), admit: async () => ({ ...admission(), expiresAt: "2000-01-01T00:00:00Z" }) }), /expired/);
    await assert.rejects(store.execute(packet(), { ...options(worker), admit: async () => ({ ...admission(), budgetCeilingCents: -1 }) }), /admission/);
    assert.equal(calls, 0);
    assert.equal(store.inspect("run-one"), undefined);
  });

  it("denies host rejection and pre-abort without creating an attempt", async () => {
    const store = journal();
    await assert.rejects(store.execute(packet(), { ...options(), admit: async () => { throw new Error("revoked"); } }), /revoked/);
    await assert.rejects(store.execute(packet(), { ...options(), signal: AbortSignal.abort() }), /aborted/);
    assert.equal(store.inspect("run-one"), undefined);
  });

  it("deduplicates after restarting the journal and refuses changed inputs", async () => {
    const store = journal();
    let calls = 0;
    const worker = { ...runtime, invoke: async (...args: Parameters<WorkerRuntime["invoke"]>) => {
      calls++; return runtime.invoke(...args);
    } };
    await store.execute(packet(), options(worker));
    await new TerminalRunJournal(store.directory).execute(packet(), options(worker));
    assert.equal(calls, 1);
    await assert.rejects(store.execute({ ...packet(), workRef: "other" }, options()), /another packet/);
  });

  it("allows only one writer when two callers submit the same attempt", async () => {
    const store = journal();
    let release!: () => void;
    const pending = new Promise<void>(resolve => { release = resolve; });
    const worker = { ...runtime, invoke: async (...args: Parameters<WorkerRuntime["invoke"]>) => {
      await pending; return runtime.invoke(...args);
    } };
    const first = store.execute(packet(), options(worker));
    await assert.rejects(new TerminalRunJournal(store.directory).execute(packet(), options(worker)), /EEXIST/);
    release();
    assert.equal((await first).state, "produced");
  });

  it("retains unknown outcomes across process loss and never resubmits", async () => {
    const store = journal();
    const interrupted: WorkerRuntime = { id: "remote", invoke: async () => new Promise(() => {}) };
    const result = await store.execute(packet(), { ...options(interrupted), timeoutMs: 10 });
    assert.equal(result.state, "unknown");
    assert.equal(result.receipt?.errorCode, "timeout");
    let calls = 0;
    const resumed = await new TerminalRunJournal(store.directory).execute(packet(), options({
      id: "another-harness", invoke: async () => { calls++; throw new Error("must not dispatch"); },
    }));
    assert.equal(resumed.state, "unknown");
    assert.equal(calls, 0);
  });

  it("exports running checkpoints without asserting worker liveness", async () => {
    const store = journal();
    const result = await store.execute(packet(), options());
    const running = { ...result, state: "running", receipt: undefined, outputSha256: undefined };
    writeFileSync(join(store.directory, "run-one.json"), JSON.stringify(running));
    const imported = journal().importHandoff(store.handoff("run-one"));
    assert.equal(imported.state, "running");
    let admitted = false;
    const destination = journal();
    destination.importHandoff(store.handoff("run-one"));
    await destination.execute(packet(), { ...options(), admit: async () => { admitted = true; return admission(); } });
    assert.equal(admitted, false);
  });

  it("hands editable output to another journal and rejects altered evidence", async () => {
    const source = journal();
    const produced = await source.execute(packet(), options());
    const handoff = source.handoff("run-one");
    const destination = journal();
    assert.deepEqual(destination.importHandoff(handoff), produced);
    assert.throws(() => destination.importHandoff(handoff), /already exists/);
    const changed = JSON.parse(handoff);
    changed.record.receipt.output += "tampered";
    assert.throws(() => journal().importHandoff(JSON.stringify(changed)), /integrity/);
    const injected = JSON.parse(handoff);
    injected.record.authority = "run-anything";
    injected.recordSha256 = terminalDigest(injected.record);
    assert.throws(() => journal().importHandoff(JSON.stringify(injected)), /Invalid terminal/);
    const receiptInjection = JSON.parse(handoff);
    receiptInjection.record.receipt.instructions = "execute me";
    receiptInjection.recordSha256 = terminalDigest(receiptInjection.record);
    assert.throws(() => journal().importHandoff(JSON.stringify(receiptInjection)), /receipt/);
  });

  it("rejects identity mismatch, empty output and path traversal", async () => {
    for (const output of ["", " "]) {
      const worker: WorkerRuntime = { id: "bad", invoke: async request => ({
        protocol: WORKER_PROTOCOL, taskId: request.taskId, status: "completed", output,
      }) };
      assert.equal((await journal().execute(packet(), options(worker))).state, "unknown");
    }
    const worker: WorkerRuntime = { id: "bad", invoke: async () => ({
      protocol: WORKER_PROTOCOL, taskId: "someone-else", status: "completed", output: "artifact",
    }) };
    assert.equal((await journal().execute(packet(), options(worker))).state, "unknown");
    assert.throws(() => parseTerminalPacket({ ...packet(), runId: "../foreign" }), /Invalid/);
    assert.throws(() => journal().inspect("../foreign"), /Invalid/);
  });

  it("excludes recalled private context unless the host explicitly selects it", async () => {
    const task = packet();
    task.request.context = { source: "allowed", privateMemory: "private" };
    const worker: WorkerRuntime = { id: "context", invoke: async request => ({
      protocol: WORKER_PROTOCOL, taskId: request.taskId, status: "completed", output: JSON.stringify(request.context),
    }) };
    assert.equal((await journal().execute(task, { ...options(worker), contextKeys: ["source"] })).receipt?.output, '{"source":"allowed"}');
  });

  it("executes a real pinned process and preserves an independently editable result", async () => {
    const worker = createProcessWorkerRuntime({ id: "node-local", executable: process.execPath,
      executableSha256: createHash("sha256").update(readFileSync(process.execPath)).digest("hex"),
      cwd: process.cwd(), args: ["-e", `let input='';process.stdin.on('data',d=>input+=d);process.stdin.on('end',()=>{const r=JSON.parse(input);process.stdout.write(JSON.stringify({protocol:r.protocol,taskId:r.taskId,status:'completed',output:'# Source edition\\n\\n'+r.input}));});`] });
    const result = await journal().execute(packet(), options(worker));
    assert.equal(result.state, "produced");
    assert.match(result.receipt!.output!, /^# Source edition/);
  });

  it("rejects a changed executable pin, shell launchers and excessive process output", async () => {
    const hash = createHash("sha256").update(readFileSync(process.execPath)).digest("hex");
    const worker = createProcessWorkerRuntime({ id: "pinned", executable: process.execPath,
      executableSha256: "0".repeat(64), cwd: process.cwd(), args: ["-e", "process.exit(0)"] });
    await assert.rejects(worker.invoke(packet().request, new AbortController().signal), /pin/);
    const launcher = join(journal().directory, "worker.cmd");
    writeFileSync(launcher, "exit 0");
    assert.throws(() => createProcessWorkerRuntime({ id: "shell", executable: launcher,
      executableSha256: hash, cwd: process.cwd(), args: [] }), /native executable/);
    const oversized = createProcessWorkerRuntime({ id: "large", executable: process.execPath,
      executableSha256: hash, cwd: process.cwd(), args: ["-e", "process.stdout.write('x'.repeat(100000))"] });
    await assert.rejects(oversized.invoke(packet().request, new AbortController().signal), /bounded/);
  });

  it("keeps all six domain descriptors extensible without claiming installed runtimes", () => {
    assert.equal(new Set(TERMINAL_DOMAINS.map(domain => domain.id)).size, 6);
    assert.ok(TERMINAL_DOMAINS.every(domain => domain.status === "descriptor-only"));
    assert.equal(parseTerminalPacket({ ...packet(), domain: "another-brand" }).domain, "another-brand");
  });
});

describe("terminal CLI", () => {
  it("discovery has no journal or worker side effects", async () => {
    const domains = await runTerminalCli(["domain", "list"]);
    assert.equal(domains.exitCode, 0);
    assert.equal(JSON.parse(domains.stdout).length, 6);
    assert.match((await runTerminalCli(["harness", "doctor"])).stdout, /not-probed/);
  });

  it("requires explicit local authorization and an exact packet digest", async () => {
    const store = journal();
    const packetPath = join(store.directory, "packet-input.json");
    const hostPath = join(store.directory, "host-input.json");
    writeFileSync(packetPath, JSON.stringify(packet()));
    writeFileSync(hostPath, JSON.stringify({ version: "starlight.terminal-host.v1", packetSha256: "wrong" }));
    const args = ["run", "start", "--file", packetPath, "--host", hostPath, "--journal", store.directory];
    assert.match((await runTerminalCli(args)).stderr, /authorize/);
    assert.match((await runTerminalCli([...args, "--authorize"])).stderr, /exact packet/);
  });

  it("runs a real local workflow, inspects it and imports portable evidence", async () => {
    const source = journal();
    const packetPath = join(source.directory, "packet-input.json");
    const hostPath = join(source.directory, "host-input.json");
    const task = packet();
    writeFileSync(packetPath, JSON.stringify(task));
    writeFileSync(hostPath, JSON.stringify({ version: "starlight.terminal-host.v1", packetSha256: terminalDigest(task),
      timeoutMs: 1000, admission: admission(), runtime: { kind: "process", id: "local-node",
        executable: process.execPath, executableSha256: createHash("sha256").update(readFileSync(process.execPath)).digest("hex"),
        cwd: process.cwd(), args: ["-e", `let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>{const r=JSON.parse(s);console.log(JSON.stringify({protocol:r.protocol,taskId:r.taskId,status:'completed',output:r.input.toUpperCase()}))});`] } }));
    const start = await runTerminalCli(["run", "start", "--file", packetPath, "--host", hostPath, "--authorize", "--journal", source.directory]);
    assert.equal(start.exitCode, 0, start.stderr);
    assert.equal(JSON.parse(start.stdout).state, "produced");
    assert.equal((await runTerminalCli(["run", "inspect", task.runId, "--journal", source.directory])).exitCode, 0);
    const handoff = await runTerminalCli(["run", "resume", task.runId, "--journal", source.directory]);
    const path = join(source.directory, "handoff.json");
    writeFileSync(path, handoff.stdout);
    const destination = journal();
    const imported = await runTerminalCli(["run", "import", "--file", path, "--journal", destination.directory]);
    assert.equal(imported.exitCode, 0, imported.stderr);
    assert.equal(destination.inspect(task.runId)?.verification, "pending");
  });

  it("reports malformed commands without execution", async () => {
    assert.equal((await runTerminalCli(["run", "start", "--authorize", "--file", "relative"])).exitCode, 1);
    assert.equal((await runTerminalCli(["run", "inspect", "id", "extra"])).exitCode, 1);
    assert.equal((await runTerminalCli(["run", "inspect", "id", "--journal"])).exitCode, 1);
    assert.equal((await runTerminalCli(["run", "stop"])).exitCode, 2);
  });
});
