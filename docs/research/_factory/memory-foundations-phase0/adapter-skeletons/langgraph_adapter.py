"""
LangGraph + LangMem adapter — Substrate ABC subclass for SIS Phase 0 dog-food.

Reference implementation under MIT license. Forks of SIP inherit this as
starting point.

CORRECTED 2026-05-20 post-Phase-0-Step-6.1 verification. The earlier version
of this skeleton implemented per-op methods (put/get/search/list_namespaces).
That was wrong — BaseStore's abstract surface is `batch()` + `abatch()` only,
with per-op methods being CONCRETE wrappers composed atop batch(). See
`../../memory-foundations-phase0/phase0-c7-verification-note.md` §2.

Wires LangGraph's BaseStore abstraction into the SIS Substrate ABC. Uses
a custom JsonlStore subclass to satisfy A2 (filesystem-native atoms) —
LangGraph ships InMemoryStore + PostgresStore + RedisStore out of box,
none of which are filesystem-readable plain text. JsonlStore closes that gap.

PHASE 0 STATUS: SKELETON ONLY. Interface stubbed. Concrete impl is TODO
under the TODO markers. DO NOT WIRE INTO substrates.toml UNTIL PHASE 0 EVAL
COMPLETES.

Built on SIP — operational tier (Phase 0 spike).
"""

from __future__ import annotations

import asyncio
import json
import subprocess
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable, Sequence

# LangGraph imports — uncomment when langgraph is pip-installed
# from langgraph.store.base import (
#     BaseStore,
#     Item,
#     SearchItem,
#     Op,
#     GetOp,
#     PutOp,
#     SearchOp,
#     ListNamespacesOp,
#     Result,
# )


# ─── Atom shape (mirrors SIS Atom TypedDict) ──────────────────────────────


@dataclass
class Atom:
    """Mirror of the SIS Atom TypedDict from contract.py (same as letta_adapter)."""
    id: str
    text: str
    tier: str
    namespace: str
    source: str
    written_at: str
    redacted: bool
    attestation: str


# ─── JsonlStore (BaseStore subclass) — batch-dispatch shape ────────────────


# class JsonlStore(BaseStore):
class JsonlStore:  # type: ignore[no-redef]
    """BaseStore implementation backed by append-only JSONL.

    Why: LangGraph's stock backends (InMemoryStore, PostgresStore, RedisStore)
    are NOT filesystem-native (A2 axiom). JsonlStore is the missing backend.

    File layout:
      atoms-phase0.jsonl       — append-only; one row per atom OR tombstone
      embeddings/index.npy     — sidecar embedding cache (in-memory mirror)

    BASESTORE CONTRACT (corrected 2026-05-20 6.1):
    - Subclasses implement ONLY `batch()` (sync) + `abatch()` (async).
    - Per-op methods (put/get/search/list_namespaces) are inherited concrete
      wrappers from BaseStore that compose batch() calls.
    - We dispatch by op type inside batch().

    TOMBSTONE DELETION (per BaseStore PutOp semantics):
    - PutOp.value=None means "delete this key"
    - We honor by appending a tombstone row {namespace, key, value: null, deleted_at}
    - Read path filters out keys with a tombstone newer than their latest write

    TTL POLICY:
    - SIS substrate canon has no TTL semantics — atoms are append-only.
    - `supports_ttl = False`. PutOp.ttl is ignored OR raises if needed.

    SELECTIVE INDEXING POLICY (per Phase 0 6.1 recommendation):
    - Default `index=["text"]` — embed body, not metadata.
    - Audit-row writes (cross-repo-indexer, redaction events) pass `index=False`.
    - Substantive Chronicle blessings use default.
    """

    supports_ttl = False  # SIS substrate canon — atoms never expire

    def __init__(self, jsonl_path: Path, embedding_dim: int = 384):
        self.jsonl_path = Path(jsonl_path)
        self.jsonl_path.parent.mkdir(parents=True, exist_ok=True)
        self.embedding_dim = embedding_dim
        # PHASE 0 TODO: load existing atoms into in-memory index for search
        # PHASE 0 TODO: load tombstone set for read-path filtering

    # ─── REQUIRED: the only abstract methods BaseStore mandates ────────────

    def batch(self, ops):  # -> list[Result]
        """Sync batch dispatch — the ONE required sync abstract method.

        Iterates ops, dispatches by type, returns same-order results.
        PHASE 0 TODO: implement the four dispatch arms.
        """
        results = []
        for op in ops:
            # PHASE 0 TODO: replace isinstance checks with imports of GetOp/etc
            op_name = type(op).__name__
            if op_name == "GetOp":
                results.append(self._handle_get(op))
            elif op_name == "PutOp":
                results.append(self._handle_put(op))
            elif op_name == "SearchOp":
                results.append(self._handle_search(op))
            elif op_name == "ListNamespacesOp":
                results.append(self._handle_list_namespaces(op))
            else:
                raise NotImplementedError(f"Unknown op type: {op_name}")
        return results

    async def abatch(self, ops):  # -> list[Result]
        """Async batch — required abstract async method.

        Defaults to running sync batch in a thread. Subclass can override
        for native async I/O if filesystem ops become a bottleneck.
        """
        return await asyncio.to_thread(self.batch, list(ops))

    # ─── Op handlers (private — called from batch dispatch) ──────────────

    def _handle_put(self, op):
        """PutOp handler.

        Honors tombstone semantics (value=None → delete) and SIS
        attestation policy (raise if missing).
        """
        if op.value is None:
            # Tombstone — append a deletion marker
            self._append_row({
                "namespace": list(op.namespace),
                "key": op.key,
                "value": None,
                "deleted_at": datetime.now(timezone.utc).isoformat(),
            })
            # PHASE 0 TODO: update in-memory tombstone set
            return None

        if "attestation" not in op.value or not op.value["attestation"]:
            raise ValueError(
                "Atom missing attestation — SIP §5 sovereignty clause requires "
                "per-atom attestation. Did you forget _current_attestation()?"
            )

        if op.ttl is not None and not self.supports_ttl:
            raise NotImplementedError(
                "JsonlStore does not support TTL — SIS substrate canon is append-only"
            )

        row = {
            "namespace": list(op.namespace),
            "key": op.key,
            "value": op.value,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self._append_row(row)
        # PHASE 0 TODO: update in-memory embedding index per op.index policy
        # PHASE 0 TODO: if op.index is False → skip embedding
        # PHASE 0 TODO: if op.index is None → embed default fields (["text"])
        # PHASE 0 TODO: if op.index is list[str] → embed those fields
        return None

    def _handle_get(self, op):
        """GetOp handler — return Item | None for given namespace+key."""
        # PHASE 0 TODO: in-memory index lookup OR full-file scan
        # Filter out tombstoned keys
        raise NotImplementedError("Phase 0 6.3 — implement Get handler")

    def _handle_search(self, op):
        """SearchOp handler — hybrid retrieval.

        Compose: namespace_prefix filter + metadata filter + semantic query (vector).
        Honor offset, limit. Return list[SearchItem] with scores.
        """
        # PHASE 0 TODO: 4-step pipeline:
        #   1. namespace prefix filter (cheap, in-memory)
        #   2. metadata filter (op.filter against value dict)
        #   3. tombstone removal
        #   4. if op.query: vector similarity ranking + offset/limit
        raise NotImplementedError("Phase 0 6.3 — implement Search handler (load-bearing for eval-50)")

    def _handle_list_namespaces(self, op):
        """ListNamespacesOp handler — enumerate matching namespaces."""
        # PHASE 0 TODO: scan in-memory index for matching namespace tuples
        raise NotImplementedError("Phase 0 6.3 — implement ListNamespaces handler")

    def _append_row(self, row):
        """JSONL append with atomic-ish semantics.

        PARKED-012 mitigation: wrap in fcntl/msvcrt advisory lock per
        `../parked-012-multi-process-safety.md` Fix 1.
        """
        # PHASE 0 TODO: add fcntl.flock (Unix) or msvcrt.locking (Windows)
        with self.jsonl_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


# ─── LangGraphSubstrate (wraps JsonlStore + optional LangMem manager) ──────


class LangGraphSubstrate:
    """Substrate ABC subclass — thin wrapper above JsonlStore.

    Translates SIS Atom dataclass → BaseStore put() (which composes into
    batch). Inherits all of BaseStore's convenience methods via JsonlStore.

    Memory Bus singleton fronts this — the Substrate ABC's contract is
    {commit(atom), recall(query), health()}; under the hood we call into
    JsonlStore.put / search.
    """

    def __init__(
        self,
        jsonl_path: Path,
        *,
        enable_langmem_manager: bool = False,
        embedding_model: str = "ollama:nomic-embed-text",
    ):
        self.store = JsonlStore(jsonl_path)
        self.enable_langmem_manager = enable_langmem_manager
        self.embedding_model = embedding_model
        # PHASE 0 TODO: if enable_langmem_manager:
        #   from langmem import create_memory_manager
        #   self.manager = create_memory_manager(store=self.store, ...)

    def commit(self, atom: Atom) -> None:
        """Commit atom via BaseStore.put (composes into batch internally)."""
        if not atom.attestation:
            raise ValueError("Atom missing attestation — SIP §5 violation")
        # Use BaseStore.put (concrete wrapper). It composes a PutOp + calls batch().
        # PHASE 0 TODO: actual call once langgraph imported:
        # self.store.put(
        #     namespace=tuple(atom.namespace.split("/")),
        #     key=atom.id,
        #     value={
        #         "text": atom.text,
        #         "tier": atom.tier,
        #         "source": atom.source,
        #         "written_at": atom.written_at,
        #         "redacted": atom.redacted,
        #         "attestation": atom.attestation,
        #     },
        #     index=["text"],  # selective indexing per 6.1 §3 recommendation
        # )
        raise NotImplementedError("Phase 0 6.3 — wire BaseStore.put after langgraph install")

    def recall(
        self,
        query: str,
        *,
        namespace: str | None = None,
        vault: str | None = None,
        top_k: int = 10,
    ) -> Sequence[Atom]:
        """Retrieve top-k atoms via BaseStore.search (composes SearchOp + batch)."""
        # PHASE 0 TODO:
        # prefix = tuple(namespace.split("/")) if namespace else ()
        # filter_dict = {"vault": vault} if vault else None
        # results = self.store.search(
        #     namespace_prefix=prefix,
        #     query=query,
        #     filter=filter_dict,
        #     limit=top_k,
        # )
        # return [_searchitem_to_atom(r) for r in results]
        raise NotImplementedError("Phase 0 6.3 — wire BaseStore.search after langgraph install")

    def health(self) -> dict[str, Any]:
        """Substrate health snapshot."""
        return {
            "substrate": "langgraph_jsonlstore",
            "jsonl_path": str(self.store.jsonl_path),
            "jsonl_exists": self.store.jsonl_path.exists(),
            "embedding_model": self.embedding_model,
            "supports_ttl": self.store.supports_ttl,
        }


# ─── Migration helper ──────────────────────────────────────────────────────


def migrate_from_chromadb(
    chromadb_path: Path,
    lg_substrate: LangGraphSubstrate,
    *,
    dry_run: bool = True,
) -> dict[str, int]:
    """Walk live ChromaDB store and write each atom into JsonlStore."""
    counts = {
        "atoms_read": 0,
        "atoms_written": 0,
        "attestation_preserved": 0,
        "attestation_missing": 0,
        "errors": 0,
    }
    # PHASE 0 TODO: chromadb client → Atom → lg_substrate.commit
    return counts


def _current_attestation() -> str:
    try:
        sha = subprocess.check_output(
            ["git", "rev-parse", "--short", "HEAD"], text=True
        ).strip()
        return f"Built on SIP — {sha}"
    except subprocess.CalledProcessError:
        return "Built on SIP — unknown"


# ─── Smoke test stub ────────────────────────────────────────────────────────


if __name__ == "__main__":
    import tempfile

    with tempfile.TemporaryDirectory() as tmp:
        substrate = LangGraphSubstrate(jsonl_path=Path(tmp) / "atoms-phase0.jsonl")
        h = substrate.health()
        assert h["substrate"] == "langgraph_jsonlstore", f"unexpected: {h}"
        assert h["supports_ttl"] is False, "SIS substrate must not support TTL"
        print(f"LangGraph + JsonlStore skeleton: health={h}")
        print("Smoke OK — skeleton structurally valid (impl gaps marked Phase 0 TODO)")
