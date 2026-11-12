import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ModelRouteError,
  SUPPORTED_VENDORS,
  resolveModelId,
  vendorOf,
} from '../dist/index.js';

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

test('every vendor in the table is served under a namespace the table can map back', () => {
  // The `spacexai/` prefix on Grok is the trap: it is not `xai/`.
  assert.equal(SUPPORTED_VENDORS.xai, 'spacexai/grok-4.7');
  assert.equal(SUPPORTED_VENDORS.anthropic, 'anthropic/claude-opus-5.5');
  assert.equal(SUPPORTED_VENDORS.openai, 'openai/gpt-6-astra');
  assert.equal(SUPPORTED_VENDORS.google, 'google/gemini-4-argon');
  for (const [vendor, modelId] of Object.entries(SUPPORTED_VENDORS)) {
    assert.equal(vendorOf(modelId), vendor, `${modelId} must resolve to vendor ${vendor}`);
  }
});

test('no vendor resolves to a namespace that does not exist in the Gateway catalog', async () => {
  // The vendor table claims these four ids are served. Asserting a constant against an identical
  // constant proves only that the file was not edited, so this asks the Gateway's own catalog.
  // The check that these ids are PRESENT lives in scripts/verify-gateway-models.mjs, which runs
  // against the live catalog; this asserts the namespaces the table relies on are real ones.
  const response = await fetch('https://ai-gateway.vercel.sh/v1/models', {
    signal: AbortSignal.timeout(30_000),
  });
  assert.equal(response.status, 200, 'the Gateway catalog must be readable');
  const catalog = await response.json();
  const ids = new Set((catalog?.data ?? []).map(entry => entry.id));

  const namespaces = new Set(
    Object.values(SUPPORTED_VENDORS).map(modelId => modelId.split('/')[0]),
  );
  for (const namespace of namespaces) {
    const served = [...ids].some(id => id.startsWith(`${namespace}/`));
    assert.ok(served, `the Gateway serves no models under "${namespace}/"`);
  }
});

test('vendorOf rejects an id whose vendor segment is malformed', () => {
  assert.throws(() => vendorOf('Anthropic/claude'), ModelRouteError);
  assert.throws(() => vendorOf('/claude-opus-5.5'), ModelRouteError);
});

test('an explicit route for a vendor the estate does not route to fails at resolution', () => {
  // A well-formed id for an unrouted vendor must fail here, not later as an
  // opaque provider error. The namespace is the control, not the string shape.
  assert.throws(
    () => resolveModelId({ kind: 'explicit', gatewayModelId: 'unapproved/model' }),
    (error) => error instanceof ModelRouteError && /Unknown gateway namespace/.test(error.message),
  );
});

test('vendorOf does not resolve inherited object properties', () => {
  // A plain index read would return Object.prototype members for keys like
  // "constructor" and "toString" instead of failing.
  assert.throws(() => vendorOf('constructor/model'), ModelRouteError);
  assert.throws(() => vendorOf('toString/model'), ModelRouteError);
  assert.throws(() => vendorOf('__proto__/model'), ModelRouteError);
});
