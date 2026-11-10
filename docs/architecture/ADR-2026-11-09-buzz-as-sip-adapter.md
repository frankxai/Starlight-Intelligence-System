# ADR: Buzz is a SIP adapter, not the SIS substrate

Status: Proposed

Date: 2026-11-09

Scope: SIS operational layer, agent identity and attestation transport
Owner: Starlight Architecture
Author: Claude Code (Opus 5.5). Review: pending a non-Claude harness.

## Context

[Buzz](https://github.com/block/buzz) (Block, Apache-2.0) is a workspace where people and AI agents share rooms. It is a Nostr relay: every message, reaction, approval and git event is an event signed by its author's key, and agents are members with their own keypair, channel memberships and audit trail. It bridges Claude Code, Codex and goose over the Agent Client Protocol (ACP), and persona packs follow the Open Plugin Spec with a pack-level `.mcp.json`.

Measured on 2026-11-08 and 2026-11-09 against Buzz desktop 0.7.0-preview.256.1 on Windows:

- The README states "Not finished". The Windows build is unsigned, `buzz auth desktop pair` is macOS/Linux only, and the harness picker listed only Goose until ACP adapters were installed into Buzz's own tools folder.
- Local agents run on the operator's machine with a 60 second session start limit; with about 2 GiB free RAM every goose start timed out.
- One relay is the source of truth: no replication or federation. No end-to-end encryption or SSO was found in the docs read.
- There is no scheduler, budget or retry model; YAML workflows exist but were disabled, and pack hooks are parsed but not executed.

SIS already owns memory (six vaults, `starlight-mcp`), the SIP identity and governance contract, and orchestration through the Queen and Starlight Dispatch. The Starlight Kernel owns acceptance (contract first, maker and grader from different vendors, receipts).

## Decision

SIS treats Buzz as an **adapter behind SIP**, in the same class as Slack: a surface where agents and people work and where actions are signed. Buzz is not a dependency of the SIS substrate.

Buzz may carry:

1. **Agent identity binding.** A SIS agent may hold a Nostr keypair; SIP records the binding between the agent id and its public key. The private key stays in the operator's secret manager, never in a vault or repository.
2. **Attestation transport.** SIS attestations and Kernel receipts may be published as signed events to a Buzz relay as a verifiable log. The SIS vault entry remains the record; the Buzz event is a copy with a pointer back.
3. **Memory access.** Buzz agents mount `starlight-mcp` through a persona pack `.mcp.json` (starlight-kernel `integrations/buzz/starlight-acceptance-team`), so they read and write the same vaults as every other harness.
4. **Human cockpit.** Buzz may serve as the human-facing view of agent work and approvals in place of building a further chat surface in `cockpit/` or `console/`.

Buzz must not carry: SIS memory as source of truth, orchestration or scheduling, acceptance decisions, secrets, or customer data.

## Consequences

- SIS gains portable, signed agent identity and an audit log without building either.
- Replacing Buzz costs one adapter: identity keys and signed events are open Nostr data and survive a move to another relay or client.
- Always-on and multi-tenant agent runtime stays with the hosted runtime (Cloudflare Durable Objects and D1), fan-out with Codex Cloud and the Queen, acceptance with the Kernel.
- Revisit when Buzz ships signed Windows builds, working remote agents, and an SSO or federated identity story; until then the pilot is limited to one community and non-sensitive work.

## Evidence

- Buzz repository README and ARCHITECTURE.md, read 2026-11-08.
- Persona pack: Starlight-Intelligence/starlight-kernel#28 (merged 2026-11-09), SIS memory wiring in #29.
- Strategy and runbook: Frank's doc "Buzz vs Slack: chat layer strategy".
- Session record: frankxai/agentic-ops-hub `ops/sessions/2026-11-09.md`.
