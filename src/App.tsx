import React, { useState } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { Navigation } from './components/Navigation';
import { Hero3D } from './components/Hero3D';
import { About } from './components/About';
import { SkillsNetwork } from './components/SkillsNetwork';
import { RobotProject } from './components/RobotProject';
import { WeatherProject } from './components/WeatherProject';
import { ExperienceTimeline } from './components/ExperienceTimeline';
import { Education } from './components/Education';
import { Certifications } from './components/Certifications';
import { Languages } from './components/Languages';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { ResumeModal } from './components/ResumeModal';
import { GlobalVoiceAssistant } from './components/GlobalVoiceAssistant';
import { AIEngineeringCopilot } from './components/AIEngineeringCopilot';
import { AIGuideModal } from './components/AIGuideModal';
import { Sparkles, Bot, FileCheck2, BookOpen } from 'lucide-react';
import { soundFx } from './utils/audio';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function PortfolioApp() {
  const [isLoading, setIsLoading] = useState(true);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotTab, setCopilotTab] = useState<'chat' | 'match' | 'interview' | 'deepdive'>('chat');
  const [guideOpen, setGuideOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const { isStealth } = useTheme();

  const handleToggleSound = () => {
    const newState = soundFx.toggleSound();
    setSoundEnabled(newState);
  };

  const handleOpenCopilot = (tab: 'chat' | 'match' | 'interview' | 'deepdive' = 'chat') => {
    soundFx.playClick();
    setCopilotTab(tab);
    setCopilotOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-mono relative overflow-x-hidden transition-colors duration-300">
      {/* Firmware Boot Loading Screen */}
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      {/* Floating Futuristic Navigation */}
      <Navigation
        onOpenResume={() => setResumeOpen(true)}
        onOpenCopilot={handleOpenCopilot}
        onOpenGuide={() => setGuideOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Content Sections */}
      <main className="relative z-10">
        {/* 1. Hero 3D Robotics Lab Section */}
        <Hero3D
          onOpenResume={() => setResumeOpen(true)}
          onOpenCopilot={() => handleOpenCopilot('chat')}
        />

        {/* 2. Holographic Profile & About Me */}
        <About />

        {/* 3. 3D Connected Skills Network Constellation */}
        <SkillsNetwork />

        {/* 4. Project 1: AI-Assisted Robot */}
        <RobotProject />

        {/* 5. Project 2: IoT-Based Weather Monitoring System */}
        <WeatherProject />

        {/* 6. Career Timeline & Virtual Job Simulations */}
        <ExperienceTimeline />

        {/* 7. 3D Education & Degree Credentials */}
        <Education />

        {/* 8. Floating Certification Cards */}
        <Certifications />

        {/* 9. Multilingual Linguistic Capabilities */}
        <Languages />

        {/* 10. Futuristic Contact Terminal */}
        <Contact onOpenResume={() => setResumeOpen(true)} />
      </main>

      {/* Floating AI Copilot Action Dock (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        <button
          onClick={() => handleOpenCopilot('chat')}
          id="floating-ai-copilot-btn"
          title="Launch Gemini AI Engineering Copilot"
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[var(--bg-panel-solid)] hover:bg-cyan-950 border border-cyan-400/80 text-cyan-300 font-mono font-bold text-xs shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:shadow-[0_0_35px_rgba(0,240,255,0.7)] transition-all duration-300 hover:scale-105 cursor-pointer"
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

      {/* Formatted Printable Resume Modal */}
      <ResumeModal isOpen={resumeOpen} onClose={() => setResumeOpen(false)} />

      {/* AI Engineering Copilot Modal */}
      <AIEngineeringCopilot
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        initialTab={copilotTab}
        onOpenGuide={() => {
          setCopilotOpen(false);
          setGuideOpen(true);
        }}
      />

      {/* AI Features & Recruiter Guide Modal */}
      <AIGuideModal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
        onOpenCopilot={(tab) => {
          setGuideOpen(false);
          handleOpenCopilot(tab);
        }}
      />

      {/* Global AI Voice Assistant HUD (OpenRouter / Speech API) */}
      <GlobalVoiceAssistant />
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

