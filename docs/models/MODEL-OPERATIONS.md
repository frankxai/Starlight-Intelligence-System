# Model Operations — managing the Claude lineup (and everyone else)

> Built on SIP. Companion to the global routing doctrine in `~/.claude/CLAUDE.md`
> (OpenRouter-default, reason-first, Higgsfield-for-image). This doc covers the
> Claude-side lineup and the eval loop that keeps routing decisions honest.
> Last updated: 2026-06-09 (Fable 5 arrival + Arena Round 1).

## The lineup (June 2026)

| Model | ID | Role on this machine |
|---|---|---|
| **Fable 5** | `claude-fable-5` | Default interactive model in Claude Code. Edge (measured, Arena R1): instruction compliance / output discipline at correctness parity with Opus. Prefer for agentic pipelines where outputs feed schemas, tools, or other agents. |
| **Opus 4.8** | `claude-opus-4-8` | Deep-reasoning heavyweight; richest prose (R1 judge preferred its style). Watch constraint adherence on tightly-formatted outputs. Fast mode (`/fast`) = Opus with faster output, not a smaller model. |
| **Sonnet 4.6** | `claude-sonnet-4-6` | Workhorse subagent + neutral-ish blind judge for arena rounds (non-contestant). |
| **Haiku 4.5** | `claude-haiku-4-5-20251001` | Bulk/cheap fan-out, classification, low-stakes extraction. |

## Where model choice is set (Claude Code)

1. **Session model** — `/model` in the CLI (persists as default). `/fast` toggles fast mode on Opus-class.
2. **Per-agent override** — `Agent` tool `model: "fable" | "opus" | "sonnet" | "haiku"`. Default is *omit* (inherit session model). Override only with a reason: `haiku` for bulk fan-out, `opus` for deep single-shot reasoning, contestants pinned per-model in arena rounds.
3. **Agent definitions** — frontmatter `model:` in `agents/*.md` and plugin agents; tool-call override beats frontmatter.
4. **Workflows** — `agent(prompt, {model})` per call; same omit-by-default rule.
5. **API / scripts** — Anthropic SDK with exact IDs above; non-Claude models route via OpenRouter per global Doctrine 2.

## Routing heuristics (post-Arena-R1)

- **Default Fable 5** for interactive + agentic work. Its measured edge — respecting
  output format and length constraints — is precisely what multi-agent pipelines need.
- **Reach for Opus 4.8** when the task is one deep uninterrupted reasoning artifact
  (strategy memo, gnarly architecture trade-off) and a human reads the output.
- **Never promote a routing claim without a receipt.** Run an arena round
  (`tools/arena/README.md`); n=1 rounds are directional — repeat before hardening
  a heuristic into doctrine.

## The eval loop (decided 2026-06-09)

| Need | Use | Not |
|---|---|---|
| Model head-to-head | **Claude Code arena harness** (`tools/arena/`) — Agent model overrides, self-verifying tasks, blind non-contestant judge | Standing up eval servers |
| Prompt/pattern regression | **promptfoo** — declarative, local, colocated with patterns (Prompt Hub `prompt-evaluator` wraps it) | LangSmith (hosted/paid, adds framework) |
| Production tracing | **Langfuse** — only once an app serves real users | Tracing infra for benchmarks |

Receipts land in `tools/arena/runs/`; the public surface is
`starlightintelligence.org/research/model-arena` (SIS = source of truth,
frankx.ai mirrors and links back per the brand-register split).

## Hygiene

- Verify model IDs against this table before scripting — training-data IDs rot.
- Arena caveats are non-optional in any published result: n, judge family bias,
  harness-inclusive timings.
- When a new model lands (as Fable 5 did today): run an arena round same-day,
  write the receipt, update this table — *then* touch routing doctrine.

Built on SIP — Starlight Intelligence Protocol.
