# Kế hoạch

Tách trang chào khỏi Auth thành features/welcome; dùng Experience cho tùy chọn chuyển động, CSS riêng cho trang chào và SVG tự vẽ. Menu là disclosure điều hướng, không phải ARIA application menu. Link đưa focus đến section; đóng menu bằng Escape trả focus. Giữ form và token khôi phục nguyên trạng.

Màu chủ đạo xanh trời nhạt + chữ lam đậm đủ tương phản, điểm nhấn kem/ngọc bích. Hình SVG minh họa, không mô tả là ảnh người thật. Không thêm dependency/API/schema. Các cảnh đời sống chỉ mô tả công dụng sản phẩm, không gắn danh tính/số tiền thật.

Kiểm chứng responsive, menu bàn phím, giảm chuyển động/lưu lựa chọn, axe toàn trang và các luồng đã có. Đo entry JS/CSS, chụp browser và cập nhật tài liệu. Hạng mục ảnh thật ghi riêng trạng thái chặn, không đánh dấu hoàn tất chung. Rollback bằng revert commit, không tác động DB.
