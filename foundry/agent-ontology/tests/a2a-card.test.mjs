import { test } from 'node:test'
import assert from 'node:assert/strict'
import { scanEstate } from '../agent-ontology.mjs'
import { composeSoul, toA2ACard } from '../agent-compile.mjs'

const agent = scanEstate({ includeSkills: false }).records.find((record) => record.id === 'agent:sis/starlight-team-guide')
assert.ok(agent, 'public-safe source is present')

test('A2A v1.0 discovery card has required names and a non-live interface template', () => {
  const card = JSON.parse(toA2ACard(agent, composeSoul(agent)).content)
  for (const field of ['name', 'description', 'supportedInterfaces', 'version', 'capabilities', 'defaultInputModes', 'defaultOutputModes', 'skills']) assert.ok(field in card, field)
  assert.equal(card.supportedInterfaces.length, 1)
  assert.deepEqual(Object.keys(card.supportedInterfaces[0]).sort(), ['protocolBinding', 'protocolVersion', 'url'])
  assert.equal(card.supportedInterfaces[0].protocolVersion, '1.0')
  assert.equal(card.supportedInterfaces[0].protocolBinding, 'HTTP+JSON')
  assert.match(card.supportedInterfaces[0].url, /^https:\/\/example\.invalid\//)
  assert.ok(card.skills.length > 0)
  assert.ok(card.skills.every((skill) => skill.id && skill.name && skill.description && Array.isArray(skill.tags)))
  assert.equal('url' in card, false)
  assert.equal('protocolVersion' in card, false)
  assert.equal('sourceRef' in card.capabilities.extensions[0].params, false)
  assert.equal(JSON.stringify(card).includes('C:\\Users\\'), false)
})

test('host binding requires HTTPS and does not alter source identity', () => {
  const soul = composeSoul(agent)
  const card = JSON.parse(toA2ACard(agent, soul, { baseUrl: 'https://agents.example.org/a2a' }).content)
  assert.equal(card.supportedInterfaces[0].url, 'https://agents.example.org/a2a/starlight-team-guide')
  assert.equal(card.capabilities.extensions[0].params.layerDigest, soul.sourceDigest)
  assert.throws(() => toA2ACard(agent, soul, { baseUrl: 'http://agents.example.org/a2a' }), /HTTPS/)
})
