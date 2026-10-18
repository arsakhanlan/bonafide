import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { IS_MOCK } from '@/lib/mode';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  /** Set only when Firebase itself is unreachable (real mode shows it, mock mode fakes past it). */
  authError: string | null;
  signInGuest: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER = { uid: 'demo_citizen_user', isAnonymous: true } as User;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(IS_MOCK ? MOCK_USER : null);
  const [token, setToken] = useState<string | null>(IS_MOCK ? 'demo-token' : null);
  const [loading, setLoading] = useState(!IS_MOCK);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Mock mode has no backend and no auth: a fake session is the point.
    if (IS_MOCK) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          setToken(await currentUser.getIdToken());
        } catch {
          setToken(null);
        }
      } else {
        // Automatic anonymous sign-in for frictionless UX.
        try {
          const cred = await signInAnonymously(auth);
          setUser(cred.user);
          setToken(await cred.user.getIdToken());
        } catch (e: any) {
          setAuthError('Could not reach Firebase login. Check your connection and reload.');
          console.warn('Anonymous sign-in failed', e);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInGuest = async () => {
    if (IS_MOCK) return;
    setAuthError(null);
    try {
      const cred = await signInAnonymously(auth);
      setUser(cred.user);
      setToken(await cred.user.getIdToken());
    } catch (e: any) {
      setAuthError('Could not reach Firebase login. Check your connection and reload.');
      console.warn('Guest sign-in failed', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, authError, signInGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
