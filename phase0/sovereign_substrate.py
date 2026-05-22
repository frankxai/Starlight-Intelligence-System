"""
Phase 0 Path A — Sovereign SIS Substrate (NO LangGraph dependency).

Contrarian-test of the question Frank raised 2026-05-21:
  "why we need langgraph or letta what others not covering"

This file implements the same JsonlStore semantics as
`langgraph_substrate.py` but without inheriting from `langgraph.store.base.BaseStore`.
It uses a minimal SIS-native Substrate ABC defined inline.

If the 6-test smoke passes here equivalently to the LangGraph version,
the answer to "do we need LangGraph?" is NO — JsonlStore alone is enough.

Trade-off it forces us to surface:
- Path A (this file)  — zero external memory framework deps, our own ABC, full sovereignty
- Path B (langgraph_substrate.py) — LangGraph ecosystem alignment, BaseStore inherited

Built on SIP — operational tier (Phase 0 Path A spike).
"""

from __future__ import annotations

import json
import subprocess
from abc import ABC, abstractmethod
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


# ─── Helpers (mirrored from langgraph_substrate to keep modules independent) ──


def current_attestation() -> str:
    """Return 'Built on SIP — <short-sha>' from current HEAD."""
    try:
        sha = subprocess.check_output(
            ["git", "rev-parse", "--short", "HEAD"],
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
        return f"Built on SIP — {sha}" if sha else "Built on SIP — unknown"
    except (subprocess.CalledProcessError, FileNotFoundError):
        return "Built on SIP — unknown"


# ─── SIS-native ABC (the SUBSTRATE seam) ──────────────────────────────────


@dataclass
class Atom:
    """SIS atom — mirrors the contract.py TypedDict.

    A1 axiom — attestation field is non-waivable.
    A3 axiom — namespace as tuple maps to vault canon.
    """
    key: str
    namespace: tuple[str, ...]
    value: dict[str, Any]
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def validate(self) -> None:
        if not self.value.get("attestation"):
            raise ValueError(
                f"Atom missing attestation at namespace={self.namespace} key={self.key} — "
                "SIP §5 sovereignty clause requires per-atom attestation."
            )


class Substrate(ABC):
    """SIS-native Substrate ABC (Path A — no LangGraph BaseStore inheritance).

    Three methods. No op-dispatch ceremony. Direct contract.
    """

    @abstractmethod
    def put(self, atom: Atom) -> None:
        """Append atom to substrate. Tombstone via value={'_deleted': True}."""

    @abstractmethod
    def get(self, namespace: tuple[str, ...], key: str) -> Atom | None:
        """Fetch atom by namespace + key. None if missing or tombstoned."""

    @abstractmethod
    def search(
        self,
        namespace_prefix: tuple[str, ...] = (),
        *,
        query: str | None = None,
        filter: dict[str, Any] | None = None,
        limit: int = 10,
        offset: int = 0,
    ) -> list[Atom]:
        """Retrieve matching atoms. Phase 0 first-bite: prefix + filter; query is sidecar work."""

    @abstractmethod
    def delete(self, namespace: tuple[str, ...], key: str) -> None:
        """Tombstone the atom. Append-only — preserves audit trail."""

    @abstractmethod
    def health(self) -> dict[str, Any]:
        """Substrate health snapshot."""


# ─── JsonlSovereign — concrete Substrate (no langgraph) ────────────────────


class JsonlSovereign(Substrate):
    """Path A reference implementation — Substrate over append-only JSONL.

    File layout (identical to Path B for migration compatibility):
        <jsonl_path>                  — one row per put OR tombstone
        Row schema:
          write:     {"key": K, "namespace": [...], "value": V, "created_at": ISO}
          tombstone: {"key": K, "namespace": [...], "value": null, "deleted_at": ISO}

    Sovereignty properties:
    - Zero external memory-framework deps (stdlib only)
    - Plain-JSONL on disk — cat-readable, diff-friendly, fork-survives-engine-death
    - Per-atom attestation enforced at write time (raises on missing)
    - Append-only — tombstones are added, never edits-in-place
    - Single-writer-safe within process; cross-process needs advisory lock (PARKED-012)
    """

    supports_ttl = False  # SIP §5 — substrate atoms never expire

    def __init__(self, jsonl_path: Path):
        self.jsonl_path = Path(jsonl_path)
        self.jsonl_path.parent.mkdir(parents=True, exist_ok=True)
        # In-memory index: {namespace_tuple: {key: latest_row_dict}}
        self._index: dict[tuple[str, ...], dict[str, dict[str, Any]]] = defaultdict(dict)
        self._load_existing()

    def _load_existing(self) -> None:
        if not self.jsonl_path.exists():
            return
        with self.jsonl_path.open("r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    row = json.loads(line)
                except json.JSONDecodeError:
                    continue
                ns = tuple(row.get("namespace", []))
                key = row.get("key")
                if key is None:
                    continue
                if row.get("value") is None:
                    self._index[ns].pop(key, None)
                else:
                    self._index[ns][key] = row

    def _append_and_update(self, row: dict[str, Any]) -> None:
        with self.jsonl_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")
        ns = tuple(row.get("namespace", []))
        key = row.get("key")
        if key is None:
            return
        if row.get("value") is None:
            self._index[ns].pop(key, None)
        else:
            self._index[ns][key] = row

    # ─── Substrate ABC methods ───────────────────────────────────────────

    def put(self, atom: Atom) -> None:
        atom.validate()  # A1 attestation enforcement
        self._append_and_update({
            "key": atom.key,
            "namespace": list(atom.namespace),
            "value": atom.value,
            "created_at": atom.created_at.isoformat(),
        })

    def get(self, namespace: tuple[str, ...], key: str) -> Atom | None:
        row = self._index.get(tuple(namespace), {}).get(key)
        if row is None:
            return None
        return Atom(
            key=row["key"],
            namespace=tuple(row.get("namespace", [])),
            value=row["value"],
            created_at=_parse_dt(row.get("created_at")),
        )

    def search(
        self,
        namespace_prefix: tuple[str, ...] = (),
        *,
        query: str | None = None,
        filter: dict[str, Any] | None = None,
        limit: int = 10,
        offset: int = 0,
    ) -> list[Atom]:
        prefix = tuple(namespace_prefix)
        candidates: list[dict[str, Any]] = []
        for ns, keyed in self._index.items():
            if not _namespace_starts_with(ns, prefix):
                continue
            for row in keyed.values():
                if filter and not _metadata_matches(row.get("value", {}), filter):
                    continue
                candidates.append(row)
        candidates.sort(key=lambda r: r.get("created_at") or "", reverse=True)
        sliced = candidates[offset : offset + limit]
        return [
            Atom(
                key=row["key"],
                namespace=tuple(row.get("namespace", [])),
                value=row["value"],
                created_at=_parse_dt(row.get("created_at")),
            )
            for row in sliced
        ]

    def delete(self, namespace: tuple[str, ...], key: str) -> None:
        self._append_and_update({
            "key": key,
            "namespace": list(namespace),
            "value": None,
            "deleted_at": datetime.now(timezone.utc).isoformat(),
        })

    def health(self) -> dict[str, Any]:
        return {
            "substrate": "jsonl_sovereign",
            "jsonl_path": str(self.jsonl_path),
            "jsonl_exists": self.jsonl_path.exists(),
            "namespace_count": len(self._index),
            "atom_count": sum(len(d) for d in self._index.values()),
            "supports_ttl": self.supports_ttl,
        }


# ─── Helpers ───────────────────────────────────────────────────────────────


def _parse_dt(s: str | None) -> datetime:
    if not s:
        return datetime.now(timezone.utc)
    try:
        if s.endswith("Z"):
            s = s[:-1] + "+00:00"
        return datetime.fromisoformat(s)
    except ValueError:
        return datetime.now(timezone.utc)


def _namespace_starts_with(ns: tuple[str, ...], prefix: tuple[str, ...]) -> bool:
    if len(prefix) > len(ns):
        return False
    return ns[: len(prefix)] == prefix


def _metadata_matches(value: dict[str, Any], filter_dict: dict[str, Any]) -> bool:
    for k, v in filter_dict.items():
        if value.get(k) != v:
            return False
    return True
