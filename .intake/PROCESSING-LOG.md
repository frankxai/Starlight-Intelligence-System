# `.intake/` — Processing Log

> Chronological log of every drop processed out of this directory. Each line:
> date · filename · summary of what was extracted · where it landed · operator.

---

## 2026-05-03

### `Chatgpt 02.05.txt` (1.1 KB)
- **Topic:** SIS purpose clarity + Arcanea connection + i18n + GitHub-vs-frontend strategic separation
- **Extracted:** 4 actionable insights (Starlight Note primitive concept, quantum/gratitude framing belongs in Horizon, EN/DE i18n unresolved, repo-vs-frontend boundary documentation gap)
- **Landed:**
  - `memory/vaults/horizon-vault.md` — Starlight Note primitive section + version bump 1.0.0 → 1.1.0
  - `docs/starlight-note-spec.md` (NEW) — artifact specification
- **Surfaced to Frank:** EN/DE i18n is a v8.x decision (deferred); repo-vs-frontend strategic separation will surface in next handover
- **Cross-repo:** none (SIS-substrate-level)
- **Operator:** Claude Opus 4.7 (1M context), session 2026-05-03

### `2 Chatgpt 02.05 - Copy.txt` (31.1 KB)
- **Topic:** ChatGPT-drafted "Master Build Handover" with 21 sections — taxonomy, subdomains, ontology, agent registry, anti-slop voice
- **Extracted:** 6 portable insights, 1 conflict
- **Landed:**
  - `memory/vaults/strategic-vault.md` — 5-layer brand architecture (master thesis), subdomain roadmap entry
  - `docs/site/subdomain-roadmap.md` (NEW) — nested-routes-first → subdomain promotion criteria
  - `skills/vision/voice-anti-slop.md` (NEW) — refused/preferred word lists + tonal rules
- **Conflict — REJECTED:** ChatGPT's 9-domain taxonomy (Workforce/Market/Event/Energy/Emotional/Divine) does not match the locked v7.5 10-IS taxonomy. Repo's locked taxonomy wins. Energy IS extracted as a future Domain Sub-Stack candidate via `/spawn-domain-stack` (surfaced to Frank below).
- **Surfaced to Frank:** Energy IS as 4th Domain Sub-Stack candidate (would need `/luminor-board` if accepted); reconcile `/intelligence` hub IA against current site
- **Cross-repo:** master thesis 5-layer split implies surfaces on `frankx.ai` repo (public-front layer) and `arcanea` repo (symbolic engine layer) — surfaced for Frank to action
- **Operator:** Claude Opus 4.7

### `3 Chatgpt 02.05 - Copy - Copy.txt` (15.4 KB)
- **Topic:** Strategic positioning + 4-tier monetization stack (service / template / community / platform)
- **Extracted:** 6 actionable insights, all P0
- **Landed:**
  - `memory/vaults/strategic-vault.md` — Naming hierarchy resolution (3 brand registers), Tier-1 sprint offer, YC-thesis mapping
  - `docs/monetization-tiers.md` (NEW) — full 4-tier model + 10-Day Sprint structure + downsells
- **Surfaced to Frank:** Pricing pages and sprint landing pages belong on `frankx.ai` repo (public-front), not SIS substrate; PV-Lager / EnergyOps pilot specifics belong in `private/` per privacy framework — NOT committed to public substrate
- **Cross-repo:** `frankx.ai` repo for offer surfaces; `agentic-creator-os` for ACOS productization; `private/` for PV-Lager
- **Operator:** Claude Opus 4.7

### `4 Chatgpt 02.05 - Copy - Copy - Copy.txt` (21.8 KB)
- **Topic:** Engineering-grade refactor — SovereignNode core abstraction + deterministic calculators + ValidationRequirement enum + 6 reference packs
- **Extracted:** 8 actionable insights, all P0
- **Landed:**
  - **NOT COMMITTED** — substrate-tier proposal requires `/luminor-board` pre-pass per board-before-tag invariant (CLAUDE.md v7.5.1+)
- **Surfaced to Frank:** Substrate-level addition — SovereignNode + Calculator&lt;Input,Output&gt; + ValidationRequirement enum is a structural change to how every Domain Sub-Stack is built. Recommendation: pilot on a NEW Energy/Home IS rather than retrofitting existing People/Sound/Music verticals (large refactor cost). Needs `/luminor-board` ratification before any commit.
- **Cross-repo:** Calculator + validation pattern relevant for `arcanea-flow` (swarm execution where deterministic outputs matter); `installer-project-brief` reference pack could be public, PV-Lager-specific instantiation goes in `private/`
- **Operator:** Claude Opus 4.7 — escalated, not auto-shipped

### `copilot kit.txt` (11.4 KB)
- **Topic:** CopilotKit as standardized agent-UI substrate across Arcanea/FrankX/ACOS/SIS
- **Extracted:** 6 actionable insights — wrap CopilotKit in one internal `packages/agent-ui-runtime/`, build golden-reference impl first, then propagate
- **Landed:**
  - `docs/superpowers/plans/2026-05-03-copilotkit-runtime-package.md` (NEW) — full plan with 3-phase scoping, strong-boundary table, slash-command → UI-rendering map
- **Surfaced to Frank — 3 decisions:**
  1. Adopt CopilotKit? (Yes / No / Pilot-on-one-app-first)
  2. Golden reference impl location? (`arcanea-command-center` vs `starlight-agent-console` vs both)
  3. Bespoke cockpit posture? (Recommendation: keep v7.5.3 orb + dashboard + DispatchPanel as Frank's local Jarvis surface; adopt CopilotKit for cross-repo apps where portability matters)
- **Cross-repo:** Primary impl on `arcanea` (Luminor sidebar / worldbuilder / codex editor), `frankx.ai` (operator cockpit), `agentic-creator-os` (operator console). Possibly `arcanea-flow` if it grows a UI surface.
- **Operator:** Claude Opus 4.7 — plan committed, decisions deferred to Frank

