/**
 * build_preview.js — Tạo file preview.html độc lập để test local
 * Chạy: node build_preview.js
 *
 * File preview.html sẽ:
 * - Inline toàn bộ CSS + JS
 * - Thay google.script.run bằng mock localStorage (preview_mock.js)
 * - Nhúng nguyên văn lõi Lịch dạy từ Code.txt (đoạn [SHARED-SCHEDULE-BEGIN] … [SHARED-SCHEDULE-END])
 *   để luật xung đột trong preview giống hệt bản chạy thật
 */

const fs = require('fs');

const indexHtml = fs.readFileSync('index.txt', 'utf8');
const styleContent = fs.readFileSync('Stylesheet.html', 'utf8');
const jsContent = fs.readFileSync('JavaScript.html', 'utf8');
const mockJs = fs.readFileSync('preview_mock.js', 'utf8');
const code = fs.readFileSync('Code.txt', 'utf8');

const BEGIN = '// ===================== [SHARED-SCHEDULE-BEGIN] =====================';
const END = '// ===================== [SHARED-SCHEDULE-END] =====================';
const b = code.indexOf(BEGIN), e = code.indexOf(END);
if (b === -1 || e === -1 || e < b) throw new Error('Không tìm thấy đoạn SHARED-SCHEDULE trong Code.txt');
const sharedSchedule = code.slice(b, e + END.length);

const mockBackend =
  '<script>\n' + mockJs + '\n</script>\n' +
  '<script>\n' + sharedSchedule + '\n</script>\n' +
  '<script>seedDemoSchedule();</script>\n';

const previewBanner = `
<div id="previewBanner" style="position:fixed;top:0;left:0;right:0;z-index:9999;background:linear-gradient(135deg,#120901,#281703);border-bottom:2px solid #C5A059;padding:6px 14px;display:flex;justify-content:space-between;align-items:center;gap:8px;font-family:'Be Vietnam Pro',sans-serif;flex-wrap:wrap">
  <div style="display:flex;align-items:center;gap:8px;min-width:0;flex-wrap:wrap">
    <span style="background:#C5A059;color:#1a0f00;font-weight:800;padding:2px 8px;border-radius:4px;font-size:11px;letter-spacing:.5px">TONY MUSIC</span>
    <span id="bannerCurUser" style="color:#e0be77;font-size:12px;font-weight:700">👑 Đang đăng nhập: Admin (Quản trị viên)</span>
  </div>
  <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
    <button onclick="goView('settings')" style="background:#C5A059;color:#1a0f00;border:none;padding:4px 10px;border-radius:5px;font-size:11px;cursor:pointer;font-weight:700;display:inline-flex;align-items:center;gap:3px">⚙ Cấu hình</button>
    <button onclick="quickSwitchUser('admin')" style="background:#2a1b07;color:#e0be77;border:1px solid #C5A059;padding:4px 8px;border-radius:5px;font-size:11px;cursor:pointer">👑 Admin</button>
    <button onclick="quickSwitchUser('linh')" style="background:#13261a;color:#5eead4;border:1px solid #1f4d36;padding:4px 8px;border-radius:5px;font-size:11px;cursor:pointer">👩‍🏫 GV Linh</button>
    <button onclick="quickSwitchUser('quan')" style="background:#13261a;color:#5eead4;border:1px solid #1f4d36;padding:4px 8px;border-radius:5px;font-size:11px;cursor:pointer">👨‍🏫 GV Quân</button>
    <button onclick="quickSwitchUser('thong')" style="background:#13202e;color:#7dd3fc;border:1px solid #1e3a5f;padding:4px 8px;border-radius:5px;font-size:11px;cursor:pointer">🎓 Học viên</button>
    <button onclick="logout()" style="background:#3b1111;color:#fca5a5;border:1px solid #7f1d1d;padding:4px 8px;border-radius:5px;font-size:11px;cursor:pointer;font-weight:600">⎋ Đăng nhập</button>
    <button onclick="__resetPreviewDB()" style="background:#222;color:#bbb;border:1px solid #444;padding:4px 8px;border-radius:5px;font-size:11px;cursor:pointer">🔄 Reset</button>
    <button onclick="document.getElementById('previewBanner').style.display='none';document.body.style.marginTop='0'" style="background:none;border:1px solid #555;color:#999;padding:4px 8px;border-radius:5px;font-size:11px;cursor:pointer" title="Ẩn thanh test">✕</button>
  </div>
</div>
<style>#previewBanner ~ .side { top: 40px !important; } body { margin-top: 40px; }</style>
`;

// Dùng hàm thay thế (không dùng chuỗi) để các ký tự $&, $' trong mã nguồn không bị hiểu nhầm
let previewHtml = indexHtml
  .replace(/<\?!= HtmlService\.createHtmlOutputFromFile\('Stylesheet'\)\.getContent\(\); \?>/g, function(){ return styleContent; })
  .replace(/<\?!= HtmlService\.createHtmlOutputFromFile\('JavaScript'\)\.getContent\(\); \?>/g, function(){ return mockBackend + '\n' + jsContent; })
  .replace(/<body([^>]*)>/, function(m){ return m + '\n' + previewBanner; });

fs.writeFileSync('preview.html', previewHtml, 'utf8');
console.log('✅ preview.html đã được tạo thành công!');
console.log('👉 Mở file preview.html trong trình duyệt để xem trước.');
console.log('📝 Dữ liệu được lưu trong localStorage — bấm nút "Reset" để khôi phục.');
