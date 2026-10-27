# Ghi chú thuyết trình Finora

Bản 15 slide, tiếng Việt; nội dung chính khoảng 12–14 phút. Demo trực tiếp có thể thêm khoảng 2 phút. Ghi chú cũng được lưu trong phần Notes của PowerPoint.

## Slide 01

Thời lượng gợi ý: 40 giây. Giới thiệu Finora, đề tài xây dựng hệ thống quản lý tài chính cá nhân và lập ngân sách tự động. Bản trình bày tập trung vào bài toán, phân tích thiết kế và sản phẩm MVP đã triển khai trong môi trường phát triển. Ví dụ tiền trên bìa chỉ là số liệu minh họa. Bổ sung tên sinh viên, lớp và giảng viên trên slide này nếu cần.

## Slide 02

Thời lượng gợi ý: 50 giây. Đây là các vấn đề mà sản phẩm hướng tới, không phải kết quả khảo sát người dùng. Nhấn mạnh ba nhu cầu: tập hợp tài sản, hiểu thu chi và chủ động lập kế hoạch. Giá trị kỳ vọng là hỗ trợ ra quyết định; chưa có nghiên cứu đo mức tăng tiết kiệm thực tế.

## Slide 03

Thời lượng gợi ý: 50 giây. Phạm vi hiện tại là ứng dụng web cho từng cá nhân, dùng tiền VND và ngân sách theo tháng. Dữ liệu mỗi tài khoản được tách biệt ở backend. Nêu yêu cầu phi chức năng: tiền tệ chính xác, bảo vệ dữ liệu và sử dụng được trên điện thoại. Chưa có vai trò quản trị viên đọc dữ liệu tài chính của người khác.

## Slide 04

Thời lượng gợi ý: 40 giây. Đây là sơ đồ chức năng theo tác nhân, dùng để trình bày tổng quan thay cho một sơ đồ UML chi tiết. Một tác nhân người dùng thao tác với sáu nhóm chức năng. Tất cả tài nguyên nghiệp vụ được xác thực phiên và kiểm tra quyền sở hữu. Chế độ trải nghiệm tạo dữ liệu mẫu riêng cho từng phiên demo.

## Slide 05

Thời lượng gợi ý: 60 giây. Giải thích lý do chọn TypeScript: chia sẻ cách biểu diễn dữ liệu và kiểm tra kiểu trên cả hai phía. React hỗ trợ xây dựng giao diện; NestJS tổ chức controller, guard và service; PostgreSQL lưu dữ liệu có ràng buộc. Prisma dùng JavaScript engine và adapter pg. Development dùng proxy Vite; production NestJS phục vụ frontend đã build cùng API. Không đưa bí mật hay thông tin kết nối database vào frontend.

## Slide 06

Thời lượng gợi ý: 70 giây. Mô hình có bảy bảng. User sở hữu Session, Wallet, Category, Transaction và BudgetPlan. Transaction tham chiếu ví chính, có ví đích khi chuyển tiền, và có danh mục cho thu hoặc chi. BudgetItem nối kế hoạch với từng danh mục. Sơ đồ đã lược bớt thuộc tính và đường nối để dễ đọc; destinationId trên hình là viết tắt của destinationWalletId. PK là khóa chính, FK là khóa ngoại. Các quan hệ ví/danh mục tới giao dịch và danh mục/kế hoạch tới BudgetItem đều là một–nhiều, với khóa ngoại có thể rỗng theo loại giao dịch. Ràng buộc database giữ một kế hoạch đang áp dụng cho mỗi người và tháng.

## Slide 07

Thời lượng gợi ý: 60 giây. Minh họa chuyển 500 nghìn từ ví ngân hàng sang tiền mặt: tổng tài sản không đổi. Số dư đầu không tính là thu nhập trong kỳ. Thu nhập dự kiến không được cộng vào thu nhập thực tế. Tiết kiệm dự kiến không đồng nghĩa đã tiết kiệm. Cho phép số dư âm khi nhập thiếu hoặc chi vượt số dư, nhưng có cảnh báo để người dùng kiểm tra.

## Slide 08

Thời lượng gợi ý: 60 giây. Tách preview khỏi save để người dùng xem phương án trước. Khi lưu, backend tính lại từ đầu vào thay vì tin hạn mức do frontend gửi. Nếu thay đổi dữ liệu, bản xem trước cũ bị hủy. Database transaction và advisory lock tránh hai thao tác tạo kế hoạch đang áp dụng đồng thời. Phiên bản trước vẫn lưu trong database; giao diện hiện chỉ hiển thị bản đang áp dụng. Nếu nguồn tiền không đủ, hệ thống trả lỗi và không áp dụng.

## Slide 09

Thời lượng gợi ý: 80 giây. Thu nhập 10 triệu, chi bắt buộc 4 triệu, tiết kiệm dự kiến 2 triệu nên còn 4 triệu linh hoạt. Tổng trọng số là 6. Ăn uống nhận thêm 2 triệu; di chuyển nhận 1.333.333 đồng; giải trí nhận 666.667 đồng sau phân bổ phần dư. Hạn mức ăn uống cộng cả 1 triệu bắt buộc thành 3 triệu. Tổng bốn danh mục bằng 8 triệu. Thuật toán dùng BigInt, chia nguyên, rồi cấp từng đồng dư cho phần dư lớn nhất; nếu bằng nhau dùng thứ tự danh mục. Đây là tự động theo quy tắc, chưa phải mô hình AI dự đoán.

## Slide 10

Thời lượng gợi ý: 50 giây. Đây là ảnh từ ứng dụng chạy thật với tài khoản demo, không phải wireframe. Ảnh cắt phần đầu để phóng to khu vực quan trọng. Đi từ trên xuống: hành động thêm giao dịch, bốn chỉ số tổng quan và biểu đồ. Tổng số dư là số dư hiện tại, còn thu nhập và chi tiêu phụ thuộc tháng được chọn. Dữ liệu mẫu không đại diện cho một người dùng thật.

## Slide 11

Thời lượng gợi ý: 45 giây. Mục tiêu thiết kế là phù hợp người trẻ mà vẫn đọc được số liệu tài chính. Hiệu ứng được triển khai bằng Motion và CSS, ảnh tĩnh trên slide không thể hiện chuyển động. Khi demo có thể rê chuột lên nút, thẻ, rồi bấm nút biểu tượng lấp lánh để giảm chuyển động. Hệ thống cũng phản hồi khi cài đặt reduced motion của hệ điều hành thay đổi. Ảnh điện thoại được cắt phần đầu để dễ quan sát.

## Slide 12

Thời lượng gợi ý: 60 giây. Các số 17 và 3 là kết quả các lần kiểm thử đã hoàn tất cho phiên bản MVP và cập nhật giao diện, không phải kiểm thử mới chạy riêng khi tạo slide. Build API và frontend đã thành công. API integration dùng PostgreSQL thật. Đổi mật khẩu thu hồi các phiên khác. Production bật Secure cho cookie và cần HTTPS. Các kiểm thử chứng minh những luồng đã kiểm tra; chưa có đánh giá tải lớn hay kiểm toán bảo mật độc lập.

## Slide 13

Thời lượng gợi ý: 55 giây. WBS chia dự án thành năm nhóm công việc theo đầu ra. Các mục trên là kết quả hiện có chứ không phải một lịch dự án được dựng lại. Khi làm báo cáo học phần có thể bổ sung thành viên, người phụ trách, ngày bắt đầu/kết thúc và ước lượng theo dữ liệu thực tế của nhóm. Repository đã được đẩy lên GitHub. Chưa có môi trường production công khai, tên miền hay chứng chỉ HTTPS.

## Slide 14

Thời lượng gợi ý: 50 giây. Đây là đề xuất lộ trình, chưa cam kết thời hạn và chưa phải chức năng hiện hữu. Ưu tiên vận hành ổn định và bảo vệ dữ liệu trước khi tích hợp thêm dịch vụ. Thu nhập dự kiến có thể sai so với thực tế nên cần cập nhật ngân sách. Tích hợp ngân hàng và dự báo cần khảo sát, nguồn dữ liệu, sự đồng ý và đánh giá chi phí. Không khẳng định hệ thống hiện có AI.

## Slide 15

Thời lượng gợi ý: 30 giây giới thiệu + 2 phút demo nếu có. Trước buổi báo cáo chạy scripts/setup.sh và scripts/start.sh theo README. Mở tài khoản demo; thêm một khoản chi với số tiền dễ đối chiếu; xem số dư thay đổi; tạo phương án ngân sách rồi áp dụng; cuối cùng đổi kích thước màn hình hoặc mở trên điện thoại và thử nút giảm chuyển động. Nếu không có môi trường chạy, dùng ảnh slide 10 và 11, không nói rằng demo trực tiếp đã diễn ra. Link GitHub chứa mã nguồn và hướng dẫn, không phải đường dẫn website đã triển khai công khai.
