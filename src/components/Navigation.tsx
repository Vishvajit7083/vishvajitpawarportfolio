import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Menu, X, FileText, Cpu, Radio, Sparkles, BookOpen, Bot } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useTheme } from '../context/ThemeContext';

interface NavigationProps {
  onOpenResume: () => void;
  onOpenCopilot?: (tab?: 'chat' | 'match' | 'interview' | 'deepdive') => void;
  onOpenGuide?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  onOpenResume,
  onOpenCopilot,
  onOpenGuide,
  soundEnabled,
  onToggleSound,
}) => {
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { themeConfig } = useTheme();

  const navItems = [
    { label: 'HOME', href: '#hero', id: 'hero' },
    { label: 'ABOUT', href: '#about', id: 'about' },
    { label: 'SKILLS', href: '#skills', id: 'skills' },
    { label: 'PROJECTS', href: '#projects', id: 'projects' },
    { label: 'EXPERIENCE', href: '#experience', id: 'experience' },
    { label: 'EDUCATION', href: '#education', id: 'education' },
    { label: 'CONTACT', href: '#contact', id: 'contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      // Section spy
      const sections = navItems.map((item) => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    soundFx.playClick();
    setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'py-2.5 bg-[var(--nav-bg)] backdrop-blur-md border-b border-[var(--border-subtle)] shadow-[var(--shadow-panel)]'
          : 'py-4 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand / Logo */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick('hero', e)}
          className="flex items-center gap-2.5 group cursor-pointer"
          id="nav-brand-link"
        >
          <div className="relative w-9 h-9 rounded-lg bg-[var(--bg-panel-solid)] border border-[var(--border-primary)] flex items-center justify-center overflow-hidden group-hover:border-cyan-400 transition-colors shadow-sm">
            <Cpu className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition-transform duration-500" />
            <div className="absolute inset-0 bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-[var(--text-primary)] text-base tracking-wider">
                VISHVAJIT PAWAR
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--chip-bg)] border border-[var(--chip-border)] text-[var(--chip-text)] hidden sm:inline-block">
                E&TC
              </span>
            </div>
            <div className="text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{themeConfig.badge}</span>
            </div>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 glass-panel p-1.5 rounded-full border border-[var(--border-subtle)]">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                id={`nav-link-${item.id}`}
                onClick={(e) => handleNavClick(item.id, e)}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-200 ${
                  isActive
                    ? 'text-cyan-400 bg-[var(--chip-bg)] border border-[var(--border-primary)] shadow-sm font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-cyan-400 hover:bg-black/5 dark:hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Theme Switcher Toggle */}
          <div className="hidden sm:block">
            <ThemeSwitcher variant="pill" showLabel={true} />
          </div>
          <div className="sm:hidden">
            <ThemeSwitcher variant="compact" />
          </div>

          {/* Audio FX Toggle */}
          <button
            onClick={() => {
              onToggleSound();
            }}
            id="audio-toggle-btn"
            title={soundEnabled ? 'Mute Sci-Fi Audio FX' : 'Enable Sci-Fi Audio FX'}
            className={`p-2 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-cyan-950/70 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                : 'glass-panel text-[var(--text-muted)] hover:border-[var(--border-highlight)]'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* AI Copilot Trigger */}
          {onOpenCopilot && (
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenCopilot('chat');
              }}
              id="nav-ai-copilot-btn"
              title="Launch AI Engineering Copilot"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400 text-cyan-300 text-xs font-mono font-semibold transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="hidden sm:inline">AI COPILOT</span>
            </button>
          )}

          {/* Resume Modal Trigger */}
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenResume();
            }}
            id="nav-resume-btn"
            className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-sky-500/20 hover:from-cyan-500/30 hover:to-sky-500/30 text-cyan-400 text-xs font-mono font-medium border border-cyan-400/40 hover:border-cyan-400 transition-all shadow-sm cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>RESUME</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => {
              soundFx.playClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            id="mobile-menu-toggle"
            className="lg:hidden p-2 rounded-lg glass-panel border border-[var(--border-subtle)] text-cyan-400 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 mx-4 p-4 rounded-xl glass-panel-glow shadow-2xl space-y-3 font-mono text-sm">
          <div className="px-2 py-1 text-[10px] text-cyan-400 font-semibold border-b border-[var(--border-subtle)] flex items-center justify-between">
            <span>ROBOTICS LAB CONTROLS</span>
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
          </div>

          <div className="flex justify-center py-1">
            <ThemeSwitcher variant="pill" showLabel={true} />
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(item.id, e)}
                className={`block px-3 py-2 rounded-lg text-xs transition-colors ${
                  activeSection === item.id
                    ? 'bg-[var(--chip-bg)] text-cyan-400 border border-[var(--border-primary)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-slate-900'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
            {onOpenCopilot && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  setMobileMenuOpen(false);
                  onOpenCopilot('chat');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-950/90 border border-cyan-400 text-cyan-300 text-xs font-semibold shadow-[0_0_15px_rgba(0,240,255,0.25)]"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                LAUNCH AI COPILOT (GEMINI 3.7)
              </button>
            )}

            {onOpenGuide && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  setMobileMenuOpen(false);
                  onOpenGuide();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--chip-bg)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                AI FEATURES & RECRUITER GUIDE
              </button>
            )}

            <button
              onClick={() => {
                soundFx.playClick();
                setMobileMenuOpen(false);
                onOpenResume();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-400 text-xs font-semibold"
            >
              <FileText className="w-4 h-4" />
              VIEW & DOWNLOAD RESUME
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
