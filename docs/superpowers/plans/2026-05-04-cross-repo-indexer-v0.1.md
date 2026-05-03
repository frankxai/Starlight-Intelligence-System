---
plan: cross-repo-indexer-v0.1
date: 2026-05-04
status: PLANNED — awaits Phase 1 (Memory Bus v0.1) verification from a fresh tab
package: private/memory-bus/indexer/
depends_on: private/memory-bus/server.py (shipped 2026-05-03 in 46f1ee2)
target_release: v7.7-pre Phase 2 operational
attestation: Built on SIP — operational-tier indexer over an already-shipped substrate
---

# Cross-Repo Memory Indexer v0.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Index Frank's 22 `~/.claude/projects/*/memory/` directories into the Memory Bus so any Claude Code tab can semantically recall content from any project — turning ~564 MB of *de facto* siloed memory into ~1000-1200 unified, searchable atoms behind one MCP.

**Architecture:** Idempotent dual-granularity crawler. **Line atoms** (one per `- [Title](file.md)` row in each `MEMORY.md`) form the lightweight index. **File atoms** (one per referenced `user_*` / `feedback_*` / `project_*` / `reference_*` / `decision_*` file) form the content layer. Stable atom IDs use `sha256(project + file_path + title)` so re-orderings of MEMORY.md don't fork the corpus. Idempotency: indexer queries `memory_recall` for the stable-id marker before committing each atom. Runs nightly via Windows Task Scheduler.

**Tech Stack:** Python 3.13 stdlib, json-rpc subprocess invocation of `private/memory-bus/server.py` (no new deps), Windows Task Scheduler for cadence.

---

## Single success gate (falsifiable)

```
After first full indexer run:
- atom_count from memory_health() jumps by ≥800 (matches the research estimate)
- memory_recall("frankx voice rules") returns hits with namespace
  starting "cross-repo/frankx/feedback/..."
- Re-running the indexer adds 0 new atoms (idempotency proven)
- memory_audit_tail(50) shows ≥800 commit rows with via=memory-bus#indexer
  stamp distinguishing indexer traffic from interactive traffic
```

## Non-negotiables

1. **Bus-only writes.** The indexer talks to mempalace ONLY through `memory_commit` MCP — never imports the substrate directly. This keeps the bus singleton property intact.
2. **Idempotent.** Re-runs are no-ops. Atom IDs are deterministic; existing atoms checked via `memory_recall` (or a sentinel atom at `cross-repo/_index/heartbeat`) before commit.
3. **Source attestation.** Every atom committed by indexer stamps `source = "/cross-repo-indexer#via=memory-bus#indexer"` so audit consumers can isolate indexer traffic from interactive traffic.
4. **Guardian on hot path.** Same as Phase 1 — every atom passes Guardian PII filter before commit (already enforced by `memory_commit`).
5. **No project-special-casing.** Research confirmed all 22 projects follow identical file taxonomy. One generic crawler handles all.
6. **Skip JSONL caches.** The 564 MB total is ~90% non-text JSONL session caches; indexer reads ONLY `.md` files inside `memory/` subdirectories.
7. **Operational tier — no `/starlight-board`.** No edits to SIP/SIS/ALLIANCE/STACK/VERTICALS/VOICES/REGISTRY or attestation rules. Guardian unchanged.
8. **Disk discipline.** Indexer is read-only on source files. Only writes go through Bus. No new disk pressure on the source projects.

## File structure

```
private/memory-bus/indexer/
├── __init__.py                     # version constant
├── crawler.py                      # walks ~/.claude/projects/*/memory/ directories
├── atom_factory.py                 # extracts MEMORY.md lines + file bodies → atom dicts
├── stable_id.py                    # sha256(project + file + title) deterministic IDs
├── bus_client.py                   # subprocess-driven JSON-RPC client to server.py
├── runner.py                       # orchestrates crawl → extract → idempotency-check → commit
├── __main__.py                     # CLI entry: python -m memory-bus.indexer --all
└── tests/
    ├── __init__.py
    ├── test_crawler.py             # finds memory dirs, skips non-md files
    ├── test_atom_factory.py        # parses MEMORY.md format, extracts line + file atoms
    ├── test_stable_id.py           # sha256 deterministic across runs, distinct per atom
    ├── test_bus_client.py          # spawns server.py subprocess, round-trips JSON-RPC
    ├── test_runner_idempotent.py   # second run commits 0 new atoms
    └── test_runner_attestation.py  # all commits stamp via=memory-bus#indexer

scripts/
└── run-cross-repo-indexer.ps1      # Windows Task Scheduler entry — invokes runner

docs/ops/
└── HANDOVER-2026-05-04-indexer.md  # post-run handover with atom-count delta
```

---

## Task 1: Scaffold indexer subpackage

**Files:**
- Create: `private/memory-bus/indexer/__init__.py`
- Create: `private/memory-bus/indexer/tests/__init__.py`

- [ ] **Step 1: Create indexer/__init__.py**

```python
# private/memory-bus/indexer/__init__.py
"""Cross-repo memory indexer — pulls atoms from ~/.claude/projects/*/memory/
directories into the Memory Bus singleton.

Idempotent. Stable atom IDs via sha256(project + file + title). Bus-only writes
through memory_commit MCP — never imports the substrate directly."""

__version__ = "0.1.0"
__attestation__ = "Built on SIP — cross-repo-indexer v0.1"
```

- [ ] **Step 2: Empty tests/__init__.py**

- [ ] **Step 3: Smoke run pytest discovery**

```bash
cd private/memory-bus && python -m pytest indexer/tests/ -v
```

Expected: `no tests ran` (collection succeeds, no tests yet).

## Task 2: Stable ID generation (TDD)

**Files:**
- Create: `private/memory-bus/indexer/stable_id.py`
- Create: `private/memory-bus/indexer/tests/test_stable_id.py`

- [ ] **Step 1: Write failing tests**

```python
# tests/test_stable_id.py
from indexer.stable_id import atom_id

def test_stable_across_calls():
    a = atom_id("frankx", "feedback_no_canva_visuals.md", "No Canva for visuals")
    b = atom_id("frankx", "feedback_no_canva_visuals.md", "No Canva for visuals")
    assert a == b

def test_distinct_per_input():
    a = atom_id("frankx", "feedback_no_canva_visuals.md", "No Canva for visuals")
    b = atom_id("arcanea", "feedback_no_canva_visuals.md", "No Canva for visuals")
    assert a != b

def test_format():
    a = atom_id("p", "f.md", "t")
    assert a.startswith("xrepo_")
    assert len(a) == len("xrepo_") + 16  # 16 hex chars = 64 bits, plenty
```

- [ ] **Step 2: Implement stable_id.py**

```python
# indexer/stable_id.py
import hashlib

def atom_id(project: str, file_path: str, title: str) -> str:
    """Deterministic atom ID: sha256(project|file|title), prefixed for visibility.

    Re-orderings of MEMORY.md lines don't shift the ID — the (project, file, title)
    tuple is the durable key. Title comes from the bracketed link text in the
    `- [Title](file.md)` row.
    """
    key = f"{project}|{file_path}|{title}".encode("utf-8")
    digest = hashlib.sha256(key).hexdigest()[:16]
    return f"xrepo_{digest}"
```

- [ ] **Step 3: Run tests**

```bash
cd private/memory-bus && python -m pytest indexer/tests/test_stable_id.py -v
```

Expected: 3 PASS.

- [ ] **Step 4: Commit (private — gitignored — but record locally)**

The package lives under `private/` so commits stay local. Skip git step at v0.1.

## Task 3: MEMORY.md atom factory (TDD)

**Files:**
- Create: `private/memory-bus/indexer/atom_factory.py`
- Create: `private/memory-bus/indexer/tests/test_atom_factory.py`

- [ ] **Step 1: Write failing tests**

```python
# tests/test_atom_factory.py
from pathlib import Path
from indexer.atom_factory import extract_memory_md_atoms, extract_file_atoms

SAMPLE_MEMORY_MD = '''# Some header

- [Frank's role](user_frank.md) — Starlight Holding founder, architect.
- [Repo identity v7+](project_repo_identity.md) — Two-layer: SIP substrate + reference.
- [Naming reconciliation](feedback_naming.md) — VOICES.md = SIP archetypes; agents/ = ops.

## Subsection

- [Wealth ledger](project_wealth_dpi.md) — DPI tracking + thesis engine.
'''


def test_extracts_four_lines(tmp_path: Path):
    mem = tmp_path / "MEMORY.md"
    mem.write_text(SAMPLE_MEMORY_MD, encoding="utf-8")

    atoms = list(extract_memory_md_atoms(project="testproj", memory_md_path=mem))
    assert len(atoms) == 4
    titles = [a["title"] for a in atoms]
    assert "Frank's role" in titles
    assert "Wealth ledger" in titles


def test_atom_carries_full_line_text(tmp_path: Path):
    mem = tmp_path / "MEMORY.md"
    mem.write_text(SAMPLE_MEMORY_MD, encoding="utf-8")

    atoms = list(extract_memory_md_atoms(project="testproj", memory_md_path=mem))
    first = atoms[0]
    assert "Starlight Holding founder" in first["text"]
    assert first["title"] == "Frank's role"
    assert first["file"] == "user_frank.md"


def test_skips_section_headers(tmp_path: Path):
    """Lines starting with `##` should not become atoms."""
    mem = tmp_path / "MEMORY.md"
    mem.write_text(SAMPLE_MEMORY_MD, encoding="utf-8")

    atoms = list(extract_memory_md_atoms(project="testproj", memory_md_path=mem))
    assert all(not a["text"].startswith("##") for a in atoms)


def test_extract_file_atom_returns_body(tmp_path: Path):
    f = tmp_path / "project_test.md"
    body = "Project X shipped 2026-05-03.\n\n## Why\nReason here."
    f.write_text(body, encoding="utf-8")

    atom = extract_file_atom(project="testproj", file_path=f)
    assert atom["text"] == body
    assert atom["file_type"] == "project"
```

- [ ] **Step 2: Implement atom_factory.py**

```python
# indexer/atom_factory.py
import re
from pathlib import Path
from typing import Iterator

_LINE_RE = re.compile(r"^\s*-\s*\[([^\]]+)\]\(([^)]+)\)\s*[—\-:]\s*(.+)$")

_FILE_TYPE_BY_PREFIX = {
    "user_": "user",
    "feedback_": "feedback",
    "project_": "project",
    "reference_": "reference",
    "decision_": "decision",
}


def extract_memory_md_atoms(*, project: str, memory_md_path: Path) -> Iterator[dict]:
    """Parse a MEMORY.md and yield one atom dict per `- [Title](file.md) — hook` line."""
    text = memory_md_path.read_text(encoding="utf-8", errors="replace")
    for raw_line in text.splitlines():
        m = _LINE_RE.match(raw_line)
        if not m:
            continue
        title, file_, hook = m.group(1).strip(), m.group(2).strip(), m.group(3).strip()
        yield {
            "project": project,
            "file": file_,
            "title": title,
            "hook": hook,
            "text": raw_line.strip(),  # full line for richer recall
        }


def extract_file_atom(*, project: str, file_path: Path) -> dict:
    """Read a `<type>_*.md` file and produce a content atom."""
    body = file_path.read_text(encoding="utf-8", errors="replace")
    file_type = "other"
    for prefix, name in _FILE_TYPE_BY_PREFIX.items():
        if file_path.name.startswith(prefix):
            file_type = name
            break
    return {
        "project": project,
        "file": file_path.name,
        "file_type": file_type,
        "text": body,
    }
```

- [ ] **Step 3: Run tests**

```bash
cd private/memory-bus && python -m pytest indexer/tests/test_atom_factory.py -v
```

Expected: 4 PASS.

## Task 4: Crawler (TDD)

**Files:**
- Create: `private/memory-bus/indexer/crawler.py`
- Create: `private/memory-bus/indexer/tests/test_crawler.py`

- [ ] **Step 1: Write failing tests using tmp_path-built project layout**

```python
# tests/test_crawler.py
from pathlib import Path
from indexer.crawler import find_project_memory_dirs, list_memory_files


def _build_fake_projects(root: Path):
    p1 = root / "ProjectA" / "memory"
    p1.mkdir(parents=True)
    (p1 / "MEMORY.md").write_text("- [a](b.md) — c", encoding="utf-8")
    (p1 / "user_frank.md").write_text("body", encoding="utf-8")
    (p1 / "session.jsonl").write_text("ignore", encoding="utf-8")  # NOT memory

    p2 = root / "ProjectB"
    p2.mkdir()
    # No memory subdir — should be skipped


def test_finds_only_dirs_with_memory(tmp_path: Path):
    _build_fake_projects(tmp_path)
    found = list(find_project_memory_dirs(claude_projects_root=tmp_path))
    assert len(found) == 1
    assert found[0].name == "memory"


def test_lists_only_md_files_in_memory(tmp_path: Path):
    _build_fake_projects(tmp_path)
    mem_dir = list(find_project_memory_dirs(claude_projects_root=tmp_path))[0]
    files = list(list_memory_files(mem_dir))
    names = {f.name for f in files}
    assert "MEMORY.md" in names
    assert "user_frank.md" in names
    assert "session.jsonl" not in names
```

- [ ] **Step 2: Implement crawler.py**

```python
# indexer/crawler.py
from pathlib import Path
from typing import Iterator

DEFAULT_CLAUDE_PROJECTS = Path.home() / ".claude" / "projects"


def find_project_memory_dirs(
    claude_projects_root: Path = DEFAULT_CLAUDE_PROJECTS,
) -> Iterator[Path]:
    """Yield each `<project>/memory/` directory under ~/.claude/projects/."""
    if not claude_projects_root.exists():
        return
    for project_dir in claude_projects_root.iterdir():
        if not project_dir.is_dir():
            continue
        mem = project_dir / "memory"
        if mem.is_dir():
            yield mem


def list_memory_files(memory_dir: Path) -> Iterator[Path]:
    """Yield `.md` files (only) directly under a project's memory/ directory."""
    for entry in memory_dir.iterdir():
        if entry.is_file() and entry.suffix.lower() == ".md":
            yield entry


def project_name_from_memory_dir(memory_dir: Path) -> str:
    """Extract a project slug from `<root>/<project>/memory/`."""
    # claude-code-style project keys look like "C--Users-frank-FrankX"
    raw = memory_dir.parent.name
    # Take the last token after `--` as the meaningful name
    if "--" in raw:
        return raw.rsplit("--", 1)[-1]
    return raw
```

- [ ] **Step 3: Run tests**

Expected: 2 PASS.

## Task 5: Bus client (subprocess JSON-RPC, TDD)

**Files:**
- Create: `private/memory-bus/indexer/bus_client.py`
- Create: `private/memory-bus/indexer/tests/test_bus_client.py`

- [ ] **Step 1: Write failing test**

```python
# tests/test_bus_client.py
import json
from indexer.bus_client import BusClient

def test_round_trip_via_subprocess(isolated_config):
    """Spawn server.py as subprocess, send tools/list, get 4 tools back."""
    client = BusClient()  # uses default server.py path
    try:
        client.start()
        resp = client.call({"jsonrpc": "2.0", "id": 1, "method": "tools/list"})
        names = {t["name"] for t in resp["result"]["tools"]}
        assert names == {"memory_commit", "memory_recall", "memory_health", "memory_audit_tail"}
    finally:
        client.stop()
```

- [ ] **Step 2: Implement bus_client.py**

```python
# indexer/bus_client.py
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

DEFAULT_SERVER_PATH = (
    Path(__file__).resolve().parents[1] / "server.py"
)


class BusClient:
    """Spawns server.py as a subprocess and pipes JSON-RPC requests over stdin.

    For indexer use only — the in-process MemoryBusServer is preferred for
    other callers but the indexer wants to validate the production-shape
    stdio path."""

    def __init__(self, server_path: Path = DEFAULT_SERVER_PATH):
        self._server_path = server_path
        self._proc: subprocess.Popen | None = None

    def start(self) -> None:
        self._proc = subprocess.Popen(
            [sys.executable, str(self._server_path)],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
        )

    def stop(self) -> None:
        if self._proc:
            try:
                self._proc.stdin.close()
                self._proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self._proc.kill()
            self._proc = None

    def call(self, req: dict[str, Any]) -> dict[str, Any]:
        assert self._proc is not None and self._proc.stdin and self._proc.stdout
        self._proc.stdin.write(json.dumps(req) + "\n")
        self._proc.stdin.flush()
        line = self._proc.stdout.readline()
        return json.loads(line)
```

- [ ] **Step 3: Run test (will need real subprocess — slow ~1s)**

Expected: 1 PASS.

## Task 6: Runner orchestration + idempotency (TDD)

**Files:**
- Create: `private/memory-bus/indexer/runner.py`
- Create: `private/memory-bus/indexer/tests/test_runner_idempotent.py`

- [ ] **Step 1: Write idempotency test**

```python
# tests/test_runner_idempotent.py
from pathlib import Path
from indexer.runner import IndexerRunner


def test_second_run_commits_zero_new(isolated_config, tmp_path: Path):
    # Build a fake claude-projects layout with one memory dir
    proj_root = tmp_path / "fake-projects"
    mem_dir = proj_root / "FakeProj" / "memory"
    mem_dir.mkdir(parents=True)
    (mem_dir / "MEMORY.md").write_text(
        "- [Test atom](file_test.md) — sample hook for indexer\n",
        encoding="utf-8",
    )
    (mem_dir / "file_test.md").write_text("body of file_test", encoding="utf-8")

    runner = IndexerRunner(claude_projects_root=proj_root)

    first = runner.run()
    assert first["committed"] >= 1

    second = runner.run()
    assert second["committed"] == 0
    assert second["skipped"] == first["committed"]
```

- [ ] **Step 2: Implement runner.py**

```python
# indexer/runner.py
"""Indexer orchestrator: crawl → extract → idempotency-check → commit."""
import json
from pathlib import Path
from typing import Any

from .atom_factory import extract_file_atom, extract_memory_md_atoms
from .bus_client import BusClient
from .crawler import (
    DEFAULT_CLAUDE_PROJECTS,
    find_project_memory_dirs,
    list_memory_files,
    project_name_from_memory_dir,
)
from .stable_id import atom_id

INDEXER_SOURCE = "/cross-repo-indexer#via=memory-bus#indexer"


class IndexerRunner:
    def __init__(self, claude_projects_root: Path = DEFAULT_CLAUDE_PROJECTS):
        self._root = claude_projects_root

    def run(self) -> dict[str, Any]:
        client = BusClient()
        client.start()
        try:
            return self._run_with_client(client)
        finally:
            client.stop()

    def _run_with_client(self, client: BusClient) -> dict[str, Any]:
        committed = 0
        skipped = 0
        errors: list[str] = []

        for mem_dir in find_project_memory_dirs(self._root):
            project = project_name_from_memory_dir(mem_dir)
            ns_prefix = f"cross-repo/{project.lower()}"

            # --- MEMORY.md line atoms ---
            mem_md = mem_dir / "MEMORY.md"
            if mem_md.exists():
                for atom in extract_memory_md_atoms(project=project, memory_md_path=mem_md):
                    aid = atom_id(project, atom["file"], atom["title"])
                    if self._already_committed(client, aid):
                        skipped += 1
                        continue
                    self._commit_atom(
                        client,
                        text=f"[{aid}] {atom['text']}",
                        namespace=f"{ns_prefix}/index",
                    )
                    committed += 1

            # --- File body atoms ---
            for f in list_memory_files(mem_dir):
                if f.name == "MEMORY.md":
                    continue
                file_atom = extract_file_atom(project=project, file_path=f)
                aid = atom_id(project, file_atom["file"], "<body>")
                if self._already_committed(client, aid):
                    skipped += 1
                    continue
                self._commit_atom(
                    client,
                    text=f"[{aid}] {file_atom['text'][:8000]}",  # cap body for embed
                    namespace=f"{ns_prefix}/{file_atom['file_type']}",
                )
                committed += 1

        return {"committed": committed, "skipped": skipped, "errors": errors}

    def _already_committed(self, client: BusClient, aid: str) -> bool:
        """Recall by stable ID marker; if we get a hit whose text starts with [aid],
        the atom is already in the substrate."""
        resp = client.call({
            "jsonrpc": "2.0", "id": 1, "method": "tools/call",
            "params": {"name": "memory_recall", "arguments": {"query": aid, "k": 1}},
        })
        if "result" not in resp:
            return False
        payload = json.loads(resp["result"]["content"][0]["text"])
        if not payload:
            return False
        return aid in payload[0]["text"]

    def _commit_atom(self, client: BusClient, *, text: str, namespace: str) -> None:
        resp = client.call({
            "jsonrpc": "2.0", "id": 2, "method": "tools/call",
            "params": {"name": "memory_commit", "arguments": {
                "text": text,
                "namespace": namespace,
                "source": INDEXER_SOURCE,
            }},
        })
        if "error" in resp:
            raise RuntimeError(f"commit failed: {resp['error']}")
```

- [ ] **Step 3: Run idempotency test**

Expected: PASS — first run commits ≥1, second run commits 0.

## Task 7: Attestation test (TDD)

**Files:**
- Create: `private/memory-bus/indexer/tests/test_runner_attestation.py`

- [ ] **Step 1: Write test**

```python
# tests/test_runner_attestation.py
from pathlib import Path
from indexer.runner import IndexerRunner

def test_indexer_traffic_stamped(isolated_config, tmp_path: Path):
    # Fake project layout
    mem = tmp_path / "Proj" / "memory"
    mem.mkdir(parents=True)
    (mem / "MEMORY.md").write_text("- [t](f.md) — h\n", encoding="utf-8")
    (mem / "f.md").write_text("body", encoding="utf-8")

    runner = IndexerRunner(claude_projects_root=tmp_path)
    runner.run()

    # Read audit log via Bus
    from server import MemoryBusServer
    bus = MemoryBusServer(config=isolated_config)
    resp = bus.handle({
        "jsonrpc": "2.0", "id": 1, "method": "tools/call",
        "params": {"name": "memory_audit_tail", "arguments": {"n": 50}},
    })
    import json
    rows = json.loads(resp["result"]["content"][0]["text"])
    commit_rows = [r for r in rows if r["op"] == "commit"]
    assert len(commit_rows) >= 1
    assert all("via=memory-bus#indexer" in r["source"] for r in commit_rows)
```

- [ ] **Step 2: Run test**

Expected: PASS.

## Task 8: CLI entry + Windows scheduled task

**Files:**
- Create: `private/memory-bus/indexer/__main__.py`
- Create: `scripts/run-cross-repo-indexer.ps1`

- [ ] **Step 1: __main__.py**

```python
# indexer/__main__.py
import argparse
import json
import sys

from .runner import IndexerRunner


def main():
    ap = argparse.ArgumentParser(description="Cross-repo memory indexer")
    ap.add_argument("--all", action="store_true", help="Crawl all ~/.claude/projects/")
    args = ap.parse_args()

    if not args.all:
        print("Pass --all to run the full crawl. (Future: --project <name>)", file=sys.stderr)
        sys.exit(2)

    runner = IndexerRunner()
    result = runner.run()
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: PowerShell launcher (UTF-8 BOM)**

```powershell
# scripts/run-cross-repo-indexer.ps1
$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path "$PSScriptRoot\..").Path
$indexer = Join-Path $repoRoot "private\memory-bus"
Set-Location $indexer
python -m indexer --all 2>&1 | Tee-Object -FilePath "$repoRoot\memory\_audit\indexer-runs.log" -Append
```

- [ ] **Step 3: Smoke run**

```bash
cd private/memory-bus && python -m indexer --all
```

Expected: JSON report `{"committed": ~800-1200, "skipped": 0, "errors": []}` on first run.

- [ ] **Step 4: Optionally schedule via Windows Task Scheduler (Frank's call)**

Powershell snippet (don't auto-execute — Frank decides cadence):

```powershell
$Action = New-ScheduledTaskAction -Execute "pwsh.exe" `
  -Argument "-NoProfile -File C:\Users\frank\Starlight-Intelligence-System\scripts\run-cross-repo-indexer.ps1"
$Trigger = New-ScheduledTaskTrigger -Daily -At 3am
Register-ScheduledTask -TaskName "CrossRepoMemoryIndexer" -Action $Action -Trigger $Trigger
```

## Task 9: First live run + verification

- [ ] **Step 1: Pre-flight `memory_health`**

Capture baseline `atom_count`.

- [ ] **Step 2: Run indexer**

```bash
cd private/memory-bus && python -m indexer --all > /tmp/indexer-run-1.json
```

- [ ] **Step 3: Post-flight `memory_health`**

Verify `atom_count` increased by amount matching `committed` from the JSON report.

- [ ] **Step 4: Spot-check with recall**

```
memory_recall("frankx voice rules", k=5)
```

Expect at least one hit with namespace starting `cross-repo/frankx/`.

- [ ] **Step 5: Idempotency proof**

Re-run indexer. Expect `{"committed": 0, "skipped": ~1100}`.

## Task 10: Handover + memory update

**Files:**
- Create: `docs/ops/HANDOVER-2026-05-04-indexer.md`
- Modify: auto-memory `MEMORY.md` index + new `project_cross_repo_indexer.md`

- [ ] Document atom-count delta, namespaces created, any errors, run time

---

## Self-review

**Spec coverage:**
- ✓ Crawl all `~/.claude/projects/*/memory/` — Tasks 4, 6
- ✓ Dual-granularity atoms (line + file) — Task 3
- ✓ Stable IDs — Task 2
- ✓ Idempotency — Task 6
- ✓ Bus-only writes — Task 5 (subprocess to server.py, no direct substrate import)
- ✓ Attestation stamping — Task 7
- ✓ Scheduled execution — Task 8

**Placeholder scan:** No "TBD"/"appropriate"/"similar to" — all code blocks complete.

**Type consistency:** `IndexerRunner.run() → dict[str, Any]`, `BusClient.call(req) → dict`, `extract_memory_md_atoms() → Iterator[dict]` — types stable across all task references.

---

## Out of scope (Phase 3 candidates)

| Item | Un-park trigger |
|------|----------------|
| Per-project incremental indexing (only re-index changed files) | First full-corpus run > 30 sec |
| Diff-aware updates (atom text changed but title stable → re-commit with same id) | False-positive idempotency hits in production |
| Cross-repo deletion handling (atom removed from source MEMORY.md → mark inactive) | First curation pass identifies stale atoms |
| Embedding upgrade (replace mempalace hashing-TF with real embeddings) | Recall@5 < 0.6 on graded 200-query corpus (matches Phase 1 trigger) |
| Frank's other repos beyond ~/.claude/projects/ (e.g., Arcanea source repo's docs/) | Frank requests broader corpus |

---

**Built on SIP — operational tier — 2026-05-04**
