/**
 * Anthropic Model Provider Adapter
 *
 * Implements frontier connectivity for:
 *   - Claude Sonnet 5.5 (Standard)
 *   - Claude Opus 5.5 (Frontier)
 *
 * REST Endpoint: https://api.anthropic.com/v1/messages
 * Fallback: Deterministic synthetic traces if ANTHROPIC_API_KEY is missing or offline
 *
 * Attestation: Built on SIP § 3 — Anthropic Frontier Adapter
 */

import type {
  IModelProviderAdapter,
  ModelCompletionResponse,
  ModelProviderName,
  ModelRequest,
  ModelStreamChunk,
} from "./types.js";
import { lookupModelCatalog, syntheticGenerator } from "./synthetic-generator.js";

export class AnthropicProviderAdapter implements IModelProviderAdapter {
  public readonly provider: ModelProviderName = "anthropic";
  public readonly supportedModels = ["claude-sonnet-5-5", "claude-opus-5-5"] as const;

  public isAvailable(): boolean {
    const key = process.env.ANTHROPIC_API_KEY;
    const isOffline =
      process.env.STARLIGHT_OFFLINE_MODE === "1" ||
      process.env.STARLIGHT_OFFLINE_MODE === "true";
    return Boolean(key && !isOffline);
  }

  public async generateSynthetic(request: ModelRequest): Promise<ModelCompletionResponse> {
    return syntheticGenerator.generate(request);
  }

  public async complete(request: ModelRequest): Promise<ModelCompletionResponse> {
    const key = process.env.ANTHROPIC_API_KEY;
    const isOffline =
      request.offlineMode ||
      process.env.STARLIGHT_OFFLINE_MODE === "1" ||
      process.env.STARLIGHT_OFFLINE_MODE === "true";

    // If key missing or offline requested, use high-fidelity synthetic generator
    if (!key || isOffline) {
      return this.generateSynthetic(request);
    }

    const model = lookupModelCatalog(request.model || "claude-sonnet-5-5");
    const startTime = Date.now();

    try {
      const payload: Record<string, unknown> = {
        model: model.upstreamApiModelId,
        max_tokens: request.maxTokens || 4096,
        messages: [{ role: "user", content: request.prompt }],
        temperature: request.temperature ?? 0.7,
      };

      if (request.systemPrompt) {
        payload.system = request.systemPrompt;
      }
      if (request.stopSequences && request.stopSequences.length > 0) {
        payload.stop_sequences = request.stopSequences;
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[AnthropicAdapter] API returned status ${response.status}: ${errorText}. Falling back to synthetic trace.`);
        return this.generateSynthetic(request);
      }

      const data = (await response.json()) as {
        id?: string;
        content?: Array<{ type: string; text?: string }>;
        usage?: { input_tokens?: number; output_tokens?: number };
        stop_reason?: string;
      };

      const durationMs = Date.now() - startTime;
      const content =
        data.content
          ?.filter((c) => c.type === "text" && c.text)
          .map((c) => c.text)
          .join("\n") || "";

      const promptTokens = data.usage?.input_tokens ?? Math.round(request.prompt.length / 3.8);
      const completionTokens = data.usage?.output_tokens ?? Math.round(content.length / 3.8);
      const totalTokens = promptTokens + completionTokens;

      const inputCost = (promptTokens * model.costPerMillionInputTokensUsd) / 1_000_000;
      const outputCost = (completionTokens * model.costPerMillionOutputTokensUsd) / 1_000_000;
      const estimatedCostUsd = Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000;

      return {
        id: data.id || `msg-anthropic-${Date.now()}`,
        model: model.displayName,
        provider: "anthropic",
        content,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens,
          estimatedCostUsd,
        },
        durationMs,
        finishReason: data.stop_reason === "max_tokens" ? "length" : "stop",
        synthetic: false,
        timestamp: new Date().toISOString(),
        raw: data,
      };
    } catch (err) {
      console.warn(`[AnthropicAdapter] Network or runtime error (${err}). Falling back to synthetic trace.`);
      return this.generateSynthetic(request);
    }
  }

  public async *stream(request: ModelRequest): AsyncIterable<ModelStreamChunk> {
    const res = await this.complete(request);
    const words = res.content.split(" ");
    for (let i = 0; i < words.length; i++) {
      yield {
        id: `${res.id}-${i}`,
        delta: (i === 0 ? "" : " ") + words[i],
        done: i === words.length - 1,
        usage: i === words.length - 1 ? res.usage : undefined,
      };
    }
  }
}

export const anthropicAdapter = new AnthropicProviderAdapter();
