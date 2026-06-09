"""
Phase 0 Path A — sovereign substrate smoke (no LangGraph dependency).

Mirrors `smoke.py` (the LangGraph path) but tests the sovereign variant.
If both pass 6/6 identically, the contrarian answer is: we don't need LangGraph.

Run:
    phase0/.venv/Scripts/python phase0/sovereign_smoke.py
    (no langgraph install required for Path A — stdlib only)
"""

import json
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from sovereign_substrate import JsonlSovereign, Atom, current_attestation


def make_atom_value(idx: int, vault: str) -> dict:
    return {
        "text": f"sovereign smoke #{idx} for vault {vault}",
        "vault": vault,
        "tier": "warm",
        "source": "/phase0-path-a-smoke",
        "written_at": datetime.now(timezone.utc).isoformat(),
        "redacted": False,
        "attestation": current_attestation(),
    }


def run() -> dict[str, str]:
    results: dict[str, str] = {}

    with tempfile.TemporaryDirectory() as tmp:
        jsonl_path = Path(tmp) / "atoms-path-a.jsonl"
        substrate = JsonlSovereign(jsonl_path)

        # ─── T1 — Put 10, search retrieves all ─────────────────────────
        try:
            vaults = ["strategic", "technical", "creative", "operational", "wisdom"]
            for i in range(10):
                vault = vaults[i % len(vaults)]
                substrate.put(Atom(
                    key=f"atom-{i:03d}",
                    namespace=(vault, "smoke"),
                    value=make_atom_value(i, vault),
                ))
            hits = substrate.search(limit=100)
            assert len(hits) == 10, f"expected 10, got {len(hits)}"
            assert all(h.value.get("attestation") for h in hits)
            results["T1 put-10 + search-all"] = "PASS"
        except Exception as e:
            results["T1 put-10 + search-all"] = f"FAIL — {e}"

        # ─── T2 — Missing attestation raises ──────────────────────────
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

        # ─── T3 — Tombstone removes key ────────────────────────────────
        try:
            substrate.delete(namespace=("strategic", "smoke"), key="atom-005")
            hits = substrate.search(namespace_prefix=("strategic", "smoke"), limit=100)
            keys = [h.key for h in hits]
            if "atom-005" not in keys:
                results["T3 tombstone deletion"] = "PASS"
            else:
                results["T3 tombstone deletion"] = f"FAIL — atom-005 present: {keys}"
        except Exception as e:
            results["T3 tombstone deletion"] = f"FAIL — {e}"

        # ─── T4 — Namespace prefix filter ──────────────────────────────
        try:
            strategic_hits = substrate.search(namespace_prefix=("strategic",), limit=100)
            keys = {h.key for h in strategic_hits}
            assert "atom-000" in keys, f"atom-000 missing: {keys}"
            assert "atom-005" not in keys, f"atom-005 should be tombstoned: {keys}"
            results["T4 namespace prefix filter"] = "PASS"
        except Exception as e:
            results["T4 namespace prefix filter"] = f"FAIL — {e}"

        # ─── T5 — Metadata filter ──────────────────────────────────────
        try:
            warm_hits = substrate.search(filter={"tier": "warm"}, limit=100)
            assert all(h.value.get("tier") == "warm" for h in warm_hits)
            results["T5 metadata filter"] = "PASS"
        except Exception as e:
            results["T5 metadata filter"] = f"FAIL — {e}"

        # ─── T6 — A2 axiom — atoms.jsonl plain-text + 11 rows ──────────
        try:
            raw = jsonl_path.read_text(encoding="utf-8")
            lines = [ln for ln in raw.split("\n") if ln.strip()]
            assert len(lines) == 11, f"expected 11 rows, got {len(lines)}"
            for ln in lines:
                json.loads(ln)
            sample = next(
                json.loads(ln) for ln in lines
                if json.loads(ln).get("value") is not None
            )
            assert sample["value"]["attestation"].startswith("Built on SIP")
            results["T6 A2 filesystem-native"] = "PASS"
        except Exception as e:
            results["T6 A2 filesystem-native"] = f"FAIL — {e}"

    return results


if __name__ == "__main__":
    print("Phase 0 Path A — sovereign substrate smoke (no LangGraph)")
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
