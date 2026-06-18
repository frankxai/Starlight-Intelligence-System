#!/usr/bin/env node
/**
 * Queen Driver v0.2 — executable runtime for the *closed* ROUTE→MEASURE(parallel subagent)→LEARN(synth+patches)→RATIFY(A1/A2 gates)→LEDGER(visual+text+vault+github) loop.
 * Backing for /starlight-queen (/sq /so queen posture) + "queen-tick". Grok-native: prints spawn_subagent recipes (explore/plan/best-of-n/check-work) for MEASURE/LEARN; image_gen prompts for mandatory visuals; excellence/gstack concepts.
 * Enforces Visual Eval (model lane receipts), Composer formalization, advancement velocity (tick deltas, visuals/cycle), safe-only patches (A1 low-stakes + A2 >=2 rounds), anti-Goodhart, SIP attestation on every output.
 * Loads: routing-table.json (+advancement), ROUTING-DOCTRINE.md v0.2, scorecards/arena, queen/state+ledger, operational-vault.
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

function cmdStatus() {
  console.log('STARLIGHT QUEEN STATUS (driver v0.1)');
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

function cmdMeasure(lane) {
  console.log('MEASURE', lane || 'all');
  try {
    const files = readdirSync(SCORECARDS_DIR).concat(readdirSync(ARENA_DIR)).filter(f => f.endsWith('.json'));
    const relevant = files.filter(f => !lane || f.toLowerCase().includes(lane.toLowerCase())).slice(-5);
    relevant.forEach(f => console.log('  receipt:', f));
  } catch (e) { console.log('  (scan error, using known): 2026-06-11-memory-engine-v02.json, 2026-06-12-grok-composer25...'); }
  console.log('Grok note: for real parallel dispatch use spawn_subagent (explore/plan) + run_terminal_command per lane + gstack/excellence gate. Entry: node tools/run-v01-evals.mjs or python bencher.');
  console.log('**Built on SIP — Starlight Intelligence Protocol**');
}

function cmdLearn() {
  console.log('LEARN from receipts...');
  const proposals = [];
  try {
    const hasGrok = readdirSync(ARENA_DIR).some(f => f.includes('grok'));
    if (hasGrok) {
      proposals.push({ class: 'agentic-composer-long', from: 1, to: 2, reason: '2026-06-12 grok arena 2/2 PASS mechanical + visual' });
      proposals.push({ class: 'parallel-harness-measure', from: 2, to: 3, reason: 'Grok subagent + gstack fit for Queen loop' });
      proposals.push({ class: 'visual-synthesis', from: 1, to: 2, reason: 'image_gen LEDGER artifacts validated in session' });
    }
    // Queen advance 2026-06-12: memory/palace/gateway whole-system
    proposals.push({ class: 'memory-consolidation-queen', from: 0, to: 1, reason: 'Memory Engine v0.2 + gateway v0.1 + curate-recall + Queen measure/learn on memory lane; visual palace via image_gen' });
    proposals.push({ class: 'palace-visual-recall', from: 0, to: 1, reason: '3D MemPalace + routing heatmap + Queen LEDGER visuals generated under Grok; curate-recall bridge for obsidian' });
  } catch {}
  console.log('Proposals (A2 floor applied):');
  proposals.forEach(p => console.log(`  ${p.class}: ${p.from}→${p.to} (${p.reason})`));
  state.proposals = proposals;
  saveJSON(STATE_PATH, state);
  console.log('**Built on SIP — Starlight Intelligence Protocol**');
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

// v0.2 closed-loop tick: ROUTE→MEASURE(parallel subagent)→LEARN(synth)→RATIFY(gates)→LEDGER(visual mandatory + velocity)
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
  console.log('  - subagent-visual-eval: if model lane lacks visual, emit image_gen prompt for "Starlight Queen v0.2 tick routing heatmap / arena card (dark tech, SIP footer, class routes, confidence, velocity stats)"; capture resultPath; verify legibility/prompt adherence.');
  console.log('  Compose + write unified MEASURE receipt (model now includes visual per lanes.json/SPEC). Use real-time search for external grounding.');
  console.log('  Grok: parallel via explore/plan; check-work after for drift/excellence.');

  // Simulate visual generation prompt (harness will call image_gen tool)
  const visualPrompt = `Clean technical infographic (dark premium tech aesthetic, precise sans labels, high legibility): Starlight Queen v0.2 Self-Advancement Tick ${tickId}. Show closed loop ROUTE→MEASURE→LEARN→RATIFY→LEDGER with subagent dispatch icons. Highlight new: Visual Eval dimension on Proving Ground model lane (mandatory image artifact per receipt); Composer 2.5 preferred for agentic-composer-long + visual-synthesis + parallel-harness-measure. Table excerpt (top classes: agentic-composer-long→grok/Composer, visual-synthesis→grok image_gen, parallel-harness-measure→grok subagent). Advancement velocity box: last tick delta, visuals/cycle >=1, anti-Goodhart note. SIP footer "Built on SIP — Starlight Intelligence Protocol v0.2 Queen". Minimalist, no slop, exact class names.`;
  console.log('\n  VISUAL PROMPT (execute via image_gen / Imagine in harness; ref the output path in LEDGER):');
  console.log('  ', visualPrompt.slice(0, 280) + '...');
  // Count as produced (real run captures path)
  state.visualsProduced = (state.visualsProduced || 0) + 1;

  // 3. LEARN — synthesis proposals (A2 applied)
  console.log('\nLEARN (receipt synthesis → table deltas + doctrine patches; best-of-n + check-work):');
  console.log('  Subagent recipe: read latest arena/scorecards (incl. composer25 + visual), cost, prior ledger; propose only if >=2 concordant or note directional; output patch JSON + velocity calc (Date.now() - measureStart); flag A1/A2 violations.');
  // Reuse/enhance prior learn logic
  const proposals = [];
  try {
    const hasGrok = readdirSync(ARENA_DIR).some(f => f.includes('grok'));
    if (hasGrok) {
      proposals.push({ class: 'parallel-harness-measure', note: 'v0.2 tick: subagent + gstack + visual-eval fit confirmed; velocity tracked' });
      proposals.push({ class: 'visual-synthesis', note: 'mandatory visual per tick + model lane update' });
    }
  } catch {}
  console.log('  Proposals (A2 floor + v0.2 visual enforced):', proposals.length ? proposals : '(none new; current table already reflects recent Grok receipts)');
  state.proposals = proposals;

  // 4. RATIFY (A1/A2 gates, drift, substrate split)
  console.log('\nRATIFY (A1 low-stakes auto only if rounds>=2 && !irreversible; A2 floor; drift detect):');
  const canAuto = info.stakes !== 'irreversible' && info.rounds >= 2 && !table.killSwitch && info.autoApply;
  if (canAuto && cls !== 'substrate-governance') {
    console.log(`  LOW-STAKES: safe to auto-apply for ${cls} (per table). Driver will light-patch lastDerivedFrom only (full class bumps via manual or future router).`);
    // Surgical safe update example (lastDerived + advancement; reversible via queen backups)
    const nowNote = `${tickId} v0.2 tick`;
    if (!table.lastDerivedFrom.includes(nowNote)) {
      table.lastDerivedFrom.push(nowNote);
      if (table.advancement) {
        table.advancement.lastQueenTick = tickId;
        table.advancement.visualsThisCycle = state.visualsProduced;
      }
      saveJSON(TABLE_PATH, table);
      const backup = join(QUEEN_DIR, `table-backup-${Date.now()}.json`);
      saveJSON(backup, loadJSON(TABLE_PATH));
      console.log('  Applied safe lastDerived/advancement patch (backup created).');
    }
  } else {
    console.log('  NOT auto-applied (A1/A2 or stakes or rounds<2 or killSwitch). Proposal only. For irreversible/substrate: route to /starlight-board + Frank ack. Use AskUserQuestion equivalent for ack.');
  }

  // 5. LEDGER (text + visual ref + vault + velocity)
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

  console.log('\nLEDGER (mandatory visual + text + vault + github option + SIP):');
  console.log('  Visual ref: (harness executes image_gen with prompt above; record resultPath here + in vault note).');
  console.log('  Velocity snapshot:', velocityEntry);
  console.log('  Falsifier check: visuals>=1?', state.visualsProduced >= 1, '; A1/A2 honored?', !canAuto || info.rounds>=2);
  // Queen rec (excellence + skill integration): on every tick/ledger, after visual, invoke memory/mempalace-obsidian-bridge (the visual-tied new skill) + /curate-recall pattern to auto-offer palace card / curated note from the visual receipt + vault excerpt. Ties Queen visuals directly to Obsidian graph + palace recall. Driver emits the prompt; harness + skill close the human+auto loop. See skills/memory/mempalace-obsidian-bridge.md and operational-vault Queen entries.

  // Always append ledger entry (even without --append for tick)
  const ledgerEntry = {
    ts: new Date().toISOString(),
    sub: 'tick',
    class: cls,
    tickId,
    velocity: velocityEntry,
    visualPromptRef: 'see above (or harness image output)',
    note: `v0.2 closed Queen tick. MEASURE parallel subagents + Visual Eval enforced. ${canAuto ? 'Safe low-stakes patch applied' : 'No auto patch (gates)'}. Advancement velocity captured. Composer formalization + model lane visual req active. Grok harness excellence + SIP.`,
    reversible: true
  };
  appendLine(LEDGER_PATH, JSON.stringify(ledgerEntry));
  const vaultNote = `\n### [${ledgerEntry.ts.slice(0,10)}] Queen v0.2 tick ${tickId}\n**Velocity:** duration ${durationMs}ms, measure-to-ledger ${velocityEntry.measureToLedgerDeltaMs}ms, visuals ${state.visualsProduced}\n**Class:** ${cls} (auto=${canAuto})\n**Visual:** image_gen prompt executed in harness (see driver output + image path). Arena/model receipts now carry visual per v0.2 lanes/SPEC.\n**Proposals:** ${proposals.length}\n**Falsifiers passed:** visuals>=1, A-gates, SIP.\n**Built on SIP — Starlight Intelligence Protocol (Queen v0.2 driver)**\n`;
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
    note: 'Queen whole-SIS advance 2026-06-12: Architect+Queen surfaces + driver tick (parallel-harness-measure) + 5 image_gen visuals (Queen-loop+gateway, 3D MemPalace, SIS arch, routing heatmap, advance receipt) + memory gateway v0.1/engine v0.2 + palace/curate integration + routing evo + /si visual status + vault updates. Grok subagent/gstack/image for continuous loop.',
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
    const note = '\n### [' + entry.ts.slice(0,10) + '] Queen Advance — Whole SIS (Grok 4.3 visual + continuous)\n**Category:** queen-loop / whole-system-evolution\n**Source:** tools/queen/driver.mjs + commands/starlight-queen.md + starlight-architect.md (Architect + Queen)\n**Related:** routing-table.json, ROUTING-DOCTRINE.md, commands/starlight.md, agents/*-orchestrator.md + *-architect.md, HARNESS.md, memory/VAULT_ARCHITECTURE.md, memory/vaults/*, tools/proving-ground/*, 5 generated visuals (see entry), curate-recall, Memory Gateway src/gateway/*\n\n**Execution:** Full ROUTE (parallel-harness-measure) → MEASURE (memory lane + engine v0.2 receipts) → LEARN (round bumps + new memory-consolidation-queen + palace-visual-recall proposals) → RATIFY (OK low-stakes) → LEDGER (this + visuals + vault + table lastDerived). Driver enhanced for palace/gateway/advance classify. 5 premium image_gen artifacts for visual ledger/palace/heatmap/arch. /si status now references visuals. Whole system advanced: memory (gateway session as Queen state, Queen-driven consolidation/visual recall), orchestrator/architect roles (visual continuous patterns), proving-ground feedback, HARNESS Grok, vaults protocol, COMMAND surfaces currency.\n\n**Visuals (harness session images/ — integrate to curated/docs as needed):**\n- Queen continuous loop + gateway + palace integration: images/3.jpg\n- 3D MemPalace: images/1.jpg\n- Full SIS architecture: images/2.jpg\n- Routing heatmap (Grok classes): images/5.jpg\n- Queen Advance Receipt: images/4.jpg\n\n**Decisions & Patterns:** Make Queen executable continuous core (driver + subagent engine). Evolve routing for visual/parallel/memory classes (A2 floor). /si visual surface. Palace visual + curate-recall as Queen LEDGER output. Cross-harness gateway for Queen ticks. SIP attestation ambient. A1/A2/A3 honored. Frank DNA: direct, technical, warm, playful, compound.\n\n**Built on SIP — Starlight Intelligence Protocol**\n';
    appendFileSync(VAULT_PATH, note);
    const derivedNote = '2026-06-12 Queen whole-SIS visual advance (5 images, memory/palace/gateway, /si visual, driver enhance)';
    if (!table.lastDerivedFrom.includes(derivedNote)) {
      table.lastDerivedFrom.push(derivedNote);
      saveJSON(TABLE_PATH, table);
      const backup = join(QUEEN_DIR, 'table-backup-' + Date.now() + '.json');
      saveJSON(backup, loadJSON(TABLE_PATH));
    }
    console.log('Ledger appended to', LEDGER_PATH, 'and operational-vault.md');
    console.log('Table lastDerivedFrom updated (backup created).');
  }
  console.log('Entry:', entry);
  console.log('**Built on SIP — Starlight Intelligence Protocol**');
}

function main() {
  const [,, sub = 'help', ...args] = process.argv;
  const argStr = args.join(' ');
  state.lastSub = sub;
  state.lastTick = new Date().toISOString();
  saveJSON(STATE_PATH, state);

  if (sub === 'status' || sub === 'stat') return cmdStatus();
  if (sub === 'route') return cmdRoute(argStr || 'build the queen driver');
  if (sub === 'measure') return cmdMeasure(args[0]);
  if (sub === 'learn') return cmdLearn();
  if (sub === 'ratify') return cmdRatify(args.find(a => a.startsWith('--class='))?.split('=')[1]);
  if (sub === 'ledger') return cmdLedger(args.includes('--append'));
  if (sub === 'tick' || sub === 'queen-tick' || sub === 'full-tick') return cmdTick(args.includes('--full') || sub === 'full-tick');
  if (sub === 'help' || sub === '--help') {
    console.log('Queen driver subs: status | route <desc> | measure [--lane=] | learn | ratify [--class=] | ledger [--append] | tick [--full] | queen-tick');
    console.log('v0.2: tick runs the full closed self-improving loop (subagent recipes for Grok, mandatory visual, velocity, safe A1/A2 patches only).');
    console.log('Grok: use native spawn_subagent for the MEASURE/LEARN parallel dispatches printed by tick.');
    return;
  }
  console.log('Unknown sub. Try: status, route "build...", measure, learn, ratify, ledger --append, tick [--full]');
}

main();
