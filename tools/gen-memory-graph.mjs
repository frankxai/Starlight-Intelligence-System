#!/usr/bin/env node
// gen-memory-graph.mjs — render memory/graph/memory-graph.json from the real memory tree.
// Run natively (not from sandbox): node tools/gen-memory-graph.mjs [--redact] [--root <dir>] [--out <file>] [--quiet]
// Reads:  memory/vaults/*.md            (frontmatter + dated entries -> vault + atom nodes)
//         memory/vaults/<v>/<v>.jsonl   (atom store -> atom nodes with confidence/tags)
//         memory/vaults/house-of-*/     (namespace.json + .arc -> cluster nodes)
//         memory/atlases/*.canvas       (Obsidian JSON canvas -> cluster/atom nodes + composes edges)
//         memory/curated/*.md           (curated recalls -> atom nodes)
//         VERTICALS.md                  (sovereign verticals + alliances -> vertical nodes)
//         git log -1 per file           (real authored date; fs mtime is checkout time in a worktree)
// Writes: memory/graph/memory-graph.json  (machine SSOT for MemoryPalace3D, console substrate, knowledge tree)
// No markdown twin is generated on purpose. This is the only file that should derive the memory graph —
// consumers bind to the JSON, never to hand-authored fixtures.
//
// --redact drops every field carrying vault body text (excerpts, body-derived labels) while keeping
// ids, kinds, structural labels, counts, and freshness. That is the contract the public site consumes.

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname, basename, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HALF_LIFE_DAYS = 30;
const BANDS = [
  { band: 'fresh', maxAgeDays: 30 },
  { band: 'aging', maxAgeDays: 90 },
  { band: 'stale', maxAgeDays: 180 },
  { band: 'dormant', maxAgeDays: Infinity },
];
const MAX_EXCERPT = 280;
const DATED_VAULTS = ['strategic', 'technical', 'creative', 'operational', 'wisdom', 'horizon'];

// ---------- cli ----------

const argv = process.argv.slice(2);
const flag = n => argv.includes(n);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

const REDACT = flag('--redact');
const QUIET = flag('--quiet');
const ROOT = resolve(opt('--root', join(dirname(fileURLToPath(import.meta.url)), '..')));
const OUT = resolve(opt('--out', join(ROOT, 'memory/graph/memory-graph.json')));
const MEM = join(ROOT, 'memory');

const NOW = new Date();

// ---------- collectors ----------

const nodes = [];
const edges = [];
const pendingLinks = [];
const skipped = [];
const truncated = [];
const sources = [];

const skip = (path, reason, extra = {}) => skipped.push({ path: rel(path), reason, ...extra });
const rel = p => relative(ROOT, p).replace(/\\/g, '/');

// ---------- fs / git ----------

function walk(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

// git commit date is the real authored time. fs mtime equals checkout time inside a worktree,
// which would report every vault as same-day fresh and destroy the staleness signal.
function fileFreshness(abs) {
  try {
    const iso = execSync(`git -C "${ROOT}" log -1 --format=%cI -- "${rel(abs)}"`, {
      stdio: ['pipe', 'pipe', 'ignore'],
    }).toString().trim();
    if (iso) return { lastModified: new Date(iso).toISOString(), source: 'git' };
  } catch { /* untracked or no git */ }
  return { lastModified: statSync(abs).mtime.toISOString(), source: 'mtime' };
}

function freshness(lastModified, source, extra = {}) {
  const ageDays = Math.max(0, (NOW - new Date(lastModified)) / 86400000);
  const decay = Math.pow(0.5, ageDays / HALF_LIFE_DAYS);
  const band = BANDS.find(b => ageDays < b.maxAgeDays).band;
  return {
    lastModified,
    source,
    ageDays: round(ageDays, 1),
    decay: round(decay, 4),
    band,
    ...extra,
  };
}

const round = (n, d) => Number(n.toFixed(d));

// ---------- text ----------

const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

function cleanInline(s) {
  return s
    .replace(/^[>\s]+/, '')
    .replace(/^[-*+]\s+/, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .trim();
}

// A "meta line" is the estate's `**Category:** principle` convention — a field, not prose.
const isMetaLine = l => /^\*\*[^*]{1,40}:\*\*/.test(l.trim());
const isStructural = l => {
  const t = l.trim();
  return !t || t.startsWith('#') || t.startsWith('|') || /^-{3,}$/.test(t) || t.startsWith('<!--');
};

// First meaningful line: prose beats bullets, bullets beat nothing, field lines never count.
function firstMeaningful(lines) {
  let bullet = null;
  for (const line of lines) {
    if (isStructural(line) || isMetaLine(line)) continue;
    const isBullet = /^\s*[-*+]\s+/.test(line);
    const text = cleanInline(line);
    if (!text) continue;
    if (!isBullet) return text;
    if (!bullet) bullet = text;
  }
  return bullet;
}

function excerptFor(id, raw) {
  if (!raw) return null;
  if (raw.length <= MAX_EXCERPT) return raw;
  const cut = raw.slice(0, MAX_EXCERPT);
  const kept = cut.slice(0, Math.max(cut.lastIndexOf(' '), MAX_EXCERPT - 40)).trimEnd();
  truncated.push({ nodeId: id, field: 'excerpt', originalChars: raw.length, keptChars: kept.length });
  return kept + '…';
}

// Minimal YAML: `key: value`, quoted scalars, and `- item` lists. Enough for vault/curated frontmatter.
function parseFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m) return { data: {}, body: text };
  const data = {};
  let key = null;
  for (const line of m[1].split(/\r?\n/)) {
    const list = /^\s*-\s+(.*)$/.exec(line);
    if (list && key) { (data[key] = Array.isArray(data[key]) ? data[key] : []).push(unquote(list[1])); continue; }
    const kv = /^([A-Za-z0-9_.-]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    key = kv[1];
    data[key] = kv[2] === '' ? [] : unquote(kv[2]);
  }
  return { data, body: text.slice(m[0].length) };
}

const unquote = s => s.trim().replace(/^['"](.*)['"]$/, '$1').replace(/^\[(.*)\]$/, (_, i) => i).trim();

// memory/vaults/*/*.jsonl is written without a record separator in places — objects sit concatenated
// on one physical line. Split on brace balance so real atoms are not lost to a missing newline.
function splitJsonRecords(text) {
  const out = [];
  let depth = 0, start = -1, inStr = false, esc = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') { inStr = true; continue; }
    if (c === '{') { if (depth++ === 0) start = i; }
    else if (c === '}' && depth && --depth === 0) { out.push(text.slice(start, i + 1)); start = -1; }
  }
  return { records: out, unterminated: depth !== 0 };
}

const DATE_RE = /(\d{4}-\d{2}-\d{2})/;

// Frontmatter and headings carry hand-typed dates; never trust one into `new Date().toISOString()`.
function isoOrNull(v) {
  if (!v) return null;
  const m = DATE_RE.exec(String(v));
  const d = new Date(m && String(v).length <= 10 ? `${m[1]}T00:00:00Z` : String(v));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// ---------- node/edge helpers ----------

const byId = new Map();

function addNode(n) {
  if (byId.has(n.id)) { skip(n.path || n.id, 'duplicate node id', { id: n.id }); return byId.get(n.id); }
  const node = {
    id: n.id,
    kind: n.kind,
    label: n.label,
    labelSource: n.labelSource,
    parent: n.parent ?? null,
    path: n.path ? rel(n.path) : null,
    excerpt: n.excerpt ?? null,
    counts: { atoms: 0, sections: 0, children: 0, ...(n.counts || {}) },
    bytes: n.bytes ?? null,
    freshness: n.freshness,
    attrs: n.attrs || {},
  };
  byId.set(node.id, node);
  nodes.push(node);
  if (node.parent) addEdge(node.parent, node.id, 'contains', 'structure');
  return node;
}

const edgeKeys = new Set();
function addEdge(source, target, kind, via, label) {
  const key = `${source}|${target}|${kind}|${via}`;
  if (edgeKeys.has(key)) return;
  edgeKeys.add(key);
  edges.push({ id: `e:${edges.length}`, source, target, kind, via, label: label ?? null });
}

// ---------- core ----------

addNode({
  id: 'core:starlight',
  kind: 'core',
  label: 'Starlight Memory',
  labelSource: 'literal',
  parent: null,
  freshness: freshness(NOW.toISOString(), 'generated'),
  attrs: { role: 'palace-center' },
});

// ---------- vaults (markdown) ----------

const vaultDir = join(MEM, 'vaults');
const vaultFiles = existsSync(vaultDir)
  ? readdirSync(vaultDir).filter(f => f.endsWith('-vault.md')).map(f => join(vaultDir, f))
  : [];

for (const abs of vaultFiles) {
  const text = readFileSync(abs, 'utf8');
  const { data, body } = parseFrontmatter(text);
  const name = data.vault || basename(abs).replace(/-vault\.md$/, '');
  const id = `vault:${slug(name)}`;
  const lines = body.split(/\r?\n/);

  const h1 = lines.find(l => /^# /.test(l));
  const fileFresh = fileFreshness(abs);
  const consolidated = isoOrNull(data.last_consolidated);

  const vault = addNode({
    id,
    kind: 'vault',
    label: h1 ? cleanInline(h1.replace(/^#\s*/, '')) : `${name} vault`,
    labelSource: h1 ? 'heading' : 'filename',
    parent: 'core:starlight',
    path: abs,
    bytes: Buffer.byteLength(text),
    excerpt: excerptFor(id, firstMeaningful(lines.slice(lines.indexOf(h1) + 1, lines.indexOf(h1) + 12))),
    freshness: freshness(fileFresh.lastModified, fileFresh.source, {
      lastConsolidated: consolidated ? consolidated.slice(0, 10) : null,
      consolidationAgeDays: consolidated ? round((NOW - new Date(consolidated)) / 86400000, 1) : null,
    }),
    attrs: {
      retention: data.retention || null,
      writers: data.writers || [],
      readers: data.readers || null,
    },
  });

  // Atoms are dated entries: `### [YYYY-MM-DD] Title` (canonical) and `## YYYY-MM-DD — Title`
  // (the drift form that operational/strategic vaults actually use). Undated headings are sections.
  let sections = 0;
  const heads = [];
  lines.forEach((line, i) => {
    const m = /^(#{2,3})\s+(.*)$/.exec(line);
    if (!m) return;
    const title = m[2].trim();
    const dated = /^\[(\d{4}-\d{2}-\d{2})\]/.exec(title) || (m[1] === '##' && /^(\d{4}-\d{2}-\d{2})\b/.exec(title));
    if (m[1] === '##') sections++;
    heads.push({ i, level: m[1].length, title, date: dated ? dated[1] : null });
  });

  heads.forEach((h, k) => {
    if (!h.date) return;
    const end = heads[k + 1] ? heads[k + 1].i : lines.length;
    const bodyLines = lines.slice(h.i + 1, end);
    const label = cleanInline(h.title.replace(/^\[\d{4}-\d{2}-\d{2}\]\s*[—–-]?\s*/, '').replace(/^\d{4}-\d{2}-\d{2}\s*[—–-]?\s*/, ''));
    const atomId = `atom:${slug(name)}:${h.date}:${slug(label) || k}`;
    if (byId.has(atomId)) return;

    const fields = {};
    for (const l of bodyLines) {
      const f = /^\*\*([^*]{1,40}):\*\*\s*(.*)$/.exec(l.trim());
      if (f) fields[slug(f[1])] = cleanInline(f[2]);
    }

    addNode({
      id: atomId,
      kind: 'atom',
      label: label || `${name} ${h.date}`,
      labelSource: 'heading',
      parent: id,
      path: abs,
      bytes: Buffer.byteLength(bodyLines.join('\n')),
      excerpt: excerptFor(atomId, firstMeaningful(bodyLines)),
      // The bracketed date is the atom's own authored date — a far sharper freshness signal
      // than the file's last commit, which one edit anywhere resets for every atom in the file.
      freshness: freshness(isoOrNull(h.date) || fileFresh.lastModified, isoOrNull(h.date) ? 'heading-date' : fileFresh.source),
      attrs: {
        category: fields.category || null,
        confidence: fields.confidence ? Number(fields.confidence) || fields.confidence : null,
        entrySource: fields.source || null,
        vault: name,
      },
    });

    // Cross-vault references. The vaults contain zero `[[wikilinks]]`; their real, literal
    // cross-reference convention is the `**Related:**` line. Both are parsed, and every edge
    // records which one it came from so a consumer can filter by provenance.
    for (const l of bodyLines) {
      for (const m of l.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) {
        pendingLinks.push({ from: atomId, raw: m[1].trim(), via: 'wikilink', path: abs });
      }
      const r = /^\*\*Related:\*\*\s*(.*)$/.exec(l.trim());
      if (r) for (const part of r[1].split(',')) {
        pendingLinks.push({ from: atomId, raw: part.trim(), via: 'related-line', path: abs });
      }
    }
  });

  vault.counts.sections = sections;
  sources.push({ path: rel(abs), kind: 'vault-markdown', lastModified: fileFresh.lastModified, freshnessSource: fileFresh.source });
}

// ---------- vault atom stores (jsonl) ----------

for (const abs of walk(vaultDir).filter(p => p.endsWith('.jsonl'))) {
  const name = basename(abs).replace(/\.jsonl$/, '');
  const vaultId = `vault:${slug(name)}`;
  if (!byId.has(vaultId)) {
    const f = fileFreshness(abs);
    addNode({
      id: vaultId, kind: 'vault', label: `${name} vault`, labelSource: 'filename',
      parent: 'core:starlight', path: abs, bytes: statSync(abs).size,
      freshness: freshness(f.lastModified, f.source), attrs: { retention: null, writers: [], readers: null, store: 'jsonl' },
    });
  }
  const text = readFileSync(abs, 'utf8');
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  const { records, unterminated } = splitJsonRecords(text);
  if (records.length > lines.length) {
    skip(abs, 'malformed ndjson: records concatenated without separator — recovered by brace-balance split',
      { physicalLines: lines.length, recoveredRecords: records.length });
  }
  if (unterminated) skip(abs, 'malformed ndjson: unterminated trailing object dropped');

  let n = 0, bad = 0;
  for (const line of records) {
    let rec;
    try { rec = JSON.parse(line); } catch { bad++; continue; }
    const atomId = `atom:${slug(name)}:${rec.id || `r${n}`}`;
    const created = isoOrNull(rec.createdAt || rec.temporal?.validFrom);
    const f = created ? { lastModified: created, source: 'record' } : fileFreshness(abs);
    addNode({
      id: atomId,
      kind: 'atom',
      label: cleanInline(String(rec.content || '').split(/[.\n]/)[0]).slice(0, 90) || atomId,
      labelSource: 'body',
      parent: vaultId,
      path: abs,
      bytes: Buffer.byteLength(line),
      excerpt: excerptFor(atomId, cleanInline(String(rec.content || ''))),
      freshness: freshness(f.lastModified, f.source),
      attrs: { category: rec.category || null, confidence: rec.confidence ?? null, tags: rec.tags || [], vault: name, store: 'jsonl' },
    });
    n++;
  }
  if (bad) skip(abs, 'unparseable jsonl records', { records: bad });
  sources.push({ path: rel(abs), kind: 'vault-jsonl', records: n });
}

// ---------- house namespaces ----------

for (const dir of existsSync(vaultDir) ? readdirSync(vaultDir).filter(d => statSync(join(vaultDir, d)).isDirectory()) : []) {
  const abs = join(vaultDir, dir);
  const ns = join(abs, 'namespace.json');
  const arcPath = join(abs, `${dir}.arc`);
  if (!existsSync(ns) && !existsSync(arcPath)) continue;
  let meta = {}, arc = {};
  try {
    meta = existsSync(ns) ? JSON.parse(readFileSync(ns, 'utf8')) : {};
    arc = existsSync(arcPath) ? JSON.parse(readFileSync(arcPath, 'utf8')) : {};
  } catch (e) { skip(abs, `unparseable house namespace: ${e.message}`); continue; }
  const f = fileFreshness(existsSync(ns) ? ns : arcPath);
  const created = isoOrNull(meta.created);
  addNode({
    id: `cluster:${slug(dir)}`,
    kind: 'cluster',
    label: meta.house || dir,
    labelSource: 'literal',
    parent: 'core:starlight',
    path: abs,
    freshness: freshness(created || f.lastModified, created ? 'record' : f.source),
    attrs: { store: meta.type || null, status: arc.status || null, seats: arc.seats ?? null, capabilities: arc.capabilities || [] },
  });
  sources.push({ path: rel(abs), kind: 'house-namespace' });
}

// ---------- atlases (obsidian canvas) ----------

const atlasDir = join(MEM, 'atlases');
for (const abs of existsSync(atlasDir) ? readdirSync(atlasDir).filter(f => f.endsWith('.canvas')).map(f => join(atlasDir, f)) : []) {
  let canvas;
  try { canvas = JSON.parse(readFileSync(abs, 'utf8')); } catch (e) { skip(abs, `unparseable canvas: ${e.message}`); continue; }
  const atlas = basename(abs).replace(/\.canvas$/, '');
  const atlasId = `cluster:atlas:${slug(atlas)}`;
  const f = fileFreshness(abs);
  addNode({
    id: atlasId, kind: 'cluster', label: atlas, labelSource: 'filename',
    parent: 'core:starlight', path: abs, bytes: statSync(abs).size,
    freshness: freshness(f.lastModified, f.source), attrs: { store: 'obsidian-canvas' },
  });

  const cnodes = canvas.nodes || [];
  const idOf = new Map();
  const groups = cnodes.filter(n => n.type === 'group');
  const area = g => (g.width || 0) * (g.height || 0);
  // Obsidian canvas has no explicit parent field — group membership is geometric containment.
  const containerOf = n => {
    const hits = groups.filter(g => g.id !== n.id
      && n.x >= g.x && n.y >= g.y
      && n.x + (n.width || 0) <= g.x + g.width
      && n.y + (n.height || 0) <= g.y + g.height);
    return hits.length ? hits.sort((a, b) => area(a) - area(b))[0] : null;
  };

  for (const n of [...groups, ...cnodes.filter(n => n.type !== 'group')]) {
    const parentGroup = containerOf(n);
    const parent = parentGroup ? `cluster:${slug(atlas)}:${slug(parentGroup.id)}` : atlasId;
    const raw = String(n.text || n.label || n.file || n.url || '').trim();
    const firstLine = cleanInline(raw.split(/\r?\n/).find(l => l.trim()) || '');
    const dated = DATE_RE.exec(raw);
    const nid = n.type === 'group'
      ? `cluster:${slug(atlas)}:${slug(n.id)}`
      : `atom:${slug(atlas)}:${slug(n.id)}`;
    idOf.set(n.id, nid);
    addNode({
      id: nid,
      kind: n.type === 'group' ? 'cluster' : 'atom',
      label: (n.label ? cleanInline(n.label) : firstLine.replace(/^#+\s*/, '')) || nid,
      labelSource: n.label ? 'canvas-label' : (n.file || n.url ? 'canvas-label' : 'body'),
      parent,
      path: abs,
      bytes: Buffer.byteLength(raw),
      excerpt: n.type === 'group' ? null : excerptFor(nid, cleanInline(raw.replace(/^#+\s*/, ''))),
      freshness: dated && isoOrNull(dated[1])
        ? freshness(isoOrNull(dated[1]), 'body-date')
        : freshness(f.lastModified, f.source),
      attrs: { atlas, canvasType: n.type, color: n.color ?? null, file: n.file || null },
    });
  }

  for (const e of canvas.edges || []) {
    const s = idOf.get(e.fromNode), t = idOf.get(e.toNode);
    if (!s || !t) { skip(abs, 'canvas edge with unresolved endpoint', { edge: e.id }); continue; }
    addEdge(s, t, 'composes', 'canvas-edge', e.label || null);
  }
  sources.push({ path: rel(abs), kind: 'obsidian-canvas', nodes: cnodes.length, edges: (canvas.edges || []).length, lastModified: f.lastModified, freshnessSource: f.source });
}

// ---------- curated recalls ----------

const curatedDir = join(MEM, 'curated');
const curatedFiles = existsSync(curatedDir) ? readdirSync(curatedDir).filter(f => f.endsWith('.md')).map(f => join(curatedDir, f)) : [];
if (curatedFiles.length) {
  const f0 = fileFreshness(curatedFiles[0]);
  addNode({
    id: 'cluster:curated', kind: 'cluster', label: 'Curated recalls', labelSource: 'literal',
    parent: 'core:starlight', path: curatedDir, freshness: freshness(f0.lastModified, f0.source),
    attrs: { store: 'markdown' },
  });
}
for (const abs of curatedFiles) {
  const text = readFileSync(abs, 'utf8');
  const { data, body } = parseFrontmatter(text);
  const id = `atom:curated:${slug(basename(abs, '.md'))}`;
  const lines = body.split(/\r?\n/);
  const recalled = isoOrNull(data.recalled_at);
  const f = recalled ? { lastModified: recalled, source: 'frontmatter' } : fileFreshness(abs);
  addNode({
    id, kind: 'atom', label: data.title || basename(abs, '.md'),
    labelSource: data.title ? 'frontmatter' : 'filename',
    parent: 'cluster:curated', path: abs, bytes: Buffer.byteLength(text),
    excerpt: excerptFor(id, firstMeaningful(lines)),
    freshness: freshness(f.lastModified, f.source),
    attrs: { tags: data.tags ? String(data.tags).split(/,\s*/) : [], atomCount: data.atom_count ?? null, entrySource: data.source || null },
  });
  for (const m of text.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) {
    pendingLinks.push({ from: id, raw: m[1].trim(), via: 'wikilink', path: abs });
  }
  sources.push({ path: rel(abs), kind: 'curated' });
}

// ---------- verticals ----------

const verticalsPath = join(ROOT, 'VERTICALS.md');
if (existsSync(verticalsPath)) {
  const text = readFileSync(verticalsPath, 'utf8');
  const lines = text.split(/\r?\n/);
  const f = fileFreshness(verticalsPath);
  let section = null;
  let current = null;
  const flush = () => {
    if (!current) return;
    const id = `vertical:${slug(current.name)}`;
    addNode({
      id, kind: 'vertical', label: current.name, labelSource: 'heading',
      parent: 'core:starlight', path: verticalsPath,
      bytes: Buffer.byteLength(current.lines.join('\n')),
      excerpt: excerptFor(id, current.fields.domain || firstMeaningful(current.lines)),
      freshness: freshness(f.lastModified, f.source),
      attrs: {
        section: current.section,
        class: current.fields.class || null,
        status: current.fields.status || null,
        owner: current.fields.owner || null,
        publicSurface: current.fields['public-surface'] || null,
        primaryRepo: current.fields['primary-repo'] || null,
      },
    });
    current = null;
  };
  for (const line of lines) {
    const h2 = /^##\s+(.*)$/.exec(line);
    if (h2) { flush(); section = cleanInline(h2[1]); continue; }
    const h3 = /^###\s+(.*)$/.exec(line);
    if (h3) { flush(); current = { name: cleanInline(h3[1]), section, lines: [], fields: {} }; continue; }
    if (!current) continue;
    current.lines.push(line);
    const fm = /^-\s+\*\*([^*]+):\*\*\s*(.*)$/.exec(line.trim());
    if (fm) current.fields[slug(fm[1])] = cleanInline(fm[2]);
  }
  flush();
  sources.push({ path: rel(verticalsPath), kind: 'verticals', lastModified: f.lastModified, freshnessSource: f.source });
}

// ---------- resolve reference edges ----------

// Index every node by label and id fragment so declared references resolve to real nodes only.
const labelIndex = new Map();
for (const n of nodes) {
  for (const key of [n.id, n.label, n.label?.replace(/\s+vault$/i, ''), n.path && basename(n.path)]) {
    if (!key) continue;
    const k = slug(key);
    if (k && !labelIndex.has(k)) labelIndex.set(k, n.id);
  }
}
for (const v of DATED_VAULTS) {
  if (byId.has(`vault:${v}`)) { labelIndex.set(slug(`${v} vault`), `vault:${v}`); labelIndex.set(slug(`${v}-vault`), `vault:${v}`); }
}

for (const link of pendingLinks) {
  // Related lines list mixed targets (file paths, image names, vault names). Only resolve what
  // maps onto a node that actually exists — everything else is recorded, never invented.
  const candidates = [link.raw, link.raw.split(/\s+[-—–(]/)[0], /([a-z]+)[- ]vault/i.exec(link.raw)?.[0]]
    .filter(Boolean).map(slug).filter(Boolean);
  const hit = candidates.map(c => labelIndex.get(c)).find(Boolean);
  if (!hit || hit === link.from) { skip(link.path, `unresolved ${link.via} reference`, { from: link.from, target: link.raw.slice(0, 80) }); continue; }
  addEdge(link.from, hit, 'references', link.via, link.raw.slice(0, 80));
}

// ---------- structural counts ----------

for (const n of nodes) {
  if (!n.parent) continue;
  const p = byId.get(n.parent);
  if (!p) continue;
  p.counts.children++;
  if (n.kind === 'atom') p.counts.atoms++;
}

// ---------- redaction ----------

if (REDACT) {
  for (const n of nodes) {
    n.excerpt = null;
    // A body-derived label IS vault text (canvas text nodes and jsonl atoms have no title).
    if (n.labelSource === 'body') { n.label = `${n.kind}·${n.id.split(':').pop()}`; n.labelSource = 'redacted'; }
    if (n.attrs?.entrySource) n.attrs.entrySource = null;
  }
  for (const e of edges) if (e.via === 'related-line' || e.via === 'wikilink') e.label = null;
  for (const s of skipped) if (s.target) s.target = null;
}

// ---------- meta ----------

const tally = (arr, key) => arr.reduce((a, x) => (a[key(x)] = (a[key(x)] || 0) + 1, a), {});
const atomsByVault = {};
for (const n of nodes) if (n.kind === 'atom' && n.parent) atomsByVault[n.parent] = (atomsByVault[n.parent] || 0) + 1;

const graph = {
  $schema: 'starlight/memory-graph@1',
  meta: {
    generatedAt: NOW.toISOString(),
    generator: 'tools/gen-memory-graph.mjs',
    schemaVersion: 1,
    repo: basename(ROOT),
    sourceRoot: REDACT ? 'memory' : ROOT.replace(/\\/g, '/'),
    redacted: REDACT,
    redaction: {
      strippedFields: REDACT ? ['node.excerpt', 'node.label(labelSource=body)', 'node.attrs.entrySource', 'edge.label(references)', 'meta.skipped[].target', 'meta.sourceRoot'] : [],
      note: 'Redacted output carries structure, labels, counts and freshness only. Safe for public surfaces.',
    },
    freshness: {
      asOf: NOW.toISOString(),
      halfLifeDays: HALF_LIFE_DAYS,
      decay: 'decay = 0.5 ^ (ageDays / halfLifeDays); 1 = written today, 0.5 = one half-life old',
      bands: BANDS.map(b => ({ band: b.band, maxAgeDays: b.maxAgeDays === Infinity ? null : b.maxAgeDays })),
      bandsDerivedFrom: 'memory/bases/decay-watch.base (>30d review, >90d consolidate)',
      sourcePrecedence: ['record', 'heading-date', 'body-date', 'frontmatter', 'git', 'mtime'],
      note: 'git commit date beats fs mtime: inside a worktree every mtime is checkout time.',
    },
    counts: {
      nodes: nodes.length,
      nodesByKind: tally(nodes, n => n.kind),
      edges: edges.length,
      edgesByKind: tally(edges, e => e.kind),
      edgesByVia: tally(edges, e => e.via),
      atomsByParent: atomsByVault,
      bands: tally(nodes, n => n.freshness.band),
    },
    sources,
    skipped,
    truncated,
  },
  nodes,
  edges,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(graph, null, 2) + '\n');

if (!QUIET) {
  const c = graph.meta.counts;
  console.log(`Wrote ${rel(OUT)}${REDACT ? ' (redacted)' : ''} — ${c.nodes} nodes, ${c.edges} edges.`);
  console.log('  by kind :', JSON.stringify(c.nodesByKind));
  console.log('  by edge :', JSON.stringify(c.edgesByKind), JSON.stringify(c.edgesByVia));
  console.log('  freshness:', JSON.stringify(c.bands));
  console.log(`  skipped : ${skipped.length}   truncated: ${truncated.length}`);
}
