---
name: intelligence/strategic-reasoning
description: Use when reasoning about strategy, long-term direction, trade-offs, or roadmaps — provides structured analysis that balances ambition with reality, near-term gains with long-term value, and competing priorities. Default skill for Starlight Navigator and Starlight Prime.
type: substrate
version: "2026-08-25"
status: stable
---

# Strategic Reasoning

> *"Think in decades. Act in days. Ground every decision in empirical reality."*

## When This Skill Activates

- Strategy discussions, long-term roadmapping, architecture pivots, or capital/resource allocation.
- Keywords: "strategy", "strategic", "long-term", "trade-off", "prioritize", "roadmap", "decision tree", "consequence"
- Default for: Starlight Navigator, Starlight Prime, Starlight Architect
- Extended Thinking Trigger: Automatically triggers deep reasoning / extended thinking mode (`thinking: high`) when trade-off complexity or multi-party dynamics are present.

## What This Skill Does

Enables structured, high-reasoning strategic synthesis that balances visionary ambition with operational reality, near-term velocity with long-term compound value, and competing ecosystem priorities. Incorporates adversarial red-teaming, second-order consequence modeling, and Bayesian updates against past vault outcomes.

## Procedures

### Procedure 1: Problem Clarification & First-Principles Framing

1. **Deconstruct the Core Question**: Strip away legacy assumptions and isolate the underlying invariant goal.
2. **Context & History Retrieval**: Query the Strategic Vault (`memory/vaults/strategic/`) for past precedent, failed attempts, and locked decisions.
3. **State Mapping**:
   - Current Reality ($S_0$): Grounded facts, verified metrics, constraints, and current bottlenecks.
   - Target Horizon ($S_{\text{target}}$): The 10x desired end-state, defining clear non-negotiable invariants.
4. **Identify Asymmetries**: Look for leverage points where 10% effort unlocks 80% leverage, or where irreversible ("Type 1") risks lurk.

### Procedure 2: Adversarial Scenario Trees & Trade-Off Matrix

1. **Generate Divergent Options**: Formulate at least 3 distinct, mutually exclusive strategic pathways (Aggressive Velocity, Sovereign Fortification, Hybrid Phased Rollout).
2. **Second-Order Consequence Analysis**:
   - Immediate impact ($T_0 \to T_1$): Direct output, resource consumption.
   - Compound effects ($T_1 \to T_{\infty}$): Flywheel acceleration, technical debt, organizational friction, ecosystem lock-in.
3. **Red-Team Stress Testing (Santa Crown Gate)**:
   - Identify the single fatal flaw or counter-move for each path.
   - Model the worst-case failure scenario and catastrophic recovery plan.
4. **Weighted Decision Matrix**:
   - Criteria: Strategic Alignment (30%), Builder Abundance (25%), Execution Feasibility (25%), Asymmetric Upside (20%).
   - Explicitly document what is sacrificed for what is gained.

### Procedure 3: Phased Execution & Milestone Gating

1. **Backcast from Success**: Break the winning pathway into discrete, verifiable phases ($30 \text{ min} \to 1 \text{ day} \to 1 \text{ week} \to 1 \text{ quarter}$).
2. **Define Falsifiable Signals**: What early metrics or test results would prove our initial hypothesis wrong?
3. **Actionable Horizon Hand-off**: Format output into clear, sequenced instructions for specialized builder subagents.
4. **Vault Persistence**: Commit the decision record, trade-off rationale, and review trigger date to the Strategic Vault.

## Integration Points

- **Vaults**: Strategic Vault (past decisions + rationale), Wisdom Vault (long-term heuristics), Horizon Vault (vision ledger)
- **Agents**: Navigator (strategic roadmapping), Prime (consensus resolution), Architect (structural feasibility), Sentinel (risk gating)
- **Harnesses**: Native Antigravity subagent swarm, Claude Code `/starlight`, Codex cascading prompts

## Quality Criteria

- Are all options rigorously evaluated with transparent trade-offs (no straw-man options)?
- Are second-order consequences and downside failure modes explicitly articulated?
- Is the recommendation immediately executable by developer and domain swarms?
- Does the output carry verifiable grounding and SIP attestation?
