import { useState } from 'react';
import { ArrowLeft, Clock, Calendar, CheckCircle2, ChevronRight, PlayCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function LessonHistoryScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [isUpcomingExpanded, setIsUpcomingExpanded] = useState(true);
  const [isPastExpanded, setIsPastExpanded] = useState(true);

  const pastLessons = [
    {
      id: 8,
      date: '06/03/2026',
      title: 'Xử Lý Khoảng Chuyển Giọng',
      song: 'Chưa Bao Giờ - Thu Phương',
      status: 'completed',
      note: 'Passaggio đã mượt mà hơn, chú ý giữ vững vị trí âm thanh.'
    },
    {
      id: 7,
      date: '28/02/2026',
      title: 'Mở Rộng Âm Vực & Hơi Thở',
      song: 'Hương Ngọc Lan - Mỹ Linh',
      status: 'completed',
      note: 'Hơi thở tốt, cần tập trung mở khẩu hình dọc khi lên cao.'
    },
    {
      id: 6,
      date: '21/02/2026',
      title: 'Kỹ Thuật Rung (Vibrato)',
      song: 'Cơn Mưa Tình Yêu - Hà Anh Tuấn',
      status: 'completed',
      note: 'Rung giọng tự nhiên, nhưng đôi khi hơi nhanh. Cần kiểm soát nhịp độ.'
    }
  ];

  const todayLesson = {
    id: 9,
    date: '13/03/2026',
    title: 'Chinh Phục Nhạc Cổ Phong',
    song: 'Đào Hoa Nặc - G.E.M Đặng Tử Kỳ',
    status: 'upcoming',
    focus: 'Luyến láy, Crescendo/Decrescendo'
  };

  return (
    <div className="min-h-screen bg-[#F5F2E9] text-slate-900 font-sans pb-10">
      {/* Header */}
      <header className="px-6 pt-8 pb-6 bg-[#3A5A42] text-white rounded-b-[2rem] shadow-md">
        <button 
          onClick={() => onNavigate('student')} 
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl flex items-center gap-2 mb-6 text-sm backdrop-blur-sm transition-all font-semibold"
        >
          <ArrowLeft size={16} />
          Quay lại hồ sơ
        </button>
        
        <h1 className="text-2xl font-bold">Lịch sử & Kế hoạch học</h1>
        <p className="text-white/80 text-sm mt-1">Xem lại các buổi học trước và kế hoạch hôm nay</p>
      </header>

      <main className="px-5 mt-6 space-y-6">
        {/* Upcoming Lessons */}
        <section className="bg-white rounded-3xl shadow-sm border border-[#3A5A42]/10 overflow-hidden">
          <button 
            onClick={() => setIsUpcomingExpanded(!isUpcomingExpanded)}
            className="w-full flex items-center justify-between p-5 bg-[#E8F0E4] hover:bg-[#D1E2C9] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#3A5A42] text-white rounded-xl shadow-sm">
                <Clock size={20} />
              </div>
              <h2 className="text-lg font-bold text-[#1E3A2B]">Kế hoạch học sắp tới</h2>
            </div>
            {isUpcomingExpanded ? <ChevronUp className="text-[#3A5A42]" /> : <ChevronDown className="text-[#3A5A42]" />}
          </button>
          
          {isUpcomingExpanded && (
            <div className="p-5 bg-white">
              <div 
                className="bg-[#F9FBF9] rounded-2xl p-5 shadow-sm border border-[#3A5A42]/20 cursor-pointer hover:shadow-md transition-all relative overflow-hidden"
                onClick={() => onNavigate('lesson')}
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#3A5A42]"></div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center min-w-[60px]">
                    <div className="w-12 h-12 rounded-full bg-[#3A5A42] flex items-center justify-center text-white font-bold text-xl mb-2 shadow-inner">
                      {todayLesson.id}
                    </div>
                    <span className="text-[10px] font-bold text-[#3A5A42]">{todayLesson.date}</span>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-lg leading-tight text-[#1E3A2B]">{todayLesson.title}</h4>
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full whitespace-nowrap">
                        SẮP DIỄN RA
                      </span>
                    </div>

                    <div className="text-sm space-y-1">
                      <p><span className="font-bold text-[#1E3A2B]">Bài hát: </span><span className="text-slate-600">{todayLesson.song}</span></p>
                      <p><span className="font-bold text-[#1E3A2B]">Trọng tâm: </span><span className="text-slate-600">{todayLesson.focus}</span></p>
                    </div>

                    <button className="w-full mt-3 py-2 bg-[#3A5A42] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#2A4230] transition-colors shadow-md">
                      <PlayCircle size={18} />
                      Vào buổi học
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Past Lessons */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <button 
            onClick={() => setIsPastExpanded(!isPastExpanded)}
            className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100 transition-colors border-b border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-200 text-slate-600 rounded-xl shadow-sm">
                <Calendar size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Các buổi học trước</h2>
            </div>
            {isPastExpanded ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
          </button>
          
          {isPastExpanded && (
            <div className="p-5 bg-white space-y-4">
              {pastLessons.map((lesson) => (
                <div 
                  key={lesson.id}
                  className="bg-slate-50 rounded-2xl p-4 border border-slate-100 cursor-pointer hover:border-[#3A5A42]/30 hover:bg-[#F9FBF9] transition-all group"
                  onClick={() => onNavigate('lesson')}
                >
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center min-w-[50px]">
                      <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg mb-1 group-hover:border-[#3A5A42]/30 group-hover:text-[#3A5A42] transition-colors shadow-sm">
                        {lesson.id}
                      </div>
                      <span className="text-[10px] font-medium text-slate-500">{lesson.date}</span>
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-base leading-tight text-slate-700 group-hover:text-[#3A5A42] transition-colors">{lesson.title}</h4>
                        <CheckCircle2 size={16} className="text-[#4CAF50] shrink-0" />
                      </div>

                      <div className="text-xs space-y-1">
                        <p><span className="font-bold text-slate-700">Bài hát: </span><span className="text-slate-500">{lesson.song}</span></p>
                        <p className="italic text-slate-500 line-clamp-2">"{lesson.note}"</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center text-slate-300 group-hover:text-[#3A5A42] transition-colors">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
