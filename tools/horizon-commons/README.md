# Horizon Commons

Turns Horizon vault material into a dataset release that holds only what can be
proven: the owner consented to the exact text, the record says honestly who wrote
it, and nothing private leaks. Everything else is held back with the reason.

```bash
node tools/horizon-commons/commons.mjs audit  [--consent ledger.jsonl] [--pairs loop.jsonl]
node tools/horizon-commons/commons.mjs build  --out <dir> [--released-at 2026-11-08] \
     [--consent ledger.jsonl] [--pairs loop.jsonl] [--key sip-signing.key]
node tools/horizon-commons/commons.mjs verify <dir> --pub sip-signing.pub
node --test test/horizon-commons.test.mjs
```

Zero dependencies, offline. Nothing is uploaded: publishing a release to Hugging
Face is a separate human decision. Design and board verdict:
[`docs/strategic/2026-11-08-horizon-commons.md`](../../docs/strategic/2026-11-08-horizon-commons.md),
[`docs/boards/2026-11-08-horizon-commons.md`](../../docs/boards/2026-11-08-horizon-commons.md).

## Sources

| Source | Kind | Tier when the source declares none |
|---|---|---|
| `memory/vaults/horizon-vault.md` | `horizon-entry` | From the **From:** line; The Reasoning is AI-augmented by the vault template, so an entry with reasoning is `human-agent-co-authored`, with `fieldTiers` separating hope from reasoning |
| `public-vault/horizon.jsonl` | `horizon-wish` | `agent-inferred` for agent, brand or persona authors; otherwise `unattested` until the owner attests |
| `--pairs <loop.jsonl>` | `preference-pair` | `human-edited-agent-draft`: one line per daily-loop note, `{ prompt, draft, final, rationale?, author, agent, createdAt }` |

## The consent ledger

Only the person who owns the words writes it. One JSON line per record; later
lines override earlier ones, so `"release": false` revokes.

```json
{"sha256":"<from audit>","release":true,"license":"CC-BY-4.0","tier":"human-authored","attribution":"FrankX","grantedBy":"FrankX","grantedAt":"2026-11-08","evidence":"PR #<n>"}
```

`sha256` covers the record's kind and text, so edited words need consent again.
`tier` attests authorship for `unattested` records; it cannot make
`agent-inferred` text releasable. `attribution` may be `"anonymous"`. Allowed
licenses: CC-BY-4.0, CC0-1.0, CDLA-Permissive-2.0. Non-commercial licenses are
refused. `audit` prints the hashes waiting only on the owner's decision.

## Gates

| Gate | Holds a record when |
|---|---|
| G1 consent | no release consent for this exact text, or the license is not open for training |
| G2 provenance | the tier is unknown or unattested, the text is agent-inferred, or a human tier names an agent, brand or persona as author |
| G3 privacy | an email, phone number, secret-like token, bank account number, or private-memory reference appears |
| G4 placeholder | template or example text |
| G5 duplicate | the same text was already accepted |
| G6 substance | fewer than 40 characters |
| G7 pair | a preference pair is missing its draft or final, or the person approved the draft unchanged |

## A release

`data/train.jsonl` (records sorted by id), `README.md` (a Hugging Face dataset
card with YAML metadata), `audit.json` (counts held per gate, no held text),
`manifest.json` (sha256 of every file), and with `--key`, `manifest.dsse.json`:
a DSSE envelope (Ed25519, in-toto Statement v1) whose subjects are those files.
Keys come from `node protocol/sign.mjs keygen <dir>`. The predicate type is
proposed, not ratified.
