"""
Post-flip end-to-end smoke — 2026-05-24.

Verifies the substrate flip works in production-equivalent conditions:
  1. Load the new substrates.toml
  2. Confirm 'sovereign' is the FIRST enabled stanza (PRIMARY)
  3. Instantiate via service.memory.router._instantiate
  4. Commit a real atom (with SIP attestation)
  5. Query for it via Substrate.query() — should return the new atom
  6. Verify the atom appears in atoms.jsonl on disk
  7. Verify total atom count == prior_count + 1

Pass criteria: 7/7. Any failure means the flip needs investigation
before voice-operator restart goes live.
"""

from __future__ import annotations

import json
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve()
SIS_ROOT = HERE.parents[1]
VO_ROOT = SIS_ROOT / "private" / "voice-operator"
sys.path.insert(0, str(VO_ROOT))

SOV_PATH = SIS_ROOT / "memory" / "mempalace_sovereign" / "atoms.jsonl"
TOML_PATH = VO_ROOT / "config" / "substrates.toml"


def t1_toml_primary():
    """T1: sovereign is the first enabled stanza in substrates.toml."""
    toml = TOML_PATH.read_text(encoding="utf-8")
    # find order of stanza headers
    headers = []
    for line in toml.splitlines():
        s = line.strip()
        if s.startswith("[substrates.") and s.endswith("]"):
            headers.append(s)
    if not headers:
        return False, "no substrate stanzas found"
    if headers[0] != "[substrates.sovereign]":
        return False, f"first stanza is {headers[0]} not [substrates.sovereign]"
    return True, f"order: {' -> '.join(h.replace('[substrates.', '').replace(']', '') for h in headers)}"


def t2_instantiate_sovereign():
    """T2: router._instantiate('sovereign', ...) returns a SovereignJsonlSubstrate."""
    from service.memory.router import _instantiate
    from service.memory.substrates.sovereign import SovereignJsonlSubstrate
    from types import SimpleNamespace

    settings = {"path": "memory/mempalace_sovereign", "dim": 1024}
    cfg = SimpleNamespace(sis_root=SIS_ROOT)
    substrate = _instantiate("sovereign", settings, cfg)
    if not isinstance(substrate, SovereignJsonlSubstrate):
        return False, f"expected SovereignJsonlSubstrate, got {type(substrate).__name__}"
    return True, f"name={substrate.name}, count={substrate.count()}"


def t3_commit_real_atom(substrate):
    """T3: commit a real atom with SIP attestation."""
    from service.memory.contract import new_atom_id, now_iso

    try:
        sha = subprocess.check_output(
            ["git", "rev-parse", "--short", "HEAD"],
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
    except Exception:
        sha = "unknown"

    atom = {
        "id": new_atom_id(),
        "text": "post-flip-smoke 2026-05-24: substrate flipped to sovereign, A2 axiom satisfied",
        "tier": "warm",
        "namespace": "operational/post-flip-smoke",
        "source": "/phase0-post-flip-smoke",
        "written_at": now_iso(),
        "redacted": False,
        "attestation": f"Built on SIP — {sha}",
    }
    returned_id = substrate.commit(atom)
    if returned_id != atom["id"]:
        return False, f"commit returned wrong id: {returned_id} != {atom['id']}", None
    return True, f"committed id={atom['id']}", atom


def t4_query_finds_it(substrate, atom):
    """T4: Substrate.query() returns the just-committed atom."""
    recalls = substrate.query("post-flip-smoke substrate A2 axiom", k=10, namespace=None)
    if not recalls:
        return False, "query returned 0 results"
    top_id = recalls[0]["atom"]["id"]
    if top_id != atom["id"]:
        # may be at lower rank
        for i, r in enumerate(recalls, start=1):
            if r["atom"]["id"] == atom["id"]:
                return True, f"found at rank {i} (top was {top_id})"
        return False, f"atom not in top-10; top was {top_id}"
    return True, f"found at rank 1 (score={recalls[0]['score']:.3f})"


def t5_atom_on_disk(atom):
    """T5: the new atom is present in atoms.jsonl on disk (cat-readable A2)."""
    if not SOV_PATH.exists():
        return False, f"atoms.jsonl missing at {SOV_PATH}"
    raw = SOV_PATH.read_text(encoding="utf-8")
    if atom["id"] not in raw:
        return False, f"atom id {atom['id']} not found in atoms.jsonl"
    # parse the row to confirm structure
    for line in raw.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError:
            continue
        if row.get("atom", {}).get("id") == atom["id"]:
            preserved = row["atom"].get("attestation", "")
            if not preserved.startswith("Built on SIP"):
                return False, f"attestation lost on disk: {preserved!r}"
            return True, f"on disk + attestation preserved ({preserved})"
    return False, "atom id appears in raw text but not parseable"


def t6_count_grew(substrate, prior_count):
    """T6: substrate.count() reports prior_count + 1."""
    actual = substrate.count()
    if actual != prior_count + 1:
        return False, f"count {actual} != expected {prior_count + 1}"
    return True, f"count = {actual} (was {prior_count})"


def t7_fallback_still_works():
    """T7: mempalace_upstream (ChromaDB fallback) still readable post-flip."""
    from service.memory.router import _instantiate
    from types import SimpleNamespace

    try:
        settings = {"path": "memory/mempalace_upstream", "collection_name": "starlight_atoms"}
        cfg = SimpleNamespace(sis_root=SIS_ROOT)
        chroma = _instantiate("mempalace_upstream", settings, cfg)
        count = chroma.count()
        if count < 168:
            return False, f"ChromaDB count {count} < expected 168 (data loss?)"
        return True, f"ChromaDB fallback live ({count} atoms preserved)"
    except Exception as exc:
        return False, f"ChromaDB fallback unavailable: {exc}"


def main():
    print("Post-flip end-to-end smoke (substrate=sovereign PRIMARY)")
    print("=" * 60)

    results = []

    ok, msg = t1_toml_primary()
    results.append(("T1 toml: sovereign first", ok, msg))

    try:
        ok, msg = t2_instantiate_sovereign()
        results.append(("T2 router._instantiate sovereign", ok, msg))
        # Re-instantiate cleanly for the rest of the suite
        from service.memory.router import _instantiate
        from types import SimpleNamespace
        substrate = _instantiate(
            "sovereign",
            {"path": "memory/mempalace_sovereign", "dim": 1024},
            SimpleNamespace(sis_root=SIS_ROOT),
        )
        prior_count = substrate.count()
    except Exception as exc:
        results.append(("T2 router._instantiate sovereign", False, str(exc)))
        substrate = None
        prior_count = 0

    if substrate is not None:
        ok, msg, atom = t3_commit_real_atom(substrate)
        results.append(("T3 commit real atom", ok, msg))

        if ok and atom is not None:
            ok2, msg2 = t4_query_finds_it(substrate, atom)
            results.append(("T4 query finds it", ok2, msg2))

            ok3, msg3 = t5_atom_on_disk(atom)
            results.append(("T5 atom + attestation on disk", ok3, msg3))

            ok4, msg4 = t6_count_grew(substrate, prior_count - 1)  # prior_count was post-commit
            # Re-read count after commit
            actual_count = substrate.count()
            ok4 = actual_count == prior_count + 1
            msg4 = f"count = {actual_count} (was {prior_count} before this smoke commit)"
            results.append(("T6 count incremented", ok4, msg4))
        else:
            results.append(("T4 query finds it", False, "skipped — commit failed"))
            results.append(("T5 atom + attestation on disk", False, "skipped — commit failed"))
            results.append(("T6 count incremented", False, "skipped — commit failed"))

    ok, msg = t7_fallback_still_works()
    results.append(("T7 ChromaDB fallback live", ok, msg))

    passed = 0
    for name, ok, msg in results:
        marker = "[OK]" if ok else "[XX]"
        print(f"  {marker} {name:35s} {msg}")
        if ok:
            passed += 1
    print("=" * 60)
    print(f"Result: {passed}/{len(results)} PASS")
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
