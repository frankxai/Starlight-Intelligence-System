# SIP graph — public/private projection rules (v0.1.0)

A sovereign node keeps one graph and shows different parts of it to different audiences. The
`Projection` node type is how that is declared, and rules P1–P5 are how it is checked.

The failure this exists to prevent is not "someone published the wrong file". It is the quieter
one: a public page that renders an evidence chain which *looks* complete while a link in it was
silently dropped, or a node whose owner-only annotations rode along in the same JSON object as
the part meant to be public.

## The visibility lattice

```
public  ⊂  alliance  ⊂  private  ⊂  secret
```

Widest first. Every node and edge carries exactly one level. `secret` means the element is never
projected to anyone — it exists in the graph so that references to it resolve, not so it can be
shown.

## A projection

```json
{
  "type": "Projection",
  "body": {
    "audience": "public",
    "include": ["sip:claim:...", "sip:source:..."],
    "redacted": ["sip:edge:..."],
    "redactFields": ["sip:claim:..."]
  }
}
```

- `include` — the node ids this audience sees.
- `redacted` — edge ids that cross the boundary. Declaring them is what keeps a truncated chain
  visibly truncated.
- `redactFields` — node ids whose `private` block is stripped on the way out.

## The rules

**P1 · A projection never widens a node or edge past its visibility.**
An `alliance` node cannot appear in a `public` projection. Neither can an `alliance` *edge*: an edge
whose two endpoints are both included is published in the same JSON as those endpoints, so it is
checked with them. This is the obvious rule and the one most easily broken by hand-maintained
include lists.

**What "projected" means.** For P1, P3 and P4 the projected set is: every id in `include`, plus
every edge whose `from` and `to` are both in `include` and whose id is not in `redacted`. Edge
envelopes and edge `provenance` are scanned exactly like node bodies.

**P2 · Boundary-crossing edges are declared, not silent.**
If an edge has one endpoint inside the projection and one outside, its id must appear in
`redacted`. A reader then sees *that* a link was withheld, not a chain that appears to end
naturally. This is the difference between a redaction and a lie by omission.

**P3 · Owner-only fields are stripped or explicitly redacted, at any depth.**
A node or edge may carry a `private` object. If it is projected to an audience wider than
`private`, the projection must list it in `redactFields` — which strips the top-level block — or
fail. The same check runs for any key named `private`, `secret` or `credentials` at any depth,
inside nested objects and array elements alike; `redactFields` does not reach those, so a nested
one has to leave the graph. There is no implicit stripping: the intent to strip is recorded in the
profile, so it can be reviewed.

**P4 · Nothing credential-shaped reaches a public projection.**
Every node and every published edge in a `public` projection is scanned, after `redactFields`
stripping, for PEM private key headers, provider-style secret keys, GitHub and Slack tokens, AWS
access key ids, JWTs, and long high-entropy base64 blobs. A hit fails the profile. Two shapes are
explicitly *not* hits: a bare 64-character lowercase sha256 digest, and a `sha256:`-prefixed one.
Pinning content by hash is the discipline `INSTALL.md` asks for, and the first cut of this rule
rejected the adopters who followed it.

**P5 · A public reader can resolve every owner they are shown.**
If a node is public, the Identity that owns it must be public too. Otherwise the reader is shown
work whose decision rights they cannot attribute — which defeats SIP layer 5 clause 1
(sovereignty) at exactly the point where it matters.

## What these rules do not do

They check the profile, not the deployment. A profile can pass every rule and the publisher can
still serve a different file. The receipt pins the sha256 of the bytes that were checked; matching
that against what is actually served is the publisher's CI job, and `INSTALL.md` shows the shape
of it.

They also do not attempt semantic secrecy. A `public` claim whose `statement` field paraphrases
private information passes P1–P5. Shape-checking finds credentials; it does not find indiscretion.

---

**Built on SIP** · graph v0.1.0 · MIT
