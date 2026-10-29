# Bàn giao Finora V2

Ngày 29/10/2026. Phạm vi theo CAPABILITY-MAP.md, đã được giao tiếp tục đặc tả, kế hoạch và triển khai trong cuộc trò chuyện. Ứng dụng hiện có đầy đủ nghiệp vụ MVP và giao diện làm lại; dữ liệu/schema/migration được giữ nguyên.

## Kết quả

- Frontend chia `app`, `features`, `shared`; App từ 1.405 dòng còn khoảng 400 dòng điều phối. Các trang và form có tệp riêng.
- Backend chia Wallets, Transactions, Budgets, Reports; bỏ service Finance gộp mọi nghiệp vụ. Giữ nguyên quy tắc tiền tệ, quyền sở hữu, API và migration.
- Một hệ CSS với token; bỏ lớp override Studio và dependency Tailwind không còn dùng. Nền ấm, sidebar tối, điểm nhấn lavender/lime; dashboard ưu tiên số dư và ngân sách.
- Giữ hiệu ứng nút, thẻ và minh họa; reduced-motion áp dụng cả hiệu ứng xuất hiện và tiến độ. Mobile menu hỗ trợ Escape, giữ và trả focus; có skip link.
- Lỗi khởi tạo phiên phân biệt 401 với lỗi mạng/server; có thử lại. Effect hủy request cũ để tránh ghi đè sau thay đổi trạng thái.
- Server tạo `X-Request-Id`, bổ sung `code`/`requestId` vào lỗi, giữ `message` cho tương thích. Log allowlist method, route template, status và duration; không ghi URL/query, body, cookie, user ID hoặc số tiền.
- CI có kiểm tra định dạng, TypeScript, API test, build, audit và browser tests. Cài package với lifecycle script tắt, chạy Prisma generate qua lệnh dự án.
- README, API, thiết kế, ADR, ảnh ứng dụng và PowerPoint/PDF/ghi chú đã được cập nhật.

## Kiểm chứng

| Kiểm tra                                                           | Kết quả                                                       |
| ------------------------------------------------------------------ | ------------------------------------------------------------- |
| Cài sạch `npm ci --ignore-scripts`, `npm run db:generate`          | Thành công từ lockfile                                        |
| `npm run check:fast`                                               | TypeScript và Prettier đạt                                    |
| `npm test`                                                         | 18 đạt, 0 fail/skip, PostgreSQL thật                          |
| `CI=1 CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e` | 6 đạt; cấu hình khởi động trong CI được kiểm tra cục bộ       |
| `npm run build`                                                    | API và frontend thành công                                    |
| `npm audit --audit-level=high`                                     | 0 lỗ hổng đã biết sau cập nhật dependency                     |
| Production smoke                                                   | Health 200, đăng nhập hiển thị, demo 403 mặc định             |
| Browser network production                                         | Trang đăng nhập không tải bundle biểu đồ/dashboard/báo cáo    |
| Ảnh tài liệu                                                       | 4 ảnh dữ liệu demo từ ứng dụng thật; không pageerror khi chụp |
| PowerPoint/PDF                                                     | 15 slide, có Notes; ảnh và số test theo V2                    |

Sáu test trình duyệt bao gồm: hành vi trên các trang/dialog chính; axe-core (WCAG 2 A/AA và 2.1 AA) không lỗi serious/critical trong phạm vi kiểm tra; viewport 320/390/768/1024/1440px; focus/skip link/Escape; giao dịch/ngân sách/CSV; đăng ký và tài khoản mới; reduced-motion; phân biệt lỗi server và đăng xuất. Không suy diễn kết quả này thành chứng nhận WCAG toàn diện hoặc kiểm thử mọi thiết bị/trình đọc màn hình.

## Dung lượng build

Số nén gzip do Vite báo, làm tròn; cùng chế độ production build. Đây là kích thước artifact, không phải số đo thời gian tương tác trên mạng di động.

| Hạng mục                           | Trước (e83cbbd)                                | V2                            |
| ---------------------------------- | ---------------------------------------------- | ----------------------------- |
| CSS                                | khoảng 16,6 KB gzip                            | khoảng 7,4 KB gzip            |
| JavaScript của đường tải đăng nhập | khoảng 242,6 KB gzip (index + motion + charts) | khoảng 130,5 KB gzip (entry)  |
| Biểu đồ                            | Có modulepreload ở đăng nhập                   | Tải khi vào dashboard/báo cáo |

Đã phát hiện cấu hình manualChunks cũ kéo dependency dùng chung vào chunk biểu đồ, khiến React.lazy chưa đủ để tách đường tải. Bỏ cấu hình này, dùng phân tách mặc định theo dynamic import và kiểm tra lại request thực tế. Chưa có số đo Web Vitals/RUM hoặc kiểm thử tải, nên không công bố cải thiện latency.

## Giới hạn và vận hành

- Chưa có public production, DNS/HTTPS hoặc dịch vụ hosting đã cấu hình. GitHub chứa mã và tài liệu, không phải URL website đã deploy.
- Workflow được commit; kết quả GitHub Actions và branch protection chưa được xác nhận trên dịch vụ trong phiên này. Các lệnh tương ứng đã kiểm tra cục bộ.
- PostgreSQL và log cần chính sách lưu trữ/sao lưu khi vận hành thật. Giữ `NODE_ENV=production`, HTTPS và không bật demo ngoài chủ đích.
- pg/Prisma còn cảnh báo deprecation về query xếp hàng trong transaction; các test đạt. Không tắt cảnh báo hoặc đổi driver lớn để che cảnh báo.
- Chưa có đồng bộ ngân hàng, AI, nhiều tiền tệ, quên mật khẩu qua email hoặc màn hình duyệt lịch sử revision. Bản cũ vẫn giữ revision trong DB như trước.
- Live docs framework không truy cập được từ mạng phiên này; giới hạn được ghi ở ADR-001, không tuyên bố đã đọc tài liệu live.

## Khôi phục

Không thay schema hoặc dữ liệu nên quay lại commit trước của mã nguồn không cần migrate ngược database. Dùng Git revert các commit ứng dụng V2 nếu cần; giữ nguyên `.env` và volume, build lại. Không chạy `docker compose down -v` hoặc sửa migration đã áp dụng.

Hồ sơ trước triển khai và phương án ban đầu vẫn được giữ trong thư mục này để đối chiếu. [Ảnh giao diện hiện tại](../images/dashboard.png), [PowerPoint](../presentation/Finora-Thuyet-trinh.pptx), [hướng dẫn chạy](../../README.md).
