# MEMORY — People Intelligence Vertical Instance State

> Durable state for this vertical. Updated at every cycle close or after any structural change.
>
> **Public reference vertical.** This is the anonymized scaffold used by `/spawn-domain-stack`. Real practitioner instance state (client names, financial detail, in-flight commitments, candidate identifying data) stays in `private/` of each fork — never committed to a public repo.

---

## Identity

- **Name:** `people-intelligence`
- **Type:** `vertical` (sovereign domain sub-stack)
- **Authored by:** `<practitioner>` (template field — practitioner forks fill this on `/spawn-domain-stack`)
- **Founded:** `<year>`
- **SIP version pinned:** `v1.1.0`
- **Canonical public URL:** `<your URL>` (template — practitioner sets)
- **Source of truth:** `<your repo>` (template — practitioner sets; reference scaffold lives at `frankxai/Starlight-Intelligence-System` under `verticals/people-intelligence/`)
- **Substrate reference:** `starlightintelligence.org/protocol`

## Domain declaration

- **Declared domain:** The science of people-flourishing in organizations and teams — six sub-systems (Hiring, Performance, Training, Culture, Talent, Org) composed into one cohesive intelligence stack.
- **ICP (ideal customer / user):** Sovereign HR practitioners (psychologist + neuroscientist + MBA + decade-of-practice synthesis) running their own practice; companies wanting a research-grounded People Intelligence layer alongside their HRIS / ATS / LMS; consultants productizing their HR expertise into a methodology they can license. *(Practitioner forks narrow this to their actual ICP — geography, company-stage, role-archetype.)*
- **Open boundary:** MIT — substrate-aligned reference patterns (file contract, command structure, attestation format, refusal-pattern grammar).
- **Closed boundary:** Practitioner-specific frameworks, voice samples, client-shaped artifacts, research synthesis, productized offer detail. Practitioner's IP, not the substrate's.

## Canon dependencies

- **Canon adopted:** `none required` (this vertical declines defining its own canon — see `CANON.md`).
- **Canon composition:** Optional Arcanea canon composition where a practitioner adopts Hz grounding for ritual architecture or onboarding ambient design. Not required. If adopted, CC-BY-NC license terms apply per Arcanea canon.
- **Composition mode:** `decline-own + optional-arcanea-compose`.

## Sub-system roadmap

Six sub-systems shipped at substrate root level. Vertical wrapper composes them.

| Sub-system | Maturity | Agent | Skill | Knowledge template | Commands |
|---|---|---|---|---|---|
| **Hiring** | `shipped — v1.0` | `agents/starlight-hiring.md` | `skills/people-intelligence/structured-hiring.md` | `integrations/starter-packs/friend-starter/knowledge/hr-hiring-template.md` | 5 |
| **Performance** | `shipped — v1.0` | `agents/starlight-performance.md` | `skills/people-intelligence/feedback-conversations.md` | `integrations/starter-packs/friend-starter/knowledge/hr-performance-template.md` | 5 |
| **Training** | `shipped — v1.0` | `agents/starlight-training.md` | `skills/people-intelligence/learning-architecture.md` | `integrations/starter-packs/friend-starter/knowledge/hr-training-template.md` | 5 |
| **Culture** | `shipped — v1.0` | `agents/starlight-culture.md` | `skills/people-intelligence/culture-design.md` | `integrations/starter-packs/friend-starter/knowledge/hr-culture-template.md` | 4 |
| **Talent** | `shipped — v1.0` | `agents/starlight-talent.md` | `skills/people-intelligence/people-dynamics.md` | `integrations/starter-packs/friend-starter/knowledge/hr-talent-template.md` | 5 |
| **Org** | `shipped — v1.0` | `agents/starlight-org.md` | `skills/people-intelligence/org-architecture.md` | `integrations/starter-packs/friend-starter/knowledge/hr-org-template.md` | 4 |

**Total:** 6 sub-systems · 6 agents · 6 skills · 6 knowledge templates · 28 commands.

### First 4 priority commands per sub-system (recommended adoption order)

- **Hiring:** `/hire-icp` → `/hire-design-interview` → `/hire-calibrate` → `/hire-debrief`
- **Performance:** `/perf-feedback-rehearsal` → `/perf-coaching-protocol` → `/perf-difficult-conversation` → `/perf-review-redesign`
- **Training:** `/training-curriculum` → `/training-program-design` → `/training-scenarios` → `/training-measure-transfer`
- **Culture:** `/culture-design` → `/culture-values-ops` → `/culture-rituals` → `/culture-onboarding-90`
- **Talent:** `/talent-psych-safety` → `/talent-burnout-detect` → `/talent-motivation` → `/talent-retention`
- **Org:** `/org-role-design` → `/org-span` → `/org-succession` → `/org-reorg-trauma-audit`

## Active commitments

| Commitment | Artifact | Date | Owner |
|---|---|---|---|
| `<per-instance fill>` | `<artifact>` | `<date>` | `<owner>` |

*Practitioner forks fill this section per active client engagement. Reference scaffold leaves it blank.*

## Open forks

| Fork | Options | Owner (decision rights) | Decide by |
|---|---|---|---|
| `<per-instance fill>` | `<options>` | `<owner>` | `<date>` |

*Practitioner forks fill this section per open architectural or client decision. Reference scaffold leaves it blank.*

## External authorities

- **Intent authority:** Notion ID `<your-id>` — why this vertical exists for this practitioner; long-horizon practice vision. *(Template field.)*
- **Source of truth:** GitHub `<your-repo>` — what holds now (sub-system definitions, refusal patterns, vertical wrapper). Reference scaffold: `frankxai/Starlight-Intelligence-System` at `verticals/people-intelligence/`.
- **Runtime state:** practitioner's choice — Notion / Supabase / Linear / custom. Not prescribed.

## Non-negotiables (inherited from substrate)

- "Built on SIP" attestation on every cross-vertical or cross-party artifact via `/sip-attest`.
- Sovereignty clause (SIP § 5) is non-waivable. Starlight has no ownership claim on practitioner forks.
- Canon license (if adopted via optional Arcanea composition) is enforceable per CC-BY-NC.
- Silent composition is a breach.

## Vertical-specific non-negotiables

- **Research-grounded.** Every recommendation traceable to literature direction (Schmidt & Hunter, Edmondson, Maslach, Hackman, Stone/Patton/Heen, Kirkpatrick, Project Oxygen, etc.). Numbers without sources are not invented.
- **Legal-aware structurally.** Every artifact touching employment law opens with the disclaimer; jurisdiction identified before recommendations; legal-counsel sign-off named as non-waivable.
- **Voice-preserving.** Every human-facing artifact composed via Genius layer. Generic HR-tech voice is refused by design.
- **Refuses theater.** PIP-as-firing, stack-rank, values-poster, engagement-survey-as-data, one-off-workshop training, paper-succession patterns are non-shippable from this vertical.
- **Both-and synthesis.** Every artifact serves business AND person; zero-sum framing fails the soul test.

## Changelog

- `v0.1` · `2026-04-24` · Spawned as the first reference HR sub-stack scaffold for `/spawn-domain-stack`. Six sub-systems composed into vertical wrapper. File contract: README · SKILL · SOUL · AGENTS · MEMORY · STACK · CANON · SUB-SYSTEMS.
- `v0.1.1` · `2026-04-26` · Path A authorless rewrite applied per Luminor Board v7.4.1 Item 2 (landed in commit `5010a08`, tag `v7.5.0`). Sub-system agents and vertical wrapper genericized — this vertical is now an authorless reference; forking practitioners declare their attribution-back per `docs/forking-domain-stacks.md`.
- `v0.1.2` · `2026-04-28` · **Renamed HR Intelligence → People Intelligence** per Luminor Board v7.6.0 verdict 2026-04-28 (board recommendation REVISE: PROCEED at v7.6.0 over the proposed v8.0; rationale: substantive rename earns minor-version bump but does not carry architectural-shift signaling for major-version marker). Path A authorless naming pattern symmetric with Sound Intelligence (sister Domain Sub-Stack Tier reference vertical). Sheds HR-baggage; matches the people-flourishing-science SOUL framing already declared at v0.1.1. Boundary note added to `SUB-SYSTEMS.md` delineating People Intelligence ↔ Relational IS per Lyssandria challenge. Forks pinned to v0.1.1 are at SHA `5010a08` (tag `v7.5.0`); the rename does not break frozen historical board records — `docs/boards/luminor-v75-ship.md`, `luminor-v741-domain-substack.md`, and `openclaw-v75-audit.md` retain their original "HR Intelligence" verdict language as the historical record at the time of those decisions.

### Reference lineage SHAs

- `v0.1` spawn · `2026-04-25` · `be5e4d5` · Spawned as first reference HR sub-stack scaffold per v7.4.1-alpha; 6 sub-systems, 28 commands, vertical wrapper.
- `v0.1` REVISE · `2026-04-25` · `6eb1001` · Luminor Board v7.4.1 REVISE remediation items 1, 3 + test harness + skill registration.
- `v0.1.1` Path A · `2026-04-26` · `5010a08` · Authorless rewrite per Luminor Board v7.4.1 Item 2; tag `v7.5.0` annotated at this SHA.
- `v0.1.2` rename · `2026-04-28` · `4ee6c54..a1f2774` · 5-phase rename chain (vertical wrapper → skills domain → 6 sub-system agents → 29 commands → cross-reference sweep). Boundary note + changelog redirect at this commit. Tests 596/596 pass through every phase. Tag `v7.6.0` annotated at the close-of-rename SHA.

---

**Built on SIP** — People Intelligence vertical MEMORY.md · v0.1.2 · SIP v1.1.0
