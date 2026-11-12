# Trải nghiệm Finora mới

Ngày 12/11/2026. Người dùng xác nhận làm lại toàn bộ giao diện, nghiệp vụ và kỹ thuật. Feature này chỉ quản lý phần thay đổi tương ứng, không ghi đè lịch sử V2/002. Giữ VND, tháng Việt Nam và dữ liệu riêng từng tài khoản.

## User scenarios & acceptance

### US1 — Không gian tài chính thống nhất (P1)

Mọi trang đăng nhập, tổng quan, sổ, ví, ngân sách, kế hoạch, báo cáo và cài đặt có bố cục mới, đọc số tiền rõ, dùng cùng màu/chữ/thành phần. Giữ mọi chức năng đã có.
Nghiệm thu: thao tác tạo/sửa/xóa, import/export, ngân sách, mục tiêu và định kỳ vẫn hoàn thành được bằng trình duyệt.

### US2 — Thao tác có hướng dẫn (P1)

Tài khoản mới biết cần tạo ví rồi ghi giao dịch/lập ngân sách. Người dùng có thể tìm nhanh, mở hành động bằng bàn phím, nhìn rõ trạng thái trống/tải/lỗi và các khoản cần xử lý.
Nghiệm thu: không hiển thị dữ liệu tháng cũ như tháng mới khi tải; lỗi có retry; lỗi hiển thị có màn hình phục hồi.

### US3 — Mobile và chuyển động (P1)

Giao diện trẻ trung với chuyển động có mục đích, tắt được theo lựa chọn hoặc hệ điều hành. Menu, modal và bảng thao tác được bằng bàn phím/điện thoại.
Nghiệm thu: không tràn document ở 320/390/768/1024/1440; không axe serious/critical ở các trang/dialog thay đổi; Escape/focus hoạt động.

## Functional requirements

- FR01: Giữ đầy đủ chức năng của spec 002 và hợp đồng giao tiếp hiện hữu.
- FR02: Thiết kế mới xuyên suốt, một hệ token semantic và thành phần dùng chung, số tiền chính xác hiển thị ngay.
- FR03: Dashboard có hành động tiếp theo và đối chiếu thực tế/kế hoạch, không tạo số liệu giả cho tài khoản trống.
- FR04: UI thực hiện đầy đủ lifecycle mới của spec 004; bộ lọc ví/danh mục/chiều thời gian áp dụng cả xuất CSV.
- FR05: Tách trang kế hoạch, biểu mẫu và hook dữ liệu; trang tải theo nhu cầu, có ErrorBoundary và phục hồi mạng.
- FR06: WCAG automated/keyboards/responsive/reduced motion theo tiêu chuẩn dự án.
- FR07: Ảnh, README, tài liệu và slide cập nhật đúng phần đã làm, không tự bật dịch vụ ngoài.

## Success criteria

- SC01: Các acceptance trên được kiểm chứng bằng test/đối chiếu thật, không skip hoặc hạ gate.
- SC02: TypeScript/format/API/build/E2E/audit phù hợp phạm vi đạt theo CONSTRAINTS.
- SC03: Không mất dữ liệu/migration cũ, không tạo số liệu tài chính giả cho người dùng.

## Assumptions & dependencies

Tái sử dụng stack hiện có. Không mua dịch vụ, không deploy public/email thật vì chủ dự án chưa có dịch vụ/tên miền. Hợp đồng 002 tiếp tục hoạt động. Phối hợp các feature 003–005; không có quyết định sản phẩm đang chờ duyệt.
