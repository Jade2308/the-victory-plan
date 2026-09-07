import { useState } from 'react';
import { Cloud, Save, Download, LogIn, UserPlus, LogOut, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { Button } from './ui/Primitives.jsx';

export default function CloudSyncCard({ syncHook, localData, onImport }) {
  const theme = useTheme();
  const isLight = theme === 'light';
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    isConfigured, user, syncStatus, lastSynced, errorMessage,
    signUp, signIn, signOut, syncToCloud, pullFromCloud
  } = syncHook;

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePull = async () => {
    const cloudData = await pullFromCloud();
    if (cloudData) {
      onImport?.(cloudData);
      alert('Đã phục hồi dữ liệu từ đám mây.');
    }
  };

  const t = {
    card: isLight ? 'bg-white border-slate-200 text-slate-900 shadow-xs' : 'bg-[#0b1410] border-[#23372d] text-slate-100',
    text: isLight ? 'text-slate-900 font-bold' : 'text-slate-100 font-bold',
    sub: isLight ? 'text-slate-500' : 'text-slate-400',
    input: isLight
      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
      : 'bg-[#112019] border-[#2c4337] text-slate-100 placeholder-slate-500 focus:border-emerald-500',
    label: isLight ? 'text-slate-800 font-semibold' : 'text-slate-200 font-semibold',
    link: isLight ? 'text-emerald-600 font-medium hover:text-emerald-700' : 'text-emerald-400 font-medium hover:text-emerald-300',
    statusBg: isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#112019] border-[#23372d]',
  };

  if (!isConfigured) {
    return (
      <div className={`rounded-2xl border p-5 ${t.card}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#112019] flex items-center justify-center border border-slate-200 dark:border-[#23372d]">
            <Cloud className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <h3 className={`font-semibold text-sm ${t.text}`}>Đồng bộ Đám mây (Chưa cấu hình API)</h3>
            <p className={`text-xs ${t.sub}`}>Cần điền Supabase URL & Key trong file .env.local</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`rounded-2xl border p-5 ${t.card}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
            <Cloud className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className={`font-semibold ${t.text}`}>Đồng bộ Đám mây</h3>
            <p className={`text-xs ${t.sub}`}>Đăng nhập để sao lưu dữ liệu của bạn</p>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-3">
          <div>
            <label className={`block text-xs font-medium mb-1 ${t.label}`}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-sm transition-all focus:outline-none ${t.input}`}
              required
            />
          </div>
          <div>
            <label className={`block text-xs font-medium mb-1 ${t.label}`}>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-sm transition-all focus:outline-none ${t.input}`}
              required
            />
          </div>
          
          <Button type="submit" className="w-full justify-center mt-2" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />)}
            {isLogin ? 'Đăng nhập' : 'Đăng ký'}
          </Button>
          
          <p className="text-center text-xs mt-3">
            <span className={t.sub}>{isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}</span>
            <button type="button" onClick={() => setIsLogin(!isLogin)} className={`cursor-pointer ${t.link}`}>
              {isLogin ? 'Tạo tài khoản mới' : 'Đăng nhập ngay'}
            </button>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border p-5 ${t.card}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
            <Cloud className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className={`font-semibold ${t.text}`}>Đã kết nối</h3>
            <p className={`text-xs ${t.sub}`}>{user.email}</p>
          </div>
        </div>
        <button onClick={signOut} className={`p-2 rounded-lg transition-colors cursor-pointer ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1a2b23] text-slate-400'}`}>
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      <div className={`p-3 rounded-xl mb-4 border flex items-center justify-between ${t.statusBg}`}>
        <div className="flex items-center gap-2">
          {syncStatus === 'syncing' && <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />}
          {syncStatus === 'synced' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {syncStatus === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
          {syncStatus === 'idle' && <Cloud className={`w-4 h-4 ${t.sub}`} />}
          <span className={`text-xs font-semibold ${t.text}`}>
            {syncStatus === 'syncing' ? 'Đang đồng bộ...' : 
             syncStatus === 'synced' ? 'Đã đồng bộ' : 
             syncStatus === 'error' ? 'Lỗi đồng bộ' : 'Sẵn sàng'}
          </span>
        </div>
        {lastSynced && (
          <span className={`text-[10px] ${t.sub}`}>
            {lastSynced.toLocaleTimeString('vi-VN')}
          </span>
        )}
      </div>

      {errorMessage && (
        <p className="text-xs text-red-500 mb-4 px-2 font-medium">{errorMessage}</p>
      )}

      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1 justify-center" onClick={syncToCloud} disabled={syncStatus === 'syncing'}>
          <Save className="w-4 h-4" />
          Tải lên
        </Button>
        <Button variant="secondary" className="flex-1 justify-center" onClick={handlePull} disabled={syncStatus === 'syncing'}>
          <Download className="w-4 h-4" />
          Tải về
        </Button>
      </div>
    </div>
  );
}
