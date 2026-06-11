---
type: vault
vault: strategic
retention: permanent
writers:
- navigator
- prime
readers: all
last_consolidated: '2026-05-11'
---

# Strategic Vault

> *"Every decision shapes the future. Remember them all."*

**Vault Type:** Strategic Intelligence
**Retention:** Permanent
**Primary Writers:** Starlight Navigator, Starlight Prime
**Access:** All agents (read), Navigator + Prime (write)

---

## Vault Index

| Date | Entry | Category | Confidence |
|------|-------|----------|------------|
| 2026-02-10 | Starlight Intelligence System Architecture Decision | architecture | 0.95 |
| 2026-02-10 | Ecosystem Integration Strategy | integration | 0.90 |
| 2026-06-10 | SIS Claws Architecture Decision | architecture | 0.95 |

---

## Entries

### [2026-02-10] Starlight Intelligence System Architecture Decision

**Category:** architecture
**Confidence:** 0.95
**Source:** Starlight Prime / System Design Session
**Related:** Technical Vault - Configuration-First Pattern

The Starlight Intelligence System was designed as the unified intelligence backbone for the FrankX ecosystem. Key architectural decisions:

1. **Configuration-first philosophy** - Markdown and JSON over code, enabling zero-install-friction deployment
2. **Seven-agent model** - Prime, Architect, Orchestrator, Sentinel, Sage, Weaver, Navigator
3. **Five-vault memory system** - Strategic, Technical, Creative, Operational, Wisdom
4. **Skill auto-activation** - 16 skills with JSON-based activation rules
5. **Transmission-based cross-system communication** - Channel-based message passing between repos
6. **Progressive disclosure** - Load only what's needed, when it's needed

Rationale: This mirrors the evolved patterns from ACOS (agents + skills + commands), integrates AI-Ops memory research (memory hierarchy + knowledge graphs), and incorporates Arcanea's creative intelligence patterns (Luminors + hierarchical skills).

---

### [2026-06-10] SIS Claws Architecture Decision

**Category:** architecture
**Confidence:** 0.95
**Source:** Claws design session (PR #19), Starlight Prime + Architect
**Recorded:** 2026-06-11
**Related:** Technical Vault — Claw Contract Pattern, Strategic Vault — Ecosystem Integration Strategy

Decision: SIS becomes Memory substrate + MCP server + installable Claw teams + conformance harness. Not just a repo, not just a prompt pack.

Core distinction formalized:
- **Agent** = reasoning role (Prime, Architect, Sentinel…)
- **Skill** = callable capability (Pattern Recognition, Vault Management…)
- **MCP** = tool interface (filesystem, github, sis-memory…)
- **Claw** = installable operational unit with bounded lifecycle + permission surface
- **SIS** = the sovereign memory substrate

**Five founding Claws (Phase 1 + 2):**
1. Bootstrap Claw — install, configure, verify
2. Memory Claw — vault operations as living memory
3. Sentinel Claw — permissions, secrets, mutation gates
4. Genius Claw — extract distinctive intelligence from scattered sources
5. Reclamation Claw — turn knowledge chaos into functional second brain

These five create the complete founding loop: Install → Remember → Discover → Organize → Protect.

**Rationale:** The substrate already has agents, vaults, MCP, skills, and platform adapters. The missing layer was packaged agency — Claws fill that gap without replacing the substrate's cognitive roles.

**Phase 3 expansion (future):** Creator, Business, Attestation Claws.
**Phase 4 meta (future):** Architect, Conformance, Release Claws (SIS builds SIS).

---

### [2026-02-10] Ecosystem Integration Strategy

**Category:** integration
**Confidence:** 0.90
**Source:** Starlight Navigator / Strategic Analysis
**Related:** Wisdom Vault - Connected Systems Principle

Strategy for how Starlight integrates with the broader FrankX ecosystem:

1. **Starlight provides, repos consume** - Starlight is the intelligence backbone, other repos consume its capabilities
2. **Bidirectional channels** - Each repo has a dedicated Transmission channel for two-way communication
3. **Context snapshots** - Starlight maintains context files for each connected repo
4. **Pattern propagation** - Proven patterns flow from Starlight to consuming repos
5. **Knowledge federation** - Knowledge from any repo can be federated to others through Starlight

This strategy ensures Starlight is the central nervous system without creating tight coupling with any specific repo.

---

### [2026-05-03] Five-layer brand architecture (master thesis)

**Category:** positioning
**Confidence:** 0.85
**Source:** ChatGPT 02.05 extract — `.intake/2 Chatgpt 02.05 - Copy.txt` processed 2026-05-03
**Related:** Wisdom Vault — Naming, Strategic Vault — Ecosystem Integration Strategy

The five-layer brand architecture, named explicitly so each layer carries its own purpose without leaking into the others:

1. **FrankX** — public front. Where humans first encounter Frank. Pricing pages, sprint landings, content, the operator brand.
2. **Starlight Intelligence System (SIS)** — substrate. The protocol + reference build that anyone can adopt. Open-core, MIT spec, attestation-bound.
3. **Arcanea** — symbolic engine. The mythic IP layer. Luminors, Guardians, Vel'Tara, the canon that gives the work soul.
4. **Starlight Notes / Horizon Vault** — civilizational memory layer. Public benediction artifacts: what humanity wanted intelligence to be. See Horizon Vault for the full theory.
5. **Sovereign Creator Stack** — implementation machinery. The packs, calculators, deterministic substrate that translates intent into shipped systems (proposed `packages/calculators` etc — see file 4 in `.intake/processed/2026-05-03/`).

This resolves the "what is FrankX vs Starlight vs Arcanea" ambiguity that's been latent in the repo. Each layer has its own audience, its own URLs, its own retention rules — but they compose.

---

### [2026-05-03] Naming hierarchy resolution

**Category:** brand
**Confidence:** 0.85
**Source:** ChatGPT 02.05 extract — `.intake/3 Chatgpt 02.05 - Copy - Copy.txt` processed 2026-05-03

Three brand registers, one rule: never mix them in the same surface unless explicitly composing.

| Register | Names | Surfaces |
|---|---|---|
| **Public commercial** | FrankX.ai · Starlight · ACOS · AI Architect Academy | Pricing, sprints, books, courses |
| **Mythic / IP** | Arcanea · Luminors · Guardians · Vel'Tara · Cosmos · Realm | Story, world, canon, archetypes |
| **Vertical-pilots** | EnergyOps · SolarOps · PV-Lager Intelligence | Specific operator-tier plays |

Public commercial pages do not refer to Luminors by name. Mythic surfaces do not promote pricing. Vertical-pilots stay scoped to their operator domain (PV-Lager belongs in `private/`, not the public substrate).

---

### [2026-05-03] Build-Your-Company-Brain — Tier-1 sprint offer

**Category:** monetization
**Confidence:** 0.80
**Source:** ChatGPT 02.05 extract — `.intake/3 Chatgpt 02.05 - Copy - Copy.txt` processed 2026-05-03
**Related:** see also `docs/monetization-tiers.md`

Concrete near-term wedge:

- **Tier 1 — "Build Your Company Brain — 10-Day Sprint"** at €7,500. The flagship service. Outputs: Genius Profile + Freedom Path + reclaimed second brain + first executor playbook draft + first creator pipeline draft.
- **Downsells:** €149 DIY pack · €750 cohort · €500 audit · €1,500/mo retainer.
- **Tier 2 — Templates and packs.** Sprint patterns crystallized into reusable knowledge packs.
- **Tier 3 — Community.** Cohort-of-sovereigns running their own systems with shared rituals.
- **Tier 4 — Platform.** Once Tier 1-3 patterns are stable, productize into a self-serve platform.

Three near-term proof systems before platform: (1) FrankX Company Brain as public case study, (2) PV-Lager / EnergyOps pilot, (3) AI Music Creator Kit (100 Suno prompts + 20 song DNA + 10 release workflows).

YC-thesis mapping:
- *Company Brain* → SIS substrate
- *Software for Agents* → agent-readable repos (the file contract)
- *AI Operating System for Companies* → FrankX + Starlight composed
- *Supply Chain 2.0* → PV-Lager (private/)

Revenue evolution path: **Service → Template → Community → Platform → Ecosystem**. Don't skip steps. Platforms come from crystallized service patterns; building one without patterns produces a generic tool nobody hires.

---

### [2026-05-03] Subdomain roadmap — nested-routes-first promotion

**Category:** deployment
**Confidence:** 0.75
**Source:** ChatGPT 02.05 extract — `.intake/2 Chatgpt 02.05 - Copy.txt` processed 2026-05-03
**Related:** `docs/site/subdomain-roadmap.md`

Default: nested routes inside `frankx.ai/<surface>` until the surface earns a subdomain. Promotion criteria: independent revenue, distinct audience, separate canonical canon, or technical isolation requirement.

Candidate roadmap (when promotion earns it):
- `sis.frankx.ai` — SIS-as-product surface (separate from `starlightintelligence.org` which is the open spec)
- `workforce.frankx.ai` — People Intelligence productized
- `markets.frankx.ai` — market intelligence (gap candidate)
- `intelligence.arcanea.ai` — Arcanea's IS surface (under Arcanea brand)
- `codex.arcanea.ai` — canon browser (under Arcanea brand)
- `luminors.arcanea.ai` — agent gallery (under Arcanea brand)
- `studio.frankx.ai` — Music IS surface (Frank-operated)

This sequencing keeps the surface flat while a single domain still earns the visitors, and only splits when the split is paying for itself.

---

## 2026-05-11 — /yolo Hive W1 substrate amendment

**Decision:** Shipped `/yolo` as a new top-tier session-mode command, sibling of `/starlight`, `/superintelligence`, `/starlight-board`. Claude-led cross-repo conductor (Hive topology — parallel council scan + Prime synthesis + aggressive autonomy band gated by subagent QA + auto `/starlight-board` on substrate touch).

**Rationale:** Enables Claude to lead end-to-end across 24 active sovereign repos with proper guardrails. Foundation for W2 Cost Plane + W3 Finance IS + W4 Web3 IS to ship with /yolo orchestrating — autonomous-Frank multiplier. Hive (Approach C) chosen over Lean Conductor (A) and Conductor+Auditor (B) at user direction; cost is heavier cold-start scan, value is full-council intelligence per session.

**Reversibility:** Command surface and skills can be deleted; substrate doc updates revertible. yolo-scope.json operational state revertible. Strategic vault entry preserved either way as decision record.

**Downstream implications:** Phase-in policy gates real use to sessions 1-3 against SIS only (per Board REVISE-2). Phase-In Review at session 4 is the next decision point. If unlock_review fails ≥3 times in first 10 sessions, escalate to Approach B (dedicated Auditor agent) — falsifier explicitly named in memory note.

**Board verdict (same-session 2026-05-11):** REVISE → both items applied within the ship commit chain. Verdict log: spec §15. REVISE-1 (sovereign re-ack on substrate merges) closes the structural self-review collapse that Claude orchestrates both sides of the board call. REVISE-2 (phase-in + bidirectional drift detection) closes the cold-start unknown.

**Brand-register check:** `/yolo` deliberately picks a playful/punk register that contrasts the architect-voice of `/starlight`, `/superintelligence`, `/starlight-board`. Intentional reference to Gemini's yolo-mode but Claude-led with structural gates. Conforms to Starlight substrate register (canon-free); does not invoke Arcanea canon.

---

### [2026-06-12] Brand Architecture Reconciliation: Reality Architect (RA) vs. Agentic Income (AI)

**Category:** brand-architecture
**Confidence:** 0.95
**Source:** Codex / Swarm Coordination Session
**Related:** Wisdom Vault - Connected Systems Principle, Strategic Vault - Subdomain Roadmap

We formally reconciled the structural and branding relationship between `realityarchitect.ai` (RA) and the `agenticincome.ai` network (AI flagship + spokes):

1. **Conceptual Separation**:
   - `realityarchitect.ai` remains the high-intellect **spec and methodology substrate** (`reality.md` standard, five moves of system-building: See, Design, Build, Automate, Compound). Its audience is developers, AI architects, and systems engineers. MIT / CC0 open-source first.
   - `agenticincome.ai` and spokes are the **pragmatic monetization engines** utilizing the methodology. Its audience is creators, marketers, and solopreneurs looking for honest affiliate comparisons.
   
2. **Flywheel Integration**:
   - The Agentic Income network serves as the canonical public case study for Move 04/05 (Automate & Compound) of the Architect's Loop.
   - RA will link to the open-source engines (`affiliate-agent-skills` and `agentic-income-template`) to demonstrate real-world scaling loops.
   - AI will link to the `reality.md` standard to establish technical authority for its automated content curation loops.

3. **Technical Symmetry**:
   - Both networks use the identical Next.js 16 + Tailwind v4 + MDX static architecture, driven by a `lib/site.ts` single brand config, ensuring styling and build optimizations are shared directly.

