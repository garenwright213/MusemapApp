import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { supabase } from './supabase';

type AuthState = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  isLoading: true,
});

/** Access the current auth session/user anywhere in the app. */
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Seed state from any persisted session (AsyncStorage) on launch.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    // 2. Stay in sync with sign in / sign out / token refresh while running.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
