# Spec-Trace Daemon

Local-only HTTP+SSE server that backs the Spec-Trace cockpit page.

Reads from `<repo>/docs/superpowers/specs/*.md` (the source-of-truth specs) and
`<repo>/memory/spec-trace/*.md` (the sidecars produced by the post-commit hook),
and exposes a JSON API + Server-Sent-Events stream over `127.0.0.1:7777`.

Built on SIP — operational tier. No substrate touch; no external network
dependency; no third-party Python packages.

> Phase 2 (`POST /api/dispatch` threading `Packet.spec_id` through
> `OrchestratorRouter`) is **queued behind `/starlight-board` pre-pass** and is
> not in this build. The daemon's contract today is read-and-link only.

---

## Start

```powershell
# From repo root
python tools/spec-trace-daemon/server.py
# Or pick a different port
python tools/spec-trace-daemon/server.py --port 7780
```

The daemon binds to `127.0.0.1` only. To expose it to your phone or to another
machine on your Tailscale tailnet, run it behind `tailscale serve` or proxy
through your cockpit Next.js server (`/site`). Do not bind directly to `0.0.0.0`
— this daemon writes to disk and intentionally has no auth.

Logs append to `tools/spec-trace-daemon/logs/server.log` (UTC ISO timestamps)
and also stream to stdout.

---

## Endpoints

### `GET /health`

```json
{
  "server": "spec-trace-daemon",
  "version": "0.1.0",
  "attestation": "Built on SIP",
  "repo_root": "C:\\Users\\frank\\Starlight-Intelligence-System"
}
```

### `GET /api/specs`

Returns one row per spec doc under `docs/superpowers/specs/`, joined with
sidecar status from `memory/spec-trace/`.

```json
{
  "specs": [
    {
      "spec_id": "2026-05-11-spec-trace-design",
      "title": "Spec-Trace Primitive — design",
      "status": "DESIGN",
      "tier": "hybrid (...)",
      "date": "2026-05-11",
      "classification": "operational",
      "board_verdict": "none",
      "has_sidecar": true,
      "commits": 1,
      "indexed": true,
      "spec_path": "docs/superpowers/specs/2026-05-11-spec-trace-design.md"
    }
  ]
}
```

Orphan sidecars (sidecar with no matching spec doc) appear with
`"orphan_sidecar": true` and `spec_path: null`.

### `GET /api/spec/<spec-id>`

Returns the full spec doc + sidecar joined view + parsed event lists.

```json
{
  "spec_id": "2026-05-11-spec-trace-design",
  "spec": {
    "exists": true,
    "frontmatter": { "title": "...", "status": "DESIGN", "...": "..." },
    "body": "# Spec-Trace Primitive ...",
    "path": "docs/superpowers/specs/2026-05-11-spec-trace-design.md"
  },
  "sidecar": {
    "exists": true,
    "frontmatter": { "spec_id": "...", "classification": "operational", "...": "..." },
    "raw": "---\nspec_id: ...\n---\n\n## Dispatches\n...",
    "path": "memory/spec-trace/2026-05-11-spec-trace-design.md"
  },
  "events": {
    "dispatches": [],
    "commits": [
      {
        "timestamp": "2026-05-11T15:50:03Z",
        "sha": "918b629",
        "branch": "main",
        "subject": "feat(spec-trace): MVP — sidecar primitive...",
        "raw": "- 2026-05-11T15:50:03Z · `918b629` · `main` · ..."
      }
    ],
    "prs": []
  },
  "indexed": true
}
```

### `GET /api/spec/<spec-id>/raw`

Returns the raw markdown of the spec doc (`Content-Type: text/markdown`). Use
this when the cockpit wants to render the spec body through its own markdown
pipeline.

### `GET /api/events`  (SSE)

Server-Sent-Events stream of filesystem and broadcaster activity. Each frame is
a JSON object with `type` + `at` + payload.

Events emitted:

| `type`             | Payload                                  | Source                                |
| ------------------ | ---------------------------------------- | ------------------------------------- |
| `hello`            | `{version}`                              | On connection open                    |
| `sidecar.created`  | `{spec_id, path}`                        | Polling watcher detects new sidecar   |
| `sidecar.changed`  | `{spec_id, path}`                        | Polling watcher detects sidecar mtime |
| `sidecar.deleted`  | `{path}`                                 | Polling watcher detects sidecar gone  |
| `routing.appended` | `{bytes_added}`                          | Routing log grew                      |
| `commit.linked`    | `{spec_id, sha, changed}`                | `/api/link-commit` succeeded          |

A `: keepalive` comment fires every 15s so proxies don't drop the connection.

The watcher uses 1s polling (stdlib only, no `watchdog` dependency).

### `POST /api/link-commit`

Body:

```json
{ "sha": "deadbeef...", "spec_id": "2026-05-11-spec-trace-design", "branch": "main", "subject": "fix(...): ..." }
```

Appends a commit row to the sidecar. Idempotent — second call with the same
SHA returns `{"changed": false}`. `branch` and `subject` are optional; when
omitted, the daemon shells out to `git show` to resolve them.

Response:

```json
{ "changed": true, "message": "linked deadbee -> 2026-05-11-spec-trace-design", "spec_id": "...", "sha": "deadbee" }
```

### `POST /api/init-spec`

Body:

```json
{ "spec_id": "2026-05-11-new-thing", "title": "Optional Title", "classification": "operational" }
```

Creates an empty sidecar (if one doesn't already exist). Mirrors the seed
contract from `tools/spec-trace.py:_seed_sidecar`. Idempotent.

---

## CORS

Two origins are allowed:

- `http://localhost:3000` (Next.js dev server at `site/`)
- `https://starlightintelligence.org`

Any other browser origin gets `403 cors_origin_rejected`. Non-browser clients
(no `Origin` header) are not rejected — that's how the smoke tests and any
local CLI consumers reach the API.

---

## Tests

```powershell
python -m pytest tools/spec-trace-daemon/tests/ -v
```

16 tests cover: health endpoint, spec listing (populated + empty), spec
detail with sidecar, raw spec, link-commit (success + idempotent + missing
fields), init-spec, SSE transport + watcher delivery, CORS allow/reject,
OPTIONS preflight, project-slug encoding, and the frontmatter parser
(quotes + list values).

Tests use `tmp_path` and `SPEC_TRACE_REPO_ROOT` to isolate from the real repo;
each test binds the daemon to an ephemeral port (`port=0`).

---

## Repo root discovery

The daemon resolves its repo root in this order:

1. `$SPEC_TRACE_REPO_ROOT` (used by tests)
2. `git rev-parse --show-toplevel` from cwd
3. parent of `tools/spec-trace-daemon/`

This means you can start the daemon from anywhere as long as `cwd` is inside
the repo, or you can pin a specific repo via the env var.

---

## Project slug encoding

The daemon mirrors `tools/spec-trace.py`'s `project_slug()` exactly: replace
`:`, `/`, and `\` all with `-` (do **not** drop the colon). On Windows this
produces the canonical Claude auto-memory slug `C--Users-frank-...` (the
double-dash after the drive letter is the contract).

---

## Tailscale exposure

If you want the cockpit page to reach this daemon from your phone or laptop
on another network:

```powershell
# Expose just this port over Tailscale (read-only, no public internet)
tailscale serve http://127.0.0.1:7777
```

Or proxy through the Next.js cockpit at `site/`. **Do not** bind directly to
`0.0.0.0` — this daemon has no auth and writes to your repo. Tailscale's
identity layer is the cheapest acceptable shield.

---

*v0.1.0 · 2026-05-11 · Built on SIP*
