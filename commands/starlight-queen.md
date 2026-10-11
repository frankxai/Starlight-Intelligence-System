---
name: starlight-queen
description: Queen routing, governance, and receipt-driven improvement controller. Prefer typed Foundry Task Envelopes; legacy keyword routing and tick recipe emission remain compatibility surfaces.
usage: /starlight-queen [status|route-envelope|route|measure|learn|ratify|ledger|tick] [--class=...] [--lane=...] [--full] [--visual=<existing-path>] | /sq [same] | /so [queen|status|tick]
---
# /starlight-queen (/sq /so) — v0.2 Queen

Routing + evaluation overseer. Typed Foundry envelopes are now the preferred control plane. The older v0.2 tick remains a receipt-driven planning and ledger loop with emitted harness recipes, velocity metrics, and A1/A2/A3 gates.

**Truth boundary:** `tick` does not itself dispatch external subagents, call image generation, or auto-apply a proposal. It prints recipes for a capable harness and records a local ledger entry. Only captured runtime spans and artifacts count as execution evidence.

**Status:** typed routing and Foundry compilation are executable. Live multi-harness dispatch and trace ingestion remain phase 2.

## Subcommands (v0.2)

### status
Show current Queen state (table v0.2 + advancement block, killSwitch, Grok-highlighted classes, recent receipts/velocity from state, last tick, visualsProduced, ledger tail).

### route-envelope <task-envelope.json>

Validate a Foundry Task Envelope, derive the live capability graph, resolve explicit required/preferred/forbidden capabilities, and return permission, autonomy, agent-necessity, and evidence gates.

```bash
node tools/queen/driver.mjs route-envelope foundry/examples/research-brief.task-envelope.json
```

This route is read-only by default. Add `--record` only when the routing decision should update Queen state. `--graph=<json>` pins a graph snapshot and `--out=<json>` writes the route receipt.

### route <desc>
Legacy keyword fallback. Classify + consult routing-table + doctrine v0.2. Output is labeled `legacy-keyword-fallback`; do not treat it as a cognitive routing proof.

### measure [--lane=...]
Compose Proving Ground (model lane now enforces Visual Eval per lanes.json/SPEC: receipt must ref image artifact) + Cost + gstack. Grok: parallel subagent dispatch (explore per lane) + excellence.

### learn
Synthesize receipts → deltas for table + doctrine patches. A2 applied; velocity calc (receipt ts → proposal). Grok: best-of-n/check-work subagents.

### ratify [--class=...]
A1/A2 eligibility + drift + substrate split. This local command reports eligibility but does not apply changes; irreversible/substrate work requires safe default + Board/operator approval.

### ledger [--append]
Append (doctrine ledger + queen/ledger.jsonl + operational-vault). **v0.2: always includes visual ref + velocity snapshot.**

### tick [--full] [--visual=<existing-path>]
Runs the local v0.2 planning/ledger loop (ROUTE→MEASURE recipes→LEARN synthesis→RATIFY gates→LEDGER). It prints subagent dispatch and image prompts for a capable harness. Do not claim those external steps ran unless their receipts are attached. `--full` adds richer planned lanes. Alias: queen-tick.

## Harness execution boundary
- tick (or /starlight-queen tick) prints the exact parallel subagent dispatch recipes (explore for MEASURE lanes incl. model+visual-eval, plan for LEARN synthesis, check-work for RATIFY gates + falsifier scan).
- Harness executes: spawn_subagent (or parallel calls) + run_terminal per lane entrypoint + gstack + excellence-review + repo-mastery.
- Visual: image_gen (Imagine) using the emitted prompt (routing heatmap / tick card / palace); ref resultPath in LEDGER/vault. Mandatory per tick.
- Composer: for agentic-composer-long / visual / parallel classes inside the tick itself (sustained agentic + native visuals).
- Session + state: Memory Gateway (grok-tui-* ns + SessionStore) + tools/queen/state.json (velocity + history).
- A full external cycle exists only when the harness executes the emitted work, captures real spans/artifacts, and returns them to the Proving Ground.

## Bindings (inherited, non-waivable; v0.2 extended)
- A1/A2/A3 as in v0.2 ROUTING-DOCTRINE.md. The local driver remains proposal-only; an external governed runtime may apply low-stakes work only with qualifying receipts and must split substrate implications.
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
2. Typed route: `node tools/queen/driver.mjs route-envelope foundry/examples/research-brief.task-envelope.json`.
3. Legacy compatibility check: `node tools/queen/driver.mjs route "implement queen tick visual ledger"` and confirm it is labeled fallback.
4. Full local tick only when ledger/table writes are intended: `node tools/queen/driver.mjs tick` (or `--full`). Execute printed recipes separately and attach real artifacts before promotion.
5. Verify Visual Eval: read the receipt and confirm it points to a real artifact rather than an emitted prompt.
6. Check velocity/falsifiers in `tools/queen/state.json` and `ROUTING-DOCTRINE.md`.
7. Cross-check harness bindings before external dispatch.
8. Persist only low-stakes ratified learning. Substrate implications still route through `/starlight-board`.

Receipts are real only for steps actually executed and observed.

**Built on SIP** — Starlight Intelligence Protocol. Operational (Queen loop driver + harness integration). Table/doctrine governance: respect A-gates + board pre for substrate-class.

**Runtime:** `node tools/queen/driver.mjs tick [--full]` (also status/route/...). "queen" script in package.json. See driver header for full.

See: agents/starlight-orchestrator.md
- Visual Motion Experience: site/queen-vision.html (scroll-driven, central Queen + live swarms canvas, 5 premium Grok-generated artifacts embedded) (v0.2 Queen) — now the canonical deliverable of the new `vision/queen-swarms-visual` skill. site/src/app/queen/page.tsx is the live public demo surface with "Activate Queen Visual Skill" CTA. docs/queen-motion/ (standalone + docs). tools/proving-ground/* (lanes/SPEC/ROUTING-DOCTRINE v0.2/routing-table), core/orchestrator/harnesses/grok/*, HARNESS.md, commands/starlight.md (dispatch), docs/boards/2026-06-10-*.md. The skill (skills/vision/queen-swarms-visual.md) owns config-driven variant generation for ledger artifacts, vertical swarms, and Visionary brand motion.
