#!/usr/bin/env python3
"""Menu API for the Docker drills. Uses the Python standard library only."""

import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

MENU = [
    {"id": "espresso", "name": "Espresso", "price": 2.5},
    {"id": "cardamom-latte", "name": "Cardamom latte", "price": 4.5},
    {"id": "knafeh", "name": "Knafeh", "price": 5.5},
]


class Handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        cafe = os.environ.get("CAFE_NAME", "Drillbook Cafe")
        if self.path == "/health":
            self._send(200, {"ok": True, "cafe": cafe})
        elif self.path == "/menu":
            self._send(200, {"cafe": cafe, "items": MENU})
        else:
            self._send(404, {"error": "not found"})

    def _send(self, status: int, payload: dict[str, object]) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt: str, *args: object) -> None:
        print("%s - %s" % (self.address_string(), fmt % args), flush=True)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print(f"listening on {port}", flush=True)
    server.serve_forever()
