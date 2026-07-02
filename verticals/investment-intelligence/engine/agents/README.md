# Agents

This directory defines the **11 strategy-team agents** that produce Strategy Sessions.

## Files

- `catalog.json` — full agent catalog with personas, schemas, tool budgets, recommended models
- `personas/` — long-form prompts per agent (operators customize per their portfolio)
- `README.md` — this file

## How agents are invoked

Each agent is a **structured prompt** running on whatever LLM the operator chooses. The substrate is model-agnostic; the catalog recommends models for cost/capability optimization but does not require them.

```bash
# In any agent CLI session:
/weekly-strategy
# → loads architecture/04-multi-agent-team.md context
# → loads agents/catalog.json
# → runs Analysis layer in parallel (5 agents)
# → runs Risk layer sequentially (3 agents)
# → runs Synthesis layer (2 agents)
# → produces draft Strategy Session
# → waits for human verdict
```

## Customizing agents

Operators almost always need to customize:

1. **Macro agent's regime priors** — your view of which indicators matter
2. **Crypto-DCA's discipline rules** — your DCA cadence, asset list, pause conditions
3. **Tax-optimizer's jurisdiction** — replace NL overlay with yours
4. **Regulatory-risk's exchange list** — operator-private; never in OSS
5. **Risk-manager's defaults** — daily caps, drawdown tolerances, position-size limits

Customize by:

- Adding `agents/personas/<agent-id>.local.md` (gitignored for operators)
- Or forking the substrate and editing `catalog.json` for shareable team variants

## Cost management

Cost-per-session estimate (May 2026) at single-creator scale, with Claude pricing:

| Layer | Model | Cost per session |
|---|---|---|
| Analysis (5 agents) | Sonnet 4.6 / Haiku 4.5 | $0.10-0.25 |
| Risk (3 agents) | Sonnet 4.6 | $0.10-0.20 |
| Synthesis (2 agents) | Opus 4.7 (PM) + Sonnet 4.6 (CoS) | $0.30-1.00 |
| Researcher (on-demand) | Sonnet 4.6 + tool calls | $0.05-0.20 |
| **Total per session** | | **$0.55-1.65** |

Annual cost (52 weekly sessions + 4 quarterly): **~$30-90/year** at this scale.

If you can't justify $30-90/year for the substrate, you probably aren't holding enough capital for the substrate to provide marginal value.

## Routing across providers

Use Vercel AI Gateway or LiteLLM proxy to route per-agent. Recommended:

- Cost-sensitive layers (Analysis, Researcher) → Haiku 4.5 or Sonnet 4.6
- Reasoning-critical layers (Portfolio Manager) → Opus 4.7 or GPT-5
- Tool-use heavy (Researcher) → Sonnet 4.6 (reliable tool calling)

Single-provider operators: Claude Sonnet 4.6 across all layers, upgrade Portfolio Manager to Opus 4.7 if budget allows.

## Calibration

Per `architecture/05-memory-architecture.md`, every retrospective scores agent calls. After 30+ retrospectives, you have calibration data:

```
agent: defi-yield
trajectories_scored: 47
right: 18
partially_right: 21
right_for_wrong_reason: 5
wrong: 3
hit_rate_high_confidence: 71%
```

Use calibration to:
- Adjust the Portfolio Manager's weighting per agent
- Identify agents over-confidencing (high confidence calls failing > 30%)
- Identify agents systematically biased (always cautious, always aggressive)
- Retire or replace agents with persistent low hit rates

This is the **closing of the loop**. Without calibration, the team is ceremony.
