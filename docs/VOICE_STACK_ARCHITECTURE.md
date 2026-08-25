# Starlight Sovereign Voice Architecture (2026 SOTA)

> Multi-Tier Audio Engine & Intelligent Fallback Matrix for Starlight Intelligence Systems.

---

## 1. Overview & Voice Engine Evaluation

The Starlight Sovereign Voice System coordinates real-time speech synthesis (TTS) and speech-to-text (STT) across 4 high-performance providers. It automatically routes requests based on **Latency Requirements**, **Vocal Expressiveness**, and **Cost/Connectivity Constraints**.

| Provider | TTFA Latency | Expressiveness / Naturalness | Offline / Cost | Primary Assignment |
|---|---|---|---|---|
| **ElevenLabs Flash v2.5** | ~250–350 ms | **10.0 (SOTA Realism)** | Cloud ($$) | Sovereign Voice Cloning, Narrations, Briefings |
| **Cartesia Sonic 3.5** | **~40–90 ms** | 9.0 (Ultra-Fast SSM) | Cloud ($$) | Real-Time HUD Voice Loop, Acoustic Double-Clap Response |
| **Fish Audio 1.5** | ~150–200 ms | 9.2 (Zero-Shot Clone) | Cloud ($) | Dynamic Persona Switching |
| **Microsoft Edge Neural TTS** | ~100–150 ms | 8.6 (400+ Neural Voices) | **Free ($0)** | Zero-Cost Online Fallback, Background Alerts |
| **Kokoro-82M ONNX** | ~90–120 ms | 8.8 (Open Weight) | **100% Offline ($0)** | Air-Gapped Local Execution (Intel Arc VRAM / CPU) |

---

## 2. Is ElevenLabs Alone Enough?

### Verdict: **ElevenLabs is good enough for 90% of expressive voice needs, but requires low-latency & offline sidecars for SOTA interaction.**

- **Why ElevenLabs is Essential:** Unmatched emotional range, voice cloning accuracy for Frank's voice, and rich cadence.
- **Why Multi-Tier Routing is Superior:**
  1. **Instant Voice HUD (<90ms):** When triggered via the **Acoustic Double-Clap Detector**, Cartesia Sonic 3.5 provides sub-100ms instant feedback while ElevenLabs prepares long-form responses.
  2. **Zero-Cost Local Fallback:** Microsoft Edge-TTS (`edge-tts==7.2.8`) provides zero-cost voice playback for continuous background notifications without consuming ElevenLabs character quotas.

---

## 3. Dynamic Fallback Cascade Architecture

```
                    ┌─────────────────────────┐
                    │  USER AUDIO / DOUBLE-CLAP│
                    └────────────┬────────────┘
                                 │
                   ┌─────────────▼─────────────┐
                   │  AUDIO STRATEGY ROUTER    │
                   │ (src/voice/audio-strategy)│
                   └─────────────┬─────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │ (Expressive Task)     │ (Real-Time HUD)       │ (Offline / $0)
┌────────▼────────┐     ┌────────▼────────┐     ┌────────▼────────┐
│ ELEVENLABS      │     │ CARTESIA SONIC  │     │ MS EDGE-TTS /   │
│ Flash v2.5      │     │ 3.5 (<90ms)     │     │ KOKORO-82M      │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  PLAYBACK & HUD OUTPUT  │
                    └─────────────────────────┘
```

---

## 4. Acoustic Double-Clap Activation

The double-clap detector (`src/voice/clap-detector.ts`) listens via `AudioContext` peak envelope analysis:
- **Peak Threshold:** 0.85 normalized amplitude.
- **Clap Window:** 150ms to 600ms between two energy peaks.
- **Action:** Launches/focuses the Starlight Command Center HUD on port 4321 and triggers Cartesia/ElevenLabs voice greeting.

---

*Starlight Sovereign Voice Architecture v2.0 — Built on SIP v1.1.1*
