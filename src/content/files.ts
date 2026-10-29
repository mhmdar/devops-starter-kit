export const menuApiApp = `#!/usr/bin/env python3
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
`;

export const menuApiDockerfile = `FROM python:3.12-slim

WORKDIR /app
COPY app.py .
ENV PORT=8000
EXPOSE 8000
CMD ["python", "-u", "app.py"]
`;

export const menuApiDockerignore = `.git
.env
*.log
`;

export const cafeIndexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>North Gate Cafe</title>
    <style>
      body {
        font-family: Georgia, serif;
        max-width: 36rem;
        margin: 3rem auto;
        padding: 0 1rem;
        line-height: 1.5;
      }
      h1 { font-weight: 500; }
    </style>
  </head>
  <body>
    <h1>North Gate Cafe</h1>
    <p>This page is a file. Nginx is serving it. The page does not know the menu.</p>
    <p>
      The menu is the other container. From your browser, open
      <a href="http://127.0.0.1:8000/menu">http://127.0.0.1:8000/menu</a>.
      That link works on your laptop because Compose published both ports.
      It does not work from inside this container. The next steps show why.
    </p>
  </body>
</html>
`;

export const composeYaml = `services:
  api:
    build: ./menu-api
    image: menu-api:lab
    ports:
      - "8000:8000"
    environment:
      PORT: "8000"
      CAFE_NAME: "North Gate Cafe"
  web:
    image: nginx:alpine
    ports:
      - "8088:80"
    volumes:
      - ./web:/usr/share/nginx/html:ro
    depends_on:
      - api
`;

export const helloTxt = `North Gate Cafe is open.
Today: espresso, cardamom latte, knafeh.
`;

export const bootSh = `#!/bin/bash
echo boot-ok > /var/tmp/drillbook.txt
`;

export const labFileOnDisk: Record<string, { contents: string; diskPath: string }> = {
  "menu-api/app.py": {
    contents: menuApiApp,
    diskPath: "student-labs/docker/menu-api/app.py",
  },
  "menu-api/Dockerfile": {
    contents: menuApiDockerfile,
    diskPath: "student-labs/docker/menu-api/Dockerfile",
  },
  "menu-api/.dockerignore": {
    contents: menuApiDockerignore,
    diskPath: "student-labs/docker/menu-api/.dockerignore",
  },
  "web/index.html": {
    contents: cafeIndexHtml,
    diskPath: "student-labs/docker/web/index.html",
  },
  "compose.yaml": {
    contents: composeYaml,
    diskPath: "student-labs/docker/compose.yaml",
  },
  "aws/hello.txt": {
    contents: helloTxt,
    diskPath: "student-labs/aws/hello.txt",
  },
  "aws/boot.sh": {
    contents: bootSh,
    diskPath: "student-labs/aws/boot.sh",
  },
};
