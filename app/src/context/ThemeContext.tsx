import { usePreferences, type Theme } from './PreferencesContext';

export type { Theme, PreferencesProviderProps as ThemeProviderProps } from './PreferencesContext';

export interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export { PreferencesProvider as ThemeProvider } from './PreferencesContext';

export function useTheme(): ThemeContextValue {
  const { theme, isDark, toggleTheme, setTheme } = usePreferences();
  return { theme, isDark, toggleTheme, setTheme };
}
