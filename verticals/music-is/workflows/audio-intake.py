#!/usr/bin/env python3
"""Create an evidence-first Music IS intake packet from a local audio file.

Mechanical analysis is local and deterministic. Speech-to-text uses a cached
faster-whisper model when available; no general-purpose LLM is required.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np


def run(command: list[str], *, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(command, capture_output=True, text=True, check=check)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def ffprobe(path: Path) -> dict[str, Any]:
    result = run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_format",
            "-show_streams",
            "-of",
            "json",
            str(path),
        ]
    )
    return json.loads(result.stdout)


def loudness(path: Path) -> dict[str, Any]:
    result = run(
        [
            "ffmpeg",
            "-hide_banner",
            "-nostats",
            "-i",
            str(path),
            "-af",
            "loudnorm=I=-14:TP=-1:LRA=11:print_format=json",
            "-f",
            "null",
            "-",
        ],
        check=False,
    )
    match = re.search(r"\{\s*\"input_i\".*?\}", result.stderr, re.DOTALL)
    if not match:
        return {"status": "unavailable", "ffmpeg_exit_code": result.returncode}
    raw = json.loads(match.group(0))
    numeric = {}
    for key, value in raw.items():
        try:
            numeric[key] = float(value)
        except (TypeError, ValueError):
            numeric[key] = value
    return {"status": "observed", **numeric}


def render_waveform(path: Path, output: Path) -> None:
    run(
        [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(path),
            "-filter_complex",
            "aformat=channel_layouts=mono,showwavespic=s=2400x600:colors=0xD8B96A",
            "-frames:v",
            "1",
            str(output),
        ]
    )


def music_features(path: Path, sample_rate: int = 22050) -> dict[str, Any]:
    decoded = subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(path),
            "-ac",
            "1",
            "-ar",
            str(sample_rate),
            "-f",
            "f32le",
            "-",
        ],
        capture_output=True,
        check=True,
    ).stdout
    samples = np.frombuffer(decoded, dtype=np.float32)
    frame_size, hop = 2048, 512
    if samples.size < frame_size:
        return {"status": "unavailable", "reason": "audio_too_short"}
    frame_count = 1 + (samples.size - frame_size) // hop
    frames = np.lib.stride_tricks.as_strided(
        samples,
        shape=(frame_count, frame_size),
        strides=(samples.strides[0] * hop, samples.strides[0]),
        writeable=False,
    )
    windowed = frames * np.hanning(frame_size)
    spectrum = np.abs(np.fft.rfft(windowed, axis=1))
    power = spectrum**2

    flux = np.maximum(0, np.diff(spectrum, axis=0)).sum(axis=1)
    flux = (flux - np.mean(flux)) / (np.std(flux) + 1e-9)
    envelope_rate = sample_rate / hop
    min_lag = max(1, int(envelope_rate * 60 / 180))
    max_lag = min(len(flux) - 1, int(envelope_rate * 60 / 60))
    fft_size = 1 << (2 * len(flux) - 1).bit_length()
    flux_fft = np.fft.rfft(flux, n=fft_size)
    autocorr = np.fft.irfft(flux_fft * np.conj(flux_fft), n=fft_size)[: len(flux)]
    search = autocorr[min_lag : max_lag + 1]
    lag = int(np.argmax(search)) + min_lag
    bpm = 60 * envelope_rate / lag
    confidence = float(autocorr[lag] / (autocorr[0] + 1e-9))

    frequencies = np.fft.rfftfreq(frame_size, 1 / sample_rate)
    valid = (frequencies >= 50) & (frequencies <= 5000)
    midi = np.rint(69 + 12 * np.log2(frequencies[valid] / 440.0)).astype(int)
    pitch_class = np.mod(midi, 12)
    chroma = np.zeros(12, dtype=np.float64)
    averaged = np.mean(power[:, valid], axis=0)
    for index in range(12):
        chroma[index] = averaged[pitch_class == index].sum()
    chroma /= chroma.sum() + 1e-12
    major_profile = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
    minor_profile = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
    candidates = []
    for root in range(12):
        candidates.append((float(np.corrcoef(chroma, np.roll(major_profile, root))[0, 1]), root, "major"))
        candidates.append((float(np.corrcoef(chroma, np.roll(minor_profile, root))[0, 1]), root, "minor"))
    candidates.sort(reverse=True)
    note_names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    best, second = candidates[0], candidates[1]

    rms = np.sqrt(np.mean(frames**2, axis=1))
    return {
        "status": "estimated",
        "bpm": round(float(bpm), 2),
        "bpm_confidence_0_1": round(max(0.0, min(1.0, confidence)), 3),
        "key": f"{note_names[best[1]]} {best[2]}",
        "key_profile_correlation": round(best[0], 3),
        "key_margin": round(best[0] - second[0], 3),
        "rms_mean": round(float(np.mean(rms)), 6),
        "rms_p95": round(float(np.percentile(rms, 95)), 6),
        "method": "numpy spectral-flux autocorrelation + Krumhansl-Schmuckler profile",
        "warning": "Tempo and key are estimates; verify in a DAW before release metadata is locked.",
    }


def transcribe(
    path: Path,
    model_name: str,
    language: str | None,
    compute_type: str,
    beam_size: int,
    vad_filter: bool,
    condition_on_previous_text: bool,
) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    try:
        from faster_whisper import WhisperModel
    except ImportError as exc:
        raise RuntimeError("faster-whisper is not installed") from exc

    model = WhisperModel(model_name, device="cpu", compute_type=compute_type)
    segments, info = model.transcribe(
        str(path),
        language=language,
        beam_size=beam_size,
        best_of=beam_size,
        vad_filter=vad_filter,
        word_timestamps=True,
        condition_on_previous_text=condition_on_previous_text,
    )
    rows = []
    for segment in segments:
        rows.append(
            {
                "id": segment.id,
                "start": round(segment.start, 3),
                "end": round(segment.end, 3),
                "text": segment.text.strip(),
                "avg_logprob": round(segment.avg_logprob, 4),
                "no_speech_prob": round(segment.no_speech_prob, 4),
                "words": [
                    {
                        "start": round(word.start, 3),
                        "end": round(word.end, 3),
                        "word": word.word,
                        "probability": round(word.probability, 4),
                    }
                    for word in (segment.words or [])
                ],
            }
        )
    metadata = {
        "engine": "faster-whisper",
        "model": model_name,
        "compute_type": compute_type,
        "beam_size": beam_size,
        "vad_filter": vad_filter,
        "condition_on_previous_text": condition_on_previous_text,
        "language": info.language,
        "language_probability": round(info.language_probability, 4),
        "duration_seconds": round(info.duration, 3),
    }
    return metadata, rows


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("audio", type=Path)
    parser.add_argument("--song-id", required=True)
    parser.add_argument("--packet-root", type=Path, required=True)
    parser.add_argument("--model", default="base")
    parser.add_argument("--language", default="en")
    parser.add_argument("--compute-type", default="int8")
    parser.add_argument("--beam-size", type=int, default=1)
    parser.add_argument("--vad-filter", action="store_true")
    parser.add_argument("--condition-on-previous-text", action="store_true")
    parser.add_argument("--skip-transcription", action="store_true")
    parser.add_argument("--reuse-transcription", action="store_true")
    args = parser.parse_args()

    audio = args.audio.expanduser().resolve()
    if not audio.is_file():
        parser.error(f"Audio file does not exist: {audio}")
    if shutil.which("ffmpeg") is None or shutil.which("ffprobe") is None:
        parser.error("ffmpeg and ffprobe must be available on PATH")

    packet = args.packet_root.resolve()
    intake_dir = packet / "intake"
    audio_dir = packet / "audio"
    logs_dir = packet / "logs"
    for directory in (intake_dir, audio_dir, logs_dir):
        directory.mkdir(parents=True, exist_ok=True)

    created_at = datetime.now(timezone.utc).isoformat()
    digest = sha256(audio)
    probe = ffprobe(audio)
    loud = loudness(audio)
    musical = music_features(audio)
    render_waveform(audio, audio_dir / "waveform.png")

    pointer = {
        "path": f"local-private://{audio.name}",
        "storage_class": "local_private",
        "sha256": digest,
        "bytes": audio.stat().st_size,
        "mime_type": "audio/mpeg" if audio.suffix.lower() == ".mp3" else "audio/wav",
        "created_at": created_at,
        "notes": "Source path redacted. No external upload performed.",
    }
    write_json(audio_dir / "source-audio.pointer.json", pointer)
    write_json(audio_dir / "ffprobe.json", probe)
    write_json(audio_dir / "loudness.json", loud)

    transcript_meta: dict[str, Any] = {"status": "skipped"}
    segments: list[dict[str, Any]] = []
    transcript_path = audio_dir / "transcript.json"
    if args.reuse_transcription and transcript_path.is_file():
        previous = json.loads(transcript_path.read_text(encoding="utf-8"))
        transcript_meta = previous["metadata"]
        segments = previous["segments"]
    elif not args.skip_transcription:
        transcript_meta, segments = transcribe(
            audio,
            args.model,
            args.language or None,
            args.compute_type,
            args.beam_size,
            args.vad_filter,
            args.condition_on_previous_text,
        )
        transcript_meta["status"] = "complete"
        write_json(
            transcript_path,
            {"metadata": transcript_meta, "segments": segments},
        )
        plain = "\n".join(row["text"] for row in segments if row["text"])
        (audio_dir / "transcription.txt").write_text(plain + "\n", encoding="utf-8")
        (intake_dir / "lyrics.txt").write_text(plain + "\n", encoding="utf-8")

    format_info = probe.get("format", {})
    audio_stream = next(
        (stream for stream in probe.get("streams", []) if stream.get("codec_type") == "audio"),
        {},
    )
    analysis = {
        "schema_version": "music-is.audio-intake.v0.1",
        "song_id": args.song_id,
        "created_at": created_at,
        "source_sha256": digest,
        "duration_seconds": float(format_info.get("duration", 0)),
        "codec": audio_stream.get("codec_name"),
        "sample_rate_hz": int(audio_stream.get("sample_rate", 0) or 0),
        "channels": audio_stream.get("channels"),
        "bit_rate_bps": int(format_info.get("bit_rate", 0) or 0),
        "loudness": loud,
        "musical_features": musical,
        "transcription": transcript_meta,
        "evidence": [
            "audio/source-audio.pointer.json",
            "audio/ffprobe.json",
            "audio/loudness.json",
            "audio/waveform.png",
        ]
        + (["audio/transcript.json", "audio/transcription.txt", "intake/lyrics.txt"] if segments else []),
        "external_uploads_performed": False,
    }
    write_json(audio_dir / "audio-analysis.json", analysis)
    write_json(
        intake_dir / "intake.json",
        {
            "schema_version": "music-is.intake.v0.1",
            "song_id": args.song_id,
            "source_type": audio.suffix.lower().lstrip("."),
            "source_file_name": audio.name,
            "source_sha256": digest,
            "created_at": created_at,
            "lyrics_source": "automatic_transcription" if segments else "not_available",
            "human_lyrics_verification": "pending" if segments else "not_run",
        },
    )
    (packet / "NO_EXTERNAL_UPLOADS.md").write_text(
        "# External action boundary\n\nNo upload, publication, distribution, or social post was performed.\n",
        encoding="utf-8",
    )
    print(json.dumps({"packet": str(packet), "analysis": analysis}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
