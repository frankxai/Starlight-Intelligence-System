# The AGENTS.md contract — where the agent contract lives

**Status:** proposed. Touches the SIP § 1 file-contract, so `/starlight-board` runs before tag or merge, per `CLAUDE.md` § substrate-tier governance gate.
**Date:** 2026-09-19
**Owner:** `agent:starlight-cto` (topology) with `agent:starlight-caio` (substrate)

---

## The question

*Should `AGENTS.md` live centrally in SIS, one per company, or one per repo?*

## The decision

**One `AGENTS.md` per repository. Never per company. Never one central copy.**
**A company is a registry row in SIS, not a file — and it is *projected into* every repo it owns.**

The three options are not equivalent, because `AGENTS.md` is not documentation. It is a **harness artifact**: the file an agent reads at session start because it landed in that working tree. A contract that is not in the tree is not read. Centralising it deletes it.

The opposite failure is equally real: 45 hand-maintained copies drift, and the drift is already measurable.

| Observed, 2026-09-19 | Count |
|---|---|
| Repos in the estate | 45 |
| With `AGENTS.md` | 29 |
| Without any agent contract | 16 |
| **T0/T1 repos without one** | **2** (`starlight-agent-skills`, `GenCreator-Studio`) |
| Divergent beyond repair by reading | `arcanea` — 8 lines of Cursor Cloud port notes; no DNA, no voice, no branch protocol, no canon gate |
| Corrupted | `Starlight-Intelligence-System` — BOM + 170 cp1252 double-encodings in the substrate's own contract *(repaired in this change)* |

Copies drift. Generation does not. So: **the file is per-repo; the *source* of most of it is not.**

---

## The three-band model

Every `AGENTS.md` has exactly three bands, in this order. Only one of them is hand-written.

### Band A — inherited (generated; never hand-edited)

Identical across the estate. Frank DNA, the five behavioural guardrails, decision discipline, branch/PR protocol, the multi-agent coordination rules, the attestation clause, the safety non-waivables.

Generated from SIS. Fenced with markers so the generator can replace it without touching anything else:

```markdown
<!-- STARLIGHT:BAND-A:BEGIN v1 sha=... — generated, do not hand-edit -->
...
<!-- STARLIGHT:BAND-A:END -->
```

Editing inside the fence is a lint failure. Change it upstream in SIS and regenerate.

### Band B — company projection (generated; never hand-edited)

This is where **"AGENTS.md per company"** actually lands. Not as a file per company — as a *projection* of one company row into each repo that company owns:

- which company owns this repo, and its stage
- which **legal entity** it routes through (name and role only — never jurisdiction, never terms)
- which **brand register** applies here, and the `COPY.md` pin that governs it
- which **executive seat** is accountable, and where this repo escalates
- the repo's **tier** (T0–T3) and what that implies about installing it

Source: `ontology/company-registry.json` + `ontology/repo-tiers.json`. Same fence, same rule.

### Band C — repo-local (hand-written; the generator never touches it)

Build and test commands. Ports. Local gotchas. Domain contracts that exist only here — the canon gate in `arcanea`, the fail-closed money rule in `payment-intelligence-system`, the homepage preservation contract in `frankx.ai-vercel-website`, the non-clinical boundary in the mind repos.

**Band C outranks Band A and B on any conflict inside its own repo**, and says so in the generated preamble. A generated contract that can silently override a local safety gate is worse than no generated contract.

---

## Direction of generation

```
ontology/company-registry.json ─┐
ontology/repo-tiers.json        ├─→  scripts/agents-md-project.mjs  ─→  <repo>/AGENTS.md
VOICES.md · CLAUDE.md (DNA)    ─┘                                         bands A + B only
```

One way. SIS is the source; the repo is the destination. Nothing reads a repo's `AGENTS.md` back into SIS.

**Prior art already in the estate:** `agentic-ops-hub` runs exactly this pattern — `AGENTS.md` is the single source and `node scripts/sync-agent-rules.mjs` fans it out to every tool-specific format, with `--check` in CI. The generator generalises that from one repo to the estate; it does not invent it.

### `CLAUDE.md` vs `AGENTS.md`

Unchanged and orthogonal. `AGENTS.md` is the cross-harness contract (Codex, Cursor, Cline, Gemini, Grok, OpenCode). `CLAUDE.md` is the Claude-specific deepening on top of it. **Where a repo has both and they disagree, that repo's `CLAUDE.md` wins** — that is already the stated rule in `payment-intelligence-system` and SIS, and this change does not disturb it.

---

## What this makes enforceable

`scripts/estate-graph.mjs` fails the build on:

- **INV-6** — a T0 or T1 repo whose `AGENTS.md` is absent or divergent. Currently **3 errors**: `starlight-agent-skills`, `GenCreator-Studio`, and — until the band split ships — every T0/T1 repo still carrying a fully hand-written file (warning today, error once the generator lands).
- **INV-1** — a repo owned by zero or two companies.
- **INV-7** — money, jurisdiction, or credentials leaking into a public projection.

---

## Migration, in order

1. **Repair what is broken.** SIS `AGENTS.md` BOM + mojibake — *done in this change*.
2. **Write Band C where it is missing.** 16 repos, hand-written, one per repo. No generator can invent local build commands.
3. **Ship the generator.** `scripts/agents-md-project.mjs`, with `--check` for CI.
4. **Backfill T0/T1 first** (10 repos), then T2. T3 repos get nothing until Frank rules on consolidation.
5. **Flip INV-6 to error** for handwritten T0/T1 once step 4 completes.

Step 2 is the real work and it does not parallelise well — it is 16 repos of genuine local knowledge. Steps 3–5 are mechanical.

---

## What this deliberately does not do

- Does not create a fifth graph. The estate graph is a projection over existing sources, per `docs/graph-engineering/CONTRACT.md` hard-forbid #1 and #3.
- Does not touch `SIP.md`, `SIS.md`, or the sovereignty clause.
- Does not archive, rename, or consolidate any repo. T3 is a **proposal** to Frank; an agent never archives a repo.
- Does not centralise voice. `VOICES.md` and the brand `COPY.md` pins remain authority; Band B only names which pin applies.

Built on SIP.
