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
 *   node scripts/estate-graph.mjs --registry <file> --tiers <file> --out <file>
 *                                            operator instance. Refuses to overwrite
 *                                            the fixture graph unless --out is set.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const CHECK_ONLY = argv.includes('--check');
const treeIdx = argv.indexOf('--tree');
const TREE = treeIdx !== -1 ? argv[treeIdx + 1] : null;
const flag = (name) => {
  const i = argv.indexOf(name);
  return i !== -1 ? argv[i + 1] : null;
};
const resolveInput = (p) => {
  if (/^[A-Za-z]:[\\/]/.test(p) || p.startsWith('/') || p.startsWith('\\\\')) return p;
  return join(ROOT, p);
};

const REGISTRY_REL = flag('--registry') || 'ontology/company-registry.json';
const TIERS_REL = flag('--tiers') || 'ontology/repo-tiers.json';
const REGISTRY_ABS = resolveInput(REGISTRY_REL);
const TIERS_ABS = resolveInput(TIERS_REL);
const externalInstance = REGISTRY_REL !== 'ontology/company-registry.json' || TIERS_REL !== 'ontology/repo-tiers.json';
const OUT_REL = flag('--out') || (externalInstance ? null : 'ontology/estate-graph.json');

const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const ontology = read('ontology/starlight-estate.ontology.v1.json');
const registry = JSON.parse(readFileSync(REGISTRY_ABS, 'utf8'));
const tiers = JSON.parse(readFileSync(TIERS_ABS, 'utf8'));
let upstreams = null;
try { upstreams = read('context/empire/upstreams.json'); } catch { /* optional source */ }

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

const principal = registry.principal || { id: 'human:operator', name: 'Operator' };
push({ id: principal.id, kind: 'human', name: principal.name });
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
  if (esc) link(a.id, 'escalates-to', esc === 'human' ? principal.id : esc);
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
for (const src of [[REGISTRY_REL, REGISTRY_ABS], [TIERS_REL, TIERS_ABS]]) {
  const raw = readFileSync(src[1], 'utf8');
  const label = src[0];
  for (const [i, line] of raw.split(/\r?\n/).entries()) {
    if (FORBIDDEN.test(line) && !/never|private\/|no cash|_privacy|_doc/i.test(line)) {
      fail('INV-7', `${label}:${i + 1} looks like private data in a public file`);
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

// INV-10: agent cards must carry distinguishing knowledge, not substituted nouns.
// Near-duplicate detection over normalised 5-word shingles of the card body.
const SHINGLE = 5;
function shingles(text) {
  const words = text
    .replace(/^---[\s\S]*?---/, '')            // drop frontmatter
    .toLowerCase()
    .replace(/[`*_>#|\[\]()]/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const set = new Set();
  for (let i = 0; i + SHINGLE <= words.length; i++) set.add(words.slice(i, i + SHINGLE).join(' '));
  return set;
}
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}
const DUP_THRESHOLD = 0.85;
const bodies = agents.map((a) => ({ id: a.id, path: a.path, sh: shingles(readFileSync(join(ROOT, a.path), 'utf8')) }));
const clusters = [];
const claimed = new Set();
for (let i = 0; i < bodies.length; i++) {
  if (claimed.has(bodies[i].id) || bodies[i].sh.size < 40) continue;
  const group = [bodies[i].id];
  for (let j = i + 1; j < bodies.length; j++) {
    if (claimed.has(bodies[j].id) || bodies[j].sh.size < 40) continue;
    if (jaccard(bodies[i].sh, bodies[j].sh) >= DUP_THRESHOLD) { group.push(bodies[j].id); claimed.add(bodies[j].id); }
  }
  if (group.length > 1) { group.forEach((g) => claimed.add(g)); clusters.push(group); }
}
for (const g of clusters) {
  fail('INV-10', `${g.length} agent cards are >=${DUP_THRESHOLD * 100}% identical — they name different systems and carry the same text: ${g.join(', ')}`);
}

// INV-11: an adapter card naming an external system must have that system in the upstream registry.
if (upstreams) {
  const ids = upstreams.upstreams.map((u) => u.id.toLowerCase());
  const repos = upstreams.upstreams.map((u) => u.repository.toLowerCase());
  for (const a of agents) {
    const m = a.path.match(/agents\/starlight-adapter-([a-z0-9-]+)\.md$/);
    if (!m) continue;
    const name = m[1];
    const known = ids.some((id) => id === name || id.startsWith(name + '-') || id.endsWith('-' + name) || id.includes(name))
      || repos.some((r) => r.includes('/' + name) || r.includes(name + '/'));
    if (!known) fail('INV-11', `${a.id} adapts '${name}', which is absent from context/empire/upstreams.json — a claimed adaptation with no tracked upstream`);
  }
}

// ------------------------------------------------------------------ output
// The committed graph must be a pure function of its inputs, or `--check` cannot tell
// a stale graph from a freshly rebuilt one. No wall-clock timestamp: a digest of every
// source file instead, which is both deterministic and what staleness actually means.
const digestInputs = [
  ['ontology/starlight-estate.ontology.v1.json', join(ROOT, 'ontology/starlight-estate.ontology.v1.json')],
  [REGISTRY_REL, REGISTRY_ABS],
  [TIERS_REL, TIERS_ABS],
  ...agents.map((a) => [a.path, join(ROOT, a.path)]).sort((a, b) => a[0].localeCompare(b[0])),
];
const sourcesDigest = 'sha256:' + createHash('sha256')
  .update(digestInputs.map(([label, abs]) => `${label}\0${readFileSync(abs, 'utf8')}`).join('\0'))
  .digest('hex')
  .slice(0, 32);

const graph = {
  $schema: 'https://starlightintelligence.org/schemas/ontology/starlight-estate.ontology.v1.json',
  schema: 'starlight.estate-graph.v1',
  sourcesDigest,
  source: {
    ontology: 'ontology/starlight-estate.ontology.v1.json',
    companyRegistry: REGISTRY_REL,
    repoTiers: TIERS_REL,
    agents: 'agents/',
  },
  counts: {},
  nodes: nodes.sort((a, b) => a.id.localeCompare(b.id)),
  edges: edges.sort((a, b) => (a.from + a.relation + a.to).localeCompare(b.from + b.relation + b.to)),
};
for (const n of graph.nodes) graph.counts[n.kind] = (graph.counts[n.kind] || 0) + 1;

if (!OUT_REL) {
  console.error('estate-graph: an external instance will not overwrite ontology/estate-graph.json. Pass --out.');
  process.exit(2);
}
const OUT = resolveInput(OUT_REL);
const serialised = JSON.stringify(graph, null, 2) + '\n';
if (CHECK_ONLY) {
  const committed = existsSync(OUT) ? readFileSync(OUT, 'utf8') : null;
  if (committed === null) fail('INV-0', 'ontology/estate-graph.json is missing — run `npm run estate:graph`');
  else if (committed !== serialised) fail('INV-0', 'ontology/estate-graph.json is stale — sources changed since it was built. Run `npm run estate:graph` and commit the result.');
} else {
  writeFileSync(OUT, serialised);
}

const errors = problems.filter((p) => p.severity === 'error');
const warns = problems.filter((p) => p.severity === 'warn');

console.log('estate-graph', CHECK_ONLY ? '(check only)' : '→ ontology/estate-graph.json');
console.log('  nodes:', graph.nodes.length, JSON.stringify(graph.counts));
console.log('  edges:', graph.edges.length);
for (const p of warns) console.log(`  WARN  ${p.inv}  ${p.msg}`);
for (const p of errors) console.log(`  ERROR ${p.inv}  ${p.msg}`);
console.log(`  ${errors.length} error(s), ${warns.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
