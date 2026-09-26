/**
 * Starlight run receipt v1 — the unit of proof for agent work.
 *
 * A run receipt states what a run did, what it cost, how long it took, who
 * decided at each gate, and which evidence remains. It is signed as a DSSE v1
 * envelope around an in-toto Statement v1, with Ed25519, exactly like the SIP
 * conformance receipt, so one verifier handles both.
 *
 *   DSSE v1     https://github.com/secure-systems-lab/dsse/blob/master/protocol.md
 *   in-toto v1  https://github.com/in-toto/attestation/blob/main/spec/v1/statement.md
 *
 * This file is byte-identical in Starlight-Intelligence-System (src/run-receipt.ts,
 * the issuer) and starlight-intelligence-web (lib/run-receipt.ts, the public
 * verifier). Change it in both places or the signatures stop agreeing.
 *
 * No I/O. No dependencies beyond node:crypto. Nothing here talks to a network.
 */

import { KeyObject, createHash, createPrivateKey, createPublicKey, sign as cryptoSign, verify as cryptoVerify } from "node:crypto";

export const RUN_RECEIPT_SCHEMA = "starlight.run-receipt.v1";
export const STATEMENT_TYPE = "https://in-toto.io/Statement/v1";
export const PAYLOAD_TYPE = "application/vnd.in-toto+json";
export const RUN_RECEIPT_PREDICATE_TYPE = "https://starlightintelligence.ai/protocol/run-receipt/v1";

export type RunReceiptVerdict = "PASS" | "FAIL" | "PARTIAL";
export type StageStatus = "ok" | "failed" | "skipped";
export type DecisionBy = "human" | "agent" | "policy";
export type DecisionOutcome = "approved" | "rejected" | "deferred";

export interface RunReceiptStage {
  /** Stage name in run order, e.g. "retrieve", "extract", "synthesize", "judge". */
  name: string;
  status: StageStatus;
  /** Model id as the provider names it, e.g. "deepseek-ai/DeepSeek-V4-Flash". */
  model?: string;
  /** Provider label, e.g. "nebius", "anthropic", "local". */
  provider?: string;
  inputTokens?: number;
  outputTokens?: number;
  /** Euros, as charged or as listed. Zero is a valid cost; omit when unknown. */
  costEur?: number;
  latencyMs?: number;
  note?: string;
}

export interface RunReceiptDecision {
  /** The gate that was crossed, e.g. "publish", "spend", "merge". */
  gate: string;
  decidedBy: DecisionBy;
  /** Who: a person's handle, an agent id, or a policy id. */
  actorId: string;
  outcome: DecisionOutcome;
  at: string;
  note?: string;
}

export interface RunReceiptEvidence {
  /** e.g. "source", "eval", "screenshot", "ledger", "pr", "deployment". */
  kind: string;
  /** URL, path, or ledger id the verifier can go and look at. */
  ref: string;
  sha256?: string;
}

export interface RunReceipt {
  schema: typeof RUN_RECEIPT_SCHEMA;
  receiptId: string;
  issuedAt: string;
  issuer: { name: string; keyid?: string };
  run: {
    id: string;
    /** What kind of run, e.g. "desk.brief", "constellation", "publish". */
    kind: string;
    host: string;
    startedAt: string;
    endedAt: string;
    correlationId?: string;
  };
  /** The artifact the run produced. The digest is what the signature names. */
  subject: { name: string; digest: { sha256: string } };
  stages: RunReceiptStage[];
  totals: {
    costEur: number;
    latencyMs: number;
    tokens: { input: number; output: number };
  };
  decisions: RunReceiptDecision[];
  evidence: RunReceiptEvidence[];
  verdict: RunReceiptVerdict;
}

export interface DsseEnvelope {
  payloadType: string;
  payload: string;
  signatures: Array<{ keyid?: string; sig: string }>;
}

export interface VerifyResult {
  ok: boolean;
  reasons: string[];
  keyid: string | null;
  receipt: RunReceipt | null;
}

const SHA256 = /^[0-9a-f]{64}$/;
const VERDICTS: RunReceiptVerdict[] = ["PASS", "FAIL", "PARTIAL"];
const STAGE_STATUSES: StageStatus[] = ["ok", "failed", "skipped"];
const DECIDED_BY: DecisionBy[] = ["human", "agent", "policy"];
const OUTCOMES: DecisionOutcome[] = ["approved", "rejected", "deferred"];
/** Rounding tolerance when checking totals against stage sums: half of the 4-decimal rounding unit, or 0.5 percent of the stage sum, whichever is larger. */
function eurTolerance(stageSum: number): number {
  return Math.max(0.00005, stageSum * 0.005);
}
/** DSSE issuers emit one or a few signatures. Above this count the envelope is refused before any signature is checked, which bounds the verification cost a caller can impose. */
export const MAX_SIGNATURES = 8;
/** RFC 3339 date-time with a zone designator. Date.parse alone accepts "2026" and other partial forms. */
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,9})?(Z|[+-]\d{2}:\d{2})$/;
const KEYS = {
  receipt: ["schema", "receiptId", "issuedAt", "issuer", "run", "subject", "stages", "totals", "decisions", "evidence", "verdict"],
  issuer: ["name", "keyid"],
  run: ["id", "kind", "host", "startedAt", "endedAt", "correlationId"],
  subject: ["name", "digest"],
  digest: ["sha256"],
  stage: ["name", "status", "model", "provider", "inputTokens", "outputTokens", "costEur", "latencyMs", "note"],
  totals: ["costEur", "latencyMs", "tokens"],
  tokens: ["input", "output"],
  decision: ["gate", "decidedBy", "actorId", "outcome", "at", "note"],
  evidence: ["kind", "ref", "sha256"],
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isDate(value: unknown): value is string {
  return typeof value === "string" && DATE_TIME.test(value) && !Number.isNaN(Date.parse(value));
}

/** Names of properties that the schema does not allow on this object. */
function unknownKeys(value: Record<string, unknown>, allowed: readonly string[]): string[] {
  return Object.keys(value).filter((k) => !allowed.includes(k));
}

function isNonNegative(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

/** sha256 of a string or buffer, hex. */
export function sha256Hex(input: string | Uint8Array): string {
  return createHash("sha256").update(input).digest("hex");
}

/** DSSE pre-authentication encoding. Lengths are byte lengths, in ASCII decimal. */
export function pae(payloadType: string, payload: Uint8Array | string): Buffer {
  const type = Buffer.from(payloadType, "utf8");
  const body = Buffer.isBuffer(payload) ? payload : Buffer.from(payload as string | Uint8Array);
  return Buffer.concat([
    Buffer.from(`DSSEv1 ${type.length} `, "utf8"),
    type,
    Buffer.from(` ${body.length} `, "utf8"),
    body,
  ]);
}

/** keyid = sha256 of the public key's SPKI DER, hex. Stable across PEM formatting. */
export function keyIdOf(publicKey: KeyObject | string): string {
  const key = typeof publicKey === "string" ? createPublicKey(publicKey) : publicKey;
  const der = key.export({ type: "spki", format: "der" });
  return createHash("sha256").update(der).digest("hex");
}

function assertEd25519(key: KeyObject, label: string): KeyObject {
  if (key.asymmetricKeyType !== "ed25519") {
    throw new Error(`${label} must be an Ed25519 key, got ${key.asymmetricKeyType ?? "unknown"}`);
  }
  return key;
}

/**
 * What is wrong with a receipt, structurally. An empty list means it is complete:
 * every field present, every stage and decision well formed, totals consistent
 * with the stages. Checked on both sides so a hand-edited receipt is neither
 * signed nor shown as verified.
 */
export function receiptProblems(receipt: unknown): string[] {
  if (!isRecord(receipt)) return ["receipt is not an object"];
  const problems: string[] = [];
  const r = receipt;

  for (const k of unknownKeys(r, KEYS.receipt)) problems.push(`unknown property ${k}`);
  if (r.schema !== RUN_RECEIPT_SCHEMA) problems.push(`schema is ${JSON.stringify(r.schema)}, expected ${RUN_RECEIPT_SCHEMA}`);
  if (typeof r.receiptId !== "string" || !r.receiptId.trim()) problems.push("receiptId is missing");
  if (!isDate(r.issuedAt)) problems.push("issuedAt is not a date-time");
  if (!isRecord(r.issuer) || typeof r.issuer.name !== "string" || !r.issuer.name.trim()) {
    problems.push("issuer.name is missing");
  } else {
    for (const k of unknownKeys(r.issuer, KEYS.issuer)) problems.push(`unknown property issuer.${k}`);
    if (r.issuer.keyid !== undefined && !SHA256.test(String(r.issuer.keyid))) problems.push("issuer.keyid is not a sha256 keyid");
  }

  if (!isRecord(r.run)) {
    problems.push("run is missing");
  } else {
    for (const k of unknownKeys(r.run, KEYS.run)) problems.push(`unknown property run.${k}`);
    for (const k of ["id", "kind", "host"]) {
      if (typeof r.run[k] !== "string" || !(r.run[k] as string).trim()) problems.push(`run.${k} is missing`);
    }
    if (!isDate(r.run.startedAt)) problems.push("run.startedAt is not a date-time");
    if (!isDate(r.run.endedAt)) problems.push("run.endedAt is not a date-time");
    if (isDate(r.run.startedAt) && isDate(r.run.endedAt) && Date.parse(r.run.endedAt) < Date.parse(r.run.startedAt)) {
      problems.push("run.endedAt is before run.startedAt");
    }
  }

  if (!isRecord(r.subject) || typeof r.subject.name !== "string" || !r.subject.name.trim()) {
    problems.push("subject.name is missing");
  } else {
    for (const k of unknownKeys(r.subject, KEYS.subject)) problems.push(`unknown property subject.${k}`);
    if (!isRecord(r.subject.digest) || !SHA256.test(String(r.subject.digest.sha256 ?? ""))) {
      problems.push("subject.digest.sha256 is not a sha256");
    } else {
      for (const k of unknownKeys(r.subject.digest, KEYS.digest)) problems.push(`unknown property subject.digest.${k}`);
    }
  }

  let costSum = 0;
  let latencySum = 0;
  let inSum = 0;
  let outSum = 0;
  let anyCost = false;
  if (!Array.isArray(r.stages) || r.stages.length === 0) {
    problems.push("receipt lists no stages");
  } else {
    r.stages.forEach((stage, i) => {
      if (!isRecord(stage)) {
        problems.push(`stage ${i} is not an object`);
        return;
      }
      for (const k of unknownKeys(stage, KEYS.stage)) problems.push(`unknown property stages[${i}].${k}`);
      if (typeof stage.name !== "string" || !stage.name.trim()) problems.push(`stage ${i} has no name`);
      if (!STAGE_STATUSES.includes(stage.status as StageStatus)) problems.push(`stage ${stage.name ?? i} has status ${JSON.stringify(stage.status)}`);
      for (const k of ["inputTokens", "outputTokens", "costEur", "latencyMs"]) {
        if (stage[k] !== undefined && !isNonNegative(stage[k])) problems.push(`stage ${stage.name ?? i}.${k} is not a non-negative number`);
      }
      if (isNonNegative(stage.costEur)) {
        costSum += stage.costEur;
        anyCost = true;
      }
      if (isNonNegative(stage.latencyMs)) latencySum += stage.latencyMs;
      if (isNonNegative(stage.inputTokens)) inSum += stage.inputTokens;
      if (isNonNegative(stage.outputTokens)) outSum += stage.outputTokens;
    });
  }

  if (!isRecord(r.totals)) {
    problems.push("totals is missing");
  } else {
    const t = r.totals;
    for (const k of unknownKeys(t, KEYS.totals)) problems.push(`unknown property totals.${k}`);
    if (isRecord(t.tokens)) for (const k of unknownKeys(t.tokens, KEYS.tokens)) problems.push(`unknown property totals.tokens.${k}`);
    if (!isNonNegative(t.costEur)) problems.push("totals.costEur is not a non-negative number");
    if (!isNonNegative(t.latencyMs)) problems.push("totals.latencyMs is not a non-negative number");
    if (!isRecord(t.tokens) || !isNonNegative(t.tokens.input) || !isNonNegative(t.tokens.output)) {
      problems.push("totals.tokens.input and totals.tokens.output are required");
    }
    // Totals may exceed the stage sums (overhead, untracked steps) but never fall short of them.
    if (anyCost && isNonNegative(t.costEur) && t.costEur + eurTolerance(costSum) < costSum) {
      problems.push(`totals.costEur ${t.costEur} is below the stage sum ${costSum.toFixed(4)}`);
    }
    if (isNonNegative(t.latencyMs) && t.latencyMs < latencySum) problems.push(`totals.latencyMs ${t.latencyMs} is below the stage sum ${latencySum}`);
    if (isRecord(t.tokens) && isNonNegative(t.tokens.input) && t.tokens.input < inSum) problems.push(`totals.tokens.input ${t.tokens.input} is below the stage sum ${inSum}`);
    if (isRecord(t.tokens) && isNonNegative(t.tokens.output) && t.tokens.output < outSum) problems.push(`totals.tokens.output ${t.tokens.output} is below the stage sum ${outSum}`);
  }

  if (!Array.isArray(r.decisions)) {
    problems.push("decisions must be a list (empty is allowed)");
  } else {
    r.decisions.forEach((d, i) => {
      if (!isRecord(d)) {
        problems.push(`decision ${i} is not an object`);
        return;
      }
      for (const k of unknownKeys(d, KEYS.decision)) problems.push(`unknown property decisions[${i}].${k}`);
      if (typeof d.gate !== "string" || !d.gate.trim()) problems.push(`decision ${i} has no gate`);
      if (!DECIDED_BY.includes(d.decidedBy as DecisionBy)) problems.push(`decision ${d.gate ?? i}.decidedBy is ${JSON.stringify(d.decidedBy)}`);
      if (typeof d.actorId !== "string" || !d.actorId.trim()) problems.push(`decision ${d.gate ?? i} has no actorId`);
      if (!OUTCOMES.includes(d.outcome as DecisionOutcome)) problems.push(`decision ${d.gate ?? i}.outcome is ${JSON.stringify(d.outcome)}`);
      if (!isDate(d.at)) problems.push(`decision ${d.gate ?? i}.at is not a date-time`);
    });
  }

  if (!Array.isArray(r.evidence)) {
    problems.push("evidence must be a list (empty is allowed)");
  } else {
    r.evidence.forEach((e, i) => {
      if (!isRecord(e)) {
        problems.push(`evidence ${i} is not an object`);
        return;
      }
      for (const k of unknownKeys(e, KEYS.evidence)) problems.push(`unknown property evidence[${i}].${k}`);
      if (typeof e.kind !== "string" || !e.kind.trim()) problems.push(`evidence ${i} has no kind`);
      if (typeof e.ref !== "string" || !e.ref.trim()) problems.push(`evidence ${i} has no ref`);
      if (e.sha256 !== undefined && !SHA256.test(String(e.sha256))) problems.push(`evidence ${e.ref ?? i}.sha256 is not a sha256`);
    });
  }

  if (!VERDICTS.includes(r.verdict as RunReceiptVerdict)) problems.push(`verdict is ${JSON.stringify(r.verdict)}`);

  return problems;
}

/** Wrap a run receipt in an in-toto Statement. The subject is the produced artifact. */
export function receiptStatement(receipt: RunReceipt) {
  const problems = receiptProblems(receipt);
  if (problems.length) throw new Error(`receipt is incomplete: ${problems.join("; ")}`);
  return {
    _type: STATEMENT_TYPE,
    subject: [{ name: receipt.subject.name, digest: { sha256: receipt.subject.digest.sha256 } }],
    predicateType: RUN_RECEIPT_PREDICATE_TYPE,
    predicate: receipt,
  };
}

/**
 * Sign a run receipt. Refuses an incomplete receipt. Unlike the conformance
 * receipt, a FAIL verdict is signable: a signed record of a failed run is
 * exactly the kind of proof this format exists to keep.
 */
export function signRunReceipt(receipt: RunReceipt, privateKeyPem: string): DsseEnvelope {
  const problems = receiptProblems(receipt);
  if (problems.length) throw new Error(`refusing to sign: ${problems.join("; ")}`);
  const privateKey = assertEd25519(createPrivateKey(privateKeyPem), "signing key");
  const publicKey = createPublicKey(privateKey);
  const keyid = keyIdOf(publicKey);
  const stamped: RunReceipt = { ...receipt, issuer: { ...receipt.issuer, keyid } };
  const payload = Buffer.from(JSON.stringify(receiptStatement(stamped)), "utf8");
  const sig = cryptoSign(null, pae(PAYLOAD_TYPE, payload), privateKey);
  return {
    payloadType: PAYLOAD_TYPE,
    payload: payload.toString("base64"),
    signatures: [{ keyid, sig: sig.toString("base64") }],
  };
}

/**
 * Verify an envelope against a set of trusted Ed25519 public keys (PEM).
 * Returns { ok, reasons, keyid, receipt }. Never throws on bad input.
 */
export function verifyRunReceipt(envelope: unknown, trustedPublicKeys: string[]): VerifyResult {
  const reasons: string[] = [];
  const fail = (reason: string): VerifyResult => ({ ok: false, reasons: [...reasons, reason], keyid: null, receipt: null });

  if (!isRecord(envelope)) return fail("envelope is not an object");
  if (envelope.payloadType !== PAYLOAD_TYPE) return fail(`payloadType is ${JSON.stringify(envelope.payloadType)}, expected ${PAYLOAD_TYPE}`);
  if (typeof envelope.payload !== "string") return fail("payload is missing");
  if (!Array.isArray(envelope.signatures) || envelope.signatures.length === 0) return fail("envelope carries no signatures");
  if (envelope.signatures.length > MAX_SIGNATURES) return fail(`envelope carries ${envelope.signatures.length} signatures; at most ${MAX_SIGNATURES} are accepted`);

  if (!Array.isArray(trustedPublicKeys)) return fail("trusted keys must be a list");
  const trusted = new Map<string, KeyObject>();
  for (const pem of trustedPublicKeys) {
    try {
      const key = assertEd25519(createPublicKey(pem), "trusted key");
      trusted.set(keyIdOf(key), key);
    } catch (err) {
      return fail(`trusted key is unusable: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  if (trusted.size === 0) return fail("no trusted keys supplied");

  const payload = Buffer.from(envelope.payload, "base64");
  const message = pae(envelope.payloadType, payload);

  let signedBy: string | null = null;
  const verifies = (key: KeyObject, sig: unknown) => {
    try {
      return cryptoVerify(null, message, key, Buffer.from(String(sig), "base64"));
    } catch {
      return false;
    }
  };
  for (const s of envelope.signatures) {
    if (!isRecord(s)) continue;
    if (s.keyid !== undefined && typeof s.keyid !== "string") {
      reasons.push("signature keyid must be a string when present");
      continue;
    }
    const keyid = typeof s.keyid === "string" ? s.keyid : null;
    if (keyid && !trusted.has(keyid)) {
      reasons.push(`signature keyid ${keyid.slice(0, 16)}… is not a trusted key`);
      continue;
    }
    const candidates: Array<[string, KeyObject]> = keyid ? [[keyid, trusted.get(keyid) as KeyObject]] : [...trusted.entries()];
    const match = candidates.find(([, key]) => verifies(key, s.sig));
    if (match) {
      signedBy = match[0];
      break;
    }
    reasons.push(`signature${keyid ? ` by ${keyid.slice(0, 16)}…` : " without keyid"} does not verify`);
  }
  if (!signedBy) return fail("no signature verifies against a trusted key");

  let statement: unknown;
  try {
    statement = JSON.parse(payload.toString("utf8"));
  } catch {
    return fail("payload is not JSON");
  }
  if (!isRecord(statement)) return fail("statement is not an object");
  if (statement._type !== STATEMENT_TYPE) return fail(`statement _type is ${JSON.stringify(statement._type)}`);
  if (statement.predicateType !== RUN_RECEIPT_PREDICATE_TYPE) return fail(`predicateType is ${JSON.stringify(statement.predicateType)}`);
  const predicate = statement.predicate;
  const problems = receiptProblems(predicate);
  if (problems.length) return fail(`signed receipt is incomplete: ${problems.join("; ")}`);
  const receipt = predicate as RunReceipt;
  if (!Array.isArray(statement.subject) || statement.subject.length !== 1 || !isRecord(statement.subject[0])) {
    return fail("statement must name exactly one subject");
  }
  const subject = statement.subject[0];
  const digest = isRecord(subject.digest) ? subject.digest.sha256 : undefined;
  if (digest !== receipt.subject.digest.sha256) return fail("statement subject digest does not match the receipt's subject digest");
  if (subject.name !== receipt.subject.name) return fail("statement subject name does not match the receipt's subject name");
  if (receipt.issuer.keyid && receipt.issuer.keyid !== signedBy) {
    return fail(`receipt names issuer keyid ${receipt.issuer.keyid.slice(0, 16)}… but was signed by ${signedBy.slice(0, 16)}…`);
  }

  return { ok: true, reasons, keyid: signedBy, receipt };
}

/** Decode the receipt from an envelope without verifying it. For display only. */
export function peekRunReceipt(envelope: unknown): RunReceipt | null {
  if (!isRecord(envelope) || typeof envelope.payload !== "string") return null;
  try {
    const statement = JSON.parse(Buffer.from(envelope.payload, "base64").toString("utf8"));
    return isRecord(statement) && receiptProblems(statement.predicate).length === 0 ? (statement.predicate as RunReceipt) : null;
  } catch {
    return null;
  }
}

/** Build the totals block from the stages, for issuers that do not track overhead separately. */
export function totalsFromStages(stages: RunReceiptStage[]): RunReceipt["totals"] {
  const totals = { costEur: 0, latencyMs: 0, tokens: { input: 0, output: 0 } };
  for (const s of stages) {
    if (isNonNegative(s.costEur)) totals.costEur += s.costEur;
    if (isNonNegative(s.latencyMs)) totals.latencyMs += s.latencyMs;
    if (isNonNegative(s.inputTokens)) totals.tokens.input += s.inputTokens;
    if (isNonNegative(s.outputTokens)) totals.tokens.output += s.outputTokens;
  }
  totals.costEur = Math.round(totals.costEur * 10000) / 10000;
  return totals;
}

/** A verdict derived from stage statuses: all ok → PASS, all failed → FAIL, otherwise PARTIAL. */
export function verdictFromStages(stages: RunReceiptStage[]): RunReceiptVerdict {
  const ran = stages.filter((s) => s.status !== "skipped");
  if (ran.length === 0) return "FAIL";
  if (ran.every((s) => s.status === "ok")) return "PASS";
  if (ran.every((s) => s.status === "failed")) return "FAIL";
  return "PARTIAL";
}
