# Handover — frankx.ai Model Arena mirror

> Built on SIP. From: SIS session 2026-06-09 (Fable 5 arrival). To: any FrankX-context session in `C:/Users/frank/frankx-prod-sync` (the Vercel-linked prod repo — NOT frankx.ai-vercel-website).

## What already shipped (source of truth)

- **Live:** https://starlightintelligence.org/research/model-arena (alias → `/research/model-arena-2026-06`)
- **Receipts:** `Starlight-Intelligence-System/tools/arena/runs/2026-06-09-fable5-vs-opus48.json`
- **Methodology + eval-stack doctrine:** `Starlight-Intelligence-System/tools/arena/README.md`
- **Model ops doctrine:** `Starlight-Intelligence-System/docs/models/MODEL-OPERATIONS.md`

## Task on frankx.ai

Add a **Model Arena** surface to the Research Intelligence Hub as the canonical model-comparison anchor:

1. New research domain entry in `lib/research/domains` (slug `model-arena`), filed in the Models/Tools group. TLDR: living head-to-head LLM evals run natively in Claude Code; Round 1 Fable 5 vs Opus 4.8 — correctness parity, Fable 5 edge = instruction compliance.
2. Sources entry pointing at the SIS receipt JSON + harness README (GitHub URLs above) — satisfies the hub's "minimum 2 independent references" framing with primary receipts.
3. Cross-links: footer "LLM Hub" entry + any "Best AI X 2026" comparison posts should link `/research/model-arena` as their evidence anchor (site review 2026-06-09 flagged LLM Hub / Research / Intelligence Dispatches all claiming model-analysis territory with no canonical surface — this resolves it).
4. Body must carry: methodology summary, Round 1 table, the three caveats (n=1 directional; Claude-family judge bias; harness-inclusive timings), link back to SIS as source of truth. Register split: frankx.ai = distribution, SIS = methodology/receipts.

## Round 1 results (for the table)

| Task | Fable 5 | Opus 4.8 | Verdict |
|---|---|---|---|
| Logic grid (reasoning + output discipline) | correct, judge 9/10 | correct, leaked deliberation, judge 6/10 | Fable 5 |
| next_same_popcount w/ asserts | PASS, 1 attempt | PASS, 1 attempt | tie |
| Repo-grounded facts (CLAUDE.md) | 3/3 | 3/3 | tie |
| Voice intro 100–130 words | 8/10, 128 words ✓ | 9/10, 148 words ✗ | split (style: Opus / compliance: Fable) |

## Also queued from the 2026-06-09 site review (separate, SIS site)

- Homepage hero stats stale: says "9 intelligence layers, 35 agents" — repo is 10-IS / 47 agents / 71 skills.
- `/protocol` renders SIP v1.0.0 body under v1.1.1 header ("Generated 2026-04-22") — v1.1.1 encoded-self amendment missing from live spec.
- `/research` missing from primary nav on starlightintelligence.org.
- frankx.ai `/partnerships/google` has zero dates — add last-updated stamp.

Built on SIP — Starlight Intelligence Protocol.
