#!/usr/bin/env bash
# Simple static file server using Python's built-in HTTP server.
# Usage: ./server.sh [port]
# Default port is 8000.
set -euo pipefail
PORT="${1:-8000}"
echo "Serving static files from $(pwd) on http://localhost:${PORT}"
python3 -m http.server "${PORT}" --bind 0.0.0.0
