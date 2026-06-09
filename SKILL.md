---
name: starlight
description: Load when working at the Starlight substrate layer — authoring SIP, forging alliances, spawning verticals, or generating SIP-compliant attestations. Not for vertical-specific work (use the vertical's SKILL.md).
---

# Starlight substrate skill

## Premise
You are operating at the substrate layer. Decisions here propagate across every vertical and every alliance built on SIP. Move with the gravity that implies.

## Always load alongside this skill
- `SIP.md` — the canonical protocol.
- `SIS.md` — the substrate map.
- `VERTICALS.md` — current vertical registry.
- `VOICES.md` — canonical voices (5 archetypes; this repo's `agents/` directory holds the operational-layer named agents).
- `MEMORY.md` — current state.
- `ALLIANCE.md` — only when alliance work is in scope.
- `STACK.md` — only when stack guidance is in scope.

## Voice at this layer
- Architect voice is primary.
- Compressed, first-principles, decision-first.
- Normative over descriptive. No hedging when structurally avoidable.
- No consulting tone. No facilitation.
- When uncertain, name the uncertainty as a structural fork, not a caveat.

## Invariants
1. Every artifact shipped at the substrate carries SIP attestation.
2. Canon is never silently imported. Attribution is explicit.
3. Sovereignty clause (SIP § 5) is not waivable.
4. Open boundary is permanent — MIT for spec, MIT for reference commands, CC-BY-NC for canon.
5. "Built on SIP" means *real* composition. Never a decorative badge.
6. **Declared file loads must be test-asserted to exist.** Every command in `.claude/commands/` that declares hard file loads in its body (the `Load \`X\`, \`Y\`, ...` opening line is the canonical shape) must have a corresponding assertion in `test/substrate.test.ts` that those files exist on disk. Conditional loads ("if present", "if it exists", "if available") are exempt — they are by-design optional. Path placeholders (literal `<slug>`, `<person-slug>`, `<vertical-slug>`, `<target>`, `<artifact-path>`, etc.) are exempt — they are template substitutions, not real paths. External absolute paths (e.g., `C:\…\Arcanea\…`) are exempt — they reference other sovereign repos. Pattern repeated three times in the v7.4–v7.5 cycle (`/compose-stack`, `/spawn-domain-stack`, `verticals/_template/.claude/commands/`); structural enforcement prevents the fourth. Enforced by the `Substrate rule — declared file loads exist on disk` describe block in `test/substrate.test.ts`.

## When to say no
- When someone asks to fold a sovereign node into the substrate.
- When someone asks to close a layer that is open by spec.
- When an artifact is claimed as "Built on SIP" without real protocol use.
- When a fork is framed as consensus-seeking rather than decision-forcing.

## Primary commands
`/sip-attest` · `/alliance-forge` · `/alliance-reflect` · `/alliance-decide` · `/vertical-spawn` · `/luminor-board`

## Writeback
Every substrate-level change updates `MEMORY.md` Changelog section with version + date + one-line summary.
