# Nguồn hình ảnh — Nhịp sống xanh

Ngày 13/11/2026, feature007.

| Thành phần                      | Nguồn                                                         | Trạng thái                                                                               |
| ------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Cảnh thành thị, cà phê, bờ biển | SVG tự vẽ trong `apps/web/src/features/welcome/LifeScene.tsx` | Đã tích hợp; không phải ảnh chụp hoặc hình của người dùng thật                           |
| Sơn thủy ở tài khoản/dashboard  | SVG tự vẽ trong `apps/web/src/shared/BlueLandscape.tsx`       | Giữ từ feature006                                                                        |
| Biểu tượng                      | lucide-react, dependency hiện có                              | Theo giấy phép ISC của package                                                           |
| Ảnh người châu Á theo yêu cầu   | Chưa lấy được nguồn đủ điều kiện                              | Chưa tích hợp; không có chân dung, tên, lời chứng thực hoặc dữ liệu tài chính người thật |

Pexels (`www.pexels.com`, `images.pexels.com`) bị proxy môi trường trả CONNECT403. Bản nháp cấu hình mạng đã lưu thêm hai hostname này và giữ các host đang được phép; chưa có hiệu lực trước khi người dùng review/save và Publish môi trường. Đây là trở ngại truy cập, chưa có kết luận về giấy phép của bất cứ ảnh cụ thể nào.

Bước tiếp theo sau khi truy cập được: chọn ảnh có metadata/mô tả nguồn phù hợp bối cảnh, đọc giấy phép và hạn chế dùng hình người; ghi tác giả, URL ảnh gốc, URL giấy phép, ngày tải, file cục bộ; tối ưu WebP và viết alt mô tả cảnh. Không suy đoán dân tộc dựa trên diện mạo; không gán tài khoản, số tiền hoặc lời đánh giá cho người trong ảnh. Không hotlink ảnh chặn hoặc ảnh chưa kiểm tra. Dữ liệu demo tài chính vẫn là dữ liệu tổng hợp, tách theo tài khoản.
