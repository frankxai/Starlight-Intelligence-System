/**
 * Starlight Dual-Telemetry Dispatcher
 * Dispatches execution traces, memory queries, and LLM evaluations asynchronously
 * to Langfuse EU (Frankfurt) and LangSmith.
 * 
 * Built on SIP v1.1.1
 */

export interface TelemetryEvent {
  traceId: string;
  name: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  input?: unknown;
  output?: unknown;
  latencyMs?: number;
  tags?: string[];
}

export class DualTelemetryDispatcher {
  /**
   * Dispatches event to Langfuse EU and/or LangSmith.
   * Runs non-blocking using Cloudflare ExecutionContext.waitUntil if provided.
   */
  public static dispatch(
    event: TelemetryEvent,
    env: any,
    headers?: Headers,
    ctx?: { waitUntil: (promise: Promise<any>) => void }
  ): void {
    const promises: Promise<any>[] = [];

    // 1. Langfuse EU (Frankfurt, Germany) — Sovereign Native
    const langfuseKey = headers?.get('X-Langfuse-Public-Key') || env?.LANGFUSE_PUBLIC_KEY;
    const langfuseSecret = headers?.get('X-Langfuse-Secret-Key') || env?.LANGFUSE_SECRET_KEY;
    const langfuseHost = env?.LANGFUSE_HOST || 'https://cloud.langfuse.com';

    if (langfuseKey && langfuseSecret) {
      promises.push(this.sendToLangfuse(event, langfuseKey, langfuseSecret, langfuseHost));
    }

    // 2. LangSmith (LangChain Enterprise) — Optional BYO Pipe
    const langsmithKey = headers?.get('X-Langchain-Api-Key') || env?.LANGCHAIN_API_KEY;
    const langsmithProject = headers?.get('X-Langchain-Project') || env?.LANGCHAIN_PROJECT || 'starlight-mesh';
    const langsmithEndpoint = env?.LANGCHAIN_ENDPOINT || 'https://api.smith.langchain.com';

    if (langsmithKey) {
      promises.push(this.sendToLangSmith(event, langsmithKey, langsmithProject, langsmithEndpoint));
    }

    if (promises.length > 0) {
      const allDispatches = Promise.allSettled(promises);
      if (ctx && typeof ctx.waitUntil === 'function') {
        ctx.waitUntil(allDispatches);
      } else {
        // Detached execution in background
        allDispatches.catch(() => {});
      }
    }
  }

  private static async sendToLangfuse(
    event: TelemetryEvent,
    publicKey: string,
    secretKey: string,
    host: string
  ): Promise<void> {
    const authHeader = 'Basic ' + Buffer.from(`${publicKey}:${secretKey}`).toString('base64');
    const url = `${host.replace(/\/+$/, '')}/api/public/ingestion`;

    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        batch: [
          {
            id: `lf_${event.traceId}`,
            type: 'trace-create',
            timestamp: new Date().toISOString(),
            body: {
              id: event.traceId,
              name: event.name,
              userId: event.userId,
              sessionId: event.sessionId,
              metadata: event.metadata,
              input: event.input,
              output: event.output,
              tags: event.tags,
            },
          },
        ],
      }),
    });
  }

  private static async sendToLangSmith(
    event: TelemetryEvent,
    apiKey: string,
    project: string,
    endpoint: string
  ): Promise<void> {
    const url = `${endpoint.replace(/\/+$/, '')}/runs`;

    await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: event.traceId,
        name: event.name,
        run_type: 'chain',
        session_name: project,
        inputs: typeof event.input === 'object' ? event.input : { input: event.input },
        outputs: typeof event.output === 'object' ? event.output : { output: event.output },
        extra: {
          metadata: event.metadata,
          latency_ms: event.latencyMs,
        },
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
      }),
    });
  }
}
