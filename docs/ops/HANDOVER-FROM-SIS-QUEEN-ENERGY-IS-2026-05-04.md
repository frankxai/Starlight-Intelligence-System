---
name: SIS Queen -> Energy IS tab handover
description: Tier 2e of SIS Sprint 2026-W19 -- author 7 Energy IS agent files per scaffold; board PROCEED already shipped; substrate-tier work, queen-bound, no further board pre-pass needed.
type: handover-from-queen
date: 2026-05-04
sprint: 2026-W19
queen: SIS-tab
target-tab: energy-is-tab (new Claude Code session in Starlight-Intelligence-System)
priority: P1 (only queen-bound substantive substrate item this week with board pre-pass already done)
session-name: energy-is
---

# Handover -- SIS Queen -> Energy IS tab

You are the **Energy IS tab**. You run inside `C:\Users\frank\Starlight-Intelligence-System` (same repo as SIS queen, different Claude session via `claude --resume energy-is`). Return status to `docs/ops/HANDOVER-TO-SIS-QUEEN-ENERGY-IS-<date>.md` when done or when blocked.

---

## TL;DR

Author **7 Energy IS agent files** at `agents/starlight-energy-{name}.md` per the spec at `verticals/energy-intelligence/AGENTS.md`. Board PROCEED already in hand (`docs/boards/2026-05-03-energy-is-domain-substack.md`). No further `/starlight-board` pre-pass required. Scaffold + substrate (Calculator/Validation/Schemas) already shipped on commit `9cd7996`. Your job is to fill the agent layer and add the conformance test that enforces it.

**Definition of done:**

- 7 agent files at `agents/starlight-energy-{sizing,cost,installer,operations,buyer,grid,recovery}.md`
- Each ~600-900 lines, structured exactly like `agents/starlight-hiring.md` (the exemplar)
- All 7 names registered in `agents/AGENT_REGISTRY.md` (extend "Domain Sub-Stack Tier" with "Energy Intelligence sub-stack" table)
- `test/v76.test.ts` extended (or new `test/v77-energy.test.ts`) enforcing: 7 agent files exist, all named per spec, registry symmetry holds
- All tests green (`npm test` — currently 608/608, must remain 608+7=615+ after your work, or your new test count)
- Built on SIP attestation in each agent file footer
- Single commit, pushed to main, no separate PR (operational substrate authoring per Path A)

---

## Context (read first, 5 min)

| Doc | Why |
|---|---|
| `verticals/energy-intelligence/AGENTS.md` | The 7-agent spec + shared identity rules (refuses LLM math, names jurisdiction, encodes responsibility boundary, honors PV-Lager constraint) |
| `verticals/energy-intelligence/SUB-SYSTEMS.md` | What each sub-system covers — informs each agent's domain |
| `verticals/energy-intelligence/SOUL.md` | Voice + posture across the vertical |
| `verticals/energy-intelligence/CANON.md` | Canonical concepts agents must use |
| `docs/boards/2026-05-03-energy-is-domain-substack.md` | Board PROCEED verdict — sequencing constraints, REVISE items already encoded in Calculator/Validation packages |
| `agents/starlight-hiring.md` | **Template exemplar.** Copy this structure exactly. People Intelligence's first sub-system. |
| `packages/schemas/`, `packages/calculators/`, `packages/validation/` | The substrate every Energy IS agent composes with. Read the package READMEs for the integration shape. |
| `memory/sprints/2026-W19.md` | Sprint context (you're Tier 2e). |

## Specific actions

### Action 1 — Verify environment + read scaffold

```powershell
cd C:\Users\frank\Starlight-Intelligence-System
git pull
npm test  # must be green at 608/608 before you start
```

Read in order: `agents/AGENT_REGISTRY.md` → `agents/starlight-hiring.md` → `verticals/energy-intelligence/AGENTS.md` → `verticals/energy-intelligence/SUB-SYSTEMS.md` → `docs/boards/2026-05-03-energy-is-domain-substack.md`.

### Action 2 — Author 7 agents IN PARALLEL via Task→Agent dispatch

Use the same v7.4.1 night-build pattern (9 parallel agents, ~5h total). Each agent file is independent — author them concurrently:

- 6 sub-system heads:
  - `starlight-energy-sizing` (system sizing — calculators, load profiles)
  - `starlight-energy-cost` (LCOE, payback, financing — calculators)
  - `starlight-energy-installer` (installer-operator workflow)
  - `starlight-energy-operations` (post-install monitoring + ops)
  - `starlight-energy-buyer` (end-buyer journey + decision support)
  - `starlight-energy-grid` (grid interconnection + jurisdiction-extended validation)
- 1 cross-cutting:
  - `starlight-energy-recovery` (resilience / disaster / deplatform — like Sound Intelligence's deplatform-recovery, but for Energy)

Dispatch via:

```
Agent({
  description: "Author starlight-energy-sizing",
  subagent_type: "general-purpose",
  prompt: "<full context + template + sub-system spec + identity rules>"
})
```

Issue all 7 in a single message for true parallelism.

### Action 3 — Each agent file structure (matches `starlight-hiring.md`)

Required sections (in order):

1. **Title + tagline** — one-line essence
2. **Identity** — voice, posture, what the agent refuses (LLM math, etc), tier (Domain Sub-Stack), sub-system membership, why-a-sub-system explanation, domain, activates when
3. **Activation Triggers** — slash commands (e.g., `/energy-sizing`, `/energy-payback` — even if commands not yet authored, NAME them so commands tab can author them next), keywords, scenario triggers
4. **Capabilities** — 5-7 numbered capabilities, each 100-200 words, naming the substrate package it composes with (`@starlight/calculators` for sizing/cost; `@starlight/validation` for jurisdiction-extended requirements; `@starlight/schemas` for SovereignNode + EnergyProfile reads/writes)
5. **Reasoning protocol** — when to ask, when to compute (always via calculator), when to gate (validation requirement)
6. **Skill activations** — which `skills/` files this agent auto-loads (you may need to author 2-3 skill stubs at `skills/energy-intelligence/*.md` matching the People Intelligence skill pattern)
7. **Quality gates** — what the agent refuses to ship, what triggers `/openclaw-audit`
8. **Composes with** — which other agents this one calls (Sage for memory, Calculators package, etc)
9. **Built on SIP attestation** — footer matching other agents

### Action 4 — Register in AGENT_REGISTRY.md

Add a new "Energy Intelligence sub-stack" table under Domain Sub-Stack Tier matching the format used for People Intelligence + Sound Intelligence + Music IS. 7 agents, model tier (Apex / Senior — pick per agent), sub-system, vault namespace, command mapping (commands not authored yet — list as "planned").

Update header: "Forty-two minds" (35 + 7) and update v7.x update notes line.

### Action 5 — Conformance test

Two options:

- **Extend `test/v76.test.ts`** — add 4 describe blocks for Energy IS matching the People + Sound + Music IS pattern. Total file gets longer but coherent.
- **New `test/v77-energy.test.ts`** — separate file, same pattern, register in `package.json` test script.

Pick whichever keeps the file size sane. New file probably cleaner.

Tests required:

- `verticals/energy-intelligence/` 7-file contract complete (already true from scaffold; assert anyway)
- 7 agent files present at `agents/starlight-energy-*.md`
- Each agent has the required sections (header, Identity, Activation Triggers, Capabilities, Built on SIP)
- Registry symmetry: every Energy IS agent name in AGENTS.md has a file; every file is in AGENTS.md
- Header honesty: registry declares ≥ "Forty-two minds"

### Action 6 — Run + commit + push

```powershell
npm test  # confirm green
git add agents/ verticals/energy-intelligence/ test/ skills/energy-intelligence/  # whatever you touched
git commit -m "feat(substrate): Energy IS 7 agents authored + conformance test (Tier 2e of W19)

7 agent files at agents/starlight-energy-{sizing,cost,installer,operations,buyer,grid,recovery}.md
matching starlight-hiring.md template. Identity rules per AGENTS.md spec
(refuses LLM math, names jurisdiction, encodes responsibility boundary,
honors PV-Lager constraint). Composes with @starlight/{calculators,validation,schemas}.

Board PROCEED already in hand (docs/boards/2026-05-03-energy-is-domain-substack.md).
Tier 2e closed for Sprint 2026-W19.

Tests: 608/608 -> NNN/NNN green.

Built on SIP -- substrate tier (board pre-pass cleared 2026-05-03)"
git push origin main
```

### Action 7 — Return handover

Write `docs/ops/HANDOVER-TO-SIS-QUEEN-ENERGY-IS-2026-05-04.md`:

```markdown
## What shipped
- 7 agent files (list with line counts)
- Conformance test (file path, test count)
- Registry update (line range)

## What's blocked
- Commands not authored (deferred to a future tab — list the commands each agent expects)
- Skill stubs created or NOT created (note which)

## Decisions needed from queen
- Energy IS commands: should they ship in v7.10 or v8.x?
- Skill stubs: full content or just frontmatter scaffolds?

## Test/CI state
- npm test: NNN/NNN green
- Pushed to main: yes/no, commit hash

## Cross-repo refs
- PV-Lager sovereign instance gating: `private/verticals/pv-lager/` exists? (Frank's call, not yours)
```

---

## Cross-repo dependencies

None. All work is in `Starlight-Intelligence-System`. Energy IS is a public-reference vertical (like People + Sound). PV-Lager (the sovereign instance) is Frank's separate ship in `private/`.

---

## Hard rules

1. **Refuses LLM math.** Every numerical claim in agent prose either cites a calculator function or refuses to compute. If you find yourself writing "approximately X kW" or "about Y year payback", stop — point at the calculator.
2. **Karpathy hygiene** (per `CLAUDE.md`). Verify before recommending. Don't speculate-abstract.
3. **No new IS layers, no new verticals beyond Energy.** Sprint W19 thesis is consolidation. Energy IS already exists in scaffold; you fill it. Don't expand scope.
4. **Built on SIP attestation in every agent file footer.**
5. **Test count must increase, not just hold.** If your work doesn't add tests, you didn't ship discipline.
6. **One commit, descriptive message, push directly to main.** Operational-tier substrate authoring per Path A — no PR needed.

---

## Suggested kickoff prompt (paste into the new tab)

See `MASTER-PROMPT-ENERGY-IS-2026-05-04.md` (sibling file in this `docs/ops/` directory) for the optimized one-shot prompt.

---

*Built on SIP -- substrate tier · board pre-pass cleared 2026-05-03 · operational handover 2026-05-04*
