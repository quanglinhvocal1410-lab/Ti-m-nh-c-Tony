import { useState, useEffect } from 'react';
import { ArrowLeft, ShieldAlert, Users, Settings, BarChart, HardDrive } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserData {
  _id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export default function AdminScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { isAdmin, userEmail } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      } else {
        alert('Cập nhật quyền thất bại.');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật quyền:', error);
      alert('Đã có lỗi xảy ra.');
    }
  };

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
      <div className="sticky top-0 z-20 bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
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
      </div>

      <main className="flex-1 p-4 space-y-6">
        {/* Nav tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${activeTab === 'users' ? 'bg-[#3A5A42] text-white font-medium shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            <Users size={18} /> Quản lý tài khoản
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${activeTab === 'settings' ? 'bg-[#3A5A42] text-white font-medium shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            <Settings size={18} /> Cài đặt hệ thống
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Danh sách người dùng</h2>
              <p className="text-sm text-slate-500">Quản lý quyền truy cập của tất cả các tài khoản.</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Người dùng</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Vai trò</th>
                    <th className="px-4 py-3">Ngày tham gia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                        <div className="inline-block w-6 h-6 border-2 border-[#3A5A42] border-t-transparent rounded-full animate-spin mb-2"></div>
                        <p>Đang tải danh sách...</p>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                        Không có người dùng nào.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {user.name || 'Người dùng ẩn danh'}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {user.email}
                        </td>
                        <td className="px-4 py-3">
                          <select 
                            value={user.role} 
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            disabled={user.email === 'quanglinhvocal1410@gmail.com'}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg focus:ring-[#3A5A42] focus:border-[#3A5A42] block w-full p-2 disabled:opacity-50"
                          >
                            <option value="student">Học viên</option>
                            <option value="teacher">Giảng viên</option>
                            <option value="admin">Quản trị viên</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center py-12">
            <HardDrive size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Đang phát triển</h3>
            <p className="text-slate-500">Các tính năng cài đặt hệ thống sẽ sớm ra mắt.</p>
          </div>
        )}
      </main>
    </div>
  );
}
