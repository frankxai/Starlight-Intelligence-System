# Songcraft Source Ledger — Rights-Safe Build

**Verified:** 2026-09-02  
**Policy:** a free download is not automatically an open license. Keep source files outside Git; Git stores URLs, license facts, checksums, and derived notes. Never ingest unauthorized lyric dumps, leaked stems, voice clones, or “z-lib” copies.

## Ingest now

| Source | What it adds | License / constraint | Project action |
|---|---|---|---|
| [Open Music Theory v2](https://viva.pressbooks.pub/openmusictheory/) | form, harmony, rhythm, meter, pop/rock, jazz, counterpoint, orchestration | CC BY-SA; preserve attribution and ShareAlike on adaptations | Mirror text or PDF with attribution; distill exercises into original checklists |
| [Open Music Theory v1](https://openmusictheory.github.io/) | interactive theory reference | CC BY-SA 4.0 | Use for linked concepts; record version/date |
| [Principles of Orchestration](https://www.gutenberg.org/ebooks/33900) | register, balance, doubling, orchestral color | Project Gutenberg/public-domain basis in the US; verify local jurisdiction and comply with Gutenberg terms | Download HTML/EPUB from Gutenberg; use as historical foundation, not modern production law |
| [Groove MIDI Dataset](https://magenta.tensorflow.org/datasets/groove) | 1,150 human-performed drum MIDIs; microtiming, velocity, fills | CC BY 4.0 | Download MIDI + metadata; preserve attribution; learn groove descriptors, not drummer identity |
| [Slakh2100](https://www.slakh.com/) | 2,100 synthesized multitracks with aligned MIDI/stems; 145 hours across 34 instrument classes | CC BY 4.0 on the official release | Use for source-separation, orchestration, and stem-role experiments; do not treat its source repertoire as a lyric/melody suggestion bank |
| [FMA](https://github.com/mdeff/fma) | 106,574-track metadata/features and CC-licensed audio | code MIT; metadata CC BY 4.0; every audio track keeps its artist-selected license | Start with metadata/features. Ingest audio only after per-track license filtering and attribution capture |
| [SALAMI annotations](https://github.com/DDMAL/salami-data-public) | human section-boundary and functional-form annotations | dataset/repo terms must be retained and rechecked before redistribution | Use annotations and IDs; do not expect audio in the repo |
| [seancolsen/music-theory-data](https://github.com/seancolsen/music-theory-data) | machine-readable scales, chords, intervals, note names | CC BY-SA 4.0 | Useful for validators and harmonic vocabulary; retain license and attribution |

## Research sandbox only

| Source | What it adds | Constraint | Safe use |
|---|---|---|---|
| [MTG-Jamendo](https://mtg.github.io/mtg-jamendo-dataset/) | 55k+ full tracks with genre, instrument, mood/theme tags | metadata CC BY-NC-SA 4.0; audio has per-track CC licenses; provider states non-commercial research/academic use unless separately authorized | Evaluation and taxonomy research only; keep out of commercial training and release assets |
| [MAESTRO](https://magenta.tensorflow.org/datasets/maestro) | ~200 hours aligned virtuosic piano audio/MIDI | CC BY-NC-SA 4.0 | Non-commercial experiments on timing, pedaling, and expressive performance |
| [MedleyDB 2.0](https://medleydb.weebly.com/) | 196 royalty-free research multitracks, mixes, stems, raw audio, melody and instrument annotations | non-commercial research; CC BY-NC-SA terms on the official download | Learn stem roles, melody extraction, source separation, and automatic-mix evaluation; never move its audio into commercial release assets |
| [MUSDB18-HQ](https://zenodo.org/records/3338373) | 150 uncompressed songs with vocals, drums, bass, other, and mixture stems | educational/non-commercial; component licenses vary | Benchmark stem separation only; keep the track-level license list with the files |
| [DEAM](https://cvml.unige.ch/databases/DEAM/) | 1,802 excerpts/full songs with continuous and whole-song valence/arousal annotations | non-commercial Creative Commons terms; verify the current manual before download | Evaluate emotion-curve descriptors, never use emotion labels as deterministic audience truth |
| [DALI](https://github.com/gabolsgabs/DALI) | time-aligned lyric, note, and structure annotations | access and downstream rights are restricted/variable | Metadata and academic replication only after current terms are accepted; do not add lyric text to Git |
| [Million Song Dataset — Musixmatch](https://millionsongdataset.com/musixmatch/) | bag-of-words counts for ~237k tracks | research dataset terms; no full lyrics | Study vocabulary/repetition distributions; store aggregate features only |
| [Lakh MIDI Dataset](https://colinraffel.com/projects/lmd/) | large symbolic-music corpus aligned to song metadata | MIDI composition rights are not uniformly cleared for commercial generative use | Research-only unless a rights review produces an allowlist |

## Read from the official source; do not redistribute

| Guide/book | Best use | Legitimate access |
|---|---|---|
| Dennis DeSantis, *Making Music: 74 Creative Strategies for Electronic Music Producers* | starting, progressing, variation, finishing | [Ableton's official selected chapters](https://makingmusic.ableton.com/) and [book page](https://www.ableton.com/en/blog/making-music-book-of-creative-strategies/); the 2020 full digital giveaway was temporary, so buy/borrow the complete edition rather than using third-party PDF mirrors |
| Alan Belkin, *General Principles of Harmony*, *Counterpoint*, and *Orchestration* | practical composer decision-making | [author's official site](https://alanbelkinmusic.com/general-principles-of-harmony/); use official PDFs as personal reference unless a reuse license is stated |
| Pat Pattison, *Writing Better Lyrics* and lyric-form/rhyme guides | prosody, object writing, rhyme, section development | buy/borrow through [Berklee author page](https://berkleepress.com/berklee-authors/pat-pattison-2/) or a library |
| Jack Perricone, *Great Songwriting Techniques* | melody, harmony, lyric, riff/loop songcraft | [Oxford University Press](https://global.oup.com/academic/product/great-songwriting-techniques-9780199967674) and its official companion audio |
| Jimmy Webb, *Tunesmith* | long-form craft, melody/harmony, professional discipline | [Hachette](https://www.hachettebookgroup.com/titles/jimmy-webb/tunesmith/9780786884889/) or a library |
| Andrea Stolpe, *Popular Lyric Writing* | sensory writing, story development, commercial clarity | [Hal Leonard](https://www.halleonard.com/product/50449553/popular-lyric-writing) or a library |

## Current platform and market sources

| Source | Purpose |
|---|---|
| [Suno v5.5](https://help.suno.com/en/articles/11362305) | current generation model and features |
| [Suno Voices](https://help.suno.com/en/articles/11362369) | authorized voice workflow and verification |
| [Suno Custom Models](https://help.suno.com/en/articles/11362497) | private model built only from music the user owns |
| [Suno Studio 2.0](https://help.suno.com/en/articles/13670529) | production surface, take lanes, stems, MIDI, effects, exports |
| [Suno Studio Chat](https://help.suno.com/en/articles/13670721) | scoped conversational edits |
| [Suno Studio effects](https://help.suno.com/en/articles/13670785) | native effects and automation context |
| [Suno rights and ownership](https://help.suno.com/en/categories/550145-rights-ownership) | plan-dependent rights and ownership checks |
| [IFPI Global Charts](https://www.ifpi.org/our-industry/global-charts/) | annual global artist/single evidence |
| [Spotify 2025 Wrapped](https://newsroom.spotify.com/2025-12-03/wrapped-top-artists-songs-albums-podcasts-audiobooks/) | platform-level global consumption |
| [TikTok Year on Music 2025](https://newsroom.tiktok.com/tiktok-reveals-the-top-artists-and-songs-of-2025?lang=en) | participatory use and cultural moments |
| [Luminate 2025](https://luminatedata.com/reports/yearend-music-industry-report-2025/) / [2026 Midyear](https://luminatedata.com/reports/midyear-music-ftv-report-2026/) | streaming, catalog, format, and audience trends |

## Download order

1. Open Music Theory v2 PDF/XML and v1 site snapshot.
2. Groove MIDI and Slakh2100.
3. FMA metadata only; build the license filter before any audio download.
4. Project Gutenberg orchestration text.
5. SALAMI annotations.
6. Research-only datasets—including MedleyDB, MUSDB18-HQ, DEAM, MTG-Jamendo, and MAESTRO—into an isolated non-commercial store after their terms are recorded.
7. Buy or borrow the four songwriting books; store personal notes, never scans.

## Provenance manifest for every acquired file

```yaml
source_id: stable-slug
title: ""
source_url: ""
download_url: ""
publisher_or_owner: ""
retrieved_at: 2026-09-02T00:00:00Z
sha256: ""
license_spdx_or_text: ""
commercial_use: allowed|prohibited|per-item|unknown
derivatives: allowed|share-alike|prohibited|unknown
attribution: ""
contains_copyrighted_lyrics: false
contains_identifiable_voice: false
ingest_policy: full-text|features-only|metadata-only|personal-reference|quarantine
reviewer: ""
notes: ""
```

Unknown means stop. Do not convert “available online” into “licensed for training.”

**Built on SIP** — Starlight Intelligence Protocol
