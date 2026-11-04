# Finora Constitution

## Core Principles

### I. Tính đúng của dữ liệu tài chính

Mọi phép tính tiền nghiệp vụ MUST dùng số nguyên VND (`bigint`/PostgreSQL `BIGINT`);
API MUST biểu diễn số tiền bằng chuỗi số nguyên. Chuyển ví MUST bảo toàn tổng tài
sản và không được tính là thu/chi. Thu nhập, tiết kiệm dự kiến MUST được phân biệt
với số tiền thực tế. Phân bổ ngân sách tự động MUST giữ tổng chính xác từng đồng
và từ chối kế hoạch thiếu nguồn tiền. Biểu đồ có thể dùng `number` để trực quan hóa,
nhưng không được trở thành nguồn tính tiền hoặc ghi dữ liệu.

### II. Quyền sở hữu và riêng tư theo tài khoản

Mọi tài nguyên bảo vệ và ID tham chiếu MUST được xác thực, kiểm tra quyền sở hữu
ở backend. Frontend không quyết định quyền truy cập. Phiên MUST dùng cookie
HttpOnly; production MUST có HTTPS và Secure cookie. Log MUST NOT ghi mật khẩu,
token, cookie, body, PII hoặc số tiền. Giữ request ID và metadata allowlist hiện có.
Không tích hợp dịch vụ ngoài, AI hoặc chia sẻ dữ liệu nhạy cảm chỉ vì template có
ví dụ về chúng.

### III. Bảo toàn dữ liệu, hợp đồng và kiến trúc

Giữ React/TypeScript, NestJS, PostgreSQL và hướng phụ thuộc trong
`CAPABILITY-MAP.md` trừ khi yêu cầu mới có lý do thay đổi rõ ràng. Thay đổi MUST
xét tính tương thích API, consumer và dữ liệu hiện hữu. Không reset database,
không xóa volume, không sửa migration đã áp dụng. Migration mới MUST theo runner
`apps/api/scripts/migrate.mjs`; không dùng `prisma migrate deploy` hoặc
`prisma migrate reset` cho dự án này. Mỗi thay đổi có rủi ro MUST có cách khôi phục
mã và kế hoạch xử lý dữ liệu phù hợp.

### IV. Kiểm chứng theo phạm vi thay đổi

Lỗi và behavior nghiệp vụ mới MUST có kiểm thử có ý nghĩa; tái hiện lỗi trước khi
sửa khi khả thi. Kiểm tra phù hợp MUST đạt trước khi bàn giao; không bỏ test,
không thêm suppression hoặc hạ chuẩn để làm xanh. Sửa tài liệu/tooling chỉ cần
kiểm tra liên kết, cú pháp và lệnh liên quan; không bắt buộc chạy lại toàn bộ
browser/database suite khi ứng dụng không đổi. Các lệnh và ngưỡng hiện hành ở
`CONSTRAINTS.md` là nguồn kiểm chứng, không tuyên bố coverage hoặc hiệu năng chưa đo.

### V. Trải nghiệm rõ ràng và dễ tiếp cận

UI MUST dùng hệ token hiện có, hỗ trợ tiếng Việt, trạng thái tải/rỗng/lỗi và thao
tác bàn phím. Thay đổi bố cục MUST được kiểm tra ở các viewport liên quan, gồm
320/390/768/1024/1440px cho các trang chính. Chuyển động MUST tôn trọng lựa chọn
thiết bị và hệ điều hành; số tiền thực tế hiển thị chính xác ngay. Kiểm tra axe-core
ở màn hình/dialog thay đổi MUST không còn lỗi serious/critical trong phạm vi đó;
kết quả tự động không phải chứng nhận WCAG toàn diện.

## Project Boundaries

- Phạm vi hiện tại: tài chính cá nhân, VND, ngân sách tháng và múi giờ Việt Nam.
- Frontend: `apps/web/src/app`, `features`, `shared`; backend: các provider
  `wallets.ts`, `transactions.ts`, `budgets.ts`, `reports.ts` trong một ứng dụng.
- Tiêu chuẩn và cách chạy: `AGENTS.md`, `CONSTRAINTS.md`, `README.md`,
  `docs/DESIGN.md`, `docs/API.md` và các ADR hiện có.
- `SPEC-*.md` cùng `tasks/` là hồ sơ V2 đã hoàn thành, MUST được giữ để đối chiếu.
  Spec Kit quản lý thay đổi mới trong `specs/<số>-<tên>/`; không chuyển toàn bộ
  hệ thống thành một feature mới và không ghi đè hồ sơ cũ.
- Spec Kit là công cụ phát triển; MUST NOT trở thành dependency runtime của web/API.

## Development Workflow and Quality Gates

Mỗi thay đổi mới có phạm vi rõ ràng: specify → clarify khi cần → plan → tasks →
analyze → implement → converge. Duyệt đặc tả/kế hoạch khi cần quyết định sản phẩm,
phá hợp đồng, đổi schema hoặc mở rộng quyền/phí. Quyền người dùng đã giao trong
cuộc trò chuyện tiếp tục có hiệu lực; không hỏi duyệt lại từng thao tác kỹ thuật
thông thường trong cùng phạm vi.

Lưu `spec.md`, `plan.md`, `tasks.md` và bằng chứng kiểm chứng trong cùng thư mục
feature. Các tài liệu hoàn tất là hồ sơ lịch sử; behavior thay đổi tiếp theo được
đặc tả bằng feature riêng và tham chiếu hồ sơ trước. Không để hai checklist hoạt
động cho cùng một thay đổi giữa `tasks/` cũ và `specs/` mới.

Các lệnh chất lượng:

- `npm run check:fast`: TypeScript và định dạng.
- `npm test`: unit/API integration khi nghiệp vụ/backend bị ảnh hưởng.
- `npm run build`: build khi mã hoặc công cụ build bị ảnh hưởng.
- `npm run test:e2e`: các luồng và accessibility khi UI/hành vi bị ảnh hưởng.
- `npm audit --audit-level=high`: kiểm tra dependency npm khi cập nhật hoặc release.
- `npm run spec-kit -- version`, `npm run spec-kit -- artifact list --json` và
  các script `.specify/scripts/bash/`: kiểm tra tích hợp Spec Kit.

## Governance

Constitution này tổng hợp các quy tắc đã có trong dự án khi tích hợp Spec Kit.
Tuân theo chỉ dẫn người dùng và quyền đã cấp; không dùng constitution để tự mở
rộng phạm vi hoặc tự cấp quyền thao tác dữ liệu/dịch vụ bên ngoài.

Mọi sửa đổi MUST ghi lý do, ảnh hưởng tới nguyên tắc/tài liệu và ngày sửa; giữ
đồng bộ `CONSTRAINTS.md` cùng hướng dẫn agent khi có thay đổi thực sự. Version theo
SemVer: major khi bỏ/đổi nguyên tắc không tương thích, minor khi thêm nguyên tắc,
patch khi làm rõ nội dung. Không được hạ tiêu chuẩn nhằm che lỗi. Rà soát việc tuân
thủ trong plan/analyze và trước bàn giao.

**Version**: 1.0.0 | **Ratified**: 2026-11-04 | **Last Amended**: 2026-11-04
