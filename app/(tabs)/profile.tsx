import { CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth-context';
import { getSavedStats } from '@/lib/collections';
import { supabase } from '@/lib/supabase';

const COLORS = {
  cream: '#F5F1EB',
  dark: '#2B2118',
  olive: '#57634A',
  textLight: '#FBF8F2',
  hairline: 'rgba(43, 33, 24, 0.12)',
  muted: 'rgba(43, 33, 24, 0.6)',
  avatarBg: 'rgba(87, 99, 74, 0.15)',
};

type Stat = { label: string; value: number; tab?: 'Looks' | 'Places' | 'Lists' };

function getInitials(name?: string, email?: string) {
  const n = name?.trim();
  if (n) {
    const parts = n.split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }
  if (email) return email[0]?.toUpperCase() ?? '✦';
  return '✦';
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [fontsLoaded] = useFonts({
    CormorantGaramond_600SemiBold,
    Inter_500Medium,
    Inter_400Regular,
  });

  const [stats, setStats] = useState({ places: 0, cities: 0 });
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const fullName = (user?.user_metadata?.full_name as string | undefined)?.trim();

  // Refresh the collector counts whenever the screen comes into focus, so saving
  // a place elsewhere is reflected here.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      getSavedStats()
        .then((s) => active && setStats(s))
        .catch((e) => console.warn('getSavedStats failed', e));
      return () => {
        active = false;
      };
    }, []),
  );

  async function handleLogout() {
    setSigningOut(true);
    // On sign out the auth listener clears the session and the gate returns the
    // user to the welcome screen automatically.
    await supabase.auth.signOut();
  }

  if (!fontsLoaded) {
    return <View style={styles.root} />;
  }

  const statsRow: Stat[] = [
    { label: 'Looks', value: 0, tab: 'Looks' },
    { label: 'Places', value: stats.places, tab: 'Places' },
    { label: 'Lists', value: 0, tab: 'Lists' },
    { label: 'Countries', value: 0 },
    { label: 'Cities', value: stats.cities },
  ];

  const settings: { label: string; onPress: () => void }[] = [
    { label: 'Preferences', onPress: () => router.push('/preferences') },
    { label: 'Languages', onPress: () => {} }, // TODO
    { label: 'App Permissions', onPress: () => {} }, // TODO
    { label: 'Account Settings', onPress: () => {} }, // TODO
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(fullName, user?.email)}</Text>
          </View>
          <Text style={styles.name}>{fullName ?? 'Welcome'}</Text>
          <Text style={styles.subtitle}>Add your home city</Text>
        </View>

        {/* Collector stats */}
        <View style={styles.statsRow}>
          {statsRow.map((s) => {
            const content = (
              <>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </>
            );
            return s.tab ? (
              <Pressable
                key={s.label}
                style={styles.stat}
                onPress={() => router.push({ pathname: '/(tabs)/saved', params: { tab: s.tab } })}>
                {content}
              </Pressable>
            ) : (
              <View key={s.label} style={styles.stat}>
                {content}
              </View>
            );
          })}
        </View>

        {/* Settings menu */}
        <View style={styles.menu}>
          <View style={styles.menuRow}>
            <Text style={styles.menuLabel}>Notifications</Text>
            <Switch
              value={notificationsOn}
              onValueChange={setNotificationsOn}
              trackColor={{ false: COLORS.hairline, true: COLORS.olive }}
              thumbColor={COLORS.textLight}
              ios_backgroundColor={COLORS.hairline}
            />
          </View>
          {settings.map((item) => (
            <Pressable key={item.label} style={[styles.menuRow, styles.menuDivider]} onPress={item.onPress}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>

        {/* Bottom: email + log out (unchanged) */}
        <View style={styles.bottom}>
          <Text style={styles.email}>{user?.email}</Text>
          <Pressable
            style={[styles.button, signingOut && styles.buttonDisabled]}
            onPress={handleLogout}
            disabled={signingOut}>
            {signingOut ? (
              <ActivityIndicator color={COLORS.textLight} />
            ) : (
              <Text style={styles.buttonText}>Log out</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.cream },
  content: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 16, paddingBottom: 24 },

  // Header
  header: { alignItems: 'center', marginBottom: 28 },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: COLORS.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 34, color: COLORS.olive },
  name: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 34, color: COLORS.dark },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: COLORS.muted, marginTop: 2 },

  // Stats
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  statValue: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 26, color: COLORS.dark },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: COLORS.muted, marginTop: 2 },

  // Settings menu
  menu: {
    backgroundColor: COLORS.textLight,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    borderRadius: 18,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  menuDivider: { borderTopWidth: 1, borderTopColor: COLORS.hairline },
  menuLabel: { fontFamily: 'Inter_500Medium', fontSize: 16, color: COLORS.dark },
  chevron: { fontFamily: 'Inter_400Regular', fontSize: 22, color: COLORS.olive },

  // Bottom (unchanged behavior/look)
  bottom: { marginTop: 'auto', paddingTop: 32 },
  email: { fontFamily: 'Inter_400Regular', fontSize: 15, color: COLORS.muted, marginBottom: 16, textAlign: 'center' },
  button: {
    backgroundColor: COLORS.olive,
    paddingVertical: 18,
    borderRadius: 32,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontFamily: 'Inter_500Medium', fontSize: 16, letterSpacing: 0.5, color: COLORS.textLight },
});
