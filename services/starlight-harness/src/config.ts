// Harness settings from wrangler vars, parsed strictly: a malformed entry turns that harness off.

import type { Harness } from './policy.ts';

export interface HarnessConfig {
  agentId: string;
  max: number;
  kinds: string[];
}

export function harnessConfig(raw: string): Partial<Record<Harness, HarnessConfig>> {
  let parsed: Record<string, HarnessConfig>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  const out: Partial<Record<Harness, HarnessConfig>> = {};
  for (const h of ['claude', 'codex'] as const) {
    const c = parsed[h];
    if (c && typeof c.agentId === 'string' && Number.isInteger(c.max) && c.max >= 0 && c.max <= 10 && Array.isArray(c.kinds)) out[h] = c;
  }
  return out;
}

// Workflow instance ids allow letters, digits, "-" and "_" only.
export function instanceId(taskId: string, attempt: number): string {
  return `${taskId.replace(/[^\w-]+/g, '-').slice(0, 80)}-a${attempt}`;
}
