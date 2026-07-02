# Honest Limits — What This Substrate DOES NOT Promise

> **Read this before believing anything else in the repo.**

The IIS substrate is positioned with maximum honesty about what it can and cannot do. This file is the contract; if any other documentation in this repo contradicts it, this file wins.

---

## What this substrate IS

✅ A **decision-support framework** that imposes structure on weekly wealth decisions
✅ A **discipline-enforcement scaffolding** that catches biases through structured debate
✅ A **journal that compounds** — sessions accumulate into a learning corpus
✅ A **tax-aware position planner** that surfaces jurisdiction-specific implications
✅ An **audit trail** of past decisions with retrospective outcome tracking

---

## What this substrate IS NOT

### ❌ NOT an alpha-generation system

Multi-agent debate catches biases and surfaces trade-offs. **It does not generate market-beating returns.**

The empirical truth: most retail "AI trading systems" lose money to brokers + slippage + bias + overconfidence. The compounding edge for a part-time investor is **not making catastrophic decisions** (panic-sells, FOMO buys, position-size errors, tax mistakes), more than alpha generation.

If you measure this substrate by "did it beat the S&P 500," you are measuring the wrong thing. Measure it by:
- Did you avoid the panic-sell in the next 20% drawdown?
- Did you maintain DCA discipline through the next bear market?
- Did your cost-basis tracking save you from a tax mistake at year-end?
- Did the thesis-debate surface a position-size error before you took it?

That's where the value lives.

### ❌ NOT a trading bot

The substrate operates on **weekly cadence** for the strategy layer. Even the execution layer (Tier 2) operates on rule-based DCA + thesis-driven positions, not high-frequency trading.

If you want a trading bot, look at Freqtrade or Hummingbot directly. They are excellent at what they do. The IIS substrate would slow them down, not improve them.

### ❌ NOT a robo-advisor

Robo-advisors (Wealthfront, Betterment, etc.) have:
- Fiduciary regulatory standing
- Bucket-based risk-profile assignment
- Tax-loss harvesting automation
- Compliant onboarding flow

The IIS substrate has none of those. It is **opinionated scaffolding** that you operate yourself, with full human responsibility for outcomes.

### ❌ NOT financial advice

Strategy Sessions, agent debates, tax-overlay outputs — none of this is financial, tax, or legal advice. It is **decision-support information** that you, the operator, integrate with advice from qualified human advisors.

In the Netherlands, that means a `belastingadviseur` for tax and a registered `financieel adviseur` for mortgage and investment advice on regulated products. Equivalent professionals exist in your jurisdiction.

### ❌ NOT a guarantee of returns

Past Strategy Session quality, agent debate sophistication, retrospective hit rates — none predict future returns. Markets are markets. Risk is risk. The substrate makes you more disciplined, not more clairvoyant.

### ❌ NOT a substitute for understanding

The substrate runs in your agent CLI. The agent CLI runs an LLM. LLMs hallucinate, especially on numerical data, recent regulatory changes, and edge cases. **Verify the agent's claims against primary sources** before acting.

The `researcher` agent is required to cite primary sources for a reason: agents lie when they don't have grounded data. Calibrate your trust accordingly.

### ❌ NOT secure if you skip the security model

The 3-tier security model (`01-three-tier-security.md`) is the architecture. If you collapse it — putting trade-permission API keys in `.env` files the agent reads, or storing seeds in cloud-synced directories — the substrate provides no protection. The architecture is the security; you have to operate it.

---

## What this substrate MIGHT do (no guarantees)

🟡 **Save you from one catastrophic decision** in a 5-10 year horizon. (One panic-sell avoided in a 50% drawdown often equals a decade of "alpha.")

🟡 **Catch one tax mistake** before year-end (Box 3 timing, BV rotation, DAC8 reporting).

🟡 **Surface one position-size error** before you make it (rebalancing discipline catches drift).

🟡 **Identify one biased pattern in your thinking** through the retrospective layer (e.g., "I always size down when X says high confidence — is that good discipline or systematic under-investment?").

These are the four outcomes the substrate **plausibly** delivers. None are guaranteed. All require running the substrate consistently for 12+ weeks before the corpus has anything to say.

---

## What you must accept to use this substrate

1. You are responsible for every decision. No agent. No system. **You.**
2. The substrate is informational. Advice comes from qualified humans, not from this repo.
3. Outcome tracking is honest. Lessons are unflattering when they are. Don't edit history.
4. Privacy boundary is non-negotiable. Tier 1/2 secrets never enter Tier 3.
5. You will run the Sunday session for at least 12 weeks before judging effectiveness.

If you can't accept those, this substrate is not for you. Use a robo-advisor.

---

## What contributors must accept

1. PRs that promise "alpha" or "returns" are rejected.
2. PRs that weaken the security model (Tier 1/2/3 boundary) are rejected.
3. PRs that add complexity without clear retrospective-learning value are rejected.
4. PRs that hardcode jurisdiction-specific amounts in agent prompts (rather than tax overlays) are rejected.
5. PRs that ship working trading code (rather than spec + adapter pattern) are rejected — that belongs in operator-private repos.

---

## The empirical claim

Multi-agent debate + structured journal + outcome retrospective + tax overlay >> intuition alone, **for the four plausible outcomes above.**

This claim is testable in your own corpus over 50+ sessions. The substrate makes the test possible. The test result is your truth.

---

## The motto

> Discipline beats intuition. Process beats prediction. Audit beats optimism.

Internalize that, and the substrate gives you what it can give you.

Reject it, and look elsewhere — there are better tools for whatever else you want.
