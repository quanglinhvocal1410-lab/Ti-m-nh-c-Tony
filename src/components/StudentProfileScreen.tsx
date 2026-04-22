import React, { useState, useEffect } from 'react';
import { ArrowLeft, MoreVertical, Zap, Music, Heart, Mic, CalendarCheck, Phone, Calendar, Star, Activity, BookOpen, Trash2, Edit2, Sparkles, ChevronRight } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import ConfirmModal from './ConfirmModal';
import EditStudentModal from './EditStudentModal';
import AIEvaluationModal from './AIEvaluationModal';
import LessonHistoryTab from './LessonHistoryTab';
import { studentService, MongoStudent } from '../services/studentService';
import { lessonService, Lesson } from '../services/lessonService';

interface StudentProfileScreenProps {
  onNavigate: (screen: string, id?: string) => void;
  studentId: string | null;
}

export default function StudentProfileScreen({ onNavigate, studentId }: StudentProfileScreenProps) {
  const [student, setStudent] = useState<MongoStudent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'songs' | 'history' | 'evaluation'>('overview');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [focusLessonId, setFocusLessonId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setIsAdmin(currentUser?.email === 'quanglinhvocal1410@gmail.com');
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!studentId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    const unsubscribe = studentService.subscribeToStudent(
      studentId,
      (data) => {
        setStudent(data);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching student:", error);
        setIsLoading(false);
      }
    );

    // Tải danh sách bài học để lấy bài hát
    const loadLessons = async () => {
      try {
        const data = await lessonService.getLessonsByStudent(studentId);
        setLessons(data);
      } catch (e) {
        console.error(e);
      }
    };
    loadLessons();

    return () => unsubscribe();
  }, [studentId]);
  
  const loadLessonsCallback = async () => {
    if (!studentId) return;
    try {
      const data = await lessonService.getLessonsByStudent(studentId);
      setLessons(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!studentId) {
      return;
    }

    try {
      setIsDeleting(true);
      await studentService.deleteStudent(studentId);
      setIsDeleteModalOpen(false);
      onNavigate('students');
    } catch (error) {
      console.error("Error deleting student:", error);
      alert('Có lỗi xảy ra khi xóa học viên. Vui lòng thử lại.');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#3A5A42] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-[#3A5A42] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy học viên</h2>
        <button onClick={() => onNavigate('students')} className="px-6 py-3 bg-white text-[#3A5A42] rounded-full font-bold">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#3A5A42] text-white pb-24 font-sans relative overflow-x-hidden">
      {/* Watermark Logo */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[30deg] opacity-5 pointer-events-none z-0 w-[80%]">
        <svg fill="white" viewBox="0 0 100 100">
          <path d="M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z"></path>
        </svg>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="p-6 flex items-center justify-between sticky top-0 z-50 bg-[#3A5A42]/80 backdrop-blur-md">
          <button onClick={() => onNavigate('home')} className="p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">Hồ sơ Học viên</h1>
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-colors"
            >
              <MoreVertical size={24} />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl overflow-hidden z-50 border border-slate-100">
                {isAdmin && (
                  <>
                    <button 
                      onClick={() => {
                        setShowMenu(false);
                        setIsAIModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-3 text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 text-sm font-medium transition-colors border-b border-slate-100"
                    >
                      <Zap size={16} />
                      Đánh giá bằng AI
                    </button>
                    <button 
                      onClick={() => {
                        setShowMenu(false);
                        setIsEditModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-3 text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-sm font-medium transition-colors border-b border-slate-100"
                    >
                      <Edit2 size={16} />
                      Chỉnh sửa thông tin
                    </button>
                    <button 
                      onClick={() => {
                        setShowMenu(false);
                        setIsDeleteModalOpen(true);
                      }}
                      disabled={isDeleting}
                      className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                      <Trash2 size={16} />
                      Xóa học viên
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="px-5 space-y-6">
          {/* Profile Hero */}
          <section className="flex flex-col items-center text-center space-y-4 pt-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-[#A3B18A] overflow-hidden shadow-xl bg-white/10 flex items-center justify-center text-4xl font-bold">
                {student.avatar ? (
                  <img alt={student.name} className="w-full h-full object-cover" src={student.avatar} />
                ) : (
                  student.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute bottom-1 right-1 bg-yellow-400 p-2 rounded-full border-2 border-[#3A5A42]">
                <Zap size={16} className="text-[#3A5A42] fill-current" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{student.name}</h2>
              <p className="text-[#A3B18A] font-medium uppercase tracking-widest text-xs mt-1">
                {student.rank ? `Rank ${student.rank}` : 'Chưa xếp hạng'}
              </p>
            </div>
          </section>

          {/* Student Details Grid */}
          <section className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-full text-[#A3B18A]">
                <Mic size={18} />
              </div>
              <div>
                <p className="text-[10px] opacity-70 uppercase font-bold">Loại giọng</p>
                <p className="font-semibold text-sm">{student.voiceType || 'Chưa cập nhật'}</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-full text-[#A3B18A]">
                <Activity size={18} />
              </div>
              <div>
                <p className="text-[10px] opacity-70 uppercase font-bold">Range</p>
                <p className="font-semibold text-sm">
                  {student.lowestNote && student.highestNote 
                    ? `${student.lowestNote} - ${student.highestNote}` 
                    : (student.lowestNote || student.highestNote || 'Chưa cập nhật')}
                </p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-full text-[#A3B18A]">
                <BookOpen size={18} />
              </div>
              <div>
                <p className="text-[10px] opacity-70 uppercase font-bold">Lớp</p>
                <p className="font-semibold text-sm">{student.className || 'Chưa cập nhật'}</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-full text-[#A3B18A]">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[10px] opacity-70 uppercase font-bold">Năm sinh</p>
                <p className="font-semibold text-sm">{student.birthYear || 'Chưa cập nhật'}</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-3 col-span-2">
              <div className="p-2 bg-white/10 rounded-full text-[#A3B18A]">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-[10px] opacity-70 uppercase font-bold">Số điện thoại</p>
                <p className="font-semibold text-sm">{student.phone || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </section>

          {/* Tabs */}
          <nav className="flex space-x-2 overflow-x-auto py-2 scrollbar-hide">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-all ${activeTab === 'overview' ? 'bg-[#A3B18A] text-[#3A5A42]' : 'bg-white/10 backdrop-blur-md border border-white/20'}`}
            >
              Tổng quan
            </button>
            <button 
              onClick={() => setActiveTab('songs')}
              className={`px-6 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-all ${activeTab === 'songs' ? 'bg-[#A3B18A] text-[#3A5A42]' : 'bg-white/10 backdrop-blur-md border border-white/20'}`}
            >
              Bài hát
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-all ${activeTab === 'history' ? 'bg-[#A3B18A] text-[#3A5A42]' : 'bg-white/10 backdrop-blur-md border border-white/20'}`}
            >
              Lịch sử buổi học
            </button>
            <button 
              onClick={() => setActiveTab('evaluation')}
              className={`px-6 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-all ${activeTab === 'evaluation' ? 'bg-[#A3B18A] text-[#3A5A42]' : 'bg-white/10 backdrop-blur-md border border-white/20'}`}
            >
              Đánh giá AI
            </button>
          </nav>

          {activeTab === 'overview' && (
            <>
              {/* AI Evaluation Result Summary */}
              {student.voiceTest && (
                <section className="space-y-3">
                  <div className="flex justify-between items-end">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#A3B18A] flex items-center gap-1"><Zap size={14} /> Phân tích AI</h3>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-[10px] opacity-70 uppercase font-bold">Xếp hạng</p>
                        <p className="text-2xl font-bold text-yellow-400">{student.voiceTest.system_output.rank}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] opacity-70 uppercase font-bold">Tổng điểm</p>
                        <p className="text-xl font-bold">{student.voiceTest.system_output.total_score}/40</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] opacity-70 uppercase font-bold mb-1">Vấn đề hiện tại</p>
                        <ul className="list-disc pl-4 text-sm space-y-1">
                          {student.voiceTest.system_output.issues.slice(0, 2).map((issue: string, i: number) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <button onClick={() => setActiveTab('evaluation')} className="text-xs font-bold text-yellow-400 uppercase flex items-center gap-1">Xem chi tiết <ArrowLeft size={12} className="rotate-180" /></button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Progress Chart */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#A3B18A]">Tiến độ luyện tập tuần</h3>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6">
                  <div className="flex items-end justify-between h-32 space-x-2">
                    {[
                      { day: 'T2', height: '60%' },
                      { day: 'T3', height: '40%' },
                      { day: 'T4', height: '90%' },
                      { day: 'T5', height: '75%' },
                      { day: 'T6', height: '85%' },
                      { day: 'T7', height: '30%' },
                    ].map((item, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center space-y-2">
                        <div className="w-full bg-white/10 rounded-t-lg h-24 relative overflow-hidden">
                          <div className="absolute bottom-0 w-full bg-[#A3B18A]" style={{ height: item.height }}></div>
                        </div>
                        <span className="text-[10px] opacity-60 uppercase">{item.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === 'history' && (
            <LessonHistoryTab student={student} isAdmin={isAdmin} focusLessonId={focusLessonId} onLessonsChange={loadLessonsCallback} />
          )}

          {activeTab === 'evaluation' && (
            <section className="space-y-4">
              {student.voiceTest ? (
                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-yellow-400 flex items-center justify-center text-[#3A5A42] font-black text-3xl shadow-lg">
                          {student.voiceTest.system_output.rank}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold">Xếp hạng {student.voiceTest.system_output.rank}</h4>
                          <p className="text-sm opacity-70">Tổng điểm: {student.voiceTest.system_output.total_score}/40</p>
                        </div>
                      </div>
                      {isAdmin && (
                        <button onClick={() => setIsAIModalOpen(true)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                          <Edit2 size={18} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <p className="text-[10px] opacity-70 uppercase font-bold mb-1">Loại giọng</p>
                        <p className="font-bold text-yellow-400">{student.voiceTest.system_output.voice_type}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <p className="text-[10px] opacity-70 uppercase font-bold mb-1">Thời lượng khóa học</p>
                        <p className="font-bold text-yellow-400">{student.voiceTest.system_output.course_duration}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h5 className="text-xs font-bold uppercase text-[#A3B18A] mb-2">Vấn đề hiện tại</h5>
                        <ul className="space-y-2">
                          {student.voiceTest.system_output.issues.map((issue: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0"></div>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold uppercase text-[#A3B18A] mb-2">Định hướng phát triển</h5>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-sm leading-relaxed">
                          {student.voiceTest.system_output.recommendation}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6">
                    <h5 className="text-xs font-bold uppercase text-[#A3B18A] mb-4">Thông số kỹ thuật</h5>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                      {[
                        { label: 'Pitch', value: student.voiceTest.technical_score.pitch },
                        { label: 'Breath', value: student.voiceTest.technical_score.breath },
                        { label: 'Tone', value: student.voiceTest.technical_score.tone },
                        { label: 'Range', value: student.voiceTest.technical_score.range },
                      ].map((stat, i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold uppercase">
                            <span className="opacity-70">{stat.label}</span>
                            <span>{stat.value}/10</span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${stat.value * 10}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center">
                  <Zap className="mx-auto mb-3 opacity-20" size={48} />
                  <p className="opacity-60 mb-6">Chưa có dữ liệu đánh giá AI</p>
                  {isAdmin && (
                    <button 
                      onClick={() => setIsAIModalOpen(true)}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 mx-auto"
                    >
                      <Sparkles size={18} /> Bắt đầu đánh giá
                    </button>
                  )}
                </div>
              )}
            </section>
          )}

          {activeTab === 'songs' && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
               <h3 className="text-sm font-semibold uppercase tracking-wider text-[#A3B18A] mb-4 text-center">Danh sách bài hát đã học</h3>
               {lessons.filter(l => l.bai_hat_luyen && l.bai_hat_luyen.toLowerCase() !== 'chưa giao').length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {lessons.filter(l => l.bai_hat_luyen && l.bai_hat_luyen.toLowerCase() !== 'chưa giao').map(lesson => (
                     <div 
                        key={lesson._id} 
                        onClick={() => { setFocusLessonId(lesson._id!); setActiveTab('history'); }}
                        className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl cursor-pointer hover:bg-white/20 transition-all flex items-center justify-between"
                     >
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-[#A3B18A] flex items-center justify-center text-[#3A5A42] shrink-0"><Music size={18}/></div>
                         <div>
                           <p className="font-bold text-sm">{lesson.bai_hat_luyen}</p>
                           <p className="text-[10px] text-white/60">Buổi {lesson.so_buoi || '?'} - {new Date(lesson.date).toLocaleDateString('vi-VN')}</p>
                         </div>
                       </div>
                       <ChevronRight size={18} className="text-white/50 shrink-0" />
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center p-10">
                   <Music className="mx-auto mb-3 opacity-20" size={48} />
                   <p className="opacity-60">Chưa có bài hát nào được ghi nhận</p>
                 </div>
               )}
            </div>
          )}
        </main>

        {/* Bottom Action */}
        <footer className="fixed bottom-6 left-0 right-0 px-5 z-50">
          <button className="w-full bg-[#A3B18A] text-[#3A5A42] font-bold py-4 rounded-2xl shadow-2xl flex items-center justify-center space-x-2 transition-transform active:scale-95">
            <CalendarCheck size={20} />
            <span>Xem lịch học hôm nay</span>
          </button>
        </footer>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Xóa học viên"
        message="Bạn có chắc chắn muốn xóa học viên này? Hành động này không thể hoàn tác."
        confirmText="Xóa học viên"
        isLoading={isDeleting}
      />

      {student && (
        <EditStudentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            // Real-time listener will update the profile
          }}
          student={student}
        />
      )}

      {student && (
        <AIEvaluationModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          onSuccess={() => {
            // Real-time listener will update the profile
          }}
          student={student}
        />
      )}
    </div>
  );
}
