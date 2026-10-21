# 📑 SPECIFICATION & TECHNICAL MAP — TONY MUSIC ACADEMY WEBAPP

> **Tài liệu Tham chiếu & Chỉ mục Tự động cho Toàn bộ Dự án**  
> *Mục đích*: Khi bạn muốn thay đổi bất kỳ tính năng, trường dữ liệu hay giao diện nào, chỉ cần tra cứu bảng **Master Index** trong file này để biết chính xác **File**, **Hàm**, **ID HTML** và **Line Range** cần chỉnh sửa.

---

## 🛠 1. QUY TRÌNH PHÁT TRIỂN & BUILD PIPELINE

Dự án phát triển theo mô hình **Google Apps Script Web App** kết hợp với **Local Offline Preview**.

```
                         ┌────────────────────────┐
                         │   CÁC FILE NGUỒN CORE  │
                         └───────────┬────────────┘
                                     │
       ┌─────────────────────────────┼─────────────────────────────┐
       ▼                             ▼                             ▼
┌──────────────┐              ┌──────────────┐              ┌──────────────┐
│  index.txt   │              │Stylesheet.html│              │JavaScript.html│
│ (HTML Structure)            │ (CSS System) │              │ (Client JS)  │
└──────┬───────┘              └──────┬───────┘              └──────┬───────┘
       │                             │                             │
       ├─────────────────────────────┴─────────────────────────────┤
       │                                                           │
       ▼ (Chạy: node build_preview.js)                             ▼ (Chạy: node build_helper.js)
┌──────────────────────────────┐                            ┌──────────────────────────────┐
│        preview.html          │                            │         helper.html          │
│(Bao gồm Mock Backend         │                            │(Trang Copy-Paste mã nguồn    │
│ LocalStorage + Seed Data)    │                            │ để Deploy lên Apps Script)   │
└──────────────────────────────┘                            └──────────────────────────────┘
                                                                           │
                                                                           ▼
                                                            ┌──────────────────────────────┐
                                                            │     GOOGLE APPS SCRIPT       │
                                                            │   (Mã.gs từ Code.txt + UI)  │
                                                            └──────────────────────────────┘
```

### ⚡ Các Lệnh Build Quan Trọng:
- **Build trang Xem trước Offline**:  
  ```bash
  node build_preview.js
  ```
  *(Sinh ra file `preview.html` chạy trực tiếp trên trình duyệt, lưu dữ liệu vào LocalStorage).*

- **Build trang Hỗ trợ Deploy**:  
  ```bash
  node build_helper.js
  ```
  *(Sinh ra file `helper.html` hỗ trợ Copy 1-Click dán vào Apps Script Editor).*

---

## 📍 2. BẢN ĐỒ BẢNG CHỈ MỤC MASTER (MASTER SPEC INDEX)

Tra cứu nhanh theo tính năng/yêu cầu thay đổi:

| Bạn muốn sửa / thêm gì? | File chính cần sửa | Vị trí / Selector / Hàm | File liên quan cần đồng bộ |
| :--- | :--- | :--- | :--- |
| **Thêm/Sửa trường dữ liệu Học Viên** (vd: Thêm Zalo, Địa chỉ...) | [Code.txt](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/Code.txt) | `SCHEMA.HocVien`, `saveStudent_()` | [build_preview.js](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/build_preview.js) (`SEED_STUDENTS`, `mock_saveStudent`), [JavaScript.html](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/JavaScript.html) (`collectStudentFormData`, `openStudentModal`), [index.txt](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/index.txt) (`#modalStudent`) |
| **Công thức Học phí & Chia Hoa Hồng** (GV Linh 60/70%, GV Quân 150k/buổi) | [Code.txt](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/Code.txt) | `getTuitionSettlementData()` | [build_preview.js](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/build_preview.js) (`mock_getTuitionSettlementData`), [JavaScript.html](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/JavaScript.html) (`renderTuitionTab`), [index.txt](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/index.txt) (`#view-tuition`) |
| **Giao diện Danh sách Học viên** (Card / Grid / Table / Thanh tìm kiếm) | [index.txt](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/index.txt) | `#view-students`, `#studentCardsContainer`, `#studentTableContainer` | [JavaScript.html](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/JavaScript.html) (`renderStudents`, `switchStudentView`), [Stylesheet.html](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/Stylesheet.html) (`.student-card`, `.student-grid-view`) |
| **Điểm danh & Quản lý Buổi học** | [JavaScript.html](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/JavaScript.html) | `openAttendanceModal()`, `saveAttendanceSession()` | [index.txt](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/index.txt) (`#modalAttendance`), [Code.txt](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/Code.txt) (`quickCheckInAttendance`, `saveSession`) |
| **Đánh giá Giọng hát & Phân tích Bài hát (Gemini AI)** | [Code.txt](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/Code.txt) | `aiAnalyzeVoice()`, `aiAnalyzeSong()`, `callGeminiApi_()` | [JavaScript.html](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/JavaScript.html) (`runVoiceAIAnalysis`, `runSongAIAnalysis`), [index.txt](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/index.txt) (`#modalVoice`, `#modalSong`) |
| **Thêm/Sửa Người dùng & Phân quyền (Admin / GV)** | [index.txt](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/index.txt) | `#view-settings`, `#modalUser` | [Code.txt](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/Code.txt) (`saveUser`, `getUsers`), [JavaScript.html](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/JavaScript.html) (`renderUserList`, `switchCurrentUser`), [build_preview.js](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/build_preview.js) (`SEED_USERS`) |
| **Tự động tạo Folder Google Drive cho Học viên** | [Code.txt](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/Code.txt) | `createStudentDriveFolder()` | [JavaScript.html](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/JavaScript.html) (`createDriveFolderForStudent`), [build_preview.js](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/build_preview.js) (`mock_createStudentDriveFolder`) |
| **VietQR Thanh toán Học phí** | [Code.txt](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/Code.txt) | `getTuitionSettlementData()` (`vietQr` config) | [JavaScript.html](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/JavaScript.html) (`renderTuitionTab`), [index.txt](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/index.txt) (`#tuitionQrImg`, `#tuitionBankInfo`) |
| **Gia hạn Khoá học cho Học viên** | [Code.txt](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/Code.txt) | `renewStudentSessions()` | [JavaScript.html](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/JavaScript.html) (`renewStudentCourse`), [index.txt](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/index.txt) (`#modalStudentDetail`) |
| **Màu sắc, Font chữ, Responsive & Theme CSS** | [Stylesheet.html](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/Stylesheet.html) | Root Variables (`:root`), Layout Classes | Tự động áp dụng cho tất cả các Tab |

---

## 🗄 3. SCHEMA DỮ LIỆU BẢNG GOOGLE SHEETS & MOCK LOCALSTORAGE

Chi tiết cấu trúc các bảng dữ liệu trong `SCHEMA` ở [Code.txt](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/Code.txt) và `build_preview.js`:

### 1. Bảng `HocVien`
| Cột | Kiểu | Mô tả |
| :--- | :--- | :--- |
| `id` | String | Mã định dạng `HV-000001` |
| `hoTen` | String | Tên học viên |
| `namSinh` | String | Năm sinh |
| `dienThoai`, `email` | String | Thông tin liên hệ |
| `loaiGiong` | String | Nữ cao / Nữ trung / Nam cao / Nam trung / Nam trầm... |
| `lop` | String | Mã lớp (TN11, TN12, TNN...) |
| `rank` | String | Sếp hạng trình độ (`A`, `B`, `C`, `D`) |
| `tinhTrang` | String | `Đang học`, `Đã hoàn thành`, `Đã học thử`, `Nghỉ học` |
| `giaoVien` | String | Tên GV trực tiếp (`Linh`, `Quân`) |
| `ngayBatDau`, `ngayKhoaMoi` | Date Str | Ngày bắt đầu học / Ngày gia hạn |
| `soBuoiDeal`, `soBuoiKhoa` | Number | Tổng số buổi của khóa học |
| `soBuoiDaHoc` | Number | Số buổi đã tham gia học |
| `soBuoiConLai` | Number | Số buổi còn lại (`soBuoiKhoa - soBuoiDaHoc`) |
| `loaiHocVien` | String | `NEW` (Học viên mới), `STUDIED_2_TERMS` (Học 2 khóa), `STUDIED_MANY` (Học nhiều khóa) |
| `hocPhi` | Number | Mức học phí (Mặc định 2.500.000đ hoặc 1.750.000đ) |
| `daDongHocPhi` | Boolean | `true` (Đã đóng), `false` (Chưa đóng) |
| `tienMatDaThu` | Number | Số tiền mặt GV trực tiếp thu của HV |
| `quangGiong`, `noteThap`, `noteCao` | String | Nốt thấp nhất/cao nhất, khoảng âm域 |
| `chestVoice`, `mixVoice`, `falsetto`, `headVoice`, `whistleVoice` | String | Chi tiết các quãng giọng |
| `linkDrive` | String | Link folder lưu bài thu âm & tài liệu |

### 2. Bảng `BuoiHoc`
| Cột | Kiểu | Mô tả |
| :--- | :--- | :--- |
| `id` | String | Mã định dạng `BH-000001` |
| `hocVienId` | String | Mã học viên liên kết |
| `ngayHoc` | Date Str | Ngày diễn ra buổi học |
| `buoiSo` | Number | Buổi thứ bao nhiêu trong khóa |
| `khoiDong`, `kyThuat` | String | Nội dung khởi động và bài tập kỹ thuật |
| `baiHat`, `linkYoutube` | String | Tên bài hát luyện tập & Link clip demo |
| `noiDung`, `nhanXet` | String | Nội dung chi tiết & Đánh giá của GV |

### 3. Bảng `Users` (Quản trị & Giảng viên)
| Cột | Kiểu | Mô tả |
| :--- | :--- | :--- |
| `id` | String | Mã `USR-000001` |
| `username`, `password` | String | Tên đăng nhập & Mật khẩu |
| `hoTen` | String | Tên hiển thị người dùng |
| `role` | String | `admin` (Quản trị viên), `gv` (Giảng viên) |
| `permissions` | JSON Obj | Phân quyền từng chức năng (`students`, `sessions`, `voice`, `songs`, `settings`) |

---

## 📡 4. DANH SÁCH API BACKEND (`google.script.run` & Proxy Mock)

Tất cả các API dưới đây được khai báo ở [Code.txt](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/Code.txt) và đồng bộ trong `API_MAP` của [build_preview.js](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/build_preview.js):

| Tên Hàm API | Tham số | Mô tả chức năng |
| :--- | :--- | :--- |
| `getDashboard()` | — | Lấy số liệu thống kê tổng quan, phân bố Rank và phân bố Lớp |
| `getStudents()` | — | Lấy toàn bộ danh sách học viên đang hoạt động (`active !== false`) |
| `getStudent(id)` | `id` | Lấy chi tiết 1 học viên kèm danh sách Buổi học, Đánh giá giọng & Bài hát |
| `saveStudent(data)` | `data` (Object) | Tạo mới hoặc cập nhật học viên (Tự động tính `soBuoiConLai`) |
| `deleteStudents(ids)` | `ids` (Array/String) | Xóa học viên và tất cả lịch sử buổi học liên quan |
| `getTuitionSettlementData(m, y)` | `month`, `year` | Tính toán bảng quyết toán học phí, doanh thu trung tâm, hoa hồng Linh/Quân & VietQR |
| `updateTuitionPayment(id, isPaid, cash)` | `hocVienId`, `isPaid`, `cash` | Đánh dấu đóng học phí & số tiền mặt thu |
| `quickCheckInAttendance(id, buoi, date, note)` | `hocVienId`, `buoiSo`... | Điểm danh nhanh 1 buổi học cho học viên |
| `quickRemoveAttendance(id, buoi)` | `hocVienId`, `buoiSo` | Hủy điểm danh buổi học |
| `saveSession(data)` | `data` (Object) | Lưu thông tin chi tiết buổi học (kỹ thuật, bài hát, nhận xét) |
| `deleteSessions(sIds, hvId)` | `sessionIds`, `hocVienId` | Xóa buổi học |
| `saveVoiceAssessment(data)` | `data` (Object) | Lưu phiếu đánh giá giọng hát (Đồng bộ Rank & Quãng giọng vào Học viên) |
| `saveSongAnalysis(data)` | `data` (Object) | Lưu phiếu phân tích bài hát |
| `renewStudentSessions(id, extra, newTotal)`| `hocVienId`... | Gia hạn buổi học mới cho học viên |
| `createStudentDriveFolder(st)` | `student` (Object) | Tự động tạo Folder lưu trữ trên Google Drive |
| `getUsers()`, `saveUser(u)`, `deleteUsers(ids)` | User Object | Quản lý tài khoản giảng viên & phân quyền hệ thống |
| `getConfig()`, `saveConfig(cfg)` | Config Object | Quản lý Gemini API Key, Shared Drive Link |
| `aiAnalyzeVoice(data)`, `aiAnalyzeSong(data)` | Prompt Input | Gọi AI Gemini phân tích giọng hát & bài hát |

---

## 🎨 5. ĐỊA CHỈ COMPONENT GIAO DIỆN & MODALS (UI LAYOUT MAP)

Tra cứu ID HTML trong [index.txt](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/index.txt):

### Các Tab Giao Diện Chính (`<section>`)
- **Sidebar Navigation**: `#mainSidebar`, chọn tài khoản hiện tại qua `#curUserSelect`.
- **Tab 1 - Dashboard**: `#view-dashboard`
  - Khung Card thống kê: `#statCards`
  - Biểu đồ Rank & Lớp: `#rankChart`, `#lopChart`
- **Tab 2 - Danh Sách Học Viên**: `#view-students`
  - Ô tìm kiếm & lọc: `#search`, `#filterRank`
  - Chuyển chế độ xem: `#btnViewCard`, `#btnViewGrid`, `#btnViewTable`
  - Thanh thao tác hàng loạt: `#stBatchBar`, `#stSelectedCountBadge`
  - Container danh sách: `#studentCardsContainer`, `#studentGridContainer`, `#studentTableContainer`
- **Tab 3 - Học Phí & Quyết Toán**: `#view-tuition`
  - Bộ lọc Tháng/Năm: `#tuitionMonthSelect`, `#tuitionYearSelect`
  - Thống kê doanh thu & hoa hồng: `#tuitionSummaryCards`
  - Bảng học phí chi tiết: `#tuitionTableBody`
  - Mã VietQR chuyển khoản: `#tuitionQrImg`, `#tuitionBankInfo`
- **Tab 4 - Cấu Hình & Phân Quyền**: `#view-settings`
  - Cấu hình API Key Gemini & Drive: `#formSettings`
  - Quản lý tài khoản User & Phân quyền: `#userTableBody`

### Các Hộp Thoại (Modals)
- **Modal Thêm/Sửa Học Viên**: `#modalStudent` (Form `#formStudent`)
- **Modal Chi Tiết Học Viên & Điểm Danh**: `#modalStudentDetail` (Tabs chi tiết, Nút gia hạn)
- **Modal Thêm/Sửa Buổi Học**: `#modalAttendance` (Form `#formAttendance`)
- **Modal Phiếu Đánh Giá Giọng Hát**: `#modalVoice` (Tích hợp nút gọi Gemini AI `#btnVoiceAI`)
- **Modal Phân Tích Bài Hát**: `#modalSong` (Tích hợp nút gọi Gemini AI `#btnSongAI`)
- **Modal Thêm/Sửa Người Dùng & Phân Quyền**: `#modalUser` (Form `#formUser`)

---

## 📝 6. QUY TẮC CẬP NHẬT VÀ BẢO TRÌ NGUYÊN TẮC SPEC

Để hệ thống tự động tham chiếu chuẩn xác sau mỗi đợt nâng cấp, hãy tuân thủ **4 Quy tắc vàng**:

1. **Khi Thêm/Sửa 1 Trường Dữ Liệu Mới**:
   - Cập nhật `SCHEMA` trong [Code.txt](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/Code.txt).
   - Cập nhật `SEED_STUDENTS` hoặc DAO Mock trong [build_preview.js](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/build_preview.js).
   - Cập nhật Form/Render trong [JavaScript.html](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/JavaScript.html) và HTML trong [index.txt](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/index.txt).
   - Update thông tin trường đó vào Mục 3 (Schema) của `spec.md`.

2. **Khi Thêm 1 API Backend Mới**:
   - Khai báo hàm trong [Code.txt](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/Code.txt).
   - Khai báo mock function trong `API_MAP` của [build_preview.js](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/build_preview.js).
   - Thêm vào Mục 4 (API) của `spec.md`.

3. **Khi Thay Đổi Giao Diện Hoặc Selector ID/Class**:
   - Cập nhật Selector trong [index.txt](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/index.txt) & [Stylesheet.html](file:///d:/4.%20IDEA/WEBAPP%20D%E1%BA%A0Y%20NH%E1%BA%A0C/Stylesheet.html).
   - Cập nhật Selector tương ứng trong Mục 5 của `spec.md`.

4. **Luôn Chạy Rebuild Sau Khi Sửa Code Source**:
   - Thực thi lệnh `node build_preview.js` và `node build_helper.js` để file `preview.html` và `helper.html` luôn đồng bộ với mã nguồn mới nhất.

---
*Tài liệu được khởi tạo và kiểm duyệt tự động cho hệ thống Tony Music Academy WebApp.*
