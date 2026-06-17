# Starlight Substrate Skill & Orchestration Guide

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

## Skill Structure & Mechanics

SIS decouples behavioral constraints and domains into **peer-level skills**. Every skill is defined by a markdown file and registered inside the central rules config:

1. **Skill Definition (`skills/<domain>/<skill-name>.md`)**: Contains YAML frontmatter (name, description) and markdown guidelines constraining agent behaviour or detailing domain schemas.
2. **Skill Triggers (`skills/skill-rules.json`)**: Configures the rules triggering specific skills. Rules are matching patterns over keywords, modified file globs, or active agent types.

### Example Activation Rule Schema
Inside `skills/skill-rules.json`, rules are configured as follows:
```json
{
  "id": "memory-management-trigger",
  "skill": "memory/vault-management",
  "triggers": {
    "keywords": ["vault", "memo", "remember"],
    "files": ["memory/vaults/**", "*.jsonl"]
  }
}
```

### Process for Adding and Testing Skills
1. **Author the Markdown file**: Write the skill parameters in `skills/<domain>/<skill-name>.md`.
2. **Add the Rule**: Register the trigger conditions under `skills/skill-rules.json`.
3. **Register the Skill**: Append the skill entry to [SKILL_REGISTRY.md](file:///C:/Users/frank/Starlight-Intelligence-System/skills/SKILL_REGISTRY.md) with date version and status (`stable` or `experimental`).
4. **Run Verification**: Execute the unit-test validator:
   ```bash
   node --import tsx --test test/v77-skill-rules.test.ts
   ```
   This checks for file-registry symmetry (no broken links or phantoms).

## Invariants
1. Every artifact shipped at the substrate carries SIP attestation.
2. Canon is never silently imported. Attribution is explicit.
3. Sovereignty clause (SIP § 5) is not waivable.
4. Open boundary is permanent — MIT for spec, MIT for reference commands, CC-BY-NC for canon.
5. "Built on SIP" means *real* composition. Never a decorative badge.
6. **Declared file loads must be test-asserted to exist.** Every command in `.claude/commands/` that declares hard file loads in its body must have a corresponding assertion in `test/substrate.test.ts` that those files exist on disk.
7. **SAGE Goal Verification Invariant**: Any long-running autonomous loop (/goal) must use the starlight goal checklist, auto-checkpointing, and run the Sentinel audit. The loop refuses to mark completion (<!-- GOAL_COMPLETE -->) without the cryptographic approval tag LGTM-SIS.

## When to say no
- When someone asks to fold a sovereign node into the substrate.
- When someone asks to close a layer that is open by spec.
- When an artifact is claimed as "Built on SIP" without real protocol use.
- When a fork is framed as consensus-seeking rather than decision-forcing.

## Primary commands
`/sip-attest` · `/alliance-forge` · `/alliance-reflect` · `/alliance-decide` · `/vertical-spawn` · `/luminor-board` · `starlight goal init` · `starlight goal status` · `starlight goal compress` · `starlight goal audit` · `starlight goal rollback`

## Writeback
Every substrate-level change updates `MEMORY.md` Changelog section with version + date + one-line summary.

---
**Built on SIP** · Skill Orchestration Spec v1.1 · 2026-06-16

