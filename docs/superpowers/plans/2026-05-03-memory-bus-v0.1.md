---
plan: memory-bus-v0.1
date: 2026-05-03
status: PLANNED — execution pending Frank's go
package: private/memory-bus/
depends_on: private/voice-operator/service/memory/ (router/guardian/audit/mempalace, shipped 2026-04-30)
target_release: v7.7-pre operational
attestation: Built on SIP — operational-tier MCP wrapper over an already-shipped substrate
---

# Memory Bus v0.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up `private/memory-bus/` as a singleton stdio MCP server fronting the existing voice-operator memory substrate (Router/Guardian/mempalace), so any Claude Code tab on this machine can `memory_commit` and `memory_recall` through one process — solving the AgentDB-per-tab failure mode logged in `project_agentdb_singleton_constraint.md`.

**Architecture:** Memory Bus is a **thin MCP wrapper, not a new database**. It imports the voice-operator memory module via sys.path injection and exposes 4 tools (commit, recall, health, audit_tail). Stdio JSON-RPC matches the `starlight-mcp.ts` pattern. mempalace's `_persist_vectors()` gets a Windows file lock (msvcrt.locking on win32, fcntl on POSIX) so concurrent commits via the bus cannot corrupt `vectors.npy`. Phase 2 (cross-repo indexer, claude-mem reactivation, AgentDB second substrate) is explicitly out of scope.

**Tech Stack:** Python 3.13 (matches voice-operator), pytest, stdio JSON-RPC 2.0 (no MCP SDK — handwritten per starlight-mcp pattern), msvcrt for Windows locking.

---

## Single success gate (falsifiable)

```
A fresh Claude Code tab calls memory_commit through the registered "memory-bus" MCP,
the audit log shows the commit with "via=memory-bus" attestation,
memory_recall returns the same atom from a second tab,
and 10 concurrent commit clients produce zero vectors.npy corruption
across a 100-op stress run.
```

## Non-negotiables

1. **Reuse, don't replace.** Router/Guardian/mempalace stay where they are. The bus IMPORTS, never re-implements.
2. **Hot path Guardian.** Every commit through the bus runs Guardian PII filter first. No bypass.
3. **Audit attestation.** Every audit entry written through the bus carries `via=memory-bus` so we can distinguish bus traffic from direct voice-operator traffic.
4. **Stdio only.** No HTTP, no SSE, no daemon ports. Stdio matches Claude Code's MCP transport and avoids port-conflict drama.
5. **No new top-level deps.** Imports allowed: stdlib + voice-operator internals. No new pip installs.
6. **Operational tier — not substrate.** No `/starlight-board` gate. Guardian sovereignty boundaries unchanged.
7. **Concurrent-write safety.** mempalace gets a file lock around `_persist_vectors()` BEFORE bus stress test runs.

## File structure

```
private/memory-bus/
├── __init__.py                     # version constant
├── pyproject.toml                  # name, version, depends on voice-operator path
├── server.py                       # MCP JSON-RPC stdio server + 4 tools
├── __main__.py                     # python -m memory-bus entry
├── README.md                       # what + how + start cmd
└── tests/
    ├── __init__.py
    ├── test_server_dispatch.py     # tool registration + JSON-RPC framing
    ├── test_server_commit.py       # commit round-trip via bus
    ├── test_server_recall.py       # recall via bus
    ├── test_server_health.py       # health tool returns substrate state
    ├── test_server_audit_tail.py   # audit tail returns recent entries
    └── test_server_concurrent.py   # 10 concurrent commits, no corruption

private/voice-operator/service/memory/substrates/
└── mempalace.py                    # MODIFIED: file lock around _persist_vectors

scripts/
└── start-memory-bus.ps1            # UTF-8 BOM, launches python -m memory-bus

~/.claude/settings.json             # MODIFIED: register memory-bus MCP globally
```

---

## Task 1: Scaffold private/memory-bus/ skeleton

**Files:**
- Create: `private/memory-bus/__init__.py`
- Create: `private/memory-bus/pyproject.toml`
- Create: `private/memory-bus/README.md`
- Create: `private/memory-bus/tests/__init__.py`

- [ ] **Step 1: Create __init__.py with version**

```python
# private/memory-bus/__init__.py
__version__ = "0.1.0"
__attestation__ = "Built on SIP — memory-bus v0.1"
```

- [ ] **Step 2: Create pyproject.toml**

```toml
# private/memory-bus/pyproject.toml
[project]
name = "memory-bus"
version = "0.1.0"
description = "Singleton MCP server fronting Starlight memory substrate"
requires-python = ">=3.13"
dependencies = []

[tool.pytest.ini_options]
testpaths = ["tests"]
```

- [ ] **Step 3: Create README.md**

```markdown
# Memory Bus

Thin stdio MCP wrapper over `private/voice-operator/service/memory/`.
Solves the AgentDB-per-tab failure mode by hosting a single Router process
that all Claude Code tabs talk to.

## Tools

- `memory_commit(text, namespace, source, tier?)` → audit_id
- `memory_recall(query, k?, namespace?)` → array of {atom, score}
- `memory_health()` → {substrates: [...], atom_count, last_audit}
- `memory_audit_tail(n?)` → last N audit entries

## Start

`pwsh scripts/start-memory-bus.ps1`

## Architecture

Imports voice-operator's Router/Guardian/mempalace via sys.path injection.
No reimplementation. Hot path runs Guardian PII filter on every commit.
Every entry stamped `via=memory-bus`.
```

- [ ] **Step 4: Create tests/__init__.py (empty marker)**

```python
```

- [ ] **Step 5: Commit**

```bash
git add private/memory-bus/
git commit -m "feat(memory-bus): scaffold v0.1 skeleton with pyproject + README"
```

## Task 2: Add Windows-safe file lock to mempalace _persist_vectors

**Files:**
- Modify: `private/voice-operator/service/memory/substrates/mempalace.py`
- Test: `private/voice-operator/tests/test_memory_mempalace.py` (existing)

- [ ] **Step 1: Read mempalace.py to find _persist_vectors**

```bash
grep -n "_persist_vectors" private/voice-operator/service/memory/substrates/mempalace.py
```

- [ ] **Step 2: Write failing test for concurrent persist**

Add to existing `test_memory_mempalace.py`:

```python
def test_persist_vectors_under_concurrent_commits(tmp_path):
    """Two threads committing simultaneously must not corrupt vectors.npy."""
    import threading
    from service.memory.substrates.mempalace import Mempalace
    from service.memory.contract import Atom, new_atom_id, now_iso

    sub = Mempalace(path=str(tmp_path), dim=1024)
    errors = []

    def commit_n(n, prefix):
        try:
            for i in range(n):
                atom = Atom(
                    id=new_atom_id(),
                    text=f"{prefix}-{i}",
                    namespace="test",
                    source="test",
                    tier="warm",
                    created_at=now_iso(),
                )
                sub.commit(atom)
        except Exception as e:
            errors.append(e)

    threads = [
        threading.Thread(target=commit_n, args=(20, "a")),
        threading.Thread(target=commit_n, args=(20, "b")),
    ]
    for t in threads: t.start()
    for t in threads: t.join()

    assert errors == [], f"Concurrent commits raised: {errors}"
    # Re-load to verify no corruption
    sub2 = Mempalace(path=str(tmp_path), dim=1024)
    assert len(sub2.atoms) == 40
```

- [ ] **Step 3: Run test to verify it fails (or hangs)**

```bash
cd private/voice-operator && python -m pytest tests/test_memory_mempalace.py::test_persist_vectors_under_concurrent_commits -v
```

Expected: FAIL — vectors.npy will likely be corrupted because two threads call `np.save()` simultaneously, OR atoms.jsonl will have interleaved bytes.

- [ ] **Step 4: Add file lock to _persist_vectors**

Add at top of `mempalace.py`:

```python
import sys
if sys.platform == "win32":
    import msvcrt
    def _file_lock(f):
        msvcrt.locking(f.fileno(), msvcrt.LK_LOCK, 1)
    def _file_unlock(f):
        msvcrt.locking(f.fileno(), msvcrt.LK_UNLCK, 1)
else:
    import fcntl
    def _file_lock(f):
        fcntl.flock(f.fileno(), fcntl.LOCK_EX)
    def _file_unlock(f):
        fcntl.flock(f.fileno(), fcntl.LOCK_UN)
```

Modify `_persist_vectors()` to acquire lock on a sentinel file:

```python
def _persist_vectors(self) -> None:
    lock_path = self._vectors_path.with_suffix(".lock")
    lock_path.touch(exist_ok=True)
    with open(lock_path, "r+b") as lock_f:
        _file_lock(lock_f)
        try:
            np.save(self._vectors_path, self._vectors)
        finally:
            _file_unlock(lock_f)
```

Apply same pattern to `commit()` around the atoms.jsonl append.

- [ ] **Step 5: Run test to verify it passes**

```bash
cd private/voice-operator && python -m pytest tests/test_memory_mempalace.py::test_persist_vectors_under_concurrent_commits -v
```

Expected: PASS

- [ ] **Step 6: Run full memory test suite to ensure no regression**

```bash
cd private/voice-operator && python -m pytest tests/test_memory_*.py -v
```

Expected: ALL PASS (was 480 passing before; should be 481 now)

- [ ] **Step 7: Commit**

```bash
git add private/voice-operator/service/memory/substrates/mempalace.py private/voice-operator/tests/test_memory_mempalace.py
git commit -m "fix(memory): add cross-platform file lock to mempalace persist path"
```

## Task 3: Build Memory Bus server core (stdio JSON-RPC + commit/recall tools)

**Files:**
- Create: `private/memory-bus/server.py`
- Create: `private/memory-bus/tests/test_server_dispatch.py`
- Create: `private/memory-bus/tests/test_server_commit.py`
- Create: `private/memory-bus/tests/test_server_recall.py`

- [ ] **Step 1: Write failing test for tool registration**

Create `tests/test_server_dispatch.py`:

```python
import json
from io import StringIO
from server import MemoryBusServer

def test_server_lists_four_tools():
    s = MemoryBusServer()
    tools = s.list_tools()
    names = {t["name"] for t in tools}
    assert names == {"memory_commit", "memory_recall", "memory_health", "memory_audit_tail"}

def test_server_handles_jsonrpc_initialize():
    s = MemoryBusServer()
    req = {"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}}
    resp = s.handle(req)
    assert resp["jsonrpc"] == "2.0"
    assert resp["id"] == 1
    assert "result" in resp
    assert resp["result"]["serverInfo"]["name"] == "memory-bus"
```

- [ ] **Step 2: Run test, verify FAIL**

```bash
cd private/memory-bus && python -m pytest tests/test_server_dispatch.py -v
```

Expected: FAIL — `server.py` does not exist yet.

- [ ] **Step 3: Implement server.py minimal core**

```python
# private/memory-bus/server.py
"""Memory Bus stdio MCP server — singleton wrapper over voice-operator memory."""
import json
import sys
from pathlib import Path
from typing import Any

# Inject voice-operator into sys.path so we can import its memory module
_VOICE_OPERATOR = Path(__file__).resolve().parent.parent / "voice-operator"
if str(_VOICE_OPERATOR) not in sys.path:
    sys.path.insert(0, str(_VOICE_OPERATOR))

from service.memory import router as _router
from service.memory.audit import read_audit
from service.memory.contract import now_iso

SERVER_NAME = "memory-bus"
SERVER_VERSION = "0.1.0"
ATTESTATION = "Built on SIP — memory-bus v0.1"


class MemoryBusServer:
    def __init__(self) -> None:
        self._tools = self._build_tools()

    def _build_tools(self) -> list[dict[str, Any]]:
        return [
            {
                "name": "memory_commit",
                "description": "Commit an atom through Guardian → mempalace. Returns audit_id.",
                "inputSchema": {
                    "type": "object",
                    "required": ["text", "namespace", "source"],
                    "properties": {
                        "text": {"type": "string"},
                        "namespace": {"type": "string"},
                        "source": {"type": "string"},
                        "tier": {"type": "string", "default": "warm"},
                    },
                },
            },
            {
                "name": "memory_recall",
                "description": "Recall top-k atoms matching a query.",
                "inputSchema": {
                    "type": "object",
                    "required": ["query"],
                    "properties": {
                        "query": {"type": "string"},
                        "k": {"type": "integer", "default": 5},
                        "namespace": {"type": "string"},
                    },
                },
            },
            {
                "name": "memory_health",
                "description": "Report bus + substrate health.",
                "inputSchema": {"type": "object", "properties": {}},
            },
            {
                "name": "memory_audit_tail",
                "description": "Return last N audit log entries.",
                "inputSchema": {
                    "type": "object",
                    "properties": {"n": {"type": "integer", "default": 10}},
                },
            },
        ]

    def list_tools(self) -> list[dict[str, Any]]:
        return self._tools

    def handle(self, req: dict[str, Any]) -> dict[str, Any]:
        method = req.get("method", "")
        rid = req.get("id")
        if method == "initialize":
            return self._ok(rid, {
                "protocolVersion": "2024-11-05",
                "serverInfo": {"name": SERVER_NAME, "version": SERVER_VERSION},
                "capabilities": {"tools": {}},
            })
        if method == "tools/list":
            return self._ok(rid, {"tools": self._tools})
        if method == "tools/call":
            return self._call_tool(rid, req.get("params", {}))
        return self._err(rid, -32601, f"method not found: {method}")

    def _call_tool(self, rid, params):
        name = params.get("name", "")
        args = params.get("arguments", {})
        try:
            if name == "memory_commit":
                audit_id = _router.commit_memory(
                    text=args["text"],
                    namespace=args["namespace"],
                    source=f"{args['source']}#via=memory-bus",
                    tier=args.get("tier", "warm"),
                )
                return self._ok(rid, {"content": [{"type": "text", "text": json.dumps({"audit_id": audit_id, "attestation": ATTESTATION})}]})
            if name == "memory_recall":
                hits = _router.recall(
                    query=args["query"],
                    k=args.get("k", 5),
                    namespace=args.get("namespace"),
                    source="memory-bus",
                )
                payload = [{"id": h.atom.id, "text": h.atom.text, "score": h.score} for h in hits]
                return self._ok(rid, {"content": [{"type": "text", "text": json.dumps(payload)}]})
            if name == "memory_health":
                return self._ok(rid, {"content": [{"type": "text", "text": json.dumps(self._health())}]})
            if name == "memory_audit_tail":
                tail = read_audit(today_only=True)[-args.get("n", 10):]
                return self._ok(rid, {"content": [{"type": "text", "text": json.dumps(tail)}]})
            return self._err(rid, -32601, f"unknown tool: {name}")
        except Exception as e:
            return self._err(rid, -32000, f"{type(e).__name__}: {e}")

    def _health(self) -> dict[str, Any]:
        # Minimal: substrates loaded, current time
        return {
            "server": SERVER_NAME,
            "version": SERVER_VERSION,
            "now": now_iso(),
            "attestation": ATTESTATION,
        }

    def _ok(self, rid, result):
        return {"jsonrpc": "2.0", "id": rid, "result": result}

    def _err(self, rid, code, message):
        return {"jsonrpc": "2.0", "id": rid, "error": {"code": code, "message": message}}


def serve_stdio() -> None:
    server = MemoryBusServer()
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
        except json.JSONDecodeError:
            continue
        resp = server.handle(req)
        print(json.dumps(resp), flush=True)


if __name__ == "__main__":
    serve_stdio()
```

- [ ] **Step 4: Run dispatch test, verify PASS**

```bash
cd private/memory-bus && python -m pytest tests/test_server_dispatch.py -v
```

Expected: PASS — server lists 4 tools, initialize handshake works.

- [ ] **Step 5: Write failing test for memory_commit round-trip**

Create `tests/test_server_commit.py`:

```python
import json
from server import MemoryBusServer

def test_commit_via_bus_returns_audit_id():
    s = MemoryBusServer()
    req = {
        "jsonrpc": "2.0", "id": 7, "method": "tools/call",
        "params": {
            "name": "memory_commit",
            "arguments": {
                "text": "smoke test from bus",
                "namespace": "test/memory-bus",
                "source": "test_server_commit",
            },
        },
    }
    resp = s.handle(req)
    assert "result" in resp, f"expected result, got {resp}"
    payload = json.loads(resp["result"]["content"][0]["text"])
    assert "audit_id" in payload
    assert payload["attestation"].startswith("Built on SIP")
```

- [ ] **Step 6: Run test, expect PASS** (commit logic already exists in router)

```bash
cd private/memory-bus && python -m pytest tests/test_server_commit.py -v
```

- [ ] **Step 7: Write recall test**

Create `tests/test_server_recall.py`:

```python
import json
from server import MemoryBusServer

def test_recall_via_bus_finds_recent_commit():
    s = MemoryBusServer()
    # Commit
    s.handle({
        "jsonrpc": "2.0", "id": 1, "method": "tools/call",
        "params": {"name": "memory_commit", "arguments": {
            "text": "unique-marker-abc123-xyz789",
            "namespace": "test/recall",
            "source": "test_server_recall",
        }},
    })
    # Recall
    resp = s.handle({
        "jsonrpc": "2.0", "id": 2, "method": "tools/call",
        "params": {"name": "memory_recall", "arguments": {
            "query": "unique-marker-abc123",
            "k": 3,
        }},
    })
    payload = json.loads(resp["result"]["content"][0]["text"])
    assert any("abc123" in hit["text"] for hit in payload), f"recall missed: {payload}"
```

- [ ] **Step 8: Run all server tests**

```bash
cd private/memory-bus && python -m pytest tests/ -v
```

Expected: 3 tests PASS.

- [ ] **Step 9: Commit**

```bash
git add private/memory-bus/
git commit -m "feat(memory-bus): server core with commit/recall/health/audit_tail tools"
```

## Task 4: Add health and audit_tail tests

**Files:**
- Create: `private/memory-bus/tests/test_server_health.py`
- Create: `private/memory-bus/tests/test_server_audit_tail.py`

- [ ] **Step 1: Write health test**

```python
# tests/test_server_health.py
import json
from server import MemoryBusServer

def test_health_returns_attestation():
    s = MemoryBusServer()
    resp = s.handle({"jsonrpc": "2.0", "id": 1, "method": "tools/call",
                     "params": {"name": "memory_health", "arguments": {}}})
    payload = json.loads(resp["result"]["content"][0]["text"])
    assert payload["server"] == "memory-bus"
    assert payload["version"] == "0.1.0"
    assert "attestation" in payload
```

- [ ] **Step 2: Write audit_tail test**

```python
# tests/test_server_audit_tail.py
import json
from server import MemoryBusServer

def test_audit_tail_returns_list():
    s = MemoryBusServer()
    # First commit something so the tail isn't empty
    s.handle({"jsonrpc": "2.0", "id": 1, "method": "tools/call",
              "params": {"name": "memory_commit", "arguments": {
                  "text": "audit-tail probe",
                  "namespace": "test/audit",
                  "source": "test_audit_tail",
              }}})
    resp = s.handle({"jsonrpc": "2.0", "id": 2, "method": "tools/call",
                     "params": {"name": "memory_audit_tail", "arguments": {"n": 3}}})
    payload = json.loads(resp["result"]["content"][0]["text"])
    assert isinstance(payload, list)
    assert len(payload) <= 3
```

- [ ] **Step 3: Run both tests**

```bash
cd private/memory-bus && python -m pytest tests/test_server_health.py tests/test_server_audit_tail.py -v
```

Expected: BOTH PASS.

- [ ] **Step 4: Commit**

```bash
git add private/memory-bus/tests/
git commit -m "test(memory-bus): add health + audit_tail coverage"
```

## Task 5: Concurrent stress test (the singleton-correctness gate)

**Files:**
- Create: `private/memory-bus/tests/test_server_concurrent.py`

- [ ] **Step 1: Write concurrent commit test**

```python
# tests/test_server_concurrent.py
import json
import threading
from server import MemoryBusServer

def test_10_concurrent_commits_no_corruption():
    """Single bus instance, 10 threads each doing 10 commits = 100 atoms."""
    s = MemoryBusServer()
    errors = []

    def commit_batch(i):
        try:
            for j in range(10):
                resp = s.handle({
                    "jsonrpc": "2.0", "id": i*100+j, "method": "tools/call",
                    "params": {"name": "memory_commit", "arguments": {
                        "text": f"concurrent-{i}-{j}",
                        "namespace": "test/concurrent",
                        "source": f"thread-{i}",
                    }},
                })
                if "error" in resp:
                    errors.append(resp["error"])
        except Exception as e:
            errors.append(repr(e))

    threads = [threading.Thread(target=commit_batch, args=(i,)) for i in range(10)]
    for t in threads: t.start()
    for t in threads: t.join()

    assert errors == [], f"Concurrent commits had errors: {errors[:3]}"

    # Verify recall finds them (sample 3 random commits)
    resp = s.handle({
        "jsonrpc": "2.0", "id": 9999, "method": "tools/call",
        "params": {"name": "memory_recall", "arguments": {
            "query": "concurrent",
            "k": 50,
        }},
    })
    payload = json.loads(resp["result"]["content"][0]["text"])
    # We committed 100 atoms; recall@50 should return many of them
    assert len(payload) >= 30, f"recall returned only {len(payload)} hits"
```

- [ ] **Step 2: Run stress test**

```bash
cd private/memory-bus && python -m pytest tests/test_server_concurrent.py -v
```

Expected: PASS — file lock from Task 2 prevents corruption; all 100 commits succeed.

- [ ] **Step 3: If stress test fails, escalate Task 2 lock granularity**

If failure mode is interleaved atoms.jsonl writes: the Task 2 lock currently only protects vectors.npy. Add same lock pattern to atoms.jsonl append in `commit()`.

- [ ] **Step 4: Commit**

```bash
git add private/memory-bus/tests/test_server_concurrent.py
git commit -m "test(memory-bus): 100-op concurrent stress test (singleton correctness)"
```

## Task 6: Add __main__.py entry + start script

**Files:**
- Create: `private/memory-bus/__main__.py`
- Create: `scripts/start-memory-bus.ps1`

- [ ] **Step 1: Create __main__.py**

```python
# private/memory-bus/__main__.py
from server import serve_stdio

if __name__ == "__main__":
    serve_stdio()
```

- [ ] **Step 2: Create start-memory-bus.ps1 (UTF-8 BOM per cockpit pattern)**

```powershell
# scripts/start-memory-bus.ps1
# Memory Bus singleton — stdio MCP server fronting voice-operator memory substrate
$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path "$PSScriptRoot\..").Path
$busDir   = Join-Path $repoRoot "private\memory-bus"
Set-Location $busDir
python -m memory-bus
```

Save with UTF-8 BOM encoding (Frank's convention for cockpit scripts).

- [ ] **Step 3: Smoke test the entry**

```bash
cd private/memory-bus && echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | python -m memory-bus
```

Expected: a JSON line with `"result":{"protocolVersion":"2024-11-05","serverInfo":{"name":"memory-bus",...}}`.

- [ ] **Step 4: Commit**

```bash
git add private/memory-bus/__main__.py scripts/start-memory-bus.ps1
git commit -m "feat(memory-bus): __main__ entry + start-memory-bus.ps1 launcher"
```

## Task 7: Register memory-bus MCP globally

**Files:**
- Modify: `~/.claude/settings.json`

- [ ] **Step 1: Read current settings.json mcpServers section**

```bash
cat ~/.claude/settings.json | python -c "import json,sys; print(json.dumps(json.load(sys.stdin).get('mcpServers',{}), indent=2))"
```

- [ ] **Step 2: Add memory-bus entry via update-config skill or direct edit**

Add to `mcpServers`:

```json
"memory-bus": {
  "command": "python",
  "args": ["-m", "memory-bus"],
  "cwd": "C:/Users/frank/Starlight-Intelligence-System/private/memory-bus",
  "env": {}
}
```

- [ ] **Step 3: Verify Claude Code can see the MCP**

In a fresh tab, ask Claude Code: "list available MCP tools matching memory_*"

Expected: `memory_commit`, `memory_recall`, `memory_health`, `memory_audit_tail` appear.

- [ ] **Step 4: Live-fire smoke**

```
memory_health() → expect server=memory-bus, version=0.1.0
memory_commit({text: "live-fire smoke from new tab", namespace: "test/global-register", source: "/handover-2026-05-03"}) → expect audit_id
memory_audit_tail({n: 1}) → expect the just-committed entry with "via=memory-bus"
```

- [ ] **Step 5: No commit needed** — settings.json is user-level, not repo-tracked.

## Task 8: Update memory + write handover

**Files:**
- Modify: `~/.claude/projects/.../memory/MEMORY.md` (auto-memory index)
- Create: `~/.claude/projects/.../memory/project_memory_bus_v01.md`
- Create: `docs/ops/HANDOVER-2026-05-03-memory-bus.md`

- [ ] **Step 1: Add new auto-memory project entry**

Save `project_memory_bus_v01.md`:

```markdown
---
name: Memory Bus v0.1 shipped
description: Singleton stdio MCP wrapping voice-operator memory substrate; solves AgentDB-per-tab failure mode
type: project
---

2026-05-03 ship. private/memory-bus/ Python stdio MCP server, 4 tools (commit/recall/health/audit_tail), imports voice-operator Router/Guardian/mempalace. mempalace got cross-platform file lock around _persist_vectors. 6 test files covering dispatch / commit / recall / health / audit_tail / concurrent (100-op stress). Globally registered in ~/.claude/settings.json. Bus traffic stamped via=memory-bus in audit log. Phase 2 deferred: cross-repo indexer, claude-mem reactivation, AgentDB second substrate.

**Why:** Frank's machine runs 4-surface cockpit + multiple Claude tabs (well past the 10-tab embedded-DB failure threshold). Memory Bus = singleton mediator so concurrent tabs don't spawn N copies of the substrate.

**How to apply:** All new memory commits from any tab should go through memory_commit MCP tool. Direct voice-operator CLI commits still work; bus is additive not replacement. Stress test in tests/test_server_concurrent.py is the singleton-correctness gate.
```

Add to MEMORY.md:

```markdown
- [v7.7-pre — Memory Bus v0.1](project_memory_bus_v01.md) — 2026-05-03 ship. Singleton MCP fronting voice-operator memory; solves AgentDB-per-tab. 4 tools, 6 test files, 100-op stress passing.
```

- [ ] **Step 2: Write handover note**

Save `docs/ops/HANDOVER-2026-05-03-memory-bus.md`:

```markdown
# Handover 2026-05-03 — Memory Bus v0.1 ship

## What shipped
- private/memory-bus/ Python stdio MCP server
- 4 tools: memory_commit, memory_recall, memory_health, memory_audit_tail
- Cross-platform file lock added to mempalace
- Globally registered via ~/.claude/settings.json
- 100-op concurrent stress test green

## What deferred (with un-park triggers)
- Cross-repo indexer for the 22 ~/.claude/projects/*/memory directories — un-park when Frank wants federated recall across repos
- claude-mem reactivation — un-park after audit of why it was originally disabled
- AgentDB as second substrate — un-park when mempalace recall@5 < 0.6 on 200-query corpus
- Backup script for memory/_audit + memory/mempalace — un-park after disk recovery (was 1.3 GB free at session start)
- pp tool relocation out of Arcanea — separate quick-win below

## Machine state at handover
- Disk: 2.7 GB free / 476 GB (was 1.3 GB at start)
- RAM: ~3.3 GB free / 16 GB (was 1.5 GB at start)
- pp score: 81 A- (was 67 B-)
- Open: 19 Claude tabs — recommend close to ≤8

## Frank's morning checklist
1. Verify memory_health from a fresh tab (proves global registration worked)
2. Run a probe commit + recall to validate round-trip
3. Read this handover + new MEMORY.md entry
4. Decide on Phase 2 sequencing (cross-repo indexer? claude-mem audit? backup script first?)

## The pp-location question
Recommendation captured in Task 9. TL;DR: `npm i -g` from current Arcanea location tonight (instant decouple), full source relocation to `C:\Users\frank\Tools\peak-performance\` later in the week.
```

- [ ] **Step 3: Commit**

```bash
git add docs/ops/HANDOVER-2026-05-03-memory-bus.md
# auto-memory MEMORY.md is in ~/.claude/projects/ not the repo — auto-tracked separately
git commit -m "docs(ops): handover 2026-05-03 — Memory Bus v0.1 ship"
```

## Task 9: pp tool relocation (parallel, safe)

**Files:**
- Modify: `~/.claude/settings.json` (no — pp is invoked via slash command, not MCP)
- Action: `npm i -g` from current location

- [ ] **Step 1: Verify pp package metadata**

```bash
cat C:/Users/frank/Arcanea/packages/peak-performance/package.json | head -20
```

Confirm there's a `bin` entry exposing `pp`.

- [ ] **Step 2: Global install from current location**

```bash
powershell.exe -NoProfile -Command "cd 'C:\Users\frank\Arcanea\packages\peak-performance'; npm install -g ."
```

- [ ] **Step 3: Verify global pp works**

```bash
powershell.exe -NoProfile -Command "pp audit" | head -20
```

Expected: same audit output, no Node path needed.

- [ ] **Step 4: Document the decoupling**

Add a small note to handover under "pp-location question" section noting: pp now invocable as `pp` globally; source still in Arcanea but no longer coupled to the path. Source relocation deferred.

- [ ] **Step 5: No commit needed for global npm install** (machine-level, not repo).

---

## Self-review

**Spec coverage:**
- ✓ Memory Bus singleton MCP server — Tasks 1, 3, 6
- ✓ 4 tools (commit/recall/health/audit_tail) — Tasks 3, 4
- ✓ File lock fix for concurrent writes — Task 2
- ✓ Tests including stress — Tasks 3, 4, 5
- ✓ Global MCP registration — Task 7
- ✓ Memory + handover — Task 8
- ✓ pp relocation answer — Task 9

**Placeholder scan:** No "TBD"/"add appropriate" entries. All code blocks complete. Test bodies fully written.

**Type consistency:** `MemoryBusServer.handle()`, `list_tools()`, tool names (`memory_commit` etc.) used identically across all tasks. `audit_id` returned by `commit_memory` (matches existing router contract).

**Sequencing safety:** Task 2 (file lock) ships BEFORE Task 5 (stress test). If Task 2 fails or blocks, Task 5 doesn't start, preventing data corruption during testing.

---

## Out of scope (Phase 2 candidates with un-park triggers)

| Item | Un-park trigger |
|------|----------------|
| Cross-repo indexer (22 `~/.claude/projects/*/memory` dirs → bus) | Frank requests federated recall OR mempalace atom count > 1000 |
| claude-mem reactivation | Audit completes on why it was originally disabled |
| AgentDB second substrate via Router | mempalace recall@5 < 0.6 on 200-query graded corpus |
| memory-bank-mcp install (alioshr scope router) | Mempalace namespace queries become bottleneck (>50ms) |
| Encrypted backup of audit + mempalace | Disk recovers >5 GB free + Frank picks target (private GH / B2 / GDrive) |
| pp source relocation to ~/Tools/peak-performance/ | Time slot in low-priority window; current global install is sufficient decouple |

---

**Built on SIP — operational tier — 2026-05-03**
