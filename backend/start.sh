#!/usr/bin/env bash
# Start the Digital Twin Django backend (development)
#
# First time setup:
#   python -m venv .venv
#   source .venv/bin/activate        (Windows: .venv\Scripts\activate)
#   pip install -r requirements.txt
#   cp .env.example .env             (edit secret key)
#   python manage.py migrate
#   python manage.py createsuperuser (optional, for /admin)
#
# Fine-tune the twin (optional):
#   python -m twin.training.trainer --epochs 3
#
# Then run:
#   bash start.sh

set -e

if [ ! -f ".env" ]; then
  echo "No .env found — copying from .env.example"
  cp .env.example .env
fi

python manage.py migrate --run-syncdb

# Use daphne (ASGI) for WebSocket + HTTP
daphne -b 0.0.0.0 -p 8000 twin_backend.asgi:application
