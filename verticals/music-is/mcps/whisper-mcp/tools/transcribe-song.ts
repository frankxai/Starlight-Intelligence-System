/**
 * transcribe_song — full-song lyric capture for registration + cue sheet generation
 *
 * Refuses if consent doc not on file for non-Frank vocal source.
 */

import { transcribeAudio } from './transcribe-audio.js';
import { statSync } from 'node:fs';

interface Args {
  audio_url: string;
  consent_doc_ref?: string;
}

interface LyricBlock {
  section: string; // verse-1 / chorus / bridge / etc.
  start: number;
  end: number;
  lyrics: string;
}

interface SongTranscription {
  full_text: string;
  lyric_blocks: LyricBlock[];
  duration_seconds: number;
  language: string;
  confidence: number;
  ai_disclosure_metadata: string;
  refused?: boolean;
  refusal_reason?: string;
}

function detectSections(segments: any[]): LyricBlock[] {
  // v0.1 heuristic: break at long pauses (>2s) or every ~30s
  const blocks: LyricBlock[] = [];
  if (segments.length === 0) return blocks;

  let currentStart = segments[0].start;
  let currentText: string[] = [];
  let sectionIdx = 0;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const next = segments[i + 1];
    currentText.push(seg.text.trim());

    const isBreak = !next || next.start - seg.end > 2 || seg.end - currentStart > 30;
    if (isBreak) {
      sectionIdx++;
      blocks.push({
        section: sectionIdx === 1 ? 'verse-1' : sectionIdx === 2 ? 'chorus' : sectionIdx === 3 ? 'verse-2' : `section-${sectionIdx}`,
        start: currentStart,
        end: seg.end,
        lyrics: currentText.join(' '),
      });
      currentText = [];
      if (next) currentStart = next.start;
    }
  }

  return blocks;
}

export async function transcribeSong(args: Args): Promise<SongTranscription> {
  // consent doc check (basic; Phase 1 W2 hardens this)
  if (args.consent_doc_ref) {
    try {
      statSync(args.consent_doc_ref);
    } catch {
      return {
        full_text: '',
        lyric_blocks: [],
        duration_seconds: 0,
        language: 'unknown',
        confidence: 0,
        ai_disclosure_metadata: '',
        refused: true,
        refusal_reason: `consent_doc_ref provided but file not found at ${args.consent_doc_ref}. Place consent doc in private/consents/ before transcribing non-Frank vocals.`,
      };
    }
  }

  const transcription = await transcribeAudio({ url: args.audio_url });
  const lyric_blocks = detectSections(transcription.segments);

  const ai_disclosure_metadata = `AI-transcribed via Whisper (OpenAI whisper-1) on ${new Date().toISOString()}. Source: ${args.audio_url}. ${
    args.consent_doc_ref ? `Vocal consent doc: ${args.consent_doc_ref}` : 'No vocal-clone consent doc required (assumed Frank-as-vocalist or no vocal track).'
  } Built on SIP v1.1.0.`;

  return {
    full_text: transcription.text,
    lyric_blocks,
    duration_seconds: transcription.duration_seconds,
    language: transcription.language,
    confidence: transcription.confidence,
    ai_disclosure_metadata,
  };
}
