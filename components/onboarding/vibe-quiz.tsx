import { CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';

const COLORS = {
  cream: '#F5F1EB',
  dark: '#2B2118',
  olive: '#57634A',
  textLight: '#FBF8F2',
  field: '#FCFAF6',
  hairline: 'rgba(43, 33, 24, 0.12)',
  muted: 'rgba(43, 33, 24, 0.55)',
  error: '#A23B2D',
  lightOnOlive: 'rgba(251, 248, 242, 0.85)',
};

export type Preferences = {
  regions: string[];
  style: string[];
  trip: string[];
  palette: string[];
  feel: string[];
};

type Option = { value: string; title: string; description?: string };
type Step = { key: keyof Preferences; question: string; options: Option[] };

const STEPS: Step[] = [
  {
    key: 'regions',
    question: 'Where do you hope to travel?',
    options: [
      { value: 'western-europe', title: 'Western Europe', description: 'Old-world cities, café culture, quiet luxury' },
      { value: 'islands', title: 'Islands', description: 'Ocean, nature, barefoot island living' },
      { value: 'south-america', title: 'South America', description: 'Adventure, surf & wellness' },
      { value: 'asia', title: 'Asia', description: 'Vibrant cities, street style, food & energy' },
    ],
  },
  {
    key: 'style',
    question: "What's your style?",
    options: [
      { value: 'clean-minimal', title: 'Clean & minimal' },
      { value: 'old-money', title: 'Old-money classic' },
      { value: 'boho', title: 'Boho & relaxed' },
      { value: 'street-edgy', title: 'Street & edgy' },
      { value: 'romantic', title: 'Romantic & feminine' },
    ],
  },
  {
    key: 'trip',
    question: "What's a trip for you?",
    options: [
      { value: 'cafe-hopping', title: 'Café-hopping' },
      { value: 'beach-days', title: 'Beach days' },
      { value: 'nightlife-dining', title: 'Nightlife & dining' },
      { value: 'culture', title: 'Culture & sightseeing' },
      { value: 'outdoor', title: 'Outdoor adventure' },
    ],
  },
  {
    key: 'palette',
    question: 'Your go-to palette?',
    options: [
      { value: 'neutrals', title: 'Neutrals & earth tones' },
      { value: 'monochrome', title: 'Black & monochrome' },
      { value: 'bold', title: 'Bold & colorful' },
      { value: 'pastels', title: 'Soft pastels' },
    ],
  },
  {
    key: 'feel',
    question: 'You want to feel…',
    options: [
      { value: 'effortless', title: 'Effortless' },
      { value: 'polished', title: 'Polished' },
      { value: 'bold', title: 'Bold' },
      { value: 'comfortable', title: 'Comfortable' },
    ],
  },
];

const EMPTY: Preferences = { regions: [], style: [], trip: [], palette: [], feel: [] };

export function VibeQuiz({
  initial,
  onDone,
  onCancel,
}: {
  initial: Preferences | null;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const [fontsLoaded] = useFonts({
    CormorantGaramond_600SemiBold,
    Inter_600SemiBold,
    Inter_500Medium,
    Inter_400Regular,
  });

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Preferences>(() => ({ ...EMPTY, ...(initial ?? {}) }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const selected = answers[current.key];

  function toggle(value: string) {
    setAnswers((prev) => {
      const list = prev[current.key];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { ...prev, [current.key]: next };
    });
  }

  async function finish() {
    setSaving(true);
    setError(null);
    const { error: saveError } = await supabase.auth.updateUser({ data: { preferences: answers } });
    setSaving(false);
    if (saveError) {
      setError('Could not save your preferences. Please try again.');
      return;
    }
    onDone();
  }

  if (!fontsLoaded) {
    return <View style={styles.root} />;
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.brand}>Your Vibe</Text>
          {onCancel ? (
            <Pressable hitSlop={12} onPress={onCancel}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          ) : null}
        </View>
        <Text style={styles.stepLabel}>Step {step + 1} of {STEPS.length}</Text>
        <Text style={styles.question}>{current.question}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {current.options.map((opt) => {
          const on = selected.includes(opt.value);
          return (
            <Pressable
              key={opt.value}
              style={[styles.card, on && styles.cardOn]}
              onPress={() => toggle(opt.value)}>
              <Text style={[styles.cardTitle, on && styles.cardTitleOn]}>{opt.title}</Text>
              {opt.description ? (
                <Text style={[styles.cardDesc, on && styles.cardDescOn]}>{opt.description}</Text>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.footer}>
        {step > 0 ? (
          <Pressable style={styles.backButton} onPress={() => setStep((s) => s - 1)} disabled={saving}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        ) : (
          <View style={styles.backSpacer} />
        )}

        <Pressable
          style={[styles.nextButton, saving && styles.disabled]}
          onPress={() => (isLast ? finish() : setStep((s) => s + 1))}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator color={COLORS.textLight} />
          ) : (
            <Text style={styles.nextText}>{isLast ? 'Finish' : 'Next'}</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.cream },
  header: { paddingHorizontal: 24, paddingTop: 8 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { fontFamily: 'Inter_500Medium', fontSize: 13, letterSpacing: 1.2, textTransform: 'uppercase', color: COLORS.olive },
  close: { fontFamily: 'Inter_400Regular', fontSize: 20, color: COLORS.muted },
  stepLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: COLORS.muted, marginTop: 18 },
  question: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 36, color: COLORS.dark, marginTop: 4, lineHeight: 40 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    gap: 14,
  },
  card: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: COLORS.field,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    borderRadius: 20,
    padding: 18,
    justifyContent: 'flex-end',
  },
  cardOn: { backgroundColor: COLORS.olive, borderColor: COLORS.olive },
  cardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 18, color: COLORS.dark },
  cardTitleOn: { color: COLORS.textLight },
  cardDesc: { fontFamily: 'Inter_400Regular', fontSize: 12, color: COLORS.muted, marginTop: 6, lineHeight: 16 },
  cardDescOn: { color: COLORS.lightOnOlive },

  errorText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: COLORS.error, textAlign: 'center', marginBottom: 8 },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 8,
  },
  backButton: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 32 },
  backText: { fontFamily: 'Inter_500Medium', fontSize: 16, color: COLORS.muted },
  backSpacer: { width: 0 },
  nextButton: {
    flex: 1,
    backgroundColor: COLORS.olive,
    paddingVertical: 18,
    borderRadius: 32,
    alignItems: 'center',
  },
  nextText: { fontFamily: 'Inter_500Medium', fontSize: 16, letterSpacing: 0.5, color: COLORS.textLight },
  disabled: { opacity: 0.6 },
});
