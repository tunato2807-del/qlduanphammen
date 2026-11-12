# Luồng nghiệp vụ và thiết kế mở rộng

07/11/2026 · Bổ sung cho [DESIGN.md](DESIGN.md), hợp đồng [API.md](API.md) và [đặc tả](../specs/002-financial-planning/spec.md).

## Dữ liệu và trạng thái

```mermaid
erDiagram
  User ||--o{ RecurringRule : owns
  Wallet ||--o{ RecurringRule : source
  Category ||--o{ RecurringRule : classifies
  RecurringRule ||--o{ RecurringDraft : generates
  RecurringDraft o|--o| Transaction : confirms
  User ||--o{ SavingsGoal : owns
  SavingsGoal ||--o{ GoalContribution : records
  Wallet ||--o{ GoalContribution : earmarks
  User ||--o{ PasswordReset : requests
  User ||--o{ IdempotencyRecord : retries
```

- `RecurringRule`: loại thu/chi, số tiền, ví/danh mục, ngày 1–31, tháng bắt đầu/kết thúc, active. Ngoài bật/tạm dừng, từ 12/11 có thay đổi có hiệu lực từ tháng tương lai: kết thúc rule cũ trước tháng hiệu lực và tạo rule mới nguyên tử. Nội dung cũ giữ nguyên để draft/lịch sử không đổi; xem quy tắc dưới đây.
- `RecurringDraft`: unique(rule, month), thời điểm đến hạn, `PENDING → CONFIRMED` hoặc `PENDING → SKIPPED`, không chuyển ngược. Liên kết transaction nullable khi giao dịch bị xóa, nhưng trạng thái vẫn CONFIRMED để không ghi lại tiền.
- `SavingsGoal`: số mục tiêu, hạn hoàn thành. `GoalContribution`: số tiền có dấu (dành thêm dương, rút âm), ví, thời điểm, ghi chú. Không phải ledger transaction; chỉ phân bổ tiền đã có. Không rút âm theo từng mục tiêu/ví. Dành thêm không vượt số dư ví trừ tổng đã dành tại thời điểm ghi; chi tiêu sau đó có thể làm thiếu phần dành riêng và UI cảnh báo. Từ 12/11 có sửa tên/đích/hạn, lưu trữ/khôi phục. Lưu trữ giữ cả lịch sử lẫn tiền đã dành; chỉ cho rút, không cho dành thêm.
- `PasswordReset`: id là SHA256 token, user, thời hạn, thời điểm tạo. Reset thành công xóa mọi token và phiên của user.
- `IdempotencyRecord`: unique(user,key), hash nội dung canonical + phạm vi thao tác, response JSON, createdAt. Không lưu cookie/token trong record. Key giữ trong DB không tự hết hạn ở phiên bản này để tránh ghi lặp do retry muộn; cần chính sách lưu trữ khi quy mô lớn.

Migration mới thêm 6 bảng (tổng 13 model), không sửa migration cũ. DB có check số tiền, loại, ngày, trạng thái, FK và unique; ownership nhiều bảng được kiểm tra tại service.

## Activity — lập ngân sách có căn cứ

```mermaid
flowchart TD
  A[Chọn tháng] --> B[Lấy 3 tháng trước đã kết thúc]
  B --> C[Thu trung bình; trọng số theo chi; gợi ý tiết kiệm 20%]
  C --> D[Người dùng sửa thu dự kiến, tiết kiệm và ưu tiên]
  D --> E[Xem phương án bằng BigInt]
  E --> F{Đủ nguồn và danh mục hợp lệ?}
  F -- Không --> D
  F -- Có --> G[Người dùng xác nhận]
  G --> H[Khóa user/tháng, tính lại, tạo revision]
  H --> I[Đối chiếu chi thực tế và xem lịch sử]
```

Thu trung bình luôn chia 3, kể cả tháng bằng 0. Trung bình làm tròn xuống nguyên VND; gợi ý tiết kiệm bằng 20% trung bình làm tròn xuống. Không có thu thì trả 0 và thông báo, không đoán lương. Trọng số 0 cho danh mục không chi; UI cho trọng số khởi tạo nhỏ khi chưa có cơ cấu để người dùng tiếp tục chỉnh. Gợi ý không phải AI hay bảo đảm tài chính.

## Activity — nhập CSV

```mermaid
flowchart TD
  A[Chọn file hoặc nhập nội dung] --> B{50 KB / 200 dòng / header hợp lệ?}
  B -- Không --> C[Báo lỗi, không ghi]
  B -- Có --> D[Đọc CSV chuẩn: dấu nháy, dấu phẩy, Unicode]
  D --> E[Kiểm tra từng dòng và quyền tham chiếu]
  E --> F[Đánh dấu dòng lỗi và dòng trùng]
  F --> G{Không còn lỗi và có dòng mới?}
  G -- Không --> H[Sửa file hoặc kết thúc nếu tất cả trùng]
  H --> A
  G -- Có --> I[Người dùng xác nhận]
  I --> J[Khóa import của user, kiểm tra lại trên server]
  J --> K[Ghi các dòng mới trong cùng transaction]
```

Fingerprint gồm thời điểm chuẩn ISO, loại, số tiền, ví nguồn/đích, danh mục và ghi chú trim. Hai khoản thực sự khác nhau nhưng có đủ bảy trường giống hệt sẽ bị xem là trùng; thay ghi chú/thời điểm để thể hiện khác biệt hoặc nhập thủ công. Không tự áp dụng số liệu preview từ client. CSV xuất có chống công thức; khi nhập lại đúng định dạng xuất Finora, hệ thống bỏ dấu nháy bảo vệ do bộ xuất thêm.

## Activity — khoản định kỳ

```mermaid
flowchart TD
  A[Mở tháng trong Kế hoạch] --> B[Đọc quy tắc active trong khoảng hiệu lực]
  B --> C[Tính ngày đến hạn theo Việt Nam, chốt cuối tháng nếu cần]
  C --> D{Đã đến hạn?}
  D -- Chưa --> E[Chỉ hiển thị quy tắc]
  D -- Rồi --> F[Upsert bản nháp unique quy tắc/tháng]
  F --> G{Người dùng chọn}
  G -- Bỏ qua --> H[SKIPPED, không ghi sổ]
  G -- Xác nhận --> I[Khóa nháp, kiểm tra trạng thái và ví/danh mục]
  I --> J[Ghi giao dịch và CONFIRMED nguyên tử]
```

Không chạy cron gửi nhắc ngoài ứng dụng. Nháp được tạo khi mở tháng; khoản tương lai hiển thị trong quy tắc, không được hạch toán sớm. Chọn tháng trước để giải quyết khoản bỏ ngỏ, không tự bù hàng loạt vào sổ.

## Sequence — xác nhận và gửi lại

```mermaid
sequenceDiagram
  actor U as Người dùng
  participant W as React
  participant A as API
  participant D as PostgreSQL
  U->>W: Xác nhận ghi sổ
  W->>A: POST action + Idempotency-Key
  A->>D: BEGIN, khóa user/key
  alt Key đã dùng, cùng nội dung
    D-->>A: Response đã lưu
  else Yêu cầu mới
    A->>D: Khóa draft, đọc trạng thái + ownership
    A->>D: Tạo transaction; CONFIRMED; lưu response
  end
  A->>D: COMMIT
  A-->>W: Kết quả
  W-->>U: Đã ghi sổ
```

Cùng key nhưng khác nội dung/scope trả 409. Hai key khác nhau cùng nháp vẫn được bảo vệ bởi khóa nháp và trạng thái. Khi lỗi mạng/5xx, form giữ key của nội dung để thử lại; không tự lặp. Form đóng/mở lại mất key cục bộ nên người dùng cần kiểm tra sổ nếu không rõ kết quả; CSV và draft còn có bảo vệ trùng ở nghiệp vụ.

## Sequence — dành tiền cho mục tiêu

```mermaid
sequenceDiagram
  actor U as Người dùng
  participant A as API
  participant D as PostgreSQL
  U->>A: Mục tiêu, ví, số tiền, ADD/WITHDRAW
  A->>D: BEGIN, khóa reserve của user
  A->>D: Đọc goal/ví đúng owner
  alt ADD
    A->>D: Tổng sổ ví + phần đã dành trong mọi mục tiêu
    A->>A: Kiểm tra số dư khả dụng
  else WITHDRAW
    A->>D: Tổng đã dành cho goal/ví
    A->>A: Kiểm tra không rút vượt
  end
  A->>D: Tạo contribution có dấu, lưu response, COMMIT
  A-->>U: Tiến độ cập nhật, tổng tài sản không tăng
```

## Sequence — khôi phục mật khẩu

```mermaid
sequenceDiagram
  actor U as Người dùng
  participant A as API
  participant D as PostgreSQL
  participant M as SMTP
  U->>A: Yêu cầu theo email
  A-->>U: Thông báo chung
  A->>D: Tra tài khoản (tác vụ nền)
  opt Có tài khoản, chưa yêu cầu trong 1 phút
    A->>D: Lưu hash token, hết hạn 30 phút
    A->>M: Gửi liên kết trong fragment
    M-->>U: Email
  end
  U->>A: Token và mật khẩu mới
  A->>D: BEGIN, khóa token; kiểm tra hash/hạn
  A->>D: Đổi password hash, xóa token và mọi session
  A->>D: COMMIT
  A-->>U: Đăng nhập lại bằng mật khẩu mới
```

## Sequence — thay quy tắc từ tháng tương lai (12/11)

```mermaid
sequenceDiagram
  actor U as Người dùng
  participant A as Planning API
  participant D as PostgreSQL
  U->>A: Rule cũ + toàn bộ rule mới + Idempotency-Key
  A->>D: BEGIN, khóa key, khóa rule
  A->>D: Đọc owner, active, khoảng hiệu lực
  A->>A: Tháng mới từ tháng sau, sau start cũ và trong end cũ
  A->>D: Đặt end cũ = tháng mới - 1
  A->>D: Tạo rule mới, lưu response, COMMIT
  A-->>U: Previous và replacement
```

Không chỉnh amount/name/day của rule cũ hoặc xóa draft. Xác nhận draft cũ dùng nội dung cũ; khoản tương lai chưa đến hạn không được ghi sớm. Thay đồng thời được tuần tự hóa bằng advisory lock; yêu cầu sau thấy rule đã kết thúc và nhận 409. Retry đúng key trả response cũ.

## Vòng đời mục tiêu và phiên bản ngân sách (12/11)

Mục tiêu: `đang theo đuổi → lưu trữ → khôi phục`. Chuyển trạng thái không sinh transaction/contribution, không đổi số tiền đã dành. ADD chỉ khi hoạt động; WITHDRAW hoạt động ở cả hai trạng thái. Sửa metadata không được sửa lịch sử; target mới có thể thấp hơn saved, phần vượt vẫn là tiền đã dành.

Ngân sách: `revision cũ → draft cục bộ → chỉnh và preview → xác nhận revision mới`. Danh mục lưu trữ bị loại được thông báo trước preview; revision cũ vẫn tồn tại. Tiến độ lịch sử luôn đối chiếu sổ hiện tại, không phải ảnh chụp số chi lúc tạo.
