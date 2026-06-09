# Starlight Model Arena — Round 1: Fable 5 vs Opus 4.8

> Built on SIP — Starlight Intelligence Protocol.
> Status: **living artifact** (v0.1, in-progress). New rounds append; methodology is locked per round and versioned in `tools/arena/README.md`.

Two models walk into the same prompt. Only one walks out with the higher precision score — and here are the receipts. The Model Arena is our standing head-to-head eval surface: live results from real tasks run against frontier models, with full methodology, raw receipts, and scoring rubrics published alongside every number. No vibes, no cherry-picked screenshots, no benchmark theater. Every result links to the exact prompts, the judge criteria, and the failure cases — because a leaderboard you can't audit is just marketing with decimals. Use it two ways: read the standings to pick your next model, or fork the harness and run the gauntlet on your own stack. The pattern we care about isn't "which model wins" — it's teaching you to measure for yourself.

*(That intro paragraph was itself an arena output — written by Fable 5 under a 100–130-word constraint it respected. Opus 4.8's version scored higher on style and blew the word limit. That asymmetry turned out to be the round's headline.)*

---

## Method

- **Harness:** Claude Code's `Agent` tool with per-spawn model overrides — the same task prompt dispatched in one parallel block to a Fable 5 contestant and an Opus 4.8 contestant. No extra infrastructure; this measures **model-in-harness**, the configuration we actually operate.
- **Verification:** objective tasks self-verify (coding ships with exact asserts the contestant must run; grounding tasks have known ground-truth answers). Subjective tasks go to a **blind, non-contestant judge** (Sonnet 4.6) with shuffled A/B labels per task.
- **Constraint enforcement:** hard constraints (word counts, output format) are checked by the harness independently of the judge, so taste can't launder a violation.
- **Receipt:** `tools/arena/runs/2026-06-09-fable5-vs-opus48.json` in the repo.

## Round 1 — 2026-06-09

| Task | Axis | Fable 5 | Opus 4.8 | Verdict |
|---|---|---|---|---|
| Logic grid puzzle | Reasoning + output discipline | Correct, clean (judge 9/10) | Correct, leaked "wait —" deliberation into final output (judge 6/10) | **Fable 5** |
| `next_same_popcount` w/ asserts | Coding, self-verifying | PASS, 1 attempt (Gosper's hack) | PASS, 1 attempt (Gosper's hack) | Tie |
| CLAUDE.md governance facts | Repo-grounded accuracy | 3/3 correct | 3/3 correct | Tie |
| Arena intro, 100–130 words, voice spec | Brand-voice writing | Judge 8/10 · **128 words ✓** | Judge 9/10 · **148 words ✗** | Split — style: Opus · compliance: Fable |

**Tally:** Fable 5 wins 1, ties 2, split 1. Zero correctness failures on either side.

## What the round actually says

Correctness parity is the boring (and expected) result — both models solved everything. The discriminating signal was **instruction compliance**: Fable 5 was the only contestant that respected output-format and length constraints in both judged tasks. In an agentic harness where outputs feed pipelines, schemas, and downstream agents, output discipline *is* a capability — a beautiful answer in the wrong shape is a failed tool call.

## Caveats (these never leave the page)

- **n = 1 per task.** Directional, not statistical. Claims get promoted only after repeated rounds agree.
- **Judge family bias.** The blind judge is a Claude-family model; shuffled labels mitigate but don't eliminate it. Objective verification is preferred wherever possible.
- **Harness-inclusive.** Latency and token figures include Claude Code agent overhead.

## Reproduce it

The harness is a usage pattern, not a codebase — any Claude Code session can run a round. Method, task-design rules, and the eval-stack doctrine (arena via Agent overrides · regression evals via promptfoo · runtime tracing via Langfuse only when an app serves users) live in [`tools/arena/README.md`](https://github.com/frankxai/Starlight-Intelligence-System/blob/main/tools/arena/README.md).

---

Built on SIP — Starlight Intelligence Protocol.
