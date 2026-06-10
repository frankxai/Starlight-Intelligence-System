"""
Phase 0 Step 6.5 — eval-50 runner.

Loads the live SIS atoms.jsonl (~520 frozen atoms) into a substrate,
runs every query from eval-50.jsonl, scores hit-rate by checking whether
the expected_match substring appears in any top-10 atom's text.

Output: phase0/eval-results-2026-05-22.md (full receipts)
        stdout summary (per-vault scores + overall precision@10)

This is the FIRST measured retrieval-quality evaluation for SIS substrate.

Run:
    python phase0/eval_runner.py
"""

from __future__ import annotations

import json
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from embedding_sidecar import EmbeddingSidecar, HashingTFEmbedder
from sovereign_substrate import Atom, JsonlSovereign


REPO_ROOT = Path(__file__).resolve().parent.parent
ATOMS_PATH = REPO_ROOT / "memory" / "mempalace" / "atoms.jsonl"
EVAL_PATH = REPO_ROOT / "docs" / "research" / "_factory" / "memory-foundations-phase0" / "eval-50.jsonl"
OUTPUT_PATH = REPO_ROOT / "phase0" / "eval-results-2026-05-22.md"


@dataclass
class QueryResult:
    qid: str
    vault: str
    query_class: str
    query_text: str
    expected_match: str
    found_at_rank: int | None  # None = not in top-10
    latency_ms: float
    top_atom_keys: list[str]
    top_atom_texts: list[str]


def load_corpus_into_substrate(substrate: JsonlSovereign) -> int:
    """Ingest live SIS atoms.jsonl into the substrate."""
    if not ATOMS_PATH.exists():
        raise FileNotFoundError(f"SIS corpus not found at {ATOMS_PATH}")

    count = 0
    with ATOMS_PATH.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                continue
            # Original atoms.jsonl rows have a flat shape; map into Atom
            ns_str = row.get("namespace", "")
            ns = tuple(ns_str.split("/")) if ns_str else ()
            value = {
                "text": row.get("text", ""),
                "tier": row.get("tier", "warm"),
                "source": row.get("source", ""),
                "written_at": row.get("written_at", ""),
                "redacted": row.get("redacted", False),
                "attestation": row.get("attestation", "Built on SIP — legacy"),
            }
            if not value["text"]:
                continue
            substrate.put(Atom(
                key=row.get("id", f"unknown-{count}"),
                namespace=ns,
                value=value,
            ))
            count += 1
    return count


def load_eval_queries() -> list[dict]:
    """Load the 50 eval queries."""
    if not EVAL_PATH.exists():
        raise FileNotFoundError(f"eval-50 not found at {EVAL_PATH}")
    queries = []
    with EVAL_PATH.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            queries.append(json.loads(line))
    return queries


def score_query(
    sidecar: EmbeddingSidecar, query: dict, top_k: int = 10
) -> QueryResult:
    """Run one query, score hit-rate by expected_match substring presence."""
    query_text = query["query_text"]
    expected_lower = query["expected_match"].lower()

    t0 = time.perf_counter()
    hits = sidecar.semantic_search(query_text, top_k=top_k)
    latency_ms = (time.perf_counter() - t0) * 1000.0

    # Find rank of first atom whose text contains expected_match (substring, case-insensitive)
    found_at_rank: int | None = None
    for i, (_score, atom) in enumerate(hits, start=1):
        text_lower = (atom.value.get("text", "") or "").lower()
        if expected_lower in text_lower or _loose_substring_match(text_lower, expected_lower):
            found_at_rank = i
            break

    return QueryResult(
        qid=query["id"],
        vault=query["vault"],
        query_class=query["query_class"],
        query_text=query_text,
        expected_match=query["expected_match"],
        found_at_rank=found_at_rank,
        latency_ms=latency_ms,
        top_atom_keys=[h[1].key for h in hits[:5]],
        top_atom_texts=[(h[1].value.get("text", "") or "")[:120] for h in hits[:3]],
    )


def _loose_substring_match(haystack: str, needle: str) -> bool:
    """Looser match: at least 60% of the needle's non-trivial tokens appear in haystack."""
    needle_tokens = [t for t in needle.split() if len(t) > 3]
    if len(needle_tokens) < 2:
        return False
    hits = sum(1 for t in needle_tokens if t in haystack)
    return hits >= max(1, int(len(needle_tokens) * 0.6))


def summarize(results: list[QueryResult]) -> dict[str, Any]:
    """Compute aggregate scores."""
    total = len(results)
    hits = sum(1 for r in results if r.found_at_rank is not None)
    precision_at_10 = hits / total if total else 0.0
    # Mean rank — count misses as 11
    ranks = [r.found_at_rank if r.found_at_rank is not None else 11 for r in results]
    mean_rank = sum(ranks) / len(ranks) if ranks else 0.0
    # Per-vault scores
    by_vault: dict[str, list[QueryResult]] = {}
    for r in results:
        by_vault.setdefault(r.vault, []).append(r)
    vault_scores = {}
    for vault, rs in by_vault.items():
        v_hits = sum(1 for r in rs if r.found_at_rank is not None)
        vault_scores[vault] = {
            "queries": len(rs),
            "hits": v_hits,
            "precision_at_10": v_hits / len(rs),
        }
    # Latency
    latencies = sorted(r.latency_ms for r in results)
    p50 = latencies[len(latencies) // 2] if latencies else 0
    p95_idx = max(0, int(len(latencies) * 0.95) - 1)
    p95 = latencies[p95_idx] if latencies else 0
    return {
        "total_queries": total,
        "hits": hits,
        "precision_at_10": precision_at_10,
        "mean_rank": mean_rank,
        "p50_latency_ms": p50,
        "p95_latency_ms": p95,
        "by_vault": vault_scores,
    }


def write_results_md(results: list[QueryResult], summary: dict[str, Any], corpus_size: int) -> None:
    """Write the human-readable receipt to disk."""
    lines = [
        "# Eval-50 Measurement Results — 2026-05-22",
        "",
        "**Substrate:** Path A sovereign `JsonlSovereign` + `EmbeddingSidecar` (HashingTFEmbedder, 1024-dim, IDF on)",
        f"**Corpus:** {corpus_size} atoms from `memory/mempalace/atoms.jsonl` (frozen pre-migration corpus)",
        f"**Queries:** {summary['total_queries']} (`eval-50.jsonl`)",
        f"**Date:** {datetime.now(timezone.utc).isoformat()}",
        "",
        "---",
        "",
        "## Summary",
        "",
        f"- **precision@10** = **{summary['precision_at_10']:.1%}** ({summary['hits']}/{summary['total_queries']} queries hit)",
        f"- **mean rank** = {summary['mean_rank']:.2f} (misses count as 11)",
        f"- **p50 latency** = {summary['p50_latency_ms']:.2f}ms",
        f"- **p95 latency** = {summary['p95_latency_ms']:.2f}ms",
        "",
        "## By vault",
        "",
        "| Vault | Queries | Hits | precision@10 |",
        "|---|---:|---:|---:|",
    ]
    for vault, scores in sorted(summary["by_vault"].items()):
        lines.append(
            f"| {vault} | {scores['queries']} | {scores['hits']} | "
            f"{scores['precision_at_10']:.1%} |"
        )

    lines += [
        "",
        "## Per-query detail",
        "",
        "| QID | Vault | Class | Rank | Latency | Query |",
        "|---|---|---|---:|---:|---|",
    ]
    for r in results:
        rank_str = str(r.found_at_rank) if r.found_at_rank is not None else "—"
        lines.append(
            f"| {r.qid} | {r.vault} | {r.query_class} | {rank_str} | "
            f"{r.latency_ms:.1f}ms | {r.query_text[:80]} |"
        )

    lines += [
        "",
        "## Interpretation",
        "",
        "This is the FIRST measured retrieval-quality evaluation for SIS substrate.",
        "Numbers are with hashing-TF + IDF + cosine (no transformer embeddings).",
        "",
        "Reasonable baselines:",
        "- HashingTF + IDF on 500-atom corpus typically achieves 30-50% precision@10",
        "- Real sentence-transformer embeddings usually add 15-30 percentage points",
        "- Cognee OWL grounding adds disambiguation gains on canonical-class queries",
        "",
        "**Read this as a FLOOR, not a ceiling.** Phase 0 6.5+ upgrade path:",
        "1. Swap HashingTFEmbedder for SentenceTransformerEmbedder (~+20% expected)",
        "2. Add reciprocal rank fusion of FTS5 (AgentDB) + embedding (sovereign)",
        "3. Selectively index high-value atoms (skip cross-repo-indexer noise)",
        "",
        "Falsifier: if precision@10 < 20% with HashingTF on 500-atom corpus, the corpus",
        "OR query set is mismatched (queries reference atoms not present in frozen 520).",
        "",
        "---",
        "",
        "*Built on SIP — 2026-05-22 · Phase 0 6.5 first-bite · first measurement in SIS history*",
    ]

    OUTPUT_PATH.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    import tempfile

    print("Phase 0 6.5 — eval-50 measurement against live SIS corpus")
    print("=" * 60)

    with tempfile.TemporaryDirectory() as tmp:
        substrate_path = Path(tmp) / "eval-substrate.jsonl"
        substrate = JsonlSovereign(substrate_path)

        print(f"Ingesting corpus from {ATOMS_PATH.name} ...")
        corpus_size = load_corpus_into_substrate(substrate)
        print(f"  -> {corpus_size} atoms ingested")

        print("Building embedding index ...")
        sidecar = EmbeddingSidecar(substrate)
        indexed = sidecar.reindex_from_substrate()
        print(f"  -> {indexed} atoms indexed (HashingTF dim=1024, IDF on)")

        print(f"Loading eval queries from {EVAL_PATH.name} ...")
        queries = load_eval_queries()
        print(f"  -> {len(queries)} queries loaded")

        print("Running eval ...")
        results = []
        for q in queries:
            results.append(score_query(sidecar, q, top_k=10))

        summary = summarize(results)

        print()
        print(f"  precision@10 : {summary['precision_at_10']:.1%}  ({summary['hits']}/{summary['total_queries']})")
        print(f"  mean rank    : {summary['mean_rank']:.2f}")
        print(f"  p50 latency  : {summary['p50_latency_ms']:.2f}ms")
        print(f"  p95 latency  : {summary['p95_latency_ms']:.2f}ms")
        print()
        print("  By vault:")
        for vault, scores in sorted(summary["by_vault"].items()):
            print(f"    {vault:13s} {scores['hits']}/{scores['queries']}  "
                  f"({scores['precision_at_10']:.1%})")

        write_results_md(results, summary, corpus_size)
        print()
        print(f"Wrote receipts to {OUTPUT_PATH.relative_to(REPO_ROOT)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
