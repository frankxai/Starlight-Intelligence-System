#!/usr/bin/env node
// Repository-scoped, offline Foundry preview and opt-in Claude Code projection.
// No provider calls, shell execution, global installs, or postinstall hooks.
import { createHash } from 'node:crypto'
import { existsSync, linkSync, lstatSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { scanEstate } from './agent-ontology.mjs'
import { composeSoul, TARGETS, lintClaude } from './agent-compile.mjs'

const sha256 = (value) => createHash('sha256').update(value).digest('hex')
const DEFAULT_AGENT = 'starlight-team-guide'
const MANIFEST = '.starlight/team-install.v1.json'
const THIS = fileURLToPath(import.meta.url)

function parse(argv) {
  const [command = 'help', ...rest] = argv
  const options = { root: process.cwd(), agent: DEFAULT_AGENT, host: 'claude-code', yes: false, json: false }
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i]
    if (arg === '--yes') options.yes = true
    else if (arg === '--json') options.json = true
    else if (['--root', '--agent', '--host', '--accept-hash'].includes(arg)) {
      if (!rest[i + 1] || rest[i + 1].startsWith('--')) throw new Error(`${arg} requires a value`)
      options[arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = rest[++i]
    } else throw new Error(`Unknown option: ${arg}`)
  }
  return { command, options }
}

function projectRoot(raw) {
  const root = resolve(raw)
  if (!existsSync(root) || !lstatSync(root).isDirectory() || lstatSync(root).isSymbolicLink()) throw new Error('Project root must be an existing real directory')
  return root
}

function safePath(root, subpath) {
  const target = resolve(root, subpath)
  if (target === root || !target.startsWith(root + sep)) throw new Error('Path escapes project root')
  let cursor = root
  for (const part of relative(root, target).split(sep)) {
    cursor = join(cursor, part)
    let entry
    try { entry = lstatSync(cursor) } catch (error) { if (error.code !== 'ENOENT') throw error }
    if (entry?.isSymbolicLink()) throw new Error(`Symlink in install path: ${relative(root, cursor)}`)
  }
  return target
}

function compile(agent) {
  const candidates = scanEstate().records.filter((r) => r.kind === 'agent' && r.name === agent && r.estate === 'sis')
  if (candidates.length !== 1) throw new Error(`Agent ${agent} is not a unique public SIS source`)
  const record = candidates[0]
  if (record.will.toolsAllow.some((tool) => !['Read', 'Glob', 'Grep'].includes(tool))) throw new Error('Beta installer accepts read-only agent tools only')
  const soul = composeSoul(record)
  const projection = TARGETS['claude-code'].emit(record, soul, {})
  const blockers = lintClaude(record.name, projection.content).filter((finding) => finding.severity === 'BLOCKER')
  if (blockers.length) throw new Error(`Compiled agent failed promotion checks: ${blockers.map((f) => f.code).join(', ')}`)
  return { record, soul, projection }
}

export function makeTeamPlan(rawOptions = {}) {
  const options = { root: process.cwd(), agent: DEFAULT_AGENT, host: 'claude-code', ...rawOptions }
  const root = projectRoot(options.root)
  const supported = options.host === 'claude-code'
  const target = `.claude/agents/${options.agent}.md`
  const manifestPath = safePath(root, MANIFEST)
  if (!supported) return { schema: 'starlight.team-plan.v1', status: 'preview-only', host: options.host, reason: 'No verified host-level read-only tool enforcement adapter; installation is held', writes: [] }
  const { record, soul, projection } = compile(options.agent)
  const outputPath = safePath(root, target)
  const existing = existsSync(outputPath) ? 'occupied' : 'absent'
  return { schema: 'starlight.team-plan.v1', status: existing === 'absent' && !existsSync(manifestPath) ? 'ready-to-install' : 'collision', host: options.host, agent: record.name, sourceRef: record.sourceRef, sourceHash: record.contentHash, identityDigest: soul.sourceDigest, target, contentHash: sha256(projection.content), preview: projection.content, tools: ['Read', 'Glob', 'Grep'], humanGates: ['push', 'publish', 'send', 'delete', 'money'], fixtureCostCeilingUsd: 0, executionCostCeilingUsd: null, existing, manifest: MANIFEST, writes: [target, MANIFEST] }
}

function install(options) {
  if (!options.yes) throw new Error('Install requires --yes after reviewing team plan')
  const root = projectRoot(options.root)
  const plan = makeTeamPlan(options)
  if (plan.status !== 'ready-to-install') throw new Error(`Install held: ${plan.reason || plan.status}`)
  if (options.acceptHash !== plan.contentHash) throw new Error('Install requires --accept-hash matching the reviewed team plan')
  const target = safePath(root, plan.target)
  const manifest = safePath(root, MANIFEST)
  const content = compile(plan.agent).projection.content
  if (sha256(content) !== plan.contentHash) throw new Error('Source changed after plan; retry preview')
  mkdirSync(dirname(target), { recursive: true })
  mkdirSync(dirname(manifest), { recursive: true })
  // Re-check after directory creation; never replace a concurrently written target.
  safePath(root, plan.target)
  safePath(root, MANIFEST)
  if (existsSync(target) || existsSync(manifest)) throw new Error('Install target changed; no overwrite')
  const temp = `${target}.${process.pid}.tmp`
  try {
    writeFileSync(temp, content, { flag: 'wx', mode: 0o600 })
    // Hard-link creation is exclusive: another writer cannot win a check/rename race.
    linkSync(temp, target)
    unlinkSync(temp)
    writeFileSync(manifest, JSON.stringify({ schema: 'starlight.team-install.v1', agent: plan.agent, host: plan.host, target: plan.target, sourceHash: plan.sourceHash, identityDigest: plan.identityDigest, contentHash: plan.contentHash, state: 'installed-not-host-verified' }, null, 2) + '\n', { flag: 'wx', mode: 0o600 })
  } catch (error) {
    if (existsSync(temp)) unlinkSync(temp)
    if (existsSync(target) && sha256(readFileSync(target)) === plan.contentHash && !existsSync(manifest)) unlinkSync(target)
    throw error
  }
  return { status: 'installed-not-host-verified', agent: plan.agent, target: plan.target, manifest: MANIFEST }
}

function rollback(options) {
  if (!options.yes) throw new Error('Rollback requires --yes')
  const root = projectRoot(options.root)
  const manifestPath = safePath(root, MANIFEST)
  if (!existsSync(manifestPath)) throw new Error('No team install manifest; nothing to roll back')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  if (!validManifest(manifest)) throw new Error('Unrecognized install manifest')
  const target = safePath(root, manifest.target)
  if (!existsSync(target) || sha256(readFileSync(target)) !== manifest.contentHash) throw new Error('Installed file changed; preserve user work and stop')
  unlinkSync(target)
  unlinkSync(manifestPath)
  return { status: 'rolled-back', target: manifest.target, preservedDirectories: true }
}

function validManifest(manifest) {
  return manifest && manifest.schema === 'starlight.team-install.v1' && manifest.host === 'claude-code' &&
    typeof manifest.agent === 'string' && /^\.claude\/agents\/[a-z0-9-]+\.md$/.test(manifest.target) &&
    manifest.target === `.claude/agents/${manifest.agent}.md` &&
    [manifest.sourceHash, manifest.identityDigest, manifest.contentHash].every((value) => typeof value === 'string' && /^[a-f0-9]{16,64}$/.test(value))
}

function verify(options) {
  const plan = makeTeamPlan(options)
  if (plan.status === 'preview-only') return { status: 'unsupported', reason: plan.reason }
  const { record, soul, projection } = compile(plan.agent)
  const deterministic = composeSoul(record).sourceDigest === soul.sourceDigest && sha256(TARGETS['claude-code'].emit(record, soul, {}).content) === sha256(projection.content)
  const root = projectRoot(options.root)
  const manifestPath = safePath(root, MANIFEST)
  const installed = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : null
  if (installed && !validManifest(installed)) throw new Error('Unrecognized install manifest')
  const target = installed ? safePath(root, installed.target) : null
  const bytesMatch = !installed || (existsSync(target) && sha256(readFileSync(target)) === installed.contentHash)
  const sourceMatches = !installed || (installed.sourceHash === record.contentHash && installed.identityDigest === soul.sourceDigest && installed.agent === plan.agent)
  return { status: deterministic && bytesMatch && sourceMatches ? 'fixture-verified' : 'failed', noSpend: true, hostExercised: false, installed: Boolean(installed), deterministic, bytesMatch, sourceMatches, identityDigest: soul.sourceDigest }
}

export function runTeamCommand(command, options = {}) {
  if (command === 'init' || command === 'plan') return makeTeamPlan(options)
  if (command === 'doctor') {
    const root = projectRoot(options.root || process.cwd())
    const plan = makeTeamPlan(options)
    return { status: plan.status, node: process.version, host: plan.host, hostEnforcementVerified: false, installed: existsSync(safePath(root, MANIFEST)), next: plan.status === 'ready-to-install' ? 'Review team plan, then team install --yes --accept-hash HASH' : plan.reason || 'Inspect collision before continuing' }
  }
  if (command === 'install') return install(options)
  if (command === 'verify') return verify(options)
  if (command === 'rollback') return rollback(options)
  throw new Error('Usage: starlight team <init|doctor|plan|install|verify|rollback> [--root PATH] [--agent ID] [--host claude-code] [--yes] [--accept-hash HASH] [--json]')
}

if (process.argv[1] && resolve(process.argv[1]) === THIS) {
  try {
    const { command, options } = parse(process.argv.slice(2))
    const result = runTeamCommand(command, options)
    console.log(options.json ? JSON.stringify(result, null, 2) : `${result.status}\n${JSON.stringify(result, null, 2)}`)
    if (['failed', 'unsupported', 'collision'].includes(result.status)) process.exitCode = 2
  } catch (error) { console.error(`starlight team: ${error.message}`); process.exitCode = 2 }
}
