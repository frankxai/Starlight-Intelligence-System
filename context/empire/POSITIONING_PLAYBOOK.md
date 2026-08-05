# POSITIONING PLAYBOOK

> Direct-response positioning for every revenue-bearing property. Dated 2026-07-25.
> Companion: `ICP_FLOW_MAP.md` (who and what flow), `UPGRADE_ROADMAP.md` (build order), `audits/` (evidence).

**The shape of each USP (Jay Abraham):** a preemptive claim nobody else in the category has bothered to state + the risk moved off the buyer + a number or artifact specific enough to be falsifiable. Miss any of the three and it is a slogan.

---

## Non-negotiable constraints

These are not style preferences. They are the reason the portfolio's copy grades A while its checkout grades F, and losing them costs more than any conversion they gain.

| Rule | Source | Test |
|---|---|---|
| No hype verbs — unlock, supercharge, transform, elevate, empower, harness, unleash | `taste.md` refusal list | Read aloud. If it sounds like a model, rewrite. |
| No invented numbers. Ever. | Metrics Truth Rule, `CLAUDE.md` | Every figure traces to a file you can open, with `last_verified`. |
| **Zero income claims in the income cluster** — including implied ones | `agenticpassiveincome/BRAND.md` trust rules; `agenticincome/STRATEGY.md` ("stricter than FTC") | "What will I earn?" answers "Unknown until observed." |
| Availability status ships with every price | `BRAND.md`: *"Every commercial surface displays availability status, not price alone."* | A price with no status is a broken surface. |
| Simulations are labeled simulations | `BRAND.md` | The Scenario Builder says so. `/studio/store` does the opposite. |
| Bold = specific and concrete, never inflated | `taste.md`: *"12,000 songs beats extensive musical output"* | If it can't be checked, it isn't bold. It's noise. |
| No pricing-page tricks — fake countdowns, "limited time", strike-throughs | `taste.md` | Founder pricing is real because it's first-wave. That's the only urgency available. |

---

## The refund contradiction — flag and resolution

**Three policies are live simultaneously on frankx.ai right now:**

1. `app/legal/refund/page.tsx` — 14-day EU right of withdrawal, waivable at checkout with explicit consent; 14 days on courses under 25% consumed; 7 days before a live workshop. Also carries an unfilled **`Effective: [DATE]`** placeholder.
2. `app/shop/templates/page.tsx:593` and `layout.tsx:50` (the latter feeds JSON-LD FAQ schema, so this one is machine-readable to Google) — *"Due to the digital nature of the product (immediate source code access), we cannot offer refunds."*
3. `data/products.json` — at least six per-product guarantees promising the opposite: *"30-day complete satisfaction guarantee… we refund every penny,"* 45-day, 7-day, 24-hour, and 48-hour full-refund promises. `/start-here` advertises a "€197, 30-day refund" toolkit.

This is worse than having no policy. A blanket no-refund line on a digital product sold to EU consumers sits badly against the withdrawal right the legal page itself documents, and it is published in structured data while the product data promises the reverse.

**Resolution — one policy, stated once, inherited everywhere:**

> **14 days. No conditions, no consumption test.** You keep whatever you already built with it.

Rationale it can survive: it matches the statutory floor the legal page already describes, so it costs nothing legally that isn't already owed. It removes the waiver-at-checkout friction, which is a conversion tax on a €197 product. It is simpler than six different per-product windows, and simplicity is the point — a guarantee a buyer has to read twice isn't reversing any risk.

Mechanics: delete the FAQ answer in both `page.tsx` and `layout.tsx` (the JSON-LD copy is the urgent one), replace the six `products.json` guarantee strings with a single reference to the canonical policy, fill the `[DATE]`. One string, one source, every surface reads it.

---

## Per-property positioning

### frankx.ai — templates (15 SKUs, $27–$297)

**USP.** *Production Next.js and agent systems, sold as the source you inspect before you pay — not a zip you hope compiles. 14 days to decide, and you keep what you built.*

**Honest proof available today.** The storefront itself is the best commerce copy and component work on the site (graded A- in the deep audit) — it is disabled, not missing. Adjacent to it, `/workshops` runtime-enforces its provenance labels, and `/agents` renders live counts rather than hardcoded ones. That mechanism is the proof: *this brand asserts numbers in code, and you can read the code.* Extend it to the storefront — publish the file tree and the dependency list of each template on its own page, unpaywalled.

**Risk reversal actually offerable.** 14-day unconditional (see above). Do **not** ship "if you can't build a UI in 48 hours" style outcome guarantees — they are unverifiable, they invite a dispute you can't adjudicate, and they read as a hedge.

**The one metric.** Buy-button click → completed checkout. Nothing else on this route matters until a single transaction completes; today the denominator is structurally zero because all 15 buttons are disabled.

**Copy example:**
> **Fifteen production templates. Read the source before you buy.**
> Every template ships the tree, the dependencies, and the deploy path on its own page — before checkout, not after. RAG blueprint, multi-agent blueprint, Next.js SaaS boilerplate. $27 to $297. Fourteen days to change your mind, and you keep whatever you built in the meantime.

---

### frankx.ai — workshops

**USP.** *A working session that ends with your architecture on the page — run by an architect who labels which claims are verified and which aren't, in code, on the page you're reading.*

**Honest proof available today.** `/workshops` is the only commercial surface in the portfolio with **runtime-enforced provenance labels** (deep audit, grade A-). That is a genuinely rare, genuinely checkable claim, and it is exactly the claim an in-house operator needs to justify the spend upward. Say it plainly and point at it.

**Risk reversal.** Refund up to 7 days before the date (already in the legal page — just surface it), and: if the session doesn't produce a written architecture brief you can circulate internally, you don't pay. That second half is verifiable — the artifact either exists at the end of the session or it doesn't.

**The one metric.** Workshop enquiry → booked date. Not page views; the funnel here is short and the conversion is a calendar entry.

---

### frankx.ai — coaching and work-with-me (€3k–€25k)

**USP.** *Scoped engagement with the tier price published, an application that reaches a human, and a written scope before either of us commits.*

**Honest proof available today.** `/api/coaching-apply` is the only working intake pipeline on the site. That is the whole proof: the application actually arrives. Meanwhile `/work-with-me` puts €3k–€25k offers behind a **broken `mailto:` form** with zero imagery, zero proof, and no guarantee — and `/coaching` contradicts itself on the same page (40+ agents in one place, 38 in another).

**Risk reversal.** Not a refund — a scope gate. First paid step is a scoping session priced separately; if the scope doesn't produce work worth doing, that's where it stops and nothing further is invoiced. This is the honest reversal for high-ticket services and it costs nothing to offer.

**The one metric.** Applications received per month via `/api/coaching-apply`. It is instrumentable today and currently unmeasured because the highest-value page doesn't use it.

**Copy example:**
> **Three tiers. Prices published. One form that actually reaches me.**
> Architecture review (€3k) · Build sprint (€12k) · Standing architect (€25k). Start with a scoping session — if the scope doesn't produce work worth doing, that's where it ends and nothing else is invoiced.

*(Tier names and prices above are placeholders pending Frank's confirmation — the €3k–€25k band is from the current `/work-with-me` copy; the tier split is not yet defined anywhere in the repo.)*

---

### Income trinity — Stream Pack 01 ($47) and Blueprint ($67)

**USP.** *The only income product that starts by eliminating the streams you can't sustain — and prints the maintenance floor, the failure mode, and your kill date before you build anything.*

That is a genuine preemptive claim. The whole category optimizes generation; `agenticpassiveincome/BRAND.md` names the wedge precisely: *"governance before generation."* Nobody else is opening with subtraction.

**Honest proof available today.** The free Viability Audit and twelve-stream Atlas are shipped on site — positioned in the brand doc as the acquisition product, not a teaser. The Scenario Builder runs browser-local, produces a versioned manifest, and labels itself a deterministic simulation rather than a forecast. Every archetype in the Atlas carries an honest maintenance floor (Stream Pack 01's is stated: **10–20 hours per month once running**). The pack content is 100% complete; `ops/POLAR-SETUP.md` and `FULFILLMENT_RUNBOOK.md` are written. The single blocker is that nobody built the Polar integration.

**Risk reversal.** 14 days, unconditional, same as everything else — and one that costs nothing and reverses more: the maintenance floor is printed *before* purchase. A buyer who reads "10–20 hours per month" and leaves was never going to sustain the asset. That is the reversal doing its actual job.

**What is forbidden here.** No earnings figures. No "$X/month" anywhere, including testimonials, including screenshots, including implication. `COPY.md` already bans "Get rich," "Start earning now," "Unlock passive income," and — critically — **"Buy now when checkout is absent."** The `awesome-agentic-income` line *"Unlock premium Agent Swarms on Gumroad"* violates two of these at once and points at a product that doesn't exist. Fix it in the same change that wires checkout.

**The one metric.** Audit completion → checkout start. The audit is the qualifier; this ratio tells you whether the free flagship is selecting buyers or just entertaining visitors.

**Copy example:**
> **Eleven of the twelve streams are wrong for you. This finds the one that isn't.**
> Start with what you already own, the hours you'll actually protect, and how long you can wait for a first signal. You leave with one stream, its honest monthly floor, its failure mode, and the date you stop if it fails. We make no earnings claim — you'll know when you observe it.

---

### SIS — estate commissioning (DELIVERY.md §7)

**USP.** *You own the estate — the tuned system, the agents, the memory — and every number in it traces to a file we audited. Blueprint first; you decide to build after you've read it.*

**Honest proof available today.** The strongest proof in the entire portfolio, and it is a compliance fact rather than a performance fact: **SIS is the only repo whose documented counts match its filesystem exactly** — 88 skills, 144 agents, 28 commands, verified by live conformance harnesses (the original baseline is recorded in `audits/2026-07-25-registry-sweep.md`). In the same sweep, ACOS's own CLAUDE.md undercounted itself by more than 2x, and Arcanea ran contradictory values for one library-collection count. Against a buyer who has been sold agent platforms on invented dashboards, "we audit our own registry and show the receipts" is the differentiator. The ownership terms are already written and explicit in §7: client owns the tuned estate, Starlight owns the generalized process, encoded-self boundaries non-negotiable.

**Risk reversal.** The Blueprint is the reversal. Priced and delivered standalone — 1–2 weeks, four layers (Persona / Topology / Kernel / Modules) — with no obligation to commission the build. If the Blueprint doesn't convince, the buyer keeps it and walks. That converts a large irreversible decision into a small reversible one, which is the entire mechanism.

**Do not offer.** A money-back guarantee on a retainer, or any outcome guarantee on the agent army. Both are unverifiable and both signal the opposite of the sovereignty posture the offer is built on.

**The one metric.** Blueprint delivered → Pilot commissioned. This is the only conversion in the ladder that matters commercially, and it is measurable in single digits.

**Copy example:**
> **Read the blueprint before you commission the build.**
> Four layers — persona, topology, kernel, modules — delivered in one to two weeks. If it doesn't convince you, you keep it and we stop there. If it does, the pilot runs in two to six weeks and you own what it becomes. Our own registry audit is public, including the three repos where it caught us miscounting.

---

### Arcanea — pricing ($0 / $12 / $39)

**USP.** *A canon that holds. One number per fact, asserted in code, so your world doesn't drift while you're building inside it.*

**Honest proof available today** — but only after repair. `/chat`, `/lore`, `/ecosystem`, and `/library` are graded A and `/ecosystem` derives its numbers from the registry, which is exactly the pattern to generalize. Against that: four live values for library collections (17 / 20 / 22 / 52), three for agents (13 / 16 / 12), two for word count (190,000+ vs 486,000+), contradictory rev-share (90%+ vs 70%), and fabricated infrastructure stats on `/arcanea-os` ("10M+ req/day · 99.9% uptime"). **A property cannot sell canon integrity while running four values for one fact.** `lib/facts.ts` exists for precisely this and three pages import it.

**Order of operations, non-negotiable.** Quarantine `/studio/store` — it fires `alert("Stripe Payment of $19 succeeded!")` and mints a fake on-chain receipt against a Hardhat localhost address, on a live public domain. Then route every public number through `lib/facts.ts` and delete the fabricated stats. Only then wire `/pricing` to the Stripe checkout that already exists, and fix the `**40% lifetime discount**` rendering as literal asterisks.

**Risk reversal.** Monthly, cancel anytime, no annual lock. On a $12 subscription that is the only reversal that carries weight; a refund window on a monthly plan is theatre.

**The one metric.** `/pricing` visit → subscription started. Currently structurally zero — the page has no buttons.

---

## Instrumentation summary

One metric per property. If a property can't produce its number, it isn't shipped.

| Property | The one metric | Instrumentable today? |
|---|---|---|
| frankx.ai templates | buy-click → completed checkout | No — all 15 buttons disabled |
| frankx.ai workshops | enquiry → booked date | Yes |
| frankx.ai coaching | applications/month via `/api/coaching-apply` | Yes — unmeasured |
| Income trinity | audit completion → checkout start | Half — audit ships, checkout doesn't |
| SIS estate | Blueprint delivered → Pilot commissioned | Manual, and that's fine at this volume |
| Arcanea | `/pricing` visit → subscription started | No — no buttons |

Four of six denominators are structurally zero. That is not a measurement problem; it is the same checkout problem in six costumes, and it is why `UPGRADE_ROADMAP.md` Wave 1 sits where it does.

---

## What we are not claiming

Stated here so it stays stated:

- No revenue, user, or adoption numbers anywhere until `metrics/current.json` carries them with a `last_verified` stamp.
- No testimonials until real quotes exist. frankx.ai has zero across 20 products and three built-but-unimported testimonial components — the temptation to fill them is exactly the failure mode that produced `/tools`' fabricated "50K+ Monthly Uses" and "4.8/5."
- No income outcomes in the income cluster. Not in copy, not in case studies, not implied by a screenshot.
- No "production-grade," "battle-tested," or "trusted by" without a named, checkable referent.
