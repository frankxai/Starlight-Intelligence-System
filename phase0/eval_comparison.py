"""
Phase 0 6.5 — Sovereign vs ChromaDB head-to-head comparison runner.

Addresses Starlight Board REVISE 2026-05-23:
  "Run a 30-minute head-to-head Bencher comparison (sovereign vs ChromaDB,
   same eval-50, same 168-atom corpus) BEFORE the toml flip; if sovereign
   recall@5 within 10pp of ChromaDB → flip; if not → wire sentence-transformers
   embedding into sovereign first, then flip."

What this does:
  1. Reads the live ChromaDB at memory/mempalace_upstream/ (read-only)
  2. Bootstraps a TEMPORARY sovereign substrate seeded with the same 168 atoms
     (no write to memory/mempalace_sovereign/atoms.jsonl — production-safe)
  3. Runs every query from eval-50.jsonl against BOTH substrates
  4. Scores hit-rate by expected_match substring in top-K
  5. Writes side-by-side scorecard to phase0/eval-results-2026-05-23-comparison.md

Run (from private/voice-operator/, so service.* imports work):
  cd private/voice-operator
  python ../../phase0/eval_comparison.py
"""

from __future__ import annotations

import argparse
import json
import sys
import tempfile
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

# Bootstrap so `service.memory.*` imports work regardless of cwd
HERE = Path(__file__).resolve()
SIS_ROOT = HERE.parents[1]
VO_ROOT = SIS_ROOT / "private" / "voice-operator"
sys.path.insert(0, str(VO_ROOT))

CHROMA_ROOT = SIS_ROOT / "memory" / "mempalace_upstream"
EVAL_PATH = SIS_ROOT / "docs" / "research" / "_factory" / "memory-foundations-phase0" / "eval-50.jsonl"
OUTPUT_PATH = SIS_ROOT / "phase0" / "eval-results-2026-05-23-comparison.md"


@dataclass
class QResult:
    qid: str
    vault: str
    query_class: str
    query_text: str
    expected_match: str
    sov_rank: int | None
    sov_latency_ms: float
    sov_top_ids: list[str]
    chroma_rank: int | None
    chroma_latency_ms: float
    chroma_top_ids: list[str]


def load_chroma():
    """Open the live ChromaDB. Read-only — no commits during this run."""
    from service.memory.substrates.mempalace_upstream import MempalaceUpstreamSubstrate
    return MempalaceUpstreamSubstrate(root=CHROMA_ROOT, collection_name="starlight_atoms")


def build_temp_sovereign(chroma_substrate):
    """Build a temp sovereign substrate seeded with the same atoms as ChromaDB.

    Bypasses the real migration write — atoms land in a tempdir, no production
    state changed. This is the comparison fixture; the production migration
    is a separate gated decision.
    """
    from service.memory.substrates.sovereign import SovereignJsonlSubstrate

    tmpdir = Path(tempfile.mkdtemp(prefix="sis-sovereign-compare-"))
    sov = SovereignJsonlSubstrate(root=tmpdir, dim=1024)

    # Read all atoms from ChromaDB (use the same conversion logic the
    # real migration script uses)
    get_result = chroma_substrate._collection.get()

    def _attr_or_key(obj, name):
        v = getattr(obj, name, None)
        if v is not None:
            return v
        try:
            return obj[name]
        except (TypeError, KeyError):
            return []

    ids = _attr_or_key(get_result, "ids") or []
    docs = _attr_or_key(get_result, "documents") or []
    metas = _attr_or_key(get_result, "metadatas") or []

    for i, aid in enumerate(ids):
        meta = metas[i] if i < len(metas) and metas[i] else {}
        atom = {
            "id": aid,
            "text": docs[i] if i < len(docs) else "",
            "tier": meta.get("tier", "warm"),
            "namespace": meta.get("namespace", ""),
            "source": meta.get("source", ""),
            "written_at": meta.get("written_at", ""),
            "redacted": bool(meta.get("redacted", False)),
            "attestation": meta.get("attestation", ""),
        }
        if not atom["attestation"]:
            # Defensive: skip atoms missing attestation (shouldn't happen given
            # the migration dry-run reported 100% preservation)
            continue
        sov.commit(atom)

    # Rebuild IDF over the full corpus now that all atoms are loaded.
    # The streaming-commit path uses the current IDF at write time which
    # under-counts terms seen later. Bulk rebuild = honest corpus IDF.
    sov.rebuild_index()
    return sov, tmpdir, len(ids)


def load_queries():
    queries = []
    with EVAL_PATH.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            queries.append(json.loads(line))
    return queries


def _loose_substring_match(haystack: str, needle: str) -> bool:
    needle_tokens = [t for t in needle.split() if len(t) > 3]
    if len(needle_tokens) < 2:
        return False
    hits = sum(1 for t in needle_tokens if t in haystack)
    return hits >= max(1, int(len(needle_tokens) * 0.6))


def _rank_with_substring(recalls, expected_lower: str):
    """Return 1-indexed rank where expected_match substring appears, or None."""
    for i, recall in enumerate(recalls, start=1):
        text = (recall["atom"].get("text", "") or "").lower()
        if expected_lower in text or _loose_substring_match(text, expected_lower):
            return i
    return None


def score_query(query, sov, chroma, top_k=10):
    expected_lower = query["expected_match"].lower()

    t0 = time.perf_counter()
    sov_recalls = sov.query(query["query_text"], k=top_k, namespace=None)
    sov_latency = (time.perf_counter() - t0) * 1000.0
    sov_rank = _rank_with_substring(sov_recalls, expected_lower)

    t0 = time.perf_counter()
    chroma_recalls = chroma.query(query["query_text"], k=top_k, namespace=None)
    chroma_latency = (time.perf_counter() - t0) * 1000.0
    chroma_rank = _rank_with_substring(chroma_recalls, expected_lower)

    return QResult(
        qid=query["id"],
        vault=query["vault"],
        query_class=query["query_class"],
        query_text=query["query_text"],
        expected_match=query["expected_match"],
        sov_rank=sov_rank,
        sov_latency_ms=sov_latency,
        sov_top_ids=[r["atom"]["id"] for r in sov_recalls[:5]],
        chroma_rank=chroma_rank,
        chroma_latency_ms=chroma_latency,
        chroma_top_ids=[r["atom"]["id"] for r in chroma_recalls[:5]],
    )


def summarize_side(results, side: str):
    if side == "sov":
        ranks = [r.sov_rank for r in results]
        latencies = sorted(r.sov_latency_ms for r in results)
    else:
        ranks = [r.chroma_rank for r in results]
        latencies = sorted(r.chroma_latency_ms for r in results)

    hits_at_5 = sum(1 for r in ranks if r is not None and r <= 5)
    hits_at_10 = sum(1 for r in ranks if r is not None and r <= 10)
    mean_rank = sum((r if r is not None else 11) for r in ranks) / max(1, len(ranks))
    p50 = latencies[len(latencies) // 2] if latencies else 0
    p95_idx = max(0, int(len(latencies) * 0.95) - 1)
    p95 = latencies[p95_idx] if latencies else 0
    return {
        "recall_at_5": hits_at_5 / max(1, len(ranks)),
        "recall_at_10": hits_at_10 / max(1, len(ranks)),
        "mean_rank": mean_rank,
        "p50_latency_ms": p50,
        "p95_latency_ms": p95,
        "hits_at_5": hits_at_5,
        "hits_at_10": hits_at_10,
        "total": len(ranks),
    }


def write_comparison(results, sov_summary, chroma_summary, corpus_size: int):
    # Compute deltas
    delta_r5 = (sov_summary["recall_at_5"] - chroma_summary["recall_at_5"]) * 100
    delta_r10 = (sov_summary["recall_at_10"] - chroma_summary["recall_at_10"]) * 100

    flip_authorized = abs(delta_r5) <= 10.0 and abs(delta_r10) <= 10.0
    sov_wins = delta_r5 > 0 and delta_r10 > 0
    chroma_wins = delta_r5 < 0 and delta_r10 < 0

    lines = [
        "# Eval-50 Head-to-Head — Sovereign vs ChromaDB",
        "",
        f"**Date:** {datetime.now(timezone.utc).isoformat()}",
        f"**Corpus:** {corpus_size} atoms (live ChromaDB at `memory/mempalace_upstream/`)",
        f"**Queries:** {len(results)} from `eval-50.jsonl`",
        "**Trigger:** Starlight Board REVISE 2026-05-23 — head-to-head before toml flip",
        "",
        "---",
        "",
        "## Summary — the REVISE answer",
        "",
        "| Metric | Sovereign (Path A) | ChromaDB (incumbent) | Δ (sov − chroma) |",
        "|---|---:|---:|---:|",
        f"| recall@5 | {sov_summary['recall_at_5']:.1%} ({sov_summary['hits_at_5']}/{sov_summary['total']}) | "
        f"{chroma_summary['recall_at_5']:.1%} ({chroma_summary['hits_at_5']}/{chroma_summary['total']}) | "
        f"{delta_r5:+.1f}pp |",
        f"| recall@10 | {sov_summary['recall_at_10']:.1%} ({sov_summary['hits_at_10']}/{sov_summary['total']}) | "
        f"{chroma_summary['recall_at_10']:.1%} ({chroma_summary['hits_at_10']}/{chroma_summary['total']}) | "
        f"{delta_r10:+.1f}pp |",
        f"| mean rank | {sov_summary['mean_rank']:.2f} | {chroma_summary['mean_rank']:.2f} | "
        f"{sov_summary['mean_rank'] - chroma_summary['mean_rank']:+.2f} |",
        f"| p50 latency | {sov_summary['p50_latency_ms']:.2f}ms | {chroma_summary['p50_latency_ms']:.2f}ms | — |",
        f"| p95 latency | {sov_summary['p95_latency_ms']:.2f}ms | {chroma_summary['p95_latency_ms']:.2f}ms | — |",
        "",
        "## Verdict against the Board REVISE gate",
        "",
        f"**Board criterion:** sovereign recall@5 within 10pp of ChromaDB → flip authorized",
        f"**Measured:** Δ recall@5 = {delta_r5:+.1f}pp, Δ recall@10 = {delta_r10:+.1f}pp",
        f"**Within 10pp window?** {'YES' if flip_authorized else 'NO'}",
        "",
        f"- **Flip {'AUTHORIZED' if flip_authorized else 'GATED'} by Board REVISE criterion.**",
    ]
    if sov_wins:
        lines.append("- Sovereign WINS both recall metrics.")
    elif chroma_wins:
        lines.append("- ChromaDB wins both recall metrics.")
    else:
        lines.append("- Mixed result (one substrate wins recall@5, the other wins recall@10).")
    if not flip_authorized:
        lines.append("- Wire sentence-transformers embedding into sovereign BEFORE flip; re-Board with new numbers.")

    lines += [
        "",
        "## Per-query detail",
        "",
        "| QID | Vault | Sov rank | Chroma rank | Sov ms | Chroma ms |",
        "|---|---|---:|---:|---:|---:|",
    ]
    for r in results:
        sr = str(r.sov_rank) if r.sov_rank else "—"
        cr = str(r.chroma_rank) if r.chroma_rank else "—"
        lines.append(
            f"| {r.qid} | {r.vault} | {sr} | {cr} | "
            f"{r.sov_latency_ms:.1f} | {r.chroma_latency_ms:.1f} |"
        )

    lines += [
        "",
        "---",
        "",
        "*Built on SIP — 2026-05-23 · head-to-head comparison addresses Starlight Board REVISE*",
    ]
    OUTPUT_PATH.write_text("\n".join(lines), encoding="utf-8")


def main():
    print("Sovereign vs ChromaDB head-to-head comparison")
    print("=" * 60)

    print("[1/4] Opening live ChromaDB (read-only) ...")
    chroma = load_chroma()
    print(f"      ChromaDB reports {chroma.count()} atoms")

    print("[2/4] Building temp sovereign substrate seeded with same corpus ...")
    sov, tmpdir, ingested = build_temp_sovereign(chroma)
    print(f"      Ingested {ingested} atoms into {tmpdir}")
    print(f"      Sovereign reports {sov.count()} atoms post-rebuild")

    print("[3/4] Loading eval queries ...")
    queries = load_queries()
    print(f"      {len(queries)} queries loaded")

    print("[4/4] Running head-to-head ...")
    results = []
    for q in queries:
        results.append(score_query(q, sov, chroma, top_k=10))

    sov_sum = summarize_side(results, "sov")
    chroma_sum = summarize_side(results, "chroma")

    print()
    print(f"  Sovereign  recall@5 = {sov_sum['recall_at_5']:.1%}  ({sov_sum['hits_at_5']}/{sov_sum['total']})")
    print(f"  ChromaDB   recall@5 = {chroma_sum['recall_at_5']:.1%}  ({chroma_sum['hits_at_5']}/{chroma_sum['total']})")
    print(f"  Delta recall@5 = {(sov_sum['recall_at_5'] - chroma_sum['recall_at_5']) * 100:+.1f}pp")
    print()
    print(f"  Sovereign  recall@10 = {sov_sum['recall_at_10']:.1%}")
    print(f"  ChromaDB   recall@10 = {chroma_sum['recall_at_10']:.1%}")
    print(f"  Delta recall@10 = {(sov_sum['recall_at_10'] - chroma_sum['recall_at_10']) * 100:+.1f}pp")
    print()
    print(f"  Sov  latency  p50={sov_sum['p50_latency_ms']:.1f}ms  p95={sov_sum['p95_latency_ms']:.1f}ms")
    print(f"  Chr  latency  p50={chroma_sum['p50_latency_ms']:.1f}ms  p95={chroma_sum['p95_latency_ms']:.1f}ms")
    print()

    delta_r5 = (sov_sum["recall_at_5"] - chroma_sum["recall_at_5"]) * 100
    delta_r10 = (sov_sum["recall_at_10"] - chroma_sum["recall_at_10"]) * 100
    flip_ok = abs(delta_r5) <= 10.0 and abs(delta_r10) <= 10.0
    print(f"Board REVISE gate (within 10pp): {'FLIP AUTHORIZED' if flip_ok else 'FLIP GATED'}")

    write_comparison(results, sov_sum, chroma_sum, ingested)
    print()
    print(f"Wrote receipts to {OUTPUT_PATH.relative_to(SIS_ROOT)}")

    return 0 if flip_ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
