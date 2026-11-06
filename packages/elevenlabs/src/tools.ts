import {
  ELEVENLABS_MODELS,
  ElevenLabsIntegrationError,
  STARLIGHT_ELEVENLABS_VOICES,
  type ElevenLabsModelId,
  type ElevenLabsOutputFormat,
  type SynthesizeSpeechInput,
  type SynthesizeSpeechResult,
  type VoiceConsentApprovalGate,
} from "./contracts.js";
import type { StarlightElevenLabsPipeline } from "./pipeline.js";

export const STARLIGHT_ELEVENLABS_TOOL_NAME = "starlight_elevenlabs_synthesize_speech" as const;

export const STARLIGHT_ELEVENLABS_TOOL_DESCRIPTION =
  "Synthesize user-approved text into studio speech via ElevenLabs, store the durable audio asset + SIP provenance sidecar in Cloudflare R2 or local vault storage, and return a playable audio preview with Subresource Integrity." as const;

/**
 * Portable JSON Schema (Draft 2020-12 / OpenAI strict-compatible / MCP inputSchema)
 * for `starlight_elevenlabs_synthesize_speech`.
 */
export const STARLIGHT_ELEVENLABS_INPUT_SCHEMA = Object.freeze({
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: ["idempotencyKey", "runId", "text", "voice"],
  properties: {
    idempotencyKey: {
      type: "string",
      pattern: "^[a-zA-Z0-9][a-zA-Z0-9._:-]{1,127}$",
      description: "Deterministic idempotency key for deduplicating synthesis calls.",
    },
    runId: {
      type: "string",
      pattern: "^[a-zA-Z0-9][a-zA-Z0-9._:-]{1,127}$",
      description: "Active Starlight agent run identifier.",
    },
    stepId: {
      type: "string",
      pattern: "^[a-zA-Z0-9][a-zA-Z0-9._:-]{1,127}$",
      description: "Optional step identifier within the agent run.",
    },
    text: {
      type: "string",
      minLength: 1,
      maxLength: 5000,
      description: "Exact user-approved speech script to synthesize.",
    },
    voice: {
      type: "string",
      description: `Voice preset ID (${Object.keys(STARLIGHT_ELEVENLABS_VOICES).join(", ")}) or explicit ElevenLabs voice_id.`,
    },
    modelId: {
      type: "string",
      enum: Object.keys(ELEVENLABS_MODELS) as ElevenLabsModelId[],
      description: "ElevenLabs synthesis model identifier.",
    },
    outputFormat: {
      type: "string",
      enum: ["mp3_44100_128", "mp3_44100_192", "pcm_24000", "pcm_44100"] as ElevenLabsOutputFormat[],
      description: "Output audio encoding format.",
    },
    languageCode: {
      type: "string",
      description: "Optional ISO-639-1 language code.",
    },
    includeInlinePreview: {
      type: "boolean",
      description: "Whether to include a base64 inline data URL for small audio previews.",
    },
    approvalGateToken: {
      type: "string",
      description:
        "Server-verifiable signed approval token issued by the Starlight consent authority (production consent path).",
    },
    ambiguousResolution: {
      type: "string",
      enum: ["redispatch"],
      description:
        "Operator resolution for a previous attempt with an unknown paid outcome; 'redispatch' explicitly accepts the risk of a second provider charge.",
    },
    approvalGate: {
      type: "object",
      additionalProperties: false,
      required: [
        "id",
        "runId",
        "action",
        "status",
        "requestedAt",
        "decidedAt",
        "decidedBy",
        "approvedTextSha256",
        "voiceRightsConfirmed",
      ],
      properties: {
        id: { type: "string" },
        runId: { type: "string" },
        action: { type: "string" },
        status: { type: "string", enum: ["pending", "approved", "rejected", "expired"] },
        requestedAt: { type: "string" },
        decidedAt: { type: "string" },
        decidedBy: { type: "string" },
        reason: { type: "string" },
        expiresAt: { type: "string" },
        approvedTextSha256: {
          type: "string",
          pattern: "^[a-f0-9]{64}$",
          description: "SHA-256 hex digest of the exact normalized text approved by the user.",
        },
        voiceRightsConfirmed: {
          type: "boolean",
          description: "Must be true to confirm voice usage rights and user consent.",
        },
        approvedVoiceId: { type: "string" },
      },
    },
  },
});

export interface McpToolExecutionResponse {
  readonly isError?: boolean;
  readonly content: ReadonlyArray<{
    readonly type: "text";
    readonly text: string;
  }>;
  readonly structuredContent?: Record<string, unknown>;
}

export interface StarlightElevenLabsMcpToolContract {
  readonly name: typeof STARLIGHT_ELEVENLABS_TOOL_NAME;
  readonly description: typeof STARLIGHT_ELEVENLABS_TOOL_DESCRIPTION;
  readonly inputSchema: typeof STARLIGHT_ELEVENLABS_INPUT_SCHEMA;
  readonly annotations: {
    readonly title: string;
    readonly readOnlyHint: false;
    readonly destructiveHint: false;
    readonly idempotentHint: true;
    readonly openWorldHint: true;
  };
  execute(args: unknown, signal?: AbortSignal): Promise<McpToolExecutionResponse>;
}

export interface CodexFunctionToolDefinition {
  readonly type: "function";
  readonly function: {
    readonly name: typeof STARLIGHT_ELEVENLABS_TOOL_NAME;
    readonly description: typeof STARLIGHT_ELEVENLABS_TOOL_DESCRIPTION;
    readonly strict: false;
    readonly parameters: typeof STARLIGHT_ELEVENLABS_INPUT_SCHEMA;
  };
}

export interface CodexResponsesToolDefinition {
  readonly type: "function";
  readonly name: typeof STARLIGHT_ELEVENLABS_TOOL_NAME;
  readonly description: typeof STARLIGHT_ELEVENLABS_TOOL_DESCRIPTION;
  readonly parameters: typeof STARLIGHT_ELEVENLABS_INPUT_SCHEMA;
}

export interface VercelAiSdkToolContract {
  readonly description: typeof STARLIGHT_ELEVENLABS_TOOL_DESCRIPTION;
  readonly inputSchema: typeof STARLIGHT_ELEVENLABS_INPUT_SCHEMA;
  execute(input: SynthesizeSpeechInput, options?: { abortSignal?: AbortSignal }): Promise<SynthesizeSpeechResult>;
}

export interface ChatGptActionEnvelope {
  readonly protocol: "starlight.elevenlabs.action.v1";
  readonly tool: typeof STARLIGHT_ELEVENLABS_TOOL_NAME;
  readonly payload: SynthesizeSpeechInput;
}

function parseToolInput(raw: unknown): SynthesizeSpeechInput {
  const value = typeof raw === "string" ? (JSON.parse(raw) as unknown) : raw;
  if (!value || typeof value !== "object") {
    throw new ElevenLabsIntegrationError("input_invalid", "Tool arguments must be a JSON object.");
  }
  const obj = value as Record<string, unknown>;
  const gate = obj.approvalGate as VoiceConsentApprovalGate | undefined;
  const token = typeof obj.approvalGateToken === "string" ? obj.approvalGateToken : undefined;
  if (!gate && !token) {
    throw new ElevenLabsIntegrationError(
      "consent_required",
      "Tool arguments must include approvalGateToken (server-verified) or approvalGate (development opt-in only)."
    );
  }
  return {
    idempotencyKey: String(obj.idempotencyKey ?? ""),
    runId: String(obj.runId ?? ""),
    ...(typeof obj.stepId === "string" ? { stepId: obj.stepId } : {}),
    text: String(obj.text ?? ""),
    voice: String(obj.voice ?? ""),
    ...(typeof obj.modelId === "string" ? { modelId: obj.modelId as ElevenLabsModelId } : {}),
    ...(typeof obj.outputFormat === "string"
      ? { outputFormat: obj.outputFormat as ElevenLabsOutputFormat }
      : {}),
    ...(typeof obj.languageCode === "string" ? { languageCode: obj.languageCode } : {}),
    ...(typeof obj.includeInlinePreview === "boolean"
      ? { includeInlinePreview: obj.includeInlinePreview }
      : {}),
    ...(token ? { approvalGateToken: token } : {}),
    ...(gate && typeof gate === "object" ? { approvalGate: gate } : {}),
    ...(obj.ambiguousResolution === "redispatch" ? { ambiguousResolution: "redispatch" as const } : {}),
  };
}

/**
 * 1. Claude Code & Model Context Protocol (MCP) tool contract.
 */
export function createElevenLabsMcpTool(
  pipeline: StarlightElevenLabsPipeline
): StarlightElevenLabsMcpToolContract {
  return {
    name: STARLIGHT_ELEVENLABS_TOOL_NAME,
    description: STARLIGHT_ELEVENLABS_TOOL_DESCRIPTION,
    inputSchema: STARLIGHT_ELEVENLABS_INPUT_SCHEMA,
    annotations: {
      title: "Starlight ElevenLabs Speech Synthesis (Consent-Gated)",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    async execute(args: unknown, signal?: AbortSignal): Promise<McpToolExecutionResponse> {
      try {
        const parsed = parseToolInput(args);
        const result = await pipeline.synthesizeSpeech(parsed, signal);
        return {
          isError: false,
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: result.status,
                artifactId: result.artifact.id,
                uri: result.artifact.uri,
                playbackUrl: result.preview.playbackUrl,
                sha256: result.artifact.sha256,
                provenanceSha256: result.provenance.provenanceSha256,
                costUsd: result.cost.costUsd,
                htmlEmbed: result.preview.htmlEmbed,
              }),
            },
          ],
          structuredContent: result as unknown as Record<string, unknown>,
        };
      } catch (err) {
        const code = err instanceof ElevenLabsIntegrationError ? err.code : "internal_error";
        const message = err instanceof Error ? err.message : "Voice synthesis failed.";
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: code, message }),
            },
          ],
        };
      }
    },
  };
}

/**
 * 2. Codex / OpenAI Function Calling & Responses API tool contract.
 */
export function createElevenLabsCodexTool(pipeline: StarlightElevenLabsPipeline): {
  chatCompletionsTool: CodexFunctionToolDefinition;
  responsesApiTool: CodexResponsesToolDefinition;
  invoke(rawArguments: string | Record<string, unknown>, signal?: AbortSignal): Promise<SynthesizeSpeechResult>;
} {
  return {
    chatCompletionsTool: {
      type: "function",
      function: {
        name: STARLIGHT_ELEVENLABS_TOOL_NAME,
        description: STARLIGHT_ELEVENLABS_TOOL_DESCRIPTION,
        strict: false,
        parameters: STARLIGHT_ELEVENLABS_INPUT_SCHEMA,
      },
    },
    responsesApiTool: {
      type: "function",
      name: STARLIGHT_ELEVENLABS_TOOL_NAME,
      description: STARLIGHT_ELEVENLABS_TOOL_DESCRIPTION,
      parameters: STARLIGHT_ELEVENLABS_INPUT_SCHEMA,
    },
    async invoke(rawArguments: string | Record<string, unknown>, signal?: AbortSignal): Promise<SynthesizeSpeechResult> {
      const parsed = parseToolInput(rawArguments);
      return pipeline.synthesizeSpeech(parsed, signal);
    },
  };
}

/**
 * 3. Vercel AI SDK (`generateText` / `streamText`) compatible tool contract.
 */
export function createElevenLabsAiSdkTool(
  pipeline: StarlightElevenLabsPipeline
): VercelAiSdkToolContract {
  return {
    description: STARLIGHT_ELEVENLABS_TOOL_DESCRIPTION,
    inputSchema: STARLIGHT_ELEVENLABS_INPUT_SCHEMA,
    async execute(
      input: SynthesizeSpeechInput,
      options?: { abortSignal?: AbortSignal }
    ): Promise<SynthesizeSpeechResult> {
      return pipeline.synthesizeSpeech(parseToolInput(input), options?.abortSignal);
    },
  };
}

/**
 * 4. ChatGPT-compatible OpenAPI 3.1.0 Action specification + non-connector JSON envelope handler.
 * Works both when ChatGPT has an HTTPS Action configured AND when a non-connector ChatGPT
 * session emits a structured `starlight.elevenlabs.action.v1` packet via `src/runtime-bridge/chatgpt-plan.ts`.
 */
export function buildChatGptOpenApiSpec(serverUrl = "https://api.starlightintelligence.ai"): Record<string, unknown> {
  return {
    openapi: "3.1.0",
    info: {
      title: "Starlight Intelligence — ElevenLabs Voice Synthesis Action",
      version: "0.1.0",
      description:
        "Consent-gated ElevenLabs speech synthesis with durable Cloudflare R2 storage, SIP provenance receipts, and playable previews.",
    },
    servers: [{ url: serverUrl.replace(/\/+$/, "") }],
    paths: {
      "/v1/voice/synthesize": {
        post: {
          operationId: STARLIGHT_ELEVENLABS_TOOL_NAME,
          summary: STARLIGHT_ELEVENLABS_TOOL_DESCRIPTION,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: STARLIGHT_ELEVENLABS_INPUT_SCHEMA,
              },
            },
          },
          responses: {
            "200": {
              description: "Synthesized audio artifact, cryptographic provenance receipt, and playable preview.",
            },
            "400": {
              description: "Validation, consent gate, or cost limit rejection.",
            },
          },
        },
      },
    },
  };
}

export function createChatGptActionBridge(pipeline: StarlightElevenLabsPipeline): {
  openApiSpec: Record<string, unknown>;
  createActionEnvelope(input: SynthesizeSpeechInput): ChatGptActionEnvelope;
  executeActionEnvelope(envelopeOrJson: string | ChatGptActionEnvelope, signal?: AbortSignal): Promise<SynthesizeSpeechResult>;
} {
  return {
    openApiSpec: buildChatGptOpenApiSpec(),
    createActionEnvelope(input: SynthesizeSpeechInput): ChatGptActionEnvelope {
      return {
        protocol: "starlight.elevenlabs.action.v1",
        tool: STARLIGHT_ELEVENLABS_TOOL_NAME,
        payload: parseToolInput(input),
      };
    },
    async executeActionEnvelope(
      envelopeOrJson: string | ChatGptActionEnvelope,
      signal?: AbortSignal
    ): Promise<SynthesizeSpeechResult> {
      const parsed =
        typeof envelopeOrJson === "string"
          ? (JSON.parse(envelopeOrJson) as Record<string, unknown>)
          : (envelopeOrJson as unknown as Record<string, unknown>);
      if (
        !parsed ||
        parsed.protocol !== "starlight.elevenlabs.action.v1" ||
        parsed.tool !== STARLIGHT_ELEVENLABS_TOOL_NAME ||
        !parsed.payload
      ) {
        throw new ElevenLabsIntegrationError(
          "input_invalid",
          "Invalid ChatGPT action envelope: expected protocol 'starlight.elevenlabs.action.v1'."
        );
      }
      return pipeline.synthesizeSpeech(parseToolInput(parsed.payload), signal);
    },
  };
}

/**
 * Unified multi-host tool suite exposing MCP (Claude Code), Codex (OpenAI),
 * Vercel AI SDK, and ChatGPT-compatible Action contracts from a single pipeline instance.
 */
export function createStarlightElevenLabsToolSuite(pipeline: StarlightElevenLabsPipeline) {
  return {
    toolName: STARLIGHT_ELEVENLABS_TOOL_NAME,
    inputSchema: STARLIGHT_ELEVENLABS_INPUT_SCHEMA,
    mcp: createElevenLabsMcpTool(pipeline),
    codex: createElevenLabsCodexTool(pipeline),
    aiSdk: createElevenLabsAiSdkTool(pipeline),
    chatGpt: createChatGptActionBridge(pipeline),
  };
}
