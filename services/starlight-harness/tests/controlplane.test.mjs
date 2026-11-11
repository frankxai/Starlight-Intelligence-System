import assert from 'node:assert/strict';
import test from 'node:test';
import { ControlPlane, ControlPlaneError } from '../src/controlplane.ts';

test('the client claims by kind, counts its leases and surfaces refusals', async () => {
  const calls = [];
  const service = {
    fetch: async (url, init) => {
      calls.push([init.method, new URL(url).pathname, init.headers.authorization, init.body]);
      if (url.endsWith('/v1/status')) return Response.json({ counts: {}, leases: [{ agent_id: 'cf-claude' }, { agent_id: 'other' }] });
      if (url.endsWith('/claim')) return Response.json({ task: { id: 't1' }, fence: 'f', expiresAt: 1 });
      return Response.json({ error: 'cf-claude does not hold a live lease on t1' }, { status: 409 });
    },
  };
  const cp = new ControlPlane(service, 'tok-fixture-0000000000');
  assert.equal(await cp.leasesHeldBy('cf-claude'), 1);
  assert.deepEqual(await cp.claim(['fix']), { task: { id: 't1' }, fence: 'f', expiresAt: 1 });
  assert.equal(calls[1][3], JSON.stringify({ kinds: ['fix'] }));
  assert.equal(calls[1][2], 'Bearer tok-fixture-0000000000');
  await assert.rejects(cp.heartbeat('t1', 'f'), (err) => err instanceof ControlPlaneError && err.status === 409);
});

test('release sends terminal only when asked', async () => {
  const bodies = [];
  const service = { fetch: async (url, init) => { bodies.push(JSON.parse(init.body)); return Response.json({ id: 't1', state: 'ready' }); } };
  const cp = new ControlPlane(service, 'tok-fixture-0000000000');
  await cp.release('t1', 'f', 'out of RAM');
  await cp.release('t1', 'f', 'not an agent branch', true);
  assert.deepEqual(bodies, [{ fence: 'f', reason: 'out of RAM' }, { fence: 'f', reason: 'not an agent branch', terminal: true }]);
});
