# Hợp đồng kỹ thuật

Các routes/status/cookie/request ID/body limit/rate limit hiện hữu giữ nguyên. Thay đổi thêm trường summary tương thích client cũ; [API](../../../docs/API.md).

- `Wallets.wallets(userId, client?)`: số dư từ opening + ledger, không đổi tiền tệ.
- `Budgets.activeBudget(userId,month,client?)`: budget active và actual trong cùng snapshot.
- `Transactions.transactions(userId,query,all?,client?)`: items/count không mở transaction lồng khi truyền client.
- `Reports.summary`: một RepeatableRead gồm ví, totals/history/spending, budget, recent và planning.
- `Reports.pdf`: gọi cùng summary, dựng PDF ngoài transaction.

Infrastructure export Database/Idempotency; Identity export Accounts/SessionGuard; Ledger export Wallets/Transactions; Budgeting export Budgets. Demo controller riêng dùng helper cookie với Auth controller, không tạo vòng module.
