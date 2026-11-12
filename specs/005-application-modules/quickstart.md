# Chạy và kiểm chứng

Từ repo root, giữ .env và DB volume hiện có:

```bash
bash scripts/setup.sh
npm run check:fast
npm test
npm run build
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

Nếu chưa có Chromium, cài theo hướng dẫn môi trường/README. Không chạy reset hoặc prisma migrate deploy. Migrate dùng runner SQL của dự án, không sửa migration đã áp dụng. Xem docs/OPERATIONS.md cho HTTPS/SMTP, chưa có dịch vụ thật.

Demo: đăng nhập dữ liệu mẫu → tạo/sửa mục tiêu → phân bổ/lưu trữ/rút/khôi phục → đổi rule từ tháng tương lai → dùng revision ngân sách làm draft → lọc ví nhận chuyển và tải CSV → xem PDF. Tài khoản riêng không có dữ liệu demo giả định. Chọn tab recurring rồi đổi tháng, tab phải giữ.

Kết quả, giới hạn và artifacts trong verification.md; benchmark tùy chọn ở feature005, không ghi đè bằng chứng002.
