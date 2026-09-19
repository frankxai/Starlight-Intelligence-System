#!/usr/bin/env node
/**
 * estate-graph — build and validate the Starlight estate accountability graph.
 *
 * Projection, not storage. Sources:
 *   ontology/company-registry.json   companies, entities, brands
 *   ontology/repo-tiers.json         repos, tiers, observed AGENTS.md state
 *   agents/**\/*.md                  agent frontmatter (name, tier, domain, ...)
 *
 * Emits ontology/estate-graph.json and enforces the invariants declared in
 * ontology/starlight-estate.ontology.v1.json. Exits non-zero on any error-severity
 * violation so CI can gate on it.
 *
 * Usage:
 *   node scripts/estate-graph.mjs            build + validate + write
 *   node scripts/estate-graph.mjs --check    validate only, write nothing
 *   node scripts/estate-graph.mjs --tree ..  also cross-check repos against a
 *                                            directory of sibling checkouts
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const CHECK_ONLY = argv.includes('--check');
const treeIdx = argv.indexOf('--tree');
const TREE = treeIdx !== -1 ? argv[treeIdx + 1] : null;

const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const ontology = read('ontology/starlight-estate.ontology.v1.json');
const registry = read('ontology/company-registry.json');
const tiers = read('ontology/repo-tiers.json');

const problems = [];
const fail = (inv, msg) => problems.push({ severity: 'error', inv, msg });
const warn = (inv, msg) => problems.push({ severity: 'warn', inv, msg });

// ---------------------------------------------------------------- agent scan
function walkAgents(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walkAgents(p, out);
    else if (e.isFile() && e.name.endsWith('.md') && !/^[A-Z_]+\.md$/.test(e.name)) out.push(p);
  }
  return out;
}

function frontmatter(file) {
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (v.startsWith('[') && v.endsWith(']')) {
      v = v.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean);
    }
    fm[kv[1]] = v;
  }
  return fm;
}

const agentFiles = walkAgents(join(ROOT, 'agents'));
const agents = [];
for (const f of agentFiles) {
  const fm = frontmatter(f);
  const rel = f.slice(ROOT.length + 1).replace(/\\/g, '/');
  if (!fm || !fm.name) { warn('INV-9', `agent file has no parseable frontmatter: ${rel}`); continue; }
  agents.push({ id: `agent:${fm.name}`, kind: 'agent', path: rel, tier: fm.tier || 'unclassified', domain: fm.domain || null, fm });
}
const agentById = new Map(agents.map((a) => [a.id, a]));

// ------------------------------------------------------------------- build
const nodes = [];
const edges = [];
const push = (n) => nodes.push(n);
const link = (from, relation, to) => edges.push({ from, relation, to });

push({ id: 'human:frank', kind: 'human', name: 'Frank Riemer' });
for (const e of registry.entities) push({ id: e.id, kind: 'entity', name: e.name, role: e.role });
for (const b of registry.brands) {
  push({ id: b.id, kind: 'brand', name: b.name, register: b.register, copy_pin: b.copy_pin });
  link(b.company, 'owns', b.id);
  if (!b.copy_pin) warn('INV-8', `brand ${b.id} has no COPY.md pin`);
}
for (const c of registry.companies) {
  push({ id: c.id, kind: 'company', name: c.name, stage: c.stage, thesis: c.thesis });
  link(c.id, 'routes-through', c.routes_through);
  link(c.accountable_exec_seat, 'accountable-for', c.id);
  link(c.id, 'instantiates', c.accountable_exec_seat);
  for (const s of c.owns_surfaces || []) { push({ id: s, kind: 'surface', company: c.id }); link(c.id, 'owns', s); }
}
const companyIds = new Set(registry.companies.map((c) => c.id));

const repoOwners = new Map();
for (const r of tiers.repos) {
  push({ id: r.id, kind: 'repo', tier: r.tier, agents_md: r.agents_md, review: r.review || null });
  if (repoOwners.has(r.id)) fail('INV-1', `repo ${r.id} declared twice in repo-tiers.json`);
  repoOwners.set(r.id, r.company);
  if (!companyIds.has(r.company)) fail('INV-1', `repo ${r.id} owned by unknown company ${r.company}`);
  link(r.company, 'owns', r.id);
  if (r.deploys) link(r.id, 'publishes-to', r.deploys);
}

for (const a of agents) {
  push({ id: a.id, kind: 'agent', tier: a.tier, domain: a.domain, path: a.path });
  const esc = a.fm.escalates_to;
  if (esc) link(a.id, 'escalates-to', esc === 'human' ? 'human:frank' : esc);
  for (const m of [].concat(a.fm.owns_metrics || [])) {
    push({ id: m, kind: 'metric', owner_seat: a.id });
    link(a.id, 'accountable-for', m);
  }
  for (const rt of [].concat(a.fm.holds_rights || [])) {
    push({ id: rt, kind: 'decision-right', held_by: a.id });
    link(a.id, 'holds', rt);
  }
}

// -------------------------------------------------------------- invariants
// INV-2: every company has exactly one executive-tier accountable agent
for (const c of registry.companies) {
  const seat = agentById.get(c.accountable_exec_seat);
  if (!seat) fail('INV-2', `company ${c.id} names accountable seat ${c.accountable_exec_seat} which has no agent card`);
  else if (seat.tier !== 'executive') fail('INV-2', `company ${c.id} accountable seat ${seat.id} has tier '${seat.tier}', expected 'executive'`);
}
const accountableByCompany = {};
for (const e of edges.filter((x) => x.relation === 'accountable-for' && companyIds.has(x.to))) {
  (accountableByCompany[e.to] ||= []).push(e.from);
}
for (const [cid, seats] of Object.entries(accountableByCompany)) {
  if (seats.length !== 1) fail('INV-2', `company ${cid} has ${seats.length} accountable seats: ${seats.join(', ')}`);
}

// INV-3: escalates-to is a DAG terminating at a human
const escOut = new Map();
for (const e of edges.filter((x) => x.relation === 'escalates-to')) escOut.set(e.from, e.to);
for (const start of escOut.keys()) {
  const seen = new Set();
  let cur = start;
  while (cur && escOut.has(cur)) {
    if (seen.has(cur)) { fail('INV-3', `escalates-to cycle reached from ${start} at ${cur}`); break; }
    seen.add(cur);
    cur = escOut.get(cur);
  }
  if (cur && !cur.startsWith('human:') && !agentById.has(cur)) fail('INV-3', `${start} escalates to unknown node ${cur}`);
}

// INV-4: every executive seat owns >= 1 metric
for (const a of agents.filter((x) => x.tier === 'executive')) {
  const metrics = [].concat(a.fm.owns_metrics || []);
  if (metrics.length === 0) fail('INV-4', `executive seat ${a.id} owns no metric — decoration`);
}

// INV-5: irreversible rights name a human gate (declared in the card body table)
for (const a of agents.filter((x) => x.tier === 'executive')) {
  const body = readFileSync(join(ROOT, a.path), 'utf8');
  for (const rt of [].concat(a.fm.holds_rights || [])) {
    const short = rt.replace(/^right:/, '');
    const row = body.split(/\r?\n/).find((l) => l.includes(`\`${rt}\``) || l.includes(`\`right:${short}\``));
    if (!row) { warn('INV-5', `${a.id} declares ${rt} in frontmatter but has no row for it in the decision-rights table`); continue; }
    if (/\|\s*no\s*\|/i.test(row) && !/required/i.test(row)) fail('INV-5', `${a.id}: irreversible right ${rt} names no human gate`);
  }
}

// INV-6: T0/T1 repos must have a working contract
for (const r of tiers.repos.filter((x) => x.tier === 'T0' || x.tier === 'T1')) {
  if (r.agents_md.state !== 'generated') {
    const sev = r.agents_md.state === 'handwritten' ? warn : fail;
    sev('INV-6', `${r.tier} repo ${r.id} AGENTS.md state='${r.agents_md.state}'${r.agents_md.defect ? ` — ${r.agents_md.defect}` : ''}`);
  }
}

// INV-7: no money, jurisdiction, or credential in the public graph
const FORBIDDEN = /\b(iban|swift|bic|api[_-]?key|secret|password|"amount"|current_cash|jurisdiction)\b/i;
for (const src of ['ontology/company-registry.json', 'ontology/repo-tiers.json']) {
  const raw = readFileSync(join(ROOT, src), 'utf8');
  for (const [i, line] of raw.split(/\r?\n/).entries()) {
    if (FORBIDDEN.test(line) && !/never|private\/|no cash|_privacy|_doc/i.test(line)) {
      fail('INV-7', `${src}:${i + 1} looks like private data in a public file`);
    }
  }
}

// INV-9: every agent card is in the graph
const graphAgentIds = new Set(nodes.filter((n) => n.kind === 'agent').map((n) => n.id));
for (const a of agents) if (!graphAgentIds.has(a.id)) warn('INV-9', `agent ${a.id} missing from graph`);

// optional: cross-check declared repos against a real checkout tree
if (TREE) {
  const abs = resolve(process.cwd(), TREE);
  if (existsSync(abs) && statSync(abs).isDirectory()) {
    const onDisk = new Set(readdirSync(abs, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => `repo:${d.name}`));
    for (const r of tiers.repos) if (!onDisk.has(r.id)) warn('INV-1', `declared repo ${r.id} not present in ${TREE}`);
    for (const id of onDisk) if (!repoOwners.has(id)) warn('INV-1', `repo ${id} present in ${TREE} but unowned in repo-tiers.json`);
  }
}

// ------------------------------------------------------------------ output
const graph = {
  $schema: 'https://starlightintelligence.org/schemas/ontology/starlight-estate.ontology.v1.json',
  schema: 'starlight.estate-graph.v1',
  generatedAt: new Date().toISOString(),
  source: {
    ontology: 'ontology/starlight-estate.ontology.v1.json',
    companyRegistry: 'ontology/company-registry.json',
    repoTiers: 'ontology/repo-tiers.json',
    agents: 'agents/',
  },
  counts: {},
  nodes: nodes.sort((a, b) => a.id.localeCompare(b.id)),
  edges: edges.sort((a, b) => (a.from + a.relation + a.to).localeCompare(b.from + b.relation + b.to)),
};
for (const n of graph.nodes) graph.counts[n.kind] = (graph.counts[n.kind] || 0) + 1;

const errors = problems.filter((p) => p.severity === 'error');
const warns = problems.filter((p) => p.severity === 'warn');

if (!CHECK_ONLY) writeFileSync(join(ROOT, 'ontology/estate-graph.json'), JSON.stringify(graph, null, 2) + '\n');

console.log('estate-graph', CHECK_ONLY ? '(check only)' : '→ ontology/estate-graph.json');
console.log('  nodes:', graph.nodes.length, JSON.stringify(graph.counts));
console.log('  edges:', graph.edges.length);
for (const p of warns) console.log(`  WARN  ${p.inv}  ${p.msg}`);
for (const p of errors) console.log(`  ERROR ${p.inv}  ${p.msg}`);
console.log(`  ${errors.length} error(s), ${warns.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
