// SIP graph v0.1.0 — validator core. Zero dependencies, no I/O.
//
// This is a versioned EXTENSION of the Starlight Intelligence Protocol
// (SIP.md v1.1.1). SIP layers 1-6 govern files, attestation, registry,
// commands, sovereignty and archetypes. They say nothing about the shape of
// the evidence a node publishes. This module defines that shape: a typed graph
// of 12 node types and 13 edge types, every element carrying owner,
// provenance, version, visibility and an evaluation rule.
//
// Version namespace is independent of SIP's: `sipGraphVersion: "0.1.0"`.
// See COMPATIBILITY.md for the bump rules and PROJECTION.md for the
// public/private boundary the P-rules enforce.

import { maskElement } from "./mask.mjs";

export const SIP_GRAPH_VERSION = "0.1.0";

export const NODE_TYPES = [
  "Identity",
  "Agent",
  "Capability",
  "MemoryRecord",
  "Claim",
  "Source",
  "Attestation",
  "Policy",
  "Decision",
  "Artifact",
  "Evaluation",
  "Projection",
];

export const EDGE_TYPES = [
  "asserts",
  "derivedFrom",
  "supports",
  "contradicts",
  "governedBy",
  "decides",
  "underPolicy",
  "grants",
  "exercises",
  "produces",
  "evaluates",
  "attests",
  "projects",
];

// Legal endpoint types per edge type. An edge whose endpoints fall outside this
// matrix is rejected: the graph refuses relationships it cannot govern.
export const EDGE_MATRIX = {
  asserts: { from: ["Agent", "Identity"], to: ["Claim"] },
  derivedFrom: {
    from: ["Claim", "MemoryRecord", "Artifact"],
    to: ["Source", "MemoryRecord", "Artifact"],
  },
  supports: { from: ["Source", "Evaluation"], to: ["Claim"] },
  contradicts: { from: ["Source", "Evaluation"], to: ["Claim"] },
  governedBy: {
    from: ["Agent", "Capability", "Claim", "Artifact", "MemoryRecord"],
    to: ["Policy"],
  },
  decides: { from: ["Decision"], to: ["Claim", "Artifact", "Capability"] },
  underPolicy: { from: ["Decision"], to: ["Policy"] },
  grants: { from: ["Identity"], to: ["Capability"] },
  exercises: { from: ["Agent"], to: ["Capability"] },
  produces: { from: ["Agent"], to: ["Artifact", "MemoryRecord"] },
  evaluates: { from: ["Evaluation"], to: NODE_TYPES },
  attests: {
    from: ["Attestation"],
    to: ["Artifact", "Claim", "Evaluation", "Decision"],
  },
  projects: { from: ["Projection"], to: NODE_TYPES },
};

// Type-specific required keys under `body`. Deliberately small: the envelope
// carries the governance, the body carries only what makes the node that type.
export const BODY_REQUIRED = {
  Identity: ["kind"],
  Agent: ["harness"],
  Capability: ["action", "scope"],
  MemoryRecord: ["retention", "contentRef"],
  Claim: ["statement"],
  Source: ["locator"],
  Attestation: ["statementType"],
  Policy: ["rule", "enforcement"],
  Decision: ["outcome", "rationale"],
  Artifact: ["locator"],
  Evaluation: ["method", "result"],
  Projection: ["audience", "include"],
};

export const VISIBILITY_ORDER = ["public", "alliance", "private", "secret"];
const VIS_RANK = Object.fromEntries(VISIBILITY_ORDER.map((v, i) => [v, i]));

export const PROVENANCE_ORIGINS = ["authored", "derived", "imported", "observed"];

// `sip:memory-record:...` for MemoryRecord, `sip:claim:...` for Claim, etc.
export function idPrefixFor(type) {
  return `sip:${type.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}:`;
}

// Credential shapes that must never survive into a public projection. Cheap,
// deterministic, and deliberately conservative — a false positive costs a
// rename, a false negative costs a leaked key.
const SECRET_PATTERNS = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "PEM private key"],
  [/\bsk-[A-Za-z0-9_-]{16,}/, "OpenAI-style secret key"],
  [/\bsk-ant-[A-Za-z0-9_-]{16,}/, "Anthropic-style secret key"],
  [/\bgh[pousr]_[A-Za-z0-9]{20,}/, "GitHub token"],
  [/\bAKIA[0-9A-Z]{16}\b/, "AWS access key id"],
  [/\bxox[abposr]-[A-Za-z0-9-]{10,}/, "Slack token"],
  [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\./, "JWT"],
];

// A run of base64/base62 characters long enough to be key material. Two shapes
// are excluded because they are the opposite of a leak: a bare sha256 digest and
// a `sha256:`-prefixed one. Pinning content by hash is the CI discipline
// INSTALL.md asks for, and the first version of this rule rejected it.
const BASE64_BLOB = /[A-Za-z0-9+/]{60,}={0,2}/g;
const SHA256_HEX = /^[0-9a-f]{64}$/;
const DIGEST_PREFIX = /(?:sha256|sha-256|sha512|digest)[:=@-]$/i;

/**
 * Labels for every credential shape found in `text`. Empty means clean.
 * @param {string} text
 * @returns {string[]}
 */
export function findSecrets(text) {
  const subject = String(text);
  const labels = [];
  for (const [pattern, label] of SECRET_PATTERNS) {
    if (pattern.test(subject)) labels.push(label);
  }
  for (const m of subject.matchAll(BASE64_BLOB)) {
    const token = m[0].replace(/=+$/, "");
    if (SHA256_HEX.test(token)) continue;
    if (DIGEST_PREFIX.test(subject.slice(Math.max(0, m.index - 8), m.index))) continue;
    labels.push("long base64 blob");
    break;
  }
  return labels;
}

// Field names whose contents are owner-only by convention. P3 guards them at
// any depth: `body.internalNotes.credentials` is as much a leak as `private`.
const GUARDED_KEYS = new Set(["private", "secret", "credentials"]);

function isPlainObject(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function hasContent(v) {
  if (v === null || v === undefined) return false;
  if (isPlainObject(v)) return Object.keys(v).length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return String(v).length > 0;
}

/**
 * Paths (dotted, array indices bracketed) of every guarded key carrying content,
 * at any depth, inside objects and arrays alike.
 * @param {unknown} value
 * @returns {string[]}
 */
export function findGuardedFields(value) {
  const hits = [];
  const walk = (v, path) => {
    if (Array.isArray(v)) {
      v.forEach((child, i) => walk(child, `${path}[${i}]`));
      return;
    }
    if (!isPlainObject(v)) return;
    for (const [key, child] of Object.entries(v)) {
      const at = path ? `${path}.${key}` : key;
      if (GUARDED_KEYS.has(key.toLowerCase()) && hasContent(child)) hits.push(at);
      walk(child, at);
    }
  };
  walk(value, "");
  return hits;
}

// The edges a projection actually publishes. An edge whose two endpoints are
// both included travels in the same JSON as those endpoints and carries the same
// envelope — until v0.1.0's first fix pass, nothing looked at it. Edges listed in
// `redacted` are withheld and are not scanned.
function projectedEdges(projection, edges) {
  const include = new Set(projection?.body?.include ?? []);
  const redacted = new Set(projection?.body?.redacted ?? []);
  return edges.filter(
    (e) =>
      !redacted.has(e?.id) &&
      (include.has(e?.id) || (include.has(e?.from) && include.has(e?.to)))
  );
}

class Report {
  constructor() {
    this.rules = [];
  }
  rule(id, title, findings) {
    this.rules.push({
      id,
      title,
      status: findings.length === 0 ? "pass" : "fail",
      findings,
    });
  }
  get verdict() {
    return this.rules.every((r) => r.status === "pass") ? "PASS" : "FAIL";
  }
}

/**
 * Validate a SIP graph profile.
 * @param {object} profile parsed sip-profile.json
 * @returns {{verdict: "PASS"|"FAIL", rules: Array, counts: object}}
 */
export function validateProfile(profile) {
  const r = new Report();

  if (!isPlainObject(profile)) {
    r.rule("C1", "Profile is a JSON object", ["profile is not an object"]);
    return { verdict: r.verdict, rules: r.rules, counts: {} };
  }

  const nodes = Array.isArray(profile.nodes) ? profile.nodes : [];
  const edges = Array.isArray(profile.edges) ? profile.edges : [];

  // ── C1 · version compatibility ──────────────────────────────────────────
  {
    const findings = [];
    const declared = profile.sipGraphVersion;
    if (typeof declared !== "string" || !/^\d+\.\d+\.\d+$/.test(declared)) {
      findings.push(`sipGraphVersion missing or not semver: ${declared}`);
    } else {
      const [dMaj, dMin] = declared.split(".").map(Number);
      const [oMaj, oMin] = SIP_GRAPH_VERSION.split(".").map(Number);
      if (dMaj !== oMaj) {
        findings.push(
          `major mismatch: profile ${declared}, validator ${SIP_GRAPH_VERSION} — a major bump is a breaking change, refuse rather than guess`
        );
      } else if (dMin > oMin) {
        findings.push(
          `profile minor ${declared} is newer than validator ${SIP_GRAPH_VERSION} — it may declare node or edge types this validator cannot govern`
        );
      }
    }
    r.rule("C1", "Declared graph version is compatible", findings);
  }

  // ── G1 · envelope completeness ──────────────────────────────────────────
  {
    const findings = [];
    const required = [
      "id",
      "type",
      "version",
      "owner",
      "visibility",
      "provenance",
      "evaluation",
    ];
    for (const n of nodes) {
      const where = n?.id ?? "<node without id>";
      for (const key of required) {
        if (n?.[key] === undefined) findings.push(`${where}: missing ${key}`);
      }
      if (n?.visibility && !VIS_RANK.hasOwnProperty(n.visibility)) {
        findings.push(`${where}: unknown visibility "${n.visibility}"`);
      }
      if (isPlainObject(n?.provenance)) {
        if (!PROVENANCE_ORIGINS.includes(n.provenance.origin)) {
          findings.push(
            `${where}: provenance.origin must be one of ${PROVENANCE_ORIGINS.join("|")}`
          );
        }
        if (typeof n.provenance.at !== "string") {
          findings.push(`${where}: provenance.at (ISO-8601) is required`);
        }
      } else if (n?.provenance !== undefined) {
        findings.push(`${where}: provenance must be an object`);
      }
      if (isPlainObject(n?.evaluation)) {
        if (typeof n.evaluation.rule !== "string") {
          findings.push(`${where}: evaluation.rule is required`);
        }
      } else if (n?.evaluation !== undefined) {
        findings.push(`${where}: evaluation must be an object`);
      }
      if (n?.version !== undefined && !/^\d+\.\d+\.\d+$/.test(String(n.version))) {
        findings.push(`${where}: version "${n.version}" is not semver`);
      }
    }
    for (const e of edges) {
      const where = e?.id ?? "<edge without id>";
      for (const key of [
        "id",
        "type",
        "from",
        "to",
        "version",
        "owner",
        "visibility",
        "provenance",
        "evaluation",
      ]) {
        if (e?.[key] === undefined) findings.push(`${where}: missing ${key}`);
      }
      if (e?.visibility && !VIS_RANK.hasOwnProperty(e.visibility)) {
        findings.push(`${where}: unknown visibility "${e.visibility}"`);
      }
      if (isPlainObject(e?.evaluation) && typeof e.evaluation.rule !== "string") {
        findings.push(`${where}: evaluation.rule is required`);
      }
    }
    r.rule("G1", "Every node and edge carries the governance envelope", findings);
  }

  // ── G2 · id shape ───────────────────────────────────────────────────────
  {
    const findings = [];
    for (const n of nodes) {
      if (typeof n?.id !== "string" || typeof n?.type !== "string") continue;
      if (!NODE_TYPES.includes(n.type)) continue; // G4 reports this
      const want = idPrefixFor(n.type);
      if (!n.id.startsWith(want)) {
        findings.push(`${n.id}: type ${n.type} requires id prefix "${want}"`);
      }
    }
    for (const e of edges) {
      if (typeof e?.id === "string" && !e.id.startsWith("sip:edge:")) {
        findings.push(`${e.id}: edge ids must start with "sip:edge:"`);
      }
    }
    r.rule("G2", "Ids are namespaced and match their type", findings);
  }

  // ── G3 · unique ids ─────────────────────────────────────────────────────
  {
    const seen = new Set();
    const findings = [];
    for (const el of [...nodes, ...edges]) {
      const id = el?.id;
      if (typeof id !== "string") continue;
      if (seen.has(id)) findings.push(`duplicate id: ${id}`);
      seen.add(id);
    }
    r.rule("G3", "Ids are unique across nodes and edges", findings);
  }

  const byId = new Map();
  for (const n of nodes) if (typeof n?.id === "string") byId.set(n.id, n);

  // ── G4 / G5 · closed type sets (fail closed) ────────────────────────────
  {
    const findings = [];
    for (const n of nodes) {
      if (!NODE_TYPES.includes(n?.type)) {
        findings.push(`${n?.id ?? "<node>"}: unknown node type "${n?.type}"`);
      }
    }
    r.rule("G4", "Node types are drawn from the declared set", findings);
  }
  {
    const findings = [];
    for (const e of edges) {
      if (!EDGE_TYPES.includes(e?.type)) {
        findings.push(`${e?.id ?? "<edge>"}: unknown edge type "${e?.type}"`);
      }
    }
    r.rule("G5", "Edge types are drawn from the declared set", findings);
  }

  // ── G6 · edge endpoints resolve ─────────────────────────────────────────
  {
    const findings = [];
    for (const e of edges) {
      for (const end of ["from", "to"]) {
        const target = e?.[end];
        if (typeof target === "string" && !byId.has(target)) {
          findings.push(`${e.id}: ${end} "${target}" is not a declared node`);
        }
      }
    }
    r.rule("G6", "Edge endpoints resolve to declared nodes", findings);
  }

  // ── G7 · endpoint types are legal for the edge type ─────────────────────
  {
    const findings = [];
    for (const e of edges) {
      const spec = EDGE_MATRIX[e?.type];
      if (!spec) continue;
      const from = byId.get(e.from);
      const to = byId.get(e.to);
      if (from && !spec.from.includes(from.type)) {
        findings.push(
          `${e.id}: ${e.type} cannot originate at ${from.type} (allowed: ${spec.from.join(", ")})`
        );
      }
      if (to && !spec.to.includes(to.type)) {
        findings.push(
          `${e.id}: ${e.type} cannot terminate at ${to.type} (allowed: ${spec.to.join(", ")})`
        );
      }
    }
    r.rule("G7", "Edge endpoints match the legal type matrix", findings);
  }

  // ── G8 · owners are declared identities ─────────────────────────────────
  {
    const findings = [];
    for (const el of [...nodes, ...edges]) {
      const owner = el?.owner;
      if (typeof owner !== "string") continue;
      const node = byId.get(owner);
      if (!node) {
        findings.push(`${el.id}: owner "${owner}" is not a declared node`);
      } else if (node.type !== "Identity") {
        findings.push(`${el.id}: owner "${owner}" is a ${node.type}, not an Identity`);
      }
    }
    r.rule("G8", "Every element is owned by a declared Identity", findings);
  }

  // ── G9 · provenance sources resolve ─────────────────────────────────────
  {
    const findings = [];
    for (const el of [...nodes, ...edges]) {
      const sources = el?.provenance?.sources;
      if (!Array.isArray(sources)) continue;
      for (const s of sources) {
        if (!byId.has(s)) {
          findings.push(`${el.id}: provenance source "${s}" is not a declared node`);
        }
      }
    }
    r.rule("G9", "Provenance sources resolve inside the graph", findings);
  }

  // ── G10 · derivation is acyclic ─────────────────────────────────────────
  {
    const findings = [];
    const out = new Map();
    for (const e of edges) {
      if (e?.type !== "derivedFrom") continue;
      if (!out.has(e.from)) out.set(e.from, []);
      out.get(e.from).push(e.to);
    }
    const state = new Map(); // 1 = visiting, 2 = done
    const walk = (id, path) => {
      if (state.get(id) === 2) return;
      if (state.get(id) === 1) {
        findings.push(`derivedFrom cycle: ${[...path, id].join(" -> ")}`);
        return;
      }
      state.set(id, 1);
      for (const next of out.get(id) ?? []) walk(next, [...path, id]);
      state.set(id, 2);
    };
    for (const id of out.keys()) walk(id, []);
    r.rule("G10", "derivedFrom contains no cycles", findings);
  }

  // ── G11 · type-specific body ────────────────────────────────────────────
  {
    const findings = [];
    for (const n of nodes) {
      const required = BODY_REQUIRED[n?.type];
      if (!required) continue;
      if (!isPlainObject(n.body)) {
        findings.push(`${n.id}: ${n.type} requires a body object`);
        continue;
      }
      for (const key of required) {
        if (n.body[key] === undefined) {
          findings.push(`${n.id}: ${n.type} body is missing "${key}"`);
        }
      }
    }
    r.rule("G11", "Node bodies carry their type's required fields", findings);
  }

  // ── Projection rules ────────────────────────────────────────────────────
  const projections = nodes.filter((n) => n?.type === "Projection");

  // P1 · a projection never carries a node stricter than its audience.
  {
    const findings = [];
    for (const p of projections) {
      const audience = p?.body?.audience;
      if (!VIS_RANK.hasOwnProperty(audience)) {
        findings.push(`${p.id}: audience "${audience}" is not a visibility level`);
        continue;
      }
      for (const id of p.body.include ?? []) {
        const node = byId.get(id);
        if (!node) {
          findings.push(`${p.id}: includes "${id}", which is not a declared node`);
          continue;
        }
        if (VIS_RANK[node.visibility] > VIS_RANK[audience]) {
          findings.push(
            `${p.id}: audience "${audience}" cannot carry ${node.id} (visibility "${node.visibility}")`
          );
        }
      }
      for (const e of projectedEdges(p, edges)) {
        if (!VIS_RANK.hasOwnProperty(e.visibility)) {
          findings.push(`${p.id}: edge ${e.id} has no usable visibility "${e.visibility}"`);
          continue;
        }
        if (VIS_RANK[e.visibility] > VIS_RANK[audience]) {
          findings.push(
            `${p.id}: audience "${audience}" cannot carry edge ${e.id} (visibility "${e.visibility}") — both its endpoints are published, so the edge travels with them`
          );
        }
      }
    }
    r.rule("P1", "Projections never widen a node or edge past its visibility", findings);
  }

  // P2 · edges that cross the projection boundary are declared, not silent.
  {
    const findings = [];
    for (const p of projections) {
      const include = new Set(p?.body?.include ?? []);
      const redacted = new Set(p?.body?.redacted ?? []);
      for (const e of edges) {
        const fromIn = include.has(e.from);
        const toIn = include.has(e.to);
        if (fromIn === toIn) continue; // wholly in or wholly out
        if (!redacted.has(e.id)) {
          findings.push(
            `${p.id}: edge ${e.id} leaves the projection but is not listed in redacted[] — a reader would see an evidence chain that silently ends`
          );
        }
      }
    }
    r.rule("P2", "Boundary-crossing edges are declared as redacted", findings);
  }

  // P3 · private field blocks never ride along in a widened projection.
  {
    const findings = [];
    for (const p of projections) {
      const audience = p?.body?.audience;
      if (!VIS_RANK.hasOwnProperty(audience)) continue;
      if (VIS_RANK[audience] >= VIS_RANK.private) continue;
      const redactFields = new Set(p?.body?.redactFields ?? []);
      const projected = [
        ...(p.body.include ?? []).map((id) => byId.get(id)).filter(Boolean),
        ...projectedEdges(p, edges),
      ];
      for (const el of projected) {
        for (const path of findGuardedFields(el)) {
          // redactFields strips the top-level `private` block and nothing else.
          if (path === "private" && redactFields.has(el.id)) continue;
          findings.push(
            path === "private"
              ? `${p.id}: ${el.id} carries a private block and is projected to "${audience}" without being listed in redactFields[]`
              : `${p.id}: ${el.id} carries an owner-only field at "${path}" and is projected to "${audience}" — redactFields[] strips only the top-level private block, so this one must be removed from the graph`
          );
        }
      }
    }
    r.rule("P3", "Owner-only fields are stripped or explicitly redacted, at any depth", findings);
  }

  // P4 · nothing credential-shaped survives into a public projection.
  {
    const findings = [];
    for (const p of projections) {
      if (p?.body?.audience !== "public") continue;
      const redactFields = new Set(p?.body?.redactFields ?? []);
      const projected = [
        ...(p?.body?.include ?? []).map((id) => byId.get(id)).filter(Boolean),
        ...projectedEdges(p, edges),
      ];
      for (const el of projected) {
        const shown = { ...el };
        if (redactFields.has(el.id)) delete shown.private;
        const kind = el.from !== undefined && el.to !== undefined ? "edge " : "";
        for (const label of findSecrets(JSON.stringify(shown))) {
          findings.push(`${p.id}: ${kind}${el.id} carries a ${label} into a public projection`);
        }
      }
    }
    r.rule("P4", "No credential-shaped value reaches a public projection", findings);
  }

  // P5 · a public reader can resolve every owner they are shown.
  {
    const findings = [];
    for (const p of projections) {
      if (p?.body?.audience !== "public") continue;
      for (const id of p.body.include ?? []) {
        const node = byId.get(id);
        if (!node) continue;
        const owner = byId.get(node.owner);
        if (owner && owner.visibility !== "public") {
          findings.push(
            `${p.id}: ${id} is public but its owner ${owner.id} is "${owner.visibility}" — the reader cannot resolve who has decision rights`
          );
        }
      }
    }
    r.rule("P5", "Publicly projected nodes name a publicly resolvable owner", findings);
  }

  const counts = {
    nodes: nodes.length,
    edges: edges.length,
    projections: projections.length,
    byType: NODE_TYPES.reduce((acc, t) => {
      const n = nodes.filter((x) => x?.type === t).length;
      if (n) acc[t] = n;
      return acc;
    }, {}),
  };

  return { verdict: r.verdict, rules: r.rules, counts };
}

/**
 * Walk one claim's evidence chain in the canonical stage order:
 * source -> policy -> memory -> artifact -> evaluation -> attestation.
 *
 * `audience` filters through a Projection node of that audience when one
 * exists; nodes outside it come back as { withheld: true } so the trace shows
 * the shape of what is hidden without showing the content.
 */
export function traceClaim(profile, claimId, audience = "owner") {
  const nodes = Array.isArray(profile?.nodes) ? profile.nodes : [];
  const edges = Array.isArray(profile?.edges) ? profile.edges : [];
  const byId = new Map(nodes.map((n) => [n.id, n]));

  let visible = null;
  if (audience !== "owner") {
    const projection = nodes.find(
      (n) => n.type === "Projection" && n.body?.audience === audience
    );
    visible = projection ? new Set(projection.body.include ?? []) : new Set();
  }

  const claim = byId.get(claimId);
  if (!claim) return null;

  const related = (edgeType, direction, fromId) =>
    edges
      .filter((e) => e.type === edgeType && e[direction === "out" ? "from" : "to"] === fromId)
      .map((e) => byId.get(e[direction === "out" ? "to" : "from"]))
      .filter(Boolean);

  const assertedBy = related("asserts", "in", claimId);
  const agent = assertedBy.find((n) => n.type === "Agent") ?? assertedBy[0] ?? null;

  const derivedFrom = related("derivedFrom", "out", claimId);

  const stages = [
    {
      key: "source",
      label: "Source",
      nodes: derivedFrom.filter((n) => n.type === "Source"),
    },
    { key: "policy", label: "Policy", nodes: related("governedBy", "out", claimId) },
    {
      key: "memory",
      label: "Memory",
      nodes: derivedFrom.filter((n) => n.type === "MemoryRecord"),
    },
    {
      key: "artifact",
      label: "Artifact",
      nodes: agent ? related("produces", "out", agent.id) : [],
    },
    { key: "evaluation", label: "Evaluation", nodes: related("supports", "in", claimId).filter((n) => n.type === "Evaluation") },
    { key: "attestation", label: "Attestation", nodes: related("attests", "in", claimId) },
  ];

  const mask = (n) => maskElement(n, visible);

  return {
    claim: mask(claim),
    assertedBy: agent ? mask(agent) : null,
    audience,
    stages: stages.map((s) => ({ ...s, nodes: s.nodes.map(mask) })),
  };
}
