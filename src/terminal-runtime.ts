import { createHash, randomUUID } from "node:crypto";
import { closeSync, existsSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync,
  renameSync, unlinkSync, writeFileSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import { RuntimeBridge, parseWorkerRequest, type RuntimeReceipt, type WorkerRequest,
  type WorkerRuntime } from "./runtime-bridge/index.js";

export const TERMINAL_RUN_VERSION = "starlight.terminal-run.v1" as const;
const MAX_JOURNAL_BYTES = 262_144;
const ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/;

/** Product repositories retain authority. This catalog describes consumers,
 * not ownership evidence or live deployment/installation status. */
export const TERMINAL_DOMAINS = Object.freeze([
  { id: "starlight", operation: "coordinate", artifact: "work-checkpoint", repository: "frankxai/Starlight-Intelligence-System" },
  { id: "arcanea", operation: "create-with-continuity", artifact: "world-pack", repository: "frankxai/arcanea-ai-app" },
  { id: "gencreator", operation: "source-to-reviewed-export", artifact: "creator-pack", repository: "frankxai/gencreator.ai" },
  { id: "agenticincome", operation: "prove-business-workflow", artifact: "workflow-evidence", repository: "frankxai/agenticincome" },
  { id: "animelegends", operation: "character-to-scene", artifact: "legend-pack", repository: "frankxai/AnimeLegends" },
  { id: "realityarchitect", operation: "intent-to-working-system", artifact: "system-evidence", repository: "frankxai/realityarchitect" },
].map(domain => Object.freeze({ ...domain, status: "descriptor-only" as const })));

export interface TerminalWorkPacket {
  version: typeof TERMINAL_RUN_VERSION;
  runId: string;
  domain: string;
  workRef: string;
  sourceRefs: string[];
  request: WorkerRequest;
}

/** Returned by trusted host admission, never derived from task text. The host
 * owns current revocation, global reservations, capability and tenant checks. */
export interface TerminalAdmission {
  authorityRef: string;
  reservationRef: string;
  budgetCeilingCents: number;
  expiresAt: string;
}

export interface TerminalRunRecord {
  version: typeof TERMINAL_RUN_VERSION;
  packet: TerminalWorkPacket;
  fingerprint: string;
  runtimeId: string;
  state: "running" | "produced" | "failed" | "unknown";
  admission: TerminalAdmission;
  receipt?: RuntimeReceipt;
  outputSha256?: string;
  /** A transport result does not establish an independently accepted artifact. */
  verification: "pending";
  usage: "unknown";
}

function plain(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

function exact(value: Record<string, unknown>, keys: string[]): boolean {
  return Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
}

function label(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 2048;
}

function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, item: unknown) => plain(item)
    ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);
}

export function terminalDigest(value: unknown): string {
  return createHash("sha256").update(canonical(value)).digest("hex");
}

export function parseTerminalPacket(value: unknown): TerminalWorkPacket {
  if (!plain(value) || !exact(value, ["version", "runId", "domain", "workRef", "sourceRefs", "request"])
    || value.version !== TERMINAL_RUN_VERSION || typeof value.runId !== "string" || !ID.test(value.runId)
    || typeof value.domain !== "string" || !ID.test(value.domain) || !label(value.workRef)
    || !Array.isArray(value.sourceRefs) || value.sourceRefs.length < 1 || value.sourceRefs.length > 32
    || !value.sourceRefs.every(label) || new Set(value.sourceRefs).size !== value.sourceRefs.length) {
    throw new Error("Invalid terminal work packet");
  }
  return JSON.parse(canonical({ ...value, request: parseWorkerRequest(value.request) })) as TerminalWorkPacket;
}

function parseAdmission(value: unknown): TerminalAdmission {
  if (!plain(value) || !exact(value, ["authorityRef", "reservationRef", "budgetCeilingCents", "expiresAt"])
    || !label(value.authorityRef) || !label(value.reservationRef)
    || !Number.isSafeInteger(value.budgetCeilingCents) || (value.budgetCeilingCents as number) < 0
    || typeof value.expiresAt !== "string" || !/^\d{4}-\d\d-\d\dT.*Z$/.test(value.expiresAt)
    || !Number.isFinite(Date.parse(value.expiresAt))) throw new Error("Invalid host admission");
  return { ...value } as unknown as TerminalAdmission;
}

function parseRecord(value: unknown): TerminalRunRecord {
  const baseKeys = ["version", "packet", "fingerprint", "runtimeId", "state", "admission", "verification", "usage"];
  if (!plain(value) || !exact(value, [...baseKeys,
    ...(value.receipt === undefined ? [] : ["receipt"]),
    ...(value.outputSha256 === undefined ? [] : ["outputSha256"])]) || value.version !== TERMINAL_RUN_VERSION
    || !["running", "produced", "failed", "unknown"].includes(value.state as string)
    || value.verification !== "pending" || value.usage !== "unknown"
    || typeof value.runtimeId !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,127}$/.test(value.runtimeId)) {
    throw new Error("Invalid terminal journal record");
  }
  const packet = parseTerminalPacket(value.packet);
  if (value.fingerprint !== terminalDigest(packet)) throw new Error("Journal packet fingerprint mismatch");
  const admission = parseAdmission(value.admission);
  const receipt = value.receipt as RuntimeReceipt | undefined;
  if (value.state === "running") {
    if (receipt !== undefined || value.outputSha256 !== undefined) throw new Error("Running record contains a result");
  } else {
    if (!plain(receipt) || receipt.taskId !== packet.request.taskId || receipt.agent !== packet.request.agent
      || receipt.runtimeId !== value.runtimeId || !Number.isFinite(receipt.startedAt) || !Number.isFinite(receipt.finishedAt)
      || receipt.startedAt < 0 || receipt.finishedAt < receipt.startedAt
      || !exact(receipt, ["taskId", "agent", "runtimeId", "status", "startedAt", "finishedAt",
        ...(receipt.output === undefined ? [] : ["output"]),
        ...(receipt.errorCode === undefined ? [] : ["errorCode"])])
      || (receipt.errorCode !== undefined && !["worker-failed", "invalid-response", "transport-error", "timeout", "aborted"].includes(receipt.errorCode))) {
      throw new Error("Journal receipt identity mismatch");
    }
    const expected = value.state === "produced" ? "completed" : value.state;
    if (receipt.status !== expected) throw new Error("Journal receipt state mismatch");
    if (value.state === "produced") {
      if (receipt.errorCode !== undefined || typeof receipt.output !== "string" || !receipt.output.trim()
        || Buffer.byteLength(receipt.output) > 65_536
        || value.outputSha256 !== createHash("sha256").update(receipt.output).digest("hex")) {
        throw new Error("Journal output integrity mismatch");
      }
    } else if (receipt.output !== undefined || value.outputSha256 !== undefined) {
      throw new Error("Unconfirmed result cannot contain an artifact");
    }
  }
  return JSON.parse(canonical({ ...value, packet, admission })) as TerminalRunRecord;
}

function regular(path: string): void {
  if (lstatSync(path).isSymbolicLink() || !lstatSync(path).isFile()) throw new Error("Journal requires regular files");
}

/** Private per-run journal, not a portfolio queue or fleet admission authority.
 * A retained running attempt blocks replay after process loss. Never clear its
 * writer lock by age; reconcile the original worker through its owner. */
export class TerminalRunJournal {
  readonly directory: string;
  constructor(directory: string) {
    if (!isAbsolute(directory)) throw new Error("Journal directory must be absolute");
    this.directory = resolve(directory);
    mkdirSync(this.directory, { recursive: true, mode: 0o700 });
    if (lstatSync(this.directory).isSymbolicLink() || !lstatSync(this.directory).isDirectory()) {
      throw new Error("Journal directory cannot be a symbolic link");
    }
  }

  private path(id: string): string {
    if (!ID.test(id)) throw new Error("Invalid run ID");
    return join(this.directory, id + ".json");
  }

  inspect(id: string): TerminalRunRecord | undefined {
    const file = this.path(id);
    if (!existsSync(file)) return undefined;
    regular(file);
    const raw = readFileSync(file);
    if (raw.length > MAX_JOURNAL_BYTES) throw new Error("Journal record exceeds size bound");
    const result = parseRecord(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(raw)));
    if (result.packet.runId !== id) throw new Error("Journal run identity mismatch");
    return result;
  }

  private save(record: TerminalRunRecord): void {
    const text = canonical(parseRecord(record));
    if (Buffer.byteLength(text) > MAX_JOURNAL_BYTES) throw new Error("Journal record exceeds size bound");
    const target = this.path(record.packet.runId);
    if (existsSync(target)) regular(target);
    const temp = target + "." + randomUUID() + ".tmp";
    const fd = openSync(temp, "wx", 0o600);
    try { writeFileSync(fd, text); fsyncSync(fd); } finally { closeSync(fd); }
    try { renameSync(temp, target); } catch (error) { unlinkSync(temp); throw error; }
  }

  async execute(value: unknown, options: {
    runtime: WorkerRuntime;
    timeoutMs: number;
    contextKeys?: string[];
    signal?: AbortSignal;
    admit: (packet: TerminalWorkPacket, runtimeId: string) => Promise<TerminalAdmission>;
  }): Promise<TerminalRunRecord> {
    const packet = parseTerminalPacket(value);
    // Keep precisely the outbound packet. No hidden memories cross by default.
    const runtime = { id: options.runtime.id, invoke: options.runtime.invoke.bind(options.runtime) };
    const bridge = new RuntimeBridge({ runtimes: [runtime], routes: { [packet.request.agent]: runtime.id },
      maxConcurrency: 1, maxRuns: 1, timeoutMs: options.timeoutMs, contextKeys: options.contextKeys });
    const lock = this.path(packet.runId) + ".lock";
    const fd = openSync(lock, "wx", 0o600);
    try {
      const previous = this.inspect(packet.runId);
      if (previous) {
        if (previous.fingerprint !== terminalDigest(packet)) throw new Error("Run ID is bound to another packet");
        // This includes unknown/running attempts. Retry requires a new host-owned
        // attempt and authoritative reconciliation, not a new transport object.
        return previous;
      }
      if (options.signal?.aborted) throw new Error("Run aborted before admission");
      const admission = parseAdmission(await options.admit(parseTerminalPacket(packet), runtime.id));
      if (Date.parse(admission.expiresAt) <= Date.now()) throw new Error("Host admission expired");
      if (options.signal?.aborted) throw new Error("Run aborted after admission");
      let record: TerminalRunRecord = { version: TERMINAL_RUN_VERSION, packet, fingerprint: terminalDigest(packet),
        runtimeId: runtime.id, state: "running", admission, verification: "pending", usage: "unknown" };
      this.save(record); // Durable before dispatch; loss cannot silently resubmit.
      let receipt = await bridge.run(packet.request, options.signal);
      if (receipt.status === "completed" && !receipt.output?.trim()) {
        const { output: _output, ...identity } = receipt;
        receipt = { ...identity, status: "unknown", errorCode: "invalid-response" };
      }
      record = { ...record, receipt, state: receipt.status === "completed" ? "produced" : receipt.status,
        ...(receipt.status === "completed" ? { outputSha256: createHash("sha256").update(receipt.output!).digest("hex") } : {}) };
      this.save(record);
      return this.inspect(packet.runId)!;
    } finally {
      closeSync(fd);
      unlinkSync(lock); // Only the lock exclusively created by this call.
    }
  }

  /** Explicit private export for a destination harness; never grants execution. */
  handoff(id: string): string {
    const record = this.inspect(id);
    if (!record) throw new Error("Run not found");
    return canonical({ version: "starlight.handoff.v1", record, recordSha256: terminalDigest(record),
      destinationAuthority: "revalidation-required" });
  }

  /** Imports evidence, never auto-resumes a native conversation or worker. */
  importHandoff(text: string): TerminalRunRecord {
    if (Buffer.byteLength(text) > MAX_JOURNAL_BYTES) throw new Error("Handoff exceeds size bound");
    const value: unknown = JSON.parse(text);
    if (!plain(value) || !exact(value, ["version", "record", "recordSha256", "destinationAuthority"])
      || value.version !== "starlight.handoff.v1" || value.destinationAuthority !== "revalidation-required") {
      throw new Error("Invalid handoff");
    }
    const record = parseRecord(value.record);
    if (value.recordSha256 !== terminalDigest(record)) throw new Error("Handoff integrity mismatch");
    const lock = this.path(record.packet.runId) + ".lock";
    const fd = openSync(lock, "wx", 0o600);
    try {
      if (this.inspect(record.packet.runId)) throw new Error("Destination run already exists");
      this.save(record);
      return this.inspect(record.packet.runId)!;
    } finally { closeSync(fd); unlinkSync(lock); }
  }
}
