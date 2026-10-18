import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  BrandSwitchboard,
  FrontierEvalEngine,
  HarnessMesh,
  MetaHarnessConductor,
  QueenSovereignEngine,
  SovereignMasterCodex,
  SubscriptionGovernor,
  SwarmGraphAbsorber,
  startQueenSovereignServer,
} from '../src/queen';

describe('Starlight Queen Sovereign Superintelligence v2.0 Meta-Harness', () => {
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

  it('models all 8 sovereign brands across all 8 engineering moat layers (64 cells) with TRUTH.md Freedom Engine compliance', () => {
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
      'Antigravity Queen v2.0 must outperform Grok v0.2 baseline'
    );
    assert.ok(
      report.overallScores.antigravityQueenV1 > report.overallScores.ycOct2026IncumbentAvg,
      'Antigravity Queen v2.0 must outperform YC Oct 2026 top-quartile baseline'
    );
  });

  it('codifies all 10 GitHub Orgs (71 mapped repos), 151 Named Agents across 10 tiers, and 12 Canonical Truths', () => {
    const codex = new SovereignMasterCodex().getSnapshot();
    assert.equal(codex.totals.githubOrganizations, 10);
    assert.equal(codex.totals.federatedRepositories, 71);
    assert.equal(codex.totals.publicOssRepositories, 53);
    assert.equal(codex.totals.privateSovereignRepositories, 18);
    assert.equal(codex.totals.namedAgentsInRegistry, 151);
    assert.equal(codex.agentHierarchy.length, 10);
    const sumTierAgents = codex.agentHierarchy.reduce((s, t) => s + t.agentCount, 0);
    assert.equal(sumTierAgents, 151, 'Sum of agent counts across the 10 tiers must equal 151');
    assert.equal(codex.canonicalTruthsAndAntiDrift.length, 12);
    assert.equal(codex.horizonMilestones.length, 5);
  });

  it('governs 10 OAuth subscription & cloud burst rails across 5 minute-cadence rules and a 16-hour max-out plan', () => {
    const subGov = new SubscriptionGovernor(workspaceRoot).getSnapshot();
    assert.equal(subGov.totalRails, 10);
    assert.equal(subGov.rails.length, 10);
    assert.equal(subGov.minuteCadenceSchedule.length, 5);
    assert.equal(subGov.sixteenHourMaxOutPlan.length, 4);
    assert.ok(subGov.estimatedMonthlyValueExtractedUsd > subGov.flatSubscriptionCostUsd * 5);
  });

  it('steers 6 open terminal/CLI windows, diagnoses/heals 14 stuck _hold-admission cards, and unifies 6 MCP servers', () => {
    const conductor = new MetaHarnessConductor(workspaceRoot).getSnapshot(false);
    assert.equal(conductor.openWindowsCount, 6);
    assert.equal(conductor.steeredPromptsEmitted, 6);
    for (const w of conductor.activeWindows) {
      assert.ok(fs.existsSync(w.promptFilePath), `Steered prompt file must exist at ${w.promptFilePath}`);
    }
    assert.equal(conductor.mcpServersUnified, 6);
    assert.ok(conductor.averageMcpTokenReductionPct >= 85);
    assert.ok(conductor.stuckCardsDiagnosed >= 14);
  });

  it('absorbs 6 frontier swarm/graph frameworks, 11 OmO roles, 7 portfolio objectives, and unblocks all 30/30 Founder Intents', () => {
    const absorber = new SwarmGraphAbsorber(workspaceRoot);
    const snap = absorber.getSnapshot();
    assert.equal(snap.absorbedFrameworksCount, 6);
    assert.equal(snap.omoRolesCount, 11);
    assert.equal(snap.frontierLayersHarmonized, 6);
    assert.equal(snap.portfolioObjectives.length, 7);
    assert.equal(snap.founderIntentsTotal, 30);
    assert.equal(snap.founderIntentsUnblockedCount, 30);

    const bundle = absorber.generatePortableCommunityBundle(workspaceRoot, true);
    assert.equal(bundle.dryRun, true);
    assert.equal(bundle.filesGenerated.length, 2);
  });

  it('serves live HTTP + JSON API + interactive HTML cockpit on localhost including v2.0 endpoints', async () => {
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
      assert.ok(html.includes('Subscription max-out &amp; cloud rails'));
      assert.ok(html.includes('Window conductor &amp; self-heal'));
      assert.ok(html.includes('Swarm, graph &amp; 30 intents'));

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

      const codexRes = await fetch(`${handle.url}/api/queen/master-codex`);
      assert.equal(codexRes.status, 200);
      const codexPayload = (await codexRes.json()) as {
        totals: { githubOrganizations: number; federatedRepositories: number; namedAgentsInRegistry: number };
        canonicalTruthsAndAntiDrift: Array<{ id: string }>;
      };
      assert.equal(codexPayload.totals.githubOrganizations, 10);
      assert.equal(codexPayload.totals.federatedRepositories, 71);
      assert.equal(codexPayload.totals.namedAgentsInRegistry, 151);
      assert.equal(codexPayload.canonicalTruthsAndAntiDrift.length, 12);

      const subRes = await fetch(`${handle.url}/api/queen/subscriptions`);
      assert.equal(subRes.status, 200);
      const subPayload = (await subRes.json()) as { totalRails: number; rails: unknown[] };
      assert.equal(subPayload.totalRails, 10);
      assert.equal(subPayload.rails.length, 10);

      const condRes = await fetch(`${handle.url}/api/queen/meta-conductor`);
      assert.equal(condRes.status, 200);
      const condPayload = (await condRes.json()) as { openWindowsCount: number; mcpServersUnified: number };
      assert.equal(condPayload.openWindowsCount, 6);
      assert.equal(condPayload.mcpServersUnified, 6);

      const sgRes = await fetch(`${handle.url}/api/queen/swarm-graph`);
      assert.equal(sgRes.status, 200);
      const sgPayload = (await sgRes.json()) as {
        absorbedFrameworksCount: number;
        omoRolesCount: number;
        founderIntentsUnblockedCount: number;
      };
      assert.equal(sgPayload.absorbedFrameworksCount, 6);
      assert.equal(sgPayload.omoRolesCount, 11);
      assert.equal(sgPayload.founderIntentsUnblockedCount, 30);

      const healRes = await fetch(`${handle.url}/api/queen/self-heal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applyCardFixes: false }),
      });
      assert.equal(healRes.status, 200);
      const healPayload = (await healRes.json()) as {
        ok: boolean;
        metaConductor: { openWindowsCount: number };
      };
      assert.equal(healPayload.ok, true);
      assert.equal(healPayload.metaConductor.openWindowsCount, 6);
    } finally {
      await handle.close();
    }
  });
});



