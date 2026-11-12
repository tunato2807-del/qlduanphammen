# Ranh giới module và báo cáo nhất quán

Ngày 12/11/2026. Người dùng xác nhận làm lại toàn bộ giao diện, nghiệp vụ và kỹ thuật. Feature này chỉ quản lý phần thay đổi tương ứng, không ghi đè lịch sử V2/002. Giữ VND, tháng Việt Nam và dữ liệu riêng từng tài khoản.

## User scenarios & acceptance

### US1 — Trách nhiệm rõ ràng, hợp đồng ổn định (P1)

Các endpoint tài khoản, ledger, budgeting, planning, reporting và demo tiếp tục chạy đúng nhưng có ranh giới module/đường phụ thuộc rõ, không controller phụ thuộc chéo mọi nghiệp vụ.
Nghiệm thu: các request/status/cookie/money/error cũ vượt regression; demo vẫn tạo tài khoản riêng, production vẫn tắt theo cấu hình.

### US2 — Báo cáo cùng một thời điểm đọc (P1)

Summary và PDF lấy các thành phần số dư, thu/chi, ngân sách, recent từ một snapshot nhất quán khi có ghi đồng thời; không xin thêm connection khi đang giữ transaction.
Nghiệm thu: test xác minh snapshot đồng thời và exact BigInt; bộ dữ liệu lớn không phải tải toàn sổ lên frontend/Node.

## Functional requirements

- FR01: Nest modules có dependency acyclic và providers/exports đủ cho ứng dụng/test.
- FR02: Infrastructure/identity/ledger/budgeting/planning/reporting/demo tách trách nhiệm, demo không tạo cycle về identity.
- FR03: Báo cáo dùng transaction snapshot cho mọi query và truyền transaction client xuống các service đọc.
- FR04: Giữ request ID/log allowlist, ownership, secure cookie, body limit và rate limit.
- FR05: Không đổi stack/schema hoặc migration; CI/Docker/runtime vẫn chạy; đo bundle/query khi có thay đổi.

## Success criteria

- SC01: Các acceptance trên được kiểm chứng bằng test/đối chiếu thật, không skip hoặc hạ gate.
- SC02: TypeScript/format/API/build/E2E/audit phù hợp phạm vi đạt theo CONSTRAINTS.
- SC03: Không mất dữ liệu/migration cũ, không tạo số liệu tài chính giả cho người dùng.

## Assumptions & dependencies

Tái sử dụng stack hiện có. Không mua dịch vụ, không deploy public/email thật vì chủ dự án chưa có dịch vụ/tên miền. Hợp đồng 002 tiếp tục hoạt động. Phối hợp các feature 003–005; không có quyết định sản phẩm đang chờ duyệt.
