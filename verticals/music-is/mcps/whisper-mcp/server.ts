/**
 * Music IS — Whisper MCP Server
 *
 * v0.1 scaffold. Implements 5 tools per README.md spec.
 * Composes with music-is/voice-memo-to-prompt skill + Mobile Inbox + Bridge Spark Zone.
 *
 * Built on SIP — v1.1.0 attestation embedded per transcription.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import 'dotenv/config';

import { transcribeAudio } from './tools/transcribe-audio.js';
import { classifyIntent } from './tools/classify-intent.js';
import { voiceMemoToPrompt } from './tools/voice-memo-to-prompt.js';
import { transcribeSong } from './tools/transcribe-song.js';
import { processInboxVoiceMemos } from './tools/process-inbox-voice-memos.js';

const ATTESTATION = {
  tool: 'music-is/whisper-mcp',
  version: '0.1.0',
  sip_version: '1.1.0',
};

const server = new Server(
  {
    name: 'music-is-whisper',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Schemas
const TranscribeAudioArgs = z.object({
  file_path: z.string().optional(),
  url: z.string().url().optional(),
  language: z.string().default('auto'),
  model: z.string().default('whisper-large-v3'),
}).refine(d => !!d.file_path || !!d.url, { message: 'Provide either file_path or url' });

const ClassifyIntentArgs = z.object({
  transcription: z.string().min(1),
  persona_canon_ref: z.string().optional(),
});

const VoiceMemoToPromptArgs = z.object({
  audio_url: z.string().url(),
  persona_slug: z.string().min(1),
  engine: z.enum(['suno', 'udio', 'stable-audio', 'multi']).default('suno'),
});

const TranscribeSongArgs = z.object({
  audio_url: z.string().url(),
  consent_doc_ref: z.string().optional(),
});

const ProcessInboxArgs = z.object({
  notion_inbox_ds: z.string().default(process.env.NOTION_INBOX_DS || ''),
  limit: z.number().int().min(1).max(50).default(10),
  dry_run: z.boolean().default(false),
});

// Tool registry
const TOOLS = [
  {
    name: 'transcribe_audio',
    description: 'Transcribe an audio file or audio URL via Whisper. Returns text, timestamped segments, language, duration, confidence. Built on SIP — every transcript carries attestation.',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Absolute local path to audio file (mp3/wav/m4a)' },
        url: { type: 'string', description: 'Audio URL (Suno share / direct media link / Bandcamp track URL)' },
        language: { type: 'string', default: 'auto', description: 'ISO-639 code or "auto"' },
        model: { type: 'string', default: 'whisper-large-v3' },
      },
    },
  },
  {
    name: 'classify_intent',
    description: 'Classify a transcription into Mobile Inbox capture types: idea / lyric_fragment / brief / reference_pointer / suno_prompt_seed / voice_note / unclassified. Optionally grounds against persona CANON.md and returns canon-fit score + persona hint.',
    inputSchema: {
      type: 'object',
      properties: {
        transcription: { type: 'string', description: 'Whisper transcribed text' },
        persona_canon_ref: { type: 'string', description: 'Optional path to persona CANON.md for grounding' },
      },
      required: ['transcription'],
    },
  },
  {
    name: 'voice_memo_to_prompt',
    description: 'Full pipeline: transcribe audio → classify intent → ground in persona canon → generate prompt candidates. The end-to-end voice-memo flow that unlocks Mobile Inbox voice-memo type. REFUSES vocal-impersonation without consent on file.',
    inputSchema: {
      type: 'object',
      properties: {
        audio_url: { type: 'string', description: 'Voice memo audio URL (Notion attachment URL accepted)' },
        persona_slug: { type: 'string', description: 'Active persona: frank-riemer / alera / franks-vibes / nona / unsure' },
        engine: { type: 'string', enum: ['suno', 'udio', 'stable-audio', 'multi'], default: 'suno' },
      },
      required: ['audio_url', 'persona_slug'],
    },
  },
  {
    name: 'transcribe_song',
    description: 'Full-song transcription for lyric registration + cue sheet generation. Returns timestamped lyric blocks suitable for LyricFind/Musixmatch submission. REFUSES if consent doc not on file for any non-Frank vocal source.',
    inputSchema: {
      type: 'object',
      properties: {
        audio_url: { type: 'string' },
        consent_doc_ref: { type: 'string', description: 'Path to consent doc if vocal-clone is non-Frank' },
      },
      required: ['audio_url'],
    },
  },
  {
    name: 'process_inbox_voice_memos',
    description: 'Batch-process Mobile Inbox entries with Type=Voice Memo, Status=Not Started. Pulls audio, transcribes, classifies, generates prompt candidates, updates Notion. Designed for Bridge "Process Inbox" button or weekly hygiene ritual.',
    inputSchema: {
      type: 'object',
      properties: {
        notion_inbox_ds: { type: 'string' },
        limit: { type: 'number', default: 10 },
        dry_run: { type: 'boolean', default: false },
      },
    },
  },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const timestamp = new Date().toISOString();

  try {
    let result: any;

    switch (name) {
      case 'transcribe_audio': {
        const parsed = TranscribeAudioArgs.parse(args);
        result = await transcribeAudio(parsed);
        break;
      }
      case 'classify_intent': {
        const parsed = ClassifyIntentArgs.parse(args);
        result = await classifyIntent(parsed);
        break;
      }
      case 'voice_memo_to_prompt': {
        const parsed = VoiceMemoToPromptArgs.parse(args);
        result = await voiceMemoToPrompt(parsed);
        break;
      }
      case 'transcribe_song': {
        const parsed = TranscribeSongArgs.parse(args);
        result = await transcribeSong(parsed);
        break;
      }
      case 'process_inbox_voice_memos': {
        const parsed = ProcessInboxArgs.parse(args);
        result = await processInboxVoiceMemos(parsed);
        break;
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    // Embed SIP attestation in every response
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              ...result,
              attestation: {
                ...ATTESTATION,
                executed_at: timestamp,
              },
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (err: any) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: err.message,
            tool: name,
            attestation: { ...ATTESTATION, executed_at: timestamp },
          }),
        },
      ],
    };
  }
});

// Boot
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[music-is/whisper-mcp] v0.1.0 — ready');
  console.error('[music-is/whisper-mcp] 5 tools registered: transcribe_audio, classify_intent, voice_memo_to_prompt, transcribe_song, process_inbox_voice_memos');
  console.error('[music-is/whisper-mcp] SIP v1.1.0 attestation embedded');
}

main().catch((err) => {
  console.error('[music-is/whisper-mcp] fatal:', err);
  process.exit(1);
});
