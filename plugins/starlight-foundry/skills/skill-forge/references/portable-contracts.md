# Portable Skill Forge contracts

Use this reference only when the SIS Foundry schemas are unavailable. It fixes the source-contract shape; it does not claim schema validation or runtime proof.

## Task Envelope

Return one object with these fields:

| Field | Required content |
|---|---|
| `schemaVersion`, `id`, `kind` | `1.0.0`, a stable kebab-case id, and `skill` |
| `objective`, `deliverables` | One observable objective; deliverables with `id`, `description`, `artifactType`, and `required` |
| `context` | `vertical`, `audience`, `artifactTypes`, and `references` |
| `stakes` | `impact`, `reversibility`, and rationale |
| `autonomy` | Draft/recommend/execute boundary plus approvals required before external action |
| `constraints` | `must`, `mustNot`, and explicit budget ceilings when known |
| `evidencePolicy` | Freshness, primary-source rule, required evidence lanes, independent-judge minimum |
| `permissions` | Tool allow/deny, memory read/write, external-write and destructive-action booleans |
| `capabilitySelection` | Required, preferred, forbidden, and whether creation is allowed |
| `tasteProfile` | Profile id or `null` |
| `completionTests` | Id, lane, type, required flag, and test-specific path/value/instructions |
| `deployment.targets` | Only surfaces the operator actually requested |

## Skill Pack

Return one object with `schemaVersion`, `kind: skill`, `id`, semantic `version`, and `description`, followed by:

- `triggers.positive` and `triggers.negative`;
- ordered `procedure` entries with `id`, `instruction`, and `proof`;
- `inputs`, `outputs`, and existing `dependencies`;
- `toolPolicy.allow` and `toolPolicy.deny`;
- `memoryContract.read` and `memoryContract.write`;
- `tasteProfile` id or `null`;
- `deployment.implicitInvocation` and requested `deployment.targets`.

Keep `id` identical across the envelope and pack. In portable mode return a proposed `SKILL.md` and `runtimeStatus: pending-runtime`; never add a compiled path or Evidence Receipt.
