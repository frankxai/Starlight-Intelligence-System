# Visual-Design Audit — 2026-05-27 (L99 overnight pass)

Auditor: UX Designer agent. Sources: live curl + local `site/src/` read.
Benchmark bar: Stripe / Linear / Vercel / Anthropic / Apple developer docs.

---

## Overall verdict

The site has a coherent dark-mode design system and is not embarrassing — it is well above most open-source project sites. The Vellum & Voltage token set (Voltage #6e5cff / Doctrine #e0b656), tri-font stack (Fraunces/Inter/JetBrains Mono), animated dot-grid, ambient mesh blobs, and the BrainHero SVG all signal a handcrafted product. That core is **a clear win**.

What drags it away from Apple/Linear/Stripe quality are three recurring structural problems: (1) **Fraunces is in the design token inventory but is not in use anywhere in the rendered pages** — every heading renders in Inter Bold, not the serif Fraunces that defines the "Vellum" half of the system. The font stack in layout.tsx only loads Inter and JetBrains Mono, and no Fraunces import or font-face declaration exists in globals.css. This is the single highest-leverage fix. (2) **Section rhythm is uniform `py-20` everywhere**, producing an undifferentiated scroll rather than the breathing-room contrast that lets premium sites feel spacious. Hero sections, transition sections, and dense-data sections should occupy clearly different vertical mass. (3) **CTAs are visually competing for hierarchy** — primary `bg-white` pill buttons appear in almost every section, diluting their power. When everything is primary, nothing is.

Secondary audit: the `/research/memory-foundations` page renders as raw explainer-prose ReactMarkdown, which means its visual quality entirely depends on the markdown content. The prose styling is good but the page is dense and text-only, with no visual separation between major findings or a scannable score table above the fold. A Google engineer who lands on this page cold will read the title, TLDR, and then hit a wall of markdown. The body needs one visual element — a score table or a recommendation card — before the prose begins.

---

## Per-route findings

---

### / (homepage)

**Wins:**
- Hero gradient headline (`from-violet-400 via-fuchsia-400 to-cyan-400`) reads confidently at the clamp(2.25rem, 6vw, 4rem) range.
- BrainHero SVG behind the hero text is clever — gives the page an ambient topology signal without competing with the headline. Opacity 0.5/0.6 on lg+ is well-judged.
- Three CTA card grid (Protocol / Reference / Verticals) is the right shape — establishes three clear entry paths immediately. The accent-border system makes them distinguishable.
- Stats bar (9 layers / 35 agents / 70+ commands / 3 verticals / 6 adapters) at `border-t` directly below the hero CTA cards is an efficient trust bar.
- Ambient mesh animations are subtle. The 20s / 25s / 30s stagger means they never feel intrusive.
- Cockpit "four surfaces" section with the SurfaceTile grid is a strong product signal — it shows real craft.
- Agent API section with the live JSON preview and blinking cursor is the strongest "built by an engineer for engineers" moment on the page.

**Improvements:**

1. **P1 — Fraunces missing entirely** (file: `site/src/app/layout.tsx`, line 7–16)

   The design token documentation references Fraunces as the serif display font for hero headers. It is not imported anywhere in the codebase. Every `text-3xl font-bold` and `text-4xl` heading renders in Inter Bold, which reads as Generic Dark Mode SaaS rather than Vellum & Voltage premium.

   Fix: add Fraunces to layout.tsx alongside Inter and JetBrains Mono, then apply it to H1 hero text via a utility class.

   ```tsx
   // layout.tsx — add this import
   import { Inter, JetBrains_Mono, Fraunces } from "next/font/google";

   const fraunces = Fraunces({
     variable: "--font-fraunces",
     subsets: ["latin"],
     display: "swap",
     axes: ["WONK", "opsz"],       // optical size + wonky axis for display
   });

   // globals.css — add to @theme inline
   --font-display: var(--font-fraunces);
   ```

   Then on the homepage H1 (line 109), add `font-display` or `font-[family-name:var(--font-fraunces)]` to the `<h1>` class. The hero tagline "Persistent context. / Sovereign by architecture." gains immediately in premium weight. The gradient second line especially benefits — Fraunces italic at display size with the violet-fuchsia-cyan gradient is the closest analog to Stripe's hero serif moments.

   Impact: highest single-change ROI. Transforms the first impression from "competent dark SaaS" to "handcrafted intelligence system."

2. **P1 — Hero padding collapses too early on tablet** (file: `site/src/app/page.tsx`, line 103)

   Current: `pb-24 pt-24 md:pb-32 md:pt-36`. On a 768px viewport (the tablet breakpoint where the BrainHero disappears), the hero content carries all that vertical space but has nothing to anchor it on the right. The result is an awkward column of text with excessive top whitespace and no visual counterweight.

   Fix: add an `md:pt-28` step before `md:pt-36` kicks in. Or better — add a visible data element that replaces the BrainHero at tablet width. The stats bar already exists; moving it inside the hero column (below the CTA cards, before the section break) provides the visual anchor and earns the whitespace.

   ```tsx
   // page.tsx line 103 — tighten tablet hero top padding
   className="relative mx-auto max-w-5xl px-6 pb-24 pt-20 md:pb-28 md:pt-32 lg:pb-32 lg:pt-36"
   ```

3. **P1 — CTA inflation** (file: `site/src/app/page.tsx`, lines 258-265, 540-548)

   The page has four distinct `rounded-full bg-white` primary pill CTAs: "Open the verticals", "Run the reference build" (verticals domain sub-stack section), "Read the SIP spec" (final CTA), and another in the Domain Sub-Stack section. Stripe uses exactly one primary white button per page. Linear uses one. When every section ends with a white pill, engineers parse the page as "marketing" and skim past without acting on any.

   Fix: demote the Domain Sub-Stack section CTA (line 260) to the ghost variant (border + text-white), keeping only the final page CTA as `bg-white`. Reserve the white fill for the single strongest action per page.

   ```tsx
   // page.tsx ~line 260 — demote to ghost
   className="rounded-full border border-white/[0.2] px-6 py-3 text-[14px] font-semibold text-white transition-std hover:border-white/[0.35] hover:bg-white/[0.06]"
   ```

4. **P2 — Horizon quote section lacks visual distinction** (file: `site/src/app/page.tsx`, lines 165-178)

   The blockquote section uses only text — no typographic size step-up, no decorative quote character, no color treatment. At 18-20px it reads as body text you scroll past. Vercel and Linear use large pull quotes with dramatically oversized type or a visual indent system.

   Fix: increase the blockquote size to `text-[22px]` or `md:text-[26px]`, apply `font-display` (Fraunces italic) once imported, add `text-slate-200` (not `text-slate-300`), and increase the violet tint on the left edge via a pseudo element. The section earns its whitespace when the quote has actual presence.

5. **P2 — Layer cards grid lacks hover-state CTA intent** (file: `site/src/app/page.tsx`, lines 190-220)

   The 9 Intelligence Layer cards have hover border transitions but no link behavior — they are purely informational tiles that do nothing on click. This is fine architecturally but wastes a conversion moment. Each layer card could link to `/architecture#layer-N` or a future deep-dive page. At minimum, the hover state should suggest depth by adding `cursor-pointer` and a subtle `→` indicator on the card title.

   If linking is premature, add a bottom-section "See the full architecture →" link at text level rather than a card-level affordance.

---

### /research/memory-foundations

**Wins:**
- Breadcrumb navigation `← All research` is correct and consistent.
- Status/tier chip pair (Substrate + Published) above the H1 is a well-executed trust signal for an academic-adjacent audience.
- Tag system below the TLDR is light and scannable.
- Attestation footer is present and explains itself.

**Improvements:**

1. **P1 — No above-fold visual anchor before the prose wall** (file: `site/src/app/research/[slug]/page.tsx`, line 149)

   A Google engineer landing on this page cold sees: hero (good) then 3000+ words of markdown prose. There is no summary table, score card, or recommendation block before the prose body begins. Stripe's engineering blog, Vercel's changelog, and Anthropic's research pages all place the "verdict" visually above the detailed evidence. The rubric-first methodology is a key credibility differentiator — surface it.

   Fix: add a "Findings at a glance" card block between the hero and `<article>` — not in markdown, but as a structured component pulled from the research metadata (winner, recommendation, scoring outcome). Even a single sentence recommendation displayed in a `border-violet-500/[0.2]` card before the prose begins transforms the scannability for a time-pressed engineer.

   ```tsx
   // research/[slug]/page.tsx — add between hero and article (line ~149)
   {r.recommendation && (
     <div className="border-b border-white/[0.04] px-6 py-8">
       <div className="mx-auto max-w-3xl">
         <div className="rounded-xl border border-violet-500/[0.2] bg-violet-500/[0.04] p-5">
           <p className="text-[10px] font-medium uppercase tracking-widest text-violet-400">Recommendation</p>
           <p className="mt-2 text-[15px] font-semibold text-white">{r.recommendation}</p>
         </div>
       </div>
     </div>
   )}
   ```

2. **P1 — `explainer-prose` headings use Inter Semibold, not display font** (file: `site/src/app/globals.css`, lines 159-172)

   `.explainer-prose h2` is `font-size: 1.5rem; font-weight: 600` in Inter. For a research artifact that competes with academic papers and Anthropic blog posts, this needs the Fraunces variable in the heading stack once imported.

   Fix: add `font-family: var(--font-fraunces, var(--font-inter))` to `.explainer-prose h2` after Fraunces is wired up. The h3 and h4 can remain Inter. This creates a clear hierarchy: section headers in display serif, subsection headers in Inter Semibold, body in Inter Regular.

3. **P2 — Hero border-b opacity is halved vs other pages** (file: `site/src/app/research/[slug]/page.tsx`, line 98)

   Research hero uses `border-white/[0.04]` while every other page hero uses `border-white/[0.08]`. The weaker border makes the hero-to-body transition feel unfinished, like the section border was forgotten.

   Fix (one character):
   ```tsx
   // research/[slug]/page.tsx line 98
   // BEFORE: border-white/[0.04]
   // AFTER:  border-white/[0.08]
   ```

4. **P2 — Primary sources section has no visual weight** (file: `site/src/app/research/[slug]/page.tsx`, lines 156-178)

   The primary sources list renders as plain `text-violet-300` links without indentation, bullet treatment, or source metadata (author, venue, year). For an academic-credibility audience, bare URLs look like placeholders. Add a `<cite>` wrapper with author/year inline.

5. **P3 — Tag list is identical styling to the attestation footer tags** (file: `site/src/app/research/[slug]/page.tsx`, lines 133-144)

   Both use `border-white/[0.08] bg-white/[0.02] text-slate-400`. The hero tags communicate topic while the attestation section communicates governance. They look identical. Give the hero tags a faint accent-tinted background matching the research item's `accent` color to visually associate them with the research tier.

---

### /architecture

**Wins:**
- BrainHero with `labels` prop at 75% opacity is at its strongest on this page — this IS the architecture, so having the topology in the hero feels correct.
- LAYERS data table inside the dark `bg-[#0c0c12]` container with status pills is the best data display on the entire site. The color-coded status system (substrate / core / cross-cutting / optional / master) maps cleanly to the pill token.
- FlowNode → 4-step pipeline (JSONL → SQLite → MCP → AI tools) is well-structured and scannable.
- Composition rules section with the violet dash pseudo-element `before:bg-violet-400/40` list style is a clean typographic detail.
- Phase card system (Infant/Toddler/Juvenile/Adolescent/Mature) with shipped/current/planned pills is an excellent trust-building device.

**Improvements:**

1. **P1 — H1 is undersized vs homepage and verticals pages** (file: `site/src/app/architecture/page.tsx`, line 206)

   Architecture hero H1 uses `text-3xl md:text-4xl` (max ~36px). Homepage H1 uses `clamp(2.25rem, 6vw, 4rem)` (scales to ~64px). The /architecture page is a peer destination that Google engineers will navigate to directly, yet the hero heading is 40% smaller. This communicates "secondary page" visually even though the content has equal weight.

   Fix: upgrade to match the homepage scale.
   ```tsx
   // architecture/page.tsx line 206 — lift heading size
   <h1 className="mt-3 text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-tight text-white">
   ```

2. **P1 — 10-IS table has no sticky header row** (file: `site/src/app/architecture/page.tsx`, lines 279-339)

   The LAYERS table has 13 rows. On a laptop at 900px viewport height, a visitor scrolls past the column headers before reaching rows 7–13. The `thead` should be sticky within the table's scroll container.

   ```tsx
   // architecture/page.tsx line 280 — table header sticky
   <thead className="sticky top-0 bg-[#0c0c12]">
   ```

   Also: the "Vault" column displays raw file paths like `genius/` and `vision/, brand/` in `text-violet-300` mono. These are not links. They could link to GitHub tree paths or simply be disambiguated by removing trailing slashes for visual cleanliness.

3. **P1 — Cross-tool compounding "all read" connector is invisible to casual scanners** (file: `site/src/app/architecture/page.tsx`, lines 516-540)

   The section shows platform pills → `↓ all read ↓` → `starlight-sis` box. The connector label is `font-mono text-[11px] uppercase tracking-widest text-slate-400` — effectively invisible. The entire flow reads as three unrelated UI elements. Vercel uses explicit line connectors between platform diagram nodes.

   Fix: add `h-px w-px border-l border-dashed border-violet-500/30 mx-auto` columns between the pills and the central node to make the convergence diagram readable.

4. **P2 — Developmental phases hero text is the weakest intro paragraph on the site** (file: `site/src/app/architecture/page.tsx`, lines 441-450)

   "SIS's version history mirrors what computational neuroscience calls critical periods" is the opening sentence. This is a great intellectual signal but the 14px `text-slate-400` styling buries it. Elevate this framing — it is the most intellectually distinctive thing on the page. Make the first sentence 16px `text-slate-300` or move the Hensch/Knudsen citation to a `<cite>` footnote so the opening reads clean.

5. **P3 — CTA bottom section is asymmetric** (file: `site/src/app/architecture/page.tsx`, lines 565-584)

   "Start the quickstart" (primary white) + "Read the protocol" (ghost). This is correct hierarchy. However the surrounding text — "Two minutes to install. A lifetime to compound." — is the best tagline on the page and is styled as `text-[15px] text-slate-400`. Make it `text-slate-300` and `text-[16px]` so it reads as a headline setup before the CTAs, not as afterthought copy.

---

### /verticals

**Wins:**
- H1 gradient at `md:text-5xl` is the correct size for this destination page — it matches homepage ambition.
- Three vertical article cards with `rounded-2xl`, stat grid (dl/dt/dd), chip sub-system pills, and dual CTAs (Explore → primary white, QUICK-START → ghost) is the best card design on the site. The ACCENT_GLOW on hover gives a subtle depth effect.
- The "Spawn your own" spawn-domain-stack code block with green `$` prompt and violet command is an excellent "for engineers" signal.
- Stat grid inside each card (sub-systems / commands / agents) with `font-mono text-[12px]` values is scannable data display.

**Improvements:**

1. **P1 — Vertical cards have no hover lift / elevation shift** (file: `site/src/app/verticals/page.tsx`, line 70)

   Cards have `transition-std` and `ACCENT_GLOW` (outer glow) on hover. They lack a `hover:-translate-y-0.5` or `hover:scale-[1.005]` micro-lift. Linear and Stripe card interactions always include a subtle Y-translate paired with the shadow depth change. The current hover is entirely a color change (border brightens + outer glow) with no spatial movement.

   ```tsx
   // verticals/page.tsx line 70 — add micro lift
   className={`... transition-std hover:-translate-y-0.5 ${ACCENT_GLOW[v.accent]}`}
   ```

2. **P1 — "Live · Frank-operated" status label is confusing to external visitors** (file: `site/src/app/verticals/page.tsx`, lines 75-80)

   Music IS shows "Live · Frank-operated" while the other two show "Live". A Google engineer landing fresh reads "Frank-operated" as a limitation or a warning ("this one isn't community-maintained"). The intended meaning is the opposite — it is the reference production deployment.

   Fix: change the label to "Live · Reference instance" or "Live · Production" to communicate confidence rather than dependency. The "Frank-operated" signal belongs in the sub-page, not the index card eyebrow.

   ```tsx
   // verticals/page.tsx lines 76-80
   // BEFORE: "Live · Frank-operated"
   // AFTER:  "Live · Production reference"
   ```

3. **P2 — Footer CTA for this page is generic** (file: `site/src/app/verticals/page.tsx`, lines 200-220)

   "Run the reference build → / Read the protocol" is used verbatim on /architecture and /verticals bottom CTAs. This page is the entry to domain spawning — the natural next action for a Google engineer is "spawn my own stack." The primary CTA should be something specific like "Spawn your domain →" linking to `/quickstart#spawn-domain-stack`, not the generic quickstart.

4. **P2 — Code block in "Spawn your own" section has light syntax** (file: `site/src/app/verticals/page.tsx`, lines 164-183)

   The CLI code block shows the spawn command with `--domain "Clinical Intelligence"`. It has exactly two comment lines. Stripe's code examples have 4–6 lines and include a visible output line (a response, a confirmation, a file written). One additional line showing "scaffolded 7 files → people-intelligence/" makes the command concrete.

5. **P3 — `/verticals` has no visual separator between the three card areas** (file: `site/src/app/verticals/page.tsx`, lines 63-132)

   The three vertical cards sit inside a `py-20` section that has no internal section label. The `text-[11px] uppercase` eyebrow pattern that every other section on the site uses (e.g., "Domain Sub-Stack Tier") is missing from the card section itself. Adding it directly above the `grid` container would help scanners orient quickly.

---

### /protocol

**Wins:**
- Document layout using the `Section` component (eyebrow / h2 / children) is consistent and well-structured. Reading top-to-bottom through the six layers feels like reading a real spec.
- Source-of-truth banner (line 203–222) is a subtle but effective credibility anchor — showing the GitHub canonical source inline in the page is the right pattern for a protocol that claims immutability.
- Sovereignty clauses numbered list (line 464–480) with the violet-circle index numbers is a premium touch — it reads like a real legal instrument.
- Attestation block footer (line 574–623) is the best "here's how to use this" section on the site. Copy-pasteable. Visually distinct. The gradient card (`from-violet-500/[0.06] via-transparent to-fuchsia-500/[0.05]`) is well-judged.
- File contract table with `text-violet-300` mono for filenames vs `text-slate-300` for purpose vs `text-slate-500` for required is clean three-level hierarchy.

**Improvements:**

1. **P1 — Protocol version mismatch: page says v1.0.0, metadata says v1.1.1** (file: `site/src/app/protocol/page.tsx`, lines 175-176 and 151-156)

   The H1 says "Starlight Intelligence Protocol" then `v1.0.0` in mono below it (line 175-176). The page metadata title says "v1.1.1" (line 7). The FOOTER_ATTESTATION constant (line 149-156) also says v1.0.0 internally. The site title template resolves as "Starlight Intelligence Protocol — v1.1.1 — Starlight Intelligence" (correct per metadata) but the rendered page body shows v1.0.0 twice. A Google engineer reading this will immediately notice the discrepancy and lose trust in the protocol's precision claim.

   Fix:
   ```tsx
   // protocol/page.tsx line 175 — sync version
   // BEFORE: v1.0.0
   // AFTER:  v1.1.1

   // Also update FOOTER_ATTESTATION constant at line 149-150:
   // BEFORE: "- Substrate: starlightintelligence.org/protocol v1.0.0"
   // AFTER:  "- Substrate: starlightintelligence.org/protocol v1.1.1"
   // And the footer attestation "v1.0.0" line at line 621
   ```

2. **P1 — Section eyebrow `text-slate-600` is near-invisible on `#060609` background** (file: `site/src/app/protocol/page.tsx`, `Section` component at line 638)

   The `Section` component uses `text-slate-600` for the eyebrow text. On `#060609` background, `slate-600` (approximately `#475569`) achieves roughly 2.3:1 contrast ratio — well below the WCAG 3.0 AA threshold of 4.5:1. The section eyebrows are structural navigational elements (Layer 1, Layer 2, etc.) and are literally invisible when glanced at on a dark monitor.

   The same issue affects the file contract table headers (line 257-265) and command taxonomy table headers (lines 405-416) which use `text-slate-600`.

   Fix: change to `text-slate-500` (approximately `#64748b`, contrast ~3.5:1) or `text-slate-400` for eyebrows that need to be read.

   ```tsx
   // Section component, protocol/page.tsx line 637
   // BEFORE: text-slate-600
   // AFTER:  text-slate-500

   // Also the table headers (lines 257, 405, etc.):
   // BEFORE: text-slate-600
   // AFTER:  text-slate-500
   ```

3. **P1 — "Adopt SIP" anchor target has no visual distinction from surrounding sections** (file: `site/src/app/protocol/page.tsx`, line 575)

   The `#adopt-sip` section is the intended action destination from the hero CTA button "Adopt SIP" (line 192). When a visitor clicks "Adopt SIP," they scroll to this section. But `scroll-mt-24` aside, the section starts with a tiny `text-[11px] uppercase` eyebrow identical to every other section — there is no visual "this is your destination" signal. Add a faint horizontal rule above it, increase the heading size, or use a contrasting ambient background to mark it as the page terminal.

4. **P2 — MCP registry JSON code block (layer 3) lacks syntax highlighting** (file: `site/src/app/protocol/page.tsx`, lines 380-381)

   The `CodeBlock` component renders all content as `text-slate-300` mono (line 665). The JSON example for MCP registry has no token coloring. Every JSON block on the homepage uses manual `<span>` elements for syntax highlighting — keys in `text-violet-400`, strings in `text-emerald-400`, etc. The protocol page's CodeBlock component produces inferior output compared to the homepage for the same technical content.

   Fix: either expand `CodeBlock` to accept a `language` prop and apply simple regex-based coloring, or inline the JSON as a JSX-colored block matching the homepage pattern.

5. **P3 — Protocol page is not in the tablet nav bar** (file: `site/src/components/Header.tsx`, lines 59-70)

   The tablet nav (sm:flex, hidden on lg) includes: Verticals / Cockpit / Quickstart / Architecture / GitHub. Protocol is absent. For a Google engineer on an iPad or 900px laptop who wants to reach the spec, they must either know the URL or open the mobile Menu dropdown. Protocol should be in the tablet nav — it is architecturally as important as Architecture.

---

## Cross-route themes

**Theme 1 — Fraunces not loaded anywhere.**
The "Vellum" aesthetic cannot exist without the serif display font. Every route is affected. This is the highest-leverage single change across all 5 pages. Loading Fraunces and applying it to H1s transforms the perceived design tier. File to change first: `site/src/app/layout.tsx` (add font import). File to change second: `site/src/app/globals.css` (add `--font-display` token in @theme inline). Then apply `font-[family-name:var(--font-fraunces)]` or a `font-display` Tailwind shortcut to H1 elements in each page.

**Theme 2 — `text-slate-600` used as a "light" label color on near-black backgrounds.**
Appears in: `Section` eyebrow in protocol/page.tsx, table headers in protocol/page.tsx, footer attribution text. `slate-600` on `#060609` fails WCAG contrast at any text size. Change all instances to `text-slate-500` minimum, `text-slate-400` for any label that serves navigational purposes.

**Theme 3 — CTA hierarchy dilution.**
Every page has 2–4 `rounded-full bg-white` primary buttons. The pattern appears in: homepage (4 instances), architecture (2), verticals (2), protocol (2). Reserve `bg-white` for exactly one CTA per page. Remaining CTAs should use the ghost variant (`border border-white/[0.12] text-white hover:bg-white/[0.04]`). This is already used correctly in some places — the inconsistency is the problem.

**Theme 4 — `py-20` used for every section without differentiation.**
Hero sections, transition sections, and dense-data sections all use `py-20` (80px). Premium sites use at least 3 tiers: hero (`pt-28 pb-24`), content (`py-20`), transition (`py-12`). The methodology strip on /research (`py-12`) is the only correct example of the smaller tier. Apply `py-12` to pure bridging sections that link to more content without presenting their own core content.

**Theme 5 — No active nav state on current route.**
The `NavLink` component (`Header.tsx`, line 104-128) applies identical classes to all nav links regardless of whether the current route is active. Linear, Vercel, and Stripe all style the active nav item differently (brighter, underlined, or background-highlighted). With no active state, navigation feels generic and doesn't orient the visitor within the site structure.

**Theme 6 — Missing Doctrine amber (#e0b656) in rendered UI.**
The design token spec names Doctrine amber as the second accent color. In the live site, `amber-400` appears only in the architecture page (Mature phase card) and the homepage LAYERS array (amber for Creator IS). The `#e0b656` hex is never used directly. The Doctrine amber was presumably intended for section breaks, stat numbers, or feature callouts. Without it, the site reads as a violet-mono palette when the design intent was violet + amber.

---

## Anti-patterns avoided (note good decisions)

**Keep the dot-grid opacity at 50%.** The `dot-grid` class at `opacity-50` on the homepage hero is well-calibrated. Reducing it further makes it invisible; increasing it makes the background compete with text. Do not change.

**Keep the BrainHero at right-aligned absolute position.** The `absolute top-6 right-[-40px]` placement with `lg:right-8` is intentionally off-canvas on the right edge — it creates implied depth and peripheral motion without overlapping the H1 text. Do not center it or make it a standalone section element.

**Keep `transition-micro` (150ms) / `transition-std` (300ms) / `transition-dramatic` (500ms) as defined.** The three-tier motion system is architecturally correct and under-stated. The 300ms standard for hover states is perceptible without feeling sluggish. Do not accelerate `transition-std` to 150ms as some "premium" sites do — at this color saturation level, faster transitions feel aggressive.

**Keep the `#060609` background.** This is darker than pure `#000000` with a near-imperceptible blue cast — it produces less eye strain than pure black while preventing the "dead" look of `#0a0a0a` that some sites use. Do not switch to `oklch`-based backgrounds or system-preference-aware dark mode without testing the current palette.

**Keep the `::selection` violet highlight.** `background: rgba(167, 139, 250, 0.3)` is a polished detail that Google engineers who read large sections will notice unconsciously. Do not remove.

**Keep the custom scrollbar styling.** 6px width / transparent track / subtle thumb at `rgba(255,255,255,0.08)` is the correct minimalist treatment. Wider scrollbars would feel crude.

**Keep the `text-white bg-[#060609]` Deploy button in the nav.** Its white-pill contrast against the dark nav is the correct primary action treatment for the header — it is the one place where `bg-white` is unambiguously correct because it is the only navigational CTA.

**Keep the per-section `border-b border-white/[0.08]` dividers.** This is the quietest possible section separator. Replacing with thicker borders or adding top-margin sections without dividers would reduce the vertical rhythm's legibility.

**Keep Fraunces out of body copy.** Even after importing Fraunces for H1s, keep all body text in Inter. Mixed serif/sans body copy at 14–15px in a dark UI reads as inconsistent rather than refined.

---

*Audit authored 2026-05-27. Source read: site/src/ + live curl of 5 routes. No code was modified. All suggestions are additive or minimum-change corrections.*
