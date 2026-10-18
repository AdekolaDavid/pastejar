import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/lib/hooks/useAuth';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Sign in failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white dark:bg-neutral-950"
    >
      <View className="flex-1 justify-center px-6">
        {/* Logo area */}
        <View className="items-center mb-12">
          <Text className="text-4xl font-bold text-brand-600 dark:text-brand-400">
            Pastejar
          </Text>
          <Text className="text-base text-neutral-500 dark:text-neutral-400 mt-2">
            Your clipboard, always safe
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <TextInput
            className="h-12 rounded-xl bg-neutral-100 dark:bg-neutral-900 px-4 text-base text-neutral-900 dark:text-white"
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <TextInput
            className="h-12 rounded-xl bg-neutral-100 dark:bg-neutral-900 px-4 text-base text-neutral-900 dark:text-white"
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          <TouchableOpacity
            onPress={handleSignIn}
            disabled={loading}
            className="h-12 rounded-xl bg-brand-600 items-center justify-center mt-2"
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Sign In
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign up link */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-neutral-500 dark:text-neutral-400">
            Don't have an account?{' '}
          </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity>
              <Text className="text-brand-600 dark:text-brand-400 font-semibold">
                Sign Up
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
