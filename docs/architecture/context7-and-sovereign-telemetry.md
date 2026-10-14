# Sovereign Telemetry, Context7 MCP & Modern Model Routing

> **Starlight Intelligence System (SIS) Architecture Standard**  
> *Built on SIP — Sovereign Substrate Tier · Luminor Kernel Mindset (Precision · Wisdom · Transcendence)*

---

## 1. Context7 MCP: Real-Time Ground Truth Documentation

### The Problem Solved
AI coding agents are traditionally constrained by static training cutoffs and hallucinated library methods. In fast-evolving ecosystems (Next.js 15, AI SDK 4, Langfuse v3, Supabase v2), static training data produces deprecated imports, nonexistent parameters, and silent build breakages.

**Context7 MCP** (`@upstash/context7-mcp`) resolves this by dynamically pulling version-specific, official documentation and verified code snippets directly into the agent's context during reasoning.

### Tool Contract
The Context7 MCP server exposes two primary tools:
1. **`resolve-library-id`**: Translates generic package queries into Context7 library slugs (e.g. `next` → `/vercel/next.js`, `langfuse` → `/langfuse/langfuse`).
2. **`query-docs`**: Fetches current API references, signatures, and example code directly from official repositories and docs.

### Registry Configuration
Registered in `.antigravity/mcp-config.json` and `tools/mcp-registry.csv`:
```json
{
  "mcpServers": {
    "context7": {
      "_role": "real-time-documentation — eliminates API hallucinations and outdated cutoffs",
      "_purpose": "Pulls up-to-date, version-specific library documentation and live code examples directly from official sources",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"],
      "env": {
        "CONTEXT7_API_KEY": "${CONTEXT7_API_KEY}"
      }
    }
  }
}
```

### Agent Usage Guideline
Before writing code that touches external libraries or modern SDK interfaces, agents should execute:
```text
use context7 <library_name>
```
This forces ground-truth verification before emitting code modifications.

---

## 2. Modern Model Lineup & Cross-Harness Matrix

Our routing doctrine in `routing.toml` maps tasks to their optimal execution model:

| Role / Intent | Primary Model / Engine | Capability & Advantage | Token / Cost Class |
|---|---|---|---|
| **Substrate & Prime Leadership** | **Claude 3.7 Sonnet / Opus 5** | Deepest instruction compliance, nuanced reasoning, strict SIP invariant adherence | Premium ($5–$25 / MTok) |
| **Mechanical Refactors & Diffs** | **Codex CLI (`gpt-5.6-terra` / `gpt-4o`)** | Unmatched AST precision on large multi-file diffs, minimal hallucinations on file writes | Standard ($2.50–$10 / MTok) |
| **Massive Context (>200K Tokens)** | **Gemini 2.5 Flash / Pro** | 1M–2M context window; rapid whole-repo analysis and cross-file structural diffs | Ultra-Low ($0.075–$0.30 / MTok) |
| **Fast Scratchpad & Syntax Checking** | **OpenCode CLI + Nemotron Free** | Near-instant generation (<500ms), zero API fees, perfect for quick disposable checks | **$0.00** (Free Route) |
| **Deep Reasoning & Deduction** | **Jev Router (`deepseek-r1` / `o3-mini`)** | Multi-step deduction with verified intermediate step evaluation via OpenRouter | Cent-level ($0.14–$1.10 / MTok) |
| **Visual Direction & Card Synthesis** | **Grok 3 / Gemini Image Gen** | High aesthetic density, diagramming, visual artifact cards | Per-asset |
| **Sentinel Safety & Guardrails** | **Sentinel Agent + Local Regex Rails** | Deterministic input/output checks, PII scrubbing (The Veil), zero latency | **$0.00** (Local CPU) |

---

## 3. Jev Router: Typesafe OpenRouter Arbitration

Located at `src/runtime-bridge/jev-router.ts`:
- Enforces strict `JevRouterPolicy` (`classification: "public"`, `costTier: "low" | "medium" | "high"`, verified model pool).
- Rejects wildcards (`auto/*`) and unapproved models fail-closed.
- Exports `RECOMMENDED_SOVEREIGN_MODELS` covering flagship models across Anthropic, OpenAI, Google, DeepSeek, Meta, and xAI.
- Bridges multi-model swarms to 200+ providers via OpenRouter with zero lock-in to proprietary hosted dashboards.

---

## 4. Infisical CLI: Zero-Typing Sovereign Secrets

### Resolution Architecture
Every secret lookup (`LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `OPENROUTER_API_KEY`, `CONTEXT7_API_KEY`) follows a 4-tier chain via `resolveSovereignSecret`:

```
1. Explicit in-code option
   ↓
2. process.env environment variable
   ↓
3. Local & Global .env files (.env, .env.local, ~/.starlight/.env)
   ↓
4. Infisical CLI secret store (infisical secrets get <KEY> --silent)
   ↓
5. Safe Passive Mock (offline fallback — never crashes)
```

### CLI Workflow
1. **Interactive Binding (One-Time Setup):**
   ```bash
   infisical init
   ```
   Selects your `Starlight EU` project and creates `.infisical.json`.
2. **Execution with Injected Secrets (Zero Disk Writes):**
   ```bash
   npm run infisical:run -- npm run experiment
   ```
3. **Machine-Wide Vault Alternative (`~/.starlight/.env`):**
   Place keys in `C:\Users\frank\.starlight\.env` for automatic discovery across all repos on this machine without touching Git.

---

## 5. Evaluation Execution Cadence: Hybrid Model

```
                       EVALUATION CADENCE STRATEGY
┌────────────────────────────────────────────────────────────────────────┐
│  Tier 1: ALWAYS-ON / BACKGROUND DAEMON (Local — $0.00 Spend)           │
│  - Track D Risk Evals (34 pass / 7 todo in 23s)                        │
│  - Retrieval Benchmarks (100% Recall@1/3/5 in 57ms)                     │
│  - Substrate Symmetry Tests (test:substrate in 12s)                    │
│  - Hash Chain Ledger Verification (evalctl verify in 2s)               │
│  → Triggers: Git commit hooks, Active Healing Daemon, morning watchdog │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Tier 2: GATED / SCHEDULED ARENA RUNS (Hosted APIs — Cost-Controlled)  │
│  - Model Arena Rounds (Claude 3.7 vs GPT-4o vs Grok vs DeepSeek)       │
│  - R5 Deep Reasoning (propagated deduction traps + micro-cost tracking)│
│  - Langfuse Trace Sync & Scorecard Publication                         │
│  → Triggers: Release tags, prompt modifications, weekly cadence (14d)  │
└────────────────────────────────────────────────────────────────────────┘
```

*Built on SIP — Starlight Intelligence Protocol v1.1.1*
