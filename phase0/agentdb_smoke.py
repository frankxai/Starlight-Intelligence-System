"""
Phase 0 6.3-bis smoke — AgentDB tier-1 substrate (SQLite + FTS5).

Mirrors `sovereign_smoke.py` test pattern. If 6/6 PASS, the 3-tier
architecture has running code at TWO of three tiers (sovereign tier-3
+ AgentDB tier-1). Tier-2 (mem0 hot-path) is optional and not required
for SIS scope.

Run:
    python phase0/agentdb_smoke.py
"""

import json
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from agentdb_substrate import AgentDBSubstrate
from sovereign_substrate import Atom, current_attestation


def make_value(idx: int, vault: str) -> dict:
    return {
        "text": f"agentdb smoke #{idx} for vault {vault}",
        "vault": vault,
        "tier": "warm",
        "source": "/phase0-agentdb-smoke",
        "written_at": datetime.now(timezone.utc).isoformat(),
        "redacted": False,
        "attestation": current_attestation(),
    }


def run() -> dict[str, str]:
    results: dict[str, str] = {}

    with tempfile.TemporaryDirectory() as tmp:
        db_path = Path(tmp) / "agentdb.sqlite"
        substrate = AgentDBSubstrate(db_path, agent_id="overnight-test")

        # ─── T1 — Put 10, search retrieves all ─────────────────────────
        try:
            vaults = ["strategic", "technical", "creative", "operational", "wisdom"]
            for i in range(10):
                vault = vaults[i % len(vaults)]
                substrate.put(Atom(
                    key=f"atom-{i:03d}",
                    namespace=(vault, "smoke"),
                    value=make_value(i, vault),
                ))
            hits = substrate.search(limit=100)
            assert len(hits) == 10, f"expected 10 atoms, got {len(hits)}"
            assert all(h.value.get("attestation") for h in hits), \
                "every atom must preserve A1 attestation"
            results["T1 put-10 + search-all"] = "PASS"
        except Exception as e:
            results["T1 put-10 + search-all"] = f"FAIL — {e}"

        # ─── T2 — Missing attestation raises (A1 enforcement) ──────────
        try:
            try:
                substrate.put(Atom(
                    key="atom-no-attest",
                    namespace=("strategic", "smoke"),
                    value={"text": "missing attestation", "tier": "warm"},
                ))
                results["T2 attestation enforcement"] = "FAIL — no exception raised"
            except ValueError as ve:
                if "attestation" in str(ve).lower():
                    results["T2 attestation enforcement"] = "PASS"
                else:
                    results["T2 attestation enforcement"] = f"FAIL — wrong msg: {ve}"
        except Exception as e:
            results["T2 attestation enforcement"] = f"FAIL — {e}"

        # ─── T3 — Tombstone deletion ───────────────────────────────────
        try:
            substrate.delete(namespace=("strategic", "smoke"), key="atom-005")
            hits = substrate.search(namespace_prefix=("strategic", "smoke"), limit=100)
            keys = [h.key for h in hits]
            if "atom-005" not in keys:
                results["T3 tombstone deletion"] = "PASS"
            else:
                results["T3 tombstone deletion"] = f"FAIL — atom-005 still present"
        except Exception as e:
            results["T3 tombstone deletion"] = f"FAIL — {e}"

        # ─── T4 — Namespace prefix filter ──────────────────────────────
        try:
            strategic_hits = substrate.search(namespace_prefix=("strategic",), limit=100)
            keys = {h.key for h in strategic_hits}
            assert "atom-000" in keys, f"atom-000 missing: {keys}"
            assert "atom-005" not in keys, f"atom-005 should be tombstoned"
            results["T4 namespace prefix filter"] = "PASS"
        except Exception as e:
            results["T4 namespace prefix filter"] = f"FAIL — {e}"

        # ─── T5 — Metadata filter (post-FTS) ───────────────────────────
        try:
            warm_hits = substrate.search(filter={"tier": "warm"}, limit=100)
            assert all(h.value.get("tier") == "warm" for h in warm_hits)
            results["T5 metadata filter"] = "PASS"
        except Exception as e:
            results["T5 metadata filter"] = f"FAIL — {e}"

        # ─── T6 — FTS5 semantic-text retrieval ─────────────────────────
        try:
            # FTS5 should find atoms by token in 'text' field
            # "creative" appears in vaults rotation; query for it
            fts_hits = substrate.search(query="creative", limit=20)
            # Expected: atoms with vault=creative match "creative" in text
            assert len(fts_hits) > 0, "FTS5 should return at least one creative-tagged atom"
            assert any("creative" in (h.value.get("text") or "").lower() for h in fts_hits), \
                "FTS5 result must contain query term"
            results["T6 FTS5 text retrieval"] = "PASS"
        except Exception as e:
            results["T6 FTS5 text retrieval"] = f"FAIL — {e}"

        # ─── T7 — Health snapshot reports correct counts ───────────────
        try:
            h = substrate.health()
            assert h["substrate"] == "agentdb_sqlite_fts5"
            assert h["atom_count"] == 9, f"expected 9 live atoms, got {h['atom_count']}"
            assert h["tombstoned_count"] == 1, f"expected 1 tombstoned, got {h['tombstoned_count']}"
            results["T7 health snapshot"] = "PASS"
        except Exception as e:
            results["T7 health snapshot"] = f"FAIL — {e}"

        substrate.close()

    return results


if __name__ == "__main__":
    print("Phase 0 6.3-bis — AgentDB tier-1 substrate smoke")
    print("=" * 60)
    results = run()
    passed = sum(1 for v in results.values() if v == "PASS")
    total = len(results)
    for name, status in results.items():
        marker = "[OK]" if status == "PASS" else "[XX]"
        print(f"  {marker} {name:35s} {status}")
    print("=" * 60)
    print(f"Result: {passed}/{total} PASS")
    raise SystemExit(0 if passed == total else 1)
