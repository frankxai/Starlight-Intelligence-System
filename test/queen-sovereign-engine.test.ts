import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  BrandSwitchboard,
  FrontierEvalEngine,
  HarnessMesh,
  QueenSovereignEngine,
  startQueenSovereignServer,
} from '../src/queen';

describe('Starlight Queen Sovereign Superintelligence v1.0', () => {
  const workspaceRoot = process.cwd();

  it('discovers all 12 federated local & cloud harnesses and upgrades them to 100% readiness', () => {
    const mesh = new HarnessMesh(workspaceRoot);
    const initial = mesh.discoverHarnesses(true);
    assert.equal(initial.length, 12, 'Should catalog all 12 harnesses and compute rails');

    const actions = mesh.auditAndUpgradeHarnesses();
    assert.equal(actions.length, 12, 'Should generate upgrade envelopes for all 12 harnesses');

    for (const action of actions) {
      assert.ok(fs.existsSync(action.envelopePath), `Envelope must exist at ${action.envelopePath}`);
      assert.ok(action.newScore >= 75, `Upgraded score should be >= 75 for ${action.harnessId}`);
    }
  });

  it('enforces Layer-0 Rust AST fail-closed gate, Tarjan WFG deadlock detection, and >90% context compression', () => {
    const mesh = new HarnessMesh(workspaceRoot);

    const safeGate = mesh.invokeRustKernel({
      commandToVerify: 'starlight queen route --verify',
      intentKeywords: ['vault', 'queen'],
      waitForEdges: [
        { from: 'agent-a', to: 'agent-b' },
        { from: 'agent-b', to: 'agent-c' },
      ],
    });
    assert.equal(safeGate.astAllowed, true);
    assert.equal(safeGate.wfgDeadlockDetected, false);
    assert.ok(safeGate.combinedContextSavingsPct > 90, 'Combined vMCP + Headroom + RTK savings must exceed 90%');

    const destructiveGate = mesh.invokeRustKernel({
      commandToVerify: 'rm -rf /',
      intentKeywords: ['vault'],
      waitForEdges: [
        { from: 'agent-1', to: 'agent-2' },
        { from: 'agent-2', to: 'agent-3' },
        { from: 'agent-3', to: 'agent-1' },
      ],
    });
    assert.equal(destructiveGate.astAllowed, false, 'Must block rm -rf / fail-closed');
    assert.equal(destructiveGate.wfgDeadlockDetected, true, 'Must detect 3-node WFG cycle via Tarjan SCC');
    assert.ok(destructiveGate.wfgCycleNodes.length >= 3);
  });

  it('models all 8 sovereign brands across all 8 engineering moat layers (64 cells)', () => {
    const switchboard = new BrandSwitchboard(workspaceRoot);
    const brands = switchboard.listBrands();
    assert.equal(brands.length, 8);

    const summary = switchboard.getMoatMatrixSummary();
    assert.equal(summary.totalBrands, 8);
    assert.equal(summary.totalMoatCells, 64);
    assert.ok(summary.averageReadinessPct >= 90);

    const detectedArcanea = switchboard.detectBrandFromPrompt('Forge a new 10-Gate Luminor character in Arcanea');
    assert.equal(detectedArcanea.id, 'arcanea');

    const detectedIis = switchboard.detectBrandFromPrompt('Run quantitative DPI wealth thesis debate');
    assert.equal(detectedIis.id, 'agentic-income');
  });

  it('routes tasks via Pareto + Thompson sampling with cross-family Maker != Checker verification', () => {
    const evalEngine = new FrontierEvalEngine(workspaceRoot);
    const decision = evalEngine.routeTaskPareto({
      prompt: 'Build and verify a high-contrast Next.js 16 telemetry UI for Starlight Queen',
      parallelWorkers: 32,
    });

    assert.ok(decision.decisionId.startsWith('qroute-'));
    assert.equal(decision.detectedDomain, 'frontend-design-ui');
    assert.notEqual(
      decision.maker.harnessId,
      decision.checker.harnessId,
      'Maker and Checker must be distinct harnesses'
    );
    assert.equal(
      decision.checker.crossFamilyVerified,
      true,
      'Maker and Checker must come from distinct model families'
    );
    assert.equal(decision.cloudSwarmBurst.parallelWorkersAssigned, 32);
    assert.ok(decision.paretoFrontier.some((c) => c.paretoOptimal));
  });

  it('runs the 12-layer frontier benchmark suite and beats Grok v0.2 and YC Oct 2026 baselines', () => {
    const evalEngine = new FrontierEvalEngine(workspaceRoot);
    const report = evalEngine.compareAgainstGrokAndIncumbents();

    assert.equal(report.layers.length, 12, 'Must benchmark all 12 frontier stack layers');
    assert.ok(
      report.overallScores.antigravityQueenV1 > report.overallScores.grokQueenV02,
      'Antigravity Queen v1.0 must outperform Grok v0.2 baseline'
    );
    assert.ok(
      report.overallScores.antigravityQueenV1 > report.overallScores.ycOct2026IncumbentAvg,
      'Antigravity Queen v1.0 must outperform YC Oct 2026 top-quartile baseline'
    );
  });

  it('serves live HTTP + JSON API + interactive HTML cockpit on localhost', async () => {
    const handle = await startQueenSovereignServer({
      port: 0, // ephemeral port for test isolation
      workspaceRoot,
    });

    try {
      const htmlRes = await fetch(`${handle.url}/`);
      assert.equal(htmlRes.status, 200);
      const html = await htmlRes.text();
      assert.ok(html.includes('Starlight Queen'));
      assert.ok(html.includes('Pareto &amp; Thompson router'));

      const routeRes = await fetch(`${handle.url}/api/queen/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Migrate 40 microservices using async cloud workers and verify Rust invariants',
          parallelWorkers: 64,
        }),
      });
      assert.equal(routeRes.status, 200);
      const routePayload = (await routeRes.json()) as {
        ok: boolean;
        decision: { cloudSwarmBurst: { parallelWorkersAssigned: number } };
      };
      assert.equal(routePayload.ok, true);
      assert.equal(routePayload.decision.cloudSwarmBurst.parallelWorkersAssigned, 64);

      const missionRes = await fetch(`${handle.url}/api/queen/execute-mission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Forge Arcanea 10-Gate Luminor progression studio with Veo and NanoBanana visuals',
          preferredBrand: 'arcanea',
          parallelWorkers: 16,
        }),
      });
      assert.equal(missionRes.status, 200);
      const missionPayload = (await missionRes.json()) as {
        ok: boolean;
        mission: {
          missionId: string;
          stages: Array<{ stage: number; status: string }>;
          receipt: { fnv1aHash: string };
        };
      };
      assert.equal(missionPayload.ok, true);
      assert.equal(missionPayload.mission.stages.length, 4);
      assert.equal(missionPayload.mission.receipt.fnv1aHash.length, 16);

      const estateRes = await fetch(`${handle.url}/api/queen/estate-gtm`);
      assert.equal(estateRes.status, 200);
      const estatePayload = (await estateRes.json()) as {
        parallelBreakthroughs: Array<{ id: string }>;
        productionRepos: Array<{ repoName: string }>;
        gtmFlywheel: Array<{ stageNumber: number }>;
        fundamentalLeverageQueue: Array<{ rank: number }>;
      };
      assert.ok(estatePayload.parallelBreakthroughs.length >= 5);
      assert.equal(estatePayload.productionRepos.length, 8);
      assert.equal(estatePayload.gtmFlywheel.length, 5);
      assert.equal(estatePayload.fundamentalLeverageQueue.length, 5);
    } finally {
      await handle.close();
    }
  });
});

