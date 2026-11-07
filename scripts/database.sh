#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
umask 077
compose=(docker compose --env-file "${FINORA_ENV_FILE:-.env}" -f "${FINORA_COMPOSE_FILE:-compose.yaml}")
command=${1:-help}
file=${2:-}
dump() { "${compose[@]}" exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom --no-owner --no-privileges'; }
query() { "${compose[@]}" exec -T db sh -c 'exec psql -X -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$1" -Atc "$2"' sh "$1" "$2"; }
restore() {
  local target=$1
  [[ "$target" =~ ^[a-z][a-z0-9_]{0,50}$ ]] || { echo 'Tên database đích không hợp lệ.' >&2; exit 1; }
  local original
  original=$("${compose[@]}" exec -T db sh -c 'printf %s "$POSTGRES_DB"')
  [ "$target" != "$original" ] || { echo 'Từ chối restore vào database đang dùng. Hãy tạo database riêng.' >&2; exit 1; }
  local tables
  tables=$(query "$target" "SELECT count(*) FROM pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema')")
  [ "$tables" = 0 ] || { echo 'Database đích phải rỗng; không xóa/ghi đè bảng hiện có.' >&2; exit 1; }
  "${compose[@]}" exec -T db sh -c 'exec pg_restore -U "$POSTGRES_USER" -d "$1" --no-owner --no-privileges --single-transaction --exit-on-error' sh "$target" < "$file"
}
case "$command" in
  backup)
    [ -n "$file" ] && [ ! -e "$file" ] || { echo 'Chỉ định file backup mới, chưa tồn tại.' >&2; exit 1; }
    mkdir -p "$(dirname "$file")"
    temp=$(mktemp "${file}.tmp.XXXXXX")
    trap 'rm -f "$temp"' EXIT
    dump > "$temp"
    [ -s "$temp" ] || { echo 'Backup rỗng.' >&2; exit 1; }
    mv "$temp" "$file"
    sha256sum "$file"
    ;;
  restore)
    [ -f "$file" ] && [ "${4:-}" = '--restore-to-empty' ] || { echo 'Dùng: database.sh restore FILE EMPTY_DB --restore-to-empty' >&2; exit 1; }
    restore "${3:-}"
    echo 'Đã restore vào database riêng. Kiểm chứng trước khi đổi DATABASE_URL.'
    ;;
  verify)
    [ -f "$file" ] || { echo 'Chỉ định file backup cần kiểm chứng.' >&2; exit 1; }
    target="finora_restore_$(date +%s)_${RANDOM}"
    "${compose[@]}" exec -T db sh -c 'createdb -U "$POSTGRES_USER" "$1"' sh "$target"
    trap '"${compose[@]}" exec -T db sh -c '\''dropdb -U "$POSTGRES_USER" "$1"'\'' sh "$target"' EXIT
    restore "$target"
    query "$target" 'SELECT '\''users='\''||count(*) FROM "User"; SELECT '\''wallets='\''||count(*) FROM "Wallet"; SELECT '\''transactions='\''||count(*) FROM "Transaction"; SELECT '\''migrations='\''||count(*) FROM "_finora_migrations";'
    echo 'Restore thử thành công; database thử sẽ được xóa, database nguồn được giữ.'
    ;;
  *) echo 'Dùng: database.sh backup FILE | verify FILE | restore FILE EMPTY_DB --restore-to-empty'; exit 1;;
esac
