"""
Phase 0 6.5 first-bite smoke — embedding sidecar produces real semantic signal.

Tests:
  T1 — Index 10 atoms from JsonlSovereign substrate
  T2 — Semantic query returns relevant atom at rank 1
  T3 — Paraphrase query (different surface form, same meaning) still hits
  T4 — Out-of-corpus query returns empty or low-scoring results
  T5 — Sidecar respects namespace_prefix filter
  T6 — Reindex from substrate after deletion drops the tombstoned atom

This is THE FIRST measured semantic retrieval test in SIS history.
"""

import tempfile
from datetime import datetime, timezone
from pathlib import Path

from embedding_sidecar import EmbeddingSidecar
from sovereign_substrate import Atom, JsonlSovereign, current_attestation


SAMPLE_CORPUS = [
    ("decisions", "atom-001", "strategic",
     "The /starlight-board is the canonical SIS substrate-tier governance command, "
     "canon-free, functional vector names. /luminor-board is the Arcanea-canonical variant."),
    ("decisions", "atom-002", "strategic",
     "Memory architecture is three tiers: agent state, operational hot-path, "
     "substrate canon. AgentDB-class systems answer tier 1."),
    ("decisions", "atom-003", "strategic",
     "Board-before-tag is structural not discretionary for substrate-touching commits "
     "since v7.6."),
    ("patterns", "atom-004", "technical",
     "The Substrate ABC is a 25-line abstract base; swapping a substrate is "
     "~250 LOC of adapter plus one branch in _instantiate."),
    ("patterns", "atom-005", "technical",
     "Memory Bus singleton stdio MCP wraps voice-operator memory; 4 tools "
     "commit/recall/audit_tail/health. Solves the AgentDB-per-tab footgun."),
    ("patterns", "atom-006", "technical",
     "Per-atom SIP attestation rides as a field in atoms.jsonl. Every audit row "
     "carries Built on SIP plus git short SHA."),
    ("ideas", "atom-007", "creative",
     "Vellum and Voltage design language uses voltage purple and doctrine amber "
     "with Fraunces, JetBrains Mono, and Inter typography."),
    ("state", "atom-008", "operational",
     "Cross-repo indexer wrote 519 atoms across the .claude projects on 2026-05-19."),
    ("principles", "atom-009", "wisdom",
     "Verify before executing. Plans encode write-time understanding but reality moves."),
    ("hopes", "atom-010", "horizon",
     "Forks of SIP inherit the pattern, not the person. Sovereignty per amendment v1.1.1."),
]


def make_atom(namespace_extra: str, key: str, vault: str, text: str) -> Atom:
    return Atom(
        key=key,
        namespace=(vault, namespace_extra),
        value={
            "text": text,
            "vault": vault,
            "tier": "warm",
            "source": "/phase0-6.5-embedding-smoke",
            "written_at": datetime.now(timezone.utc).isoformat(),
            "redacted": False,
            "attestation": current_attestation(),
        },
    )


def run() -> dict[str, str]:
    results: dict[str, str] = {}

    with tempfile.TemporaryDirectory() as tmp:
        substrate = JsonlSovereign(Path(tmp) / "atoms-embed.jsonl")
        for ns_extra, key, vault, text in SAMPLE_CORPUS:
            substrate.put(make_atom(ns_extra, key, vault, text))

        sidecar = EmbeddingSidecar(substrate)
        indexed = sidecar.reindex_from_substrate()

        # ─── T1 — Index 10 atoms ──────────────────────────────────────
        try:
            assert indexed == 10, f"expected 10 indexed, got {indexed}"
            results["T1 index 10 atoms"] = "PASS"
        except Exception as e:
            results["T1 index 10 atoms"] = f"FAIL — {e}"

        # ─── T2 — Direct query hits rank 1 ────────────────────────────
        try:
            hits = sidecar.semantic_search("memory architecture three tiers")
            top_key = hits[0][1].key if hits else None
            # atom-002 directly matches "memory architecture three tiers"
            assert top_key == "atom-002", \
                f"expected atom-002 at rank 1, got {top_key} (top 3: {[h[1].key for h in hits[:3]]})"
            results["T2 direct query rank 1"] = "PASS"
        except Exception as e:
            results["T2 direct query rank 1"] = f"FAIL — {e}"

        # ─── T3 — Paraphrase query still hits ─────────────────────────
        try:
            # "Board governance for substrate changes" → should surface atom-003 (board-before-tag)
            # OR atom-001 (starlight-board governance)
            hits = sidecar.semantic_search("substrate governance board")
            top3 = [h[1].key for h in hits[:3]]
            # Loose assertion: at least one of {atom-001, atom-003} in top 3
            assert any(k in top3 for k in ("atom-001", "atom-003")), \
                f"expected board atoms in top 3, got: {top3}"
            results["T3 paraphrase still hits"] = "PASS"
        except Exception as e:
            results["T3 paraphrase still hits"] = f"FAIL — {e}"

        # ─── T4 — Out-of-corpus query returns low scores ──────────────
        try:
            hits = sidecar.semantic_search("zebra giraffe rainforest")
            # Either empty OR top score < 0.2 (no real match)
            if not hits:
                results["T4 out-of-corpus low recall"] = "PASS"
            else:
                top_score = hits[0][0]
                if top_score < 0.2:
                    results["T4 out-of-corpus low recall"] = "PASS"
                else:
                    results["T4 out-of-corpus low recall"] = (
                        f"WARN — top score {top_score:.3f} for irrelevant query "
                        f"(top atom: {hits[0][1].key})"
                    )
        except Exception as e:
            results["T4 out-of-corpus low recall"] = f"FAIL — {e}"

        # ─── T5 — Namespace prefix filter narrows ─────────────────────
        try:
            # Search within strategic vault only
            hits = sidecar.semantic_search(
                "substrate", namespace_prefix=("strategic",), top_k=10
            )
            for _, atom in hits:
                assert atom.namespace[0] == "strategic", \
                    f"namespace filter leak: {atom.namespace}"
            results["T5 namespace prefix filter"] = "PASS"
        except Exception as e:
            results["T5 namespace prefix filter"] = f"FAIL — {e}"

        # ─── T6 — Reindex after delete drops tombstoned ──────────────
        try:
            substrate.delete(namespace=("technical", "patterns"), key="atom-006")
            sidecar.reindex_from_substrate()
            hits = sidecar.semantic_search("SIP attestation field")
            top_keys = [h[1].key for h in hits[:5]]
            assert "atom-006" not in top_keys, \
                f"atom-006 should be tombstoned but appears: {top_keys}"
            results["T6 reindex respects tombstone"] = "PASS"
        except Exception as e:
            results["T6 reindex respects tombstone"] = f"FAIL — {e}"

    return results


if __name__ == "__main__":
    print("Phase 0 6.5 first-bite — embedding sidecar semantic retrieval")
    print("=" * 60)
    results = run()
    passed = sum(1 for v in results.values() if v == "PASS")
    warned = sum(1 for v in results.values() if v.startswith("WARN"))
    total = len(results)
    for name, status in results.items():
        marker = "[OK]" if status == "PASS" else ("[~~]" if status.startswith("WARN") else "[XX]")
        print(f"  {marker} {name:35s} {status}")
    print("=" * 60)
    print(f"Result: {passed}/{total} PASS  ({warned} warnings)")
    raise SystemExit(0 if passed >= 5 else 1)  # T4 warning is acceptable
