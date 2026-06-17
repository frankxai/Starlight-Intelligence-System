# /si Command

> *"Starlight Intelligence: route this to the right local lane."*

**Tier:** Operational  
**Primary Agent:** Starlight Orchestrator  
**Skills Activated:** orchestration/cli-tool-router, orchestration/agent-handoff-packet

---

## What It Does

`/si` is the short operator command for routing work across local AI CLIs and native generation tools.

Use it for:

- Selecting a CLI lane: Claude, Codex, Gemini, OpenCode, Cursor, Antigravity, Grok.
- Sending a task to a repo-specific shortcut like `cdsis`, `agyarc`, or `grarc`.
- Creating a handoff packet when the task should be executed by another agent.
- Generating or editing images through the native image tool when visual output is requested.

---

## Forms

```text
/si <task>
/si --repo <arc|sis|fx|g|vc|ani|dpi> <task>
/si --tool <claude|codex|gemini|opencode|cursor|agy|grok|image> <task>
/si --dry-run <task>
```

---

## Routing Defaults

| Need | Route |
|---|---|
| Code implementation | Codex |
| Substrate-sensitive review | Claude or current substrate-loaded session |
| Long-context sweep | Gemini |
| IDE/browser/async agent workflow | Antigravity |
| Grok/xAI reasoning lane | Grok |
| Fast scratchpad | OpenCode |
| Editor-state task | Cursor |
| Image generation/editing | Native image tool first |

---

## Shortcut Map

| Repo | Antigravity | Grok |
|---|---|---|
| Arcanea | `agyarc` / `agya` | `grarc` |
| SIS | `agysis` | `grsis` |
| FrankX | `agyfx` | `grfx` |
| GenCreator | `agyg` | `grg` |
| Vibeclubs | `agyvc` | `grvc` |
| AnimeLegends | `agyani` | `grani` |
| DPI | `agydpi` | `grdpi` |

Run `Test-AgentGridCli` to verify local binaries and repo paths.

---

## Output

Return the selected route, command/tool, task packet, and verification step. If `--dry-run` is absent and the current surface can execute the work safely, execute it.

Built on SIP.
