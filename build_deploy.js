/**
 * build_deploy.js — Chép mã nguồn vào thư mục deploy/ để đẩy lên Apps Script bằng clasp
 * Chạy: node build_deploy.js   rồi   cd deploy && ..\node_modules\.bin\clasp push
 *
 *   Code.txt         → deploy/Code.js
 *   index.txt        → deploy/Index.html
 *   Stylesheet.html  → deploy/Stylesheet.html
 *   JavaScript.html  → deploy/JavaScript.html
 */
const fs = require('fs');
const path = require('path');

const OUT = 'deploy';
if (!fs.existsSync(path.join(OUT, '.clasp.json'))) {
  throw new Error('Chưa có deploy/.clasp.json — chạy "clasp clone <scriptId>" trong thư mục deploy trước.');
}

const files = [
  ['Code.txt', 'Code.js'],
  ['index.txt', 'Index.html'],
  ['Stylesheet.html', 'Stylesheet.html'],
  ['JavaScript.html', 'JavaScript.html']
];
files.forEach(function(f){
  fs.copyFileSync(f[0], path.join(OUT, f[1]));
  console.log('✓ ' + f[0] + ' → ' + OUT + '/' + f[1]);
});

// Index.html phải là bản template (có thẻ include), không phải preview.html
const idx = fs.readFileSync(path.join(OUT, 'Index.html'), 'utf8');
if (idx.indexOf("createHtmlOutputFromFile('JavaScript')") === -1 || idx.indexOf('MOCK BACKEND') !== -1) {
  throw new Error('Index.html không đúng bản template — kiểm tra lại index.txt');
}

// Chỉ giữ đúng các file trên + appsscript.json
const keep = files.map(function(f){ return f[1]; }).concat(['appsscript.json', '.clasp.json']);
fs.readdirSync(OUT).forEach(function(name){
  if (keep.indexOf(name) === -1 && fs.statSync(path.join(OUT, name)).isFile()) {
    fs.unlinkSync(path.join(OUT, name));
    console.log('✗ đã bỏ ' + OUT + '/' + name + ' (không thuộc web app)');
  }
});
console.log('✅ Sẵn sàng: cd deploy && ..\\node_modules\\.bin\\clasp push');
