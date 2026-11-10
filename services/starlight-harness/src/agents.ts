// The parts of a run that differ per coding agent: its command line, its environment, and how its
// output says whether it succeeded. Commands follow Cloudflare's Sandbox SDK coding-agent guides
// (Claude Code and Codex, 2026-10-22); both reach their models only through AI Gateway.

import type { Harness } from './policy.ts';

export const TASK_DIR = '/workspace/task';
export const EVENTS_PATH = `${TASK_DIR}/stdout.log`;
export const STDERR_PATH = `${TASK_DIR}/stderr.log`;
export const LAST_MESSAGE_PATH = `${TASK_DIR}/last-message.txt`;

export interface GatewayVars {
  account: string;
  gateway: string;
  model: string;
}

export type Outcome = { state: 'succeeded'; result: string } | { state: 'failed'; error: string };

export function agentCommand(harness: Harness, v: GatewayVars, prompt: string): string[] {
  if (harness === 'claude') {
    return [
      'claude', '--print', '--output-format', 'stream-json', '--verbose',
      '--dangerously-skip-permissions', '--no-session-persistence', '--model', v.model, '--', prompt,
    ];
  }
  const baseUrl = `https://gateway.ai.cloudflare.com/v1/${v.account}/${v.gateway}/openai`;
  return [
    'codex', 'exec', '--json', '--ephemeral', '--dangerously-bypass-approvals-and-sandbox',
    '--output-last-message', LAST_MESSAGE_PATH, '--model', v.model,
    '--config', 'model_provider="cloudflare-ai-gateway"',
    '--config', `model_providers.cloudflare-ai-gateway={ name = "Cloudflare AI Gateway", base_url = ${JSON.stringify(baseUrl)}, wire_api = "responses" }`,
    '--config', 'analytics.enabled=false', '--config', 'check_for_update_on_startup=false',
    '--config', 'features.plugins=false', '--', prompt,
  ];
}

export function agentEnv(harness: Harness, v: GatewayVars): Record<string, string> {
  const git = {
    GIT_AUTHOR_NAME: `Starlight ${harness} (Cloudflare sandbox)`,
    GIT_AUTHOR_EMAIL: 'agents@noreply.starlight.invalid',
    GIT_COMMITTER_NAME: `Starlight ${harness} (Cloudflare sandbox)`,
    GIT_COMMITTER_EMAIL: 'agents@noreply.starlight.invalid',
  };
  if (harness === 'codex') return git;
  return {
    ...git,
    ANTHROPIC_BASE_URL: `https://gateway.ai.cloudflare.com/v1/${v.account}/${v.gateway}/anthropic`,
    // A placeholder: the Outbound entrypoint strips it and adds the gateway token.
    ANTHROPIC_API_KEY: 'provided-by-worker',
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1',
    IS_SANDBOX: '1',
  };
}

function lastJson<T>(lines: string[], pick: (o: any) => T | undefined): T | undefined {
  let found: T | undefined;
  for (const line of lines) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch {
      continue;
    }
    const hit = pick(parsed);
    if (hit !== undefined) found = hit;
  }
  return found;
}

// The event file comes from inside the sandbox, so every field is checked before it is trusted.
export function outcome(harness: Harness, exitCode: number, events: string, stderr: string, lastMessage: string | undefined): Outcome {
  const lines = events.split('\n').filter(Boolean);
  if (harness === 'claude') {
    // Claude Code exits 0 even when a model call fails; the final result event is the truth.
    const result = lastJson(lines, (o) => o?.type === 'result' && typeof o.is_error === 'boolean'
      ? { isError: o.is_error as boolean, text: typeof o.result === 'string' ? o.result : String(o.subtype ?? '') }
      : undefined);
    if (!result) return { state: 'failed', error: `claude exited with ${exitCode}: ${stderr.slice(-2000)}` };
    return result.isError ? { state: 'failed', error: result.text } : { state: 'succeeded', result: result.text };
  }
  if (exitCode === 0) return { state: 'succeeded', result: lastMessage ?? '' };
  const failure = lastJson(lines, (o) => o?.type === 'turn.failed' && typeof o.error?.message === 'string' ? o.error.message
    : o?.type === 'error' && typeof o.message === 'string' ? o.message : undefined);
  return { state: 'failed', error: failure ?? `codex exited with ${exitCode}: ${stderr.slice(-2000)}` };
}
