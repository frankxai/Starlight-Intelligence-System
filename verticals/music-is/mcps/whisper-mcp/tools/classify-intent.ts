/**
 * classify_intent — Mobile Inbox capture-type classifier
 *
 * Routes transcribed text to one of:
 *   idea / lyric_fragment / brief / reference_pointer / suno_prompt_seed / voice_note / unclassified
 *
 * Optionally grounds against persona CANON.md and returns canon-fit score + persona hint.
 *
 * Refuses if vocal-impersonation language detected (per D11).
 */

import { readFile } from 'node:fs/promises';

interface ClassifyArgs {
  transcription: string;
  persona_canon_ref?: string;
}

interface IntentClassification {
  capture_type: 'idea' | 'lyric_fragment' | 'brief' | 'reference_pointer' | 'suno_prompt_seed' | 'voice_note' | 'unclassified';
  confidence: number;
  reasoning: string;
  persona_fit_score?: number;
  canon_alignment_notes?: string[];
  suggested_label_hint?: 'Frank Riemer' | "Frank's Vibes" | 'Arcanea' | 'Nona' | 'Cross-label' | null;
  suggested_persona_hint?: string | null;
  refused?: boolean;
  refusal_reason?: string;
}

// keyword signals — simple v0.1 heuristics; Phase 1 W2 upgrades to Sonnet structured-output
const SIGNALS = {
  idea: [/i\s+(?:want|need|would like|should|am thinking)/i, /idea/i, /concept/i, /what if/i],
  lyric_fragment: [/\b(?:she|he|i|you|we)\s+(?:say|said|whisper|sing|dance|fall|rise)/i, /verse|chorus|hook|bridge/i, /\brhym/i],
  brief: [/track for/i, /piece for/i, /\bbrief\b/i, /\bfor (?:a |an |the )?(?:film|tv|game|ad|brand|trailer|podcast|docu)/i, /sync/i],
  reference_pointer: [/sounds? like/i, /reference/i, /reminds? me of/i, /spotify\.com/i, /youtube\.com/i, /bandcamp\.com/i, /suno\.com/i],
  suno_prompt_seed: [/\bbpm\b/i, /lydian|phrygian|dorian|aeolian|mixolydian/i, /\b\d+\s*hz\b/i, /pedal|drone|ostinato/i, /\bin\s+the\s+style/i],
};

const VOCAL_IMPERSONATION_FLAGS = [
  /sing\s+(?:like|as)\s+\w+/i,
  /clone\s+(?:the\s+)?voice/i,
  /imitate\s+\w+/i,
  /(?:make|sound)\s+(?:it\s+)?like\s+(?:taylor|adele|beyonce|drake|kendrick|hozier|bjork|sia)/i,
];

function detectImpersonation(text: string): string | null {
  for (const pattern of VOCAL_IMPERSONATION_FLAGS) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
}

function scoreSignals(text: string): Record<string, number> {
  const scores: Record<string, number> = { idea: 0, lyric_fragment: 0, brief: 0, reference_pointer: 0, suno_prompt_seed: 0 };
  for (const [type, patterns] of Object.entries(SIGNALS)) {
    for (const p of patterns) {
      if (p.test(text)) scores[type] += 1;
    }
  }
  return scores;
}

async function readCanonRef(path?: string): Promise<string | null> {
  if (!path) return null;
  try {
    return await readFile(path, 'utf-8');
  } catch {
    return null;
  }
}

function inferLabelHint(canon: string | null, signals: Record<string, number>, text: string): { label: any; persona: string | null; score: number } {
  if (!canon) return { label: null, persona: null, score: 0 };
  const text_lc = (text + ' ' + canon.slice(0, 2000)).toLowerCase();

  if (/528\s*hz|lydian|whale|guardian|alera|echo realm/i.test(text_lc)) return { label: 'Arcanea', persona: 'alera', score: 0.9 };
  if (/174\s*hz|lyssandria|ouroboros|aether realm/i.test(text_lc)) return { label: 'Arcanea', persona: 'lyssandria', score: 0.85 };
  if (/neo-classical|solo piano|olafur|max richter|nils frahm|contemplative|sus chord/i.test(text_lc)) return { label: 'Frank Riemer', persona: 'frank-riemer', score: 0.85 };
  if (/lo-?fi|chill house|gym|journal|vibe|sunset/i.test(text_lc)) return { label: "Frank's Vibes", persona: null, score: 0.75 };
  if (/punk|cathartic|distorted|shouted|peak.state|rebellion/i.test(text_lc)) return { label: 'Nona', persona: null, score: 0.75 };

  return { label: null, persona: null, score: 0.3 };
}

export async function classifyIntent(args: ClassifyArgs): Promise<IntentClassification> {
  const text = args.transcription;

  // refusal: vocal-impersonation guard
  const impersonationMatch = detectImpersonation(text);
  if (impersonationMatch) {
    return {
      capture_type: 'unclassified',
      confidence: 1.0,
      reasoning: `Refused: vocal-impersonation language detected ("${impersonationMatch}"). Per DECISIONS.md D11, AI-vocal-cloning of any identifiable non-Frank artist refused without written consent on file. Re-phrase the intent without impersonation reference.`,
      refused: true,
      refusal_reason: 'vocal-impersonation-without-consent',
    };
  }

  // signal-score classification
  const scores = scoreSignals(text);
  const ranked = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const [topType, topScore] = ranked[0];

  let capture_type: IntentClassification['capture_type'];
  let confidence: number;

  if (topScore === 0) {
    capture_type = text.length < 50 ? 'voice_note' : 'idea';
    confidence = 0.5;
  } else {
    capture_type = topType as IntentClassification['capture_type'];
    confidence = Math.min(0.95, 0.5 + topScore * 0.15);
  }

  const reasoning = `Top signals: ${ranked.slice(0, 3).map(([k, v]) => `${k}=${v}`).join(', ')}. Length: ${text.length} chars.`;

  // persona grounding
  const canon = await readCanonRef(args.persona_canon_ref);
  const hint = inferLabelHint(canon, scores, text);

  return {
    capture_type,
    confidence,
    reasoning,
    persona_fit_score: hint.score,
    canon_alignment_notes: canon
      ? [`Inferred label: ${hint.label || 'Unsure'}`, `Inferred persona: ${hint.persona || 'unknown'}`, `Canon ref read: ${args.persona_canon_ref}`]
      : [`No canon ref provided — pure heuristic classification`],
    suggested_label_hint: hint.label,
    suggested_persona_hint: hint.persona,
  };
}
