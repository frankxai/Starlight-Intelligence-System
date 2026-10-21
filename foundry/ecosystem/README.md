# Carry work between Starlight specialists

Build an architecture, edit an edition, review a campaign, or prepare a music session. Keep the useful result and the evidence needed to continue it elsewhere.

This operational adapter packages authorized originals, source revisions, declared project scope, checks and cost observations. It produces a `starlight.memory.v1` projection for the existing Starlight Memory Studio import. It does not change SIP, run an agent, call a provider, grant tools, commit canonical memory or activate a hosted service.

## Try it locally

Prerequisites: Node 22+, a checkout of this source revision, and permission to carry the selected files. No packages or API key are required. From the repository root:

```bash
node --test foundry/ecosystem/handoff.test.mjs
node foundry/ecosystem/handoff.mjs pack foundry/ecosystem/example/scope.json foundry/ecosystem/example/job.json /tmp/starlight-first-handoff
node foundry/ecosystem/handoff.mjs verify foundry/ecosystem/example/scope.json /tmp/starlight-first-handoff/handoff.json
node foundry/ecosystem/handoff.mjs export foundry/ecosystem/example/scope.json /tmp/starlight-first-handoff/handoff.json /tmp/starlight-reopened-handoff
```

Choose fresh output directories. Existing destinations are refused. Copy `example/` into your own workspace before editing it. The example is synthetic and demonstrates the file path, not a successful customer project.

Each directory contains:

| File | Purpose |
| --- | --- |
| `handoff.json` | Full originals as base64, hashes, source/rights metadata, jobs, checks and declared scope |
| `originals/<artifact-id>` | Exact original bytes, recovered under safe identifiers |
| `memory-bundle.json` | Five bounded text files for the existing platform import; original bodies remain in the paired handoff |

Import `memory-bundle.json` into a new Memory Studio workspace, or export your current workspace first. The five-file projection replaces that imported context. Preserve `handoff.json`; the projection is an index, not a backup of the originals. Treat scripts and HTML as untrusted data. The adapter never opens or executes them.

## Join contributions

Use stable job and artifact IDs for a project. Each specialist returns its native output, then wraps the authorized files in a job specification. Give both jobs the same selected `scope.json` and objective. Source host can identify ChatGPT, Claude, Gemini, Grok, GitHub or a local tool when that is the actual source; this requires an authorized export or reader, not access to invisible chat history.

```bash
node foundry/ecosystem/handoff.mjs merge scope.json architecture/handoff.json campaign/handoff.json combined
node foundry/ecosystem/handoff.mjs verify scope.json combined/handoff.json
```

Identical repeated IDs are idempotent. Conflicting IDs, objectives or currencies require resolution. A different project, tenant, brand or environment fails comparison. These fields are declared transport metadata, not authenticated tenant isolation. The receiving service must bind real identity and permissions independently.

The CLI checks original bytes, references, version, duplicate JSON fields, bounds, permitted paths and explicit export permission. It refuses symlink originals and oversized projections. It never silently truncates evidence. The 8 MB JSON bound includes at most 32 originals, each at most 1 MB, totalling at most 4 MB. Split larger media work into scoped handoffs and carry approved storage references separately.

## Improve each specialist

[`capabilities.json`](capabilities.json) defines concrete jobs, native contracts, expected artifacts and review questions for architecture, agent design, plugin release, memory, marketing, creative production, music, Atlas, workflows and coaching. Starlight Spec remains the existing portable requirements skill. The packet format accepts `specification` contributions without creating a new agent.

Load only the specialist needed for the next useful contribution. Deterministic validation comes first. Use a bounded worker for repeatable extraction after measuring its error rate, a stronger reasoner for ambiguous decisions, and independent review for consequential release claims. Model choice does not change tool grants. One parent money/time budget governs the whole job; unknown cost remains unknown.

## Know what a result proves

Integrity verification means the carried bytes match the packet digest. `checks` are producer declarations with original evidence; the verifier does not execute their methods or certify their judgments. A `passed` check must name both subject and evidence originals, but those references are not a substitute for rerunning the check.

The adapter does not measure model quality, useful time saved, conversion, revenue, audio quality or customer learning. Compare the same frozen task with the current workflow and candidate: accepted output, errors, review minutes, elapsed time and observed cost. Keep these separate; report missing data as missing. When merging packets, cost resets to unknown because shared calls and subscriptions may overlap.

Public adoption uses the existing repository's MIT license. Private catalog, personal profiles, credentials and customer evidence do not belong in public examples. This is a local executable adapter. Installation in each assistant, hosted admission, account synchronization, signed release, marketplace publication and customer validation require their own evidence.

Read [the integration and engineering guide](../../docs/guides/starlight-specialist-integration.md) for the platform boundaries and release sequence.

Built on SIP — composes the existing portable file, provenance and human-control practices. This adapter is not a new SIP conformance tier or attestation authority.
