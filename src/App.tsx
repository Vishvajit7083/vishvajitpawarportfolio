import React, { useState, useEffect, Suspense, lazy } from 'react';
import { WelcomeIntro } from './components/WelcomeIntro';
import { Navigation } from './components/Navigation';
import { Hero3D } from './components/Hero3D';
import { EngineeringMetrics } from './components/EngineeringMetrics';
import { About } from './components/About';
import { SkillsNetwork } from './components/SkillsNetwork';
import { ExperienceTimeline } from './components/ExperienceTimeline';
import { Education } from './components/Education';
import { Certifications } from './components/Certifications';
import { Languages } from './components/Languages';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { GlobalVoiceAssistant } from './components/GlobalVoiceAssistant';
import { CustomCursor } from './components/CustomCursor';
import { SectionSkeleton } from './components/SectionSkeleton';
import { NotFound } from './components/NotFound';
import { Bot } from 'lucide-react';
import { soundFx } from './utils/audio';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Lazy-load heavy 3D and modal components for instant initial page loading & optimal bundle splitting
const RobotProject = lazy(() =>
  import('./components/RobotProject').then((module) => ({ default: module.RobotProject }))
);
const WeatherProject = lazy(() =>
  import('./components/WeatherProject').then((module) => ({ default: module.WeatherProject }))
);
const HardwareWorkbench = lazy(() =>
  import('./components/HardwareWorkbench').then((module) => ({ default: module.HardwareWorkbench }))
);
const ResumeModal = lazy(() =>
  import('./components/ResumeModal').then((module) => ({ default: module.ResumeModal }))
);
const RecruiterFastTrackModal = lazy(() =>
  import('./components/RecruiterFastTrackModal').then((module) => ({
    default: module.RecruiterFastTrackModal,
  }))
);
const AIEngineeringCopilot = lazy(() =>
  import('./components/AIEngineeringCopilot').then((module) => ({
    default: module.AIEngineeringCopilot,
  }))
);
const AIGuideModal = lazy(() =>
  import('./components/AIGuideModal').then((module) => ({ default: module.AIGuideModal }))
);

function PortfolioApp() {
  const [isLoading, setIsLoading] = useState(true);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [recruiterBriefOpen, setRecruiterBriefOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotTab, setCopilotTab] = useState<'chat' | 'match' | 'interview' | 'deepdive'>('chat');
  const [guideOpen, setGuideOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [is404, setIs404] = useState(false);
  const { isStealth } = useTheme();

  // Simple path routing check for 404 detection
  useEffect(() => {
    const path = window.location.pathname;
    // If not root path or standard hash routes, show 404
    if (path !== '/' && path !== '' && path !== '/index.html') {
      setIs404(true);
    }
  }, []);

  const handleToggleSound = () => {
    const newState = soundFx.toggleSound();
    setSoundEnabled(newState);
  };

  const handleOpenCopilot = (tab: 'chat' | 'match' | 'interview' | 'deepdive' = 'chat') => {
    soundFx.playClick();
    setCopilotTab(tab);
    setCopilotOpen(true);
  };

  if (is404) {
    return (
      <NotFound
        onGoHome={() => {
          window.history.pushState({}, '', '/');
          setIs404(false);
        }}
        onViewProjects={() => {
          window.history.pushState({}, '', '/');
          setIs404(false);
          setTimeout(() => {
            const el = document.getElementById('robotics-lab') || document.getElementById('projects');
            el?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-mono relative overflow-x-hidden transition-colors duration-300">
      {/* Skip to Main Content Link for Keyboard Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-cyan-500 focus:text-slate-950 focus:font-mono focus:font-bold focus:rounded-xl focus:shadow-[0_0_25px_rgba(0,240,255,0.8)] focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Cinematic Engineering Welcome Animation Intro Screen */}
      {isLoading && <WelcomeIntro onComplete={() => setIsLoading(false)} />}

      {/* Floating Futuristic Navigation */}
      <Navigation
        onOpenResume={() => setResumeOpen(true)}
        onOpenRecruiterBrief={() => setRecruiterBriefOpen(true)}
        onOpenCopilot={handleOpenCopilot}
        onOpenGuide={() => setGuideOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Content Sections */}
      <main id="main-content" className="relative z-10">
        {/* 1. Hero 3D Robotics Lab Section */}
        <Hero3D
          onOpenResume={() => setResumeOpen(true)}
          onOpenCopilot={() => handleOpenCopilot('chat')}
          onOpenRecruiterBrief={() => setRecruiterBriefOpen(true)}
        />

        {/* 2. Key Hardware & Architectural Benchmarks */}
        <EngineeringMetrics />

        {/* 3. Holographic Profile & About Me */}
        <About />

        {/* 4. 3D Connected Skills Network Constellation */}
        <SkillsNetwork />

        {/* 5. Project 1: Interactive Robotics Lab (Two-Wheel Differential Drive & HC-SR04 Sonar) */}
        <div id="robotics-lab">
          <Suspense
            fallback={
              <SectionSkeleton
                title="Loading Robotics Lab..."
                subtitle="Initializing Kinematics & Sonar Environment"
                heightClass="min-h-[640px]"
              />
            }
          >
            <RobotProject />
          </Suspense>
        </div>

        {/* 6. Project 2: IoT-Based Weather Monitoring System */}
        <div id="weather-project">
          <Suspense
            fallback={
              <SectionSkeleton
                title="Loading Weather Station..."
                subtitle="Mounting 3D Sensor Topology & ESP32 Telemetry"
                heightClass="min-h-[480px]"
              />
            }
          >
            <WeatherProject />
          </Suspense>
        </div>

        {/* 7. Interactive Hardware & Architecture Workbench */}
        <div id="hardware-workbench">
          <Suspense
            fallback={
              <SectionSkeleton
                title="Loading Hardware Workbench..."
                subtitle="Initializing Logic Analyzer & RTOS Bus"
                heightClass="min-h-[480px]"
              />
            }
          >
            <HardwareWorkbench />
          </Suspense>
        </div>

        {/* 8. Career Timeline & Virtual Job Simulations */}
        <ExperienceTimeline />

        {/* 9. 3D Education & Degree Credentials */}
        <Education />

        {/* 10. Floating Certification Cards */}
        <Certifications />

        {/* 11. Multilingual Linguistic Capabilities */}
        <Languages />

        {/* 12. Futuristic Contact Terminal */}
        <Contact onOpenResume={() => setResumeOpen(true)} />
      </main>

      {/* Floating AI Copilot Action Dock (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        <button
          onClick={() => handleOpenCopilot('chat')}
          id="floating-ai-copilot-btn"
          title="Launch Gemini AI Engineering Copilot"
          aria-label="Launch Gemini AI Engineering Copilot"
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[var(--bg-panel-solid)] hover:bg-cyan-950 border border-cyan-400/80 text-cyan-300 font-mono font-bold text-xs shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:shadow-[0_0_35px_rgba(0,240,255,0.7)] transition-all duration-300 hover:scale-105 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11px] leading-tight font-display tracking-wider text-[var(--text-primary)]">
              AI COPILOT
            </span>
            <span className="text-[9px] text-cyan-400 leading-tight">GEMINI 3.7 FLASH</span>
          </div>
        </button>
      </div>

      {/* Cyberpunk / Cleanroom Footer */}
      <Footer />

      {/* Lazy Modals loaded with Suspense */}
      <Suspense fallback={null}>
        {resumeOpen && <ResumeModal isOpen={resumeOpen} onClose={() => setResumeOpen(false)} />}
        {recruiterBriefOpen && (
          <RecruiterFastTrackModal
            isOpen={recruiterBriefOpen}
            onClose={() => setRecruiterBriefOpen(false)}
            onOpenResume={() => setResumeOpen(true)}
            onOpenCopilot={handleOpenCopilot}
          />
        )}
        {copilotOpen && (
          <AIEngineeringCopilot
            isOpen={copilotOpen}
            onClose={() => setCopilotOpen(false)}
            initialTab={copilotTab}
            onOpenGuide={() => {
              setCopilotOpen(false);
              setGuideOpen(true);
            }}
          />
        )}
        {guideOpen && (
          <AIGuideModal
            isOpen={guideOpen}
            onClose={() => setGuideOpen(false)}
            onOpenCopilot={(tab) => {
              setGuideOpen(false);
              handleOpenCopilot(tab);
            }}
          />
        )}
      </Suspense>

      {/* Global AI Voice Assistant HUD */}
      <GlobalVoiceAssistant />

      {/* Cinematic Custom Cursor */}
      <CustomCursor />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PortfolioApp />
    </ThemeProvider>
  );
}
