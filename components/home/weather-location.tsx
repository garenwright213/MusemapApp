import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { getCurrentWeather, searchCities, weatherCodeToLabel, type GeoCity } from '@/lib/weather';

const COLORS = {
  cream: '#F5F1EB',
  dark: '#2B2118',
  olive: '#57634A',
  textLight: '#FBF8F2',
  field: '#FCFAF6',
  hairline: 'rgba(43, 33, 24, 0.12)',
  muted: 'rgba(43, 33, 24, 0.55)',
  backdrop: 'rgba(20, 16, 12, 0.45)',
  error: '#A23B2D',
};

export function WeatherLocation() {
  const { user } = useAuth();

  const homeCity = user?.user_metadata?.home_city as string | undefined;
  const homeCountry = user?.user_metadata?.home_country as string | undefined;
  const homeLat = user?.user_metadata?.home_lat as number | undefined;
  const homeLon = user?.user_metadata?.home_lon as number | undefined;
  const hasLocation = typeof homeLat === 'number' && typeof homeLon === 'number';

  const [weather, setWeather] = useState<{ temperatureF: number; code: number } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);

  // Fetch current weather whenever the saved coordinates change.
  useEffect(() => {
    if (!hasLocation) {
      setWeather(null);
      return;
    }
    const controller = new AbortController();
    setWeatherLoading(true);
    setWeatherError(false);
    getCurrentWeather(homeLat!, homeLon!, controller.signal)
      .then((w) => {
        setWeather(w);
        setWeatherLoading(false);
      })
      .catch((e) => {
        if (controller.signal.aborted) return;
        console.warn('getCurrentWeather failed', e);
        setWeatherError(true);
        setWeatherLoading(false);
      });
    return () => controller.abort();
  }, [hasLocation, homeLat, homeLon]);

  function renderWeatherText() {
    if (!hasLocation) {
      return <Text style={styles.prompt}>Set your location</Text>;
    }
    if (weatherLoading) {
      return <Text style={styles.weather}>Loading weather…</Text>;
    }
    if (weatherError || !weather) {
      return (
        <Text style={styles.weather}>
          Weather unavailable · {homeCity}
        </Text>
      );
    }
    return (
      <Text style={styles.weather}>
        {weather.temperatureF}°F · {weatherCodeToLabel(weather.code)} · {homeCity}
        {homeCountry ? `, ${homeCountry}` : ''}
      </Text>
    );
  }

  return (
    <>
      <Pressable onPress={() => setSearchOpen(true)} hitSlop={6}>
        {renderWeatherText()}
      </Pressable>

      <CitySearchModal visible={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function CitySearchModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoCity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Debounced city search as the user types.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      setError(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    const timer = setTimeout(() => {
      searchCities(q, controller.signal)
        .then((r) => {
          setResults(r);
          setLoading(false);
        })
        .catch((e) => {
          if (controller.signal.aborted) return;
          console.warn('searchCities failed', e);
          setError(true);
          setLoading(false);
        });
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function close() {
    setQuery('');
    setResults([]);
    setSaveError(null);
    onClose();
  }

  async function pick(city: GeoCity) {
    setSavingId(city.id);
    setSaveError(null);
    const { error } = await supabase.auth.updateUser({
      data: {
        home_city: city.name,
        home_country: city.country,
        home_lat: city.latitude,
        home_lon: city.longitude,
      },
    });
    setSavingId(null);
    if (error) {
      setSaveError('Could not save your location. Please try again.');
      return;
    }
    // The auth listener refreshes `user`, which re-fetches the weather.
    close();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.modalBackdrop} onPress={close}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <SafeAreaView edges={['bottom']}>
            <View style={styles.sheetHeaderRow}>
              <Text style={styles.sheetTitle}>Set your location</Text>
              <Pressable hitSlop={12} onPress={close}>
                <Text style={styles.close}>✕</Text>
              </Pressable>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <TextInput
                style={styles.input}
                placeholder="Search for a city"
                placeholderTextColor={COLORS.muted}
                value={query}
                onChangeText={setQuery}
                autoFocus
                autoCapitalize="words"
                autoCorrect={false}
              />

              {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}

              <View style={styles.resultsArea}>
                {loading ? (
                  <ActivityIndicator style={styles.resultsLoader} color={COLORS.olive} />
                ) : error ? (
                  <Text style={styles.hint}>Couldn’t search right now. Check your connection.</Text>
                ) : query.trim().length < 2 ? (
                  <Text style={styles.hint}>Type a city name to search.</Text>
                ) : results.length === 0 ? (
                  <Text style={styles.hint}>No matching cities.</Text>
                ) : (
                  <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    {results.map((city) => (
                      <Pressable key={city.id} style={styles.resultRow} onPress={() => pick(city)}>
                        <View style={styles.resultText}>
                          <Text style={styles.resultName}>{city.name}</Text>
                          <Text style={styles.resultSub}>
                            {[city.admin1, city.country].filter(Boolean).join(', ')}
                          </Text>
                        </View>
                        {savingId === city.id ? <ActivityIndicator color={COLORS.olive} /> : null}
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  weather: { fontFamily: 'Inter_400Regular', fontSize: 14, color: COLORS.muted, marginTop: 6 },
  prompt: { fontFamily: 'Inter_500Medium', fontSize: 14, color: COLORS.olive, marginTop: 6 },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: COLORS.backdrop, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
    maxHeight: '80%',
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitle: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 30, color: COLORS.dark },
  close: { fontFamily: 'Inter_400Regular', fontSize: 20, color: COLORS.muted },
  input: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: COLORS.dark,
    backgroundColor: COLORS.field,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  errorText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: COLORS.error, marginTop: 10 },
  resultsArea: { marginTop: 14, minHeight: 80 },
  resultsLoader: { marginTop: 24 },
  hint: { fontFamily: 'Inter_400Regular', fontSize: 14, color: COLORS.muted, marginTop: 20, textAlign: 'center' },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.textLight,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  resultText: { flex: 1, paddingRight: 10 },
  resultName: { fontFamily: 'Inter_500Medium', fontSize: 16, color: COLORS.dark },
  resultSub: { fontFamily: 'Inter_400Regular', fontSize: 13, color: COLORS.muted, marginTop: 2 },
});
