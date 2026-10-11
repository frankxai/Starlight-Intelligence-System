#!/usr/bin/env node
// Falsifiable tests for the atlas router: signal extraction, scoring, maker != checker binding,
// refusal and ambiguity, and that model tiers are read from the matrix rather than typed.
//
// Run: node C:\Users\frank\starlight\tools\tests\agent-route.test.mjs

import { extractSignals, scoreAgent, route, readMatrix, readCheckerLane, stem } from '../agent-route.mjs'

let failed = 0
function check(name, cond, detail = '') {
  if (cond) console.log(`PASS  ${name}`)
  else { console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`); failed++ }
}

const rec = (over) => ({
  id: `agent:${over.estate || 'test'}/${over.name}`, kind: 'agent', name: over.name, estate: over.estate || 'test', brand: over.brand || 'starlight', sourceRef: `x/${over.name}.md`, sourceKind: 'claude-subagent-md', contentHash: 'h', tokenEstimate: 1,
  identity: { displayName: over.name, tagline: over.tagline || '', voice: over.voice || '', values: [], boundaries: [], soulRef: null },
  mind: { skills: [], kb: [], memoryScope: null, approach: over.approach || '' },
  will: { toolsAllow: over.tools || [], toolsDeny: [], humanGates: [], handoffs: [], mcpServers: [] },
  body: { model: over.model || null, surfaces: [], harness: 'claude-code', workingDirectories: [] },
  routing: { description: over.description || '', keywords: over.keywords || [], intents: over.intents || [], files: over.files || [], verbs: [], domain: over.domain || null, tier: null, rank: over.rank || null, status: null, verifier: null },
  provenance: { scanned: true, lifecycle: over.lifecycle || 'active', family: null, headings: [] },
})

// ---- signals
const s1 = extractSignals('Publish the newsletter and send it to subscribers after you push the fix to app/page.tsx')
check('gates detected from request words', s1.gates.includes('publish') && s1.gates.includes('send') && s1.gates.includes('push') && s1.riskClass === 'gated')
check('file paths extracted', s1.files.includes('app/page.tsx'))
check('brand inferred from Arcanea words', extractSignals('expand the Godbeast lore').brand === 'arcanea' && extractSignals('fix the build').brand === null)
check('work shape cue → verify row', /verify/i.test(String(extractSignals('review this PR').shapeRow)))
check('stemming folds plurals and -ing', stem('schemas') === 'schema' && stem('designs') === 'design' && stem('routing') === 'rout' && stem('api') === 'api')
check('reversible when no gate words', extractSignals('read the heartbeat file').riskClass === 'reversible')

// ---- scoring
const archit = rec({ name: 'starlight-architect', description: 'Designs database schemas, directory layouts, and system boundaries.', domain: 'infrastructure' })
const writer = rec({ name: 'content-writer', description: 'Writes blog posts and newsletters. Use when drafting content.', keywords: ['blog', 'newsletter'] })
const sig = extractSignals('design the database schema and API for the memory gateway')
check('description overlap survives plural/verb forms', scoreAgent(archit, sig).score > scoreAgent(writer, sig).score, `${scoreAgent(archit, sig).score} vs ${scoreAgent(writer, sig).score}`)
const kw = extractSignals('draft the newsletter')
check('explicit keyword triggers outrank description prose', scoreAgent(writer, kw).why.some((w) => w.startsWith('keyword')) && scoreAgent(writer, kw).score >= 3)
const arcSig = extractSignals('write the lore', { brand: 'arcanea' })
check('brand mismatch penalises a non-starlight agent, matches reward', scoreAgent(rec({ name: 'lore-keeper', brand: 'arcanea', description: 'Keeps the lore.' }), arcSig).score > scoreAgent(rec({ name: 'lore-writer', brand: 'frankx', description: 'Writes the lore.' }), arcSig).score)
check('file glob match scores', scoreAgent(rec({ name: 'fe', files: ['app/**/*.tsx'], description: 'x' }), extractSignals('fix app/page.tsx')).why.some((w) => w.startsWith('file')))
check('legacy model pin and draft lifecycle are penalised', scoreAgent(rec({ name: 'old', description: 'review code', model: 'claude-opus-4-6', lifecycle: 'draft' }), extractSignals('review code')).why.filter((w) => /legacy|lifecycle/.test(w)).length === 2)

// ---- resolution
const records = [
  rec({ name: 'steward-substrate', estate: 'global', description: 'Domain steward for the queen dispatcher, loop fleet, heartbeat mesh. Auto-invoke on: queen health, heartbeat check.', intents: ['queen health', 'heartbeat check'], tools: ['Read', 'Grep', 'Glob', 'Bash'], model: 'sonnet', rank: 'general' }),
  rec({ name: 'corps-reliability', estate: 'factory', description: 'Craft corps for production reliability: verify deployments, loops, heartbeats. Auto-invoke on: is the deploy green, verify the deployment.', intents: ['is the deploy green', 'verify the deployment'], rank: 'corps' }),
  rec({ name: 'content-writer', estate: 'acos', description: 'Writes blog posts. Use when drafting content.', keywords: ['blog'] }),
  rec({ name: 'code-reviewer', estate: 'acos', description: 'Reviews code for defects. Use after code changes.', rank: 'worker' }),
]
const r1 = route('check whether the queen dispatcher heartbeat is fresh and the loop fleet is alive', { records })
check('resolves to the steward and binds a different-estate verifier', r1.resolution !== 'refused' && r1.maker.name === 'steward-substrate' && r1.verifier && r1.verifier.name !== 'steward-substrate' && r1.verifier.estate !== 'global', JSON.stringify({ res: r1.resolution, maker: r1.maker?.name, verifier: r1.verifier?.name }))
const r2 = route('order a pizza for the office party', { records })
check('an unroutable request is refused, not guessed', r2.resolution === 'refused' && r2.maker === null)
const r3 = route('draft the blog post about heartbeat checks', { records, threshold: 3 })
check('candidates are ranked and dropped count is reported', r3.candidates.length >= 2 && typeof r3.dropped === 'number')
const dup = [...records, rec({ name: 'steward-substrate', estate: 'acos', description: records[0].routing.description, intents: records[0].routing.intents, tools: ['Read'], model: 'sonnet', rank: 'general' })]
const r4 = route('check whether the queen dispatcher heartbeat is fresh and the loop fleet is alive', { records: dup })
check('a same-name copy in another estate does not make the route ambiguous, and the copy is reported', r4.resolution !== 'ambiguous' && r4.verifier && r4.verifier.name !== 'steward-substrate' && r4.maker.copies.length === 1 && r4.maker.copies[0].id !== r4.maker.id && r4.maker.copies[0].id.endsWith('/steward-substrate'), JSON.stringify({ res: r4.resolution, maker: r4.maker?.id, copies: r4.maker?.copies }))
const prose = [rec({ name: 'prose-only', estate: 'x', description: 'queen dispatcher heartbeat loop fleet alive fresh check substrate mesh gates enforcement watch' }), records[3]]
check('long prose alone cannot cross the resolve threshold', route('check whether the queen dispatcher heartbeat is fresh and the loop fleet is alive', { records: prose }).resolution === 'refused')
check('verifier reports harness sameness and the cross-provider lane', r1.verifier && typeof r1.verifier.sameHarnessAsMaker === 'boolean' && r1.verifier.crossProviderLane)

// ---- doctrine reads
const m = readMatrix()
check('routing matrix rows are read from the file, never typed', m.rows.length >= 10 && m.rows.every((r) => r.shape && r.primary) && ['PROPOSED', 'ADOPTED', 'unknown'].includes(m.status))
const verifyRow = route('verify the deployment is green', { records }).workShape
check('verify request lands on the matrix verify row with its primary model', verifyRow.row && /verify/i.test(verifyRow.row) && verifyRow.primary.length > 0 && verifyRow.source.endsWith('model-routing-matrix.md'))
const lane = readCheckerLane()
check('checker lane is read from CROSS-MODEL-GATE.md', lane && lane.path === 'CROSS-MODEL-GATE.md' && lane.who.length > 0)
const env = route('review this PR before merge', { records })
check('envelope carries schema, risk class and gates', env.schema === 'starlight.route.v1' && env.riskClass === 'gated' && env.gates.includes('push'))

console.log(failed ? `\n${failed} FAILED` : '\nall passed')
process.exit(failed ? 1 : 0)
