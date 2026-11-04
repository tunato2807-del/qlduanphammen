# Tasks: Spec Kit adoption

**Input**: [spec.md](spec.md), [plan.md](plan.md).

**Scope**: Tooling và tài liệu; không thay ứng dụng/database.

## Setup

- [x] T001 Đọc nguồn tag v1.3.0, hướng dẫn existing-project/Codex và thử init ở thư mục tạm.
- [x] T002 Ghim CLI/dependency trong `tools/spec-kit/pyproject.toml` và `uv.lock`, tạo `scripts/spec-kit.sh`.

## US1 — Codex skills

- [x] T003 Khởi tạo core `.specify/` và chín `.agents/skills/speckit-*/SKILL.md` bằng CLI chính thức.
- [x] T004 Kiểm tra integration Codex và CLI artifact inventory.

## US2 — Quy tắc và hồ sơ

- [x] T005 Điền `.specify/memory/constitution.md` theo tiêu chuẩn Finora; giữ nguyên hồ sơ V2.
- [x] T006 Thêm feature tích hợp này và hướng dẫn `docs/SPEC-KIT.md`, liên kết AGENTS/README.

## US3 — Tái lập và bàn giao

- [x] T007 Thêm `npm run spec-kit -- <lệnh>`, bỏ qua `.venv` và state cục bộ, ghi nguồn/license.
- [x] T008 Xác minh CLI 1.3.0, manifest/inventory, prerequisites, Bash syntax, `npm run check:fast` và diff ứng dụng không đổi.
- [x] T009 Commit và đẩy GitHub sau khi kiểm chứng; ghi kết quả trong `verification.md`.
