# memory/spec-trace/

Per-spec **provenance sidecars** — the canonical store for spec ↔ dispatch ↔ commit ↔ PR linkage in SIS.

Each spec at `docs/superpowers/specs/<spec-id>.md` gets a sidecar at `memory/spec-trace/<spec-id>.md` that accumulates events as the spec is executed.

## Why sidecars

The spec markdown file is the authored canon — designed by humans, edited by humans, never mutated by automation. The sidecar is the provenance graph — appended by the post-commit hook, never edited by humans during a run.

This separation lets active dispatches against an open spec not generate git churn on the spec doc itself.

## Format

Each sidecar follows this shape (frontmatter + four event sections):

```markdown
---
spec_id: 2026-05-11-spec-trace-design
spec_path: docs/superpowers/specs/2026-05-11-spec-trace-design.md
created: 2026-05-11T14:00:00Z
classification: operational           # operational | substrate
board_verdict: none                   # none | PROCEED | REVISE | BLOCK
board_verdict_at: null                # ISO timestamp or null
project: Starlight-Intelligence-System
repo_root: C:/Users/frank/Starlight-Intelligence-System
---

## Dispatches

(Phase 2+ — populated by /dispatch with packet.spec_id)

## Commits

- 2026-05-11T14:32:11Z · `abc1234` · `main` · feat(spec-trace): MVP hook + atom factory patch

## PRs

(Phase 2+ — populated by GitHub Actions or polling)

## Notes

(Free-form append-only; not parsed)
```

## How events land here

### Commits (MVP)

The post-commit hook at `tools/git-hooks/post-commit` parses `Spec: <spec-id>` trailers from each new commit and appends a row to the `## Commits` section.

To link a commit to a spec, include the trailer:

```
feat(spec-trace): MVP hook + atom factory patch

Adds the post-commit hook that parses Spec: trailers
and dual-writes to memory/spec-trace + auto-memory.

Spec: 2026-05-11-spec-trace-design
```

Multiple trailers allowed — one commit can touch multiple sidecars.

### Dispatches (Phase 2)

When the cockpit `<SendToAgent>` button fires, `packet.spec_id` flows into `routing.jsonl`. The Phase 2 watcher writes a `## Dispatches` entry to the matching sidecar.

### PRs (Phase 3)

GitHub Actions or polling daemon reads merge commits and writes to `## PRs`.

## Dual-write architecture

The post-commit hook writes to TWO paths:

1. **Canonical** — `<repo>/memory/spec-trace/<spec-id>.md` — this directory. Git-tracked. Portable with the repo.
2. **Indexed copy** — `~/.claude/projects/<project-slug>/memory/spec-trace_<spec-id>.md` — Memory Bus crawl surface. Not git-tracked. Regenerable.

Why two paths? Memory Bus's `crawler.py` reads only top-level `.md` files in `~/.claude/projects/*/memory/` and does not recurse into subdirectories. To make spec-trace sidecars recall-able via `mcp__memory-bus__memory_recall` while keeping the canonical artifact in git, the hook maintains both copies.

Indexed-copy resync: `python tools/spec-trace.py sync` regenerates the indexed copies from canonical at any time.

## CLI

```bash
python tools/spec-trace.py list-specs              # all sidecars + status
python tools/spec-trace.py show-trace <spec-id>    # print sidecar
python tools/spec-trace.py link-commit <sha> <id>  # manual link if hook missed
python tools/spec-trace.py sync                    # regenerate indexed copies
python tools/spec-trace.py init <spec-id>          # create empty sidecar
```

## Phases

- **MVP (today, 2026-05-11):** post-commit hook + sidecar format + atom factory extension + CLI
- **Phase 2 (post-Friday-demo):** Packet/Router `spec_id` threading, cockpit button, board-at-creation skill
- **Phase 3:** Cross-repo aggregation, GitHub Actions backflow, OneHorizon-parity UX route

Full design: `docs/superpowers/specs/2026-05-11-spec-trace-design.md`.

---

**Built on SIP** — operational tier (MVP) · substrate-tier (Phase 2+) · 2026-05-11
