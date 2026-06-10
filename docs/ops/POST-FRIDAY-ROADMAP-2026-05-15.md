# Post-Friday Roadmap — 2026-05-15 onwards

> The 30 days after the v0.1 demo. Compounds the demo into a fork, the fork into distribution, distribution into pricing, pricing into a paying friend.
>
> **Tier:** operational (forward planning, not substrate change).
> **Companion docs:** `docs/cockpit/MASTER-PLAN.md` · `docs/monetization-tiers.md` · `docs/superpowers/specs/2026-05-11-finance-business-is-design.md` · `docs/ops/SOVEREIGN-SPAWN-CHECKLIST-2026-05-12.md` · `docs/ops/DEMO-RECORDING-PLAN-2026-05-12.md` · `docs/ops/MEMORY-PIPELINE-AUDIT-2026-05-12.md`.
>
> Built on SIP — operational tier (forward roadmap).

---

## 0. Frame

Friday is the proof-of-life. The 30 days after Friday are where v0.1 either compounds into a movement or evaporates into a single nice demo. The thesis: **one paying friend by 2026-06-15** (4 weeks out) demonstrates the substrate is monetizable. Not aspirational. Not "exploring." A signed agreement, money in the bank, attestation block on their first shipped artifact.

Three lanes run in parallel:
- **Operational** — close demo-day learnings, ship the autonomous spawn scaffolder, fix memory pipeline.
- **Distribution** — recording → cuts → posts → onboarding.
- **Commercial** — pricing landing page → Concierge tier → first signed friend.

Each week has a named deliverable, a falsifier, and a dependency map. If a week slips, the slip is explicit, not silent.

---

## Week 1 — May 16-22 — Close + first fork

**Goal:** capture demo learnings into the substrate; close sovereign-spawn Gap A-1; spawn the FIRST real fork (Logan or a synthetic reference).

### Named deliverables

| Day | Deliverable | Path | Owner |
|---|---|---|---|
| Sat 2026-05-16 | Demo-day reactions captured | `memory/vaults/operational-vault.md` · `horizon-vault.md` | Frank (5 min) |
| Sat 2026-05-16 | Recording uploaded (private) | `memory/recordings/2026-05-15-friday-demo-v01/` + YouTube unlisted | Frank (30 min via `scripts/record-demo.ps1 -Verify`) |
| Mon 2026-05-18 | Memory-pipeline Action 1 ships | `src/voice-session-extractor.ts` + dreaming-agent integration | Claude session (~2h) |
| Mon 2026-05-18 | Memory-pipeline Action 2 ships | `src/memory-health.ts` doctor gate on zero-processed receipts | Claude session (~1h) |
| Tue 2026-05-19 | `scripts/sovereign-spawn.ts` ships | autonomous scaffolder, 30 file templates, dry-run flag | Claude session (~1.5d) |
| Wed 2026-05-20 | `test/sovereign-spawn.test.ts` ships | idempotency check + scaffold completeness | Claude session (~2h) |
| Thu 2026-05-21 | `scripts/substrate-sync.ts` ships | fork-side substrate upgrade path | Claude session (~1d) |
| Fri 2026-05-22 | **FIRST live spawn** — Logan's OpenClaw fork | `github.com/openclaw/openclaw-substrate` | Frank + Logan (2h) |

### Falsifiers

- Recording uploaded? Public URL exists.
- Memory pipeline working? Next dreaming run shows `processed: 4+, insights: N>0` in `CONSOLIDATION_LOG.md`.
- Scaffolder works? `node scripts/sovereign-spawn.ts test-name "test domain"` produces byte-identical output twice in a row.
- First fork live? Logan's repo has SOUL.md filled and first artifact attested via `/sip-attest`.

### Dependencies

- Demo recording quality is independent of everything else; can land Saturday morning regardless of demo outcome.
- Sovereign-spawn ships independent of memory-pipeline.
- Logan's spawn depends on the scaffolder (Wed) AND on Logan's availability for the Friday call.

### Risks

- **Logan unavailable.** Fallback: spawn `example-sovereign` synthetic fork. Less compelling reference, still proves the pattern. Or push Logan call to week 2.
- **Demo recording corrupted.** Re-record solo from the dashboard on Saturday or Sunday using `docs/ops/DEMO-RECORDING-PLAN-2026-05-12.md` § 9 fallback protocol.

---

## Week 2 — May 23-29 — Distribution

**Goal:** the recording compounds across three social surfaces; the friend-starter pack ships v0.2 with embedded video; one new inbound from distribution.

### Named deliverables

| Day | Deliverable | Path | Owner |
|---|---|---|---|
| Sat 2026-05-23 | 3-min cut edited | `memory/recordings/.../02-three-min-cut.mp4` | Frank (45 min in DaVinci Resolve) |
| Sun 2026-05-24 | 30-sec hook edited | `memory/recordings/.../03-thirty-sec-hook.mp4` | Frank (30 min) |
| Mon 2026-05-25 | LinkedIn post + 3-min cut native upload | LinkedIn | Frank (15 min compose + post) |
| Tue 2026-05-26 | Twitter/X thread + 30-sec hook | X | Frank (15 min) |
| Wed 2026-05-27 | YouTube full flipped to public | YouTube | Frank (5 min) |
| Thu 2026-05-28 | friend-starter v0.2 — embeds video, references Council/VaultLoop/Pack-Registry/MCP | `integrations/starter-packs/friend-starter/README.md` | Claude session (~1h) |
| Fri 2026-05-29 | Distribution log first-pass | `memory/recordings/.../distribution-log.md` | Frank (10 min) |

### Falsifiers

- Distribution working? Aggregate reach across 3 platforms > 5,000 impressions in week 2.
- One inbound from distribution? At least one named individual reaches out via DM / email / `/intake` because they saw the recording. Logged in `notes/distribution-inbounds-2026-05.md`.
- friend-starter v0.2 works? Send the unzipped folder to one non-technical person; they install in <10 minutes without asking for help.

### Dependencies

- Recording from week 1 must be uploaded.
- Sovereign-spawn from week 1 reduces fork-anxiety for inbounds — "yes you can fork this" has a working scaffolder behind it.

### Risks

- **No engagement.** First posts may flatline. That's data, not failure. Iterate hooks in week 3.
- **friend-starter v0.2 breaks Claude Project upload.** Test before publishing; old `custom-instructions.md` is the proven shape.

---

## Week 3 — May 30 - Jun 5 — Pricing concrete

**Goal:** Tier 1 Concierge offer goes public on `site/`; first Concierge call booked.

### Named deliverables

| Day | Deliverable | Path | Owner |
|---|---|---|---|
| Mon 2026-06-01 | `site/src/app/sprint/page.tsx` — Tier 1 sprint landing | `site/` | Claude session (~3h) |
| Mon 2026-06-01 | `site/src/app/pricing/page.tsx` — 4-tier table from monetization-tiers.md | `site/` | Claude session (~2h) |
| Tue 2026-06-02 | Concierge intake form — name, current stack, 30-day artifact ask | Typeform OR `site/src/app/concierge/page.tsx` | Frank (~1h) |
| Wed 2026-06-03 | LinkedIn post: "Tier 1 sprint — 10 days, €7,500, 3 spots open for June" | LinkedIn | Frank (15 min) |
| Thu 2026-06-04 | Concierge booking calendar live | Cal.com or equivalent | Frank (30 min) |
| Fri 2026-06-05 | **First Concierge call BOOKED** | calendar | Frank + inbound (passive) |

### Falsifiers

- Landing pages live? `https://starlightintelligence.org/sprint` returns 200 with the 10-day breakdown.
- Pricing visible? `https://starlightintelligence.org/pricing` shows €7,500 sprint + €149 templates + €750 cohort + €500 audit + €1,500/mo retainer.
- First call booked? Calendar event exists; named individual on the other side.

### Dependencies

- Distribution from week 2 drives traffic to the pricing page. Without distribution, no inbounds.
- Memory pipeline fix from week 1 means Concierge sessions produce real insights to consolidate (rich client deliverables).

### Risks

- **No bookings.** Most likely cause: distribution not seeded enough. Triage: extend distribution another week before declaring failure.
- **Booking is a tire-kicker.** Filter via the intake form — require named 30-day artifact. Tire-kickers cannot name one.
- **First booking lands BEFORE the page is live.** Possible if a friend already saw the recording. Have a manual intake email-template ready.

---

## Week 4 — Jun 6-12 — First friend onboarded

**Goal:** the first private test case OR Logan completes a real engagement against the substrate. Money changes hands. Attestation block on their first shipped artifact.

### Named deliverables

| Day | Deliverable | Path | Owner |
|---|---|---|---|
| Mon 2026-06-08 | First Concierge day-1 — Intake + Genius Discovery | session in Claude Desktop | Frank + client |
| Tue 2026-06-09 | Day 2-3 — Knowledge Reclamation | session | Frank + client |
| Wed 2026-06-10 | Day 4-5 — Freedom Path | session | Frank + client |
| Thu 2026-06-11 | Day 6-7 — Executor Playbook + Creator Pipeline drafts | session | Frank + client |
| Fri 2026-06-12 | Day 8-10 — Stack composition + Handover + first artifact shipped with attestation | session | Frank + client |

### Falsifiers

- Money in bank? €7,500 cleared. Invoice marked paid in entity registry per `docs/superpowers/specs/2026-05-11-finance-business-is-design.md` revenue surface.
- Client retained? They have a Genius Profile + Freedom Path + Executor Playbook in their hands at end of week 4.
- Attestation block on their artifact? Their first published piece (LinkedIn post, Notion page, internal SOP) carries the "Built on SIP" footer.

### Dependencies

- All prior 3 weeks. This is the convergence point.

### Risks

- **Client churns at day 5.** Genius Discovery is the high-anxiety phase. Pre-commit them in the intake — €7,500 paid upfront non-refundable past day 3. (Standard sprint contract.)
- **Sprint reveals a gap in the substrate.** Likely outcome: at least one command doesn't quite fit the client's domain. Acceptable. Capture the gap in `memory/vaults/operational-vault.md`; address in v0.2 substrate revision.

---

## Cross-cutting workstreams (run continuously)

### Memory pipeline (operational)

After week-1 Action 1+2+3, the dreaming pipeline produces real consolidation. Frank should glance at `memory/CONSOLIDATION_LOG.md` once per week. Receipt-stale > 7 days = something broke.

### Cost plane (operational)

W2.1 already shipped (Vercel + Anthropic instrumenters). Daily snapshot lands in cockpit. Watch for cost regressions during distribution push — Vercel build minutes can spike if site/ deploys go wrong.

### Finance/Business IS — W3 Phase 2 (substrate-adjacent)

W3.1 shipped 2026-05-11 (Stripe + Arcanea BV + P&L + runway). Phase 2 deferred to post-month-1. **Re-evaluate June 13** based on whether real revenue flowed through Stripe (it should, from week-4 client).

### Substrate evolution (substrate-tier)

If a sovereign-spawn surfaces a substrate gap (Logan's fork in week 1, or week-4 client), file a board pre-pass packet at `docs/boards/`. Never blast-fix into SIP without `/starlight-board` PROCEED.

---

## Decision points for Frank

These are the moments where Frank's call shapes the path.

| When | Decision | Default | Override condition |
|---|---|---|---|
| Sat 2026-05-16 | Re-record solo, or accept the live recording? | Accept live unless OBS corrupted | re-record if audio is unusable |
| Wed 2026-05-20 | First fork = Logan (real) or synthetic? | Logan | synthetic if Logan can't commit to Fri 5/22 |
| Fri 2026-05-29 | Distribution working enough to ship pricing? | YES, ship pricing week-3 regardless | hold pricing if zero inbounds — distribution gap diagnostic first |
| Fri 2026-06-05 | Concierge call booked? If not, extend distribution? | Extend distribution one week | declare pricing-message broken if no calls after 3 weeks of distribution |
| Fri 2026-06-12 | Client completed sprint successfully? | Capture full session in `memory/vaults/operational-vault.md` regardless | If client churned, post-mortem into `memory/feedback_first_sprint_*.md` |

---

## What does NOT happen in 30 days

Be explicit about scope refusal:

- **No platform tier (Tier 4).** Per `docs/monetization-tiers.md`, platform comes after community comes after templates come after service. Week 1-4 = service only.
- **No second sovereign spawn beyond week-1 reference fork.** One fork is the reference; the second waits for after the first friend completes a full sprint.
- **No mass distribution.** No paid ads. No press outreach. Organic LinkedIn + Twitter only. Cost-plane budget protects this — paid distribution requires substrate-tier board pass on attribution mechanics.
- **No new IS layers.** The 10-IS taxonomy is locked at v7.5; W3 Finance/Business IS extension is the last addition for the month. Anything else is post-June.
- **No private/staging promotions to public.** vibe-os-substrate and adoption-kit stay where they are. Friday demo + week-4 client are the only public surfaces.

---

## The compounding hypothesis (testable)

By 2026-06-12 the substrate has:

1. One paying client (€7,500).
2. One sovereign-spawned fork (Logan).
3. One distribution surface compounding (LinkedIn + Twitter + YouTube).
4. One memory pipeline producing real insights (post-week-1 fix).
5. One pricing page receiving inbound traffic.

If 4 of those 5 are true on 2026-06-13, the v0.1 thesis is proven and v0.2 begins. If 2 or fewer are true, the thesis needs rework — not the substrate, but the go-to-market motion around it.

**The substrate has shipped.** The remaining 30 days are about whether the substrate can carry weight in the world.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.1
- Layers used: [file-contract, attestation, sovereignty, distribution, commercial]
- Verticals: starlight-intelligence-system@v0.1
- Generated: 2026-05-12
- Attestation is compounding, not credit transfer.
