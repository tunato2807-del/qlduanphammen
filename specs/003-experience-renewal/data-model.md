# Trạng thái frontend

Không đổi schema. App giữ user/month/page/modal, hook nhận owner+month. useFinanceData công bố summary/categories chỉ khi phạm vi khớp; useLedger giữ filter/page/debounce và response tương ứng; usePlanning giữ goals/rules/drafts. Không lưu dữ liệu tài chính vào browser storage.

PlanningPage dùng union cho modal: goal/create/edit, contribution hoặc rule/replace. Tab xuất hiện trong hash `#planning?tab=recurring`, giữ qua tháng/reload. Budget source chỉ là draft, được xóa khi đóng modal ngân sách.
