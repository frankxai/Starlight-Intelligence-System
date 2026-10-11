#!/usr/bin/env node
// Runs in a public SIS checkout without Frank's private multi-repo estate or home files.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)))
const env = { ...process.env }
delete env.STARLIGHT_ESTATE
delete env.STARLIGHT_SCAN_HOME
const script = `import { scanEstate, ESTATE } from ${JSON.stringify(pathToFileURL(join(packageDir, 'agent-ontology.mjs')).href)};
import { composeSoul, toClaudeCode, toClaudeSdk, toCompileRequest } from ${JSON.stringify(pathToFileURL(join(packageDir, 'agent-compile.mjs')).href)};
const result = scanEstate();
const agent = result.records.find(r => r.kind === 'agent' && r.estate === 'sis');
const soul = composeSoul(agent);
console.log(JSON.stringify({ estate: ESTATE, count: result.records.length, estates: [...new Set(result.records.map(r => r.estate))], refs: result.records.map(r => r.sourceRef), sourcePaths: result.sources.map(s => s.path), layers: soul.selected.map(a => a.layer), claude: toClaudeCode(agent, soul).content.match(/^tools: (.+)$/m)?.[1], sdk: toClaudeSdk(agent, soul).content, request: toCompileRequest(agent, soul) }));`
const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], { env, encoding: 'utf8' })
assert.equal(result.status, 0, result.stderr)
const data = JSON.parse(result.stdout)
assert.ok(data.count > 0, 'checkout agents are discoverable')
assert.deepEqual(data.estates, ['sis'], 'default scan stays inside SIS')
assert.ok(data.refs.every(ref => !ref.startsWith('~') && !/^[a-z]:\//i.test(ref)), 'records have repo-relative provenance')
assert.ok(data.sourcePaths.every(ref => !ref.startsWith('~') && !/^[a-z]:\//i.test(ref)), 'source inventory has no home paths')
assert.deepEqual(data.layers, ['kernel', 'brand', 'substrate', 'constitution', 'agent', 'authority', 'verification'].filter(layer => data.layers.includes(layer)))
assert.ok(data.layers.includes('kernel') && data.layers.includes('constitution'), 'required portable governance is present')
assert.equal(data.claude, 'Read, Glob, Grep', 'unbound Claude agent is read-only')
assert.deepEqual(JSON.parse(data.sdk)[Object.keys(JSON.parse(data.sdk)).find(k => k !== '$provenance')].tools, ['Read', 'Glob', 'Grep'])
assert.equal(data.request.atoms.length, data.layers.length)
const atlasRun = spawnSync(process.execPath, [join(packageDir, 'gen-agent-atlas.mjs'), '--json'], { env, encoding: 'utf8' })
assert.equal(atlasRun.status, 0, atlasRun.stderr)
const atlas = JSON.parse(atlasRun.stdout)
assert.equal(atlas.capabilityGraph.schema, 'foundry/contracts/capability-graph.schema.json')
assert.ok(atlas.routing.routers.every(router => !router.path.startsWith('~')), 'public atlas does not probe home routers')
assert.ok(atlas.routing.routers.some(router => router.path === 'skills/skill-rules.json' && router.exists), 'SIS router paths resolve in a checkout')
console.log(`portable checkout PASS: ${data.count} records, ${data.layers.length} identity layers, no home scan`)
