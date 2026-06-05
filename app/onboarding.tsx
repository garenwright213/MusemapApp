import { VibeQuiz } from '@/components/onboarding/vibe-quiz';

// Forced onboarding step, shown when a logged-in user has no `preferences` yet.
// On finish, saving prefs flips the gate's `hasPreferences` → it routes into the
// tabs automatically, so no explicit navigation is needed here.
export default function Onboarding() {
  return <VibeQuiz initial={null} onDone={() => {}} />;
}
