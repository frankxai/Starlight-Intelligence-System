#!/usr/bin/env node
// agent-route.mjs — one router over the whole agent atlas, with the signals no existing router reads.
//
// Twelve routers exist in the estate and each reads its own roster: keyword tables that resolve
// the same word to different agents, and none of them scores risk class, brand, work shape,
// maker != checker or harness fitness. This router reads the atlas (every agent the scanner can
// see), the model routing matrix (work shape → model tier, never hand-typed here), the cross-model
// gate (who may check) and the harness admission breaker, and returns ONE envelope:
//
//   maker      the agent that leads, with the scored reasons
//   verifier   a different agent, different estate where possible — maker != checker is structural
//   workShape  the routing-matrix row the request falls under, with its primary/secondary model
//   riskClass  gated (names the human gates the request touches) or reversible
//   resolution resolved | ambiguous | refused — an unrouted request is a fact, not something to
//              paper over (AIS route.mjs posture)
//
//   node tools/agent-route.mjs "<request>" [--brand arcanea] [--estate sis] [--files a.ts,b.md]
//                              [--harness claude-code] [--json] [--top 5]

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { scanEstate, canonicalName, ESTATE } from './agent-ontology.mjs'

const ATLAS = join(ESTATE, 'graph', 'agents.atlas.json')
const MATRIX = join(ESTATE, 'ops', 'model-arena', 'kb', 'model-routing-matrix.md')
const GATE = join(ESTATE, 'CROSS-MODEL-GATE.md')
const ADMISSION = join(ESTATE, 'tools', 'harness-admission.mjs')

// ------------------------------------------------------------------ signals

const STOP = new Set('the a an and or of to in on for with by at from as is are be this that it its into our your my we you they them their about over under than then so if when while do does did can could should would will just also not no yes please need want make sure via per all any some more most very what which whether'.split(' '))
// Light stemming so "schemas" meets "schema" and "designs" meets "design". Not linguistics: three
// suffix rules, applied identically to the request and to every agent's description.
export const stem = (t) => t.length > 4 ? t.replace(/(ing|ers|ies)$/, (m) => (m === 'ies' ? 'y' : '')).replace(/(ed|es|s)$/, '') : t
const GATE_WORDS = { publish: /\b(publish|post|tweet|go live|ship to prod|release publicly)\b/i, send: /\b(send|email|dm|message|notify|broadcast|newsletter to)\b/i, push: /\b(push|force[- ]push|merge|deploy|promote)\b/i, delete: /\b(delete|drop|purge|remove permanently|wipe|rm -rf)\b/i, money: /\b(pay|payment|refund|charge|spend|buy|price|checkout|polar|stripe|invoice)\b/i, secrets: /\b(secret|token|api key|credential|password)\b/i, dns: /\bdns\b|\bdomain record/i, cron: /\b(cron|scheduled task|schedule)\b/i }
// Work-shape families: which routing-matrix row a request falls under. The row NAME is matched
// against the matrix file at run time, so model ids are read, never typed.
const SHAPES = [
  { row: /verify|checker/i, cues: /\b(verify|review|audit|check|critique|red[- ]team|refute|validate|qa)\b/i },
  { row: /swarm orchestration|queen/i, cues: /\b(orchestrat|swarm|dispatch|queue|fan[- ]out|coordinate|fleet)\b/i },
  { row: /plan before multi-file/i, cues: /\b(plan|spec|roadmap|architecture|architect|schema|data model|database design|api design|system design)\b/i },
  { row: /peak multi-file build/i, cues: /\b(build|implement|code|refactor|migrate|scaffold|fix|write (a|the) (function|module|component|api)|ci\b|test suite)\b/i },
  { row: /research \+ live search/i, cues: /\b(research|investigate|what is the latest|search|landscape|compare|benchmark)\b/i },
  { row: /cheap high-volume classification/i, cues: /\b(classify|triage|count|scan|inventory|label|tag|bulk|dedupe)\b/i },
  { row: /creative arcanea/i, cues: /\b(arcanea|lore|canon|guardian|luminor|worldbuild|mythology|godbeast)\b/i },
  { row: /social & newsletter/i, cues: /\b(social|newsletter|linkedin|tweet|thread|post copy|email sequence|blog)\b/i },
  { row: /frontier judgment/i, cues: /\b(decide|judgment|kill|keep|doctrine|strategy|taste|brand narrative|should we|which)\b/i },
  { row: /long-horizon cached/i, cues: /\b(overnight|long[- ]running|hours|marathon|autonomous run)\b/i },
]

export function extractSignals(text, opts = {}) {
  const lower = text.toLowerCase()
  const tokens = [...new Set(lower.replace(/[^a-z0-9/._-]+/g, ' ').split(' ').filter((t) => t.length >= 3 && !STOP.has(t)).map(stem))]
  const files = [...new Set([...(opts.files || []), ...(text.match(/[\w./-]+\.(?:ts|tsx|js|mjs|json|md|yaml|yml|py|ps1|css|html|sql)\b/g) || [])])]
  const gates = Object.entries(GATE_WORDS).filter(([, re]) => re.test(text)).map(([g]) => g)
  const brand = opts.brand || (/\barcanea|luminor|guardian|godbeast/i.test(text) ? 'arcanea' : /\bfrankx\b|frank ?x\.ai/i.test(text) ? 'frankx' : /\bgencreator/i.test(text) ? 'gencreator' : null)
  const shape = SHAPES.find((s) => s.cues.test(text))
  return { tokens, files, gates, riskClass: gates.length ? 'gated' : 'reversible', brand, shapeRow: shape ? shape.row : null, estate: opts.estate || null }
}

// ------------------------------------------------------------------ doctrine sources (read, never typed)

export function readMatrix() {
  if (!existsSync(MATRIX)) return { rows: [], status: 'missing' }
  const text = readFileSync(MATRIX, 'utf8')
  // The matrix's own status word wins; its long caveat paragraph is a pointer, not a routing field.
  const status = (text.match(/\b(PROPOSED|ADOPTED)\b/) || [])[1] || 'unknown'
  const rows = []
  for (const line of text.split('\n')) {
    const m = line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|$/)
    if (!m || /^-+$/.test(m[1].trim()) || /^work shape$/i.test(m[1].trim())) continue
    rows.push({ shape: m[1].trim(), primary: m[2].replace(/\*\*/g, '').trim(), secondary: m[3].replace(/\*\*/g, '').trim(), notes: m[4].trim().slice(0, 160) })
  }
  return { rows, status, path: 'ops/model-arena/kb/model-routing-matrix.md' }
}

export function readCheckerLane() {
  if (!existsSync(GATE)) return null
  const text = readFileSync(GATE, 'utf8')
  const m = text.match(/^\|\s*\*\*Verify \/ check\*\*\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$/m)
  return m ? { who: m[1].replace(/\*\*/g, '').trim(), notes: m[2].trim(), path: 'CROSS-MODEL-GATE.md' } : { who: 'a different provider than built it', notes: 'row not parsed', path: 'CROSS-MODEL-GATE.md' }
}

function admission(harness) {
  if (!existsSync(ADMISSION)) return { status: 'unknown', reason: 'harness-admission.mjs missing' }
  const r = spawnSync(process.execPath, [ADMISSION, 'check', '--harness', harness], { encoding: 'utf8', timeout: 8000 })
  if (r.status === 0) return { status: 'ADMIT', reason: (r.stdout || '').trim().split('\n')[0] }
  if (r.status === 3) return { status: 'HOLD', reason: (r.stdout || r.stderr || '').trim().split('\n')[0] }
  return { status: 'unknown', reason: 'check itself failed; callers must admit' }
}

// ------------------------------------------------------------------ scoring

const globToRe = (g) => new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*\//g, '(?:.*/)?').replace(/\*/g, '[^/]*') + '$')
const VERIFY_ROLE = /\b(review|audit|verif|critic|sentinel|reliability|red[- ]team|evaluat|qa|checker|refut)\b/i

export function scoreAgent(a, sig) {
  const why = []
  let s = 0
  // A trigger matches when a request token equals it, contains it (stem), or — for multi-word
  // triggers like "queen health" — when every word of the trigger appears in the request.
  const hit = (list, w, label) => { const h = list.filter((k) => { const kk = stem(String(k).toLowerCase()); const words = String(k).toLowerCase().split(/\s+/).map(stem).filter((x) => x.length >= 3 && !STOP.has(x)); return sig.tokens.some((t) => t === kk || (kk.length > 4 && t.includes(kk))) || (words.length > 1 && words.every((x) => sig.tokens.includes(x))) }); if (h.length) { s += w * Math.min(h.length, 3); why.push(`${label}: ${h.slice(0, 3).join(', ')}`) } }
  hit(a.routing.keywords, 3, 'keyword')
  hit(a.routing.intents, 3, 'intent')
  const fileHits = a.routing.files.filter((g) => sig.files.some((f) => { try { return globToRe(g).test(f) } catch { return false } }))
  if (fileHits.length) { s += 4; why.push(`file: ${fileHits[0]}`) }
  const nameTokens = a.name.split(/[-/]/).filter((t) => t.length >= 3).map(stem)
  const nameHit = nameTokens.filter((t) => sig.tokens.includes(t))
  if (nameHit.length) { s += 2 * Math.min(nameHit.length, 2); why.push(`name: ${nameHit.join(', ')}`) }
  const descTokens = new Set((a.routing.description + ' ' + a.identity.tagline + ' ' + a.mind.approach + ' ' + a.identity.voice).toLowerCase().replace(/[^a-z0-9-]+/g, ' ').split(' ').filter((t) => t.length >= 4 && !STOP.has(t)).map(stem))
  // Prose is capped below the resolve threshold on purpose: a long description alone can never
  // resolve a route; it needs a trigger, a name, a domain, a file or a brand to cross the line.
  const descHit = sig.tokens.filter((t) => descTokens.has(t))
  if (descHit.length) { s += Math.min(descHit.length, 4); why.push(`description: ${descHit.slice(0, 4).join(', ')}`) }
  if (a.routing.domain && sig.tokens.some((t) => String(a.routing.domain).toLowerCase().includes(t))) { s += 2; why.push(`domain: ${a.routing.domain}`) }
  if (sig.brand) { if (a.brand === sig.brand) { s += 2; why.push(`brand: ${a.brand}`) } else if (a.brand !== 'starlight') { s -= 3; why.push(`brand mismatch: ${a.brand}`) } }
  if (sig.estate && a.estate === sig.estate) { s += 2; why.push(`estate: ${a.estate}`) }
  if (sig.shapeRow && /verify|checker/i.test(String(sig.shapeRow)) && VERIFY_ROLE.test(a.name + ' ' + a.routing.description)) { s += 2; why.push('verify-shaped agent') }
  if (sig.shapeRow && /judgment/i.test(String(sig.shapeRow)) && ['executive', 'corps'].includes(a.routing.rank)) { s += 1; why.push(`rank: ${a.routing.rank}`) }
  if (a.provenance.lifecycle !== 'active') { s -= 1; why.push(`lifecycle: ${a.provenance.lifecycle}`) }
  if (/claude-opus-4|claude-3|gemini-2\.0|gpt-4/i.test(a.body.model || '')) { s -= 1; why.push('legacy model pin') }
  return { score: s, why }
}

export function route(request, opts = {}) {
  const records = opts.records || loadRecords()
  const sig = extractSignals(request, opts)
  const agents = records.filter((r) => r.kind === 'agent')
  const scored = agents.map((a) => ({ a, ...scoreAgent(a, sig) })).filter((x) => x.score > 0).sort((x, y) => y.score - x.score || x.a.name.localeCompare(y.a.name))
  const top = opts.top || 5
  const threshold = opts.threshold ?? 5
  const matrix = readMatrix()
  const row = sig.shapeRow ? matrix.rows.find((r) => sig.shapeRow.test(r.shape)) : null
  const checker = readCheckerLane()

  let resolution = 'refused', maker = null, verifier = null, reason
  if (!scored.length || scored[0].score < threshold) reason = scored.length ? `top score ${scored[0].score} below threshold ${threshold}` : 'no agent matched any signal'
  else {
    maker = scored[0]
    const second = scored[1]
    const sameCapability = second && canonicalName(second.a.name) === canonicalName(maker.a.name)
    if (second && !sameCapability && maker.score - second.score < 2) { resolution = 'ambiguous'; reason = `${maker.a.id} (${maker.score}) and ${second.a.id} (${second.score}) are within 2 points` }
    else resolution = 'resolved'
    // Copies of the same capability in other estates are reported, never hidden: the atlas's
    // finding is that they drift, and a route that silently picks one is how drift ships.
    maker.copies = scored.filter((x) => x.a.id !== maker.a.id && canonicalName(x.a.name) === canonicalName(maker.a.name)).map((x) => ({ id: x.a.id, score: x.score, contentHash: x.a.contentHash }))
    // verifier: a different capability, verify-shaped, a different estate — in that order of insistence
    const cand = scored.filter((x) => canonicalName(x.a.name) !== canonicalName(maker.a.name) && x.a.id !== maker.a.id)
    const shaped = (x) => VERIFY_ROLE.test((x.a || x).name + ' ' + (x.a || x).routing.description)
    verifier = cand.find((x) => x.a.estate !== maker.a.estate && shaped(x))
      || agents.filter((x) => shaped(x) && canonicalName(x.name) !== canonicalName(maker.a.name)).map((x) => ({ a: x, score: 0, why: ['verify-shaped, unscored'] })).find((x) => x.a.estate !== maker.a.estate)
      || cand.find(shaped) || null
    if (resolution === 'resolved' && !verifier) { resolution = 'ambiguous'; reason = 'no verify-shaped agent outside the maker capability could be bound; maker != checker cannot be satisfied from the atlas' }
  }
  return {
    schema: 'starlight.route.v1', request, signals: sig, resolution, reason,
    maker: maker ? { id: maker.a.id, name: maker.a.name, estate: maker.a.estate, brand: maker.a.brand, harness: maker.a.body.harness, model: maker.a.body.model, tools: maker.a.will.toolsAllow, score: maker.score, why: maker.why, sourceRef: maker.a.sourceRef, copies: maker.copies } : null,
    // The verifier is an AGENT; the checker PROVIDER is a separate, mandatory lane. Two Claude
    // files reviewing each other satisfy maker != checker for text and doctrine only; anything
    // consequential still needs the cross-provider lane below (CROSS-MODEL-GATE.md).
    verifier: verifier ? { id: verifier.a.id, name: verifier.a.name, estate: verifier.a.estate, harness: verifier.a.body.harness, score: verifier.score, sameHarnessAsMaker: verifier.a.body.harness === maker.a.body.harness, rule: 'different capability; verify-shaped; different estate preferred', crossProviderLane: checker ? checker.who : null } : null,
    checkerLane: checker,
    workShape: row ? { row: row.shape, primary: row.primary, secondary: row.secondary, status: matrix.status, source: matrix.path } : { row: null, status: matrix.status, source: matrix.path, note: 'no work-shape cue matched; model tier is the session default' },
    riskClass: sig.riskClass, gates: sig.gates,
    harnessAdmission: opts.harness ? { harness: opts.harness, ...admission(opts.harness) } : null,
    candidates: scored.slice(0, top).map((x) => ({ id: x.a.id, score: x.score, why: x.why })),
    dropped: Math.max(0, scored.length - top),
  }
}

function loadRecords() {
  if (existsSync(ATLAS)) { try { return JSON.parse(readFileSync(ATLAS, 'utf8')).records } catch {} }
  return scanEstate({ includeGlobalSkills: false }).records
}

// ------------------------------------------------------------------ cli

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('agent-route.mjs')) {
  const args = process.argv.slice(2)
  const flag = (n, d = null) => { const i = args.indexOf(`--${n}`); return i === -1 || i === args.length - 1 ? d : args[i + 1] }
  const request = args.find((a) => !a.startsWith('--') && ![flag('brand'), flag('estate'), flag('files'), flag('harness'), flag('top')].includes(a))
  if (!request) { console.error('usage: node tools/agent-route.mjs "<request>" [--brand x] [--estate x] [--files a,b] [--harness claude-code] [--json]'); process.exit(2) }
  const res = route(request, { brand: flag('brand'), estate: flag('estate'), files: flag('files') ? flag('files').split(',') : [], harness: flag('harness'), top: Number(flag('top', 5)) })
  if (args.includes('--json')) { console.log(JSON.stringify(res, null, 2)); process.exit(res.resolution === 'refused' ? 3 : 0) }
  console.log(`${res.resolution.toUpperCase()}${res.reason ? ' — ' + res.reason : ''}`)
  if (res.maker) console.log(`maker     ${res.maker.id}  [${res.maker.score}]  ${res.maker.why.join(' · ')}\n          model ${res.maker.model || '(inherit)'} · tools ${res.maker.tools.join(',') || '(none)'} · ${res.maker.sourceRef}`)
  if (res.verifier) console.log(`verifier  ${res.verifier.id}  [${res.verifier.score}]  ${res.verifier.rule}`)
  if (res.checkerLane) console.log(`checker   ${res.checkerLane.who} (${res.checkerLane.path})`)
  console.log(`shape     ${res.workShape.row || '(none)'} → ${res.workShape.primary || '-'} / ${res.workShape.secondary || '-'}  [${res.workShape.status}]`)
  console.log(`risk      ${res.riskClass}${res.gates.length ? ' · gates: ' + res.gates.join(', ') : ''}`)
  if (res.harnessAdmission) console.log(`admission ${res.harnessAdmission.harness}: ${res.harnessAdmission.status} — ${res.harnessAdmission.reason}`)
  console.log('candidates'); for (const c of res.candidates) console.log(`  ${String(c.score).padStart(3)}  ${c.id}  ${c.why.join(' · ')}`)
  if (res.dropped) console.log(`  … ${res.dropped} more below the top ${res.candidates.length}`)
  process.exit(res.resolution === 'refused' ? 3 : 0)
}
