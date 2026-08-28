import React from 'react';
import { Moon, Shield, Zap, Flame, Sparkles } from 'lucide-react';
import { useTheme, ThemeMode, THEME_PRESETS } from '../context/ThemeContext';

interface ThemeSwitcherProps {
  variant?: 'compact' | 'full' | 'pill';
  showLabel?: boolean;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'pill',
  showLabel = true,
}) => {
  const { theme, toggleTheme, setTheme, themeConfig } = useTheme();

  const handleToggle = () => {
    toggleTheme();
  };

  const getThemeIcon = (mode: ThemeMode) => {
    switch (mode) {
      case 'neon_cyber':
        return <Moon className="w-3.5 h-3.5 text-cyan-400" />;
      case 'stealth_slate':
      case 'clean_clinical':
        return <Shield className="w-3.5 h-3.5 text-sky-400" />;
      case 'quantum_emerald':
        return <Zap className="w-3.5 h-3.5 text-emerald-400" />;
      case 'solar_amber':
        return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  if (variant === 'compact') {
    return (
      <button
        id="theme-switcher-compact"
        onClick={handleToggle}
        title={`Active Theme: ${themeConfig.name} — Click to cycle UI Theme`}
        aria-label="Toggle Theme Mode"
        className="relative p-2 rounded-lg border text-xs font-mono transition-all duration-300 cursor-pointer overflow-hidden group glass-panel hover:border-cyan-400/60 shadow-sm"
      >
        <div className="flex items-center gap-1.5">
          {getThemeIcon(theme)}
        </div>
      </button>
    );
  }

  const themes: { id: ThemeMode; label: string; icon: React.ReactNode; activeClass: string }[] = [
    {
      id: 'neon_cyber',
      label: 'NEON CYBER',
      icon: <Moon className="w-3.5 h-3.5" />,
      activeClass: 'bg-cyan-950/90 text-cyan-300 border-cyan-400/60 shadow-[0_0_12px_rgba(0,240,255,0.3)]',
    },
    {
      id: 'stealth_slate',
      label: 'STEALTH SLATE',
      icon: <Shield className="w-3.5 h-3.5" />,
      activeClass: 'bg-slate-800/90 text-sky-300 border-sky-400/60 shadow-[0_0_12px_rgba(56,189,248,0.25)]',
    },
    {
      id: 'quantum_emerald',
      label: 'QUANTUM MATRIX',
      icon: <Zap className="w-3.5 h-3.5" />,
      activeClass: 'bg-emerald-950/90 text-emerald-300 border-emerald-400/60 shadow-[0_0_12px_rgba(16,185,129,0.3)]',
    },
    {
      id: 'solar_amber',
      label: 'SOLAR AMBER',
      icon: <Flame className="w-3.5 h-3.5" />,
      activeClass: 'bg-amber-950/90 text-amber-300 border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
    },
  ];

  return (
    <div
      id="theme-switcher-control"
      className="inline-flex items-center p-1 rounded-xl glass-panel border border-[var(--border-subtle)] shadow-sm font-mono overflow-x-auto max-w-full"
    >
      {themes.map((t) => {
        const isActive = theme === t.id || (t.id === 'stealth_slate' && theme === 'clean_clinical');
        return (
          <button
            key={t.id}
            id={`theme-btn-${t.id}`}
            onClick={() => setTheme(t.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 cursor-pointer border ${
              isActive
                ? `${t.activeClass} border font-semibold`
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
            title={`Select ${t.label} Theme`}
          >
            <span className={isActive ? 'animate-pulse' : ''}>{t.icon}</span>
            {showLabel && (
              <span className="tracking-wider text-[10px] uppercase font-semibold whitespace-nowrap">
                {t.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
