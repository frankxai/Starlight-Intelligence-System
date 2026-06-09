# /dispatch Command

> *"Send a task to the right CLI through the orchestrator router."*

**Tier:** Operational
**Primary Agent:** Starlight Orchestrator
**Skills Activated:** orchestrator-router, multi-cli-dispatch

---

## What it does

`/dispatch` hands a prompt to one of the four sibling CLIs (`claude`, `codex`,
`gemini`, `opencode`) through the Starlight orchestrator router. The router:

1. Classifies the prompt into an intent class (substrate / refactor /
   long-context / scratchpad / voice / default).
2. Picks the matching dispatcher per `~/.starlight/routing.toml`.
3. Falls back automatically if the chosen CLI is not installed.
4. Logs every decision to `private/voice-operator/logs/routing.jsonl`.

Use this instead of raw `Bash codex ...` whenever you want intent-aware
dispatch with audit trail. Use raw Bash when you've already decided which CLI
and want one-line speed.

---

## Subcommands

### `/dispatch <prompt>`

Classify and dispatch. The most common form.

```
/dispatch refactor the auth module across these files
/dispatch summarize this 50K-token transcript and pull out the action items
/dispatch quickly explore three caching options for the rate limiter
```

### `/dispatch --intent <class> <prompt>`

Force a specific intent class — skip the classifier.

Valid classes: `substrate`, `refactor`, `long-context`, `scratchpad`,
`voice`, `default`.

```
/dispatch --intent long-context "summarize the v7.5 release notes"
/dispatch --intent substrate "review SIP.md change"
```

### `/dispatch --dispatcher <name> <prompt>`

Force a specific dispatcher — skip both the classifier AND the routing table.

Valid names: `claude`, `codex`, `gemini`, `opencode`.

```
/dispatch --dispatcher codex "rename FooBar to BazQux project-wide"
/dispatch --dispatcher opencode "smoke test this regex"
```

### `/dispatch --dry-run <prompt>`

Show what would happen — classification + chosen dispatcher — without
actually invoking the CLI. Still writes the decision to the JSONL audit log.

```
/dispatch --dry-run refactor across many files --files a.py b.py c.py d.py e.py f.py
```

### `/dispatch --json <prompt>`

Emit decision + dispatch result as a single JSON object. Useful when you
want to pipe into another tool or store the audit record alongside the work.

---

## Common flags

- `--files a.py b.py ...` — relevant file paths. Many files (≥5) auto-classify
  as `refactor`.
- `--source voice|text|intake` — override the packet source. Defaults to
  `text`. Setting `voice` triggers the voice-routing rule.
- `--routing-toml <path>` — override the routing config. Defaults to
  `~/.starlight/routing.toml`.

---

## Routing defaults

When `~/.starlight/routing.toml` is absent or doesn't override these:

| Intent class | Dispatcher | Why |
|--------------|------------|-----|
| `substrate` | `claude` | Strongest refusal posture for SIP edits |
| `refactor` | `codex` | Best at large multi-file mechanical refactors |
| `long-context` | `gemini` | 1M token context window |
| `scratchpad` | `opencode` | Speed-first via Cerebras / Groq |
| `voice` | `claude` | Voice-sourced packets prefer named substrate agent |
| `default` | `claude` | Safest fallback |

Fallback order if the chosen dispatcher isn't installed:
`claude → codex → gemini → opencode`.

---

## Implementation

Underneath, `/dispatch` invokes:

```bash
python -m service.orchestrator_cli "<prompt>" [flags]
```

from `private/voice-operator/`. The CLI builds a packet, runs
`OrchestratorRouter.route()`, and writes the decision to
`private/voice-operator/logs/routing.jsonl`.

---

## Exit codes

- `0` — dispatch executed (the chosen CLI returned an `executed` status)
- `1` — dispatch ran but returned non-executed (error / timeout /
  not_installed)
- `2` — invocation problem (no dispatchers available, bad override, etc.)

---

## When NOT to use it

- **One-shot Bash speed:** if you've already decided "send this to gemini"
  and don't want the audit log, run `gemini -p "<prompt>"` directly.
- **Inside the voice operator pipeline:** the pipeline already routes through
  `OrchestratorRouter` programmatically — `/dispatch` is for ad-hoc dispatch
  from a shell or Claude Code session.
- **Cognition layer overrides:** to switch which LLM produces *packets*,
  set `COGNITION_PRIMARY_BACKEND` instead. `/dispatch` is for OUTPUT
  routing (packet → execution), not utterance → packet.

---

*Operational tier. No substrate edit. Built on SIP.*
