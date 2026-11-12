# Dữ liệu và bất biến

Không thay model/migration. SavingsGoal dùng trường archived đã có; GoalContribution là lịch sử số có dấu, saved suy ra từ tổng, không nhận saved từ client. Target thay đổi không tự sinh/rút contribution.

RecurringRule giữ payload cũ, chỉ thay endMonth khi replacement; rule mới mang payload mới. RecurringDraft unique(rule,month) và Transaction cũ không đổi. Không thêm relation chain: khoảng hiệu lực và danh sách rules thể hiện lịch sử. IdempotencyRecord dùng scope recurring.replace và payload có id cũ, bảo vệ retry.

Profile chỉ thay User.name; filter không thay dữ liệu. BudgetPlan revisions giữ nguyên.
