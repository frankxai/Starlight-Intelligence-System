# The Starlight Queen — Routing Doctrine (v0.2)

> Built on SIP. How the Orchestrator (the Queen) routes every task, measures the
> outcome, and re-derives her routing table from receipts. Board verdict:
> `docs/boards/2026-06-10-starlight-queen-verdict.md` (PROCEED-WITH-REVISE). v0.2
> closes the loop with explicit subagent dispatch, Visual Eval dimension on the
> Proving Ground model lane, Composer formalization, advancement velocity metrics +
> falsifiers, and executable driver support (tools/queen/driver.mjs tick).

> **v0.2 status (self-advancing, still gated):** The `tools/queen/driver.mjs` + 
> `/starlight-queen` (and /sq /so dispatch) now provide concrete automation skeleton
> for the full ROUTE→MEASURE→LEARN→RATIFY→LEDGER cycle. Under Grok harness: native
> `spawn_subagent` (explore/plan/best-of-n/check-work) for true parallel MEASURE/LEARN.
> Low-stakes table patches auto-apply only when A1/A2 satisfied; substrate-class or
> irreversible always route to board/Frank-ack. Every tick produces visual artifact(s)
> via image_gen + ledger text + vault + (optional) github. Advancement velocity
> (eval-to-update delta, visuals/cycle) tracked descriptively (anti-Goodhart). Still
> no full autonomous cron (cadence manual/scheduled task pending registration); driver
> tick is the executable "queen-tick". SIP attestation ambient on all artifacts.

## The loop (v0.2 — closed, subagent-dispatched, multi-harness)

```
ROUTE → MEASURE (parallel subagent dispatch) → LEARN (synthesis + patches) → RATIFY (A1/A2 gates + drift detect) → LEDGER (text + visual + vault + github) → (route again, better)
```

**v0.2 explicit steps (executable via `node tools/queen/driver.mjs tick` or /starlight-queen tick):**

1. **ROUTE** — the Queen reads `routing-table.json` (and advancement block) + classifies the incoming request via keyword + context (driver `classify()`) to a taskClass (now including agentic-composer-long, visual-synthesis, parallel-harness-measure, memory-consolidation-queen). Returns target harness/model + confidence + autoApply + stakes + evidence. Grok: also consults current harness for native strengths.

2. **MEASURE** (parallel subagent dispatch) — For relevant lanes (model + harness + cost + new visual-eval; gstack for site/harness health):
   - Dispatch **parallel subagents** (Grok-native: `spawn_subagent` with explore/plan for concurrent; or Task() up to N). 
   - Subagent per lane: run entrypoint (arena for model, run-v01-evals for harness, Cost Plane snapshot, gstack verify), read latest receipt/scorecard, enforce Visual Eval (model lane: require visual ref in receipt or generate one via image_gen during this step), real-time web grounding.
   - Compose: Proving Ground model lane (now with Visual Eval dimension per lanes.json/SPEC), Cost Plane, gstack self-check, excellence-review gate on every sub-result.
   - Write per-lane receipt (or reuse latest). Every model receipt **must** ship visual artifact (see updated model lane + receipt exemplar with visualComposerTest).

3. **LEARN** (synthesis of receipts into table updates + doctrine patches) — 
   - Subagent(s) (best-of-n + check-work verification): read recent arena/scorecards + cost data + prior ledger.
   - Produce: delta proposals (route/confidence/rounds/autoApply changes), A2 floor check (≥2 concordant or stay suggestion), named weakness per receipt.
   - Output: proposed table patch JSON (safe subset), doctrine section diffs (e.g. extend Composer guidance), advancement velocity numbers (time from first MEASURE receipt ts → now; visuals generated this cycle; proposals accepted rate).
   - Grok: use plan subagent for synthesis, check-work for A1/A2 compliance scan.

4. **RATIFY** (gates) — 
   - A1 (binding, non-waivable): Low-stakes (codegen, interactive-agentic, visual-synthesis, parallel-harness-measure, agentic-composer-long...) → autoApply if rounds≥2 + !killSwitch. Irreversible (money-path, substrate-governance, external-side-effect) → always safeDefault (fable) + explicit Frank-ack + /starlight-board if substrate touch.
   - A2 (binding): No harden (high conf + auto) without ≥2 concordant rounds + evidence receipt. n=1 = medium + suggestion + fallback.
   - A3 (binding): All changes reversible (table backups in tools/queen/, lastDerivedFrom append only).
   - Drift detection: if auto-applied class regresses in next MEASURE, auto-revert + flag.
   - Substrate vs operational: routing table/class bumps that are pure perf/cost (low stakes) = operational (Queen/driver can patch). SIP/ALLIANCE/agents core / board command surfaces = substrate → board pre-pass before table ratify commits the implication.
   - Excellence gate conceptually applied (use excellence-review).

5. **LEDGER** (visual + text, github + vault + image_gen artifacts) — 
   - Text: append to ROUTING-DOCTRINE.md Improvement Ledger table; append JSONL to tools/queen/ledger.jsonl; append dated entry to memory/vaults/operational-vault.md .
   - Visual: **mandatory ≥1 visual per Queen tick**. Use image_gen (Grok Imagine native) for routing heatmap, arena comparison card, mempalace slice, or ledger dashboard. Reference resultPath in ledger entry + state. (Driver emits exact prompt + instructs harness to execute image_gen + capture path.)
   - Persistence: queen/state.json for velocity (lastMeasureTs, visualsProduced++, tickDurationMs, proposals); optional github issue via MCP (grok harness) for public trace.
   - SIP attestation on every ledger artifact and driver output.

The driver implements the skeleton; under Grok the subagent primitives close the "continuous" and "self-improving" claims. Full tick = one invocation that sequences the above (printing exact subagent dispatch recipes for the harness to execute in parallel where possible).

## Token / LLM optimization (the payoff)

The eval loop *is* the cost-optimization engine — they are not separate projects.

- **Route down-tier on saturation.** If every tier passes a task-class, paying for the
  expensive tier buys nothing. Coding + grounding → Haiku (R3). This is the single
  biggest lever and it is already evidenced.
- **Reserve the expensive tiers for where they win.** Fable for constrained-output /
  pipeline work (3 rounds concordant); Opus for deep reasoning (pending R4).
- **Cost ceilings are circuit-breakers.** The Cost Plane carries daily USD caps
  (Anthropic $20, Vercel $5 in the template) with WoW/MoM spike factors. Breach →
  the Queen falls back to the safe default and flags, rather than spending blind.
- **Prompt-cache discipline.** Keep stable context stable (system + repo facts up
  front) so the 5-min cache stays warm across a session — cheaper and faster.
- **Cross-family arbitrage (future).** Per global Doctrine 2, OpenRouter is the gateway
  for non-Claude tiers; a future routing-table can route a saturated class to the
  cheapest *any-family* model, not just the cheapest Claude tier.

## Autonomy boundary (A1 — binding)

| Stakes | Task-classes | Auto-apply routing? |
|---|---|---|
| **Low** | codegen, grounding-extraction, constrained-output, bulk-classification, interactive-agentic | ✅ yes — the Queen routes and re-routes freely |
| **Irreversible** | money-path, substrate-governance, external-side-effect | ❌ never — safe default (Fable) + Frank-ack; substrate also requires `/starlight-board` |

**Kill-switch:** set `killSwitch: true` in `routing-table.json` → every task routes to
the safe default and all auto-routing stops. One flag.

## Visual Eval dimension (v0.2 — binding on model lane)

The Proving Ground model lane (lanes.json id="model", entrypoint tools/arena/) now carries
an explicit "Visual Eval" axis in addition to capability/instruction/safety. 

- **Requirement:** Every model-lane receipt MUST reference or embed a visual artifact
  (image_gen / Imagine output path or "visualComposerTest"/"visualEval" object with
  promptSummary + resultPath + notes). See SPEC.md scorecard contract update + lanes.json
  verification text.
- **Purpose:** Queen LEDGER (heatmaps, cards, palace viz) and advancement velocity
  (visuals-per-tick counter). Demonstrates harness-native composition (Grok image_gen
  already used in 2026-06-12 composer receipt).
- **Enforcement:** Model lane verdict in /starlight-eval or Queen MEASURE names absence
  as weakness. Driver tick step 2 (MEASURE) + step 5 (LEDGER) both enforce/generate.
- **Anti-Goodhart:** Visual quality is not a target to game; it is descriptive evidence
  that the Queen loop is producing human-inspectable artifacts for review.

Future arena runs (R5+) include visual as a scored dimension where judgeable (prompt
adherence, text legibility, technical clarity, SIP footer presence).

## Composer formalization (v0.2)

"composer" (Composer 2.5 via Grok Build / Grok TUI agentic long-running mode) is now
**the preferred harness integration** for:

- **agentic-composer-long**: sustained multi-step coding/refactor + test + verify loops
  (10+ tool turns), terminal/CLI agent workflows, long-horizon instruction following.
- **visual-synthesis**: image_gen / Imagine compositions, routing heatmaps, arena cards,
  mempalace visuals, hyperframes for Queen LEDGER/docs.
- **parallel-harness-measure**: concurrent Queen MEASURE (gstack + arena + cost + visual)
  + LEARN synthesis where subagent parallelism + real-time + native visuals shine.

**Routing guidance (table + harnesses):** Route per live routing-table. In core/orchestrator/harnesses/grok/ (README + system-prompt) and HARNESS.md + starlight-orchestrator.md: explicitly call out Grok + Composer 2.5 (or native image_gen) as sweet-spot for these classes once evidence floor met. Cost/perf edge (external: ~1/10 vs Opus-class on agentic benches) + harness wins (subagent swarm, gstack, excellence) make it the cost-efficient choice for Queen self-advancement work itself.

**When NOT:** Irreversible per A1 (always fable + ack); pure academic ceiling tasks where specialized closed models may still lead; trivial single-shot where Haiku/Fable saturation proven (R3).

Evidence floor remains A2 (≥2 concordant). The 2026-06-12 receipt + driver v0.1 execution + visual artifacts provide round-1/2 directional; cross-harness R5 (dispatch to Claude/Gemini on identical tasks) required to harden autoApply for agentic-composer-long.

## Sample floor + provenance (A2 — binding)

- A routing rule **hardens** (confidence `high`, autoApply on) only after **≥2
  concordant rounds**. A single n=1 round sets confidence `medium` at most and keeps a
  fallback ("escalate on assert-fail").
- The table carries `lastDerivedFrom`, and each class carries `rounds`, `confidence`,
  and `evidence`. No rule exists without a receipt behind it.

## Cadence — "continuous" defined

- **Per substrate-tag** — `/starlight-eval` runs as part of board-before-tag; the
  routing table is re-derived if any class moved.
- **Monthly** — full system scorecard. ⚠ The `StarlightProvingGround` scheduled task
  is **NOT yet registered** (audit 2026-06-10) — monthly cadence is currently manual
  `/starlight-eval`. Registration script exists (`scripts/cron/proving-ground-cadence.ps1`);
  wire it via schtasks + add to Machine Sentinel to make this promise mechanically real.
- **Weekly lightweight tick** — a single arena round on the cheapest-tier candidate
  for one task-class, to catch capability drift between full runs (proposed; wire as a
  scheduled task once R4 lands).

## Advancement Velocity & Falsifiers (v0.2 — descriptive, anti-Goodhart)

To make "self-advancing" observable and falsifiable without turning metrics into targets:

**Tracked per Queen tick (driver state + ledger + routing-table.advancement):**
- Time from first MEASURE receipt timestamp → RATIFY/LEDGER apply (target example: <24h for directional; <7d for hardened rule).
- Visual artifacts produced per cycle (min 1 required; counter in state + refs in ledger).
- Proposals generated / accepted / auto-applied rate (A2 filter applied).
- Last full tick duration, lastDerivedFrom freshness.

**Example metrics (as of last tick):**
- visualsThisCycle: 1+
- velocityNote in table (see routing-table.json advancement block).

**Falsifiers (if any of these true, the "closed self-improving loop" claim is falsified until fixed):**
- A Queen tick completes with 0 visual artifact references in its LEDGER (text + image refs).
- Auto-apply is taken on a class with rounds < 2 (or on irreversible stakes).
- A substrate-governance or money-path decision is auto-routed without /starlight-board + Frank ack (A1 breach).
- Table or doctrine updated without corresponding entry in lastDerivedFrom + queen/ledger.jsonl + operational-vault + (for v0.2+) at least one visual.
- Drift not detected: a class that regressed in MEASURE remains at prior high-confidence autoApply >1 cycle without revert.
- Advancement numbers presented as targets rather than snapshots (violates anti-Goodhart R2; always "as of", "minimum historic", "tracked").

These live in doctrine + driver (state tracks raw ts deltas; ledger names them). Metrics Truth Rule applies (read metrics/current.json if public claims). Never hardcode velocity as "we improved X%" without last_verified + receipt link.

The Queen loop itself (and /starlight-eval) are **descriptive instruments**, not optimization objectives.

## Improvement Ledger (A3 — binding)

Every routing change is appended here: date · class · old→new · evidence · reversible.

| Date | Class | Change | Evidence | Reversible |
|---|---|---|---|---|
| 2026-06-10 | constrained-output | (none→) route=fable, confidence=high | R1+R2+R3 concordant output-discipline | revert: drop class |
| 2026-06-10 | codegen | (none→) route=haiku, confidence=medium | R3 saturation; Haiku=Opus on coding | revert: route=fable |
| 2026-06-10 | grounding-extraction | (none→) route=haiku, confidence=medium | R3 saturation; none fabricated | revert: route=fable |
| 2026-06-10 | deep-reasoning | (none→) route=opus, confidence=low, autoApply=false | doctrine only — UNMEASURED, awaiting R4 | n/a (not auto) |
| 2026-06-10 | codegen, grounding-extraction, bulk-classification | autoApply true→**false** | A2 correction: exec board found these auto-routing on n=1 trivial-task evidence, violating the ≥2-round floor. Now suggestion-only. | revert when 2nd round confirms |
| 2026-06-12 | agentic-composer-long, visual-synthesis, parallel-harness-measure | lastDerivedFrom += 2026-06-12-grok-composer25-model-lane; evidence strings + Grok § updated per arena + doctrine; A2: agentic+visual remain rounds=1 (autoApply=false per floor; visual corrected if drifted), parallel rounds=2 confirmed high | 2026-06-12-grok-composer25-model-lane.json (2/2 PASS, gstack/image), HARNESS.md, starlight-orchestrator.md, operational-vault 2026-06-12 entry | revert: remove row + restore lastDerivedFrom / evidence to pre-06-12; table classes unchanged |
| 2026-06-12 | Queen whole-SIS advance (visual + continuous + memory/palace/gateway) | lastDerivedFrom += Queen advance note; agentic rounds 1→2, visual 1→2, parallel 2→3 (A2 met via learn + arena + this driver tick); +2 new classes: memory-consolidation-queen (grok subagent+curate+image palace), palace-visual-recall (image_gen native); 5 image_gen visuals generated+ledgered (Queen-loop+gateway, 3D MemPalace, SIS arch, routing heatmap, advance receipt); driver classify/learn/ledger enhanced for palace/gateway/advance; /si visual status + whole-system surgical updates (vaults, HARNESS, agents, VAULT_ARCH, docs); Queen now drives visual memory compounding + gateway SessionStore as loop state | 2026-06-12 Queen driver full tick (status/route/measure memory/learn/ratify/ledger --append), 5 parallel image_gen (session images/1-5.jpg), updated routing-table.json + operational/creative/technical/strategic vaults + starlight.md + HARNESS.md + agents + VAULT_ARCHITECTURE.md + driver.mjs, arena grok receipt, memory engine v0.2 + gateway v0.1 receipts, curate-recall | revert: restore table lastDerived/classes/evidence to pre-advance; delete new classes + vault/driver entries (reversible via backups in tools/queen/) |

## What else to consider (the roadmap)

These are the gaps the Queen's loop should close next, in priority order:

1. **R4 deep-reasoning lane** — the one task-class routed on doctrine, not evidence.
   Until measured, "Opus for reasoning" is a guess. Highest priority.
2. **Cross-family judge + cross-family routing** — add GPT-5 (OpenRouter) as both a
   bias-free judge and a cost-arbitrage routing target.
3. **Memory precision@10** — PARKED-007 FIRED 2026-06-10 (receipt:
   `scorecards/2026-06-10-memory-lane-parked007.json`). model2vec real embeddings
   (numpy-only, no torch) vs hashing-TF on the same corpus/queries: recall@5 +3.5pp,
   hit@10 +6.9pp, **precision@10 unchanged (0.155)**. Finding: the lexical token-overlap
   ground-truth under-credits semantic retrieval AND single-substrate has no fusion.
   NEXT: (a) semantic/labeled ground-truth so the judge stops handicapping semantics;
   (b) hybrid lexical+semantic RRF (un-park PARKED-002) — the likely real precision lever.
   Do NOT swap the primary substrate yet (gated).
4. **Per-task cost telemetry → routing** — wire Cost Plane per-task-class spend back
   into the table so routing optimizes measured $/task, not just capability.
5. **Drift detection** — the weekly tick; catch a tier regressing before it costs you.
6. **Eval-set growth** — the datasets lane is honest that n is small; grow labeled
   sets so rules harden on statistics, not direction.
7. **Observability (Langfuse, phase 2)** — only once an app serves real users; trace
   production routing decisions end-to-end.

**Grok 4.3 harness (v0.2 update 2026-06-12+):** Grok's subagent primitives (explore for parallel MEASURE lanes on gstack+arena+cost+visual-eval, plan for LEARN doctrine/table synthesis, best-of-n + check-work for verification + A-gate scan) + gstack (live harness/site proving-ground) + native image_gen/Imagine + hyperframes make it the premier driver for the closed Queen loop. Explicitly: parallel-harness-measure, agentic-composer-long, visual-synthesis, memory-consolidation-queen classes. Register every Grok TUI session with SIS Memory Gateway (per-harness namespace + SessionStore) for unified recall across Claude/Grok/Antigravity. Add Grok receipts to arena for cross-harness derivation. Excellence-review + repo-mastery gates mandatory on every tick subagent. Route saturated low-stakes to cheapest; reserve Grok/Composer for high-leverage Queen self-advancement work and visual/parallel synthesis.

**Grok Composer 2.5 + Visual formalization (v0.2, integrates 2026-06-12 receipt + driver + lanes update):** 
- **Preferred for (per table + harness guidelines):** agentic-composer-long (sustained terminal agentic workflows, multi-step refactor+verify, long instruction discipline — Composer 2.5 via Grok Build or Grok TUI), visual-synthesis (image_gen arena cards/heatmaps/palace viz for LEDGER; every tick requires ≥1), parallel-harness-measure (concurrent Queen MEASURE/LEARN via subagent swarm + gstack + cost + new visual eval dimension).
- **Why (receipt + external):** 2026-06-12-grok-composer25-model-lane.json: 2/2 first-attempt mechanical PASS on agentic self-verifying tasks (schema roundtrip, repo-grounded guideline) + explicit visualComposerTest (clean SIP-attested technical infographic card). External grounding: Grok 4/Heavy SOTA-ish on HLE/ARC/agentic benches; Composer 2.5 near-Opus at 1/10 cost on CursorBench/TerminalBench/SWE with stamina. Harness-native: true parallelism (no Claude overrides), gstack proving, real-time, native Imagine for visuals (Quality Mode for legible tech text).
- **Integration points:** core/orchestrator/harnesses/grok/README.md + system-prompt.md (formal preference + queen tick bindings); agents/starlight-orchestrator.md; HARNESS.md; commands/starlight-queen.md; updated model lane in lanes.json + SPEC (visual mandatory on receipts).
- **When NOT (A1 + A2):** Irreversible classes (safeDefault + board/ack); substrate-governance (always /starlight-board pre); n<2 rounds (suggestion only); trivial saturated (Haiku per R3).
- **Evidence + velocity:** Receipt + driver executions + 5+ image_gen artifacts in 2026-06-12 advance. Velocity tracked (time-to-ledger, visuals/cycle) in state/advancement. Next falsifier per doctrine: true multi-harness R5 on same tasks + per-task cost wire + 2nd concordant for agentic autoApply.
- **Always:** Named weakness + external grounding + SIP in receipts; Visual Eval ref in model receipts; excellence on subagents.

**Queen driver automation (v0.2 concrete):** `node tools/queen/driver.mjs tick [--full] [--class=...]` (exposed via /starlight-queen tick, package "queen" script, /sq /so). Implements the 5-step closed loop with printed subagent recipes (for harness to parallelize), safe low-stakes patches only (A1/A2), mandatory visual prompt emission + ref capture for LEDGER, velocity calc + state update, backups, vault + jsonl + doctrine ledger appends, ambient SIP. See commands/starlight-queen.md for surface + test steps. This + Grok subagents advances the loop from "manual doctrine" (v0.1 honest note) toward self-improving.

**2026-06-12 Queen whole-SIS visual + continuous advance (prior ledgered work, v0.2 doctrine now codifies):** Executed live under parallel-harness-measure via new first-class surfaces. 5 premium visuals... (see full prior entry in Improvement Ledger for details; v0.2 now makes the closed loop + Visual Eval + Composer + velocity explicit and driver-enforced). All SIP-attested. Operational-tier.

Built on SIP — Starlight Intelligence Protocol.
