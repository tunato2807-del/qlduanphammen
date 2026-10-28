# SPEC reporting: Báo cáo và tổng quan

## Mục tiêu và phạm vi

Giữ số dư hiện tại và báo cáo theo tháng Việt Nam. Tách service/report page/charts. Dashboard ưu tiên số dư và ngân sách còn lại; tách biểu đồ khỏi bundle đăng nhập.

Bối cảnh: đồ án tài chính cá nhân, VND, ngân sách tháng, múi giờ Việt Nam. Phạm vi theo CAPABILITY-MAP.md; thực hiện theo ủy quyền tiếp tục ngày 29/10/2026.

## Công nghệ và cấu trúc

Giữ phiên bản trong package-lock.json: React 19, NestJS 11, Prisma 6.19 và PostgreSQL 17. Frontend: apps/web/src/features, shared, app. Backend: apps/api/src với provider theo nghiệp vụ. Không thêm microservice, auth vendor hoặc state store.

## Lệnh

- Build: `npm run build`
- Typecheck: `npm run typecheck`
- API/unit/integration: `npm test`
- Browser: `CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`
- Database: `npm run db:migrate` (runner SQL có sẵn)

## Quy ước

TypeScript strict, hook theo trách nhiệm; không cast để che lỗi; Prettier. Ví dụ kiểu hợp đồng: `type TransactionKind = "INCOME" | "EXPENSE" | "TRANSFER"`. API tiền dùng chuỗi, nội bộ dùng bigint khi tính tổng.

## Nghiệm thu và kiểm thử

Sáu tháng và danh mục đúng; thu/chi loại chuyển ví; số tiền thật hiển thị ngay; đo bundle trước/sau.

Giữ test hiện có. Behavior thay đổi có regression test thực tế; UI kiểm tra trên Chromium, lỗi runtime và axe-core. Không đặt chỉ tiêu coverage/Web Vitals khi chưa có số đo.

## Ranh giới

Luôn giữ ownership, dữ liệu, hợp đồng tương thích và kiểm chứng từng phần. Tự thực hiện các refactor/UI/test/CI trong phạm vi được giao. Cần trao đổi lại khi mở rộng chức năng nhạy cảm, đổi auth, phá hợp đồng hoặc phát sinh phí. Không reset DB, không sửa migration đã chạy, không log body/cookie/bí mật.
