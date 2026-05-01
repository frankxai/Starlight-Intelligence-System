#!/usr/bin/env python3
"""Root-level shim: lint memory/ frontmatter from anywhere in the repo.

Usage:
    python scripts/lint_memory_frontmatter.py memory/

Bootstraps PYTHONPATH to include private/voice-operator so the service module
imports cleanly. The actual implementation is service.memory.frontmatter.
"""

from __future__ import annotations

import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "private" / "voice-operator"))

from service.memory.frontmatter import main  # noqa: E402

if __name__ == "__main__":
    raise SystemExit(main())
