// ==================== MOCK BACKEND — localStorage ====================
// Thay thế google.script.run để chạy preview.html offline.
// Phần lõi Lịch dạy KHÔNG viết lại ở đây: build_preview.js nhúng nguyên văn đoạn
// [SHARED-SCHEDULE-BEGIN] … [SHARED-SCHEDULE-END] từ Code.txt ngay sau file này,
// nên luật xung đột trong preview giống hệt bản chạy thật.

window.__PREVIEW_MODE = true;
const DB_PREFIX = 'tony_db_';

const T = {
  HocVien: 'HocVien', BuoiHoc: 'BuoiHoc', DanhGiaGiong: 'DanhGiaGiong', PhanTichBai: 'PhanTichBai',
  Users: 'Users', Settings: 'Settings', CoSo: 'CoSo', Phong: 'Phong', KhungGio: 'KhungGio', LichXep: 'LichXep'
};

// ---- Seed Data ----
const SEED_STUDENTS = [
  {id:'HV-000001',hoTen:'My',rank:'D',tinhTrang:'Đã hoàn thành',lop:'TNN',giaoVien:'Linh',ngayBatDau:'2025-11-27',soBuoiKhoa:12,soBuoiDeal:12,soBuoiDaHoc:12,soBuoiConLai:0,loaiGiong:'Nữ trung',loaiHocVien:'STUDIED_MANY',noteThap:'G3',noteCao:'D6',quangGiong:'G3 - D6',chestVoice:'G3 - C4',mixVoice:'C#4 - F5',falsetto:'F#5 - D6',headVoice:'D5 - A5',whistleVoice:'C6 - D6',hocPhi:3500000,daDongHocPhi:true,tienMatDaThu:0,active:true,linkDrive:'https://drive.google.com/drive/folders/1yc-eR-6QjJmPXMvGn4WSrhDX5gCxVcYH'},
  {id:'HV-000002',hoTen:'An',rank:'C',tinhTrang:'Đã hoàn thành',lop:'TNN',giaoVien:'Linh',ngayBatDau:'2025-12-02',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:6,soBuoiConLai:0,loaiGiong:'Nữ cao',loaiHocVien:'STUDIED_2_TERMS',noteThap:'A3',noteCao:'C6',quangGiong:'A3 - C6',chestVoice:'A3 - D4',mixVoice:'Eb4 - G5',falsetto:'Ab5 - C6',headVoice:'E5 - B5',whistleVoice:'',hocPhi:1750000,daDongHocPhi:true,tienMatDaThu:0,active:true,linkDrive:'https://drive.google.com/drive/folders/1mx7zB7w8k52Vdyelxy6yG8BzFDpA6Cea'},
  {id:'HV-000003',hoTen:'Chị Yên',rank:'A',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',ngayBatDau:'2025-12-26',ngayKhoaMoi:'2026-09-02',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:2,soBuoiConLai:4,loaiGiong:'Nữ trung',loaiHocVien:'STUDIED_2_TERMS',noteThap:'F3',noteCao:'E6',quangGiong:'F3 - E6',chestVoice:'F3 - C4',mixVoice:'Db4 - G5',falsetto:'Ab5 - E6',headVoice:'Eb5 - C6',whistleVoice:'C6 - E6',hocPhi:1750000,daDongHocPhi:true,tienMatDaThu:500000,active:true,linkDrive:'https://drive.google.com/drive/folders/1ijFMnhWjomA9Z_DoXbj6YrGqY69ZvuuG'},
  {id:'HV-000004',hoTen:'Kiến Quốc',rank:'C',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',ngayBatDau:'2026-03-11',ngayKhoaMoi:'2026-09-02',soBuoiKhoa:8,soBuoiDeal:8,soBuoiDaHoc:3,soBuoiConLai:5,loaiGiong:'Nam cao',loaiHocVien:'NEW',noteThap:'G2',noteCao:'B4',quangGiong:'G2 - B4',chestVoice:'G2 - E4',mixVoice:'F4 - A4',falsetto:'A4 - D5',headVoice:'G4 - B4',whistleVoice:'',hocPhi:2500000,daDongHocPhi:true,tienMatDaThu:0,active:true,linkDrive:'https://drive.google.com/drive/folders/1b_AgCcSL9BdBpVgfvt9BouWyvRVEDhs7'},
  {id:'HV-000005',hoTen:'A Minh Anh',rank:'A',tinhTrang:'Đã hoàn thành',lop:'TN11',giaoVien:'Linh',ngayBatDau:'2026-03-22',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:6,soBuoiConLai:0,loaiGiong:'Nam trung',loaiHocVien:'NEW',noteThap:'E2',noteCao:'G4',quangGiong:'E2 - G4',chestVoice:'E2 - D4',mixVoice:'Eb4 - G4',falsetto:'Ab4 - C5',headVoice:'F4 - A4',whistleVoice:'',hocPhi:1750000,daDongHocPhi:true,tienMatDaThu:0,active:true,linkDrive:'https://drive.google.com/drive/folders/1c5XAm_pRLssPHyUfcOFVZXJObyd9bmtu'},
  {id:'HV-000006',hoTen:'Anh Thuận',rank:'A',tinhTrang:'Đã hoàn thành',lop:'TN11',giaoVien:'Linh',ngayBatDau:'2026-03-12',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:6,soBuoiConLai:0,loaiGiong:'Nam trầm',loaiHocVien:'NEW',noteThap:'C2',noteCao:'F4',quangGiong:'C2 - F4',chestVoice:'C2 - C4',mixVoice:'Db4 - F4',falsetto:'F#4 - B4',headVoice:'E4 - G4',whistleVoice:'',hocPhi:1750000,daDongHocPhi:true,tienMatDaThu:0,active:true,linkDrive:'https://drive.google.com/drive/folders/1FxQLUvfpd4rxR43zsJCCoOiOkk8puvnZ'},
  {id:'HV-000007',hoTen:'Giang',rank:'C',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',ngayBatDau:'2026-04-06',ngayKhoaMoi:'2026-09-02',soBuoiKhoa:12,soBuoiDeal:12,soBuoiDaHoc:5,soBuoiConLai:7,loaiGiong:'Nữ cao',loaiHocVien:'STUDIED_MANY',noteThap:'B3',noteCao:'F6',quangGiong:'B3 - F6',chestVoice:'B3 - E4',mixVoice:'F4 - A5',falsetto:'Bb5 - F6',headVoice:'F5 - C6',whistleVoice:'C6 - F6',hocPhi:3500000,daDongHocPhi:true,tienMatDaThu:1000000,active:true,linkDrive:'https://drive.google.com/drive/folders/1JZ72USn6pOI0IpKnPlG_820_7Az84yMh'},
  {id:'HV-000008',hoTen:'Sơn',rank:'C',tinhTrang:'Đã học thử',lop:'TN11',giaoVien:'Linh',soBuoiKhoa:0,soBuoiDeal:0,soBuoiDaHoc:1,soBuoiConLai:0,loaiGiong:'Nam trung',loaiHocVien:'NEW',noteThap:'F2',noteCao:'F4',quangGiong:'F2 - F4',chestVoice:'F2 - D4',mixVoice:'Eb4 - F4',falsetto:'G4 - Bb4',headVoice:'Eb4 - G4',whistleVoice:'',hocPhi:1750000,daDongHocPhi:false,tienMatDaThu:0,active:true},
  {id:'HV-000009',hoTen:'Bí ngô',username:'bingo',password:'123456',rank:'B',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',ngayBatDau:'2026-06-17',ngayKhoaMoi:'2026-09-02',soBuoiKhoa:8,soBuoiDeal:8,soBuoiDaHoc:4,soBuoiConLai:4,loaiGiong:'Nữ trung',loaiHocVien:'NEW',noteThap:'A3',noteCao:'B5',quangGiong:'A3 - B5',chestVoice:'A3 - D4',mixVoice:'Eb4 - G5',falsetto:'Ab5 - B5',headVoice:'E5 - A5',whistleVoice:'',hocPhi:2500000,daDongHocPhi:true,tienMatDaThu:0,active:true,linkDrive:'https://drive.google.com/drive/folders/102L39D7iZl7MBfMngLeXBTslTEdLaGg6'},
  {id:'HV-000010',hoTen:'Quyên Quyên',rank:'D',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',ngayBatDau:'2026-07-08',ngayKhoaMoi:'2026-07-08',soBuoiKhoa:8,soBuoiDeal:8,soBuoiDaHoc:2,soBuoiConLai:6,loaiGiong:'Nữ cao',loaiHocVien:'NEW',noteThap:'Bb3',noteCao:'C6',quangGiong:'Bb3 - C6',chestVoice:'Bb3 - Eb4',mixVoice:'E4 - Ab5',falsetto:'A5 - C6',headVoice:'F5 - Bb5',whistleVoice:'',hocPhi:2500000,daDongHocPhi:false,tienMatDaThu:0,active:true,linkDrive:'https://drive.google.com/drive/folders/10OekX2G908eK8Y_qDbLoP5UCw6KECWHs'},
  {id:'HV-000011',hoTen:'Hưng',rank:'C',tinhTrang:'Đang học',lop:'TN12',giaoVien:'Quân',ngayBatDau:'2026-07-23',ngayKhoaMoi:'2026-09-02',soBuoiKhoa:8,soBuoiDeal:8,soBuoiDaHoc:3,soBuoiConLai:5,loaiGiong:'Nam cao',loaiHocVien:'NEW',noteThap:'A2',noteCao:'A4',quangGiong:'A2 - A4',chestVoice:'A2 - E4',mixVoice:'F4 - A4',falsetto:'Bb4 - D5',headVoice:'G4 - B4',whistleVoice:'',hocPhi:2500000,daDongHocPhi:true,tienMatDaThu:0,active:true},
  {id:'HV-000012',hoTen:'Nhi',rank:'B',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Quân',ngayBatDau:'2026-07-13',ngayKhoaMoi:'2026-07-13',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:2,soBuoiConLai:4,loaiGiong:'Nữ cao',loaiHocVien:'NEW',noteThap:'A3',noteCao:'D6',quangGiong:'A3 - D6',chestVoice:'A3 - D4',mixVoice:'Eb4 - G5',falsetto:'Ab5 - D6',headVoice:'E5 - B5',whistleVoice:'',hocPhi:1750000,daDongHocPhi:true,tienMatDaThu:0,active:true,linkDrive:'https://drive.google.com/drive/folders/1d-mSWz59uhrR6FbYWmuRKcK1gTprkNYr'},
  {id:'HV-000013',hoTen:'Thông',username:'thong',password:'123456',rank:'A',tinhTrang:'Đang học',lop:'TN12',giaoVien:'Quân',ngayBatDau:'2026-08-22',ngayKhoaMoi:'2026-08-22',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:1,soBuoiConLai:5,loaiGiong:'Nam trung',loaiHocVien:'NEW',noteThap:'E2',noteCao:'G4',quangGiong:'E2 - G4',chestVoice:'E2 - D4',mixVoice:'Eb4 - G4',falsetto:'G#4 - C5',headVoice:'F4 - A4',whistleVoice:'',hocPhi:1750000,daDongHocPhi:true,tienMatDaThu:0,active:true},
  {id:'HV-000014',hoTen:'Sunny',rank:'B',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',ngayBatDau:'2026-09-02',soBuoiKhoa:8,soBuoiDeal:8,soBuoiDaHoc:4,soBuoiConLai:4,loaiHocVien:'NEW',hocPhi:2500000,daDongHocPhi:true,tienMatDaThu:0,active:true},
  {id:'HV-000015',hoTen:'Phượng',rank:'A',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',ngayBatDau:'2026-09-24',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:3,soBuoiConLai:3,loaiHocVien:'NEW',hocPhi:1750000,daDongHocPhi:true,tienMatDaThu:0,active:true},
  {id:'HV-000016',hoTen:'Lam',rank:'A',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',ngayBatDau:'2026-09-24',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:3,soBuoiConLai:3,loaiHocVien:'NEW',hocPhi:1750000,daDongHocPhi:true,tienMatDaThu:0,active:true},
  {id:'HV-000017',hoTen:'Tuyển',rank:'A',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',ngayBatDau:'2026-09-28',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:1,soBuoiConLai:5,loaiHocVien:'NEW',hocPhi:1750000,daDongHocPhi:false,tienMatDaThu:0,active:true},
  {id:'HV-000018',hoTen:'Thịnh',rank:'B',tinhTrang:'Đang học',lop:'TN12',giaoVien:'Quân',ngayBatDau:'2026-09-15',soBuoiKhoa:8,soBuoiDeal:8,soBuoiDaHoc:2,soBuoiConLai:6,loaiHocVien:'NEW',hocPhi:2500000,daDongHocPhi:true,tienMatDaThu:0,active:true}
];

const DEFAULT_PERMS_ADMIN = {students:{view:true,edit:true,delete:true},sessions:{view:true,edit:true,delete:true},voice:{view:true,edit:true,delete:true},songs:{view:true,edit:true,delete:true},settings:{view:true,edit:true,delete:true}};
const DEFAULT_PERMS_GV = {students:{view:true,edit:true,delete:false},sessions:{view:true,edit:true,delete:true},voice:{view:true,edit:true,delete:true},songs:{view:true,edit:true,delete:true},settings:{view:false,edit:false,delete:false}};

const SEED_USERS = [
  {id:'USR-000001',username:'admin',password:'123',hoTen:'Quản trị viên (Admin)',role:'admin',email:'admin@tonymusic.vn',permissions:DEFAULT_PERMS_ADMIN,active:true},
  {id:'USR-000002',username:'linh',password:'123',hoTen:'Giảng viên Linh',role:'gv',email:'linh@tonymusic.vn',permissions:DEFAULT_PERMS_GV,active:true},
  {id:'USR-000003',username:'quan',password:'123',hoTen:'Giảng viên Quân',role:'gv',email:'quan@tonymusic.vn',permissions:DEFAULT_PERMS_GV,active:true}
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
  if (!db_read('BuoiHoc')) db_write('BuoiHoc', []);
  if (!db_read('DanhGiaGiong')) db_write('DanhGiaGiong', []);
  if (!db_read('PhanTichBai')) db_write('PhanTichBai', []);
  if (!db_read('Users')) db_write('Users', SEED_USERS);
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

// ---- Mock API implementations ----
function mock_getStudents() {
  return (db_read('HocVien') || []).filter(function(r) { return r.active !== false; }).map(function(r){
    const o = Object.assign({}, r);
    o.coMatKhau = !!o.password;
    delete o.password;
    return o;
  });
}

function mock_getStudent(id) {
  const all = db_read('HocVien') || [];
  const s = all.find(function(r) { return String(r.id) === String(id); });
  if (!s) return null;
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
  const hv = (db_read('HocVien') || []).filter(function(r) { return r.active !== false; });
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

function mock_getConfig() {
  const cfg = db_read('Settings') || {};
  return {
    geminiApiKey: cfg.geminiApiKey || '',
    geminiModel: cfg.geminiModel || 'gemini-2.0-flash',
    sharedDriveLink: cfg.sharedDriveLink || '',
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
  if (data.id && String(data.id).trim() !== '') {
    const idx = all.findIndex(function(r) { return String(r.id) === String(data.id); });
    if (idx !== -1) { all[idx] = Object.assign(all[idx], data); db_write('BuoiHoc', all); }
    return data.id;
  }
  const id = db_nextId('BuoiHoc', 'BH');
  data.id = id;
  data.createdAt = nowStr();
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

function mock_renewStudentSessions(hocVienId, extraSessions, newTotalSessions) {
  const hvAll = db_read('HocVien') || [];
  const hvIdx = hvAll.findIndex(function(r) { return String(r.id) === String(hocVienId); });
  if (hvIdx === -1) return { success: false, message: 'Không tìm thấy học viên' };
  const hv = hvAll[hvIdx];

  let currentKhoa = parseInt(hv.soBuoiKhoa || hv.soBuoiDeal, 10) || 0;
  let daHoc = parseInt(hv.soBuoiDaHoc, 10) || 0;
  let finalKhoa = currentKhoa;

  if (newTotalSessions != null && parseInt(newTotalSessions, 10) > 0) {
    finalKhoa = parseInt(newTotalSessions, 10);
  } else if (extraSessions != null && parseInt(extraSessions, 10) > 0) {
    finalKhoa = currentKhoa + parseInt(extraSessions, 10);
  }

  const conLai = Math.max(0, finalKhoa - daHoc);
  hvAll[hvIdx].soBuoiKhoa = finalKhoa;
  hvAll[hvIdx].soBuoiDeal = finalKhoa;
  hvAll[hvIdx].soBuoiConLai = conLai;
  hvAll[hvIdx].tinhTrang = 'Đang học';
  hvAll[hvIdx].ngayKhoaMoi = nowStr();
  hvAll[hvIdx].updatedAt = nowStr();
  db_write('HocVien', hvAll);

  return { success: true, soBuoiKhoa: finalKhoa, soBuoiDaHoc: daHoc, soBuoiConLai: conLai, message: 'Đã gia hạn khoá học thành công! Tổng: ' + finalKhoa + ' (Còn lại: ' + conLai + ')' };
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
  getConfig: ['settings', 'view'], saveConfig: ['settings', 'edit'], saveUser: ['settings', 'edit'], deleteUsers: ['settings', 'edit'],
  saveStudent: ['students', 'edit'], deleteStudents: ['students', 'delete'], deleteStudent: ['students', 'delete']
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
      if (Array.isArray(rule)) ok = ME_.role === 'admin' || (staff && !!(ME_.permissions[rule[0]] && ME_.permissions[rule[0]][rule[1]]));
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
  localStorage.setItem(DB_PREFIX + 'demo_seeded', '1');
}

// Utility: Reset toàn bộ DB về seed data (dùng khi test)
window.__resetPreviewDB = function() {
  Object.keys(localStorage).forEach(function(k) { if (k.indexOf(DB_PREFIX) === 0) localStorage.removeItem(k); });
  localStorage.removeItem('tma_token');
  location.reload();
};

console.log('%c🎵 Tony Music Academy — PREVIEW MODE', 'color:#C5A059;font-size:16px;font-weight:bold');
console.log('%cĐăng nhập: admin/123 · linh/123 · quan/123 · học viên bingo/123456 · thong/123456. Gõ __resetPreviewDB() để reset.', 'color:#34D399;font-size:12px');
