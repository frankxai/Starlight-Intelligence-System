---
name: starlight-queen
description: Queen Self-Advancement & Harness Integration (v0.2 closed self-improving multi-harness loop). Primary surface for /starlight-queen, /sq (alias), /so (queen posture). Full tick: ROUTE→MEASURE(parallel subagent)→LEARN(synth+patches)→RATIFY(A-gates)→LEDGER(visual mandatory + velocity). Composes /starlight-eval (model lane now with Visual Eval), proving-ground/*, queen/driver, Memory Gateway, image_gen.
usage: /starlight-queen [status|route|measure|learn|ratify|ledger|tick] [--class=...] [--lane=...] [--full] | /sq [same] | /so [queen|status|tick]
---
# /starlight-queen (/sq /so) — v0.2 Queen

Continuous routing + eval overseer. **v0.2:** the closed, self-improving, multi-harness loop with explicit subagent dispatch, Visual Eval on every model receipt, Composer preference for long-agentic/visual, advancement velocity metrics + falsifiers (anti-Goodhart), A1/A2/A3 gates. Every tick produces >=1 visual artifact (image_gen) + ledger text + vault entry + velocity snapshot.

**Executable automation:** `node tools/queen/driver.mjs tick [--full]` (or `npm run queen -- tick`). Under Grok: prints native spawn_subagent recipes for parallel MEASURE/LEARN; image_gen prompt for visual; safe table patches only when gates pass.

**Status:** v0.2 doctrine (tools/proving-ground/ROUTING-DOCTRINE.md) + driver + lanes/SPEC updates make the loop concrete and falsifiable. (Prior v0.1 was honest manual.) SIP on all.

## Subcommands (v0.2)

### status
Show current Queen state (table v0.2 + advancement block, killSwitch, Grok-highlighted classes, recent receipts/velocity from state, last tick, visualsProduced, ledger tail).

### route <desc>
Classify + consult routing-table + doctrine v0.2. Return target + evidence + gates status. Now recognizes composer/agentic/visual/parallel/memory-consolidation classes.

### measure [--lane=...]
Compose Proving Ground (model lane now enforces Visual Eval per lanes.json/SPEC: receipt must ref image artifact) + Cost + gstack. Grok: parallel subagent dispatch (explore per lane) + excellence.

### learn
Synthesize receipts → deltas for table + doctrine patches. A2 applied; velocity calc (receipt ts → proposal). Grok: best-of-n/check-work subagents.

### ratify [--class=...]
A1/A2 gates + drift + substrate split (low-stakes operational auto if eligible; irreversible/substrate = safe + board/Frank ack). 

### ledger [--append]
Append (doctrine ledger + queen/ledger.jsonl + operational-vault). **v0.2: always includes visual ref + velocity snapshot.**

### tick [--full]
**The v0.2 automation entrypoint.** Runs the full closed loop (ROUTE→MEASURE parallel recipes→LEARN synth→RATIFY gates→LEDGER visual+text+velocity+vault). Prints exact subagent dispatches + image_gen prompt for harness to execute in parallel. Safe patches only. Emits SIP. Use for Queen self-advancement cycles. --full adds richer lanes. Alias: queen-tick.

## Grok harness execution (v0.2 parallelism + visual + composer win)
- tick (or /starlight-queen tick) prints the exact parallel subagent dispatch recipes (explore for MEASURE lanes incl. model+visual-eval, plan for LEARN synthesis, check-work for RATIFY gates + falsifier scan).
- Harness executes: spawn_subagent (or parallel calls) + run_terminal per lane entrypoint + gstack + excellence-review + repo-mastery.
- Visual: image_gen (Imagine) using the emitted prompt (routing heatmap / tick card / palace); ref resultPath in LEDGER/vault. Mandatory per tick.
- Composer: for agentic-composer-long / visual / parallel classes inside the tick itself (sustained agentic + native visuals).
- Session + state: Memory Gateway (grok-tui-* ns + SessionStore) + tools/queen/state.json (velocity + history).
- Full tick = status + route/classify + MEASURE parallel + LEARN + RATIFY + LEDGER (visual + vault + table safe patch if gates + SIP).

## Bindings (inherited, non-waivable; v0.2 extended)
- A1/A2/A3 as in v0.2 ROUTING-DOCTRINE.md (low-stakes auto only on rounds>=2 + !irreversible; substrate split; falsifiers defined for velocity/visual/A breaches).
- Visual Eval mandatory on model receipts + every tick LEDGER.
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
3. Full tick (core): `node tools/queen/driver.mjs tick` (or `--full`). Observe: parallel MEASURE recipes (dispatch these with your spawn_subagent), visual prompt (run image_gen now, capture path), LEARN proposals, RATIFY decision (safe patch or proposal), LEDGER (jsonl + vault append with velocity + visual ref) + SIP.
4. Verify Visual Eval: read latest arena receipt (composer25 exemplar) + lanes.json model entry + SPEC scorecard note.
5. Check velocity/falsifiers: cat tools/queen/state.json (tickHistory, visualsProduced); grep falsifier in ROUTING-DOCTRINE.md.
6. Cross: read core/orchestrator/harnesses/grok/README.md + system-prompt.md (composer formalization); HARNESS.md Grok §; /starlight (si) for visual dispatch.
7. Persist (if low-stakes ratified): driver already did light table/backup + vault; manual search_replace only for higher if ack'd.
8. Substrate note: table bumps here were operational (perf/cost); any SIP/agents core edit would have invoked board pre.

All surgical, existing tools, receipts real. No new infra.

**Built on SIP** — Starlight Intelligence Protocol. Operational (Queen loop driver + harness integration). Table/doctrine governance: respect A-gates + board pre for substrate-class.

**Runtime:** `node tools/queen/driver.mjs tick [--full]` (also status/route/...). "queen" script in package.json. See driver header for full.

See: agents/starlight-orchestrator.md
- Visual Motion Experience: site/queen-vision.html (scroll-driven, central Queen + live swarms canvas, 5 premium Grok-generated artifacts embedded) (v0.2 Queen) — now the canonical deliverable of the new `vision/queen-swarms-visual` skill. site/src/app/queen/page.tsx is the live public demo surface with "Activate Queen Visual Skill" CTA. docs/queen-motion/ (standalone + docs). tools/proving-ground/* (lanes/SPEC/ROUTING-DOCTRINE v0.2/routing-table), core/orchestrator/harnesses/grok/*, HARNESS.md, commands/starlight.md (dispatch), docs/boards/2026-06-10-*.md. The skill (skills/vision/queen-swarms-visual.md) owns config-driven variant generation for ledger artifacts, vertical swarms, and Visionary brand motion.
