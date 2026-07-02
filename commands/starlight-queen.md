---
name: starlight-queen
description: Queen Self-Advancement & Harness Integration (v0.2 closed self-improving multi-harness loop). Primary surface for /starlight-queen, /sq (alias), /so (queen posture). Full tick: ROUTE→MEASURE(parallel subagent)→LEARN(synth+patches)→RATIFY(A-gates)→LEDGER(visual prompt + velocity). Composes /starlight-eval (model lane now with Visual Eval), proving-ground/*, queen/driver, Memory Gateway, image_gen.
usage: /starlight-queen [status|route|measure|learn|verify|ratify|ledger|tick] [--class=...] [--lane=...] [--full] | /sq [same] | /so [queen|status|tick]
---
# /starlight-queen (/sq /so) — v0.2 Queen

Continuous routing + eval overseer. **v0.2:** the closed, self-improving, multi-harness loop with explicit subagent dispatch, Visual Eval on every model receipt, Composer preference for long-agentic/visual, advancement velocity metrics + falsifiers (anti-Goodhart), A1/A2/A3 gates. Every tick emits >=1 visual PROMPT (image_gen) + ledger text + vault entry + velocity snapshot — rendering the prompt into an actual image is a separate step the harness performs, not something this driver does or confirms on its own. Run `queen verify` to check whether any referenced artifact paths actually exist on disk.

**Executable automation:** `node tools/queen/driver.mjs tick [--full]` (or `npm run queen -- tick`). Under Grok: prints native spawn_subagent recipes for parallel MEASURE/LEARN; image_gen prompt for the harness to render; safe table patches only when gates pass.

**Status:** v0.3 driver (tools/queen/driver.mjs) makes MEASURE and LEARN real — MEASURE parses scorecard *contents* (tools/proving-ground/scorecards/*.json) into an actual per-scorecard metric table + config-vs-config deltas; LEARN derives proposals from that measured data (no hardcoded strings). New `verify` subcommand reads ledger.jsonl + state.json + routing-table.json and prints PASS/FAIL per falsifiable claim (tick-history monotonicity, visual-artifact existence on disk, lastDerivedFrom dedup). `measure`, `learn`, and `verify` are read-only — they never write state.json, routing-table.json, or the ledger. v0.2 doctrine (tools/proving-ground/ROUTING-DOCTRINE.md) + lanes/SPEC still governs the loop shape and gates. SIP on all.

## Subcommands (v0.2)

### status
Show current Queen state (table v0.2 + advancement block, killSwitch, Grok-highlighted classes, recent receipts/velocity from state, last tick, visualsProduced, ledger tail).

### route <desc>
Classify + consult routing-table + doctrine v0.2. Return target + evidence + gates status. Now recognizes composer/agentic/visual/parallel/memory-consolidation classes.

### measure [lane]
Read-only. Parses every `tools/proving-ground/scorecards/*.json` file's CONTENTS (not just its filename) into a per-scorecard metric table (precision@10, hit@10, recall@5, etc., whatever shape the receipt actually uses), prints deltas between comparable configurations found in the same receipt (e.g. lexical vs hybrid), and emits a `MEASURE_SUMMARY_JSON` line. Unparseable or metric-less files are skipped with a `WARN:` line, never thrown. Never writes state.json, routing-table.json, or the ledger. Grok: parallel subagent dispatch (explore per lane) + excellence for the harness-side work this composes with.

### learn
Read-only. Derives proposals from the measured scorecard data (same parser as `measure`) — no hardcoded strings. Two kinds: `promote-hybrid-weighting` when a hybrid-labelled configuration beats a lexical-labelled one by >20% relative on a shared metric (evidence = the actual numbers + source file); `measurement-gap` when a lane's newest scorecard is older than 30 days. Never writes state.json, routing-table.json, or the ledger — A2 floor + autoApply gates still govern whether any proposal is later written into the table.

### verify
Read-only. Reads `queen/ledger.jsonl` + `queen/state.json` + `routing-table.json` and checks three falsifiable claims, printing `[PASS]`/`[FAIL]` per check: (a) `tickHistory` timestamps are monotonically non-decreasing; (b) artifact paths referenced in the ledger's `visuals` arrays actually exist on disk (honestly reports when they don't — this is the check that catches a fictional visuals counter); (c) `routing-table.json`'s `lastDerivedFrom` has no duplicate entries. Never writes anything.

### ratify [--class=...]
A1/A2 gates + drift + substrate split (low-stakes operational auto if eligible; irreversible/substrate = safe + board/Frank ack). 

### ledger [--append]
Append (doctrine ledger + queen/ledger.jsonl + operational-vault). **v0.2: always includes a visual-prompt ref + velocity snapshot.** `lastDerivedFrom` writes are deduped and capped at the 10 most recent entries.

### tick [--full]
**The v0.2 automation entrypoint.** Runs the full closed loop (ROUTE→MEASURE parallel recipes→LEARN synth, now data-derived→RATIFY gates→LEDGER visual-prompt+text+velocity+vault). Prints exact subagent dispatches + an image_gen PROMPT for the harness to render (rendering — actual image generation — is a separate step the harness performs; this driver only emits the prompt text and increments a "visual prompts emitted" counter). Safe patches only, `lastDerivedFrom` deduped+capped. Emits SIP. Use for Queen self-advancement cycles. --full adds richer lanes. Alias: queen-tick. Run `verify` afterward to check whether any rendered artifact was actually recorded on disk.

## Grok harness execution (v0.2 parallelism + visual + composer win)
- tick (or /starlight-queen tick) prints the exact parallel subagent dispatch recipes (explore for MEASURE lanes incl. model+visual-eval, plan for LEARN synthesis, check-work for RATIFY gates + falsifier scan).
- Harness executes: spawn_subagent (or parallel calls) + run_terminal per lane entrypoint + gstack + excellence-review + repo-mastery.
- Visual: the driver emits an image_gen prompt (routing heatmap / tick card / palace) every tick — that emission is mandatory. Rendering it into an actual image via image_gen (Imagine) is a separate step the harness performs; if rendered, ref resultPath in LEDGER/vault so `queen verify` can confirm it on disk.
- Composer: for agentic-composer-long / visual / parallel classes inside the tick itself (sustained agentic + native visuals).
- Session + state: Memory Gateway (grok-tui-* ns + SessionStore) + tools/queen/state.json (velocity + history).
- Full tick = status + route/classify + MEASURE parallel + LEARN + RATIFY + LEDGER (visual + vault + table safe patch if gates + SIP).

## Bindings (inherited, non-waivable; v0.2 extended)
- A1/A2/A3 as in v0.2 ROUTING-DOCTRINE.md (low-stakes auto only on rounds>=2 + !irreversible; substrate split; falsifiers defined for velocity/visual/A breaches).
- Visual Eval mandatory on model receipts + every tick LEDGER (a visual PROMPT, specifically — `queen verify` is the falsifier for whether rendering actually happened).
- Cadence, token opt, anti-Goodhart unchanged (velocity metrics are descriptive snapshots only).
- Excellence + SIP ambient.

## Composes (v0.2)
- /starlight-eval + Evaluator (model lane now carries Visual Eval req).
- `tools/proving-ground/ROUTING-DOCTRINE.md` (v0.2) + `routing-table.json` (advancement).
- `tools/queen/driver.mjs` (tick implements the loop).
- agents/starlight-orchestrator.md (Queen role), starlight-evaluator.md.
- Memory Gateway, Cost Plane, core/ROUTING_MATRIX.
- Grok harnesses/grok/ (composer preference + queen bindings), image_gen, subagents, gstack, excellence.
- /starlight-board for any substrate implication.

## Test / Drive immediately (v0.2)
1. Hygiene: git branch --show-current && git status (one agent = one branch).
2. status + route: `node tools/queen/driver.mjs status`; `node tools/queen/driver.mjs route "implement queen tick visual ledger"`.
3. measure + learn (read-only, safe on real data): `node tools/queen/driver.mjs measure`; `node tools/queen/driver.mjs learn`. Observe real per-scorecard metric tables + deltas, and data-derived proposals with cited evidence numbers.
4. Full tick (core): `node tools/queen/driver.mjs tick` (or `--full`). Observe: parallel MEASURE recipes (dispatch these with your spawn_subagent), a visual PROMPT emitted (run image_gen yourself if you want it actually rendered, and capture the path), LEARN proposals, RATIFY decision (safe patch or proposal), LEDGER (jsonl + vault append with velocity + visual-prompt ref) + SIP.
5. Verify the claims: `node tools/queen/driver.mjs verify` — prints PASS/FAIL for tick-history monotonicity, whether any referenced visual artifact actually exists on disk, and `lastDerivedFrom` dedup.
6. Check velocity: cat tools/queen/state.json (tickHistory, visualsProduced — counts prompts emitted, not confirmed renders); grep falsifier in ROUTING-DOCTRINE.md.
7. Cross: read core/orchestrator/harnesses/grok/README.md + system-prompt.md (composer formalization); HARNESS.md Grok §; /starlight (si) for visual dispatch.
8. Persist (if low-stakes ratified): driver already did light table/backup + vault (deduped+capped lastDerivedFrom); manual search_replace only for higher if ack'd.
9. Substrate note: table bumps here were operational (perf/cost); any SIP/agents core edit would have invoked board pre.

All surgical, existing tools, receipts real. No new infra.

**Built on SIP** — Starlight Intelligence Protocol. Operational (Queen loop driver + harness integration). Table/doctrine governance: respect A-gates + board pre for substrate-class.

**Runtime:** `node tools/queen/driver.mjs tick [--full]` (also status/route/...). "queen" script in package.json. See driver header for full.

See: agents/starlight-orchestrator.md
- Visual Motion Experience: site/queen-vision.html (scroll-driven, central Queen + live swarms canvas, 5 premium Grok-generated artifacts embedded) (v0.2 Queen) — now the canonical deliverable of the new `vision/queen-swarms-visual` skill. site/src/app/queen/page.tsx is the live public demo surface with "Activate Queen Visual Skill" CTA. docs/queen-motion/ (standalone + docs). tools/proving-ground/* (lanes/SPEC/ROUTING-DOCTRINE v0.2/routing-table), core/orchestrator/harnesses/grok/*, HARNESS.md, commands/starlight.md (dispatch), docs/boards/2026-06-10-*.md. The skill (skills/vision/queen-swarms-visual.md) owns config-driven variant generation for ledger artifacts, vertical swarms, and Visionary brand motion.
