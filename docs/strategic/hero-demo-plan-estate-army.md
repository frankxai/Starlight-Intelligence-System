# Hero Demo Plan — Cross-CLI Sovereign Agent Army (R5 from 2026-06-16 Starlight Board)

**Per Board Verdict (PROCEED-WITH-REVISE R5, deadline 2026-06-23):** Produce and commit one verifiable cross-CLI hero demo (Claude Code for council/architecture + /si routing to at least one other lane e.g. Antigravity for async/browser/agent swarm + context-preserving handoff + Memory Bus recall + full /sip-attest on outputs) exercising a real (anonymized Trinity or equivalent) client workflow. Attach pilot success metrics against the world-class E2E checklist in `docs/delivery/estate-army-commissioning-workflow.md`.

This is the public proof that the "agent army" pull is real and the substrate delivers at production grade. Do not use for public positioning, README hero, or client materials until R1–R5 (and the board gates) are closed.

## Demo Concept (One Tight 60–90 Second Story)

**Title:** "Speak to my estate. It remembers. It acts. It attests."

**Narrative arc (anonymized Trinity-like or first estate client):**
1. **Setup (10s):** Show the client's Genius Profile + Freedom Path + 4-layer Blueprint (Persona: custom founder voice; Topology: hybrid council + amplification Claws mesh + Hermes retrieval; Kernel: selective advanced; Modules: core 10-IS + one domain sub-stack, e.g. Creator or Wealth).
2. **Voice trigger (15s):** User speaks a real workflow request into Voice Operator (e.g., "Synthesize the latest three weeks of research on [domain] into a decision brief with sources and contradictions flagged, then draft the first client-facing artifact in my voice").
3. **Routing & Swarm (20s):** /si router dispatches intelligently:
   - Deep synthesis / council → Claude lane (Prime + Architect + Weaver + Hermes + Sage).
   - Async research / browser actions / multi-step execution → Antigravity swarm lane (with swarm-protocol define/invoke, browser control).
   - Memory commit + cross-surface state → Memory Bus (live vault write + contradiction detection).
4. **Live output + attestation (15s):** Attested decision brief appears (with "Built on SIP" block, pinned substrate + verticals + nodes). Show Memory Bus recall of prior atoms from weeks earlier that informed the synthesis. Show the artifact in the correct vault + a sample amplification drop (if the blueprint includes public mesh).
5. **Steward / health close (10s):** Quick view of the Steward dashboard (evals score, token efficiency, drift check, self-healing note). Client (or operator) confirms they can describe the army's behavior and that the output is already in their production workflow.

**Total runtime:** Under 90 seconds. Verifiable: anyone with the repos can replay the exact steps (or watch a clean screen recording).

**Key technical beats to capture:**
- Context-preserving handoff packet from Voice Operator → /si → target lanes.
- Real parallel/iterative/swarm consensus execution (from ORCHESTRATION_ENGINE).
- Live Memory Bus write + later recall (temporal + provenance).
- Full /sip-attest (not decorative).
- Cross-CLI (Claude + Antigravity minimum; bonus if Codex or Gemini appears in the swarm).
- No mid-flight human intervention on the core loop.

## Success Metrics (Tied to World-Class E2E Checklist)

Must demonstrate:
- Client (anonymized) can describe the army's current behavior after the demo.
- Real multi-step work shipped across surfaces (voice → synthesis → memory → artifact → optional public drop) without constant babysitting.
- Memory from "prior atoms" (weeks earlier in the simulated corpus) visibly contributed.
- Full attestation survived and is human-readable.
- Measurable: routing accuracy (correct lanes chosen), first-attempt success (no retries needed on the main path), token efficiency within documented budgets, self-learning loop note generated.
- No encoded-self leakage or sovereignty boundary violations.
- The output is actually useful in the client's domain (not toy).

Attach a short JSON receipt (similar to existing arena/benchmarks style) with the above numbers + links to the exact commits/artifacts used.

## Production Steps (Executable, /si-routable where helpful)

1. **Preparation (owner: Implementer + Sentinel)**
   - Use or create a minimal anonymized Trinity/estate corpus (Genius Profile redacted, Freedom Path KEEP items as the workflow seeds, sample prior atoms in the Memory Bus).
   - Ensure current /si + cli-tool-router + antigravity harness + Memory Bus + /sip-attest are in a working state (run any quick verification from the existing test harnesses).
   - Wire a simple "demo-estate" 4-layer config (use the estate-blueprint command stub if R3 is complete, or manual for speed).

2. **Build the demo script / recording (owner: Implementer + Voice Operator specialist)**
   - Record or script the exact sequence above.
   - Prefer live if possible (clean terminal + voice + one browser pane for Antigravity).
   - Capture the handoff packet, swarm execution trace, vault write, and final attested artifact.

3. **Verification pass (owner: Verifier / Sentinel + Strategist)**
   - Replay the demo in a clean environment.
   - Confirm all success metrics above.
   - Run the world-class E2E checklist questions against the anonymized "client" (you or a colleague playing the role).
   - Generate the receipt JSON.

4. **Commit & attach**
   - Commit the recording (or clean asciinema + screenshots), the receipt, the demo-estate config files, and any minimal supporting scripts to `docs/ops/` or `artifacts/hero-demos/`.
   - Update the hero-demo-plan with the actual links and metrics.
   - Do **not** update README hero, GitHub topics, or public docs yet (gated by full R1–R5 + follow-on board verification per the verdict).

5. **Routing for execution (use /si where multi-surface)**
   - Voice Operator work → direct or Antigravity lane.
   - Orchestration / swarm protocol refinements → Claude (architecture) + Codex (implementation).
   - Visual assets for the recording (if needed) → native image tool or Higgsfield-style per the /si skill.
   - Memory Bus / attestation verification → the primary Claude session.

## Falsifiers (from Board Spirit)

- If the demo requires heavy human intervention mid-flight on routing/synthesis/memory/attestation, R5 fails.
- If metrics do not clearly beat the "world-class E2E checklist" bar (or the current substrate baseline), R5 fails.
- If encoded-self or non-attested material appears, R5 fails and must be re-run after IP tooling (P0 item 8) lands.
- Public use of the demo before R1–R5 close falsifies the overall board gates.

## Dependencies on Other REVISE Items

- R1 (Trinity extraction) provides the real patterns to make the demo non-toy.
- R2 (estate-os profile) provides the clean composition to run the demo against.
- R3 (estate-blueprint) can generate the 4-layer config used.
- P0 upgrades (Swarm Protocol, Steward layer) make the demo actually impressive.

## Next After This Demo (Post R5 Close)

- Use as the hero for README, GitHub, public explainer, and distribution (only after board gates lifted).
- Template for future estate case studies (anonymized).
- Living proof that the factory works and the substrate is the obvious choice for anyone serious about running an agent army.

**Built on SIP** — Starlight Intelligence Protocol v1.1.1

(Plan per 2026-06-16 Board R5. Execute, verify, commit — then the real marketing can begin.)

---

## Mechanical receipt (2026-06-18)

Scripted cross-CLI replay landed:

- Runbook: `docs/ops/hero-demos/RUNBOOK.md`
- Fixture: `docs/ops/hero-demos/demo-estate-trinity-anon/`
- Executor: `scripts/run-estate-hero-demo.ps1`
- Latest receipt: `docs/ops/hero-demos/receipt-20260618-155957.json`
- Synthesis artifact: `docs/ops/hero-demos/synthesis-20260618-155957.md`
- Lanes activated: grok:grok-composer-2.5-fast, codex:gpt-5.5 @ git `1a1ed53`

Public README hero / site positioning **still gated** per board. Screen recording optional follow-up.