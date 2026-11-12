# Kiểm chứng kỹ thuật — 12/11/2026

| Gate                         | Kết quả                                                                                                                                                                                            |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm run check:fast           | TypeScript 0 lỗi; Prettier đạt                                                                                                                                                                     |
| npm test                     | **40/40**, không fail/skip, PostgreSQL thật                                                                                                                                                        |
| Chromium Playwright          | **18/18**, không fail/skip; legacy + renewal, axe/responsive/motion/keyboard                                                                                                                       |
| npm run build                | API + web production build đạt                                                                                                                                                                     |
| npm audit --audit-level=high | 0 vulnerabilities trong lần chạy 12/11                                                                                                                                                             |
| Docker                       | Multi-stage build thành công, Prisma generate, prune offline, runtime node UID1000/read-only                                                                                                       |
| HTTPS smoke                  | [production-smoke.json](production-smoke.json): 10 bước qua Caddy internal TLS, CA tin cậy riêng; health/HSTS/web/demo403/cookie/replay/snapshot/profile/goal lifecycle/null validation/PDF/logout |
| Schema/dữ liệu               | Không có diff schema/migration; DB volume cũ được giữ; không reset hoặc deploy public                                                                                                              |
| Spec Kit                     | v1.3.0 và artifact list hoạt động; prerequisite resolver nhận artifacts feature                                                                                                                    |

Snapshot regression bọc real providers để commit expense sau read ví, giữ query sổ đến sau commit, xác minh response cùng trạng thái trước commit; recent cũng phải rỗng, lần summary tiếp thấy expense/recent và balance giảm đúng 123 VND. Không mock số tiền hoặc thêm test hook vào sản phẩm.

Benchmark: [performance.json](performance.json), 10.000 giao dịch/6 tháng, 3 warmup/20 mẫu luân phiên. Baseline dùng cả Wallets/Transactions/Budgets/Reports từ commit 05d9f0a; exact totals/history/comparison/spending khớp. Median **19,03 → 41,44 ms**, p95 **22,84 → 51,14 ms**. Bản mới chậm hơn vì đọc tuần tự một snapshot và thêm kế hoạch; chưa tối ưu đổi lấy sai lệch tài chính. Đây là provider cục bộ, không load/concurrency benchmark hoặc SLA.

[Bundle](bundle.json) so entry JS/CSS từ Vite baseline archived với cùng dependency; font và lazy charts/pages tách riêng, không tính vào entry. CSS tăng vì thiết kế mới; không tuyên bố Web Vitals chưa đo.

Cảnh báo: pg 8 ghi DeprecationWarning khi Prisma JS engine thực hiện relation queries trong cùng transaction, dù các lời gọi ứng dụng đã tuần tự. Stack trace tới @prisma/adapter-pg/client-engine-runtime. Không tắt cảnh báo, không cài pg9; hiện không có test failure, cần kiểm chứng adapter trước nâng major pg.

Lần E2E kiểm tra lại sau Docker build gặp ENOSPC trước khi chạy test; dọn build cache có thể tạo lại (giải phóng khoảng11GB), giữ DB volume, chạy lại đủ18 đạt. Không sửa assertion hoặc bỏ test.

Đã giữ bằng chứng restore của 07/11 tại spec002; không ghi đè hoặc giả định có lần restore mới. UAT người thật, email deliverability và public deployment chưa thực hiện. GitHub Actions không được coi đạt chỉ từ local gates.

## GitHub

Mã và bộ bàn giao ở commit `e83ad7d` đã push thành công lên `main` và `feature/finora-renewal`, fast-forward từ `05d9f0a`, không ghi đè lịch sử. Commit tài liệu sau đó chỉ hoàn tất checklist/ghi nhận bàn giao. Các gate ở trên chạy trong môi trường cloud; không coi đó là kết quả GitHub Actions chưa quan sát.
