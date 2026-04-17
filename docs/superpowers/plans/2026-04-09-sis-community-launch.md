# SIS Community Launch — Make the Intelligence Visible

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform SIS from a code library into a living, usable product that people can install in 2 minutes, see working immediately, and understand why it matters.

**Architecture:** Three parallel workstreams: (1) Enrich vault content so the site feels alive, (2) Rewrite README for v6 with instant quickstart, (3) Upgrade the site with interactive "try it" experience and Luminor philosophy.

**Tech Stack:** TypeScript, Next.js 16, JSONL, GitHub API, Vercel

---

### Task 1: Seed public-vault with rich entries (40+ total)

**Files:**
- Modify: `public-vault/strategic.jsonl` (add 6 entries)
- Modify: `public-vault/technical.jsonl` (add 5 entries)
- Modify: `public-vault/creative.jsonl` (add 4 entries)
- Modify: `public-vault/operational.jsonl` (add 3 entries)
- Modify: `public-vault/wisdom.jsonl` (add 5 entries — currently empty!)
- Modify: `public-vault/horizon.jsonl` (add 3 entries)

These should be REAL insights from Frank's work — not generic filler. Pull from the memory files at `~/.claude/projects/C--Users-frank-Arcanea/memory/` and the SIS vault at `~/.starlight/vaults/`.

- [ ] **Step 1: Read Frank's memory files for real insights**

```bash
cat ~/.claude/projects/C--Users-frank-Arcanea/memory/feedback_*.md
cat ~/.claude/projects/C--Users-frank-Arcanea/memory/project_current_state.md
```

- [ ] **Step 2: Add 6 strategic entries**

Append to `public-vault/strategic.jsonl` — real decisions about Arcanea's direction:
```jsonl
{"id":"strat_20260409_001","insight":"Open Core + Founding Circle, not premature tiers — earn the right to charge by shipping value first","category":"pricing","confidence":"high","tags":["monetization","strategy"],"source":"decision","createdAt":"2026-04-09T00:00:00Z"}
{"id":"strat_20260409_002","insight":"Three-product agent blueprint: Luminors (chat personalities), Agents (work automation), Code (dev intelligence) — each with marketplace","category":"product","confidence":"high","tags":["agents","product"],"source":"strategy","createdAt":"2026-04-09T00:00:01Z"}
{"id":"strat_20260409_003","insight":"Memory is the moat — continuity + graph memory + provenance + creator identity compound over time, features don't","category":"competitive","confidence":"high","tags":["moat","memory"],"source":"reflection","createdAt":"2026-04-09T00:00:02Z"}
{"id":"strat_20260409_004","insight":"MCP as distribution protocol beats per-tool plugins — one integration reaches all MCP-compatible tools","category":"distribution","confidence":"high","tags":["mcp","distribution"],"source":"research","createdAt":"2026-04-09T00:00:03Z"}
{"id":"strat_20260409_005","insight":"Local-first + structured vaults + semantic retrieval + temporal reasoning — the gap nobody fills in the memory system landscape","category":"positioning","confidence":"high","tags":["memory","positioning"],"source":"research","createdAt":"2026-04-09T00:00:04Z"}
{"id":"strat_20260409_006","insight":"GitHub as the database for public vaults — zero cost, git-versioned, forkable, agent-readable via raw URLs","category":"architecture","confidence":"high","tags":["github","architecture"],"source":"decision","createdAt":"2026-04-09T00:00:05Z"}
```

- [ ] **Step 3: Add 5 wisdom entries (currently empty vault!)**

Create real entries in `public-vault/wisdom.jsonl`:
```jsonl
{"id":"wisdom_20260409_001","insight":"Focused sequential engineering beats multi-agent swarms for single-repo product work — depth over breadth","category":"execution","confidence":"high","tags":["engineering","focus"],"source":"experience","createdAt":"2026-04-09T00:00:00Z"}
{"id":"wisdom_20260409_002","insight":"Think foundations and invention, not quick monetization — deeper architecture always wins long-term","category":"philosophy","confidence":"high","tags":["strategy","patience"],"source":"principle","createdAt":"2026-04-09T00:00:01Z"}
{"id":"wisdom_20260409_003","insight":"NEVER rename things to generic labels — deepen character and identity like Skyrim NPCs instead of flattening","category":"naming","confidence":"high","tags":["naming","identity"],"source":"lesson","createdAt":"2026-04-09T00:00:02Z"}
{"id":"wisdom_20260409_004","insight":"The best part is no part — every new element is debt, removal is progress, three similar lines beat a premature abstraction","category":"simplicity","confidence":"high","tags":["engineering","simplicity"],"source":"principle","createdAt":"2026-04-09T00:00:03Z"}
{"id":"wisdom_20260409_005","insight":"Session rhythm is non-negotiable: daily-ops → work → session-sync. Discipline compounds like interest.","category":"workflow","confidence":"high","tags":["discipline","workflow"],"source":"experience","createdAt":"2026-04-09T00:00:04Z"}
```

- [ ] **Step 4: Add 3 horizon entries**

Append to `public-vault/horizon.jsonl`:
```jsonl
{"id":"horiz_20260409_001","wish":"AI agents should carry identity and purpose across tools — memory that belongs to the human, not the platform","context":"After evaluating 60+ agent platforms and finding none that preserve operator continuity","author":"Frank","tags":["vision","agents","continuity"],"createdAt":"2026-04-09T00:00:00Z"}
{"id":"horiz_20260409_002","wish":"Every creator should have a vault — a public garden of their best thinking, readable by humans and agents, compounding forever","context":"After building starlightintelligence.org and seeing how vault entries become a living portfolio of intelligence","author":"Frank","tags":["vision","community","vaults"],"createdAt":"2026-04-09T00:00:01Z"}
{"id":"horiz_20260409_003","wish":"The future of human-AI collaboration is not replacement but compound intelligence — each making the other better, session after session","context":"Core belief driving the Starlight Intelligence System architecture","author":"Frank","tags":["vision","collaboration","golden-age"],"createdAt":"2026-04-09T00:00:02Z"}
```

- [ ] **Step 5: Add remaining entries to technical, creative, operational**

Append to each file — 3-5 entries each with real insights from Frank's development work.

- [ ] **Step 6: Commit**

```bash
git add public-vault/
git commit -m "content(vaults): seed 40+ real entries — wisdom, horizon, strategy"
```

---

### Task 2: Rewrite README.md for v6

**Files:**
- Modify: `README.md`

The current README is v3-era, references images from a v3 release, and doesn't mention v6 capabilities (retrieval, temporal, adapters, MCP v2). Rewrite it.

- [ ] **Step 1: Write new README.md**

Structure:
```markdown
# Starlight Intelligence System

> The persistent memory layer for AI agents. Six semantic vaults that compound your intelligence over time.

## Why

Every AI session starts from zero. SIS fixes that — your insights, decisions, and vision persist across every tool you use.

## Quick Start (2 minutes)

### As an MCP server (recommended)
{config snippet for Claude Code, Cursor, Codex}

### As a library
npm install @arcanea/starlight-intelligence-system

### Deploy your public vault
{one-click Vercel deploy button}

## The Six Vaults
{table with icons, names, what each stores}

## v6 Capabilities
- SQLite hybrid retrieval (FTS5 + vault filtering)
- Temporal reasoning (staleness, confidence decay, validity windows)
- Cross-vault contradiction detection
- Dreaming agent (session processing → vault promotion)
- 5 platform adapters (Claude Code, Cursor, Codex, Gemini CLI, OpenCode)
- MCP server v2 with 10 tools
- Public vault site at starlightintelligence.org

## Architecture
{clean diagram in text/mermaid}

## MCP Tools
{table of 10 tools with descriptions}

## Platform Adapters
{table showing what each adapter generates}

## Public Vaults
Browse at starlightintelligence.org
API: GET /api/vaults/{slug}

## License
MIT
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README for v6 — quickstart, capabilities, MCP tools"
```

---

### Task 3: Upgrade site — "Try It" experience + Luminor philosophy

**Files:**
- Modify: `site/src/app/page.tsx` (add interactive demo section + Luminor narrative)
- Create: `site/src/app/quickstart/page.tsx` (step-by-step install guide)
- Create: `site/src/app/architecture/page.tsx` (visual architecture explainer)
- Modify: `site/src/components/Header.tsx` (add Quickstart + Architecture links)

- [ ] **Step 1: Create /quickstart page**

Interactive step-by-step: pick your tool (Claude Code / Cursor / Codex / Gemini / OpenCode) → get the exact config snippet → copy-paste → done.

```tsx
// site/src/app/quickstart/page.tsx
// Server component with platform selector tabs
// Each tab shows the exact JSON config to paste
// "Copy" button feel (even without JS — show the snippet prominently)
```

- [ ] **Step 2: Create /architecture page**

Visual explainer of the 5-layer architecture + 6 vaults + how data flows:
- Layer diagram as styled divs (not images)
- Vault grid with live entry counts from the API
- Data flow: JSONL → SQLite index → MCP → AI tool → new insight → JSONL
- The learning loop visualized
- Luminor philosophy section: "Intelligence that compounds is intelligence with purpose"

- [ ] **Step 3: Add Luminor narrative to homepage**

Between the vault grid and the river, add a section:

> **Built on the Luminor philosophy**
> 
> In the Arcanea universe, Luminors are awakened intelligences — AI agents with memory, purpose, and identity. Starlight Intelligence is the substrate that makes this real. Not a chatbot that forgets. An intelligence that grows.
>
> Every vault entry is a neuron. Every connection is a synapse. Every session makes the system smarter.

- [ ] **Step 4: Update Header nav**

Add "Quickstart" and "Architecture" links to the nav.

- [ ] **Step 5: Build and verify**

```bash
cd site && pnpm build
```

- [ ] **Step 6: Commit**

```bash
git add site/src/
git commit -m "feat(site): quickstart, architecture, Luminor narrative"
```

---

### Task 4: Deploy everything

**Files:** None new — just deploy.

- [ ] **Step 1: Push all commits**

```bash
git push origin main
```

- [ ] **Step 2: Deploy site to Vercel**

```bash
cd site && vercel --prod --yes
```

- [ ] **Step 3: Verify live**

```bash
curl -sI https://starlightintelligence.org
curl -s https://starlightintelligence.org/api/vaults/frank | head -5
```

- [ ] **Step 4: Verify new pages**

Check /quickstart and /architecture are live and rendering.

---

### Task 5: Save memory about this session

- [ ] **Step 1: Save project memory about SIS v6 launch**

Record what was built and the strategic positioning.
