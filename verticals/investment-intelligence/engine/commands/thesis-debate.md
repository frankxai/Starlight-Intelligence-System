# /thesis-debate

Run an ad-hoc deep-dive on a single position or thesis. Same multi-agent team as weekly, narrower focus.

## Usage

```
/thesis-debate <topic>

Examples:
/thesis-debate "Should I rotate 5% to Morpho USDC?"
/thesis-debate "Is concentrated growth equity X overvalued?"
/thesis-debate "BTC vs ETH allocation — should I rebalance?"
/thesis-debate "Add real estate via REIT vs save for direct purchase?"
```

## What this command does

Same as `/weekly-strategy` but with `mode: thesis-debate`:
- Macro context still loaded (lighter weight)
- Portfolio context loaded
- Debate scope narrowed to the topic
- Output is a thesis-debate session at `sessions/thesis/<slug>-<id>.md`
- New `thesis_id` registered in `theses/index.yaml` if action is approved

## When to use

- A new opportunity surfaced this week (between weekly sessions)
- A position has moved materially and needs reassessment
- A regulatory event (e.g., new tax rule) requires re-thinking a holding
- An external trigger (job change, BV formation, inheritance event) requires structured debate

## When NOT to use

- For weekly review — use `/weekly-strategy` instead
- For impulse decisions ("BTC just dropped 10%, should I buy?") — sleep on it; the substrate is anti-impulse by design
- When you're emotional — the debate doesn't help when you're already committed to a verdict

## Output

Writes `sessions/thesis/<topic-slug>-<YYYY-WW>.md` with full debate transcript.

## Honest limit

A thesis-debate is a structured second opinion, not market timing. If you've already decided the action and just want validation, the substrate isn't doing its job — and you'll bias the agents accordingly. Run `/thesis-debate` only when you genuinely don't know the answer.
