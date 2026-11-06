#!/usr/bin/env node
// sync-doctor: read-only health check for the vault, Tailscale, Syncthing and backups on this machine.
// It changes nothing. Exit 1 when any check fails (or warns, with --strict).
// Usage: node sync-doctor.mjs [--vault <dir>] [--bus <dir>] [--fetch] [--json] [--strict]
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const PEER_DARK_MS = 2 * DAY;
const NIGHTLY_STALE_MS = 36 * HOUR;
const BACKUP_STALE_MS = 7 * DAY;
const BUS_STALE_MS = DAY;
const NOISE = [/\.log$/i, /(^|\/)\.obsidian\/(graph|workspace|workspace-mobile)\.json$/i, /(^|\/)\.smart-env\//i];

export const isNoise = (path) => NOISE.some((re) => re.test(path.replace(/\\/g, '/')));

export function parseTailscale(json) {
  const peers = Object.values(json.Peer ?? {}).map((p) => ({
    host: p.HostName, os: p.OS, online: Boolean(p.Online), lastSeen: Date.parse(p.LastSeen) || null,
  }));
  return { self: { host: json.Self?.HostName, online: Boolean(json.Self?.Online) }, peers };
}

export function parseSyncthingConfig(xml) {
  const folders = [...xml.matchAll(/<folder id="([^"]+)" label="([^"]*)" path="([^"]*)"/g)].map((m) => ({ id: m[1], label: m[2], path: m[3] }));
  const devices = [...xml.matchAll(/<device id="[^"]+" name="([^"]*)"/g)].map((m) => m[1]);
  return { folders, devices: [...new Set(devices)] };
}

const run = (cmd, args, cwd) => {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', timeout: 60_000 });
  return { ok: r.status === 0, out: (r.stdout ?? '').trim(), err: (r.stderr ?? '').trim() };
};

function newestMtime(dir, depth = 2) {
  let newest = 0;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.st')) continue;
    const p = join(dir, e.name);
    newest = Math.max(newest, statSync(p).mtimeMs);
    if (e.isDirectory() && depth > 0) newest = Math.max(newest, newestMtime(p, depth - 1));
  }
  return newest;
}

function collectTailnet() {
  const r = run('tailscale', ['status', '--json']);
  if (!r.ok) return { ok: false, error: r.err || 'tailscale not available' };
  try { return { ok: true, ...parseTailscale(JSON.parse(r.out)) }; } catch { return { ok: false, error: 'unreadable tailscale status' }; }
}

function collectSyncthing(busOverride) {
  const cfg = join(process.env.LOCALAPPDATA ?? join(homedir(), 'AppData', 'Local'), 'Syncthing', 'config.xml');
  const tasks = run('tasklist', []);
  const running = /syncthing/i.test(tasks.out);
  if (!existsSync(cfg)) return { configured: false, running };
  const parsed = parseSyncthingConfig(readFileSync(cfg, 'utf8'));
  const folders = parsed.folders.map((f) => ({ ...f, exists: existsSync(f.path), newest: existsSync(f.path) ? newestMtime(f.path) : null }));
  return { configured: true, running, devices: parsed.devices, folders, busOverride };
}

function collectVault(vault, fetch) {
  if (!existsSync(vault)) return { exists: false, path: vault };
  const git = (...a) => run('git', ['-C', vault, ...a]);
  if (!git('rev-parse', '--is-inside-work-tree').ok) return { exists: true, isGit: false, path: vault };
  if (fetch) git('fetch', '--quiet', 'origin');
  const gitDirAbs = git('rev-parse', '--absolute-git-dir').out.replace(/\\/g, '/');
  const counts = git('rev-list', '--left-right', '--count', 'HEAD...@{upstream}').out.split(/\s+/).map(Number);
  const status = git('status', '--porcelain').out.split('\n').filter(Boolean);
  const tracked = git('ls-files').out.split('\n').filter(Boolean);
  const last = git('log', '-1', '--format=%ct%x09%s').out.split('\t');
  const authors = [...new Set(git('log', '-50', '--format=%ae').out.split('\n').filter(Boolean))];
  const fsck = git('fsck', '--connectivity-only');
  return {
    exists: true, isGit: true, path: vault,
    gitDirInCloud: /onedrive|dropbox|google drive/i.test(gitDirAbs),
    branch: git('rev-parse', '--abbrev-ref', 'HEAD').out,
    ahead: Number.isFinite(counts[0]) ? counts[0] : null,
    behind: Number.isFinite(counts[1]) ? counts[1] : null,
    dirtyTracked: status.filter((l) => !l.startsWith('??')).length,
    untracked: status.filter((l) => l.startsWith('??')).length,
    trackedNoise: tracked.filter(isNoise),
    lastCommitMs: Number(last[0]) * 1000 || null,
    lastSubject: last[1] ?? '',
    authors,
    fsckOk: fsck.ok,
    fsckError: fsck.ok ? '' : (fsck.err.split('\n')[0] ?? 'fsck failed'),
  };
}

function collectBackup() {
  const dir = join(homedir(), '.starlight');
  const stamps = [];
  const backups = join(dir, 'backups');
  if (existsSync(backups)) for (const f of readdirSync(backups)) if (f.endsWith('.bundle')) stamps.push(statSync(join(backups, f)).mtimeMs);
  const mirror = join(dir, 'vault-mirror', 'second-brain-vault', '.git', 'logs', 'HEAD');
  if (existsSync(mirror)) stamps.push(statSync(mirror).mtimeMs);
  return { newestMs: stamps.length ? Math.max(...stamps) : null };
}

export function collect({ vault, bus, fetch }) {
  return { now: Date.now(), tailnet: collectTailnet(), syncthing: collectSyncthing(bus), vault: collectVault(vault, fetch), backup: collectBackup() };
}

const finding = (level, id, message, fix = '') => ({ level, id, message, fix });
const age = (ms, now) => `${Math.round((now - ms) / HOUR)}h`;

export function evaluate(f) {
  const out = [];
  const { now, tailnet, syncthing, vault, backup } = f;

  if (!tailnet.ok) out.push(finding('fail', 'tailnet.down', `Tailscale unavailable: ${tailnet.error}`, 'Start Tailscale and sign in.'));
  else {
    if (!tailnet.self.online) out.push(finding('fail', 'tailnet.self-offline', 'This machine is not connected to the tailnet.', 'Reconnect Tailscale.'));
    for (const p of tailnet.peers) {
      if (!p.online && p.lastSeen && now - p.lastSeen > PEER_DARK_MS) out.push(finding('warn', 'tailnet.peer-dark', `${p.host} (${p.os}) has been dark for ${age(p.lastSeen, now)}.`, 'Wake it, or retire it from the mesh registry on purpose.'));
      else if (!p.online) out.push(finding('info', 'tailnet.peer-offline', `${p.host} is offline.`));
    }
  }

  if (syncthing.configured) {
    for (const folder of syncthing.folders) {
      if (!folder.exists) out.push(finding('fail', 'syncthing.folder-missing', `Syncthing folder "${folder.label}" points at a path that does not exist: ${folder.path}`, 'Fix or remove the folder in Syncthing.'));
      else if (syncthing.running && folder.newest && now - folder.newest > BUS_STALE_MS) out.push(finding('warn', 'syncthing.bus-stale', `"${folder.label}" has had no change for ${age(folder.newest, now)}.`, 'Check the peer is online and the folder is shared.'));
    }
    if (!syncthing.running && syncthing.folders.length) out.push(finding('warn', 'syncthing.stopped', `Syncthing is configured (${syncthing.folders.length} folder) but not running, so nothing syncs.`, 'Start it on purpose, or remove the config.'));
  }

  if (!vault.exists) out.push(finding('fail', 'vault.missing', `Vault not found at ${vault.path}.`));
  else if (!vault.isGit) out.push(finding('fail', 'vault.not-git', 'The vault is not a git repository, so it cannot sync between machines.'));
  else {
    if (vault.gitDirInCloud) out.push(finding('fail', 'vault.git-in-cloud', 'The vault .git folder lives inside a cloud-sync folder. Placeholders and partial syncs corrupt git data.', 'Keep the git data outside OneDrive and sync only through git.'));
    if (!vault.fsckOk) out.push(finding('fail', 'vault.unreadable', `git cannot read this repository: ${vault.fsckError}`, 'Work from a fresh clone; do not push from this copy.'));
    if (vault.ahead > 0) out.push(finding('warn', 'vault.unpushed', `${vault.ahead} commit(s) exist only on this machine.`, 'Push to a nightly/<machine> branch.'));
    if (vault.behind > 0) out.push(finding('warn', 'vault.behind', `${vault.behind} upstream commit(s) are not pulled.`, 'Fast-forward before the next nightly run.'));
    if (vault.trackedNoise.length) out.push(finding('warn', 'vault.noise', `${vault.trackedNoise.length} tracked file(s) are machine noise (${vault.trackedNoise.slice(0, 3).join(', ')}), a guaranteed merge-conflict source.`, 'Untrack them and add to .gitignore.'));
    if (vault.authors.length === 1) out.push(finding('info', 'vault.identity', `Every recent commit has one author (${vault.authors[0]}), so machines cannot be told apart.`, 'Commit as claude@<machine> for agent work.'));
    if (/nightly/i.test(vault.lastSubject) && vault.lastCommitMs && now - vault.lastCommitMs > NIGHTLY_STALE_MS) out.push(finding('warn', 'vault.nightly-stale', `The last nightly commit is ${age(vault.lastCommitMs, now)} old.`, 'Check the reflect schedule.'));
    if (vault.dirtyTracked) out.push(finding('info', 'vault.dirty', `${vault.dirtyTracked} tracked file(s) modified, ${vault.untracked} untracked.`));
  }

  if (backup.newestMs === null || now - backup.newestMs > BACKUP_STALE_MS) out.push(finding('warn', 'backup.stale', backup.newestMs === null ? 'No vault backup or mirror exists.' : `The newest vault backup is ${age(backup.newestMs, now)} old.`, 'Refresh the off-cloud mirror clone.'));

  const order = { fail: 0, warn: 1, info: 2 };
  return out.sort((a, b) => order[a.level] - order[b.level]);
}

function main() {
  const args = process.argv.slice(2);
  const val = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
  const vault = val('--vault') ?? process.env.STARLIGHT_VAULT ?? join(homedir(), 'OneDrive', 'Dokumente', 'Vault', 'Second Brain');
  const findings = evaluate(collect({ vault, bus: val('--bus'), fetch: args.includes('--fetch') }));
  if (args.includes('--json')) console.log(JSON.stringify(findings, null, 2));
  else {
    for (const x of findings) console.log(`${x.level.toUpperCase().padEnd(4)} ${x.id.padEnd(24)} ${x.message}${x.fix ? `\n${' '.repeat(30)}fix: ${x.fix}` : ''}`);
    if (!findings.length) console.log('OK   nothing to report');
  }
  const bad = findings.some((x) => x.level === 'fail' || (args.includes('--strict') && x.level === 'warn'));
  process.exit(bad ? 1 : 0);
}

if (process.argv[1] && process.argv[1].endsWith('sync-doctor.mjs')) main();
