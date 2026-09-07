import { useState } from 'react';
import { Cloud, Mail, Loader2 } from 'lucide-react';
import { AUTH_TAGLINE, BRAND_NAME } from '../lib/branding.js';

export default function WelcomeScreen({ syncHook, onContinueAsGuest }) {
  const { isConfigured, signInWithGoogle, sendMagicLink } = syncHook;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    setLoading(true); setError('');
    try {
      const displayName = name.trim();
      if (displayName) sessionStorage.setItem('ct_pending_user_name', displayName);
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Không thể đăng nhập với Google.');
      setLoading(false);
    }
  };

  const handleEmail = async (event) => {
    event.preventDefault();
    if (!email) return;
    setLoading(true); setError('');
    try {
      const displayName = name.trim();
      if (displayName) sessionStorage.setItem('ct_pending_user_name', displayName);
      await sendMagicLink(email);
      setMessage('Đã gửi liên kết đăng nhập. Hãy kiểm tra hộp thư email của bạn.');
    } catch (err) {
      setError(err.message || 'Không thể gửi email đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0b1410] text-slate-100">
      <main className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-7">
          <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-emerald-600 flex items-center justify-center shadow-xl">
            <img src="/victory-plan-mark.svg" alt="Victory Plan" className="w-full h-full" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{BRAND_NAME}</h1>
          <p className="text-sm leading-relaxed text-slate-400">{AUTH_TAGLINE}</p>
        </div>

        <section className="rounded-2xl p-6 space-y-4 border bg-[#0b1410] border-[#23372d] shadow-xl">
          <div className="flex gap-3 rounded-xl p-3 bg-[#112019] border border-[#2c4337]">
            <Cloud className="w-5 h-5 shrink-0 text-emerald-300" />
            <p className="text-xs leading-relaxed text-emerald-100"><strong>Đề xuất: đăng ký để sao lưu tiến độ.</strong> Nhật ký, câu gốc và hành trình của bạn sẽ theo bạn khi đổi thiết bị.</p>
          </div>

          {isConfigured ? <>
            <div>
              <label htmlFor="welcome-name" className="block text-xs mb-1.5 text-slate-300">Tên hiển thị</label>
              <input id="welcome-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Minh" autoComplete="name"
                className="w-full px-3 py-2.5 rounded-xl border bg-[#112019] border-[#2c4337] text-sm focus:outline-none focus:border-emerald-500" />
            </div>
            <button type="button" onClick={handleGoogle} disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <img src="/google-g-logo.svg" alt="" aria-hidden="true" className="w-5 h-5" />}
              Tiếp tục với Google
            </button>
            <form onSubmit={handleEmail} className="flex gap-2">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email của bạn"
                className="min-w-0 flex-1 px-3 py-2.5 rounded-xl border bg-[#112019] border-[#2c4337] text-sm focus:outline-none focus:border-emerald-500" />
              <button type="submit" disabled={loading} className="px-3 rounded-xl border border-[#2c4337] hover:bg-[#1a2b23] text-sm font-semibold cursor-pointer disabled:opacity-60" aria-label="Gửi liên kết đăng nhập">
                <Mail className="w-4 h-4" />
              </button>
            </form>
            <p className="text-center text-xs text-slate-400">Hoặc nhập email để nhận liên kết đăng ký / đăng nhập.</p>
            {message && <p className="text-xs text-emerald-400 text-center">{message}</p>}
            {error && <p className="text-xs text-red-400 text-center">{error}</p>}
          </> : <p className="text-xs text-amber-300 text-center">Chức năng đăng ký sẽ khả dụng sau khi cấu hình Supabase.</p>}

          <div className="flex items-center gap-3 pt-1"><div className="h-px flex-1 bg-[#23372d]" /><span className="text-xs text-slate-500">hoặc</span><div className="h-px flex-1 bg-[#23372d]" /></div>
          <button type="button" onClick={onContinueAsGuest} className="w-full py-2.5 text-sm font-medium text-slate-300 hover:text-white cursor-pointer">
            Dùng ngay không cần tài khoản
          </button>
          <p className="text-center text-[11px] leading-relaxed text-slate-500">Dữ liệu sẽ chỉ lưu trên thiết bị này cho đến khi bạn đăng ký.</p>
        </section>
      </main>
    </div>
  );
}
