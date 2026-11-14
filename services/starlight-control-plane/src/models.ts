// Single home for Workers AI model ids. Measured 2026-11-13 (5 cases x 5 runs, injection included):
// all three below scored 25/25. Cloudflare removes the models in REMOVED_MODEL_NAMES on 2026-11-20.

export const REVIEWER_MODEL = '@cf/zai-org/glm-5.3';
export const FALLBACK_MODEL = '@cf/deepseek-ai/deepseek-v4.1-flash-1017'; // cheapest of the three
export const SECOND_FAMILY_MODEL = '@cf/openai/gpt-oss-120b';

export const REMOVAL_DATE = '2026-11-20';

// Matched as bare names (no vendor prefix). tests/models.test.mjs fails if any appears elsewhere in this service.
export const REMOVED_MODEL_NAMES = [
  'qwen3-30b-a3b-fp8', 'kimi-k2.6', 'kimi-k2.7-code', 'nemotron-3-120b-a12b', 'glm-5.3-flash',
  'glm-5.2', 'deepseek-v4-flash-0731', 'deepseek-v4-pro-0813', 'llama-3.1-8b-instruct-fp8', 'qwq-32b',
];

// Full ids of removed models the harness may still be configured with; refused up front after the date.
export const DEPRECATED_MODELS: Record<string, string> = {
  '@cf/moonshotai/kimi-k2.6': REMOVAL_DATE,
  '@cf/moonshotai/kimi-k2.7-code': REMOVAL_DATE,
};
