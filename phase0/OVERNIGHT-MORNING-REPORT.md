# Morning Report — Overnight Session 2026-05-22

**For Frank — read this first when you wake up.**

---

## The headline (in 30 seconds)

Six phases shipped overnight. Memory architecture went from "scaffolded with 1 running adapter" to **"3-tier model has running code at 2 tiers + first measured retrieval numbers + dreaming pipeline finally producing promotions."**

| Question Frank asked yesterday | Answer this morning |
|---|---|
| "why we need langgraph or letta what others not covering" | **You don't.** Path A sovereign (190 LOC, stdlib only) passes all 5 axioms equivalently to Path B (270 LOC + 80MB langgraph dep). Decision doc at `phase0/PATH-A-vs-PATH-B-decision.md`. |
| "how good is our memory" | **Now measurable.** First eval-50 retrieval run produced precision@10 = 20.0% on frozen corpus, p95 latency 29.66ms. Three concrete upgrade paths documented to lift to 65-75%. |
| "stuff working?" | **Yes — 19 of 19 smoke tests across 3 substrates pass.** Plus 90/90 substrate symmetry held. |

## What's in `phase0/` this morning

Five new runnable Python files. Two of three memory tiers now have working code. Embedding sidecar wired. Eval-50 measurement live.

```
phase0/sovereign_substrate.py      ← Path A canonical (no LangGraph dep)
phase0/sovereign_smoke.py           6/6 PASS
phase0/agentdb_substrate.py        ← Tier 1 per-agent (SQLite + FTS5)
phase0/agentdb_smoke.py             7/7 PASS
phase0/embedding_sidecar.py        ← Hashing-TF + IDF + cosine
phase0/embedding_smoke.py           6/6 PASS
phase0/eval_runner.py              ← eval-50 against live corpus
phase0/eval-results-2026-05-22.md   precision@10 = 20.0%
phase0/PATH-A-vs-PATH-B-decision.md ← Contrarian wins
phase0/OVERNIGHT-MORNING-REPORT.md  ← This file
```

## Dreaming pipeline went from 0 to compounding

Receipt timeline:

```
2026-05-07 → 2026-05-17  (9 nights):  insights: 0,   promotions: 0
2026-05-20 17:43Z   Fix A:             insights: 43,  promotions: 0
2026-05-21 09:06Z   Fix B:             insights: 46,  promotions: 0
2026-05-22 00:26Z   Fix C+calibration: insights: 46,  promotions: 6  ← first non-zero
```

Audit-day summaries also now route to operational vault (was creative — wrong).

## Three open decisions that need your input

### 1. Substrate touch — Path A goes live in `substrates.toml`?

Full `/starlight-board` dispatch (not self-Board) ratifies this. Recommendation: schedule for this week. Estimated ~1h once dispatched.

### 2. Retrieval upgrade priority

Three options to lift precision@10 from 20% baseline:
- **Corpus expansion** (~50 LOC, ~1h) — index memory/vaults + auto-memory + chronicle. Easiest +15pp expected.
- **Sentence-transformers** (~30 LOC + ~500MB dep, ~1h) — real semantic embeddings. +15-30pp expected.
- **FTS5 + embedding fusion** (~80 LOC, ~2h) — reciprocal rank fusion across AgentDB + sovereign. +5-10pp expected.

All three can compose. Recommend corpus expansion first (no new dep), then sentence-transformers.

### 3. Letta evaluation — drop?

The 3-substrate set (Path A + Path B + AgentDB) covers the design space. Letta MemFS is markdown-per-atom which adds nothing beyond what sovereign + sidecar give us. Saves ~4-6h of Docker + Letta install + adapter build.

## Sibling Claude was active

The Harness Excellence Pass continued — `DELIVERY.md`, `ONBOARDING.md`, `context/STATE.md`, site routes, console, harness scripts, etc. were touched (still uncommitted in working tree). They also touched `phase0/CHARTER.md` + `phase0/README.md` to acknowledge my 6.1 verification — clean integration.

I did NOT touch any of their files. Stage-by-filename discipline held.

## Test status

- 90/90 substrate symmetry tests PASS (post Fix C in src/dreaming.ts + src/contradiction.ts)
- 19/19 phase0 smoke tests PASS (6 + 7 + 6 across 3 substrate variants)
- 5/5 Fix B unit tests PASS (from earlier)

## What's next-bounded

| Move | Cost | Unblocks |
|---|---|---|
| Stage + commit overnight phase0 work | 15 min | Push to GitHub |
| Full `/starlight-board` on substrate touch | 1-2h | Move Path A into `substrates.toml` primary |
| Corpus expansion in eval_runner | 1-2h | Real precision@10 lift |
| Sentence-transformers swap | 1-2h | Semantic embedding upgrade |
| FTS5 + embedding RRF | 2-3h | Best-of-both retrieval |

## Honest open items still on the table

- **Contradictions still 0** — by design (requires POS/NEG opposition AND >=0.6 sim). Not a bug.
- **Sibling Harness Excellence Pass uncommitted** — their work, their decision when to ship.
- **Site auto-deploy broken** since 2026-04-10 (per memory) — manual `vercel --prod` works.
- **Voice-operator paused** since 2026-04-30 (per memory) — Fix A bridges the gap via audit log.

---

*Built on SIP — 2026-05-22 · overnight session sealed · all phase receipts archived under phase0/*
