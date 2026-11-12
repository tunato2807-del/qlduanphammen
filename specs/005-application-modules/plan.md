# Plan — Ranh giới module và báo cáo nhất quán

## Technical context

React 19/TypeScript, NestJS 11, PostgreSQL 17/Prisma JS; npm workspace và lệnh hiện có. Scope theo spec.md, user đã cho phép toàn bộ lần làm lại 12/11.

## Constitution check

BigInt, ownership, giữ dữ liệu/schema/migration, token/log riêng tư và accessibility; không đổi quyền hoặc phí. Đặc tả cũ là lịch sử, thay đổi này truy vết riêng. Không agent phụ theo AGENTS.

## Design

InfrastructureModule global Database/Idempotency; IdentityModule Accounts/SessionGuard/Recovery; LedgerModule Wallets/Transactions/Imports; BudgetingModule Budgets; ReportingModule Reports; PlanningModule Planning; DemoModule Demo + public DemoController riêng dùng shared sign-in helper, tránh Identity→Demo→Ledger→Identity.
Controller tách theo capability, route cũ giữ nguyên. main.ts chỉ middleware/bootstrap; AppModule và HealthController riêng. Reports.summary dùng RepeatableRead transaction và gọi service helper nhận Prisma.TransactionClient; chạy tuần tự trên connection đó. Transactions.list tách query helper để không mở transaction lồng. Planning góp/rút và token không Promise.all trên cùng connection. Không tách microservice.

## Validation and rollback

Giữ và mở rộng tests có ý nghĩa; check:fast/API/build/browser/axe/responsive/audit. Baseline commit 05d9f0a. Rollback mã về baseline không cần downgrade DB vì không đổi schema. Giữ các hạng mục public/email thật ngoài phạm vi triển khai. Bằng chứng ghi verification.md khi chạy xong.
