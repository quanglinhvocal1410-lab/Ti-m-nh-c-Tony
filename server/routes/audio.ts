import express from 'express';
import multer from 'multer';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

async function getDriveService() {
  // Yêu cầu phải có biến môi trường cấu hình Google Service Account
  // Hoặc file credentials.json
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/drive.file'],
    // Bạn nên đặt biến môi trường GOOGLE_APPLICATION_CREDENTIALS trỏ tới file json
    // Hoặc truyền keyFile: 'path/to/my/key.json'
  });
  return google.drive({ version: 'v3', auth });
}

async function getOrCreateFolder(drive: any, folderName: string) {
  const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
  
  const response = await drive.files.list({
    q: query,
    spaces: 'drive',
    fields: 'files(id, name)',
  });

  if (response.data.files.length > 0) {
    return response.data.files[0].id; // Folder exists
  }

  // Create folder
  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  const folder = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id',
  });

  return folder.data.id;
}

router.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { studentName } = req.body;
    const timeStamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${studentName || 'Student'} - Ghi âm ${timeStamp}${path.extname(req.file.originalname) || '.mp3'}`;

    let drive;
    try {
      drive = await getDriveService();
    } catch (e: any) {
      console.warn("Chưa cấu hình Google Drive Auth hợp lệ. Chuyển sang lưu tạm local.", e.message);
      // Fallback cho local development nếu chưa có key json
      return res.json({ 
        status: 'success', 
        fileUrl: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`,
        message: 'Lưu local (Chưa cấu hình Google Credentials)'
      });
    }

    // Lấy hoặc tạo thư mục "File ghi âm tại nhà"
    const folderId = await getOrCreateFolder(drive, 'File ghi âm tại nhà');

    // Upload file
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };

    const uploadedFile = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
    });

    // Share link công khai để có thể nghe lại
    await drive.permissions.create({
      fileId: uploadedFile.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const fileUrl = uploadedFile.data.webViewLink;

    // Clean up local temp file
    fs.unlinkSync(req.file.path);

    res.json({ status: 'success', fileUrl, fileId: uploadedFile.data.id });
  } catch (error: any) {
    console.error('Lỗi khi upload lên Drive:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

export default router;
