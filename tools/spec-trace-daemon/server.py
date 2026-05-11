#!/usr/bin/env python3
"""Spec-Trace Daemon — local-only HTTP+SSE server for the cockpit page.

Operational-tier substrate for the Spec-Trace cockpit. Reads from
<repo>/docs/superpowers/specs/*.md (spec docs) and <repo>/memory/spec-trace/*.md
(sidecars), exposes a JSON API + SSE event stream over 127.0.0.1:7777.

Stdlib-only (no FastAPI/Flask). Uses http.server.ThreadingHTTPServer +
a custom handler. Watchdog is used opportunistically; falls back to
1s polling if watchdog is not installed.

Endpoints
---------
GET  /health
GET  /api/specs
GET  /api/spec/<spec-id>
GET  /api/spec/<spec-id>/raw
GET  /api/events                       (SSE)
POST /api/link-commit                  body: {sha, spec_id}
POST /api/init-spec                    body: {spec_id, title?, classification?}

Repo root resolution
--------------------
1. $SPEC_TRACE_REPO_ROOT (used by tests)
2. `git rev-parse --show-toplevel` from cwd
3. parent of this file's parent's parent (tools/spec-trace-daemon/ -> repo)

Phase 2 (queued behind /starlight-board): POST /api/dispatch will thread
Packet.spec_id via OrchestratorRouter. Not in this build.

Built on SIP — operational tier · 2026-05-11
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import logging
import os
import queue
import re
import shutil
import subprocess
import sys
import threading
import time
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import unquote, urlparse

__version__ = "0.1.0"

# ---------------------------------------------------------------------------
# Paths + repo discovery
# ---------------------------------------------------------------------------

ALLOWED_ORIGINS = frozenset({
    "http://localhost:3000",
    "https://starlightintelligence.org",
})


def repo_root() -> Path:
    """Return the SIS repo root.

    Order:
      1. $SPEC_TRACE_REPO_ROOT (test injection)
      2. git rev-parse --show-toplevel
      3. ../../ from this file
    """
    env = os.environ.get("SPEC_TRACE_REPO_ROOT")
    if env:
        return Path(env).resolve()
    try:
        out = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            capture_output=True,
            text=True,
            check=False,
            timeout=5,
        )
        if out.returncode == 0 and out.stdout.strip():
            return Path(out.stdout.strip()).resolve()
    except (OSError, subprocess.SubprocessError):
        pass
    return Path(__file__).resolve().parent.parent.parent


def canonical_dir(root: Path) -> Path:
    return root / "memory" / "spec-trace"


def specs_dir(root: Path) -> Path:
    return root / "docs" / "superpowers" / "specs"


def routing_log_path(root: Path) -> Path:
    return root / "private" / "voice-operator" / "logs" / "routing.jsonl"


def project_slug(repo_path: Path) -> str:
    """Mirror tools/spec-trace.py's project_slug exactly.

    Replace ':', '/', '\\' all with '-'. Leading '-' stripped.
    """
    raw = str(repo_path.resolve())
    slug = raw.replace(":", "-").replace("\\", "-").replace("/", "-")
    return slug.lstrip("-")


def indexed_dir_for(repo_path: Path) -> Path:
    home = Path(os.environ.get("USERPROFILE") or os.environ.get("HOME") or ".")
    return home / ".claude" / "projects" / project_slug(repo_path) / "memory"


def iso_now() -> str:
    return dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# ---------------------------------------------------------------------------
# Frontmatter parsing — minimal YAML reader (no PyYAML dependency)
# ---------------------------------------------------------------------------

_FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)


def parse_frontmatter(text: str) -> tuple[dict[str, Any], str]:
    """Parse the first ``---`` block in *text*.

    Returns (front_dict, body_after_frontmatter). Supports:
      - scalar key: value
      - list key:  (lines starting with ``  - `` are appended)
      - block scalar key: | (single-line; multi-line preserved as raw)

    Quotes are stripped if balanced single or double.
    """
    m = _FRONTMATTER_RE.match(text)
    if not m:
        return {}, text

    raw = m.group(1)
    body = text[m.end():]
    front: dict[str, Any] = {}

    current_key: str | None = None
    for raw_line in raw.splitlines():
        # List continuation
        if raw_line.startswith("  - ") or raw_line.startswith("- "):
            value = raw_line.split("- ", 1)[1].strip()
            if current_key is None:
                continue
            existing = front.get(current_key)
            if isinstance(existing, list):
                existing.append(value)
            else:
                front[current_key] = [value] if existing in (None, "") else [existing, value]
            continue

        if not raw_line.strip():
            current_key = None
            continue

        if ":" in raw_line:
            key, _, val = raw_line.partition(":")
            key = key.strip()
            val = val.strip()
            if not val:
                # Could be the start of a list; record key with empty placeholder
                front[key] = ""
                current_key = key
                continue
            if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                val = val[1:-1]
            front[key] = val
            current_key = key
    return front, body


# ---------------------------------------------------------------------------
# Sidecar operations — mirror tools/spec-trace.py invariants
# ---------------------------------------------------------------------------


def _seed_sidecar(
    root: Path,
    spec_id: str,
    title: str | None = None,
    classification: str | None = None,
) -> Path:
    """Create a fresh sidecar (idempotent — never clobbers existing)."""
    spec_doc = specs_dir(root) / f"{spec_id}.md"
    spec_path_rel = (
        f"docs/superpowers/specs/{spec_id}.md" if spec_doc.exists() else "UNRESOLVED"
    )
    cdir = canonical_dir(root)
    cdir.mkdir(parents=True, exist_ok=True)
    path = cdir / f"{spec_id}.md"
    if path.exists():
        return path

    cls = classification or "operational"
    front_lines = [
        f"spec_id: {spec_id}",
        f"spec_path: {spec_path_rel}",
        f"created: {iso_now()}",
        f"classification: {cls}",
        "board_verdict: none",
        "board_verdict_at: null",
        f"project: {root.name}",
        f"repo_root: {root.resolve().as_posix()}",
    ]
    if title:
        front_lines.insert(0, f"title: {title}")

    body = (
        "---\n"
        + "\n".join(front_lines)
        + "\n---\n\n"
        "## Dispatches\n\n"
        "## Commits\n\n"
        "## PRs\n\n"
        "## Notes\n\n"
    )
    path.write_text(body, encoding="utf-8")
    return path


def link_commit_to_sidecar(
    root: Path,
    sha: str,
    spec_id: str,
    *,
    branch: str | None = None,
    subject: str | None = None,
) -> tuple[bool, str]:
    """Append a commit row to the spec sidecar.

    Returns (changed, message). ``changed=False`` if the short-sha was already
    present (idempotent). Never clobbers existing content.
    """
    if not sha:
        return False, "empty sha"
    path = _seed_sidecar(root, spec_id)
    short_sha = sha[:7]
    current = path.read_text(encoding="utf-8", errors="replace")
    if f"`{short_sha}`" in current or f"`{sha}`" in current:
        return False, f"already linked: {short_sha} -> {spec_id}"

    full_sha = sha
    resolved_branch = branch or "?"
    resolved_subject = subject or "(manual link via daemon)"

    # Try git for richer metadata if not supplied
    if branch is None or subject is None:
        try:
            info = subprocess.run(
                ["git", "-C", str(root), "show", "-s", "--format=%H%n%D%n%s", sha],
                capture_output=True,
                text=True,
                check=False,
                timeout=5,
            )
            if info.returncode == 0:
                lines = info.stdout.strip().split("\n", 2)
                if lines:
                    full_sha = lines[0] or sha
                if len(lines) > 1 and lines[1] and branch is None:
                    resolved_branch = lines[1].split(",")[0].strip() or "?"
                if len(lines) > 2 and lines[2] and subject is None:
                    resolved_subject = lines[2]
        except (OSError, subprocess.SubprocessError):
            pass

    line = f"- {iso_now()} · `{full_sha}` · `{resolved_branch}` · {resolved_subject}"
    if "## Commits" in current:
        new = current.replace("## Commits\n", f"## Commits\n{line}\n", 1)
    else:
        new = current.rstrip() + f"\n\n## Commits\n{line}\n"
    path.write_text(new, encoding="utf-8")

    idx_path = indexed_dir_for(root) / f"spec-trace_{spec_id}.md"
    if idx_path.parent.exists():
        try:
            shutil.copyfile(path, idx_path)
        except OSError:
            pass

    return True, f"linked {short_sha} -> {spec_id}"


# ---------------------------------------------------------------------------
# Spec / sidecar projection
# ---------------------------------------------------------------------------


def _is_sidecar_filename(name: str) -> bool:
    return name != "README.md" and bool(re.match(r"\d{4}-.+\.md$", name))


def list_specs_projection(root: Path) -> list[dict[str, Any]]:
    """Return one row per spec doc, joined with sidecar status."""
    sdir = specs_dir(root)
    cdir = canonical_dir(root)

    sidecar_map: dict[str, Path] = {}
    if cdir.exists():
        for p in cdir.glob("*.md"):
            if _is_sidecar_filename(p.name):
                sidecar_map[p.stem] = p

    rows: list[dict[str, Any]] = []
    if sdir.exists():
        for p in sorted(sdir.glob("*.md")):
            spec_id = p.stem
            try:
                text = p.read_text(encoding="utf-8", errors="replace")
            except OSError:
                text = ""
            fm, _ = parse_frontmatter(text)
            sidecar = sidecar_map.pop(spec_id, None)
            commits = 0
            classification = fm.get("classification")
            verdict = None
            if sidecar is not None:
                try:
                    side_text = sidecar.read_text(encoding="utf-8", errors="replace")
                except OSError:
                    side_text = ""
                commits = len(re.findall(r"^- \d{4}-\d{2}-\d{2}T", side_text, re.MULTILINE))
                side_fm, _ = parse_frontmatter(side_text)
                classification = side_fm.get("classification") or classification
                verdict = side_fm.get("board_verdict")
            indexed_present = (indexed_dir_for(root) / f"spec-trace_{spec_id}.md").exists()
            rows.append({
                "spec_id": spec_id,
                "title": fm.get("title"),
                "status": fm.get("status"),
                "tier": fm.get("tier"),
                "date": fm.get("date"),
                "classification": classification,
                "board_verdict": verdict,
                "has_sidecar": sidecar is not None,
                "commits": commits,
                "indexed": indexed_present,
                "spec_path": str(p.relative_to(root)).replace("\\", "/"),
            })

    # Orphan sidecars (sidecar exists but spec doc missing)
    for spec_id, sidecar in sorted(sidecar_map.items()):
        try:
            side_text = sidecar.read_text(encoding="utf-8", errors="replace")
        except OSError:
            side_text = ""
        side_fm, _ = parse_frontmatter(side_text)
        commits = len(re.findall(r"^- \d{4}-\d{2}-\d{2}T", side_text, re.MULTILINE))
        rows.append({
            "spec_id": spec_id,
            "title": None,
            "status": None,
            "tier": None,
            "date": None,
            "classification": side_fm.get("classification"),
            "board_verdict": side_fm.get("board_verdict"),
            "has_sidecar": True,
            "commits": commits,
            "indexed": (indexed_dir_for(root) / f"spec-trace_{spec_id}.md").exists(),
            "spec_path": None,
            "orphan_sidecar": True,
        })
    return rows


_EVENT_LINE_RE = re.compile(
    r"^- (?P<ts>\d{4}-\d{2}-\d{2}T[^\s]+Z)\s*·?\s*`(?P<sha>[^`]+)`\s*·?\s*`(?P<branch>[^`]+)`\s*·?\s*(?P<subject>.+)$"
)


def _parse_section(text: str, section: str) -> list[dict[str, str]]:
    pattern = rf"^## {re.escape(section)}\s*\n(.*?)(?=^## |\Z)"
    m = re.search(pattern, text, re.MULTILINE | re.DOTALL)
    if not m:
        return []
    body = m.group(1)
    events: list[dict[str, str]] = []
    for line in body.splitlines():
        line = line.rstrip()
        if not line.startswith("- "):
            continue
        em = _EVENT_LINE_RE.match(line)
        if em:
            events.append({
                "timestamp": em.group("ts"),
                "sha": em.group("sha"),
                "branch": em.group("branch"),
                "subject": em.group("subject"),
                "raw": line,
            })
        else:
            events.append({"raw": line})
    return events


def get_spec_projection(root: Path, spec_id: str) -> dict[str, Any] | None:
    """Return spec doc + sidecar joined view, or None if neither exists."""
    spec_path = specs_dir(root) / f"{spec_id}.md"
    sidecar_path = canonical_dir(root) / f"{spec_id}.md"

    spec_text = None
    spec_fm: dict[str, Any] = {}
    spec_body = ""
    if spec_path.exists():
        spec_text = spec_path.read_text(encoding="utf-8", errors="replace")
        spec_fm, spec_body = parse_frontmatter(spec_text)

    sidecar_text = None
    sidecar_fm: dict[str, Any] = {}
    dispatches: list[dict[str, str]] = []
    commits: list[dict[str, str]] = []
    prs: list[dict[str, str]] = []
    if sidecar_path.exists():
        sidecar_text = sidecar_path.read_text(encoding="utf-8", errors="replace")
        sidecar_fm, _ = parse_frontmatter(sidecar_text)
        dispatches = _parse_section(sidecar_text, "Dispatches")
        commits = _parse_section(sidecar_text, "Commits")
        prs = _parse_section(sidecar_text, "PRs")

    if spec_text is None and sidecar_text is None:
        return None

    return {
        "spec_id": spec_id,
        "spec": {
            "exists": spec_text is not None,
            "frontmatter": spec_fm,
            "body": spec_body,
            "path": (
                str(spec_path.relative_to(root)).replace("\\", "/")
                if spec_text is not None
                else None
            ),
        },
        "sidecar": {
            "exists": sidecar_text is not None,
            "frontmatter": sidecar_fm,
            "raw": sidecar_text,
            "path": (
                str(sidecar_path.relative_to(root)).replace("\\", "/")
                if sidecar_text is not None
                else None
            ),
        },
        "events": {
            "dispatches": dispatches,
            "commits": commits,
            "prs": prs,
        },
        "indexed": (indexed_dir_for(root) / f"spec-trace_{spec_id}.md").exists(),
    }


# ---------------------------------------------------------------------------
# File watcher — pluggable backend (watchdog if present, polling fallback)
# ---------------------------------------------------------------------------


class EventBroadcaster:
    """Fan-out registry for SSE subscribers.

    Each subscriber gets a thread-safe queue. ``publish`` is non-blocking;
    full queues drop the event (slow consumer protection).
    """

    def __init__(self) -> None:
        self._subs: list[queue.Queue[str]] = []
        self._lock = threading.Lock()

    def subscribe(self) -> queue.Queue[str]:
        q: queue.Queue[str] = queue.Queue(maxsize=256)
        with self._lock:
            self._subs.append(q)
        return q

    def unsubscribe(self, q: queue.Queue[str]) -> None:
        with self._lock:
            try:
                self._subs.remove(q)
            except ValueError:
                pass

    def publish(self, event_type: str, payload: dict[str, Any]) -> None:
        msg = json.dumps({"type": event_type, "at": iso_now(), **payload}, default=str)
        with self._lock:
            subs = list(self._subs)
        for q in subs:
            try:
                q.put_nowait(msg)
            except queue.Full:
                pass


class PollingWatcher(threading.Thread):
    """Polls a set of paths every ``interval`` seconds. Stdlib only.

    Publishes ``file.changed`` when any sidecar mtime changes, and
    ``routing.appended`` when the routing log grows.
    """

    def __init__(
        self,
        root: Path,
        broadcaster: EventBroadcaster,
        *,
        interval: float = 1.0,
    ) -> None:
        super().__init__(daemon=True, name="spec-trace-poller")
        self._root = root
        self._broadcaster = broadcaster
        self._interval = interval
        self._stop = threading.Event()
        self._sidecar_mtimes: dict[str, float] = {}
        self._routing_size: int = 0
        self._seeded: bool = False

    def stop(self) -> None:
        self._stop.set()

    def _scan_sidecars(self) -> None:
        cdir = canonical_dir(self._root)
        seen: dict[str, float] = {}
        if cdir.exists():
            for p in cdir.glob("*.md"):
                if not _is_sidecar_filename(p.name):
                    continue
                try:
                    mtime = p.stat().st_mtime
                except OSError:
                    continue
                seen[p.name] = mtime
                if not self._seeded:
                    continue
                prev = self._sidecar_mtimes.get(p.name)
                if prev is None:
                    self._broadcaster.publish(
                        "sidecar.created",
                        {"spec_id": p.stem, "path": p.name},
                    )
                elif mtime > prev:
                    self._broadcaster.publish(
                        "sidecar.changed",
                        {"spec_id": p.stem, "path": p.name},
                    )
        # Detect deletions (only after the first seed scan)
        if self._seeded:
            for name in set(self._sidecar_mtimes) - set(seen):
                self._broadcaster.publish("sidecar.deleted", {"path": name})
        self._sidecar_mtimes = seen

    def _scan_routing(self) -> None:
        path = routing_log_path(self._root)
        if not path.exists():
            return
        try:
            size = path.stat().st_size
        except OSError:
            return
        if self._routing_size == 0:
            self._routing_size = size
            return
        if size > self._routing_size:
            self._broadcaster.publish(
                "routing.appended",
                {"bytes_added": size - self._routing_size},
            )
            self._routing_size = size
        elif size < self._routing_size:
            # log was rotated/truncated
            self._routing_size = size

    def run(self) -> None:
        # Seed initial state without firing events
        self._scan_sidecars()
        self._scan_routing()
        self._seeded = True
        while not self._stop.is_set():
            try:
                self._scan_sidecars()
                self._scan_routing()
            except Exception:
                logging.getLogger("spec-trace-daemon").exception(
                    "polling watcher tick failed"
                )
            self._stop.wait(self._interval)


# ---------------------------------------------------------------------------
# HTTP handler
# ---------------------------------------------------------------------------


class SpecTraceHandler(BaseHTTPRequestHandler):
    server_version = f"spec-trace-daemon/{__version__}"
    sys_version = ""  # suppress Python/3.x.x in Server header

    # Injected by ``serve``:
    broadcaster: EventBroadcaster
    repo_root_path: Path
    logger: logging.Logger

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    def log_message(self, format: str, *args: Any) -> None:  # noqa: A002
        self.logger.info("%s - %s", self.address_string(), format % args)

    # ------------------------------------------------------------------
    # CORS helpers
    # ------------------------------------------------------------------

    def _origin_allowed(self, origin: str | None) -> bool:
        if not origin:
            return True  # same-origin / non-browser client
        return origin in ALLOWED_ORIGINS

    def _send_cors_headers(self, origin: str | None) -> None:
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header(
                "Access-Control-Allow-Headers",
                "Content-Type, Accept, Cache-Control",
            )
            self.send_header("Access-Control-Max-Age", "600")

    def _reject_cors(self, origin: str | None) -> None:
        self.send_response(HTTPStatus.FORBIDDEN)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        body = json.dumps({
            "error": "cors_origin_rejected",
            "origin": origin,
            "allowed": sorted(ALLOWED_ORIGINS),
        })
        self.wfile.write(body.encode("utf-8"))

    # ------------------------------------------------------------------
    # Response helpers
    # ------------------------------------------------------------------

    def _json(self, status: int, payload: Any) -> None:
        origin = self.headers.get("Origin")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._send_cors_headers(origin)
        body = json.dumps(payload, default=str, ensure_ascii=False).encode("utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _text(self, status: int, body: str, content_type: str = "text/plain; charset=utf-8") -> None:
        origin = self.headers.get("Origin")
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self._send_cors_headers(origin)
        encoded = body.encode("utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def _read_json_body(self) -> dict[str, Any] | None:
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0:
            return {}
        raw = self.rfile.read(length)
        try:
            data = json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            return None
        if not isinstance(data, dict):
            return None
        return data

    # ------------------------------------------------------------------
    # Method dispatch
    # ------------------------------------------------------------------

    def do_OPTIONS(self) -> None:  # noqa: N802
        origin = self.headers.get("Origin")
        if not self._origin_allowed(origin):
            self._reject_cors(origin)
            return
        self.send_response(HTTPStatus.NO_CONTENT)
        self._send_cors_headers(origin)
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        origin = self.headers.get("Origin")
        if not self._origin_allowed(origin):
            self._reject_cors(origin)
            return
        parsed = urlparse(self.path)
        path = parsed.path

        try:
            if path == "/health":
                return self._json(200, {
                    "server": "spec-trace-daemon",
                    "version": __version__,
                    "attestation": "Built on SIP",
                    "repo_root": str(self.repo_root_path),
                })
            if path == "/api/specs":
                return self._json(200, {"specs": list_specs_projection(self.repo_root_path)})
            if path == "/api/events":
                return self._stream_events(origin)
            m = re.match(r"^/api/spec/([^/]+)/raw/?$", path)
            if m:
                return self._serve_spec_raw(unquote(m.group(1)))
            m = re.match(r"^/api/spec/([^/]+)/?$", path)
            if m:
                return self._serve_spec(unquote(m.group(1)))
        except Exception:
            self.logger.exception("GET %s failed", path)
            return self._json(500, {"error": "internal", "path": path})

        return self._json(404, {"error": "not_found", "path": path})

    def do_POST(self) -> None:  # noqa: N802
        origin = self.headers.get("Origin")
        if not self._origin_allowed(origin):
            self._reject_cors(origin)
            return
        parsed = urlparse(self.path)
        path = parsed.path
        try:
            if path == "/api/link-commit":
                return self._handle_link_commit()
            if path == "/api/init-spec":
                return self._handle_init_spec()
        except Exception:
            self.logger.exception("POST %s failed", path)
            return self._json(500, {"error": "internal", "path": path})
        return self._json(404, {"error": "not_found", "path": path})

    # ------------------------------------------------------------------
    # Route implementations
    # ------------------------------------------------------------------

    def _serve_spec(self, spec_id: str) -> None:
        proj = get_spec_projection(self.repo_root_path, spec_id)
        if proj is None:
            return self._json(404, {"error": "spec_not_found", "spec_id": spec_id})
        return self._json(200, proj)

    def _serve_spec_raw(self, spec_id: str) -> None:
        spec_path = specs_dir(self.repo_root_path) / f"{spec_id}.md"
        if not spec_path.exists():
            return self._json(404, {"error": "spec_not_found", "spec_id": spec_id})
        text = spec_path.read_text(encoding="utf-8", errors="replace")
        return self._text(200, text, content_type="text/markdown; charset=utf-8")

    def _handle_link_commit(self) -> None:
        body = self._read_json_body()
        if body is None:
            return self._json(400, {"error": "invalid_json"})
        sha = (body.get("sha") or "").strip()
        spec_id = (body.get("spec_id") or "").strip()
        if not sha or not spec_id:
            return self._json(400, {"error": "missing_fields", "required": ["sha", "spec_id"]})
        changed, msg = link_commit_to_sidecar(
            self.repo_root_path,
            sha,
            spec_id,
            branch=body.get("branch"),
            subject=body.get("subject"),
        )
        self.broadcaster.publish(
            "commit.linked",
            {"spec_id": spec_id, "sha": sha[:7], "changed": changed},
        )
        return self._json(200, {"changed": changed, "message": msg, "spec_id": spec_id, "sha": sha[:7]})

    def _handle_init_spec(self) -> None:
        body = self._read_json_body()
        if body is None:
            return self._json(400, {"error": "invalid_json"})
        spec_id = (body.get("spec_id") or "").strip()
        if not spec_id:
            return self._json(400, {"error": "missing_fields", "required": ["spec_id"]})
        title = body.get("title")
        classification = body.get("classification")
        path = _seed_sidecar(self.repo_root_path, spec_id, title=title, classification=classification)
        rel = str(path.relative_to(self.repo_root_path)).replace("\\", "/")
        self.broadcaster.publish("sidecar.created", {"spec_id": spec_id, "path": path.name})
        return self._json(200, {"spec_id": spec_id, "path": rel, "created": iso_now()})

    def _stream_events(self, origin: str | None) -> None:
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache, no-transform")
        self.send_header("Connection", "keep-alive")
        self.send_header("X-Accel-Buffering", "no")
        self._send_cors_headers(origin)
        self.end_headers()

        # Disable Nagle for prompt delivery
        try:
            self.connection.setsockopt(  # type: ignore[attr-defined]
                __import__("socket").IPPROTO_TCP,
                __import__("socket").TCP_NODELAY,
                1,
            )
        except OSError:
            pass

        q = self.broadcaster.subscribe()
        try:
            # Initial hello event so clients can verify connectivity
            hello = json.dumps({"type": "hello", "at": iso_now(), "version": __version__})
            self.wfile.write(f"event: hello\ndata: {hello}\n\n".encode("utf-8"))
            self.wfile.flush()

            keepalive = time.time()
            while True:
                try:
                    msg = q.get(timeout=1.0)
                except queue.Empty:
                    msg = None

                if msg is not None:
                    try:
                        evt_type = json.loads(msg).get("type", "message")
                    except json.JSONDecodeError:
                        evt_type = "message"
                    try:
                        self.wfile.write(f"event: {evt_type}\ndata: {msg}\n\n".encode("utf-8"))
                        self.wfile.flush()
                    except (BrokenPipeError, ConnectionResetError, OSError):
                        return

                # 15s keepalive comment
                if time.time() - keepalive >= 15.0:
                    try:
                        self.wfile.write(b": keepalive\n\n")
                        self.wfile.flush()
                    except (BrokenPipeError, ConnectionResetError, OSError):
                        return
                    keepalive = time.time()
        finally:
            self.broadcaster.unsubscribe(q)


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------


def _configure_logger(log_path: Path) -> logging.Logger:
    log_path.parent.mkdir(parents=True, exist_ok=True)
    logger = logging.getLogger("spec-trace-daemon")
    logger.setLevel(logging.INFO)
    # Idempotent: clear pre-existing handlers if reconfigured
    for h in list(logger.handlers):
        logger.removeHandler(h)
    fmt = logging.Formatter(
        "%(asctime)s.%(msecs)03dZ %(levelname)s %(name)s - %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
    )
    fmt.converter = time.gmtime
    fh = logging.FileHandler(log_path, encoding="utf-8")
    fh.setFormatter(fmt)
    sh = logging.StreamHandler(sys.stdout)
    sh.setFormatter(fmt)
    logger.addHandler(fh)
    logger.addHandler(sh)
    logger.propagate = False
    return logger


# ---------------------------------------------------------------------------
# Server bootstrap
# ---------------------------------------------------------------------------


def make_server(
    host: str = "127.0.0.1",
    port: int = 7777,
    *,
    root: Path | None = None,
    logger: logging.Logger | None = None,
    broadcaster: EventBroadcaster | None = None,
) -> tuple[ThreadingHTTPServer, EventBroadcaster, PollingWatcher]:
    """Build (but do not start) the HTTP server, broadcaster, and watcher."""
    resolved_root = (root or repo_root()).resolve()
    log_dir = Path(__file__).resolve().parent / "logs"
    resolved_logger = logger or _configure_logger(log_dir / "server.log")
    resolved_broadcaster = broadcaster or EventBroadcaster()

    handler_logger = resolved_logger
    handler_root = resolved_root
    handler_broadcaster = resolved_broadcaster

    class _BoundHandler(SpecTraceHandler):
        pass

    _BoundHandler.logger = handler_logger
    _BoundHandler.repo_root_path = handler_root
    _BoundHandler.broadcaster = handler_broadcaster

    server = ThreadingHTTPServer((host, port), _BoundHandler)
    watcher = PollingWatcher(resolved_root, resolved_broadcaster)
    return server, resolved_broadcaster, watcher


def serve(host: str = "127.0.0.1", port: int = 7777) -> None:
    server, broadcaster, watcher = make_server(host=host, port=port)
    logger = logging.getLogger("spec-trace-daemon")
    # make_server() returns a server bound to a _BoundHandler subclass which
    # carries the concrete repo_root_path. SpecTraceHandler itself only has the
    # type annotation, not the value — reading off the base class throws.
    bound_root = getattr(server.RequestHandlerClass, "repo_root_path", "unknown")
    logger.info(
        "spec-trace-daemon v%s listening on http://%s:%d (repo=%s)",
        __version__,
        host,
        port,
        bound_root,
    )
    watcher.start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logger.info("shutdown requested")
    finally:
        watcher.stop()
        server.shutdown()
        server.server_close()
        logger.info("spec-trace-daemon stopped")


def main(argv: Iterable[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="spec-trace-daemon", description=__doc__)
    p.add_argument("--host", default="127.0.0.1")
    p.add_argument("--port", type=int, default=7777)
    args = p.parse_args(list(argv) if argv is not None else None)
    serve(host=args.host, port=args.port)
    return 0


if __name__ == "__main__":
    sys.exit(main())
