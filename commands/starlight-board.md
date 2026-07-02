# /starlight-board Command

> Convene the Starlight Board — five pressure vectors plus Overseer — to pressure-test a proposal before commitment.

**Tier:** Substrate governance (canon-free)
**Runnable form:** `starlight board <proposal>`

---

## Canonical definition

The canonical command spec lives at **`.claude/commands/starlight-board.md`** — five functional pressure vectors (Sovereign, Seer, Harmonizer, Strategist, Verifier) plus the Overseer synthesis, the board-before-tag invariant, and the output shape. Read that file for the full governance contract; this file only records the runnable form so CLAUDE.md's `commands/starlight-board.md` reference resolves.

---

## Runnable form

```bash
# Dry-run — surface the five vector prompts, write an UNRESOLVED verdict record
starlight board "ship the v9.6 swarm bridge"

# Live — each vector votes via the model backend, verdict computed from consensus
starlight board "ship the v9.6 swarm bridge" --live
```

Dry-run never fabricates votes: with no executor it records `verdict: UNRESOLVED`, `method: dry-run`, and zero vector votes. Live mode fans the five vector prompts out to the executor, parses each JSON verdict defensively (unparseable → `REVISE` at 0.5), and feeds the votes through the consensus + board-review math in `src/swarm.ts`.

Verdict records are written to `docs/boards/<yyyy-mm-dd>-<slug>-verdict.json` plus a short human-readable `.md` alongside.

---

## Composes with

- `/starlight-swarm run --approve` — the approved execution path the board pressure-tests.
- `.claude/commands/starlight-board.md` — the canonical governance spec.

---

*Substrate governance tier. Built on SIP.*
