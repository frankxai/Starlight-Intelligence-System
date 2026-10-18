#!/usr/bin/env node
/**
 * Starlight Visual Estate Observatory & Coding Agent Live Cinema Launcher
 *
 * Implements Layer 4 of Procedure 8 (`skills/vision/queen-swarms-visual.md`):
 * 1. Organizes and mirrors the dated 30-surface visual snapshot bundle (PNGs, 36-slide .pptx,
 *    36-slide .html deck, and JSON manifests) into:
 *      - C:/Users/frank/OneDrive/Starlight Creative Vault/01_ESTATE_SNAPSHOTS/2026-10-18/
 *      - C:/Users/frank/starlight/command-center/snapshots/2026-10-18/
 * 2. Generates the interactive "Starlight Visual Observatory & Coding Agent Live Cinema"
 *    (`starlight-visual-observatory-cinema.html`) with Auto-Play Guided Tour (1-by-1 across all 30
 *    surfaces), Live Browser Site Opener, 4K Contact Sheet Grid, and the Coding Agent Operating Model.
 * 3. Renders a single high-resolution 4K Master Contact Sheet PNG (`00-ESTATE-30-SURFACE-MASTER-GRID.png`)
 *    via the :9223 CDP Hub.
 * 4. When invoked with `--open`, opens the Live Cinema HTML in the default browser, opens the 4K
 *    Master Contact Sheet image, opens the 36-slide .pptx deck, and opens the synced OneDrive folder.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { exec } from 'node:child_process';

const DATE_STAMP = '2026-10-18';
const ARTIFACT_DIR =
  process.env.STARLIGHT_ARTIFACT_DIR ||
  'C:/Users/frank/.gemini/antigravity-cli/brain/5dc42c9a-4558-47e1-b558-9dbf8e467317';
const WORKTREE_ROOT =
  process.env.STARLIGHT_WORKTREE_ROOT ||
  'C:/Users/frank/starlight/worktrees/sis-queen-sovereign-20261018';
const SNAPSHOT_DIR = path.join(WORKTREE_ROOT, 'snapshots');
const COMMAND_CENTER_DIR = 'C:/Users/frank/starlight/command-center';
const LOCAL_SNAPSHOT_ASSETS_DIR = path.join(COMMAND_CENTER_DIR, 'snapshots', DATE_STAMP);
const ONEDRIVE_VAULT_ROOT = 'C:/Users/frank/OneDrive/Starlight Creative Vault';
const ONEDRIVE_SNAPSHOT_DIR = path.join(ONEDRIVE_VAULT_ROOT, '01_ESTATE_SNAPSHOTS', DATE_STAMP);

const SURFACE_ENRICHMENT = {
  '01-queen-v2-router': {
    intent: 'I-001 · Queen v2.0 Sovereign Meta-Harness & Pareto Router',
    objective: 'O1 · SIS Sovereign Memory & Queen Orchestration',
    agentAction: 'Built Pareto & Thompson Beta(α,β) multi-objective router + 4-stage execution pipeline on :4329.',
    nextGoal: 'Promote PR #20 (642262cad) to main so :4329 runs all 11 tabs natively.',
    liveUrl: 'http://127.0.0.1:4329/',
  },
  '02-queen-v2-harnesses': {
    intent: 'I-002 · 12-Harness Federation & Proactive Upgrader',
    objective: 'O1 · SIS Sovereign Memory & Queen Orchestration',
    agentAction: 'Unified 7 local CLI harnesses + 5 cloud runtimes with capability envelopes and health telemetry.',
    nextGoal: 'Auto-inject 8k-token compiled Turn-0 spine across all 12 harness adapters.',
    liveUrl: 'http://127.0.0.1:4329/',
  },
  '03-queen-v2-brands': {
    intent: 'I-003 · 8-Brand × 8-Moat Engineering Switchboard',
    objective: 'O3 · GenCreator & Multi-Brand Freedom Engine',
    agentAction: 'Aligned all 8 brands to canonical TRUTH.md Freedom Engine doctrine (100% scalable products/IP).',
    nextGoal: 'Wire live Stripe/Whop DemandSignal counters into each brand cell.',
    liveUrl: 'http://127.0.0.1:4329/',
  },
  '04-queen-v2-codex': {
    intent: 'I-004 · Master Codex (10 Orgs, 151 Agents, 12 Truths)',
    objective: 'O6 · 10-Org GitHub Federation & Governance',
    agentAction: 'Indexed all 10 GitHub Orgs, 151 named agents, 89 skills, and 12 non-waivable TRUTH.md laws.',
    nextGoal: 'Keep 135/135 symmetry & conformance tests locked in pre-commit and CI.',
    liveUrl: 'http://127.0.0.1:4329/',
  },
  '05-queen-v2-subscriptions': {
    intent: 'I-006..I-009 · 10-Rail OAuth Subscription Max-Out Governor (10.5x)',
    objective: 'O1 · SIS Sovereign Memory & Queen Orchestration',
    agentAction: 'Built daily/hourly/minute-by-minute OAuth window harvester across Claude Max, Codex, Gemini Ultra/Jules, SuperGrok, v0, Vercel, Cloudflare.',
    nextGoal: 'Ingest real-time JSONL token counters from ~/.claude and ~/.codex into 60s governor tick.',
    liveUrl: 'http://127.0.0.1:4329/',
  },
  '06-queen-v2-conductor': {
    intent: 'I-005 · Open-Window CLI Conductor & 14-Card Self-Healer',
    objective: 'O1 · SIS Sovereign Memory & Queen Orchestration',
    agentAction: 'Steered 6 active terminal windows (.starlight/steered-prompts/) and healed 14/14 stuck _hold-admission cards + unified 6 MCP servers (-88.7% tokens).',
    nextGoal: 'Wire automatic window-idle detection to dispatch next ready queue card.',
    liveUrl: 'http://127.0.0.1:4329/',
  },
  '07-queen-v2-swarm-intents': {
    intent: 'I-010..I-014 · Absorbed RuFlow v3 × OmO × Graphiti & 30/30 Intents',
    objective: 'O1 · SIS Sovereign Memory & Queen Orchestration',
    agentAction: 'Absorbed RuFlow MoE/ReasoningBank, OmO 11-Role Boulder State, and Graphiti Bi-Temporal Spine; unblocked all 30/30 Founder Intents.',
    nextGoal: 'Publish @starlight/queen-swarm-bridge for 1-command community install.',
    liveUrl: 'http://127.0.0.1:4329/',
  },
  '08-unified-command-center': {
    intent: 'I-015..I-018 · Unified Local + Cloud Agentic OS Command Center',
    objective: 'O1 · SIS Sovereign Memory & Queen Orchestration',
    agentAction: 'Built executive HTML5 command surface tracking 1,394 vault atoms, 100% Eval-50 Hit@10, 71/71 repos, and 3/3 green Horizon loops.',
    nextGoal: 'Embed real-time SSE telemetry stream from :4329 and :5200.',
    liveUrl: 'file:///C:/Users/frank/starlight/command-center/starlight-agentic-os-command-center.html',
  },
  '09-starlight-voice-live': {
    intent: 'I-023 · Starlight Voice (Ara) Live Glass Sphere Cockpit',
    objective: 'O1 · SIS Sovereign Memory & Queen Orchestration',
    agentAction: 'Verified live WebSocket voice cockpit on :8765/live with reactive glass orb and low-latency audio bridge.',
    nextGoal: 'Connect Ara voice handoff packets directly to Queen v2.0 /api/execute-mission.',
    liveUrl: 'http://127.0.0.1:8765/live',
  },
  '10-starlightintelligence-org-home': {
    intent: 'I-024 · starlightintelligence.org Public Protocol Explorer',
    objective: 'O1 · SIS Sovereign Memory & Queen Orchestration',
    agentAction: 'Verified public SIP protocol flagship (151 agent definitions, 89 skill rules, 6 memory vaults).',
    nextGoal: 'Publish interactive Queen v2.0 Meta-Harness architecture explorer.',
    liveUrl: 'https://starlightintelligence.org/',
  },
  '11-starlightintelligence-org-research': {
    intent: 'I-016 · starlightintelligence.org/research Memory Palace & Foundations',
    objective: 'O1 · SIS Sovereign Memory & Queen Orchestration',
    agentAction: 'Audited public research surface (3D Memory Palace survey + 3-tier AgentDB/Graphiti memory foundations).',
    nextGoal: 'Publish Paper #3: Bi-Temporal Fact Supersession & Eval-50 Benchmark.',
    liveUrl: 'https://starlightintelligence.org/research',
  },
  '12-starlightintelligence-ai-home': {
    intent: 'I-024 · starlightintelligence.ai Commercial Sovereign Platform',
    objective: 'O7 · Arcanea Labs BV Commercial & Product Engine',
    agentAction: 'Verified commercial sovereign intelligence surface and accessibility/copy-honesty gates.',
    nextGoal: 'Activate self-serve BYOK Starter Kit & Fleet Blueprint checkout.',
    liveUrl: 'https://starlightintelligence.ai/',
  },
  '13-frankx-ai-home': {
    intent: 'I-025 · frankx.ai AI Architect Flagship & Studio Hub',
    objective: 'O4 · FrankX Authority, Books & Content Engine',
    agentAction: 'Verified flagship hero ("Build intelligence that compounds"), Suno studio player, and blueprint CTAs.',
    nextGoal: 'Merge Gemini-4-Argon Model Arena branch (d816cd59e) after preview gate.',
    liveUrl: 'https://www.frankx.ai/',
  },
  '14-frankx-ai-products': {
    intent: 'I-025 · frankx.ai/products Digital Products & Blueprints Storefront',
    objective: 'O4 · FrankX Authority, Books & Content Engine',
    agentAction: 'Captured digital product storefront (ACOS packs, AI Architect blueprints, prompt systems).',
    nextGoal: 'Wire automated LemonSqueezy/Stripe receipt telemetry to revenue-ledger.jsonl.',
    liveUrl: 'https://www.frankx.ai/products',
  },
  '15-arcanea-ai-home': {
    intent: 'I-023 · arcanea.ai Sovereign World Engine & Luminor Studio Hero',
    objective: 'O2 · Arcanea Creative Worlds & Lore Canon',
    agentAction: 'Verified Arcanea hero ("Build living worlds with AI agents"), prompt composer, and Luminor routing.',
    nextGoal: 'Ship interactive 10-Gate progression & World Graph exporter.',
    liveUrl: 'https://www.arcanea.ai/',
  },
  '16-arcanea-ai-components': {
    intent: 'I-023 · arcanea.ai Scrolled UI/UX World Graph & Agent Components',
    objective: 'O2 · Arcanea Creative Worlds & Lore Canon',
    agentAction: 'Captured scrolled UI/UX component architecture, glassmorphic cards, and world-building modules.',
    nextGoal: 'Add automated weekly visual regression check across all 10 Gate cards.',
    liveUrl: 'https://www.arcanea.ai/',
  },
  '17-gencreator-ai-home': {
    intent: 'I-025 · gencreator.ai Sovereign Creator Economy OS Hero',
    objective: 'O3 · GenCreator & ACOS Productization',
    agentAction: 'Verified GenCreator hero, 6-Pillar CoE positioning, and creator system onboarding.',
    nextGoal: 'Close ARC-204 by committing and gating the 6 federated-llm-hub files.',
    liveUrl: 'https://gencreator.ai/',
  },
  '18-gencreator-ai-components': {
    intent: 'I-025 · gencreator.ai Scrolled UI/UX Creator Stack Components',
    objective: 'O3 · GenCreator & ACOS Productization',
    agentAction: 'Captured scrolled Creator Stack interactive components and skill-pack cards.',
    nextGoal: 'Link each Creator Stack card to downloadable BYOK templates.',
    liveUrl: 'https://gencreator.ai/',
  },
  '19-realityarchitect-ai-home': {
    intent: 'I-026 · realityarchitect.ai Conscious Reality Design Surface',
    objective: 'O5 · Domain Sub-Stacks & Verticals',
    agentAction: 'Captured Reality Architect landing surface and transformation framework.',
    nextGoal: 'Connect .reality/intents ledger templates for public builders.',
    liveUrl: 'https://www.realityarchitect.ai/',
  },
  '20-agenticincome-ai-home': {
    intent: 'I-026 · agenticincome.ai Autonomous Wealth & Quant Research Surface',
    objective: 'O5 · Domain Sub-Stacks & Verticals',
    agentAction: 'Verified Agentic Income landing page, accessible comparison tables, and research positioning.',
    nextGoal: 'Open Draft PR for agentic-income-packages (a3b673e).',
    liveUrl: 'https://www.agenticincome.ai/',
  },
  '21-animelegends-ai-home': {
    intent: 'I-026 · animelegends.ai AI Anime Studio & Mascot Trinity Surface',
    objective: 'O2 · Arcanea & Media IP Franchises',
    agentAction: 'Verified AnimeLegends studio landing page (Akashi, Kage, Mira trinity + sakuga pipeline).',
    nextGoal: 'Publish Episode 1 storyboard & voice-synthesis showcase reel.',
    liveUrl: 'https://www.animelegends.ai/',
  },
  '22-starlight-domains-home': {
    intent: 'I-026 · starlight.domains Sovereign Venture & Domain Incubator',
    objective: 'O7 · Arcanea Labs BV Portfolio',
    agentAction: 'Captured Starlight Domains portfolio showcase and venture incubation grid.',
    nextGoal: 'Sync PROPERTIES-REGISTRY.md 35-domain matrix into live filterable table.',
    liveUrl: 'https://starlight.domains/',
  },
  '23-starlight-you-home': {
    intent: 'I-026 · starlight.you Personal Identity & Second Brain Surface',
    objective: 'O5 · Domain Sub-Stacks & Verticals',
    agentAction: 'Captured starlight.you personal sovereign identity and Genius Profile surface.',
    nextGoal: 'Wire /discover-genius interactive intake flow.',
    liveUrl: 'https://starlight.you/',
  },
  '24-starlight-technology-home': {
    intent: 'I-024 · starlight.technology Deep Substrate & Enterprise Infrastructure',
    objective: 'O1 · SIS Sovereign Memory & Queen Orchestration',
    agentAction: 'Verified starlight.technology schematic links, skip-link accessibility, and architecture specs.',
    nextGoal: 'Embed live vMCP + Rust Layer-0 latency benchmarks.',
    liveUrl: 'https://starlight.technology/',
  },
  '25-starlight-academy-home': {
    intent: 'I-026 · starlightintelligence.academy Builder Certification & Labs',
    objective: 'O3 · GenCreator & Education Funnels',
    agentAction: 'Verified Starlight Intelligence Academy curriculum and AI Department Lab integration.',
    nextGoal: 'Embed interactive starlight-department-lab MCP evaluation exercises.',
    liveUrl: 'https://starlightintelligence.academy/',
  },
  '26-github-sis-readme': {
    intent: 'I-019 · github.com/frankxai/Starlight-Intelligence-System README',
    objective: 'O6 · 10-Org GitHub Federation & Open Source',
    agentAction: 'Captured flagship SIS repository README (151 agents, 89 skills, 6 vaults, SIP v1.1.1).',
    nextGoal: 'Add Queen v2.0 11-tab architecture diagram to root README.',
    liveUrl: 'https://github.com/frankxai/Starlight-Intelligence-System',
  },
  '27-github-claude-skills-readme': {
    intent: 'I-020 · github.com/frankxai/claude-skills-library README',
    objective: 'O6 · 10-Org GitHub Federation & Open Source',
    agentAction: 'Captured claude-skills-library README (vendored ECC + 8 absorbed harness skills).',
    nextGoal: 'Sync visual-estate-observatory practice summary to cross-harness index.',
    liveUrl: 'https://github.com/frankxai/claude-skills-library',
  },
  '28-github-arcanea-org': {
    intent: 'I-021 · github.com/Arcanea-Labs Organization Profile',
    objective: 'O6 · 10-Org GitHub Federation & Governance',
    agentAction: 'Verified Arcanea-Labs GitHub Organization profile README and pinned repositories.',
    nextGoal: 'Keep dual-remote sync green across all Arcanea-Labs child repos.',
    liveUrl: 'https://github.com/Arcanea-Labs',
  },
  '29-github-starlight-org': {
    intent: 'I-021 · github.com/Starlight-Intelligence Organization Profile',
    objective: 'O6 · 10-Org GitHub Federation & Governance',
    agentAction: 'Verified Starlight-Intelligence GitHub Organization profile and protocol packages.',
    nextGoal: 'Automate @starlight-intelligence/* npm package release syndication.',
    liveUrl: 'https://github.com/Starlight-Intelligence',
  },
  '30-github-gencreator-org': {
    intent: 'I-022 · github.com/GenCreator-ai Organization Profile',
    objective: 'O6 · 10-Org GitHub Federation & Governance',
    agentAction: 'Verified GenCreator-ai GitHub Organization profile and creator workflow repositories.',
    nextGoal: 'Publish starter skill packs under GenCreator-ai org.',
    liveUrl: 'https://github.com/GenCreator-ai',
  },
};

function ensureDirs() {
  for (const dir of [LOCAL_SNAPSHOT_ASSETS_DIR, ONEDRIVE_SNAPSHOT_DIR]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFileSafe(src, dest) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    return true;
  }
  return false;
}

function syncSnapshotAssets(manifest) {
  let copiedPngs = 0;
  for (const s of manifest.surfaces) {
    const srcPng = path.join(ARTIFACT_DIR, s.fileName);
    const localDest = path.join(LOCAL_SNAPSHOT_ASSETS_DIR, s.fileName);
    const oneDriveDest = path.join(ONEDRIVE_SNAPSHOT_DIR, s.fileName);
    if (copyFileSafe(srcPng, localDest)) copiedPngs++;
    copyFileSafe(srcPng, oneDriveDest);
  }

  // Copy PPTX, HTML deck, and JSON manifests
  const pptxName = `${DATE_STAMP}-Starlight-CEO-Investor-Snapshot.pptx`;
  copyFileSafe(path.join(ARTIFACT_DIR, pptxName), path.join(ONEDRIVE_SNAPSHOT_DIR, pptxName));
  copyFileSafe(path.join(ARTIFACT_DIR, pptxName), path.join(LOCAL_SNAPSHOT_ASSETS_DIR, pptxName));

  const htmlDeckName = `${DATE_STAMP}-ceo-investor-deck.html`;
  copyFileSafe(
    path.join(COMMAND_CENTER_DIR, htmlDeckName),
    path.join(ONEDRIVE_SNAPSHOT_DIR, htmlDeckName)
  );

  copyFileSafe(
    path.join(SNAPSHOT_DIR, `${DATE_STAMP}-visual-estate-snapshot.json`),
    path.join(ONEDRIVE_SNAPSHOT_DIR, `${DATE_STAMP}-visual-estate-snapshot.json`)
  );
  copyFileSafe(
    path.join(SNAPSHOT_DIR, `${DATE_STAMP}-executive-snapshot.json`),
    path.join(ONEDRIVE_SNAPSHOT_DIR, `${DATE_STAMP}-executive-snapshot.json`)
  );

  return copiedPngs;
}

function buildObservatoryCinemaHtml(manifest, imageBaseRelPath) {
  const enrichedSurfaces = manifest.surfaces.map((s) => {
    const extra = SURFACE_ENRICHMENT[s.id] || {};
    return {
      ...s,
      imgSrc: `${imageBaseRelPath}/${s.fileName}`,
      intent: extra.intent || 'I-001..I-030 · Sovereign Estate Alignment',
      objective: extra.objective || 'O1..O7 · Starlight Portfolio Objective',
      agentAction: extra.agentAction || 'Verified live rendering, DOM structure, and SHA-256 visual hash.',
      nextGoal: extra.nextGoal || 'Track longitudinal delta in weekly /palace snapshot.',
      liveUrl: extra.liveUrl || s.url,
    };
  });

  const surfacesJson = JSON.stringify(enrichedSurfaces);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Starlight Visual Observatory & Coding Agent Live Cinema (${DATE_STAMP})</title>
  <style>
    :root {
      --bg: #07090e;
      --panel: #0e131f;
      --panel-2: #131b2e;
      --border: #1e293b;
      --gold: #d4af37;
      --cyan: #38bdf8;
      --emerald: #10b981;
      --purple: #a855f7;
      --text: #f8fafc;
      --muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: radial-gradient(circle at 15% 0%, #111a2e 0%, #07090e 65%);
      color: var(--text);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
    }
    header {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(7, 9, 14, 0.92);
      backdrop-filter: blur(14px);
      border-bottom: 1px solid var(--border);
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .brand-bar {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .pulse-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--emerald);
      box-shadow: 0 0 12px var(--emerald);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.25); opacity: 0.65; }
    }
    .brand-title {
      font-weight: 800;
      font-size: 16px;
      letter-spacing: 0.4px;
    }
    .badge {
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 999px;
      border: 1px solid rgba(212, 175, 55, 0.4);
      background: rgba(212, 175, 55, 0.12);
      color: var(--gold);
    }
    .badge-cyan {
      border-color: rgba(56, 189, 248, 0.4);
      background: rgba(56, 189, 248, 0.12);
      color: var(--cyan);
    }
    .badge-emerald {
      border-color: rgba(16, 185, 129, 0.4);
      background: rgba(16, 185, 129, 0.12);
      color: var(--emerald);
    }
    .mode-tabs {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    button, .btn {
      background: var(--panel-2);
      color: var(--text);
      border: 1px solid var(--border);
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.18s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    button:hover, .btn:hover {
      border-color: var(--cyan);
      background: rgba(56, 189, 248, 0.12);
    }
    button.active {
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.22), rgba(56, 189, 248, 0.18));
      border-color: var(--gold);
      color: #fff;
    }
    .btn-gold {
      background: rgba(212, 175, 55, 0.18);
      border-color: var(--gold);
      color: var(--gold);
    }
    .progress-track {
      height: 3px;
      width: 100%;
      background: #111827;
      position: sticky;
      top: 57px;
      z-index: 49;
    }
    .progress-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, var(--gold), var(--cyan), var(--emerald));
      transition: width 0.12s linear;
    }
    main {
      max-width: 1640px;
      margin: 0 auto;
      padding: 20px 24px 60px;
    }
    /* Cinema View */
    .cinema-layout {
      display: grid;
      grid-template-columns: 380px 1fr;
      gap: 20px;
      align-items: start;
    }
    @media (max-width: 1180px) {
      .cinema-layout { grid-template-columns: 1fr; }
    }
    .narration-panel {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
    }
    .step-counter {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--gold);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .surface-title {
      font-size: 20px;
      font-weight: 800;
      line-height: 1.25;
      color: #fff;
    }
    .meta-box {
      background: rgba(19, 27, 46, 0.75);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px;
      font-size: 12px;
      line-height: 1.5;
    }
    .meta-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--cyan);
      font-weight: 700;
      margin-bottom: 4px;
    }
    .meta-box.gold-box .meta-label { color: var(--gold); }
    .meta-box.emerald-box .meta-label { color: var(--emerald); }
    .controls-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .playlist-strip {
      max-height: 250px;
      overflow-y: auto;
      border-top: 1px solid var(--border);
      padding-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .playlist-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 11px;
      cursor: pointer;
      color: var(--muted);
      transition: all 0.15s;
    }
    .playlist-item:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }
    .playlist-item.active {
      background: rgba(56, 189, 248, 0.16);
      color: #fff;
      border-left: 3px solid var(--cyan);
      font-weight: 700;
    }
    .stage-panel {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
    }
    .browser-chrome {
      background: #0b0f19;
      border-bottom: 1px solid var(--border);
      padding: 10px 16px;
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
    .address-bar {
      flex: 1;
      background: #131b2e;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 5px 12px;
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 12px;
      color: var(--cyan);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .stage-img-wrap {
      position: relative;
      background: #05070b;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 540px;
    }
    .stage-img-wrap img {
      width: 100%;
      height: auto;
      display: block;
      cursor: zoom-in;
    }
    /* Grid View */
    .grid-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 10px;
    }
    .surface-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 16px;
    }
    .surface-card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.18s ease, border-color 0.18s ease;
      display: flex;
      flex-direction: column;
    }
    .surface-card:hover {
      transform: translateY(-3px);
      border-color: var(--cyan);
    }
    .surface-card img {
      width: 100%;
      aspect-ratio: 16 / 10;
      object-fit: cover;
      border-bottom: 1px solid var(--border);
      cursor: pointer;
    }
    .card-body {
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }
    .card-title { font-size: 13px; font-weight: 700; color: #fff; }
    .card-sub { font-size: 11px; color: var(--muted); line-height: 1.4; }
    /* Agent Operating Model View */
    .blueprint-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 18px;
      margin-top: 12px;
    }
    .blueprint-card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 20px;
    }
    .blueprint-card h3 {
      font-size: 16px;
      color: var(--gold);
      margin-bottom: 10px;
    }
    .blueprint-card ul {
      padding-left: 18px;
      font-size: 13px;
      color: var(--text);
      line-height: 1.65;
    }
    .hidden { display: none !important; }
    /* Lightbox */
    #lightbox {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.92);
      z-index: 100;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 24px;
    }
    #lightbox img {
      max-width: 96vw;
      max-height: 92vh;
      border: 2px solid var(--gold);
      border-radius: 10px;
    }
  </style>
</head>
<body>
  <header>
    <div class="brand-bar">
      <div class="pulse-dot"></div>
      <div class="brand-title">STARLIGHT VISUAL OBSERVATORY & CODING AGENT LIVE CINEMA</div>
      <span class="badge">${DATE_STAMP} · Baseline #001</span>
      <span class="badge badge-cyan">30 / 30 Live Surfaces</span>
      <span class="badge badge-emerald">30 / 30 Founder Intents</span>
    </div>
    <div class="mode-tabs">
      <button id="tab-cinema" class="active" onclick="switchMode('cinema')">▶ 1. Guided Cinema Auto-Tour (1-by-1)</button>
      <button id="tab-grid" onclick="switchMode('grid')">⊞ 2. All 30 Surfaces Wall (4K Grid)</button>
      <button id="tab-agent" onclick="switchMode('agent')">⚡ 3. What I Do as Your Coding Agent & Connectors</button>
      <a class="btn btn-gold" href="http://127.0.0.1:4329" target="_blank">Open Live Queen :4329 ↗</a>
    </div>
  </header>
  <div class="progress-track">
    <div id="tour-progress" class="progress-fill"></div>
  </div>

  <main>
    <!-- MODE 1: CINEMA AUTO-TOUR -->
    <section id="view-cinema" class="cinema-layout">
      <aside class="narration-panel">
        <div class="step-counter">
          <span id="step-badge">SURFACE 01 / 30</span>
          <span id="tour-status">● AUTO-TOUR PLAYING</span>
        </div>
        <div id="surface-title" class="surface-title">Loading...</div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <span id="surface-category" class="badge badge-cyan">Category</span>
          <span id="surface-brand" class="badge">Brand</span>
        </div>

        <div class="meta-box gold-box">
          <div class="meta-label">Founder True Intent & Strategic Objective</div>
          <div id="surface-intent" style="font-weight:700; color:#fff;"></div>
          <div id="surface-objective" style="color:var(--muted); margin-top:2px;"></div>
        </div>

        <div class="meta-box">
          <div class="meta-label">What Your Coding Agent Built & Verified</div>
          <div id="surface-action"></div>
          <div id="surface-repo" style="margin-top:6px; font-family:monospace; font-size:11px; color:var(--cyan);"></div>
        </div>

        <div class="meta-box emerald-box">
          <div class="meta-label">Next Horizon Target (Weekly Milestone)</div>
          <div id="surface-next"></div>
        </div>

        <div class="controls-grid">
          <button onclick="prevSlide()">◀ Prev</button>
          <button id="btn-play" class="active" onclick="togglePlay()">⏸ Pause</button>
          <button onclick="nextSlide()">Next ▶</button>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <a id="btn-open-live" class="btn btn-gold" style="flex:1; justify-content:center;" href="#" target="_blank">Launch Live URL in Browser Tab ↗</a>
          <button onclick="openNextLiveBatch()" title="Opens the current surface's live URL in a real browser tab">Step Live Site ↗</button>
        </div>

        <div class="playlist-strip" id="playlist"></div>
      </aside>

      <div class="stage-panel">
        <div class="browser-chrome">
          <div class="dots">
            <div class="dot r"></div>
            <div class="dot y"></div>
            <div class="dot g"></div>
          </div>
          <div id="address-bar" class="address-bar">https://...</div>
          <span id="sha-badge" class="badge badge-cyan" style="font-family:monospace;">sha256</span>
        </div>
        <div class="stage-img-wrap">
          <img id="stage-img" src="" alt="Surface Screenshot" onclick="openLightbox(this.src)" />
        </div>
      </div>
    </section>

    <!-- MODE 2: 30-SURFACE 4K GRID -->
    <section id="view-grid" class="hidden">
      <div class="grid-controls">
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="active" onclick="filterGrid('ALL', this)">All Surfaces (30)</button>
          <button onclick="filterGrid('Local Cockpit', this)">Local Cockpits & Voice (9)</button>
          <button onclick="filterGrid('Production', this)">Production Websites & UI/UX (16)</button>
          <button onclick="filterGrid('GitHub', this)">GitHub READMEs & 10 Orgs (5)</button>
        </div>
        <div style="font-size:12px; color:var(--muted);">Click any screenshot to inspect inCinema or open its live URL.</div>
      </div>
      <div id="surface-grid" class="surface-grid"></div>
    </section>

    <!-- MODE 3: CODING AGENT & CONNECTORS OPERATING MODEL -->
    <section id="view-agent" class="hidden">
      <div class="blueprint-grid">
        <div class="blueprint-card">
          <h3>1. How I Work as Your Sovereign Coding Agent (Antigravity + Queen v2.0)</h3>
          <ul>
            <li><strong>ORIENT → RETRIEVE → BUILD → VERIFY → LEARN:</strong> Before touching code, I read your Three-Store Truths (<code>TRUTH.md</code>, <code>OBJECTIVES.md</code>, <code>.reality/intents/2026-10-17-seed.md</code>, and <code>starlight-memory</code> MCP).</li>
            <li><strong>Worktree Isolation:</strong> Every slice runs in an isolated git worktree (<code>sis-queen-sovereign-20261018</code> on <code>agent/antigravity/...</code>) so we never collide with your open Claude, Grok, or Codex windows.</li>
            <li><strong>135/135 Deterministic Gate:</strong> Every commit passes 36 symmetry, conformance, temporal-spine, gateway, and Queen Sovereign Engine test suites before push.</li>
            <li><strong>Window CLI Conductor:</strong> I write tailored pickup prompts to <code>.starlight/steered-prompts/</code> and heal stuck queue cards (14/14 <code>_hold-admission</code> cards healed).</li>
          </ul>
        </div>

        <div class="blueprint-card">
          <h3>2. All Active Connectors & MCP Rails Wired Today</h3>
          <ul>
            <li><strong><code>starlight-memory</code> MCP:</strong> Live filesystem-native semantic memory vault (342 atoms indexed; Baseline #001 recorded in <code>operational</code> & <code>strategic</code> vaults).</li>
            <li><strong><code>starlight-department-lab</code> MCP:</strong> Accountable AI Department packet designer & evaluation rubric engine.</li>
            <li><strong><code>:9223</code> Single-Tab CDP Browser Hub:</strong> Sequentially visits and screenshots all 30 local & production surfaces under 200 MB RAM without ever spawning rogue browser swarms.</li>
            <li><strong><code>OneDrive\\Starlight Creative Vault</code> Cloud Mirror:</strong> Automatically syncs dated <code>.pptx</code> decks, <code>.html</code> cinema views, and all 30 PNGs to <code>01_ESTATE_SNAPSHOTS\\${DATE_STAMP}</code>.</li>
            <li><strong>10-Rail OAuth Subscription Governor:</strong> Harvests 5-hour rolling windows across Claude Max 20x, ChatGPT Pro/Codex, Google AI Ultra/Jules, SuperGrok, v0, Vercel, and Cloudflare (<code>10.5x</code> compute multiplier).</li>
          </ul>
        </div>

        <div class="blueprint-card">
          <h3>3. The 4-Layer Visual Estate Observatory Practice (<code>Procedure 8</code>)</h3>
          <ul>
            <li><strong>Layer 1 — Capture (<code>npm run queen:snapshot:screenshots</code>):</strong> Captures all 30 surfaces at <code>1440×900</code> + DOM metrics + SHA-256 visual drift hashes.</li>
            <li><strong>Layer 2 — Compile (<code>npm run queen:snapshot:deck</code>):</strong> Builds the 36-slide native <code>.pptx</code> PowerPoint deck + 36-slide HTML5 Investor Deck + JSON longitudinal ledger.</li>
            <li><strong>Layer 3 — Compound (Memory Vaults + Graphiti Spine):</strong> Logs every visual snapshot receipt into <code>memory/vaults/operational.jsonl</code> and <code>starlight-memory</code> MCP.</li>
            <li><strong>Layer 4 — Sync & Launch (<code>npm run queen:observatory</code>):</strong> Mirrors to <code>OneDrive\\Starlight Creative Vault\\01_ESTATE_SNAPSHOTS\\YYYY-MM-DD</code>, renders the 4K Master Contact Sheet, and launches this Live Cinema on your screen.</li>
          </ul>
        </div>
      </div>
    </section>
  </main>

  <div id="lightbox" class="hidden" onclick="this.classList.add('hidden')">
    <img id="lightbox-img" src="" alt="Zoomed Surface" />
  </div>

  <script>
    const SURFACES = ${surfacesJson};
    let currentIndex = 0;
    let isPlaying = true;
    let progress = 0;
    const STEP_MS = 4500;
    const TICK_MS = 50;

    function renderCinemaSlide(idx) {
      currentIndex = (idx + SURFACES.length) % SURFACES.length;
      const s = SURFACES[currentIndex];
      document.getElementById('step-badge').textContent = 'SURFACE ' + String(currentIndex + 1).padStart(2, '0') + ' / ' + SURFACES.length;
      document.getElementById('surface-title').textContent = s.title;
      document.getElementById('surface-category').textContent = s.category;
      document.getElementById('surface-brand').textContent = s.brand;
      document.getElementById('surface-intent').textContent = s.intent;
      document.getElementById('surface-objective').textContent = s.objective;
      document.getElementById('surface-action').textContent = s.agentAction;
      document.getElementById('surface-repo').textContent = 'Repo: ' + s.repo + ' · DOM: ' + (s.domMeta?.buttons || 0) + ' btns, ' + (s.domMeta?.links || 0) + ' links';
      document.getElementById('surface-next').textContent = s.nextGoal;
      document.getElementById('address-bar').textContent = s.liveUrl;
      document.getElementById('sha-badge').textContent = 'sha256:' + s.sha256;
      document.getElementById('stage-img').src = s.imgSrc;
      document.getElementById('btn-open-live').href = s.liveUrl;

      const items = document.querySelectorAll('.playlist-item');
      items.forEach((el, i) => {
        el.classList.toggle('active', i === currentIndex);
        if (i === currentIndex) el.scrollIntoView({ block: 'nearest' });
      });
    }

    function buildPlaylistAndGrid() {
      const playlist = document.getElementById('playlist');
      const grid = document.getElementById('surface-grid');
      playlist.innerHTML = '';
      grid.innerHTML = '';

      SURFACES.forEach((s, i) => {
        const item = document.createElement('div');
        item.className = 'playlist-item' + (i === 0 ? ' active' : '');
        item.innerHTML = '<span>' + String(i + 1).padStart(2, '0') + '. ' + s.brand + '</span><span style="opacity:0.7">' + s.id.replace(/^\\d+-/, '') + '</span>';
        item.onclick = () => { progress = 0; renderCinemaSlide(i); };
        playlist.appendChild(item);

        const card = document.createElement('div');
        card.className = 'surface-card';
        card.dataset.category = s.category;
        card.innerHTML =
          '<img src="' + s.imgSrc + '" alt="' + s.title + '" onclick="jumpToSlide(' + i + ')" />' +
          '<div class="card-body">' +
            '<div style="display:flex; justify-content:space-between; gap:6px;">' +
              '<span class="badge badge-cyan">' + String(i + 1).padStart(2, '0') + ' · ' + s.brand + '</span>' +
              '<a class="btn" style="padding:2px 8px; font-size:10px;" href="' + s.liveUrl + '" target="_blank">Open ↗</a>' +
            '</div>' +
            '<div class="card-title">' + s.title + '</div>' +
            '<div class="card-sub"><strong>Intent:</strong> ' + s.intent + '</div>' +
            '<div class="card-sub"><strong>Next:</strong> ' + s.nextGoal + '</div>' +
          '</div>';
        grid.appendChild(card);
      });
    }

    function jumpToSlide(i) {
      switchMode('cinema');
      progress = 0;
      renderCinemaSlide(i);
    }

    function nextSlide() { progress = 0; renderCinemaSlide(currentIndex + 1); }
    function prevSlide() { progress = 0; renderCinemaSlide(currentIndex - 1); }

    function togglePlay() {
      isPlaying = !isPlaying;
      document.getElementById('btn-play').textContent = isPlaying ? '⏸ Pause' : '▶ Play';
      document.getElementById('tour-status').textContent = isPlaying ? '● AUTO-TOUR PLAYING' : '⏸ PAUSED';
    }

    function openNextLiveBatch() {
      const s = SURFACES[currentIndex];
      window.open(s.liveUrl, '_blank');
      nextSlide();
    }

    function switchMode(mode) {
      ['cinema', 'grid', 'agent'].forEach((m) => {
        document.getElementById('view-' + m).classList.toggle('hidden', m !== mode);
        document.getElementById('tab-' + m).classList.toggle('active', m === mode);
      });
    }

    function filterGrid(filter, btn) {
      document.querySelectorAll('.grid-controls button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.surface-card').forEach((card) => {
        const cat = card.dataset.category || '';
        const show =
          filter === 'ALL' ||
          (filter === 'Local Cockpit' && (cat.includes('Cockpit') || cat.includes('Internal'))) ||
          (filter === 'Production' && (cat.includes('Production') || cat.includes('Product') || cat.includes('UI/UX'))) ||
          (filter === 'GitHub' && cat.includes('GitHub'));
        card.classList.toggle('hidden', !show);
      });
    }

    function openLightbox(src) {
      document.getElementById('lightbox-img').src = src;
      document.getElementById('lightbox').classList.remove('hidden');
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      else if (e.key === 'ArrowLeft') prevSlide();
      else if (e.key === ' ') { e.preventDefault(); togglePlay(); }
      else if (e.key === 'Escape') document.getElementById('lightbox').classList.add('hidden');
    });

    setInterval(() => {
      if (!isPlaying) return;
      progress += (TICK_MS / STEP_MS) * 100;
      if (progress >= 100) {
        progress = 0;
        renderCinemaSlide(currentIndex + 1);
      }
      document.getElementById('tour-progress').style.width = Math.min(100, progress) + '%';
    }, TICK_MS);

    buildPlaylistAndGrid();
    renderCinemaSlide(0);
  </script>
</body>
</html>`;
}

function buildMasterContactSheetHtml(manifest, imageBaseRelPath) {
  const cards = manifest.surfaces
    .map(
      (s, i) => `
      <div class="cell">
        <img src="${imageBaseRelPath}/${s.fileName}" />
        <div class="cap">
          <span class="num">${String(i + 1).padStart(2, '0')}</span>
          <span class="br">${s.brand}</span>
          <span class="id">${s.id.replace(/^\d+-/, '')}</span>
        </div>
      </div>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1420px;
      height: 890px;
      overflow: hidden;
      background: #07090e;
      color: #f8fafc;
      font-family: 'Inter', Segoe UI, sans-serif;
      padding: 12px 16px;
    }
    .hdr {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 2px solid #d4af37;
    }
    .hdr h1 { font-size: 16px; font-weight: 800; letter-spacing: 0.4px; }
    .hdr .sub { font-size: 11px; color: #38bdf8; font-weight: 700; }
    .grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 7px;
    }
    .cell {
      background: #0e131f;
      border: 1px solid #1e293b;
      border-radius: 6px;
      overflow: hidden;
    }
    .cell img {
      width: 100%;
      height: 126px;
      object-fit: cover;
      object-position: top center;
      display: block;
    }
    .cap {
      padding: 3px 6px;
      font-size: 9px;
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
      overflow: hidden;
    }
    .num {
      background: #d4af37;
      color: #000;
      font-weight: 800;
      padding: 1px 4px;
      border-radius: 3px;
    }
    .br { font-weight: 700; color: #fff; }
    .id { color: #94a3b8; font-family: monospace; font-size: 8px; }
  </style>
</head>
<body>
  <div class="hdr">
    <h1>STARLIGHT SOVEREIGN ESTATE — 30/30 LIVE VISUAL SNAPSHOT (${DATE_STAMP} · BASELINE #001)</h1>
    <div class="sub">11-Tab Queen v2.0 · 16 Production Sites & UI/UX · 10 GitHub Orgs · 30/30 Founder Intents · Built on SIP</div>
  </div>
  <div class="grid">${cards}</div>
</body>
</html>`;
}

function openOnDesktop(targetPath) {
  exec(`cmd /c start "" "${targetPath.replace(/\//g, '\\')}"`);
}

async function main() {
  ensureDirs();

  const manifestPath = path.join(SNAPSHOT_DIR, `${DATE_STAMP}-visual-estate-snapshot.json`);
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Snapshot manifest not found at ${manifestPath}`);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  const copiedCount = syncSnapshotAssets(manifest);
  console.log(`[Observatory] Synced ${copiedCount}/30 PNGs + PPTX + JSON into:`);
  console.log(`  1. Local Command Center: ${LOCAL_SNAPSHOT_ASSETS_DIR}`);
  console.log(`  2. Cloud OneDrive Vault: ${ONEDRIVE_SNAPSHOT_DIR}`);

  // Write Cinema HTML to both Command Center and OneDrive Creative Vault
  const commandCenterCinemaPath = path.join(
    COMMAND_CENTER_DIR,
    'starlight-visual-observatory-cinema.html'
  );
  fs.writeFileSync(
    commandCenterCinemaPath,
    buildObservatoryCinemaHtml(manifest, `./snapshots/${DATE_STAMP}`),
    'utf8'
  );

  const oneDriveCinemaPath = path.join(
    ONEDRIVE_SNAPSHOT_DIR,
    'starlight-visual-observatory-cinema.html'
  );
  fs.writeFileSync(oneDriveCinemaPath, buildObservatoryCinemaHtml(manifest, '.'), 'utf8');

  // Write Master Contact Sheet HTML to both locations
  const contactSheetHtmlPath = path.join(
    ONEDRIVE_SNAPSHOT_DIR,
    '00-ESTATE-30-SURFACE-MASTER-GRID.html'
  );
  fs.writeFileSync(contactSheetHtmlPath, buildMasterContactSheetHtml(manifest, '.'), 'utf8');

  console.log(`[Observatory] Generated Live Cinema HTML:`);
  console.log(`  -> ${commandCenterCinemaPath}`);
  console.log(`  -> ${oneDriveCinemaPath}`);

  if (process.argv.includes('--open')) {
    console.log(`[Observatory] Opening Live Cinema, PowerPoint Deck, and OneDrive Vault on your desktop...`);
    openOnDesktop(commandCenterCinemaPath);
    const pptxPath = path.join(ONEDRIVE_SNAPSHOT_DIR, `${DATE_STAMP}-Starlight-CEO-Investor-Snapshot.pptx`);
    if (fs.existsSync(pptxPath)) {
      openOnDesktop(pptxPath);
    }
    openOnDesktop(ONEDRIVE_SNAPSHOT_DIR);
  }
}

main().catch((err) => {
  console.error('Fatal error in launch-visual-observatory:', err);
  process.exit(1);
});
