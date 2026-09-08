import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

function getAuthRedirectUrl() {
  const configuredUrl = import.meta.env.VITE_AUTH_REDIRECT_URL?.trim();
  if (configuredUrl) return configuredUrl;
  return new URL(import.meta.env.BASE_URL, window.location.origin).toString();
}

export function useSupabaseSync() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSynced, setLastSynced] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    if (!supabase) throw new Error('Supabase chưa được cấu hình.');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    if (!supabase) throw new Error('Supabase chưa được cấu hình.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setUser(data.user);
    return data;
  };

  const signInWithGoogle = async () => {
    if (!supabase) throw new Error('Supabase chưa được cấu hình.');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getAuthRedirectUrl(),
        skipBrowserRedirect: true,
      },
    });
    if (error) throw error;
    if (!data?.url) throw new Error('Không nhận được URL đăng nhập Google từ Supabase.');

    window.location.assign(data.url);
    return data;
  };

  const sendMagicLink = async (email) => {
    if (!supabase) throw new Error('Supabase chưa được cấu hình.');
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: getAuthRedirectUrl() },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSyncStatus('idle');
  };

  // Fetch full user data from Supabase
  const fetchUserData = useCallback(async (userId) => {
    if (!supabase || !userId) return null;
    setSyncStatus('syncing');
    setErrorMessage('');
    try {
      const [{ data: s, error: sErr }, { data: pr, error: prErr }, { data: jo, error: joErr }, { data: ve, error: veErr }, { data: re, error: reErr }] = await Promise.all([
        supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('user_progress').select('*').eq('user_id', userId),
        supabase.from('user_journals').select('*').eq('user_id', userId),
        supabase.from('user_verses').select('*').eq('user_id', userId).order('added_at', { ascending: false }),
        supabase.from('user_reflections').select('*').eq('user_id', userId),
      ]);

      if (sErr && sErr.code !== 'PGRST116') console.warn('Fetch settings error:', sErr);
      if (prErr) console.warn('Fetch progress error:', prErr);
      if (joErr) console.warn('Fetch journals error:', joErr);
      if (veErr) console.warn('Fetch verses error:', veErr);
      if (reErr) console.warn('Fetch reflections error:', reErr);

      const result = {
        settings: s ? { userName: s.user_name || '', startDate: s.start_date || null, theme: s.theme || 'dark' } : null,
        progress: {},
        journals: {},
        verses: (ve || []).map(v => ({ id: v.id, reference: v.reference, text: v.text, addedAt: v.added_at })),
        reflections: {},
      };

      if (pr) {
        pr.forEach(p => {
          result.progress[p.day_index] = {
            psalmsProverbs: !!p.psalms_proverbs,
            newTestament: !!p.new_testament,
            oldTestament: !!p.old_testament,
          };
        });
      }

      if (jo) {
        jo.forEach(j => {
          result.journals[j.day_index] = {
            believe: j.believe || '',
            stop: j.stop || '',
            improve: j.improve || '',
            start: j.start || '',
          };
        });
      }

      if (re) {
        re.forEach(r => {
          result.reflections[r.block] = {
            text: r.text || '',
            savedAt: r.saved_at || new Date().toISOString(),
          };
        });
      }

      setSyncStatus('synced');
      setLastSynced(new Date());
      return result;
    } catch (err) {
      console.error('Lỗi tải dữ liệu người dùng:', err);
      setSyncStatus('error');
      setErrorMessage(err.message ?? 'Lỗi tải dữ liệu');
      return null;
    }
  }, []);

  // Save Settings
  const saveSettingsToCloud = useCallback(async (userId, settingsData) => {
    if (!supabase || !userId) return;
    try {
      setSyncStatus('syncing');
      const { error } = await supabase.from('user_settings').upsert({
        user_id: userId,
        user_name: settingsData.userName ?? '',
        start_date: settingsData.startDate ?? '',
        theme: settingsData.theme ?? 'dark',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      if (error) throw error;
      setSyncStatus('synced');
      setLastSynced(new Date());
    } catch (err) {
      console.error('Lỗi lưu cài đặt:', err);
      setSyncStatus('error');
      setErrorMessage(err.message);
    }
  }, []);

  // Save Progress
  const saveProgressToCloud = useCallback(async (userId, dayIndex, dayProgress) => {
    if (!supabase || !userId) return;
    try {
      setSyncStatus('syncing');
      const { error } = await supabase.from('user_progress').upsert({
        user_id: userId,
        day_index: Number(dayIndex),
        psalms_proverbs: !!dayProgress.psalmsProverbs,
        new_testament: !!dayProgress.newTestament,
        old_testament: !!dayProgress.oldTestament,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,day_index' });
      if (error) throw error;
      setSyncStatus('synced');
      setLastSynced(new Date());
    } catch (err) {
      console.error('Lỗi lưu tiến độ:', err);
      setSyncStatus('error');
      setErrorMessage(err.message);
    }
  }, []);

  // Save Journal
  const saveJournalToCloud = useCallback(async (userId, dayIndex, journalData) => {
    if (!supabase || !userId) return;
    try {
      setSyncStatus('syncing');
      const { error } = await supabase.from('user_journals').upsert({
        user_id: userId,
        day_index: Number(dayIndex),
        believe: journalData.believe ?? '',
        stop: journalData.stop ?? '',
        improve: journalData.improve ?? '',
        start: journalData.start ?? '',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,day_index' });
      if (error) throw error;
      setSyncStatus('synced');
      setLastSynced(new Date());
    } catch (err) {
      console.error('Lỗi lưu nhật ký:', err);
      setSyncStatus('error');
      setErrorMessage(err.message);
    }
  }, []);

  // Save Verse
  const saveVerseToCloud = useCallback(async (userId, verse) => {
    if (!supabase || !userId) return;
    try {
      setSyncStatus('syncing');
      const { error } = await supabase.from('user_verses').upsert({
        id: String(verse.id),
        user_id: userId,
        reference: verse.reference,
        text: verse.text,
        added_at: verse.addedAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,id' });
      if (error) throw error;
      setSyncStatus('synced');
      setLastSynced(new Date());
    } catch (err) {
      console.error('Lỗi lưu câu gốc:', err);
      setSyncStatus('error');
      setErrorMessage(err.message);
    }
  }, []);

  // Delete Verse
  const deleteVerseFromCloud = useCallback(async (userId, verseId) => {
    if (!supabase || !userId) return;
    try {
      setSyncStatus('syncing');
      const { error } = await supabase
        .from('user_verses')
        .delete()
        .eq('user_id', userId)
        .eq('id', String(verseId));
      if (error) throw error;
      setSyncStatus('synced');
      setLastSynced(new Date());
    } catch (err) {
      console.error('Lỗi xóa câu gốc:', err);
      setSyncStatus('error');
      setErrorMessage(err.message);
    }
  }, []);

  // Save Reflection
  const saveReflectionToCloud = useCallback(async (userId, block, reflectionData) => {
    if (!supabase || !userId) return;
    try {
      setSyncStatus('syncing');
      const text = typeof reflectionData === 'string' ? reflectionData : (reflectionData?.text ?? '');
      const { error } = await supabase.from('user_reflections').upsert({
        user_id: userId,
        block: Number(block),
        text: text,
        saved_at: reflectionData?.savedAt || new Date().toISOString(),
      }, { onConflict: 'user_id,block' });
      if (error) throw error;
      setSyncStatus('synced');
      setLastSynced(new Date());
    } catch (err) {
      console.error('Lỗi lưu suy ngẫm:', err);
      setSyncStatus('error');
      setErrorMessage(err.message);
    }
  }, []);

  return {
    isConfigured: isSupabaseConfigured,
    authReady,
    user,
    syncStatus,
    lastSynced,
    errorMessage,
    signUp,
    signIn,
    signInWithGoogle,
    sendMagicLink,
    signOut,
    fetchUserData,
    saveSettingsToCloud,
    saveProgressToCloud,
    saveJournalToCloud,
    saveVerseToCloud,
    deleteVerseFromCloud,
    saveReflectionToCloud,
  };
}

