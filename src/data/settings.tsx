import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/**
 * Simple app settings, persisted with AsyncStorage.
 * (Structured data like analyses and the music profile lives in SQLite.)
 */
export interface AppSettings {
  /** e.g. "http://192.168.178.20:11434" – the PC running Ollama */
  ollamaUrl: string;
  /** Ollama vision model, e.g. "qwen3-vl:4b" */
  ollamaModel: string;
  /** Force demo mode even if Ollama is reachable. UI toggle is added in Phase 4. */
  forceDemoMode: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  ollamaUrl: '',
  ollamaModel: 'qwen3-vl:4b',
  forceDemoMode: false,
};

const STORAGE_KEY = 'storytune.settings.v1';

type SettingsContextValue = {
  settings: AppSettings;
  loaded: boolean;
  update: (patch: Partial<AppSettings>) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setSettings({ ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) });
      })
      .catch(() => {
        /* corrupt or unavailable storage → keep defaults */
      })
      .finally(() => setLoaded(true));
  }, []);

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(() => ({ settings, loaded, update }), [settings, loaded, update]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}
