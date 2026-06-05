import { CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SavedPlaces } from '@/components/saved/saved-places';

const COLORS = {
  cream: '#F5F1EB',
  dark: '#2B2118',
  olive: '#57634A',
  textLight: '#FBF8F2',
  hairline: 'rgba(43, 33, 24, 0.12)',
  muted: 'rgba(43, 33, 24, 0.55)',
};

const TABS = ['Looks', 'Places', 'Lists'] as const;
type Tab = (typeof TABS)[number];

export default function SavedScreen() {
  const [tab, setTab] = useState<Tab>('Places');
  const [fontsLoaded] = useFonts({
    CormorantGaramond_600SemiBold,
    Inter_500Medium,
    Inter_400Regular,
  });

  // Optional deep-link: e.g. the Profile stats open /(tabs)/saved?tab=Looks.
  // With no param this is a no-op and behavior is unchanged.
  const params = useLocalSearchParams<{ tab?: string }>();
  useEffect(() => {
    if (params.tab && (TABS as readonly string[]).includes(params.tab)) {
      setTab(params.tab as Tab);
    }
  }, [params.tab]);

  if (!fontsLoaded) {
    return <View style={styles.root} />;
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.header}>Saved</Text>

        {/* Sub-tab switcher */}
        <View style={styles.segmented}>
          {TABS.map((t) => {
            const active = t === tab;
            return (
              <Pressable
                key={t}
                style={[styles.segment, active && styles.segmentActive]}
                onPress={() => setTab(t)}>
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{t}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Sub-tab body */}
        <View style={styles.body}>
          {tab === 'Places' ? (
            <SavedPlaces />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>{tab}</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.cream },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 12 },
  header: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 40, color: COLORS.dark },

  segmented: {
    flexDirection: 'row',
    backgroundColor: COLORS.textLight,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    borderRadius: 24,
    padding: 4,
    marginTop: 16,
    marginBottom: 22,
  },
  segment: { flex: 1, paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  segmentActive: { backgroundColor: COLORS.olive },
  segmentText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: COLORS.muted },
  segmentTextActive: { color: COLORS.textLight },

  body: { flex: 1 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 28, color: COLORS.dark },
});
