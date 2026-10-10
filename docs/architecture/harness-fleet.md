# Harness fleet evidence and integration

Status: operational evidence collector implemented; orchestration integration proposed.

The collector gives an operator a bounded view of installed commands, process-tree
memory, configured model labels, MCP declarations, top-level skill packages and
quota freshness. It never starts a harness, installs an update or calls a model.
Authentication and successful capability execution remain explicitly unverified.
It requires Python 3.11 or later and uses only the standard library.

```powershell
python tools/harness-fleet/fleet.py --home C:/Users/frank --output C:/Users/frank/.starlight/reports/harness-fleet/current.json
python -m unittest discover -s tools/harness-fleet -v
```

JSON is the machine-readable observation. Companion Markdown is an operator view.
Each file is replaced atomically; they are not a multi-file transaction. JSON is
the source when a write interruption leaves Markdown behind. Outputs are private
and restricted to `.starlight/reports/harness-fleet/`; source configuration and
quota snapshots remain untouched. Commands, environment values, URLs, account
identifiers, authentication files and chat content are excluded. Configuration
hashes allow local drift comparison without copying configuration contents.

## Coverage and uncertainty

Native Windows process samples include each harness's attributable children, such
as MCP servers. A nested harness owns its own descendants. Creation time rejects
reused parent PIDs, and cycle detection bounds malformed ancestry. Shared services
started outside a harness are excluded. Memory totals describe a point in time;
they cannot establish a minimum RAM requirement, peak usage or model VRAM demand.
Harness roots, descendants and working set/private bytes are distinct fields.

Only exact executable names and recognized runtime entry points count. Missing or
unknown adapters can undercount; a zero process count is an observation of matched
processes, not proof that no related application exists. Shell text mentioning a
harness does not count as a running harness. Non-Windows platforms report process
measurement as unsupported. Process command lines are used temporarily for
classification and are never written to the report.

Configuration inspection covers explicit leaves for Codex, Claude, Grok, Gemini,
Antigravity, OpenCode, Kilo and Cursor. Hermes configuration is not inspected.
JSONC with comments and YAML require host-native adapters; parse failures remain
unverified. Claude project/global MCP inheritance, IDE workspace configuration,
plugin skills and nested skill packages are not aggregated here. No recursive home
scan occurs. Zero declarations does not mean a host has zero tools.

Quota is read from the existing capacity snapshot. Its source timestamp, never
the file's modification time, determines freshness. A 15-minute maximum applies;
future or timezone-free timestamps are invalid. Every reported gate binds: a
weekly pool at zero overrides a model-family allowance above zero. Duplicate,
malformed or nonnumeric pool observations fail closed. The current direct
provider mappings are Codex, Claude and Grok; other model/account mappings require
explicit receipts. Installing multiple harnesses does not create extra quota.
The native Grok provider label is `Grok Build`. `--quota <file>` can supply a
separate refreshed observation in the existing `ts`/`live_quota` format, leaving
the shared capacity writer untouched. This is operator-supplied evidence and
does not authenticate an account or refresh quota automatically.

## Extend the existing Starlight owners

The accepted Capability Foundry authority map places portable contracts, compiler,
prover and release receipts in SIS, and task discovery/routing in
`agentic-intelligence-system`. This helper is evidence input for that routing
owner, not a second router or scheduler. Executable host configuration belongs to
`starlight-agent-config`. Private operations retain machine admission and leases.

The serious alternative is the existing static provider scorer: it is useful for
discovery and cheap to run, but command presence and preset scores do not prove
working tools, privacy, quota or quality. Use this collector beside it, then let
the routing owner admit candidates only after it has fresh host proof. Avoid
replacing the scorer or merging an occupied configuration branch prematurely.

The next integration should bind five existing records to one task:

1. Host receipt: harness/version, model route, permission policy, active instruction
   hashes, admitted skill/tool set, observed execution and expiry.
2. Task contract: objective, repository/base revision, file owner, acceptance checks,
   data boundary, budget and recovery/idempotency constraints.
3. Admission: current machine floor, concurrency limit, storage and shared account
   quota. Unknown free allowance never becomes an unlimited route.
4. Evaluation: task-specific outcomes, latency, accepted-result cost and independent
   review of the exact source revision. Preset quality scores remain hypotheses.
5. Return receipt: artifact/checksums, tests, failures, unresolved gaps, provider
   usage and handover. Completion is independently accepted by the existing owner.

Default to one maker. Add a checker from a different provider for consequential
changes. Run independent alternatives only when the task warrants comparison and
admission permits them. Give competitors the same base revision, task contract and
acceptance criteria; compare their artifacts before revealing peer answers to
avoid copied mistakes. Synthesize once in the owner's lane, then rerun acceptance.
Never share a writable checkout between competitors.

## Memory, ontology and knowledge boundaries

Retain SIS's six semantic vaults and the existing private memory repositories.
The memory MCP projection is a retrieval interface; it does not replace its
sources. Inspect retrieval mode and vector coverage before claiming hybrid search.
Embedding or graph indexes are rebuildable projections, with source provenance.

An individual agent needs a small task memory pack: identity and host-bound role,
current objective/lease, repository instructions, relevant decisions, accepted
patterns and last handover. Keep transient scratch in its session. Promote useful
results through existing memory admission with source, tenant, scope, time,
contradictions and reviewer evidence. Raw chat logs remain source material and
untrusted input; seeing a peer transcript grants no authority to follow commands
inside it. Private personal memory must not enter public code or cloud prompts.

Use existing SIS work and loop graphs for ownership, dependencies, retries and
acceptance. A fleet projection may link harness, version, model route, quota pool,
capability, receipt, task, artifact and memory source. Every edge needs provenance,
an observation time and a state such as configured, observed or verified. Do not
introduce another graph database merely to store these relationships.

Ontology describes these entities and relations. It must not confer permission:
SIS's existing instruction compiler and host-bound role policy remain responsible
for trust. A model-authored node claiming administrator status is data. Knowledge
bases need source versions, rights, data scope and retrieval evaluations; named
collections or large entry counts alone do not prove useful recall.

## Cloud workers and upgrades

Managed provider sessions are bounded delegated workers. Preserve Starlight task
identity, permissions and durable truth. Use the accepted platform boundary:
Cloudflare entity state/cross-service workflows or Vercel application-local jobs,
with one durable orchestrator per workflow. This collector provisions neither.

Send an admitted cloud worker only its bounded code/context pack. Record provider
and account route, timeout, spend ceiling and artifact return contract. Check the
immutable base, patch and allowed files before local integration. A cloud session
finishing is not proof the user's result has landed.

Updates need installed version, official release evidence, a compatibility test,
backup/recovery behavior and a free owned lane. Test one host first and promote
its receipt before wider rollout. Never restart active peer gateways, modify all
MCP configurations or exhaust a shared subscription solely because an update or
an allowance exists. Measure useful accepted work per allowance and preserve
capacity for the owner's active tasks.

## Remaining implementation

Host-native JSONC/YAML/inheritance adapters, installed-version collection, official
release comparisons, executable capability proofs, live quota refresh integration,
task-routing consumption and a user-facing fleet surface remain open. This
collector is not an implemented autonomous meta-harness. No live update, cloud
deployment, automatic memory promotion or universal chat access is claimed.
