import { useState, useCallback } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

export function useAppState() {
  const [settings, setSettings] = useLocalStorage('ct_settings', {
    startDate: null,
    theme: 'dark',
    userName: '',
  });

  const [progress, setProgress] = useLocalStorage('ct_progress', {});
  const [journals, setJournals] = useLocalStorage('ct_journals', {});
  const [verses, setVerses] = useLocalStorage('ct_verses', []);
  const [reflections, setReflections] = useLocalStorage('ct_reflections', {});

  const markReading = useCallback((dayIndex, field, value) => {
    setProgress(prev => ({
      ...prev,
      [dayIndex]: { ...prev[dayIndex], [field]: value }
    }));
  }, [setProgress]);

  const saveJournal = useCallback((dayIndex, data) => {
    setJournals(prev => ({ ...prev, [dayIndex]: data }));
  }, [setJournals]);

  const addVerse = useCallback((verse) => {
    setVerses(prev => [{ ...verse, id: Date.now(), addedAt: new Date().toISOString() }, ...prev]);
  }, [setVerses]);

  const deleteVerse = useCallback((id) => {
    setVerses(prev => prev.filter(v => v.id !== id));
  }, [setVerses]);

  const saveReflection = useCallback((monthBlock, text) => {
    setReflections(prev => ({ ...prev, [monthBlock]: { text, savedAt: new Date().toISOString() } }));
  }, [setReflections]);

  const getCurrentDayIndex = useCallback(() => {
    if (!settings.startDate) return 1;
    const start = new Date(settings.startDate);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(365, diff));
  }, [settings.startDate]);

  const isDayComplete = useCallback((dayIndex) => {
    const p = progress[dayIndex];
    return p?.psalmsProverbs && p?.newTestament && p?.oldTestament;
  }, [progress]);

  const isDayMissed = useCallback((dayIndex) => {
    const current = getCurrentDayIndex();
    return dayIndex < current && !isDayComplete(dayIndex);
  }, [getCurrentDayIndex, isDayComplete]);

  const getTotalCompleted = useCallback(() => {
    return Object.keys(progress).filter(k => isDayComplete(parseInt(k))).length;
  }, [progress, isDayComplete]);

  const importAllData = useCallback((data) => {
    if (data.settings) setSettings(prev => ({ ...prev, ...data.settings }));
    if (data.progress) setProgress(data.progress);
    if (data.journals) setJournals(data.journals);
    if (data.verses) setVerses(data.verses);
    if (data.reflections) setReflections(data.reflections);
  }, [setSettings, setProgress, setJournals, setVerses, setReflections]);

  return {
    settings, setSettings,
    progress, setProgress,
    journals, setJournals,
    verses, setVerses,
    reflections, setReflections,
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
  };
}
