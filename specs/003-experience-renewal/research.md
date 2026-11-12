# Quyết định trải nghiệm

- Giữ React/Motion/Recharts và font local: stack đang chạy, không thêm UI framework hoặc dependency runtime.
- Thay một stylesheet thống nhất thay vì thêm lớp override. Canvas sáng, sidebar trắng và hero navy giúp tách điều hướng/số liệu; violet/mint dùng xuyên form/trang.
- Lazy toàn bộ trang nghiệp vụ; charts giữ chunk riêng để login không tải đồ thị.
- Hook theo owner/tháng và AbortController; đổi kỳ không để response cũ ghi đè kỳ mới. ErrorBoundary xử lý lỗi render bên cạnh retry lỗi HTTP.
- Native dialog giữ focus/Escape; Field gắn label/id và hint đúng; reduced motion có cả CSS/Motion/chart.
