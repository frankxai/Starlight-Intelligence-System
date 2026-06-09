# tools/git-hooks/

Shared, in-repo git hooks. Versioned with the substrate they protect.

## Install (one-time per clone)

```powershell
pwsh tools/git-hooks/install.ps1
```

This sets `core.hooksPath = tools/git-hooks` for your local clone. Idempotent — safe to re-run.

## What's enforced

| Hook | Runs when | What it checks | Time |
|---|---|---|---|
| `pre-commit` | Every `git commit` that touches `agents/`, `skills/`, `verticals/`, `test/`, or `package.json` | v76 (agent registry symmetry) + v77 (skill-rules symmetry) tests | ~3-5s |
| `post-commit` | Every `git commit` whose message contains a `Spec: <spec-id>` trailer | Appends commit metadata to `memory/spec-trace/<spec-id>.md` (canonical) + dual-writes indexed copy to `~/.claude/projects/<slug>/memory/spec-trace_<spec-id>.md` (Memory Bus recall surface) | <50ms |

Pure-doc commits skip `pre-commit` automatically (no substrate touched = no drift to check). Commits without a `Spec:` trailer skip `post-commit` silently.

### `Spec:` trailer convention

To link a commit to a spec, include a trailer line:

```
feat(spec-trace): MVP hook + atom factory patch

Phase 1 of the Spec-Trace primitive.

Spec: 2026-05-11-spec-trace-design
```

Multiple `Spec:` trailers allowed — one commit can touch multiple sidecars. Hook is fail-open: never blocks the commit. Idempotent: re-running on the same HEAD never double-writes.

See `docs/superpowers/specs/2026-05-11-spec-trace-design.md` for the full design.

## Bypass

```bash
git commit --no-verify
```

Use sparingly. A failed symmetry test means a real registry ↔ files drift — bypassing it ships the drift.

## Why hooks instead of CI-only?

- Drift caught at commit time, not 30s later in CI
- Local laptop loop (no GitHub round-trip)
- Encourages the registry-symmetry discipline as a habit

CI still runs the full substrate suite (~12s) on push. The hook is the cheap-and-fast first line.

## Adding a new hook

1. Drop the script at `tools/git-hooks/<hook-name>` (no `.sample` suffix)
2. Make it executable on POSIX (`chmod +x`); git on Windows reads via mingw, no chmod needed
3. Document it in the table above
4. Re-run `pwsh tools/git-hooks/install.ps1` to verify pickup

## Architecture notes

- Hooks live in `tools/git-hooks/`, not `.git/hooks/` (which is per-clone, untracked, and would require manual sync across machines).
- `core.hooksPath` is a Git 2.9+ feature — universal in any modern install.
- The bash hook uses `set -e` and POSIX shell idioms. Works in git-bash on Windows + native bash on macOS/Linux.

---

**Built on SIP** — operational tier · 2026-05-05
