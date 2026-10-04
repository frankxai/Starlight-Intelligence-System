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
import { createHash } from "node:crypto";
import {
  appendFileSync,
  closeSync,
  existsSync,
  fstatSync,
  lstatSync,
  mkdirSync,
  openSync,
  readSync,
  rmSync,
  statSync,
  writeSync,
} from "node:fs";
import { isAbsolute, join } from "node:path";
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
const LOCK_STALE_MS = 30_000;

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
  workId: string;
  projectId: string;
  requestDigest: string;
  reportedState: string;
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
  const foreign = parsed.events.find((e) => e.kind !== "intent.captured");
  if (foreign) throw new ContinuityRefusal(`Collectors may only supply intent.captured, not ${foreign.kind}`);
  const observations = (bundle.observations as unknown[]).filter((o): o is BundleObservation =>
    isRecord(o) && typeof o.workId === "string" && typeof o.requestDigest === "string" && isRecord(o.repository)
    && typeof o.repository.origin === "string" && typeof o.repository.branch === "string" && typeof o.repository.head === "string");
  return { digest: sha256(manifestBytes), sourceRevision: bundle.sisSourceRevision, events: parsed.events, observations };
}

function trustDecision(
  event: WorkGraphEvent,
  observations: BundleObservation[],
  policy: ContinuityTrustPolicy,
): QuarantineReason | null {
  const work = policy.works.find((w) => w.workId === event.workId);
  if (!work) return "unregistered-work";
  if (work.projectId !== event.projectId) return "project-mismatch";
  const data = isRecord(event.data) ? event.data : {};
  if (data.mayAutomaticallyResume !== false) return "resume-not-forbidden";
  const harness = typeof data.harness === "string" ? data.harness : "";
  const uri = event.source.uri ?? "";
  if (!policy.collectors.some((c) => c.harness === harness && uri.startsWith(c.sourceRefPrefix))) return "untrusted-collector";
  if (!policy.operators.includes(event.actorId)) return "unknown-operator";
  const observation = observations.find((o) => o.workId === event.workId && o.requestDigest === data.requestDigest
    && o.repository.head === data.repositoryHead);
  if (!observation) return "observation-missing";
  if (work.checkout && (work.checkout.origin !== observation.repository.origin || work.checkout.branch !== observation.repository.branch)) {
    return "checkout-mismatch";
  }
  return null;
}

/** Synchronous exclusive lock; a crashed holder's lock expires after 30 seconds. */
function withStoreLock<T>(storeDirectory: string, run: () => T): T {
  const lock = join(storeDirectory, ".import.lock");
  let fd: number;
  try {
    fd = openSync(lock, "wx");
  } catch {
    if (existsSync(lock) && Date.now() - statSync(lock).mtimeMs > LOCK_STALE_MS) {
      rmSync(lock, { force: true });
      fd = openSync(lock, "wx");
    } else {
      throw new ContinuityRefusal("Another continuity import is in progress; retry after it finishes");
    }
  }
  try {
    writeSync(fd, String(process.pid));
    return run();
  } finally {
    closeSync(fd);
    rmSync(lock, { force: true });
  }
}

function readJsonl(file: string): unknown[] {
  if (!existsSync(file)) return [];
  return readBounded(file).toString("utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
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
    return withStoreLock(storeDirectory, () => {
      const receipts = readJsonl(paths.receipts) as { bundleDigest: string }[];
      if (receipts.some((r) => r.bundleDigest === bundle.digest)) {
        return { status: "already-imported" as const, bundleDigest: bundle.digest, ...empty };
      }
      const stored = new Map<string, string>();
      for (const event of readJsonl(paths.events) as WorkGraphEvent[]) stored.set(event.eventId, canonical(event));
      const accepted: WorkGraphEvent[] = [];
      const duplicates: string[] = [];
      const quarantined: ContinuityImportResult["quarantined"] = [];
      for (const event of bundle.events) {
        const previous = stored.get(event.eventId);
        if (previous !== undefined) {
          if (previous !== canonical(event)) throw new ContinuityRefusal(`Event ${event.eventId} conflicts with stored content`);
          duplicates.push(event.eventId);
          continue;
        }
        const reason = trustDecision(event, bundle.observations, policy);
        if (reason) quarantined.push({ eventId: event.eventId, workId: event.workId, reason });
        else accepted.push(event);
      }
      const importedAt = (options.now ?? new Date()).toISOString();
      // Events first, receipt last: an interrupted import replays as duplicates.
      if (accepted.length) appendFileSync(paths.events, accepted.map((e) => JSON.stringify(e)).join("\n") + "\n", { mode: 0o600 });
      const acceptedObservations = accepted.map((event) => {
        const data = event.data as Record<string, unknown>;
        const o = bundle.observations.find((x) => x.workId === event.workId && x.requestDigest === data.requestDigest)!;
        return { eventId: event.eventId, workId: event.workId, requestDigest: o.requestDigest, reportedState: o.reportedState,
          captureCompleteness: o.captureCompleteness, repository: o.repository, importedAt };
      });
      if (acceptedObservations.length) {
        appendFileSync(paths.observations, acceptedObservations.map((o) => JSON.stringify(o)).join("\n") + "\n", { mode: 0o600 });
      }
      if (quarantined.length) {
        appendFileSync(paths.quarantine, quarantined.map((q) => JSON.stringify({ ...q, bundleDigest: bundle.digest, importedAt })).join("\n") + "\n", { mode: 0o600 });
      }
      appendFileSync(paths.receipts, JSON.stringify({ bundleDigest: bundle.digest, importedAt, accepted: accepted.length,
        duplicates: duplicates.length, quarantined: quarantined.length }) + "\n", { mode: 0o600 });
      return { status: "imported" as const, bundleDigest: bundle.digest, accepted: accepted.map((e) => e.eventId), duplicates,
        quarantined, executionStarted: false as const };
    });
  } catch (error) {
    const refusal = error instanceof ContinuityRefusal ? error.message : "Import failed; the store was left unchanged or replayable";
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
  reportedState: { value: string; verification: "operator-supplied" } | null;
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
  const observations = readJsonl(paths.observations) as (BundleObservation & { eventId: string; importedAt: string })[];
  const quarantine = readJsonl(paths.quarantine) as { workId: string }[];
  const projection = projectWorkGraph(events);
  const works: ContinuityWorkStatus[] = projection.workItems.map((item) => {
    const own = events.filter((e) => e.workId === item.workId);
    const intents = own.filter((e) => e.kind === "intent.captured");
    const data = intents.map((e) => (isRecord(e.data) ? e.data : {}));
    const obs = observations.filter((o) => o.workId === item.workId).sort((a, b) => a.importedAt.localeCompare(b.importedAt));
    const latest = obs.at(-1);
    const admittedEvent = own.find((e) => e.kind === "work.admitted");
    const registration = policy?.works.find((w) => w.workId === item.workId);
    const observedTimes = intents.map((e) => e.observedAt).sort();
    const pausedOrBlocked = latest && (latest.reportedState === "paused" || latest.reportedState === "blocked");
    const state: ContinuityState = item.completed ? "completed"
      : item.blocked ? "blocked"
      : item.admitted ? "working"
      : pausedOrBlocked ? "input-required"
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
      reportedState: latest ? { value: latest.reportedState, verification: "operator-supplied" } : null,
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
  /** Admitting work whose last reported state was paused or blocked must say so. */
  acknowledgePaused?: boolean;
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
  return withStoreLock(storeDirectory, () => {
    const status = continuityStatus(storeDirectory, policy).works.find((w) => w.workId === request.workId);
    if (!status) throw new ContinuityRefusal("No trusted captured intent exists for this work");
    if (status.admission.admitted) throw new ContinuityRefusal("Work is already admitted; a second claim is refused");
    if (status.state === "blocked" || status.state === "completed") throw new ContinuityRefusal(`Work is ${status.state}`);
    if (request.decision === "admit" && status.state === "input-required" && request.acknowledgePaused !== true) {
      throw new ContinuityRefusal("Last reported state is paused or blocked; acknowledge it explicitly to admit");
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
        ? { requirements, reason: request.reason, acknowledgedPaused: request.acknowledgePaused === true }
        : { reason: request.reason },
    };
    const check = parseWorkGraphJsonl(JSON.stringify(event));
    if (check.issues.length) throw new ContinuityRefusal(`Reconciliation event failed validation: ${check.issues[0].message}`);
    appendFileSync(storePaths(storeDirectory).events, JSON.stringify(event) + "\n", { mode: 0o600 });
    return event;
  });
}
