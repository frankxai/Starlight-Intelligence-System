#!/usr/bin/env node
/**
 * Starlight Queen v2.0 — General Intelligence Spec-Evolution & IDE Bridge Studio
 *
 * Bridges the gap between passive visual snapshots and closed-loop General Intelligence:
 * 1. Inspects all 30 real local source code files across `C:/Users/frank/starlight/repos/*`
 *    alongside their live DOM telemetry & SHA-256 visual receipts.
 * 2. Generates 30 Living Executable Markdown Specs (`docs/superpowers/specs/estate-surfaces/*.spec.md`)
 *    and 30 bidirectional Spec-Trace sidecars (`memory/spec-trace/*.md`).
 * 3. Builds and opens the interactive **Starlight Spec-Intelligence & IDE Workbench**
 *    (`2026-10-18__Antigravity-Gemini3.1Pro__Spec-Intelligence-IDE-Studio.html`) with:
 *    - 1-click `vscode://file/<path>:<line>:1` & `cursor://file/<path>:<line>:1` deep links
 *      to both the exact component source file AND the Living `.spec.md` file
 *    - 5-Axis Cognitive Spec Rubric & Code-Grounded Bottleneck Diagnosis
 *    - Live Interactive Spec v2.0 -> v2.1 Co-Architect & Agent Dispatch Compiler (`Spec: <spec-id>`)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as http from 'node:http';
import { spawn, exec } from 'node:child_process';
import { QueenSpecIntelligenceEngine } from '../../src/queen/spec-intelligence-engine.ts';

const DATE_STAMP = '2026-10-18';
const AGENT_TAG = 'Antigravity-Gemini3.1Pro';
const WORKTREE_ROOT =
  process.env.STARLIGHT_WORKTREE_ROOT ||
  'C:/Users/frank/starlight/worktrees/sis-queen-sovereign-20261018';
const ARTIFACT_DIR =
  process.env.STARLIGHT_ARTIFACT_DIR ||
  'C:/Users/frank/.gemini/antigravity-cli/brain/5dc42c9a-4558-47e1-b558-9dbf8e467317';
const COMMAND_CENTER_DIR = 'C:/Users/frank/starlight/command-center';
const ONEDRIVE_SNAPSHOT_DIR = path.join(
  'C:/Users/frank/OneDrive/Starlight Creative Vault/01_ESTATE_SNAPSHOTS',
  DATE_STAMP
);

const EDGE_PATHS = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];

function findEdgeBinary() {
  for (const p of EDGE_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Microsoft Edge binary not found');
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchText(url, timeoutMs = 2000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

async function ensureCdpHubOn9223() {
  try {
    const ws = (await fetchText('http://127.0.0.1:9223/wsEndpoint', 1200)).trim();
    if (ws.startsWith('ws://')) {
      return { wsEndpoint: ws, cleanup: async () => {} };
    }
  } catch {}

  const edgeBin = findEdgeBinary();
  const profileDir = path.join(process.env.TEMP || 'C:/Temp', `starlight-spec-cdp-${Date.now()}`);
  fs.mkdirSync(profileDir, { recursive: true });

  const edgeProc = spawn(
    edgeBin,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--remote-debugging-port=9224',
      '--remote-allow-origins=*',
      '--window-size=1920,1080',
      `--user-data-dir=${profileDir}`,
      'about:blank',
    ],
    { stdio: 'ignore', windowsHide: true }
  );

  let upstreamWs = '';
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    try {
      const v = JSON.parse(await fetchText('http://127.0.0.1:9224/json/version', 1200));
      if (v.webSocketDebuggerUrl) {
        upstreamWs = v.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }
  if (!upstreamWs) throw new Error('Failed to start headless Edge on :9224');

  const hubServer = http.createServer((req, res) => {
    if (req.url === '/wsEndpoint') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(upstreamWs);
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', wsEndpoint: upstreamWs }));
  });

  await new Promise((resolve) => hubServer.listen(9223, '127.0.0.1', resolve));

  return {
    wsEndpoint: upstreamWs,
    cleanup: async () => {
      try {
        hubServer.close();
      } catch {}
      try {
        edgeProc.kill();
      } catch {}
    },
  };
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.nextId = 1;
    this.pending = new Map();
  }
  async connect() {
    await new Promise((resolve, reject) => {
      const ws = new WebSocket(this.wsUrl);
      this.ws = ws;
      ws.onopen = () => resolve();
      ws.onerror = (e) => reject(e);
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(String(ev.data));
          if (msg.id && this.pending.has(msg.id)) {
            const p = this.pending.get(msg.id);
            this.pending.delete(msg.id);
            if (msg.error) p.reject(new Error(msg.error.message));
            else p.resolve(msg.result);
          }
        } catch {}
      };
    });
  }
  send(method, params = {}, sessionId = undefined) {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.pending.set(id, { resolve, reject });
      const payload = { id, method, params };
      if (sessionId) payload.sessionId = sessionId;
      this.ws.send(JSON.stringify(payload));
    });
  }
  close() {
    try {
      this.ws?.close();
    } catch {}
  }
}

function buildSpecStudioHtml(snapshot, imgBaseRelPath) {
  const payloadJson = JSON.stringify(snapshot);
  const allSpecsDirVscode = `vscode://file/${snapshot.specsDirectory}/README.md:1:1`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>[Antigravity · Gemini 3.1 Pro] Starlight General Intelligence Spec & IDE Studio (${DATE_STAMP})</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

    :root {
      --bg: #05070d;
      --panel: #0b101d;
      --panel-2: #101729;
      --border: rgba(148, 163, 184, 0.2);
      --gold: #fcd34d;
      --cyan: #38bdf8;
      --emerald: #34d399;
      --purple: #c084fc;
      --rose: #fb7185;
      --text: #f8fafc;
      --muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #060911; }
    ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
    html, body {
      height: 100vh;
      overflow: hidden;
      background: radial-gradient(circle at 15% 0%, #131d38 0%, #060911 55%, #04060b 100%);
      color: var(--text);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      display: flex;
      flex-direction: column;
    }
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 20px;
      background: rgba(9, 13, 24, 0.92);
      border-bottom: 1px solid var(--border);
      backdrop-filter: blur(16px);
      gap: 14px;
    }
    .brand-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .pulse {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--emerald);
      box-shadow: 0 0 12px var(--emerald);
    }
    .brand-title {
      font-weight: 900;
      font-size: 14px;
      letter-spacing: 0.4px;
    }
    .serif-tag {
      font-family: 'Instrument Serif', Georgia, serif;
      font-style: italic;
      font-size: 18px;
      color: var(--gold);
      font-weight: 400;
    }
    .pill {
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 999px;
      letter-spacing: 0.4px;
      white-space: nowrap;
    }
    .pill.gold { background: rgba(252, 211, 77, 0.14); border: 1px solid rgba(252, 211, 77, 0.45); color: var(--gold); }
    .pill.cyan { background: rgba(56, 189, 248, 0.14); border: 1px solid rgba(56, 189, 248, 0.45); color: var(--cyan); }
    .pill.purple { background: rgba(192, 132, 252, 0.16); border: 1px solid rgba(192, 132, 252, 0.45); color: #e9d5ff; }
    .pill.emerald { background: rgba(52, 211, 153, 0.14); border: 1px solid rgba(52, 211, 153, 0.45); color: var(--emerald); }

    .top-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ide-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 11.5px;
      font-weight: 800;
      text-decoration: none;
      cursor: pointer;
      border: 1px solid var(--border);
      background: #131c31;
      color: var(--text);
      transition: all 0.15s;
    }
    .ide-btn:hover { border-color: var(--cyan); transform: translateY(-1px); }
    .ide-btn.gold-btn { background: linear-gradient(135deg, #d4af37, #b48a1e); color: #000; border-color: #fcd34d; }
    .ide-btn.cyan-btn { background: rgba(56, 189, 248, 0.16); color: var(--cyan); border-color: rgba(56, 189, 248, 0.5); }
    .ide-btn.purple-btn { background: rgba(168, 85, 247, 0.18); color: #e9d5ff; border-color: rgba(168, 85, 247, 0.5); }
    .ide-btn.emerald-btn { background: rgba(16, 185, 129, 0.18); color: #6ee7b7; border-color: rgba(16, 185, 129, 0.5); }

    .workbench {
      flex: 1;
      display: grid;
      grid-template-columns: 330px 1fr 480px;
      overflow: hidden;
    }

    /* Left Sidebar: 30 Surfaces + Spec Scores */
    .sidebar {
      background: rgba(9, 13, 24, 0.86);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .sidebar-hdr {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .search-input {
      width: 100%;
      background: #060911;
      border: 1px solid var(--border);
      color: var(--text);
      padding: 7px 10px;
      border-radius: 7px;
      font-size: 12px;
    }
    .surface-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .s-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 9px;
      border: 1px solid transparent;
      cursor: pointer;
      background: rgba(15, 23, 42, 0.45);
      transition: all 0.12s;
    }
    .s-item:hover { background: rgba(30, 41, 59, 0.65); }
    .s-item.active {
      background: rgba(56, 189, 248, 0.13);
      border-color: rgba(56, 189, 248, 0.55);
    }
    .s-left {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }
    .s-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 5px;
      background: rgba(252, 211, 77, 0.18);
      color: var(--gold);
    }
    .s-meta { min-width: 0; }
    .s-brand {
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: var(--cyan);
    }
    .s-title {
      font-size: 11.5px;
      font-weight: 700;
      color: #e2e8f0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .s-score {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 800;
      padding: 3px 7px;
      border-radius: 6px;
      background: rgba(16, 185, 129, 0.16);
      color: var(--emerald);
      border: 1px solid rgba(16, 185, 129, 0.35);
    }

    /* Center Stage: Visual + Source Code X-Ray + IDE Bridge */
    .center-stage {
      padding: 14px 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      overflow-y: auto;
    }
    .ide-action-bar {
      background: linear-gradient(145deg, rgba(16, 24, 44, 0.95), rgba(10, 15, 29, 0.95));
      border: 1px solid rgba(56, 189, 248, 0.35);
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }
    .file-locus {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .file-kicker {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--gold);
    }
    .file-path-mono {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: var(--cyan);
      font-weight: 700;
    }
    .ide-btn-group {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .ast-pills-row {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
    }
    .ast-box {
      background: rgba(13, 19, 34, 0.9);
      border: 1px solid var(--border);
      border-radius: 9px;
      padding: 8px 10px;
    }
    .ast-lbl {
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: var(--muted);
    }
    .ast-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12.5px;
      font-weight: 800;
      color: #fff;
      margin-top: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .browser-frame {
      flex: 1;
      min-height: 460px;
      background: #060911;
      border: 1px solid rgba(252, 211, 77, 0.38);
      border-radius: 14px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7);
    }
    .browser-bar {
      background: #0d1424;
      padding: 8px 14px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .dots { display: flex; gap: 6px; }
    .dot { width: 10px; height: 10px; border-radius: 50%; }
    .dot.r { background: #ef4444; }
    .dot.y { background: #f59e0b; }
    .dot.g { background: #10b981; }
    .b-url {
      flex: 1;
      background: #060911;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 4px 10px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--cyan);
    }
    .browser-img-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #04060a;
      overflow: hidden;
      padding: 6px;
    }
    .browser-img-wrap img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 6px;
    }

    /* Right Panel: Living Spec Co-Architect & Spec-Trace Dispatcher */
    .spec-panel {
      background: rgba(9, 13, 24, 0.92);
      border-left: 1px solid var(--border);
      padding: 14px 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .spec-card {
      background: rgba(15, 22, 40, 0.92);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 14px;
    }
    .spec-card h3 {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .rubric-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .r-item {
      display: grid;
      grid-template-columns: 155px 1fr 42px;
      align-items: center;
      gap: 8px;
      font-size: 11.5px;
    }
    .r-bar-bg {
      height: 7px;
      background: #060911;
      border-radius: 999px;
      overflow: hidden;
      border: 1px solid rgba(148, 163, 184, 0.15);
    }
    .r-bar-fill {
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, #38bdf8, #34d399);
    }
    .r-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 800;
      text-align: right;
      color: var(--gold);
    }

    .req-box {
      background: rgba(7, 10, 19, 0.85);
      border-left: 3px solid var(--cyan);
      border-radius: 8px;
      padding: 9px 11px;
      margin-bottom: 8px;
    }
    .req-hdr {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 800;
      color: var(--cyan);
      margin-bottom: 4px;
    }
    .req-title {
      font-size: 12.5px;
      font-weight: 800;
      color: #fff;
      margin-bottom: 4px;
    }
    .req-desc {
      font-size: 11.5px;
      color: #cbd5e1;
      line-height: 1.45;
    }
    .req-gate {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--emerald);
      margin-top: 5px;
    }

    .evolve-input {
      width: 100%;
      background: #060911;
      border: 1px solid rgba(252, 211, 77, 0.4);
      color: var(--text);
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 12px;
      margin-bottom: 8px;
      font-family: inherit;
    }
    .prompt-pre {
      background: #05070d;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 9px 11px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px;
      color: #e2e8f0;
      white-space: pre-wrap;
      max-height: 150px;
      overflow-y: auto;
      line-height: 1.45;
    }
  </style>
</head>
<body>
  <header class="topbar">
    <div class="brand-row">
      <span class="pulse"></span>
      <span class="brand-title">STARLIGHT GENERAL INTELLIGENCE</span>
      <span class="serif-tag">Living Spec &amp; IDE Evolution Studio</span>
      <span class="pill gold">ESTATE SPEC SCORE: ${snapshot.averageCompositeScore} / 100</span>
      <span class="pill cyan">${snapshot.verifiedSourceFilesCount} / ${snapshot.totalSurfaces} SOURCE FILES VERIFIED</span>
      <span class="pill purple">✍️ ENGINE: ANTIGRAVITY (GEMINI 3.1 PRO)</span>
    </div>
    <div class="top-actions">
      <a class="ide-btn cyan-btn" href="${allSpecsDirVscode}">📂 Open All 30 Living Specs Index in IDE</a>
      <button class="ide-btn emerald-btn" onclick="copyActiveDispatchPrompt()">📋 Copy Spec-Trace Agent Prompt</button>
      <button class="ide-btn gold-btn" onclick="downloadActiveSpecMarkdown()">⬇️ Download Evolved .spec.md</button>
    </div>
  </header>

  <div class="workbench">
    <aside class="sidebar">
      <div class="sidebar-hdr">
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;font-weight:800;color:var(--muted);">
          <span>30 SURFACES · LIVING SPECS v2.0</span>
          <span style="color:var(--emerald);">${snapshot.totalSpecV2Requirements} REQS</span>
        </div>
        <input id="searchBox" class="search-input" placeholder="Filter by surface, brand, repo, or intent..." oninput="renderSidebar()" />
      </div>
      <div class="surface-list" id="surfaceList"></div>
    </aside>

    <main class="center-stage">
      <div class="ide-action-bar">
        <div class="file-locus">
          <span class="file-kicker" id="activeIntentBadge">FOUNDER INTENT</span>
          <span class="file-path-mono" id="activeSourcePath">C:/Users/frank/...</span>
        </div>
        <div class="ide-btn-group">
          <a id="btnOpenSourceVscode" class="ide-btn gold-btn" href="#">💻 Open Source in VS Code / Antigravity</a>
          <a id="btnOpenSourceCursor" class="ide-btn cyan-btn" href="#">⚡ Open Source in Cursor</a>
          <a id="btnOpenSpecVscode" class="ide-btn purple-btn" href="#">📝 Edit Living .spec.md in IDE</a>
          <a id="btnOpenLiveUrl" class="ide-btn" href="#" target="_blank">🌐 Open Live Surface</a>
        </div>
      </div>

      <div class="ast-pills-row">
        <div class="ast-box">
          <div class="ast-lbl">Source File Status</div>
          <div class="ast-val" id="astFileStatus" style="color:var(--emerald);">VERIFIED</div>
        </div>
        <div class="ast-box">
          <div class="ast-lbl">Code Footprint</div>
          <div class="ast-val" id="astLines">0 lines</div>
        </div>
        <div class="ast-box">
          <div class="ast-lbl">Exported Symbols</div>
          <div class="ast-val" id="astExports">default</div>
        </div>
        <div class="ast-box">
          <div class="ast-lbl">Maker → Checker</div>
          <div class="ast-val" id="astHarnesses" style="color:var(--cyan);">Antigravity → Codex</div>
        </div>
        <div class="ast-box">
          <div class="ast-lbl">A11y / Skip-Link</div>
          <div class="ast-val" id="astA11y" style="color:var(--emerald);">PASS</div>
        </div>
        <div class="ast-box">
          <div class="ast-lbl">Spec-Trace ID</div>
          <div class="ast-val" id="astSpecId" style="color:var(--gold);">spec-surface-01</div>
        </div>
      </div>

      <div class="browser-frame">
        <div class="browser-bar">
          <div class="dots">
            <span class="dot r"></span>
            <span class="dot y"></span>
            <span class="dot g"></span>
          </div>
          <div class="b-url" id="browserUrlBar">http://127.0.0.1:4329/</div>
          <span class="pill emerald" id="browserShaPill">SHA-256 VERIFIED</span>
        </div>
        <div class="browser-img-wrap">
          <img id="surfaceScreenshot" src="" alt="Surface Preview" />
        </div>
      </div>
    </main>

    <aside class="spec-panel">
      <div class="spec-card" style="border-color:rgba(252,211,77,0.4);">
        <h3 style="color:var(--gold);">
          <span>5-Axis Cognitive Spec Rubric</span>
          <span id="rubricTotalBadge" class="pill gold">94.5 / 100 (S)</span>
        </h3>
        <div class="rubric-row" id="rubricBars"></div>
      </div>

      <div class="spec-card">
        <h3 style="color:var(--rose);">
          <span>Code &amp; DOM Diagnosis (Why Upgrade)</span>
          <span id="surfaceAuthorBadge" style="color:var(--purple);font-size:10px;">Lead: Antigravity</span>
        </h3>
        <p id="diagText" style="font-size:12px;color:#e2e8f0;line-height:1.45;margin-bottom:8px;"></p>
        <ul id="bottleneckList" style="padding-left:16px;font-size:11.5px;color:#fda4af;line-height:1.5;"></ul>
      </div>

      <div class="spec-card" style="border-color:rgba(56,189,248,0.4);">
        <h3 style="color:var(--cyan);">
          <span>Living Spec v2.0 Requirements</span>
          <span id="specVerBadge" class="pill cyan">v2.0.0</span>
        </h3>
        <div id="reqsContainer"></div>

        <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);">
          <div style="font-size:10.5px;font-weight:800;color:var(--gold);margin-bottom:5px;">
            ⚡ CO-ARCHITECT &amp; EVOLVE SPEC (WRITES v2.1 REQUIREMENT + DISPATCH PACKET)
          </div>
          <input id="customSpecInput" class="evolve-input" placeholder="Add new architectural, UI/UX, or conversion requirement to this spec..." />
          <div style="display:flex;gap:6px;">
            <button class="ide-btn gold-btn" style="flex:1;justify-content:center;" onclick="evolveActiveSpec()">
              ✨ Synthesize &amp; Evolve Spec (+0.8 Score)
            </button>
            <button class="ide-btn cyan-btn" onclick="autoSuggestSpecUpgrade()">
              🧠 AI Suggest
            </button>
          </div>
        </div>
      </div>

      <div class="spec-card">
        <h3 style="color:var(--emerald);">
          <span>Spec-Trace Agent Dispatch Packet</span>
          <button class="ide-btn emerald-btn" style="padding:3px 8px;font-size:10px;" onclick="copyActiveDispatchPrompt()">Copy /goal Packet</button>
        </h3>
        <pre class="prompt-pre" id="dispatchPromptBox"></pre>
      </div>
    </aside>
  </div>

  <script>
    const SNAPSHOT = ${payloadJson};
    const IMG_BASE = ${JSON.stringify(imgBaseRelPath)};
    let activeIdx = 0;

    function renderSidebar() {
      const q = (document.getElementById('searchBox').value || '').toLowerCase();
      const container = document.getElementById('surfaceList');
      container.innerHTML = SNAPSHOT.surfaces
        .map((s, idx) => {
          const hay = (s.title + ' ' + s.brand + ' ' + s.repo + ' ' + s.founderIntent).toLowerCase();
          if (q && !hay.includes(q)) return '';
          return \`
            <div class="s-item \${idx === activeIdx ? 'active' : ''}" onclick="selectSurface(\${idx})">
              <div class="s-left">
                <span class="s-num">\${s.surfaceNum}</span>
                <div class="s-meta">
                  <div class="s-brand">\${s.brand} · v\${s.specVersion}</div>
                  <div class="s-title">\${s.title}</div>
                </div>
              </div>
              <span class="s-score">\${s.rubric.compositeScore}</span>
            </div>
          \`;
        })
        .join('');
    }

    function selectSurface(idx) {
      activeIdx = idx;
      renderSidebar();
      const s = SNAPSHOT.surfaces[idx];
      if (!s) return;

      document.getElementById('activeIntentBadge').textContent = s.founderIntent + ' · ' + s.strategicObjective;
      document.getElementById('activeSourcePath').textContent =
        s.sourceInspection.sourceFileAbsPath + ':' + s.sourceInspection.targetEditLine;

      document.getElementById('btnOpenSourceVscode').href = s.sourceInspection.vscodeUri;
      document.getElementById('btnOpenSourceCursor').href = s.sourceInspection.cursorUri;
      document.getElementById('btnOpenSpecVscode').href = s.specVscodeUri;
      document.getElementById('btnOpenLiveUrl').href = s.url;

      document.getElementById('astFileStatus').textContent = s.sourceInspection.existsOnDisk
        ? 'ON-DISK VERIFIED'
        : 'REMOTE / ORG';
      document.getElementById('astLines').textContent =
        s.sourceInspection.lineCount + ' lines (' + Math.round(s.sourceInspection.byteSize / 1024) + ' KB)';
      document.getElementById('astExports').textContent =
        s.sourceInspection.exportedSymbols.join(', ') || 'default page';
      document.getElementById('astHarnesses').textContent =
        s.makerHarness.split(' ')[0] + ' → ' + s.checkerHarness.split(' ')[0];
      document.getElementById('astA11y').textContent =
        (s.sourceInspection.hasSkipLink ? 'SkipLink✓ ' : '') +
        (s.sourceInspection.hasSemanticMain ? '<main>✓ ' : '') +
        'DOM:' + s.domStats.sections + 's';
      document.getElementById('astSpecId').textContent = s.specId;

      document.getElementById('browserUrlBar').textContent = s.url;
      document.getElementById('browserShaPill').textContent = 'SHA-256: ' + s.sha256VisualReceipt.slice(0, 12);
      document.getElementById('surfaceScreenshot').src = IMG_BASE + '/' + s.surfaceId + '.png';

      document.getElementById('rubricTotalBadge').textContent =
        s.rubric.compositeScore + ' / 100 (' + s.rubric.grade + ')';

      const bars = [
        ['1. Intent Fidelity', s.rubric.intentFidelity],
        ['2. Visual & Typography', s.rubric.designAndTypography],
        ['3. A11y & DOM Hygiene', s.rubric.accessibilityAndDom],
        ['4. Source Architecture', s.rubric.sourceCodeArchitecture],
        ['5. Spec-Trace & CTA', s.rubric.specTraceAndConversion],
      ];
      document.getElementById('rubricBars').innerHTML = bars
        .map(
          ([label, val]) => \`
          <div class="r-item">
            <span>\${label}</span>
            <div class="r-bar-bg"><div class="r-bar-fill" style="width:\${val}%"></div></div>
            <span class="r-val">\${val}</span>
          </div>
        \`
        )
        .join('');

      document.getElementById('surfaceAuthorBadge').textContent = 'Lead: ' + s.authorAgent;
      document.getElementById('diagText').textContent = s.executiveDiagnosis;
      document.getElementById('bottleneckList').innerHTML = s.detectedBottlenecks
        .map((b) => \`<li>\${b}</li>\`)
        .join('');

      document.getElementById('specVerBadge').textContent = 'v' + s.specVersion;
      document.getElementById('reqsContainer').innerHTML = s.specV2Requirements
        .map(
          (r) => \`
          <div class="req-box">
            <div class="req-hdr">
              <span>\${r.reqId} · \${r.dimension}</span>
              <a href="\${s.sourceInspection.vscodeUri}" style="color:var(--gold);text-decoration:none;">Open line \${r.targetLine} ↗</a>
            </div>
            <div class="req-title">\${r.title}</div>
            <div class="req-desc">\${r.targetSpecV2}</div>
            <div class="req-gate">Gate: \${r.verificationGate}</div>
          </div>
        \`
        )
        .join('');

      document.getElementById('dispatchPromptBox').textContent = s.agentDispatchPrompt;
    }

    function autoSuggestSpecUpgrade() {
      const s = SNAPSHOT.surfaces[activeIdx];
      const suggestions = [
        \`Add interactive telemetry drawer in \${s.sourceInspection.sourceFileAbsPath.split('/').pop()} bound to Spec: \${s.specId} with sub-50ms state hydration.\`,
        \`Enforce WCAG AAA contrast ratio (>=7:1) and keyboard shortcut navigation across all \${s.domStats.sections} sections of \${s.brand}.\`,
        \`Bind live receipt attestation badge (Built on SIP v1.1.1) and 1-click template fork CTA above the 900px viewport fold.\`,
      ];
      const pick = suggestions[s.specV2Requirements.length % suggestions.length];
      document.getElementById('customSpecInput').value = pick;
    }

    async function evolveActiveSpec() {
      const s = SNAPSHOT.surfaces[activeIdx];
      const input = document.getElementById('customSpecInput');
      let directive = input.value.trim();
      if (!directive) {
        autoSuggestSpecUpgrade();
        directive = input.value.trim();
      }
      const nextMinor = Number((s.specVersion.split('.')[1] || 0)) + 1;
      s.specVersion = \`2.\${nextMinor}.0\`;
      s.rubric.compositeScore = Math.min(100, Number((s.rubric.compositeScore + 0.8).toFixed(1)));
      const newReq = {
        reqId: \`REQ-\${s.surfaceNum}-\${s.specV2Requirements.length + 1}\`,
        dimension: 'ARCHITECTURE',
        title: directive.slice(0, 76),
        targetFile: s.sourceInspection.sourceFileAbsPath,
        targetLine: s.sourceInspection.targetEditLine,
        currentState: 'Verified live baseline.',
        targetSpecV2: directive,
        verificationGate: s.specV2Requirements[0]?.verificationGate || 'npm test && npm run build',
      };
      s.specV2Requirements.unshift(newReq);
      s.agentDispatchPrompt = [
        \`/goal Execute Living Spec \${s.specId} (v\${s.specVersion}) for \${s.title}\`,
        \`Target Source File: \${s.sourceInspection.sourceFileAbsPath}:\${s.sourceInspection.targetEditLine}\`,
        \`Spec File: \${s.specMarkdownPath}\`,
        \`Maker Harness: \${s.makerHarness} | Independent Checker: \${s.checkerHarness}\`,
        \`Requirements:\`,
        ...s.specV2Requirements.map(
          (r) => \`  - [\${r.reqId}] \${r.title}: \${r.targetSpecV2} (Verify: \${r.verificationGate})\`
        ),
        \`Commit Trailer Required: Spec: \${s.specId}\`,
      ].join('\\n');

      // Also POST to local Queen v2.0 server if running
      try {
        await fetch('http://127.0.0.1:4329/api/queen/spec-evolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ surfaceId: s.surfaceId, directive }),
        });
      } catch {}

      input.value = '';
      selectSurface(activeIdx);
    }

    function copyActiveDispatchPrompt() {
      const s = SNAPSHOT.surfaces[activeIdx];
      navigator.clipboard.writeText(s.agentDispatchPrompt);
      alert('Copied Spec-Trace /goal Dispatch Packet for ' + s.specId + ' to clipboard!');
    }

    function downloadActiveSpecMarkdown() {
      const s = SNAPSHOT.surfaces[activeIdx];
      const blob = new Blob([s.agentDispatchPrompt], { type: 'text/markdown;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = s.surfaceId + '.spec.md';
      a.click();
    }

    selectSurface(0);
  </script>
</body>
</html>`;
}

async function main() {
  console.log('[Spec-Intelligence] Inspecting all 30 estate surfaces & local source files...');
  const engine = new QueenSpecIntelligenceEngine(WORKTREE_ROOT);
  const snapshot = engine.getSnapshot(true, true);

  fs.mkdirSync(ONEDRIVE_SNAPSHOT_DIR, { recursive: true });
  fs.mkdirSync(COMMAND_CENTER_DIR, { recursive: true });

  const jsonName = `${DATE_STAMP}__${AGENT_TAG}__Estate-Living-Specs.json`;
  fs.writeFileSync(
    path.join(WORKTREE_ROOT, 'snapshots', jsonName),
    JSON.stringify(snapshot, null, 2),
    'utf8'
  );
  fs.writeFileSync(
    path.join(ONEDRIVE_SNAPSHOT_DIR, jsonName),
    JSON.stringify(snapshot, null, 2),
    'utf8'
  );

  const htmlName = `${DATE_STAMP}__${AGENT_TAG}__Spec-Intelligence-IDE-Studio.html`;
  const artifactHtmlPath = path.join(ARTIFACT_DIR, htmlName);
  const oneDriveHtmlPath = path.join(ONEDRIVE_SNAPSHOT_DIR, htmlName);
  const cmdCenterHtmlPath = path.join(COMMAND_CENTER_DIR, htmlName);

  fs.writeFileSync(artifactHtmlPath, buildSpecStudioHtml(snapshot, '.'), 'utf8');
  fs.writeFileSync(oneDriveHtmlPath, buildSpecStudioHtml(snapshot, '.'), 'utf8');
  fs.writeFileSync(
    cmdCenterHtmlPath,
    buildSpecStudioHtml(snapshot, `./snapshots/${DATE_STAMP}`),
    'utf8'
  );

  console.log(
    `[Spec-Intelligence] Generated 30 Living Specs (.spec.md) + 30 Spec-Trace Sidecars:`
  );
  console.log(`  -> Specs Dir:    ${snapshot.specsDirectory}`);
  console.log(`  -> Sidecars Dir: ${snapshot.sidecarDirectory}`);
  console.log(
    `  -> Verified Local Source Files: ${snapshot.verifiedSourceFilesCount}/${snapshot.totalSurfaces}`
  );
  console.log(`  -> Estate Average GI Spec Score: ${snapshot.averageCompositeScore}/100`);

  // Capture a 1920x1080 visual verification screenshot of the Spec-Intelligence IDE Studio via :9223
  const hub = await ensureCdpHubOn9223();
  const cdp = new CdpClient(hub.wsEndpoint);
  const previewPngName = `${DATE_STAMP}__${AGENT_TAG}__Spec-Intelligence-IDE-Studio.png`;
  try {
    await cdp.connect();
    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
    await cdp.send('Page.enable', {}, sessionId);
    await cdp.send(
      'Emulation.setDeviceMetricsOverride',
      { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false },
      sessionId
    );
    const fileUrl = 'file:///' + artifactHtmlPath.replace(/\\/g, '/');
    await cdp.send('Page.navigate', { url: fileUrl }, sessionId);
    await sleep(1600);
    const shot = await cdp.send(
      'Page.captureScreenshot',
      { format: 'png', fromSurface: true, captureBeyondViewport: false },
      sessionId
    );
    const buf = Buffer.from(shot.data, 'base64');
    fs.writeFileSync(path.join(ARTIFACT_DIR, previewPngName), buf);
    fs.writeFileSync(path.join(ONEDRIVE_SNAPSHOT_DIR, previewPngName), buf);
    try {
      await cdp.send('Target.closeTarget', { targetId });
    } catch {}
  } finally {
    cdp.close();
    await hub.cleanup();
  }

  if (process.argv.includes('--open')) {
    exec(`cmd /c start "" "${cmdCenterHtmlPath.replace(/\//g, '\\')}"`);
  }
}

main().catch((err) => {
  console.error('Fatal error in launch-spec-intelligence-studio:', err);
  process.exit(1);
});
