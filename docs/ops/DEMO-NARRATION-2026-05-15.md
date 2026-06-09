# Demo Narration — Friday 2026-05-15

> Speaker notes. ~2:50 read at conversational pace. Read it out loud twice before the call; trim what doesn't land.
> **Canonical reference:** `docs/ops/prompts/starlight-v01-vision.md` — Council Doctrine + Vault Doctrine sections.

---

## Opening — 15 sec

> "What if the agent substrate was real? Local. Attested. Yours. Not a chatbot wrapped in a marketing site — a system that remembers, decides, and shows its work. That's what I want to show you. Three minutes. One window."

*Land on `http://127.0.0.1:3007/mission-control`.*

---

## Demo loop — 100 sec

**Step 1 — Mission Control.**
> "This is Mission Control. Every agent, every decision, every pending review — one window."

**Step 2 — Enter the command.**
> "I'm going to ask the substrate to scaffold a Council module. Watch the ledger."

*Run the `workpacket create` command.*

**Step 3 — WorkPacket in the ledger.**
> "There's the work packet. Title. Mission. Risk level. Allowed tools. Forbidden actions. Audit-grade from the first keystroke."

**Step 4 — AgentEvent logged.**
> "Append-only JSONL. The substrate doesn't trust agents — it makes them prove every move."

**Step 5 — Decision logged.**
> "Decisions cite the work packet that produced them. The graph stitches itself."

**Step 6 — Brain Graph.**
> "And here's the graph. Every decision lights up the brain."

**Step 7 — Council Review.**
> "Seven archetypes pressure-test every non-trivial move. Elder Father. Elder Mother. Sage. Builder-Elder. Shadow Witness. Divine Neutral Witness. Future Self at ninety. No competitor has this. Not OpenAI. Not Anthropic. Not LangChain. It's doctrine, in source, gating the agent loop."

**Step 8 — Vault Loop.**
> "Nine stages. Desire. Gratitude. Visualization. Surrender. Intuition. Aligned action. Evidence. Outcome. Optional public Proof. Every work packet enters at Desire and earns its way through the loop. This is how the system metabolizes its own history — not as a snapshot, as a sequence. With privacy classification per stage: private, private-shareable, public. The system can keep its own counsel."

**Step 9 — Pack Registry.**
> "Capabilities ship as packs. Install. Pin. Audit. The substrate stays slim; the surface grows by composition."

**Step 10 — Tooling.**
> "Claude Code. Codex. Gemini. OpenCode. Arcanea. ACOS. The substrate is the connective tissue. OpenClaw is the next bridge."

---

## The moat — 15 sec

> "Two things no one else has. Council — seven archetypes, doctrine in source, gating every move. Vault Loop — nine stages, the system's own metabolism, privacy-classified per stage. Everything else is plumbing. These two are the moat. They took years of practice to compress into a schema."

---

## Close — 15 sec

> "This is v0.1. Single laptop, no cloud, fully attested. The next move is the OpenClaw bridge — same doctrine, multi-machine. After that, the alliance protocol — same doctrine, multi-person. Same trust model end to end. That's where this goes. Questions?"

---

*Word count: ~450. Read time: ~2:55 at conversational pace.*

## Pre-demo verification — read this aloud once

The five things to test as you read:
1. Can you say "Elder Father / Elder Mother / Sage / Builder-Elder / Shadow Witness / Divine Neutral Witness / Future Self at ninety" without stumbling on the rhythm? If not, slow the cadence — three pairs and a single.
2. Can you list nine VaultLoop stages without consulting the screen? They are anchored as **D**esire → **G**ratitude → **V**isualization → **S**urrender → **I**ntuition → **A**ligned action → **E**vidence → **O**utcome → **P**roof. Mnemonic: "**D**oes **G**od **V**isit **S**uffering **I**n **A**ligned **E**xistence, **O**ffering **P**roof?"
3. Does "metabolizes its own history" land? If not, swap to "earns its own truth" or "compounds its own evidence."
4. Does the close land the productization arc? laptop → OpenClaw → alliance — three steps, three time-horizons.
5. Does any sentence feel like marketing? Cut it.

## Drift-protection contract

This narration MUST stay in sync with `src/types.ts` (`VaultLoopStage` type) and `docs/ops/prompts/starlight-v01-vision.md` (Council Doctrine + Vault Doctrine sections). If you change one, change both.
