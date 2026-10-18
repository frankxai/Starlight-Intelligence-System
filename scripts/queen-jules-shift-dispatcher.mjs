#!/usr/bin/env node
/**
 * Starlight Queen + Google Jules + Cloud Swarm 8-Hour Shift Dispatcher (v1.0.0)
 *
 * Solves the local RAM bottleneck (`freeRamMB < 4096` stalling `Invoke-StarlightQueenLoop.ps1`
 * in `idle-resource-guard`) by routing eligible, clean-tree, non-secret cards to:
 *   1. Google Jules Remote Workers (`jules remote new --repo <owner/repo> --session "<packet>"`) — 0 MB local RAM, max 4 in flight
 *   2. OpenAI Codex Cloud (`codex cloud exec --env <ENV_ID> --branch <BRANCH> --attempts 1`) — 0 MB local RAM
 *   3. Focused Antigravity / Claude Code High-Judgment Pods — for Canon, Checkout/Money gates, and PR landing
 *   4. Independent Maker!=Checker Verifiers (`grok-local` / `codex-review` / `santa-gate`)
 *
 * Usage:
 *   node scripts/queen-jules-shift-dispatcher.mjs --status
 *   node scripts/queen-jules-shift-dispatcher.mjs --dry-run [--wave=1|2|3|4|all] [--json]
 *   node scripts/queen-jules-shift-dispatcher.mjs --export-packets
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const STARLIGHT_ROOT = 'C:/Users/frank/starlight';
const CHAIR_PULSE_PATH = path.join(STARLIGHT_ROOT, 'queen/state/chair-pulse.json');
const HOLD_ADMISSION_DIR = path.join(STARLIGHT_ROOT, 'queen/inbox/_hold-admission');
const DISPATCH_ROUTING_PATH = path.join(STARLIGHT_ROOT, 'ops/model-arena/kb/dispatch-routing.json');

export const FORBIDDEN_FREE_DATA = new Set([
  'secret',
  'money',
  'vault',
  'identity',
  'private-canon',
]);

export const JULES_MAX_IN_FLIGHT = 4;
export const LOCAL_RAM_FLOOR_MB = 4096;

/**
 * The 20 Evidence-Gated Execution Cards of the 8-Hour Autonomous Corporation Shift
 * Structured across 4 x 2-Hour Waves and 5 Corporate Pillars:
 *   - FOUNDATIONS (Governance, PR Stack, Queen RAM Bypass)
 *   - STORY (4-Brand Narrative Coherence & Anti-Slop Copy)
 *   - TECH (Queen/Jules/Cloud Router, Hold-Admission Drain, Observability)
 *   - PIPELINES (Content Engine, Music/Video Factory, Multi-Org OSS Release, Evals)
 *   - PRODUCTS (Self-Serve Digital Product Ladder: Free -> $1 -> $7 -> $27 -> $47 -> $97 -> $497)
 */
export const SHIFT_CARDS = [
  // ============================================================================
  // WAVE 1 (Hours 0–2): Unblock Foundations, Land PR Stack & Patch Queen RAM Bypass
  // ============================================================================
  {
    id: 'W1-C01',
    wave: 1,
    hours: '0:00–2:00',
    pillar: 'FOUNDATIONS',
    division: 'CAEO · Chief Agentic Execution Officer',
    title: 'Patch Queen Loop RAM-Bypass for Zero-RAM Cloud & Jules Steering',
    repo: 'frankxai/starlight-estate',
    localPath: 'C:/Users/frank/starlight/tools',
    worker: 'antigravity-pod',
    checker: 'codex-review',
    dataClass: 'ops-routing',
    ramRequiredMB: 0,
    what: 'Update Invoke-StarlightQueenLoop.ps1 and queen-steer.mjs so freeRamMB < 4096 blocks only local process spawns while continuing to steer clean-tree non-secret cards to Google Jules (kind="jules") and Codex Cloud.',
    doneCondition: 'node C:/Users/frank/starlight/tools/queen-heal.mjs admit 1911 0 jules returns admit:true AND unit tests pass',
    command: 'node scripts/queen-jules-shift-dispatcher.mjs --verify-card=W1-C01',
  },
  {
    id: 'W1-C02',
    wave: 1,
    hours: '0:00–2:00',
    pillar: 'FOUNDATIONS',
    division: 'CSO · Chief Security & Governance Officer',
    title: 'Promote & Merge Ready Foundation PRs (#362, #80, #54, #275, #451, #1067)',
    repo: 'frankxai/Starlight-Intelligence-System',
    localPath: 'C:/Users/frank/starlight/worktrees/sis-org-federation-20261017',
    worker: 'claude-code-lead',
    checker: 'grok-local',
    dataClass: 'governance',
    ramRequiredMB: 512,
    what: 'Run gh pr ready across the 6 validated PRs (#362 agentic-ops-hub, #80 starlight-command-center, #54 starlight-estate, #275 agentic-ops, #451 SIS, #1067 frankx.ai-vercel-website) after final Maker!=Checker verification.',
    doneCondition: 'gh pr view on all 6 PRs shows isDraft:false and mergeStateStatus:CLEAN',
    command: 'gh pr ready 362 -R frankxai/agentic-ops-hub && gh pr ready 80 -R Starlight-Intelligence/starlight-command-center && gh pr ready 54 -R frankxai/starlight-estate',
  },
  {
    id: 'W1-C03',
    wave: 1,
    hours: '0:00–2:00',
    pillar: 'TECH',
    division: 'CAEO · Chief Agentic Execution Officer',
    title: 'Drain Held Compute Atlas Cards via Google Jules Remote Worker #1',
    repo: 'frankxai/frankx.ai-vercel-website',
    localPath: 'C:/Users/frank/starlight/repos/frankx.ai-vercel-website',
    worker: 'jules',
    checker: 'claude-code-lead',
    dataClass: 'public-code',
    ramRequiredMB: 0,
    what: 'Dispatch held inbox cards 2026-10-06-compute-atlas-data-gaps and 2026-10-06-compute-atlas-planner-widget to Google Jules remote session on clean origin/main.',
    doneCondition: 'jules remote new creates session and opens verified PR with vitest + next typegen green',
    command: 'jules remote new --repo frankxai/frankx.ai-vercel-website --session "Complete compute-atlas data gaps and planner widget unit tests; run pnpm typecheck"',
  },
  {
    id: 'W1-C04',
    wave: 1,
    hours: '0:00–2:00',
    pillar: 'TECH',
    division: 'CAEO · Chief Agentic Execution Officer',
    title: 'Drain Compute Guide Publish Gates via Google Jules Remote Worker #2',
    repo: 'frankxai/frankx.ai-vercel-website',
    localPath: 'C:/Users/frank/starlight/repos/frankx.ai-vercel-website',
    worker: 'jules',
    checker: 'codex-review',
    dataClass: 'public-code',
    ramRequiredMB: 0,
    what: 'Dispatch held inbox card 2026-10-06-compute-guide-publish-gates to Google Jules remote worker to validate SEO metadata, schema.org JSON-LD, and broken-link gates.',
    doneCondition: 'PR opened by Jules passes design-contract, editorial-contract, and surface-guard',
    command: 'jules remote new --repo frankxai/frankx.ai-vercel-website --session "Verify and enforce compute-guide publish gates, JSON-LD schema, and link integrity"',
  },
  {
    id: 'W1-C05',
    wave: 1,
    hours: '0:00–2:00',
    pillar: 'TECH',
    division: 'CFO · FinOps & Compute Economy',
    title: 'Reclaim Zombie Local Processes & Enforce 4.5 GB Free RAM Headroom',
    repo: 'frankxai/starlight-estate',
    localPath: 'C:/Users/frank/starlight',
    worker: 'antigravity-pod',
    checker: 'codex-review',
    dataClass: 'ops-telemetry',
    ramRequiredMB: 0,
    what: 'Audit duplicate idle grok/node background workers from chair-pulse.json (22 processes holding RAM at 1.9 GB free) and generate safe process-prune script that preserves active user tabs.',
    doneCondition: 'Free physical memory >= 4096 MB verified via Get-CimInstance Win32_OperatingSystem',
    command: 'node C:/Users/frank/starlight/tools/queen-chair.mjs',
  },

  // ============================================================================
  // WAVE 2 (Hours 2–4): Digital Product Factory ($1/$7/$27/$47/$97) & 4-Brand Story
  // ============================================================================
  {
    id: 'W2-C06',
    wave: 2,
    hours: '2:00–4:00',
    pillar: 'PRODUCTS',
    division: 'CPO · Chief Product & Engineering Officer',
    title: 'Ship $1 reality.md Starter Pack Downloadable Bundle & Interactive Preview',
    repo: 'frankxai/frankx.ai-vercel-website',
    localPath: 'C:/Users/frank/starlight/worktrees/frankx-reality-funnel-20261018',
    worker: 'codex-cloud',
    checker: 'claude-code-lead',
    dataClass: 'public-product',
    ramRequiredMB: 0,
    what: 'Create actual downloadable starter kit files under public/products/reality-md-starter-pack/ (annotated reality.md template, 5-invariant checklist, AGENTS.md starter, quickstart guide) and interactive preview drawer on /products/reality-md-starter-pack.',
    doneCondition: 'GET /products/reality-md-starter-pack renders interactive preview and download bundle verifies cleanly',
    command: 'codex cloud exec --env frankx-web --branch agent/antigravity/reality-funnel-sync-20261018 --attempts 1',
  },
  {
    id: 'W2-C07',
    wave: 2,
    hours: '2:00–4:00',
    pillar: 'PRODUCTS',
    division: 'CPO · Chief Product & Engineering Officer',
    title: 'Ship $7 Suno Power Pack 25 Downloadable Prompt Matrix & Audio Preview',
    repo: 'frankxai/frankx.ai-vercel-website',
    localPath: 'C:/Users/frank/starlight/worktrees/frankx-reality-funnel-20261018',
    worker: 'jules',
    checker: 'claude-code-lead',
    dataClass: 'public-product',
    ramRequiredMB: 0,
    what: 'Create public/products/suno-power-pack-25/ deliverable bundle (25 genre-spanning Suno v4 metatag prompts, lyric structure blueprint, commercial rights checklist) and wire preview cards on /products/suno-power-pack-25.',
    doneCondition: 'All 25 prompts validated in JSON/MD bundle and /products/suno-power-pack-25 passes visual + editorial QA',
    command: 'jules remote new --repo frankxai/frankx.ai-vercel-website --session "Build public/products/suno-power-pack-25 starter bundle and preview component for /products/suno-power-pack-25"',
  },
  {
    id: 'W2-C08',
    wave: 2,
    hours: '2:00–4:00',
    pillar: 'PRODUCTS',
    division: 'CPO · Chief Product & Engineering Officer',
    title: 'Zero-Env-Var Graceful Checkout & Instant Delivery Fallback on frankx.ai',
    repo: 'frankxai/frankx.ai-vercel-website',
    localPath: 'C:/Users/frank/starlight/worktrees/frankx-reality-funnel-20261018',
    worker: 'claude-code-lead',
    checker: 'codex-review',
    dataClass: 'money',
    ramRequiredMB: 512,
    what: 'Ensure /api/checkout and product CTAs work gracefully in local/preview environments without STRIPE_SECRET_KEY by providing a verified sandbox preview receipt flow while failing closed on live money operations.',
    doneCondition: 'vitest checkout suite covers $1, $7, $27, $47, $97, $497 tiers + missing-env graceful UX',
    command: 'pnpm --dir C:/Users/frank/starlight/worktrees/frankx-reality-funnel-20261018 test',
  },
  {
    id: 'W2-C09',
    wave: 2,
    hours: '2:00–4:00',
    pillar: 'STORY',
    division: 'CCO · Chief Creative & Narrative Officer',
    title: '4-Brand Narrative Bridge: FrankX -> GenCreator -> Arcanea -> Starlight',
    repo: 'frankxai/frankx.ai-vercel-website',
    localPath: 'C:/Users/frank/starlight/worktrees/frankx-reality-funnel-20261018',
    worker: 'claude-code-lead',
    checker: 'grok-local',
    dataClass: 'public-copy',
    ramRequiredMB: 512,
    what: 'Unify ecosystem navigation and narrative positioning across frankx.ai, gencreator.ai, arcanea.ai, and starlightintelligence.ai using sentence-case labels, zero prestige slop, and explicit builder outcomes.',
    doneCondition: 'Passes editorial-contract, brand-voice anti-slop gate, and metrics/current.json truth verification',
    command: 'node scripts/editorial-gate.mjs',
  },
  {
    id: 'W2-C10',
    wave: 2,
    hours: '2:00–4:00',
    pillar: 'STORY',
    division: 'CCO · Chief Creative & Narrative Officer',
    title: 'Arcanea Canon & World-Graph Onboarding Polish via Jules Remote Worker #3',
    repo: 'frankxai/arcanea-ai-app',
    localPath: 'C:/Users/frank/starlight/repos/arcanea-ai-app',
    worker: 'jules',
    checker: 'claude-code-lead',
    dataClass: 'public-code',
    ramRequiredMB: 0,
    what: 'Audit and polish onboarding empty states, accessibility attributes, and Gate 1–10 progression tooltips in arcanea-ai-app without touching CANON_LOCKED.md.',
    doneCondition: 'jules remote PR passes canon-check and next build with 0 warnings',
    command: 'jules remote new --repo frankxai/arcanea-ai-app --session "Improve accessibility and onboarding empty-state polish across Gate progression UI; do not touch CANON_LOCKED.md"',
  },

  // ============================================================================
  // WAVE 3 (Hours 4–6): Production Pipelines (Content, Music/Video, OSS, Evals)
  // ============================================================================
  {
    id: 'W3-C11',
    wave: 3,
    hours: '4:00–6:00',
    pillar: 'PIPELINES',
    division: 'CCO · Chief Creative & Narrative Officer',
    title: 'Autonomous Content Engine Pipeline: Research -> MDX -> Visual QA -> Social',
    repo: 'frankxai/frankx.ai-vercel-website',
    localPath: 'C:/Users/frank/starlight/repos/frankx.ai-vercel-website',
    worker: 'codex-cloud',
    checker: 'claude-code-lead',
    dataClass: 'public-content',
    ramRequiredMB: 0,
    what: 'Wire deterministic CLI pipeline script connecting monday-intel research packet -> MDX draft validation -> VIS image registry check -> X/LinkedIn thread packet generation.',
    doneCondition: 'Pipeline dry-run emits validated article + 5-post social thread packet with 100/100 VIS score',
    command: 'codex cloud exec --env frankx-web --branch agent/codex/content-pipeline-e2e --attempts 1',
  },
  {
    id: 'W3-C12',
    wave: 3,
    hours: '4:00–6:00',
    pillar: 'PIPELINES',
    division: 'CCO · Chief Creative & Narrative Officer',
    title: 'Vibe OS Music & Video Factory: Suno Catalog Triage -> Canvas & Visualizer Spec',
    repo: 'frankxai/frankx.ai-vercel-website',
    localPath: 'C:/Users/frank/starlight/repos/frankx.ai-vercel-website',
    worker: 'jules',
    checker: 'codex-review',
    dataClass: 'public-code',
    ramRequiredMB: 0,
    what: 'Run automated catalog integrity check on data/music-catalog.json, ensuring every featured track has validated metadata, prompt lineage, and Spotify Canvas / Visualizer spec.',
    doneCondition: '100% of featured tracks pass schema validation and link integrity tests',
    command: 'jules remote new --repo frankxai/frankx.ai-vercel-website --session "Add unit tests and schema validator for music catalog tracks and Suno prompt lineage"',
  },
  {
    id: 'W3-C13',
    wave: 3,
    hours: '4:00–6:00',
    pillar: 'PIPELINES',
    division: 'CGO · Chief Growth & Distribution Officer',
    title: 'Multi-Org OSS Showcase & README/Badge Standardization across 10 GitHub Orgs',
    repo: 'frankxai/Starlight-Intelligence-System',
    localPath: 'C:/Users/frank/starlight/worktrees/sis-org-federation-20261017',
    worker: 'jules',
    checker: 'claude-code-lead',
    dataClass: 'public-docs',
    ramRequiredMB: 0,
    what: 'Extend org-federation-controller.mjs to audit flagship OSS repos (claude-skills-library, arcanea-agent-skills, mcp-doctor, awesome-agent-operating-systems) for README quickstarts, LICENSE, and release badges.',
    doneCondition: 'node scripts/org-federation-controller.mjs --audit-oss reports 100% OSS readiness score',
    command: 'jules remote new --repo frankxai/Starlight-Intelligence-System --session "Add --audit-oss readiness check to scripts/org-federation-controller.mjs with unit tests"',
  },
  {
    id: 'W3-C14',
    wave: 3,
    hours: '4:00–6:00',
    pillar: 'PIPELINES',
    division: 'CPO · Chief Product & Engineering Officer',
    title: 'Observatory Live Telemetry Wiring: Jules In-Flight + Hold-Admission Drain UI',
    repo: 'Starlight-Intelligence/starlight-command-center',
    localPath: 'C:/Users/frank/starlight/worktrees/scc-org-federation-20261018',
    worker: 'jules',
    checker: 'codex-review',
    dataClass: 'public-code',
    ramRequiredMB: 0,
    what: 'Add Jules remote worker queue status and Queen RAM-bypass telemetry cards to the port 4321 Observatory dashboard (/api/horizon and HorizonFederationPanel).',
    doneCondition: 'pnpm --filter @starlight/observatory build && vitest pass 100%',
    command: 'jules remote new --repo Starlight-Intelligence/starlight-command-center --session "Add Jules worker queue and Queen RAM-bypass status indicators to HorizonFederationPanel with tests"',
  },
  {
    id: 'W3-C15',
    wave: 3,
    hours: '4:00–6:00',
    pillar: 'TECH',
    division: 'CAEO · Chief Agentic Execution Officer',
    title: 'GenCreator.ai & StarlightIntelligence.ai Cross-Domain Funnel Telemetry',
    repo: 'frankxai/gencreator.ai',
    localPath: 'C:/Users/frank/starlight/repos/gencreator.ai',
    worker: 'codex-cloud',
    checker: 'claude-code-lead',
    dataClass: 'public-code',
    ramRequiredMB: 0,
    what: 'Verify and align CTA links, Plausible custom funnel events, and canonical cross-domain links between gencreator.ai, frankx.ai, and starlightintelligence.ai.',
    doneCondition: 'Build and link-checker pass with 0 broken cross-domain references',
    command: 'codex cloud exec --env gencreator-web --branch agent/codex/cross-domain-funnel --attempts 1',
  },

  // ============================================================================
  // WAVE 4 (Hours 6–8): Adversarial Santa Gate QA, Eval-50, FinOps & Estate Handover
  // ============================================================================
  {
    id: 'W4-C16',
    wave: 4,
    hours: '6:00–8:00',
    pillar: 'TECH',
    division: 'CSO · Chief Security & Governance Officer',
    title: 'Run Full Eval-50 Benchmark, 135 SIS Symmetry Tests & 20-Check Estate Doctor',
    repo: 'frankxai/Starlight-Intelligence-System',
    localPath: 'C:/Users/frank/starlight/worktrees/sis-org-federation-20261017',
    worker: 'antigravity-pod',
    checker: 'grok-local',
    dataClass: 'ops-verification',
    ramRequiredMB: 256,
    what: 'Execute the complete verification battery (starlight-estate-doctor.mjs --eval50, npm test, org-federation-controller.mjs, and queen-jules-shift-dispatcher.mjs tests) and persist timestamped JSON receipts.',
    doneCondition: 'Eval-50 = 100%, Doctor = 20/20 PASS, SIS tests = 100% PASS',
    command: 'node scripts/starlight-estate-doctor.mjs --eval50',
  },
  {
    id: 'W4-C17',
    wave: 4,
    hours: '6:00–8:00',
    pillar: 'PIPELINES',
    division: 'CFO · FinOps & Compute Economy',
    title: 'Multi-Harness Token & Cloud Cost Ledger Reconciliation ($274/mo Budget Guard)',
    repo: 'frankxai/agentic-ops',
    localPath: 'C:/Users/frank/starlight/worktrees/ops-org-federation-20261017',
    worker: 'codex-cloud',
    checker: 'claude-code-lead',
    dataClass: 'ops-finops',
    ramRequiredMB: 0,
    what: 'Generate weekly runtime cost & quota utilization report across Claude Max, ChatGPT Pro/Codex Cloud, Google Jules, Gemini/Antigravity, Grok API, Vercel Pro, and GitHub Actions.',
    doneCondition: 'Cost report JSON + markdown summary validates 0 unbudgeted API overages',
    command: 'python scripts/validate_registry.py',
  },
  {
    id: 'W4-C18',
    wave: 4,
    hours: '6:00–8:00',
    pillar: 'STORY',
    division: 'CCO · Chief Creative & Narrative Officer',
    title: 'Santa Method Crown Gate Visual & Copy Audit Across All Updated Surfaces',
    repo: 'frankxai/frankx.ai-vercel-website',
    localPath: 'C:/Users/frank/starlight/worktrees/frankx-reality-funnel-20261018',
    worker: 'claude-code-lead',
    checker: 'grok-local',
    dataClass: 'public-copy',
    ramRequiredMB: 256,
    what: 'Run independent Fire Gate + Crown Gate review over all new product pages, War Room UI, and brand copy against DESIGN_TASTE.md and .starlight/voice/context.md.',
    doneCondition: 'Taste score >= 95/100 and 0 editorial-contract violations',
    command: 'node C:/Users/frank/starlight/tools/starlight-god-mode.mjs --dry-run --target=frankx-product-ladder',
  },
  {
    id: 'W4-C19',
    wave: 4,
    hours: '6:00–8:00',
    pillar: 'FOUNDATIONS',
    division: 'CSO · Chief Security & Governance Officer',
    title: 'Sync Live Memory Vaults (Strategic, Technical, Operational) & SIP Attestation',
    repo: 'frankxai/Starlight-Intelligence-System',
    localPath: 'C:/Users/frank/starlight/worktrees/sis-org-federation-20261017',
    worker: 'antigravity-pod',
    checker: 'claude-code-lead',
    dataClass: 'ops-memory',
    ramRequiredMB: 256,
    what: 'Record the Queen + Jules RAM-bypass architecture, 8-hour shift execution pattern, and 5-pillar product pipeline into SIS Operational & Technical vaults with SIP attestation.',
    doneCondition: 'Vault JSONL entries appended and indexed with valid SIP receipt',
    command: 'node scripts/starlight-estate-doctor.mjs --json',
  },
  {
    id: 'W4-C20',
    wave: 4,
    hours: '6:00–8:00',
    pillar: 'FOUNDATIONS',
    division: 'CAEO · Chief Agentic Execution Officer',
    title: 'Write Canonical Estate Handover in agentic-ops-hub & Arm 12h/7d Daemons',
    repo: 'frankxai/agentic-ops-hub',
    localPath: 'C:/Users/frank/starlight/worktrees/hub-org-federation-20261018',
    worker: 'antigravity-pod',
    checker: 'codex-review',
    dataClass: 'ops-handover',
    ramRequiredMB: 256,
    what: 'Update ops/sessions/2026-10-18.md, ops/OPS-LEDGER.md, and ops/NEXT-PROMPTS.md in agentic-ops-hub with complete 8-hour shift receipts, merged PR SHAs, and armed 12h/7d Task Scheduler verification.',
    doneCondition: 'Handover committed, pushed, and CI verify + estate-guard green on agentic-ops-hub',
    command: 'git -C C:/Users/frank/starlight/worktrees/hub-org-federation-20261018 status -sb',
  },
];

/**
 * Inspects current Queen chair pulse and held admission cards.
 */
export function readQueenLiveState(options = {}) {
  const chairPulsePath = options.chairPulsePath || CHAIR_PULSE_PATH;
  const holdDir = options.holdDir || HOLD_ADMISSION_DIR;

  let pulse = {
    generatedAt: new Date().toISOString(),
    loopStatus: 'unknown',
    machine: { freeRamMB: 4096, floorMB: 4096, totalProcesses: 0, summary: {} },
    queues: { inbox: 0, outbox: 0, completedToday: 0 },
  };

  if (fs.existsSync(chairPulsePath)) {
    try {
      const raw = fs.readFileSync(chairPulsePath, 'utf8').replace(/^\uFEFF/, '');
      pulse = JSON.parse(raw);
    } catch {
      // keep fallback
    }
  }

  let heldCards = [];
  if (fs.existsSync(holdDir)) {
    try {
      const files = fs.readdirSync(holdDir).filter((f) => f.endsWith('.json'));
      heldCards = files.map((file) => {
        try {
          const raw = fs.readFileSync(path.join(holdDir, file), 'utf8').replace(/^\uFEFF/, '');
          const data = JSON.parse(raw);
          return {
            file,
            id: data.id || file.replace(/\.json$/, ''),
            repo: data.repo || 'unknown',
            agent: data.agent || 'unknown',
            status: data.status || 'held',
            holdReason: data.holdReason || 'ram-floor',
            what: data.what || data.do || '',
          };
        } catch {
          return { file, id: file, repo: 'unknown', agent: 'unknown', status: 'held', holdReason: 'parse-error', what: '' };
        }
      });
    } catch {
      heldCards = [];
    }
  }

  return { pulse, heldCards };
}

/**
 * Evaluates a shift card against data-safety rules, RAM floor, and Jules in-flight limits.
 */
export function evaluateShiftCard(card, context = {}) {
  const freeRamMB = Number.isFinite(context.freeRamMB) ? context.freeRamMB : 4096;
  const julesInFlight = Number.isFinite(context.julesInFlight) ? context.julesInFlight : 0;
  const isSecretOrMoney = FORBIDDEN_FREE_DATA.has(card.dataClass);

  // Rule 1: Secret/Money/Canon/Vault/Identity cards MUST NEVER route to Jules or free lanes
  if (isSecretOrMoney && (card.worker === 'jules' || card.worker === 'kilo-auto/free' || card.worker === 'opencode-zen')) {
    return {
      ...card,
      admitted: false,
      effectiveWorker: 'claude-code-lead',
      routingMode: 'refused-free-lane-data-guard',
      reason: `Data class "${card.dataClass}" is forbidden on free/remote external lanes; rerouted to claude-code-lead`,
    };
  }

  // Rule 2: Zero-RAM Cloud Workers (Jules & Codex Cloud) bypass the local 4096 MB RAM floor!
  if (card.worker === 'jules') {
    if (julesInFlight >= JULES_MAX_IN_FLIGHT) {
      return {
        ...card,
        admitted: false,
        effectiveWorker: 'jules-queued',
        routingMode: 'jules-concurrency-cap',
        reason: `Jules in-flight (${julesInFlight}) reached cap (${JULES_MAX_IN_FLIGHT}); queued for next slot`,
      };
    }
    return {
      ...card,
      admitted: true,
      effectiveWorker: 'jules',
      routingMode: freeRamMB < LOCAL_RAM_FLOOR_MB ? 'cloud-ram-bypass' : 'cloud-normal',
      reason: `Admitted to Google Jules (0 MB local RAM; laptop at ${freeRamMB} MB)`,
    };
  }

  if (card.worker === 'codex-cloud') {
    return {
      ...card,
      admitted: true,
      effectiveWorker: 'codex-cloud',
      routingMode: freeRamMB < LOCAL_RAM_FLOOR_MB ? 'cloud-ram-bypass' : 'cloud-normal',
      reason: `Admitted to Codex Cloud sandbox (0 MB local RAM; laptop at ${freeRamMB} MB)`,
    };
  }

  // Rule 3: Local / Hybrid pods check if they require heavy local spawn or run inside the active session
  const ramLow = freeRamMB < LOCAL_RAM_FLOOR_MB;
  if (ramLow && card.ramRequiredMB >= 1024) {
    return {
      ...card,
      admitted: false,
      effectiveWorker: 'claude-cloud',
      routingMode: 'overflow-to-cloud',
      reason: `Local free RAM (${freeRamMB} MB) < ${LOCAL_RAM_FLOOR_MB} MB floor; overflowed to cloud session`,
    };
  }

  return {
    ...card,
    admitted: true,
    effectiveWorker: card.worker,
    routingMode: ramLow ? 'in-session-zero-spawn' : 'local-normal',
    reason: ramLow
      ? `Executes inside active lead session without spawning new heavy CLI process (${freeRamMB} MB free)`
      : `Admitted to ${card.worker} (${freeRamMB} MB free)`,
  };
}

/**
 * Builds the complete 8-Hour Shift Execution Plan with wave-by-wave admission & Jules slot allocation.
 */
export function buildShiftPlan(options = {}) {
  const { pulse, heldCards } = readQueenLiveState(options);
  const freeRamMB = options.freeRamMB ?? pulse?.machine?.freeRamMB ?? 1911;
  const waveFilter = options.wave && options.wave !== 'all' ? Number(options.wave) : null;

  const selectedCards = waveFilter
    ? SHIFT_CARDS.filter((c) => c.wave === waveFilter)
    : SHIFT_CARDS;

  const julesPerWave = new Map();
  const evaluatedCards = selectedCards.map((card) => {
    const currentWaveJules = julesPerWave.get(card.wave) || 0;
    const result = evaluateShiftCard(card, {
      freeRamMB,
      julesInFlight: currentWaveJules,
    });
    if (result.admitted && result.effectiveWorker === 'jules') {
      julesPerWave.set(card.wave, currentWaveJules + 1);
    }
    return result;
  });

  const summary = {
    generatedAt: new Date().toISOString(),
    freeRamMB,
    localRamFloorMB: LOCAL_RAM_FLOOR_MB,
    queenLoopStatus: pulse?.loopStatus || 'unknown',
    heldInboxCardsCount: heldCards.length,
    totalShiftCards: evaluatedCards.length,
    admittedCards: evaluatedCards.filter((c) => c.admitted).length,
    cloudRamBypassCards: evaluatedCards.filter((c) => c.routingMode === 'cloud-ram-bypass').length,
    byWorker: {
      jules: evaluatedCards.filter((c) => c.effectiveWorker === 'jules').length,
      'codex-cloud': evaluatedCards.filter((c) => c.effectiveWorker === 'codex-cloud').length,
      'claude-code-lead': evaluatedCards.filter((c) => c.effectiveWorker === 'claude-code-lead').length,
      'antigravity-pod': evaluatedCards.filter((c) => c.effectiveWorker === 'antigravity-pod').length,
    },
    byPillar: {
      FOUNDATIONS: evaluatedCards.filter((c) => c.pillar === 'FOUNDATIONS').length,
      STORY: evaluatedCards.filter((c) => c.pillar === 'STORY').length,
      TECH: evaluatedCards.filter((c) => c.pillar === 'TECH').length,
      PIPELINES: evaluatedCards.filter((c) => c.pillar === 'PIPELINES').length,
      PRODUCTS: evaluatedCards.filter((c) => c.pillar === 'PRODUCTS').length,
    },
  };

  return {
    summary,
    pulse,
    heldCards,
    cards: evaluatedCards,
  };
}

function main() {
  const args = process.argv.slice(2);
  const isJson = args.includes('--json');
  const waveArg = args.find((a) => a.startsWith('--wave='))?.split('=')[1] || 'all';
  const plan = buildShiftPlan({ wave: waveArg });

  if (isJson) {
    console.log(JSON.stringify(plan, null, 2));
    return;
  }

  console.log('================================================================================');
  console.log('  STARLIGHT QUEEN + GOOGLE JULES 8-HOUR AUTONOMOUS CORPORATION DISPATCHER');
  console.log('================================================================================');
  console.log(`  Laptop Free RAM      : ${plan.summary.freeRamMB} MB (Local Spawn Floor: ${plan.summary.localRamFloorMB} MB)`);
  console.log(`  Queen Loop Status    : ${plan.summary.queenLoopStatus}`);
  console.log(`  Held Inbox Cards     : ${plan.summary.heldInboxCardsCount} cards in _hold-admission`);
  console.log(`  Shift Cards Admitted : ${plan.summary.admittedCards}/${plan.summary.totalShiftCards} (${plan.summary.cloudRamBypassCards} via Zero-RAM Cloud/Jules Bypass)`);
  console.log(`  Worker Distribution  : Jules=${plan.summary.byWorker.jules} | Codex Cloud=${plan.summary.byWorker['codex-cloud']} | Claude Lead=${plan.summary.byWorker['claude-code-lead']} | Antigravity=${plan.summary.byWorker['antigravity-pod']}`);
  console.log('--------------------------------------------------------------------------------');

  for (const card of plan.cards) {
    const badge = card.admitted ? 'ADMIT' : 'DEFER';
    console.log(
      `  [${badge}] ${card.id} (Wave ${card.wave} · ${card.pillar.padEnd(11)}) -> ${card.effectiveWorker.padEnd(16)} | ${card.title}`
    );
    console.log(`          Checker: ${card.checker} | Mode: ${card.routingMode} | Cmd: ${card.command}`);
  }
  console.log('================================================================================');
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main();
}
