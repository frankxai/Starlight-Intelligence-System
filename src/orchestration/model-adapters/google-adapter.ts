/**
 * Google Gemini Model Provider Adapter
 *
 * Implements frontier connectivity for:
 *   - Gemini 4 Argon (Light/Standard)
 *   - Gemini 4 Flash (Light)
 *
 * REST Endpoint: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
 * Fallback: Deterministic synthetic traces if GEMINI_API_KEY is missing or offline
 *
 * Attestation: Built on SIP § 3 — Google Gemini Adapter
 */

import type {
  IModelProviderAdapter,
  ModelCompletionResponse,
  ModelProviderName,
  ModelRequest,
  ModelStreamChunk,
} from "./types.js";
import { lookupModelCatalog, syntheticGenerator } from "./synthetic-generator.js";

export class GoogleProviderAdapter implements IModelProviderAdapter {
  public readonly provider: ModelProviderName = "google";
  public readonly supportedModels = ["gemini-4-argon", "gemini-4-flash"] as const;

  public isAvailable(): boolean {
    const key = process.env.GEMINI_API_KEY;
    const isOffline =
      process.env.STARLIGHT_OFFLINE_MODE === "1" ||
      process.env.STARLIGHT_OFFLINE_MODE === "true";
    return Boolean(key && !isOffline);
  }

  public async generateSynthetic(request: ModelRequest): Promise<ModelCompletionResponse> {
    return syntheticGenerator.generate(request);
  }

  public async complete(request: ModelRequest): Promise<ModelCompletionResponse> {
    const key = process.env.GEMINI_API_KEY;
    const isOffline =
      request.offlineMode ||
      process.env.STARLIGHT_OFFLINE_MODE === "1" ||
      process.env.STARLIGHT_OFFLINE_MODE === "true";

    // If key missing or offline requested, use high-fidelity synthetic generator
    if (!key || isOffline) {
      return this.generateSynthetic(request);
    }

    const model = lookupModelCatalog(request.model || "gemini-4-argon");
    const startTime = Date.now();

    try {
      const upstreamModel = model.upstreamApiModelId;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${upstreamModel}:generateContent?key=${key}`;

      const contents = [
        {
          role: "user",
          parts: [{ text: request.prompt }],
        },
      ];

      const payload: Record<string, unknown> = {
        contents,
        generationConfig: {
          temperature: request.temperature ?? 0.7,
          maxOutputTokens: request.maxTokens || 4096,
        },
      };

      if (request.systemPrompt) {
        payload.systemInstruction = {
          parts: [{ text: request.systemPrompt }],
        };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[GoogleAdapter] API returned status ${response.status}: ${errorText}. Falling back to synthetic trace.`);
        return this.generateSynthetic(request);
      }

      const data = (await response.json()) as {
        candidates?: Array<{
          content?: {
            parts?: Array<{ text?: string }>;
          };
          finishReason?: string;
        }>;
        usageMetadata?: {
          promptTokenCount?: number;
          candidatesTokenCount?: number;
          totalTokenCount?: number;
        };
      };

      const durationMs = Date.now() - startTime;
      const candidate = data.candidates?.[0];
      const content = candidate?.content?.parts?.map((p) => p.text).join("") || "";

      const promptTokens =
        data.usageMetadata?.promptTokenCount ?? Math.round(request.prompt.length / 3.8);
      const completionTokens =
        data.usageMetadata?.candidatesTokenCount ?? Math.round(content.length / 3.8);
      const totalTokens = promptTokens + completionTokens;

      const inputCost = (promptTokens * model.costPerMillionInputTokensUsd) / 1_000_000;
      const outputCost = (completionTokens * model.costPerMillionOutputTokensUsd) / 1_000_000;
      const estimatedCostUsd = Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000;

      return {
        id: `msg-gemini-${Date.now()}`,
        model: model.displayName,
        provider: "google",
        content,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens,
          estimatedCostUsd,
        },
        durationMs,
        finishReason: candidate?.finishReason === "MAX_TOKENS" ? "length" : "stop",
        synthetic: false,
        timestamp: new Date().toISOString(),
        raw: data,
      };
    } catch (err) {
      console.warn(`[GoogleAdapter] Network or runtime error (${err}). Falling back to synthetic trace.`);
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

export const googleAdapter = new GoogleProviderAdapter();
