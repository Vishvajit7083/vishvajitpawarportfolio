import React, { useState } from 'react';
import { Cpu, Wifi, Bot, Eye, Radio, Sparkles, CheckCircle, ShieldCheck, Award, Terminal, Scan } from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';
import { soundFx } from '../utils/audio';
import { ScrollReveal } from './ScrollReveal';
import { TiltCard } from './TiltCard';

interface IndicatorItem {
  id: string;
  name: string;
  level: number;
  metric: string;
  status: string;
  color: string;
  icon: React.ReactNode;
  specs: string[];
}

export const About: React.FC = () => {
  const [activeIndicator, setActiveIndicator] = useState<string>('embedded');
  const [laserScan, setLaserScan] = useState(true);

  const indicators: IndicatorItem[] = [
    {
      id: 'embedded',
      name: 'Embedded Systems',
      level: 92,
      metric: 'C / ASM / Drivers',
      status: 'RTOS NOMINAL',
      color: '#00f0ff',
      icon: <Cpu className="w-5 h-5 text-cyan-400" />,
      specs: ['Microcontroller Architectures', 'Low-level Register Drivers', 'Interrupt Service Routines (ISR)', 'Timer & PWM Subsystems'],
    },
    {
      id: 'iot',
      name: 'IoT (Internet of Things)',
      level: 90,
      metric: 'ESP32 / WiFi / BLE',
      status: 'RF SYNCED',
      color: '#10b981',
      icon: <Wifi className="w-5 h-5 text-emerald-400" />,
      specs: ['MQTT & HTTP Client/Server', 'Wireless Sensor Nodes', 'Real-time Telemetry Streams', 'Low Power Deep-Sleep Cycles'],
    },
    {
      id: 'ai',
      name: 'Artificial Intelligence',
      level: 85,
      metric: 'Voice & Decision',
      status: 'INFERENCE OK',
      color: '#a855f7',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      specs: ['Intelligent Voice Interaction', 'Autonomous State Machines', 'Edge Processing Logic', 'Algorithm Optimization'],
    },
    {
      id: 'robotics',
      name: 'Robotics',
      level: 88,
      metric: 'Actuators / Nav',
      status: 'KINEMATICS OK',
      color: '#38bdf8',
      icon: <Bot className="w-5 h-5 text-sky-400" />,
      specs: ['Ultrasonic Obstacle Avoidance', 'Motor Control & Drive Systems', 'Human-Robot Interaction', 'Autonomous Pathfinding'],
    },
    {
      id: 'cv',
      name: 'Computer Vision',
      level: 86,
      metric: 'OpenCV / Py',
      status: 'TRACKING LIVE',
      color: '#ef4444',
      icon: <Eye className="w-5 h-5 text-rose-400" />,
      specs: ['Real-time Object Detection', 'Facial Recognition Pipelines', 'Contour & Color Tracking', 'Camera Stream Processing'],
    },
  ];

  const selectedInd = indicators.find((i) => i.id === activeIndicator) || indicators[0];

  return (
    <section id="about" className="relative w-full py-20 px-4 sm:px-8 max-w-7xl mx-auto z-20">
      {/* Section Header */}
      <ScrollReveal direction="up">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
              // PROFILE_METADATA_EXTRACT
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-[var(--text-primary)] tracking-wide">
              ENGINEERING PROFILE & ABOUT ME
            </h2>
          </div>
        </div>
      </ScrollReveal>

      {/* Main Holographic Profile Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Holographic Photo & Hardware Scanner Card */}
        <ScrollReveal direction="up" delay={0.1} className="lg:col-span-5">
          <TiltCard maxTilt={5} className="relative glass-panel-glow p-6 rounded-2xl border border-[var(--border-primary)] shadow-[var(--shadow-glow)] overflow-hidden space-y-4">
            <div className="cyber-corner-tl" />
            <div className="cyber-corner-tr" />
            <div className="cyber-corner-bl" />
            <div className="cyber-corner-br" />

            {/* Profile Hologram Frame */}
            <div className="relative mx-auto w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-2 border-cyan-400/60 shadow-[0_0_30px_rgba(0,240,255,0.3)] bg-slate-900 flex items-center justify-center group">
              {/* Laser scanner animation line */}
              {laserScan && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f0ff] z-20 animate-circuit-pulse pointer-events-none" />
              )}

              {/* Profile Image with fallback */}
              <img
                src="/profile.jpg"
                alt={PERSONAL_INFO.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top filter contrast-105 group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/profile.jpg';
                }}
              />

              {/* Holographic overlay grid */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-cyan-500/10 pointer-events-none" />
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[10px] font-mono px-2 py-1 rounded bg-black/80 border border-cyan-500/40 text-cyan-300">
                <span className="flex items-center gap-1">
                  <Scan className="w-3 h-3 text-cyan-400" /> VLP.ID#9168
                </span>
                <span className="text-emerald-400 font-semibold">VERIFIED</span>
              </div>
            </div>

            {/* Identity Details */}
            <div className="text-center mt-5 space-y-1">
              <h3 className="text-xl font-bold font-display text-[var(--text-primary)]">
                {PERSONAL_INFO.name}
              </h3>
              <p className="text-xs font-mono text-cyan-400 font-semibold">
                {PERSONAL_INFO.title}
              </p>
              <div className="pt-2 flex justify-center items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
                <span>Kolhapur, India</span>
                <span>•</span>
                <span className="text-emerald-500 font-medium">Available for Opportunities</span>
              </div>
            </div>

            {/* Quick Hardware Spec Taglets */}
            <div className="mt-5 grid grid-cols-2 gap-2 pt-4 border-t border-[var(--border-subtle)] text-xs font-mono">
              <div className="p-2 rounded bg-[var(--chip-bg)] border border-[var(--chip-border)]">
                <span className="text-[var(--text-muted)] block text-[10px]">CORE SPECIALTY</span>
                <span className="text-cyan-400 font-semibold">Embedded & IoT</span>
              </div>
              <div className="p-2 rounded bg-[var(--chip-bg)] border border-[var(--chip-border)]">
                <span className="text-[var(--text-muted)] block text-[10px]">LANGUAGES</span>
                <span className="text-purple-400 font-semibold">C • Python • SQL</span>
              </div>
            </div>
          </TiltCard>
        </ScrollReveal>

        {/* Right Column: Verbatim Bio & Interactive Indicators */}
        <div className="lg:col-span-7 space-y-6">
          {/* Holographic Bio Card */}
          <ScrollReveal direction="up" delay={0.15}>
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-[var(--border-subtle)] space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>EXECUTIVE BIOGRAPHY // VERIFIED DOSSIER</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--chip-bg)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                  B.TECH ENTC
                </span>
              </div>

              <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed font-mono">
                "{PERSONAL_INFO.bio}"
              </p>

              <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono">
                {PERSONAL_INFO.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-2.5 py-1 rounded-md bg-[var(--chip-bg)] border border-[var(--chip-border)] text-cyan-400 font-medium"
                  >
                    #{interest}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Engineering-style Visual Indicators */}
          <ScrollReveal direction="up" delay={0.25}>
            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-subtle)] space-y-5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-[var(--text-secondary)] flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-[var(--text-primary)]">ENGINEERING DOMAIN TELEMETRY</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                  CLICK TO INSPECT ARCHITECTURE
                </span>
              </div>

              {/* Interactive Domain Pill Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {indicators.map((ind) => {
                  const isSelected = activeIndicator === ind.id;
                  return (
                    <button
                      key={ind.id}
                      id={`indicator-btn-${ind.id}`}
                      data-magnetic="true"
                      onClick={() => {
                        soundFx.playClick();
                        setActiveIndicator(ind.id);
                      }}
                      onMouseEnter={() => soundFx.playHover()}
                      className={`p-2.5 rounded-xl border text-left font-mono transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--chip-bg)] border-[var(--border-primary)] shadow-sm font-semibold'
                          : 'glass-panel border-[var(--border-subtle)] hover:border-[var(--border-highlight)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        {ind.icon}
                        <span className="text-[10px] text-[var(--text-muted)] font-bold">{ind.level}%</span>
                      </div>
                      <div className="text-xs font-semibold text-[var(--text-primary)] truncate">{ind.name}</div>
                      <div className="text-[9px] text-[var(--text-muted)] truncate">{ind.status}</div>
                    </button>
                  );
                })}
              </div>

              {/* Active Indicator Detail Card */}
              <div className="p-4 rounded-xl bg-[var(--bg-panel-solid)] border border-[var(--border-primary)] space-y-3 font-mono shadow-sm">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    {selectedInd.name} Subsystem Breakdown
                  </span>
                  <span className="text-[var(--text-muted)] text-[11px]">{selectedInd.metric}</span>
                </div>

                {/* Progress Level Bar */}
                <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2 overflow-hidden border border-[var(--border-subtle)]">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-sky-500 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${selectedInd.level}%` }}
                  />
                </div>

                {/* Spec Bullet Points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-[var(--text-secondary)]">
                  {selectedInd.specs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
