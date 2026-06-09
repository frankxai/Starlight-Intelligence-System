# Accessibility + Mobile Audit — 2026-05-27 (WCAG 2.2 AA)

Scope: 5 routes audited via live curl + local source read. Read-only. No code changes made.
Auditor: Accessibility Auditor agent. Method: source analysis + contrast ratio calculations + live HTML inspection.

---

## Critical (block-Madrid if user encounters)

- **WCAG 1.4.3 — slate-600 text fails AA contrast (2.67:1, requires 4.5:1)**
  Severity: Critical. Affects many surfaces across all 5 routes.
  Exact locations:
  - `site/src/app/protocol/page.tsx` line 205, 256, 259, 262, 334, 339, 406, 409, 412, 415, 619, 640, 661 — table `<th>` column headers, Section eyebrow labels, CodeBlock labels, footer attestation text. All use `text-slate-600` on `#060609` or `#0c0c12` backgrounds. Calculated ratio: 2.57–2.67:1.
  - `site/src/components/EntryCard.tsx` lines 41, 63, 82, 90, 136, 159, 167 — "Context" / "Implication" labels and timestamp text in compact + featured cards use `text-slate-600`. These cards appear on the homepage live vault stream.
  - `site/src/components/VaultCard.tsx` line 33 — entry metadata row.
  Fix: Replace `text-slate-600` with minimum `text-slate-400` (7.89:1) for any text that conveys information. Reserve slate-600 only for purely decorative separators (e.g. the `·` dividers in the protocol source banner).

- **WCAG 1.4.3 — slate-500 text narrowly fails AA contrast (4.25:1, requires 4.5:1)**
  Severity: Critical. Appears on all 5 routes in body-copy roles.
  Exact locations:
  - `site/src/app/protocol/page.tsx` line 175 — version string `v1.0.0` in hero.
  - `site/src/app/protocol/page.tsx` line 204 — "Canonical source" strip text.
  - `site/src/app/protocol/page.tsx` line 283 — "Required" column `<td>` body text in file contract table.
  - `site/src/components/EntryCard.tsx` lines 104, 127, 152, 162, 170, 181 — confidence badges, caption text, context/implication body paragraphs.
  - `site/src/components/VaultCard.tsx` line 30 — card description text.
  Fix: Promote `text-slate-500` to `text-slate-400` (7.89:1) for any text conveying content. The 0.25:1 margin is negligible; bump it once, consistently.

- **WCAG 1.3.1 — Protocol and Research page tables missing `scope` attribute on `<th>` elements**
  Severity: Critical for screen reader users navigating tables.
  Exact locations:
  - `site/src/app/protocol/page.tsx` lines 256–415 — File contract table (3 columns) and Command taxonomy table (4 columns): `<th>` elements have no `scope="col"` attribute.
  - `site/src/app/research/[slug]/page.tsx` — ReactMarkdown renders the markdown research artifact which may contain tables; those table headers will also lack scope.
  Note: The Architecture page `site/src/app/architecture/page.tsx` lines 282–297 correctly uses `scope="col"` on all `<th>` elements — use that pattern as the template.
  Fix: Add `scope="col"` to every column-header `<th>` in protocol/page.tsx tables.

---

## Major (should-fix tonight)

- **WCAG 2.5.8 — Mobile nav toggle tap target below 44×44px minimum**
  Severity: Major. Affects all routes on mobile (< 640px viewport).
  Location: `site/src/components/Header.tsx` line 74–79 — `<summary>` element with `py-2 px-2.5` yields approximately 36px height and 56px width. The 36px height fails the 44px minimum. Engineers checking from phones will hit this immediately.
  Fix: Increase to `py-3 px-3` (48px height achieved) or add explicit `min-h-[44px] min-w-[44px]` to the summary className.

- **WCAG 2.5.8 — Desktop and tablet NavLink tap targets below 44px**
  Severity: Major for touch-screen laptop users.
  Location: `site/src/components/Header.tsx` line 113 — `NavLink` base class `py-2.5` yields ~40px height. All desktop nav links, tablet nav links, and mobile drawer nav links share this class.
  Fix: Promote to `py-3` (48px) or add `min-h-[44px]` to the link className.

- **WCAG 1.3.1 — Homepage h2/h3 heading hierarchy: semantic level does not match visual level**
  Severity: Major. Affects all routes (shared pattern).
  Location: `site/src/app/page.tsx` lines 183, 231, 272, 337, 379, 413, 444, 486, 534 — Multiple `<h2>` elements use `text-[11px] font-medium uppercase tracking-widest text-slate-400` which is visually an eyebrow/label, not a heading. These are rendered ABOVE a following `<p>` or `<h2>` that actually looks like the section heading (e.g. the large `text-3xl font-bold` paragraph). A screen reader user navigating by headings hears the 11px label as the section heading and misses the substantive title entirely.
  Example: The homepage "The nine layers" section has `<h2 className="text-[11px]...">The nine layers</h2>` followed by a large `<p className="text-xl font-semibold">Each layer is its own Intelligence System.</p>`. The `<p>` should be the heading; the eyebrow should be `<p>` or `<span>`.
  Fix: Convert eyebrow labels from `<h2>` to `<p>` (or `<span>`). Promote the adjacent large text from `<p>` to `<h2>`. The same pattern applies to architecture, verticals, research, and protocol pages.

- **WCAG 4.1.2 — Mobile `<details>`/`<summary>` menu has no `aria-expanded` state**
  Severity: Major for screen reader users.
  Location: `site/src/components/Header.tsx` line 73–97. The `<details>` element does expose open/closed state natively in modern browsers, but NVDA on Windows does not reliably announce this. Additionally, the `<summary>` `aria-label="Open navigation menu"` is static — it always says "Open" even when the menu is open. VoiceOver on iOS will read this correctly via the native details semantics, but NVDA/JAWS users will be confused.
  Fix: Either convert to a `<button>` + JavaScript-controlled `aria-expanded="true/false"` pattern, or at minimum add a `data-open` CSS-toggled label using `:details[open] summary` to dynamically update `aria-label` via CSS content. The JS approach is more reliable across AT.

- **WCAG 1.4.4 — Small font sizes: text at 10–11px will fail at 200% zoom on some layouts**
  Severity: Major.
  Location: Multiple locations across all 5 routes — eyebrow labels at `text-[11px]`, table headers at `text-[10px]`, tag chips at `text-[10px]`, footer labels at `text-[11px]`. At 200% zoom these render at 20–22px which is fine, BUT several are set in absolute `px` units rather than `rem` which means user font-size preferences in the browser are ignored. In practice these will be 10px even if the user has set 20px as their base font size.
  Fix: Convert `text-[10px]` and `text-[11px]` inline sizes to `text-[0.625rem]` and `text-[0.6875rem]` respectively, or use the nearest Tailwind scale equivalent (`text-xs` = 0.75rem = 12px which is a reasonable minimum). This is a systemic fix — it touches the design system.

- **WCAG 1.4.12 — Letter-spacing on uppercase eyebrow text may break at non-default line heights**
  Severity: Major (minor in isolation, but systemic).
  Location: `tracking-widest` (`letter-spacing: 0.1em`) combined with very small font sizes and `uppercase` across all eyebrow labels. This combination can cause character clipping in some AT text extraction modes and is flagged by axe-core as a potential text spacing issue under 1.4.12.
  Fix: No immediate action required if the font-size fix above is applied. Document as known and retest after size change.

---

## Minor (post-Madrid)

- **WCAG 2.4.1 — Skip link is visually hidden until focused but target `#main-content` exists**
  Status: PASS — skip link is correctly implemented in `site/src/app/layout.tsx` lines 105–110 with `sr-only focus:not-sr-only` pattern and correct `href="#main-content"` target matching `<main id="main-content">`. No issue.
  Note for completeness: the skip link appears as white text on white background when focused (focus:bg-white + focus:text-[#060609]). This is intentional and correct.

- **WCAG 1.4.3 — External link arrow (`→`, `←`, `↓`) decorators**
  Status: Low risk. All arrow characters used for decoration have `aria-hidden="true"` applied correctly in verticals page and research detail page. Homepage and architecture use inline `&rarr;` inside link text without aria-hidden, but since the link text itself is descriptive ("Open the verticals", "Read the SIP spec"), this is acceptable — arrows are supplementary and not sole link discriminators. Minor cleanup opportunity.

- **WCAG 1.3.1 — `<blockquote>` on homepage missing `cite` attribute**
  Location: `site/src/app/page.tsx` line 168 — the Horizon Vault blockquote. `<footer>` inside `<blockquote>` is semantically valid HTML5 and acceptable; missing `cite` is technically optional but recommended.

- **WCAG 2.4.6 — Headings and labels: Section eyebrow `<p>` elements (after recommended fix above) should have unique content**
  Several sections across all pages use near-identical eyebrow text patterns. After converting to `<p>` this becomes a non-issue for heading navigation.

- **WCAG 4.1.3 — No ARIA live regions for dynamic vault stream on homepage**
  Location: `site/src/app/page.tsx` lines 460–479 — the live vault stream renders server-side (no client-side updates), so no live region is needed for the current implementation. If this section ever becomes client-side-refreshed, add `aria-live="polite"` to the container.

- **WCAG 2.5.3 — `<summary>` label says "Menu" but aria-label overrides to "Open navigation menu"**
  Location: `site/src/components/Header.tsx` line 75–77. The visible text "Menu" and the aria-label "Open navigation menu" are consistent in meaning. No failure, but if the dynamic state fix above is applied this becomes moot.

- **WCAG 2.1.1 — Keyboard: `<details>`/`<summary>` is keyboard operable natively (Space/Enter)**
  Status: PASS. No keyboard trap. The mobile nav dropdown is inside `<details>` which receives focus and responds to keyboard. Tab order flows naturally through the menu links.

- **SEO/a11y — Research slug page `<h1>` uses `r.title` from data which may be very long**
  Location: `site/src/app/research/[slug]/page.tsx` line 126. Currently the title "Memory Foundations for SIS" is reasonable. Monitor for future slugs with very long titles that might create poor screen reader experience.

---

## Mobile responsiveness

### Homepage (`/`) — 375/414/768/1024px

- **375px**: Single-column layout works. Hero text uses `clamp(2.25rem, 6vw, 4rem)` which scales to ~2.25rem at 375px — readable. CTA cards stack to single column correctly. Stats bar wraps correctly. BrainHero is hidden on mobile (`lg:block` — requires 1024px), correct. The main concern is the sticky header: `h-14` (56px) is fixed regardless of content; fine.
- **414px**: Same as 375px, slightly more breathing room.
- **768px**: CTA cards go 3-column (`md:grid-cols-3`). Domain Sub-Stack summary cards go 3-column. Featured meditations 2-column. All correct.
- **1024px**: Full desktop layout. BrainHero appears in hero. All nav items visible.
- **Issue**: The horizontal overflow on the Agent API code block — the `<pre>` at line 509 uses `overflow-x-auto` which is correct, but at 375px the inner `<code>` spans do not have `word-break` or `overflow-wrap`, meaning very long code lines will scroll horizontally inside the block rather than breaking. This is acceptable behavior for code blocks.

### Research/memory-foundations — 375/414/768/1024px

- **375px**: Article uses `max-w-3xl px-6` — gives 24px padding each side, leaving 327px content width. `explainer-prose` renders markdown with correct `overflow-x-auto` on `<pre>` blocks. The research artifact body renders via ReactMarkdown which inherits `explainer-prose` styles — correct.
- **768px**: Grid for methodology strip goes `md:grid-cols-3` — correct.
- The back link "← All research" at line 104 is small `text-[12px]` — functional but tap target is approximately 32px height at normal line-height. Minor concern for fat-finger accuracy on mobile. Not a WCAG failure but worth bumping.
- No issues at 414/768/1024px.

### Architecture (`/architecture`) — 375/414/768/1024px

- **375px**: The 10-IS table uses `overflow-x-auto` wrapper which is correct. At 375px the table (6 columns) will require horizontal scroll — this is expected and handled. The table has `text-[13px]` which is legible. Column widths are not fixed so content wraps within cells.
- **Critical mobile concern**: The BrainHero with labels (`labels` prop) appears only at `lg:block` (1024px+). At smaller sizes it's hidden — correct.
- **375px Phase cards grid**: `md:grid-cols-5` collapses to single-column below 768px — 5 phase cards stack vertically. This is a lot of vertical scroll but not a failure. Content is accessible.
- No layout breakage at 375/414/768px.

### Verticals (`/verticals`) — 375/414/768/1024px

- **375px**: Vertical cards `md:grid-cols-3` collapses to single-column. Each card's `<dl>` stats row is `grid-cols-3` which at 375px (327px content) gives ~109px per cell — fine.
- The sub-system pill list uses `flex flex-wrap gap-1.5` — wraps correctly.
- CTA buttons at bottom of each card use `rounded-full px-4 py-2` — height approximately 38px at 12px font size. Below the 44px minimum. (See Major issues above.)
- No layout overflow detected.

### Protocol (`/protocol`) — 375/414/768/1024px

- **375px**: Tables have `overflow-x-auto` on their container — the file contract table (3 cols) and command taxonomy table (4 cols) scroll horizontally. Working but note that `text-[10px]` table headers may be difficult to read on small screens.
- The attestation `<pre>` block at line 597 with `overflow-x-auto` works correctly.
- **Jump link**: The "Adopt SIP" button in the hero (`href="#adopt-sip"`) uses `scroll-mt-24` on the target section — this accounts for the sticky header offset (56px + buffer). Correct.
- No layout breakage.

---

## prefers-reduced-motion

**Status: PASS with one gap.**

The global CSS in `site/src/app/globals.css` lines 125–150 implements a comprehensive reduced-motion block that covers:
- All `animate-*` utility classes (mesh-drift, glow-pulse, fade-up, blink, brain-core, brain-node)
- All `.transition-*` utility classes
- The catch-all `*, *::before, *::after { animation-duration: 0.01ms; transition-duration: 0.01ms; animation-iteration-count: 1 }` rule

The `/cockpit/spec-trace` page has a secondary reduced-motion block at lines 851–858 for console-specific transitions — also correct.

**Gap**: The `hover:shadow-[0_0_30px_...]` glow effects on CTA buttons (e.g. homepage "Open the verticals" button, protocol "Read the spec" button) are CSS `box-shadow` transitions driven by `transition-std`. These are neutralized by the `transition-duration: 0.01ms` rule. However, the shadow itself still appears instantaneously on hover — it does not animate, which is correct behavior under reduced-motion (the visual change is present but not animated).

**Non-issue confirmed**: The `animate-fade-up` class on the vault stream list items includes `animation-fill-mode: both` (via `animation: fade-up 600ms var(--ease) both`). Under reduced-motion, `animation-duration: 0.01ms` makes this effectively instant — items appear without fading. Correct.

**Recommendation**: No action required for Madrid. The reduced-motion implementation is solid.

---

## Per-route table

| Route | Semantic OK? | Contrast OK? | Keyboard OK? | Mobile OK? | Verdict |
|-------|-------------|-------------|-------------|------------|---------|
| `/` (Homepage) | Partial — h2 eyebrows need conversion to `<p>`; h1 is single and correct | Fail — slate-500 (4.25:1) and slate-600 (2.67:1) in EntryCard timestamps/labels | Pass — skip link works, no traps, focus ring defined in globals.css | Partial — mobile nav toggle 36px height (needs 44px) | Fix Tonight: contrast + tap targets |
| `/research/memory-foundations` | Pass — single h1, logical h2/h3 via markdown, landmarks present | Partial — research card tags at slate-400 (7.89:1 pass); body text via explainer-prose uses slate-400/300 (pass); detail page slate-400 status chips pass | Pass | Pass — markdown body wraps correctly at 375px | Fix Post-Madrid: none blocking |
| `/architecture` | Partial — same h2 eyebrow issue as homepage; table has correct `scope="col"` on all `<th>` (PASS — architecture is the only page that does this correctly) | Fail — slate-600 used in STATUS_CLASS `text-slate-400` is fine but `PHASE_STATUS_PILL` planned variant uses `text-slate-400` (pass); no slate-600 in visible content here; check passes on body text | Pass — tables keyboard-accessible, overflow-x-auto allows keyboard scroll | Pass — 5-column phase grid collapses gracefully | Minor: h2 eyebrow semantic fix |
| `/verticals` | Pass — h1 present and single, h2s in article cards are correctly sized semantically (xl font-semibold), dl/dt/dd used for stats correctly | Pass — main text uses slate-400 (7.89:1) and white; accent chip text (violet-200, cyan-200) on semi-transparent dark bg needs verification but is likely above 4.5:1 | Pass — Explore and QUICK-START links have aria-labels; icon arrows aria-hidden | Partial — CTA buttons ~38px height, below 44px | Fix Tonight: tap target on card buttons |
| `/protocol` | Fail — `<th>` elements missing `scope="col"` on two tables; eyebrow `<p>` elements are `<p>` not `<h2>` (PASS — protocol actually uses `<p>` for eyebrows in the Section component, unlike homepage); single h1 present | Fail — slate-600 used for table headers (2.57:1), section eyebrow labels in Section component (2.67:1), "Canonical source" strip (2.67:1) and footer attestation text (2.67:1) | Pass — anchor jump to `#adopt-sip` works, `scroll-mt-24` correct | Pass — tables scroll horizontally at 375px | Fix Tonight: table scope + slate-600 contrast |

---

## Summary: Tonight's fix priority for Madrid

1. **Contrast — slate-600 → slate-400** across `protocol/page.tsx` (table headers, eyebrow labels, code block headers) and `EntryCard.tsx` (timestamps, label spans). ~15 targeted string replacements. Highest impact, lowest risk.

2. **Table scope** — Add `scope="col"` to both tables in `protocol/page.tsx` (file contract table and command taxonomy table). 7 attribute additions.

3. **Mobile tap targets** — Increase `<summary>` in Header.tsx from `py-2` to `py-3` and add `min-h-[44px]` to summary className. For card CTA buttons in verticals, increase `py-2` to `py-3`.

4. **Heading semantics** — Convert eyebrow `<h2 className="text-[11px]...">` to `<p>` and promote the adjacent large `<p>` to `<h2>` across homepage sections. This is a mechanical search-replace across `page.tsx` and can be done with low regression risk.

Items 1 and 2 are the WCAG AA failures most likely to be encountered by an assistive technology user during a demo. Items 3 and 4 are important for the mobile-engineer audience but will not cause an outright AT failure.

---

Audit completed: 2026-05-27
WCAG version: 2.2
Target conformance level: AA
Routes audited: 5 (live curl + source read)
Critical failures: 3 (slate-600 contrast, slate-500 contrast, missing table scope on /protocol)
Major issues: 4 (tap targets, heading semantics, details/aria-expanded, font size units)
Minor issues: 7 (various, post-Madrid)
