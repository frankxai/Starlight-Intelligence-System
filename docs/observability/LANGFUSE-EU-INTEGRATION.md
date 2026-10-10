# Starlight Langfuse Cloud (EU) Observability & Experimentation

> **Sovereign telemetry and evaluation layer for Starlight Intelligence System (SIS).**  
> Built on SIP — sovereign substrate tier. Direct integration with Langfuse Cloud EU (Frankfurt data region).

---

## 1. Overview & EU Cloud Architecture

Starlight Intelligence System utilizes **Langfuse Cloud (EU)** as its persistent observability, prompt engineering, tracing, and experiment tracking backbone across all agent harnesses and orchestration engines.

### Endpoint & Region Specifications
* **Default EU Endpoint:** `https://cloud.langfuse.com` (EU Frankfurt data residency default for Langfuse SaaS)
* **Alternative EU Domain:** `https://eu.cloud.langfuse.com`
* **Zero-Leakage Invariant:** The telemetry client operates in **passive mock mode** when credentials are not supplied, ensuring that tests, local builds, and offline development never throw exceptions.

---

## 2. Configuration & Environment Variables

To activate live telemetry to your Langfuse Cloud EU project, set the following environment variables:

```bash
# In PowerShell (Windows)
$env:LANGFUSE_PUBLIC_KEY = "pk-lf-..."
$env:LANGFUSE_SECRET_KEY = "sk-lf-..."
$env:LANGFUSE_BASEURL    = "https://cloud.langfuse.com" # or https://eu.cloud.langfuse.com
$env:LANGFUSE_REGION     = "eu"
$env:LANGFUSE_ENV        = "production" # or "development"
```

```bash
# In POSIX bash / zsh
export LANGFUSE_PUBLIC_KEY="pk-lf-..."
export LANGFUSE_SECRET_KEY="sk-lf-..."
export LANGFUSE_BASEURL="https://cloud.langfuse.com"
export LANGFUSE_REGION="eu"
export LANGFUSE_ENV="production"
```

### Diagnostic Command
You can verify your configuration at any time by running:
```bash
npx tsx scripts/test-langfuse.ts
```

---

## 3. Harness Fleet Wiring

Langfuse Cloud EU telemetry is wired directly into all eight agent harnesses across Starlight Intelligence System:

| Harness | Role | Telemetry Surfaces | MCP Environment Pass-Through |
|---|---|---|---|
| **Claude Code** | Primary architecture & conductor | Session tracking, council dispatches | `LANGFUSE_*` env vars forwarded to `dist/mcp-server.js` & `dist/starlight-mcp.js` |
| **Google Antigravity** | Swarm execution & multi-agent native | Subagent spawns, progress, tool calls | `.antigravity/mcp-config.json` + `src/adapters/antigravity.ts` configured |
| **Codex** | Adversary, audit & security | Review spans, compliance audits | `core/orchestrator/harnesses/codex/mcp-config.json` configured |
| **Gemini CLI** | Long-context & structural diffs | Context priming & diff traces | `core/orchestrator/harnesses/gemini/mcp-config.json` configured |
| **Grok** | Parallel subagents & visual director | Excellence reviews, Queen loop traces | `core/orchestrator/harnesses/grok/mcp-config.json` configured |
| **OpenCode** | Latency-bound quick checks | Quick verification spans | `core/orchestrator/harnesses/opencode/mcp-config.json` configured |
| **Cursor** | IDE inline pair programming | Rules & context injection | `src/adapters/cursor.ts` configured |
| **Hermes** | Autonomous profiles & deep provenance | Swarm searches & provenance queries | `src/adapters/hermes.ts` configured |

---

## 4. MCP Server & Pipeline Tracing

### MCP Stdio Tools (`sis_*` & `starlight_*`)
Whenever any agent in any harness calls an MCP tool (`sis_vault_search`, `sis_append_entry`, `starlight_registry_query`, `sis_goal_update`, etc.), the MCP server automatically creates:
1. A Langfuse Trace under `mcp:<server>:<toolName>`
2. A Span capturing input arguments, output payload, and duration
3. A Score (`mcp_tool_success`) measuring reliability

### 7-Layer Orchestration Pipeline
The Orchestration Engine (`src/orchestrator.ts`) wraps all multi-agent workflows into structured traces:
* Perception → Memory Recall → Reasoning → Routing → Execution → Synthesis → Memory Write
* Metrics recorded: `orchestration_confidence`, pattern duration, complexity tier, memory recall count.

### Parallel Swarm Runner (`src/swarm.ts`)
The swarm pool (`runSwarm`) emits per-task spans with exit codes, task durations, and pass/fail scores.

### Semantic Memory Vaults (`src/vault-memory.ts` & `src/gateway/server.ts`)
Vault queries log query strings, search latency, vault filter, and retrieval mode (`hybrid` vs `lexical`).

---

## 5. How We Run Experiments & Evaluations

Starlight ships with a first-class experiment framework (`src/telemetry/experiments.ts` and `tools/run-experiments.ts`) that publishes dataset items, evaluation runs, and scores directly into Langfuse Cloud EU.

### Available Experiment Commands

```bash
# 1. Run all experiments (Risk evals + Retrieval benchmark + Model Arena sync)
npm run experiment

# 2. Run the 7 Track D Risk-Dimension Evals
npm run experiment:evals
# Or via the eval aggregator:
npm run test:v01-evals

# 3. Run the Keyword vs Hybrid Retrieval Benchmark (Recall@1/3/5 & MRR)
npm run experiment:retrieval

# 4. Sync Model Arena JSON receipts into Langfuse
npm run experiment:arena
```

### What Gets Logged to Langfuse EU

1. **Risk-Dimension Evals (`Track D v0.1`):**
   * Suite: `Track D v0.1 — 7 risk-dimension evals`
   * Per-file spans for:
     - `agent-event-completeness.test.ts`
     - `council-output-shape.test.ts`
     - `graph-edge-provenance.test.ts`
     - `pack-validity.test.ts`
     - `permission-compliance.test.ts`
     - `vault-privacy.test.ts`
     - `workpacket-completeness.test.ts`
   * Score: `eval_pass_rate` (0.0 to 1.0) and total duration.

2. **Retrieval Benchmarks:**
   * Corpus: `public-vault/`
   * Queries: 10 ground-truth labeled queries
   * Scores:
     - `retrieval_recall_1`
     - `retrieval_recall_3`
     - `retrieval_recall_5`
     - `retrieval_mrr` (Mean Reciprocal Rank)

3. **Model Arena Runs (`tools/arena/runs/*.json`):**
   * Head-to-head model performance (e.g. `fable5-vs-opus48`, `r3-lineup-4way`, `grok-composer25`)
   * Objective assert scores, judge scores (0-10 normalized), token usage, latency, and constraint compliance.

---

## 6. Verification & Health Check

Run the full verification suite to ensure all adapters, MCP servers, and telemetry tests pass:

```bash
npm run test:telemetry    # Telemetry and experiment unit test suite
npm run test:operational  # Operational test suite (including telemetry)
npm run lint              # Type check and lint
```

*Built on SIP — Starlight Intelligence Protocol v1.1.1*
