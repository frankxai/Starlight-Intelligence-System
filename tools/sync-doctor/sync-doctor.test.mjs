import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, isNoise, parseTailscale, parseSyncthingConfig } from './sync-doctor.mjs';

const NOW = Date.parse('2026-10-27T12:00:00Z');
const HOUR = 3_600_000;

const healthy = () => ({
  now: NOW,
  tailnet: { ok: true, self: { host: 'c940', online: true }, peers: [{ host: 'book', os: 'windows', online: true, lastSeen: NOW }] },
  syncthing: { configured: true, running: true, devices: ['a'], folders: [{ label: 'bus', path: '/bus', exists: true, newest: NOW - HOUR }] },
  vault: {
    exists: true, isGit: true, path: '/v', gitDirInCloud: false, branch: 'main', ahead: 0, behind: 0, dirtyTracked: 0, untracked: 0,
    trackedNoise: [], lastCommitMs: NOW - HOUR, lastSubject: 'nightly', authors: ['claude@c940', 'frank@x'], fsckOk: true, fsckError: '',
  },
  backup: { newestMs: NOW - HOUR },
});

const ids = (f) => evaluate(f).map((x) => x.id);

test('a healthy machine reports nothing', () => {
  assert.deepEqual(evaluate(healthy()), []);
});

test('git data inside a cloud folder, or an unreadable repo, fails', () => {
  const f = healthy();
  f.vault.gitDirInCloud = true;
  f.vault.fsckOk = false;
  f.vault.fsckError = 'mmap failed';
  const found = evaluate(f);
  assert.deepEqual(found.map((x) => [x.id, x.level]), [['vault.git-in-cloud', 'fail'], ['vault.unreadable', 'fail']]);
});

test('a peer dark for more than two days warns; a briefly offline one is only info', () => {
  const f = healthy();
  f.tailnet.peers = [
    { host: 'old', os: 'linux', online: false, lastSeen: NOW - 72 * HOUR },
    { host: 'brief', os: 'windows', online: false, lastSeen: NOW - 2 * HOUR },
  ];
  assert.deepEqual(evaluate(f).map((x) => [x.id, x.level]), [['tailnet.peer-dark', 'warn'], ['tailnet.peer-offline', 'info']]);
});

test('tailscale down fails', () => {
  const f = healthy();
  f.tailnet = { ok: false, error: 'not installed' };
  assert.deepEqual(ids(f), ['tailnet.down']);
});

test('syncthing configured but stopped warns; a missing folder fails; a stale bus warns', () => {
  const f = healthy();
  f.syncthing.running = false;
  assert.deepEqual(ids(f), ['syncthing.stopped']);
  f.syncthing.running = true;
  f.syncthing.folders[0].exists = false;
  assert.deepEqual(ids(f), ['syncthing.folder-missing']);
  f.syncthing.folders[0] = { label: 'bus', path: '/bus', exists: true, newest: NOW - 30 * HOUR };
  assert.deepEqual(ids(f), ['syncthing.bus-stale']);
});

test('unpushed, behind, noise, stale nightly and one author are each reported', () => {
  const f = healthy();
  Object.assign(f.vault, { ahead: 2, behind: 1, trackedNoise: ['a.log'], lastCommitMs: NOW - 40 * HOUR, authors: ['one@x'] });
  assert.deepEqual(ids(f).sort(), ['vault.behind', 'vault.identity', 'vault.nightly-stale', 'vault.noise', 'vault.unpushed']);
});

test('a missing or old backup warns', () => {
  const f = healthy();
  f.backup.newestMs = null;
  assert.deepEqual(ids(f), ['backup.stale']);
  f.backup.newestMs = NOW - 9 * 24 * HOUR;
  assert.deepEqual(ids(f), ['backup.stale']);
});

test('findings sort fail, warn, info', () => {
  const f = healthy();
  Object.assign(f.vault, { dirtyTracked: 1, gitDirInCloud: true, ahead: 1 });
  assert.deepEqual(evaluate(f).map((x) => x.level), ['fail', 'warn', 'info']);
});

test('noise detection covers logs, obsidian workspace state and smart-env', () => {
  assert.equal(isNoise('_meta/reflect-cron.log'), true);
  assert.equal(isNoise('.obsidian/graph.json'), true);
  assert.equal(isNoise('.obsidian\\workspace.json'), true);
  assert.equal(isNoise('.smart-env/x.ajson'), true);
  assert.equal(isNoise('patterns/Alpha.md'), false);
});

test('parsers read tailscale status json and syncthing config xml', () => {
  const ts = parseTailscale({ Self: { HostName: 'me', Online: true }, Peer: { k: { HostName: 'p', OS: 'linux', Online: false, LastSeen: '2026-10-20T00:00:00Z' } } });
  assert.deepEqual(ts, { self: { host: 'me', online: true }, peers: [{ host: 'p', os: 'linux', online: false, lastSeen: Date.parse('2026-10-20T00:00:00Z') }] });
  const st = parseSyncthingConfig('<folder id="x1" label="bus" path="C:\\bus"><device id="D1" name="book"></device></folder><device id="D1" name="book"></device>');
  assert.deepEqual(st, { folders: [{ id: 'x1', label: 'bus', path: 'C:\\bus' }], devices: ['book'] });
});
