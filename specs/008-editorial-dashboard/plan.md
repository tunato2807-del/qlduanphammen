# Kế hoạch

1. Xác minh CI gốc bằng GitHub Actions; ghi rõ giới hạn truy cập log.
2. Dùng ảnh CC0 Rachel Michetti từ bộ dữ liệu scikit-image, lưu tại public/images; không hotlink. Giữ SVG cho cảnh bờ biển/thành phố.
3. Chỉnh trực tiếp stylesheet hiện hành và thành phần Welcome/Dashboard/Charts; giữ toàn bộ callback và phép tính bigint. Bỏ trang trí khỏi thẻ số dư để tăng khả năng đọc.
4. Kiểm thử ảnh thật, CTA, ẩn/hiện số dư và chart; chạy typecheck, format, API, build, audit và E2E. Chụp desktop/mobile để kiểm tra trực quan.
5. Ghi bằng chứng, commit và push. Không sửa lịch sử migration. Rollback giao diện bằng revert commit, không cần migration.

Đối chiếu constitution: giữ kiến trúc/quyền sở hữu, dữ liệu tài chính, accessibility, motion và các quality gate. Không thêm dependency hay dịch vụ ngoài vào runtime.
