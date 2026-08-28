import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Bot,
  Send,
  X,
  FileCheck2,
  Briefcase,
  Layers,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Award,
  ChevronRight,
  Terminal,
  HelpCircle,
  Cpu,
  BookOpen,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import ReactMarkdown from 'react-markdown';

interface AIEngineeringCopilotProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'chat' | 'match' | 'interview' | 'deepdive';
  onOpenGuide?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  suggestedQuestions?: string[];
  timestamp: string;
}

interface MatchResult {
  matchScore: number;
  overallVerdict: string;
  executiveSummary: string;
  matchedSkills: string[];
  missingOrLearnableSkills: string[];
  customPitchBullets: string[];
  suggestedInterviewQuestions: string[];
}

interface InterviewQuestion {
  topic: string;
  difficulty: string;
  question: string;
  context: string;
  hint: string;
  keyConceptsTested: string[];
}

interface InterviewEvaluation {
  rating: number;
  verdict: string;
  feedback: string;
  modelAnswer: string;
  followUpQuestion?: string;
}

interface ProjectDeepDive {
  projectName: string;
  engineeringArchitecture: string;
  mathematicalPrinciples: { title: string; equation: string; explanation: string }[];
  hardwareStack: string[];
  firmwarePatterns: string[];
  keyChallengesAndSolutions: { challenge: string; solution: string }[];
}

const SAMPLE_JDS = [
  {
    title: 'Embedded Firmware Engineer (IoT & RTOS)',
    company: 'Tier-1 Automotive / Smart Devices',
    text: `We are looking for an Embedded Firmware Engineer with strong hands-on experience in Embedded C, Microcontrollers (ARM Cortex / ESP32), FreeRTOS task scheduling, I2C/SPI/UART peripheral drivers, and IoT telemetry protocols (MQTT/HTTP). Candidate will design reliable, low-power firmware for connected smart sensor hubs.`,
  },
  {
    title: 'Robotics & Controls Engineer',
    company: 'Industrial Automation & Robotics Lab',
    text: `Seeking a Robotics Engineer with a solid foundation in Kinematics (Forward & Inverse Kinematics, DH parameters), Computer Vision (OpenCV, object detection/tracking), Microcontroller servo control, and Python/C++ integration for multi-axis robotic manipulators.`,
  },
  {
    title: 'Junior IoT Hardware & Software Developer',
    company: 'CleanTech & Telemetry Systems',
    text: `Looking for an Electronics & Telecommunication graduate with practical experience in sensor integration (temperature, barometric pressure, environmental sensors), PCB understanding, ESP32 Wi-Fi/BLE communication, and data visualization dashboards.`,
  },
];

export const AIEngineeringCopilot: React.FC<AIEngineeringCopilotProps> = ({
  isOpen,
  onClose,
  initialTab = 'chat',
  onOpenGuide,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'match' | 'interview' | 'deepdive'>(initialTab);
  const { isStealth } = useTheme();

  // Chat Tab State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hello! I am **Vishwajit's AI Engineering Copilot**, powered by Gemini 3.7 Flash.

I have full, verified technical context on Vishwajit's **B.Tech in Electronics & Telecommunication (Bharati Vidyapeeth College of Engineering Kolhapur)**, his **ESP32 & FreeRTOS IoT architectures**, and his **6-DOF Robotic Arm Inverse Kinematics**.

How can I assist your evaluation today?`,
      suggestedQuestions: [
        'Why should our team hire Vishwajit?',
        'Explain his 6-DOF Robotic Arm kinematics',
        'How does he handle FreeRTOS on ESP32?',
        'Summarize his education and degree credentials',
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // JD Matcher State
  const [jdText, setJdText] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [isMatchLoading, setIsMatchLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  // Mock Interview State
  const [interviewTopic, setInterviewTopic] = useState('ESP32 & FreeRTOS');
  const [activeQuestion, setActiveQuestion] = useState<InterviewQuestion | null>(null);
  const [isQuestionLoading, setIsQuestionLoading] = useState(false);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Deep Dive State
  const [selectedProject, setSelectedProject] = useState<'6-dof-robot' | 'weather-project'>('6-dof-robot');
  const [deepDiveData, setDeepDiveData] = useState<ProjectDeepDive | null>(null);
  const [isDeepDiveLoading, setIsDeepDiveLoading] = useState(false);

  // Clipboard Copied State
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatLoading]);

  // Load initial deep dive on tab select
  useEffect(() => {
    if (activeTab === 'deepdive' && !deepDiveData) {
      loadProjectDeepDive('6-dof-robot');
    }
  }, [activeTab]);

  const handleCopy = (text: string, id: string) => {
    soundFx.playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 1. Send Chat Message
  const handleSendMessage = async (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || isChatLoading) return;

    soundFx.playClick();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.reply || 'Analysis complete.',
        suggestedQuestions: data.suggestedQuestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          text: `Vishwajit specializes in **Embedded Systems, C/Embedded C, ESP32 FreeRTOS multitasking, and 6-DOF Robotics**. Please try asking another question!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 2. Run Job Description Match
  const handleAnalyzeJD = async () => {
    if (!jdText.trim() || isMatchLoading) return;
    soundFx.playClick();
    setIsMatchLoading(true);
    setMatchResult(null);

    try {
      const response = await fetch('/api/copilot/match-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: jdText,
          roleTitle: roleTitle || 'Embedded Software / IoT Engineer',
        }),
      });

      if (!response.ok) throw new Error('JD analysis failed');
      const data = await response.json();
      setMatchResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsMatchLoading(false);
    }
  };

  // 3. Generate Mock Interview Question
  const handleGenerateQuestion = async (topicToUse?: string) => {
    const topic = topicToUse || interviewTopic;
    soundFx.playClick();
    setIsQuestionLoading(true);
    setActiveQuestion(null);
    setEvaluation(null);
    setCandidateAnswer('');
    setShowHint(false);

    try {
      const response = await fetch('/api/copilot/mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, mode: 'generate' }),
      });

      if (!response.ok) throw new Error('Question generation failed');
      const data = await response.json();
      setActiveQuestion(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsQuestionLoading(false);
    }
  };

  // Evaluate Mock Answer
  const handleEvaluateAnswer = async () => {
    if (!activeQuestion || !candidateAnswer.trim() || isEvaluating) return;
    soundFx.playClick();
    setIsEvaluating(true);

    try {
      const response = await fetch('/api/copilot/mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'evaluate',
          question: activeQuestion.question,
          candidateAnswer: candidateAnswer,
        }),
      });

      if (!response.ok) throw new Error('Evaluation failed');
      const data = await response.json();
      setEvaluation(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // 4. Load Project Deep Dive
  const loadProjectDeepDive = async (projectId: '6-dof-robot' | 'weather-project') => {
    soundFx.playClick();
    setSelectedProject(projectId);
    setIsDeepDiveLoading(true);

    try {
      const response = await fetch('/api/copilot/project-deepdive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) throw new Error('Deep dive failed');
      const data = await response.json();
      setDeepDiveData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeepDiveLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md font-mono overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-5xl h-[92vh] max-h-[860px] bg-[var(--bg-panel-solid)] border border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] flex flex-col overflow-hidden text-[var(--text-primary)]"
        >
          {/* Cyber Corner Decals */}
          <div className="cyber-corner-tl" />
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="cyber-corner-br" />

          {/* Modal Header */}
          <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-950/90 border border-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold tracking-wide font-display text-[var(--text-primary)]">
                    AI ENGINEERING COPILOT
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-semibold hidden sm:inline-block">
                    GEMINI 3.7 FLASH
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Recruiter candidate assessment, JD match scorecard, mock interview, and deep architecture
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenGuide && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onOpenGuide();
                  }}
                  title="Open AI Guide & Documentation"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--chip-bg)] border border-[var(--border-subtle)] hover:border-cyan-400 text-xs text-[var(--text-secondary)] hover:text-cyan-300 transition-all cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI GUIDE</span>
                </button>
              )}

              <button
                onClick={() => {
                  soundFx.playClick();
                  onClose();
                }}
                className="p-2 rounded-xl bg-[var(--chip-bg)] hover:bg-rose-950/80 border border-[var(--border-subtle)] hover:border-rose-400 text-[var(--text-muted)] hover:text-rose-300 transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-950/60 border-b border-[var(--border-subtle)] overflow-x-auto no-scrollbar flex-shrink-0 text-xs">
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('chat');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'chat'
                  ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-900/50'
              }`}
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>RECRUITER AI CHAT</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('match');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'match'
                  ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-900/50'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>JD MATCH SCORECARD</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('interview');
                if (!activeQuestion) handleGenerateQuestion('ESP32 & FreeRTOS');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'interview'
                  ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-900/50'
              }`}
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>MOCK TECHNICAL INTERVIEW</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('deepdive');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'deepdive'
                  ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-900/50'
              }`}
            >
              <Layers className="w-4 h-4 text-purple-400" />
              <span>ARCHITECTURE & MATH DEEP DIVE</span>
            </button>
          </div>

          {/* Modal Body Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* TAB 1: RECRUITER AI CHAT */}
            {activeTab === 'chat' && (
              <div className="h-full flex flex-col justify-between space-y-4">
                {/* Chat Messages Feed */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {messages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {m.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="w-4 h-4 text-cyan-400" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 relative shadow-md ${
                          m.role === 'user'
                            ? 'bg-cyan-600 text-white rounded-tr-none font-sans text-sm'
                            : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-none font-mono'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] pb-1 border-b border-[var(--border-subtle)]/50">
                          <span className="font-bold uppercase tracking-wider text-cyan-400">
                            {m.role === 'user' ? 'YOU (RECRUITER / VISITOR)' : 'VISHWAJIT AI COPILOT'}
                          </span>
                          <div className="flex items-center gap-2">
                            <span>{m.timestamp}</span>
                            {m.role === 'assistant' && (
                              <button
                                onClick={() => handleCopy(m.text, m.id)}
                                title="Copy answer to clipboard"
                                className="hover:text-cyan-300 transition-colors"
                              >
                                {copiedId === m.id ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Markdown Text */}
                        <div className="prose prose-invert prose-xs max-w-none text-[var(--text-primary)] leading-relaxed">
                          <ReactMarkdown>{m.text}</ReactMarkdown>
                        </div>

                        {/* Suggested Follow-up Prompt Chips */}
                        {m.suggestedQuestions && m.suggestedQuestions.length > 0 && (
                          <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1.5">
                            <span className="text-[10px] font-bold text-cyan-400 block tracking-wider">
                              SUGGESTED RECRUITER QUERIES:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {m.suggestedQuestions.map((q, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleSendMessage(q)}
                                  className="px-2.5 py-1 rounded-lg bg-[var(--chip-bg)] hover:bg-cyan-950/80 border border-[var(--chip-border)] hover:border-cyan-400 text-[11px] text-[var(--chip-text)] hover:text-cyan-300 transition-all text-left cursor-pointer flex items-center gap-1"
                                >
                                  <ChevronRight className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                                  <span>{q}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {isChatLoading && (
                    <div className="flex gap-3 justify-start items-center">
                      <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs text-cyan-300 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        <span>Gemini 3.7 Flash analyzing portfolio context...</span>
                      </div>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>

                {/* Input Field & Send Action */}
                <div className="flex-shrink-0 pt-2 border-t border-[var(--border-subtle)]">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      placeholder="Ask anything about Vishwajit's embedded firmware, degree, ESP32, robotics..."
                      className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-cyan-400 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none shadow-inner"
                    />
                    <button
                      type="submit"
                      disabled={isChatLoading || !inputQuery.trim()}
                      className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                    >
                      <span>ASK</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 2: JD MATCH SCORECARD */}
            {activeTab === 'match' && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-cyan-400" />
                        PASTE A JOB DESCRIPTION (JD)
                      </h3>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Evaluate Vishwajit's technical fit, extract matched skills, and get tailored interview pitch points
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] text-[var(--text-muted)] self-center mr-1 font-semibold">
                        QUICK PRESETS:
                      </span>
                      {SAMPLE_JDS.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            soundFx.playClick();
                            setRoleTitle(s.title);
                            setJdText(s.text);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[var(--chip-bg)] hover:bg-cyan-950/80 border border-[var(--chip-border)] text-[10px] text-cyan-300 transition-all cursor-pointer"
                        >
                          {s.title.split(' ')[0]} {s.title.split(' ')[1]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      placeholder="Job Title (e.g., Embedded Software Engineer, IoT Architect)"
                      className="w-full px-3.5 py-2 rounded-lg bg-black/40 border border-[var(--border-subtle)] focus:border-cyan-400 text-xs text-[var(--text-primary)]"
                    />

                    <textarea
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                      placeholder="Paste full job description requirements, responsibilities, and qualifications here..."
                      rows={4}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-[var(--border-subtle)] focus:border-cyan-400 text-xs text-[var(--text-primary)] leading-relaxed resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleAnalyzeJD}
                      disabled={isMatchLoading || !jdText.trim()}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                      {isMatchLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>ANALYZING WITH GEMINI...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>GENERATE SCORECARD & INTERVIEW GUIDE</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Scorecard Results Display */}
                {matchResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-[var(--bg-card)] border border-emerald-500/40 space-y-5 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                  >
                    {/* Header Banner & Score */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-[var(--border-subtle)]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold">
                            {matchResult.overallVerdict.toUpperCase()}
                          </span>
                          <span className="text-xs text-[var(--text-muted)] font-mono">
                            {roleTitle || 'Embedded Engineering Candidate'}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-2 max-w-2xl leading-relaxed">
                          {matchResult.executiveSummary}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 bg-black/50 px-5 py-3 rounded-2xl border border-emerald-500/40 flex-shrink-0 self-start sm:self-auto">
                        <div className="text-right">
                          <span className="text-[10px] text-[var(--text-muted)] uppercase block font-semibold">
                            CANDIDATE MATCH
                          </span>
                          <span className="text-2xl font-black text-emerald-400 font-display">
                            {matchResult.matchScore}%
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-400 flex items-center justify-center text-emerald-400">
                          <Award className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    {/* Skill Breakdown Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Matched Skills */}
                      <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/30 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>VERIFIED MATCHED SKILLS ({matchResult.matchedSkills.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {matchResult.matchedSkills.map((s, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-[11px]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Growth / Learnable Skills */}
                      <div className="p-4 rounded-xl bg-black/40 border border-amber-500/30 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                          <AlertCircle className="w-4 h-4" />
                          <span>GROWTH & ADAPTIVE AREAS</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {matchResult.missingOrLearnableSkills.map((s, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-lg bg-amber-950/70 border border-amber-500/50 text-amber-200 text-[11px]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Custom Tailored Pitch Bullets */}
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5" />
                        TAILORED INTERVIEW TALKING POINTS:
                      </h4>
                      <div className="space-y-1.5">
                        {matchResult.customPitchBullets.map((bullet, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-black/30 border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] flex items-start gap-2.5"
                          >
                            <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <p className="leading-relaxed">{bullet}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Suggested Technical Interview Questions */}
                    <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                      <h4 className="text-xs font-bold text-purple-400 flex items-center gap-2">
                        <HelpCircle className="w-3.5 h-3.5" />
                        RECOMMENDED TECHNICAL SCREENING QUESTIONS:
                      </h4>
                      <div className="space-y-1.5">
                        {matchResult.suggestedInterviewQuestions.map((q, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-2"
                          >
                            <span className="text-purple-400 font-bold">Q{i + 1}:</span>
                            <p className="leading-relaxed">{q}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* TAB 3: MOCK TECHNICAL INTERVIEW */}
            {activeTab === 'interview' && (
              <div className="space-y-4">
                {/* Topic Selector Bar */}
                <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-primary)]">TOPIC:</span>
                    <select
                      value={interviewTopic}
                      onChange={(e) => {
                        setInterviewTopic(e.target.value);
                        handleGenerateQuestion(e.target.value);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-black/60 border border-[var(--border-subtle)] text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 font-mono"
                    >
                      <option value="ESP32 & FreeRTOS">ESP32 & FreeRTOS Dual-Core</option>
                      <option value="Embedded C & Memory Architecture">Embedded C & Memory Architecture</option>
                      <option value="Robotics Inverse Kinematics">Robotics & 6-DOF Kinematics</option>
                      <option value="I2C/SPI Sensor Bus Protocols">I2C / SPI / UART Sensor Buses</option>
                      <option value="OpenCV & Computer Vision">OpenCV & Spatial Vision</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleGenerateQuestion()}
                    disabled={isQuestionLoading}
                    className="px-4 py-2 rounded-xl bg-cyan-950/90 border border-cyan-400 hover:bg-cyan-900 text-cyan-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isQuestionLoading ? 'animate-spin' : ''}`} />
                    <span>NEXT QUESTION</span>
                  </button>
                </div>

                {/* Active Question Box */}
                {activeQuestion && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-[var(--bg-card)] border border-cyan-500/40 space-y-3 shadow-md"
                  >
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[10px] font-bold">
                        {activeQuestion.topic.toUpperCase()} • {activeQuestion.difficulty.toUpperCase()}
                      </span>
                      <button
                        onClick={() => setShowHint(!showHint)}
                        className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{showHint ? 'Hide Hint' : 'View Engineering Hint'}</span>
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-[var(--text-primary)] leading-relaxed">
                      {activeQuestion.question}
                    </h3>

                    <p className="text-[11px] text-[var(--text-muted)] italic">
                      Context: {activeQuestion.context}
                    </p>

                    {showHint && (
                      <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs">
                        <strong>Engineering Hint:</strong> {activeQuestion.hint}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold self-center">
                        KEY CONCEPTS:
                      </span>
                      {activeQuestion.keyConceptsTested.map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-black/40 border border-[var(--border-subtle)] text-[10px] text-cyan-400"
                        >
                          {c}
                        </span>
                      ))}
                    </div>

                    {/* Candidate Answer Input */}
                    <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
                      <label className="text-[11px] font-bold text-cyan-400 block">
                        TYPE YOUR TECHNICAL ANSWER / SOLUTION:
                      </label>
                      <textarea
                        value={candidateAnswer}
                        onChange={(e) => setCandidateAnswer(e.target.value)}
                        placeholder="Write your explanation (e.g. mention FreeRTOS mutexes, queues, volatile keyword, ISR safety, or DH matrix frames)..."
                        rows={3}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-[var(--border-subtle)] focus:border-cyan-400 text-xs text-[var(--text-primary)] leading-relaxed resize-none font-mono"
                      />

                      <div className="flex justify-end">
                        <button
                          onClick={handleEvaluateAnswer}
                          disabled={isEvaluating || !candidateAnswer.trim()}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        >
                          {isEvaluating ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>EVALUATING ANSWER...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>SUBMIT FOR AI EVALUATION</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Evaluation Result */}
                {evaluation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-slate-950/90 border border-emerald-500/50 space-y-4 shadow-xl"
                  >
                    <div className="flex justify-between items-center pb-3 border-b border-[var(--border-subtle)]">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold">
                          {evaluation.verdict.toUpperCase()}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">AI Principal Engineer Rating</span>
                      </div>
                      <div className="text-xl font-black text-emerald-400 font-display">
                        {evaluation.rating} / 10
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-emerald-400">ENGINEERING FEEDBACK:</span>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{evaluation.feedback}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/60 border border-cyan-500/30 space-y-1.5">
                      <span className="text-[11px] font-bold text-cyan-400 block">
                        GOLD-STANDARD MODEL ANSWER:
                      </span>
                      <p className="text-xs text-cyan-200 leading-relaxed font-mono">{evaluation.modelAnswer}</p>
                    </div>

                    {evaluation.followUpQuestion && (
                      <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1">
                        <span className="text-[10px] font-bold text-purple-400 uppercase">
                          ADVANCED FOLLOW-UP QUESTION:
                        </span>
                        <p className="text-xs text-purple-200">{evaluation.followUpQuestion}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {/* TAB 4: ARCHITECTURE & MATH DEEP DIVE */}
            {activeTab === 'deepdive' && (
              <div className="space-y-4">
                {/* Project Selector */}
                <div className="flex gap-2">
                  <button
                    onClick={() => loadProjectDeepDive('6-dof-robot')}
                    className={`flex-1 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedProject === '6-dof-robot'
                        ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                        : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">6-DOF ROBOTIC ARM</div>
                    <div className="text-[10px] opacity-75">Inverse Kinematics & OpenCV Visual Target Tracking</div>
                  </button>

                  <button
                    onClick={() => loadProjectDeepDive('weather-project')}
                    className={`flex-1 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedProject === 'weather-project'
                        ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                        : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">ESP32 WEATHER STATION</div>
                    <div className="text-[10px] opacity-75">I2C Bus Protocol, FreeRTOS & Hypsometric Math</div>
                  </button>
                </div>

                {/* Deep Dive Content Display */}
                {isDeepDiveLoading && (
                  <div className="py-12 text-center text-xs text-cyan-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Loading mathematical model and hardware schematics...</span>
                  </div>
                )}

                {deepDiveData && !isDeepDiveLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4 text-xs shadow-md"
                  >
                    <div className="pb-3 border-b border-[var(--border-subtle)]">
                      <h3 className="text-base font-bold text-cyan-400">{deepDiveData.projectName}</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                        {deepDiveData.engineeringArchitecture}
                      </p>
                    </div>

                    {/* Mathematical Principles */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                        <Terminal className="w-4 h-4" />
                        MATHEMATICAL & ALGORITHMIC FOUNDATIONS:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {deepDiveData.mathematicalPrinciples.map((math, i) => (
                          <div
                            key={i}
                            className="p-3.5 rounded-xl bg-black/50 border border-amber-500/30 space-y-2"
                          >
                            <span className="text-[11px] font-bold text-amber-300 block">{math.title}</span>
                            <div className="p-2 rounded bg-slate-900/90 font-mono text-[11px] text-cyan-300 border border-slate-800 break-all">
                              {math.equation}
                            </div>
                            <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                              {math.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hardware & Firmware Specs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 rounded-xl bg-black/40 border border-cyan-500/30 space-y-2">
                        <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5" /> HARDWARE SUBSYSTEMS
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {deepDiveData.hardwareStack.map((h, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-[10px] text-cyan-200"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-black/40 border border-purple-500/30 space-y-2">
                        <span className="text-[11px] font-bold text-purple-400 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5" /> FIRMWARE DESIGN PATTERNS
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {deepDiveData.firmwarePatterns.map((p, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-[10px] text-purple-200"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Key Engineering Challenges & Solutions */}
                    <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                      <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        CRITICAL ENGINEERING CHALLENGES & VISHWAJIT'S SOLUTIONS:
                      </h4>
                      {deepDiveData.keyChallengesAndSolutions.map((c, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-black/30 border border-emerald-500/20 space-y-1 text-xs"
                        >
                          <div className="text-rose-300 font-semibold">Challenge: {c.challenge}</div>
                          <div className="text-emerald-300">Solution: {c.solution}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] flex flex-col sm:flex-row justify-between sm:items-center gap-2 flex-shrink-0 text-[11px] text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Grounded in Vishwajit's verified credentials & projects</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Contact: vishvajitpawar02@gmail.com</span>
              <a
                href="mailto:vishvajitpawar02@gmail.com"
                className="text-cyan-400 hover:underline flex items-center gap-1 font-bold"
              >
                <span>EMAIL VISHWAJIT</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
