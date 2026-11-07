#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export FINORA_ENV_FILE=.env.production
export FINORA_COMPOSE_FILE=compose.production.yaml
exec bash scripts/database.sh backup ".local/backups/finora-$(date -u +%Y%m%dT%H%M%SZ).dump"
