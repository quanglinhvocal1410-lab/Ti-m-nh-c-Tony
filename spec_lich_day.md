# 📅 ĐẶC TẢ MODULE "LỊCH DẠY" — TÍCH HỢP GOOGLE CALENDAR

> **Trạng thái:** BẢN NHÁP — chờ xác nhận trước khi code
> **Ngày lập:** 05/10/2026
> **Thay thế cho:** 7 script Apps Script đang chạy trên sheet `XẾP LỊCH` (Tạo lịch học viên, Kiểm tra xung đột, Lịch học thử, Lịch trống, Lịch tuần này, Lịch tuần sau, Lịch GV khác)
> **Cách đọc:** Mục 9 là danh sách **câu hỏi cần bạn chốt**. Các mục còn lại là đề xuất mặc định của tôi — chỗ nào không đồng ý thì ghi chú lại.

---

## 1. MỤC TIÊU

| # | Yêu cầu | Cách đáp ứng |
|---|---|---|
| 1 | Xem và theo dõi tốt trên **điện thoại và tablet** | Điện thoại: xem **từng ngày** (vuốt qua lại). Tablet/PC: **lưới cả tuần** như sheet hiện tại, cố định cột giờ và hàng thứ |
| 2 | Cột giờ có **nút thêm khung giờ** | Nút `＋ Khung giờ` ở cuối cột giờ, tự sắp xếp theo giờ bắt đầu |
| 3 | **Copy/paste nhiều ô cùng lúc** để điền lịch trống | Chọn vùng (kéo chuột, Shift+click, hoặc chế độ chọn nhiều trên điện thoại) → Copy / Dán / Điền nhanh "Linh trống". **Dán thẳng từ Google Sheets** cũng được |
| 4 | **Ghép 2 học viên** vào 1 buổi | Ô lịch nhận nhiều học viên, hiển thị `Sunny + Bí Ngô` (giống hiện tại) |
| 5 | Sau khi dán, **khung giờ xung đột tự hiện bị chặn** | Hệ thống tự tính lại và tô đỏ các ô chồng giờ, không cho điền vào |
| 6 | Mở rộng **nhiều cơ sở**, 1 GV phụ trách nhiều HV | Thêm bảng Cơ sở và Phòng. Xung đột tính theo **phòng + giáo viên + học viên** |
| 7 | Ai nhìn vào cũng hiểu, **kể cả học viên** | Màu theo giáo viên, chú thích cố định, có chế độ "Lịch của tôi" |
| 8 | **Học viên đăng nhập chỉ thấy lịch của mình** | Máy chủ lọc dữ liệu theo tài khoản, học viên không bao giờ nhận dữ liệu của người khác (xem Mục 6) |
| 9 | Đồng bộ **Google Calendar** | 1 nút "Đồng bộ tuần", không tạo trùng khi bấm lại, tự sửa/xoá event khi lịch thay đổi |
| 10 | **Mã QR có chỗ tải ảnh lên** | Cho phép tải ảnh QR lên (theo giáo viên hoặc theo cơ sở) thay vì dùng link VietQR cố định trong code (Mục 8) |

---

## 2. PHÂN TÍCH HIỆN TRẠNG (SHEET + 7 SCRIPT)

### 2.1 Cấu trúc sheet `XẾP LỊCH`
- **Cột A** = Địa điểm (Dưới sảnh / Trên phòng). **Cột B** = Khung giờ (`18h-19h30`). **C→I** = Thứ 2 → Chủ nhật.
- **Giá trị trong ô:**
  - `Tên HV` hoặc `HV1 + HV2` → buổi học (ghép lớp)
  - `Linh trống`, `Quân trống` → **lịch rảnh** của giáo viên (không phải buổi học)
  - Ô đỏ → bị chặn vì chồng giờ với một buổi học khác trong cùng ngày
- **Bảng J:N** = danh sách HV, số buổi còn lại, ngày bắt đầu, tối đa, **GV dạy** (cột N). App hiện tại **đã có sẵn** những dữ liệu này trong bảng `HocVien`, nên sẽ dùng lại, không nhập lại.
- Các khung giờ **chồng lên nhau** (18h-19h, 18h-19h30, 18h30-20h…). Đây là chủ đích: mỗi hàng là một **lựa chọn** khung giờ, và khi một hàng được xếp thì các hàng chồng giờ bị chặn.

### 2.2 Chuyển 7 script thành tính năng của app

| Script cũ | Tính năng mới |
|---|---|
| Kiểm tra xung đột lịch (`onEdit`) | Tính xung đột ngay khi sửa hoặc dán, tô đỏ ô bị chặn, chặn lưu nếu trùng |
| Tạo lịch học viên (`timLich`) | Chế độ xem **"Lịch của học viên X"** + trang riêng của HV khi đăng nhập |
| Tạo lịch học thử | Nút **"Xuất lịch học thử"**: gộp các khung rảnh, tạo đoạn văn bản có nút Copy |
| Tạo lịch trống | Nút **"Xuất lịch trống"** theo GV, kèm địa điểm, có nút Copy |
| Lịch tuần này / tuần sau (Linh) | **"Đồng bộ Google Calendar"**: chọn tuần + chọn giáo viên |
| Lịch tuần sau GV khác | Gộp chung vào tính năng trên. Email GV lấy từ bảng `Users`, không lưu trong UserProperties nữa |

### 2.3 Lỗi trong script cũ sẽ được sửa
1. **Bấm 2 lần thì lịch trên Calendar bị nhân đôi.** Script cũ không kiểm tra event đã tạo. Bản mới gắn mã buổi học vào event để cập nhật thay vì tạo mới.
2. **Tìm tên theo chuỗi con** (`indexOf`): tìm "An" sẽ khớp cả "Lan", và "Linh" khớp cả "Linh trống". Bản mới lưu **mã học viên**, không so khớp tên.
3. **Đọc giờ sai** trong `parseTime`: chỉ đúng với phút `30`, còn `18h15` sẽ bị hiểu thành 18.15 giờ. Bản mới lưu theo **phút** (ví dụ 1095 = 18h15).
4. **Xung đột chỉ xét theo ngày.** Lịch của Linh và Quân chặn lẫn nhau dù khác phòng, và không mở rộng được khi có nhiều cơ sở.
5. Email `quanglinhvocal1410@gmail.com` bị **viết cứng** trong code.
6. Vùng dữ liệu cứng (`A2:I21`, `J4:J100`): thêm khung giờ mới thì script không nhận ra.

---

## 3. MÔ HÌNH DỮ LIỆU (thêm vào `SCHEMA` trong Code.txt)

### 3.1 `CoSo` — Cơ sở
| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | `CS-001` | |
| `tenCoSo` | String | "Cơ sở 1 – Q.3" |
| `diaChi` | String | |
| `active` | Bool | |

### 3.2 `Phong` — Phòng / Địa điểm trong cơ sở
| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | `PH-001` | |
| `coSoId` | FK | |
| `tenPhong` | String | "Dưới sảnh", "Trên phòng" |
| `sucChua` | Number | Số HV tối đa một buổi (mặc định 2, dùng cho ghép lớp) |

### 3.3 `KhungGio` — Các hàng giờ trong lưới (chính là cột A+B hiện tại)
| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | `KG-001` | |
| `coSoId`, `phongId` | FK | |
| `batDau`, `ketThuc` | Number (phút) | 1080 = 18h00, 1170 = 19h30 |
| `nhan` | String | Hiển thị: "18h-19h30" (tự sinh) |
| `thuTu` | Number | Sắp xếp |
| `active` | Bool | Ẩn thay vì xoá để giữ lịch sử |

### 3.4 `LichXep` — Mỗi ô có nội dung là 1 dòng
| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | `LX-000001` | |
| `tuan` | Date (Thứ 2) | `2026-10-05`. Mỗi tuần có lịch riêng (xem câu hỏi Q1) |
| `thu` | 1..7 | 1 = Thứ 2 … 7 = CN |
| `khungGioId` | FK | Lấy phòng, cơ sở, giờ từ khung giờ |
| `loai` | Enum | `hoc` (buổi học) · `trong` (GV rảnh) · `thu` (học thử) · `khoa` (admin khoá thủ công, ví dụ phòng bận) |
| `giaoVienId` | FK Users | Bắt buộc với `hoc`, `trong`, `thu` |
| `hocVienIds` | JSON Array | `["HV-000012","HV-000015"]`, tối đa = `sucChua` |
| `ghiChu` | String | |
| `calendarEventId` | String | Mã event Google để đồng bộ |
| `createdBy`, `updatedAt` | | Lưu vết ai sửa |

### 3.5 Bổ sung bảng có sẵn
- `Users`: thêm `coSoIds` (GV dạy ở cơ sở nào), `mauLich` (màu riêng của GV trên lưới), `qrImage` (Mục 8). Thêm role **`hv`** hoặc dùng `username/password` đã có trong `HocVien` (câu hỏi Q4).
- `HocVien`: đã có `giaoVien`. Đổi sang lưu `giaoVienId` (vẫn giữ cột tên để tương thích), thêm `coSoId`.

> **Lưu ý về Sheets làm database:** bảng `LichXep` tăng khoảng 100–200 dòng mỗi tuần, khoảng 10.000 dòng mỗi năm, Sheets vẫn chịu được. Mỗi lần chỉ đọc theo `tuan` và có cache, nên vẫn nhanh.

---

## 4. LUẬT XUNG ĐỘT (thay cho `onEdit`)

Hai mục A và B (cùng `tuan`, cùng `thu`, **giờ chồng nhau**: `A.batDau < B.ketThuc && A.ketThuc > B.batDau`) **xung đột** khi có **ít nhất một** điều kiện sau:

| Điều kiện | Ý nghĩa |
|---|---|
| Cùng **phòng** và cả hai là `hoc`/`thu`/`khoa` | Phòng đã có người dùng |
| Cùng **giáo viên** và cả hai là `hoc`/`thu` | GV không thể dạy 2 nơi cùng lúc, kể cả khác cơ sở |
| Có **học viên chung** | HV không thể học 2 buổi cùng lúc |

- Ô `trong` (lịch rảnh) **không chặn** ô khác, giống luật "bỏ qua chữ trống" hiện tại.
- Khi xếp một buổi `hoc` vào khung của GV X, ô `X trống` ở khung đó **tự đổi thành buổi học**.
- **Ô bị chặn** được tô đỏ, có tooltip: *"Chặn bởi: Phượng + Lam (19h30-21h, Trên phòng)"*.
- **Kiểm tra 2 lớp:** trình duyệt kiểm tra trước để hiện màu ngay. **Máy chủ kiểm tra lại khi lưu** và từ chối nếu xung đột (dùng `LockService` để 2 người cùng dán vào một ô không ghi đè nhau).
- **Dán hàng loạt:** ô hợp lệ được lưu, ô xung đột bị bỏ qua và báo lại danh sách: *"Đã dán 12/14 ô. 2 ô bị chặn: T3 19h-20h, T5 20h-21h"*.

---

## 5. GIAO DIỆN

### 5.1 Tab mới `#view-schedule` "Lịch dạy" trên thanh điều hướng

**Thanh công cụ (chung cho mọi màn hình):**
```
[◀ Tuần trước] 05/10 – 11/10/2026 [Tuần sau ▶] [Hôm nay]
[Cơ sở ▾] [Phòng ▾] [Xem theo: Phòng | Giáo viên | Học viên ▾]
[⋯ Thêm: Sao chép tuần trước · Xuất lịch trống · Xuất lịch học thử · Đồng bộ Calendar]
```

### 5.2 Tablet / PC (≥ 768px): lưới tuần
```
┌──────────┬──────────┬────────┬────────┬────────┬─────┬─────────┬─────────┐
│ Địa điểm │ Giờ      │ Thứ 2  │ Thứ 3  │ Thứ 4  │ ... │ Thứ 7   │ CN      │  ← hàng cố định
├──────────┼──────────┼────────┼────────┼────────┼─────┼─────────┼─────────┤
│ Trên ph. │ 18h-19h  │ Tuyển  │        │▓▓▓▓▓▓▓▓│     │ Quân tr.│ Quân tr.│
│ Trên ph. │ 18h-19h30│▓▓▓▓▓▓▓▓│        │Sunny+BN│     │ Quân tr.│ Quân tr.│
│ ...      │          │        │        │        │     │         │         │
├──────────┴──────────┤        │        │        │     │         │         │
│  ＋ Khung giờ        │  ← nút thêm giờ (chỉ Admin)
└─────────────────────┘
 ▓ = bị chặn (đỏ)   ■ vàng = Quân rảnh   ■ xanh = Linh rảnh   □ trắng = còn trống
```
- Cột Địa điểm và Giờ **cố định khi cuộn ngang**, hàng Thứ **cố định khi cuộn dọc**.
- Màu chú thích lấy theo `Users.mauLich`, giữ đúng màu bạn đang dùng (vàng = Quân, xanh nhạt = Linh, đỏ = chặn).
- Ô buổi học hiển thị tên HV. Viền trái tô màu GV để biết ai dạy.
- Chạm vào ô để mở **bảng nhỏ**: chọn loại (Học / Rảnh / Học thử / Khoá), GV, tối đa 2 HV (ô tìm kiếm có gợi ý, chỉ hiện HV còn buổi), ghi chú.

### 5.3 Điện thoại (< 768px): xem theo ngày
```
┌─────────────────────────────┐
│ T2  T3  T4  T5  T6 [T7] CN  │  ← thanh chọn ngày, vuốt trái/phải để đổi
├─────────────────────────────┤
│ Trên phòng                  │
│ 18h-19h      Quân trống  🟨 │
│ 18h-19h30    Quân trống  🟨 │
│ 19h-20h      Thịnh       👤 │
│ 20h-21h      Thông       👤 │
│ 19h30-21h    ⛔ Bị chặn      │
│ Dưới sảnh                   │
│ 14h30-16h    (trống)    ＋  │
└─────────────────────────────┘
```
- Mỗi ô là một dòng to, dễ chạm (cao ≥ 44px).
- Có công tắc **"Ẩn ô bị chặn"** để danh sách gọn hơn.

### 5.4 Copy / Paste nhiều ô
| Thao tác | PC / Tablet có bàn phím | Điện thoại / Tablet cảm ứng |
|---|---|---|
| Chọn vùng | Kéo chuột, Shift+click, Ctrl+click | Nhấn giữ 1 ô để vào **chế độ chọn**, sau đó chạm thêm ô |
| Copy | `Ctrl+C` (copy dạng bảng, dán sang Google Sheets/Excel được) | Nút **Copy** trên thanh thao tác |
| Dán | `Ctrl+V`, nhận cả dữ liệu copy **từ Google Sheets** | Nút **Dán** |
| Điền nhanh | Thanh thao tác: **"Điền: Linh trống / Quân trống / …"** | Như bên trái |
| Xoá | `Delete` | Nút **Xoá** |
| Hoàn tác | `Ctrl+Z` (lần thao tác gần nhất) | Nút **Hoàn tác** trên thông báo |

- Khi dán chữ, hệ thống tự nhận dạng: `X trống` thì là lịch rảnh của GV X. `A + B` thì là ghép HV A và B (khớp **chính xác** tên HV, không phân biệt hoa thường). Tên không tìm thấy sẽ được **gạch chân đỏ để chọn lại**, không tự lưu sai.
- **Sao chép tuần trước:** copy toàn bộ lịch tuần trước sang tuần đang xem. Có thể chọn chỉ copy lịch rảnh, chỉ copy buổi học, hoặc cả hai.

### 5.5 Nút "＋ Khung giờ"
- Hộp thoại gồm Phòng, Giờ bắt đầu, Giờ kết thúc (chọn theo bước 15 phút). Xem trước nhãn `18h-19h30`.
- Không cho tạo khung trùng hoàn toàn với khung đã có cùng phòng. Kết thúc phải sau bắt đầu.
- Chỉ **Admin** được thêm, sửa, ẩn khung giờ.

---

## 6. PHÂN QUYỀN — AI THẤY GÌ

| Vai trò | Thấy | Sửa |
|---|---|---|
| **Admin** | Toàn bộ, mọi cơ sở | Toàn bộ: khung giờ, phòng, cơ sở, mọi ô |
| **Giáo viên** | Lưới của các cơ sở mình dạy. Thấy đầy đủ ô của **mình** (tên HV). Ô của GV khác chỉ hiện **"Đã có lịch"** (màu xám, không có tên HV) để biết là bận | Lịch rảnh của mình. Buổi học của HV mình phụ trách *(xem Q5)* |
| **Học viên** | **Chỉ các buổi học của mình**: ngày, giờ, phòng, cơ sở, GV. Hiển thị dạng danh sách "Buổi sắp tới" và lịch tuần. **Không** thấy lưới chung, tổng số HV hay lịch GV khác | Không sửa gì *(tuỳ chọn sau: gửi yêu cầu đổi lịch)* |

### ⚠️ Điều kiện bắt buộc: đăng nhập thật
Hiện tại app **chưa có đăng nhập thật**. `switchCurrentUser()` trong `JavaScript.html` chỉ đổi người dùng ở trình duyệt, còn hàm `hasPerm()` cũng kiểm tra ở trình duyệt. Như vậy bất kỳ ai mở link đều có thể gọi `getStudents()` và lấy toàn bộ dữ liệu.

Để học viên **thật sự** chỉ thấy lịch của mình, cần làm **Giai đoạn 0** trước:
1. Thêm hàm `login(username, password)` trên máy chủ. Hàm này trả về **token** và lưu `token → {userId, role, hocVienId}` trong `CacheService` (6 giờ, có gia hạn).
2. **Mọi API** nhận token làm tham số đầu tiên. Máy chủ xác định quyền từ token, **không tin** dữ liệu vai trò do trình duyệt gửi lên.
3. `getSchedule(token, tuan)` lọc dữ liệu **ngay trên máy chủ** theo vai trò. HV chỉ nhận đúng các dòng `LichXep` có mã của mình trong `hocVienIds`.
4. Mật khẩu lưu dạng băm (SHA-256 + salt bằng `Utilities.computeDigest`) thay vì để chữ thường như hiện nay.
5. Bỏ ô chọn `#curUserSelect` và thay bằng màn hình đăng nhập.

> Giai đoạn 0 ảnh hưởng tới **toàn bộ app**, không chỉ module lịch, vì các API cũ (`getStudents`, học phí…) cũng cần kiểm tra token. Tôi đề xuất làm luôn, vì nếu không thì yêu cầu "học viên chỉ thấy lịch của mình" chỉ đúng trên giao diện, không đúng về bảo mật.

---

## 7. TÍCH HỢP GOOGLE CALENDAR

### 7.1 Đề xuất cách làm
- **Một lịch chung của trung tâm** tên "Tony Music – Lịch dạy", do tài khoản chạy Apps Script sở hữu. Mỗi buổi `hoc`/`thu` là **một event**:
  - Tiêu đề: `[Linh] Sunny + Bí Ngô` · Địa điểm: `Trên phòng – Cơ sở 1` · Mô tả: số buổi còn lại của từng HV
  - **Khách mời:** email GV dạy (lấy từ `Users.email`) và email HV nếu bật (Q6). GV và HV sẽ thấy event trên Calendar của mình, có thông báo nhắc.
  - Lưu mã event vào `LichXep.calendarEventId`, đồng thời gắn `event.setTag('lxId', id)` để đối chiếu.
- **Nút "Đồng bộ Calendar"**: chọn tuần (này/sau/tuỳ chọn) và các GV, rồi xem trước *"Tạo 8 · Cập nhật 2 · Xoá 1"*, sau đó xác nhận.
  - Ô mới → tạo event. Ô đã đổi giờ/HV → **cập nhật** event cũ. Ô đã xoá → **xoá** event.
  - Bấm lại nhiều lần **không tạo trùng**.
- **Tuỳ chọn tự động:** trigger mỗi Chủ nhật 20h tự đồng bộ tuần sau (bật/tắt trong Cấu hình).

### 7.2 Vì sao không ghi thẳng vào lịch cá nhân của từng GV như script cũ?
Script "tuần này/tuần sau" cũ ghi trực tiếp vào lịch của Linh. Cách này cần mỗi GV cấp quyền sửa lịch cá nhân cho tài khoản script, và dễ lỗi phân quyền khi thêm GV. Dùng **lịch chung + mời làm khách** thì GV mới chỉ cần có email. Nếu bạn vẫn muốn ghi thẳng vào lịch cá nhân thì vẫn hỗ trợ được, nhưng chỉ cho GV đã chia sẻ quyền (Q7).

### 7.3 Quyền Apps Script cần thêm
`https://www.googleapis.com/auth/calendar` (CalendarApp). Lần chạy đầu sẽ hiện màn hình cấp quyền.

---

## 8. MÃ QR — TẢI ẢNH LÊN

Hiện tại link VietQR bị viết cứng trong `getTuitionSettlementData()` (VIB-140396, NGUYEN QUANG LINH).

Đề xuất trong **Cấu hình**, mỗi GV hoặc cơ sở có một mục "Mã QR thanh toán" với 2 lựa chọn:
1. **Tải ảnh QR lên** (chụp hoặc chọn ảnh từ điện thoại). Ảnh lưu vào thư mục Drive của trung tâm, link lưu vào `Users.qrImage`.
2. **Tự sinh VietQR**: nhập ngân hàng, số tài khoản, tên. Hệ thống tự điền số tiền và nội dung chuyển khoản như hiện nay.

Màn hình học phí ưu tiên ảnh đã tải lên. Nếu chưa có ảnh thì tự sinh VietQR.

---

## 9. ❓ CÂU HỎI CẦN BẠN CHỐT

| # | Câu hỏi | Đề xuất của tôi |
|---|---|---|
| **Q1** | Lịch **mỗi tuần riêng** hay **một lịch mẫu lặp lại**, chỉ chỉnh khi có thay đổi? | **Mỗi tuần riêng + nút "Sao chép tuần trước"**. Giống cách bạn đang làm (sheet có tiêu đề "Từ 05/10 – 12/10"), và vẫn giữ được lịch sử |
| **Q2** | Xung đột tính theo **phòng**, **GV**, **HV** (cả 3)? Hay vẫn như cũ: mọi buổi trong cùng ngày đều chặn nhau? | **Cả 3 điều kiện** (Mục 4). Cần thiết khi có nhiều phòng/cơ sở |
| **Q3** | Ghép lớp tối đa **2 HV** hay cho phép nhiều hơn (lớp nhóm)? | Theo `Phong.sucChua`, mặc định 2 |
| **Q4** | HV đăng nhập bằng `username/password` **trong bảng HocVien** (đã có cột) hay tạo tài khoản trong `Users` với role `hv`? | Dùng **cột có sẵn trong HocVien**, không trùng dữ liệu |
| **Q5** | GV được **tự xếp buổi học** cho HV của mình, hay chỉ điền lịch rảnh, còn Admin xếp? | GV tự xếp cho HV của mình, Admin xếp được tất cả |
| **Q6** | Khi ghép lớp, HV có thấy **tên bạn học chung** không? Có mời HV vào event Calendar không? | Có thấy tên bạn ghép. Mời HV vào Calendar: **tắt mặc định**, bật riêng từng HV có email |
| **Q7** | Calendar: **lịch chung + mời khách** hay **ghi thẳng vào lịch cá nhân** của GV? | Lịch chung + mời khách |
| **Q8** | Làm **Giai đoạn 0 (đăng nhập thật + token)** cho toàn app trước? | **Có**. Thiếu bước này thì không bảo đảm được việc HV chỉ thấy lịch của mình |
| **Q9** | Khi điểm danh, có **tự trừ buổi** dựa trên lịch đã xếp không (ví dụ cuối buổi hiện nút "Điểm danh nhanh")? | Có, nhưng để ở giai đoạn 3 |
| **Q10** | Có cần **nhập dữ liệu từ sheet `XẾP LỊCH` hiện tại** vào app một lần không? | Có, làm công cụ "Nhập từ Google Sheets" (dán vùng B2:I21) |

---

## 10. LỘ TRÌNH TRIỂN KHAI

| Giai đoạn | Nội dung | File chính |
|---|---|---|
| **0. Đăng nhập** | `login()`, token, kiểm tra quyền trên mọi API, băm mật khẩu, màn hình đăng nhập | `Code.txt`, `index.txt`, `JavaScript.html`, `build_preview.js` |
| **1. Lưới lịch (lõi)** | Schema `CoSo/Phong/KhungGio/LichXep`. API `getSchedule`, `saveScheduleCells` (hàng loạt), `saveTimeSlot`. Lưới tuần cho tablet, xem theo ngày cho điện thoại. Luật xung đột 2 lớp. Thêm khung giờ | như trên + `Stylesheet.html` |
| **2. Copy/Paste & Tiện ích** | Chọn vùng, copy/dán (tương thích Sheets), điền nhanh, hoàn tác, sao chép tuần trước, xuất lịch trống, xuất lịch học thử, nhập từ sheet cũ | `JavaScript.html` |
| **3. Calendar + phân quyền xem** | Đồng bộ không trùng, xem trước, trigger tự động. Màn hình HV "Lịch của tôi". GV chỉ thấy "Đã có lịch" ở ô của GV khác | `Code.txt`, `JavaScript.html` |
| **4. QR + mở rộng** | Tải ảnh QR. Quản lý cơ sở/phòng trong Cấu hình. Điểm danh từ lịch | |

Mỗi giai đoạn đều: cập nhật mock trong `build_preview.js` để thử offline trên `preview.html`, chạy lại `node build_preview.js` và `node build_helper.js`, và cập nhật `spec.md` (Mục 2–5) theo quy tắc của dự án.

### API mới (dự kiến)
| Hàm | Mô tả |
|---|---|
| `login(username, password)` / `logout(token)` | Đăng nhập, trả token và vai trò |
| `getScheduleMeta(token)` | Cơ sở, phòng, khung giờ, GV (lọc theo quyền) |
| `getSchedule(token, tuan, coSoId)` | Các ô của tuần, đã lọc theo vai trò |
| `saveScheduleCells(token, tuan, cells[])` | Lưu hàng loạt (dán/điền), trả `{saved[], rejected[{cell, reason}]}` |
| `deleteScheduleCells(token, ids[])` | Xoá hàng loạt |
| `copyWeek(token, fromTuan, toTuan, mode)` | Sao chép tuần |
| `saveTimeSlot(token, slot)` / `hideTimeSlot(token, id)` | Quản lý khung giờ |
| `previewCalendarSync(token, tuan, gvIds)` / `runCalendarSync(...)` | Đồng bộ Google Calendar |
| `exportFreeSlots(token, tuan)` / `exportTrialSlots(token, tuan)` | Văn bản lịch trống / học thử |
| `getMySchedule(token, from, to)` | Dành cho HV: chỉ các buổi của chính mình |
| `uploadQrImage(token, ownerId, base64)` | Tải ảnh QR lên Drive |

---

*Sau khi bạn trả lời Mục 9 (hoặc ghi "đồng ý đề xuất"), tôi bắt đầu từ Giai đoạn 0 → 1 và gửi `preview.html` để bạn thử trên điện thoại.*
