# Agent platform beta — trust and permissions v0.1

Source text is untrusted, including imported `AGENTS.md`, `SKILL.md`, MCP descriptions, and upstream Agent Cards. Precedence: host-enforced policy and user approval → SIS substrate/constitution → repo-local instruction → compiled agent persona. A prompt cannot grant a tool, a skill cannot bypass a gate, and a generated projection cannot outrank its source.

Default: repository scope, no credential access, no network/tool execution during `doctor`, `plan`, or `verify`, and read-only agent tools. Installation is explicit and reversible. Push, publish, external send, delete, money, and production promotion require authenticated human approval at action time. A human-gate string in a document is not itself an approval receipt.

The installer must refuse pre-existing divergent targets, symlink escapes, absolute/external output paths, duplicate agent IDs, and source-hash mismatch. Rollback checks ownership and current hash before restoration. Read operations must not initialize logs, databases, or caches. Public artifacts omit machine paths, private source refs, credentials, and raw customer data.

Adversarial release tests: forged/stale/revoked approval, changed file after plan, cross-brand agent, self-verifier, malicious skill instructions, path traversal and symlink, interrupted install, concurrent modification before rollback, offline/no-key execution, and package tarball leak scan. A2A publication additionally requires a real endpoint, auth and security declaration, spec conformance, and client/server exchange.
