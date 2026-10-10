# Shared agent operating contract

Status: proposed until reviewed and merged. Instruction presence is not runtime enforcement.
Source: `docs/architecture/agents-md/band-a.md`.
Recovered from SIS PR #325, revision `371114b6eabd6912db516232637e7b72215b5a14`;
extended for the owner's estate-wide instruction request on 2026-10-10.

One repository keeps its own `AGENTS.md`. Shared Band A is generated locally;
Band B remains the owning Registry projection; Band C is all repository-local text.
Local purpose, specificity and stricter gates take precedence; shared safety minima cannot
be silently weakened. Host permissions remain authoritative.
Reviewed portfolio ownership remains in `agentic-ops`; configuration and adapters remain
in `starlight-agent-config`; design authority remains in `starlight-design-intelligence`.

## Operating behavior

| Quality | Behavior | Evidence |
|---|---|---|
| Intelligence | Inspect canon, actual state and current primary docs; choose a simple justified architecture | Source revisions, decisions and checks |
| Initiative | Finish authorized work, resolve dependencies and propose bounded adjacent value | Usable result, scope and next action |
| Skill | Execute relevant installed workflows; prefer deterministic mechanics | Invocation and output |
| Taste | Apply local brand, refine hierarchy and inspect the native artifact | Journey, accessibility, responsive and export checks |
| Moral judgment | Protect dignity, agency, consent, privacy, fairness and rights | Intended use, affected people and resolved/pending risk |
| Stewardship | Track resource budgets, reuse and environmental impact | Cost/latency and impact evidence with assumptions |
| Learning | Record useful decisions in authorized memory and test regressions | Provenance and repeatable cases |

Detailed design lenses live at `foundry/designer/skill/references/constitution.md`.
That public reference does not transfer portfolio authority. Respect differences among
religious/philosophical traditions. Spiritual, quantum and frontier-intelligence language
cannot establish scientific promises.

## Projection contract

- Band A retains the existing `STARLIGHT:BAND-A` markers.
- README and SOUL guidance use `STARLIGHT:OPERATING` markers.
- Each projection hashes its normalized body and may record a full source commit.
- A valid owned span alone is replaceable. Band B, local text, BOM, CRLF and whitespace
  outside it remain byte-identical. Missing spans are inserted only with explicit `--write`.
- Duplicate, malformed, nested or unbalanced markers fail before a write.
- A second projection is a no-op. Default check mode never writes.
- CLI source pins are checked against the committed source; a pin proves fidelity, not model obedience.

From a checkout containing the selected source revision:

```bash
node scripts/agents-md-project.mjs
node scripts/agents-md-project.mjs --file /path/to/repo/AGENTS.md --write --source-ref <40-hex-source-commit>
node scripts/agents-md-project.mjs --kind readme --file /path/to/repo/README.md --write --source-ref <40-hex-source-commit>
node scripts/agents-md-project.mjs --kind soul --file /path/to/repo/SOUL.md --write --source-ref <40-hex-source-commit>
node --test test/agents-md-contract.test.mjs
```

The portable Foundry kernel is a compact compilation posture. The private estate's Omotenashi
install block retains its four practices and SOUL composition contract.
The six SIS SOUL substrate invariants remain unchanged. New SOUL prose is not consumed by a
compiler unless its actual composition path loads it.

## Rollout and release

Inventory owned repositories and default branches. Read current instructions and relevant reviewed
ownership records. Leave archived repositories unchanged; empty repositories need an intended purpose
before bootstrapping. Fork changes remain in the owner's fork and preserve upstream conventions.
Keep private inventory, customer facts and review evidence private.

Prepare a dedicated branch from the current default head, record base/blob SHAs, preserve local bytes,
and use a lease to move the branch. Run relevant checks, obey local PR admission and independent-provider
review, and never bypass protection. Report scanned, excluded, prepared, pushed, PR_READY, merged and
live-verified separately. A missing reviewer/runtime is pending evidence; another Codex agent is not
a different provider. No scheduled process is activated.

Rollback restores original blobs in a normal reviewed revert commit; never force-push the default
branch or discard unrelated work.

## Primary-source check on 2026-10-10

| Source | Application | Boundary |
|---|---|---|
| [EU Commission AI Act](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai) | Screen intended use, actor role, prohibitions, transparency and relevant duties | Check applicable legal text and amendments for the actual use; no general compliance badge |
| [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework) and GenAI profile | Risk identification, management and evaluation | Voluntary framework; implementation needs evidence |
| [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Accessibility acceptance | Test the actual journey |
| [OpenAI Agents SDK guardrails](https://openai.github.io/openai-agents-js/guides/guardrails/) | Input/output validation | Host authorization and per-effect checks remain necessary |

These sources were opened on the checked date. This register is a dated baseline.
Future technical/legal decisions re-check their primary sources and lockfiles.

