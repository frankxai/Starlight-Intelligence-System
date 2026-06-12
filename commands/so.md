# /so Command

> *"Starlight Orchestrator: decide, dispatch, verify."*

**Tier:** Operational  
**Primary Agent:** Starlight Orchestrator  
**Skills Activated:** orchestration/cli-tool-router, orchestration/agent-handoff-packet

---

## What It Does

`/so` is the orchestration form of `/si`. Use it when the task may need decomposition, multi-agent routing, or a durable handoff packet.

It can:

- Route a task to any local CLI lane.
- Fan out subtasks across multiple CLIs.
- Pick a repo-specific wrapper (`agyarc`, `grarc`, `cdsis`, etc.).
- Generate or edit images using the native image tool when visual output is the actual deliverable.
- Produce a verification checklist before marking the work done.

---

## Forms

```text
/so <task>
/so --fanout <task>
/so --repo <arc|sis|fx|g|vc|ani|dpi> <task>
/so --tool <claude|codex|gemini|opencode|cursor|agy|grok|image> <task>
/so --packet <task>
```

---

## Behavior

1. Classify the task: code, substrate, long-context, browser/IDE, Grok lane, image, or general ops.
2. Select the smallest adequate lane.
3. Preserve context in a packet if another agent will execute.
4. Execute directly only when the current surface has the right tool and permission.
5. Verify with command output, generated artifact, passing test, or explicit dry-run route.

---

## Guardrails

- Do not route `~/Business` through dangerous autonomous wrappers.
- Do not claim another laptop is configured unless verified from synced profile/config or a fresh check on that machine.
- Do not send image generation to a text CLI when native image tools are available, unless the user explicitly asks for that CLI.

Built on SIP.
