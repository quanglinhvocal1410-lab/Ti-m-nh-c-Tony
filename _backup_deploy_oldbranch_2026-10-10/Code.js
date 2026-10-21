/**********************************************************************
 * TONY MUSIC ACADEMY — Quản lý học viên thanh nhạc & Đào tạo chuyên sâu
 * Backend: Google Apps Script + Google Sheets + Google Drive + Gemini AI
 **********************************************************************/

// ===================== CẤU HÌNH & HẰNG SỐ =====================
const APP_NAME = 'Tony Music Academy';
const PROP     = PropertiesService.getScriptProperties();

// Tên các bảng (Sheet) trong DB
const T = {
  HocVien:      'HocVien',
  BuoiHoc:      'BuoiHoc',
  DanhGiaGiong: 'DanhGiaGiong',
  PhanTichBai:  'PhanTichBai',
  Users:        'Users',
  Settings:     'Settings',
  CoSo:         'CoSo',
  Phong:        'Phong',
  KhungGio:     'KhungGio',
  LichXep:      'LichXep',
  BaiLuyenThanh:'BaiLuyenThanh'
};

// Cột (header) cho từng bảng — DAO map theo TÊN cột
const SCHEMA = {
  HocVien: [
    'id', 'avatar', 'hoTen', 'namSinh', 'username', 'password', 'dienThoai', 'email', 'zalo', 'facebook',
    'loaiGiong', 'lop', 'rank', 'tinhTrang', 'giaoVien', 'ngayBatDau', 'ngayKhoaMoi',
    'soBuoiDeal', 'soBuoiKhoa', 'soBuoiDaHoc', 'soBuoiConLai',
    'loaiHocVien', 'hocPhi', 'daDongHocPhi', 'tienMatDaThu',
    'quangGiong', 'noteThap', 'noteCao', 'noteChuyenGiong',
    'chestVoice', 'mixVoice', 'falsetto', 'headVoice', 'whistleVoice',
    'mucTieu', 'mucTieuHoc', 'diemManh', 'diemYeu', 'keHoach', 'khuyenNghi',
    'linkDrive', 'ghiChu', 'active', 'createdAt', 'updatedAt',
    'ngayHocThu', 'nguonGioiThieu', 'trialStatus',
    'soKhoaDaHoc', 'buoiDauKhoa', 'soBuoiKhoaHienTai', 'lichSuKhoa',
    'daXoaDrive', 'ngayXoaDrive', 'lopDaTungHoc'
  ],
  BuoiHoc: [
    'id', 'hocVienId', 'ngayHoc', 'buoiSo', 'khoiDong', 'kyThuat', 'linkYoutubeKyThuat',
    'baiHat', 'linkYoutube', 'noteCao', 'noteThap', 'huongDanHatJson',
    'noiDung', 'baiTapVeNha', 'nhanXet', 'ghiChuNoiBo', 'diemSo', 'songsJson', 'techsJson', 'createdAt',
    'scoreCardJson', 'totalScore', 'sessionGrade', 'focusSkillName', 'scoreNote',
    'groupSessionId', 'isGroupSession'
  ],
  DanhGiaGiong: [
    'id', 'hocVienId', 'ngayDanhGia', 'loaiPhieu', 'noteThap', 'noteCao',
    'tongDiem', 'rankGoiY', 'chiTiet', 'ketQuaAI', 'createdAt'
  ],
  PhanTichBai: [
    'id', 'hocVienId', 'tenBai', 'ca', 'tongGoc', 'linkYoutube',
    'ketQuaAI', 'createdAt'
  ],
  Users: [
    'id', 'username', 'password', 'hoTen', 'role', 'email',
    'permissions', 'active', 'createdAt', 'updatedAt',
    'tenNgan', 'mauLich', 'dayHoc',
    'luongTrenHocVien', 'hoaHongHocVienMoi', 'hoaHongGiaHan', 'soTaiKhoan', 'nganHang', 'dienThoai'
  ],
  BaiLuyenThanh: [
    'id', 'tenBai', 'kyThuat', 'linkYoutube', 'linkHuongDan', 'ghiChu', 'nguoiTao', 'active', 'createdAt', 'updatedAt'
  ],
  Settings: [
    'key', 'value', 'updatedAt'
  ],
  // ---- Module Lịch dạy ----
  CoSo: [
    'id', 'tenCoSo', 'diaChi', 'thuTu', 'active'
  ],
  Phong: [
    'id', 'coSoId', 'tenPhong', 'sucChua', 'thuTu', 'active'
  ],
  KhungGio: [
    'id', 'coSoId', 'phongId', 'batDau', 'ketThuc', 'thuTu', 'active'
  ],
  LichXep: [
    'id', 'tuan', 'thu', 'khungGioId', 'loai', 'giaoVienId', 'hocVienIds',
    'ghiChu', 'createdBy', 'updatedBy', 'updatedAt'
  ]
};

// ===================== KHỞI TẠO =====================
function setup() {
  const ss = getDbSpreadsheet_(true);
  Object.keys(SCHEMA).forEach(function(name){ ensureSheet_(ss, name, SCHEMA[name]); });
  initDefaultUsers_();
  try { fixBlankIds_(); } catch(e) { Logger.log('fixBlankIds_ setup: ' + e.message); }
  setupDailyCleanupTrigger_();
  Logger.log('DB sẵn sàng: ' + ss.getUrl());
  return ss.getUrl();
}

/**
 * Cài đặt trigger thời gian chạy dọn Drive hết hạn mỗi ngày lúc 2h sáng
 */
function setupDailyCleanupTrigger_() {
  try {
    ScriptApp.getProjectTriggers().forEach(function(t){
      if (t.getHandlerFunction() === 'triggerDailyDriveCleanup_') {
        ScriptApp.deleteTrigger(t);
      }
    });
    ScriptApp.newTrigger('triggerDailyDriveCleanup_')
      .timeBased()
      .everyDays(1)
      .atHour(2)
      .create();
  } catch(e) {
    Logger.log('Cài đặt trigger dọn Drive hàng ngày: ' + e.message);
  }
}

function getDbSpreadsheet_(createIfMissing) {
  let id = PROP.getProperty('DB_ID');
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch(e) { id = null; }
  }
  if (!createIfMissing) throw new Error('Chưa có DB. Hãy chạy hàm setup() trước.');
  const ss = SpreadsheetApp.create(APP_NAME + ' — Database');
  PROP.setProperty('DB_ID', ss.getId());
  const def = ss.getSheetByName('Sheet1');
  if (def && ss.getSheets().length > 1) ss.deleteSheet(def);
  return ss;
}

function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  const lastCol = sh.getLastColumn();
  if (lastCol === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight('bold').setBackground('#3A5A42').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
  } else {
    const first = sh.getRange(1, 1, 1, lastCol).getValues()[0];
    const currentHeaders = first.map(function(h){ return String(h).trim(); }).filter(Boolean);
    const missing = headers.filter(function(h){ return currentHeaders.indexOf(h) === -1; });
    if (missing.length > 0) {
      const nextCol = currentHeaders.length + 1;
      sh.getRange(1, nextCol, 1, missing.length).setValues([missing])
        .setFontWeight('bold').setBackground('#3A5A42').setFontColor('#FFFFFF');
    }
  }
  return sh;
}

// ===================== DAO (ĐỌC / GHI THEO TÊN CỘT) =====================
function sheet_(name) {
  const ss = getDbSpreadsheet_(true);
  let sh = ss.getSheetByName(name);
  if (!sh && SCHEMA[name]) {
    sh = ensureSheet_(ss, name, SCHEMA[name]);
  } else if (sh && SCHEMA[name]) {
    ensureSheet_(ss, name, SCHEMA[name]);
  }
  return sh;
}

// ===================== HỆ THỐNG CACHE VÀ TRUY XUẤT SHEET =====================
// In-memory per-execution cache: tự giải phóng sau mỗi lượt gọi RPC
let CACHE_MEM_ = {};

/**
 * Xoá cache trong bộ nhớ của 1 bảng hoặc toàn bộ DB
 * @param {string} [name] Tên bảng cần xoá cache (bỏ trống để xoá hết)
 */
function invalidateCache_(name) {
  if (name) {
    delete CACHE_MEM_[name];
  } else {
    CACHE_MEM_ = {};
  }
}

/**
 * Quản lý phiên bản cache của Dashboard để invalidate tức thì khi có dữ liệu mới
 */
function getDashboardCacheVer_() {
  try {
    const cache = CacheService.getScriptCache();
    let ver = cache.get('DASH_CACHE_VER');
    if (!ver) {
      ver = '1';
      cache.put('DASH_CACHE_VER', ver, 21600);
    }
    return ver;
  } catch(e) {
    return '1';
  }
}

function invalidateDashboardCache_() {
  try {
    const cache = CacheService.getScriptCache();
    const current = parseInt(cache.get('DASH_CACHE_VER') || '1', 10);
    cache.put('DASH_CACHE_VER', String(current + 1), 21600);
  } catch(e) {}
}

/**
 * Quản lý phiên bản cache của Báo cáo Quyết toán học phí
 */
function getTuitionCacheVer_() {
  try {
    const cache = CacheService.getScriptCache();
    let ver = cache.get('TUITION_CACHE_VER');
    if (!ver) {
      ver = '1';
      cache.put('TUITION_CACHE_VER', ver, 21600);
    }
    return ver;
  } catch(e) {
    return '1';
  }
}

function invalidateTuitionCache_() {
  try {
    const cache = CacheService.getScriptCache();
    const current = parseInt(cache.get('TUITION_CACHE_VER') || '1', 10);
    cache.put('TUITION_CACHE_VER', String(current + 1), 21600);
  } catch(e) {}
}

/**
 * 1. Đọc toàn bộ bảng với In-Memory Per-Execution Cache
 * Tránh đọc lặp lại nhiều lần cùng 1 sheet trong 1 lần gọi API
 */
function readAll_(name) {
  if (CACHE_MEM_[name]) {
    // Trả về bản copy để caller không làm thay đổi trực tiếp cache
    return CACHE_MEM_[name].map(function(row){ return Object.assign({}, row); });
  }
  const sh = sheet_(name);
  if (!sh) return [];
  const data = sh.getDataRange().getValues();
  if (data.length < 2) {
    CACHE_MEM_[name] = [];
    return [];
  }
  const head = data[0];
  const list = data.slice(1).map(function(row){
    const o = {};
    head.forEach(function(h, i){ if(h) o[h] = row[i]; });
    return o;
  });
  CACHE_MEM_[name] = list;
  return list.map(function(row){ return Object.assign({}, row); });
}

/**
 * 10. Đọc nhiều sheet cùng lúc và lưu vào cache
 * @param {Array<string>} names Mảng các tên bảng
 */
function readMultiple_(names) {
  if (!Array.isArray(names)) names = [names];
  const result = {};
  names.forEach(function(name){
    result[name] = readAll_(name);
  });
  return result;
}

function nextId_(name, prefix) {
  const rows = readAll_(name);
  let max = 0;
  rows.forEach(function(r){
    const m = String(r.id || '').match(/(\d+)$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return prefix + '-' + String(max + 1).padStart(6, '0');
}

function insert_(name, obj) {
  const sh = sheet_(name);
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const row = head.map(function(h){ return obj[h] !== undefined ? obj[h] : ''; });
  sh.appendRow(row);
  invalidateCache_(name);
  invalidateDashboardCache_();
  invalidateTuitionCache_();
  return obj;
}

/**
 * 2. Cập nhật 1 dòng dữ liệu bằng 1 lần gọi setValues duy nhất (Batch Row Write)
 * Thay thế việc loop qua từng cột gọi setValue() gây chậm nghiêm trọng
 */
function update_(name, id, patch) {
  const sh = sheet_(name);
  if (!sh) return false;
  const data = sh.getDataRange().getValues();
  if (data.length < 2) return false;
  const head = data[0];
  const idCol = head.indexOf('id');
  if (idCol === -1) return false;
  
  for (let r = 1; r < data.length; r++) {
    if (String(data[r][idCol]) === String(id)) {
      const newRow = data[r].slice(); // copy hàng hiện tại
      let changed = false;
      head.forEach(function(h, c){
        if (patch[h] !== undefined) {
          newRow[c] = patch[h];
          changed = true;
        }
      });
      if (changed) {
        // Ghi lại toàn bộ hàng trong 1 lần gọi Sheets API duy nhất
        sh.getRange(r + 1, 1, 1, head.length).setValues([newRow]);
        invalidateCache_(name);
        invalidateDashboardCache_();
        invalidateTuitionCache_();
      }
      return true;
    }
  }
  return false;
}

// ===================== ROUTER CHO WEB APP =====================
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle(APP_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ===================== ĐĂNG NHẬP & CỔNG API (RPC) =====================
// Mọi lời gọi từ trình duyệt đi qua rpc(token, tên API, tham số).
// Các hàm nghiệp vụ đều có hậu tố "_" (private) nên trình duyệt không gọi thẳng được.

let ME_ = null;            // Người dùng của lần gọi hiện tại (do rpc gán)
let LOCK_DEPTH_ = 0;

const TOKEN_TTL_MS = 30 * 24 * 3600 * 1000;   // Token sống 30 ngày
const LOGIN_MAX_FAIL = 8;                      // Sai quá 8 lần → khoá 10 phút

function authSecret_() {
  let s = PROP.getProperty('AUTH_SECRET');
  if (!s) {
    s = Utilities.getUuid() + Utilities.getUuid();
    PROP.setProperty('AUTH_SECRET', s);
  }
  return s;
}

function sha256Hex_(text) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return bytes.map(function(b){ return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

function hashPassword_(plain) {
  const salt = Utilities.getUuid().replace(/-/g, '').slice(0, 16);
  return 'sha256$' + salt + '$' + sha256Hex_(salt + String(plain));
}

function isHashed_(stored) {
  return /^sha256\$/.test(String(stored || ''));
}

function checkPassword_(stored, plain) {
  stored = String(stored == null ? '' : stored);
  if (!stored) return false;
  if (isHashed_(stored)) {
    const parts = stored.split('$');
    return parts.length === 3 && sha256Hex_(parts[1] + String(plain)) === parts[2];
  }
  return stored === String(plain);   // Mật khẩu cũ chưa băm — sẽ được băm lại sau khi đăng nhập
}

function b64url_(text) {
  return Utilities.base64EncodeWebSafe(text, Utilities.Charset.UTF_8).replace(/=+$/, '');
}

function tokenSig_(payload, storedPw) {
  const raw = Utilities.computeHmacSha256Signature(payload + '|' + String(storedPw || '').slice(-16), authSecret_());
  return Utilities.base64EncodeWebSafe(raw).replace(/=+$/, '');
}

function makeToken_(kind, id, storedPw) {
  const payload = kind + '|' + id + '|' + (Date.now() + TOKEN_TTL_MS);
  return b64url_(payload) + '.' + tokenSig_(payload, storedPw);
}

function parsePerms_(p, role) {
  if (p && typeof p === 'object') return p;
  try { return JSON.parse(p || '{}'); } catch(e) { return DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.gv; }
}

function buildMe_(kind, row) {
  if (kind === 'hv') {
    return { kind: 'hv', id: String(row.id), role: 'hv', hoTen: String(row.hoTen || ''), username: String(row.username || ''), hocVienId: String(row.id), permissions: {} };
  }
  const role = String(row.role || 'gv');
  return {
    kind: 'user', id: String(row.id), role: role, hoTen: String(row.hoTen || ''), username: String(row.username || ''),
    email: String(row.email || ''), permissions: role === 'admin' ? DEFAULT_PERMISSIONS.admin : parsePerms_(row.permissions, role)
  };
}

function findAccount_(kind, id) {
  const rows = readAll_(kind === 'hv' ? T.HocVien : T.Users);
  return rows.filter(function(r){
    return String(r.id) === String(id) && r.active !== false && String(r.active).toUpperCase() !== 'FALSE';
  })[0] || null;
}

function verifyToken_(token) {
  token = String(token || '');
  const dot = token.indexOf('.');
  if (dot < 1) return null;
  const cache = CacheService.getScriptCache();
  const ck = 'tk_' + token.slice(dot + 1, dot + 60);
  const hit = cache.get(ck);
  if (hit) { try { return JSON.parse(hit); } catch(e) {} }

  let payload;
  try { payload = Utilities.newBlob(Utilities.base64DecodeWebSafe(token.slice(0, dot))).getDataAsString('UTF-8'); }
  catch(e) { return null; }
  const parts = payload.split('|');
  if (parts.length !== 3 || Number(parts[2]) < Date.now()) return null;
  const row = findAccount_(parts[0], parts[1]);
  if (!row) return null;
  if (tokenSig_(payload, row.password) !== token.slice(dot + 1)) return null;
  const me = buildMe_(parts[0], row);
  cache.put(ck, JSON.stringify(me), 300);
  return me;
}

function login_(username, password) {
  username = String(username || '').trim();
  password = String(password || '');
  if (!username || !password) throw new Error('Vui lòng nhập tên đăng nhập và mật khẩu');

  const cache = CacheService.getScriptCache();
  const failKey = 'lf_' + username.toLowerCase();
  const fails = parseInt(cache.get(failKey) || '0', 10);
  if (fails >= LOGIN_MAX_FAIL) throw new Error('Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 10 phút.');

  initDefaultUsers_();
  const uname = username.toLowerCase();
  const isActive = function(r){ return r.active !== false && String(r.active).toUpperCase() !== 'FALSE'; };
  let kind = 'user';
  let row = readAll_(T.Users).filter(function(r){ return isActive(r) && String(r.username || '').trim().toLowerCase() === uname; })[0];
  if (!row) {
    kind = 'hv';
    row = readAll_(T.HocVien).filter(function(r){ return isActive(r) && String(r.username || '').trim().toLowerCase() === uname; })[0];
  }
  if (!row || !checkPassword_(row.password, password)) {
    cache.put(failKey, String(fails + 1), 600);
    throw new Error('Sai tên đăng nhập hoặc mật khẩu');
  }
  cache.remove(failKey);

  // Băm lại mật khẩu cũ còn lưu dạng chữ thường
  let storedPw = row.password;
  if (!isHashed_(storedPw)) {
    storedPw = hashPassword_(password);
    update_(kind === 'hv' ? T.HocVien : T.Users, row.id, { password: storedPw });
  }

  const me = buildMe_(kind, row);
  return { token: makeToken_(kind, row.id, storedPw), me: me, weakPassword: password.length < 6 };
}

function whoAmI_() {
  return ME_;
}

function changeMyPassword_(oldPw, newPw) {
  newPw = String(newPw || '');
  if (newPw.length < 6) throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
  const table = ME_.kind === 'hv' ? T.HocVien : T.Users;
  const row = findAccount_(ME_.kind, ME_.id);
  if (!row || !checkPassword_(row.password, oldPw)) throw new Error('Mật khẩu hiện tại không đúng');
  const stored = hashPassword_(newPw);
  update_(table, row.id, { password: stored, updatedAt: new Date() });
  return { success: true, token: makeToken_(ME_.kind, row.id, stored), message: 'Đã đổi mật khẩu. Các thiết bị khác sẽ phải đăng nhập lại.' };
}

function hasPermMe_(module, act) {
  if (!ME_) return false;
  if (ME_.role === 'admin') return true;
  if (ME_.role === 'hv') return false;
  const p = ME_.permissions || {};
  return !!(p[module] && p[module][act]);
}

function withLock_(fn) {
  if (LOCK_DEPTH_ > 0) return fn();
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) throw new Error('Hệ thống đang bận, vui lòng thử lại sau vài giây');
  LOCK_DEPTH_++;
  try { return fn(); }
  finally { LOCK_DEPTH_--; lock.releaseLock(); }
}

/**
 * Bảng quyền cho từng API:
 *  pub   — không cần đăng nhập
 *  any   — mọi tài khoản đã đăng nhập (kể cả học viên)
 *  staff — Admin & Giảng viên
 *  admin — chỉ Admin
 *  perm  — [phân hệ, thao tác] theo ma trận phân quyền
 */
const API_RULES = {
  login:                    { pub: true,   fn: login_ },
  whoAmI:                   { any: true,   fn: whoAmI_ },
  changeMyPassword:         { any: true,   fn: changeMyPassword_ },
  getMySchedule:            { any: true,   fn: getMySchedule_ },

  getDbUrl:                 { staff: true, fn: getDbUrl_ },
  getAppConfig:             { staff: true, fn: getAppConfig_ },
  getScheduleSheetData:     { staff: true, fn: getScheduleSheetData_ },
  saveTrialStudent:         { perm: ['students', 'edit'],   fn: saveTrialStudent_ },
  updateTrialStatus:        { perm: ['students', 'edit'],   fn: updateTrialStatus_ },
  confirmTrialStudent:      { perm: ['students', 'edit'],   fn: confirmTrialStudent_ },
  saveGroupSession:         { perm: ['sessions', 'edit'],   fn: saveGroupSession_ },
  getUsers:                 { staff: true, fn: getUsers_ },
  getDashboard:             { perm: ['students', 'view'],   fn: getDashboard_ },
  getDashboardV2:           { staff: true, fn: getDashboardV2_ },
  getStudents:              { perm: ['students', 'view'],   fn: getStudents_ },
  getStudent:               { perm: ['students', 'view'],   fn: getStudent_ },
  saveStudent:              { perm: ['students', 'edit'],   fn: saveStudent_ },
  renewStudentSessions:     { perm: ['students', 'edit'],   fn: renewStudentSessions_ },
  getRouteSuggestion:       { any: true,  fn: getRouteSuggestion_ },
  exportStudentReportPdf:   { perm: ['students', 'view'],   fn: exportStudentReportPdf_ },
  createStudentDriveFolder: { perm: ['students', 'edit'],   fn: createStudentDriveFolder_ },
  cleanExpiredDriveFolders: { perm: ['students', 'edit'],   fn: cleanExpiredDriveFolders_ },
  deleteStudents:           { perm: ['students', 'delete'], fn: deleteStudents_ },
  deleteStudent:            { perm: ['students', 'delete'], fn: deleteStudent_ },
  saveSession:              { perm: ['sessions', 'edit'],   fn: saveSession_ },
  quickCheckInAttendance:   { perm: ['sessions', 'edit'],   fn: quickCheckInAttendance_ },
  quickRemoveAttendance:    { perm: ['sessions', 'edit'],   fn: quickRemoveAttendance_ },
  deleteSessions:           { perm: ['sessions', 'delete'], fn: deleteSessions_ },
  saveVoiceAssessment:      { perm: ['voice', 'edit'],      fn: saveVoiceAssessment_ },
  aiAnalyzeVoice:           { perm: ['voice', 'edit'],      fn: aiAnalyzeVoice_ },
  saveSongAnalysis:         { perm: ['songs', 'edit'],      fn: saveSongAnalysis_ },
  aiAnalyzeSong:            { perm: ['songs', 'edit'],      fn: aiAnalyzeSong_ },
  getConfig:                { perm: ['settings', 'view'],   fn: getConfig_ },
  saveConfig:               { perm: ['settings', 'edit'],   fn: saveConfig_ },
  saveUser:                 { perm: ['settings', 'edit'],   fn: saveUser_ },
  deleteUsers:              { perm: ['settings', 'edit'],   fn: deleteUsers_ },
  getTuitionSettlementData: { admin: true, fn: getTuitionSettlementData_ },
  updateTuitionPayment:     { admin: true, fn: updateTuitionPayment_ },
  getQrImage:               { admin: true, fn: getQrImage_ },
  uploadQrImage:            { admin: true, fn: uploadQrImage_ },
  removeQrImage:            { admin: true, fn: removeQrImage_ },
  importLegacyData:         { admin: true, fn: importLegacyData_ },

  // Quản lý Giáo viên & Khám phá
  getTeachers:              { staff: true, fn: getTeachers_ },
  saveTeacher:              { admin: true, fn: saveTeacher_ },
  deleteTeacher:            { admin: true, fn: deleteTeacher_ },
  deleteTeachers:           { admin: true, fn: deleteTeachers_ },
  getExercises:             { any: true,   fn: getExercises_ },
  saveExercise:             { staff: true, fn: saveExercise_ },
  deleteExercise:           { staff: true, fn: deleteExercise_ },
  getDiscoverData:          { any: true,   fn: getDiscoverData_ },
  getTechniqueCatalog:      { any: true,   fn: getTechniqueCatalog_ },
  saveTechniqueCatalog:     { staff: true, fn: saveTechniqueCatalog_ },

  // Lịch dạy
  getScheduleBoard:         { staff: true, fn: getScheduleBoard_ },
  saveScheduleCells:        { staff: true, fn: saveScheduleCells_ },
  copyWeek:                 { staff: true, fn: copyWeek_ },
  saveTimeSlot:             { admin: true, fn: saveTimeSlot_ },
  hideTimeSlot:             { admin: true, fn: hideTimeSlot_ },
  saveCoSo:                 { admin: true, fn: saveCoSo_ },
  savePhong:                { admin: true, fn: savePhong_ },
  previewCalendarSync:      { staff: true, fn: previewCalendarSync_ },
  runCalendarSync:          { staff: true, fn: runCalendarSync_ }
};

function rpc(token, fnName, args) {
  CACHE_MEM_ = {}; // Đảm bảo cache in-memory được làm mới cho mỗi lần gọi API
  try {
    const rule = API_RULES[fnName];
    if (!rule) throw new Error('API không tồn tại: ' + fnName);
    ME_ = null;
    if (!rule.pub) {
      ME_ = verifyToken_(token);
      if (!ME_) return { ok: false, auth: true, error: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.' };
      const isStaff = ME_.role === 'admin' || ME_.role === 'gv';
      let allowed = true;
      if (rule.staff) allowed = isStaff;
      if (rule.admin) allowed = ME_.role === 'admin';
      if (rule.perm)  allowed = hasPermMe_(rule.perm[0], rule.perm[1]);
      if (!allowed) throw new Error('Bạn không có quyền thực hiện thao tác này');
    }
    const data = rule.fn.apply(null, Array.isArray(args) ? args : []);
    return { ok: true, data: data === undefined ? null : data };
  } catch (e) {
    return { ok: false, error: String(e && e.message ? e.message : e) };
  }
}

// ===================== CẤU HÌNH HỆ THỐNG (GEMINI & DRIVE) =====================
function getConfig_() {
  return {
    geminiApiKey:    PROP.getProperty('GEMINI_API_KEY') || '',
    geminiModel:     PROP.getProperty('GEMINI_MODEL') || 'gemini-2.0-flash',
    sharedDriveLink: PROP.getProperty('SHARED_DRIVE_LINK') || '',
    scheduleSheetLink: PROP.getProperty('SCHEDULE_SS_LINK') || '',
    groupClasses:    PROP.getProperty('GROUP_CLASSES') || 'TN12',
    payDueSession:   dashPayDue_(),
    classList:       getClassList_(),
    dbUrl:           getDbUrl_()
  };
}

// Cấu hình không nhạy cảm, mọi GV đều cần (không chứa API key)
function getAppConfig_() {
  return { groupClasses: PROP.getProperty('GROUP_CLASSES') || 'TN12', classList: getClassList_() };
}

// Học phí khoá phải đóng trước buổi thứ N của khoá (cấu hình, mặc định 2)
function dashPayDue_() {
  return Math.max(1, parseInt(PROP.getProperty('PAY_DUE_SESSION') || '2', 10) || 2);
}

// Danh sách lớp = lớp đã lưu + lớp đang có trong bảng học viên (gõ lớp mới ở form sẽ tự thêm vào)
function getClassList_() {
  let saved = [];
  try { saved = JSON.parse(PROP.getProperty('CLASS_LIST') || '[]'); } catch(e) { saved = []; }
  if (!saved.length) saved = ['TN11', 'TN12', 'TNN', 'TN-VIP'];
  readAll_(T.HocVien).forEach(function(r){ const l = String(r.lop || '').trim(); if (l) saved.push(l); });
  return saved.filter(function(v, i){ return v && saved.indexOf(v) === i; }).sort(function(a, b){ return a.localeCompare(b, 'vi'); });
}

function addClassToList_(lop) {
  lop = String(lop || '').trim();
  if (!lop) return;
  let saved = [];
  try { saved = JSON.parse(PROP.getProperty('CLASS_LIST') || '[]'); } catch(e) { saved = []; }
  if (!saved.length) saved = ['TN11', 'TN12', 'TNN', 'TN-VIP'];
  if (saved.indexOf(lop) === -1) { saved.push(lop); PROP.setProperty('CLASS_LIST', JSON.stringify(saved)); }
}

// ===================== DANH MỤC KỸ THUẬT TRỌNG TÂM (tự xổ xuống) =====================
// Seed theo lộ trình Tony Music; GV gõ kỹ thuật mới sẽ tự thêm vào danh mục dùng chung.
const TECH_CATALOG_SEED = [
  'Lip trill & Khởi động cơ hoành', 'Hơi thở cơ hoành (Diaphragm)', 'Nhận diện cao độ (Pitch)',
  'Khẩu hình & Nguyên âm', 'Thang âm & Vocalise (Scale)', 'Legato (hát liền)', 'Staccato (hát nảy)',
  'Chest Voice (giọng ngực)', 'Head Voice (giọng đầu)', 'Dynamics (to - nhỏ)',
  'Mixvoice vùng chuyển giọng (Passaggio)', 'Vibrato', 'Phrasing (xử lý câu nhạc)',
  'Mở khẩu hình dọc & Nén hơi', 'Mezza voce (nửa giọng)', 'Belting an toàn', 'Riff & Run',
  'Twang', 'Mở rộng quãng giọng'
];

function getTechniqueCatalog_() {
  let saved = [];
  try { saved = JSON.parse(PROP.getProperty('TECH_CATALOG') || '[]'); } catch(e) { saved = []; }
  const seen = {};
  const out = [];
  const push = function(name){
    const n = String(name || '').trim();
    if (!n) return;
    const k = schFold_(n);
    if (seen[k]) return;
    seen[k] = true;
    out.push(n);
  };
  TECH_CATALOG_SEED.forEach(push);
  saved.forEach(push);
  // Gộp thêm các kỹ thuật đã dùng trong buổi học (focusSkillName + techsJson)
  readAll_(T.BuoiHoc).forEach(function(b){
    if (b.focusSkillName) push(b.focusSkillName);
    try {
      const tj = b.techsJson ? (typeof b.techsJson === 'string' ? JSON.parse(b.techsJson) : b.techsJson) : [];
      if (Array.isArray(tj)) tj.forEach(function(t){ if (t && t.name) push(t.name); });
    } catch(e) {}
  });
  return out.sort(function(a, b){ return a.localeCompare(b, 'vi'); });
}

// Thêm 1 hoặc nhiều kỹ thuật mới vào danh mục đã lưu (upsert, không trùng)
function saveTechniqueCatalog_(names) {
  if (!names) return { success: false, message: 'Chưa có kỹ thuật nào' };
  if (!Array.isArray(names)) names = [names];
  let saved = [];
  try { saved = JSON.parse(PROP.getProperty('TECH_CATALOG') || '[]'); } catch(e) { saved = []; }
  const seen = {};
  saved.forEach(function(n){ seen[schFold_(n)] = true; });
  let added = 0;
  names.forEach(function(name){
    const n = String(name || '').trim();
    if (!n) return;
    const k = schFold_(n);
    if (seen[k]) return;
    seen[k] = true;
    saved.push(n);
    added++;
  });
  if (added) PROP.setProperty('TECH_CATALOG', JSON.stringify(saved));
  return { success: true, added: added, catalog: getTechniqueCatalog_() };
}

function saveConfig_(cfg) {
  if (cfg.geminiApiKey !== undefined) {
    PROP.setProperty('GEMINI_API_KEY', String(cfg.geminiApiKey).trim());
  }
  if (cfg.geminiModel) {
    PROP.setProperty('GEMINI_MODEL', String(cfg.geminiModel).trim());
  }
  if (cfg.sharedDriveLink !== undefined) {
    const link = String(cfg.sharedDriveLink).trim();
    PROP.setProperty('SHARED_DRIVE_LINK', link);
    const folderId = extractFolderId_(link);
    if (folderId) PROP.setProperty('SHARED_DRIVE_ID', folderId);
  }
  if (cfg.scheduleSheetLink !== undefined) {
    const sLink = String(cfg.scheduleSheetLink).trim();
    PROP.setProperty('SCHEDULE_SS_LINK', sLink);
    PROP.setProperty('SCHEDULE_SS_ID', extractFolderId_(sLink));
  }
  if (cfg.groupClasses !== undefined) {
    PROP.setProperty('GROUP_CLASSES', String(cfg.groupClasses).trim());
  }
  if (cfg.payDueSession !== undefined) {
    PROP.setProperty('PAY_DUE_SESSION', String(Math.max(1, parseInt(cfg.payDueSession, 10) || 2)));
  }
  if (Array.isArray(cfg.classList)) {
    const list = cfg.classList.map(function(x){ return String(x || '').trim(); }).filter(function(x, i, a){ return x && a.indexOf(x) === i; });
    PROP.setProperty('CLASS_LIST', JSON.stringify(list));
  }
  return { success: true, message: 'Đã lưu cấu hình thành công!' };
}

function extractFolderId_(link) {
  if (!link) return '';
  const m = link.match(/[-\w]{25,}/);
  return m ? m[0] : '';
}

// ===================== TẠO FOLDER GOOGLE DRIVE TỰ ĐỘNG =====================
/**
 * Tạo folder học viên tự động theo cú pháp: [Rank].[Tên học viên].[Lớp].[dd-MM-yyyy]
 * Ví dụ: B.A Liêm.TN11.29-03-2026
 * Thư mục con sẽ nằm trong Thư mục Drive chung (nếu đã cấu hình).
 */
function createStudentDriveFolder_(st) {
  try {
    const rank = String(st.rank || 'A').trim();
    const hoTen = String(st.hoTen || 'HocVien').trim();
    const lop = String(st.lop || 'TN').trim();
    
    let dateStr = '';
    if (st.ngayBatDau) {
      const d = new Date(st.ngayBatDau);
      if (!isNaN(d.getTime())) {
        dateStr = Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd-MM-yyyy');
      }
    }
    if (!dateStr) {
      dateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MM-yyyy');
    }

    // Tên folder chuẩn: B.A Liêm.TN11.29-03-2026
    const folderName = rank + '.' + hoTen + '.' + lop + '.' + dateStr;

    // Tìm thư mục cha
    const sharedLink = PROP.getProperty('SHARED_DRIVE_LINK') || '';
    const sharedId = PROP.getProperty('SHARED_DRIVE_ID') || extractFolderId_(sharedLink);

    let parentFolder = null;
    if (sharedId) {
      try {
        parentFolder = DriveApp.getFolderById(sharedId);
      } catch(e) {
        Logger.log('Không mở được shared folder theo ID: ' + e.message);
      }
    }

    let newFolder;
    if (parentFolder) {
      newFolder = parentFolder.createFolder(folderName);
    } else {
      newFolder = DriveApp.createFolder(folderName);
    }

    const folderUrl = newFolder.getUrl();

    // Nếu học viên đã có ID, cập nhật thẳng vào DB
    if (st.id) {
      update_(T.HocVien, st.id, { linkDrive: folderUrl, updatedAt: new Date() });
    }

    return {
      success: true,
      folderName: folderName,
      folderUrl: folderUrl,
      message: 'Đã tạo thư mục thành công: ' + folderName
    };
  } catch(err) {
    return {
      success: false,
      message: 'Lỗi tạo folder Google Drive: ' + err.message
    };
  }
}

// ===================== NGƯỜI DÙNG & MA TRẬN PHÂN QUYỀN =====================
const DEFAULT_PERMISSIONS = {
  admin: {
    students: { view: true, edit: true, delete: true },
    sessions: { view: true, edit: true, delete: true },
    voice:    { view: true, edit: true, delete: true },
    songs:    { view: true, edit: true, delete: true },
    settings: { view: true, edit: true, delete: true }
  },
  gv: {
    students: { view: true, edit: true, delete: false },
    sessions: { view: true, edit: true, delete: true },
    voice:    { view: true, edit: true, delete: true },
    songs:    { view: true, edit: true, delete: true },
    settings: { view: false, edit: false, delete: false }
  },
  // Viewer: chỉ xem, mặc định KHÔNG bật module nào — Admin bật/tắt từng mục trong Phân quyền
  viewer: {
    students: { view: false, edit: false, delete: false },
    sessions: { view: false, edit: false, delete: false },
    voice:    { view: false, edit: false, delete: false },
    songs:    { view: false, edit: false, delete: false },
    settings: { view: false, edit: false, delete: false }
  }
};

function initDefaultUsers_() {
  const users = readAll_(T.Users);
  if (users.length === 0) {
    const now = new Date();
    const defaults = [
      {
        id: 'USR-000001', username: 'admin', password: '123', hoTen: 'Quản trị viên (Admin)',
        role: 'admin', email: 'admin@tonymusic.vn',
        permissions: JSON.stringify(DEFAULT_PERMISSIONS.admin),
        active: true, createdAt: now, updatedAt: now
      },
      {
        id: 'USR-000002', username: 'linh', password: '123', hoTen: 'Giảng viên Linh',
        role: 'gv', email: 'linh@tonymusic.vn', dienThoai: '0987654321',
        permissions: JSON.stringify(DEFAULT_PERMISSIONS.gv),
        luongTrenHocVien: 0, hoaHongHocVienMoi: 250000, hoaHongGiaHan: 350000,
        soTaiKhoan: '140396', nganHang: 'VIB',
        active: true, createdAt: now, updatedAt: now
      },
      {
        id: 'USR-000003', username: 'quan', password: '123', hoTen: 'Giảng viên Quân',
        role: 'gv', email: 'quan@tonymusic.vn', dienThoai: '0912345678',
        permissions: JSON.stringify(DEFAULT_PERMISSIONS.gv),
        luongTrenHocVien: 400000, hoaHongHocVienMoi: 200000, hoaHongGiaHan: 300000,
        soTaiKhoan: '19035678901', nganHang: 'Techcombank',
        active: true, createdAt: now, updatedAt: now
      }
    ];
    defaults.forEach(function(u){ insert_(T.Users, u); });
  }
}

function getUsers_() {
  initDefaultUsers_();
  return readAll_(T.Users)
    .filter(function(u){ return u.active !== false && u.active !== 'FALSE'; })
    .map(function(u){
      const out = cleanRow_(u);
      delete out.password;
      out.permissions = parsePerms_(out.permissions, out.role);
      out.tenNgan = schShortName_(u);
      out.dayHoc = schIsTeacher_(u);
      return out;
    });
}

// Tên đăng nhập phải duy nhất trên cả bảng Users và HocVien
function assertUsernameFree_(username, selfTable, selfId) {
  const uname = String(username || '').trim().toLowerCase();
  if (!uname) return;
  const taken = [T.Users, T.HocVien].some(function(t){
    return readAll_(t).some(function(r){
      if (t === selfTable && String(r.id) === String(selfId)) return false;
      if (r.active === false || String(r.active).toUpperCase() === 'FALSE') return false;
      return String(r.username || '').trim().toLowerCase() === uname;
    });
  });
  if (taken) throw new Error('Tên đăng nhập "' + username + '" đã được dùng cho tài khoản khác');
}

function saveUser_(u) {
  const now = new Date();
  const permsStr = typeof u.permissions === 'object' ? JSON.stringify(u.permissions) : (u.permissions || '');
  const role = (u.role === 'admin' || u.role === 'viewer') ? u.role : 'gv';
  assertUsernameFree_(u.username, T.Users, u.id);

  if (u.id) {
    if (String(u.id) === String(ME_.id) && role !== ME_.role) throw new Error('Không thể tự đổi vai trò của chính mình');
    const patch = {
      hoTen: u.hoTen,
      username: u.username,
      role: role,
      email: u.email || '',
      dienThoai: u.dienThoai || '',
      permissions: permsStr,
      tenNgan: u.tenNgan || '',
      mauLich: u.mauLich || '',
      dayHoc: u.dayHoc === undefined ? '' : !!u.dayHoc,
      luongTrenHocVien: u.luongTrenHocVien !== undefined ? (parseFloat(u.luongTrenHocVien) || 0) : '',
      hoaHongHocVienMoi: u.hoaHongHocVienMoi !== undefined ? (parseFloat(u.hoaHongHocVienMoi) || 0) : '',
      hoaHongGiaHan: u.hoaHongGiaHan !== undefined ? (parseFloat(u.hoaHongGiaHan) || 0) : '',
      soTaiKhoan: u.soTaiKhoan || '',
      nganHang: u.nganHang || '',
      updatedAt: now
    };
    if (u.password) {
      if (String(u.password).length < 6) throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
      patch.password = hashPassword_(u.password);
    }
    update_(T.Users, u.id, patch);
    return { success: true, id: u.id, message: 'Đã cập nhật người dùng!' };
  } else {
    if (!u.password || String(u.password).length < 6) throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
    const id = nextId_(T.Users, 'USR');
    const obj = {
      id: id,
      username: u.username || ('user_' + Date.now()),
      password: hashPassword_(u.password),
      hoTen: u.hoTen || 'Người dùng mới',
      role: role,
      email: u.email || '',
      dienThoai: u.dienThoai || '',
      permissions: permsStr || JSON.stringify(DEFAULT_PERMISSIONS[role]),
      tenNgan: u.tenNgan || '',
      mauLich: u.mauLich || '',
      dayHoc: u.dayHoc === undefined ? '' : !!u.dayHoc,
      luongTrenHocVien: u.luongTrenHocVien !== undefined ? (parseFloat(u.luongTrenHocVien) || 0) : 0,
      hoaHongHocVienMoi: u.hoaHongHocVienMoi !== undefined ? (parseFloat(u.hoaHongHocVienMoi) || 0) : 0,
      hoaHongGiaHan: u.hoaHongGiaHan !== undefined ? (parseFloat(u.hoaHongGiaHan) || 0) : 0,
      soTaiKhoan: u.soTaiKhoan || '',
      nganHang: u.nganHang || '',
      active: true,
      createdAt: now,
      updatedAt: now
    };
    insert_(T.Users, obj);
    return { success: true, id: id, message: 'Đã tạo người dùng mới!' };
  }
}

function deleteUsers_(ids) {
  if (!Array.isArray(ids)) ids = [ids];
  if (ids.some(function(id){ return String(id) === String(ME_.id); })) throw new Error('Không thể xoá tài khoản đang đăng nhập');
  const now = new Date();
  ids.forEach(function(id){
    update_(T.Users, id, { active: false, updatedAt: now });
  });
  return { success: true, count: ids.length, message: 'Đã xoá ' + ids.length + ' người dùng.' };
}

// ===================== API — QUẢN LÝ GIÁO VIÊN =====================
function getTeachers_() {
  initDefaultUsers_();
  const allUsers = readAll_(T.Users).filter(function(u){ return u.active !== false && u.active !== 'FALSE'; });
  const allStudents = readAll_(T.HocVien).filter(function(s){ return s.active !== false && s.active !== 'FALSE'; });
  const teachers = allUsers.filter(function(u){ return u.role === 'gv' || schIsTeacher_(u); });

  const list = teachers.map(function(u){
    const clean = cleanRow_(u);
    // Tính toán số học viên đang phụ trách
    const myStudents = allStudents.filter(function(s){
      const gv = schFold_(s.giaoVien || '');
      const tName = schFold_(u.hoTen || '');
      const sName = schFold_(schShortName_(u));
      const uName = schFold_(u.username || '');
      return gv && (gv.indexOf(sName) >= 0 || gv.indexOf(tName) >= 0 || gv.indexOf(uName) >= 0 || sName.indexOf(gv) >= 0);
    });

    const activeStudents = myStudents.filter(function(s){ return String(s.tinhTrang || '').indexOf('Đang học') >= 0; });
    const newStudents = activeStudents.filter(function(s){ return String(s.loaiHocVien || 'NEW').toUpperCase() === 'NEW'; });
    const renewedStudents = activeStudents.filter(function(s){ return String(s.loaiHocVien || '').toUpperCase() !== 'NEW'; });

    const luongTrenHv = parseFloat(clean.luongTrenHocVien) || (clean.username === 'linh' ? 0 : 400000);
    const hoaHongMoi = parseFloat(clean.hoaHongHocVienMoi) || (clean.username === 'linh' ? 250000 : 200000);
    const hoaHongGiaHan = parseFloat(clean.hoaHongGiaHan) || (clean.username === 'linh' ? 350000 : 300000);

    const baseSalary = activeStudents.length * luongTrenHv;
    const bonusNew = newStudents.length * hoaHongMoi;
    const bonusRenew = renewedStudents.length * hoaHongGiaHan;
    const cashCollected = myStudents.reduce(function(sum, s){ return sum + (parseFloat(s.tienMatDaThu) || 0); }, 0);
    const totalSalary = baseSalary + bonusNew + bonusRenew;
    const transferAmount = Math.max(0, totalSalary - cashCollected);

    return {
      id: clean.id,
      username: clean.username,
      hoTen: clean.hoTen,
      email: clean.email || '',
      dienThoai: clean.dienThoai || '',
      tenNgan: schShortName_(u),
      mauLich: clean.mauLich || '#34D399',
      dayHoc: schIsTeacher_(u),
      luongTrenHocVien: luongTrenHv,
      hoaHongHocVienMoi: hoaHongMoi,
      hoaHongGiaHan: hoaHongGiaHan,
      soTaiKhoan: clean.soTaiKhoan || (clean.username === 'linh' ? '140396' : ''),
      nganHang: clean.nganHang || (clean.username === 'linh' ? 'VIB' : ''),
      soHocVien: activeStudents.length,
      soHocVienMoi: newStudents.length,
      soHocVienGiaHan: renewedStudents.length,
      baseSalary: baseSalary,
      bonusNew: bonusNew,
      bonusRenew: bonusRenew,
      totalSalary: totalSalary,
      cashCollected: cashCollected,
      transferAmount: transferAmount,
      coMatKhau: !!clean.password
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

function saveTeacher_(data) {
  const now = new Date();
  if (!data.hoTen) throw new Error('Vui lòng nhập họ tên giáo viên');
  if (!data.username) throw new Error('Vui lòng nhập tên đăng nhập');

  const uname = String(data.username).trim().toLowerCase();
  assertUsernameFree_(uname, T.Users, data.id);

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
    permissions: JSON.stringify(DEFAULT_PERMISSIONS.gv),
    updatedAt: now
  };

  if (data.password) {
    if (String(data.password).length < 6) throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
    patch.password = hashPassword_(data.password);
  }

  if (data.id && String(data.id).trim() !== '') {
    update_(T.Users, data.id, patch);
    return { success: true, id: data.id, message: 'Đã cập nhật thông tin giáo viên!' };
  } else {
    if (!data.password || String(data.password).length < 6) throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
    const id = nextId_(T.Users, 'USR');
    patch.id = id;
    patch.active = true;
    patch.createdAt = now;
    insert_(T.Users, patch);
    return { success: true, id: id, message: 'Đã tạo giáo viên mới thành công!' };
  }
}

function deleteTeacher_(id) {
  return deleteTeachers_([id]);
}

function deleteTeachers_(ids) {
  return deleteUsers_(ids);
}

// ===================== API — KHÁM PHÁ & BÀI TẬP LUYỆN THANH =====================
function getExercises_() {
  const rows = readAll_(T.BaiLuyenThanh).filter(function(r){ return r.active !== false && r.active !== 'FALSE'; });
  return rows.map(cleanRow_);
}

// ===================== API — KHÁM PHÁ (ẩn danh, mọi vai trò xem được) =====================
// Gom bài hát của TẤT CẢ học viên (không lọc theo GV, KHÔNG kèm tên/thông tin học viên)
// + bài luyện thanh. Phục vụ tab "Khám phá".
function getDiscoverData_() {
  const students = readAll_(T.HocVien).filter(function(r){ return r.active !== false && String(r.active).toUpperCase() !== 'FALSE'; });
  const stById = {};
  students.forEach(function(s){ stById[String(s.id)] = s; });

  const songsMap = {};
  const parseJson_ = function(v){ try { return v ? (typeof v === 'string' ? JSON.parse(v) : v) : []; } catch(e) { return []; } };
  const ensure_ = function(title){
    const k = schFold_(title);
    if (!songsMap[k]) songsMap[k] = { title: String(title).trim(), ytLink: '', noteCao: '', noteThap: '', tone: '0', details: '', chatGiong: {}, kyThuat: {}, learnedCount: 0 };
    return songsMap[k];
  };
  const addVoice_ = function(e, st){ if (st && st.loaiGiong) e.chatGiong[String(st.loaiGiong).trim()] = true; };
  const addTech_  = function(e, name){ const n = String(name || '').trim(); if (n) e.kyThuat[n] = true; };

  readAll_(T.BuoiHoc).forEach(function(b){
    const st = stById[String(b.hocVienId)];
    const songs = parseJson_(b.songsJson);

    const techNames = [];
    if (b.focusSkillName) techNames.push(b.focusSkillName);
    parseJson_(b.techsJson).forEach(function(t){ if (t && t.name) techNames.push(t.name); });

    const applySong_ = function(e){
      e.learnedCount++;
      addVoice_(e, st);
      techNames.forEach(function(n){ addTech_(e, n); });
    };

    if (Array.isArray(songs)) songs.forEach(function(s){
      if (!s || !s.title || !String(s.title).trim()) return;
      const e = ensure_(s.title);
      if (!e.ytLink && s.ytLink)     e.ytLink = s.ytLink;
      if (!e.noteCao && s.noteCao)   e.noteCao = s.noteCao;
      if (!e.noteThap && s.noteThap) e.noteThap = s.noteThap;
      if ((!e.tone || e.tone === '0') && s.tone) e.tone = s.tone;
      if (!e.details && s.details)   e.details = s.details;
      applySong_(e);
    });

    if (b.baiHat && String(b.baiHat).trim() && b.baiHat !== 'Thực hành bài hát') {
      const e = ensure_(b.baiHat);
      if (!e.ytLink && b.linkYoutube) e.ytLink = b.linkYoutube;
      if (!e.noteCao && b.noteCao)    e.noteCao = b.noteCao;
      if (!e.noteThap && b.noteThap)  e.noteThap = b.noteThap;
      if (!e.details && b.noiDung)    e.details = b.noiDung;
      applySong_(e);
    }
  });

  readAll_(T.PhanTichBai).forEach(function(p){
    if (!p.tenBai || !String(p.tenBai).trim()) return;
    const full = (p.tenBai + (p.ca ? ' - ' + p.ca : '')).trim();
    const e = ensure_(full);
    if (!e.ytLink && p.linkYoutube) e.ytLink = p.linkYoutube;
    if (!e.details && p.ketQuaAI)   e.details = p.ketQuaAI;
    e.learnedCount++;
    addVoice_(e, stById[String(p.hocVienId)]);
  });

  const songs = Object.keys(songsMap).map(function(k){
    const e = songsMap[k];
    return {
      title: e.title, ytLink: e.ytLink, tone: e.tone,
      noteCao: e.noteCao, noteThap: e.noteThap,
      chatGiong: Object.keys(e.chatGiong),
      kyThuat: Object.keys(e.kyThuat),
      details: e.details, learnedCount: e.learnedCount
    };
  }).sort(function(a, b){ return b.learnedCount - a.learnedCount; });

  return { songs: songs, exercises: getExercises_() };
}

function saveExercise_(data) {
  const now = new Date();
  if (!data.tenBai) throw new Error('Vui lòng nhập tên bài tập');

  const patch = {
    tenBai: String(data.tenBai).trim(),
    kyThuat: String(data.kyThuat || 'Khác').trim(),
    linkYoutube: String(data.linkYoutube || '').trim(),
    linkHuongDan: String(data.linkHuongDan || '').trim(),
    ghiChu: String(data.ghiChu || '').trim(),
    nguoiTao: (ME_ && (ME_.hoTen || ME_.username)) || 'Hệ thống',
    updatedAt: now
  };

  if (data.id && String(data.id).trim() !== '') {
    update_(T.BaiLuyenThanh, data.id, patch);
    return { success: true, id: data.id, message: 'Đã cập nhật bài luyện thanh!' };
  } else {
    const id = nextId_(T.BaiLuyenThanh, 'EX');
    patch.id = id;
    patch.active = true;
    patch.createdAt = now;
    insert_(T.BaiLuyenThanh, patch);
    return { success: true, id: id, message: 'Đã thêm bài luyện thanh vào Thư viện Khám phá!' };
  }
}

function deleteExercise_(id) {
  update_(T.BaiLuyenThanh, id, { active: false, updatedAt: new Date() });
  return { success: true, message: 'Đã xoá bài luyện thanh.' };
}

// ===================== API — DASHBOARD =====================
function getDashboard_() {
  const hv = readAll_(T.HocVien).filter(function(r){ return r.active !== false && r.active !== 'FALSE'; }).filter(canSeeStudent_);
  const count = function(f){ return hv.filter(f).length; };
  const norm = function(s){ return String(s||'').trim(); };

  const byStatus = {};
  const byRank = { A:0, B:0, C:0, D:0 };
  const byLop = {};
  hv.forEach(function(r){
    const st = norm(r.tinhTrang) || 'Khác';
    byStatus[st] = (byStatus[st]||0)+1;
    const rk = norm(r.rank).toUpperCase();
    if (byRank[rk] !== undefined) byRank[rk]++;
    const lp = norm(r.lop) || 'Chưa xếp';
    byLop[lp] = (byLop[lp]||0)+1;
  });

  const isNghi = function(s){ s=norm(s); return s.indexOf('nghỉ')>=0 || s.indexOf('Nghỉ')>=0; };
  const isThu  = function(s){ s=norm(s); return s.indexOf('thử')>=0; };
  const isHoc  = function(s){ s=norm(s); return s.indexOf('Đang học')>=0; };
  const isDone = function(s){ s=norm(s); return s.indexOf('hoàn thành')>=0; };

  return {
    tong:      hv.length,
    dangHoc:   count(function(r){ return isHoc(r.tinhTrang); }),
    hoanThanh: count(function(r){ return isDone(r.tinhTrang); }),
    nghi:      count(function(r){ return isNghi(r.tinhTrang); }),
    hocThu:    count(function(r){ return isThu(r.tinhTrang); }),
    byStatus: byStatus, byRank: byRank, byLop: byLop
  };
}

// ===================== TIỆN ÍCH NGÀY THÁNG DD/MM/YYYY =====================
function parseDateAny_(d) {
  if (!d) return null;
  if (d instanceof Date && !isNaN(d.getTime())) return d;
  if (typeof d === 'string') {
    d = d.trim();
    if (!d) return null;
    // Hỗ trợ dạng d/m/yyyy hoặc dd/mm/yyyy
    const dmy = d.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmy) {
      return new Date(parseInt(dmy[3],10), parseInt(dmy[2],10)-1, parseInt(dmy[1],10));
    }
    // Hỗ trợ dạng yyyy-mm-dd
    const ymd = d.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (ymd) {
      return new Date(parseInt(ymd[1],10), parseInt(ymd[2],10)-1, parseInt(ymd[3],10));
    }
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? null : dt;
  }
  return null;
}

function toStorageDate_(d) {
  if (!d) return '';
  const dt = parseDateAny_(d);
  if (dt) {
    const day = String(dt.getDate()).padStart(2, '0');
    const mon = String(dt.getMonth() + 1).padStart(2, '0');
    const yr  = dt.getFullYear();
    return day + '/' + mon + '/' + yr;
  }
  return String(d);
}

// Kiểm tra và dọn dẹp thư mục Drive của học viên đã quá 60 ngày kể từ ngày bắt đầu / gia hạn
function cleanExpiredDriveFolders_() {
  const students = readAll_(T.HocVien);
  const now = new Date();
  const todayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const cleaned = [];

  students.forEach(function(s){
    if (!s || !s.id || s.active === false || s.active === 'FALSE') return;
    if (s.daXoaDrive === true || s.daXoaDrive === 'TRUE') return;

    // Mốc tính: ngayKhoaMoi nếu có, ngược lại ngayBatDau
    const baseDateStr = s.ngayKhoaMoi || s.ngayBatDau;
    if (!baseDateStr) return;
    const baseDate = parseDateAny_(baseDateStr);
    if (!baseDate) return;

    // Hạn chót = mốc + 60 ngày
    const expireMs = baseDate.getTime() + (60 * 24 * 60 * 60 * 1000);
    const expireDate = new Date(expireMs);
    const expireDayMs = new Date(expireDate.getFullYear(), expireDate.getMonth(), expireDate.getDate()).getTime();

    // Nếu đã quá 60 ngày
    if (todayMs > expireDayMs) {
      // 1. Tự động xóa/thùng rác Drive Folder nếu có link
      if (s.linkDrive && String(s.linkDrive).indexOf('drive.google.com') >= 0) {
        try {
          const match = String(s.linkDrive).match(/folders\/([a-zA-Z0-9_-]+)/);
          if (match && match[1]) {
            DriveApp.getFolderById(match[1]).setTrashed(true);
          }
        } catch(e) {
          Logger.log('Không thể xóa folder Drive của ' + s.id + ': ' + e.message);
        }
      }

      // 2. Chuyển sang hồ sơ lưu trữ tối giản (chỉ lưu Tên, SĐT, Zalo, Lớp đã từng học)
      const patch = {
        daXoaDrive: true,
        ngayXoaDrive: Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy'),
        linkDrive: '',
        tinhTrang: 'Đã hết hạn lưu trữ (Đã xoá Drive)',
        lopDaTungHoc: s.lop || '',
        quangGiong: '',
        noteThap: '',
        noteCao: '',
        chestVoice: '',
        mixVoice: '',
        falsetto: '',
        headVoice: '',
        whistleVoice: '',
        mucTieu: '',
        diemManh: '',
        diemYeu: '',
        keHoach: '',
        khuyenNghi: '',
        updatedAt: now
      };
      update_(T.HocVien, s.id, patch);
      cleaned.push({ id: s.id, hoTen: s.hoTen, lop: s.lop });
    }
  });

  return { success: true, count: cleaned.length, cleaned: cleaned };
}

// ===================== API — HỌC VIÊN =====================
/**
 * 3. Tối ưu getStudents_: Không chạy fixBlankIds_ và cleanExpiredDriveFolders_ inline.
 * Tận dụng in-memory cache từ readAll_(T.HocVien) giúp tải danh sách siêu nhanh.
 */
// ---- Phân quyền theo Giáo viên: GV chỉ thấy học viên do mình phụ trách ----
// Trả về tên GV (đã fold) của tài khoản hiện tại, '' nếu không phải GV.
function myTeacherFold_() {
  if (!ME_ || ME_.role !== 'gv') return '';
  if (CACHE_MEM_ && CACHE_MEM_.__myTeacherFold !== undefined) return CACHE_MEM_.__myTeacherFold;
  const row = findAccount_('user', ME_.id);
  const f = schFold_(row ? schShortName_(row) : (ME_.hoTen || ''));
  if (CACHE_MEM_) CACHE_MEM_.__myTeacherFold = f;
  return f;
}
// Admin: thấy tất cả. GV: chỉ học viên có giaoVien trùng tên mình. viewer/hv: không truy cập danh sách HV mặc định.
function canSeeStudent_(st) {
  if (!ME_) return false;
  if (ME_.role === 'admin') return true;
  if (ME_.role === 'gv') {
    const mine = myTeacherFold_();
    return !!mine && schFold_(st.giaoVien || '') === mine;
  }
  if (ME_.role === 'viewer') return hasPermMe_('students', 'view');   // viewer: xem tất cả (chỉ đọc) nếu được cấp quyền
  return false;
}

function getStudents_() {
  return readAll_(T.HocVien)
    .filter(function(r){ return r.active !== false && r.active !== 'FALSE'; })
    .filter(canSeeStudent_)
    .map(studentOut_);
}

/**
 * Trigger chạy định kỳ hàng ngày (chạy vào ban đêm qua Time-driven trigger)
 */
function triggerDailyDriveCleanup_() {
  try {
    checkAndCleanExpiredDriveFolders_();
  } catch(e) {
    Logger.log('Lỗi triggerDailyDriveCleanup_: ' + e.message);
  }
}

// Không bao giờ gửi mật khẩu (kể cả bản băm) ra trình duyệt
function studentOut_(r) {
  const out = cleanRow_(r);
  out.coMatKhau = !!String(out.password || '');
  delete out.password;
  if (ME_ && ME_.role !== 'admin') {               // Học phí chỉ Admin xem
    delete out.hocPhi; delete out.daDongHocPhi; delete out.tienMatDaThu; delete out.loaiHocVien;
  }
  return out;
}

/**
 * 5. Tối ưu getStudent_(id): Đọc dữ liệu qua cache in-memory, lọc theo id
 */
function getStudent_(id) {
  const targetId = String(id || '').trim();
  const s = readAll_(T.HocVien).filter(function(r){ return String(r.id).trim() === targetId; })[0];
  if (!s) return null;
  if (!canSeeStudent_(s)) throw new Error('Bạn không có quyền xem học viên này');
  const out = studentOut_(s);
  out.buoiHoc      = readAll_(T.BuoiHoc).filter(function(r){ return String(r.hocVienId).trim() === targetId; }).map(cleanRow_);
  out.danhGiaGiong = readAll_(T.DanhGiaGiong).filter(function(r){ return String(r.hocVienId).trim() === targetId; }).map(cleanRow_);
  out.phanTichBai  = readAll_(T.PhanTichBai).filter(function(r){ return String(r.hocVienId).trim() === targetId; }).map(cleanRow_);
  return out;
}

function saveStudent_(data) {
  const now = new Date();
  
  // Chuẩn hoá ngày tháng sang dd/mm/yyyy
  if (data.ngayBatDau)  data.ngayBatDau  = toStorageDate_(data.ngayBatDau);
  if (data.ngayKhoaMoi) data.ngayKhoaMoi = toStorageDate_(data.ngayKhoaMoi);
  if (data.dienThoai !== undefined)  data.dienThoai  = String(data.dienThoai || '').trim();
  if (data.email !== undefined)      data.email      = String(data.email || '').trim();
  if (data.zalo !== undefined)       data.zalo       = String(data.zalo || '').trim();
  if (data.facebook !== undefined)   data.facebook   = String(data.facebook || '').trim();

  // Tự động tính số buổi (bỏ qua khi chỉ cập nhật một phần, VD: áp dụng Rank/Lộ trình)
  const isPartialUpdate = data.id && String(data.id).trim() !== '' &&
    data.soBuoiKhoa === undefined && data.soBuoiDeal === undefined && data.soBuoiDaHoc === undefined;
  const soKhoa = parseInt(data.soBuoiKhoa || data.soBuoiDeal, 10) || 0;
  if (!isPartialUpdate) {
    const daHoc  = parseInt(data.soBuoiDaHoc, 10) || 0;
    const conLai = Math.max(0, soKhoa - daHoc);
    data.soBuoiKhoa   = soKhoa;
    data.soBuoiDeal   = data.soBuoiDeal || soKhoa;
    data.soBuoiDaHoc  = daHoc;
    data.soBuoiConLai = conLai;
  }

  // Học phí & phân chia doanh thu: chỉ Admin được ghi (chặn cả khi gửi thẳng lên server)
  if (ME_ && ME_.role !== 'admin') {
    delete data.loaiHocVien; delete data.hocPhi; delete data.daDongHocPhi; delete data.tienMatDaThu;
  }

  // Xử lý học phí & loại học viên
  if (data.hocPhi !== undefined) data.hocPhi = parseFloat(data.hocPhi) || (soKhoa >= 8 ? 2500000 : 1750000);
  if (data.tienMatDaThu !== undefined) data.tienMatDaThu = parseFloat(data.tienMatDaThu) || 0;
  if (data.daDongHocPhi !== undefined) {
    data.daDongHocPhi = (String(data.daDongHocPhi).toUpperCase() === 'PAID' || data.daDongHocPhi === true || String(data.daDongHocPhi).toUpperCase() === 'TRUE');
  }
  // Chỉ gán mặc định loại HV khi tạo mới (GV không gửi trường học phí → không ghi đè dữ liệu Admin)
  if (!data.loaiHocVien && !(data.id && String(data.id).trim() !== '')) data.loaiHocVien = 'NEW';

  if (data.lop) { data.lop = String(data.lop).trim(); addClassToList_(data.lop); }

  // Phân quyền theo GV: GV chỉ được tạo/sửa học viên của chính mình
  if (ME_ && ME_.role === 'gv') {
    if (data.id && String(data.id).trim() !== '') {
      const existing = readAll_(T.HocVien).filter(function(r){ return String(r.id).trim() === String(data.id).trim(); })[0];
      if (existing && !canSeeStudent_(existing)) throw new Error('Bạn không có quyền sửa học viên này');
    }
    const meRow = findAccount_('user', ME_.id);
    if (meRow) data.giaoVien = schShortName_(meRow);   // luôn gán về chính GV, không cho gán cho GV khác
  }

  // Tài khoản đăng nhập của học viên
  delete data.coMatKhau;
  if (data.username !== undefined) {
    data.username = String(data.username || '').trim();
    assertUsernameFree_(data.username, T.HocVien, data.id);
  }
  if (data.password !== undefined) {
    if (String(data.password || '') === '') {
      delete data.password;                       // Để trống = giữ mật khẩu cũ
    } else if (!isHashed_(data.password)) {
      if (String(data.password).length < 6) throw new Error('Mật khẩu học viên phải có ít nhất 6 ký tự');
      data.password = hashPassword_(data.password);
    }
  }

  // Nếu có ID hợp lệ -> Cập nhật
  if (data.id && String(data.id).trim() !== '') {
    data.updatedAt = now;
    update_(T.HocVien, data.id, data);
    return data.id;
  }
  
  // Nếu chưa có ID -> Sinh ID mới chuẩn HV-xxxxxx
  const id = nextId_(T.HocVien, 'HV');
  const cleanData = Object.assign({}, data);
  delete cleanData.id; // Đảm bảo không bị đè bởi id rỗng
  
  const obj = Object.assign({
    id: id,
    active: true,
    createdAt: now,
    updatedAt: now,
    tinhTrang: data.tinhTrang || 'Đang học',
    rank: data.rank || 'A'
  }, cleanData);
  
  insert_(T.HocVien, obj);
  return id;
}

function deleteStudents_(ids) {
  if (!ids) return { success: false, message: 'Chưa chọn học viên nào' };
  if (!Array.isArray(ids)) ids = [ids];
  if (!ids.length) return { success: false, message: 'Danh sách học viên rỗng' };

  let idStrs = ids.map(function(id){ return String(id).trim(); });

  // Phân quyền theo GV: chỉ cho xoá học viên của chính mình
  if (ME_ && ME_.role !== 'admin') {
    const allowed = schIndex_(readAll_(T.HocVien).filter(canSeeStudent_));
    idStrs = idStrs.filter(function(id){ return !!allowed[id]; });
    if (!idStrs.length) return { success: false, message: 'Bạn không có quyền xoá học viên đã chọn' };
  }

  // 1. Xoá hàng trực tiếp trên sheet HocVien (Batch update)
  const sh = sheet_(T.HocVien);
  const data = sh.getDataRange().getValues();
  if (data.length >= 2) {
    const idCol = data[0].indexOf('id');
    if (idCol !== -1) {
      const remaining = [data[0]];
      for (let r = 1; r < data.length; r++) {
        if (idStrs.indexOf(String(data[r][idCol] || '').trim()) === -1) {
          remaining.push(data[r]);
        }
      }
      sh.clearContents();
      if (remaining.length > 0) {
        sh.getRange(1, 1, remaining.length, remaining[0].length).setValues(remaining);
      }
    }
  }

  // 2. Xoá tất cả các buổi học liên quan trên sheet BuoiHoc
  const shBh = sheet_(T.BuoiHoc);
  const dataBh = shBh.getDataRange().getValues();
  if (dataBh.length >= 2) {
    const hvCol = dataBh[0].indexOf('hocVienId');
    if (hvCol !== -1) {
      const remainingBh = [dataBh[0]];
      for (let r = 1; r < dataBh.length; r++) {
        if (idStrs.indexOf(String(dataBh[r][hvCol] || '').trim()) === -1) {
          remainingBh.push(dataBh[r]);
        }
      }
      shBh.clearContents();
      if (remainingBh.length > 0) {
        shBh.getRange(1, 1, remainingBh.length, remainingBh[0].length).setValues(remainingBh);
      }
    }
  }

  // 3. Xoá các đánh giá giọng & phân tích bài liên quan
  ['DanhGiaGiong', 'PhanTichBai'].forEach(function(tName){
    const shOther = sheet_(tName);
    const dOther = shOther.getDataRange().getValues();
    if (dOther.length >= 2) {
      const hvCol = dOther[0].indexOf('hocVienId');
      if (hvCol !== -1) {
        const rem = [dOther[0]];
        for (let r = 1; r < dOther.length; r++) {
          if (idStrs.indexOf(String(dOther[r][hvCol] || '').trim()) === -1) {
            rem.push(dOther[r]);
          }
        }
        shOther.clearContents();
        if (rem.length > 0) {
          shOther.getRange(1, 1, rem.length, rem[0].length).setValues(rem);
        }
      }
    }
  });

  // 9. Xoá cache để các lần đọc tiếp theo cập nhật ngay lập tức
  invalidateCache_();
  invalidateDashboardCache_();
  invalidateTuitionCache_();

  return { success: true, count: ids.length, message: 'Đã xoá ' + ids.length + ' học viên và toàn bộ dữ liệu liên quan!' };
}

function deleteStudent_(id) {
  return deleteStudents_([id]);
}

/**
 * Gia hạn = mở 1 KHOÁ MỚI cho học viên học nhiều khoá.
 *  - soBuoiKhoa: tổng số buổi cộng dồn mọi khoá (để "còn lại" = tổng − đã học như cũ)
 *  - buoiDauKhoa: tổng buổi của các khoá trước → buổi đã học trong khoá này = soBuoiDaHoc − buoiDauKhoa
 *  - soBuoiKhoaHienTai / soKhoaDaHoc / lichSuKhoa: thông tin khoá hiện tại & lịch sử
 *  - Khoá mới chưa đóng học phí; loại HV tự nâng (khoá 2 → 2 khoá, khoá 3+ → nhiều khoá)
 * opts: { hocPhi } — chỉ Admin được đặt học phí khoá mới
 */
function renewStudentSessions_(hocVienId, extraSessions, newTotalSessions, opts) {
  opts = opts || {};
  const now = new Date();
  const hv = readAll_(T.HocVien).filter(function(r){ return String(r.id) === String(hocVienId); })[0];
  if (!hv) throw new Error('Không tìm thấy học viên');

  const currentKhoa = parseInt(hv.soBuoiKhoa || hv.soBuoiDeal, 10) || 0;
  const daHoc = parseInt(hv.soBuoiDaHoc, 10) || 0;
  let extra = parseInt(extraSessions, 10) || 0;
  if (!extra && newTotalSessions != null && parseInt(newTotalSessions, 10) > currentKhoa) extra = parseInt(newTotalSessions, 10) - currentKhoa;
  if (extra <= 0) throw new Error('Số buổi gia hạn phải lớn hơn 0');

  const finalKhoa = currentKhoa + extra;
  const conLai = Math.max(0, finalKhoa - daHoc);
  const soKhoa = (parseInt(hv.soKhoaDaHoc, 10) || 1) + 1;
  const today = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const isAdmin = ME_ && ME_.role === 'admin';
  const fee = (isAdmin && opts.hocPhi !== undefined && opts.hocPhi !== '' && opts.hocPhi !== null)
    ? (parseFloat(opts.hocPhi) || 0) : (extra >= 12 ? 3500000 : (extra >= 8 ? 2500000 : 1750000));

  let history = [];
  try { history = JSON.parse(hv.lichSuKhoa || '[]'); } catch(e) { history = []; }
  if (!history.length) {
    history.push({ khoa: 1, ngay: schToYmd_(hv.ngayKhoaMoi || hv.ngayBatDau), soBuoi: currentKhoa, hocPhi: Number(hv.hocPhi) || 0,
                   daDong: schIsTrue_(hv.daDongHocPhi) });
  }
  history.push({ khoa: soKhoa, ngay: today, soBuoi: extra, hocPhi: fee, daDong: false });

  const patch = {
    soBuoiKhoa: finalKhoa,
    soBuoiDeal: extra,
    soBuoiConLai: conLai,
    soBuoiKhoaHienTai: extra,
    buoiDauKhoa: currentKhoa,
    soKhoaDaHoc: soKhoa,
    lichSuKhoa: JSON.stringify(history),
    tinhTrang: 'Đang học',
    ngayKhoaMoi: today,
    hocPhi: fee,
    daDongHocPhi: false,
    tienMatDaThu: 0,
    loaiHocVien: soKhoa >= 3 ? 'STUDIED_MANY' : 'STUDIED_2_TERMS',
    updatedAt: now
  };
  update_(T.HocVien, hocVienId, patch);

  return {
    success: true,
    soBuoiKhoa: finalKhoa,
    soBuoiDaHoc: daHoc,
    soBuoiConLai: conLai,
    soKhoaDaHoc: soKhoa,
    soBuoiKhoaHienTai: extra,
    message: 'Đã mở khoá ' + soKhoa + ' (' + extra + ' buổi) cho ' + (hv.hoTen || 'học viên') + '. Còn lại: ' + conLai + ' buổi.'
  };
}

// ===================== API — BUỔI HỌC =====================
/**
 * 6. Tối ưu saveSession_: Không đọc lại toàn bộ sheet BuoiHoc để đếm count,
 * tính trực tiếp từ số buổi đã có + 1 và cập nhật HocVien.
 */
function saveSession_(data) {
  const now = new Date();
  if (data.id && String(data.id).trim() !== '') {
    update_(T.BuoiHoc, data.id, data);
    invalidateDashboardCache_();
    invalidateTuitionCache_();
    return data.id;
  }
  const id = nextId_(T.BuoiHoc, 'BH');
  const cleanData = Object.assign({}, data);
  delete cleanData.id;
  cleanData.ngayHoc = toStorageDate_(cleanData.ngayHoc || now);
  const obj = Object.assign({ id: id, createdAt: now }, cleanData);
  insert_(T.BuoiHoc, obj);
  
  // Cập nhật số buổi đã học và tính lại số buổi còn lại mà không cần quét lại toàn bộ BuoiHoc
  const targetHvId = String(data.hocVienId || '').trim();
  const hv = readAll_(T.HocVien).filter(function(r){ return String(r.id).trim() === targetHvId; })[0];
  const soKhoa = hv ? (parseInt(hv.soBuoiKhoa || hv.soBuoiDeal, 10) || 0) : 0;
  const currentAttended = (hv && hv.soBuoiDaHoc !== undefined && hv.soBuoiDaHoc !== '')
    ? (parseInt(hv.soBuoiDaHoc, 10) || 0)
    : (readAll_(T.BuoiHoc).filter(function(r){ return String(r.hocVienId).trim() === targetHvId; }).length);
  const cnt = currentAttended + 1;
  const conLai = Math.max(0, soKhoa - cnt);
  
  update_(T.HocVien, targetHvId, {
    soBuoiDaHoc: cnt,
    soBuoiConLai: conLai,
    updatedAt: now
  });
  invalidateDashboardCache_();
  invalidateTuitionCache_();
  return id;
}

function deleteSessions_(sessionIds, hocVienId) {
  if (!Array.isArray(sessionIds)) sessionIds = [sessionIds];
  sessionIds = sessionIds.map(function(id){ return String(id).trim(); });
  
  const sh = sheet_(T.BuoiHoc);
  const data = sh.getDataRange().getValues();
  if (data.length < 2) return { success: true, count: 0 };
  
  const head = data[0];
  const idCol = head.indexOf('id');
  const hvIdCol = head.indexOf('hocVienId');
  if (idCol === -1) return { success: false, message: 'Không tìm thấy cột id' };

  const remaining = [head];
  let deletedCount = 0;
  let remainingHvCount = 0;
  const targetHvId = hocVienId ? String(hocVienId).trim() : '';

  for (let r = 1; r < data.length; r++) {
    const rowId = String(data[r][idCol] || '').trim();
    if (sessionIds.indexOf(rowId) !== -1) {
      deletedCount++;
    } else {
      remaining.push(data[r]);
      if (targetHvId && hvIdCol !== -1 && String(data[r][hvIdCol] || '').trim() === targetHvId) {
        remainingHvCount++;
      }
    }
  }

  if (deletedCount > 0) {
    // Xoá và ghi lại toàn bộ bảng trong 1 thao tác duy nhất (Batch write siêu tốc)
    sh.clearContents();
    sh.getRange(1, 1, remaining.length, remaining[0].length).setValues(remaining);
    invalidateCache_(T.BuoiHoc);
    invalidateDashboardCache_();
    invalidateTuitionCache_();
  }

  // Cập nhật lại số buổi đã học và còn lại cho học viên (sử dụng count đã đếm sẵn trong loop)
  if (targetHvId) {
    const now = new Date();
    const hv = readAll_(T.HocVien).filter(function(r){ return String(r.id).trim() === targetHvId; })[0];
    const soKhoa = hv ? (parseInt(hv.soBuoiKhoa || hv.soBuoiDeal, 10) || 0) : 0;
    const conLai = Math.max(0, soKhoa - remainingHvCount);
    
    update_(T.HocVien, targetHvId, {
      soBuoiDaHoc: remainingHvCount,
      soBuoiConLai: conLai,
      updatedAt: now
    });
  }

  return { success: true, count: deletedCount, message: 'Đã xoá ' + deletedCount + ' buổi học thành công.' };
}

// ===================== API — QUẢN LÝ HỌC PHÍ & QUYẾT TOÁN DOANH THU =====================

/**
 * 8. Lấy toàn bộ dữ liệu học phí, điểm danh và quyết toán chia sẻ doanh thu
 * Tối ưu: Dùng CacheService cache kết quả trong 120 giây (key: tuition_m_y_ver)
 * @param {number|string} month - Tháng (1-12)
 * @param {number|string} year - Năm (VD: 2026)
 */
function getTuitionSettlementData_(month, year) {
  const now = new Date();
  const m = month ? parseInt(month, 10) : (now.getMonth() + 1);
  const y = year ? parseInt(year, 10) : now.getFullYear();
  const ver = getTuitionCacheVer_();
  const cacheKey = 'tuition_' + m + '_' + y + '_' + ver;

  // Kiểm tra cache từ CacheService
  try {
    const cached = CacheService.getScriptCache().get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch(e) {}

  const students = readAll_(T.HocVien).filter(function(r){ return r.active !== false && r.active !== 'FALSE' && !isTrialStudent_(r); });
  const allSessions = readAll_(T.BuoiHoc);

  // Nhóm buổi học theo học viên
  const sessionsByStudent = {};
  allSessions.forEach(function(b){
    const hId = String(b.hocVienId || '').trim();
    if (!sessionsByStudent[hId]) sessionsByStudent[hId] = [];
    sessionsByStudent[hId].push(b);
  });

  let totalTuition = 0;
  let totalLinh = 0;
  let totalQuan = 0;
  let totalCenter = 0;
  let totalCashCollected = 0;
  let unpaidCount = 0;
  let renewAlertCount = 0;

  const studentList = students.map(function(s){
    const row = cleanRow_(s);
    const sId = String(row.id || '').trim();
    const stSessions = sessionsByStudent[sId] || [];

    // Số buổi deal & đã học
    const totalDeal = parseInt(row.soBuoiKhoa || row.soBuoiDeal, 10) || 12;
    const attended = stSessions.length;
    const remaining = Math.max(0, totalDeal - attended);

    // Học phí
    const tuition = parseFloat(row.hocPhi) || (totalDeal >= 8 ? 2500000 : 1750000);
    const isPaid = (String(row.daDongHocPhi).toUpperCase() === 'TRUE' || row.daDongHocPhi === true || String(row.daDongHocPhi).toUpperCase() === 'PAID');
    const cashCollected = parseFloat(row.tienMatDaThu) || 0;
    const gv = String(row.giaoVien || 'Linh').trim();
    const isPrimaryTeacher = (gv.toLowerCase().indexOf('quân') === -1 && gv.toLowerCase().indexOf('quan') === -1);
    const studentType = String(row.loaiHocVien || 'NEW').trim().toUpperCase();

    // Tính trạng thái cảnh báo nợ học phí
    let paymentAlert = 'ACTIVE'; // 'UNPAID' | 'RENEW_SOON' | 'ACTIVE'
    let paymentAlertText = 'Đang học';
    let paymentAlertBadge = 'st-hoc';

    if (!isPaid) {
      paymentAlert = 'UNPAID';
      paymentAlertText = 'Cần thu tiền';
      paymentAlertBadge = 'st-nghi'; // Đỏ
      unpaidCount++;
    } else if (remaining <= 1) {
      paymentAlert = 'RENEW_SOON';
      paymentAlertText = remaining === 0 ? 'Hết buổi' : 'Sắp đến hạn đóng';
      paymentAlertBadge = 'st-done'; // Vàng cam
      renewAlertCount++;
    }

    // Tính toán chia sẻ doanh thu (Revenue Sharing)
    let teacherCommissionRate = 0;
    let teacherRevenue = 0;
    let centerRevenue = 0;
    let externalTeacherPay = 0;

    if (isPrimaryTeacher) {
      // Giáo viên chính (Linh): 70% nếu học từ 2 khóa trở lên, 60% nếu học viên mới
      if (studentType === 'STUDIED_2_TERMS' || studentType === 'STUDIED_MANY') {
        teacherCommissionRate = 0.70;
      } else {
        teacherCommissionRate = 0.60;
      }
      teacherRevenue = Math.round(tuition * teacherCommissionRate);
      centerRevenue = Math.round(tuition - teacherRevenue - cashCollected);
      totalLinh += teacherRevenue;
      totalCashCollected += cashCollected;
    } else {
      // Giáo viên cộng tác (Quân): 150k/buổi theo tổng số buổi
      teacherCommissionRate = 0;
      externalTeacherPay = totalDeal * 150000;
      teacherRevenue = externalTeacherPay;
      centerRevenue = Math.round(tuition - externalTeacherPay);
      totalQuan += externalTeacherPay;
    }

    totalTuition += tuition;
    totalCenter += centerRevenue;

    return {
      id: sId,
      hoTen: row.hoTen || '—',
      lop: row.lop || '—',
      rank: row.rank || 'A',
      giaoVien: gv,
      isPrimaryTeacher: isPrimaryTeacher,
      studentType: studentType,
      totalDealSessions: totalDeal,
      attendedSessionsCount: attended,
      remainingSessions: remaining,
      tuitionFee: tuition,
      isPaid: isPaid,
      cashCollected: cashCollected,
      paymentAlert: paymentAlert,
      paymentAlertText: paymentAlertText,
      paymentAlertBadge: paymentAlertBadge,
      teacherCommissionRate: teacherCommissionRate,
      teacherRevenue: teacherRevenue,
      centerRevenue: centerRevenue,
      externalTeacherPay: externalTeacherPay,
      linkDrive: row.linkDrive || '',
      sessions: stSessions.map(function(b){
        return {
          id: b.id,
          buoiSo: b.buoiSo,
          ngayHoc: b.ngayHoc,
          baiHat: b.baiHat,
          nhanXet: b.nhanXet
        };
      })
    };
  });

  // Tổng số tiền Anh Thọ cần chuyển khoản cho Linh: Linh nhận - Tiền mặt Linh đã thu
  const thoTransfersToLinh = Math.max(0, totalLinh - totalCashCollected);

  // Kế hoạch thu tháng mới: Các học viên còn <= 1 buổi và đang có trạng thái Đang học
  const renewPlanList = studentList.filter(function(s){
    return s.remainingSessions <= 1;
  });

  // Danh sách cần thu tiền
  const unpaidList = studentList.filter(function(s){
    return !s.isPaid;
  });

  const monthStr = String(m).padStart(2, '0');
  const memoText = 'Thanh toan day nhac thang ' + monthStr + '/' + y;
  const uploadedQr = getQrImageDataUrl_();

  return {
    month: m,
    year: y,
    summary: {
      totalStudents: studentList.length,
      totalTuition: totalTuition,
      totalLinh: totalLinh,
      totalQuan: totalQuan,
      totalCenter: totalCenter,
      totalCashCollected: totalCashCollected,
      thoTransfersToLinh: thoTransfersToLinh,
      unpaidCount: unpaidCount,
      renewAlertCount: renewAlertCount
    },
    students: studentList,
    unpaidList: unpaidList,
    renewPlanList: renewPlanList,
    vietQr: {
      bank: 'VIB',
      accountNumber: '140396',
      accountName: 'NGUYEN QUANG LINH',
      amount: thoTransfersToLinh,
      memo: memoText,
      qrUploaded: !!uploadedQr,
      qrUrl: uploadedQr || ('https://img.vietqr.io/image/VIB-140396-compact2.png?amount=' + thoTransfersToLinh + '&addInfo=' + encodeURIComponent(memoText) + '&accountName=NGUYEN%20QUANG%20LINH')
    }
  };

  // Lưu vào CacheService (120 giây)
  try {
    const jsonStr = JSON.stringify(result);
    if (jsonStr.length < 95000) {
      CacheService.getScriptCache().put(cacheKey, jsonStr, 120);
    }
  } catch(e) {}

  return result;
}

// ===================== MÃ QR THANH TOÁN (ẢNH TẢI LÊN) =====================
// Ảnh lưu trong Google Drive (thư mục chung nếu đã cấu hình), trả về dạng data URL
// nên không cần chia sẻ công khai file.
function getQrImageDataUrl_() {
  const id = PROP.getProperty('QR_FILE_ID');
  if (!id) return '';
  try {
    const blob = DriveApp.getFileById(id).getBlob();
    return 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes());
  } catch(e) {
    return '';
  }
}

function getQrImage_() {
  return { dataUrl: getQrImageDataUrl_() };
}

function uploadQrImage_(dataUrl) {
  const m = String(dataUrl || '').match(/^data:(image\/(png|jpeg|webp));base64,(.+)$/);
  if (!m) throw new Error('Ảnh không hợp lệ (chỉ nhận PNG / JPG / WEBP)');
  const bytes = Utilities.base64Decode(m[3]);
  if (bytes.length > 2 * 1024 * 1024) throw new Error('Ảnh quá lớn (tối đa 2MB)');
  const blob = Utilities.newBlob(bytes, m[1], 'QR_thanh_toan.' + (m[2] === 'jpeg' ? 'jpg' : m[2]));

  let parent = null;
  const sharedId = PROP.getProperty('SHARED_DRIVE_ID');
  if (sharedId) { try { parent = DriveApp.getFolderById(sharedId); } catch(e) {} }
  const file = parent ? parent.createFile(blob) : DriveApp.createFile(blob);

  const old = PROP.getProperty('QR_FILE_ID');
  if (old) { try { DriveApp.getFileById(old).setTrashed(true); } catch(e) {} }
  PROP.setProperty('QR_FILE_ID', file.getId());
  return { success: true, message: 'Đã lưu ảnh mã QR thanh toán' };
}

function removeQrImage_() {
  const old = PROP.getProperty('QR_FILE_ID');
  if (old) { try { DriveApp.getFileById(old).setTrashed(true); } catch(e) {} }
  PROP.deleteProperty('QR_FILE_ID');
  return { success: true, message: 'Đã xoá ảnh QR, quay về mã VietQR tự sinh' };
}

/**
 * Cập nhật nhanh trạng thái học phí & tiền mặt
 */
function updateTuitionPayment_(hocVienId, isPaid, cashCollected) {
  const now = new Date();
  const patch = {
    daDongHocPhi: !!isPaid,
    updatedAt: now
  };
  if (cashCollected !== undefined && cashCollected !== null) {
    patch.tienMatDaThu = parseFloat(cashCollected) || 0;
  }
  update_(T.HocVien, hocVienId, patch);
  return { success: true, message: 'Đã cập nhật học phí học viên thành công!' };
}

/**
 * Điểm danh nhanh 1 chạm cho học viên
 */
function quickCheckInAttendance_(hocVienId, buoiSo, dateStr, notes) {
  const now = new Date();
  const dStr = dateStr || Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  
  const id = nextId_(T.BuoiHoc, 'BH');
  const sessionObj = {
    id: id,
    hocVienId: hocVienId,
    ngayHoc: dStr,
    buoiSo: buoiSo || 1,
    noiDung: notes || 'Điểm danh buổi học',
    createdAt: now
  };
  insert_(T.BuoiHoc, sessionObj);

  // Cập nhật lại số buổi đã học & còn lại
  const hv = readAll_(T.HocVien).filter(function(r){ return String(r.id) === String(hocVienId); })[0];
  const cnt = readAll_(T.BuoiHoc).filter(function(r){ return String(r.hocVienId) === String(hocVienId); }).length;
  const soKhoa = hv ? (parseInt(hv.soBuoiKhoa || hv.soBuoiDeal, 10) || 0) : 0;
  const conLai = Math.max(0, soKhoa - cnt);
  
  update_(T.HocVien, hocVienId, {
    soBuoiDaHoc: cnt,
    soBuoiConLai: conLai,
    updatedAt: now
  });

  return { success: true, sessionId: id, attended: cnt, remaining: conLai, message: 'Đã điểm danh buổi ' + (buoiSo || cnt) + '!' };
}

/**
 * Huỷ điểm danh nhanh
 */
function quickRemoveAttendance_(hocVienId, buoiSo) {
  const sh = sheet_(T.BuoiHoc);
  const data = sh.getDataRange().getValues();
  if (data.length < 2) return { success: false, message: 'Chưa có buổi học' };

  const head = data[0];
  const idCol = head.indexOf('id');
  const hvCol = head.indexOf('hocVienId');
  const bCol = head.indexOf('buoiSo');

  let deletedId = null;
  const remaining = [head];

  for (let r = 1; r < data.length; r++) {
    const rHv = String(data[r][hvCol] || '').trim();
    const rB = String(data[r][bCol] || '').trim();
    if (!deletedId && rHv === String(hocVienId).trim() && (buoiSo ? (rB === String(buoiSo).trim()) : true)) {
      deletedId = data[r][idCol];
    } else {
      remaining.push(data[r]);
    }
  }

  if (deletedId) {
    sh.clearContents();
    sh.getRange(1, 1, remaining.length, remaining[0].length).setValues(remaining);

    // Cập nhật lại số buổi
    const now = new Date();
    const hv = readAll_(T.HocVien).filter(function(r){ return String(r.id) === String(hocVienId); })[0];
    const cnt = readAll_(T.BuoiHoc).filter(function(r){ return String(r.hocVienId) === String(hocVienId); }).length;
    const soKhoa = hv ? (parseInt(hv.soBuoiKhoa || hv.soBuoiDeal, 10) || 0) : 0;
    const conLai = Math.max(0, soKhoa - cnt);
    
    update_(T.HocVien, hocVienId, {
      soBuoiDaHoc: cnt,
      soBuoiConLai: conLai,
      updatedAt: now
    });

    return { success: true, attended: cnt, remaining: conLai, message: 'Đã huỷ điểm danh buổi học!' };
  }
  return { success: false, message: 'Không tìm thấy buổi học để huỷ' };
}

// ===================== API — LƯU ĐÁNH GIÁ / PHÂN TÍCH =====================
function saveVoiceAssessment_(data) {
  const id = nextId_(T.DanhGiaGiong, 'DG');
  const cleanData = Object.assign({}, data);
  delete cleanData.id;
  const obj = Object.assign({ id: id, createdAt: new Date() }, cleanData);
  insert_(T.DanhGiaGiong, obj);
  
  // Đồng bộ rank, quãng giọng, nốt & đề xuất lộ trình về hồ sơ học viên
  const patch = { updatedAt: new Date() };
  if (data.rankGoiY) patch.rank = data.rankGoiY;
  if (data.noteThap) patch.noteThap = data.noteThap;
  if (data.noteCao)  patch.noteCao  = data.noteCao;
  if (data.noteThap && data.noteCao) {
    patch.quangGiong = data.noteThap + '–' + data.noteCao;
  }
  if (data.khuyenNghi) {
    patch.khuyenNghi = data.khuyenNghi;
  }
  if (data.loaiPhieu === 'Test học thử') {
    const hv = readAll_(T.HocVien).filter(function(r){ return String(r.id) === String(data.hocVienId); })[0];
    const ts = hv ? String(hv.trialStatus || '').trim() : '';
    if (!ts || ts === 'new') patch.trialStatus = 'tested';
  }
  update_(T.HocVien, data.hocVienId, patch);
  return id;
}

function saveSongAnalysis_(data) {
  const id = nextId_(T.PhanTichBai, 'PT');
  const cleanData = Object.assign({}, data);
  delete cleanData.id;
  const obj = Object.assign({ id: id, createdAt: new Date() }, cleanData);
  insert_(T.PhanTichBai, obj);
  return id;
}

// ===================== LỘ TRÌNH RANK × MỤC TIÊU (ma trận tĩnh theo giáo trình Tony Music) =====================
const GOAL_LABELS = { G1: '🎤 Hát Karaoke', G2: '☕ Giao lưu Cafe', G3: '🎙 Vocalist chuyên nghiệp', G4: '🎓 Thi trường Âm nhạc' };
// [số khóa, tổng số buổi] để đạt mục tiêu tính từ rank hiện tại
const ROUTE_MATRIX = {
  A: { G1: [3, 18], G2: [4, 24], G3: [6, 36], G4: [6, 36] },
  B: { G1: [2, 12], G2: [3, 18], G3: [4, 24], G4: [4, 24] },
  C: { G1: [1, 6],  G2: [2, 12], G3: [3, 18], G4: [3, 18] },
  D: { G1: [0, 0],  G2: [1, 6],  G3: [2, 12], G4: [2, 12] }
};
const GOAL_TARGET_RANK = { G1: 'B', G2: 'C', G3: 'D', G4: 'D' };

function suggestRoute_(rank, goal) {
  rank = String(rank || 'A').toUpperCase();
  goal = String(goal || '').toUpperCase();
  if (!ROUTE_MATRIX[rank] || !ROUTE_MATRIX[rank][goal]) return null;
  const m = ROUTE_MATRIX[rank][goal];
  const out = {
    goal: goal, goalLabel: GOAL_LABELS[goal] || goal, rankHienTai: rank,
    rankMucTieu: GOAL_TARGET_RANK[goal], soKhoa: m[0], soBuoi: m[1], lyThuyet: goal === 'G4'
  };
  if (m[0] === 0) out.luuY = 'Đã đủ trình độ cho mục tiêu này — có thể nâng lên mục tiêu cao hơn.';
  else out.luuY = 'Dự kiến ' + m[0] + ' khóa (' + m[1] + ' buổi) để đạt Rank ' + out.rankMucTieu + (goal === 'G4' ? ' + module Nhạc lý / Xướng âm song song.' : '.');
  return out;
}

// API: gợi ý lộ trình theo Rank + Mục tiêu (dùng ở form học viên / hồ sơ)
function getRouteSuggestion_(rank, goal) {
  return suggestRoute_(rank, goal);
}

// ===================== BÁO CÁO TỔNG KẾT HỌC VIÊN & XUẤT PDF =====================
function esc_(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Gom dữ liệu báo cáo: tên HV, quãng giọng lần 1 vs hiện tại, bài hát hôm nay (chỉ ô đã điền),
// kỹ thuật tập luyện (kèm link video), lộ trình đề xuất.
function buildStudentReportData_(hvId) {
  const s = readAll_(T.HocVien).filter(function(r){ return String(r.id) === String(hvId); })[0];
  if (!s) throw new Error('Không tìm thấy học viên');
  if (!canSeeStudent_(s)) throw new Error('Bạn không có quyền xuất báo cáo học viên này');

  const sessions = readAll_(T.BuoiHoc).filter(function(r){ return String(r.hocVienId) === String(hvId); }).map(cleanRow_)
    .sort(function(a, b){ return (parseInt(a.buoiSo || 0, 10) - parseInt(b.buoiSo || 0, 10)) || (String(a.createdAt || '').localeCompare(String(b.createdAt || ''))); });
  const assessments = readAll_(T.DanhGiaGiong).filter(function(r){ return String(r.hocVienId) === String(hvId); }).map(cleanRow_)
    .sort(function(a, b){ return String(a.ngayDanhGia || a.createdAt || '').localeCompare(String(b.ngayDanhGia || b.createdAt || '')); });

  const first = assessments[0] || null;
  const last  = assessments.length > 1 ? assessments[assessments.length - 1] : null;
  const latest = sessions.length ? sessions[sessions.length - 1] : null;

  // Bài hát hôm nay (buổi gần nhất) — chỉ lấy ô có điền
  let songs = [];
  if (latest) {
    try { songs = latest.songsJson ? (typeof latest.songsJson === 'string' ? JSON.parse(latest.songsJson) : latest.songsJson) : []; } catch(e) { songs = []; }
    if ((!songs || !songs.length) && latest.baiHat && latest.baiHat !== 'Thực hành bài hát') {
      songs = [{ title: latest.baiHat, ytLink: latest.linkYoutube, noteCao: latest.noteCao, noteThap: latest.noteThap, details: latest.noiDung }];
    }
  }
  // Kỹ thuật tập luyện của buổi gần nhất (kèm link video)
  let techs = [];
  if (latest) {
    try { techs = latest.techsJson ? (typeof latest.techsJson === 'string' ? JSON.parse(latest.techsJson) : latest.techsJson) : []; } catch(e) { techs = []; }
  }

  const quangGiong = function(a){ return a ? ((a.noteThap || '—') + ' – ' + (a.noteCao || '—')) : '—'; };

  return {
    student: s,
    hoTen: s.hoTen,
    rank: s.rank,
    loaiGiong: s.loaiGiong,
    soBuoiDaHoc: parseInt(s.soBuoiDaHoc || 0, 10),
    quangGiongLan1: quangGiong(first),
    quangGiongHienTai: quangGiong(last || first),
    rankLan1: first ? (first.rankGoiY || '') : '',
    rankHienTai: s.rank || (last ? last.rankGoiY : ''),
    coThayDoiQuang: !!(last && first && (last.noteThap !== first.noteThap || last.noteCao !== first.noteCao)),
    songsToday: (songs || []).filter(function(x){ return x && (x.title || x.ytLink); }),
    techsToday: (techs || []).filter(function(x){ return x && (x.name || x.ytLink || x.notes); }),
    route: suggestRoute_(s.rank, s.mucTieuHoc),
    ngayXuat: Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy')
  };
}

function buildStudentReportHtml_(d) {
  const row = function(label, val){ return val ? ('<tr><td class="lb">' + esc_(label) + '</td><td>' + esc_(val) + '</td></tr>') : ''; };
  const link = function(url, text){ return (url && String(url).indexOf('http') === 0) ? ('<a href="' + esc_(url) + '">' + esc_(text || url) + '</a>') : esc_(url || ''); };

  let songsHtml = '';
  d.songsToday.forEach(function(s, i){
    songsHtml += '<div class="card"><div class="card-h">🎵 Bài hát ' + (i + 1) + (s.title ? ': ' + esc_(s.title) : '') + '</div><table class="kv">' +
      row('Tên bài hát / Ca sĩ', s.title) +
      (s.ytLink ? ('<tr><td class="lb">Link YouTube</td><td>' + link(s.ytLink, 'Mở YouTube') + '</td></tr>') : '') +
      row('Note cao nhất', s.noteCao) +
      row('Note thấp nhất', s.noteThap) +
      row('Tone gốc → phù hợp', (s.tone && s.tone !== '0') ? s.tone : '') +
      row('Ghi chú GV', s.details) +
    '</table></div>';
  });
  if (!songsHtml) songsHtml = '<div class="muted">Buổi gần nhất chưa ghi nhận bài hát.</div>';

  let techsHtml = '';
  d.techsToday.forEach(function(t, i){
    techsHtml += '<div class="card"><div class="card-h">🎼 Kỹ thuật ' + (i + 1) + (t.name ? ': ' + esc_(t.name) : '') + '</div><table class="kv">' +
      row('Tên bài tập / Kỹ thuật', t.name) +
      (t.ytLink ? ('<tr><td class="lb">Link video hướng dẫn</td><td>' + link(t.ytLink, 'Mở video') + '</td></tr>') : '') +
      row('Hướng dẫn tập luyện', t.notes) +
    '</table></div>';
  });
  if (!techsHtml) techsHtml = '<div class="muted">Buổi gần nhất chưa ghi nhận kỹ thuật.</div>';

  let routeHtml = '';
  if (d.route) {
    routeHtml = '<table class="kv">' +
      row('Mục tiêu học', d.route.goalLabel) +
      row('Rank hiện tại → mục tiêu', 'Rank ' + d.route.rankHienTai + ' → Rank ' + d.route.rankMucTieu) +
      row('Lộ trình dự kiến', d.route.soKhoa ? (d.route.soKhoa + ' khóa (' + d.route.soBuoi + ' buổi)') : 'Đã đạt mục tiêu') +
      row('Lưu ý', d.route.luuY) +
    '</table>';
  } else {
    routeHtml = '<div class="muted">Chưa chọn Mục tiêu học (G1–G4) cho học viên.</div>';
  }

  const changeNote = d.coThayDoiQuang
    ? '<span class="up">▲ Quãng giọng đã mở rộng so với lần test đầu</span>'
    : '<span class="muted">Chưa thay đổi so với lần test đầu</span>';

  return '<!doctype html><html><head><meta charset="utf-8"><style>' +
    'body{font-family:Arial,"Segoe UI",sans-serif;color:#1a1a1a;margin:28px;font-size:13px}' +
    'h1{color:#0b7a4b;font-size:20px;margin:0 0 2px}h2{color:#0b7a4b;font-size:15px;border-bottom:2px solid #0b7a4b;padding-bottom:4px;margin:22px 0 10px}' +
    '.sub{color:#666;font-size:12px;margin-bottom:14px}' +
    '.kv{border-collapse:collapse;width:100%}.kv td{border:1px solid #ddd;padding:6px 9px;vertical-align:top}.kv .lb{background:#f1f7f3;width:34%;font-weight:bold;color:#0b5d3a}' +
    '.card{border:1px solid #d7e5dc;border-radius:6px;padding:10px 12px;margin-bottom:10px}.card-h{font-weight:bold;color:#0b5d3a;margin-bottom:6px}' +
    '.muted{color:#888;font-style:italic}.up{color:#0b7a4b;font-weight:bold}a{color:#1155cc}' +
    '.hero{background:#f1f7f3;border:1px solid #d7e5dc;border-radius:8px;padding:12px 14px}' +
    '</style></head><body>' +
    '<h1>TONY MUSIC ACADEMY — Báo cáo tổng kết học viên</h1>' +
    '<div class="sub">Ngày xuất: ' + esc_(d.ngayXuat) + ' · Sau ' + d.soBuoiDaHoc + ' buổi học</div>' +
    '<div class="hero"><table class="kv">' +
      '<tr><td class="lb">Học viên</td><td><b>' + esc_(d.hoTen) + '</b></td></tr>' +
      (d.loaiGiong ? ('<tr><td class="lb">Loại giọng</td><td>' + esc_(d.loaiGiong) + '</td></tr>') : '') +
      '<tr><td class="lb">Rank</td><td>' + esc_(d.rankLan1 ? ('Lần test đầu: ' + d.rankLan1 + ' → Hiện tại: ' + (d.rankHienTai || '—')) : (d.rankHienTai || '—')) + '</td></tr>' +
      '<tr><td class="lb">Quãng giọng (test lần 1)</td><td>' + esc_(d.quangGiongLan1) + '</td></tr>' +
      '<tr><td class="lb">Quãng giọng hiện tại</td><td>' + esc_(d.quangGiongHienTai) + ' &nbsp; ' + changeNote + '</td></tr>' +
    '</table></div>' +
    '<h2>🎵 Bài hát hôm nay</h2>' + songsHtml +
    '<h2>🎼 Kỹ thuật tập luyện</h2>' + techsHtml +
    '<h2>🧭 Lộ trình đề xuất</h2>' + routeHtml +
    '</body></html>';
}

function getOrCreateStudentFolder_(st) {
  const fid = extractFolderId_(st.linkDrive || '');
  if (fid) {
    try { return DriveApp.getFolderById(fid); } catch(e) {}
  }
  const res = createStudentDriveFolder_(st);
  if (res && res.success && res.folderUrl) {
    const nid = extractFolderId_(res.folderUrl);
    if (nid) { try { return DriveApp.getFolderById(nid); } catch(e) {} }
  }
  return null;
}

// Xuất PDF báo cáo tổng kết vào folder Drive của học viên, trả về link file
function exportStudentReportPdf_(hvId) {
  const d = buildStudentReportData_(hvId);
  const html = buildStudentReportHtml_(d);
  const fileName = 'BaoCao_' + String(d.hoTen || 'HocVien').replace(/[\\\/:*?"<>|]/g, ' ').trim() +
                   '_' + d.soBuoiDaHoc + 'buoi_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'ddMMyyyy');
  const folder = getOrCreateStudentFolder_(d.student);
  const pdfBlob = Utilities.newBlob(html, MimeType.HTML, fileName + '.html').getAs(MimeType.PDF).setName(fileName + '.pdf');
  if (!folder) {
    // Không có folder Drive → vẫn tạo file ở Drive gốc để không mất báo cáo
    const f0 = DriveApp.createFile(pdfBlob);
    return { success: true, url: f0.getUrl(), fileName: fileName + '.pdf', folder: false,
             message: 'Đã tạo PDF (chưa cấu hình folder Drive học viên nên lưu ở Drive gốc).' };
  }
  const file = folder.createFile(pdfBlob);
  return { success: true, url: file.getUrl(), fileName: fileName + '.pdf', folder: true,
           message: 'Đã xuất báo cáo PDF vào folder Drive của học viên.' };
}

// Tự động kiểm tra và điền ID cho các dòng bị thiếu trong Google Sheets
function fixBlankIds_() {
  try {
    const ss = getDbSpreadsheet_(true);
    ['HocVien', 'BuoiHoc', 'Users', 'DanhGiaGiong', 'PhanTichBai'].forEach(function(tName){
      const sh = ss.getSheetByName(tName);
      if (!sh) return;
      const data = sh.getDataRange().getValues();
      if (data.length < 2) return;
      const head = data[0];
      const idCol = head.indexOf('id');
      if (idCol === -1) return;
      
      let prefix = 'HV';
      if (tName === 'BuoiHoc') prefix = 'BH';
      else if (tName === 'Users') prefix = 'USR';
      else if (tName === 'DanhGiaGiong') prefix = 'DG';
      else if (tName === 'PhanTichBai') prefix = 'PT';

      let maxNum = 0;
      for (let r = 1; r < data.length; r++) {
        const val = String(data[r][idCol] || '');
        const m = val.match(/(\d+)$/);
        if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
      }

      for (let r = 1; r < data.length; r++) {
        const val = String(data[r][idCol] || '').trim();
        if (!val) {
          maxNum++;
          const newId = prefix + '-' + String(maxNum).padStart(6, '0');
          sh.getRange(r + 1, idCol + 1).setValue(newId);
        }
      }
    });
  } catch(e) {
    Logger.log('Lỗi fixBlankIds_: ' + e.message);
  }
}

// ===================== API — BUỔI HỌC NHÓM (GROUP SESSION) =====================
/**
 * Lưu 1 buổi học nhóm: tạo N bản ghi BuoiHoc (mỗi HV 1 bản ghi) dùng chung nội dung,
 * phiếu chấm + nhận xét riêng. Cùng groupSessionId.
 * @param {Object} common  - Dữ liệu chung (baiHat, kyThuat, songsJson, techsJson, huongDanHatJson...)
 * @param {Array}  members - [{hocVienId, scoreCardJson, totalScore, sessionGrade, focusSkillName, scoreNote, nhanXet, diemSo}]
 */
/**
 * 7. Tối ưu saveGroupSession_: Gom tất cả buổi học vào 1 batch insert duy nhất
 * và gom tất cả cập nhật học viên vào 1 batch update duy nhất.
 */
function saveGroupSession_(common, members) {
  if (!members || !members.length) return { success: false, message: 'Chưa có học viên trong nhóm' };
  const now = new Date();
  const groupId = 'GRP-' + now.getTime();
  const existing = readAll_(T.BuoiHoc);
  const hvAll = readAll_(T.HocVien);

  let maxNum = 0;
  existing.forEach(function(r){
    const m = String(r.id || '').match(/(\d+)$/);
    if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
  });

  const ids = [];
  const newBhObjs = [];
  const hvUpdates = {};

  members.forEach(function(mb){
    const hvId = String(mb.hocVienId || '').trim();
    if (!hvId) return;
    const count = existing.filter(function(r){ return String(r.hocVienId) === hvId; }).length;
    maxNum++;
    const id = 'BH-' + String(maxNum).padStart(6, '0');

    // Tự động phân loại bài hát theo từng học viên
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

    const obj = Object.assign({}, common || {}, mb, {
      id: id,
      hocVienId: hvId,
      baiHat: mbBaiHat || common.baiHat,
      linkYoutube: mbYt || common.linkYoutube,
      songsJson: mbSongs || common.songsJson,
      ngayHoc: toStorageDate_((common && common.ngayHoc) || now),
      buoiSo: count + 1,
      groupSessionId: groupId,
      isGroupSession: true,
      createdAt: now
    });
    newBhObjs.push(obj);

    const hv = hvAll.filter(function(r){ return String(r.id) === hvId; })[0];
    const soKhoa = hv ? (parseInt(hv.soBuoiKhoa || hv.soBuoiDeal, 10) || 0) : 0;
    const cnt = count + 1;
    hvUpdates[hvId] = {
      soBuoiDaHoc: cnt,
      soBuoiConLai: Math.max(0, soKhoa - cnt),
      updatedAt: now
    };
    ids.push(id);
  });

  // 1. Batch Insert vào sheet BuoiHoc (Chỉ 1 lần gọi Sheets API setValues)
  if (newBhObjs.length > 0) {
    const shBh = sheet_(T.BuoiHoc);
    const lastRowBh = shBh.getLastRow();
    const headBh = shBh.getRange(1, 1, 1, shBh.getLastColumn()).getValues()[0];
    const newBhRows = newBhObjs.map(function(obj){
      return headBh.map(function(h){ return obj[h] !== undefined ? obj[h] : ''; });
    });
    shBh.getRange(lastRowBh + 1, 1, newBhRows.length, headBh.length).setValues(newBhRows);
    invalidateCache_(T.BuoiHoc);
  }

  // 2. Batch Update vào sheet HocVien (Chỉ 1 lần đọc và 1 lần setValues)
  const shHv = sheet_(T.HocVien);
  const dataHv = shHv.getDataRange().getValues();
  if (dataHv.length >= 2) {
    const headHv = dataHv[0];
    const idColHv = headHv.indexOf('id');
    let hvChanged = false;
    for (let r = 1; r < dataHv.length; r++) {
      const hId = String(dataHv[r][idColHv] || '').trim();
      if (hvUpdates[hId]) {
        const patch = hvUpdates[hId];
        headHv.forEach(function(h, c){
          if (patch[h] !== undefined) {
            dataHv[r][c] = patch[h];
            hvChanged = true;
          }
        });
      }
    }
    if (hvChanged) {
      shHv.getRange(1, 1, dataHv.length, headHv.length).setValues(dataHv);
      invalidateCache_(T.HocVien);
    }
  }

  invalidateDashboardCache_();
  invalidateTuitionCache_();

  return { success: true, groupSessionId: groupId, ids: ids, message: 'Đã lưu buổi học nhóm cho ' + ids.length + ' học viên!' };
}

// ===================== API — HỌC THỬ & DANH SÁCH CHỜ =====================
const TRIAL_STATUS_TEXT = {
  'new':      'Đã học thử',
  'tested':   'Đã học thử',
  'waiting':  'Chờ phản hồi',
  'rejected': 'Từ chối học'
};

function isTrialStudent_(r) {
  const ts = String(r.trialStatus || '').trim();
  if (ts) return ts !== 'confirmed';
  const st = String(r.tinhTrang || '');
  return st.indexOf('thử') >= 0 || st.indexOf('Chờ phản hồi') >= 0 || st.indexOf('Từ chối') >= 0;
}

/** Thêm / sửa nhanh học viên học thử (form rút gọn) */
function saveTrialStudent_(data) {
  const now = new Date();
  const today = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const base = {
    hoTen:          String(data.hoTen || '').trim(),
    dienThoai:      data.dienThoai || '',
    loaiGiong:      data.loaiGiong || '',
    ngayHocThu:     data.ngayHocThu || today,
    nguonGioiThieu: data.nguonGioiThieu || '',
    ghiChu:         data.ghiChu || '',
    updatedAt:      now
  };
  if (!base.hoTen) return { success: false, message: 'Vui lòng nhập họ tên' };

  if (data.id && String(data.id).trim() !== '') {
    update_(T.HocVien, data.id, base);
    return { success: true, id: data.id, message: 'Đã cập nhật học viên học thử!' };
  }

  const id = nextId_(T.HocVien, 'HV');
  insert_(T.HocVien, Object.assign({
    id: id,
    rank: '',
    tinhTrang: TRIAL_STATUS_TEXT['new'],
    trialStatus: 'new',
    soBuoiKhoa: 0, soBuoiDeal: 0, soBuoiDaHoc: 0, soBuoiConLai: 0,
    loaiHocVien: 'NEW',
    daDongHocPhi: false,
    active: true,
    createdAt: now
  }, base));
  return { success: true, id: id, message: 'Đã thêm học viên học thử!' };
}

function updateTrialStatus_(id, status) {
  if (!TRIAL_STATUS_TEXT[status]) return { success: false, message: 'Trạng thái không hợp lệ' };
  update_(T.HocVien, id, { trialStatus: status, tinhTrang: TRIAL_STATUS_TEXT[status], updatedAt: new Date() });
  return { success: true, message: 'Đã cập nhật trạng thái học thử' };
}

/** Chốt đăng ký: chuyển HV học thử → học viên chính thức */
function confirmTrialStudent_(id, info) {
  info = info || {};
  const now = new Date();
  const hv = readAll_(T.HocVien).filter(function(r){ return String(r.id) === String(id); })[0];
  if (!hv) return { success: false, message: 'Không tìm thấy học viên' };

  const soKhoa = parseInt(info.soBuoiKhoa, 10) || 8;
  if (info.lop) addClassToList_(info.lop);
  const cnt = readAll_(T.BuoiHoc).filter(function(r){ return String(r.hocVienId) === String(id); }).length;
  const patch = {
    lop:          info.lop || hv.lop || 'TN11',
    giaoVien:     info.giaoVien || hv.giaoVien || 'Linh',
    soBuoiKhoa:   soKhoa,
    soBuoiDeal:   soKhoa,
    soKhoaDaHoc:  1,
    buoiDauKhoa:  0,
    soBuoiKhoaHienTai: soKhoa,
    soBuoiDaHoc:  cnt,
    soBuoiConLai: Math.max(0, soKhoa - cnt),
    ngayBatDau:   info.ngayBatDau || Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    tinhTrang:    'Đang học',
    trialStatus:  'confirmed',
    rank:         hv.rank || 'A',
    loaiHocVien:  hv.loaiHocVien || 'NEW',
    active:       true,
    updatedAt:    now
  };
  if (ME_ && ME_.role === 'admin') {
    if (info.hocPhi !== undefined && info.hocPhi !== null && info.hocPhi !== '') {
      patch.hocPhi = parseFloat(info.hocPhi) || 0;
    } else {
      patch.hocPhi = soKhoa >= 8 ? 2500000 : 1750000;
    }
    patch.daDongHocPhi = (info.daDongHocPhi === true || String(info.daDongHocPhi).toUpperCase() === 'TRUE');
  } else if (hv.hocPhi === '' || hv.hocPhi === undefined || hv.hocPhi === null) {
    patch.hocPhi = soKhoa >= 8 ? 2500000 : 1750000;   // GV chốt: dùng học phí mặc định, Admin chỉnh sau
    patch.daDongHocPhi = false;
  }
  update_(T.HocVien, id, patch);
  return { success: true, message: 'Đã chốt đăng ký! ' + (hv.hoTen || '') + ' đã chuyển sang học viên chính thức.' };
}

// ===================== API — TÍCH HỢP SHEET "XẾP LỊCH" =====================
function normVi_(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase().trim();
}

function findScheduleSheet_(ss) {
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    if (normVi_(sheets[i].getName()) === 'XEP LICH') return sheets[i];
  }
  for (let j = 0; j < sheets.length; j++) {
    if (normVi_(sheets[j].getName()).indexOf('XEP LICH') >= 0) return sheets[j];
  }
  return null;
}

function getScheduleSpreadsheet_() {
  const id = PROP.getProperty('SCHEDULE_SS_ID');
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch(e) { Logger.log('Không mở được Sheet lịch: ' + e.message); }
  }
  try {
    const act = SpreadsheetApp.getActiveSpreadsheet();
    if (act && findScheduleSheet_(act)) return act;
  } catch(e) {}
  try { return getDbSpreadsheet_(false); } catch(e) {}
  return null;
}

/** Đọc vùng A1:I(n) + bảng mapping J:K của sheet XẾP LỊCH */
function getScheduleSheetData_() {
  const ss = getScheduleSpreadsheet_();
  if (!ss) return { success: false, message: 'Chưa cấu hình Google Sheet chứa tab "XẾP LỊCH". Vào ⚙ Cấu hình để dán link.' };
  const sh = findScheduleSheet_(ss);
  if (!sh) return { success: false, message: 'Không tìm thấy tab "XẾP LỊCH" trong file "' + ss.getName() + '".' };

  const lastRow = Math.min(Math.max(sh.getLastRow(), 3), 80);
  const vals = sh.getRange(1, 1, lastRow, 9).getDisplayValues();
  const title = vals[0].map(function(v){ return String(v).trim(); }).filter(Boolean).join(' ');
  const days = vals[1].slice(2, 9).map(function(v){ return String(v).trim(); });

  const rows = [];
  let place = '';
  for (let r = 2; r < vals.length; r++) {
    const row = vals[r];
    if (String(row[0]).trim()) place = String(row[0]).trim();
    const time = String(row[1]).trim();
    const cells = row.slice(2, 9).map(function(v){ return String(v).trim(); });
    const hasContent = cells.some(function(c){ return c !== ''; });
    if (!time && !hasContent) continue;
    rows.push({ row: r + 1, place: place, time: time, cells: cells });
  }

  // Bảng mapping học viên → giáo viên (cột J = học viên, cột K = giáo viên)
  const map = {};
  if (sh.getLastColumn() >= 11) {
    const mapRows = Math.min(Math.max(sh.getLastRow(), 1), 300);
    sh.getRange(1, 10, mapRows, 2).getDisplayValues().forEach(function(m){
      const n = String(m[0]).trim();
      const gv = String(m[1]).trim();
      if (n && gv) map[n] = gv;
    });
  }

  return {
    success: true,
    spreadsheetName: ss.getName(),
    sheetUrl: ss.getUrl() + '#gid=' + sh.getSheetId(),
    title: title,
    days: days,
    rows: rows,
    studentTeacherMap: map
  };
}

// ===================== GEMINI AI =====================
function geminiCall_(parts) {
  const key = PROP.getProperty('GEMINI_API_KEY');
  const model = PROP.getProperty('GEMINI_MODEL') || 'gemini-2.0-flash';
  if (!key) return '⚠️ Chưa cấu hình API Key Gemini. Vui lòng vào mục "Cấu hình" trong menu để dán API Key.';
  
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/'
            + model + ':generateContent?key=' + key;
  const payload = {
    contents: [{ role: 'user', parts: parts }],
    generationConfig: { temperature: 0.6, maxOutputTokens: 2048 }
  };
  try {
    const res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    const json = JSON.parse(res.getContentText());
    if (json.candidates && json.candidates[0] && json.candidates[0].content) {
      return json.candidates[0].content.parts.map(function(p){ return p.text || ''; }).join('\n');
    }
    return '⚠️ AI không trả kết quả: ' + (json.error ? json.error.message : res.getContentText().slice(0, 300));
  } catch(e) {
    return '⚠️ Lỗi gọi Gemini AI: ' + e.message;
  }
}

/** Phân tích giọng — GV nhập dữ liệu, AI tổng hợp thành nhận xét + lộ trình */
function aiAnalyzeVoice_(input) {
  const prompt =
    'Bạn là huấn luyện viên thanh nhạc chuyên nghiệp. Dựa trên dữ liệu quan sát GV nhập dưới đây, '
    + 'hãy viết NHẬN XÉT NĂNG LỰC và ĐỀ XUẤT LỘ TRÌNH cho học viên (tiếng Việt, súc tích, có cấu trúc rõ ràng).\n\n'
    + 'Thang xếp Rank nền tảng (18 điểm): A(0-6)=Sơ cấp, B(7-11)=Trung cấp sơ, C(12-14)=Trung cấp, D(15-17)=Khá/Tốt.\n\n'
    + 'HỌC VIÊN: ' + (input.hoTen || '') + '\n'
    + 'Loại giọng: ' + (input.loaiGiong || 'Chưa xác định') + '\n'
    + 'Quãng giọng: ' + (input.quangGiong || ((input.noteThap||'?') + ' — ' + (input.noteCao||'?'))) + '\n'
    + 'Note chuyển giọng: ' + (input.noteChuyenGiong || 'Chưa rõ') + '\n'
    + 'Tổng điểm nền tảng: ' + (input.tongDiem || '?') + '/18 → Rank gợi ý: ' + (input.rankGoiY || '?') + '\n'
    + 'Mục tiêu học: ' + (input.mucTieu || 'chưa nêu') + '\n'
    + 'Chi tiết tiêu chí:\n' + (input.chiTietText || '(không có)') + '\n\n'
    + 'Trả về đúng 4 mục có tiêu đề in đậm để hệ thống dễ trích xuất:\n'
    + '**1. Nhận xét năng lực** (Điểm mạnh & Điểm yếu chính)\n'
    + '**2. Kỹ thuật nên học ngay** (Gạch đầu dòng)\n'
    + '**3. Kỹ thuật chưa đủ điều kiện** (Gạch đầu dòng)\n'
    + '**4. Khuyến nghị lộ trình** (Số buổi ước lượng + mục tiêu từng giai đoạn)';
  return geminiCall_([{ text: prompt }]);
}

/** Phân tích bài hát từ link YouTube */
function aiAnalyzeSong_(input) {
  const guide =
    'Bạn là chuyên gia phối khí & huấn luyện thanh nhạc. Phân tích bài hát để chuẩn bị giáo án dạy học viên.\n'
    + 'Tên bài: ' + (input.tenBai || '(theo video)') + (input.ca ? (' — Ca sĩ: ' + input.ca) : '') + '\n'
    + 'Quãng giọng học viên: ' + (input.quangGiong || ((input.noteThap||'?') + ' — ' + (input.noteCao||'?'))) + '\n\n'
    + 'Trả về tiếng Việt, các mục in đậm:\n'
    + '**Tông gốc & quãng bài** (Nốt thấp nhất – cao nhất, tessitura)\n'
    + '**Gợi ý dịch tông (transpose)** — so với quãng học viên, nên hạ/nâng mấy semitone\n'
    + '**Cấu trúc bài** (Verse / Pre-chorus / Chorus / Bridge, cao trào)\n'
    + '**Kỹ thuật trọng tâm** (Chest/Mix/Head voice, Belting, Legato, Vibrato...)\n'
    + '**Điểm khó & lưu ý luyện tập**\n'
    + '**Giáo án gợi ý 60 phút** (15p kỹ thuật + 45p xử lý bài)';

  const link = String(input.linkYoutube || '').trim();
  if (/youtu\.?be/.test(link)) {
    const withVideo = geminiCall_([
      { fileData: { fileUri: link } },
      { text: guide + '\n\n(Hãy nghe/xem video ở link đính kèm để phân tích chính xác.)' }
    ]);
    if (withVideo && withVideo.indexOf('⚠️') !== 0) return withVideo;
  }
  return geminiCall_([{ text: guide + '\n\nLink tham khảo: ' + link }]);
}

// ===================== [SHARED-SCHEDULE-BEGIN] =====================
// MODULE LỊCH DẠY — phần lõi.
// build_preview.js nhúng nguyên văn đoạn này vào bản preview offline, nên ở đây chỉ dùng
// các helper: readAll_, writeRows_, withLock_, todayYmd_, ME_ và hằng số T.

const SCH_LOAI    = ['hoc', 'thu', 'trong', 'khoa'];      // Học · Học thử · GV trống · Khoá ô
const SCH_BOOKING = { hoc: true, thu: true, khoa: true };   // Các loại chiếm phòng
const SCH_DAYS    = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const SCH_PALETTE = ['#34D399', '#f5c84c', '#6bb0e0', '#b78fe0', '#f08a5d', '#e06a9c', '#9bd36b'];

// Khung giờ mặc định lấy theo sheet XẾP LỊCH (đơn vị: phút trong ngày, 1080 = 18h00)
const SCH_DEFAULT_SLOTS = [
  ['Dưới sảnh',  [[540, 600], [540, 630], [630, 690], [810, 870], [870, 960], [960, 1020]]],
  ['Trên phòng', [[1080, 1140], [1080, 1170], [1110, 1170], [1110, 1200], [1140, 1200], [1140, 1230],
                  [1170, 1230], [1170, 1260], [1200, 1260], [1200, 1290], [1230, 1290], [1230, 1320], [1260, 1320]]]
];

function schNorm_(s) { return String(s == null ? '' : s).normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim(); }
function schFold_(s) { return schNorm_(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd'); }
function schIsTrue_(v) { return v === true || String(v).toUpperCase() === 'TRUE'; }
function schIsFalse_(v) { return v === false || String(v).toUpperCase() === 'FALSE'; }
function schActive_(r) { return !schIsFalse_(r.active); }
function schIndex_(list) { const m = {}; list.forEach(function(x){ m[x.id] = x; }); return m; }

function schFmtMin_(m) {
  m = Number(m) || 0;
  const h = Math.floor(m / 60), mm = m % 60;
  return h + 'h' + (mm ? String(mm).padStart(2, '0') : '');
}
function schSlotLabel_(a, b) { return schFmtMin_(a) + '-' + schFmtMin_(b); }

function schValidYmd_(s) { return /^\d{4}-\d{2}-\d{2}$/.test(String(s)); }
function schToYmd_(v) {
  if (v instanceof Date) return v.getFullYear() + '-' + String(v.getMonth() + 1).padStart(2, '0') + '-' + String(v.getDate()).padStart(2, '0');
  return String(v == null ? '' : v).trim().slice(0, 10);
}
function schUtcToYmd_(t) {
  const d = new Date(t);
  return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
}
function schYmdToUtc_(ymd) { const p = String(ymd).split('-').map(Number); return Date.UTC(p[0], p[1] - 1, p[2]); }
function schAddDays_(ymd, n) { return schUtcToYmd_(schYmdToUtc_(ymd) + n * 86400000); }
function schMondayOf_(ymd) {
  const t = schYmdToUtc_(ymd);
  const dow = new Date(t).getUTCDay();
  return schUtcToYmd_(t - (dow === 0 ? 6 : dow - 1) * 86400000);
}

function schParseIds_(v) {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  const s = String(v == null ? '' : v).trim();
  if (!s) return [];
  try { const a = JSON.parse(s); return Array.isArray(a) ? a.map(String).filter(Boolean) : []; }
  catch(e) { return s.split(',').map(function(x){ return x.trim(); }).filter(Boolean); }
}

// ---- Giáo viên ----
function schShortName_(u) {
  const t = String(u.tenNgan || '').trim();
  if (t) return t;
  return String(u.hoTen || '').replace(/^\s*(giảng viên|giáo viên|gv|thầy|cô)\s+/i, '').trim() || String(u.username || '');
}
function schIsTeacher_(u) {
  if (!schActive_(u) || schIsFalse_(u.dayHoc)) return false;
  return schIsTrue_(u.dayHoc) || String(u.role) === 'gv';
}
function schTeachers_() {
  let i = 0;
  return readAll_(T.Users).filter(schIsTeacher_).map(function(u){
    const t = { id: String(u.id), ten: schShortName_(u), hoTen: String(u.hoTen || ''), email: String(u.email || ''),
                mau: String(u.mauLich || '').trim() || SCH_PALETTE[i % SCH_PALETTE.length] };
    i++;
    return t;
  });
}
function schTeacherIdForName_(teachers, name) {
  const n = schNorm_(name), f = schFold_(name);
  if (!n) return '';
  let hit = teachers.filter(function(t){ return schNorm_(t.ten) === n || schNorm_(t.hoTen) === n; })[0];
  if (!hit) hit = teachers.filter(function(t){ return schFold_(t.ten) === f || schFold_(t.hoTen) === f; })[0];
  return hit ? hit.id : '';
}

// ---- Cơ sở / Phòng / Khung giờ ----
function schEnsureSeed_() {
  if (readAll_(T.CoSo).length) return;
  withLock_(function(){
    if (readAll_(T.CoSo).length) return;
    const phong = [], slots = [];
    SCH_DEFAULT_SLOTS.forEach(function(g, gi){
      const pid = 'PH-' + String(gi + 1).padStart(3, '0');
      phong.push({ id: pid, coSoId: 'CS-001', tenPhong: g[0], sucChua: 2, thuTu: gi + 1, active: true });
      g[1].forEach(function(s){
        slots.push({ id: 'KG-' + String(slots.length + 1).padStart(4, '0'), coSoId: 'CS-001', phongId: pid,
                     batDau: s[0], ketThuc: s[1], thuTu: slots.length + 1, active: true });
      });
    });
    writeRows_(T.CoSo, [{ id: 'CS-001', tenCoSo: 'Cơ sở chính', diaChi: '', thuTu: 1, active: true }]);
    writeRows_(T.Phong, phong);
    writeRows_(T.KhungGio, slots);
  });
}

function schLoadMeta_() {
  schEnsureSeed_();
  const byOrder = function(a, b){ return (a.thuTu - b.thuTu) || String(a.ten).localeCompare(String(b.ten)); };
  const coSo = readAll_(T.CoSo).filter(schActive_).map(function(r){
    return { id: String(r.id), ten: String(r.tenCoSo || ''), diaChi: String(r.diaChi || ''), thuTu: Number(r.thuTu) || 0 };
  }).sort(byOrder);
  const coSoMap = schIndex_(coSo);
  const phong = readAll_(T.Phong).filter(function(r){ return schActive_(r) && coSoMap[String(r.coSoId)]; }).map(function(r){
    return { id: String(r.id), coSoId: String(r.coSoId), ten: String(r.tenPhong || ''), sucChua: Math.max(1, Number(r.sucChua) || 2), thuTu: Number(r.thuTu) || 0 };
  }).sort(byOrder);
  const phongPos = {};
  phong.forEach(function(p, i){ phongPos[p.id] = i; });
  const khungGio = readAll_(T.KhungGio).filter(function(r){ return schActive_(r) && phongPos[String(r.phongId)] !== undefined; }).map(function(r){
    return { id: String(r.id), coSoId: String(r.coSoId), phongId: String(r.phongId), batDau: Number(r.batDau) || 0, ketThuc: Number(r.ketThuc) || 0 };
  }).sort(function(a, b){ return (phongPos[a.phongId] - phongPos[b.phongId]) || (a.batDau - b.batDau) || (a.ketThuc - b.ketThuc); });
  return { coSo: coSo, phong: phong, khungGio: khungGio, teachers: schTeachers_() };
}

function schCellsOfWeek_(tuan, kgMap) {
  return readAll_(T.LichXep).filter(function(r){ return schToYmd_(r.tuan) === tuan; }).map(function(r){
    const kg = kgMap[String(r.khungGioId)];
    if (!kg) return null;
    return {
      id: String(r.id), thu: Number(r.thu), khungGioId: kg.id, phongId: kg.phongId, coSoId: kg.coSoId,
      batDau: kg.batDau, ketThuc: kg.ketThuc, loai: String(r.loai || ''), giaoVienId: String(r.giaoVienId || ''),
      hocVienIds: schParseIds_(r.hocVienIds), ghiChu: String(r.ghiChu || ''), createdBy: String(r.createdBy || '')
    };
  }).filter(Boolean);
}

/**
 * Luật xung đột (cùng thứ, giờ chồng nhau) — trả về lý do, hoặc '' nếu không xung đột:
 *  - cùng phòng (Học / Học thử / Khoá)
 *  - cùng giáo viên (kể cả khác cơ sở)
 *  - có học viên chung
 * Ô "GV trống" không bao giờ chặn ô khác.
 */
function schConflict_(a, b, phongMap) {
  if (!SCH_BOOKING[a.loai] || !SCH_BOOKING[b.loai]) return '';
  if (a.thu !== b.thu || !(a.batDau < b.ketThuc && a.ketThuc > b.batDau)) return '';
  const where = schSlotLabel_(b.batDau, b.ketThuc) + ' · ' + ((phongMap[b.phongId] || {}).ten || 'phòng khác');
  if (a.phongId === b.phongId) return 'Trùng phòng với lịch ' + where;
  if (a.loai !== 'khoa' && b.loai !== 'khoa' && a.giaoVienId && a.giaoVienId === b.giaoVienId) return 'Giáo viên đã có lịch ' + where;
  const shared = a.hocVienIds.some(function(id){ return b.hocVienIds.indexOf(id) !== -1; });
  return shared ? 'Học viên đã có lịch ' + where : '';
}

// Giáo viên chỉ thấy tên học viên trong ô của chính mình
function schPublicCell_(c, me) {
  const out = { id: c.id, thu: c.thu, khungGioId: c.khungGioId, phongId: c.phongId, coSoId: c.coSoId,
    batDau: c.batDau, ketThuc: c.ketThuc, loai: c.loai, giaoVienId: c.giaoVienId, hocVienIds: c.hocVienIds, ghiChu: c.ghiChu };
  if (me.role !== 'admin' && (c.loai === 'hoc' || c.loai === 'thu') && c.giaoVienId !== me.id) {
    out.hocVienIds = [];
    out.ghiChu = '';
    out.redacted = true;
  }
  return out;
}

function schStudents_(teachers) {
  return readAll_(T.HocVien).filter(schActive_).map(function(r){
    return { id: String(r.id), hoTen: String(r.hoTen || ''), giaoVienId: schTeacherIdForName_(teachers, r.giaoVien),
             conLai: Number(r.soBuoiConLai) || 0, tinhTrang: String(r.tinhTrang || '') };
  });
}

function getScheduleBoard_(tuan, coSoId) {
  const me = ME_;
  tuan = schMondayOf_(schValidYmd_(tuan) ? tuan : todayYmd_());
  const meta = schLoadMeta_();
  if (!meta.coSo.some(function(c){ return c.id === coSoId; })) coSoId = meta.coSo.length ? meta.coSo[0].id : '';
  const cells = schCellsOfWeek_(tuan, schIndex_(meta.khungGio));
  const meTeacher = meta.teachers.some(function(t){ return t.id === me.id; }) ? me.id : '';
  return {
    tuan: tuan, coSoId: coSoId, today: todayYmd_(),
    coSo: meta.coSo, phong: meta.phong, khungGio: meta.khungGio,
    teachers: meta.teachers.map(function(t){ return { id: t.id, ten: t.ten, hoTen: t.hoTen, mau: t.mau }; }),
    students: schStudents_(meta.teachers),
    cells: cells.map(function(c){ return schPublicCell_(c, me); }),
    perms: { isAdmin: me.role === 'admin', meTeacherId: meTeacher, canEdit: me.role === 'admin' || !!meTeacher }
  };
}

function saveScheduleCells_(tuan, ops) {
  return schApplyOps_(tuan, ops, {});
}

/**
 * Áp dụng hàng loạt thao tác lên lưới 1 tuần (dán / điền / xoá / sửa 1 ô).
 * op = { thu, khungGioId, clear:true } hoặc { thu, khungGioId, loai, giaoVienId, hocVienIds, ghiChu }
 * Ô hợp lệ được lưu, ô vi phạm trả về trong "rejected" kèm lý do.
 */
function schApplyOps_(tuan, ops, opt) {
  const me = ME_;
  opt = opt || {};
  if (!schValidYmd_(tuan)) throw new Error('Tuần không hợp lệ');
  tuan = schMondayOf_(tuan);
  if (!Array.isArray(ops)) ops = [];
  if (ops.length > 500) throw new Error('Mỗi lần chỉ thao tác tối đa 500 ô');

  return withLock_(function(){
    const meta = schLoadMeta_();
    const kgMap = schIndex_(meta.khungGio), phongMap = schIndex_(meta.phong), teacherMap = schIndex_(meta.teachers);
    const studentMap = {};
    readAll_(T.HocVien).filter(schActive_).forEach(function(r){ studentMap[String(r.id)] = r; });
    const isAdmin = me.role === 'admin';
    if (!isAdmin && !teacherMap[me.id]) throw new Error('Tài khoản chưa được bật "Dạy học" nên chưa thể xếp lịch');

    let cells = schCellsOfWeek_(tuan, kgMap);
    const byPos = {};
    cells.forEach(function(c){ byPos[c.thu + '|' + c.khungGioId] = c; });
    const inserts = {}, updates = {}, deletes = {};
    const rejected = [];
    let saved = 0, skipped = 0, seq = 0;

    ops.forEach(function(op){
      op = op || {};
      const thu = Number(op.thu);
      const kg = kgMap[String(op.khungGioId)];
      const fail = function(msg){ rejected.push({ thu: thu, khungGioId: String(op.khungGioId || ''), reason: msg }); };
      if (!(thu >= 1 && thu <= 7) || !kg) return fail('Ô không hợp lệ hoặc khung giờ đã bị ẩn');
      const key = thu + '|' + kg.id;
      const ex = byPos[key];
      if (ex && opt.skipOccupied) { skipped++; return; }
      if (ex && !isAdmin && (ex.loai === 'khoa' || ex.giaoVienId !== me.id)) return fail('Ô này đang thuộc giáo viên khác');

      if (op.clear) {
        if (!ex) return;
        cells = cells.filter(function(c){ return c !== ex; });
        delete byPos[key];
        if (inserts[ex.id]) delete inserts[ex.id];
        else { deletes[ex.id] = true; delete updates[ex.id]; }
        saved++;
        return;
      }

      const loai = String(op.loai || '');
      if (SCH_LOAI.indexOf(loai) === -1) return fail('Loại ô không hợp lệ');
      if (loai === 'khoa' && !isAdmin) return fail('Chỉ Admin được khoá ô');
      let gvId = loai === 'khoa' ? '' : String(op.giaoVienId || '');
      if (!isAdmin && loai !== 'khoa') gvId = me.id;
      if (loai !== 'khoa' && !teacherMap[gvId]) return fail('Chưa chọn giáo viên');

      let ids = (loai === 'hoc' || loai === 'thu') ? schParseIds_(op.hocVienIds) : [];
      ids = ids.filter(function(id, i){ return ids.indexOf(id) === i; });
      const missing = ids.filter(function(id){ return !studentMap[id]; });
      if (missing.length) return fail('Không tìm thấy học viên ' + missing.join(', '));
      if (ids.length > 30) return fail('Tối đa 30 học viên mỗi buổi');   // ghép tự do, chỉ chặn số vô lý
      if (loai === 'hoc' && !ids.length) return fail('Chưa chọn học viên');
      const ghiChu = String(op.ghiChu || '').trim().slice(0, 200);
      if (loai === 'thu' && !ids.length && !ghiChu) return fail('Nhập tên học viên học thử');

      const cand = {
        id: ex ? ex.id : '', thu: thu, khungGioId: kg.id, phongId: kg.phongId, coSoId: kg.coSoId,
        batDau: kg.batDau, ketThuc: kg.ketThuc, loai: loai, giaoVienId: gvId, hocVienIds: ids, ghiChu: ghiChu,
        createdBy: ex ? ex.createdBy : me.id
      };
      for (let i = 0; i < cells.length; i++) {
        if (cells[i] === ex) continue;
        const why = schConflict_(cand, cells[i], phongMap);
        if (why) return fail(why);
      }
      if (ex && ex.loai === cand.loai && ex.giaoVienId === cand.giaoVienId && ex.ghiChu === cand.ghiChu &&
          ex.hocVienIds.join(',') === cand.hocVienIds.join(',')) { saved++; return; }

      if (ex) {
        cells = cells.map(function(c){ return c === ex ? cand : c; });
        if (inserts[ex.id]) inserts[ex.id] = cand; else updates[ex.id] = cand;
      } else {
        cand.id = 'LX-' + Date.now().toString(36) + '-' + (seq++);
        cells.push(cand);
        inserts[cand.id] = cand;
      }
      byPos[key] = cand;
      saved++;
    });

    const stamp = new Date().toISOString();
    const toRow = function(c){
      return { id: c.id, tuan: tuan, thu: c.thu, khungGioId: c.khungGioId, loai: c.loai, giaoVienId: c.giaoVienId,
               hocVienIds: JSON.stringify(c.hocVienIds), ghiChu: c.ghiChu, createdBy: c.createdBy || me.id,
               updatedBy: me.id, updatedAt: stamp };
    };
    const ins = Object.keys(inserts).map(function(k){ return toRow(inserts[k]); });
    const upd = Object.keys(updates).map(function(k){ return toRow(updates[k]); });
    const del = Object.keys(deletes);
    if (ins.length || upd.length || del.length) writeRows_(T.LichXep, ins, upd, del);

    return { saved: saved, skipped: skipped, rejected: rejected, tuan: tuan,
             cells: cells.map(function(c){ return schPublicCell_(c, me); }) };
  });
}

/** Sao chép lịch từ tuần nguồn sang tuần đích (chỉ điền vào ô còn trống). mode: all | trong | hoc */
function copyWeek_(fromTuan, toTuan, mode, coSoId) {
  if (!schValidYmd_(fromTuan) || !schValidYmd_(toTuan)) throw new Error('Tuần không hợp lệ');
  fromTuan = schMondayOf_(fromTuan);
  toTuan = schMondayOf_(toTuan);
  if (fromTuan === toTuan) throw new Error('Tuần nguồn và tuần đích trùng nhau');
  const me = ME_;
  const meta = schLoadMeta_();
  const ops = schCellsOfWeek_(fromTuan, schIndex_(meta.khungGio)).filter(function(c){
    if (coSoId && c.coSoId !== coSoId) return false;
    if (mode === 'trong' && c.loai !== 'trong') return false;
    if (mode === 'hoc' && c.loai === 'trong') return false;
    if (me.role !== 'admin' && c.giaoVienId !== me.id) return false;
    return true;
  }).map(function(c){
    return { thu: c.thu, khungGioId: c.khungGioId, loai: c.loai, giaoVienId: c.giaoVienId, hocVienIds: c.hocVienIds, ghiChu: c.ghiChu };
  });
  const res = schApplyOps_(toTuan, ops, { skipOccupied: true });
  res.total = ops.length;
  return res;
}

function saveTimeSlot_(slot) {
  slot = slot || {};
  const meta = schLoadMeta_();
  const p = schIndex_(meta.phong)[String(slot.phongId)];
  if (!p) throw new Error('Chưa chọn phòng');
  const b = Math.round(Number(slot.batDau)), e = Math.round(Number(slot.ketThuc));
  if (!(b >= 0 && e <= 24 * 60 && e > b)) throw new Error('Giờ kết thúc phải sau giờ bắt đầu');
  if (e - b < 15) throw new Error('Khung giờ tối thiểu 15 phút');
  if (meta.khungGio.some(function(k){ return k.phongId === p.id && k.batDau === b && k.ketThuc === e && k.id !== String(slot.id || ''); })) {
    throw new Error('Khung giờ ' + schSlotLabel_(b, e) + ' đã có trong ' + p.ten);
  }

  // Sửa khung giờ có sẵn (đổi phòng / đổi giờ): lịch đã xếp đi theo khung,
  // nên kiểm tra tuần này và các tuần sau không phát sinh xung đột.
  if (slot.id) {
    const kgMap = schIndex_(meta.khungGio);
    const old = kgMap[String(slot.id)];
    if (!old) throw new Error('Không tìm thấy khung giờ');
    const moved = Object.assign({}, old, { phongId: p.id, coSoId: p.coSoId, batDau: b, ketThuc: e });
    const newMap = Object.assign({}, kgMap);
    newMap[old.id] = moved;
    const fromTuan = schMondayOf_(todayYmd_());
    const weeks = {};
    readAll_(T.LichXep).forEach(function(r){
      const tuan = schToYmd_(r.tuan);
      if (String(r.khungGioId) === old.id && tuan >= fromTuan) weeks[tuan] = true;
    });
    const phongMap = schIndex_(meta.phong);
    const problems = [];
    Object.keys(weeks).sort().forEach(function(tuan){
      const cells = schCellsOfWeek_(tuan, newMap);
      cells.filter(function(c){ return c.khungGioId === old.id; }).forEach(function(c){
        cells.forEach(function(o){
          if (o === c) return;
          const why = schConflict_(c, o, phongMap);
          const ngay = schAddDays_(tuan, c.thu - 1);
          if (why) problems.push(SCH_DAYS[c.thu - 1] + ' ' + ngay.slice(8, 10) + '/' + ngay.slice(5, 7) + ': ' + why);
        });
      });
    });
    if (problems.length) {
      throw new Error('Không đổi được vì lịch đã xếp sẽ bị trùng:\n• ' + problems.filter(function(x, i, a){ return a.indexOf(x) === i; }).slice(0, 8).join('\n• '));
    }
    const row = readAll_(T.KhungGio).filter(function(r){ return String(r.id) === old.id; })[0];
    writeRows_(T.KhungGio, [], [Object.assign({}, row, { phongId: p.id, coSoId: p.coSoId, batDau: b, ketThuc: e })]);
    return { success: true, id: old.id, message: 'Đã đổi khung giờ thành ' + schSlotLabel_(b, e) + ' · ' + p.ten };
  }

  const id = 'KG-' + Date.now().toString(36);
  writeRows_(T.KhungGio, [{ id: id, coSoId: p.coSoId, phongId: p.id, batDau: b, ketThuc: e, thuTu: 0, active: true }]);
  return { success: true, id: id, message: 'Đã thêm khung giờ ' + schSlotLabel_(b, e) + ' · ' + p.ten };
}

function hideTimeSlot_(id) {
  const row = readAll_(T.KhungGio).filter(function(r){ return String(r.id) === String(id); })[0];
  if (!row) throw new Error('Không tìm thấy khung giờ');
  writeRows_(T.KhungGio, [], [Object.assign({}, row, { active: false })]);
  return { success: true, message: 'Đã ẩn khung giờ ' + schSlotLabel_(row.batDau, row.ketThuc) };
}

function saveCoSo_(c) {
  c = c || {};
  const ten = String(c.ten || '').trim();
  if (!ten) throw new Error('Nhập tên cơ sở');
  const diaChi = String(c.diaChi || '').trim();
  const rows = readAll_(T.CoSo);
  if (c.id) {
    const row = rows.filter(function(r){ return String(r.id) === String(c.id); })[0];
    if (!row) throw new Error('Không tìm thấy cơ sở');
    writeRows_(T.CoSo, [], [Object.assign({}, row, { tenCoSo: ten, diaChi: diaChi })]);
    return { success: true, id: String(row.id), message: 'Đã cập nhật cơ sở ' + ten };
  }
  const id = 'CS-' + Date.now().toString(36);
  writeRows_(T.CoSo, [{ id: id, tenCoSo: ten, diaChi: diaChi, thuTu: rows.length + 1, active: true }]);
  writeRows_(T.Phong, [{ id: 'PH-' + Date.now().toString(36), coSoId: id, tenPhong: 'Phòng 1', sucChua: 2, thuTu: 1, active: true }]);
  return { success: true, id: id, message: 'Đã thêm cơ sở ' + ten + ' (kèm "Phòng 1")' };
}

function savePhong_(p) {
  p = p || {};
  const ten = String(p.ten || '').trim();
  if (!ten) throw new Error('Nhập tên phòng');
  const sucChua = Math.min(20, Math.max(1, parseInt(p.sucChua, 10) || 2));
  const rows = readAll_(T.Phong);
  if (p.id) {
    const row = rows.filter(function(r){ return String(r.id) === String(p.id); })[0];
    if (!row) throw new Error('Không tìm thấy phòng');
    writeRows_(T.Phong, [], [Object.assign({}, row, { tenPhong: ten, sucChua: sucChua })]);
    return { success: true, id: String(row.id), message: 'Đã cập nhật phòng ' + ten };
  }
  if (!readAll_(T.CoSo).some(function(r){ return String(r.id) === String(p.coSoId) && schActive_(r); })) throw new Error('Chưa chọn cơ sở');
  const id = 'PH-' + Date.now().toString(36);
  const order = rows.filter(function(r){ return String(r.coSoId) === String(p.coSoId); }).length + 1;
  writeRows_(T.Phong, [{ id: id, coSoId: String(p.coSoId), tenPhong: ten, sucChua: sucChua, thuTu: order, active: true }]);
  return { success: true, id: id, message: 'Đã thêm phòng ' + ten };
}

/** Lịch học sắp tới của 1 học viên. Học viên chỉ xem được lịch của chính mình. */
function getMySchedule_(hocVienId) {
  const me = ME_;
  let hvId;
  if (me.role === 'hv') {
    hvId = me.hocVienId;
  } else {
    const canView = me.role === 'admin' || !!(me.permissions && me.permissions.students && me.permissions.students.view);
    if (!canView) throw new Error('Bạn không có quyền xem lịch học viên');
    hvId = String(hocVienId || '');
  }
  const all = readAll_(T.HocVien);
  const hv = all.filter(function(r){ return String(r.id) === hvId; })[0];
  if (!hv) throw new Error('Không tìm thấy học viên');
  const nameOf = {};
  all.forEach(function(r){ nameOf[String(r.id)] = String(r.hoTen || ''); });

  const meta = schLoadMeta_();
  const kgMap = schIndex_(meta.khungGio), phongMap = schIndex_(meta.phong), coSoMap = schIndex_(meta.coSo), teacherMap = schIndex_(meta.teachers);
  const today = todayYmd_();
  const fromTuan = schMondayOf_(today);
  const items = [];
  readAll_(T.LichXep).forEach(function(r){
    const tuan = schToYmd_(r.tuan);
    const loai = String(r.loai || '');
    if (!schValidYmd_(tuan) || tuan < fromTuan || (loai !== 'hoc' && loai !== 'thu')) return;
    const ids = schParseIds_(r.hocVienIds);
    if (ids.indexOf(hvId) === -1) return;
    const kg = kgMap[String(r.khungGioId)];
    if (!kg) return;
    const thu = Number(r.thu);
    const ngay = schAddDays_(tuan, thu - 1);
    if (ngay < today) return;
    const ph = phongMap[kg.phongId] || {}, cs = coSoMap[kg.coSoId] || {}, gv = teacherMap[String(r.giaoVienId)] || {};
    items.push({
      ngay: ngay, thu: thu, thuTen: SCH_DAYS[thu - 1], gio: schSlotLabel_(kg.batDau, kg.ketThuc), batDau: kg.batDau,
      phong: ph.ten || '', coSo: cs.ten || '', diaChi: cs.diaChi || '', giaoVien: gv.ten || '', mau: gv.mau || '', loai: loai,
      hocCung: ids.filter(function(id){ return id !== hvId; }).map(function(id){ return nameOf[id] || ''; }).filter(Boolean)
    });
  });
  items.sort(function(a, b){ return a.ngay < b.ngay ? -1 : a.ngay > b.ngay ? 1 : a.batDau - b.batDau; });
  return {
    today: today,
    hocVien: {
      id: hvId, hoTen: String(hv.hoTen || ''), giaoVien: String(hv.giaoVien || ''), tinhTrang: String(hv.tinhTrang || ''),
      soBuoiKhoa: Number(hv.soBuoiKhoa || hv.soBuoiDeal) || 0, soBuoiDaHoc: Number(hv.soBuoiDaHoc) || 0,
      soBuoiConLai: Number(hv.soBuoiConLai) || 0, avatar: String(hv.avatar || '')
    },
    items: items
  };
}
// ===================== DASHBOARD TỔNG QUAN (V2) =====================
// Gom 5 khối của trang Tổng quan trong 1 lần gọi. GV chỉ nhận học viên của mình;
// mọi thông tin tiền chỉ trả về cho Admin (lọc ở máy chủ, không chỉ ẩn trên giao diện).
const DASH_CRIT = {
  pitch: 'Cao độ', rhythm: 'Nhịp phách', breath: 'Hơi thở (Breath control)', tone: 'Chất giọng',
  expression: 'Biểu cảm', focusSkill: 'Kỹ thuật trọng tâm', homework: 'Bài tập về nhà', confidence: 'Tự tin'
};

function dashIsTrial_(r) {
  const ts = String(r.trialStatus || '').trim();
  if (ts) return ts !== 'confirmed';
  const st = String(r.tinhTrang || '');
  return st.indexOf('thử') >= 0 || st.indexOf('Chờ phản hồi') >= 0 || st.indexOf('Từ chối') >= 0;
}

function dashDays_(from, to) {
  from = schToYmd_(from); to = schToYmd_(to);
  if (!schValidYmd_(from) || !schValidYmd_(to)) return null;
  return Math.round((schYmdToUtc_(to) - schYmdToUtc_(from)) / 86400000);
}

// Khoá hiện tại của học viên: khoá thứ mấy, bao nhiêu buổi, đã học mấy buổi trong khoá này
function dashCourse_(r) {
  const total = Number(r.soBuoiKhoa || r.soBuoiDeal) || 0;
  const start = Number(r.buoiDauKhoa) || 0;
  const size = Number(r.soBuoiKhoaHienTai) || Math.max(0, total - start) || total;
  const done = Math.max(0, Math.min(size, (Number(r.soBuoiDaHoc) || 0) - start));
  return { so: Number(r.soKhoaDaHoc) || 1, size: size, done: done };
}

function dashDM_(ymd) { ymd = schToYmd_(ymd); return schValidYmd_(ymd) ? ymd.slice(8, 10) + '/' + ymd.slice(5, 7) : ''; }

function getDashboardV2_() {
  const me = ME_;
  const isAdmin = me && me.role === 'admin';
  const ver = getDashboardCacheVer_();
  const cacheKey = 'dash_v2_' + (me ? (me.id + '_' + me.role) : 'anon') + '_' + ver;

  // 4. Kiểm tra CacheService (TTL 90s)
  try {
    if (typeof CacheService !== 'undefined') {
      const cached = CacheService.getScriptCache().get(cacheKey);
      if (cached) return JSON.parse(cached);
    }
  } catch(e) {}

  const today = todayYmd_();
  const meta = schLoadMeta_();
  const teacherMap = schIndex_(meta.teachers);
  const all = readAll_(T.HocVien).filter(schActive_);
  const hvMap = {};
  all.forEach(function(r){ hvMap[String(r.id)] = r; });
  const ownerOf = function(r){ return schTeacherIdForName_(meta.teachers, r.giaoVien); };
  const visible = function(r){ return isAdmin || ownerOf(r) === me.id; };
  const st = function(r){ return String(r.tinhTrang || ''); };
  const isActive = function(r){ return st(r).indexOf('Đang học') >= 0; };
  const official = all.filter(function(r){ return !dashIsTrial_(r); });
  const mine = official.filter(visible);
  const trials = all.filter(function(r){
    const ts = String(r.trialStatus || '');
    return dashIsTrial_(r) && ts !== 'rejected' && st(r).indexOf('Từ chối') === -1;
  });
  const trialAge = function(r){ return dashDays_(r.ngayHocThu || r.createdAt, today); };

  // 1. KPI
  const kpi = {
    total: mine.length,
    active: mine.filter(isActive).length,
    completed: mine.filter(function(r){ return /hoàn thành/i.test(st(r)); }).length,
    stopped: mine.filter(function(r){ return /nghỉ/i.test(st(r)); }).length,
    trial: trials.length,
    trialStale: trials.filter(function(r){ return (trialAge(r) || 0) > 3; }).length,
    scope: isAdmin ? 'all' : 'mine'
  };

  // Buổi học & đánh giá theo học viên
  const sessions = {};
  readAll_(T.BuoiHoc).forEach(function(b){
    const id = String(b.hocVienId || '');
    (sessions[id] = sessions[id] || []).push({ ngay: schToYmd_(b.ngayHoc), buoiSo: Number(b.buoiSo) || 0,
      total: Number(b.totalScore) || 0, card: b.scoreCardJson });
  });
  Object.keys(sessions).forEach(function(id){
    sessions[id].sort(function(a, b){ return a.ngay < b.ngay ? -1 : a.ngay > b.ngay ? 1 : a.buoiSo - b.buoiSo; });
  });
  const lastTest = {};
  readAll_(T.DanhGiaGiong).forEach(function(d){
    const id = String(d.hocVienId || ''), ngay = schToYmd_(d.ngayDanhGia || d.createdAt);
    if (!lastTest[id] || ngay > lastTest[id]) lastTest[id] = ngay;
  });

  // 2. Lịch dạy hôm nay (từ lưới Lịch dạy)
  const tuan = schMondayOf_(today);
  const thu = dashDays_(tuan, today) + 1;
  const phongMap = schIndex_(meta.phong), coSoMap = schIndex_(meta.coSo);
  const todaySlots = schCellsOfWeek_(tuan, schIndex_(meta.khungGio)).filter(function(c){
    return c.thu === thu && (c.loai === 'hoc' || c.loai === 'thu') && (isAdmin || c.giaoVienId === me.id);
  }).sort(function(a, b){ return a.batDau - b.batDau; }).map(function(c){
    const t = teacherMap[c.giaoVienId] || {};
    return {
      gio: schSlotLabel_(c.batDau, c.ketThuc), loai: c.loai, ghiChu: c.ghiChu,
      giaoVien: t.ten || '', mau: t.mau || '',
      phong: (phongMap[c.phongId] || {}).ten || '',
      coSo: meta.coSo.length > 1 ? ((coSoMap[c.coSoId] || {}).ten || '') : '',
      students: c.hocVienIds.map(function(id){
        const r = hvMap[id];
        if (!r) return null;
        const course = dashCourse_(r);
        const conLai = Number(r.soBuoiConLai) || 0;
        const s = { id: id, hoTen: String(r.hoTen || ''), lop: String(r.lop || ''), rank: String(r.rank || ''),
          trial: dashIsTrial_(r), buoiSo: Math.min(course.size || Infinity, course.done + 1), soBuoiKhoa: course.size, khoaSo: course.so,
          lastSession: !dashIsTrial_(r) && course.size > 0 && conLai <= 1, tested: !!lastTest[id] };
        if (isAdmin) s.daDong = schIsTrue_(r.daDongHocPhi);
        return s;
      }).filter(Boolean)
    };
  });

  // 3. Cần xử lý
  const items = [];
  const push = function(level, r, text, target){
    items.push({
      level: level,
      hvId: String(r.id),
      hoTen: String(r.hoTen || ''),
      lop: String(r.lop || ''),
      dienThoai: String(r.dienThoai || ''),
      zalo: String(r.zalo || ''),
      facebook: String(r.facebook || ''),
      hocPhi: Number(r.hocPhi) || 0,
      daDongHocPhi: schIsTrue_(r.daDongHocPhi),
      text: text,
      target: target || 'profile'
    });
  };
  if (isAdmin) {
    // Hạn học phí tính theo buổi của khoá hiện tại: phải đóng trước buổi thứ N (cấu hình)
    const due = dashPayDue_();
    official.filter(isActive).forEach(function(r){
      if (schIsTrue_(r.daDongHocPhi)) return;
      const c = dashCourse_(r);
      const label = 'Chưa đóng học phí' + (c.so > 1 ? ' khoá ' + c.so : '') + ' — đã học ' + c.done + '/' + c.size + ' buổi';
      push(c.done >= due ? 'red' : 'yellow', r, label + (c.done >= due ? ' (quá hạn: phải đóng trước buổi ' + due + ')' : ''), 'profile');
    });
  }
  mine.filter(isActive).forEach(function(r){
    const id = String(r.id);
    const khoa = Number(r.soBuoiKhoa || r.soBuoiDeal) || 0;
    const conLai = Number(r.soBuoiConLai) || 0;
    const ss = sessions[id] || [];
    if (khoa > 0 && conLai <= 0) {
      const d = ss.length ? dashDays_(ss[ss.length - 1].ngay, today) : null;
      if (d !== null && d > 3) push('red', r, 'Hết buổi ' + d + ' ngày trước, chưa gia hạn');
      else push('yellow', r, 'Đã hết buổi, cần gia hạn khoá mới');
    } else if (khoa > 0 && conLai <= 2) {
      const since = schToYmd_(r.ngayKhoaMoi || r.ngayBatDau);
      if (!lastTest[id] || (schValidYmd_(since) && lastTest[id] < since)) push('yellow', r, 'Còn ' + conLai + ' buổi, nhắc Test Rank cuối khoá');
    }
    const scored = ss.filter(function(x){ return x.card; });
    if (scored.length) {
      let card = {};
      try { card = typeof scored[scored.length - 1].card === 'string' ? JSON.parse(scored[scored.length - 1].card) : scored[scored.length - 1].card; } catch(e) {}
      const weak = Object.keys(DASH_CRIT).filter(function(k){ return Number(card && card[k]) === 1; }).map(function(k){ return DASH_CRIT[k]; });
      if (weak.length) push('green', r, 'Buổi tiếp theo cần ôn lại ' + weak.slice(0, 3).join(', '));
    }
    // Cảnh báo hạn Drive 60 ngày
    const baseDate = r.ngayKhoaMoi || r.ngayBatDau || r.createdAt;
    const baseDt = parseDateAny_(baseDate);
    if (baseDt) {
      const expMs = baseDt.getTime() + (60 * 24 * 3600 * 1000);
      const daysLeft = Math.ceil((expMs - (new Date()).getTime()) / (24 * 3600 * 1000));
      if (daysLeft <= 0) {
        push('red', r, 'Link Drive đã quá hạn 60 ngày, cần sao lưu hoặc gia hạn');
      } else if (daysLeft <= 7) {
        push('yellow', r, 'Cảnh báo link Drive còn ' + daysLeft + ' ngày (hết hạn sau 60 ngày)');
      }
    }
  });
  trials.forEach(function(r){
    const ts = String(r.trialStatus || 'new');
    if (ts === 'confirmed') return;
    const d = trialAge(r);
    if (d !== null && d > 2) push('yellow', r, 'Học thử ' + dashDM_(r.ngayHocThu || r.createdAt) + ', chưa phản hồi (' + d + ' ngày)', 'trial');
  });
  const order = { red: 0, yellow: 1, green: 2 };
  items.sort(function(a, b){ return order[a.level] - order[b.level]; });

  // 4a. Tiến bộ tuần này: buổi chấm gần nhất (trong 7 ngày) so với buổi chấm trước đó
  const progress = [];
  mine.forEach(function(r){
    const sc = (sessions[String(r.id)] || []).filter(function(x){ return x.total > 0; });
    if (sc.length < 2) return;
    const last = sc[sc.length - 1], prev = sc[sc.length - 2];
    const d = dashDays_(last.ngay, today);
    if (d === null || d < 0 || d > 7) return;
    progress.push({ hvId: String(r.id), hoTen: String(r.hoTen || ''), from: prev.total, to: last.total, delta: last.total - prev.total });
  });
  progress.sort(function(a, b){ return b.delta - a.delta; });
  const avgDelta = progress.length ? Math.round(progress.reduce(function(s, p){ return s + p.delta; }, 0) / progress.length * 10) / 10 : null;

  const out = {
    today: today, thuTen: SCH_DAYS[thu - 1], kpi: kpi, todaySchedule: todaySlots,
    actionItems: items, weeklyProgress: { items: progress, avgDelta: avgDelta }, distribution: null, finance: null
  };

  // 4b + 5. Chỉ Admin: phân bố & tài chính (khoá đang học)
  if (isAdmin) {
    const studying = official.filter(isActive);
    const subDist = {
      vocal:  { label: 'Thanh nhạc', icon: '🎙', byRank: { A: 0, B: 0, C: 0, D: 0 }, byLop: {}, total: 0 },
      piano:  { label: 'Piano',      icon: '🎹', byRank: { A: 0, B: 0, C: 0, D: 0 }, byLop: {}, total: 0 },
      guitar: { label: 'Guitar',     icon: '🎸', byRank: { A: 0, B: 0, C: 0, D: 0 }, byLop: {}, total: 0 }
    };
    const byLop = {};
    studying.forEach(function(r){
      const lp = String(r.lop || '').trim();
      const lpUpper = lp.toUpperCase();
      let key = 'vocal';
      if (lpUpper.indexOf('PIANO') !== -1 || lpUpper.indexOf('PN') !== -1) {
        key = 'piano';
      } else if (lpUpper.indexOf('GUITAR') !== -1 || lpUpper.indexOf('GT') !== -1) {
        key = 'guitar';
      }
      const target = subDist[key];
      target.total++;
      const rk = String(r.rank || '').toUpperCase();
      if (target.byRank[rk] !== undefined) target.byRank[rk]++;
      const lpName = lp || 'Khác';
      target.byLop[lpName] = (target.byLop[lpName] || 0) + 1;
      byLop[lpName] = (byLop[lpName] || 0) + 1;
    });

    out.distribution = {
      totalStudying: studying.length,
      bySubject: subDist,
      byRank: {
        A: subDist.vocal.byRank.A + subDist.piano.byRank.A + subDist.guitar.byRank.A,
        B: subDist.vocal.byRank.B + subDist.piano.byRank.B + subDist.guitar.byRank.B,
        C: subDist.vocal.byRank.C + subDist.piano.byRank.C + subDist.guitar.byRank.C,
        D: subDist.vocal.byRank.D + subDist.piano.byRank.D + subDist.guitar.byRank.D
      },
      byLop: byLop
    };

    let tong = 0, daThu = 0, soNo = 0;
    studying.forEach(function(r){
      const fee = Number(r.hocPhi) || 0;
      tong += fee;
      if (schIsTrue_(r.daDongHocPhi)) daThu += fee; else soNo++;
    });
    out.finance = { thang: today.slice(5, 7) + '/' + today.slice(0, 4), tongThu: tong, daThu: daThu, conThieu: tong - daThu, soNo: soNo, soHv: studying.length };
  }

  // Lưu vào CacheService (90 giây)
  try {
    if (typeof CacheService !== 'undefined') {
      const jsonStr = JSON.stringify(out);
      if (jsonStr.length < 95000) {
        CacheService.getScriptCache().put(cacheKey, jsonStr, 90);
      }
    }
  } catch(e) {}

  return out;
}
// ===================== [SHARED-SCHEDULE-END] =====================

// ===================== LỊCH DẠY — PHẦN CHỈ CHẠY TRÊN APPS SCRIPT =====================
function todayYmd_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

/**
 * Ghi hàng loạt vào 1 bảng: thêm mới, cập nhật (cả dòng, theo id) và xoá (theo id).
 * Chuỗi dạng ngày (yyyy-MM-dd) hoặc bắt đầu bằng = + - @ được giữ nguyên dạng chữ.
 */
function writeRows_(name, inserts, updates, deleteIds) {
  inserts = inserts || []; updates = updates || []; deleteIds = deleteIds || [];
  const sh = sheet_(name);
  const lastCol = sh.getLastColumn();
  const head = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h){ return String(h).trim(); });
  const cellOf = function(v){
    if (v === undefined || v === null) return '';
    if (typeof v === 'string' && (/^[=+\-@]/.test(v) || /^\d{4}-\d{2}-\d{2}$/.test(v))) return "'" + v;
    return v;
  };
  const toRow = function(o){ return head.map(function(h){ return h ? cellOf(o[h]) : ''; }); };

  if (updates.length || deleteIds.length) {
    const lastRow = sh.getLastRow();
    const idCol = head.indexOf('id');
    const ids = lastRow > 1 ? sh.getRange(2, idCol + 1, lastRow - 1, 1).getValues().map(function(r){ return String(r[0]); }) : [];
    const rowOf = {};
    ids.forEach(function(id, i){ rowOf[id] = i + 2; });
    updates.forEach(function(o){
      const r = rowOf[String(o.id)];
      if (r) sh.getRange(r, 1, 1, lastCol).setValues([toRow(o)]);
    });
    const delRows = deleteIds.map(function(id){ return rowOf[String(id)]; }).filter(Boolean).sort(function(a, b){ return b - a; });
    if (delRows.length > 20) {
      const gone = {};
      delRows.forEach(function(r){ gone[r] = true; });
      const keep = sh.getRange(2, 1, lastRow - 1, lastCol).getValues()
        .filter(function(row, i){ return !gone[i + 2]; })
        .map(function(row){ return row.map(cellOf); });
      sh.getRange(2, 1, lastRow - 1, lastCol).clearContent();
      if (keep.length) sh.getRange(2, 1, keep.length, lastCol).setValues(keep);
    } else {
      delRows.forEach(function(r){ sh.deleteRow(r); });
    }
  }

  if (inserts.length) {
    const start = sh.getLastRow() + 1;
    const need = start + inserts.length - 1 - sh.getMaxRows();
    if (need > 0) sh.insertRowsAfter(sh.getMaxRows(), need);
    sh.getRange(start, 1, inserts.length, lastCol).setValues(inserts.map(toRow));
  }
}

// ---- Đồng bộ Google Calendar ----
// Mỗi buổi Học / Học thử = 1 sự kiện trên lịch chung của trung tâm, gắn tag lxId để
// lần đồng bộ sau cập nhật / xoá đúng sự kiện thay vì tạo trùng.
function schCalendar_() {
  let cal = null;
  const id = PROP.getProperty('CAL_ID');
  if (id) { try { cal = CalendarApp.getCalendarById(id); } catch(e) { cal = null; } }
  if (!cal) {
    cal = CalendarApp.createCalendar(APP_NAME + ' – Lịch dạy', { timeZone: Session.getScriptTimeZone(), color: CalendarApp.Color.TEAL });
    PROP.setProperty('CAL_ID', cal.getId());
  }
  return cal;
}

function schDateAt_(ymd, minutes) {
  const p = ymd.split('-').map(Number);
  return new Date(p[0], p[1] - 1, p[2], Math.floor(minutes / 60), minutes % 60, 0, 0);
}

function schIsEmail_(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim()); }

function schPlanCalendar_(tuan, gvIds, invite) {
  const me = ME_;
  if (!schValidYmd_(tuan)) throw new Error('Tuần không hợp lệ');
  tuan = schMondayOf_(tuan);
  const meta = schLoadMeta_();
  const kgMap = schIndex_(meta.khungGio), phongMap = schIndex_(meta.phong), coSoMap = schIndex_(meta.coSo), teacherMap = schIndex_(meta.teachers);
  if (me.role !== 'admin') gvIds = [me.id];
  gvIds = (Array.isArray(gvIds) ? gvIds : []).map(String).filter(function(id){ return teacherMap[id]; });
  if (!gvIds.length) throw new Error(me.role === 'admin' ? 'Chưa chọn giáo viên' : 'Tài khoản chưa được bật "Dạy học"');

  const hv = {};
  readAll_(T.HocVien).forEach(function(r){ hv[String(r.id)] = r; });
  const desired = schCellsOfWeek_(tuan, kgMap).filter(function(c){
    return (c.loai === 'hoc' || c.loai === 'thu') && gvIds.indexOf(c.giaoVienId) !== -1;
  }).map(function(c){
    const t = teacherMap[c.giaoVienId], ph = phongMap[c.phongId] || {}, cs = coSoMap[c.coSoId] || {};
    const names = c.hocVienIds.map(function(id){ return hv[id] ? String(hv[id].hoTen) : ''; }).filter(Boolean);
    const title = '[' + t.ten + '] ' + (c.loai === 'thu' ? 'Học thử: ' + (names.join(' + ') || c.ghiChu) : names.join(' + '));
    const ngay = schAddDays_(tuan, c.thu - 1);
    const lines = ['Giáo viên: ' + (t.hoTen || t.ten)];
    c.hocVienIds.forEach(function(id){
      const r = hv[id];
      if (r) lines.push('Học viên: ' + r.hoTen + ' (còn ' + (Number(r.soBuoiConLai) || 0) + ' buổi)');
    });
    if (c.ghiChu) lines.push('Ghi chú: ' + c.ghiChu);
    lines.push('', 'Tạo tự động từ ' + APP_NAME);
    const ev = {
      lxId: c.id, gvId: c.giaoVienId, title: title,
      start: schDateAt_(ngay, c.batDau), end: schDateAt_(ngay, c.ketThuc),
      location: [ph.ten, cs.ten, cs.diaChi].filter(Boolean).join(' – '),
      description: lines.join('\n'),
      guest: invite && schIsEmail_(t.email) ? String(t.email).trim() : '',
      label: SCH_DAYS[c.thu - 1] + ' ' + ngay.slice(8, 10) + '/' + ngay.slice(5, 7) + ' · ' + schSlotLabel_(c.batDau, c.ketThuc) + ' · ' + title
    };
    ev.sig = sha256Hex_([ev.title, ev.start.getTime(), ev.end.getTime(), ev.location, ev.description, ev.guest].join('|')).slice(0, 16);
    return ev;
  });

  const cal = schCalendar_();
  const existing = cal.getEvents(schDateAt_(tuan, 0), schDateAt_(schAddDays_(tuan, 7), 0)).filter(function(e){
    return e.getTag('lxId') && gvIds.indexOf(String(e.getTag('gvId'))) !== -1;
  });
  const exById = {};
  existing.forEach(function(e){ if (!exById[e.getTag('lxId')]) exById[e.getTag('lxId')] = e; });
  const want = {};
  const plan = { create: [], update: [], remove: [], keep: 0 };
  desired.forEach(function(d){
    want[d.lxId] = true;
    const e = exById[d.lxId];
    if (!e) plan.create.push(d);
    else if (e.getTag('sig') !== d.sig) plan.update.push({ d: d, e: e });
    else plan.keep++;
  });
  existing.forEach(function(e){
    if (!want[e.getTag('lxId')] || exById[e.getTag('lxId')] !== e) plan.remove.push(e);
  });
  return { cal: cal, tuan: tuan, plan: plan };
}

function previewCalendarSync_(tuan, gvIds, invite) {
  const r = schPlanCalendar_(tuan, gvIds, invite), p = r.plan;
  const tz = Session.getScriptTimeZone();
  return {
    calendarName: r.cal.getName(),
    create: p.create.length, update: p.update.length, remove: p.remove.length, keep: p.keep,
    lines: p.create.map(function(d){ return '➕ ' + d.label; })
      .concat(p.update.map(function(u){ return '✏️ ' + u.d.label; }))
      .concat(p.remove.map(function(e){ return '🗑 ' + e.getTitle() + ' (' + Utilities.formatDate(e.getStartTime(), tz, 'dd/MM HH:mm') + ')'; }))
  };
}

function runCalendarSync_(tuan, gvIds, invite) {
  return withLock_(function(){
    const r = schPlanCalendar_(tuan, gvIds, invite), p = r.plan;
    const errors = [];
    let created = 0, updated = 0, removed = 0;
    p.create.forEach(function(d){
      try {
        const opts = { location: d.location, description: d.description };
        if (d.guest) { opts.guests = d.guest; opts.sendInvites = true; }
        const ev = r.cal.createEvent(d.title, d.start, d.end, opts);
        ev.setTag('lxId', d.lxId); ev.setTag('gvId', d.gvId); ev.setTag('sig', d.sig);
        created++;
      } catch(e) { errors.push(d.label + ': ' + e.message); }
    });
    p.update.forEach(function(u){
      try {
        const ev = u.e, d = u.d;
        ev.setTitle(d.title); ev.setTime(d.start, d.end); ev.setLocation(d.location); ev.setDescription(d.description);
        if (d.guest && !ev.getGuestByEmail(d.guest)) ev.addGuest(d.guest);
        ev.setTag('sig', d.sig);
        updated++;
      } catch(e) { errors.push(u.d.label + ': ' + e.message); }
    });
    p.remove.forEach(function(e){
      try { e.deleteEvent(); removed++; } catch(err) { errors.push('Xoá "' + e.getTitle() + '": ' + err.message); }
    });
    return {
      success: !errors.length, created: created, updated: updated, removed: removed, keep: p.keep, errors: errors,
      calendarName: r.cal.getName(),
      calendarUrl: 'https://calendar.google.com/calendar/u/0/r/week/' + r.tuan.replace(/-/g, '/')
    };
  });
}

// ---- Nhập dữ liệu cũ từ bản chạy localStorage ----
// Bản web app trước đây chạy mock lưu trong trình duyệt. Hàm này nhận dữ liệu đó và
// chỉ thêm các bản ghi có mã (id) chưa tồn tại trong Google Sheet.
function importLegacyData_(payload) {
  payload = payload || {};
  const report = {};
  withLock_(function(){
    ['HocVien', 'BuoiHoc', 'DanhGiaGiong', 'PhanTichBai'].forEach(function(t){
      const rows = Array.isArray(payload[t]) ? payload[t] : [];
      const have = {};
      readAll_(t).forEach(function(r){ have[String(r.id)] = true; });
      const fresh = rows.filter(function(r){ return r && r.id && !have[String(r.id)]; }).map(function(r){
        const o = {};
        Object.keys(r).forEach(function(k){
          let v = r[k];
          if (v && typeof v === 'object') v = JSON.stringify(v);
          if (typeof v === 'string' && v.length > 49000) v = '';
          o[k] = v;
        });
        if (t === 'HocVien') {
          if (o.password && !isHashed_(o.password)) o.password = hashPassword_(o.password);
          if (o.active === undefined || o.active === '') o.active = true;
        }
        return o;
      });
      if (fresh.length) writeRows_(t, fresh);
      report[t] = { total: rows.length, added: fresh.length, skipped: rows.length - fresh.length };
    });
  });
  return { success: true, report: report };
}

// ===================== TIỆN ÍCH =====================
function cleanRow_(o) {
  const out = {};
  Object.keys(o).forEach(function(k){
    let v = o[k];
    if (v instanceof Date) v = Utilities.formatDate(v, Session.getScriptTimeZone(), 'dd/MM/yyyy');
    out[k] = v;
  });
  return out;
}

function getDbUrl_() {
  try {
    return getDbSpreadsheet_(false).getUrl();
  } catch(e) {
    return '';
  }
}

// ===================== SEED DATA =====================
function seedData_() {
  const seed = [
    {hoTen:'My',rank:'D',tinhTrang:'Đã hoàn thành',lop:'TNN',giaoVien:'Linh',ngayBatDau:'2025-11-27',soBuoiKhoa:12,soBuoiDeal:12,soBuoiDaHoc:12,soBuoiConLai:0,loaiGiong:'Nữ trung',loaiHocVien:'STUDIED_MANY',hocPhi:3500000,daDongHocPhi:true,tienMatDaThu:0,linkDrive:'https://drive.google.com/drive/folders/1yc-eR-6QjJmPXMvGn4WSrhDX5gCxVcYH'},
    {hoTen:'An',rank:'C',tinhTrang:'Đã hoàn thành',lop:'TNN',giaoVien:'Linh',ngayBatDau:'2025-12-02',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:6,soBuoiConLai:0,loaiGiong:'Nữ cao',loaiHocVien:'STUDIED_2_TERMS',hocPhi:1750000,daDongHocPhi:true,tienMatDaThu:0,linkDrive:'https://drive.google.com/drive/folders/1mx7zB7w8k52Vdyelxy6yG8BzFDpA6Cea'},
    {hoTen:'Chị Yên',rank:'A',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',ngayBatDau:'2025-12-26',ngayKhoaMoi:'2026-09-02',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:2,soBuoiConLai:4,loaiGiong:'Nữ trung',loaiHocVien:'STUDIED_2_TERMS',hocPhi:1750000,daDongHocPhi:true,tienMatDaThu:500000,linkDrive:'https://drive.google.com/drive/folders/1ijFMnhWjomA9Z_DoXbj6YrGqY69ZvuuG'},
    {hoTen:'Kiến Quốc',rank:'C',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',ngayBatDau:'2026-03-11',ngayKhoaMoi:'2026-09-02',soBuoiKhoa:8,soBuoiDeal:8,soBuoiDaHoc:3,soBuoiConLai:5,loaiGiong:'Nam cao',loaiHocVien:'NEW',hocPhi:2500000,daDongHocPhi:true,tienMatDaThu:0,linkDrive:'https://drive.google.com/drive/folders/1b_AgCcSL9BdBpVgfvt9BouWyvRVEDhs7'},
    {hoTen:'A Minh Anh',rank:'A',tinhTrang:'Đã hoàn thành',lop:'TN11',giaoVien:'Linh',ngayBatDau:'2026-03-22',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:6,soBuoiConLai:0,loaiGiong:'Nam trung',loaiHocVien:'NEW',hocPhi:1750000,daDongHocPhi:true,tienMatDaThu:0,linkDrive:'https://drive.google.com/drive/folders/1c5XAm_pRLssPHyUfcOFVZXJObyd9bmtu'},
    {hoTen:'Anh Thuận',rank:'A',tinhTrang:'Đã hoàn thành',lop:'TN11',giaoVien:'Linh',ngayBatDau:'2026-03-12',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:6,soBuoiConLai:0,loaiGiong:'Nam trầm',loaiHocVien:'NEW',hocPhi:1750000,daDongHocPhi:true,tienMatDaThu:0,linkDrive:'https://drive.google.com/drive/folders/1FxQLUvfpd4rxR43zsJCCoOiOkk8puvnZ'},
    {hoTen:'Giang',rank:'C',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',ngayBatDau:'2026-04-06',ngayKhoaMoi:'2026-09-02',soBuoiKhoa:12,soBuoiDeal:12,soBuoiDaHoc:5,soBuoiConLai:7,loaiGiong:'Nữ cao',loaiHocVien:'STUDIED_MANY',hocPhi:3500000,daDongHocPhi:true,tienMatDaThu:1000000,linkDrive:'https://drive.google.com/drive/folders/1JZ72USn6pOI0IpKnPlG_820_7Az84yMh'},
    {hoTen:'Sơn',rank:'C',tinhTrang:'Đã học thử',lop:'TN11',giaoVien:'Linh',soBuoiKhoa:0,soBuoiDeal:0,soBuoiDaHoc:1,soBuoiConLai:0,loaiGiong:'Nam trung',loaiHocVien:'NEW',hocPhi:1750000,daDongHocPhi:false,tienMatDaThu:0},
    {hoTen:'Bí ngô',rank:'B',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',ngayBatDau:'2026-06-17',ngayKhoaMoi:'2026-09-02',soBuoiKhoa:8,soBuoiDeal:8,soBuoiDaHoc:4,soBuoiConLai:4,loaiGiong:'Nữ trung',loaiHocVien:'NEW',hocPhi:2500000,daDongHocPhi:true,tienMatDaThu:0,linkDrive:'https://drive.google.com/drive/folders/102L39D7iZl7MBfMngLeXBTslTEdLaGg6'},
    {hoTen:'Quyên Quyên',rank:'D',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Linh',ngayBatDau:'2026-07-08',ngayKhoaMoi:'2026-07-08',soBuoiKhoa:8,soBuoiDeal:8,soBuoiDaHoc:2,soBuoiConLai:6,loaiGiong:'Nữ cao',loaiHocVien:'NEW',hocPhi:2500000,daDongHocPhi:false,tienMatDaThu:0,linkDrive:'https://drive.google.com/drive/folders/10OekX2G908eK8Y_qDbLoP5UCw6KECWHs'},
    {hoTen:'Hưng',rank:'C',tinhTrang:'Đang học',lop:'TN12',giaoVien:'Quân',ngayBatDau:'2026-07-23',ngayKhoaMoi:'2026-09-02',soBuoiKhoa:8,soBuoiDeal:8,soBuoiDaHoc:3,soBuoiConLai:5,loaiGiong:'Nam cao',loaiHocVien:'NEW',hocPhi:2500000,daDongHocPhi:true,tienMatDaThu:0},
    {hoTen:'Nhi',rank:'B',tinhTrang:'Đang học',lop:'TN11',giaoVien:'Quân',ngayBatDau:'2026-07-13',ngayKhoaMoi:'2026-07-13',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:2,soBuoiConLai:4,loaiGiong:'Nữ cao',loaiHocVien:'NEW',hocPhi:1750000,daDongHocPhi:true,tienMatDaThu:0,linkDrive:'https://drive.google.com/drive/folders/1d-mSWz59uhrR6FbYWmuRKcK1gTprkNYr'},
    {hoTen:'Thông',rank:'A',tinhTrang:'Đang học',lop:'TN12',giaoVien:'Quân',ngayBatDau:'2026-08-22',ngayKhoaMoi:'2026-08-22',soBuoiKhoa:6,soBuoiDeal:6,soBuoiDaHoc:1,soBuoiConLai:5,loaiGiong:'Nam trung',loaiHocVien:'NEW',hocPhi:1750000,daDongHocPhi:true,tienMatDaThu:0}
  ];
  seed.forEach(function(s){ saveStudent_(s); });
  initDefaultUsers_();
  Logger.log('Đã seed ' + seed.length + ' học viên & khởi tạo users.');
}