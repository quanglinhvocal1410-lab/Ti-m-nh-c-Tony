const fs = require('fs');

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const code = fs.readFileSync('Code.txt', 'utf8');
const index = fs.readFileSync('index.txt', 'utf8');
const style = fs.readFileSync('Stylesheet.html', 'utf8');
const js = fs.readFileSync('JavaScript.html', 'utf8');

const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>Deployment Helper - Tony Music Academy</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #070d0a; color: #ebf3ec; padding: 24px; max-width: 1000px; margin: 0 auto; line-height: 1.5; }
    h1 { color: #C5A059; font-size: 24px; margin-bottom: 8px; }
    .guide-box { background: #132018; border: 1px solid #223629; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
    .card { background: #0e1712; border: 1px solid #223629; border-radius: 10px; padding: 16px; margin-bottom: 20px; }
    .card h2 { font-size: 16px; color: #34D399; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
    textarea { width: 100%; height: 160px; background: #060a08; color: #a7f3d0; border: 1px solid #1c2b21; border-radius: 8px; padding: 10px; font-family: Consolas, Monaco, monospace; font-size: 12px; box-sizing: border-box; resize: vertical; }
    .btn-copy { background: linear-gradient(135deg, #C5A059, #e0be77); color: #161005; font-weight: 700; padding: 6px 14px; border: none; border-radius: 6px; cursor: pointer; font-size: 12.5px; transition: .15s; }
    .btn-copy:hover { transform: translateY(-1px); }
    .btn-link { color: #38bdf8; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <h1>📦 Sẵn sàng Deploy vào Google Apps Script</h1>
  <div class="guide-box">
    <p>🔗 <b>Link Apps Script:</b> <a class="btn-link" href="https://script.google.com/u/0/home/projects/1vw_NR_CFz5BZ40owI4a-s-HPwUO_Li9DfSPnnesmuNPu0EoBkya3n42G/edit" target="_blank">Mở Apps Script Project Editor</a></p>
    <p style="color:#8ea696;font-size:13px;margin-top:6px">👉 Bấm nút <b>Copy</b> từng file bên dưới, sau đó dán (Ctrl+A, Ctrl+V) vào file tương ứng trên Apps Script, bấm Lưu và Tạo Phiên bản triển khai mới.</p>
  </div>

  <div class="card">
    <h2>
      <span>1. Mã.gs (hoặc Code.gs)</span>
      <button class="btn-copy" onclick="copyText('code')">📋 Copy Mã.gs</button>
    </h2>
    <textarea id="code" readonly>${esc(code)}</textarea>
  </div>

  <div class="card">
    <h2>
      <span>2. Index.html</span>
      <button class="btn-copy" onclick="copyText('index')">📋 Copy Index.html</button>
    </h2>
    <textarea id="index" readonly>${esc(index)}</textarea>
  </div>

  <div class="card">
    <h2>
      <span>3. Stylesheet.html</span>
      <button class="btn-copy" onclick="copyText('style')">📋 Copy Stylesheet.html</button>
    </h2>
    <textarea id="style" readonly>${esc(style)}</textarea>
  </div>

  <div class="card">
    <h2>
      <span>4. JavaScript.html</span>
      <button class="btn-copy" onclick="copyText('js')">📋 Copy JavaScript.html</button>
    </h2>
    <textarea id="js" readonly>${esc(js)}</textarea>
  </div>

  <script>
    function copyText(id) {
      const el = document.getElementById(id);
      el.select();
      navigator.clipboard.writeText(el.value).then(function(){
        alert('✅ Đã copy mã nguồn ' + id + ' vào Clipboard!');
      });
    }
  </script>
</body>
</html>`;

fs.writeFileSync('helper.html', html, 'utf8');
console.log('helper.html generated successfully!');
