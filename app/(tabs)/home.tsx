import { CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WeatherLocation } from '@/components/home/weather-location';
import { useAuth } from '@/lib/auth-context';

const COLORS = {
  cream: '#F5F1EB',
  dark: '#2B2118',
  olive: '#57634A',
  textLight: '#FBF8F2',
  placeholder: '#E4DDD0',
  muted: 'rgba(43, 33, 24, 0.55)',
};

// --- Static placeholder content (swap each block for real data later) ---

// TODO: replace with the day's featured look from the backend.
const TODAYS_MUSE = {
  title: 'Italian Chic',
  subtitle: 'Aperitivo in Brera · 6:30 PM',
};

// TODO: replace with real vibe collections.
const VIBES = ['Clean Girl', 'Italian Summer', 'Luxury Student', 'City Chic'];

function getGreeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [fontsLoaded] = useFonts({
    CormorantGaramond_600SemiBold,
    Inter_500Medium,
    Inter_400Regular,
  });

  const fullName = (user?.user_metadata?.full_name as string | undefined)?.trim();
  const firstName = fullName ? fullName.split(' ')[0] : null;
  const greeting = getGreeting(new Date());

  if (!fontsLoaded) {
    return <View style={styles.root} />;
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        {firstName ? (
          <>
            <Text style={styles.greetingLabel}>{greeting},</Text>
            <Text style={styles.greetingName}>{firstName}</Text>
          </>
        ) : (
          <Text style={styles.greetingName}>{greeting}</Text>
        )}

        {/* Weather + user-settable location (Open-Meteo) */}
        <WeatherLocation />

        {/* Today's Muse */}
        <View style={styles.museCard}>
          <View style={styles.museImage} />
          <View style={styles.museBody}>
            <Text style={styles.museTitle}>{TODAYS_MUSE.title}</Text>
            <Text style={styles.museSubtitle}>{TODAYS_MUSE.subtitle}</Text>
            <Pressable
              style={styles.museButton}
              onPress={() => {
                // TODO: open the full look detail screen.
              }}>
              <Text style={styles.museButtonText}>View Full Look</Text>
            </Pressable>
          </View>
        </View>

        {/* Explore Vibes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explore Vibes</Text>
          <Pressable
            hitSlop={8}
            onPress={() => {
              // TODO: navigate to the full vibes list.
            }}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.vibesRow}>
          {VIBES.map((vibe) => (
            <View key={vibe} style={styles.vibeCard}>
              <View style={styles.vibeImage} />
              <Text style={styles.vibeLabel}>{vibe}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Required by the Open-Meteo license (CC BY 4.0). */}
        <Text style={styles.attribution}>Weather by Open-Meteo</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.cream },
  content: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 },

  // Greeting
  greetingLabel: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 30, color: COLORS.dark },
  greetingName: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 44, color: COLORS.dark, lineHeight: 48 },

  // Today's Muse
  museCard: {
    marginTop: 28,
    borderRadius: 24,
    backgroundColor: COLORS.textLight,
    overflow: 'hidden',
    // subtle lift off the cream background
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  museImage: { height: 220, backgroundColor: COLORS.placeholder },
  museBody: { padding: 20 },
  museTitle: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 28, color: COLORS.dark },
  museSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: COLORS.muted, marginTop: 4 },
  museButton: {
    backgroundColor: COLORS.olive,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 18,
  },
  museButtonText: { fontFamily: 'Inter_500Medium', fontSize: 15, letterSpacing: 0.5, color: COLORS.textLight },

  // Explore Vibes
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 36,
    marginBottom: 16,
  },
  sectionTitle: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 26, color: COLORS.dark },
  seeAll: { fontFamily: 'Inter_500Medium', fontSize: 14, color: COLORS.olive },
  vibesRow: { gap: 14, paddingRight: 8 },
  vibeCard: { width: 124 },
  vibeImage: { width: 124, height: 160, borderRadius: 18, backgroundColor: COLORS.placeholder },
  vibeLabel: { fontFamily: 'Inter_500Medium', fontSize: 14, color: COLORS.dark, marginTop: 8 },

  attribution: { fontFamily: 'Inter_400Regular', fontSize: 11, color: COLORS.muted, marginTop: 28, textAlign: 'center' },
});
