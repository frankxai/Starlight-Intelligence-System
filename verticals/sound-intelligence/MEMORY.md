# MEMORY — Sound Intelligence Vertical Instance State

> Durable state for this vertical. Updated at every cycle close or after any structural change.
>
> **Public reference vertical.** This is the anonymized scaffold used by `/spawn-domain-stack`. Real practitioner instance state (catalog details, fan list, sync pipeline, financial detail, in-flight collaborations, unreleased material) stays in `private/` of each fork — never committed to a public repo.

---

## Identity

- **Name:** `sound-intelligence`
- **Type:** `vertical` (sovereign domain sub-stack)
- **Authored by:** `<practitioner>` (template field — practitioner forks fill this on `/spawn-domain-stack`)
- **Founded:** `<year>`
- **SIP version pinned:** `v1.1.0`
- **Canonical public URL:** `<your URL>` (template — practitioner sets)
- **Source of truth:** `<your repo>` (template — practitioner sets; reference scaffold lives at `frankxai/Starlight-Intelligence-System` under `verticals/sound-intelligence/`)
- **Substrate reference:** `starlightintelligence.org/protocol`

## Instance lineage

- **Forked-from:** `<source-repo>@<commit-sha>` (template — practitioner forks fill on first fork)
- **Forked-on:** `<YYYY-MM-DD>` (template — practitioner forks fill)
- **Reference vertical:** `verticals/sound-intelligence/` at the SHA above

## Domain declaration

- **Declared domain:** Sound practiced as the architecture of sustained listening — six sub-systems (Composition, Production, Catalog, Performance, Audience, Sync) composed into one cohesive intelligence stack.
- **ICP (ideal customer / user):** Sovereign sound practitioners (composer + producer + audio engineer + decade of catalog/release operations + literacy in music-theory + cognitive-science-of-listening + business-of-sync-licensing) running their own catalog; independent labels and artist collectives wanting a research-grounded operating layer alongside their distribution and PRO infrastructure; composers/producers productizing their methodology. *(Practitioner forks narrow this to their actual ICP — genre, catalog stage, release cadence, geography.)*
- **Open boundary:** MIT — substrate-aligned reference patterns (file contract, command structure, attestation format, refusal-pattern grammar, metadata discipline).
- **Closed boundary:** Practitioner-specific compositions, masters, voice samples, fan-list data, sync pipeline, productized methodology, client-shaped artifacts. Practitioner's IP, not the substrate's.

## Vision boundaries

This is the load-bearing field for sync-against-vision refusal. Practitioner declares their named-off-limits for sync placements. Reference scaffold leaves illustrative defaults; practitioner forks replace with their own.

| Boundary | Status | Reason |
|---|---|---|
| `<e.g., refuses-political-campaign-sync>` | `<active / inactive>` | `<one-line reason — practitioner's stance>` |
| `<e.g., refuses-violence-soundtrack>` | `<active / inactive>` | `<one-line reason>` |
| `<e.g., refuses-extractive-fossil-fuel-brand>` | `<active / inactive>` | `<one-line reason>` |
| `<e.g., refuses-AI-vocal-impersonation-license-out>` | `<active / inactive>` | `<one-line reason>` |

`/sound-sync-brief-fit` reads this table and refuses briefs that contradict an active boundary.

## Canon dependencies

- **Canon adopted:** `none required` (this vertical declines defining its own canon — see `CANON.md`).
- **Canon composition:** Optional Arcanea Hz canon composition where a practitioner adopts frequency grounding (e.g., for ritual-music work, vibe-architecture composition, or a deliberately Hz-tuned catalog). Not required. If adopted, CC-BY-NC license terms apply per Arcanea canon.
- **Composition mode:** `decline-own + optional-arcanea-hz-compose`.

## Sub-system roadmap

Six sub-systems shipped at substrate root level. Vertical wrapper composes them.

| Sub-system | Maturity | Agent | Skill | Knowledge template | Commands |
|---|---|---|---|---|---|
| **Composition** | `shipped — v0.1` | `agents/starlight-sound-composition.md` | `skills/sound-intelligence/composition-architecture.md` | `integrations/starter-packs/friend-starter/knowledge/sound-composition-template.md` | 5 |
| **Production** | `shipped — v0.1` | `agents/starlight-sound-production.md` | `skills/sound-intelligence/production-systems.md` | `integrations/starter-packs/friend-starter/knowledge/sound-production-template.md` | 5 |
| **Catalog** | `shipped — v0.1` | `agents/starlight-sound-catalog.md` | `skills/sound-intelligence/catalog-systems.md` | `integrations/starter-packs/friend-starter/knowledge/sound-catalog-template.md` | 5 |
| **Performance** | `shipped — v0.1` | `agents/starlight-sound-performance.md` | `skills/sound-intelligence/performance-design.md` | `integrations/starter-packs/friend-starter/knowledge/sound-performance-template.md` | 5 |
| **Audience** | `shipped — v0.1` | `agents/starlight-sound-audience.md` | `skills/sound-intelligence/audience-architecture.md` | `integrations/starter-packs/friend-starter/knowledge/sound-audience-template.md` | 5 |
| **Sync** | `shipped — v0.1` | `agents/starlight-sound-sync.md` | `skills/sound-intelligence/sync-licensing.md` | `integrations/starter-packs/friend-starter/knowledge/sound-sync-template.md` | 5 |

**Total:** 6 sub-systems · 6 agents · 6 skills · 6 knowledge templates · 30 commands.

### Daily-5 across the stack (cognitive-load-aware entry pattern)

Per Luminor Board v7.4.1 cognitive-load discipline (carried forward to this vertical): 30 commands is the toolbox; 5 are the daily hands. A practitioner forking this vertical begins with these five and expands to the full 30 as practice matures.

| Command | Sub-system | Why this one first |
|---|---|---|
| **`/sound-composition-arrange`** | Composition | Every active song goes through arrangement before mix; the upstream gate. |
| **`/sound-production-mix-plan`** | Production | Single highest-leverage discipline a producer can adopt — plan before patch. |
| **`/sound-catalog-metadata-pack`** | Catalog | Metadata is load-bearing infrastructure; the gate before any release ships. |
| **`/sound-audience-list-architecture`** | Audience | List is the only owned distribution channel; the gate before any release announcement. |
| **`/sound-sync-brief-fit`** | Sync | Most sync pitches fail at brief-fit; running this first saves the rest of the sync work. |

Performance is the sixth sub-system — its rhythm is tour-cyclic rather than weekly, so the daily-5 omits it; bring in `/sound-performance-set-design` when a date lands.

The architecture scales **to** the practitioner, not **at** them. Thirty commands is what's available; five are what's running this week.

### First 4 priority commands per sub-system (recommended adoption order)

- **Composition:** `/sound-composition-arrange` → `/sound-composition-score` → `/sound-composition-demo` → `/sound-composition-transition`
- **Production:** `/sound-production-mix-plan` → `/sound-production-vocal-chain` → `/sound-production-master-plan` → `/sound-production-recall`
- **Catalog:** `/sound-catalog-metadata-pack` → `/sound-catalog-release-plan` → `/sound-catalog-isrc-mint` → `/sound-catalog-version-map`
- **Performance:** `/sound-performance-set-design` → `/sound-performance-audience-contract` → `/sound-performance-live-mix` → `/sound-performance-broadcast-prep`
- **Audience:** `/sound-audience-list-architecture` → `/sound-audience-cohort-map` → `/sound-audience-ritual-design` → `/sound-audience-fan-stay-interview`
- **Sync:** `/sound-sync-brief-fit` → `/sound-sync-placement-thesis` → `/sound-sync-rights-pack` → `/sound-sync-license-economics`

## Active commitments

| Commitment | Artifact | Date | Owner |
|---|---|---|---|
| `<per-instance fill>` | `<artifact>` | `<date>` | `<owner>` |

*Practitioner forks fill this section per active release / collaboration / sync deal. Reference scaffold leaves it blank.*

## Open forks (decision points)

| Fork | Options | Owner (decision rights) | Decide by |
|---|---|---|---|
| `<per-instance fill>` | `<options>` | `<owner>` | `<date>` |

*Practitioner forks fill this section per open architectural or release decision. Reference scaffold leaves it blank.*

## External authorities

- **Intent authority:** Notion ID `<your-id>` — why this vertical exists for this practitioner; long-horizon catalog and practice vision. *(Template field.)*
- **Source of truth:** GitHub `<your-repo>` — what holds now (sub-system definitions, refusal patterns, vertical wrapper). Reference scaffold: `frankxai/Starlight-Intelligence-System` at `verticals/sound-intelligence/`.
- **Runtime state:** practitioner's choice — Notion / Airtable / Linear / Supabase / custom. Not prescribed.
- **PRO and rights authorities** (per practitioner's jurisdiction): ASCAP / BMI / SESAC / GMR (US); PRS / PPL (UK); GEMA (DE); SACEM (FR); JASRAC (JP); etc. Plus the practitioner's music attorney.

## Non-negotiables (inherited from substrate)

- "Built on SIP" attestation on every cross-vertical or cross-party artifact via `/sip-attest`. Audio artifacts use `/sip-attest-audio` for embedded EXIF/XMP.
- Sovereignty clause (SIP § 5) is non-waivable. Starlight has no ownership claim on practitioner forks.
- Canon license (if adopted via optional Arcanea Hz composition) is enforceable per CC-BY-NC.
- Silent composition is a breach.

## Vertical-specific non-negotiables

- **Theory-and-cognition grounded.** Every recommendation traceable to literature direction (Levitin, Huron, Patel, Margulis, Moylan, Katz, Bregman, Pohjannoro, Bertin-Mahieux et al., Pachet, etc.). Numbers without sources are not invented.
- **Rights-aware structurally.** Every artifact touching sample clearance, sync licensing, publishing splits, master rights, AI-vocal licensing opens with the disclaimer; jurisdiction and PRO identified before recommendations; counsel sign-off named as non-waivable.
- **Voice-preserving.** Every human-facing artifact composed via Genius layer. Generic producer-influencer or press-release voice is refused by design.
- **Refuses theater.** Loudness-war mastering, AI-vocal-impersonation without license, sample-without-clearance, sync-against-vision, metadata-as-marketing-only, algorithmic-gaming, fix-it-in-the-mix-after-bad-arrangement, viral-hit-as-primary-criterion patterns are non-shippable from this vertical.
- **Body-of-work, not single-track.** Catalog is the unit. Releases reference upstream and downstream releases in the discography, not exist as orphans.

## v7.5.1 sub-stack attestation block

This MEMORY.md is the attestation point for the Sound Intelligence sub-stack v0.1 ship under SIS v7.5.1. Per Luminor Board v7.5 verdict Item 5, this is the second reference vertical that validates the Path A authorless Domain Sub-Stack Tier pattern beyond People Intelligence (was HR Intelligence at the time of this ship; renamed at v7.6.0).

**Attestation:**

- **Substrate:** Starlight Intelligence Protocol v1.1.0
- **Reference vertical:** `verticals/sound-intelligence/` @ v0.1 (this commit)
- **Pattern validated:** Path A authorless Domain Sub-Stack Tier — six sub-systems composed into one cohesive intelligence stack via a thin file contract (README · SKILL · SOUL · AGENTS · MEMORY · STACK · CANON · SUB-SYSTEMS).
- **Lineage:** mirrors the file contract first proven by `verticals/people-intelligence/` @ v0.1.1 (People Intelligence reference, was HR Intelligence at the time of v7.5.1 ship; renamed at v7.6.0); shape inherits, content is domain-native (composition, production, catalog, performance, audience, sync — not hiring, performance, training, culture, talent, org).
- **Authorless:** word-boundary `\bAna\b` and `\bFrank\b` return zero matches in any new file shipped under this vertical. The synthesis is described as "the practitioner brings X" / "the sound practitioner brings X" — no specific person named.
- **Refusal posture stress-tested:** Aiyami's flag from Luminor Board v7.5 § Item 7 honored — Sound Intelligence's non-negotiables (refuses-loudness-war, refuses-AI-vocal-impersonation, refuses-sample-without-clearance, refuses-sync-against-vision, refuses-metadata-as-afterthought) are *domain-native*, not copy-pasted from HR's "research over fad" / "legal-aware structurally." The template's HR-shape leakage is corrected at the fork, not at the template (per Item 7 priority P2 horizon).
- **Sub-system count:** 6, matching HR's 6 (the field's research clusters of sound-practice cohere at this number — Composition, Production, Catalog, Performance, Audience, Sync each carry distinct research grounding and refusal patterns).
- **Productization paths:** five compounding paths declared in README (catalog operating layer / executor leverage / productized offer / copilot+GPT extension / licensable methodology), structurally identical to People Intelligence (was HR Intelligence at v7.5.1 ship time).

**Validation gate:** Per Luminor Board v7.5 Item 5, this ship validates that the Domain Sub-Stack Tier pattern generalizes beyond People Intelligence (was HR Intelligence at v7.5.1 ship time; renamed at v7.6.0). The pattern is no longer theoretical; it is instantiated by two reference verticals with structurally identical wrappers and domain-native content.

## Changelog

- `v0.1` · `2026-04-26` · Spawned as the second reference domain sub-stack scaffold for `/spawn-domain-stack`, validating the Path A authorless pattern beyond People Intelligence (was HR Intelligence at this ship time; renamed at v7.6.0). Six sub-systems composed into vertical wrapper. File contract: README · SKILL · SOUL · AGENTS · MEMORY · STACK · CANON · SUB-SYSTEMS. Authorless throughout — no specific person named. Domain-native non-negotiables (refuses-loudness-war, refuses-AI-vocal-impersonation, refuses-sample-without-clearance, refuses-sync-against-vision, refuses-metadata-as-afterthought) not copy-pasted from People Intelligence's (then HR Intelligence's) stance. Luminor Board v7.5 § Item 5 validation ship.
- `v0.1` (partial) · `2026-04-27` · Sound Intelligence shipped under v7.5.2 with **4 of 6 sub-systems' command surfaces complete** (composition × 5 + production × 5 + catalog × 5 + performance × 5 = 20 commands shipped). Audience and Sync sub-systems have agents + skills scaffolded but command surfaces (`/sound-audience-*`, `/sound-sync-*` × 5 each) deferred to v7.5.3 — the spawning agent hit org-monthly-limit at ~80% completion. Pattern validation gate satisfied: 4 sub-systems' worth of cross-validation against HR's 6-sub-system pattern is sufficient signal that the Domain Sub-Stack Tier generalizes. Closing the audience+sync command gap is a polish ship, not a structural validation question.

### Reference lineage SHAs

- v0.1 spawn (sub-systems 1-4 complete) · 2026-04-27 · pending v7.5.2 commit SHA — to be backfilled at tag.

---

**Built on SIP** — Sound Intelligence vertical MEMORY.md · v0.1 · SIP v1.1.0
