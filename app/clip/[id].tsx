import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { writeClipboard } from '@/lib/utils/clipboard';
import { timeAgo, hoursUntilExpiry } from '@/lib/utils/formatters';
import type { Clip } from '@/types/supabase';

export default function ClipDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [clip, setClip] = useState<Clip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('clips')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setClip(data as Clip);
        setLoading(false);
      });
  }, [id]);

  const handleCopy = async () => {
    if (!clip) return;
    await writeClipboard(clip.content);
    Alert.alert('Copied!');
  };

  const handleTogglePin = async () => {
    if (!clip) return;
    const { error } = await supabase
      .from('clips')
      .update({ pinned: !clip.pinned })
      .eq('id', clip.id);
    if (!error) setClip({ ...clip, pinned: !clip.pinned });
  };

  const handleDelete = async () => {
    if (!clip) return;
    Alert.alert('Delete clip?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('clips').delete().eq('id', clip.id);
          router.back();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <ActivityIndicator size="large" color="#EA580C" />
      </View>
    );
  }

  if (!clip) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <Text className="text-neutral-500">Clip not found</Text>
      </View>
    );
  }

  const expiryHours = hoursUntilExpiry(clip.expires_at);

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <View className="pt-16 pb-4 px-5 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-brand-600 dark:text-brand-400 text-base">Back</Text>
        </TouchableOpacity>
        <View className="flex-row gap-4">
          <TouchableOpacity onPress={handleTogglePin}>
            <Text className="text-base">
              {clip.pinned ? '📌' : '📍'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Text className="text-base">🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-5">
        {/* Meta */}
        <View className="flex-row items-center gap-3 mb-4">
          <Text className="text-xs bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2 py-0.5 rounded-full capitalize">
            {clip.clip_type}
          </Text>
          <Text className="text-xs text-neutral-400">
            {timeAgo(clip.created_at)}
          </Text>
          {expiryHours !== null && (
            <Text className="text-xs text-amber-500">
              Expires in {expiryHours}h
            </Text>
          )}
        </View>

        {clip.title && (
          <Text className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
            {clip.title}
          </Text>
        )}

        {/* Content */}
        <View className="bg-white dark:bg-neutral-900 rounded-2xl p-4">
          <Text
            className="text-sm text-neutral-800 dark:text-neutral-200 leading-6"
            selectable
          >
            {clip.content}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom action */}
      <View className="px-5 pb-10 pt-3 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
        <TouchableOpacity
          onPress={handleCopy}
          className="h-12 rounded-xl bg-brand-600 items-center justify-center"
          activeOpacity={0.85}
        >
          <Text className="text-white font-semibold text-base">
            Copy to Clipboard
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
