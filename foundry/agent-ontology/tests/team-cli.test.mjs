import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { makeTeamPlan, runTeamCommand } from '../team-cli.mjs'

function fixture(fn) {
  const root = mkdtempSync(join(tmpdir(), 'starlight-team-test-'))
  try { fn(root) } finally { rmSync(root, { recursive: true, force: true }) }
}

test('plan and offline verify do not write into the project', () => fixture((root) => {
  const plan = makeTeamPlan({ root })
  assert.equal(plan.status, 'ready-to-install')
  assert.ok(plan.preview.includes('name: "starlight-team-guide"'))
  assert.equal(plan.fixtureCostCeilingUsd, 0)
  assert.equal(plan.executionCostCeilingUsd, null)
  assert.deepEqual(plan.writes, ['.claude/agents/starlight-team-guide.md', '.starlight/team-install.v1.json'])
  const result = runTeamCommand('verify', { root })
  assert.equal(result.status, 'fixture-verified')
  assert.equal(result.hostExercised, false)
  assert.equal(result.noSpend, true)
  assert.equal(existsSync(join(root, '.claude')), false)
  assert.equal(existsSync(join(root, '.starlight')), false)
}))

test('unsupported host remains preview-only', () => fixture((root) => {
  const result = runTeamCommand('plan', { root, host: 'codex' })
  assert.equal(result.status, 'preview-only')
  assert.deepEqual(result.writes, [])
  assert.throws(() => runTeamCommand('install', { root, host: 'codex', yes: true }), /Install held/)
}))

test('install requires opt-in, verifies bytes, then rolls back only owned output', () => fixture((root) => {
  assert.throws(() => runTeamCommand('install', { root }), /requires --yes/)
  const hash = makeTeamPlan({ root }).contentHash
  assert.throws(() => runTeamCommand('install', { root, yes: true, acceptHash: '0'.repeat(64) }), /accept-hash/)
  const installed = runTeamCommand('install', { root, yes: true, acceptHash: hash })
  assert.equal(installed.status, 'installed-not-host-verified')
  const target = join(root, '.claude', 'agents', 'starlight-team-guide.md')
  assert.equal(existsSync(target), true)
  assert.equal(runTeamCommand('verify', { root }).status, 'fixture-verified')
  assert.equal(runTeamCommand('rollback', { root, yes: true }).status, 'rolled-back')
  assert.equal(existsSync(target), false)
  assert.equal(existsSync(join(root, '.claude')), true)
}))

test('existing file is never overwritten and changed output is never deleted', () => fixture((root) => {
  const target = join(root, '.claude', 'agents', 'starlight-team-guide.md')
  mkdirSync(join(root, '.claude', 'agents'), { recursive: true })
  writeFileSync(target, 'user-owned')
  assert.equal(makeTeamPlan({ root }).status, 'collision')
  assert.throws(() => runTeamCommand('install', { root, yes: true, acceptHash: '0'.repeat(64) }), /Install held/)
  assert.equal(readFileSync(target, 'utf8'), 'user-owned')
  rmSync(target)
  runTeamCommand('install', { root, yes: true, acceptHash: makeTeamPlan({ root }).contentHash })
  writeFileSync(target, 'user-changed')
  assert.equal(runTeamCommand('verify', { root }).status, 'failed')
  assert.throws(() => runTeamCommand('rollback', { root, yes: true }), /preserve user work/)
  assert.equal(readFileSync(target, 'utf8'), 'user-changed')
}))

test('forged manifest cannot redirect rollback outside the owned projection', () => fixture((root) => {
  mkdirSync(join(root, '.starlight'))
  writeFileSync(join(root, '.starlight', 'team-install.v1.json'), JSON.stringify({ schema: 'starlight.team-install.v1', host: 'claude-code', agent: 'x', target: '../outside', sourceHash: 'a'.repeat(16), identityDigest: 'b'.repeat(24), contentHash: 'c'.repeat(64) }))
  assert.throws(() => runTeamCommand('rollback', { root, yes: true }), /Unrecognized install manifest/)
}))
