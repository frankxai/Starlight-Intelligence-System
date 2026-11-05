/** Local-only qualification. Never imported by the production Worker.
 * Run on Node 24 with miniflare@5.20261023.3-beta installed, or set
 * NEXUS_MINIFLARE_PATH to that installed package's absolute directory.
 */
import assert from 'node:assert/strict';
import { createRequire, stripTypeScriptTypes } from 'node:module';
import { readFile, mkdtemp, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';

const require = createRequire(new URL('./runtime/package.json', import.meta.url));
const modulePath = process.env.NEXUS_MINIFLARE_PATH;
if (modulePath && !isAbsolute(modulePath)) throw new Error('NEXUS_MINIFLARE_PATH must be absolute');
const entry = modulePath ? resolve(modulePath, 'dist/src/index.js') : require.resolve('miniflare');
const toolRequire = createRequire(entry);
const packagePath = modulePath ? resolve(modulePath, 'package.json') : require.resolve('miniflare/package.json');
const version = JSON.parse(await readFile(packagePath, 'utf8')).version;
assert.equal(version, '5.20261023.3-beta', 'Qualification toolchain changed; review before accepting results');
const workerdVersion = toolRequire('workerd/package.json').version;
assert.equal(workerdVersion, '1.20261023.1');
const { Miniflare, convertV4MiniflareOptions } = toolRequire(entry);
const source = await readFile(new URL('../src/swarm-lease-state.ts', import.meta.url), 'utf8');
const runtimeSource = stripTypeScriptTypes(source);
const directory = await mkdtemp(join(tmpdir(), 'nexus-lease-workerd-'));
// The fixture accepts synthetic time and identity explicitly to exercise hostile
// inputs. It runs only in local Miniflare and is not a production auth adapter.
const script = `
import { createLeaseCoordinator } from './swarm-lease-state.mjs';
export class LeaseFixture {
  constructor(state) { this.state = state; }
  async fetch(request) {
    const input = await request.json();
    try {
      const storage = { transaction: callback => this.state.storage.transaction(async tx => {
        const outcome = await callback(tx);
        if (input.failCommit) throw new Error('injected transaction rollback');
        return outcome;
      }) };
      const coordinator = createLeaseCoordinator(storage, input.binding, () => input.now);
      return Response.json(await coordinator.apply(input.operation));
    } catch { return Response.json({ error: 'held' }, { status: 409 }); }
  }
}
export default { async fetch(request, env) {
  return env.LEASES.get(env.LEASES.idFromName('qualification-only')).fetch(request);
} };
`;
const options = convertV4MiniflareOptions({
  modules: [
    { type: 'ESModule', path: join(directory, 'fixture.mjs'), contents: script },
    { type: 'ESModule', path: join(directory, 'swarm-lease-state.mjs'), contents: runtimeSource },
  ],
  modulesRoot: directory, compatibilityDate: '2026-10-10',
  durableObjects: { LEASES: { className: 'LeaseFixture', useSQLite: true } },
  resourcePersistencePath: directory,
});
let runtime;
let cases = 0;
const binding = { tenantId: 'tenant-a', resourceId: 'repo/main' };
const clock = 1_000_000;
const acquire = (id, owner = 'node-a') => ({ ...binding, action: 'acquire', operationId: id, ownerId: owner, notAfter: clock + 60_000, ttlMs: 10_000 });
const release = (id, fence, owner = 'node-a') => ({ ...binding, action: 'release', operationId: id, ownerId: owner, notAfter: clock + 60_000, fence });
async function call(operation, now, patch = {}) {
  const response = await runtime.dispatchFetch('https://qualification.invalid/lease', {
    method: 'POST', body: JSON.stringify({ binding, operation, now, ...patch }),
  });
  return { status: response.status, body: await response.json() };
}
try {
  runtime = new Miniflare(options);
  const outcomes = await Promise.all(Array.from({ length: 16 }, (_, i) => call(acquire(`race-${i}`, `node-${i}`), clock)));
  const winnerIndex = outcomes.findIndex(result => result.body.result?.status === 'acquired');
  assert.ok(winnerIndex >= 0);
  assert.equal(outcomes.filter(result => result.body.result?.status === 'acquired').length, 1);
  assert.equal(outcomes.filter(result => result.body.result?.status === 'conflict').length, 15);
  assert.ok(outcomes.every(result => result.status === 200 && result.body.result.fence === 1));
  cases++;

  const wrongBinding = await call(acquire('wrong'), clock + 1, { binding: { ...binding, tenantId: 'tenant-b' } });
  assert.equal(wrongBinding.status, 409);
  const forgedResource = await call({ ...acquire('wrong-resource'), resourceId: 'other' }, clock + 1);
  assert.equal(forgedResource.status, 409);
  cases++;

  const successorRequest = acquire('successor', 'node-cloud');
  const successor = await call(successorRequest, clock + 10_000);
  assert.equal(successor.body.result.fence, 2);
  const stale = await call(release('old-release', 1, `node-${winnerIndex}`), clock + 10_001);
  assert.equal(stale.body.result.status, 'stale');
  cases++;

  await runtime.dispose();
  runtime = undefined;
  const persistedFiles = await readdir(directory, { recursive: true });
  assert.ok(persistedFiles.some(name => /\.sqlite3?$/.test(name)), 'Real SQLite persistence was not produced: ' + persistedFiles.join(','));
  runtime = new Miniflare(options);
  const recovered = await call(successorRequest, clock + 10_002);
  assert.equal(recovered.body.replayed, true);
  assert.deepEqual(recovered.body.result, successor.body.result);
  cases++;

  const released = await call(release('release-successor', 2, 'node-cloud'), clock + 10_003);
  assert.equal(released.body.result.status, 'released');
  const failed = await call(acquire('rolled-back'), clock + 10_004, { failCommit: true });
  assert.equal(failed.status, 409);
  const afterRollback = await call(acquire('rolled-back'), clock + 10_004);
  assert.equal(afterRollback.body.replayed, false);
  assert.equal(afterRollback.body.result.fence, 3);
  cases++;

  const mutated = await call({ ...acquire('rolled-back'), ttlMs: 30_000 }, clock + 10_005);
  assert.equal(mutated.status, 409);
  const backward = await call(acquire('time-travel'), clock);
  assert.equal(backward.status, 409);
  cases++;

  console.log(JSON.stringify({
    format: 'starlight.lease-local-runtime-qualification.v1',
    state: 'local-workerd-checked', cases,
    node: process.version, miniflare: version, workerd: workerdVersion,
    coreSha256: createHash('sha256').update(source).digest('hex'),
    checks: ['16 concurrent acquisitions', 'tenant/resource isolation', 'expiry fencing and stale release', 'SQLite persistence after runtime restart', 'transaction rollback before acknowledgement', 'idempotency conflict and clock rollback'],
    limits: ['No deployed service, credential verification, real device or external effect.', 'Fixture routing is synthetic and must never be deployed.', 'Effect receivers still need atomic fence enforcement.'],
  }, null, 2));
} finally {
  await runtime?.dispose();
  await rm(directory, { recursive: true, force: true });
}
