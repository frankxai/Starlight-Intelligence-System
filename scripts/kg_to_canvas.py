#!/usr/bin/env python3
"""Root-level shim: convert KG cache → JSON Canvas.

Usage:
    python scripts/kg_to_canvas.py \
        memory/knowledge-graph/_brain-cache.json \
        memory/atlases/brain-clusters.canvas

The actual implementation is service.memory.canvas_export.
"""

from __future__ import annotations

import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "private" / "voice-operator"))

from service.memory.canvas_export import main  # noqa: E402

if __name__ == "__main__":
    raise SystemExit(main())
