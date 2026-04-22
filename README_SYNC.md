# Hướng dẫn đồng bộ dữ liệu từ Google Drive

Một tệp script Python đã được tạo để tự động tải các tệp từ thư mục Google Drive về máy tính cá nhân.

## 📋 Yêu cầu cần thiết

1. **Python**: Đảm bảo máy tính đã cài đặt Python 3.
2. **Cài đặt thư viện**:
   ```bash
   pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib
   ```
3. **credentials.json**: Bạn cần có tệp này ở thư mục gốc (Nếu bạn đã có, hãy bỏ qua bước này).

## 🚀 Cách chạy

Chạy lệnh sau trong terminal:
```bash
python sync_drive.py
```

## 🔍 Lưu ý quan trọng
- Lần đầu chạy, trình duyệt sẽ mở để yêu cầu bạn đăng nhập và cấp quyền truy cập **Read-Only** vào Drive.
- Sau khi đăng nhập thành công, tệp `token.json` sẽ được tạo để ghi nhớ phiên làm việc (bạn không cần đăng nhập lại các lần sau).
- Dữ liệu sẽ được tải về thư mục: `antigravity_data/`.
- Script hiện tại sẽ **chỉ tải các tệp** có trong thư mục (không tải thư mục con) và sẽ bỏ qua các tệp định dạng Google Docs/Sheets (cần export thay vì download).

## ⚙️ Cấu hình
Bạn có thể thay đổi `FOLDER_ID` và `LOCAL_SYNC_PATH` ngay trong tệp `sync_drive.py` nếu muốn trỏ tới thư mục khác.
