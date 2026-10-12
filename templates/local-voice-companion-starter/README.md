# Starlight Local Voice Companion Starter

> Desktop Voice & Push-to-Talk Companion combining a native **Tauri** system tray shell with a Python **Pipecat** real-time audio sidecar.

Part of the Starlight template family defined in the [Starlight Operator Integration Draft](file:///C:/Users/frank/docs/research/starlight-operator-integration-20260917.md).

---

## Architecture

- **Native Desktop Shell**: Tauri/Rust system tray capturing global Push-to-Talk (`Ctrl+Shift+Space`) without stealing window focus.
- **Python Sidecar**: High-performance audio I/O via PortAudio/WASAPI using `pipecat-ai`.
- **JSON-Lines IPC**: Robust IPC layer across stdin/stdout with session lifecycle methods (`ping`, `session.start`, `session.stop`, `shutdown`).
- **Pipecat Version Compatibility**: Evaluated across Pipecat 1.4.0 (baseline) through 1.10.0 (upstream) with dedicated isolation shim.
- **Pipecat UI Components**: Standardized UI components (mic controls, device picker, audio visualizer) derived from the Pipecat UI shadcn registry.

---

## Quickstart

```bash
# 1. Create virtual environment
uv venv .venv
source .venv/bin/activate # or .venv\Scripts\activate on Windows

# 2. Install dependencies
uv pip install -e ".[dev]"

# 3. Run readiness check
python -c "from voice_companion.readiness import VoiceReadinessProbe; print(VoiceReadinessProbe.full_readiness_report())"

# 4. Run tests
pytest
```

---

## Hardware & Dependency Baseline

- **Audio Engine**: PortAudio / WASAPI
- **Speech-to-Text (STT)**: Groq Whisper Large v3 Turbo (Cloud default) or faster-whisper (Local)
- **Text-to-Speech (TTS)**: ElevenLabs (Cloud default) or Kokoro-ONNX / Piper (Local)
- **PTT Latency SLA**: Hot-path p50 budget ≤ 800 ms to first playable audio chunk

---

## License & Attribution

- **License**: BSD 2-Clause License
- **Attribution**: Built with [Pipecat](https://github.com/pipecat-ai/pipecat) (BSD-2-Clause) and [Tauri](https://github.com/tauri-apps/tauri) (MIT/Apache-2.0).
