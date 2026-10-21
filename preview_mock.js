// ==================== MOCK BACKEND — localStorage ====================
// Thay thế google.script.run để chạy preview.html offline.
// Phần lõi Lịch dạy KHÔNG viết lại ở đây: build_preview.js nhúng nguyên văn đoạn
// [SHARED-SCHEDULE-BEGIN] … [SHARED-SCHEDULE-END] từ Code.txt ngay sau file này,
// nên luật xung đột trong preview giống hệt bản chạy thật.

window.__PREVIEW_MODE = true;
const DB_PREFIX = 'tony_db_';

const T = {
  HocVien: 'HocVien', BuoiHoc: 'BuoiHoc', DanhGiaGiong: 'DanhGiaGiong', PhanTichBai: 'PhanTichBai',
  Users: 'Users', Settings: 'Settings', CoSo: 'CoSo', Phong: 'Phong', KhungGio: 'KhungGio', LichXep: 'LichXep',
  BaiLuyenThanh: 'BaiLuyenThanh'
};

// ---- Seed Data ----
const SEED_STUDENTS = [
  {id:'HV-000001',hoTen:'My',rank:'D',tinhTrang:'Đã hoàn thành',lop:'TNN',giaoVien:'Linh',dienThoai:'0987654321',zalo:'0987654321',facebook:'https://facebook.com',ngayBatDau:'27/11/2025',soBuoiKhoa:12,soBuoiDeal:12,soBuoiDaHoc:12,soBuoiConLai:0,loaiGiong:'Nữ trung',loaiHocVien:'STUDIED_MANY',noteThap:'G3',noteCao:'D6',quangGiong:'G3 - D6',chestVoice:'G3 - C4',mixVoice:'C#4 - F5',falsetto:'F#5 - D6',headVoice:'D5 - A5',whistleVoice:'C6 - D6',hocPhi:3500000,daDongHocPhi:true,tienMatDaThu:0,active:true,linkDrive:'https://drive.google.com/drive/folders/1yc-eR-6QjJmPXMvGn4WSrhDX5gCxVcYH'},
  {id:'HV-000002',hoTen:'An',rank:'C',tinhTrang:'Đã hoàn thành',lop:'TNN',giaoVien:'Linh',dienThoai:'0912345678',zalo:'0912345678',facebook:'',ngayBatDau:'02/12/2025',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:6,soBuoiConLai:0,loaiGiong:'Nữ cao',loaiHocVien:'STUDIED_2_TERMS',noteThap:'A3',noteCao:'C6',quangGiong:'A3 - C6',chestVoice:'A3 - D4',mixVoice:'Eb4 - G5',falsetto:'Ab5 - C6',headVoice:'E5 - B5',whistleVoice:'',hocPhi:1750000,daDongHocPhi:true,tienMatDaThu:0,active:true,linkDrive:'https://drive.google.com/drive/folders/1mx7zB7w8k52Vdyelxy6yG8BzFDpA6Cea'},
  {id:'HV-000003',hoTen:'Chị Yên',rank:'A',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',dienThoai:'0933221100',zalo:'https://zalo.me/0933221100',facebook:'https://facebook.com',ngayBatDau:'26/12/2025',ngayKhoaMoi:'02/09/2026',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:2,soBuoiConLai:4,loaiGiong:'Nữ trung',loaiHocVien:'STUDIED_2_TERMS',noteThap:'F3',noteCao:'E6',quangGiong:'F3 - E6',chestVoice:'F3 - C4',mixVoice:'Db4 - G5',falsetto:'Ab5 - E6',headVoice:'Eb5 - C6',whistleVoice:'C6 - E6',hocPhi:1750000,daDongHocPhi:true,tienMatDaThu:500000,active:true,linkDrive:'https://drive.google.com/drive/folders/1ijFMnhWjomA9Z_DoXbj6YrGqY69ZvuuG'},
  {id:'HV-000004',hoTen:'Kiến Quốc',rank:'C',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',dienThoai:'0908889999',zalo:'0908889999',facebook:'',ngayBatDau:'11/03/2026',ngayKhoaMoi:'02/09/2026',soBuoiKhoa:8,soBuoiDeal:8,soBuoiDaHoc:3,soBuoiConLai:5,loaiGiong:'Nam cao',loaiHocVien:'NEW',noteThap:'G2',noteCao:'B4',quangGiong:'G2 - B4',chestVoice:'G2 - E4',mixVoice:'F4 - A4',falsetto:'A4 - D5',headVoice:'G4 - B4',whistleVoice:'',hocPhi:2500000,daDongHocPhi:true,tienMatDaThu:0,active:true,linkDrive:'https://drive.google.com/drive/folders/1b_AgCcSL9BdBpVgfvt9BouWyvRVEDhs7'},
  {id:'HV-000005',hoTen:'A Minh Anh',rank:'A',tinhTrang:'Đã hoàn thành',lop:'TN11',giaoVien:'Linh',dienThoai:'0911223344',zalo:'0911223344',facebook:'',ngayBatDau:'22/03/2026',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:6,soBuoiConLai:0,loaiGiong:'Nam trung',loaiHocVien:'NEW',noteThap:'E2',noteCao:'G4',quangGiong:'E2 - G4',chestVoice:'E2 - D4',mixVoice:'Eb4 - G4',falsetto:'Ab4 - C5',headVoice:'F4 - A4',whistleVoice:'',hocPhi:1750000,daDongHocPhi:true,tienMatDaThu:0,active:true,linkDrive:'https://drive.google.com/drive/folders/1c5XAm_pRLssPHyUfcOFVZXJObyd9bmtu'},
  {id:'HV-000006',hoTen:'Anh Thuận',rank:'A',tinhTrang:'Đã hoàn thành',lop:'TN11',giaoVien:'Linh',dienThoai:'0944556677',zalo:'0944556677',facebook:'',ngayBatDau:'12/03/2026',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:6,soBuoiConLai:0,loaiGiong:'Nam trầm',loaiHocVien:'NEW',noteThap:'C2',noteCao:'F4',quangGiong:'C2 - F4',chestVoice:'C2 - C4',mixVoice:'Db4 - F4',falsetto:'F#4 - B4',headVoice:'E4 - G4',whistleVoice:'',hocPhi:1750000,daDongHocPhi:true,tienMatDaThu:0,active:true,linkDrive:'https://drive.google.com/drive/folders/1FxQLUvfpd4rxR43zsJCCoOiOkk8puvnZ'},
  {id:'HV-000007',hoTen:'Giang',rank:'C',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',dienThoai:'0966778899',zalo:'0966778899',facebook:'https://facebook.com',ngayBatDau:'06/04/2026',ngayKhoaMoi:'02/09/2026',soBuoiKhoa:12,soBuoiDeal:12,soBuoiDaHoc:5,soBuoiConLai:7,loaiGiong:'Nữ cao',loaiHocVien:'STUDIED_MANY',noteThap:'B3',noteCao:'F6',quangGiong:'B3 - F6',chestVoice:'B3 - E4',mixVoice:'F4 - A5',falsetto:'Bb5 - F6',headVoice:'F5 - C6',whistleVoice:'C6 - F6',hocPhi:3500000,daDongHocPhi:true,tienMatDaThu:1000000,active:true,linkDrive:'https://drive.google.com/drive/folders/1JZ72USn6pOI0IpKnPlG_820_7Az84yMh'},
  {id:'HV-000008',hoTen:'Sơn',rank:'B',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',dienThoai:'0977889900',zalo:'0977889900',facebook:'',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:6,soBuoiConLai:0,loaiGiong:'Nam trung',mucTieuHoc:'G2',loaiHocVien:'NEW',noteThap:'F2',noteCao:'F4',quangGiong:'F2 - F4',chestVoice:'F2 - D4',mixVoice:'Eb4 - F4',falsetto:'G4 - Bb4',headVoice:'Eb4 - G4',whistleVoice:'',hocPhi:1750000,daDongHocPhi:false,tienMatDaThu:0,active:true},
  {id:'HV-000009',hoTen:'Bí ngô',username:'bingo',password:'123456',rank:'B',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',dienThoai:'0918889900',zalo:'https://zalo.me/0918889900',facebook:'https://facebook.com/bingo',ngayBatDau:'17/06/2026',ngayKhoaMoi:'02/09/2026',soBuoiKhoa:8,soBuoiDeal:8,soBuoiDaHoc:4,soBuoiConLai:4,loaiGiong:'Nữ trung',loaiHocVien:'NEW',noteThap:'A3',noteCao:'B5',quangGiong:'A3 - B5',chestVoice:'A3 - D4',mixVoice:'Eb4 - G5',falsetto:'Ab5 - B5',headVoice:'E5 - A5',whistleVoice:'',hocPhi:2500000,daDongHocPhi:true,tienMatDaThu:0,active:true,linkDrive:'https://drive.google.com/drive/folders/102L39D7iZl7MBfMngLeXBTslTEdLaGg6'},
  {id:'HV-000010',hoTen:'Quyên Quyên',rank:'D',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',dienThoai:'0903344556',zalo:'0903344556',facebook:'',ngayBatDau:'08/07/2026',ngayKhoaMoi:'08/07/2026',soBuoiKhoa:8,soBuoiDeal:8,soBuoiDaHoc:2,soBuoiConLai:6,loaiGiong:'Nữ cao',loaiHocVien:'NEW',noteThap:'Bb3',noteCao:'C6',quangGiong:'Bb3 - C6',chestVoice:'Bb3 - Eb4',mixVoice:'E4 - Ab5',falsetto:'A5 - C6',headVoice:'F5 - Bb5',whistleVoice:'',hocPhi:2500000,daDongHocPhi:false,tienMatDaThu:0,active:true,linkDrive:'https://drive.google.com/drive/folders/10OekX2G908eK8Y_qDbLoP5UCw6KECWHs'},
  {id:'HV-000011',hoTen:'Hưng',rank:'C',tinhTrang:'Đang học',lop:'TN12',giaoVien:'Quân',dienThoai:'0909112233',zalo:'https://zalo.me/0909112233',facebook:'https://facebook.com/hungtn12',ngayBatDau:'23/07/2026',ngayKhoaMoi:'02/09/2026',soBuoiKhoa:8,soBuoiDeal:8,soBuoiDaHoc:3,soBuoiConLai:5,loaiGiong:'Nam cao',loaiHocVien:'NEW',noteThap:'A2',noteCao:'A4',quangGiong:'A2 - A4',chestVoice:'A2 - E4',mixVoice:'F4 - A4',falsetto:'Bb4 - D5',headVoice:'G4 - B4',whistleVoice:'',hocPhi:2500000,daDongHocPhi:true,tienMatDaThu:0,active:true,linkDrive:'https://drive.google.com/drive/folders/1sample_drive_hung'},
  {id:'HV-000012',hoTen:'Nhi',rank:'B',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Quân',dienThoai:'0938112233',zalo:'0938112233',facebook:'',ngayBatDau:'13/07/2026',ngayKhoaMoi:'13/07/2026',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:2,soBuoiConLai:4,loaiGiong:'Nữ cao',loaiHocVien:'NEW',noteThap:'A3',noteCao:'D6',quangGiong:'A3 - D6',chestVoice:'A3 - D4',mixVoice:'Eb4 - G5',falsetto:'Ab5 - D6',headVoice:'E5 - B5',whistleVoice:'',hocPhi:1750000,daDongHocPhi:true,tienMatDaThu:0,active:true,linkDrive:'https://drive.google.com/drive/folders/1d-mSWz59uhrR6FbYWmuRKcK1gTprkNYr'},
  {id:'HV-000013',hoTen:'Thông',username:'thong',password:'123456',rank:'A',tinhTrang:'Đang học',lop:'TN12',giaoVien:'Quân',dienThoai:'0977112233',zalo:'https://zalo.me/0977112233',facebook:'https://facebook.com/thongtn12',ngayBatDau:'22/08/2026',ngayKhoaMoi:'22/08/2026',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:1,soBuoiConLai:5,loaiGiong:'Nam trung',loaiHocVien:'NEW',noteThap:'E2',noteCao:'G4',quangGiong:'E2 - G4',chestVoice:'E2 - D4',mixVoice:'Eb4 - G4',falsetto:'G#4 - C5',headVoice:'F4 - A4',whistleVoice:'',hocPhi:1750000,daDongHocPhi:true,tienMatDaThu:0,active:true,linkDrive:'https://drive.google.com/drive/folders/1sample_drive_thong'},
  {id:'HV-000014',hoTen:'Sunny',rank:'B',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',dienThoai:'0966112233',zalo:'0966112233',facebook:'',ngayBatDau:'02/09/2026',soBuoiKhoa:8,soBuoiDeal:8,soBuoiDaHoc:4,soBuoiConLai:4,loaiHocVien:'NEW',hocPhi:2500000,daDongHocPhi:true,tienMatDaThu:0,active:true},
  {id:'HV-000015',hoTen:'Phượng',rank:'A',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',dienThoai:'0944112233',zalo:'0944112233',facebook:'',ngayBatDau:'24/09/2026',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:3,soBuoiConLai:3,loaiHocVien:'NEW',hocPhi:1750000,daDongHocPhi:true,tienMatDaThu:0,active:true},
  {id:'HV-000016',hoTen:'Lam',rank:'A',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',dienThoai:'0922112233',zalo:'0922112233',facebook:'',ngayBatDau:'24/09/2026',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:3,soBuoiConLai:3,loaiHocVien:'NEW',hocPhi:1750000,daDongHocPhi:true,tienMatDaThu:0,active:true},
  {id:'HV-000017',hoTen:'Tuyển',rank:'A',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',dienThoai:'0911998877',zalo:'0911998877',facebook:'',ngayBatDau:'28/09/2026',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:1,soBuoiConLai:5,loaiHocVien:'NEW',hocPhi:1750000,daDongHocPhi:false,tienMatDaThu:0,active:true},
  {id:'HV-000018',hoTen:'Thịnh',rank:'B',tinhTrang:'Đang học',lop:'TN12',giaoVien:'Quân',dienThoai:'0933998877',zalo:'https://zalo.me/0933998877',facebook:'https://facebook.com/thinh',ngayBatDau:'15/09/2026',soBuoiKhoa:8,soBuoiDeal:8,soBuoiDaHoc:2,soBuoiConLai:6,loaiHocVien:'NEW',hocPhi:2500000,daDongHocPhi:true,tienMatDaThu:0,active:true},
  {id:'HV-000019',hoTen:'Ngọc Hân',rank:'C',tinhTrang:'Đã hết hạn lưu trữ (Đã xoá Drive)',lop:'TNN',lopDaTungHoc:'TNN',giaoVien:'Linh',dienThoai:'0908123456',zalo:'https://zalo.me/0908123456',facebook:'https://facebook.com/ngochan',ngayBatDau:'01/05/2026',soBuoiKhoa:8,soBuoiDeal:8,soBuoiDaHoc:8,soBuoiConLai:0,daXoaDrive:true,ngayXoaDrive:'01/07/2026',linkDrive:'',active:true}
];

const DEFAULT_PERMS_ADMIN = {students:{view:true,edit:true,delete:true},sessions:{view:true,edit:true,delete:true},voice:{view:true,edit:true,delete:true},songs:{view:true,edit:true,delete:true},settings:{view:true,edit:true,delete:true}};
const DEFAULT_PERMS_GV = {students:{view:true,edit:true,delete:false},sessions:{view:true,edit:true,delete:true},voice:{view:true,edit:true,delete:true},songs:{view:true,edit:true,delete:true},settings:{view:false,edit:false,delete:false}};

const SEED_USERS = [
  {id:'USR-000001',username:'admin',password:'123',hoTen:'Quản trị viên (Admin)',role:'admin',email:'admin@tonymusic.vn',permissions:DEFAULT_PERMS_ADMIN,active:true},
  {id:'USR-000002',username:'linh',password:'123',hoTen:'Giảng viên Linh',role:'gv',email:'linh@tonymusic.vn',dienThoai:'0987654321',permissions:DEFAULT_PERMS_GV,luongTrenHocVien:0,hoaHongHocVienMoi:250000,hoaHongGiaHan:350000,soTaiKhoan:'140396',nganHang:'VIB',mauLich:'#34D399',dayHoc:true,active:true},
  {id:'USR-000003',username:'quan',password:'123',hoTen:'Giảng viên Quân',role:'gv',email:'quan@tonymusic.vn',dienThoai:'0912345678',permissions:DEFAULT_PERMS_GV,luongTrenHocVien:400000,hoaHongHocVienMoi:200000,hoaHongGiaHan:300000,soTaiKhoan:'19035678901',nganHang:'Techcombank',mauLich:'#6bb0e0',dayHoc:true,active:true}
];

const SEED_EXERCISES = [
  {id:'EX-000001', tenBai:'Rung môi Lip Trill âm "Brrr" theo thang âm', kyThuat:'Khởi động', linkYoutube:'https://www.youtube.com/watch?v=dQw4w9WgXcQ', linkHuongDan:'https://tonymusic.vn/huong-dan/lip-trill', ghiChu:'Thả lỏng cơ hàm và khóe môi, nén hơi cơ hoành đều đặn 5-10 phút.', nguoiTao:'Linh', active:true},
  {id:'EX-000002', tenBai:'Nén hơi xì âm "Sss" giữ áp lực hơi 45 giây', kyThuat:'Hơi thở', linkYoutube:'https://www.youtube.com/watch?v=kJQP7kiw5Fk', linkHuongDan:'', ghiChu:'Kiểm soát luồng hơi ra đều, giữ sườn mở rộng, không hóp bụng vội.', nguoiTao:'Quân', active:true},
  {id:'EX-000003', tenBai:'Mở khẩu hình ngáp ngủ và tạo khoảng vang vòm họng', kyThuat:'Khẩu hình', linkYoutube:'https://www.youtube.com/watch?v=3JZ_D3ELwOQ', linkHuongDan:'', ghiChu:'Hạ thanh quản tự nhiên, nâng vòm mềm tạo không gian vòm âm thanh sáng.', nguoiTao:'Linh', active:true},
  {id:'EX-000004', tenBai:'Chuyển giọng Passaggio từ Chest sang Mix âm "Nay Nay"', kyThuat:'Mixvoice', linkYoutube:'https://www.youtube.com/watch?v=fJ9rUzIMcZQ', linkHuongDan:'', ghiChu:'Nén nhẹ thanh đới, âm thanh tập trung ở hốc xoang trán, tránh gào thét.', nguoiTao:'Quân', active:true},
  {id:'EX-000005', tenBai:'Kỹ thuật Crying Voice (Tiếng khóc) mở rộng nốt cao', kyThuat:'Quãng giọng', linkYoutube:'https://www.youtube.com/watch?v=ZbZSe6N_BXs', linkHuongDan:'', ghiChu:'Giúp kéo giãn dây thanh nhẹ nhàng và chạm nốt cao không bị căng cứng.', nguoiTao:'Linh', active:true}
];

// Buổi học mẫu để Khám phá có dữ liệu bài hát (gom ẩn danh từ nhiều học viên)
const SEED_BUOIHOC = [
  {id:'BH-000001', hocVienId:'HV-000008', ngayHoc:'2026-10-01', buoiSo:1, focusSkillName:'Mixvoice vùng chuyển giọng (Passaggio)',
   songsJson: JSON.stringify([{title:'Nơi Này Có Anh - Sơn Tùng M-TP', ytLink:'https://www.youtube.com/watch?v=yc2qvAQW7f0', noteCao:'A4', noteThap:'C3', tone:'-2', details:'Tone nam, xử lý nốt ngân ở cuối câu.'}]),
   techsJson: JSON.stringify([{name:'Belting an toàn', ytLink:'https://www.youtube.com/watch?v=ZbZSe6N_BXs', notes:'Giữ hơi, không gào, belt 2-3 nốt trên break.'}]),
   noiDung:'Luyện mix ở đoạn chorus'},
  {id:'BH-000002', hocVienId:'HV-000018', ngayHoc:'2026-10-02', buoiSo:2, focusSkillName:'Legato (hát liền)',
   songsJson: JSON.stringify([{title:'Lạc Trôi - Sơn Tùng M-TP', ytLink:'https://www.youtube.com/watch?v=Llw9Q6akRo4', noteCao:'G4', noteThap:'D3', tone:'0', details:'Giữ legato mượt ở verse.'}]),
   techsJson: JSON.stringify([{name:'Legato (hát liền)', ytLink:'', notes:'Nối nốt không ngắt, breath flow liên tục.'}])},
  {id:'BH-000003', hocVienId:'HV-000014', ngayHoc:'2026-10-03', buoiSo:5, focusSkillName:'Head Voice (giọng đầu)',
   songsJson: JSON.stringify([{title:'Nơi Này Có Anh - Sơn Tùng M-TP', ytLink:'', noteCao:'A4', noteThap:'C3', tone:'-1', details:'Lên head voice nhẹ ở câu cao.'}]),
   techsJson: JSON.stringify([{name:'Head Voice (giọng đầu)', ytLink:'https://www.youtube.com/watch?v=fJ9rUzIMcZQ', notes:'Oo nhẹ lên cao.'}])}
];

// ---- DAO helpers ----
function db_read(table) {
  const raw = localStorage.getItem(DB_PREFIX + table);
  return raw ? JSON.parse(raw) : null;
}
function db_write(table, data) {
  localStorage.setItem(DB_PREFIX + table, JSON.stringify(data));
}
function db_init() {
  if (!db_read('HocVien')) db_write('HocVien', SEED_STUDENTS);
  if (!db_read('BuoiHoc')) db_write('BuoiHoc', SEED_BUOIHOC);
  if (!db_read('DanhGiaGiong')) db_write('DanhGiaGiong', [
    {id:'DG-000001', hocVienId:'HV-000008', ngayDanhGia:'2026-09-01', loaiPhieu:'Test đầu vào', noteThap:'G2', noteCao:'D4', tongDiem:6, rankGoiY:'A', createdAt:'2026-09-01'},
    {id:'DG-000002', hocVienId:'HV-000008', ngayDanhGia:'2026-10-03', loaiPhieu:'Test Rank', noteThap:'F2', noteCao:'F4', tongDiem:9, rankGoiY:'B', createdAt:'2026-10-03'}
  ]);
  if (!db_read('PhanTichBai')) db_write('PhanTichBai', []);
  if (!db_read('Users')) db_write('Users', SEED_USERS);
  if (!db_read('BaiLuyenThanh')) db_write('BaiLuyenThanh', SEED_EXERCISES);
  if (!db_read('Settings')) db_write('Settings', {});
  ['CoSo', 'Phong', 'KhungGio', 'LichXep'].forEach(function(t){ if (!db_read(t)) db_write(t, []); });
}
db_init();

function db_nextId(table, prefix) {
  const rows = db_read(table) || [];
  let max = 0;
  rows.forEach(function(r) {
    const m = String(r.id || '').match(/(\d+)$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return prefix + '-' + String(max + 1).padStart(6, '0');
}

function nowStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function toStorageDate_(d) {
  if (!d) return '';
  if (typeof d === 'string') {
    const dmy = d.trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmy) {
      return String(dmy[1]).padStart(2, '0') + '/' + String(dmy[2]).padStart(2, '0') + '/' + dmy[3];
    }
    const ymd = d.trim().match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (ymd) {
      return String(ymd[3]).padStart(2, '0') + '/' + String(ymd[2]).padStart(2, '0') + '/' + ymd[1];
    }
  }
  const dt = (d instanceof Date) ? d : new Date(d);
  if (!isNaN(dt.getTime())) {
    return String(dt.getDate()).padStart(2, '0') + '/' + String(dt.getMonth() + 1).padStart(2, '0') + '/' + dt.getFullYear();
  }
  return String(d);
}

// ---- Helper mà đoạn lõi Lịch dạy (nhúng từ Code.txt) cần ----
let ME_ = null;
function readAll_(name) { return (db_read(name) || []).map(function(r){ return Object.assign({}, r); }); }
function writeRows_(name, inserts, updates, deleteIds) {
  let rows = db_read(name) || [];
  (updates || []).forEach(function(o){
    const i = rows.findIndex(function(r){ return String(r.id) === String(o.id); });
    if (i !== -1) rows[i] = Object.assign({}, rows[i], o);
  });
  if (deleteIds && deleteIds.length) {
    const del = {};
    deleteIds.forEach(function(id){ del[String(id)] = true; });
    rows = rows.filter(function(r){ return !del[String(r.id)]; });
  }
  (inserts || []).forEach(function(o){ rows.push(Object.assign({}, o)); });
  db_write(name, rows);
}
function withLock_(fn) { return fn(); }
function todayYmd_() { return nowStr(); }

// ---- Đăng nhập (mock) ----
function mock_findAccount(kind, id) {
  return (db_read(kind === 'hv' ? 'HocVien' : 'Users') || []).find(function(r){ return String(r.id) === String(id) && r.active !== false; }) || null;
}
function mock_buildMe(kind, row) {
  if (kind === 'hv') return { kind: 'hv', id: row.id, role: 'hv', hoTen: row.hoTen, username: row.username || '', hocVienId: row.id, permissions: {} };
  return { kind: 'user', id: row.id, role: row.role || 'gv', hoTen: row.hoTen, username: row.username, email: row.email || '',
           permissions: row.role === 'admin' ? DEFAULT_PERMS_ADMIN : (row.permissions || DEFAULT_PERMS_GV) };
}
function mock_verify(token) {
  const p = String(token || '').split('|');
  if (p.length !== 3 || p[0] !== 'mock') return null;
  const row = mock_findAccount(p[1], p[2]);
  return row ? mock_buildMe(p[1], row) : null;
}
function mock_login(username, password) {
  const u = String(username || '').trim().toLowerCase();
  if (!u || !password) throw new Error('Vui lòng nhập tên đăng nhập và mật khẩu');
  let kind = 'user';
  let row = (db_read('Users') || []).find(function(r){ return r.active !== false && String(r.username || '').toLowerCase() === u; });
  if (!row) { kind = 'hv'; row = (db_read('HocVien') || []).find(function(r){ return r.active !== false && String(r.username || '').toLowerCase() === u; }); }
  if (!row || String(row.password || '') !== String(password)) throw new Error('Sai tên đăng nhập hoặc mật khẩu');
  return { token: 'mock|' + kind + '|' + row.id, me: mock_buildMe(kind, row), weakPassword: String(password).length < 6 };
}
function mock_changeMyPassword(oldPw, newPw) {
  if (String(newPw || '').length < 6) throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
  const table = ME_.kind === 'hv' ? 'HocVien' : 'Users';
  const all = db_read(table) || [];
  const row = all.find(function(r){ return String(r.id) === String(ME_.id); });
  if (!row || String(row.password || '') !== String(oldPw)) throw new Error('Mật khẩu hiện tại không đúng');
  row.password = newPw;
  db_write(table, all);
  return { success: true, token: 'mock|' + ME_.kind + '|' + ME_.id, message: 'Đã đổi mật khẩu.' };
}

// ---- Dọn dẹp thư mục Drive học viên hết hạn (>60 ngày) ----
function mock_cleanExpiredDriveFolders() {
  const all = db_read('HocVien') || [];
  let changed = false;
  const now = new Date();
  const todayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  all.forEach(function(s){
    if (!s || !s.id || s.active === false) return;
    if (s.daXoaDrive) return;

    const baseStr = s.ngayKhoaMoi || s.ngayBatDau;
    if (!baseStr) return;
    let baseDate = null;
    if (typeof baseStr === 'string') {
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(baseStr)) {
        const p = baseStr.split('/');
        baseDate = new Date(parseInt(p[2],10), parseInt(p[1],10)-1, parseInt(p[0],10));
      } else if (/^\d{4}-\d{2}-\d{2}/.test(baseStr)) {
        const p = baseStr.split('T')[0].split('-');
        baseDate = new Date(parseInt(p[0],10), parseInt(p[1],10)-1, parseInt(p[2],10));
      }
    }
    if (!baseDate || isNaN(baseDate.getTime())) return;

    const expireMs = baseDate.getTime() + (60 * 24 * 60 * 60 * 1000);
    const expireDayMs = new Date(new Date(expireMs).getFullYear(), new Date(expireMs).getMonth(), new Date(expireMs).getDate()).getTime();

    if (todayMs > expireDayMs) {
      s.daXoaDrive = true;
      s.ngayXoaDrive = (new Date()).toLocaleDateString('vi-VN');
      s.linkDrive = '';
      s.tinhTrang = 'Đã hết hạn lưu trữ (Đã xoá Drive)';
      s.lopDaTungHoc = s.lop || '';
      s.quangGiong = '';
      s.noteThap = '';
      s.noteCao = '';
      s.chestVoice = '';
      s.mixVoice = '';
      s.falsetto = '';
      s.headVoice = '';
      s.whistleVoice = '';
      s.mucTieu = '';
      s.diemManh = '';
      s.diemYeu = '';
      s.keHoach = '';
      s.khuyenNghi = '';
      changed = true;
    }
  });

  if (changed) db_write('HocVien', all);
  return { success: true };
}

// ---- Phân quyền theo Giáo viên (giống Code.txt) ----
function mock_myTeacherFold() {
  if (!ME_ || ME_.role !== 'gv') return '';
  const row = (db_read('Users') || []).find(function(r){ return String(r.id) === String(ME_.id); });
  return schFold_(row ? schShortName_(row) : (ME_.hoTen || ''));
}
function mock_canSeeStudent(st) {
  if (!ME_) return false;
  if (ME_.role === 'admin') return true;
  if (ME_.role === 'gv') { const m = mock_myTeacherFold(); return !!m && schFold_(st.giaoVien || '') === m; }
  if (ME_.role === 'viewer') return !!(ME_.permissions && ME_.permissions.students && ME_.permissions.students.view);
  return false;
}

// ---- Mock API implementations ----
function mock_getStudents() {
  mock_cleanExpiredDriveFolders();
  return (db_read('HocVien') || []).filter(function(r) { return r.active !== false; }).filter(mock_canSeeStudent).map(function(r){
    const o = Object.assign({}, r);
    o.coMatKhau = !!o.password;
    delete o.password;
    if (ME_ && ME_.role !== 'admin') { delete o.hocPhi; delete o.daDongHocPhi; delete o.tienMatDaThu; delete o.loaiHocVien; }
    return o;
  });
}

function mock_getStudent(id) {
  const all = db_read('HocVien') || [];
  const s = all.find(function(r) { return String(r.id) === String(id); });
  if (!s) return null;
  if (!mock_canSeeStudent(s)) throw new Error('Bạn không có quyền xem học viên này');
  const out = Object.assign({}, s);
  out.coMatKhau = !!out.password;
  delete out.password;
  out.buoiHoc = (db_read('BuoiHoc') || []).filter(function(r) { return String(r.hocVienId) === String(id); });
  out.danhGiaGiong = (db_read('DanhGiaGiong') || []).filter(function(r) { return String(r.hocVienId) === String(id); });
  out.phanTichBai = (db_read('PhanTichBai') || []).filter(function(r) { return String(r.hocVienId) === String(id); });
  return out;
}

function mock_saveStudent(data) {
  const all = db_read('HocVien') || [];
  const soKhoa = parseInt(data.soBuoiKhoa || data.soBuoiDeal, 10) || 0;
  const daHoc = parseInt(data.soBuoiDaHoc, 10) || 0;
  data.soBuoiKhoa = soKhoa;
  data.soBuoiDeal = data.soBuoiDeal || soKhoa;
  data.soBuoiDaHoc = daHoc;
  data.soBuoiConLai = Math.max(0, soKhoa - daHoc);
  if (data.hocPhi !== undefined) data.hocPhi = parseFloat(data.hocPhi) || (soKhoa >= 8 ? 2500000 : 1750000);
  if (data.tienMatDaThu !== undefined) data.tienMatDaThu = parseFloat(data.tienMatDaThu) || 0;
  if (data.daDongHocPhi !== undefined) {
    data.daDongHocPhi = (String(data.daDongHocPhi).toUpperCase() === 'PAID' || data.daDongHocPhi === true || String(data.daDongHocPhi).toUpperCase() === 'TRUE');
  }
  if (!data.loaiHocVien) data.loaiHocVien = 'NEW';
  
  // Chuẩn hoá ngày tháng sang dd/mm/yyyy
  if (data.ngayBatDau && /^\d{4}-\d{2}-\d{2}/.test(data.ngayBatDau)) {
    const p = data.ngayBatDau.split('T')[0].split('-');
    data.ngayBatDau = p[2] + '/' + p[1] + '/' + p[0];
  }
  if (data.ngayKhoaMoi && /^\d{4}-\d{2}-\d{2}/.test(data.ngayKhoaMoi)) {
    const p = data.ngayKhoaMoi.split('T')[0].split('-');
    data.ngayKhoaMoi = p[2] + '/' + p[1] + '/' + p[0];
  }
  if (data.dienThoai !== undefined) data.dienThoai = String(data.dienThoai || '').trim();
  if (data.zalo !== undefined) data.zalo = String(data.zalo || '').trim();
  if (data.facebook !== undefined) data.facebook = String(data.facebook || '').trim();
  if (data.email !== undefined) data.email = String(data.email || '').trim();

  // Phân quyền theo GV: GV chỉ tạo/sửa học viên của mình (luôn gán về chính GV)
  if (ME_ && ME_.role === 'gv') {
    if (data.id) {
      const existing = all.find(function(r){ return String(r.id) === String(data.id); });
      if (existing && !mock_canSeeStudent(existing)) throw new Error('Bạn không có quyền sửa học viên này');
    }
    const meRow = (db_read('Users') || []).find(function(r){ return String(r.id) === String(ME_.id); });
    if (meRow) data.giaoVien = schShortName_(meRow);
  }

  delete data.coMatKhau;
  if (data.username) {
    const u = String(data.username).trim().toLowerCase();
    const taken = (db_read('Users') || []).some(function(r){ return String(r.username || '').toLowerCase() === u; }) ||
      all.some(function(r){ return String(r.id) !== String(data.id) && String(r.username || '').toLowerCase() === u; });
    if (taken) throw new Error('Tên đăng nhập "' + data.username + '" đã được dùng cho tài khoản khác');
  }
  if (!data.password) delete data.password;
  else if (String(data.password).length < 6) throw new Error('Mật khẩu học viên phải có ít nhất 6 ký tự');

  if (data.id && String(data.id).trim() !== '') {
    const idx = all.findIndex(function(r) { return String(r.id) === String(data.id); });
    if (idx !== -1) {
      data.updatedAt = nowStr();
      all[idx] = Object.assign(all[idx], data);
    }
    db_write('HocVien', all);
    return data.id;
  }

  const id = db_nextId('HocVien', 'HV');
  data.id = id;
  data.active = true;
  data.createdAt = nowStr();
  data.updatedAt = nowStr();
  data.tinhTrang = data.tinhTrang || 'Đang học';
  data.rank = data.rank || 'A';
  all.push(data);
  db_write('HocVien', all);
  return id;
}

function mock_deleteStudents(ids) {
  if (!Array.isArray(ids)) ids = [ids];
  const idStrs = ids.map(function(id) { return String(id).trim(); });
  let hv = db_read('HocVien') || [];
  hv = hv.filter(function(r) { return idStrs.indexOf(String(r.id || '').trim()) === -1; });
  db_write('HocVien', hv);
  let bh = db_read('BuoiHoc') || [];
  bh = bh.filter(function(r) { return idStrs.indexOf(String(r.hocVienId || '').trim()) === -1; });
  db_write('BuoiHoc', bh);
  ['DanhGiaGiong','PhanTichBai'].forEach(function(t) {
    let arr = db_read(t) || [];
    arr = arr.filter(function(r) { return idStrs.indexOf(String(r.hocVienId || '').trim()) === -1; });
    db_write(t, arr);
  });
  return { success: true, count: ids.length, message: 'Đã xoá ' + ids.length + ' học viên và toàn bộ dữ liệu liên quan!' };
}

function mock_getDashboard() {
  const hv = (db_read('HocVien') || []).filter(function(r) { return r.active !== false; }).filter(mock_canSeeStudent);
  const norm = function(s) { return String(s||'').trim(); };
  const byRank = {A:0,B:0,C:0,D:0};
  const byLop = {};
  let dangHoc = 0, hoanThanh = 0, nghi = 0, hocThu = 0;
  hv.forEach(function(r) {
    const st = norm(r.tinhTrang);
    if (st.indexOf('Đang học') >= 0) dangHoc++;
    else if (st.indexOf('hoàn thành') >= 0) hoanThanh++;
    else if (st.indexOf('nghỉ') >= 0 || st.indexOf('Nghỉ') >= 0) nghi++;
    else if (st.indexOf('thử') >= 0) hocThu++;
    const rk = norm(r.rank).toUpperCase();
    if (byRank[rk] !== undefined) byRank[rk]++;
    const lp = norm(r.lop) || 'Chưa xếp';
    byLop[lp] = (byLop[lp]||0) + 1;
  });
  return { tong: hv.length, dangHoc: dangHoc, hoanThanh: hoanThanh, nghi: nghi, hocThu: hocThu, byRank: byRank, byLop: byLop };
}

function mock_getUsers() {
  return (db_read('Users') || []).filter(function(u) { return u.active !== false; }).map(function(u){
    const o = Object.assign({}, u);
    delete o.password;
    o.tenNgan = schShortName_(u);
    o.dayHoc = schIsTeacher_(u);
    return o;
  });
}

function mock_saveUser(u) {
  const all = db_read('Users') || [];
  if (u.permissions && typeof u.permissions === 'string') { try { u.permissions = JSON.parse(u.permissions); } catch(e){} }
  if (u.password && String(u.password).length < 6) throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
  if (!u.password) delete u.password;
  if (u.id) {
    const idx = all.findIndex(function(r) { return String(r.id) === String(u.id); });
    if (idx !== -1) {
      all[idx] = Object.assign(all[idx], u, { updatedAt: nowStr() });
      db_write('Users', all);
      return { success: true, id: u.id, message: 'Đã cập nhật người dùng!' };
    }
  }
  if (!u.password) throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
  const id = db_nextId('Users', 'USR');
  u.id = id;
  u.active = true;
  u.createdAt = nowStr();
  u.updatedAt = nowStr();
  if (!u.permissions) u.permissions = DEFAULT_PERMS_GV;
  all.push(u);
  db_write('Users', all);
  return { success: true, id: id, message: 'Đã tạo người dùng mới!' };
}

function mock_deleteUsers(ids) {
  if (!Array.isArray(ids)) ids = [ids];
  if (ids.some(function(id){ return String(id) === String(ME_.id); })) throw new Error('Không thể xoá tài khoản đang đăng nhập');
  let all = db_read('Users') || [];
  ids.forEach(function(id) {
    const idx = all.findIndex(function(r) { return String(r.id) === String(id); });
    if (idx !== -1) all[idx].active = false;
  });
  db_write('Users', all);
  return { success: true, count: ids.length, message: 'Đã xoá ' + ids.length + ' người dùng.' };
}

// ---- Giáo viên & Bảng lương ----
function mock_getTeachers() {
  const allUsers = (db_read('Users') || []).filter(function(u){ return u.active !== false; });
  const allStudents = (db_read('HocVien') || []).filter(function(s){ return s.active !== false; });
  const teachers = allUsers.filter(function(u){ return u.role === 'gv' || u.dayHoc === true; });

  const list = teachers.map(function(u){
    const sName = schShortName_(u);
    const myStudents = allStudents.filter(function(s){
      const gv = schFold_(s.giaoVien || '');
      const tName = schFold_(u.hoTen || '');
      const sn = schFold_(sName);
      const un = schFold_(u.username || '');
      return gv && (gv.indexOf(sn) >= 0 || gv.indexOf(tName) >= 0 || gv.indexOf(un) >= 0 || sn.indexOf(gv) >= 0);
    });

    const activeStudents = myStudents.filter(function(s){ return String(s.tinhTrang || '').indexOf('Đang học') >= 0; });
    const newStudents = activeStudents.filter(function(s){ return String(s.loaiHocVien || 'NEW').toUpperCase() === 'NEW'; });
    const renewedStudents = activeStudents.filter(function(s){ return String(s.loaiHocVien || '').toUpperCase() !== 'NEW'; });

    const luongTrenHv = parseFloat(u.luongTrenHocVien) || (u.username === 'linh' ? 0 : 400000);
    const hoaHongMoi = parseFloat(u.hoaHongHocVienMoi) || (u.username === 'linh' ? 250000 : 200000);
    const hoaHongGiaHan = parseFloat(u.hoaHongGiaHan) || (u.username === 'linh' ? 350000 : 300000);

    const baseSalary = activeStudents.length * luongTrenHv;
    const bonusNew = newStudents.length * hoaHongMoi;
    const bonusRenew = renewedStudents.length * hoaHongGiaHan;
    const cashCollected = myStudents.reduce(function(sum, s){ return sum + (parseFloat(s.tienMatDaThu) || 0); }, 0);
    const totalSalary = baseSalary + bonusNew + bonusRenew;
    const transferAmount = Math.max(0, totalSalary - cashCollected);

    return {
      id: u.id,
      username: u.username,
      hoTen: u.hoTen,
      email: u.email || '',
      dienThoai: u.dienThoai || '',
      tenNgan: sName,
      mauLich: u.mauLich || '#34D399',
      dayHoc: u.dayHoc !== false,
      luongTrenHocVien: luongTrenHv,
      hoaHongHocVienMoi: hoaHongMoi,
      hoaHongGiaHan: hoaHongGiaHan,
      soTaiKhoan: u.soTaiKhoan || (u.username === 'linh' ? '140396' : ''),
      nganHang: u.nganHang || (u.username === 'linh' ? 'VIB' : ''),
      soHocVien: activeStudents.length,
      soHocVienMoi: newStudents.length,
      soHocVienGiaHan: renewedStudents.length,
      baseSalary: baseSalary,
      bonusNew: bonusNew,
      bonusRenew: bonusRenew,
      totalSalary: totalSalary,
      cashCollected: cashCollected,
      transferAmount: transferAmount,
      coMatKhau: !!u.password
    };
  });

  const totalEst = list.reduce(function(s, t){ return s + t.totalSalary; }, 0);
  const totalNew = list.reduce(function(s, t){ return s + t.soHocVienMoi; }, 0);
  const totalRenew = list.reduce(function(s, t){ return s + t.soHocVienGiaHan; }, 0);

  return {
    success: true,
    teachers: list,
    summary: {
      totalTeachers: list.length,
      totalSalary: totalEst,
      newStudents: totalNew,
      renewals: totalRenew
    }
  };
}

function mock_saveTeacher(data) {
  if (!data.hoTen) throw new Error('Vui lòng nhập họ tên giáo viên');
  if (!data.username) throw new Error('Vui lòng nhập tên đăng nhập');
  const uname = String(data.username).trim().toLowerCase();
  const all = db_read('Users') || [];

  const patch = {
    hoTen: String(data.hoTen).trim(),
    username: uname,
    role: 'gv',
    email: String(data.email || '').trim(),
    dienThoai: String(data.dienThoai || '').trim(),
    tenNgan: data.tenNgan || String(data.hoTen).replace(/^\s*(giảng viên|giáo viên|gv|thầy|cô)\s+/i, '').trim(),
    mauLich: data.mauLich || '#34D399',
    dayHoc: data.dayHoc === undefined ? true : !!data.dayHoc,
    luongTrenHocVien: parseFloat(data.luongTrenHocVien) || 0,
    hoaHongHocVienMoi: parseFloat(data.hoaHongHocVienMoi) || 0,
    hoaHongGiaHan: parseFloat(data.hoaHongGiaHan) || 0,
    soTaiKhoan: String(data.soTaiKhoan || '').trim(),
    nganHang: String(data.nganHang || '').trim(),
    permissions: DEFAULT_PERMS_GV,
    updatedAt: nowStr()
  };

  if (data.password) {
    if (String(data.password).length < 6) throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
    patch.password = String(data.password);
  }

  if (data.id) {
    const idx = all.findIndex(function(r){ return String(r.id) === String(data.id); });
    if (idx !== -1) {
      Object.assign(all[idx], patch);
      db_write('Users', all);
      return { success: true, id: data.id, message: 'Đã cập nhật thông tin giáo viên!' };
    }
  }

  if (!data.password || String(data.password).length < 6) throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
  const id = db_nextId('Users', 'USR');
  patch.id = id;
  patch.active = true;
  patch.createdAt = nowStr();
  all.push(patch);
  db_write('Users', all);
  return { success: true, id: id, message: 'Đã tạo giáo viên mới thành công!' };
}

function mock_deleteTeachers(ids) {
  return mock_deleteUsers(ids);
}

// ---- Khám phá & Bài tập luyện thanh ----
function mock_getExercises() {
  const rows = (db_read('BaiLuyenThanh') || []).filter(function(r){ return r.active !== false; });
  return rows;
}

function mock_saveExercise(data) {
  if (!data.tenBai) throw new Error('Vui lòng nhập tên bài tập');
  const all = db_read('BaiLuyenThanh') || [];
  const patch = {
    tenBai: String(data.tenBai).trim(),
    kyThuat: String(data.kyThuat || 'Khác').trim(),
    linkYoutube: String(data.linkYoutube || '').trim(),
    linkHuongDan: String(data.linkHuongDan || '').trim(),
    ghiChu: String(data.ghiChu || '').trim(),
    nguoiTao: (ME_ && (ME_.hoTen || ME_.username)) || 'Hệ thống',
    updatedAt: nowStr()
  };

  if (data.id) {
    const idx = all.findIndex(function(r){ return String(r.id) === String(data.id); });
    if (idx !== -1) {
      Object.assign(all[idx], patch);
      db_write('BaiLuyenThanh', all);
      return { success: true, id: data.id, message: 'Đã cập nhật bài luyện thanh!' };
    }
  }

  const id = db_nextId('BaiLuyenThanh', 'EX');
  patch.id = id;
  patch.active = true;
  patch.createdAt = nowStr();
  all.push(patch);
  db_write('BaiLuyenThanh', all);
  return { success: true, id: id, message: 'Đã thêm bài luyện thanh vào Thư viện Khám phá!' };
}

function mock_deleteExercise(id) {
  const all = db_read('BaiLuyenThanh') || [];
  const idx = all.findIndex(function(r){ return String(r.id) === String(id); });
  if (idx !== -1) {
    all[idx].active = false;
    db_write('BaiLuyenThanh', all);
  }
  return { success: true, message: 'Đã xoá bài luyện thanh.' };
}

// ---- Khám phá: gom bài hát của TẤT CẢ học viên (ẩn danh) + bài luyện thanh ----
function mock_getDiscoverData() {
  const students = (db_read('HocVien') || []).filter(function(r){ return r.active !== false; });
  const stById = {};
  students.forEach(function(s){ stById[String(s.id)] = s; });
  const parseJson = function(v){ try { return v ? (typeof v === 'string' ? JSON.parse(v) : v) : []; } catch(e){ return []; } };
  const songsMap = {};
  const ensure = function(title){
    const k = schFold_(title);
    if (!songsMap[k]) songsMap[k] = { title: String(title).trim(), ytLink:'', noteCao:'', noteThap:'', tone:'0', details:'', chatGiong:{}, kyThuat:{}, learnedCount:0 };
    return songsMap[k];
  };
  const addVoice = function(e, st){ if (st && st.loaiGiong) e.chatGiong[String(st.loaiGiong).trim()] = true; };
  const addTech = function(e, n){ n = String(n||'').trim(); if (n) e.kyThuat[n] = true; };

  (db_read('BuoiHoc') || []).forEach(function(b){
    const st = stById[String(b.hocVienId)];
    const songs = parseJson(b.songsJson);
    const techNames = [];
    if (b.focusSkillName) techNames.push(b.focusSkillName);
    parseJson(b.techsJson).forEach(function(t){ if (t && t.name) techNames.push(t.name); });
    const applySong = function(e){ e.learnedCount++; addVoice(e, st); techNames.forEach(function(n){ addTech(e, n); }); };
    if (Array.isArray(songs)) songs.forEach(function(s){
      if (!s || !s.title || !String(s.title).trim()) return;
      const e = ensure(s.title);
      if (!e.ytLink && s.ytLink) e.ytLink = s.ytLink;
      if (!e.noteCao && s.noteCao) e.noteCao = s.noteCao;
      if (!e.noteThap && s.noteThap) e.noteThap = s.noteThap;
      if ((!e.tone || e.tone === '0') && s.tone) e.tone = s.tone;
      if (!e.details && s.details) e.details = s.details;
      applySong(e);
    });
    if (b.baiHat && String(b.baiHat).trim() && b.baiHat !== 'Thực hành bài hát') {
      const e = ensure(b.baiHat);
      if (!e.ytLink && b.linkYoutube) e.ytLink = b.linkYoutube;
      if (!e.noteCao && b.noteCao) e.noteCao = b.noteCao;
      if (!e.noteThap && b.noteThap) e.noteThap = b.noteThap;
      if (!e.details && b.noiDung) e.details = b.noiDung;
      applySong(e);
    }
  });
  (db_read('PhanTichBai') || []).forEach(function(p){
    if (!p.tenBai || !String(p.tenBai).trim()) return;
    const full = (p.tenBai + (p.ca ? ' - ' + p.ca : '')).trim();
    const e = ensure(full);
    if (!e.ytLink && p.linkYoutube) e.ytLink = p.linkYoutube;
    if (!e.details && p.ketQuaAI) e.details = p.ketQuaAI;
    e.learnedCount++;
    addVoice(e, stById[String(p.hocVienId)]);
  });

  const songs = Object.keys(songsMap).map(function(k){
    const e = songsMap[k];
    return { title:e.title, ytLink:e.ytLink, tone:e.tone, noteCao:e.noteCao, noteThap:e.noteThap,
             chatGiong:Object.keys(e.chatGiong), kyThuat:Object.keys(e.kyThuat), details:e.details, learnedCount:e.learnedCount };
  }).sort(function(a, b){ return b.learnedCount - a.learnedCount; });

  return { songs: songs, exercises: mock_getExercises() };
}

// ---- Danh mục kỹ thuật trọng tâm (tự xổ xuống) ----
const MOCK_TECH_SEED = [
  'Lip trill & Khởi động cơ hoành', 'Hơi thở cơ hoành (Diaphragm)', 'Nhận diện cao độ (Pitch)',
  'Khẩu hình & Nguyên âm', 'Thang âm & Vocalise (Scale)', 'Legato (hát liền)', 'Staccato (hát nảy)',
  'Chest Voice (giọng ngực)', 'Head Voice (giọng đầu)', 'Dynamics (to - nhỏ)',
  'Mixvoice vùng chuyển giọng (Passaggio)', 'Vibrato', 'Phrasing (xử lý câu nhạc)',
  'Mở khẩu hình dọc & Nén hơi', 'Mezza voce (nửa giọng)', 'Belting an toàn', 'Riff & Run', 'Twang', 'Mở rộng quãng giọng'
];
function mock_getTechniqueCatalog() {
  const settings = db_read('Settings') || {};
  let saved = Array.isArray(settings.techCatalog) ? settings.techCatalog : [];
  const seen = {}, out = [];
  const push = function(n){ n = String(n||'').trim(); if (!n) return; const k = schFold_(n); if (seen[k]) return; seen[k] = true; out.push(n); };
  MOCK_TECH_SEED.forEach(push);
  saved.forEach(push);
  (db_read('BuoiHoc') || []).forEach(function(b){
    if (b.focusSkillName) push(b.focusSkillName);
    try { const tj = b.techsJson ? (typeof b.techsJson === 'string' ? JSON.parse(b.techsJson) : b.techsJson) : []; if (Array.isArray(tj)) tj.forEach(function(t){ if (t && t.name) push(t.name); }); } catch(e){}
  });
  return out.sort(function(a, b){ return a.localeCompare(b, 'vi'); });
}
function mock_saveTechniqueCatalog(names) {
  if (!names) return { success: false, message: 'Chưa có kỹ thuật nào' };
  if (!Array.isArray(names)) names = [names];
  const settings = db_read('Settings') || {};
  let saved = Array.isArray(settings.techCatalog) ? settings.techCatalog : [];
  const seen = {}; saved.forEach(function(n){ seen[schFold_(n)] = true; });
  let added = 0;
  names.forEach(function(name){ const n = String(name||'').trim(); if (!n) return; const k = schFold_(n); if (seen[k]) return; seen[k] = true; saved.push(n); added++; });
  if (added) { settings.techCatalog = saved; db_write('Settings', settings); }
  return { success: true, added: added, catalog: mock_getTechniqueCatalog() };
}

// ---- Lộ trình Rank × Mục tiêu (giống Code.txt) ----
const MOCK_ROUTE_MATRIX = { A:{G1:[3,18],G2:[4,24],G3:[6,36],G4:[6,36]}, B:{G1:[2,12],G2:[3,18],G3:[4,24],G4:[4,24]}, C:{G1:[1,6],G2:[2,12],G3:[3,18],G4:[3,18]}, D:{G1:[0,0],G2:[1,6],G3:[2,12],G4:[2,12]} };
const MOCK_GOAL_TARGET = { G1:'B', G2:'C', G3:'D', G4:'D' };
const MOCK_GOAL_LABEL = { G1:'🎤 Hát Karaoke', G2:'☕ Giao lưu Cafe', G3:'🎙 Vocalist chuyên nghiệp', G4:'🎓 Thi trường Âm nhạc' };
function mock_getRouteSuggestion(rank, goal) {
  rank = String(rank||'A').toUpperCase(); goal = String(goal||'').toUpperCase();
  if (!MOCK_ROUTE_MATRIX[rank] || !MOCK_ROUTE_MATRIX[rank][goal]) return null;
  const m = MOCK_ROUTE_MATRIX[rank][goal];
  return { goal:goal, goalLabel:MOCK_GOAL_LABEL[goal]||goal, rankHienTai:rank, rankMucTieu:MOCK_GOAL_TARGET[goal],
           soKhoa:m[0], soBuoi:m[1], lyThuyet:goal==='G4',
           luuY: m[0] ? ('Dự kiến ' + m[0] + ' khóa (' + m[1] + ' buổi) để đạt Rank ' + MOCK_GOAL_TARGET[goal] + (goal==='G4'?' + Nhạc lý/Xướng âm.':'.')) : 'Đã đủ trình độ cho mục tiêu này.' };
}

// ---- Xuất PDF tổng kết (preview: dựng HTML báo cáo & trả blob URL để xem thử) ----
function mock_exportStudentReportPdf(hvId) {
  const s = (db_read('HocVien') || []).find(function(r){ return String(r.id) === String(hvId); });
  if (!s) throw new Error('Không tìm thấy học viên');
  if (!mock_canSeeStudent(s)) throw new Error('Bạn không có quyền xuất báo cáo học viên này');
  const sessions = (db_read('BuoiHoc') || []).filter(function(r){ return String(r.hocVienId) === String(hvId); })
    .sort(function(a,b){ return (parseInt(a.buoiSo||0,10)-parseInt(b.buoiSo||0,10)); });
  const assess = (db_read('DanhGiaGiong') || []).filter(function(r){ return String(r.hocVienId) === String(hvId); })
    .sort(function(a,b){ return String(a.ngayDanhGia||a.createdAt||'').localeCompare(String(b.ngayDanhGia||b.createdAt||'')); });
  const first = assess[0] || null, last = assess.length > 1 ? assess[assess.length-1] : null;
  const latest = sessions.length ? sessions[sessions.length-1] : null;
  const esc = function(x){ return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); };
  const qg = function(a){ return a ? ((a.noteThap||'—')+' – '+(a.noteCao||'—')) : '—'; };
  let songs = [];
  if (latest) { try { songs = latest.songsJson ? (typeof latest.songsJson==='string'?JSON.parse(latest.songsJson):latest.songsJson) : []; } catch(e){} }
  let techs = [];
  if (latest) { try { techs = latest.techsJson ? (typeof latest.techsJson==='string'?JSON.parse(latest.techsJson):latest.techsJson) : []; } catch(e){} }
  const route = mock_getRouteSuggestion(s.rank, s.mucTieuHoc);
  const r = function(l,v){ return v ? ('<tr><td style="background:#f1f7f3;font-weight:bold;width:34%">'+esc(l)+'</td><td>'+esc(v)+'</td></tr>') : ''; };
  let songsH = (songs||[]).filter(function(x){return x&&(x.title||x.ytLink);}).map(function(x,i){
    return '<div style="border:1px solid #d7e5dc;border-radius:6px;padding:8px;margin:6px 0"><b>🎵 Bài '+(i+1)+(x.title?': '+esc(x.title):'')+'</b><table border=1 cellspacing=0 style="border-collapse:collapse;width:100%;margin-top:4px">'+r('Link YouTube',x.ytLink)+r('Note cao',x.noteCao)+r('Note thấp',x.noteThap)+r('Ghi chú GV',x.details)+'</table></div>';
  }).join('') || '<i>Buổi gần nhất chưa ghi bài hát.</i>';
  let techsH = (techs||[]).filter(function(x){return x&&(x.name||x.ytLink||x.notes);}).map(function(x,i){
    return '<div style="border:1px solid #d7e5dc;border-radius:6px;padding:8px;margin:6px 0"><b>🎼 Kỹ thuật '+(i+1)+(x.name?': '+esc(x.name):'')+'</b><table border=1 cellspacing=0 style="border-collapse:collapse;width:100%;margin-top:4px">'+r('Link video',x.ytLink)+r('Hướng dẫn',x.notes)+'</table></div>';
  }).join('') || '<i>Buổi gần nhất chưa ghi kỹ thuật.</i>';
  const routeH = route ? ('<table border=1 cellspacing=0 style="border-collapse:collapse;width:100%">'+r('Mục tiêu',route.goalLabel)+r('Rank → mục tiêu','Rank '+route.rankHienTai+' → Rank '+route.rankMucTieu)+r('Lộ trình',route.soKhoa?(route.soKhoa+' khóa ('+route.soBuoi+' buổi)'):'Đã đạt mục tiêu')+r('Lưu ý',route.luuY)+'</table>') : '<i>Chưa chọn Mục tiêu học (G1–G4).</i>';
  const html = '<!doctype html><html><head><meta charset="utf-8"><title>Báo cáo '+esc(s.hoTen)+'</title></head><body style="font-family:Arial;margin:28px;color:#1a1a1a">'+
    '<h1 style="color:#0b7a4b">TONY MUSIC ACADEMY — Báo cáo tổng kết học viên</h1>'+
    '<p style="color:#666">[PREVIEW] Bản thật sẽ là PDF lưu vào Drive học viên · Sau '+(parseInt(s.soBuoiDaHoc||0,10))+' buổi</p>'+
    '<table border=1 cellspacing=0 style="border-collapse:collapse;width:100%">'+
      r('Học viên',s.hoTen)+r('Loại giọng',s.loaiGiong)+
      r('Rank', first ? ('Lần test đầu: '+(first.rankGoiY||'—')+' → Hiện tại: '+(s.rank||'—')) : (s.rank||'—'))+
      r('Quãng giọng test lần 1', qg(first))+r('Quãng giọng hiện tại', qg(last||first))+
    '</table>'+
    '<h2 style="color:#0b7a4b">🎵 Bài hát hôm nay</h2>'+songsH+
    '<h2 style="color:#0b7a4b">🎼 Kỹ thuật tập luyện</h2>'+techsH+
    '<h2 style="color:#0b7a4b">🧭 Lộ trình đề xuất</h2>'+routeH+
    '</body></html>';
  let url = '#';
  try { url = URL.createObjectURL(new Blob([html], { type: 'text/html' })); } catch(e) {}
  return { success: true, url: url, fileName: 'BaoCao_'+esc(s.hoTen)+'.pdf', folder: false,
           message: '[Preview] Đã dựng báo cáo (bản deploy sẽ lưu PDF vào Drive học viên).' };
}

function mock_getConfig() {
  const cfg = db_read('Settings') || {};
  return {
    geminiApiKey: cfg.geminiApiKey || '',
    geminiModel: cfg.geminiModel || 'gemini-2.0-flash',
    sharedDriveLink: cfg.sharedDriveLink || '',
    groupClasses: cfg.groupClasses || 'TN12',
    scheduleSheetLink: cfg.scheduleSheetLink || '',
    payDueSession: dashPayDue_(),
    classList: getClassList_(),
    dbUrl: '#preview-mode'
  };
}

function mock_saveConfig(cfg) {
  const cur = db_read('Settings') || {};
  Object.assign(cur, cfg);
  db_write('Settings', cur);
  return { success: true, message: 'Đã lưu cấu hình thành công!' };
}

function mock_saveSession(data) {
  const all = db_read('BuoiHoc') || [];
  if (data.ngayHoc) data.ngayHoc = toStorageDate_(data.ngayHoc);
  if (data.id && String(data.id).trim() !== '') {
    const idx = all.findIndex(function(r) { return String(r.id) === String(data.id); });
    if (idx !== -1) { all[idx] = Object.assign(all[idx], data); db_write('BuoiHoc', all); }
    return data.id;
  }
  const id = db_nextId('BuoiHoc', 'BH');
  data.id = id;
  data.createdAt = nowStr();
  if (!data.ngayHoc) data.ngayHoc = toStorageDate_(nowStr());
  all.push(data);
  db_write('BuoiHoc', all);

  const hvAll = db_read('HocVien') || [];
  const cnt = all.filter(function(r) { return String(r.hocVienId) === String(data.hocVienId); }).length;
  const hvIdx = hvAll.findIndex(function(r) { return String(r.id) === String(data.hocVienId); });
  if (hvIdx !== -1) {
    const soKhoa = parseInt(hvAll[hvIdx].soBuoiKhoa || hvAll[hvIdx].soBuoiDeal, 10) || 0;
    hvAll[hvIdx].soBuoiDaHoc = cnt;
    hvAll[hvIdx].soBuoiConLai = Math.max(0, soKhoa - cnt);
    hvAll[hvIdx].updatedAt = nowStr();
    db_write('HocVien', hvAll);
  }
  return id;
}

function mock_deleteSessions(sessionIds, hocVienId) {
  if (!Array.isArray(sessionIds)) sessionIds = [sessionIds];
  sessionIds = sessionIds.map(function(id) { return String(id).trim(); });
  let all = db_read('BuoiHoc') || [];
  let deletedCount = 0;
  all = all.filter(function(r) {
    if (sessionIds.indexOf(String(r.id || '').trim()) !== -1) { deletedCount++; return false; }
    return true;
  });
  db_write('BuoiHoc', all);

  if (hocVienId) {
    const hvAll = db_read('HocVien') || [];
    const cnt = all.filter(function(r) { return String(r.hocVienId) === String(hocVienId); }).length;
    const hvIdx = hvAll.findIndex(function(r) { return String(r.id) === String(hocVienId); });
    if (hvIdx !== -1) {
      const soKhoa = parseInt(hvAll[hvIdx].soBuoiKhoa || hvAll[hvIdx].soBuoiDeal, 10) || 0;
      hvAll[hvIdx].soBuoiDaHoc = cnt;
      hvAll[hvIdx].soBuoiConLai = Math.max(0, soKhoa - cnt);
      db_write('HocVien', hvAll);
    }
  }
  return { success: true, count: deletedCount, message: 'Đã xoá ' + deletedCount + ' buổi học thành công.' };
}

function mock_saveVoiceAssessment(data) {
  const all = db_read('DanhGiaGiong') || [];
  const id = db_nextId('DanhGiaGiong', 'DG');
  data.id = id;
  data.createdAt = nowStr();
  all.push(data);
  db_write('DanhGiaGiong', all);

  const hvAll = db_read('HocVien') || [];
  const hvIdx = hvAll.findIndex(function(r) { return String(r.id) === String(data.hocVienId); });
  if (hvIdx !== -1) {
    if (data.rankGoiY) hvAll[hvIdx].rank = data.rankGoiY;
    if (data.noteThap) hvAll[hvIdx].noteThap = data.noteThap;
    if (data.noteCao) hvAll[hvIdx].noteCao = data.noteCao;
    if (data.noteThap && data.noteCao) hvAll[hvIdx].quangGiong = data.noteThap + '–' + data.noteCao;
    if (data.khuyenNghi) hvAll[hvIdx].khuyenNghi = data.khuyenNghi;
    hvAll[hvIdx].updatedAt = nowStr();
    db_write('HocVien', hvAll);
  }
  return id;
}

function mock_saveSongAnalysis(data) {
  const all = db_read('PhanTichBai') || [];
  const id = db_nextId('PhanTichBai', 'PT');
  data.id = id;
  data.createdAt = nowStr();
  all.push(data);
  db_write('PhanTichBai', all);
  return id;
}

function mock_renewStudentSessions(hocVienId, extraSessions, newTotalSessions, opts) {
  opts = opts || {};
  const hvAll = db_read('HocVien') || [];
  const i = hvAll.findIndex(function(r) { return String(r.id) === String(hocVienId); });
  if (i === -1) throw new Error('Không tìm thấy học viên');
  const hv = hvAll[i];
  const currentKhoa = parseInt(hv.soBuoiKhoa || hv.soBuoiDeal, 10) || 0;
  const daHoc = parseInt(hv.soBuoiDaHoc, 10) || 0;
  const extra = parseInt(extraSessions, 10) || 0;
  if (extra <= 0) throw new Error('Số buổi gia hạn phải lớn hơn 0');
  const soKhoa = (parseInt(hv.soKhoaDaHoc, 10) || 1) + 1;
  const fee = (ME_.role === 'admin' && opts.hocPhi !== undefined) ? (parseFloat(opts.hocPhi) || 0) : (extra >= 12 ? 3500000 : (extra >= 8 ? 2500000 : 1750000));
  Object.assign(hv, { soBuoiKhoa: currentKhoa + extra, soBuoiDeal: extra, soBuoiConLai: Math.max(0, currentKhoa + extra - daHoc),
    soBuoiKhoaHienTai: extra, buoiDauKhoa: currentKhoa, soKhoaDaHoc: soKhoa, tinhTrang: 'Đang học', ngayKhoaMoi: nowStr(),
    hocPhi: fee, daDongHocPhi: false, tienMatDaThu: 0, loaiHocVien: soKhoa >= 3 ? 'STUDIED_MANY' : 'STUDIED_2_TERMS' });
  db_write('HocVien', hvAll);
  return { success: true, soBuoiKhoa: hv.soBuoiKhoa, soBuoiDaHoc: daHoc, soBuoiConLai: hv.soBuoiConLai, soKhoaDaHoc: soKhoa,
    soBuoiKhoaHienTai: extra, message: 'Đã mở khoá ' + soKhoa + ' (' + extra + ' buổi) cho ' + hv.hoTen + '. Còn lại: ' + hv.soBuoiConLai + ' buổi.' };
}

// Cấu hình dùng chung với phần lõi (bản preview)
function dashPayDue_() { return Math.max(1, parseInt((db_read('Settings') || {}).payDueSession, 10) || 2); }
function getClassList_() {
  const saved = ((db_read('Settings') || {}).classList || ['TN11', 'TN12', 'TNN', 'TN-VIP']).slice();
  (db_read('HocVien') || []).forEach(function(r){ const l = String(r.lop || '').trim(); if (l) saved.push(l); });
  return saved.filter(function(v, i){ return v && saved.indexOf(v) === i; }).sort();
}
function mock_createStudentDriveFolder(st) {
  return { success: true, folderName: (st.rank||'A')+'.'+(st.hoTen||'HV')+'.'+(st.lop||'TN')+'.01-01-2026', folderUrl: '#preview-drive-folder', message: '[Preview] Folder sẽ được tạo khi deploy lên Apps Script.' };
}

function mock_getTuitionSettlementData(month, year) {
  const now = new Date();
  const m = month ? parseInt(month, 10) : (now.getMonth() + 1);
  const y = year ? parseInt(year, 10) : now.getFullYear();
  const students = (db_read('HocVien') || []).filter(function(r) { return r.active !== false; });
  const allSessions = db_read('BuoiHoc') || [];
  const sessionsByStudent = {};
  allSessions.forEach(function(b) {
    const hId = String(b.hocVienId || '').trim();
    if (!sessionsByStudent[hId]) sessionsByStudent[hId] = [];
    sessionsByStudent[hId].push(b);
  });

  let totalTuition=0, totalLinh=0, totalQuan=0, totalCenter=0, totalCashCollected=0, unpaidCount=0, renewAlertCount=0;

  const studentList = students.map(function(s) {
    const sId = String(s.id || '').trim();
    const stSessions = sessionsByStudent[sId] || [];
    const totalDeal = parseInt(s.soBuoiKhoa || s.soBuoiDeal, 10) || 12;
    const attended = stSessions.length;
    const remaining = Math.max(0, totalDeal - attended);
    const tuition = parseFloat(s.hocPhi) || (totalDeal >= 8 ? 2500000 : 1750000);
    const isPaid = (String(s.daDongHocPhi).toUpperCase()==='TRUE' || s.daDongHocPhi===true || String(s.daDongHocPhi).toUpperCase()==='PAID');
    const cashCollected = parseFloat(s.tienMatDaThu) || 0;
    const gv = String(s.giaoVien || 'Linh').trim();
    const isPrimaryTeacher = (gv.toLowerCase().indexOf('quân') === -1 && gv.toLowerCase().indexOf('quan') === -1);
    const studentType = String(s.loaiHocVien || 'NEW').trim().toUpperCase();

    let paymentAlert = 'ACTIVE', paymentAlertText = 'Đang học', paymentAlertBadge = 'st-hoc';
    if (!isPaid) { paymentAlert = 'UNPAID'; paymentAlertText = 'Cần thu tiền'; paymentAlertBadge = 'st-nghi'; unpaidCount++; }
    else if (remaining <= 1) { paymentAlert = 'RENEW_SOON'; paymentAlertText = remaining === 0 ? 'Hết buổi' : 'Sắp đến hạn đóng'; paymentAlertBadge = 'st-done'; renewAlertCount++; }

    let teacherCommissionRate=0, teacherRevenue=0, centerRevenue=0, externalTeacherPay=0;
    if (isPrimaryTeacher) {
      teacherCommissionRate = (studentType === 'STUDIED_2_TERMS' || studentType === 'STUDIED_MANY') ? 0.70 : 0.60;
      teacherRevenue = Math.round(tuition * teacherCommissionRate);
      centerRevenue = Math.round(tuition - teacherRevenue - cashCollected);
      totalLinh += teacherRevenue;
      totalCashCollected += cashCollected;
    } else {
      externalTeacherPay = totalDeal * 150000;
      teacherRevenue = externalTeacherPay;
      centerRevenue = Math.round(tuition - externalTeacherPay);
      totalQuan += externalTeacherPay;
    }
    totalTuition += tuition;
    totalCenter += centerRevenue;

    return { id:sId, hoTen:s.hoTen||'—', lop:s.lop||'—', rank:s.rank||'A', giaoVien:gv, isPrimaryTeacher:isPrimaryTeacher, studentType:studentType, totalDealSessions:totalDeal, attendedSessionsCount:attended, remainingSessions:remaining, tuitionFee:tuition, isPaid:isPaid, cashCollected:cashCollected, paymentAlert:paymentAlert, paymentAlertText:paymentAlertText, paymentAlertBadge:paymentAlertBadge, teacherCommissionRate:teacherCommissionRate, teacherRevenue:teacherRevenue, centerRevenue:centerRevenue, externalTeacherPay:externalTeacherPay, linkDrive:s.linkDrive||'',
      sessions: stSessions.map(function(b) { return {id:b.id,buoiSo:b.buoiSo,ngayHoc:b.ngayHoc,baiHat:b.baiHat,nhanXet:b.nhanXet}; })
    };
  });

  const thoTransfersToLinh = Math.max(0, totalLinh - totalCashCollected);
  const monthStr = String(m).padStart(2, '0');
  const memoText = 'Thanh toan day nhac thang ' + monthStr + '/' + y;
  const uploadedQr = (db_read('Settings') || {}).qrImage || '';

  return {
    month:m, year:y,
    summary: { totalStudents:studentList.length, totalTuition:totalTuition, totalLinh:totalLinh, totalQuan:totalQuan, totalCenter:totalCenter, totalCashCollected:totalCashCollected, thoTransfersToLinh:thoTransfersToLinh, unpaidCount:unpaidCount, renewAlertCount:renewAlertCount },
    students: studentList,
    unpaidList: studentList.filter(function(s) { return !s.isPaid; }),
    renewPlanList: studentList.filter(function(s) { return s.remainingSessions <= 1; }),
    vietQr: {
      bank:'VIB', accountNumber:'140396', accountName:'NGUYEN QUANG LINH', amount:thoTransfersToLinh, memo:memoText,
      qrUploaded: !!uploadedQr,
      qrUrl: uploadedQr || ('https://img.vietqr.io/image/VIB-140396-compact2.png?amount='+thoTransfersToLinh+'&addInfo='+encodeURIComponent(memoText)+'&accountName=NGUYEN%20QUANG%20LINH')
    }
  };
}

function mock_updateTuitionPayment(hocVienId, isPaid, cashCollected) {
  const hvAll = db_read('HocVien') || [];
  const idx = hvAll.findIndex(function(r) { return String(r.id) === String(hocVienId); });
  if (idx !== -1) {
    hvAll[idx].daDongHocPhi = !!isPaid;
    if (cashCollected !== undefined && cashCollected !== null) hvAll[idx].tienMatDaThu = parseFloat(cashCollected) || 0;
    hvAll[idx].updatedAt = nowStr();
    db_write('HocVien', hvAll);
  }
  return { success: true, message: 'Đã cập nhật học phí!' };
}

function mock_quickCheckInAttendance(hocVienId, buoiSo, dateStr, notes) {
  const dStr = dateStr || nowStr();
  const data = { hocVienId: hocVienId, ngayHoc: dStr, buoiSo: buoiSo || 1, noiDung: notes || 'Điểm danh buổi học' };
  const id = mock_saveSession(data);
  const hvAll = db_read('HocVien') || [];
  const hv = hvAll.find(function(r) { return String(r.id) === String(hocVienId); });
  const cnt = (db_read('BuoiHoc')||[]).filter(function(r) { return String(r.hocVienId)===String(hocVienId); }).length;
  const soKhoa = hv ? (parseInt(hv.soBuoiKhoa || hv.soBuoiDeal, 10) || 0) : 0;
  const conLai = Math.max(0, soKhoa - cnt);
  return { success: true, sessionId: id, attended: cnt, remaining: conLai, message: 'Đã điểm danh buổi ' + (buoiSo || cnt) + '!' };
}

function mock_quickRemoveAttendance(hocVienId, buoiSo) {
  let all = db_read('BuoiHoc') || [];
  let deleted = false;
  all = all.filter(function(r) {
    if (!deleted && String(r.hocVienId).trim() === String(hocVienId).trim()) {
      if (buoiSo ? (String(r.buoiSo).trim() === String(buoiSo).trim()) : true) { deleted = true; return false; }
    }
    return true;
  });
  if (deleted) {
    db_write('BuoiHoc', all);
    const hvAll = db_read('HocVien') || [];
    const cnt = all.filter(function(r) { return String(r.hocVienId)===String(hocVienId); }).length;
    const hvIdx = hvAll.findIndex(function(r) { return String(r.id)===String(hocVienId); });
    if (hvIdx !== -1) {
      const soKhoa = parseInt(hvAll[hvIdx].soBuoiKhoa || hvAll[hvIdx].soBuoiDeal, 10) || 0;
      hvAll[hvIdx].soBuoiDaHoc = cnt;
      hvAll[hvIdx].soBuoiConLai = Math.max(0, soKhoa - cnt);
      db_write('HocVien', hvAll);
    }
    return { success: true, attended: cnt, remaining: Math.max(0, (parseInt((hvAll[hvIdx]||{}).soBuoiKhoa,10)||0) - cnt), message: 'Đã huỷ điểm danh!' };
  }
  return { success: false, message: 'Không tìm thấy buổi học' };
}

function mock_aiAnalyzeVoice(input) {
  return '[Preview Mode] AI sẽ phân tích khi deploy lên Apps Script.\n\n**1. Nhận xét năng lực**\nĐây là bản preview — phần phân tích AI Gemini sẽ hoạt động sau khi deploy.\n\n**2. Kỹ thuật nên học ngay**\n- Lip trill & hơi thở\n- Mixvoice cơ bản\n\n**3. Kỹ thuật chưa đủ điều kiện**\n- Belting nâng cao\n\n**4. Khuyến nghị lộ trình**\nGiai đoạn 1 (6 buổi): Nền tảng hơi thở & resonance.';
}

function mock_aiAnalyzeSong(input) {
  return '[Preview Mode] AI Phân tích bài hát sẽ hoạt động khi deploy.\n\n**Tông gốc & quãng bài**\nChưa có phân tích.\n\n**Gợi ý dịch tông**\nCần deploy Apps Script để sử dụng AI Gemini.';
}

function mock_qr(dataUrl) {
  const cfg = db_read('Settings') || {};
  if (dataUrl === undefined) return { dataUrl: cfg.qrImage || '' };
  cfg.qrImage = dataUrl;
  db_write('Settings', cfg);
  return { success: true, message: dataUrl ? 'Đã lưu ảnh mã QR thanh toán' : 'Đã xoá ảnh QR, quay về mã VietQR tự sinh' };
}

function mock_calendar(run) {
  return function(tuan, gvIds) {
    const n = schCellsOfWeek_(schMondayOf_(tuan), schIndex_(schLoadMeta_().khungGio))
      .filter(function(c){ return (c.loai === 'hoc' || c.loai === 'thu') && (ME_.role !== 'admin' ? c.giaoVienId === ME_.id : (gvIds || []).indexOf(c.giaoVienId) !== -1); }).length;
    if (run) return { success: true, created: n, updated: 0, removed: 0, keep: 0, errors: ['[Preview] Không có Google Calendar thật — khi deploy, ' + n + ' sự kiện sẽ được tạo.'], calendarName: 'Preview', calendarUrl: '#' };
    return { calendarName: 'Preview', create: n, update: 0, remove: 0, keep: 0, lines: ['[Preview] Sẽ tạo ' + n + ' sự kiện trên lịch "Tony Music Academy – Lịch dạy" khi chạy thật.'] };
  };
}

// ---- Học thử / Học nhóm (bản preview của các hàm trong Code.txt) ----
const MOCK_TRIAL_TEXT = { 'new': 'Đã học thử', 'tested': 'Đã học thử', 'waiting': 'Chờ phản hồi', 'rejected': 'Từ chối học' };

function mock_saveTrialStudent(data) {
  const all = db_read('HocVien') || [];
  const base = { hoTen: String(data.hoTen || '').trim(), dienThoai: data.dienThoai || '', loaiGiong: data.loaiGiong || '',
    ngayHocThu: data.ngayHocThu || nowStr(), nguonGioiThieu: data.nguonGioiThieu || '', ghiChu: data.ghiChu || '', updatedAt: nowStr() };
  if (!base.hoTen) return { success: false, message: 'Vui lòng nhập họ tên' };
  if (data.id) {
    const i = all.findIndex(function(r){ return String(r.id) === String(data.id); });
    if (i !== -1) { Object.assign(all[i], base); db_write('HocVien', all); }
    return { success: true, id: data.id, message: 'Đã cập nhật học viên học thử!' };
  }
  const id = db_nextId('HocVien', 'HV');
  all.push(Object.assign({ id: id, rank: '', tinhTrang: 'Đã học thử', trialStatus: 'new', soBuoiKhoa: 0, soBuoiDeal: 0,
    soBuoiDaHoc: 0, soBuoiConLai: 0, loaiHocVien: 'NEW', daDongHocPhi: false, active: true, createdAt: nowStr() }, base));
  db_write('HocVien', all);
  return { success: true, id: id, message: 'Đã thêm học viên học thử!' };
}

function mock_updateTrialStatus(id, status) {
  if (!MOCK_TRIAL_TEXT[status]) return { success: false, message: 'Trạng thái không hợp lệ' };
  const all = db_read('HocVien') || [];
  const i = all.findIndex(function(r){ return String(r.id) === String(id); });
  if (i !== -1) { all[i].trialStatus = status; all[i].tinhTrang = MOCK_TRIAL_TEXT[status]; db_write('HocVien', all); }
  return { success: true, message: 'Đã cập nhật trạng thái học thử' };
}

function mock_confirmTrialStudent(id, info) {
  info = info || {};
  const all = db_read('HocVien') || [];
  const i = all.findIndex(function(r){ return String(r.id) === String(id); });
  if (i === -1) return { success: false, message: 'Không tìm thấy học viên' };
  const soKhoa = parseInt(info.soBuoiKhoa, 10) || 8;
  Object.assign(all[i], { lop: info.lop || 'TN11', giaoVien: info.giaoVien || 'Linh', soBuoiKhoa: soKhoa, soBuoiDeal: soKhoa,
    soBuoiDaHoc: 0, soBuoiConLai: soKhoa, ngayBatDau: info.ngayBatDau || nowStr(), tinhTrang: 'Đang học', trialStatus: 'confirmed',
    rank: all[i].rank || 'A' });
  if (ME_.role === 'admin' && info.hocPhi !== undefined) { all[i].hocPhi = parseFloat(info.hocPhi) || 0; all[i].daDongHocPhi = !!info.daDongHocPhi; }
  db_write('HocVien', all);
  return { success: true, message: 'Đã chốt đăng ký! ' + all[i].hoTen + ' đã chuyển sang học viên chính thức.' };
}

function mock_saveGroupSession(common, members) {
  const groupId = 'GRP-' + Date.now();
  const ids = (members || []).map(function(mb){
    const hvId = String(mb.hocVienId || '').trim();
    let mbSongs = mb.songsJson;
    let mbBaiHat = mb.baiHat;
    let mbYt = mb.linkYoutube;

    if (!mbSongs && common && common.songsJson) {
      try {
        const allSongs = typeof common.songsJson === 'string' ? JSON.parse(common.songsJson) : common.songsJson;
        if (Array.isArray(allSongs)) {
          const filtered = allSongs.filter(function(s){
            return !s.hocVienId || String(s.hocVienId) === hvId;
          });
          if (filtered.length) {
            mbSongs = JSON.stringify(filtered);
            mbBaiHat = filtered.map(function(s){ return s.title; }).filter(Boolean).join(' / ') || (filtered[0] && filtered[0].title) || common.baiHat;
            mbYt = (filtered[0] && filtered[0].ytLink) || common.linkYoutube;
          }
        }
      } catch(e) {}
    }

    const payload = Object.assign({}, common, mb, {
      hocVienId: hvId,
      baiHat: mbBaiHat || common.baiHat,
      linkYoutube: mbYt || common.linkYoutube,
      songsJson: mbSongs || common.songsJson,
      groupSessionId: groupId,
      isGroupSession: true,
      buoiSo: (db_read('BuoiHoc') || []).filter(function(r){ return String(r.hocVienId) === hvId; }).length + 1
    });
    return mock_saveSession(payload);
  });
  return { success: true, ids: ids, message: 'Đã lưu buổi học nhóm cho ' + ids.length + ' học viên!' };
}

// Sheet XẾP LỊCH mẫu (theo ảnh chụp) để thử nút "Nhập lịch từ sheet"
function mock_getScheduleSheetData() {
  const T2 = ['18h-19h', 'Tuyển'], rows = [];
  const add = function(place, time, cells){ rows.push({ place: place, time: time, cells: cells }); };
  add('Dưới sảnh', '9h-10h', ['', '', '', '', '', '', '']);
  add('Dưới sảnh', '14h30-16h', ['', '', '', '', '', '', 'Sunny + Bí Ngô']);
  add('Dưới sảnh', '16h00-17h00', ['', '', '', '', '', '', 'Linh trống']);
  add('Trên phòng', T2[0], [T2[1], '', '', '', '', 'Quân trống', 'Quân trống']);
  add('Trên phòng', '19h-20h', ['Linh trống', '', '', 'Linh trống', '', 'Thịnh', 'Quân trống']);
  add('Trên phòng', '20h-21h', ['Linh trống', '', 'Linh trống', '', '', 'Thông', 'Quân trống']);
  add('Trên phòng', '21h-22h30', ['', '', '', '', '', 'Quân trống', '']);
  return { success: true, title: 'Từ Thứ Hai, 05/10 - Thứ Hai, 12/10', spreadsheetName: 'Preview', rows: rows, studentTeacherMap: {} };
}

// ---- Cổng RPC giống máy chủ ----
const API_MAP = {
  login: mock_login,
  whoAmI: function() { return ME_; },
  changeMyPassword: mock_changeMyPassword,
  getDashboard: mock_getDashboard,
  getStudents: mock_getStudents,
  getStudent: mock_getStudent,
  saveStudent: mock_saveStudent,
  deleteStudents: mock_deleteStudents,
  deleteStudent: function(id) { return mock_deleteStudents([id]); },
  cleanExpiredDriveFolders: mock_cleanExpiredDriveFolders,
  getUsers: mock_getUsers,
  saveUser: mock_saveUser,
  deleteUsers: mock_deleteUsers,
  getConfig: mock_getConfig,
  saveConfig: mock_saveConfig,
  saveSession: mock_saveSession,
  deleteSessions: mock_deleteSessions,
  saveVoiceAssessment: mock_saveVoiceAssessment,
  saveSongAnalysis: mock_saveSongAnalysis,
  renewStudentSessions: mock_renewStudentSessions,
  createStudentDriveFolder: mock_createStudentDriveFolder,
  getTuitionSettlementData: mock_getTuitionSettlementData,
  updateTuitionPayment: mock_updateTuitionPayment,
  quickCheckInAttendance: mock_quickCheckInAttendance,
  quickRemoveAttendance: mock_quickRemoveAttendance,
  aiAnalyzeVoice: mock_aiAnalyzeVoice,
  aiAnalyzeSong: mock_aiAnalyzeSong,
  getDbUrl: function() { return '#preview-mode'; },
  getQrImage: function() { return mock_qr(); },
  uploadQrImage: function(d) { return mock_qr(d); },
  removeQrImage: function() { return mock_qr(''); },
  importLegacyData: function() { return { success: true, report: {} }; },
  getDashboardV2: function() { return getDashboardV2_(); },
  getAppConfig: function() { return { groupClasses: (db_read('Settings') || {}).groupClasses || 'TN12', classList: getClassList_() }; },
  getScheduleSheetData: mock_getScheduleSheetData,
  saveTrialStudent: mock_saveTrialStudent,
  updateTrialStatus: mock_updateTrialStatus,
  confirmTrialStudent: mock_confirmTrialStudent,
  saveGroupSession: mock_saveGroupSession,
  // Quản lý Giáo viên & Khám phá
  getTeachers: mock_getTeachers,
  saveTeacher: mock_saveTeacher,
  deleteTeacher: function(id){ return mock_deleteTeachers([id]); },
  deleteTeachers: mock_deleteTeachers,
  getExercises: mock_getExercises,
  saveExercise: mock_saveExercise,
  deleteExercise: mock_deleteExercise,
  getDiscoverData: mock_getDiscoverData,
  getTechniqueCatalog: mock_getTechniqueCatalog,
  saveTechniqueCatalog: mock_saveTechniqueCatalog,
  getRouteSuggestion: mock_getRouteSuggestion,
  exportStudentReportPdf: mock_exportStudentReportPdf,
  // Lịch dạy — dùng thẳng hàm lõi nhúng từ Code.txt
  getScheduleBoard: function(t, c) { return getScheduleBoard_(t, c); },
  saveScheduleCells: function(t, ops) { return saveScheduleCells_(t, ops); },
  copyWeek: function(a, b, m, c) { return copyWeek_(a, b, m, c); },
  saveTimeSlot: function(s) { return saveTimeSlot_(s); },
  hideTimeSlot: function(id) { return hideTimeSlot_(id); },
  saveCoSo: function(c) { return saveCoSo_(c); },
  savePhong: function(p) { return savePhong_(p); },
  getMySchedule: function(id) { return getMySchedule_(id); },
  previewCalendarSync: mock_calendar(false),
  runCalendarSync: mock_calendar(true)
};

// Quyền giống API_RULES trong Code.txt (mặc định: Admin & Giảng viên)
const MOCK_RULES = {
  login: 'pub', whoAmI: 'any', changeMyPassword: 'any', getMySchedule: 'any',
  getTuitionSettlementData: 'admin', updateTuitionPayment: 'admin', getQrImage: 'admin', uploadQrImage: 'admin',
  removeQrImage: 'admin', importLegacyData: 'admin', saveTimeSlot: 'admin', hideTimeSlot: 'admin', saveCoSo: 'admin', savePhong: 'admin',
  saveTeacher: 'admin', deleteTeacher: 'admin', deleteTeachers: 'admin',
  getExercises: 'any', saveExercise: 'staff', deleteExercise: 'staff', getTeachers: 'staff',
  getDiscoverData: 'any', getTechniqueCatalog: 'any', saveTechniqueCatalog: 'staff',
  getRouteSuggestion: 'any', exportStudentReportPdf: ['students', 'view'],
  getConfig: ['settings', 'view'], saveConfig: ['settings', 'edit'], saveUser: ['settings', 'edit'], deleteUsers: ['settings', 'edit'],
  saveStudent: ['students', 'edit'], deleteStudents: ['students', 'delete'], deleteStudent: ['students', 'delete'],
  saveTrialStudent: ['students', 'edit'], updateTrialStatus: ['students', 'edit'], confirmTrialStudent: ['students', 'edit'],
  saveGroupSession: ['sessions', 'edit']
};

API_MAP.rpc = function(token, fnName, args) {
  try {
    const fn = API_MAP[fnName];
    const rule = MOCK_RULES[fnName] || 'staff';
    if (!fn || fnName === 'rpc') throw new Error('API không tồn tại: ' + fnName);
    ME_ = null;
    if (rule !== 'pub') {
      ME_ = mock_verify(token);
      if (!ME_) return { ok: false, auth: true, error: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.' };
      const staff = ME_.role === 'admin' || ME_.role === 'gv';
      let ok = true;
      if (rule === 'staff') ok = staff;
      if (rule === 'admin') ok = ME_.role === 'admin';
      if (Array.isArray(rule)) ok = ME_.role === 'admin' || (ME_.role !== 'hv' && !!(ME_.permissions[rule[0]] && ME_.permissions[rule[0]][rule[1]]));
      if (!ok) throw new Error('Bạn không có quyền thực hiện thao tác này');
    }
    const data = fn.apply(null, args || []);
    return { ok: true, data: data === undefined ? null : JSON.parse(JSON.stringify(data)) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
};

// google.script.run giả lập: chỉ cần .withSuccessHandler().withFailureHandler().rpc(...)
function mockRunner(succ, fail) {
  return new Proxy({}, {
    get: function(_, prop) {
      if (prop === 'withSuccessHandler') return function(h) { return mockRunner(h, fail); };
      if (prop === 'withFailureHandler') return function(h) { return mockRunner(succ, h); };
      if (prop === 'withUserObject') return function() { return mockRunner(succ, fail); };
      return function() {
        const args = Array.from(arguments);
        setTimeout(function() {
          try {
            if (!API_MAP[prop]) throw new Error('Mock chưa có hàm ' + String(prop));
            const result = API_MAP[prop].apply(null, args);
            if (succ) succ(result);
          } catch (e) {
            if (fail) fail(e); else console.error('Mock Error:', e);
          }
        }, 80);
      };
    }
  });
}
window.google = window.google || {};
window.google.script = window.google.script || {};
window.google.script.run = mockRunner(null, null);

// Lịch mẫu cho tuần hiện tại — chép theo ảnh sheet XẾP LỊCH. Gọi sau khi đoạn lõi đã được nhúng.
function seedDemoSchedule() {
  schEnsureSeed_();
  if ((db_read('LichXep') || []).length || localStorage.getItem(DB_PREFIX + 'demo_seeded')) return;
  const tuan = schMondayOf_(todayYmd_());
  const L = 'USR-000002', Q = 'USR-000003';
  const kg = function(n){ return 'KG-' + String(n).padStart(4, '0'); };
  const rows = [];
  const add = function(thu, k, loai, gv, hv){
    rows.push({ id: 'LX-demo-' + rows.length, tuan: tuan, thu: thu, khungGioId: kg(k), loai: loai, giaoVienId: gv,
                hocVienIds: JSON.stringify(hv || []), ghiChu: '', createdBy: 'USR-000001', updatedBy: 'USR-000001', updatedAt: '' });
  };
  add(1, 7, 'hoc', L, ['HV-000017']);
  [11, 12, 13, 14, 15, 16, 17].forEach(function(k){ add(1, k, 'trong', L); });
  add(2, 14, 'hoc', L, ['HV-000015', 'HV-000016']);
  add(3, 8, 'hoc', L, ['HV-000014', 'HV-000009']);
  [13, 14, 15, 16, 17].forEach(function(k){ add(3, k, 'trong', L); });
  add(4, 11, 'trong', L);
  add(4, 16, 'hoc', L, ['HV-000015', 'HV-000016']);
  [7, 8, 9, 10, 12, 13, 14, 16, 17, 18, 19].forEach(function(k){ add(6, k, 'trong', Q); });
  add(6, 11, 'hoc', Q, ['HV-000018']);
  add(6, 15, 'hoc', Q, ['HV-000013']);
  add(7, 5, 'hoc', L, ['HV-000014', 'HV-000009']);
  add(7, 6, 'trong', L);
  for (let k = 7; k <= 19; k++) add(7, k, 'trong', Q);
  writeRows_('LichXep', rows);

  // Vài buổi đã chấm phiếu (8 tiêu chí, thang 24) để khối "Tiến bộ tuần này" có dữ liệu
  const today = todayYmd_();
  const card = function(v){ return JSON.stringify({ pitch: v[0], rhythm: v[1], breath: v[2], tone: v[3], expression: v[4], focusSkill: v[5], homework: v[6], confidence: v[7] }); };
  const sum = function(v){ return v.reduce(function(a, b){ return a + b; }, 0); };
  const bh = [];
  const sess = function(hv, n, daysAgo, v, song, isGrp, grpId){
    const sTitle = song || 'Như Những Phút Ban Đầu';
    bh.push({
      id: 'BH-demo-' + bh.length,
      hocVienId: hv,
      buoiSo: n,
      ngayHoc: schAddDays_(today, -daysAgo),
      scoreCardJson: card(v),
      totalScore: sum(v),
      baiHat: sTitle,
      linkYoutube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      songsJson: JSON.stringify([{title: sTitle, ytLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', hocVienId: hv}]),
      techsJson: JSON.stringify([{name: 'Lip trill & Hơi thở nén cơ hoành', ytLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}]),
      isGroupSession: !!isGrp,
      groupSessionId: grpId || ''
    });
  };
  sess('HV-000009', 3, 9, [2, 2, 1, 2, 2, 2, 2, 2], 'Có Chàng Trai Viết Lên Cây');
  sess('HV-000009', 4, 2, [3, 2, 2, 3, 2, 3, 2, 3], 'Ngày Chưa Giông Bão');
  sess('HV-000014', 3, 8, [2, 3, 2, 2, 3, 2, 2, 2], 'Chạm Đáy Nỗi Đau');
  sess('HV-000014', 4, 1, [3, 3, 2, 3, 3, 2, 2, 3], 'Một Bước Yêu Vạn Dặm Đau');
  // Học nhóm TN12: Hưng và Thông
  sess('HV-000011', 2, 10, [3, 2, 3, 2, 2, 3, 2, 2], 'Nơi Tình Yêu Bắt Đầu', true, 'GRP-demo-1');
  sess('HV-000011', 3, 3, [2, 2, 1, 2, 2, 2, 2, 2], 'Phía Sau Một Cô Gái', true, 'GRP-demo-2');
  sess('HV-000013', 1, 4, [2, 2, 2, 2, 2, 2, 2, 2], 'Cơn Mưa Băng Giá', true, 'GRP-demo-1');
  writeRows_('BuoiHoc', bh);
  localStorage.setItem(DB_PREFIX + 'demo_seeded', '1');
}

// Utility: Reset toàn bộ DB về seed data (dùng khi test)
window.__resetPreviewDB = function() {
  Object.keys(localStorage).forEach(function(k) { if (k.indexOf(DB_PREFIX) === 0) localStorage.removeItem(k); });
  localStorage.setItem('tma_token', 'mock|user|USR-000001');
  location.reload();
};

// Tự động đăng nhập Admin khi mở preview nếu chưa có token
try {
  if (!localStorage.getItem('tma_token')) {
    localStorage.setItem('tma_token', 'mock|user|USR-000001');
  }
} catch(e) {}

console.log('%c🎵 Tony Music Academy — PREVIEW MODE (Quyền Admin)', 'color:#C5A059;font-size:16px;font-weight:bold');
console.log('%cĐang mở với tài khoản Admin toàn quyền. Gõ __resetPreviewDB() để reset dữ liệu.', 'color:#34D399;font-size:12px');
