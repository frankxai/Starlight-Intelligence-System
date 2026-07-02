# /invest-retro

Outcome-grounded retrospective — the learning loop. Reads trajectory records (thesis→action→outcome→lesson), scores decisions against realized outcomes, and distills lessons into per-agent `calibration_notes` in `engine/agents/catalog.json`.

## Usage

```
/invest-retro [--since YYYY-WW] [--thesis <slug>]
```

## Contract

Load `verticals/investment-intelligence/SKILL.md` and execute `verticals/investment-intelligence/engine/commands/retrospective.md` under it:

- R5 non-advisory clause opens the output.
- Every acted-on recommendation since the last retro must have a trajectory record (`engine/schemas/trajectory.schema.json`) — missing records are flagged as pipeline drift (SOUL test 4).
- Lessons update agent calibration notes; systemic lessons propose skill/command edits as diffs for human review (never silent self-modification).
- Cross-check the trade-gate audit JSONL: every executed order must trace to an approved intent. Discrepancy = escalate, do not rationalize.

**Built on SIP** — invest-retro wrapper · v0.1
