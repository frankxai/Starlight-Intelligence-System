/**
 * voice_memo_to_prompt — full pipeline
 *
 * Composes transcribe_audio + classify_intent + persona-canon-grounding + Suno prompt synthesis.
 * The end-to-end skill that unlocks Mobile Inbox voice-memo type.
 *
 * Refusal triggers per README:
 *   - No persona context
 *   - Vocal-impersonation detected
 *   - Persona not registered in LABELS.md active personas
 *   - Engine not declared in STACK.md L2
 */

import { transcribeAudio } from './transcribe-audio.js';
import { classifyIntent } from './classify-intent.js';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

interface Args {
  audio_url: string;
  persona_slug: string;
  engine: 'suno' | 'udio' | 'stable-audio' | 'multi';
}

interface PromptCandidate {
  engine: string;
  style_stem: string;
  intent_layer: string;
  structure_tags: string;
  composed_prompt: string;
  predicted_variability: string;
  first_re_roll_suggestion: string;
}

interface Result {
  transcription: any;
  classification: any;
  persona_grounding: {
    persona_slug: string;
    canon_path: string;
    sound_dna_anchors: string[];
    visual_dna_anchors: string[];
    canon_fit_score: number;
  };
  prompt_candidates: PromptCandidate[];
  mobile_inbox_entry_url?: string;
  refused?: boolean;
  refusal_reason?: string;
}

const ACTIVE_PERSONAS = ['frank-riemer', 'alera', 'lyssandria']; // Phase 1; extended per spawn

const PERSONA_PATHS: Record<string, { label: string; canon: string }> = {
  'frank-riemer': {
    label: 'frank-riemer',
    canon: 'labels/frank-riemer/personas/frank-riemer/CANON.md',
  },
  alera: {
    label: 'arcanea',
    canon: 'labels/arcanea/personas/alera/CANON.md',
  },
  lyssandria: {
    label: 'arcanea',
    canon: 'labels/arcanea/personas/lyssandria/CANON.md',
  },
};

function resolveMusicIsRoot(): string {
  return process.env.MUSIC_IS_ROOT || './';
}

async function readPersonaCanon(personaSlug: string): Promise<string | null> {
  const entry = PERSONA_PATHS[personaSlug];
  if (!entry) return null;
  const fullPath = join(resolveMusicIsRoot(), entry.canon);
  try {
    return await readFile(fullPath, 'utf-8');
  } catch {
    return null;
  }
}

function extractCanonAnchors(canon: string): { sound: string[]; visual: string[] } {
  // very simple grep-style extraction; Phase 1 W2 upgrades to structured parsing
  const sound: string[] = [];
  const visual: string[] = [];

  const sunoAnchorsMatch = canon.match(/### Suno prompt anchors[\s\S]*?```([\s\S]*?)```/);
  if (sunoAnchorsMatch) {
    sound.push(...sunoAnchorsMatch[1].split('\n').map((s) => s.trim()).filter(Boolean));
  }

  const visualPaletteMatch = canon.match(/### Color palette[\s\S]*?(?=###|---)/);
  if (visualPaletteMatch) {
    const lines = visualPaletteMatch[0].match(/[-*]\s+\*\*[^*]+\*\*[^\n]+/g) || [];
    visual.push(...lines.slice(0, 6).map((l) => l.replace(/[-*]\s+/, '').trim()));
  }

  return { sound, visual };
}

function generateCandidates(intent: string, anchors: string[], engine: string): PromptCandidate[] {
  // v0.1 templated synthesis; Phase 1 W2 routes through Sonnet for grounded composition
  const styleStem = anchors.slice(0, 3).join(', ');
  const candidates: PromptCandidate[] = [];

  for (let i = 1; i <= 3; i++) {
    const variation = i === 1 ? '' : i === 2 ? ', longer build' : ', stripped intro';
    candidates.push({
      engine,
      style_stem: styleStem,
      intent_layer: intent + variation,
      structure_tags: '[Intro] [Verse] [Chorus] [Bridge] [Outro]',
      composed_prompt: `${styleStem}\n${intent}${variation}\n[Intro] [Verse] [Chorus] [Bridge] [Outro]`,
      predicted_variability: 'BPM ±5; section length variability ~30%',
      first_re_roll_suggestion: i === 1 ? 'Strengthen modal anchor; restate frequency canon if applicable.' : i === 2 ? 'Add specific reference triangle artist.' : 'Try with [Instrumental] tag if vocal leaks in.',
    });
  }

  return candidates;
}

export async function voiceMemoToPrompt(args: Args): Promise<Result> {
  // Validate persona
  if (!ACTIVE_PERSONAS.includes(args.persona_slug)) {
    return {
      transcription: null,
      classification: null,
      persona_grounding: { persona_slug: args.persona_slug, canon_path: '', sound_dna_anchors: [], visual_dna_anchors: [], canon_fit_score: 0 },
      prompt_candidates: [],
      refused: true,
      refusal_reason: `persona "${args.persona_slug}" not in ACTIVE_PERSONAS. Spawn via /music-persona first.`,
    };
  }

  // Validate engine
  const validEngines = ['suno', 'udio', 'stable-audio', 'multi'];
  if (!validEngines.includes(args.engine)) {
    return {
      transcription: null,
      classification: null,
      persona_grounding: { persona_slug: args.persona_slug, canon_path: '', sound_dna_anchors: [], visual_dna_anchors: [], canon_fit_score: 0 },
      prompt_candidates: [],
      refused: true,
      refusal_reason: `engine "${args.engine}" not declared in STACK.md L2.`,
    };
  }

  // Step 1: transcribe
  const transcription = await transcribeAudio({ url: args.audio_url });

  // Step 2: classify with persona context
  const personaEntry = PERSONA_PATHS[args.persona_slug];
  const canonPath = personaEntry ? join(resolveMusicIsRoot(), personaEntry.canon) : undefined;
  const classification = await classifyIntent({ transcription: transcription.text, persona_canon_ref: canonPath });

  // Vocal-impersonation refusal short-circuits
  if (classification.refused) {
    return {
      transcription,
      classification,
      persona_grounding: { persona_slug: args.persona_slug, canon_path: canonPath || '', sound_dna_anchors: [], visual_dna_anchors: [], canon_fit_score: 0 },
      prompt_candidates: [],
      refused: true,
      refusal_reason: classification.refusal_reason,
    };
  }

  // Step 3: read canon + extract anchors
  const canon = await readPersonaCanon(args.persona_slug);
  if (!canon) {
    return {
      transcription,
      classification,
      persona_grounding: { persona_slug: args.persona_slug, canon_path: canonPath || '', sound_dna_anchors: [], visual_dna_anchors: [], canon_fit_score: 0 },
      prompt_candidates: [],
      refused: true,
      refusal_reason: `Persona CANON.md not readable at ${canonPath}. Verify MUSIC_IS_ROOT env var and persona spawn status.`,
    };
  }

  const anchors = extractCanonAnchors(canon);

  // Step 4: generate prompt candidates per engine
  const engines = args.engine === 'multi' ? ['suno', 'udio', 'stable-audio'] : [args.engine];
  const allCandidates: PromptCandidate[] = [];
  for (const e of engines) {
    allCandidates.push(...generateCandidates(transcription.text, anchors.sound, e));
  }

  return {
    transcription,
    classification,
    persona_grounding: {
      persona_slug: args.persona_slug,
      canon_path: canonPath || '',
      sound_dna_anchors: anchors.sound.slice(0, 10),
      visual_dna_anchors: anchors.visual.slice(0, 6),
      canon_fit_score: classification.persona_fit_score || 0.7,
    },
    prompt_candidates: allCandidates,
  };
}
