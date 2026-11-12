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

## Mở rộng ngày 07/11/2026

Các route cũ giữ tương thích. `/auth/config` thêm `recoveryEnabled`. Hai endpoint recovery công khai, vẫn chịu rate limit nhóm auth 30/15 phút/IP. Tất cả route kế hoạch/CSV/PDF bên dưới yêu cầu phiên đăng nhập.

| Method | Route                                    | Đầu vào / đầu ra                                                                                       |
| ------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| GET    | `/budget-plans/suggestion?month=YYYY-MM` | `from,to,hasIncome,income,savings,mode,items,explanation`; ba tháng trước, không ghi                   |
| GET    | `/budget-plans/history?month=YYYY-MM`    | `{comparedAt,plans}` tất cả revision giảm dần, mỗi item thêm spent theo sổ hiện tại                    |
| GET    | `/recurring?month=YYYY-MM`               | `{rules,drafts}`; tạo nháp on-demand cho quy tắc đến hạn trong tháng, không hạch toán                  |
| POST   | `/recurring`                             | `{name,kind,amount,walletId,categoryId,day,startMonth,endMonth?,note?}`; kind INCOME/EXPENSE, day 1–31 |
| PATCH  | `/recurring/:id`                         | `{active:boolean}`; tạm dừng/bật lại, đổi nội dung bằng quy tắc mới                                    |
| POST   | `/recurring-drafts/:id/action`           | `{action: CONFIRM hoặc SKIP}`; lock, xác nhận một lần, không đổi trạng thái ngược                      |
| GET    | `/goals`                                 | Mục tiêu + saved/monthlyNeeded/overdue + contribution history                                          |
| POST   | `/goals`                                 | `{name,target,targetDate}`; tiền chuỗi dương, ngày ISO                                                 |
| POST   | `/goals/:id/contributions`               | `{action: ADD hoặc WITHDRAW,amount,walletId,note?}`; dương ở request, response amount có dấu           |
| GET    | `/transactions/import/template`          | CSV header chuẩn tải xuống                                                                             |
| POST   | `/transactions/import/preview`           | `{csv:string}` → `{rows,valid,duplicates,errors}`, không ghi sổ                                        |
| POST   | `/transactions/import`                   | `{csv:string}` → `{imported,duplicates}`; tính lại, không cho lưu nếu có lỗi, transaction toàn bộ      |
| GET    | `/reports/pdf?month=YYYY-MM`             | application/pdf attachment tiếng Việt                                                                  |
| POST   | `/auth/forgot-password`                  | `{email}` → thông báo chung; 503 nếu cấu hình chưa sẵn sàng                                            |
| POST   | `/auth/reset-password`                   | `{token,password}`; 8–128 ký tự, 30 phút/single-use, thu hồi mọi phiên                                 |

Summary thêm `comparison:{month,income,expense,net,incomeDelta,expenseDelta,netDelta}`. Trường cũ không thay đổi; delta = tháng chọn − tháng trước, chuỗi nguyên có thể âm, không chia phần trăm khi gốc 0.

### Idempotency-Key

POST tạo ví, giao dịch, lưu ngân sách, quy tắc, mục tiêu, phân bổ, action nháp và nhập CSV nhận header tùy chọn `Idempotency-Key` (16–100 ký tự ASCII chữ/số/`_`/`-`; nên dùng UUID). Client cũ không gửi vẫn hoạt động. Cùng user/key/scope/nội dung chuẩn hóa trả response đã lưu; key dùng cho nội dung/scope khác trả 409. Khóa, ghi tài chính và lưu response trong cùng transaction. Key không tự hết hạn ở bản này. Header không dùng cho đăng nhập hoặc khôi phục mật khẩu.

UI giữ key sau mọi lỗi (kể cả mạng/5xx/429) để người dùng thử lại trong cùng form; không tự retry, không giữ qua đóng form/reload. Sau response thành công, thao tác mới nhận key mới. PATCH/DELETE giữ semantics cũ, không tạo thêm bản ghi khi gửi lại; DELETE cần body JSON `{}` theo hợp đồng hiện hành. Với client tự viết, phải lưu key của một ý định trước khi gửi và dùng lại khi retry.

### CSV nhập

UTF-8, có hoặc không BOM, đúng bảy cột theo thứ tự:

```csv
occurredAt,kind,category,wallet,destinationWallet,amount,note
2026-11-07T12:00:00+07:00,EXPENSE,Ăn uống,Tiền mặt,,50000,"Bữa trưa, cùng bạn"
```

Nhận cả header tiếng Việt do `/transactions/export` tạo. Tên ví/danh mục phải khớp chính xác và duy nhất trong tài khoản, chưa lưu trữ; category đúng loại, chuyển ví dùng destinationWallet và không hạch toán danh mục. Giới hạn 50 KB UTF-8/200 dòng; body HTTP JSON hiện giới hạn 64 KB, nên nội dung nhiều ký tự phải escape có thể chạm giới hạn sớm hơn. `rows[].line` là thứ tự bản ghi CSV + header (dòng ghi chú nhiều dòng vẫn tính một bản ghi). Lỗi cú pháp/header trả 400; lỗi dòng nằm trong preview. Nhập lại kiểm tra duplicate theo thời điểm, kind, amount, ví nguồn/đích, category và note trim; kể cả dòng trùng ngay trong file. Không giữ file nguồn, không tự tạo ví/danh mục.

Phân bổ mục tiêu không sinh ledger transaction và không cộng vào thu/chi; kiểm tra tiền có thể dành tại thời điểm ghi. WITHDRAW có thể dùng ví đã lưu trữ để giải phóng phần dành cũ. Giao dịch chi sau đó vẫn được ghi thực tế, UI cảnh báo thiếu phần dành riêng. `monthlyNeeded` làm tròn lên nguyên VND trên số tháng còn lại gồm tháng hiện tại theo Việt Nam; overdue hiển thị riêng.

## Bổ sung tương thích ngày 12/11/2026

| Method | Route                    | Hợp đồng                                                                                   |
| ------ | ------------------------ | ------------------------------------------------------------------------------------------ |
| PATCH  | `/auth/profile`          | `{name}` 2–60 ký tự sau trim; trả safe user, không nhận email/password                     |
| PATCH  | `/goals/:id`             | `{name?,target?,targetDate?,archived?}`; target chuỗi VND dương, targetDate ISO; chỉ owner |
| POST   | `/recurring/:id/replace` | Toàn bộ payload như tạo rule, nhận Idempotency-Key; trả `{previous,replacement}`           |

PATCH mục tiêu không nhận `saved`, `userId`, contributions hoặc giá trị `null`; trường không muốn đổi phải được bỏ khỏi payload. Lưu trữ không xóa lịch sử hoặc giải phóng tiền. ADD vào mục tiêu lưu trữ trả 400; WITHDRAW vẫn được kiểm tra theo goal/ví và số đã dành. Khôi phục bằng `{archived:false}`.

Thay định kỳ phải có `startMonth >= tháng hiện tại tại Việt Nam + 1`, **sau `startMonth` của quy tắc cũ**, và không vượt `endMonth` cũ nếu có. Quy tắc cũ phải active. Transaction khóa rule, đặt `previous.endMonth = replacement.startMonth − 1`, tạo rule mới. Không đổi tên/số tiền/ngày/ví của rule cũ; nháp cũ vẫn có nội dung cũ và có thể xác nhận. Tháng không hợp lệ/đang tạm dừng trả 400; đã kết thúc/thay thế trả 409; ID ngoài owner trả 404. Hai replacement khác key đồng thời cùng cửa sổ chỉ một thành công; cùng key/payload trả kết quả đã lưu. Quy tắc chưa bắt đầu muốn đổi ngay tháng đầu: tạm dừng rồi tạo mới. Không sửa giao dịch đã ghi.

`GET /transactions` và `/transactions/export` nhận thêm `categoryId=UUID`, `sort=asc|desc` (mặc định desc). `walletId` khớp nguồn **hoặc** đích chuyển ví. Các nhóm wallet/category/search/kind/month kết hợp bằng AND; search OR chỉ nằm trong nhóm tìm kiếm. Ngày, createdAt và id làm thứ tự ổn định. UUID/filter không hợp lệ trả 400; filter tham chiếu tài nguyên ngoài owner trả 404. Có thể lọc tài nguyên đã lưu trữ để xem lịch sử. CSV giữ cùng thứ tự/bộ lọc và giới hạn cũ.

Summary thêm `asOf` (ISO thời điểm tạo kết quả) và `planning:{goalCount,saved,dueCount,due}`. `goalCount` chỉ mục tiêu đang hoạt động; `saved` gồm tiền đã dành trong cả mục tiêu lưu trữ. `due` tối đa ba phần tử `{id,name,amount,dueAt,wallet}`; `dueCount` đếm quy tắc active đã đến hạn ở tháng chọn, chưa xử lý. Summary không tạo draft; mở trang định kỳ mới đồng bộ draft. Tiền vẫn là chuỗi nguyên VND. Summary/PDF đọc các thành phần trong cùng transaction RepeatableRead, giữ mọi trường cũ. Số dư ví vẫn là hiện tại toàn thời gian, không phải cuối tháng chọn.

Dùng lại budget revision là thao tác frontend: đưa dữ liệu lịch sử vào form, cảnh báo bỏ danh mục đã lưu trữ, preview rồi POST như hợp đồng hiện có; không thêm route ghi đè phiên bản.
