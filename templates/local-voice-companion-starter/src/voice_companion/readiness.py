from __future__ import annotations

import importlib.util
import shutil
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class ProbeResult:
    target: str
    available: bool
    details: str


class VoiceReadinessProbe:
    """Readiness probe for local audio capture, Pipecat, and sidecar dependencies."""

    REQUIRED_PACKAGES = [
        ("pipecat", "pipecat-ai core framework"),
        ("pyaudio", "PortAudio/WASAPI local audio IO"),
        ("websockets", "Realtime audio streaming transport"),
    ]

    @classmethod
    def probe_packages(cls) -> list[ProbeResult]:
        results = []
        for pkg, desc in cls.REQUIRED_PACKAGES:
            present = importlib.util.find_spec(pkg) is not None
            results.append(
                ProbeResult(
                    target=pkg,
                    available=present,
                    details=desc if present else f"Missing package: {pkg}",
                )
            )
        return results

    @classmethod
    def probe_audio_device(cls) -> ProbeResult:
        try:
            import pyaudio

            pa = pyaudio.PyAudio()
            count = pa.get_device_count()
            default_in = None
            default_out = None
            try:
                default_in = pa.get_default_input_device_info().get("name")
            except Exception:
                pass
            try:
                default_out = pa.get_default_output_device_info().get("name")
            except Exception:
                pass
            pa.terminate()

            if count > 0:
                return ProbeResult(
                    target="audio_devices",
                    available=True,
                    details=f"Devices found: {count} (Default in: {default_in}, out: {default_out})",
                )
            return ProbeResult(
                target="audio_devices",
                available=False,
                details="No audio devices found via PortAudio",
            )
        except Exception as exc:
            return ProbeResult(
                target="audio_devices",
                available=False,
                details=f"PortAudio/PyAudio initialization error: {exc}",
            )

    @classmethod
    def full_readiness_report(cls) -> dict[str, Any]:
        pkg_results = cls.probe_packages()
        device_result = cls.probe_audio_device()
        all_ok = all(p.available for p in pkg_results) and device_result.available

        return {
            "ready": all_ok,
            "packages": [p.__dict__ for p in pkg_results],
            "audio_hardware": device_result.__dict__,
            "pipecat_compatibility": {
                "installed_version": cls.get_pipecat_version(),
                "tested_baseline": "1.4.0",
                "upstream_target": "1.10.0",
            },
        }

    @staticmethod
    def get_pipecat_version() -> str:
        try:
            import importlib.metadata

            return importlib.metadata.version("pipecat-ai")
        except Exception:
            return "not_installed"
