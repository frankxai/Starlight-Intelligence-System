#!/usr/bin/env node
/**
 * Starlight Jules Conductor v2.2 — retirement mode.
 * New dispatch is disabled; existing evidence and review gates are retained.
 *
 * Council-Driven & Low-RAM Native:
 * 1. Multi-Agent Preflight: Architect & Sage govern prompt formulation.
 * 2. Low-RAM Direct Engine: Bypasses shell startup, running sub-second direct node/bin execution.
 * 3. Multi-Repo Profiles: Next.js, Substrate, and Agent Runtimes customized.
 * 4. Multi-Agent Post-Flight: Sentinel (security) & Weaver (taste/anti-slop) review.
 * 5. Land gate: one owned session, explicit accept, live green checks. No estate sweep.
 *
 * Built on SIP — Starlight Intelligence Protocol.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync, statfsSync, openSync, closeSync, unlinkSync, writeSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import { engineerJulesPrompt } from './prompt-engineer.mjs';
import { validatePatch } from './sentinel-validator.mjs';
import { sentinelAudit, weaverTasteReview } from './council-gate.mjs';
import { capacityAllowsDispatch, claimDaemonLock, julesDraftAction, matchPullRequest } from './merge-gate.mjs';
import { formatBoard, takeReady } from './work-board.mjs';
import { julesCommandPolicy, RETIREMENT_REASON } from './retirement.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const CONFIG_PATH = join(__dirname, 'config.json');
const STATE_DIR = join(__dirname, 'state');
const LEDGER_PATH = join(STATE_DIR, 'ledger.json');
const ARCHIVE_PATH = join(STATE_DIR, 'archive.jsonl');
const BACKLOG_PATH = join(STATE_DIR, 'backlog.json');
const NEXT_PATH = join(__dirname, 'next-actions.json');
const LOGS_DIR = join(__dirname, 'logs');
const CONDUCTOR_LOG = join(LOGS_DIR, 'conductor.log');
const PID_PATH = join(STATE_DIR, 'daemon.pid');
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
  const policy = julesCommandPolicy(args);
  if (!policy.allowed) return { code: 2, stdout: '', stderr: policy.reason };
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

const STALE_INFLIGHT_MS = 6 * 60 * 60 * 1000;

function pidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function isInflight(session, nowMs) {
  if (!session || session.merged || session.quarantined) return false;
  const status = String(session.status || '').toLowerCase();
  const active = ['planning', 'in progress', 'queued', 'running'].some((name) => status.includes(name));
  if (!active) return false;
  const seen = Date.parse(session.lastSeen || session.firstSeen || '');
  if (Number.isFinite(seen) && nowMs - seen > STALE_INFLIGHT_MS) return false;
  return true;
}

function acquirePidFile() {
  const writePid = () => {
    const fd = openSync(PID_PATH, 'wx');
    try {
      writeSync(fd, String(process.pid));
    } finally {
      closeSync(fd);
    }
  };
  try {
    writePid();
    return { take: true, reason: 'no lock' };
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
    const existingRaw = existsSync(PID_PATH) ? readFileSync(PID_PATH, 'utf8').trim() : '';
    const existingPid = Number.parseInt(existingRaw, 10);
    const knownPid = Number.isInteger(existingPid) && existingPid > 0 ? existingPid : null;
    const claim = claimDaemonLock({
      existingPid: knownPid,
      existingAlive: knownPid ? pidAlive(knownPid) : false,
    });
    if (!claim.take) return claim;
    try {
      unlinkSync(PID_PATH);
    } catch {
      return { take: false, reason: 'stale lock could not be cleared' };
    }
    try {
      writePid();
      return { take: true, reason: 'stale pid replaced' };
    } catch {
      return { take: false, reason: 'lock race lost' };
    }
  }
}

function readCapacity() {
  try {
    const stats = statfsSync('C:\\');
    const diskGiB = (Number(stats.bavail) * Number(stats.bsize)) / (1024 ** 3);
    const ramGiB = os.freemem() / (1024 ** 3);
    return capacityAllowsDispatch(diskGiB, ramGiB);
  } catch {
    return { ok: false, reason: 'capacity unreadable' };
  }
}

function recordOrLand(session, config, ledger) {
  if (!session.repo || String(session.repo).includes('…')) {
    log(`[PR SKIP] Session ${session.id} repo is unresolved (${session.repo || 'missing'}).`);
    return;
  }
  const profile = getRepoProfile(session.repo, config);
  const list = runGh([
    'pr', 'list', '--repo', session.repo, '--state', 'open', '--limit', '50',
    '--json', 'number,title,headRefName,body,url,isDraft,baseRefName',
  ]);
  if (list.code !== 0) {
    log(`[PR LIST] ${session.repo}: ${list.stderr || list.stdout}`);
    return;
  }
  let prs = [];
  try {
    prs = JSON.parse(list.stdout || '[]');
  } catch (err) {
    log(`[PR LIST] ${session.repo} parse error: ${err.message}`);
    return;
  }
  const matched = matchPullRequest(prs, session.id, session.trackToken);
  if (!matched) {
    log(`[PR WAIT] Session ${session.id} has no pull request that names its session id or track token.`);
    return;
  }
  session.pullRequest = matched.url || matched.number;
  // Jules opens drafts only. The conductor never merges and never enables
  // auto-merge. A separate reviewer (Codex, Claude Code, Antigravity or CTO)
  // stamps a PASS at the exact head, and CTO lands it outside this tool.
  log(`[PR OPEN] ${session.repo}#${matched.number} draft=${matched.isDraft === true} awaiting separate-reviewer PASS`);
  if (julesDraftAction(matched) === 'convert-to-draft') {
    const undo = runGh(['pr', 'ready', String(matched.number), '--repo', session.repo, '--undo']);
    if (undo.code === 0) {
      log(`[PR REDRAFTED] ${session.repo}#${matched.number} Jules output converted back to draft`);
      appendVault({ action: 'jules_pr_redrafted', sessionId: session.id, repo: session.repo, prNumber: matched.number });
    } else {
      session.quarantined = true;
      log(`[PR REDRAFT FAILED] ${session.repo}#${matched.number} quarantined: ${undo.stderr || undo.stdout}`);
    }
  }
}

function sendOwnedTask(task, ledger, config) {
  const policy = julesCommandPolicy(['new']);
  if (!policy.allowed) return { sent: false, detail: policy.reason };
  const profile = getRepoProfile(task.repo, config);
  const trackToken = `jules-track-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    const engineeredPrompt = engineerJulesPrompt({
      repo: task.repo,
      taskDescription: task.description,
      issueNumber: task.issueNumber,
      repoProfile: profile,
      taskType: task.type || 'feature',
      scopeFiles: task.scopeFiles || [],
      trackToken,
    });
    const dispatchRes = runJules(['new', '--repo', task.repo], { input: engineeredPrompt });
    if (dispatchRes.code !== 0) {
      return { sent: false, detail: dispatchRes.stderr || dispatchRes.stdout || 'dispatch failed' };
    }
    const idMatch = (dispatchRes.stdout || '').match(/(\d{18,20})/);
    if (idMatch) {
      ledger.sessions[idMatch[1]] = {
        id: idMatch[1],
        repo: task.repo,
        description: task.description,
        status: 'Planning',
        firstSeen: new Date().toISOString(),
        verified: false,
        merged: false,
        owned: true,
        accepted: false,
        trackToken,
      };
    }
    ledger.metrics = ledger.metrics || {};
    ledger.metrics.dispatched = (ledger.metrics.dispatched || 0) + 1;
    appendVault({
      action: 'jules_session_dispatched',
      repo: task.repo,
      leadAgent: profile.primaryAgent,
      task: task.title || task.id,
    });
    return { sent: true, detail: idMatch ? idMatch[1] : 'sent without a session id' };
  } catch (err) {
    return { sent: false, detail: err.message };
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
  const adoptRemote = config.runtime?.adoptRemoteSessions === true;
  const shouldScanRemote = adoptRemote && ((now - lastScan > 60 * 60 * 1000) || (Object.keys(ledger.sessions || {}).length === 0));

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
          owned: false,
          accepted: false,
        };
      } else {
        ledger.sessions[rs.id].status = rs.status;
        ledger.sessions[rs.id].lastSeen = new Date().toISOString();
      }
    }
    ledger.lastRemoteScan = new Date().toISOString();
  } else {
    // Fast path: Only check active in-flight cloud sessions directly (~3s instead of 100s)
    const activeSessions = Object.values(ledger.sessions).filter((session) => session.owned === true && isInflight(session, now)).slice(0, 3);
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
    .filter(([_, s]) => s.owned === true && String(s.status || '').toLowerCase().includes('completed') && !s.verified && !s.merged && !s.quarantined)
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
    recordOrLand(s, config, ledger);
  }

  // 3. Process Backlog Queue
  const activeCount = Object.values(ledger.sessions).filter((session) => session.owned === true && isInflight(session, now)).length;

  const maxSessions = config.runtime?.maxConcurrentSessions || 3;
  log(`Active owned sessions: ${activeCount}/${maxSessions}`);

  const room = readCapacity();
  const autoDispatch = config.automation?.autoDispatch === true && julesCommandPolicy(['new']).allowed;
  if (activeCount < maxSessions && backlog.queue.length > 0 && !autoDispatch) {
    log(`[DISPATCH HELD] ${RETIREMENT_REASON}`);
  } else if (activeCount < maxSessions && backlog.queue.length > 0 && !room.ok) {
    log(`[DISPATCH HELD] ${room.reason}`);
  }

  if (activeCount < maxSessions && autoDispatch && room.ok) {
    const picked = takeReady(backlog.queue);
    if (!picked.task) {
      log('[DISPATCH HELD] no bounded ready task');
    } else {
      const result = sendOwnedTask(picked.task, ledger, config);
      if (result.sent) {
        backlog.queue = picked.queue;
        log(`[DISPATCH SUCCESS] ${picked.task.id} on ${picked.task.repo}`);
      } else {
        log(`[DISPATCH HELD] ${result.detail}`);
      }
      saveJSON(BACKLOG_PATH, backlog);
    }
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
      console.log(`[${s.id}] ${String(s.repo || '').padEnd(35)} | ${String(s.status || '').padEnd(16)} | ${verifiedIcon} ${mergedIcon}`);
    }
  }
  console.log('---------------------------------------------------------------');
  const ready = (loadJSON(BACKLOG_PATH, { queue: [] }).queue || []).filter((item) => item.ready === true).length;
  console.log(`Ready tasks:  ${ready}. Run "next" for what to arm.`);
  console.log('===============================================================\n');
}

export function printNext() {
  const board = loadJSON(NEXT_PATH, { actions: [] });
  console.log(RETIREMENT_REASON);
  console.log(formatBoard(board.actions.map(action => ({ ...action, how: 'See migration.mjs handoff; original board is retained as evidence.' })), { ok: false, reason: 'Jules retired for new work' }));
  console.log('');
  console.log('Use migration.mjs handoff <board-id> <admission.json> to prepare a held contract for agentic-ops.');
}

export function armOne(id) {
  console.error(RETIREMENT_REASON);
  process.exitCode = 2;
}

export function runReady() {
  console.error(RETIREMENT_REASON);
  process.exitCode = 2;
}

export function dispatchDirect(repo, taskDesc, type = 'feature') {
  console.error(RETIREMENT_REASON);
  process.exitCode = 2;
}

export async function runDaemon() {
  const claim = acquirePidFile();
  if (!claim.take) {
    log(`Another conductor is running (${claim.reason}). Exiting.`);
    process.exit(0);
  }

  const config = loadJSON(CONFIG_PATH, {});
  const intervalMs = (config.runtime?.pollIntervalSeconds || 180) * 1000;

  console.log(`Starting Starlight Jules Conductor Daemon v2.2 (Interval: ${config.runtime?.pollIntervalSeconds}s)...`);
  log(`Daemon started. One instance. Process RSS: ${getMemoryMetrics().rssMb} MB. ${claim.reason}.`);

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
} else if (cmd === 'next') {
  printNext();
} else if (cmd === 'arm') {
  if (!arg1) {
    console.log('Usage: node conductor.mjs arm <id>');
    process.exit(1);
  }
  armOne(arg1);
} else if (cmd === 'run-ready') {
  runReady();
} else if (cmd === 'dispatch') {
  if (!arg1 || rest.length === 0) {
    console.log('Usage: node conductor.mjs dispatch <owner/repo> "<task description>" [type]');
    process.exit(1);
  }
  dispatchDirect(arg1, rest.join(' '));
} else if (cmd === 'accept') {
  if (!arg1) {
    console.log('Usage: node conductor.mjs accept <session-id>');
    process.exit(1);
  }
  const ledger = loadJSON(LEDGER_PATH, { sessions: {} });
  const session = ledger.sessions?.[arg1];
  if (!session) {
    console.log('session not in ledger');
    process.exit(2);
  }
  if (session.owned !== true) {
    console.log('refuse: this conductor did not start that session');
    process.exit(2);
  }
  session.accepted = true;
  session.acceptedAt = new Date().toISOString();
  saveJSON(LEDGER_PATH, ledger);
  console.log(`accepted ${arg1}`);
} else if (cmd === 'daemon') {
  runDaemon();
} else {
  console.log(`Starlight Jules Conductor v2.2
Commands:
  next                                 What to do, where, and the command
  arm <id>                             Retired: use migration.mjs handoff
  run-ready                            Retired: exits without modifying backlog
  status                               Show ledger status, RAM, and whether a task is armed
  tick                                 One scan. Records Jules draft PRs. Never merges
  accept <session-id>                  Mark one owned session accepted. Never merges by itself
  dispatch <repo> "<desc>" [type]      Retired: exits without calling Jules
  daemon                               One background loop. A second start exits
`);
}
