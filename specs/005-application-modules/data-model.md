# Ranh giới và dữ liệu

Không đổi 13 Prisma models. AppModule nối Infrastructure,Identity,Ledger,Budgeting,Planning,Reporting,Demo. Graph imports và exports tại [DESIGN](../../docs/DESIGN.md).

Reports summary là read model: trường cũ cộng asOf và planning(goalCount,saved,dueCount,due[0..3]). Tiền BigInt ở service, JSON serializer chuỗi VND. Wallets/activeBudget/transactions nhận Prisma.TransactionClient tùy chọn; thiếu client tự mở snapshot, có client dùng trực tiếp.

Snapshot dùng PostgreSQL RepeatableRead, không ghi draft khi đọc summary/PDF. Date metadata là thời điểm dựng response; số dư là mọi thời gian, thu/chi theo tháng.
