# Validation record

Prepared 30 October 2026. This document reports evidence for the scoped starter. Full Starlight runtime validation remains separate.

| Check | Evidence and boundary |
| --- | --- |
| Broad SIP starter build and shell install | Passed package check and installation in an empty Linux workspace. Installed INSTALL.md was missing; broad starter not selected for this handoff. |
| Scoped installation tests | 9 tests passed, 0 failed on Node.js 24.22.1 / Linux. Four host paths, spaces in paths, complete reference copying, preservation, overwrite refusal, invalid host and symlink rejection. |
| Native Claude plugin validation and isolated install | Claude Code 2.1.314 plugin validation passed. Optional directory icon absent; no directory submission attempted. Marketplace registration and plugin installation succeeded in a fresh CLAUDE_CONFIG_DIR, outside the source workspace; regular user settings were preserved. Model execution remains untested. Root marketplace validation also passed, with existing broad-root plugin metadata warnings. |
| Native Codex, Antigravity and OpenCode execution | Not tested; only project file installation and documented discovery paths are checked. |
| ChatGPT and Claude app sessions | The complete manual prompt is supplied. No recipient login or UI session was exercised. |
| Model rehearsal | Separate model session completed the first-use artifacts and all four follow-ups. Package author inspected unsupported-claim rejection, proposal/approval history and source-instruction refusal. See examples/rehearsal.md. This establishes one rehearsal. Reliability and personal voice acceptance require further evaluation. |
| Recipient environment and editorial taste | Not tested. Requires his own first run and authorized writing examples. |
| Hosted service, integrations and autonomous execution | Not included or tested. No endpoint, credentials or MCP configuration shipped. |

## Reproduce

From this package directory:

```sh
node scripts/build-first-use.mjs
node --test scripts/starter.test.mjs
```

Runtime used during preparation: Node.js 24.22.1 on Linux. Node.js 18+ is the intended filesystem-script requirement; that version and Windows execution have not been separately tested. The manual chat route does not need Node.

Inspect demo-acceptance.md inside the skill references for expected artifacts and negative tests. A passing static test establishes packaging behavior; it does not establish factual guarantees or editorial acceptance.

Package-scoped estate guard scan: 19 files scanned, 0 findings. Agent hygiene: 1 changed skill, 0 errors, 0 warnings. Public-copy editorial audit: 0 hard failures; recorded model-output excerpts contain review signals requiring contextual judgment. Full-repository tests were not run because this package has no imports from the reference runtime; repository-wide CI remains separate.
