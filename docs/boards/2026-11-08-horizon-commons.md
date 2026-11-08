# Starlight Board — Horizon Commons v0.1

**Proposal.** Add `horizon-record/0.1`, a dataset record contract for Horizon material (Starlight Notes, wishes, daily-loop preference pairs), and `tools/horizon-commons/`, a fail-closed exporter that builds a Hugging Face-ready release only from records that carry the owner's consent for their exact text, an honest authorship tier, and no private data. Releases may be signed as DSSE envelopes over in-toto Statements with a new predicate type, `https://starlightintelligence.org/protocol/dataset-release/v0.1.0-proposed`. Nothing is uploaded; publishing stays a human act.

**Why the board runs.** The predicate type extends attestation rules, and the record contract constrains every vertical that later contributes Horizon data.

---

**Sovereign:** A public dataset under Frank's name is close to irreversible: once mirrored, it cannot be recalled, and today it would hold at most ten records. I accept the tooling; I do not accept a first public release until the record count, the dataset card, and an independent review justify the name on it.

**Seer:** If this works, the commons becomes training input for other people's models, and that turns every contribution into an attack surface: values-washing, coordinated poisoning, persona text dressed as human hope. The design answers with per-record consent bound to sha256, per-contributor keys, and agent-inferred text barred outright; contributor rate limits and maintainer review must land before outside contributions open.

**Harmonizer:** The audit shows we already broke a commitment: the Horizon vault declares `writers: human-pr-only`, yet `public-vault/horizon.jsonl` carries seven lines attributed to Codex, Arcanea, Lumina and Horizon. No vault declares a license, and Arcanea canon is CC-BY-NC, so it can never enter an open release. The tool refuses all of that, which is right; the vault itself still needs Frank's correction.

**Strategist:** This unlocks the one asset small labs can hold that large labs lack: consented, provenance-clean human values data, plus preference pairs that fall out of the daily loop for free. It closes off nothing we need; choosing CC-BY over NC gives up control of commercial use, which is the point if every lab is meant to train on it.

**Verifier:** The first thing that fails is supply: zero records are releasable today, and the loop has never logged a draft beside its final. The cheapest proof is ten founders running the daily loop for fourteen days with draft and final captured; if the median edit ratio is below 0.1, people are rubber-stamping and the pairs carry no signal.

**Overseer:** The load-bearing concern is integrity before volume: the dataset's only advantage is that every word is provably consented and honestly attributed, and one leaked private line or one persona row passed as human ends that advantage. The strongest case for proceeding is that this pipeline makes the dishonest release impossible to build by accident, and it costs nothing to keep local until the supply experiment reports.

**Recommendation:** PROCEED

**Rationale:** Ship the contract, gates and signed local build now with the predicate marked proposed; no public release until Frank consents and attests his own records, declares a vault license, resolves the seven persona rows, and the fourteen-day supply experiment clears its threshold.

---

Built on SIP. Layers used: attestation, file-contract, sovereignty.
