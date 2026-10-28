# Kế hoạch Finora V2

Phạm vi được giao tiếp tục 29/10/2026, theo CAPABILITY-MAP.md và sáu SPEC-*.md. Giữ dữ liệu và stack.

1. Tách HTTP/format, xử lý lỗi khởi tạo, regression test 401/500.
2. Tách trang/form/khung frontend bằng biến đổi tự động, giữ hành vi; typecheck + E2E.
3. Tách provider ví, giao dịch, ngân sách, báo cáo; giữ API/schema; API test.
4. Thay hai lớp CSS bằng hệ stylesheet có token; dashboard mới và responsive; browser/axe.
5. Request ID, lỗi có code tương thích; CI/format/audit/browser gates.
6. Ảnh, hướng dẫn, ADR và PowerPoint theo bản chạy thật; kiểm chứng cuối và GitHub.

Mỗi nhóm có commit riêng sau kiểm chứng; lỗi chặn bước kế tiếp. Rủi ro chính: bỏ sót class CSS khi thay, thay hành vi khi tách JSX, stale response khi đổi tài khoản. Giảm bằng AST extraction, giữ test cũ và thêm kiểm thử trạng thái lỗi/viewport/accessibility. Không thay schema hoặc tối ưu truy vấn khi thiếu số đo.
