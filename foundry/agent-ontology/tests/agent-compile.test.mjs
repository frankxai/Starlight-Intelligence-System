#!/usr/bin/env node
// Falsifiable tests for the agent compiler: SOUL composition order and provenance, budget
// exclusion, model mapping, description applicability, and the forge-gate mirror.
//
// Run: node C:\Users\frank\starlight\tools\tests\agent-compile.test.mjs

import { composeSoul, claudeModel, lintClaude, TARGETS } from '../agent-compile.mjs'

let failed = 0
function check(name, cond, detail = '') {
  if (cond) console.log(`PASS  ${name}`)
  else { console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`); failed++ }
}

const base = {
  id: 'agent:test/sample-steward', kind: 'agent', name: 'sample-steward', estate: 'global', brand: 'starlight',
  sourceRef: 'repos/claude-code-config/agents/sample-steward.md', sourceKind: 'claude-subagent-md', contentHash: 'abc123', tokenEstimate: 100,
  identity: { displayName: 'Sample Steward', tagline: 'Keeps the sample healthy.', voice: 'Direct.', values: ['proof over prose'], boundaries: ['never self-certify'], soulRef: null },
  mind: { skills: ['todo-discipline'], kb: ['TRUTH.md'], memoryScope: null, approach: 'Read, measure, report.' },
  will: { toolsAllow: ['Read', 'Grep', 'Glob', 'Bash'], toolsDeny: [], humanGates: ['dns'], handoffs: [{ to: 'steward-infra', when: 'DNS findings' }], mcpServers: [] },
  body: { model: 'sonnet', surfaces: [], harness: 'claude-code', workingDirectories: [] },
  routing: { description: 'Domain steward for samples. Auto-invoke on: sample health checks.', keywords: [], intents: [], files: [], verbs: [], domain: 'samples', tier: null, rank: 'general', status: null, verifier: null },
  provenance: { scanned: true, lifecycle: 'active', family: null, headings: [] },
}

// ---- composition
const soul = composeSoul(base)
const order = soul.selected.map((a) => a.layer)
check('layers compose in kernel → brand → substrate → constitution → agent → authority → verification order',
  JSON.stringify(order) === JSON.stringify(['kernel', 'brand', 'substrate', 'constitution', 'agent', 'authority', 'verification']), order.join(','))
check('every atom carries sourceRef, contentHash and tokenEstimate', soul.atoms.every((a) => a.sourceRef && /^[a-f0-9]{16}$/.test(a.contentHash) && a.tokenEstimate > 0))
check('kernel layer is the Omotenashi install block', /Omotenashi Kernel/.test(soul.selected[0].text) && /made \/ verified \/ proposed/.test(soul.selected[0].text))
check('agent layer carries values, boundaries, read-first and skills', /proof over prose/.test(soul.markdown) && /never self-certify/.test(soul.markdown) && /TRUTH\.md/.test(soul.markdown) && /todo-discipline/.test(soul.markdown))
check('human gates always include the five kernel gates plus the card gates', /Always confirm before: push, publish, send, delete, money, dns/.test(soul.markdown))
check('a missing verifier defaults to a different provider, never the agent', /Never this agent/.test(soul.markdown))
check('sourceDigest is stable for identical input', composeSoul(base).sourceDigest === soul.sourceDigest)
check('sourceDigest changes when identity changes', composeSoul({ ...base, identity: { ...base.identity, tagline: 'changed' } }).sourceDigest !== soul.sourceDigest)

// ---- brand switch
const arc = composeSoul({ ...base, brand: 'arcanea', name: 'lore-keeper', routing: { ...base.routing, domain: 'lore' } })
check('arcanea brand swaps Frank DNA for the Luminor register and canon pointer', arc.selected.some((a) => a.id === 'brand.luminor') && arc.selected.some((a) => a.id === 'brand.canon') && !arc.selected.some((a) => a.id === 'brand.frank-dna'))
check('arcanea lore role picks the creative constitution', arc.selected.find((a) => a.layer === 'constitution').sourceRef.endsWith('ARCANEA_CREATIVE_AGENT.md'))
const coder = composeSoul({ ...base, name: 'backend-coder', routing: { ...base.routing, description: 'Implements backend code and CI.', domain: 'engineering' } })
check('engineering role picks the codex execution constitution', coder.selected.find((a) => a.layer === 'constitution').sourceRef.endsWith('CODEX_EXECUTION_AGENT.md'))

// ---- budget
const tight = composeSoul(base, { budget: 600 })
check('over budget drops optional layers largest-first and records why', tight.excluded.length > 0 && tight.excluded.every((e) => /over-budget/.test(e.reason)) && tight.tokenEstimate <= soul.tokenEstimate)
check('required layers survive any budget', ['kernel', 'constitution', 'agent', 'authority', 'verification'].every((l) => tight.selected.some((a) => a.layer === l)))
const tightPack = JSON.parse(TARGETS['context-pack'].emit(base, tight, { budget: 600, targetHarness: 'claude-code' }).content)
check('a budgeted compile hands the kernel the post-drop mass, never a budget below its required layers', tightPack.tokenBudget === tight.tokenEstimate && tightPack.tokenBudget >= tightPack.atoms.reduce((n, a) => n + a.tokenEstimate, 0))

// ---- model mapping
check('aliases pass through', claudeModel('opus').model === 'opus' && claudeModel('inherit').model === 'inherit')
check('current ids map to tiers', claudeModel('claude-sonnet-5').model === 'sonnet' && claudeModel('claude-fable-5-1').model === 'fable' && claudeModel('claude-haiku-4-5-20251001').model === 'haiku')
check('legacy or policy pins become inherit with a note', claudeModel('anthropic/claude-opus-4-5').model === 'inherit' && /not a dispatchable tier/.test(claudeModel('route by consequence').note))
check('no pin stays unpinned', claudeModel(null).model === null)

// ---- emitters
const cc = TARGETS['claude-code'].emit(base, soul, { targetHarness: 'claude-code' })
check('claude-code emits quoted name/description, model and tools allowlist', /^name: "sample-steward"$/m.test(cc.content) && /^description: ".+"$/m.test(cc.content) && /^model: sonnet$/m.test(cc.content) && /^tools: Read, Grep, Glob, Bash$/m.test(cc.content))
check('claude-code carries a provenance footer with digest', /compiled by tools\/agent-compile\.mjs from .+ @ abc123 .+ digest [a-f0-9]{24}/.test(cc.content))
check('claude-code output passes the forge-gate mirror with no BLOCKER', lintClaude('sample-steward', cc.content).filter((f) => f.severity === 'BLOCKER').length === 0, JSON.stringify(lintClaude('sample-steward', cc.content)))
const noTrig = TARGETS['claude-code'].emit({ ...base, routing: { ...base.routing, description: 'Designs database schemas.', keywords: ['schema', 'migration'] } }, soul, {})
check('a description without applicability gets a derived "Use when" clause from triggers', /Use when the request concerns schema, migration/.test(noTrig.content))
const sdk = JSON.parse(TARGETS['claude-sdk'].emit(base, soul, {}).content)
check('claude-sdk emits the agents-option entry shape', sdk['sample-steward'] && sdk['sample-steward'].description && sdk['sample-steward'].prompt && JSON.stringify(sdk['sample-steward'].tools) === JSON.stringify(['Read', 'Grep', 'Glob', 'Bash']) && sdk['sample-steward'].model === 'sonnet')
const pack = JSON.parse(TARGETS['context-pack'].emit(base, soul, { budget: Infinity, targetHarness: 'claude-code' }).content)
check('context-pack is a CompileRequest with source atoms (generated: false) and one host binding per atom', ['packId', 'taskId', 'correlationId', 'targetHarness', 'repoRef', 'routeId', 'riskClass', 'tokenBudget', 'atoms', 'hostBindings'].every((k) => k in pack) && pack.atoms.every((a) => a.id && a.sourceRef && a.sourceKind && a.owner && a.scope && a.activation && a.contentHash && Number.isFinite(a.tokenEstimate) && a.lifecycle === 'active' && a.generated === false) && pack.hostBindings.length === pack.atoms.length)
check('context-pack binds kernel/authority/verification to host-system, agent to host-developer', pack.hostBindings.find((b) => b.atomId === 'kernel.posture').hostMessageRole === 'host-system' && pack.hostBindings.find((b) => b.atomId.startsWith('agent.')).hostMessageRole === 'host-developer')
// The real SIS kernel, when its worktree build is present: the pack must compile to ALL atoms,
// not halt, not drop them as generated mirrors.
const kernelPath = 'C:/Users/frank/starlight/worktrees/sis-operational-work-graph/dist/instruction-compiler.js'
try {
  const { compileInstructionPack } = await import('file:///' + kernelPath)
  const { $provenance, ...request } = pack
  const out = compileInstructionPack(request)
  check('SIS compileInstructionPack accepts the request and selects every atom', out.halted === false && out.selectedAtoms.length === request.atoms.length && out.excludedAtoms.length === 0, JSON.stringify({ halted: out.halted, haltReason: out.haltReason, selected: out.selectedAtoms.length, excluded: out.excludedAtoms }))
} catch (e) { console.log(`SKIP  SIS kernel not importable at ${kernelPath}: ${e.message.slice(0, 80)}`) }

// ---- A2A AgentCard
const cardOut = JSON.parse(TARGETS['a2a'].emit(base, soul, {}).content)
check('a2a card carries the v1.0.0 field set', ['name', 'description', 'url', 'provider', 'version', 'protocolVersion', 'capabilities', 'skills', 'securitySchemes', 'security', 'defaultInputModes', 'defaultOutputModes', 'supportsAuthenticatedExtendedCard', 'extensions'].every((k) => k in cardOut) && cardOut.protocolVersion === '1.0.0')
check('a2a skills carry id/name/description/tags and the SIP extension carries digest, gates and verifier', cardOut.skills.every((s) => s.id && s.name && s.description && Array.isArray(s.tags)) && cardOut.extensions[0].params.layerDigest === soul.sourceDigest && cardOut.extensions[0].params.humanGates.includes('money') && /never this agent|different provider/i.test(cardOut.extensions[0].params.verifier))

// ---- source body survives compilation (contract sections and read paths stay lintable)
const withBody = { ...base, name: 'steward-sample', routing: { ...base.routing, rank: 'general' }, provenance: { ...base.provenance, body: '# Steward - sample\n\n## Mission\nKeep samples healthy.\n\n## Read-first SSOT\n1. `C:\\Users\\frank\\starlight\\TRUTH.md`\n\n## Scope\nsamples.\n\n## Health signals\n`C:\\Users\\frank\\starlight\\logs\\heartbeats\\heartbeat-steward-sample.json` is the receipt.\n\n## Evidence rules\nmeasured.\n\n## Write authority\nread-only.\n\n## Receipt duty\nwrite it.\n\n## Escalation\nnone.\n\n## Maker≠checker\nsteward-infra.\n\n## Coordination\nclaim a lane.\n\n## Pass procedure\n1. read.\n' } }
const ccBody = TARGETS['claude-code'].emit(withBody, composeSoul(withBody), {}).content
check('a source body is carried into the agent layer verbatim', /## Health signals/.test(ccBody) && /## Pass procedure/.test(ccBody))
const bodyLint = lintClaude('steward-sample', ccBody)
check('a general with its contract sections raises no missing-section warning', !bodyLint.some((f) => f.code === 'missing-section'), JSON.stringify(bodyLint.filter((f) => f.code === 'missing-section').map((f) => f.detail)))
check('a declared receipt path that was never written is INFO, not a dead path', bodyLint.some((f) => f.code === 'never-produced') && !bodyLint.some((f) => f.code === 'dead-path'), JSON.stringify(bodyLint))
const deadBody = { ...withBody, provenance: { ...withBody.provenance, body: withBody.provenance.body.replace('TRUTH.md', 'DOES-NOT-EXIST.md') } }
check('a dead read path in the source body blocks', lintClaude('steward-sample', TARGETS['claude-code'].emit(deadBody, composeSoul(deadBody), {}).content).some((f) => f.code === 'dead-path'))
check('a money domain with Bash in its allowlist blocks', lintClaude('steward-revenue', '---\nname: "steward-revenue"\ndescription: "Use when auditing revenue paths with enough characters to pass the thin check."\nmodel: sonnet\ntools: Read, Grep, Glob, Bash\n---\n## Mission\nx\n').some((f) => f.code === 'money-write-authority'))
check('a money domain with only read tools passes the money gate', !lintClaude('steward-revenue', '---\nname: "steward-revenue"\ndescription: "Use when auditing revenue paths with enough characters to pass the thin check."\nmodel: sonnet\ntools: Read, Grep, Glob\n---\n## Mission\nx\n').some((f) => f.code === 'money-write-authority'))

// ---- forge-gate mirror
check('lint blocks a self-verifier', lintClaude('steward-x', '---\nname: "steward-x"\ndescription: "Use when testing the linter with enough characters to pass the thin check."\nmodel: sonnet\ntools: Read\n---\n## Maker ≠ checker\nsteward-x checks its own work.\n').some((f) => f.code === 'self-verifier'))
check('lint blocks a bad model tier', lintClaude('x', '---\nname: "x"\ndescription: "Use when testing the linter with enough characters to pass the thin check."\nmodel: claude-opus-4-6\n---\nbody').some((f) => f.code === 'bad-model'))
check('lint blocks prose in the tools allowlist', lintClaude('x', '---\nname: "x"\ndescription: "Use when testing the linter with enough characters to pass the thin check."\nmodel: sonnet\ntools: Read, deliberately NO Edit\n---\nbody').some((f) => f.code === 'tools-not-an-allowlist'))
check('lint blocks an unquoted description containing a colon', lintClaude('x', '---\nname: "x"\ndescription: Use when: testing\nmodel: sonnet\n---\nbody').some((f) => f.code === 'description-unquoted-ambiguous'))
check('lint warns on volatile facts in the body', lintClaude('x', '---\nname: "x"\ndescription: "Use when testing the linter with enough characters to pass the thin check."\nmodel: sonnet\ntools: Read\n---\nWe have 21 loops passing.\n').some((f) => f.code === 'volatile-fact'))

console.log(failed ? `\n${failed} FAILED` : '\nall passed')
process.exit(failed ? 1 : 0)
