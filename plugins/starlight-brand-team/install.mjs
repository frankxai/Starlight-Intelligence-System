#!/usr/bin/env node
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, realpathSync, renameSync, rmSync } from 'node:fs';
import { dirname, isAbsolute, join, parse, relative, resolve, sep } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const hosts = { claude: '.claude/skills', codex: '.agents/skills', antigravity: '.agents/skills', opencode: '.opencode/skills' };
const [host, requested, ...extra] = process.argv.slice(2);
if (!hosts[host] || !requested || extra.length) {
  console.error('Usage: node install.mjs <claude|codex|antigravity|opencode> <private-project-directory>');
  process.exit(1);
}
const target = resolve(requested);
const fromSource = relative(root, target);
if (target === parse(target).root || target === resolve(homedir()) || fromSource === '' || (!fromSource.startsWith('..' + sep) && !isAbsolute(fromSource) && fromSource !== '..')) {
  console.error('Choose a separate project directory, outside this package; home/root installs are refused.');
  process.exit(1);
}
const destination = join(target, hosts[host], 'starlight-brand-team');
// Inspect every existing ancestor before writing; never follow a project symlink.
let current = destination;
while (current !== dirname(current)) {
  try {
    const stat = lstatSync(current);
    if (stat.isSymbolicLink() || !stat.isDirectory()) {
      console.error('Refusing symlink or non-directory in destination: ' + current);
      process.exit(1);
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  current = dirname(current);
}
if (existsSync(destination)) {
  console.error('Existing skill preserved. Choose a fresh project or review the existing skill manually: ' + destination);
  process.exit(1);
}
const source = join(root, 'skills', 'starlight-brand-team');
realpathSync(source);
mkdirSync(dirname(destination), { recursive: true });
const staging = mkdtempSync(destination + '.install-');
try {
  cpSync(source, join(staging, 'skill'), { recursive: true, errorOnExist: true, force: false });
  renameSync(join(staging, 'skill'), destination);
  rmSync(staging, { recursive: true });
} catch (error) {
  if (existsSync(staging)) rmSync(staging, { recursive: true });
  throw error;
}
console.log('Installed project skill: ' + destination);
console.log('Open this project in your chosen host. Ask it to use starlight-brand-team with the fictional demo sources.');
console.log('File installation does not verify native discovery or model behavior. No accounts or global settings were changed.');
