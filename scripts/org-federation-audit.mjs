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
    steward: 'steward-starlight',
    executiveSeat: 'CTO (Technology & Infrastructure) + CDO (Data & Memory)',
    universalIS: ['Starlight Orchestrator', 'Code IS', 'Second Brain IS', 'Voice & Video IS'],
    councilLead: ['starlight-architect', 'starlight-orchestrator', 'starlight-sentinel'],
    primaryHarnesses: ['Claude Code', 'Antigravity', 'Codex', 'Grok', 'Hermes'],
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
    steward: 'steward-starlight',
    executiveSeat: 'CSO (Strategy & Protocol) + CAIO (AI & Swarm Governance)',
    universalIS: ['Starlight Orchestrator', 'Second Brain IS', 'Self IS'],
    councilLead: ['starlight-prime', 'starlight-sage', 'starlight-hermes'],
    primaryHarnesses: ['Claude Code', 'Antigravity', 'Codex', 'OpenCode'],
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
    steward: 'steward-arcanea',
    executiveSeat: 'CCO (Creative & Canon)',
    universalIS: ['Creator IS', 'Brand IS', 'Voice & Video IS'],
    councilLead: ['starlight-weaver', 'starlight-visionary', 'luminor-council'],
    primaryHarnesses: ['Antigravity', 'Claude Code', 'Codex', 'Grok'],
    repos: [
      { name: 'Arcanea', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'arcanea-ai-app', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'arcanea-studio', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'arcanea-ecosystem', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'arcanea-agent-skills', visibility: 'private', primaryOwner: 'frankxai' },
      { name: 'arcanea-onchain', visibility: 'public', primaryOwner: 'frankxai' },
      { name: 'arcanea-orchestrator', visibility: 'public', primaryOwner: 'Arcanea-Labs' },
      { name: 'AnimeLegends', visibility: 'private', primaryOwner: 'frankxai' }
    ]
  },
  {
    login: 'GenCreator-ai',
    displayName: 'GenCreator',
    website: 'https://gencreator.ai',
    brandId: 'gencreator',
    governanceMode: 'active',
    steward: 'steward-gencreator',
    executiveSeat: 'CMO (Growth & Creator Distribution) + CCO (Creative)',
    universalIS: ['Creator IS', 'Voice & Video IS', 'Brand IS', 'Sound / Music IS'],
    councilLead: ['starlight-envoy', 'starlight-music-ar', 'starlight-production'],
    primaryHarnesses: ['Claude Code', 'Antigravity', 'Codex', 'Hermes'],
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
    steward: 'steward-frankx',
    executiveSeat: 'CEO (Founder Office) + CMO (Editorial & Authority)',
    universalIS: ['Brand IS', 'Creator IS', 'Business IS', 'Code IS'],
    councilLead: ['starlight-prime', 'starlight-weaver', 'starlight-social-strategist'],
    primaryHarnesses: ['Claude Code', 'Codex', 'Antigravity', 'Grok'],
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
    steward: 'steward-enterprise',
    executiveSeat: 'CTO (Enterprise Architecture) + COO (Estate Operations)',
    universalIS: ['Business IS', 'Code IS', 'Starlight Orchestrator'],
    councilLead: ['starlight-architect', 'starlight-navigator', 'starlight-sentinel'],
    primaryHarnesses: ['Claude Code', 'Codex', 'Antigravity'],
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
    steward: 'steward-education',
    executiveSeat: 'CHRO (Talent & Learning CoE)',
    universalIS: ['People Intelligence Sub-Stack', 'Second Brain IS'],
    councilLead: ['starlight-training', 'starlight-culture', 'starlight-concierge'],
    primaryHarnesses: ['Claude Code', 'Codex', 'Antigravity'],
    repos: [
      { name: 'ai-architect-academy', visibility: 'private', primaryOwner: 'frankxai' },
      { name: 'starlight-intelligence-academy', visibility: 'private', primaryOwner: 'frankxai' }
    ]
  },
  {
    login: 'Agentic-Income',
    displayName: 'Agentic Income',
    website: 'https://agenticincome.ai',
    brandId: 'agentic-income',
    governanceMode: 'active',
    steward: 'steward-wealth',
    executiveSeat: 'CFO (Capital, Pricing & FinOps)',
    universalIS: ['Wealth IS', 'Business IS'],
    councilLead: ['starlight-business', 'starlight-navigator', 'starlight-sentinel'],
    primaryHarnesses: ['Claude Code', 'Codex', 'Hermes', 'Grok'],
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
    steward: 'steward-commons',
    executiveSeat: 'CSO (Impact, Longevity & Ethics Guardian)',
    universalIS: ['Health IS', 'Family IS', 'Self IS', 'Marine Intelligence'],
    councilLead: ['starlight-embodiment', 'starlight-relational', 'starlight-sage'],
    primaryHarnesses: ['Claude Code', 'Antigravity', 'Hermes'],
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
    steward: 'steward-enterprise (read-only)',
    executiveSeat: 'CTO (Archive & Reference)',
    universalIS: ['Code IS'],
    councilLead: ['starlight-sentinel'],
    primaryHarnesses: ['Read-Only (Reshape PR #1 Gate)'],
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
 * Guards Wave 4 subtree-fold proposals against:
 * 1. Folding a first-class federated organization repository (in ORG_FEDERATION_MANIFEST) into a monorepo.
 * 2. Folding a private repository (including Wave 3a/3b newly privatized repos) into a public destination.
 * @param {{ repo: string, sourceIsPrivate: boolean, destination: string, destinationIsPrivate: boolean }} candidate
 * @param {typeof ORG_FEDERATION_MANIFEST} [manifest]
 */
export function validateConsolidationWaveSafety(candidate, manifest = ORG_FEDERATION_MANIFEST) {
  if (!candidate || !candidate.repo || !candidate.destination) {
    return { ok: false, reason: 'candidate.repo and candidate.destination are required' };
  }
  const repoLower = String(candidate.repo).toLowerCase();
  for (const org of manifest) {
    const hit = org.repos.find((r) => r.name.toLowerCase() === repoLower);
    if (hit) {
      return {
        ok: false,
        reason: `FEDERATED_REPO_PROTECTED: '${candidate.repo}' is an active federated repository in '${org.login}/${hit.name}' and must not be subtree-folded into '${candidate.destination}'`
      };
    }
  }
  if (candidate.sourceIsPrivate && !candidate.destinationIsPrivate) {
    return {
      ok: false,
      reason: `WAVE4_VISIBILITY_VIOLATION: private repo '${candidate.repo}' cannot be subtree-folded into public destination '${candidate.destination}'`
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

const FULL_GIT_SHA = /^[a-f0-9]{40}$/i;
const SYNC_REFUSAL = 'MIRROR_SYNC_NOT_QUALIFIED: read-only mirrors have no reviewed sync writer; use --check-drift and retain current locks.';

function readRepositoryHead(fullName, readApi) {
  let repository;
  let branch;
  let commit;
  try {
    repository = readApi(`repos/${fullName}`);
    if (!Number.isSafeInteger(repository?.id) || repository.id <= 0
        || repository.full_name?.toLowerCase() !== fullName.toLowerCase()
        || typeof repository.default_branch !== 'string' || !repository.default_branch) {
      return { error: 'repository_identity_or_default_branch_unverified' };
    }
    branch = readApi(`repos/${fullName}/branches/${encodeURIComponent(repository.default_branch)}`);
    if (!FULL_GIT_SHA.test(branch?.commit?.sha || '')) {
      return { repositoryId: repository.id, error: 'default_head_unverified' };
    }
    const sha = branch.commit.sha.toLowerCase();
    // Resolve tree identity from the immutable commit, never a commit message.
    commit = readApi(`repos/${fullName}/git/commits/${sha}`);
    if (commit?.sha?.toLowerCase() !== sha || !FULL_GIT_SHA.test(commit?.tree?.sha || '')) {
      return { repositoryId: repository.id, sha, error: 'immutable_commit_unverified' };
    }
    return {
      repositoryId: repository.id,
      fullName: repository.full_name,
      defaultBranch: repository.default_branch,
      sha,
      tree: commit.tree.sha.toLowerCase(),
      observedAt: new Date().toISOString()
    };
  } catch {
    return { repositoryId: repository?.id ?? null, error: 'provider_read_failed' };
  }
}

/**
 * Reads actual default-head commit/tree evidence from both repositories.
 * Retains the historical export name, but refuses unqualified sync before effects.
 * Local checkouts are not a prerequisite for read-only provider observations.
 */
export function checkAndSyncMirrorShaParity(
  reposRoot = DEFAULT_REPOS_ROOT,
  { sync = false, hardenMirrors = false, manifest = ORG_FEDERATION_MANIFEST, readApi = ghApiJson } = {}
) {
  if (sync) throw new Error(SYNC_REFUSAL);
  const results = [];
  for (const org of manifest) {
    if (org.governanceMode === 'reshape-frozen') continue;
    for (const repo of org.repos) {
      if (repo.primaryOwner !== 'frankxai') {
        results.push({
          org: org.login, repo: repo.name, role: 'org-native',
          parityState: 'not_applicable', inSync: null, syncedNow: false
        });
        continue;
      }
      const hardenResult = hardenMirrors
        ? hardenReadOnlyMirrorOnGitHub(org.login, repo.name) : null;
      const source = readRepositoryHead(`${repo.primaryOwner}/${repo.name}`, readApi);
      const mirror = readRepositoryHead(`${org.login}/${repo.name}`, readApi);
      const inconsistentTree = !source.error && !mirror.error
        && source.sha === mirror.sha && source.tree !== mirror.tree;
      const error = source.error ? `source_${source.error}`
        : mirror.error ? `mirror_${mirror.error}`
          : inconsistentTree ? 'immutable_commit_tree_mismatch' : null;
      const known = error === null;
      const inSync = known ? source.sha === mirror.sha : null;
      results.push({
        org: org.login,
        repo: repo.name,
        role: 'federated-mirror',
        defaultBranch: source.defaultBranch ?? null,
        mirrorDefaultBranch: mirror.defaultBranch ?? null,
        sourceRepositoryId: source.repositoryId ?? null,
        mirrorRepositoryId: mirror.repositoryId ?? null,
        originSha: source.sha ?? null,
        orgSha: mirror.sha ?? null,
        originTree: source.tree ?? null,
        orgTree: mirror.tree ?? null,
        sourceObservedAt: source.observedAt ?? null,
        mirrorObservedAt: mirror.observedAt ?? null,
        observedAt: new Date().toISOString(),
        parityState: known ? (inSync ? 'aligned' : 'drift') : 'unknown',
        treeInSync: known ? source.tree === mirror.tree : null,
        inSync,
        syncedNow: false,
        ...(error ? { error } : {}),
        ...(hardenResult ? { hardenResult } : {})
      });
    }
  }
  return results;
}

export function buildOrgCodeownersContent(org) {
  const lines = [
    `# ${org.displayName} (${org.login}) — Organization Default CODEOWNERS`,
    `# Website: ${org.website}`,
    `# Brand ID: ${org.brandId} | Governance Mode: ${org.governanceMode}`,
    `# Steward Agent: ${org.steward || 'starlight-steward'}`,
    `# Executive Seat: ${org.executiveSeat || 'Chief Architecture & Ecosystem Officer (CAEO)'}`,
    `# Universal IS: ${org.universalIS || 'Starlight Orchestrator'}`,
    `# Council Lead: ${org.councilLead || 'Prime + Sentinel'}`,
    `# Primary Harnesses: ${(org.primaryHarnesses || ['claude-code', 'antigravity', 'codex']).join(', ')}`,
    '#',
    '# Human approval gate (Maker != Checker invariant):',
    '* @frankxai',
    '/.github/ @frankxai',
    '/AGENTS.md @frankxai',
    '/SECURITY.md @frankxai',
    ''
  ];
  return lines.join('\n');
}

export function buildOrgAgentsContractContent(org) {
  const repoRows = (org.repos || [])
    .map((r) => {
      const role =
        r.primaryOwner && r.primaryOwner.toLowerCase() === org.login.toLowerCase()
          ? 'org-primary (canonical)'
          : `federated-mirror (SSOT: ${r.primaryOwner}/${r.name})`;
      return `| \`${r.name}\` | \`${r.visibility}\` | \`${r.primaryOwner}\` | ${role} |`;
    })
    .join('\n');

  return [
    `# ${org.displayName} — Agent Operating Contract`,
    '',
    `Scope: All repositories under the **${org.login}** GitHub Organization (${org.website}).`,
    `Brand register: \`${org.brandId}\``,
    '',
    '## Responsible Agent Team & Governance',
    '',
    '| Role | Assigned Owner |',
    '| :--- | :--- |',
    `| **Human Codeowner** | \`@frankxai\` |`,
    `| **Organization Steward** | \`${org.steward || 'starlight-steward'}\` |`,
    `| **Executive Seat** | ${org.executiveSeat || 'Chief Architecture & Ecosystem Officer (CAEO)'} |`,
    `| **Universal IS** | ${org.universalIS || 'Starlight Orchestrator'} |`,
    `| **Council Lead** | ${org.councilLead || 'Prime + Sentinel'} |`,
    `| **Primary Harnesses** | ${(org.primaryHarnesses || ['claude-code', 'antigravity', 'codex']).map((h) => `\`${h}\``).join(', ')} |`,
    '',
    '## Core Guardrails',
    '',
    '1. **Think before coding.** State assumptions and surface tradeoffs. Verify file contents and branch state before writing.',
    '2. **Surgical changes.** Touch only the files required for the active slice. Never overwrite or reset another agent\'s uncommitted worktree.',
    '3. **Branch and worktree discipline.** Never push directly to `main`. Work on `agent/<harness>/<scope>` in a dedicated worktree and open a **draft** pull request first.',
    '4. **Maker != Checker.** The harness that authors a pull request never approves or merges its own pull request.',
    '5. **CI budget discipline.** Keep pull requests in draft until local verification (`lint`, `typecheck`, `test`, `build`) passes. Mark ready for review once.',
    '6. **Non-waivable safety.**',
    '   - Never commit secrets, API keys, or `.env` files.',
    '   - Preserve repository visibility parity: never copy or mirror private repository contents into a public repository.',
    '   - Money fails closed; no autonomous spend or paid API provisioning without explicit human approval.',
    '   - In health and mind domains, model observations only; never diagnose or make clinical claims.',
    '',
    `## Federated Repository Roster (${(org.repos || []).length} repositories)`,
    '',
    '| Repository | Visibility | Primary Owner | Role |',
    '| :--- | :--- | :--- | :--- |',
    repoRows,
    '',
    'Built on SIP',
    ''
  ].join('\n');
}

function upsertGithubRepoFile(repoFullName, filePath, contentUtf8, commitMessage) {
  let existingSha = null;
  let existingContent = null;
  try {
    const raw = execFileSync('gh', ['api', `repos/${repoFullName}/contents/${filePath}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 20000
    });
    const parsed = JSON.parse(raw);
    existingSha = parsed.sha || null;
    if (parsed.content) {
      existingContent = Buffer.from(parsed.content.replace(/\n/g, ''), 'base64').toString('utf8');
    }
  } catch {
    existingSha = null;
  }

  if (existingContent === contentUtf8) {
    return { updated: false, sha: existingSha, unchanged: true };
  }

  const b64 = Buffer.from(contentUtf8, 'utf8').toString('base64');
  const args = [
    'api',
    '-X',
    'PUT',
    `repos/${repoFullName}/contents/${filePath}`,
    '-f',
    `message=${commitMessage}`,
    '-f',
    `content=${b64}`
  ];
  if (existingSha) {
    args.push('-f', `sha=${existingSha}`);
  }
  const out = execFileSync('gh', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    timeout: 30000
  });
  const parsedOut = JSON.parse(out);
  return { updated: true, sha: parsedOut?.content?.sha || null, unchanged: false };
}

export function syncOrgGovernanceRepos(manifest = ORG_FEDERATION_MANIFEST, { dryRun = false } = {}) {
  const results = [];
  for (const org of manifest) {
    if (org.governanceMode === 'reshape-frozen') {
      results.push({ org: org.login, skipped: true, reason: 'reshape-frozen' });
      continue;
    }
    const govRepo = `${org.login}/.github`;
    const codeowners = buildOrgCodeownersContent(org);
    const agentsMd = buildOrgAgentsContractContent(org);
    if (dryRun) {
      results.push({
        org: org.login,
        repo: govRepo,
        dryRun: true,
        codeownersBytes: Buffer.byteLength(codeowners, 'utf8'),
        agentsMdBytes: Buffer.byteLength(agentsMd, 'utf8')
      });
      continue;
    }
    try {
      const coRes = upsertGithubRepoFile(
        govRepo,
        'CODEOWNERS',
        codeowners,
        `chore(governance): wire CODEOWNERS and steward team (${org.steward})`
      );
      const agRes = upsertGithubRepoFile(
        govRepo,
        'AGENTS.md',
        agentsMd,
        `docs(governance): wire Responsible Agent Team and federated roster in AGENTS.md`
      );
      results.push({
        org: org.login,
        repo: govRepo,
        steward: org.steward,
        codeownersUpdated: coRes.updated,
        agentsMdUpdated: agRes.updated,
        ok: true
      });
    } catch (err) {
      results.push({
        org: org.login,
        repo: govRepo,
        steward: org.steward,
        ok: false,
        error: err.message
      });
    }
  }
  return results;
}

export function writeOrgFederationHeartbeat(summary, heartbeatPath = DEFAULT_HEARTBEAT_PATH) {
  try {
    const parityChecked = summary.shaParityChecked === true;
    const expected = summary.expectedMirrorsCount;
    const parityComplete = parityChecked && Number.isSafeInteger(expected) && expected > 0
      && summary.checkedMirrorsCount === expected
      && summary.alignedMirrorsCount === expected
      && summary.driftedMirrorsCount === 0 && summary.unknownMirrorsCount === 0;
    fs.mkdirSync(path.dirname(heartbeatPath), { recursive: true });
    const payload = {
      ts: new Date().toISOString(),
      status: summary.allLocalAligned === true && parityComplete ? 'ok' : 'warn',
      totalOrganizations: summary.totalOrganizations,
      totalFederatedRepos: summary.totalFederatedRepos,
      localOrgRemotesAligned: summary.localOrgRemotesAligned,
      shaParityChecked: parityChecked,
      expectedMirrorsCount: summary.expectedMirrorsCount ?? null,
      checkedMirrorsCount: parityChecked ? summary.checkedMirrorsCount ?? null : null,
      alignedMirrorsCount: parityChecked ? summary.alignedMirrorsCount ?? null : null,
      driftedMirrorsCount: parityChecked ? summary.driftedMirrorsCount ?? null : null,
      unknownMirrorsCount: parityChecked ? summary.unknownMirrorsCount ?? null : null,
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
  const syncGovernance = args.includes('--sync-governance');
  const asJson = args.includes('--json');
  // Refuse before --wire-local, --harden-mirrors or governance can mutate anything.
  if (syncMirrors) {
    console.error(SYNC_REFUSAL);
    process.exitCode = 1;
    return;
  }
  const rootIdx = args.indexOf('--repos-root');
  const reposRoot = rootIdx !== -1 && args[rootIdx + 1] ? args[rootIdx + 1] : DEFAULT_REPOS_ROOT;

  const rows = auditOrWireLocalRemotes(reposRoot, { wire });
  const localPresent = rows.filter((r) => r.localFound);
  const aligned = localPresent.filter((r) => r.orgAligned);

  let parityRows = [];
  if (checkDrift || hardenMirrors) {
    parityRows = checkAndSyncMirrorShaParity(reposRoot, { sync: syncMirrors, hardenMirrors });
  }

  let governanceRows = [];
  if (syncGovernance) {
    governanceRows = syncOrgGovernanceRepos();
  }

  const mirrorRows = parityRows.filter((r) => r.role === 'federated-mirror');
  const alignedMirrors = mirrorRows.filter((r) => r.inSync === true);
  const driftedMirrors = mirrorRows.filter((r) => r.inSync === false);
  const unknownMirrors = mirrorRows.filter((r) => r.inSync === null);
  const parityChecked = checkDrift || hardenMirrors;
  const expectedMirrorsCount = ORG_FEDERATION_MANIFEST
    .filter((org) => org.governanceMode !== 'reshape-frozen')
    .reduce((count, org) => count + org.repos.filter((repo) => repo.primaryOwner === 'frankxai').length, 0);
  const closedBotPrsCount = parityRows.reduce((acc, r) => acc + (r.hardenResult?.closedBotPrs || 0), 0);

  const summary = {
    totalOrganizations: ORG_FEDERATION_MANIFEST.length,
    totalFederatedRepos: rows.length,
    localCheckoutsFound: localPresent.length,
    localOrgRemotesAligned: aligned.length,
    allLocalAligned: localPresent.length > 0 && aligned.length === localPresent.length,
    shaParityChecked: parityChecked,
    expectedMirrorsCount,
    checkedMirrorsCount: parityChecked ? alignedMirrors.length + driftedMirrors.length : null,
    alignedMirrorsCount: parityChecked ? alignedMirrors.length : null,
    driftedMirrorsCount: parityChecked ? driftedMirrors.length : null,
    unknownMirrorsCount: parityChecked ? unknownMirrors.length : null,
    syncedNowCount: parityRows.filter((r) => r.syncedNow).length,
    closedBotPrsCount,
    ...(syncGovernance ? { governanceSyncedCount: governanceRows.filter((r) => r.ok).length } : {})
  };

  writeOrgFederationHeartbeat(summary);
  if (parityChecked && (unknownMirrors.length > 0 || driftedMirrors.length > 0
      || mirrorRows.length !== expectedMirrorsCount)) process.exitCode = 1;

  if (asJson) {
    console.log(
      JSON.stringify(
        {
          summary,
          rows,
          ...(parityRows.length ? { parityRows } : {}),
          ...(governanceRows.length ? { governanceRows } : {})
        },
        null,
        2
      )
    );
  } else {
    console.log(`GitHub Organization Federation Audit (${summary.totalOrganizations} orgs, ${summary.totalFederatedRepos} mapped repos)`);
    console.log(`Local checkouts found: ${summary.localCheckoutsFound} | 'org' remotes aligned: ${summary.localOrgRemotesAligned}/${summary.localCheckoutsFound}`);
    if (summary.shaParityChecked) {
      console.log(`Mirror SHA Parity: ${summary.alignedMirrorsCount}/${summary.expectedMirrorsCount} aligned | Unknown: ${summary.unknownMirrorsCount} | Synced now: ${summary.syncedNowCount} | Closed duplicate bot PRs: ${summary.closedBotPrsCount}`);
      if (driftedMirrors.length > 0) {
        console.error('Drifted mirrors:', driftedMirrors);
      }
    }
    if (syncGovernance) {
      console.log(`Org Governance (.github CODEOWNERS + AGENTS.md): ${summary.governanceSyncedCount}/9 active orgs synced`);
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
