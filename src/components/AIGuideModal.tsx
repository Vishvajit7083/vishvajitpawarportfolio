import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  X,
  Sparkles,
  Bot,
  FileCheck2,
  Award,
  Terminal,
  Cpu,
  Mic,
  ArrowUpRight,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface AIGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCopilot: (tab?: 'chat' | 'match' | 'interview' | 'deepdive') => void;
}

export const AIGuideModal: React.FC<AIGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenCopilot,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md font-mono overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl max-h-[88vh] bg-[var(--bg-panel-solid)] border border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] flex flex-col overflow-hidden text-[var(--text-primary)]"
        >
          {/* Decals */}
          <div className="cyber-corner-tl" />
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="cyber-corner-br" />

          {/* Header */}
          <div className="px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/90 border border-cyan-400 flex items-center justify-center text-cyan-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold font-display text-[var(--text-primary)]">
                  PORTFOLIO AI FEATURES & RECRUITER TOOLKIT GUIDE
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Complete user guide to utilizing the Gemini 3.7 Flash AI capabilities in this portfolio
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-[var(--chip-bg)] hover:bg-rose-950/80 border border-[var(--border-subtle)] hover:border-rose-400 text-[var(--text-muted)] hover:text-rose-300 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-xs leading-relaxed">
            {/* Executive Overview Banner */}
            <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-cyan-300">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Next-Generation AI Grounding Architecture</span>
              </div>
              <p>
                This portfolio integrates <strong>OpenRouter API</strong> and <strong>Google Gemini 3.7 Flash</strong> server-side. All responses are factually grounded
                in Vishwajit Laxman Pawar's verified B.Tech coursework at{' '}
                <strong>Bharati Vidyapeeth's College of Engineering Kolhapur</strong>, his 6-DOF Robotic Arm, and his ESP32 FreeRTOS IoT architectures.
              </p>
            </div>

            {/* Feature Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Feature 1: Recruiter Copilot */}
              <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-cyan-400 text-sm">
                    <Bot className="w-4 h-4" />
                    <span>1. Recruiter AI Copilot</span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCopilot('chat');
                    }}
                    className="text-[10px] text-cyan-300 hover:underline flex items-center gap-1"
                  >
                    <span>Try Now</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[var(--text-secondary)]">
                  Ask conversational questions about Vishwajit's suitability for specific engineering roles. Pre-loaded with prompt chips covering FreeRTOS, kinematics, and core strengths.
                </p>
                <div className="text-[11px] text-cyan-300 bg-black/40 p-2 rounded-lg border border-cyan-500/20">
                  <strong>Example Query:</strong> "How does Vishwajit prevent race conditions in ESP32 FreeRTOS tasks?"
                </div>
              </div>

              {/* Feature 2: JD Matcher */}
              <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
                    <FileCheck2 className="w-4 h-4" />
                    <span>2. AI Job Description Matcher</span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCopilot('match');
                    }}
                    className="text-[10px] text-emerald-300 hover:underline flex items-center gap-1"
                  >
                    <span>Try Now</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[var(--text-secondary)]">
                  Paste any job description (from LinkedIn, Indeed, or internal portals) to instantly generate a 0-100% Match Scorecard, extract matched technical skills, and get tailored interview questions.
                </p>
                <div className="text-[11px] text-emerald-300 bg-black/40 p-2 rounded-lg border border-emerald-500/20">
                  <strong>Includes:</strong> Presets for Automotive Embedded, Robotics, and IoT roles.
                </div>
              </div>

              {/* Feature 3: Mock Interview */}
              <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
                    <Award className="w-4 h-4" />
                    <span>3. AI Mock Technical Interviewer</span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCopilot('interview');
                    }}
                    className="text-[10px] text-amber-300 hover:underline flex items-center gap-1"
                  >
                    <span>Try Now</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[var(--text-secondary)]">
                  Simulates a technical interview by generating realistic questions on Embedded C, FreeRTOS, Inverse Kinematics, and OpenCV. Candidates/evaluators can submit answers for automated 1-10 grading and model answers.
                </p>
                <div className="text-[11px] text-amber-300 bg-black/40 p-2 rounded-lg border border-amber-500/20">
                  <strong>Evaluates:</strong> Technical depth, memory management, and synchronization correctness.
                </div>
              </div>

              {/* Feature 4: Firmware Studio */}
              <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-purple-400 text-sm">
                    <Cpu className="w-4 h-4" />
                    <span>4. ESP32 Firmware & Serial Studio</span>
                  </div>
                  <a
                    href="#esp32-ai-studio"
                    onClick={() => onClose()}
                    className="text-[10px] text-purple-300 hover:underline flex items-center gap-1"
                  >
                    <span>Jump to Section</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[var(--text-secondary)]">
                  Generate production-ready Arduino/ESP-IDF C++ code for FreeRTOS dual-core queues, BMP180 barometric telemetry, and BLE GATT servers with simulated virtual serial logs.
                </p>
                <div className="text-[11px] text-purple-300 bg-black/40 p-2 rounded-lg border border-purple-500/20">
                  <strong>Feature:</strong> One-click "Flash to Virtual ESP32" simulates serial telemetry at 115200 baud.
                </div>
              </div>
            </div>

            {/* Voice Assistant HUD Guide */}
            <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center gap-2 font-bold text-cyan-400 text-sm">
                <Mic className="w-4 h-4" />
                <span>5. Global Voice AI Assistant (Bottom-Left HUD)</span>
              </div>
              <p className="text-[var(--text-secondary)]">
                Click the floating microphone at the bottom-left of the screen and speak natural commands like:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <span className="p-2 rounded bg-black/40 border border-[var(--border-subtle)] text-[10px] text-cyan-300">
                  "Rotate Robot"
                </span>
                <span className="p-2 rounded bg-black/40 border border-[var(--border-subtle)] text-[10px] text-cyan-300">
                  "Exploded View"
                </span>
                <span className="p-2 rounded bg-black/40 border border-[var(--border-subtle)] text-[10px] text-cyan-300">
                  "Go to Projects"
                </span>
                <span className="p-2 rounded bg-black/40 border border-[var(--border-subtle)] text-[10px] text-cyan-300">
                  "Open Resume"
                </span>
              </div>
            </div>

            {/* How to Present to Recruiters */}
            <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Tips for Vishwajit to Showcase in Technical Interviews</span>
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-[var(--text-secondary)]">
                <li>
                  <strong>Demonstrate Full-Stack AI Integration:</strong> Explain how you leveraged Gemini 3.7 Flash server-side with structured JSON schemas and robust local fallback resilience.
                </li>
                <li>
                  <strong>Live JD Match Demo:</strong> Invite the interviewer to paste their actual open job description into the JD Matcher during the interview to see real-time skill alignment!
                </li>
                <li>
                  <strong>Firmware Generation:</strong> Show the live ESP32 firmware studio producing FreeRTOS dual-core task synchronization code.
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] flex justify-between items-center flex-shrink-0">
            <span className="text-[11px] text-[var(--text-muted)]">
              Powered by Google Gemini 3.7 Flash & WebGL Three.js
            </span>
            <button
              onClick={() => {
                onClose();
                onOpenCopilot('chat');
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>LAUNCH AI COPILOT</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
