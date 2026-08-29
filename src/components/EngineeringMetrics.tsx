import React, { useState } from 'react';
import {
  Award,
  Cpu,
  Zap,
  Activity,
  ShieldCheck,
  Radio,
  Sliders,
  Sparkles,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export const EngineeringMetrics: React.FC = () => {
  const [activeMetricIndex, setActiveMetricIndex] = useState<number | null>(null);

  const metrics = [
    {
      id: 'cgpa',
      value: '8.78 / 10',
      label: 'ACADEMIC CGPA',
      sublabel: 'First Class with Distinction (B.Tech E&TC)',
      icon: <Award className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/40 text-amber-400',
      bgGlow: 'from-amber-500/10 to-transparent',
      details:
        'Bharati Vidyapeeth College of Engineering Kolhapur • Core honors in Embedded Architecture, DSP, Control Systems & Telecommunication.',
    },
    {
      id: 'dof',
      value: '6-DOF',
      label: 'ROBOTIC KINEMATICS',
      sublabel: 'Forward & Inverse Kinematics Solved',
      icon: <Cpu className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-500/40 text-cyan-400',
      bgGlow: 'from-cyan-500/10 to-transparent',
      details:
        'Analytical Denavit-Hartenberg matrices & geometric inverse kinematics solver with OpenCV color tracking and 16-channel PCA9685 PWM control.',
    },
    {
      id: 'freertos',
      value: '240 MHz',
      label: 'DUAL-CORE ESP32 SMP',
      sublabel: 'Deterministic FreeRTOS Multitasking',
      icon: <Activity className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/40 text-emerald-400',
      bgGlow: 'from-emerald-500/10 to-transparent',
      details:
        'Core 1 dedicated to high-speed hardware sensor sampling (I2C/One-Wire), Core 0 dedicated to Wi-Fi/MQTT dispatch via thread-safe FreeRTOS queues.',
    },
    {
      id: 'power',
      value: '15 µA',
      label: 'DEEP-SLEEP CURRENT',
      sublabel: 'Ultra-Low Power IoT Architecture',
      icon: <Zap className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/40 text-purple-400',
      bgGlow: 'from-purple-500/10 to-transparent',
      details:
        'Engineered for solar/battery-backed field deployment with RTC timer wakeups, power-gated peripherals, and sub-second sensor acquisition burst modes.',
    },
    {
      id: 'certs',
      value: '4 VERIFIED',
      label: 'INDUSTRY CREDENTIALS',
      sublabel: 'Deloitte, Tata & Microcontroller Internship',
      icon: <ShieldCheck className="w-5 h-5 text-sky-400" />,
      color: 'border-sky-500/40 text-sky-400',
      bgGlow: 'from-sky-500/10 to-transparent',
      details:
        'Accredited by Deloitte (Tech Simulation), Tata (Data Visualisation), Industry Embedded Internship, and Accredited B.Tech Degree Certificate.',
    },
  ];

  return (
    <section className="relative w-full py-8 px-4 sm:px-8 max-w-7xl mx-auto z-20">
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-[var(--border-primary)] shadow-[var(--shadow-panel)] relative overflow-hidden">
        <div className="cyber-corner-tl" />
        <div className="cyber-corner-tr" />
        <div className="cyber-corner-bl" />
        <div className="cyber-corner-br" />

        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase">
                // SYSTEM_ENGINEERING_BENCHMARKS
              </span>
              <h3 className="text-base sm:text-lg font-bold font-display text-[var(--text-primary)]">
                KEY HARDWARE & ARCHITECTURAL METRICS
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ALL BENCHMARKS VERIFIED // HARDWARE TESTED</span>
          </div>
        </div>

        {/* 5-Column Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {metrics.map((m, idx) => {
            const isSelected = activeMetricIndex === idx;
            return (
              <div
                key={m.id}
                id={`metric-card-${m.id}`}
                onClick={() => {
                  soundFx.playClick();
                  setActiveMetricIndex(isSelected ? null : idx);
                }}
                onMouseEnter={() => soundFx.playHover()}
                className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between relative group ${
                  isSelected
                    ? `${m.color} bg-slate-900 shadow-[0_0_20px_rgba(0,240,255,0.25)] scale-[1.02]`
                    : 'border-[var(--border-subtle)] bg-[var(--chip-bg)] hover:border-cyan-400/60 hover:bg-slate-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-black/40 border border-white/5 group-hover:scale-110 transition-transform">
                      {m.icon}
                    </div>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      0{idx + 1}
                    </span>
                  </div>

                  <div className="text-2xl font-bold font-display text-[var(--text-primary)] tracking-wide group-hover:text-cyan-400 transition-colors">
                    {m.value}
                  </div>

                  <div className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-wider mt-1">
                    {m.label}
                  </div>

                  <p className="text-[11px] font-mono text-[var(--text-muted)] mt-1 line-clamp-2">
                    {m.sublabel}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-cyan-400">
                  <span>{isSelected ? 'COLLAPSE' : 'INSPECT'}</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Expanded Metric Detail Drawer */}
        {activeMetricIndex !== null && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-cyan-500/40 text-xs font-mono animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  DETAILED SPECIFICATION // {metrics[activeMetricIndex].label}
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {metrics[activeMetricIndex].details}
                </p>
              </div>
              <button
                onClick={() => setActiveMetricIndex(null)}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white cursor-pointer shrink-0 text-[10px]"
              >
                CLOSE
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
