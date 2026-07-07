/**
 * Starlight Intelligence System - Telemetry
 * Structured mock representing standard OpenTelemetry (OTel) tracing for agents.
 */

// A basic structured mock for spans
export interface Span {
  name: string;
  attributes: Record<string, any>;
  startTime: number;
  endTime?: number;
  end(): void;
}

export interface Tracer {
  startSpan(name: string, options?: { attributes?: Record<string, any> }): Span;
}

// Simple in-memory storage for our mock telemetry
export const traceLog: Span[] = [];

// Mock tracer provider
export const tracer: Tracer = {
  startSpan(name: string, options?: { attributes?: Record<string, any> }): Span {
    const span: Span = {
      name,
      attributes: options?.attributes || {},
      startTime: Date.now(),
      end() {
        this.endTime = Date.now();
        traceLog.push(this);
      }
    };
    return span;
  }
};

/**
 * Traces an agent's internal thought process.
 * @param agentName Name of the agent.
 * @param thought The thought content or description.
 */
export function traceAgentThought(agentName: string, thought: string): void {
  const span = tracer.startSpan('agent.thought', {
    attributes: {
      'agent.name': agentName,
      'agent.thought': thought,
      'starlight.telemetry.type': 'thought'
    }
  });
  
  // Thoughts are effectively instantaneous events in this mock
  span.end();
}

/**
 * Traces a tool call executed by an agent.
 * @param toolName Name of the tool called.
 * @param args Arguments passed to the tool.
 */
export function traceToolCall(toolName: string, args: Record<string, any>): void {
  const span = tracer.startSpan('agent.tool_call', {
    attributes: {
      'tool.name': toolName,
      'tool.args': JSON.stringify(args),
      'starlight.telemetry.type': 'tool_call'
    }
  });
  
  span.end();
}
