---
name: orchestration/cli-tool-router
domain: orchestration
description: Route operator tasks across local AI CLIs and native generation tools. Fires for /si, /so, CLI routing, dispatch, Antigravity, Grok, Claude, Codex, Gemini, OpenCode, Cursor, image generation, and tool-choice requests.
triggers:
  keywords: ["/si", "/so", "route to cli", "send to cli", "which cli", "antigravity", "grok", "claude", "codex", "gemini", "opencode", "cursor", "generate image", "image tool", "dispatch"]
  agents: ["starlight-orchestrator", "starlight-prime", "starlight-voice-operator"]
  intents: ["cli-routing", "tool-routing", "image-generation", "agent-dispatch"]
priority: high
load_level: core
---

# CLI Tool Router

> *"Pick the lane. Preserve the context. Leave a receipt."*

## Purpose

Use this skill when the operator asks SIS to route work to a local CLI, choose a model/tool lane, open a repo-specific agent, or generate visual assets. It is the contract behind `/si` and `/so`.

## Routing Lanes

| Lane | Use for | Local shortcuts |
|---|---|---|
| Claude Code | Substrate edits, refusal-sensitive work, council-quality synthesis | `cla`, `clsis`, `cfx`, `clg`, `clvc`, `clanime`, `cldpi` |
| Codex | Multi-file code edits, tests, repo implementation | `cda`, `cdsis`, `cdf` |
| Gemini | Long-context sweeps, large docs, broad repo reasoning | `ga`, `gsis`, `gfx` |
| OpenCode | Fast scratchpad execution and low-stakes exploration | `oaa`, `oasis` |
| Cursor | IDE-agent work where editor state matters | `cura`, `cursis` |
| Antigravity | Async IDE work, browser control, agent-manager workflows | `agyarc`, `agya`, `agysis`, `agyfx`, `agyg`, `agyvc`, `agyani`, `agydpi` |
| Grok | xAI/Grok reasoning lane and repo-local Grok CLI work | `grarc`, `grsis`, `grfx`, `grg`, `grvc`, `grani`, `grdpi` |
| Native image tool | Direct image generation/editing in the current agent surface | image generation tool, Canva, Higgsfield, or repo-specific visual pipeline |

## Default Decisions

1. If the request names a tool or shortcut, use that lane unless it conflicts with safety or repo constraints.
2. If the request is code implementation in this repo, use Codex locally.
3. If the request needs very long context or multi-repo comparison, route to Gemini or Antigravity.
4. If the request needs browser/IDE work, route to Antigravity.
5. If the request asks for image generation or image editing, use the native image generation/editing tool available in the current surface. Do not route image generation through a text CLI unless the user explicitly asks for that CLI.
6. If the request is substrate-level, prefer Claude Code or the current Codex session with substrate governance loaded.
7. If the destination repo is `~/Business`, do not use dangerous autonomous wrappers. Ask for explicit confirmation and use the least-privileged lane.

## Packet Shape

When dispatching rather than executing immediately, produce:

```yaml
route:
  target_repo: <Arcanea|SIS|FrankX|GenCreator|Vibeclubs|AnimeLegends|DPI|other>
  lane: <claude|codex|gemini|opencode|cursor|antigravity|grok|image>
  shortcut: <local command or native tool name>
task: <one imperative paragraph>
context:
  files: [<paths>]
  memory: [<vault refs>]
constraints:
  - <must preserve>
verification:
  - <how to know it worked>
```

## Verification

Before claiming a local lane works, verify:

- `Get-Command <binary-or-function>` resolves.
- Target repo path exists.
- For wrappers, `Test-AgentGridCli` reports installed binaries and existing repo targets.
- For image work, an image artifact was generated or the tool returned a concrete refusal.

## Output Standard

Be brief. State the chosen lane, why, and the exact command/tool to run when not executing directly. If executing directly, report the artifact, diff, or command result.
