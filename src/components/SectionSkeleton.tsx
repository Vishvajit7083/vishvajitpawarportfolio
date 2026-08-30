import React from 'react';
import { Cpu, RefreshCw } from 'lucide-react';

interface SectionSkeletonProps {
  title?: string;
  subtitle?: string;
  heightClass?: string;
}

export const SectionSkeleton: React.FC<SectionSkeletonProps> = ({
  title = 'Loading Robotics Lab...',
  subtitle = 'Initializing 3D Simulation & Telemetry Environment',
  heightClass = 'min-h-[480px]',
}) => {
  return (
    <div
      className={`w-full ${heightClass} flex flex-col items-center justify-center p-8 relative rounded-2xl glass-panel border border-cyan-500/20 text-center font-mono my-8 overflow-hidden`}
    >
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center space-y-4 max-w-sm">
        {/* Animated Loading Icon */}
        <div className="relative w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.15)]">
          <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
        </div>

        <div className="space-y-1.5">
          <div className="text-xs font-bold text-cyan-300 uppercase tracking-widest flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            {title}
          </div>
          <p className="text-[11px] text-slate-400 font-sans">{subtitle}</p>
        </div>

        {/* Minimal Progress Pulse Bar */}
        <div className="w-48 bg-slate-900/90 rounded-full h-1 border border-cyan-500/20 overflow-hidden mt-2">
          <div className="h-full bg-cyan-400/80 rounded-full w-2/3 animate-[pulse_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
};
