'use client';

import * as React from 'react';

type ColorMode = 'light' | 'dark' | 'system';
type ThemeName = 'default' | 'fennec' | 'mint' | 'pine';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: ThemeName;
  defaultColorMode?: ColorMode;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: ThemeName;
  colorMode: ColorMode;
  resolvedColorMode: 'light' | 'dark';
  setTheme: (theme: ThemeName) => void;
  setColorMode: (colorMode: ColorMode) => void;
};

const initialState: ThemeProviderState = {
  theme: 'default',
  colorMode: 'system',
  resolvedColorMode: 'light',
  setTheme: () => null,
  setColorMode: () => null,
};

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState);

// Theme metadata for UI display
export const themes: { name: ThemeName; label: string; description: string; colors: { primary: string; accent: string } }[] = [
  {
    name: 'default',
    label: 'DryJets Blue',
    description: 'Professional sky blue theme',
    colors: { primary: '#4A90E2', accent: '#52B788' },
  },
  {
    name: 'fennec',
    label: 'Fennec',
    description: 'Warm nardo grey + mandarine orange',
    colors: { primary: '#FF8C42', accent: '#7CB342' },
  },
  {
    name: 'mint',
    label: 'Mint',
    description: 'Fresh mint + cool gray',
    colors: { primary: '#00B894', accent: '#00D68F' },
  },
  {
    name: 'pine',
    label: 'Pine',
    description: 'Deep forest green + warm wood',
    colors: { primary: '#2D6A4F', accent: '#40916C' },
  },
];

export function ThemeProvider({
  children,
  defaultTheme = 'default',
  defaultColorMode = 'light',
  storageKey = 'dryjets-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<ThemeName>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(`${storageKey}-name`) as ThemeName) || defaultTheme;
    }
    return defaultTheme;
  });

  const [colorMode, setColorModeState] = React.useState<ColorMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(`${storageKey}-mode`) as ColorMode) || defaultColorMode;
    }
    return defaultColorMode;
  });

  const [resolvedColorMode, setResolvedColorMode] = React.useState<'light' | 'dark'>('light');

  // Apply theme and color mode to document
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;

    // Set data-theme attribute for CSS theme variables
    root.setAttribute('data-theme', theme);

    // Handle color mode
    root.classList.remove('light', 'dark');

    let resolved: 'light' | 'dark';
    if (colorMode === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = colorMode;
    }

    root.classList.add(resolved);
    setResolvedColorMode(resolved);
  }, [theme, colorMode]);

  // Listen for system color scheme changes
  React.useEffect(() => {
    if (typeof window === 'undefined' || colorMode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      const resolved = e.matches ? 'dark' : 'light';
      root.classList.add(resolved);
      setResolvedColorMode(resolved);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [colorMode]);

  const setTheme = (newTheme: ThemeName) => {
    localStorage.setItem(`${storageKey}-name`, newTheme);
    setThemeState(newTheme);
  };

  const setColorMode = (newColorMode: ColorMode) => {
    localStorage.setItem(`${storageKey}-mode`, newColorMode);
    setColorModeState(newColorMode);
  };

  const value: ThemeProviderState = {
    theme,
    colorMode,
    resolvedColorMode,
    setTheme,
    setColorMode,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);

  if (context === undefined) {
    // During SSR, return initial state instead of throwing
    if (typeof window === 'undefined') {
      return initialState;
    }
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
