#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
docker compose up -d db
ready=0
for attempt in $(seq 1 30); do
  if docker compose exec -T db pg_isready -U finora -d finora >/dev/null 2>&1; then ready=1; break; fi
  sleep 2
done
if [ "$ready" != 1 ]; then echo 'PostgreSQL chưa sẵn sàng.' >&2; exit 1; fi
npm run db:migrate
exec npm run dev
