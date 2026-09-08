#!/usr/bin/env python3
"""Dependency-free validation for Music IS creative production contracts."""

from __future__ import annotations

import json
import sys
from pathlib import Path


STAGES = {
    "draft": 0,
    "preproduction": 0,
    "hook-test": 0,
    "campaign-test": 80,
    "flagship-candidate": 90,
    "release-ready": 90,
}
PROMPT_STATES = {"draft", "research-backed", "render-tested", "campaign-proven", "retired"}
DECISIONS = {"HOLD", "REVISE", "TEST", "GREEN-LIGHT", "REFUSE"}


def fail(message: str) -> None:
    print(f"[FAIL] {message}", file=sys.stderr)
    raise SystemExit(1)


def require(condition: bool, message: str) -> None:
    if not condition:
        fail(message)


def nonempty(value: object) -> bool:
    return bool(value) and value not in {"unknown", "unassigned", "pending", ""}


def main() -> None:
    if len(sys.argv) != 2:
        fail("Usage: validate_production_contract.py <contract.json>")

    path = Path(sys.argv[1])
    require(path.exists(), f"File not found: {path}")
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"Invalid JSON: {exc}")

    required = [
        "schema_version", "release_id", "stage", "song_truth", "canon", "artist",
        "story", "format_graph", "hook_experiments", "prompt_cards", "rights",
        "market_gate", "decision",
    ]
    for key in required:
        require(key in data, f"Missing required key: {key}")
    require(data["schema_version"] == "music-is.creative-production.v0.2", "unsupported schema_version")
    stage = data["stage"]
    require(stage in STAGES, f"invalid stage: {stage}")

    song = data["song_truth"]
    for key in ["source_audio", "lyrics_status", "hook_windows", "explicit_status"]:
        require(key in song, f"song_truth missing {key}")
    require(song["lyrics_status"] in {"instrumental", "machine-draft", "human-verified"}, "invalid lyrics_status")

    canon = data["canon"]
    for key in ["id", "version", "status", "invariants", "controlled_variables", "forbidden_drift"]:
        require(key in canon, f"canon missing {key}")

    artist = data["artist"]
    for key in ["identity_status", "public_identity", "singer_identity", "reference_assets"]:
        require(key in artist, f"artist missing {key}")
    singer = artist["singer_identity"]
    for key in ["voice_source", "gaze_grammar", "gesture_grammar", "posture_rhythm", "camera_relationship"]:
        require(key in singer, f"singer_identity missing {key}")

    story = data["story"]
    for key in ["emotional_thesis", "premise", "causal_arc", "motifs", "signature_objects"]:
        require(key in story, f"story missing {key}")
    arc = story["causal_arc"]
    for key in ["trigger", "pursuit", "escalation", "irreversible_image", "answer", "loop"]:
        require(key in arc, f"causal_arc missing {key}")

    formats = data["format_graph"]
    require(isinstance(formats, list), "format_graph must be a list")
    for index, item in enumerate(formats):
        for key in ["id", "family", "platform", "surface", "objective", "hook", "duration_seconds", "status"]:
            require(key in item, f"format_graph[{index}] missing {key}")

    experiments = data["hook_experiments"]
    require(isinstance(experiments, list), "hook_experiments must be a list")
    for index, item in enumerate(experiments):
        for key in ["id", "controlled_variable", "first_0_7s_event", "hypothesis", "status"]:
            require(key in item, f"hook_experiments[{index}] missing {key}")

    prompts = data["prompt_cards"]
    require(isinstance(prompts, list), "prompt_cards must be a list")
    for index, item in enumerate(prompts):
        for key in ["id", "provider_model_version", "purpose", "evidence_state", "official_sources", "eval_rubric"]:
            require(key in item, f"prompt_cards[{index}] missing {key}")
        require(item["evidence_state"] in PROMPT_STATES, f"prompt_cards[{index}] invalid evidence_state")
        if item["evidence_state"] != "draft":
            require(bool(item["official_sources"]), f"prompt_cards[{index}] needs official sources")

    rights = data["rights"]
    for key in ["status", "music", "likeness_voice_performance", "ai_disclosure"]:
        require(key in rights, f"rights missing {key}")

    market = data["market_gate"]
    require(market.get("max") == 100, "market_gate.max must be 100")
    score = market.get("score")
    require(isinstance(score, (int, float)) and 0 <= score <= 100, "market score must be 0..100")

    decision = data["decision"]
    require(decision.get("verdict") in DECISIONS, "invalid decision.verdict")
    require(isinstance(decision.get("blockers"), list), "decision.blockers must be a list")

    if stage in {"hook-test", "campaign-test", "flagship-candidate", "release-ready"}:
        require(song["lyrics_status"] in {"instrumental", "human-verified"}, "advanced stage blocks machine-draft lyrics")
        require(artist["identity_status"] == "locked", "advanced stage requires locked artist identity")
        require(canon["status"] == "locked", "advanced stage requires locked canon")
        require(rights["status"] == "verified", "advanced stage requires verified rights")
        require(len(experiments) >= 6, "advanced stage requires at least six hook experiments")
        require(len(formats) >= 4, "advanced stage requires at least four format families")

    if stage in {"campaign-test", "flagship-candidate", "release-ready"}:
        require(score >= STAGES[stage], f"{stage} requires market score >= {STAGES[stage]}")
        require(all(p["evidence_state"] in {"render-tested", "campaign-proven"} for p in prompts), "production stages require render-tested prompt cards")

    if stage in {"flagship-candidate", "release-ready"}:
        require(market.get("zero_blockers") == [], "flagship/release stage cannot have zero blockers")
        require(decision["verdict"] in {"GREEN-LIGHT", "TEST"}, "flagship/release stage requires TEST or GREEN-LIGHT")

    if decision["verdict"] == "HOLD":
        require(bool(decision["blockers"]), "HOLD requires explicit blockers")

    print(f"[OK] {path.name}: stage={stage}, market={score}/100, formats={len(formats)}, hooks={len(experiments)}, prompts={len(prompts)}")


if __name__ == "__main__":
    main()
