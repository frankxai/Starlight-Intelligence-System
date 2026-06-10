# The Starlight Queen — Routing Doctrine

> Built on SIP. How the Orchestrator (the Queen) routes every task, measures the
> outcome, and rewrites her own routing table from receipts. The closed loop that
> makes the whole system get cheaper and sharper over time. Board verdict:
> `docs/boards/2026-06-10-starlight-queen-verdict.md` (PROCEED-WITH-REVISE).

## The loop

```
ROUTE → MEASURE → LEARN → RATIFY → LEDGER → (route again, better)
```

1. **ROUTE** — the Queen reads `routing-table.json` and dispatches each task to the
   right model-tier + agent by **task-class**, not by guesswork. (`agents/starlight-orchestrator.md`)
2. **MEASURE** — outcomes feed two surfaces already running:
   - capability → the Proving Ground scorecard (`/starlight-eval`)
   - tokens / $ → the Cost Plane (`src/infra/cost-snapshot.ts`, daily snapshot)
3. **LEARN** — re-derive the routing table from the latest receipts. The core rule:
   **when a task-class is capability-saturated across tiers, route to the cheapest
   passing tier.** (R3 proved coding + grounding saturated → route to Haiku.)
4. **RATIFY** — see Autonomy below. Low-stakes table changes auto-apply; high-stakes
   never do.
5. **LEDGER** — append the change, dated + evidenced + reversible, to the Ledger below.

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

## Sample floor + provenance (A2 — binding)

- A routing rule **hardens** (confidence `high`, autoApply on) only after **≥2
  concordant rounds**. A single n=1 round sets confidence `medium` at most and keeps a
  fallback ("escalate on assert-fail").
- The table carries `lastDerivedFrom`, and each class carries `rounds`, `confidence`,
  and `evidence`. No rule exists without a receipt behind it.

## Cadence — "continuous" defined

- **Per substrate-tag** — `/starlight-eval` runs as part of board-before-tag; the
  routing table is re-derived if any class moved.
- **Monthly** — full system scorecard (the `StarlightProvingGround` scheduled task).
- **Weekly lightweight tick** — a single arena round on the cheapest-tier candidate
  for one task-class, to catch capability drift between full runs (proposed; wire as a
  scheduled task once R4 lands).

## Improvement Ledger (A3 — binding)

Every routing change is appended here: date · class · old→new · evidence · reversible.

| Date | Class | Change | Evidence | Reversible |
|---|---|---|---|---|
| 2026-06-10 | constrained-output | (none→) route=fable, confidence=high | R1+R2+R3 concordant output-discipline | revert: drop class |
| 2026-06-10 | codegen | (none→) route=haiku, confidence=medium | R3 saturation; Haiku=Opus on coding | revert: route=fable |
| 2026-06-10 | grounding-extraction | (none→) route=haiku, confidence=medium | R3 saturation; none fabricated | revert: route=fable |
| 2026-06-10 | deep-reasoning | (none→) route=opus, confidence=low, autoApply=false | doctrine only — UNMEASURED, awaiting R4 | n/a (not auto) |

## What else to consider (the roadmap)

These are the gaps the Queen's loop should close next, in priority order:

1. **R4 deep-reasoning lane** — the one task-class routed on doctrine, not evidence.
   Until measured, "Opus for reasoning" is a guess. Highest priority.
2. **Cross-family judge + cross-family routing** — add GPT-5 (OpenRouter) as both a
   bias-free judge and a cost-arbitrage routing target.
3. **Memory precision@10 = 0.20** — the system's weakest number (system scorecard).
   Fire real embeddings (PARKED-007) and re-measure; the Queen can't route around a
   weak memory substrate.
4. **Per-task cost telemetry → routing** — wire Cost Plane per-task-class spend back
   into the table so routing optimizes measured $/task, not just capability.
5. **Drift detection** — the weekly tick; catch a tier regressing before it costs you.
6. **Eval-set growth** — the datasets lane is honest that n is small; grow labeled
   sets so rules harden on statistics, not direction.
7. **Observability (Langfuse, phase 2)** — only once an app serves real users; trace
   production routing decisions end-to-end.

Built on SIP — Starlight Intelligence Protocol.
