# KNOWLEDGE — Macro Regime & Correlation Methodology

> House of Macro analytical methodology. Establishes the mathematical and empirical standards for first-principles cycle-tracking and regime detection.

---

## 1. Regime Detection Framework

We classify the market into 4 distinct phases based on volatility ($\sigma$), dominance (BTC.D), and realized-cap velocity:
* **Accumulation (Phase I)** — Volatility $\sigma$ falls below rolling 365-day average; BTC dominance climbs; on-chain realized price is higher than market price for marginal cohorts.
* **Expansion (Phase II)** — Volatility spikes; altcoin volume expands relative to BTC; funding rates stay positive; realized cap accelerates.
* **Distribution (Phase III)** — Altcoin correlation reaches peak; BTC dominance falls; net exchange inflows spike; whale wallet flows diverge.
* **Contraction (Phase IV)** — Funding rates turn negative; realized cap decelerates; correlation across all crypto assets shifts toward 1.0.

---

## 2. Macro Correlation Modeling

To isolate true protocol-driven strength from pure beta drift, we compute Pearson correlation coefficients ($r$) against:
* **DXY (US Dollar Index)** — Liquidity inverse proxy.
* **US10Y / US02Y** — Risk-free yields.
* **SPX / NDX** — Equity beta correlation.

$$r = \frac{\sum (X_i - \bar{X})(Y_i - \bar{Y})}{\sqrt{\sum (X_i - \bar{X})^2 \sum (Y_i - \bar{Y})^2}}$$

We calculate rolling 30-day, 90-day, and 365-day coefficients. A correlation shift is defined when the 30-day coefficient moves $>2\sigma$ from the 365-day mean.

---

## 3. Reference Literature

* **Liquidity and Cycles** — *The Global Liquidity Cycle* (IMF working papers), Glassnode *Realized Cap* and *MVRV* methodology.
* **Epoch Halving Dynamics** — PlanB *Stock-to-Flow* critiques (we refuse the model's predictive claims, but utilize the epoch structure for historical categorizations).
* **Correlation Arbitrage** — Empirical finance literature on asset class correlation during liquidity shocks.

---

**Built on SIP** — Crypto / House of Macro knowledge · v0.2 · SIP v1.1.1
