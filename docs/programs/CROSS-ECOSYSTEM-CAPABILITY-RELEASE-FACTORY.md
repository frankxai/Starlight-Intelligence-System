# Cross-Ecosystem Capability Release Factory

Status: decision record and implementation handover  
Date: 2026-08-31  
Owner: Starlight Foundry + Starlight Agentic OS  
First proving release: Starlight Google AI

## Executive decision

This becomes a key Starlight B2B capability, but not a new repository or a new consumer brand.

The product promise is:

> Define one governed capability, compile it into every supported AI ecosystem, prove it in each host, and publish an inspectable evidence dossier.

The existing estate already contains most of the required system. The work is convergence, adapter completion, deployment, and proof. Do not create another foundry, registry, skill store, MCP framework, or marketplace source of truth.

Google AI Studio is a prototyping and credential surface. It is not a plugin marketplace. The Google product is the Gemini API provider inside a shared MCP runtime, plus a Gemini CLI extension projection.

## Canonical ownership

| Concern | Canonical repository | Responsibility |
|---|---|---|
| Contracts, deterministic compilation, governance, proof | [Starlight-Intelligence-System](https://github.com/frankxai/Starlight-Intelligence-System) | Task envelopes, plugin packs, compiled packages, adapters, evidence receipts |
| Release lifecycle, registry, index, syndication | [starlight-agentic-os](https://github.com/frankxai/starlight-agentic-os) | Install → improve → indexed → registered, release queue, public status |
| Portable skills | [starlight-agent-skills](https://github.com/frankxai/starlight-agent-skills) | Canonical SKILL.md procedures and provenance |
| Executable Google/provider runtime | [starlight-creator-mcp](https://github.com/frankxai/starlight-creator-mcp) | Google GenAI client, live model catalog, generation, embeddings, media operations |
| Independent eval authority | [starlight-evals](https://github.com/frankxai/starlight-evals) | Cross-host conformance, golden scenarios, regression thresholds |
| Governed team execution | [starlight-swarm](https://github.com/frankxai/starlight-swarm) | Release team topology, bounded parallel execution, termination |
| Private install and trust truth | ai-capability-registry + starlight-agent-config | Credentials, installed versions, host policy, fleet state |
| OpenAI runtime baseline | [SIS PR #119](https://github.com/frankxai/Starlight-Intelligence-System/pull/119) | Authenticated Cloudflare MCP, Apps UI, Supabase, CI/deploy |
| Arcanea-branded catalog | [arcanea-marketplace](https://github.com/frankxai/arcanea-marketplace) | Generated distribution projection only |
| Public product and evidence catalog | Starlight site | Mobile-first live listings, source, PR, evidence, install and marketplace status |

Derived marketplaces and host packages are projections. They must never become canonical sources.

## Shared architecture

The portable core is the existing tripod:

1. Memory and project context: AGENTS.md, with host aliases where required.
2. Procedures: portable SKILL.md packages.
3. Tools: one remote MCP runtime, with local stdio support for development.

Around that core, Foundry compiles thin host adapters:

- OpenAI/ChatGPT/Codex plugin package and optional MCP Apps UI.
- Claude Code plugin and marketplace entry.
- Gemini CLI extension.
- GitHub Copilot CLI plugin and marketplace entry.
- Hermes portable plugin/profile.
- Grok remote MCP connection release.
- Manus custom MCP connection release.
- Custom GPT compatibility profile only when a distinct GPT front door has product value.

A Custom GPT is not a second backend. It uses the same remote MCP service, authentication, prompts, and evidence. It is a distribution shell.

## Platform support matrix

| Target | Official extension surface | Factory output | Automated proof | Human/account boundary |
|---|---|---|---|---|
| ChatGPT + Codex | Universal plugin: skills, MCP, optional MCP Apps UI | Plugin manifest, skills, MCP metadata, listing packet | Validator, MCP contract, UI build, scenario evals | OpenAI login, OAuth/provider approval, public submission and review |
| Claude Code | Plugin plus Git-hosted marketplace | .claude-plugin manifest, skills, agents/hooks when justified, MCP config | Strict plugin validation, CLI smoke test, scenarios | Claude login/subscription, organization policy, optional official curation |
| Gemini CLI | gemini-extension.json, skills, commands, hooks, MCP | Gemini extension and gallery metadata | Link/install test, tool discovery, scenarios | Google login/API billing, public-repository decision |
| Google AI Studio | No plugin marketplace | Prompt/eval workspace only; Gemini API remains provider | API integration and prompt eval | Key creation, billing, OAuth/Cloud consent |
| GitHub Copilot | CLI plugin, skills, MCP, Git-hosted marketplace | plugin.json, skills, MCP config, marketplace entry | CLI install, skill/tool discovery, scenarios | Copilot plan/login and organization MCP policy |
| Grok/xAI | Remote MCP in API, Grok, and Grok Build | Remote connection descriptor, API fixture, listing collateral | Remote MCP API test and scenarios | xAI credits, Grok login, connector setup, catalog decision |
| Manus | Custom remote MCP connector | Connection descriptor, connector test plan, listing collateral | MCP contract and Manus API task test when token exists | Manus plan/login, connection test, OAuth/credential grant |
| Hermes Agent | Portable plugin or native Python plugin | plugin.json, skills, mcp.json/profile | Install/enable/list, tool discovery, scenarios | Host install, user enablement, secrets, optional PyPI ownership |

No target is labeled shipped until its host evidence URL exists.

## Required contract changes

Extend the SIS plugin pack contract without weakening current subset and permission checks.

Each release pack must carry:

- capability ID and semver;
- canonical source commit and artifact digests;
- runtime endpoint identity and transport;
- local and remote MCP modes;
- authentication type per host;
- portable skills and optional UI resources;
- target adapters with status: planned, compiled, validated, host-tested, submitted, published, blocked;
- marketplace listing copy, icons, screenshots, starter prompts, privacy and support URLs;
- explicit human gates;
- required evidence lanes and freshness;
- cost, latency, and model/provider policy;
- provenance, license, terms, data classes, and retention;
- rollback and revocation plan.

Add first-class target identifiers for chatgpt, codex, claude-code, gemini-cli, github-copilot, grok, manus, and hermes. Retain generic MCP as the interoperable runtime target.

The compiler must fail closed when:

- a remote-only target has no deployed HTTPS MCP endpoint;
- OAuth is required but discovery/registration metadata is absent;
- a manifest expands permissions beyond the Task Envelope;
- tool annotations do not match actual side effects;
- a listing claims published without an inspected public URL;
- screenshots or recordings do not bind to the tested commit and host;
- evidence is stale;
- secrets appear in source, generated artifacts, logs, screenshots, or fixtures.

## Release pipeline

### 1. Intake

Create one Task Envelope and one release pack. Name the user workflows, not the provider APIs. For Starlight Google AI the initial workflows are:

- discover models actually available to the connected account;
- route text, multimodal, embedding, and media tasks by capability and policy;
- compare prompts across eligible models;
- save prompt versions, run scored evaluations, and retrieve proven patterns;
- expose search and fetch for compatible knowledge workflows.

“All Google APIs” is not a safe tool surface. New API families are added as bounded modules only after scopes, side effects, quotas, and tests exist.

### 2. Runtime

Place reusable Google API code in starlight-creator-mcp. Keep provider logic separate from host manifests and UI. Use live model discovery; never hard-code “all models available.” Availability depends on account, region, API version, preview access, and billing.

Use Supabase or the canonical Starlight memory boundary for durable prompt intelligence. Store:

- prompt template and version;
- task class and test input;
- provider/model and parameters;
- output reference or digest;
- latency and cost;
- automated and human scores;
- evaluator version;
- accepted/rejected rationale;
- provenance and timestamp.

Do not turn raw conversations or provider outputs into ratified knowledge automatically.

### 3. Compile

SIS Foundry compiles the canonical release pack into target-specific projections. Generated output is reproducible and disposable. Hand edits to generated marketplaces are drift and must fail CI.

Priority adapter work:

1. finish OpenAI runtime PR #119 and use it as the remote MCP/auth/UI baseline;
2. add GitHub Copilot adapter and harness;
3. add Manus connection adapter and harness;
4. update Grok adapter to official remote MCP behavior;
5. emit a complete Gemini CLI extension;
6. align Hermes output with its current portable plugin contract;
7. produce Claude and OpenAI marketplace manifests from the same listing source.

### 4. Static and contract proof

Required on every commit:

- schema validation;
- manifest validation per host;
- portable skill validation;
- MCP initialize/list-tools/call-tool contract tests;
- tool annotation and side-effect audit;
- auth-negative tests;
- secret scan, dependency audit, license/provenance scan;
- deterministic compilation and digest verification;
- generated-output drift check.

### 5. Live host proof

Every target receives a bounded test account and the same scenario corpus. Record:

- host and client version;
- capability/release version;
- exact source commit;
- install/connect method;
- tools and skills discovered;
- scenario inputs and normalized outcomes;
- permissions presented;
- latency/cost;
- defects and remediation round;
- final verdict.

Maximum two remediation rounds per target. If still failing, mark blocked and continue other independent targets; do not silently lower the acceptance bar.

### 6. Evidence media

The Evidence Producer captures a small marketplace-ready dossier after the host test passes:

- one clean installation/connection screenshot;
- one capability discovery screenshot;
- one successful representative workflow screenshot;
- one 20–45 second recording for interactive/UI products;
- alt text, captions, dimensions, host/version, source commit, and capture date;
- redaction proof;
- evidence receipt linking the media digest to the host result.

Media is proof, not decoration. Never capture secrets, email addresses, tenant data, access tokens, hidden prompts, or customer content.

### 7. Submission and publication

Submission is a state machine:

planned → compiled → validated → host-tested → listing-ready → submitted → published → monitored

A marketplace URL is recorded only after it is opened and inspected. “Submitted” and “published” are never synonyms.

### 8. Continuous refinement

Run four loops:

- dependency and platform-doc drift: weekly;
- contract and cross-host conformance: on every release and nightly for canaries;
- prompt/model evaluation: on model catalog changes and prompt version changes;
- marketplace/status verification: daily for live releases.

A failed loop opens or updates one canonical issue. It does not produce duplicate repositories or speculative rewrite PRs. Promotion requires fresh evidence; rollback remains available.

## Agentic release team

Use a manager-worker topology with explicit write partitions.

| Role | Owns | May write |
|---|---|---|
| Release Director | Scope, sequencing, target status, conflict resolution, stop decision | Release pack, status ledger, synthesis |
| Capability Architect | User workflows, tool boundaries, contracts | Task Envelope and contract proposal |
| Runtime Builder | Google/provider MCP implementation | Runtime repository only |
| Adapter Builders | One host adapter each | Assigned adapter and fixtures only |
| Security/Auth Critic | Threat model, scopes, privacy, negative tests | Findings and gate proposal; no production secrets |
| Independent Verifier | Golden scenarios, conformance, verdicts | starlight-evals and evidence receipts |
| Host Operators | Install/connect/test in actual hosts | Host receipts and defect reports |
| Evidence Producer | Screenshots, recordings, listing packet | Evidence/media directory only |
| GTM Publisher | Catalog page, release notes, marketplace copy | Public listing projection only |

The Release Director owns conflicts. Shared state is append-only evidence plus the release status ledger. Builders do not approve their own target. Marketplace account actions and irreversible publication remain human-gated.

## Execution boundary: what Codex can do from ChatGPT Work

Can execute here when repository access and credentials are connected:

- inspect the GitHub estate and official platform docs;
- design contracts and repository boundaries;
- create branches, files, commits, issues, and pull requests;
- implement MCP servers, skills, manifests, UI, tests, CI, and deployment configuration;
- run local static, unit, integration, and protocol tests;
- use connected deployment providers and APIs within existing authorization;
- run browser verification and capture evidence when a signed-in host is available;
- maintain status dashboards, evidence receipts, changelogs, and handover prompts.

Conditional on credentials, provider connection, or an authenticated browser:

- deploy Cloudflare/Vercel/GCP services;
- call paid Google, xAI, Anthropic, or OpenAI APIs;
- configure OAuth clients, callbacks, domains, and secrets;
- install and test inside vendor hosts;
- capture signed-in screenshots and recordings.

Must stop for the human:

- accepting vendor terms, paid plans, or material spend;
- identity, KYC, domain, organization, or developer-account verification;
- OAuth consent and production app verification;
- marketplace submission attestations and final publish clicks where the platform requires the owner;
- legal/privacy/security signoff;
- destructive production actions;
- secrets not already configured in an approved task-relevant store.

## Product and GTM

Position this as Starlight Foundry’s Release Fabric, not another general “AI agent marketplace.”

Beachhead customer:

- an AI-native software company, agency, or platform team;
- already has one useful MCP server, skill pack, or agent workflow;
- needs distribution across three or more ecosystems;
- lacks a repeatable compliance, testing, evidence, and marketplace process.

Core offer:

1. Open capability contract and local validator.
2. Managed cross-ecosystem release: compile, harden, test, and produce the evidence dossier.
3. Continuous compatibility: platform drift, model drift, evals, and marketplace maintenance.
4. Enterprise control plane: private registry, policies, approvals, fleet status, and audit evidence.

The moat is not manifest generation. It is the accumulated conformance corpus, host adapters, evidence graph, security policy, release telemetry, and prompt/model performance knowledge.

Validate product-market fit before making a separate standalone brand:

- three external design partners;
- each ships one capability to at least three hosts;
- median time from canonical pack to listing-ready under five working days;
- at least 80% of adapter output generated without hand edits;
- at least one customer renews for continuous compatibility;
- no false published claims and no credential leak.

## Delivery order

### Now: close the OpenAI baseline

- Complete deployment/auth/live ChatGPT host-loop evidence for [PR #119](https://github.com/frankxai/Starlight-Intelligence-System/pull/119).
- Do not build a second ChatGPT runtime.
- Keep the PR draft until the remote endpoint, auth, Developer Mode scan, UI, and negative cases are evidenced.

### Next 14 days: one proving release

- Define Starlight Google AI as the first canonical release pack.
- Reuse the Google provider in starlight-creator-mcp.
- Move prompt evaluation cases into starlight-evals.
- Compile OpenAI, Claude, Gemini, Copilot, and Hermes projections.
- Deploy one authenticated remote MCP endpoint.
- Connect and test Grok and Manus against the same endpoint.
- Generate the first complete evidence dossier and mobile catalog page.

### Days 15–30: make it repeatable

- Add release-pack state to starlight-agentic-os registry.
- Implement deterministic adapter generation and drift detection.
- Add marketplace listing schema and evidence-media schema.
- Add authenticated host runners where vendors allow automation.
- Add a public status view with live GitHub, PR, evidence, and marketplace links.

### Days 31–90: prove the product

- Onboard three design partners.
- Measure time-to-release, manual steps, defect escape, evidence freshness, and renewal.
- Publish the open validator and selected adapters.
- Keep production credentials, fleet topology, customer data, and trust state private.
- Decide after evidence whether Release Fabric becomes a separate product surface.

## Codex continuation prompt

Use the following prompt from the root of Starlight-Intelligence-System:

    Continue the Cross-Ecosystem Capability Release Factory program defined in
    docs/programs/CROSS-ECOSYSTEM-CAPABILITY-RELEASE-FACTORY.md.

    Start by reading AGENTS.md, CLAUDE.md, the Foundry architecture, current contracts,
    tools/foundry, src/adapters, PR #119, and the linked canonical sibling repositories.
    Inspect current main and all relevant open PRs before editing. Do not create a new
    repository, foundry, registry, MCP framework, or duplicate ChatGPT runtime.

    Objective: ship Starlight Google AI as the first evidence-backed release compiled
    from one canonical capability into ChatGPT/Codex, Claude Code, Gemini CLI,
    GitHub Copilot, Hermes, Grok, and Manus.

    Required sequence:
    1. Produce an observed-state report mapping reusable Google code in
       starlight-creator-mcp, the OpenAI cloud baseline in PR #119, current Foundry
       contracts/adapters, Agentic OS registry, skills, and evals.
    2. Propose the smallest versioned contract changes for release targets, listing
       metadata, host evidence, media evidence, status, and remote MCP authentication.
    3. Finish or explicitly block PR #119 using live deployment and ChatGPT host-loop
       evidence. Do not claim success from local tests alone.
    4. Implement missing or stale adapters: GitHub Copilot and Manus first-class;
       Grok official remote MCP; complete Gemini extension; current Hermes portable
       plugin; shared Claude/OpenAI listing projection.
    5. Build the Starlight Google AI release pack using the provider runtime from
       starlight-creator-mcp. Use live model discovery. Do not promise every Google API
       or hard-code all models. Add API families only as governed modules.
    6. Put cross-host golden scenarios and regressions in starlight-evals. Builders
       may not approve their own target.
    7. Compile, validate, deploy, host-test, and produce redacted screenshots or short
       recordings tied to exact commits and receipts.
    8. Write release state and inspected live URLs to starlight-agentic-os. Project
       thin generated packages to marketplaces. Never hand-maintain projections.
    9. Publish a mobile-readable catalog/evidence page with GitHub, PR, evidence,
       install, submission, and marketplace links. Never point users to sandbox files.
    10. Stop at credential, billing, OAuth consent, legal attestation, marketplace
        owner submission, or destructive production gates and state the exact human
        action needed.

    Use a Release Director with partitioned Runtime, Adapter, Security, Verification,
    Host Operator, Evidence, and GTM workers. Maximum two remediation rounds per host.
    Maintain append-only receipts and an honest state machine:
    planned → compiled → validated → host-tested → listing-ready → submitted →
    published → monitored.

    Acceptance:
    - one canonical release pack and reproducible adapter outputs;
    - remote MCP protected by appropriate authentication;
    - contract/static/security tests green;
    - same golden workflows pass in every target marked host-tested;
    - every published claim has an inspected live URL and fresh evidence receipt;
    - screenshots/recordings are redacted and commit-bound;
    - no duplicate authority, no secrets in Git, no sandbox-only handoff;
    - PRs remain draft until their real external gates are satisfied.

## Immediate non-goals

- Building a universal proxy for every Google API.
- Forking stale gemini-arcanea code as the new source.
- Treating AI Studio as a marketplace.
- Creating another marketplace repository.
- Claiming Grok or Manus public marketplace publication when only a private connector was tested.
- Fully autonomous marketplace publication or paid API spend.
- Replacing platform-specific UX with lowest-common-denominator behavior.
