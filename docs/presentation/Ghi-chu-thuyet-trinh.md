# Ghi chú thuyết trình Finora

Cập nhật 13/11/2026 · 15 slide, khoảng 12–15 phút. Họ tên/lớp/GVHD cần bổ sung theo thông tin thật.

## 1. Tài chính trong tầm tay.

Giới thiệu đề tài quản lý tài chính cá nhân và lập ngân sách tự động. Finora hỗ trợ quyết định bằng quy tắc minh bạch, không đồng bộ tài khoản ngân hàng hoặc dự đoán AI. Bổ sung họ tên, lớp và giảng viên trước khi bảo vệ.

## 2. Từ ghi chép rời rạc đến một kế hoạch rõ ràng.

Nêu ba vấn đề: khó biết tiền đi đâu, lập kế hoạch tách rời thực tế và dễ quên các khoản thanh toán. Mục tiêu là ghi nhận đúng, lập kế hoạch có căn cứ, xem lại và điều chỉnh. Không đưa ra số liệu khảo sát người dùng khi chưa có khảo sát.

## 3. Một ứng dụng cá nhân, nghiệp vụ có ranh giới.

Trình bày phạm vi VND, tháng Việt Nam và dữ liệu riêng theo tài khoản. Sáu nhóm năng lực trong capability map giữ nguyên; các vòng đời mới theo specs 003–005 đã được người dùng cho phép. Không mua dịch vụ hoặc đưa dữ liệu ra hệ thống bên ngoài.

## 4. Người dùng kiểm soát mọi bước ghi tiền.

Tác nhân chính là người dùng cá nhân. Hệ thống tính toán và đề xuất, còn người dùng xác nhận các thay đổi tài chính. Giải thích vì sao khoản định kỳ tạo nháp thay vì tự ghi sổ, tránh nhầm dự kiến với thực tế.

## 5. React → NestJS → PostgreSQL.

Dùng TypeScript cho frontend và backend để thống nhất kiểu dữ liệu. NestJS là ứng dụng một khối gồm Identity, Ledger, Budgeting, Planning, Reporting, Demo và Infrastructure. Demo tách khỏi Identity để tránh vòng phụ thuộc. Báo cáo đọc cùng snapshot RepeatableRead và truyền transaction client xuyên các provider. Prisma dùng bộ máy JavaScript với PostgreSQL. Spec Kit chỉ phục vụ quá trình phát triển, không chạy trong sản phẩm.

## 6. 13 model, một nguyên tắc: giữ được dấu vết.

Nêu các nhóm dữ liệu, không đọc mọi cột. Sổ giao dịch là nguồn tính số dư; budget plan giữ revision; recurring draft unique theo quy tắc và tháng; goal contribution là phân bổ tiền đang có. Migration 07/11 đã thêm sáu bảng; lần làm lại 12/11 không đổi schema hoặc migration, giữ dữ liệu cũ. Xem ERD đầy đủ trong tài liệu.

## 7. Chia ngân sách đúng đến từng đồng.

Ví dụ thu 15 triệu, tiết kiệm dự kiến 3 triệu, chi bắt buộc 6 triệu, còn 6 triệu linh hoạt. Trọng số 3:2:1 nhận 3, 2 và 1 triệu. Khi có dư do chia nguyên, thuật toán largest remainder phân từng đồng cho phần dư lớn nhất, thứ tự danh mục xử lý trường hợp bằng nhau. Thiếu tiền thì từ chối trước khi lưu.

## 8. Có căn cứ khi lập, có lịch sử khi điều chỉnh.

Gợi ý dùng ba tháng đã kết thúc, cả tháng không phát sinh vẫn tính bằng không. Mức tiết kiệm gợi ý 20% có thể sửa. Nhấn mạnh đây là quy tắc gợi ý, không phải AI. Có thể dùng revision cũ làm draft, cảnh báo danh mục lưu trữ rồi preview và xác nhận revision mới. Mọi phiên bản giữ hạn mức riêng và đối chiếu sổ thực tế hiện tại, không phải ảnh chụp số chi trong quá khứ.

## 9. Định kỳ và mục tiêu không làm sai tài sản.

Khoản định kỳ tạo bản nháp theo ngày đến hạn, xử lý tháng ngắn bằng ngày cuối tháng. Xác nhận đồng thời vẫn chỉ ghi một transaction. Mục tiêu dành riêng tiền trong ví và có thể rút phần đã dành; không cộng thành thu nhập hoặc giảm tổng tài sản. Nếu chi tiêu sau đó khiến ví thiếu phần dành riêng thì giao diện cảnh báo. Sửa/archived/restore mục tiêu giữ lịch sử; archived chỉ rút. Thay định kỳ từ tháng sau và sau start cũ: kết thúc rule cũ trước tháng mới rồi tạo mới nguyên tử, nháp cũ giữ số tiền cũ.

## 10. Nhập có kiểm tra, xuất có đối chiếu.

CSV giới hạn 50 KB và 200 dòng. Xem lỗi theo dòng, đọc dấu nháy và tiếng Việt đúng, bỏ dòng trùng, xác nhận nguyên tử. Báo cáo so tháng trước bằng số tiền; PDF tiếng Việt có ngân sách và mức chi, loại chuyển ví khỏi thu/chi. File nhập mẫu cần đúng tên ví/danh mục của tài khoản.

## 11. Trẻ trung, nhưng số liệu luôn rõ ràng.

Giao diện Men lam: xanh dương chủ đạo, trắng ngà, điểm nhấn vàng cát/ngọc bích. Trang chào phủ màn hình, nhận diện giữa và quote serif tham khảo ảnh website người dùng gửi; minh họa sơn thủy tự vẽ. Dashboard gợi ý bước tiếp theo từ dữ liệu thật; các trang lazy, hook theo tháng/tài khoản và ErrorBoundary cho phục hồi. Chuyển động dùng Motion, cho phép giảm và tôn trọng hệ điều hành. Bố cục thử từ 320 đến 1440 pixel; menu mobile giữ focus và đóng bằng Escape. Lỗi hover qua lại khi đổi form đã có regression test.

## 12. Giữ quyền sở hữu và giữ được dữ liệu.

Giải thích ownership phía server cho mọi ID, cookie HttpOnly/Secure production, password scrypt và reset token SHA256 dùng một lần. Key gửi lại ngăn ghi trùng. SQL migration additive có checksum; backup và restore thử DB riêng. Docker non-root và Caddy HTTPS đã chuẩn bị, chưa có tên miền hay SMTP thật theo thông tin người dùng.

## 13. Bằng chứng chạy được, số liệu có giới hạn.

40 kiểm thử API/unit và 19 browser đạt, không skip. Axe không serious/critical ở phạm vi kiểm tra; không phải chứng nhận WCAG. Benchmark 10.000 giao dịch: trung vị cũ 19.03 ms, mới 41,44 ms, p95 mới 51,14 ms. Bản mới chậm hơn do đọc snapshot tuần tự và thêm kế hoạch; đổi lấy tính nhất quán khi có ghi đồng thời. 20 mẫu, 3 warmup; chưa phải load test/SLA. Production Docker non-root/read-only qua Caddy TLS nội bộ đã smoke. Restore riêng đã có bằng chứng 07/11, schema lần này giữ nguyên.

## 14. Quản lý bằng đầu ra và bằng chứng.

Các mốc quá khứ lấy từ Git: MVP 25/10, V2 28–29/10, Spec Kit 04/11, mở rộng 07/11. Ngày 12/11 làm lại UI, lifecycle và modules; lịch UAT cũ 08–10/11 chưa có xác nhận. Đề xuất UAT mới từ 13/11, chưa coi là hoàn tất. RACI theo vai trò, không bịa tên thành viên. Dự toán 495 nghìn đồng là phương án hosting/tên miền và dự phòng, chưa phát sinh chi phí; xem giả định trong hồ sơ.

## 15. Một luồng demo, đủ thấy giá trị.

Demo trong khoảng hai phút nếu thời gian cho phép: mở tài khoản mẫu, ngân sách và dùng revision làm draft, sửa/archived mục tiêu, thay định kỳ từ tương lai rồi xác nhận nháp cũ, lọc/preview CSV và tải PDF. Nêu rõ email thật và website public chờ dịch vụ. Kết thúc bằng câu hỏi về mô hình dữ liệu, phân bổ chính xác, chống trùng và bảo vệ tài khoản.
