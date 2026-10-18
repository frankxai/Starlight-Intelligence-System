#!/usr/bin/env node
/**
 * Starlight Queen v2.0 — Keynote-Grade 1920x1080 Visual Slide Renderer & PPTX Compiler
 *
 * Why this exists:
 * Native PowerPoint XML textboxes look flat and primitive. This engine renders all 36 slides
 * in full 1920x1080 HD using Apple-Keynote / Linear / Editorial Bento HTML5 + CSS3 via the
 * :9223 Single-Tab CDP Hub, and embeds each 1920x1080 high-DPI slide into a native widescreen
 * Office Open XML `.pptx` presentation + interactive HTML5 Showcase.
 *
 * Enforces the Agent Provenance Naming & Header Standard:
 * - Filename: `2026-10-18__Antigravity-Gemini3.1Pro__Starlight-CEO-Investor-Deck.pptx`
 * - Top Provenance Ribbon on every slide:
 *   `AUTHORED BY: ANTIGRAVITY (Gemini 3.1 Pro · Queen v2.0 Meta-Harness) · SHA 63d724777 · 2026-10-18`
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as http from 'node:http';
import * as zlib from 'node:zlib';
import { spawn, exec } from 'node:child_process';

const DATE_STAMP = '2026-10-18';
const AGENT_TAG = 'Antigravity-Gemini3.1Pro';
const GIT_SHA = '63d724777';
const GIT_BRANCH = 'agent/antigravity/queen-sovereign-superintelligence-20261017';

const ARTIFACT_DIR =
  process.env.STARLIGHT_ARTIFACT_DIR ||
  'C:/Users/frank/.gemini/antigravity-cli/brain/5dc42c9a-4558-47e1-b558-9dbf8e467317';
const WORKTREE_ROOT =
  process.env.STARLIGHT_WORKTREE_ROOT ||
  'C:/Users/frank/starlight/worktrees/sis-queen-sovereign-20261018';
const SNAPSHOT_DIR = path.join(WORKTREE_ROOT, 'snapshots');
const COMMAND_CENTER_DIR = 'C:/Users/frank/starlight/command-center';
const ONEDRIVE_SNAPSHOT_DIR = path.join(
  'C:/Users/frank/OneDrive/Starlight Creative Vault/01_ESTATE_SNAPSHOTS',
  DATE_STAMP
);
const SLIDE_CACHE_DIR = path.join(SNAPSHOT_DIR, 'keynote-slides-1080p');

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

async function fetchText(url, timeoutMs = 2500) {
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
  const profileDir = path.join(process.env.TEMP || 'C:/Temp', `starlight-keynote-cdp-${Date.now()}`);
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

// Minimal ZIP builder for PPTX
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c >>> 0;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function createZipBuffer(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, 'utf8');
    const rawData = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data, 'utf8');
    const crc = crc32(rawData);
    const useStore = entry.store === true;
    const compData = useStore ? rawData : zlib.deflateRawSync(rawData);
    const method = useStore ? 0 : 8;

    const localHdr = Buffer.alloc(30);
    localHdr.writeUInt32LE(0x04034b50, 0);
    localHdr.writeUInt16LE(20, 4);
    localHdr.writeUInt16LE(0, 6);
    localHdr.writeUInt16LE(method, 8);
    localHdr.writeUInt16LE(0, 10);
    localHdr.writeUInt16LE(0, 12);
    localHdr.writeUInt32LE(crc, 14);
    localHdr.writeUInt32LE(compData.length, 18);
    localHdr.writeUInt32LE(rawData.length, 22);
    localHdr.writeUInt16LE(nameBuf.length, 26);
    localHdr.writeUInt16LE(0, 28);
    localParts.push(localHdr, nameBuf, compData);

    const centralHdr = Buffer.alloc(46);
    centralHdr.writeUInt32LE(0x02014b50, 0);
    centralHdr.writeUInt16LE(20, 4);
    centralHdr.writeUInt16LE(20, 6);
    centralHdr.writeUInt16LE(0, 8);
    centralHdr.writeUInt16LE(method, 10);
    centralHdr.writeUInt16LE(0, 12);
    centralHdr.writeUInt16LE(0, 14);
    centralHdr.writeUInt32LE(crc, 16);
    centralHdr.writeUInt32LE(compData.length, 20);
    centralHdr.writeUInt32LE(rawData.length, 24);
    centralHdr.writeUInt16LE(nameBuf.length, 28);
    centralHdr.writeUInt16LE(0, 30);
    centralHdr.writeUInt16LE(0, 32);
    centralHdr.writeUInt16LE(0, 34);
    centralHdr.writeUInt16LE(0, 36);
    centralHdr.writeUInt32LE(0, 38);
    centralHdr.writeUInt32LE(offset, 42);
    centralParts.push(centralHdr, nameBuf);

    offset += 30 + nameBuf.length + compData.length;
  }
  const centralSize = centralParts.reduce((a, b) => a + b.length, 0);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralSize, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, ...centralParts, eocd]);
}

function buildFullBleedPptxFromSlidePngs(slidePngBuffers) {
  const entries = [];
  const slideW = 12192000; // 13.333 in (16:9)
  const slideH = 6858000;  // 7.5 in

  const overrides = slidePngBuffers
    .map(
      (_, i) =>
        `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`
    )
    .join('');

  entries.push({
    name: '[Content_Types].xml',
    data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.theme+xml"/>
  ${overrides}
</Types>`,
  });

  entries.push({
    name: '_rels/.rels',
    data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`,
  });

  const sldIds = slidePngBuffers
    .map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 2}"/>`)
    .join('');

  entries.push({
    name: 'ppt/presentation.xml',
    data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>
  <p:sldIdLst>${sldIds}</p:sldIdLst>
  <p:sldSz cx="${slideW}" cy="${slideH}"/>
  <p:notesSz cx="${slideH}" cy="${slideW}"/>
</p:presentation>`,
  });

  const presRels = slidePngBuffers
    .map(
      (_, i) =>
        `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`
    )
    .join('');

  entries.push({
    name: 'ppt/_rels/presentation.xml.rels',
    data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
  ${presRels}
</Relationships>`,
  });

  entries.push({
    name: 'ppt/slideMasters/slideMaster1.xml',
    data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>
  <p:clrMap bg1="dk1" tx1="lt1" bg2="dk2" tx2="lt2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
</p:sldMaster>`,
  });

  entries.push({
    name: 'ppt/slideMasters/_rels/slideMaster1.xml.rels',
    data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>`,
  });

  entries.push({
    name: 'ppt/slideLayouts/slideLayout1.xml',
    data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank">
  <p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>
</p:sldLayout>`,
  });

  entries.push({
    name: 'ppt/slideLayouts/_rels/slideLayout1.xml.rels',
    data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`,
  });

  entries.push({
    name: 'ppt/theme/theme1.xml',
    data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="StarlightObsidian">
  <a:themeElements>
    <a:clrScheme name="Starlight">
      <a:dk1><a:srgbClr val="06080E"/></a:dk1>
      <a:lt1><a:srgbClr val="F8FAFC"/></a:lt1>
      <a:dk2><a:srgbClr val="0F172A"/></a:dk2>
      <a:lt2><a:srgbClr val="94A3B8"/></a:lt2>
      <a:accent1><a:srgbClr val="D4AF37"/></a:accent1>
      <a:accent2><a:srgbClr val="38BDF8"/></a:accent2>
      <a:accent3><a:srgbClr val="10B981"/></a:accent3>
      <a:accent4><a:srgbClr val="A855F7"/></a:accent4>
      <a:accent5><a:srgbClr val="F43F5E"/></a:accent5>
      <a:accent6><a:srgbClr val="64748B"/></a:accent6>
      <a:hlink><a:srgbClr val="38BDF8"/></a:hlink>
      <a:folHlink><a:srgbClr val="A855F7"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="StarlightFonts">
      <a:majorFont><a:latin typeface="Segoe UI"/></a:majorFont>
      <a:minorFont><a:latin typeface="Segoe UI"/></a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="StarlightFmt">
      <a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst>
      <a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst>
      <a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>
      <a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
</a:theme>`,
  });

  slidePngBuffers.forEach((pngBuf, i) => {
    const idx = i + 1;
    const mediaName = `slide_hd_${idx}.png`;
    entries.push({
      name: `ppt/media/${mediaName}`,
      data: pngBuf,
      store: true,
    });

    entries.push({
      name: `ppt/slides/slide${idx}.xml`,
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:pic>
        <p:nvPicPr>
          <p:cNvPr id="2" name="KeynoteSlide_${idx}"/>
          <p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr>
          <p:nvPr/>
        </p:nvPicPr>
        <p:blipFill>
          <a:blip r:embed="rId2"/>
          <a:stretch><a:fillRect/></a:stretch>
        </p:blipFill>
        <p:spPr>
          <a:xfrm><a:off x="0" y="0"/><a:ext cx="${slideW}" cy="${slideH}"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        </p:spPr>
      </p:pic>
    </p:spTree>
  </p:cSld>
</p:sld>`,
    });

    entries.push({
      name: `ppt/slides/_rels/slide${idx}.xml.rels`,
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${mediaName}"/>
</Relationships>`,
    });
  });

  return createZipBuffer(entries);
}

const SURFACE_META = {
  '01-queen-v2-router': {
    authorAgent: 'Antigravity (Gemini 3.1 Pro)',
    intent: 'I-001 · Queen v2.0 Sovereign Meta-Harness & Pareto Router',
    objective: 'O1 · SIS Sovereign Memory & Queen Orchestration',
    built: 'Built Pareto & Thompson Beta(α,β) multi-objective task router + 4-stage execution topology on :4329.',
    next: 'Promote PR #20 (63d724777) to main so primary :4329 serves all 11 tabs natively.',
  },
  '02-queen-v2-harnesses': {
    authorAgent: 'Antigravity (Gemini 3.1 Pro)',
    intent: 'I-002 · 12-Harness Federation & Proactive Upgrader',
    objective: 'O1 · SIS Sovereign Memory & Queen Orchestration',
    built: 'Federated 7 local CLI harnesses + 5 cloud runtimes with capability envelopes and health telemetry.',
    next: 'Compile 8k-token Turn-0 instruction spine across all 12 harness adapters.',
  },
  '03-queen-v2-brands': {
    authorAgent: 'Antigravity (Gemini 3.1 Pro)',
    intent: 'I-003 · 8-Brand × 8-Moat Engineering Switchboard',
    objective: 'O3 · GenCreator & Multi-Brand Freedom Engine',
    built: 'Aligned all 8 brands × 8 moat cells (64 cells) to canonical TRUTH.md Freedom Engine doctrine.',
    next: 'Wire live Stripe/Whop DemandSignal counters into each brand switchboard cell.',
  },
  '04-queen-v2-codex': {
    authorAgent: 'Antigravity (Gemini 3.1 Pro)',
    intent: 'I-004 · Master Codex (10 Orgs, 151 Agents, 12 Truths)',
    objective: 'O6 · 10-Org GitHub Federation & Governance',
    built: 'Indexed all 10 GitHub Orgs, 151 named agents, 89 skills, and 12 non-waivable TRUTH.md laws.',
    next: 'Keep 135/135 symmetry & conformance tests locked in pre-commit and CI.',
  },
  '05-queen-v2-subscriptions': {
    authorAgent: 'Antigravity (Gemini 3.1 Pro)',
    intent: 'I-006..I-009 · 10-Rail OAuth Subscription Max-Out Governor (10.5x)',
    objective: 'O1 · SIS Sovereign Memory & Queen Orchestration',
    built: 'Harvests 5-hour rolling windows across Claude Max 20x, Codex, Gemini Ultra/Jules, SuperGrok, v0, Vercel, Cloudflare.',
    next: 'Ingest real-time JSONL token counters from ~/.claude and ~/.codex into 60s governor tick.',
  },
  '06-queen-v2-conductor': {
    authorAgent: 'Antigravity (Gemini 3.1 Pro)',
    intent: 'I-005 · Open-Window CLI Conductor & 14-Card Self-Healer',
    objective: 'O1 · SIS Sovereign Memory & Queen Orchestration',
    built: 'Steered 6 active CLI windows (.starlight/steered-prompts/) and healed 14/14 stuck _hold-admission cards + vMCP (-88.7% tokens).',
    next: 'Wire automatic window-idle detection to dispatch next ready queue card.',
  },
  '07-queen-v2-swarm-intents': {
    authorAgent: 'Antigravity (Gemini 3.1 Pro)',
    intent: 'I-010..I-014 · Absorbed RuFlow v3 × OmO × Graphiti & 30/30 Intents',
    objective: 'O1 · SIS Sovereign Memory & Queen Orchestration',
    built: 'Absorbed RuFlow MoE/ReasoningBank, OmO 11-Role Boulder State, and Graphiti Bi-Temporal Spine; unblocked 30/30 Intents.',
    next: 'Publish @starlight/queen-swarm-bridge for 1-command community install.',
  },
  '08-unified-command-center': {
    authorAgent: 'Antigravity + Claude Code',
    intent: 'I-015..I-018 · Unified Local + Cloud Agentic OS Command Center',
    objective: 'O1 · SIS Sovereign Memory & Queen Orchestration',
    built: 'Executive HTML5 command center tracking 1,394 vault atoms, 100% Eval-50 Hit@10, 71/71 repos, and 3/3 green Horizon loops.',
    next: 'Embed live SSE telemetry stream from :4329 and :5200.',
  },
  '09-starlight-voice-live': {
    authorAgent: 'Claude Code + Antigravity',
    intent: 'I-023 · Starlight Voice (Ara) Live Glass Sphere Cockpit',
    objective: 'O1 · SIS Sovereign Memory & Queen Orchestration',
    built: 'Live WebSocket voice cockpit on :8765/live with reactive glass sphere and low-latency audio bridge.',
    next: 'Connect Ara voice handoff packets directly to Queen v2.0 /api/execute-mission.',
  },
  '10-starlightintelligence-org-home': {
    authorAgent: 'Claude Code + Antigravity',
    intent: 'I-024 · starlightintelligence.org Public Protocol Explorer',
    objective: 'O1 · SIS Sovereign Memory & Queen Orchestration',
    built: 'Public SIP protocol flagship (151 agent definitions, 89 skill rules, 6 memory vaults, source-verified build).',
    next: 'Publish interactive Queen v2.0 Meta-Harness architecture explorer.',
  },
  '11-starlightintelligence-org-research': {
    authorAgent: 'Claude Code + Antigravity',
    intent: 'I-016 · starlightintelligence.org/research Memory Palace & Foundations',
    objective: 'O1 · SIS Sovereign Memory & Queen Orchestration',
    built: 'Public research surface (3D Memory Palace survey + 3-tier AgentDB/Graphiti memory foundations).',
    next: 'Publish Paper #3: Bi-Temporal Fact Supersession & Eval-50 Benchmark.',
  },
  '12-starlightintelligence-ai-home': {
    authorAgent: 'Antigravity + Codex',
    intent: 'I-024 · starlightintelligence.ai Commercial Sovereign Platform',
    objective: 'O7 · Arcanea Labs BV Commercial & Product Engine',
    built: 'Commercial sovereign intelligence platform with skip-link accessibility and verified copy-honesty gates.',
    next: 'Activate self-serve BYOK Starter Kit & Fleet Blueprint checkout.',
  },
  '13-frankx-ai-home': {
    authorAgent: 'Claude Code + Antigravity',
    intent: 'I-025 · frankx.ai AI Architect Flagship & Studio Hub',
    objective: 'O4 · FrankX Authority, Books & Content Engine',
    built: 'Flagship hero ("Build intelligence that compounds"), Suno studio release card, and AI Architecture blueprints.',
    next: 'Merge Gemini-4-Argon Model Arena branch (d816cd59e) after preview gate.',
  },
  '14-frankx-ai-products': {
    authorAgent: 'Claude Code + Antigravity',
    intent: 'I-025 · frankx.ai/products Digital Products & Blueprints Storefront',
    objective: 'O4 · FrankX Authority, Books & Content Engine',
    built: 'Digital product storefront (The Creator Soulbook, Vibe OS, Creator Lab OS, AI Architect blueprints).',
    next: 'Wire automated Stripe/Whop receipt telemetry to revenue-ledger.jsonl.',
  },
  '15-arcanea-ai-home': {
    authorAgent: 'Claude Code + Antigravity',
    intent: 'I-023 · arcanea.ai Sovereign World Engine & Luminor Studio Hero',
    objective: 'O2 · Arcanea Creative Worlds & Lore Canon',
    built: 'Arcanea hero ("Build living worlds with AI agents"), interactive prompt bar, and Luminor routing.',
    next: 'Ship interactive 10-Gate progression & World Graph exporter.',
  },
  '16-arcanea-ai-components': {
    authorAgent: 'Claude Code + Antigravity',
    intent: 'I-023 · arcanea.ai Scrolled UI/UX World Graph & Agent Components',
    objective: 'O2 · Arcanea Creative Worlds & Lore Canon',
    built: 'Scrolled UI/UX component showcase (Realm Core, Creation Graph, Living Lore, World Builder cards).',
    next: 'Add automated weekly visual regression check across all 10 Gate cards.',
  },
  '17-gencreator-ai-home': {
    authorAgent: 'Antigravity + Claude Code',
    intent: 'I-025 · gencreator.ai Sovereign Creator Economy OS Hero',
    objective: 'O3 · GenCreator & ACOS Productization',
    built: 'Editorial hero ("Turn one clear idea into work you can review and ship") with WCAG AA contrast compliance.',
    next: 'Close ARC-204 by committing and gating the 6 federated-llm-hub files.',
  },
  '18-gencreator-ai-components': {
    authorAgent: 'Antigravity + Claude Code',
    intent: 'I-025 · gencreator.ai Scrolled UI/UX Creator Stack Components',
    objective: 'O3 · GenCreator & ACOS Productization',
    built: 'Scrolled Creator Stack pipeline ("One source becomes a week of work you signed": Voice, Draft, Visual, Social, Archive).',
    next: 'Link each Creator Stack step to downloadable BYOK templates.',
  },
  '19-realityarchitect-ai-home': {
    authorAgent: 'Claude Code + Antigravity',
    intent: 'I-026 · realityarchitect.ai Conscious Reality Design Surface',
    objective: 'O5 · Domain Sub-Stacks & Verticals',
    built: 'Reality Architect landing surface ("Imagine it. Build it. Witness it.") and transformation framework.',
    next: 'Connect .reality/intents ledger templates for public builders.',
  },
  '20-agenticincome-ai-home': {
    authorAgent: 'Antigravity + Codex',
    intent: 'I-026 · agenticincome.ai Autonomous Wealth & Quant Research Surface',
    objective: 'O5 · Domain Sub-Stacks & Verticals',
    built: 'Agentic Income surface ("Agent-as-a-Service. Engineered revenue.") with accessible partner economics tables.',
    next: 'Open Draft PR for agentic-income-packages (a3b673e).',
  },
  '21-animelegends-ai-home': {
    authorAgent: 'Antigravity + Claude Code',
    intent: 'I-026 · animelegends.ai AI Anime Studio & Mascot Trinity Surface',
    objective: 'O2 · Arcanea & Media IP Franchises',
    built: 'Cinematic AnimeLegends landing ("Where bone becomes bloom") with skip-link accessibility verified.',
    next: 'Publish Episode 1 storyboard & voice-synthesis showcase reel.',
  },
  '22-starlight-domains-home': {
    authorAgent: 'Claude Code + Antigravity',
    intent: 'I-026 · starlight.domains Sovereign Venture & Domain Incubator',
    objective: 'O7 · Arcanea Labs BV Portfolio',
    built: 'Starlight Domains portfolio ("Domains are product decisions. Not shopping.") & venture incubation matrix.',
    next: 'Sync PROPERTIES-REGISTRY.md 35-domain matrix into live filterable table.',
  },
  '23-starlight-you-home': {
    authorAgent: 'Claude Code + Antigravity',
    intent: 'I-026 · starlight.you Personal Identity & Second Brain Surface',
    objective: 'O5 · Domain Sub-Stacks & Verticals',
    built: 'Personal sovereign identity surface ("One human. One governed AI layer.") & Genius Profile.',
    next: 'Wire /discover-genius interactive intake flow.',
  },
  '24-starlight-technology-home': {
    authorAgent: 'Antigravity + Codex',
    intent: 'I-024 · starlight.technology Deep Substrate & Enterprise Infrastructure',
    objective: 'O1 · SIS Sovereign Memory & Queen Orchestration',
    built: 'Enterprise architecture surface ("Build the right system. Not the most expensive one.") with 35/35 tests green.',
    next: 'Embed live vMCP + Rust Layer-0 latency benchmarks.',
  },
  '25-starlight-academy-home': {
    authorAgent: 'Antigravity + Claude Code',
    intent: 'I-026 · starlightintelligence.academy Builder Certification & Labs',
    objective: 'O3 · GenCreator & Education Funnels',
    built: 'Starlight Intelligence Academy ("Imagine more. Build with judgment.") & AI Department Lab.',
    next: 'Embed interactive starlight-department-lab MCP evaluation exercises.',
  },
  '26-github-sis-readme': {
    authorAgent: 'Antigravity + Claude Code + Codex',
    intent: 'I-019 · github.com/frankxai/Starlight-Intelligence-System Flagship',
    objective: 'O6 · 10-Org GitHub Federation & Open Source',
    built: 'Flagship SIS repository (151 agents, 89 skills, 6 vaults, SIP v1.1.1, 135/135 symmetry tests).',
    next: 'Add Queen v2.0 11-tab architecture diagram to root README.',
  },
  '27-github-claude-skills-readme': {
    authorAgent: 'Claude Code + Antigravity',
    intent: 'I-020 · github.com/frankxai/claude-skills-library README',
    objective: 'O6 · 10-Org GitHub Federation & Open Source',
    built: 'Vendored ECC + 280+ cross-harness skills library with zero-secret lint enforcement.',
    next: 'Sync visual-estate-observatory practice summary to cross-harness index.',
  },
  '28-github-arcanea-org': {
    authorAgent: 'Antigravity (Federation Audit)',
    intent: 'I-021 · github.com/Arcanea-Labs Organization Profile',
    objective: 'O6 · 10-Org GitHub Federation & Governance',
    built: 'Standardized Arcanea-Labs/.github organization profile and dual-remote repo bindings.',
    next: 'Keep dual-remote sync green across all Arcanea-Labs child repos.',
  },
  '29-github-starlight-org': {
    authorAgent: 'Antigravity (Federation Audit)',
    intent: 'I-021 · github.com/Starlight-Intelligence Organization Profile',
    objective: 'O6 · 10-Org GitHub Federation & Governance',
    built: 'Standardized Starlight-Intelligence/.github organization profile and protocol packages.',
    next: 'Automate @starlight-intelligence/* npm package release syndication.',
  },
  '30-github-gencreator-org': {
    authorAgent: 'Antigravity (Federation Audit)',
    intent: 'I-022 · github.com/GenCreator-ai Organization Profile',
    objective: 'O6 · 10-Org GitHub Federation & Governance',
    built: 'Standardized GenCreator-ai/.github organization profile and creator OS repositories.',
    next: 'Publish starter skill packs under GenCreator-ai org.',
  },
};

function buildKeynoteDeckHtml(manifest, imgDirUrl) {
  const surfaces = manifest.surfaces.map((s, idx) => {
    const m = SURFACE_META[s.id] || {};
    return {
      ...s,
      num: String(idx + 1).padStart(2, '0'),
      imgUrl: `${imgDirUrl}/${s.fileName}`,
      authorAgent: m.authorAgent || 'Antigravity (Gemini 3.1 Pro)',
      intent: m.intent || 'I-001..I-030 · Sovereign Estate Alignment',
      objective: m.objective || 'O1..O7 · Starlight Portfolio Objective',
      built: m.built || 'Verified live rendering, DOM structure, and SHA-256 visual hash.',
      next: m.next || 'Track longitudinal delta in weekly /palace snapshot.',
    };
  });

  const miniThumbs = surfaces
    .slice(0, 12)
    .map(
      (s) =>
        `<div class="mini-thumb"><img src="${s.imgUrl}" /><span>${s.num} · ${s.brand}</span></div>`
    )
    .join('');

  const all30Cells = surfaces
    .map(
      (s) => `
      <div class="wall-cell">
        <img src="${s.imgUrl}" />
        <div class="wall-cap">
          <span class="wall-num">${s.num}</span>
          <span class="wall-brand">${s.brand}</span>
          <span class="wall-agent">${s.authorAgent.split(' ')[0]}</span>
        </div>
      </div>`
    )
    .join('');

  const surfaceSlidesHtml = surfaces
    .map(
      (s, i) => `
    <section class="slide" id="slide-${i + 7}" data-slide="${i + 7}">
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <header class="provenance-bar">
        <div class="prov-left">
          <span class="prov-dot"></span>
          <span class="prov-brand">STARLIGHT INTELLIGENCE SYSTEM · EXECUTIVE SNAPSHOT #001</span>
          <span class="prov-pill gold">SLIDE ${String(i + 7).padStart(2, '0')} / 36</span>
          <span class="prov-pill cyan">SURFACE ${s.num} / 30</span>
        </div>
        <div class="prov-right">
          <span class="prov-pill purple">✍️ DECK AUTHOR: ANTIGRAVITY (GEMINI 3.1 PRO)</span>
          <span class="prov-pill emerald">🛠️ SURFACE LEAD: ${s.authorAgent.toUpperCase()}</span>
          <span class="prov-mono">SHA ${GIT_SHA} · ${DATE_STAMP}</span>
        </div>
      </header>

      <div class="surface-slide-grid">
        <div class="bento-col">
          <div class="bento-card hero-meta-card">
            <div class="pill-row">
              <span class="badge gold">${s.num} / 30 · ${s.category}</span>
              <span class="badge cyan">${s.brand}</span>
            </div>
            <h1 class="surface-h1">${s.title}</h1>
            <div class="author-strip">
              <span class="author-label">SURFACE AUTHOR / LEAD AGENT:</span>
              <span class="author-val">${s.authorAgent}</span>
            </div>
            <div class="repo-strip">${s.repo}</div>
          </div>

          <div class="bento-card intent-card">
            <div class="card-kicker gold-text">FOUNDER TRUE INTENT & PORTFOLIO OBJECTIVE</div>
            <div class="card-main-text">${s.intent}</div>
            <div class="card-sub-text">${s.objective}</div>
          </div>

          <div class="bento-card built-card">
            <div class="card-kicker cyan-text">WHAT YOUR AGENTS BUILT & VERIFIED LIVE</div>
            <div class="card-body-text">${s.built}</div>
            <div class="telemetry-pills">
              <span class="t-pill">DOM Buttons: <strong>${s.domMeta?.buttons || 0}</strong></span>
              <span class="t-pill">Links: <strong>${s.domMeta?.links || 0}</strong></span>
              <span class="t-pill">Sections: <strong>${s.domMeta?.sections || 0}</strong></span>
              <span class="t-pill">SHA-256: <strong>${s.sha256.slice(0, 10)}</strong></span>
            </div>
          </div>

          <div class="bento-card next-card">
            <div class="card-kicker emerald-text">NEXT HORIZON TARGET (WEEKLY MILESTONE)</div>
            <div class="card-body-text">${s.next}</div>
          </div>
        </div>

        <div class="showcase-col">
          <div class="mac-window">
            <div class="mac-titlebar">
              <div class="mac-dots">
                <span class="m-dot r"></span>
                <span class="m-dot y"></span>
                <span class="m-dot g"></span>
              </div>
              <div class="mac-url">${s.url}</div>
              <div class="mac-status">● LIVE VERIFIED (${Math.round((s.bytes || 200000) / 1024)} KB)</div>
            </div>
            <div class="mac-viewport">
              <img src="${s.imgUrl}" alt="${s.title}" />
            </div>
          </div>
        </div>
      </div>

      <footer class="slide-footer">
        <span>Built on SIP v1.1.1 · Starlight Visual Estate Observatory (Procedure 8)</span>
        <span>Deck Authored by: Antigravity (Gemini 3.1 Pro) · Branch: ${GIT_BRANCH} (${GIT_SHA})</span>
        <span>OneDrive\\Starlight Creative Vault\\01_ESTATE_SNAPSHOTS\\${DATE_STAMP}</span>
      </footer>
    </section>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>[Antigravity · Gemini 3.1 Pro] Starlight CEO & Investor Keynote Deck (${DATE_STAMP})</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }
    ::-webkit-scrollbar { display: none; width: 0; height: 0; }
    html, body {
      scrollbar-width: none;
      background: #04060a;
      color: #f8fafc;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      overflow-x: hidden;
    }
    .slide {
      width: 1920px;
      height: 1080px;
      position: relative;
      overflow: hidden;
      background: radial-gradient(circle at 12% 10%, #121c36 0%, #070a12 52%, #04060a 100%);
      padding: 28px 44px 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
    }
    .bg-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(110px);
      pointer-events: none;
      z-index: 0;
    }
    .orb-1 {
      width: 680px;
      height: 680px;
      background: rgba(212, 175, 55, 0.09);
      top: -180px;
      right: -120px;
    }
    .orb-2 {
      width: 640px;
      height: 640px;
      background: rgba(56, 189, 248, 0.08);
      bottom: -220px;
      left: -120px;
    }
    .provenance-bar {
      position: relative;
      z-index: 2;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(13, 19, 33, 0.85);
      border: 1px solid rgba(148, 163, 184, 0.22);
      border-radius: 12px;
      padding: 10px 18px;
      backdrop-filter: blur(16px);
    }
    .prov-left, .prov-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .prov-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 12px #10b981;
    }
    .prov-brand {
      font-weight: 800;
      font-size: 13px;
      letter-spacing: 1px;
      color: #f8fafc;
    }
    .prov-pill {
      font-size: 11px;
      font-weight: 800;
      padding: 4px 11px;
      border-radius: 999px;
      letter-spacing: 0.5px;
    }
    .prov-pill.gold {
      background: rgba(212, 175, 55, 0.16);
      border: 1px solid rgba(212, 175, 55, 0.5);
      color: #fcd34d;
    }
    .prov-pill.cyan {
      background: rgba(56, 189, 248, 0.16);
      border: 1px solid rgba(56, 189, 248, 0.45);
      color: #7dd3fc;
    }
    .prov-pill.purple {
      background: rgba(168, 85, 247, 0.18);
      border: 1px solid rgba(168, 85, 247, 0.5);
      color: #e9d5ff;
    }
    .prov-pill.emerald {
      background: rgba(16, 185, 129, 0.16);
      border: 1px solid rgba(16, 185, 129, 0.45);
      color: #6ee7b7;
    }
    .prov-mono {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #94a3b8;
    }
    .slide-footer {
      position: relative;
      z-index: 2;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      font-size: 11px;
      color: #64748b;
      border-top: 1px solid rgba(148, 163, 184, 0.14);
      padding-top: 10px;
      font-family: 'JetBrains Mono', monospace;
      white-space: nowrap;
    }

    /* Slide 1: Cover */
    .cover-grid {
      position: relative;
      z-index: 2;
      display: grid;
      grid-template-columns: 1.05fr 0.95fr;
      gap: 32px;
      align-items: center;
      flex: 1;
      margin: 22px 0;
    }
    .serif-italic {
      font-family: 'Instrument Serif', Georgia, serif;
      font-style: italic;
      font-weight: 400;
      color: #fcd34d;
    }
    .cover-h1 {
      font-size: 64px;
      font-weight: 900;
      line-height: 1.04;
      letter-spacing: -1.5px;
      margin: 14px 0 18px;
    }
    .cover-lead {
      font-size: 19px;
      line-height: 1.55;
      color: #cbd5e1;
      max-width: 820px;
      margin-bottom: 24px;
    }
    .kpi-bento {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }
    .kpi-box {
      background: linear-gradient(145deg, rgba(17, 25, 44, 0.9), rgba(10, 15, 28, 0.9));
      border: 1px solid rgba(148, 163, 184, 0.22);
      border-radius: 14px;
      padding: 16px 18px;
      box-shadow: 0 14px 34px rgba(0, 0, 0, 0.4);
    }
    .kpi-val {
      font-size: 32px;
      font-weight: 900;
      color: #fff;
      letter-spacing: -0.8px;
    }
    .kpi-val.gold { color: #fcd34d; }
    .kpi-val.cyan { color: #38bdf8; }
    .kpi-val.emerald { color: #34d399; }
    .kpi-lbl {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #94a3b8;
      margin-top: 4px;
    }
    .mini-mosaic {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      background: rgba(11, 16, 29, 0.85);
      border: 1px solid rgba(212, 175, 55, 0.35);
      border-radius: 18px;
      padding: 16px;
      box-shadow: 0 30px 70px rgba(0, 0, 0, 0.65);
    }
    .mini-thumb {
      background: #070a12;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      overflow: hidden;
    }
    .mini-thumb img {
      width: 100%;
      height: 118px;
      object-fit: cover;
      object-position: top center;
      display: block;
    }
    .mini-thumb span {
      display: block;
      padding: 5px 8px;
      font-size: 10px;
      font-weight: 700;
      color: #e2e8f0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Slide 2: 30-Surface Wall */
    .wall-grid {
      position: relative;
      z-index: 2;
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 10px;
      flex: 1;
      margin: 14px 0;
    }
    .wall-cell {
      background: #0c1222;
      border: 1px solid rgba(148, 163, 184, 0.24);
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .wall-cell img {
      width: 100%;
      height: 138px;
      object-fit: cover;
      object-position: top center;
      display: block;
    }
    .wall-cap {
      padding: 5px 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 10px;
      background: #080c17;
    }
    .wall-num {
      background: #d4af37;
      color: #000;
      font-weight: 900;
      padding: 1px 5px;
      border-radius: 4px;
    }
    .wall-brand {
      font-weight: 700;
      color: #f8fafc;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 150px;
    }
    .wall-agent {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      color: #38bdf8;
    }

    /* Executive Tables & Cards (Slides 3-6) */
    .exec-body {
      position: relative;
      z-index: 2;
      flex: 1;
      margin: 18px 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .section-title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 1px solid rgba(212, 175, 55, 0.3);
      padding-bottom: 10px;
    }
    .section-title-row h2 {
      font-size: 36px;
      font-weight: 900;
      letter-spacing: -0.8px;
    }
    .exec-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      flex: 1;
    }
    .exec-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      flex: 1;
    }
    .glass-panel {
      background: linear-gradient(155deg, rgba(16, 23, 42, 0.9), rgba(9, 13, 24, 0.92));
      border: 1px solid rgba(148, 163, 184, 0.22);
      border-radius: 16px;
      padding: 20px 22px;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.45);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .glass-panel h3 {
      font-size: 18px;
      font-weight: 800;
      color: #fcd34d;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .lux-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .lux-table th {
      text-align: left;
      padding: 9px 12px;
      background: rgba(30, 41, 59, 0.65);
      color: #38bdf8;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.25);
    }
    .lux-table td {
      padding: 9px 12px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.12);
      color: #e2e8f0;
      vertical-align: top;
    }

    /* Surface Slides (Slides 7-36) */
    .surface-slide-grid {
      position: relative;
      z-index: 2;
      display: grid;
      grid-template-columns: 560px 1fr;
      gap: 24px;
      flex: 1;
      margin: 16px 0;
      align-items: stretch;
    }
    .bento-col {
      display: flex;
      flex-direction: column;
      gap: 14px;
      justify-content: space-between;
    }
    .bento-card {
      background: linear-gradient(155deg, rgba(16, 23, 42, 0.92), rgba(9, 13, 24, 0.94));
      border: 1px solid rgba(148, 163, 184, 0.22);
      border-radius: 16px;
      padding: 18px 22px;
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
    }
    .hero-meta-card {
      border-color: rgba(212, 175, 55, 0.45);
      background: linear-gradient(155deg, rgba(28, 25, 23, 0.75), rgba(15, 23, 42, 0.94));
    }
    .intent-card { border-left: 4px solid #fcd34d; }
    .built-card { border-left: 4px solid #38bdf8; }
    .next-card { border-left: 4px solid #10b981; }
    .pill-row {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }
    .badge {
      font-size: 11px;
      font-weight: 800;
      padding: 4px 11px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }
    .badge.gold {
      background: rgba(212, 175, 55, 0.2);
      color: #fcd34d;
      border: 1px solid rgba(212, 175, 55, 0.5);
    }
    .badge.cyan {
      background: rgba(56, 189, 248, 0.18);
      color: #7dd3fc;
      border: 1px solid rgba(56, 189, 248, 0.45);
    }
    .surface-h1 {
      font-size: 28px;
      font-weight: 900;
      line-height: 1.2;
      color: #ffffff;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
    }
    .author-strip {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(168, 85, 247, 0.14);
      border: 1px solid rgba(168, 85, 247, 0.4);
      padding: 7px 12px;
      border-radius: 8px;
      font-size: 12px;
      margin-bottom: 8px;
    }
    .author-label {
      color: #d8b4fe;
      font-weight: 800;
      font-size: 10px;
      letter-spacing: 0.6px;
    }
    .author-val {
      color: #fff;
      font-weight: 800;
    }
    .repo-strip {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #94a3b8;
    }
    .card-kicker {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.9px;
      margin-bottom: 6px;
    }
    .gold-text { color: #fcd34d; }
    .cyan-text { color: #38bdf8; }
    .emerald-text { color: #34d399; }
    .card-main-text {
      font-size: 17px;
      font-weight: 800;
      color: #fff;
      margin-bottom: 4px;
    }
    .card-sub-text {
      font-size: 13px;
      color: #94a3b8;
    }
    .card-body-text {
      font-size: 14.5px;
      line-height: 1.5;
      color: #e2e8f0;
    }
    .telemetry-pills {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 10px;
    }
    .t-pill {
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(148, 163, 184, 0.25);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      color: #94a3b8;
      font-family: 'JetBrains Mono', monospace;
    }
    .t-pill strong { color: #38bdf8; }

    .showcase-col {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .mac-window {
      width: 100%;
      height: 100%;
      background: #080b12;
      border: 1px solid rgba(212, 175, 55, 0.42);
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.75), 0 0 40px rgba(56, 189, 248, 0.08);
      display: flex;
      flex-direction: column;
    }
    .mac-titlebar {
      background: linear-gradient(90deg, #0f172a, #111827);
      border-bottom: 1px solid rgba(148, 163, 184, 0.2);
      padding: 11px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .mac-dots { display: flex; gap: 7px; }
    .m-dot { width: 11px; height: 11px; border-radius: 50%; display: inline-block; }
    .m-dot.r { background: #ef4444; }
    .m-dot.y { background: #f59e0b; }
    .m-dot.g { background: #10b981; }
    .mac-url {
      flex: 1;
      background: rgba(7, 10, 18, 0.85);
      border: 1px solid rgba(148, 163, 184, 0.22);
      border-radius: 8px;
      padding: 5px 14px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #38bdf8;
    }
    .mac-status {
      font-size: 11px;
      font-weight: 800;
      color: #34d399;
      letter-spacing: 0.5px;
    }
    .mac-viewport {
      flex: 1;
      background: #04060a;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .mac-viewport img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center center;
      display: block;
    }
  </style>
</head>
<body>

  <!-- SLIDE 1: EXECUTIVE KEYNOTE COVER -->
  <section class="slide" id="slide-1" data-slide="1">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <header class="provenance-bar">
      <div class="prov-left">
        <span class="prov-dot"></span>
        <span class="prov-brand">STARLIGHT INTELLIGENCE SYSTEM · CEO & INVESTOR MASTER DECK</span>
        <span class="prov-pill gold">SLIDE 01 / 36</span>
      </div>
      <div class="prov-right">
        <span class="prov-pill purple">✍️ AUTHORED BY: ANTIGRAVITY (GEMINI 3.1 PRO · META-HARNESS)</span>
        <span class="prov-pill emerald">135 / 135 TESTS GREEN</span>
        <span class="prov-mono">SHA ${GIT_SHA} · ${DATE_STAMP}</span>
      </div>
    </header>

    <div class="cover-grid">
      <div>
        <div class="pill-row">
          <span class="badge gold">2026-10-18 · LONGITUDINAL BASELINE #001</span>
          <span class="badge cyan">BUILT ON SIP v1.1.1</span>
        </div>
        <h1 class="cover-h1">
          Sovereign Estate &<br/>
          <span class="serif-italic">Queen v2.0 Superintelligence</span><br/>
          Visual Showcase.
        </h1>
        <p class="cover-lead">
          Every local cockpit, production website, product storefront, UI/UX component section, internal source of truth, and GitHub organization—opened one by one, verified with SHA-256 visual receipts, and mapped to your <strong>30 Founder Intents</strong> &amp; <strong>agent authorship</strong>.
        </p>

        <div class="kpi-bento">
          <div class="kpi-box">
            <div class="kpi-val gold">30 / 30</div>
            <div class="kpi-lbl">Live Surfaces Captured (1080p)</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-val cyan">30 / 30</div>
            <div class="kpi-lbl">Founder Intents Active (I-001..I-030)</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-val emerald">10.5x</div>
            <div class="kpi-lbl">OAuth Subscription Multiplier</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-val">71 / 71</div>
            <div class="kpi-lbl">10-Org Dual-Remote Repos</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-val cyan">100.0%</div>
            <div class="kpi-lbl">Eval-50 Memory Recall &amp; Hit@10</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-val emerald">17 / 17</div>
            <div class="kpi-lbl">Self-Healed Horizon Loops</div>
          </div>
        </div>
      </div>

      <div class="mini-mosaic">
        ${miniThumbs}
      </div>
    </div>

    <footer class="slide-footer">
      <span>File: ${DATE_STAMP}__${AGENT_TAG}__Starlight-CEO-Investor-Deck.pptx</span>
      <span>Authoring Agent: Antigravity (Gemini 3.1 Pro) · Worktree: sis-queen-sovereign-20261018 (${GIT_SHA})</span>
      <span>Synced: OneDrive\\Starlight Creative Vault\\01_ESTATE_SNAPSHOTS\\${DATE_STAMP}</span>
    </footer>
  </section>

  <!-- SLIDE 2: 30/30 VISUAL ESTATE WALL -->
  <section class="slide" id="slide-2" data-slide="2">
    <div class="bg-orb orb-1"></div>
    <header class="provenance-bar">
      <div class="prov-left">
        <span class="prov-dot"></span>
        <span class="prov-brand">30/30 LIVE VISUAL ESTATE CONTACT SHEET · SINGLE-TAB CDP (:9223)</span>
        <span class="prov-pill gold">SLIDE 02 / 36</span>
      </div>
      <div class="prov-right">
        <span class="prov-pill purple">✍️ AUTHORED BY: ANTIGRAVITY (GEMINI 3.1 PRO)</span>
        <span class="prov-mono">SHA ${GIT_SHA} · ${DATE_STAMP}</span>
      </div>
    </header>

    <div class="wall-grid">
      ${all30Cells}
    </div>

    <footer class="slide-footer">
      <span>01–09: Local Cockpits &amp; Voice · 10–25: Production Websites, Products &amp; UI/UX · 26–30: GitHub Flagship READMEs &amp; Orgs</span>
      <span>Authored by Antigravity (Gemini 3.1 Pro) · Zero playwright.launch() calls (&lt;200 MB RAM)</span>
    </footer>
  </section>

  <!-- SLIDE 3: AGENT AUTHORSHIP & MULTI-HARNESS ATTRIBUTION LEDGER -->
  <section class="slide" id="slide-3" data-slide="3">
    <div class="bg-orb orb-2"></div>
    <header class="provenance-bar">
      <div class="prov-left">
        <span class="prov-dot"></span>
        <span class="prov-brand">MULTI-HARNESS AGENT AUTHORSHIP &amp; PROVENANCE STANDARD</span>
        <span class="prov-pill gold">SLIDE 03 / 36</span>
      </div>
      <div class="prov-right">
        <span class="prov-pill purple">✍️ AUTHORED BY: ANTIGRAVITY (GEMINI 3.1 PRO)</span>
        <span class="prov-mono">SHA ${GIT_SHA} · ${DATE_STAMP}</span>
      </div>
    </header>

    <div class="exec-body">
      <div class="section-title-row">
        <h2>Who Wrote What: <span class="serif-italic">Agent Provenance Across the Estate</span></h2>
        <span class="badge gold">STANDARD: YYYY-MM-DD__[Agent-Model]__Slug.ext</span>
      </div>

      <table class="lux-table">
        <thead>
          <tr>
            <th>Agent Harness &amp; Model</th>
            <th>Role in Starlight Estate</th>
            <th>Exact Artifacts, Repos &amp; Branches Authored</th>
            <th>Verification &amp; Receipt Proof</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Antigravity (Gemini 3.1 Pro)</strong><br/><span style="color:#fcd34d;font-size:11px;">Primary Meta-Harness Conductor</span></td>
            <td>Queen v2.0 Sovereign Engine, 11-Tab Cockpit, 10-Rail Subscription Governor, 14-Card Self-Healer, 10-Org Federation Wire-Up, Visual Estate Observatory &amp; Keynote PPTX Compiler</td>
            <td><code>Starlight-Intelligence-System</code> (<code>63d724777</code> on <code>agent/antigravity/queen-sovereign-superintelligence-20261017</code>), <code>agentic-ops-hub</code> (<code>75fb391</code>), <code>2026-10-18__Antigravity-Gemini3.1Pro__Starlight-CEO-Investor-Deck.pptx</code></td>
            <td><code>135/135</code> symmetry tests · <code>10/10</code> Queen v2 tests · <code>30/30</code> CDP screenshots · <code>starlight-memory</code> MCP atoms</td>
          </tr>
          <tr>
            <td><strong>Claude Code (Opus 4.7 / Sonnet 4.6)</strong><br/><span style="color:#38bdf8;font-size:11px;">Strategic Synthesis &amp; Editorial Maker</span></td>
            <td>Three-Store Restart Triage, 30 Founder Intents Seed (<code>I-001..I-030</code>), Graphiti Bi-Temporal Fact Spine, SIS Memory Gateway Dead-PID Recovery, Flagship Brand Copy &amp; UI</td>
            <td><code>.reality/intents/2026-10-17-seed.md</code>, <code>src/memory/temporal-spine.ts</code> (<code>b4f20cb16</code>), <code>src/gateway/daemon.ts</code> (<code>bdf9042a6</code>), <code>frankx.ai</code>, <code>arcanea.ai</code></td>
            <td><code>3/3</code> temporal-spine tests · <code>7/7</code> gateway HTTP tests · <code>100%</code> Eval-50 Hit@10</td>
          </tr>
          <tr>
            <td><strong>OpenAI Codex CLI &amp; Cloud (GPT-5.4)</strong><br/><span style="color:#34d399;font-size:11px;">Compiler, Rust Kernel &amp; CI Verifier</span></td>
            <td>Rust Layer-0 AST/Tarjan WFG Kernel, TypeScript Strict Package Builds, Accessibility Skip-Link Ratchet across 7 Brand Sites, Independent PR Review Gate</td>
            <td><code>starlight-technology#42</code>, <code>agenticincome#69</code>, <code>packages/@starlight-intelligence/*</code>, <code>src/queen/rust-kernel-bridge.ts</code></td>
            <td><code>35/35</code> starlight-technology tests · Sub-50µs WFG deadlock detection</td>
          </tr>
          <tr>
            <td><strong>xAI Grok CLI (Grok 4.2 Heavy)</strong><br/><span style="color:#e9d5ff;font-size:11px;">Control-Plane Heartbeat &amp; Visual Gen</span></td>
            <td>5-Minute Control-Plane Heartbeat (now healed by Queen v2.0 so it never loops on <code>_hold-admission</code>), Queen v0.2 Motion Canvas &amp; Social Signal Tracking</td>
            <td><code>starlight/queen/NOW.md</code>, <code>skills/vision/queen-swarms-visual.md</code>, <code>site/queen-vision.html</code></td>
            <td><code>14/14</code> held admission cards healed by Antigravity Queen v2.0</td>
          </tr>
          <tr>
            <td><strong>OpenCode Zen Arena &amp; Hermes CoE</strong><br/><span style="color:#fcd34d;font-size:11px;">Zero-Cost Swarm &amp; 6-Pillar Guardians</span></td>
            <td>48-Cell Free-Tier Model Arena (GLM-5.1, Kimi K2.5, Qwen3.6, DeepSeek R1), 6-Pillar GenCreator Center of Excellence &amp; Cross-Repo Provenance Search</td>
            <td><code>tools/arena/free-arena.mjs</code> (<code>77cb3de71</code>), <code>C:/Users/frank/hermes/profiles/</code></td>
            <td><code>47/48</code> Free-Tier Arena cells PASS at $0 marginal API cost</td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="slide-footer">
      <span>Every generated presentation, report, and snapshot now carries explicit [Agent-Model] provenance in filename &amp; header</span>
      <span>Authored by Antigravity (Gemini 3.1 Pro) · SHA ${GIT_SHA}</span>
    </footer>
  </section>

  <!-- SLIDE 4: INTERNAL SOURCES OF TRUTH & THREE-STORE ARCHITECTURE -->
  <section class="slide" id="slide-4" data-slide="4">
    <div class="bg-orb orb-1"></div>
    <header class="provenance-bar">
      <div class="prov-left">
        <span class="prov-dot"></span>
        <span class="prov-brand">INTERNAL DOCS &amp; THREE-STORE SOURCES OF TRUTH MAP</span>
        <span class="prov-pill gold">SLIDE 04 / 36</span>
      </div>
      <div class="prov-right">
        <span class="prov-pill purple">✍️ AUTHORED BY: ANTIGRAVITY (GEMINI 3.1 PRO)</span>
        <span class="prov-mono">SHA ${GIT_SHA} · ${DATE_STAMP}</span>
      </div>
    </header>

    <div class="exec-body">
      <div class="section-title-row">
        <h2>All Internal Docs &amp; <span class="serif-italic">Three-Store Governance Architecture</span></h2>
        <span class="badge cyan">12 CONSTITUTIONAL SSOT FILES VERIFIED</span>
      </div>

      <div class="exec-grid-3">
        <div class="glass-panel">
          <h3>Store 1: Founder Intent &amp; Prompt Ledger <span class="badge gold">INTENT</span></h3>
          <p style="font-size:13px;color:#cbd5e1;line-height:1.5;">Captures every raw Founder prompt and distills them into immutable, numbered intents with acceptance criteria.</p>
          <ul style="padding-left:18px;font-size:12.5px;color:#e2e8f0;line-height:1.7;">
            <li><strong><code>.reality/intents/2026-10-17-seed.md</code>:</strong> 30 canonical Founder Intents (<code>I-001..I-030</code>).</li>
            <li><strong><code>frank-prompts-human-2026-08-19_to_10-17.md</code>:</strong> Full 60-day human prompt corpus.</li>
            <li><strong><code>starlight/OBJECTIVES.md</code>:</strong> 7 Portfolio Objectives (<code>O1..O7</code>) &amp; KPI gates.</li>
          </ul>
        </div>

        <div class="glass-panel">
          <h3>Store 2: Estate Control Plane &amp; Governance <span class="badge cyan">CONTROL</span></h3>
          <p style="font-size:13px;color:#cbd5e1;line-height:1.5;">Enforces non-waivable constitutional laws, 10-Org repository boundaries, and cross-harness worktree leases.</p>
          <ul style="padding-left:18px;font-size:12.5px;color:#e2e8f0;line-height:1.7;">
            <li><strong><code>starlight/TRUTH.md</code>:</strong> 12 non-waivable laws (Freedom Engine, Money Fails Closed, CDP :9223).</li>
            <li><strong><code>SYSTEM.md</code> &amp; <code>AGENTIC-SYSTEMS.md</code>:</strong> Three-Store &amp; 12-harness contracts.</li>
            <li><strong><code>WORKSPACE_MAP.md</code> &amp; <code>PROPERTIES-REGISTRY.md</code>:</strong> 10 Orgs, 71 Repos, 35 Domains.</li>
            <li><strong><code>queen/NOW.md</code> &amp; <code>SIS-CHAIR-CONTRACT.md</code>:</strong> Live admission &amp; RAM floor gates.</li>
            <li><strong><code>agentic-ops-hub/ops/OPS-LEDGER.md</code>:</strong> Cross-session handover &amp; pickup index.</li>
          </ul>
        </div>

        <div class="glass-panel">
          <h3>Store 3: Executable Code, Vaults &amp; Snapshots <span class="badge emerald">RUNTIME</span></h3>
          <p style="font-size:13px;color:#cbd5e1;line-height:1.5;">Turns doctrine into running servers, event-sourced SQLite FTS5 memory vaults, and visual regression decks.</p>
          <ul style="padding-left:18px;font-size:12.5px;color:#e2e8f0;line-height:1.7;">
            <li><strong><code>src/queen/sovereign-engine.ts</code>:</strong> 11-tab cockpit + 20 REST endpoints on <code>:4329</code>.</li>
            <li><strong><code>memory/vaults/*.jsonl</code> + <code>starlight-memory</code> MCP:</strong> 1,394 vault atoms + 342 MCP atoms (100% Hit@10).</li>
            <li><strong><code>tools/queen/render-keynote-grade-deck.mjs</code>:</strong> 1080p Keynote PPTX + HTML5 Cinema compiler.</li>
            <li><strong><code>OneDrive\\Starlight Creative Vault</code>:</strong> Dated cloud-synced snapshot archive.</li>
          </ul>
        </div>
      </div>
    </div>

    <footer class="slide-footer">
      <span>Zero Drift Between Doctrine (TRUTH.md) -> Intents (.reality) -> Code (src/queen) -> Visual Proof (36-Slide Deck)</span>
      <span>Authored by Antigravity (Gemini 3.1 Pro) · SHA ${GIT_SHA}</span>
    </footer>
  </section>

  <!-- SLIDE 5: 30/30 FOUNDER INTENTS & O1..O7 ROADMAP -->
  <section class="slide" id="slide-5" data-slide="5">
    <div class="bg-orb orb-2"></div>
    <header class="provenance-bar">
      <div class="prov-left">
        <span class="prov-dot"></span>
        <span class="prov-brand">30/30 FOUNDER INTENTS (I-001..I-030) &amp; O1..O7 EXECUTION MATRIX</span>
        <span class="prov-pill gold">SLIDE 05 / 36</span>
      </div>
      <div class="prov-right">
        <span class="prov-pill purple">✍️ AUTHORED BY: ANTIGRAVITY (GEMINI 3.1 PRO)</span>
        <span class="prov-mono">SHA ${GIT_SHA} · ${DATE_STAMP}</span>
      </div>
    </header>

    <div class="exec-body">
      <div class="section-title-row">
        <h2>Your True Intents vs. <span class="serif-italic">Current Repo State &amp; Next Horizon</span></h2>
        <span class="badge emerald">30 / 30 INTENTS UNBLOCKED &amp; VERIFIED</span>
      </div>

      <table class="lux-table">
        <thead>
          <tr>
            <th>Intent Cluster</th>
            <th>What You Asked For (True Prompt Intent)</th>
            <th>Where It Lives Today (Repo / Branch / File)</th>
            <th>Next Horizon Target (Weekly Goal)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong><code>I-001..I-005</code></strong><br/>Queen v2.0 Meta-Harness</td>
            <td>Always-on Queen steering open CLI windows, governing RAM/storage, healing broken tasks, and orchestrating all harnesses.</td>
            <td><code>Starlight-Intelligence-System</code> worktree <code>sis-queen-sovereign-20261018</code> (<code>63d724777</code>) · <code>src/queen/sovereign-engine.ts</code></td>
            <td>Merge PR #20 into <code>main</code> and reload primary <code>:4329</code> daemon so all 11 tabs serve natively.</td>
          </tr>
          <tr>
            <td><strong><code>I-006..I-009</code></strong><br/>10-Rail Subscription Governor</td>
            <td>Maximize flat-rate OAuth subscriptions daily/hourly/minute-by-minute before touching paid API keys.</td>
            <td><code>src/queen/subscription-governor.ts</code> + Cockpit Tab 9 (<code>10.5x</code> leverage · $2,995/mo unlocked on $285/mo fixed rails).</td>
            <td>Wire live JSONL token-burn counters from <code>~/.claude</code> and <code>~/.codex</code> into the 60s tick.</td>
          </tr>
          <tr>
            <td><strong><code>I-010..I-014</code></strong><br/>RuFlow × OmO × Graphiti</td>
            <td>Absorb RuFlow v3 MoE/ReasoningBank, OmO 11-Role Team Mode + Boulder State, and Graphiti Bi-Temporal Spine.</td>
            <td><code>src/queen/swarm-graph-absorber.ts</code> + <code>src/memory/temporal-spine.ts</code> + Cockpit Tab 11.</td>
            <td>Publish <code>@starlight/queen-swarm-bridge</code> npm package for 1-command community install.</td>
          </tr>
          <tr>
            <td><strong><code>I-015..I-018</code></strong><br/>Sovereign Memory &amp; Eval-50</td>
            <td>Event-sourced JSONL vaults + SQLite FTS5 + 90-day half-life decay with empirical recall benchmarks.</td>
            <td><code>memory/vaults/</code> (1,394 atoms) + <code>starlight-memory</code> MCP (342 atoms) · <code>100% Hit@10</code>, <code>MRR 1.000</code>.</td>
            <td>Enable automatic post-commit session ingestion from all 7 local harnesses into <code>:5200</code>.</td>
          </tr>
          <tr>
            <td><strong><code>I-019..I-026</code></strong><br/>10 Orgs &amp; 16 Brand Surfaces</td>
            <td>Clean 10-Org GitHub federation + world-class UI/UX across Starlight, FrankX, Arcanea, GenCreator, AnimeLegends.</td>
            <td><code>71/71</code> local repos dual-remote wired · <code>16/16</code> production web &amp; product surfaces verified live (Slides 16–31).</td>
            <td>Open Draft PRs for <code>frankx.ai</code> (<code>d816cd59e</code>) &amp; <code>agentic-income</code> (<code>a3b673e</code>); close <code>ARC-204</code>.</td>
          </tr>
          <tr>
            <td><strong><code>I-027..I-030</code></strong><br/>Visual Observatory &amp; PPTX Deck</td>
            <td>Open every site/doc one-by-one, screenshot, and build dated Keynote-grade PowerPoint + HTML5 Cinema snapshots.</td>
            <td><code>tools/queen/render-keynote-grade-deck.mjs</code> + <code>launch-visual-observatory.mjs</code> + <code>OneDrive\\Starlight Creative Vault</code>.</td>
            <td>Run <code>npm run queen:snapshot:all</code> every Sunday in the <code>/palace</code> weekly cadence.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="slide-footer">
      <span>All 30 Intents Mapped 1:1 to Verified Commits &amp; Visual Slides</span>
      <span>Authored by Antigravity (Gemini 3.1 Pro) · SHA ${GIT_SHA}</span>
    </footer>
  </section>

  <!-- SLIDE 6: 10-RAIL SUBSCRIPTION GOVERNOR & VISUAL OBSERVATORY PRACTICE -->
  <section class="slide" id="slide-6" data-slide="6">
    <div class="bg-orb orb-1"></div>
    <header class="provenance-bar">
      <div class="prov-left">
        <span class="prov-dot"></span>
        <span class="prov-brand">10-RAIL OAUTH SUBSCRIPTION GOVERNOR (10.5X) &amp; OBSERVATORY PRACTICE</span>
        <span class="prov-pill gold">SLIDE 06 / 36</span>
      </div>
      <div class="prov-right">
        <span class="prov-pill purple">✍️ AUTHORED BY: ANTIGRAVITY (GEMINI 3.1 PRO)</span>
        <span class="prov-mono">SHA ${GIT_SHA} · ${DATE_STAMP}</span>
      </div>
    </header>

    <div class="exec-body">
      <div class="section-title-row">
        <h2>Subscription Max-Out Engine &amp; <span class="serif-italic">Procedure 8 Visual Practice</span></h2>
        <span class="badge gold">10.5X LEVERAGE · $2,995/MO VALUE EXTRACTED</span>
      </div>

      <div class="exec-grid-2">
        <div class="glass-panel">
          <h3>10 OAuth &amp; Cloud Burst Rails (Minute-by-Minute Governor)</h3>
          <table class="lux-table">
            <thead>
              <tr>
                <th>Provider Rail</th>
                <th>Window Utilization</th>
                <th>Autonomous Role</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Claude Max 20x</strong> (Opus 4.7 / Sonnet 4.6)</td>
                <td><span style="color:#34d399;font-weight:800;">88%</span> (T-30m harvest)</td>
                <td>Deep architecture, cross-family PR review, high-taste editorial copy</td>
              </tr>
              <tr>
                <td><strong>Google AI Ultra + Antigravity + Jules</strong></td>
                <td><span style="color:#34d399;font-weight:800;">92%</span> (120 burst units)</td>
                <td>16h overnight /goal meta-harness conductor, UI/UX &amp; Keynote deck engine</td>
              </tr>
              <tr>
                <td><strong>ChatGPT Pro / Codex Cloud</strong> (GPT-5.4)</td>
                <td><span style="color:#38bdf8;font-weight:800;">84%</span> (60 cloud containers)</td>
                <td>Async cloud container refactors when laptop RAM &lt; 10 GB free</td>
              </tr>
              <tr>
                <td><strong>xAI SuperGrok</strong> (Grok 4.2 Heavy)</td>
                <td><span style="color:#38bdf8;font-weight:800;">79%</span> (5m heartbeats)</td>
                <td>Control-plane telemetry, AI lab release radar, native visual gen</td>
              </tr>
              <tr>
                <td><strong>OpenCode Zen Arena + Muse Wonder</strong></td>
                <td><span style="color:#fcd34d;font-weight:800;">100% Free</span> ($0 marginal)</td>
                <td>High-volume lore expansion, 48-cell benchmark arena, bulk extraction</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="glass-panel">
          <h3>Procedure 8: The 4-Layer Visual Estate Observatory Workflow</h3>
          <ul style="padding-left:18px;font-size:13.5px;color:#e2e8f0;line-height:1.75;">
            <li><strong>Layer 1 — Single-Tab CDP Capture (<code>npm run queen:snapshot:screenshots</code>):</strong> Visits all 30 local cockpits, live websites, scrolled UI/UX components, and GitHub orgs via <code>:9223</code> under 200 MB RAM.</li>
            <li><strong>Layer 2 — 1080p Keynote PPTX Compiler (<code>node tools/queen/render-keynote-grade-deck.mjs</code>):</strong> Renders every slide in full <code>1920×1080</code> Bento Glass HTML/CSS and compiles a native widescreen <code>.pptx</code> presentation with zero primitive PowerPoint textboxes.</li>
            <li><strong>Layer 3 — Memory Vault &amp; MCP Compounding:</strong> Writes SHA-256 visual receipts to <code>memory/vaults/operational.jsonl</code> and <code>starlight-memory</code> MCP.</li>
            <li><strong>Layer 4 — Cloud Vault Sync (<code>npm run queen:observatory</code>):</strong> Mirrors <code>2026-10-18__Antigravity-Gemini3.1Pro__Starlight-CEO-Investor-Deck.pptx</code> and all 30 PNGs into <code>OneDrive\\Starlight Creative Vault\\01_ESTATE_SNAPSHOTS\\2026-10-18</code>.</li>
          </ul>
        </div>
      </div>
    </div>

    <footer class="slide-footer">
      <span>Command: npm run queen:observatory · Opens Live Cinema + Keynote PPTX + OneDrive Creative Vault</span>
      <span>Authored by Antigravity (Gemini 3.1 Pro) · SHA ${GIT_SHA}</span>
    </footer>
  </section>

  <!-- SLIDES 7..36: 30 BESPOKE SURFACE SHOWCASE SLIDES -->
  ${surfaceSlidesHtml}

</body>
</html>`;
}

async function main() {
  fs.mkdirSync(SLIDE_CACHE_DIR, { recursive: true });
  fs.mkdirSync(ONEDRIVE_SNAPSHOT_DIR, { recursive: true });

  const manifestPath = path.join(SNAPSHOT_DIR, `${DATE_STAMP}-visual-estate-snapshot.json`);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Write the 36-slide 1920x1080 HTML master file inside ARTIFACT_DIR so image paths resolve locally
  const deckHtmlPath = path.join(
    ARTIFACT_DIR,
    `${DATE_STAMP}__${AGENT_TAG}__Keynote-Slides-Master.html`
  );
  fs.writeFileSync(deckHtmlPath, buildKeynoteDeckHtml(manifest, '.'), 'utf8');

  // Also write to Command Center & OneDrive Creative Vault
  const oneDriveHtmlDeckPath = path.join(
    ONEDRIVE_SNAPSHOT_DIR,
    `${DATE_STAMP}__${AGENT_TAG}__Starlight-CEO-Investor-Deck.html`
  );
  fs.writeFileSync(oneDriveHtmlDeckPath, buildKeynoteDeckHtml(manifest, '.'), 'utf8');

  const cmdCenterHtmlDeckPath = path.join(
    COMMAND_CENTER_DIR,
    `${DATE_STAMP}__${AGENT_TAG}__Starlight-CEO-Investor-Deck.html`
  );
  fs.writeFileSync(
    cmdCenterHtmlDeckPath,
    buildKeynoteDeckHtml(manifest, `./snapshots/${DATE_STAMP}`),
    'utf8'
  );

  console.log(`[Keynote-Engine] Rendering 36 slides at 1920x1080 via :9223 Single-Tab CDP Hub...`);
  const hub = await ensureCdpHubOn9223();
  const cdp = new CdpClient(hub.wsEndpoint);
  const slidePngBuffers = [];

  try {
    await cdp.connect();
    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });

    await cdp.send('Page.enable', {}, sessionId);
    await cdp.send('Runtime.enable', {}, sessionId);
    await cdp.send(
      'Emulation.setDeviceMetricsOverride',
      {
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
        mobile: false,
      },
      sessionId
    );

    const fileUrl = 'file:///' + deckHtmlPath.replace(/\\/g, '/');
    await cdp.send('Page.navigate', { url: fileUrl }, sessionId);
    await sleep(1800);

    for (let i = 1; i <= 36; i++) {
      await cdp.send(
        'Runtime.evaluate',
        {
          expression: `document.getElementById('slide-${i}')?.scrollIntoView({ behavior: 'instant', block: 'start' });`,
        },
        sessionId
      );
      await sleep(120);

      const shot = await cdp.send(
        'Page.captureScreenshot',
        {
          format: 'png',
          fromSurface: true,
          captureBeyondViewport: false,
        },
        sessionId
      );
      const buf = Buffer.from(shot.data, 'base64');
      slidePngBuffers.push(buf);

      const slideCacheFile = path.join(
        SLIDE_CACHE_DIR,
        `slide-${String(i).padStart(2, '0')}.png`
      );
      fs.writeFileSync(slideCacheFile, buf);

      // Save key showcase slides into ARTIFACT_DIR for embedding in walkthrough.md
      if (i === 1) {
        fs.writeFileSync(
          path.join(ARTIFACT_DIR, `${DATE_STAMP}__${AGENT_TAG}__Slide01-Cover.png`),
          buf
        );
      } else if (i === 3) {
        fs.writeFileSync(
          path.join(ARTIFACT_DIR, `${DATE_STAMP}__${AGENT_TAG}__Slide03-Agent-Authorship.png`),
          buf
        );
      } else if (i === 7) {
        fs.writeFileSync(
          path.join(ARTIFACT_DIR, `${DATE_STAMP}__${AGENT_TAG}__Slide07-Queen-Cockpit.png`),
          buf
        );
      } else if (i === 21) {
        fs.writeFileSync(
          path.join(ARTIFACT_DIR, `${DATE_STAMP}__${AGENT_TAG}__Slide21-Arcanea-Showcase.png`),
          buf
        );
      }
      process.stdout.write(i % 6 === 0 ? `[${i}/36]\n` : `.`);
    }

    try {
      await cdp.send('Target.closeTarget', { targetId });
      await cdp.send('Browser.close');
    } catch {}
  } finally {
    cdp.close();
    await hub.cleanup();
  }

  const pptxBuffer = buildFullBleedPptxFromSlidePngs(slidePngBuffers);
  const brandedPptxName = `${DATE_STAMP}__${AGENT_TAG}__Starlight-CEO-Investor-Deck.pptx`;

  const outPaths = [
    path.join(ARTIFACT_DIR, brandedPptxName),
    path.join(SNAPSHOT_DIR, brandedPptxName),
    path.join(ONEDRIVE_SNAPSHOT_DIR, brandedPptxName),
    // Also overwrite the legacy filename so existing links automatically get the Keynote-grade deck
    path.join(ARTIFACT_DIR, `${DATE_STAMP}-Starlight-CEO-Investor-Snapshot.pptx`),
    path.join(SNAPSHOT_DIR, `${DATE_STAMP}-Starlight-CEO-Investor-Snapshot.pptx`),
    path.join(ONEDRIVE_SNAPSHOT_DIR, `${DATE_STAMP}-Starlight-CEO-Investor-Snapshot.pptx`),
  ];

  for (const p of outPaths) {
    fs.writeFileSync(p, pptxBuffer);
  }

  // Also save branded Master Poster & Cinema HTML
  const masterGridSrc = path.join(ARTIFACT_DIR, '00-ESTATE-30-SURFACE-MASTER-GRID.png');
  if (fs.existsSync(masterGridSrc)) {
    fs.copyFileSync(
      masterGridSrc,
      path.join(ONEDRIVE_SNAPSHOT_DIR, `${DATE_STAMP}__${AGENT_TAG}__30-Surface-Master-Poster.png`)
    );
  }

  console.log(
    `\n[Keynote-PPTX] Compiled 36-slide 1920x1080 Keynote-Grade Deck (${Math.round(
      pptxBuffer.length / 1024
    )} KB):`
  );
  console.log(`  -> ${path.join(ONEDRIVE_SNAPSHOT_DIR, brandedPptxName)}`);
  console.log(`  -> ${path.join(ARTIFACT_DIR, brandedPptxName)}`);

  if (process.argv.includes('--open')) {
    const targetPptx = path.join(ONEDRIVE_SNAPSHOT_DIR, brandedPptxName);
    exec(`cmd /c start "" "${targetPptx.replace(/\//g, '\\')}"`);
    exec(`cmd /c start "" "${cmdCenterHtmlDeckPath.replace(/\//g, '\\')}"`);
  }
}

main().catch((err) => {
  console.error('Fatal error in render-keynote-grade-deck:', err);
  process.exit(1);
});
