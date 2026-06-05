import { CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Real map graphic later -------------------------------------------------
// Metro resolves require() at bundle time, so we can't runtime-check whether the
// asset exists. To use a real map: drop the file at assets/places-map.png, then
// uncomment the line below and the <ImageBackground> in the render (and remove
// the fallback <View style={styles.mapFallback} />).
//
// import { ImageBackground } from 'react-native';
// const MAP_IMAGE = require('@/assets/places-map.png');
// ---------------------------------------------------------------------------

const COLORS = {
  cream: '#F5F1EB',
  dark: '#2B2118',
  olive: '#57634A',
  textLight: '#FBF8F2',
  mapNeutral: '#E7E6DD',
  hairline: 'rgba(43, 33, 24, 0.12)',
  muted: 'rgba(43, 33, 24, 0.55)',
  backdrop: 'rgba(20, 16, 12, 0.45)',
};

// Pin positions are arbitrary until the real map art lands.
const CITIES: { name: string; top: `${number}%`; left: `${number}%` }[] = [
  { name: 'Milan', top: '24%', left: '30%' },
  { name: 'Paris', top: '44%', left: '60%' },
  { name: 'Madrid', top: '66%', left: '26%' },
];

const OPTIONS = ['Summer Styles', 'Winter Outfits', 'Club Recommendations', 'Photo Op Opportunities'];

export default function PlacesScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const [fontsLoaded] = useFonts({
    CormorantGaramond_600SemiBold,
    Inter_500Medium,
    Inter_400Regular,
  });

  if (!fontsLoaded) {
    return <View style={styles.root} />;
  }

  return (
    <View style={styles.root}>
      {/* Map background. Swap this fallback for <ImageBackground source={MAP_IMAGE} ...> later. */}
      <View style={styles.mapFallback} />
      <View style={styles.mapTint} />

      {/* City pins */}
      {CITIES.map((city) => (
        <Pressable
          key={city.name}
          style={[styles.pin, { top: city.top, left: city.left }]}
          onPress={() => setSelected(city.name)}>
          <View style={styles.pinBubble}>
            <Text style={styles.pinText}>{city.name}</Text>
          </View>
          <View style={styles.pinStem} />
          <View style={styles.pinDot} />
        </Pressable>
      ))}

      {/* City detail bottom sheet */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}>
        {/* Tapping the backdrop dismisses; the inner sheet swallows its own taps. */}
        <Pressable style={styles.backdrop} onPress={() => setSelected(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <SafeAreaView edges={['bottom']}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{selected}</Text>
                <Pressable hitSlop={12} onPress={() => setSelected(null)}>
                  <Text style={styles.close}>✕</Text>
                </Pressable>
              </View>

              {OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  style={styles.option}
                  onPress={() => {
                    // TODO: wire each destination option to its content.
                  }}>
                  <Text style={styles.optionText}>{option}</Text>
                  <Text style={styles.optionChevron}>›</Text>
                </Pressable>
              ))}
            </SafeAreaView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.mapNeutral },

  // Map background (fallback)
  mapFallback: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.mapNeutral },
  mapTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(87, 99, 74, 0.06)' },

  // Pins
  pin: { position: 'absolute', alignItems: 'center' },
  pinBubble: {
    backgroundColor: COLORS.olive,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  pinText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: COLORS.textLight, letterSpacing: 0.3 },
  pinStem: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.olive,
    marginTop: -1,
  },
  pinDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.olive,
    marginTop: 2,
    opacity: 0.5,
  },

  // Bottom sheet
  backdrop: { flex: 1, backgroundColor: COLORS.backdrop, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  sheetTitle: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 34, color: COLORS.dark },
  close: { fontFamily: 'Inter_400Regular', fontSize: 20, color: COLORS.muted },

  // Option rows
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.textLight,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 12,
  },
  optionText: { fontFamily: 'Inter_500Medium', fontSize: 16, color: COLORS.dark },
  optionChevron: { fontFamily: 'Inter_400Regular', fontSize: 22, color: COLORS.olive },
});
