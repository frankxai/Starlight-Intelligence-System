---
name: intelligence/frontier-model-routing
description: Dynamic routing across frontier LLMs and reasoning models (Claude 3.7 Thinking, o1/o3-mini, Gemini 2.0/2.5 Pro/Flash, DeepSeek-R1, Grok 3), matching cognitive depth, token budgets, and tool capabilities to task requirements.
type: intelligence
version: "2026-08-25"
status: stable
---

# Frontier Model Routing & Extended Thinking

> *"Route each task to the model engineered for its exact cognitive topology."*

## When This Skill Activates

- Deciding which LLM or reasoning harness to invoke for a task or subagent.
- Keywords: "model routing", "frontier model", "extended thinking", "o1", "o3", "claude 3.7", "gemini 2.5", "deepseek-r1", "grok 3", "reasoning model"
- Default for: Starlight Orchestrator, Starlight Prime, Starlight Architect

## What This Skill Does

Selects and configures the optimal LLM backend based on task complexity, context length requirements, reasoning depth, latency tolerance, and cost efficiency. Configures extended thinking parameters (thinking budgets, step constraints, output formats) for native reasoning models.

## Frontier Model Matrix (2026)

| Model Family | Core Strengths | Best Used For | Extended Thinking Strategy |
|---|---|---|---|
| **Claude 3.7 Sonnet (Thinking)** | Hybrid reasoning + coding, nuanced instruction following, architectural diffs | Substrate code, refactors, complex tool use, Santa Crown reviews | Dynamic thinking budget (1k–16k tokens) based on cyclomatic complexity |
| **OpenAI o1 / o3-mini** | Deep mathematical reasoning, competitive programming, formal verification | Hard algorithmic challenges, cryptanalysis, formal proofing | Native internal reasoning chain; constraint-focused prompts |
| **Gemini 2.5 Pro / Flash (Thinking)** | 1M–2M context window, native multimodal understanding, rapid research sweeps | Large codebase scans, cross-repo audits, long document synthesis | `flash` for research scout; `pro` with thinking for deep synthesis |
| **DeepSeek-R1 / V3** | Open-weights reasoning, low-cost parallelization, math/logic validation | High-throughput subagent swarms, verification checks, cost-sensitive batch runs | Direct step-by-step logic distillation |
| **Grok 3 (xAI)** | Uncensored research, real-time X telemetry, adversarial analysis | Real-time news analysis, market sentiment, contrarian strategy | Adversarial red-team stress testing |

## Procedures

### Procedure 1: Cognitive Task Classification

1. **Classify Task Type**:
   - *Tier 1 (Scout / Fast Lookup)*: File finding, keyword grep, schema lookup, trivial formatting $\to$ Route to `flash` / `flash_lite` / `haiku` (0s thinking).
   - *Tier 2 (Builder / Implementation)*: Multi-file feature build, standard tests, UI components $\to$ Route to `sonnet` / `codex` / `gemini-pro`.
   - *Tier 3 (Architect / Deep Reasoning)*: Strategic pivots, security audits, formal verification, complex consensus $\to$ Route to `claude-3.7-thinking` or `o3-mini` / `gemini-2.5-pro-thinking`.
   - *Tier 4 (Adversarial Crown Gate)*: Red-teaming, lore consistency, anti-slop verification $\to$ Route to contrasting model family (e.g., Gemini reviews Claude output, or Claude reviews o1 output).

### Procedure 2: Extended Thinking Budget Calibration

1. **Calculate Token Budget**:
   - Small logic puzzle / regex / SQL query: 1,000–2,000 thinking tokens.
   - Architectural refactor / system design: 4,000–8,000 thinking tokens.
   - Comprehensive multi-system security audit: 16,000+ thinking tokens.
2. **Author Thinking Prompts (What & Why, Not How)**:
   - Provide explicit acceptance criteria and invariants.
   - Avoid rigid micromanagement ("Step 1 do X, Step 2 do Y") which degrades reasoning model exploration.
   - Mandate explicit verification steps before emitting final answer.

### Procedure 3: Multi-Model Adversarial Consensus (Cross-Model Council)

```
┌────────────────────────────────────────────────────────┐
│               CROSS-MODEL COUNCIL TOPOLOGY             │
│                                                        │
│  [Claude 3.7 Draft]  ──┐                               │
│                        ├─► [Synthesis & Gate Check]    │
│  [Gemini 2.5 Audit]  ──┤   (Starlight Prime)           │
│                        │                               │
│  [o3-mini Verify]    ──┘                               │
└────────────────────────────────────────────────────────┘
```

1. Dispatch parallel subagents with differing model backends.
2. Collect outputs and run contradiction analysis in Starlight Prime.
3. If outputs diverge, isolate the divergence in reasoning assumptions and resolve via empirical test execution in the Sandbox.

## Integration Points

- **Harnesses**: Antigravity subagent model selector (`flash`, `pro`, `inherit`), Claude Code, Codex, Grok CLI
- **Vaults**: Technical Vault (benchmark scores, model token latencies), Operational Vault (dispatch receipts)

## Quality Criteria

- Was the cheapest and fastest model capable of satisfying quality criteria selected?
- Were reasoning models given explicit goals and validation criteria without over-prescribed step micro-management?
- Did critical code pass multi-model adversarial review before release?
