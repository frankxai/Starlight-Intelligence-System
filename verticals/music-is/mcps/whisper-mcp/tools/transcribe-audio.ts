/**
 * transcribe_audio — core Whisper transcription
 *
 * Accepts file_path (local) or url (remote). Routes through:
 *   - file_path: direct file read → OpenAI Whisper API
 *   - url (Suno/Bandcamp/direct media): fetch via node-fetch
 *   - url (YouTube): fetch via yt-dlp-wrap
 *   - url (Spotify/Apple/Tidal): REFUSED (DRM, no legal scrape path); operator must download manually
 *
 * Returns text + timestamped segments + language + duration + mean confidence.
 */

import OpenAI from 'openai';
import { createReadStream, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { fetchAudioToTmp } from '../lib/audio-fetcher.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface TranscribeArgs {
  file_path?: string;
  url?: string;
  language?: string;
  model?: string;
}

interface TranscriptResult {
  text: string;
  segments: { start: number; end: number; text: string; confidence?: number }[];
  language: string;
  duration_seconds: number;
  confidence: number;
  source: { type: 'file' | 'url'; reference: string };
}

export async function transcribeAudio(args: TranscribeArgs): Promise<TranscriptResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured. Set in .env or run in MODE=local-fallback for whisper.cpp.');
  }

  let localPath: string;
  let sourceRef: string;
  let sourceType: 'file' | 'url';

  if (args.file_path) {
    localPath = resolve(args.file_path);
    statSync(localPath); // throws if missing
    sourceRef = args.file_path;
    sourceType = 'file';
  } else if (args.url) {
    // refuse DRM-protected platforms
    const drmPatterns = [/spotify\.com/i, /open\.spotify/i, /music\.apple\.com/i, /tidal\.com/i];
    if (drmPatterns.some((p) => p.test(args.url!))) {
      throw new Error(
        `Refused: ${args.url} is from a DRM-protected platform. Whisper MCP cannot legally scrape. ` +
          `Frank must download manually and re-call with file_path. Sovereignty over scraping.`
      );
    }
    localPath = await fetchAudioToTmp(args.url);
    sourceRef = args.url;
    sourceType = 'url';
  } else {
    throw new Error('Either file_path or url required.');
  }

  // OpenAI Whisper transcription with verbose JSON for segments
  const file = createReadStream(localPath);
  const response = await openai.audio.transcriptions.create({
    file: file as any,
    model: 'whisper-1', // OpenAI's Whisper API; whisper-large-v3 mapped server-side
    language: args.language === 'auto' ? undefined : args.language,
    response_format: 'verbose_json',
    timestamp_granularities: ['segment'],
  } as any);

  const resp = response as any;
  const segments = (resp.segments || []).map((s: any) => ({
    start: s.start,
    end: s.end,
    text: s.text,
    confidence: s.avg_logprob ? Math.exp(s.avg_logprob) : undefined,
  }));

  const confidence =
    segments.length > 0
      ? segments.reduce((acc: number, s: any) => acc + (s.confidence ?? 0.8), 0) / segments.length
      : 0.8;

  return {
    text: resp.text || '',
    segments,
    language: resp.language || 'unknown',
    duration_seconds: resp.duration || 0,
    confidence,
    source: { type: sourceType, reference: sourceRef },
  };
}
