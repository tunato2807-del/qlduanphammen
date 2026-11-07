# Mô hình dữ liệu

Schema nguồn: [schema.prisma](../../apps/api/prisma/schema.prisma). SQL bổ sung: [migration 202611070001](../../apps/api/prisma/migrations/202611070001_financial_planning/migration.sql). Không sửa migration đầu.

Sáu entity mới và quan hệ/validation/trạng thái được mô tả trong [FINANCIAL-FLOWS](../../docs/FINANCIAL-FLOWS.md#dữ-liệu-và-trạng-thái). Bốn khối bảo vệ chính:

- Draft: FK rule, unique(ruleId,month), transactionId unique nullable; state chỉ PENDING/CONFIRMED/SKIPPED.
- Contribution: FK goal/wallet, BIGINT khác 0; service kiểm tra owner, số dư và tổng phân bổ/rút theo từng ví, khóa theo user khi thay đổi.
- Idempotency: unique(user,key), hash canonical và response JSON trong cùng transaction.
- Reset: SHA256 token làm ID, FK user, expiresAt và index; reset/đổi mật khẩu hủy các token còn lại.

Budget revisions giữ mô hình hiện hữu; lịch sử đối chiếu live actual. Báo cáo query tháng ở Asia/Ho_Chi_Minh; khoản phân bổ và chuyển ví không được cộng vào thu/chi. Kế hoạch và tiền thực tế là hai khái niệm tách biệt.
