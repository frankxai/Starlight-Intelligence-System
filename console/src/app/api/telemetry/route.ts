import { NextResponse } from "next/server";

// Mock telemetry feed for the frontend
// In a production setup this would connect to the CRDT gateway or OTLP collector.
const mockTelemetry = [
  { id: 1, agent: "Orchestrator", type: "thought", message: "Analyzing goal dependencies...", time: Date.now() - 5000 },
  { id: 2, agent: "Hermes", type: "tool_call", message: "sis_vault_search(query='architecture')", time: Date.now() - 4000 },
  { id: 3, agent: "Sentinel", type: "thought", message: "Verifying sandbox constraints...", time: Date.now() - 2000 },
  { id: 4, agent: "Prime", type: "thought", message: "Synthesizing cross-repo strategy...", time: Date.now() - 1000 },
];

export async function GET() {
  // Simulate live updates by slightly rotating or appending to the feed.
  // In a real implementation we would fetch from traceLog in src/telemetry/otel.ts
  const now = Date.now();
  
  const liveFeed = mockTelemetry.map(t => ({
    ...t,
    time: now - (Math.random() * 10000) // random recent time
  })).sort((a, b) => b.time - a.time);

  return NextResponse.json(
    { traces: liveFeed },
    { headers: { "Cache-Control": "public, max-age=1, s-maxage=1" } }
  );
}
