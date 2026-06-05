import {
  CormorantGaramond_500Medium,
  CormorantGaramond_500Medium_Italic,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import { Inter_500Medium } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth-context';
import { useEntry } from '@/lib/entry-context';

const COLORS = {
  cream: '#F5F1EB',
  dark: '#2B2118',
  textLight: '#FBF8F2',
  olive: '#57634A',
  overlay: 'rgba(20, 16, 12, 0.28)',
};

const BACKGROUNDS = [
  require('./landing-1.jpg'),
  require('./landing-2.jpg'),
  require('./landing-3.jpg'),
  require('./landing-4.jpg'),
];

export default function Landing() {
  const router = useRouter();
  const { session } = useAuth();
  const { markEntered } = useEntry();

  const [fontsLoaded] = useFonts({
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_500Medium_Italic,
    Inter_500Medium,
  });

  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(0)).current; // start hidden so the first photo fades in

  // Fade the current photo IN whenever it changes (and on first load).
  useEffect(() => {
    const anim = Animated.timing(fade, {
      toValue: 1,
      duration: 1600,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [index, fade]);

  // Every 30s, fade the current photo OUT, then switch to the next one.
  useEffect(() => {
    const timer = setInterval(() => {
      Animated.timing(fade, {
        toValue: 0,
        duration: 1600,
        useNativeDriver: true,
      }).start(() => {
        setIndex((i) => (i + 1) % BACKGROUNDS.length);
      });
    }, 30000);
    return () => clearInterval(timer);
  }, [fade]);

  if (!fontsLoaded) {
    return <View style={[styles.root, { backgroundColor: COLORS.cream }]} />;
  }

  return (
    <View style={styles.root}>
      {/* The current photo, fading in and out over the dark background */}
      <Animated.Image source={BACKGROUNDS[index]} style={[styles.bg, { opacity: fade }]} />
      <View style={styles.overlay} />

      <SafeAreaView style={styles.content}>
        <Text style={styles.title}>Musemap</Text>

        <View style={styles.taglineWrap}>
          <Text style={styles.tagline}>your style,</Text>
          <Text style={styles.tagline}>your places,</Text>
          <Text style={styles.tagline}>your confidence.</Text>
          <Text style={styles.script}>wherever you are.</Text>
        </View>

        <View style={styles.bottom}>
          <Pressable
            style={styles.button}
            onPress={() => {
              // Leaving welcome for this app run; the gate then routes a logged-in
              // user to onboarding (no prefs yet) or the tabs (prefs set).
              markEntered();
              if (!session) {
                // New / logged-out users start by creating an account.
                router.push('/signup');
              }
            }}
          >
            <Text style={styles.buttonText}>Start Your Day</Text>
          </Pressable>
          <Text style={styles.login}>
            already have an account?{' '}
            <Text
              style={styles.loginLink}
              onPress={() => {
                markEntered();
                router.push('/login');
              }}
            >
              log in
            </Text>
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.dark },
  bg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.overlay },
  content: { flex: 1, paddingHorizontal: 28, justifyContent: 'space-between' },
  title: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 52, color: COLORS.textLight, marginTop: 8 },
  taglineWrap: { marginBottom: 40 },
  tagline: { fontFamily: 'CormorantGaramond_500Medium', fontSize: 34, lineHeight: 40, color: COLORS.textLight },
  script: { fontFamily: 'CormorantGaramond_500Medium_Italic', fontSize: 24, color: COLORS.textLight, marginTop: 6 },
  bottom: { marginBottom: 24, alignItems: 'center' },
  button: { backgroundColor: COLORS.olive, paddingVertical: 18, borderRadius: 32, width: '100%', alignItems: 'center' },
  buttonText: { fontFamily: 'Inter_500Medium', fontSize: 16, letterSpacing: 0.5, color: COLORS.textLight },
  login: { fontFamily: 'Inter_500Medium', fontSize: 13, color: COLORS.textLight, marginTop: 16, opacity: 0.9 },
  loginLink: { textDecorationLine: 'underline' },
});
