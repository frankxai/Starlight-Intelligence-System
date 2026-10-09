# Agent platform beta — experience blueprint v0.1

Principles: evidence before spectacle, one clear next action, honest states, no hidden spend or autonomy. The developer-facing CLI is the first interface; Command Center is a later operator view, not a prerequisite. Built on SIP.

| Stage | Human | AI/agents | System of record | Failure/recovery |
| --- | --- | --- | --- | --- |
| Discover | Run `team doctor`; inspect host verdict | None | Public source and local host probe | Missing capability is named; no guessed install |
| Preview | Run `team plan` and inspect files, gates, verifier and zero-spend fixture | Foundry compiles one candidate; no execution | Source hash and deterministic plan | Ambiguous agent or policy mismatch refuses |
| Install | Explicitly approve a repository-scoped projection | None | Local install manifest with before/after hashes | Collision or interrupted write halts; rollback only owned bytes |
| Verify | Run the no-spend fixture; inspect receipt | Separate deterministic checker | Fixture receipt | Failure shows cause and recovery command, not “installed = working” |
| Handoff | Commit reviewed projection if cloud use is desired | Host loads only available committed files | Git commit + host session receipt | Cloud missing/unsupported tool is a hold, not silent parity |
| Operate | Approve gated actions in the host at action time | Maker runs within host grant; verifier checks independently | Host run and verification receipts | Denial, timeout, or interruption stays recoverable and auditable |

For future UI: status labels are `available`, `planned`, `installed`, `fixture verified`, `host exercised`, and `active`; the primary action is context-specific. Keyboard access, visible focus, touch targets, reduced motion, high contrast, interrupted transitions, and honest empty/error states are acceptance gates. Animation may clarify state but never delays a repeated keyboard action or conceals approval. Actual visual/device verification is pending implementation, not claimed here.
