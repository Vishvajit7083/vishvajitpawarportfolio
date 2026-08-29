import React from 'react';
import {
  X,
  Sparkles,
  Award,
  Cpu,
  Bot,
  Mail,
  Phone,
  Linkedin,
  FileText,
  CheckCircle2,
  Download,
  Calendar,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';
import { soundFx } from '../utils/audio';

interface RecruiterFastTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenResume: () => void;
  onOpenCopilot: (tab: 'chat' | 'match' | 'interview' | 'deepdive') => void;
}

export const RecruiterFastTrackModal: React.FC<RecruiterFastTrackModalProps> = ({
  isOpen,
  onClose,
  onOpenResume,
  onOpenCopilot,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="recruiter-fast-track-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-950 border border-cyan-500/50 rounded-2xl shadow-[0_0_60px_rgba(0,240,255,0.3)] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative">
        <div className="cyber-corner-tl" />
        <div className="cyber-corner-tr" />
        <div className="cyber-corner-bl" />
        <div className="cyber-corner-br" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-900/60 bg-slate-900/90 select-none">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  RECRUITER 60-SECOND BRIEFING
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 font-semibold">
                  IMMEDIATE HIRE READY
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold font-display text-white">
                Executive Profile: Vishwajit Laxman Pawar
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-xs text-slate-300">
          {/* Top Quick Profile Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 block">ROLE FOCUS</span>
              <span className="text-sm font-bold text-cyan-300 block">Embedded & IoT</span>
              <span className="text-[10px] text-slate-500">Firmware & Robotics</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 block">DEGREE & HONORS</span>
              <span className="text-sm font-bold text-emerald-400 block">B.Tech E&TC (8.78)</span>
              <span className="text-[10px] text-slate-500">Bharati Vidyapeeth Kolhapur</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 block">AVAILABILITY</span>
              <span className="text-sm font-bold text-white block">Immediate</span>
              <span className="text-[10px] text-emerald-400">Full-Time / Relocation</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 block">LOCATION</span>
              <span className="text-sm font-bold text-white block">Kolhapur, India</span>
              <span className="text-[10px] text-slate-500">Open to Pan-India / Remote</span>
            </div>
          </div>

          {/* Value Proposition Highlights */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/30 space-y-3">
            <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              WHY HIRE VISHWAJIT: 4 CORE VALUE DRIVERS
            </span>
            <ul className="space-y-2 text-slate-300 leading-relaxed list-disc list-inside">
              <li>
                <strong className="text-white">Low-Level to High-Level Full Stack</strong>: Proven capability in bare-metal Embedded C register programming, FreeRTOS dual-core task scheduling, and Python/OpenCV vision pipelines.
              </li>
              <li>
                <strong className="text-white">Real Physics & Mathematical Kinematics</strong>: Engineered an analytical 6-DOF Robotic Arm with Denavit-Hartenberg transformation matrices and PCA9685 PWM servos.
              </li>
              <li>
                <strong className="text-white">Enterprise & Industry Job Simulations</strong>: Accredited by Deloitte (Technology Job Simulation) and Tata (Data Visualisation) for enterprise-grade documentation and analytical acumen.
              </li>
              <li>
                <strong className="text-white">Rapid Onboarding & Clean Code</strong>: Strong fundamentals in modular hardware abstraction layers (HAL), peripheral buses (I2C, SPI, UART), and low-power power management.
              </li>
            </ul>
          </div>

          {/* Quick Technical Stack Matrix */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              TECHNICAL COMPETENCIES MATRIX
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-cyan-400 font-bold block">FIRMWARE & RTOS</span>
                <p className="text-slate-400 text-[11px]">
                  C, Embedded C, C++, FreeRTOS, ESP32 Dual-Core SMP, STM32, Arduino, Bare-Metal Drivers.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-purple-400 font-bold block">PROTOCOLS & IOT</span>
                <p className="text-slate-400 text-[11px]">
                  I2C, SPI, UART, MQTT, HTTP REST, WebSockets, One-Wire (DHT11), BMP180 Barometer.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-emerald-400 font-bold block">ROBOTICS & SOFTWARE</span>
                <p className="text-slate-400 text-[11px]">
                  Inverse Kinematics (DH-Params), OpenCV, Python, PWM PCA9685, SQL, Git & Linux.
                </p>
              </div>
            </div>
          </div>

          {/* Direct Recruiter Actions */}
          <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-white font-bold block">Ready to Connect or Test Technical Depth?</span>
              <span className="text-cyan-300 text-[11px]">
                Download official resume or test with the AI Engineering Copilot.
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  onClose();
                  onOpenResume();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)]"
              >
                <FileText className="w-4 h-4" />
                <span>View Official Resume</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  onClose();
                  onOpenCopilot('match');
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/50 text-cyan-300 transition-all cursor-pointer"
              >
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>Match Your JD</span>
              </button>

              <a
                href="mailto:vishvajitpawar02@gmail.com"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all"
              >
                <Mail className="w-4 h-4 text-purple-400" />
                <span>Email Vishwajit</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
