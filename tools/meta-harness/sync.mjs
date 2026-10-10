/**
 * sync.mjs — Zero-Copy Skill Mesh Synchronizer for Starlight Meta-Harness
 */

import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { C } from './status.mjs';

const HOME = os.homedir();
const DEFAULT_SOURCE = path.join(HOME, '.agents', 'skills');

export const DEFAULT_TARGETS = [
  path.join(HOME, '.config', 'opencode', 'skills'),
  path.join(HOME, '.config', 'kilo', 'skills'),
  path.join(HOME, '.codex', 'skills'),
];

export function linkDirectory(src, dst) {
  if (process.platform === 'win32') {
    // Use NTFS Junction for directories (zero admin privileges required)
    const cmd = `powershell -NoProfile -Command "New-Item -ItemType Junction -Path '${dst}' -Target '${src}' -Force | Out-Null"`;
    execSync(cmd, { stdio: 'ignore' });
  } else {
    fs.symlinkSync(src, dst, 'dir');
  }
}

export function runSync(options = {}) {
  const source = options.source || DEFAULT_SOURCE;
  const targets = options.targets || DEFAULT_TARGETS;

  console.log(`\n${C.cyan}${C.bold}╔══════════════════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.cyan}${C.bold}║          STARLIGHT ZERO-COPY SKILL MESH SYNCHRONIZER                 ║${C.reset}`);
  console.log(`${C.cyan}${C.bold}╚══════════════════════════════════════════════════════════════════════╝${C.reset}\n`);

  if (!fs.existsSync(source)) {
    console.error(`${C.red}Error:${C.reset} Master skills directory not found at: ${source}`);
    return { ok: false, error: 'source_not_found' };
  }

  const skills = fs.readdirSync(source, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  console.log(`• Master Skill Vault: ${C.bold}${source}${C.reset} (${skills.length} skills found)\n`);

  let totalLinked = 0;

  for (const target of targets) {
    const targetParent = path.dirname(target);
    // If the parent tool directory (e.g. .codex, .config/opencode) doesn't exist, skip or create if installed
    if (!fs.existsSync(targetParent)) {
      console.log(`  ${C.dim}[SKIP] Harness not installed: ${targetParent}${C.reset}`);
      continue;
    }

    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
    }

    const existing = new Set(fs.readdirSync(target));
    let linked = 0;
    let skipped = 0;

    for (const skillName of skills) {
      if (existing.has(skillName)) {
        skipped++;
        continue;
      }

      const srcPath = path.join(source, skillName);
      const dstPath = path.join(target, skillName);

      try {
        linkDirectory(srcPath, dstPath);
        linked++;
      } catch (err) {
        // Skip failed single item
      }
    }

    totalLinked += linked;
    console.log(`  [+] Target: ${C.bold}${target}${C.reset}`);
    console.log(`      Linked: ${C.green}${linked} new junctions${C.reset} | Existing: ${skipped} | Disk added: ${C.green}0 B${C.reset}`);
  }

  console.log(`\n${C.green}${C.bold}✓ SYNCHRONIZATION COMPLETE:${C.reset} ${totalLinked} total junctions established across harnesses.\n`);
  return { ok: true, totalLinked };
}
