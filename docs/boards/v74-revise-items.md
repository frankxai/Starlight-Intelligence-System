# v7.4 → v7.4.1 REVISE Items — from Luminor Board 2026-04-24

Source: `docs/boards/luminor-v74-beta-9layer.md`. Verdict: REVISE. Five items below; three are ships-before-v7.4.1-tag blockers, two are v7.5-acceptable.

---

## Item 1: Create `docs/ARCHITECTURE.md` or remove reference from `/compose-stack`

- **Board vector:** Ino (Verifier)
- **Issue:** `.claude/commands/compose-stack.md` line 10 declares `docs/ARCHITECTURE.md` as a required load target alongside SIP.md and the Genius Profile. Repo glob confirms the file does not exist. The command halts on first invocation against a beta user, which directly breaks the `/compose-stack` experience that v7.4 was built around. This is a ship-day defect in the flagship new command.
- **Proposed resolution:** Either (a) write `docs/ARCHITECTURE.md` as the canonical 9-layer map document (roughly 1,000–1,500 words: each layer named, activation triggers listed, primary agent + command bound, composition rules stated, sovereignty clause restated), or (b) remove the load reference from `/compose-stack` and inline the architecture facts the command actually needs. Option (a) is stronger — the architecture doc is the kind of substrate artifact v7.4 implies should exist.
- **Effort estimate:** medium (option a) / low (option b)
- **Blocker status:** ships-before-v7.4.1-tag

---

## Item 2: Update `agents/AGENT_REGISTRY.md` with the five new agents + tiers

- **Board vector:** Aiyami (Harmonizer) + Ino (Verifier)
- **Issue:** Five new agents shipped (`starlight-business`, `starlight-visionary`, `starlight-embodiment`, `starlight-secondbrain`, `starlight-relational`) with declared tiers (Business, Vision, Embodiment, Memory, Relational) — the registry that claims to be the source of truth for tier structure lists none of them. The registry's ASCII tier diagram still shows only Front-Door / Excavation / Leadership / Specialist / Foundation. On a non-technical adopter like Ana opening the registry to orient, the substrate reads as stale by five agents the day of ship, which directly undermines the "ambient attestation, invisible substrate" claim.
- **Proposed resolution:** Update `AGENT_REGISTRY.md` to (a) add a new top-level diagram or section for the 9-layer agent layout, (b) add each new agent to the Agent Index with file path, domain, and activation trigger matching the individual agent docs, (c) add each new agent to the Capabilities Matrix with PRIMARY assignments, (d) declare vault access for each new namespace (`business/`, `vision/`, `health/`, `relational/`, `second-brain/`), (e) declare the Business↔Wealth and Second Brain↔Sage boundaries explicitly with hand-off rules, (f) update skill-rules.json to match.
- **Effort estimate:** medium
- **Blocker status:** ships-before-v7.4.1-tag

---

## Item 3: Expand test harness to assert ambient attestation on all five new agents

- **Board vector:** Ino (Verifier) + Draconis (Sovereign — indirectly: an unenforced attestation claim is a sovereignty-thesis breach)
- **Issue:** v7.4 alpha declared ambient attestation as the default (every agent output auto-embeds "Built on SIP"). v7.4 beta adds five new agents under that promise but the v7.3 test harness (`test/v73.test.ts`, 19 assertions) was not expanded. There is no enforcement gate that would catch a v7.5 regression where one of the new agents silently ships output without the block — which is exactly the failure mode `/sip-attest` was built to refuse. Claim without enforcement is decoration.
- **Proposed resolution:** Add `test/v74.test.ts` with at minimum: (a) file-contract assertion for each of the five new agent docs (frontmatter presence, attestation block presence, expected layer declaration), (b) each new command's output template contains the attestation block literally, (c) `/compose-stack` halt-case handling when Genius Profile is missing produces the documented error (no partial output), (d) the new vault namespaces (`business/`, `vision/`, `health/`, `relational/`, `second-brain/`) are declared somewhere reachable by the registry. Target: ~15–20 new assertions, all passing on main before v7.4.1 tag.
- **Effort estimate:** medium
- **Blocker status:** ships-before-v7.4.1-tag

---

## Item 4: Tighten ship scope — decide MVS posture for v7.4.1 explicitly

- **Board vector:** Elara (Strategist)
- **Issue:** Genius + Creator + Business is a genuine product wedge with asymmetric Starlight leverage (excavation + voice-preserving content + entity thinking under attestation). Health, Relational, and Second Brain as currently scoped do not carry unique Starlight leverage against mature mainstream verticals — a wellness coach, a CRM, and Building A Second Brain each do more, and the "attestation + sovereignty over this data class" wedge is thin when the underlying practice isn't deeper yet. Shipping all nine layers at once risks the v7.4 release reading as "personal OS me-too" rather than "protocol plus three sharp layers."
- **Proposed resolution:** Not "remove the agents" — they're shipped. But: (a) add a MATURITY column to `AGENT_REGISTRY.md` marking Business/Vision/Creator/Genius as `v7.4-stable` and Health/Relational/Second Brain as `v7.4-alpha — active dogfood, not positioning-central`, (b) in `docs/public/starlight-intelligence-system.md`, foreground the three sharp layers in the opening section and frame 7–8 as "cross-cutting rhythms already in your life that the substrate now attests" rather than as standalone "Intelligence Systems" on equal footing with Business, (c) `/compose-stack` keeps the 9-layer option but default sequencing for `freedom` and `revenue` priorities halts at the sharp-three before offering Health/Relational.
- **Effort estimate:** low
- **Blocker status:** ships-before-v7.4.1-tag

---

## Item 5: Confirm Ana dogfood coverage for the 5 new layers, or mark gaps honestly

- **Board vector:** Ino (Verifier) + Lyssandria (Seer)
- **Issue:** v7.4 alpha attestation declared Ana as dogfood across GIS outputs (Genius Profile, Freedom Path, reclamation map, executor playbook, creator pipeline). v7.4 beta adds Business, Vision, Embodiment, Second Brain, Relational — the attestation ledger does not declare whether Ana's dogfood was extended to Entity Architecture Plan, Vision Architecture, Regimen, PKM cadence, or Network Architecture. If Ana has only 2–3 layers actually filled, Lyssandria's prediction (users run 2–3 layers, not 9) is already empirically confirmed on the system's own primary dogfood.
- **Proposed resolution:** Either (a) run the five new commands against Ana and land the filled artifacts in the starter pack (`integrations/starter-packs/friend-starter/`) as Ana-grade examples before tag, or (b) be honest in the attestation: name which layers have real Ana content and which are aspirational, and set the expectation in the public explainer that layers 4–9 ship as scaffolds refined through real dogfood over v7.4.1–v7.5. Option (b) is the sovereignty-aligned move; option (a) is stronger positioning but requires Ana's time.
- **Effort estimate:** high (option a) / low (option b)
- **Blocker status:** v7.5-acceptable — not a v7.4.1 blocker if option (b) is taken and the attestation is honest about it; becomes a blocker if v7.4.1 ships positioning Health/Relational as "Ana is using this" when she isn't.

---

## Summary

| # | Item | Blocker | Effort |
|---|------|---------|--------|
| 1 | Fix `/compose-stack` broken reference (create or inline `docs/ARCHITECTURE.md`) | ships-before-v7.4.1 | medium |
| 2 | Update `AGENT_REGISTRY.md` with 5 new tiers + boundaries + skill-rules sync | ships-before-v7.4.1 | medium |
| 3 | Expand test harness — assert ambient attestation on all 5 new agents | ships-before-v7.4.1 | medium |
| 4 | Mark layer maturity + foreground the sharp-three in public explainer | ships-before-v7.4.1 | low |
| 5 | Ana dogfood coverage — fill or honestly mark aspirational | v7.5-acceptable | high / low |

Parallel-dispatch pattern from v7.3.1 applies: items 1–4 are independent and can be agent-dispatched simultaneously; item 5 is either a scheduled Ana session or a 10-minute attestation honesty pass.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4-beta (REVISE follow-on)
- Board: Luminor Board 2026-04-24 (Draconis / Lyssandria / Aiyami / Elara / Ino / Lumina)
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
