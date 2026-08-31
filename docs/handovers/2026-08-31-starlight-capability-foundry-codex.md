# Codex handover: continue Starlight Capability Foundry

Date: 2026-08-31  
Repository: frankxai/Starlight-Intelligence-System  
Branch: feat/cross-ecosystem-capability-foundry  
Mission: turn the foundational cross-host contracts into the first real, receipt-backed P0 release without overstating host support.

## Copy/paste prompt

You are the implementation lead for Starlight Capability Foundry.

Work in frankxai/Starlight-Intelligence-System from branch feat/cross-ecosystem-capability-foundry. Continue until the next safe, reviewable milestone is implemented, tested, documented, and reflected in GitHub. Do not stop at a plan while a safe implementation step remains.

### Read first

Read completely, in this order:

1. AGENTS.md and any nested AGENTS.md files that govern files you touch.
2. SIP.md, CLAUDE.md, and repository contribution/security instructions.
3. docs/specs/2026-08-31-starlight-capability-foundry.md
4. docs/architecture/STARLIGHT-INTELLIGENCE-FOUNDRY.md
5. docs/boards/2026-08-31-starlight-capability-foundry.md
6. foundry/contracts/host-capability-registry.schema.json
7. foundry/contracts/platform-release-receipt.schema.json
8. foundry/platforms/host-capabilities.v1.json
9. tools/foundry/lib/compile.mjs and tools/foundry/lib/schema.mjs
10. test/v92-foundry.test.ts
11. plugins/starlight-foundry/README.md and all three checked-in manifests
12. Related GitHub issues in this repository, agentic-intelligence-system, starlight-creator-mcp, and starlight-evals.

Use current official primary sources for every unstable host claim. Never infer current marketplace behavior from memory.

### Product decision to preserve

Starlight Capability Foundry is the cross-ecosystem release and assurance plane.

It is not a second compiler and not a broad marketplace yet.

Authority is fixed:

- SIS Foundry owns contracts, compilation, proofs, registry, receipts, and evolution.
- AIS owns discovery, routing, the future receipt index, and claim-serving control plane.
- starlight-creator-mcp is the first production runtime/reference product.
- starlight-evals owns the reusable cross-host evaluation corpus.
- Starlight Exchange is later and consumes current receipts.

The foundational pull request makes no verified, published, or supported host claim.

### Invariants

Preserve these invariants in code and tests:

1. Agent Plugins 1.0.0 is the portable source package.
2. Portable plugin.json remains closed to the upstream schema.
3. Portable mcp.json uses the upstream MCP schema.
4. OpenAI and Claude metadata live in explicit overlays.
5. The compiler always emits portable core, only emits host overlays for Plugin Pack targets allowed by the Task Envelope, and records that exact emitted set in foundry-manifest.json.
6. Publisher, repository, homepage, license, email, and keywords come from source contracts; never hardcode Starlight for third parties.
7. Remote MCP endpoints require HTTPS and reject user information, query strings, and fragments.
8. Secrets never enter packages, logs, screenshots, recordings, fixtures, or issue bodies.
9. One receipt covers one exact registry ID, registry surface, adapter tier, and environment; every claim uses that surface and expires.
10. Verified/published/supported claims require overlapping passing evidence.
11. Published/supported require a release or listing URL; reviewed marketplaces require approval.
12. Supported requires a named owner and no applicable failing check.
13. Unsupported adapters and blocked distribution cannot become strong claims.
14. Receipt schema validation binds the subject digest and the deterministic digest of the entire non-attestation receipt statement; it is not cryptographic authentication.
15. A separate verifier must authenticate Sigstore/GitHub OIDC or the named human review record against that signed statement.
16. Human consent, marketplace forms, billing, privacy/legal declarations, and final publish remain human gates.
17. Public badges and copy must be derived from current receipts.
18. Failing or expired receipts downgrade claims automatically.
19. Do not broaden target scope merely because another host looks compatible.
20. Every host adapter has an owner, tests, evidence plan, limitations, and repair path.
21. Reject symbolic links in every canonical-source path component and compiled artifact tree before copying, hashing, or proving; reject .git and node_modules entries instead of silently excluding them.

### Immediate milestone

Deliver a conformance-ready P0 foundation and the first staging runtime release candidate.

#### Workstream A: upstream conformance

Implement pinned validation for:

- https://agent-plugins.org/schemas/1.0.0/plugin.schema.json
- https://agent-plugins.org/schemas/1.0.0/mcp.schema.json
- Claude Code’s strict native plugin validator or the closest official deterministic validator.
- OpenAI/Codex package validation exposed by current official tooling.

Requirements:

- Pin schema/CLI versions or immutable digests.
- Cache vendored schemas only when licensing and update policy are documented.
- Reject unknown portable fields.
- Test positive and negative fixtures.
- Fail closed when a required validator cannot run.
- Record validator name, version, digest, and output in release evidence.
- Do not mark a host verified merely because its package validates.

Add CI steps to .github/workflows/capability-foundry.yml. Keep actions pinned by full commit SHA.

#### Workstream B: attestation verifier

Implement a verifier separate from JSON schema validation.

It must:

- bind the attestation to subject artifactSha256 and statementSha256;
- sign and verify the deterministic non-attestation receipt statement covering host, adapter, distribution, run, checks, evidence hashes, claims, sources, expiry, and waiver;
- verify the selected GitHub OIDC/Sigstore provenance with official libraries or CLIs;
- verify issuer, identity, repository, workflow, ref/tag, and subject digest against policy;
- expose deterministic pass/fail reasons;
- reject missing, expired, malformed, or unverifiable attestations;
- support a clearly labeled human-review record only for human gates, not as a fake cryptographic signature;
- add negative tests for wrong issuer, wrong repo, wrong digest, wrong workflow, and replay/expiry;
- emit a verifier result referenced by the platform receipt.

Do not invent cryptographic primitives.

#### Workstream C: starlight-creator-mcp staging runtime

Coordinate with frankxai/starlight-creator-mcp.

Produce or update:

- a production-shaped streamable-HTTP MCP endpoint;
- staging tenant and deterministic fixture mode;
- least-privilege OAuth or the documented host-appropriate auth mode;
- health/build/schema/policy metadata;
- trace correlation IDs;
- positive and negative-auth fixtures;
- privacy and retention rules;
- text fallback for any optional UI;
- deployment and rollback runbooks.

Never extract or repurpose credentials. Use only task-relevant connected secrets through their normal deployment mechanism. Stop at account/consent/billing gates and create a precise blocker.

#### Workstream D: first P0 runners

Implement reusable runner contracts before host-specific scripts.

Runner inputs:

- product and version;
- artifact digest and optional SBOM digest;
- host registry ID and exact environment;
- install source;
- expected capabilities;
- success fixture;
- negative-auth fixture;
- upgrade source version;
- evidence and redaction policy.

Runner outputs:

- environment fingerprint;
- install, discovery, positive, negative-auth, update, and uninstall results;
- traces and JUnit;
- screenshot/recording requests or assets;
- listing snapshot when relevant;
- redaction report;
- immutable evidence URIs and hashes;
- proposed receipt with no promoted claim until attestation verification passes.

Start with the P0 surface that can be exercised safely with available authorization. Do not pretend the other P0 runs happened.

### Required tests

Extend test/v92-foundry.test.ts or smaller focused suites where appropriate.

At minimum test:

- upstream portable manifest success and unknown-field failure;
- upstream MCP manifest success and malformed transport failure;
- target-scoped artifact emission;
- third-party publisher/license round trip;
- HTTPS endpoint acceptance;
- rejection of non-HTTPS, userinfo, query, and fragment URLs;
- registry/receipt host ID, surface, and adapter-tier parity;
- unknown or mismatched host ID/surface/tier rejection;
- claim/host surface mismatch rejection;
- dangling and duplicate evidence rejection;
- verified claim without matching pass rejection;
- pass with disjoint evidence rejection;
- unsupported adapter strong-claim rejection;
- blocked/pending marketplace published claim rejection;
- missing listing URL rejection;
- unowned or failing supported claim rejection;
- subject and signed-statement digest mismatch rejection;
- source and compiled-tree symlink rejection;
- cryptographic verifier issuer/identity/digest negative cases;
- expired receipt downgrade;
- deterministic redaction;
- install/update/uninstall runner state transitions.

Run:

~~~bash
npm ci
npm run foundry:plugin:check
npm run test:foundry
npm run lint
npm run build
npm test
~~~

If a broad test invokes an external model or service and policy blocks it, do not bypass the block. Record the exact blocked command, the completed safe tests, and the required authorized fixture or mock.

Also run git diff --check and any validator-specific commands.

### Evidence and media

For a real host run:

- use a clean disposable profile or staging tenant;
- record exact host version, channel, OS, architecture, plan, and locale;
- script the task before recording;
- capture install/discovery, one meaningful result, permission/consent when relevant, update, uninstall, and listing state;
- keep video short and captioned where useful;
- redact secrets, customer data, personal data, tenant IDs, unrelated notifications, and browser chrome;
- hash every artifact after redaction;
- store evidence at immutable HTTPS locations;
- link only hashes and safe URIs in the receipt.

Never upload unreviewed raw screenshots or recordings to a public issue.

### GitHub execution

Keep work reviewable:

1. Confirm the current branch and base before editing.
2. Preserve unrelated user changes.
3. Use one issue per host surface through the capability-adapter form.
4. Update the cross-repository issues rather than duplicating ownership.
5. Make small commits by coherent workstream.
6. Keep the foundational PR description truthful about test scope.
7. Add exact test output and blockers to the PR.
8. Request the correct code/security/GTM reviewers when known.
9. Do not merge, publish a marketplace listing, create paid infrastructure, or enable production credentials without explicit authority.
10. Update the handover document before ending if work remains.

### GitHub controls to propose or implement when authorized

- protected main with required checks;
- CODEOWNERS for Foundry contracts, security, adapters, and GTM assets;
- staging and production environments with required reviewers;
- GitHub OIDC;
- secret scanning and push protection;
- dependency review and Dependabot;
- release artifact provenance and SBOM;
- durable evidence storage;
- scheduled drift canaries;
- receipt-expiry and downgrade automation.

Repository settings changes are external writes. Implement only those clearly authorized; otherwise produce exact setting recommendations in an issue.

### Human gate packet

When blocked on a human action, provide one compact packet:

- exact host and account/role needed;
- why the gate is required;
- least privileges/scopes;
- exact URLs or console path;
- data and privacy implications;
- cost/billing implication;
- success criterion;
- evidence to capture;
- safe rollback;
- what automation resumes afterward.

Never ask for raw secrets in chat or GitHub.

### Definition of done for this milestone

The milestone is done only when:

- pinned portable and native validation runs in CI;
- attestation verification exists and negative tests pass;
- one authorized staging runtime artifact is reproducible and provenance-bound;
- at least one real host runner completes install through uninstall;
- evidence is redacted, immutable, and hashed;
- the receipt validates and its attestation is actually verified;
- the claim remains scoped to the exact tested environment;
- GitHub issues show owners and next gates for the remaining P0 hosts;
- docs and handover reflect reality;
- no unsupported public badge or marketplace claim was created.

### Final report format

Lead with the outcome.

Then report:

- files and repositories changed;
- architecture decisions preserved or newly proposed;
- exact tests and validators passed;
- real host runs completed, with receipt/evidence links;
- claims minted and their scope/expiry;
- human gates and blockers;
- GitHub PR and issue links;
- next smallest safe milestone.

Explicitly distinguish: implemented, locally validated, host verified, published, and supported.
