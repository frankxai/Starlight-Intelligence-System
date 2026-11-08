---
type: strategy
status: proposal
date: 2026-11-08
board: docs/boards/2026-11-08-horizon-commons.md
code: tools/horizon-commons/
---

# Horizon Commons: values data that labs can train on and verify

## Decision

Starlight's contribution to the next generation of models is three things, built
in this order: a commons of consented, provenance-honest human values records; a
stream of preference pairs that falls out of the daily Starlight loop; and an
eval, Horizon Bench, that measures whether a model leaves people more able to act
on their own. Every record carries signed consent for its exact bytes and an
honest statement of who wrote it. Volume comes last.

## Why this order: leverage per record

| What a lab consumes | Scale where it moves a model | What 108 public vault records do today |
|---|---|---|
| Pretraining text | trillions of tokens | nothing measurable |
| Supervised demonstrations | thousands of high-quality examples | a seed, at best |
| Preference pairs with a human reason | thousands; hard to collect honestly | none collected yet |
| Evals and benchmarks | one adopted benchmark shapes every model trained against it | none published |

Labs optimize toward what they measure, so an eval is the highest-leverage
artifact per byte. Preference pairs come second because they encode a human
judgement, which synthetic text cannot supply. A "benevolent corpus" aimed at
pretraining would be filtered as low-volume, unverifiable text.

## The scarce asset is proof

By 2026 labs are filtering synthetic text out of their mixes and carrying legal
risk on scraped data. What they cannot buy in bulk is a record with signed
consent for its exact text, a clear open license, and an honest authorship label.
That is the moat, and it is also the ethic: a dataset about benevolence that
quietly mixed agent text into "human hopes" would be the first thing a lab
reviewer finds and the last thing we publish.

## The loop that produces it

```text
person prompts, or agent infers from the day
        │
agent drafts a Starlight Note ──► person edits, approves, or rejects
        │                                   │
private vault (default; never leaves)       └─► (draft, final, reason) = a preference pair
        │
owner opts a record in: one ledger line = consent + license + authorship tier, bound to sha256
        │
seven gates (consent, provenance, privacy, placeholder, duplicate, substance, pair)
        │
signed release: data/train.jsonl + dataset card + manifest + DSSE envelope
        │
Hugging Face dataset (monthly, versioned)      Horizon Bench (held-out split stays private)
```

Agents inferring notes is useful exactly when each inference meets a human
decision. The edit is the signal: the agent's draft is the rejected answer, the
person's final is the chosen one, and the reason is the label. Without the human
decision it is model output feeding model training, which labs rightly discard.
The authorship tier makes the difference visible on every record.

## Authorship tiers

| Tier | Meaning | Released |
|---|---|---|
| `human-authored` | a person wrote the words | yes, with consent |
| `human-agent-co-authored` | both contributed; `fieldTiers` separates parts where the source does | yes, with consent |
| `human-edited-agent-draft` | agent drafted, person materially changed it (preference pairs) | yes, with consent |
| `agent-drafted-human-approved` | agent drafted, person approved unchanged | yes, labeled, with consent |
| `agent-inferred` | agent wrote it with no human review | never |
| `unattested` | legacy line with no declared tier | after the owner attests |

## What the first audit found (2026-11-08)

`node tools/horizon-commons/commons.mjs audit` over the repository's Horizon
material:

- 17 records, 0 releasable.
- 7 lines in `public-vault/horizon.jsonl` are attributed to Codex, Arcanea, Lumina
  and Horizon. The Horizon vault declares `writers: human-pr-only`, so these lines
  already break the vault's own contract. Some carry Arcanea canon, which is
  CC-BY-NC and cannot enter an open release.
- 10 records wait only on Frank: consent and, for 8 legacy lines, an authorship
  attestation. The audit prints their hashes.
- No vault declares a license.
- Three record formats coexist: vault markdown, `public-vault/*.jsonl`, and the
  GenCreator Vaults of Benevolence entry (`gencreator.ai/app/api/vaults/publish`).
  `horizon-record/0.1` is the convergence target; the GenCreator route should emit
  it in a later change.

## Horizon Bench

**What it measures.** Agency delta: after reading a model's answer, is the person
more able to act on their own, or more dependent on the model? It operationalizes
the test this system already uses: does this help someone build, not just
consume? A second axis, mechanism over platitude, asks whether the model can take
a stated hope and name a mechanism, a failure mode, and a signal that would show
it is not working.

**How it is built.** Items come from consented Starlight Notes and preference
pairs, rewritten as scenarios where a dependency-creating answer and a
capability-building answer are both plausible. Three human raters score blind
against a published rubric; a judge model from a different vendor than the model
under test scores in parallel. Report inter-rater agreement (Krippendorff's alpha)
with every result. A held-out split never leaves the repository, and canary
strings mark the released split so contamination can be detected. The design is
preregistered in `starlight-evals/preregistrations/` before any data is collected,
following the existing lane discipline there (no synthetic benchmarks, receipts
for every number).

## Release topology

| Layer | Where | Who can read it |
|---|---|---|
| Private vault | each person's machine; `starlight-private-memory` for Frank | owner only |
| Commons source | this repository: contract, gates, consent ledger, release builds | public, PR-reviewed |
| Dataset | Hugging Face, one organization, `horizon-commons`, monthly signed releases | public |
| Horizon Bench | `starlight-evals` + a Hugging Face Space leaderboard; held-out split stays private | public results, private items |

Default license CC-BY-4.0, CC0-1.0 allowed. No non-commercial licenses: the
commons exists so that any lab can train on it. Arcanea canon stays out.

## How a founder contributes

1. Run the daily loop in their own vault (Starlight Memory, Second Brain OS). It
   stays private by default.
2. Opt records in with one ledger line each: hash, license, tier, attribution (a
   name or `anonymous`), signed with their own Ed25519 key from
   `node protocol/sign.mjs keygen`.
3. Open a PR to the commons. CI runs the gates; a maintainer reviews.
4. Every released record names its contributor; release notes list them. A
   revocation is honored in the next release. Earlier copies cannot be recalled,
   and the contributor is told so before consenting.

Before outside contributions open: per-contributor keys verified in CI, a cap on
records per contributor per release, and a review step that samples for
coordinated or templated submissions.

## Products this sets up

- **Open:** the commons, Horizon Bench and this pipeline. Free; they earn trust.
- **Founder tooling:** the daily loop inside Starlight Memory and Second Brain OS,
  with a paid tier for teams.
- **Lab services:** consented custom preference collection with founder cohorts;
  Horizon Bench runs on private checkpoints under NDA. Priced per engagement.
  None is sold today, and no lab adoption is claimed.
- **Governance:** the benevolence-governance pack for enterprises that need the
  same consent and provenance discipline on their own data.

## What has to level up, and how we will know

A lab judges a data partner on a dataset card that states its limits, a pipeline
anyone can rerun, signed releases, decontamination, rater agreement, and the
absence of numbers nobody can check. For this program:

- **One spine.** SIS holds the contract and pipeline, `starlight-evals` holds
  Horizon Bench, one Hugging Face organization holds releases. No new repositories
  for this work.
- **Receipts.** Every number on the dataset card and the leaderboard traces to a
  file in a signed release, per the Metrics Truth Rule.
- **Independent review.** A non-Claude reviewer signs off on each release card
  before publication.
- **Vault hygiene.** Resolve the seven persona lines (Frank's call; the vault is
  append-only), and declare a license on the public vaults.

## Sequence and kill criteria

| When | Ship | Continue only if |
|---|---|---|
| Now | contract, gates, signed local build (this change) | tests pass in CI |
| Weeks 1–2 | Frank consents and attests his records; vault license declared; daily loop logs draft, final and reason | the loop captures pairs without extra effort from the writer |
| Weeks 3–6 | 10 founders × 14 days of the loop | median edit ratio ≥ 0.1 and at least half of written notes are opted in |
| Weeks 6–10 | Horizon Bench preregistered; 200 items; 3 raters | Krippendorff's alpha ≥ 0.6, otherwise redesign the rubric |
| Week 10+ | first public release (≥ 300 consented records, reviewed card); leaderboard with 3+ open models | a lab, researcher, or founder outside Starlight can rerun it from the card alone |

## Decisions only Frank makes

1. The license on the Horizon and public vaults (recommendation: CC-BY-4.0).
2. Consent and attestation for his ten records.
3. What happens to the seven persona lines.
4. The Hugging Face organization name, and who holds the release signing key.

---

Built on SIP. Layers used: attestation, file-contract, sovereignty.
