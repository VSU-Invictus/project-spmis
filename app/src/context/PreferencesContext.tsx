import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type UiDensity = 'comfortable' | 'compact';
export type Theme = 'light' | 'dark';

export interface PreferencesContextValue {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  density: UiDensity;
  setDensity: (density: UiDensity) => void;
  tablePageSizes: Record<string, number>;
  setTablePageSize: (tableId: string, pageSize: number) => void;
}

interface StoredPreferences {
  density: UiDensity;
  tablePageSizes: Record<string, number>;
}

const PREFERENCES_STORAGE_KEY = 'spmis-preferences';
const THEME_STORAGE_KEY = 'spmis-theme';
const ALLOWED_PAGE_SIZES = new Set([5, 10, 20]);

function readPreferences(): StoredPreferences {
  if (typeof window === 'undefined') return { density: 'comfortable', tablePageSizes: {} };
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? 'null');
    if (!value || typeof value !== 'object') return { density: 'comfortable', tablePageSizes: {} };
    const saved = value as Partial<StoredPreferences>;
    const pageSizes = Object.fromEntries(
      Object.entries(saved.tablePageSizes ?? {}).filter(
        ([key, size]) => key.length > 0 && ALLOWED_PAGE_SIZES.has(size)
      )
    );
    return {
      density: saved.density === 'compact' ? 'compact' : 'comfortable',
      tablePageSizes: pageSizes,
    };
  } catch {
    return { density: 'comfortable', tablePageSizes: {} };
  }
}

function readTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY) || window.localStorage.getItem('theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  } catch {
    return 'dark';
  }
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export interface PreferencesProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function PreferencesProvider({ children, defaultTheme }: PreferencesProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => defaultTheme ?? readTheme());
  const [preferences, setPreferences] = useState<StoredPreferences>(readPreferences);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-density', preferences.density);
    root.style.colorScheme = theme;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
      window.localStorage.setItem('theme', theme);
    } catch {
      // The selected theme remains active for this session if storage is unavailable.
    }
  }, [theme, preferences.density]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Preferences remain available for this session if storage is unavailable.
    }
  }, [preferences]);

  const setTheme = useCallback((nextTheme: Theme) => setThemeState(nextTheme), []);
  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);
  const setDensity = useCallback((density: UiDensity) => {
    setPreferences((current) => ({ ...current, density }));
  }, []);
  const setTablePageSize = useCallback((tableId: string, pageSize: number) => {
    if (!tableId || !ALLOWED_PAGE_SIZES.has(pageSize)) return;
    setPreferences((current) => ({
      ...current,
      tablePageSizes: { ...current.tablePageSizes, [tableId]: pageSize },
    }));
  }, []);

  const value = useMemo<PreferencesContextValue>(() => ({
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
    density: preferences.density,
    setDensity,
    tablePageSizes: preferences.tablePageSizes,
    setTablePageSize,
  }), [theme, toggleTheme, setTheme, preferences, setDensity, setTablePageSize]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used within a PreferencesProvider');
  return context;
}

export function useOptionalPreferences(): PreferencesContextValue | undefined {
  return useContext(PreferencesContext);
}
