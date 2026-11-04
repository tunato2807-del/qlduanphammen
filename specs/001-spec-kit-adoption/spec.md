# Feature Specification: Tích hợp GitHub Spec Kit

- **Feature**: `001-spec-kit-adoption`
- **Created**: 2026-11-04
- **Status**: Implemented — tooling/docs, không đổi behavior ứng dụng
- **Input**: Người dùng yêu cầu thêm https://github.com/github/spec-kit vào Finora.

## User Scenarios & Testing

### User Story 1 — Dùng Spec Kit trong Codex (Priority: P1)

Người phát triển mở repository và dùng các skill Spec Kit để đặc tả, lập kế hoạch,
chia task và kiểm tra thay đổi kế tiếp.

**Acceptance**: Có đủ chín `.agents/skills/speckit-*/SKILL.md` do CLI chính thức
generate, Codex là integration mặc định, các template và script Bash được resolve.

### User Story 2 — Giữ quy tắc và hồ sơ Finora (Priority: P1)

Người phát triển đọc constitution và liên kết tới tài liệu V2 mà không phải viết
lại toàn bộ hệ thống từ đầu.

**Acceptance**: Constitution không còn placeholder, phản ánh BigInt, ownership,
migration runner, kiểm thử theo phạm vi; `SPEC-*.md` và `tasks/` cũ được giữ.

### User Story 3 — Cài lại cùng phiên bản (Priority: P2)

Người phát triển dùng một lệnh npm để chạy CLI ở môi trường Python riêng, theo
version và dependency lock được commit.

**Acceptance**: `npm run spec-kit -- version` báo 1.3.0; không cần thêm Python
package vào runtime Node; `.venv` và state cục bộ không được commit.

## Requirements

- FR-001: Dùng Spec Kit v1.3.0 ổn định từ kênh phân phối chính thức.
- FR-002: Commit scaffold, chín skill Codex, constitution, nguồn/version/license.
- FR-003: Có wrapper CLI và lockfile Python riêng trong `tools/spec-kit`.
- FR-004: Có hướng dẫn tiếng Việt, phân biệt lệnh terminal với skill trong chat.
- FR-005: Không đổi `apps/`, schema, migration, dữ liệu hoặc Node dependency.
- FR-006: Kiểm chứng CLI, inventory, tạo feature/plan/tasks, prerequisites và
  bước kiểm tra nhanh của repository.

## Success Criteria

- SC-001: Chín skill và template xuất hiện trong inventory của CLI 1.3.0.
- SC-002: `check-prerequisites.sh --require-spec --require-tasks --json` nhận đủ
  tài liệu của feature tích hợp này sau khi hoàn tất.
- SC-003: Không có khác biệt mã ứng dụng/database so với baseline `ecfdcd5`.
- SC-004: `npm run check:fast`, kiểm tra cú pháp Bash và các lệnh tooling đều đạt.

## Scope and Compatibility

Chỉ tích hợp toolkit core cho Codex. Không cài extension bên ngoài, không chạy
workflow gọi agent khác, không tự thêm tính năng hoặc triển khai website.
