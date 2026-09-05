import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

export function useSupabaseSync(localData) {
  const [user, setUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSynced, setLastSynced] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setUser(data.user);
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSyncStatus('idle');
  };

  const syncToCloud = useCallback(async () => {
    if (!supabase || !user) return;
    setSyncStatus('syncing');
    setErrorMessage('');
    try {
      const uid = user.id;
      await supabase.from('user_settings').upsert({
        user_id: uid,
        user_name: localData.settings?.userName ?? '',
        start_date: localData.settings?.startDate ?? '',
        theme: localData.settings?.theme ?? 'dark',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      const progressRows = Object.entries(localData.progress ?? {}).map(([day, val]) => ({
        user_id: uid, day_index: Number(day),
        psalms_proverbs: !!val.psalmsProverbs,
        new_testament: !!val.newTestament,
        old_testament: !!val.oldTestament,
        updated_at: new Date().toISOString(),
      }));
      if (progressRows.length > 0)
        await supabase.from('user_progress').upsert(progressRows, { onConflict: 'user_id,day_index' });

      const journalRows = Object.entries(localData.journals ?? {}).map(([day, val]) => ({
        user_id: uid, day_index: Number(day),
        believe: val.believe ?? '', stop: val.stop ?? '',
        improve: val.improve ?? '', start: val.start ?? '',
        updated_at: new Date().toISOString(),
      }));
      if (journalRows.length > 0)
        await supabase.from('user_journals').upsert(journalRows, { onConflict: 'user_id,day_index' });

      const verseRows = (localData.verses ?? []).map(v => ({
        id: String(v.id), user_id: uid,
        reference: v.reference, text: v.text,
        updated_at: new Date().toISOString(),
      }));
      if (verseRows.length > 0)
        await supabase.from('user_verses').upsert(verseRows, { onConflict: 'id' });

      const reflectionRows = Object.entries(localData.reflections ?? {}).map(([block, val]) => ({
        user_id: uid, block: Number(block),
        text: val.text ?? '', saved_at: val.savedAt ?? new Date().toISOString(),
      }));
      if (reflectionRows.length > 0)
        await supabase.from('user_reflections').upsert(reflectionRows, { onConflict: 'user_id,block' });

      setSyncStatus('synced');
      setLastSynced(new Date());
    } catch (err) {
      setSyncStatus('error');
      setErrorMessage(err.message ?? 'Lỗi đồng bộ');
    }
  }, [user, localData]);

  const pullFromCloud = useCallback(async () => {
    if (!supabase || !user) return null;
    setSyncStatus('syncing');
    setErrorMessage('');
    try {
      const uid = user.id;
      const [{ data: s }, { data: pr }, { data: jo }, { data: ve }, { data: re }] = await Promise.all([
        supabase.from('user_settings').select('*').eq('user_id', uid).single(),
        supabase.from('user_progress').select('*').eq('user_id', uid),
        supabase.from('user_journals').select('*').eq('user_id', uid),
        supabase.from('user_verses').select('*').eq('user_id', uid),
        supabase.from('user_reflections').select('*').eq('user_id', uid),
      ]);

      const result = {};
      if (s) result.settings = { userName: s.user_name, startDate: s.start_date, theme: s.theme };
      if (pr) {
        result.progress = {};
        pr.forEach(p => {
          result.progress[p.day_index] = {
            psalmsProverbs: p.psalms_proverbs,
            newTestament: p.new_testament,
            oldTestament: p.old_testament,
          };
        });
      }
      if (jo) {
        result.journals = {};
        jo.forEach(j => {
          result.journals[j.day_index] = { believe: j.believe, stop: j.stop, improve: j.improve, start: j.start };
        });
      }
      if (ve) result.verses = ve.map(v => ({ id: v.id, reference: v.reference, text: v.text }));
      if (re) {
        result.reflections = {};
        re.forEach(r => { result.reflections[r.block] = { text: r.text, savedAt: r.saved_at }; });
      }

      setSyncStatus('synced');
      setLastSynced(new Date());
      return result;
    } catch (err) {
      setSyncStatus('error');
      setErrorMessage(err.message ?? 'Lỗi tải dữ liệu');
      return null;
    }
  }, [user]);

  return {
    isConfigured: isSupabaseConfigured,
    user, syncStatus, lastSynced, errorMessage,
    signUp, signIn, signOut, syncToCloud, pullFromCloud,
  };
}
