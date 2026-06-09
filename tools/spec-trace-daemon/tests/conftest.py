"""Pytest config — adds tools/spec-trace-daemon/ to sys.path so ``import server``
resolves and tests can construct an isolated repo root via tmp_path.
"""

from __future__ import annotations

import sys
from pathlib import Path

_HERE = Path(__file__).resolve().parent
_DAEMON_DIR = _HERE.parent

if str(_DAEMON_DIR) not in sys.path:
    sys.path.insert(0, str(_DAEMON_DIR))
