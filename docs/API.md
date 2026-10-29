# API Finora

Tiền tố `/api`. Request thay đổi dữ liệu có `Content-Type: application/json`. Sau đăng nhập, trình duyệt tự gửi cookie phiên cùng origin. Tiền là chuỗi số nguyên VND, số tiền giao dịch từ `1` đến `9999999999999`. Lỗi giữ HTTP status và thuộc tính `message`, bổ sung `statusCode`, `code` và `requestId`. Mọi phản hồi có header `X-Request-Id` do server tạo; không tin ID tùy ý từ client. Ví dụ 401: `{ "message": "Vui lòng đăng nhập.", "statusCode": 401, "code": "UNAUTHENTICATED", "requestId": "UUID" }`. Không tự động retry các yêu cầu ghi dữ liệu khi chưa rõ kết quả trước đó.

## Endpoint

| Method | Đường dẫn               | Nội dung                                                                 |
| ------ | ----------------------- | ------------------------------------------------------------------------ |
| GET    | `/health`               | Kiểm tra kết nối và schema database                                      |
| GET    | `/auth/config`          | Trạng thái chế độ demo                                                   |
| POST   | `/auth/register`        | `{name,email,password}`; mật khẩu 8–128 ký tự                            |
| POST   | `/auth/login`           | `{email,password}`                                                       |
| POST   | `/auth/demo`            | `{}`; tài khoản dữ liệu mẫu riêng, nếu được bật                          |
| GET    | `/auth/me`              | Người dùng hiện tại, không có passwordHash                               |
| POST   | `/auth/logout`          | `{}`; xóa phiên và cookie                                                |
| POST   | `/auth/password`        | `{currentPassword,newPassword}`                                          |
| GET    | `/wallets`              | Tất cả ví cá nhân, số dư và trạng thái lưu trữ                           |
| POST   | `/wallets`              | `{name,kind,openingBalance,color}`                                       |
| PATCH  | `/wallets/:id`          | `{name?,archived?}`                                                      |
| GET    | `/categories`           | Danh mục cá nhân                                                         |
| POST   | `/categories`           | `{name,kind,icon,color}`                                                 |
| PATCH  | `/categories/:id`       | `{name?,archived?}`                                                      |
| GET    | `/transactions`         | `?month=YYYY-MM&kind=&search=&page=1&walletId=`                          |
| POST   | `/transactions`         | Tạo giao dịch                                                            |
| PATCH  | `/transactions/:id`     | Thay toàn bộ thông tin nghiệp vụ của giao dịch                           |
| DELETE | `/transactions/:id`     | Xóa giao dịch thuộc tài khoản                                            |
| GET    | `/transactions/export`  | CSV, các bộ lọc giống danh sách, tối đa 10.000 dòng                      |
| GET    | `/budget-plans`         | `?month=YYYY-MM`; kế hoạch đang áp dụng hoặc JSON null                   |
| POST   | `/budget-plans/preview` | Tính phương án, không lưu                                                |
| POST   | `/budget-plans`         | Tính lại và xác nhận áp dụng một phiên bản mới                           |
| GET    | `/reports/summary`      | `?month=YYYY-MM`; tổng hợp, sáu tháng, ví, ngân sách, giao dịch gần nhất |

Ngoại trừ `/health`, `/auth/config`, `/auth/register`, `/auth/login` và `/auth/demo`, các endpoint yêu cầu đăng nhập. UUID không tồn tại hoặc không thuộc người dùng trả 404 ở thao tác tài nguyên trực tiếp. Danh sách phân trang 12 giao dịch trả `{items,total,page,pages}`.

## Giao dịch

```json
{
  "kind": "EXPENSE",
  "amount": "185000",
  "walletId": "UUID_VI",
  "categoryId": "UUID_DANH_MUC_CHI",
  "occurredAt": "2026-10-25T12:00:00+07:00",
  "note": "Bữa trưa cuối tuần"
}
```

`kind` thuộc `INCOME`, `EXPENSE`, `TRANSFER`. Thu/chi cần `categoryId` đúng loại và không có ví đích. Chuyển tiền cần `destinationWalletId` khác ví nguồn, không có `categoryId`. Tất cả ví, danh mục phải thuộc người dùng và chưa lưu trữ. Ngày nhận ISO 8601, backend lưu thời điểm tuyệt đối; giao diện nhập ngày với thời điểm 12:00 giờ Việt Nam.

## Ngân sách

```json
{
  "month": "2026-10",
  "income": "15000000",
  "savings": "3000000",
  "mode": "AUTO",
  "items": [
    { "categoryId": "UUID_NHA_O", "fixed": "5000000", "weight": 0 },
    { "categoryId": "UUID_AN_UONG", "fixed": "0", "weight": 40 },
    { "categoryId": "UUID_DI_CHUYEN", "fixed": "0", "weight": 20 }
  ]
}
```

Trong chế độ `AUTO`, `fixed` là khoản bắt buộc, `weight` là số nguyên 0–1000. Hệ thống phân bổ toàn bộ phần tiền còn lại theo trọng số. Trong `MANUAL`, mỗi item thêm `limit` là hạn mức do người dùng nhập; tổng hạn mức cộng tiết kiệm không được vượt thu nhập.

Tối đa 50 danh mục, không trùng nhau. Preview trả `items` đã tính hạn mức và `unallocated`. Endpoint xác nhận không tin kết quả preview gửi ngược từ client; nó kiểm tra quyền, đầu vào và tính lại. GET kế hoạch bổ sung `spent` theo từng danh mục trong tháng.

## Lưu ý vận hành

- Mỗi lần xác nhận tạo revision mới; không gửi tự động lặp lại khi chưa biết kết quả yêu cầu trước.
- Báo cáo tháng tính từ 00:00 ngày đầu tháng đến trước 00:00 tháng sau ở UTC+7.
- Số dư ví là số dư **hiện tại toàn thời gian**, không phải số dư cuối tháng đang chọn.
- Tổng thu/chi loại trừ số dư ban đầu và chuyển tiền nội bộ.
- Báo cáo hiển thị mọi chi tiêu; tiến độ ngân sách chỉ tổng hợp các danh mục có trong kế hoạch.
- Giới hạn tốc độ: 300 yêu cầu API/phút/IP; đăng nhập, đăng ký và demo dùng chung giới hạn 30 yêu cầu/15 phút/IP. Khi triển khai sau proxy, cần thiết kế chính sách IP đáng tin cậy trước khi bật trust proxy; không bật tin cậy proxy tùy tiện.
