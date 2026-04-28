# MEMORY — Starlight Instance State (template)

Template for alliance or vertical memory. Copy to your instance's root, rename to `MEMORY.md` if adopting wholesale. Update at every cycle close or after any structural change.

This file is the **public template**. Real instance state — Notion IDs, partner names, in-flight commitments, financial detail — is held privately by each adopter (do not commit it to a public repo).

## Identity

- **Name:** `<your instance name>`
- **Type:** `<alliance | vertical | substrate>`
- **Authored by:** `<your name / entity>`
- **Founded:** `<year>`
- **SIP version:** `v1.0.0`
- **Canonical public URL:** `<your protocol URL or starlightintelligence.org/protocol>`
- **Source of truth:** `<your repo>`

## Sovereign verticals (if you operate any)

| Vertical | Owner | Status | Notes |
|----------|-------|--------|-------|
| `<name>` | `<entity>` | `active vN` | `<one-line>` |
| ... | ... | ... | ... |

## Alliances (if you participate in any)

| Alliance | Members | Your role | Status |
|----------|---------|-----------|--------|
| `<name>` | `<count nodes, names if public-OK>` | `<architect / advisor / etc.>` | `<cycle N status>` |
| ... | ... | ... | ... |

## External authorities

- **Intent authority:** `<Notion DB ID or other system>` — the "why" lives here.
- **Source of truth:** `<GitHub org/repo>` — the "what holds now" lives here.
- **Runtime state:** `<Supabase / DB / etc.>` — the "what's happening now" lives here.

(Keep IDs in your private state; substitute placeholders in any public surface of this file.)

## Active roadmap

| Milestone | Target date | Owner | Status |
|-----------|-------------|-------|--------|
| `<milestone>` | `<date>` | `<owner>` | `<status>` |
| ... | ... | ... | ... |

## Non-negotiables (substrate-level)

- "Built on SIP" attribution on every cross-vertical or cross-node artifact.
- Sovereignty clause (SIP § 5) is not waivable. Parties that cannot accept it do not adopt SIP.
- Canon license (CC-BY-NC for Arcanea canon) is enforceable.
- Open boundary (MIT) for the substrate spec is permanent — no re-licensing.

## Open forks

| Fork | Options | Owner | Decide by |
|------|---------|-------|-----------|
| `<fork>` | `<options>` | `<owner>` | `<date>` |
| ... | ... | ... | ... |

## Changelog

- `v7.6.0` · `2026-04-28` · **People Intelligence rename** — Path A authorless symmetric naming with Sound Intelligence. HR Intelligence reference vertical → People Intelligence (8-phase ship across vertical wrapper, skills domain, 6 sub-system agents, 28 commands, cross-reference sweep, SOUL boundary note, /openclaw-audit, version bump). Industry-context HR mentions preserved (HR theater, HRBP, HRIS, HR-tech, HR-fluff, HR-specific data privacy). Frozen historical records (docs/boards/, docs/ops/HANDOVER-*) untouched. Luminor Board verdict 2026-04-28: PROCEED at v7.6.0 (revised down from proposed v8.0). Boundary note added to verticals/people-intelligence/SUB-SYSTEMS.md delineating People Intelligence ↔ Relational IS per Lyssandria's challenge.
- `v7.4.1-alpha` · `2026-04-25` · **Domain Sub-Stack Tier** introduced — pattern for sovereign-person domain verticals composed of 4-7 functional sub-systems. First reference shipped as **HR Intelligence vertical** (renamed to **People Intelligence** at v7.6.0; see entry above) at `verticals/people-intelligence/` with 6 sub-systems (Hiring/Performance/Training/Culture/Talent/Org), 6 new agents (`starlight-hiring`, `starlight-performance`, `starlight-training`, `starlight-culture`, `starlight-talent`, `starlight-org`), 6 new skills under `skills/people-intelligence/`, 28 new operational commands across `hire-*`/`perf-*`/`training-*`/`culture-*`/`talent-*`/`org-*` prefixes, all research-grounded (Schmidt & Hunter, SBI, SCARF, Maslach, Edmondson, Kirkpatrick, Schein, Kotter, Bridges, etc.) with refusal of HR theater (PIPs-as-firing, stack rank, values-poster, engagement-survey-as-data, one-off-workshop, paper-succession). New meta-command `/spawn-domain-stack` generalizes the pattern. Two new ecosystem export targets: Microsoft Copilot + Custom GPT (now 7 export targets total). 6 new knowledge templates in starter pack (people-hiring, people-performance, people-training, people-culture, people-talent, people-org) plus export-pathways guide. Composes with universal 9-layer IS (Genius + Vision + Talent overlap with sub-system Talent — boundaries declared in AGENT_REGISTRY).
- `v7.4.0-beta` · `2026-04-24` · 9-layer intelligence architecture complete. Added 5 new IS layers + 5 new agents + new tiers (Business / Vision / Embodiment / Memory / Relational). New agents: starlight-business, starlight-visionary, starlight-embodiment, starlight-secondbrain, starlight-relational. New commands (13 this wave): /architect-entity, /model-revenue, /tax-sanity, /define-vision, /build-brand-kit, /align-voice, /design-regimen, /energy-audit, /capture-daily, /distill-insights, /orchestrate-brain, /map-relationships, /design-alliance-readiness. Plus meta-composition command /compose-stack. New skills across 5 new domains (business/, vision/, health/, memory/ expansion, relational/). docs/ARCHITECTURE.md (2,400 words) documents full 9-layer composition. test/v74.test.ts (27 assertions, all passing) guards drift. Luminor Board pressure-test returned REVISE with 5 items — 3 ship-blockers landed in this commit (AGENT_REGISTRY update with 9-layer stack + 5 new tiers + Sage/SecondBrain + Business/Wealth boundaries; v7.4 test harness; docs/ARCHITECTURE.md already landed by composition agent). Maturity marking: Business/Vision/Creator/Genius = v7.4-stable; Health/Relational/SecondBrain = v7.4-alpha (active dogfood, not positioning-central). Items 4 (MVS foregrounding in public explainer) + 5 (Ana dogfood for new layers) deferred to v7.4.1.
- `v7.4.0-alpha` · `2026-04-24` · Genius Intelligence System alpha shipped: new Excavation Tier agent `starlight-genius`; four new commands (`/discover-genius`, `/reclaim-knowledge`, `/train-executor`, `/creator-pipeline`, `/content-systemize`); vertical-tier `/arcanea-canon`; two new intelligence skills (`intelligence/genius-excavation`, `intelligence/knowledge-reclamation`); public explainer page (`docs/public/starlight-intelligence-system.md`, ~2,200 words); non-technical Claude Project starter pack (`integrations/starter-packs/friend-starter/` — 13 files including custom-instructions.md, 9 knowledge templates with Ana-grade filled examples, README). Attestation stance shifted: agents auto-embed "Built on SIP" in every output; `/sip-attest` remains for retrofit. First real test case: Ana (psychologist + MBA neuroscience + HR) full dogfood: intake card, genius profile template, freedom path, reclamation map, executor playbook, creator pipeline — all Ana-grade examples live in starter pack knowledge files.
- `v7.3.1` · `2026-04-24` · Post-Luminor-Board REVISE follow-on shipped same-day: test/v73.test.ts (19 conformance assertions, all passing) closes eval gap; docs/ecosystem-integration.md (2,868-word hub) closes "Claude Code central" perception gap; ONBOARDING.md updated with "Protocol vs reference" section; memory/intake/session-log-template.md provides instrumentation for live sessions; v7.4 ecosystem exports scaffolded (/sip-export + 5 target schemas: claude-project, chatgpt-project, gemini-gem, cursor, cowork); v7.5 attested modalities scaffolded (/sip-attest-audio, /sip-attest-image, /sip-attest-video, /sip-compose-modality + docs/attested-modalities.md roadmap).
- `v7.3.0` · `2026-04-24` · Newcomer surface shipped: ONBOARDING.md + DELIVERY.md + SESSION_RUNBOOK.md at root; /intake + /welcome + /sovereign-spawn commands (protocol tier); starlight-concierge + starlight-envoy agents (new Front-Door Tier); integration/idea-triage + integration/creator-path skills; templates/vertical-starter/ scaffold; AGENT_REGISTRY.md updated with Front-Door Tier; skill-rules.json updated (18 rules, 9 agent defaults). Closes non-coder onboarding gap identified in v7.2 retrospective.
- `v7.2.0` · `2026-04-23` · Substrate ecosystem ship: starlight-adoption-kit + vibe-os-substrate repos live, /badge route, test harness (35 assertions), OpenClaw audit + remediations applied.
- `v7.1.0` · earlier · starlight-mcp v1.1 live; Console v8 foundation; private/staging/ structure.
- `v7.0.0` · 2026-04-22 · SIP v1.1.0 spec shipped; first substrate self-attestation.
- `vX.Y.Z` · `<date>` · `<one-line summary>`

---

**Built on SIP** · v1 · MIT
