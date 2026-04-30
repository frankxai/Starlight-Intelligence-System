# Suno Vocal Control Recipes

> Practical recipes for getting vocals to do what you want in Suno. Composes with `prompt-pattern-library.md` (vocal anchors section) and `structure-tags-reference.md` (vocal posture tags).

**Engine target:** Suno v5
**Last updated:** 2026-04-29 (v0.1 seed)

---

## Recipe 1 — No vocal at all (instrumental)

**Goal:** pure instrumental, no vocal under any circumstance.

**Recipe:**
1. Use `[Instrumental]` structure tags throughout
2. Add "no vocal" or "instrumental only" in description
3. If vocal still appears, add "instrumental, no vocal whatsoever, lyric-free"
4. Validation: listen-confirm; if vocal present, regenerate with stronger anchor

**Pairs with:** Frank Riemer (most releases), Arcanea (some), Frank's Vibes (some)

---

## Recipe 2 — Languageless choral pad

**Goal:** ambient vocal pad without distinguishable lyrics.

**Recipe:**
1. Description anchor: "languageless choral pad, vowel-based, ambient texture"
2. Structure tag: `[Choral pad]` or `[Vocal pad: languageless]`
3. Avoid: any specific language anchor (it'll attempt that language)
4. Pairs well with neo-classical and cinematic style cards

**Pairs with:** Frank Riemer (rare with disclosure), Arcanea (common), Frank's Vibes (rare)

---

## Recipe 3 — Quasi-Latin mythic choral

**Goal:** mythic-cadence choral with quasi-Latin syllable patterns.

**Recipe:**
1. Description: "languageless mythic choral, quasi-Latin syllable patterns, score-grade"
2. Structure tag: `[Choral: languageless quasi-Latin]`
3. Avoid: actual Latin lyrics (Suno will try to pronounce real words)
4. Counter-prompt for any English appearing: "no English, no real words, vowel-based"

**Pairs with:** Arcanea (primary)

---

## Recipe 4 — Chopped/processed female vocal

**Goal:** lo-fi-style chopped vocal that loops or punctuates.

**Recipe:**
1. Description: "chopped processed female vocal, languageless, lo-fi texture"
2. Structure tag: `[Vocal chops]` (Suno-specific or interpret as `[Sample: vocal]`)
3. Add: "no clear lead vocal, vocal-as-texture"

**Pairs with:** Frank's Vibes (lo-fi sub-cohort)

---

## Recipe 5 — Raw shouted vocal (punk)

**Goal:** cathartic shouted vocal preserving rawness.

**Recipe:**
1. Description: "raw shouted vocals, cathartic, minimal autotune, peak-state energy"
2. Structure tag: `[Shouted]` for chorus/peak sections
3. Avoid: "powerful vocals" (too vague), "anthemic" (gets cleaner than wanted)
4. Counter-prompt for any cleaning: "no autotune, raw vocal energy, one-take feel"

**Pairs with:** Nona (primary)

---

## Recipe 6 — Spoken word / poetry-over-music

**Goal:** spoken-word delivery, not sung.

**Recipe:**
1. Structure tag: `[Spoken word]`
2. Description: "spoken word delivery, poetic cadence, no melody on vocal"
3. Provide actual lyrics (otherwise Suno generates filler)

**Pairs with:** Nona (rare; cinematic-rebellion sub-cohort), Arcanea (rare; oracular framing)

---

## Recipe 7 — Whispered intimate

**Goal:** near-whisper intimate vocal posture.

**Recipe:**
1. Structure tag: `[Whispered]`
2. Description: "whispered intimate vocal, near-spoken, breathy"
3. Pair with quiet instrumental backing (otherwise Suno may fight with mix)

**Pairs with:** Frank Riemer (very rare, with disclosure), Frank's Vibes (occasional)

---

## Recipe 8 — Frank's voice (AI-cloned with consent)

**Goal:** Frank's own voice on a track via AI-clone.

**Recipe:**
1. Set up vocal-clone reference per Suno's voice-clone feature (consent disclosure required per `/sip-attest-audio`)
2. Description: per-track lyric guidance + persona-canon voice posture
3. Metadata: AI-clone disclosure carried per release
4. Refusal trigger: any non-Frank voice clone without consent doc on file

**Pairs with:** any label where Frank's voice persona-canon-fits

---

## Recipe 9 — Falsetto for ethereal lift

**Goal:** falsetto vocal for ethereal/lift quality.

**Recipe:**
1. Structure tag: `[Falsetto]`
2. Description: "falsetto, ethereal, head voice, lift quality"
3. Pair with sparse instrumental for clarity

**Pairs with:** Frank's Vibes (chill-house sub-cohort), Arcanea (very rare)

---

## Recipe 10 — Belted anthemic

**Goal:** powerful belted vocal for anthemic peak.

**Recipe:**
1. Structure tag: `[Belted]`
2. Description: "belted anthemic vocal, full chest voice, peak-energy"
3. Reserve for chorus/peak only; verses lower-energy posture

**Pairs with:** rare in any label; usually wrong-canon

---

## Lyric authoring discipline

When providing lyrics to Suno:

- **Length:** 2-4 verses + chorus typical; longer gets truncated
- **Per-line length:** 5-10 syllables consistent; varies by genre
- **Repetition:** chorus repeats word-for-word for cohesion
- **Rhyme:** end-rhyme common; internal rhyme advanced
- **Theme:** persona-canon-anchored (per persona's lyric DNA, in voice DNA section of CANON.md)
- **Refused:** generic-pop lyrics, AI-vocal-cloning of any non-Frank artist's lyrical style without disclosure

---

## Vocal-clone consent ledger

Per DECISIONS.md D11: vocal-impersonation refused without written consent on file.

Consent docs live at `private/consents/<voice-id>.pdf` (gitignored). Catalog row references: `vocal_consent_doc_path` field.

| Voice ID | Source | Consent doc | Status |
|---|---|---|---|
| frank-riemer-default | Frank himself | (self-consent implicit; documented in persona CANON) | Active |
| (any non-Frank voice) | (must have consent doc) | (path) | (status) |

---

## Update log

| Date | Recipe added/updated | Reason |
|---|---|---|
| 2026-04-29 | Initial 10 recipes | Phase 0 seed |
| | (to be populated as Suno vocal-control features change) | |

---

**Built on SIP** — `knowledge/suno/vocal-control-recipes.md` · v0.1 seed · 10 recipes · Vocal-clone consent ledger non-waivable
