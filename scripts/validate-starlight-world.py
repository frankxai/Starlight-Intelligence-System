#!/usr/bin/env python3
"""Validate Starlight World and emit the vanilla data boot file."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORLD_DIR = ROOT / "docs" / "starlight-world"
WORLD_PATH = WORLD_DIR / "world.v1.json"
DATA_JS = WORLD_DIR / "world.data.js"
SERVE = ROOT / "scripts" / "serve-starlight-world.py"

REQUIRED_PALACE = {
    "lighthouse",
    "ocean-house",
    "studio",
    "forge",
    "commons",
    "living-lab",
    "treasury",
    "observatory",
}
REQUIRED_VAULTS = {"strategic", "technical", "creative", "operational", "wisdom", "horizon"}
REQUIRED_CITY = {"starlight", "frankx", "arcanea", "gencreator", "command"}
REQUIRED_BRAIN = {"brain-vault", "private-vault", "people-map", "pattern-detector", "chronicle"}
BANNED = re.compile(r"next\.js|from ['\"]react['\"]|create-react-app", re.I)


def validate(world: dict) -> list[str]:
    errors: list[str] = []
    if world.get("schema") != "starlight.world.v1":
        errors.append("schema must be starlight.world.v1")
    if world.get("name") != "Starlight World":
        errors.append("name must be Starlight World")
    if world.get("stack") != "vanilla-html":
        errors.append("stack must stay vanilla-html")
    if world.get("privacy", {}).get("containsPrivateVaultNotes"):
        errors.append("world must not contain private vault notes")
    if world.get("privacy", {}).get("containsSecrets"):
        errors.append("world must not contain secrets")
    palace_ids = {item["id"] for item in world.get("palace", [])}
    if palace_ids != REQUIRED_PALACE:
        errors.append(f"palace rooms drifted: {sorted(palace_ids)}")
    vault_ids = {item["id"] for item in world.get("vaults", [])}
    if vault_ids != REQUIRED_VAULTS:
        errors.append(f"vaults drifted: {sorted(vault_ids)}")
    city_ids = {item["id"] for item in world.get("city", [])}
    if city_ids != REQUIRED_CITY:
        errors.append(f"city districts drifted: {sorted(city_ids)}")
    brain_ids = {item["id"] for item in world.get("brain", [])}
    if brain_ids != REQUIRED_BRAIN:
        errors.append(f"brain nodes drifted: {sorted(brain_ids)}")
    private = next((item for item in world.get("brain", []) if item["id"] == "private-vault"), None)
    if private and not private.get("airGapped"):
        errors.append("private vault must be air-gapped")
    if any(item.get("live") for item in world.get("stewards", [])):
        errors.append("stewards must stay registered, not live")
    known = palace_ids | vault_ids | city_ids | brain_ids
    for room in world.get("palace", []):
        if room.get("vault") not in vault_ids:
            errors.append(f"palace {room['id']} missing vault")
        if room.get("district") not in city_ids:
            errors.append(f"palace {room['id']} missing district")
        if not room.get("enter"):
            errors.append(f"palace {room['id']} missing enter")
        if not room.get("title") or not room.get("role"):
            errors.append(f"palace {room['id']} missing title/role")
    for district in world.get("city", []):
        if not district.get("buildings"):
            errors.append(f"city {district['id']} missing buildings")
    edges = world.get("edges", [])
    if len(edges) < 16:
        errors.append(f"graph too thin: {len(edges)} edges")
    for edge in edges:
        if edge.get("from") not in known or edge.get("to") not in known:
            errors.append(f"edge drifted: {edge}")
    html = (WORLD_DIR / "index.html").read_text(encoding="utf-8")
    js = (WORLD_DIR / "world.js").read_text(encoding="utf-8")
    css = (WORLD_DIR / "world.css").read_text(encoding="utf-8")
    serve = SERVE.read_text(encoding="utf-8")
    for label, text in (("index.html", html), ("world.js", js), ("world.css", css)):
        if BANNED.search(text):
            errors.append(f"{label} must stay vanilla (no Next.js/React)")
    if "innerHTML" in js and "svg.innerHTML" not in js:
        errors.append("world.js must not assign innerHTML of world data")
    if "inspector.innerHTML" in js:
        errors.append("inspector must be DOM-built")
    if "layer-graph" not in html or 'id="world-svg"' not in html:
        errors.append("index.html missing graph layer or map")
    if "127.0.0.1" not in serve or "allow_reuse_address" not in serve:
        errors.append("serve must bind loopback with reuse")
    if not (WORLD_DIR / "SUCCESS.md").exists():
        errors.append("SUCCESS.md missing")
    return errors


def main() -> int:
    world = json.loads(WORLD_PATH.read_text(encoding="utf-8"))
    errors = validate(world)
    if errors:
        print("INVALID")
        for error in errors:
            print("-", error)
        return 1
    payload = json.dumps(world, ensure_ascii=False)
    DATA_JS.write_text(f"window.STARLIGHT_WORLD = {payload};\n", encoding="utf-8")
    print(
        json.dumps(
            {
                "ok": True,
                "name": world["name"],
                "stack": world["stack"],
                "palace": len(world["palace"]),
                "vaults": len(world["vaults"]),
                "city": len(world["city"]),
                "brain": len(world["brain"]),
                "edges": len(world.get("edges", [])),
                "data": str(DATA_JS),
            }
        )
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
