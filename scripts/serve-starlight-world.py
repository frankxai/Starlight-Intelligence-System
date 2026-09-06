#!/usr/bin/env python3
"""Serve Starlight World on loopback only. No Next.js."""

from __future__ import annotations

import http.server
import socketserver
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "docs" / "starlight-world"
HOST = "127.0.0.1"
PORT = 8767


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)


def main() -> None:
    with socketserver.TCPServer((HOST, PORT), Handler) as httpd:
        print(f"Starlight World  http://{HOST}:{PORT}/")
        httpd.serve_forever()


if __name__ == "__main__":
    main()
