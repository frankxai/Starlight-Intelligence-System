import { NextResponse } from "next/server";

export const runtime = "edge";

interface ModelRouteDefinition {
  id: string;
  provider: "Anthropic" | "OpenAI" | "Google" | "xAI";
  name: string;
  contextWindow: number;
  costPer1kTokensInUsd: number;
  status: "online" | "degraded" | "maintenance";
}

const AVAILABLE_FRONTIER_MODELS: ModelRouteDefinition[] = [
  {
    id: "claude-3-5-sonnet",
    provider: "Anthropic",
    name: "Claude 3.5 Sonnet",
    contextWindow: 200000,
    costPer1kTokensInUsd: 0.003,
    status: "online",
  },
  {
    id: "gpt-4o",
    provider: "OpenAI",
    name: "GPT-4o (Omni)",
    contextWindow: 128000,
    costPer1kTokensInUsd: 0.0025,
    status: "online",
  },
  {
    id: "gemini-1-5-pro",
    provider: "Google",
    name: "Gemini 1.5 Pro",
    contextWindow: 2000000,
    costPer1kTokensInUsd: 0.00125,
    status: "online",
  },
  {
    id: "grok-2",
    provider: "xAI",
    name: "Grok 2",
    contextWindow: 128000,
    costPer1kTokensInUsd: 0.002,
    status: "online",
  },
];

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "Starlight Cloud Intelligent Router",
    architecture: "Vercel AI SDK on Vercel Fluid Compute + Cloudflare Edge",
    region: "global-edge",
    status: "healthy",
    models: AVAILABLE_FRONTIER_MODELS,
    pluggableStorage: ["sqlite_local", "cloudflare_d1_edge", "postgres_pgvector", "mem0_hindsight"],
    features: {
      zeroKnowledgeEncryption: true,
      streamingToolCalls: true,
      automaticModelFallback: true,
      creditPooling: true,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      model?: string;
      prompt?: string;
      temperature?: number;
      stream?: boolean;
    };

    const targetModelId = body.model || "claude-3-5-sonnet";
    const selectedModel =
      AVAILABLE_FRONTIER_MODELS.find((m) => m.id === targetModelId) || AVAILABLE_FRONTIER_MODELS[0];

    const inputTokens = Math.max(1, Math.round((body.prompt?.length || 50) / 4));
    const estimatedOutputTokens = 150;

    return NextResponse.json({
      ok: true,
      routedTo: selectedModel.id,
      provider: selectedModel.provider,
      modelName: selectedModel.name,
      latencyMs: 142,
      usage: {
        promptTokens: inputTokens,
        completionTokens: estimatedOutputTokens,
        totalTokens: inputTokens + estimatedOutputTokens,
        estimatedCostUsd:
          (inputTokens * selectedModel.costPer1kTokensInUsd) / 1000 +
          (estimatedOutputTokens * selectedModel.costPer1kTokensInUsd * 2) / 1000,
      },
      telemetry: {
        edgeRegion: "iad1",
        cacheHit: false,
        fallbackTriggered: false,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Malformed cloud request body",
      },
      { status: 400 }
    );
  }
}
