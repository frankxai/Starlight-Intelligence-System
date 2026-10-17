#!/usr/bin/env node
/**
 * org-federation-audit.mjs
 *
 * Deterministic audit and remote-wiring tool for the 10-Organization GitHub Federation.
 * Verifies organization metadata, <Org>/.github governance repositories, strict
 * public/private visibility parity, and local `origin` + `org` git remote alignment.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const DEFAULT_REPOS_ROOT = 'C:/Users/frank/starlight/repos';

export const ORG_FEDERATION_MANIFEST = [
  {
    login: 'Starlight-Intelligence',
    displayName: 'Starlight Intelligence',
    website: 'https://starlightintelligence.ai',
    brandId: 'sis',
    governanceMode: 'active',
    repos: [
      { name: 'starlight-command-center', visibility: 'private', primaryOwner: 'Starlight-Intelligence' },
      { name: 'starlight-agent-config', visibility: 'private', primaryOwner: 'frankxai' },
      { name: 'starlight-memory', visibility: 'private', primaryOwner: 'frankxai' },
      { name: 'starlight-voice', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'starlight-technology', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'starlight-design-intelligence', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'starlight-agent-skills', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'starlight-evals', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'starlight-android', visibility: 'private', primaryOwner: 'frankxai' },
      { name: 'starlightintelligence.ai', visibility: 'private', primaryOwner: 'frankxai' }
    ]
  },
  {
    login: 'Starlight-Intelligence-Systems',
    displayName: 'Starlight Intelligence Systems',
    website: 'https://starlightintelligence.org',
    brandId: 'sis',
    governanceMode: 'active',
    repos: [
      { name: 'Starlight-Intelligence-System', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'starlight-research-hub', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'starlight-knowledge-tree', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'starlight-cosmos-engine', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'starlight-swarm', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'starlight-memory-vault', visibility: 'private', primaryOwner: 'frankxai' }
    ]
  },
  {
    login: 'Arcanea-Labs',
    displayName: 'Arcanea Labs',
    website: 'https://arcanea.ai',
    brandId: 'arcanea',
    governanceMode: 'active',
    repos: [
      { name: 'Arcanea', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'arcanea-ai-app', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'arcanea-studio', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'arcanea-ecosystem', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'arcanea-agent-skills', visibility: 'private', primaryOwner: 'frankxai' },
      { name: 'arcanea-onchain', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'arcanea-orchestrator', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'AnimeLegends', visibility: 'private', primaryOwner: 'frankxai' }
    ]
  },
  {
    login: 'GenCreator-ai',
    displayName: 'GenCreator',
    website: 'https://gencreator.ai',
    brandId: 'gencreator',
    governanceMode: 'active',
    repos: [
      { name: 'gencreator.ai', visibility: 'private', primaryOwner: 'frankxai' },
      { name: 'GenCreator-OS', visibility: 'private', primaryOwner: 'frankxai' },
      { name: 'GenCreator-Studio', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'agentic-creator-os', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'creator-skills', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'creator-launch-os', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'suno-mcp-server', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'starlight-creator-mcp', visibility: 'public', primaryOwner: 'frankxai' }
    ]
  },
  {
    login: 'FrankX-AI',
    displayName: 'FrankX',
    website: 'https://frankx.ai',
    brandId: 'frankx',
    governanceMode: 'active',
    repos: [
      { name: 'frankx.ai-vercel-website', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'FrankX', visibility: 'private', primaryOwner: 'frankxai' },
      { name: 'author-os', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'publishing-house', visibility: 'private', primaryOwner: 'frankxai' },
      { name: 'prompt-library', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'claude-skills-library', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'mcp-doctor', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'claude-code-hooks', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'visual-intelligence', visibility: 'public', primaryOwner: 'frankxai' }
    ]
  },
  {
    login: 'AI-Architect-Studio',
    displayName: 'AI Architect Studio',
    website: 'https://frankx.ai/ai-architect',
    brandId: 'ai-architect',
    governanceMode: 'active',
    repos: [
      { name: 'ai-architect', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'ai-coe', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'agentic-architecture-field-guide', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'awesome-ai-coe', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'awesome-agent-operating-systems', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'agentic-operating-system-standard', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'agentic-ops', visibility: 'private', primaryOwner: 'frankxai' }
    ]
  },
  {
    login: 'AI-Architect-Academy',
    displayName: 'AI Architect Academy',
    website: 'https://frankx.ai/academy',
    brandId: 'ai-architect',
    governanceMode: 'active',
    repos: [
      { name: 'ai-architect-academy', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'starlight-intelligence-academy', visibility: 'private', primaryOwner: 'frankxai' }
    ]
  },
  {
    login: 'Agentic-Income',
    displayName: 'Agentic Income',
    website: 'https://agenticincome.ai',
    brandId: 'agentic-income',
    governanceMode: 'active',
    repos: [
      { name: 'agenticincome', visibility: 'private', primaryOwner: 'frankxai' },
      { name: 'agenticpassiveincome', visibility: 'private', primaryOwner: 'frankxai' },
      { name: 'awesome-agentic-income', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'agentic-income-skills', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'agentic-income-template', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'affiliate-agent-skills', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'awesome-wealth-agent-skills', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'awesome-investor-agent-skills', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'GenInvestor', visibility: 'public', primaryOwner: 'frankxai' }
    ]
  },
  {
    login: 'Life-Commons',
    displayName: 'Life Commons',
    website: 'https://bluelifecommons.org',
    brandId: 'life-commons',
    governanceMode: 'active',
    repos: [
      { name: 'blue-life-commons', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'dino-life-commons', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'ocean-intelligence', visibility: 'private', primaryOwner: 'frankxai' },
      { name: 'health-intelligence-system', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'mind-intelligence-systems', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'family-intelligence-os', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'family-history-atlas', visibility: 'public', primaryOwner: 'frankxai' }
    ]
  },
  {
    login: 'oci-ai-architects',
    displayName: 'OCI AI Architects',
    website: 'https://github.com/oci-ai-architects',
    brandId: 'oci-community',
    governanceMode: 'reshape-frozen',
    repos: [
      { name: 'multi-cloud-ai-architect', visibility: 'public', primaryOwner: 'oci-ai-architects' },
      { name: 'claude-code-oci-ai-architect-skills', visibility: 'public', primaryOwner: 'oci-ai-architects' },
      { name: 'oci-ai-coe-starter-kit', visibility: 'public', primaryOwner: 'oci-ai-architects' },
      { name: 'oci-genai-guides', visibility: 'public', primaryOwner: 'oci-ai-architects' },
      { name: 'oci-ai-architect', visibility: 'private', primaryOwner: 'oci-ai-architects' }
    ]
  }
];

/**
 * Validates that an org repository never exposes a private source repository as public.
 * @param {{ isPrivate: boolean }} sourceRepo
 * @param {{ isPrivate: boolean }} orgRepo
 * @returns {{ ok: boolean, reason?: string }}
 */
export function validateVisibilityParity(sourceRepo, orgRepo) {
  if (!sourceRepo || typeof sourceRepo.isPrivate !== 'boolean') {
    return { ok: false, reason: 'sourceRepo.isPrivate must be a boolean' };
  }
  if (!orgRepo || typeof orgRepo.isPrivate !== 'boolean') {
    return { ok: false, reason: 'orgRepo.isPrivate must be a boolean' };
  }
  if (sourceRepo.isPrivate && !orgRepo.isPrivate) {
    return {
      ok: false,
      reason: 'VISIBILITY_VIOLATION: private source repository cannot be mirrored to a public organization repository'
    };
  }
  return { ok: true };
}

/**
 * Finds a local checkout directory in reposRoot (case-insensitive match).
 */
export function findLocalCheckout(reposRoot, repoName) {
  if (!fs.existsSync(reposRoot)) return null;
  const entries = fs.readdirSync(reposRoot, { withFileTypes: true });
  const hit = entries.find(
    (e) => e.isDirectory() && e.name.toLowerCase() === repoName.toLowerCase()
  );
  if (!hit) return null;
  const fullPath = path.join(reposRoot, hit.name);
  return fs.existsSync(path.join(fullPath, '.git')) ? fullPath : null;
}

/**
 * Reads git remotes for a local checkout.
 */
export function getLocalRemotes(repoDir) {
  const remotes = {};
  try {
    const out = execFileSync('git', ['-C', repoDir, 'remote', '-v'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    });
    for (const line of out.split(/\r?\n/)) {
      const m = /^(\S+)\s+(\S+)\s+\(fetch\)$/.exec(line.trim());
      if (m) remotes[m[1]] = m[2];
    }
  } catch {
    // ignore
  }
  return remotes;
}

/**
 * Audits or wires local `org` remotes across all repos in ORG_FEDERATION_MANIFEST.
 */
export function auditOrWireLocalRemotes(reposRoot = DEFAULT_REPOS_ROOT, { wire = false, manifest = ORG_FEDERATION_MANIFEST } = {}) {
  const rows = [];
  for (const org of manifest) {
    for (const repo of org.repos) {
      const localDir = findLocalCheckout(reposRoot, repo.name);
      const expectedOrgUrl = `https://github.com/${org.login}/${repo.name}.git`;
      if (!localDir) {
        rows.push({
          org: org.login,
          repo: repo.name,
          localFound: false,
          originUrl: null,
          orgUrl: null,
          orgAligned: false
        });
        continue;
      }

      let remotes = getLocalRemotes(localDir);
      if (wire && remotes.org !== expectedOrgUrl) {
        if (remotes.org) {
          execFileSync('git', ['-C', localDir, 'remote', 'set-url', 'org', expectedOrgUrl], { stdio: 'ignore' });
        } else {
          execFileSync('git', ['-C', localDir, 'remote', 'add', 'org', expectedOrgUrl], { stdio: 'ignore' });
        }
        remotes = getLocalRemotes(localDir);
      }

      const norm = (u) => (u ? u.replace(/\.git$/i, '').toLowerCase() : '');
      const orgAligned = norm(remotes.org) === norm(expectedOrgUrl);

      rows.push({
        org: org.login,
        repo: repo.name,
        localFound: true,
        originUrl: remotes.origin || null,
        orgUrl: remotes.org || null,
        orgAligned
      });
    }
  }
  return rows;
}

function main() {
  const args = process.argv.slice(2);
  const wire = args.includes('--wire-local');
  const asJson = args.includes('--json');
  const rootIdx = args.indexOf('--repos-root');
  const reposRoot = rootIdx !== -1 && args[rootIdx + 1] ? args[rootIdx + 1] : DEFAULT_REPOS_ROOT;

  const rows = auditOrWireLocalRemotes(reposRoot, { wire });
  const localPresent = rows.filter((r) => r.localFound);
  const aligned = localPresent.filter((r) => r.orgAligned);

  const summary = {
    totalOrganizations: ORG_FEDERATION_MANIFEST.length,
    totalFederatedRepos: rows.length,
    localCheckoutsFound: localPresent.length,
    localOrgRemotesAligned: aligned.length,
    allLocalAligned: aligned.length === localPresent.length
  };

  if (asJson) {
    console.log(JSON.stringify({ summary, rows }, null, 2));
  } else {
    console.log(`GitHub Organization Federation Audit (${summary.totalOrganizations} orgs, ${summary.totalFederatedRepos} mapped repos)`);
    console.log(`Local checkouts found: ${summary.localCheckoutsFound} | 'org' remotes aligned: ${summary.localOrgRemotesAligned}/${summary.localCheckoutsFound}`);
    const misaligned = localPresent.filter((r) => !r.orgAligned);
    if (misaligned.length > 0) {
      console.error('Misaligned local org remotes:');
      console.table(misaligned);
      process.exitCode = 1;
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
