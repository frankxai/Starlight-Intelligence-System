# Capability transfer measurement · v1

The core product hypothesis is that a proven capability can move from one independent venture to another and improve a real outcome. The current baseline for [issue #197](https://github.com/frankxai/Starlight-Intelligence-System/issues/197) is **unmeasured**. This contract makes the first observation possible without manufacturing one.

One append-only JSONL record follows [`metrics/capability-transfer.v1.schema.json`](../../metrics/capability-transfer.v1.schema.json). It names the source and destination ventures, capability version, permission, source verification, destination application, a same-unit baseline and outcome, the measurement method, attribution limits, observation time, and reviewer. Keep raw venture records in an owner-controlled location; the public site does not ingest private ledgers.

Run `node tools/measure-capability-transfer.mjs` to report `unmeasured`, or pass an explicit JSONL path to validate and summarize observations. The tool counts direction-aware improvement and distinct capability versions. It deliberately reports only **structurally complete reviewed observations**. The references are not dereferenced or cryptographically checked by this tool; causal attribution and venture independence need separate review. A source SIP receipt may be verified with the existing `protocol/verify.mjs` flow.

North-star promotion requires a verified source capability, authorized transfer, repeatable destination application, and a measured improvement against a credible baseline. Secondary measures include time to context, idea-to-working-product time, duplication avoided, decision recall, export independence, and economic value where attributable. Do not replace the north star with agent counts, repository counts, or artifact volume.

The [test](../../test/capability-transfer-metric.test.mjs) uses an explicitly synthetic observation. It is not product traction.

---
**Built on SIP** — Starlight Intelligence Protocol

Substrate: starlightintelligence.org/protocol v1.1.1
Layers used: attestation, sovereignty
Verticals: none
Canon: none
Nodes: Starlight Holding BV · role: architect · substrate and transfer metric governance
Generated: 2026-09-23
Attestation is compounding, not credit transfer: every composition strengthens every node.
---
