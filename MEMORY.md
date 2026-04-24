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

- `v7.3.1` · `2026-04-24` · Post-Luminor-Board REVISE follow-on shipped same-day: test/v73.test.ts (19 conformance assertions, all passing) closes eval gap; docs/ecosystem-integration.md (2,868-word hub) closes "Claude Code central" perception gap; ONBOARDING.md updated with "Protocol vs reference" section; memory/intake/session-log-template.md provides instrumentation for live sessions; v7.4 ecosystem exports scaffolded (/sip-export + 5 target schemas: claude-project, chatgpt-project, gemini-gem, cursor, cowork); v7.5 attested modalities scaffolded (/sip-attest-audio, /sip-attest-image, /sip-attest-video, /sip-compose-modality + docs/attested-modalities.md roadmap).
- `v7.3.0` · `2026-04-24` · Newcomer surface shipped: ONBOARDING.md + DELIVERY.md + SESSION_RUNBOOK.md at root; /intake + /welcome + /sovereign-spawn commands (protocol tier); starlight-concierge + starlight-envoy agents (new Front-Door Tier); integration/idea-triage + integration/creator-path skills; templates/vertical-starter/ scaffold; AGENT_REGISTRY.md updated with Front-Door Tier; skill-rules.json updated (18 rules, 9 agent defaults). Closes non-coder onboarding gap identified in v7.2 retrospective.
- `v7.2.0` · `2026-04-23` · Substrate ecosystem ship: starlight-adoption-kit + vibe-os-substrate repos live, /badge route, test harness (35 assertions), OpenClaw audit + remediations applied.
- `v7.1.0` · earlier · starlight-mcp v1.1 live; Console v8 foundation; private/staging/ structure.
- `v7.0.0` · 2026-04-22 · SIP v1.1.0 spec shipped; first substrate self-attestation.
- `vX.Y.Z` · `<date>` · `<one-line summary>`

---

**Built on SIP** · v1 · MIT
