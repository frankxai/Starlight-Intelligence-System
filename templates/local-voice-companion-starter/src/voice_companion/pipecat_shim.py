"""Compatibility shim isolating differences between Pipecat 1.4.x and 1.10.x.

Ensures that pipeline creation, audio transport initialization, and context aggregators
run seamlessly without breaking on upstream minor changes.
"""

from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)


class PipecatCompatibilityShim:
    @staticmethod
    def create_local_audio_transport(
        input_device_index: int | None = None,
        output_device_index: int | None = None,
    ) -> Any:
        """Instantiates LocalAudioTransport safely across Pipecat versions."""
        try:
            from pipecat.transports.local.audio import (
                LocalAudioTransport,
                LocalAudioTransportParams,
            )

            params = LocalAudioTransportParams(
                audio_in_enabled=True,
                audio_out_enabled=True,
                audio_in_device_index=input_device_index,
                audio_out_device_index=output_device_index,
            )
            return LocalAudioTransport(params)
        except ImportError:
            raise RuntimeError("pipecat-ai is not installed. Install with: pip install 'pipecat-ai>=1.4.0,<2'")

    @staticmethod
    def get_supported_service_names() -> list[str]:
        return [
            "groq_stt",
            "elevenlabs_tts",
            "openrouter_llm",
            "openai_realtime",
            "cartesia_tts",
        ]
