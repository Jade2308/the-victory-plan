import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase.js';

export function useAppState(user, syncHook) {
  const [settings, setSettingsState] = useState({
    startDate: null,
    theme: 'dark',
    userName: '',
  });

  const [progress, setProgress] = useState({});
  const [journals, setJournals] = useState({});
  const [verses, setVerses] = useState([]);
  const [reflections, setReflections] = useState({});
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const journalDebounceTimers = useRef({});

  // Fetch full user data from Supabase
  const loadData = useCallback(async (showLoading = true) => {
    if (!user?.id || !syncHook?.fetchUserData) return;
    if (showLoading) setLoadingUserData(true);
    try {
      const data = await syncHook.fetchUserData(user.id);
      if (data) {
        if (data.settings) {
          let name = data.settings.userName;
          if (!name && (user.user_metadata?.full_name || user.user_metadata?.name)) {
            name = user.user_metadata.full_name || user.user_metadata.name;
          }
          setSettingsState({
            startDate: data.settings.startDate || null,
            theme: data.settings.theme || 'dark',
            userName: name || '',
          });
        } else {
          // New user on DB — default name from Google if available
          const googleName = user.user_metadata?.full_name || user.user_metadata?.name || '';
          setSettingsState(prev => ({ ...prev, userName: googleName }));
        }

        if (data.progress) setProgress(data.progress);
        if (data.journals) setJournals(data.journals);
        if (data.verses) setVerses(data.verses);
        if (data.reflections) setReflections(data.reflections);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu từ database:', err);
    } finally {
      if (showLoading) {
        setLoadingUserData(false);
        setIsLoaded(true);
      }
    }
  }, [user, syncHook]);

  // Initial load when user signs in or out
  useEffect(() => {
    if (user?.id) {
      loadData(true);
    } else {
      // Clear all user data from memory upon logout
      setSettingsState({ startDate: null, theme: 'dark', userName: '' });
      setProgress({});
      setJournals({});
      setVerses([]);
      setReflections({});
      setLoadingUserData(false);
      setIsLoaded(false);

      // Clean up legacy local keys
      try {
        localStorage.removeItem('ct_settings');
        localStorage.removeItem('ct_progress');
        localStorage.removeItem('ct_journals');
        localStorage.removeItem('ct_verses');
        localStorage.removeItem('ct_reflections');
      } catch {}
    }
  }, [user?.id, loadData]);

  // Supabase Realtime channel subscription for multi-device sync
  useEffect(() => {
    if (!supabase || !user?.id) return;

    const channel = supabase
      .channel(`user_realtime_${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_settings', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.new) {
          setSettingsState(prev => ({
            ...prev,
            userName: payload.new.user_name || '',
            startDate: payload.new.start_date || null,
            theme: payload.new.theme || 'dark',
          }));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_progress', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.new) {
          setProgress(prev => ({
            ...prev,
            [payload.new.day_index]: {
              psalmsProverbs: !!payload.new.psalms_proverbs,
              newTestament: !!payload.new.new_testament,
              oldTestament: !!payload.new.old_testament,
            }
          }));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_journals', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.new) {
          setJournals(prev => ({
            ...prev,
            [payload.new.day_index]: {
              believe: payload.new.believe || '',
              stop: payload.new.stop || '',
              improve: payload.new.improve || '',
              start: payload.new.start || '',
            }
          }));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_verses', filter: `user_id=eq.${user.id}` }, () => {
        supabase.from('user_verses').select('*').eq('user_id', user.id).order('added_at', { ascending: false }).then(({ data }) => {
          if (data) setVerses(data.map(v => ({ id: v.id, reference: v.reference, text: v.text, addedAt: v.added_at })));
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_reflections', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.new) {
          setReflections(prev => ({
            ...prev,
            [payload.new.block]: {
              text: payload.new.text || '',
              savedAt: payload.new.saved_at || new Date().toISOString(),
            }
          }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Window Focus & Visibility Change: Silently re-check for latest data
  useEffect(() => {
    if (!user?.id) return;
    const handleSyncOnFocus = () => {
      if (document.visibilityState === 'visible') {
        loadData(false);
      }
    };
    window.addEventListener('focus', handleSyncOnFocus);
    document.addEventListener('visibilitychange', handleSyncOnFocus);
    return () => {
      window.removeEventListener('focus', handleSyncOnFocus);
      document.removeEventListener('visibilitychange', handleSyncOnFocus);
    };
  }, [user?.id, loadData]);

  // Mutator: Update Settings
  const setSettings = useCallback((updaterOrValue) => {
    setSettingsState(prev => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
      if (user?.id && syncHook?.saveSettingsToCloud) {
        syncHook.saveSettingsToCloud(user.id, next);
      }
      return next;
    });
  }, [user?.id, syncHook]);

  // Mutator: Mark Reading
  const markReading = useCallback((dayIndex, field, value) => {
    setProgress(prev => {
      const currentDay = prev[dayIndex] || {};
      const updatedDay = { ...currentDay, [field]: value };
      const next = { ...prev, [dayIndex]: updatedDay };
      if (user?.id && syncHook?.saveProgressToCloud) {
        syncHook.saveProgressToCloud(user.id, dayIndex, updatedDay);
      }
      return next;
    });
  }, [user?.id, syncHook]);

  // Mutator: Save Journal (with typing debounce)
  const saveJournal = useCallback((dayIndex, data) => {
    setJournals(prev => ({ ...prev, [dayIndex]: data }));

    if (user?.id && syncHook?.saveJournalToCloud) {
      if (journalDebounceTimers.current[dayIndex]) {
        clearTimeout(journalDebounceTimers.current[dayIndex]);
      }
      journalDebounceTimers.current[dayIndex] = setTimeout(() => {
        syncHook.saveJournalToCloud(user.id, dayIndex, data);
        delete journalDebounceTimers.current[dayIndex];
      }, 500);
    }
  }, [user?.id, syncHook]);

  // Mutator: Add Verse
  const addVerse = useCallback((verse) => {
    const newVerse = {
      id: String(verse.id || Date.now()),
      reference: verse.reference,
      text: verse.text,
      addedAt: verse.addedAt || new Date().toISOString(),
    };
    setVerses(prev => [newVerse, ...prev]);
    if (user?.id && syncHook?.saveVerseToCloud) {
      syncHook.saveVerseToCloud(user.id, newVerse);
    }
  }, [user?.id, syncHook]);

  // Mutator: Delete Verse
  const deleteVerse = useCallback((id) => {
    setVerses(prev => prev.filter(v => String(v.id) !== String(id)));
    if (user?.id && syncHook?.deleteVerseFromCloud) {
      syncHook.deleteVerseFromCloud(user.id, id);
    }
  }, [user?.id, syncHook]);

  // Mutator: Save Reflection
  const saveReflection = useCallback((monthBlock, text) => {
    const refData = { text, savedAt: new Date().toISOString() };
    setReflections(prev => ({ ...prev, [monthBlock]: refData }));
    if (user?.id && syncHook?.saveReflectionToCloud) {
      syncHook.saveReflectionToCloud(user.id, monthBlock, refData);
    }
  }, [user?.id, syncHook]);

  // Helper: Current Day Index calculation
  const getCurrentDayIndex = useCallback(() => {
    if (!settings.startDate) return 1;
    const start = new Date(settings.startDate);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(365, diff));
  }, [settings.startDate]);

  // Helper: Is Day Complete
  const isDayComplete = useCallback((dayIndex) => {
    const p = progress[dayIndex];
    return p?.psalmsProverbs && p?.newTestament && p?.oldTestament;
  }, [progress]);

  // Helper: Is Day Missed
  const isDayMissed = useCallback((dayIndex) => {
    const current = getCurrentDayIndex();
    return dayIndex < current && !isDayComplete(dayIndex);
  }, [getCurrentDayIndex, isDayComplete]);

  // Helper: Total Completed Days
  const getTotalCompleted = useCallback(() => {
    return Object.keys(progress).filter(k => isDayComplete(parseInt(k))).length;
  }, [progress, isDayComplete]);

  // Helper: Import Backup Data
  const importAllData = useCallback((data) => {
    if (data.settings) setSettings(data.settings);
    if (data.progress) {
      setProgress(data.progress);
      if (user?.id) {
        Object.entries(data.progress).forEach(([day, val]) => {
          syncHook.saveProgressToCloud(user.id, Number(day), val);
        });
      }
    }
    if (data.journals) {
      setJournals(data.journals);
      if (user?.id) {
        Object.entries(data.journals).forEach(([day, val]) => {
          syncHook.saveJournalToCloud(user.id, Number(day), val);
        });
      }
    }
    if (data.verses) {
      setVerses(data.verses);
      if (user?.id) {
        data.verses.forEach(v => {
          syncHook.saveVerseToCloud(user.id, v);
        });
      }
    }
    if (data.reflections) {
      setReflections(data.reflections);
      if (user?.id) {
        Object.entries(data.reflections).forEach(([block, val]) => {
          syncHook.saveReflectionToCloud(user.id, Number(block), val);
        });
      }
    }
  }, [user?.id, syncHook, setSettings]);

  return {
    settings, setSettings,
    progress, setProgress,
    journals, setJournals,
    verses, setVerses,
    reflections, setReflections,
    loadingUserData,
    isLoaded,
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
    refreshData: () => loadData(true),
  };
}

