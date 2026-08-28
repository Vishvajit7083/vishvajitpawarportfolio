import React, { useState, useEffect } from 'react';
import { Cpu, ArrowUp, Mail, Linkedin, Terminal, Heart } from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';
import { soundFx } from '../utils/audio';

export const Footer: React.FC = () => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setTimeStr(new Intl.DateTimeFormat('en-GB', options).format(new Date()));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    soundFx.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] py-12 px-4 sm:px-6 lg:px-8 font-mono text-xs text-[var(--text-muted)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-panel-solid)] border border-[var(--border-primary)] flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="font-display font-bold text-[var(--text-primary)] text-sm tracking-wider">
              {PERSONAL_INFO.name}
            </div>
            <div className="text-[11px] text-cyan-400">
              Electronics &amp; Telecommunication Engineering • 3D Lab
            </div>
          </div>
        </div>

        {/* Live Lab Status */}
        <div className="flex items-center gap-4 glass-panel px-4 py-2 rounded-xl border border-[var(--border-subtle)] shadow-sm">
          <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            LAB ONLINE
          </span>
          <span className="text-[var(--text-muted)]">|</span>
          <span className="text-[var(--text-secondary)] font-mono">IST (KOLHAPUR): {timeStr}</span>
        </div>

        {/* Quick Links & Back to top */}
        <div className="flex items-center gap-3">
          <a
            href={`mailto:${PERSONAL_INFO.email}`}
            className="p-2 rounded-lg glass-panel hover:border-cyan-400 text-cyan-400 border border-[var(--border-subtle)] transition-colors"
            title="Email"
          >
            <Mail className="w-4 h-4" />
          </a>

          <a
            href={PERSONAL_INFO.linkedin}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg glass-panel hover:border-cyan-400 text-sky-400 border border-[var(--border-subtle)] transition-colors"
            title="LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
          </a>

          <button
            onClick={scrollToTop}
            className="p-2 rounded-lg bg-[var(--chip-bg)] hover:bg-[var(--bg-panel-solid)] border border-[var(--border-primary)] text-cyan-400 transition-colors cursor-pointer font-semibold"
            title="Back to Top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[var(--text-muted)]">
        <div>
          © {new Date().getFullYear()} Vishwajit Laxman Pawar. All rights reserved.
        </div>
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <span>BUILT WITH REACT • THREE.JS • EMBEDDED PRECISION</span>
        </div>
      </div>
    </footer>
  );
};
