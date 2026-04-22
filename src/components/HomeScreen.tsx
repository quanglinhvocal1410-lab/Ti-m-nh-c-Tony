import { useState, useEffect } from 'react';
import { Music, Search, MoreVertical, Activity, Users, User, Folder, PlusCircle, ChevronRight, GraduationCap, Calendar, Settings, X, PlayCircle } from 'lucide-react';
import { studentService, MongoStudent } from '../services/studentService';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function HomeScreen({ onNavigate }: { onNavigate: (screen: string, id?: string) => void }) {
  const [students, setStudents] = useState<MongoStudent[]>([]);
  const [allStudents, setAllStudents] = useState<MongoStudent[]>([]);
  const [user, setUser] = useState<any>(null);
  const [selectedClassType, setSelectedClassType] = useState<'TNN' | 'TN11' | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setStudents([]);
      setAllStudents([]);
      return;
    }

    const unsubscribe = studentService.subscribeToStudents(
      (data) => {
        setAllStudents(data);
        setStudents(data.slice(0, 3)); // Get top 3 students
      },
      (error) => {
        console.error("Error fetching students: ", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const groupClassCount = allStudents.filter(s => s.course === 'TNN').length;
  const oneOnOneClassCount = allStudents.filter(s => s.course === 'TN11').length;
  const filteredStudents = selectedClassType ? allStudents.filter(s => s.course === selectedClassType) : [];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#4E6B56] pb-24 font-sans">
      {/* Watermark */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[60vw] font-extrabold text-white/5 pointer-events-none select-none z-0">
        V
      </div>
      
      <div className="relative z-10 flex flex-col w-full h-full">
        {/* Header & Search */}
        <div className="px-4 pt-8 pb-4 sticky top-0 z-20 bg-[#4E6B56]/95 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-[#C5A059] rounded-xl flex items-center justify-center shadow-lg">
                <Music size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">Tony Music</h1>
                <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest">Academy</p>
              </div>
            </div>
            <button className="flex items-center justify-center rounded-xl h-10 w-10 bg-white/10 text-white hover:bg-white/20 transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
          
          <div className="relative flex items-center">
            <div className="absolute left-4 text-slate-400">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Tìm kiếm bài tập, học viên, tài liệu..." 
              className="w-full bg-[#F9FBF9]/95 backdrop-blur-md py-3.5 pl-12 pr-4 rounded-2xl text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#C5A059] shadow-lg border border-white/20"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 mb-4">
          <div className="bg-[#F9FBF9]/90 backdrop-blur-sm rounded-2xl p-1 flex border border-white/20 shadow-sm justify-between">
            <button className="flex-1 flex flex-col items-center justify-center bg-[#4E6B56] text-white rounded-xl py-2 transition-all">
              <Activity size={20} className="mb-1" />
              <span className="text-[10px] font-semibold leading-none">Bài tập</span>
            </button>
            <button onClick={() => setSelectedClassType('TNN')} className="flex-1 flex flex-col items-center justify-center text-slate-500 py-2 hover:text-[#4E6B56] transition-colors relative">
              <Users size={20} className="mb-1" />
              <span className="text-[10px] font-semibold leading-none">Lớp Nhóm</span>
              {groupClassCount > 0 && (
                <span className="absolute top-1 right-2 bg-[#C5A059] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                  {groupClassCount}
                </span>
              )}
            </button>
            <button onClick={() => setSelectedClassType('TN11')} className="flex-1 flex flex-col items-center justify-center text-slate-500 py-2 hover:text-[#4E6B56] transition-colors relative">
              <User size={20} className="mb-1" />
              <span className="text-[10px] font-semibold leading-none">Lớp 1vs1</span>
              {oneOnOneClassCount > 0 && (
                <span className="absolute top-1 right-2 bg-[#C5A059] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                  {oneOnOneClassCount}
                </span>
              )}
            </button>
            <button className="flex-1 flex flex-col items-center justify-center text-slate-500 py-2 hover:text-[#4E6B56] transition-colors">
              <Folder size={20} className="mb-1" />
              <span className="text-[10px] font-semibold leading-none">Tài liệu</span>
            </button>
          </div>
        </div>

        <main className="flex-1 px-4 space-y-6">
          {/* Hero */}
          <section className="relative h-48 w-full overflow-hidden rounded-2xl shadow-xl border border-white/10 cursor-pointer" onClick={() => onNavigate('lesson')}>
            <img alt="Vocal Class Branding" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4oYEUy9u3HcorWdUmwIGyfDFPUN2F8AKs0uUc-bGr1vTEhy_7kXPcxTh4MTk7UxA8n3P2VT0SFf1SuyYOKjA231Nlon2I_Z4GHjt9EdZ534R5Ona-ZCuWbjWk87RopDHmLCVcQ_A0GdeKdHRRrjVzm7O_rz-wqUYkNyQr-APE7R0V6Fzncw1mabnGsyD8UfpQlIhZp5idMlwZJwFlOGR3MYggomtNoi39wOuuSgzu8DV-KZpz_JHzN1bHRHySUqfazmufE_nRY7g" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
              <span className="bg-[#C5A059] text-white text-[10px] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-md w-fit mb-3 shadow-sm">Học viện Âm nhạc</span>
              <h1 className="text-white text-2xl font-bold leading-tight">Làm chủ giọng hát cùng Chuyên gia</h1>
              <p className="text-white/90 text-sm mt-1.5 font-light">Khám phá tiềm năng và tỏa sáng trên sân khấu chuyên nghiệp.</p>
            </div>
          </section>

          {/* Exercises */}
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-lg font-bold text-white">Bài tập luyện thanh</h3>
              <button className="text-[#C5A059] bg-[#F9FBF9]/20 hover:bg-[#F9FBF9]/30 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition-all">
                <PlusCircle size={16} />
                Thêm mới
              </button>
            </div>
            <div className="space-y-3">
              {[
                { title: 'Luyện hơi cơ bản (Appoggio)', desc: '15 phút • Đẩy hơi bụng bền bỉ', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQN8kqdP5Ahks9wezyp25o6K4Rz20MhCbm_T7Undkyi_4BeFVpKEMmk1NZfALkVOg8_ziJytcWfk4IQLHH3WLxK6LZA9WRi8hyCw_NbWNf3w8yJCQTU5cG9MjQR3ej_SSn3DTlNLhFhQZdnPJVNgD29ibb16MTmQ4kodMxhv6jlga5aeYz6KXxqUOcSig9F4R-xtWmewwegqsxzh7Svu48wkwlBZbCm4XqRAjvQPCPFDb5P4W1Fm5CPhKnXn2YZu-7HTVMCIcJXXs' },
                { title: 'Khởi động quãng trung', desc: '10 phút • Mẫu luyện 5 nốt', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIfKQOfmo48MTwmgvUWqtXNke9-dTJyRVEnIaKQeKSL-lVbb0Rgu1svN09lfLQLpTAL6HlvsXK6DcuhWHGrdVRwm-45kdXFfWT4vwQjCZEgcWEkP9IuLceEcUSFZGwCJDekCKss_IVmLEM1V0FijNrn1FEhiresnp70EvFH_RFpSWyEOdGfG0j9xa4FTXAaawbimYXM3K2fPz9Nzx6tcyqM5T8IqFC11UVGSXjHpof2igSUeuW7Csf4QLBqIGepHDCaaBMDzVs59k' },
                { title: 'Kỹ thuật Run & Riffs', desc: '20 phút • Linh hoạt cơ quan phát âm', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIbVodqLjVggaP58wLCbZgvoW2JzgbRPkbrOefF05WeJtYa1cASt9eKbXSUOnTuv0twUnT5OIIk1SJgbv3AxzmsiMuyMBbsRDcTbjUA4WHS-uobOQNYz7a_tJZZQfC0e3MZ8qkxbVuDywda3uPisHvQV1DsdHy0eVRQPAbjNIAzQ599I16-JTa3pNSBOUp7hjtnLMWY47uSDcAuCXNU-7KfL1cu_w9JhWde09KEI2rJWxq2saktBy8XYdHze2earIlaVovqh8obp8' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-[#F9FBF9]/95 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-sm hover:shadow-lg transition-all cursor-pointer group" onClick={() => onNavigate('lesson')}>
                  <div className="flex items-center justify-center rounded-xl bg-slate-100 shrink-0 size-14 overflow-hidden ring-2 ring-transparent group-hover:ring-[#C5A059]/30 transition-all">
                    <img alt={item.title} className="w-full h-full object-cover" src={item.img} />
                  </div>
                  <div className="flex flex-col justify-center flex-1">
                    <p className="text-[15px] font-bold text-slate-900 line-clamp-1">{item.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
                  </div>
                  <div className="shrink-0 text-slate-400 group-hover:text-[#C5A059] transition-colors">
                    <ChevronRight size={20} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Students */}
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-lg font-bold text-white">Học viên tiêu biểu ({students.length})</h3>
              <button onClick={() => onNavigate('students')} className="text-[#C5A059] text-sm font-bold bg-white/10 px-3 py-1 rounded-full">Xem tất cả</button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {students.map((student) => (
                <div key={student._id} className="flex items-center gap-4 bg-[#F9FBF9]/95 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-sm cursor-pointer" onClick={() => onNavigate('student', student._id)}>
                  <div className="size-14 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-500 border-2 border-[#C5A059]/20 overflow-hidden">
                    {student.avatar ? (
                      <img alt={student.name} className="w-full h-full object-cover" src={student.avatar} />
                    ) : (
                      student.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{student.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{student.voiceType || 'Chưa phân loại giọng'} • {student.status || 'Đang học'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('lesson', student._id);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C5A059] text-white hover:bg-[#B38D46] transition-colors shadow-sm"
                    >
                      <PlayCircle size={14} /> Hôm nay
                    </button>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${student.online ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      <span className={`size-1.5 rounded-full ${student.online ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span> {student.online ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Bottom Nav */}
        <div className="fixed bottom-0 w-full p-4 pointer-events-none z-30">
          <div className="max-w-md mx-auto bg-[#F9FBF9]/95 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-2 flex items-center pointer-events-auto justify-between">
            <button className="flex flex-col items-center gap-1 text-[#4E6B56] px-4 py-2">
              <GraduationCap size={24} />
              <p className="text-[10px] font-bold uppercase tracking-tight">Lớp học</p>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#4E6B56] transition-colors px-4 py-2">
              <Calendar size={24} />
              <p className="text-[10px] font-bold uppercase tracking-tight">Lịch dạy</p>
            </button>
            <button onClick={() => onNavigate('students')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#4E6B56] transition-colors px-4 py-2">
              <Users size={24} />
              <p className="text-[10px] font-bold uppercase tracking-tight">Học viên</p>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#4E6B56] transition-colors px-4 py-2">
              <Settings size={24} />
              <p className="text-[10px] font-bold uppercase tracking-tight">Cài đặt</p>
            </button>
          </div>
        </div>
      </div>

      {/* Class Type Modal */}
      {selectedClassType && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">
                {selectedClassType === 'TNN' ? 'Danh sách Lớp Nhóm' : 'Danh sách Lớp 1vs1'}
              </h2>
              <button onClick={() => setSelectedClassType(null)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {filteredStudents.length > 0 ? (
                <div className="space-y-3">
                  {filteredStudents.map(student => (
                    <div 
                      key={student._id} 
                      className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:border-[#C5A059]/30 hover:bg-[#C5A059]/5 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedClassType(null);
                        onNavigate('student', student._id);
                      }}
                    >
                      <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 border border-slate-200 overflow-hidden shrink-0">
                        {student.avatar ? (
                          <img alt={student.name} className="w-full h-full object-cover" src={student.avatar} />
                        ) : (
                          student.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">{student.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{student.status || 'Đang học'}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClassType(null);
                          onNavigate('lesson', student._id);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C5A059] text-white hover:bg-[#B38D46] transition-colors shadow-sm"
                      >
                        <PlayCircle size={14} /> Hôm nay
                      </button>
                      <ChevronRight size={16} className="text-slate-300 ml-1" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-slate-500">Chưa có học viên nào trong lớp này.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
