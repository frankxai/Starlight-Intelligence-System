# Adopting the SIP graph in your repository

Fifteen minutes, no dependencies, no account, nothing sent anywhere. You end with a
`sip-profile.json` in your repo and a receipt that anyone can re-verify from your bytes.

## 1 · Get the checker

Vendor the `protocol/` directory into your repo as `sip/`. Take it from a checkout rather than
from a URL, so what you vendor is pinned to a commit you can name:

```bash
git clone --depth 1 https://github.com/frankxai/Starlight-Intelligence-System.git /tmp/sip-src
mkdir -p sip/lib
cp /tmp/sip-src/protocol/{conform,sign,verify}.mjs sip/
cp /tmp/sip-src/protocol/lib/{graph,mask,dsse}.mjs sip/lib/
git -C /tmp/sip-src rev-parse HEAD > sip/PINNED_COMMIT   # what your receipt was produced by
```

Checking needs `conform.mjs`, `lib/graph.mjs` and `lib/mask.mjs`. Signing and verifying add
`sign.mjs`, `verify.mjs` and `lib/dsse.mjs`. All are MIT, zero-dependency, and read nothing but the
paths you hand them. To update, repeat the copy from a newer checkout and commit the new
`PINNED_COMMIT` with it.


## 2 · Write a profile

Start from `fixtures/valid-profile.json` and delete what you do not have. The smallest useful
profile is one Identity, one Agent, one Claim, the Source it derives from, and a Projection —
five nodes. Add types as the questions arrive; an unused node type is noise.

Every node and edge needs the envelope: `id`, `type`, `version`, `owner`, `visibility`,
`provenance`, `evaluation`. If you cannot name an owner for something, that is a finding about
your project, not a gap in the schema.

## 3 · Check it

```bash
node sip/conform.mjs sip-profile.json --json sip-receipt.json
```

Exit 0 is PASS, 1 is FAIL, 2 is a usage or parse error. The printed receipt names every failing
element; the `--json` receipt is the machine-readable form, validated by
`receipt.v0.1.0.schema.json`.

## 4 · Gate it in CI

```yaml
# .github/workflows/sip-conformance.yml
name: SIP conformance
on: [push, pull_request]
jobs:
  conform:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: node sip/conform.mjs sip-profile.json --json sip-receipt.json
      - uses: actions/upload-artifact@v4
        with: { name: sip-receipt, path: sip-receipt.json }
```

One job, no install step, no network. If you serve your public projection as a file, add a step
that re-hashes the served bytes and compares against `profileSha256` — that is what closes the gap
between "the profile passed" and "the thing you published is that profile".

## 5 · Sign it

A receipt says what was checked. A signature says who stands behind it. Two profiles, same
receipt, pick by where the work lives:

**SIP-native (default, offline, private-safe).** Ed25519, a DSSE v1 envelope around an in-toto v1
Statement. Nothing leaves your machine and nothing is published to a log.

```bash
node sip/sign.mjs keygen .sip                            # once; writes .sip/.gitignore for the key
node sip/conform.mjs sip-profile.json --json sip-receipt.json
node sip/sign.mjs sip-receipt.json --key .sip/sip-signing.key --out sip-receipt.dsse.json
```

Publish `.sip/sip-signing.pub` next to your receipts. Anyone can then verify, offline:

```bash
node sip/verify.mjs sip-receipt.dsse.json --pub .sip/sip-signing.pub --profile sip-profile.json
```

`--profile` re-runs the check on the exact bytes and requires the same verdict and the same rule
results, so a verifier trusts the checker rather than the signer. The signer refuses anything but a
complete PASS receipt; a key holder could still sign something else with other tools, which is why
`--profile` exists.

Key custody: on macOS and Linux the key is written `0600`. Windows ignores file modes, so there the
key is protected only by its folder's ACL; `keygen` prints the `icacls` command that restricts it.

**Public (Sigstore, for public repositories).** The same receipt can be attested with GitHub
artifact attestations: Sigstore keyless signing, recorded in a public transparency log. The subject
is the profile, the predicate is the receipt:

```yaml
permissions: { contents: read, id-token: write, attestations: write }
steps:
  - run: node sip/conform.mjs sip-profile.json --json sip-receipt.json
  - uses: actions/attest@v2
    with:
      subject-path: sip-profile.json
      predicate-type: https://starlightintelligence.org/protocol/receipt/v0.1.0
      predicate-path: sip-receipt.json
```

```bash
gh attestation verify sip-profile.json --repo <owner>/<repo>   --predicate-type https://starlightintelligence.org/protocol/receipt/v0.1.0
```

Use it only where the repository and its names may be public: the transparency log is permanent.
This repository attests its own profile whenever the profile or the checker changes on main (see `.github/workflows/sip-self-receipt.yml` and `profiles/README.md`).

## 6 · Attest it

Once the receipt is PASS, the SIP attestation block (`SIP.md` layer 2) can name the graph:

```
---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.1
- Graph: sip-graph v0.1.0 · receipt <sha256 prefix> · PASS · signed <keyid prefix>
- Verticals: [...]
- Canon: [... or "none"]
- Nodes: [<sovereign contributors — SIP layer 2, not the nodes[] of your graph profile>]
Generated: <ISO date>
---
```

Do not emit the block without a current PASS. An attestation that outruns its receipt is the
failure mode this whole directory exists to make visible.

## Receipt format

See `receipt.v0.1.0.schema.json`. The fields that make a receipt worth anything:

| Field | Why it matters |
|---|---|
| `profileSha256` | Pins the exact bytes checked. Without it a receipt describes nothing in particular. |
| `tool` | A receipt is only as good as the checker named here. |
| `declaredGraphVersion` vs `sipGraphVersion` | Shows whether the profile was checked by a validator that understood it. |
| `rules[].findings` | Names the offending element, so a FAIL is actionable without re-running. |

## What adopting does not give you

Nothing is registered, listed, or verified by Starlight. There is no directory of adopters and no
badge that means anything beyond the receipt you generated yourself. The value is that your claims
carry a checkable chain — to you first, and to anyone reading your repo second.

---

**Built on SIP** · graph v0.1.0 · MIT
