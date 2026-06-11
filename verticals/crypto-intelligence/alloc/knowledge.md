# KNOWLEDGE — Volatility-Adjusted Allocation Methodology

> House of Allocation analytical methodology. Establishes mathematical and risk-mitigating standards for position sizing, portfolio rebalancing, and exit discipline.

---

## 1. Volatility-Adjusted Kelly Sizing

We utilize a fractional Kelly Criterion model to establish conviction-adjusted size boundaries, heavily discounted for asset-class volatility ($\sigma$):

$$f^* = \frac{p \cdot b - q}{b} \times D_{regime}$$

Where:
* **$f^*$** is the fraction of the portfolio allocated to the asset.
* **$p$** is the probability of a positive outcome (thesis conviction).
* **$q$** is the probability of a negative outcome ($1-p$).
* **$b$** is the odds ratio (expected gain / expected loss).
* **$D_{regime}$** is the dynamic regime discount multiplier (derived from House of Macro):
  * *Accumulation Phase:* $D = 0.5$ (Standard Half-Kelly)
  * *Expansion Phase:* $D = 0.3$ (Moderate Defensive)
  * *Distribution Phase:* $D = 0.1$ (Extreme Capital Protection)
  * *Contraction Phase:* $D = 0.0$ (Zero New Allocations)

---

## 2. Rebalancing and Volatility Bands

To optimize rebalancing without over-transacting, we define volatility bands ($VB$):

$$VB = \text{Target Size} \pm (2 \cdot \sigma_{90d})$$

Rebalancing is **only** triggered when the asset size drifts outside the volatility band, preventing micro-transaction bleeding.

---

## 3. Reference Literature

* **Kelly Sizing** — Canonical Kelly Criterion literature, Edward Thorp *The Kelly Criterion in Game Theory and Investing*.
* **Portfolio Optimization** — Modern Portfolio Theory (Harry Markowitz) critiques in highly correlated markets.
* **Exit Frameworks** — Trading psychology and execution logic frameworks for emotion-free exits.

---

**Built on SIP** — Crypto / House of Allocation knowledge · v0.2 · SIP v1.1.1
