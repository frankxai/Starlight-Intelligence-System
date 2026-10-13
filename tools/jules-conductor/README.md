# Starlight Jules Conductor

Dispatches council-framed tasks to Google Jules across `frankxai/*` repos and
records the draft pull requests Jules opens. **It never merges, never enables
auto-merge and never marks a PR ready.**

Built on the Starlight Intelligence Protocol (SIP v1.1.1).

## Flow

1. **Pre-flight council** (`council-gate.mjs`, `prompt-engineer.mjs`): Architect
   checks scope and invariants; Sage injects vault memory into the task card.
2. **Jules executes** in its cloud sandbox and opens a pull request.
3. **Conductor records** the PR against its session. A Jules PR must be a draft;
   if one is found ready for review, the conductor converts it back with
   `gh pr ready <n> --undo` and logs the event.
4. **Separate review** happens outside the conductor. A PASS counts only from a
   different seat than the author (Codex, Claude Code, Antigravity or CTO),
   stamped with the reviewer and the exact head SHA. Jules is never a reviewer.
5. **Landing** is a human/CTO action outside this tool:
   - Low-risk changes (docs, copy, patch-level dependency bumps) may be landed
     after that PASS and green checks.
   - Money, publish, secrets, auth, licensing, agent instruction files,
     dependency manifests and the gate/policy files themselves need a CTO PASS
     (or, for a CTO-authored change, a PASS from another admitted seat) and
     never auto-merge.

The enforced check is `independent-review-policy`; see
[`docs/merge-review.md`](../../docs/merge-review.md). The pure policy used by
tooling and tests lives in `merge-gate.mjs`.

## Low-RAM operation

Direct `spawnSync` invocation (no shell profile), ledger pruning to
`state/archive.jsonl` beyond `runtime.maxLedgerActiveEntries`, and a single
daemon lock.

## Repo profiles (`config.json`)

Each repo has a lead agent, quality gate, target branch and allowed scopes.
`automation.autoMerge` is `false` and `automation.julesDraftsOnly` is `true`.

## CLI

```bash
node tools/jules-conductor/conductor.mjs status     # ledger and RAM
node tools/jules-conductor/conductor.mjs tick       # one scan; records drafts, never merges
node tools/jules-conductor/conductor.mjs daemon     # background loop, single instance
node tools/jules-conductor/conductor.mjs dispatch frankxai/arcanea-ai-app "Fix drawer layout shift" bugfix
node --test tools/jules-conductor/tests/
```

*Built on SIP — Starlight Intelligence Protocol v1.1.1*
