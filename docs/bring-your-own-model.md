# Bring Your Own Model — embeddings & the (optional) semantic layer

> Status: **design note + roadmap.** The shipped operational layer is
> **keyword + temporal** retrieval (SQLite FTS5 with bm25 — see `src/retrieval.ts`).
> There is no embedding dependency today, by design. This page explains the
> deliberate default, what an optional semantic layer would look like, and how
> to choose an embedding model when it lands.

## Why keyword-first is the default (not a limitation)

The whole point of the operational layer is that **anyone can install it and it
just works** — zero infra, one dependency (`better-sqlite3`), JSONL as the
human-readable source of truth. For a single-person second brain that is almost
always under ~10k entries, FTS5 + bm25 is fast, exact, and dependency-light. Our
own measured baseline backs this up:

```bash
npm run eval:retrieval
# retrieval eval (n=10, corpus≈108 entries): recall@1=100% recall@3=100% recall@5=100%
```

(`test/retrieval-eval.test.ts` — a labeled recall@k harness over the shipped
`public-vault/` corpus. It runs in CI so retrieval quality can't silently
regress, and so any future semantic layer can be scored head-to-head against
this keyword baseline.)

Adding a vector database **server** (FAISS, a standalone Google/other vector
DB, etc.) would break the install-for-anyone promise: a daemon to run, a
lifecycle to manage, and a heavy native/Python dependency — all to beat a
baseline that already hits 100% recall on realistic corpora. So the bar for
adding semantics is: **it must not cost the zero-infra property.**

## The right shape for semantics here: `sqlite-vec`, not a server

When semantic recall is worth adding (large corpora, paraphrase-heavy queries,
cross-lingual recall), the architecture-preserving choice is
[`sqlite-vec`](https://github.com/asg017/sqlite-vec) (MIT) — a loadable
extension for the **same** `better-sqlite3` database the FTS5 index already
lives in. That keeps every existing invariant:

- **No server.** Vectors live in the same `.sqlite` file as the bm25 index.
- **JSONL stays the source of truth.** The vector index is a *derived,
  rebuildable artifact* — exactly like the FTS5 shadow index today
  (`RetrievalIndex.rebuildFromVaults`). Delete it, rebuild it, move machines —
  nothing is lost. (Portability is a property of keeping truth in JSONL, not in
  the index.)
- **Hybrid, not replacement.** bm25 and cosine fuse in one query; keyword stays
  the zero-dependency default and the semantic path is opt-in behind a flag.
- **Bring your own embedder.** The embedding function is pluggable — local or
  remote, your choice (see below).

This is intentionally **not yet implemented**: it adds an optional native
extension and an embedding step, and `sis_search` has been corrected to honestly
describe the current keyword-only behavior rather than overclaim "semantic." The
harness above is the on-ramp for landing it as a *measured* improvement.

## Choosing an embedding model (when the semantic layer lands)

| Option | Where it runs | Privacy | Cost | Good for |
|---|---|---|---|---|
| **Local** (e.g. a sentence-transformers / `bge-small`-class model, or an Ollama embedding model) | Your machine | Highest — text never leaves the device | Free after download; some RAM/CPU | Sovereign / offline second brains; the default we'd recommend |
| **API** (e.g. a hosted embeddings endpoint) | Vendor | Lower — query/content text is sent to the provider | Per-token | Convenience, best-in-class quality, no local compute |

Guidance, in keeping with the substrate's sovereignty ethos:

- **Prefer local.** A second brain holds your most personal context; the default
  should keep it on your device. A small local embedding model is more than
  enough at second-brain scale.
- **If you use an API, scope it.** Embed only what you choose to make
  searchable, keep your key in your own environment (BYOK), and treat the
  provider as untrusted with raw vault contents.
- **Keep dimensions consistent.** The vector index is tied to one embedder +
  dimension. Switching models means a rebuild — cheap, because JSONL is truth.

## Summary

- Today: keyword + temporal (FTS5/bm25), zero infra, measured recall in CI.
- Tomorrow (optional): `sqlite-vec` hybrid, pluggable embedder, vectors as a
  rebuildable artifact — added only when it beats the keyword baseline without
  costing the install-for-anyone property.
- Always: JSONL is the source of truth; indexes are conveniences.

**Built on SIP** · operational tier (retrieval roadmap)
