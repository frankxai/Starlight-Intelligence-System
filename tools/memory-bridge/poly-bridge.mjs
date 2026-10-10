#!/usr/bin/env node
/**
 * poly-bridge.mjs — Starlight Multi-Harness Cross-Transcript Bridge & SSE Stream
 * 
 * Aggregates and streams real-time prompts, reasoning, and tool executions
 * across OpenAI Codex, Claude Code, OpenCode, Grok, and Kilo Code.
 * 
 * Usage:
 *   node tools/memory-bridge/poly-bridge.mjs --recent 10   (show last 10 events across all harnesses)
 *   node tools/memory-bridge/poly-bridge.mjs --watch       (live console tail streaming)
 *   node tools/memory-bridge/poly-bridge.mjs --serve 7318  (start lightweight SSE/HTTP daemon)
 *   node tools/memory-bridge/poly-bridge.mjs --json        (output raw JSONL)
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOME = os.homedir();
const CODEX_HISTORY = path.join(HOME, '.codex', 'history.jsonl');
const CLAUDE_HISTORY = path.join(HOME, '.claude', 'history.jsonl');
const OPENCODE_DB = path.join(HOME, '.local', 'share', 'opencode', 'opencode.db');

export const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

const args = process.argv.slice(2);
const isWatch = args.includes('--watch');
const isJson = args.includes('--json');
const isServe = args.includes('--serve') || args.includes('-s');
const servePort = parseInt(args.find(a => a.startsWith('--port='))?.split('=')[1] || (args.includes('--serve') ? args[args.indexOf('--serve') + 1] : null) || '7318', 10);
const recentLimit = parseInt(args.find(a => a.startsWith('--recent='))?.split('=')[1] || (args.includes('--recent') ? args[args.indexOf('--recent') + 1] : null) || '10', 10);

export function readCodex(limit = 10) {
  if (!fs.existsSync(CODEX_HISTORY)) return [];
  try {
    const lines = fs.readFileSync(CODEX_HISTORY, 'utf8').trim().split('\n').filter(Boolean);
    return lines.slice(-limit).map(l => {
      try {
        const item = JSON.parse(l);
        return {
          harness: 'codex',
          sessionId: item.session_id,
          timestamp: item.ts ? item.ts * 1000 : Date.now(),
          text: item.text,
          type: 'prompt'
        };
      } catch { return null; }
    }).filter(Boolean);
  } catch { return []; }
}

export function readClaude(limit = 10) {
  if (!fs.existsSync(CLAUDE_HISTORY)) return [];
  try {
    const lines = fs.readFileSync(CLAUDE_HISTORY, 'utf8').trim().split('\n').filter(Boolean);
    return lines.slice(-limit).map(l => {
      try {
        const item = JSON.parse(l);
        return {
          harness: 'claude',
          sessionId: item.sessionId,
          timestamp: item.timestamp || Date.now(),
          text: item.display,
          project: item.project,
          type: 'prompt'
        };
      } catch { return null; }
    }).filter(Boolean);
  } catch { return []; }
}

export function readOpenCode(limit = 10) {
  if (!fs.existsSync(OPENCODE_DB)) return [];
  try {
    const db = new DatabaseSync(OPENCODE_DB, { readOnly: true });
    const rows = db.prepare(`
      SELECT p.session_id, p.time_created, p.data, s.title, s.directory, s.model
      FROM part p
      JOIN session s ON p.session_id = s.id
      ORDER BY p.time_created DESC
      LIMIT ?
    `).all(limit);
    db.close();

    return rows.map(r => {
      try {
        const data = JSON.parse(r.data);
        return {
          harness: 'opencode',
          sessionId: r.session_id,
          timestamp: r.time_created,
          text: data.text || (data.type === 'reasoning' ? `[Reasoning: ${(data.text || '').slice(0, 120)}...]` : `[${data.type}]`),
          title: r.title,
          directory: r.directory,
          type: data.type || 'message'
        };
      } catch { return null; }
    }).filter(Boolean);
  } catch { return []; }
}

export function getAllEvents(limit = 15) {
  const codex = readCodex(limit);
  const claude = readClaude(limit);
  const opencode = readOpenCode(limit);

  const combined = [...codex, ...claude, ...opencode];
  combined.sort((a, b) => b.timestamp - a.timestamp);
  return combined.slice(0, limit);
}

export function formatEvent(e) {
  const time = new Date(e.timestamp).toLocaleTimeString();
  let badge = `${C.bold}[${e.harness.toUpperCase()}]${C.reset}`;
  if (e.harness === 'codex') badge = `${C.green}${C.bold}[CODEX]${C.reset}`;
  if (e.harness === 'claude') badge = `${C.yellow}${C.bold}[CLAUDE]${C.reset}`;
  if (e.harness === 'opencode') badge = `${C.cyan}${C.bold}[OPENCODE]${C.reset}`;

  const cleanText = (e.text || '').replace(/\r?\n/g, ' ').slice(0, 180);
  return `${C.dim}${time}${C.reset} ${badge} ${cleanText}${cleanText.length >= 180 ? '...' : ''}`;
}

function startServer(port = 7318) {
  const clients = new Set();
  let lastSeen = Date.now() - 60_000;

  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);

    if (url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        service: 'starlight-poly-bridge',
        port,
        clients: clients.size,
        harnesses: ['codex', 'claude', 'opencode'],
        timestamp: new Date().toISOString()
      }));
      return;
    }

    if (url.pathname === '/recent') {
      const limit = parseInt(url.searchParams.get('limit') || '20', 10);
      const events = getAllEvents(limit);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(events, null, 2));
      return;
    }

    if (url.pathname === '/stream') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });
      res.write(`data: ${JSON.stringify({ type: 'connected', time: Date.now() })}\n\n`);

      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not_found', availableRoutes: ['/health', '/recent', '/stream'] }));
  });

  server.listen(port, '127.0.0.1', () => {
    console.log(`\n${C.cyan}${C.bold}STARLIGHT POLY-BRIDGE: SSE Daemon Listening on http://127.0.0.1:${port}${C.reset}`);
    console.log(`${C.dim}  • SSE Stream: http://127.0.0.1:${port}/stream\n  • Recent JSON: http://127.0.0.1:${port}/recent\n  • Health Check: http://127.0.0.1:${port}/health${C.reset}\n`);
  });

  // Polling loop that pushes SSE to all connected clients
  setInterval(() => {
    if (clients.size === 0) return;
    const newEvents = getAllEvents(10).filter(e => e.timestamp > lastSeen).reverse();
    for (const event of newEvents) {
      lastSeen = Math.max(lastSeen, event.timestamp);
      const payload = `data: ${JSON.stringify(event)}\n\n`;
      for (const client of clients) {
        client.write(payload);
      }
    }
  }, 1200);
}

async function main() {
  if (isServe) {
    startServer(isNaN(servePort) ? 7318 : servePort);
    return;
  }

  if (!isWatch) {
    const events = getAllEvents(recentLimit).reverse();
    if (isJson) {
      console.log(JSON.stringify(events, null, 2));
    } else {
      console.log(`\n${C.bold}════════ STARLIGHT POLY-BRIDGE: RECENT HARNESS ACTIVITY ════════${C.reset}\n`);
      for (const e of events) {
        console.log(formatEvent(e));
      }
      console.log(`\n${C.dim}Live monitoring: node tools/memory-bridge/poly-bridge.mjs --watch${C.reset}`);
      console.log(`${C.dim}SSE Daemon:      node tools/memory-bridge/poly-bridge.mjs --serve 7318${C.reset}\n`);
    }
    return;
  }

  console.log(`\n${C.cyan}${C.bold}STARLIGHT POLY-BRIDGE: Real-Time Harness Monitor Active${C.reset}`);
  console.log(`${C.dim}Listening to Codex, Claude Code, and OpenCode transcripts... (Ctrl+C to stop)${C.reset}\n`);

  let lastSeen = Date.now() - 30_000;

  setInterval(() => {
    const events = getAllEvents(10).filter(e => e.timestamp > lastSeen).reverse();
    for (const e of events) {
      console.log(formatEvent(e));
      lastSeen = Math.max(lastSeen, e.timestamp);
    }
  }, 1500);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  main().catch(console.error);
}
