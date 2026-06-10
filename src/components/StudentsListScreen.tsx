import { useState, useEffect, useRef } from 'react';
import { Search, GraduationCap, Calendar, Users, Settings, Filter, ChevronRight, UserPlus, LogIn, Trash2, CheckSquare, X, Check, PlayCircle } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import AddStudentModal from './AddStudentModal';
import ConfirmModal from './ConfirmModal';
import { studentService, MongoStudent } from '../services/studentService';
import { useAuth } from '../contexts/AuthContext';

export default function StudentsListScreen({ onNavigate }: { onNavigate: (screen: string, id?: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<MongoStudent[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isDeleteSelectedModalOpen, setIsDeleteSelectedModalOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { userEmail, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {

    setIsLoading(true);
    const unsubscribeStudents = studentService.subscribeToStudents(
      (data) => {
        setStudents(data);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching students: ", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribeStudents();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      setIsLoading(true);
      await studentService.deleteAllStudents();
      setIsDeleteAllModalOpen(false);
      alert('Đã xoá tất cả học viên thành công.');
    } catch (error) {
      console.error('Error deleting all students:', error);
      alert('Có lỗi xảy ra khi xoá tất cả học viên.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      setIsLoading(true);
      await studentService.deleteMultipleStudents(Array.from(selectedIds));
      setIsDeleteSelectedModalOpen(false);
      setIsSelectionMode(false);
      setSelectedIds(new Set());
      alert(`Đã xoá ${selectedIds.size} học viên thành công.`);
    } catch (error) {
      console.error('Error deleting selected students:', error);
      alert('Có lỗi xảy ra khi xoá học viên đã chọn.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTouchStart = (id: string) => {
    if (!isAdmin || isSelectionMode) return;
    timerRef.current = setTimeout(() => {
      setIsSelectionMode(true);
      setSelectedIds(new Set([id]));
    }, 500);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStudentClick = (id: string) => {
    if (isSelectionMode) {
      const newSelected = new Set(selectedIds);
      if (newSelected.has(id)) {
        newSelected.delete(id);
        if (newSelected.size === 0) {
          setIsSelectionMode(false);
        }
      } else {
        newSelected.add(id);
      }
      setSelectedIds(newSelected);
    } else {
      onNavigate('student', id);
    }
  };

  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    return student.name.toLowerCase().includes(query) || 
           (student.studentCode && student.studentCode.toLowerCase().includes(query)) ||
           (student._id && student._id.toLowerCase().includes(query));
  });

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#F5F2E9] pb-24 font-sans">
      
      <div className="relative z-10 flex flex-col w-full h-full">
        {/* Header */}
        <div className="bg-[#3A5A42] px-4 pt-8 pb-6 rounded-b-[2rem] shadow-md transition-all">
          <div className="flex items-center justify-between mb-6">
            {isSelectionMode ? (
              <>
                <div className="flex items-center gap-3">
                  <button onClick={() => { setIsSelectionMode(false); setSelectedIds(new Set()); }} className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors">
                    <X size={20} />
                  </button>
                  <h1 className="text-xl font-bold text-white">Đã chọn {selectedIds.size}</h1>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => {
                    if (selectedIds.size === filteredStudents.length) {
                      setSelectedIds(new Set());
                      setIsSelectionMode(false);
                    } else {
                      setSelectedIds(new Set(filteredStudents.map(s => s._id)));
                    }
                  }} className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl transition-colors text-sm font-bold flex items-center gap-2">
                    <CheckSquare size={16} /> {selectedIds.size === filteredStudents.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                  <button onClick={() => setIsDeleteSelectedModalOpen(true)} disabled={selectedIds.size === 0} className="bg-red-500/80 hover:bg-red-500 disabled:opacity-50 disabled:hover:bg-red-500/80 text-white p-2 rounded-full transition-colors" title="Xoá đã chọn">
                    <Trash2 size={20} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-white">Quản lý Học viên</h1>
                <div className="flex gap-2">
                  {!userEmail ? (
                    <button onClick={handleLogin} className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl transition-colors text-sm font-bold flex items-center gap-2">
                      <LogIn size={16} /> Đăng nhập
                    </button>
                  ) : isAdmin ? (
                    <>
                      <button onClick={() => setIsDeleteAllModalOpen(true)} className="bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full transition-colors" title="Xoá tất cả học viên">
                        <Trash2 size={20} />
                      </button>
                      <button onClick={async () => {
                          try {
                            setIsLoading(true);
                            await studentService.seedMockData();
                          } catch (e) {
                            console.error(e);
                            alert('Có lỗi xảy ra khi đồng bộ dữ liệu.');
                          } finally {
                            setIsLoading(false);
                          }
                      }} className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl transition-colors text-sm font-bold flex items-center gap-2" title="Đồng bộ Google Sheet">
                        Đồng bộ Google Sheet
                      </button>
                      <button onClick={() => setIsAddModalOpen(true)} className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors" title="Thêm học viên mới">
                        <UserPlus size={20} />
                      </button>
                    </>
                  ) : null}
                </div>
              </>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative flex items-center">
            <div className="absolute left-4 text-[#3A5A42]/60">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên hoặc mã học viên (VD: HV001)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white py-3.5 pl-12 pr-12 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C5A059] shadow-sm"
            />
            <button className="absolute right-4 text-[#3A5A42]/60 hover:text-[#3A5A42] transition-colors">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 mt-6 mb-4 flex gap-3">
          <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-[#3A5A42]">{students.length}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Tổng số</span>
          </div>
          <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-[#C5A059]">{students.filter(s => s.status === 'Đang học' || !s.status).length}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Đang học</span>
          </div>
          <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-slate-400">{students.filter(s => s.status === 'Bảo lưu').length}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Bảo lưu</span>
          </div>
        </div>

        {/* Student List */}
        <main className="flex-1 px-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Danh sách học viên ({filteredStudents.length})</h3>
          </div>
          
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-10 text-slate-500">Đang tải danh sách...</div>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <div 
                  key={student._id} 
                  className={`flex items-center gap-4 bg-white p-4 rounded-2xl border ${selectedIds.has(student._id) ? 'border-[#3A5A42] bg-[#3A5A42]/5' : 'border-slate-100'} shadow-sm hover:shadow-md transition-all cursor-pointer group select-none`}
                  onClick={() => handleStudentClick(student._id)}
                  onMouseDown={() => handleTouchStart(student._id)}
                  onMouseUp={handleTouchEnd}
                  onMouseLeave={handleTouchEnd}
                  onTouchStart={() => handleTouchStart(student._id)}
                  onTouchEnd={handleTouchEnd}
                >
                  {isSelectionMode && (
                    <div className="shrink-0 mr-1">
                      <div className={`size-6 rounded-md border-2 flex items-center justify-center transition-colors ${selectedIds.has(student._id) ? 'bg-[#3A5A42] border-[#3A5A42] text-white' : 'border-slate-300 bg-white'}`}>
                        {selectedIds.has(student._id) && <Check size={16} strokeWidth={3} />}
                      </div>
                    </div>
                  )}
                  <div className="relative">
                    <div className="size-14 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-500 border-2 border-slate-100 group-hover:border-[#C5A059]/50 transition-colors overflow-hidden">
                      {student.avatar ? (
                        <img alt={student.name} className="w-full h-full object-cover" src={student.avatar} />
                      ) : (
                        student.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    {student.online && (
                      <span className="absolute bottom-0 right-0 size-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-slate-900">{student.name}</p>
                      <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wider">{student.studentCode || student._id.substring(0, 6)}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{student.voiceType || 'Chưa phân loại giọng'}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        student.status === 'Đang học' ? 'bg-green-50 text-green-700' : 
                        student.status === 'Bảo lưu' ? 'bg-amber-50 text-amber-700' : 
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {student.status || 'Đang học'}
                      </span>
                    </div>
                  </div>
                  {isAdmin && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('lesson', student._id);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C5A059] text-white hover:bg-[#B38D46] transition-colors shadow-sm shrink-0"
                    >
                      <PlayCircle size={14} /> Hôm nay
                    </button>
                  )}
                  <div className="shrink-0 text-slate-300 group-hover:text-[#C5A059] transition-colors">
                    <ChevronRight size={20} />
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                  <Search size={32} />
                </div>
                <h3 className="text-slate-700 font-bold mb-1">Không tìm thấy học viên</h3>
                <p className="text-sm text-slate-500">Thử tìm kiếm với từ khóa khác hoặc thêm học viên mới.</p>
              </div>
            )}
          </div>
        </main>

        {/* Bottom Nav */}
        <div className="fixed bottom-0 w-full p-4 pointer-events-none z-30">
          <div className="max-w-md mx-auto bg-[#F9FBF9]/95 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-2 flex items-center pointer-events-auto justify-between">
            <button onClick={() => onNavigate('home')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#4E6B56] transition-colors px-4 py-2">
              <GraduationCap size={24} />
              <p className="text-[10px] font-bold uppercase tracking-tight">Lớp học</p>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#4E6B56] transition-colors px-4 py-2">
              <Calendar size={24} />
              <p className="text-[10px] font-bold uppercase tracking-tight">Lịch dạy</p>
            </button>
            <button className="flex flex-col items-center gap-1 text-[#4E6B56] px-4 py-2">
              <Users size={24} />
              <p className="text-[10px] font-bold uppercase tracking-tight">Học viên</p>
            </button>
            {isAdmin && (
              <button onClick={() => onNavigate('admin')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#4E6B56] transition-colors px-4 py-2">
                <Settings size={24} />
                <p className="text-[10px] font-bold uppercase tracking-tight">Admin</p>
              </button>
            )}
          </div>
        </div>
      </div>
      <AddStudentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => {
          // Real-time listener will update the list
        }}
      />
      <ConfirmModal
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        onConfirm={handleDeleteAll}
        title="Xóa tất cả học viên"
        message="Bạn có chắc chắn muốn xoá TẤT CẢ học viên không? Hành động này không thể hoàn tác!"
        confirmText="Xóa tất cả"
        isLoading={isLoading}
      />
      <ConfirmModal
        isOpen={isDeleteSelectedModalOpen}
        onClose={() => setIsDeleteSelectedModalOpen(false)}
        onConfirm={handleDeleteSelected}
        title="Xóa học viên đã chọn"
        message={`Bạn có chắc chắn muốn xoá ${selectedIds.size} học viên đã chọn không? Hành động này không thể hoàn tác!`}
        confirmText="Xóa đã chọn"
        isLoading={isLoading}
      />
    </div>
  );
}
