import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  ORG_FEDERATION_MANIFEST,
  validateVisibilityParity,
  validateConsolidationWaveSafety,
  validateOrgBasePermission,
  writeOrgFederationHeartbeat,
  checkAndSyncMirrorShaParity,
  auditOrWireLocalRemotes,
  buildOrgCodeownersContent,
  buildOrgAgentsContractContent,
  syncOrgGovernanceRepos
} from '../scripts/org-federation-audit.mjs';

const sourceSha = 'a'.repeat(40);
const mirrorSha = 'b'.repeat(40);
const sourceTree = 'c'.repeat(40);
const mirrorTree = 'd'.repeat(40);
const parityManifest = [{
  login: 'Mirror-Org', governanceMode: 'active',
  repos: [{ name: 'example', primaryOwner: 'frankxai', visibility: 'public' }]
}];

function parityReader({ mirrorCommit = mirrorSha, tree = mirrorTree, failEndpoint = null,
                        message = '', branch = 'main', calls = [] } = {}) {
  return (endpoint) => {
    calls.push(endpoint);
    if (endpoint === failEndpoint) throw new Error('synthetic read failure');
    if (endpoint === 'repos/frankxai/example') {
      return { id: 101, full_name: 'frankxai/example', default_branch: branch };
    }
    if (endpoint === 'repos/Mirror-Org/example') {
      return { id: 202, full_name: 'Mirror-Org/example', default_branch: branch };
    }
    if (endpoint === `repos/frankxai/example/branches/${encodeURIComponent(branch)}`) {
      return { commit: { sha: sourceSha } };
    }
    if (endpoint === `repos/Mirror-Org/example/branches/${encodeURIComponent(branch)}`) {
      return { commit: { sha: mirrorCommit, commit: { message } } };
    }
    if (endpoint === `repos/frankxai/example/git/commits/${sourceSha}`) {
      return { sha: sourceSha, tree: { sha: sourceTree } };
    }
    if (endpoint === `repos/Mirror-Org/example/git/commits/${mirrorCommit}`) {
      return { sha: mirrorCommit, tree: { sha: tree } };
    }
    throw new Error(`Unexpected synthetic endpoint: ${endpoint}`);
  };
}

function inspectParity(options = {}) {
  return checkAndSyncMirrorShaParity('/missing/local/checkout', {
    manifest: parityManifest, readApi: parityReader(options)
  })[0];
}

test('a mirror commit message cannot attest SHA or tree parity', () => {
  const row = inspectParity({ message: `sync frankxai/example@${sourceSha.slice(0, 12)}` });
  assert.equal(row.inSync, false);
  assert.equal(row.treeInSync, false);
  assert.equal(row.parityState, 'drift');
  assert.equal(row.originSha, sourceSha);
  assert.equal(row.orgSha, mirrorSha);
  assert.equal(row.originTree, sourceTree);
  assert.equal(row.orgTree, mirrorTree);
  assert.equal(row.sourceRepositoryId, 101);
  assert.equal(row.mirrorRepositoryId, 202);
});

test('equal trees with different commits remain SHA drift', () => {
  const row = inspectParity({ tree: sourceTree });
  assert.equal(row.treeInSync, true);
  assert.equal(row.inSync, false);
  assert.equal(row.parityState, 'drift');
});

test('parity requires full immutable commit and tree observations', () => {
  const calls = [];
  const row = inspectParity({ mirrorCommit: sourceSha, tree: sourceTree,
                              branch: 'release/current', calls });
  assert.equal(row.inSync, true);
  assert.equal(row.parityState, 'aligned');
  assert.equal(row.defaultBranch, 'release/current');
  assert.ok(calls.includes(`repos/frankxai/example/git/commits/${sourceSha}`));
  assert.ok(calls.includes(`repos/Mirror-Org/example/git/commits/${sourceSha}`));
  assert.ok(Number.isFinite(Date.parse(row.observedAt)));
});

test('missing source or immutable read failure remains unknown', () => {
  for (const failEndpoint of [
    'repos/frankxai/example',
    `repos/frankxai/example/git/commits/${sourceSha}`,
    `repos/Mirror-Org/example/git/commits/${mirrorSha}`
  ]) {
    const row = inspectParity({ failEndpoint });
    assert.equal(row.inSync, null);
    assert.equal(row.parityState, 'unknown');
    assert.ok(row.error);
    assert.equal(row.syncedNow, false);
  }
});

test('malformed or inconsistent immutable evidence never attests parity', () => {
  for (const tree of ['c'.repeat(12), null, mirrorTree]) {
    const row = inspectParity({ mirrorCommit: sourceSha, tree });
    assert.equal(row.inSync, null);
    assert.equal(row.parityState, 'unknown');
  }
});

test('unqualified sync refuses before reads, hardening, push or success claims', () => {
  let calls = 0;
  assert.throws(() => checkAndSyncMirrorShaParity('/missing/local/checkout', {
    manifest: parityManifest, sync: true, hardenMirrors: true,
    readApi: () => { calls++; return { push: 'success' }; }
  }), /MIRROR_SYNC_NOT_QUALIFIED/);
  assert.equal(calls, 0);
});

test('CLI sync refusal precedes local wiring, governance, hardening and heartbeat effects', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sis-org-sync-refusal-'));
  try {
    const script = fileURLToPath(new URL('../scripts/org-federation-audit.mjs', import.meta.url));
    const result = spawnSync(process.execPath, [script, '--sync-mirrors', '--wire-local',
      '--harden-mirrors', '--sync-governance', '--repos-root', tmpDir], {
      cwd: tmpDir, encoding: 'utf8', timeout: 5000
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /MIRROR_SYNC_NOT_QUALIFIED/);
    assert.equal(result.stdout, '');
    assert.deepEqual(fs.readdirSync(tmpDir), []);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('wrong provider identity cannot admit parity even when all hashes match', () => {
  const readApi = parityReader({ mirrorCommit: sourceSha, tree: sourceTree });
  const row = checkAndSyncMirrorShaParity('/missing/local/checkout', {
    manifest: parityManifest,
    readApi: (endpoint) => endpoint === 'repos/frankxai/example'
      ? { id: 101, full_name: 'someone-else/example', default_branch: 'main' }
      : readApi(endpoint)
  })[0];
  assert.equal(row.parityState, 'unknown');
  assert.equal(row.inSync, null);
});

test('org-native repositories are not fabricated mirror successes', () => {
  const rows = checkAndSyncMirrorShaParity('/missing/local/checkout', {
    manifest: [{ login: 'Mirror-Org', governanceMode: 'active', repos: [
      { name: 'native', primaryOwner: 'Mirror-Org' }
    ] }],
    readApi: () => { throw new Error('No provider read expected for non-mirror'); }
  });
  assert.equal(rows[0].role, 'org-native');
  assert.equal(rows[0].parityState, 'not_applicable');
  assert.equal(rows[0].inSync, null);
});

test('unobserved or incomplete parity never produces a healthy heartbeat', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sis-org-hb-unknown-'));
  try {
    for (const summary of [
      { allLocalAligned: true },
      { allLocalAligned: true, shaParityChecked: false, driftedMirrorsCount: 0 },
      { allLocalAligned: true, shaParityChecked: true, expectedMirrorsCount: 2,
        checkedMirrorsCount: 1, alignedMirrorsCount: 1, driftedMirrorsCount: 0,
        unknownMirrorsCount: 1 },
      { allLocalAligned: true, shaParityChecked: true, expectedMirrorsCount: 0,
        checkedMirrorsCount: 0, alignedMirrorsCount: 0, driftedMirrorsCount: 0,
        unknownMirrorsCount: 0 },
      { allLocalAligned: true, shaParityChecked: true, expectedMirrorsCount: 2,
        checkedMirrorsCount: 2, alignedMirrorsCount: 1, driftedMirrorsCount: 1,
        unknownMirrorsCount: 0 },
      { allLocalAligned: false, shaParityChecked: true, expectedMirrorsCount: 1,
        checkedMirrorsCount: 1, alignedMirrorsCount: 1, driftedMirrorsCount: 0,
        unknownMirrorsCount: 0 }
    ]) {
      const written = writeOrgFederationHeartbeat(summary, path.join(tmpDir, 'heartbeat.json'));
      assert.equal(written.status, 'warn');
      if (summary.shaParityChecked !== true) {
        assert.equal(written.driftedMirrorsCount, null);
      }
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('ORG_FEDERATION_MANIFEST covers all 10 GitHub Organizations with valid metadata and responsible agent teams', () => {
  assert.equal(ORG_FEDERATION_MANIFEST.length, 10);
  const expectedLogins = [
    'Starlight-Intelligence',
    'Starlight-Intelligence-Systems',
    'Arcanea-Labs',
    'GenCreator-ai',
    'FrankX-AI',
    'AI-Architect-Studio',
    'AI-Architect-Academy',
    'Agentic-Income',
    'Life-Commons',
    'oci-ai-architects'
  ];
  assert.deepEqual(
    ORG_FEDERATION_MANIFEST.map((o) => o.login),
    expectedLogins
  );

  for (const org of ORG_FEDERATION_MANIFEST) {
    assert.ok(org.displayName.length > 0, `${org.login} missing displayName`);
    assert.match(org.website, /^https:\/\//, `${org.login} invalid website`);
    assert.ok(org.steward && org.steward.length > 0, `${org.login} missing steward`);
    assert.ok(org.executiveSeat && org.executiveSeat.length > 0, `${org.login} missing executiveSeat`);
    assert.ok(org.universalIS && org.universalIS.length > 0, `${org.login} missing universalIS`);
    assert.ok(org.councilLead && org.councilLead.length > 0, `${org.login} missing councilLead`);
    assert.ok(Array.isArray(org.primaryHarnesses) && org.primaryHarnesses.length > 0, `${org.login} missing primaryHarnesses`);
    assert.ok(Array.isArray(org.repos) && org.repos.length > 0, `${org.login} has no mapped repos`);
    const seen = new Set();
    for (const r of org.repos) {
      assert.ok(!seen.has(r.name.toLowerCase()), `duplicate repo ${r.name} in ${org.login}`);
      seen.add(r.name.toLowerCase());
      assert.ok(r.visibility === 'public' || r.visibility === 'private');
    }
  }
});

test('buildOrgCodeownersContent and buildOrgAgentsContractContent produce deterministic governance artifacts', () => {
  const sisOrg = ORG_FEDERATION_MANIFEST[0];
  const codeowners = buildOrgCodeownersContent(sisOrg);
  assert.match(codeowners, /\* @frankxai/);
  assert.match(codeowners, /starlight-architect/);

  const agentsMd = buildOrgAgentsContractContent(sisOrg);
  assert.match(agentsMd, /Responsible Agent Team & Governance/);
  assert.match(agentsMd, /starlight-architect/);
  assert.match(agentsMd, /Built on SIP/);

  const dryRun = syncOrgGovernanceRepos(ORG_FEDERATION_MANIFEST, { dryRun: true });
  assert.equal(dryRun.length, 10);
  assert.equal(dryRun.filter((r) => r.dryRun).length, 9);
  assert.equal(dryRun.filter((r) => r.skipped && r.reason === 'reshape-frozen').length, 1);
});

test('validateVisibilityParity enforces strict public/private visibility rules', () => {
  assert.deepEqual(validateVisibilityParity({ isPrivate: true }, { isPrivate: true }), { ok: true });
  assert.deepEqual(validateVisibilityParity({ isPrivate: false }, { isPrivate: false }), { ok: true });
  assert.deepEqual(validateVisibilityParity({ isPrivate: false }, { isPrivate: true }), { ok: true });

  const violation = validateVisibilityParity({ isPrivate: true }, { isPrivate: false });
  assert.equal(violation.ok, false);
  assert.match(violation.reason, /VISIBILITY_VIOLATION/);
});

test('validateConsolidationWaveSafety refuses folding active federated org repos or Wave 3 privatized repos into public destinations', () => {
  // 1. Active federated repositories must not be subtree-folded
  for (const protectedRepo of [
    'starlight-voice',
    'starlight-cosmos-engine',
    'arcanea-studio',
    'arcanea-ecosystem',
    'arcanea-onchain'
  ]) {
    const res = validateConsolidationWaveSafety({
      repo: protectedRepo,
      sourceIsPrivate: false,
      destination: 'arcanea-ai-app',
      destinationIsPrivate: false
    });
    assert.equal(res.ok, false);
    assert.match(res.reason, /FEDERATED_REPO_PROTECTED/);
  }

  // 2. Wave 3a/3b privatized repositories must not be folded into public destinations
  const gravityViolation = validateConsolidationWaveSafety({
    repo: 'starlight-gravity-engine',
    sourceIsPrivate: true,
    destination: 'Starlight-Intelligence-System',
    destinationIsPrivate: false
  });
  assert.equal(gravityViolation.ok, false);
  assert.match(gravityViolation.reason, /WAVE4_VISIBILITY_VIOLATION/);

  const researchViolation = validateConsolidationWaveSafety({
    repo: 'arcanea-ai-research',
    sourceIsPrivate: true,
    destination: 'arcanea-ai-app',
    destinationIsPrivate: false
  });
  assert.equal(researchViolation.ok, false);
  assert.match(researchViolation.reason, /WAVE4_VISIBILITY_VIOLATION/);

  // 3. Safe non-federated public-to-public fold passes
  const safeFold = validateConsolidationWaveSafety({
    repo: 'arcanea-dashboard-template',
    sourceIsPrivate: false,
    destination: 'arcanea-ai-app',
    destinationIsPrivate: false
  });
  assert.deepEqual(safeFold, { ok: true });
});

test('validateOrgBasePermission rejects default_repository_permission other than none', () => {
  assert.deepEqual(validateOrgBasePermission({ default_repository_permission: 'none' }), { ok: true });
  const bad = validateOrgBasePermission({ default_repository_permission: 'read' });
  assert.equal(bad.ok, false);
  assert.match(bad.reason, /BASE_PERMISSION_VIOLATION/);
});

test('writeOrgFederationHeartbeat writes two-signal heartbeat JSON', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sis-org-hb-'));
  try {
    const hbPath = path.join(tmpDir, 'heartbeat-task-org-federation.json');
    const written = writeOrgFederationHeartbeat(
      {
        allLocalAligned: true,
        driftedMirrorsCount: 0,
        totalOrganizations: 10,
        totalFederatedRepos: 83,
        localOrgRemotesAligned: 69,
        shaParityChecked: true,
        expectedMirrorsCount: 65,
        checkedMirrorsCount: 65,
        alignedMirrorsCount: 65,
        unknownMirrorsCount: 0,
        closedBotPrsCount: 28
      },
      hbPath
    );
    assert.equal(written.status, 'ok');
    assert.equal(written.alignedMirrorsCount, 65);
    assert.equal(written.closedBotPrsCount, 28);
    assert.equal(written.attestation, 'Built on SIP');
    assert.ok(fs.existsSync(hbPath));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('auditOrWireLocalRemotes detects missing org remote and wires it idempotently', () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'sis-org-fed-test-'));
  try {
    const repoDir = path.join(tmpRoot, 'starlight-voice');
    fs.mkdirSync(repoDir, { recursive: true });
    execFileSync('git', ['init', repoDir], { stdio: 'ignore' });
    execFileSync('git', ['-C', repoDir, 'remote', 'add', 'origin', 'https://github.com/frankxai/starlight-voice.git'], {
      stdio: 'ignore'
    });

    const miniManifest = [
      {
        login: 'Starlight-Intelligence',
        displayName: 'Starlight Intelligence',
        website: 'https://starlightintelligence.ai',
        brandId: 'sis',
        governanceMode: 'active',
        repos: [{ name: 'starlight-voice', visibility: 'public', primaryOwner: 'frankxai' }]
      }
    ];

    const before = auditOrWireLocalRemotes(tmpRoot, { wire: false, manifest: miniManifest });
    assert.equal(before.length, 1);
    assert.equal(before[0].localFound, true);
    assert.equal(before[0].orgAligned, false);

    const after = auditOrWireLocalRemotes(tmpRoot, { wire: true, manifest: miniManifest });
    assert.equal(after[0].orgAligned, true);
    assert.equal(after[0].orgUrl, 'https://github.com/Starlight-Intelligence/starlight-voice.git');
    assert.equal(after[0].originUrl, 'https://github.com/frankxai/starlight-voice.git');
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});
