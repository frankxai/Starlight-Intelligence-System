import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join, basename, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

export const targets = [
  ['core', '@starlight-intelligence/core'],
  ['ai-sdk-adapter', '@starlight-intelligence/ai-sdk'],
  ['mcp-server', '@starlight-intelligence/mcp'],
];
export const digest = bytes => createHash('sha256').update(bytes).digest('hex');

/** npm_execpath can name pnpm's executable symlink instead of its JavaScript file. */
export function pnpmInvocation(cli) {
  if (typeof cli !== 'string' || !isAbsolute(cli) || !/^pnpm(?:\.[cm]?js|\.exe)?$/.test(basename(cli))) {
    throw new Error('Run through pnpm run verify:packages with an absolute pnpm launcher');
  }
  return /\.[cm]?js$/.test(cli) ? { command: process.execPath, prefix: [cli] } : { command: cli, prefix: [] };
}

/** Parse only regular tar entries and directories; links, traversal and oversized archives fail closed. */
export function readTar(bytes) {
  if (bytes.length > 2_000_000) throw new Error('Compressed tar budget exceeded');
  const tar = gunzipSync(bytes, { maxOutputLength: 2_000_000 });
  if (tar.length % 512 !== 0) throw new Error('Incomplete tar block');
  const entries = new Map();
  const seen = new Set();
  let ended = false;
  for (let offset = 0; offset + 512 <= tar.length;) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every(byte => byte === 0)) {
      if (offset + 1024 > tar.length || !tar.subarray(offset).every(byte => byte === 0)) throw new Error('Invalid tar terminator or trailing members');
      ended = true;
      break;
    }
    const field = (a, b) => header.subarray(a, b).toString().replace(/\0.*$/s, '');
    const name = [field(345, 500), field(0, 100)].filter(Boolean).join('/');
    const type = field(156, 157);
    const path = type === '5' ? name.replace(/\/$/, '') : name;
    if (!name.startsWith('package/') || path.split('/').some(part => !part || part === '..' || part === '.') || /[\\:\x00-\x1f\x7f]/.test(name)) throw new Error('Unsafe tar path');
    const octal = (a, b) => {
      const value = field(a, b).trim();
      if (!/^[0-7]+$/.test(value)) throw new Error('Invalid tar numeric field');
      const number = Number.parseInt(value, 8);
      if (!Number.isSafeInteger(number)) throw new Error('Invalid tar numeric field');
      return number;
    };
    const expected = octal(148, 156);
    const checksum = header.reduce((sum, byte, index) => sum + (index >= 148 && index < 156 ? 32 : byte), 0);
    if (expected !== checksum) throw new Error('Invalid tar checksum');
    const size = octal(124, 136);
    const next = offset + 512 + Math.ceil(size / 512) * 512;
    if (next > tar.length) throw new Error('Invalid tar size');
    if (type !== '0' && type !== '' && type !== '5') throw new Error('Unsupported tar entry');
    if (type === '5' && size !== 0) throw new Error('Invalid tar directory payload');
    if (seen.has(path) || seen.size >= 200) throw new Error('Duplicate or excessive tar entries');
    seen.add(path);
    if (!tar.subarray(offset + 512 + size, next).every(byte => byte === 0)) throw new Error('Invalid tar padding');
    if (type !== '5') {
      entries.set(name, tar.subarray(offset + 512, offset + 512 + size));
    }
    offset = next;
  }
  if (!ended) throw new Error('Missing tar terminator');
  return entries;
}

export function validateEntries(entries, expectedName) {
  for (const path of entries.keys()) {
    if (!/^package\/(?:package\.json|README\.md|LICENSE|dist\/[\w/-]+\.(?:js|d\.ts)|schemas\/[\w-]+(?:\.schema)?\.json)$/.test(path)) {
      throw new Error(`Unapproved package member: ${path}`);
    }
  }
  const pkg = JSON.parse(entries.get('package/package.json')?.toString() ?? 'null');
  if (!pkg || pkg.name !== expectedName || pkg.private || !/^\d+\.\d+\.\d+$/.test(pkg.version)) throw new Error('Invalid published package identity');
  for (const group of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
    for (const version of Object.values(pkg[group] ?? {})) {
      if (/^(workspace:|file:|link:)/.test(version)) throw new Error('Unresolved local dependency');
    }
  }
  const paths = value => typeof value === 'string' ? [value] : value && typeof value === 'object' ? Object.values(value).flatMap(paths) : [];
  for (const file of [...paths(pkg.exports), ...paths(pkg.bin), pkg.main, pkg.types].filter(Boolean)) {
    if (!entries.has('package/' + file.replace(/^\.\//, ''))) throw new Error(`Missing entry point: ${file}`);
  }
  if (!entries.has('package/LICENSE') || !entries.has('package/README.md')) throw new Error('Missing license or usage documentation');
  let runtimeBytes = 0;
  if (expectedName === '@starlight-intelligence/core') {
    if (['dependencies', 'optionalDependencies', 'peerDependencies'].some(key => Object.keys(pkg[key] ?? {}).length)) throw new Error('Core must have zero dependencies');
    for (const [path, bytes] of entries) {
      if (!path.endsWith('.js')) continue;
      runtimeBytes += bytes.length;
      if (/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?|\brequire\s*\(\s*)['"](?:node:|[^.])/.test(bytes.toString())) throw new Error('Core imports a nonportable dependency');
    }
    if (runtimeBytes >= 20_000) throw new Error('Core exceeds the 20 kB runtime budget');
  }
  return { name: pkg.name, version: pkg.version, runtimeBytes, unpackedBytes: [...entries.values()].reduce((sum, bytes) => sum + bytes.length, 0) };
}

export function verifyEcosystem(root = resolve(dirname(fileURLToPath(import.meta.url)), '..')) {
  const invocation = pnpmInvocation(process.env.npm_execpath);
  const out = join(root, 'artifacts', 'npm-ecosystem');
  mkdirSync(out, { recursive: true });
  const sourceSha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  const dirty = Boolean(execFileSync('git', ['status', '--porcelain', '--untracked-files=normal'], { cwd: root, encoding: 'utf8' }).trim());
  const packages = [];
  for (const [folder, name] of targets) {
    const cwd = join(root, 'packages', folder);
    const pkg = JSON.parse(readFileSync(join(cwd, 'package.json')));
    const file = name.replace('@', '').replace('/', '-') + '-' + pkg.version + '.tgz';
    const path = join(out, file);
    execFileSync(invocation.command, [...invocation.prefix, 'pack', '--out', path], { cwd, stdio: 'pipe',
      env: { ...process.env, npm_config_ignore_scripts: 'true' }, timeout: 60_000 });
    const bytes = readFileSync(path);
    const entries = readTar(bytes);
    const info = validateEntries(entries, name);
    if (name === '@starlight-intelligence/core' && bytes.length >= 20_000) throw new Error('Core exceeds the 20 kB compressed archive budget');
    // Real content scan of every regular member, with redacted output and no baseline bypass.
    execFileSync('gitleaks', ['stdin', '--no-banner', '--redact'], { cwd: root,
      input: Buffer.concat([...entries.values()]), stdio: ['pipe', 'pipe', 'pipe'], timeout: 60_000 });
    packages.push({ ...info, file, sha256: digest(bytes), integrity: 'sha512-' + createHash('sha512').update(bytes).digest('base64'), compressedBytes: bytes.length });
  }
  const receipt = { schemaVersion: 1, sourceSha, dirty, packages };
  writeFileSync(join(out, 'manifest.json'), JSON.stringify(receipt, null, 2) + '\n');
  console.log(JSON.stringify(receipt, null, 2));
  return receipt;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { verifyEcosystem(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
