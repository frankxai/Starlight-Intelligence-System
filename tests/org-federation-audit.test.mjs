import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

import {
  ORG_FEDERATION_MANIFEST,
  validateVisibilityParity,
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
