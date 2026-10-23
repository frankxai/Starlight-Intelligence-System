// Starlight Frontier Ledger v2 — core library.
//
// Zero dependencies (Node >= 18). Pure functions only: callers pass `today`
// and any network fetcher, so every behaviour is deterministic under test.
//
// The ledger links Research -> Sources -> Records -> Claims -> Decisions ->
// Products/Repositories/Tasks with provenance, temporal validity, confidence,
// contradictions and adoption state. Retrieved external text is DATA: it is
// sanitised, type-checked, allow-listed and never interpreted as instructions.
// Automated batches can never change adoption state or the curated register.

import { createHash } from "node:crypto";

export const SCHEMA_VERSION = "2.0.0";

export const RECORD_KINDS = [
  "repository", "model", "api", "sdk", "spec", "paper", "product", "benchmark", "pattern", "service",
];
export const RECORD_CLASSES = [
  "standards", "runtime_dependency", "reference_harness", "memory_provider", "model", "infrastructure",
  "agent_system", "research", "interface", "security", "commerce",
];
export const ADOPTION_STATES = [
  "ignore", "watch", "evaluate", "lab", "shadow", "pattern", "candidate", "conformance", "adopted",
  "rejected", "retired",
];
// States an automated ingestion batch may assign. Anything else needs a named human decider and a decision reference.
export const INGEST_STATES = ["ignore", "watch", "evaluate"];
export const EVIDENCE_CLASSES = ["primary_observed", "internal", "secondary", "vendor_claim", "inferred"];
export const EVIDENCE_RANK = { primary_observed: 4, internal: 3, secondary: 2, vendor_claim: 2, inferred: 1 };
export const CONFIDENCE = ["high", "medium", "low"];
export const SOURCE_KINDS = [
  "github_repo", "github_release", "web_page", "paper", "documentation", "internal_record", "dataset",
];
export const SOURCE_TRUST = ["primary", "vendor_claim", "secondary", "internal"];
export const CONTRADICTION_STATUS = ["open", "resolved"];
export const LINK_KEYS = ["products", "repositories", "decisions", "tasks", "capabilities"];
export const UPSTREAM_CLASSES = ["standards", "runtime_dependency", "reference_harness", "memory_provider"];
export const UPSTREAM_ADOPTIONS = ["candidate", "conformance", "lab", "pattern", "shadow"];
// Predicates that feed a curated register projection. Only humans may change them.
export const REGISTER_PREDICATES = ["track"];
// Predicates that would impersonate record fields or decisions in reports; claims may not use them.
export const RESERVED_PREDICATES = ["adoption", "state", "registers", "register", "primitive", "security_notes", "owner", "repository", "url", "verified_at", "class", "kind", "decided_by", "decision", "decision_ref", "id"];
// Only claims at least this strong refresh a record's freshness (provenance.last_verified).
const FRESHNESS_EVIDENCE = ["primary_observed", "internal"];

const SOURCE_KEYS = ["id", "kind", "trust", "title", "url", "publisher", "published_at", "retrieved_at", "content_sha256", "license"];
const RECORD_KEYS = ["id", "kind", "class", "title", "url", "owner", "summary", "mechanism", "primitive", "security_notes", "license", "registers", "tags", "adoption", "proposals", "provenance", "links", "claims"];
const CLAIM_KEYS = ["id", "predicate", "value", "evidence_class", "confidence", "source_ids", "valid_from", "valid_until", "superseded_by", "last_verified", "recorded_at"];
const ADOPTION_KEYS = ["state", "decided_at", "decided_by", "rationale", "decision_ref"];
const PROVENANCE_KEYS = ["first_seen", "last_verified", "source_ids", "verified_by"];
const RECORD_TEXT = ["title", "owner", "summary", "mechanism", "primitive", "security_notes", "license"];
const SOURCE_TEXT = ["title", "publisher", "license"];

const ISO_DATE_SHAPE = /^\d{4}-\d{2}-\d{2}$/;
/** Shape plus calendar validity (rejects 2026-02-31). */
export const ISO_DATE = {
  test: (v) => {
    if (typeof v !== "string" || !ISO_DATE_SHAPE.test(v)) return false;
    const d = new Date(`${v}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
  },
};
const ID = /^[a-z0-9][a-z0-9-]*$/;
const CLAIM_ID = /^[a-z0-9][a-z0-9-]*--[a-z][a-z0-9_]*--[0-9a-f]{8}$/;
const PREDICATE = /^[a-z][a-z0-9_]*$/;
const HEX64 = /^[0-9a-f]{64}$/;
const MAX_TEXT = 2000;
// Invisible or control characters: C0/C1 controls, format characters (bidi, zero-width, soft hyphen, BOM),
// line/paragraph separators and Unicode tag characters. Tab, CR and LF are allowed.
const CONTROL_G = /(?![\t\n\r])[\p{Cc}\p{Cf}\u2028\u2029\u{E0000}-\u{E007F}]/gu;
const CONTROL = /(?![\t\n\r])[\p{Cc}\p{Cf}\u2028\u2029\u{E0000}-\u{E007F}]/u;
// Heuristic only: flags text that reads like an instruction to an agent. Never auto-acts.
const INSTRUCTION_LIKE = /\b(ignore|disregard|forget|override)\b.{0,40}\b(previous|prior|above|earlier|preceding|all|any)\b.{0,24}\b(instructions?|prompts?|rules|messages?|guidance|directions?)\b|\byou must now\b|\bsystem prompt\b|\bnew instructions?\s*:|\brun the following (command|code)\b|\bexfiltrat/;
const RESERVED_GITHUB_OWNERS = new Set(["orgs", "settings", "topics", "marketplace", "apps", "features", "sponsors", "collections", "explore", "notifications", "login", "about", "pricing", "enterprise", "search"]);

// ---------------------------------------------------------------- utilities

export function sha256(text) {
  return createHash("sha256").update(String(text)).digest("hex");
}

export function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function deepEqual(a, b) {
  return stableStringify(a) === stableStringify(b);
}

/** Exact on-disk serialisation used for every generated JSON file. */
export function serialize(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

/** Canonical URL used for de-duplication. Returns null for non-http(s) URLs or URLs carrying credentials. */
export function canonicalUrl(raw) {
  let url;
  try {
    url = new URL(String(raw).trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username || url.password) return null;
  url.protocol = "https:";
  url.hash = "";
  url.port = "";
  url.hostname = url.hostname.toLowerCase().replace(/\.$/, "").replace(/^www\./, "");
  for (const key of [...url.searchParams.keys()]) {
    if (/^utm_/i.test(key) || ["ref_src", "fbclid", "gclid", "mc_cid", "mc_eid"].includes(key.toLowerCase())) url.searchParams.delete(key);
  }
  url.searchParams.sort();
  let path = url.pathname.replace(/%7e/gi, "~").replace(/\/{2,}/g, "/").replace(/\/+$/, "");
  if (url.hostname === "github.com") {
    const parts = path.split("/");
    // owner/repo are case-insensitive on GitHub; deeper paths are not. ".git" is stripped only at repo root.
    for (let i = 1; i <= 2 && i < parts.length; i++) parts[i] = parts[i].toLowerCase();
    if (parts.length === 3) parts[2] = parts[2].replace(/\.git$/, "");
    path = parts.join("/");
  }
  url.pathname = path || "/";
  const out = url.toString();
  return url.pathname === "/" && !url.search && out.endsWith("/") ? out.slice(0, -1) : out;
}

/** {owner, repo} only for a GitHub repository root URL; deep links and non-repository paths return null. */
export function githubSlug(raw) {
  const canon = canonicalUrl(raw);
  if (!canon) return null;
  const m = /^https:\/\/github\.com\/([^/?#]+)\/([^/?#]+)$/.exec(canon);
  if (!m || RESERVED_GITHUB_OWNERS.has(m[1])) return null;
  return { owner: m[1], repo: m[2] };
}

export function slugify(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64) || "item";
}

export function claimId(recordId, predicate, value, validFrom) {
  return `${recordId}--${predicate}--${sha256(`${predicate}\u0000${value}\u0000${validFrom}`).slice(0, 8)}`;
}

function daysBetween(fromIso, toIso) {
  return Math.floor((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86_400_000);
}

/** Strip invisible/control characters and cap length. External text never keeps a hidden channel. */
export function cleanText(value, max = MAX_TEXT) {
  if (value === undefined || value === null) return value;
  return String(value).normalize("NFC").replace(CONTROL_G, "").trim().slice(0, max);
}

/** True when text reads like an instruction to an agent, after removing invisible characters and folding case. */
export function looksLikeInstruction(text) {
  if (typeof text !== "string") return false;
  return INSTRUCTION_LIKE.test(text.normalize("NFKC").replace(CONTROL_G, "").replace(/\s+/g, " ").toLowerCase());
}

function isCurrent(claim) {
  return claim.valid_until === null && claim.superseded_by === null;
}

function isHumanDecider(ledger, decidedBy) {
  const who = String(decidedBy ?? "").trim().toLowerCase();
  if (!who || /^(ingest|agent|bot|watch)[:\-]/.test(who)) return false;
  return (ledger.policy?.human_deciders ?? []).some((h) => String(h).trim().toLowerCase() === who);
}

// --------------------------------------------------------------- validation

/**
 * Validate a v2 ledger. Returns { errors, warnings, stale }.
 * `today` (YYYY-MM-DD) drives staleness; omit to skip staleness checks.
 */
export function validateLedger(ledger, { today } = {}) {
  const errors = [];
  const warnings = [];
  const stale = [];
  const err = (m) => errors.push(m);
  const warn = (m) => warnings.push(m);

  if (!ledger || typeof ledger !== "object") return { errors: ["ledger must be an object"], warnings, stale };
  if (ledger.schema_version !== SCHEMA_VERSION) err(`schema_version must be ${SCHEMA_VERSION}`);
  for (const f of ["ledger_id", "owner"]) if (typeof ledger[f] !== "string" || !ledger[f].trim()) err(`${f} must be a non-empty string`);
  if (!ISO_DATE.test(ledger.updated_at ?? "")) err("updated_at must be an ISO date");
  if (!ledger.policy || typeof ledger.policy !== "object") err("policy must be an object");
  else if (!Array.isArray(ledger.policy.human_deciders) || ledger.policy.human_deciders.length === 0) err("policy.human_deciders must list at least one named human or board decider");
  for (const arr of ["sources", "records", "contradictions", "batches"]) {
    if (!Array.isArray(ledger[arr])) err(`${arr} must be an array`);
  }
  if (errors.length) return { errors, warnings, stale };

  const scanText = (label, value) => {
    if (value === undefined || value === null) return;
    if (typeof value !== "string") return err(`${label}: must be a string or null`);
    if (value.length > MAX_TEXT) err(`${label}: text exceeds ${MAX_TEXT} characters`);
    if (CONTROL.test(value)) err(`${label}: contains control, invisible or tag characters`);
    if (looksLikeInstruction(value)) warn(`${label}: instruction-like text stored as data; review provenance`);
  };
  const onlyKeys = (label, obj, allowed) => {
    for (const k of Object.keys(obj ?? {})) if (!allowed.includes(k)) err(`${label}: unknown field ${k}`);
  };
  const httpsUrl = (label, raw) => {
    if (typeof raw !== "string" || !raw.startsWith("https://")) { err(`${label}: url must use https`); return null; }
    const canon = canonicalUrl(raw);
    if (!canon) err(`${label}: url must be a valid https URL without credentials`);
    return canon;
  };

  // Sources
  const sourceIds = new Set();
  const sourceCanon = new Map();
  for (const [i, s] of ledger.sources.entries()) {
    const label = `source ${s?.id ?? i}`;
    onlyKeys(label, s, SOURCE_KEYS);
    if (!ID.test(s?.id ?? "")) err(`${label}: id must match ${ID}`);
    if (sourceIds.has(s.id)) err(`${label}: duplicate id`);
    sourceIds.add(s.id);
    if (!SOURCE_KINDS.includes(s.kind)) err(`${label}: unsupported kind ${s.kind}`);
    if (!SOURCE_TRUST.includes(s.trust)) err(`${label}: unsupported trust ${s.trust}`);
    if (!ISO_DATE.test(s.retrieved_at ?? "")) err(`${label}: retrieved_at must be an ISO date`);
    if (s.published_at != null && !ISO_DATE.test(s.published_at)) err(`${label}: published_at must be an ISO date or null`);
    if (s.content_sha256 != null && !HEX64.test(s.content_sha256)) err(`${label}: content_sha256 must be 64 hex chars`);
    const canon = httpsUrl(label, s.url);
    if (canon && sourceCanon.has(canon)) err(`${label}: duplicate canonical url with ${sourceCanon.get(canon)}`);
    else if (canon) sourceCanon.set(canon, s.id);
    for (const f of SOURCE_TEXT) scanText(`${label}.${f}`, s[f]);
  }

  // Records and claims
  const recordIds = new Set();
  const recordCanon = new Map();
  const claimIndex = new Map();
  const staleDays = ledger.policy.staleness_days ?? {};
  for (const [i, r] of ledger.records.entries()) {
    const label = `record ${r?.id ?? i}`;
    onlyKeys(label, r, RECORD_KEYS);
    if (!ID.test(r?.id ?? "")) err(`${label}: id must match ${ID}`);
    if (recordIds.has(r.id)) err(`${label}: duplicate id`);
    recordIds.add(r.id);
    if (!RECORD_KINDS.includes(r.kind)) err(`${label}: unsupported kind ${r.kind}`);
    if (!RECORD_CLASSES.includes(r.class)) err(`${label}: unsupported class ${r.class}`);
    for (const f of ["title", "owner"]) if (typeof r[f] !== "string" || !r[f].trim()) err(`${label}: ${f} must be a non-empty string`);
    const canon = httpsUrl(label, r.url);
    if (canon && recordCanon.has(canon)) err(`${label}: duplicate canonical url with ${recordCanon.get(canon)}`);
    else if (canon) recordCanon.set(canon, r.id);
    for (const f of RECORD_TEXT) scanText(`${label}.${f}`, r[f]);
    for (const f of ["registers", "tags"]) if (r[f] !== undefined && (!Array.isArray(r[f]) || r[f].some((v) => typeof v !== "string"))) err(`${label}: ${f} must be an array of strings`);

    const a = r.adoption ?? {};
    onlyKeys(`${label}.adoption`, a, ADOPTION_KEYS);
    if (!ADOPTION_STATES.includes(a.state)) err(`${label}: unsupported adoption state ${a.state}`);
    if (!ISO_DATE.test(a.decided_at ?? "")) err(`${label}: adoption.decided_at must be an ISO date`);
    if (typeof a.decided_by !== "string" || !a.decided_by.trim()) err(`${label}: adoption.decided_by required`);
    if (typeof a.rationale !== "string" || !a.rationale.trim()) err(`${label}: adoption.rationale required`);
    scanText(`${label}.adoption.rationale`, a.rationale);
    if (!INGEST_STATES.includes(a.state)) {
      if (!isHumanDecider(ledger, a.decided_by)) err(`${label}: adoption state ${a.state} requires a decider listed in policy.human_deciders (got ${JSON.stringify(a.decided_by)})`);
      if (typeof a.decision_ref !== "string" || !a.decision_ref.trim()) err(`${label}: adoption state ${a.state} requires adoption.decision_ref`);
    }
    if (r.class === "reference_harness" && !["lab", "watch", "ignore", "rejected", "retired"].includes(a.state)) {
      err(`${label}: reference harnesses must remain lab-only`);
    }
    if (r.class === "memory_provider" && !["shadow", "pattern", "watch", "ignore", "rejected", "retired"].includes(a.state)) {
      err(`${label}: memory providers must remain shadow or pattern-only`);
    }
    for (const [j, p] of (r.proposals ?? []).entries()) {
      if (!ADOPTION_STATES.includes(p.proposed_state)) err(`${label}: proposal ${j} has unsupported state`);
      if (!ISO_DATE.test(p.at ?? "")) err(`${label}: proposal ${j} needs ISO date`);
      scanText(`${label}.proposals[${j}].rationale`, p.rationale);
    }

    const prov = r.provenance ?? {};
    onlyKeys(`${label}.provenance`, prov, PROVENANCE_KEYS);
    if (!ISO_DATE.test(prov.first_seen ?? "")) err(`${label}: provenance.first_seen must be an ISO date`);
    if (!ISO_DATE.test(prov.last_verified ?? "")) err(`${label}: provenance.last_verified must be an ISO date`);
    if (!Array.isArray(prov.source_ids) || prov.source_ids.length === 0) err(`${label}: provenance.source_ids must be non-empty`);
    for (const sid of prov.source_ids ?? []) if (!sourceIds.has(sid)) err(`${label}: unknown source ${sid}`);

    const links = r.links ?? {};
    for (const k of Object.keys(links)) {
      if (!LINK_KEYS.includes(k)) err(`${label}: unsupported link key ${k}`);
      else if (!Array.isArray(links[k]) || links[k].some((v) => typeof v !== "string")) err(`${label}: links.${k} must be an array of strings`);
      else links[k].forEach((v, j) => scanText(`${label}.links.${k}[${j}]`, v));
    }

    if ((r.registers ?? []).includes("upstreams")) {
      if (!UPSTREAM_CLASSES.includes(r.class)) err(`${label}: upstream register requires class in ${UPSTREAM_CLASSES.join("/")}`);
      if (!UPSTREAM_ADOPTIONS.includes(a.state)) err(`${label}: upstream register requires adoption in ${UPSTREAM_ADOPTIONS.join("/")}`);
      if (!githubSlug(r.url)) err(`${label}: upstream register requires a github.com repository root url`);
      for (const f of ["primitive", "security_notes"]) if (typeof r[f] !== "string" || !r[f].trim()) err(`${label}: upstream register requires ${f}`);
      const tracks = (r.claims ?? []).filter((c) => c.predicate === "track" && isCurrent(c));
      if (tracks.length !== 1) err(`${label}: upstream register requires exactly one current track claim`);
    }

    for (const [j, c] of (r.claims ?? []).entries()) {
      const cl = `${label} claim ${c?.id ?? j}`;
      onlyKeys(cl, c, CLAIM_KEYS);
      if (!CLAIM_ID.test(c?.id ?? "")) err(`${cl}: id must match <record>--<predicate>--<hash8>`);
      else if (!c.id.startsWith(`${r.id}--${c.predicate}--`)) err(`${cl}: id must be prefixed by record and predicate`);
      if (claimIndex.has(c.id)) err(`${cl}: duplicate claim id`);
      claimIndex.set(c.id, { record: r.id, claim: c });
      if (!PREDICATE.test(c.predicate ?? "")) err(`${cl}: predicate must match ${PREDICATE}`);
      if (typeof c.value !== "string" || !c.value.trim()) err(`${cl}: value must be a non-empty string`);
      scanText(`${cl}.value`, c.value);
      if (!EVIDENCE_CLASSES.includes(c.evidence_class)) err(`${cl}: unsupported evidence_class ${c.evidence_class}`);
      if (!CONFIDENCE.includes(c.confidence)) err(`${cl}: unsupported confidence ${c.confidence}`);
      if (!Array.isArray(c.source_ids) || c.source_ids.length === 0) err(`${cl}: source_ids must be non-empty`);
      for (const sid of c.source_ids ?? []) if (!sourceIds.has(sid)) err(`${cl}: unknown source ${sid}`);
      if (!ISO_DATE.test(c.valid_from ?? "")) err(`${cl}: valid_from must be an ISO date`);
      else if (c.valid_from > ledger.updated_at) err(`${cl}: valid_from ${c.valid_from} is after ledger updated_at ${ledger.updated_at}`);
      if (!ISO_DATE.test(c.last_verified ?? "")) err(`${cl}: last_verified must be an ISO date`);
      if (!ISO_DATE.test(c.recorded_at ?? "")) err(`${cl}: recorded_at must be an ISO date`);
      if (c.valid_until !== null && !ISO_DATE.test(c.valid_until ?? "")) err(`${cl}: valid_until must be null or an ISO date`);
      if (c.valid_until && c.valid_until < c.valid_from) err(`${cl}: valid_until precedes valid_from`);
      if (c.superseded_by !== null && typeof c.superseded_by !== "string") err(`${cl}: superseded_by must be null or a claim id`);
    }

    if (today && ISO_DATE.test(prov.last_verified ?? "")) {
      const limit = staleDays[r.class] ?? staleDays.default ?? 60;
      const age = daysBetween(prov.last_verified, today);
      if (age > limit) stale.push({ id: r.id, class: r.class, last_verified: prov.last_verified, age_days: age, limit_days: limit });
    }
  }

  // Contradictions, supersession references and current-claim uniqueness
  const contradictionClaims = new Set();
  const contradictionIds = new Set();
  for (const [i, k] of ledger.contradictions.entries()) {
    const label = `contradiction ${k?.id ?? i}`;
    if (!ID.test(k?.id ?? "")) err(`${label}: id must match ${ID}`);
    if (contradictionIds.has(k.id)) err(`${label}: duplicate id`);
    contradictionIds.add(k.id);
    if (!CONTRADICTION_STATUS.includes(k.status)) err(`${label}: unsupported status ${k.status}`);
    const ids = k.claim_ids ?? [];
    if (!Array.isArray(ids) || new Set(ids).size < 2) err(`${label}: claim_ids needs at least two distinct claims`);
    if (new Set(ids).size !== ids.length) err(`${label}: claim_ids contains duplicates`);
    for (const cid of ids) if (!claimIndex.has(cid)) err(`${label}: unknown claim ${cid}`);
    if (!ISO_DATE.test(k.detected_at ?? "")) err(`${label}: detected_at must be an ISO date`);
    if (k.status === "resolved" && !(typeof k.resolution === "string" && k.resolution.trim())) err(`${label}: resolved contradictions need a resolution`);
    scanText(`${label}.description`, k.description);
    if (k.status === "open") for (const cid of ids) contradictionClaims.add(cid);
  }

  const currentByKey = new Map();
  for (const [cid, { record, claim }] of claimIndex) {
    if (claim.superseded_by !== null && claim.superseded_by !== undefined && !claimIndex.has(claim.superseded_by)) {
      err(`claim ${cid}: superseded_by references unknown claim ${claim.superseded_by}`);
    }
    if (isCurrent(claim)) {
      const key = `${record}\u0000${claim.predicate}`;
      if (!currentByKey.has(key)) currentByKey.set(key, []);
      currentByKey.get(key).push(cid);
    }
  }
  for (const [key, ids] of currentByKey) {
    if (ids.length > 1 && !ids.every((id) => contradictionClaims.has(id))) {
      const [rec, pred] = key.split("\u0000");
      err(`record ${rec}: ${ids.length} current claims for ${pred} without an open contradiction`);
    }
  }

  for (const [i, b] of ledger.batches.entries()) {
    if (!ID.test(b?.id ?? "")) err(`batch ${i}: id must match ${ID}`);
    if (!ISO_DATE.test(b?.ingested_at ?? "")) err(`batch ${b?.id ?? i}: ingested_at must be an ISO date`);
  }

  return { errors, warnings, stale };
}

// --------------------------------------------------------------- projection

/** Project the curated adoption register (v1 upstreams.json) from the ledger. */
export function projectUpstreams(ledger) {
  const reg = ledger.registers?.upstreams;
  if (!reg) throw new Error("ledger.registers.upstreams is not configured");
  const upstreams = ledger.records
    .filter((r) => (r.registers ?? []).includes("upstreams"))
    .map((r) => {
      const track = r.claims.find((c) => c.predicate === "track" && isCurrent(c));
      return {
        id: r.id,
        class: r.class,
        repository: r.url,
        track: track.value,
        verified_at: track.last_verified,
        adoption: r.adoption.state,
        owner: r.owner,
        primitive: r.primitive,
        security_notes: r.security_notes,
      };
    });
  return {
    $schema: reg.schema,
    schema_version: reg.schema_version,
    audit_cutoff: reg.audit_cutoff,
    owner: reg.owner,
    policy: clone(reg.policy),
    upstreams,
  };
}

/** Build the initial v2 ledger from a v1 upstream register, losslessly. */
export function migrateV1(v1, { today, researchDoc }) {
  const sources = [];
  const records = [];
  const addSource = (s) => {
    const canon = canonicalUrl(s.url);
    const existing = sources.find((x) => canonicalUrl(x.url) === canon);
    if (existing) return existing.id;
    sources.push(s);
    return s.id;
  };
  const docId = researchDoc
    ? addSource({
        id: "sis-research-2026-08-12-harness-memory",
        kind: "internal_record",
        trust: "internal",
        title: "Agent Harness and Memory Frontier (research cutoff 2026-08-12)",
        url: researchDoc,
        publisher: "Starlight-Intelligence-System",
        published_at: v1.audit_cutoff,
        retrieved_at: today,
        content_sha256: null,
      })
    : null;
  for (const u of v1.upstreams) {
    const srcId = addSource({
      id: `gh-${slugify(u.repository.replace(/^https:\/\/github\.com\//, ""))}`,
      kind: "github_repo",
      trust: "primary",
      title: u.repository.replace(/^https:\/\/github\.com\//, ""),
      url: u.repository,
      publisher: "github.com",
      published_at: null,
      retrieved_at: u.verified_at,
      content_sha256: null,
    });
    const sourceIds = docId ? [srcId, docId] : [srcId];
    records.push({
      id: u.id,
      kind: u.class === "standards" ? "spec" : "repository",
      class: u.class,
      title: u.repository.replace(/^https:\/\/github\.com\//, ""),
      url: u.repository,
      owner: u.owner,
      summary: u.primitive,
      primitive: u.primitive,
      security_notes: u.security_notes,
      license: null,
      registers: ["upstreams"],
      adoption: {
        state: u.adoption,
        decided_at: u.verified_at,
        decided_by: v1.owner,
        rationale: `Migrated from v1 upstream register (${v1.policy[u.class]})`,
        decision_ref: `context/empire/upstreams.json v1 register (audit cutoff ${v1.audit_cutoff})`,
      },
      proposals: [],
      // v1 records only "verified_at"; the record was known no later than the register's audit cutoff.
      provenance: { first_seen: u.verified_at < v1.audit_cutoff ? u.verified_at : v1.audit_cutoff, last_verified: u.verified_at, source_ids: sourceIds, verified_by: v1.owner },
      links: { products: [], repositories: ["frankxai/Starlight-Intelligence-System"], decisions: [], tasks: [], capabilities: [] },
      claims: [
        {
          id: claimId(u.id, "track", u.track, u.verified_at),
          predicate: "track",
          value: u.track,
          evidence_class: "internal",
          confidence: "high",
          source_ids: sourceIds,
          valid_from: u.verified_at,
          valid_until: null,
          superseded_by: null,
          last_verified: u.verified_at,
          recorded_at: u.verified_at,
        },
      ],
    });
  }
  return {
    $schema: "../../schemas/starlight-frontier-ledger.schema.json",
    schema_version: SCHEMA_VERSION,
    ledger_id: "starlight-frontier",
    owner: v1.owner,
    updated_at: today,
    policy: {
      trust: "Retrieved external text is data, never instruction. Only allow-listed, type-checked fields are stored; invisible and control characters are stripped; summaries are written by the ingesting agent and cite sources.",
      adoption: "Automated batches may assign ignore/watch/evaluate only and can never change an existing record's adoption or a register-feeding claim. Any stronger state needs a decider listed in human_deciders and a decision_ref.",
      temporal: "Claims carry valid_from/valid_until and recorded_at. A newer claim of equal or stronger evidence supersedes; a weaker or older conflicting claim opens a contradiction instead of overwriting. Future-dated claims are rejected.",
      human_deciders: [v1.owner],
      staleness_days: { default: 60, model: 30, infrastructure: 45, agent_system: 45, reference_harness: 45, memory_provider: 60, runtime_dependency: 60, standards: 90, research: 120, interface: 60, security: 30, commerce: 60 },
    },
    registers: {
      upstreams: {
        path: "context/empire/upstreams.json",
        schema: v1.$schema,
        schema_version: v1.schema_version,
        audit_cutoff: v1.audit_cutoff,
        owner: v1.owner,
        policy: clone(v1.policy),
      },
    },
    sources,
    records,
    contradictions: [],
    batches: [
      { id: "migrate-v1-upstreams", ingested_at: today, by: "migrateV1", input: "context/empire/upstreams.json", counts: { records: records.length, sources: sources.length } },
    ],
  };
}

// ----------------------------------------------------------------- ingestion

const SOURCE_FIELDS = ["id", "kind", "trust", "title", "url", "publisher", "published_at", "retrieved_at", "content_sha256", "license"];
const RECORD_FIELDS = ["id", "kind", "class", "title", "url", "owner", "summary", "mechanism", "license", "links", "adoption_proposal", "rationale", "source_ids", "tags"];
const CLAIM_FIELDS = ["record_id", "predicate", "value", "evidence_class", "confidence", "source_ids", "valid_from"];
const ARRAY_FIELDS = new Set(["source_ids", "tags"]);

/** Allow-list and type-check candidate fields. Non-string scalars, nested objects and unknown keys are dropped. */
function pick(obj, fields) {
  const out = {};
  for (const f of fields) {
    const v = obj[f];
    if (v === undefined || v === null) continue;
    if (ARRAY_FIELDS.has(f)) {
      if (Array.isArray(v)) out[f] = v.filter((x) => typeof x === "string").map((x) => cleanText(x, 200)).filter(Boolean);
    } else if (f === "links") {
      if (v && typeof v === "object" && !Array.isArray(v)) {
        out.links = {};
        for (const k of LINK_KEYS) if (Array.isArray(v[k])) out.links[k] = v[k].filter((x) => typeof x === "string").map((x) => cleanText(x, 200)).filter(Boolean);
      }
    } else if (typeof v === "string") {
      out[f] = cleanText(v);
    }
  }
  return out;
}

/** Throws if `after` changed any pre-existing record's adoption/identity or the curated register projection. */
export function assertIngestInvariants(before, after) {
  const snapAfter = snapshotProtected(after);
  for (const [id, snap] of snapshotProtected(before)) {
    if (snapAfter.get(id) !== snap) throw new Error(`ingest invariant violated: existing record ${id} adoption or identity changed`);
  }
  if (before.registers?.upstreams && stableStringify(projectUpstreams(after)) !== stableStringify(projectUpstreams(before))) {
    throw new Error("ingest invariant violated: the curated upstream register projection would change");
  }
}

function snapshotProtected(ledger) {
  return new Map(ledger.records.map((r) => [r.id, stableStringify({ adoption: r.adoption, registers: r.registers ?? [], url: r.url, owner: r.owner, primitive: r.primitive ?? null, security_notes: r.security_notes ?? null, class: r.class })]));
}

/**
 * Merge a batch of candidate items into the ledger.
 * Candidate shapes: {type:"source",...} | {type:"record",...} | {type:"claim",...}.
 * Returns { ledger, changes, rejected } and never mutates the input ledger.
 * Re-ingesting the same batch is idempotent. Throws if a merge would alter any existing
 * record's adoption/identity or the curated register projection (defence in depth).
 */
export function ingest(ledgerIn, candidates, { batchId, today, by = `ingest:${batchId}` }) {
  if (!ID.test(batchId ?? "")) throw new Error("batchId must match id pattern");
  if (!ISO_DATE.test(today ?? "")) throw new Error("today must be an ISO date");
  const ledger = clone(ledgerIn);
  const prior = ledgerIn.batches.find((b) => b.id === batchId);
  if (prior && prior.by !== by) throw new Error(`batch id ${batchId} already belongs to ${prior.by}; use a new batch id`);
  const changes = [];
  const rejected = [];
  const sourceAlias = new Map();
  const sourceByCanon = new Map(ledger.sources.map((s) => [canonicalUrl(s.url), s]));
  const recordById = new Map(ledger.records.map((r) => [r.id, r]));
  const recordByCanon = new Map(ledger.records.map((r) => [canonicalUrl(r.url), r]));
  const resolveSources = (ids) => [...new Set((ids ?? []).map((id) => sourceAlias.get(id) ?? id))];
  const knownSource = (id) => ledger.sources.some((s) => s.id === id);

  for (const c of candidates) if (!["source", "record", "claim"].includes(c?.type)) rejected.push({ item: c, reason: "unknown candidate type" });
  // Claims are merged oldest-first so history ingested newest-first still supersedes in order.
  const claims = candidates.filter((c) => c?.type === "claim")
    .map((c, i) => ({ c, i }))
    .sort((a, b) => String(a.c.valid_from ?? today).localeCompare(String(b.c.valid_from ?? today)) || a.i - b.i)
    .map(({ c }) => c);
  const ordered = [...candidates.filter((c) => c?.type === "source"), ...candidates.filter((c) => c?.type === "record"), ...claims];

  for (const raw of ordered) {
    if (raw.type === "source") {
      const s = pick(raw, SOURCE_FIELDS);
      const canon = typeof s.url === "string" && s.url.startsWith("https://") ? canonicalUrl(s.url) : null;
      if (!canon) { rejected.push({ item: raw, reason: "source url must be https without credentials" }); continue; }
      if (!SOURCE_KINDS.includes(s.kind) || !SOURCE_TRUST.includes(s.trust)) { rejected.push({ item: raw, reason: "source kind/trust not allowed" }); continue; }
      const existing = sourceByCanon.get(canon);
      const idOwner = s.id ? ledger.sources.find((x) => x.id === s.id) : undefined;
      if (idOwner && canonicalUrl(idOwner.url) !== canon) { rejected.push({ item: raw, reason: `source id ${s.id} already belongs to a different url` }); continue; }
      if (existing) {
        if (s.id) sourceAlias.set(s.id, existing.id);
        if (s.content_sha256 && HEX64.test(s.content_sha256) && s.content_sha256 !== existing.content_sha256) {
          existing.content_sha256 = s.content_sha256;
          existing.retrieved_at = today;
          changes.push({ type: "source_updated", id: existing.id });
        }
        continue;
      }
      const id = ID.test(s.id ?? "") ? s.id : `src-${sha256(canon).slice(0, 12)}`;
      if (s.id) sourceAlias.set(s.id, id);
      const source = {
        id, kind: s.kind, trust: s.trust, title: s.title ?? canon, url: s.url, publisher: s.publisher ?? new URL(canon).hostname,
        published_at: ISO_DATE.test(s.published_at ?? "") ? s.published_at : null, retrieved_at: ISO_DATE.test(s.retrieved_at ?? "") && s.retrieved_at <= today ? s.retrieved_at : today,
        content_sha256: HEX64.test(s.content_sha256 ?? "") ? s.content_sha256 : null,
      };
      if (s.license) source.license = s.license;
      ledger.sources.push(source);
      sourceByCanon.set(canon, source);
      changes.push({ type: "source_added", id });
    } else if (raw.type === "record") {
      const r = pick(raw, RECORD_FIELDS);
      const canon = typeof r.url === "string" && r.url.startsWith("https://") ? canonicalUrl(r.url) : null;
      if (!canon) { rejected.push({ item: raw, reason: "record url must be https without credentials" }); continue; }
      if (!RECORD_KINDS.includes(r.kind) || !RECORD_CLASSES.includes(r.class)) { rejected.push({ item: raw, reason: "record kind/class not allowed" }); continue; }
      const sourceIds = resolveSources(r.source_ids).filter(knownSource);
      if (sourceIds.length === 0) { rejected.push({ item: raw, reason: "record needs at least one known source" }); continue; }
      const existing = recordByCanon.get(canon);
      if (!existing && r.id && recordById.has(r.id)) { rejected.push({ item: raw, reason: `record id ${r.id} already belongs to a different url` }); continue; }
      const explicit = ADOPTION_STATES.includes(r.adoption_proposal) ? r.adoption_proposal : null;
      if (existing) {
        let touched = false;
        for (const sid of sourceIds) if (!existing.provenance.source_ids.includes(sid)) { existing.provenance.source_ids.push(sid); touched = true; }
        for (const k of LINK_KEYS) {
          for (const v of r.links?.[k] ?? []) {
            existing.links[k] = existing.links[k] ?? [];
            if (!existing.links[k].includes(v)) { existing.links[k].push(v); touched = true; }
          }
        }
        // Proposals are recorded only when explicitly requested, and never duplicated while pending.
        const pending = (existing.proposals ?? []).some((p) => p.proposed_state === explicit);
        if (explicit && explicit !== existing.adoption.state && !pending) {
          existing.proposals = existing.proposals ?? [];
          existing.proposals.push({ proposed_state: explicit, by, at: today, rationale: r.rationale ?? "No rationale supplied" });
          changes.push({ type: "adoption_proposed", id: existing.id, from: existing.adoption.state, to: explicit });
          touched = true;
        }
        // Linking or proposing is not verification: freshness is unchanged.
        if (touched) changes.push({ type: "record_updated", id: existing.id });
        continue;
      }
      let id = ID.test(r.id ?? "") ? r.id : slugify(r.title ?? canon);
      while (recordById.has(id)) id = `${id}-${sha256(canon).slice(0, 4)}`;
      const proposal = explicit ?? "watch";
      let state = INGEST_STATES.includes(proposal) ? proposal : "watch";
      // Policy-constrained classes cannot enter "evaluate" automatically; keep the proposal for a human.
      if (state === "evaluate" && ["reference_harness", "memory_provider"].includes(r.class)) state = "watch";
      const record = {
        id, kind: r.kind, class: r.class, title: r.title ?? id, url: r.url, owner: r.owner ?? "starlight-frontier-research",
        summary: r.summary ?? "", mechanism: r.mechanism ?? "", license: r.license ?? null, registers: [],
        adoption: { state, decided_at: today, decided_by: by, rationale: r.rationale ?? "Ingested for tracking; no adoption decision made" },
        proposals: state === proposal ? [] : [{ proposed_state: proposal, by, at: today, rationale: r.rationale ?? "No rationale supplied" }],
        provenance: { first_seen: today, last_verified: today, source_ids: sourceIds, verified_by: by },
        links: Object.fromEntries(LINK_KEYS.map((k) => [k, r.links?.[k] ?? []])),
        claims: [],
      };
      if (r.tags?.length) record.tags = r.tags.map((t) => cleanText(t, 60)).slice(0, 12);
      ledger.records.push(record);
      recordById.set(id, record);
      recordByCanon.set(canon, record);
      changes.push({ type: "record_added", id, state });
      if (state !== proposal) changes.push({ type: "adoption_proposed", id, from: state, to: proposal });
    } else {
      const c = pick(raw, CLAIM_FIELDS);
      const record = recordById.get(c.record_id);
      if (!record) { rejected.push({ item: raw, reason: `unknown record ${c.record_id}` }); continue; }
      if (!PREDICATE.test(c.predicate ?? "") || typeof c.value !== "string" || !c.value) { rejected.push({ item: raw, reason: "invalid predicate or value" }); continue; }
      if (RESERVED_PREDICATES.includes(c.predicate)) { rejected.push({ item: raw, reason: `predicate ${c.predicate} is reserved` }); continue; }
      if ((record.registers ?? []).length && REGISTER_PREDICATES.includes(c.predicate)) {
        rejected.push({ item: raw, reason: `${c.predicate} feeds a curated register; only a human decision may change it` });
        continue;
      }
      if (!EVIDENCE_CLASSES.includes(c.evidence_class) || !CONFIDENCE.includes(c.confidence)) { rejected.push({ item: raw, reason: "invalid evidence_class or confidence" }); continue; }
      const sourceIds = resolveSources(c.source_ids).filter(knownSource);
      if (sourceIds.length === 0) { rejected.push({ item: raw, reason: "claim needs at least one known source" }); continue; }
      const validFrom = ISO_DATE.test(c.valid_from ?? "") ? c.valid_from : today;
      if (validFrom > today) { rejected.push({ item: raw, reason: `valid_from ${validFrom} is in the future` }); continue; }
      const current = record.claims.filter((x) => x.predicate === c.predicate && isCurrent(x));
      const same = current.find((x) => x.value === c.value);
      if (same) {
        const strong = FRESHNESS_EVIDENCE.includes(c.evidence_class);
        let touched = false;
        if (strong && same.last_verified !== today) { same.last_verified = today; touched = true; }
        for (const sid of sourceIds) if (!same.source_ids.includes(sid)) { same.source_ids.push(sid); touched = true; }
        if (strong) record.provenance.last_verified = today;
        if (touched) changes.push({ type: "claim_reconfirmed", id: same.id });
        continue;
      }
      const id = claimId(record.id, c.predicate, c.value, validFrom);
      if (record.claims.some((x) => x.id === id)) continue; // historical duplicate; idempotent
      const claim = {
        id, predicate: c.predicate, value: c.value, evidence_class: c.evidence_class, confidence: c.confidence,
        source_ids: sourceIds, valid_from: validFrom, valid_until: null, superseded_by: null, last_verified: today, recorded_at: today,
      };
      const conflicts = [];
      for (const old of current) {
        const stronger = EVIDENCE_RANK[claim.evidence_class] >= EVIDENCE_RANK[old.evidence_class];
        if (validFrom >= old.valid_from && stronger) {
          old.valid_until = validFrom;
          old.superseded_by = id;
          changes.push({ type: "claim_superseded", id: old.id, by: id });
        } else {
          conflicts.push(old.id);
        }
      }
      record.claims.push(claim);
      if (FRESHNESS_EVIDENCE.includes(claim.evidence_class)) record.provenance.last_verified = today;
      changes.push({ type: "claim_added", id });
      if (conflicts.length) {
        const kid = `k-${sha256([id, ...conflicts].sort().join("|")).slice(0, 10)}`;
        if (!ledger.contradictions.some((k) => k.id === kid)) {
          ledger.contradictions.push({
            id: kid, status: "open", claim_ids: [...new Set([...conflicts, id])], detected_at: today,
            description: `Conflicting current values for ${record.id}.${c.predicate}`, resolution: null,
          });
          changes.push({ type: "contradiction_opened", id: kid });
        }
      }
    }
  }

  // Close contradictions whose claims are no longer in conflict (at most one still current).
  const claimById = new Map(ledger.records.flatMap((r) => r.claims.map((c) => [c.id, c])));
  for (const k of ledger.contradictions) {
    if (k.status !== "open") continue;
    const live = k.claim_ids.filter((id) => claimById.get(id) && isCurrent(claimById.get(id)));
    if (live.length < 2) {
      k.status = "resolved";
      k.resolution = `Auto-resolved on ${today}: ${live.length ? `only ${live[0]} remains current` : "all claims superseded"}`;
      changes.push({ type: "contradiction_resolved", id: k.id });
    }
  }

  // Defence in depth: automated ingestion must not alter existing adoption/identity or the curated register.
  assertIngestInvariants(ledgerIn, ledger);

  if (changes.length) {
    ledger.updated_at = today > ledger.updated_at ? today : ledger.updated_at;
    const counts = changes.reduce((acc, ch) => ({ ...acc, [ch.type]: (acc[ch.type] ?? 0) + 1 }), {});
    const existingBatch = ledger.batches.find((b) => b.id === batchId);
    if (existingBatch) {
      existingBatch.last_ingested_at = today;
      existingBatch.counts = Object.fromEntries([...new Set([...Object.keys(existingBatch.counts ?? {}), ...Object.keys(counts)])].map((k) => [k, (existingBatch.counts?.[k] ?? 0) + (counts[k] ?? 0)]));
    } else ledger.batches.push({ id: batchId, ingested_at: today, by, input: `batch:${batchId}`, counts });
  }
  return { ledger, changes, rejected };
}

// ------------------------------------------------------------ change watch

/**
 * Turn observed upstream release metadata into ingestion candidates.
 * `observe` is an async (owner, repo) => {tag, tag_source, published_at, html_url, archived, license} | null.
 * Stops early after `maxRateLimited` consecutive rate-limit errors.
 */
export async function watchReleases(ledger, observe, { today, limit = Infinity, ids, maxRateLimited = 3 } = {}) {
  const candidates = [];
  const errors = [];
  let consecutiveLimited = 0;
  let aborted = false;
  let checked = 0;
  const targets = ledger.records.filter((r) => (ids ? ids.includes(r.id) : r.kind === "repository" || (r.registers ?? []).includes("upstreams")) && githubSlug(r.url));
  for (const r of targets.slice(0, limit)) {
    if (consecutiveLimited >= maxRateLimited) { aborted = true; break; }
    const { owner, repo } = githubSlug(r.url);
    checked++;
    let obs;
    try {
      obs = await observe(owner, repo);
      consecutiveLimited = 0;
    } catch (e) {
      const msg = String(e?.message ?? e);
      if (/\b(403|429)\b|rate limit/i.test(msg)) consecutiveLimited++;
      errors.push({ id: r.id, error: msg });
      continue;
    }
    if (!obs) { errors.push({ id: r.id, error: "repository not found (404)" }); continue; }
    const tagKey = obs.tag ? `${slugify(obs.tag)}-${sha256(obs.tag).slice(0, 6)}` : "head";
    const srcId = `rel-${slugify(`${owner}-${repo}`).slice(0, 50)}-${tagKey}`.slice(0, 90).replace(/-+$/, "");
    const url = obs.html_url ?? `https://github.com/${owner}/${repo}/releases`;
    const fromTags = obs.tag_source === "tags";
    candidates.push({ type: "source", id: srcId, kind: "github_release", trust: fromTags ? "secondary" : "primary", title: `${owner}/${repo} ${obs.tag ?? ""}`.trim(), url, publisher: "github.com", published_at: obs.published_at ?? null, retrieved_at: today });
    // A tag fallback is observed but may not be the newest tag, so it is recorded as secondary and low confidence.
    if (obs.tag) candidates.push({ type: "claim", record_id: r.id, predicate: "latest_release", value: obs.tag, evidence_class: fromTags ? "secondary" : "primary_observed", confidence: fromTags ? "low" : "high", source_ids: [srcId], valid_from: obs.published_at && obs.published_at <= today ? obs.published_at : today });
    if (typeof obs.archived === "boolean") candidates.push({ type: "claim", record_id: r.id, predicate: "archived", value: String(obs.archived), evidence_class: "primary_observed", confidence: "high", source_ids: [srcId], valid_from: today });
    if (obs.license && obs.license !== "NOASSERTION") candidates.push({ type: "claim", record_id: r.id, predicate: "license", value: obs.license, evidence_class: "primary_observed", confidence: "high", source_ids: [srcId], valid_from: today });
  }
  return { candidates, errors, checked, aborted };
}

// ----------------------------------------------------------------- reporting

export function currentValue(record, predicate) {
  return record.claims.find((c) => c.predicate === predicate && isCurrent(c))?.value ?? null;
}

/** Deterministic markdown digest: what changed, what is stale, what is unresolved, what awaits decision. */
export function buildReport(ledger, { today, since }) {
  const { errors, warnings, stale } = validateLedger(ledger, { today });
  const lines = [];
  const recs = ledger.records;
  const byState = {};
  for (const r of recs) (byState[r.adoption.state] = byState[r.adoption.state] ?? []).push(r.id);
  lines.push(`# Frontier Ledger report — ${today}`, "");
  lines.push(`Ledger \`${ledger.ledger_id}\` v${ledger.schema_version}, updated ${ledger.updated_at}. ${recs.length} records, ${ledger.sources.length} sources, ${recs.reduce((n, r) => n + r.claims.length, 0)} claims, ${ledger.contradictions.filter((k) => k.status === "open").length} open contradictions.`, "");
  lines.push(`Validation: ${errors.length} errors, ${warnings.length} warnings.`, "");

  // `since` is the previous audit date and is exclusive; changes are keyed on when knowledge was recorded.
  lines.push(`## What changed since ${since}`, "");
  const changed = [];
  for (const r of recs) {
    const isNew = r.provenance.first_seen > since;
    if (isNew) changed.push(`- **New:** \`${r.id}\` (${r.class}, ${r.adoption.state}) — ${r.title}`);
    for (const c of r.claims) {
      if (!isNew && c.recorded_at > since && isCurrent(c)) changed.push(`- **${c.predicate}** for \`${r.id}\`: ${c.value} (${c.evidence_class}, ${c.confidence}; valid from ${c.valid_from})`);
      if (c.superseded_by && c.valid_until > since) changed.push(`- Superseded \`${r.id}\`.${c.predicate}: ${c.value} → see \`${c.superseded_by}\``);
    }
  }
  lines.push(...(changed.length ? changed : ["- No changes."]), "");

  lines.push("## Pinned track versus latest observed release", "");
  const drift = recs
    .filter((r) => currentValue(r, "track") && currentValue(r, "latest_release"))
    .map((r) => `| \`${r.id}\` | ${currentValue(r, "track")} | ${currentValue(r, "latest_release")} | ${r.adoption.state} |`);
  lines.push(...(drift.length ? ["| Record | Pinned track | Latest release | Adoption |", "|---|---|---|---|", ...drift] : ["- No release observations yet."]), "");

  lines.push("## Awaiting a human decision", "");
  const pending = recs.flatMap((r) => (r.proposals ?? []).filter((p) => p.proposed_state !== r.adoption.state).map((p) => `- \`${r.id}\`: ${r.adoption.state} → **${p.proposed_state}** (proposed by ${p.by} on ${p.at}): ${p.rationale}`));
  lines.push(...(pending.length ? pending : ["- None."]), "");

  lines.push("## Open contradictions", "");
  const open = ledger.contradictions.filter((k) => k.status === "open").map((k) => `- \`${k.id}\`: ${k.description} (${k.claim_ids.join(", ")})`);
  lines.push(...(open.length ? open : ["- None."]), "");

  lines.push("## Stale records", "");
  lines.push(...(stale.length ? stale.map((s) => `- \`${s.id}\` (${s.class}) last verified ${s.last_verified}, ${s.age_days} days ago (limit ${s.limit_days})`) : ["- None."]), "");

  lines.push("## Adoption register", "");
  for (const state of ADOPTION_STATES) if (byState[state]) lines.push(`- **${state}** (${byState[state].length}): ${byState[state].map((id) => `\`${id}\``).join(", ")}`);
  lines.push("");
  if (warnings.length) lines.push("## Warnings", "", ...warnings.map((w) => `- ${w}`), "");
  if (errors.length) lines.push("## Errors", "", ...errors.map((e) => `- ${e}`), "");
  return lines.join("\n");
}
