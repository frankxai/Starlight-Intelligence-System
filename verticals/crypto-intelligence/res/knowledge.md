# KNOWLEDGE — Protocol Thesis & Diligence Methodology

> House of Research analytical methodology. Establishes standards for token vesting modeling, developer audit, and ecosystem dependency tracking.

---

## 1. Token Dilution Modeling

We calculate the Annual Inflation Rate ($AIR$) and the Dilution Multiplier ($DM$) over a 24-month horizon:

$$AIR = \frac{\text{Supply}_{t+12} - \text{Supply}_t}{\text{Supply}_t}$$

Where:
* **$\text{Supply}_t$** is the current circulating supply.
* **$\text{Supply}_{t+12}$** is the estimated circulating supply in 12 months, accounting for team cliffs, advisor unlocks, and ecosystem incentives.

A project with $AIR > 0.15$ is flagged as a *high-inflation vector*, requiring high conviction and a clear staking yield offset from House of DeFi before capital sizing.

---

## 2. Developer Activity Tracking

To verify genuine builder adoption, we audit GitHub repository activity:
* **Dev Count** — number of unique contributors with $>5$ commits in the last 90 days.
* **Commit Velocity** — monthly commit volume on primary execution branches.
* **Dependency Health** — tracking outdated, locked, or vulnerable NPM/Rust dependencies.

We refuse to accept "high developer interest" claims without verifying active commit histories.

---

## 3. Reference Literature

* **Tokenomics Design** — Tokenomics DAO frameworks, academic token-design economic papers.
* **Team Diligence** — Open-source repository OSINT frameworks.
* **Ecosystem Mapping** — Messari protocol research methodology.

---

**Built on SIP** — Crypto / House of Research knowledge · v0.2 · SIP v1.1.1
