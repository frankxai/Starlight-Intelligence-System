# /si Command

Route operator work to the right local CLI or native generation tool.

Load `skills/orchestration/cli-tool-router.md` and, when handing work to another agent, `skills/orchestration/agent-handoff-packet.md`.

Supported lanes: Claude, Codex, Gemini, OpenCode, Cursor, Antigravity, Grok, and native image tools.

Shortcut map:

| Repo | Antigravity | Grok |
|---|---|---|
| Arcanea | `agyarc` / `agya` | `grarc` |
| SIS | `agysis` | `grsis` |
| FrankX | `agyfx` | `grfx` |
| GenCreator | `agyg` | `grg` |
| Vibeclubs | `agyvc` | `grvc` |
| AnimeLegends | `agyani` | `grani` |
| DPI | `agydpi` | `grdpi` |

If the task asks for image generation or image editing, use the native image tool available in the current surface first.

Output the chosen lane, exact command/tool, task packet if needed, and verification step.
