/**
 * Starlight Intelligence System — Real Claude executor.
 *
 * The OrchestrationEngine's 6 patterns and 7-layer pipeline are model-agnostic
 * control flow; until now the only executor was the deterministic stub. This
 * module supplies a real `AgentExecutor` with three backends:
 *
 *   cli  — headless `claude -p` subprocess (same pattern as swarm.ts's
 *          defaultClaudeRunner, but cross-platform: PATH resolution, no
 *          hardcoded Windows paths).
 *   api  — Anthropic Messages API over bare fetch. Zero new dependencies.
 *   stub — the deterministic offline fallback (identical shape to the
 *          engine's DEFAULT_EXECUTOR), selected automatically when neither
 *          backend is available, with a one-time warning.
 *
 * Selection: explicit option > STARLIGHT_EXECUTOR env (cli|api|stub|auto) >
 * auto (api if ANTHROPIC_API_KEY, else cli if the binary answers, else stub).
 *
 * Each execution injects the routed agent's identity as a system prompt
 * composed from its AgentDefinition (name, description, skills) so agents
 * answer in-role rather than as a generic model.
 *
 * Built on SIP — operational tier (execution spine).
 */

import { spawn, spawnSync } from 'node:child_process';
import type { AgentDefinition, AgentExecutor } from '../types.js';

export type ExecutorBackend = 'cli' | 'api' | 'stub';

export interface ClaudeExecutorOptions {
  /** Backend selection; 'auto' probes api → cli → stub. Default: env or 'auto'. */
  backend?: ExecutorBackend | 'auto';
  /** Agent definitions used to compose per-agent system prompts. */
  agents?: AgentDefinition[];
  /** Model for the api backend. Default: STARLIGHT_MODEL or claude-sonnet-5. */
  model?: string;
  /** Per-execution timeout. Default 120_000 ms. */
  timeoutMs?: number;
  /** Claude binary for the cli backend. Default: STARLIGHT_CLAUDE_BIN or `claude` on PATH. */
  claudeBin?: string;
  /** API key for the api backend. Default: ANTHROPIC_API_KEY. */
  apiKey?: string;
  /** Max tokens for the api backend. Default 1024. */
  maxTokens?: number;
  /** Test seam: replaces both real backends. Receives the composed prompts. */
  transport?: (system: string, prompt: string, signal: AbortSignal) => Promise<string>;
  /** Test seam for the api backend. Default: globalThis.fetch. */
  fetchImpl?: typeof fetch;
  /** Suppress the stub-fallback warning. */
  quiet?: boolean;
}

const DEFAULT_TIMEOUT_MS = 120_000;
const DEFAULT_MODEL = 'claude-sonnet-5';
const API_URL = 'https://api.anthropic.com/v1/messages';
const API_VERSION = '2023-06-01';

/** Resolve the claude binary: env override, else rely on PATH. */
export function resolveClaudeBin(explicit?: string): string {
  return explicit ?? process.env.STARLIGHT_CLAUDE_BIN ?? 'claude';
}

/** True when the claude CLI answers `--version` (cross-platform PATH probe). */
export function claudeCliAvailable(bin?: string): boolean {
  try {
    const probe = spawnSync(resolveClaudeBin(bin), ['--version'], {
      timeout: 5_000,
      stdio: 'ignore',
      shell: false,
    });
    return probe.status === 0;
  } catch {
    return false;
  }
}

/** Decide which backend a config resolves to (auto probes api → cli → stub). */
export function detectBackend(options?: ClaudeExecutorOptions): ExecutorBackend {
  const requested =
    options?.backend ??
    (process.env.STARLIGHT_EXECUTOR as ExecutorBackend | 'auto' | undefined) ??
    'auto';
  if (requested === 'cli' || requested === 'api' || requested === 'stub') return requested;
  if (options?.apiKey ?? process.env.ANTHROPIC_API_KEY) return 'api';
  if (claudeCliAvailable(options?.claudeBin)) return 'cli';
  return 'stub';
}

/** Compose the in-role system prompt for a routed agent. */
export function composeSystemPrompt(agentId: string, agents?: AgentDefinition[]): string {
  const def = agents?.find((a) => a.id === agentId || a.name === agentId);
  if (!def) {
    return `You are agent "${agentId}" in the Starlight Intelligence System. Respond concisely and concretely; return the work product itself, not commentary about it. Built on SIP.`;
  }
  const skills = def.skills.length > 0 ? ` Skills: ${def.skills.join(', ')}.` : '';
  return (
    `You are ${def.name} (${def.id}), a ${def.type} agent in the Starlight Intelligence System. ` +
    `${def.description}.${skills} ` +
    `Respond concisely and concretely; return the work product itself, not commentary about it. Built on SIP.`
  );
}

function composeUserPrompt(input: string, context: Record<string, unknown>): string {
  const keys = Object.keys(context);
  if (keys.length === 0) return input;
  let ctx: string;
  try {
    ctx = JSON.stringify(context);
  } catch {
    ctx = '[unserializable context]';
  }
  if (ctx.length > 4_000) ctx = ctx.slice(0, 4_000) + '…';
  return `${input}\n\n<context>\n${ctx}\n</context>`;
}

/** The deterministic offline stub — mirrors the engine's DEFAULT_EXECUTOR shape. */
function stubExecute(agent: string, input: string): string {
  return `[${agent}] Processed: ${input.slice(0, 200)}${input.length > 200 ? '...' : ''}`;
}

function runCli(
  bin: string,
  system: string,
  prompt: string,
  timeoutMs: number,
): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    // `claude -p` has no portable system-prompt flag across versions; prepend.
    const child = spawn(bin, ['-p', `${system}\n\n---\n\n${prompt}`], {
      shell: false,
      signal: controller.signal,
    });
    let out = '';
    let err = '';
    child.stdout?.on('data', (chunk) => { out += chunk; });
    child.stderr?.on('data', (chunk) => { err += chunk; });
    child.on('error', (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0 && !out.trim()) {
        reject(new Error(`claude exited ${code}: ${err.trim().slice(0, 300)}`));
        return;
      }
      resolvePromise(out.trim() || err.trim());
    });
  });
}

async function runApi(
  system: string,
  prompt: string,
  options: { apiKey: string; model: string; maxTokens: number; timeoutMs: number; fetchImpl: typeof fetch },
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs);
  try {
    const res = await options.fetchImpl(API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': options.apiKey,
        'anthropic-version': API_VERSION,
      },
      body: JSON.stringify({
        model: options.model,
        max_tokens: options.maxTokens,
        system,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Anthropic API ${res.status}: ${body.slice(0, 300)}`);
    }
    const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
    return (data.content ?? [])
      .filter((b) => b.type === 'text' && typeof b.text === 'string')
      .map((b) => b.text)
      .join('\n')
      .trim();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Create a real AgentExecutor. Never throws at creation; execution errors
 * degrade to the stub output with a diagnostic suffix so one failing call
 * cannot sink an orchestration (the engine already treats executor output
 * as untrusted text).
 */
export function createClaudeExecutor(options?: ClaudeExecutorOptions): AgentExecutor {
  const backend = detectBackend(options);
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const model = options?.model ?? process.env.STARLIGHT_MODEL ?? DEFAULT_MODEL;
  const maxTokens = options?.maxTokens ?? 1024;
  const bin = resolveClaudeBin(options?.claudeBin);
  const apiKey = options?.apiKey ?? process.env.ANTHROPIC_API_KEY ?? '';
  const fetchImpl = options?.fetchImpl ?? fetch;
  let warned = false;

  return async (agent, input, context) => {
    const system = composeSystemPrompt(agent, options?.agents);
    const prompt = composeUserPrompt(input, context);

    if (options?.transport) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        return await options.transport(system, prompt, controller.signal);
      } finally {
        clearTimeout(timer);
      }
    }

    if (backend === 'stub') {
      if (!warned && !options?.quiet) {
        warned = true;
        console.warn(
          '[starlight] No model backend available (no ANTHROPIC_API_KEY, no claude CLI) — using the deterministic stub executor. Set STARLIGHT_EXECUTOR=cli|api once one is available.',
        );
      }
      return stubExecute(agent, input);
    }

    try {
      if (backend === 'api') {
        return await runApi(system, prompt, { apiKey, model, maxTokens, timeoutMs, fetchImpl });
      }
      return await runCli(bin, system, prompt, timeoutMs);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      return `${stubExecute(agent, input)} [executor:${backend} degraded: ${reason.slice(0, 200)}]`;
    }
  };
}
