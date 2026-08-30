import React from 'react';
import { motion } from 'motion/react';
import { Home, Compass, AlertTriangle, ArrowLeft, RefreshCw, Cpu } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface NotFoundProps {
  onGoHome?: () => void;
  onViewProjects?: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({
  onGoHome = () => {
    window.location.href = '/';
  },
  onViewProjects = () => {
    const el = document.getElementById('robotics-lab') || document.getElementById('projects');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#projects';
    }
  },
}) => {
  return (
    <div className="min-h-screen bg-[#040812] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-mono select-none">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
      
      {/* Ambient Radial Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-gradient-to-tr from-cyan-500/10 via-rose-500/5 to-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main 404 Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-lg w-full p-8 rounded-2xl glass-panel-glow border border-cyan-500/30 text-center space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
      >
        <div className="cyber-corner-tl" />
        <div className="cyber-corner-tr" />
        <div className="cyber-corner-bl" />
        <div className="cyber-corner-br" />

        {/* Broken Node / Signal Lost Visual Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.15)]">
          <div className="absolute inset-0 rounded-2xl border border-rose-500/30 animate-ping opacity-30 pointer-events-none" />
          <AlertTriangle className="w-9 h-9 text-rose-400" />
        </div>

        {/* Status Codes */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[11px] font-mono tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            SIGNAL PATH 404 // LINK SEVERED
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white pt-2">
            404 — SYSTEM NOT FOUND
          </h1>

          <p className="text-sm text-slate-400 font-sans leading-relaxed max-w-sm mx-auto">
            The page or telemetry node you're looking for doesn't exist, has been relocated, or is offline.
          </p>
        </div>

        {/* Diagnostics Box */}
        <div className="p-3.5 rounded-lg bg-black/50 border border-slate-800 text-left font-mono text-xs space-y-1 text-slate-400">
          <div className="flex justify-between">
            <span className="text-slate-500">ROUTING ENGINE:</span>
            <span className="text-cyan-400">VLP_LAB_DISPATCHER</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">REQUEST URI:</span>
            <span className="text-rose-400 truncate max-w-[200px]">{typeof window !== 'undefined' ? window.location.pathname : '/'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">STATUS:</span>
            <span className="text-emerald-400">CORE LAB RUNNING</span>
          </div>
        </div>

        {/* Action Navigation Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-center">
          <button
            id="back-home-btn"
            onClick={() => {
              soundFx.playClick();
              onGoHome();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#040812] font-mono font-bold text-xs shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
          >
            <Home className="w-4 h-4" />
            <span>BACK HOME</span>
          </button>

          <button
            id="view-projects-btn"
            onClick={() => {
              soundFx.playClick();
              onViewProjects();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white font-mono text-xs transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>VIEW PROJECTS</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
