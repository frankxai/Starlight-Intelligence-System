#!/usr/bin/env python3
"""Validate Starlight World and emit the vanilla data boot file."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORLD_PATH = ROOT / "docs" / "starlight-world" / "world.v1.json"
DATA_JS = ROOT / "docs" / "starlight-world" / "world.data.js"

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
                "data": str(DATA_JS),
            }
        )
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
