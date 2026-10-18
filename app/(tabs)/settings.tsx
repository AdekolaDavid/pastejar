import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/lib/hooks/useAuth';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      <View className="pt-16 pb-4 px-5 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
        <Text className="text-2xl font-bold text-neutral-900 dark:text-white">
          Settings
        </Text>
      </View>

      <View className="mt-6 mx-4">
        {/* Account section */}
        <View className="bg-white dark:bg-neutral-900 rounded-2xl p-4 mb-4">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
            Account
          </Text>
          <Text className="text-sm text-neutral-700 dark:text-neutral-300">
            {user?.email ?? 'Not signed in'}
          </Text>
        </View>

        {/* Preferences placeholder */}
        <View className="bg-white dark:bg-neutral-900 rounded-2xl p-4 mb-4">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
            Preferences
          </Text>
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-sm text-neutral-700 dark:text-neutral-300">
              Default expiry
            </Text>
            <Text className="text-sm text-neutral-500">24 hours</Text>
          </View>
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-sm text-neutral-700 dark:text-neutral-300">
              Max clips
            </Text>
            <Text className="text-sm text-neutral-500">50</Text>
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-white dark:bg-neutral-900 rounded-2xl p-4 items-center"
          activeOpacity={0.7}
        >
          <Text className="text-red-500 font-semibold text-sm">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
