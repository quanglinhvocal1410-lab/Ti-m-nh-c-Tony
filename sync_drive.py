import os
import io
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

# CẤU HÌNH HỆ THỐNG
# Quyền truy cập: readonly (chỉ đọc)
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
# ID Thư mục trên Google Drive (Lấy từ URL của thư mục)
FOLDER_ID = '1UOiz_5pSpTYmfAlV-tUvIn8pjdjxU005'
# Thư mục cục bộ để lưu trữ dữ liệu đồng bộ
LOCAL_SYNC_PATH = './antigravity_data' 

def get_service():
    """Thiết lập và trả về dịch vụ Google Drive API service."""
    creds = None
    # Tệp token.json lưu trữ thông tin xác thực của người dùng sau khi đăng nhập lần đầu
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    # Nếu không có thông tin xác thực hợp lệ, hãy cho người dùng đăng nhập.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists('credentials.json'):
                print("Lỗi: Không tìm thấy tệp 'credentials.json'. Vui lòng tải từ Google Cloud Console.")
                return None
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        
        # Lưu thông tin xác thực cho lần chạy sau
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
            
    return build('drive', 'v3', credentials=creds)

def sync_data():
    """Tải các tệp từ thư mục Drive về thư mục local."""
    service = get_service()
    if not service:
        return

    if not os.path.exists(LOCAL_SYNC_PATH):
        os.makedirs(LOCAL_SYNC_PATH)
        print(f"Đã tạo thư mục cục bộ: {LOCAL_SYNC_PATH}")

    # Truy vấn danh sách tệp trong thư mục chỉ định (không lấy các tệp trong thùng rác)
    query = f"'{FOLDER_ID}' in parents and trashed = false"
    results = service.files().list(q=query, fields="files(id, name, mimeType)").execute()
    items = results.get('files', [])

    if not items:
        print("Không tìm thấy dữ liệu hoặc thư mục trống.")
        return

    print(f"Tìm thấy {len(items)} tệp. Bắt đầu kiểm tra đồng bộ...")

    for item in items:
        file_id = item['id']
        file_name = item['name']
        mime_type = item['mimeType']
        file_path = os.path.join(LOCAL_SYNC_PATH, file_name)

        # Bỏ qua nếu là thư mục con (Script này hiện chỉ hỗ trợ tệp phẳng)
        if mime_type == 'application/vnd.google-apps.folder':
            print(f"Bỏ qua thư mục con: {file_name}")
            continue

        # Kiểm tra nếu tệp chưa tồn tại thì tải về
        if not os.path.exists(file_path):
            print(f"Đang đồng bộ tệp: {file_name}...")
            try:
                # Xử lý các loại tệp Google Docs (cần export thay vì download trực tiếp)
                if 'application/vnd.google-apps' in mime_type:
                    # Ví dụ: Export Google Docs sang PDF hoặc Word (Tùy chọn)
                    # Ở đây tạm thời bỏ qua hoặc bạn có thể cấu hình thêm export_media
                    print(f"Bỏ qua tệp định dạng Google Docs: {file_name} (Cần export media)")
                    continue
                
                request = service.files().get_media(fileId=file_id)
                fh = io.FileIO(file_path, 'wb')
                downloader = MediaIoBaseDownload(fh, request)
                done = False
                while done is False:
                    status, done = downloader.next_chunk()
                    if status:
                        print(f"Đang tải {int(status.progress() * 100)}%...", end='\r')
                print(f"Hoàn tất: {file_name}           ")
            except Exception as e:
                print(f"Lỗi khi tải {file_name}: {e}")
        else:
            # Tùy chọn: Bạn có thể thêm kiểm tra MD5/Ngày sửa đổi để cập nhật tệp cũ
            pass

if __name__ == '__main__':
    sync_data()
