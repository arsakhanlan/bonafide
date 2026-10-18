import { useEffect, useState } from 'react';

export interface Profile {
  name: string;
  phone: string;
  account: string;
}

const KEY = 'bonafide-profile';
const EVENT = 'bonafide:profile';
const EMPTY: Profile = { name: '', phone: '', account: '' };

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Profile>;
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      phone: typeof parsed.phone === 'string' ? parsed.phone : '',
      account: typeof parsed.account === 'string' ? parsed.account : '',
    };
  } catch {
    return EMPTY;
  }
}

/** Per-browser details used to prefill letter placeholders. Never sent anywhere. */
export function saveProfile(partial: Partial<Profile>) {
  try {
    const next = { ...loadProfile(), ...partial };
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // Private mode or storage disabled: the letter inputs still work for this session.
  }
}

export function useProfile(): Profile {
  const [profile, setProfile] = useState<Profile>(loadProfile);

  useEffect(() => {
    const refresh = () => setProfile(loadProfile());
    window.addEventListener(EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return profile;
}
