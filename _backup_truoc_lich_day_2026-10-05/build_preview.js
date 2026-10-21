/**
 * build_preview.js — Tạo file preview.html độc lập để test local
 * Chạy: node build_preview.js
 *
 * File preview.html sẽ:
 * - Inline toàn bộ CSS + JS
 * - Thay thế google.script.run bằng mock localStorage backend
 * - Có sẵn seed data để test ngay
 */

const fs = require('fs');

// Đọc các file nguồn
const indexHtml = fs.readFileSync('index.txt', 'utf8');
const styleContent = fs.readFileSync('Stylesheet.html', 'utf8');
const jsContent = fs.readFileSync('JavaScript.html', 'utf8');

// ===== MOCK BACKEND (thay thế google.script.run) =====
const mockBackend = `
<script>
// ==================== MOCK BACKEND — localStorage ====================
// Thay thế hoàn toàn google.script.run để chạy offline

const DB_PREFIX = 'tony_db_';

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
  {id:'HV-000009',hoTen:'Bí ngô',rank:'B',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',ngayBatDau:'2026-06-17',ngayKhoaMoi:'2026-09-02',soBuoiKhoa:8,soBuoiDeal:8,soBuoiDaHoc:4,soBuoiConLai:4,loaiGiong:'Nữ trung',loaiHocVien:'NEW',noteThap:'A3',noteCao:'B5',quangGiong:'A3 - B5',chestVoice:'A3 - D4',mixVoice:'Eb4 - G5',falsetto:'Ab5 - B5',headVoice:'E5 - A5',whistleVoice:'',hocPhi:2500000,daDongHocPhi:true,tienMatDaThu:0,active:true,linkDrive:'https://drive.google.com/drive/folders/102L39D7iZl7MBfMngLeXBTslTEdLaGg6'},
  {id:'HV-000010',hoTen:'Quyên Quyên',rank:'D',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',ngayBatDau:'2026-07-08',ngayKhoaMoi:'2026-07-08',soBuoiKhoa:8,soBuoiDeal:8,soBuoiDaHoc:2,soBuoiConLai:6,loaiGiong:'Nữ cao',loaiHocVien:'NEW',noteThap:'Bb3',noteCao:'C6',quangGiong:'Bb3 - C6',chestVoice:'Bb3 - Eb4',mixVoice:'E4 - Ab5',falsetto:'A5 - C6',headVoice:'F5 - Bb5',whistleVoice:'',hocPhi:2500000,daDongHocPhi:false,tienMatDaThu:0,active:true,linkDrive:'https://drive.google.com/drive/folders/10OekX2G908eK8Y_qDbLoP5UCw6KECWHs'},
  {id:'HV-000011',hoTen:'Hưng',rank:'C',tinhTrang:'Đang học',lop:'TN12',giaoVien:'Quân',ngayBatDau:'2026-07-23',ngayKhoaMoi:'2026-09-02',soBuoiKhoa:8,soBuoiDeal:8,soBuoiDaHoc:3,soBuoiConLai:5,loaiGiong:'Nam cao',loaiHocVien:'NEW',noteThap:'A2',noteCao:'A4',quangGiong:'A2 - A4',chestVoice:'A2 - E4',mixVoice:'F4 - A4',falsetto:'Bb4 - D5',headVoice:'G4 - B4',whistleVoice:'',hocPhi:2500000,daDongHocPhi:true,tienMatDaThu:0,active:true},
  {id:'HV-000012',hoTen:'Nhi',rank:'B',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Quân',ngayBatDau:'2026-07-13',ngayKhoaMoi:'2026-07-13',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:2,soBuoiConLai:4,loaiGiong:'Nữ cao',loaiHocVien:'NEW',noteThap:'A3',noteCao:'D6',quangGiong:'A3 - D6',chestVoice:'A3 - D4',mixVoice:'Eb4 - G5',falsetto:'Ab5 - D6',headVoice:'E5 - B5',whistleVoice:'',hocPhi:1750000,daDongHocPhi:true,tienMatDaThu:0,active:true,linkDrive:'https://drive.google.com/drive/folders/1d-mSWz59uhrR6FbYWmuRKcK1gTprkNYr'},
  {id:'HV-000013',hoTen:'Thông',rank:'A',tinhTrang:'Đang học',lop:'TN12',giaoVien:'Quân',ngayBatDau:'2026-08-22',ngayKhoaMoi:'2026-08-22',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:1,soBuoiConLai:5,loaiGiong:'Nam trung',loaiHocVien:'NEW',noteThap:'E2',noteCao:'G4',quangGiong:'E2 - G4',chestVoice:'E2 - D4',mixVoice:'Eb4 - G4',falsetto:'G#4 - C5',headVoice:'F4 - A4',whistleVoice:'',hocPhi:1750000,daDongHocPhi:true,tienMatDaThu:0,active:true}
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
}
db_init();

function db_nextId(table, prefix) {
  const rows = db_read(table) || [];
  let max = 0;
  rows.forEach(function(r) {
    const m = String(r.id || '').match(/(\\d+)$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return prefix + '-' + String(max + 1).padStart(6, '0');
}

function nowStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

// ---- Mock API implementations ----
function mock_getStudents() {
  return (db_read('HocVien') || []).filter(function(r) { return r.active !== false; });
}

function mock_getStudent(id) {
  const all = db_read('HocVien') || [];
  const s = all.find(function(r) { return String(r.id) === String(id); });
  if (!s) return null;
  const out = Object.assign({}, s);
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

  // Xoá HocVien
  let hv = db_read('HocVien') || [];
  hv = hv.filter(function(r) { return idStrs.indexOf(String(r.id || '').trim()) === -1; });
  db_write('HocVien', hv);

  // Xoá BuoiHoc liên quan
  let bh = db_read('BuoiHoc') || [];
  bh = bh.filter(function(r) { return idStrs.indexOf(String(r.hocVienId || '').trim()) === -1; });
  db_write('BuoiHoc', bh);

  // Xoá DanhGiaGiong & PhanTichBai
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
  return (db_read('Users') || []).filter(function(u) { return u.active !== false; });
}

function mock_saveUser(u) {
  const all = db_read('Users') || [];
  if (u.id) {
    const idx = all.findIndex(function(r) { return String(r.id) === String(u.id); });
    if (idx !== -1) {
      if (u.permissions && typeof u.permissions === 'string') { try { u.permissions = JSON.parse(u.permissions); } catch(e){} }
      all[idx] = Object.assign(all[idx], u, { updatedAt: nowStr() });
      db_write('Users', all);
      return { success: true, id: u.id, message: 'Đã cập nhật người dùng!' };
    }
  }
  const id = db_nextId('Users', 'USR');
  u.id = id;
  u.active = true;
  u.createdAt = nowStr();
  u.updatedAt = nowStr();
  if (u.permissions && typeof u.permissions === 'string') { try { u.permissions = JSON.parse(u.permissions); } catch(e){} }
  if (!u.permissions) u.permissions = DEFAULT_PERMS_GV;
  all.push(u);
  db_write('Users', all);
  return { success: true, id: id, message: 'Đã tạo người dùng mới!' };
}

function mock_deleteUsers(ids) {
  if (!Array.isArray(ids)) ids = [ids];
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

  // Update student session count
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

  // Sync to student
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

  return {
    month:m, year:y,
    summary: { totalStudents:studentList.length, totalTuition:totalTuition, totalLinh:totalLinh, totalQuan:totalQuan, totalCenter:totalCenter, totalCashCollected:totalCashCollected, thoTransfersToLinh:thoTransfersToLinh, unpaidCount:unpaidCount, renewAlertCount:renewAlertCount },
    students: studentList,
    unpaidList: studentList.filter(function(s) { return !s.isPaid; }),
    renewPlanList: studentList.filter(function(s) { return s.remainingSessions <= 1; }),
    vietQr: {
      bank:'VIB', accountNumber:'140396', accountName:'NGUYEN QUANG LINH', amount:thoTransfersToLinh, memo:memoText,
      qrUrl:'https://img.vietqr.io/image/VIB-140396-compact2.png?amount='+thoTransfersToLinh+'&addInfo='+encodeURIComponent(memoText)+'&accountName=NGUYEN%20QUANG%20LINH'
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
  return '[Preview Mode] AI sẽ phân tích khi deploy lên Apps Script.\\n\\n**1. Nhận xét năng lực**\\nĐây là bản preview — phần phân tích AI Gemini sẽ hoạt động sau khi deploy.\\n\\n**2. Kỹ thuật nên học ngay**\\n- Lip trill & hơi thở\\n- Mixvoice cơ bản\\n\\n**3. Kỹ thuật chưa đủ điều kiện**\\n- Belting nâng cao\\n\\n**4. Khuyến nghị lộ trình**\\nGiai đoạn 1 (6 buổi): Nền tảng hơi thở & resonance.';
}

function mock_aiAnalyzeSong(input) {
  return '[Preview Mode] AI Phân tích bài hát sẽ hoạt động khi deploy.\\n\\n**Tông gốc & quãng bài**\\nChưa có phân tích.\\n\\n**Gợi ý dịch tông**\\nCần deploy Apps Script để sử dụng AI Gemini.';
}

// ---- google.script.run Proxy ----
const API_MAP = {
  getDashboard: function() { return mock_getDashboard(); },
  getStudents: function() { return mock_getStudents(); },
  getStudent: function(id) { return mock_getStudent(id); },
  saveStudent: function(d) { return mock_saveStudent(d); },
  deleteStudents: function(ids) { return mock_deleteStudents(ids); },
  deleteStudent: function(id) { return mock_deleteStudents([id]); },
  getUsers: function() { return mock_getUsers(); },
  saveUser: function(u) { return mock_saveUser(u); },
  deleteUsers: function(ids) { return mock_deleteUsers(ids); },
  getConfig: function() { return mock_getConfig(); },
  saveConfig: function(cfg) { return mock_saveConfig(cfg); },
  saveSession: function(d) { return mock_saveSession(d); },
  deleteSessions: function(sIds, hvId) { return mock_deleteSessions(sIds, hvId); },
  saveVoiceAssessment: function(d) { return mock_saveVoiceAssessment(d); },
  saveSongAnalysis: function(d) { return mock_saveSongAnalysis(d); },
  renewStudentSessions: function(hvId, extra, newTotal) { return mock_renewStudentSessions(hvId, extra, newTotal); },
  createStudentDriveFolder: function(st) { return mock_createStudentDriveFolder(st); },
  getTuitionSettlementData: function(m, y) { return mock_getTuitionSettlementData(m, y); },
  updateTuitionPayment: function(hvId, isPaid, cash) { return mock_updateTuitionPayment(hvId, isPaid, cash); },
  quickCheckInAttendance: function(hvId, b, d, n) { return mock_quickCheckInAttendance(hvId, b, d, n); },
  quickRemoveAttendance: function(hvId, b) { return mock_quickRemoveAttendance(hvId, b); },
  aiAnalyzeVoice: function(d) { return mock_aiAnalyzeVoice(d); },
  aiAnalyzeSong: function(d) { return mock_aiAnalyzeSong(d); },
  getDbUrl: function() { return '#preview-mode'; }
};

// Tạo google.script.run mock object hoàn chỉnh
window.google = window.google || {};
window.google.script = window.google.script || {};
window.google.script.run = new Proxy({}, {
  get: function(target, prop) {
    if (prop === 'withSuccessHandler') {
      return function(successFn) {
        return new Proxy({}, {
          get: function(_, fnName) {
            if (fnName === 'withFailureHandler') {
              return function(failFn) {
                return new Proxy({}, {
                  get: function(__, realFnName) {
                    return function() {
                      const args = Array.from(arguments);
                      setTimeout(function() {
                        try {
                          const result = API_MAP[realFnName] ? API_MAP[realFnName].apply(null, args) : null;
                          successFn(result);
                        } catch(e) {
                          if (failFn) failFn(e);
                          else console.error('Mock Error:', e);
                        }
                      }, 80);
                    };
                  }
                });
              };
            }
            return function() {
              const args = Array.from(arguments);
              setTimeout(function() {
                try {
                  const result = API_MAP[fnName] ? API_MAP[fnName].apply(null, args) : null;
                  successFn(result);
                } catch(e) {
                  console.error('Mock Error:', e);
                }
              }, 80);
            };
          }
        });
      };
    }
    if (prop === 'withFailureHandler') {
      return function(failFn) {
        return new Proxy({}, {
          get: function(_, prop2) {
            if (prop2 === 'withSuccessHandler') {
              return function(successFn) {
                return new Proxy({}, {
                  get: function(__, fnName) {
                    return function() {
                      const args = Array.from(arguments);
                      setTimeout(function() {
                        try {
                          const result = API_MAP[fnName] ? API_MAP[fnName].apply(null, args) : null;
                          successFn(result);
                        } catch(e) { failFn(e); }
                      }, 80);
                    };
                  }
                });
              };
            }
            return function() {
              const args = Array.from(arguments);
              setTimeout(function() {
                try {
                  const result = API_MAP[prop2] ? API_MAP[prop2].apply(null, args) : null;
                } catch(e) { failFn(e); }
              }, 80);
            };
          }
        });
      };
    }
    // Direct call without handler
    return function() {
      const args = Array.from(arguments);
      setTimeout(function() {
        try { if (API_MAP[prop]) API_MAP[prop].apply(null, args); }
        catch(e) { console.error('Mock Error:', e); }
      }, 80);
    };
  }
});

// Utility: Reset toàn bộ DB về seed data (dùng khi test)
window.__resetPreviewDB = function() {
  Object.keys(localStorage).forEach(function(k) { if (k.startsWith(DB_PREFIX)) localStorage.removeItem(k); });
  db_init();
  location.reload();
};

console.log('%c🎵 Tony Music Academy — PREVIEW MODE', 'color:#C5A059;font-size:16px;font-weight:bold');
console.log('%cDữ liệu lưu trong localStorage. Gõ __resetPreviewDB() để reset.', 'color:#34D399;font-size:12px');
</script>
`;

// ===== Xây dựng preview.html =====

// Thay thế Apps Script template tags
let previewHtml = indexHtml
  // Thay <?!= HtmlService.createHtmlOutputFromFile('Stylesheet').getContent(); ?> bằng nội dung Stylesheet
  .replace(/\<\?\!= HtmlService\.createHtmlOutputFromFile\('Stylesheet'\)\.getContent\(\); \?\>/g, styleContent)
  // Thay <?!= HtmlService.createHtmlOutputFromFile('JavaScript').getContent(); ?> bằng mock + JS
  .replace(/\<\?\!= HtmlService\.createHtmlOutputFromFile\('JavaScript'\)\.getContent\(\); \?\>/g, mockBackend + '\n' + jsContent);

// Thêm preview banner vào đầu body
const previewBanner = `
<div id="previewBanner" style="position:fixed;top:0;left:0;right:0;z-index:9999;background:linear-gradient(135deg,#1a0f00,#2d1b00);border-bottom:2px solid #C5A059;padding:8px 20px;display:flex;justify-content:space-between;align-items:center;font-family:'Be Vietnam Pro',sans-serif">
  <div style="display:flex;align-items:center;gap:10px">
    <span style="background:#C5A059;color:#1a0f00;font-weight:800;padding:2px 8px;border-radius:4px;font-size:11px;letter-spacing:.5px">PREVIEW</span>
    <span style="color:#e0be77;font-size:12.5px;font-weight:600">🎵 Tony Music Academy — Chế độ xem trước (localStorage)</span>
  </div>
  <div style="display:flex;gap:8px;align-items:center">
    <button onclick="__resetPreviewDB()" style="background:#2a1600;color:#C5A059;border:1px solid #C5A059;padding:4px 10px;border-radius:5px;font-size:11px;cursor:pointer;font-weight:600">🔄 Reset DB</button>
    <button onclick="document.getElementById('previewBanner').style.display='none';document.body.style.marginTop='0'" style="background:none;border:1px solid #555;color:#999;padding:4px 8px;border-radius:5px;font-size:11px;cursor:pointer">✕ Ẩn</button>
  </div>
</div>
<style>#previewBanner ~ .side { top: 40px !important; } body { margin-top: 40px; }</style>
`;

previewHtml = previewHtml.replace('<body>', '<body>\n' + previewBanner);

// Ghi file
fs.writeFileSync('preview.html', previewHtml, 'utf8');
console.log('✅ preview.html đã được tạo thành công!');
console.log('👉 Mở file preview.html trong trình duyệt để xem trước.');
console.log('📝 Dữ liệu được lưu trong localStorage — bấm nút "Reset DB" để khôi phục.');
