# Phase 5 — Productize Music IS Template

> Music IS becomes a forkable, paid template for other musicians and labels. This spec defines the package, pricing, license, onboarding, and what Frank ships at Phase 5 (Q1 2027).

**Phase target:** Q1 2027, 12 weeks
**Owner:** Frank-as-architect + `music-curator` (Opus) for taste-stewardship
**Last updated:** 2026-04-29

---

## Phase 5 trigger conditions (per DECISIONS.md D13)

Phase 5 productization spawn requires:
- ✅ 3+ active labels (Frank Riemer + Frank's Vibes + Arcanea minimum)
- ✅ 3+ months revenue baseline observable per label
- ✅ 30+ gated releases total
- ✅ Methodology stability (no drift-test failures last 2 cycles)

If any condition fails, Phase 5 deferred.

---

## What gets productized (the template)

A **forkable Music IS instance** for other musicians and labels. Includes:

### 1. File contract (substrate-aligned)

The full Music IS file structure forks cleanly:
- `verticals/music-is/` (operator vertical structure)
- `skills/music-is/` (8 skill files + naming-intelligence)
- `commands/music-*.md` (8 commands)
- `verticals/music-is/labels/<placeholder-label>/` (label scaffold per fork)
- `verticals/music-is/knowledge/` (Suno corpus + naming corpus)
- `verticals/music-is/workflows/` (all SOPs)
- `verticals/music-is/notion/` (Notion architecture spec)

Per fork: rename "Music IS" → fork-instance-name; replace "Frank Riemer / Frank's Vibes / Arcanea / Nona" with fork's label structure; replace persona canons with fork's personas.

### 2. Vibe OS Notion template

Pre-built Notion workspace template:
- AI Musicians Hub (catalog mirror schema)
- Vibe OS (persona canon library schema)
- Music page (release feed schema)
- Pre-built views, filters, automations

Forker imports template into their own Notion workspace; sync mechanism wired to their own catalog.

### 3. Suno mastery corpus

The 5 distilled Suno knowledge docs (prompt-pattern-library, structure-tags-reference, genre-style-cards, vocal-control-recipes, known-bugs-workarounds). Updates quarterly via Frank's curator-team.

### 4. Naming-intelligence skill + knowledge

Naming-intelligence skill + musician-naming-patterns + banned-names docs. Forker applies to their own personas.

### 5. Per-tier add-ons

| Tier | Add-on |
|---|---|
| Solo | Community Discord + monthly group call |
| Micro-label | Above + onboarding session (1h with Frank or curator) + custom DECISIONS.md help |
| Enterprise | Above + dedicated CoE deployment + Frank-architect-engagement (consulting hours) + custom-tier setup |

### 6. Substrate attribution

Every fork carries **Built on SIP** attestation. Sovereignty clause non-waivable. Forks can fork; cascade preserved.

---

## Pricing tiers

### Solo (€19/mo or €197/yr)

**Audience:** Independent AI musicians (1 persona / 1 label)

**Includes:**
- Vibe OS Notion template (full schema)
- Skill pack (8 Music IS skills + naming-intelligence)
- 6 core commands (`/music-song`, `/music-persona`, `/music-release`, `/music-suno-prompt`, `/music-canvas`, `/music-amplify`)
- Suno mastery corpus (read-only, updated quarterly)
- Naming-intelligence (full)
- Onboarding video walkthrough (45min)
- Community Discord (peer support)
- Monthly group call (Frank or curator-team)
- Email support: 48h response

**Excludes:** custom-onboarding, sync-licensing setup, OpenClaws amplification mesh setup

### Micro-label (€497 one-time + €99/mo)

**Audience:** Indie labels with 2-10 personas; AI-music collectives

**Includes:**
- Everything in Solo tier
- Multi-persona orchestration (full LABELS.md template + per-label CANON.md scaffolds)
- Amplification mesh setup (OpenClaws Claws spec + Blotato + n8n integration template)
- Onboarding session: 1h with Frank or curator
- Custom DECISIONS.md walkthrough (help locking the 14 substrate decisions)
- Sync-licensing protocol setup
- Catalog migration help (1-time, up to 100 tracks)
- Email support: 24h response
- Discord priority access

**Excludes:** dedicated CoE deployment, ongoing architect engagement

### Enterprise (custom, €10K-€100K+)

**Audience:** Established labels (indie majors, sub-imprints, podcast networks)

**Includes:**
- Everything in Micro-label tier
- Dedicated CoE deployment (custom Music IS instance for the label's specific operation)
- Frank-as-architect engagement (consulting hours; quarterly check-ins; custom skills/workflows)
- White-label option (rebrand "Music IS" as label's internal name; sovereignty clause preserved)
- Custom integration (label's existing tooling — DAW, distribution, royalty-tracking)
- Multi-team training (curator team, A&R team, social-media team trained on the methodology)
- Dedicated Slack/Discord channel
- 12-month roadmap planning
- Per-quarter drift-test review

**Pricing examples:**
- Indie major Y label, 50 artists, single-deployment: ~€50K once + €5K/mo retainer
- Podcast network with 5 in-house music brands: ~€25K once + €2.5K/mo
- Music-tech startup adopting the methodology: ~€15K once + €1.5K/mo

---

## License + sovereignty

### Substrate-aligned reference patterns: MIT

The file contract structure, command structure, sub-system pattern, attestation format — these are MIT-licensed. Anyone can fork the structure for free. Paid tiers offer access to the *content* (Vibe OS template, Suno corpus, naming-intelligence corpus, support).

### Vertical-specific content: per-tier license

Each paid tier licenses the content for the licensee's own use. Re-distribution refused (the licensee can't sub-license to others).

### Sovereignty clause non-waivable (SIP § 5)

Every fork carries the sovereignty clause:
- Practitioner owns their catalog, persona canons, royalty graphs
- Substrate has no ownership claim on practitioner-generated content
- Attestation compounds; misattribution refused

---

## Onboarding flow per tier

### Solo onboarding

1. Pay for tier; receive welcome email with credentials
2. Watch 45min onboarding video
3. Import Vibe OS Notion template
4. Fork the file contract (Music IS structure)
5. Lock the 14 DECISIONS.md positions (or accept defaults)
6. Spawn first persona via `/music-persona`
7. Run first `/music-song` intake
8. Run first `/music-release` (full asset bundle required)
9. Phase 1 success: 6 gated releases under one persona within 90 days

### Micro-label onboarding

1. Pay for tier
2. Onboarding session with Frank or curator (1h):
   - Confirm 4-label structure (or N-label custom)
   - Lock per-label CANON
   - Lock DECISIONS.md positions
3. Migration assistance (up to 100 tracks)
4. Spawn 2-4 personas across labels
5. Setup amplification mesh (OpenClaws Claws)
6. Sync-licensing protocol setup if applicable
7. Phase 1 success: 12 gated releases across 2+ personas within 90 days

### Enterprise onboarding

Custom — defined per engagement scope. Typical:
1. Discovery + scope (2 weeks)
2. Custom CoE deployment (4-8 weeks)
3. Multi-team training (2-4 weeks)
4. First release cycle (4 weeks)
5. Quarterly check-ins ongoing

---

## Frank's role in productization

| Role | Time commitment | Phase activation |
|---|---|---|
| **Architect** | High at Phase 5 launch; medium ongoing | Permanent (the architect of the methodology) |
| **Curator team lead** | Medium ongoing; delegated when team mature | Phase 5 + |
| **Sales / business development** | Initial high; delegated to operator role | Phase 5 + |
| **Customer success** | Initial; delegated post-Phase-5 | Phase 5 + |

**Hire trigger:** If 5+ Micro-label customers OR 1+ Enterprise customer signs in Phase 5, hire 1 curator-team member to handle ongoing customer success.

---

## Marketing + distribution channels

### Marketing surfaces

- **frankx.ai/products/music-is/** — product page (Phase 4+ alongside dashboard)
- **Music IS YouTube channel** — methodology breakdowns, case studies
- **Frank's Substack + main brand audience** — organic awareness
- **Arcanea ecosystem cross-promo**
- **Community Discord** — peer-driven word-of-mouth
- **Sync-licensing case studies** (with successful Frank Riemer + Alera placements)

### Acquisition funnel

```
Awareness → Tutorial content (free) → Solo tier (€19/mo or €197/yr)
   → Solo customers compound → Micro-label upgrade
   → Micro-label customers compound → Enterprise referrals
```

### Pricing tests (Phase 5 first 4 weeks)

- A/B test Solo monthly vs. annual (annual likely converts better; default annual emphasis)
- Test Micro-label one-time-fee at €497 vs. higher (€697) to see ceiling
- Enterprise pricing case-by-case until 3+ customers establish baseline

---

## Phase 5 success criteria

| Metric | Phase 5 close target | Phase 6 stretch |
|---|---|---|
| Solo customers | 30 | 100 |
| Micro-label customers | 5 | 20 |
| Enterprise customers | 1 | 3 |
| ARR | €30K | €150K |
| Drift-test passes | 12+ months continuous | continuous |
| Customer 90-day-success rate | ≥70% | ≥85% |

---

## Refusal triggers (Phase 5)

- Productization launch before Phase 5 trigger conditions met → refuse
- Custom deployment for client whose canon-direction violates Music IS soul (e.g., AI-vocal-impersonation defaults; bot-mesh fan-engagement) → refuse
- Pricing tier that breaks sovereignty clause → refuse
- White-label deployment that strips Built-on-SIP attestation → refuse
- Sub-license to third party (re-selling) → refuse per license terms
- "Custom" deployment that demands removing refusal-triggers (e.g., wanting to enable bot-mesh) → refuse

---

## Composes with

- All Music IS file contract + skills + commands + workflows
- `verticals/music-is/SOUL.md` (refusal posture preserved per fork)
- `verticals/music-is/DECISIONS.md` (forks may revise but sovereignty clause non-waivable)
- SIP attestation (every fork carries Built-on-SIP)

---

**Built on SIP** — `verticals/music-is/productization/PHASE-5-SPEC.md` · v0.1 · 2026-04-29 · Q1 2027 launch · Three pricing tiers · Sovereignty non-waivable · Phase 5 trigger conditions per DECISIONS D13
