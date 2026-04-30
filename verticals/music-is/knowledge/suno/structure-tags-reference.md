# Suno Structure Tags Reference

> Suno-specific syntax for sectional control. Tags affect generation arc, vocal posture, instrumental focus.

**Engine target:** Suno v5
**Last updated:** 2026-04-29 (v0.1 seed; verify against Suno's current documentation per Phase 1)

---

## Section tags

| Tag | Use | Notes |
|---|---|---|
| `[Intro]` | Opening section | 4-12 bars typical; sets sonic anchor |
| `[Verse]` | Verse section | Suno generates verse-appropriate dynamics |
| `[Pre-Chorus]` | Build to chorus | Tension/lift before chorus drop |
| `[Chorus]` | Chorus / refrain | Highest dynamic peak typical |
| `[Bridge]` | Bridge section | Departure from main material |
| `[Instrumental]` | Instrumental break | No vocal in this section |
| `[Solo: piano]` / `[Solo: strings]` / `[Solo: guitar]` | Instrument focus | Specifies which instrument carries |
| `[Build]` | Build-up section | Tension growth |
| `[Drop]` | Electronic-style drop | Releases tension; high dynamic |
| `[Breakdown]` | Energy reduction | Strip-back; pre-final-chorus often |
| `[Outro]` | Closing section | Decay or fade or final statement |
| `[Hook]` | Repeated hook section | Catchy, often vocal-led |

---

## Vocal posture tags

| Tag | Use |
|---|---|
| `[Whispered]` | Intimate, near-spoken |
| `[Spoken word]` | Spoken-not-sung |
| `[Belted]` | Powerful, anthemic |
| `[Shouted]` | Cathartic, peak-state (punk/alt) |
| `[Screamed]` | Hardcore peak (use sparingly; rare in catalog) |
| `[Falsetto]` | Falsetto vocal |
| `[Choral]` | Group/choir vocals |
| `[Languageless]` | No discernible language; vowel-based |

---

## Composition pattern (typical structures)

### Pop-adjacent (4-section)
```
[Intro] [Verse] [Chorus] [Verse] [Chorus] [Bridge] [Chorus] [Outro]
```

### Cinematic mythic (Arcanea)
```
[Intro: solo motif] [Build: ostinato emerges] [Verse: motif develops] [Build: ensemble grows] [Climax: full ensemble peak] [Breakdown: solo returns] [Outro: motif fades]
```

### Electronic / vibe (Frank's Vibes)
```
[Intro: pad emerges] [Verse: kick + bassline] [Chorus: melodic peak] [Breakdown: stripped] [Build] [Drop: full energy] [Outro: pad decay]
```

### Punk / alt (Nona)
```
[Intro: distorted guitar riff] [Verse: shouted vocal + drums] [Chorus: fuller mix, bigger peak] [Verse 2] [Chorus] [Bridge: tension] [Final Chorus: peak] [Outro: abrupt or extended]
```

### Neo-classical (Frank Riemer)
```
[Intro: piano motif emerges] [Verse: motif develops, left hand enters] [Chorus: full hands, dynamic peak] [Bridge: instrumental, strings enter] [Outro: piano solo, decay]
```

---

## Tag positioning

- Tags placed in description body affect intended structure
- Suno does not always honor tags exactly — variability is high
- Pair tags with prose description for best effect:
  ```
  "[Intro: piano motif, 4 bars] [Verse: motif develops with left hand entry, 16 bars]"
  ```
  vs. just `[Intro] [Verse]` (less control)

---

## Instrument-focus syntax

| Tag | Effect |
|---|---|
| `[Solo: piano]` | Piano-only section |
| `[Solo: strings]` | Strings-only section |
| `[Solo: guitar]` | Guitar-only section |
| `[Drums break]` | Drums prominent |
| `[Bass break]` | Bass prominent |

---

## Known limitations (Suno v5)

- Section length not always honored (specifying "16 bars" doesn't guarantee 16 bars)
- Tempo adherence varies — specifying "84 BPM" gets near-target but not exact
- Multi-section structures with >8 tags can get truncated or re-shuffled
- Tag ordering is suggestive, not strict
- BPM changes mid-song (specifying tempo modulation) often fail

---

## Update log

| Date | Note |
|---|---|
| 2026-04-29 | v0.1 seed from prior Suno usage; verify against Suno docs per Phase 1 |
| | (to be populated as Suno feature changes ship) |

---

**Built on SIP** — `knowledge/suno/structure-tags-reference.md` · v0.1 seed · Engine target: Suno v5 · Update on Suno feature change
