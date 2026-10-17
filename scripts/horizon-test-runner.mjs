#!/usr/bin/env node
/**
 * Starlight Intelligence System — Horizon Cadence Test & Automation Runner (2h / 12h / 1w)
 *
 * Executes and records empirical context, memory, multi-agent coordination, and
 * 10-organization GitHub federation health across three operational horizons:
 *   - 2h  (Tactical Pulse): Gateway heal, Sovereign Memory sync, Eval-50 benchmark, lane/lease hygiene
 *   - 12h (Operational Sweep): Dreaming consolidation, 90-day temporal decay sweep, 10-org remote drift audit
 *   - 1w  (Strategic Reckoning): Full Palace synthesis, scheduled task health audit, weekly scorecard report
 *
 * Usage:
 *   node scripts/horizon-test-runner.mjs --horizon 2h|12h|1w|all
 *
 * Attestation: Built on SIP — Autonomic & Memory Tier
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn, execSync } from 'node:child_process';
import { compileSovereignMemory } from './compile-sovereign-memory.mjs';
import { ORG_FEDERATION_MANIFEST, auditOrWireLocalRemotes } from './org-federation-audit.mjs';
import { collectUnifiedEcosystemTelemetry, ingestCloudReceipts } from './cloud-bridge-sync.mjs';

const HOME = os.homedir();
const DOT_STARLIGHT = path.join(HOME, '.starlight');
const TELEMETRY_DIR = path.join(DOT_STARLIGHT, 'telemetry');
const REPORTS_DIR = path.join(DOT_STARLIGHT, 'reports');
const SIS_MAIN_ROOT = 'C:/Users/frank/starlight/repos/Starlight-Intelligence-System';
const DEFAULT_WT_ROOT = path.resolve(import.meta.dirname, '..');

function isProcessAlive(pid) {
  if (!pid || typeof pid !== 'number') return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensures the SIS Memory Gateway daemon (`127.0.0.1:5200`) is alive and responsive,
 * cleaning up any stale `gateway-spawn.lock` left behind by a terminated PID.
 */
export async function ensureGatewayDaemon() {
  const gwJsonPath = path.join(DOT_STARLIGHT, 'gateway.json');
  const gwTokenPath = path.join(DOT_STARLIGHT, 'gateway.token');
  const lockPath = path.join(DOT_STARLIGHT, 'gateway-spawn.lock');

  const checkHealth = async () => {
    if (!fs.existsSync(gwJsonPath) || !fs.existsSync(gwTokenPath)) return null;
    try {
      const info = JSON.parse(fs.readFileSync(gwJsonPath, 'utf8'));
      const token = fs.readFileSync(gwTokenPath, 'utf8').trim();
      const res = await fetch(`http://${info.host || '127.0.0.1'}:${info.port || 5200}/v1/memory/health`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        const body = await res.json();
        return { alive: true, port: info.port, pid: info.pid, status: body.status || 'ok' };
      }
    } catch {
      // unreachable
    }
    return null;
  };

  const initial = await checkHealth();
  if (initial) return { ...initial, healed: false };

  // Check if stale lock exists for a dead PID
  if (fs.existsSync(gwJsonPath)) {
    try {
      const info = JSON.parse(fs.readFileSync(gwJsonPath, 'utf8'));
      if (!isProcessAlive(info.pid) && fs.existsSync(lockPath)) {
        fs.rmSync(lockPath, { recursive: true, force: true });
      }
    } catch {
      if (fs.existsSync(lockPath)) fs.rmSync(lockPath, { recursive: true, force: true });
    }
  } else if (fs.existsSync(lockPath)) {
    fs.rmSync(lockPath, { recursive: true, force: true });
  }

  const daemonScript = path.join(SIS_MAIN_ROOT, 'dist', 'gateway', 'daemon.js');
  if (fs.existsSync(daemonScript)) {
    const child = spawn(process.execPath, [daemonScript, DOT_STARLIGHT, '5200'], {
      cwd: SIS_MAIN_ROOT,
      detached: true,
      windowsHide: true,
      stdio: 'ignore',
    });
    child.unref();

    // Wait up to 3s for daemon to bind
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 300));
      const after = await checkHealth();
      if (after) return { ...after, healed: true };
    }
  }

  return { alive: false, healed: false, port: 5200, pid: null, status: 'unreachable' };
}

/**
 * Runs a single autonomic tick of StarlightDaemon (`starlightd.json`).
 */
export async function tickStarlightDaemon() {
  const daemonModPath = path.join(SIS_MAIN_ROOT, 'dist', 'daemon', 'starlightd.js');
  if (!fs.existsSync(daemonModPath)) return null;
  const { StarlightDaemon } = await import('file://' + daemonModPath.replace(/\\/g, '/'));
  const daemon = new StarlightDaemon(DOT_STARLIGHT);
  return daemon.tick();
}

export function inspectLanesAndLeases() {
  const lanesPath = 'C:/Users/frank/starlight/state/lanes.json';
  const leasesDir = path.join(DOT_STARLIGHT, 'swarm-leases');
  let activeLanes = 0;
  let totalLanes = 0;
  if (fs.existsSync(lanesPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(lanesPath, 'utf8'));
      const lanes = Array.isArray(data.lanes) ? data.lanes : [];
      totalLanes = lanes.length;
      activeLanes = lanes.filter((l) => l.status === 'active').length;
    } catch {}
  }
  const leaseFiles = fs.existsSync(leasesDir)
    ? fs.readdirSync(leasesDir).filter((f) => f.endsWith('.json')).length
    : 0;
  return { activeLanes, totalLanes, leaseFiles };
}

export async function runHorizon2h(repoRoot = DEFAULT_WT_ROOT) {
  const startedAt = new Date().toISOString();
  const gateway = await ensureGatewayDaemon();
  const daemonStatus = await tickStarlightDaemon();
  const compiled = compileSovereignMemory(repoRoot, {
    mirrorRoots: repoRoot !== SIS_MAIN_ROOT ? [SIS_MAIN_ROOT] : [],
  });

  const { inspectMemoryHealth } = await import(
    'file://' + path.join(SIS_MAIN_ROOT, 'dist', 'memory-health.js').replace(/\\/g, '/')
  );
  const { runMemoryEval } = await import(
    'file://' + path.join(SIS_MAIN_ROOT, 'dist', 'memory-eval.js').replace(/\\/g, '/')
  );

  const memoryHealth = inspectMemoryHealth(repoRoot);
  const eval50 = runMemoryEval(repoRoot);
  const coordination = inspectLanesAndLeases();

  const report = {
    horizon: '2h',
    startedAt,
    completedAt: new Date().toISOString(),
    gateway,
    starlightd: daemonStatus
      ? { status: daemonStatus.status, sweepCount: daemonStatus.sweepCount, lastSweepAt: daemonStatus.lastSweepAt }
      : null,
    sovereignMemory: {
      totalAtoms: compiled.totalAtoms,
      vectorBytes: compiled.vectorBytes,
      kgRows: compiled.kgRows,
      surfaceStatus: memoryHealth.status,
      staleVaults: memoryHealth.vaults.filter((v) => v.stale).length,
      consolidationAgeDays: memoryHealth.consolidationLog.ageDays,
      notes: memoryHealth.notes,
    },
    eval50: {
      available: eval50.available,
      atoms: eval50.corpus.atoms,
      queries: eval50.corpus.queries,
      metrics: eval50.metrics,
      byClass: eval50.byClass,
    },
    coordination,
    attestation: 'Built on SIP',
  };

  fs.mkdirSync(TELEMETRY_DIR, { recursive: true });
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.appendFileSync(path.join(TELEMETRY_DIR, 'horizon-2h.jsonl'), JSON.stringify(report) + '\n', 'utf8');
  fs.writeFileSync(path.join(REPORTS_DIR, 'horizon-2h-latest.json'), JSON.stringify(report, null, 2), 'utf8');
  return report;
}

export async function runHorizon12h(repoRoot = DEFAULT_WT_ROOT) {
  const startedAt = new Date().toISOString();
  const base2h = await runHorizon2h(repoRoot);

  const { DreamingAgent } = await import(
    'file://' + path.join(SIS_MAIN_ROOT, 'dist', 'dreaming.js').replace(/\\/g, '/')
  );
  const { TemporalEngine } = await import(
    'file://' + path.join(SIS_MAIN_ROOT, 'dist', 'temporal.js').replace(/\\/g, '/')
  );

  const vaultDir = path.join(repoRoot, 'memory', 'vaults');
  const dreamer = new DreamingAgent(vaultDir);
  const vsDir = fs.existsSync(path.join(repoRoot, 'memory', 'voice-sessions'))
    ? path.join(repoRoot, 'memory', 'voice-sessions')
    : path.join(SIS_MAIN_ROOT, 'memory', 'voice-sessions');
  const auditDir = fs.existsSync(path.join(SIS_MAIN_ROOT, 'memory', '_audit'))
    ? path.join(SIS_MAIN_ROOT, 'memory', '_audit')
    : path.join(repoRoot, 'memory', '_audit');
  const dreamRes = dreamer.dream(vsDir, auditDir);
  const temporal = new TemporalEngine({ decayHalfLifeDays: 90 });
  const decayReports = temporal.scanVaults(vaultDir);
  const lowConfidence = decayReports.filter((r) => r.currentConfidence < 0.15).length;

  const localRows = auditOrWireLocalRemotes();
  const orgSummary = {
    organizationsCount: ORG_FEDERATION_MANIFEST.length,
    totalMappedRepos: localRows.length,
    localPresentCount: localRows.filter((r) => r.localFound).length,
    localOrgRemoteAlignedCount: localRows.filter((r) => r.orgAligned).length,
  };

  const report = {
    horizon: '12h',
    startedAt,
    completedAt: new Date().toISOString(),
    tactical2h: {
      gatewayAlive: base2h.gateway.alive,
      surfaceStatus: base2h.sovereignMemory.surfaceStatus,
      eval50Metrics: base2h.eval50.metrics,
    },
    dreaming: {
      processedFiles: dreamRes.processedFiles,
      extractedInsights: dreamRes.extractedInsights.length,
      contradictions: dreamRes.contradictions.length,
      promotions: dreamRes.promotions.length,
    },
    temporalDecay: {
      halfLifeDays: 90,
      entriesScanned: decayReports.length,
      belowArchiveThreshold: lowConfidence,
    },
    orgFederation: orgSummary,
    attestation: 'Built on SIP',
  };

  fs.appendFileSync(path.join(TELEMETRY_DIR, 'horizon-12h.jsonl'), JSON.stringify(report) + '\n', 'utf8');
  fs.writeFileSync(path.join(REPORTS_DIR, 'horizon-12h-latest.json'), JSON.stringify(report, null, 2), 'utf8');
  ingestCloudReceipts([
    { plane: 'horizon-12h', status: 'ok', detail: `Dreaming: ${report.dreaming.extractedInsights} insights, Orgs: ${report.orgFederation.localOrgRemoteAlignedCount}/71` },
    { plane: 'task-dreaming', status: 'ok', source: 'StarlightHorizon12h', detail: 'Dreaming consolidation completed via 12h Horizon cadence' }
  ]);
  return report;
}

const BENIGN_TASK_RESULTS = new Set([0, 267008, 267009, 267011, 267014, 267045, 2147946720]);
const SELF_REPORTING_TASK_CODES = {
  StarlightOpenRouterSpend: new Set([0, 2]),
  StarlightActionsCost: new Set([0, 2]),
  StarlightMachineSentinel: new Set([0, 1, 2]),
  StarlightTaskHealthWatch: new Set([0, 1])
};

export async function runHorizon1w(repoRoot = DEFAULT_WT_ROOT) {
  const startedAt = new Date().toISOString();
  const base12h = await runHorizon12h(repoRoot);

  // Audit Windows Scheduled Tasks health
  let scheduledTasksSummary = { total: 0, ready: 0, running: 0, disabled: 0, failingReady: [], statusSignals: [] };
  try {
    const psCmd = `Get-ScheduledTask | Where-Object { $_.TaskName -match '^Starlight|^FrankX' } | ForEach-Object { $info = Get-ScheduledTaskInfo -TaskName $_.TaskName -TaskPath $_.TaskPath -ErrorAction SilentlyContinue; [PSCustomObject]@{ Name=$_.TaskName; State=[int]$_.State; LastResult=$info.LastTaskResult } } | ConvertTo-Json -Compress`;
    const raw = execSync(`powershell -NoProfile -Command "${psCmd}"`, { encoding: 'utf8' });
    const list = JSON.parse(raw);
    const tasks = Array.isArray(list) ? list : [list];
    scheduledTasksSummary.total = tasks.length;
    scheduledTasksSummary.ready = tasks.filter((t) => t.State === 3).length;
    scheduledTasksSummary.running = tasks.filter((t) => t.State === 4).length;
    scheduledTasksSummary.disabled = tasks.filter((t) => t.State === 1).length;
    for (const t of tasks.filter((x) => x.State === 3)) {
      if (BENIGN_TASK_RESULTS.has(t.LastResult)) continue;
      if (SELF_REPORTING_TASK_CODES[t.Name]?.has(t.LastResult)) {
        scheduledTasksSummary.statusSignals.push({ name: t.Name, lastResult: t.LastResult, kind: 'self-reported-alert' });
        continue;
      }
      scheduledTasksSummary.failingReady.push({ name: t.Name, lastResult: t.LastResult });
    }
  } catch {}

  const ecosystemTelemetry = collectUnifiedEcosystemTelemetry();

  const report = {
    horizon: '1w',
    startedAt,
    completedAt: new Date().toISOString(),
    operational12h: base12h,
    scheduledTasks: scheduledTasksSummary,
    ecosystemTelemetry: {
      totalSpendRows: ecosystemTelemetry.costAndQuota.totalSpendRows,
      openrouterRemainingUsd: ecosystemTelemetry.costAndQuota.openrouter.remainingUsd,
      trackedAgentReceipts: ecosystemTelemetry.valueAndVelocity.trackedAgentReceipts,
      mergedPrs30d: ecosystemTelemetry.valueAndVelocity.mergedPrs30d?.substantive ?? 0
    },
    n8nWorkflowPresent: fs.existsSync(
      path.join(repoRoot, 'workflows', 'n8n', 'starlight-horizon-memory-orchestrator.workflow.json')
    ),
    cloudflareEdgeBridgePresent: fs.existsSync(
      path.join(repoRoot, 'workflows', 'cloudflare', 'starlight-edge-bridge.worker.js')
    ),
    attestation: 'Built on SIP',
  };
  ingestCloudReceipts([
    { plane: 'horizon-1w', status: 'ok', detail: `Failing ready tasks: ${scheduledTasksSummary.failingReady.length}` }
  ]);

  const mdLines = [
    '# Starlight Horizon 1-Week Strategic & Memory Scorecard',
    '',
    `- **Generated At:** \`${report.completedAt}\``,
    `- **Memory Surface Status:** \`${base12h.tactical2h.surfaceStatus}\``,
    `- **SIS Memory Gateway (127.0.0.1:5200):** \`${base12h.tactical2h.gatewayAlive ? 'ONLINE' : 'OFFLINE'}\``,
    `- **Eval-50 Retrieval Benchmark:** Hit@10=\`${base12h.tactical2h.eval50Metrics?.hit10}\`, Recall@5=\`${base12h.tactical2h.eval50Metrics?.recall5}\`, Precision@10=\`${base12h.tactical2h.eval50Metrics?.precision10}\`, MRR@10=\`${base12h.tactical2h.eval50Metrics?.mrr10}\`, Latency p50=\`${base12h.tactical2h.eval50Metrics?.latencyMs?.p50}ms\``,
    `- **Dreaming Consolidation:** \`${base12h.dreaming.extractedInsights}\` insights, \`${base12h.dreaming.promotions}\` promotions, \`${base12h.dreaming.contradictions}\` contradictions`,
    `- **Temporal Decay (90d half-life):** \`${base12h.temporalDecay.entriesScanned}\` scanned, \`${base12h.temporalDecay.belowArchiveThreshold}\` below archive threshold`,
    `- **10-Org GitHub Federation:** \`${base12h.orgFederation.localOrgRemoteAlignedCount}/${base12h.orgFederation.totalMappedRepos}\` local \`org\` remotes aligned across \`${base12h.orgFederation.organizationsCount}\` organizations`,
    `- **Scheduled Tasks Health:** \`${scheduledTasksSummary.ready}\` Ready, \`${scheduledTasksSummary.running}\` Running, \`${scheduledTasksSummary.disabled}\` Disabled, \`${scheduledTasksSummary.failingReady.length}\` Failing Ready`,
    '',
    '_Built on SIP_',
    '',
  ];

  fs.appendFileSync(path.join(TELEMETRY_DIR, 'horizon-1w.jsonl'), JSON.stringify(report) + '\n', 'utf8');
  fs.writeFileSync(path.join(REPORTS_DIR, 'horizon-1w-latest.json'), JSON.stringify(report, null, 2), 'utf8');
  fs.writeFileSync(path.join(REPORTS_DIR, 'horizon-1w-latest.md'), mdLines.join('\n'), 'utf8');
  return report;
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}` || process.argv[1]?.endsWith('horizon-test-runner.mjs')) {
  const args = process.argv.slice(2);
  const hIdx = args.indexOf('--horizon');
  const horizon = hIdx >= 0 ? args[hIdx + 1] : 'all';
  const rIdx = args.indexOf('--repo-root');
  const repoRoot = rIdx >= 0 ? args[rIdx + 1] : DEFAULT_WT_ROOT;

  (async () => {
    if (horizon === '2h') {
      console.log(JSON.stringify(await runHorizon2h(repoRoot), null, 2));
    } else if (horizon === '12h') {
      console.log(JSON.stringify(await runHorizon12h(repoRoot), null, 2));
    } else if (horizon === '1w') {
      console.log(JSON.stringify(await runHorizon1w(repoRoot), null, 2));
    } else {
      const r1w = await runHorizon1w(repoRoot);
      console.log(JSON.stringify(r1w, null, 2));
    }
  })();
}
