# Harness integration decisions

Checked 10 October 2026. This is an operational integration record, not a new
portfolio queue, provider ranking or claim of customer acceptance.

## Supported upstream interfaces first

Keep OpenCode, Goose and Hermes upstream. SIS owns portable work evidence,
host bindings and editorial revisions. Integrations translate upstream protocols;
they do not merge different harnesses' authentication, sessions or permission rules.
No upstream fork or dependency installation is introduced by this slice.

| Harness | Source-backed interface | Implemented here | Remaining proof |
| --- | --- | --- | --- |
| OpenCode | Versioned HTTP server; session creation and JSON-schema output | Adapter for 1.18.35; actual installed health/schema and denied-session probe | Authenticated model response, tool-denial behavior during a turn, cost accounting |
| Hermes | Noninteractive structured JSONL and usage report | Existing integration remains; no new execution adapter | Installed-version schema and permission isolation before dispatch |
| Goose | Native CLI/extension integration | No new adapter | Current official wire protocol, installed runtime and admission |
| Codex / Claude | Native supported programmatic surfaces | Existing integrations remain; generic process transport requires a worker envelope | Version-specific adapters, credential boundaries and actual model output |

OpenCode source pin: tag `v1.18.35`, commit
`53d1eabb61e21162157817bf677da0a4ad3332e3`. Installed executable reported 1.18.35.
Its actual `/doc` matches the pinned generated types: requests use `format`, and
assistant messages use `info.structured`. The SDK prose currently also mentions
`outputFormat` and `structured_output`; this integration follows the verified
version's schema and rejects version drift before creating a session.

Sources:

- [OpenCode server](https://opencode.ai/docs/server/)
- [OpenCode SDK](https://opencode.ai/docs/sdk/)
- [Pinned generated types](https://github.com/anomalyco/opencode/blob/53d1eabb61e21162157817bf677da0a4ad3332e3/packages/sdk/js/src/v2/gen/types.gen.ts)
- [Pinned structured-output implementation](https://github.com/anomalyco/opencode/blob/53d1eabb61e21162157817bf677da0a4ad3332e3/packages/opencode/src/session/prompt.ts)
- [OpenCode permission rules](https://opencode.ai/docs/permissions/)
- [Hermes noninteractive CLI and usage reports](https://hermes-agent.nousresearch.com/docs/reference/cli-commands)

## Authority and recovery

The operator supplies an owned OpenCode server, authenticated provider/model and
an exact packet grant. The adapter checks version health, creates a session with
one catch-all deny rule and saves its session ID through a required host callback
before prompting. It requests structured output with zero schema retries. Returned
model and session identities must match. Unexpected tool parts or invalid output
are rejected; uncertain attempts remain in the terminal journal. The adapter
does not retry, delete sessions, patch global settings or claim that aborting an
HTTP request stopped remote work. Inspect the saved session with the original owner.

A deny rule and a checked response are not an operating-system sandbox. Existing
server plugins, MCP connections, hooks and background calls belong to the host.
Use an isolated, admitted server for source-only work. The actual local contract
probe used private XDG/config/home directories, no copied credentials, an ephemeral
Basic-auth password, no configured plugins/MCP and no model request. It stopped
its own server afterward. It proves the installed API, not model quality or billing.

## Creator outcome and comparison

The workspace binds a creator brief and its selected source snapshots to a
confirmed run. It keeps the original draft and immutable revisions, rejects stale
edits, validates source IDs, detects a broken revision chain and exports Markdown
with a provenance manifest. Semantic claim verification and publication approval
remain human decisions. Markdown output is untrusted content, not sanitized web HTML.

The working example is an article about recovering uncertain agent attempts,
with LinkedIn and newsletter adaptations, authored in the current Codex session.
It was captured through an explicit host-supplied result, reopened, edited and
exported. No external OpenCode model call generated it. The same original article
was retained as a direct authored-Markdown baseline. This checks provenance and
editing behavior; model latency, cost, native-conversation recovery and comparative
editorial quality were not measured. No superiority or savings claim is supported.

## Extension order

1. Prove an authenticated source-only OpenCode turn, denied tool behavior and
   provider usage, preserving the same source/task binding and direct baseline.
2. Add version-bound adapters for the existing Codex, Claude, Hermes and Goose
   installations after reading their current schemas. Keep auth and sessions native.
3. Bind existing GenCreator and SIS web surfaces to these records; product repos
   retain their own ownership, design and release gates.
4. Add experiments, academy progress and tool/subscription tracking to established
   product records with evidence of actual usage. Do not infer tool availability or
   quality from a catalog entry.

A fork requires a specific upstream gap, a tested advantage, license review and
an owner for upstream compatibility. There is no such demonstrated need here.
