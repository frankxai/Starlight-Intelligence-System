import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ModelRouteError,
  SUPPORTED_VENDORS,
  resolveModelId,
  vendorOf,
} from '../dist/model.js';

test('a tier route resolves to a gateway model id, and each tier is distinct', () => {
  const reasoning = resolveModelId({ kind: 'frontier', tier: 'reasoning-heavy' });
  const balanced = resolveModelId({ kind: 'frontier', tier: 'balanced' });
  const fast = resolveModelId({ kind: 'frontier', tier: 'fast' });
  for (const id of [reasoning, balanced, fast]) {
    assert.match(id, /^[a-z][a-z0-9-]*\/[A-Za-z0-9._-]+$/, `not a gateway id: ${id}`);
  }
  assert.equal(new Set([reasoning, balanced, fast]).size, 3, 'tiers must not collapse');
});

test('an explicit route wins and is validated at resolution time', () => {
  assert.equal(
    resolveModelId({ kind: 'explicit', gatewayModelId: 'google/gemini-4-argon' }),
    'google/gemini-4-argon',
  );
});

test('a malformed explicit route fails at resolution with a named error, not at call time', () => {
  assert.throws(
    () => resolveModelId({ kind: 'explicit', gatewayModelId: 'not-a-gateway-id' }),
    (error) => error instanceof ModelRouteError && /expected the form/.test(error.message),
  );
  assert.throws(
    () => resolveModelId({ kind: 'explicit', gatewayModelId: '' }),
    ModelRouteError,
  );
  assert.throws(
    () => resolveModelId({ kind: 'explicit', gatewayModelId: '   ' }),
    ModelRouteError,
  );
});

test('the vendor table covers all four vendors with the ids the gateway actually serves', () => {
  // The `spacexai/` prefix on Grok is the trap: it is not `xai/`.
  assert.equal(SUPPORTED_VENDORS.xai, 'spacexai/grok-4.7');
  assert.equal(SUPPORTED_VENDORS.anthropic, 'anthropic/claude-opus-5.5');
  assert.equal(SUPPORTED_VENDORS.openai, 'openai/gpt-6-astra');
  assert.equal(SUPPORTED_VENDORS.google, 'google/gemini-4-argon');
  for (const [vendor, modelId] of Object.entries(SUPPORTED_VENDORS)) {
    assert.equal(vendorOf(modelId), vendor, `${modelId} must resolve to vendor ${vendor}`);
  }
});

test('vendorOf rejects an id whose vendor segment is malformed', () => {
  assert.throws(() => vendorOf('Anthropic/claude'), ModelRouteError);
  assert.throws(() => vendorOf('/claude-opus-5.5'), ModelRouteError);
});
