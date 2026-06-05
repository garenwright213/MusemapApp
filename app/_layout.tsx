import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/lib/auth-context';
import { EntryProvider, useEntry } from '@/lib/entry-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Keep the native splash up until we know whether a session exists, so the app
// doesn't flash the welcome screen before redirecting a logged-in user.
SplashScreen.preventAutoHideAsync();

function SplashScreenController() {
  const { isLoading } = useAuth();
  useEffect(() => {
    // Hide once, when loading finishes. Calling this on every render (and while a
    // modal view controller is on top) throws "no native splash registered…";
    // the catch swallows the harmless rejection if it's already hidden.
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoading]);
  return null;
}

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { session, user } = useAuth();
  const { hasEntered } = useEntry();
  const hasPreferences = !!user?.user_metadata?.preferences;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Welcome / login / sign up. Shown on cold start (hasEntered=false)
            regardless of session, and whenever there is no session. */}
        <Stack.Protected guard={!hasEntered || !session}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
        </Stack.Protected>

        {/* Onboarding quiz: entered with a session but no preferences saved yet. */}
        <Stack.Protected guard={hasEntered && !!session && !hasPreferences}>
          <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        </Stack.Protected>

        {/* The tabbed app + the Preferences editor: entered, session, prefs set. */}
        <Stack.Protected guard={hasEntered && !!session && hasPreferences}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="preferences" options={{ headerShown: false, presentation: 'modal' }} />
        </Stack.Protected>

        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <EntryProvider>
        <SplashScreenController />
        <RootNavigator />
      </EntryProvider>
    </AuthProvider>
  );
}
