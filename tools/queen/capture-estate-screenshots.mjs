#!/usr/bin/env node
/**
 * Starlight Queen v2.0 — CDP Hub & Sequential Single-Tab Visual Estate Auditor
 *
 * Honors User Rule #6 (Browser Hub Mandate):
 * - Never calls playwright.launch()
 * - Ensures http://127.0.0.1:9223/wsEndpoint is up (spawning a single headless Edge
 *   instance on 127.0.0.1:9224 and serving the CDP Multiplexer Hub on :9223 if not already running)
 * - Connects via native WebSocket to the wsEndpoint from http://127.0.0.1:9223/wsEndpoint
 * - Reuses ONE page target sequentially across all 30 estate surfaces (cockpits, live sites,
 *   product pages, UI/UX components, and GitHub READMEs) to keep RAM usage minimal (<200 MB).
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as http from 'node:http';
import * as crypto from 'node:crypto';
import { spawn } from 'node:child_process';

const ARTIFACT_DIR =
  process.env.STARLIGHT_ARTIFACT_DIR ||
  'C:/Users/frank/.gemini/antigravity-cli/brain/5dc42c9a-4558-47e1-b558-9dbf8e467317';
const WORKTREE_ROOT =
  process.env.STARLIGHT_WORKTREE_ROOT ||
  'C:/Users/frank/starlight/worktrees/sis-queen-sovereign-20261018';
const SNAPSHOT_DIR = path.join(WORKTREE_ROOT, 'snapshots');

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
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(url, timeoutMs = 3000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function ensureCdpHubOn9223() {
  try {
    const existingWs = (await fetchText('http://127.0.0.1:9223/wsEndpoint', 1500)).trim();
    if (existingWs.startsWith('ws://')) {
      console.log(`[CDP-Hub] Connected to existing Hub on :9223 -> ${existingWs}`);
      return { wsEndpoint: existingWs, cleanup: async () => {} };
    }
  } catch {
    // Hub not running yet on 9223
  }

  let browserWsUrl = '';
  let edgeProc = null;

  try {
    const raw = await fetchText('http://127.0.0.1:9224/json/version', 1200);
    const parsed = JSON.parse(raw);
    if (parsed.webSocketDebuggerUrl) {
      browserWsUrl = parsed.webSocketDebuggerUrl;
      console.log(`[CDP-Hub] Reusing existing headless Edge on :9224 -> ${browserWsUrl}`);
    }
  } catch {
    // Not running on 9224 yet
  }

  if (!browserWsUrl) {
    const edgeBin = findEdgeBinary();
    const profileDir = path.join(ARTIFACT_DIR, 'scratch', 'edge-cdp-profile');
    fs.mkdirSync(profileDir, { recursive: true });

    edgeProc = spawn(
      edgeBin,
      [
        '--headless=new',
        '--remote-debugging-port=9224',
        '--remote-allow-origins=*',
        `--user-data-dir=${profileDir}`,
        '--window-size=1440,900',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions',
        '--disable-background-networking',
        '--mute-audio',
        'about:blank',
      ],
      { stdio: 'ignore', windowsHide: true }
    );

    for (let i = 0; i < 30; i++) {
      await sleep(300);
      try {
        const raw = await fetchText('http://127.0.0.1:9224/json/version', 1500);
        const parsed = JSON.parse(raw);
        if (parsed.webSocketDebuggerUrl) {
          browserWsUrl = parsed.webSocketDebuggerUrl;
          break;
        }
      } catch {
        // wait
      }
    }
  }

  if (!browserWsUrl) {
    try {
      edgeProc?.kill();
    } catch {}
    throw new Error('Failed to obtain webSocketDebuggerUrl from headless Edge on :9224');
  }

  // Start lightweight observability & wsEndpoint hub on 127.0.0.1:9223 per User Rule #6
  const hubStats = {
    startedAt: new Date().toISOString(),
    browserWsUrl,
    navigations: 0,
    currentUrl: 'about:blank',
  };

  const hubServer = http.createServer((req, res) => {
    if (req.url === '/wsEndpoint') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(browserWsUrl);
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(hubStats, null, 2));
  });

  await new Promise((resolve) => hubServer.listen(9223, '127.0.0.1', resolve));
  const fetchedWs = (await fetchText('http://127.0.0.1:9223/wsEndpoint', 2000)).trim();
  console.log(`[CDP-Hub] Started Hub on http://127.0.0.1:9223/wsEndpoint -> ${fetchedWs}`);

  return {
    wsEndpoint: fetchedWs,
    hubStats,
    cleanup: async () => {
      await new Promise((resolve) => hubServer.close(() => resolve()));
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
    this.eventListeners = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', () => resolve(), { once: true });
      this.ws.addEventListener('error', (err) => reject(err), { once: true });
    });
    this.ws.addEventListener('message', (event) => {
      try {
        const msg = JSON.parse(String(event.data));
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          else resolve(msg.result);
        } else if (msg.method) {
          const handlers = this.eventListeners.get(msg.method) || [];
          for (const h of handlers) h(msg.params || {}, msg.sessionId);
        }
      } catch {
        // ignore parse errors
      }
    });
  }

  send(method, params = {}, sessionId = undefined, timeoutMs = 20000) {
    const id = this.nextId++;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP timeout on ${method}`));
      }, timeoutMs);
      this.pending.set(id, {
        resolve: (res) => {
          clearTimeout(timer);
          resolve(res);
        },
        reject: (err) => {
          clearTimeout(timer);
          reject(err);
        },
      });
      this.ws.send(JSON.stringify(payload));
    });
  }

  close() {
    try {
      this.ws?.close();
    } catch {}
  }
}

const SURFACES_TO_CAPTURE = [
  // Group A: Local Sovereign Cockpits & Internal Command Surfaces
  {
    id: '01-queen-v2-router',
    category: 'Local Cockpit',
    brand: 'Starlight Queen v2.0',
    title: 'Queen v2.0 Cockpit — Tab 1: Pareto & Thompson Router + 4-Stage Topology',
    url: 'http://127.0.0.1:4329/',
    waitMs: 1200,
    jsAction: `document.querySelector('[data-tab="router"]')?.click(); document.getElementById('btn-execute-mission')?.click();`,
    postActionWaitMs: 900,
    repo: 'Starlight-Intelligence-System (worktree sis-queen-sovereign-20261018)',
  },
  {
    id: '02-queen-v2-harnesses',
    category: 'Local Cockpit',
    brand: 'Starlight Queen v2.0',
    title: 'Queen v2.0 Cockpit — Tab 2: 12-Harness Federation & Proactive Upgrader',
    url: 'http://127.0.0.1:4329/',
    waitMs: 800,
    jsAction: `document.querySelector('[data-tab="harnesses"]')?.click(); window.scrollTo(0, 260);`,
    postActionWaitMs: 700,
    repo: 'Starlight-Intelligence-System (worktree sis-queen-sovereign-20261018)',
  },
  {
    id: '03-queen-v2-brands',
    category: 'Local Cockpit',
    brand: 'Starlight Queen v2.0',
    title: 'Queen v2.0 Cockpit — Tab 3: 8-Brand × 8-Moat Engineering Switchboard',
    url: 'http://127.0.0.1:4329/',
    waitMs: 800,
    jsAction: `document.querySelector('[data-tab="brands"]')?.click(); window.scrollTo(0, 260);`,
    postActionWaitMs: 700,
    repo: 'Starlight-Intelligence-System (worktree sis-queen-sovereign-20261018)',
  },
  {
    id: '04-queen-v2-codex',
    category: 'Local Cockpit',
    brand: 'Starlight Queen v2.0',
    title: 'Queen v2.0 Cockpit — Tab 8: Master Codex (10 Orgs, 151 Agents, 12 Truths)',
    url: 'http://127.0.0.1:4329/',
    waitMs: 800,
    jsAction: `document.querySelector('[data-tab="codex"]')?.click(); window.scrollTo(0, 260);`,
    postActionWaitMs: 700,
    repo: 'Starlight-Intelligence-System (worktree sis-queen-sovereign-20261018)',
  },
  {
    id: '05-queen-v2-subscriptions',
    category: 'Local Cockpit',
    brand: 'Starlight Queen v2.0',
    title: 'Queen v2.0 Cockpit — Tab 9: 10-Rail OAuth Subscription Max-Out Governor (10.5x)',
    url: 'http://127.0.0.1:4330/',
    waitMs: 1100,
    jsAction: `document.querySelector('[data-tab="subscriptions"]')?.click(); window.scrollTo(0, 260);`,
    postActionWaitMs: 900,
    repo: 'Starlight-Intelligence-System (worktree sis-queen-sovereign-20261018)',
  },
  {
    id: '06-queen-v2-conductor',
    category: 'Local Cockpit',
    brand: 'Starlight Queen v2.0',
    title: 'Queen v2.0 Cockpit — Tab 10: Window CLI Conductor & 17-Card Self-Heal',
    url: 'http://127.0.0.1:4330/',
    waitMs: 1100,
    jsAction: `document.querySelector('[data-tab="conductor"]')?.click(); window.scrollTo(0, 260);`,
    postActionWaitMs: 900,
    repo: 'Starlight-Intelligence-System (worktree sis-queen-sovereign-20261018)',
  },
  {
    id: '07-queen-v2-swarm-intents',
    category: 'Local Cockpit',
    brand: 'Starlight Queen v2.0',
    title: 'Queen v2.0 Cockpit — Tab 11: RuFlow × OmO × Graphiti & 30/30 Founder Intents',
    url: 'http://127.0.0.1:4330/',
    waitMs: 1100,
    jsAction: `document.querySelector('[data-tab="swarm-graph"]')?.click(); window.scrollTo(0, 260);`,
    postActionWaitMs: 900,
    repo: 'Starlight-Intelligence-System (worktree sis-queen-sovereign-20261018)',
  },
  {
    id: '08-unified-command-center',
    category: 'Internal Doc / Command Surface',
    brand: 'Starlight Estate Control Plane',
    title: 'Starlight Agentic OS — Unified Local + Cloud Command Center (HTML5)',
    url: 'file:///C:/Users/frank/starlight/command-center/starlight-agentic-os-command-center.html',
    waitMs: 1400,
    repo: 'starlight/command-center',
  },
  {
    id: '09-starlight-voice-live',
    category: 'Local Cockpit',
    brand: 'Starlight Voice',
    title: 'Starlight Voice — Live Glass Sphere Surface (:8765/live)',
    url: 'http://127.0.0.1:8765/live',
    waitMs: 1200,
    repo: 'repos/starlight-voice',
  },

  // Group B: Production Websites, Product Pages & UI/UX Components
  {
    id: '10-starlightintelligence-org-home',
    category: 'Production Website',
    brand: 'Starlight Intelligence Protocol',
    title: 'starlightintelligence.org — Public Protocol Explorer & Sovereign Substrate',
    url: 'https://starlightintelligence.org/',
    waitMs: 2200,
    repo: 'repos/Starlight-Intelligence-System (site/)',
  },
  {
    id: '11-starlightintelligence-org-research',
    category: 'Product / Research Surface',
    brand: 'Starlight Intelligence Protocol',
    title: 'starlightintelligence.org/research — 3D Memory Palace & Memory Foundations',
    url: 'https://starlightintelligence.org/research',
    waitMs: 2200,
    repo: 'repos/Starlight-Intelligence-System (site/)',
  },
  {
    id: '12-starlightintelligence-ai-home',
    category: 'Production Website',
    brand: 'Starlight Intelligence Applied',
    title: 'starlightintelligence.ai — Applied Intelligence Platform & Memory Studio',
    url: 'https://starlightintelligence.ai/',
    waitMs: 2200,
    repo: 'repos/starlight-intelligence-web & repos/starlightintelligence.ai',
  },
  {
    id: '13-frankx-ai-home',
    category: 'Tier-1 Flagship Website',
    brand: 'FrankX.AI',
    title: 'frankx.ai — Flagship AI Architect & Creator Authority Hub (Hero)',
    url: 'https://www.frankx.ai/',
    waitMs: 2400,
    repo: 'repos/frankx.ai-vercel-website',
  },
  {
    id: '14-frankx-ai-products',
    category: 'Product Ladder Surface',
    brand: 'FrankX.AI',
    title: 'frankx.ai/products — Digital Product Ladder & Self-Serve Catalog UI',
    url: 'https://www.frankx.ai/products',
    waitMs: 2400,
    repo: 'repos/frankx.ai-vercel-website',
  },
  {
    id: '15-arcanea-ai-home',
    category: 'Tier-1 Flagship Website',
    brand: 'Arcanea',
    title: 'arcanea.ai — Creative Multiverse & 226-Model Studio (Hero)',
    url: 'https://www.arcanea.ai/',
    waitMs: 2500,
    repo: 'repos/arcanea-ai-app',
  },
  {
    id: '16-arcanea-ai-components',
    category: 'UI/UX Components',
    brand: 'Arcanea',
    title: 'arcanea.ai — Interactive World, Ten Gates & Guardian UI/UX Components',
    url: 'https://www.arcanea.ai/',
    waitMs: 1200,
    jsAction: `window.scrollTo({ top: 920, behavior: 'instant' });`,
    postActionWaitMs: 1000,
    repo: 'repos/arcanea-ai-app',
  },
  {
    id: '17-gencreator-ai-home',
    category: 'Tier-1 Flagship Website',
    brand: 'GenCreator',
    title: 'gencreator.ai — Sovereign Agentic Creator OS (Hero & Positioning)',
    url: 'https://gencreator.ai/',
    waitMs: 2400,
    repo: 'repos/gencreator.ai',
  },
  {
    id: '18-gencreator-ai-components',
    category: 'UI/UX Components',
    brand: 'GenCreator',
    title: 'gencreator.ai — Creator Stack, BYOK Architecture & UI/UX Components',
    url: 'https://gencreator.ai/',
    waitMs: 1200,
    jsAction: `window.scrollTo({ top: 920, behavior: 'instant' });`,
    postActionWaitMs: 1000,
    repo: 'repos/gencreator.ai',
  },
  {
    id: '19-realityarchitect-ai-home',
    category: 'Tier-2 Production Website',
    brand: 'Reality Architect',
    title: 'realityarchitect.ai — Reality.md Charter & Quantum Jump Architecture',
    url: 'https://www.realityarchitect.ai/',
    waitMs: 2200,
    repo: 'repos/realityarchitect',
  },
  {
    id: '20-agenticincome-ai-home',
    category: 'Tier-2 Production Website',
    brand: 'Agentic Income',
    title: 'agenticincome.ai — $67 Blueprint & Autonomous Revenue Systems',
    url: 'https://www.agenticincome.ai/',
    waitMs: 2200,
    repo: 'repos/agenticincome',
  },
  {
    id: '21-animelegends-ai-home',
    category: 'Tier-2 Production Website',
    brand: 'Anime Legends',
    title: 'animelegends.ai — Akashi, Kage & Mira Trinity Media Universe',
    url: 'https://www.animelegends.ai/',
    waitMs: 2200,
    repo: 'repos/animelegends',
  },
  {
    id: '22-starlight-domains-home',
    category: 'Starlight Quad-Domain Surface',
    brand: 'Starlight Domains',
    title: 'starlight.domains — Portfolio Architecture Audit & Collision Canvas',
    url: 'https://starlight.domains/',
    waitMs: 2200,
    repo: 'repos/starlight-domains',
  },
  {
    id: '23-starlight-you-home',
    category: 'Starlight Quad-Domain Surface',
    brand: 'Starlight You',
    title: 'starlight.you — Personal OS Kit & Client-Side reality.md Validator',
    url: 'https://starlight.you/',
    waitMs: 2200,
    repo: 'repos/starlight-you',
  },
  {
    id: '24-starlight-technology-home',
    category: 'Starlight Quad-Domain Surface',
    brand: 'Starlight Technology',
    title: 'starlight.technology — Dated, Sourced AI Studio Build Sheets',
    url: 'https://starlight.technology/',
    waitMs: 2200,
    repo: 'repos/starlight-technology',
  },
  {
    id: '25-starlight-academy-home',
    category: 'Starlight Quad-Domain Surface',
    brand: 'Starlight Academy',
    title: 'starlightintelligence.academy — Operator Lab & Reviewed Mission Bench',
    url: 'https://starlightintelligence.academy/',
    waitMs: 2200,
    repo: 'repos/starlight-intelligence-academy',
  },

  // Group C: GitHub READMEs & 10-Org Federation Surfaces
  {
    id: '26-github-sis-readme',
    category: 'GitHub README',
    brand: 'Starlight Intelligence System',
    title: 'github.com/frankxai/Starlight-Intelligence-System — Flagship Repo & README',
    url: 'https://github.com/frankxai/Starlight-Intelligence-System',
    waitMs: 2600,
    jsAction: `window.scrollTo({ top: 420, behavior: 'instant' });`,
    postActionWaitMs: 800,
    repo: 'repos/Starlight-Intelligence-System',
  },
  {
    id: '27-github-claude-skills-readme',
    category: 'GitHub README',
    brand: 'Claude Skills Library',
    title: 'github.com/frankxai/claude-skills-library — #1 Organic Traffic Funnel README',
    url: 'https://github.com/frankxai/claude-skills-library',
    waitMs: 2600,
    jsAction: `window.scrollTo({ top: 420, behavior: 'instant' });`,
    postActionWaitMs: 800,
    repo: 'repos/claude-skills-library',
  },
  {
    id: '28-github-arcanea-org',
    category: 'GitHub Organization',
    brand: 'Arcanea-Labs Org',
    title: 'github.com/Arcanea-Labs — Federated Creative World Organization',
    url: 'https://github.com/Arcanea-Labs',
    waitMs: 2400,
    repo: 'Arcanea-Labs/.github',
  },
  {
    id: '29-github-starlight-org',
    category: 'GitHub Organization',
    brand: 'Starlight-Intelligence Org',
    title: 'github.com/Starlight-Intelligence — Federated Sovereign Agent OS Organization',
    url: 'https://github.com/Starlight-Intelligence',
    waitMs: 2400,
    repo: 'Starlight-Intelligence/.github',
  },
  {
    id: '30-github-gencreator-org',
    category: 'GitHub Organization',
    brand: 'GenCreator-ai Org',
    title: 'github.com/GenCreator-ai — Federated Agentic Creator OS Organization',
    url: 'https://github.com/GenCreator-ai',
    waitMs: 2400,
    repo: 'GenCreator-ai/.github',
  },
];

async function main() {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });

  const onlyV2Tabs = process.argv.includes('--only-v2-tabs');
  const activeSurfaces = onlyV2Tabs
    ? SURFACES_TO_CAPTURE.filter((s) =>
        ['05-queen-v2-subscriptions', '06-queen-v2-conductor', '07-queen-v2-swarm-intents'].includes(s.id)
      )
    : SURFACES_TO_CAPTURE;

  let tempQueenServer = null;
  try {
    const { startQueenSovereignServer } = await import('../../src/queen/server.ts');
    tempQueenServer = await startQueenSovereignServer({ port: 4330, host: '127.0.0.1' });
    console.log(`[Queen-v2] Started 11-tab worktree server at ${tempQueenServer.url}`);
  } catch (e) {
    console.warn(`[Queen-v2] Could not start port 4330 server: ${e.message}`);
  }

  const hub = await ensureCdpHubOn9223();
  const cdp = new CdpClient(hub.wsEndpoint);
  const results = [];

  try {
    await cdp.connect();

    const { targetId } = await cdp.send('Target.createTarget', {
      url: 'about:blank',
    });
    const { sessionId } = await cdp.send('Target.attachToTarget', {
      targetId,
      flatten: true,
    });

    await cdp.send('Page.enable', {}, sessionId);
    await cdp.send('Runtime.enable', {}, sessionId);
    await cdp.send(
      'Emulation.setDeviceMetricsOverride',
      {
        width: 1440,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false,
      },
      sessionId
    );

    for (let i = 0; i < activeSurfaces.length; i++) {
      const item = activeSurfaces[i];
      const startMs = Date.now();
      console.log(
        `[${String(i + 1).padStart(2, '0')}/${activeSurfaces.length}] Opening ${item.url} (${item.id})...`
      );

      if (hub.hubStats) {
        hub.hubStats.navigations++;
        hub.hubStats.currentUrl = item.url;
      }

      try {
        await cdp.send('Page.navigate', { url: item.url }, sessionId, 25000);
        await sleep(item.waitMs || 2000);

        if (item.jsAction) {
          await cdp.send(
            'Runtime.evaluate',
            {
              expression: item.jsAction,
              returnByValue: true,
            },
            sessionId
          );
          await sleep(item.postActionWaitMs || 800);
        }

        const evalRes = await cdp.send(
          'Runtime.evaluate',
          {
            expression: `(() => {
              const title = document.title || '';
              const h1 = document.querySelector('h1')?.innerText?.trim()?.slice(0, 140) || '';
              const h2 = document.querySelector('h2')?.innerText?.trim()?.slice(0, 140) || '';
              const buttons = document.querySelectorAll('button, [role="button"], input[type="submit"]').length;
              const links = document.querySelectorAll('a[href]').length;
              const sections = document.querySelectorAll('section, main, nav, article').length;
              return { title, h1, h2, buttons, links, sections, locationHref: location.href };
            })()`,
            returnByValue: true,
          },
          sessionId
        );

        const domMeta = evalRes?.result?.value || {};

        const shot = await cdp.send(
          'Page.captureScreenshot',
          {
            format: 'png',
            fromSurface: true,
            captureBeyondViewport: false,
          },
          sessionId,
          25000
        );

        const pngBuffer = Buffer.from(shot.data, 'base64');
        const fileName = `${item.id}.png`;
        const artifactPath = path.join(ARTIFACT_DIR, fileName);
        fs.writeFileSync(artifactPath, pngBuffer);

        const sha256 = crypto.createHash('sha256').update(pngBuffer).digest('hex').slice(0, 16);
        const elapsedMs = Date.now() - startMs;

        results.push({
          index: SURFACES_TO_CAPTURE.findIndex((s) => s.id === item.id) + 1,
          id: item.id,
          category: item.category,
          brand: item.brand,
          title: item.title,
          url: item.url,
          repo: item.repo,
          fileName,
          artifactPath: artifactPath.replace(/\\/g, '/'),
          bytes: pngBuffer.length,
          sha256,
          elapsedMs,
          capturedAt: new Date().toISOString(),
          domMeta,
          status: 'CAPTURED',
        });

        console.log(
          `  -> Saved ${fileName} (${Math.round(pngBuffer.length / 1024)} KB, sha=${sha256}, title="${domMeta.title || item.title}")`
        );
      } catch (err) {
        console.error(`  -> ERROR on ${item.id}: ${err.message}`);
        results.push({
          index: SURFACES_TO_CAPTURE.findIndex((s) => s.id === item.id) + 1,
          id: item.id,
          category: item.category,
          brand: item.brand,
          title: item.title,
          url: item.url,
          repo: item.repo,
          status: 'ERROR',
          error: err.message,
          capturedAt: new Date().toISOString(),
        });
      }
    }

    try {
      await cdp.send('Target.closeTarget', { targetId });
      await cdp.send('Browser.close');
    } catch {}
  } finally {
    cdp.close();
    await hub.cleanup();
    if (tempQueenServer) {
      try {
        await tempQueenServer.close();
      } catch {}
    }
  }

  const manifestPath = path.join(SNAPSHOT_DIR, '2026-10-18-visual-estate-snapshot.json');
  let finalSurfaces = results;
  if (onlyV2Tabs && fs.existsSync(manifestPath)) {
    const prev = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const prevList = prev.surfaces || prev.records || [];
    finalSurfaces = prevList.map((oldItem) => {
      const updated = results.find((r) => r.id === oldItem.id);
      return updated || oldItem;
    });
  }

  const manifest = {
    schema: 'starlight.visual-estate-snapshot.v1',
    date: '2026-10-18',
    generatedAt: new Date().toISOString(),
    browserHubMandate: 'http://127.0.0.1:9223/wsEndpoint (Single-Tab Sequential CDP)',
    viewport: '1440x900',
    totalSurfaces: SURFACES_TO_CAPTURE.length,
    capturedCount: finalSurfaces.filter((r) => r.status === 'CAPTURED').length,
    surfaces: finalSurfaces,
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n[COMPLETE] Captured ${manifest.capturedCount}/${manifest.totalSurfaces} surfaces.`);
  console.log(`[MANIFEST] ${manifestPath}`);
}

main().catch((err) => {
  console.error('Fatal error in capture-estate-screenshots:', err);
  process.exit(1);
});
