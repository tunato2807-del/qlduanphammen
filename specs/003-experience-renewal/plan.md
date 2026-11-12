# Plan — Trải nghiệm Finora mới

## Technical context

React 19/TypeScript, NestJS 11, PostgreSQL 17/Prisma JS; npm workspace và lệnh hiện có. Scope theo spec.md, user đã cho phép toàn bộ lần làm lại 12/11.

## Constitution check

BigInt, ownership, giữ dữ liệu/schema/migration, token/log riêng tư và accessibility; không đổi quyền hoặc phí. Đặc tả cũ là lịch sử, thay đổi này truy vết riêng. Không agent phụ theo AGENTS.

## Design

Giữ React 19/TypeScript/Motion/Recharts. Làm lại CSS theo token (canvas xám xanh, ink navy, mint/lime và violet), sidebar trắng, thẻ tài sản navy; typography Be Vietnam Pro tự host. Không thêm UI framework.
Tách `useFinanceData`, `useLedger`, ErrorBoundary; lazy page boundaries. Viết lại Dashboard, Auth, Sidebar/Topbar và style của mọi trang/form. PlanningPage điều phối các components/forms riêng theo spec 004. Native dialog/focus, chart lazy và giảm chuyển động giữ nguyên.
Gắn UI bộ lọc mới, cấu hình hồ sơ và lấy phiên bản ngân sách làm draft. Không lưu dữ liệu tài chính trong browser storage.

## Validation and rollback

Giữ và mở rộng tests có ý nghĩa; check:fast/API/build/browser/axe/responsive/audit. Baseline commit 05d9f0a. Rollback mã về baseline không cần downgrade DB vì không đổi schema. Giữ các hạng mục public/email thật ngoài phạm vi triển khai. Bằng chứng ghi verification.md khi chạy xong.
