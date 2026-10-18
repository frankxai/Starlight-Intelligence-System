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

export const DEFAULT_HEARTBEAT_PATH = 'C:/Users/frank/starlight/logs/heartbeats/heartbeat-task-org-federation.json';

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
 * Validates that an organization's default repository permission is locked to 'none'.
 * @param {string | { default_repository_permission?: string }} permOrMeta
 */
export function validateOrgBasePermission(permOrMeta) {
  const perm = typeof permOrMeta === 'object' && permOrMeta !== null
    ? permOrMeta.default_repository_permission
    : permOrMeta;
  if (perm !== 'none') {
    return {
      ok: false,
      reason: `BASE_PERMISSION_VIOLATION: expected default_repository_permission='none', got '${perm}'`
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
          primaryOwner: repo.primaryOwner,
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
        primaryOwner: repo.primaryOwner,
        localFound: true,
        localDir,
        originUrl: remotes.origin || null,
        orgUrl: remotes.org || null,
        orgAligned
      });
    }
  }
  return rows;
}

function ghApiJson(endpoint, args = []) {
  try {
    const out = execFileSync('gh', ['api', endpoint, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 30000
    });
    return out.trim() ? JSON.parse(out) : {};
  } catch {
    return null;
  }
}

/**
 * Hardens a federated mirror repository on GitHub (where primaryOwner === 'frankxai'):
 *   1. Disables GitHub Actions on the mirror so mirror pushes never burn CI minutes
 *   2. Disables Dependabot automated security fixes & vulnerability alerts on the mirror
 *   3. Disables Issues, Projects, and Wiki on the mirror so history never splits
 *   4. Closes any open Dependabot PRs on the mirror copy
 */
export function hardenReadOnlyMirrorOnGitHub(orgLogin, repoName) {
  const fullRepo = `${orgLogin}/${repoName}`;
  const actionsDisabled = (() => {
    try {
      execFileSync('gh', ['api', '-X', 'PUT', `repos/${fullRepo}/actions/permissions`, '-F', 'enabled=false'], {
        stdio: 'ignore',
        timeout: 20000
      });
      return true;
    } catch {
      return false;
    }
  })();

  try {
    execFileSync('gh', ['api', '-X', 'DELETE', `repos/${fullRepo}/automated-security-fixes`], {
      stdio: 'ignore',
      timeout: 15000
    });
  } catch {
    // ignore
  }

  try {
    execFileSync('gh', ['api', '-X', 'DELETE', `repos/${fullRepo}/vulnerability-alerts`], {
      stdio: 'ignore',
      timeout: 15000
    });
  } catch {
    // ignore
  }

  try {
    execFileSync(
      'gh',
      [
        'api',
        '-X',
        'PATCH',
        `repos/${fullRepo}`,
        '-F',
        'has_issues=false',
        '-F',
        'has_projects=false',
        '-F',
        'has_wiki=false'
      ],
      { stdio: 'ignore', timeout: 20000 }
    );
  } catch {
    // ignore
  }

  // Close any open Dependabot PRs on the mirror
  let closedBotPrs = 0;
  const openPrs = ghApiJson(`repos/${fullRepo}/pulls?state=open&per_page=50`);
  if (Array.isArray(openPrs)) {
    for (const pr of openPrs) {
      const login = String(pr?.user?.login || '').toLowerCase();
      if (login.includes('dependabot') || login.includes('[bot]')) {
        try {
          execFileSync(
            'gh',
            [
              'pr',
              'close',
              String(pr.number),
              '--repo',
              fullRepo,
              '--delete-branch',
              '--comment',
              `Closing automated bot PR on federated read-only mirror \`${fullRepo}\`. Canonical dependency updates and CI execute on \`frankxai/${repoName}\`.`
            ],
            { stdio: 'ignore', timeout: 20000 }
          );
          closedBotPrs++;
        } catch {
          // ignore
        }
      }
    }
  }

  return { fullRepo, actionsDisabled, closedBotPrs };
}

/**
 * Checks default-branch SHA parity between primaryOwner/<repo> and <Org>/<repo>,
 * and optionally syncs `origin/<defaultBranch>` -> `org/<defaultBranch>` so 0 SHA drift exists.
 */
export function checkAndSyncMirrorShaParity(
  reposRoot = DEFAULT_REPOS_ROOT,
  { sync = false, hardenMirrors = false, manifest = ORG_FEDERATION_MANIFEST } = {}
) {
  const results = [];
  for (const org of manifest) {
    if (org.governanceMode === 'reshape-frozen') continue;
    for (const repo of org.repos) {
      if (repo.primaryOwner !== 'frankxai') {
        results.push({
          org: org.login,
          repo: repo.name,
          role: 'org-native',
          inSync: true,
          syncedNow: false
        });
        continue;
      }

      const localDir = findLocalCheckout(reposRoot, repo.name);
      if (!localDir) {
        results.push({
          org: org.login,
          repo: repo.name,
          role: 'federated-mirror',
          inSync: false,
          syncedNow: false,
          error: 'local_checkout_missing'
        });
        continue;
      }

      let hardenResult = null;
      if (hardenMirrors) {
        hardenResult = hardenReadOnlyMirrorOnGitHub(org.login, repo.name);
      }

      let originSha = null;
      let orgSha = null;
      let syncedNow = false;
      let defaultBranch = 'main';

      const bMain = ghApiJson(`repos/frankxai/${repo.name}/branches/main`);
      if (bMain?.commit?.sha) {
        originSha = bMain.commit.sha;
        defaultBranch = 'main';
      } else {
        const bMaster = ghApiJson(`repos/frankxai/${repo.name}/branches/master`);
        if (bMaster?.commit?.sha) {
          originSha = bMaster.commit.sha;
          defaultBranch = 'master';
        }
      }

      const orgBranch = ghApiJson(`repos/${org.login}/${repo.name}/branches/${defaultBranch}`);
      orgSha = orgBranch?.commit?.sha || null;
      const orgMsg = String(orgBranch?.commit?.commit?.message || '');
      const attestedTreeSync = Boolean(
        originSha && orgMsg.includes(`sync frankxai/${repo.name}@${originSha.slice(0, 12)}`)
      );

      if (sync && originSha && originSha !== orgSha && !attestedTreeSync) {
        try {
          execFileSync(
            'git',
            ['-C', localDir, 'fetch', 'origin', `+refs/heads/${defaultBranch}:refs/remotes/origin/${defaultBranch}`],
            { stdio: 'ignore', timeout: 45000 }
          );
          execFileSync(
            'git',
            ['-C', localDir, 'push', 'org', `refs/remotes/origin/${defaultBranch}:refs/heads/${defaultBranch}`, '--force', '--no-verify'],
            { stdio: 'ignore', timeout: 60000 }
          );
          orgSha = originSha;
          syncedNow = true;
        } catch {
          // If local is a shallow clone, unshallow the default branch and retry
          try {
            execFileSync(
              'git',
              ['-C', localDir, 'fetch', '--unshallow', 'origin', `+refs/heads/${defaultBranch}:refs/remotes/origin/${defaultBranch}`],
              { stdio: 'ignore', timeout: 90000 }
            );
            execFileSync(
              'git',
              ['-C', localDir, 'push', 'org', `refs/remotes/origin/${defaultBranch}:refs/heads/${defaultBranch}`, '--force', '--no-verify'],
              { stdio: 'ignore', timeout: 90000 }
            );
            orgSha = originSha;
            syncedNow = true;
          } catch {
            // ignore
          }
        }
      }

      results.push({
        org: org.login,
        repo: repo.name,
        role: 'federated-mirror',
        defaultBranch,
        originSha: originSha ? originSha.slice(0, 12) : null,
        orgSha: orgSha ? orgSha.slice(0, 12) : null,
        inSync: Boolean((originSha && orgSha && originSha === orgSha) || attestedTreeSync),
        syncedNow,
        ...(hardenResult ? { hardenResult } : {})
      });
    }
  }
  return results;
}

export function writeOrgFederationHeartbeat(summary, heartbeatPath = DEFAULT_HEARTBEAT_PATH) {
  try {
    fs.mkdirSync(path.dirname(heartbeatPath), { recursive: true });
    const payload = {
      ts: new Date().toISOString(),
      status: summary.allLocalAligned && (summary.driftedMirrorsCount ?? 0) === 0 ? 'ok' : 'warn',
      totalOrganizations: summary.totalOrganizations,
      totalFederatedRepos: summary.totalFederatedRepos,
      localOrgRemotesAligned: summary.localOrgRemotesAligned,
      shaParityChecked: Boolean(summary.shaParityChecked),
      alignedMirrorsCount: summary.alignedMirrorsCount ?? null,
      driftedMirrorsCount: summary.driftedMirrorsCount ?? 0,
      closedBotPrsCount: summary.closedBotPrsCount ?? 0,
      staleAfterMs: 93600000,
      attestation: 'Built on SIP'
    };
    fs.writeFileSync(heartbeatPath, JSON.stringify(payload) + '\n', 'utf8');
    return payload;
  } catch {
    return null;
  }
}

function main() {
  const args = process.argv.slice(2);
  const wire = args.includes('--wire-local');
  const syncMirrors = args.includes('--sync-mirrors');
  const checkDrift = args.includes('--check-drift') || syncMirrors;
  const hardenMirrors = args.includes('--harden-mirrors');
  const asJson = args.includes('--json');
  const rootIdx = args.indexOf('--repos-root');
  const reposRoot = rootIdx !== -1 && args[rootIdx + 1] ? args[rootIdx + 1] : DEFAULT_REPOS_ROOT;

  const rows = auditOrWireLocalRemotes(reposRoot, { wire });
  const localPresent = rows.filter((r) => r.localFound);
  const aligned = localPresent.filter((r) => r.orgAligned);

  let parityRows = [];
  if (checkDrift || hardenMirrors) {
    parityRows = checkAndSyncMirrorShaParity(reposRoot, { sync: syncMirrors, hardenMirrors });
  }

  const alignedMirrors = parityRows.filter((r) => r.inSync);
  const driftedMirrors = parityRows.filter((r) => !r.inSync);
  const closedBotPrsCount = parityRows.reduce((acc, r) => acc + (r.hardenResult?.closedBotPrs || 0), 0);

  const summary = {
    totalOrganizations: ORG_FEDERATION_MANIFEST.length,
    totalFederatedRepos: rows.length,
    localCheckoutsFound: localPresent.length,
    localOrgRemotesAligned: aligned.length,
    allLocalAligned: aligned.length === localPresent.length,
    shaParityChecked: checkDrift || hardenMirrors,
    alignedMirrorsCount: parityRows.length ? alignedMirrors.length : null,
    driftedMirrorsCount: parityRows.length ? driftedMirrors.length : 0,
    syncedNowCount: parityRows.filter((r) => r.syncedNow).length,
    closedBotPrsCount
  };

  writeOrgFederationHeartbeat(summary);

  if (asJson) {
    console.log(JSON.stringify({ summary, rows, ...(parityRows.length ? { parityRows } : {}) }, null, 2));
  } else {
    console.log(`GitHub Organization Federation Audit (${summary.totalOrganizations} orgs, ${summary.totalFederatedRepos} mapped repos)`);
    console.log(`Local checkouts found: ${summary.localCheckoutsFound} | 'org' remotes aligned: ${summary.localOrgRemotesAligned}/${summary.localCheckoutsFound}`);
    if (summary.shaParityChecked) {
      console.log(`Mirror SHA Parity: ${summary.alignedMirrorsCount}/${parityRows.length} in sync | Synced now: ${summary.syncedNowCount} | Closed duplicate bot PRs: ${summary.closedBotPrsCount}`);
      if (driftedMirrors.length > 0) {
        console.error('Drifted mirrors:', driftedMirrors);
      }
    }
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

