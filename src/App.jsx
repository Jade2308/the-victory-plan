import { useEffect, useState } from 'react';
import { Loader2, Info } from 'lucide-react';
import { ThemeContext } from './context/ThemeContext.jsx';
import { useAppState } from './hooks/useAppState.js';
import { useSchedule } from './hooks/useSchedule.js';
import Layout from './components/Layout.jsx';
import Dashboard from './components/Dashboard.jsx';
import CatchUp from './components/CatchUp.jsx';
import VerseVault from './components/VerseVault.jsx';
import Reflections from './components/Reflections.jsx';
import WeeklySummary from './components/WeeklySummary.jsx';
import YearHeatmap from './components/YearHeatmap.jsx';
import SettingsPage from './components/SettingsPage.jsx';
import MonthlyPrompt from './components/MonthlyPrompt.jsx';
import Onboarding from './components/Onboarding.jsx';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import { useSupabaseSync } from './hooks/useSupabaseSync.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const syncHook = useSupabaseSync();

  const {
    settings, setSettings,
    progress,
    journals,
    verses,
    reflections,
    loadingUserData,
    markReading,
    saveJournal,
    addVerse,
    deleteVerse,
    saveReflection,
    getCurrentDayIndex,
    isDayComplete,
    isDayMissed,
    getTotalCompleted,
    importAllData,
    refreshData,
  } = useAppState(syncHook.user, syncHook);

  const [guestMode, setGuestMode] = useState(() => {
    try {
      return localStorage.getItem('ct_entry_choice') === 'guest';
    } catch {
      return false;
    }
  });

  const [systemIsDark, setSystemIsDark] = useState(() => {
    try {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    const pendingName = sessionStorage.getItem('ct_pending_user_name')?.trim();
    if (!pendingName || !syncHook.user) return;

    setSettings(prev => ({ ...prev, userName: pendingName }));
    sessionStorage.removeItem('ct_pending_user_name');
  }, [syncHook.user, setSettings]);

  const { schedule, loading: scheduleLoading, getDayData } = useSchedule();

  // Force dark mode if device OS is in Dark Mode
  const theme = systemIsDark ? 'dark' : (settings.theme || 'dark');
  const isLight = theme === 'light';

  useEffect(() => {
    const root = document.documentElement;
    const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      if (metaColorScheme) metaColorScheme.content = 'dark';
      if (metaThemeColor) metaThemeColor.content = '#0b1410';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'only light';
      if (metaColorScheme) metaColorScheme.content = 'only light';
      if (metaThemeColor) metaThemeColor.content = '#f8fafc';
    }
  }, [theme]);

  const currentDayIndex = getCurrentDayIndex();
  const currentDayData = getDayData(currentDayIndex);
  const totalCompleted = getTotalCompleted();

  const handleToggleTheme = () => {
    if (systemIsDark) {
      showToast('Điện thoại của bạn đang bật Chế độ Tối hệ thống. Ứng dụng tự động giữ Chế độ Tối để hiển thị tốt nhất trên thiết bị.');
      return;
    }
    setSettings(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };

  const loadingBg = isLight ? 'bg-slate-50 text-slate-700' : 'bg-[#0b1410] text-slate-300';

  if (!syncHook.authReady) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${loadingBg} text-sm`}>
        <Loader2 className="w-5 h-5 text-emerald-500 animate-spin mr-2" />
        Đang chuẩn bị...
      </div>
    );
  }

  if (!syncHook.user && !guestMode) {
    return (
      <ThemeContext.Provider value={theme}>
        <WelcomeScreen syncHook={syncHook} onContinueAsGuest={() => {
          try {
            localStorage.setItem('ct_entry_choice', 'guest');
          } catch {}
          setGuestMode(true);
        }} />
      </ThemeContext.Provider>
    );
  }

  // Loading user data from database when user is authenticated
  if (syncHook.user && loadingUserData) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${loadingBg} gap-3`}>
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-sm font-medium">Đang tải dữ liệu từ đám mây...</p>
      </div>
    );
  }

  // Show onboarding if no startDate set in database / state
  if (!settings.startDate) {
    return (
      <ThemeContext.Provider value={theme}>
        <Onboarding onComplete={(data) => setSettings(prev => ({ ...prev, ...data }))} />
      </ThemeContext.Provider>
    );
  }

  if (scheduleLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${loadingBg}`}>
        <div className="text-sm">Đang tải kế hoạch...</div>
      </div>
    );
  }

  const missedCount = schedule ? schedule.filter(d => isDayMissed(d.dayIndex)).length : 0;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            dayData={currentDayData}
            dayIndex={currentDayIndex}
            progress={progress[currentDayIndex]}
            allProgress={progress}
            journal={journals[currentDayIndex]}
            onMarkReading={markReading}
            onSaveJournal={saveJournal}
            userName={settings.userName}
            onNavigateTab={setActiveTab}
            syncHook={syncHook}
            missedCount={missedCount}
            verses={verses}
            onAddVerse={addVerse}
            startDate={settings.startDate}
            isDayComplete={isDayComplete}
            isDayMissed={isDayMissed}
          />
        );
      case 'catchup':
        return (
          <CatchUp
            schedule={schedule}
            progress={progress}
            isDayMissed={isDayMissed}
            onMarkReading={markReading}
            currentDayIndex={currentDayIndex}
          />
        );
      case 'verses':
        return (
          <VerseVault
            verses={verses}
            onAdd={addVerse}
            onDelete={deleteVerse}
          />
        );
      case 'reflections':
        return (
          <Reflections
            reflections={reflections}
            currentDayIndex={currentDayIndex}
            onSave={saveReflection}
          />
        );
      case 'weekly':
        return (
          <WeeklySummary
            progress={progress}
            isDayComplete={isDayComplete}
            isDayMissed={isDayMissed}
            currentDayIndex={currentDayIndex}
            startDate={settings.startDate}
          />
        );
      case 'heatmap':
        return (
          <YearHeatmap
            progress={progress}
            startDate={settings.startDate}
            currentDayIndex={currentDayIndex}
            isDayComplete={isDayComplete}
            isDayMissed={isDayMissed}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            settings={settings}
            onUpdate={setSettings}
            totalCompleted={totalCompleted}
            currentDayIndex={currentDayIndex}
            theme={theme}
            onImport={importAllData}
            localData={{ settings, progress, journals, verses, reflections }}
            onNavigateTab={setActiveTab}
            syncHook={syncHook}
            refreshData={refreshData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] px-4 py-3 rounded-2xl bg-emerald-950/95 text-emerald-100 border border-emerald-700/80 shadow-2xl backdrop-blur-md flex items-start gap-3 animate-fade-in-up">
          <Info className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs leading-relaxed font-medium">
            {toastMessage}
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white p-0.5 text-xs font-bold">
            ✕
          </button>
        </div>
      )}

      <Layout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentDayIndex={currentDayIndex}
        totalCompleted={totalCompleted}
        settings={settings}
        onToggleTheme={handleToggleTheme}
        systemIsDark={systemIsDark}
      >
        {renderContent()}
      </Layout>

      <MonthlyPrompt
        currentDayIndex={currentDayIndex}
        reflections={reflections}
        onSave={saveReflection}
        onDismiss={() => {}}
      />
    </ThemeContext.Provider>
  );
}

