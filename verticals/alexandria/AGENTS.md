# AGENTS — Alexandria voice and House mappings

> Maps the SIP voice archetypes (`VOICES.md`) to the six House agents and names the runtime each House runs on. Voice is a posture; runtime is a routing-table row (`SWARM.md`).

## Voice mappings

| Voice | Held by | Why here |
|---|---|---|
| **architect** | Frank — primary; Synthesis House | Decision-first briefs; contracts before calls; no hedging the receipt supports |
| **sovereign-creator** | Frank — README, briefs, public surfaces | The vertical is forkable; briefs are catalogue, not singles |
| **protocol-defender** | Frank — receipts, attestation, Exchange terms | Earned attestation, signed receipts, provider terms honoured |
| **implementer** | Frank + sub-agents (code-reviewer, design-verifier) | `src/alexandria/`, tests, catalogue PRs |
| **overseer** | Starlight Board (advisory) | `/starlight-board` on substrate-touching changes; record at `docs/boards/2026-10-08-starlight-alexandria.md` |

## House agents

| House | Agent card | Runtime | Status |
|---|---|---|---|
| Library | `houses/library/agent.md` | no model (deterministic) + OpenRouter for tagging | v0.1 |
| Scribe | `houses/scribe/agent.md` | Gemini (long context) | v0.1 card |
| Synthesis | `houses/synthesis/agent.md` | Claude managed agents | v0.1 card; Queen |
| Exchange | `houses/exchange/agent.md` | OpenAI Responses (handlers), no model for billing | v0.1 card |
| Forge | `houses/forge/agent.md` | no model for status; any for bakeoffs | v0.1 card |
| Treasury | `houses/treasury/agent.md` | Claude | v0.1 card |

Each card has a fixed shape: Role / Reads / Writes / Commands / Refusals / Receipts it must leave.

**Built on SIP** · `alexandria@v0.1`
