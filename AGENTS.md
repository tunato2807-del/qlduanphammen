# Finora

Đọc CONSTRAINTS.md, CAPABILITY-MAP.md và SPEC module liên quan trước thay đổi. Trạng thái ở tasks/todo.md. Không hạ chuẩn để kiểm tra đạt.

React/TypeScript + NestJS + PostgreSQL. Lệnh trong package.json. Giữ tiền chính xác bằng bigint; API số tiền chuỗi VND. Không reset database hoặc sửa migration đã chạy. scripts/migrate.mjs là runner SQL chính thức, không dùng prisma migrate deploy. Không log body, token, mật khẩu, dữ liệu tài chính.

Người dùng đã giao tiếp tục đặc tả, kế hoạch và triển khai trọn gói trong phạm vi map ngày 29/10/2026. Không yêu cầu duyệt lại từng thao tác refactor/UI/test thông thường. Không deploy dịch vụ có phí hoặc mở rộng scope nhạy cảm khi chưa trao đổi.

## Spec Kit (từ 2026-11-04)

Đọc `.specify/memory/constitution.md` khi dùng Spec Kit. Thay đổi mới dùng `specs/<số>-<tên>/{spec,plan,tasks}.md`; `SPEC-*.md` và `tasks/` cũ là hồ sơ V2 đã hoàn thành, không ghi đè hoặc tạo hai checklist hoạt động cho cùng thay đổi. Hướng dẫn: docs/SPEC-KIT.md. CLI: `npm run spec-kit -- <lệnh>`. Trong Codex dùng `$speckit-specify`, `$speckit-plan`, `$speckit-tasks`, `$speckit-analyze`, `$speckit-implement`, `$speckit-converge`; các skill được cài trong `.agents/skills/`. Không tự chạy workflow gọi agent khác hoặc cài extension ngoài yêu cầu.
