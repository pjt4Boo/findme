import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { authSignIn, authSignUp, saveSession, clearSession, getSessionUserId, getProfileById, updateProfile } from '@/lib/supabase';
import type { Profile, Language } from '@/types';
import { translate, type TranslationKey } from '@/lib/i18n';

interface LocalUser {
  id: string;
  email: string;
}

interface AuthContextValue {
  session: { user: LocalUser } | null;
  user: LocalUser | null;
  profile: Profile | null;
  loading: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('findme-lang') as Language) || 'en';
  });

  const fetchProfile = useCallback(async (userId: string) => {
    const p = await getProfileById(userId);
    if (p) {
      setProfile(p);
      if (p.preferred_language) {
        setLanguageState(p.preferred_language as Language);
      }
    }
  }, []);

  useEffect(() => {
    const userId = getSessionUserId();
    if (userId) {
      getProfileById(userId).then((p) => {
        if (p) {
          setUser({ id: p.id, email: p.email });
          setProfile(p);
          if (p.preferred_language) setLanguageState(p.preferred_language as Language);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('findme-lang', lang);
  }, []);

  const t = useCallback((key: TranslationKey) => translate(language, key), [language]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { profile: p, error } = await authSignIn(email, password);
    if (error) return { error };
    if (p) {
      saveSession(p.id);
      setUser({ id: p.id, email: p.email });
      setProfile(p);
      if (p.preferred_language) setLanguageState(p.preferred_language as Language);
    }
    return { error: null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { profile: p, error } = await authSignUp(email, password, fullName);
    if (error) return { error };
    if (p) {
      saveSession(p.id);
      setUser({ id: p.id, email: p.email });
      setProfile(p);
    }
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    clearSession();
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  return (
    <AuthContext.Provider
      value={{ session: user ? { user } : null, user, profile, loading, language, setLanguage, t, signIn, signUp, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
