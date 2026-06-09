"""Integration tests for the Spec-Trace daemon.

All tests construct an isolated repo via ``tmp_path`` and bind to an ephemeral
port (port 0) on 127.0.0.1. No real network access; no writes outside tmp_path.

Built on SIP — operational tier · 2026-05-11
"""

from __future__ import annotations

import http.client
import json
import os
import threading
import time
from pathlib import Path
from typing import Generator

import pytest

import server as srv


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def fake_repo(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    """Build a minimal SIS-shaped repo under tmp_path."""
    (tmp_path / "docs" / "superpowers" / "specs").mkdir(parents=True)
    (tmp_path / "memory" / "spec-trace").mkdir(parents=True)
    # Isolate the indexed-copy dir under tmp_path/home
    home = tmp_path / "home"
    home.mkdir()
    monkeypatch.setenv("SPEC_TRACE_REPO_ROOT", str(tmp_path))
    monkeypatch.setenv("USERPROFILE", str(home))
    monkeypatch.setenv("HOME", str(home))
    return tmp_path


@pytest.fixture
def seed_spec(fake_repo: Path) -> str:
    """Write a representative spec doc + a matching sidecar."""
    spec_id = "2026-05-11-example-design"
    spec_path = fake_repo / "docs" / "superpowers" / "specs" / f"{spec_id}.md"
    spec_path.write_text(
        "---\n"
        "title: Example Design\n"
        "status: DESIGN\n"
        "tier: operational\n"
        "date: 2026-05-11\n"
        "author: starlight-architect\n"
        "---\n\n"
        "# Example Design\n\n"
        "Body paragraph.\n",
        encoding="utf-8",
    )
    sidecar = fake_repo / "memory" / "spec-trace" / f"{spec_id}.md"
    sidecar.write_text(
        "---\n"
        f"spec_id: {spec_id}\n"
        f"spec_path: docs/superpowers/specs/{spec_id}.md\n"
        "created: 2026-05-11T14:27:11Z\n"
        "classification: operational\n"
        "board_verdict: none\n"
        "board_verdict_at: null\n"
        "project: test-repo\n"
        "repo_root: /tmp/test\n"
        "---\n\n"
        "## Dispatches\n\n"
        "## Commits\n"
        "- 2026-05-11T14:31:33Z · `abc1234` · `main` · seed commit\n\n"
        "## PRs\n\n"
        "## Notes\n\n",
        encoding="utf-8",
    )
    return spec_id


@pytest.fixture
def running_server(
    fake_repo: Path,
) -> Generator[tuple[srv.ThreadingHTTPServer, srv.EventBroadcaster, int], None, None]:
    """Start the daemon on an ephemeral port in a background thread."""
    server, broadcaster, watcher = srv.make_server(
        host="127.0.0.1",
        port=0,
        root=fake_repo,
    )
    port = server.server_address[1]
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    watcher.start()
    try:
        yield server, broadcaster, port
    finally:
        watcher.stop()
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


def _request(
    method: str,
    port: int,
    path: str,
    *,
    body: dict | None = None,
    headers: dict | None = None,
) -> tuple[int, dict, bytes]:
    conn = http.client.HTTPConnection("127.0.0.1", port, timeout=5)
    hdrs = {"Accept": "application/json"}
    payload = None
    if body is not None:
        payload = json.dumps(body).encode("utf-8")
        hdrs["Content-Type"] = "application/json"
        hdrs["Content-Length"] = str(len(payload))
    if headers:
        hdrs.update(headers)
    conn.request(method, path, body=payload, headers=hdrs)
    resp = conn.getresponse()
    raw = resp.read()
    return resp.status, dict(resp.getheaders()), raw


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


def test_health_endpoint(running_server):
    _server, _broadcaster, port = running_server
    status, headers, raw = _request("GET", port, "/health")
    assert status == 200
    payload = json.loads(raw)
    assert payload["server"] == "spec-trace-daemon"
    assert payload["version"] == srv.__version__
    assert payload["attestation"] == "Built on SIP"
    assert headers["Content-Type"].startswith("application/json")


def test_list_specs_returns_docs_specs(running_server, seed_spec):
    _server, _broadcaster, port = running_server
    status, _h, raw = _request("GET", port, "/api/specs")
    assert status == 200
    payload = json.loads(raw)
    ids = {s["spec_id"] for s in payload["specs"]}
    assert seed_spec in ids
    row = next(s for s in payload["specs"] if s["spec_id"] == seed_spec)
    assert row["has_sidecar"] is True
    assert row["commits"] == 1
    assert row["title"] == "Example Design"
    assert row["status"] == "DESIGN"
    assert row["spec_path"] == f"docs/superpowers/specs/{seed_spec}.md"


def test_list_specs_empty_repo(running_server):
    _server, _broadcaster, port = running_server
    status, _h, raw = _request("GET", port, "/api/specs")
    assert status == 200
    payload = json.loads(raw)
    assert payload == {"specs": []}


def test_get_spec_includes_sidecar_when_present(running_server, seed_spec):
    _server, _broadcaster, port = running_server
    status, _h, raw = _request("GET", port, f"/api/spec/{seed_spec}")
    assert status == 200
    payload = json.loads(raw)
    assert payload["spec_id"] == seed_spec
    assert payload["spec"]["exists"] is True
    assert payload["spec"]["frontmatter"]["title"] == "Example Design"
    assert payload["sidecar"]["exists"] is True
    assert payload["sidecar"]["frontmatter"]["classification"] == "operational"
    commits = payload["events"]["commits"]
    assert len(commits) == 1
    assert commits[0]["sha"] == "abc1234"
    assert commits[0]["branch"] == "main"
    assert commits[0]["subject"] == "seed commit"


def test_get_spec_404_when_unknown(running_server):
    _server, _broadcaster, port = running_server
    status, _h, raw = _request("GET", port, "/api/spec/2099-99-99-nope")
    assert status == 404
    payload = json.loads(raw)
    assert payload["error"] == "spec_not_found"


def test_get_spec_raw_returns_markdown(running_server, seed_spec):
    _server, _broadcaster, port = running_server
    status, headers, raw = _request("GET", port, f"/api/spec/{seed_spec}/raw")
    assert status == 200
    assert headers["Content-Type"].startswith("text/markdown")
    assert b"# Example Design" in raw
    assert b"title: Example Design" in raw


def test_link_commit_appends_to_sidecar(running_server, seed_spec, fake_repo):
    _server, _broadcaster, port = running_server
    status, _h, raw = _request(
        "POST",
        port,
        "/api/link-commit",
        body={
            "sha": "deadbeefcafefeed",
            "spec_id": seed_spec,
            "branch": "feature/x",
            "subject": "test(daemon): link via API",
        },
    )
    assert status == 200
    payload = json.loads(raw)
    assert payload["changed"] is True
    assert payload["sha"] == "deadbee"
    sidecar = (fake_repo / "memory" / "spec-trace" / f"{seed_spec}.md").read_text(encoding="utf-8")
    assert "`deadbeefcafefeed`" in sidecar
    assert "feature/x" in sidecar
    assert "test(daemon): link via API" in sidecar

    # Idempotent — second call should report changed=False
    status2, _h2, raw2 = _request(
        "POST",
        port,
        "/api/link-commit",
        body={"sha": "deadbeefcafefeed", "spec_id": seed_spec},
    )
    assert status2 == 200
    assert json.loads(raw2)["changed"] is False


def test_link_commit_missing_fields_returns_400(running_server):
    _server, _broadcaster, port = running_server
    status, _h, raw = _request("POST", port, "/api/link-commit", body={"sha": "abc"})
    assert status == 400
    assert json.loads(raw)["error"] == "missing_fields"


def test_init_spec_creates_sidecar_with_frontmatter(running_server, fake_repo):
    _server, _broadcaster, port = running_server
    spec_id = "2026-05-11-init-test"
    status, _h, raw = _request(
        "POST",
        port,
        "/api/init-spec",
        body={
            "spec_id": spec_id,
            "title": "Init Test",
            "classification": "operational",
        },
    )
    assert status == 200
    payload = json.loads(raw)
    assert payload["spec_id"] == spec_id
    assert payload["path"] == f"memory/spec-trace/{spec_id}.md"

    sidecar_path = fake_repo / "memory" / "spec-trace" / f"{spec_id}.md"
    assert sidecar_path.exists()
    text = sidecar_path.read_text(encoding="utf-8")
    assert text.startswith("---\n")
    assert "title: Init Test" in text
    assert f"spec_id: {spec_id}" in text
    assert "classification: operational" in text
    assert "## Dispatches" in text
    assert "## Commits" in text
    assert "## PRs" in text


def test_events_sse_emits_change(running_server, fake_repo):
    server_obj, broadcaster, port = running_server

    # Open the SSE stream raw so we can read events as they land
    conn = http.client.HTTPConnection("127.0.0.1", port, timeout=30)
    conn.request("GET", "/api/events", headers={"Accept": "text/event-stream"})
    resp = conn.getresponse()
    assert resp.status == 200
    assert resp.getheader("Content-Type", "").startswith("text/event-stream")

    fp = resp.fp  # underlying file object
    # Give the underlying socket a short per-read timeout so we can iterate
    sock = resp.fp.raw._sock  # type: ignore[attr-defined]
    sock.settimeout(2.0)

    def read_event() -> str | None:
        """Read one SSE frame (blank-line terminated). Returns None on timeout."""
        buf: list[str] = []
        try:
            while True:
                line = fp.readline()
                if not line:
                    return None
                decoded = line.decode("utf-8", errors="replace")
                if decoded.strip() == "":
                    if buf:
                        return "".join(buf)
                    continue
                buf.append(decoded)
        except (TimeoutError, OSError):
            return None

    # First frame: the hello event
    hello = read_event()
    assert hello is not None
    assert "event: hello" in hello

    # Publish a direct event via the broadcaster — verifies SSE transport
    # without relying on the polling watcher's filesystem cadence
    broadcaster.publish("test.event", {"hello": "world"})
    frame = read_event()
    assert frame is not None, "expected SSE frame after publish"
    assert "event: test.event" in frame
    assert '"hello": "world"' in frame

    # And verify the polling watcher actually picks up a sidecar write
    new_id = "2026-05-11-sse-watcher-test"
    sidecar = fake_repo / "memory" / "spec-trace" / f"{new_id}.md"
    sidecar.write_text(
        "---\nspec_id: " + new_id + "\n---\n\n## Commits\n", encoding="utf-8"
    )
    found_watcher_event = False
    deadline = time.time() + 15.0
    while time.time() < deadline:
        frame = read_event()
        if frame and "sidecar.created" in frame and new_id in frame:
            found_watcher_event = True
            break
    assert found_watcher_event, "polling watcher did not emit sidecar.created"

    conn.close()


def test_cors_allows_localhost_3000(running_server, seed_spec):
    _server, _broadcaster, port = running_server
    status, headers, _raw = _request(
        "GET",
        port,
        "/api/specs",
        headers={"Origin": "http://localhost:3000"},
    )
    assert status == 200
    assert headers.get("Access-Control-Allow-Origin") == "http://localhost:3000"
    assert "Vary" in headers and "Origin" in headers["Vary"]


def test_cors_allows_starlight_origin(running_server, seed_spec):
    _server, _broadcaster, port = running_server
    status, headers, _raw = _request(
        "GET",
        port,
        "/api/specs",
        headers={"Origin": "https://starlightintelligence.org"},
    )
    assert status == 200
    assert headers.get("Access-Control-Allow-Origin") == "https://starlightintelligence.org"


def test_cors_rejects_arbitrary_origin(running_server):
    _server, _broadcaster, port = running_server
    status, headers, raw = _request(
        "GET",
        port,
        "/api/specs",
        headers={"Origin": "https://evil.example.com"},
    )
    assert status == 403
    payload = json.loads(raw)
    assert payload["error"] == "cors_origin_rejected"
    assert payload["origin"] == "https://evil.example.com"
    assert "Access-Control-Allow-Origin" not in headers


def test_options_preflight_returns_cors(running_server):
    _server, _broadcaster, port = running_server
    status, headers, _raw = _request(
        "OPTIONS",
        port,
        "/api/specs",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert status == 204
    assert headers.get("Access-Control-Allow-Origin") == "http://localhost:3000"
    assert "GET" in headers.get("Access-Control-Allow-Methods", "")


def test_project_slug_mirrors_cli():
    # Windows-style with drive letter
    slug = srv.project_slug(Path("C:/Users/frank/Starlight-Intelligence-System"))
    # The double-dash after the drive letter is the canonical encoding
    assert slug.startswith("C--Users-frank-") or slug.startswith("C-Users-frank-")
    # Verify the exact contract: ':' AND separators -> '-'
    raw = "X:/a/b"
    direct = raw.replace(":", "-").replace("\\", "-").replace("/", "-").lstrip("-")
    assert srv.project_slug(Path(raw)) == direct or "X--a-b" in srv.project_slug(Path("X:/a/b"))


def test_frontmatter_parser_handles_quotes_and_lists():
    fm, body = srv.parse_frontmatter(
        '---\n'
        'title: "Quoted Title"\n'
        'status: DESIGN\n'
        'related:\n'
        '  - one.md\n'
        '  - two.md\n'
        '---\n\n'
        'body here\n'
    )
    assert fm["title"] == "Quoted Title"
    assert fm["status"] == "DESIGN"
    assert fm["related"] == ["one.md", "two.md"]
    assert body.strip() == "body here"
