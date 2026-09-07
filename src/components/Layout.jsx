import {
  Home, BookOpen, Star, MessageSquare, BarChart2, Calendar, Settings,
  Sun, Moon, BookMarked
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { BRAND_NAME, BRAND_TAGLINE } from '../lib/branding.js';

const DESKTOP_NAV_ITEMS = [
  { id: 'dashboard', label: 'Hôm nay', icon: Home },
  { id: 'catchup', label: 'Đọc bù', icon: BookOpen },
  { id: 'verses', label: 'Câu gốc', icon: Star },
  { id: 'reflections', label: 'Suy ngẫm', icon: MessageSquare },
  { id: 'weekly', label: 'Tuần này', icon: BarChart2 },
  { id: 'heatmap', label: 'Cả năm', icon: Calendar },
  { id: 'settings', label: 'Cài đặt', icon: Settings },
];

const MOBILE_NAV_ITEMS = [
  { id: 'dashboard', label: 'Hôm nay', icon: Home },
  { id: 'catchup', label: 'Đọc bù', icon: BookOpen },
  { id: 'verses', label: 'Câu gốc', icon: Star },
  { id: 'reflections', label: 'Suy ngẫm', icon: MessageSquare },
  { id: 'settings', label: 'Cài đặt', icon: Settings },
];

export default function Layout({
  children, activeTab, setActiveTab,
  currentDayIndex, totalCompleted, settings, onToggleTheme
}) {
  const theme = useTheme();
  const isLight = theme === 'light';

  const sidebarBg = isLight
    ? 'bg-white border-slate-200 text-slate-800'
    : 'bg-[#0b1410] border-[#23372d] text-slate-100';
  
  const logoText = isLight ? 'text-slate-900' : 'text-white';
  const logoSub = isLight ? 'text-slate-500' : 'text-slate-400';
  
  const progressBg = isLight ? 'bg-slate-100 border border-slate-200' : 'bg-[#112019] border border-[#23372d]';
  const progressText = isLight ? 'text-slate-900' : 'text-slate-100';
  const progressSub = isLight ? 'text-slate-500' : 'text-slate-400';
  
  const mainBg = isLight
    ? 'bg-slate-50 text-slate-900'
    : 'bg-[#0b1410] text-slate-100';

  const percent = Math.round((totalCompleted / 365) * 100);
  const circumference = 2 * Math.PI * 20;
  const strokeDash = (percent / 100) * circumference;

  return (
    <div className={`flex h-screen overflow-hidden ${mainBg}`}>
      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <aside className={`hidden md:flex flex-col w-60 flex-shrink-0 border-r ${sidebarBg}`}>
        {/* Logo */}
        <div className="px-5 pt-6 pb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md">
            <img src="/victory-plan-mark.svg" alt="Victory Plan" className="w-full h-full" />
          </div>
          <div>
            <p className={`font-bold text-base leading-tight ${logoText}`}>{BRAND_NAME}</p>
            <p className={`text-xs ${logoSub}`}>{BRAND_TAGLINE}</p>
          </div>
        </div>

        {/* Progress widget */}
        <div className={`mx-4 mb-4 p-3.5 rounded-xl ${progressBg}`}>
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex-shrink-0">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none"
                  stroke={isLight ? '#cbd5e1' : '#334155'} strokeWidth="4" />
                <circle cx="24" cy="24" r="20" fill="none"
                  stroke="#10b981" strokeWidth="4"
                  strokeDasharray={`${strokeDash} ${circumference}`}
                  strokeLinecap="round" />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${progressText}`}>
                {percent}%
              </span>
            </div>
            <div>
              <p className={`text-base font-bold ${progressText}`}>
                <span className="text-emerald-600 dark:text-emerald-400">{totalCompleted}</span>
                <span className={`text-xs font-normal ${progressSub}`}>/365</span>
              </p>
              <p className={`text-xs ${progressSub}`}>ngày hoàn thành</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {DESKTOP_NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button key={id} id={`nav-${id}`}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  active
                    ? isLight
                      ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200'
                      : 'bg-[#112019] text-emerald-300 font-semibold border border-[#2c4337]'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#112019]'
                }`}>
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? (isLight ? 'text-emerald-600' : 'text-emerald-400') : ''}`} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Theme toggle switch */}
        <div className="px-4 pb-5 pt-3 border-t border-slate-200 dark:border-[#23372d]">
          <button
            id="sidebar-theme-toggle"
            onClick={onToggleTheme}
            className={`w-full flex items-center justify-between p-1 rounded-xl border transition-all cursor-pointer select-none ${
              isLight
                ? 'bg-slate-100 border-slate-200'
                : 'bg-[#112019] border-[#23372d]'
            }`}
          >
            {/* Sun Side */}
            <div className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isLight
                ? 'bg-white text-amber-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-400'
            }`}>
              <Sun className="w-3.5 h-3.5" />
              <span>Chế độ sáng</span>
            </div>

            {/* Moon Side */}
            <div className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !isLight
                ? 'bg-[#112019] text-emerald-300 border border-[#2c4337] shadow-xs'
                : 'text-slate-400 hover:text-slate-600'
            }`}>
              <Moon className="w-3.5 h-3.5" />
              <span>Chế độ tối</span>
            </div>
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ─────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header Bar */}
        <header className={`md:hidden flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0b1410] border-[#23372d]'
        }`}>
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('heatmap')}>
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-xs">
              <img src="/victory-plan-mark.svg" alt="Victory Plan" className="w-full h-full" />
            </div>
            <div>
              <p className={`font-bold text-sm leading-none ${logoText}`}>{BRAND_NAME}</p>
              <p className={`text-[10px] ${logoSub} mt-0.5 font-medium text-emerald-600 dark:text-emerald-400`}>
                {totalCompleted}/365 ngày ({percent}%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Stats Button for Mobile */}
            <button
              id="mobile-stats-btn"
              onClick={() => setActiveTab('weekly')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                activeTab === 'weekly' || activeTab === 'heatmap'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : isLight
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-[#112019] border-[#2c4337] text-emerald-300'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Tiến độ</span>
            </button>

            {/* Compact Mobile Theme Switch Button */}
            <button
              id="mobile-theme-toggle"
              onClick={onToggleTheme}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                isLight
                  ? 'bg-slate-100 border-slate-200 text-amber-600'
                  : 'bg-[#112019] border-[#23372d] text-emerald-300'
              }`}
            >
              {isLight ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{isLight ? 'Sáng' : 'Tối'}</span>
            </button>
          </div>
        </header>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto pb-24 md:pb-6">
          {children}
        </div>

        {/* ── Mobile Bottom Navigation Bar (5 core items max, clean touch targets) ── */}
        <nav className={`md:hidden fixed bottom-0 left-0 right-0 border-t z-40 backdrop-blur-md ${
          isLight ? 'bg-white/95 border-slate-200 shadow-lg' : 'bg-[#0b1410]/95 border-[#23372d] shadow-lg'
        }`}>
          <div className="flex items-center justify-around h-16 px-1">
            {MOBILE_NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button key={id} id={`mob-nav-${id}`}
                  onClick={() => setActiveTab(id)}
                  className={`flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 transition-all cursor-pointer ${
                    active
                      ? isLight
                        ? 'text-emerald-600 font-bold'
                        : 'text-emerald-400 font-bold'
                      : isLight
                        ? 'text-slate-500 hover:text-slate-800'
                        : 'text-slate-400 hover:text-slate-200'
                  }`}>
                  <div className={`p-1 rounded-xl transition-all ${
                    active
                        ? isLight ? 'bg-emerald-50' : 'bg-[#112019] border border-[#2c4337]'
                      : ''
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] leading-none text-center whitespace-nowrap">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </main>
    </div>
  );
}
