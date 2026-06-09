"""
Phase 0 6.3-bis — AgentDB tier-1 substrate (SQLite + FTS5).

Per Charter Addendum 2, the 3-tier memory model is:
    Tier 1 — Agent State DB (per-agent durable, high-frequency)  ← THIS FILE
    Tier 2 — Operational hot-path (session memory)
    Tier 3 — Substrate canon (sovereign filesystem-native)        ← sovereign_substrate.py

This adapter implements tier 1. Per-agent SQLite file with:
- `atoms` table with `attestation TEXT NOT NULL` (A1 SCHEMA-enforced)
- `atoms_fts` FTS5 virtual table for full-text search
- WAL journal mode for concurrent reads (cross-tab semantics)
- Plain SQLite file = `cp memory.db backup.db` to fork (A4)
- Stdlib `sqlite3` only — no external memory framework deps

Implements the same SIS-native Substrate ABC from sovereign_substrate.py
so all three substrates (Path A, AgentDB, Letta-when-built) share an
identical surface that fits behind the SIS Substrate ABC seam.

Built on SIP — operational tier (Phase 0 6.3-bis spike).
"""

from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from sovereign_substrate import Atom, Substrate, current_attestation


# ─── AgentDB tier-1 substrate ──────────────────────────────────────────────


class AgentDBSubstrate(Substrate):
    """Tier-1 per-agent substrate over SQLite + FTS5.

    File layout:
        <db_path>           — single SQLite file (cp to fork)

    Schema invariants (A1 + A2 SCHEMA-enforced):
    - `attestation TEXT NOT NULL` → A1 fails closed at write time (constraint check)
    - SQLite file IS a single durable artifact (A2 satisfied as "fork-survives-engine-death" via cp)
      Note: SQLite is binary; for `cat`-readable A2, pair with sovereign_substrate.py
      tier-3 substrate. Tier-1's role is per-agent durable state, not Obsidian canon.
    """

    supports_ttl = False  # SIP §5 — tier-1 atoms don't expire either

    def __init__(self, db_path: Path, agent_id: str = "default"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.agent_id = agent_id
        self._conn = sqlite3.connect(str(self.db_path))
        self._conn.execute("PRAGMA journal_mode=WAL")  # multi-reader friendly
        self._conn.execute("PRAGMA foreign_keys=ON")
        self._ensure_schema()

    def _ensure_schema(self) -> None:
        cur = self._conn.cursor()
        cur.executescript("""
            CREATE TABLE IF NOT EXISTS atoms (
                rowid           INTEGER PRIMARY KEY AUTOINCREMENT,
                key             TEXT    NOT NULL,
                namespace       TEXT    NOT NULL,
                agent_id        TEXT    NOT NULL,
                text            TEXT    NOT NULL,
                value_json      TEXT    NOT NULL,
                tier            TEXT    CHECK(tier IN ('warm', 'cold')) DEFAULT 'warm',
                source          TEXT,
                created_at      TEXT    NOT NULL,
                tombstoned_at   TEXT,
                attestation     TEXT    NOT NULL  -- A1 axiom schema-enforced
            );
            CREATE INDEX IF NOT EXISTS idx_atoms_ns_key ON atoms(namespace, key, agent_id);
            CREATE INDEX IF NOT EXISTS idx_atoms_tombstone ON atoms(tombstoned_at);
            CREATE VIRTUAL TABLE IF NOT EXISTS atoms_fts USING fts5(
                text,
                namespace,
                content='atoms',
                content_rowid='rowid'
            );
            -- Keep FTS in sync via triggers
            CREATE TRIGGER IF NOT EXISTS atoms_ai AFTER INSERT ON atoms BEGIN
                INSERT INTO atoms_fts(rowid, text, namespace)
                VALUES (new.rowid, new.text, new.namespace);
            END;
            CREATE TRIGGER IF NOT EXISTS atoms_ad AFTER DELETE ON atoms BEGIN
                INSERT INTO atoms_fts(atoms_fts, rowid, text, namespace)
                VALUES('delete', old.rowid, old.text, old.namespace);
            END;
            CREATE TRIGGER IF NOT EXISTS atoms_au AFTER UPDATE ON atoms BEGIN
                INSERT INTO atoms_fts(atoms_fts, rowid, text, namespace)
                VALUES('delete', old.rowid, old.text, old.namespace);
                INSERT INTO atoms_fts(rowid, text, namespace)
                VALUES (new.rowid, new.text, new.namespace);
            END;
        """)
        self._conn.commit()

    # ─── Substrate ABC implementation ───────────────────────────────────

    def put(self, atom: Atom) -> None:
        atom.validate()  # A1 attestation (also enforced by NOT NULL schema)
        ns_str = "/".join(atom.namespace)
        text = atom.value.get("text", "")
        if not text:
            raise ValueError(
                f"AgentDBSubstrate atom missing 'text' field at namespace={atom.namespace} key={atom.key} — "
                "tier-1 atoms must carry searchable text for FTS5"
            )
        cur = self._conn.cursor()
        # Tombstone-aware upsert: insert a new row; older rows for same (ns, key, agent_id)
        # are superseded but kept in the audit trail (append-only).
        cur.execute(
            """
            INSERT INTO atoms
                (key, namespace, agent_id, text, value_json, tier, source, created_at, attestation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                atom.key,
                ns_str,
                self.agent_id,
                text,
                json.dumps(atom.value, ensure_ascii=False),
                atom.value.get("tier", "warm"),
                atom.value.get("source"),
                atom.created_at.isoformat(),
                atom.value["attestation"],
            ),
        )
        self._conn.commit()

    def get(self, namespace: tuple[str, ...], key: str) -> Atom | None:
        ns_str = "/".join(namespace)
        cur = self._conn.cursor()
        # Return latest non-tombstoned row matching (ns, key, agent_id)
        row = cur.execute(
            """
            SELECT key, namespace, value_json, created_at
            FROM atoms
            WHERE namespace = ? AND key = ? AND agent_id = ? AND tombstoned_at IS NULL
            ORDER BY rowid DESC
            LIMIT 1
            """,
            (ns_str, key, self.agent_id),
        ).fetchone()
        if row is None:
            return None
        return Atom(
            key=row[0],
            namespace=tuple(row[1].split("/")) if row[1] else (),
            value=json.loads(row[2]),
            created_at=_parse_dt(row[3]),
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
        cur = self._conn.cursor()
        if query:
            # Hybrid: FTS5 ranking + namespace + filter
            ns_clause, ns_args = self._namespace_prefix_clause(namespace_prefix)
            rows = cur.execute(
                f"""
                SELECT a.key, a.namespace, a.value_json, a.created_at
                FROM atoms_fts AS f
                JOIN atoms AS a ON a.rowid = f.rowid
                WHERE atoms_fts MATCH ?
                  AND a.agent_id = ?
                  AND a.tombstoned_at IS NULL
                  {ns_clause}
                ORDER BY rank
                LIMIT ? OFFSET ?
                """,
                (query, self.agent_id, *ns_args, limit, offset),
            ).fetchall()
        else:
            # No semantic query — fall back to namespace prefix + filter scan.
            # Use the same `atoms AS a` alias so _namespace_prefix_clause works.
            ns_clause, ns_args = self._namespace_prefix_clause(namespace_prefix)
            rows = cur.execute(
                f"""
                SELECT a.key, a.namespace, a.value_json, a.created_at
                FROM atoms AS a
                WHERE a.agent_id = ?
                  AND a.tombstoned_at IS NULL
                  {ns_clause}
                ORDER BY a.created_at DESC
                LIMIT ? OFFSET ?
                """,
                (self.agent_id, *ns_args, limit, offset),
            ).fetchall()

        atoms = []
        for r in rows:
            value = json.loads(r[2])
            if filter and not _filter_matches(value, filter):
                continue
            atoms.append(Atom(
                key=r[0],
                namespace=tuple(r[1].split("/")) if r[1] else (),
                value=value,
                created_at=_parse_dt(r[3]),
            ))
        return atoms

    def delete(self, namespace: tuple[str, ...], key: str) -> None:
        # Append-only tombstone — mark non-NULL tombstoned_at on the latest row.
        # All historic rows remain for audit; tombstoned rows are filtered out of reads.
        ns_str = "/".join(namespace)
        cur = self._conn.cursor()
        cur.execute(
            """
            UPDATE atoms
            SET tombstoned_at = ?
            WHERE namespace = ? AND key = ? AND agent_id = ? AND tombstoned_at IS NULL
            """,
            (datetime.now(timezone.utc).isoformat(), ns_str, key, self.agent_id),
        )
        self._conn.commit()

    def health(self) -> dict[str, Any]:
        cur = self._conn.cursor()
        atom_count = cur.execute(
            "SELECT COUNT(*) FROM atoms WHERE agent_id = ? AND tombstoned_at IS NULL",
            (self.agent_id,),
        ).fetchone()[0]
        tombstoned = cur.execute(
            "SELECT COUNT(*) FROM atoms WHERE agent_id = ? AND tombstoned_at IS NOT NULL",
            (self.agent_id,),
        ).fetchone()[0]
        return {
            "substrate": "agentdb_sqlite_fts5",
            "db_path": str(self.db_path),
            "agent_id": self.agent_id,
            "atom_count": atom_count,
            "tombstoned_count": tombstoned,
            "supports_ttl": self.supports_ttl,
            "journal_mode": "WAL",
        }

    # ─── Helpers ─────────────────────────────────────────────────────────

    def _namespace_prefix_clause(self, prefix: tuple[str, ...]) -> tuple[str, tuple]:
        if not prefix:
            return "", ()
        prefix_str = "/".join(prefix)
        return "AND (a.namespace = ? OR a.namespace LIKE ?)", (prefix_str, prefix_str + "/%")

    def close(self) -> None:
        self._conn.close()


# ─── Helpers (mirrored from sovereign_substrate to keep modules independent) ──


def _parse_dt(s: str | None) -> datetime:
    if not s:
        return datetime.now(timezone.utc)
    try:
        if s.endswith("Z"):
            s = s[:-1] + "+00:00"
        return datetime.fromisoformat(s)
    except ValueError:
        return datetime.now(timezone.utc)


def _filter_matches(value: dict[str, Any], filter_dict: dict[str, Any]) -> bool:
    for k, v in filter_dict.items():
        if value.get(k) != v:
            return False
    return True
