#!/usr/bin/env node
// Atlas index builder: vault markdown -> atlas.json + atlas.sql (D1 schema, rows, FTS5).
// Default deny: only ALLOWED_DIRS are read, and any note marked secret/private is dropped.
// Usage: node build.mjs --vault <dir> --out <dir>
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, basename, relative, sep } from 'node:path';

export const ALLOWED_DIRS = ['patterns', 'people', 'decisions', 'ideas', '_meta'];
const BLOCKED_PRIVACY = new Set(['secret', 'private']);
const MAX_BODY = 200_000; // D1 rows cap at 2 MB; stay far below
const WIKILINK = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g;

export function parseFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!m) return { meta: {}, body: text };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line); // top-level keys only; nested blocks are skipped
    if (!kv) continue;
    const raw = kv[2].trim();
    meta[kv[1]] = raw.startsWith('[') && raw.endsWith(']')
      ? raw.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean)
      : raw.replace(/^["']|["']$/g, '');
  }
  return { meta, body: text.slice(m[0].length) };
}

export function extractLinks(body) {
  return [...new Set([...body.matchAll(WIKILINK)].map((x) => x[1].trim()))];
}

export function firstParagraph(body) {
  const para = body.split(/\r?\n\s*\r?\n/).map((p) => p.trim()).find((p) => p && !p.startsWith('#') && !p.startsWith('---'));
  return (para ?? '').replace(/\s+/g, ' ').slice(0, 240);
}

export function isBlocked(meta) {
  return BLOCKED_PRIVACY.has(String(meta.privacy_class ?? '').toLowerCase());
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (name.endsWith('.md')) yield p;
  }
}

export function collectNotes(vault) {
  const notes = [];
  let blocked = 0;
  for (const top of ALLOWED_DIRS) {
    let files;
    try { files = [...walk(join(vault, top))]; } catch { continue; }
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      const { meta, body } = parseFrontmatter(text);
      if (isBlocked(meta)) { blocked++; continue; }
      const path = relative(vault, file).split(sep).join('/');
      notes.push({
        path,
        title: basename(file, '.md'),
        type: meta.type ?? '',
        status: meta.status ?? '',
        updated: String(meta.updated ?? meta.created ?? ''),
        tags: Array.isArray(meta.tags) ? meta.tags : [],
        l0: firstParagraph(body),
        hash: createHash('sha256').update(text).digest('hex').slice(0, 16),
        body: body.slice(0, MAX_BODY),
        rawLinks: extractLinks(body),
      });
    }
  }
  return { notes, blocked };
}

export function resolveGraph(notes) {
  const byTitle = new Map(notes.map((n) => [n.title.toLowerCase(), n.path]));
  const edges = [];
  const unresolved = [];
  for (const n of notes) {
    for (const t of n.rawLinks) {
      const to = byTitle.get(t.toLowerCase());
      if (to) edges.push({ from: n.path, to });
      else unresolved.push({ from: n.path, target: t });
    }
  }
  const linked = new Set(edges.flatMap((e) => [e.from, e.to]));
  const orphans = notes.filter((n) => !linked.has(n.path)).map((n) => n.path);
  return { edges, unresolved, orphans };
}

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

export function toSql(notes, edges) {
  const out = [
    'DROP TABLE IF EXISTS notes_fts; DROP TABLE IF EXISTS links; DROP TABLE IF EXISTS notes;',
    'CREATE TABLE notes (path TEXT PRIMARY KEY, title TEXT, type TEXT, status TEXT, updated TEXT, tags TEXT, l0 TEXT, hash TEXT, body TEXT);',
    'CREATE TABLE links (src TEXT, dst TEXT);',
    'CREATE VIRTUAL TABLE notes_fts USING fts5(title, l0, body, content=notes, content_rowid=rowid);',
  ];
  for (const n of notes) {
    out.push(`INSERT INTO notes VALUES (${[n.path, n.title, n.type, n.status, n.updated, n.tags.join(','), n.l0, n.hash, n.body].map(q).join(',')});`);
  }
  for (const e of edges) out.push(`INSERT INTO links VALUES (${q(e.from)},${q(e.to)});`);
  out.push("INSERT INTO notes_fts(notes_fts) VALUES('rebuild');");
  return out.join('\n') + '\n';
}

export function build(vault, outDir) {
  const { notes, blocked } = collectNotes(vault);
  const graph = resolveGraph(notes);
  mkdirSync(outDir, { recursive: true });
  const slim = notes.map(({ body, rawLinks, ...rest }) => rest);
  writeFileSync(join(outDir, 'atlas.json'), JSON.stringify({ notes: slim, ...graph }, null, 2));
  writeFileSync(join(outDir, 'atlas.sql'), toSql(notes, graph.edges));
  return { notes: notes.length, blocked, edges: graph.edges.length, unresolved: graph.unresolved.length, orphans: graph.orphans.length };
}

if (process.argv[1] && process.argv[1].endsWith('build.mjs')) {
  const arg = (k) => process.argv[process.argv.indexOf(k) + 1];
  if (!process.argv.includes('--vault') || !process.argv.includes('--out')) {
    console.error('usage: node build.mjs --vault <dir> --out <dir>');
    process.exit(2);
  }
  console.log(JSON.stringify(build(arg('--vault'), arg('--out'))));
}
