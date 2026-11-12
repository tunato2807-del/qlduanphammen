# ADR 002 — Module rõ ràng, báo cáo snapshot và giữ dữ liệu

Accepted · 12/11/2026 · người dùng xác nhận làm lại toàn bộ UI/nghiệp vụ/kỹ thuật.

Controller chung trước đây phụ thuộc nhiều nghiệp vụ, khó bổ sung lifecycle. Báo cáo đọc thành phần riêng có thể lệch khi có ghi giữa các query.

Giữ modular monolith NestJS với Infrastructure, Identity, Ledger, Budgeting, Planning, Reporting và Demo. Demo riêng tránh vòng Identity/Ledger. Shared cookie helper, route cũ và guard giữ nguyên. Reports mở RepeatableRead, truyền client xuống helper, aggregate ở SQL và đọc tuần tự. Không đổi schema/migration, không microservice hoặc dịch vụ ngoài.

Đổi lại có thêm ranh giới file và latency snapshot/planning cao hơn baseline gần nhất; phép đo và kiểm thử đồng thời ở spec005. Frontend lazy, hooks theo owner/tháng và error boundaries, CSS một hệ token. Lifecycle thêm dùng schema đã có. Rollback mã về 05d9f0a không downgrade DB.

[Module graph và giải thích](../DESIGN.md#kiến-trúc-và-trải-nghiệm-ngày-12112026) · [bằng chứng](../../specs/005-application-modules/verification.md).
