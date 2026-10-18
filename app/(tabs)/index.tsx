import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/lib/hooks/useAuth';
import { useClips } from '@/lib/hooks/useClips';
import { readClipboard, detectClipType, truncate } from '@/lib/utils/clipboard';
import { timeAgo } from '@/lib/utils/formatters';
import type { Clip } from '@/types/supabase';

function ClipCard({ clip, onCopy }: { clip: Clip; onCopy: (c: Clip) => void }) {
  const typeColors: Record<string, string> = {
    text: 'bg-blue-100 text-blue-700',
    link: 'bg-green-100 text-green-700',
    code: 'bg-purple-100 text-purple-700',
    image: 'bg-pink-100 text-pink-700',
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/clip/${clip.id}`)}
      onLongPress={() => onCopy(clip)}
      activeOpacity={0.7}
      className="bg-white dark:bg-neutral-900 rounded-2xl p-4 mb-3 mx-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <View className={`px-2 py-0.5 rounded-full ${typeColors[clip.clip_type] ?? ''}`}>
            <Text className="text-xs font-medium capitalize">{clip.clip_type}</Text>
          </View>
          {clip.pinned && (
            <Text className="text-xs text-brand-600 font-medium">Pinned</Text>
          )}
        </View>
        <Text className="text-xs text-neutral-400">{timeAgo(clip.created_at)}</Text>
      </View>

      {clip.title && (
        <Text className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
          {clip.title}
        </Text>
      )}

      <Text
        className="text-sm text-neutral-600 dark:text-neutral-400 leading-5"
        numberOfLines={3}
      >
        {truncate(clip.content, 200)}
      </Text>
    </TouchableOpacity>
  );
}

export default function ClipFeedScreen() {
  const { user, loading: authLoading } = useAuth();
  const { clips, loading, fetchClips, addClip } = useClips(user?.id);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchClips();
    setRefreshing(false);
  }, [fetchClips]);

  const handlePasteFromClipboard = async () => {
    try {
      const text = await readClipboard();
      if (!text.trim()) {
        Alert.alert('Empty clipboard', 'Nothing to save right now.');
        return;
      }
      await addClip({
        content: text,
        clip_type: detectClipType(text),
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCopyClip = async (clip: Clip) => {
    const { writeClipboard } = await import('@/lib/utils/clipboard');
    await writeClipboard(clip.content);
    Alert.alert('Copied!', 'Clip copied to clipboard.');
  };

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <ActivityIndicator size="large" color="#EA580C" />
      </View>
    );
  }

  if (!user) {
    router.replace('/(auth)/sign-in');
    return null;
  }

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <View className="pt-16 pb-4 px-5 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
        <Text className="text-2xl font-bold text-neutral-900 dark:text-white">
          Pastejar
        </Text>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {clips.length} clip{clips.length !== 1 ? 's' : ''} saved
        </Text>
      </View>

      {/* Clip list */}
      <FlatList
        data={clips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ClipCard clip={item} onCopy={handleCopyClip} />}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EA580C" />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator className="mt-20" size="large" color="#EA580C" />
          ) : (
            <View className="items-center mt-20 px-8">
              <Text className="text-5xl mb-4">📋</Text>
              <Text className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 text-center">
                No clips yet
              </Text>
              <Text className="text-sm text-neutral-500 dark:text-neutral-400 text-center mt-2">
                Tap the button below to save whatever's on your clipboard.
              </Text>
            </View>
          )
        }
      />

      {/* FAB — paste from clipboard */}
      <TouchableOpacity
        onPress={handlePasteFromClipboard}
        activeOpacity={0.85}
        className="absolute bottom-28 right-5 w-14 h-14 rounded-full bg-brand-600 items-center justify-center"
        style={{
          shadowColor: '#EA580C',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Text className="text-white text-2xl font-light">+</Text>
      </TouchableOpacity>
    </View>
  );
}
