# Starlight Teammates — UI/UX & Interaction Specification

> **Substrate Attestation:** Built on SIP (Starlight Intelligence Protocol) § 4  
> **Status:** Active UI/UX Specification  
> **Target Surface:** `starlightintelligence.ai/teammates`  
> **Author:** Antigravity (Advanced Agentic Systems Architect)  
> **Canonical Path:** `docs/specs/starlight-teammates/UI_SPEC.md`  
> **Compliance:** Starlight Estate Design Excellence (`.agent-harness/DESIGN-EXCELLENCE.md`)  
> **Date:** 2026-11-09  

---

## 1. Design Vision & Core Idea

The central design idea of **Starlight Teammates** is:  
> **"The Calm Cockpit for Sovereign Digital Workers."**

Instead of a noisy chat interface where user messages get lost in endless scrolling, Starlight Teammates presents a disciplined, split-pane workspace. Persistent digital workers maintain dedicated stations with visible operational state, collapsible execution trees, and tactile approval cards.

### Brand Register
- **Primary Register:** High intellect, technical, warm, purposeful.
- **Aesthetic Tone:** Dark-first slate palette, crisp borders (`border-white/10`), optical alignment, typography-driven hierarchy, and zero decorative fluff (no random gradient blobs or unearned animations).

---

## 2. Layout Structure & Responsive Composition

The desktop interface uses a disciplined **three-column layout**, adapting gracefully to two columns on tablets and a single view on mobile:

```
+-------------------+-----------------------------------+--------------------+
| Column 1: Nav     | Column 2: Active Teammate Canvas  | Column 3: Sidecar  |
| Width: 260px      | Width: Flex (Min: 640px)          | Width: 340px       |
+-------------------+-----------------------------------+--------------------+
| [Brand / Logo]    | [Teammate Header: Queen] [Status] | [Active Context]   |
|                   |                                   |                    |
| > TEAMMATES (5)   | +-- Message Stream -------------+ | [Vault Atoms (3)]  |
| • Starlight Queen | | User: "Run ecosystem sweep"   | | • Strategic ◆     |
|   [Unread: 1]     | |                               | | • Technical ⬡    |
| • Search Manager  | | Queen: [Collapsible Run Tree] |                    |
| • GitHub Officer  | |   v Step 1: Checked 6 repos   | [Project Files]    |
| • Community Lead  | |   v Step 2: Found 2 stale PRs | • STACK.md         |
| • Teammate Builder| |                               | • AGENTS.md        |
|                   | | +-- Approval Card ----------+ |                    |
| > PROJECTS (4)    | | | Draft PR #142 ready       | [Connected Tools]  |
| • Brand HQ        | | | [Approve] [Review] [Diff] | | GitHub (Live)    |
| • Starlight OS    | | +---------------------------+ | | Vercel (Live)    |
|                   | +-------------------------------+ | | Neo Browser (On) |
| [Operator Profile]| [Bottom Composer: "@" connectors] |                    |
+-------------------+-----------------------------------+--------------------+
```

---

## 3. UI Patterns Grounded in Refero & Real Product Evidence

Our component patterns are grounded directly in empirical product interfaces extracted via Refero MCP and live inspection:

| Component / Pattern | Grounded Reference | Design Adaptation in Starlight Teammates |
| :--- | :--- | :--- |
| **Persistent Teammates Sidebar** | **Perplexity Teammates** (Tab 112/114) & **ChatGPT Spaces** | Fixed left navigation with dedicated teammate rows, unread notification pills, and real-time status pulses (Active / Idle / Waiting for Approval). |
| **Collapsible Action Trees** | **Factory.ai** (`factory.ai/sessions`) | Clean, single-column task execution trees. Expanding an item displays tool inputs, bash outputs, and file diffs on a dark background without cluttering the main conversation thread. |
| **Tactile Issue & Task Management** | **Linear** (`linear.app`) | High-density keyboard navigation (`J/K` selection, `Enter` to open, `Cmd/Ctrl+K` command bar), status chips, and strict typographic hierarchy. |
| **Checklist & Milestones** | **Dock.us** & **Superlist** | Progress tracking bars (e.g. "4/5 verification steps completed") during multi-hour background agent runs. |

---

## 4. Key Component Specifications

### 4.1 Teammate List Item (`TeammateNavItem.tsx`)
- **Elements:**
  - 24x24px Avatar / Emblem with domain color accent.
  - Teammate Title (14px font-medium, sentence case, e.g. "Starlight Queen").
  - Activity Pulse Dot (Emerald: Running; Amber: Awaiting Approval; Muted: Idle).
  - Unread Count Badge (Pill shape, subtle bg-primary/20, text-xs).
- **States:**
  - `Default`: text-muted-foreground, bg-transparent.
  - `Hover`: text-foreground, bg-white/5, transition 120ms ease-out.
  - `Active/Selected`: text-foreground, bg-white/10, border-l-2 border-primary.
  - `Focus-Visible`: 2px outline offset with visible ring.

### 4.2 Collapsible Execution Step Tree (`AgentExecutionTree.tsx`)
- Patterned after **Factory.ai**:
  - Closed state: Shows step summary, duration, and status icon (e.g. `[Checkmark] Scanned 12 repository branches (1.4s)`).
  - Open state: Accordion reveals formatted code diffs, command-line invocation, and stdout/stderr stream.
  - Monospace font (`JetBrains Mono` or system mono) with syntax highlighting.

### 4.3 The Approval Card (`ApprovalCard.tsx`)
- Used whenever an autonomous teammate hits a sensitive governance invariant (money, deployment, public push):
  - **Header:** Action Type badge (`[DEPLOYMENT]`, `[FINANCIAL]`, `[GIT_MERGE]`).
  - **Body:** Explicit statement of consequences:
    > *"Starlight Queen is ready to merge branch `agent/queen/offer-v1` into `main` and deploy preview to Cloudflare Pages."*
  - **Primary Actions:**
    - `Approve & Execute` (Solid button, primary accent, keyboard shortcut: `Cmd+Enter`).
    - `Inspect Diff` (Ghost button with file icon).
    - `Reject / Modify Plan` (Subtle outline button).
  - **Accessibility:** Must trap focus when opened as modal; high color contrast ratio (≥ 7:1 for text).

---

## 5. Design Tokens & Visual Hierarchy

```css
:root {
  /* Surface Palette */
  --bg-cockpit: #090a0f;
  --bg-sidebar: #0d0f17;
  --bg-card: #131622;
  --bg-card-hover: #1a1e2e;

  /* Borders & Dividers */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-focus: rgba(147, 197, 253, 0.6);

  /* Typography Colors */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;

  /* Status Accents */
  --status-active: #10b981;   /* Emerald 500 */
  --status-approval: #f59e0b; /* Amber 500 */
  --status-error: #ef4444;    /* Rose 500 */
  --brand-starlight: #6366f1; /* Indigo 500 */
}
```

---

## 6. Accessibility, Motion & Quality Bar

1. **Reduced Motion:** If `prefers-reduced-motion: reduce` is enabled:
   - All slide-overs, pulse animations, and tree expand transitions are clamped to instantaneous 0ms state changes.
2. **Keyboard Operation:**
   - Full keyboard navigation across teammates list via Arrow Keys or `J/K`.
   - `Esc` closes sidecar panels and approval modals.
   - `Tab` navigates through action items in logical visual order.
3. **Empty & Loading States:**
   - First-run empty state features a warm onboarding greeting from Starlight Queen with three concrete 1-click starter prompts.
   - Loading states use subtle skeleton pulse rectangles matching exact content dimensions to avoid layout shifts (CLS = 0).
