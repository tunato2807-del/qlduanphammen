# Quyết định kỹ thuật

07/11/2026, đối chiếu mã hiện hữu và thử nghiệm trên PostgreSQL.

| Quyết định                              | Lý do                                                                     | Phương án đã cân nhắc                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Giữ monolith React/Nest/Postgres        | Stack cũ đã chạy và đủ cho phạm vi                                        | Đổi framework/microservice làm tăng công việc chưa có bằng chứng cần thiết             |
| csv-parse                               | Xử lý quote/newline/BOM chuẩn thay vì split chuỗi                         | Tự viết parser dễ sai với ghi chú có dấu phẩy                                          |
| PDFKit + Liberation Sans có OFL         | PDF Unicode phía server, xác thực như báo cáo, không cần browser khi xuất | HTML print phụ thuộc máy người dùng; headless PDF nặng runtime hơn                     |
| Nodemailer SMTP                         | Chủ dự án chưa có provider; cấu hình được và test qua SMTP cục bộ         | Gắn nhà cung cấp cụ thể cần tài khoản/secret chưa có                                   |
| Draft on-demand, unique rule/month      | Chưa hạch toán khi chưa xác nhận; không cần scheduler luôn chạy           | Cron tự ghi tiền có thể lệch thực tế; email reminders ngoài ứng dụng chưa được yêu cầu |
| Idempotency transaction + advisory lock | Request retry không tách khỏi ghi tiền, giữ dữ liệu khi restart           | Chỉ disable nút hoặc cache RAM không bảo vệ cạnh tranh/server restart                  |
| INSERT ON CONFLICT cho sync draft       | Tải đầu tiên song song không lỗi unique, đã tái hiện ở StrictMode         | Upsert update rỗng có thể emulated SELECT/create và race                               |
| SQL aggregates cho báo cáo và ví        | Không tải toàn bộ ledger vào Node để tính tổng                            | Index hiện có đủ cho tập đo; không thêm index theo suy đoán                            |
| Caddy và Compose riêng                  | Cùng origin, HTTPS tự động khi có DNS, không public cổng DB/API           | Dịch vụ trả phí chưa có quyền mua; chuẩn bị triển khai sau theo câu trả lời người dùng |

Benchmark so baseline commit 27e9f72 với code mới cùng 10.000 fixture, đối chiếu tổng/history chính xác. Bản sao legacy chỉ bỏ metadata DI để khởi tạo trực tiếp; giữ truy vấn và thuật toán, lưu tạm trong .local. Xem performance.json.
