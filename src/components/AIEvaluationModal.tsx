import React, { useState } from 'react';
import { X, Sparkles, Activity, Mic2, User, Star } from 'lucide-react';
import { aiService, VoiceTestInput } from '../services/aiService';
import { studentService, MongoStudent } from '../services/studentService';

interface AIEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: MongoStudent;
  onSuccess: () => void;
}

export default function AIEvaluationModal({ isOpen, onClose, student, onSuccess }: AIEvaluationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<1 | 2>(1); // 1: Input, 2: Result
  const [result, setResult] = useState<any>(null);

  // Form state
  const [gender, setGender] = useState<"Nam" | "Nữ">("Nam");
  const [experience, setExperience] = useState<"Chưa học" | "Cơ bản" | "Biểu diễn">("Chưa học");
  const [lowestNote, setLowestNote] = useState(student.lowestNote || 'C3');
  const [highestNote, setHighestNote] = useState(student.highestNote || 'A4');
  const [tessitura, setTessitura] = useState('E3-G4');
  const [timbre, setTimbre] = useState<"Sáng" | "Trung tính" | "Tối">("Sáng");
  const [thickness, setThickness] = useState<"Mỏng" | "Trung bình" | "Dày">("Trung bình");
  const [passaggioNote, setPassaggioNote] = useState('F4');
  
  const [pitch, setPitch] = useState(7);
  const [breath, setBreath] = useState(6);
  const [tone, setTone] = useState(7);
  const [rangeScore, setRangeScore] = useState(6);

  React.useEffect(() => {
    if (isOpen && student) {
      setLowestNote(student.lowestNote || 'C3');
      setHighestNote(student.highestNote || 'A4');
      setStep(1);
      setResult(null);
      setError('');
    }
  }, [isOpen]);

  const handleEvaluate = async (e: React.FormEvent) => {
    setIsLoading(true);
    setError('');

    try {
      const input: VoiceTestInput = {
        student_info: {
          name: student.name,
          gender,
          age: student.birthYear ? new Date().getFullYear() - parseInt(student.birthYear) : 20,
          experience
        },
        voice_test: {
          lowest_note: lowestNote,
          highest_note: highestNote,
          tessitura,
          timbre,
          thickness,
          passaggio_note: passaggioNote
        },
        technical_score: {
          pitch,
          breath,
          tone,
          range: rangeScore
        }
      };

      const aiResult = await aiService.evaluateVoiceTest(input);
      setResult(aiResult);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi đánh giá AI');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveResult = async () => {
    setIsLoading(true);
    try {
      await studentService.updateStudent(student._id, {
        voiceTest: result,
        voiceType: result.system_output.voice_type,
        rank: result.system_output.rank,
        lowestNote: result.voice_test.lowest_note,
        highestNote: result.voice_test.highest_note
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu kết quả');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 text-black">
            <Sparkles size={20} className="text-indigo-600" />
            <h3 className="font-bold text-lg">AI Đánh giá Giọng hát</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form id="ai-eval-form" onSubmit={handleEvaluate} className="space-y-6">
              {/* Thông tin cơ bản */}
              <div>
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><User size={16}/> Thông tin cơ bản</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Giới tính</label>
                    <select value={gender} onChange={(e: any) => setGender(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kinh nghiệm</label>
                    <select value={experience} onChange={(e: any) => setExperience(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="Chưa học">Chưa học</option>
                      <option value="Cơ bản">Cơ bản</option>
                      <option value="Biểu diễn">Biểu diễn</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Thông số giọng */}
              <div>
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Mic2 size={16}/> Thông số giọng</h4>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nốt trầm nhất</label>
                    <input type="text" value={lowestNote} onChange={(e) => setLowestNote(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nốt cao nhất</label>
                    <input type="text" value={highestNote} onChange={(e) => setHighestNote(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nốt chuyển giọng (Passaggio)</label>
                    <input type="text" value={passaggioNote} onChange={(e) => setPassaggioNote(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="VD: F4" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Quãng giọng thoải mái (Tessitura)</label>
                    <input type="text" value={tessitura} onChange={(e) => setTessitura(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="VD: E3-G4" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Âm sắc đặc trưng (Timbre)</label>
                    <select value={timbre} onChange={(e: any) => setTimbre(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="Sáng">Sáng</option>
                      <option value="Trung tính">Trung tính</option>
                      <option value="Tối">Tối</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Độ dày âm thanh (Thickness)</label>
                    <select value={thickness} onChange={(e: any) => setThickness(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="Mỏng">Mỏng</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Dày">Dày</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Điểm kỹ thuật */}
              <div>
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Activity size={16}/> Chấm điểm kỹ thuật (1-10)</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Độ chuẩn cao độ (Pitch)</label>
                    <input type="number" min="1" max="10" value={pitch} onChange={(e) => setPitch(Number(e.target.value))} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kỹ thuật hơi thở (Breath)</label>
                    <input type="number" min="1" max="10" value={breath} onChange={(e) => setBreath(Number(e.target.value))} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Chất lượng âm sắc (Tone)</label>
                    <input type="number" min="1" max="10" value={tone} onChange={(e) => setTone(Number(e.target.value))} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Độ rộng quãng giọng (Range)</label>
                    <input type="number" min="1" max="10" value={rangeScore} onChange={(e) => setRangeScore(Number(e.target.value))} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center">
                <h4 className="text-indigo-800 font-bold text-xl mb-2">Kết quả hệ thống</h4>
                <div className="flex justify-center gap-4 mt-4">
                  <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-indigo-100">
                    <p className="text-xs text-slate-500 uppercase font-bold">Phân loại giọng</p>
                    <p className="text-lg font-bold text-indigo-700">{result?.system_output?.voice_type}</p>
                  </div>
                  <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-indigo-100">
                    <p className="text-xs text-slate-500 uppercase font-bold">Tổng điểm</p>
                    <p className="text-lg font-bold text-indigo-700">{result?.system_output?.total_score}/40</p>
                  </div>
                  <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-indigo-100">
                    <p className="text-xs text-slate-500 uppercase font-bold">Xếp hạng</p>
                    <p className="text-lg font-bold text-indigo-700">{result?.system_output?.rank}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h5 className="font-bold text-slate-800 mb-2">Vấn đề hiện tại</h5>
                  <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                    {result?.system_output?.issues?.map((issue: string, i: number) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h5 className="font-bold text-slate-800 mb-2">Định hướng phát triển</h5>
                  <p className="text-sm text-slate-600 mb-2">{result?.system_output?.recommendation}</p>
                  <p className="text-sm font-semibold text-indigo-600">Thời lượng khóa học: {result?.system_output?.course_duration}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          {step === 1 ? (
            <>
              <button onClick={onClose} className="flex-1 py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors">
                Hủy
              </button>
              <button form="ai-eval-form" type="submit" disabled={isLoading} className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Sparkles size={18} /> Phân tích AI</>}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="flex-1 py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors">
                Làm lại
              </button>
              <button onClick={handleSaveResult} disabled={isLoading} className="flex-1 py-2.5 px-4 bg-[#3A5A42] hover:bg-[#2D4633] text-white font-bold rounded-xl transition-colors disabled:opacity-50">
                {isLoading ? 'Đang lưu...' : 'Lưu vào hồ sơ'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
