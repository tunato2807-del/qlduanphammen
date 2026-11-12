# Plan — Vòng đời kế hoạch và sổ cá nhân

## Technical context

React 19/TypeScript, NestJS 11, PostgreSQL 17/Prisma JS; npm workspace và lệnh hiện có. Scope theo spec.md, user đã cho phép toàn bộ lần làm lại 12/11.

## Constitution check

BigInt, ownership, giữ dữ liệu/schema/migration, token/log riêng tư và accessibility; không đổi quyền hoặc phí. Đặc tả cũ là lịch sử, thay đổi này truy vết riêng. Không agent phụ theo AGENTS.

## Design

Không cần migration. GoalPatchDto + Planning.updateGoal, contribute điều kiện ADD/WITHDRAW theo trạng thái. Replacement dùng Idempotency.run, khóa rule; kiểm tra startMonth >= currentMonth+1, > startMonth cũ và <= endMonth cũ nếu có, cập nhật endMonth cũ = start mới−1 rồi create rule mới trong cùng tx. Không sửa amount/name của rule cũ, do đó draft cũ vẫn đọc đúng.
Ledger tạo Prisma where bằng AND gồm wallet OR source/destination, category, search OR; validate UUID/filter ownership; sort date asc/desc và id tie-breaker. Profile PATCH dùng safeUser. UI tách GoalCard/forms/rules list, tái dùng draft budget.

## Validation and rollback

Giữ và mở rộng tests có ý nghĩa; check:fast/API/build/browser/axe/responsive/audit. Baseline commit 05d9f0a. Rollback mã về baseline không cần downgrade DB vì không đổi schema. Giữ các hạng mục public/email thật ngoài phạm vi triển khai. Bằng chứng ghi verification.md khi chạy xong.
