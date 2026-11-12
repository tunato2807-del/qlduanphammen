# Finora — lần làm lại 12/11/2026

Người dùng xác nhận làm lại toàn bộ giao diện, nghiệp vụ và kỹ thuật. Giữ dữ liệu và tính năng đã có, không đổi stack vì chưa có lý do nghiệp vụ. Không reset hoặc ghi đè hồ sơ lịch sử.

Phạm vi được chia theo ranh giới: [003 trải nghiệm](../../specs/003-experience-renewal/spec.md), [004 vòng đời nghiệp vụ](../../specs/004-planning-lifecycle/spec.md), [005 module và snapshot](../../specs/005-application-modules/spec.md). Checklist triển khai chỉ nằm trong từng feature.

Hướng hình ảnh: nền xám xanh, mực navy, mint/lime + violet, sidebar sáng, thẻ tài sản tối, chữ Be Vietnam Pro tự host, chuyển động nhẹ có mục đích và tắt được. Thiết kế lại Auth, shell, Dashboard và presentation của mọi page/dialog.

Nghiệp vụ hoàn thiện: sửa/lưu trữ/khôi phục mục tiêu và rút phần dành của mục tiêu cũ; thay quy tắc từ tháng tương lai để giữ lịch sử; dùng phiên bản ngân sách làm bản nháp có cảnh báo; lọc ví gồm tiền chuyển đến, category/sort và CSV; sửa tên hồ sơ.

Kỹ thuật: controllers/module đúng capability, demo tách để tránh cycle; đọc report trên cùng snapshot; transaction client xuyên suốt, component/hooks theo trách nhiệm, lazy/error boundaries. Các API cũ giữ tương thích.

Cấu hình email/HTTPS và backup của lần bàn giao 07/11 vẫn giữ. Chưa mua hoặc kích hoạt dịch vụ bên ngoài. Ảnh và slide đã cập nhật từ ứng dụng chạy thật với dữ liệu demo; UAT người thật vẫn chờ chủ đề tài.

## Bàn giao và kiểm chứng

- [8 ảnh giao diện](../images/dashboard.png), [PPT 15 slide](../presentation/Finora-Thuyet-trinh.pptx), [PDF](../presentation/Finora-Thuyet-trinh.pdf) và [Notes](../presentation/Ghi-chu-thuyet-trinh.md). Bìa cần bổ sung họ tên/lớp/GVHD.
- TypeScript/format, build, **40 API + 18 browser** đạt, không skip; audit 0 vulnerabilities. Axe/responsive/keyboard/reduced motion trong phạm vi kiểm thử, chưa phải chứng nhận WCAG toàn diện.
- Docker production non-root/read-only, HTTPS Caddy nội bộ xác minh CA, cookie Secure, demo tắt, replay, summary, profile, PDF và logout đạt. Không tạo website công khai.
- Giữ nguyên schema/migration và volume cũ; không reset. Email/hosting/tên miền vẫn chờ cấu hình dịch vụ thật.

[Bằng chứng UI](../../specs/003-experience-renewal/verification.md) · [nghiệp vụ](../../specs/004-planning-lifecycle/verification.md) · [kỹ thuật](../../specs/005-application-modules/verification.md) · [API](../API.md) · [thiết kế](../DESIGN.md).

## Số đo và giới hạn

[Benchmark](../../specs/005-application-modules/performance.json) dùng 10.000 giao dịch, baseline 05d9f0a: median 19,03 → 41,44 ms, p95 22,84 → 51,14 ms. Bản mới cần snapshot tuần tự và thêm dữ liệu kế hoạch, nên chậm hơn; kết quả tiền vẫn khớp. Đây là phép đo provider cục bộ, chưa phải load test/SLA.

[Bundle](../../specs/005-application-modules/bundle.json), gzip level 9 cùng dependencies: JS entry 132.340 → 129.959 byte; CSS 7.719 → 10.857 byte cho hệ thiết kế mới. Lazy pages/charts/fonts tính riêng. Chưa đo Web Vitals production. Cảnh báo upstream pg/Prisma và giới hạn vận hành ghi trong verification kỹ thuật, không bị che để làm xanh kiểm thử.

## GitHub

Mã và bộ bàn giao ở commit `e83ad7d` đã push thành công lên `main` và `feature/finora-renewal`, fast-forward từ `05d9f0a`, không ghi đè lịch sử. Commit tài liệu sau đó chỉ hoàn tất checklist/ghi nhận bàn giao. Các gate ở trên chạy trong môi trường cloud; không coi đó là kết quả GitHub Actions chưa quan sát.
