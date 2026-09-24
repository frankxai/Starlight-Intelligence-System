#!/usr/bin/env node
// gen-agent-atlas.mjs — compile the estate's agent corps from the files that define it.
//
// Reads every agent, skill, team, card, spec and constitution the scanner knows
// (tools/lib/agent-ontology.mjs) and writes three generated artifacts:
//
//   graph/agents.capability.json   the Foundry capability graph (SIS foundry/contracts/
//                                  capability-graph.schema.json): skill:/agent: nodes with
//                                  activates / depends-on / default-for edges. This is the ONE
//                                  agent+skill graph the graph law allows ("procedural memory").
//   graph/agents.atlas.json        the normalized records + measured findings (the sidecar the
//                                  compiler and router read; never hand-edited)
//   graph/AGENT-ATLAS.md           the human read of the same numbers
//
// Nothing numeric is typed here. Every count is computed from the scan and stamped with the
// sources' mtimes, the same discipline as gen-systems-map.mjs and gen-domain-graphs.mjs.
//
//   node tools/gen-agent-atlas.mjs            write all three
//   node tools/gen-agent-atlas.mjs --check    exit 1 if the on-disk artifacts drift from a fresh scan
//   node tools/gen-agent-atlas.mjs --json     print findings only

import { readFileSync, writeFileSync, existsSync, renameSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { scanEstate, stats, canonicalName, ESTATE, ESTATES, HOME_SCAN_ENABLED } from './agent-ontology.mjs'

const SELF = 'tools/gen-agent-atlas.mjs'
const OUT_CAP = join(ESTATE, 'graph', 'agents.capability.json')
const OUT_ATLAS = join(ESTATE, 'graph', 'agents.atlas.json')
// Generated artifacts stay inside graph/; the estate root is not this generator's to write.
const OUT_MD = join(ESTATE, 'graph', 'AGENT-ATLAS.md')
const args = process.argv.slice(2)
const check = args.includes('--check')
const asJson = args.includes('--json')

// Model aliases a Claude Code subagent may carry today (tools/agent-forge.mjs VALID_MODELS) and the
// exact ids the routing matrix names as current. Anything else is either a free-text policy (Agent
// Cards say "route by consequence") or a pin nobody can dispatch to. Legacy patterns are the ones
// the matrix's Avoid-when list or provider deprecations already retired.
const ALIAS_OK = new Set(['opus', 'sonnet', 'haiku', 'fable', 'inherit'])
const CURRENT_IDS = /^(claude-fable-5-1|claude-opus-5|claude-sonnet-5|claude-haiku-4-5(-\d+)?|openai\/gpt-6-astra|gpt-6-astra|google\/gemini-3\.8-flash|gemini-3\.8-flash|grok-4\.6|gpt-5\.6-luna)$/
const LEGACY_IDS = /(claude-3|claude-opus-4|claude-sonnet-4|claude-haiku-4-0|opus-4-[0-9]|gemini-2\.0|gemini-3-pro\b|gemini-1\.|gpt-4|gpt-5(?!\.6)|anthropic\/claude-opus-4)/i
const classifyModel = (m) => !m ? 'none' : ALIAS_OK.has(m) ? 'alias' : CURRENT_IDS.test(m) ? 'current-id' : LEGACY_IDS.test(m) ? 'legacy-id' : /\s/.test(m) ? 'policy-text' : 'unverified-id'

// Every place a request is routed to an agent today. Existence is checked; nothing else is assumed.
const SIS_REF = ESTATES.sis.root === ESTATE ? '' : 'repos/Starlight-Intelligence-System/'
const ROUTERS = [
  { name: 'SIS routing matrix (intent → agent)', path: `${SIS_REF}core/ROUTING_MATRIX.md` },
  { name: 'SIS IS router (keyword vectors → IS domain)', path: `${SIS_REF}src/is-router.ts` },
  { name: 'SIS skill rules (keywords/intents/files → skill + agents)', path: `${SIS_REF}skills/skill-rules.json` },
  { name: 'SIS capability control plane (capability → provider)', path: `${SIS_REF}src/capability-control-plane.ts` },
  { name: 'ACOS /acos keyword table', path: 'repos/agentic-creator-os/.claude/commands/acos.md' },
  { name: 'ACOS meta-acos-router (Opus subagent)', path: 'repos/agentic-creator-os/.claude/agents/meta-acos-router.md' },
  { name: 'Arcanea Lumina queen (domain → Guardian)', path: 'repos/arcanea-ai-app/.claude/agents/@lumina-queen.agent.md' },
  { name: 'Skill engine swarm router (persona keywords + model ladder)', path: 'repos/starlight-skill-engine/src/router.js' },
  { name: 'AIS resolver (AgentRequest → Route → Capability)', path: 'repos/agentic-intelligence-system/lib/ais/route.mjs' },
  ...(HOME_SCAN_ENABLED ? [{ name: 'Global starlight-orchestrator (→ stewards / queen / loops)', path: '~/.claude/agents/starlight-orchestrator.md' }] : []),
  { name: 'AGENTS.md §4 work-shape → harness table', path: 'AGENTS.md' },
  { name: 'Model routing matrix (work-shape → model, PROPOSED)', path: 'ops/model-arena/kb/model-routing-matrix.md' },
]
const absOf = (p) => (p.startsWith('~') ? join(ESTATES.global.root, '..', p.slice(2)) : join(ESTATE, p))

// ------------------------------------------------------------------ scan + measure

const { records, sources, warnings } = scanEstate()
const s = stats(records)
const agents = records.filter((r) => r.kind === 'agent')
const skills = records.filter((r) => r.kind === 'skill')
// A skill is reachable by its full name (memory/vault-management), its last segment, or its
// directory name; the first estate that defines it wins so cross-harness copies resolve once.
const skillIds = new Map()
for (const k of skills) for (const key of [k.name, k.name.split('/').pop()]) if (!skillIds.has(key)) skillIds.set(key, k.id)
const byEstate = (arr, fn) => arr.reduce((m, r) => { const k = r.estate; m[k] = m[k] || {}; const v = fn(r); m[k][v] = (m[k][v] || 0) + 1; return m }, {})
const count = (arr, pred) => arr.filter(pred).length

const modelClasses = agents.reduce((m, a) => { const c = classifyModel(a.body.model); m[c] = (m[c] || 0) + 1; return m }, {})
const legacyPins = agents.filter((a) => classifyModel(a.body.model) === 'legacy-id').map((a) => ({ id: a.id, model: a.body.model, sourceRef: a.sourceRef }))
const noTools = agents.filter((a) => !a.will.toolsAllow.length && a.body.harness === 'claude-code')
const noVerifier = agents.filter((a) => !a.routing.verifier)
const noTriggers = agents.filter((a) => !a.routing.keywords.length && !a.routing.intents.length && !a.routing.files.length)
const noDescription = agents.filter((a) => !a.routing.description)
const imported = agents.filter((a) => a.provenance.family)
const dangling = []
const skillKey = (sk) => String(sk).toLowerCase().replace(/^skill:[a-z]+\//, '').replace(/[^a-z0-9/-]+/g, '-')
const resolveSkill = (sk) => skillIds.get(skillKey(sk)) || skillIds.get(skillKey(sk).split('/').pop())
for (const a of agents) for (const sk of a.mind.skills) if (!resolveSkill(sk)) dangling.push({ agent: a.id, skill: sk })
const skillDupes = warnings.filter((w) => w.startsWith('duplicate id skill:')).length
// The same SKILL.md installed into several harness runtimes (~/.claude, ~/.agents, hermes, codex)
// is not a capability four times over; it is one capability with four copies that drift.
// agentskills.io specification (read 2026-09-19): name 1–64 chars, lowercase a-z 0-9 and hyphens,
// no leading/trailing/double hyphen, must equal the parent directory; description 1–1024 chars.
// Counted per skill file so the estate knows how many packs can be published unchanged.
const SKILL_NAME_RE = /^[a-z0-9](?:[a-z0-9]|-(?!-))*[a-z0-9]$|^[a-z0-9]$/
const skillConformance = skills.filter((k) => k.sourceKind === 'skill-md').map((k) => {
  const name = k.name.split('/').pop(), isDirPackage = /\/SKILL\.md$/.test(k.sourceRef), dir = k.sourceRef.split('/').slice(-2, -1)[0] || ''
  const problems = []
  if (!SKILL_NAME_RE.test(name) || name.length > 64) problems.push('name-charset-or-length')
  // The directory rule only exists for SKILL.md packages; SIS domain skills are flat markdown
  // files and would need packaging first to publish — that is a separate finding, not this one.
  if (isDirPackage && dir && dir !== name) problems.push('name-differs-from-directory')
  if (!isDirPackage) problems.push('flat-markdown-not-a-skill-package')
  if (!k.routing.description || k.routing.description.length > 1024) problems.push('description-empty-or-over-1024')
  return { id: k.id, problems }
})
const skillNonConformant = skillConformance.filter((c) => c.problems.length)
const skillConformanceByProblem = skillNonConformant.reduce((m, c) => { for (const p of c.problems) m[p] = (m[p] || 0) + 1; return m }, {})
const skillCopies = new Map()
for (const k of skills) { const key = k.name.split('/').pop(); if (!skillCopies.has(key)) skillCopies.set(key, new Set()); skillCopies.get(key).add(k.estate) }
const skillsInManyRuntimes = [...skillCopies.entries()].filter(([, e]) => e.size > 1)
const uniqueSkillNames = skillCopies.size
const agentDupes = warnings.filter((w) => w.startsWith('duplicate id agent:')).length
const tokenByEstate = records.reduce((m, r) => { m[r.estate] = (m[r.estate] || 0) + r.tokenEstimate; return m }, {})
const routers = ROUTERS.map((r) => ({ ...r, exists: existsSync(absOf(r.path)) }))
const identity = {
  constitutions: records.filter((r) => r.kind === 'constitution').map((r) => r.sourceRef),
  agentsWithSoulRef: count(agents, (a) => a.identity.soulRef),
  agentsWithValues: count(agents, (a) => a.identity.values.length),
  agentsWithBoundaries: count(agents, (a) => a.identity.boundaries.length),
  agentsWithHumanGates: count(agents, (a) => a.will.humanGates.length),
}
const harnessCoverage = agents.reduce((m, a) => { const k = a.body.harness || '(none)'; m[k] = (m[k] || 0) + 1; return m }, {})
// Claude Code loads every subagent description at startup and warns above 15,000 tokens combined
// (code.claude.com/docs/en/sub-agents, read 2026-09-19). Measured per estate so the number that
// governs delegation quality is visible, not the file count.
const DESCRIPTION_WARN_TOKENS = 15000
const descriptionTokens = agents.filter((a) => a.body.harness === 'claude-code').reduce((m, a) => { m[a.estate] = (m[a.estate] || 0) + Math.ceil((a.routing.description || '').length / 4); return m }, {})
const descriptionTokensGlobalPlusAcos = (descriptionTokens.global || 0) + (descriptionTokens.acos || 0)
const agentFormats = [...new Set(agents.map((a) => a.sourceKind))]

const findings = {
  measuredAt: new Date().toISOString(),
  totals: { records: records.length, agents: agents.length, skills: skills.length, teams: count(records, (r) => r.kind === 'team'), constitutions: identity.constitutions.length },
  byEstate: s.byEstate, bySourceKind: s.bySourceKind, byBrand: s.byBrand,
  modelPins: { classes: modelClasses, legacy: legacyPins, distribution: s.agentsByModel },
  writeAuthority: { claudeAgentsWithoutToolsAllowlist: noTools.length, byEstate: byEstate(agents.filter((a) => a.body.harness === 'claude-code'), (a) => (a.will.toolsAllow.length ? 'allowlist' : 'none')) },
  verification: { agentsNamingAVerifier: agents.length - noVerifier.length, agentsWithoutVerifier: noVerifier.length },
  routing: { agentsWithExplicitTriggers: agents.length - noTriggers.length, descriptionOnly: noTriggers.length - noDescription.length, unroutable: noDescription.length, routers, routerCount: routers.filter((r) => r.exists).length },
  duplicates: { crossEstateCapabilities: s.crossEstateDuplicates.length, crossEstateList: s.crossEstateDuplicates, intraEstateAgentFiles: agentDupes, intraEstateSkillFiles: skillDupes },
  imported: { agentsFromImportedFamilies: imported.length, families: imported.reduce((m, a) => { m[a.provenance.family] = (m[a.provenance.family] || 0) + 1; return m }, {}) },
  skills: { definitions: skills.length, uniqueNames: uniqueSkillNames, agentskillsSpec: { checked: skillConformance.length, nonConformant: skillNonConformant.length, byProblem: skillConformanceByProblem, sample: skillNonConformant.slice(0, 12) }, namesInMoreThanOneRuntime: skillsInManyRuntimes.length, byRuntime: skills.reduce((m, k) => { m[k.estate] = (m[k.estate] || 0) + 1; return m }, {}), danglingReferences: dangling.length, danglingSample: dangling.slice(0, 15) },
  instructionMass: { tokensByEstate: tokenByEstate, tokensTotal: s.tokenMass, turnZeroLawTokens: 8000, claudeDescriptionTokensByEstate: descriptionTokens, claudeDescriptionTokensGlobalPlusAcos: descriptionTokensGlobalPlusAcos, claudeDescriptionWarnTokens: DESCRIPTION_WARN_TOKENS },
  agentFormats,
  identity, harnessCoverage,
  warnings: warnings.length,
}

// ------------------------------------------------------------------ Foundry capability graph projection

// `provides` must be unique, non-empty strings (schema uniqueItems); a keyword that slugs to '' or
// to the skill's own name would otherwise fail the contract three nodes at a time.
const slugList = (xs) => [...new Set(xs.filter(Boolean).map((x) => String(x).toLowerCase().replace(/[^a-z0-9/-]+/g, '-').replace(/^-+|-+$/g, '')).filter(Boolean))]
const provides = (a) => slugList([a.routing.domain, a.routing.rank, ...a.routing.keywords.slice(0, 8)])
const capId = (id) => id.replace(/~([a-f0-9]{6})$/, '-$1')
const capNodes = [
  ...agents.map((a) => ({ id: capId(a.id), kind: 'agent', status: a.routing.status === 'deprecated' || a.provenance.lifecycle === 'retired' ? 'deprecated' : a.provenance.lifecycle === 'draft' ? 'experimental' : a.estate === 'factory' ? 'registered' : 'stable', path: a.sourceRef, description: (a.routing.description || a.identity.tagline || '').slice(0, 300), provides: provides(a).length ? provides(a) : ['agent'] })),
  ...skills.map((k) => ({ id: capId(k.id), kind: 'skill', status: 'stable', path: k.sourceRef, description: (k.routing.description || '').slice(0, 300), provides: slugList([k.name, ...k.routing.keywords.slice(0, 6)]) })),
]
const nodeIds = new Set(capNodes.map((n) => n.id))
const capEdges = []
const edgeSeen = new Set()
// Every edge endpoint goes through capId: a record id carrying a `~` collision suffix would
// otherwise never match its node and the edge would vanish silently (Grok gate 2026-09-19).
const pushEdge = (from, to, relation) => { const f = capId(from), t = capId(to), key = `${f}|${t}|${relation}`; if (nodeIds.has(f) && nodeIds.has(t) && !edgeSeen.has(key)) { edgeSeen.add(key); capEdges.push({ from: f, to: t, relation }) } }
for (const a of agents) for (const sk of a.mind.skills) { const target = resolveSkill(sk); if (target) pushEdge(a.id, target, 'depends-on') }
for (const k of skills) for (const h of k.will.handoffs) if (h.when === 'activates') { pushEdge(h.to, k.id, 'activates'); if (k.routing.tier === 'core') pushEdge(k.id, h.to, 'default-for') }
// The contract's `source` is exactly two strings (additionalProperties: false). The 17-root
// inventory with mtimes lives in the atlas sidecar, which is the registry this graph compiles from.
const capability = {
  $schema: `${SIS_REF}foundry/contracts/capability-graph.schema.json`,
  schemaVersion: '1.0.0',
  generatedAt: findings.measuredAt,
  source: { skillRules: 'repos/Starlight-Intelligence-System/skills/skill-rules.json', agentRegistry: 'graph/agents.atlas.json' },
  nodes: capNodes,
  edges: capEdges,
}

// Validate the projection against the Foundry contract, recursively, every run. The first version
// checked node and edge items and stamped `validated: true` while the `source` block failed the
// schema (Grok gate 2026-09-19) — a partial validator is the false-green it was meant to prevent.
// This walks the whole document with the JSON Schema subset the contract uses: type, const, enum,
// pattern, required, additionalProperties, properties, items, minItems, uniqueItems, minLength,
// maxLength. `format` is not enforced (draft 2020-12 treats it as annotation).
const CAP_SCHEMA = join(ESTATES.sis.root, 'foundry', 'contracts', 'capability-graph.schema.json')
export function validateAgainst(schema, value, path = '$', errs = []) {
  const t = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value
  if (schema.const !== undefined && value !== schema.const) errs.push(`${path}: expected const ${JSON.stringify(schema.const)}`)
  if (schema.enum && !schema.enum.includes(value)) errs.push(`${path}: ${JSON.stringify(value)} not in enum`)
  if (schema.type && schema.type !== t && !(schema.type === 'integer' && Number.isInteger(value))) { errs.push(`${path}: expected ${schema.type}, got ${t}`); return errs }
  if (t === 'string') {
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errs.push(`${path}: "${value}" fails pattern ${schema.pattern}`)
    if (schema.minLength != null && value.length < schema.minLength) errs.push(`${path}: shorter than ${schema.minLength}`)
    if (schema.maxLength != null && value.length > schema.maxLength) errs.push(`${path}: longer than ${schema.maxLength}`)
  }
  if (t === 'array') {
    if (schema.minItems != null && value.length < schema.minItems) errs.push(`${path}: fewer than ${schema.minItems} items`)
    if (schema.uniqueItems && new Set(value.map((v) => JSON.stringify(v))).size !== value.length) errs.push(`${path}: items not unique`)
    if (schema.items) value.forEach((v, i) => validateAgainst(schema.items, v, `${path}[${i}]`, errs))
  }
  if (t === 'object') {
    for (const k of schema.required || []) if (!(k in value)) errs.push(`${path}: missing required ${k}`)
    for (const [k, v] of Object.entries(value)) {
      if (schema.properties && k in schema.properties) validateAgainst(schema.properties[k], v, `${path}.${k}`, errs)
      else if (schema.additionalProperties === false && k !== '$schema') errs.push(`${path}: additional property ${k}`)
    }
  }
  return errs
}
const capErrors = existsSync(CAP_SCHEMA) ? validateAgainst(JSON.parse(readFileSync(CAP_SCHEMA, 'utf8')), capability) : [`schema not found: ${CAP_SCHEMA}`]
const danglingEdges = capEdges.filter((e) => !nodeIds.has(e.from) || !nodeIds.has(e.to)).length
if (danglingEdges) capErrors.push(`${danglingEdges} edges reference unknown node ids`)
if (capErrors.length) { console.error(`capability graph fails ${CAP_SCHEMA}:\n${capErrors.slice(0, 20).join('\n')}`); process.exit(1) }
findings.capabilityGraph = { nodes: capNodes.length, edges: capEdges.length, schema: `${SIS_REF}foundry/contracts/capability-graph.schema.json`, validated: 'recursive subset: type/const/enum/pattern/required/additionalProperties/items/uniqueItems/minItems/length; format not enforced' }

const atlas = { schema: 'starlight.agent-atlas.v1', generatedAt: findings.measuredAt, generatedBy: SELF, sources, findings, records }

// ------------------------------------------------------------------ markdown

const n = (x) => (x == null ? '—' : String(x))
const pct = (a, b) => (b ? Math.round((100 * a) / b) + '%' : '—')
const kv = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · ')
const md = `# AGENT-ATLAS.md — every agent definition in the estate, measured

Generated ${findings.measuredAt} by \`${SELF}\` → \`graph/agents.atlas.json\` (records + findings), this file (\`graph/AGENT-ATLAS.md\`) and \`graph/agents.capability.json\` (the Foundry capability graph, the one agent+skill graph the graph law permits). **Do not hand-edit; rerun the script.** Every number below is computed from the ${sources.length} sources listed at the end; a count with no command behind it does not appear here.

Binding doctrine: \`AGENTS.md\` · \`ops/agent-factory/AGENT-FACTORY.md\` · \`ops/stewards/GENERAL-CONTRACT.md\` · graph law \`repos/Starlight-Intelligence-System/docs/graph-engineering/CONTRACT.md\` (via the SIS loop-kernel worktree) · \`CROSS-MODEL-GATE.md\`.

## Findings (counted)

- **${agentFormats.length} agent definition formats (${agentFormats.join(', ')}), ${findings.totals.agents} agent definitions, ${findings.totals.skills} skill definitions.** By estate: ${kv(findings.byEstate)}. By format: ${kv(findings.bySourceKind)}.
- **${findings.duplicates.crossEstateCapabilities} capability names are defined in two or more estates** (same canonical name, different files, no link between them). The global corps and ACOS carry near-identical copies of the author team and the prompt hub. Inside ACOS, ${findings.duplicates.intraEstateAgentFiles} agent files and ${findings.duplicates.intraEstateSkillFiles} skill files exist twice under different paths.
- **Model pins:** ${kv(findings.modelPins.classes)}. ${findings.modelPins.legacy.length} agents pin a retired model id (${[...new Set(findings.modelPins.legacy.map((l) => l.model))].join(', ') || 'none'}) — a dead route the harness cannot dispatch to. ${findings.modelPins.classes.none || 0} of ${findings.totals.agents} carry no pin at all and inherit whatever the session runs.
- **Write authority:** ${findings.writeAuthority.claudeAgentsWithoutToolsAllowlist} Claude Code subagents have no \`tools:\` allowlist, so their write authority is whatever the caller had. AGENT-FACTORY.md makes the allowlist the only mechanical enforcement; these agents have none.
- **Maker ≠ checker:** ${findings.verification.agentsNamingAVerifier} of ${findings.totals.agents} agents name a verifier (${pct(findings.verification.agentsNamingAVerifier, findings.totals.agents)}). The rest can certify their own work.
- **Routing:** ${findings.routing.agentsWithExplicitTriggers} agents carry explicit triggers (keywords/intents/files); ${findings.routing.descriptionOnly} are routable only by description prose; ${findings.routing.unroutable} have neither. ${findings.routing.routerCount} separate routers exist (listed below), none of which reads the others.
- **Imported mass:** ${findings.imported.agentsFromImportedFamilies} ACOS agents come from imported families (${kv(findings.imported.families)}) — claude-flow / hive-mind lineage carrying its own conventions.
- **Skills:** ${findings.skills.definitions} skill definitions across ${Object.keys(findings.skills.byRuntime).length} runtimes (${kv(findings.skills.byRuntime)}) collapse to ${findings.skills.uniqueNames} distinct names; ${findings.skills.namesInMoreThanOneRuntime} names are installed into two or more runtimes as separate copies that can drift independently. ${findings.skills.danglingReferences} agent→skill references point at a skill that exists in no runtime (sample below). Against the agentskills.io specification, ${findings.skills.agentskillsSpec.nonConformant} of ${findings.skills.agentskillsSpec.checked} SKILL.md files fail (${kv(findings.skills.agentskillsSpec.byProblem) || 'none'}); the rest can be published to Codex, OpenClaw, Hermes and skills.sh unchanged.
- **Instruction mass:** ${findings.instructionMass.tokensTotal.toLocaleString()} tokens across all definitions (${kv(Object.fromEntries(Object.entries(findings.instructionMass.tokensByEstate).map(([k, v]) => [k, v.toLocaleString()])))}). The Progressive Skill Gateway caps Turn 0 at ${findings.instructionMass.turnZeroLawTokens.toLocaleString()} tokens; the corpus is ${Math.round(findings.instructionMass.tokensTotal / findings.instructionMass.turnZeroLawTokens)}× that, which is why progressive loading is a law and not a preference.
- **Claude delegation budget:** Claude Code reads every subagent description at startup and warns above ${DESCRIPTION_WARN_TOKENS.toLocaleString()} tokens combined. Measured description mass per Claude-format estate: ${kv(Object.fromEntries(Object.entries(descriptionTokens).map(([k, v]) => [k, v.toLocaleString()])))}. A session that loads the global corps plus ACOS's agents spends ${descriptionTokensGlobalPlusAcos.toLocaleString()} tokens on descriptions before the first prompt; all Claude-format estates together, ${Object.values(descriptionTokens).reduce((n, v) => n + v, 0).toLocaleString()}.
- **Identity layers:** ${identity.constitutions.length} constitutions (starlight-agent-config), ${identity.agentsWithSoulRef} agents with a SOUL.md reference, ${identity.agentsWithValues} with declared values, ${identity.agentsWithBoundaries} with declared boundaries, ${identity.agentsWithHumanGates} with human gates — all of the latter four live in the Agent Card estate; the ${findings.harnessCoverage['claude-code'] || 0} Claude Code-format agent definitions carry none of them structurally.
- **Harness coverage:** ${kv(findings.harnessCoverage)}. Only the Agent Cards and the Arcanea YAML team are harness-agnostic; every Claude definition is bound to Claude Code by its file format.
- **Scanner warnings:** ${findings.warnings} (duplicate ids inside one estate, unparseable files). Listed in \`graph/agents.atlas.json\` → \`sources\`/\`warnings\`.

## Routers found

| Router | Path | Present |
|---|---|---|
${routers.map((r) => `| ${r.name} | \`${r.path}\` | ${r.exists ? 'yes' : '**missing**'} |`).join('\n')}

## Cross-estate duplicate capabilities

| Canonical name | Defined in |
|---|---|
${findings.duplicates.crossEstateList.map((d) => `| ${d.name} | ${d.in.join(', ')} |`).join('\n')}

## Retired model pins (dead routes)

| Agent | Pin | Source |
|---|---|---|
${findings.modelPins.legacy.map((l) => `| ${l.id} | \`${l.model}\` | \`${l.sourceRef}\` |`).join('\n') || '| — | — | — |'}

## Dangling skill references (sample)

| Agent | Skill named |
|---|---|
${findings.skills.danglingSample.map((d) => `| ${d.agent} | ${d.skill} |`).join('\n') || '| — | — |'}

## Agents by estate

| Estate | Agents | Skills | Formats | Model pins | Tools allowlist | Verifier named |
|---|---|---|---|---|---|---|
${Object.keys(findings.byEstate).map((e) => { const ea = agents.filter((a) => a.estate === e); const es = skills.filter((k) => k.estate === e); return `| ${e} | ${ea.length} | ${es.length} | ${[...new Set(records.filter((r) => r.estate === e).map((r) => r.sourceKind))].join(', ')} | ${count(ea, (a) => a.body.model)} | ${count(ea, (a) => a.will.toolsAllow.length)} | ${count(ea, (a) => a.routing.verifier)} |` }).join('\n')}

## Sources

| Path | Role | mtime |
|---|---|---|
${sources.map((x) => `| \`${x.path}\` | ${x.role} | ${x.exists ? x.mtime : '**missing**'} |`).join('\n')}
`

// ------------------------------------------------------------------ write / check

function writeAtomic(path, content) { mkdirSync(dirname(path), { recursive: true }); const tmp = path + '.tmp'; writeFileSync(tmp, content); renameSync(tmp, path) }
const stripStamp = (s) => s.replace(/"generatedAt": "[^"]+"|"measuredAt": "[^"]+"|Generated [0-9T:.Z-]+ by/g, '')

if (asJson) { console.log(JSON.stringify(findings, null, 2)); process.exit(0) }
if (check) {
  const drift = []
  for (const [p, content] of [[OUT_CAP, JSON.stringify(capability, null, 1)], [OUT_ATLAS, JSON.stringify(atlas, null, 1)], [OUT_MD, md]]) {
    if (!existsSync(p)) drift.push(`${p} missing`)
    else if (stripStamp(readFileSync(p, 'utf8')) !== stripStamp(content)) drift.push(`${p} drifted`)
  }
  if (drift.length) { console.error(drift.join('\n')); process.exit(1) }
  console.log('atlas in sync'); process.exit(0)
}
writeAtomic(OUT_CAP, JSON.stringify(capability, null, 1))
writeAtomic(OUT_ATLAS, JSON.stringify(atlas, null, 1))
writeAtomic(OUT_MD, md)
console.log(`wrote graph/agents.capability.json (${capNodes.length} nodes, ${capEdges.length} edges) · graph/agents.atlas.json (${records.length} records) · graph/AGENT-ATLAS.md`)
console.log(`agents ${findings.totals.agents} · skills ${findings.totals.skills} · duplicates ${findings.duplicates.crossEstateCapabilities} · legacy pins ${findings.modelPins.legacy.length} · no verifier ${findings.verification.agentsWithoutVerifier} · routers ${findings.routing.routerCount}`)
