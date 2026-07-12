#!/bin/sh
set -e

nginx -g "daemon off;" &

exec python -m uvicorn backend.app.server:create_app --factory --host 0.0.0.0 --port 4321 --log-level warning
