import { useEffect, useState } from 'react';
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

  const {
    settings, setSettings,
    progress,
    journals,
    verses,
    reflections,
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
  } = useAppState();

  const localData = { settings, progress, journals, verses, reflections };
  const syncHook = useSupabaseSync(localData);
  const [guestMode, setGuestMode] = useState(() => localStorage.getItem('ct_entry_choice') === 'guest');

  useEffect(() => {
    const pendingName = sessionStorage.getItem('ct_pending_user_name')?.trim();
    if (!pendingName || !syncHook.user) return;

    setSettings(prev => ({ ...prev, userName: pendingName }));
    sessionStorage.removeItem('ct_pending_user_name');
  }, [syncHook.user, setSettings]);

  const { schedule, loading, getDayData } = useSchedule();

  const theme = settings.theme || 'dark';
  const currentDayIndex = getCurrentDayIndex();
  const currentDayData = getDayData(currentDayIndex);
  const totalCompleted = getTotalCompleted();

  const handleToggleTheme = () => {
    setSettings(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };

  if (!syncHook.authReady) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0b1410] text-slate-400 text-sm">Đang chuẩn bị...</div>;
  }

  if (!syncHook.user && !guestMode) {
    return (
      <ThemeContext.Provider value={theme}>
        <WelcomeScreen syncHook={syncHook} onContinueAsGuest={() => {
          localStorage.setItem('ct_entry_choice', 'guest');
          setGuestMode(true);
        }} />
      </ThemeContext.Provider>
    );
  }

  // Show onboarding if no startDate set
  if (!settings.startDate) {
    return (
      <ThemeContext.Provider value={theme}>
        <Onboarding onComplete={(data) => setSettings(prev => ({ ...prev, ...data }))} />
      </ThemeContext.Provider>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1410]">
        <div className="text-slate-400 text-sm">Đang tải kế hoạch...</div>
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
