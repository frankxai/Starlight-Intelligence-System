"""
Phase 0 6.3 — LangGraph + JsonlStore substrate (working implementation).

Ports the corrected adapter skeleton from
`docs/research/_factory/memory-foundations-phase0/adapter-skeletons/langgraph_adapter.py`
into running code under `phase0/.venv/` with `langgraph` installed.

Implements the load-bearing `BaseStore.batch()` + `abatch()` contract per
the 6.1 verification note — dispatch by op type, honor tombstone semantics,
enforce SIP attestation on every PutOp, set `supports_ttl=False`.

PHASE 0 SCOPE:
- Put / Get / Search / ListNamespaces over JSONL substrate
- Namespace prefix + metadata filter for search (semantic query is Phase 0 6.5)
- Tombstone-row deletion preserves append-only invariant
- SIP attestation enforced — every atom must carry "Built on SIP — <sha>"
- A2 axiom satisfied — atoms.jsonl is plain-text + cat-readable

OUT OF SCOPE (Phase 0 later steps):
- Vector embedding + semantic retrieval (6.5 with embedding model wired)
- Multi-process advisory lock (6.4 — see ../docs/research/_factory/memory-foundations-phase0/parked-012-multi-process-safety.md)
- Letta-vs-LangGraph head-to-head measurement (6.5 against eval-50.jsonl)

Built on SIP — operational tier (Phase 0 spike).
"""

from __future__ import annotations

import asyncio
import json
import subprocess
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

from langgraph.store.base import (
    BaseStore,
    Item,
    GetOp,
    PutOp,
    SearchOp,
    ListNamespacesOp,
    SearchItem,
)


# ─── Helpers ───────────────────────────────────────────────────────────────


def current_attestation() -> str:
    """Return 'Built on SIP — <short-sha>' from the current HEAD.

    Mirrors `_current_attestation()` in
    `private/voice-operator/service/memory/router.py`. If we're outside a git
    repo (smoke tests in /tmp), returns a deterministic fallback.
    """
    try:
        sha = subprocess.check_output(
            ["git", "rev-parse", "--short", "HEAD"],
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
        if not sha:
            return "Built on SIP — unknown"
        return f"Built on SIP — {sha}"
    except (subprocess.CalledProcessError, FileNotFoundError):
        return "Built on SIP — unknown"


# ─── JsonlStore — concrete BaseStore subclass ──────────────────────────────


class JsonlStore(BaseStore):
    """Filesystem-native BaseStore backed by append-only JSONL.

    File layout:
        <jsonl_path>                  — one row per put OR tombstone
        <jsonl_path>.idx.json         — sidecar index (regenerable from jsonl)

    Row schema:
        {"namespace": ["a", "b"], "key": "...", "value": {...}, "created_at": "..."}
        {"namespace": ["a", "b"], "key": "...", "value": null, "deleted_at": "..."}   # tombstone

    The store is single-writer-safe via Python's GIL within one process; for
    cross-process safety, see parked-012-multi-process-safety.md (Fix 1
    advisory lock — not yet applied in this skeleton-impl).
    """

    # Substrate canon has no TTL semantics — atoms are append-only per SIP §5.
    supports_ttl = False

    def __init__(self, jsonl_path: Path, *, attestation_required: bool = True):
        super().__init__()
        self.jsonl_path = Path(jsonl_path)
        self.jsonl_path.parent.mkdir(parents=True, exist_ok=True)
        self.attestation_required = attestation_required

        # In-memory index: {namespace_tuple: {key: latest_row}}.
        # Tombstones cause the key to disappear from the inner dict.
        self._index: dict[tuple[str, ...], dict[str, dict[str, Any]]] = defaultdict(dict)
        self._load_existing()

    # ─── Internal: load existing JSONL into the in-memory index ──────────

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
                    # Skip corrupt rows — should not happen if writer is sound,
                    # but JSONL append-only is best-effort recovery.
                    continue
                ns = tuple(row.get("namespace", []))
                key = row.get("key")
                if key is None:
                    continue
                if row.get("value") is None:
                    # Tombstone — remove key from index
                    self._index[ns].pop(key, None)
                else:
                    self._index[ns][key] = row

    # ─── Internal: append + index update ──────────────────────────────────

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

    # ─── The two abstract methods BaseStore mandates ─────────────────────

    def batch(self, ops: Iterable):
        """Sync batch dispatch — the ONE required sync abstract method.

        Per 6.1 verification note: BaseStore's only abstract methods are
        batch() + abatch(). Per-op convenience methods (put/get/search/
        list_namespaces) are CONCRETE wrappers that compose into batch().
        """
        results: list[Any] = []
        for op in ops:
            if isinstance(op, GetOp):
                results.append(self._handle_get(op))
            elif isinstance(op, PutOp):
                results.append(self._handle_put(op))
            elif isinstance(op, SearchOp):
                results.append(self._handle_search(op))
            elif isinstance(op, ListNamespacesOp):
                results.append(self._handle_list_namespaces(op))
            else:
                raise NotImplementedError(f"Unknown op type: {type(op).__name__}")
        return results

    async def abatch(self, ops: Iterable):
        """Async batch — required abstract async method.

        Defaults to running sync batch in a thread. Real async I/O would
        replace this for hot-path scaling; for substrate canon this is fine.
        """
        return await asyncio.to_thread(self.batch, list(ops))

    # ─── Op handlers ──────────────────────────────────────────────────────

    def _handle_put(self, op: PutOp):
        """PutOp handler — honors tombstone + SIP attestation + TTL policy."""
        if op.value is None:
            # Tombstone — append a deletion marker
            self._append_and_update({
                "namespace": list(op.namespace),
                "key": op.key,
                "value": None,
                "deleted_at": datetime.now(timezone.utc).isoformat(),
            })
            return None

        # SIP §5 sovereignty clause — attestation non-waivable
        if self.attestation_required and not op.value.get("attestation"):
            raise ValueError(
                f"Atom missing attestation at namespace={op.namespace} key={op.key} — "
                "SIP §5 sovereignty clause requires per-atom attestation."
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
        self._append_and_update(row)
        return None

    def _handle_get(self, op: GetOp):
        """GetOp handler — return Item | None for given namespace+key."""
        ns = tuple(op.namespace)
        row = self._index.get(ns, {}).get(op.key)
        if row is None:
            return None
        return Item(
            value=row["value"],
            key=row["key"],
            namespace=ns,
            created_at=_parse_dt(row.get("created_at")),
            updated_at=_parse_dt(row.get("created_at")),
        )

    def _handle_search(self, op: SearchOp):
        """SearchOp handler — namespace prefix filter + metadata filter.

        Phase 0 first-bite: semantic query is not yet wired (no embedding
        model). Returns matches by prefix + filter, scored by recency.
        Phase 0 6.5 will add vector ranking.
        """
        prefix = tuple(op.namespace_prefix)
        candidates: list[dict[str, Any]] = []
        for ns, keyed in self._index.items():
            if not _namespace_starts_with(ns, prefix):
                continue
            for row in keyed.values():
                if op.filter and not _metadata_matches(row.get("value", {}), op.filter):
                    continue
                candidates.append(row)
        # Sort newest-first for stable "most recent matches" semantics
        candidates.sort(key=lambda r: r.get("created_at") or "", reverse=True)
        sliced = candidates[op.offset : op.offset + op.limit]
        return [
            SearchItem(
                value=row["value"],
                key=row["key"],
                namespace=tuple(row.get("namespace", [])),
                created_at=_parse_dt(row.get("created_at")),
                updated_at=_parse_dt(row.get("created_at")),
                score=None,  # Phase 0 6.5 — wire semantic score
            )
            for row in sliced
        ]

    def _handle_list_namespaces(self, op: ListNamespacesOp):
        """ListNamespacesOp handler — enumerate namespaces matching conditions."""
        seen: list[tuple[str, ...]] = []
        for ns in self._index.keys():
            # Phase 0 first-bite: support max_depth + no match conditions.
            # Full MatchCondition handling is Phase 0 6.3 hardening.
            if op.max_depth is not None and len(ns) > op.max_depth:
                continue
            seen.append(ns)
        seen.sort()
        return seen[op.offset : op.offset + op.limit]


# ─── Helpers ───────────────────────────────────────────────────────────────


def _parse_dt(s: str | None) -> datetime:
    if not s:
        return datetime.now(timezone.utc)
    try:
        # Accept Z-suffix ISO
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
    """Simple equality filter on top-level value fields."""
    for k, v in filter_dict.items():
        if value.get(k) != v:
            return False
    return True
