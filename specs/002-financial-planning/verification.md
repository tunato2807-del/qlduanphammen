# Kiểm chứng bàn giao — 07/11/2026

## Phạm vi và ủy quyền

Người dùng yêu cầu thêm toàn bộ hạng mục được đề xuất và xác nhận chưa có email/hosting/tên miền, chỉ chuẩn bị cấu hình triển khai sau. Giữ các chức năng V2 và dữ liệu cũ; không mua dịch vụ hoặc triển khai public. Đặc tả 002 bổ sung chức năng, các hồ sơ SPEC/tasks V2 được giữ nguyên.

## Kết quả

| Kiểm tra                                                      | Kết quả / bằng chứng                                                                                                                                                                                                        |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check:fast`                                          | TypeScript 0 lỗi, định dạng đạt                                                                                                                                                                                             |
| `npm test`                                                    | **34/34 đạt**, 0 fail/skip; PostgreSQL thật, SMTP test server cục bộ                                                                                                                                                        |
| `CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e` | **12/12 đạt**, 0 fail/skip; gồm các test V2 và các luồng mới                                                                                                                                                                |
| Accessibility/responsive                                      | Axe không serious/critical trong màn hình/dialog đã kiểm; viewport 320/390/768/1024/1440px không document overflow; keyboard, focus, Escape và reduced motion                                                               |
| Build                                                         | API và Vite production build đạt; Docker multi-stage cài theo lockfile/generate/build/prune offline đạt                                                                                                                     |
| Dependency                                                    | `npm audit --audit-level=high`: 0 vulnerabilities tại lần chạy cuối                                                                                                                                                         |
| Migration                                                     | SQL additive 202611070001 áp dụng qua runner, migration cũ giữ checksum; không reset/đổi volume                                                                                                                             |
| Backup/restore                                                | [restore-verification.json](restore-verification.json): SHA256 toàn bộ hàng của 13 bảng + migration ledger khớp; nguồn ổn định trước/sau backup, DB thử tự dọn                                                              |
| Production runtime                                            | [production-smoke.json](production-smoke.json): HTTPS nội bộ qua Caddy với CA tin cậy riêng, xác minh TLS bật; health/HSTS, web build, Secure/HttpOnly/SameSite cookie, demo 403, request replay, SQL report, PDF và logout |
| Performance                                                   | [performance.json](performance.json): cùng 10.000 fixture, baseline 27e9f72 vs mới, 3 warmup/20 mẫu luân phiên; exact totals/history khớp                                                                                   |
| Spec Kit                                                      | Prerequisite resolver nhận đủ research/data-model/contracts/quickstart/tasks; artifact list chạy được; không sửa scaffold upstream                                                                                          |
| Tài liệu/slide                                                | 15 slide native chỉnh sửa được, 15 trang PDF/Notes; font tiếng Việt, ảnh demo thật, PDF báo cáo kiểm tra text và hình                                                                                                       |

API có test hai tài khoản, phân bổ chính xác, ngày tháng Việt Nam, amount/transfer, archived reference, revision, token hết hạn/dùng một lần/thu hồi phiên. Mở rộng có concurrent sync/confirm nháp, replay/conflict ví/giao dịch/ngân sách/mục tiêu, 12 request ghi độc lập, CSV lỗi/quote/trùng/nguyên tử và export roundtrip có ký tự công thức/dấu nháy. Browser kiểm tra thêm giữ cùng key sau 503/429 và số còn/vượt với giá trị trên giới hạn Number; không chuyển tiền nghiệp vụ sang số thực.

## Hiệu năng và bundle

Provider summary trên 10.000 giao dịch giả lập: trung vị **106,28 → 20,42 ms**, p95 **117,99 → 27,77 ms**. Baseline đọc 20.000 hàng ledger trong nhánh tính số dư + sáu tháng, mới nhận 6 nhóm tháng + 1 nhóm chi + 2 nhóm ví trong fixture, cùng phần recent/count. Không đọc toàn ledger để tổng hợp trên Node. Số đo trên một môi trường PostgreSQL cục bộ, không phải load test hoặc SLA.

Baseline V2: CSS gzip khoảng 7,4 kB và JS entry 130,5 kB. Gói mở rộng: CSS khoảng 7,74 kB, JS entry khoảng 133 kB, PlanningPage lazy khoảng 3,48 kB gzip. Không tải thư viện PDF/CSV parser vào browser; các thư viện này ở API. Vite tiếp tục tách Charts/Reports/Dashboard/Planning, không ép manual chunk khiến chart preload ở login. Chưa đo Web Vitals production.

## Rà soát spec và sửa lỗi trong triển khai

10 FR, 5 SC và 7 US có truy vết trong [TRACEABILITY](../../docs/TRACEABILITY.md). Đối chiếu 5 nguyên tắc constitution: BigInt/ownership/migration preserve/testing/UI. Không có công việc build còn thiếu trong phạm vi đã chốt sau các gate.

Các phát hiện đã xử lý và có regression:

- Nút hover dịch lên/xuống qua biên con trỏ sau khi đổi form: đổi sang scale mở rộng, giảm chuyển động không chạy transform.
- Reset token không được xóa URL trong initializer vì React StrictMode gọi lại; đọc token không side effect, xóa trong effect và hỗ trợ hash navigation khi app đã mở.
- Hai GET đầu tạo nháp có thể đụng unique: dùng INSERT ON CONFLICT, giữ một rule/month.
- Validation trong thao tác ghi dùng chính transaction client, tránh xin thêm connection khi đang giữ transaction.
- Giữ key chống trùng cả sau lỗi 429, không chỉ mạng/5xx; phản hồi lỗi không chứng minh yêu cầu trước chưa ghi.
- Số còn/vượt ngân sách tính BigInt trên UI; Number chỉ dùng trực quan hóa/tỷ lệ hiển thị.
- CSV export escape thêm dấu nháy đơn để current export/import roundtrip không mất ký tự literal và vẫn chống công thức.

## Giới hạn kiểm chứng và vận hành

HTTPS smoke dùng Caddy/API cùng namespace mạng với upstream loopback, CA thử riêng; Compose production đã kiểm tra cấu hình nhưng chưa chạy với DNS/ACME công khai. Chưa có dịch vụ/tên miền hoặc SMTP thật. SMTP suite xác minh giao thức gửi và reset, chưa đánh giá deliverability ngoài Internet. Tác vụ gửi mail nền chưa có hàng đợi bền vững.

Mẫu systemd backup được cung cấp, shell script và lịch được kiểm tra; không được bật trên cloud. Không thể kiểm chứng khởi chạy unit Docker ở container này vì không có `docker.service` của systemd; cần kiểm tra sau khi cài trên host triển khai. Backup ngoài máy và retention vẫn là cấu hình của chủ vận hành, không giả vờ đã thiết lập.

Axe không thay chứng nhận WCAG; UAT người dùng còn chờ theo hồ sơ quản lý. `pg` hiện có cảnh báo deprecation về query trong transaction từ adapter; không che cảnh báo, khóa phiên bản hiện có đã đạt tests. Không tuyên bố toàn bộ production được chứng nhận bảo mật/hiệu năng từ bộ kiểm tra này.
