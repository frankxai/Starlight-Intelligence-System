# Session continuity — what actually survives a cloud session

**Status:** proposed
**Date:** 2026-09-19
**Owner:** `agent:starlight-coo` (loop health) with `agent:starlight-chief-of-staff` (state assembly)

---

## The question

*How do you pick up here from cloud sessions?*

## The honest answer

**By default, I don't.**

A Claude Code cloud session runs in an ephemeral container. Repositories are cloned fresh at container start. The container is reclaimed after inactivity. Nothing written to disk survives. There is no cross-session memory store attached to this environment — the memory context block in this very session returned *"No recent activity."*

What a fresh cloud session actually inherits, with no action on anyone's part:

| Inherited automatically | Not inherited |
|---|---|
| `CLAUDE.md` and `AGENTS.md` from every cloned repo, loaded as system context | Anything from the previous session's reasoning |
| The full git history of those repos | Anything written to disk and not committed |
| The tool surface (MCP servers, skills, subagents) | Which files the last session was mid-edit on |
| Whatever it reads from git during the session | Open decisions, blocked work, rejected approaches |

So the operating rule is blunt:

> **Continuity is git, or it does not exist.** Every insight worth keeping is a commit. A session that ends without one has produced nothing, regardless of what it reported.

This is the same law `docs/ops/ROUTINE-CONTRACT.md` already states for scheduled routines — *a run that commits nothing must not report green*. Interactive sessions are not exempt; they just fail more quietly.

---

## What is missing, and what this change adds

The estate already has durable prose memory: six vaults under `memory/vaults/`, `SESSION_RUNBOOK.md`, `/handover`, `/eod`. What it does not have is a **machine-readable boot state** — one file a fresh session reads *first* to answer "where was I" without re-reading the estate.

That re-reading is not free. It is the single largest cost a cloud session pays, and `metric:context-reconstruction-cost` exists to make it visible.

**`memory/SESSION_STATE.json`** is the fix. One file, committed, small, current. Not a transcript — a *pointer set*.

### The boot contract

A session that touches this estate reads, in this order, before doing anything else:

1. **`memory/SESSION_STATE.json`** — open threads, live branches, blocked items, the last board verdict.
2. **`ontology/estate-graph.json`** — who owns what and which seat is accountable. One read replaces walking 45 repos.
3. **The vault the work touches** — strategic for decisions, technical for patterns, operational for system state.
4. **`CLAUDE.md` / `AGENTS.md`** of the specific repo — already in context, re-read the sections the task touches.

Steps 1 and 2 are new and cost ~2 reads. They replace an unbounded exploration phase.

### The close contract

A session that changed anything writes back, before ending:

1. Update `memory/SESSION_STATE.json` — close what closed, open what opened.
2. Write the *rationale* to the appropriate vault. The outcome goes in the commit; the reasoning goes in the vault. A successor that inherits only outcomes re-litigates every decision.
3. Commit and push. Unpushed is lost.
4. Rebuild the graph if ontology sources changed: `node scripts/estate-graph.mjs`.

`/handover` and `/eod` already do steps 2–3 in prose. This change gives step 1 a schema.

---

## Why a JSON file and not "better memory"

Because the constraint is structural, not a tooling gap. The container is ephemeral by design, and that design is correct — it is what makes a cloud session safe to run against 45 repositories. The right response is not to fight the ephemerality but to make the **handoff explicit and cheap**.

A prose handover doc is a good artifact for a human. It is an expensive one for an agent, which must read and interpret it before it can act. `SESSION_STATE.json` is the part a machine needs, and it sits beside — not instead of — the prose.

---

## Anti-scope

- Not a second memory product. Layer B stays the six vaults, per `docs/graph-engineering/CONTRACT.md`.
- Not a transcript store. No conversation content, ever.
- Never carries anything from `private/`, any credential, or any monetary figure.
- Not authoritative for truth. It points at where truth lives; the vaults and git hold it.

Built on SIP.
