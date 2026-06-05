import { CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';

const COLORS = {
  cream: '#F5F1EB',
  dark: '#2B2118',
  olive: '#57634A',
  textLight: '#FBF8F2',
  field: '#FCFAF6',
  border: 'rgba(43, 33, 24, 0.15)',
  muted: 'rgba(43, 33, 24, 0.6)',
  error: '#A23B2D',
};

export default function Login() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    CormorantGaramond_600SemiBold,
    Inter_500Medium,
    Inter_400Regular,
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    setError(null);
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);
    if (error) {
      // Supabase returns "Invalid login credentials" — soften it for users.
      setError(
        /invalid login/i.test(error.message)
          ? "That email or password doesn't look right. Please try again."
          : error.message,
      );
    }
    // On success the auth listener flips the gate and routes into the tabs.
  }

  if (!fontsLoaded) {
    return <View style={[styles.root, styles.center]} />;
  }

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.back}>← back</Text>
          </Pressable>

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to pick up where you left off.</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.muted}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.muted}
              autoCapitalize="none"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color={COLORS.textLight} />
              ) : (
                <Text style={styles.buttonText}>Log in</Text>
              )}
            </Pressable>
          </View>

          <Text style={styles.footer}>
            new here?{' '}
            <Link href="/signup" style={styles.footerLink}>
              create an account
            </Link>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.cream },
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: 28, paddingTop: 12, justifyContent: 'center' },
  back: { fontFamily: 'Inter_500Medium', fontSize: 15, color: COLORS.muted, marginBottom: 24 },
  title: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 44, color: COLORS.dark },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 15, color: COLORS.muted, marginTop: 4 },
  form: { marginTop: 28 },
  input: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: COLORS.dark,
    backgroundColor: COLORS.field,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
  },
  error: { fontFamily: 'Inter_400Regular', fontSize: 14, color: COLORS.error, marginBottom: 12 },
  button: {
    backgroundColor: COLORS.olive,
    paddingVertical: 18,
    borderRadius: 32,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontFamily: 'Inter_500Medium', fontSize: 16, letterSpacing: 0.5, color: COLORS.textLight },
  footer: { fontFamily: 'Inter_400Regular', fontSize: 14, color: COLORS.muted, textAlign: 'center', marginTop: 28 },
  footerLink: { fontFamily: 'Inter_500Medium', color: COLORS.olive, textDecorationLine: 'underline' },
});
