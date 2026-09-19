# Starlight Board — PR #166 (SIP graph + signed receipts) and PR #167 (attestation honesty pass)

Reviewed read-only against `SIP.md` v1.1.1, `ATTESTATIONS.md`, `.claude/commands/sip-attest.md`, and Doctrine §1/§8. `SIP.md` is byte-identical on both branches. #166 tests re-run locally: 38 pass, 0 fail, 1 skipped.

## PR #166 — SIP layer 7: evidence graph with signed, re-checkable receipts

**Sovereign:** The code is a strict addition: layers 1–6 are untouched, the licence is MIT, it has zero dependencies, and signing is offline Ed25519/DSSE/in-toto. The name is not a strict addition, though. `SIP.md` calls itself the source of truth and lists six layers, and a subdirectory calling itself "SIP layer 7" amends the spec without a version bump.
**Seer:** The private-safe default holds (Sigstore is opt-in, and the doc warns that its log is permanent). But `keygen .sip` writes the private key into the adopter's repo, and only SIS's own `.gitignore` covers `*.key`. The first adopter to leak a key will do it this way.
**Harmonizer:** COMPATIBILITY promises that both versions validate during a deprecation window. Rule C1 hard-fails any major mismatch, and no multi-version validator exists.
**Strategist:** This turns attestation from a declared label into something a stranger can check. That is the §1 compounding curve made real, and nothing else in the estate does it.
**Verifier:** INSTALL step 1 vendors 3 files into `sip/`, but step 5 runs `protocol/sign.mjs`, which needs `lib/dsse.mjs` and `conform.mjs`. The "not on the default branch yet" note says it will be removed in the commit that publishes `protocol/`, and that commit is this PR.

**Overseer:** The biggest concern is the spec-authority claim ("layer 7" without `SIP.md`). The strongest case for proceeding is that the code honestly delivers a verifiable receipt with a private-safe default.

**Recommendation:** REVISE
**Rationale:** The code is sound. The docs outrun it in five places, and one of them is a spec-authority claim.

REVISE items:
1. `protocol/README.md:9` + PR title: "SIP layer 7, the evidence graph" → "a **proposed** SIP layer 7, the evidence graph (not part of `SIP.md` until ratified by a SIP minor bump)". Ratify later as `SIP.md` v1.2.0 (additive = minor) with a changelog line, after a board review.
2. `protocol/INSTALL.md:29-33`: delete the 404 note. Merging this PR makes it false.
3. `protocol/INSTALL.md:14-17`: also copy `sign.mjs`, `verify.mjs` and `lib/dsse.mjs`. Lines 86-94: `protocol/` → `sip/`.
4. `protocol/sign.mjs:183-186`: on keygen, also write `<dir>/.gitignore` containing `sip-signing.key`. Print a note that `mode: 0o600` has no effect on Windows.
5. `protocol/COMPATIBILITY.md:154-156`: replace "during which both versions validate and the older one warns" with "v0.1.0 ships no multi-version validator; during the window publishers keep an old-major profile and consumers pin the old validator."
6. `protocol/README.md:24`: "Vendored verbatim by the explorer" → "Intended to be vendored verbatim by the site explorer (not shipped; the drift test skips until it is)."
7. (Optional) `protocol/verify.mjs:286`: guard `Array.isArray(signed.rules)` and also flag rules that were signed but are absent from the re-check.

## PR #167 — Stop calling the SIP block cryptographic; attestation is earned, not blanket

**Sovereign:** This is a reversal you can undo, and it moves toward the spec. It does not contradict `SIP.md`. It brings CLAUDE.md and the harness prompts back in line with `SIP.md:35` and `sip-attest.md:24` ("refuses … decorative"), and it stays consistent with §5.2.
**Seer:** It reverses a substrate decision that is on the record: `ATTESTATIONS.md:262,279,301` record v7.4's "ambient attestation … every output". That ledger is append-only, so the reversal needs its own entry, and a silent rule change is the kind of drift §8 names.
**Harmonizer:** The PR adds 84 references to `protocol/sign.mjs`, and that file does not exist on `main` until #166 merges. CLAUDE.md also repeats the unratified "SIP layer 7".
**Strategist:** Declining to inflate attestation protects the moat's terms (Doctrine §8: "attestation goes inflationary"). It is cheap and high-leverage.
**Verifier:** The honesty sweep misses some copy. `AGENTS.md:38` says "Verifiable attestation footer" and `AGENTS.md:135` says "cryptographic attestation". `starlight-research-attest.md:5,9`, `AGENT_REGISTRY.md:323` and `AGENT_BLUEPRINT.md:217` say "Pins digital signatures". Luminor survives on the rendered `/palace` page (`MemoryPalace.tsx:58`).

**Overseer:** The biggest concern is an attestation-rule change with no ledger entry, merged before the file it cites exists. The strongest case for proceeding is that it removes a live honesty breach from 82 agent files.

**Recommendation:** REVISE
**Rationale:** It is correct in direction, but it needs merge order, a ledger entry and a finished sweep.

**Is a SIP.md version bump needed?** No. The spec text does not change. This is SIS instance behaviour.

REVISE items:
1. Merge #166 first, then rebase #167, so no reference to `protocol/sign.mjs` dangles on `main`.
2. `CLAUDE.md:77`: "(`protocol/sign.mjs`, SIP layer 7)" → "(`protocol/sign.mjs`, the proposed SIP graph extension)".
3. Append a new `ATTESTATIONS.md` entry: "Supersedes v7.4 ambient-attestation stance (entries at lines 262/279/301): block emitted only on real SIP composition; block is a declared label, signed receipts via `protocol/`." Do not edit the old entries. Add one dated line to `site/content/changelog.md`.
4. `AGENTS.md:38`: "Verifiable attestation footer" → "Declared attestation footer (`Built on SIP`), verifiable via signed receipts in `protocol/`". `AGENTS.md:135`: "cryptographic attestation" → "SIP attestation".
5. `agents/starlight-research-attest.md:5,9`, `agents/AGENT_REGISTRY.md:323`, `docs/AGENT_BLUEPRINT.md:217`: "Pins digital signatures and cryptographic hashes onto papers" → "Pins content hashes and SIP attestation blocks onto papers". Keep "signatures" only if the agent actually calls `protocol/sign.mjs`.
6. `site/src/components/MemoryPalace.tsx:58`: remove "Luminor wisdom integration", or narrow the PR body's claim to the three files it edits.

No new sovereignty or register risk was found in either PR. The only register risk is the leftover Luminor text on `/palace` (#167 item 6).

---
**Built on SIP** · Starlight Board · 2026-09-19

## Resolution — #166 (2026-09-19)

All seven #166 items were applied in the revision commit, together with an independent code review of the signing path:

1. README and PR title now say "proposed SIP layer 7", pending ratification as SIP v1.2.0.
2. The 404 note is deleted from INSTALL.
3. INSTALL vendors all six files into `sip/`, and every command uses `sip/` paths.
4. `keygen` writes `<dir>/.gitignore` and creates the key with `flag: "wx"`, so there's no overwrite race. It prints the Windows ACL caveat with an `icacls` command, and warns on POSIX if group/other bits are set.
5. The COMPATIBILITY deprecation text now matches what C1 actually does.
6. README says the explorer's vendoring is intended, not shipped.
7. `recheckProfile` guards malformed predicates and compares rules in both directions.

Also from the code review:

- The signer and the verifier both require a *complete* PASS receipt (`receiptProblems`), not just `verdict: "PASS"`.
- The profile hash is over raw file bytes.
- A signature without a keyid falls back to trying every trusted key.
- The entry guards use `pathToFileURL`.
- A failure to write output exits 2.

Tests: 45 pass, 0 fail, 1 skipped (the explorer drift test, until `site/src/lib/generated/sip-mask.mjs` exists).
