# Tiêu chuẩn Finora

Ngày 29/10/2026. Phạm vi làm lại theo CAPABILITY-MAP.md.

- TypeScript: 0 lỗi, `npm run typecheck`.
- Format: `npm run format:check`; format không được làm đổi hành vi.
- API/unit và E2E: không test fail/skip; `npm test`, `npm run test:e2e`.
- Dependency: không advisory high/critical chưa xử lý, `npm audit --audit-level=high`.
- Accessibility: không axe serious/critical ở các màn hình/dialog chính được kiểm thử; test browser. Đây không phải chứng nhận WCAG toàn diện.
- Responsive: không document overflow ở 320/390/768/1024/1440px sau layout ổn định; bảng được cuộn trong container.
- Không suppression để làm xanh, không secret, không stub, không bỏ test lỗi.
- Không sửa migration đã chạy, không reset dữ liệu, không bỏ ownership/validation.
- Hiệu năng: ghi bundle thực đo trước/sau; chưa đặt ngưỡng latency/coverage do chưa có baseline đại diện.
