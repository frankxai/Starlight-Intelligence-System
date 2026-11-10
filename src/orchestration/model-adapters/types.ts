/**
 * Starlight Model Adapter Layer: Core Types & Interfaces
 *
 * Defines unified contracts for multi-model frontier routing across:
 *   - Anthropic: Claude Sonnet 5.5, Claude Opus 5.5
 *   - Google: Gemini 4 Argon, Gemini 4 Flash
 *   - OpenAI: GPT-6.1 Sol, GPT-6 Astra
 *
 * Attestation: Built on SIP § 3 — Multi-Model Provider Adapter
 */

export type ModelProviderName = "anthropic" | "google" | "openai";

export type ModelTier = "light" | "standard" | "frontier";

export interface ModelCatalogEntry {
  id: string;
  displayName: string;
  provider: ModelProviderName;
  tier: ModelTier;
  contextWindow: number;
  maxOutputTokens: number;
  costPerMillionInputTokensUsd: number;
  costPerMillionOutputTokensUsd: number;
  upstreamApiModelId: string;
  description: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

export interface ModelRequest {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  tier?: ModelTier;
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  teammateId?: string;
  teammateName?: string;
  offlineMode?: boolean;
  metadata?: Record<string, unknown>;
}

export type FinishReason = "stop" | "length" | "tool_call" | "governance_halt" | "error" | "synthetic";

export interface ModelCompletionResponse {
  id: string;
  model: string;
  provider: ModelProviderName;
  content: string;
  usage: TokenUsage;
  durationMs: number;
  finishReason: FinishReason;
  synthetic: boolean;
  timestamp: string;
  raw?: unknown;
}

export interface ModelStreamChunk {
  id: string;
  delta: string;
  done: boolean;
  usage?: TokenUsage;
}

export interface IModelProviderAdapter {
  readonly provider: ModelProviderName;
  readonly supportedModels: readonly string[];
  isAvailable(): boolean;
  complete(request: ModelRequest): Promise<ModelCompletionResponse>;
  stream?(request: ModelRequest): AsyncIterable<ModelStreamChunk>;
  generateSynthetic(request: ModelRequest): Promise<ModelCompletionResponse>;
}
