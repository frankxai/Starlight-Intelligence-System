#!/usr/bin/env node
/**
 * Starlight Host Scout: bounded, read-only, untrusted local inventory.
 *
 * This is an observation producer. It does not authenticate a device,
 * verify a provider connection, launch an agent, or confer run authority.
 * No executable is invoked; PATH/filesystem probes alone cannot claim liveness.
 * No secrets, config values, or raw transcripts are returned.
 */
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, readdirSync, statSync, statfsSync } from 'node:fs';
import { homedir, hostname, platform as osPlatform, arch as osArch, freemem, totalmem, cpus } from 'node:os';
import { basename, delimiter, extname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const SCHEMA_VERSION = 'starlight.host-observation.v0';
const TOOLS = Object.freeze(['claude', 'codex', 'opencode', 'hermes', 'gemini', 'grok', 'aider', 'cursor', 'pi', 'goose', 'git', 'gh', 'node', 'python', 'uv', 'pnpm', 'npm', 'syncthing', 'tailscale']);
const MAX_FILE_BYTES = 512 * 1024;
const MAX_SKILLS = 250;
const MAX_MCPS = 120;
const MAX_PACKAGES = 300;
const MACHINE_RE = /^[a-z0-9][a-z0-9-]{2,63}$/;

function safeRead(file) {
  try {
    const stat = lstatSync(file);
    if (!stat.isFile() || stat.size > MAX_FILE_BYTES) return null;
    return readFileSync(file, 'utf8');
  } catch { return null; }
}

function safeJson(file) {
  const source = safeRead(file);
  if (source === null) return null;
  try {
    const value = JSON.parse(source);
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
  } catch { return null; }
}

function isRealFile(file) {
  try { return lstatSync(file).isFile(); } catch { return false; }
}
function isRealDirectory(file) {
  try { return lstatSync(file).isDirectory(); } catch { return false; }
}
function limitedEntries(dir, max = 400) {
  try { return readdirSync(dir).sort().slice(0, max); } catch { return []; }
}
function hash(text) { return createHash('sha256').update(text).digest('hex'); }
function stableName(name) { return typeof name === 'string' && /^[A-Za-z0-9@_./-]{1,200}$/.test(name); }

export function findBinaries({ pathEnv = process.env.PATH || '', platform = process.platform, extensions = process.env.PATHEXT || '.COM;.EXE;.BAT;.CMD', includePaths = false } = {}) {
  const dirs = [...new Set(pathEnv.split(delimiter).map(d => d.trim()).filter(Boolean))].slice(0, 90);
  const suffixes = platform === 'win32' ? [...new Set(['', ...extensions.split(';').map(e => e.toLowerCase())])] : [''];
  return TOOLS.map(name => {
    let found = null;
    for (const dir of dirs) {
      for (const suffix of suffixes) {
        const candidate = join(dir, name + suffix);
        if (isRealFile(candidate)) { found = candidate; break; }
      }
      if (found) break;
    }
    return { id: name, kind: ['syncthing','tailscale'].includes(name) ? 'transport_binary' : 'cli_binary', state: found ? 'installed_unverified' : 'not_observed', executable: includePaths && found ? found : undefined, version: null, auth: 'unknown', runtime: 'unknown', authority: 'none' };
  });
}

function scanSkills(home, project, includePaths = false) {
  const roots = [
    ['claude', 'user', join(home, '.claude', 'skills')],
    ['codex', 'user', join(home, '.codex', 'skills')],
    ['agents', 'user', join(home, '.agents', 'skills')],
    ['opencode', 'user', join(home, '.config', 'opencode', 'skills')],
    ['claude', 'project', join(project, '.claude', 'skills')],
    ['agents', 'project', join(project, '.agents', 'skills')],
    ['codex', 'project', join(project, '.codex', 'skills')],
  ];
  const result = [];
  let truncated = false;
  for (const [harness, scope, root] of roots) {
    // Follow only the root: shared skills roots may be Windows junctions.
    // Entries and SKILL.md files retain lstat checks so their links are never followed.
    try { if (!statSync(root).isDirectory()) continue; } catch { continue; }
    const entries = limitedEntries(root, MAX_SKILLS + 1);
    if (entries.length > MAX_SKILLS) truncated = true;
    for (const dirName of entries.slice(0, MAX_SKILLS)) {
      if (result.length >= MAX_SKILLS) return { skills: result, truncated: true };
      if (!stableName(dirName)) continue;
      if (!isRealDirectory(join(root, dirName))) continue;
      const skillFile = join(root, dirName, 'SKILL.md');
      const body = safeRead(skillFile);
      if (body === null) continue;
      result.push({ id: dirName, harness, scope, state: 'manifest_present_unloaded', sha256: hash(body), source: includePaths ? skillFile : `${harness}:${scope}` });
    }
  }
  return { skills: result, truncated };
}

function scanMcp(home, project, includePaths = false) {
  const candidates = [
    ['claude', 'user', join(home, '.claude.json'), 'mcpServers'],
    ['claude', 'project', join(project, '.mcp.json'), 'mcpServers'],
    ['cursor', 'project', join(project, '.cursor', 'mcp.json'), 'mcpServers'],
    ['opencode', 'user', join(home, '.config', 'opencode', 'opencode.json'), 'mcp'],
    ['opencode', 'project', join(project, 'opencode.json'), 'mcp'],
  ];
  const values = [];
  for (const [harness, scope, path, key] of candidates) {
    const raw = safeJson(path);
    const config = raw?.[key];
    if (!config || typeof config !== 'object' || Array.isArray(config)) continue;
    for (const name of Object.keys(config).sort().slice(0, MAX_MCPS)) {
      if (!stableName(name) || values.length >= MAX_MCPS) continue;
      values.push({ id: name, harness, scope, state: 'configured_unverified', auth: 'unknown', connected: 'unknown', source: includePaths ? path : `${harness}:${scope}` });
    }
  }
  // Codex TOML: extract section names only, never values or commands.
  const tomlPath = join(home, '.codex', 'config.toml');
  const toml = safeRead(tomlPath);
  if (toml) {
    for (const line of toml.split(/\r?\n/)) {
      const match = line.match(/^\s*\[mcp_servers\.([A-Za-z0-9_-]{1,80})\]\s*$/);
      if (!match || values.length >= MAX_MCPS) continue;
      values.push({ id: match[1], harness: 'codex', scope: 'user', state: 'configured_unverified', auth: 'unknown', connected: 'unknown', source: includePaths ? tomlPath : 'codex:user' });
    }
  }
  return values;
}

function scanPackages(project, includePaths = false) {
  const raw = safeJson(join(project, 'package.json'));
  if (!raw) return [];
  const present = { ...(raw.dependencies || {}), ...(raw.devDependencies || {}) };
  const names = Object.keys(present).filter(stableName).sort().slice(0, MAX_PACKAGES);
  return names.map(id => ({
    id, ecosystem: 'npm', scope: 'project',
    state: isRealFile(join(project, 'node_modules', id, 'package.json')) ? 'manifest_and_package_present_unverified' : 'declared_not_verified',
    source: includePaths ? join(project, 'package.json') : 'project:package.json',
    auth: 'not_applicable'
  }));
}

function scanPlugins(home, includePaths = false) {
  const path = join(home, '.claude', 'plugins', 'installed_plugins.json');
  const raw = safeJson(path);
  if (!raw) return [];
  const config = raw.plugins;
  if (!config || typeof config !== 'object' || Array.isArray(config)) return [];
  return Object.keys(config).filter(stableName).sort().slice(0, 100).map(id => ({ id, harness: 'claude', scope: 'user', state: 'registered_unverified', source: includePaths ? path : 'claude:user' }));
}

function resourceSnapshot(project) {
  let freeDiskBytes = null;
  try {
    const stats = statfsSync(project);
    freeDiskBytes = Number(stats.bavail) * Number(stats.bsize);
  } catch { /* unsupported platform */ }
  return { ramTotalBytes: totalmem(), ramFreeBytes: freemem(), cpuLogicalCount: cpus().length, projectVolumeFreeBytes: freeDiskBytes };
}

export function collectHostSnapshot({ machineId = null, projectRoot = process.cwd(), home = homedir(), pathEnv, platform = osPlatform(), includePaths = false, now = new Date().toISOString() } = {}) {
  if (machineId !== null && !MACHINE_RE.test(machineId)) throw new Error('invalid machine id');
  if (!Number.isFinite(Date.parse(now))) throw new Error('invalid timestamp');
  const project = resolve(projectRoot);
  const { skills, truncated: skillsTruncated } = scanSkills(home, project, includePaths);
  const data = {
    schemaVersion: SCHEMA_VERSION,
    observedAt: now,
    host: { claimedMachineId: machineId, osHostname: hostname(), platform, arch: osArch(), identity: 'locally_observed_not_attested', peerConnectivity: 'unknown' },
    resources: resourceSnapshot(project),
    harnesses: findBinaries({pathEnv, platform, includePaths}),
    skills,
    skillsTruncated,
    mcpServers: scanMcp(home, project, includePaths),
    plugins: scanPlugins(home, includePaths),
    projectPackages: scanPackages(project, includePaths),
    sessions: { state: 'not_scanned', reason: 'use existing SIS agent-lifecycle inspector for process/session state' },
    cloudSessions: { state: 'unknown', reason: 'cloud provider authentication and API query required' },
    permission: { remoteDispatch: 'not_authorized', credentialStatus: 'unknown', verifiedHost: false },
    privacy: { rawConfigValuesIncluded: false, secretsIncluded: false, exactPathsIncluded: includePaths, observationSigned: false },
  };
  return { ...data, observationSha256: hash(JSON.stringify(data)) };
}

function parseArgs(argv) {
  const options = { machineId: null, projectRoot: process.cwd(), includePaths: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--machine-id' && i + 1 < argv.length) options.machineId = argv[++i];
    else if (argv[i] === '--project-root' && i + 1 < argv.length) options.projectRoot = argv[++i];
    else if (argv[i] === '--include-local-paths') options.includePaths = true;
    else if (argv[i] === '--help') return null;
    else throw new Error('unknown or incomplete option');
  }
  return options;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options === null) {
      console.log('Usage: node tools/fleet/host-scout.mjs [--machine-id ID] [--project-root PATH] [--include-local-paths]');
    } else {
      console.log(JSON.stringify(collectHostSnapshot(options), null, 2));
    }
  } catch (err) {
    console.error(JSON.stringify({ error: 'host_scout_invalid_input', detail: err.message }));
    process.exitCode = 2;
  }
}
