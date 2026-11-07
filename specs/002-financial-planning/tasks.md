# Tasks — Hoàn thiện Finora

Danh sách được tách theo US để truy vết từng luồng; không có checklist triển khai thứ hai ở tasks/ V2. Tiền đề: yêu cầu “thêm hết” và câu trả lời chưa có dịch vụ, chỉ chuẩn bị cấu hình. Thực hiện tuần tự trong cùng workspace, không dùng agent phụ.

## Phase 1: Setup

- [x] T001 Đặc tả, constitution check, plan/research/data-model/contracts/quickstart cho specs/002 (FR01–10).

## Phase 2: Foundation

- [x] T002 Schema và migration additive, Idempotency provider và useWrite; kiểm thử replay/conflict/account scope (FR01, FR08).

## Phase 3: US1 — Ngân sách có căn cứ

- [x] T003 budgets.ts gợi ý/history, BudgetForm/BudgetHistory, tests zero months/live comparison/replay sau archive (FR02).

## Phase 4: US2 — Định kỳ

- [x] T004 planning-rules.ts/planning.ts rule/draft/action, kiểm thử concurrent sync/confirm, skip, archived reference (FR03).
- [x] T005 PlanningPage recurring UI, E2E tạo/xác nhận/tạm dừng (FR03, FR10).

## Phase 5: US3 — Mục tiêu

- [x] T006 Goal/contribution API và PlanningPage, lịch sử/phân bổ/rút/cảnh báo, test concurrent/ownership/conserve assets (FR04).

## Phase 6: US4 — CSV

- [x] T007 imports.ts, ImportDialog, template, preview/commit, test quoted Unicode/atomic/duplicate và export roundtrip (FR05).

## Phase 7: US5 — Báo cáo

- [x] T008 reports.ts/wallets.ts aggregates, comparison/PDF, ReportsPage; API và browser tests (FR06).

## Phase 8: US6 — Khôi phục và vận hành

- [x] T009 recovery.ts, RecoveryForm/Auth/App, SMTP test, hash/expiry/single-use/revoke và StrictMode/hash navigation (FR07).
- [x] T010 Docker/Compose/Caddy, database.sh, backup/restore và production smoke (FR07, SC04).

## Phase 9: US7 — Hồ sơ và đo lường

- [x] T011 benchmark.ts so baseline, exact totals/history, 10k fixture riêng, performance.json (FR09).
- [x] T012 PROJECT-MANAGEMENT/FINANCIAL-FLOWS/TRACEABILITY, README/API/DESIGN và presentation/ảnh minh họa (FR09).

## Phase 10: Cross-cutting release

- [x] T013 Toàn bộ check:fast/API/build/E2E/audit, accessibility và responsive; regression hover và race tải nháp; ghi verification (FR01–10, SC01–05).
- [ ] T014 Rà soát spec→code, validate artifacts/links, commit/push feature và main khi remote an toàn (FR09).

Phụ thuộc: T001 → T002 → US1–6; UI E2E sau API từng luồng; T011 sau T008; T010/T012 trước T013/T014. Các bước môi trường độc lập có thể chạy song song bằng tool, không cần agent phụ. Không triển khai dịch vụ trả phí/public khi chưa có dịch vụ, không coi UAT người thật là đã hoàn thành.
