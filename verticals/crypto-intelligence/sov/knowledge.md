# KNOWLEDGE — Custody Architecture & Jurisdictional Methodology

> House of Sovereignty analytical methodology. Defines first-principles guidelines for cryptographic key security, hardware threat models, and legal structures.

---

## 1. Key Segregation Architecture (Tiers)

We divide assets into three tiers based on velocity and exposure risk:
* **Hot Tier (Tier 3)** — 5-10% of total capital. Active trading, gas wallets, browser extensions. High exposure to smart contract and frontend drainer malware.
* **Warm Tier (Tier 2)** — 20-30% of capital. Cold hardware wallet addresses. Used for stable yield pools and governance voting. Signatures require manual review and physical hardware interaction.
* **Cold Tier (Tier 1)** — 60-70% of capital. Multisig (e.g. 3-of-5) using hardware signers from different manufacturers (to avoid supply chain attacks). Keys are geodistributed across multiple safe locations. Used for long-term cycle holdings.

---

## 2. Multisig Quorum Math

We calculate the probability of quorum compromise based on independent failure rates of individual key nodes:

$$P(\text{Compromise}) = \sum_{k=m}^{n} \binom{n}{k} p^k (1-p)^{n-k}$$

Where:
* **$n$** is the total number of key shards.
* **$m$** is the quorum threshold.
* **$p$** is the probability of a single node failing or being compromised.

To keep $P(\text{Compromise}) \ll 10^{-6}$, we mandate:
1. **Manufacturer Diversification** — Mix Ledger, Trezor, Keystone, Coldcard.
2. **Geographical Separation** — No two private key shares stored in the same postal code.
3. **Passphrase Offsetting** — Apply custom passphrases to seed words, storing passphrases separately from the seed shards.

---

## 3. Reference Literature

* **Cryptographic Standards** — BIP32 (Hierarchical Deterministic Wallets), BIP39 (Mnemonic sentences), BIP85 (Deterministic key derivation).
* **Custody Frameworks** — Glacier Protocol (Bitcoin cold storage), Gnosis Safe multisig architecture documents.
* **Jurisdictional Law** — Koinly/Cointelegraph tax literature for primary European and offshore jurisdictions.

---

**Built on SIP** — Crypto / House of Sovereignty knowledge · v0.2 · SIP v1.1.1
