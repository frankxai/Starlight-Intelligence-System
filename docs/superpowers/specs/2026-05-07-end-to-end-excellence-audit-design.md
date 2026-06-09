---
date: 2026-05-07
skill: superpowers:brainstorming
status: shipped (operational tier) + queued (substrate tier)
---

# End-to-End Excellence Audit — Brainstorming Skill Spec

This spec exists to satisfy the `superpowers:brainstorming` skill flow per the night-of-2026-05-06 conversation. The actual audit content lives at the canonical excellence-audit doc:

**→ [`docs/excellence/2026-05-07-end-to-end-excellence-audit.md`](../../excellence/2026-05-07-end-to-end-excellence-audit.md)**

## Context

Frank's directive (2026-05-06 23:xx, paraphrased):
> "B+more. Review whole repo end-to-end — engineering, depth of memory, capabilities, skills, website, SEO, copywriting, design, AI context engineering, all that SIS is meant to be. Top billion-dollar agency standards. Going to bed, no more questions, execute."

The brainstorming skill HARD-GATEs anything beyond design until the user approves the design. The user's explicit "execute, no more questions" directive overrides per skill instruction-priority rule (user instructions > skill > default system).

## Approach taken

1. **Step 1 — Explore project context**: read README.md, SIP.md, STACK.md, SKILL.md, AGENT_REGISTRY.md, site/src/app/page.tsx, site/src/app/layout.tsx, site/package.json, .gitignore, and ran `git status`/`git log` to ground the audit in actual repo state.

2. **Step 2 — Visual companion offer**: skipped. Audit + recommendations are text-driven; no UI mockup question to answer.

3. **Step 3 — Clarifying question**: one question asked (A/B/C/D scoping). User picked **B+more** (audit + ship quick wins + comprehensive engineering/memory/capabilities/skills review).

4. **Step 4 — Propose 2-3 approaches**: skipped per user "no more qs". Approach: dispatch 3 specialist subagents (UX, SEO/AEO, engineering) in parallel + main-thread substrate synthesis + ship operational quick wins as scoped commits + queue substrate items for `/starlight-board`.

5. **Step 5 — Present design**: this spec + the audit doc are the design output.

6. **Step 6 — Write design doc**: this file + canonical audit doc.

7. **Step 7 — Spec self-review**: completed inline below.

8. **Step 8 — User reviews spec**: Frank's morning review of these two docs satisfies the gate.

9. **Step 9 — Transition to `superpowers:writing-plans`**: triggered when Frank greenlights any of the 10 ranked actions in the audit doc.

## What shipped

Three commits to `main` (NOT pushed):
- `38775df chore(hygiene): ungate dist/ + gitignore operator-private + audit-leakage artifacts`
- `5e7fa4c feat(site/seo): sitemap.ts + robots.ts + llms.txt + fix SIP version drift`
- `2b6266b feat(site/aeo): JSON-LD Organization + WebSite + SoftwareSourceCode + alternates.canonical`

Plus local config: `git config core.hooksPath tools/git-hooks` (pre-commit symmetry hook is now live).

## What's queued

**Substrate-tier (3 items, need `/starlight-board` pre-pass):**
- Q1: Fix `AGENTS.md` drift (15 min after board)
- Q2: v80 platform-prompt symmetry harness (45 min after board)
- Q3: Memory-must-operate invariant (encode in substrate via dreaming cron + consolidation log)

**Operational (10 items, no gate):**
- O1-O10 detailed in the canonical audit doc

## Spec self-review

- **Placeholder scan**: no TBDs, no TODOs, no incomplete sections in either doc.
- **Internal consistency**: audit doc Top-10 references match the substrate Q1/Q2/Q3 + operational O1-O10 numbering. Verification commands are concrete + runnable.
- **Scope check**: this audit is a SINGLE coherent deliverable (review + ship + queue). No need for further decomposition.
- **Ambiguity check**: each ranked action names a target file + change + leverage × effort. Frank can pick any without further clarification.

## Skill-flow exit

Brainstorming skill completes here. Next skill (when Frank greenlights any item) = `superpowers:writing-plans` for that item's implementation plan.

---

**Built on SIP** · v1.1.1 · operational tier · 2026-05-07
