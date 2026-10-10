#!/usr/bin/env node

/**
 * Ecosystem NPM Release Pipeline
 * Coordinates releases across @starlight-intelligence, @arcanea, and @frankxai
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const reposRoot = 'C:/Users/frank/starlight/repos';
const isPublish = process.argv.includes('--publish');
const otpArg = process.argv.find(a => a.startsWith('--otp=') || a === '--otp');
const otpVal = otpArg ? (otpArg.includes('=') ? otpArg.split('=')[1] : process.argv[process.argv.indexOf('--otp') + 1]) : null;

const targets = [
  {
    org: '@starlight-intelligence',
    name: '@starlight-intelligence/system',
    path: path.join(reposRoot, 'Starlight-Intelligence-System'),
    buildCmd: 'npm run build'
  },
  {
    org: '@starlight-intelligence',
    name: '@starlight-intelligence/memory',
    path: path.join(reposRoot, 'starlight-memory'),
    buildCmd: 'npm run build'
  },
  {
    org: '@starlight-intelligence',
    name: '@starlight-intelligence/creator-mcp',
    path: path.join(reposRoot, 'starlight-creator-mcp/packages/bundle'),
    buildCmd: 'npm run build'
  },
  {
    org: '@frankxai',
    name: '@frankxai/agentic-creator-os',
    path: path.join(reposRoot, 'agentic-creator-os'),
    buildCmd: null
  },
  {
    org: '@frankxai',
    name: '@frankxai/suno-mcp-server',
    path: path.join(reposRoot, 'suno-mcp-server'),
    buildCmd: 'npm run build'
  },
  {
    org: '@arcanea',
    name: '@arcanea/starlight-intelligence-system',
    path: path.join(reposRoot, 'Starlight-Intelligence-System/packages/arcanea-starlight-shim'),
    buildCmd: null
  }
];

console.log('='.repeat(70));
console.log('🌟 STARLIGHT ECOSYSTEM NPM RELEASE PIPELINE');
console.log(`Mode: ${isPublish ? '🚀 LIVE PUBLISH' : '🧪 DRY-RUN & PACK VERIFICATION'}`);
console.log('='.repeat(70));

// Check NPM Auth
let currentUser = null;
try {
  currentUser = execSync('npm whoami', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  console.log(`\n✓ NPM Authenticated as: ${currentUser}`);
} catch {
  console.log('\n⚠️  NPM Auth: Currently unauthenticated or token expired.');
  if (isPublish) {
    console.error('❌ Cannot run --publish without active NPM login. Please run: npm login');
    process.exit(1);
  }
}

const summary = [];

for (const target of targets) {
  console.log(`\n--------------------------------------------------`);
  console.log(`Checking ${target.name} in ${target.path}`);

  if (!fs.existsSync(target.path)) {
    console.error(`❌ Path not found: ${target.path}`);
    summary.push({ name: target.name, org: target.org, status: 'PATH NOT FOUND' });
    continue;
  }

  const pkgJsonPath = path.join(target.path, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) {
    console.error(`❌ package.json not found in ${target.path}`);
    summary.push({ name: target.name, org: target.org, status: 'NO PACKAGE.JSON' });
    continue;
  }

  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

  // Build if required
  if (target.buildCmd) {
    console.log(`  🔨 Running build: ${target.buildCmd}...`);
    try {
      execSync(target.buildCmd, { cwd: target.path, stdio: 'inherit' });
    } catch (e) {
      console.error(`  ❌ Build failed for ${target.name}`);
      summary.push({ name: target.name, org: target.org, version: pkg.version, status: 'BUILD FAILED' });
      continue;
    }
  }

  // Pack Dry Run
  console.log(`  📦 Verifying tarball pack...`);
  try {
    const packOut = execSync('npm pack --dry-run', { cwd: target.path, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const tarballMatch = packOut.match(/([a-z0-9-@_.]+\.tgz)/i);
    const tarballName = tarballMatch ? tarballMatch[1] : 'tarball created';
    console.log(`  ✓ Tarball verified: ${tarballName}`);

    if (isPublish) {
      console.log(`  🚀 Publishing ${target.name}@${pkg.version}...`);
      const otpFlag = otpVal ? ` --otp ${otpVal}` : '';
      execSync(`npm publish --access public${otpFlag}`, { cwd: target.path, stdio: 'inherit' });
      summary.push({ name: target.name, org: target.org, version: pkg.version, status: 'PUBLISHED' });
    } else {
      summary.push({ name: target.name, org: target.org, version: pkg.version, status: 'PACK READY' });
    }
  } catch (err) {
    console.error(`  ❌ Pack/Publish failed: ${err.message}`);
    summary.push({ name: target.name, org: target.org, version: pkg.version, status: 'PACK/PUB FAILED' });
  }
}

console.log('\n' + '='.repeat(70));
console.log('📋 RELEASE PIPELINE SUMMARY');
console.log('='.repeat(70));
console.table(summary);
console.log('\nDone.');
