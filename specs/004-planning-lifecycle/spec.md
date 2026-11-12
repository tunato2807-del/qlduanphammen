# Vòng đời kế hoạch và sổ cá nhân

Ngày 12/11/2026. Người dùng xác nhận làm lại toàn bộ giao diện, nghiệp vụ và kỹ thuật. Feature này chỉ quản lý phần thay đổi tương ứng, không ghi đè lịch sử V2/002. Giữ VND, tháng Việt Nam và dữ liệu riêng từng tài khoản.

## User scenarios & acceptance

### US1 — Mục tiêu dùng được suốt vòng đời (P1)

Sửa tên, số đích và hạn; lưu trữ/khôi phục mục tiêu. Lưu trữ không xóa lịch sử, không tự giải phóng tiền đã dành. Mục tiêu lưu trữ vẫn rút được phần đã dành, không được dành thêm.
Nghiệm thu: owner được sửa, tài khoản khác 404; không thay contributions khi sửa metadata; tổng tài sản không đổi.

### US2 — Thay lịch định kỳ an toàn (P1)

Người dùng đặt thay đổi có hiệu lực từ tháng tương lai (từ tháng sau và sau tháng bắt đầu rule cũ). Quy tắc cũ kết thúc trước tháng mới; quy tắc mới có số tiền/lịch riêng. Lịch sử, nháp cũ và giao dịch đã xác nhận giữ nguyên nội dung.
Nghiệm thu: không trùng tháng hai quy tắc; nháp cũ vẫn xác nhận được nếu chưa tạm dừng; hai thay đổi đồng thời chỉ một thành công; retry cùng key không tạo thêm.

### US3 — Dùng lại ngân sách (P1)

Lấy một phiên bản cũ làm bản nháp, sửa và preview trước khi xác nhận revision mới. Danh mục đã lưu trữ bị loại phải được thông báo; không âm thầm áp dụng cũ.
Nghiệm thu: lựa chọn bản cũ không ghi DB; xác nhận tạo revision mới, giữ bản cũ.

### US4 — Sổ và hồ sơ rõ ràng (P1)

Lọc theo ví (cả chuyển đến), danh mục, loại và thứ tự ngày, kết hợp tìm kiếm và tháng; CSV dùng cùng bộ lọc. Đổi tên hiển thị hồ sơ, giữ email và xác thực hiện có.
Nghiệm thu: kết quả đúng, không dữ liệu chéo account; hồ sơ đổi xong hiện trên sidebar và khi đăng nhập lại.

## Functional requirements

- FR01: Mọi ID/quan hệ kiểm tra owner, tiền nguyên VND và idempotency giữ nguyên.
- FR02: PATCH goal chỉ thay tên/target/date/archived, không sửa saved trực tiếp; archived chỉ rút.
- FR03: POST replacement có hiệu lực từ tháng sau trở đi, nguyên tử, khóa quy tắc và giữ lịch sử cũ.
- FR04: Dùng revision làm draft phải có preview và cảnh báo loại danh mục; không đổi active khi chưa xác nhận.
- FR05: Bộ lọc ví gồm nguồn hoặc đích; category và sort kết hợp điều kiện đúng, export cùng semantics.
- FR06: Sửa tên hồ sơ không đổi email, mật khẩu hoặc cookie policy.
- FR07: Giữ schema và migrations; chỉ thêm route/DTO tương thích client cũ.

## Success criteria

- SC01: Các acceptance trên được kiểm chứng bằng test/đối chiếu thật, không skip hoặc hạ gate.
- SC02: TypeScript/format/API/build/E2E/audit phù hợp phạm vi đạt theo CONSTRAINTS.
- SC03: Không mất dữ liệu/migration cũ, không tạo số liệu tài chính giả cho người dùng.

## Assumptions & dependencies

Tái sử dụng stack hiện có. Không mua dịch vụ, không deploy public/email thật vì chủ dự án chưa có dịch vụ/tên miền. Hợp đồng 002 tiếp tục hoạt động. Phối hợp các feature 003–005; không có quyết định sản phẩm đang chờ duyệt.

## Edge cases đã chốt

Rule chưa bắt đầu không thể replacement ngay tháng đầu: tạm dừng rồi tạo mới; replacement phải sau start cũ để không tạo end < start. Nếu có end cũ, start mới không vượt end cũ. Target mới thấp hơn saved được giữ như trạng thái vượt mục tiêu, không tự rút. Bộ lọc ví/danh mục lưu trữ vẫn xem được lịch sử. Danh mục ngân sách lưu trữ bị loại khỏi draft với thông báo trước xác nhận.
