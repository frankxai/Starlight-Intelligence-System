# starlight-estate-os — Thin Reusable Profile / Template for Sovereign Intelligence Estates (per 2026-06-16 Starlight Board PROCEED-WITH-REVISE R2)

**Status:** Thin composition profile (not a new standalone repo). Documented here as the reusable 80% scaffold for Estate / Agent Army commissions. Fork per client or compose under their sovereign instance. See board verdict `docs/boards/2026-06-16-estate-factory-web4-positioning-verdict.md` (R2 deadline 2026-06-19).

**Purpose:** The "starlight-estate-os" is the maintained, thin, reusable estate scaffold/profile. It composes existing canonical pieces so that each new commissioned estate (Mind + production Mesh/agent army + Steward) starts with the 80% already wired, leaving only the thin tuned 20% (client data, specific vaults, brand voice, fleet config, SOW-tuned contracts) for the engagement.

**Core principle (from SIP + Estate Factory + board):** If it isn't theirs specifically, it belongs in the profile/template, not the estate. Every time you build a per-client thing that wasn't theirs specifically, promote it up.

## What this profile includes (composition of existing canon)

It is a *documented composition*, not a copy-paste of everything. The estate inherits by reference + local overrides where needed.

**File contract (SIP Layer 1)**
- README.md (positioning, ICP, status, synthesis edge)
- SIP.md (reference or symlink to starlightintelligence.org/protocol)
- SIS-instance.md (this estate's substrate map + operational choices)
- SKILL.md (sovereign behavior + estate invariants)
- AGENTS.md (named agents — inherit base council + Hermes + domain specialists; map voices per VOICES.md + client persona)
- MEMORY.md (cycle 0 + roadmap + commitments; private state in private/)
- SOUL.md (the essence that must not drift — seeded from client's Genius Profile)
- CANON.md (explicit posture: import/ create/ decline; Arcanea CC-BY-NC if used)
- STACK.md (inherited 10-IS + overrides; composition layer rules)
- VOICES.md (inherited or extended)
- ATTESTATIONS.md (append-only ledger)
- .claude/commands/ (mirrored protocol/alliance/vertical + sovereign-tier stubs + estate-specific)

**Base 10-IS + Orchestrator (from STACK.md + ARCHITECTURE.md)**
- Self/Genius (wired to /discover-genius + Freedom Path if available)
- Second Brain (vaults + capture + distill)
- Brand (voice kit)
- Business, Creator, Wealth, Code, Voice & Video, Family
- Starlight Orchestrator as master router

**Production Mesh / Agent Army primitives (the big pull)**
- ORCHESTRATION_ENGINE patterns (6 patterns + swarm consensus + fault tolerance + self-learning)
- /si + cli-tool-router (multi-CLI routing with context preservation, handoff packets, receipts; lanes for Claude/Codex/Gemini/Antigravity/Grok/OpenCode/Cursor)
- Core council + Hermes (retrieval/synthesis/provenance) + domain specialists (from modules)
- Claws (bootstrap, architect, sentinel, attestation, reclamation, openclaw) — full production ops surface
- Memory Bus + 6 sovereign vaults + Veil sanitization + temporal half-life + contradiction detection + dreaming
- Yolo / Hive conductor for aggressive autonomy sessions (with exit/abort)
- Voice Operator integration hooks
- Attestation ambient + explicit (/sip-attest on all serious outputs)
- Governance hooks (board pre-pass for major topology/kernel moves)

**Module scaffolds (from verticals/_template/ + templates/domain-stack-starter/ + templates/vertical-starter/)**
- Drop-in for any domain sub-stack (4-7 functional sub-systems per /spawn-domain-stack pattern)
- Pre-wired agent.md / skill.md / knowledge / commands per sub-system
- Composition layer rules for cross-domain artifacts

**Naming / Persona profiles (from NAMING.md + VOICES.md + existing skins)**
- plain / pantheon/custom / luminor (with CC-BY-NC gate) / chess / custom
- Wired into AGENTS.md, SKILL.md, SOUL.md, voice guides

**Protections & sovereignty (non-negotiable)**
- private/ (gitignored)
- Encoded-self boundary enforcement notes (SIP §5.7)
- Client owns tuned estate / data / custom agents / running instance
- Starlight owns generalized process + any IP promoted back
- Full export instructions

**Steward / Run-phase primitives**
- Runbooks + operator playbooks template (client voice where possible)
- Health / drift detection / evals hooks (Proving Ground / Model Arena patterns)
- Promotion loop commitments (/sis-forge ready)

## How to use for a new estate (composition, not fork of this README)

1. Start from client's sovereign instance (via /sovereign-spawn or existing verticals) or fresh dir.
2. Copy or reference this profile's structure.
3. Run the 4-layer blueprint process (see estate-blueprint command/stub when R3 lands).
4. Override only the tuned 20%: specific data, vaults content, brand voice files, fleet config, SOW contracts, custom modules.
5. Wire the rest by reference (e.g. "orchestrator: inherits starlight/orchestration-engine vX", "claws: inherits starlight/claws", "memory-bus: inherits starlight/memory").
6. Add estate-specific sovereign-tier commands under .claude/commands/.
7. Register appropriately (VERTICALS.md or client's registry).
8. /sip-attest the blueprint and first scaffold artifacts.

**No new standalone repo** until the profile is proven on 1-2 estates and the board gates (R2) are satisfied. This lives here as the canonical reference composition.

## Promotion loop (factory economics)

After every estate that ships:
- Run /sis-forge or manual audit on the tuned artifacts.
- Extract anything that generalized (new module scaffold, improved harness config, better runbook pattern, topology template, etc.).
- Promote back into this profile, core/orchestrator, claws, templates/, or docs/delivery/.
- Update the reusable catalog seed (per board R1).

This is how estate #2 takes a fraction of the effort and marginal cost approaches the pure margin the proposal described.

## Current composition sources (as of 2026-06-16, post board verdict)

- File contract + sovereignty: SIP.md, CANON.md, VOICES.md, NAMING.md
- 10-IS + Orchestrator: STACK.md, ARCHITECTURE.md
- Swarm / Mesh execution: core/ORCHESTRATION_ENGINE.md, skills/orchestration/cli-tool-router.md (the /si command), .antigravity/swarm-protocol.md (recent work), yolo*.md commands
- Production ops: claws/ (all), agents/ (council + Hermes + domain examples)
- Memory: memory/ structure + public-vault + Memory Bus patterns
- Scaffolds: templates/vertical-starter/, templates/domain-stack-starter/, verticals/_template/
- Genius grounding: genius/ + /discover-genius + /spawn-domain-stack patterns
- Attestation + governance: /sip-attest family, /starlight-board prompt + verdicts
- Existing delivery surface: ONBOARDING.md, DELIVERY.md (now includes §7 estate lane), SESSION_RUNBOOK.md

See the full strategy `docs/strategic/sip-web4-substrate-strategy.md` and workflow `docs/delivery/estate-army-commissioning-workflow.md` and board verdict for context.

**Built on SIP** — Starlight Intelligence Protocol v1.1.1

This profile exists so that the hard, expensive part (the substrate + production swarm patterns + Genius-grounded process) is built once and consumed by every estate. The client adds only what is uniquely theirs. 

(Per 2026-06-16 Starlight Board PROCEED-WITH-REVISE — R2 binding before client use or public claims.)