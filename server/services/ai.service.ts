import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDOmuz211xy4VcYQdru4cZOZDQ0YMpKO7Q";
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

function safeJSONParse(text: string) {
  try {
    // Attempt to extract JSON if it's wrapped in markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\}|\[[\s\S]*\])\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1].trim());
    }
    // Attempt to match raw curly braces as fallback
    const rawMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (rawMatch && rawMatch[1]) {
        return JSON.parse(rawMatch[1].trim());
    }
    return JSON.parse(text);
  } catch (e: any) {
    console.error("Failed to parse JSON from AI response:", e.message);
    return { raw: text };
  }
}

async function callGemini(prompt: string, model: string = 'gemini-1.5-flash'): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Thiếu GEMINI_API_KEY trong file .env');
  }

  let retries = 3;
  let delay = 1500; // 1.5s initial delay

  while (retries > 0) {
    try {
      const response = await axios.post(
        `${BASE_URL}/${model}:generateContent`,
        {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY
          }
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error: any) {
      const isHighDemand = error.response?.data?.error?.message?.includes('high demand') || 
                           error.response?.status === 503 || 
                           error.response?.status === 429;
                           
      if (isHighDemand && retries > 1) {
        console.warn(`AI High Demand (model ${model}). Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries--;
        delay *= 2; // Exponential backoff
        continue;
      }
      
      console.error('AI Error:', error.response?.data || error.message);
      throw new Error('Lỗi gọi AI: ' + (error.response?.data?.error?.message || error.message));
    }
  }
  
  throw new Error('Lỗi gọi AI: Vượt quá số lần thử lại');
}

export const aiService = {
  async analyzeYouTubePlan(youtubeLink: string, studentName: string = 'Học viên') {
    const prompt = `Bạn là một chuyên gia huấn luyện thanh nhạc. Học viên "${studentName}" cung cấp link bài hát hoặc tên bài sau để luyện tập hôm nay:
Link/Tên bài: ${youtubeLink}

Dựa vào Link/Tên bài trên hãy trích xuất Tên Bài Hát và Ca Sĩ (nếu phân tích được từ link youtube hoặc text), nếu không thì để "Không xác định".
Sau đó thiết kế 1 giáo án thanh nhạc 60 phút gồm 3 phần chính. 
Trả về chuẩn JSON sau:
{
  "ten_bai_hat": "Tên bài - Ca sĩ",
  "ke_hoach": [
    {
      "thoi_gian": 15,
      "tieu_de": "Khởi động",
      "mo_ta": "Mô tả chi tiết bài tập khởi động phù hợp với bài hát..."
    },
    {
      "thoi_gian": 30,
      "tieu_de": "Thực hành Kỹ thuật",
      "mo_ta": "Những kỹ thuật khó trong bài, vị trí âm thanh..."
    },
    {
      "thoi_gian": 15,
      "tieu_de": "Biểu cảm Sắc thái",
      "mo_ta": "Gợi ý về cảm xúc, nhịp điệu, cách ngắt nghỉ..."
    }
  ]
}`;
    const result = await callGemini(prompt, 'gemini-1.5-flash');
    return safeJSONParse(result);
  },

  async analyzeYoutube(youtube_url: string, student_level: string) {
    const prompt = `Bạn là giáo viên thanh nhạc chuyên nghiệp.

Phân tích bài hát từ link:
${youtube_url}

Trình độ học viên: ${student_level}

Yêu cầu:

1. Kỹ thuật thanh nhạc cần dùng
2. Độ khó bài hát
3. Thiết kế buổi học 60 phút:
   - 15 phút luyện thanh (bài tập + mục tiêu)
   - 45 phút tập bài (chia đoạn + kỹ thuật)

4. Chuẩn đầu ra:
- Học viên đạt được gì

5. Bài tập về nhà:
- Nội dung
- Thời gian

Chỉ trả JSON:
{
  "ky_thuat": [],
  "do_kho": "",
  "lesson_plan": {
    "luyen_thanh": "",
    "tap_bai": ""
  },
  "muc_tieu": "",
  "bai_tap_ve_nha": ""
}`;
    const result = await callGemini(prompt, 'gemini-1.5-flash');
    return safeJSONParse(result);
  },


  async analyzeSong(songName: string, singer: string) {
    const prompt = `Phân tích bài hát "${songName}" của ${singer} dưới góc độ giáo viên thanh nhạc.
Hãy trả về ĐÚNG định dạng JSON sau, không kèm bất kỳ giải thích text nào khác:
{
  "ky_thuat": ["string", "string"],
  "do_kho": "string",
  "quang_giong": "string",
  "khoi_dong": ["string"],
  "muc_tieu": "string",
  "tieu_chi": ["string"],
  "bai_tap_ve_nha": "string"
}`;

    const result = await callGemini(prompt);
    return safeJSONParse(result);
  },

  async generateSessionPlan(songAnalysis: any, studentLevel: string) {
    const prompt = `Dựa trên dữ liệu bài hát:
${JSON.stringify(songAnalysis)}
Trình độ học viên hiện tại: ${studentLevel}

Tạo giáo án buổi học (thời lượng 60 phút). Hãy trả về ĐÚNG định dạng JSON sau, không kèm text thừa:
{
  "luyen_thanh": "string",
  "luyen_bai": "string",
  "ky_thuat_trong_tam": "string",
  "muc_tieu": "string"
}`;

    const result = await callGemini(prompt);
    return safeJSONParse(result);
  },

  async analyzeAudio(noteText: string) {
    const prompt = `Dựa trên mô tả hoặc ghi chú của giáo viên về giọng hát của học viên sau:
"${noteText}"

Hãy đánh giá và gửi lại JSON sau:
{
  "cao_do": 0-10,
  "nhip": 0-10,
  "hoi": 0-10,
  "bieu_cam": 0-10,
  "nhan_xet": "string",
  "loi_chinh": "string",
  "cai_thien": "string"
}`;

    const result = await callGemini(prompt);
    return safeJSONParse(result);
  },

  async suggestNextSession(currentResult: any) {
    const prompt = `Dựa trên kết quả học tập của học viên:
${JSON.stringify(currentResult)}

Đề xuất cho buổi học tiếp theo. Trả về JSON:
{
  "on_tap": "string",
  "ky_thuat": "string",
  "bai_hat_goi_y": "string"
}`;

    const result = await callGemini(prompt);
    return safeJSONParse(result);
  },

  async evaluateLesson(payload: any) {
    // Payload from LessonHistoryTab (scores, realtime_feedbacks, song_notes)
    const prompt = `Bạn là một chuyên gia thanh nhạc. Dưới đây là thông tin chấm điểm và chẩn đoán của một học viên trong buổi học hôm nay:
    
- Thống kê điểm: ${JSON.stringify(payload.scores)} (Thang điểm 5)
- Xếp loại hệ thống: ${payload.classification} (Trung bình: ${payload.average})
- Nhận xét chi tiết (Realtime Feedback đã thu thập): ${JSON.stringify(payload.realtime_feedbacks)}
- Bài hát luyện tập: ${payload.song_notes}

Nhiệm vụ: Tổng hợp thành một Bản Nhận Xét Đầy Đủ và Giao Bài Tập dựa trên các vấn đề trên. 
Bạn PHẢI trả lời BẰNG ĐÚNG định dạng JSON sau (không kèm text nào khác ngoài JSON):
{
  "feedback": {
    "diem_manh": "string (Tóm tắt điểm tốt, khen ngợi học viên)",
    "diem_yeu": "string (Tóm tắt những lỗi cần khắc phục từ feedback)",
    "ghi_chu": "string (Ghi chú chuyên sâu về thanh nhạc/kỹ thuật)"
  },
  "homework": {
    "luyen_thanh": "string (Tên các bài tập nhạc lý/thanh nhạc để khắc phục điểm yếu)",
    "bai_hat": "string (Bài hát đã luyện hoặc bài mới nếu làm tốt)",
    "thoi_gian": "number (Tổng số phút luyện tập mỗi ngày, ví dụ 20)"
  },
  "next_session": {
    "trong_tam": "string (Trọng tâm buổi tới)",
    "ky_thuat": "string (Kỹ thuật cần đi sâu buổi tới)",
    "muc_tieu": "string (Mục tiêu buổi tới)"
  }
}
`;
    const result = await callGemini(prompt);
    return safeJSONParse(result);
  }
};
