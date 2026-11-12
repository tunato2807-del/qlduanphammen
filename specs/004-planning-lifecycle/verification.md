# Kiểm chứng lifecycle — 12/11/2026

`npm test`: 40/40 đạt, 0 fail/skip. Sáu test mới trong lifecycle.test.ts kiểm chứng: goal metadata/archive/restore/withdraw và ownership/extra fields; replacement giữ draft và replay; chặn current/future rule invalid start và concurrent 201/409; bộ lọc/CSV có incoming transfer/AND/search/sort/foreign; safe profile; snapshot đọc đồng thời (005).

`npm run test:e2e`: 18/18 đạt. renewal.spec.ts chạy goal create→edit→allocate→archive→withdraw→restore→history; rule replacement→old draft confirm→future month không book; budget revision draft→preview→revision mới và cảnh báo category archived; profile/filter/CSV/Ctrl+K. Có axe trên các dialog mới.

Không đổi schema hoặc migration; API cũ vượt regression. Các route/status/idempotency mô tả trong contracts và docs/API. UAT người thật vẫn chờ, không điền thay phản hồi.

Đã tái hiện PATCH goal `{name:null}` trả 500, bổ sung regression cả 4 trường và dùng ValidateIf chỉ bỏ qua undefined; null trả 400 trước khi vào Prisma. Không thay hợp đồng omitted field.
