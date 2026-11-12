# Đối chiếu spec/plan/tasks và constitution — 12/11/2026

Rà soát thủ công các artifacts hiện tại; đây không phải kết quả gọi extension/agent tự động. Không có blocker sản phẩm chưa chốt.

- FR có acceptance, nhiệm vụ và kiểm chứng tại verification + docs/TRACEABILITY. Các hành vi mới có API/browser regression phù hợp; hồ sơ002/V2 được giữ.
- Tiền BigInt/chuỗi, ownership phía server, idempotency và log allowlist giữ đúng. Không đổi stack/schema/migration hoặc quyền/phí.
- UI theo tokens, bàn phím, responsive và reduced motion; automated axe không được tuyên bố chứng nhận toàn diện.
- Tương thích client cũ; rollback mã về05d9f0a không yêu cầu downgrade DB.
- Đã sửa hai điểm phát hiện khi triển khai: giữ tab khi đổi tháng; start replacement phải sau start cũ. Truy vết edge cases trong004 và tests.
- Hiệu năng mới có chi phí snapshot/planning, ghi số đo thật và giới hạn thay vì dùng lại benchmark cải thiện của002. UAT vẫn chờ người dùng.

Không có CRITICAL/HIGH chưa xử lý trong phạm vi này; cảnh báo upstream pg và dịch vụ ngoài chưa cấu hình được ghi rõ trong verification005/runbook.
