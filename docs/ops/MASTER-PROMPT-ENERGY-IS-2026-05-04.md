# Master prompt — Energy IS tab kickoff

> Paste the block below into a fresh Claude Code session. Run as `claude --resume energy-is` so the conversation persists across sleeps. Inside `C:\Users\frank\Starlight-Intelligence-System`.
>
> **Refined 2026-05-05** via `/po` skill: tightened reading order, surfaced constraints earlier, fixed test-file naming collision (was `v77-energy.test.ts`, but `v77-skill-rules.test.ts` shipped 2026-05-05; new file is `v78-energy.test.ts`).

---

## The prompt

```
ROLE: Energy IS authoring tab in Starlight-Intelligence-System monorepo. SIS swarm queen architecture, sprint 2026-W19 Tier 2e.

CONSTRAINTS (read first, non-negotiable):
- Refuse LLM math. Numerical claims invoke @starlight/calculators, never approximate in prose.
- Karpathy hygiene per CLAUDE.md: verify before claiming. No speculative abstractions.
- Scope is exactly 7 agent files. No new IS layers, no new verticals.
- Every agent file footer carries "Built on SIP" attestation.
- npm test must be green AND test count must increase.

READ IN THIS ORDER (5 min):
  1. docs/ops/HANDOVER-FROM-SIS-QUEEN-ENERGY-IS-2026-05-04.md  (the packet)
  2. CLAUDE.md  (substrate context + Karpathy rules)
  3. agents/AGENT_REGISTRY.md  (the table you extend)
  4. agents/starlight-hiring.md  (EXEMPLAR — copy this structure)
  5. verticals/energy-intelligence/{AGENTS.md, SUB-SYSTEMS.md, SOUL.md, CANON.md, COMMANDS.md}
  6. docs/boards/2026-05-03-energy-is-domain-substack.md  (board PROCEED already)
  7. packages/{schemas,calculators,validation}/README.md  (substrate to compose with)

DELIVERABLES (single feat(substrate) commit, pushed to main):
  1. agents/starlight-energy-{sizing,cost,installer,operations,buyer,grid,recovery}.md
     Each ~600-900 lines, structure matches starlight-hiring.md exactly.
  2. agents/AGENT_REGISTRY.md updated — Energy Intelligence sub-stack table added.
  3. test/v78-energy.test.ts (NEW — note: v77 is taken by skill-rules symmetry test).
     Asserts: 7 files exist, named per spec, registered in AGENT_REGISTRY.md, header honest.
  4. memory entry + return packet at docs/ops/HANDOVER-TO-SIS-QUEEN-ENERGY-IS-2026-05-05.md

SWARM PATTERN: dispatch 7 parallel Agent calls in ONE message (subagent_type: general-purpose), one per agent file. Each agent gets the exemplar path + sub-system spec + identity rules + ~750-line target. After all 7 complete, you (orchestrator) write registry + conformance test, run npm test, commit, push.

BOARD: PROCEED already in hand. Sequencing-gate on Calculator/Validation substrate cleared by commit 9cd7996. No further /starlight-board pre-pass needed.

POSTURE: Lead-with-authority per memory/feedback_lead_with_authority.md. Frank is not the validator. Push when green.

OUTPUT CONTRACT: when complete, your final response names the commit hash + the return-handover path + npm test count delta. No prose summaries beyond that.

Begin: "Reading handover packet and exemplar..." then dispatch.
```

---

## Changes from prior version (refined via `/po`)

- **Pass 4 — Constraints up front:** Hard rules now the second block, immediately under ROLE. Was buried mid-prompt.
- **Pass 2 — Specificity:** "Read that packet first" → numbered reading order (5 min budget). "Activate the swarm pattern" → "SWARM PATTERN: dispatch 7 parallel Agent calls in ONE message".
- **Pass 7 — Output contract:** Added explicit final-response shape (commit hash + return-handover path + test count delta). Was implicit.
- **Pass 3 — Structure:** Numbered sections (ROLE / CONSTRAINTS / READ / DELIVERABLES / SWARM / BOARD / POSTURE / OUTPUT) instead of paragraphs.
- **Caught and fixed:** Original mentioned `test/v77-energy.test.ts` — but `test/v77-skill-rules.test.ts` shipped 2026-05-05 (commit `bd7f94c`). Renamed to `test/v78-energy.test.ts` to avoid collision.
- **Compression:** Tightened from ~450 tokens to ~370 tokens (~18% reduction) without losing intent.

## Why this prompt is shaped this way

- **Reading order is explicit + time-budgeted** — substrate is dense; the model wastes context guessing without it. Adding "5 min" sets pacing expectation.
- **Exemplar named** (`starlight-hiring.md`) — gives a concrete shape to copy. Prevents "from-scratch fanfic" agent files.
- **Constraints listed before mission** — survives context truncation. Failure-modes named explicitly (LLM math, scope creep, test discipline).
- **"SWARM PATTERN: dispatch 7 parallel Agent calls in ONE message"** — points at the v7.4.1 night-build precedent. That's how SIS does substrate authoring.
- **Sequencing dependency call-out** — board PROCEED was sequencing-gated on Calculator/Validation substrate. Commit `9cd7996` cleared the gate. Saying so explicitly prevents the tab from re-running board.
- **Lead-with-authority posture restated** — Frank is not the validator. The tab ships when green.
- **OUTPUT CONTRACT** — explicit response shape prevents the tab from over-reporting at completion.

## Recommended Zellij + Claude session naming

```bash
# In a fresh terminal (Zellij pane or new Windows Terminal tab)
cd C:\Users\frank\Starlight-Intelligence-System
claude --resume energy-is

# If session "energy-is" doesn't exist yet, claude will prompt to create it.
# After this kickoff, every future re-attach uses the same name and resumes the conversation.
```

Or simply: `arc energy-is` (opens the Zellij layout shipped 2026-05-04 with claude pre-cwd'd).

This is the discipline ChatGPT was pointing at: **session-name = workstream**. Today: `energy-is`. Tomorrow's substrate ship: `code-is` or `voice-video-is`. Each one a named, resumable conversation.

---

## Token estimate

| Version | Approx tokens (1 token ≈ 4 chars) |
|---|---|
| Pre-`/po` (2026-05-04) | ~450 |
| Post-`/po` (2026-05-05) | ~370 |
| Reduction | ~18% (without losing intent) |

---

*Built on SIP — handover packet auxiliary · 2026-05-04 (initial) · 2026-05-05 (refined via /po + caught v77 collision)*
