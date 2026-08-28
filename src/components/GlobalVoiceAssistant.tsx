import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, ChevronUp, ChevronDown, Command, Radio, Compass, Bot } from 'lucide-react';
import { voiceAssistant, VoiceCommandEventDetail } from '../utils/voiceAssistant';
import { sound } from '../utils/audioEffects';

export const GlobalVoiceAssistant: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState('IDLE');
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = voiceAssistant.subscribe((state) => {
      setIsListening(state.isListening);
      if (state.transcript) setTranscript(state.transcript);
      if (state.reply) setReply(state.reply);
      setStatus(state.status);
    });

    const handleCustomCommand = (e: Event) => {
      const customEvent = e as CustomEvent<VoiceCommandEventDetail>;
      if (customEvent.detail?.action) {
        setLastAction(customEvent.detail.action);
        setTimeout(() => setLastAction(null), 4000);
      }
    };

    window.addEventListener('portfolio:voice-command', handleCustomCommand);

    return () => {
      unsubscribe();
      window.removeEventListener('portfolio:voice-command', handleCustomCommand);
    };
  }, []);

  const handleToggleMic = () => {
    sound.playClick();
    if (!voiceAssistant.isSupported()) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    voiceAssistant.toggleListening();
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    const muted = voiceAssistant.toggleMute();
    setIsMuted(muted);
  };

  const executeSampleCommand = (cmd: string) => {
    sound.playClick();
    setTranscript(cmd);
    voiceAssistant.handleFinalTranscript(cmd, 'global');
  };

  const quickCommands = [
    { label: 'Say "Good Morning"', cmd: 'Good morning' },
    { label: 'Say "Go to Home"', cmd: 'Go to home section' },
    { label: 'Say "Rotate Robot"', cmd: 'Rotate robot' },
    { label: 'Say "Exploded View"', cmd: 'Exploded view' },
    { label: 'Say "Reset"', cmd: 'Reset' },
    { label: 'Say "Open Resume"', cmd: 'Open resume' },
  ];

  return (
    <div
      id="global-voice-assistant"
      className="fixed bottom-4 left-4 z-40 font-mono select-none"
    >
      {/* Expanded HUD Terminal */}
      {isExpanded && (
        <div className="mb-2 w-80 sm:w-96 rounded-2xl glass-panel-glow border border-cyan-500/40 p-4 shadow-[0_0_40px_rgba(0,240,255,0.25)] relative overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="cyber-corner-tl" />
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="cyber-corner-br" />

          {/* Assistant Header */}
          <div className="flex items-center justify-between border-b border-cyan-900/60 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                <Bot className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <span>LAB VOICE AI ASSISTANT</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[10px] text-slate-400">OPENROUTER / GEMINI READY</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToggleMute}
                title={isMuted ? 'Unmute Audio Speech' : 'Mute Audio Speech'}
                className="p-1 rounded text-slate-400 hover:text-cyan-300 transition-colors"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                title="Collapse Voice HUD"
                className="p-1 rounded text-slate-400 hover:text-slate-200"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Live Waveform Equalizer Visualizer */}
          <div className="flex items-center justify-center gap-1 h-8 bg-slate-950/80 rounded-lg border border-slate-800/80 px-3 mb-3">
            {[12, 24, 18, 32, 14, 28, 20, 36, 16, 26, 15, 30].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isListening
                    ? 'bg-cyan-400 animate-pulse'
                    : status === 'RESPONDING'
                    ? 'bg-purple-400 animate-bounce'
                    : 'bg-slate-700 h-1.5'
                }`}
                style={{
                  height: isListening ? `${(h * 0.8).toFixed(0)}px` : status === 'RESPONDING' ? `${(h * 0.6).toFixed(0)}px` : '4px',
                  animationDelay: `${i * 60}ms`,
                }}
              />
            ))}
            <span className="ml-2 text-[10px] text-cyan-400 font-bold uppercase">
              {isListening ? 'LISTENING...' : status === 'PROCESSING' ? 'ANALYZING...' : status === 'RESPONDING' ? 'SPEAKING...' : 'READY'}
            </span>
          </div>

          {/* Transcript / Reply Display */}
          <div className="space-y-2 text-xs mb-3">
            {transcript && (
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800 text-slate-300">
                <span className="text-[10px] text-cyan-400 font-bold block mb-0.5">YOU SAID:</span>
                <p className="text-white">"{transcript}"</p>
              </div>
            )}

            {reply && (
              <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-200">
                <span className="text-[10px] text-emerald-400 font-bold block mb-0.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> ASSISTANT:
                </span>
                <p className="leading-relaxed">{reply}</p>
              </div>
            )}

            {!transcript && !reply && (
              <div className="p-2.5 rounded bg-slate-900/50 border border-dashed border-slate-800 text-slate-400 text-[11px] leading-relaxed">
                Click the microphone and say <strong className="text-cyan-300">"Good morning"</strong>, <strong className="text-cyan-300">"Go to Home"</strong>, or control the 3D robot with <strong className="text-cyan-300">"Rotate"</strong>, <strong className="text-cyan-300">"Exploded view"</strong>, or <strong className="text-cyan-300">"Reset"</strong>.
              </div>
            )}
          </div>

          {/* Quick Voice Command Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 flex items-center gap-1 uppercase tracking-wider font-semibold">
              <Command className="w-3 h-3 text-cyan-400" /> QUICK VOICE TRIGGERS:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickCommands.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => executeSampleCommand(q.cmd)}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-cyan-950/80 border border-slate-800 hover:border-cyan-500/50 text-[10px] text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Pill Trigger */}
      <div className="flex items-center gap-2">
        <button
          id="global-voice-mic-btn"
          onClick={handleToggleMic}
          title={isListening ? 'Stop Listening' : 'Activate Voice Assistant'}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-semibold tracking-wider transition-all duration-300 cursor-pointer shadow-lg backdrop-blur-md group ${
            isListening
              ? 'bg-rose-950/90 border-rose-500 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse'
              : 'bg-slate-950/90 border-cyan-500/50 text-cyan-300 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]'
          }`}
        >
          {isListening ? (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
              </span>
              <MicOff className="w-4 h-4 text-rose-300" />
              <span className="text-[11px] font-bold">LISTENING...</span>
            </>
          ) : (
            <>
              <Radio className="w-4 h-4 text-cyan-400 group-hover:animate-spin" />
              <Mic className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-bold hidden sm:inline-block">VOICE ASSISTANT</span>
            </>
          )}
        </button>

        {/* Expand / Collapse Info HUD Button */}
        <button
          id="voice-hud-expand-btn"
          onClick={() => {
            sound.playClick();
            setIsExpanded(!isExpanded);
          }}
          title={isExpanded ? 'Minimize Voice HUD' : 'Expand Voice HUD'}
          className="p-2 rounded-full bg-slate-950/90 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-300 transition-all cursor-pointer shadow-md"
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        {/* Last Action Notification Badge */}
        {lastAction && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[11px] font-mono shadow-md animate-in fade-in duration-200">
            <Compass className="w-3.5 h-3.5 animate-spin" />
            <span>ACTION: {lastAction.toUpperCase()}</span>
          </div>
        )}
      </div>
    </div>
  );
};
