# Kiểm chứng Nhịp sống xanh

13/11/2026. Baseline `66186b7`. Phạm vi hoàn tất: menu, bảng màu xanh nhạt, minh họa chuyển động, nội dung/cảm hứng, responsive và tài liệu. **Ảnh hoặc số liệu người thật chưa hoàn tất** — xem blocker phía dưới.

- `npm run check:fast`: typecheck hai workspace và format đạt.
- `npm run build`: API/web đạt, không thêm dependency.
- `npm test`: 40 pass, 0 fail/skip. PostgreSQL hiện có, không reset; giữ tài khoản test riêng. Có warning deprecation pg đã có từ trước, không lỗi test.
- `CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`: lần cuối 21 pass/0 fail/0 skip, 1.6 phút. Lần đầu 20/21: ornament màu cát chỉ tương phản3.93; đã đổi #92783f → #786032 rồi chạy lại toàn bộ đạt, không hạ tiêu chuẩn axe.
- Axe trong suite kiểm tra đăng nhập/đăng ký, menu mobile mới, các màn hình/dialog chính: không serious/critical trong phạm vi chạy; không phải chứng nhận WCAG toàn diện.
- Trang chào và các màn hình: không document overflow ở320/390/768/1024/1440px. Menu mobile: Enter/Tab/Escape, trả focus, đóng khi chọn link; section và account nhận focus. CTA ngân sách/mục tiêu đưa đến tài khoản. Giảm chuyển động lưu qua reload và tôn trọng hệ điều hành.
- `npm audit --audit-level=high --cache /tmp/finora-npm-cache`: 0 vulnerabilities.
- Capture:12 ảnh demo và PDF/CSV, không pageerror. Đã xem trực quan hero1440, menu390, phần cảm hứng. Slide15 trang cập nhật ảnh và ghi rõ ảnh thật chưa có.
- [Bundle](bundle.json): entryJS411990 →423219bytes; gzip130978 →134867bytes. CSS55561 →63545bytes; gzip11551 →13252bytes. Bao gồm SVG inline và menu; không request asset ngoài. Chưa có ngưỡng performance/SLA hoặc kiểm thử thiết bị thật.

## Blocker ảnh người thật

`images.pexels.com` trả proxy CONNECT403; chưa tải ảnh và chưa xác minh giấy phép ảnh cụ thể. Không hotlink hoặc thay ảnh AI rồi gọi là người thật. Đã lưu thành công draft network restricted bổ sung `www.pexels.com`, `images.pexels.com`, giữ domain trước đó; tool trả `requires_publish:true`. Draft không áp dụng cho runtime hiện tại. Cần review/save trong environment settings rồi Publish. Sau đó mới chọn ảnh, ghi tác giả/URL/giấy phép/ngày tải, tối ưu và tích hợp. Câu hỏi người dùng về “dữ liệu thật” là ảnh hay số liệu chưa có phản hồi tại thời điểm bàn giao; không tự nhập dữ liệu tài chính cá nhân. Xem [nguồn hình](../../docs/VISUAL-SOURCES.md).
