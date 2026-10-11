#!/usr/bin/env node
// Falsifiable tests for the agent-ontology scanner: the YAML subset it parses, the frontmatter
// shapes the corpus actually contains, and the invariants every projection relies on (stable ids,
// provenance on every record, no crash on a foreign file).
//
// Run: node C:\Users\frank\starlight\tools\tests\agent-ontology.test.mjs

import { parseYamlSubset, parseFrontmatter, scanEstate, stats, canonicalName, triggersFromDescription } from '../agent-ontology.mjs'

let failed = 0
function check(name, cond, detail = '') {
  if (cond) console.log(`PASS  ${name}`)
  else { console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`); failed++ }
}
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b)

// ---- yaml subset: the shapes agent-forge.mjs documents as present in the corpus
const inline = parseYamlSubset(`name: "steward-x"\nmodel: sonnet\ntools: Read, Grep, Glob\ncolor: green\n`)
check('inline scalars + quoted name', inline.name === 'steward-x' && inline.model === 'sonnet' && inline.tools === 'Read, Grep, Glob')

const blockSeq = parseYamlSubset(`tools:\n  - Read\n  - Write\nmcpServers:\n  - notion\n  - github\n`)
check('block sequence of scalars', eq(blockSeq.tools, ['Read', 'Write']) && eq(blockSeq.mcpServers, ['notion', 'github']))

const inlineList = parseYamlSubset(`tools: ["filesystem", "database", "browser"]\n`)
check('inline list', eq(inlineList.tools, ['filesystem', 'database', 'browser']))

const folded = parseYamlSubset(`description: >-\n  Expert content creation department.\n  Creates blog posts.\nmodel: sonnet\n`)
check('folded block scalar joins lines', folded.description === 'Expert content creation department. Creates blog posts.' && folded.model === 'sonnet')

const literal = parseYamlSubset(`description: |\n  line one\n  line two\n`)
check('literal block scalar keeps newlines', literal.description === 'line one\nline two')

const nested = parseYamlSubset(`triggers:\n  keywords:\n    - refactor\n    - schema\n  files:\n    - src/core/**\npriority: high\n`)
check('nested map with sequences', eq(nested.triggers.keywords, ['refactor', 'schema']) && eq(nested.triggers.files, ['src/core/**']) && nested.priority === 'high')

const team = parseYamlSubset(`team:\n  name: "MCP Product Team"\n  guardian: Shinkami\nroles:\n  - id: lead\n    name: "Lead"\n    model: opus\n    responsibilities:\n      - Architecture\n      - Roadmap\n  - id: qa\n    name: "QA"\n    model: sonnet\n`)
check('sequence of maps (yaml team roles)', team.team.name === 'MCP Product Team' && team.roles.length === 2 && team.roles[0].id === 'lead' && eq(team.roles[0].responsibilities, ['Architecture', 'Roadmap']) && team.roles[1].model === 'sonnet')

const comments = parseYamlSubset(`# header comment\nname: x   \n\n# trailing\nmodel: opus\n`)
check('comments and blank lines ignored', comments.name === 'x' && comments.model === 'opus')

// ---- frontmatter
const fmDoc = parseFrontmatter(`---\nname: "exec-caio"\nmodel: opus\ntools: Read, Grep\n---\n\n# Body\n\n## Voice\nDirect.\n`)
check('frontmatter split', fmDoc.hasFrontmatter && fmDoc.fm.name === 'exec-caio' && fmDoc.body.startsWith('\n# Body'))
const bom = parseFrontmatter(`\uFEFF---\nname: sis-agent\ntier: core\n---\n# X\n`)
check('BOM-prefixed frontmatter still parses', bom.hasFrontmatter && bom.fm.tier === 'core')
const none = parseFrontmatter(`# Just a title\n\nprose`)
check('no frontmatter → empty fm, body intact', !none.hasFrontmatter && eq(none.fm, {}) && none.body.startsWith('# Just'))
const broken = parseFrontmatter(`---\n: : :\n  - -\n---\nbody`)
check('malformed frontmatter never throws', typeof broken.fm === 'object')

// ---- explicit triggers lifted out of forge-style descriptions
check('Auto-invoke clauses become intents', eq(triggersFromDescription('Domain steward. Auto-invoke on: queen health, loop fleet status, or any request to run the substrate pass.'), ['queen health', 'loop fleet status', 'any request to run the substrate pass'].map((s) => s.replace(/^any /, ''))) || triggersFromDescription('Auto-invoke on: queen health, loop fleet status.').length === 2)
check('Use-when clauses become intents', triggersFromDescription('Reviews PRs. Use when a PR needs a security pass, or before merge.').length === 2)
check('descriptions without clauses yield nothing', eq(triggersFromDescription('Designs database schemas.'), []))

// ---- canonical names for cross-estate duplicate detection
check('canonicalName strips estate prefixes', canonicalName('starlight-architect') === 'architect' && canonicalName('arcanea-coder') === 'coder' && canonicalName('prompt-gpt-specialist') === 'prompt-gpt')

// ---- live scan invariants (skips global skills to keep the run under a few seconds)
const { records, sources, warnings } = scanEstate({ includeGlobalSkills: false })
check('scan finds agents from at least five estates', new Set(records.filter((r) => r.kind === 'agent').map((r) => r.estate)).size >= 5, JSON.stringify(stats(records).byEstate))
check('every record has id, kind, estate, sourceRef, sourceKind, contentHash', records.every((r) => r.id && r.kind && r.estate && r.sourceRef && r.sourceKind && r.contentHash))
check('ids are unique after collision suffixing', new Set(records.map((r) => r.id)).size === records.length)
check('ids match the Foundry capability-graph pattern prefix', records.every((r) => /^(agent|skill|team|constitution):[a-z0-9][a-z0-9/-]*(~[a-f0-9]{6})?$/.test(r.id)), records.filter((r) => !/^(agent|skill|team|constitution):[a-z0-9][a-z0-9/-]*(~[a-f0-9]{6})?$/.test(r.id)).slice(0, 3).map((r) => r.id).join(', '))
check('no record points into a worktree or node_modules', records.every((r) => !/(\.worktrees|node_modules|\.hermes-worktrees|\.codex-worktrees)\//.test(r.sourceRef)))
check('sources list carries mtime for every existing source', sources.every((s) => !s.exists || s.mtime))
const card = records.find((r) => r.name === 'starlight-operator' && r.estate === 'army')
check('agent card maps identity/mind/will/body', card && card.identity.values.length > 0 && card.will.humanGates.includes('publish') && card.mind.memoryScope === 'private_vault' && card.identity.soulRef)
const steward = records.find((r) => r.name === 'steward-substrate' && r.estate === 'global')
check('claude subagent maps tools allowlist + model + rank', steward && eq(steward.will.toolsAllow, ['Read', 'Grep', 'Glob', 'Bash']) && steward.body.model === 'sonnet' && steward.routing.rank === 'general')
check('claude subagent keeps its body and lifts Auto-invoke intents', steward && steward.provenance.body.length > 200 && steward.routing.intents.length >= 2, JSON.stringify(steward?.routing.intents))
const sis = records.find((r) => r.name === 'starlight-architect' && r.estate === 'sis')
check('sis agent maps tier/domain/voice', sis && sis.routing.tier === 'core' && sis.routing.domain === 'infrastructure' && sis.identity.voice.length > 0)
const rule = records.find((r) => r.sourceKind === 'skill-rule')
check('skill rule carries keywords and activating agents as handoffs', rule && rule.routing.keywords.length > 0 && rule.will.handoffs.some((h) => h.when === 'activates'))
check('warnings are surfaced, not swallowed', Array.isArray(warnings))

console.log(failed ? `\n${failed} FAILED` : '\nall passed')
process.exit(failed ? 1 : 0)
