#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if ! command -v uv >/dev/null 2>&1; then
  echo 'Cần cài uv và Python 3.11+ trước khi dùng Spec Kit. Xem docs/SPEC-KIT.md.' >&2
  exit 1
fi
export UV_CACHE_DIR="${UV_CACHE_DIR:-${TMPDIR:-/tmp}/finora-uv-cache}"
export UV_SYSTEM_CERTS="${UV_SYSTEM_CERTS:-true}"
exec uv run --project tools/spec-kit --locked specify "$@"
