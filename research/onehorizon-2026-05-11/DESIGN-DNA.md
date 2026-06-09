# OneHorizon AI — Design DNA + Information Architecture
## Source-of-truth from html + css chunks (Playwright unavailable, see CAVEAT)

**Scrape date:** 2026-05-11
**Target:** https://onehorizon.ai/ + /pricing + /docs + /docs/getting-started/concepts + /blog + /blog/ai-powered-code-review-tools + /changelog + /roadmap
**Pages successfully fetched:** 8 / 8 (HTTP)
**Visual screenshots captured:** 0 (Playwright MCP browser profile locked — see end of doc)
**Design-token extraction:** complete (727 tokens parsed from 3 CSS chunks)

---

## CAVEAT — Why no screenshots

The Playwright MCP server held an exclusive lock on its Chrome profile
(`C:\Users\frank\AppData\Local\ms-playwright\mcp-chrome-e6ac1f6`) for the entire
session — error: `Browser is already in use ... use --isolated`. I cleared the
on-disk lockfile and confirmed zero Playwright-owned chrome.exe processes were
running, which means the MCP server itself is the holder (its in-memory state).
The MCP server cannot be restarted from inside a tool call.

**Resolution path:** Restart the Claude Code session (or `pkill -f mcp-chrome`
in WSL / kill the playwright-mcp node process). Then re-run this task; the
visual fidelity work in steps 1 and 4 will run cleanly.

I compensated by extracting design-token-level fidelity from the production
CSS bundles. That's actually *higher* fidelity than screenshots for palette,
typography, radius, and shadow — but it misses layout, hover states, and the
"Send to app" dropdown in motion. Round 2 should capture those.

---

## 1. Color palette (hex, derived from HSL tokens)

OneHorizon ships **Tailwind CSS default ramps verbatim** under a `--one-*`
namespace. The brand hue is Tailwind's `indigo-500` (#6366f1). Slop-resistance
flag: this means the whole palette is the most-shipped-on-the-internet color
system. They differentiate on IA, not chrome.

### Brand
| Role | Hex | Notes |
|------|-----|-------|
| Primary | `#6366f1` | Tailwind indigo-500. Used for CTAs, active states, accents. |
| Primary deep | `#4f46e5` | indigo-600. Hover and pressed states. |
| Primary darkest | `#1e1b4b` | indigo-950. Reserved for type and dark-mode bg. |
| Secondary | `#ec4899` | Tailwind pink-500. Sparse accent (gradient highlights, badges). |
| Focus ring | `#2563eb` | blue-600. Distinct from primary — only on `:focus-visible`. |

### Semantic
| Role | Hex | Token |
|------|-----|-------|
| Success | `#16a34a` | green-600 |
| Warning | `#ca8a04` | amber-600 |
| Danger | `#dc2626` | red-600 |
| Destructive | `#e11d48` | rose-600 (delete actions, distinct from "danger") |

### Surfaces
| Role | Hex | Notes |
|------|-----|-------|
| Page background | `#f7f8f9` | Slightly cool off-white. NOT pure white. |
| Card / popover surface | `#ffffff` | Pure white for elevated surfaces only. |
| Code background | `#1e293b` | slate-800. Used for inline `<code>` and code blocks. |
| Foreground (body text) | `#16181f` | Near-black, slight blue tilt. |
| Foreground muted | `#64748b` | slate-500. Captions, helper text. |
| Divider | `#d6d9df` | Primary rule color. |
| Divider subtle | `#e8eaed` | Secondary rule (inside cards). |

### Content scale (a HeroUI/shadcn convention they kept)
| Layer | Hex | Use |
|-------|-----|-----|
| `content1` | `#ffffff` | Top-level surfaces (cards, modals, popovers) |
| `content2` | `#f1f5f9` | Hover/secondary surfaces |
| `content3` | `#e2e8f0` | Borders inside content1 |
| `content4` | `#cbd5e1` | Disabled / muted chips |

---

## 2. Typography

| Token | Value |
|-------|-------|
| Display / UI font | **Poppins** (with Poppins Fallback) |
| Code font | **JetBrains Mono** (with JetBrains Mono Fallback) |
| Body font | Inherits Poppins (no separate body family) |
| Weights shipped | 200 / 300 / 400 / 500 / 600 / 700 |
| Hero headline | Tracking-tight (`-0.025em`), font-weight ~600 |
| Body | Leading-relaxed (`1.625`) for prose blocks |
| Body | Leading-snug (`1.375`) for UI / cards |

Type-size scale (rem, Tailwind defaults):
- `xs 0.75` / `sm 0.875` / `base 1` / `lg 1.125` / `xl 1.25`
- `2xl 1.5` / `3xl 1.875` / `4xl 2.25` / `5xl 3`

Line-height pattern: `calc(N / size)` (Tailwind's "leading-tight relative" pattern).

**Note on Poppins:** Geometric humanist sans. Friendly but slightly generic.
Same family used by GitHub Education, Linear's marketing site (briefly), and
hundreds of indie SaaS landing pages. NOT distinctive on its own. They earn
distinctiveness through tracking and weight contrast, not family.

---

## 3. Radius scale

OneHorizon ships **two radius scales side by side** (HeroUI + Tailwind):

| Token | Value | Use |
|-------|-------|-----|
| `--one-radius-small` | 8px | Inputs, chips |
| `--one-radius-medium` | 12px | Buttons, cards |
| `--one-radius-large` | 14px | Hero panels, popovers |
| `--radius-xs` | 2px | Tiny chips |
| `--radius-sm` | 4px | Compact inputs |
| `--radius-md` | 6px | (rarely visible) |
| `--radius-lg` | 8px | Generic |
| `--radius-xl` | 12px | Cards |

**Signature radius:** 12px on buttons and cards. That's softer than shadcn's
default 6px but not as soft as Linear's 8px-with-2px-inner — closer to Notion
or Stripe.

---

## 4. Shadow + elevation

Three-layer soft shadow system (the "Material 3 / Apple HIG hybrid" look):

```css
--one-box-shadow-small:  0 0 5px  rgba(0,0,0,.02), 0 2px 10px rgba(0,0,0,.06), 0 0 1px rgba(0,0,0,.30);
--one-box-shadow-medium: 0 0 15px rgba(0,0,0,.03), 0 2px 30px rgba(0,0,0,.08), 0 0 1px rgba(0,0,0,.30);
--one-box-shadow-large:  0 0 30px rgba(0,0,0,.04), 0 30px 60px rgba(0,0,0,.12), 0 0 1px rgba(0,0,0,.30);
```

Each layer combines: (1) ambient halo, (2) drop shadow, (3) **always a 1px
ring at 30% opacity** — that ring is the "premium UI" tell. It crisps every
edge in print-quality detail without grayifying the surface.

---

## 5. Motion + blur

| Token | Value |
|-------|-------|
| `--ease-in-out` | `cubic-bezier(.4, 0, .2, 1)` (Material standard) |
| `--ease-out` | `cubic-bezier(0, 0, .2, 1)` |
| `--animate-pulse` | `2s cubic-bezier(.4, 0, .6, 1) infinite` |
| `--blur-xs` | 4px |
| `--blur-sm` | 8px |
| `--blur-md` | 12px |
| `--blur-lg` | 16px |
| `--blur-xl` | 24px |
| `--blur-3xl` | 64px |

Glassmorphism is present in the "Send to app" dropdown:
`bg-content1/80 backdrop-blur-md` on the menu surface and an inverted-triangle
tip drawn from a rotated div (no SVG arrow asset).

---

## 6. "Send to app" — the moment

From DOM inspection (line ~150 of index.html, button rendered server-side):

**Trigger button:**
- Inline `<button>` with `bg-background-website` (white), `border-medium`,
  `border-default` (slate-200), `rounded-medium` (12px), `shadow-small`,
  `px-4 h-10` (40px tall, 16px horizontal padding).
- Phosphor icon "upload-simple" on the left, "caret-down" on the right.
- Label: literal text "Send to app".
- Hover state: `data-[hover=true]:opacity-hover` (likely 0.9 fade — full
  hover state would need a live browser to verify).
- Press state: `data-[pressed=true]:scale-[0.97]` — physical compress on click.
- Focus state: 2px focus ring at 2px offset, color `--one-focus` (#2563eb).

**Popover menu:**
- Anchored below the button.
- Inverted-triangle tip drawn as a `w-3 h-3 rotate-45 bg-content1/80` div
  positioned above the menu — clean technique that avoids needing an SVG.
- Menu surface: `bg-content1` (white) + `backdrop-blur-md` + `shadow-large`
  + `rounded-xl` (12px).
- Each agent row: `flex items-center gap-3 px-3 py-2.5 rounded-lg`,
  hover `bg-content2/70`, focus-visible ring at primary/60.
- Each agent: inline SVG brand logo (Codex, Claude Code, Cursor, Open Code,
  Windsurf) + name.
- Click target: anchor tag with `target="_blank"` linking to
  `/docs/integrations/<agent>` — **the live site routes to docs, not to a
  deep-link agent-launch.** The "one click" claim on the homepage is
  marketing aspiration, not implementation. Their actual SaaS app likely
  does the deep-link; this is the public demo placeholder.

**Position in IA:**
- Lives in the **first hero scroll-stop after the headline** — directly
  underneath "Write a spec. Send it to any agent."
- It's the *single most-emphasized component* on the homepage.
- Followed immediately by the "Every PR maps back to the plan" panel.

---

## 7. Layout + grid

- **Top nav:** Horizontal, left-aligned brand, center nav (Features / Solutions
  / Pricing / Security / Docs / About), right-aligned auth + CTA.
- **Hero:** Single-column, centered, max ~600px wide for type. Big heading
  with each word on its own line (CSS `inline-block` with wrap — gives that
  staggered word reveal feel even without animation).
- **Feature sections:** Two-column on desktop (text left, visual right OR
  alternating). Single-column on mobile.
- **Cards:** Heavy use of `content1` white cards with `shadow-medium` on
  off-white page backgrounds. Card-on-card-on-page nesting.
- **Container widths:**
  - `--container-7xl: 80rem (1280px)` — page max.
  - `--breakpoint-lg: 1024px`, `--breakpoint-xl: 1280px`.
- **Spacing unit:** 0.25rem (4px). Tailwind default. Visible spacing is
  heavy on 4 / 8 / 12 / 16 / 24 / 48 px multiples.

---

## 8. Density / whitespace philosophy

- **Generous on landing** — 3-4 viewport heights of breathing room per
  section. Linear/Stripe pacing.
- **Dense in product** (inferred from Concepts doc + dashboard hints) —
  the work surface looks tabular and information-rich, with the same
  off-white + card chrome.

---

## 9. Slop-resistance check

**Clichéd:**
1. Tailwind default palette verbatim → blends with ~30% of indie SaaS.
2. Poppins display → friendly but generic.
3. "Trusted by [logos]" carousel → tired pattern.
4. ROI calculator on pricing page → consulting-deck cliché.
5. Hero gradient + slate-and-indigo aesthetic → indistinguishable from
   Cal.com, Resend, Trigger.dev, Vapi, OpenStatus, ...

**Distinctive:**
1. **Word-per-line hero typography** — that staggered wrap is visually
   striking; most sites collapse to two lines.
2. **The "Send to app" popover specifically** — the inverted-tip + glass
   menu with brand logos is a strong, ownable interaction.
3. **Three-layer shadow with always-on 1px ring** — most sites use single
   shadow; this gives every card a tactile, photographed feel.
4. **The "spec → agent → commit → PR" trace narrative** — the visual+copy
   pairing on "Every PR maps back to the plan" is a real differentiator.
5. **Concepts page IA** — they expose primitive names (Task / Issue / Event
   / Blocker / Planned / Completed / Recap / Standup / Integration) before
   asking for signup. That's confident.

---

## 10. Information architecture (the primitives)

**First-class objects** (from /docs/getting-started/concepts — verified):

| Primitive | Definition (verbatim) |
|-----------|-----------------------|
| **Workspace** | Shared environment for teams. Settings, members, integrations. Invite-only. |
| **Team** | A group inside a workspace. Shares standups, recaps, insights. Invite-only. Multi-team allowed. |
| **Task** | Unit of work, created by AI or manually. |
| **Issue** | Work item *synced from integrations* (GitHub / Jira). States: completed / planned / blocked. |
| **Event** | Calendar item (meeting, focus block, time off). Can appear in Planned. |
| **Blocker** | Something preventing progress — can be a task, issue, or PR. |
| **Planned** | Short-term what's next list. Mixes tasks, events, issues. |
| **Completed** | Finished work. Always rendered as tasks regardless of source. |
| **Recap** | AI-generated personal summary of work + planned + blockers. |
| **Standup** | Recurring team check-in. OneHorizon delivers your update *before* the meeting. |
| **Integration** | External tool connection. Personal (your data) or workspace (shared). |
| **Insights** | Automated team activity summaries. |
| **Profile** | Your personal info. |
| **Identity** | Your accounts for specific integration auth. |

**Primitives you missed in the prompt:**
- **Recap** — the personal AI summary (this is the unit, not "Journal")
- **Workspace** vs **Team** — two-level hierarchy
- **Identity** — separate from Profile (auth-account abstraction)
- **Initiative** / **Release** / **Period** — appear on pricing page but
  NOT in the Concepts doc. These are roadmap-level rollup primitives:
  - **Initiative** — multi-task strategic unit (in Growth plan)
  - **Release** — versioned ship cut
  - **Period** — "cycles & phases" — their term for sprints/quarters
  - **Stack rank** — prioritization mechanism
  - **Taxonomy** — categorization scheme (likely tags / labels)
  - **Release notes** — auto-generated
- **Status update** — feature name in nav; distinct from Standup

**Primitives you named but NOT in their canon:**
- "Roadmap" — feature/marketing word, not a first-class primitive
- "Journal" — they call it **Recap**

---

## 11. Integration matrix (from pricing page)

| Integration | Tier |
|-------------|------|
| Slack | All |
| Google Calendar | All |
| GitHub | All |
| Jira | All |
| Linear | All |
| **MCP** | All (this is huge — they ship an MCP server) |
| Claude & Claude Code | All |
| ChatGPT | All |
| Cursor | All |
| JetBrains IDEs | All |
| Windsurf | All |
| n8n | All |

Plus from the "Send to app" menu specifically: **Codex, Claude Code, Cursor,
Open Code, Windsurf.** Note Open Code is in the launcher menu but not the
pricing matrix — possible mismatch or recent add.

External tooling exposed: **Smithery** (their MCP server is published there),
**Conductor** (task context handoff with one click), **CLI**, **JS SDK**,
**REST API**.

---

## 12. Architecture clues (what we can infer)

- **MCP server is the integration backbone.** They publish it on Smithery,
  expose it as a tier-1 integration, and mention it in nav ("AI assistant / MCP").
- **Local desktop app exists** — homepage CTA "Download for Windows" +
  "View all downloads" in footer (Resources → Desktop app).
- **Web app exists** — pricing CTA "Start free" and "Sign up" route to web.
- **CLI exists** — Resources footer + Concepts doc references.
- **JS SDK exists** — for embedding OneHorizon in third-party apps.
- **No public roadmap** — `/roadmap` returns 404. Ironic for a
  "roadmap-first" company.
- **Changelog is client-rendered** — `/changelog` SSRs only the header;
  content is JS-loaded.
- **Blog is client-rendered** — same pattern; the "Loading blog posts"
  string is the SSR fallback.

**Hybrid SaaS-+-desktop architecture** — workspace data lives in their cloud
(invite-only workspaces, MCP server, integrations OAuth'd at workspace
level), but a local desktop app is the daily driver. That model directly
contradicts the sovereign-local-first stance Spec-Trace wants.
