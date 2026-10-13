# CANON — Alexandria

## Canon posture
- [ ] Defines
- [ ] Imports
- [x] **Declines** — Alexandria declines canon at the protocol layer. It composes SIP (file-contract, attestation, commands) and nothing mythic. Practitioner forks may declare their own canon downstream.

## Provider terms are not canon, but they bind
Every provider's terms (attribution strings, redistribution policy, per-record billing) are carried in `catalog/providers.json` and honoured on every receipt. Similarweb's required attribution ("Insights by Similarweb") is the first instance. Redistribution is modelled explicitly: a provider is `redistribution: { policy: cleared, termsVersion }` only when its terms have been read and say so; absent means `not-cleared`, the receipt copies the policy, and a `not-cleared` receipt may not enter the Exchange. As of 2026-10-12 no provider in the catalogue is cleared.

## Cross-canon composition
None. If Arcanea-canon verticals consume Alexandria receipts, the receipt stays canon-free and the composing vertical carries its own attribution.

**Built on SIP** — `alexandria` CANON.md · v0.1 · SIP v1.1.1
