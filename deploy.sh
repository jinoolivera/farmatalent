#!/bin/bash
# Server-side deploy script for FarmaTalent
# Called by GitHub Actions after git pull
set -euo pipefail

DEPLOY_DIR="/root/farmatalent"

echo "==> [1/5] Pull latest code"
cd "$DEPLOY_DIR"
git pull origin main

echo "==> [2/5] Rebuild and restart containers"
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build --remove-orphans

echo "==> [3/5] Wait for backend to be ready"
sleep 5

echo "==> [4/5] Run migrations"
docker exec farmatalent_backend php artisan migrate --force

echo "==> [5/5] Clear caches"
docker exec farmatalent_backend php artisan config:clear
docker exec farmatalent_backend php artisan route:clear
docker exec farmatalent_backend php artisan view:clear

echo "==> Deploy complete"
