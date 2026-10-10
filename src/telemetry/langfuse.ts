/**
 * src/telemetry/langfuse.ts — Starlight Langfuse Cloud (EU) Telemetry & Tracing
 *
 * Provides sovereign observability for Starlight Intelligence System:
 * - Agent execution traces & reasoning steps
 * - Multi-harness session tracking (Claude Code, Antigravity, Codex, Gemini, Grok, OpenCode, Cursor, Hermes)
 * - Memory retrieval & vault search queries
 * - MCP tool execution tracing (sis_* & starlight_* tools)
 * - Multi-agent swarm handoffs, goal executions & council fanout
 * - Experiment tracking, benchmark datasets & arena receipts
 * - Evaluation scoring & feedback
 * - Prompt management & versioning
 *
 * Configuration via environment variables:
 * - LANGFUSE_PUBLIC_KEY: pk-lf-...
 * - LANGFUSE_SECRET_KEY: sk-lf-...
 * - LANGFUSE_BASEURL (or LANGFUSE_HOST / LANGFUSE_BASE_URL):
 *     Default: https://cloud.langfuse.com (EU Frankfurt cloud default)
 *     or: https://eu.cloud.langfuse.com
 * - LANGFUSE_ENABLED: 'true' | 'false' (default: true if keys present)
 * - LANGFUSE_REGION: 'eu' | 'us' (default: 'eu')
 * - LANGFUSE_RELEASE: version string (default: package version e.g. v8.3.0)
 * - LANGFUSE_ENV: 'production' | 'staging' | 'development' (default: 'development')
 *
 * Built on SIP — sovereign observability tier.
 */

import { Langfuse } from 'langfuse';
import { randomUUID } from 'node:crypto';

export interface LangfuseConfig {
  publicKey?: string;
  secretKey?: string;
  baseUrl?: string;
  region?: 'eu' | 'us' | string;
  enabled?: boolean;
  release?: string;
  environment?: string;
  flushAt?: number;
}

export interface TelemetryDiagnostic {
  active: boolean;
  baseUrl: string;
  region: string;
  publicKeyPreview: string | null;
  secretKeyConfigured: boolean;
  release: string;
  environment: string;
}

export interface TraceAgentOptions {
  name: string;
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
  input?: unknown;
  output?: unknown;
}

export interface TraceHarnessOptions {
  harness: string;
  sessionId: string;
  cwd?: string;
  task?: string;
  status?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
}

export interface TraceMcpToolCallOptions {
  toolName: string;
  args: Record<string, unknown>;
  result?: unknown;
  error?: string;
  durationMs: number;
  success: boolean;
  sessionId?: string;
  serverName?: string;
}

export interface TraceMemoryQueryOptions {
  query: string;
  vault?: string;
  resultsCount: number;
  latencyMs?: number;
  traceId?: string;
  retrievalMode?: string;
  metadata?: Record<string, unknown>;
}

export interface TraceOrchestrationOptions {
  intent: string;
  pattern: string;
  complexity: string | number;
  executionsCount: number;
  confidence: number;
  durationMs: number;
  memoryRecalled?: number;
  sessionId?: string;
}

export interface TraceSwarmTaskOptions {
  taskId: string;
  prompt: string;
  ok: boolean;
  durationMs: number;
  exitCode: number | null;
  error?: string;
  sessionId?: string;
}

export interface TraceCouncilDispatchOptions {
  topic: string;
  agents: string[];
  consensus?: string;
  durationMs: number;
  sessionId?: string;
}

export interface TraceGenerationOptions {
  name: string;
  model: string;
  input: unknown;
  output?: unknown;
  promptName?: string;
  promptVersion?: number;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  metadata?: Record<string, unknown>;
  traceId?: string;
}

export interface TraceScoreOptions {
  traceId?: string;
  name: string;
  value: number;
  comment?: string;
  dataType?: 'NUMERIC' | 'BOOLEAN';
}

export interface EvalSummaryReceipt {
  suiteName: string;
  totalPass: number;
  totalFail: number;
  totalTodo: number;
  durationSeconds: number;
  details: Array<{
    file: string;
    status: string;
    pass: number;
    fail: number;
    todo?: number;
    elapsed: string;
  }>;
}

export interface ArenaRunReceipt {
  runId: string;
  date: string;
  harness: string;
  contestants: Record<string, string>;
  judge?: {
    model: string;
    blind?: boolean;
    labelAssignment?: Record<string, Record<string, string>>;
  };
  tasks: Array<{
    id: string;
    category: string;
    verification: string;
    results: Record<string, {
      correct?: boolean | string;
      judgeScore?: number;
      durationMs?: number;
      tokens?: number;
      status?: string;
      attempts?: number;
      wordCount?: number;
      constraintCompliant?: boolean;
      notes?: string;
    }>;
    winner?: string;
  }>;
  summary?: {
    tally?: Record<string, number>;
    headline?: string;
    caveats?: string[];
  };
}

/**
 * Normalizes host to Langfuse Cloud EU or provided endpoint.
 */
function resolveBaseUrl(rawUrl?: string, region?: string): string {
  if (rawUrl && rawUrl.trim().length > 0) {
    const trimmed = rawUrl.trim();
    if (trimmed === 'eu' || trimmed === 'eu-cloud' || trimmed === 'europe') {
      return 'https://cloud.langfuse.com';
    }
    if (trimmed === 'us' || trimmed === 'us-cloud') {
      return 'https://us.cloud.langfuse.com';
    }
    return trimmed;
  }

  if (region === 'us') {
    return 'https://us.cloud.langfuse.com';
  }

  // Langfuse Cloud default EU data residency (Frankfurt)
  return 'https://cloud.langfuse.com';
}

/**
 * Resilient chainable mock object for offline / no-credential execution.
 */
class NoOpTraceHandle {
  public readonly id: string;

  constructor(id?: string) {
    this.id = id || `mock-${randomUUID()}`;
  }

  span(_options: Record<string, unknown>): NoOpTraceHandle {
    return new NoOpTraceHandle();
  }

  generation(_options: Record<string, unknown>): NoOpTraceHandle {
    return new NoOpTraceHandle();
  }

  event(_options: Record<string, unknown>): NoOpTraceHandle {
    return new NoOpTraceHandle();
  }

  score(_options: Record<string, unknown>): NoOpTraceHandle {
    return this;
  }

  update(_options: Record<string, unknown>): NoOpTraceHandle {
    return this;
  }

  end(): void {
    // no-op
  }

  getTraceUrl(): string {
    return `https://cloud.langfuse.com/project/mock/traces/${this.id}`;
  }
}

export class StarlightTelemetry {
  private client: Langfuse | null = null;
  private isEnabled: boolean = false;
  private baseUrl: string;
  private region: string;
  private release: string;
  private environment: string;
  private publicKey: string | null = null;
  private secretKey: string | null = null;

  constructor(config?: LangfuseConfig) {
    this.region = config?.region || process.env.LANGFUSE_REGION || 'eu';
    this.baseUrl = resolveBaseUrl(
      config?.baseUrl ||
        process.env.LANGFUSE_BASEURL ||
        process.env.LANGFUSE_HOST ||
        process.env.LANGFUSE_BASE_URL,
      this.region,
    );
    this.release = config?.release || process.env.LANGFUSE_RELEASE || 'v8.3.0';
    this.environment = config?.environment || process.env.LANGFUSE_ENV || 'development';

    const pubKey = config?.publicKey || process.env.LANGFUSE_PUBLIC_KEY;
    const secKey = config?.secretKey || process.env.LANGFUSE_SECRET_KEY;
    const enabledSetting = config?.enabled ?? (process.env.LANGFUSE_ENABLED !== 'false');

    if (pubKey && secKey && enabledSetting) {
      this.publicKey = pubKey;
      this.secretKey = secKey;
      try {
        this.client = new Langfuse({
          publicKey: pubKey,
          secretKey: secKey,
          baseUrl: this.baseUrl,
          release: this.release,
          environment: this.environment,
          flushAt: config?.flushAt ?? 1, // Flush promptly in agentic CLI sessions
        });
        this.isEnabled = true;
      } catch (err) {
        console.warn('[StarlightTelemetry] Failed to initialize Langfuse Cloud EU client:', err);
      }
    }
  }

  /**
   * Check if Langfuse telemetry is currently active.
   */
  public get active(): boolean {
    return this.isEnabled && this.client !== null;
  }

  /**
   * Get diagnostic status of the telemetry bridge.
   */
  public getDiagnostic(): TelemetryDiagnostic {
    return {
      active: this.active,
      baseUrl: this.baseUrl,
      region: this.baseUrl.includes('us.') ? 'US' : 'EU (Frankfurt)',
      publicKeyPreview: this.publicKey ? `${this.publicKey.substring(0, 8)}...` : null,
      secretKeyConfigured: Boolean(this.secretKey),
      release: this.release,
      environment: this.environment,
    };
  }

  /**
   * Trace an agent session or action.
   */
  public traceAgent(options: TraceAgentOptions) {
    if (!this.client) return new NoOpTraceHandle();

    try {
      return this.client.trace({
        name: options.name,
        sessionId: options.sessionId,
        userId: options.userId || 'frank',
        input: options.input,
        output: options.output,
        metadata: {
          substrate: 'SIP-v8.3.0',
          region: 'EU-Cloud',
          ...options.metadata,
        },
        tags: ['starlight', 'eu-cloud', ...(options.tags || [])],
      });
    } catch (err) {
      console.warn('[StarlightTelemetry] traceAgent error:', err);
      return new NoOpTraceHandle();
    }
  }

  /**
   * Trace a harness session across Claude Code, Antigravity, Codex, Gemini, Grok, OpenCode, Cursor, Hermes.
   */
  public traceHarnessSession(options: TraceHarnessOptions) {
    if (!this.client) return new NoOpTraceHandle();

    try {
      const trace = this.client.trace({
        name: `harness:${options.harness}:${options.sessionId}`,
        sessionId: options.sessionId,
        userId: 'frank',
        metadata: {
          substrate: 'SIP-v8.3.0',
          harness: options.harness,
          cwd: options.cwd,
          task: options.task,
          status: options.status || 'active',
          ...options.metadata,
        },
        tags: ['starlight', 'harness', options.harness, ...(options.tags || [])],
      });

      trace.span({
        name: `${options.harness}-session-start`,
        input: { cwd: options.cwd, task: options.task },
        output: { status: options.status || 'active' },
      });

      return trace;
    } catch (err) {
      console.warn('[StarlightTelemetry] traceHarnessSession error:', err);
      return new NoOpTraceHandle();
    }
  }

  /**
   * Trace an MCP tool call (sis_* or starlight_* tools).
   */
  public traceMcpToolCall(options: TraceMcpToolCallOptions) {
    if (!this.client) return;

    try {
      const trace = this.client.trace({
        name: `mcp:${options.serverName || 'starlight-sis'}:${options.toolName}`,
        sessionId: options.sessionId,
        tags: ['starlight', 'mcp', options.toolName],
      });

      const span = trace.span({
        name: options.toolName,
        input: options.args,
        output: options.error ? { error: options.error } : options.result,
        metadata: {
          durationMs: options.durationMs,
          success: options.success,
        },
      });

      trace.score({
        name: 'mcp_tool_success',
        value: options.success ? 1 : 0,
        comment: options.error || 'tool call completed successfully',
      });

      span.end();
    } catch (err) {
      console.warn('[StarlightTelemetry] traceMcpToolCall error:', err);
    }
  }

  /**
   * Record a memory query / vault retrieval span.
   */
  public traceMemoryQuery(options: TraceMemoryQueryOptions) {
    if (!this.client) return;

    try {
      const trace = options.traceId
        ? this.client.trace({ id: options.traceId })
        : this.client.trace({
            name: `sis:memory-search`,
            tags: ['starlight', 'memory', `vault:${options.vault || 'all'}`],
          });

      trace.span({
        name: `vault-search:${options.vault || 'all'}`,
        input: {
          query: options.query,
          vault: options.vault,
          mode: options.retrievalMode || 'hybrid',
        },
        output: { resultsCount: options.resultsCount },
        metadata: {
          latencyMs: options.latencyMs,
          ...options.metadata,
        },
      });
    } catch (err) {
      console.warn('[StarlightTelemetry] traceMemoryQuery error:', err);
    }
  }

  /**
   * Trace 7-layer multi-agent orchestration execution.
   */
  public traceOrchestration(options: TraceOrchestrationOptions) {
    if (!this.client) return new NoOpTraceHandle();

    try {
      const trace = this.client.trace({
        name: `orchestration:${options.intent.slice(0, 48)}`,
        sessionId: options.sessionId,
        metadata: {
          substrate: 'SIP-v8.3.0',
          pattern: options.pattern,
          complexity: options.complexity,
          executionsCount: options.executionsCount,
          durationMs: options.durationMs,
          memoryRecalled: options.memoryRecalled,
        },
        tags: ['starlight', 'orchestrator', options.pattern, String(options.complexity)],
      });

      trace.score({
        name: 'orchestration_confidence',
        value: options.confidence,
        comment: `Overall confidence: ${(options.confidence * 100).toFixed(1)}%`,
      });

      return trace;
    } catch (err) {
      console.warn('[StarlightTelemetry] traceOrchestration error:', err);
      return new NoOpTraceHandle();
    }
  }

  /**
   * Trace swarm tasks and worker processes.
   */
  public traceSwarmTask(options: TraceSwarmTaskOptions) {
    if (!this.client) return;

    try {
      const trace = this.client.trace({
        name: `swarm-task:${options.taskId}`,
        sessionId: options.sessionId,
        tags: ['starlight', 'swarm', options.ok ? 'success' : 'failure'],
      });

      trace.span({
        name: `run-task:${options.taskId}`,
        input: { prompt: options.prompt.slice(0, 200) },
        output: { exitCode: options.exitCode, ok: options.ok, error: options.error },
        metadata: { durationMs: options.durationMs },
      });

      trace.score({
        name: 'swarm_task_success',
        value: options.ok ? 1 : 0,
        comment: options.error || `Exit code ${options.exitCode}`,
      });
    } catch (err) {
      console.warn('[StarlightTelemetry] traceSwarmTask error:', err);
    }
  }

  /**
   * Trace council dispatch and consensus formation.
   */
  public traceCouncilDispatch(options: TraceCouncilDispatchOptions) {
    if (!this.client) return;

    try {
      const trace = this.client.trace({
        name: `council:${options.topic.slice(0, 40)}`,
        sessionId: options.sessionId,
        tags: ['starlight', 'council', ...options.agents],
      });

      trace.span({
        name: 'council-synthesis',
        input: { topic: options.topic, agents: options.agents },
        output: { consensus: options.consensus },
        metadata: { durationMs: options.durationMs },
      });
    } catch (err) {
      console.warn('[StarlightTelemetry] traceCouncilDispatch error:', err);
    }
  }

  /**
   * Record a generation span (LLM generation).
   */
  public traceGeneration(options: TraceGenerationOptions) {
    if (!this.client) return new NoOpTraceHandle();

    try {
      const trace = options.traceId
        ? this.client.trace({ id: options.traceId })
        : this.client.trace({ name: options.name });

      return trace.generation({
        name: options.name,
        model: options.model,
        input: options.input,
        output: options.output,
        usage: options.usage,
        metadata: {
          ...options.metadata,
          ...(options.promptName ? { promptName: options.promptName } : {}),
          ...(options.promptVersion ? { promptVersion: options.promptVersion } : {}),
        },
      });
    } catch (err) {
      console.warn('[StarlightTelemetry] traceGeneration error:', err);
      return new NoOpTraceHandle();
    }
  }

  /**
   * Record an evaluation score against a trace.
   */
  public traceScore(options: TraceScoreOptions) {
    if (!this.client) return;

    try {
      if (options.traceId) {
        const trace = this.client.trace({ id: options.traceId });
        trace.score({
          name: options.name,
          value: options.value,
          comment: options.comment,
          dataType: options.dataType,
        });
      } else {
        this.client.score({
          name: options.name,
          value: options.value,
          comment: options.comment,
          dataType: options.dataType,
        });
      }
    } catch (err) {
      console.warn('[StarlightTelemetry] traceScore error:', err);
    }
  }

  /**
   * Record test / risk-dimension evaluation summary into Langfuse EU Cloud.
   */
  public async recordEvalSummary(summary: EvalSummaryReceipt): Promise<{ traceId: string } | null> {
    if (!this.client) return null;

    try {
      const trace = this.client.trace({
        name: `eval:${summary.suiteName}`,
        metadata: {
          suite: summary.suiteName,
          totalPass: summary.totalPass,
          totalFail: summary.totalFail,
          totalTodo: summary.totalTodo,
          durationSeconds: summary.durationSeconds,
        },
        tags: ['starlight', 'eval', summary.totalFail === 0 ? 'passed' : 'failed'],
      });

      for (const item of summary.details) {
        trace.span({
          name: item.file,
          output: {
            status: item.status,
            pass: item.pass,
            fail: item.fail,
            todo: item.todo ?? 0,
            elapsed: item.elapsed,
          },
        });
      }

      const total = summary.totalPass + summary.totalFail;
      const passRate = total > 0 ? summary.totalPass / total : 1.0;

      trace.score({
        name: 'eval_pass_rate',
        value: passRate,
        comment: `${summary.totalPass}/${total} passed in ${summary.durationSeconds}s`,
      });

      await this.flush();
      return { traceId: trace.id };
    } catch (err) {
      console.warn('[StarlightTelemetry] recordEvalSummary error:', err);
      return null;
    }
  }

  /**
   * Record a Model Arena run receipt into Langfuse EU Cloud.
   */
  public async recordArenaRun(receipt: ArenaRunReceipt): Promise<{ traceId: string } | null> {
    if (!this.client) return null;

    try {
      const trace = this.client.trace({
        name: `arena:${receipt.runId}`,
        metadata: {
          date: receipt.date,
          harness: receipt.harness,
          contestants: receipt.contestants,
          judge: receipt.judge,
          headline: receipt.summary?.headline,
        },
        tags: ['starlight', 'arena', 'experiment', ...Object.keys(receipt.contestants)],
      });

      for (const task of receipt.tasks) {
        const span = trace.span({
          name: `task:${task.id}`,
          input: { category: task.category, verification: task.verification },
          output: { results: task.results, winner: task.winner },
        });

        // Record scores for each model contestant
        for (const [model, res] of Object.entries(task.results)) {
          if (res.judgeScore != null) {
            trace.score({
              name: `arena_${model}_score`,
              value: res.judgeScore / 10.0,
              comment: `Task ${task.id}: judge score ${res.judgeScore}/10`,
            });
          }
          if (res.status != null) {
            trace.score({
              name: `arena_${model}_correctness`,
              value: res.status === 'PASS' ? 1.0 : 0.0,
              comment: `Task ${task.id}: ${res.status}`,
            });
          }
        }

        span.end();
      }

      await this.flush();
      return { traceId: trace.id };
    } catch (err) {
      console.warn('[StarlightTelemetry] recordArenaRun error:', err);
      return null;
    }
  }

  /**
   * Fetch a prompt from Langfuse Cloud EU.
   */
  public async getPrompt(name: string, version?: number, label?: string) {
    if (!this.client) return null;

    try {
      return await this.client.getPrompt(name, version, { label });
    } catch (err) {
      console.warn(`[StarlightTelemetry] getPrompt("${name}") error:`, err);
      return null;
    }
  }

  /**
   * Flush pending events to Langfuse Cloud EU.
   */
  public async flush(): Promise<void> {
    if (this.client) {
      try {
        await this.client.flushAsync();
      } catch (err) {
        console.warn('[StarlightTelemetry] flush error:', err);
      }
    }
  }

  /**
   * Graceful shutdown.
   */
  public async shutdown(): Promise<void> {
    if (this.client) {
      try {
        await this.client.shutdownAsync();
      } catch (err) {
        console.warn('[StarlightTelemetry] shutdown error:', err);
      }
    }
  }
}

// Global singleton instance
export const telemetry = new StarlightTelemetry();
