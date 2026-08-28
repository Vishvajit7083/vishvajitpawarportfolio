import React, { useEffect, useState } from 'react';
import { Terminal, Cpu, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { sound } from '../utils/audioEffects';

interface LoadingScreenProps {
  onComplete: () => void;
}

const BOOT_LOGS = [
  { text: 'ESP32 XTENSA LX6 CORE 0 & CORE 1: BOOTSTRAPPING [OK]', delay: 250 },
  { text: 'INITIALIZING SYSTEM ARCHITECTURE...', delay: 650 },
  { text: 'LOADING ENGINEERING PROFILE: VISHVAJIT LAXMAN PAWAR', delay: 1100 },
  { text: 'INITIALIZING AI & COMPUTER VISION MODULE (OpenCV)...', delay: 1550 },
  { text: 'INITIALIZING IoT TELEMETRY ENGINE (WiFi/BLE/Sensors)...', delay: 2000 },
  { text: 'MOUNTING 3D HOLOGRAPHIC LAB SHADERS & GEOMETRY...', delay: 2450 },
  { text: 'SYSTEM READY // ALL SUBSYSTEMS NOMINAL', delay: 2850 },
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Play boot sound
    sound.playBootBeep(587.33, 0.08);

    const timeouts: NodeJS.Timeout[] = [];

    BOOT_LOGS.forEach((item, index) => {
      const t = setTimeout(() => {
        setLogs((prev) => [...prev, item.text]);
        setProgress(Math.round(((index + 1) / BOOT_LOGS.length) * 100));
        sound.playBootBeep(700 + index * 100, 0.05);

        if (index === BOOT_LOGS.length - 1) {
          sound.playSuccessChime();
          const fadeTimer = setTimeout(() => {
            setIsFading(true);
            const doneTimer = setTimeout(() => {
              onComplete();
            }, 600);
            timeouts.push(doneTimer);
          }, 450);
          timeouts.push(fadeTimer);
        }
      }, item.delay);
      timeouts.push(t);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [onComplete]);

  const handleSkip = () => {
    sound.playClick();
    setIsFading(true);
    setTimeout(onComplete, 200);
  };

  return (
    <div
      id="boot-loading-screen"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030712] text-cyan-400 p-4 transition-opacity duration-700 select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Cyber Grid & Glow */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="relative w-full max-w-xl p-6 sm:p-8 rounded-xl glass-panel-glow border border-cyan-500/40 scanline-effect shadow-[0_0_50px_rgba(0,240,255,0.15)]">
        <div className="cyber-corner-tl" />
        <div className="cyber-corner-tr" />
        <div className="cyber-corner-bl" />
        <div className="cyber-corner-br" />

        {/* Top Header Status */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 animate-pulse">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-cyan-300 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                VLP-3D-LAB BOOT SEQUENCE
              </div>
              <div className="text-[11px] text-slate-400 font-mono">MCU: ESP32-D0WDQ6 • DUAL 240MHz</div>
            </div>
          </div>
          <button
            id="skip-boot-button"
            onClick={handleSkip}
            className="text-xs px-2.5 py-1 rounded border border-slate-700 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/50 hover:bg-cyan-950/40 transition-all font-mono"
          >
            SKIP [ESC]
          </button>
        </div>

        {/* Terminal Logs stream */}
        <div className="bg-black/60 rounded-lg p-4 font-mono text-xs text-slate-300 border border-cyan-950 space-y-2 h-44 overflow-y-auto mb-6 flex flex-col justify-end">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span className={idx === logs.length - 1 ? 'text-cyan-300 font-medium' : 'text-slate-400'}>
                {log}
              </span>
            </div>
          ))}
          {logs.length < BOOT_LOGS.length && (
            <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
              <span className="inline-block w-2 h-3.5 bg-cyan-400" />
              <span className="text-[11px] text-cyan-500">PROCESSING BIOS RUNTIME...</span>
            </div>
          )}
        </div>

        {/* Progress Bar & Status */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono text-slate-300 mb-2">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              FIRMWARE INTEGRITY CHECK
            </span>
            <span className="font-bold text-cyan-400 tracking-wider">{progress}%</span>
          </div>

          <div className="w-full bg-slate-900/80 rounded-full h-2.5 border border-cyan-500/20 overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-purple-500 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(0,240,255,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Bottom Hardware Tag */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>TARGET: EMBEDDED SOFTWARE / IoT / ROBOTICS</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> RTOS ONLINE
          </span>
        </div>
      </div>
    </div>
  );
};
