# Contributing to Cockpit Continuity

We welcome contributions. This guide covers what we accept, how to structure a PR, and the engineering principles we hold ourselves to.

## TL;DR

1. Read `CONTRACTS.md` first. Schemas are pinned; bumping them requires a migration script.
2. Run `pwsh ./test/smoke.ps1` (Windows) or `bash ./test/smoke.sh` (Linux/macOS) before pushing.
3. Hooks NEVER block the host. Read `docs/ARCHITECTURE.md` "Failure Modes" section before touching `hooks/`.
4. New adapters live in `adapters/<terminal>/` with `capture.<ext>` + `emit.<ext>`.
5. Every schema change = bumped version + migration script.

## Engineering principles (non-negotiable)

These are the rules we hold the code to. PR reviews enforce them.

### Hooks must never block

Every hook script (`hooks/*.ps1`, `hooks/*.sh`) must:
- Exit 0 within 5000ms regardless of internal failure
- Swallow ALL errors to a log file (`hook-errors.log`), never propagate
- NEVER write to stdout (Claude Code reads stdout for hook results)
- Be idempotent (safe to call N times)

If your hook can theoretically block on I/O, network, or a missing dependency — fail-fast and log. Never wait.

### Atomic writes for state files

Any file in `~/.starlight/cockpit/` that's NOT append-only must be written via `Write-CockpitAtomicJson`:
1. Stage in `<file>.tmp-<random>`
2. `Move-Item -Force` to the final path

Readers must NEVER see partial files. The append-only manifest is the only file that uses raw `Add-Content`.

### Schema versioning

Every JSON-bearing document carries a `schema` field like `cockpit.session/v1`. To bump:
1. Add the v2 schema to `CONTRACTS.md` with a clear changelog entry
2. Add a reader branch in `Read-CockpitManifest` that recognizes BOTH versions during a deprecation window
3. Ship `scripts/migrate-v1-to-v2.ps1` for one-shot conversion
4. Add tests that the old schema still parses and the new schema is preferred
5. Document the deprecation timeline in CHANGELOG.md

Forward compatibility is a contract, not a courtesy.

### Privacy boundary

The manifest contains: cwd, project name, agent type, opaque session UUIDs, PIDs, hostname, username. **It must NOT contain transcript content, prompts, tool outputs, secrets, or file contents.** If you find yourself wanting to log something private, log a synthetic identifier instead and reference the agent's own transcript storage.

### No external dependencies in core

PowerShell core (`scripts/`, `adapters/`, `hooks/`) must not require any module beyond what ships with PowerShell 5.1. POSIX core requires only `bash`, `jq` (optional, with grep fallback), and `tmux` for tmux adapter. The MCP server (Node.js, `mcp/`) may add npm deps.

This keeps install friction at zero.

### Tests prove behavior

Every new feature ships with smoke tests in `test/smoke.ps1` (or `test/smoke.sh`). The harness sandboxes `$env:COCKPIT_HOME` to avoid touching real state.

The current floor is 82 passing assertions. PRs may not regress this number.

## Adding a new terminal adapter

1. Create `adapters/<terminal>/capture.{ps1,sh}` returning a `cockpit.snapshot/v1` document.
2. Create `adapters/<terminal>/emit.{ps1,sh}` accepting a snapshot and rebuilding panes.
3. Wire detection in `scripts/snapshot.ps1` `Resolve-CockpitTerminal`.
4. Wire dispatch in `scripts/rehydrate.ps1`.
5. Add file-presence + parse + emit-dryrun tests.

## Adding a new agent

1. Create `agents/<name>/` with hooks or wrapper as needed.
2. Document in `README.md` "Supported agents" table.
3. Add agent name to ValidateSet in `Write-CockpitSessionEvent` and the MCP server `cockpit_status` tool's enum.
4. Add tests for the agent's manifest write path.

## Schema change checklist

- [ ] CONTRACTS.md updated with new schema version
- [ ] Reader handles old AND new versions during deprecation window
- [ ] Migration script in `scripts/migrate-vN-to-vN1.ps1`
- [ ] Smoke tests cover both versions
- [ ] CHANGELOG.md entry under "Breaking" or "Schema migration"
- [ ] Deprecation timeline documented (typically: parallel reader for 1 minor cycle, then v1-only reader)

## PR template

```
## What

[One sentence: what this PR does]

## Why

[Two sentences: what problem it solves]

## Tests

[Test command + count of new assertions added]

## Schema impact

[None | Adds field to v1 (backward-compat) | Bumps to v2 (with migration)]

## Risk

[Low: pure read | Medium: writes new state | High: modifies install / hooks / settings.json]
```

## Code style

PowerShell:
- ASCII-only in script bodies (em-dashes break the parser in some encodings — use `--`)
- Functions use `Verb-CockpitNoun` naming for cockpit primitives
- `[CmdletBinding()]` on functions that take params
- No global state mutation outside `$script:` scope

Bash:
- POSIX-compatible where possible (test on macOS bash 3.2 as well as Linux bash 5+)
- `set -euo pipefail` in scripts (not in hooks — hooks must never fail)
- `command -v <tool>` for dependency checks, never assume

Both:
- Comments explain WHY, not WHAT (well-named identifiers do the WHAT)
- Header comment on every file: purpose + hard contract notes if any

## Code of conduct

See `CODE_OF_CONDUCT.md`. Short version: be kind, be specific, attack ideas not people, assume good faith.

## License

Contributions are licensed under MIT (see `LICENSE`). The "Built on SIP" attestation in `NOTICE` is a social-layer convention; you are not legally required to carry it forward but doing so helps the substrate ecosystem stay coherent.
