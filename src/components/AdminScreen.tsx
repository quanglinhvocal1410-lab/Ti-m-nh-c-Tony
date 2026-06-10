import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { isAdmin, userEmail } = useAuth();

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#4E6B56] text-white p-4">
        <ShieldAlert size={64} className="mb-4 text-[#C5A059]" />
        <h1 className="text-2xl font-bold mb-2">Truy cập bị từ chối</h1>
        <p className="text-center text-white/80 mb-6">Bạn không có quyền truy cập vào bảng điều khiển Admin.</p>
        <button 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 px-6 py-3 bg-[#C5A059] text-white rounded-xl font-bold hover:bg-[#B38D46] transition-colors shadow-lg"
        >
          <ArrowLeft size={20} /> Quay lại trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 font-sans">
      <div className="sticky top-0 z-20 bg-white shadow-sm px-4 py-3 flex items-center gap-3">
        <button 
          onClick={() => onNavigate('home')}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-800">Admin Control Panel</h1>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">{userEmail}</p>
        </div>
      </div>

      <main className="flex-1 p-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Cài đặt hệ thống</h2>
          <p className="text-slate-500 text-sm mb-6">
            Tại đây bạn có thể quản lý các chức năng hệ thống, phân quyền người dùng, và xem báo cáo tổng quan.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-[#C5A059] hover:bg-[#C5A059]/5 transition-all text-slate-700">
              <span className="font-bold">Quản lý người dùng</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-[#C5A059] hover:bg-[#C5A059]/5 transition-all text-slate-700">
              <span className="font-bold">Cấu hình khóa học</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-[#C5A059] hover:bg-[#C5A059]/5 transition-all text-slate-700">
              <span className="font-bold">Báo cáo doanh thu</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-[#C5A059] hover:bg-[#C5A059]/5 transition-all text-slate-700">
              <span className="font-bold">Cài đặt API & Tích hợp</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
