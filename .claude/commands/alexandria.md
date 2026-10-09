---
name: alexandria
description: Catalogued intelligence with receipts — plan a need against the Alexandria catalogue, price it, execute it inside the session budget, and return records plus a receipt. The one door for any record an artifact will cite.
allowed-tools: Read, Bash, Grep, Glob
argument-hint: "<need in plain language> [--capability <provider/capability>] [--options '{json}'] [--max-credits N] [--sip-layers attestation,file-contract]"
---

# /alexandria

Load `verticals/alexandria/SKILL.md`. Protocol: plan → budget → execute once → cite the receipt → verify → record.

## Input
$ARGUMENTS

## Steps

1. **Plan.** Run `node --import tsx -e` against `src/alexandria` (or call the MCP tool `alexandria_plan`) with the need. Show the candidates: capability id, provider, score, credits, per-record flag, required options.
2. **Gate.** If the recommended price exceeds the remaining session budget (default 200 credits, `ALEXANDRIA_MAX_CREDITS`), stop and show the cheaper candidates. Never raise the budget without an experiment id from `verticals/alexandria/experiments/registry.json`.
3. **Options.** If the capability has `requiresOneOf`, ask for one of the named options or read it from the arguments. Nothing runs until it is satisfied.
4. **Execute once.** `alexandria_execute` with `capabilityId`, `options`, and `sipLayers` only when the artifact that will use the record genuinely composes SIP elements.
5. **Return.** Records (summarised, never dumped past 20 rows), the receipt (`id`, `contentHash`, `creditsCost`, `source`, `attribution` if any), and the updated budget.
6. **Record.** If the call served an experiment, append the receipt id to it. If a decision followed, write the vault entry.

## Refusals
- No contract for the need → say so and propose a provider PR; never scrape.
- Wallets, holders, rounds, tokens → records only; no advice framing.
- Publishing, money, keys → human.

## Output shape

```
# Alexandria — <need>
Plan: <capabilityId> (<provider>) · <credits> credits · required: <options>
Budget: <spent>/<max> → <spent after>/<max>
Records: <n> (<summary>)
Receipt: <id> · <contentHash> · <source> · <attribution?>
Experiment: <id or none>
```

**Built on SIP** · `alexandria@v0.1` · Layers used: [commands, attestation]
