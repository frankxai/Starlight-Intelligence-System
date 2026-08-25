/**
 * Starlight Voice — Multi-Engine Audio Strategy & Latency Router (2026)
 *
 * Tier A: Cartesia Sonic 3.5 (~40-90ms) / Deepgram Aura-2 (~150ms) — Ultra-fast action & command loops
 * Tier B: ElevenLabs Flash v2.5 / Fish Audio 1.5 — High-fidelity persona, storytelling & voice clones
 * Tier C: Kokoro-82M / Piper — Zero-cost local CPU/GPU sovereign fallback (offline)
 */

export type VoiceTier = "TIER_A_FAST" | "TIER_B_PERSONA" | "TIER_C_LOCAL";

export interface VoiceConfig {
  preferredTier: VoiceTier;
  cartesiaApiKey?: string;
  elevenLabsApiKey?: string;
  fishAudioApiKey?: string;
  useLocalFallback: boolean;
}

export interface AudioEngineResult {
  engine: string;
  tier: VoiceTier;
  estimatedLatencyMs: number;
  provider: string;
  isLocal: boolean;
}

export function selectVoiceEngine(
  intent: "command" | "narration" | "conversation" | "offline",
  config: VoiceConfig
): AudioEngineResult {
  if (intent === "offline" || config.preferredTier === "TIER_C_LOCAL") {
    return {
      engine: "Kokoro-82M",
      tier: "TIER_C_LOCAL",
      estimatedLatencyMs: 45,
      provider: "local-onnx",
      isLocal: true
    };
  }

  if (intent === "command") {
    if (config.cartesiaApiKey) {
      return {
        engine: "Cartesia Sonic 3.5",
        tier: "TIER_A_FAST",
        estimatedLatencyMs: 70,
        provider: "cartesia",
        isLocal: false
      };
    }
    return {
      engine: "Deepgram Aura-2",
      tier: "TIER_A_FAST",
      estimatedLatencyMs: 150,
      provider: "deepgram",
      isLocal: false
    };
  }

  // Narration or conversation
  if (config.elevenLabsApiKey) {
    return {
      engine: "ElevenLabs Flash v2.5",
      tier: "TIER_B_PERSONA",
      estimatedLatencyMs: 280,
      provider: "elevenlabs",
      isLocal: false
    };
  }

  if (config.fishAudioApiKey) {
    return {
      engine: "Fish Speech 1.5",
      tier: "TIER_B_PERSONA",
      estimatedLatencyMs: 250,
      provider: "fishaudio",
      isLocal: false
    };
  }

  // Fallback to local Kokoro
  return {
    engine: "Kokoro-82M",
    tier: "TIER_C_LOCAL",
    estimatedLatencyMs: 50,
    provider: "local-onnx",
    isLocal: true
  };
}
