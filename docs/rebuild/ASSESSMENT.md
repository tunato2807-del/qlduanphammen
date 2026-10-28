# Rà soát Finora trước khi làm lại

Ngày: 28/10/2026. Mã nguồn đối chứng: `e83cbbdb6bbbb1a97a6507cfd5d02d651f79068a`.

## Kết luận

Finora có nền tảng nghiệp vụ hoạt động và đáng giữ. Việc làm lại nên tập trung vào ranh giới module, tổ chức frontend, hệ thiết kế, khả năng tiếp cận và cơ chế kiểm chứng. Không có bằng chứng kỹ thuật để đổi stack hoặc xóa dữ liệu rồi viết lại mọi thứ.

Đây là báo cáo hiện trạng, chưa phải xác nhận đã xây xong phiên bản mới. Mã ứng dụng và migration hiện tại chưa thay đổi trong giai đoạn chuẩn bị này.

## Bằng chứng thực thi

| Kiểm tra                                                      | Kết quả                                                                    | Giới hạn diễn giải                                                                            |
| ------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `npm run build`                                               | API và frontend thành công                                                 | Chứng minh biên dịch/build được; không chứng minh mọi hành vi đúng                            |
| `npm test`                                                    | 17 đạt, 0 thất bại, 0 bỏ qua                                               | Unit và HTTP integration với PostgreSQL trong môi trường phát triển                           |
| `CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e` | 3 đạt                                                                      | Các luồng đã định nghĩa trong `e2e/app.spec.ts`; chưa bao phủ mọi trang/trạng thái            |
| `npm audit --json --cache /tmp/finora-npm-cache`              | 0 lỗ hổng đã biết; tổng 408 dependency theo báo cáo npm                    | Không thay thế kiểm toán mã hoặc xác minh chuỗi cung ứng                                      |
| axe-core 4.14.0, WCAG 2 A/AA + WCAG 2.1 AA                    | Cả đăng nhập và dashboard có `color-contrast`, mức serious                 | Chỉ hai màn hình, dữ liệu demo; lưu tối đa 5 node ví dụ mỗi loại lỗi                          |
| Viewport, sau khi chờ layout ổn định                          | 320→320, 390→390, 768→774, 1024→1024, 1440→1440 (viewport→scrollWidth, px) | Dashboard tablet có tràn 6px trong lần đo; cần test hồi quy và xác định phần tử trước khi sửa |
| Browser page errors trong đợt kiểm tra bổ sung                | Không ghi nhận                                                             | Không đồng nghĩa không có lỗi ở các nhánh chưa chạy                                           |

Bản ghi kiểm tra giao diện: [baseline-accessibility.json](baseline-accessibility.json). Kết quả responsive chỉ ghi sau khi chờ 700ms sau mỗi lần đổi kích thước; số đo ngay sau resize có thể sai do biểu đồ chưa tính lại kích thước.

## Điểm mạnh cần bảo toàn

- `apps/api/src/budget.ts`: tính bằng BigInt, làm tròn phần dư lớn nhất và giữ tổng chính xác; báo lỗi thiếu nguồn tiền.
- `apps/api/src/auth.ts`: scrypt, token ngẫu nhiên, lưu hash token, guard phiên và thu hồi phiên khác khi đổi mật khẩu.
- `apps/api/src/finance.ts`: kiểm tra quyền sở hữu ví/danh mục/giao dịch; chuyển ví không cộng vào thu/chi; xác nhận ngân sách tính lại tại server.
- `apps/api/prisma/migrations/202610250001_init/migration.sql`: ràng buộc dữ liệu và duy nhất kế hoạch đang áp dụng.
- `apps/web/src/Experience.tsx`: lựa chọn giảm chuyển động theo thiết bị và theo hệ điều hành.
- Test cốt lõi và luồng E2E đã chạy thành công; dữ liệu lịch sử và migration có thể tiếp tục sử dụng.

## Những phần cần thay đổi

### 1. Frontend dồn trách nhiệm

`apps/web/src/App.tsx` dài 1.405 dòng: xác thực, tải dữ liệu, điều hướng, sáu màn hình và nhiều form chỉnh sửa cùng một nơi. `Forms.tsx` 632 dòng và `Dashboard.tsx` 487 dòng cũng cần chia theo trách nhiệm trong quá trình làm lại. Đây là quan sát cấu trúc, không phải kết luận lỗi runtime chỉ dựa vào số dòng.

Hướng đề xuất: App chỉ lắp khung ứng dụng; mỗi tính năng có trang, form và hook tải dữ liệu của mình; thành phần dùng chung giữ API nhỏ. Không thêm thư viện state toàn cục nếu chưa có nhu cầu cụ thể.

### 2. CSS chồng lớp

`main.tsx` nạp `styles.css` 3.343 dòng rồi `studio.css` 1.492 dòng. Tệp sau override tệp trước, làm khó xác định nguồn giá trị khi chỉnh sửa.

Hướng đề xuất: một lớp token thống nhất và stylesheet theo khung/thành phần/tính năng. Thay dần từng màn hình, xác minh trước khi bỏ lớp cũ; không tiếp tục thêm tệp override thứ ba.

### 3. Tương phản và responsive

Các ví dụ từ axe-core:

- `.auth-copy > p`: tỷ lệ 3,37:1, yêu cầu 4,5:1 cho chữ thường ở kích thước đo được.
- `.auth-float > div`: 3,31:1, yêu cầu 4,5:1.
- `.nav-label`: 3,73:1, yêu cầu 4,5:1.
- `.sidebar-profile > div > small`: 3,96:1, yêu cầu 4,5:1.

Hướng đề xuất: màu chữ semantic đủ đậm, cỡ chữ phụ đọc được, trạng thái không chỉ dùng màu. Bổ sung kiểm tra tablet 768px và kiểm tra bàn phím/chuyển focus khi điều hướng.

### 4. Xử lý lỗi ở ranh giới

Khởi tạo `/auth/me` dùng `.catch(() => {})`, vì vậy lỗi mạng/500 và 401 đều dẫn đến màn hình đăng nhập; mã hiện tại không phân biệt các trường hợp. `types.ts` đang gộp kiểu dữ liệu, định dạng và HTTP client. Thông báo validation DTO là một thông báo tổng quát.

Hướng đề xuất: tách HTTP client khỏi kiểu/định dạng; phân biệt chưa đăng nhập và không kết nối được; lỗi có mã, thông báo an toàn và đường thử lại. Giữ thuộc tính `message` để tương thích khi bổ sung error code. Chi tiết trường cần allowlist để không trả lại dữ liệu nhạy cảm.

### 5. Backend cần ranh giới và số đo dữ liệu lớn

`Finance` xử lý ví, giao dịch, ngân sách và báo cáo. `wallets()` tải toàn bộ giao dịch rồi reduce lại theo từng ví; `summary()` tải giao dịch sáu tháng để tính trong Node. Đây là cơ hội đo và cải thiện, chưa phải khẳng định có vấn đề hiệu năng ở tải thực tế.

Hướng đề xuất: tách provider theo nhóm nghiệp vụ trong cùng ứng dụng NestJS. Đo ở tập dữ liệu thử có kích thước cố định trước/sau; chỉ đổi aggregation hoặc index khi giữ đúng kết quả và có bằng chứng. Không cache số dư với dữ liệu cũ.

### 6. Chất lượng dự án chưa được tự động hóa đầy đủ

Chưa có workflow GitHub Actions và chưa có lệnh lint trong `package.json`. Chưa có `CONSTRAINTS.md` và ADR để ghi tiêu chuẩn/đánh đổi. Mã khởi động có log NestJS nhưng chưa có request ID xuyên suốt để đối chiếu sự cố.

Hướng đề xuất: tiêu chuẩn có lệnh kiểm tra chạy được; CI typecheck/test/build/audit và E2E; logging có request ID, không ghi body, cookie hoặc bí mật. Các kiểm tra có công cụ và ngưỡng thực tế; không tuyên bố đạt coverage/Web Vitals khi chưa đo.

## Định hướng thiết kế đề xuất

Finora giữ nhận diện lavender/lime nhưng dùng nền ấm, chữ mực đậm và bề mặt trung tính nhiều hơn. Dashboard ưu tiên số dư, ngân sách còn lại và hành động thêm giao dịch; phần trang trí thu gọn. Bảng desktop và cách đọc giao dịch trên mobile có thứ tự thông tin riêng.

Hiệu ứng ngắn khi tương tác; chuyển cảnh nhẹ; không chạy hiệu ứng đếm qua nhiều số tiền khiến người dùng hiểu nhầm số dư. Hệ điều hành yêu cầu giảm chuyển động luôn được ưu tiên. Thêm lựa chọn giảm chuyển động vẫn cho phép thao tác mọi chức năng.

Xem [PDF phương án](Finora-V2-Phuong-an.pdf). Đây là mockup minh họa, chưa phải ảnh ứng dụng v2 đã triển khai.

## Bước duyệt trước triển khai

[Capability map](../../CAPABILITY-MAP.md) ghi sáu nhóm công việc và thứ tự. Skill `spec-driven-development` yêu cầu duyệt map trước khi viết đặc tả từng module. Sau bước đó, mỗi module được đặc tả, chia task nhỏ, thực thi và kiểm chứng theo các cổng tương ứng. Bản hiện tại tiếp tục là mốc so sánh.
