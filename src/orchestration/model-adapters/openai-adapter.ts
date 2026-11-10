/**
 * OpenAI Model Provider Adapter
 *
 * Implements frontier connectivity for:
 *   - GPT-6.1 Sol (Standard)
 *   - GPT-6 Astra (Frontier)
 *
 * REST Endpoint: https://api.openai.com/v1/chat/completions
 * Fallback: Deterministic synthetic traces if OPENAI_API_KEY is missing or offline
 *
 * Attestation: Built on SIP § 3 — OpenAI Frontier Adapter
 */

import type {
  IModelProviderAdapter,
  ModelCompletionResponse,
  ModelProviderName,
  ModelRequest,
  ModelStreamChunk,
} from "./types.js";
import { lookupModelCatalog, syntheticGenerator } from "./synthetic-generator.js";

export class OpenAIProviderAdapter implements IModelProviderAdapter {
  public readonly provider: ModelProviderName = "openai";
  public readonly supportedModels = ["gpt-6-1-sol", "gpt-6-astra"] as const;

  public isAvailable(): boolean {
    const key = process.env.OPENAI_API_KEY;
    const isOffline =
      process.env.STARLIGHT_OFFLINE_MODE === "1" ||
      process.env.STARLIGHT_OFFLINE_MODE === "true";
    return Boolean(key && !isOffline);
  }

  public async generateSynthetic(request: ModelRequest): Promise<ModelCompletionResponse> {
    return syntheticGenerator.generate(request);
  }

  public async complete(request: ModelRequest): Promise<ModelCompletionResponse> {
    const key = process.env.OPENAI_API_KEY;
    const isOffline =
      request.offlineMode ||
      process.env.STARLIGHT_OFFLINE_MODE === "1" ||
      process.env.STARLIGHT_OFFLINE_MODE === "true";

    // If key missing or offline requested, use high-fidelity synthetic generator
    if (!key || isOffline) {
      return this.generateSynthetic(request);
    }

    const model = lookupModelCatalog(request.model || "gpt-6-1-sol");
    const startTime = Date.now();

    try {
      const messages: Array<{ role: string; content: string }> = [];
      if (request.systemPrompt) {
        messages.push({ role: "system", content: request.systemPrompt });
      }
      messages.push({ role: "user", content: request.prompt });

      const payload: Record<string, unknown> = {
        model: model.upstreamApiModelId,
        messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens || 4096,
      };

      if (request.stopSequences && request.stopSequences.length > 0) {
        payload.stop = request.stopSequences;
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[OpenAIAdapter] API returned status ${response.status}: ${errorText}. Falling back to synthetic trace.`);
        return this.generateSynthetic(request);
      }

      const data = (await response.json()) as {
        id?: string;
        choices?: Array<{
          message?: { content?: string };
          finish_reason?: string;
        }>;
        usage?: {
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
        };
      };

      const durationMs = Date.now() - startTime;
      const choice = data.choices?.[0];
      const content = choice?.message?.content || "";

      const promptTokens = data.usage?.prompt_tokens ?? Math.round(request.prompt.length / 3.8);
      const completionTokens =
        data.usage?.completion_tokens ?? Math.round(content.length / 3.8);
      const totalTokens = promptTokens + completionTokens;

      const inputCost = (promptTokens * model.costPerMillionInputTokensUsd) / 1_000_000;
      const outputCost = (completionTokens * model.costPerMillionOutputTokensUsd) / 1_000_000;
      const estimatedCostUsd = Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000;

      return {
        id: data.id || `msg-openai-${Date.now()}`,
        model: model.displayName,
        provider: "openai",
        content,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens,
          estimatedCostUsd,
        },
        durationMs,
        finishReason: choice?.finish_reason === "length" ? "length" : "stop",
        synthetic: false,
        timestamp: new Date().toISOString(),
        raw: data,
      };
    } catch (err) {
      console.warn(`[OpenAIAdapter] Network or runtime error (${err}). Falling back to synthetic trace.`);
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

export const openaiAdapter = new OpenAIProviderAdapter();
