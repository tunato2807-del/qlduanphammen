# Quyết định nghiệp vụ

- Không sửa trực tiếp số tiền/ngày/name rule đã có draft. Replacement tạo rule mới và kết thúc rule cũ trong một transaction để nháp/lịch sử cũ giữ đúng nội dung.
- Tháng mới từ tháng sau, sau start cũ và trong end cũ nếu có; kiểm tra edge rule chưa bắt đầu tránh SQL end < start.
- Lưu trữ goal là tổ chức danh sách, không giải phóng tiền. Cho phép rút cả goal/ví archived để không khóa phần đã dành.
- Dùng revision cũ làm draft, preview lại rồi tạo revision mới; không mở API ghi đè lịch sử.
- Wallet filter phải có cả source/destination; gom OR ví và OR search thành các nhóm AND riêng.
