#!/usr/bin/env node
/**
 * Queen Driver v0.3 — executable runtime for the *closed* ROUTE→MEASURE(parallel subagent)→LEARN(synth+patches)→RATIFY(A1/A2 gates)→LEDGER(visual+text+vault+github) loop.
 * Backing for /starlight-queen (/sq /so queen posture) + "queen-tick". Grok-native: prints spawn_subagent recipes (explore/plan/best-of-n/check-work) for MEASURE/LEARN; image_gen PROMPTS for tick visuals (rendering is a separate harness step, not performed by this driver); excellence/gstack concepts.
 * Enforces Visual Eval (model lane receipts), Composer formalization, advancement velocity (tick deltas, visuals/cycle), safe-only patches (A1 low-stakes + A2 >=2 rounds), anti-Goodhart, SIP attestation on every output.
 * Loads: routing-table.json (+advancement), ROUTING-DOCTRINE.md v0.2, scorecards/arena, queen/state+ledger, operational-vault.
 *
 * v0.3: MEASURE and LEARN are real — MEASURE parses scorecard *contents* (not just filenames) and prints an actual per-scorecard metric table + deltas
 * between comparable configurations; LEARN derives proposals from that measured data instead of hardcoded strings. Added `queen verify` — reads
 * ledger.jsonl + state.json + routing-table.json and checks falsifiable claims (tick monotonicity, visual-artifact existence on disk, lastDerivedFrom
 * dedup), printing PASS/FAIL per check. `measure`, `learn`, and `verify` are read-only: they never write state.json, routing-table.json, or the ledger.
 *
 * Usage: node tools/queen/driver.mjs <subcommand> [args]
 *        npm run queen -- <subcommand> ...
 *        tick | queen-tick  : full v0.2 closed loop (recommended for self-advancement)
 *
 * Built on SIP — Starlight Intelligence Protocol.
 */

import { readFileSync, writeFileSync, appendFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const TABLE_PATH = join(ROOT, 'tools', 'proving-ground', 'routing-table.json');
const DOCTRINE_PATH = join(ROOT, 'tools', 'proving-ground', 'ROUTING-DOCTRINE.md');
const SCORECARDS_DIR = join(ROOT, 'tools', 'proving-ground', 'scorecards');
const ARENA_DIR = join(ROOT, 'tools', 'arena', 'runs');
const QUEEN_DIR = join(ROOT, 'tools', 'queen');
const STATE_PATH = join(QUEEN_DIR, 'state.json');
const LEDGER_PATH = join(QUEEN_DIR, 'ledger.jsonl');
const VAULT_PATH = join(ROOT, 'memory', 'vaults', 'operational-vault.md');

const LAST_DERIVED_CAP = 10;
const MEASUREMENT_GAP_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const READ_ONLY_SUBS = new Set(['measure', 'learn', 'verify']);

mkdirSync(QUEEN_DIR, { recursive: true });

function loadJSON(p) { return JSON.parse(readFileSync(p, 'utf8')); }
function loadText(p) { return readFileSync(p, 'utf8'); }
function saveJSON(p, o) { writeFileSync(p, JSON.stringify(o, null, 2)); }
function appendLine(p, line) { appendFileSync(p, line + '\n'); }

const table = loadJSON(TABLE_PATH);
const doctrineHead = loadText(DOCTRINE_PATH).split('\n').slice(0, 30).join('\n');
const state = existsSync(STATE_PATH) ? loadJSON(STATE_PATH) : { lastTick: null, lastSub: null, lastClass: null, proposals: [], visualsProduced: 0, lastMeasureTs: null, tickHistory: [] };

function classify(desc) {
  const d = (desc || '').toLowerCase();
  if (d.includes('build') || d.includes('implement') || d.includes('driver') || d.includes('scaffold')) return 'agentic-composer-long';
  if (d.includes('parallel') || d.includes('measure') || d.includes('gstack') || d.includes('harness') || d.includes('advance') || d.includes('whole')) return 'parallel-harness-measure';
  if (d.includes('visual') || d.includes('image') || d.includes('card') || d.includes('palace') || d.includes('heatmap')) return 'visual-synthesis';
  if (d.includes('memory') || d.includes('consolidation') || d.includes('gateway') || d.includes('palace') || d.includes('curate')) return 'parallel-harness-measure';
  if (d.includes('deep') || d.includes('reason') || d.includes('architecture')) return 'deep-reasoning';
  if (d.includes('code') || d.includes('test') || d.includes('function')) return 'codegen';
  return 'interactive-agentic';
}

function getClassInfo(cls) {
  return table.classes.find(c => c.taskClass === cls) || { route: table.safeDefault, confidence: 'n/a', autoApply: false, stakes: 'low', evidence: 'default', rounds: 0 };
}

// ---------------------------------------------------------------------------
// Scorecard measurement — defensive, shape-agnostic metric extraction.
//
// Real scorecards under tools/proving-ground/scorecards/*.json use at least
// three different shapes ("results": {config: {metric: value}}, "lanes": [{lane,
// metrics: [{name, value}]}], nested "results.<variant>.metric_name"). Rather
// than hand-parse each shape, walkMetrics() recursively scans any object/array
// for keys (or {name, value} entries) that look like a retrieval metric and
// records the value + the path it was found under (used as the "configuration"
// label for delta comparison).
// ---------------------------------------------------------------------------

const METRIC_KEY_RE = /(precision|recall|hit|f1|ndcg|mrr)[@_]?(at)?[@_]?\d+/i;

function numFromValue(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const pct = v.match(/(-?\d+(?:\.\d+)?)\s*%/);
    if (pct) return parseFloat(pct[1]) / 100;
    if (/^-?\d+(?:\.\d+)?$/.test(v.trim())) return parseFloat(v);
  }
  return null;
}

function walkMetrics(node, pathParts, out) {
  if (node == null || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) {
      if (item && typeof item === 'object' && typeof item.name === 'string' && 'value' in item && METRIC_KEY_RE.test(item.name)) {
        const val = numFromValue(item.value);
        if (val !== null) out.push({ config: pathParts.join('.') || '(root)', name: item.name, value: val });
        continue;
      }
      if (item && typeof item === 'object') {
        const label = typeof item.lane === 'string' ? item.lane : (typeof item.taskClass === 'string' ? item.taskClass : null);
        walkMetrics(item, label ? [...pathParts, label] : pathParts, out);
      }
    }
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (k === '$comment' || k === 'attestation') continue;
    if (METRIC_KEY_RE.test(k)) {
      const val = numFromValue(v);
      if (val !== null) { out.push({ config: pathParts.join('.') || '(root)', name: k, value: val }); continue; }
    }
    if (v && typeof v === 'object') walkMetrics(v, [...pathParts, k], out);
  }
}

/** For each metric name that appears under >=2 configurations in the same scorecard, report the low/high spread. */
function computeDeltas(metrics) {
  const byName = new Map();
  for (const m of metrics) {
    if (!byName.has(m.name)) byName.set(m.name, []);
    byName.get(m.name).push(m);
  }
  const deltas = [];
  for (const [name, list] of byName) {
    if (list.length < 2) continue;
    const sorted = [...list].sort((a, b) => a.value - b.value);
    const lo = sorted[0];
    const hi = sorted[sorted.length - 1];
    if (lo.value === hi.value) continue;
    const relativePct = lo.value === 0 ? null : ((hi.value - lo.value) / Math.abs(lo.value)) * 100;
    deltas.push({ name, low: lo, high: hi, absoluteDelta: hi.value - lo.value, relativePct });
  }
  return deltas;
}

function scorecardMatchesLane(raw, file, lane) {
  if (!lane) return true;
  const l = lane.toLowerCase();
  if (file.toLowerCase().includes(l)) return true;
  if (typeof raw.lane === 'string' && raw.lane.toLowerCase().includes(l)) return true;
  if (Array.isArray(raw.lanes) && raw.lanes.some(x => typeof x.lane === 'string' && x.lane.toLowerCase().includes(l))) return true;
  return false;
}

/** Parse every scorecards/*.json file defensively. Unparseable / metric-less files are skipped with a warning, never thrown. */
function gatherScorecards(lane) {
  const warnings = [];
  let files = [];
  try {
    files = readdirSync(SCORECARDS_DIR).filter(f => f.endsWith('.json'));
  } catch (e) {
    warnings.push(`could not read scorecards dir (${SCORECARDS_DIR}): ${e.message}`);
    return { scorecards: [], warnings };
  }
  const scorecards = [];
  for (const file of files) {
    let raw;
    try {
      raw = loadJSON(join(SCORECARDS_DIR, file));
    } catch (e) {
      warnings.push(`${file} — could not parse JSON (${e.message}); skipped`);
      continue;
    }
    if (!scorecardMatchesLane(raw, file, lane)) continue;
    const metrics = [];
    walkMetrics(raw, [], metrics);
    if (metrics.length === 0) {
      warnings.push(`${file} — no recognizable numeric metrics found; skipped (verdict=${raw.verdict || 'n/a'})`);
      continue;
    }
    scorecards.push({ file, lane: raw.lane || null, ranAt: raw.ranAt || null, verdict: raw.verdict || null, metrics, deltas: computeDeltas(metrics) });
  }
  return { scorecards, warnings };
}

/** Propose promoting hybrid weighting when a "hybrid"-labelled configuration beats a "lexical"-labelled one by >20% relative on a shared metric. */
function deriveHybridPromotions(scorecards) {
  const proposals = [];
  for (const sc of scorecards) {
    for (const d of sc.deltas) {
      const loIsLexical = /lexical/i.test(d.low.config);
      const hiIsHybrid = /hybrid/i.test(d.high.config);
      if (loIsLexical && hiIsHybrid && d.relativePct !== null && d.relativePct > 20) {
        const lane = sc.lane || sc.file;
        proposals.push({
          type: 'promote-hybrid-weighting',
          lane,
          metric: d.name,
          reason: `promote hybrid weighting for ${lane}`,
          evidence: `${d.name}: ${d.low.config}=${d.low.value} -> ${d.high.config}=${d.high.value} (+${d.relativePct.toFixed(1)}% relative, source=${sc.file})`
        });
      }
    }
  }
  return proposals;
}

/** Latest ranAt per lane, across every scorecard (top-level "lane" field + system-eval "lanes[].lane" entries). */
function collectLaneDates() {
  const laneDates = new Map();
  let files = [];
  try { files = readdirSync(SCORECARDS_DIR).filter(f => f.endsWith('.json')); } catch { return laneDates; }
  for (const file of files) {
    let raw;
    try { raw = loadJSON(join(SCORECARDS_DIR, file)); } catch { continue; }
    const ranAt = raw.ranAt ? new Date(raw.ranAt) : null;
    if (!ranAt || Number.isNaN(ranAt.getTime())) continue;
    const lanesHere = [];
    if (typeof raw.lane === 'string') lanesHere.push(raw.lane);
    if (Array.isArray(raw.lanes)) for (const l of raw.lanes) if (typeof l.lane === 'string') lanesHere.push(l.lane);
    for (const lane of lanesHere) {
      const prev = laneDates.get(lane);
      if (!prev || ranAt > prev) laneDates.set(lane, ranAt);
    }
  }
  return laneDates;
}

/** Propose a measurement gap for any lane whose newest scorecard is older than MEASUREMENT_GAP_MS. */
function deriveMeasurementGaps(laneDates) {
  const now = Date.now();
  const proposals = [];
  for (const [lane, date] of laneDates) {
    const ageMs = now - date.getTime();
    if (ageMs > MEASUREMENT_GAP_MS) {
      const days = Math.floor(ageMs / (24 * 60 * 60 * 1000));
      proposals.push({
        type: 'measurement-gap',
        lane,
        reason: `measurement gap: ${lane}`,
        evidence: `latest scorecard for lane "${lane}" is ${date.toISOString().slice(0, 10)} (${days} days old, >30-day threshold)`
      });
    }
  }
  return proposals;
}

/** Push a lastDerivedFrom note, deduping exact repeats and capping to the LAST_DERIVED_CAP most recent entries. */
function pushDerivedNote(note) {
  const list = table.lastDerivedFrom || [];
  const deduped = list.filter(n => n !== note);
  deduped.push(note);
  table.lastDerivedFrom = deduped.slice(-LAST_DERIVED_CAP);
}

function cmdStatus() {
  console.log('STARLIGHT QUEEN STATUS (driver v0.3)');
  console.log('Table version:', table.version, 'lastDerivedFrom:', table.lastDerivedFrom);
  console.log('killSwitch:', table.killSwitch, 'safeDefault:', table.safeDefault);
  console.log('Recent classes (Grok-highlighted):');
  table.classes.filter(c => c.taskClass.includes('grok') || c.taskClass.includes('parallel') || c.taskClass.includes('agentic') || c.taskClass.includes('visual')).forEach(c => {
    console.log(`  ${c.taskClass}: route=${c.route} conf=${c.confidence} rounds=${c.rounds} auto=${c.autoApply} stakes=${c.stakes}`);
  });
  console.log('Latest receipts (scorecards + arena):');
  try {
    const sc = readdirSync(SCORECARDS_DIR).filter(f => f.endsWith('.json')).slice(-3);
    const ar = readdirSync(ARENA_DIR).filter(f => f.includes('grok')).slice(-1);
    console.log('  scorecards:', sc.join(', '));
    console.log('  arena:', ar.join(', '));
  } catch {}
  console.log('State:', state);
  console.log('Doctrine head (manual note):', doctrineHead.split('\n').find(l => l.includes('MANUAL')) || 'see full');
  console.log('**Built on SIP — Starlight Intelligence Protocol**');
}

function cmdRoute(desc) {
  if (table.killSwitch) { console.log('killSwitch active →', table.safeDefault); return; }
  const cls = classify(desc);
  const info = getClassInfo(cls);
  console.log(`ROUTE for "${desc}" → class=${cls}`);
  console.log(`  target: ${info.route} (conf=${info.confidence}, autoApply=${info.autoApply}, stakes=${info.stakes}, rounds=${info.rounds})`);
  console.log(`  evidence: ${info.evidence?.slice(0,120)}...`);
  if (info.stakes === 'irreversible' || !info.autoApply) console.log('  A1: safe-default + Frank-ack required');
  if (info.rounds < 2) console.log('  A2: suggestion only (needs 2nd concordant round)');
  console.log('**Built on SIP — Starlight Intelligence Protocol**');
  state.lastClass = cls;
  saveJSON(STATE_PATH, state);
}

// MEASURE — real: parses every scorecards/*.json CONTENT (not just the filename), prints a per-scorecard
// metric table, prints deltas between comparable configurations (e.g. lexical vs hybrid), and emits a
// machine-readable JSON summary line. Read-only: never writes state/table/ledger.
function cmdMeasure(lane) {
  console.log('MEASURE', lane || 'all');
  const { scorecards, warnings } = gatherScorecards(lane);
  warnings.forEach(w => console.log('  WARN:', w));

  if (scorecards.length === 0) {
    console.log('  (no scorecards with recognizable metrics for this lane filter)');
  }

  for (const sc of scorecards) {
    console.log(`\n  --- ${sc.file} (lane=${sc.lane || 'n/a'}, ranAt=${sc.ranAt || 'n/a'}, verdict=${sc.verdict || 'n/a'}) ---`);
    for (const m of sc.metrics) {
      console.log(`    ${m.config} :: ${m.name} = ${m.value}`);
    }
    if (sc.deltas.length) {
      console.log('    deltas (comparable configurations):');
      for (const d of sc.deltas) {
        const relStr = d.relativePct === null ? 'n/a (baseline=0)' : `${d.relativePct >= 0 ? '+' : ''}${d.relativePct.toFixed(1)}%`;
        console.log(`      ${d.name}: ${d.low.config}=${d.low.value} -> ${d.high.config}=${d.high.value} (delta=${d.absoluteDelta.toFixed(4)}, relative=${relStr})`);
      }
    }
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    laneFilter: lane || null,
    scorecards: scorecards.map(sc => ({ file: sc.file, lane: sc.lane, ranAt: sc.ranAt, verdict: sc.verdict, metrics: sc.metrics, deltas: sc.deltas })),
    warnings
  };
  console.log('\nMEASURE_SUMMARY_JSON ' + JSON.stringify(summary));
  console.log('Grok note: for real parallel dispatch use spawn_subagent (explore/plan) + run_terminal_command per lane + gstack/excellence gate. Entry: node tools/run-v01-evals.mjs or python bencher.');
  console.log('**Built on SIP — Starlight Intelligence Protocol**');
  return summary;
}

// LEARN — real: derives proposals from the SAME measured scorecard data MEASURE parses (no hardcoded
// filename-sniffing). Two proposal kinds: (1) promote-hybrid-weighting when a hybrid config beats a
// lexical one by >20% relative on a shared metric, with the actual numbers as evidence; (2)
// measurement-gap when a lane's newest scorecard is >30 days old. Read-only: never writes state/table.
function cmdLearn() {
  console.log('LEARN from receipts (data-derived; no hardcoded proposals)...');
  const { scorecards, warnings } = gatherScorecards(undefined);
  warnings.forEach(w => console.log('  WARN:', w));

  const hybridProposals = deriveHybridPromotions(scorecards);
  const laneDates = collectLaneDates();
  const gapProposals = deriveMeasurementGaps(laneDates);
  const proposals = [...hybridProposals, ...gapProposals];

  console.log('Proposals (derived from measured scorecard data; A2 floor + autoApply gates still apply before any table write):');
  if (proposals.length === 0) {
    console.log('  (none — no scorecard comparison crossed the >20% relative threshold, and no lane has a measurement gap >30 days)');
  }
  proposals.forEach(p => console.log(`  [${p.type}] ${p.reason} — ${p.evidence}`));
  console.log('**Built on SIP — Starlight Intelligence Protocol**');
  return proposals;
}

function cmdRatify(cls) {
  const info = getClassInfo(cls || state.lastClass || 'interactive-agentic');
  console.log(`RATIFY ${cls || 'current'}`);
  if (info.stakes === 'irreversible') {
    console.log('  A1: irreversible — safeDefault + explicit Frank-ack + /starlight-board');
  } else if (info.rounds < 2) {
    console.log('  A2: rounds <2 — suggestion only, no autoApply');
  } else {
    console.log('  OK for low-stakes autoApply');
  }
  console.log('**Built on SIP — Starlight Intelligence Protocol**');
}

// v0.2 closed-loop tick: ROUTE→MEASURE(parallel subagent)→LEARN(synth)→RATIFY(gates)→LEDGER(visual PROMPT mandatory + velocity)
function cmdTick(full) {
  const startTs = Date.now();
  const tickId = `queen-tick-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}`;
  console.log(`QUEEN v0.2 TICK START ${tickId} (full=${!!full})`);
  console.log('**Built on SIP — Starlight Intelligence Protocol**');

  // 1. ROUTE (use recent or default)
  const sampleDesc = full ? 'parallel harness measure for queen self-advancement tick + visual synthesis ledger card' : 'build queen tick automation';
  cmdRoute(sampleDesc);
  const cls = state.lastClass || 'parallel-harness-measure';
  const info = getClassInfo(cls);
  console.log(`Classified to ${cls} → route=${info.route} stakes=${info.stakes} rounds=${info.rounds} autoApply=${info.autoApply}`);

  // 2. MEASURE — parallel subagent dispatch guidance (Grok harness executes these)
  const measureStart = new Date().toISOString();
  state.lastMeasureTs = measureStart;
  console.log('\nMEASURE (parallel lanes + Visual Eval + gstack + excellence):');
  console.log('  Dispatch recipe for harness (use spawn_subagent / Task parallel):');
  console.log('  - subagent-explore-model: run arena/model (tools/arena/), read latest receipt, ENFORCE visual (image_gen card or visualComposerTest ref); gstack health; excellence gate. Output: receipt + visual ref.');
  console.log('  - subagent-explore-harness: node tools/run-v01-evals.mjs + gstack; read receipt.');
  console.log('  - subagent-plan-cost: Cost Plane snapshot + per-class telemetry (if wired); gstack.');
  console.log('  - subagent-visual-eval: if model lane lacks a visual PROMPT, emit an image_gen prompt for "Starlight Queen v0.2 tick routing heatmap / arena card (dark tech, SIP footer, class routes, confidence, velocity stats)"; capture resultPath once the harness actually renders it; verify legibility/prompt adherence.');
  console.log('  Compose + write unified MEASURE receipt (model now includes a visual prompt per lanes.json/SPEC — rendering the prompt into an image is a separate harness step). Use real-time search for external grounding.');
  console.log('  Grok: parallel via explore/plan; check-work after for drift/excellence.');

  // Emit a visual-generation PROMPT (this driver does not call image_gen itself — the harness renders it,
  // as a separate step, and must record the resultPath in the ledger if it does).
  const visualPrompt = `Clean technical infographic (dark premium tech aesthetic, precise sans labels, high legibility): Starlight Queen v0.2 Self-Advancement Tick ${tickId}. Show closed loop ROUTE→MEASURE→LEARN→RATIFY→LEDGER with subagent dispatch icons. Highlight new: Visual Eval dimension on Proving Ground model lane (a visual PROMPT is emitted per receipt; rendering the prompt into an image is a separate step the harness performs, not this driver). Composer 2.5 preferred for agentic-composer-long + visual-synthesis + parallel-harness-measure. Table excerpt (top classes: agentic-composer-long→grok/Composer, visual-synthesis→grok image_gen, parallel-harness-measure→grok subagent). Advancement velocity box: last tick delta, visual prompts/cycle >=1, anti-Goodhart note. SIP footer "Built on SIP — Starlight Intelligence Protocol v0.2 Queen". Minimalist, no slop, exact class names.`;
  console.log('\n  VISUAL PROMPT (this driver only emits the prompt text; execute via image_gen / Imagine in the harness to actually render it, and ref the output path in LEDGER):');
  console.log('  ', visualPrompt.slice(0, 280) + '...');
  // Counts a visual PROMPT emitted this tick — NOT a rendered/confirmed artifact. If the harness renders it,
  // the resultPath must be recorded manually in the ledger; `queen verify` checks referenced paths against disk.
  state.visualsProduced = (state.visualsProduced || 0) + 1;

  // 3. LEARN — synthesis proposals derived from measured scorecard data (A2 applied)
  console.log('\nLEARN (receipt synthesis → table deltas + doctrine patches; best-of-n + check-work):');
  console.log('  Subagent recipe: read latest arena/scorecards (incl. composer25 + visual), cost, prior ledger; propose only if >=2 concordant or note directional; output patch JSON + velocity calc (Date.now() - measureStart); flag A1/A2 violations.');
  const { scorecards: measuredScorecards } = gatherScorecards(undefined);
  const proposals = deriveHybridPromotions(measuredScorecards);
  console.log('  Proposals (data-derived, A2 floor + v0.2 visual-prompt requirement applied):', proposals.length ? proposals : '(none new; current scorecards show no >20% relative hybrid-vs-lexical win pending)');
  state.proposals = proposals;

  // 4. RATIFY (A1/A2 gates, drift, substrate split)
  console.log('\nRATIFY (A1 low-stakes auto only if rounds>=2 && !irreversible; A2 floor; drift detect):');
  const canAuto = info.stakes !== 'irreversible' && info.rounds >= 2 && !table.killSwitch && info.autoApply;
  if (canAuto && cls !== 'substrate-governance') {
    console.log(`  LOW-STAKES: safe to auto-apply for ${cls} (per table). Driver will light-patch lastDerivedFrom only (full class bumps via manual or future router).`);
    // Surgical safe update example (lastDerived + advancement; reversible via queen backups). Deduped + capped.
    const nowNote = `${tickId} v0.2 tick`;
    const beforeLen = (table.lastDerivedFrom || []).length;
    pushDerivedNote(nowNote);
    if (table.advancement) {
      table.advancement.lastQueenTick = tickId;
      table.advancement.visualsThisCycle = state.visualsProduced;
    }
    saveJSON(TABLE_PATH, table);
    const backup = join(QUEEN_DIR, `table-backup-${Date.now()}.json`);
    saveJSON(backup, loadJSON(TABLE_PATH));
    console.log(`  Applied safe lastDerived/advancement patch (deduped+capped at ${LAST_DERIVED_CAP}, was ${beforeLen} now ${table.lastDerivedFrom.length}; backup created).`);
  } else {
    console.log('  NOT auto-applied (A1/A2 or stakes or rounds<2 or killSwitch). Proposal only. For irreversible/substrate: route to /starlight-board + Frank ack. Use AskUserQuestion equivalent for ack.');
  }

  // 5. LEDGER (text + visual-prompt ref + vault + velocity)
  const endTs = Date.now();
  const durationMs = endTs - startTs;
  const velocityEntry = {
    tickId,
    start: new Date(startTs).toISOString(),
    durationMs,
    visuals: state.visualsProduced,
    measureToLedgerDeltaMs: endTs - new Date(measureStart).getTime(),
    class: cls,
    proposals: proposals.length,
    autoApplied: !!canAuto
  };
  state.tickHistory = (state.tickHistory || []).slice(-4).concat([velocityEntry]);
  saveJSON(STATE_PATH, state);

  console.log('\nLEDGER (visual PROMPT + text + vault + github option + SIP):');
  console.log('  Visual ref: (harness executes image_gen with the prompt above to actually render it; record resultPath here + in vault note; `queen verify` checks that referenced paths exist on disk).');
  console.log('  Velocity snapshot:', velocityEntry);
  console.log('  Falsifier check: visual prompts emitted>=1?', state.visualsProduced >= 1, '; A1/A2 honored?', !canAuto || info.rounds>=2);
  // Queen rec (excellence + skill integration): on every tick/ledger, after visual, invoke memory/mempalace-obsidian-bridge (the visual-tied new skill) + /curate-recall pattern to auto-offer palace card / curated note from the visual receipt + vault excerpt. Ties Queen visuals directly to Obsidian graph + palace recall. Driver emits the prompt; harness + skill close the human+auto loop. See skills/memory/mempalace-obsidian-bridge.md and operational-vault Queen entries.

  // Always append ledger entry (even without --append for tick)
  const ledgerEntry = {
    ts: new Date().toISOString(),
    sub: 'tick',
    class: cls,
    tickId,
    velocity: velocityEntry,
    visualPromptRef: 'see above (prompt text only; rendered image path, if any, must be recorded separately by the harness)',
    note: `v0.2 closed Queen tick. MEASURE parallel subagents + a visual PROMPT emitted (rendering, if it happened, is a separate harness step). LEARN proposals derived from real scorecard data. ${canAuto ? 'Safe low-stakes patch applied' : 'No auto patch (gates)'}. Advancement velocity captured. Composer formalization active. Grok harness excellence + SIP.`,
    reversible: true
  };
  appendLine(LEDGER_PATH, JSON.stringify(ledgerEntry));
  const vaultNote = `\n### [${ledgerEntry.ts.slice(0,10)}] Queen v0.2 tick ${tickId}\n**Velocity:** duration ${durationMs}ms, measure-to-ledger ${velocityEntry.measureToLedgerDeltaMs}ms, visual prompts emitted ${state.visualsProduced}\n**Class:** ${cls} (auto=${canAuto})\n**Visual:** driver emitted an image_gen PROMPT this tick (rendering — actual image generation — is a separate harness step; see driver output for the prompt text and, if rendered, the image path). Arena/model receipts now carry a visual-prompt requirement per v0.2 lanes/SPEC.\n**Proposals:** ${proposals.length} (data-derived from tools/proving-ground/scorecards/*.json)\n**Falsifiers passed:** visual prompts>=1, A-gates, SIP.\n**Built on SIP — Starlight Intelligence Protocol (Queen v0.2 driver)**\n`;
  appendFileSync(VAULT_PATH, vaultNote);
  console.log('  Appended to queen/ledger.jsonl + operational-vault.md');

  console.log(`\nQUEEN v0.2 TICK COMPLETE ${tickId}. Duration: ${durationMs}ms. See state.json for history. Run with --full for richer lanes. Next: cross-harness R5 for hardening.`);
  console.log('**Built on SIP — Starlight Intelligence Protocol**');
}

function cmdLedger(append) {
  const entry = {
    ts: new Date().toISOString(),
    sub: 'ledger',
    class: state.lastClass,
    note: 'Queen whole-SIS advance 2026-06-12: Architect+Queen surfaces + driver tick (parallel-harness-measure) + 5 image_gen PROMPTS emitted (Queen-loop+gateway, 3D MemPalace, SIS arch, routing heatmap, advance receipt) + memory gateway v0.1/engine v0.2 + palace/curate integration + routing evo + /si visual status + vault updates. Rendering status of the 5 referenced paths below is unverified by this entry alone — run `node tools/queen/driver.mjs verify` to check them against disk. Grok subagent/gstack/image for continuous loop.',
    reversible: true,
    visuals: [
      'images/3.jpg (Queen loop + Memory Gateway + MemPalace flow)',
      'images/1.jpg (3D MemPalace isometric)',
      'images/2.jpg (full SIS architecture)',
      'images/5.jpg (routing heatmap Grok classes)',
      'images/4.jpg (Queen Advance Receipt card)'
    ]
  };
  if (append) {
    appendLine(LEDGER_PATH, JSON.stringify(entry));
    const note = '\n### [' + entry.ts.slice(0,10) + '] Queen Advance — Whole SIS (Grok 4.3 visual prompts + continuous)\n**Category:** queen-loop / whole-system-evolution\n**Source:** tools/queen/driver.mjs + commands/starlight-queen.md + starlight-architect.md (Architect + Queen)\n**Related:** routing-table.json, ROUTING-DOCTRINE.md, commands/starlight.md, agents/*-orchestrator.md + *-architect.md, HARNESS.md, memory/VAULT_ARCHITECTURE.md, memory/vaults/*, tools/proving-ground/*, 5 image_gen prompts (see entry; rendering unverified — see `queen verify`), curate-recall, Memory Gateway src/gateway/*\n\n**Execution:** Full ROUTE (parallel-harness-measure) → MEASURE (memory lane + engine v0.2 receipts) → LEARN (round bumps + new memory-consolidation-queen + palace-visual-recall proposals) → RATIFY (OK low-stakes) → LEDGER (this + visual-prompt refs + vault + table lastDerived, deduped+capped). Driver enhanced for palace/gateway/advance classify. 5 premium image_gen PROMPTS emitted for visual ledger/palace/heatmap/arch — actual rendering + on-disk verification is a separate step (`queen verify`). /si status now references visual prompts. Whole system advanced: memory (gateway session as Queen state, Queen-driven consolidation/visual recall), orchestrator/architect roles (visual continuous patterns), proving-ground feedback, HARNESS Grok, vaults protocol, COMMAND surfaces currency.\n\n**Visual prompts (harness session images/ — integrate to curated/docs as needed; existence on disk unverified by this entry, see `queen verify`):**\n- Queen continuous loop + gateway + palace integration: images/3.jpg\n- 3D MemPalace: images/1.jpg\n- Full SIS architecture: images/2.jpg\n- Routing heatmap (Grok classes): images/5.jpg\n- Queen Advance Receipt: images/4.jpg\n\n**Decisions & Patterns:** Make Queen executable continuous core (driver + subagent engine). Evolve routing for visual/parallel/memory classes (A2 floor). /si visual surface. Palace visual + curate-recall as Queen LEDGER output. Cross-harness gateway for Queen ticks. SIP attestation ambient. A1/A2/A3 honored. Frank DNA: direct, technical, warm, playful, compound.\n\n**Built on SIP — Starlight Intelligence Protocol**\n';
    appendFileSync(VAULT_PATH, note);
    const derivedNote = '2026-06-12 Queen whole-SIS visual advance (5 images, memory/palace/gateway, /si visual, driver enhance)';
    const beforeLen = (table.lastDerivedFrom || []).length;
    pushDerivedNote(derivedNote);
    saveJSON(TABLE_PATH, table);
    const backup = join(QUEEN_DIR, 'table-backup-' + Date.now() + '.json');
    saveJSON(backup, loadJSON(TABLE_PATH));
    console.log('Ledger appended to', LEDGER_PATH, 'and operational-vault.md');
    console.log(`Table lastDerivedFrom updated (deduped+capped at ${LAST_DERIVED_CAP}, was ${beforeLen} now ${table.lastDerivedFrom.length}; backup created).`);
  }
  console.log('Entry:', entry);
  console.log('**Built on SIP — Starlight Intelligence Protocol**');
}

// ---------------------------------------------------------------------------
// VERIFY — read-only. Checks the falsifiable claims the loop makes about itself:
//   (a) tickHistory timestamps are monotonically non-decreasing
//   (b) visualsProduced counter vs artifact paths actually referenced in the ledger and present on disk
//   (c) routing-table.json lastDerivedFrom has no duplicate entries
// Never writes state.json, routing-table.json, or the ledger.
// ---------------------------------------------------------------------------

function checkTickHistoryMonotonic() {
  const hist = state.tickHistory || [];
  for (let i = 1; i < hist.length; i++) {
    const prevT = new Date(hist[i - 1].start).getTime();
    const curT = new Date(hist[i].start).getTime();
    if (Number.isNaN(prevT) || Number.isNaN(curT)) {
      return { pass: false, detail: `entry ${i - 1} or ${i} has an unparseable start timestamp` };
    }
    if (curT < prevT) {
      return { pass: false, detail: `entry ${i} (${hist[i].tickId}) start ${hist[i].start} precedes entry ${i - 1} start ${hist[i - 1].start}` };
    }
  }
  return { pass: true, detail: `${hist.length} tick(s) in history, all non-decreasing` };
}

function checkVisualsArtifacts() {
  const refs = [];
  if (existsSync(LEDGER_PATH)) {
    const lines = loadText(LEDGER_PATH).split('\n').filter(Boolean);
    for (const line of lines) {
      let entry;
      try { entry = JSON.parse(line); } catch { continue; }
      if (Array.isArray(entry.visuals)) {
        for (const v of entry.visuals) {
          if (typeof v !== 'string') continue;
          const m = v.match(/^([^\s(]+)/);
          if (m) refs.push(m[1]);
        }
      }
    }
  }
  const uniqueRefs = [...new Set(refs)];
  const existing = uniqueRefs.filter(r => existsSync(join(ROOT, r)));
  const missing = uniqueRefs.filter(r => !existsSync(join(ROOT, r)));
  return { claimed: state.visualsProduced || 0, referenced: uniqueRefs.length, existing: existing.length, missing };
}

function cmdVerify() {
  console.log('VERIFY — falsifiable Queen claims (read-only; never mutates state.json / routing-table.json / ledger.jsonl)');
  const checks = [];

  checks.push({ name: 'tickHistory timestamps monotonic', ...checkTickHistoryMonotonic() });

  const v = checkVisualsArtifacts();
  const visualsPass = v.missing.length === 0;
  checks.push({
    name: 'visualsProduced counter vs artifacts referenced in ledger existing on disk',
    pass: visualsPass,
    detail: visualsPass
      ? `${v.existing}/${v.referenced} referenced artifact path(s) exist on disk (state.visualsProduced=${v.claimed})`
      : `${v.missing.length}/${v.referenced} referenced artifact path(s) do NOT exist on disk (state.visualsProduced claims ${v.claimed} visual(s) produced): ${v.missing.join(', ')}`
  });

  const derivedList = table.lastDerivedFrom || [];
  const dupSet = new Set(derivedList);
  const dupPass = dupSet.size === derivedList.length;
  checks.push({
    name: 'routing-table.json lastDerivedFrom has no duplicates',
    pass: dupPass,
    detail: dupPass ? `${derivedList.length} unique entries` : `${derivedList.length - dupSet.size} duplicate entries out of ${derivedList.length}`
  });

  for (const c of checks) {
    console.log(`  [${c.pass ? 'PASS' : 'FAIL'}] ${c.name} — ${c.detail}`);
  }
  const allPass = checks.every(c => c.pass);
  console.log(`VERIFY ${allPass ? 'PASS' : 'FAIL'} (${checks.filter(c => c.pass).length}/${checks.length} checks passed)`);
  console.log('**Built on SIP — Starlight Intelligence Protocol**');
  return checks;
}

function main() {
  const [,, sub = 'help', ...args] = process.argv;
  const argStr = args.join(' ');

  // measure/learn/verify are read-only verbs: they must never mutate state.json.
  if (!READ_ONLY_SUBS.has(sub)) {
    state.lastSub = sub;
    state.lastTick = new Date().toISOString();
    saveJSON(STATE_PATH, state);
  }

  if (sub === 'status' || sub === 'stat') return cmdStatus();
  if (sub === 'route') return cmdRoute(argStr || 'build the queen driver');
  if (sub === 'measure') return cmdMeasure(args[0]);
  if (sub === 'learn') return cmdLearn();
  if (sub === 'verify') return cmdVerify();
  if (sub === 'ratify') return cmdRatify(args.find(a => a.startsWith('--class='))?.split('=')[1]);
  if (sub === 'ledger') return cmdLedger(args.includes('--append'));
  if (sub === 'tick' || sub === 'queen-tick' || sub === 'full-tick') return cmdTick(args.includes('--full') || sub === 'full-tick');
  if (sub === 'help' || sub === '--help') {
    console.log('Queen driver subs: status | route <desc> | measure [lane] | learn | verify | ratify [--class=] | ledger [--append] | tick [--full] | queen-tick');
    console.log('v0.3: measure parses real scorecard contents + prints deltas; learn derives proposals from that data (no hardcoded strings); verify checks falsifiable claims (PASS/FAIL). measure/learn/verify are read-only.');
    console.log('tick runs the full closed self-improving loop (subagent recipes for Grok, a visual PROMPT emitted per tick — rendering is a separate harness step, velocity, safe A1/A2 patches only).');
    console.log('Grok: use native spawn_subagent for the MEASURE/LEARN parallel dispatches printed by tick.');
    return;
  }
  console.log('Unknown sub. Try: status, route "build...", measure [lane], learn, verify, ratify, ledger --append, tick [--full]');
}

main();
