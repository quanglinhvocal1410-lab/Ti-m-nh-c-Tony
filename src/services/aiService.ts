import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface VoiceTestInput {
  student_info: {
    name: string;
    gender: "Nam" | "Nữ";
    age: number;
    experience: "Chưa học" | "Cơ bản" | "Biểu diễn";
  };
  voice_test: {
    lowest_note: string;
    highest_note: string;
    tessitura: string;
    timbre: "Sáng" | "Trung tính" | "Tối";
    thickness: "Mỏng" | "Trung bình" | "Dày";
    passaggio_note: string;
  };
  technical_score: {
    pitch: number;
    breath: number;
    tone: number;
    range: number;
  };
}

export interface VoiceTestOutput extends VoiceTestInput {
  system_output: {
    voice_type: string;
    total_score: number;
    rank: "A" | "B" | "C" | "D";
    issues: string[];
    recommendation: string;
    course_duration: string;
  };
}

export const aiService = {
  async evaluateVoiceTest(input: VoiceTestInput): Promise<VoiceTestOutput> {
    const prompt = `Bạn là giáo viên thanh nhạc chuyên nghiệp, có nhiệm vụ đánh giá học viên mới dựa trên dữ liệu test giọng.

Yêu cầu:
1. Phân tích dữ liệu đầu vào (Thông tin học viên, Kiểm tra giọng hát, Chấm điểm kỹ thuật).
2. Phân loại giọng (Voice type) theo hệ chuẩn:
   - Nam: Bass, Baritone, Tenor
   - Nữ: Alto, Mezzo-soprano, Soprano
3. Tính tổng điểm (Total score) từ 4 tiêu chí kỹ thuật (Pitch, Breath, Tone, Range).
4. Xếp hạng (Rank):
   - A: 32–40
   - B: 24–31
   - C: 16–23
   - D: <16
5. Phát hiện vấn đề hiện tại (Issues) về kỹ thuật thanh nhạc.
6. Đưa ra định hướng phát triển (Recommendation) và thời lượng khóa học (Course duration) đề xuất.

Quy tắc:
- Sử dụng thuật ngữ sư phạm tiếng Việt trong các phần giải thích.
- Không giải thích dài dòng.
- Không trả text ngoài JSON.
- Chỉ trả JSON đúng schema.

Dữ liệu đầu vào:
${JSON.stringify(input, null, 2)}
`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              student_info: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  gender: { type: Type.STRING },
                  age: { type: Type.NUMBER },
                  experience: { type: Type.STRING }
                }
              },
              voice_test: {
                type: Type.OBJECT,
                properties: {
                  lowest_note: { type: Type.STRING },
                  highest_note: { type: Type.STRING },
                  tessitura: { type: Type.STRING },
                  timbre: { type: Type.STRING },
                  thickness: { type: Type.STRING },
                  passaggio_note: { type: Type.STRING }
                }
              },
              technical_score: {
                type: Type.OBJECT,
                properties: {
                  pitch: { type: Type.NUMBER },
                  breath: { type: Type.NUMBER },
                  tone: { type: Type.NUMBER },
                  range: { type: Type.NUMBER }
                }
              },
              system_output: {
                type: Type.OBJECT,
                properties: {
                  voice_type: { type: Type.STRING },
                  total_score: { type: Type.NUMBER },
                  rank: { type: Type.STRING },
                  issues: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommendation: { type: Type.STRING },
                  course_duration: { type: Type.STRING }
                }
              }
            }
          }
        }
      });

      const jsonStr = response.text?.trim() || "{}";
      return JSON.parse(jsonStr) as VoiceTestOutput;
    } catch (error) {
      console.error("AI Evaluation Error:", error);
      throw new Error("Không thể đánh giá bằng AI lúc này. Vui lòng thử lại sau.");
    }
  }
};
