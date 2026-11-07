# Hoàn thiện lập kế hoạch tài chính cá nhân

**Ngày**: 07/11/2026 · **Trạng thái**: đang triển khai theo yêu cầu “Hãy thêm hết giúp tôi”.
Phạm vi mở rộng V2; các đặc tả cũ được giữ làm hồ sơ lịch sử.

## User Scenarios & Testing

### US1 — Ngân sách có căn cứ (P1)

Người dùng xem gợi ý từ ba tháng đã kết thúc, sửa và xem trước trước khi xác nhận; xem mọi phiên bản cùng mức chi thực tế của tháng. Không có lịch sử thì chỉ rõ chưa đủ dữ liệu, không giả thu nhập.
**Nghiệm thu**: thu nhập trung bình ba tháng, cả tháng không phát sinh tính bằng 0; trọng số theo cơ cấu chi; kết quả chỉ là dự kiến. Lịch sử giữ nguyên hạn mức cũ, chi thực tế theo sổ hiện tại, ghi rõ thời điểm đối chiếu.

### US2 — Nhắc khoản định kỳ (P1)

Tạo quy tắc thu/chi hàng tháng, ngày 1–31 và khoảng tháng hiệu lực; ngày 31 ở tháng ngắn được chốt vào cuối tháng. Xem các khoản đã đến hạn trong tháng đang chọn, xác nhận hoặc bỏ qua từng bản nháp. Có thể tạm dừng quy tắc.
**Nghiệm thu**: tạo nháp không đổi số dư; xác nhận hai lần/chạy đồng thời chỉ ghi một giao dịch. Ví/danh mục đã lưu trữ phải được báo lỗi trước khi xác nhận. Tháng cũ được xem lại để xử lý khoản chưa xác nhận.

### US3 — Mục tiêu tiết kiệm (P1)

Tạo mục tiêu có số tiền và hạn hoàn thành; phân bổ tiền đã có trong ví vào mục tiêu, rút phân bổ khi cần. Xem tiến độ, lịch sử và mức cần dành mỗi tháng.
**Nghiệm thu**: phân bổ không phải thu/chi, không tăng tài sản; không phân bổ vượt số dư khả dụng tại lúc ghi, không rút vượt phần của mục tiêu trong ví. Chi tiêu sau đó có thể làm số dư thấp hơn phần dành riêng và phải có cảnh báo. Dự trù ngân sách không tự ghi vào mục tiêu.

### US4 — Nhập CSV an toàn (P1)

Tải mẫu chuẩn, chọn file tối đa 50 KB/200 dòng, xem trước từng dòng và lỗi; hệ thống nhận dạng bản xuất CSV của Finora. Bỏ qua giao dịch trùng theo ngày, loại, ví, danh mục, số tiền và ghi chú. Chỉ xác nhận khi không còn dòng lỗi; nhập toàn bộ trong một lần hoặc không ghi dòng nào.
**Nghiệm thu**: dấu phẩy/dấu nháy/xuống dòng tiếng Việt được đọc đúng; dữ liệu người khác bị từ chối; nhập lại cùng file không nhân đôi; xem trước không ghi sổ. Nhãn lỗi cho biết dòng cần sửa.

### US5 — Báo cáo tháng (P1)

Xem thu/chi/chênh lệch so tháng trước, đối chiếu ngân sách và tải PDF tiếng Việt. So tháng trước bằng chênh lệch số tiền; khi gốc bằng 0 không tạo tỷ lệ phần trăm sai.
**Nghiệm thu**: PDF chứa đúng tháng và số liệu tài khoản đăng nhập, không cộng chuyển ví hoặc mục tiêu vào thu/chi.

### US6 — Khôi phục và vận hành (P1)

Quên mật khẩu nhận thông báo chung; liên kết email dùng một lần trong 30 phút, đặt lại mật khẩu thu hồi mọi phiên. Có cấu hình gửi email và kiểm tra ở hộp thư phát triển. Có hướng dẫn triển khai HTTPS, sao lưu và khôi phục thử trên cơ sở dữ liệu riêng.
**Nghiệm thu**: phản hồi không tiết lộ email tồn tại; token không lưu dạng thô, hết hạn/dùng lại bị từ chối. Không tự phát sinh dịch vụ trả phí. Triển khai công khai cần tên miền và dịch vụ của chủ dự án.

### US7 — Bảo vệ và hồ sơ đồ án (P2)

Có lịch công việc, RACI theo vai trò, dự toán và rủi ro, activity/sequence, ma trận yêu cầu–kiểm thử; phân biệt số liệu thực đo với giả định. Gửi lại thao tác tài chính với cùng mã yêu cầu không tạo bản ghi trùng; mã dùng cho nội dung khác bị từ chối. Đo báo cáo trên tập sổ lớn và ghi bằng chứng.

## Requirements

- FR01: Toàn bộ truy cập và tham chiếu thuộc tài khoản đã đăng nhập; số tiền nguyên VND chính xác từng đồng.
- FR02: Gợi ý ngân sách và lịch sử đáp ứng US1, không ghi trước xác nhận.
- FR03: Quy tắc/nháp/xác nhận/bỏ qua đáp ứng US2; không tự động hạch toán.
- FR04: Mục tiêu, phân bổ và rút đáp ứng US3, có lịch sử.
- FR05: Nhập mẫu/xuất, preview, lỗi dòng, chống trùng và xác nhận nguyên tử đáp ứng US4.
- FR06: Báo cáo và PDF đáp ứng US5.
- FR07: Khôi phục mật khẩu, HTTPS và sao lưu đáp ứng US6; giữ dữ liệu hiện hữu.
- FR08: Chống gửi lặp cho thao tác ghi tiền và lưu ngân sách; tương thích client cũ.
- FR09: Tài liệu và bằng chứng đáp ứng US7, không bịa người thực hiện hoặc kết quả khảo sát.
- FR10: UI tiếng Việt, bàn phím, trạng thái tải/rỗng/lỗi, giảm chuyển động, không tràn trang ở 320–1440px.

## Key Entities

Ngân sách/phiên bản, quy tắc định kỳ/bản nháp, mục tiêu/phân bổ, mã ghi lặp, token khôi phục. Sổ giao dịch và ví hiện có giữ nguyên dữ liệu.

## Success Criteria

- SC01: Tất cả kịch bản tiền, quyền sở hữu, trùng lặp và token có kiểm thử đạt.
- SC02: Người dùng hoàn thành quy trình tạo quy tắc→xác nhận, mục tiêu→phân bổ/rút, CSV→xác nhận và tải PDF trong trình duyệt.
- SC03: Không lỗi accessibility mức serious/critical trong màn hình/dialog đã đổi được kiểm tra.
- SC04: Khôi phục bản sao trên database riêng thành công, số liệu đối chiếu khớp; không tác động database gốc.
- SC05: Hồ sơ đồ án truy vết từng FR tới mã và kiểm thử; hiệu năng có tập dữ liệu và số đo công bố.

## Assumptions & Dependencies

VND, tháng theo Asia/Ho_Chi_Minh; định kỳ hàng tháng. Không đồng bộ ngân hàng/AI. Email sản xuất và website công khai phụ thuộc dịch vụ/tên miền chưa được cung cấp; bàn giao mã, cấu hình và thử nội bộ trước. RACI dùng vai trò vì chưa có danh sách thành viên. Lịch đề xuất và dự toán ghi rõ giả định.
