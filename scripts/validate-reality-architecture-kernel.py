#!/usr/bin/env python3
"""Validate Reality Architecture kernel schemas + fixtures (stdlib + jsonschema)."""
from __future__ import annotations

import json
import sys
from pathlib import Path

try:
    from jsonschema import Draft202012Validator
    from jsonschema.exceptions import ValidationError
except ImportError:  # pragma: no cover
    print("FAIL: jsonschema package required (pip install jsonschema)", file=sys.stderr)
    sys.exit(2)

ROOT = Path(__file__).resolve().parents[1]
RA = ROOT / "docs" / "reality-architecture"
SCHEMAS = RA / "schemas"
POS = RA / "fixtures" / "positive"
NEG = RA / "fixtures" / "negative"

SCHEMA_MAP = {
    "reality-object": SCHEMAS / "reality-object.schema.json",
    "reality-event": SCHEMAS / "reality-event.schema.json",
    "future-branch": SCHEMAS / "future-branch.schema.json",
    "reality-diff": SCHEMAS / "reality-diff.schema.json",
    "actualization-plan": SCHEMAS / "actualization-plan.schema.json",
    "actualization-receipt": SCHEMAS / "actualization-receipt.schema.json",
}


def load(path: Path):
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def infer_kind(name: str) -> str:
    for key in SCHEMA_MAP:
        if name.startswith(key) or key.replace("-", ".") in name:
            # filename patterns: reality-object.repo.json
            if name.startswith(key):
                return key
    # prefix before first dot after multi-part
    for key in sorted(SCHEMA_MAP, key=len, reverse=True):
        if name.startswith(key):
            return key
    raise KeyError(f"Cannot map fixture {name} to schema")


def main() -> int:
    validators = {
        k: Draft202012Validator(load(p)) for k, p in SCHEMA_MAP.items()
    }
    errors: list[str] = []
    ok = 0

    pos_files = sorted(POS.glob("*.json"))
    if not pos_files:
        errors.append("No positive fixtures found")
    for path in pos_files:
        kind = infer_kind(path.name)
        data = load(path)
        try:
            validators[kind].validate(data)
            ok += 1
            print(f"PASS positive {path.name} -> {kind}")
        except ValidationError as e:
            errors.append(f"positive {path.name}: {e.message}")
        except Exception as e:  # noqa: BLE001
            errors.append(f"positive {path.name}: {e}")

    neg_files = sorted(NEG.glob("*.json"))
    if not neg_files:
        errors.append("No negative fixtures found")
    for path in neg_files:
        kind = infer_kind(path.name)
        data = load(path)
        try:
            validators[kind].validate(data)
            errors.append(f"negative {path.name}: expected failure but validated")
        except ValidationError:
            ok += 1
            print(f"PASS negative {path.name} correctly rejected")
        except Exception as e:  # noqa: BLE001
            errors.append(f"negative {path.name}: {e}")

    # Cross-cutting application rule: real-realm relations should carry evidence_ids
    repo = load(POS / "reality-object.repo.json")
    for rel in repo.get("relations", []):
        if not rel.get("evidence_ids"):
            errors.append("application invariant: real object relations need evidence_ids")

    print(f"\nChecked fixtures with {ok} expected outcomes")
    if errors:
        print("FAIL:")
        for e in errors:
            print(" -", e)
        return 1
    print("ALL KERNEL FIXTURES OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
