import React, { useState } from 'react';
import { X, User, Phone, Calendar, Mic2, Star, Activity, BookOpen } from 'lucide-react';
import { studentService } from '../services/studentService';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddStudentModal({ isOpen, onClose, onSuccess }: AddStudentModalProps) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Đang học');
  const [voiceType, setVoiceType] = useState('');
  const [rank, setRank] = useState('');
  const [lowestNote, setLowestNote] = useState('');
  const [highestNote, setHighestNote] = useState('');
  const [className, setClassName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const studentData: any = {
        name,
        attendance: []
      };
      if (status) studentData.status = status;
      if (voiceType) studentData.voiceType = voiceType;
      if (rank) studentData.rank = rank;
      if (lowestNote) studentData.lowestNote = lowestNote;
      if (highestNote) studentData.highestNote = highestNote;
      if (className) studentData.className = className;
      if (startDate) studentData.startDate = startDate;
      if (birthYear) studentData.birthYear = birthYear;

      await studentService.createStudent(studentData);
      onSuccess();
      onClose();
      // Reset form
      setName('');
      setStatus('Đang học');
      setVoiceType('');
      setRank('');
      setLowestNote('');
      setHighestNote('');
      setClassName('');
      setStartDate('');
      setBirthYear('');
    } catch (err: any) {
      console.error('Error adding student:', err);
      setError(err.message || 'Có lỗi xảy ra khi thêm học viên');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">Thêm Học Viên Mới</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Họ và tên *</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A5A42] focus:bg-white transition-all"
                  placeholder="Nhập họ tên học viên"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Trạng thái</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Activity size={18} />
                  </div>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A5A42] focus:bg-white transition-all appearance-none"
                  >
                    <option value="Đang học">Đang học</option>
                    <option value="Bảo lưu">Bảo lưu</option>
                    <option value="Nghỉ học">Nghỉ học</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Năm sinh</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Calendar size={18} />
                  </div>
                  <input 
                    type="number" 
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A5A42] focus:bg-white transition-all"
                    placeholder="VD: 1995"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Loại giọng</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mic2 size={18} />
                  </div>
                  <select 
                    value={voiceType}
                    onChange={(e) => setVoiceType(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A5A42] focus:bg-white transition-all appearance-none"
                  >
                    <option value="">Chọn loại giọng</option>
                    <option value="Nữ cao (Soprano)">Nữ cao (Soprano)</option>
                    <option value="Nữ trung (Mezzo-Soprano)">Nữ trung (Mezzo-Soprano)</option>
                    <option value="Nữ trầm (Alto)">Nữ trầm (Alto)</option>
                    <option value="Nam cao (Tenor)">Nam cao (Tenor)</option>
                    <option value="Nam trung (Baritone)">Nam trung (Baritone)</option>
                    <option value="Nam trầm (Bass)">Nam trầm (Bass)</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Rank</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Star size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A5A42] focus:bg-white transition-all"
                    placeholder="VD: Beginner"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Note thấp nhất</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Activity size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={lowestNote}
                    onChange={(e) => setLowestNote(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A5A42] focus:bg-white transition-all"
                    placeholder="VD: C3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Note cao nhất</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Activity size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={highestNote}
                    onChange={(e) => setHighestNote(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A5A42] focus:bg-white transition-all"
                    placeholder="VD: G5"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Lớp</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <BookOpen size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A5A42] focus:bg-white transition-all"
                    placeholder="VD: Thanh nhạc cơ bản"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Ngày bắt đầu</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Calendar size={18} />
                </div>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A5A42] focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 bg-[#3A5A42] hover:bg-[#2D4633] text-white font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Đang lưu...' : 'Lưu học viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
