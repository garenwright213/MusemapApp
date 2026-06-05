import { useRouter } from 'expo-router';

import { VibeQuiz, type Preferences } from '@/components/onboarding/vibe-quiz';
import { useAuth } from '@/lib/auth-context';

// Editable version of the quiz, opened from the Profile "Preferences" row.
// Pre-filled with the saved selections; re-saving keeps the user in the app.
export default function PreferencesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const initial = (user?.user_metadata?.preferences as Preferences | undefined) ?? null;

  return <VibeQuiz initial={initial} onDone={() => router.back()} onCancel={() => router.back()} />;
}
