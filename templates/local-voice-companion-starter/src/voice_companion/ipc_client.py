"""JSON-lines IPC client for communication between Tauri Rust shell and Python sidecar."""

from __future__ import annotations

import json
from typing import Any


class VoiceIpcProtocol:
    @staticmethod
    def create_request(request_id: str, method: str, params: dict[str, Any] | None = None) -> str:
        return json.dumps({
            "id": request_id,
            "method": method,
            "params": params or {},
        })

    @staticmethod
    def parse_response(line: str) -> dict[str, Any]:
        return json.loads(line.strip())
