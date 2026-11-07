# Kiểm chứng nhanh

1. Node 22.12+ (đã kiểm tra Node 24), Docker/Compose; `bash scripts/setup.sh` cho clone mới. Giữ .env/volume có sẵn.
2. `npm run db:generate && npm run db:migrate`; runner SQL kiểm tra checksum, không reset.
3. `npm run check:fast && npm test && npm run build`.
4. `CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e` hoặc cài Chromium bằng Playwright.
5. Chạy web, dùng demo. Kế hoạch → mục tiêu → dành/rút; định kỳ → tạo ngày 1 → xác nhận; Giao dịch → nhập CSV → preview → xác nhận; Ngân sách → gợi ý/lịch sử; Báo cáo → PDF.
6. [OPERATIONS](../../docs/OPERATIONS.md) hướng dẫn Mailpit/reset, Compose production và backup/restore DB riêng. Chưa có provider thật nên không yêu cầu deploy public để pass feature.
7. `npm run benchmark -w @finora/api` (cần Git có commit baseline 27e9f72); fixture riêng tự dọn, xuất performance.json. Không dùng để suy diễn SLA.
8. `CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium node scripts/capture-screenshots.mjs`, rồi `python scripts/build-presentation.py` với dependency Python trong tools/presentation/requirements.txt.

Kết quả mong đợi: không tạo tiền từ kế hoạch; action/draft lặp không nhân đôi; CSV sai không ghi; PDF đúng tiếng Việt; token một lần, mọi phiên cũ bị thu hồi; restore không ghi đè database gốc. Bằng chứng trong verification.md.
