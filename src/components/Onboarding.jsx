import { useState } from 'react';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { AUTH_TAGLINE, BRAND_NAME } from '../lib/branding.js';

export default function Onboarding({ onComplete }) {
  const theme = useTheme();
  const isLight = theme === 'light';
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startDate) return;
    onComplete({ userName: name.trim() || 'Bạn', startDate });
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all ${
    isLight
      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
      : 'bg-[#112019] border-[#2c4337] text-slate-100 placeholder-slate-500 focus:border-emerald-500'
  }`;

  const labelClass = `block text-sm font-semibold mb-2 ${isLight ? 'text-slate-800' : 'text-slate-200'}`;

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0b1410] text-slate-100'
    }`}>
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-emerald-600 flex items-center justify-center shadow-xl">
            <img src="/victory-plan-mark.svg" alt="Victory Plan" className="w-full h-full" />
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {BRAND_NAME}
          </h1>
          <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            {AUTH_TAGLINE}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={`rounded-2xl p-6 space-y-5 border ${
          isLight ? 'bg-white shadow-xl border-slate-200' : 'bg-[#0b1410] border-[#23372d]'
        }`}>
          <div>
            <label className={labelClass}>Tên của bạn</label>
            <input
              id="onboard-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nhập tên của bạn..."
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              <Calendar className="inline w-4 h-4 mr-1.5 mb-0.5" />
              Ngày bắt đầu kế hoạch
            </label>
            <input
              id="onboard-date"
              type="date"
              required
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className={`${inputClass} ${isLight ? '[color-scheme:light]' : '[color-scheme:dark]'}`}
            />
          </div>

          <div className={`flex items-start gap-2.5 p-3 rounded-xl text-xs font-medium ${
            isLight ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
          }`}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
            <span>Dữ liệu được lưu trữ an toàn trên tài khoản của bạn — tự động đồng bộ tức thì giữa điện thoại và máy tính.</span>
          </div>

          <button
            id="onboard-submit"
            type="submit"
            disabled={!startDate}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md transition-all active:scale-95 disabled:opacity-40 cursor-pointer">
            Bắt đầu hành trình 🚀
          </button>
        </form>
      </div>
    </div>
  );
}
