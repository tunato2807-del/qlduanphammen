# Kế hoạch triển khai

Giữ React/TypeScript, NestJS và PostgreSQL, BigInt. Người dùng đã chấp thuận mở rộng ngày 07/11/2026.

## Constitution Check

Không reset/sửa migration cũ. Mọi tham chiếu kiểm tra ownership tại API; cookie HttpOnly, HTTPS production; không log dữ liệu/token. API cũ tương thích. Chỉ thêm dependency cần thiết (CSV chuẩn, PDF Unicode, SMTP). Không dịch vụ tính phí.

## Thiết kế

- Migration SQL bổ sung reset token, idempotency, recurring rule/draft, savings goal/contribution; ràng buộc/check/index và FK rõ ràng.
- Provider `Idempotency`: khóa theo user/key, hash nội dung + scope, cùng transaction với thay đổi và response JSON; key không hết hạn trong lần bàn giao để replay không ghi trùng sau thời gian dài.
- `Planning`: quy tắc hàng tháng và đóng góp; xác nhận nháp khóa hàng, kiểm tra lại ví/danh mục. Mục tiêu ghi phân bổ tiền có sẵn, không ghi thu/chi. ADD khóa người dùng và đọc số dư bằng SQL trong transaction; WITHDRAW không âm.
- `Imports`: csv-parse, định dạng mẫu và CSV hiện có; preview và commit cùng bộ xác thực, giới hạn 200 dòng, hash canonical để so trùng hiện tại, khóa người dùng khi commit. Không giữ file upload.
- `Recovery`: SHA256 token ngẫu nhiên, hết hạn 30 phút, SMTP cấu hình qua env; mailbox dev qua Mailpit. Không in liên kết ra log.
- Báo cáo dùng SQL tổng hợp theo tháng Việt Nam và groupBy thay vì đọc mọi giao dịch; ví groupBy. PDFKit với font Unicode có giấy phép kèm, file trả attachment.
- UI bổ sung trang Kế hoạch (định kỳ + mục tiêu), nhập CSV trong giao dịch, lịch sử và gợi ý ở ngân sách, PDF/comparison ở báo cáo, forgot/reset ở auth.
- Vận hành: Docker multi-stage nonroot, Caddy HTTPS, compose riêng; backup/restore script từ chối restore vào DB không rỗng, runbook, diễn tập trên DB tạm.

## Trình tự và kiểm chứng

T001 đặc tả → T002 data/idempotency → T003 budget → T004–005 recurring → T006 goals → T007 CSV → T008 reporting → T009 recovery → T010 ops → T011 benchmark → T012 docs → T013–014 release.
Mỗi behavior có test ý nghĩa; API integration dùng Postgres. Build/typecheck/format, audit, E2E cũ+mới, axe và responsive. Đo report với 10k giao dịch trên account benchmark, dọn account sau; không tuyên bố SLA từ một môi trường.

## Khôi phục

Rollback code về commit trước mở rộng; giữ migration/tables mới (additive). Backup trước migrate production. Restore chỉ trên DB mới, đối chiếu trước khi chuyển kết nối. Không downgrade tự động xóa dữ liệu.
