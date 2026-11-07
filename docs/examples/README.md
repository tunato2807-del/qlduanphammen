# Dữ liệu minh họa Finora

- [PDF báo cáo tháng](Finora-Bao-cao-mau.pdf): xuất từ tài khoản demo riêng, toàn bộ số liệu nhân tạo; không phải tài chính người dùng thật.
- [CSV nhập mẫu](finora-import-demo.csv): header chuẩn và một khoản chi. Sửa ngày, tên ví/danh mục theo tài khoản của bạn; xem trước rồi xác nhận. File không chứa ID hoặc thông tin tài khoản thật.

Tạo lại cùng ảnh giao diện bằng `CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium node scripts/capture-screenshots.mjs` khi DB đã chạy/migrate. Báo cáo lấy tháng tại thời điểm tạo, nên không coi số dư ví hiện tại là số dư cuối tháng.
