/**
 * Verify completed runtime receipts before using the existing advisory.
 * No execution, database writes, resource creation or release authority.
 * Host authorization and issuer keys MUST come from server-owned adapters.
 * Built on SIP — Starlight Intelligence Protocol.
 */
import { adjudicateEvolution } from "./adjudicate.mjs";

export const RUNTIME_RECEIPT_SCHEMA = "starlight.evolution-runtime-receipt/v1";
const encoder = new TextEncoder();
const RUNTIMES = Object.freeze({ cloudflare: ["pi", "browser-run"], vercel: ["sandbox"] });
const hex = value => [...new Uint8Array(value)].map(b => b.toString(16).padStart(2, "0")).join("");
const token = value => typeof value === "string" && /^[a-zA-Z0-9._:/-]{1,160}$/.test(value);
const sha = value => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
const blocked = reason => ({ verdict: "BLOCKED", reasons: [reason], releaseAuthorized: false, summary: null });

// JSON data only. Sorted keys bind a frozen experiment independently of key order.
// This is a versioned application encoding, not an RFC 8785 implementation.
function stable(value, depth = 0) {
  if (depth > 32) throw new TypeError("JSON nesting limit");
  if (value === null || typeof value === "boolean" || typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" && Number.isFinite(value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(v => stable(v, depth + 1)).join(",")}]`;
  if (object(value) && Object.getPrototypeOf(value) === Object.prototype) {
    return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${stable(value[k], depth + 1)}`).join(",")}}`;
  }
  throw new TypeError("JSON data required");
}

export async function experimentDigest(experiment) {
  const frozen = JSON.parse(stable(experiment));
  // Receipt hashes are outputs, so exclude them from the preregistration hash.
  // Including them would require a receipt to contain its own digest indirectly.
  for (const label of ["baseline", "candidate"]) {
    if (object(frozen?.[label]?.receipt)) {
      delete frozen[label].receipt.digest;
      if (object(frozen[label].receipt.checker)) delete frozen[label].receipt.checker.subjectDigest;
    }
  }
  const bytes = encoder.encode(stable(frozen));
  if (bytes.byteLength > 65536) throw new TypeError("bounded experiment required");
  return hex(await crypto.subtle.digest("SHA-256", bytes));
}

export async function receiptDigest(payload) {
  if (typeof payload !== "string" || encoder.encode(payload).byteLength > 32768) {
    throw new TypeError("bounded receipt text required");
  }
  return hex(await crypto.subtle.digest("SHA-256", encoder.encode(payload)));
}

async function verifiedIssuer(envelope, role, digest, body, host) {
  // Reuse src/run-receipt.ts via the server adapter; do not fork DSSE crypto.
  if (!object(envelope) || typeof envelope.payload !== "string" || envelope.payload.length > 65536) {
    throw new Error("bounded canonical run receipt required");
  }
  const admitted = Object.entries(host.keys ?? {}).filter(([, k]) =>
    object(k) && k.role === role && k.revoked !== true && typeof k.publicKeyPem === "string");
  const result = await host.verifyRunReceipt(envelope, admitted.map(([, k]) => k.publicKeyPem));
  const issuer = admitted.find(([keyId]) => keyId === result?.keyid)?.[1];
  const receipt = result?.receipt;
  if (result?.ok !== true || !issuer || !token(issuer.id) || !token(issuer.provider) ||
      receipt?.subject?.digest?.sha256 !== digest || receipt?.verdict !== "PASS" ||
      receipt?.run?.kind !== `evolution.${role}` || receipt?.run?.correlationId !== body.runId ||
      Date.parse(receipt.issuedAt) < Date.parse(body.completedAt) || Date.parse(receipt.issuedAt) > host.nowMs ||
      (role === "runner" && (Date.parse(receipt.run.startedAt) !== Date.parse(body.startedAt) ||
        Date.parse(receipt.run.endedAt) !== Date.parse(body.completedAt)))) {
    throw new Error("canonical run receipt verification failed");
  }
  return issuer;
}

async function verifiedRun(envelope, expected, host, authorization, nowMs) {
  if (!object(envelope)) {
    throw new Error("malformed runtime receipt");
  }
  const digest = await receiptDigest(envelope.payload);
  const body = JSON.parse(envelope.payload);
  if (!object(body) || body.schema !== RUNTIME_RECEIPT_SCHEMA ||
      body.experimentId !== expected.experimentId || body.experimentDigest !== expected.experimentDigest ||
      body.tenantScope !== expected.tenantScope || body.taskSetDigest !== expected.taskSetDigest ||
      body.sourceRevision !== expected.run.sourceRevision ||
      body.capabilityVersion !== expected.run.capabilityVersion ||
      !token(body.runId) || !authorization.runIds?.includes(body.runId)) {
    throw new Error("runtime receipt scope/source mismatch");
  }
  const runner = await verifiedIssuer(envelope.runner, "runner", digest, body, host);
  const checker = await verifiedIssuer(envelope.checker, "checker", digest, body, host);
  if (runner.id === checker.id || runner.provider === checker.provider) {
    throw new Error("trusted independent runner/checker required");
  }
  const runtime = body.runtime;
  if (!object(runtime) || !RUNTIMES[runtime.provider]?.includes(runtime.kind) ||
      !token(runtime.version) || !sha(runtime.sourceDigest) ||
      stable(runtime) !== stable(expected.run.runtime) ||
      !runner.runtimeProviders?.includes(runtime.provider)) {
    throw new Error("unsupported or unauthorized runtime");
  }
  // A terminated or unknown-effect run remains evidence; it cannot qualify here.
  if (body.status !== "completed" || !["fixture", "independently_observed"].includes(body.evidenceLevel)) {
    throw new Error("completed evidence required");
  }
  const start = Date.parse(body.startedAt);
  const end = Date.parse(body.completedAt);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || end > nowMs ||
      nowMs - end > host.maxAgeMs) throw new Error("stale or invalid runtime timestamps");
  if (stable(body.metrics) !== stable(expected.run.metrics) ||
      body.evidenceLevel !== expected.run.evidenceLevel ||
      expected.run.maker?.id !== runner.id || expected.run.maker?.provider !== runner.provider ||
      expected.run.receipt?.checker?.id !== checker.id ||
      expected.run.receipt?.checker?.provider !== checker.provider) {
    throw new Error("signed metrics/identity differ from frozen experiment");
  }
  // Never trust caller-supplied receipt.digest: derive from the signed bytes.
  return {
    runId: body.runId,
    run: {
      capabilityVersion: body.capabilityVersion, sourceRevision: body.sourceRevision,
      maker: { id: runner.id, provider: runner.provider }, metrics: body.metrics,
      evidenceLevel: body.evidenceLevel,
      receipt: { digest, taskSetDigest: body.taskSetDigest,
        checker: { id: checker.id, provider: checker.provider, subjectDigest: digest } },
    },
  };
}

/**
 * Host authorize({tenantScope, experimentId, experimentDigest}) must authenticate
 * the session, current membership, frozen benchmark and tenant-to-run mapping.
 * Return matching experimentDigest/taskSetDigest/tenantScope and TWO exact runIds.
 * No anonymous `agent_runs` row, client boolean or claimed checker is sufficient.
 * The callback is invoked before parsing receipt contents or querying issuers.
 */
export async function adjudicateRuntimeExperiment(experiment, envelopes, host) {
  try {
    if (!object(host) || typeof host.authorize !== "function" || typeof host.verifyRunReceipt !== "function" ||
        !Number.isFinite(host.nowMs) || !Number.isFinite(host.maxAgeMs) ||
        host.maxAgeMs <= 0 || host.maxAgeMs > 86400000) return blocked("server authorization and bounded clock required");
    // Snapshot before asynchronous authorization to prevent mutation in flight.
    const frozen = JSON.parse(stable(experiment));
    const copies = structuredClone(envelopes);
    const digest = await experimentDigest(frozen);
    const authorization = await host.authorize({ tenantScope: frozen.tenantScope,
      experimentId: frozen.id, experimentDigest: digest });
    if (!object(authorization) || authorization.tenantScope !== frozen.tenantScope ||
        authorization.experimentDigest !== digest || !sha(authorization.taskSetDigest) ||
        authorization.taskSetDigest !== frozen.taskSet?.digest ||
        !Array.isArray(authorization.runIds) || authorization.runIds.length !== 2 ||
        authorization.runIds.some(id => !token(id)) || new Set(authorization.runIds).size !== 2) {
      return blocked("tenant/benchmark/run authorization denied");
    }
    const expected = { tenantScope: frozen.tenantScope, experimentId: frozen.id,
      taskSetDigest: authorization.taskSetDigest, experimentDigest: digest };
    const baseline = await verifiedRun(copies?.baseline, { ...expected, run: frozen.baseline }, host, authorization, host.nowMs);
    const candidate = await verifiedRun(copies?.candidate, { ...expected, run: frozen.candidate }, host, authorization, host.nowMs);
    if (baseline.runId === candidate.runId) return blocked("distinct baseline/candidate runs required");
    return adjudicateEvolution({ ...frozen, baseline: baseline.run, candidate: candidate.run });
  } catch {
    // Do not echo payloads, issuer IDs, tenant IDs or provider exception messages.
    return blocked("runtime evidence could not be verified");
  }
}
