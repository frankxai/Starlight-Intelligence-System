"""Regression tests for the existing SQLite adapter, not Ruvnet AgentDB."""

import sqlite3
import tempfile
import unittest
from contextlib import closing
from datetime import datetime, timedelta, timezone
from pathlib import Path

from agentdb_substrate import AgentDBSubstrate
from sovereign_substrate import Atom


class AgentDBTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = Path(self.tmp.name) / "memory.sqlite"
        self.db = AgentDBSubstrate(self.path, "codex")
        self.peer = AgentDBSubstrate(self.path, "claude")

    def tearDown(self):
        self.peer.close()
        self.db.close()
        self.tmp.cleanup()

    def put(self, key, text="needle", namespace=("work",), group="wanted", age=0, db=None):
        (db or self.db).put(Atom(
            key, namespace,
            {"text": text, "group": group, "attestation": "Built on SIP - fixture"},
            datetime(2026, 10, 10, tzinfo=timezone.utc) + timedelta(seconds=age),
        ))

    def test_superseded_text_never_returns(self):
        self.put("task", "obsolete")
        self.put("task", "current")
        self.assertEqual(self.db.search(query="obsolete"), [])
        self.assertEqual([a.value["text"] for a in self.db.search()], ["current"])
        self.assertEqual(self.db.health()["atom_count"], 1)
        self.assertEqual(self.db._conn.execute("SELECT COUNT(*) FROM atoms").fetchone()[0], 2)

    def test_filter_precedes_pagination(self):
        for i in range(8):
            self.put(str(i), group="wanted" if i < 4 else "other", age=i)
        hits = self.db.search(filter={"group": "wanted"}, offset=1, limit=2)
        self.assertEqual([a.key for a in hits], ["2", "1"])

    def test_superseded_metadata_is_not_a_match(self):
        self.put("task", group="wanted")
        self.put("task", group="other")
        for query in [None, "needle"]:
            self.assertEqual(self.db.search(query=query, filter={"group": "wanted"}), [])

    def test_fts_filter_precedes_pagination(self):
        for i in range(5):
            self.put(str(i), group="wanted" if i >= 2 else "other")
        hits = self.db.search(query="needle", filter={"group": "wanted"}, offset=1, limit=2)
        self.assertEqual([a.key for a in hits], ["3", "4"])

    def test_literal_namespace_prefix(self):
        for namespace in [("a%", "child"), ("abc", "child"), ("a_", "child"), ("ab", "child"), ("A%", "child")]:
            self.put("item", namespace=namespace)
        for query in [None, "needle"]:
            for prefix in ["a%", "a_"]:
                hits = self.db.search((prefix,), query=query)
                self.assertEqual([a.namespace for a in hits], [(prefix, "child")])

    def test_agent_isolation_in_read_search_delete_health(self):
        self.put("task", "codex")
        self.put("task", "claude", db=self.peer)
        self.assertEqual(self.db.search(query="claude"), [])
        self.db.delete(("work",), "task")
        self.assertIsNone(self.db.get(("work",), "task"))
        self.assertEqual(self.peer.get(("work",), "task").value["text"], "claude")
        self.assertEqual(self.db.health()["atom_count"], 0)
        self.assertEqual(self.peer.health()["atom_count"], 1)

    def test_delete_rewrite_and_restart_preserve_latest(self):
        self.put("task", "old")
        self.db.delete(("work",), "task")
        self.put("task", "new")
        self.db.close()
        self.db = AgentDBSubstrate(self.path, "codex")
        self.assertEqual(self.db.search(query="old"), [])
        self.assertEqual(self.db.get(("work",), "task").value["text"], "new")

    def test_wal_online_backup_survives_source_shutdown(self):
        self.db._conn.execute("PRAGMA wal_autocheckpoint=0")
        self.put("task", "recoverable")
        target = Path(self.tmp.name) / "snapshot.sqlite"
        with closing(sqlite3.connect(target)) as conn:
            self.db._conn.backup(conn)
        self.peer.close()
        self.db.close()
        recovered = AgentDBSubstrate(target, "codex")
        try:
            self.assertEqual(recovered.get(("work",), "task").value["text"], "recoverable")
            self.assertEqual(len(recovered.search(query="recoverable")), 1)
        finally:
            recovered.close()

    def test_pagination_rejects_negative_bounds(self):
        for kwargs in [{"limit": -1}, {"offset": -1}]:
            with self.assertRaises(ValueError):
                self.db.search(**kwargs)
        self.assertEqual(self.db.search(limit=0), [])


if __name__ == "__main__":
    unittest.main()
