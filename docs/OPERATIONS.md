# Vận hành, email, HTTPS và sao lưu

Ngày 07/11/2026. Chủ dự án chưa có dịch vụ email, hosting hoặc tên miền; mã/cấu hình được chuẩn bị để triển khai sau. Các lệnh sau không phải bằng chứng đã có website công khai.

## Khôi phục mật khẩu qua email

Chạy mailbox cục bộ:

```bash
docker compose -f compose.mail.yaml up -d
```

Trong `apps/api/.env`, bổ sung các giá trị từ phần SMTP của `.env.example`: `PUBLIC_URL=http://localhost:5173`, `SMTP_HOST=127.0.0.1`, `SMTP_PORT=1025`, `SMTP_SECURE=false`, `MAIL_FROM=Finora <noreply@finora.local>`. Khởi động lại API. Mailpit có giao diện cổng 8025 trên máy chạy Docker, chỉ bind loopback; thư không gửi ra Internet.

Đăng ký tài khoản email giả, dùng “Quên mật khẩu?”, mở thư trong Mailpit và liên kết đặt lại. Token nằm trong fragment, được bỏ khỏi URL sau khi form đọc, chỉ lưu SHA256 trong database, hết hạn 30 phút và dùng một lần. Đổi xong thu hồi tất cả phiên. Giới hạn chung auth là 30 yêu cầu/15 phút/IP và tối thiểu một phút giữa hai thư cho cùng tài khoản; endpoint trả thông báo chung trước khi lookup/gửi để không phụ thuộc độ trễ SMTP. Lỗi gửi chỉ log `recovery.delivery_failed`, không ghi địa chỉ/token. API config có `recoveryEnabled`; thiếu cấu hình trả 503 chung, không giả vờ đã gửi.

Production: chọn SMTP có xác thực, cấu hình SPF/DKIM/DMARC theo nhà cung cấp, dùng TLS với port phù hợp (`587` + STARTTLS hoặc `465` + `SMTP_SECURE=true`), `PUBLIC_URL` HTTPS. Chỉ đặt credential trong secret/env trên máy chủ. Không gửi mật khẩu/API key vào chat hoặc Git. Email thật vẫn cần kiểm tra deliverability với nhà cung cấp sau này. Tác vụ gửi nền hiện nằm trong process: nếu API dừng giữa lúc xử lý, người dùng cần yêu cầu lại; chưa có hàng đợi email bền vững.

## Đóng gói và triển khai HTTPS

```bash
cp .env.production.example .env.production
chmod 600 .env.production
# Điền tên miền, mật khẩu DB ngẫu nhiên, URL nội bộ và SMTP trên máy chủ.
docker compose --env-file .env.production -f compose.production.yaml config --quiet
docker compose --env-file .env.production -f compose.production.yaml up -d --build
```

Trước khi chạy public cần máy chủ Docker/Compose v2, DNS A/AAAA trỏ tới máy chủ và cổng 80/443 vào Caddy. Caddy tự cấp/gia hạn HTTPS. API và PostgreSQL chỉ trong mạng Compose, không publish cổng. Demo tắt, cookie HttpOnly/SameSite Lax/Secure. `TRUST_PROXY=1` chỉ phù hợp đúng một proxy tin cậy như compose này; không dùng khi app có đường truy cập trực tiếp từ Internet. Caddy mặc định quản lý forwarded headers, không tin header IP do client tự đặt.

Image multi-stage cài theo lockfile, lifecycle script tắt, generate Prisma với URL build giả (không kết nối DB), chạy non-root UID 1000/read-only filesystem. Migration chạy service riêng, phải thành công trước app; health kiểm tra DB trước khi proxy nhận app. Khi build trong managed cloud, cấp CA qua secret, không copy CA/credential vào image:

```bash
docker build --secret id=proxy_ca,src="$CODEX_PROXY_CERT" -t finora:local .
docker compose --env-file .env.production -f compose.production.yaml up -d --no-build
```

Không cần secret CA ở máy có trust thông thường. Giữ proxy/CA theo môi trường; không tắt TLS. Pin digest image base theo đợt release nếu tổ chức cần tái lập tuyệt đối; cấu hình hiện pin major image để nhận bản vá, cần build và test lại trước cập nhật.

Kiểm tra sau triển khai: health 200, HTTPS/chứng chỉ, cookie Secure, demo 403, đăng ký/đăng nhập, sở hữu dữ liệu, email/reset, PDF và backup. Kiểm tra rate limit qua IP thật. Không coi health một mình là nghiệm thu nghiệp vụ.

## Sao lưu

Development:

```bash
npm run db:backup -- .local/backups/finora-YYYYMMDD.dump
npm run db:restore-check -- .local/backups/finora-YYYYMMDD.dump
```

Production:

```bash
FINORA_ENV_FILE=.env.production FINORA_COMPOSE_FILE=compose.production.yaml \
  bash scripts/database.sh backup .local/backups/finora-YYYYMMDD.dump
FINORA_ENV_FILE=.env.production FINORA_COMPOSE_FILE=compose.production.yaml \
  bash scripts/database.sh verify .local/backups/finora-YYYYMMDD.dump
```

Script `pg_dump` custom format, không owner/privilege; file mode 600, SHA256 để đối chiếu, không ghi đè file đã có. Bản sao chứa email, password hash, dữ liệu tài chính và phiên; chỉ lưu trong khu vực riêng, mã hóa bản sao ngoài máy, giới hạn người truy cập. `.local` và `backups/` được ignore. Không đưa dump lên Git/issue.

Đề xuất vận hành khi có người dùng thật: backup hằng ngày (mục tiêu RPO 24 giờ), giữ 7 ngày và 4 bản tuần; copy mã hóa ra nơi độc lập với VPS. Thử restore hàng tháng. Đây là chính sách đề xuất. Có mẫu `deploy/finora-backup.service`, `.timer` và `backup-daily.sh` chạy 02:00 giờ Việt Nam; chưa bật timer hoặc cấu hình kho offsite. Khi deploy tại `/opt/finora`, chỉnh User/WorkingDirectory theo máy chủ, cấp quyền đọc env và chạy Docker cho tài khoản vận hành; dùng `systemctl link` hai file unit rồi `systemctl enable --now finora-backup.timer`. Kiểm tra lần chạy đầu bằng `journalctl -u finora-backup.service`; chỉ log trạng thái/checksum, không nội dung dump. Mẫu chưa tự xóa bản sao cũ; áp dụng retention sau khi đã kiểm tra bản sao ngoài máy. Mục tiêu RTO 2 giờ cần được diễn tập trên hạ tầng thật, chưa phải cam kết.

## Restore khi xảy ra sự cố

1. Dừng ghi dữ liệu và giữ nguyên DB/volume cũ; xác minh checksum của dump.
2. Tạo **database rỗng riêng** bằng `createdb` trong dịch vụ db. Ví dụ `finora_recovered_YYYYMMDD`.
3. Chạy `database.sh restore FILE EMPTY_DB --restore-to-empty`, với cùng biến `FINORA_ENV_FILE`/`FINORA_COMPOSE_FILE` nếu production. Script từ chối tên DB nguồn hoặc DB có bảng, restore trong một transaction, dừng ngay nếu lỗi.
4. Đối chiếu `_finora_migrations`, số bản ghi, số dư và báo cáo, chạy ứng dụng kiểm tra với URL DB mới. Thu hồi các phiên/token reset đã khôi phục trước khi mở lại truy cập, để không hồi sinh phiên cũ.
5. Chỉ chuyển `DATABASE_URL` sang DB phục hồi sau khi chủ vận hành chấp nhận đối chiếu. Giữ DB cũ theo chính sách lưu trữ để điều tra; không `down -v`.

Lệnh `verify` tự tạo database `finora_restore_<timestamp>_<random>`, restore rồi in số dòng các bảng chính, xóa chính database thử trong trap. Nó không đổi URL ứng dụng, không xóa hoặc ghi đè DB nguồn. Bằng chứng diễn tập trong spec `verification.md`; dữ liệu dump không nằm trong repository.

## Cập nhật và xử lý lỗi

Backup trước migration production. Không sửa migration đã áp dụng; runner kiểm tra checksum, advisory lock và transaction. Rollback mã về release trước vẫn giữ tables mới vì migration mở rộng additive; không tự downgrade xóa dữ liệu. Theo dõi `request_failed`, `recovery.delivery_failed`, request ID và health; không log body/cookie/số tiền. Mã chưa tích hợp dashboard giám sát ngoài hoặc cảnh báo email tự động.
