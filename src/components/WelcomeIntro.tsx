import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface WelcomeIntroProps {
  onComplete: () => void;
}

const SYSTEM_PHASES = [
  { threshold: 0, text: 'INITIALIZING SYSTEMS' },
  { threshold: 30, text: 'LOADING PROJECTS' },
  { threshold: 65, text: 'STARTING ROBOTICS LAB' },
  { threshold: 92, text: 'SYSTEM READY' },
];

export const WelcomeIntro: React.FC<WelcomeIntroProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('INITIALIZING SYSTEMS');
  const [isExiting, setIsExiting] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const animationFrameRef = useRef<number | null>(null);

  // Check prefers-reduced-motion and session storage
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsReducedMotion(true);
      // For reduced motion, complete almost immediately
      const timer = setTimeout(() => {
        sessionStorage.setItem('vlp_intro_seen', 'true');
        onComplete();
      }, 300);
      return () => clearTimeout(timer);
    }

    const hasSeenIntro = sessionStorage.getItem('vlp_intro_seen');
    if (hasSeenIntro) {
      // If already seen in this session, keep intro ultra brief (500ms smooth entrance)
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onComplete, 400);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  // Subtle background floating micro-particles
  useEffect(() => {
    if (isReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate very subtle, small micro-particles
    const particleCount = Math.min(35, Math.floor((width * height) / 35000));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -Math.random() * 0.3 - 0.05,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle micro-particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.fillStyle = `rgba(0, 240, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isReducedMotion]);

  // Progress bar timeline (2.2s total duration for a crisp, professional intro)
  useEffect(() => {
    if (isReducedMotion) return;

    const totalDuration = 2200; // ms
    startTimeRef.current = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const rawPct = Math.min(100, (elapsed / totalDuration) * 100);
      
      // Easing curve: smooth fast start, graceful finish
      const eased = Math.round(100 * (1 - Math.pow(1 - rawPct / 100, 2.2)));
      setProgress(eased);

      // Update system phase text
      const currentPhase = [...SYSTEM_PHASES].reverse().find((p) => eased >= p.threshold);
      if (currentPhase) {
        setCurrentMessage(currentPhase.text);
      }

      if (eased < 100) {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      } else {
        // Finished
        sessionStorage.setItem('vlp_intro_seen', 'true');
        const exitTimer = setTimeout(() => {
          setIsExiting(true);
          const completeTimer = setTimeout(() => {
            onComplete();
          }, 500);
          return () => clearTimeout(completeTimer);
        }, 350);
        return () => clearTimeout(exitTimer);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [onComplete, isReducedMotion]);

  const handleSkip = () => {
    sessionStorage.setItem('vlp_intro_seen', 'true');
    setIsExiting(true);
    setTimeout(onComplete, 200);
  };

  // Keyboard shortcut: Esc or Space to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          id="welcome-intro-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#040812] text-slate-100 p-6 select-none overflow-hidden"
          role="region"
          aria-label="Welcome screen and system initialization"
        >
          {/* Subtle Canvas Particle Layer */}
          <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

          {/* Subtle Animated Engineering Coordinate Grid */}
          <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />

          {/* Minimal Ambient Lighting Gradients */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-cyan-500/10 via-sky-500/5 to-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Soft Technical Horizontal Scanning Line */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-[scanlineSweep_4s_ease-in-out_infinite]" />
          </div>

          {/* Skip Intro Button (Accessible top-right) */}
          <div className="absolute top-6 right-6 z-20">
            <button
              id="skip-intro-btn"
              onClick={handleSkip}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 font-mono text-[11px] tracking-wider transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none cursor-pointer"
              aria-label="Skip welcome introduction"
            >
              <span>SKIP</span>
              <span className="text-[9px] text-slate-500 font-sans border border-slate-700 rounded px-1">ESC</span>
            </button>
          </div>

          {/* Main Cinematic Branding Presentation */}
          <div className="relative z-10 max-w-xl w-full flex flex-col items-center text-center space-y-6">
            {/* Subtle System Status Pill */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-cyan-500/25 shadow-[0_0_15px_rgba(0,240,255,0.08)] backdrop-blur-md"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-cyan-300 uppercase">
                ENGINEERING LABORATORY
              </span>
            </motion.div>

            {/* Display Name with Smooth Fade & Blur-to-Sharp Transition */}
            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-display text-white"
              >
                VISHVAJIT PAWAR
              </motion.h1>

              {/* Title & Domain Subheaders */}
              <motion.div
                initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-1.5"
              >
                <div className="text-xs sm:text-sm font-semibold tracking-widest text-cyan-300 uppercase font-mono">
                  ELECTRONICS & TELECOMMUNICATION ENGINEER
                </div>
                <div className="text-[11px] sm:text-xs text-slate-400 font-mono tracking-wider">
                  EMBEDDED SYSTEMS • IoT • ROBOTICS • AI
                </div>
              </motion.div>
            </div>

            {/* Minimal Technical Progress Bar & Real-Time System Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="w-full max-w-sm pt-4 space-y-2.5"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  {progress === 100 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  )}
                  <span className="tracking-wider">{currentMessage}</span>
                </span>
                <span className="text-slate-300 font-bold tracking-wider">{progress}%</span>
              </div>

              {/* Minimalist 2px high precision progress track */}
              <div
                className="w-full bg-slate-900/90 rounded-full h-1.5 border border-cyan-500/20 overflow-hidden relative"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-300 rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'linear' }}
                />
              </div>

              {/* Ambient Micro-Coordinate footer */}
              <div className="pt-2 flex items-center justify-between text-[9px] font-mono text-slate-600">
                <span>PORTFOLIO v3.0</span>
                <span>AUTONOMOUS SYSTEMS // PERCEPTION</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
