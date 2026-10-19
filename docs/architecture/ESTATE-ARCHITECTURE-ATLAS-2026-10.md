# Starlight Estate Architecture & Documentation Atlas (v9.3 · October 2026)

> **Interactive HTML5/SVG Live Surface:** [`/atlas/index.html`](../../site/public/atlas/index.html) (`https://starlightintelligence.org/atlas/index.html`)  
> **Agent-Readable Manifest:** [`/llms.txt`](../../site/public/llms.txt) · **Bi-Temporal Fact Ledger:** [`memory/vaults/temporal-facts.jsonl`](../../memory/vaults/temporal-facts.jsonl)

---

## 1. Design & Engineering Standard: Dual-Consumer (Human + Agent) Architecture

Modern documentation and architecture systems must serve **two first-class consumers simultaneously** without duplicating maintenance or inflating cloud hosting costs:

1. **Human Operators & Architects (Desktop + Mobile Touch):**
   - **Unblocked (`getunblocked.com`) Code-to-Decision Provenance:** Clicking or tapping any node in `/atlas/index.html` reveals *why* it exists, the exact file path, the GitHub PR/SHA receipt, the automated test gate, and the **historical misconception it superseded**.
   - **Linear (`linear.app/docs`) & Stripe (`docs.stripe.com`) Visual Craft:** `#060609` deep cosmic obsidian canvas, `1px` `rgba(255,255,255,0.08)` hairlines, keyboard-first navigation (`/` search, `1`–`5` view switching), and side-by-side live CLI commands.
   - **Gemini 4 Argon Mobile HTML5 + SVG Vector Engine:** Zero-dependency vector schematics (`viewBox="0 0 1200 760"`) with animated cubic-bezier packet flows (`stroke-dasharray`), 1-finger touch pan, 2-finger pinch-to-zoom, and instant `<15ms` static edge delivery.
2. **AI Agents & Harnesses (Local & Cloud):**
   - **Two-Artifact Turn-0 Core (`tools/compile-turn0-core.mjs`):** Compiles Turn-0 instructions into `Doctrine <= 8 KB` (`3,495 B`) + `Catalog <= 8 KB` (`4,730 B`) = **`2,057 tokens` total** (a **96.9% reduction** from legacy 50k–83k token boots), paired with `GEMINI.md` (`8,214 B`) and Codex `project_doc_max_bytes = 98304`.
   - **Bi-Temporal Fact Spine (`src/memory/temporal-spine.ts` & `memory/vaults/temporal-facts.jsonl`):** Tracks `tValid`, `tInvalid`, `tCreated`, `tExpired`, and `supersededBy` pointers so outdated assumptions are automatically invalidated when estate state changes.
   - **Citation-Stable Raw Endpoints:** `/llms.txt`, `/sip.md`, `/protocol.md`, and one-click `Copy for LLM` inside `/atlas/index.html`.

---

## 2. Five-Layer Sovereign Topology

```mermaid
flowchart TB
  subgraph L1["Layer 1 · 1 Dutch Legal Entity (Eenmanszaak — Frank Riemer, Amsterdam) + Registered Trade Names (Handelsnamen)"]
    EZ["Dutch Eenmanszaak (Frank Riemer · KvK)\nZero B.V.s exist · 'BV' never appears in any trade name"]
    TN1["Starlight Intelligence (Primary / Main)\nAI Substrate · SIP Protocol · Memory · Systems"]
    TN2["Arcanea & Arcanea Records\nCreative Universe · Music Label (4 Imprints)"]
    TN3["GenCreator · VibeClubs · FrankX · AI Architect Academy\nCreator OS · Live Co-Creation · Flagship & Education"]
    EZ --> TN1 & TN2 & TN3
  end

  subgraph L2["Layer 2 · 5 Product Studios · 13 Brands · 10-SKU Release Train"]
    S1["Studio 1: Starlight Intelligence\nSKU-02 SIS · SKU-03 Shop v2 · SKU-06 Design · SKU-08 Memory"]
    S2["Studio 2: Arcanea Creative & Arcanea Records\nSKU-04 Arcanea Realm App · 4 Music Label Imprints"]
    S3["Studio 3: GenCreator, VibeClubs & FrankX\nSKU-01 ACOS Pro · SKU-05 6-Pillar CoE · SKU-07 Skills Library"]
    S4["Studio 4: AI Architect Enterprise\nSKU-09 AI Architect Academy & OCI Blueprints"]
    S5["Studio 5: Life & Wealth Systems\nAgentic Income · Life Commons"]
  end

  subgraph L3["Layer 3 · 10 Federated GitHub Orgs (96 Repos, 0 Empty) + frankxai (414 Repos)"]
    O1["Starlight-Intelligence (11)\nStarlight-Intelligence-Systems (7)"]
    O2["Arcanea-Labs (13)"]
    O3["FrankX-AI (11) · GenCreator-ai (9)"]
    O4["oci-ai-architects (14) · AI-Architect-Studio (8)\nAI-Architect-Academy (5)"]
    O5["Agentic-Income (10) · Life-Commons (8)\nfrankxai Control Hub (414)"]
  end

  subgraph L4["Layer 4 · 8 Harnesses × 151 Named SIS Agents × 89 Skills"]
    H1["Local Harnesses (6): Antigravity · Claude Code · Codex · OpenCode · Cursor · Gemini CLI"]
    H2["Cloud & Autonomous (2): Jules (Async Sweeps) · Hermes (6-Pillar CoE & Provenance)"]
    H3["151 SIS Council Agents across 17 Skill Domains (EXEMPT_PHANTOMS = 0)"]
  end

  subgraph L5["Layer 5 · Sovereign Runtime Daemons, Bi-Temporal Spine & Telemetry"]
    D1["SIS Memory Gateway (127.0.0.1:5200 — OK, 3,590 entries)"]
    D2["Shared Tool Plane (127.0.0.1:7317 — READY, 4/4 backends, 38 tools)"]
    D3["Bi-Temporal Fact Spine (24 records: 15 active truths / 9 superseded)"]
    D4["Infisical EU (6e39a7d9...) + Zero-Loss Local Langfuse OTLP Spooler"]
  end

  TN1 --> S1 & S5
  TN2 --> S2
  TN3 --> S3 & S4
  S1 --> O1
  S2 --> O2
  S3 --> O3
  S4 --> O4
  S5 --> O5
  O1 & O2 & O3 & O4 & O5 --> H1 & H2 & H3
  H1 & H2 & H3 --> D1 & D2 & D3 & D4
```

---

## 3. Documentation & Wiki FinOps Economics (Vercel vs. Vite/Astro vs. Fumadocs vs. DeepWiki vs. Unblocked)

| Stack / Layer | Role in Starlight Estate | Monthly Cost | Performance & Agent Benefit |
| :--- | :--- | :---: | :--- |
| **Static HTML5/SVG Atlas (`site/public/atlas/index.html`)** | Interactive 5-layer topology, Unblocked-style provenance inspector, Turn-0 simulator, and Argon prompt studio | **$0 / mo** *(0 Vercel Fluid Compute invocations)* | `<15ms` CDN edge delivery, 60fps mobile touch pan/zoom, zero JS framework hydration overhead |
| **Next.js Static Routes + Fumadocs Pattern (`site/src/app/docs` & `/architecture`)** | Public protocol, quickstart, and architecture narrative on `starlightintelligence.org` | **$0 / mo incremental** *(covered by existing Vercel project, cached via `revalidate = 3600`)* | Paired with `/llms.txt`, `/sip.md`, and `/protocol.md` raw Markdown endpoints |
| **Bi-Temporal Fact Spine (`src/memory/temporal-spine.ts`)** | Replaces paid Unblocked SaaS (`$25–$40/seat/mo`) for cross-session code-to-decision provenance | **$0 / mo** *(git-tracked JSONL)* | Zero Neo4j RAM overhead, zero LLM extraction cost, deterministic Turn-0 injection |
| **DeepWiki (`deepwiki.com/<org>/<repo>`)** | Automated repo wiki & call-graph mirror for all **96 public repos** across our 10 GitHub Orgs | **$0 / mo** *(100% free for public GitHub repos)* | Instant zero-maintenance onboarding graphs for external contributors and DeepWiki MCP queries |
| **Vite / Astro Starlight on GitHub Pages / Cloudflare Pages** | Standalone documentation sites for individual OSS packages in our 10 GitHub Orgs | **$0 / mo** *(unlimited static bandwidth)* | Isolates OSS package docs from Vercel build-minute quotas |

---

**Built on SIP** · Verified `2026-10-18` (`SIS#451` @ `9840daab1`, `SIS#452` @ `7bea14863`, `agentic-ops-hub#363` @ `22181a5`).
