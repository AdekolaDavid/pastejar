import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Clip, ClipInsert, ClipUpdate } from '@/types/supabase';

export function useClips(userId: string | undefined) {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClips = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('clips')
      .select('*')
      .eq('user_id', userId)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data) setClips(data as Clip[]);
    setLoading(false);
  }, [userId]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    fetchClips();

    const channel = supabase
      .channel('clips-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clips',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchClips();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchClips]);

  const addClip = async (clip: Omit<ClipInsert, 'user_id'>) => {
    if (!userId) return;
    const { error } = await supabase
      .from('clips')
      .insert({ ...clip, user_id: userId });
    if (error) throw error;
  };

  const updateClip = async (id: string, updates: ClipUpdate) => {
    const { error } = await supabase
      .from('clips')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  };

  const deleteClip = async (id: string) => {
    const { error } = await supabase.from('clips').delete().eq('id', id);
    if (error) throw error;
  };

  const togglePin = async (clip: Clip) => {
    await updateClip(clip.id, { pinned: !clip.pinned });
  };

  const toggleFavorite = async (clip: Clip) => {
    await updateClip(clip.id, { favorite: !clip.favorite });
  };

  return {
    clips,
    loading,
    fetchClips,
    addClip,
    updateClip,
    deleteClip,
    togglePin,
    toggleFavorite,
  };
}
