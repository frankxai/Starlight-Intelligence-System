# Starlight Capability Foundry

Status: foundation merged in PR #122; Phase 1 release assurance active
Date: 2026-08-31  
Decision owner: Starlight Intelligence  
Board verdict: PROCEED, with the condition that no compatibility or support claim may outrun a current platform receipt.

## Executive decision

Starlight Capability Foundry should become a key product.

The product is not “another plugin marketplace.” Its wedge is the difficult layer every serious capability publisher needs: compile one governed source capability into host-correct packages, install and test them in real AI hosts, capture useful evidence, and keep public claims current as hosts drift.

Build the release and assurance plane first. Add Starlight Exchange—the catalog, distribution, and commercial marketplace—only after P0 release reliability is proven.

The durable promise is:

> One capability contract in. Targeted packages, reproducible host evidence, and honest release claims out.

## Product stack

| Product | Buyer outcome | Timing |
|---|---|---|
| Foundry Core | Author, validate, compile, and prove skills, agents, MCP tools, UI, and host overlays | Now |
| Foundry Release Cloud | Cross-host runners, evidence capture, receipts, drift canaries, and release automation | First commercial product |
| Foundry Assurance | Policy, provenance, SBOM, permission review, attestation verification, and support-state API | With enterprise pilots |
| Starlight Exchange | Discover, evaluate, license through host-policy-permitted channels, install, update, and govern proven capabilities | After P0 reliability |
| Foundry Enterprise | Private registries, tenant policies, approved catalogs, audit export, and support SLAs | After design partners |

## Non-goals

- Do not create one hand-maintained source tree per host.
- Do not call documented compatibility “verified.”
- Do not store API keys, OAuth tokens, customer data, or query-string credentials in packages or evidence.
- Do not automate marketplace submission steps that require a legal, privacy, billing, consent, or reviewer decision.
- Do not make a second capability compiler in the Agentic Intelligence System.
- Do not claim cryptographic authenticity merely because a receipt matches a JSON schema.
- Do not launch a broad marketplace before install/update/uninstall reliability is measurable.
- Do not sell or promote digital products, services, subscriptions, credits, or upgrades inside an OpenAI plugin while current OpenAI policy forbids that commerce.
- Do not imply OpenAI verification, endorsement, or support without explicit host evidence authorizing the exact wording.

## Authority map

| Repository or system | Canonical authority |
|---|---|
| Starlight-Intelligence-System | Foundry contracts, portable source, compiler, prover, platform registry, release receipts, policy, and evolution proposals |
| agentic-intelligence-system | Discovery, task routing, operational control plane, future receipt index, and support-state API |
| starlight-creator-mcp | First production remote MCP runtime and reference product |
| starlight-evals | Cross-host behavior, safety, permissions, tool selection, and regression corpus |
| frankx-app-forge | Downstream application generation and migration consumer |
| agentic-creator-skills | Migration source for reusable creator workflows |
| Arcanea marketplaces | Downstream domain catalogs and future Exchange supply |

No repository may redefine the Foundry contracts. Downstream systems consume versioned schemas and receipts.

## System architecture

~~~mermaid
flowchart TD
    A["Capability source<br/>skills, MCP, UI, policy"] --> B["SIS Foundry<br/>validate and compile"]
    B --> C["Host adapters<br/>portable + native overlays"]
    C --> D["Release runners<br/>headless + human gates"]
    D --> E["Evidence bundle<br/>logs, traces, media, listing"]
    E --> F["Platform receipt<br/>scoped and expiring"]
    F --> G["AIS index and GTM claims"]
    F --> H["Evolution queue<br/>repair and re-proof"]
~~~

The compiler is deterministic. Model-authored plans, copy, skills, and UI may be creative; package boundaries, permissions, generated paths, digests, and claim promotion are not.

## Canonical capability source

The source model has six layers:

1. Capability contract: identity, version, publisher, license, purpose, inputs, outputs, limitations, and ownership.
2. Skills: reusable SKILL.md procedures with references and optional assets.
3. Tool plane: optional MCP servers, tool schemas, resources, prompts, authentication policy, and transport.
4. Experience plane: optional MCP Apps UI, host cards, A2UI, or standalone web fallback.
5. Policy plane: permissions, confirmations, data handling, destructive-action rules, tenancy, and budgets.
6. Evaluation plane: static, behavioral, factual, artifact, taste, security, economic, drift, and host-native tests.

Agent Plugins 1.0.0 is the portable package core:

~~~text
plugin/
├── plugin.json
├── skills/
│   └── <skill>/SKILL.md
├── mcp.json                  # optional
├── .codex-plugin/plugin.json
├── .mcp.json                 # optional OpenAI overlay
├── .claude-plugin/plugin.json
└── .claude-mcp.json          # optional Claude overlay
~~~

Portable plugin.json stays closed to the upstream schema. Host-only metadata belongs in a host overlay or a reverse-domain extension directory. The compiler always emits the portable core and emits an OpenAI or Claude overlay only when that target was declared. The Task Envelope defines the maximum allowed targets; foundry-manifest.json records the Plugin Pack's exact emitted target set. Every path component from the canonical source root to a selected skill must be a real directory or file, never a symbolic link. Compiled trees reject every symbolic link, and both source and compiled trees reject .git and node_modules entries rather than skipping them, so copied bytes cannot disappear from the digest set.

Publisher identity, homepage, repository, license, and keywords are source inputs. This makes the Foundry safe for third-party products instead of silently assigning Starlight ownership.

### OpenAI channel model

OpenAI publication and execution are modeled as separate evidence surfaces even though one public Plugins Directory is shared by ChatGPT and Codex:

| Surface | Foundry output | Required evidence |
|---|---|---|
| Local/repository package | Portable core plus OpenAI overlay | Pinned portable validation, docs-derived OpenAI preflight, clean loader lifecycle |
| Workspace GitHub marketplace | Governed marketplace entry | Admin sync, policy, install, update, and removal evidence |
| Universal Plugins Directory | Portal dossier and reviewed snapshot | Verified publisher, Platform upload, skill safety/security scan for skills or tool scan for MCP, review outcome, listing URL |
| ChatGPT runtime | Runtime receipt | Activation, boundary, behavior, permissions, and uninstall in exact plan/region |
| Codex runtime | Runtime receipt | Activation, boundary, behavior, update, and uninstall in exact CLI/app version |

The portable package never substitutes for a directory or runtime receipt. A directory publication receipt never substitutes for either runtime receipt. OpenAI exposes no current standalone public submission validator, so Foundry labels its automated OpenAI check `docs-derived-preflight` and requires portal evidence before promotion.

The policy plane must track host commerce behavior with source, verification date, and review TTL. For OpenAI, the release projection is `no-commerce` or `existing-entitlements-only`: digital checkout, plan comparison, upgrade promotion, and links to buy digital services remain outside the plugin. Exchange take-rate mechanics are enabled only on channels whose current policy permits them.

Remote MCP endpoints must:

- use HTTPS;
- contain no user information;
- contain no query string;
- contain no fragment;
- obtain secrets through the host secret store or OAuth;
- expose least-privilege scopes and negative-auth behavior;
- have a staging tenant for release testing.

## Runtime and UI architecture

The first runtime should be starlight-creator-mcp. It proves the release plane with a real product before the system expands horizontally.

Runtime responsibilities:

- serve MCP tools, resources, and prompts;
- publish health, build, schema, and policy metadata;
- support streamable HTTP and standards-based OAuth where required;
- tag every invocation with product, package, host, release, tenant, and trace identifiers;
- keep customer payloads out of release evidence by default;
- expose deterministic sandbox fixtures for host runners;
- degrade to text when embedded UI is unavailable.

The experience plane has one semantic model and several projections:

| Semantic component | MCP Apps | Google/A2UI | Host-native | Text fallback |
|---|---|---|---|---|
| Form/action | Interactive component | A2UI action | Host card or form | Structured prompt |
| Result collection | Embedded app state | A2UI list/table | Native card | Markdown/JSON |
| Confirmation | Host modal/action | A2UI action | Native consent | Explicit text confirmation |
| Evidence hook | UI event trace | Event trace | Host event/log | Transcript marker |

A host adapter may remove unsupported presentation, but it must not silently remove permission checks, confirmations, or result semantics.

## Platform portfolio

The machine-readable source is foundry/platforms/host-capabilities.v1.json. Its entries describe documentation and planned validation; they do not themselves create verified or supported claims.

| Priority | Surfaces | Intent |
|---|---|---|
| P0 | ChatGPT/Codex, Claude, Cursor, VS Code/Copilot | Prove portable plus native packaging and release operations |
| P1 | Custom GPTs, Antigravity, Gemini app building, Workspace, Gemini Enterprise, Grok, Manus, Hermes | Commercial reach and important emerging ecosystems |
| P2 | Gemini CLI, OpenCode, Kiro, Devin, Cline, Junie, Zed | Compatibility after P0 is reliable |
| Excluded | Roo Code legacy/sunset lane | Track explicitly; do not spend active release capacity |

### Adapter tiers

- portable: the Agent Plugin package is directly consumable with bounded host metadata.
- native: a deterministic host renderer is required.
- mcp-only: the host consumes the runtime but not the full skill package.
- instruction-pack: prompts, guidelines, OpenAPI, or host configuration must be projected.
- unsupported: the release engine must stop and explain why.

Every surface has an independent receipt because “works in Claude Code” does not prove “works in Claude web,” and “works in VS Code” does not prove a hosted GitHub experience.

## Claim and receipt model

Claim states are ordered but never inferred from marketing intent:

~~~text
documented -> compatible -> verified -> published -> supported
                          \-> degraded
           \-> blocked / unsupported
~~~

| State | Required minimum |
|---|---|
| documented | Current official source and verification date |
| compatible | Contract-valid target artifact built by the pinned compiler |
| verified | Matching passing host check with overlapping immutable evidence; public label `Tested by Starlight` |
| published | Verified artifact plus public release/listing URL; marketplace review approved when applicable |
| supported | Published, named owner, no applicable failing check, monitoring and response policy |
| degraded | Evidence-backed limitation and owner/repair path |
| blocked | Explicit dependency, access, policy, or review blocker |
| unsupported | Known incompatibility or sunset surface |

A platform receipt binds:

- subject name, semantic version, git SHA, artifact SHA-256, and optional SBOM digest;
- registry host, surface, version, channel, OS, architecture, plan, and locale;
- adapter tier, format, version, and transport;
- distribution mode, listing/release URL, review state, and installed version;
- runner mode, suite version, workflow URL, and timestamps;
- checks, evidence references, claims, limitations, owner, and expiry;
- official sources;
- attestation method, signature material, subject digest, signed-statement digest, and verification URL;
- a time-bounded waiver, if any.

The host registry ID, exact registry surface label, adapter tier, and every claim surface must agree. attestation.statementSha256 is the SHA-256 of the complete receipt except the attestation object, serialized as JSON with lexicographically sorted object keys and preserved array order. This non-self-referential statement binds the host, checks, evidence hashes, claims, official sources, distribution facts, expiry, and waiver before an external signer authenticates it.

Schema validation proves structure, local semantic invariants, and the deterministic statement digest. It does not verify Sigstore, GitHub OIDC, or a human identity. In the foundational implementation, every verified, published, or supported candidate is rejected with ATTESTATION_VERIFIER_REQUIRED. A separate verifier must authenticate the attestation and signed statement before the claim API may expose those states.

Default receipt TTL is 45 days. Security-critical host or authentication changes invalidate affected receipts immediately.

## Release runner

Each release uses a clean disposable host profile where practical.

### Required test sequence

1. Build from the exact tagged source and record digests.
2. Validate Foundry schemas and target-specific package schemas.
3. Scan secrets, licenses, dependencies, permissions, and SBOM.
4. Bind the portable source package, host submission snapshot, and installed runtime artifact; hosts may review or publish a metadata snapshot rather than the same local wiring.
5. Confirm capability discovery and starter invocation.
6. Execute a representative success path.
7. Execute negative authentication and denied-permission paths.
8. Verify optional UI and text fallback.
9. Upgrade from the previous supported version.
10. Uninstall and confirm cleanup.
11. Capture listing state if publication is claimed.
12. Redact and hash the evidence bundle.
13. Verify the attestation.
14. Mint an expiring receipt.
15. Update the AIS support index and public copy from the receipt, never by hand.

### Evidence layout

~~~text
evidence/<product>/<version>/<host>/<run-id>/
├── environment.json
├── artifact.json
├── sbom.spdx.json
├── install.log
├── discovery.ndjson
├── positive.ndjson
├── negative-auth.ndjson
├── update.log
├── uninstall.log
├── junit.xml
├── traces/
├── screenshots/
├── recording/
├── listing.json
├── redaction-report.json
├── attestation.json
└── platform-release-receipt.json
~~~

Evidence media is conditional. Internal host evidence may capture install/discovery, one meaningful result, permissions/consent, and listing state. OpenAI recordings are created only when explicitly requested by the portal/reviewer or justified by an internal evidence plan; current official documentation does not make them universally mandatory. Directory screenshots are included only when the scanned plugin exposes custom UI; a skills-only or no-UI plugin submits none. Every recording should be short, scripted, captioned where useful, and scrubbed of credentials, customer content, email addresses, tenant IDs, and unrelated browser chrome.

## Agentic release team

The team is bounded by role and evidence, not by personalities.

| Role | Owns | Cannot self-approve |
|---|---|---|
| Portfolio lead | Priorities, launch scope, metrics, kill criteria | Technical verification |
| Source researcher | Official docs, versions, policy changes, registry proposals | Compatibility state |
| Contract/compiler engineer | Schemas, renderers, deterministic packaging | Host verification |
| Runtime engineer | MCP service, OAuth, tenancy, observability, fixtures | Marketplace approval |
| Host adapter owner | One host surface and its native renderer | Supported claim |
| Security/provenance reviewer | Secrets, scopes, SBOM, licenses, signing policy | Business launch |
| Host test operator | Clean install and human-in-host evidence | Own failed check |
| Evidence curator | Redaction, screenshots, recording, bundle hashes | Rewrite test outcome |
| Release verifier | Receipt checks, attestation verification, claim promotion | Waive own failure |
| GTM owner | Listing copy, demos, enablement, design partners | Invent compatibility |
| Drift steward | Scheduled canaries, expiry, regression triage | Silent claim extension |

Parallelize source research, adapter implementation, security review, and host runs only when their write scopes do not overlap. The release verifier is a separate role from the adapter author.

### Initial operating assignment and response targets

These are internal pilot targets, not a customer-facing support SLA. Frank Riemer is the accountable human for portfolio scope, GTM, spend, and every external publication gate. Agent names below are registered execution leads; they cannot replace human consent or approve their own work. Before a design-partner kickoff, every lane must have a named GitHub assignee and backup. An unassigned required lane blocks the kickoff and any `supported` claim.

| Lane | Initial accountable owner | Lead agent or role | Pilot cadence and response target | Failure effect |
|---|---|---|---|---|
| Portfolio and GTM | Frank Riemer | `starlight-navigator` plus GTM owner | Review the 14-day scorecard every two business days; decide scope, price, or stop changes within one business day | No new outreach or offer expansion without an owner decision |
| Source and policy | Foundry maintainer appointed by Frank | `starlight-hermes` plus source researcher | Check P0 official sources weekly and before every candidate; triage a suspected breaking policy change within four working hours | Freeze the affected claim until the source and registry are reconciled |
| Contracts and adapters | SIS Foundry maintainer appointed by Frank | `starlight-architect` plus contract/compiler engineer and surface adapter owner | Required checks on every change; triage a P0 failure the same business day and post a repair plan within one business day | Block artifact promotion for the affected target |
| Runtime and security | `starlight-creator-mcp` maintainer, assigned before staging | `starlight-architect`, `starlight-sentinel`, and runtime engineer | Treat secret, OAuth, tenancy, or destructive-action findings as immediate release blocks; human triage within four working hours | Stop the run, revoke exposed material if applicable, and require independent re-review |
| Host run and evidence | Release operator assigned on the release issue | `starlight-orchestrator` plus host test operator and evidence curator | Start the clean run within one business day of an eligible candidate; redact and hash evidence before upload | A missing, failed, or unredacted check cannot produce a receipt |
| Verification and claims | Human release verifier who did not author the adapter | `starlight-evaluator` plus release verifier | Review receipt, attestation, and copy within one business day of a complete evidence bundle | Keep or downgrade the claim; never infer approval from silence |
| Drift and support | Named surface owner, required before `supported` | `starlight-orchestrator` plus drift steward | Run the surface cadence recorded in the registry, never later than the 45-day receipt expiry; downgrade a critical failed claim within one hour and assign repair within one business day | Expire or degrade only the affected surface |

Contractual customer response and resolution SLAs remain out of scope until repeated pilot runs establish achievable service levels and an accountable support rota is staffed.

### Human gates

Human approval is mandatory for:

- account connection and OAuth consent;
- billing, cloud project, or tenant creation;
- legal terms, privacy declarations, data processing, and license choices;
- marketplace developer identity and payout/tax configuration;
- public listing text, screenshots, video, and final submission;
- reviewer responses;
- production secrets and domain verification;
- high-risk scopes or destructive tools;
- support ownership and SLA activation.

The automation records a blocker instead of attempting to bypass a missing gate.

## GitHub operating system

### Repository structure

~~~text
foundry/
├── contracts/
│   ├── plugin-pack.schema.json
│   ├── host-capability-registry.schema.json
│   └── platform-release-receipt.schema.json
└── platforms/host-capabilities.v1.json

tools/foundry/
├── cli.mjs
└── lib/
    ├── compile.mjs
    ├── schema.mjs
    ├── prove.mjs
    └── evolve.mjs

plugins/starlight-foundry/
├── plugin.json
├── .codex-plugin/
├── .claude-plugin/
└── skills/

docs/
├── architecture/
├── boards/
├── handovers/
└── specs/
~~~

### Workflow lanes

| Lane | Trigger | Output |
|---|---|---|
| Contract | Pull request | Schema and semantic validation |
| Compile | Pull request | Deterministic target artifacts and digest diff |
| Conformance | Pull request/release | Pinned upstream Agent Plugins and native host validators |
| Security | Pull request/release | Secret scan, dependency review, license/SBOM, permission diff |
| Headless host | Release/canary | Install, discovery, behavior, negative auth, update, uninstall evidence |
| Human host | Release gate | UI, consent, tenant policy, listing, screenshots, recording |
| Attestation | Release gate | Authenticated provenance verification |
| Claim promotion | After receipt | AIS support-state update and approved GTM copy |
| Drift | Scheduled | Receipt renewal, expiry, downgrade, or repair issue |

The Capability Foundry workflow now verifies the exact vendored Agent Plugins 1.0.0 schema digests, validates the portable package with Ajv 8.20.0, runs a freshness-bounded OpenAI docs-derived preflight, validates the OpenAI submission profile, exercises a pinned official Codex 0.152.0 add/discover/install/list/remove lifecycle in a disposable home, runs Claude Code 2.1.252's official strict native validator, and uploads redacted reports. Its reviewed lock binds each validator's complete local source/contract closure and exact dependency lock, rejects closure deletion or mutation, decodes JSON as fatal UTF-8, and rejects nested skill manifests. Connected ChatGPT and Claude behavior, cryptographic attestation, and the OpenAI portal scan remain explicit Phase 1 gates.

### GitHub controls to enable

- protect main; require pull requests and linear/squash history;
- require Capability Foundry, security, and repository baseline checks;
- use CODEOWNERS for contracts, security, adapters, and GTM assets;
- create staging and production environments with required reviewers;
- use GitHub OIDC instead of long-lived cloud credentials;
- store host credentials only in environment-scoped secrets;
- enable secret scanning, push protection, dependency review, and Dependabot;
- retain release evidence outside ephemeral CI storage and link it by immutable HTTPS URI;
- sign release artifacts and publish SBOM/provenance;
- require one issue per host surface using the capability-adapter form;
- use a project board with Now, Next, Blocked, Human Gate, Evidence, Review, and Done.

## GTM architecture

### Initial customer

Start with teams that already maintain an MCP server, AI coding extension, or internal agent and feel the cost of supporting several hosts. They understand the pain and can supply real staging tenants.

Ideal design partners:

- MCP and agent-tool vendors;
- developer-tool companies;
- enterprise AI platform teams;
- agencies shipping repeatable agentic workflows;
- vertical software vendors adding AI actions.

### Wedge offer

“Bring one production capability. Starlight makes it release-ready for four P0 surfaces, produces the evidence pack, and maintains an honest compatibility matrix.”

The first engagement is a paid launch program, not a self-serve marketplace.

Deliverables:

- normalized capability contract;
- portable and native packages;
- OAuth/secret/permission review;
- four P0 release plans;
- real host evidence and media;
- platform receipts;
- listing submission kits;
- 45-day drift monitoring;
- remediation backlog and owner handoff.

### Packaging hypothesis

These are hypotheses to test, not published prices:

| Offer | Hypothesis | Success signal |
|---|---|---|
| Open-source Foundry Core | Free compiler, contracts, local proofs | Qualified runtime and Release Cloud adoption |
| Launch Sprint | Fixed-fee P0 packaging and evidence | Five design partners; three renew |
| Release Cloud Team | Per product plus active host surfaces | Monthly receipt renewal and expansion |
| Enterprise | Annual private registry, policies, audit, SLA | Security-approved production deployment |
| Exchange take rate | Later, only on policy-permitted transaction channels | Proven buyer demand without harming publisher economics or violating host policy |

Do not price by number of generated files. Price the reduction in release time, review failure, drift risk, and support burden.

### Fourteen-day founder-led sales experiment

This is the first evidence-producing GTM test, not a launch claim.

**Beachhead.** Approach teams that already have one production or production-shaped MCP server, agent tool, or AI extension; have received explicit requests for at least two P0 surfaces; can provide a non-customer-data staging fixture; and have a technical or product decision-maker available during the test. Exclude speculative ideas, single-host hobby projects, regulated-data pilots, and prospects that require marketplace approval to count the engagement as delivered.

**First-ten selection gate.** Frank privately builds a candidate pool and selects exactly ten accounts only after each is scored against five observable signals: a working capability, multi-host demand, an identified buyer, staging access within five business days, and a plausible fourteen-day buying path. No customer name enters this specification, a public artifact, or a case study without permission. If fewer than ten candidates pass, do not pad the list; narrow the test to the qualified set and record the sourcing gap.

**Offer and payment hypothesis.** Quote a one-capability Launch Sprint at EUR 10,000–15,000 fixed, with 50% due on signed kickoff and 50% due when the agreed package, release plans, and evidence dossier are delivered. Marketplace acceptance, publication dates, and unsupported host behavior are expressly excluded from the promise. Payment is direct B2B invoicing outside every host plugin. This range, split, and scope are test variables—not published pricing and not evidence that anyone has agreed to pay.

**Attention artifact.** Use a concise release-risk diagnostic, the portable contract, and redacted local preflight output to show the method. Label them as local/preflight evidence; do not present them as connected-host verification. The call-to-action is a 30-minute release-readiness review for one real capability.

| Window | Founder-led action | Evidence captured |
|---|---|---|
| First 72 hours | Score the candidate pool, lock the qualified cohort of up to ten, send one individual message to every qualified account through warm introductions first and targeted email, GitHub, or LinkedIn second, and offer five review slots | Scorecard, message variant, send timestamp, response, and source channel—no bulk automation |
| Days 4–7 | Follow up once after three business days, run up to five discovery calls, and diagnose current host requests, failed releases, review risk, staging readiness, budget, and decision path | Structured call notes, problem severity, current labor, buying authority, objections, and next step |
| Days 8–10 | Send at most two qualified proposals using the fixed scope and price hypothesis; require a staging-access and human-gate checklist before signature | Proposal version, quoted price, payment terms, exclusions, acceptance or objection |
| Days 11–14 | Follow up once, ask for a signed kickoff and first payment, and close the test with an evidence review regardless of outcome | Signed scope and payment evidence, or a coded no-decision/loss reason |

The primary motion is founder-led warm outreach; personalized email, GitHub, and LinkedIn are secondary routes. Publish technical proof only after it is receipt-backed and approved. Content during this test is a market sensor, not a substitute for direct conversations.

**Day-14 decision.** Pass the commercial gate when the selected cohort produces at least four qualified conversations, two scoped proposals, and one signed Launch Sprint with the 50% kickoff payment received. A verbal yes does not pass. Revise the beachhead, message, scope, or price—but do not build self-serve sales automation—when conversations confirm the problem yet no payment is received. Stop or narrow the offer when fewer than three qualified accounts engage, buyers will pay only if Starlight guarantees marketplace approval, or projected delivery exceeds 60 operator hours for one sprint. Record response rate, qualified-call rate, proposal rate, cash collected, expected delivery hours, top three objections, and the single next hypothesis.

### Distribution motion

1. Publish the source specification, registry, and receipt model.
2. Use starlight-creator-mcp as the public reference launch.
3. Release evidence-rich technical case studies, not generic AI demos.
4. Partner with MCP and host ecosystems on conformance content.
5. Recruit design partners with one real capability and multiple host requests.
6. Convert repeated manual release work into Release Cloud runners.
7. Open Exchange supply only to receipt-backed packages.
8. Add buyer-side enterprise catalogs after publishers and receipts are reliable.

For OpenAI, the plugin is a free utility or existing-entitlement client. Launch Sprints, Release Cloud, and Enterprise are sold through Starlight's direct B2B channel. Governed private workspace GitHub marketplaces are an earlier enterprise wedge than public Exchange because they solve rollout, policy, and evidence without adding in-plugin checkout.

Every marketplace page should derive its host badges, tested versions, limitations, last verified date, and evidence links from receipts.

## Metrics and kill criteria

### North-star metric

Receipt-backed successful installs that complete a representative capability task on a currently supported host.

### Operating metrics

- median time from source commit to first P0 verified receipt;
- P0 install pass rate;
- update and uninstall pass rate;
- host regression detection latency;
- percentage of public claims backed by unexpired receipts;
- evidence redaction defect rate;
- marketplace first-pass review rate;
- activation precision, false-trigger rate, task completion, satisfaction, and uninstall rate by host;
- median adapter repair time after host drift;
- design-partner renewal and host expansion;
- support tickets per 100 successful installs;
- gross margin after host-testing labor.

### 90-day gates

Proceed to Exchange discovery work only if:

- at least one real runtime has receipts across all four P0 surface families;
- P0 clean-install pass rate is at least 95% over the trailing 30 days;
- update/uninstall pass rate is at least 90%;
- all public compatibility claims are receipt-backed and unexpired;
- no high-severity evidence privacy incident occurs;
- three design partners state willingness to pay for ongoing release assurance.

Pause or narrow the product if fewer than two design partners complete P0 verification, host testing remains predominantly unautomatable, or gross margin cannot improve with repeated runs.

## Continuous refinement loop

~~~mermaid
flowchart TD
    A["Scheduled canary or user signal"] --> B["Classify drift"]
    B --> C["Smallest responsible layer"]
    C --> D["Patch contract, adapter, runtime, test, or copy"]
    D --> E["Rebuild and re-run"]
    E --> F["New receipt"]
    F --> A
~~~

Signals include official documentation changes, schema releases, CLI versions, marketplace policy updates, authentication changes, failed canaries, support tickets, and longitudinal evaluation results.

Rules:

- expired receipts automatically remove verified/published/supported badges;
- a failed critical check downgrades the affected claim immediately;
- one failure creates one owner and smallest-layer repair proposal;
- adapters never patch the canonical capability semantics silently;
- tests are added before a regression is marked fixed;
- model, cost, latency, and UX learnings enter ratified memory only after proof;
- monthly portfolio review retires low-value or permanently blocked surfaces.

## Delivery plan

### First 72 hours

- Merge portable plugin, host registry, platform receipt, exact emitted-target provenance, symlink rejection, publisher provenance, URL secret guards, workflow, and issue form.
- Open the P0 epic and cross-repository runtime, registry, and eval issues.
- Add pinned upstream Agent Plugins schema validation. **Implemented on `feat/foundry-release-assurance`.**
- Add Claude native strict validation. **Implemented with pinned Claude Code 2.1.252; connected-host lifecycle remains open.**
- Choose the starlight-creator-mcp staging endpoint and authentication contract.
- Inventory required P0 accounts, plans, OS runners, reviewers, and evidence storage.
- Run the founder-led experiment's first-ten gate and message every qualified account, targeting ten; this is prospective work and does not imply that outreach has occurred.

### Days 4–14

- Productionize remote streamable-HTTP MCP with staging fixtures.
- Implement receipt signing and cryptographic verification using GitHub OIDC/Sigstore.
- Build clean Codex, Claude, Cursor, and VS Code host profiles.
- Implement install/discovery/success/negative-auth/update/uninstall suites.
- Add screenshot and recording scripts plus deterministic redaction.
- Complete the first OpenAI portal dossier without submitting publicly; use the source preflight profile as input and add verified identity/access, availability, attestations, public legal/support URLs, current skill scan or MCP tool scan, exact review tests, release notes, and conditional media.
- Complete the founder-led experiment and apply its pass/revise/stop rule; target two qualified proposals and require one paid kickoff to pass the commercial gate.

### Days 15–30

- Run the first full P0 release on starlight-creator-mcp.
- Resolve host-specific defects and mint the first authenticated receipts.
- Index receipts in AIS and expose a support-state endpoint.
- Publish one evidence-rich launch case study.
- Submit to marketplaces only after owner review.
- Start daily or weekly drift canaries according to host volatility.

### Days 31–90

- Add P1 adapters in demand order: Antigravity/Google commercial lanes, Grok, Manus, Hermes, and Custom GPTs.
- Run three to five design-partner launches.
- Build Release Cloud tenant isolation, billing meters, policy packs, and dashboards.
- Validate pricing and support economics.
- Decide whether Exchange should begin as a curated catalog or remain a release API longer.
- Retire adapters that fail the product gates.

## Backlog and definitions of done

### P0 compiler and contracts

Done when:

- portable manifest passes the pinned upstream schema;
- each native overlay passes its pinned official validator where available;
- target declaration controls artifact emission;
- third-party publisher and license survive round trip;
- URL guards reject userinfo, query, fragment, and non-HTTPS endpoints;
- deterministic builds produce the same non-time-derived artifact bytes;
- tests cover negative package and path cases.

### P0 receipt and evidence

Done when:

- registry ID is known;
- claim states require correct evidence and distribution facts;
- artifact, registry surface/tier, claim surface, and signed-statement digests match;
- the signed statement covers the full non-attestation receipt payload;
- cryptographic verification occurs outside schema validation;
- evidence is immutable, HTTPS-addressable, redacted, and hashed;
- receipt expiry and downgrade behavior are tested;
- AIS refuses unsupported or expired public claims.

### P0 host adapter

Done when:

- official sources and date are recorded;
- package renderer exists;
- clean install, discovery, positive, negative-auth, update, and uninstall pass;
- optional UI and text fallback pass;
- exact environment fingerprint is captured;
- human gates are complete;
- screenshots/recording are reviewed;
- an authenticated receipt is minted;
- owner and repair SLA are named.

### OpenAI portal dossier

Done when:

- the package is self-contained and repository-relative runtime commands are optional, explicit handoffs;
- the local package passes the pinned portable validator and freshness-bounded OpenAI preflight;
- verified publisher identity and Apps Management Write access are recorded;
- privacy, terms, support, and publisher identity agree;
- MCP submissions use a production HTTPS endpoint, a global-data-residency project, domain verification, exact annotations and justifications, five positive and three negative cases, reviewer access without MFA, and the current portal scan;
- no-UI packages contain no screenshots, while any portal-requested recording and UI screenshots follow their separate current policies;
- connected ChatGPT and Codex runtime receipts remain separate from directory publication;
- final submission and publication are explicitly approved by the accountable human.

### Other marketplace submission kit

Done when:

- listing name, summary, description, categories, prompts, scopes, privacy URL, support URL, terms, screenshots, and demo are current;
- reviewer instructions use a dedicated test tenant;
- no placeholder, secret, or unsupported badge remains;
- final submission is explicitly approved by the accountable human;
- receipt records the resulting listing URL and review state.

## Key risks

| Risk | Control |
|---|---|
| Host policy or package drift | Current official-source registry, scheduled canaries, expiring receipts |
| False support marketing | Receipt-derived badges and fail-closed claim API |
| Secret leakage | URL guard, package scan, host secret stores, OAuth, evidence redaction |
| Third-party IP/license misattribution | Required publisher/license contract and provenance review |
| Manual QA destroys margin | P0 focus, deterministic fixtures, reusable host profiles, measure labor |
| Marketplace dependency | Direct release and enterprise catalog lanes; Exchange only after proof |
| Host commerce-policy breach | Versioned commerce policy plane; OpenAI projection has no digital checkout or upgrade promotion |
| Host endorsement terminology collision | Render `Tested by Starlight`; require explicit host evidence before implying OpenAI verification, endorsement, or support |
| UI fragmentation | One semantic experience model with host projections and text fallback |
| Cross-repository contract forks | SIS authority, versioned schemas, generated clients, contract tests |
| Fake attestation confidence | Separate cryptographic verifier and verification URL |
| Unbounded ecosystem scope | P0/P1/P2 portfolio gates and explicit exclusions |

## Accepted decisions

1. Capability Foundry is a key Starlight product.
2. Release assurance comes before a broad marketplace.
3. Agent Plugins 1.0.0 is the portable source package.
4. OpenAI and Claude remain explicit native compatibility overlays.
5. SIS owns contracts; AIS indexes and routes.
6. starlight-creator-mcp is the first reference runtime.
7. Evidence and claims are scoped per host surface and expire.
8. Schema validation is not cryptographic verification.
9. Human marketplace and consent gates remain human.
10. Exchange supply will require current receipts.
11. OpenAI directory publication, ChatGPT runtime, and Codex runtime require separate receipts.
12. OpenAI plugin commerce is entitlement-only or no-commerce for Starlight digital services under current policy.

## Open decisions

- Evidence object storage and retention jurisdiction.
- Sigstore versus GitHub artifact attestation as the default.
- Supported P0 OS/architecture matrix and paid host plans.
- First two design partners.
- Launch Sprint and Release Cloud pricing.
- Exchange catalog timing and host-policy-conditional transaction model.
- Which Google commercial lane has the first customer pull.

## Official references

- Agent Plugins specification: https://github.com/agentplugins/agent-plugins-spec/blob/main/spec/1.0.0.md
- Agent Plugins schemas: https://agent-plugins.org/schemas/1.0.0/plugin.schema.json and https://agent-plugins.org/schemas/1.0.0/mcp.schema.json
- OpenAI plugin build: https://developers.openai.com/plugins/build/plugins
- OpenAI ChatGPT connection: https://developers.openai.com/plugins/deploy/connect-chatgpt
- OpenAI submission: https://developers.openai.com/plugins/deploy/submission
- OpenAI plugin guidelines: https://developers.openai.com/plugins/app-guidelines
- OpenAI submission errors: https://developers.openai.com/plugins/deploy/submission-errors
- Claude build choice: https://claude.com/docs/connectors/building/what-to-build
- Claude plugin reference: https://code.claude.com/docs/en/plugins-reference
- Claude marketplaces: https://code.claude.com/docs/en/plugin-marketplaces
- Claude connector review: https://claude.com/docs/connectors/building/review-criteria
- Gemini CLI extensions: https://geminicli.com/docs/extensions/
- Google Workspace add-ons: https://developers.google.com/workspace/add-ons/overview
- Gemini Enterprise A2A: https://cloud.google.com/gemini-enterprise/docs/create-a2a-agent
- A2A protocol: https://a2a-protocol.org/latest/
- xAI Grok Build plugins and marketplaces: https://docs.x.ai/build/features/skills-plugins-marketplaces
- xAI Grok Build MCP: https://docs.x.ai/build/features/mcp-servers
- Google Antigravity plugins: https://antigravity.google/docs/plugins/
- Gemini Spark custom MCP apps: https://support.google.com/gemini/answer/17209137
- Hermes Agent: https://github.com/NousResearch/hermes-agent

## Implementation truth

PR #122 merged the foundational contracts, compiler behavior, exact emitted-target provenance, symlink-safe artifact hashing, registry-bound receipts, full signed-statement digests, documented registry, checked-in portable/OpenAI/Claude skills-only manifests, tests, and GitHub workflow scaffolding.

The Phase 1 release-assurance slice adds exact vendored Agent Plugins schema pins, a fail-closed validator, docs-derived OpenAI package rules with an expiry gate, a self-contained skills-only execution boundary, source-preflight profile contract, candidate assets, CI reports, a pinned Codex loader smoke, a pinned Claude strict-validation smoke, and negative tests. It still makes zero connected-host-verified, OpenAI-reviewed, approved, published, or supported claim. Cryptographic attestation verification, real connected-account runs, and human marketplace gates remain tracked work.
