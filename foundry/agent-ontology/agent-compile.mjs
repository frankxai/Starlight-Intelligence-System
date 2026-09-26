#!/usr/bin/env node
// agent-compile.mjs — compile one normalized agent record into harness-native definitions.
//
// The estate defines agents in several file formats (the atlas counts them) and none of those files can be handed to a different harness.
// This compiler reads the atlas (tools/gen-agent-atlas.mjs → graph/agents.atlas.json), composes the
// agent's SOUL from the identity layers the estate already owns, and emits:
//
//   claude-code    .claude/agents/<name>.md      frontmatter + GENERAL-CONTRACT body; passes the
//                                               agent-forge gates (mirrored below) — Claude Code
//                                               local AND Claude cloud sessions read this file
//   claude-sdk     <name>.agent.json             the Agent SDK `agents` option entry
//   soul           <name>.SOUL.md                the composed identity alone (Hermes / OpenClaw /
//                                               Agent Card `soul_md`)
//   context-pack   <name>.context-pack.json      SIS instruction-compiler shape: atoms with
//                                               contentHash + tokenEstimate, selected/excluded
//                                               against a token budget, sourceDigest
//
// SOUL composition order (kernel → brand → substrate invariants → constitution → agent identity →
// authority → verification) is fixed; every layer names the file it came from and its hash, so a
// compiled agent is a projection with provenance, never a new source of truth.
//
//   node tools/agent-compile.mjs <id|name> [--target claude-code|claude-sdk|soul|context-pack|all]
//                                [--out <dir>] [--budget <tokens>] [--print]
//   node tools/agent-compile.mjs --all --estate sis --target claude-code [--out <dir>]
//   node tools/agent-compile.mjs --targets

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, basename, isAbsolute, dirname } from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { scanEstate, ESTATE, ESTATES, tokens, sha } from './agent-ontology.mjs'

const SELF = 'tools/agent-compile.mjs'
const PACKAGE_DEFAULTS = join(dirname(fileURLToPath(import.meta.url)), 'defaults')
const ATLAS = join(ESTATE, 'graph', 'agents.atlas.json')
const DEFAULT_OUT = join(ESTATE, 'scratch', 'agent-compile')
const args = process.argv.slice(2)
const flag = (n, d = null) => { const i = args.indexOf(`--${n}`); return i === -1 || i === args.length - 1 ? d : args[i + 1] }
const has = (n) => args.includes(`--${n}`)

// ------------------------------------------------------------------ identity layer sources

const SRC = {
  kernel:        existsSync(join(ESTATE, 'kernel', 'KERNEL.md')) ? join(ESTATE, 'kernel', 'KERNEL.md') : join(PACKAGE_DEFAULTS, 'KERNEL.md'),
  frankDna:      existsSync(join(ESTATES.sis.root, 'CLAUDE.md')) ? join(ESTATES.sis.root, 'CLAUDE.md') : join(PACKAGE_DEFAULTS, 'BRAND.md'),
  sisSoul:       join(ESTATES.sis.root, 'SOUL.md'),
  luminor:       join(ESTATES.arcanea.root, '.arcanea', 'prompts', 'luminor-engineering-kernel.md'),
  canon:         join(ESTATES.arcanea.root, '.arcanea', 'lore', 'CANON_LOCKED.md'),
  crossModel:    existsSync(join(ESTATE, 'CROSS-MODEL-GATE.md')) ? join(ESTATE, 'CROSS-MODEL-GATE.md') : join(PACKAGE_DEFAULTS, 'VERIFICATION.md'),
  generalContract: existsSync(join(ESTATE, 'ops', 'stewards', 'GENERAL-CONTRACT.md')) ? join(ESTATE, 'ops', 'stewards', 'GENERAL-CONTRACT.md') : join(PACKAGE_DEFAULTS, 'AUTHORITY.md'),
  constitutions: join(ESTATES.config.root, 'agent-constitution'),
}
const CONSTITUTION_BY_ROLE = [
  [/arcanea|lore|canon|guardian|luminor|worldbuild|myth/i, 'ARCANEA_CREATIVE_AGENT.md'],
  [/cod(e|ing|er)|engineer|devops|backend|frontend|infra|deploy|migration|refactor|ci\b|build/i, 'CODEX_EXECUTION_AGENT.md'],
  [/content|media|social|newsletter|blog|video|audio|music|brand|copy|marketing|design/i, 'CONTENT_MEDIA_AGENT.md'],
  [/research|verif|audit|review|fact|evaluat|analy|red.?team|sentinel|scout/i, 'RESEARCH_VERIFICATION_AGENT.md'],
]
const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '')
const relp = (p) => p.replace(ESTATE, '').replace(/\\/g, '/').replace(/^\//, '')
const section = (text, heading) => { const m = text.match(new RegExp(`^#{1,3}\\s+${heading}[^\\n]*\\n([\\s\\S]*?)(?=^#{1,3}\\s|(?![\\s\\S]))`, 'im')); return m ? m[1].trim() : '' }
const fence = (text, lang) => { const m = text.match(new RegExp('```' + lang + '\\n([\\s\\S]*?)```')); return m ? m[1].trim() : '' }

function atom(id, layer, sourcePath, text, { required = true, activation = 'always' } = {}) {
  return { id, layer, sourceRef: relp(sourcePath), sourceKind: /SKILL\.md$/.test(sourcePath) ? 'SKILL.md' : /CLAUDE\.md$/.test(sourcePath) ? 'CLAUDE.md' : /AGENTS\.md$/.test(sourcePath) ? 'AGENTS.md' : 'policy', contentHash: sha(text), tokenEstimate: tokens(text), required, activation, text }
}

// ------------------------------------------------------------------ soul composition

export function composeSoul(rec, { budget = Infinity } = {}) {
  const atoms = []
  const brand = rec.brand || 'starlight'
  const roleText = `${rec.name} ${rec.routing.domain || ''} ${rec.routing.rank || ''} ${rec.routing.description || ''} ${rec.identity.tagline || ''}`

  // 1. kernel posture — the estate's default stance, identical for every agent
  const kernelBlock = fence(read(SRC.kernel), 'markdown')
  if (kernelBlock) atoms.push(atom('kernel.posture', 'kernel', SRC.kernel, kernelBlock))

  // 2. brand DNA — who the agent is an extension of
  if (brand === 'arcanea') {
    const lum = read(SRC.luminor)
    const ident = ['IDENTITY', 'NATURE', 'VOICE'].map((h) => section(lum, h)).filter(Boolean).join('\n\n')
    if (ident) atoms.push(atom('brand.luminor', 'brand', SRC.luminor, `## Luminor register (Arcanea canon only)\n\n${ident}`, { required: false }))
    if (existsSync(SRC.canon)) atoms.push(atom('brand.canon', 'brand', SRC.canon, `Read \`${relp(SRC.canon)}\` before touching lore, guardians, voice, or mythology. Canon is not overwritten to fit one output.`))
  } else {
    const dna = section(read(SRC.frankDna), 'Frank DNA').split(/\n---/)[0].trim()
    if (dna) atoms.push(atom('brand.frank-dna', 'brand', SRC.frankDna, `## Frank DNA\n\n${dna}`, { required: false }))
  }

  // 3. substrate invariants — what must not drift (Starlight-branded agents)
  if (brand !== 'arcanea') {
    const soul = read(SRC.sisSoul)
    const inv = [...soul.matchAll(/^\d\.\s+\*\*(.+?)\*\*\s*\n\s+(.+)$/gm)].map((m) => `- **${m[1]}** ${m[2].trim()}`).join('\n')
    if (inv) atoms.push(atom('substrate.invariants', 'substrate', SRC.sisSoul, `## What must not drift\n\n${inv}`, { required: false }))
  }

  // 4. constitution — the operating discipline for this kind of work
  const constName = (CONSTITUTION_BY_ROLE.find(([re]) => re.test(roleText)) || [null, 'FRANKX_AGENT_CONSTITUTION.md'])[1]
  const estateConstitution = join(SRC.constitutions, constName)
  const constPath = existsSync(estateConstitution) ? estateConstitution : join(PACKAGE_DEFAULTS, 'CONSTITUTION.md')
  const constText = read(constPath)
  if (constText) {
    const role = section(constText, 'Role') || section(constText, 'Identity')
    atoms.push(atom('constitution.role', 'constitution', constPath, `## Constitution — ${constText.match(/^#\s+(.+)$/m)?.[1] || constName}\n\n${role}\n\nFull constitution: \`${relp(constPath)}\` (read on demand, not at Turn 0).`))
  }

  // 5. agent identity — the part only this agent owns. When the source is already a full agent
  // body (a Claude subagent, a Copilot agent, a SIS agent), that body IS the identity layer:
  // its contract sections, read paths and receipts survive compilation and stay lintable. The
  // synthesized identity is for records that have no body (cards, YAML roles, forge rows).
  const srcBody = rec.provenance?.body && rec.provenance.body.length > 40 ? rec.provenance.body : null
  const idLines = srcBody ? [
    /^#\s/m.test(srcBody) ? '' : `# ${rec.identity.displayName}`,
    srcBody,
    rec.mind.skills.length && !/##\s+Skills/i.test(srcBody) ? `\n## Skills\n\n${rec.mind.skills.map((v) => `- ${v}`).join('\n')}` : '',
  ].filter(Boolean).join('\n') : [
    `# ${rec.identity.displayName}`,
    rec.identity.tagline ? `\n> ${rec.identity.tagline}` : '',
    rec.mind.approach ? `\n## Mission\n\n${rec.mind.approach}` : rec.routing.description ? `\n## Mission\n\n${rec.routing.description}` : '',
    rec.identity.voice ? `\n## Voice\n\n${rec.identity.voice}` : '',
    rec.identity.values.length ? `\n## Values\n\n${rec.identity.values.map((v) => `- ${v}`).join('\n')}` : '',
    rec.identity.boundaries.length ? `\n## Boundaries\n\n${rec.identity.boundaries.map((v) => `- ${v}`).join('\n')}` : '',
    rec.mind.kb.length ? `\n## Read-first\n\n${rec.mind.kb.map((v) => `- \`${v}\``).join('\n')}` : '',
    rec.mind.skills.length ? `\n## Skills\n\n${rec.mind.skills.map((v) => `- ${v}`).join('\n')}` : '',
  ].filter(Boolean).join('\n')
  atoms.push(atom(`agent.${rec.name}`, 'agent', rec.sourceRef.startsWith('~') ? join(ESTATES.global.root, rec.sourceRef.slice(2).replace(/^\.claude\//, '')) : join(ESTATE, rec.sourceRef.split('#')[0]), idLines))

  // 6. authority — what the agent may do without a human
  const gates = [...new Set(['push', 'publish', 'send', 'delete', 'money', ...rec.will.humanGates])]
  const auth = [
    '## Write authority',
    rec.will.toolsAllow.length ? `Tools allowlist: ${rec.will.toolsAllow.join(', ')}. The allowlist is the enforcement; prose never widens it.` : 'No tools allowlist is declared for this agent. Compiled Claude targets are restricted to Read, Glob, Grep; other harnesses must enforce equivalent read-only authority.',
    rec.will.toolsDeny.length ? `Denied: ${rec.will.toolsDeny.join(', ')}.` : '',
    `\n## Human gates\n\nAlways confirm before: ${gates.join(', ')}.`,
    rec.will.handoffs.length ? `\n## Handoffs\n\n${rec.will.handoffs.map((h) => `- → ${h.to}: ${h.when}`).join('\n')}` : '',
  ].filter(Boolean).join('\n')
  atoms.push(atom('authority', 'authority', SRC.generalContract, auth))

  // 7. verification — maker ≠ checker and the receipt
  const verifier = rec.routing.verifier && rec.routing.verifier !== 'declared' ? rec.routing.verifier : SRC.crossModel.endsWith('VERIFICATION.md') ? 'A different provider than the maker. Never this agent.' : `A different provider per \`${relp(SRC.crossModel)}\`, or the invoking queen session. Never this agent.`
  atoms.push(atom('verification', 'verification', SRC.crossModel, `## Maker ≠ checker\n\n${verifier}\n\n## Receipt\n\nEvery pass ends with three lines: made / verified / proposed. A pass without a receipt did not happen.`))

  // budget: drop optional layers largest-first until it fits, and say so
  const selected = [], excluded = []
  let total = atoms.reduce((n, a) => n + a.tokenEstimate, 0)
  const optional = atoms.filter((a) => !a.required).sort((a, b) => b.tokenEstimate - a.tokenEstimate)
  for (const a of optional) { if (total <= budget) break; excluded.push({ id: a.id, reason: `over-budget:${budget}` }); total -= a.tokenEstimate }
  for (const a of atoms) if (!excluded.find((e) => e.id === a.id)) selected.push(a)
  const sourceDigest = createHash('sha256').update(selected.map((a) => `${a.id}:${a.contentHash}`).sort().join('|')).digest('hex').slice(0, 24)
  return { atoms, selected, excluded, sourceDigest, tokenEstimate: total, markdown: selected.map((a) => a.text).join('\n\n---\n\n') }
}

// ------------------------------------------------------------------ targets

const MODEL_ALIAS = { 'claude-fable-5-1': 'fable', 'claude-opus-5': 'opus', 'claude-sonnet-5': 'sonnet', 'claude-haiku-4-5': 'haiku' }
export function claudeModel(m) {
  if (!m) return { model: null, note: 'no pin in source; inherits the caller' }
  const t = String(m).trim()
  if (['opus', 'sonnet', 'haiku', 'fable', 'inherit'].includes(t)) return { model: t }
  const alias = Object.entries(MODEL_ALIAS).find(([id]) => t.startsWith(id))
  if (alias) return { model: alias[1], note: `pinned ${t} in source` }
  return { model: 'inherit', note: `source pin "${t}" is not a dispatchable tier; recorded here, routed by policy` }
}

// Agent Cards and YAML teams name tools abstractly (terminal, delegate_cli, vault_search_private).
// A Claude allowlist must be Claude tool tokens or it enforces nothing (forge gate
// tools-not-an-allowlist), so abstract names are mapped where a faithful mapping exists and
// otherwise recorded in the body as declared-but-unmapped authority.
const TOOL_MAP = {
  terminal: ['Bash'], shell: ['Bash'], bash: ['Bash'], git: ['Bash'], gh: ['Bash'], cli: ['Bash'],
  filesystem: ['Read', 'Edit', 'Write', 'Glob', 'Grep'], filesystem_scoped: ['Read', 'Edit', 'Write', 'Glob', 'Grep'], files: ['Read', 'Edit', 'Write', 'Glob', 'Grep'],
  read: ['Read', 'Glob', 'Grep'], write: ['Write', 'Edit'], search: ['Grep', 'Glob'], browser: ['WebFetch', 'WebSearch'], web: ['WebFetch', 'WebSearch'],
  delegate_cli: ['Agent'], delegate: ['Agent'], subagent: ['Agent'], task_route: ['Agent'],
}
export function mapTools(list) {
  const mapped = new Set(), unmapped = []
  for (const t of list) {
    const key = String(t).trim()
    if (KNOWN_TOOLS.has(key) || /^mcp__[A-Za-z0-9_]+/.test(key)) mapped.add(key)
    else if (TOOL_MAP[key.toLowerCase()]) for (const m of TOOL_MAP[key.toLowerCase()]) mapped.add(m)
    else unmapped.push(key)
  }
  return { mapped: [...mapped], unmapped }
}

const TRIGGER_RE = /\b(use\s+(when|whenever|before|for|this|it|in|on|to|at|after|during|with|against)|auto.?invoke|trigger|invoke[sd]? (when|on|for)|call (this|it) when|run (this|it) (when|before)|when the user|when (you|a) \w+|activates? on|reach for (this|it))/i
function description(rec) {
  let d = (rec.routing.description || rec.identity.tagline || '').replace(/\s+/g, ' ').trim()
  const cues = [...rec.routing.keywords, ...rec.routing.intents, ...rec.mind.skills.map((s) => String(s).split('/').pop())].slice(0, 8)
  if (!TRIGGER_RE.test(d)) {
    const when = cues.length ? cues.join(', ') : [rec.routing.domain, rec.routing.tier].filter(Boolean).join(' ')
    if (when) d = `${d}${d.endsWith('.') ? '' : '.'} Use when the request concerns ${when}.`
  }
  if (d.length < 60 && rec.mind.approach) d = `${d} ${rec.mind.approach}`.trim()
  return d
}

export function toClaudeCode(rec, soul) {
  const { model, note } = claudeModel(rec.body.model)
  const desc = description(rec).replace(/"/g, '\\"')
  // Subagents do not inherit the main conversation's skills (code.claude.com/docs/en/sub-agents,
  // read 2026-09-19): a skill the record names must be preloaded with `skills:` or it is invisible.
  const skills = rec.mind.skills.map((s) => String(s).split('/').pop()).filter((s) => /^[a-z0-9][a-z0-9-]*$/.test(s))
  const tools = mapTools(rec.will.toolsAllow.length ? rec.will.toolsAllow : ['Read', 'Glob', 'Grep'])
  const fm = [`name: "${rec.name}"`, `description: "${desc}"`, model ? `model: ${model}` : null, tools.mapped.length ? `tools: ${tools.mapped.join(', ')}` : null, skills.length ? `skills:\n${skills.map((s) => `  - ${s}`).join('\n')}` : null].filter(Boolean)
  const body = [
    soul.markdown,
    tools.unmapped.length ? `\n## Declared authority not mapped to Claude tools\n\n${tools.unmapped.map((t) => `- ${t}`).join('\n')}\n\nThese are named by the source record but have no Claude Code tool token; they grant nothing here until a mapping exists.` : '',
    note ? `\n## Model policy\n\n${note}.` : '',
    `\n<!-- compiled by ${SELF} from ${rec.sourceRef} @ ${rec.contentHash} · layers ${soul.selected.map((a) => a.id).join(', ')} · digest ${soul.sourceDigest}${soul.excluded.length ? ` · excluded ${soul.excluded.map((e) => e.id).join(', ')}` : ''} -->`,
  ].filter(Boolean).join('\n')
  return { file: `${rec.name}.md`, content: `---\n${fm.join('\n')}\n---\n\n${body}\n` }
}

export function toClaudeSdk(rec, soul) {
  const { model } = claudeModel(rec.body.model)
  const entry = { description: description(rec), prompt: soul.markdown }
  const tools = mapTools(rec.will.toolsAllow.length ? rec.will.toolsAllow : ['Read', 'Glob', 'Grep'])
  if (tools.mapped.length) entry.tools = tools.mapped
  if (model && model !== 'inherit') entry.model = model
  return { file: `${rec.name}.agent.json`, content: JSON.stringify({ [rec.name]: entry, $provenance: { compiledBy: SELF, sourceRef: rec.sourceRef, contentHash: rec.contentHash, digest: soul.sourceDigest } }, null, 2) + '\n' }
}

function toSoul(rec, soul) {
  return { file: `${rec.name}.SOUL.md`, content: `${soul.markdown}\n\n<!-- SOUL compiled by ${SELF} from ${rec.sourceRef} @ ${rec.contentHash} · digest ${soul.sourceDigest} -->\n` }
}

// Emits the CompileRequest the SIS kernel ACCEPTS (worktrees/sis-operational-work-graph/src/
// instruction-compiler.ts), not the ContextPack it produces. Atoms are `generated: false` because
// they are read from the source layers, not mirrored from another atom in the same pack — the
// kernel drops every generated atom as "generated-mirror-not-authority", which turned the first
// version of this target into a pack that compiled to zero atoms (Grok gate 2026-09-19).
export function toCompileRequest(rec, soul, { budget, targetHarness } = {}) {
  const role = (a) => (a.layer === 'kernel' || a.layer === 'authority' || a.layer === 'verification' ? 'host-system' : a.layer === 'agent' ? 'host-developer' : 'host-user')
  return {
    packId: `pack_${rec.name}_${soul.sourceDigest.slice(0, 8)}`, taskId: `compile:${rec.name}`, correlationId: soul.sourceDigest, targetHarness: targetHarness && targetHarness !== 'context-pack' ? targetHarness : (rec.body.harness && rec.body.harness !== 'multi' ? rec.body.harness : 'claude-code'), repoRef: rec.estate, routeId: 'agent-compile', riskClass: rec.will.humanGates.length ? 'gated' : 'docs',
    // Budget dropping already happened in composeSoul; the kernel gets the post-drop mass so the
    // required layers never trip its over-token-budget halt (Grok gate, third pass).
    tokenBudget: soul.tokenEstimate,
    atoms: soul.selected.map((a) => ({ id: a.id, sourceRef: a.sourceRef, sourceKind: a.sourceKind, owner: rec.estate, scope: `agent:${rec.name}/${a.layer}`, activation: a.activation || 'always', contentHash: a.contentHash, tokenEstimate: a.tokenEstimate, lifecycle: 'active', generated: false })),
    hostBindings: soul.selected.map((a) => ({ atomId: a.id, hostMessageRole: role(a) })),
  }
}
function toContextPack(rec, soul, opts) {
  const request = toCompileRequest(rec, soul, opts)
  return { file: `${rec.name}.compile-request.json`, content: JSON.stringify({ ...request, $provenance: { compiledBy: SELF, sourceRef: rec.sourceRef, contentHash: rec.contentHash, layerDigest: soul.sourceDigest, excludedByBudget: soul.excluded } }, null, 2) + '\n' }
}

// A2A AgentCard v1.0 (a2a-protocol.org/v1.0.0/specification): the discovery
// document other agents fetch at /.well-known/agent-card.json. Field names are the spec's.
// The SIP extension carries the compiled identity digest and independent verifier. The default
// .invalid URL makes this a non-deployable template until a host binds a real HTTPS endpoint.
export function toA2ACard(rec, soul, { baseUrl = 'https://example.invalid/a2a', protocolBinding = 'HTTP+JSON', includeSourceRef = false } = {}) {
  const endpoint = new URL(`${baseUrl.replace(/\/$/, '')}/${encodeURIComponent(rec.name)}`)
  if (endpoint.protocol !== 'https:' || !['HTTP+JSON', 'JSONRPC', 'GRPC'].includes(protocolBinding)) throw new Error('A2A requires an HTTPS endpoint and supported protocol binding')
  const skills = rec.mind.skills.length ? rec.mind.skills : [rec.routing.domain || 'general']
  const extension = { uri: 'https://starlightintelligence.org/sip/agent-record/v1', description: 'Compiled identity digest, human gates, and independent verifier', required: false, params: { ...(includeSourceRef ? { sourceRef: rec.sourceRef } : {}), contentHash: rec.contentHash, layerDigest: soul.sourceDigest, layers: soul.selected.map((a) => a.id), humanGates: [...new Set(['push', 'publish', 'send', 'delete', 'money', ...rec.will.humanGates])], verifier: rec.routing.verifier && rec.routing.verifier !== 'declared' ? rec.routing.verifier : 'a different provider per CROSS-MODEL-GATE.md; never this agent', harness: rec.body.harness, brand: rec.brand } }
  const card = {
    name: rec.identity.displayName,
    description: description(rec),
    supportedInterfaces: [{ url: endpoint.href, protocolBinding, protocolVersion: '1.0' }],
    provider: { organization: 'Starlight Intelligence', url: 'https://starlightintelligence.org' },
    version: `0.1.0+${rec.contentHash}`,
    capabilities: { streaming: false, pushNotifications: false, extensions: [extension] },
    defaultInputModes: ['text/plain', 'text/markdown'],
    defaultOutputModes: ['text/markdown'],
    skills: skills.map((s) => ({ id: String(s).toLowerCase().replace(/[^a-z0-9/-]+/g, '-'), name: String(s).split('/').pop(), description: `Skill ${s} declared by ${rec.identity.displayName}`, tags: [rec.brand, rec.routing.domain, rec.routing.rank].filter(Boolean) })),
    securitySchemes: {},
  }
  return { file: `${rec.name}.agent-card.json`, content: JSON.stringify(card, null, 2) + '\n' }
}

export const TARGETS = {
  'a2a':          { emit: toA2ACard,     where: 'A2A v1.0.0 AgentCard for /.well-known/agent-card.json, with the SIP agent-record extension' },
  'claude-code':  { emit: toClaudeCode,  where: '.claude/agents/<name>.md (project or ~/.claude); read by Claude Code local and Claude cloud sessions' },
  'claude-sdk':   { emit: toClaudeSdk,   where: 'Agent SDK query({ agents: { [name]: entry } })' },
  'soul':         { emit: toSoul,        where: 'portable identity file: Hermes profile SOUL, OpenClaw SOUL.md, Agent Card soul_md' },
  'context-pack': { emit: toContextPack, where: 'SIS instruction-compiler CompileRequest (atoms + hostBindings) that compileInstructionPack accepts' },
}

// ------------------------------------------------------------------ forge pre-flight (a SUBSET of tools/agent-forge.mjs lintContent)
//
// agent-forge.mjs does not export its linter and only reads repos/claude-code-config/agents, so a
// compiled file in scratch/ is invisible to the real doctor until it is promoted. This pre-flight
// mirrors the gates that decide promotion: frontmatter shape, model tier, tools allowlist,
// money-domain write authority, dead read paths, self-verification, contract sections per rank,
// volatile facts. It is labelled a subset on purpose; "passes the doctor" is only true after
// `node tools/agent-forge.mjs doctor` runs on the promoted file.

const VALID_MODELS = new Set(['opus', 'sonnet', 'haiku', 'fable', 'inherit'])
const KNOWN_TOOLS = new Set(['Read', 'Write', 'Edit', 'NotebookEdit', 'Bash', 'Glob', 'Grep', 'Task', 'Agent', 'WebSearch', 'WebFetch', 'TodoWrite', 'Skill', 'Artifact', 'ToolSearch', 'Workflow', 'ExitPlanMode', 'EnterPlanMode', 'AskUserQuestion', 'SlashCommand', 'KillShell', 'BashOutput'])
const isToolToken = (t) => KNOWN_TOOLS.has(t) || /^mcp__[A-Za-z0-9_]+/.test(t) || /^[A-Z][A-Za-z0-9]*$/.test(t)
const MONEY_DOMAINS = new Set(['revenue', 'payments', 'billing', 'finance'])
const MONEY_SAFE_TOOLS = new Set(['Read', 'Grep', 'Glob'])
const REQUIRED_SECTIONS = {
  executive: ['Mandate', 'Read-first SSOT', 'Decision rights', 'Standing questions', 'Quality bar', 'Health signals', 'Pass procedure', 'Evidence rules', 'Boundaries', 'Refusals', 'Receipt duty', 'Maker'],
  general: ['Mission', 'Read-first SSOT', 'Scope', 'Health signals', 'Evidence rules', 'Write authority', 'Receipt duty', 'Escalation', 'Maker', 'Coordination', 'Pass procedure'],
  worker: ['Mission', 'Inputs', 'Procedure', 'Done-condition', 'Evidence', 'Boundaries', 'Receipt duty'],
  corps: ['Mission', 'Read-first SSOT', 'Quality bar', 'Procedure', 'Evidence', 'Boundaries', 'Receipt duty', 'Maker'],
}
const classifyRank = (name, fm) => (/^steward-/.test(name) ? 'general' : REQUIRED_SECTIONS[(fm.kind || '').toLowerCase()] ? (fm.kind || '').toLowerCase() : /^exec-/.test(name) ? 'executive' : /^(corps|eng|design)-/.test(name) ? 'corps' : 'free')
const VOLATILE = /(?<![\d.])(\d{1,6})\s*(?:\/\s*\d{1,6}\s*)?(pass(?:ing|ed|es)?|fail(?:ing|ed|s)?|red|green|loops?|repos?|packages?|skills?|agents?|tasks?|breaches?|PRs?|domains?|subscribers?|GiB|GB|MB)\b/gi
const VOLATILE_EXEMPT = /\b(?:of\s+(?:twelve|12)|domain\s+\d+\s+of\s+\d+|\d+\s*(?:min|minute|hour|h|day)s?|the\s+\d+\s+(?:domains?|stewards?|ranks?|phases?|sections?|lenses|obligations?|questions?)|\bv\d+\b|section\s+\d+)\b/i
// Read paths: absolute Windows paths and estate-relative paths in backticks. A path the agent
// declares as its own output (receipt, heartbeat) is a liveness fact, not a dead pointer.
function referencedPaths(body) {
  const out = []
  for (const line of body.split('\n')) {
    if (/^\s*<!--/.test(line)) continue
    const output = /\b(receipt|heartbeat|writes?|declared output)\b/i.test(line)
    for (const m of line.matchAll(/`?((?:[A-Za-z]:\\|~\/|~\\)[^`\s"')]+)`?/g)) out.push({ path: m[1].replace(/^~[\\/]/, HOME_DIR + '/'), output })
    for (const m of line.matchAll(/`((?:repos|ops|queen|graph|kernel|tools|logs|schemas|content-ops|strategy)\/[^`\s]+)`/g)) out.push({ path: join(ESTATE, m[1]), output })
  }
  return out.map((p) => ({ ...p, path: p.path.replace(/[,.;:)\]]+$/, '') })).filter((p) => !/[<>*{}]/.test(p.path))
}
const HOME_DIR = ESTATES.global.root.replace(/[\\/]\.claude$/, '')
export function lintClaude(name, raw) {
  const f = []
  const add = (severity, code, detail) => f.push({ severity, code, detail })
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!m) { add('BLOCKER', 'frontmatter-missing', 'no frontmatter'); return f }
  const fm = Object.fromEntries([...m[1].matchAll(/^([a-z]+):\s*(.*)$/gm)].map((x) => [x[1], x[2].replace(/^"(.*)"$/, '$1')]))
  const body = m[2]
  const kind = classifyRank(name, fm)
  if (!fm.name) add('BLOCKER', 'no-name', 'frontmatter has no name')
  if (!fm.description) add('BLOCKER', 'no-description', 'frontmatter has no description')
  else { if (fm.description.length < 60) add('WARN', 'thin-description', `${fm.description.length} chars`); if (!TRIGGER_RE.test(fm.description)) add('WARN', 'no-trigger', 'description never says when to reach for it') }
  const rawDesc = (m[1].match(/^description:[ \t]*(.*)$/m) || [])[1] || ''
  if (rawDesc) { const t = rawDesc.trim(); const quoted = t.length >= 2 && t[0] === t[t.length - 1] && (t[0] === '"' || t[0] === "'"); if (!quoted && !/^[|>][-+]?\d*$/.test(t) && (/:\s/.test(t) || '[]{}>|*&!%@`#'.includes(t[0]) || /\s#/.test(t))) add('BLOCKER', 'description-unquoted-ambiguous', 'unquoted description with ": " or a leading indicator character') }
  if (fm.model && !VALID_MODELS.has(String(fm.model).toLowerCase())) add('BLOCKER', 'bad-model', `model "${fm.model}" not in ${[...VALID_MODELS].join('|')}`)
  if (kind !== 'free') { if (!fm.model) add('WARN', 'no-model', 'inherits the caller'); if (!fm.tools) add('WARN', 'no-tools', 'write authority is prose-only') }
  const tools = fm.tools ? fm.tools.split(',').map((t) => t.trim()).filter(Boolean) : []
  if (fm.tools) { const junk = tools.filter((t) => !isToolToken(t)); if (junk.length) add('BLOCKER', 'tools-not-an-allowlist', junk.slice(0, 5).join(', ')) }
  const domain = String(fm.domain && fm.domain !== 'undefined' ? fm.domain : name.replace(/^steward-/, '')).toLowerCase()
  if (MONEY_DOMAINS.has(domain)) { if (!tools.length) add('BLOCKER', 'money-write-authority', `money domain "${domain}" declares no readable tools allowlist`); else { const forbidden = tools.filter((t) => !MONEY_SAFE_TOOLS.has(t)); if (forbidden.length) add('BLOCKER', 'money-write-authority', `money domain "${domain}" holds ${forbidden.join(', ')}`) } }
  for (const { path: p, output } of referencedPaths(body)) { if (existsSync(p)) continue; if (output) add('INFO', 'never-produced', p); else add('BLOCKER', 'dead-path', `reads a path that does not exist: ${p}`) }
  for (const line of body.split('\n')) { if (VOLATILE_EXEMPT.test(line) || /^\s*<!--/.test(line)) continue; VOLATILE.lastIndex = 0; if (VOLATILE.test(line)) add('WARN', 'volatile-fact', line.trim().slice(0, 80)) }
  if (kind === 'general' || kind === 'corps') { const mc = body.match(/##\s*Maker[^\n]*\n([\s\S]*?)(?=\n##\s|$)/i); if (mc && new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(mc[1]) && !/never this agent/i.test(mc[1])) add('BLOCKER', 'self-verifier', 'names itself as verifier') }
  const req = REQUIRED_SECTIONS[kind]
  if (req) { const heads = [...body.matchAll(/^#{1,3}\s+(.+)$/gm)].map((x) => x[1]).join(' | '); for (const s of req) if (!new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(heads)) add('WARN', 'missing-section', `contract section "${s}" absent`) }
  return f
}

// ------------------------------------------------------------------ cli

function loadRecords() {
  if (existsSync(ATLAS)) { try { return JSON.parse(readFileSync(ATLAS, 'utf8')).records } catch {} }
  return scanEstate().records
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1].replace(/\\/g, '/').replace(/^([a-z]):/i, (s) => s.toUpperCase()) || basename(process.argv[1] || '') === 'agent-compile.mjs') {
  if (has('targets')) { for (const [k, v] of Object.entries(TARGETS)) console.log(`${k.padEnd(13)} ${v.where}`); process.exit(0) }
  const records = loadRecords().filter((r) => r.kind === 'agent')
  const target = flag('target', 'claude-code')
  const targets = target === 'all' ? Object.keys(TARGETS) : target.split(',')
  for (const t of targets) if (!TARGETS[t]) { console.error(`unknown target ${t}; known: ${Object.keys(TARGETS).join(', ')}`); process.exit(2) }
  const budget = flag('budget') ? Number(flag('budget')) : Infinity
  // A relative --out is estate-root relative, whatever the shell's cwd is.
  const outRaw = flag('out', DEFAULT_OUT)
  const out = isAbsolute(outRaw) ? outRaw : join(ESTATE, outRaw)
  // Compiled files are projections awaiting a lane owner's promotion; the compiler never lands
  // them in a live agents directory by itself. Anything outside scratch/ needs --out-anywhere.
  if (!has('out-anywhere') && !out.startsWith(join(ESTATE, 'scratch'))) { console.error(`--out must be under ${join(ESTATE, 'scratch')} (pass --out-anywhere to override deliberately)`); process.exit(2) }
  let chosen
  if (has('all')) { const est = flag('estate'); chosen = records.filter((r) => !est || r.estate === est) }
  else { const key = args.find((a) => !a.startsWith('--') && !Object.keys(TARGETS).includes(a) && a !== flag('target') && a !== flag('out') && a !== flag('estate') && a !== flag('budget')); chosen = records.filter((r) => r.id === key || r.name === key || r.id.endsWith(`/${key}`)); if (!chosen.length) { console.error(`no agent matches ${key}`); process.exit(2) }; if (chosen.length > 1 && !flag('estate')) { console.error(`ambiguous: ${chosen.map((r) => r.id).join(', ')} — pass --estate`); process.exit(2) }; if (flag('estate')) chosen = chosen.filter((r) => r.estate === flag('estate')) }
  let blockers = 0, written = 0
  for (const rec of chosen) {
    const soul = composeSoul(rec, { budget })
    for (const t of targets) {
      const { file, content } = TARGETS[t].emit(rec, soul, { budget, targetHarness: t })
      if (t === 'claude-code') { const f = lintClaude(rec.name, content); const b = f.filter((x) => x.severity === 'BLOCKER'); blockers += b.length; if (f.length && (has('print') || chosen.length === 1 || b.length)) for (const x of f) console.log(`  ${x.severity.padEnd(7)} ${x.code.padEnd(30)} ${rec.name}: ${x.detail}`) }
      if (t === 'claude-code' && !has('print') && !has('quiet')) { /* pre-flight subset only; the real doctor runs after promotion */ }
      if (has('print')) { console.log(`\n===== ${t}/${file} (${tokens(content)} tokens) =====\n${content}`) }
      else { const dir = join(out, t); mkdirSync(dir, { recursive: true }); writeFileSync(join(dir, file), content); written++ }
    }
  }
  if (!has('print')) console.log(`compiled ${chosen.length} agent(s) × ${targets.length} target(s) → ${written} files under ${out} · pre-flight blockers ${blockers} (subset of agent-forge gates; run the doctor after promotion)`)
  process.exit(blockers ? 1 : 0)
}
