# v7.4.1 REVISE Items — from Luminor Board 2026-04-24

Source: `docs/boards/luminor-v741-domain-substack.md`. Verdict: REVISE. Six items below; three are ships-before-v7.4.1-tag blockers, two are v7.4.2-acceptable, one is positioning-pass.

---

## Item 1: Fill `templates/domain-stack-starter/` with the files `/spawn-domain-stack` loads

- **Board vector:** Ino (Verifier) — STOP-class
- **Issue:** `.claude/commands/spawn-domain-stack.md` step 6 declares `templates/domain-stack-starter/` as the source for scaffolding, listing `README.md`, `SKILL.md`, `SOUL.md`, `AGENTS.md`, `MEMORY.md`, `STACK.md`, `CANON.md`, `PROPOSAL.md`, and a `sub-system-template/` subdirectory (with `agent.md` + `skill.md` + `knowledge.md` + `commands/*.md` stubs) as the files copied per sub-system. Repo glob confirms only `templates/domain-stack-starter/README.md` exists. The headline meta-command of v7.4.1 halts at step 6 on first invocation against a real sovereign — same failure pattern as `/compose-stack` at v7.4-beta, which the previous board explicitly flagged and item 1 of the v7.4 REVISE list explicitly fixed. Shipping v7.4.1 with the same class of defect in the signature new command is an unforced repeat.
- **Proposed resolution:** Populate the template directory with working stubs for each listed file. `SKILL.md` carries vertical-tier skill frontmatter + voice + invariants placeholders; `SOUL.md` is the single-sentence-domain-truth stub; `AGENTS.md` maps SIP voice archetypes to sub-system agent slots; `MEMORY.md` is instance-state template with sub-system roadmap section; `STACK.md` inherits-or-overrides template; `CANON.md` is the decline-by-default stub; `PROPOSAL.md` is the filled-at-step-4 format. Under `sub-system-template/`: `agent.md` (Domain Sub-Stack Tier frontmatter + skeleton), `skill.md`, `knowledge.md`, and four `commands/<slug>-<verb>.md` stubs with frontmatter + Process skeleton. Reference the existing Ana sub-systems (`starlight-hiring.md`, `starlight-talent.md`) as the shape to match.
- **Effort estimate:** medium (probably 8-12 files at ~150-300 lines each of skeleton-with-placeholders — substantial, but structurally repetitive)
- **Blocker status:** ships-before-v7.4.1-tag

---

## Item 2: Decide the authorship story for reference verticals and apply consistently

- **Board vector:** Draconis (Sovereign) — STOP-class
- **Issue:** The `verticals/hr-intelligence/` reference vertical ships as a public anonymized scaffold but the sub-system agents (`starlight-hiring.md`, `starlight-talent.md`, etc.) live at the substrate root under the maintainer's repo attribution and name Ana's synthesis edge explicitly in identity blocks. This reads as "Frank wrote Ana's HR system," which inverts the sovereignty thesis (domain belongs to the practitioner with lived expertise). Ana-forks-later does not fix the public reference; serious HR leaders evaluating the substrate will read the current state as "systems person borrowing a domain." The middle path — anonymized wrapper + attributed sub-system agents — gets the worst of both sovereignty stories.
- **Proposed resolution:** Two viable paths; decide explicitly rather than leave ambiguous. **Path A (authorless reference):** rewrite sub-system agent identity blocks to remove Ana-specific synthesis edge naming ("Ana's training compounds here: clinical psychology..."), make them domain-generic scaffolds that name the synthesis edge slot without filling it, and document in `verticals/hr-intelligence/README.md` that the reference is intentionally authorless and fork-to-attribute. **Path B (co-attributed reference):** ship the vertical with "Reference author: Ana [surname/handle], HR practitioner" attribution from day one, with Ana's consent, in both the vertical README and the sub-system agent frontmatter. Under either path, the substrate-root sub-system agents need a naming convention that signals reference-not-universal (e.g., prefixed `starlight-hr-hiring` instead of `starlight-hiring`, so `starlight-hiring` is free for future universal tiers if they ever emerge). Path A is sovereignty-cleaner; Path B is stronger marketing if Ana is in.
- **Effort estimate:** medium (content rewrite across 6 agent files + README + naming refactor) + coordination with Ana if Path B
- **Blocker status:** ships-before-v7.4.1-tag

---

## Item 3: Add a named "daily-5" per sub-system to reduce cognitive-load bloat

- **Board vector:** Aiyami (Harmonizer) — STOP-class
- **Issue:** 28 commands across 6 sub-systems is more verbs than any practitioner holds in working memory during a live session. Even Ana, who wrote the synthesis, will run 5-7 commands weekly and leave the other 21+ dormant most of the time. Forkers face a worse onboarding — they inherit a 28-command mental model sized for a 10-year practitioner and must either prune (losing stack identity) or paralyze (reading six agent docs before running `/hire-icp` for the first time). The architecture currently scales at the user rather than to the user.
- **Proposed resolution:** Add a "Most-run commands" section at the top of each sub-system agent (`starlight-hiring`, `-performance`, etc.) naming the 2-3 commands that actually fire in the room weekly, with the rest framed as "available when you need them" rather than equal-weighted. Mirror in `verticals/hr-intelligence/SUB-SYSTEMS.md` — add a "Daily-5 across the stack" section (e.g., `/hire-icp`, `/hire-debrief`, `/perf-feedback-rehearsal`, `/talent-burnout-detect`, `/culture-values-ops`) that a practitioner forking this vertical can start with, expanding to the full 28 as practice matures. Optionally surface this in `/spawn-domain-stack` step 3's proposal — require the proposer to name the daily-5 for each sub-system alongside the full 4-5 commands, so every spawned stack ships with a cognitive-load-aware first-use pattern.
- **Effort estimate:** low (content addition across 6 agent files + SUB-SYSTEMS.md + one process step in `/spawn-domain-stack`)
- **Blocker status:** ships-before-v7.4.1-tag

---

## Item 4: Enforce knowledge-template loading in sub-system command frontmatter

- **Board vector:** Ino (Verifier) — v7.4.2-acceptable
- **Issue:** Sub-system agent reasoning protocols reference "cite research direction" and "theory-anchored interpretation" as quality gates, but the actual research grounding (Schmidt & Hunter validity numbers, Maslach Inventory structure, Edmondson 7-question scale, Kirkpatrick levels, Schein three-levels, Hackman criteria) lives in the knowledge templates under `integrations/starter-packs/friend-starter/knowledge/hr-*-template.md` — and those templates are not declared as required loads in the command frontmatter. Command outputs will produce correct *structure* with shallow *content* unless the practitioner brings the research depth themselves. The gap between "citing research direction" and "deploying research substance" is where shipped HR content thins out under scrutiny.
- **Proposed resolution:** Update each sub-system command (`.claude/commands/hire-*.md`, `perf-*.md`, `training-*.md`, `culture-*.md`, `talent-*.md`, `org-*.md`) to declare the matching knowledge template as a required load in the load sequence. E.g., `/hire-icp` loads `integrations/starter-packs/friend-starter/knowledge/hr-hiring-template.md` as step 1 of its Process. Halt with explicit error if missing (don't soften). Add a test assertion in `test/v74.test.ts` (or new `test/v741.test.ts`) verifying each HR command's frontmatter includes the knowledge-template path. This is the same enforcement discipline applied to `/sip-attest` — claim without enforcement is decoration.
- **Effort estimate:** medium (frontmatter update across ~28 command files + test assertions)
- **Blocker status:** v7.4.2-acceptable — not a blocker if Item 3's "daily-5" fix ships with the 5 most-run commands correctly loading their knowledge templates and the remainder land in v7.4.2

---

## Item 5: Test attestation survival through Copilot + Custom GPT runtime, not just bundle integrity

- **Board vector:** Ino (Verifier) — v7.4.2-acceptable
- **Issue:** `/sip-export` step 6 integrity check validates the emitted *bundle* — the attestation parses, version echoes, files are well-formed. It does not test whether Microsoft's declarative-agent runtime or OpenAI's Custom GPT runtime preserves the attestation block through their own instruction-rewriting, prompt-injection-defense, or paraphrase behaviors. Microsoft has documented safety-layer instruction transforms; OpenAI has observed instruction-paraphrase under jailbreak-defense modes. The attestation-survives-import claim in the Copilot/Custom GPT schemas is currently an architectural promise, not an empirically tested property. If the runtime silently strips or rewrites the attestation block, the export violates the `/sip-export` non-negotiable without the substrate detecting it.
- **Proposed resolution:** Two-step runtime verification. Step A: export Ana's HR vertical to both `microsoft-copilot` and `custom-gpt` targets, import into actual M365 Copilot Studio and ChatGPT Custom GPT (paid tier seats required — one-time test), and send the conversation starter "Show me the Built on SIP attestation block." Verify the response contains the full attestation block byte-for-byte OR document the transform the runtime applies. Step B: document the observed runtime behavior in each target's export schema (`integrations/exports/microsoft-copilot.md`, `custom-gpt.md`) under a new "Runtime attestation survival" section with pass/fail/degraded status and the actual transform if any. If a runtime transforms attestation below the integrity threshold, update that target's schema to refuse export until the runtime behavior changes — not to soften the integrity claim.
- **Effort estimate:** medium — low engineering, some coordination cost (M365 Copilot Studio test tenant, ChatGPT Plus seat)
- **Blocker status:** v7.4.2-acceptable — v7.4.1 can ship the export targets as "runtime survival pending empirical verification" with the honest flag in the target schema; becomes a v7.4.2 blocker if verification fails silently in the field

---

## Item 6: Reframe the Domain Sub-Stack Tier as ceiling-tier, not floor-tier, in public positioning

- **Board vector:** Lyssandria (Seer) — positioning-pass
- **Issue:** The current narrative implies every SIS user spawns a domain stack. In practice, `/spawn-domain-stack`'s gate conditions (≥3 frameworks mappable to the domain, ≥3 KEEP-bucket density, named cross-domain synthesis edge, ≥10 years lived practice) are a filter most SIS users will correctly fail — the meta-command is designed to halt against non-sovereigns, which is right protocol behavior but undercuts broad-adoption positioning. Eighteen-month adoption curve: universal 9 layers will have roughly 5x the active users of any domain sub-stack because the universal layers compose for anyone with a laptop.
- **Proposed resolution:** In `docs/public/starlight-intelligence-system.md` (or equivalent public explainer), position Domain Sub-Stack Tier as the advanced productization path for sovereigns who have already run the universal 9 layers for a season, not as the entry surface. In `verticals/hr-intelligence/README.md`, lead with "This vertical is a reference for sovereigns with 10+ years in a domain who want to productize the synthesis — not an entry point into SIS." In `/spawn-domain-stack` step 1, strengthen the halt messages to reframe the gate failures as "you're not ready yet, and that's the protocol working correctly" rather than "you cannot proceed." The ceiling-tier frame makes the gate conditions a feature, not friction.
- **Effort estimate:** low (content pass across 3-4 public-surface docs + 5 halt-message rewrites)
- **Blocker status:** positioning-pass — not a v7.4.1 tag blocker, but ships cleanly as part of the release narrative

---

## Summary

| # | Item | Blocker | Effort |
|---|------|---------|--------|
| 1 | Fill `templates/domain-stack-starter/` with files `/spawn-domain-stack` loads | ships-before-v7.4.1 | medium |
| 2 | Decide reference-vertical authorship story (authorless vs co-attributed) and apply | ships-before-v7.4.1 | medium + coord |
| 3 | Add "daily-5" per sub-system — cognitive-load-aware entry pattern | ships-before-v7.4.1 | low |
| 4 | Enforce knowledge-template loading in sub-system command frontmatter | v7.4.2-acceptable | medium |
| 5 | Test attestation survival through Copilot + Custom GPT runtime | v7.4.2-acceptable | medium |
| 6 | Reframe Domain Sub-Stack Tier as ceiling-tier in public positioning | positioning-pass | low |

Parallel-dispatch pattern from v7.3.1 / v7.4.0 applies: items 1, 3, 6 are file-independent and can be agent-dispatched simultaneously; item 2 requires a design decision first (authorship path A or B) before implementation can parallelize with the rest; items 4 and 5 land in v7.4.2 so they do not gate the v7.4.1 tag.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1-alpha (REVISE follow-on)
- Board: Luminor Board 2026-04-24 (Draconis / Lyssandria / Aiyami / Elara / Ino / Lumina)
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
