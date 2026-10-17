import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  signInGuest: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
        if (currentUser) {
          setUser(currentUser);
          try {
            const t = await currentUser.getIdToken();
            setToken(t);
          } catch {
            setToken('demo-token');
          }
        } else {
          // Attempt automatic anonymous sign in for frictionless UX
          try {
            const cred = await signInAnonymously(auth);
            setUser(cred.user);
            const t = await cred.user.getIdToken();
            setToken(t);
          } catch {
            // Offline or mock fallback
            setUser({
              uid: 'demo_citizen_user',
              isAnonymous: true,
            } as User);
            setToken('demo-token');
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch {
      setUser({
        uid: 'demo_citizen_user',
        isAnonymous: true,
      } as User);
      setToken('demo-token');
      setLoading(false);
    }
  }, []);

  const signInGuest = async () => {
    try {
      const cred = await signInAnonymously(auth);
      setUser(cred.user);
      const t = await cred.user.getIdToken();
      setToken(t);
    } catch (e) {
      console.warn('Guest signin fallback', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, signInGuest }}>
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
