# Eval-50 Head-to-Head — Sovereign vs ChromaDB

**Date:** 2026-05-23T19:33:18.123286+00:00
**Corpus:** 168 atoms (live ChromaDB at `memory/mempalace_upstream/`)
**Queries:** 50 from `eval-50.jsonl`
**Trigger:** Starlight Board REVISE 2026-05-23 — head-to-head before toml flip

---

## Summary — the REVISE answer

| Metric | Sovereign (Path A) | ChromaDB (incumbent) | Δ (sov − chroma) |
|---|---:|---:|---:|
| recall@5 | 36.0% (18/50) | 44.0% (22/50) | -8.0pp |
| recall@10 | 42.0% (21/50) | 48.0% (24/50) | -6.0pp |
| mean rank | 7.38 | 6.74 | +0.64 |
| p50 latency | 0.77ms | 48.00ms | — |
| p95 latency | 1.32ms | 66.64ms | — |

## Verdict against the Board REVISE gate

**Board criterion:** sovereign recall@5 within 10pp of ChromaDB → flip authorized
**Measured:** Δ recall@5 = -8.0pp, Δ recall@10 = -6.0pp
**Within 10pp window?** YES

- **Flip AUTHORIZED by Board REVISE criterion.**
- ChromaDB wins both recall metrics.

## Per-query detail

| QID | Vault | Sov rank | Chroma rank | Sov ms | Chroma ms |
|---|---|---:|---:|---:|---:|
| q01 | strategic | — | — | 0.4 | 458.1 |
| q02 | strategic | 1 | 1 | 0.6 | 50.4 |
| q03 | strategic | — | — | 0.6 | 46.2 |
| q04 | strategic | 1 | 5 | 0.5 | 49.6 |
| q05 | strategic | — | — | 0.7 | 67.1 |
| q06 | strategic | — | — | 1.1 | 57.6 |
| q07 | strategic | — | — | 1.1 | 50.2 |
| q08 | strategic | — | — | 1.0 | 56.1 |
| q09 | strategic | 1 | 1 | 1.3 | 62.8 |
| q10 | strategic | — | — | 1.4 | 66.6 |
| q11 | technical | — | — | 1.0 | 49.4 |
| q12 | technical | — | — | 1.1 | 49.3 |
| q13 | technical | — | — | 1.1 | 58.1 |
| q14 | technical | — | — | 1.1 | 113.6 |
| q15 | technical | 1 | 1 | 1.4 | 54.1 |
| q16 | technical | 2 | 1 | 0.4 | 36.7 |
| q17 | technical | — | — | 0.4 | 40.1 |
| q18 | technical | — | 3 | 0.5 | 43.3 |
| q19 | creative | 1 | 1 | 0.4 | 38.8 |
| q20 | creative | — | — | 0.5 | 42.0 |
| q21 | creative | — | — | 0.6 | 39.7 |
| q22 | creative | — | — | 0.6 | 43.2 |
| q23 | creative | — | — | 0.8 | 45.6 |
| q24 | creative | — | — | 0.9 | 43.8 |
| q25 | operational | 8 | 8 | 0.4 | 43.0 |
| q26 | operational | 7 | 9 | 0.9 | 39.6 |
| q27 | operational | 3 | 3 | 0.6 | 40.5 |
| q28 | operational | 1 | 1 | 0.7 | 45.4 |
| q29 | operational | 1 | 1 | 0.6 | 48.0 |
| q30 | operational | — | — | 0.8 | 43.8 |
| q31 | operational | 2 | 1 | 1.0 | 45.4 |
| q32 | operational | — | — | 0.8 | 42.6 |
| q33 | operational | 1 | 1 | 0.4 | 41.4 |
| q34 | operational | 1 | 1 | 0.8 | 43.8 |
| q35 | wisdom | — | 1 | 0.4 | 46.4 |
| q36 | wisdom | 1 | 1 | 0.8 | 47.3 |
| q37 | wisdom | — | — | 0.8 | 57.5 |
| q38 | wisdom | 10 | 1 | 1.0 | 49.7 |
| q39 | wisdom | — | — | 0.9 | 52.8 |
| q40 | wisdom | — | 4 | 0.7 | 53.7 |
| q41 | wisdom | 1 | 1 | 0.8 | 50.8 |
| q42 | wisdom | 4 | 1 | 0.9 | 48.0 |
| q43 | horizon | — | — | 0.7 | 55.7 |
| q44 | horizon | 1 | 1 | 1.1 | 61.6 |
| q45 | horizon | — | — | 0.7 | 55.2 |
| q46 | horizon | 1 | 2 | 1.7 | 49.1 |
| q47 | horizon | — | — | 0.7 | 47.0 |
| q48 | horizon | 1 | 1 | 0.8 | 50.6 |
| q49 | horizon | — | — | 0.6 | 44.5 |
| q50 | horizon | — | — | 0.5 | 42.4 |

---

*Built on SIP — 2026-05-23 · head-to-head comparison addresses Starlight Board REVISE*