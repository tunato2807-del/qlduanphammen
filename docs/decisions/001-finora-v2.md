# ADR-001: Làm lại Finora trong cùng stack và schema

## Trạng thái

Accepted — phạm vi được giao tiếp tục ngày 29/10/2026.

## Bối cảnh

MVP build được và các test cốt lõi đạt, nhưng App.tsx chứa 1.405 dòng và hai stylesheet chồng lớp. Axe ghi nhận lỗi tương phản, tablet có tràn ngang. Người dùng muốn giao diện Gen Z đồng thời bảo đảm chất lượng đồ án.

## Quyết định

Giữ React/TypeScript, NestJS, PostgreSQL và schema hiện có. Tách frontend theo feature, shell và shared; tách backend thành Wallets/Transactions/Budgets/Reports trong một ứng dụng. Một stylesheet dùng token semantic. Dashboard và report tải động để không tải biểu đồ trên trang đăng nhập. Dữ liệu và migration giữ nguyên.

## Phương án khác

- Viết mới cả DB/API hoặc đổi framework: tăng rủi ro mất tính tương thích mà chưa có số đo chứng minh lợi ích.
- Giữ App nguyên rồi thêm CSS override: tiếp tục tăng độ khó bảo trì và kiểm soát tương phản.
- Microservice/state store toàn cục: không có nhu cầu đủ mạnh cho chi phí vận hành và đồng bộ.

## Hệ quả và giới hạn

Giữ được sổ giao dịch, quyền sở hữu và các ràng buộc BigInt. Hợp đồng HTTP giữ message, bổ sung code/requestId; log không có body/cookie/PII/amount. App vẫn điều phối trạng thái của một ứng dụng nhỏ; không thêm framework dữ liệu mới. Chưa có public production, distributed tracing, kiểm thử tải hay UI duyệt lịch sử phiên bản ngân sách.

## Căn cứ

Mã nguồn, lockfile, test và baseline trong docs/rebuild/ASSESSMENT.md. Đã thử truy cập tài liệu chính thức React useEffect/lazy, Nest modules và Motion reduced-motion; mạng của phiên không tải được các trang đó. Vì vậy không khẳng định đã xác minh tài liệu live: cách dùng được đối chiếu type đã cài và kiểm chứng build/runtime. Tham chiếu để người bảo trì đọc thêm:

- https://react.dev/reference/react/useEffect
- https://react.dev/reference/react/lazy
- https://docs.nestjs.com/modules
- https://motion.dev/docs/react-use-reduced-motion
