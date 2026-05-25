/**
 * process_inbox_voice_memos — batch Mobile Inbox processor
 *
 * Pulls all Mobile Inbox entries with Type=Voice Memo and Status=Not Started.
 * For each: fetch audio attachment → voice_memo_to_prompt → update Notion.
 *
 * Designed for Bridge "Process Inbox" button + weekly Monday hygiene ritual.
 */

import { voiceMemoToPrompt } from './voice-memo-to-prompt.js';
import { fetchInboxVoiceMemos, updateInboxEntry } from '../lib/notion-bridge.js';

interface Args {
  notion_inbox_ds: string;
  limit: number;
  dry_run: boolean;
}

interface BatchResult {
  processed: number;
  skipped: number;
  refused: number;
  errors: number;
  details: Array<{
    capture_id: string;
    persona_slug: string;
    status: 'processed' | 'skipped' | 'refused' | 'error';
    note: string;
    prompt_count?: number;
  }>;
}

export async function processInboxVoiceMemos(args: Args): Promise<BatchResult> {
  if (!args.notion_inbox_ds) {
    throw new Error('notion_inbox_ds required (set NOTION_INBOX_DS env var or pass explicitly).');
  }

  const result: BatchResult = { processed: 0, skipped: 0, refused: 0, errors: 0, details: [] };

  const entries = await fetchInboxVoiceMemos(args.notion_inbox_ds, args.limit);

  for (const entry of entries) {
    try {
      const personaSlug = (entry.persona_hint || 'unsure').toLowerCase().replace(/[^a-z0-9-]/g, '-');

      if (personaSlug === 'unsure' || personaSlug === 'unknown') {
        result.skipped++;
        result.details.push({
          capture_id: entry.id,
          persona_slug: personaSlug,
          status: 'skipped',
          note: 'Persona Hint = Unsure; manual triage required.',
        });
        continue;
      }

      if (!entry.audio_url) {
        result.skipped++;
        result.details.push({
          capture_id: entry.id,
          persona_slug: personaSlug,
          status: 'skipped',
          note: 'No audio_url found on capture.',
        });
        continue;
      }

      if (args.dry_run) {
        result.processed++;
        result.details.push({
          capture_id: entry.id,
          persona_slug: personaSlug,
          status: 'processed',
          note: 'dry-run: would process this entry.',
        });
        continue;
      }

      const flow = await voiceMemoToPrompt({
        audio_url: entry.audio_url,
        persona_slug: personaSlug,
        engine: 'suno',
      });

      if (flow.refused) {
        result.refused++;
        result.details.push({
          capture_id: entry.id,
          persona_slug: personaSlug,
          status: 'refused',
          note: flow.refusal_reason || 'refused by voice_memo_to_prompt',
        });
        await updateInboxEntry(entry.id, {
          Status: 'In progress',
          Intent: `[REFUSED] ${flow.refusal_reason}`,
        });
        continue;
      }

      // success: update Notion entry with transcription + prompts
      const intentText = `Transcript: "${flow.transcription.text.slice(0, 200)}${flow.transcription.text.length > 200 ? '…' : ''}"

Classification: ${flow.classification.capture_type} (confidence ${flow.classification.confidence.toFixed(2)})

Prompt candidates (${flow.prompt_candidates.length}):
${flow.prompt_candidates
  .map((p, i) => `${i + 1}. [${p.engine}] ${p.composed_prompt.slice(0, 100)}…`)
  .join('\n')}

Review on Bridge.`;

      await updateInboxEntry(entry.id, {
        Status: 'In progress',
        Intent: intentText,
      });

      result.processed++;
      result.details.push({
        capture_id: entry.id,
        persona_slug: personaSlug,
        status: 'processed',
        note: `Transcribed (${flow.transcription.duration_seconds.toFixed(1)}s, ${flow.transcription.confidence.toFixed(2)} conf); classified as ${flow.classification.capture_type}; ${flow.prompt_candidates.length} prompts generated.`,
        prompt_count: flow.prompt_candidates.length,
      });
    } catch (err: any) {
      result.errors++;
      result.details.push({
        capture_id: entry.id || 'unknown',
        persona_slug: entry.persona_hint || 'unknown',
        status: 'error',
        note: err.message,
      });
    }
  }

  return result;
}
