# Foundry handoff

Bundled schemas are exact projections of SIS Foundry contracts. Use assets/task-envelope.schema.json, assets/agent-pack.schema.json and assets/skill-pack.schema.json for field names. Drafts do not grant authority. A persistent agent needs at least one operationally explained necessity boundary; otherwise use a Skill Pack. Resolve capability IDs from the actual graph, never invent them.

In an SIS checkout:

```bash
node tools/foundry/cli.mjs graph --out /tmp/starlight-capabilities.json
node tools/foundry/cli.mjs route task-envelope.json
node tools/foundry/cli.mjs forge --envelope task-envelope.json --pack agent-pack.json --out /tmp/starlight-pilot
node tools/foundry/cli.mjs prove /tmp/starlight-pilot
```

Without that runtime, mark route/compile/proof pending-runtime. Pack design, contract validation, compiled artifact, evaluated behavior and deployed agent are separate states. Manual/judge completion tests stay pending until actual evidence exists.
