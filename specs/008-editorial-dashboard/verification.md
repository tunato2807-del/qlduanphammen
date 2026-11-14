# Kiểm chứng A + C — 15/11/2026

## CI của commit gốc

Commit `f64529db72913a20d121375386e29372647578f5`: [Finora quality #15](https://github.com/tunato2807-del/qlduanphammen/actions/runs/43448765318) **Failure**, 2m20s. Trang job xác nhận bước `Run npm run test:e2e` exit 1 và artifact `browser-failure` 864 KB. GitHub API trả Forbidden; trang job yêu cầu đăng nhập để xem log chi tiết. Vì vậy chưa xác định được test/assertion gốc, không quy lỗi cho ứng dụng khi thiếu bằng chứng. Reporter GitHub đã được thêm cho các lần CI tiếp theo để xuất annotations; không thêm retry hoặc giảm assertion.

## Thay đổi và kiểm tra

Trang chào có ảnh CC0 lưu nội bộ, nền kem và chữ serif. Dashboard nền xanh nhạt, sidebar giữ nguyên, thẻ số dư sáng, thẻ ngân sách trắng, biểu đồ thu/chi nét liền–đứt. Gợi ý hành động trên mobile dùng hai hàng để tránh ép chữ. API, schema, lockfile và phép tính tài chính không đổi.

- `npm run check:fast`: đạt TypeScript và Prettier.
- `npm test`: 40 đạt, 0 lỗi, 0 bỏ qua.
- `npm run build`: đạt API và web.
- `npm audit --audit-level=high`: 0 lỗ hổng.
- `CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`: **22 đạt, 0 lỗi, 0 bỏ qua**, 1.8 phút. Bao gồm axe, responsive, CRUD, ngân sách, kế hoạch, báo cáo, ảnh và ẩn/hiện số dư.
- Lượt E2E đầu: 20 đạt, 2 lỗi do API không còn nghe ở cổng 3001, frontend proxy trả 500. Đã khởi động lại dịch vụ và xác minh health trước lượt cuối. Đây là lỗi runtime của lượt thử, không phải bằng chứng về nguyên nhân CI cũ.
- Kiểm tra trực quan desktop 1440px và mobile 390px: ảnh tải được, số dư rõ, sidebar desktop và menu mobile hoạt động. Bộ responsive kiểm tra 320/390/768/1024/1440px; bảng giao dịch vẫn cuộn bên trong.
- Test mới kiểm tra ảnh thật có naturalWidth 600, nguồn cùng origin, ẩn/hiện số dư và hai đường biểu đồ. Test motion giữ kiểm tra pause/persistence/system preference trên trang trí floating đang hiển thị.

## Bundle

| Asset | Trước (kB / gzip) | Sau (kB / gzip) |
| --- | --- | --- |
| Main JS | 423.22 / 135.57 | 423.21 / 135.62 |
| CSS | 63.55 / 13.34 | 63.66 / 13.36 |
| Dashboard | 8.62 / 3.28 | 8.53 / 3.24 |
| Charts | 384.79 / 112.27 | 384.82 / 112.28 |

Ảnh PNG gốc khoảng 456 KiB, tải riêng, cùng origin; hero ưu tiên tải và ảnh cảm hứng lazy. Không thêm dependency.

Ảnh nghiệm thu: [trang chào](../../docs/images/ac-landing.png), [dashboard](../../docs/images/ac-dashboard.png), [mobile](../../docs/images/ac-mobile.png). Số liệu trong ảnh thuộc tài khoản demo tổng hợp.

## Bàn giao GitHub

Commit giao diện `0b3f64c` đã đẩy lên `main`, xác minh bằng `git ls-remote`. [CI mới #16](https://github.com/tunato2807-del/qlduanphammen/actions/runs/43621928165) được kích hoạt; tại thời điểm ghi nhận còn chạy. Kết quả local ở trên không thay thế trạng thái CI từ GitHub.
