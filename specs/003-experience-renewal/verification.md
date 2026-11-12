# Kiểm chứng trải nghiệm — 12/11/2026

18/18 browser tests đạt, không fail/skip; 12 test cũ giữ nguyên và 6 test renewal thêm. Axe không serious/critical trên trang/dialog được chạy, responsive 320/390/768/1024/1440 không document overflow, bàn phím/focus/Escape và giảm chuyển động đạt. Không suy diễn thành chứng nhận WCAG hoặc mọi thiết bị.

Lỗi contrast trên bộ lọc archived goal đã tái hiện bằng axe rồi sửa token theo nền. Lỗi mất tab recurring khi đổi tháng đã tái hiện bằng test rồi sửa hash tab. Test giữ response tháng mới để xác nhận dữ liệu tháng cũ bị ẩn; test gây lỗi render một lần để xác nhận boundary và reload phục hồi.

Script capture tạo 8 ảnh demo + PDF/CSV mẫu, không page error; đã xem Dashboard/Auth và slide. PPT native có 15 slide/Notes, PDF 15 trang, font tiếng Việt. Bìa tên/lớp/GVHD để người dùng điền đúng.

[Bundle và các gate chung](../005-application-modules/verification.md). Ảnh ở docs/images, slide ở docs/presentation; dữ liệu đều demo. UAT chủ đề tài và website/email thật chưa thực hiện.
