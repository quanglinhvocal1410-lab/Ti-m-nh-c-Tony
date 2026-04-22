import express from 'express';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);


const router = express.Router();

// Lấy danh sách nội dung từ thư mục antigravity_data
router.get('/sync-data', async (req, res) => {
  try {
    const dataDir = path.join(process.cwd(), 'antigravity_data');
    
    // Nếu thư mục chưa tồn tại
    if (!fs.existsSync(dataDir)) {
      return res.json({ status: 'success', data: '' });
    }

    const files = fs.readdirSync(dataDir);
    let combinedKnowledge = '';

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      // Chỉ đọc các file văn bản
      if (ext === '.txt' || ext === '.md' || ext === '.json' || ext === '.csv') {
        const filePath = path.join(dataDir, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
           try {
             const content = fs.readFileSync(filePath, 'utf-8');
             combinedKnowledge += `\n\n--- Dữ liệu từ file: ${file} ---\n${content}`;
           } catch (err) {
             console.error(`Không thể đọc file ${file}:`, err);
           }
        }
      }
    }

    res.json({ status: 'success', data: combinedKnowledge });
  } catch (error: any) {
    console.error('Lỗi khi đọc knowledge base:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Xử lý bóc tách PDF hoặc Video thông qua Skill Seekers Python CLI
router.post('/process', async (req, res) => {
  const { type, url, filePath, name } = req.body;
  
  if (!name) {
    return res.status(400).json({ status: 'error', error: 'Thiếu tên (name)' });
  }

  const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dataDir = path.join(process.cwd(), 'antigravity_data');
  const outputDir = path.join(process.cwd(), 'output', safeName);

  try {
    let command = '';
    
    if (type === 'youtube') {
      if (!url) return res.status(400).json({ status: 'error', error: 'Thiếu URL Youtube' });
      command = `python -m skill_seekers video --url "${url}" --name "${safeName}" --agent kimi`;
      // Nếu API key chưa có, Kimi (or default agent) có thế báo lỗi. Chúng ta sẽ capture stdout.
    } else if (type === 'pdf') {
      if (!filePath) return res.status(400).json({ status: 'error', error: 'Thiếu đường dẫn file PDF' });
      const absPath = path.resolve(filePath);
      command = `python -m skill_seekers pdf --pdf "${absPath}" --name "${safeName}" --agent kimi`;
    } else {
      return res.status(400).json({ status: 'error', error: 'Loại không hợp lệ' });
    }

    console.log("Đang chạy lệnh bóc tách nội dung:", command);
    
    // Thực thi Python CLI 
    const { stdout, stderr } = await execPromise(command, { cwd: process.cwd() });
    
    console.log("Xử lý thành công:", stdout);

    // Di chuyển file SKILL.md tạo ra vào thu muc antigravity_data
    const generatedSkillPath = path.join(process.cwd(), 'output', `${safeName}-markdown`, 'SKILL.md');
    const directSkillPath = path.join(outputDir, 'SKILL.md');
    
    let finalPath = '';
    if (fs.existsSync(generatedSkillPath)) finalPath = generatedSkillPath;
    else if (fs.existsSync(directSkillPath)) finalPath = directSkillPath;

    if (finalPath) {
       if (!fs.existsSync(dataDir)) {
           fs.mkdirSync(dataDir, { recursive: true });
       }
       const destination = path.join(dataDir, `${safeName}_extracted.md`);
       fs.copyFileSync(finalPath, destination);
       
       return res.json({ 
         status: 'success', 
         message: 'Bóc tách thành công!',
         file: `${safeName}_extracted.md`
       });
    } else {
      // Có thể chạy offline output ko phải là SKILL.md mà chỉ là transcript.txt
       return res.json({ 
         status: 'success', 
         message: 'Chạy Python thành công nhưng không tìm thấy file SKILL.md output. Dữ liệu có thể chưa trích xuất đủ.',
         logs: stdout
       });
    }

  } catch (err: any) {
    console.error("Lỗi quá trình process PDF/Video:", err.message);
    res.status(500).json({ status: 'error', error: err.message, stderr: err.stderr });
  }
});

export default router;
