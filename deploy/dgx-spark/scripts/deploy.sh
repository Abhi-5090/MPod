#!/usr/bin/env bash
# Builds and (re)starts mPod on the DGX Spark from the checked-out code.
#   sudo -u mpod /opt/mpod/deploy/dgx-spark/scripts/deploy.sh      # build only
#   then: sudo systemctl restart mpod-backend
# Or, as a user with sudo rights: RESTART=1 ./deploy.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/mpod}"
cd "$APP_DIR"

echo "==> Updating code"
if [ -d .git ]; then git pull --ff-only; fi

echo "==> Installing backend dependencies"
npm ci --prefix backend --omit=dev

echo "==> Building student website"
npm ci --prefix frontend
npm --prefix frontend run build

echo "==> Building admin portal"
npm ci --prefix Admin
npm --prefix Admin run build

if [ "${RESTART:-0}" = "1" ]; then
  echo "==> Restarting backend"
  sudo systemctl restart mpod-backend
  for i in $(seq 1 30); do
    if curl -fsS http://127.0.0.1:8002/backend/api/health >/dev/null 2>&1; then break; fi
    sleep 1
  done
  curl -fsS http://127.0.0.1:8002/backend/api/health && echo
  echo "==> Checking AI providers"
  npm --prefix backend run ai:check -- --health-only
fi

echo "==> Done"
