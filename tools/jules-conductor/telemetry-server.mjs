#!/usr/bin/env node
/**
 * Starlight Jules Live Telemetry & Ops Broadcast Server
 * 
 * Serves real-time telemetry, SSE event streams, OBS moment markers,
 * and an embedded dark obsidian luxury ops dashboard for 24/7 fleet monitoring.
 * 
 * Standards:
 * - Zero external dependencies (native node:http)
 * - @impeccable design: Dark obsidian tactile register (#0a0a0c, border-white/10)
 * - Real-time Server-Sent Events (SSE)
 * - OBS Studio moment buffer webhook hook
 * 
 * Built on SIP — Starlight Intelligence Protocol v1.1.1.
 */

import { createServer } from 'node:http';
import { readFileSync, existsSync, appendFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_DIR = join(__dirname, 'state');
const LEDGER_PATH = join(STATE_DIR, 'ledger.json');
const BACKLOG_PATH = join(STATE_DIR, 'backlog.json');
const LOGS_DIR = join(__dirname, 'logs');
const MOMENTS_PATH = join(LOGS_DIR, 'content-moments.jsonl');

const PORT = parseInt(process.env.JULES_TELEMETRY_PORT || '9191', 10);
const sseClients = new Set();

function loadJSON(p, fallback) {
  try {
    return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : fallback;
  } catch {
    return fallback;
  }
}

export function getTelemetryMetrics() {
  const ledger = loadJSON(LEDGER_PATH, { sessions: {} });
  const backlog = loadJSON(BACKLOG_PATH, { queue: [] });
  const sessions = Object.values(ledger.sessions || {});

  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  const running = sessions.filter(s => s.status === 'RUNNING' || s.state === 'running');
  const verified = sessions.filter(s => s.verified);
  const merged = sessions.filter(s => s.merged);
  const quarantined = sessions.filter(s => s.quarantined);

  const completed24h = sessions.filter(s => {
    const ts = new Date(s.verifiedAt || s.timestamp || 0).getTime();
    return ts >= oneDayAgo && (s.verified || s.merged);
  }).length;

  const mem = process.memoryUsage();
  const rssMb = Math.round(mem.rss / (1024 * 1024));
  const heapMb = Math.round(mem.heapUsed / (1024 * 1024));

  const recentPRs = sessions
    .filter(s => s.prNumber || s.mergedPr)
    .sort((a, b) => new Date(b.lastSeen || b.timestamp || 0) - new Date(a.lastSeen || a.timestamp || 0))
    .slice(0, 15)
    .map(s => ({
      id: s.id,
      repo: s.repo,
      prNumber: s.prNumber || s.mergedPr,
      merged: !!s.merged,
      timestamp: s.lastSeen || s.timestamp
    }));

  return {
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    ram: { rssMb, heapMb, capMb: 120 },
    slots: {
      active: running.length,
      max: 6,
      saturationPct: Math.round((running.length / 6) * 100)
    },
    throughput: {
      completed24h,
      dailyTarget: 300,
      targetProgressPct: Math.round((completed24h / 300) * 100),
      backlogQueue: backlog.queue ? backlog.queue.length : 0
    },
    fleetTotals: {
      totalTracked: sessions.length,
      verified: verified.length,
      merged: merged.length,
      quarantined: quarantined.length
    },
    recentPRs,
    health: rssMb > 110 ? 'HIGH_MEMORY' : (quarantined.length > 5 ? 'DEGRADED' : 'HEALTHY')
  };
}

export function broadcastEvent(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(payload);
    } catch {
      sseClients.delete(res);
    }
  }
}

export function recordContentMoment(moment) {
  if (!existsSync(LOGS_DIR)) mkdirSync(LOGS_DIR, { recursive: true });
  const entry = {
    timestamp: new Date().toISOString(),
    ...moment
  };
  appendFileSync(MOMENTS_PATH, JSON.stringify(entry) + '\n', 'utf8');
  broadcastEvent('moment', entry);
}

const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Starlight Jules Conductor | 24/7 Autonomous Ops</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    :root {
      --bg: #070709;
      --card: #0e0e13;
      --border: rgba(255, 255, 255, 0.08);
      --accent: #6366f1;
      --accent-glow: rgba(99, 102, 241, 0.25);
      --green: #10b981;
      --text: #f3f4f6;
      --muted: #9ca3af;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 24px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 24px;
    }
    .title-group h1 {
      font-size: 1.25rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      background: var(--green);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--green);
    }
    .sub {
      font-size: 0.825rem;
      color: var(--muted);
      margin-top: 2px;
    }
    .badge {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      padding: 4px 10px;
      border-radius: 9999px;
      border: 1px solid var(--border);
      background: var(--card);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 18px;
      position: relative;
      overflow: hidden;
    }
    .card-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted);
      margin-bottom: 6px;
    }
    .card-value {
      font-size: 1.8rem;
      font-weight: 700;
      font-family: var(--font-mono);
      letter-spacing: -0.03em;
    }
    .card-meta {
      font-size: 0.75rem;
      color: var(--muted);
      margin-top: 4px;
    }
    .bar-container {
      margin-top: 8px;
      background: rgba(255, 255, 255, 0.05);
      height: 6px;
      border-radius: 3px;
      overflow: hidden;
    }
    .bar-fill {
      background: var(--accent);
      height: 100%;
      transition: width 0.4s ease;
    }
    .section-title {
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted);
      margin-bottom: 12px;
    }
    .table-container {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }
    th, td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    th {
      color: var(--muted);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    tr:last-child td { border-bottom: none; }
    .status-tag {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-family: var(--font-mono);
    }
    .tag-merged { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .tag-open { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
    .link { color: inherit; text-decoration: none; }
    .link:hover { text-decoration: underline; color: var(--accent); }
  </style>
</head>
<body>
  <div class="header">
    <div class="title-group">
      <h1><span class="pulse-dot"></span> Starlight Jules Autonomous Conductor</h1>
      <div class="sub">24/7 Google AI Ultra Fleet Engine | Built on SIP v1.1.1</div>
    </div>
    <div class="badge" id="health-badge">HEALTHY</div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-label">Concurrent Cloud Slots</div>
      <div class="card-value" id="val-slots">-- / --</div>
      <div class="bar-container"><div class="bar-fill" id="bar-slots" style="width: 0%"></div></div>
      <div class="card-meta" id="meta-slots">Dynamic scaling active</div>
    </div>

    <div class="card">
      <div class="card-label">24h Throughput Velocity</div>
      <div class="card-value" id="val-velocity">--</div>
      <div class="bar-container"><div class="bar-fill" id="bar-target" style="width: 0%"></div></div>
      <div class="card-meta">Daily target: 300 tasks/day</div>
    </div>

    <div class="card">
      <div class="card-label">Memory Footprint (RSS)</div>
      <div class="card-value" id="val-ram">-- MB</div>
      <div class="card-meta">Cap: 120 MB (Low-RAM Native)</div>
    </div>

    <div class="card">
      <div class="card-label">Verified & Auto-Merged</div>
      <div class="card-value" id="val-merged">--</div>
      <div class="card-meta" id="meta-totals">-- sessions tracked</div>
    </div>
  </div>

  <div class="section-title">Recent Autonomous Pull Requests & Merges</div>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Repository</th>
          <th>Pull Request</th>
          <th>Status</th>
          <th>Dispatched</th>
        </tr>
      </thead>
      <tbody id="pr-table-body">
        <tr><td colspan="4" style="color: var(--muted); text-align: center; padding: 24px;">Listening for live events...</td></tr>
      </tbody>
    </table>
  </div>

  <script>
    function updateUI(m) {
      document.getElementById('health-badge').textContent = m.health;
      document.getElementById('val-slots').textContent = m.slots.active + ' / ' + m.slots.max;
      document.getElementById('bar-slots').style.width = m.slots.saturationPct + '%';
      document.getElementById('val-velocity').textContent = m.throughput.completed24h;
      document.getElementById('bar-target').style.width = Math.min(100, m.throughput.targetProgressPct) + '%';
      document.getElementById('val-ram').textContent = m.ram.rssMb + ' MB';
      document.getElementById('val-merged').textContent = m.fleetTotals.merged;
      document.getElementById('meta-totals').textContent = m.fleetTotals.totalTracked + ' sessions (' + m.throughput.backlogQueue + ' in backlog)';

      const tbody = document.getElementById('pr-table-body');
      if (m.recentPRs && m.recentPRs.length > 0) {
        tbody.innerHTML = m.recentPRs.map(p => \`
          <tr>
            <td><strong>\${p.repo}</strong></td>
            <td><a class="link" target="_blank" href="https://github.com/\${p.repo}/pull/\${p.prNumber}">PR #\${p.prNumber}</a></td>
            <td><span class="status-tag \${p.merged ? 'tag-merged' : 'tag-open'}">\${p.merged ? 'MERGED' : 'OPEN'}</span></td>
            <td style="color: var(--muted); font-family: var(--font-mono); font-size: 0.75rem;">\${p.timestamp ? new Date(p.timestamp).toLocaleTimeString() : '--'}</td>
          </tr>
        \`).join('');
      }
    }

    async function fetchStatus() {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const data = await res.json();
          updateUI(data);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchStatus();
    setInterval(fetchStatus, 5000);

    const sse = new EventSource('/api/events');
    sse.addEventListener('tick', (e) => {
      try { updateUI(JSON.parse(e.data)); } catch {}
    });
    sse.addEventListener('moment', (e) => {
      console.log('Content Moment Captured:', e.data);
    });
  </script>
</body>
</html>
`;

export function startTelemetryServer(port = PORT) {
  const server = createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (url.pathname === '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(getTelemetryMetrics(), null, 2));
      return;
    }

    if (url.pathname === '/api/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });
      res.write(': connected\n\n');
      sseClients.add(res);

      req.on('close', () => {
        sseClients.delete(res);
      });
      return;
    }

    if (url.pathname === '/api/webhook/obs' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          recordContentMoment(parsed);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'recorded', moment: parsed }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // Default: Root Dashboard HTML
    if (url.pathname === '/' || url.pathname === '/dashboard') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(DASHBOARD_HTML);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });

  server.on('error', (err) => {
    console.error(`[TELEMETRY SERVER ERROR] ${err.message}`);
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`[TELEMETRY] Starlight Jules Live Ops HUD active at http://localhost:${port}`);
  });

  return server;
}

if (process.argv[1] && process.argv[1].endsWith('telemetry-server.mjs')) {
  startTelemetryServer();
}
