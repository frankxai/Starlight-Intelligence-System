#!/usr/bin/env node
/**
 * Starlight Jules Autonomous Conductor v2.0
 * 24/7 Zero-Touch Autonomous Engineering Swarm
 *
 * Council-Driven & Low-RAM Native:
 * 1. Multi-Agent Preflight: Architect & Sage govern prompt formulation.
 * 2. Low-RAM Direct Engine: Bypasses shell startup, running sub-second direct node/bin execution.
 * 3. Multi-Repo Profiles: Next.js, Substrate, and Agent Runtimes customized.
 * 4. Multi-Agent Post-Flight: Sentinel (security) & Weaver (taste/anti-slop) review.
 * 5. Autonomous Auto-Merge: Continuous GitHub PR merge & Starlight Vault recording.
 *
 * Built on SIP — Starlight Intelligence Protocol.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { engineerJulesPrompt } from './prompt-engineer.mjs';
import { validatePatch } from './sentinel-validator.mjs';
import { sentinelAudit, weaverTasteReview } from './council-gate.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const CONFIG_PATH = join(__dirname, 'config.json');
const STATE_DIR = join(__dirname, 'state');
const LEDGER_PATH = join(STATE_DIR, 'ledger.json');
const ARCHIVE_PATH = join(STATE_DIR, 'archive.jsonl');
const BACKLOG_PATH = join(STATE_DIR, 'backlog.json');
const LOGS_DIR = join(__dirname, 'logs');
const CONDUCTOR_LOG = join(LOGS_DIR, 'conductor.log');
const VAULT_PATH = join(ROOT, 'memory', 'vaults', 'operational.jsonl');

// Direct Node invocation path for Jules (avoids PowerShell profile lag and saves ~200MB RAM per call)
const JULES_ENTRY = 'C:/Users/frank/AppData/Roaming/npm/node_modules/@google/jules/run.cjs';

mkdirSync(STATE_DIR, { recursive: true });
mkdirSync(LOGS_DIR, { recursive: true });

function getMemoryMetrics() {
  const mem = process.memoryUsage();
  return {
    heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
    rssMb: Math.round(mem.rss / 1024 / 1024),
  };
}

function log(msg) {
  const mem = getMemoryMetrics();
  const line = `[${new Date().toISOString()}] [RAM: ${mem.rssMb}MB] ${msg}`;
  console.log(line);
  try {
    appendFileSync(CONDUCTOR_LOG, line + '\n');
  } catch {}
}

function loadJSON(p, fallback) {
  try {
    return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : fallback;
  } catch (err) {
    log(`Warning: Failed to load ${p}, using fallback: ${err.message}`);
    return fallback;
  }
}

function saveJSON(p, obj) {
  writeFileSync(p, JSON.stringify(obj, null, 2), 'utf8');
}

function appendVault(entry) {
  try {
    const item = {
      id: `jules_event_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      vault: 'operational',
      type: 'autonomous_engineering_receipt',
      attestation: 'Built on SIP',
      ...entry,
    };
    appendFileSync(VAULT_PATH, JSON.stringify(item) + '\n', 'utf8');
  } catch (err) {
    log(`Failed to append to operational vault: ${err.message}`);
  }
}

// Low-RAM Direct Command Runner (avoids spawning heavy PowerShell processes)
function runDirect(bin, args, options = {}) {
  const isWindows = process.platform === 'win32';
  const execBin = bin;
  const execArgs = args;

  const res = spawnSync(execBin, execArgs, {
    encoding: 'utf8',
    shell: false,
    windowsHide: true,
    input: options.input,
    cwd: options.cwd || ROOT,
    timeout: options.timeout || 60000,
    maxBuffer: 10 * 1024 * 1024,
  });

  return {
    code: res.status ?? (res.error ? 1 : 0),
    stdout: (res.stdout || '').trim(),
    stderr: (res.stderr || res.error?.message || '').trim(),
  };
}

const JULES_EXE = 'C:/Users/frank/AppData/Roaming/npm/node_modules/@google/jules/jules.exe';

function runJules(args, options = {}) {
  // Use direct binary invocation for maximum speed and zero lock contention
  if (existsSync(JULES_EXE)) {
    return runDirect(JULES_EXE, args, options);
  }
  return runDirect('jules', args, options);
}

function runGh(args, options = {}) {
  return runDirect('gh', args, options);
}

function getRepoProfile(repo, config) {
  return config.repoProfiles?.[repo] || config.repoProfiles?.default || {
    type: 'generic',
    primaryAgent: 'starlight-architect',
    qualityGate: 'npm test',
    targetBranch: 'main',
  };
}

function resolveRepoName(shortRepo, knownRepos = []) {
  if (!shortRepo) return shortRepo;
  if (!shortRepo.includes('…')) return shortRepo;
  const prefix = shortRepo.replace('…', '');
  const match = knownRepos.find(r => r.startsWith(prefix));
  return match || shortRepo;
}

// ── Remote Session Parser ───────────────────────────────────────
function parseRemoteSessions(knownRepos = []) {
  const res = runJules(['remote', 'list', '--session'], { timeout: 150000 });
  if (res.code !== 0) {
    log(`Failed to list remote sessions: ${res.stderr || res.stdout}`);
    return [];
  }

  const lines = res.stdout.split('\n');
  const sessions = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('ID') || trimmed.includes('Starlight') || trimmed.includes('Welcome') || trimmed.includes('Cockpit')) {
      continue;
    }

    const match = trimmed.match(/^(\d+)\s+(.+?)\s+([a-zA-Z0-9_\-\.\/…]+)\s+([0-9a-zA-Z\s]+?ago)\s+([a-zA-Z0-9\s]+)$/);
    if (match) {
      sessions.push({
        id: match[1].trim(),
        description: match[2].trim(),
        repo: resolveRepoName(match[3].trim(), knownRepos),
        lastActive: match[4].trim(),
        status: match[5].trim(),
      });
    } else {
      const parts = trimmed.split(/\s{2,}/);
      if (parts.length >= 3 && /^\d+$/.test(parts[0])) {
        sessions.push({
          id: parts[0],
          description: parts[1] || '',
          repo: resolveRepoName(parts[2] || '', knownRepos),
          lastActive: parts[3] || '',
          status: parts[4] || 'Unknown',
        });
      }
    }
  }

  return sessions;
}

// ── Memory Hygiene & State Pruning ──────────────────────────────
function pruneLedger(ledger, maxEntries = 50) {
  const ids = Object.keys(ledger.sessions);
  if (ids.length <= maxEntries) return;

  const toArchive = [];
  const entries = Object.entries(ledger.sessions);

  // Keep all uncompleted/unmerged, archive oldest merged/completed
  const sortable = entries.filter(([_, s]) => s.merged || s.status.toLowerCase().includes('completed'));
  const excess = ids.length - maxEntries;

  if (sortable.length > 0 && excess > 0) {
    const victims = sortable.slice(0, excess);
    for (const [id, s] of victims) {
      toArchive.push(s);
      delete ledger.sessions[id];
    }

    // Append to archive
    try {
      const lines = toArchive.map(v => JSON.stringify(v)).join('\n') + '\n';
      appendFileSync(ARCHIVE_PATH, lines, 'utf8');
      log(`Pruned ${toArchive.length} archived sessions to keep state compact.`);
    } catch {}
  }
}

// ── Core Operations ─────────────────────────────────────────────

export async function tick() {
  const config = loadJSON(CONFIG_PATH, {});
  const ledger = loadJSON(LEDGER_PATH, { lastTick: null, sessions: {}, metrics: { dispatched: 0, completed: 0, merged: 0, quarantined: 0 } });
  const backlog = loadJSON(BACKLOG_PATH, { queue: [] });

  const monitored = Object.keys(config.repoProfiles || {});
  const now = Date.now();
  const lastScan = ledger.lastRemoteScan ? new Date(ledger.lastRemoteScan).getTime() : 0;
  const shouldScanRemote = (now - lastScan > 60 * 60 * 1000) || (Object.keys(ledger.sessions || {}).length === 0);

  if (shouldScanRemote) {
    log(`[REMOTE SCAN] Refreshing full remote session inventory across ${monitored.length} repos...`);
    const remoteSessions = parseRemoteSessions(monitored);
    for (const rs of remoteSessions) {
      if (!ledger.sessions[rs.id]) {
        ledger.sessions[rs.id] = {
          id: rs.id,
          repo: rs.repo,
          description: rs.description,
          status: rs.status,
          firstSeen: new Date().toISOString(),
          verified: false,
          merged: false,
        };
      } else {
        ledger.sessions[rs.id].status = rs.status;
        ledger.sessions[rs.id].lastSeen = new Date().toISOString();
      }
    }
    ledger.lastRemoteScan = new Date().toISOString();
  } else {
    // Fast path: Only check active in-flight cloud sessions directly (~3s instead of 100s)
    const activeSessions = Object.values(ledger.sessions).filter(s => 
      !s.merged && !s.quarantined && ['planning', 'in progress', 'running', 'queued'].some(st => (s.status || '').toLowerCase().includes(st))
    );
    if (activeSessions.length > 0) {
      log(`[FAST PATH] Checking ${activeSessions.length} active sessions directly...`);
      for (const s of activeSessions) {
        const getRes = runJules(['get', s.id], { timeout: 15000 });
        if (getRes.code === 0 && getRes.stdout) {
          if (getRes.stdout.toLowerCase().includes('completed')) s.status = 'Completed';
          else if (getRes.stdout.toLowerCase().includes('failed')) s.status = 'Failed';
        }
      }
    }
  }

  // 2. Process Completed Sessions (Up to 2 unverified sessions per tick to maintain fast ~45s cycle)
  const completedUnverified = Object.entries(ledger.sessions)
    .filter(([_, s]) => s.status.toLowerCase().includes('completed') && !s.verified && !s.merged && !s.quarantined)
    .slice(0, 2);

  for (const [id, s] of completedUnverified) {
    log(`[COUNCIL REVIEW] Session ${id} (${s.repo})...`);

    // Pull patch directly
    const patchRes = runJules(['remote', 'pull', '--session', id], { timeout: 60000 });
    if (patchRes.code !== 0) {
      log(`Warning: Could not pull patch for session ${id}: ${patchRes.stderr}`);
      continue;
    }

    const patchText = patchRes.stdout;

    // Multi-Agent Council Audits
    // A. Sentinel Security Check
    const sentinelReport = sentinelAudit(patchText, config.safetyRules || {});
    // B. Weaver Taste & Anti-Slop Check
    const weaverReport = weaverTasteReview(patchText);
    // C. Structural Diff & Bounds Check
    const val = validatePatch(patchText, config.safetyRules || {});

    const councilApproved = val.ok && sentinelReport.approved;
    const allViolations = [...val.violations, ...sentinelReport.blockers];

    if (!councilApproved) {
      log(`[QUARANTINE] Session ${id} failed council review: ${allViolations.join('; ')}`);
      s.verified = false;
      s.quarantined = true;
      s.quarantineReasons = allViolations;
      ledger.metrics.quarantined++;
      appendVault({
        action: 'session_quarantined',
        sessionId: id,
        repo: s.repo,
        reasons: allViolations,
      });
      continue;
    }

    if (weaverReport.warnings.length > 0) {
      log(`[WEAVER NOTE] Session ${id} warnings: ${weaverReport.warnings.join('; ')}`);
      s.weaverWarnings = weaverReport.warnings;
    }

    s.verified = true;
    s.stats = val.stats;
    ledger.metrics.completed++;
    log(`[COUNCIL RATIFIED] Session ${id}: ${val.stats.filesChanged} files, +${val.stats.linesAdded}/-${val.stats.linesRemoved}`);

    // Auto-Merge Phase
    if (config.automation?.autoMerge && s.repo) {
      log(`[CHECK PR] Looking for open Pull Requests from Jules on ${s.repo}...`);
      const prList = runGh(['pr', 'list', '--repo', s.repo, '--state', 'open', '--json', 'number,title,headRefName,url,isDraft']);
      if (prList.code === 0) {
        try {
          const prs = JSON.parse(prList.stdout || '[]');
          const matchedPr = prs.find(p => 
            p.title.includes(id) || 
            p.headRefName.includes(id) || 
            (s.description && p.title.toLowerCase().includes(s.description.toLowerCase().slice(0, 20)))
          );

          if (matchedPr) {
            log(`[MATCHED PR] PR #${matchedPr.number}: ${matchedPr.title}`);
            if (matchedPr.isDraft) {
              runGh(['pr', 'ready', String(matchedPr.number), '--repo', s.repo]);
            }

            const mergeArgs = ['pr', 'merge', String(matchedPr.number), '--repo', s.repo, '--squash'];
            if (config.automation?.deleteBranchAfterMerge) mergeArgs.push('--delete-branch');
            if (config.automation?.requireChecksPassing) mergeArgs.push('--auto');

            const mergeRes = runGh(mergeArgs);
            if (mergeRes.code === 0) {
              log(`[AUTO-MERGED] Successfully merged PR #${matchedPr.number} on ${s.repo}!`);
              s.merged = true;
              s.mergedPr = matchedPr.number;
              ledger.metrics.merged++;
              appendVault({
                action: 'autonomous_pr_merged',
                sessionId: id,
                repo: s.repo,
                prNumber: matchedPr.number,
                stats: val.stats,
              });
            } else {
              log(`Auto-merge attempted on PR #${matchedPr.number}: ${mergeRes.stderr || mergeRes.stdout}`);
            }
          } else {
            log(`Session ${id} verified clean. Patch ready for local integration.`);
          }
        } catch (err) {
          log(`Error parsing PR list for ${s.repo}: ${err.message}`);
        }
      }
    }
  }

  // 3. Process Backlog Queue
  const activeCount = Object.values(ledger.sessions).filter(s => {
    if (s.merged || s.quarantined) return false;
    const st = (s.status || '').toLowerCase();
    if (st.includes('completed') || st.includes('failed') || st.includes('unknown') || st.includes('awaiting')) {
      return false;
    }
    return st.includes('planning') || st.includes('in progress') || st.includes('queued') || st.includes('running');
  }).length;

  const maxSessions = config.runtime?.maxConcurrentSessions || 3;
  log(`Active concurrent sessions: ${activeCount}/${maxSessions}`);

  if (activeCount < maxSessions && backlog.queue.length > 0) {
    const task = backlog.queue.shift();
    const profile = getRepoProfile(task.repo, config);
    log(`[DISPATCHING FROM BACKLOG] Repo: ${task.repo}, Lead: ${profile.primaryAgent}`);

    try {
      const engineeredPrompt = engineerJulesPrompt({
        repo: task.repo,
        taskDescription: task.description,
        issueNumber: task.issueNumber,
        repoProfile: profile,
        taskType: task.type || 'feature',
        scopeFiles: task.scopeFiles || [],
      });

      const dispatchRes = runJules(['new', '--repo', task.repo], { input: engineeredPrompt });
      if (dispatchRes.code === 0) {
        log(`[DISPATCH SUCCESS] Task queued with Jules on ${task.repo}`);
        const idMatch = (dispatchRes.stdout || '').match(/(\d{18,20})/);
        if (idMatch) {
          const newId = idMatch[1];
          ledger.sessions[newId] = {
            id: newId,
            repo: task.repo,
            description: task.description,
            status: 'Planning',
            firstSeen: new Date().toISOString(),
            verified: false,
            merged: false,
          };
          log(`[REGISTERED SESSION] Auto-registered ${newId} in ledger for direct tracking.`);
        }
        ledger.metrics.dispatched++;
        appendVault({
          action: 'jules_session_dispatched',
          repo: task.repo,
          leadAgent: profile.primaryAgent,
          task: task.description,
        });
      } else {
        log(`Failed to dispatch task: ${dispatchRes.stderr || dispatchRes.stdout}`);
        backlog.queue.unshift(task);
      }
    } catch (err) {
      log(`Prompt engineering error: ${err.message}`);
    }
    saveJSON(BACKLOG_PATH, backlog);
  }

  // Memory & state hygiene
  pruneLedger(ledger, config.runtime?.maxLedgerActiveEntries || 50);

  ledger.lastTick = new Date().toISOString();
  saveJSON(LEDGER_PATH, ledger);
  log(`[TICK COMPLETE]\n`);
}

export function status() {
  const ledger = loadJSON(LEDGER_PATH, { lastTick: null, sessions: {}, metrics: {} });
  const mem = getMemoryMetrics();

  console.log('===============================================================');
  console.log('       STARLIGHT JULES AUTONOMOUS CONDUCTOR STATUS v2.0');
  console.log('===============================================================');
  console.log(`Last Tick:    ${ledger.lastTick || 'Never'}`);
  console.log(`Memory RSS:   ${mem.rssMb} MB | Heap: ${mem.heapUsedMb} MB`);
  console.log(`Metrics:      Dispatched: ${ledger.metrics?.dispatched || 0} | Completed: ${ledger.metrics?.completed || 0} | Merged: ${ledger.metrics?.merged || 0} | Quarantined: ${ledger.metrics?.quarantined || 0}`);
  console.log('---------------------------------------------------------------');

  const list = Object.values(ledger.sessions || {});
  if (list.length === 0) {
    console.log('No tracked sessions in ledger.');
  } else {
    for (const s of list.slice(-15)) {
      const verifiedIcon = s.verified ? '✓ Ratified' : (s.quarantined ? '✗ Quarantined' : '○ Pending');
      const mergedIcon = s.merged ? '★ MERGED' : '';
      console.log(`[${s.id}] ${s.repo.padEnd(35)} | ${s.status.padEnd(16)} | ${verifiedIcon} ${mergedIcon}`);
    }
  }
  console.log('===============================================================\n');
}

export function dispatchDirect(repo, taskDesc, type = 'feature') {
  const config = loadJSON(CONFIG_PATH, {});
  const profile = getRepoProfile(repo, config);
  log(`Direct dispatch initiated for ${repo} [Lead: ${profile.primaryAgent}]...`);

  const engineeredPrompt = engineerJulesPrompt({
    repo,
    taskDescription: taskDesc,
    repoProfile: profile,
    taskType: type,
  });

  const res = runJules(['new', '--repo', repo], { input: engineeredPrompt });
  console.log(res.stdout || res.stderr);
  tick();
}

export async function runDaemon() {
  const config = loadJSON(CONFIG_PATH, {});
  const intervalMs = (config.runtime?.pollIntervalSeconds || 180) * 1000;

  console.log(`Starting Starlight Jules Conductor Daemon v2.0 (Interval: ${config.runtime?.pollIntervalSeconds}s)...`);
  log(`Daemon started in Low-RAM Mode. Process RSS: ${getMemoryMetrics().rssMb} MB.`);

  try {
    await tick();
  } catch (err) {
    log(`Initial tick error: ${err.message}`);
  }

  setInterval(async () => {
    try {
      await tick();
    } catch (err) {
      log(`Tick execution error: ${err.message}`);
    }
  }, intervalMs);
}

// ── CLI Router ──────────────────────────────────────────────────
const [,, cmd, arg1, ...rest] = process.argv;

if (cmd === 'tick') {
  tick();
} else if (cmd === 'status') {
  status();
} else if (cmd === 'dispatch') {
  if (!arg1 || rest.length === 0) {
    console.log('Usage: node conductor.mjs dispatch <owner/repo> "<task description>" [type]');
    process.exit(1);
  }
  dispatchDirect(arg1, rest.join(' '));
} else if (cmd === 'daemon') {
  runDaemon();
} else {
  console.log(`Starlight Jules Autonomous Conductor v2.0
Commands:
  status                               Show live ledger status, metrics, and RAM usage
  tick                                 Execute a single council-gated scan & merge cycle
  dispatch <repo> "<desc>" [type]      Engineer prompt with Council invariants & dispatch to Jules
  daemon                               Run continuous 24/7 low-RAM background loop
`);
}
