import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Music, ChevronDown, PlayCircle, PauseCircle, Mic, MessageSquare, Video, ExternalLink, Trash2, StopCircle, CheckCircle2, Mic2, Wind, Activity, Clock, Star, ChevronRight, Info, Sparkles } from 'lucide-react';
import { studentService } from '../services/studentService';
import { lessonService, Lesson, EvaluationCriterion } from '../services/lessonService';
import { VOCAL_EVALUATION_CRITERIA } from '../utils/evaluationConstants';
import TeacherNoteModal from './TeacherNoteModal';

interface LessonDetailScreenProps {
  onNavigate: (screen: string, id?: string) => void;
  studentId?: string | null;
}

export default function LessonDetailScreen({ onNavigate, studentId }: LessonDetailScreenProps) {
  const [activeTab, setActiveTab] = useState('itinerary');
  const [openAccordions, setOpenAccordions] = useState<Record<number, boolean>>({});
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'recorded'>('idle');
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [currentEditIndex, setCurrentEditIndex] = useState<number>(-1);
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const [studentName, setStudentName] = useState('Học viên');
  const [studentInfo, setStudentInfo] = useState<any>(null);
  
  const [youtubeLink, setYoutubeLink] = useState('');
  const [songName, setSongName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<any[]>([]);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [rawAiPlanText, setRawAiPlanText] = useState('');
  const [aiStructuredData, setAiStructuredData] = useState<any>(null);
  const [knowledgeBase, setKnowledgeBase] = useState('');
  
  // States for Skill Seekers
  const [extractUrl, setExtractUrl] = useState('');
  const [extractName, setExtractName] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  // Evaluation States
  const [scores, setScores] = useState<Record<string, number>>({});
  const [realtimeFeedbacks, setRealtimeFeedbacks] = useState<string[]>([]);

  const computeScore = (currentScores: Record<string, number>) => {
    const values = Object.values(currentScores);
    if (values.length === 0) return { avg: 0, xl: 'Chưa đánh giá' };
    const avg = values.reduce((acc, curr) => acc + curr, 0) / values.length;
    let xl = 'Yếu';
    if (avg >= 4.5) xl = 'Rất tốt';
    else if (avg >= 3.5) xl = 'Tốt';
    else if (avg >= 2.5) xl = 'Trung bình';
    return { avg: parseFloat(avg.toFixed(2)), xl };
  };

  const handleScoreChange = (key: string, value: number, feedbackItem?: {phat_hien: string, goi_y: string}) => {
    setScores(prev => ({ ...prev, [key]: value }));
    if (feedbackItem) {
      let label = '';
      VOCAL_EVALUATION_CRITERIA.luyen_thanh.forEach(c => { if(c.key === key) label = c.label; });
      VOCAL_EVALUATION_CRITERIA.hat_bai.forEach(c => { if(c.key === key) label = c.label; });
      
      const newFb = `${label}: ${feedbackItem.phat_hien} -> Gợi ý: ${feedbackItem.goi_y}`;
      setRealtimeFeedbacks(prev => {
        const filtered = prev.filter(f => !f.startsWith(label));
        return [newFb, ...filtered];
      });
    }
  };

  // Helper to render text with clickable links
  const renderTextWithLinks = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s\)]+)/g;
    const parts = text.split(urlRegex);
    return (
      <>
        {parts.map((part, i) => {
          if (part.match(urlRegex)) {
            return (
              <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline" onClick={e => e.stopPropagation()}>
                [Link Video]
              </a>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </>
    );
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [lessonDate, setLessonDate] = useState(new Date().toISOString().split('T')[0]);
  const [lessonNumber, setLessonNumber] = useState<number | ''>(''); 
  const [totalLessons, setTotalLessons] = useState<number | ''>(''); 
  const [remainingLessons, setRemainingLessons] = useState<number | ''>(''); 
  const [startDate, setStartDate] = useState(''); 
  const [endDate, setEndDate] = useState(''); 

  useEffect(() => {
    const fetchStudentAndLessons = async () => {
      if (!studentId) return;
      try {
        const student = await studentService.getStudentById(studentId);
        if (student) {
          setStudentName(student.name);
          setStudentInfo(student);
          if (student.startDate) {
             let formattedStart = student.startDate;
             if (formattedStart.includes('/')) {
                const parts = formattedStart.split('/');
                if (parts.length === 3) formattedStart = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
             }
             setStartDate(formattedStart);
          }
        }
        const lessons = await lessonService.getLessonsByStudent(studentId);
        setLessonNumber(lessons.length + 1);
        
        // Auto calculate remaining if course is something like "Basic 12 buổi"
        if (student && student.course) {
           const match = student.course.match(/(\d+)/);
           if (match) {
             const total = parseInt(match[1]);
             setTotalLessons(total);
             setRemainingLessons(Math.max(0, total - (lessons.length + 1)));
           }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchStudentAndLessons();
  }, [studentId]);

  useEffect(() => {
    const fetchKnowledge = async () => {
      try {
        const res = await fetch('http://localhost:3005/api/knowledge/sync-data');
        if (res.ok) {
          const data = await res.json();
          if (data.data) {
             setKnowledgeBase(data.data);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải knowledge base:", err);
      }
    };
    fetchKnowledge();
  }, []);

  // Auto-calculate remaining lessons when total or current lesson number changes
  useEffect(() => {
    if (typeof totalLessons === 'number' && typeof lessonNumber === 'number') {
      setRemainingLessons(Math.max(0, totalLessons - lessonNumber));
    }
  }, [totalLessons, lessonNumber]);

  // Auto-calculate expected end date (+30 days from start date)
  useEffect(() => {
    if (startDate) {
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) {
        const end = new Date(start);
        end.setDate(start.getDate() + 30);
        setEndDate(end.toISOString().split('T')[0]);
      }
    }
  }, [startDate]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => setIsPlaying(false);
      audio.addEventListener('ended', handleEnded);
      return () => audio.removeEventListener('ended', handleEnded);
    }
  }, [audioURL]);

  const handleExtractKnowledge = async () => {
    if (!extractName) {
      alert("Vui lòng nhập Tên tài liệu ngắn gọn (vd: luyen_hinh_khoi)");
      return;
    }
    if (!extractUrl) {
      alert("Vui lòng nhập Link YouTube hoặc đường dẫn File PDF trên máy");
      return;
    }
    
    setIsExtracting(true);
    try {
      const type = extractUrl.toLowerCase().endsWith('.pdf') ? 'pdf' : 'youtube';
      const payload = {
        type,
        name: extractName,
        [type === 'pdf' ? 'filePath' : 'url']: extractUrl
      };

      const res = await fetch('http://localhost:3005/api/knowledge/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.status === 'success') {
         alert("Trích xuất tài liệu thành công! Bạn có thể bắt đầu Phân tích AI.");
         // Tự động load lại knowledge base
         const kbRes = await fetch('http://localhost:3005/api/knowledge/sync-data');
         if (kbRes.ok) {
           const kbData = await kbRes.json();
           setKnowledgeBase(kbData.data || '');
         }
      } else {
         alert("Lỗi trích xuất: " + data.error);
         console.error(data);
      }
    } catch (err) {
       console.error("Lỗi khi kết nối đến API:", err);
       alert("Lỗi khi kết nối đến Server bóc tách.");
    } finally {
       setIsExtracting(false);
    }
  };

  const analyzeYouTube = async () => {
    if (!youtubeLink) return;
    setIsAnalyzing(true);
    setRawAiPlanText('');
    setAiResponse(null);
    setLessonPlan([]);
    setAiStructuredData(null);
    
    try {
      let songTitleContext = '';
      if (youtubeLink.includes('youtube.com') || youtubeLink.includes('youtu.be')) {
         try {
            const oembedRes = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(youtubeLink)}`);
            if (oembedRes.ok) {
               const oembedData = await oembedRes.json();
               if (oembedData && oembedData.title) {
                 songTitleContext = `\\nTên bài hát trên YouTube: "${oembedData.title}"`;
                 setSongName(oembedData.title);
               }
            }
         } catch (e) {
            console.log("Could not fetch YouTube title via noembed", e);
         }
      }

      const GEMINI_API_KEY_SONG = 'AIzaSyDlDhI7qvXuPkZjpHjhO-Ju_XvJsmtneCw';
      const prompt = `Role: Professional vocal coach and music educator.
Objective: Analyze a user-provided song's vocal techniques and design a personalized lesson plan.
Constraints: Analyze the song's tessitura, difficult intervals, vocal placement, transpose suggestions, and required techniques. Explain their importance. Provide 3 specific vocalises with duration and purpose. Structure the lesson into Warm-up (15 min), Song Technique Analysis (30 min), and Emotional Expression (15 min). Create self-study assignments.

TÀI LIỆU CƠ SỞ (KNOWLEDGE BASE) TỪ GIÁO VIÊN:
"""
${knowledgeBase || "Không có tài liệu nào."}
"""

Yêu cầu BẮT BUỘC: 
- Bạn HÃY ƯU TIÊN tìm và chọn các bài tập khởi động (warmups), bài tập kỹ thuật (vocalises) hoặc bài tập về nhà (homework) từ [TÀI LIỆU CƠ SỞ] ở trên.
- NẾU trong TÀI LIỆU CƠ SỞ có kèm theo đường dẫn URL (như https://youtube.com/...), bạn BẮT BUỘC phải đính kèm nguyên vẹn đường Link URL đó vào sau tên bài tập hoặc trong phần mô tả! Vui lòng hiển thị rõ link nguyên bản dạng https://... để hệ thống nhận diện.

Link / Tên bài hát cần phân tích: ${youtubeLink} ${songTitleContext}

You MUST return the output EXACTLY matching this JSON schema:
{
  "songData": {
    "title": "Chinh phục ca khúc [Tên bài hát] - [Tên ca sĩ]",
    "transpose": "Gợi ý Tone nhạc (Transpose) phù hợp cho học viên (VD: +2, -1, giữ nguyên)",
    "artist_style": "Phong cách hát - Đặc điểm biểu diễn (VD: Học theo phong cách ...)",
    "ghi_chu": "Ghi chú huấn luyện sâu sắc, truyền cảm hứng",
    "am_vuc": "Phân tích âm vực (Tessitura), khoảng giọng",
    "ky_thuat_kho": ["Kỹ thuật khó 1", "Kỹ thuật khó 2"],
    "warmups": [
      { "title": "Tên bài tập khởi động", "desc": "Cách thực hiện chi tiết" }
    ],
    "techniques": [
      { "name": "Tên kỹ thuật (VD: Legato, Mixed Voice)", "details": ["Lưu ý chi tiết 1", "Lưu ý chi tiết 2"] }
    ],
    "homeItinerary": [
      { "time": "0 - 5 phút", "title": "Khởi động", "desc": "Luyện hơi và bài tập cơ bản." }
    ],
    "dailyChecklist": [
      "Tập rung môi Lip Trill (5 phút)",
      "Luyện kỹ thuật (15 phút)"
    ],
    "lessonPlan": [
      {
        "time": "15 PHÚT",
        "title": "Khởi động & Giải phóng",
        "tasks": ["Nhiệm vụ 1", "Nhiệm vụ 2", "Nhiệm vụ 3", "Nhiệm vụ 4"]
      },
      {
        "time": "30 PHÚT",
        "title": "Phân tích Kỹ thuật",
        "tasks": ["Nhiệm vụ 1", "Nhiệm vụ 2", "Nhiệm vụ 3", "Nhiệm vụ 4"]
      },
      {
        "time": "15 PHÚT",
        "title": "Cảm xúc & Biểu diễn",
        "tasks": ["Nhiệm vụ 1", "Nhiệm vụ 2", "Nhiệm vụ 3", "Nhiệm vụ 4"]
      }
    ],
    "vocalises": [
      { "title": "Tên vocalise 1", "desc": "Mô tả / Mục đích vocalise 1", "instruction": "Hướng dẫn thực hiện trực tiếp và cụ thể từng bước", "level": "Dễ" },
      { "title": "Tên vocalise 2", "desc": "Mô tả / Mục đích vocalise 2", "instruction": "Hướng dẫn thực hiện trực tiếp và cụ thể từng bước", "level": "Trung Bình" },
      { "title": "Tên vocalise 3", "desc": "Mô tả / Mục đích vocalise 3", "instruction": "Hướng dẫn thực hiện trực tiếp và cụ thể từng bước", "level": "Khó" }
    ],
    "homework": [
      "Bài tập về nhà 1",
      "Bài tập về nhà 2"
    ]
  }
}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY_SONG}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });

      const resData = await res.json();
      const generatedText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (generatedText) {
        try {
          const parsedData = JSON.parse(generatedText);
          setAiStructuredData(parsedData);
        } catch (e) {
          console.error("Failed to parse JSON response:", e);
          setRawAiPlanText(generatedText);
        }
      } else {
        alert("Lỗi phân tích AI: " + (resData.error?.message || "Không nhận được kết quả."));
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi kết nối đến AI!");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setRecordingState('recorded');
        
        // Auto-save to database via backend when stopped
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');
          formData.append('studentName', studentName);
          
          await fetch('http://localhost:3005/api/audio/upload', {
            method: 'POST',
            body: formData,
          });
        } catch (err) {
          console.error("Lỗi khi lưu tự động ghi âm:", err);
        }
      };

      mediaRecorder.start();
      setRecordingState('recording');
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setRecordingState('idle');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const deleteRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL(null);
    setRecordingState('idle');
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleCompleteLesson = async () => {
    if (!studentId) {
      alert("Không tìm thấy thông tin học viên.");
      return;
    }
    
    // Attempt to save to system
    try {
      setIsCompleted(true);
      const finalSongName = aiStructuredData?.songData?.title || songName || "Chưa có tên bài hát";
      const transposeText = aiStructuredData?.songData?.transpose ? `Tone nhạc (Transpose): ${aiStructuredData.songData.transpose}` : '';
      
      const newLesson: Omit<Lesson, '_id'> = {
        studentId,
        date: lessonDate,
        so_buoi: lessonNumber !== '' ? Number(lessonNumber) : undefined,
        youtubeLink,
        bai_hat_luyen: finalSongName,
        songNotes: transposeText,
        
        evaluations: (() => {
          const evalsArray: EvaluationCriterion[] = Object.entries(scores).map(([k, v]) => {
            let label = k;
            VOCAL_EVALUATION_CRITERIA.luyen_thanh.forEach(c => { if(c.key === k) label = c.label; });
            VOCAL_EVALUATION_CRITERIA.hat_bai.forEach(c => { if(c.key === k) label = c.label; });
            return { tieu_chi: label, gia_tri: v as number };
          });
          return JSON.stringify(evalsArray);
        })(),
        diem_trung_binh: computeScore(scores).avg,
        xep_loai: computeScore(scores).xl,
        
        // Mapping AI data to Lesson History fields
        bai_tap_luyen_thanh: aiStructuredData?.songData?.homework?.join('\n') || '',
        thoi_gian_luyen_hang_ngay: aiStructuredData?.songData?.dailyChecklist?.join('\n') || '20-30 phút/ngày',
        ghi_chu_ky_thuat: `Âm vực: ${aiStructuredData?.songData?.am_vuc || '---'}\nKỹ thuật khó: ${aiStructuredData?.songData?.ky_thuat_kho?.join(', ') || '---'}\n\nGhi chú AI: ${aiStructuredData?.songData?.ghi_chu || ''}`,
        
        // Default plan for next session
        trong_tam: "Hoàn thiện bài hát: " + finalSongName,
        muc_tieu: "Xử lý cảm xúc và sắc thái",
        
        teacherNotes: "Ghi chú huấn luyện từ AI: " + (aiStructuredData?.songData?.ghi_chu || "")
      };
      
      await lessonService.createLesson(newLesson);
      alert("Đã hoàn thành buổi học và lưu thành công vào Lịch sử học viên!");
      onNavigate('student', studentId);
    } catch (e) {
      console.error(e);
      alert("Đã xảy ra lỗi khi lưu vào Lịch sử buổi học.");
      setIsCompleted(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFF6FF] text-slate-900 font-serif pb-10">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 bg-[#EFF6FF]">
        <button onClick={() => onNavigate('student', studentId || undefined)} className="bg-[#3A5A42]/10 hover:bg-[#3A5A42]/20 text-[#3A5A42] px-4 py-2 rounded-lg flex items-center gap-2 mb-6 text-sm backdrop-blur-sm border border-[#3A5A42]/20 transition-all font-sans font-semibold">
          <ArrowLeft size={16} />
          Quay lại hồ sơ học viên
        </button>
        
        <div className="mb-6 bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-[#3A5A42]/10 shadow-sm max-w-4xl">
          <h1 className="text-3xl font-bold mb-4 leading-tight text-[#3A5A42]">{songName ? songName : 'Bài học mới...'}</h1>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 font-sans text-sm">
            <div className="col-span-2 lg:col-span-1">
              <label className="block text-[#3A5A42]/80 font-bold mb-1 text-xs uppercase tracking-wider">Ngày học</label>
              <input 
                type="date" 
                className="w-full bg-white border border-[#3A5A42]/20 px-3 py-2 rounded-lg text-[#3A5A42] font-semibold focus:outline-none focus:ring-2 focus:ring-[#3A5A42]"
                value={lessonDate}
                onChange={(e) => setLessonDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[#3A5A42]/80 font-bold mb-1 text-xs uppercase tracking-wider">Buổi / Tổng số</label>
              <div className="flex items-center gap-1 bg-white border border-[#3A5A42]/20 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#3A5A42]">
                <input 
                  type="number" 
                  className="w-1/2 bg-transparent px-3 py-2 text-[#3A5A42] font-bold text-center focus:outline-none"
                  value={lessonNumber}
                  onChange={(e) => setLessonNumber(Number(e.target.value) || '')}
                  placeholder="Thứ..."
                />
                <span className="text-slate-300 font-bold">/</span>
                <input 
                  type="number" 
                  className="w-1/2 bg-transparent px-3 py-2 text-[#3A5A42] font-bold text-center focus:outline-none"
                  value={totalLessons}
                  onChange={(e) => setTotalLessons(Number(e.target.value) || '')}
                  placeholder="Tổng..."
                />
              </div>
            </div>
            <div>
              <label className="block text-[#3A5A42]/80 font-bold mb-1 text-xs uppercase tracking-wider">Còn lại</label>
              <input 
                type="number" 
                className="w-full bg-white border border-[#3A5A42]/20 px-3 py-2 rounded-lg text-[#3A5A42] font-bold focus:outline-none focus:ring-2 focus:ring-[#3A5A42]"
                value={remainingLessons}
                onChange={(e) => setRemainingLessons(Number(e.target.value) || '')}
                placeholder="Số buổi..."
              />
            </div>
            <div>
              <label className="block text-[#3A5A42]/80 font-bold mb-1 text-xs uppercase tracking-wider">Ngày bắt đầu</label>
              <input 
                type="date" 
                className="w-full bg-white border border-[#3A5A42]/20 px-3 py-2 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#3A5A42]"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[#3A5A42]/80 font-bold mb-1 text-xs uppercase tracking-wider">Dự kiến kết thúc</label>
              <input 
                type="date" 
                className="w-full bg-white border border-[#3A5A42]/20 px-3 py-2 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#3A5A42]"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 mt-4 text-sm text-slate-700">
          {songName && (
            <div className="flex items-start gap-3">
              <Music size={20} className="mt-0.5 shrink-0 text-[#3A5A42]" />
              <p className="font-sans">Bài hát: <span className="font-bold text-slate-900">{songName}</span></p>
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <input 
              type="text" 
              placeholder="Dán link YouTube (hoặc điền tên bài hát)..." 
              className="flex-1 bg-white border border-[#3A5A42]/20 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3A5A42] font-sans"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
            />
            <button 
              onClick={analyzeYouTube}
              disabled={isAnalyzing || !youtubeLink}
              className={`px-4 py-2.5 rounded-lg font-bold text-sm text-white flex items-center gap-2 transition-all font-sans shrink-0 ${isAnalyzing || !youtubeLink ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#C5A059] shadow-md hover:bg-[#B38D46]'}`}
            >
              ✨ {isAnalyzing ? 'Đang phân tích...' : 'Phân tích Bài Hát (AI)'}
            </button>
          </div>
        </div>
        
        <p className="mt-3 text-xs uppercase tracking-widest font-sans font-bold text-slate-500">
          Học viên: <span className="text-[#3A5A42]">{studentName}</span>
        </p>
        
        <div className="flex gap-3 mt-6 font-sans">
          <button className="flex-1 bg-[#3A5A42] text-white font-semibold py-3 px-4 rounded-lg text-sm transition-transform active:scale-95 shadow-lg">
            Xem Bản Gốc
          </button>
          <button onClick={() => setActiveTab('plan')} className="flex-1 border border-[#3A5A42]/30 text-[#3A5A42] font-semibold py-3 px-4 rounded-lg text-sm backdrop-blur-sm transition-transform active:scale-95 bg-white/50">
            Giáo án Hôm nay
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="sticky top-0 bg-[#EFF6FF] z-30 border-b border-[#3A5A42]/10 font-sans">
        <div className="flex px-4">
          <button 
            onClick={() => setActiveTab('warmup')}
            className={`flex-1 text-center py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'warmup' ? 'border-[#3A5A42] text-[#3A5A42]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Khởi động
          </button>
          <button 
            onClick={() => setActiveTab('technique')}
            className={`flex-1 text-center py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'technique' ? 'border-[#3A5A42] text-[#3A5A42]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Kỹ thuật
          </button>
          <button 
            onClick={() => setActiveTab('itinerary')}
            className={`flex-1 text-center py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'itinerary' ? 'border-[#3A5A42] text-[#3A5A42]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Lộ trình tại nhà
          </button>
          <button 
            onClick={() => setActiveTab('evaluation')}
            className={`flex-1 text-center py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'evaluation' ? 'border-[#3A5A42] text-[#3A5A42]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Đánh giá (Realtime)
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="bg-white min-h-[60vh] text-slate-800 p-6 rounded-t-3xl mt-[-10px] relative z-20 font-serif">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden rounded-t-3xl">
          <div className="text-6xl font-black text-center transform -rotate-12 font-sans leading-tight">TONY TIỆM<br/>DẠY NHẠC</div>
        </div>

        <div className="relative z-10">
          {activeTab === 'evaluation' && (
            <section className="animate-in fade-in duration-300 max-w-4xl mx-auto space-y-6 pt-6">
              <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">Đánh Giá Thực Hành Trực Tiếp</h2>
              
              <div className="grid grid-cols-1 gap-8">
                {/* 1. Luyện Thanh */}
                <section>
                  <h5 className="flex items-center gap-2 text-sm font-bold text-indigo-700 bg-indigo-50 p-3 rounded-lg uppercase tracking-wide mb-4">
                    <Activity size={16}/> I. Luyện Thanh
                  </h5>
                  <div className="space-y-6 px-2">
                    {VOCAL_EVALUATION_CRITERIA.luyen_thanh.map((c) => (
                      <div key={c.key} className="bg-white border rounded-xl p-4 shadow-sm hover:border-indigo-300 transition-colors">
                        <h6 className="font-bold text-slate-800 mb-3">{c.label}</h6>
                        <div className="space-y-2">
                          {c.options.map((opt, i) => (
                            <label key={i} className="flex items-start gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer transition-colors">
                              <input 
                                type="radio" 
                                name={c.key} 
                                className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                checked={scores[c.key] === i + 1}
                                onChange={() => handleScoreChange(c.key, i + 1, c.feedbacks[i])}
                              />
                              <span className="text-sm font-medium text-slate-700"><span className="inline-block w-5 text-slate-400">{i+1}.</span> {opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 2. Hát Bài */}
                <section>
                  <h5 className="flex items-center gap-2 text-sm font-bold text-orange-700 bg-orange-50 p-3 rounded-lg uppercase tracking-wide mb-4">
                    <Music size={16}/> II. Hát Bài Thể Hiện
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
                    {VOCAL_EVALUATION_CRITERIA.hat_bai.map((c) => (
                      <div key={c.key} className="bg-white border rounded-xl p-4 shadow-sm hover:border-orange-300 transition-colors">
                        <h6 className="font-bold text-slate-800 mb-3">{c.label}</h6>
                        <div className="space-y-1.5">
                          {c.options.map((opt, i) => (
                            <label key={i} className="flex items-start gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer transition-colors">
                              <input 
                                type="radio" 
                                name={c.key} 
                                className="mt-0.5 w-4 h-4 text-orange-600 focus:ring-orange-500"
                                checked={scores[c.key] === i + 1}
                                onChange={() => handleScoreChange(c.key, i + 1, c.feedbacks[i])}
                              />
                              <span className="text-xs font-medium text-slate-700"><span className="text-slate-400 mr-1">{i+1}.</span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Realtime Feedback */}
                {realtimeFeedbacks.length > 0 && (
                  <div className="bg-slate-800 text-white rounded-2xl p-4 shadow-lg sticky bottom-4 z-10 animate-in fade-in slide-in-from-bottom-5 border border-slate-700">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700">
                      <Sparkles size={16} className="text-yellow-400" />
                      <h4 className="font-bold text-sm">Gợi ý Mới Nhất (Realtime)</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-slate-300">
                      {realtimeFeedbacks.slice(0, 5).map((fb, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-indigo-400 mt-0.5">➔</span> <span className="font-sans">{fb}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === 'plan' && (
            <section className="animate-in fade-in duration-300">
              
              {aiStructuredData && aiStructuredData.songData ? (
                <div className="bg-emerald-50/50 p-4 md:p-8 font-sans text-slate-800 rounded-3xl mb-10 shadow-inner">
                  {/* Header Section */}
                  <header className="max-w-4xl mx-auto mb-10 text-center">
                    <div className="inline-flex items-center justify-center p-2 px-4 bg-emerald-600 text-white rounded-full mb-4 shadow-lg shadow-emerald-200">
                      <Music className="w-5 h-5 mr-2" />
                      <span className="font-bold tracking-wider text-sm">VOCAL COACHING SERIES</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">{aiStructuredData.songData.title || songName}</h1>
                    <p className="text-lg text-emerald-700 font-medium italic">{aiStructuredData.songData.artist_style}</p>
                  </header>

                  <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Vocal Analysis */}
                    <div className="lg:col-span-1 space-y-6">
                      <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100">
                        <h2 className="text-xl font-bold mb-4 flex items-center">
                          <Mic2 className="w-5 h-5 mr-2 text-emerald-600" />
                          Đặc điểm Giọng hát
                        </h2>
                        <div className="space-y-4">
                          <div className="p-3 rounded-2xl bg-emerald-50/50 border-l-4 border-emerald-500">
                            <p className="font-bold text-sm text-emerald-800 uppercase">Âm vực (Tessitura)</p>
                            <p className="text-slate-600 text-sm mt-1">{aiStructuredData.songData.am_vuc}</p>
                          </div>
                          <div className="p-3 rounded-2xl bg-emerald-50/50 border-l-4 border-teal-500">
                            <p className="font-bold text-sm text-teal-800 uppercase">Tone nhạc (Transpose)</p>
                            <p className="text-slate-600 text-sm mt-1 font-semibold">{aiStructuredData.songData.transpose || 'Chưa cập nhật'}</p>
                          </div>
                          <div className="p-3 rounded-2xl bg-emerald-50/50 border-l-4 border-green-500">
                            <p className="font-bold text-sm text-green-800 uppercase">Kỹ thuật Khó</p>
                            <ul className="text-slate-600 text-sm list-disc ml-4 mt-2 space-y-1">
                              {aiStructuredData.songData.ky_thuat_kho?.map((tech: string, i: number) => (
                                <li key={i}>{tech}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-emerald-600 to-green-700 p-6 rounded-3xl shadow-lg text-white">
                        <h2 className="text-xl font-bold mb-4 flex items-center">
                          <Info className="w-5 h-5 mr-2" />
                          Ghi chú Huấn luyện
                        </h2>
                        <p className="text-emerald-50 text-sm leading-relaxed mb-4 italic whitespace-pre-wrap">
                          "{renderTextWithLinks(aiStructuredData.songData.ghi_chu)}"
                        </p>
                        <div className="flex items-center space-x-2 text-xs font-bold bg-white/10 p-2 rounded-xl">
                          <Clock className="w-4 h-4" />
                          <span>LUYỆN TẬP 60 PHÚT / BUỔI</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle Column: Lesson Plan */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-emerald-100">
                        <h2 className="text-2xl font-bold mb-8 text-center text-emerald-900">Lộ trình 3 Bước Chinh phục</h2>
                        
                        <div className="relative">
                          {/* Timeline Line */}
                          <div className="hidden md:block absolute left-[31px] top-4 bottom-4 w-0.5 bg-emerald-100" />
                          
                          <div className="space-y-8">
                            {aiStructuredData.songData.lessonPlan?.map((step: any, index: number) => {
                              const stepConfig = [
                                { icon: <Wind className="w-6 h-6" />, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
                                { icon: <Activity className="w-6 h-6" />, color: "bg-green-100 text-green-700 border-green-200" },
                                { icon: <Star className="w-6 h-6" />, color: "bg-lime-100 text-lime-700 border-lime-200" }
                              ][index % 3];
                              
                              return (
                                <div key={index} className="relative flex flex-col md:flex-row items-start">
                                  <div className={`z-10 flex items-center justify-center w-16 h-16 rounded-2xl shadow-md mb-4 md:mb-0 ${stepConfig.color} border-2`}>
                                    {stepConfig.icon}
                                  </div>
                                  <div className="md:ml-6 flex-1">
                                    <div className="flex items-center mb-2">
                                      <span className="text-xs font-bold bg-emerald-50 px-2 py-1 rounded-md text-emerald-600 mr-2 uppercase tracking-tighter border border-emerald-100">
                                        {step.time}
                                      </span>
                                      <h3 className="text-lg font-bold text-slate-800">{step.title}</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {step.tasks?.map((task: string, tIndex: number) => (
                                        <div key={tIndex} className="flex items-center text-sm text-slate-500 bg-emerald-50/30 p-2 rounded-lg border border-emerald-100/50">
                                          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500 shrink-0" />
                                          <span className="leading-snug">{task}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Vocalises Section */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {aiStructuredData.songData.vocalises?.map((voc: any, vIndex: number) => {
                          const vocConfig = [
                            { color: "text-emerald-600", border: "border-emerald-100 hover:border-emerald-300" },
                            { color: "text-green-600", border: "border-green-100 hover:border-green-300" },
                            { color: "text-lime-600", border: "border-lime-100 hover:border-lime-300" }
                          ][vIndex % 3];
                          return (
                            <div key={vIndex} className={`bg-white p-5 rounded-2xl border shadow-sm transition-all hover:shadow-md ${vocConfig.border}`}>
                              <h4 className={`font-bold mb-2 flex items-center uppercase text-xs tracking-widest ${vocConfig.color}`}>
                                <PlayCircle className="w-4 h-4 mr-1" /> Vocalise {vIndex + 1}
                              </h4>
                              <p className="text-sm font-semibold text-slate-800">{voc.title}</p>
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed whitespace-pre-wrap">{renderTextWithLinks(voc.desc)}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Footer Assignments */}
                  <footer className="max-w-4xl mx-auto mt-12 p-8 bg-emerald-950 rounded-[2rem] text-white shadow-2xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-4 text-emerald-400">Bài tập Tự học</h2>
                        <ul className="space-y-3 text-emerald-100/70 text-sm">
                          {aiStructuredData.songData.homework?.map((hw: string, i: number) => (
                            <li key={i} className="flex items-start">
                              <ChevronRight className="w-5 h-5 text-emerald-400 shrink-0 mt-0" />
                              <span className="leading-relaxed whitespace-pre-wrap">{renderTextWithLinks(hw)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button 
                        onClick={() => { if (youtubeLink) window.open(youtubeLink, '_blank') }}
                        className="group shrink-0 relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 active:scale-95 uppercase tracking-widest text-sm"
                      >
                        XEM VIDEO GỐC
                      </button>
                    </div>
                  </footer>
                </div>
              ) : rawAiPlanText ? (
                <div className="mb-10 bg-white p-6 rounded-2xl border border-[#3A5A42]/20 shadow-sm font-sans leading-relaxed text-slate-700">
                  <h3 className="font-bold text-[#3A5A42] text-xl border-b border-[#3A5A42]/10 pb-4 mb-4 flex items-center gap-2">
                    <CheckCircle2 size={24} className="text-[#3A5A42]" />
                    Giáo Án Chuyên Sâu (Lỗi render JSON tạm thời)
                  </h3>
                  <div className="max-w-none text-sm md:text-base whitespace-pre-wrap">
                    {rawAiPlanText}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 mb-10">
                  {lessonPlan.length > 0 ? (
                    lessonPlan.map((step, idx) => (
                      <div className="flex gap-4" key={idx}>
                        <div className="shrink-0 w-12 h-12 bg-[#3A5A42]/10 text-[#3A5A42] rounded-xl flex items-center justify-center font-bold font-sans shadow-sm ring-1 ring-[#3A5A42]/10">{step.thoi_gian}'</div>
                        <div>
                          <h4 className="font-bold text-lg">{step.tieu_de}</h4>
                          <p className="text-sm text-slate-600 italic mt-0.5 leading-relaxed whitespace-pre-line">{step.mo_ta}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-slate-50 border border-dashed border-[#3A5A42]/20 rounded-2xl text-slate-500 font-sans shadow-inner">
                      <p className="font-medium text-[#3A5A42]">Chưa có nội dung giáo án ngày hôm nay.</p>
                      <p className="text-xs mt-1 opacity-70">Vui lòng nhập Link YouTube của bài hát ở trên và nhấn "Phân tích AI".</p>
                    </div>
                  )}
                </div>
              )}

              
              <div className="mb-10">
                <h2 className="text-xl font-bold mb-4 text-[#3A5A42]">Ghi chú của giáo viên</h2>
                <div 
                  className="p-5 bg-slate-50 border-l-4 border-[#3A5A42] rounded-r-xl cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => {
                    setCurrentEditIndex(-1);
                    setIsNoteModalOpen(true);
                  }}
                  title="Nhấn để thêm ghi chú mới"
                >
                  <p className="text-sm text-slate-700 leading-relaxed italic">
                    Chưa có ghi chú nào. (Nhấn vào đây để xem chi tiết và dán ảnh)
                  </p>

                  {savedNotes.length > 0 && (
                    <div className="mt-4 space-y-4">
                      {savedNotes.map((note, index) => (
                        <div 
                          key={index} 
                          className="relative border border-slate-200 rounded-xl overflow-hidden shadow-sm group"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentEditIndex(index);
                            setIsNoteModalOpen(true);
                          }}
                          title="Nhấn để sửa ghi chú này"
                        >
                          <img src={note} alt={`Ghi chú ${index + 1}`} className="w-full h-auto" />
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSavedNotes(savedNotes.filter((_, i) => i !== index));
                            }}
                            className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-red-50 text-red-500 rounded-full backdrop-blur-sm transition-all shadow-sm opacity-0 group-hover:opacity-100"
                            title="Xóa ghi chú này"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-10">
                <h2 className="text-xl font-bold mb-4 text-[#3A5A42]">Video & Tài liệu buổi học</h2>
                {studentInfo?.driveLink ? (
                  <a 
                    href={studentInfo.driveLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-[#E8F3EB] border border-[#3A5A42]/20 rounded-xl hover:bg-[#3A5A42]/10 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-[#3A5A42]/10 text-[#3A5A42] rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Video size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-[#3A5A42] font-sans flex items-center gap-2">
                        Thư mục Google Drive Cá nhân <ExternalLink size={14} />
                      </h4>
                      <p className="text-sm text-[#3A5A42]/80 mt-0.5 font-sans">Xem lại clip học hôm nay & tải lên bài tập</p>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-center justify-center gap-3 p-4 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-slate-500 font-sans">
                    <p>Học viên chưa cập nhật đường dẫn Google Drive trong Hồ sơ.</p>
                  </div>
                )}
              </div>

              <button 
                onClick={handleCompleteLesson}
                disabled={isCompleted}
                className={`w-full py-4 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 font-sans mt-4 transition-all duration-300 ${isCompleted ? 'bg-[#4CAF50] cursor-default scale-95 shadow-inner' : 'bg-[#3A5A42] hover:bg-[#2D4633] active:scale-95'}`}
              >
                <CheckCircle2 size={24} /> {isCompleted ? 'ĐÃ HOÀN THÀNH' : 'Hoàn thành buổi học'}
              </button>
            </section>
          )}

          {activeTab === 'warmup' && (
            <section className="animate-in fade-in duration-300">
              <h2 className="text-xl font-bold mb-6 text-[#3A5A42]">Khởi động giọng hát</h2>
              <div className="space-y-4">
                {aiStructuredData?.songData?.warmups ? (
                  aiStructuredData.songData.warmups.map((item: any, i: number) => (
                    <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#3A5A42]/10 text-[#3A5A42] rounded-full flex items-center justify-center font-bold font-sans shrink-0">{i + 1}</div>
                      <div>
                        <h4 className="font-bold">{item.title}</h4>
                        <p className="text-sm text-slate-500 font-sans leading-relaxed mt-1 whitespace-pre-wrap">{renderTextWithLinks(item.desc)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-slate-50 border border-dashed border-[#3A5A42]/20 rounded-2xl text-slate-500 font-sans shadow-inner">
                    <p className="font-medium text-[#3A5A42]">Chưa có dữ liệu khởi động.</p>
                    <p className="text-xs mt-1 opacity-70">Vui lòng phân tích AI để nhận bài tập khởi động.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === 'technique' && (
            <section className="animate-in fade-in duration-300">
              <h2 className="text-xl font-bold mb-4 text-[#3A5A42]">Gợi ý luyện tập cho kỹ thuật</h2>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {aiStructuredData?.songData?.techniques ? (
                  aiStructuredData.songData.techniques.map((tech: any, i: number) => (
                    <div 
                      key={i}
                      className="bg-[#2D4633] p-4 text-white rounded-xl cursor-pointer"
                      onClick={() => setOpenAccordions(prev => ({ ...prev, [i]: !prev[i] }))}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold">{tech.name}</h3>
                        <ChevronDown size={16} className={`transition-transform ${openAccordions[i] ? 'rotate-180' : ''}`} />
                      </div>
                      <div className={`overflow-hidden transition-all duration-300 ${openAccordions[i] ? 'max-h-40 mt-3' : 'max-h-0'}`}>
                        <ul className="text-[13px] space-y-1 text-white/90 list-disc list-inside font-sans">
                          {tech.details?.map((detail: string, j: number) => (
                            <li key={j} className="leading-snug">{detail}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-8 text-center bg-slate-50 border border-dashed border-[#3A5A42]/20 rounded-2xl text-slate-500 font-sans shadow-inner">
                    <p className="font-medium text-[#3A5A42]">Chưa có Gợi ý kỹ thuật.</p>
                    <p className="text-xs mt-1 opacity-70">Vui lòng phân tích AI để cập nhật kỹ thuật thanh nhạc.</p>
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold mb-4 text-[#3A5A42]">Bài Tập Luyện Thanh Đặc Hiệu</h2>
              <div className="grid grid-cols-2 gap-4">
                {aiStructuredData?.songData?.vocalises ? (
                  aiStructuredData.songData.vocalises.map((item: any, i: number) => {
                    let levelColor = 'bg-amber-500';
                    if (item.level === 'Dễ') levelColor = 'bg-green-500';
                    else if (item.level === 'Khó') levelColor = 'bg-red-600';

                    return (
                      <div key={i} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex flex-col relative overflow-hidden h-full">
                        {item.level && (
                          <span className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded text-white font-bold uppercase font-sans ${levelColor}`}>
                            {item.level}
                          </span>
                        )}
                        <h3 className="font-bold text-lg mb-2 mt-2 leading-tight">{item.title}</h3>
                        <p className={`text-sm text-slate-600 font-sans italic leading-relaxed whitespace-pre-wrap ${item.instruction ? 'mb-2' : 'mb-6 flex-1'}`}>{renderTextWithLinks(item.desc)}</p>
                        {item.instruction && (
                          <div className="bg-[#3A5A42]/5 rounded-lg p-3 mb-4 flex-1">
                            <p className="text-[11px] font-bold text-[#3A5A42] mb-1 uppercase tracking-wide">Hướng dẫn thực hiện:</p>
                            <p className="text-sm text-slate-700 font-sans leading-relaxed whitespace-pre-wrap">{renderTextWithLinks(item.instruction)}</p>
                          </div>
                        )}
                        <button 
                          onClick={() => {
                            if (studentInfo?.driveLink) {
                              window.open(studentInfo.driveLink, '_blank');
                            } else {
                              alert('Học viên này chưa có link Drive.');
                            }
                          }}
                          className="w-full mt-auto bg-[#2D4633] text-white py-2.5 rounded-lg text-xs font-semibold hover:bg-[#3A5A42] transition-colors font-sans opacity-90 hover:opacity-100 shrink-0"
                        >
                          Xem video hướng dẫn
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 p-8 text-center bg-slate-50 border border-dashed border-[#3A5A42]/20 rounded-2xl text-slate-500 font-sans shadow-inner">
                    <p className="font-medium text-[#3A5A42]">Chưa có bài tập luyện thanh đặc hiệu.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === 'itinerary' && (
            <section className="animate-in fade-in duration-300">
              <h2 className="text-xl font-bold mb-6 text-[#3A5A42]">Lộ trình tại nhà</h2>
              <div className="relative pl-8 border-l-2 border-slate-100 space-y-8 mb-10 font-sans">
                {aiStructuredData?.songData?.homeItinerary ? (
                  aiStructuredData.songData.homeItinerary.map((step: any, i: number) => (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[41px] top-0 w-4 h-4 rounded-full ${i === 0 ? 'bg-[#3A5A42]' : 'bg-[#3A5A42]/30'} border-4 border-white`}></div>
                      <h4 className={`font-bold ${i === 0 ? 'text-[#3A5A42]' : 'text-slate-400'}`}>{step.time}</h4>
                      <p className="text-sm font-semibold font-serif mt-1">{step.title}</p>
                      <p className="text-xs text-slate-500 mt-1 font-serif line-clamp-3 whitespace-pre-wrap">{renderTextWithLinks(step.desc)}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-slate-500 text-sm">
                    Phân tích AI để hiện thị lộ trình 
                  </div>
                )}
              </div>

              {/* Daily Checklist */}
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4 text-[#3A5A42]">Daily Checklist</h2>
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4 font-sans">
                  
                  {aiStructuredData?.songData?.dailyChecklist ? (
                    aiStructuredData.songData.dailyChecklist.map((task: string, idx: number) => (
                      <label key={idx} className={`flex items-center gap-4 cursor-pointer group ${idx > 0 ? 'pt-2' : ''}`}>
                        <div className="relative">
                          <input type="checkbox" className="peer sr-only" />
                          <div className="w-6 h-6 border-2 border-slate-300 rounded-md transition-all peer-checked:bg-[#3A5A42] peer-checked:border-[#3A5A42] flex items-center justify-center">
                            <svg className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-slate-700 font-serif">{task}</span>
                      </label>
                    ))
                  ) : (
                    <div className="text-slate-500 text-sm mb-4">Chưa có checklist từ AI.</div>
                  )}

                  {/* Step 3: Ghi âm */}
                  <div className="flex flex-col gap-3 pt-2">
                    <div className="flex items-center justify-between group/item">
                      <label className="flex items-center gap-4 cursor-pointer group flex-1">
                        <div className="relative">
                          <input type="checkbox" className="peer sr-only" checked={recordingState === 'recorded'} readOnly />
                          <div className="w-6 h-6 border-2 border-slate-300 rounded-md transition-all peer-checked:bg-[#3A5A42] peer-checked:border-[#3A5A42] flex items-center justify-center">
                            <svg className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-slate-700 font-serif">Ghi âm điệp khúc (10 phút)</span>
                      </label>
                      <div className="flex gap-1">
                        {recordingState === 'idle' && (
                          <button 
                            onClick={startRecording}
                            className="p-2 text-[#3A5A42] hover:bg-[#3A5A42]/10 rounded-full transition-colors"
                            title="Bắt đầu ghi âm"
                          >
                            <Mic size={20} />
                          </button>
                        )}
                        {recordingState === 'recording' && (
                          <button 
                            onClick={stopRecording}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors animate-pulse"
                            title="Dừng ghi âm"
                          >
                            <StopCircle size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {recordingState === 'recorded' && (
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 ml-10 shadow-sm">
                        <audio ref={audioRef} src={audioURL || undefined} className="hidden" />
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={togglePlay}
                            className="text-[#3A5A42] hover:scale-110 transition-transform"
                          >
                            {isPlaying ? <PauseCircle size={24} /> : <PlayCircle size={24} />}
                          </button>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700 font-sans">bản_ghi_âm_của_bạn.webm</span>
                            <span className="text-[10px] text-slate-400 font-sans">{isPlaying ? 'Đang phát...' : 'Đã ghi âm xong'}</span>
                          </div>
                        </div>
                        <button 
                          onClick={deleteRecording}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          title="Xóa bản ghi (Không lưu lại)"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 p-3 bg-[#3A5A42]/5 border-l-2 border-[#3A5A42] rounded-r-lg ml-10">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare size={14} className="text-[#3A5A42]" />
                      <p className="text-[10px] uppercase tracking-wider font-bold text-[#3A5A42]">Nhận xét của giáo viên</p>
                    </div>
                    <p className="text-xs text-slate-700 italic leading-relaxed pl-6 font-serif">
                      Chưa có nhận xét. Quá trình học tập sẽ được cập nhật sau.
                    </p>
                  </div>

                </div>
              </div>
            </section>
          )}
        </div>
      </main>
      
      <TeacherNoteModal 
        isOpen={isNoteModalOpen} 
        onClose={() => setIsNoteModalOpen(false)} 
        onSave={(dataUrl) => {
          if (currentEditIndex >= 0) {
            const newNotes = [...savedNotes];
            newNotes[currentEditIndex] = dataUrl;
            setSavedNotes(newNotes);
          } else {
            setSavedNotes([...savedNotes, dataUrl]);
          }
        }}
        initialImage={currentEditIndex >= 0 ? savedNotes[currentEditIndex] : undefined}
      />
    </div>
  );
}
