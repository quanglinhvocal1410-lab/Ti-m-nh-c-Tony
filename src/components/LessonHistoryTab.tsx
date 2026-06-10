import React, { useState, useEffect, useRef } from 'react';
import { Plus, Video, FileText, Youtube, Star, Target, Calendar, Trash2, Edit2, ChevronDown, ChevronUp, Activity, Music, X, CheckSquare, ListTodo, TrendingUp, Award, Sparkles, Upload, Play, Mic, Loader2, Square, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { lessonService, Lesson, EvaluationCriterion } from '../services/lessonService';
import ConfirmModal from './ConfirmModal';
import { MongoStudent } from '../services/studentService';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { gasApi, isGAS } from '../utils/apiBridge';

interface LessonHistoryTabProps {
  student: MongoStudent;
  isAdmin: boolean;
  focusLessonId?: string | null;
  lessons: Lesson[];
  isLoadingLessons: boolean;
  onRefresh?: () => void;
}

export default function LessonHistoryTab({ student, isAdmin, focusLessonId, lessons, isLoadingLessons, onRefresh }: LessonHistoryTabProps) {
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [recordingState, setRecordingState] = useState<'idle' | 'recording'>('idle');
  const [activeRecordingLessonId, setActiveRecordingLessonId] = useState<string | null>(null);
  const [tempAudio, setTempAudio] = useState<{ blob: Blob, url: string, name: string } | null>(null);
  const [driveUrl, setDriveUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (student && student.driveLink) {
      setDriveUrl(student.driveLink);
    } else {
      setDriveUrl(null);
    }
  }, [student]);

  useEffect(() => {
    if (focusLessonId && lessons.length > 0) {
      setExpandedLesson(focusLessonId);
    }
  }, [focusLessonId, lessons.length]);

  const startRecording = async (lessonId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setActiveRecordingLessonId(lessonId);
      setTempAudio(null);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const name = `Luyen_Tap_${new Date().getTime()}.webm`;
        const url = URL.createObjectURL(audioBlob);
        setTempAudio({ blob: audioBlob, url, name });
        setRecordingState('idle');
      };

      mediaRecorder.start(1000); // Send data every 1 second
      setRecordingState('recording');
    } catch (err) {
      console.error("Lỗi mic:", err);
      alert("Không thể truy cập Microphone. Vui lòng cấp quyền Microphone trên trình duyệt.");
      setRecordingState('idle');
      setActiveRecordingLessonId(null);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleCancelRecording = () => {
    setTempAudio(null);
    setActiveRecordingLessonId(null);
  };

  const handleSaveRecording = async (lessonId: string) => {
    if (!tempAudio) return;
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(tempAudio.blob);
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        const dateStr = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
        const targetLesson = lessons.find(l => l._id === lessonId);
        const songName = targetLesson?.bai_hat_luyen || 'Chua_Cap_Nhat_Bai_Hat';
        const formattedFileName = `[${dateStr}].${songName}. [${student.name}].webm`;

        let resData;
        if (isGAS) {
          resData = await gasApi.call('uploadAudio', base64Data, formattedFileName, student.name, student.driveLink);
        } else {
          const formData = new FormData();
          const dummyFile = new File([tempAudio.blob], formattedFileName, { type: 'audio/webm' });
          formData.append('audio', dummyFile);
          formData.append('studentName', student.name);
          formData.append('driveLink', student.driveLink || '');
          const res = await axios.post('/api/audio/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          resData = res.data;
        }

        if (resData && resData.fileUrl) {
          const newAudio = { name: formattedFileName, url: resData.fileUrl };
          const targetLesson = lessons.find(l => l._id === lessonId);
          if (targetLesson) {
            const currentAudios = targetLesson.audios ? (typeof targetLesson.audios === 'string' ? JSON.parse(targetLesson.audios) : targetLesson.audios) : [];
            const updatedAudios = [...currentAudios, newAudio];
            
            await lessonService.updateLesson(lessonId, { audios: JSON.stringify(updatedAudios) });
            
            if (resData.folderUrl) setDriveUrl(resData.folderUrl);
            onRefresh?.();
            alert('Lưu ghi âm thành công!');
          }
        }
        setTempAudio(null);
        setActiveRecordingLessonId(null);
        setIsUploading(false);
      };
    } catch (error) {
      console.error("Lỗi upload ghi âm:", error);
      alert('Tải bản ghi âm thất bại.');
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!lessonToDelete) return;
    try {
      await lessonService.deleteLesson(lessonToDelete);
      setIsDeleteModalOpen(false);
      setLessonToDelete(null);
      onRefresh?.();
    } catch (error) {
      console.error("Error deleting lesson:", error);
    }
  };

  if (isLoadingLessons) {
    return <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#A3B18A]">Lịch sử buổi học</h3>
        {driveUrl && (
          <a href={driveUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1.5 border border-teal-200 bg-teal-50 px-3 py-2 rounded-xl transition-colors shadow-sm">
            <ExternalLink size={14} /> Đi đến Drive của bạn
          </a>
        )}
      </div>

      {/* DANH SÁCH LỊCH SỬ BUỔI HỌC (Thu gọn) */}
      <div className="space-y-4">
        {lessons.map((lesson, index) => {
          let lessonAudios: {name: string, url: string}[] = [];
          if (lesson.audios) {
            try {
              const parsed = typeof lesson.audios === 'string' ? JSON.parse(lesson.audios) : lesson.audios;
              if (Array.isArray(parsed)) {
                lessonAudios = parsed;
              }
            } catch (e) {
              console.error("Error parsing audios for lesson", lesson._id, e);
            }
          }
          return (
          <div key={lesson._id} className="bg-white text-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100">
            <div 
              className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedLesson(expandedLesson === lesson._id ? null : lesson._id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F0E4] flex flex-col items-center justify-center text-[#3A5A42]">
                  <span className="text-[10px] font-bold uppercase leading-none mb-0.5">Buổi</span>
                  <span className="text-xl font-black leading-none">{lesson.so_buoi || (lessons.length - index)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-900 text-lg">Ngày {new Date(lesson.date).toLocaleDateString('vi-VN')}</h4>
                    {lesson.bai_hat_luyen && lesson.bai_hat_luyen.toLowerCase() !== 'chưa giao' && (
                      <span className="text-sm font-semibold text-[#3A5A42] bg-[#A3B18A]/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Music size={12} /> {lesson.bai_hat_luyen}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex font-bold text-sm items-center gap-1">
                      <Award size={14} className={lesson.diem_trung_binh && lesson.diem_trung_binh >= 4 ? "text-yellow-500" : "text-slate-400"} /> 
                      <span className={lesson.diem_trung_binh && lesson.diem_trung_binh >= 4 ? "text-yellow-600" : "text-slate-600"}>
                        {lesson.diem_trung_binh || (lesson.score ? lesson.score/2 : 0)}/5
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={() => { setLessonToDelete(lesson._id); setIsDeleteModalOpen(true); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={16}/></button>
                  </div>
                )}
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400">
                  {expandedLesson === lesson._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
            </div>

            {expandedLesson === lesson._id && (
              <div className="px-5 pb-6 pt-0 border-t border-slate-100 mt-2">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {/* Điểm số & Radar Chart */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 col-span-1 md:col-span-2 flex flex-col md:flex-row gap-4">
                      <div className="flex-1 flex flex-col justify-center items-center text-center bg-white p-4 rounded-xl shadow-sm">
                        <div className="text-xs font-bold text-slate-500 uppercase mb-2">Điểm Trung Bình</div>
                        <div className="text-5xl font-black text-[#3A5A42]">{lesson.diem_trung_binh || 0}<span className="text-lg font-bold text-slate-400">/5</span></div>
                        <div className={`text-sm font-bold uppercase mt-2 ${lesson.xep_loai === 'Rất tốt' ? 'text-green-600' : lesson.xep_loai === 'Tốt' ? 'text-blue-600' : lesson.xep_loai === 'Trung bình' ? 'text-yellow-600' : 'text-red-600'}`}>{lesson.xep_loai || 'Chưa xếp loại'}</div>
                      </div>
                      
                      <div className="flex-[2] min-h-[220px] w-full bg-white rounded-xl shadow-sm p-4 flex items-center justify-center">
                        {(() => {
                           const radarData: any[] = [];
                           if (lesson.evaluations) {
                             try {
                                const evals = typeof lesson.evaluations === 'string' ? JSON.parse(lesson.evaluations) : lesson.evaluations;
                                if (Array.isArray(evals)) {
                                   evals.forEach((ev: any) => {
                                      radarData.push({ subject: ev.tieu_chi, A: ev.gia_tri, fullMark: 5 });
                                   });
                                }
                             } catch (e) {}
                           }
                           
                           return radarData.length > 2 ? (
                             <ResponsiveContainer width="100%" height={220}>
                               <RadarChart data={radarData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                 <PolarGrid gridType="polygon" />
                                 <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#64748b' }} />
                                 <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                                 <Radar name="Học viên" dataKey="A" stroke="#3A5A42" strokeWidth={2} fill="#A3B18A" fillOpacity={0.6} />
                               </RadarChart>
                             </ResponsiveContainer>
                           ) : (
                             <div className="text-xs text-slate-400">Không đủ dữ liệu đánh giá để vẽ biểu đồ Radar</div>
                           );
                        })()}
                      </div>
                    </div>

                    {/* Đánh giá & Ghi chú */}
                    {(lesson.teacherNotes || lesson.diem_manh || lesson.diem_yeu) && (
                      <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 col-span-1 md:col-span-2">
                         <h6 className="font-bold text-sm mb-2 text-indigo-800 flex items-center gap-2"><FileText size={16}/> Ghi chú của giáo viên</h6>
                         <p className="text-sm text-slate-700 whitespace-pre-line">
                           {lesson.teacherNotes || 
                            [
                              lesson.diem_manh ? `Điểm mạnh: ${lesson.diem_manh}` : '',
                              lesson.diem_yeu ? `Điểm yếu: ${lesson.diem_yeu}` : ''
                            ].filter(Boolean).join('\n') || "Không có ghi chú"}
                         </p>
                      </div>
                    )}

                    {lesson.ghi_chu_ky_thuat && (
                      <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 col-span-1 md:col-span-2">
                         <h6 className="font-bold text-sm mb-2 text-blue-800 flex items-center gap-2"><FileText size={16}/> Ghi chú kỹ thuật</h6>
                         <p className="text-sm text-slate-700 whitespace-pre-line">{lesson.ghi_chu_ky_thuat}</p>
                      </div>
                    )}

                    {/* Bài Tập Về Nhà */}
                    <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 col-span-1 md:col-span-2">
                       <h6 className="font-bold text-sm mb-3 text-orange-800 flex items-center gap-2"><CheckSquare size={16}/> Bài tập về nhà</h6>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                           <span className="text-[10px] font-bold text-orange-600 uppercase block mb-1">Luyện thanh:</span>
                           <p className="text-sm font-medium">{lesson.bai_tap_luyen_thanh || "Theo giáo trình"}</p>
                         </div>
                          <div>
                            <span className="text-[10px] font-bold text-orange-600 uppercase block mb-1">Thời gian luyện (Daily Checklist):</span>
                            <ul className="text-sm font-medium list-disc ml-4 space-y-1">
                              {(lesson.thoi_gian_luyen_hang_ngay || "20-30 phút/ngày").split('\n').filter(item => item.trim()).map((item, idx) => (
                                <li key={idx}>{item.replace(/^[\-\•\*]\s*/, '')}</li>
                              ))}
                            </ul>
                          </div>
                         <div className="sm:col-span-2">
                           <span className="text-[10px] font-bold text-orange-600 uppercase block mb-1">Bài hát:</span>
                           <p className="text-sm font-black text-slate-800">{lesson.bai_hat_luyen || "Chưa giao"}</p>
                           {lesson.songNotes && <p className="text-xs text-slate-500 mt-1">{lesson.songNotes}</p>}
                         </div>
                       </div>
                    </div>

                    {/* Kế Hoạch Buổi Sau */}
                    <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 col-span-1 md:col-span-2">
                       <h6 className="font-bold text-sm mb-3 text-purple-800 flex items-center gap-2"><TrendingUp size={16}/> Kế hoạch buổi sau</h6>
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                         <div>
                           <span className="text-[10px] font-bold text-purple-600 uppercase block mb-1">Trọng tâm:</span>
                           <p className="text-sm">{lesson.trong_tam || "---"}</p>
                         </div>
                         <div>
                           <span className="text-[10px] font-bold text-purple-600 uppercase block mb-1">Kỹ thuật:</span>
                           <p className="text-sm">{lesson.ky_thuat_can_day || "---"}</p>
                         </div>
                         <div>
                           <span className="text-[10px] font-bold text-purple-600 uppercase block mb-1">Mục tiêu:</span>
                           <p className="text-sm font-bold text-purple-900">{lesson.muc_tieu || "---"}</p>
                         </div>
                       </div>
                    </div>
                 </div>

                 {/* Ghi Âm Section */}
                 <div className="mt-4 p-4 border border-emerald-100 rounded-2xl bg-emerald-50/30">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 border-b border-emerald-200/50 pb-2 gap-2">
                     <h6 className="font-bold text-sm text-emerald-800 flex items-center gap-2">
                       <Mic size={14}/> File Ghi Âm
                       {driveUrl && (
                         <a href={driveUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-800 underline ml-2 font-normal">
                           (Đi đến Drive của bạn)
                         </a>
                       )}
                     </h6>
                     <div className="flex gap-2">
                       {isAdmin && (
                         recordingState === 'idle' || activeRecordingLessonId !== lesson._id ? (
                           <button onClick={(e) => { e.stopPropagation(); startRecording(lesson._id!); }} disabled={(isUploading && activeRecordingLessonId === lesson._id) || (tempAudio !== null && activeRecordingLessonId === lesson._id)} className="text-xs font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                             <Mic size={12}/> Thu Âm Trực Tiếp
                           </button>
                         ) : (
                           <button onClick={(e) => { e.stopPropagation(); stopRecording(); }} className="text-xs font-semibold bg-red-500 text-white px-4 py-1.5 rounded-lg flex items-center gap-2 animate-pulse border border-red-300 shadow-md">
                             <Square size={12} fill="currentColor"/> Dừng Thu Âm
                           </button>
                         )
                       )}
                     </div>
                   </div>

                   {tempAudio && activeRecordingLessonId === lesson._id && (
                     <div className="mb-4 p-3 bg-white border border-emerald-200 rounded-xl flex flex-col gap-3 shadow-sm">
                       <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                         <span className="relative flex h-3 w-3">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                         </span>
                         Bản thu âm nháp (Chưa lưu)
                       </div>
                       <audio src={tempAudio.url} controls className="w-full h-10" />
                       <div className="flex justify-end gap-2 mt-1">
                         <button onClick={handleCancelRecording} className="text-xs font-medium px-4 py-1.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition">Xóa</button>
                         <button onClick={() => handleSaveRecording(lesson._id!)} disabled={isUploading} className="text-xs font-semibold bg-emerald-600 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-700 transition flex items-center gap-1 disabled:opacity-70">
                           {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {isUploading ? 'Đang lưu...' : 'Lưu lên Drive'}
                         </button>
                       </div>
                     </div>
                   )}

                   {lessonAudios.length > 0 ? (
                     <div className="space-y-2">
                       {lessonAudios.map((au, idx) => (
                         <a key={idx} href={au.url} target="_blank" rel="noreferrer" className="text-emerald-700 hover:text-emerald-900 transition flex items-center gap-2 text-sm bg-white/50 hover:bg-white p-2.5 rounded-lg border border-emerald-100"><Play size={14} className="text-emerald-500"/> <span className="flex-1 truncate">{au.name}</span></a>
                       ))}
                     </div>
                   ) : (
                     <p className="text-xs text-slate-500 mt-2 font-medium italic">Chưa có bản ghi âm lưu lại.</p>
                   )}
                 </div>
              </div>
            )}
          </div>
        )})}
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Xóa buổi học"
        message="Bạn có chắc chắn muốn xóa lịch sử đánh giá buổi học này không? Hành động này không thể hoàn tác."
        confirmText="Xóa vĩnh viễn"
      />
    </div>
  );
}
