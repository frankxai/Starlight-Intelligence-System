# Portable System Forge contracts

Use this reference when the SIS schemas are unavailable. It fixes the design fields but does not validate or deploy the system.

Start with a Task Envelope containing the standard identity, objective, deliverables, context, stakes, autonomy, constraints, evidence, permissions, selected capabilities, completion tests, and requested deployment targets. Set `kind` to `swarm`, `vertical`, or `plugin` and keep the pack id identical.

## Swarm Pack

Include `schemaVersion`, `kind`, `id`, `version`, `description`, `topology`, distinct `roles` (id, capabilities, decision rights, outputs), `sharedState` (schema and write policy), `conflictResolution` (owner and method), `termination` (success, stop, max rounds), and `deployment.targets`.

## Vertical Pack

Include `schemaVersion`, `kind`, `id`, `version`, lifecycle `status`, `description`, audiences, domain constraints, ontology, canonical-source policy, user jobs, artifact taxonomy, selected capabilities, taste profile, irreversible/approval risk policy, required evaluation lanes/pass rate, and deployment targets.

## Plugin Pack

Include `schemaVersion`, `kind`, `id`, `version`, `description`, display name, publisher name/homepage/repository/license, existing skills, authentication mode, optional real production MCP URL, and deployment targets. Never put a planned endpoint into the pack.

In portable mode return the topology and chosen pack with `runtimeStatus: pending-runtime`. Do not claim emitted host manifests, installation, orchestration, deployment, or an Evidence Receipt.
