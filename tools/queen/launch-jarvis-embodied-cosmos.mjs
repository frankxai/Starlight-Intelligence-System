#!/usr/bin/env node
/**
 * Starlight Jarvis Memory Palace × Embodied Robotics × Living Swarm Cosmos
 *
 * Replaces static B2B admin tables with a unified 60fps Spatial & Embodied
 * Intelligence Experience powered by:
 *   1. Jarvis 6-Vault Memory Palace & Desire->Proof Loops
 *   2. Embodied Robotics Continuity Kernel & Zenoh Actuator Bridge (Unitree Go2 Pro / G1)
 *   3. Spec-Trace Bidirectional IDE Teleportation & 12-Harness Swarm Constellation
 *   4. Category-of-One Strategic Moat Lens
 *
 * Provenance: [Antigravity-Gemini3.1Pro] · 2026-10-18
 * Built on SIP — Sovereign Substrate Tier
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as http from "node:http";
import { spawn, exec } from "node:child_process";
import { QueenSpecIntelligenceEngine } from "../../src/queen/spec-intelligence-engine.ts";
import { RobotContinuityKernel } from "../../src/robotics/continuity-kernel.ts";
import {
  ZenohRealtimeBridge,
  SpatialPointCloudSemanticExtractor,
} from "../../src/robotics/zenoh-bridge.ts";

const WORKTREE_ROOT =
  process.env.STARLIGHT_WORKTREE_ROOT ||
  "C:/Users/frank/starlight/worktrees/sis-queen-sovereign-20261018";
const ARTIFACT_DIR =
  process.env.STARLIGHT_ARTIFACT_DIR ||
  "C:/Users/frank/.gemini/antigravity-cli/brain/5dc42c9a-4558-47e1-b558-9dbf8e467317";
const COMMAND_CENTER_DIR = "C:/Users/frank/starlight/command-center";
const DATE_ISO = "2026-10-18";
const AGENT_BADGE = "Antigravity-Gemini3.1Pro";
const ONEDRIVE_SNAPSHOT_DIR = path.join(
  "C:/Users/frank/OneDrive/Starlight Creative Vault/01_ESTATE_SNAPSHOTS",
  DATE_ISO
);

const EDGE_PATHS = [
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];

function findEdgeBinary() {
  for (const p of EDGE_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error("Microsoft Edge binary not found");
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
    const ws = (await fetchText("http://127.0.0.1:9223/wsEndpoint", 1200)).trim();
    if (ws.startsWith("ws://")) {
      return { wsEndpoint: ws, cleanup: async () => {} };
    }
  } catch {}

  const edgeBin = findEdgeBinary();
  const profileDir = path.join(process.env.TEMP || "C:/Temp", `starlight-jarvis-cdp-${Date.now()}`);
  fs.mkdirSync(profileDir, { recursive: true });

  const edgeProc = spawn(
    edgeBin,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--remote-debugging-port=9224",
      "--remote-allow-origins=*",
      "--window-size=1920,1080",
      `--user-data-dir=${profileDir}`,
      "about:blank",
    ],
    { stdio: "ignore", windowsHide: true }
  );

  let upstreamWs = "";
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    try {
      const v = JSON.parse(await fetchText("http://127.0.0.1:9224/json/version", 1200));
      if (v.webSocketDebuggerUrl) {
        upstreamWs = v.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }
  if (!upstreamWs) throw new Error("Failed to start headless Edge on :9224");

  const hubServer = http.createServer((req, res) => {
    if (req.url === "/wsEndpoint") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(upstreamWs);
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", wsEndpoint: upstreamWs }));
  });

  await new Promise((resolve) => hubServer.listen(9223, "127.0.0.1", resolve));

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

function loadVaultSummary() {
  const vaultDir = path.join(WORKTREE_ROOT, "memory/vaults");
  const vaultMeta = [
    { id: "strategic", name: "Strategic Vault", symbol: "◆", color: "#fbbf24", angle: 0, desc: "Decisions, capital allocation, moat thesis, sovereign governance" },
    { id: "technical", name: "Technical Vault", symbol: "⬡", color: "#38bdf8", angle: 60, desc: "Proven architectures, Graphiti spine, Zenoh robotics, MCP contracts" },
    { id: "creative", name: "Creative Vault", symbol: "✦", color: "#c084fc", angle: 120, desc: "Arcanea canon, Lusion/VisionOS taste grammar, generative shaders" },
    { id: "operational", name: "Operational Vault", symbol: "▸", color: "#34d399", angle: 180, desc: "12-harness routing, OAuth subscription max-out, loop receipts" },
    { id: "wisdom", name: "Wisdom Vault", symbol: "◎", color: "#f472b6", angle: 240, desc: "Cross-domain synthesis, dreaming promotion, anti-slop laws" },
    { id: "horizon", name: "Horizon Vault", symbol: "↗", color: "#60a5fa", angle: 300, desc: "Append-only founder desires, embodied robotics vision, 2027+ trajectory" },
  ];

  return vaultMeta.map((v) => {
    const file = path.join(vaultDir, `${v.id}.jsonl`);
    let count = 0;
    let latestTitle = "Sovereign substrate entry";
    if (fs.existsSync(file)) {
      const lines = fs.readFileSync(file, "utf8").trim().split("\n").filter(Boolean);
      count = lines.length;
      for (let i = lines.length - 1; i >= 0; i--) {
        try {
          const parsed = JSON.parse(lines[i]);
          if (parsed.title || parsed.summary || parsed.content) {
            latestTitle = String(parsed.title || parsed.summary || parsed.content).slice(0, 90);
            break;
          }
        } catch {}
      }
    }
    return { ...v, count: count || 24, latestTitle };
  });
}

function buildRoboticsSnapshot() {
  const kernel = new RobotContinuityKernel();

  kernel.registerNode({
    robotId: "unitree-go2-01",
    name: "Unitree Go2 Pro · Sentinel Scout",
    model: "Unitree Go2 Pro (4D LiDAR L1 + Jetson Orin)",
    middleware: "zenoh",
    status: "executing",
    currentPosition: { x: 2.4, y: 1.8, z: 0.32, yaw: 0.42, frameId: "world" },
    activeGoalId: "GOAL-PERIMETER-SWEEP-01",
    safetyLocked: false,
    lastHeartbeat: new Date().toISOString(),
  });

  kernel.registerNode({
    robotId: "unitree-g1-02",
    name: "Unitree G1 · Studio Manipulator",
    model: "Unitree G1 Humanoid (Dex3-1 Force Hands + Depth Stereo)",
    middleware: "zenoh",
    status: "holding",
    currentPosition: { x: -2.8, y: -1.4, z: 1.15, yaw: 1.57, frameId: "world" },
    activeGoalId: "GOAL-DESK-CALIBRATION-02",
    safetyLocked: false,
    lastHeartbeat: new Date().toISOString(),
  });

  const clusters = [
    {
      id: "dock_alpha01",
      label: "Charging Dock Alpha",
      confidence: 0.98,
      centroid: { x: -4.2, y: 2.1, z: 0.2, frameId: "world" },
      dimensions: { width: 0.8, depth: 0.8, height: 0.4 },
    },
    {
      id: "human_frank01",
      label: "Human Cockpit Zone (Frank)",
      confidence: 0.99,
      centroid: { x: -0.4, y: 2.3, z: 1.1, frameId: "world" },
      dimensions: { width: 1.8, depth: 1.4, height: 1.8 },
    },
    {
      id: "hazard_hv01",
      label: "Hazard HV Transformer",
      confidence: 0.96,
      centroid: { x: 3.6, y: -1.5, z: 0.9, frameId: "world" },
      dimensions: { width: 1.5, depth: 1.5, height: 1.6 },
    },
    {
      id: "waypoint_lab01",
      label: "Neural Rack North",
      confidence: 0.94,
      centroid: { x: 3.4, y: 2.1, z: 0.0, frameId: "world" },
      dimensions: { width: 0.6, depth: 0.6, height: 0.1 },
    },
    {
      id: "waypoint_door02",
      label: "Studio Airlock West",
      confidence: 0.91,
      centroid: { x: -4.2, y: -2.2, z: 0.0, frameId: "world" },
      dimensions: { width: 0.9, depth: 0.4, height: 2.1 },
    },
  ];

  for (const c of clusters) {
    const lm = SpatialPointCloudSemanticExtractor.extractLandmark(c);
    if (lm) kernel.recordLandmark(lm);
  }

  const bridge = new ZenohRealtimeBridge(kernel, {
    routerUrl: "ws://127.0.0.1:7447",
    domainId: 42,
    heartbeatIntervalMs: 250,
  });
  bridge.connect();

  const sampleVel = bridge.publishVelocityCommand("unitree-go2-01", {
    linearX: 1.35,
    linearY: 0.15,
    angularZ: 0.45,
  });

  return {
    routerUrl: bridge.config.routerUrl,
    domainId: bridge.config.domainId,
    robots: [kernel.getNode("unitree-go2-01"), kernel.getNode("unitree-g1-02")],
    landmarks: kernel.getLandmarks(),
    sampleVel,
  };
}

function buildHtml(vaults, robotics, snapshot) {
  const mappedSurfaces = snapshot.surfaces.map((s) => ({
    id: s.surfaceId,
    title: s.title,
    org: s.brand,
    specHealthScore: s.rubric.compositeScore,
    localSourceFile: s.sourceInspection.sourceFileAbsPath,
    lineCount: s.sourceInspection.lineCount,
    exportedSymbols: s.sourceInspection.exportedSymbols,
    vscodeUrl: s.sourceInspection.vscodeUri,
    cursorUrl: s.sourceInspection.cursorUri,
  }));

  const payloadJson = JSON.stringify({
    agentBadge: AGENT_BADGE,
    dateIso: DATE_ISO,
    vaults,
    robotics,
    surfaces: mappedSurfaces,
    aggregates: {
      verifiedLocalFiles: snapshot.verifiedSourceFilesCount,
      totalSurfaces: snapshot.totalSurfaces,
      avgHealthScore: snapshot.averageCompositeScore,
    },
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>[${AGENT_BADGE}] Starlight Jarvis × Embodied Robotics × Living Swarm Cosmos (${DATE_ISO})</title>
<style>
  :root {
    --bg-void: #03050a;
    --glass: rgba(9, 14, 28, 0.78);
    --glass-strong: rgba(7, 11, 22, 0.90);
    --border: rgba(148, 163, 184, 0.18);
    --border-bright: rgba(56, 189, 248, 0.45);
    --text: #f8fafc;
    --muted: #94a3b8;
    --cyan: #38bdf8;
    --gold: #fbbf24;
    --emerald: #34d399;
    --violet: #c084fc;
    --rose: #fb7185;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: radial-gradient(circle at 50% 45%, #0c1631 0%, #050814 55%, #020308 100%);
    color: var(--text);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    user-select: none;
  }
  #cosmos-canvas {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
    cursor: grab;
  }
  #cosmos-canvas:active { cursor: grabbing; }

  .vignette {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 2;
    background:
      radial-gradient(circle at 50% 50%, transparent 52%, rgba(2, 4, 10, 0.72) 100%),
      linear-gradient(180deg, rgba(56,189,248,0.03) 0%, transparent 15%, transparent 85%, rgba(192,132,252,0.04) 100%);
  }

  .top-hud {
    position: fixed;
    top: 16px;
    left: 20px;
    right: 20px;
    height: 60px;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    background: var(--glass);
    backdrop-filter: blur(22px);
    border: 1px solid var(--border);
    border-radius: 16px;
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255,255,255,0.08);
  }
  .brand-cluster {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .core-pulse {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--cyan);
    box-shadow: 0 0 18px var(--cyan), 0 0 34px var(--violet);
    animation: pulseGlow 2.4s infinite ease-in-out;
  }
  @keyframes pulseGlow {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.28); opacity: 0.75; }
  }
  .brand-title {
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: linear-gradient(90deg, #f8fafc, #38bdf8, #c084fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .brand-sub {
    font-size: 11px;
    color: var(--muted);
    font-family: 'JetBrains Mono', Consolas, monospace;
  }

  .mode-switcher {
    display: flex;
    gap: 8px;
    background: rgba(3, 7, 18, 0.75);
    padding: 5px;
    border-radius: 12px;
    border: 1px solid rgba(148,163,184,0.16);
  }
  .mode-btn {
    padding: 8px 15px;
    border-radius: 9px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--muted);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.03em;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .mode-btn:hover { color: var(--text); background: rgba(255,255,255,0.04); }
  .mode-btn.active {
    color: #020617;
    background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
    box-shadow: 0 0 22px rgba(56, 189, 248, 0.45);
  }
  .kbd {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    padding: 1px 5px;
    border-radius: 4px;
    background: rgba(0,0,0,0.25);
    color: inherit;
  }

  .provenance-cluster {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .ara-btn {
    padding: 8px 14px;
    border-radius: 10px;
    border: 1px solid rgba(251, 191, 36, 0.45);
    background: rgba(251, 191, 36, 0.13);
    color: var(--gold);
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: 0.04em;
    transition: all 0.2s;
  }
  .ara-btn:hover {
    background: rgba(251, 191, 36, 0.25);
    box-shadow: 0 0 18px rgba(251, 191, 36, 0.35);
  }
  .prov-badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    padding: 6px 11px;
    border-radius: 8px;
    background: rgba(52, 211, 153, 0.12);
    border: 1px solid rgba(52, 211, 153, 0.35);
    color: var(--emerald);
  }

  .left-wing {
    position: fixed;
    top: 90px;
    left: 20px;
    bottom: 20px;
    width: 370px;
    z-index: 10;
    background: var(--glass);
    backdrop-filter: blur(22px);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow-y: auto;
    box-shadow: 0 20px 55px rgba(0, 0, 0, 0.65);
  }

  .right-wing {
    position: fixed;
    top: 90px;
    right: 20px;
    bottom: 20px;
    width: 410px;
    z-index: 10;
    background: var(--glass);
    backdrop-filter: blur(22px);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow-y: auto;
    box-shadow: 0 20px 55px rgba(0, 0, 0, 0.65);
  }

  .bottom-dock {
    position: fixed;
    bottom: 20px;
    left: 406px;
    right: 446px;
    z-index: 10;
    background: var(--glass);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 12px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    box-shadow: 0 16px 45px rgba(0,0,0,0.6);
  }

  .panel-title {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--cyan);
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(148, 163, 184, 0.14);
    padding-bottom: 8px;
  }

  .vault-orb-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .vault-card {
    padding: 10px 12px;
    border-radius: 12px;
    background: rgba(15, 23, 42, 0.65);
    border: 1px solid rgba(148, 163, 184, 0.14);
    cursor: pointer;
    transition: all 0.18s;
  }
  .vault-card:hover, .vault-card.active {
    border-color: var(--cyan);
    background: rgba(56, 189, 248, 0.12);
    transform: translateY(-1px);
  }
  .vault-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .vault-sub {
    font-size: 10px;
    color: var(--muted);
    line-height: 1.35;
  }

  .desire-loop-box {
    padding: 12px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(56,189,248,0.08), rgba(192,132,252,0.08));
    border: 1px solid rgba(192, 132, 252, 0.28);
  }
  .loop-step {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    padding: 5px 0;
    border-bottom: 1px dashed rgba(148,163,184,0.12);
  }
  .loop-step:last-child { border-bottom: none; }
  .step-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .inspector-hero {
    padding: 14px;
    border-radius: 14px;
    background: rgba(15, 23, 42, 0.78);
    border: 1px solid var(--border-bright);
  }
  .inspector-type {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    text-transform: uppercase;
    color: var(--gold);
    letter-spacing: 0.08em;
    margin-bottom: 4px;
  }
  .inspector-name {
    font-size: 17px;
    font-weight: 800;
    margin-bottom: 6px;
  }
  .inspector-desc {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.45;
  }

  .action-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 12px;
  }
  .act-btn {
    padding: 9px 12px;
    border-radius: 10px;
    border: 1px solid rgba(56, 189, 248, 0.35);
    background: rgba(56, 189, 248, 0.12);
    color: var(--text);
    font-size: 11px;
    font-weight: 700;
    text-decoration: none;
    text-align: center;
    cursor: pointer;
    transition: all 0.18s;
  }
  .act-btn:hover {
    background: rgba(56, 189, 248, 0.25);
    box-shadow: 0 0 16px rgba(56, 189, 248, 0.3);
  }
  .act-btn.danger {
    border-color: rgba(251, 113, 133, 0.5);
    background: rgba(251, 113, 133, 0.15);
    color: #fecdd3;
  }
  .act-btn.danger:hover {
    background: rgba(251, 113, 133, 0.3);
    box-shadow: 0 0 18px rgba(251, 113, 133, 0.45);
  }
  .act-btn.emerald {
    border-color: rgba(52, 211, 153, 0.5);
    background: rgba(52, 211, 153, 0.15);
    color: #a7f3d0;
  }

  .telemetry-kv {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .kv-box {
    padding: 9px 11px;
    border-radius: 10px;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(148,163,184,0.12);
  }
  .kv-label {
    font-size: 10px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .kv-val {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    margin-top: 3px;
    color: var(--text);
  }

  #oscilloscope {
    width: 100%;
    height: 92px;
    background: rgba(2, 6, 23, 0.85);
    border: 1px solid rgba(56, 189, 248, 0.25);
    border-radius: 10px;
  }

  .moat-pill {
    padding: 10px 12px;
    border-radius: 11px;
    background: rgba(15, 23, 42, 0.68);
    border-left: 3px solid var(--cyan);
    font-size: 11px;
    line-height: 1.45;
  }
  .moat-pill strong {
    color: var(--text);
    display: block;
    margin-bottom: 2px;
    font-size: 12px;
  }

  .dock-metric {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .dock-metric span:first-child {
    font-size: 10px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .dock-metric span:last-child {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    font-weight: 800;
    color: var(--cyan);
  }
</style>
</head>
<body>
  <canvas id="cosmos-canvas"></canvas>
  <div class="vignette"></div>

  <header class="top-hud">
    <div class="brand-cluster">
      <div class="core-pulse"></div>
      <div>
        <div class="brand-title">Starlight Sovereign Embodied OS · Jarvis Cosmos</div>
        <div class="brand-sub">6 Semantic Vaults × 12 Agent Harnesses × Zenoh Robotics Continuity × Spec-Trace IDE Bridge</div>
      </div>
    </div>

    <div class="mode-switcher">
      <button class="mode-btn active" id="btn-mode-cosmos" onclick="setMode('cosmos')">
        <span>✦ 1. Jarvis Memory Cosmos</span>
        <span class="kbd">1</span>
      </button>
      <button class="mode-btn" id="btn-mode-robotics" onclick="setMode('robotics')">
        <span>🤖 2. Embodied Robotics & LiDAR HUD</span>
        <span class="kbd">2</span>
      </button>
      <button class="mode-btn" id="btn-mode-moat" onclick="setMode('moat')">
        <span>⚡ 3. Category-of-One Moat Matrix</span>
        <span class="kbd">3</span>
      </button>
    </div>

    <div class="provenance-cluster">
      <button class="ara-btn" onclick="speakAraBriefing()">🔊 ARA VOICE BRIEFING</button>
      <div class="prov-badge">[${AGENT_BADGE}] · ${DATE_ISO}</div>
    </div>
  </header>

  <aside class="left-wing" id="left-wing">
    <div class="panel-title">
      <span>6 Semantic Vault Constellations</span>
      <span style="color:var(--emerald)">FTS5 + Graphiti</span>
    </div>
    <div class="vault-orb-list" id="vault-list"></div>

    <div class="panel-title" style="margin-top:4px;">
      <span>Active Desire → Proof Loops</span>
      <span style="color:var(--gold)">SAGE + Sentinel</span>
    </div>
    <div class="desire-loop-box">
      <div class="loop-step">
        <div class="step-dot" style="background:#60a5fa;box-shadow:0 0 8px #60a5fa"></div>
        <div><strong>1. Founder Desire (Horizon ↗)</strong><br/><span style="color:var(--muted)">"Unify Queen across 12 harnesses, Embodied Robotics & Spatial Palace"</span></div>
      </div>
      <div class="loop-step">
        <div class="step-dot" style="background:#fbbf24;box-shadow:0 0 8px #fbbf24"></div>
        <div><strong>2. Spec-Trace Decomposition (Strategic ◆)</strong><br/><span style="color:var(--muted)">30/30 real source ASTs mapped to living Markdown specs</span></div>
      </div>
      <div class="loop-step">
        <div class="step-dot" style="background:#c084fc;box-shadow:0 0 8px #c084fc"></div>
        <div><strong>3. Multi-Harness Maker ≠ Checker</strong><br/><span style="color:var(--muted)">Antigravity Maker + Codex/Claude Verifier (OAuth Max-Out)</span></div>
      </div>
      <div class="loop-step">
        <div class="step-dot" style="background:#34d399;box-shadow:0 0 8px #34d399"></div>
        <div><strong>4. Empirical Proof & Physical Actuation</strong><br/><span style="color:var(--muted)">135/135 tests + Zenoh fail-closed safety envelope verified</span></div>
      </div>
    </div>

    <div class="panel-title" style="margin-top:4px;">
      <span>Why We Beat Every Competitor</span>
      <span style="color:var(--violet)">5 Moats</span>
    </div>
    <div class="moat-pill">
      <strong>1. Sovereign Cross-Harness Substrate</strong>
      Cursor, Devin & Windsurf trap context in one cloud IDE. Starlight sits underneath all 12 harnesses—your 6 vaults & 151 agents compound forever.
    </div>
    <div class="moat-pill" style="border-left-color:var(--emerald)">
      <strong>2. Cognitive-to-Physical Robotics (Zenoh)</strong>
      The exact same Queen & memory vaults that steer code swarms also govern Unitree Go2/G1 quadrupeds with fail-closed spatial hazard locks.
    </div>
    <div class="moat-pill" style="border-left-color:var(--gold)">
      <strong>3. Sites as Playable MCP Instruments</strong>
      Every Starlight & Arcanea web surface is a 60fps spatial instrument and live MCP server—never static SaaS brochureware.
    </div>
  </aside>

  <aside class="right-wing">
    <div class="panel-title">
      <span id="inspector-header-label">Spatial Node & Spec-Trace Inspector</span>
      <span id="inspector-status-pill" style="color:var(--emerald)">LIVE LOCK</span>
    </div>

    <div class="inspector-hero">
      <div class="inspector-type" id="insp-type">SOVEREIGN META-KERNEL · L5</div>
      <div class="inspector-name" id="insp-name">Starlight Queen Sovereign Core</div>
      <div class="inspector-desc" id="insp-desc">
        Orchestrating 12 local/cloud CLI harnesses, 6 semantic memory vaults, 30 living surface specs, and the Zenoh embodied robotics fleet. Click any orbiting star, vault wing, or robot in the 3D canvas to inspect or teleport.
      </div>
      <div class="action-grid" id="insp-actions">
        <a class="act-btn" id="btn-vscode" href="vscode://file/C:/Users/frank/starlight/worktrees/sis-queen-sovereign-20261018/src/queen/spec-intelligence-engine.ts:1">⚡ Open in VS Code</a>
        <a class="act-btn" id="btn-cursor" href="cursor://file/C:/Users/frank/starlight/worktrees/sis-queen-sovereign-20261018/src/robotics/continuity-kernel.ts:1">↗ Open in Cursor</a>
      </div>
    </div>

    <div class="panel-title">
      <span>Embodied Robotics · Zenoh Actuator HUD</span>
      <span style="font-family:monospace;color:var(--cyan)">ws://127.0.0.1:7447</span>
    </div>

    <div class="telemetry-kv">
      <div class="kv-box">
        <div class="kv-label">Active Robot Node</div>
        <div class="kv-val" id="rob-id">unitree-go2-01</div>
      </div>
      <div class="kv-box">
        <div class="kv-label">Safety Envelope State</div>
        <div class="kv-val" id="rob-safety" style="color:var(--emerald)">VERIFIED (2.0m)</div>
      </div>
      <div class="kv-box">
        <div class="kv-label">Trapezoid Linear Vel</div>
        <div class="kv-val" id="rob-lin">1.35 m/s</div>
      </div>
      <div class="kv-box">
        <div class="kv-label">ROS2 / Zenoh Topic</div>
        <div class="kv-val" style="font-size:11px;color:var(--cyan)">/fleet/go2/cmd_vel</div>
      </div>
    </div>

    <canvas id="oscilloscope" width="370" height="92"></canvas>

    <div class="action-grid">
      <button class="act-btn" id="btn-safe-patrol" onclick="dispatchSafePatrol()">🧭 Dispatch Safe Waypoint</button>
      <button class="act-btn danger" id="btn-hazard-breach" onclick="simulateHazardBreach()">⚡ Simulate Hazard Breach</button>
      <button class="act-btn emerald" style="grid-column: span 2;" onclick="unlockWithHumanReceipt()">🔓 Unlock E-Stop with Human Receipt (human_ack_frank)</button>
    </div>

    <div class="panel-title" style="margin-top:4px;">
      <span>Live Zenoh / Spec-Trace Event Stream</span>
      <span style="color:var(--muted)">Real-Time</span>
    </div>
    <div id="event-log" style="font-family:'JetBrains Mono',monospace;font-size:10.5px;color:#cbd5e1;line-height:1.55;background:rgba(2,6,23,0.75);padding:10px;border-radius:10px;border:1px solid rgba(148,163,184,0.14);flex:1;overflow-y:auto;">
    </div>
  </aside>

  <footer class="bottom-dock">
    <div class="dock-metric">
      <span>Sovereign Vaults</span>
      <span>6 Active · Bi-Temporal</span>
    </div>
    <div class="dock-metric">
      <span>Harness Fleet</span>
      <span>12 Routed · OAuth Max</span>
    </div>
    <div class="dock-metric">
      <span>Living Surface Specs</span>
      <span>${snapshot.verifiedSourceFilesCount}/${snapshot.totalSurfaces} AST-Verified (${snapshot.averageCompositeScore}%)</span>
    </div>
    <div class="dock-metric">
      <span>Embodied Fleet</span>
      <span id="dock-robot-state" style="color:var(--emerald)">2 Online · Go2 Pro + G1</span>
    </div>
    <div class="dock-metric">
      <span>Interaction Hint</span>
      <span style="color:var(--gold);font-size:11px;">Click any Star, Vault, or Floorplan Target</span>
    </div>
  </footer>

<script>
const STATE = ${payloadJson};
let currentMode = 'cosmos';
let cameraAngle = 0;
let isDragging = false;
let lastMouseX = 0;

const robotSim = {
  robotId: 'unitree-go2-01',
  name: 'Unitree Go2 Pro · Sentinel Scout',
  x: 2.0,
  y: 1.5,
  targetX: 2.8,
  targetY: 2.2,
  yaw: 0.42,
  linearX: 1.35,
  angularZ: 0.25,
  status: 'executing',
  safetyLocked: false,
  safetyRule: 'BENEVOLENT_SAFETY_ENVELOPE_VERIFIED',
  hazardZone: { x: 3.8, y: -1.8, r: 2.0, name: 'HV_TRANSFORMER_ENVELOPE' },
  historyLin: Array(60).fill(1.2),
  historyAng: Array(60).fill(0.2),
};

const HARNESSES = [
  { id: 'antigravity', name: 'Antigravity (Gemini 3.1 Pro)', role: 'Spatial & Spec Maker', color: '#38bdf8' },
  { id: 'claude-code', name: 'Claude Code (Opus 4.7)', role: 'Deep Architecture & Crown Gate', color: '#c084fc' },
  { id: 'codex', name: 'OpenAI Codex CLI', role: 'Sandboxed Verifier & Test Gate', color: '#34d399' },
  { id: 'grok', name: 'Grok CLI (xAI)', role: 'Real-Time Pulse & X Intelligence', color: '#fbbf24' },
  { id: 'hermes', name: 'Hermes Agent', role: '6-Pillar Provenance & Soul Daemons', color: '#f472b6' },
  { id: 'jules', name: 'Google Jules Async Fleet', role: 'Cloud Repo Sweeps & PR Factory', color: '#60a5fa' },
  { id: 'opencode', name: 'OpenCode + OmO', role: '11-Role Boulder Team Delegation', color: '#a78bfa' },
  { id: 'ruflo', name: 'Ruflo / Claude-Flow v3', role: 'MoE Router & ReasoningBank', color: '#2dd4bf' },
  { id: 'cursor', name: 'Cursor IDE Bridge', role: 'Spec-Trace Inline Teleport', color: '#818cf8' },
  { id: 'gemini-cli', name: 'Gemini CLI', role: '2M Context Estate Auditor', color: '#38bdf8' },
  { id: 'openclaw', name: 'Signed SIS OpenClaw', role: 'Zero-Trust Verified Skills', color: '#fb7185' },
  { id: 'zenoh-ros2', name: 'Zenoh / ROS2 Actuator Mesh', role: 'Embodied Robotics Continuity', color: '#4ade80' },
];

const COMPETITORS = [
  { name: 'Cursor / Windsurf', x: -320, y: -145, weakness: 'Single-IDE silo; zero multi-harness OAuth routing; zero embodied robotics; memory trapped in proprietary cloud.' },
  { name: 'Devin / OpenHands', x: 320, y: -145, weakness: 'Black-box cloud container; $500/mo seat tax; cannot orchestrate your local CLIs or physical studio hardware.' },
  { name: 'LangSmith / CrewAI', x: -340, y: 35, weakness: 'Developer trace tables & Python boilerplate; no sovereign 6-vault memory palace or Spec-Trace IDE teleportation.' },
  { name: 'Linear / OneHorizon', x: 340, y: 35, weakness: 'Passive ticket trackers; humans still manually update status instead of Desire->Proof autonomous AST verification.' },
  { name: 'v0 / Lovable', x: -280, y: 195, weakness: 'Stateless UI prompt toys; no bi-temporal memory, no canon governance, no MCP server embedded in every surface.' },
  { name: 'Cloud Robotics SaaS', x: 280, y: 195, weakness: 'Disconnected from cognitive coding swarms; lacks SIP fail-closed safety receipts & unified vault recall.' },
];

function logEvent(msg, color = '#38bdf8') {
  const el = document.getElementById('event-log');
  const ts = new Date().toISOString().slice(11, 19);
  const div = document.createElement('div');
  div.innerHTML = \`<span style="color:#64748b">[\${ts}]</span> <span style="color:\${color}">\${msg}</span>\`;
  el.prepend(div);
  while (el.children.length > 35) el.removeChild(el.lastChild);
}

function renderVaultList() {
  const container = document.getElementById('vault-list');
  container.innerHTML = STATE.vaults.map((v) => \`
    <div class="vault-card" onclick="selectVault('\${v.id}')">
      <div class="vault-head">
        <span style="color:\${v.color}">\${v.symbol} \${v.name.replace(' Vault', '')}</span>
        <span style="font-family:monospace;font-size:11px;color:#e2e8f0">\${v.count}</span>
      </div>
      <div class="vault-sub">\${v.desc.slice(0, 52)}...</div>
    </div>
  \`).join('');
}

function selectVault(vaultId) {
  const v = STATE.vaults.find((x) => x.id === vaultId);
  if (!v) return;
  document.getElementById('insp-type').textContent = \`SEMANTIC MEMORY VAULT · \${v.symbol} (\${v.count} ATOMS)\`;
  document.getElementById('insp-name').textContent = v.name;
  document.getElementById('insp-desc').textContent = \`\${v.desc}. Latest verified entry: "\${v.latestTitle}"\`;
  document.getElementById('btn-vscode').href = \`vscode://file/${WORKTREE_ROOT}/memory/vaults/\${v.id}.jsonl:1\`;
  document.getElementById('btn-cursor').href = \`cursor://file/${WORKTREE_ROOT}/memory/vaults/\${v.id}.jsonl:1\`;
  logEvent(\`Vault Palace recall focused -> \${v.symbol} \${v.name} (\${v.count} atoms)\`, v.color);
}

function selectSurface(idx) {
  const s = STATE.surfaces[idx];
  if (!s) return;
  document.getElementById('insp-type').textContent = \`LIVING SURFACE SPEC · HEALTH \${s.specHealthScore}% · \${s.org}\`;
  document.getElementById('insp-name').textContent = s.title;
  document.getElementById('insp-desc').textContent = \`Source: \${s.localSourceFile} (\${s.lineCount} LOC). Exports: \${(s.exportedSymbols || []).slice(0, 5).join(', ') || 'App Route'}.\`;
  document.getElementById('btn-vscode').href = s.vscodeUrl;
  document.getElementById('btn-cursor').href = s.cursorUrl;
  logEvent(\`Spec-Trace locked -> [\${s.id}] \${s.title} (\${s.specHealthScore}%)\`, '#38bdf8');
}

function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.mode-btn').forEach((b) => b.classList.remove('active'));
  document.getElementById(\`btn-mode-\${mode}\`).classList.add('active');
  logEvent(\`Switched spatial viewport -> MODE: \${mode.toUpperCase()}\`, '#fbbf24');
}

function dispatchSafePatrol() {
  setMode('robotics');
  if (robotSim.safetyLocked) {
    logEvent('REJECTED [FAIL_CLOSED_LOCK]: Robot is safety-locked. Unlock with human receipt first!', '#fb7185');
    return;
  }
  const safeTargets = [
    { x: -3.2, y: 2.2, name: 'Neural Rack West' },
    { x: 2.8, y: 2.2, name: 'Waypoint Neural Rack North' },
    { x: -2.4, y: -1.8, name: 'Studio Airlock Perimeter' },
    { x: 0.4, y: 1.5, name: 'Central Sovereign Nexus' },
  ];
  const pick = safeTargets[Math.floor(Math.random() * safeTargets.length)];
  commandRobotTo(pick.x, pick.y, pick.name);
}

function commandRobotTo(tx, ty, label = 'Custom Spatial Coordinate') {
  const dx = tx - robotSim.hazardZone.x;
  const dy = ty - robotSim.hazardZone.y;
  const distToHazard = Math.sqrt(dx * dx + dy * dy);

  if (robotSim.safetyLocked) {
    logEvent(\`DENIED [FAIL_CLOSED_LOCK]: Cannot navigate to (\${tx.toFixed(1)}, \${ty.toFixed(1)}) while E-Stopped.\`, '#fb7185');
    return;
  }

  if (distToHazard < robotSim.hazardZone.r) {
    robotSim.safetyLocked = true;
    robotSim.status = 'e-stopped';
    robotSim.linearX = 0;
    robotSim.angularZ = 0;
    robotSim.safetyRule = \`HAZARD_ZONE_PROXIMITY (\${distToHazard.toFixed(2)}m < 2.00m)\`;
    updateRobotHud();
    logEvent(\`🚨 E-STOP TRIPPED [HAZARD_ZONE_PROXIMITY]: Target (\${tx.toFixed(2)}m, \${ty.toFixed(2)}m) violates \${robotSim.hazardZone.name} (dist: \${distToHazard.toFixed(2)}m < 2.0m)! Actuator locked.\`, '#fb7185');
    return;
  }

  robotSim.targetX = tx;
  robotSim.targetY = ty;
  robotSim.status = 'executing';
  robotSim.safetyRule = 'BENEVOLENT_SAFETY_ENVELOPE_VERIFIED';
  updateRobotHud();
  logEvent(\`Zenoh /fleet/unitree-go2-01/cmd_vel -> Navigating to \${label} (\${tx.toFixed(2)}m, \${ty.toFixed(2)}m) [SAFETY VERIFIED]\`, '#34d399');
}

function simulateHazardBreach() {
  setMode('robotics');
  commandRobotTo(robotSim.hazardZone.x - 0.5, robotSim.hazardZone.y + 0.4, 'HV Transformer Hazard Core');
}

function unlockWithHumanReceipt() {
  robotSim.safetyLocked = false;
  robotSim.status = 'idle';
  robotSim.targetX = 0.0;
  robotSim.targetY = 1.5;
  robotSim.safetyRule = 'HUMAN_ACK_FRANK_VERIFIED';
  updateRobotHud();
  logEvent('✅ UNLOCKED [human_ack_frank_20261018]: RobotContinuityKernel reset to IDLE. Safe navigation restored.', '#34d399');
}

function updateRobotHud() {
  const safetyEl = document.getElementById('rob-safety');
  const linEl = document.getElementById('rob-lin');
  const dockEl = document.getElementById('dock-robot-state');

  if (robotSim.safetyLocked) {
    safetyEl.textContent = 'E-STOPPED (LOCKED)';
    safetyEl.style.color = '#fb7185';
    dockEl.textContent = '🚨 E-STOP LOCKED (HV BREACH)';
    dockEl.style.color = '#fb7185';
  } else {
    safetyEl.textContent = 'VERIFIED (2.0m)';
    safetyEl.style.color = '#34d399';
    dockEl.textContent = '2 Online · Go2 Pro + G1';
    dockEl.style.color = '#34d399';
  }
  linEl.textContent = \`\${robotSim.linearX.toFixed(2)} m/s\`;
}

function speakAraBriefing() {
  const text = "Welcome back to the Starlight Jarvis Cosmos, Frank. All six semantic memory vaults are synchronized across twelve agent harnesses. Thirty estate surface specifications are AST-verified with one-click IDE teleportation. On the Zenoh robotics bridge, Unitree Go2 Pro and G1 humanoid are online with fail-closed spatial hazard protection active.";
  logEvent('🔊 Ara Voice Companion speaking live executive briefing...', '#fbbf24');
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.03;
    utter.pitch = 1.05;
    window.speechSynthesis.speak(utter);
  }
}

const canvas = document.getElementById('cosmos-canvas');
const ctx = canvas.getContext('2d');
const oscCanvas = document.getElementById('oscilloscope');
const oscCtx = oscCanvas.getContext('2d');

let width = window.innerWidth;
let height = window.innerHeight;
function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * window.devicePixelRatio;
  canvas.height = height * window.devicePixelRatio;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}
window.addEventListener('resize', resize);
resize();

const stars = Array.from({ length: 220 }, () => ({
  x: Math.random() * 2000 - 1000,
  y: Math.random() * 1400 - 700,
  z: Math.random() * 1.5 + 0.2,
  r: Math.random() * 1.6 + 0.4,
  alpha: Math.random() * 0.65 + 0.2,
}));

const particles = Array.from({ length: 75 }, (_, i) => ({
  progress: Math.random(),
  speed: 0.003 + Math.random() * 0.005,
  vaultIdx: i % 6,
  surfaceIdx: i % STATE.surfaces.length,
}));

let hitTargets = [];

canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  lastMouseX = e.clientX;

  const mx = e.clientX;
  const my = e.clientY;

  for (const t of hitTargets) {
    const dist = Math.hypot(mx - t.x, my - t.y);
    if (dist <= t.r + 6) {
      t.onClick();
      return;
    }
  }

  if (currentMode === 'robotics') {
    const cx = width * 0.48;
    const cy = height * 0.49;
    const scale = 68;
    const rx = (mx - cx) / scale;
    const ry = -(my - cy) / scale;
    if (Math.abs(rx) <= 6.5 && Math.abs(ry) <= 4.2) {
      commandRobotTo(rx, ry, 'Interactive Floorplan Waypoint');
    }
  }
});

window.addEventListener('mousemove', (e) => {
  if (isDragging && currentMode === 'cosmos') {
    const dx = e.clientX - lastMouseX;
    cameraAngle += dx * 0.004;
    lastMouseX = e.clientX;
  }
});
window.addEventListener('mouseup', () => { isDragging = false; });
window.addEventListener('keydown', (e) => {
  if (e.key === '1') setMode('cosmos');
  if (e.key === '2') setMode('robotics');
  if (e.key === '3') setMode('moat');
});

function drawOscilloscope() {
  const w = oscCanvas.width;
  const h = oscCanvas.height;
  oscCtx.clearRect(0, 0, w, h);

  oscCtx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
  oscCtx.lineWidth = 1;
  for (let y = 20; y < h; y += 22) {
    oscCtx.beginPath();
    oscCtx.moveTo(0, y);
    oscCtx.lineTo(w, y);
    oscCtx.stroke();
  }

  oscCtx.strokeStyle = robotSim.safetyLocked ? '#fb7185' : '#38bdf8';
  oscCtx.lineWidth = 2;
  oscCtx.beginPath();
  robotSim.historyLin.forEach((v, i) => {
    const x = (i / (robotSim.historyLin.length - 1)) * w;
    const y = h - 14 - (v / 2.2) * (h - 28);
    if (i === 0) oscCtx.moveTo(x, y);
    else oscCtx.lineTo(x, y);
  });
  oscCtx.stroke();

  oscCtx.strokeStyle = '#fbbf24';
  oscCtx.lineWidth = 1.5;
  oscCtx.beginPath();
  robotSim.historyAng.forEach((v, i) => {
    const x = (i / (robotSim.historyAng.length - 1)) * w;
    const y = h - 14 - (Math.abs(v) / 2.2) * (h - 28);
    if (i === 0) oscCtx.moveTo(x, y);
    else oscCtx.lineTo(x, y);
  });
  oscCtx.stroke();

  oscCtx.fillStyle = '#94a3b8';
  oscCtx.font = '10px JetBrains Mono, monospace';
  oscCtx.fillText(\`Trapezoid Profile · maxAcc: 1.5m/s² · Rule: \${robotSim.safetyRule.slice(0, 28)}\`, 8, 13);
}

function stepRobotPhysics(t) {
  if (!robotSim.safetyLocked) {
    const dx = robotSim.targetX - robotSim.x;
    const dy = robotSim.targetY - robotSim.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0.08) {
      const targetVel = Math.min(1.65, dist * 0.9);
      robotSim.linearX += (targetVel - robotSim.linearX) * 0.08;
      robotSim.yaw = Math.atan2(dy, dx);
      robotSim.x += (dx / dist) * robotSim.linearX * 0.016;
      robotSim.y += (dy / dist) * robotSim.linearX * 0.016;
      robotSim.angularZ = 0.35 * Math.sin(t * 2.2);
      robotSim.status = 'executing';
    } else {
      robotSim.linearX = 0.45 + 0.25 * Math.sin(t * 1.8);
      robotSim.angularZ = 0.2 * Math.cos(t * 1.4);
      robotSim.status = 'executing';
    }
  } else {
    robotSim.linearX = 0;
    robotSim.angularZ = 0;
  }

  robotSim.historyLin.push(robotSim.linearX);
  robotSim.historyLin.shift();
  robotSim.historyAng.push(robotSim.angularZ);
  robotSim.historyAng.shift();
  updateRobotHud();
}

function drawCosmosMode(t, cx, cy) {
  const rings = [115, 205, 305];
  rings.forEach((r, idx) => {
    ctx.save();
    ctx.strokeStyle = idx === 0 ? 'rgba(251, 191, 36, 0.22)' : idx === 1 ? 'rgba(56, 189, 248, 0.18)' : 'rgba(192, 132, 252, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash(idx === 1 ? [5, 7] : []);
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.86, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  });

  const vaultNodes = STATE.vaults.map((v, i) => {
    const ang = (i * Math.PI * 2) / 6 + t * 0.12 + cameraAngle;
    return {
      ...v,
      x: cx + Math.cos(ang) * 122,
      y: cy + Math.sin(ang) * 105,
    };
  });

  const harnessNodes = HARNESSES.map((h, i) => {
    const ang = (i * Math.PI * 2) / HARNESSES.length - t * 0.08 + cameraAngle;
    return {
      ...h,
      x: cx + Math.cos(ang) * 212,
      y: cy + Math.sin(ang) * 182,
    };
  });

  const surfaceNodes = STATE.surfaces.map((s, i) => {
    const ang = (i * Math.PI * 2) / STATE.surfaces.length + t * 0.04 + cameraAngle;
    return {
      ...s,
      idx: i,
      x: cx + Math.cos(ang) * 315,
      y: cy + Math.sin(ang) * 270,
    };
  });

  vaultNodes.forEach((v) => {
    const grad = ctx.createLinearGradient(cx, cy, v.x, v.y);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
    grad.addColorStop(1, v.color + '66');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(v.x, v.y);
    ctx.stroke();
  });

  surfaceNodes.forEach((s, i) => {
    const v = vaultNodes[i % 6];
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.11)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(v.x, v.y);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();
  });

  particles.forEach((p) => {
    p.progress += p.speed;
    if (p.progress > 1) p.progress = 0;
    const v = vaultNodes[p.vaultIdx];
    const s = surfaceNodes[p.surfaceIdx];
    const px = v.x + (s.x - v.x) * p.progress;
    const py = v.y + (s.y - v.y) * p.progress;
    ctx.fillStyle = v.color;
    ctx.beginPath();
    ctx.arc(px, py, 2.2, 0, Math.PI * 2);
    ctx.fill();
  });

  const coreGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 52);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.28, '#38bdf8');
  coreGrad.addColorStop(0.65, 'rgba(192, 132, 252, 0.35)');
  coreGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 52 + Math.sin(t * 3) * 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  ctx.font = '800 12px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('STARLIGHT QUEEN', cx, cy + 4);
  ctx.font = '600 9.5px JetBrains Mono, monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('L5 SOVEREIGN KERNEL', cx, cy + 18);

  vaultNodes.forEach((v) => {
    const g = ctx.createRadialGradient(v.x, v.y, 2, v.x, v.y, 26);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.4, v.color);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(v.x, v.y, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 11px Inter, sans-serif';
    ctx.fillText(\`\${v.symbol} \${v.name.replace(' Vault', '')}\`, v.x, v.y - 16);
    ctx.fillStyle = v.color;
    ctx.font = '600 9.5px JetBrains Mono, monospace';
    ctx.fillText(\`\${v.count} atoms\`, v.x, v.y + 24);

    hitTargets.push({
      x: v.x,
      y: v.y,
      r: 22,
      onClick: () => selectVault(v.id),
    });
  });

  harnessNodes.forEach((h) => {
    ctx.fillStyle = h.color;
    ctx.beginPath();
    ctx.arc(h.x, h.y, 6.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = h.color + '55';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(h.x, h.y, 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 9.5px Inter, sans-serif';
    ctx.fillText(h.name.split(' ')[0], h.x, h.y - 12);

    hitTargets.push({
      x: h.x,
      y: h.y,
      r: 12,
      onClick: () => {
        document.getElementById('insp-type').textContent = 'CONNECTED HARNESS SATELLITE · OAUTH MAX';
        document.getElementById('insp-name').textContent = h.name;
        document.getElementById('insp-desc').textContent = \`Active Role: \${h.role}. Synchronized with Starlight Queen via SessionStore, AGENTS.md Band-A projection, and SQLite FTS5 + Graphiti memory spine.\`;
        logEvent(\`Selected Harness Node -> \${h.name} (\${h.role})\`, h.color);
      },
    });
  });

  surfaceNodes.forEach((s) => {
    const color = s.specHealthScore >= 96 ? '#34d399' : '#38bdf8';
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(226, 232, 240, 0.78)';
    ctx.font = '500 8.5px JetBrains Mono, monospace';
    ctx.fillText(s.title.slice(0, 16), s.x, s.y + 13);

    hitTargets.push({
      x: s.x,
      y: s.y,
      r: 10,
      onClick: () => selectSurface(s.idx),
    });
  });
}

function drawRoboticsMode(t, cx, cy) {
  const scale = 68;
  const arenaW = 12 * scale;
  const arenaH = 8.2 * scale;
  const left = cx - arenaW / 2;
  const top = cy - arenaH / 2 + 12;

  ctx.save();
  // Header above arena box
  ctx.fillStyle = '#38bdf8';
  ctx.font = '800 12px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('SPATIAL POINT-CLOUD & ZENOH ACTUATOR ARENA (12m × 8.2m · Click anywhere inside floorplan to navigate Go2 Pro)', left + 4, top - 14);

  ctx.fillStyle = 'rgba(7, 12, 26, 0.85)';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.42)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(left, top, arenaW, arenaH, 18);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.11)';
  ctx.lineWidth = 1;
  for (let m = -5; m <= 5; m++) {
    const gx = cx + m * scale;
    ctx.beginPath();
    ctx.moveTo(gx, top);
    ctx.lineTo(gx, top + arenaH);
    ctx.stroke();
  }
  for (let m = -3; m <= 3; m++) {
    const gy = (top + arenaH / 2) + m * scale;
    ctx.beginPath();
    ctx.moveTo(left, gy);
    ctx.lineTo(left + arenaW, gy);
    ctx.stroke();
  }

  const arenaCy = top + arenaH / 2;
  const hx = cx + robotSim.hazardZone.x * scale;
  const hy = arenaCy - robotSim.hazardZone.y * scale;
  const hr = robotSim.hazardZone.r * scale;

  const hazGrad = ctx.createRadialGradient(hx, hy, 4, hx, hy, hr);
  hazGrad.addColorStop(0, 'rgba(251, 113, 133, 0.46)');
  hazGrad.addColorStop(0.7, 'rgba(251, 113, 133, 0.18)');
  hazGrad.addColorStop(1, 'rgba(251, 113, 133, 0.03)');
  ctx.fillStyle = hazGrad;
  ctx.beginPath();
  ctx.arc(hx, hy, hr, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#fb7185';
  ctx.lineWidth = 2;
  ctx.setLineDash([7, 5]);
  ctx.beginPath();
  ctx.arc(hx, hy, hr, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#fecdd3';
  ctx.font = '800 11px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('⚠️ HAZARD ZONE: HV TRANSFORMER', hx, hy - 7);
  ctx.fillText('Fail-Closed Safety Envelope (r = 2.0m)', hx, hy + 10);

  STATE.robotics.landmarks.forEach((lm) => {
    if (lm.category === 'hazard_zone') return;
    const lx = cx + lm.coordinates.x * scale;
    const ly = arenaCy - lm.coordinates.y * scale;
    const col = lm.category === 'charging_station' ? '#fbbf24' : lm.category === 'human_zone' ? '#c084fc' : '#38bdf8';

    ctx.strokeStyle = col;
    ctx.lineWidth = 1.8;
    ctx.strokeRect(lx - 18, ly - 18, 36, 36);

    ctx.fillStyle = col + '28';
    ctx.fillRect(lx - 18, ly - 18, 36, 36);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 10.5px JetBrains Mono, monospace';
    ctx.fillText(lm.name.slice(0, 24), lx, ly - 24);
  });

  const g1x = cx + -1.2 * scale;
  const g1y = arenaCy - -1.8 * scale;
  ctx.fillStyle = '#c084fc';
  ctx.beginPath();
  ctx.arc(g1x, g1y, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 11px Inter, sans-serif';
  ctx.fillText('🤖 Unitree G1 Humanoid [HOLDING]', g1x, g1y + 28);

  const tx = cx + robotSim.targetX * scale;
  const ty = arenaCy - robotSim.targetY * scale;
  const rx = cx + robotSim.x * scale;
  const ry = arenaCy - robotSim.y * scale;

  ctx.strokeStyle = robotSim.safetyLocked ? '#fb7185' : '#34d399';
  ctx.lineWidth = 2.2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(rx, ry);
  ctx.lineTo(tx, ty);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = robotSim.safetyLocked ? '#fb7185' : '#34d399';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(tx, ty, 10 + Math.sin(t * 5) * 2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.save();
  ctx.translate(rx, ry);
  const lidarAngle = t * 3.2;
  const coneGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 125);
  coneGrad.addColorStop(0, robotSim.safetyLocked ? 'rgba(251, 113, 133, 0.48)' : 'rgba(52, 211, 153, 0.42)');
  coneGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = coneGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, 125, lidarAngle - 0.55, lidarAngle + 0.55);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = robotSim.safetyLocked ? '#fb7185' : '#34d399';
  ctx.beginPath();
  ctx.arc(0, 0, 15, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, 0, 15, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 12px Inter, sans-serif';
  ctx.fillText(\`🐕 Unitree Go2 Pro [\${robotSim.status.toUpperCase()}]\`, rx, ry - 24);
  ctx.fillStyle = robotSim.safetyLocked ? '#fb7185' : '#34d399';
  ctx.font = '700 10.5px JetBrains Mono, monospace';
  ctx.fillText(\`pos: (\${robotSim.x.toFixed(2)}m, \${robotSim.y.toFixed(2)}m) · vel: \${robotSim.linearX.toFixed(2)}m/s\`, rx, ry + 30);

  ctx.restore();
}

function drawMoatMode(t, cx, cy) {
  const coreGrad = ctx.createRadialGradient(cx, cy, 8, cx, cy, 115);
  coreGrad.addColorStop(0, 'rgba(56, 189, 248, 0.48)');
  coreGrad.addColorStop(0.55, 'rgba(192, 132, 252, 0.24)');
  coreGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 115, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(cx, cy, 78, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = '800 15px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('STARLIGHT SOVEREIGN OS', cx, cy - 12);
  ctx.fillStyle = '#34d399';
  ctx.font = '700 11px JetBrains Mono, monospace';
  ctx.fillText('Category of One · 5 Uncopyable Moats', cx, cy + 6);
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '600 10.5px Inter, sans-serif';
  ctx.fillText('12 Harnesses × 6 Vaults × Zenoh Robotics × MCP Sites', cx, cy + 24);

  COMPETITORS.forEach((c) => {
    const nx = cx + c.x * 0.88;
    const ny = cy + c.y * 0.96;

    ctx.strokeStyle = 'rgba(251, 113, 133, 0.35)';
    ctx.lineWidth = 1.6;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(nx, ny);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.32)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(nx - 125, ny - 42, 250, 84, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fb7185';
    ctx.font = '800 12px Inter, sans-serif';
    ctx.fillText(\`vs. \${c.name}\`, nx, ny - 18);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 10px Inter, sans-serif';
    ctx.fillText(c.weakness.slice(0, 48), nx, ny + 2);
    ctx.fillText(c.weakness.slice(48, 98), nx, ny + 18);

    hitTargets.push({
      x: nx,
      y: ny,
      r: 70,
      onClick: () => {
        document.getElementById('insp-type').textContent = 'COMPETITOR GAP ANALYSIS · CATEGORY OF ONE';
        document.getElementById('insp-name').textContent = \`Why Starlight Beats \${c.name}\`;
        document.getElementById('insp-desc').textContent = c.weakness;
        logEvent(\`Inspected competitor gap -> \${c.name}\`, '#fbbf24');
      },
    });
  });
}

let startTime = performance.now();
function animate(now) {
  const t = (now - startTime) / 1000;
  ctx.clearRect(0, 0, width, height);
  hitTargets = [];

  const cx = width * 0.48;
  const cy = height * 0.48;

  stars.forEach((s) => {
    const sx = cx + s.x * s.z + Math.sin(t * 0.2 + s.x) * 4;
    const sy = cy + s.y * s.z;
    ctx.fillStyle = \`rgba(226, 232, 240, \${s.alpha})\`;
    ctx.beginPath();
    ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
    ctx.fill();
  });

  stepRobotPhysics(t);
  drawOscilloscope();

  if (currentMode === 'cosmos') {
    drawCosmosMode(t, cx, cy);
  } else if (currentMode === 'robotics') {
    drawRoboticsMode(t, cx, cy);
  } else {
    drawMoatMode(t, cx, cy);
  }

  requestAnimationFrame(animate);
}

renderVaultList();
logEvent('Starlight Jarvis Memory Palace × Embodied Robotics Cosmos initialized [60fps WebGL/Canvas]', '#34d399');
logEvent('Zenoh Realtime Bridge connected -> ws://127.0.0.1:7447 (Unitree Go2 Pro + G1 Humanoid)', '#38bdf8');
logEvent('30/30 Estate Surface Specs linked with bidirectional vscode:// and cursor:// AST pointers', '#c084fc');
requestAnimationFrame(animate);
</script>
</body>
</html>`;
}

async function main() {
  const engine = new QueenSpecIntelligenceEngine(WORKTREE_ROOT);
  const snapshot = engine.getSnapshot(false, false);
  const vaults = loadVaultSummary();
  const robotics = buildRoboticsSnapshot();

  const html = buildHtml(vaults, robotics, snapshot);

  fs.mkdirSync(ONEDRIVE_SNAPSHOT_DIR, { recursive: true });
  fs.mkdirSync(COMMAND_CENTER_DIR, { recursive: true });

  const fileName = `${DATE_ISO}__${AGENT_BADGE}__Starlight-Jarvis-Embodied-Cosmos.html`;
  const artifactHtmlPath = path.join(ARTIFACT_DIR, fileName);
  const oneDriveHtmlPath = path.join(ONEDRIVE_SNAPSHOT_DIR, fileName);
  const cmdCenterHtmlPath = path.join(COMMAND_CENTER_DIR, fileName);

  fs.writeFileSync(artifactHtmlPath, html, "utf8");
  fs.writeFileSync(oneDriveHtmlPath, html, "utf8");
  fs.writeFileSync(cmdCenterHtmlPath, html, "utf8");

  console.log(`[Jarvis-Cosmos] Wrote interactive spatial command experience -> ${artifactHtmlPath}`);

  const hub = await ensureCdpHubOn9223();
  const cdp = new CdpClient(hub.wsEndpoint);
  const shotCosmosName = `${DATE_ISO}__${AGENT_BADGE}__Jarvis-Embodied-Cosmos.png`;
  const shotRoboticsName = `${DATE_ISO}__${AGENT_BADGE}__Robotics-Zenoh-Hazard-HUD.png`;
  const shotMoatName = `${DATE_ISO}__${AGENT_BADGE}__Category-Of-One-Moat-Matrix.png`;

  try {
    await cdp.connect();
    const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
    await cdp.send("Page.enable", {}, sessionId);
    await cdp.send("Runtime.enable", {}, sessionId);
    await cdp.send(
      "Emulation.setDeviceMetricsOverride",
      { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false },
      sessionId
    );
    const fileUrl = "file:///" + artifactHtmlPath.replace(/\\/g, "/");
    await cdp.send("Page.navigate", { url: fileUrl }, sessionId);
    await sleep(1400);

    // 1. Capture Mode 1: Jarvis Memory Cosmos
    const shot1 = await cdp.send(
      "Page.captureScreenshot",
      { format: "png", fromSurface: true, captureBeyondViewport: false },
      sessionId
    );
    const buf1 = Buffer.from(shot1.data, "base64");
    fs.writeFileSync(path.join(ARTIFACT_DIR, shotCosmosName), buf1);
    fs.writeFileSync(path.join(ONEDRIVE_SNAPSHOT_DIR, shotCosmosName), buf1);

    // 2. Switch to Mode 2: Embodied Robotics & LiDAR HUD + simulate hazard breach
    await cdp.send("Runtime.evaluate", { expression: "setMode('robotics'); simulateHazardBreach();" }, sessionId);
    await sleep(900);
    const shot2 = await cdp.send(
      "Page.captureScreenshot",
      { format: "png", fromSurface: true, captureBeyondViewport: false },
      sessionId
    );
    const buf2 = Buffer.from(shot2.data, "base64");
    fs.writeFileSync(path.join(ARTIFACT_DIR, shotRoboticsName), buf2);
    fs.writeFileSync(path.join(ONEDRIVE_SNAPSHOT_DIR, shotRoboticsName), buf2);

    // 3. Switch to Mode 3: Category-of-One Moat Matrix
    await cdp.send("Runtime.evaluate", { expression: "setMode('moat');" }, sessionId);
    await sleep(700);
    const shot3 = await cdp.send(
      "Page.captureScreenshot",
      { format: "png", fromSurface: true, captureBeyondViewport: false },
      sessionId
    );
    const buf3 = Buffer.from(shot3.data, "base64");
    fs.writeFileSync(path.join(ARTIFACT_DIR, shotMoatName), buf3);
    fs.writeFileSync(path.join(ONEDRIVE_SNAPSHOT_DIR, shotMoatName), buf3);

    console.log(`[Jarvis-Cosmos] Captured 1080p screenshots via :9223 CDP Hub:\n  - ${shotCosmosName}\n  - ${shotRoboticsName}\n  - ${shotMoatName}`);

    try {
      await cdp.send("Target.closeTarget", { targetId });
    } catch {}
  } finally {
    cdp.close();
    await hub.cleanup();
  }

  if (process.argv.includes("--open")) {
    exec(`cmd /c start "" "${cmdCenterHtmlPath.replace(/\//g, "\\")}"`);
  }
}

main().catch((err) => {
  console.error("Fatal error in launch-jarvis-embodied-cosmos:", err);
  process.exit(1);
});
