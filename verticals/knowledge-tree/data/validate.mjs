#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Knowledge Tree canon validator — zero dependencies.
// Enforces the graph schema (structure) AND the load-bearing Laws (LAWS.md):
//   LAW-1 provenance on non-draft nodes, ontology closure (ONTOLOGY.md),
//   ID grammar + permanence-friendly shape, no dangling edges, evidence freshness.
// Run: node verticals/knowledge-tree/data/validate.mjs
// Exit 0 = clean, 1 = violations. Safe to wire into CI (harness-check).
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const graph = JSON.parse(readFileSync(join(HERE, "graph.json"), "utf8"));

const KINDS = ["concept", "skill", "practice", "artifact", "evidence", "contribution", "quest"];
const RELATIONS = ["unlocks", "requires", "part-of", "contributes-to"];
const CONFIDENCE = ["established", "supported", "contested", "speculative", "unknown"];
const ACCENTS = ["violet", "cyan", "fuchsia", "emerald", "amber", "rose"];
const REF_TYPES = ["doi", "arxiv", "wikidata", "orcid", "isbn", "url"];
const ID_RE = /^[a-z0-9-]+\/(concept|skill|practice|artifact|evidence|contribution|quest)\/[a-z0-9-]+$/;

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

// ── Domains ──────────────────────────────────────────────────────────────────
const domainIds = new Set();
for (const d of graph.domains ?? []) {
  if (!d.id || !d.name || !d.accent || !d.blurb) err(`domain missing required field: ${JSON.stringify(d)}`);
  if (d.accent && !ACCENTS.includes(d.accent)) err(`domain ${d.id}: bad accent "${d.accent}"`);
  if (d.tier && !["foundation", "path"].includes(d.tier)) err(`domain ${d.id}: bad tier "${d.tier}"`);
  domainIds.add(d.id);
}

// ── Nodes ────────────────────────────────────────────────────────────────────
const nodeIds = new Set();
for (const n of graph.nodes ?? []) {
  if (nodeIds.has(n.id)) err(`duplicate node id: ${n.id}`);
  nodeIds.add(n.id);
  if (!ID_RE.test(n.id)) err(`node id violates grammar <prefix>/<kind>/<slug>: ${n.id}`);
  if (!KINDS.includes(n.kind)) err(`node ${n.id}: bad kind "${n.kind}"`);          // ontology closure
  if (!n.label || !n.summary) err(`node ${n.id}: missing label/summary`);
  if (n.domainId && !domainIds.has(n.domainId)) err(`node ${n.id}: unknown domainId "${n.domainId}"`);
  // id kind segment must match declared kind
  const idKind = n.id.split("/")[1];
  if (idKind !== n.kind) err(`node ${n.id}: id kind "${idKind}" != declared kind "${n.kind}"`);

  if (n.confidence && !CONFIDENCE.includes(n.confidence)) err(`node ${n.id}: bad confidence "${n.confidence}"`);
  if (n.status && !["active", "deprecated"].includes(n.status)) err(`node ${n.id}: bad status`);
  if (n.difficulty != null && !(Number.isInteger(n.difficulty) && n.difficulty >= 1 && n.difficulty <= 5))
    err(`node ${n.id}: difficulty must be 1-5`);
  for (const r of n.refs ?? []) {
    if (!REF_TYPES.includes(r.type)) err(`node ${n.id}: bad ref type "${r.type}"`);
    if (!r.id) err(`node ${n.id}: ref missing id`);
  }

  // LAW-1 — provenance. concept/evidence/contribution carry verifiable claims.
  const needsRefs = ["concept", "evidence", "contribution", "quest"].includes(n.kind);
  if (needsRefs && (!n.refs || n.refs.length === 0)) warn(`LAW-1: ${n.kind} node ${n.id} has no refs (draft-grade)`);
  // LAW-4 — evidence freshness
  if (n.kind === "evidence" && !n.last_verified) warn(`LAW-4: evidence node ${n.id} missing last_verified`);
  // LAW-11 — privacy boundary: no person-typed nodes (heuristic guard)
  if (/\bpii\b|\bpatient\b|\bbiometric\b/i.test(n.id)) err(`LAW-11: node ${n.id} looks person-scoped`);
}

// ── Edges ────────────────────────────────────────────────────────────────────
for (const e of graph.edges ?? []) {
  if (!RELATIONS.includes(e.relation)) err(`edge bad relation "${e.relation}" (${e.source}->${e.target})`); // closure
  if (!nodeIds.has(e.source)) err(`dangling edge source: ${e.source}`);
  if (!nodeIds.has(e.target)) err(`dangling edge target: ${e.target}`);
  if (e.source === e.target) err(`self-edge: ${e.source}`);
}

// ── Meta ─────────────────────────────────────────────────────────────────────
if (!/^\d+\.\d+\.\d+$/.test(graph.meta?.version ?? "")) err(`meta.version not semver: ${graph.meta?.version}`);
const declared = graph.meta?.counts;
if (declared) {
  if (declared.nodes !== graph.nodes.length) warn(`meta.counts.nodes ${declared.nodes} != actual ${graph.nodes.length}`);
  if (declared.edges !== graph.edges.length) warn(`meta.counts.edges ${declared.edges} != actual ${graph.edges.length}`);
}

// LAW-5 — every quest should declare its prerequisite lattice
const requiresBySource = new Set(graph.edges.filter((e) => e.relation === "requires").map((e) => e.source));
for (const n of graph.nodes.filter((n) => n.kind === "quest")) {
  if (!requiresBySource.has(n.id)) warn(`LAW-5: quest ${n.id} has no 'requires' edges (prerequisite lattice missing)`);
}

// ── Report ───────────────────────────────────────────────────────────────────
const s = { domains: graph.domains.length, nodes: graph.nodes.length, edges: graph.edges.length,
  quests: graph.nodes.filter((n) => n.kind === "quest").length,
  evidence: graph.nodes.filter((n) => n.kind === "evidence").length };
console.log(`Knowledge Tree canon: v${graph.meta.version} — ${s.domains} domains, ${s.nodes} nodes, ${s.edges} edges (${s.quests} quests, ${s.evidence} evidence)`);
if (warnings.length) { console.log(`\n${warnings.length} warning(s):`); warnings.forEach((w) => console.log("  ⚠ " + w)); }
if (errors.length) {
  console.log(`\n${errors.length} ERROR(s):`); errors.forEach((e) => console.log("  ✖ " + e));
  console.log("\nFAIL — canon violates schema/laws.");
  process.exit(1);
}
console.log("\nPASS — schema + laws clean.");
