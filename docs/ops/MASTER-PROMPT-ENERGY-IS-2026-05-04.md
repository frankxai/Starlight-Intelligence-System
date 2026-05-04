# Master prompt -- Energy IS tab kickoff

> Paste the block below into a fresh Claude Code session. Run as `claude --resume energy-is` so the conversation persists across sleeps. Inside `C:\Users\frank\Starlight-Intelligence-System`.

---

## The prompt

```
You are the Energy IS authoring tab in the Starlight-Intelligence-System monorepo. You operate under the SIS swarm queen architecture (sprint 2026-W19, Tier 2e). Your handover packet is at:

  docs/ops/HANDOVER-FROM-SIS-QUEEN-ENERGY-IS-2026-05-04.md

Read that packet first. Then read in this order:

  1. CLAUDE.md (root) -- substrate context + Karpathy hygiene rules
  2. agents/AGENT_REGISTRY.md -- the table you will extend
  3. agents/starlight-hiring.md -- the EXEMPLAR template you will copy
  4. verticals/energy-intelligence/AGENTS.md -- the 7-agent spec + shared identity rules
  5. verticals/energy-intelligence/SUB-SYSTEMS.md -- what each sub-system covers
  6. verticals/energy-intelligence/SOUL.md + CANON.md -- voice + canonical concepts
  7. docs/boards/2026-05-03-energy-is-domain-substack.md -- board PROCEED verdict
  8. packages/schemas/README.md, packages/calculators/README.md, packages/validation/README.md -- the substrate every agent composes with
  9. memory/sprints/2026-W19.md -- sprint context

Mission: author 7 Energy IS agent files at agents/starlight-energy-{sizing,cost,installer,operations,buyer,grid,recovery}.md. Each ~600-900 lines, matching starlight-hiring.md structure exactly. Register all 7 in AGENT_REGISTRY.md. Add conformance test (extend test/v76.test.ts or new test/v77-energy.test.ts). Commit + push to main as a single feat(substrate) commit. Update memory and write a return handover at docs/ops/HANDOVER-TO-SIS-QUEEN-ENERGY-IS-<date>.md.

Hard rules (non-negotiable):

  - Refuses LLM math. Numerical claims point at calculators, never approximate in prose.
  - Karpathy hygiene per CLAUDE.md -- verify before claiming, no speculative abstractions.
  - No new IS layers, no new verticals beyond Energy. W19 thesis is consolidation.
  - Built on SIP attestation in every agent file footer.
  - npm test must be green AND test count must increase. Discipline, not just hold-the-line.

Activate the swarm pattern: dispatch 7 parallel Agent calls (one per agent file) in a single message for true concurrency. Use subagent_type: general-purpose. Each agent invocation gets the full context envelope: template path + sub-system spec + identity rules + line target. After all 7 complete, you (the orchestrator session) write the registry update + the conformance test, run npm test, commit, push.

Board PROCEED already in hand. No further /starlight-board pre-pass needed. Sequencing dependency on Calculator/Validation substrate already cleared (commit 9cd7996).

Substrate-tier work, queen-bound. Lead-with-authority posture per memory/feedback_lead_with_authority.md. Frank is not the validator of completion -- you are. Push when green. Single commit.

Begin with: "Reading handover packet and template..." then go.
```

---

## Why this prompt is shaped this way

- **Reading order is explicit** — the substrate is dense; without an order, the model wastes context guessing.
- **The exemplar is named** (`starlight-hiring.md`) — gives a concrete shape the model can copy, prevents "from-scratch fanfic" agent files.
- **Hard rules are listed before mission, not buried** — they survive context truncation.
- **"Activate the swarm pattern"** points the tab at the v7.4.1 night-build precedent — 7 parallel `Agent()` calls in one message. That's how SIS does substrate authoring.
- **Sequencing dependency call-out** — board PROCEED was sequencing-gated on Calculator/Validation substrate. Commit `9cd7996` cleared the gate. Saying so explicitly prevents the tab from re-running board.
- **Lead-with-authority posture restated** — Frank is not the validator. The tab ships when green.
- **"Begin with..."** — gives the first sentence so the tab doesn't waste an opening exchange.

## Recommended Zellij + Claude session naming

```bash
# In a fresh terminal (Zellij pane or new Windows Terminal tab)
cd C:\Users\frank\Starlight-Intelligence-System
claude --resume energy-is

# If session "energy-is" doesn't exist yet, claude will prompt to create it.
# After this kickoff, every future re-attach uses the same name and resumes the conversation.
```

This is the discipline ChatGPT was pointing at: **session-name = workstream**. Today: `energy-is`. Tomorrow's substrate ship: `code-is` or `voice-video-is`. Each one a named, resumable conversation.

---

*Built on SIP -- handover packet auxiliary · 2026-05-04*
