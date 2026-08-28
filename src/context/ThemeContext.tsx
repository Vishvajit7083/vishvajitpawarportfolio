import React, { createContext, useContext, useEffect, useState } from 'react';
import { soundFx } from '../utils/audio';

export type ThemeMode = 'neon_cyber' | 'stealth_slate' | 'quantum_emerald' | 'solar_amber' | 'clean_clinical';

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  shortName: string;
  badge: string;
  accentColor: string;
  glowColor: string;
}

export const THEME_PRESETS: Record<string, ThemeConfig> = {
  neon_cyber: {
    id: 'neon_cyber',
    name: 'Neon Cyber Matrix',
    shortName: 'NEON CYBER',
    badge: 'CYBER LAB',
    accentColor: '#00f0ff',
    glowColor: 'rgba(0, 240, 255, 0.4)',
  },
  stealth_slate: {
    id: 'stealth_slate',
    name: 'Stealth Slate Obsidian',
    shortName: 'STEALTH SLATE',
    badge: 'STEALTH LAB',
    accentColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.4)',
  },
  quantum_emerald: {
    id: 'quantum_emerald',
    name: 'Quantum Emerald Matrix',
    shortName: 'QUANTUM MATRIX',
    badge: 'QUANTUM LAB',
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
  },
  solar_amber: {
    id: 'solar_amber',
    name: 'Solar Amber Industrial',
    shortName: 'SOLAR AMBER',
    badge: 'HEAVY INDUSTRY',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
  },
};

interface ThemeContextType {
  theme: ThemeMode;
  themeConfig: ThemeConfig;
  isClinical: boolean;
  isStealth: boolean;
  isEmerald: boolean;
  isAmber: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'vishvajit_portfolio_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
      if (
        saved === 'neon_cyber' ||
        saved === 'stealth_slate' ||
        saved === 'quantum_emerald' ||
        saved === 'solar_amber'
      ) {
        return saved;
      }
    }
    return 'neon_cyber';
  });

  const applyThemeToDOM = (currentTheme: ThemeMode) => {
    const root = document.documentElement;
    // Map legacy 'clean_clinical' to 'stealth_slate'
    const activeTheme = currentTheme === 'clean_clinical' ? 'stealth_slate' : currentTheme;
    root.setAttribute('data-theme', activeTheme);

    // Remove all possible theme classes
    root.classList.remove(
      'theme-cyber',
      'theme-stealth',
      'theme-clinical',
      'theme-emerald',
      'theme-amber'
    );

    if (activeTheme === 'stealth_slate') {
      root.classList.add('theme-stealth');
    } else if (activeTheme === 'quantum_emerald') {
      root.classList.add('theme-emerald');
    } else if (activeTheme === 'solar_amber') {
      root.classList.add('theme-amber');
    } else {
      root.classList.add('theme-cyber');
    }
  };

  useEffect(() => {
    applyThemeToDOM(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme === 'clean_clinical' ? 'stealth_slate' : theme);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [theme]);

  const toggleTheme = () => {
    soundFx.playClick();
    const order: ThemeMode[] = ['neon_cyber', 'stealth_slate', 'quantum_emerald', 'solar_amber'];
    setThemeState((prev) => {
      const currIdx = order.indexOf(prev === 'clean_clinical' ? 'stealth_slate' : prev);
      const nextIdx = (currIdx + 1) % order.length;
      return order[nextIdx];
    });
  };

  const setTheme = (mode: ThemeMode) => {
    soundFx.playClick();
    setThemeState(mode === 'clean_clinical' ? 'stealth_slate' : mode);
  };

  const activeThemeId = theme === 'clean_clinical' ? 'stealth_slate' : theme;
  const themeConfig = THEME_PRESETS[activeThemeId] || THEME_PRESETS.neon_cyber;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeConfig,
        isClinical: theme === 'stealth_slate' || theme === 'clean_clinical',
        isStealth: theme === 'stealth_slate' || theme === 'clean_clinical',
        isEmerald: theme === 'quantum_emerald',
        isAmber: theme === 'solar_amber',
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
