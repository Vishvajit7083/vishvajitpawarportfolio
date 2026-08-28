import React, { useState, useEffect } from 'react';
import { Cpu, Volume2, VolumeX, FileText, Menu, X, Terminal } from 'lucide-react';
import { sound } from '../utils/audioEffects';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenResume: () => void;
}

const NAV_ITEMS = [
  { id: 'hero', label: 'HOME' },
  { id: 'about', label: 'ABOUT' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'projects', label: 'PROJECTS' },
  { id: 'experience', label: 'EXPERIENCE' },
  { id: 'education', label: 'EDUCATION' },
  { id: 'contact', label: 'CONTACT' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  onOpenResume,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id: string) => {
    sound.playClick();
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const handleAudioToggle = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header
      id="main-navigation"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 px-4 sm:px-8 py-3 ${
        isScrolled
          ? 'bg-[#040812]/85 backdrop-blur-md border-b border-cyan-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.7)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <button
          id="nav-brand-logo"
          onClick={() => handleNavClick('hero')}
          onMouseEnter={() => sound.playHover()}
          className="flex items-center gap-2.5 group text-left cursor-pointer"
        >
          <div className="relative w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-400/50 flex items-center justify-center text-cyan-300 group-hover:border-cyan-300 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all">
            <Cpu className="w-4 h-4 text-cyan-400 group-hover:rotate-45 transition-transform duration-500" />
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div>
            <span className="font-display font-bold text-sm tracking-wider text-white group-hover:text-cyan-300 transition-colors">
              VISHVAJIT<span className="text-cyan-400">.LAB</span>
            </span>
            <span className="block text-[9px] font-mono text-slate-400 tracking-widest uppercase">
              Embedded & Robotics
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 glass-panel px-3 py-1.5 rounded-full border border-cyan-500/30 shadow-[0_0_20px_rgba(0,240,255,0.05)]">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                onMouseEnter={() => sound.playHover()}
                className={`relative px-3.5 py-1 text-xs font-mono tracking-wider transition-all duration-200 rounded-full cursor-pointer ${
                  isActive
                    ? 'text-cyan-300 font-semibold bg-cyan-950/70 shadow-[0_0_12px_rgba(0,240,255,0.3)] border border-cyan-400/40'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Utility Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            id="audio-toggle-btn"
            onClick={handleAudioToggle}
            title={isMuted ? 'Unmute Audio UI Effects' : 'Mute Audio UI Effects'}
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />}
          </button>

          <button
            id="nav-resume-btn"
            onClick={() => {
              sound.playClick();
              onOpenResume();
            }}
            onMouseEnter={() => sound.playHover()}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono rounded-lg bg-gradient-to-r from-cyan-500/20 to-sky-500/20 border border-cyan-400/50 text-cyan-300 hover:text-white hover:border-cyan-300 hover:bg-cyan-500/30 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>RESUME</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            id="mobile-audio-btn"
            onClick={handleAudioToggle}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
          <button
            id="mobile-menu-toggle"
            onClick={() => {
              sound.playClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-3 p-4 rounded-xl glass-panel-glow border border-cyan-500/40 space-y-2 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-left px-3 py-2 text-xs font-mono rounded-lg transition-all ${
                  activeSection === item.id
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-400/50'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                sound.playClick();
                setMobileMenuOpen(false);
                onOpenResume();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-mono font-semibold rounded-lg bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]"
            >
              <FileText className="w-4 h-4" />
              <span>VIEW / DOWNLOAD RESUME</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
