#!/usr/bin/env node
/**
 * Starlight Issue Harvester & Autonomous Queue Injector
 * 
 * Bridges GitHub Issues across the ecosystem into the Jules Conductor Backlog.
 * Filters for surgical, high-leverage engineering problems and rejects underspecified
 * or high-level strategic/decision issues to prevent runaway cloud sessions.
 * 
 * Built on SIP — Starlight Intelligence Protocol v1.1.1.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, 'config.json');
const STATE_DIR = join(__dirname, 'state');
const LEDGER_PATH = join(STATE_DIR, 'ledger.json');
const BACKLOG_PATH = join(STATE_DIR, 'backlog.json');

function loadJSON(p, fallback) {
  try {
    return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(p, obj) {
  writeFileSync(p, JSON.stringify(obj, null, 2), 'utf8');
}

// Surgical criteria: issues suitable for autonomous Jules execution
const SURGICAL_KEYWORDS = [
  'fix', 'bug', 'layout shift', 'cls', 'validator', 'security', 'rce', 
  'dependencies', 'temp dir', 'cleanup', 'test', 'schema', 'pin', 
  'export', 'shim', 'data leak', 'idempotent', 'refund', 'ui', 'component',
  'guide', 'seo', 'docs', 'a11y', 'contrast'
];

const REJECT_PATTERNS = [
  /decision needed/i,
  /frank \/ cco/i,
  /screen later/i,
  /gate eic/i,
  /canon questions/i,
  /proposal:/i
];

function determineTaskType(issue) {
  const text = `${issue.title} ${issue.body || ''}`.toLowerCase();
  if (text.includes('security') || text.includes('rce') || text.includes('data leak') || text.includes('dependencies')) {
    return 'security';
  }
  if (text.includes('ui') || text.includes('css') || text.includes('layout shift') || text.includes('cls') || text.includes('component') || text.includes('a11y')) {
    return 'frontend_excellence';
  }
  if (text.includes('seo') || text.includes('guide') || text.includes('blog') || text.includes('copy') || text.includes('post')) {
    return 'technical_content_seo';
  }
  if (text.includes('test') || text.includes('coverage') || text.includes('fixture')) {
    return 'overflow_testing_qa';
  }
  if (text.includes('ontology') || text.includes('vault') || text.includes('graph')) {
    return 'knowledge_graph_ontology';
  }
  return 'bugfix';
}

function isAutonomousCandidate(issue) {
  const text = `${issue.title} ${issue.body || ''}`.toLowerCase();
  
  // 1. Must not match rejection patterns
  for (const pat of REJECT_PATTERNS) {
    if (pat.test(issue.title)) return false;
  }

  // 2. Must contain surgical or engineering keywords
  const hasKeyword = SURGICAL_KEYWORDS.some(kw => text.includes(kw));
  return hasKeyword;
}

import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
const execFileAsync = promisify(execFile);

export async function harvestIssues() {
  const config = loadJSON(CONFIG_PATH, {});
  const ledger = loadJSON(LEDGER_PATH, { sessions: {} });
  const backlog = loadJSON(BACKLOG_PATH, { queue: [] });

  const existingSessionDescriptions = Object.values(ledger.sessions || {}).map(s => (s.description || '').toLowerCase());
  const queuedIssueKeys = new Set(backlog.queue.map(t => `${t.repo}#${t.issueNumber}`));

  const harvested = [];
  const repos = config.monitoredRepos || Object.keys(config.repoProfiles || {}).filter(k => k !== 'default');

  console.log(`[HARVESTER] Scanning GitHub issues across ${repos.length} repositories in parallel...`);

  const sweeps = repos.map(async (repo) => {
    try {
      const { stdout } = await execFileAsync('gh', [
        'issue', 'list',
        '--repo', repo,
        '--limit', '10',
        '--state', 'open',
        '--json', 'number,title,body,labels,url'
      ], {
        encoding: 'utf8',
        windowsHide: true,
        timeout: 20000
      });

      return { repo, issues: JSON.parse(stdout || '[]') };
    } catch {
      return { repo, issues: [] };
    }
  });

  const results = await Promise.all(sweeps);

  for (const { repo, issues } of results) {
    for (const issue of issues) {
      const key = `${repo}#${issue.number}`;
      if (queuedIssueKeys.has(key)) continue;

      // Check if already executed in ledger
      const alreadyRan = existingSessionDescriptions.some(desc => 
        desc.includes(repo.toLowerCase()) && desc.includes(String(issue.number))
      );
      if (alreadyRan) continue;

      if (isAutonomousCandidate(issue)) {
        const taskType = determineTaskType(issue);
        const task = {
          id: `task_${Date.now()}_${issue.number}`,
          repo,
          issueNumber: issue.number,
          title: issue.title,
          description: `Issue #${issue.number}: ${issue.title}\n\n${(issue.body || '').slice(0, 500)}`,
          type: taskType,
          harvestedAt: new Date().toISOString()
        };

        harvested.push(task);
        backlog.queue.push(task);
        queuedIssueKeys.add(key);
        console.log(`  + Harvested [${key}] [Type: ${taskType}]: ${issue.title.slice(0, 55)}...`);
      }
    }
  }

  saveJSON(BACKLOG_PATH, backlog);
  console.log(`[HARVESTER COMPLETE] Added ${harvested.length} candidate tasks. Total backlog queue: ${backlog.queue.length}\n`);
  return harvested;
}

if (process.argv[1] && process.argv[1].endsWith('issue-harvester.mjs')) {
  harvestIssues();
}
