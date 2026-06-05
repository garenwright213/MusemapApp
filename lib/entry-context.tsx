import { createContext, useCallback, useContext, useState, type PropsWithChildren } from 'react';

/**
 * Tracks whether the user has left the welcome screen during this app run.
 *
 * This is deliberately **in-memory only** (never persisted): a cold start spins
 * up a fresh JS context, so the provider remounts and `hasEntered` resets to
 * `false` → the app lands on welcome. A warm resume keeps the same JS context,
 * so `hasEntered` (and the current route) are preserved → no reset to welcome.
 * That cold/warm distinction is exactly what we want, with no AppState code.
 */
type EntryState = {
  hasEntered: boolean;
  markEntered: () => void;
};

const EntryContext = createContext<EntryState>({
  hasEntered: false,
  markEntered: () => {},
});

export function useEntry() {
  return useContext(EntryContext);
}

export function EntryProvider({ children }: PropsWithChildren) {
  const [hasEntered, setHasEntered] = useState(false);
  const markEntered = useCallback(() => setHasEntered(true), []);

  return <EntryContext.Provider value={{ hasEntered, markEntered }}>{children}</EntryContext.Provider>;
}
