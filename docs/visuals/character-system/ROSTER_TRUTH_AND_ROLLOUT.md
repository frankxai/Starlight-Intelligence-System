# Roster truth and character rollout

**Status:** operational contract · **Date:** 2026-08-27 · **Owner:** Starlight Character Foundry v2

**Rule:** identity is compiled from runtime truth; an illustration never grants an agent capability, rank, or authority.

## Decision

Starlight currently has three useful but non-interchangeable rosters:

| Layer | Current count | Source | What it controls |
|---|---:|---|---|
| Runtime profiles | **144** | [`agents/`](../../../agents/) plus [`AGENT_REGISTRY.md`](../../../agents/AGENT_REGISTRY.md) | agent identity, tier, domain, voice, permissions, and operating behavior |
| Portfolio blueprint | **150 seats** | [`docs/AGENT_BLUEPRINT.md`](../../AGENT_BLUEPRINT.md) | target topology and planned portfolio coverage |
| Public visual personas | **50 personas / 150 mode prompts** | `starlight-intelligence-web/data/agent-visual-prompt-pack.v1.json` | an earlier audience-facing visual taxonomy only |

They must not be joined by name guessing. The 144 runtime profiles remain authoritative. The 150-seat blueprint is a planning instrument. The 50-persona set is a candidate facade layer that requires explicit crosswalk and reapproval under the 2026-08-17 identity reset.

## Verified baseline

- `node scripts/validate-agents.mjs` reports **144 conforming profiles**: 137 top-level profiles and seven council profiles.
- All 144 profiles carry the required `name`, `tier`, `domain`, and `voice` frontmatter.
- The 150-seat blueprint does not currently equal the runtime roster: the audit found 17 references without matching runtime profiles and 12 real profiles omitted from the blueprint.
- The current site estate contains roughly 95 Queen-led visual assets, but no complete named 144-agent portrait or model-sheet library.
- The existing public 50-persona prompt pack has strong mode and proof mechanics, but its robot, constellation, black-glass, cyan, and gold defaults predate the active foundation reset.
- `docs/visuals/VISUALS.md` records useful history, but several manifest names no longer resolve to the files now present and its transient generation paths are not a canonical asset registry.

These are evidence statements, not a request to delete legacy work. Existing assets stay preserved until an approved replacement and migration receipt exist.

## Authority chain

```text
runtime profile
    -> visual contract v2
        -> approved character version
            -> public facade mapping
                -> generated modes and assets
                    -> immutable review receipt
```

The arrow never reverses. A public persona can make a runtime function legible, but it cannot create new powers or silently combine incompatible agents.

Every crosswalk row uses one of these states:

| State | Meaning | Release consequence |
|---|---|---|
| `one-to-one` | one public identity represents one runtime profile | eligible after full Foundry review |
| `facade-for-many` | one public identity fronts a named, compatible set of profiles | requires explicit routing and disclosure |
| `candidate` | a proposed mapping without sufficient evidence or owner approval | exploration only |
| `unmapped` | runtime profile has no public identity yet | no generation fanout |
| `deprecated` | prior public identity is retained only for provenance | cannot receive new production assets |

Required crosswalk fields:

```yaml
public_persona_id: <required>
runtime_profile_ids: [<one-or-more-required>]
mapping_state: one-to-one | facade-for-many | candidate | unmapped | deprecated
runtime_authority: agents/<profile>.md
visual_contract: docs/visuals/character-system/contracts/<profile>.v2.yaml
representation_territory: <founder-approved-territory-id>
decision_owner: <required>
approved_at: <required-for-release>
supersedes: <optional>
notes: <scope-and-routing-boundaries>
```

## G0 roster-reconciliation SOP

No mass character generation starts before G0 passes.

1. Enumerate the 144 runtime profiles directly from `agents/**/*.md`, excluding registry documents.
2. Assign each an immutable `runtime_profile_id` derived from its path, not its display name.
3. Parse mission, tier, domain, voice, inputs, outputs, human gate, and handoffs into a draft visual contract.
4. Compare the 150 blueprint seats against the runtime IDs and label every mismatch `planned`, `renamed`, `merged`, `retired`, or `unresolved`.
5. Import the 50 public personas as `candidate`; do not auto-approve string-similar names.
6. Resolve duplicate or ambiguous roles, especially **Orchestrator versus Queen** and **Starlight Sage versus council Sage**.
7. Have the runtime/domain owner confirm the operational reading.
8. Have the founder approve the representation territory and the public mapping.
9. Freeze the crosswalk as a versioned manifest with reviewer and timestamp.
10. Permit only the approved North Star cohort into G1–G10 of the Foundry.

## North Star cohort: 13 key identities

The first cohort is deliberately small enough to discover the visual grammar before multiplying it across 144 profiles. Each concept begins with an operating tension and an exclusive instrument, not a costume trope.

| Identity | Mission made visible | Operating tension | Exclusive instrument | Human stop / visible limit |
|---|---|---|---|---|
| Orchestrator / Queen | coordinate multi-step work across agents | decisive routing without sovereign control | reversible routing table with bounded channels | stops at founder, policy, and domain-owner decisions |
| Prime | synthesize disagreement into one accountable answer | unity without erasing dissent | convergence press that retains every source thread | cannot silently turn consensus into authority |
| Architect | define systems, interfaces, and load-bearing boundaries | ambition versus operability | sectional frame with explicit load paths | cannot approve product values or business intent |
| Navigator | make trade-offs, sequence, and optionality legible | direction without taking sovereignty | decision landscape with time bands and reversible forks | does not choose the user's values |
| Sentinel | expose risk, evidence, and rollback paths | protective without becoming alarmist | transparent inspection gate with before/after planes | no offensive action and no irreversible move without authority |
| Weaver | preserve strands while creating a coherent synthesis | coherence without swallowing authorship | provenance loom with source strands still visible | creator owns voice and release |
| Starlight Sage | turn durable lessons into teachable patterns | wisdom without command | layered folio: principle, pattern, practice, example | offers counsel; does not decide |
| Hermes | retrieve quickly while preserving source and uncertainty | speed versus evidentiary integrity | source index with an intact trace chain | read-oriented; no silent merge or mutation |
| Concierge | welcome, clarify, and open one useful route | warmth versus decisive closure | intake folio with one active route window | stops before decomposition or council orchestration |
| Envoy | translate creator intent into a handoff-ready artifact | assistance without voice overwrite | editorial press with the creator layer exposed | creator approves final voice and publication |
| Voice Operator | capture live intent and produce a safe packet | conversational speed versus operational risk | acoustic packet loom with seven intent grooves | stops before deep synthesis or substrate edits |
| Genius | excavate patterns from the user's own corpus | revelation without fabrication | stratigraphic corpus lens | no invented profile and no private evidence leakage |
| Evaluator | test claims against criteria and falsifiers | honest measurement versus score theatre | calibrated comparison bench with an explicit falsifier | measures and recommends; never ratifies its own work |

`Orchestrator / Queen` is intentionally one unresolved row. “Queen” is currently a prominent visual and operating metaphor, while `agents/starlight-orchestrator.md` is the named runtime profile. G0 must decide whether Queen is that profile's public facade, a separate future profile, or a deprecated legacy identity.

## Rollout waves

| Wave | Scope | Purpose | Entry condition | Exit condition |
|---|---:|---|---|---|
| 0 — Truth | 144 + 150 + 50 reconciliation | stop roster drift | verified sources readable | versioned crosswalk approved |
| 1 — North Stars | 13 identities | prove house grammar and divergence | representation territory approved | 13 model sheets; zero hard failures; independent review |
| 2 — Frontline | 35 identities | cover frequent public workflows | Wave 1 comprehension test passes | mapped set reaches release threshold |
| 3 — Specialists | 72 identities | extend the grammar across domains | domain mini-grammars approved | cohort collision and accessibility tests pass |
| 4 — Backstage | 24 identities | complete operational coverage | runtime need demonstrated | all 144 profiles mapped or explicitly non-public |

The totals refer to runtime profiles: 13 + 35 + 72 + 24 = 144. A single public facade may represent more than one runtime profile only when routing remains explicit; therefore the number of public character faces may be lower than 144.

## Migration rules for existing assets

1. Inventory every current asset with a stable repository path, checksum, owner, source method, and rights/provenance state.
2. Attach each asset to a mapped public persona and approved character version, or mark it `legacy-unmapped`.
3. Test legacy assets against the active territory, silhouette, collision, accessibility, and anti-imitation gates.
4. Never recolor an obsolete concept and call it migrated; re-derive it from function when the visual thesis changed.
5. Preserve approved history. Supersede with a new version and receipt; do not rewrite prior receipts.
6. Replace a published asset only when its dependent pages, alt text, crops, and share cards are ready in the same release packet.

## Release ledger minimum

Each shipped character version records:

- runtime profile ID and public persona ID;
- representation territory and founder decision;
- semantic brief and exclusive instrument;
- model-sheet and story-strip paths;
- all delivery modes and crops;
- prompt/compiler version and source method;
- source references, authorship, licenses, and cultural review where relevant;
- accessibility and comprehension test evidence;
- independent critic identity, score, hard-failure results, and verdict;
- superseded version and rollback path.

## Current operational call

**Fix-first.** The portfolio already contains enough useful characters and visual experiments to preserve, but it does not yet have one authoritative roster-to-visual contract. Complete G0, approve one representation territory, and prove the 13 North Stars before generating the remaining modes or the full roster.

- Companion contract: [`STARLIGHT_CHARACTER_FOUNDRY_V2.md`](./STARLIGHT_CHARACTER_FOUNDRY_V2.md)
- Research basis: [`MARVEL_VISUAL_METHOD_RESEARCH.md`](./MARVEL_VISUAL_METHOD_RESEARCH.md)
- Visual contract template: [`templates/agent-visual-contract.v2.yaml`](./templates/agent-visual-contract.v2.yaml)
- Review receipt: [`templates/character-review-receipt.v2.yaml`](./templates/character-review-receipt.v2.yaml)
