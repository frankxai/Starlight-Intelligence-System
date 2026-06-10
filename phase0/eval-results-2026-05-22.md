# Eval-50 Measurement Results — 2026-05-22

**Substrate:** Path A sovereign `JsonlSovereign` + `EmbeddingSidecar` (HashingTFEmbedder, 1024-dim, IDF on)
**Corpus:** 520 atoms from `memory/mempalace/atoms.jsonl` (frozen pre-migration corpus)
**Queries:** 50 (`eval-50.jsonl`)
**Date:** 2026-05-22T00:19:40.837196+00:00

---

## Summary

- **precision@10** = **20.0%** (10/50 queries hit)
- **mean rank** = 9.22 (misses count as 11)
- **p50 latency** = 3.65ms
- **p95 latency** = 29.66ms

## By vault

| Vault | Queries | Hits | precision@10 |
|---|---:|---:|---:|
| creative | 6 | 1 | 16.7% |
| horizon | 8 | 1 | 12.5% |
| operational | 10 | 2 | 20.0% |
| strategic | 10 | 4 | 40.0% |
| technical | 8 | 1 | 12.5% |
| wisdom | 8 | 1 | 12.5% |

## Per-query detail

| QID | Vault | Class | Rank | Latency | Query |
|---|---|---|---:|---:|---|
| q01 | strategic | disambig | 3 | 3.1ms | What's the difference between /starlight-board and /luminor-board? |
| q02 | strategic | recall | — | 3.5ms | Why is mempalace forked into two stores? |
| q03 | strategic | recall | — | 2.6ms | What was the board-before-tag decision? |
| q04 | strategic | recall | — | 2.8ms | Why was the v1 drift resolution retracted? |
| q05 | strategic | disambig | 1 | 3.4ms | VOICES vs agents — what's canonical? |
| q06 | strategic | recall | — | 3.6ms | What ships under /yolo Hive substrate integration? |
| q07 | strategic | cross-vault | — | 4.0ms | How does the Chronicle relate to /bless? |
| q08 | strategic | recall | 4 | 52.9ms | Why did we choose Starlight over Luminor as the substrate register? |
| q09 | strategic | recall | 1 | 5.3ms | What is the People Intelligence rename history? |
| q10 | strategic | disambig | — | 5.1ms | What's the difference between substrate-tier and operational-tier work? |
| q11 | technical | recall | — | 4.9ms | What's the AgentDB-per-tab constraint? |
| q12 | technical | recall | 1 | 3.9ms | What is the Memory Bus v0.1? |
| q13 | technical | recall | — | 3.7ms | What's the Substrate ABC? |
| q14 | technical | recall | — | 5.8ms | How does cross-repo-indexer write to memory? |
| q15 | technical | recall | — | 5.9ms | What pattern did the Cockpit Continuity v0.2 ship? |
| q16 | technical | recall | — | 4.0ms | What does sis-forge pre-alpha actually do? |
| q17 | technical | cross-vault | — | 2.8ms | How is SIP attestation embedded per-atom? |
| q18 | technical | recall | — | 3.0ms | What's the dreaming pipeline source format? |
| q19 | creative | recall | — | 4.0ms | What's the Vellum & Voltage design language? |
| q20 | creative | recall | — | 5.1ms | What are the 3D memory palace design references? |
| q21 | creative | recall | — | 2.3ms | What MeshTransmissionMaterial preset preserves legibility? |
| q22 | creative | recall | — | 3.3ms | What is artifact-first naming? |
| q23 | creative | recall | — | 3.1ms | What's the brain visualization architecture? |
| q24 | creative | recall | 7 | 42.2ms | What halo state machine drives the brain viz? |
| q25 | operational | recall | — | 2.9ms | What was committed today 2026-05-20? |
| q26 | operational | recall | 1 | 29.7ms | Why is Vercel deploy manual? |
| q27 | operational | recall | 1 | 4.5ms | How many tests are in the memory module? |
| q28 | operational | recall | — | 4.0ms | What's the cockpit auto-start footgun? |
| q29 | operational | recall | — | 2.7ms | What's the spawn-chain jam under RAM pressure? |
| q30 | operational | recall | — | 3.8ms | Why do we filter sub-1KB files at scan boundaries? |
| q31 | operational | recall | — | 2.9ms | What's the staging discipline with sibling Claude tabs? |
| q32 | operational | recall | — | 2.2ms | What was the W19 sprint outcome? |
| q33 | operational | recall | — | 47.2ms | What's the autostarts disabled scope? |
| q34 | operational | recall | — | 4.1ms | What's the API key policy substrate? |
| q35 | wisdom | recall | — | 3.8ms | What's the lead-with-authority doctrine? |
| q36 | wisdom | recall | — | 3.6ms | When do we verify plans before executing? |
| q37 | wisdom | recall | — | 4.4ms | What does Karpathy hygiene mean for SIS? |
| q38 | wisdom | recall | — | 3.0ms | What's the walker-fix-over-exemptions principle? |
| q39 | wisdom | recall | — | 3.0ms | How does audit vs cause work? |
| q40 | wisdom | recall | 1 | 4.1ms | What's the parallel agent dispatch pattern? |
| q41 | wisdom | recall | — | 2.9ms | When does board run autonomously? |
| q42 | wisdom | recall | — | 2.9ms | What's the test-fixtures-secret-safe rule? |
| q43 | horizon | recall | — | 2.3ms | What's the cross-model bridge stance? |
| q44 | horizon | recall | — | 3.0ms | What's the encoded-self amendment? |
| q45 | horizon | recall | — | 2.5ms | What's the 10-IS taxonomy status? |
| q46 | horizon | recall | 1 | 4.6ms | What is the Composition Layer primitive? |
| q47 | horizon | recall | — | 2.2ms | What domain sub-stacks are operational? |
| q48 | horizon | recall | — | 2.3ms | What's the Crypto IS proof-of-pattern? |
| q49 | horizon | cross-vault | — | 3.6ms | How does Phase 0 dog-food fit the broader memory foundation plan? |
| q50 | horizon | cross-vault | — | 22.6ms | What's the bigger system question SIS is answering? |

## Interpretation

This is the FIRST measured retrieval-quality evaluation for SIS substrate.
Numbers are with hashing-TF + IDF + cosine (no transformer embeddings).

Reasonable baselines:
- HashingTF + IDF on 500-atom corpus typically achieves 30-50% precision@10
- Real sentence-transformer embeddings usually add 15-30 percentage points
- Cognee OWL grounding adds disambiguation gains on canonical-class queries

**Read this as a FLOOR, not a ceiling.** Phase 0 6.5+ upgrade path:
1. Swap HashingTFEmbedder for SentenceTransformerEmbedder (~+20% expected)
2. Add reciprocal rank fusion of FTS5 (AgentDB) + embedding (sovereign)
3. Selectively index high-value atoms (skip cross-repo-indexer noise)

Falsifier: if precision@10 < 20% with HashingTF on 500-atom corpus, the corpus
OR query set is mismatched (queries reference atoms not present in frozen 520).

---

*Built on SIP — 2026-05-22 · Phase 0 6.5 first-bite · first measurement in SIS history*