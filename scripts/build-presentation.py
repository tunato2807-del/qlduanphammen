"""Build editable Vietnamese slides and a matching PDF from the same layout.
Requires python-pptx==1.0.2, reportlab==4.4.9 and Pillow. No external service.
Run after capture-screenshots.mjs. All numbers are sourced from release evidence.
"""
from pathlib import Path
from math import ceil
import json
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.xmlchemy import OxmlElement
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image

ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'docs/presentation'; OUT.mkdir(parents=True,exist_ok=True)
FONT=ROOT/'apps/api/assets/LiberationSans-Regular.ttf'
pdfmetrics.registerFont(TTFont('Finora',str(FONT)))
pdfmetrics.registerFont(TTFont('FinoraBold',str(FONT.with_name('LiberationSans-Bold.ttf'))))
prs=Presentation(); prs.slide_width=Inches(13.333); prs.slide_height=Inches(7.5)
pdf=canvas.Canvas(str(OUT/'Finora-Thuyet-trinh.pdf'),pagesize=(960,540))
pdf.setTitle('Finora — Báo cáo đồ án, 13/11/2026')
INK='173D5A'; MUTED='52647F'; PURPLE='255D8C'; LAV='E5EFF6'; LIME='E9D8B3'; BG='F3F7FA'
metrics=json.loads((ROOT/'specs/005-application-modules/performance.json').read_text())
median=str(metrics['current']['medianMs']).replace('.',',')
p95=str(metrics['current']['p95Ms']).replace('.',',')
notes=[]; slide=None; index=0

def rgb(value):return RGBColor.from_string(value)
def box(x,y,w,h,color= 'FFFFFF',radius=True):
 sh=slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE,Inches(x),Inches(y),Inches(w),Inches(h))
 sh.fill.solid();sh.fill.fore_color.rgb=rgb(color);sh.line.fill.background()
 pdf.setFillColor('#'+color);pdf.roundRect(x*72,540-(y+h)*72,w*72,h*72,10 if radius else 0,fill=1,stroke=0)
 return sh

def wrapped(text,width,size,face):
 result=[]
 for line in text.split('\n'):
  words=line.split(); current=''
  for word in words:
   candidate=(current+' '+word).strip()
   if current and pdfmetrics.stringWidth(candidate,face,size)>width:
    result.append(current);current=word
   else:current=candidate
  result.append(current)
 return result

def text(x,y,w,h,content,size=20,color=INK,bold=False):
 face="FinoraBold" if bold else "Finora"
 lines=wrapped(content,w*72-6,size,face)
 leading=size*1.34
 if len(lines)*leading>h*72+3:raise ValueError(f'Text overflows slide {index}: {content[:65]}')
 sh=slide.shapes.add_textbox(Inches(x),Inches(y),Inches(w),Inches(h));tf=sh.text_frame;tf.clear()
 tf.margin_left=tf.margin_right=Pt(0);tf.margin_top=tf.margin_bottom=Pt(0)
 # Explicit lines keep the exported PDF and PowerPoint layout close.
 for i,line in enumerate(lines):
  p=tf.paragraphs[0] if i==0 else tf.add_paragraph();p.text=line;p.space_after=Pt(0);p.space_before=Pt(0);p.line_spacing=Pt(leading)
  for r in p.runs:r.font.name='Arial';r.font.size=Pt(size);r.font.bold=bold;r.font.color.rgb=rgb(color)
 pdf.setFont(face,size);pdf.setFillColor('#'+color)
 for i,line in enumerate(lines):pdf.drawString(x*72,540-y*72-size-i*leading,line)
 return sh

def picture(path,x,y,w,h):
 path=ROOT/path
 with Image.open(path) as im: iw,ih=im.size
 crop_h=min(ih,844 if iw<600 else 900)
 scale=min(w/iw,h/crop_h);pw,ph=iw*scale,crop_h*scale;px,py=x+(w-pw)/2,y+(h-ph)/2
 sh=slide.shapes.add_picture(str(path),Inches(px),Inches(py),width=Inches(pw),height=Inches(ph))
 sh.crop_bottom=(ih-crop_h)/ih
 # Native document cropping; source screenshot remains unchanged.
 pdf.saveState();clip=pdf.beginPath();clip.rect(px*72,540-(py+ph)*72,pw*72,ph*72);pdf.clipPath(clip,stroke=0)
 pdf.drawImage(str(path),px*72,540-py*72-ih*scale*72,pw*72,ih*scale*72);pdf.restoreState()

def start(kicker,title,note):
 global slide,index
 if index:pdf.showPage()
 index+=1;slide=prs.slides.add_slide(prs.slide_layouts[6]);slide.background.fill.solid();slide.background.fill.fore_color.rgb=rgb(BG)
 pdf.setFillColor('#'+BG);pdf.rect(0,0,960,540,fill=1,stroke=0)
 text(.55,.28,11,.3,'FINORA  /  '+kicker,11,PURPLE,True)
 text(.55,.85,12.1,.8,title,30,INK,True)
 box(.55,7.01,12.2,.015,LIME,False)
 text(.55,7.13,10,.22,'BÁO CÁO ĐỒ ÁN · 13/11/2026 · VND / VIỆT NAM',9,MUTED)
 text(12.1,7.12,.6,.23,f'{index:02d}',10,PURPLE)
 slide.notes_slide.notes_text_frame.text=note;notes.append((title,note))
 trans=OxmlElement('p:transition');fade=OxmlElement('p:fade');trans.append(fade);slide._element.append(trans)

def cards(items):
 w=(12.2-.22*(len(items)-1))/len(items)
 for i,(heading,body) in enumerate(items):
  x=.55+i*(w+.22);box(x,2.02,w,4.45);text(x+.23,2.29,w-.46,.9,heading,21,PURPLE,True);text(x+.23,3.33,w-.46,2.75,body,17)

start('GIỚI THIỆU','Tài chính trong tầm tay.', 'Giới thiệu đề tài quản lý tài chính cá nhân và lập ngân sách tự động. Finora hỗ trợ quyết định bằng quy tắc minh bạch, không đồng bộ tài khoản ngân hàng hoặc dự đoán AI. Bổ sung họ tên, lớp và giảng viên trước khi bảo vệ.')
box(.55,1.9,7.2,4.62,INK);text(.9,2.3,6.5,1.5,'Quản lý tài chính cá nhân\nvà lập ngân sách tự động',30,'FFFFFF',True);text(.9,4.35,6.3,1.4,'Người thực hiện: [Họ tên / nhóm]\nLớp: [Lớp] · GVHD: [Giảng viên]',18,LIME)
picture('docs/images/mobile.png',8.2,1.8,4.2,4.95)
start('BỐI CẢNH','Từ ghi chép rời rạc đến một kế hoạch rõ ràng.', 'Nêu ba vấn đề: khó biết tiền đi đâu, lập kế hoạch tách rời thực tế và dễ quên các khoản thanh toán. Mục tiêu là ghi nhận đúng, lập kế hoạch có căn cứ, xem lại và điều chỉnh. Không đưa ra số liệu khảo sát người dùng khi chưa có khảo sát.')
cards([('Hiểu dòng tiền','Gom ví, thu/chi và chuyển tiền vào một sổ có thể tìm kiếm, lọc và đối chiếu.'),('Chủ động kế hoạch','Ngân sách theo ưu tiên, gợi ý từ lịch sử và mục tiêu tiết kiệm có tiến độ.'),('Duy trì thói quen','Nháp định kỳ, nhập CSV, báo cáo tháng và giao diện dễ dùng trên điện thoại.')])
start('PHẠM VI','Một ứng dụng cá nhân, nghiệp vụ có ranh giới.', 'Trình bày phạm vi VND, tháng Việt Nam và dữ liệu riêng theo tài khoản. Sáu nhóm năng lực trong capability map giữ nguyên; các vòng đời mới theo specs 003–005 đã được người dùng cho phép. Không mua dịch vụ hoặc đưa dữ liệu ra hệ thống bên ngoài.')
cards([('Tài khoản & sổ','Phiên đăng nhập, đổi/khôi phục mật khẩu. Ví, danh mục, giao dịch, CSV có kiểm tra trùng.'),('Lập kế hoạch','Ngân sách AUTO/MANUAL, phiên bản và thực tế. Quy tắc hằng tháng, mục tiêu và phân bổ tiền.'),('Báo cáo & trải nghiệm','Dòng tiền sáu tháng, cơ cấu chi, so tháng trước, PDF. Responsive, bàn phím và giảm chuyển động.')])
start('TÁC NHÂN','Người dùng kiểm soát mọi bước ghi tiền.', 'Tác nhân chính là người dùng cá nhân. Hệ thống tính toán và đề xuất, còn người dùng xác nhận các thay đổi tài chính. Giải thích vì sao khoản định kỳ tạo nháp thay vì tự ghi sổ, tránh nhầm dự kiến với thực tế.')
for i,(a,b) in enumerate([('Ghi nhận','Tạo ví → thêm thu/chi/chuyển tiền → tìm và điều chỉnh'),('Lập ngân sách','Gợi ý → sửa → xem trước → xác nhận → xem lịch sử'),('Mục tiêu','Tạo mục tiêu → dành tiền có sẵn → theo dõi → rút phân bổ'),('Nhìn lại','Chọn tháng → so tháng trước → xem hạn mức → tải PDF')]):
 y=2.03+i*1.05;box(.55,y,2.5,.78,LAV);text(.77,y+.18,2.08,.45,a,18,PURPLE,True);text(3.3,y+.12,9.2,.66,b,19)
start('KIẾN TRÚC','React → NestJS → PostgreSQL.', 'Dùng TypeScript cho frontend và backend để thống nhất kiểu dữ liệu. NestJS là ứng dụng một khối gồm Identity, Ledger, Budgeting, Planning, Reporting, Demo và Infrastructure. Demo tách khỏi Identity để tránh vòng phụ thuộc. Báo cáo đọc cùng snapshot RepeatableRead và truyền transaction client xuyên các provider. Prisma dùng bộ máy JavaScript với PostgreSQL. Spec Kit chỉ phục vụ quá trình phát triển, không chạy trong sản phẩm.')
for i,(a,b,c) in enumerate([('01 · WEB','React 19 / Vite\nMotion / Recharts',LAV),('02 · API','NestJS 11\nModules / snapshot',LIME),('03 · DATABASE','PostgreSQL 17\nPrisma / BIGINT',LAV)]):
 x=.55+i*4.15;box(x,2.18,3.88,2.15,c);text(x+.25,2.43,3.36,.6,a,21,PURPLE,True);text(x+.25,3.17,3.3,.9,b,18)
text(.7,4.83,11.9,1.2,'Cookie HttpOnly cùng origin · API tiền dạng chuỗi · Migration SQL có khóa và checksum · Docker/Caddy chuẩn bị cho HTTPS',21)
start('DỮ LIỆU','13 model, một nguyên tắc: giữ được dấu vết.', 'Nêu các nhóm dữ liệu, không đọc mọi cột. Sổ giao dịch là nguồn tính số dư; budget plan giữ revision; recurring draft unique theo quy tắc và tháng; goal contribution là phân bổ tiền đang có. Migration 07/11 đã thêm sáu bảng; lần làm lại 12/11 không đổi schema hoặc migration, giữ dữ liệu cũ. Xem ERD đầy đủ trong tài liệu.')
cards([('Nền & sổ','User, Session\nWallet, Category\nTransaction\n\nSố dư suy ra từ sổ.'),('Kế hoạch','BudgetPlan, BudgetItem\nRecurringRule, RecurringDraft\nSavingsGoal, GoalContribution\n\nDự kiến tách khỏi thực tế.'),('An toàn thao tác','PasswordReset\nIdempotencyRecord\n\nToken lưu hash. Key gửi lại cùng nội dung trả kết quả cũ.')])
start('THUẬT TOÁN','Chia ngân sách đúng đến từng đồng.', 'Ví dụ thu 15 triệu, tiết kiệm dự kiến 3 triệu, chi bắt buộc 6 triệu, còn 6 triệu linh hoạt. Trọng số 3:2:1 nhận 3, 2 và 1 triệu. Khi có dư do chia nguyên, thuật toán largest remainder phân từng đồng cho phần dư lớn nhất, thứ tự danh mục xử lý trường hợp bằng nhau. Thiếu tiền thì từ chối trước khi lưu.')
box(.55,2,12.2,1.05,INK);text(.88,2.22,11.5,.62,'15 triệu − 3 triệu tiết kiệm − 6 triệu bắt buộc = 6 triệu linh hoạt',24,'FFFFFF',True)
for i,(a,b) in enumerate([('Ưu tiên 3','3.000.000 ₫'),('Ưu tiên 2','2.000.000 ₫'),('Ưu tiên 1','1.000.000 ₫')]):
 x=.55+i*4.15;box(x,3.4,3.88,1.6,LAV);text(x+.25,3.58,3.3,.45,a,18,PURPLE);text(x+.25,4.18,3.3,.6,b,25,INK,True)
text(.7,5.48,11.9,1,'BigInt + chia phần dư lớn nhất. Tổng hạn mức + tiết kiệm dự kiến luôn khớp thu nhập ở chế độ AUTO.',21)
start('NGÂN SÁCH','Có căn cứ khi lập, có lịch sử khi điều chỉnh.', 'Gợi ý dùng ba tháng đã kết thúc, cả tháng không phát sinh vẫn tính bằng không. Mức tiết kiệm gợi ý 20% có thể sửa. Nhấn mạnh đây là quy tắc gợi ý, không phải AI. Có thể dùng revision cũ làm draft, cảnh báo danh mục lưu trữ rồi preview và xác nhận revision mới. Mọi phiên bản giữ hạn mức riêng và đối chiếu sổ thực tế hiện tại, không phải ảnh chụp số chi trong quá khứ.')
text(.6,2.08,4.05,3.9,'Gợi ý từ 3 tháng trước\n\nSửa theo hoàn cảnh\n\nPreview trước khi áp dụng\n\nDùng revision làm draft',21)
picture('docs/images/budget.png',4.95,1.85,7.8,4.95)
start('THÓI QUEN','Định kỳ và mục tiêu không làm sai tài sản.', 'Khoản định kỳ tạo bản nháp theo ngày đến hạn, xử lý tháng ngắn bằng ngày cuối tháng. Xác nhận đồng thời vẫn chỉ ghi một transaction. Mục tiêu dành riêng tiền trong ví và có thể rút phần đã dành; không cộng thành thu nhập hoặc giảm tổng tài sản. Nếu chi tiêu sau đó khiến ví thiếu phần dành riêng thì giao diện cảnh báo. Sửa/archived/restore mục tiêu giữ lịch sử; archived chỉ rút. Thay định kỳ từ tháng sau và sau start cũ: kết thúc rule cũ trước tháng mới rồi tạo mới nguyên tử, nháp cũ giữ số tiền cũ.')
picture('docs/images/planning.png',.55,1.85,8.3,4.97);text(9.15,2.13,3.5,1.5,'Đến hạn → nháp\nXác nhận → ghi sổ',21,PURPLE,True);text(9.15,4.03,3.5,2.3,'Đổi định kỳ từ tương lai.\nLưu trữ mục tiêu vẫn giữ phần tiền đã dành và cho phép rút.',18)
start('DỮ LIỆU & BÁO CÁO','Nhập có kiểm tra, xuất có đối chiếu.', 'CSV giới hạn 50 KB và 200 dòng. Xem lỗi theo dòng, đọc dấu nháy và tiếng Việt đúng, bỏ dòng trùng, xác nhận nguyên tử. Báo cáo so tháng trước bằng số tiền; PDF tiếng Việt có ngân sách và mức chi, loại chuyển ví khỏi thu/chi. File nhập mẫu cần đúng tên ví/danh mục của tài khoản.')
picture('docs/images/import.png',.55,1.85,8.1,4.9);text(8.98,2.11,3.7,1.6,'CSV → preview\nSửa lỗi → xác nhận',21,PURPLE,True);text(8.98,4.05,3.7,2.4,'Tổng hợp theo tháng Việt Nam.\nSo với tháng trước.\nPDF đọc được tiếng Việt.',18)
start('TRẢI NGHIỆM','Trẻ trung, nhưng số liệu luôn rõ ràng.', 'Giao diện Nhịp sống xanh: xanh dương nhạt, trắng ngà, điểm nhấn vàng cát/ngọc bích. Menu trang chào, ba cảnh minh họa chuyển động tự vẽ, cảm hứng tương tác. Chưa có ảnh người thật vì nguồn Pexels bị network policy chặn; bản nháp quyền truy cập chờ áp dụng. Dashboard gợi ý bước tiếp theo từ dữ liệu thật; các trang lazy, hook theo tháng/tài khoản và ErrorBoundary cho phục hồi. Chuyển động dùng Motion, cho phép giảm và tôn trọng hệ điều hành. Bố cục thử từ 320 đến 1440 pixel; menu mobile giữ focus và đóng bằng Escape. Lỗi hover qua lại khi đổi form đã có regression test.')
picture('docs/images/landing.png',.55,1.85,9.2,4.95);picture('docs/images/landing-mobile.png',10.08,1.85,2.6,4.95)
start('BẢO VỆ & VẬN HÀNH','Giữ quyền sở hữu và giữ được dữ liệu.', 'Giải thích ownership phía server cho mọi ID, cookie HttpOnly/Secure production, password scrypt và reset token SHA256 dùng một lần. Key gửi lại ngăn ghi trùng. SQL migration additive có checksum; backup và restore thử DB riêng. Docker non-root và Caddy HTTPS đã chuẩn bị, chưa có tên miền hay SMTP thật theo thông tin người dùng.')
cards([('Tài khoản','Ownership phía server.\nCookie HttpOnly/Secure.\nScrypt, reset 30 phút, dùng một lần và thu hồi phiên.'),('Thao tác ghi','Transaction, khóa đồng thời.\nIdempotency-Key.\nValidation và check SQL.\nLog metadata, không ghi số tiền/token.'),('Khôi phục','Backup custom + SHA256.\nRestore DB rỗng riêng.\nDocker non-root.\nCaddy HTTPS và SMTP chờ dịch vụ thật.')])
start('KIỂM CHỨNG','Bằng chứng chạy được, số liệu có giới hạn.', f'40 kiểm thử API/unit và 21 browser đạt, không skip. Axe không serious/critical ở phạm vi kiểm tra; không phải chứng nhận WCAG. Benchmark 10.000 giao dịch: trung vị cũ {metrics["baseline"]["medianMs"]} ms, mới {median} ms, p95 mới {p95} ms. Bản mới chậm hơn do đọc snapshot tuần tự và thêm kế hoạch; đổi lấy tính nhất quán khi có ghi đồng thời. 20 mẫu, 3 warmup; chưa phải load test/SLA. Production Docker non-root/read-only qua Caddy TLS nội bộ đã smoke. Restore riêng đã có bằng chứng 07/11, schema lần này giữ nguyên.')
for i,(number,label) in enumerate([('40','API / nghiệp vụ'),('21','Browser / UI'),('0','npm advisory')]):
 x=.55+i*4.15;box(x,1.98,3.88,1.6,LAV);text(x+.27,2.12,3.2,.8,number,36,PURPLE,True);text(x+.27,2.96,3.2,.4,label,16)
box(.55,3.9,12.2,2.4,INK);text(.88,4.17,11.5,.7,f'10.000 giao dịch · trung vị {median} ms · p95 {p95} ms',26,LIME,True);text(.88,5.12,11.4,.95,'Một snapshot cho số dư, sổ, ngân sách và kế hoạch.\n20 mẫu cục bộ; chưa phải kiểm thử tải hoặc SLA production.',17,'FFFFFF')
start('QUẢN LÝ DỰ ÁN','Quản lý bằng đầu ra và bằng chứng.', 'Các mốc quá khứ lấy từ Git: MVP 25/10, V2 28–29/10, Spec Kit 04/11, mở rộng 07/11. Ngày 12/11 làm lại UI, lifecycle và modules; lịch UAT cũ 08–10/11 chưa có xác nhận. Đề xuất UAT mới từ 13/11, chưa coi là hoàn tất. RACI theo vai trò, không bịa tên thành viên. Dự toán 495 nghìn đồng là phương án hosting/tên miền và dự phòng, chưa phát sinh chi phí; xem giả định trong hồ sơ.')
for i,(a,b) in enumerate([('25/10','MVP'),('28–29/10','V2 + kiểm thử'),('04/11','Spec Kit'),('07/11','Mở rộng'),('12/11','Làm lại toàn diện')]):
 x=.55+i*2.48;box(x,2.1,2.27,1.6,LAV if i<4 else LIME);text(x+.18,2.31,1.94,.5,a,21,PURPLE,True);text(x+.18,2.99,1.95,.5,b,15)
text(.7,4.18,11.85,2.2,'WBS, Gantt, RACI theo vai trò, risk register và ma trận yêu cầu–kiểm thử.\nDự toán tham khảo: 495.000 VND cho phương án có hosting.\nNgười dùng thực hiện UAT và bổ sung thông tin bìa trước bảo vệ.',21)
start('DEMO & THẢO LUẬN','Một luồng demo, đủ thấy giá trị.', 'Demo trong khoảng hai phút nếu thời gian cho phép: mở tài khoản mẫu, ngân sách và dùng revision làm draft, sửa/archived mục tiêu, thay định kỳ từ tương lai rồi xác nhận nháp cũ, lọc/preview CSV và tải PDF. Nêu rõ email thật và website public chờ dịch vụ. Kết thúc bằng câu hỏi về mô hình dữ liệu, phân bổ chính xác, chống trùng và bảo vệ tài khoản.')
box(.55,2.02,12.2,2.65,INK);text(.9,2.4,11.5,1.9,'Ví & giao dịch → ngân sách → định kỳ & mục tiêu\nCSV preview → so tháng trước → tải PDF',29,'FFFFFF',True)
text(.7,5.02,11.8,.85,'Còn cần dịch vụ/tên miền để bật email thật và website công khai.',21,PURPLE)
text(.7,6.05,11.8,.65,'github.com/tunato2807-del/qlduanphammen',19,MUTED)
prs.save(OUT/'Finora-Thuyet-trinh.pptx');pdf.save()
OUT.joinpath('Ghi-chu-thuyet-trinh.md').write_text('# Ghi chú thuyết trình Finora\n\nCập nhật 13/11/2026 · 15 slide, khoảng 12–15 phút. Họ tên/lớp/GVHD cần bổ sung theo thông tin thật.\n\n'+'\n\n'.join(f'## {i+1}. {title}\n\n{note}' for i,(title,note) in enumerate(notes))+'\n',encoding='utf8')
print(f'Built {index} editable slides, PDF and speaker notes.')
