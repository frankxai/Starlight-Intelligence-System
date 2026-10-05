/**
 * Trusted import of session-continuity bundles into the Operational Work Graph.
 *
 * A private collector (agentic-ops `lifecycle/sis-continuity.js`) exports explicit
 * user intent as `intent.captured` events. File checksums prove integrity only, so
 * this importer adds the trust decisions the Work Graph leaves to its operator:
 * supported source revision, allowlisted collectors, registered work and owners,
 * known operators and the bound checkout. Nothing here admits, runs or completes
 * work. Admission happens only through an explicit owner reconciliation.
 */
import { createHash, randomUUID } from "node:crypto";
import {
  appendFileSync,
  closeSync,
  existsSync,
  fstatSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readSync,
  rmSync,
  truncateSync,
  writeFileSync,
  writeSync,
} from "node:fs";
import { hostname } from "node:os";
import { basename, isAbsolute, join } from "node:path";
import {
  parseWorkGraphJsonl,
  projectWorkGraph,
  type CompletionRequirements,
  type ProofKind,
  type WorkGraphEvent,
  type WorkGraphIssue,
} from "./work-graph.js";

export const CONTINUITY_POLICY_SCHEMA = "starlight.continuity-trust.v1";
const BUNDLE_SCHEMA = "starlight.continuity-bundle.v1";
const MANIFEST_SCHEMA = "starlight.continuity-manifest.v1";
const BUNDLE_FILES = ["events.jsonl", "continuity.json", "recovery.txt"] as const;
const MAX_FILE_BYTES = 4 * 1024 * 1024;

export interface ContinuityWorkRegistration {
  workId: string;
  projectId: string;
  /** The single actor allowed to admit, block or keep this work paused. */
  ownerActorId: string;
  /** When set, captured intent must come from this origin and branch. */
  checkout?: { origin: string; branch: string };
}

export interface ContinuityTrustPolicy {
  schemaVersion: typeof CONTINUITY_POLICY_SCHEMA;
  supportedSourceRevisions: string[];
  /** Collector harnesses and the source reference prefixes they may claim. */
  collectors: { harness: string; sourceRefPrefix: string }[];
  /** Operators who may bind sessions; claims by anyone else are quarantined. */
  operators: string[];
  works: ContinuityWorkRegistration[];
}

export type QuarantineReason =
  | "unregistered-work"
  | "project-mismatch"
  | "untrusted-collector"
  | "unknown-operator"
  | "checkout-mismatch"
  | "observation-missing"
  | "observation-ambiguous"
  | "claim-invalid"
  | "resume-not-forbidden";

export interface ContinuityImportResult {
  status: "imported" | "already-imported" | "refused";
  bundleDigest: string | null;
  accepted: string[];
  duplicates: string[];
  quarantined: { eventId: string; workId: string; reason: QuarantineReason }[];
  refusal?: string;
  /** Imports never start work; this is always false. */
  executionStarted: false;
}

interface BundleRepository {
  root: string;
  origin: string;
  branch: string;
  head: string;
  dirty: boolean;
}

interface BundleObservation {
  sessionKey: string;
  workId: string;
  projectId: string;
  requestDigest: string;
  reportedState: string;
  stateVerification: string;
  captureCompleteness: string;
  repository: BundleRepository;
}

export class ContinuityRefusal extends Error {}

const sha256 = (value: string | Buffer): string => createHash("sha256").update(value).digest("hex");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readBounded(file: string): Buffer {
  if (!lstatSync(file).isFile()) throw new ContinuityRefusal(`${file} is not a regular file`);
  const fd = openSync(file, "r");
  try {
    if (fstatSync(fd).size > MAX_FILE_BYTES) throw new ContinuityRefusal("Bundle file exceeds 4 MiB");
    const buffer = Buffer.alloc(MAX_FILE_BYTES + 1);
    let bytes = 0;
    for (;;) {
      const read = readSync(fd, buffer, bytes, buffer.length - bytes, null);
      if (!read) break;
      bytes += read;
      if (bytes > MAX_FILE_BYTES) throw new ContinuityRefusal("Bundle file grew beyond 4 MiB");
    }
    return buffer.subarray(0, bytes);
  } finally {
    closeSync(fd);
  }
}

function parseJson(buffer: Buffer, label: string): unknown {
  try {
    return JSON.parse(buffer.toString("utf8"));
  } catch {
    throw new ContinuityRefusal(`${label} is not valid JSON`);
  }
}

export function validateTrustPolicy(policy: unknown): ContinuityTrustPolicy {
  if (!isRecord(policy) || policy.schemaVersion !== CONTINUITY_POLICY_SCHEMA) {
    throw new ContinuityRefusal(`Trust policy must declare ${CONTINUITY_POLICY_SCHEMA}`);
  }
  const strings = (value: unknown) => Array.isArray(value) && value.every((v) => typeof v === "string" && v.length > 0);
  if (!strings(policy.supportedSourceRevisions) || !strings(policy.operators)) {
    throw new ContinuityRefusal("Trust policy needs supportedSourceRevisions and operators");
  }
  if (!Array.isArray(policy.collectors) || !policy.collectors.every((c) =>
    isRecord(c) && typeof c.harness === "string" && typeof c.sourceRefPrefix === "string" && c.sourceRefPrefix.length > 0)) {
    throw new ContinuityRefusal("Each collector needs a harness and a nonempty sourceRefPrefix");
  }
  const seen = new Set<string>();
  if (!Array.isArray(policy.works) || !policy.works.every((w) => {
    if (!isRecord(w) || typeof w.workId !== "string" || typeof w.projectId !== "string" || typeof w.ownerActorId !== "string") return false;
    if (w.checkout !== undefined && (!isRecord(w.checkout) || typeof w.checkout.origin !== "string" || typeof w.checkout.branch !== "string")) return false;
    if (seen.has(w.workId)) return false;
    seen.add(w.workId);
    return true;
  })) {
    throw new ContinuityRefusal("Each work registration needs a unique workId, projectId and ownerActorId");
  }
  return policy as unknown as ContinuityTrustPolicy;
}

/** Re-verifies the collector's manifest; integrity is necessary, not sufficient. */
export function readContinuityBundle(bundleDirectory: string): {
  digest: string;
  sourceRevision: unknown;
  events: WorkGraphEvent[];
  observations: BundleObservation[];
} {
  if (!isAbsolute(bundleDirectory) || !lstatSync(bundleDirectory).isDirectory()) {
    throw new ContinuityRefusal("Expected an absolute bundle directory");
  }
  const manifestBytes = readBounded(join(bundleDirectory, "manifest.json"));
  const manifest = parseJson(manifestBytes, "manifest.json");
  if (!isRecord(manifest) || manifest.schemaVersion !== MANIFEST_SCHEMA || manifest.complete !== true || !isRecord(manifest.checksums)
    || Object.keys(manifest.checksums).sort().join() !== [...BUNDLE_FILES].sort().join()) {
    throw new ContinuityRefusal("Bundle manifest is incomplete; the export may have been interrupted");
  }
  const files = new Map<string, Buffer>();
  for (const name of BUNDLE_FILES) {
    const bytes = readBounded(join(bundleDirectory, name));
    if (sha256(bytes) !== manifest.checksums[name]) throw new ContinuityRefusal(`Checksum mismatch for ${name}`);
    files.set(name, bytes);
  }
  const bundle = parseJson(files.get("continuity.json")!, "continuity.json");
  if (!isRecord(bundle) || bundle.schemaVersion !== BUNDLE_SCHEMA || !Array.isArray(bundle.observations) || !Array.isArray(bundle.events)) {
    throw new ContinuityRefusal("Unsupported continuity bundle");
  }
  if (bundle.executionStarted !== false || bundle.admissionGranted !== false || bundle.completionClaimed !== false) {
    throw new ContinuityRefusal("A continuity bundle may not claim execution, admission or completion");
  }
  const parsed = parseWorkGraphJsonl(files.get("events.jsonl")!.toString("utf8"));
  if (parsed.issues.length) {
    throw new ContinuityRefusal(`Work Graph validation failed: ${parsed.issues.map((i) => i.code).join(", ")}`);
  }
  if (parsed.events.length !== manifest.eventCount || parsed.events.length !== bundle.events.length) {
    throw new ContinuityRefusal("Event count does not match the manifest");
  }
  const ids = new Set<string>();
  for (const event of parsed.events) {
    // One bundle may not carry two versions of an event; the first must not silently win.
    if (ids.has(event.eventId)) throw new ContinuityRefusal(`Bundle repeats event ID ${event.eventId}`);
    ids.add(event.eventId);
  }
  const foreign = parsed.events.find((e) => e.kind !== "intent.captured");
  if (foreign) throw new ContinuityRefusal(`Collectors may only supply intent.captured, not ${foreign.kind}`);
  const observations = (bundle.observations as unknown[]).filter((o): o is BundleObservation =>
    isRecord(o) && typeof o.sessionKey === "string" && typeof o.workId === "string" && typeof o.requestDigest === "string" && isRecord(o.repository)
    && typeof o.repository.origin === "string" && typeof o.repository.branch === "string" && typeof o.repository.head === "string");
  return { digest: sha256(manifestBytes), sourceRevision: bundle.sisSourceRevision, events: parsed.events, observations };
}

const REPORTED_STATES = new Set(["active", "paused", "blocked", "complete", "unknown"]);
const STATE_VERIFICATIONS = new Set(["operator-supplied", "native-goal-store"]);
const NAMED_SOURCES = new Set(["codex", "claude", "antigravity", "hermes"]);

type TrustOutcome = { reason: QuarantineReason } | { observation: BundleObservation };

/** Binds each event to the one observation it was checked against, or quarantines it. */
function trustDecision(event: WorkGraphEvent, observations: BundleObservation[], policy: ContinuityTrustPolicy): TrustOutcome {
  const work = policy.works.find((w) => w.workId === event.workId);
  if (!work) return { reason: "unregistered-work" };
  if (work.projectId !== event.projectId) return { reason: "project-mismatch" };
  const data = isRecord(event.data) ? event.data : {};
  if (data.mayAutomaticallyResume !== false) return { reason: "resume-not-forbidden" };
  const harness = typeof data.harness === "string" ? data.harness : "";
  if (event.source.system !== (NAMED_SOURCES.has(harness) ? harness : "other")) return { reason: "claim-invalid" };
  if (data.sourceVerification !== "collector-claimed" || !STATE_VERIFICATIONS.has(String(data.stateVerification))
    || !REPORTED_STATES.has(String(data.reportedState))) return { reason: "claim-invalid" };
  const uri = event.source.uri ?? "";
  if (!policy.collectors.some((c) => c.harness === harness && uri.startsWith(c.sourceRefPrefix))) return { reason: "untrusted-collector" };
  if (!policy.operators.includes(event.actorId)) return { reason: "unknown-operator" };
  const sessionKey = JSON.stringify([harness, event.source.sourceId]);
  const matches = observations.filter((o) => o.sessionKey === sessionKey && o.workId === event.workId
    && o.requestDigest === data.requestDigest && o.repository.head === data.repositoryHead);
  if (matches.length === 0) return { reason: "observation-missing" };
  if (matches.length > 1) return { reason: "observation-ambiguous" };
  const [observation] = matches;
  if (observation.reportedState !== data.reportedState || observation.stateVerification !== data.stateVerification) return { reason: "claim-invalid" };
  if (work.checkout && (work.checkout.origin !== observation.repository.origin || work.checkout.branch !== observation.repository.branch)) {
    return { reason: "checkout-mismatch" };
  }
  return { observation };
}
interface LockOwner { pid: number; host: string; token: string }

function readLockOwner(lock: string): LockOwner | null {
  try {
    const owner = JSON.parse(readFileSync(lock, "utf8")) as LockOwner;
    return Number.isInteger(owner.pid) && typeof owner.host === "string" && typeof owner.token === "string" ? owner : null;
  } catch { return null; }
}

function processAlive(pid: number): boolean {
  try { process.kill(pid, 0); return true; } catch (error) { return (error as NodeJS.ErrnoException).code === "EPERM"; }
}

/**
 * Removes the lock only if its holder process on this host has exited. Reclaimers
 * serialize on a separate exclusive mutex and re-read the owner inside it, so a lock
 * taken by a fresh holder in the meantime is never removed.
 */
function reclaimAbandoned(lock: string, me: LockOwner): void {
  const busy = () => new ContinuityRefusal("Another continuity import is in progress; retry after it finishes");
  const holder = readLockOwner(lock);
  if (holder === null) {
    if (!existsSync(lock)) return;
    throw new ContinuityRefusal(`The import lock at ${lock} is unreadable; remove it only after confirming no import is running`);
  }
  if (holder.host !== me.host || processAlive(holder.pid)) throw busy();
  const mutex = `${lock}.reclaim`;
  try {
    writeFileSync(mutex, JSON.stringify(me), { flag: "wx" });
  } catch {
    const other = readLockOwner(mutex);
    // Clearing a crashed reclaimer's mutex automatically would itself race; leave it to an operator.
    if (other === null && existsSync(mutex)) {
      throw new ContinuityRefusal(`The lock reclaim mutex at ${mutex} is unreadable; remove it only after confirming no import is running`);
    }
    if (other && other.host === me.host && !processAlive(other.pid)) {
      throw new ContinuityRefusal(`A crashed lock reclaimer left ${mutex}; remove it and ${lock} after confirming no import is running`);
    }
    throw busy();
  }
  try {
    const current = readLockOwner(lock);
    if (current && current.token === holder.token) rmSync(lock, { force: true });
    else if (current) throw busy();
  } finally {
    if (readLockOwner(mutex)?.token === me.token) rmSync(mutex, { force: true });
  }
}
/**
 * Synchronous exclusive lock owned by `{pid, host, token}`. A live holder is never
 * preempted however long it runs; only a lock whose holder process on this host has
 * exited is reclaimed, under a separate reclaim mutex. Locks from
 * another host, or unreadable ones, are never reclaimed automatically.
 */
function withStoreLock<T>(storeDirectory: string, run: (assertHeld: () => void) => T): T {
  const lock = join(storeDirectory, ".import.lock");
  const me: LockOwner = { pid: process.pid, host: hostname(), token: randomUUID() };
  const acquire = () => { const fd = openSync(lock, "wx"); writeSync(fd, JSON.stringify(me)); closeSync(fd); };
  try {
    acquire();
  } catch {
    reclaimAbandoned(lock, me);
    try { acquire(); } catch { throw new ContinuityRefusal("Another continuity import is in progress; retry after it finishes"); }
  }  const assertHeld = () => {
    if (readLockOwner(lock)?.token !== me.token) {
      throw new ContinuityRefusal("The import lock is no longer held by this import; it stopped before its next write and can be re-run");
    }
  };
  try {
    return run(assertHeld);
  } finally {
    if (readLockOwner(lock)?.token === me.token) rmSync(lock, { force: true });
  }
}
/** Complete lines only: a torn final line from a crashed writer is never trusted. */
function readJsonl(file: string): unknown[] {
  if (!existsSync(file)) return [];
  const text = readBounded(file).toString("utf8");
  const complete = text.endsWith("\n") ? text : text.slice(0, text.lastIndexOf("\n") + 1);
  return complete.split("\n").filter(Boolean).map((line, index) => {
    try { return JSON.parse(line); } catch {
      // A torn tail is expected after a crash; a bad complete line is corruption.
      throw new ContinuityRefusal(`Store file ${basename(file)} has a corrupt line ${index + 1}; restore it from a backup before continuing`);
    }
  });
}

/** Appends whole lines, first trimming a torn tail that no receipt ever covered. */
function appendJsonl(file: string, rows: unknown[]): void {
  if (!rows.length) return;
  if (existsSync(file)) {
    const text = readBounded(file).toString("utf8");
    if (text && !text.endsWith("\n")) truncateSync(file, Buffer.byteLength(text.slice(0, text.lastIndexOf("\n") + 1)));
  }
  appendFileSync(file, rows.map((row) => JSON.stringify(row)).join("\n") + "\n", { mode: 0o600 });
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function storePaths(storeDirectory: string) {
  return {
    events: join(storeDirectory, "events.jsonl"),
    observations: join(storeDirectory, "observations.jsonl"),
    quarantine: join(storeDirectory, "quarantine.jsonl"),
    receipts: join(storeDirectory, "imports.jsonl"),
  };
}

/**
 * Imports one verified bundle. Re-importing the same manifest is a no-op, a reused
 * event ID with different content refuses the whole bundle, and untrusted events are
 * quarantined with a reason rather than silently dropped.
 */
export function importContinuityBundle(
  bundleDirectory: string,
  storeDirectory: string,
  policyInput: unknown,
  options: { now?: Date } = {},
): ContinuityImportResult {
  const empty = { accepted: [], duplicates: [], quarantined: [], executionStarted: false as const };
  let policy: ContinuityTrustPolicy;
  let bundle: ReturnType<typeof readContinuityBundle>;
  try {
    policy = validateTrustPolicy(policyInput);
    bundle = readContinuityBundle(bundleDirectory);
    const revision = bundle.sourceRevision;
    if (typeof revision !== "string" || !policy.supportedSourceRevisions.includes(revision)) {
      throw new ContinuityRefusal("Bundle targets an unsupported SIS source revision");
    }
  } catch (error) {
    if (error instanceof ContinuityRefusal) return { status: "refused", bundleDigest: null, refusal: error.message, ...empty };
    return { status: "refused", bundleDigest: null, refusal: "Bundle could not be read", ...empty };
  }
  if (!isAbsolute(storeDirectory)) return { status: "refused", bundleDigest: bundle.digest, refusal: "Store directory must be absolute", ...empty };
  mkdirSync(storeDirectory, { recursive: true, mode: 0o700 });
  const paths = storePaths(storeDirectory);
  try {
    return withStoreLock(storeDirectory, (assertHeld) => {
      const receipts = readJsonl(paths.receipts) as { bundleDigest: string }[];
      if (receipts.some((r) => r.bundleDigest === bundle.digest)) {
        return { status: "already-imported" as const, bundleDigest: bundle.digest, ...empty };
      }
      const stored = new Map<string, string>();
      for (const event of readJsonl(paths.events) as WorkGraphEvent[]) stored.set(event.eventId, canonical(event));
      // Observations already stored (possibly orphaned by a crash before their event) must
      // match a replayed event's observation exactly, or the bundle is refused.
      const observed = new Map<string, string>();
      for (const o of readJsonl(paths.observations) as Record<string, unknown>[]) {
        const { importedAt: _importedAt, ...claims } = o;
        if (!observed.has(String(o.eventId))) observed.set(String(o.eventId), canonical(claims));
      }
      const alreadyQuarantined = new Set((readJsonl(paths.quarantine) as { eventId: string }[]).map((q) => q.eventId));
      const accepted: WorkGraphEvent[] = [];
      const duplicates: string[] = [];
      const quarantined: ContinuityImportResult["quarantined"] = [];
      const observations: Record<string, unknown>[] = [];
      const importedAt = (options.now ?? new Date()).toISOString();
      for (const event of bundle.events) {
        const previous = stored.get(event.eventId);
        if (previous !== undefined && previous !== canonical(event)) throw new ContinuityRefusal(`Event ${event.eventId} conflicts with stored content`);
        const outcome = trustDecision(event, bundle.observations, policy);
        if ("reason" in outcome) {
          if (previous === undefined && !alreadyQuarantined.has(event.eventId)) quarantined.push({ eventId: event.eventId, workId: event.workId, reason: outcome.reason });
          else duplicates.push(event.eventId);
          continue;
        }
        const o = outcome.observation;
        const claims = { eventId: event.eventId, workId: event.workId, sessionKey: o.sessionKey, requestDigest: o.requestDigest,
          reportedState: o.reportedState, stateVerification: o.stateVerification, captureCompleteness: o.captureCompleteness,
          repository: o.repository };
        const storedClaims = observed.get(event.eventId);
        if (storedClaims !== undefined && storedClaims !== canonical(claims)) {
          throw new ContinuityRefusal(`Event ${event.eventId} conflicts with the observation stored by an earlier or interrupted import`);
        }
        // A replay after a crash backfills the observation its earlier attempt never wrote.
        if (storedClaims === undefined) observations.push({ ...claims, importedAt });
        if (previous === undefined) accepted.push(event);
        else duplicates.push(event.eventId);
      }
      // Observations, then events, then the receipt: every interruption replays safely.
      assertHeld();
      appendJsonl(paths.observations, observations);
      assertHeld();
      appendJsonl(paths.events, accepted);
      assertHeld();
      appendJsonl(paths.quarantine, quarantined.map((q) => ({ ...q, bundleDigest: bundle.digest, importedAt })));
      assertHeld();
      appendJsonl(paths.receipts, [{ bundleDigest: bundle.digest, importedAt, accepted: accepted.length,
        duplicates: duplicates.length, quarantined: quarantined.length }]);
      return { status: "imported" as const, bundleDigest: bundle.digest, accepted: accepted.map((e) => e.eventId), duplicates,
        quarantined, executionStarted: false as const };
    });
  } catch (error) {
    const refusal = error instanceof ContinuityRefusal ? error.message : "Import stopped before its receipt; re-running replays it. If it repeats, inspect the store files.";
    return { status: "refused", bundleDigest: bundle.digest, refusal, ...empty };
  }
}

/** A2A-aligned vocabulary so a later federation adapter is a pure projection. */
export type ContinuityState = "submitted" | "input-required" | "working" | "blocked" | "completed";

export interface ContinuityWorkStatus {
  workId: string;
  projectId: string;
  ownerActorId: string | null;
  state: ContinuityState;
  intent: {
    /** Distinct captured requests; repeated observations of one request count once. */
    distinctRequests: number;
    observations: number;
    harnesses: string[];
    firstObservedAt: string | null;
    lastObservedAt: string | null;
    captureCompleteness: string[];
    goalAuthority: string[];
  };
  /** Labels from the collector or the harness goal store; never a verified lifecycle transition. */
  reportedState: { value: string; verification: "operator-supplied" | "native-goal-store" } | null;
  checkout: { origin: string; branch: string; head: string; dirty: boolean } | null;
  admission: { admitted: boolean; byActorId: string | null; requirements: CompletionRequirements | null };
  delivery: { proofEventIds: Record<ProofKind, string[]>; missingProofs: ProofKind[]; readyToComplete: boolean; completed: boolean };
  quarantined: number;
  mayAutomaticallyResume: false;
}

export const CONTINUITY_STATUS_SCHEMA = "starlight.continuity-status.v1";

export interface ContinuityStatus {
  schemaVersion: typeof CONTINUITY_STATUS_SCHEMA;
  works: ContinuityWorkStatus[];
  unattributedQuarantine: number;
  issues: WorkGraphIssue[];
  imports: number;
}

export function continuityStatus(storeDirectory: string, policyInput?: unknown): ContinuityStatus {
  const policy = policyInput === undefined ? null : validateTrustPolicy(policyInput);
  const paths = storePaths(storeDirectory);
  const events = readJsonl(paths.events) as WorkGraphEvent[];
  const observations = new Map<string, BundleObservation & { eventId: string }>();
  for (const o of readJsonl(paths.observations) as (BundleObservation & { eventId: string })[]) if (!observations.has(o.eventId)) observations.set(o.eventId, o);
  const quarantine = [...new Map((readJsonl(paths.quarantine) as { eventId: string; workId: string }[]).map((q) => [q.eventId, q])).values()];
  const projection = projectWorkGraph(events);
  const works: ContinuityWorkStatus[] = projection.workItems.map((item) => {
    const own = events.filter((e) => e.workId === item.workId);
    const intents = own.filter((e) => e.kind === "intent.captured");
    const data = intents.map((e) => (isRecord(e.data) ? e.data : {}));
    // Latest by when the intent was observed, not by import order; a missing observation stays unknown.
    const ordered = [...intents].sort((a, b) => a.observedAt.localeCompare(b.observedAt) || a.eventId.localeCompare(b.eventId));
    const obs = ordered.map((e) => observations.get(e.eventId)).filter((o): o is BundleObservation & { eventId: string } => o !== undefined);
    const lastIntent = ordered.at(-1);
    const latest = lastIntent ? observations.get(lastIntent.eventId) : undefined;
    const admittedEvent = own.find((e) => e.kind === "work.admitted");
    const registration = policy?.works.find((w) => w.workId === item.workId);
    const observedTimes = intents.map((e) => e.observedAt).sort();
    // Fails closed: only a reported active state may be admitted without acknowledgement.
    const needsOwner = !latest || latest.reportedState !== "active";
    const state: ContinuityState = item.completed ? "completed"
      : item.blocked ? "blocked"
      : item.admitted ? "working"
      : needsOwner ? "input-required"
      : "submitted";
    return {
      workId: item.workId,
      projectId: item.projectId,
      ownerActorId: registration?.ownerActorId ?? null,
      state,
      intent: {
        distinctRequests: new Set(data.map((d) => d.requestDigest)).size,
        observations: intents.length,
        harnesses: [...new Set(data.map((d) => String(d.harness)))].sort(),
        firstObservedAt: observedTimes[0] ?? null,
        lastObservedAt: observedTimes.at(-1) ?? null,
        captureCompleteness: [...new Set(obs.map((o) => o.captureCompleteness))].sort(),
        goalAuthority: [...new Set(data.map((d) => String(d.goalAuthority)))].sort(),
      },
      reportedState: latest ? { value: latest.reportedState, verification: latest.stateVerification === "native-goal-store" ? "native-goal-store" : "operator-supplied" } : null,
      checkout: latest ? { origin: latest.repository.origin, branch: latest.repository.branch, head: latest.repository.head, dirty: latest.repository.dirty } : null,
      admission: { admitted: item.admitted, byActorId: admittedEvent?.actorId ?? null, requirements: item.admitted ? item.requirements : null },
      delivery: { proofEventIds: item.proofEventIds, missingProofs: item.missingProofs, readyToComplete: item.readyToComplete, completed: item.completed },
      quarantined: quarantine.filter((q) => q.workId === item.workId).length,
      mayAutomaticallyResume: false,
    };
  });
  const known = new Set(works.map((w) => w.workId));
  return {
    schemaVersion: CONTINUITY_STATUS_SCHEMA,
    works,
    unattributedQuarantine: quarantine.filter((q) => !known.has(q.workId)).length,
    issues: projection.issues,
    imports: readJsonl(paths.receipts).length,
  };
}

export interface ReconciliationRequest {
  workId: string;
  actorId: string;
  decision: "admit" | "block";
  reason: string;
  requirements?: CompletionRequirements;
  /** Admitting work whose last reported state is not active (or is unknown) must say so. */
  acknowledgePaused?: boolean;
  /**
   * Human presence: the owner typed the work ID in an interactive terminal. This is a
   * presence check, not authentication; signed attestation remains SIP Board work.
   */
  confirmation: { method: "interactive-terminal"; typedWorkId: string };
  now?: Date;
}

/**
 * The only path from captured intent to admitted work. One registered owner decides;
 * a second admission is refused, and paused work needs explicit acknowledgement.
 * It records a decision; it never launches a harness.
 */
export function reconcileWork(storeDirectory: string, policyInput: unknown, request: ReconciliationRequest): WorkGraphEvent {
  const policy = validateTrustPolicy(policyInput);
  const work = policy.works.find((w) => w.workId === request.workId);
  if (!work) throw new ContinuityRefusal("Work is not registered");
  if (work.ownerActorId !== request.actorId) throw new ContinuityRefusal("Only the registered owner may reconcile this work");
  if (typeof request.reason !== "string" || !request.reason.trim()) throw new ContinuityRefusal("A reconciliation reason is required");
  if (request.confirmation?.method !== "interactive-terminal" || request.confirmation.typedWorkId !== request.workId) {
    throw new ContinuityRefusal("Reconciliation needs the owner to confirm the work ID in an interactive terminal");
  }
  if (request.requirements && request.requirements.verification !== true) {
    throw new ContinuityRefusal("Admitted work must require verification proof before completion");
  }
  return withStoreLock(storeDirectory, (assertHeld) => {
    const status = continuityStatus(storeDirectory, policy).works.find((w) => w.workId === request.workId);
    if (!status) throw new ContinuityRefusal("No trusted captured intent exists for this work");
    if (status.admission.admitted) throw new ContinuityRefusal("Work is already admitted; a second claim is refused");
    if (status.state === "blocked" || status.state === "completed") throw new ContinuityRefusal(`Work is ${status.state}`);
    if (request.decision === "admit" && status.state === "input-required" && request.acknowledgePaused !== true) {
      throw new ContinuityRefusal(`Last reported state is ${status.reportedState?.value ?? "unknown"}; acknowledge it explicitly to admit`);
    }
    const at = (request.now ?? new Date()).toISOString();
    const intentIds = (readJsonl(storePaths(storeDirectory).events) as WorkGraphEvent[])
      .filter((e) => e.workId === request.workId && e.kind === "intent.captured").map((e) => e.eventId);
    const requirements = request.requirements ?? { artifact: true, change: true, checks: true, deployment: false, verification: true };
    const event: WorkGraphEvent = {
      schemaVersion: "1.0",
      eventId: `reconcile:${sha256(canonical([request.workId, request.decision, request.actorId, at]))}`,
      workId: request.workId,
      correlationId: request.workId,
      projectId: work.projectId,
      kind: request.decision === "admit" ? "work.admitted" : "work.blocked",
      source: { system: "human", sourceId: request.actorId },
      actorId: request.actorId,
      occurredAt: at,
      observedAt: at,
      evidenceRefs: intentIds,
      visibility: "private",
      retention: "audit",
      summary: request.decision === "admit" ? "Owner admitted captured intent after reconciliation." : "Owner blocked captured intent after reconciliation.",
      data: request.decision === "admit"
        ? { requirements, reason: request.reason, acknowledgedReportedState: request.acknowledgePaused === true, confirmation: "interactive-terminal" }
        : { reason: request.reason, confirmation: "interactive-terminal" },
    };
    const check = parseWorkGraphJsonl(JSON.stringify(event));
    if (check.issues.length) throw new ContinuityRefusal(`Reconciliation event failed validation: ${check.issues[0].message}`);
    assertHeld();
    appendJsonl(storePaths(storeDirectory).events, [event]);
    return event;
  });
}
