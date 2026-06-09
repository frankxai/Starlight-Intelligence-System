## What

[One sentence: what this PR does]

## Why

[Two sentences: what problem it solves, who benefits]

## Tests

- [ ] `pwsh ./cockpit/test/smoke.ps1` -> ALL PASS
- [ ] Existing test count maintained or increased (current floor: 82)
- [ ] If new feature: new assertions added covering happy path + at least one failure mode

## Schema impact

- [ ] **None** -- pure read or implementation detail
- [ ] **Adds optional field to v1** -- backward compatible
- [ ] **Bumps to v2** -- includes migration script + reader handles both versions

## Risk

- [ ] **Low** -- pure read, no state mutation, no settings.json
- [ ] **Medium** -- writes new state to ~/.starlight/cockpit/
- [ ] **High** -- modifies install / hooks / settings.json / scheduled tasks

## Hook contract verification (if hooks touched)

- [ ] Exits 0 within 5000ms even on internal failure
- [ ] Swallows all errors to hook-errors.log
- [ ] Does not write to stdout
- [ ] Idempotent

## Cross-platform

- [ ] Tested on Windows
- [ ] Tested on Linux/macOS (or N/A for Windows-only feature)

## Docs updated

- [ ] CHANGELOG.md
- [ ] README.md if surface change
- [ ] CONTRACTS.md if schema/hook contract change
- [ ] Inline help (`arc help`) if new command
