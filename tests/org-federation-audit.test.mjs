import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

import {
  ORG_FEDERATION_MANIFEST,
  validateVisibilityParity,
  validateConsolidationWaveSafety,
  validateOrgBasePermission,
  writeOrgFederationHeartbeat,
  auditOrWireLocalRemotes
} from '../scripts/org-federation-audit.mjs';

test('ORG_FEDERATION_MANIFEST covers all 10 GitHub Organizations with valid metadata', () => {
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
    assert.ok(Array.isArray(org.repos) && org.repos.length > 0, `${org.login} has no mapped repos`);
    const seen = new Set();
    for (const r of org.repos) {
      assert.ok(!seen.has(r.name.toLowerCase()), `duplicate repo ${r.name} in ${org.login}`);
      seen.add(r.name.toLowerCase());
      assert.ok(r.visibility === 'public' || r.visibility === 'private');
    }
  }
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
        alignedMirrorsCount: 65,
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
