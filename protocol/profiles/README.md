# SIS's own SIP graph profile

`sis.json` is the SIP graph profile this repository publishes about itself. It is the first real
use of the public (Sigstore) signing profile described in `../INSTALL.md` §5.

It lives here rather than in `sip/` because SIS does not vendor the checker: `protocol/` *is* the
checker, and `sip/` is the layout `INSTALL.md` gives external adopters. Keeping it under
`protocol/` also means the Protocol workflow's path filter covers it.

## What it says

14 nodes, 10 edges, all public. One Identity (Frank Riemer, the LICENSE holder), the repository and
this profile as Artifacts, five Sources, three Claims, one Evaluation, one Attestation, one
Projection. Every Claim is `derivedFrom` a Source whose locator is pinned to a commit (full sha in
`body.commit`), so each can be checked by reading one file:

| Claim | Check it against |
|---|---|
| Protocol suite runs on Node 18, 20 and 22 | `.github/workflows/protocol.yml` |
| The "Built on SIP" block is a label, not a signature | `ATTESTATIONS.md`, entry 2026-09-19 |
| The protocol toolchain has no dependencies | `grep -h '^import' protocol/*.mjs protocol/lib/*.mjs` |

The Evaluation is the conform run in `.github/workflows/sip-self-receipt.yml`. The profile says
nothing about adoption, users or other repositories.

## How it is attested

On every push to `main`, `sip-self-receipt.yml` runs

```bash
node protocol/conform.mjs protocol/profiles/sis.json --json sip-receipt.json
```

and, only if that exits 0, attests with `actions/attest`: subject = `sis.json`, predicate = the
receipt, predicate type `https://starlightintelligence.org/protocol/receipt/v0.1.0`. Pull requests
run conform only; nothing is signed.

## Verify it

From a checkout of `main` (the `.gitattributes` here keeps the file LF, so the digest matches on
Windows too):

```bash
gh attestation verify protocol/profiles/sis.json \
  --repo frankxai/Starlight-Intelligence-System \
  --predicate-type https://starlightintelligence.org/protocol/receipt/v0.1.0
```

This proves the bytes you hold were checked by this repository's CI and got a PASS receipt. It does
not prove the claims are true — that is what the Sources are for. To re-check the verdict yourself,
run `node protocol/conform.mjs protocol/profiles/sis.json`; the `sha256` it prints equals the
attestation's subject digest.

Editing `sis.json` changes its digest: older attestations stay valid for the old bytes and a new
one is made on the next push to `main`.

---

**Built on SIP** · graph v0.1.0 · MIT
