"""
LangGraph + LangMem adapter — Substrate ABC subclass for SIS Phase 0 dog-food.

Reference implementation under MIT license. Forks of SIP inherit this as
starting point.

Wires LangGraph's BaseStore abstraction into the SIS Substrate ABC. Uses
a custom JsonlStore subclass to satisfy A2 (filesystem-native atoms) —
LangGraph ships InMemoryStore + PostgresStore + RedisStore out of box,
none of which are filesystem-readable plain text. JsonlStore closes that gap.

PHASE 0 STATUS: SKELETON ONLY. Interface stubbed. Concrete impl is TODO.
DO NOT WIRE INTO substrates.toml UNTIL PHASE 0 EVAL COMPLETES.

Built on SIP — operational tier (Phase 0 spike).
"""

from __future__ import annotations

import json
import subprocess
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable, Sequence

# LangGraph imports — uncomment when langgraph + langmem are pip-installed
# from langgraph.store.base import BaseStore, Item
# from langmem import create_memory_manager


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


# ─── JsonlStore (BaseStore subclass) ─────────────────────────────────────────


# class JsonlStore(BaseStore):
class JsonlStore:  # type: ignore[no-redef]
    """BaseStore implementation backed by append-only JSONL.

    Why: LangGraph's stock backends (InMemoryStore, PostgresStore, RedisStore)
    are NOT filesystem-native (A2 axiom). JsonlStore is the missing backend.

    File layout:
      atoms-phase0.jsonl  — append-only; one atom per line
      embeddings/         — sidecar embedding cache (binary or numpy)

    PHASE 0 SCOPE:
    - Implement BaseStore abstract methods: put, get, search, list_namespaces
    - Atom-with-attestation = the BaseStore Item value dict (top-level fields)
    - Namespace (tuple from BaseStore) ↔ slash-path from SIS Atom

    LANGGRAPH RUNTIME:
    - pip install langgraph langmem
    - No Docker, no separate DB.
    - Embedding model: configurable (Ollama / SentenceTransformers / OpenAI)
    """

    def __init__(self, jsonl_path: Path, embedding_dim: int = 384):
        self.jsonl_path = Path(jsonl_path)
        self.jsonl_path.parent.mkdir(parents=True, exist_ok=True)
        self.embedding_dim = embedding_dim
        # PHASE 0 TODO: load existing atoms into in-memory index for search

    # ─── BaseStore abstract methods ───────────────────────────────────────

    def put(
        self,
        namespace: tuple[str, ...],
        key: str,
        value: dict[str, Any],
    ) -> None:
        """Append an atom row to JSONL.

        BaseStore signature requires namespace (tuple) + key (str) + value (dict).
        We map SIS Atom into value, with namespace tuple = slash-path split.
        """
        if "attestation" not in value or not value["attestation"]:
            raise ValueError(
                "Atom missing attestation — SIP §5 sovereignty clause requires "
                "per-atom attestation. Did you forget _current_attestation()?"
            )

        row = {
            "namespace": list(namespace),
            "key": key,
            "value": value,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        with self.jsonl_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")
        # PHASE 0 TODO: update in-memory embedding index

    def get(
        self,
        namespace: tuple[str, ...],
        key: str,
    ):  # -> Item | None
        """Retrieve atom by namespace + key."""
        # PHASE 0 TODO: scan JSONL OR use in-memory index
        raise NotImplementedError("Phase 0 6.3 TODO — implement JsonlStore.get")

    def search(
        self,
        namespace_prefix: tuple[str, ...],
        *,
        query: str | None = None,
        filter: dict[str, Any] | None = None,
        limit: int = 10,
    ):  # -> list[Item]
        """Hybrid search: namespace prefix + vector similarity + metadata filter.

        This is the load-bearing method for the eval-50 measurement.
        """
        # PHASE 0 TODO: implement
        #   1. namespace prefix filter (cheap)
        #   2. metadata filter (cheap)
        #   3. vector similarity via in-memory embedding index (HNSW or flat)
        raise NotImplementedError("Phase 0 6.3 TODO — implement JsonlStore.search")

    def list_namespaces(
        self,
        prefix: tuple[str, ...] = (),
        limit: int = 100,
    ) -> list[tuple[str, ...]]:
        """List namespace tuples matching prefix."""
        # PHASE 0 TODO: scan or use in-memory index
        raise NotImplementedError("Phase 0 6.3 TODO — implement JsonlStore.list_namespaces")


# ─── LangGraph substrate (wraps JsonlStore + LangMem manager) ──────────────


class LangGraphSubstrate:
    """Substrate ABC subclass wrapping JsonlStore + optional LangMem manager.

    PHASE 0 SCOPE:
    - Commit + recall via JsonlStore.put + JsonlStore.search
    - LangMem memory manager (extract/update/forget) wired in 6.3 if scoped
    - Cross-tab semantics inherited via SIS Memory Bus singleton
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
        # PHASE 0 TODO: if enable_langmem_manager: create_memory_manager(...)

    # ─── Required Substrate ABC methods ───────────────────────────────────

    def commit(self, atom: Atom) -> None:
        """Commit atom via JsonlStore."""
        if not atom.attestation:
            raise ValueError("Atom missing attestation — SIP §5 violation")
        namespace = tuple(atom.namespace.split("/"))
        key = atom.id
        value = {
            "text": atom.text,
            "tier": atom.tier,
            "source": atom.source,
            "written_at": atom.written_at,
            "redacted": atom.redacted,
            "attestation": atom.attestation,
        }
        self.store.put(namespace, key, value)

    def recall(
        self,
        query: str,
        *,
        namespace: str | None = None,
        vault: str | None = None,
        top_k: int = 10,
    ) -> Sequence[Atom]:
        """Retrieve top-k atoms via JsonlStore.search."""
        prefix = tuple(namespace.split("/")) if namespace else ()
        filter_dict = {"vault": vault} if vault else None
        # PHASE 0 TODO: convert results back to Atom objects
        raise NotImplementedError("Phase 0 6.3 TODO — wire JsonlStore.search → Atom")

    def health(self) -> dict[str, Any]:
        """Substrate health snapshot."""
        return {
            "substrate": "langgraph_jsonlstore",
            "jsonl_path": str(self.store.jsonl_path),
            "jsonl_exists": self.store.jsonl_path.exists(),
            "embedding_model": self.embedding_model,
        }


# ─── Phase 0 migration helper ───────────────────────────────────────────────


def migrate_from_chromadb(
    chromadb_path: Path,
    lg_substrate: LangGraphSubstrate,
    *,
    dry_run: bool = True,
) -> dict[str, int]:
    """Walk live ChromaDB store and write each atom into JsonlStore.

    Symmetric with letta_adapter.migrate_from_chromadb so Phase 0 eval
    runs against the same input corpus on both candidates.
    """
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
    """Same helper as letta_adapter."""
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
        atom = Atom(
            id="mem_test_0001",
            text="Phase 0 skeleton smoke — LangGraph + JsonlStore adapter ready.",
            tier="warm",
            namespace="operational/phase0-smoke",
            source="/phase0-skeleton-smoke",
            written_at=datetime.now(timezone.utc).isoformat(),
            redacted=False,
            attestation=_current_attestation(),
        )
        substrate.commit(atom)
        h = substrate.health()
        assert h["jsonl_exists"], f"jsonl not written: {h}"
        print("LangGraph + JsonlStore skeleton smoke: OK")
