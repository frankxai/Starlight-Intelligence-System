#!/usr/bin/env python3
"""Spec-Trace observability — REVISE-B closure from Starlight Board 2026-05-11.

Reports the spec_id None-rate + format-drift rate over a rolling N-day window
of routing.jsonl entries. Surfaces gentle reminders that the substrate primitive
is being used in practice, without enforcing it as a hard gate.

The expected spec_id format is kebab-case with ISO-date prefix:
    ^\\d{4}-\\d{2}-\\d{2}-[a-z0-9-]+$
For example: 2026-05-11-spec-trace-design

Anything else is "format drift" — surfaced for review but not rejected. Per
Starlight Board REVISE-A: convention enforced by docstring + observability,
not schema validation.

Usage:
    python tools/spec-trace-observability.py
    python tools/spec-trace-observability.py --days 7
    python tools/spec-trace-observability.py --json
    python tools/spec-trace-observability.py --log-path <custom-routing.jsonl>

Default routing.jsonl path matches OrchestratorConfig._default_log_path:
    private/voice-operator/logs/routing.jsonl

Built on SIP — operational tier · 2026-05-11
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import sys
from pathlib import Path
from typing import Any, Iterable

# Convention: kebab-case slug with ISO-date prefix. Matches spec doc names at
# docs/superpowers/specs/<spec-id>.md.
SPEC_ID_FORMAT = re.compile(r"^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$")


def repo_root() -> Path:
    """Find repo root by walking up from this script."""
    here = Path(__file__).resolve()
    for ancestor in [here.parent, *here.parents]:
        if (ancestor / ".git").exists():
            return ancestor
    raise SystemExit("Not inside a git repository.")


def default_routing_log() -> Path:
    return repo_root() / "private" / "voice-operator" / "logs" / "routing.jsonl"


def read_decisions(
    log_path: Path,
    *,
    since: dt.datetime | None = None,
) -> Iterable[dict[str, Any]]:
    """Yield routing.jsonl decisions newer than `since` (or all if None).

    Lenient parsing — bad lines are skipped silently. Date-filter is applied
    after parse; if a row has no timestamp, it's included (preserves audit
    history for old log files).
    """
    if not log_path.exists():
        return
    for raw in log_path.read_text(encoding="utf-8", errors="replace").splitlines():
        raw = raw.strip()
        if not raw:
            continue
        try:
            row = json.loads(raw)
        except json.JSONDecodeError:
            continue
        if since is not None:
            ts_raw = row.get("timestamp")
            if ts_raw:
                try:
                    ts = dt.datetime.fromisoformat(ts_raw.replace("Z", "+00:00"))
                    if ts < since:
                        continue
                except ValueError:
                    pass
        yield row


def analyze(rows: list[dict[str, Any]]) -> dict[str, Any]:
    total = len(rows)
    with_spec = [r for r in rows if r.get("spec_id")]
    without_spec = [r for r in rows if not r.get("spec_id")]
    format_drift = [
        r for r in with_spec
        if not SPEC_ID_FORMAT.match(str(r.get("spec_id", "")))
    ]
    unique_specs = sorted({str(r["spec_id"]) for r in with_spec})

    return {
        "total_dispatches": total,
        "with_spec_id": len(with_spec),
        "without_spec_id": len(without_spec),
        "anonymous_rate": round(len(without_spec) / total, 3) if total else 0.0,
        "format_drift_count": len(format_drift),
        "format_drift_examples": [r.get("spec_id") for r in format_drift[:5]],
        "unique_spec_ids": len(unique_specs),
        "unique_spec_ids_list": unique_specs,
    }


def print_human(report: dict[str, Any], window_days: int) -> None:
    print(f"SPEC-TRACE OBSERVABILITY / rolling {window_days}d window")
    print("=" * 56)
    print(f"  total dispatches         : {report['total_dispatches']}")
    print(f"  with spec_id             : {report['with_spec_id']}")
    print(f"  without spec_id          : {report['without_spec_id']}  "
          f"({report['anonymous_rate'] * 100:.1f}% anonymous)")
    print(f"  unique spec_ids          : {report['unique_spec_ids']}")
    print(f"  format-drift count       : {report['format_drift_count']}")
    if report["format_drift_examples"]:
        print(f"    examples:")
        for ex in report["format_drift_examples"]:
            print(f"      - {ex!r}")
    print()
    print("Convention: ^\\d{4}-\\d{2}-\\d{2}-[a-z0-9-]+$  (kebab-case + ISO-date prefix)")
    print()
    if report["total_dispatches"] == 0:
        print("  No dispatches in window. (Either router is idle, or log not present.)")
        return
    rate = report["anonymous_rate"]
    if rate > 0.80:
        print("  [observe] >80% anonymous dispatches. Spec-Trace gesture not propagating.")
        print("            Check cockpit Send-to-agent is wiring spec_id; check /yolo conductor too.")
    elif rate > 0.50:
        print("  [observe] >50% anonymous. Healthy for ramp-up; expect this to fall.")
    else:
        print("  [observe] majority of dispatches carry spec_id. Trace graph populated.")
    if report["format_drift_count"]:
        print("  [observe] format drift present. Convention is gentle — review the examples above.")


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(
        prog="spec-trace-observability",
        description="Report spec_id None-rate + format-drift over a rolling window.",
    )
    p.add_argument("--days", type=int, default=7, help="Rolling window size (default: 7)")
    p.add_argument("--log-path", type=Path, default=None,
                   help="Path to routing.jsonl (default: voice-operator logs)")
    p.add_argument("--json", action="store_true", help="Emit JSON instead of human text")
    args = p.parse_args(argv)

    log_path = args.log_path or default_routing_log()
    since = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=args.days)
    rows = list(read_decisions(log_path, since=since))
    report = analyze(rows)
    report["window_days"] = args.days
    report["log_path"] = str(log_path)
    report["attestation"] = "Built on SIP"

    if args.json:
        json.dump(report, sys.stdout, indent=2)
        sys.stdout.write("\n")
    else:
        print_human(report, args.days)
    return 0


if __name__ == "__main__":
    sys.exit(main())
