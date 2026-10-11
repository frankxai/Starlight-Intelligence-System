# Board decision: Starlight Capability Foundry

Date: 2026-08-31  
Decision: PROCEED WITH CONDITIONS  
Scope: cross-ecosystem capability release, validation, evidence, distribution, and continuous refinement

## Decision question

Should Starlight make cross-ecosystem skill/MCP/plugin/app/custom-agent packaging and release assurance a key product, and should the current Foundry become its canonical platform layer?

## Options reviewed

| Option | Description |
|---|---|
| A | Keep Foundry as internal tooling and ship each ecosystem manually |
| B | Build a generic marketplace first |
| C | Build Capability Foundry as the release/assurance plane; add Exchange after reliability |
| D | Standardize only on MCP and ignore host-native packaging |

## Board perspectives

| Perspective | Finding |
|---|---|
| Venture | Multi-host release pain is real and recurring; assurance is a sharper wedge than a broad catalog |
| Platform | One portable source plus explicit adapters prevents repository and semantic fragmentation |
| Developer ecosystem | Agent Plugins 1.0.0 is the best portable core, but native overlays and host tests remain necessary |
| Security/provenance | Receipts, secret isolation, permission review, redaction, SBOM, and authenticated attestations are mandatory |
| Operations | P0 must be narrow; real clean-install and update/uninstall runners determine margin |
| GTM | Sell launch and ongoing release confidence to existing capability vendors before self-serve marketplace supply |
| Red team | The largest risk is false compatibility/support claims created from package shape or screenshots alone |

## Scoring

Scale: 1 poor, 5 strong.

| Criterion | A Manual | B Marketplace first | C Foundry release plane | D MCP only |
|---|---:|---:|---:|---:|
| Customer pain | 2 | 3 | 5 | 3 |
| Differentiation | 1 | 2 | 5 | 2 |
| Technical leverage | 1 | 3 | 5 | 4 |
| Trust and defensibility | 1 | 2 | 5 | 2 |
| Near-term feasibility | 3 | 2 | 4 | 4 |
| Enterprise path | 1 | 3 | 5 | 3 |
| Scope control | 2 | 1 | 4 | 3 |
| Weighted conclusion | 1.6 | 2.3 | 4.8 | 3.0 |

## Verdict

Choose option C.

Capability Foundry becomes the canonical Starlight product layer for:

- portable capability contracts;
- deterministic host packaging;
- runtime and authentication policy;
- clean install and lifecycle validation;
- screenshots, recordings, traces, logs, and listing evidence;
- expiring platform receipts;
- drift detection and smallest-layer repair;
- receipt-derived GTM and, later, Exchange catalog state.

The marketplace is a downstream distribution product. It does not become the source of truth.

## Conditions

1. No public verified, published, or supported claim without a current receipt.
2. Structural schema validation must never be described as cryptographic signature verification.
3. Human consent, legal, billing, privacy, and final marketplace submission remain human gates.
4. P0 is OpenAI/ChatGPT/Codex, Claude, Cursor, and VS Code/Copilot.
5. starlight-creator-mcp is the first reference runtime.
6. SIS remains the contract authority; AIS consumes receipts.
7. Third-party publisher and license provenance are explicit.
8. Packages and evidence contain no secrets or customer data.
9. Exchange discovery work waits for the 90-day reliability gates.
10. Each host surface can be paused or retired independently.
11. OpenAI directory publication, ChatGPT runtime, and Codex runtime have separate evidence and receipts.
12. The OpenAI projection does not sell or promote Starlight digital services, subscriptions, credits, or upgrades under current policy.
13. Starlight evidence renders as `Tested by Starlight`; it never implies OpenAI verification, endorsement, or support absent explicit host evidence.
14. No-UI packages submit no screenshots; internal evidence, reviewer recordings, and public screenshots remain separate artifact classes.

## Post-merge checkpoint — 2026-09-01

PR #122 merged the authorized foundation. The next release-assurance slice is authorized to add pinned portable validators, freshness-bounded docs-derived host preflight, a source preflight-profile contract, truthful package metadata, CI evidence, and negative tests. It is not authorized to connect accounts, create paid infrastructure, change verified legal identity, submit to a marketplace, or publish a public support claim.

## Immediate authorization

Authorized in this foundational slice:

- contracts and machine-readable registry;
- portable/OpenAI/Claude skills-only package scaffolding;
- compiler safety and target-gating changes;
- local conformance/invariant tests;
- GitHub workflow and issue template;
- architecture, GTM, roadmap, and Codex handover;
- creation of review PR and implementation issues.

Not authorized by this decision alone:

- production credentials;
- paid infrastructure;
- connected-account consent;
- marketplace submission or publication;
- public support badges;
- merging the PR;
- production deployment.

## Proof gates

### Founder-led market-test authorization

The Board authorizes one bounded fourteen-day Launch Sprint sales test. It authorizes discovery, direct proposals, and invoicing; it does not authorize public compatibility claims, connected-account actions without consent, marketplace submission, or a promise of host approval.

| Element | Authorized test |
|---|---|
| Accountable owner | Frank Riemer; Navigator and the GTM owner maintain the scorecard, while Orchestrator coordinates delivery and Sentinel/Evaluator retain independent security and claim gates |
| Beachhead | Teams with a working MCP/agent capability, explicit demand for at least two P0 surfaces, a reachable buyer, and safe staging access |
| First-ten gate | Privately score a candidate pool and select only accounts that meet all qualification signals; do not invent, publish, or imply customer names |
| Price/payment hypothesis | EUR 10,000–15,000 fixed for one bounded capability sprint; 50% on signed kickoff and 50% on agreed evidence-package delivery; direct B2B invoice outside host plugins |
| First 72 hours | Lock a qualified cohort of up to ten, message every qualified account through warm introductions first, and offer five release-readiness review slots |
| Day-14 pass | At least four qualified conversations, two scoped proposals, and one signed sprint with the kickoff payment received |
| Revise/stop | Revise when pain is confirmed without payment; stop or narrow when fewer than three qualified accounts engage, approval guarantees are required, or expected delivery exceeds 60 operator hours |

The price, conversion targets, and named cohort are hypotheses until the experiment produces evidence. A verbal commitment is not a commercial pass.

### Pilot ownership and response model

The detailed assignment table lives in the product specification. During the pilot, Frank owns portfolio, GTM, spend, and public human gates. `starlight-architect` leads contracts/runtime design, `starlight-hermes` monitors official sources, `starlight-sentinel` leads security review, `starlight-orchestrator` coordinates host runs and drift, and `starlight-evaluator` supports independent receipt review. Every release issue must name a human adapter owner, host operator, verifier, and backup before work starts. Critical security findings block immediately; suspected P0 policy breaks receive human triage within four working hours; failed required checks receive a repair owner within one business day; affected critical claims downgrade within one hour. These are internal targets, not contractual customer SLAs, and no surface may become `supported` until a staffed support rota accepts its SLA.

### 14-day gate

- pinned upstream/native validators in CI;
- authenticated attestation verifier;
- production-shaped starlight-creator-mcp staging runtime;
- one clean host runner;
- evidence redaction and durable storage design;
- four qualified design-partner conversations and two scoped proposals;
- the founder-led market test reaches its explicit pass threshold or records a Board-visible revise/stop decision; no product automation is justified by activity alone.

### 30-day gate

- first complete P0 reference release candidate;
- support-state indexing in AIS;
- marketplace submission kits reviewed;
- measured runner labor and failure modes.

### 90-day gate

Proceed toward Exchange only if the spec’s receipt coverage, install reliability, update/uninstall, privacy, design-partner willingness-to-pay, and margin gates pass.

## Kill or narrow triggers

- host testing cannot be made repeatable;
- fewer than two design partners complete P0 verification;
- evidence handling creates unacceptable privacy risk;
- host review/policy dependencies dominate the value;
- repeated adapter labor prevents viable gross margin;
- public claims cannot be kept receipt-backed.

## SIP attestation

The decision preserves capability-first architecture, deterministic contracts, least privilege, evidence before promotion, explicit human authority, and ratified evolution. It changes no substrate contract; it extends the Foundry operational/release layer.
