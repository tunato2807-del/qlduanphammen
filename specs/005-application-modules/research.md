# Quyết định kỹ thuật

- Giữ modular monolith NestJS, không phát sinh dịch vụ mạng. Tách controller/provider/module theo trách nhiệm; compatibility reexports giữ tên consumer nội bộ cũ.
- Infrastructure global cung cấp Database/Idempotency; Identity export Accounts/SessionGuard. Demo riêng import Identity/Ledger/Budgeting, không cho Identity import ngược Demo gây cycle.
- Reports dùng RepeatableRead thay vì nhiều reads độc lập; truyền client xuống helper để không xin connection thứ hai khi đang giữ transaction. Các lệnh ứng dụng chạy tuần tự trên connection đó.
- Vẫn aggregate SQL để không tải toàn sổ. Thêm planning/asOf nên đo với baseline gần nhất 05d9f0a, không tái sử dụng số cải thiện của spec002.
- Không đổi dependencies/schema/migrations. Prisma JS adapter vẫn có cảnh báo pg khi engine tải relations; giữ cảnh báo trong kết quả, không suppression.
