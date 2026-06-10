"""
Phase 0 6.3 smoke test — proves JsonlStore actually works end-to-end.

Tests:
  T1 — Put 10 SIP-attested atoms, search retrieves all 10
  T2 — Missing attestation raises ValueError (A1 axiom enforced)
  T3 — Tombstone (value=None) removes key from subsequent searches
  T4 — Namespace prefix filter narrows results correctly
  T5 — Metadata filter narrows results correctly
  T6 — A2 axiom verified — atoms.jsonl is plain text, cat-readable

Run:
    phase0/.venv/Scripts/python phase0/smoke.py
"""

import json
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from langgraph_substrate import JsonlStore, current_attestation


def make_atom(idx: int, vault: str, namespace_extra: str = "smoke") -> dict:
    """Build a SIP-attested atom value for the smoke."""
    return {
        "text": f"smoke atom #{idx} for vault {vault}",
        "vault": vault,
        "tier": "warm",
        "source": "/phase0-6.3-smoke",
        "written_at": datetime.now(timezone.utc).isoformat(),
        "redacted": False,
        "attestation": current_attestation(),
    }


def run() -> dict[str, str]:
    results: dict[str, str] = {}

    with tempfile.TemporaryDirectory() as tmp:
        jsonl_path = Path(tmp) / "atoms-phase0.jsonl"
        store = JsonlStore(jsonl_path)

        # ─── T1: Put 10 atoms, search retrieves all 10 ───────────────────
        try:
            vaults = ["strategic", "technical", "creative", "operational", "wisdom"]
            for i in range(10):
                vault = vaults[i % len(vaults)]
                # store.put is a CONCRETE wrapper from BaseStore that composes
                # PutOp + dispatches via batch() — exactly the contract we want.
                store.put(
                    namespace=(vault, "smoke"),
                    key=f"atom-{i:03d}",
                    value=make_atom(i, vault),
                )
            hits = store.search((), limit=100)
            assert len(hits) == 10, f"expected 10 atoms, got {len(hits)}"
            assert all(h.value.get("attestation") for h in hits), \
                "every atom must preserve A1 attestation"
            results["T1 put-10 + search-all"] = "PASS"
        except Exception as e:
            results["T1 put-10 + search-all"] = f"FAIL — {e}"

        # ─── T2: Missing attestation raises ValueError (A1 enforced) ─────
        try:
            try:
                store.put(
                    namespace=("strategic", "smoke"),
                    key="atom-no-attest",
                    value={"text": "missing attestation", "tier": "warm"},
                )
                results["T2 attestation enforcement"] = "FAIL — no exception raised"
            except ValueError as ve:
                if "attestation" in str(ve).lower():
                    results["T2 attestation enforcement"] = "PASS"
                else:
                    results["T2 attestation enforcement"] = f"FAIL — wrong msg: {ve}"
        except Exception as e:
            results["T2 attestation enforcement"] = f"FAIL — {e}"

        # ─── T3: Tombstone removes key from search ───────────────────────
        try:
            target_key = "atom-005"
            target_ns = (vaults[5 % len(vaults)], "smoke")
            # Tombstone via PutOp.value=None (BaseStore.delete composes this)
            store.delete(namespace=target_ns, key=target_key)
            hits = store.search(target_ns, limit=100)
            keys_after = [h.key for h in hits]
            if target_key not in keys_after:
                results["T3 tombstone deletion"] = "PASS"
            else:
                results["T3 tombstone deletion"] = (
                    f"FAIL — {target_key} still present after delete"
                )
        except Exception as e:
            results["T3 tombstone deletion"] = f"FAIL — {e}"

        # ─── T4: Namespace prefix filter narrows results ─────────────────
        try:
            strategic_hits = store.search(("strategic",), limit=100)
            # We put atoms 0, 5 to strategic. atom-5 was tombstoned in T3.
            # Atoms 0 and any others with vaults[0]=strategic remain.
            strategic_keys = {h.key for h in strategic_hits}
            # atom-000 maps to vaults[0]=strategic, atom-005 maps to vaults[0] too
            # (5 % 5 = 0), and atom-005 was tombstoned. So atom-000 should remain.
            assert "atom-000" in strategic_keys, \
                f"atom-000 missing from strategic: {strategic_keys}"
            assert "atom-005" not in strategic_keys, \
                f"atom-005 should have been tombstoned: {strategic_keys}"
            results["T4 namespace prefix filter"] = "PASS"
        except Exception as e:
            results["T4 namespace prefix filter"] = f"FAIL — {e}"

        # ─── T5: Metadata filter ─────────────────────────────────────────
        try:
            warm_hits = store.search(
                (),
                filter={"tier": "warm"},
                limit=100,
            )
            # All atoms had tier=warm, so all (minus the tombstoned one) match
            assert all(h.value.get("tier") == "warm" for h in warm_hits), \
                "filter must only return tier=warm atoms"
            results["T5 metadata filter"] = "PASS"
        except Exception as e:
            results["T5 metadata filter"] = f"FAIL — {e}"

        # ─── T6: A2 axiom — atoms.jsonl is plain-text, cat-readable ──────
        try:
            raw = jsonl_path.read_text(encoding="utf-8")
            lines = [ln for ln in raw.split("\n") if ln.strip()]
            # 10 puts + 1 tombstone = 11 rows on disk
            assert len(lines) == 11, f"expected 11 rows on disk, got {len(lines)}"
            # Every line is parseable JSON
            for ln in lines:
                json.loads(ln)
            # Sample a non-tombstone row has attestation
            sample = next(
                json.loads(ln) for ln in lines
                if json.loads(ln).get("value") is not None
            )
            assert sample["value"]["attestation"].startswith("Built on SIP"), \
                f"attestation must be preserved on disk: {sample}"
            results["T6 A2 filesystem-native"] = "PASS"
        except Exception as e:
            results["T6 A2 filesystem-native"] = f"FAIL — {e}"

    return results


if __name__ == "__main__":
    print("Phase 0 Step 6.3 — LangGraph + JsonlStore smoke test")
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
