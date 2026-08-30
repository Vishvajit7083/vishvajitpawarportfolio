import React from 'react';
import { Globe, CheckCircle2, MessageSquare, Terminal } from 'lucide-react';
import { LANGUAGES_DATA } from '../data/portfolioData';
import { sound } from '../utils/audioEffects';
import { ScrollReveal } from './ScrollReveal';
import { TiltCard } from './TiltCard';

export const Languages: React.FC = () => {
  return (
    <section id="languages" className="relative w-full py-16 px-4 sm:px-8 max-w-7xl mx-auto z-20">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
              // LINGUISTIC_PROFICIENCY
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-wide">
              LANGUAGES
            </h2>
          </div>
        </div>
      </ScrollReveal>

      {/* Language Nodes with Clean Circular HUD Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {LANGUAGES_DATA.map((lang, index) => (
          <ScrollReveal key={lang.name} direction="up" delay={0.1 * (index + 1)}>
            <TiltCard
              maxTilt={5}
              id={`lang-node-${lang.name.toLowerCase()}`}
              onMouseEnter={() => sound.playHover()}
              className="glass-panel p-6 rounded-2xl border border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(0,240,255,0.2)] transition-all duration-300 flex items-center gap-5 relative group cursor-pointer h-full"
            >
              <div className="cyber-corner-tl" />
              <div className="cyber-corner-tr" />
              <div className="cyber-corner-bl" />
              <div className="cyber-corner-br" />

              {/* Circular HUD Ring Indicator */}
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Ring */}
                  <path
                    className="text-slate-800"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Animated Glowing Ring Arc */}
                  <path
                    className={
                      index === 0
                        ? 'text-cyan-400'
                        : index === 1
                        ? 'text-sky-400'
                        : 'text-purple-400'
                    }
                    strokeDasharray={
                      index === 0
                        ? '100, 100'
                        : index === 1
                        ? '90, 100'
                        : '80, 100'
                    }
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                {/* Native Script Center */}
                <span className="absolute font-mono text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {lang.nativeScript}
                </span>
              </div>

              {/* Language Details */}
              <div className="space-y-1">
                <h3 className="text-xl font-bold font-display text-white">
                  {lang.name}
                </h3>
                <p className="text-xs font-mono text-cyan-400 font-medium">
                  {lang.proficiency}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{lang.scoreLabel}</span>
                </div>
              </div>
            </TiltCard>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
};
