# Implementation Plan: GitHub Spec Kit adoption

**Feature**: `001-spec-kit-adoption` | **Date**: 2026-11-04 | **Spec**: [spec.md](spec.md)

## Summary

Dùng CLI v1.3.0 từ PyPI chính thức, đối chiếu mã nguồn tag v1.3.0, khởi tạo core
scaffold cho Codex và giữ hồ sơ V2. Tool Python được khóa dependency qua uv và
chạy bằng wrapper npm; web/API không cần Spec Kit để hoạt động.

## Technical Context

- Tooling: Python >=3.11, uv, Bash; CLI `specify-cli==1.3.0`.
- Agent integration: Codex skills, script `sh`, không thêm git/agent-context extension.
- Cấu trúc: `.specify/` (core), `.agents/skills/` (Codex), `specs/` (feature mới),
  `tools/spec-kit/` (pyproject + uv.lock), `scripts/spec-kit.sh` (CLI wrapper).
- Existing context: React/TypeScript, NestJS, PostgreSQL; không thay đổi runtime.

## Constitution Check

- Tiền, ownership và migration không bị thay đổi.
- Tooling tách khỏi runtime; không thêm dịch vụ hoặc gọi agent khác.
- `SPEC-*.md`, `tasks/` và tiêu chuẩn cũ giữ nguyên; hướng dẫn agent tham chiếu cả
  context cũ và feature mới, tránh hai nguồn task đang hoạt động.
- Kiểm chứng chỉ tập trung tooling/docs và `check:fast`; không cần Docker hay
  chạy lại browser/database suite cho thay đổi này.

## Execution

1. Rà README, Codex integration và hướng dẫn brownfield ở tag ổn định.
2. Khóa CLI/dependency, tạo wrapper, init scaffold chính thức và kiểm tra diff.
3. Điền constitution từ quy tắc Finora; tạo bounded feature tích hợp toolkit.
4. Ghi nguồn/license, hướng dẫn tiếng Việt, liên kết AGENTS/README.
5. Kiểm tra CLI/inventory, script tạo và resolve tài liệu, prerequisites,
   Bash syntax và chất lượng repo. Commit và đẩy GitHub.

## Risks and Mitigations

- Init `--force` có thể ghi managed path: xem output trong thư mục thử trước,
  commit baseline và chỉ init khi chưa có `.specify/`/skill cùng tên trong dự án.
- Version mới đổi layout: ghim CLI và core asset 1.3.0; nâng có chủ đích, xem diff,
  không tự chạy lại init trên constitution đã điền.
- State máy cục bộ: bỏ qua `.venv`, `feature.json` và state agent ngoài skill.
- Runtime events/extensions có thể gọi công cụ khác: chỉ cài core, không tự chạy
  `workflow run`, không tự cài extension.
