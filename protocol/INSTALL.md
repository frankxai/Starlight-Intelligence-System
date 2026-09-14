# Adopting the SIP graph in your repository

Fifteen minutes, no dependencies, no account, nothing sent anywhere. You end with a
`sip-profile.json` in your repo and a receipt that anyone can re-verify from your bytes.

## 1 · Get the checker

Copy three files into your repo — `conform.mjs`, `lib/graph.mjs` and `lib/mask.mjs` — or vendor the
whole `protocol/` directory. Take them from a checkout rather than from a URL, so what you vendor is
pinned to a commit you can name:

```bash
git clone --depth 1 https://github.com/frankxai/Starlight-Intelligence-System.git /tmp/sip-src
mkdir -p sip/lib
cp /tmp/sip-src/protocol/conform.mjs     sip/conform.mjs
cp /tmp/sip-src/protocol/lib/graph.mjs   sip/lib/graph.mjs
cp /tmp/sip-src/protocol/lib/mask.mjs    sip/lib/mask.mjs
git -C /tmp/sip-src rev-parse HEAD > sip/PINNED_COMMIT   # what your receipt was produced by
```

Prefer git to keep the checker updatable in place:

```bash
git subtree add --prefix sip https://github.com/frankxai/Starlight-Intelligence-System.git main --squash
```

They are MIT, zero-dependency, and read nothing but the path you hand them.

> `protocol/` is not on the default branch yet, so `raw.githubusercontent.com/.../main/protocol/…`
> returns 404 (checked 2026-09-02: 404 for `protocol/conform.mjs` and `protocol/lib/graph.mjs`;
> 200 for `SIP.md`, so the host and branch path are right and only the directory is missing). Until
> it lands, clone — do not curl. This note is removed in the same commit that publishes the
> directory.

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

## 5 · Attest it

Once the receipt is PASS, the SIP attestation block (`SIP.md` layer 2) can name the graph:

```
---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.1
- Graph: sip-graph v0.1.0 · receipt <sha256 prefix> · PASS
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
