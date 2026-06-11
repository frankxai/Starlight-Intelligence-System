# KNOWLEDGE — DeFi Mechanism & Yield Audit Methodology

> House of DeFi analytical methodology. Establishes the standards for auditing protocol collateral parameters, yield flows, and oracle resilience.

---

## 1. Yield Deconstruction Formula

We mathematically isolate real yield ($Y_{real}$) from emissions-incentivized yield ($Y_{emissions}$) to evaluate yield sustainability:

$$Y_{total} = Y_{real} + Y_{emissions}$$

Where:
* **$Y_{real}$** is fee revenue generated from swap volume, lending interest paid by borrowers, or protocol fees.
* **$Y_{emissions}$** is the value of inflationary protocol tokens distributed to depositors.

Sustainability Index ($SI$):

$$SI = \frac{Y_{real}}{Y_{total}}$$

A pool with a Sustainability Index $SI < 0.2$ is classified as a *high-dilution tokenomic vector*, requiring rapid exit discipline.

---

## 2. Oracle Attack Surface Metrics

To model the cost of oracle manipulation, we calculate the minimum liquidity required to move a protocol's price feed past its liquidation threshold:

$$\text{Cost of Manipulation} \propto \text{Depth of Pool} \times \text{TWAP Window}$$

We audit three primary vectors:
* **Liveness Risk** — Failover latency if an oracle price feed goes offline (e.g. during extreme market volatility).
* **Manipulation Vectors** — Availability of single-block flash loan liquidity to skew the oracle feed (especially on Uniswap V2/V3 spot-price dependencies).
* **Cross-chain Lag** — Arbitrage delay between the main execution chain and collateralized Layer 2s.

---

## 3. Reference Literature

* **AMMs and Liquidity** — Uniswap V3 whitepaper canonical math, Curve stable-swap invariant equations.
* **Oracle Manipulation** — Zep *Price Oracle Manipulation* attacks, academic papers on flash loan economic attacks.
* **Yield Metrics** — DefiLlama yield tracking and pool performance standards.

---

**Built on SIP** — Crypto / House of DeFi knowledge · v0.2 · SIP v1.1.1
