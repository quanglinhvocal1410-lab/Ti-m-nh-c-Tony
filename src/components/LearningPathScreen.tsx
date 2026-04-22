import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function LearningPathScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <div className="min-h-screen bg-[#F5F2E9] font-sans text-slate-800 pb-10">
      {/* Header Section */}
      <header className="bg-[#3A5A42] text-white px-4 pt-6 pb-12 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => onNavigate('student')} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex justify-between w-full text-[10px] uppercase tracking-wider font-semibold opacity-80">
            <span>Học viên: Chị Yến</span>
            <span>Nhập học: 26/01/2026</span>
            <span>Rank: A</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">Lộ Trình Học Tập</h1>
        <p className="text-sm opacity-90 leading-relaxed mb-4">
          Chào Chị Yến, cùng xem hôm nay chúng ta sẽ chinh phục kỹ thuật gì nhé!
        </p>

        <div className="flex justify-end">
          <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-xs font-medium border border-white/20">
            <CheckCircle2 size={14} />
            <span>Mục tiêu: Hoàn thiện Kỹ thuật Biểu diễn</span>
          </div>
        </div>
      </header>

      {/* Timeline Section */}
      <main className="px-4 -mt-6 space-y-4 relative z-10">
        
        {/* Lesson 7 - Completed */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-[#E8F3EB] text-[#3A5A42] flex items-center justify-center font-bold text-lg">
                7
              </div>
              <span className="text-[10px] text-slate-400 font-medium">28/02/2026</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg leading-tight pr-2">Củng cố Giọng Ngực & Hơi thở</h3>
                <span className="bg-[#4CAF50] text-white text-[9px] font-bold px-2 py-1 rounded-full whitespace-nowrap uppercase tracking-wider">
                  Đã hoàn thành
                </span>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <p><span className="font-bold uppercase text-xs">Bài hát luyện tập:</span> Ước Gì - Mỹ Tâm</p>
                <p><span className="font-bold uppercase text-xs">Trọng tâm kỹ thuật:</span> Kiểm soát luồng hơi, hát rõ chữ ở quãng thấp, không bị mờ tiếng.</p>
                <p className="italic text-slate-600"><span className="font-semibold not-italic">Ghi chú GV:</span> Kỹ thuật hơi thở cải thiện tốt, cần duy trì.</p>
              </div>

              <button 
                onClick={() => onNavigate('lesson')}
                className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Xem lại giáo án
              </button>
            </div>
          </div>
        </div>

        {/* Lesson 8 - Completed */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-[#E8F3EB] text-[#3A5A42] flex items-center justify-center font-bold text-lg">
                8
              </div>
              <span className="text-[10px] text-slate-400 font-medium">06/03/2026</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg leading-tight pr-2">Xử Lý Khoảng Chuyển Giọng</h3>
                <span className="bg-[#4CAF50] text-white text-[9px] font-bold px-2 py-1 rounded-full whitespace-nowrap uppercase tracking-wider">
                  Đã hoàn thành
                </span>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <p><span className="font-bold uppercase text-xs">Bài hát luyện tập:</span> Chưa Bao Giờ - Thu Phương</p>
                <p><span className="font-bold uppercase text-xs">Trọng tâm kỹ thuật:</span> Kỹ thuật Passaggio: Chuyển mượt mà giữa Chest Voice và Head Voice.</p>
                <p className="italic text-slate-600"><span className="font-semibold not-italic">Ghi chú GV:</span> Passaggio đã mượt mà hơn, chú ý giữ vững vị trí âm thanh.</p>
              </div>

              <button 
                onClick={() => onNavigate('lesson')}
                className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Xem lại giáo án
              </button>
            </div>
          </div>
        </div>

        {/* Lesson 9 - Today (Active) */}
        <div className="bg-white rounded-2xl p-4 shadow-md border-2 border-[#D32F2F] relative overflow-hidden">
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-[#D32F2F] text-white flex items-center justify-center font-bold text-lg">
                9
              </div>
              <span className="text-[10px] text-slate-500 font-medium">13/03/2026</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg leading-tight pr-2">Chinh Phục Nhạc Cổ Phong</h3>
                <span className="bg-[#D32F2F] text-white text-[9px] font-bold px-2 py-1 rounded-full whitespace-nowrap uppercase tracking-wider">
                  Hôm nay
                </span>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <p><span className="font-bold uppercase text-xs">Bài hát luyện tập:</span> Đào Hoa Nặc - G.E.M Đặng Tử Kỳ, Tay Trái Chỉ Trăng (Khởi động)</p>
                <p><span className="font-bold uppercase text-xs">Trọng tâm kỹ thuật:</span> Mixed Voice sáng, luyến láy đặc trưng nhạc Hoa, khẩu hình dọc.</p>
              </div>

              <button 
                onClick={() => onNavigate('lesson')}
                className="w-full py-2.5 rounded-xl bg-[#D32F2F] text-white font-semibold text-sm hover:bg-red-700 transition-colors shadow-sm"
              >
                Vào lớp học
              </button>
            </div>
          </div>
        </div>

        {/* Lesson 10 - Upcoming */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 opacity-80">
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-lg">
                10
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg leading-tight pr-2">Belting & Cao Trào Cảm Xúc</h3>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <p className="text-xs text-slate-500 font-medium mb-1">20/03/2026</p>
                <p><span className="font-bold uppercase text-xs">Bài hát luyện tập:</span> Cô Đơn Trên Sofa - Hồ Ngọc Hà</p>
                <p><span className="font-bold uppercase text-xs">Trọng tâm kỹ thuật:</span> Belting an toàn, nén hơi tốt, bùng nổ điệp khúc không rát cổ.</p>
              </div>

              <button 
                onClick={() => onNavigate('lesson')}
                className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Vào lớp học
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
