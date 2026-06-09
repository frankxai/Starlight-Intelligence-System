# Starlight Model Arena — harness

> Built on SIP. Head-to-head LLM evals run natively inside Claude Code — no extra infrastructure.

## How it works

The Claude Code `Agent` tool accepts a per-spawn `model` override (`fable`, `opus`, `sonnet`, `haiku`).
That makes the CLI itself the arena:

1. **Dispatch** — the same task prompt is sent to N subagents in one parallel block,
   each pinned to a different model. Prompts instruct contestants that their final
   message is raw harness data (no user-facing framing).
2. **Verify** — objective tasks are self-verifying: coding tasks ship with exact
   asserts the contestant must run (`python solution.py` → `ALL PASS`), grounding
   tasks have known ground-truth answers checked by the harness.
3. **Judge** — subjective tasks (voice, style) go to a **blind, non-contestant**
   judge model with shuffled A/B labels per task (kills position + identity bias).
   The harness separately enforces hard constraints (word counts, format) so the
   judge's taste can't launder a constraint violation.
4. **Receipt** — every run writes a JSON receipt to `tools/arena/runs/` with
   prompts-category, scores, attempts, tokens, durations, and caveats. The public
   artifact at `/research/model-arena` renders from these receipts.

## Task design rules

- Prefer **self-verifying** tasks (asserts, ground truth) over judged ones — keep the
  judged share ≤ half the card.
- One task per capability axis: reasoning, coding, repo-grounded accuracy,
  brand-voice writing. Add agentic/tool-use axes as the card grows.
- Always record **attempts used** on coding tasks — first-try-pass is signal.
- Always state caveats in the receipt (n, judge family, harness overhead).

## Running a round

From a Claude Code session in this repo:

```
Run a model arena round: dispatch tasks from tools/arena/README.md task design
rules to fable and opus subagents in parallel, verify objective tasks, judge
subjective ones blind with sonnet, and write the receipt to tools/arena/runs/.
```

(Each step is plain `Agent` tool usage — see the 2026-06-09 run receipt for the
exact prompt shapes.)

## Eval-stack doctrine (decided 2026-06-09)

| Layer | Tool | Why |
|---|---|---|
| **Head-to-head model arena** | Claude Code `Agent` model overrides (this harness) | Zero infra, tests model-in-harness (what we actually ship with), receipts native to the repo. |
| **Regression evals on prompts/patterns** | `promptfoo` (declarative YAML, already wrapped by the `prompt-evaluator` agent in the Prompt Hub) | Versioned test files colocated with patterns; runs in CI; no server. |
| **Runtime tracing of deployed apps** | Langfuse (Phase 2, only when an app serves real users) | Tracing/observability is a production concern, not an eval concern. Don't stand up a server for benchmarks. |
| **Not adopted** | LangChain/LangSmith as eval layer | Adds a framework dependency for no capability we lack; LangSmith is paid + hosted where promptfoo is local + free. |

## Caveats that never leave the receipts

- Claude-family judges have family bias even when blind — note it, shuffle labels,
  and prefer objective verification wherever possible.
- n=1 rounds are directional. Promote a claim only after repeated rounds agree.
- Results measure **model-in-Claude-Code-harness**, which is the configuration we
  actually operate — but it is not a raw API benchmark.

Built on SIP — Starlight Intelligence Protocol.
