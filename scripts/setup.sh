#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
command -v node >/dev/null
command -v docker >/dev/null
if [ ! -f .env ]; then cp .env.example .env; fi
if [ ! -f apps/api/.env ]; then cp apps/api/.env.example apps/api/.env; fi
export npm_config_cache="${TMPDIR:-/tmp}/finora-npm-cache"
npm ci --ignore-scripts
npm run db:generate
docker compose up -d db
ready=0
for attempt in $(seq 1 30); do
  if docker compose exec -T db pg_isready -U finora -d finora >/dev/null 2>&1; then ready=1; break; fi
  sleep 2
done
if [ "$ready" != 1 ]; then echo 'PostgreSQL chưa sẵn sàng. Kiểm tra docker compose logs db.' >&2; exit 1; fi
npm run db:migrate
echo 'Đã chuẩn bị xong. Chạy bash scripts/start.sh để mở ứng dụng.'
