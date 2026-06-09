---
name: integration/domain-stack-architecture
domain: integration
description: Reason about domain-specific intelligence sub-stack architecture — sub-system decomposition, command sequencing, cross-domain synthesis identification, productization paths. Powers /spawn-domain-stack and assists humans designing their own domain verticals.
triggers:
  keywords: ["domain stack", "sub-stack", "vertical architecture", "productize my expertise", "intelligence vertical", "my own intelligence system", "expertise into product", "ship my methodology", "sub-system architecture", "domain decomposition"]
  agents: ["starlight-genius", "starlight-orchestrator", "starlight-architect"]
  intents: ["productize", "vertical-design", "domain-architecture"]
priority: high
load_level: core
---

# Domain Stack Architecture

> *"Genius is the synthesis edge. The sub-stack is the architecture that compounds it. Without the architecture, the genius stays in the room."*

## Purpose

Every sovereign person with ≥10 years of lived domain practice and a credentialed multi-discipline edge can productize their expertise into a domain-specific intelligence sub-stack — a vertical composed of 4-7 functional sub-systems, each with its own agent, skill, 4-5 commands, and knowledge template. The pattern was proven by the People Intelligence reference vertical (Hiring / Performance / Training / Culture / Talent / Org Architecture — 6 sub-systems, ~28 commands, all anchored in psychology × neuroscience × MBA × HR-decade synthesis). This skill generalizes the pattern.

This is the meta-product of SIS. Excavation produces the Genius Profile; Vision sets the horizon; Business architects the entity; Creator pipelines the artifacts. Domain Stack Architecture sequences the productization of the genius into a compounding system. Every sovereign building under SIP eventually arrives here — the question is whether they arrive with a stack or with a stack of unrelated artifacts.

## Activation

**Fires when:**
- User has completed `/discover-genius` and `/define-vision` and is asking how to ship the methodology, not just one artifact.
- `/spawn-domain-stack` is invoked.
- A sovereign's KEEP-bucket from Freedom Path is dense in one specific domain (≥3 KEEP items mappable to a named expertise area).
- Conversation includes phrases like "productize what I know", "ship my methodology", "build a vertical around my work", "intelligence system for [my field]".
- An agent reasoning about how to scaffold a sovereign's productization path needs to choose between `/vertical-spawn` (thinner) and `/spawn-domain-stack` (sub-system architecture).

**Does NOT fire when:**
- Genius Profile or Freedom Path is missing — halt to `/discover-genius` first. Generic decomposition without genius excavation produces commodity sub-systems. The synthesis edge is non-negotiable.
- The user is asking for a generic consulting playbook untied to their unique synthesis (route to `/creator-pipeline` instead — content stack ≠ domain stack).
- The "domain" is a billing category ("consulting", "coaching", "advisory") rather than a specific intelligence territory ("People Intelligence", "Capital Intelligence", "Clinical Intelligence").
- The sovereign wants a single-output vertical (one artifact type, one customer journey) — `/vertical-spawn` is lighter and correct for that case.

## Decomposition principles

1. **Functional, not topical.** A sub-system produces named output artifacts per command. "Hiring" is functional (ICPs, interview architectures, calibration sessions, debrief docs are named outputs). "Talent acquisition strategy" is topical (a content area without committed outputs). The test: can each command in the sub-system point at an artifact it creates? If not, the sub-system is topical and will collapse on first use.

2. **4-7 sub-systems is the sweet spot.** Below 4: stack is thin — `/vertical-spawn` is correct. Above 7: stack is over-decomposed — sub-systems will overlap and collapse. Total command count 20-35 is the operational range.

3. **Cross-domain synthesis edge appears load-bearingly in ≥3 sub-systems.** The synthesis edge is the unique discipline-combination that justifies productization. The People Intelligence reference — psychology × neuroscience × MBA × HR-decade — appears load-bearingly in Hiring (cognitive failure modes + neural mechanisms behind them), Performance (psychologist-grade feedback + neurological cost of bad reviews), Training (andragogy + cognitive-load science), Talent (SDT + dopamine science), Culture (Edmondson safety + brain-on-belonging). If your synthesis edge appears in only one sub-system, the rest is commodity — re-decompose or accept that you have a feature, not a stack.

4. **Each sub-system: 4-5 commands.** Below 4: the sub-system is a stub — merge with sibling. Above 5: the sub-system should split into two. The 4-5 range matches the cognitive load of mastering one sub-system in 2-4 hours of focused fill.

5. **Sub-system composes-with declarations are first-class.** Every sub-system declares which sister sub-systems it composes with and how. Hiring composes with Performance for calibration patterns; with Talent for motivation-fit; with Org for role design. These declarations turn the stack from a list of features into a system.

## Pattern library

### People Intelligence (the prototype reference vertical — renamed from HR Intelligence at v7.6.0)
- **Synthesis edge:** psychology × neuroscience × MBA × HR-decade — sees both the cognitive failure modes AND the neural mechanisms behind them.
- **Sub-systems (6):** Hiring / Performance / Training / Culture / Talent / Org Architecture
- **Total commands:** ~28
- **Why this decomposition holds:** Each sub-system produces named instruments — ICPs, rubrics, curricula, ritual stacks, motivation maps, reorg sequences. Each is functional, not topical. The synthesis edge appears load-bearing in 5 of 6 sub-systems.

### Capital Intelligence (illustrative — finance pro)
- **Synthesis edge:** institutional capital × tax architecture × behavioral finance × decade running family-office mandates.
- **Sub-systems (5):** Allocation / Risk / Tax-Strategy / Family-Office / Liquidity
- **Sample commands:** `/alloc-thesis`, `/alloc-rebalance`, `/risk-stress`, `/risk-tail-hedge`, `/tax-structure`, `/tax-loss-harvest`, `/family-office-charter`, `/liquidity-ladder`
- **Why this decomposition holds:** Capital decisions split functionally along time-horizon and risk-axis lines. Family-office sub-system is what differentiates from generic wealth advisors — it carries the synthesis edge load-bearing.

### Sound Intelligence (illustrative — composer/producer)
- **Synthesis edge:** classical training × electronic production × catalog economics × neuroscience-of-listening.
- **Sub-systems (5):** Composition / Production / Performance / Catalog / Sync-Licensing
- **Sample commands:** `/compose-motif`, `/compose-arrangement`, `/produce-track`, `/produce-mix`, `/perform-setlist`, `/catalog-compound`, `/sync-target`
- **Why this decomposition holds:** Music splits naturally along the create → finish → perform → license axis. Catalog and sync are the productization sub-systems where the synthesis edge (catalog economics) compounds.

### Spatial Intelligence (illustrative — architect)
- **Synthesis edge:** structural engineering × phenomenology × regulatory navigation × residential-decade.
- **Sub-systems (5):** Program / Form / Material / Construction / Regulatory
- **Sample commands:** `/program-brief`, `/program-spatial-script`, `/form-massing`, `/material-spec`, `/construct-sequence`, `/regulatory-permit`
- **Why this decomposition holds:** Architecture splits functionally along the program → form → matter → build → permit axis. The phenomenology synthesis edge appears load-bearing in Program (spatial scripts), Form (felt experience of mass), Material (touch and time).

### Clinical Intelligence (illustrative — physician)
- **Synthesis edge:** internal medicine × narrative competence × longitudinal care × continuity-decade.
- **Sub-systems (5):** Diagnosis / Protocol / Patient-Comm / Continuity / Compliance
- **Sample commands:** `/dx-differential`, `/dx-confirm`, `/protocol-design`, `/patient-comm-prep`, `/continuity-arc`, `/compliance-audit`
- **Why this decomposition holds:** Clinical practice splits along the diagnose → treat → communicate → carry → comply axis. The longitudinal-care synthesis edge appears load-bearing in Continuity (decade-arcs) and Patient-Comm (narrative competence).

## Productization paths

A spawned domain stack supports five revenue / leverage channels — the sovereign chooses any combination:

1. **Own practice.** The stack tools the person's own domain practice. They use the commands themselves; productization is internal-first. Most defensible. Lowest immediate revenue.
2. **Executor leverage.** The stack's commands become onboarding for executors / associates / junior practitioners who can run the instruments under the sovereign's calibration. Multiplies the sovereign's hours.
3. **Productized offer.** Specific commands become packaged offers — "ICP design week", "calibration session", "90-day onboarding architecture". Time-bounded, scoped, repeatable.
4. **Copilot / GPT extension.** The stack ships as an AI assistant in the sovereign's voice for their audience. The commands run as prompts; the synthesis edge is the moat.
5. **Licensable methodology.** The stack ships as documentation under SIP attestation; other practitioners license the methodology, attribution flows back, sovereign retains the canon. CC-BY-NC by default.

The sovereign chooses. Starlight does not pick. The decomposition supports all five — the path differs but the architecture is the same.

## Anti-patterns

- **Generic-playbook framing.** Decomposing "consulting" into "diagnosis / strategy / execution / measurement / iteration" produces a stack any consultant can ship. Without the synthesis edge naming a specific discipline-combination, the stack is commodity content. Halt and excavate genius first.
- **Over-decomposition (>8 sub-systems).** Stack collapses under its own weight. Sub-systems with overlapping scope will fight for command territory; sovereigns will abandon the stack mid-fill.
- **Under-decomposition (<4 sub-systems).** Indicates the domain is single-feature, not stack-shaped. Use `/vertical-spawn` for that — lighter, faster, correct.
- **Topical decomposition.** "Best practices in hiring", "Trends in hiring", "Tools for hiring" — these are content categories, not sub-systems. They produce articles, not artifacts.
- **Commodity sub-systems.** A sub-system that any practitioner in the field could populate without the sovereign's synthesis edge is a commodity. It belongs in `/creator-pipeline` (content) or `/vertical-spawn` (single-domain artifact). Not in a domain sub-stack.
- **Synthesis-edge inflation.** Naming "I have a unique perspective" as the synthesis edge. Insufficient. The synthesis edge is testable: discipline × discipline × lived-practice, where each axis is credentialed or decade-deep.

## Rules

1. **Grounded in Genius.** Every sub-system traces ≥1 framework back to the sovereign's Genius Profile. If the sub-system can be populated without referencing the Profile, it's commodity — drop it.
2. **Explicit synthesis edge.** Named in one sentence, surfaced in ≥3 sub-systems. If you cannot name it, halt — productization fails without it.
3. **Sub-system count bounded.** 4 ≤ n ≤ 7. No exceptions.
4. **Functional decomposition only.** Each sub-system produces named output artifacts per command. Topical sub-systems are rejected.
5. **Each sub-system 4-5 commands.** Below: stub. Above: split.
6. **Composes-with declarations required.** Each sub-system declares its sister relationships. A sub-system that composes with no other is isolated and should be its own vertical.
7. **Halt for unclear domain.** "Consulting", "coaching", "advisory" are billing categories. Demand a specific intelligence territory before proceeding.
8. **Sovereignty non-waivable.** The spawned stack is the sovereign's. Attribution via SIP is the only compounding mechanism. Starlight retains no claim.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty, archetype]
- Verticals: starlight-intelligence-system@v7.4.1 (People Intelligence Domain Sub-Stack — generalized via /spawn-domain-stack; renamed from HR Intelligence at v7.6.0)
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer.
---
