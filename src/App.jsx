import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
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

  useEffect(() => {
    const pendingName = sessionStorage.getItem('ct_pending_user_name')?.trim();
    if (!pendingName || !syncHook.user) return;

    setSettings(prev => ({ ...prev, userName: pendingName }));
    sessionStorage.removeItem('ct_pending_user_name');
  }, [syncHook.user, setSettings]);

  const { schedule, loading: scheduleLoading, getDayData } = useSchedule();

  const theme = settings.theme || 'dark';
  const isLight = theme === 'light';

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  const currentDayIndex = getCurrentDayIndex();
  const currentDayData = getDayData(currentDayIndex);
  const totalCompleted = getTotalCompleted();

  const handleToggleTheme = () => {
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
      <Layout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentDayIndex={currentDayIndex}
        totalCompleted={totalCompleted}
        settings={settings}
        onToggleTheme={handleToggleTheme}
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

