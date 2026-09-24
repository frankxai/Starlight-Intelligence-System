#!/usr/bin/env node
// agent-ontology.mjs — the scanner every agent-graph projection in the estate reads from.
//
// Several agent-definition formats exist in this estate (SIS agent markdown, Claude Code subagent
// markdown and JSON, department markdown, GitHub Copilot agent markdown, Arcanea YAML teams,
// Starlight Agent Card JSON, forge specs/registry — the atlas counts them, this comment does not)
// plus two identity layers (constitutions, SOUL.md) and three skill formats
// (SKILL.md, skill-rules.json, skills registry). None of them can see the others, which is how
// the same capability came to be defined five times and routed three ways. This module reads all
// of them into ONE normalized record with provenance, so a single generator can project the
// Foundry capability graph, the atlas, harness-native agent files and the router from real files
// instead of from another hand-maintained registry.
//
// Zero dependencies on purpose (same posture as tools/*.mjs and AIS lib/ais): a discovery layer
// that needs an install is not the first thing an agent can reach for.
//
//   node tools/lib/agent-ontology.mjs --stats [--json]     measure the estate (never hand-type these)
//   node tools/lib/agent-ontology.mjs --dump <id>          print one normalized record

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, basename, dirname, relative, resolve, sep } from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import os from 'node:os'

// In SIS this package defaults to the checked-out repository. An operator may explicitly
// point it at a multi-repo estate; home directories require a second, separate opt-in.
const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const EXTERNAL_ESTATE = Boolean(process.env.STARLIGHT_ESTATE)
export const ESTATE = EXTERNAL_ESTATE ? resolve(process.env.STARLIGHT_ESTATE) : PACKAGE_ROOT
export const HOME = os.homedir()
const REPOS = join(ESTATE, 'repos')
const SCAN_HOME = EXTERNAL_ESTATE && process.env.STARLIGHT_SCAN_HOME === '1'
export const HOME_SCAN_ENABLED = SCAN_HOME

// Directories that hold copies of live trees (worktrees, sandboxes, vendored packages). Scanning
// them double-counts every agent and, worse, reads a stale fork as if it were canon.
const SKIP_DIRS = new Set(['node_modules', '.git', '.worktrees', '.hermes-worktrees', '.codex-worktrees', '.kilo', 'dist', 'compiled-dist', 'marketplace-dist', 'packages-dist', 'test-sandbox-v13', 'test-sandbox-v14', 'worktrees', '_archive', 'archive', 'skills-retired'])

export const SOURCE_KINDS = [
  'sis-agent-md',        // repos/Starlight-Intelligence-System/agents/**/*.md  (name/tier/domain/voice)
  'claude-subagent-md',  // .claude/agents/**/*.md                             (name/description/model/tools)
  'claude-subagent-json',// .claude/agents/*.json
  'copilot-agent-md',    // .github/agents/*.agent.md
  'yaml-team',           // .arcanea/agents/*.yaml                             (team + roles)
  'agent-card-json',     // starlight-agent-army-architecture/cards/**/*.json  (identity/mind/will/body)
  'forge-registry',      // ops/agent-factory/REGISTRY.json + specs/*.json
  'constitution-md',     // starlight-agent-config/agent-constitution/*.md
  'department-md',       // agentic-creator-os/departments/*/agent.md
  'skill-md',            // **/SKILL.md
  'skill-rule',          // Starlight-Intelligence-System/skills/skill-rules.json
]

export const ESTATES = {
  sis:     { root: EXTERNAL_ESTATE ? join(REPOS, 'Starlight-Intelligence-System') : PACKAGE_ROOT, brand: 'starlight' },
  acos:    { root: join(REPOS, 'agentic-creator-os'),            brand: 'frankx' },
  arcanea: { root: join(REPOS, 'arcanea-ai-app'),                brand: 'arcanea' },
  global:  { root: join(HOME, '.claude'),                        brand: 'starlight' },
  army:    { root: join(REPOS, 'starlight-agent-army-architecture'), brand: 'starlight' },
  factory: { root: join(ESTATE, 'ops', 'agent-factory'),         brand: 'starlight' },
  config:  { root: join(REPOS, 'starlight-agent-config'),        brand: 'starlight' },
  // Skill-only estates: the runtimes other harnesses load skills from. Agents there are
  // profiles, not files, so only SKILL.md dirs are read.
  hermes:  { root: join(process.env.LOCALAPPDATA || join(HOME, 'AppData', 'Local'), 'hermes'), brand: 'starlight' },
  codex:   { root: join(HOME, '.codex'),                         brand: 'starlight' },
  agents:  { root: join(HOME, '.agents'),                        brand: 'starlight' },
}

// ------------------------------------------------------------------ small parsers

const stripQuotes = (s) => s.replace(/^["'](.*)["']$/s, '$1')

function scalar(v) {
  const t = v.trim()
  if (t === '') return ''
  if (/^\[.*\]$/.test(t)) return t.slice(1, -1).split(',').map((x) => stripQuotes(x.trim())).filter(Boolean)
  if (t === 'true') return true
  if (t === 'false') return false
  if (t === 'null' || t === '~') return null
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t)
  return stripQuotes(t)
}

// Indentation-based YAML subset: maps, sequences of scalars or maps, block scalars (| and >),
// inline lists. That is the whole grammar the estate's frontmatter and team files use. A real
// YAML parser would be the module's only dependency, and the corpus does not need anchors,
// tags, or flow maps.
export function parseYamlSubset(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  let i = 0
  const indentOf = (l) => l.match(/^ */)[0].length
  const isBlank = (l) => l.trim() === '' || l.trim().startsWith('#')

  function block(indent) {
    // Decide container type from the first significant line.
    while (i < lines.length && isBlank(lines[i])) i++
    if (i >= lines.length) return null
    const first = lines[i]
    if (indentOf(first) < indent) return null
    return first.trim().startsWith('- ') || first.trim() === '-' ? seq(indentOf(first)) : map(indentOf(first))
  }

  function blockScalar(indent, fold) {
    const buf = []
    while (i < lines.length && (isBlank(lines[i]) || indentOf(lines[i]) > indent)) { buf.push(lines[i].trim() === '' ? '' : lines[i].slice(Math.min(indent + 2, indentOf(lines[i])))); i++ }
    while (buf.length && buf[buf.length - 1] === '') buf.pop()
    return fold ? buf.join(' ').replace(/ {2,}/g, ' ').trim() : buf.join('\n')
  }

  function value(rest, indent) {
    const t = rest.trim()
    if (/^[|>][-+]?$/.test(t)) return blockScalar(indent, t.startsWith('>'))
    if (t === '') { const nested = block(indent + 1); return nested === null ? '' : nested }
    return scalar(t)
  }

  function map(indent) {
    const out = {}
    while (i < lines.length) {
      const l = lines[i]
      if (isBlank(l)) { i++; continue }
      const ind = indentOf(l)
      if (ind < indent) break
      if (ind > indent) { i++; continue }               // stray deeper line without a key: skip
      const m = l.match(/^ *([^:#][^:]*?):(?:\s+(.*))?$/)
      if (!m) { if (l.trim().startsWith('- ')) break; i++; continue }
      i++
      out[m[1].trim()] = value(m[2] ?? '', indent)
    }
    return out
  }

  function seq(indent) {
    const out = []
    while (i < lines.length) {
      const l = lines[i]
      if (isBlank(l)) { i++; continue }
      const ind = indentOf(l)
      if (ind < indent) break
      if (ind > indent) { i++; continue }
      const m = l.match(/^ *-(?:\s+(.*))?$/)
      if (!m) break
      const rest = (m[1] ?? '').trim()
      i++
      if (rest === '') { out.push(block(indent + 1)); continue }
      const kv = rest.match(/^([^:#][^:]*?):(?:\s+(.*))?$/)
      if (kv && !/^["']/.test(rest)) {
        // "- key: value" starts an inline map whose siblings sit at indent+2
        const obj = {}
        obj[kv[1].trim()] = value(kv[2] ?? '', indent + 2)
        Object.assign(obj, map(indent + 2))
        out.push(obj)
      } else out.push(scalar(rest))
    }
    return out
  }

  return block(0) ?? {}
}

export function parseFrontmatter(text) {
  const m = text.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) return { fm: {}, body: text, hasFrontmatter: false }
  let fm = {}
  try { fm = parseYamlSubset(m[1]) || {} } catch { fm = {} }
  if (Array.isArray(fm)) fm = {}
  return { fm, body: text.slice(m[0].length), hasFrontmatter: true }
}

export const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)
export const tokens = (s) => Math.ceil((s || '').length / 4)
const asList = (v) => (v == null || v === '' ? [] : Array.isArray(v) ? v.map(String) : typeof v === 'string' ? v.split(',').map((x) => x.trim()).filter(Boolean) : [String(v)])
const rel = (p) => (p.startsWith(ESTATE) ? relative(ESTATE, p) : p.startsWith(HOME) ? '~' + p.slice(HOME.length) : p).split(sep).join('/')
const slug = (s) => String(s).toLowerCase().replace(/^@/, '').replace(/\.agent$/, '').replace(/[^a-z0-9/-]+/g, '-').replace(/^-+|-+$/g, '')
const headings = (body) => [...body.matchAll(/^#{1,3}\s+(.+)$/gm)].map((m) => m[1].trim())
const section = (body, name) => { const m = body.match(new RegExp(`^#{1,3}\\s+${name}[^\\n]*\\n([\\s\\S]*?)(?=^#{1,3}\\s|\\Z)`, 'im')); return m ? m[1].trim() : '' }

function walk(dir, { maxDepth = 6, ext = null } = {}, out = [], depth = 0) {
  if (!existsSync(dir) || depth > maxDepth) return out
  let entries = []
  try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return out }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name) || e.name.startsWith('.worktrees')) continue
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p, { maxDepth, ext }, out, depth + 1)
    else if (!ext || e.name.endsWith(ext)) out.push(p)
  }
  return out
}

// ------------------------------------------------------------------ record

const RANK_BY_PREFIX = [[/^exec-/, 'executive'], [/^steward-/, 'general'], [/^corps-/, 'corps'], [/^partner-/, 'specialist'], [/^prompt-/, 'specialist'], [/^meta-/, 'meta'], [/^acms-|^agency-/, 'specialist']]
const inferRank = (name, fm = {}) => fm.rank || fm.kind || (RANK_BY_PREFIX.find(([re]) => re.test(name)) || [])[1] || null

function record(base) {
  const r = {
    id: base.id, kind: base.kind, name: base.name, estate: base.estate, brand: base.brand,
    sourceRef: base.sourceRef, sourceKind: base.sourceKind, contentHash: base.contentHash, tokenEstimate: base.tokenEstimate, mtime: base.mtime,
    identity: { displayName: base.displayName || base.name, tagline: base.tagline || '', voice: base.voice || '', values: base.values || [], boundaries: base.boundaries || [], soulRef: base.soulRef || null },
    mind:     { skills: base.skills || [], kb: base.kb || [], memoryScope: base.memoryScope || null, approach: base.approach || '' },
    will:     { toolsAllow: base.toolsAllow || [], toolsDeny: base.toolsDeny || [], humanGates: base.humanGates || [], handoffs: base.handoffs || [], mcpServers: base.mcpServers || [] },
    body:     { model: base.model || null, surfaces: base.surfaces || [], harness: base.harness || null, workingDirectories: base.workingDirectories || [] },
    routing:  { description: base.description || '', keywords: base.keywords || [], intents: base.intents || [], files: base.files || [], verbs: base.verbs || [], domain: base.domain || null, tier: base.tier || null, rank: base.rank || null, status: base.status || null, verifier: base.verifier || null },
    provenance: { scanned: true, lifecycle: base.lifecycle || 'active', family: base.family || null, headings: base.headings || [], body: base.body || null },
  }
  return r
}

// Forge-rendered descriptions carry their applicability inline ("Auto-invoke on: a, b, or c";
// "Use when ..."). Lifting those clauses into explicit intents lets a router weight them as
// triggers instead of as prose, which is the difference between a match and a guess.
export function triggersFromDescription(desc) {
  const text = String(desc || '')
  const intents = []
  const m = text.match(/auto-?invoke on:\s*([^.]+)/i)
  if (m) for (const part of m[1].split(/,|\bor\b/)) { const p = part.replace(/^(any|or)\s+/i, '').trim().replace(/[."']+$/, ''); if (p && p.length <= 60) intents.push(p.toLowerCase()) }
  const u = text.match(/\buse (?:when|for|before|after) ([^.]+)/i)
  if (u) for (const part of u[1].split(/,|\bor\b/)) { const p = part.trim().replace(/[."']+$/, ''); if (p && p.length <= 60) intents.push(p.toLowerCase()) }
  return [...new Set(intents)]
}

// ------------------------------------------------------------------ source adapters

function fromClaudeMd(file, estate, brand, sourceKind = 'claude-subagent-md') {
  const text = readFileSync(file, 'utf8')
  const { fm, body, hasFrontmatter } = parseFrontmatter(text)
  const name = slug(fm.name || basename(file).replace(/\.agent\.md$|\.md$/, ''))
  const fam = basename(dirname(file))
  return record({
    id: `agent:${estate}/${name}`, kind: 'agent', name, estate, brand: fm.brand || brand,
    sourceRef: rel(file), sourceKind, contentHash: sha(text), tokenEstimate: tokens(text), mtime: statSync(file).mtime.toISOString(),
    displayName: fm.name || name, description: String(fm.description || ''), voice: section(body, 'Voice') || String(fm.voice || ''),
    model: fm.model ? String(fm.model) : null, toolsAllow: asList(fm.tools), toolsDeny: asList(fm.disallowedTools),
    mcpServers: asList(fm.mcpServers), workingDirectories: asList(fm.workingDirectories),
    skills: asList(fm.skills), rank: inferRank(name, fm), tier: fm.tier || null, domain: fm.domain || null, status: fm.status || null,
    keywords: asList(fm.triggers?.keywords ?? fm.keywords), intents: [...asList(fm.triggers?.intents), ...triggersFromDescription(fm.description)], files: asList(fm.triggers?.files),
    harness: sourceKind === 'copilot-agent-md' ? 'github-copilot' : 'claude-code',
    family: ['core', 'hive-mind', 'consensus', 'architecture', 'analysis', 'development', 'devops', 'documentation', 'github', 'goal', 'data', 'custom'].includes(fam) ? fam : null,
    headings: headings(body).slice(0, 12), lifecycle: hasFrontmatter ? 'active' : 'draft', body: body.trim(),
    verifier: /maker\s*[≠!]=\s*checker|verifier/i.test(body) ? (section(body, 'Maker') || section(body, 'Verifier') || 'declared') : null,
  })
}

function fromSisMd(file) {
  const text = readFileSync(file, 'utf8')
  const { fm, body } = parseFrontmatter(text)
  const name = slug(fm.name || basename(file, '.md'))
  return record({
    id: `agent:sis/${name}`, kind: 'agent', name, estate: 'sis', brand: 'starlight',
    sourceRef: rel(file), sourceKind: 'sis-agent-md', contentHash: sha(text), tokenEstimate: tokens(text), mtime: statSync(file).mtime.toISOString(),
    displayName: (body.match(/^#\s+(.+)$/m) || [])[1] || name, description: String(fm.description || fm.voice || ''), voice: String(fm.voice || ''),
    tier: fm.tier || null, domain: fm.domain || null, status: fm.status || null, rank: fm.tier || null,
    keywords: asList(fm.triggers?.keywords ?? fm.triggers), intents: asList(fm.triggers?.intents), files: asList(fm.triggers?.files),
    skills: [...section(body, 'Active Skills').matchAll(/`([^`]+)`/g)].map((m) => m[1]),
    harness: 'sis', headings: headings(body).slice(0, 12), family: basename(dirname(file)) === 'council' ? 'council' : null, body: body.trim(),
  })
}

function fromAgentCard(file) {
  const text = readFileSync(file, 'utf8')
  let c; try { c = JSON.parse(text) } catch { return null }
  if (!c || !c.id || !c.identity) return null
  const name = slug(c.id)
  return record({
    id: `agent:army/${name}`, kind: c.tier === 'swarm-cell' ? 'team' : 'agent', name, estate: 'army', brand: c.brand || 'starlight',
    sourceRef: rel(file), sourceKind: 'agent-card-json', contentHash: sha(text), tokenEstimate: tokens(text), mtime: statSync(file).mtime.toISOString(),
    displayName: c.identity.display_name, tagline: c.identity.tagline, voice: c.identity.voice, values: c.identity.values, boundaries: c.identity.boundaries,
    soulRef: c.identity.soul_md ? rel(join(dirname(file), '..', '..', c.identity.soul_md)) : null,
    skills: c.mind?.skills, kb: [...(c.mind?.public_kb || []), ...(c.mind?.private_kb || [])], memoryScope: c.mind?.memory_scope, approach: c.mind?.approach,
    toolsAllow: c.will?.tools_allow, toolsDeny: c.will?.tools_deny, humanGates: c.will?.human_gates, handoffs: (c.will?.handoffs || []).map((h) => ({ to: h.to, when: h.when })),
    surfaces: c.body?.surfaces, model: c.body?.default_model_policy || null, harness: 'multi',
    tier: c.tier, rank: c.tier, status: c.status, description: c.identity.tagline, lifecycle: c.status || 'active',
  })
}

// Arcanea binds roles to Guardians and Gates; the Lumina queen's own route table is what makes a
// gate routable (Fire → engineering, Sight → research ...). Kept here so a yaml role compiles to a
// description a router can match, not just a mythic label.
const GATE_DOMAIN = { foundation: 'infrastructure', flow: 'design', fire: 'engineering', heart: 'narrative', voice: 'documentation', sight: 'research', crown: 'strategy', starweave: 'migration', unity: 'coordination', source: 'meta-evaluation' }

function fromYamlTeam(file) {
  const text = readFileSync(file, 'utf8')
  let y; try { y = parseYamlSubset(text) } catch { return [] }
  const out = []
  const teamName = slug(y.team?.name || basename(file, '.yaml'))
  out.push(record({
    id: `team:arcanea/${teamName}`, kind: 'team', name: teamName, estate: 'arcanea', brand: 'arcanea',
    sourceRef: rel(file), sourceKind: 'yaml-team', contentHash: sha(text), tokenEstimate: tokens(text), mtime: statSync(file).mtime.toISOString(),
    displayName: y.team?.name || teamName, description: y.team?.mission || '', domain: y.team?.gate || null, approach: y.team?.mission,
    handoffs: (y.roles || []).map((r) => ({ to: slug(r.id || r.name), when: r.type || 'member' })),
  }))
  for (const r of y.roles || []) {
    const name = slug(r.id || r.name)
    out.push(record({
      id: `agent:arcanea/${name}`, kind: 'agent', name, estate: 'arcanea', brand: 'arcanea',
      sourceRef: `${rel(file)}#${r.id}`, sourceKind: 'yaml-team', contentHash: sha(JSON.stringify(r)), tokenEstimate: tokens(JSON.stringify(r)), mtime: statSync(file).mtime.toISOString(),
      displayName: r.name, description: (r.responsibilities || []).join('; '), model: r.model || null, tier: r.type || null, rank: r.type || null,
      domain: GATE_DOMAIN[String(r.gate || '').toLowerCase()] || r.gate || null, keywords: [String(r.gate || '').toLowerCase(), GATE_DOMAIN[String(r.gate || '').toLowerCase()]].filter(Boolean),
      voice: r.guardian ? `Guardian ${r.guardian} (${r.gate} gate)` : '', approach: r.agent_type || '', files: asList(r.focus_packages || r.focus),
      handoffs: [{ to: `team:arcanea/${teamName}`, when: 'reports-to' }], harness: 'multi',
    }))
  }
  return out
}

function fromForge() {
  const reg = join(ESTATES.factory.root, 'REGISTRY.json')
  if (!existsSync(reg)) return []
  const text = readFileSync(reg, 'utf8')
  let d; try { d = JSON.parse(text) } catch { return [] }
  const out = []
  for (const [name, row] of Object.entries(d.agents || {})) {
    const specFile = join(ESTATES.factory.root, 'specs', `${name}.json`)
    let spec = {}
    if (existsSync(specFile)) { try { spec = JSON.parse(readFileSync(specFile, 'utf8')) } catch {} }
    out.push(record({
      id: `agent:factory/${slug(name)}`, kind: 'agent', name: slug(name), estate: 'factory', brand: 'starlight',
      sourceRef: existsSync(specFile) ? rel(specFile) : rel(reg), sourceKind: 'forge-registry', contentHash: sha(JSON.stringify(row) + JSON.stringify(spec)), tokenEstimate: tokens(JSON.stringify(spec)), mtime: statSync(existsSync(specFile) ? specFile : reg).mtime.toISOString(),
      displayName: spec.title || name, description: spec.description || '', model: row.model || spec.model || null, toolsAllow: asList(row.tools || spec.tools),
      rank: row.kind || spec.kind, tier: row.kind || spec.kind, domain: row.domain || spec.domain, verifier: row.verifier || spec.verifier || null,
      boundaries: asList(spec.boundaries), values: asList(spec.refusals), approach: spec.mission || '', kb: asList(spec.ssot), harness: 'claude-code', status: row.status || 'standing',
    }))
  }
  return out
}

function fromConstitutions() {
  const dir = join(ESTATES.config.root, 'agent-constitution')
  return walk(dir, { maxDepth: 1, ext: '.md' }).map((file) => {
    const text = readFileSync(file, 'utf8')
    const name = slug(basename(file, '.md'))
    const meta = Object.fromEntries([...text.matchAll(/^(Status|Audience|Layer):\s*(.+)$/gm)].map((m) => [m[1].toLowerCase(), m[2].trim()]))
    return record({
      id: `constitution:config/${name}`, kind: 'constitution', name, estate: 'config', brand: /arcanea/i.test(name) ? 'arcanea' : /frankx/i.test(name) ? 'frankx' : 'starlight',
      sourceRef: rel(file), sourceKind: 'constitution-md', contentHash: sha(text), tokenEstimate: tokens(text), mtime: statSync(file).mtime.toISOString(),
      displayName: (text.match(/^#\s+(.+)$/m) || [])[1] || name, description: meta.audience || '', approach: section(text, 'Role'), tier: meta.layer || null, status: meta.status || null, headings: headings(text),
    })
  })
}

function fromSkillMd(file, estate, brand) {
  const text = readFileSync(file, 'utf8')
  const { fm } = parseFrontmatter(text)
  const name = slug(fm.name || basename(dirname(file)))
  return record({
    id: `skill:${estate}/${name}`, kind: 'skill', name, estate, brand,
    sourceRef: rel(file), sourceKind: 'skill-md', contentHash: sha(text), tokenEstimate: tokens(text), mtime: statSync(file).mtime.toISOString(),
    displayName: fm.name || name, description: String(fm.description || ''), toolsAllow: asList(fm['allowed-tools']),
    keywords: asList(fm.triggers?.keywords ?? fm.triggers), status: fm.metadata?.status || null, harness: 'skill',
  })
}

// SIS keeps skills as skills/<domain>/<name>.md (not SKILL.md dirs) and binds their activation in
// skill-rules.json. The rule enriches the markdown record when both exist; a rule with no file is
// a record of its own so the dangling-file finding can name it.
function fromSisSkills() {
  const dir = join(ESTATES.sis.root, 'skills')
  const out = new Map()
  for (const file of walk(dir, { maxDepth: 2, ext: '.md' })) {
    if (/^SKILL_|^README/i.test(basename(file))) continue
    const domain = basename(dirname(file)); if (domain === 'skills') continue
    const text = readFileSync(file, 'utf8')
    const { fm } = parseFrontmatter(text)
    const raw = slug(fm.name || basename(file, '.md'))
    const name = raw.startsWith(`${domain}/`) ? raw : `${domain}/${raw}`
    out.set(name, record({
      id: `skill:sis/${name}`, kind: 'skill', name, estate: 'sis', brand: 'starlight',
      sourceRef: rel(file), sourceKind: 'skill-md', contentHash: sha(text), tokenEstimate: tokens(text), mtime: statSync(file).mtime.toISOString(),
      displayName: fm.name || basename(file, '.md'), description: String(fm.description || (text.match(/^>\s*(.+)$/m) || [])[1] || ''), domain, harness: 'skill',
    }))
  }
  const f = join(dir, 'skill-rules.json')
  if (existsSync(f)) {
    let d; try { d = JSON.parse(readFileSync(f, 'utf8')) } catch { d = null }
    for (const r of d?.rules || []) {
      const name = slug(r.skill)
      const enrich = { keywords: asList(r.triggers?.keywords), intents: asList(r.triggers?.intents), files: asList(r.triggers?.files), handoffs: asList(r.triggers?.agents).map((a) => ({ to: `agent:sis/${slug(a)}`, when: 'activates' })), status: r.priority || null, tier: r.load_level || null }
      const existing = out.get(name)
      if (existing) { Object.assign(existing.routing, { keywords: enrich.keywords, intents: enrich.intents, files: enrich.files, status: enrich.status, tier: enrich.tier }); existing.will.handoffs = enrich.handoffs; existing.provenance.rule = r.id; continue }
      out.set(name, record({
        id: `skill:sis/${name}`, kind: 'skill', name, estate: 'sis', brand: 'starlight',
        sourceRef: `${rel(f)}#${r.id}`, sourceKind: 'skill-rule', contentHash: sha(JSON.stringify(r)), tokenEstimate: tokens(JSON.stringify(r)), mtime: statSync(f).mtime.toISOString(),
        displayName: r.skill, description: r.description || '', domain: String(r.skill).split('/')[0], lifecycle: 'draft', ...enrich,
      }))
    }
  }
  return [...out.values()]
}

// ------------------------------------------------------------------ scan

export function scanEstate({ includeSkills = true, includeGlobalSkills = true } = {}) {
  const records = []
  const sources = []
  const warnings = []
  const add = (arr) => { for (const r of arr) if (r) records.push(r) }
  const src = (p, role) => sources.push({ path: rel(p), role, exists: existsSync(p), mtime: existsSync(p) ? statSync(p).mtime.toISOString() : null })

  // SIS
  const sisAgents = join(ESTATES.sis.root, 'agents'); src(sisAgents, 'sis agent markdown')
  add(walk(sisAgents, { maxDepth: 2, ext: '.md' }).filter((f) => !/REGISTRY\.md$/i.test(f)).map(fromSisMd))
  const publicBetaAgents = join(PACKAGE_ROOT, 'foundry', 'agent-ontology', 'public-agents')
  src(publicBetaAgents, 'public beta agent markdown')
  add(walk(publicBetaAgents, { maxDepth: 1, ext: '.md' }).map(fromSisMd))
  if (includeSkills) { src(join(ESTATES.sis.root, 'skills'), 'sis domain skills + skill-rules.json'); add(fromSisSkills()) }

  // ACOS
  const acosAgents = join(ESTATES.acos.root, '.claude', 'agents'); src(acosAgents, 'acos claude subagents')
  add(walk(acosAgents, { maxDepth: 3, ext: '.md' }).filter((f) => basename(f) !== 'CLAUDE.md').map((f) => fromClaudeMd(f, 'acos', 'frankx')))
  add(walk(acosAgents, { maxDepth: 3, ext: '.json' }).map((f) => { try { const c = JSON.parse(readFileSync(f, 'utf8')); const name = slug(c.name || basename(f, '.json')); return record({ id: `agent:acos/${name}`, kind: 'agent', name, estate: 'acos', brand: 'frankx', sourceRef: rel(f), sourceKind: 'claude-subagent-json', contentHash: sha(JSON.stringify(c)), tokenEstimate: tokens(JSON.stringify(c)), mtime: statSync(f).mtime.toISOString(), displayName: c.name || name, description: c.description || '', model: c.model || null, toolsAllow: asList(c.tools), harness: 'claude-code' }) } catch { warnings.push(`unparseable ${rel(f)}`); return null } }))
  const depts = join(ESTATES.acos.root, 'departments'); src(depts, 'acos departments')
  add(walk(depts, { maxDepth: 2, ext: 'agent.md' }).map((f) => { const r = fromClaudeMd(f, 'acos', 'frankx', 'department-md'); r.id = `agent:acos/dept-${basename(dirname(f))}`; r.name = `dept-${basename(dirname(f))}`; return r }))
  if (includeSkills) { const s = join(ESTATES.acos.root, '.claude', 'skills'); src(s, 'acos skills'); add(walk(s, { maxDepth: 2, ext: 'SKILL.md' }).map((f) => fromSkillMd(f, 'acos', 'frankx'))) }

  // Arcanea (Codex-owned tree: read only)
  const arcAgents = join(ESTATES.arcanea.root, '.claude', 'agents'); src(arcAgents, 'arcanea claude subagents')
  add(walk(arcAgents, { maxDepth: 2, ext: '.md' }).map((f) => fromClaudeMd(f, 'arcanea', 'arcanea')))
  const ghAgents = join(ESTATES.arcanea.root, '.github', 'agents'); src(ghAgents, 'arcanea copilot agents')
  add(walk(ghAgents, { maxDepth: 1, ext: '.md' }).map((f) => fromClaudeMd(f, 'arcanea', 'arcanea', 'copilot-agent-md')))
  const arcTeams = join(ESTATES.arcanea.root, '.arcanea', 'agents'); src(arcTeams, 'arcanea yaml teams')
  for (const f of walk(arcTeams, { maxDepth: 2 }).filter((f) => /\.ya?ml$/.test(f))) add(fromYamlTeam(f))
  add(walk(arcTeams, { maxDepth: 2, ext: '.md' }).map((f) => fromClaudeMd(f, 'arcanea', 'arcanea')))
  if (includeSkills) { const s = join(ESTATES.arcanea.root, '.arcanea', 'skills'); src(s, 'arcanea skills'); add(walk(s, { maxDepth: 2, ext: 'SKILL.md' }).map((f) => fromSkillMd(f, 'arcanea', 'arcanea'))) }

  // Home sources are private and must never enter a public graph by default.
  if (SCAN_HOME) {
    const gAgents = join(ESTATES.global.root, 'agents'); src(gAgents, 'global claude subagents')
    add(walk(gAgents, { maxDepth: 1, ext: '.md' }).map((f) => { const r = fromClaudeMd(f, 'global', 'starlight'); r.brand = /^arcanea-|^luminor/.test(r.name) ? 'arcanea' : /^frankx-/.test(r.name) ? 'frankx' : 'starlight'; return r }))
    add(walk(gAgents, { maxDepth: 1, ext: '.json' }).map((f) => { try { const c = JSON.parse(readFileSync(f, 'utf8')); const name = slug(c.name || basename(f, '.json')); return record({ id: `agent:global/${name}`, kind: 'agent', name, estate: 'global', brand: /arcanea/.test(name) ? 'arcanea' : 'starlight', sourceRef: rel(f), sourceKind: 'claude-subagent-json', contentHash: sha(JSON.stringify(c)), tokenEstimate: tokens(JSON.stringify(c)), mtime: statSync(f).mtime.toISOString(), displayName: c.name || name, description: c.description || '', model: c.model || null, toolsAllow: asList(c.tools), harness: 'claude-code' }) } catch { warnings.push(`unparseable ${rel(f)}`); return null } }))
    if (includeSkills && includeGlobalSkills) { const s = join(ESTATES.global.root, 'skills'); src(s, 'global skills'); add(walk(s, { maxDepth: 2, ext: 'SKILL.md' }).map((f) => fromSkillMd(f, 'global', 'starlight'))) }
  }

  // Skill-only runtimes other harnesses load from (Hermes, Codex, the cross-harness ~/.agents)
  if (SCAN_HOME && includeSkills && includeGlobalSkills) {
    for (const est of ['hermes', 'codex', 'agents']) {
      const s = join(ESTATES[est].root, 'skills'); src(s, `${est} skills`)
      add(walk(s, { maxDepth: 2, ext: 'SKILL.md' }).map((f) => fromSkillMd(f, est, ESTATES[est].brand)))
    }
  }

  // Agent Army cards
  const cards = join(ESTATES.army.root, 'cards'); src(cards, 'agent cards')
  add(walk(cards, { maxDepth: 2, ext: '.json' }).map(fromAgentCard))

  // Factory + constitutions
  src(join(ESTATES.factory.root, 'REGISTRY.json'), 'forge registry'); add(fromForge())
  src(join(ESTATES.config.root, 'agent-constitution'), 'constitutions'); add(fromConstitutions())

  // duplicate ids inside one estate (two files claiming one name) are a finding, not a crash
  const seen = new Map()
  for (const r of records) { if (seen.has(r.id)) { warnings.push(`duplicate id ${r.id}: ${seen.get(r.id)} and ${r.sourceRef}`); r.id = `${r.id}~${sha(r.sourceRef).slice(0, 6)}` } else seen.set(r.id, r.sourceRef) }
  return { records, sources, warnings }
}

// ------------------------------------------------------------------ measures

export const canonicalName = (name) => name.replace(/^(starlight|acos|arcanea|frankx|sis|meta)-/, '').replace(/-(agent|specialist|is)$/, '')

export function stats(records) {
  const by = (fn) => records.reduce((m, r) => { const k = fn(r) ?? '(none)'; m[k] = (m[k] || 0) + 1; return m }, {})
  const agents = records.filter((r) => r.kind === 'agent')
  const dup = new Map()
  for (const a of agents) { const k = canonicalName(a.name); if (!dup.has(k)) dup.set(k, []); dup.get(k).push(`${a.estate}:${a.name}`) }
  const crossEstateDuplicates = [...dup.entries()].filter(([, v]) => new Set(v.map((x) => x.split(':')[0])).size > 1).map(([k, v]) => ({ name: k, in: v }))
  return {
    total: records.length,
    byKind: by((r) => r.kind), byEstate: by((r) => r.estate), bySourceKind: by((r) => r.sourceKind), byBrand: by((r) => r.brand),
    agentsByModel: agents.reduce((m, r) => { const k = r.body.model || '(none)'; m[k] = (m[k] || 0) + 1; return m }, {}),
    agentsByRank: agents.reduce((m, r) => { const k = r.routing.rank || '(none)'; m[k] = (m[k] || 0) + 1; return m }, {}),
    agentsWithTriggers: agents.filter((r) => r.routing.keywords.length || r.routing.intents.length || r.routing.files.length).length,
    agentsWithToolsAllowlist: agents.filter((r) => r.will.toolsAllow.length).length,
    agentsWithVerifier: agents.filter((r) => r.routing.verifier).length,
    agentsWithSoul: agents.filter((r) => r.identity.soulRef || r.identity.values.length).length,
    agentsWithHumanGates: agents.filter((r) => r.will.humanGates.length).length,
    crossEstateDuplicates,
    tokenMass: records.reduce((n, r) => n + r.tokenEstimate, 0),
  }
}

// ------------------------------------------------------------------ cli

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const { records, sources, warnings } = scanEstate({ includeGlobalSkills: !args.includes('--no-global-skills') })
  if (args.includes('--dump')) {
    const id = args[args.indexOf('--dump') + 1]
    const r = records.find((x) => x.id === id || x.name === id)
    console.log(r ? JSON.stringify(r, null, 2) : `not found: ${id}`)
  } else {
    const s = stats(records)
    if (args.includes('--json')) console.log(JSON.stringify({ stats: s, sources, warnings }, null, 2))
    else {
      console.log(`records ${s.total} · agents ${s.byKind.agent || 0} · skills ${s.byKind.skill || 0} · teams ${s.byKind.team || 0} · constitutions ${s.byKind.constitution || 0}`)
      console.log('by estate     ', JSON.stringify(s.byEstate))
      console.log('by source     ', JSON.stringify(s.bySourceKind))
      console.log('agents/model  ', JSON.stringify(s.agentsByModel))
      console.log('agents/rank   ', JSON.stringify(s.agentsByRank))
      console.log(`agents with: triggers ${s.agentsWithTriggers} · tools allowlist ${s.agentsWithToolsAllowlist} · named verifier ${s.agentsWithVerifier} · soul/values ${s.agentsWithSoul} · human gates ${s.agentsWithHumanGates}`)
      console.log(`cross-estate duplicate names: ${s.crossEstateDuplicates.length}`)
      for (const d of s.crossEstateDuplicates.slice(0, 40)) console.log('  ', d.name, '←', d.in.join(', '))
      console.log(`token mass ${s.tokenMass} · sources ${sources.length} (${sources.filter((x) => !x.exists).length} missing) · warnings ${warnings.length}`)
      for (const w of warnings.slice(0, 20)) console.log('  !', w)
    }
  }
}
