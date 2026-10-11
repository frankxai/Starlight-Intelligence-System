# Validation Log

Date: 2026-06-22

## Tools

- ffmpeg `8.1.1-full_build-www.gyan.dev`
- ffprobe `8.1.1-full_build-www.gyan.dev`
- Built-in image generation

## Checks Run

- Downloaded Suno MP3, MP4, and source cover from public CDN URLs.
- Ran ffprobe on MP3.
- Ran EBU R128 loudness scan.
- Generated waveform and spectrogram.
- Generated new cover art.
- Exported 3000x3000 cover, 1080x1080 social cover, 1920x1080 thumbnail, and 1080x1920 posters.
- Exported 6 second Spotify Canvas MP4, no audio.
- Exported 24 second Shorts/Reels/TikTok MP4 with audio and burned-in captions.
- Exported optimized 4 second GIF teaser.
- Extracted QA frames from Canvas and Shorts videos.

## Visual QA Verdict

Pass with notes.

Canvas:

- Pass: no text, no blank frames, 9:16, 6 seconds, under expected file-size ceiling.
- Note: crop is intentionally close to the heart for stronger mobile identity.

Shorts:

- Primary v2 passes visual QA. Text is legible and no padded-image seam is visible.
- Human-listen is still required to confirm the audio cut lands exactly on the intended hook.

## Known Risks

- Source audio is MP3 only; use WAV/mastered WAV for external distribution.
- Rights and persona identity remain manual gates.

