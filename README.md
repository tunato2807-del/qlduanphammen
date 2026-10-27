# Finora · Tài chính trong tầm tay

Ứng dụng fullstack quản lý tài chính cá nhân và lập ngân sách tự động, giao diện tiếng Việt, tiền VND, báo cáo theo múi giờ Việt Nam.

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, Motion, Recharts. **Backend:** NestJS 11, TypeScript. **Database:** PostgreSQL 17, Prisma 6.19 với bộ máy JavaScript và driver PostgreSQL.

## Xem trước giao diện

Ảnh chụp ứng dụng đang chạy với dữ liệu mẫu:

![Dashboard Finora](docs/images/dashboard.png)

[Xem giao diện trên điện thoại](docs/images/mobile.png)

## Chức năng đã có

- Đăng ký, đăng nhập, đăng xuất, đổi mật khẩu và thu hồi các phiên đăng nhập khác.
- Tạo, đổi tên và lưu trữ ví; số dư được tính từ sổ giao dịch.
- Tạo, đổi tên, lưu trữ danh mục thu/chi; giữ nguyên dữ liệu lịch sử.
- Thêm, sửa, xóa giao dịch thu, chi, chuyển ví; tìm kiếm, lọc, phân trang.
- Ngân sách tháng tự động theo chi bắt buộc, trọng số và tiết kiệm dự kiến; hoặc nhập hạn mức thủ công.
- Xem trước phương án, xác nhận áp dụng, giữ các phiên bản trước trong database.
- Dashboard, biểu đồ dòng tiền sáu tháng, báo cáo theo danh mục, cảnh báo từ 80% hạn mức và xuất CSV.
- Giao diện Finora Studio với tông lavender/lime, chữ rõ nét và bố cục responsive. Nút bấm có chuyển động nảy, thẻ nổi khi tương tác và minh họa tài chính chuyển động.
- Nút ✨ trên màn hình đăng nhập và thanh công cụ giúp giảm chuyển động; lựa chọn được lưu trên thiết bị. Tôn trọng cài đặt giảm chuyển động của hệ điều hành, bao gồm biểu đồ.
- Trải nghiệm dữ liệu mẫu riêng cho từng lần tạo phiên demo. Mặc định tắt khi chạy production.

## Chạy trên máy phát triển

Yêu cầu **Node.js từ 22.12**, npm và Docker có Docker Compose v2. Cổng PostgreSQL 5432 phải còn trống.

```bash
bash scripts/setup.sh
bash scripts/start.sh
```

Script thiết lập tạo `.env` và `apps/api/.env` từ file mẫu **chỉ khi chưa có**, cài đúng lockfile, tạo Prisma Client, khởi động PostgreSQL và chạy migration. Script không tự sửa file môi trường đã có.

- Frontend phát triển: cổng **5173**.
- API: cổng **3001**, tiền tố `/api`.
- Kiểm tra sẵn sàng: `curl --fail http://127.0.0.1:5173/api/health`.

Mở giao diện tại cổng 5173 và chọn **Trải nghiệm với dữ liệu mẫu** để khám phá, hoặc đăng ký tài khoản mới để bắt đầu từ dữ liệu trống. Tài khoản demo dùng thông tin đăng nhập ngẫu nhiên: phiên cookie cho phép tải lại trang, nhưng sau khi đăng xuất không có mật khẩu để đăng nhập lại. Hãy đăng ký tài khoản thật để lưu công việc lâu dài.

Các giá trị trong file `.env.example` chỉ phục vụ phát triển cục bộ. Khi dùng PostgreSQL khác, cập nhật `DATABASE_URL` trong `apps/api/.env`. Mật khẩu database trong `.env` gốc và URL kết nối API phải khớp nhau; thay đổi biến Docker không tự đổi mật khẩu của volume đã khởi tạo.

## Các lệnh hữu ích

```bash
npm run dev          # Chạy API và frontend cùng lúc
npm run typecheck    # Kiểm tra TypeScript
npm test             # Unit test + integration test với PostgreSQL thật
npm run build        # Build cả API và frontend
npm run db:generate  # Tạo lại Prisma Client sau khi sửa schema
npm run db:migrate   # Áp dụng migration SQL chưa chạy
npm run format       # Định dạng mã nguồn
```

Integration test tự mở API ở cổng ngẫu nhiên, tạo tài khoản riêng và dọn dữ liệu của chính nó sau khi chạy. Database phải được khởi động và migration trước đó.

Kiểm thử trình duyệt:

```bash
npx playwright install chromium
npm run test:e2e
```

Nếu môi trường đã có Chromium, không cần tải trình duyệt mới:

```bash
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

Playwright tự khởi động ứng dụng nếu chưa chạy. Các luồng kiểm thử bao gồm tài khoản demo, CRUD giao dịch, áp dụng ngân sách, tải CSV, giao diện điện thoại, đăng ký mới, tạo ví, ngân sách thủ công đổi tên danh mục và lưu tùy chọn giảm chuyển động. Các tài khoản do E2E tạo được giữ lại trong database phát triển.

## Quy tắc tài chính

Số tiền qua API là **chuỗi số nguyên VND**, lưu bằng `BIGINT`. Không dùng số thực để phân bổ ngân sách. Số dư ban đầu không tính vào thu nhập; chuyển ví không tính vào thu/chi.

```text
Tiền linh hoạt = Thu nhập dự kiến − Chi bắt buộc − Tiết kiệm dự kiến
Phần linh hoạt mỗi danh mục = Tiền linh hoạt × Trọng số / Tổng trọng số
```

Phần dư làm tròn được phân bổ theo phần thập phân lớn nhất; nếu bằng nhau, dùng thứ tự danh mục. Tổng phân bổ tự động cộng tiết kiệm luôn bằng thu nhập dự kiến. Nếu thiếu nguồn tiền, hệ thống trả lỗi và không áp dụng kế hoạch. Phương án thủ công có thể để lại tiền chưa phân bổ.

Tiết kiệm dự kiến là **kế hoạch**, không phải số tiền đã tiết kiệm. Thu nhập dự kiến không cộng chồng lên thu nhập thực tế. Vượt ngân sách vẫn được ghi nhận vì giao dịch phản ánh thực tế. Ví có thể âm nếu dữ liệu được nhập thiếu hoặc chi vượt số dư; giao diện hiển thị cảnh báo.

## Migration và dữ liệu

`apps/api/prisma/schema.prisma` mô tả mô hình Prisma; migration SQL được lưu trong `apps/api/prisma/migrations`.

Dự án dùng runner SQL `apps/api/scripts/migrate.mjs` thay cho `prisma migrate deploy`. Runner chạy trong transaction, khóa chống chạy đồng thời và kiểm tra SHA-256 của migration đã áp dụng. **Không sửa migration đã chạy**; thêm thư mục migration mới khi thay đổi dữ liệu. Không trộn lịch sử `_finora_migrations` với Prisma Migrate.

Lý do: cấu hình Prisma 6.19 dùng engine JavaScript cho môi trường không tải được Rust engine; đường migrate qua adapter thử nghiệm gặp lỗi kiểu `name` của PostgreSQL. Runtime Prisma Client dùng JS engine đã được kiểm thử với PostgreSQL thật. Không tắt TLS, checksum hay kiểm tra integrity của package.

Docker lưu dữ liệu trong volume `finora_data`. Dừng database bằng `docker compose stop db`; **không dùng `docker compose down -v` nếu muốn giữ dữ liệu**. Không giả định volume Docker được giữ lại khi chuyển máy hoặc xuất bản môi trường cloud.

Ví dụ sao lưu cục bộ:

```bash
mkdir -p .local
docker compose exec -T db pg_dump -U finora -d finora --no-owner --no-acl > .local/backup.sql
```

File sao lưu chứa dữ liệu riêng tư: không commit, không chia sẻ công khai. Với triển khai thực tế, cần sao lưu tự động và kiểm tra khôi phục định kỳ.

## Build và triển khai

```bash
npm run build
cd apps/api
NODE_ENV=production PORT=3001 npm start
```

Ở production, NestJS phục vụ frontend đã build cùng API trên một origin. Cần HTTPS reverse proxy giữ nguyên `Host`; cookie phiên có `Secure`, `HttpOnly`, `SameSite=Lax`. Không bật `ALLOW_DEMO` khi không chủ đích cho phép tạo tài khoản mẫu. PostgreSQL nên được quản lý bên ngoài hoặc có chính sách lưu trữ, sao lưu phù hợp; không dùng mật khẩu mẫu cho production.

Chưa triển khai lên dịch vụ công khai, chưa cấu hình tên miền hoặc chứng chỉ HTTPS. Chưa có email xác minh/khôi phục mật khẩu, đồng bộ ngân hàng, nhiều tiền tệ, AI dự đoán hoặc quản trị viên. Bản hiện tại là MVP cá nhân; chưa được kiểm thử tải cho lượng giao dịch lớn. CSV giới hạn 10.000 giao dịch mỗi lần xuất và báo lỗi nếu vượt giới hạn, không cắt dữ liệu âm thầm.

## Tài liệu dự án

- [PowerPoint báo cáo đồ án — 15 slide, PDF và ghi chú thuyết trình](docs/presentation/README.md)
- [Phân tích, thiết kế và kế hoạch phát triển](docs/DESIGN.md)
- [Hợp đồng API và quy tắc dữ liệu](docs/API.md)

Repository: [tunato2807-del/qlduanphammen](https://github.com/tunato2807-del/qlduanphammen).
